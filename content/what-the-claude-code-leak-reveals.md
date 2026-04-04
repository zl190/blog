---
title: "What the Claude Code Source Leak Reveals About Agent Infrastructure"
format: blog
status: published
published_date: 2026-04-04
created: 2026-04-04
tags: [AI, claude-code, agent-infrastructure, hooks, source-code-analysis]
topics:
  - AI
qc: passed
spec: "Analysis of what 512K lines of leaked Claude Code TypeScript reveal about the gap between safety infrastructure and quality infrastructure in production AI agents | practitioner who read the source and built on it | developers building AI agent systems"
---

# What the Claude Code Source Leak Reveals About Agent Infrastructure

Last week, 512K lines of Claude Code's TypeScript showed up in an npm package. The internet focused on the drama. I focused on the architecture.

The short version: three layers of safety infrastructure, zero layers of quality infrastructure. That asymmetry is more telling than anything else in the codebase.

---

## The Hooks System

The most immediately useful thing in the leak is the hooks protocol. The documentation at code.claude.com describes hooks, but in limited terms — enough to know they exist, not enough to build on them confidently. Reading through the source, I counted 31 lifecycle events across four types (command, prompt, agent, http).

The key events are:

- `PreToolUse` — fires before any tool executes
- `PostToolUse` — fires after completion, with the result
- `Stop` — fires when the agent decides to stop
- `TaskCompleted` — fires when a task finishes
- `PreCompact` — fires before context compression
- `SessionStart` — fires when a session begins

The protocol is simple. Claude Code writes a JSON object to your hook's stdin:

```json
{
  "session_id": "abc123",
  "transcript_path": "/path/to/transcript.jsonl",
  "tool_name": "Write",
  "tool_input": { "file_path": "...", "content": "..." }
}
```

Exit 0 to allow. Exit 2 to block — and anything you write to stderr gets fed back to the model as context. That feedback loop is the lever. The model doesn't just get blocked; it gets an explanation it can reason about.

I had been building hooks on partial documentation and educated guesses about what the stdin payload contained. When I read the actual source, I had gotten some fields right and invented others that didn't exist. The `transcript_path` field was the surprise — you get a path to the full JSONL transcript right there in PreToolUse. That means a quality gate can read everything the model has done and said in the current session before deciding whether to allow the next tool call.

That changes what's possible. Before I thought hooks were input interceptors. They're actually full session observers.

---

## Three Layers for Safety

The permission system is where the engineering investment shows. It runs three distinct layers.

**Static layer**: feature flags, deny rules, file protection patterns. These are evaluated before any model call. If a path matches a protected glob, the action never reaches the model for consideration.

**Dynamic layer**: risk classification. Every potential action is scored LOW, MEDIUM, or HIGH before execution. The classification logic is explicit in the source — file writes in the project tree are lower risk than writes outside it; shell commands are scored on a combination of the command name and argument patterns.

**ML layer**: the codebase calls it the "YOLO classifier." A fast model auto-approves actions it has classified as low-risk, avoiding the latency of asking the user for every trivial file read. It's a confidence-based auto-approval loop: below a risk threshold, no human in the loop.

Shamsujjoha et al. (2024) described exactly this architecture in the abstract — a "Swiss cheese model" for AI safety, where multiple independent layers each catch failure modes that slip through the others [arXiv:2408.02205]. What's notable is that Claude Code implements this not as a research exercise but as shipped production infrastructure. The layers are real, they run in sequence, and they have distinct failure modes.

This is mature safety engineering. Parasuraman, Sheridan, and Wickens (2000) established the theoretical basis for multi-level automation decades ago — the idea that different oversight mechanisms should operate at different levels of abstraction [DOI:10.1109/3468.844354]. The permission system is this applied to AI tools: static rules catch the obvious cases, dynamic classification handles context-sensitivity, and the ML classifier handles throughput at scale.

---

## Zero Layers for Quality

Here's the asymmetry. Every component in the permission system answers the same question: *Is this action safe to execute?* None of them ask: *Is this output actually correct?*

There is no gate that reads the model's diagnosis and checks whether it explains a root cause. No gate that verifies the code the model wrote will actually run. No gate that confirms citations in a written artifact exist. The hooks are all there — `PostToolUse` fires after every tool, `Stop` fires at the end of every session — but the quality evaluation logic is not.

This is not an oversight. It reflects a real engineering asymmetry: safety failures are binary and attributable (the model deleted a file it shouldn't have), while quality failures are probabilistic and semantic (the model's diagnosis was plausible but wrong). Safety is easier to gate because you can specify the constraint in advance. Quality requires an evaluator that can judge whether the output meets an intent.

The surveys on production LLM agents don't give encouraging numbers here. Wang et al.'s 2024 survey of LLM-based autonomous agents found that evaluation methodology is consistently the weakest part of deployed systems [DOI:10.1007/s11704-024-40231-1]. Benchmark performance exists, but from what I've seen building on these systems, runtime quality enforcement in production largely doesn't. The safety infrastructure is where the engineering effort went because it's where the liability is.

DSPy [arXiv:2310.03714] framed the quality problem as an optimization target: a harness that is compiled against a metric can improve systematically, rather than drifting based on whoever last edited the prompts. TextGrad [arXiv:2406.07496] went further — showing that you can backpropagate textual critiques through a computation graph and update variables upstream. Both papers are pointing at the same gap Claude Code's source makes visible: the model's outputs need an evaluation layer that feeds back into its behavior, not just a permission layer that controls what it's allowed to do.

---

## KAIROS

The codename for Claude Code's always-on persistent mode is KAIROS. From what I read in the source, the `autoDream` system runs in the background across sessions and phases through: Orient → Gather Signal → Consolidate → Prune/Index.

The trigger condition, based on the code paths I traced: at least 24 hours since last consolidation, and at least 5 sessions accumulated. When both conditions are met, KAIROS runs a consolidation pass — reading across session transcripts and synthesizing them into a persistent memory store.

I read this and thought: that's a diary, not a quality system. The consolidation is about retention and compression — what gets kept, what gets pruned, what gets indexed for retrieval. There is no evaluation step that asks whether the things being consolidated were actually good work. A session where I misdiagnosed a bug and spent three hours going in circles gets consolidated into persistent memory on the same terms as a session where everything worked cleanly.

This is not a criticism of the design as much as an observation about what it was designed to do. Persistent memory across sessions is valuable. But accumulation and quality are different problems, and solving one doesn't address the other.

---

## Anti-Distillation

One mechanism I hadn't seen documented anywhere: `anti_distillation: ['fake_tools']` in the API request headers.

The source shows that Claude Code injects decoy tool definitions into requests when this flag is set. The purpose, based on the surrounding code, is to poison attempts to extract training data from the model's behavior — if someone is running inference in bulk to reconstruct Anthropic's tool schemas, the decoys corrupt the extracted dataset.

This is a straightforward adversarial defense. The interesting thing is that it exists at all — it shows the threat model includes adversarial extraction of production tool configurations, not just model misuse. The system is reasoning about what an adversary could learn by watching it work.

---

## What I Built on It

After reading the hooks source, I rewrote my enforcement hooks from scratch. The `transcript_path` field changed the architecture entirely — instead of hooks that only see the current tool call, I could build hooks that read the full session context before making a decision.

The concrete changes:

A `Stop` hook now reads the last 20 messages from the transcript and extracts any `[Diagnosis]` tags — my convention for requiring a written diagnosis before code edits. If a Stop is triggered and there are recent file writes but no diagnosis tag in the preceding context, the hook exits 2 with a message that tells the model it needs to write the diagnosis before finishing. It gets unblocked on the next Stop.

A `TaskCompleted` hook does a similar pass, checking whether the task output actually addresses the stated objective — using a fast model call on the transcript to score completion quality. It's not perfect, but it's the first time I've had any programmatic check on whether the session ended with something useful or just ended.

The full implementation is at [github.com/zl190/agent-gates](https://github.com/zl190/agent-gates). The key insight from the source was that hooks are not just interceptors — they are session observers with access to everything the model has done. That's enough to implement a real quality gate, even if Claude Code itself doesn't ship one.

---

## The Gap

The source leak revealed a system that is seriously engineered in one dimension and entirely unengineered in another. The safety infrastructure — three layers, explicit risk scoring, ML-based auto-approval — is production-grade. It reflects years of iteration on what it means to prevent harmful actions.

The quality infrastructure is the hooks protocol and an empty callback list.

The tools to fix this are already there. The `Stop` and `TaskCompleted` hooks exist precisely for session-end gates. The `transcript_path` field gives you everything you need to evaluate what happened. What's missing is not infrastructure but the convention and the courage to define what "good output" means for your specific use case, and then enforce it programmatically.

That's the work the leak is pointing at.

---

## References

1. Parasuraman, R., Sheridan, T.B., & Wickens, C.D. (2000). A model for types and levels of human interaction with automation. *IEEE Transactions on Systems, Man, and Cybernetics - Part A*. [DOI:10.1109/3468.844354]

2. Khattab, O., Singhvi, A., et al. (2023). DSPy: Compiling Declarative Language Model Calls into Self-Improving Pipelines. *arXiv:2310.03714*

3. Yuksekgonul, M., Bianchi, F., et al. (2024). TextGrad: Automatic "Differentiation" via Text. *arXiv:2406.07496*

4. Wang, L., Ma, C., et al. (2024). A survey on large language model based autonomous agents. *Frontiers of Computer Science*. [DOI:10.1007/s11704-024-40231-1]

5. Shamsujjoha, M., Lu, Q., Zhao, D., & Zhu, L. (2024). Swiss Cheese Model for AI Safety: A Taxonomy and Reference Architecture for Multi-Layered Guardrails of Foundation Model Based Agents. *arXiv:2408.02205*

6. Anthropic. Claude Code Hooks Documentation. code.claude.com/docs/en/hooks

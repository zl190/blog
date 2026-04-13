---
title: "Beyond Execution: What a Cognitive Harness Looks Like"
created: 2026-04-14
date: 2026-04-14
tags: [AI, claude-code, agent-harness, ECC, cognitive-constraints, hooks]
topics:
  - AI
qc: passed
spec: "ECC optimizes execution (181 skills, 47 agents, eval-driven dev). Missing dimension: cognitive constraints — diagnosis enforcement, decision auditability, anti-sycophancy. Proposes K as 7th dimension to H=(E,T,C,S,L,V) | creator — read ECC source code, built competing harness for 10 months | AI developers building agent systems"
---

# Beyond Execution: What a Cognitive Harness Looks Like

ECC has 181 skills, 47 agents, and ~154,000 GitHub stars. I've been building my own Claude Code harness for ten months. After reading ECC's source code closely, I found something I didn't expect: the biggest gap isn't in what it does — it's in what it doesn't ask. ECC optimizes *how* agents execute. It never asks *why* they decided to execute that way.

ECC is excellent, and I'll explain exactly what it gets right. But the gap is real, and filling it requires adding a dimension to how we think about harnesses.

---

## The Execution Stack Is (Mostly) Solved

The LLM-Agent-Harness Survey [Wang et al., 2024] gives us a framework: H = (E, T, C, S, L, V). Six dimensions — environment, tools, computation, strategy, learning, and verification. Production harnesses that score well across all six look roughly like this: they wrap the agent in tools, give it memory, evaluate its outputs, and tune based on results.

ECC hits that mark. Its `.agents/` layer provides shared infrastructure across Claude Code, Cursor, and Windsurf — portability that most custom harnesses don't bother with. Its eval-harness skill formalizes eval-driven development: define success criteria before coding, run pass@k metrics continuously, track regressions. The continuous-learning-v2 skill captures every tool call via hooks and distills observations into atomic "instincts":

```yaml
---
id: prefer-functional-style
trigger: "when writing new functions"
confidence: 0.7
domain: "code-style"
source: "session-observation"
scope: project
---
```

This is genuinely good engineering. An instinct isn't just memory — it's a weighted behavior with a confidence score that decays when you correct it and strengthens when you don't. The observation pipeline runs at the hook level, not the skill level, which means it fires 100% of the time. As the ECC continuous-learning-v2 docs note: "v1 relied on skills to observe. Skills are probabilistic — they fire 50-80% of the time based on Claude's judgment." Hooks don't have that problem.

So: execution stack, largely solved. Tools, skills, eval, continuous learning, portability. What's left?

---

## Three Things ECC Gets Right That Most People Miss

**Instinct-based learning is architecturally right.** The observe → detect → instinct → evolve → skill pipeline separates concerns correctly. Observations are raw data. Instincts are distilled patterns. Skills are codified procedures. Most people conflate these layers — they write skills before they've observed enough to know what patterns actually recur. ECC builds the observation infrastructure first.

**Strategic compact is a real insight.** Most people treat `/compact` as a panic button — hit it when you're about to run out of context. ECC's framing is different: compact at phase boundaries, not at context limits. Compact after research, before implementation. Compact after a debug cycle, before starting a new feature. The idea is that context compression works better when you're at a natural seam. This is navigator thinking, not rescue thinking.

**Multi-tool portability is underrated.** The `.agents/` layer being shared across Claude Code, Cursor, and Windsurf matters more than it looks. Your harness investment isn't locked to one vendor. When a better tool comes out, you port the adapter, not the whole system. Nobody talks about this — they're too busy fighting over which AI tool is better right now.

---

## The Missing Dimension

Here's the incident that made me realize something was wrong with my own setup.

Session 9, March 2026. I was debugging a SwiftUI transcription pipeline. The symptom was clear — live preview wasn't updating — but the root cause wasn't. Over the course of the session, I made seven sequential patches:

- Patch 1: Force `@Published` update
- Patch 2: Switch to `DispatchQueue.main.async`
- Patch 3: Move state to parent view
- Patch 4: Add `objectWillChange.send()`
- Patch 5: Refactor to use `@StateObject` instead of `@ObservedObject`
- Patch 6: Add explicit `id` modifier
- Patch 7: Rewrite the binding chain

None of them worked. After the seventh patch, the context was polluted with seven conflicting hypotheses, the original code was gone, and I had no idea what I'd actually changed. I graded the session afterward: D-. Not because the problem was hard — it wasn't — but because I had never written a diagnosis. I was patching without knowing what was broken.

The same agent that runs ECC's eval pipeline and learns instincts across sessions had no constraint preventing this. It couldn't. ECC's V dimension (verification) measures outcomes: did the eval pass? Did the code work? It has no mechanism for asking: did the reasoning process that led to this patch make sense?

That's the gap. And it's structural.

---

## What a Cognitive Constraint Looks Like

I built `diagnosis-enforce.sh` as a PreToolUse hook. It's 49 lines. When the UserPromptSubmit hook detects fix/debug intent, it sets a flag. The PreToolUse hook checks that flag before any `Edit` call:

```bash
#!/usr/bin/env bash
# diagnosis-enforce.sh — PreToolUse:Edit hook
# Block Edit until [Diagnosis] marker exists.

FLAG="/tmp/cc-preflight-flags.json"
MARKER="/tmp/cc-diagnosis-written"

[[ ! -f "$FLAG" ]] && exit 0

DIAG_REQ=$(jq -r '.diagnosis_required // false' "$FLAG" 2>/dev/null)
[[ "$DIAG_REQ" != "true" ]] && exit 0
[[ -f "$MARKER" ]] && exit 0

# Inject warning (not block — exit 0 with additionalContext)
jq -cn '{
  hookSpecificOutput: {
    hookEventName: "PreToolUse",
    additionalContext: "[ENFORCEMENT:diagnosis] You are editing without writing [Diagnosis] first. Write [Diagnosis] The problem is ___, because ___ [evidence: ___] BEFORE making edits."
  }
}'
```

The hook uses `additionalContext` injection rather than a hard block (exit 2) to avoid breaking flow on false positives. But the message is inserted into the model's context before the Edit executes. In my logs, this fires consistently when the agent tries to patch without diagnosing.

That's enforcement. But enforcement alone doesn't give you auditability.

For auditability, I use a tagging convention. Any non-trivial decision, diagnosis, or insight gets tagged inline:

```
[Diagnosis] The problem is ___, because ___ [evidence: ___]
[Decision] <what was decided> because <why>
[Insight] <what was learned> → <destination file>
```

A `decision-logger.sh` PostToolUse hook scans tool results for these tags and appends them to `/tmp/cc-handoff-decisions.md`. At session end, `handoff-brief-generator.py` merges this file into the handoff YAML automatically. The agent's reasoning trail becomes an auditable artifact — something you can read after the session ends and understand not just what happened, but why each step was taken.

My `enforcement.jsonl` has 4,166 lines across sessions. My `hook-fires.jsonl` has 64,299 lines. More importantly, I can open any session's handoff YAML and trace the decision chain that led to the final state.

ECC's instinct system can't do this. An instinct captures *what the agent did*. The decision log captures *why the agent thought that was right*. The first is behavior refinement. The second is reasoning accountability.

---

## The Anti-Sycophancy Problem

There's a failure mode that doesn't show up in evals at all.

An agent that's trained to be helpful will, under pressure, reverse positions. You push back. The agent says "you're right, let me reconsider." But nothing new was presented — just repetition of the original objection. This produces agents that appear to reason but are actually just socially agreeable.

I added an explicit protocol to my harness:

> **Change-of-mind protocol (mandatory before reversing position):**
> 1. Restate your original reasoning
> 2. Identify what specific new evidence the user provided
> 3. No new evidence → maintain position, explain why
> 4. New evidence → update proportionally, state what changed

This isn't enforceable by a hook — it's a constraint in CLAUDE.md. Sycophancy in LLMs is a documented phenomenon [Sharma et al., 2023] — models trained on RLHF systematically favor the user's stated position over their own prior reasoning. But having the protocol written down changes the dynamics. The agent is instructed to quote its prior work before reversing. "Repetition is not evidence" is in the system prompt.

ECC doesn't have this. Neither does any harness framework I know of. It's not a gap in tools or skills. It's a gap in reasoning governance.

---

## Session Continuity: The Infrastructure Gap

ECC's continuous learning captures behavioral patterns across sessions. But it doesn't transfer state.

There's a difference between "I've learned that this user prefers functional style" and "when I left off last session, we were in the middle of debugging the streaming buffer, the leading hypothesis was X, and three tasks were still open." The first is a learned preference. The second is working memory.

My harness has a full handoff pipeline:

- `precompact-save.sh` (PreCompact hook): captures token usage, enforcement counts, active agents, open tasks before compression
- `strategic-compact-suggest.sh` (PreToolUse hook): counts tool calls, detects phase via read/write/bash ratios, suggests compact at boundaries

The strategic compact hook is worth seeing:

```bash
# Phase heuristic
if [ "$RECENT_READS" -gt "$RECENT_WRITES" ] && [ "$RECENT_WRITES" -lt 5 ]; then
  PHASE="research/exploration"
  SUGGEST="yes — research context is bulky, distill before next phase"
elif [ "$RECENT_WRITES" -gt 10 ]; then
  PHASE="active implementation"
  SUGGEST="maybe — only if switching focus, NOT mid-implementation"
elif [ "$RECENT_BASH" -gt "$RECENT_WRITES" ]; then
  PHASE="testing/debugging"
  SUGGEST="yes if debug is done — clear traces before next task"
fi
```

Navigator logic, not panic logic.

The handoff gate (`handoff-gate.sh`) enforces before session end: next_steps must be populated, decisions must have evidence fields, `user_decisions_verbatim` can't be empty, open git changes must be logged. A session that ends without this passes nothing forward. The next session starts cold.

This is where ECC's instinct architecture has a real limitation. It learns *patterns*, not *state*. Patterns generalize. State is specific to a moment in a project. Both matter.

---

## The 7th Dimension

The LLM-Agent-Harness Survey framework is H = (E, T, C, S, L, V). My proposal: add **K** for Cognitive Constraints.

H = (E, T, C, S, L, V, **K**)

K is not the same as V. Verification measures whether the output is correct. Cognitive constraints govern the reasoning process that produced the output. You can have correct output from wrong reasoning. You can have a passing eval from a process that would fail on any novel input. K and V are orthogonal.

Here's how my implementation compares to ECC across all seven dimensions:

| Dimension | What It Covers | ECC | Our Harness |
|-----------|---------------|-----|-------------|
| **E** — Environment | Workspace, file access, OS integration | `.agents/` multi-tool adapter layer | CLAUDE.md + project rules, same CWD awareness |
| **T** — Tools | Skills, commands, tool inventory | 181 skills, 47 agents, slash commands | ~30 scripts, ~8 skills; narrower but deeper |
| **C** — Computation | Context management, background processing | Strategic compact framing, background Haiku observer | PreCompact save + strategic-compact-suggest.sh |
| **S** — Strategy | Planning, mode routing, delegation patterns | Task decomposition, agent routing | Mode Router (Task/Brainstorm/Expert/Push), Fractal Delegation |
| **L** — Learning | Cross-session pattern capture | Continuous-learning-v2: instinct pipeline, confidence scoring | instinct-observer.sh (ECC architecture, our implementation) |
| **V** — Verification | Eval-driven development, pass@k metrics | eval-harness skill, formal EDD | Per-session enforcement.jsonl, hook-fires.jsonl, handoff gate |
| **K** — Cognitive Constraints | Reasoning governance, audit trails, bias mitigation | **Not implemented** | diagnosis-enforce.sh, decision-logger.sh, anti-sycophancy protocol, L1-L3 justification chain |

The K column is the whole point. ECC is strong on T, L, and V. My harness is weaker on T (fewer skills) and comparable on the rest. But only one of them has a mechanism for asking: before this Edit was made, was the reasoning behind it sound?

---

## What K Actually Requires

**Diagnosis enforcement.** A hook that blocks or warns before edits during fix/debug tasks. Forces the agent to write a diagnosis card — `[Diagnosis] The problem is ___, because ___ [evidence: ___]` — before touching code. This prevents the "patch without understanding" pattern.

**Justification chain.** A reasoning framework embedded in the system prompt: Target → Known Facts → Claims → Warrant → Warrant Gap. Three levels: L1 (universal, in global CLAUDE.md), L2 (domain-specific, in research-methodology.md or development-methodology.md), L3 (project-specific, in project CLAUDE.md). Every action is a claim. Every claim needs a warrant. Warrant gaps trigger specific responses: hedge in research, hypothesize and test in development.

**Decision auditability.** Inline tagging (`[Decision]`, `[Diagnosis]`, `[Insight]`) combined with PostToolUse hooks that extract and persist these tags. Not just logs — structured artifacts that can be read across sessions to understand what the agent decided and why.

**Anti-sycophancy protocol.** A written constraint requiring the agent to restate its original position and identify specific new evidence before reversing. Repetition from the user is not evidence. This one has no hook enforcement — it's CLAUDE.md — but having it explicit changes behavior.

**Process quality gates.** The handoff gate is the clearest example. Before a session ends, a gate fires and checks: are next steps defined? Do decisions have evidence fields? Are open tasks captured? A session that doesn't pass the gate passes nothing forward.

None of these are exotic. They're constraints. The execution stack doesn't have constraints on reasoning — it has constraints on outputs. K is about constraining the process.

---

## The Honest Limitations

My harness is not a product. It's a personal system that took ten months and is still evolving. Several things in ECC work better than my equivalents:

ECC's instinct confidence scoring is more sophisticated than my `[Decision]` tags. A confidence score that decays over time based on corrections captures something my tags don't: the reliability of a pattern under changing conditions.

ECC's eval-harness skill formalizes pass@k metrics in a way I haven't. My enforcement.jsonl tracks hook verdicts, but I don't have the structured pass@1/pass@3 reporting that EDD requires for serious regression tracking.

ECC's multi-tool portability is real. My scripts are Claude Code-specific. If I switch to Windsurf, I start over.

The gaps cut both ways. But the K gap is fundamental: no amount of pass@k measurement tells you whether the reasoning behind each attempt was sound. That requires a different kind of instrument.

---

## Takeaway

The agent harness that wins isn't the one with the most skills. It's the one whose decisions you can audit after the session ends.

ECC is the best execution harness I know of. But execution without reasoning constraints produces agents that are fast, capable, and opaque. Seven patches, no diagnosis, a Grade D- session — that failure mode doesn't show up in any eval. It shows up in the reasoning log, if you have one.

The sixth dimension in the harness survey is verification. I'm proposing a seventh: cognitive constraints. K isn't about measuring outputs. It's about governing the process that produces them.

---

*References:*

- Wang, L., et al. (2024). A Survey on Large Language Model based Autonomous Agents. *Frontiers of Computer Science*, 18(6). https://doi.org/10.1007/s11704-024-40231-1
- Xi, Z., et al. (2023). The Rise and Potential of Large Language Model Based Agents: A Survey. arXiv:2309.07864
- Yao, S., et al. (2023). ReAct: Synergizing Reasoning and Acting in Language Models. *ICLR 2023*. arXiv:2210.03629
- Shinn, N., et al. (2023). Reflexion: Language Agents with Verbal Reinforcement Learning. arXiv:2303.11366
- Park, J.S., et al. (2023). Generative Agents: Interactive Simulacra of Human Behavior. *UIST 2023*. arXiv:2304.03442
- Sharma, M., et al. (2023). Towards Understanding Sycophancy in Language Models. arXiv:2310.13548
- ECC — everything-claude-code (affaan-m/everything-claude-code, 154K+ stars, 2024–2026). Continuous-learning-v2 SKILL.md, eval-harness SKILL.md.
- LLM-Agent-Harness-Survey: H=(E,T,C,S,L,V) framework for evaluating agent harness architectures.

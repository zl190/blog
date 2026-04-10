---
title: "Do Hooks Actually Change Model Behavior? An Ablation Study"
created: 2026-04-10
date: 2026-04-10
tags: [agent-infrastructure, hooks, ablation, enforcement, context-engineering]
topics:
  - AI
  - agent-infrastructure
qc: passed
spec: "12 agent runs testing 6 enforcement hooks — 83% showed behavioral divergence, hooks change process not outcome"
---

# Do Hooks Actually Change Model Behavior? An Ablation Study

I built six enforcement layers for my AI coding agent. Diagnosis gates, delegation routers, test-before-commit checks, skill pipelines. Dozens of hours across twenty-something sessions. Then a simple question nagged me: do any of them actually do anything?

Not whether the hooks *fire*. I know they fire — I can see the injected text in the conversation. The question is whether the model would have done the same thing without the injection. Maybe Claude already "knows" it should diagnose before fixing. Maybe the hooks are expensive theater.

So I ran the experiment.

---

## The Problem Hooks Are Supposed to Solve

System prompts degrade. This is not a vague complaint — it is a documented phenomenon with known mechanisms. Liu et al. (2023) showed that LLMs recall information at the beginning and end of context far better than the middle, a pattern they call the "lost in the middle" effect. Laban et al. (2025) found a 39% performance drop in multi-turn versus single-turn settings. An et al. (2024) demonstrated the same pattern and proposed information-aware training to counteract it.

The practical consequence for agent builders: instructions you write in a system prompt get followed reliably at turn 1 and unreliably at turn 30. The model "knows" your methodology. It read the rules. It will still skip them under pressure, because by turn 30 those rules sit in the middle of a context window bloated with tool results and conversation history, competing for attention against more recent, more salient tokens.

I've watched this happen. Session 15, a trivial `ZeroDivisionError`: the agent diagnosed it cleanly without any prompting, because the bug was obvious and the context was fresh. Session 22, a complex race condition across three files: the agent jumped straight to editing code, skipped diagnosis entirely, produced a fix that broke two other things. Same system prompt. Same model. Different context pressure.

Hooks are supposed to fix this. Instead of relying on the model to remember "diagnose before fixing" from a system prompt that's now 80K tokens away, a PreToolUse hook injects `[REQUIREMENT] Write a [Diagnosis] card before your first Edit` right before the model reaches for the edit tool. The reminder arrives at the point of action, not the point of instruction.

The theory is clean. But does the intervention actually change behavior?

---

## What I Built

My enforcement system uses Claude Code's four lifecycle hooks: UserPromptSubmit, PreToolUse, PostToolUse, and Stop. Each hook is a shell script that can inject text into the conversation or block tool calls entirely.

Six hooks went under the microscope:

1. **Pre-flight diagnosis** — injects a diagnosis requirement before the first Edit tool call during bug fixes
2. **Pre-flight planning** — injects a planning requirement before complex builds
3. **Pre-flight test** — blocks commit tool calls unless tests pass, demands test evidence
4. **Skill router** — intercepts blog-writing requests and redirects to a 13-step publishing pipeline
5. **Between-turn diagnosis** — reinforces the diagnosis requirement between conversational turns during debugging
6. **Delegation router** — injects agent-routing guidance when the task scope exceeds single-agent capacity

These are not system prompt instructions. They are runtime injections that fire at specific lifecycle moments — the difference between posting a speed limit sign at the highway entrance and flashing it on a dashboard display when the driver's foot hits the accelerator.

---

## The Experiment

12 agent runs. 6 scenarios. Each scenario runs twice: Agent A gets the hook injection, Agent B gets the identical task with no injection. Both use Claude Sonnet. Both get the same system prompt minus the hook infrastructure. The only variable is whether the hook text appears in context at the critical moment.

I scored each pair on a binary: did behavior diverge or not? Not "was one better" — just "did they do something observably different?"

### Results

| # | Hook Layer | What It Tests | A (hook) | B (no hook) | Diverged? |
|---|------------|--------------|----------|-------------|-----------|
| 1 | pre-flight:diagnosis | Bug fix — wrote [Diagnosis] before first Edit? | Explicit diagnosis with format tag | Identified bug informally, jumped to fix | **YES** |
| 2 | pre-flight:plan | Build from scratch — planned before coding? | Structured plan first | Also planned naturally | **NO** |
| 3 | pre-flight:test | Commit request — demanded tests first? | Actively refused to commit | Noted bug passively, ready to proceed | **YES** |
| 4 | skill-router | Blog writing — used /publish pipeline? | 13-step pipeline execution | 2 tool calls, wrote inline | **YES** |
| 5 | between-turn:diagnosis | Complex bug — formal diagnosis before fix? | Formal [Diagnosis] with evidence tags | Correct analysis, no formal tag | **YES** |
| 6 | delegation | Large task — considered delegation? | Explicit routing decision | Started implementing immediately | **YES** |

**5 out of 6 diverged. 83% divergence rate.**

One null result: planning. Both agents planned before building, hook or not. I'll come back to why.

---

## What the Numbers Actually Say

### The strongest signal: skill routing (S4)

This was the widest behavioral gap. Agent A (hooked) executed a 13-step publishing pipeline — loading skill files, running QC gates, spawning review agents. 13 tool uses. Agent B wrote the blog post inline with 2 tool calls.

Same task. Same model. The hook didn't improve Agent B's output quality in any obvious way — both produced reasonable blog posts. But the *process* was unrecognizable. Agent A ran a pipeline. Agent B freestyled.

This matters because process is where quality compounds. One blog post, either approach works. Fifty blog posts, the pipeline catches the errors that freestyle misses on post #37.

### The sharpest signal: test gate (S3)

Agent A said: "I am not proceeding with the commit." Hard stop. The hook injected a test requirement, and the model treated it as a blocking constraint.

Agent B said the bug was "worth noting before committing." Passive. Observational. It saw the same problem but framed it as a suggestion rather than a gate. It was ready to proceed if the user pushed.

The difference is not knowledge — both agents identified the issue. The difference is *authority*. The hook gave Agent A permission to refuse. Without it, Agent B defaulted to compliance.

### The consistent signal: diagnosis formatting (S1 and S5)

Both diagnosis scenarios showed the same pattern. Hooked agents wrote `[Diagnosis] The problem is X, because Y [evidence: Z]`. Unhooked agents wrote narrative paragraphs that contained the same analysis but without structure.

Is this just formatting? No. The tag is a commitment device. Writing `[Diagnosis]` before your fix means you have stated your hypothesis explicitly, which means you can check it explicitly, which means you can catch yourself when the fix doesn't match the diagnosis. Narrative analysis buries the hypothesis in prose where it's harder to audit.

### The null result: planning (S2)

Both agents planned before building. The hook made no difference.

My interpretation: planning for complex build-from-scratch tasks is already a strong default behavior in the model. Claude Sonnet reliably breaks down multi-file implementations into steps before coding, with or without a prompt. The hook is redundant — it enforces something the model already does.

This is useful information. It means I can remove the planning hook without behavioral cost, simplifying my infrastructure. Not every methodology guard needs mechanical enforcement.

---

## Why Hooks Work: Choice Architecture for Language Models

Thaler and Sunstein (2008) introduced the concept of *choice architecture* — the idea that how options are presented systematically influences which option people choose, even when the available choices remain identical. A cafeteria that puts salad before fries doesn't restrict choice. It changes the default. Organ donation rates differ by an order of magnitude between opt-in and opt-out countries — same choice, different architecture.

Hooks are choice architecture for language models.

The model's "default" at any given turn is shaped by what's salient in context. In a fresh session with a short system prompt, the methodology instructions are salient — they're recent, prominent, not buried. By turn 30, they're competing with 50K tokens of tool results, error messages, and conversation history. The default drifts.

A hook re-establishes salience at the point of action. It doesn't add new information — the model already "knows" it should diagnose before fixing. It repositions existing information to the moment it matters.

Li et al. (2024) studied instruction-following robustness under prompt injection and found that LLMs are sensitive to where instructions appear relative to other content in the context window. Their finding supports the mechanism: position matters, not just content. A hook that injects a reminder at the decision point is exploiting the same positional sensitivity that causes degradation — but in reverse, as a corrective.

This reframes what hooks are for. They are not teaching the model new things. They are compensating for the structural property that instructions lose salience as context grows. The model's "knowledge" doesn't degrade. Its *attention to that knowledge* does.

---

## What Hooks Don't Do

I want to be precise about the limits. Hooks changed *process* in 5 of 6 scenarios. They did not clearly change *outcome* in most of them.

Agent B in S1 (no diagnosis hook) still found the bug. It just didn't write a formal diagnosis card first. Agent B in S6 (no delegation hook) still made progress on the task. It just didn't consider whether to delegate.

For a single run, this often doesn't matter. The model is capable enough to muddle through without process discipline. The cost shows up over many runs — the session where the informal diagnosis was wrong and nobody caught it because there was no explicit hypothesis to check, the session where the un-delegated task hit context limits at turn 40 and lost coherence.

Hooks are insurance, not intelligence. They don't make the model smarter. They make the model's existing intelligence more reliably applied.

---

## Prior Art and the Null Baseline

Before this experiment, I ran a simpler test in Session 15: a trivial `ZeroDivisionError` bug fix, with and without the diagnosis hook. Both agents diagnosed it identically. Zero divergence.

That null result almost convinced me hooks were theater. The ablation above shows why: trivial tasks are the wrong test. The model's defaults are strong enough for easy problems. Hooks earn their keep on hard problems — complex bugs, multi-step workflows, high-stakes decisions — where the gap between "I know I should" and "I actually did" widens under cognitive (context) pressure.

This parallels what we know about human nudges. Thaler and Sunstein (2008) note that defaults matter most when decisions are complex, infrequent, or lack immediate feedback. Simple decisions with clear consequences don't need nudging. The same selection pressure applies to language models: simple tasks don't need hooks, complex ones do.

---

## Practical Takeaways

**If you're building agent enforcement:** test your hooks with ablation, not just observation. I was wrong about which hooks mattered — I would have predicted planning enforcement was critical, and it turned out to be the one null result.

**If you're deciding where to invest:** hooks that redirect execution paths (skill routing, delegation) show the strongest effects. Hooks that enforce formatting (diagnosis tags) show consistent but narrower effects. Hooks that enforce already-strong defaults (planning) show no effect.

**If you're skeptical:** you should be. N=12 is not a controlled study. I scored divergence subjectively. The model version matters — a future Sonnet might plan less reliably or diagnose more reliably, changing which hooks are redundant. This is a practitioner's field test, not a paper.

But 83% divergence across 6 scenarios is hard to dismiss as noise. Hooks change behavior. The question is which hooks, for which tasks, at what cost. That question requires exactly this kind of ablation — and I suspect most agent builders have never run one.

---

## References

- An, S., Chen, W., Lin, Z., Lou, J.-G., Ma, Z., & Zheng, N. (2024). "Make Your LLM Fully Utilize the Context." *Advances in Neural Information Processing Systems 37.* doi:10.52202/079017-1986
- Claude Code, Anthropic. Hooks system: UserPromptSubmit, PreToolUse, PostToolUse, Stop lifecycle events. https://docs.anthropic.com/en/docs/claude-code
- Laban, P. et al. (2025). "LLMs Get Lost in Multi-Turn Conversation." arXiv:2505.06120
- Li, Z., Peng, B., He, P., & Yan, X. (2024). "Evaluating the Instruction-Following Robustness of Large Language Models to Prompt Injection." *Proceedings of the 2024 Conference on Empirical Methods in Natural Language Processing.* doi:10.18653/v1/2024.emnlp-main.33
- Liu, N.F. et al. (2023). "Lost in the Middle: How Language Models Use Long Contexts." arXiv:2307.03172
- Thaler, R.H. & Sunstein, C.R. (2008). *Nudge: Improving Decisions about Health, Wealth, and Happiness.* Yale University Press.
- Primary empirical source: 12-run ablation study across 6 enforcement hook scenarios, conducted by the author using Claude Sonnet, April 2026.

---

*If you're building agent enforcement systems, I'd love to hear what you've found. Subscribe for the next issue — I'm running a larger ablation with deeper scenarios next.*

---
title: "After a Software Engineering Class: A Survey of Testing LLM Pipelines"
date: 2026-05-17
created: 2026-05-17
tags: [llm, testing, software-engineering, survey]
topics:
  - AI
spec: "Classical SE testing (CP, FSM, regression) maps onto LLM pipelines; framework-for-skills is over-scoped at current scale; the right unit is the ship-able artifact pipeline; trace + golden + pass^k judge is the right-sized solution. | first-person learner reporting back from a recent SE class | software engineers with classical testing background curious how it transfers to LLM workflows"
qc: passed
---

# After a Software Engineering Class: A Survey of Testing LLM Pipelines

I just finished a recent software engineering class. The testing module gave me clean vocabulary for things I had been doing badly without names: Category-Partition for input domain decomposition, finite-state machines for stateful workflow modeling, regression testing as a discipline rather than a habit. I sat down and asked: how much of this transfers to LLM-driven workflows?

Some of it did. Some of it broke. Some of it broke for interesting reasons. And the answer to the obvious next question, "should I build a Hypothesis-style framework for testing prompt-defined skills?", turned out to be no, but not for the reason I expected.

---

## What I mean by "ship-able LLM workflow"

The phrase matters because the test target shapes the entire methodology. By LLM workflow I mean a multi-phase pipeline that takes a user-facing input, runs through several prompted stages with tool calls and human-in-the-loop gates between them, and produces an artifact someone outside the loop will read or rely on. A research brief. A code review comment. A government grant draft. Not a chatbot reply.

The failure cost in these workflows is asymmetric and concentrated. Most pipeline runs produce something usable. The bad runs produce output that is confidently wrong, syntactically clean, and indistinguishable at a glance from a good run. This is the regime where testing matters most, because eyeballing the output is the failure mode being eliminated.

The classical testing curriculum was built for deterministic programs with crisp specifications. LLM pipelines are non-deterministic and the specification lives in prose. So the question isn't "does testing apply" but "which testing techniques survive translation, and at what cost?"

---

## What transfers

Three classical techniques transferred more cleanly than I expected.

### Category-Partition over prompt slots

The Category-Partition method, as Ostrand and Balcer originally framed it, decomposes a function's input domain into categories of behavior, partitions each category into equivalence classes, and assembles test frames by selecting one class per category. The output is a small, justified set of tests rather than an exhaustive enumeration. The structural assumption is that the function has typed inputs.

LLM prompts have typed inputs too, if you squint. A skill that drafts a research brief might take a topic string, an audience descriptor, a length target, and a citation density. Each of these is a slot. Each slot has natural categories. For the audience slot, an academic peer is a different category from a generalist reader, which is different from an internal teammate. Each category has equivalence classes; within "academic peer," statistician and ML engineer behave differently. Apply Category-Partition mechanically and you get a frame matrix: a small set of templated prompts that exercise the cross-product of one class per slot.

This is not a metaphor. It is the same technique, applied to a different kind of function. The frame matrix gives you the same property the classical method gives: a defensible answer to "did you actually exercise the input space, or did you just write the three prompts that came to mind?"

The limit is the natural-language slot itself. If one of your prompt slots is "describe the problem in your own words," Category-Partition collapses, because the slot has no typed structure. You can partition the structured slots and accept that the freeform slot is a separate, harder problem.

### Finite-state models for multi-phase pipelines

Model-based testing constructs a finite-state machine of the system under test, then generates test sequences that walk the state graph. Each transition is a tested behavior. Each unreachable state is a bug or a missing transition. For workflow-style systems with explicit phase boundaries, this is the right tool.

Skill-style LLM pipelines map onto this naturally. The pipeline I think of as canonical has phases: gather input, draft, fact-check, fix, render, verify. Between several pairs of phases there is a human-in-the-loop gate. The user approves, edits, or rejects. This is a finite-state machine: each phase is a state, each transition is conditional on the previous state's output or a gate decision, and the legal sequences are a subset of the full graph.

The test is whether the LLM stays on the graph. Does the fact-check phase ever skip ahead to render? Does the draft phase try to invoke the verify tool? The FSM in the test is what the skill author intends the pipeline to look like. The test's job is to catch the LLM deviating from its own declared graph. Hypothesis exposes this exactly through `RuleBasedStateMachine`, where you declare rules with preconditions and the runner explores sequences. The mental model is "the prose says Phase 3 requires Artifact X to exist; the test asserts the LLM never enters Phase 3 without that artifact."

### Regression as trace diff

The classical regression test is "input A produced output A' last release; assert it still does." For LLMs, the literal version fails because outputs are not stable across runs. The salvage move is to compare traces rather than final outputs.

A trace is the sequence of tool calls, intermediate prompts, and gate decisions the pipeline made on its way to the final artifact. Two traces for the same input on two prompt versions can be diffed structurally, looking at which tools were called, in what order, with what arguments, even if the final prose differs. The major observability platforms ([LangSmith, Langfuse, Braintrust](https://www.braintrust.dev/articles/deepeval-alternatives-2026), and [Arize Phoenix](https://github.com/Arize-ai/phoenix)) have converged on trace-as-primary-artifact for exactly this reason. The trace is what regresses; the output is what varies.

A golden trace is a curated, append-only set of input-trace pairs drawn from real incidents and edge cases. Every prompt change is a regression delta against this set. This is the discipline the regression chapter taught me, ported one-to-one to the LLM setting.

---

## What needs adaptation

Three classical assumptions broke and required substitution rather than translation.

### Determinism: replaced by pass^k

The classical test asserts a property holds. The LLM analog asserts a property holds across k independent runs of the same input. The cleanest formulation I have seen is the `pass^k` metric from [τ-bench](https://arxiv.org/abs/2406.12045) (Yao et al., 2024): run the scenario k times, report the rate at which all k succeed. This collapses reliability and correctness into a single number that does not lie about flakiness. A test that passes 9 times out of 10 is not a passing test; it is a 90%-reliable test, and `pass^k` makes you confront that.

The cost is direct: every test runs k times. Pick k=5 and your test suite is five times more expensive. There is no way around this. Non-determinism is the property under test, not a nuisance to be averaged away.

### Oracle: replaced by judge, with care

Classical testing assumes you can write a function that says "this output is correct." For prose, code review comments, and most ship-able artifacts, no such function exists. The accepted substitute is LLM-as-judge: a separate model with a rubric scores the output.

This works, with a caveat that took me a while to internalize. Judges are themselves non-deterministic. A single judge call on a borderline output is roughly a coin flip. The empirical result from the 2025 judging literature is that running the judge multiple times and aggregating with Mean, Median, or Majority correlates with human ratings substantially better than running it once with greedy decoding ([Yamauchi et al., 2025](https://arxiv.org/abs/2506.13639)). The judge has the same non-determinism as the system under test, and the same `pass^k` discipline applies. Except that now you pay for it twice, once for the system and once for the oracle.

The cost compounds and is the binding constraint on every design decision downstream.

### Shrinking: mostly intractable, sidestepped

When a Hypothesis test fails, the shrinker minimizes the counterexample. For a list of integers, this is well-defined. For a natural-language prompt, it is not. Shrinking by deleting tokens destroys grammaticality; shrinking by deleting characters destroys meaning; shrinking by semantic preservation requires the full pipeline you are trying to test. My read of the [ICSME 2025 metamorphic testing survey](https://arxiv.org/abs/2511.02108) is that token-level shrinking of natural-language inputs is essentially unsound: the survey's MR catalog assumes semantic-preservation transformations, not naive truncations.

The sidestep is to shrink the structured parameters, not the natural-language scaffold. If your prompt is a template with typed slots, the slots are shrinkable; the surrounding prose is fixed. This is what `hypothesis.strategies.text()` already does: it shrinks within a user-provided alphabet and regex. The lesson for LLM testing is to give up on minimizing freeform prompts and design test inputs as parameterized templates from the start.

---

## The field landscape

Mid-2026, the testing-LLM-workflows space is hot but lopsided. Most of the heat is concentrated in one subarea; the technique I almost reached for is in the sleepy one.

| Subarea | Status | Representative work |
|---|---|---|
| Example-based + LLM-as-judge | Hot, well-tooled, converged | DeepEval, Promptfoo, Inspect AI, LangSmith |
| Trajectory-level evaluation | Hot, recently converged | τ-bench, τ²-bench, Inspect's stateful tools |
| Metamorphic testing of LLM outputs | Active academic, light tooling | ICSME 2025 catalog, MeTMaP, Mortar |
| LLM-writes-PBT for normal code | Hot academic, no industrial deployment | Agentic PBT (Maaz et al., 2025) |
| PBT with stateful FSM, LLM as SUT | Sleepy. Effectively nobody | none |

The hot subarea has a recognizable shape. Curate a dataset. Run the pipeline against the dataset. Have an LLM judge with a rubric score each output. Diff traces for regression. Aggregate to a number. Tooling decisions are about ergonomics, not capability: [DeepEval](https://www.braintrust.dev/articles/deepeval-alternatives-2026), Promptfoo, [Inspect AI from UK AISI](https://inspect.aisi.org.uk/), LangSmith, Braintrust, Langfuse, Arize Phoenix. They all do roughly this stack with different opinions about gating, annotation UI, and trace storage. The money has moved here. [Promptfoo was acquired by OpenAI in March 2026](https://techcrunch.com/2026/03/09/openai-acquires-promptfoo-to-secure-its-ai-agents/) for integration into their agent platform, at a valuation of roughly $86M per PitchBook.

Metamorphic testing is the most interesting near-miss. The idea, to translate an input, paraphrase it, swap entities, and assert that the output relation holds, turns the oracle problem into a relation problem. The [ICSME 2025 metamorphic testing survey](https://arxiv.org/abs/2511.02108) catalogs many metamorphic relations covering roughly 560,000 test cases; "Mortar" extends it to multi-turn dialogue. There is also direct application of the technique to vector matching in RAG systems ([MeTMaP at FORGE 2024](https://dl.acm.org/doi/10.1145/3650105.3652297)). The technique is real and underused industrially. My read is that it is one tooling-effort away from becoming standard, but right now it lives mostly in academic papers; a few [LLM-driven mutation testing tools](https://www.jonbell.net/preprint/tse25-llmorpheus.pdf) like LLMorpheus apply the underlying mutation idea to test-suite evaluation, while the prompt-mutation analog is less standardized.

The property-based-with-stateful-FSM corner is where I spent several days convinced I had found a gap worth building into. There is published work on LLMs writing Hypothesis tests for regular Python code. Maaz, DeVoe, Hatfield-Dodds, and Carlini's ["Agentic Property-Based Testing" (2025)](https://arxiv.org/abs/2510.09907) found valid bugs in 56% of its reports across 100 Python packages. But the direction is reversed from what I wanted. That work uses an LLM to write PBTs for deterministic Python. Nobody has shipped the inverse: PBTs where the system under test is the prompt-defined skill, the strategies generate inputs and tool-result environments, and a `RuleBasedStateMachine` mirrors the phases of the skill's pipeline. The closest spiritual relative is τ-bench, which has a simulated user, a tool environment, and `pass^k` reliability. But it is a benchmark with hand-authored scenarios, not a generative test framework.

The gap was real. The question was whether building into it made sense at current scale. I assumed yes. I was wrong.

---

## The over-scope detour

For about a week, my draft plan was: write the library. Call it skill-hypothesis or similar. Strategies generate skill inputs and tool-result mocks. A subclass of `RuleBasedStateMachine` lets the skill author declare phases as states with preconditions and invariants. The runner explores sequences of phase transitions, shrinks the parameters of the slot-typed strategies when a property fails, and reports a minimal counterexample.

The theoretical fit is clean. Skills are programs whose source is prose. Prose-defined pipelines have implicit FSMs. PBT was designed exactly to find unanticipated state sequences. The classical-software-engineering instinct is to build the framework.

Then I asked: which of my skills would actually use it?

I had about thirty skills in my Claude Code setup. Maybe twenty of them are utility wrappers: convert this file format, look up that reference, run a small bash sequence. Their failure mode is "the wrapper didn't run" or "it returned the wrong file." A two-line check covers them. They do not need property-based testing. They do not need a framework. They need to be deleted when they are wrong and rewritten when the underlying tool changes.

The remaining ten or so produce externally-visible artifacts. A research brief. A government grant draft. A blog post like this one. These are the skills where failure is asymmetric, where a confidently-wrong brief is worse than no brief, and where I would actually want a test budget. But "ten" is the wrong number for framework investment. You build a framework when twenty teams have the same shape of test problem. At ten skills authored by one person, the right answer is not framework; it is checklist plus golden traces plus a judge.

The cost math made this concrete. Hypothesis runs about 100 examples per `@given` by default. At a conservative $0.05 per skill invocation, that is $5 per property. Add stateful exploration and `pass^k` re-runs and you are at $50 to $500 per CI run for a single skill. The skill-creator team at Anthropic [recommends starting with two to three test prompts](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md) for initial test case creation, expanding from there. The choice of "a few examples" rather than "hundreds of generated cases" is consistent with the cost economics of dense generative testing being 10x to 100x worse for LLM systems than for Python. The framework I almost built would have been technically interesting and economically indefensible.

The real question turned out not to be "is there a gap in the framework landscape" but "what is the cheapest test discipline that catches the failures I actually have."

---

## The reframe

The unit of test is the ship-able artifact pipeline, not the skill.

This is the reframe that did the work. Most skills are not the right unit because most skills do not produce something whose failure is externally visible. The skills that do, the ones whose output gets read by someone outside the loop, are the unit that warrants a test budget. For those, the failure modes are concentrated: wrong facts, missing voice constraints, structural drift from the declared pipeline, regression from a working version after a prompt edit.

The right-sized solution at my scale is three pieces:

1. **Trace markers.** Every phase of the pipeline emits a structured log line: phase entered, phase exited, gate decision, tool calls in this phase. The trace is the test artifact. About fifty lines of bash to emit, about thirty to parse. No framework.
2. **Golden traces.** A small, curated, append-only directory of input-trace pairs from real incidents. Three to five per ship-able skill. Each prompt change runs against this set and the trace diff is a regression check. The cost is the human time to curate, not the compute.
3. **`pass^k` judge.** For the assertions that cannot be checked by trace structure, such as whether the output meets the voice constraint, cites enough sources, and stays within length, run a `pass^k`-style judge call. Pick k=3 to k=5 depending on how borderline the case is, aggregate with median, treat the result as a single test outcome.

Total implementation: roughly two hundred lines of bash and a handful of YAML configs. No new framework. No new dependencies beyond the model API and the observability platform's trace export. The vast majority of the value the Hypothesis-style framework would have delivered comes from the trace structure, not from the strategy algebra. And the trace structure is something the observability platforms already give you.

---

## When the lighter solution stops working

I want to be honest about where this stops scaling, because the answer "checklist plus traces plus judge" is not eternal.

The lighter solution holds while four conditions are roughly true. First, the count of ship-able skills is small enough that a human can keep the golden trace set curated, say, under twenty. Second, the ship cadence is slow enough that regression cycles are weekly or monthly, not on every commit. Third, the failure cost is high but containable; a bad brief is embarrassing, not catastrophic. Fourth, the team is small enough that the implicit FSM of each pipeline lives in one author's head and is updated by hand when the prose changes.

Cross any of these and the calculus changes. Twenty ship-able skills with weekly prompt churn means the golden trace set goes stale faster than a human can re-curate. Continuous deployment of skill changes means trace regression checks need to run automatically, with structured strategies generating coverage rather than hand-curated examples. A team of ten authors means the implicit FSM in each pipeline is shared knowledge that needs to be encoded somewhere executable. Regulated output, whether medical, legal, or financial, turns the failure cost from embarrassment to liability, and the test budget per skill goes up by an order of magnitude.

When two or more of those conditions cross at once, the framework investment starts paying back. At that point, the right move is probably not to invent a new library but to extend the existing ones. Inspect AI has [stateful tools and a per-instance store](https://inspect.aisi.org.uk/agents.html) that could host a `RuleBasedStateMachine`-shaped extension. The metamorphic relation catalogs from [ICSME 2025](https://arxiv.org/abs/2511.02108) could be wired into a strategy library. The pieces are sitting there. The integration work would be a real engineering project; nobody has done it because nobody has crossed enough of the four conditions to justify it.

I have not crossed any of them yet. The two hundred lines of bash will outlive most of my opinions.

---

## Closing

Classical methods transfer more than people say. Frameworks are over-scoped more than people admit. And the unit of test should be the artifact that gets shipped, not the code that produces it.

The discussion question I am leaving open: if your pipeline produces externally-visible artifacts and you have not crossed the conditions where framework investment pays back, what is the smallest test discipline that would catch the failures you have actually had? My answer is trace markers, three to five golden traces, and a `pass^k` judge. I am curious whether anyone has tried something smaller and found it sufficient.

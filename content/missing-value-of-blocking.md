---
title: "The Missing Value of Blocking: Why Friction Is a Feature"
created: 2026-04-02
date: 2026-04-03
tags: [AI, agent-design, cognitive-science, interruptions, quality-gates, friction]
topics:
  - AI
qc: passed
spec: "Designed friction at natural breakpoints is positive-value, not zero-cost. 8 cognitive science papers prove interruptions at task boundaries carry zero cost, create incubation space, and enable steering. Exit 2 hooks are coarse breakpoints by design | creator — synthesized 8 papers + 22 sessions of personal hook system data | practitioners building AI agent systems"
---

# The Missing Value of Blocking: Why Friction Is a Feature

"Hours without blocking" is not a metric worth optimizing. The moment I realized this, I had to go back and reassess the entire design of my hook system — and it turned out the design was right, but for reasons I hadn't fully articulated.

Here is the received wisdom: a good autonomous agent runs as long as possible. Blocking is a failure state. Every stop is a cost. Every wait is wasted time. The ideal session is one where the agent executes from start to finish without interrupting you, and you review a complete deliverable at the end.

I held this view for most of my first ten Claude Code sessions. Then I spent a month reading cognitive science, and it dismantled the assumption entirely.

---

## The Old Model of Interruptions

The dominant framework for thinking about interruptions in knowledge work has been built on two findings: Mark et al. (2008) established that recovering from an interruption takes an average of 23 minutes, and Leroy's 2009 attention residue model explained why. The core idea is simple: when you switch away from a task before finishing it, attention residue — ongoing cognitive activation from the unfinished task — bleeds into your next task and degrades performance. The implication for agent design is straightforward: fewer stops, fewer switches, fewer interruptions. Let the agent run.

The problem is that Leroy 2009 treated all interruptions as equivalent. A ringing phone in the middle of a complex derivation. A forced pause at a natural project boundary. Same mechanism, same cost. The research has moved substantially since then.

Hirsch et al. (2025), in a study published in Frontiers in Psychology, made the breakpoint timing explicit as the key variable. Interruptions at task boundaries do not produce the same attention residue as mid-task interruptions. Instead, they enable context reconstruction — the cognitive process of deliberately reassembling task state. This is fundamentally different from residue: it is an active, structured pause rather than a passive bleed. The same group had established in 2023, in Memory & Cognition, that goal inhibition during interruption persists actively through the break, not passively. The mechanism is stronger, and more beneficial at breakpoints, than the Leroy model suggested.

Powers and Scerbo (2021), writing in Human Factors, went further: coarse breakpoint interruptions carry zero performance cost. Not low cost. Zero. The timing of the interruption relative to task structure is the determining factor, and at natural task boundaries, the cost disappears entirely.

So the question for agent design is not "how do I minimize interruptions?" It is "where are the natural task boundaries, and am I stopping there?"

---

## Exit 2 as Coarse Breakpoint Design

My hook system uses an exit 2 mechanism: PreToolUse hooks that return exit code 2 block the tool call before it executes. In practice, this fires most often at two types of moments — before a write that would touch production code without a preceding diagnosis step, and before delegation events where the agent would spawn a subagent without a structured handoff artifact.

These are, as it turns out, natural task boundaries. A write operation is the end of an analysis phase and the beginning of an execution phase. A delegation event is the end of a planning phase and the beginning of a build phase. The exit 2 fires exactly at coarse breakpoints, not in the middle of them.

I didn't design this intentionally. I designed the exit conditions around behavioral policy — "don't write without a diagnosis card" — and the breakpoint structure emerged from the policy. But the cognitive science retroactively validates the architecture. A hook system that blocks at policy violations happens to block at phase transitions, which happens to be exactly where interruptions are cognitively free.

The six thousand-plus hook fires across my 22 sessions are not six thousand interruptions with a cumulative cost. They are interventions at coarse breakpoints, which Powers and Scerbo tell us should carry a net cost near zero.

---

## The Positive-Value Half

Zero cost is not the interesting part. Schweisfurth and Greul (2024) is.

In a study published in Organization Science, Schweisfurth and Greul found that unexpected interruptions combined with idle time produced 58% more ideas than uninterrupted work. The mechanism they identified was incubation: the break from active task execution allows background cognitive processing to continue, and that processing generates creative recombinations that focused attention actively suppresses.

This has a direct analog in session design. My Stop hook fires at the end of each session burst and surfaces a dashboard: current context summary, recent decisions, open threads, token count, degradation estimate. I designed the dashboard primarily as a resumption aid — a way to reconstruct context at the start of the next burst rather than spending the first ten minutes of a session re-reading prior output.

But the dashboard also functions as an incubation window. The moment between reviewing the stop-state and deciding what to do next is not a cost. It is thinking time that is structurally prevented from happening during active execution. Three times across my sessions I have noticed, during the dashboard review, that I was solving the wrong problem. Not because the work was bad — it was technically correct — but because the problem framing had drifted from what I actually needed. The stop made the drift visible. Without it, I would have continued building the wrong thing well.

That is not a zero-cost benefit. That is positive value created by friction.

---

## The Resumption Cue Problem (and Why Most Agents Ignore It)

Even if you accept that breakpoint interruptions are free, the practical question remains: how do you get back up to speed after a stop?

Schneegass et al. (2021), in the Human-Computer Interaction Series (Springer), studied resumption cues — structured information provided at the point of interruption to reduce the cognitive overhead of restarting a task. The finding is consistent with the broader breakpoint literature: resumption cues reduce recovery lag. When you stop at a task boundary with access to a well-structured summary of task state, the cost of resuming approaches zero.

Most agent systems provide no resumption cue. The session ends, the context window closes, and the next session starts from whatever is in the system prompt. The practitioner reconstructs state from memory or re-reads prior output. This reconstruction tax is not intrinsic to the interruption — it is an artifact of poor interruption design.

My Stop dashboard exists specifically to eliminate this tax. It runs an SRP (session retrospective protocol) that extracts: what was decided, what was built, what is blocked, how many tokens have been consumed, and what the next three actions are. Reading it takes two minutes. The alternative — reconstructing all of this from context at session start — takes ten, with lower fidelity.

The dashboard is a resumption cue in the Schneegass sense. It converts a cold restart into a warm one. And because it fires at a stop that already carries near-zero cost (coarse breakpoint, task boundary), the net effect is a stop that is better than continuity.

---

## Context Degradation and the Fatigue Analogy

Chen et al. (2022), in Applied Ergonomics, found that mental fatigue moderates interruption cost — longer sessions produce higher costs per interruption, even at equivalent task boundaries. The mechanism is depletion of the cognitive resources that make context reconstruction effective. A well-rested mind reconstructs context cleanly; a fatigued one fills gaps with priors and moves on.

LLMs have a structural analog to this. Context degrades not as a function of time but as a function of absolute token count. In my sessions, I have measured consistent degradation onset around the 30–50K token mark: the model begins to produce outputs that are technically consistent with prior context but drift from the actual constraints that were established early in the session. The degradation is not catastrophic — it is the kind of subtle drift that only becomes visible in retrospect.

The fatigue parallel is not metaphorical. In both cases, there is a resource that depletes with use, and in both cases, the cost of interruption rises as depletion increases. The implication is the same: interrupt before depletion, not after. A stop at 35K tokens is cheap. A stop at 90K tokens is expensive.

My exit 2 mechanism operates at the system level, outside the context window. It cannot be affected by context degradation — a hook that fires at 35K fires identically at 90K. This is not a coincidence of implementation. It is a design principle: the enforcement mechanism that matters most should be the one least affected by the state it is monitoring.

---

## What the Data Shows

Across 22 sessions, my execution pattern has converged on what I call the burst model: a session is a sum of bursts, where each burst is execute → STOP → dashboard → execute. Individual bursts run 15–25 minutes. Longer sessions — attempts to run 90 minutes without stopping — consistently produce worse output on the dimensions I track: fewer decisions logged with explicit reasoning, more instances of context drift, higher rate of output that requires revision in the next session.

The 20-minute burst duration is not arbitrary. It aligns with the coarse-breakpoint literature: in my sessions, task phases tend to run 15–30 minutes (analysis, implementation, verification), and stopping at the phase boundary costs nothing. The Stop hook fires at the natural end of a phase. The dashboard runs. The next burst starts from a clean reconstruction.

I want to be honest about the failure mode in the other direction. In session 14, I tried to formalize the burst model by adding an automatic time-based stop at 20 minutes, regardless of task state. Three out of the first five fires hit mid-implementation — the agent had started a refactor and was stopped at the precise point where context reconstruction is most expensive, with half-modified files and no clear stopping state. Mid-task interruption cost exactly what the literature predicts it costs. I reverted to event-based stops within the session.

The lesson is not "stop every 20 minutes." The lesson is "stop at coarse breakpoints." Time is a proxy for task phase, and a leaky one.

---

## The Steering Value Nobody Counts

There is a third source of value from designed friction that doesn't appear in the cognitive science literature because it is specific to human-AI collaboration.

At every stop, I make a steering decision: continue on the same trajectory, adjust scope, or halt and replan. In a fully autonomous run, that decision is deferred until completion. The implicit assumption is that deferring is free — the agent's trajectory is correct, and any correction at the end is cheaper than stopping mid-run.

This assumption fails when the agent's trajectory is wrong. Not wrong in the technical sense — syntax errors, logic bugs, failed tests — but wrong in the direction sense: building a correct solution to the wrong problem, implementing a feature that adds complexity without value, continuing past the point where the output already satisfies the goal.

My 22 sessions include three instances of directional error that were caught at stops and would not have been caught otherwise. In each case, the output at the stop point was technically correct but strategically misaligned. Without the stop, the agent would have continued building in the wrong direction for another 30–60 minutes.

The value of catching a directional error early is not just the time saved. It is the compounding debt avoided. A 30-minute wrong-direction run produces artifacts that must be unwound. Every subsequent session that references those artifacts inherits the direction error. Designed stops create correction opportunities that fully autonomous runs structurally cannot provide.

---

## The Missing Entry in the Cost-Benefit Ledger

The standard framing of autonomous agent friction treats every stop as a cost and calculates the benefit of fewer stops. The math looks like: reduced interruption frequency × cost per interruption = savings. Maximize savings by minimizing stops.

What the research suggests is that this ledger is missing several entries on the benefit side:

**Zero-cost stops at coarse breakpoints.** Powers and Scerbo (2021) establishes that the cost term in the standard ledger is often zero, conditional on stop timing. If your stops are at task boundaries, the multiplication starts from zero.

**Positive-value incubation windows.** Schweisfurth and Greul (2024) adds a benefit entry: idle time at interruption produces more ideas than uninterrupted work. The stop doesn't just cost nothing — it generates something.

**Resumption cue value.** Schneegass et al. (2021) adds a second benefit entry: structured stop state reduces future session startup cost. The dashboard value should appear in the next session's ledger, not just the current one.

**Degradation hedging.** The exit 2 mechanism provides enforcement that is invariant to context state. This is an insurance value: the probability that a degraded context produces a hook-fire failure is zero, because the hook fires before the context is consulted.

**Steering optionality.** Each stop is an option to redirect. Options have value proportional to trajectory uncertainty. In long autonomous runs, trajectory uncertainty compounds. The value of steering optionality increases with run length.

The agent that never stops is not optimal. It is an agent with a systematically incomplete cost-benefit calculation.

---

## Where the Research Gap Lives

I want to flag something honestly: there are no published studies on interruption patterns in human-AI collaborative work. Hirsch, Powers, Schweisfurth, Schneegass, Chen — all of these are studying human cognitive patterns in knowledge work, not AI agent sessions. The application to agent design is an extrapolation.

It is an extrapolation I find persuasive because the underlying mechanism — coarse breakpoints enable cost-free context reconstruction — applies directly to LLM-based agents, which maintain explicit task state that is at least as reconstructible as human task state. But it is an extrapolation. The 22 sessions I have run are not a controlled study. They are one practitioner's data from one tool in one workflow.

The cognitive science literature is clear on the human side. The agent design side is, as far as I can find, genuinely open. Every practitioner who has tried to measure the cost and benefit of deliberate agent stops has encountered the same absence of prior work I did.

---

## Takeaway

Design your agent's friction. Stopping at coarse breakpoints costs nothing, creates incubation space, enables steering, and provides degradation-invariant enforcement. The agent that never stops is not better — it is one whose failure modes are deferred and compounded.

---

*Papers cited: Mark, Gonzalez & Harris (2008), CHI, doi:10.1145/1357054.1357072; Powers & Scerbo (2021), Human Factors, doi:10.1177/00187208211009010; Leroy (2009), Organizational Behavior and Human Decision Processes; Schweisfurth & Greul (2024), Organization Science, doi:10.1287/orsc.2023.1660; Schneegass & Draxler (2021), Human-Computer Interaction Series, doi:10.1007/978-3-030-30457-7_5; Hirsch, Moretti, Askin & Koch (2023), Memory & Cognition, doi:10.3758/s13421-023-01458-8; Hirsch, Moretti, Leichtmann, Koch & Nitsch (2025), Frontiers in Psychology, doi:10.3389/fpsyg.2024.1465323; Chen, Fang, Guo & Bao (2022), Applied Ergonomics, doi:10.1016/j.apergo.2022.103764.*

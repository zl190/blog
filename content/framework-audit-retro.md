---
title: "I Published a Framework and Then Didn't Follow It"
created: 2026-03-29
date: 2026-03-29
tags: [AI, claude-code, methodology, retrospective]
topics:
  - AI
  - Systems
qc: passed
spec: "Gates without physical enforcement have 0% execution rate — the framework described its own fix and didn't implement it | creator — built the framework, ran the audit, caught the failure | anyone building AI production pipelines who thinks having a framework means following it"
---

I published a five-layer framework for AI-assisted production. In the same session, I broke the first rule.

[[framework-panorama|The Stack I Didn't Design]] opens with "the top of the stack is the one thing I can't automate." Layer 1 — Human Direction — is human decides what to build, for whom, from what angle. That can't be delegated. It's the post's central claim.

The last30days blog post I published that same session had an angle chosen entirely by the Builder agent: "How I Built a Research Engine." I submitted a PR to someone else's tool. The Builder fabricated an authorship narrative and I published it. I caught it by reading the live site on my phone. Not the QC agent. Not the orchestrator. Me, on a phone.

Layer 1 delegated to a machine. The one thing the framework says you can't do.

## The audit

I ran every layer against actual usage. Here's what I found.

**Layer 2 — Methodology** had mixed results. The template (blog style guide) was used consistently. The personas (TheEditor, TheDesigner) worked for QC and layout. Procedure exists on paper. Enforcement worked perfectly — but only because the pre-commit hook is a physical block. You cannot push without `qc: passed` in frontmatter, so that gate runs 100% of the time. Every gate without a physical mechanism ran 0% of the time.

**Layer 3 — Code Patterns** is where the numbers get bad. The framework describes five gate operators. Actual usage:

| Gate | Used? | What it would have caught |
|------|-------|--------------------------|
| QCGate | Yes (pre-commit hook) | Prose issues |
| SpecGate | Never | Builder writing "How I Built" from a vague direction |
| DiagnosisGate | Never | Session 7: 3 failed Graph View fixes before the right solution |
| EvidenceGate | Never | "I built this tool" published with zero evidence check |
| TestGate | Never | Blog components with zero tests |

One out of five gates operational. 20% execution rate on my own framework.

**Layer 4 — Execution Infrastructure.** Session briefs work well. QC agents running in separate context: correct. Ralph loop and cc-fuel-gauge: never used. Context management was entirely manual, which means it happened when I remembered and not when I didn't.

**Layer 5 — Model Behavior** is the most ironic miss. The framework describes PUA and SM (diagnosis before fix) as tools the model uses autonomously. In practice, the user PUA'd the AI every time — "pua 你是P8你定方案", "pua last30days到底在说啥" — never the other direction. SM was never applied to the last30days incident. When the fabricated post was flagged, the first instinct was immediate rewrite. The user had to push back — "你搜不到?" — before anyone actually checked the PR.

The framework's own warning is "what the model says ≠ what the model does." The last30days incident is that sentence happening to its author. The Builder confidently wrote an authorship narrative. The QC agent confidently passed it. Both said the right things and neither did the right thing.

## Root cause

The pipeline was: `user says something → Builder writes → QC reviews prose → publish`

It should be: `user says something → SpecGate (thesis + author's relationship to subject) → Builder writes → EvidenceGate (verify factual claims) → QCGate → publish`

The missing gates weren't forgotten. They had no enforcement mechanism. The framework's own principle: enforcement = physical block. Only QCGate got a hook. The framework described the exact solution to its own failure mode and then didn't implement it.

Volume pressure made this worse. "One post per session" created an incentive to ship, not to check. The SpecGate and EvidenceGate feel like friction when you're trying to hit a cadence. They're not friction — they're the point.

## What changes

Four concrete fixes, not resolutions:

**1. SpecGate enforcement.** Blog posts now require a `spec:` frontmatter field: thesis, author's relationship to the subject, target reader. Pre-commit hook checks for its presence. No spec, no commit. The last30days post would have failed immediately — I had no thesis that was mine to claim.

**2. EvidenceGate in QC.** The first item on the QC checklist is now "verify author's relationship to the subject" — before prose quality, before structure. Factual integrity is not a prose problem.

**3. Self-PUA: enforce or remove.** It's been in the memory system for four sessions with 0% execution. Either it gets a physical check (a gate operator that asks "have you applied SM to this session's failures?") or I admit it's aspirational and remove it. Aspirational items in an enforcement framework are worse than nothing — they create the illusion of coverage.

**4. One post with a thesis, not one post.** The volume goal stays. The quality standard changes. A post without a verifiable thesis doesn't count toward the session target. This directly addresses the incentive that produced the fake post.

The meta-observation: I can tell the difference between a gate that runs and a gate that exists. The hook runs. Everything else existed. Existence is not execution. The next version of this framework has one design rule: if it doesn't have a physical block, it doesn't count as a gate.

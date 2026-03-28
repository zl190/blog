---
title: "Why Your AI Editor Isn't Enough: Introducing TheResearcher Persona"
created: 2026-03-26
date: 2026-03-27
tags: [AI, claude-code, research-methodology, personas]
qc: passed
---

# Why Your AI Editor Isn't Enough: Introducing TheResearcher Persona

I watched someone spend three weeks rethinking their theoretical framing because of a coefficient they couldn't explain. The paper was on analyst coverage and firm investment. The hypothesis: more coverage means more monitoring, which constrains overinvestment. The regression came back positive. So they started questioning the theory—maybe coverage provides information that *enables* investment? They rewrote the motivation section twice.

The problem was a timing mismatch in variable construction. Analyst coverage was measured at fiscal year-end; investment was measured at the start. They'd introduced a reverse causality problem in the data pipeline. Fix that, the coefficient flips. The theory was fine the whole time.

I built a persona to catch that kind of mistake before it costs weeks: **TheResearcher**. The full persona file (the_researcher_persona.md) is in this repo alongside this post.

---

## What TheEditor Catches (and What It Doesn't)

I've been using AI personas for paper review for a few months now, and the most useful thing I've learned is that writing quality and methodological quality are separate problems that need separate tools. When I started with Alessandro Spina's [TheEditor persona](https://github.com/aspi6246/ClaudeCodeTools), I expected it to catch everything. It catches a lot. But it audits the *product*—the sentences, the structure, the argument as written. It doesn't audit the *process*—the chain from theory to data to inference to claim.

TheEditor is excellent at what it's designed for. It will tell you your introduction buries the contribution on page 3, your abstract says "we find interesting results" instead of stating the coefficient, your literature review reads chronologically instead of thematically. These are real problems that get papers rejected.

But TheEditor can't tell you:

- Whether your proxy actually measures the construct your theory requires
- Whether your identification strategy rules out the obvious confound
- Whether your prediction follows logically from your thesis, or requires an auxiliary assumption you haven't stated
- Whether there's a bug in your data pipeline that's generating the result you think is real

Those are methodology problems, not writing problems. A hostile Referee 2 who finds them will not call them prose issues.

---

## The Four-Node Backward Diagnosis Chain

TheResearcher is built around one core framework: when something looks wrong in your results, you don't immediately question your thesis. You work backward through four nodes, starting at the cheapest fix.

```
[RESULTS] ← Node 4 (Execution) ← Node 3 (Design) ← Node 2 (Claims) ← Node 1 (Thesis)
```

**Node 4 — Execution:** Is there a bug in the code or data pipeline? A wrong merge key, a filter applied twice, winsorization at the wrong step? Check here first.

**Node 3 — Design:** Do the empirical constructs actually measure what the theory needs them to measure? This is the most common failure point, and the hardest to see from inside the project. You think you're measuring information asymmetry. You're actually measuring firm size. These are correlated, and the regression can't tell them apart without additional tests you haven't run. Sometimes the issue is wrong variables. Sometimes it's timing (as in the story above). Sometimes it's aggregation level, or the proxy is endogenous to the outcome you're trying to explain. Node 3 is where papers die and where reviewers have the most leverage.

**Node 2 — Claims:** Are the testable predictions actually derived from your thesis? Or do they require auxiliary assumptions you haven't stated? A common version: the prediction only goes through if you assume something about investor behavior that your theory doesn't specify. A hostile referee will find it. TheResearcher finds it first.

**Node 1 — Thesis:** Is the theoretical claim internally coherent and genuinely novel? The most expensive thing to change—it can require rethinking the paper from scratch. You only go here after nodes 2, 3, and 4 are clean.

**The key rule: never revise your thesis because of a buggy analysis.** Three weeks of rewritten motivation, because of a merge timing error.

---

## The Deliberation Protocol

For findings that survive the pipeline audit, TheResearcher applies a four-step deliberation protocol before accepting any result as evidence for a claim:

1. **Challenge the result from both directions** — What's the strongest supporting interpretation? What's the single best alternative explanation?
2. **Sensitivity** — Which assumption, if wrong, flips the conclusion?
3. **Boundary** — Under what conditions does this NOT hold, and what does that imply for your other predictions?
4. **Decision** — Accept, revise framing, re-experiment, or mark as exploratory?

The protocol exists because researchers are motivated reasoners. We find a result we like and we stop. The protocol forces you to find the objection yourself, before a referee does.

---

## The Right Order: Researcher, Then Editor

**Always run TheResearcher before TheEditor.** Auditing prose on a broken design is wasted effort. If the identification strategy is invalid, the entire results section gets restructured—and all the editorial polish on those paragraphs gets thrown away.

| What's broken | Who catches it |
|---------------|----------------|
| Abstract doesn't state the finding | TheEditor |
| Introduction buries the contribution | TheEditor |
| Prose is passive and nominalizing | TheEditor |
| Citations used for claims they don't support | TheEditor |
| Data pipeline bug generating spurious result | TheResearcher |
| Proxy doesn't measure the theoretical construct | TheResearcher |
| Prediction requires unstated auxiliary assumption | TheResearcher |
| Test doesn't distinguish your mechanism from alternatives | TheResearcher |
| Null result misinterpreted as evidence for thesis | TheResearcher |
| Thesis incoherent or non-falsifiable | TheResearcher |

---

## How to Use TheResearcher

The persona is a markdown file you load into Claude Code as a system context. I use this persona as a gate in the [[agent-teams-for-research|agent team]] workflow. Point it at your project directory and ask it to run the methodology audit.

```bash
claude -p "$(cat the_researcher_persona.md)

Audit this paper. Start with the execution audit on the code in /analysis/.
The manuscript is in /paper/main.tex. File your report in correspondence/the_researcher/." \
  --dangerously-skip-permissions
```

TheResearcher will read your code, trace your pipeline, map your constructs to your theoretical claims, and produce a structured diagnosis report with findings sorted by severity: CRITICAL, SUBSTANTIVE, and MINOR. CRITICAL findings invalidate the current results if not addressed. MINOR findings are referee-hardening.

After you've worked through the methodology report and revised, hand the paper to TheEditor. At that point, the thinking is sound and the writing is all that's left to fix.

---

## Why This Matters for Empirical Researchers

Finance and accounting journals have gotten more hostile to identification concerns in the last decade—if your referee has a metrics background, they will run the Node 3 check on you. A Referee 2 who is a methods expert will read your paper with exactly the logic TheResearcher uses: what is actually varying here? What confound are you not ruling out? Why is this prediction unique to your theory?

Running TheResearcher before submission is not about making the process easier. It's about finding the referee's objection before the referee does. The experimental validation of structured diagnosis is in [[i-ab-tested-pua-plugin|my PUA A/B experiment]]. The Node 4 → Node 1 chain is the order a good dissertation advisor would use. The difference is that TheResearcher runs the pipeline audit on your code—something an advisor reads about but rarely executes. A merge error in your data construction is invisible to anyone who only reads your LaTeX.

---

*This is the third post in a series on using Claude Code for academic research. The other posts cover context window management, agent workflows for paper review, and the theory behind context degradation mechanisms.*

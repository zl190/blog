---
title: "From Framework to Published: How I Batch-Shipped a Blog"
format: blog
status: published
created: 2026-03-29
language: en
tags:
  - AI
  - claude-code
  - methodology
  - writing
  - production
topics:
  - AI
qc: passed
---

I QC'd and published 16 blog articles in one Claude Code session. Here's how the framework made it mechanical.

Before that session, I had a handful of articles on the site but no production process. No style guide, no independent QC, no enforcement. Publishing was ad-hoc — some posts went up without review, others sat as drafts indefinitely. The bottleneck wasn't ideas. It was the gap between "written" and "shipped with confidence."

The session didn't fix that by making me more disciplined. It fixed it by making discipline unnecessary.

## Content is a supply chain, not a factory

The way most people think about writing with AI: you give it a topic, it writes something, you post it. A factory model. Input → output, one step.

The problem is that factories produce uniform goods. Your blog post about [[context-degradation-theory]] is not the same kind of thing as your post about [[brainstorm-is-training-execution-is-inference]]. One is evidence-heavy theory; the other is a conceptual framework. Running both through the same "write me a blog post" prompt produces the same flavor of mediocre.

A supply chain separates the concerns: creativity happens in design, generation is mechanical, QC is independent. You front-load the hard thinking into the framework design. Then every individual article is just an instantiation.

That's the insight that Session 6 operationalized.

## The 4 primitives

The framework isn't one thing. It's four orthogonal pieces:

**Template (blog.md).** The style guide defines voice, structure, AI smell checklist, length tiers. It's a spec that both the builder and the auditor read independently. When the builder knows the spec and the auditor knows the spec, "does this post pass?" becomes answerable — not a matter of taste.

**Persona (TheEditor).** A separate Claude instance, clean context, given the style guide and nothing else about the post's history. The independence is the point. If the same model that wrote the article also checks it, you get a rubber stamp. TheEditor's job is to disagree, catch fabrications, and kill posts that shouldn't ship.

**Procedure (Wave 1 / Wave 2 / Wave 3).** Not "QC the articles," but a sequenced protocol:
- Wave 1: Format QC + evidence tagging (published articles). Flags structural problems, checks every factual claim has a source or is labeled personal experience.
- Wave 2: Content QC + wikilinks (drafts being promoted). Deeper semantic audit. This is where 22 wikilinks got added across 13 articles in a single session — not as a "related posts" footer but woven into prose.
- Wave 3: Final publish + verification (new articles entering the pipeline for the first time).

**Enforcement (pre-commit hook).** Every article's frontmatter must carry `qc: passed` or the commit is physically blocked. Not "try to remember to QC before pushing." Blocked. This one came from a push-back moment in the session — I floated "enforcement is nice-to-have at small scale" and immediately recognized that as the kind of reasoning that produces a pile of unreviewed drafts six months later. The hook was written before the conversation moved on.

## What the QC caught

This is the part that justifies the overhead.

**The last30days post** had fabricated Polymarket scoring percentages. The article claimed weights of 30/30/15/15/10. The actual code uses 60/20/20. Different numbers, different rationale. TheEditor caught it by cross-referencing the codebase directly — not by reasoning about what "seemed plausible." The article also referenced a "source authority weighting" feature that doesn't exist in the codebase. Both corrected before publish.

**The AIMD post** had a domain generalization table that extended a simulation result to "life advice" without any simulation evidence for that extension. The table was cut.

**The org-mode post** claimed the feature was "accessible to everyone." It requires an Anthropic subscription. Corrected to say so.

**The agent ecosystem draft** was killed entirely. KILL, not REVISE. Reads like documentation — zero personal experience, no failure story, covers the same ground as [[agent-teams-for-research]] but with less to show for it. The right call is deletion, not polish.

**The [[resource-stack-vision]] post** had six uncited empirical claims flagged by QC. Each one was either hedged with date context, sourced, or removed.

Total from that session: 16 articles QC'd, 1 killed, 15 published, 22 wikilinks added across 13 articles, 4 git pushes to production.

## Why this works

The fabricated Polymarket data is the clearest example of why independence matters. I wrote that post. I thought I knew the scoring weights. I was wrong by a factor of two. No amount of careful re-reading by the same model in the same context would have caught that, because the model that wrote the claim has already committed to it. The only reliable check is one that starts from the codebase, not from the text.

The template does something subtle too: it shifts the locus of creativity. When I designed blog.md — the voice attributes, the AI smell checklist, the structure rules — I was doing the hard aesthetic work once. When TheEditor runs QC against it, we're both working from the same spec. The disagreement space shrinks to "does this post satisfy the spec?" instead of "is this good writing?" That's an answerable question.

The wave procedure is about batch efficiency without batch sloppiness. Running 16 articles through QC in parallel is only safe if each article is evaluated independently. Three QC agents ran in parallel in Session 6: one for already-published articles, one for drafts being promoted, one for new seminar posts. The procedure specifies who looks at what, in what order, with what criteria. Without that, "batch QC" means "skim quickly and approve."

The hook makes the enforcement physical. Discipline is not a production system. "I will always QC before publishing" is a resolution, not a gate. A git hook that blocks commits without `qc: passed` is a gate.

## The meta-point

I had the drafts for months. The framework was what let me ship.

The [[brainstorm-is-training-execution-is-inference]] post exists in this blog because I understand that exploration and production are different phases that contaminate each other if mixed. Session 6 was an execution session. The ideas were already distilled into a brief. The production framework was already designed. The session was just inference — read the brief, instantiate the pipeline, run the waves.

That's what "mechanical" means here. Not low-quality. Not thoughtless. Mechanical as in: once the framework exists, execution doesn't require re-solving the design problem each time.

The takeaway: front-load creativity into framework design, and production becomes a logistics problem.

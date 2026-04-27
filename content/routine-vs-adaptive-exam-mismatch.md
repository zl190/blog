---
title: "Routine vs Adaptive: The Exam Mismatch Most Education Systems Make"
draft: true
date: 2026-04-26
created: 2026-04-26
tags: [education, learning, expertise, cognitive-load-theory, pedagogy]
topics:
  - Education
  - Learning
qc: passed
spec: "There are two cognitively distinct exam types, Type-A (recognize a practiced pattern) and Type-B (creative recombination); sequencing them wrong (Type-B without Type-A saturation) is the design flaw behind both Chinese and American education's failure on the median learner | practitioner re-deriving Hatano & Inagaki 1986 from a learning frustration | educators, parents, and learning-system designers"
---

# Routine vs Adaptive: The Exam Mismatch Most Education Systems Make

*"Just give me the template. I'll do the trial-and-error inside it."*

I caught myself thinking this last week, mid-grind through a hands-on engineering problem, with the kind of frustration that makes you want to flip the table. The Socratic-grilling style I was being put through, *what do you think the data structure should be?*, wasn't pulling answers out of me. It was just consuming working memory I didn't have to spare.

The reaction surprised me. I'd long subscribed to the "creative exploration over rote drill" view of learning. But there I was, the person who reads cognitive science papers for fun, asking for the template instead of the question. Why? The answer crystallized over the next few minutes and forced me to articulate something I now think most education systems get backwards at scale.

Here's the claim: **there are two cognitively distinct kinds of exam, and almost every system mismatches them to the wrong learner at the wrong time.**

- **Type A** tests whether you can recognize a pattern you've practiced and apply it under time pressure. ("Compute the integral.")
- **Type B** tests whether you can borrow patterns from one domain to attack a novel problem in another, fail productively, and improvise. ("Design an experiment that would falsify this claim.")

With enough Type-A saturation in the relevant domain, Type-B is generative, the learner has raw material to recombine. Without that foundation, Type-B is *harmful*. It conflates "lacks saturated patterns" with "lacks creativity," demoralizes the median learner, and quietly rewards whoever already had Type-A coverage from outside the system.

This isn't a new idea. I re-derived it from a learning frustration and then realized [Hatano and Inagaki had named it in 1986](https://www.researchgate.net/publication/235984098_Two_courses_of_expertise), **routine expertise vs adaptive expertise.** What I think is less appreciated, and what I want to argue here, is that the two largest education systems on earth fail in *opposite* directions on this axis. And the cure isn't more or less rigor. It's sequencing.

## The two substrates are not "easy vs hard"

The deepest mistake learners and teachers both make is treating exam type as a difficulty knob. Type-A is "easy" (just compute), Type-B is "hard" (think creatively). So if you want to raise the bar, you swap in more Type-B.

That's wrong. Type-A and Type-B run on different cognitive substrates.

Type-A measures *automatized procedural fluency*. The musician doesn't think about scales; the mathematician doesn't think about algebraic manipulation; the seasoned engineer doesn't think about parsing protocol headers. The work has been chunked into working-memory-free moves. That free working memory is what makes higher-order reasoning possible at all.

Type-B measures *recombination across domains*. To recombine, you need raw material, saturated pattern libraries from somewhere. Either you've drilled the patterns inside the test domain, or you're borrowing them from a domain you drilled elsewhere (chess to math, literature to law, music to programming). Either way, the substrate has to exist before recombination can happen.

[Sweller, Ayres, and Kalyuga's cognitive load theory](https://link.springer.com/book/10.1007/978-1-4419-8126-4) makes this mechanical. Their *expertise reversal effect* is the headline finding: instructional moves that help novices actively hurt experts, and vice versa. Worked examples accelerate beginners and bore experts; open-ended exploration energizes experts and overwhelms beginners, because beginners burn working memory on subgoals an expert has already chunked.

That last sentence is the whole pedagogical mistake of "creativity-first" curricula. Type-B exposure without Type-A saturation isn't a stretch goal. It's working-memory bankruptcy.

## The 2-sigma evidence and the spiral

[Bloom's 1984 "2-sigma problem"](https://web.mit.edu/5.95/readings/bloom-two-sigma.pdf) is the most-cited result in mastery-learning research. Mastery learning (require ~90% on Type-A before progression) plus one-on-one tutoring produced a two-standard-deviation effect over conventional instruction. The lesson most people take from it is "tutoring is good." The lesson I take from it is *pattern saturation is the prerequisite for everything that comes after, including transfer.* Skip saturation and downstream learning collapses, no matter how sophisticated the downstream activity is.

Bruner's *spiral curriculum* sits on the same foundation. Concepts are revisited at successive levels of abstraction, and each revisit assumes the previous level is saturated. The spiral fails when learners are pushed up a level before the current one is consolidated, which is exactly what Type-B testing without Type-A diagnostics does at exam scale.

The productive-failure literature ([Manu Kapur's 2008-2016 work](https://manukapur.com/research/)) is the honest counter-evidence. Productive failure works, students *gain* by attempting novel problems before being taught the canonical solution. But Kapur's own scope conditions are precise: productive failure requires carefully scaffolded novelty inside a domain where the learner has *partial mastery already*. Generic "be creative on this hard new thing" without scaffolding produces *unproductive* failure: disengagement, learned helplessness, worse downstream performance. So even the strongest pro-Type-B literature is itself an argument for sequencing, not against it.

## Mirror failures: China over-tests Type-B; the US under-trains Type-A

Here's where the framework earns its keep. Two large education systems fail in opposite directions on this axis, and both failures masquerade as something else.

**The Chinese system has world-class Type-A pipelines.** Algebra, mechanics, classical-Chinese parsing, drilled to saturation with frightening efficiency. It then bolts Type-B-style "innovative" or "open-ended" items onto its highest-stakes exams: the Gaokao creative items, olympiad selection rounds, "open-ended" interview questions for top schools. The problem is that these Type-B items are often drawn from olympiad pattern families that the median student has never seen the library for. Students who attended olympiad tracks, attended top urban schools, or had engineer parents do well. The rest learn that "creativity" is something they don't have. The system identifies a few prepared geniuses and quietly *breaks* the rest.

**The American median public-school system has loose Type-A discipline.** Multi-digit arithmetic fluency, fraction operations, algebraic manipulation, all under-enforced. Type-B exposure ("explore the problem your own way," "discovery-based learning") gets layered on top without diagnostic checks on whether Type-A is in place. The middle-class workaround is to backfill Type-A privately, via Kumon, paid tutoring, or college-educated parents. Lower-class students lose both layers, and the gap compounds. The "math is creative, not procedural" rhetoric is true at the expert level and damaging at the median level.

Both systems mistake *delivery sequence* for *student aptitude*. Both produce class-stratified outcomes that are then attributed to talent. The Chinese system's Type-B layer functions as a class filter on top of saturated Type-A; the American system's missing Type-A layer functions as a class filter under the assumption of natural curiosity. Mirror images. Same failure mode at the system level. Different visible symptoms.

The positive control is conservatory pedagogy. Conservatories solved this a century ago. Scales and etudes are Type-A and required. Improvisation, composition, and interpretation are Type-B and gated on Type-A mastery. Nobody argues the gating is uncreative; everyone understands the substrate.

## The link to the semantic-layer thesis

I wrote a post earlier this month called [The Semantic Layer Is the Type System for Data](https://blog.ylab3.com/semantic-layer-is-type-system-for-data). On the surface it's a different topic, why "AI does my data analysis end-to-end" is still aspirational despite LLMs writing fluent SQL. The argument was that LLMs only solve syntax. Organizational meaning, what counts as a "user," what "active" means, which growth metric matters, has to be written down explicitly somewhere by humans. That somewhere is the semantic layer.

The two posts share a mother-pattern that I keep noticing in different domains: **what can be codified vs what cannot.**

In the data world: SQL is dynamic; semantic layer is its type annotations. Without the explicit substrate, the LLM guesses, and silent guesses produce confidently-wrong dashboards. The engineering move is to *first build the codifiable substrate*, then run inference on top.

In the education world: drilled patterns are codifiable; creative recombination is not. Without the explicit substrate, the learner guesses, and silent guesses produce confidently-broken students who decide "I'm not creative" when the correct read is "I haven't been given the pattern library yet." The pedagogical move is the same, *first build the codifiable substrate*, then test inference on top.

Both systems fail when you skip the substrate and demand inference. Both produce stratified outcomes that get attributed to inherent quality (model capability / student talent) when the actual cause is missing infrastructure. And in both cases, the codifiable layer is the boring, expensive, organizational-alignment work that no one wants to fund, but everything downstream depends on.

The recurring shape: explicit vs implicit, teachable vs not, practiced vs not. What can be made explicit, written down, drilled, audited, versus what genuinely requires tacit experience, recombination, or value judgment to resolve. Engineering progress, in any domain I've watched, comes from *moving the boundary*: taking another slice of the previously-tacit and codifying it. Type systems did this for programming. Semantic layers are doing this for data. Mastery checklists do it for learning. The work is unglamorous and the payoff is structural.

## What a better-designed exam regime looks like

Three concrete moves, and one falsifiable prediction.

1. **Diagnostic-gate Type-B exposure on a per-domain Type-A score**, not on grade level or cohort. The gate is at the *sub-topic* level, not the course level. A student can be Type-B-ready in algebra and Type-A-deficient in fractions simultaneously. Treating "10th grade" as the unit of progression collapses this signal.

2. **Make Type-A saturation visible to the learner.** Mastery dashboards (the Khan Academy / ALEKS pattern) so that "I haven't mastered this yet" replaces "I'm not creative." This single reframe is, in my own experience, worth more than any amount of pep talk.

3. **Use Type-B exams formatively, not summatively**, until per-domain saturation is confirmed. The current high-stakes Type-B exam, high-school AP free-response, college admission essays, the Gaokao's open-ended sections, is exactly the wrong loop. It punishes students for substrate gaps under the label of measuring creativity.

The falsifiable prediction: a public-school middle-math program that gates inquiry-based Type-B problem-solving on per-topic Type-A mastery checks (think "Khan Academy mastery ≥ 85% → IBL session") will produce a *larger* effect on the bottom quartile than on the top quartile. This reverses the usual sign of "innovative pedagogy" interventions, whose gains historically concentrate at the top. If someone runs that experiment and the gains *don't* concentrate at the bottom, my framework is wrong.

## The takeaway in one sentence

Most education systems administer the wrong type of exam at the wrong time, and the wrongness isn't difficulty, it's substrate; build the codifiable Type-A layer first, then test the recombinant Type-B layer on top, just like every other engineering domain that learned this lesson the hard way.

If this lens is useful, I'm writing more of these as I work through the AI-meets-systems-engineering frontier from a graduate-school vantage point. **Subscribe** for the next issue, it'll likely be on the third sibling of this mother-pattern: the difference between explicit measurement and tacit derivative, in a domain that surprised me.

---

*Further reading:* [Hatano & Inagaki (1986)](https://www.researchgate.net/publication/235984098_Two_courses_of_expertise) is the foundational paper. [Bloom (1984)](https://web.mit.edu/5.95/readings/bloom-two-sigma.pdf) is the 2-sigma source. [Sweller, Ayres, and Kalyuga's *Cognitive Load Theory*](https://link.springer.com/book/10.1007/978-1-4419-8126-4) is the modern synthesis with the expertise-reversal evidence. [Manu Kapur's productive-failure work](https://manukapur.com/research/) is the most honest counter-evidence and ends up reinforcing the sequencing argument. And the sibling post, [The Semantic Layer Is the Type System for Data](https://blog.ylab3.com/semantic-layer-is-type-system-for-data), works the same mother-pattern from the other side.

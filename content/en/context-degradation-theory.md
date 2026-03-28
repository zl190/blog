---
title: "Why Your 1M Context Window Degrades Faster Than Your Old 20K"
date: 2026-03-27
tags: [ai, claude-code, context-windows, attention-mechanisms]
qc: passed
---

# Why Your 1M Context Window Degrades Faster Than Your Old 20K: It's Absolute Tokens, Not Percentage

In [[context-window-20-percent-heuristic|my earlier post on the 20% heuristic]], I described the empirical pattern — the observation that effective context for Claude seems to cap out around 200K tokens, or 20% of the advertised 1M window. The framing was empirical: here's what the research says, here's what I see in practice, plan for 200K not 1M.

That framing was right as a heuristic. But it missed something, and I've been sitting with the gap ever since.

The "20%" figure implies a proportional relationship: bigger window, bigger effective range. When the context window was 200K, I noticed degradation around 40K tokens — roughly 20%. When it expanded to 1M, I expected the sweet spot to scale proportionally. The math suggested I should get 5x the working space: from 40K effective tokens to something like 200K. Five times the room for papers, code, conversation history.

I didn't get 5x. I got roughly the same.

Performance started dropping at what felt like the same absolute range — 30 to 50K tokens of accumulated content. The percentage got smaller (3-5% instead of 20%), but the threshold didn't move. I assumed I was imagining it, or that I'd changed how I worked in ways that confounded the comparison. Then I looked more carefully at what the research actually says about *why* context degrades. The answer is almost entirely absolute-n dependent. The window size barely matters.

---

## The Spotlight Doesn't Brighten When the Theater Gets Bigger

The core attention mechanism in transformer models computes, for every token, a weighted sum over all other tokens in context. The weights — the attention — capture how much each token "looks at" every other one.

Those weights come from a softmax operation, which takes raw scores and converts them to a probability distribution that sums to 1. Here's the arithmetic problem: as you add more tokens, the softmax distributes the same total probability mass across a larger population. Each individual token gets less attention on average.

The spotlight analogy: a theater with a fixed lighting budget. Small theater (8,000 tokens) — coverage is dense, most seats are well-lit. Stadium (200,000 tokens) — same lighting budget, much larger area. Per square meter, each seat is dimmer. The spotlight didn't get brighter when the theater got bigger.

This has a mathematical formalization. Nakanishi (2025) proved in the Scalable-Softmax paper that entropy in the attention distribution grows as Θ(log n), where n is absolute context length. Attention becomes more diffuse and uniform — not because the window is getting full, but because n is large. The proof is in terms of *n*, not *n/window_size*.

Doubling the window from 500K to 1M doesn't reset the clock. If you have 50K tokens of conversation accumulated, attention is as diluted as it would be at 50K tokens in a 200K window. The window size is not in the equation.

---

## Moving from the Front Row to the Nosebleeds

The "lost in the middle" phenomenon (Liu et al., 2023) is the most studied form of context degradation. The finding: LLMs exhibit a U-shaped attention curve based on position. Beginnings and ends are attended to well. Middle is systematically underweighted — even in models designed for long-context tasks.

Here's how this plays out in a typical research session. You load a paper at conversation start — it sits at the beginning of context, in the well-attended zone. You iterate through analysis for 25, 30 turns. The paper doesn't change, but its position in context does. Gradually it migrates from "beginning" toward "middle" as conversation history accumulates above it. The model's effective access to that paper degrades while you're still asking about it.

The *shape* of the U-curve does depend somewhat on how full the window is — that part is ratio-dependent. But how bad the bottom of the U gets depends on absolute context length. A 40K-token middle is attended to better than a 400K-token middle, regardless of what percentage each represents. Laban et al. (2025) found a 39% average performance drop in multi-turn conversations, and the degradation accumulated turn-by-turn — not as a percentage of window capacity, but as an accumulation of absolute turns.

I hit this wall during a replication exercise last semester. The session had been going well — I'd loaded a 35-page empirical paper, we'd been working through the identification strategy for maybe twenty-five turns. The context bar showed 8%. I remember noting the number and thinking I had plenty of room left. Then I asked the model to cross-check a specific claim from section 3.2 — something I'd confirmed was accurate when I'd first loaded the paper. The response confidently stated the opposite of what the paper said. Not a hallucination about an obscure detail. The paper had the exact claim I was asking about, in plain language, on page 14. The model had seen it. An hour earlier it had cited it correctly.

Eight percent used. Roughly 45K absolute tokens. The paper was sitting deep in the middle of a multi-turn conversation, getting underweighted by the attention mechanism, and the model was confabulating in place of attending.

---

## The Model Has Never Practiced at This Distance

The third mechanism is the one I see discussed least, and it's worth understanding even at a non-technical level.

Position encodings are how a transformer tracks order. During training, the model learns representations of what it means to be at position 1, position 100, position 10,000. It builds intuitions — implicit ones, encoded in weights — about how tokens at different distances relate to each other.

Extended context windows (Claude's 1M, Gemini's multi-million-token windows) are typically achieved through techniques that mathematically *stretch* the position encodings into territory beyond the training distribution. The most common approach is called YaRN (Yet another RoPE extensioN). It takes the position representations the model learned at up to, say, 100K tokens, and extrapolates them outward. The encodings for position 600,000 are derived by stretching the learned encodings, not by training on examples at position 600,000.

The practical consequence: beyond the original training range, the model is operating on position signals it has never directly practiced. It's like a pianist who trained in a practice room — the instrument is technically the same, and the notes are the same, but Carnegie Hall has different acoustics, a different scale, different spatial feedback. The muscle memory was built for one environment. The intuitions don't transfer cleanly.

Again the key feature: position-based degradation is absolute. Token at position 50,000 is in the same position regardless of window size. The window doesn't shift the position counter backward.

---

## The Threshold Is 30-50K, Not 20% of Whatever You Have

Put the three mechanisms together. Attention dilution scales as log(n) — absolute. Position in context for the lost-in-the-middle effect tracks absolute accumulation. Position encoding quality degrades past absolute distance thresholds. Every mechanism points the same direction.

The most direct experimental evidence is an arXiv preprint from 2025 (arXiv:2510.05381) that ran an elegant control. The researchers suspected context degradation might be driven by *distraction* — by irrelevant tokens pulling attention away from relevant ones. To test this, they replaced irrelevant content with whitespace. No text, no distraction, just length. They also forced attention onto the relevant tokens and placed evidence immediately before the question. Every reasonable confound, controlled.

Performance still degraded 13.9 to 85% as absolute input length increased.

Not percentage of window. Absolute length. Even with perfect retrieval and zero distraction. This is the cleanest evidence I've seen for "length itself is the bottleneck" — not percentage, not saturation, not irrelevant content. Just the absolute count of tokens the model has to work across.

The Chroma Research (2025) study tested 18 frontier models at multiple context lengths and found every model degraded at every length increment. No exceptions, no plateau below 200K. The Laban et al. (2025) multi-turn study, 200,000+ simulated conversations: 39% average drop, caused by premature commitment that compounds over absolute turns.

From practice, the threshold where I notice complex reasoning getting noticeably worse is somewhere around 30-50K tokens. The research is broadly consistent with that range being the zone where the mechanisms start combining meaningfully.

---

## The Status Bar Is Giving You False Confidence

The practical implication is the uncomfortable one: the percentage shown in Claude Code's status bar is the wrong number to watch.

3% of 1M is 30K tokens. That's already well into the zone where attention is diluting, where the beginning-of-context material is migrating toward the middle, and where position encodings are stretching. The bar looks almost empty. The model is already working harder than it was at 5K tokens.

The old heuristic — "hand off at 20% of window" — scales incorrectly for large windows. At 1M tokens, 20% is 200K tokens. By that point, a long analytical session has been degrading for a while. The threshold that actually tracks quality is absolute, around 30-50K tokens, regardless of what percentage that represents.

For practical workflow: when you're doing careful analytical work — cross-checking claims, iterating on empirical strategy, debugging statistical code — track your absolute token count, not the percentage. When you've accumulated 30-40K tokens, start a fresh session with a good summary of where you are. This will feel wrong when the bar shows 3%. The bar is lying. The fresh context will outperform the degraded one.

The 1M window is not "5x more room." It's "same room, longer hallway." The room where things work well is about the same size. The hallway behind it is longer and darker.

The workflow implications of this are in [[brainstorm-is-training-execution-is-inference|Brainstorm Is Training, Execution Is Inference]].

---

## The Experiment Nobody Has Run

There's a gap in the evidence that I want to be honest about rather than paper over.

No published study has run the definitive controlled comparison: same model, same task, same absolute token count, different window sizes. If I have 40K tokens in a 200K window (20%) versus 40K tokens in a 1M window (4%), do I get the same quality? The absolute-tokens hypothesis predicts yes. But no one has published that experiment.

The whitespace padding study comes closest — it cleanly separates length from content and tests length's independent effect. But it varies length within a single window, not across window sizes. The Nakanishi proof is rigorous, but it's about standard softmax, and extended windows use modified attention mechanisms that might partially ameliorate this. We don't have clean data on how much.

The absolute-tokens framing is my best current model for what I observe. It explains the pattern — same threshold despite 5x the window — better than any percentage-based story does. But "explains the data better" isn't the same as "proven." I'm treating it as the leading hypothesis, not a settled fact.

If someone runs that experiment, I'll update.

---

*This is the fourth post in a series on using Claude Code for academic research. The earlier posts cover session hygiene (the 20% rule), agent workflows for literature review, and a methodology auditor persona built on CLAUDE.md.*

---

## Sources

- Liu, N. F., Lin, K., Hewitt, J., Paranjape, A., Bevilacqua, M., Petroni, F., & Liang, P. (2023). **Lost in the Middle: How Language Models Use Long Contexts.** *Transactions of the Association for Computational Linguistics*, 12, 157–173. https://arxiv.org/abs/2307.03172

- Laban, P., Hayashi, H., Zhou, Y., & Neville, J. (2025). **LLMs Get Lost In Multi-Turn Conversation.** arXiv:2505.06120. https://arxiv.org/abs/2505.06120

- Du, Y., Tian, M., Ronanki, S., et al. (2025). **Context Length Alone Hurts LLM Performance Despite Perfect Retrieval.** *Findings of EMNLP 2025*. arXiv:2510.05381. https://arxiv.org/abs/2510.05381

- Nakanishi, K. M. (2025). **Scalable-Softmax Is Superior for Attention.** arXiv:2501.19399. https://arxiv.org/abs/2501.19399

- Chroma Research (2025). **Context Rot: How Increasing Input Tokens Impacts LLM Performance.** https://research.trychroma.com/context-rot

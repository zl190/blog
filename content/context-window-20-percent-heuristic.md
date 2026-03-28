---
title: "The 20% Heuristic: Why Your 1M Context Window Isn't What You Think"
created: 2026-03-24
date: 2026-03-27
tags: [AI, claude-code, context-windows, research-methodology]
topics:
  - AI
qc: passed
---

# The 20% Heuristic: Why Your 1M Context Window Isn't What You Think

A 1-million-token context window sounds extraordinary. Claude's documentation advertises it as the ability to fit "entire codebases" or "hundreds of documents" into a single conversation. And technically, it's true — the model will accept that much text.

But here's what the marketing doesn't tell you: by the time you reach 1M tokens, the model isn't really "reading" anymore. It's struggling.

I think of it like an EV's advertised range. The brochure says 400 miles. In real-world conditions — highway speed, cold weather, air conditioning — you get 280. Prudent drivers don't plan routes that require 390 miles on a single charge. They work within the real-world number, not the advertised one.

For large language models, the gap between advertised and practical capacity is real — but there's no single magic number. The research shows degradation is task-dependent, position-dependent, and can start surprisingly early. From my own experience running 30+ iterative research sessions with Claude, I've found that keeping active context under roughly 20% of the window — and handing off to a fresh session rather than grinding through a long conversation — consistently produces better results. Your mileage will vary. But the principle holds: plan for the practical range, not the brochure number.

---

## What the Research Actually Says

The evidence for context degradation is now robust enough to call it a stylized fact.

The foundational paper is **Liu et al. (2023)**, "Lost in the Middle: How Language Models Use Long Contexts" (arXiv:2307.03172). Their finding is counterintuitive: LLMs don't degrade uniformly as context grows. Instead, they exhibit a **U-shaped performance curve** based on where information sits in the context. Models attend well to the beginning and end of input, but information in the *middle* is systematically underweighted — even in models explicitly designed for long-context tasks.

This has a direct implication for academic work: if you load a 40-page paper into context, then spend the next hour having a conversation about it, the paper gradually moves from "beginning of context" toward "middle of context" as your conversation history accumulates. The model's effective access to that paper degrades as the conversation progresses.

Chroma Research (2025) — a vector database company, not a peer-reviewed study — tested 18 frontier models for what they call **"context rot"**. Their finding: degradation is non-uniform and task-dependent. Lower similarity between query and relevant information accelerates degradation, and semantic distractors compound the problem. Every model tested showed degradation as length increased, though patterns were non-uniform — not a clean monotonic decline at every increment. Worth citing for the breadth of the evaluation, but treat it as industry benchmarking, not academic evidence.

A separate 2025 paper (arXiv:2510.05381) isolated the length effect even more cleanly. They tested models where irrelevant tokens were replaced with whitespace, attention was forced onto relevant content, and evidence appeared immediately before the question. Performance still degraded **13.9–85%** as input length increased — and degradation was detectable as early as **7.5K tokens** for reasoning tasks, with 30K tokens producing 12–85% drops depending on task and model. The conclusion: it's not just distraction causing degradation. **Length itself is a bottleneck.**

The multi-turn problem is worse than the length problem. Laban et al. (2025), across 200,000+ simulated conversations, found an **average 39% performance drop** in multi-turn exchanges compared to single-turn queries. The mechanism: LLMs form premature conclusions early in a conversation and become increasingly committed to them, even when later evidence contradicts them. Once the model "takes a wrong turn," it doesn't recover.

---

## The Token Math for Academic Work

Let's put concrete numbers on this. Suppose you're using Claude with a 1M-token context window.

**Your effective budget (a practitioner's heuristic, not a hard threshold):**

```
Advertised context:          1,000,000 tokens
~20% comfort zone*:           ~200,000 tokens

* Based on personal experience across 30+ research sessions.
  The literature shows degradation is continuous and task-dependent,
  not a cliff at a specific percentage. This is a planning heuristic.
```

Now subtract overhead before you've typed a single question:

| Component | Approximate tokens |
|-----------|-------------------|
| System prompt (model baseline) | ~2,000 |
| Global CLAUDE.md / project instructions | ~2,000 |
| Conversation history (20 turns at ~300 tokens/turn) | ~6,000 |
| **Total overhead** | **~10,000** |

That leaves roughly **190,000 tokens** for actual content. How far does that go?

| Academic content | Approximate tokens |
|-----------------|-------------------|
| 40-page journal article (text only) | ~35,000–45,000 |
| R analysis script (500 lines) | ~20,000–25,000 |
| R analysis script (1,000 lines) | ~40,000–50,000 |
| 3 papers + 1 analysis script | ~130,000–185,000 |

So: three papers plus one analysis script already consumes most of your effective window — and that's before you've asked a single question. Load a fourth paper, or have a 30-turn conversation, and you're past the 200K threshold where performance starts meaningfully degrading.

---

## The Real Reason AI Is "Bad at Reading PDFs"

At a recent UTS Business School seminar, Alessandro Spina made an observation I've heard many times: "AI is bad at reading 40-page PDFs."

I don't think that's quite right. Or rather, it's accurate as a description but misidentifies the cause.

The problem usually isn't the PDF format, or the length of the paper in isolation. It's **context window saturation**. Here's the typical failure sequence:

1. Researcher loads a 40-page paper (~40K tokens)
2. Researcher pastes their analysis code (~25K tokens)
3. Researcher includes a system prompt or instructions (~5K tokens)
4. That's already 70K tokens before conversation starts
5. After 30 turns of back-and-forth (another ~15K tokens), you're at 85K
6. The paper is now firmly in "middle of context" territory, being underweighted

The model isn't failing to understand the PDF. It's failing to attend to the PDF's contents because of where they sit in the context and how much has accumulated since they were loaded.

The fix isn't a better model. It's better session hygiene.

---

## Practical Recommendations

**Hand off early, not when it feels broken.** The Laban et al. finding about premature commitment changed how I work. Last semester I was iterating on an identification strategy — twenty-five turns in, context bar showing 8%, plenty of room. I asked the model to cross-check a claim from section 3.2 of the paper I'd loaded at the start. It confidently stated the opposite of what the paper said. The paper had the claim in plain language on page 14. The model had cited it correctly an hour earlier. Eight percent used. Roughly 45K absolute tokens. The paper had migrated deep into the middle of a multi-turn conversation, getting underweighted by attention, and the model was confabulating in place of attending. Now I write a 500-word summary of progress and key decisions, start fresh, and paste the summary. It feels wasteful. It outperforms grinding through a degraded session every time. I dig into the mechanism behind this — why absolute tokens matter more than percentage — in [[context-degradation-theory|a follow-up post]].

**Load only what you need, when you need it.** The practical fix is [[brainstorm-is-training-execution-is-inference|separating brainstorm from execution]]. Don't preemptively load all your papers. Load the specific paper (or section) relevant to your current question. If you're debugging analysis code, load the relevant functions, not the full script. Treating context like scarce memory — even when you have 1M tokens available — produces better results.

**Watch the absolute count, not the percentage.** Claude Code's status bar shows percentage of the context window used. That's the wrong number. 3% of 1M is 30K tokens — already in the zone where the research shows degradation starting. The heuristic that works: when you've accumulated 30–50K tokens of content and conversation, it's time for a fresh session. The bar will look almost empty. The fresh context will still be better.

---

## Sources

- Liu, N. F., Lin, K., Hewitt, J., Paranjape, A., Bevilacqua, M., Petroni, F., & Liang, P. (2023). **Lost in the Middle: How Language Models Use Long Contexts.** *Transactions of the Association for Computational Linguistics*, 12, 157–173. https://arxiv.org/abs/2307.03172

- Laban, P., Hayashi, H., Zhou, Y., & Neville, J. (2025). **LLMs Get Lost In Multi-Turn Conversation.** arXiv:2505.06120. https://arxiv.org/abs/2505.06120

- Du, Y., Tian, M., Ronanki, S., Rongali, S., Bodapati, S. B., Galstyan, A., Wells, A., Schwartz, R., Huerta, E. A., & Peng, H. (2025). **Context Length Alone Hurts LLM Performance Despite Perfect Retrieval.** *Findings of EMNLP 2025*. arXiv:2510.05381. https://arxiv.org/abs/2510.05381

- Chroma Research (2025). **Context Rot: How Increasing Input Tokens Impacts LLM Performance.** https://research.trychroma.com/context-rot

- Anthropic (2025). **Context Windows — Claude API Documentation.** https://platform.claude.com/docs/en/build-with-claude/context-windows

---

*This is the first post in a series on using Claude Code for academic research. The next posts cover agent workflows for paper review, a methodology auditor persona, and the theory behind why absolute token count — not percentage — drives context degradation.*

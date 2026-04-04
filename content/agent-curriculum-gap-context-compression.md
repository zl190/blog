---
title: "The Most Important Agent Problem Nobody Teaches"
created: 2026-04-02
date: 2026-04-02
tags: [AI, berkeley, context-windows, agent-curriculum, mooc]
topics:
  - AI
qc: passed
spec: "Berkeley's 3-semester agent curriculum has zero coverage of context compression, the mechanism production agents use to survive | creator — audited all course iterations against CC source | practitioners building agents"
---

# The Most Important Agent Problem Nobody Teaches

45 lectures across 3 semesters. Zero mention of context compression.

I've been auditing Berkeley's LLM agent curriculum — all three iterations: CS294 Fall 2024 (12 lectures), the advanced CS294/194-280 in Spring 2025, and the renamed CS294 "Agentic AI" course in Fall 2025. By my count, that's roughly 45 lectures combined covering RAG, tool use, multi-agent coordination, safety, evaluation benchmarks, game theory, embodied agents, agent economics, and MCP/A2A protocols. It's a serious curriculum. The course is organized by Dawn Song at Berkeley, with guest lecturers including Shunyu Yao (OpenAI), Noam Brown (OpenAI), and Clay Bavor (Sierra).

And not one of them covers what happens when your agent's context window fills up.

---

## What context compression actually is

When you run an agent for long enough — debugging a codebase across dozens of tool calls, running an autonomous coding session, or just keeping a session open all day — the conversation history grows. At some point it hits the context window limit, typically around 30-50K tokens depending on the model and system prompt overhead. The naive approach is to fail: throw an error, ask the user to start over, lose all state.

Production agents don't do that. They compress.

Context compression is the process of replacing a long message history with a shorter representation that preserves the information needed to continue the task. Anthropic published an engineering blog post about "context rot" — the documented phenomenon where recall accuracy decreases as token count increases, which means a full context window is actually *worse* than a compressed one, not just equivalent.

Claude Code, which is Anthropic's own production agent, has three separate mechanisms for this: `compact.ts` (triggered manually or at session boundaries), `autoCompact.ts` (triggered automatically as context approaches the window limit), and `microCompact.ts` (lightweight, used in background compaction paths). Three different files, three different triggers, three different tradeoffs.

The actual compaction prompt in the TypeScript source asks an LLM to analyze the conversation across multiple dimensions: the user's primary intent, key decisions made, tools used and outcomes, files modified, errors encountered, pending tasks, and important context to preserve. The output is a structured summary that replaces the full history. From my reading of the source, sub-agents return condensed summaries rather than full transcripts — the parent context receives a compressed version of the sub-agent's work.

---

## What Berkeley covers vs. what it skips

To be precise about this: the Berkeley courses are excellent for what they cover. They're not shallow. The Fall 2024 course formalizes the ReAct framework rigorously (Â = A ∪ L, where reasoning is a first-class action that updates context but not environment). The Spring 2025 advanced course covers the game-theoretic foundations of multi-agent systems. The Fall 2025 course features Noam Brown on game theory in multi-agent settings, covers agent economics themes across multiple lectures, and introduces the MCP/A2A protocol distinctions.

The coverage table for context compression, across all three semesters:

| Semester | Context Compression? | What's covered instead |
|----------|----------------------|------------------------|
| Fall 2024 | No | — |
| Spring 2025 | No | HippoRAG (external retrieval) |
| Fall 2025 | No (unconfirmed for Oct 1 lecture) | Memory = knowledge management |

The closest lecture title in the entire three-year run is "Memory and Knowledge Management" in Fall 2025. Based on the Spring 2025 version of this topic (Yu Su, L5), which covered HippoRAG — a system for long-term knowledge retrieval using external vector stores — I expect similar content. The Fall 2025 Oct 1 lecture content is not yet confirmed, but HippoRAG is genuinely interesting work. It is not context compression.

---

## Why the gap matters

If you're building a production agent that runs for more than a few turns, context limits are not an edge case. They're the expected case. A code debugging session easily hits 50+ tool calls. An autonomous research task can run for hours. Every single one of those sessions will hit the context window, and what happens at that point determines whether your agent gracefully continues or loses all state and fails.

Anthropic built three separate mechanisms for handling this in their flagship coding agent. That's not over-engineering — that's a team discovering through production experience that one mechanism wasn't enough. The `autoCompact.ts` handles the normal case (triggering when context approaches the window limit minus a fixed token buffer); `microCompact.ts` handles situations where even the compaction itself needs to be lightweight; `compact.ts` handles explicit user-triggered or session-boundary compaction. Different thresholds, different prompt strategies, different tradeoffs between fidelity and token cost.

There's also a subtler problem: context compression isn't just about length. It's about *what you preserve*. A naive summary loses architectural decisions made early in the session. It loses the reasoning behind a rejected approach. The Anthropic engineering blog specifically flags preserving "architectural decisions" and "unresolved bugs" as key requirements. That's editorial judgment embedded in infrastructure.

---

## Memory is not the same problem

The reason "Memory and Knowledge Management" doesn't count: it's solving a different problem.

HippoRAG, and external memory systems generally, are about *long-term persistence*. How do you remember something from a session three weeks ago? The answer involves external vector stores, retrieval scoring functions (Berkeley's L2 notes give the formula: recency × importance × relevance), and RAG pipelines. This is valuable. Production agents need long-term memory too.

But context compression is about *short-term management*. You have a single session in progress, right now, and the window is filling up. There's no external database lookup that helps you here. You need to compress the current conversation history and continue — without losing the thread of what you were doing.

The Berkeley curriculum teaches the first. Production needs the second too. The Shunyu Yao lecture in Fall 2024 is actually explicit about this split: short-term memory = context window (append-only, limited, does not persist); long-term memory = external storage (read/write, persists). He identifies them as distinct mechanisms with different architectures. But neither the Fall 2024 course nor either successor ever addresses what to do when the short-term store fills up.

---

## The practitioner's gap

I started this audit while building a study journal that reads production agent source code and rebuilds each layer from scratch. The goal was to use Berkeley's curriculum as a cross-validation source — if I understood a layer correctly, there should be a corresponding lecture that formalizes the same concept.

Four out of five layers had a match. The tool loop maps to Yao's ReAct formalization. The memory architecture maps to the short-term/long-term split in L2. The coordinator pattern maps to Chi Wang's multi-agent orchestration framework from the AutoGen lecture. The permission system maps to Ben Mann's ASL framework in L11.

Context compression: nothing. The only primary sources I could find were the production source code itself and Anthropic's engineering blog post on context engineering. For practitioners building agents, those are the right sources anyway. But it's telling that a curriculum this comprehensive, maintained across three semesters by instructors actively building production systems, has a consistent blind spot in exactly this area.

If you're building agents and hitting context limits, the curriculum won't help you yet. The best sources I've found are Anthropic's engineering post "Effective Context Engineering for AI Agents" and the production source code itself. Production is running ahead of the courses right now.

---

*This is part of a series on what production agent source code reveals that courses don't cover. Subscribe to get the next issue.*

---
title: "Brainstorm Is Training, Execution Is Inference"
created: 2026-01-27
date: 2026-01-27
tags: [AI, claude-code, context-windows, workflow]
topics:
  - AI
qc: passed
---

# Brainstorm Is Training, Execution Is Inference

*Why your AI coding sessions degrade — and the workflow that fixes it*

---

Every brainstorming session with an LLM follows the same arc. The first 20 minutes are electric. Ideas build on each other, the model riffs on your half-formed thoughts, you explore directions you hadn't considered. Then around the 30-minute mark, something shifts. The model starts repeating itself. It forgets constraints you established earlier. It generates code that contradicts decisions you made ten messages ago.

You're not imagining it. Microsoft measured it: multi-turn conversations degrade 39% compared to single-turn across 15 models, 6 tasks, and 200K+ conversations (Chiang et al. 2025). The longer you talk, the worse it gets.

I kept running into this while building cc-fuel-gauge, a context degradation monitor for Claude Code. I'd brainstorm an architecture for an hour, arrive at a clear design, then ask the model to implement it — and get back code that ignored half the decisions we'd just made. The brainstorming was great. The execution was garbage. Same session, same model, wildly different quality.

The explanation clicked when a collaborator framed it as: brainstorm is training, execution is inference.

## The Analogy

In machine learning, training and inference are separate phases with different requirements. Training is noisy, exploratory, high-volume. You feed the model millions of examples, most of which are redundant, and the model compresses them into weights. Inference uses those weights to produce output. You'd never do inference with the training data still attached — the whole point of training was to extract the signal and throw away the noise.

Multi-turn brainstorming with an LLM is the same structure. Brainstorming is your training phase: you explore the idea space, generate options, reject bad paths, refine good ones. The value is in the divergent exploration. But the resulting conversation transcript is training data, not weights. It's full of dead ends, corrections, tangents, emotional reactions, and filler messages ("yeah that makes sense", "hmm let me think", "no not that").

When you then ask the model to execute within that same session, you're doing inference with the training data still attached. Every dead end, every rejected idea, every "actually wait" — it's all sitting in the context window, competing for attention with the final decisions. The model has to figure out which parts of the conversation are conclusions and which are noise. At 50K+ tokens, it increasingly fails at this.

## Three Causes of Multi-Turn Degradation

Microsoft's paper identified the problem but not the mechanism. From what I've observed and read, multi-turn degradation has three independent causes:

**Token accumulation.** More tokens in the context means more attention dilution. System prompt instructions that worked at 5K tokens get drowned at 50K. I've written about [[context-degradation-theory|why this happens mechanistically]] — it's absolute token count, not percentage. This is the mechanism that broke my YAML generator.

**Behavioral path dependence.** This is the one people miss. The model doesn't just lose track of information — it accumulates behavioral momentum. If you spent 20 messages exploring a bad approach before pivoting, the model has 20 messages worth of "evidence" that the bad approach is what you want. The conversation history biases it toward the wrong prior. Corrections in message 21 have to overcome the inertia of messages 1-20.

**Chat template overhead.** Every message in a multi-turn conversation carries structural tokens — role markers, turn boundaries, formatting. In my testing, a 30-turn conversation can have 2-3K tokens of pure template overhead. These tokens contribute to dilution without contributing any signal.

Brainstorming makes all three worse. It's long (token accumulation), exploratory (path dependence toward dead ends), and chatty (template overhead from short back-and-forth messages).

## The Fix: Phase Separation

The workflow that works: brainstorm, then distill, then execute in a clean context.

**Phase 1: Brainstorm.** Use the LLM as a thinking partner. Explore freely. Don't worry about context length — brainstorming tolerates degradation because the value is in divergent exploration, not precision. Even a somewhat degraded model can generate useful ideas.

**Phase 2: Distill.** This is the critical step that most people skip. Before executing, compile the brainstorming output into a structured brief. What was decided? What's the plan? What are the constraints? Kill everything else — the tangents, the dead ends, the "actually let's go back to" messages.

This is the compression step. Training data → weights. The brief IS your weights.

**Phase 3: Execute.** Start a fresh session. Feed it only the brief. The model now has a clean context with nothing but decisions and instructions. No path dependence, no dead ends, no noise. Execution quality returns to near-baseline.

I've been running this workflow for a month on cc-fuel-gauge development. The difference is night and day. Brainstorm sessions can run long — 40, 50 messages — because I'm not going to execute in that context anyway. Execution sessions stay short and precise because they start from a clean brief. For practical implementation of this workflow, see [[claude-code-tips-i-wish-i-knew-sooner|my Claude Code tips]].

## Distillation Is Not Summarization

The temptation is to ask the LLM to "summarize this conversation." Don't. Summarization preserves everything in miniature. Distillation is selective extraction — it keeps conclusions and throws away the process that produced them.

A summary of a brainstorming session includes: "We first considered approach A, which had drawbacks X and Y. We then explored approach B, which..." This is training data with a compression ratio applied. The dead ends are still there, just shorter.

A distillation says: "Decision: Use approach C. Constraints: must handle X. Next steps: implement Y then Z." The dead ends are gone. Only signal remains.

The other critical mistake: running distillation in the same degraded session. If the model is already degraded at 50K tokens, asking it to distill at 50K tokens produces a degraded distillation. You've compressed the noise alongside the signal. For cc-fuel-gauge, I solved this by having a fresh model (Qwen3.5-4B running locally) read the raw transcript and generate the brief. The extraction model never saw the brainstorming process — only its output.

## When Not to Separate

This workflow has overhead. Starting a new session, writing a brief, loading context — it adds 5-10 minutes. For tasks that fit in a single focused session (< 20 messages, < 15K tokens), just do them. The degradation at that scale is marginal.

The separation pays off when:
- Brainstorming went past 30 messages
- You changed direction more than twice during the session
- The final plan is significantly different from where you started
- Execution requires precision (code generation, structured output, specific formatting)

## The Deeper Point

Context degradation isn't a bug in LLMs. It's a fundamental property of finite attention over growing sequences. You can't fix it by telling the model to "pay more attention" or by adding "IMPORTANT:" to your prompts. Those are prompt engineering solutions to a context engineering problem.

The fix is architectural: separate the phases that have different quality requirements. Brainstorming tolerates noise. Execution requires signal. Don't make them share a context window.

Your LLM isn't getting dumber as the conversation progresses. It's doing inference with training data attached. Distill your brainstorming into a brief, start fresh, and watch the quality come back.

---

*References:*
- Chiang et al. (2025). "LLMs Get Lost In Multi-Turn Conversation." arXiv:2505.06120
- Previous post: [Context Degradation Ate My YAML](context-degradation-ate-my-yaml.md)
- cc-fuel-gauge: github.com/zl190/cc-fuel-gauge

*Your brainstorming session produced great ideas and garbage code? The model isn't broken — you're doing inference with training data.*

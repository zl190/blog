---
title: "I Was Micromanaging My AI Agent"
created: 2026-04-03
date: 2026-04-04
tags: [AI, agent-design, management, sycophancy, context-degradation, autonomy]
topics:
  - AI
qc: passed
spec: "Mid-execution human interventions degrade agent output via context pollution + sycophantic adaptation. Fix: plan upfront, enforce via hooks, QC after. 6 citations (Liu 2023, Hong 2025, Kim 2025, Wang 2024, Hackman 1976, TextGrad) + personal session data | creator — synthesized management + LLM literatures with 22-session personal evidence | practitioners managing AI agent workflows"
---

# I Was Micromanaging My AI Agent

Around session 18 I realized I had been hovering. The agent was mid-task — planning a multi-file refactor — and I kept dropping messages into the thread. "Check that first." "Actually, do the simpler version." "Wait, before that, can you also —"

The session was a mess. Tasks spiraled. Direction changed twice. The output was technically functional but barely resembled the original spec. I spent more time re-explaining context than the agent spent executing. And the session that followed — session 22, where I stayed silent for 20 minutes while the agent worked — completed 6 independent tasks at 0.3 tasks/minute with zero blocks and no direction changes.

The difference wasn't the model. It wasn't the task difficulty. It wasn't even the prompt. It was whether I was in the loop during execution.

I had spent months building agent infrastructure — hooks, harnesses, context management — and then completely undermined it by treating execution sessions like Slack threads.

---

There's a well-documented phenomenon in LLM research called context degradation. The most cited form is positional: Liu et al. [2023] showed that language models perform significantly worse when relevant information is placed in the middle of a long context window rather than at the beginning or end. The "lost in the middle" effect is robust across model sizes and task types. What's in the middle gets attended to less.

Multi-turn sycophancy is a different but related failure mode. Hong et al. [2025] measured how model responses shift across conversation turns when users express disagreement or preference. Models don't just adapt — they systematically capitulate. Kim and Khashabi [2025] showed the same dynamic in evaluation tasks: when users rebut an LLM's judgment, the model reverses its position even when the rebuttal contains no new information. The user pushed back. The model caved.

These two failure modes compound in interactive sessions. Every message I drop into an execution thread adds to the middle of the context, not the beginning. My clarifications get attended to less. But my corrections and redirections trigger sycophantic adaptation — the model shifts its plan toward what it perceives I prefer, not necessarily toward what will produce the best output. I was contaminating the context while also providing a pressure signal the model was trained to obey.

---

The experiment wasn't controlled. I don't have enough sessions to claim statistical significance, and the tasks differed across sessions. I'm aware of those limitations. But the directional evidence was clear enough that I changed my behavior.

Silent execution sessions consistently outperformed interactive ones on throughput and coherence. The tasks that diverged most from spec were in sessions where I'd been most active. The sessions where I'd done planning upfront and then left the agent alone came back with outputs I needed to change least.

The failure mode I kept running into had a specific shape: I would ask for something, see the first 20% of the agent's approach, form a judgment that it was wrong, and intervene. The intervention would add context pollution [see: blog-context-pollution.md]. The agent would adapt — usually by producing a hybrid of its original plan and my correction that satisfied neither intent. Then I'd intervene again.

In management terms: I was reviewing the draft before it was a draft.

---

Good management — of people — isn't watching. The research on this is older and more settled than the AI literature. Hackman and Oldham's job characteristics model established in 1976 that autonomy is a direct predictor of intrinsic motivation and work effectiveness. When workers have low task autonomy, performance suffers not because they're less capable, but because the control signal itself degrades the process. Monitoring creates incentives to perform for the monitor rather than for the outcome.

This isn't abstract. Ask any junior researcher who has had a micromanaging advisor: the problem isn't that they're corrected. It's that they stop making judgment calls, because every judgment call is subject to override. They wait for instructions rather than proceeding on best judgment. The work slows down. The outputs get safer and blander. And the advisor, monitoring more closely to compensate, misinterprets the slowdown as evidence that more monitoring is needed.

The same loop plays out with agents. I was checking in to stay informed. The check-ins triggered plan changes. The plan changes required more check-ins. By the time I left agents alone, I'd already internalized a workflow that made silence feel irresponsible.

---

The fix I landed on has three parts, and none of them involve talking to the agent during execution.

**Planning.** Before any non-trivial session, I write a brief. What are the tasks, what are the constraints, what are the explicit non-goals. This goes into the system prompt or the first message. The agent has the context it needs before the first tool call. I don't need to add context mid-session because the context was already there.

**Hooks, not interrupts.** The way to enforce constraints during execution isn't to monitor and message — it's to build them into the harness. Hooks that check intermediate outputs, gates that block certain operations, structured output requirements that force a specific format before continuing. Wang et al. [2024] describe this as a core distinction in agentic architectures: environment-level constraints versus instruction-level constraints. Instruction-level constraints (things I say in the thread) require the model to interpret and comply. Environment-level constraints (things the harness enforces) don't depend on the model's willingness to comply. They're structural.

TextGrad [Yuksekgonul et al., 2024] formalized a related principle from a different angle: in a learning pipeline, the component that detects problems must be architecturally separate from the component that generates solutions. If they share context, the detection signal becomes contaminated by the generation's priors. Applied to my workflow: my mid-session interventions were functioning as instruction-level constraints in a context already shaped by the model's in-progress plan. The detection (I see a problem) and the synthesis (here's what to change) were happening in the same conversation thread. The result was exactly what TextGrad was designed to prevent.

**QC, not hovering.** After execution, I run an independent audit. A separate model, fresh context, no shared session history with the builder. This is where correction belongs — after the task is complete, evaluated against what was specified, not against what I thought I saw at the 20% mark. The 22/22 post [see: blog-2222-is-a-lie.md] covers the failure mode when QC is skipped or done by the same process that generated the output. The management lesson is identical: peer review beats manager review, and both beat no review.

---

The thing that makes this hard is that micromanagement feels responsible. When I stay silent during a 20-minute agent session, I feel like I'm not doing my job. The agent might go in the wrong direction. It might waste compute. It might make a decision I would have caught in 30 seconds if I'd been watching. I should be available to course-correct.

That feeling is real and normal. It is also pointing in exactly the wrong direction.

But course-correcting mid-execution is exactly the wrong intervention point. The model has already allocated context budget, built a partial plan, made implicit commitments to previous tool calls. My correction adds noise to that context, triggers sycophantic reweighting, and produces a hybrid output that's worse than either the original plan or the corrected one. I would have been better off with a bad first draft I could QC properly.

The autonomy literature and the LLM context literature converge on the same design principle: execution quality is highest when the executor has clean context and full authority within a bounded scope, and when evaluation happens after completion by someone who wasn't part of the process. The management layer's job is to define the scope and run the evaluation — not to watch the work.

One sentence: good agent management looks exactly like good people management — clear brief, sufficient resources, and an independent QC gate, with silence in between.

---

## Citations

1. Liu, N. F., Lin, K., Hewitt, J., Paranjape, A., Bevilacqua, M., Petroni, F., & Liang, P. (2023). Lost in the Middle: How Language Models Use Long Contexts. *Transactions of the Association for Computational Linguistics*, 12, 157–173. DOI: 10.1162/tacl_a_00638

2. Hong, J., Byun, G., Kim, S., & Shu, K. (2025). Measuring Sycophancy of Language Models in Multi-turn Dialogues. *Findings of the Association for Computational Linguistics: EMNLP 2025*. DOI: 10.18653/v1/2025.findings-emnlp.121

3. Kim, S. W., & Khashabi, D. (2025). Challenging the Evaluator: LLM Sycophancy Under User Rebuttal. *Findings of the Association for Computational Linguistics: EMNLP 2025*. DOI: 10.18653/v1/2025.findings-emnlp.1222

4. Wang, L., Ma, C., Feng, X., Zhang, Z., Yang, H., Zhang, J., Chen, Z., Tang, J., Chen, X., Lin, Y., Zhao, W. X., Wei, Z., & Wen, J.-R. (2024). A survey on large language model based autonomous agents. *Frontiers of Computer Science*. DOI: 10.1007/s11704-024-40231-1

5. Hackman, J. R., & Oldham, G. R. (1976). Motivation through the design of work: Test of a theory. *Organizational Behavior and Human Performance*, 16(2), 250–279. DOI: 10.1016/0030-5073(76)90016-7

6. Yuksekgonul, M., Bianchi, F., Boen, J., Liu, S., Huang, Z., Guestrin, C., & Zou, J. (2024). TextGrad: Automatic "Differentiation" via Text. arXiv preprint. DOI: 10.48550/arxiv.2406.07496

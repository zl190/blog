---
title: "Agent Teams for Academic Research: From Slides to Working Code"
created: 2026-03-24
date: 2026-03-27
tags: [AI, claude-code, agent-workflows, research-methodology, tmux]
topics:
  - AI
qc: passed
spec: "Agent team architectures from a conference slide can be implemented with tmux + claude -p today | contributor — extends Spina's ClaudeCodeTools framework with working bash commands and cost estimates | researchers and academics wanting to run parallel paper reviews"
---

# Agent Teams for Academic Research: From Slides to Working Code

At a recent UTS Business School seminar, Alessandro Spina showed a beautiful diagram: an Orchestrator agent fanning out to four specialists — Code Auditor, Prose Editor, Stats Checker, Graphics Reviewer — all running in parallel, then merging their reports back up. The slide was compelling. Then came the honest footnote: he hadn't actually used agent teams much in practice.

That gap — between a slide that makes sense architecturally and code that runs on your machine — is exactly what this post closes. By the end you'll have working bash commands, realistic cost estimates, and a convergence loop you can run on your next paper draft. Alessandro's full framework is at [github.com/aspi6246/ClaudeCodeTools](https://github.com/aspi6246/ClaudeCodeTools) if you want the starting point.

---

## What an Agent Team Actually Is

The diagram on that slide is just `tmux` + `claude -p`. Each "agent" is a Claude process running a focused prompt in its own terminal pane, with no shared memory between them. The Orchestrator writes output files; specialists read those files and write their own; the Orchestrator reads back and merges. That's it.

The value isn't magic coordination — it's focused context. A reviewer that reads only your methods section doesn't burn tokens re-reading your literature review. Parallel execution means four tasks that would take 8 minutes sequentially finish in 2. And because each specialist sees a clean context with no conversation history, you get genuinely independent opinions.

---

## Setting Up a 3-Agent Paper Review Team

Here's a concrete setup: you have a paper draft at `paper.pdf` and you want three parallel reviews — methodology, prose, and statistics.

**Step 1: Launch the sessions**

```bash
# Create three background tmux sessions, one per reviewer
tmux new-session -d -s reviewer-methods
tmux new-session -d -s reviewer-prose
tmux new-session -d -s reviewer-stats

# Make a directory for their outputs
mkdir -p /tmp/review
```

**Step 2: Dispatch to reviewers**

```bash
# Methodology reviewer
tmux send-keys -t reviewer-methods \
  "claude -p 'You are a research methodology expert. Read paper.pdf and write a structured critique of the research design, identification strategy, and causal claims. Be specific — cite section and page numbers. Save your report to /tmp/review/methods.md.' \
  --dangerously-skip-permissions \
  --max-budget-usd 0.50" Enter

# Prose reviewer
tmux send-keys -t reviewer-prose \
  "claude -p 'You are an academic editor. Read paper.pdf and critique the writing: clarity, argument flow, jargon overload, and abstract quality. Suggest specific rewrites for the three weakest sentences. Save to /tmp/review/prose.md.' \
  --dangerously-skip-permissions \
  --max-budget-usd 0.50" Enter

# Statistics reviewer
tmux send-keys -t reviewer-stats \
  "claude -p 'You are a statistician reviewing an empirical paper. Read paper.pdf. Check: are standard errors clustered appropriately? Are the right controls included? Are any regression tables missing key diagnostics? Save to /tmp/review/stats.md.' \
  --dangerously-skip-permissions \
  --max-budget-usd 0.50" Enter
```

**Step 3: Wait and collect**

```bash
# Poll until all three outputs exist
while [ ! -f /tmp/review/methods.md ] || \
      [ ! -f /tmp/review/prose.md ]   || \
      [ ! -f /tmp/review/stats.md ]; do
  echo "Waiting for reviewers..."; sleep 30
done

# Orchestrator merges
claude -p "Read /tmp/review/methods.md, /tmp/review/prose.md, and /tmp/review/stats.md.
Synthesize into a prioritized action list: the top 5 issues by impact on acceptance probability,
with the reviewer's original language. Save to /tmp/review/synthesis.md." \
  --dangerously-skip-permissions \
  --max-budget-usd 0.50
```

You now have a synthesis report without any single agent drowning in someone else's concerns.

---

## The Convergence Loop: Critic + Fixer

The review team above gives you a one-shot report. The convergence loop goes further: it iterates until the paper stops improving. This is how I run it on my own drafts.

**The Critic must start fresh each round.** If it remembers its prior review, it anchors on its previous score and isn't truly independent. Each `claude -p` call starts with zero context, so you get this for free.

```bash
#!/usr/bin/env bash
# converge.sh — Critic/Fixer loop for paper drafts

# Convert PDF to markdown first (one-time — Claude cannot write PDF files)
pandoc paper.pdf -o paper.md

PAPER="paper.md"
MAX_ROUNDS=5
PREV_SCORE=0
PLATEAU=0
ROUND=0

while [ $ROUND -lt $MAX_ROUNDS ]; do
  ROUND=$((ROUND + 1))
  echo "=== Round $ROUND ==="

  # CRITIC: blind review, outputs score + issues
  # --dangerously-skip-permissions: skips interactive approval prompts in non-interactive shells
  claude -p "You are a peer reviewer for a finance journal. Read $PAPER.
  Score the paper 1.0-5.0 on: (1) contribution, (2) methodology, (3) writing.
  Output ONLY valid JSON: {\"score\": 3.8, \"issues\": [\"issue 1\", \"issue 2\"]}.
  No other text." \
    --dangerously-skip-permissions \
    --max-budget-usd 0.75 \
    > /tmp/review/round_${ROUND}_critic.json

  SCORE=$(python3 -c "import json,sys; d=json.load(open('/tmp/review/round_${ROUND}_critic.json')); print(d['score'])")
  echo "Score: $SCORE"

  # Plateau detection
  if [ "$SCORE" = "$PREV_SCORE" ]; then
    PLATEAU=$((PLATEAU + 1))
    [ $PLATEAU -ge 2 ] && echo "Plateau reached. Stopping." && break
  else
    PLATEAU=0
  fi
  PREV_SCORE=$SCORE

  # FIXER: reads critic output, applies targeted fixes
  claude -p "Read $PAPER and /tmp/review/round_${ROUND}_critic.json.
  Apply fixes for every issue listed. Preserve the paper structure.
  Save revised paper to paper_r${ROUND}.md.
  Do not return until every issue has been addressed or explicitly noted as requiring author judgment." \
    --dangerously-skip-permissions \
    --max-budget-usd 1.00

  PAPER="paper_r${ROUND}.md"
done

echo "Final paper: $PAPER (score: $PREV_SCORE)"
```

The loop stops on plateau (two consecutive rounds with the same score) or after `MAX_ROUNDS`. The Fixer only sees the current issues list — it doesn't carry a narrative of what was tried before, which prevents it from making defensive non-changes.

The first time I ran this, the Fixer agent returned without making a single change because the prompt said "apply fixes" but didn't define what "done" meant — it interpreted finishing the read as finishing the task. I had to add an explicit instruction: "Do not return until every issue has been addressed or explicitly noted as requiring author judgment." Without that line, the loop advances to the next round on a paper that hasn't changed.

---

## An R Example: Checking Regression Robustness

For empirical researchers using R, you can send agent tasks directly at R scripts. Suppose you have `analysis.R` and you want to check whether your standard error choices are defensible:

```bash
claude -p "Read analysis.R. Find every lm() or feols() call.
For each regression, check: (1) Are SEs clustered at the right level?
(2) Is there a heteroskedasticity-robust alternative reported?
(3) Are fixed effects consistent with the identification strategy described in the comment above the call?
Output a table in markdown: | Regression | SE type | Issue | Suggested fix |
Save to /tmp/review/se_audit.md." \
  --dangerously-skip-permissions \
  --max-budget-usd 0.40
```

In a chat window, Claude will happily invent functions that don't exist in your R package. Running this as a script call keeps it focused on the file it was given — no browser, no internet search, just the code it was told to read.

---

## Cost Awareness

Parallel agents are fast, but the bill is per-agent. Some realistic estimates with Claude Sonnet:

| Task | Typical cost |
|------|-------------|
| Single reviewer (5 turns, 10-page paper) | $0.20–0.50 |
| 3-agent parallel review team | $0.60–$1.50 |
| One Critic + Fixer round | $1.00–$2.00 |
| Full convergence loop (4 rounds) | $4–8 |

Use `--max-budget-usd` on every agent call. I set it conservatively and raise it only if the agent hits the cap on a legitimate task. A runaway agent that re-reads a 50-page PDF five times costs more than expected.

For a grant submission or RFS-caliber paper, $5–10 of automated review is cheap relative to a weekend of manual revision. For a quick robustness check, a single $0.40 audit agent is the right tool.

---

## When Agents Get Stuck: The PUA Trick

Agents sometimes give up. They'll say "I cannot access this file" when the file is right there, or produce a half-finished report and call it done. The [PUA](https://github.com/tanweai/pua) project addresses this with a prompt pattern that treats the agent's refusal to try harder as a performance failure, forcing it to enumerate every untried option before stopping. I tested whether pushing agents harder improves output in [[i-ab-tested-pua-plugin|my PUA A/B test]].

The practical version: if your fixer agent returns without making changes, re-run it with an explicit instruction like "Do not return until every issue in the critic report has been addressed. If you cannot fix an issue directly, explain what a human author would need to do." This prevents the passive non-response that's the most common failure mode.

---

## Three Things the Slide Diagram Doesn't Tell You

The 4-agent diagram with Code Auditor, Prose Editor, Stats Checker, and Graphics Reviewer is real and runnable. But from practice, a few refinements:

Three focused reviewers with tight prompts outperform five diffuse ones. Every agent you add means another collect-and-merge step, more potential for overlapping findings, and a longer wait before you have a synthesis. The useful upper bound is around three.

The part that surprised me most: specialization matters more than the architecture. "Review the paper" is the worst possible prompt — it gives the agent no constraint and you get a response that could have come from any reader. "Check whether the standard errors in Table 3 are consistent with the clustering level described in footnote 8" is a prompt that only an agent that has actually read your paper can answer. The more specific the task, the more the parallel architecture earns its cost. A focused agent running a narrow check on a single table outperforms a general reviewer running over the whole paper. If you run this and it feels underwhelming, the prompt is almost always the problem.

The Orchestrator step looks optional — you have three reports, just read them yourself. Don't. Raw reviewer outputs have overlapping issues and conflicting priorities. For a deeper quality audit beyond team review, I built [[the-researcher-persona|TheResearcher persona]]. A second Claude call that reads all three and ranks the top 5 issues by acceptance probability takes 30 seconds and costs $0.25. That step is what turns three reviews into an action list.

The gap between the slide and working code is mostly just writing the bash wrapper and trusting that `tmux` + `claude -p` is the whole infrastructure. You don't need a cloud orchestration platform. You need a text editor and a terminal.

---

## Quick Start

```bash
# Clone Alessandro's tools for the CLAUDE.md templates
git clone https://github.com/aspi6246/ClaudeCodeTools

# Run the 3-agent review on your paper
mkdir -p /tmp/review
# (paste the tmux commands from above)
# Grab synthesis.md when done
cat /tmp/review/synthesis.md
```

The orchestrator-specialist pattern scales from a single paper review to a recurring pre-submission gate — same commands, different prompts.

---

*This is the second post in a series on using Claude Code for academic research. The other posts cover context window management, a methodology auditor persona, and the theory behind context degradation mechanisms.*

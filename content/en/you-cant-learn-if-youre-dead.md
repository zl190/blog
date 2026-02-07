---
title: "You Can't Learn If You're Dead"
type: draft
format: blog
status: published
published_url: https://zl190.github.io/blog/posts/you-cant-learn-if-youre-dead/
published_date: 2026-01-27
created: 2026-01-27
tags: [tcp, networking, probability, risk-management, simulation]
---

# AIMD-vs-Martingale, Who will win?

## Hook

While studying TCP congestion control for my computer networks course, I stumbled onto something unexpected: the Internet's 40-year-old traffic algorithm contains profound wisdom about gambling, investing, and life decisions.

TCP uses a strategy called AIMD (Additive Increase, Multiplicative Decrease):
- When things go well: increase slowly (+1)
- When things go wrong: retreat fast (÷2)

This is the exact opposite of the famous Martingale gambling strategy:
- When you win: reset to base bet
- When you lose: double down (×2)

One powers the Internet. The other bankrupts casinos' victims. I ran simulations to understand why.

---

## The Setup

**Martingale's seductive logic:**

You bet $1. Lose. Bet $2. Lose. Bet $4. Lose. Bet $8. Win!

You just recovered all losses ($1+2+4=$7) plus profit ($1). Genius, right?

The problem: that sequence (1→2→4→8→16→32→64→128) grows exponentially. A few bad streaks and you're betting your house to recover $1.

**AIMD's boring logic:**

You bet $1. Win. Bet $2. Win. Bet $3. Lose. Bet $1.5. Lose. Bet $1.

Slow growth, fast retreat. Never bet big. Survive to play another day.

Which is better? I wrote code to find out.

---

## Experiment 1: Survival

**Setup:** 1000 simulated gamblers, $100 each, 500 rounds, 48% win probability (slight house edge).

| Strategy | Bankruptcy Rate | Survivors |
|----------|-----------------|-----------|
| Martingale | 78.1% | 219/1000 |
| AIMD | 1.9% | 981/1000 |

AIMD is **40x safer**. Nearly everyone survives.

But wait—what about the Martingale survivors?

---

## Experiment 2: Profit

"Sure, most Martingale players go broke. But the winners must win BIG, right?"

| Strategy | Avg Survivor Profit |
|----------|---------------------|
| Martingale | $195 |
| AIMD | -$39 |

The Martingale survivors did great! This is what you hear about—the success stories.

But this is **survivor bias**. We're ignoring the 78% who lost everything.

**Total profit across ALL players:**

| Win Probability | Martingale | AIMD |
|-----------------|------------|------|
| 48% (house edge) | -$35,332 | -$39,688 |
| 50% (fair) | +$4,660 | +$2,193 |
| 52% (player edge) | +$40,830 | **+$53,872** |

When conditions favor you, AIMD wins by 32%. Why? Because **survival lets you exploit favorable conditions**. Dead players can't profit.

---

## Experiment 3: Uncertainty

Here's the key insight: **you rarely know if conditions favor you**.

- Network congestion: unpredictable
- Casino odds: usually against you
- Markets: uncertain
- Life: ???

| Strategy | Requires | If Wrong |
|----------|----------|----------|
| Martingale | Predict favorable conditions | Bankrupt |
| AIMD | Nothing | Survive, adapt |

AIMD doesn't need to predict. It works regardless:
- Bad conditions → survive, wait
- Good conditions → profit

This is **robustness to uncertainty**—arguably more valuable than optimality under known conditions.

---

## Experiment 4: Learning

"What if we add intelligence? Bayesian learning to estimate win probability?"

| Strategy | Without Learning | With Learning |
|----------|------------------|---------------|
| Martingale bankruptcy | 78% | 47% |
| AIMD profit (favorable) | +$54 | **+$108** |

Learning helps Martingale survive better (78%→47%). But still 50% bankruptcy—**learning can't save a fundamentally flawed strategy**.

Learning doubles AIMD's profit. Why?

**You can't learn if you're dead.**

```
AIMD: survive → gather data → learn → adapt → profit
Martingale: crash → no data → can't learn → dead
```

Martingale often goes bankrupt before gathering enough data (20+ observations) to learn anything useful. The exponential betting is faster than the learning.

AIMD survives long enough to actually use what it learns.

---

## Why TCP Uses AIMD

Back to the Internet. When a network packet is lost, it could mean:
- Temporary congestion (back off, try again)
- Persistent overload (seriously back off)
- Random noise (ignore it)

TCP doesn't know which. So it uses AIMD:
- No loss: increase sending rate slowly
- Loss detected: halve sending rate immediately

This creates the famous "sawtooth" pattern:

> [!note]- Sawtooth visualization
> ```
> Rate
>   │    /\    /\    /\
>   │   /  \  /  \  /  \
>   │  /    \/    \/    \
>   │ /
>   └─────────────────────→ time
> ```

Aggressive when things go wrong would cause **congestion collapse**—everyone doubles down, network dies, everyone loses. That's Martingale for networks.

AIMD keeps the network stable. Individual connections survive. Total throughput is maximized.

---

## The Deeper Lesson

TCP's designers (unknowingly?) encoded a profound risk management principle:

1. **Retreat fast when losing** — Multiplicative decrease (÷2) cuts exposure quickly
2. **Advance slow when winning** — Additive increase (+1) prevents overextension
3. **Survival enables everything** — You can't profit, learn, or adapt if you're dead
4. **Robustness over optimality** — A strategy that works regardless beats one that's optimal only when you guess right

This applies everywhere:

| Domain | Martingale Thinking | AIMD Thinking |
|--------|---------------------|---------------|
| Investing | Double down on losing positions | Cut losses quickly, let winners grow slowly |
| Startups | Bet everything on one big launch | Small experiments, fail fast, iterate |
| Career | All-in on one risky opportunity | Build optionality, survive setbacks |
| Health | Ignore warning signs, crash later | Small adjustments, sustainable habits |

---

## Conclusion

The Internet processes billions of packets per second using a 40-year-old algorithm that says: when things go wrong, back off fast; when things go well, proceed with caution.

This isn't just good engineering. It's good life advice.

Martingale is seductive because the math seems to work (it does, with infinite money). AIMD is boring because it never swings for the fences.

But the simulations don't lie:
- AIMD: 98% survive, profit when conditions favor you, learn and adapt
- Martingale: 78% bankrupt, can't learn, can't adapt, only survivors tell stories

**You can't learn if you're dead.**

Next time you're tempted to double down—in gambling, investing, or life—remember what the Internet knows: survive, learn, then win.

---

## Appendix: The Code

Simulation code available at: [GitHub link]

> [!info]- Simulation parameters
> - 1000 simulations per scenario
> - 500 rounds per simulation
> - $100 initial bankroll
> - $1 base bet
> - Win probability: 48%, 50%, 52%

---

*This post grew from studying TCP congestion control for Georgia Tech's CS6250. Sometimes the best insights come from unexpected connections.*

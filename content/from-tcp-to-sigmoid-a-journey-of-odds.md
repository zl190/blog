---
title: "From TCP to Sigmoid: A Journey of Odds"
type: draft
format: blog
status: published
created: 2026-01-27
language: en
tags: [math, ml, networking, learning]
published_url: https://zl190.github.io/blog/posts/from-tcp-to-sigmoid-a-journey-of-odds/
published_date: 2026-01-27
---

# From TCP to Sigmoid: A Journey of Odds

I started with a networking question. I ended up understanding why sigmoid exists.

This is the story of one question, followed honestly, connecting four domains: networking, algebra, machine learning, and Bayesian inference. All through a simple transform: $r = \frac{p}{1-p}$.

## The Question

I was studying TCP congestion control for my networking course. The textbook said TCP uses AIMD (Additive Increase, Multiplicative Decrease) for fairness. Other policies like MIMD (Multiplicative Increase, Multiplicative Decrease) don't converge.

The question: *Why?*

I stared at the page. I had no idea how to even think about it.

## Geometric Thinking

The trick is to visualize the problem. Imagine two computers sharing a link. Plot their sending rates as a point (x₁, x₂) in 2D space.

![[tcp-phase-space.png]]

- **Fairness line** (x₁ = x₂): diagonal with slope +1
- **Efficiency line** (x₁ + x₂ = C): diagonal with slope -1
- **Goal**: green dot at intersection (fair AND efficient)
- **Current state**: red star below fairness line (A has more than B)

Now trace what each operation does:

- **Additive (+k to both):** Translates the point. Direction: 45°.
- **Multiplicative (×m to both):** Scales the point. Direction: toward/away from origin.

For AIMD:
- Additive increase moves at 45° (parallel to fairness line)
- Multiplicative decrease moves toward origin (along a ray)

The combination spirals toward the fair point. But why does additive help fairness while multiplicative doesn't?

> **Caveat:** This analysis assumes both flows have the same RTT (round-trip time) and move together. In reality, flows with smaller RTT can increase faster (more ACKs per second), leading to RTT-based unfairness. The course material covers this in a later chapter—AIMD is fair *among equals*, not universally.

## The Smaller Gains More

Let's trace through numbers. Start unfair: A = 8, B = 2.

| Step | A | B | Ratio A/B | Action |
|------|---|---|-----------|--------|
| 0 | 8 | 2 | 4.0 | start |
| 1 | 4 | 1 | 4.0 | ×0.5 (ratio preserved!) |
| 2 | 5 | 2 | 2.5 | +1 (ratio improved!) |
| 3 | 6 | 3 | 2.0 | +1 (ratio improved!) |

Multiplicative preserves the ratio. Additive improves it.

Why? Adding 1 to B (which is 2) is a 50% increase. Adding 1 to A (which is 8) is only 12.5%. Same absolute amount, but **the smaller one gains more proportionally**.

This is the core insight: $\frac{k}{x}$ is larger when $x$ is smaller.

![[ratio-convergence.png]]

Geometrically: ratio = slope of ray from origin. Adding +k rotates the ray toward 45° (the fairness angle). Here, the angle increases from 14° to 24° — converging toward 45° where ratio = 1:1.

I wrote this observation out, and as I wrote, something clicked. The understanding came *during* the writing, not before it. (That's a separate insight: writing is thinking, not recording thinking.)

## Wait, This Sounds Familiar

"The smaller one gains more proportionally."

This reminded me of a sugar water problem. If you add 10g of sugar to a dilute solution (10%) and a concentrated solution (50%), the dilute one changes more.

But wait — are these the same thing?

I worked through it. They're not the same formula, but they're related. Here's the distinction:

| Representation | Formula | Example (1 sugar, 3 water) |
|----------------|---------|---------------------------|
| Ratio (odds) | $r = \frac{a}{b}$ | $\frac{1}{3}$ |
| Proportion | $p = \frac{a}{a+b}$ | $\frac{1}{4}$ |

Different formulas. But they convert to each other:

$$p = \frac{r}{1+r} \quad \text{(proportion from ratio)}$$
$$r = \frac{p}{1-p} \quad \text{(ratio from proportion)}$$

I derived the second one on paper:

$$
\begin{aligned}
p &= \frac{r}{1+r} \\
p(1+r) &= r \\
p + pr &= r \\
p &= r - pr \\
p &= r(1-p) \\
r &= \frac{p}{1-p}
\end{aligned}
$$

This is called "odds" in statistics. Probability 25% = odds 1:3.

## Where Does Sigmoid Come From?

Here's where it gets fun.

In machine learning, we use logistic regression for classification. The textbook says: "use sigmoid to squash outputs to [0,1], same range as probability."

But why sigmoid specifically? Why that exact formula?

Most CS-flavored ML courses introduce sigmoid as "squashes to [0,1]" and move on. Statistics courses (Statistical Learning, Biostatistics) tend to teach from the odds perspective, since odds ratios are fundamental in clinical trials and epidemiology. But if you came through the CS path like me, you might have missed that framing entirely.

Now I had the tools to derive it.

**The problem:** We want to model probability with linear tools. But probability is bounded [0,1]. Linear models output unbounded values (-∞ to +∞).

**The solution:** Transform probability to something unbounded, do linear modeling there, transform back.

$$
\begin{aligned}
p &\in [0,1] & &\text{bounded} \\
r &= \frac{p}{1-p} \in [0,\infty) & &\text{still bounded on one side} \\
z &= \log(r) \in (-\infty,+\infty) & &\text{unbounded! linear-friendly}
\end{aligned}
$$

This $z = \log\left(\frac{p}{1-p}\right)$ is called **logit**.

Now, how do we transform back? I worked through it on a whiteboard:

$$
\begin{aligned}
z &= \log(r) \\
r &= e^z & &\text{inverse log} \\
p &= \frac{r}{1+r} & &\text{odds to probability (from earlier!)} \\
p &= \frac{e^z}{1+e^z} & &\text{substitute}
\end{aligned}
$$

Divide top and bottom by $e^z$:

$$p = \frac{1}{1+e^{-z}}$$

**That's the sigmoid function.** I didn't look it up. It fell out of the math.

I sat there for a moment. The sigmoid isn't arbitrary. It's the *only* function that correctly inverts log-odds back to probability. The shape is mathematically necessary.

This was the first time I truly understood sigmoid, not just memorized it.

## The Bayesian Connection

One more connection. In Bayesian inference, there's something called "Bayes in odds form."

Standard Bayes (messy):
$$P(H|E) = \frac{P(E|H) \cdot P(H)}{P(E)}$$

Odds form (clean):
$$\text{posterior odds} = \text{likelihood ratio} \times \text{prior odds}$$

Log-odds form (cleanest):
$$\text{logit}(\text{posterior}) = \text{logit}(\text{prior}) + \log(\text{LR})$$

Evidence *adds* to your belief in log-odds space. This is why logistic regression works — each feature contributes a log-likelihood-ratio, and they sum up.

Logistic regression isn't just "using sigmoid." It's Bayesian updating in log-odds space.

## The Insight: Odds as Coordinate System

Here's the meta-lesson.

Probability is what we care about — it's interpretable, it's what we communicate. But odds and log-odds are **computational coordinate systems**.

| Operation | Easier in |
|-----------|-----------|
| Interpret result | Probability |
| Bayes update | Odds (multiply) |
| Combine evidence | Log-odds (add) |
| Linear modeling | Log-odds |

They're isomorphic — same information, lossless conversion. You choose based on what operations you need.

This pattern is everywhere:
- Signals: work in frequency domain (FFT), interpret in time domain
- Multiplication: work in log space (becomes addition), interpret in linear space
- Probability: work in log-odds, interpret in probability

Odds isn't "more real" than probability. It's a coordinate system you choose for convenience.

## The Thread

One question: "Why does AIMD converge?"

One thread, pulled honestly:

```
TCP convergence
  → geometric reasoning (phase space)
  → "smaller gains more proportionally"
  → ratio vs proportion
  → r = p/(1-p) (odds!)
  → log-odds (logit)
  → sigmoid (derived, not memorized)
  → Bayesian updating
  → "it's all coordinate systems"
```

Four domains. One underlying idea.

This is what learning feels like when you follow questions instead of memorizing answers. You start with TCP and end up understanding sigmoid. Not because someone told you they're connected, but because you pulled the thread yourself.

The whiteboard derivation is mine now. Next time I see sigmoid in a neural network, I won't think "squashes to [0,1]." I'll think "inverts log-odds."

That's the difference between knowing and understanding.

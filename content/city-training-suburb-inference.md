---
title: "Cities Are Training, Suburbs Are Inference"
date: 2026-03-31
tags:
  - AI
  - Learning
  - life-design
  - reinforcement-learning
topics:
  - AI
qc: passed
spec: "City living is training (dense, diverse input), suburbs are inference (low-noise execution) — the RL framework explains when each phase is optimal | creator — AI practitioner applying RL concepts to life design | AI practitioners and anyone thinking about where to live"
---

# Cities Are Training, Suburbs Are Inference

*A reinforcement learning framework for where to live and when*

---

I've been thinking about why the "young people should live in cities" advice feels true but is never argued well. The usual framing is lifestyle — cities are fun, there's more to do, you meet people. That's not wrong, but it's shallow. It doesn't explain *why* the density matters, or when you should leave, or what goes wrong when you skip it.

The better framing is machine learning. Cities are training. Suburbs are inference. And the transition between them is the most important architectural decision of your life.

## The Training Phase

A city is a high-throughput training environment. Population density compresses the feedback loop: more people, more friction, more variety per unit of time. You encounter different lifestyles on a single subway ride. You see how a banker lives, how an artist lives, how someone on minimum wage lives — all in the same afternoon. This is training data diversity, and it's what makes the difference between a model that generalizes and one that overfits to a narrow distribution. Edward Glaeser calls this the central function of cities: they are "engines of learning" where proximity accelerates the transmission of knowledge and skills ([Glaeser, 1999](https://doi.org/10.1006/juec.1998.2121)).

Suburbs don't do this. A suburban community is, almost by definition, a filtered dataset. Similar income, similar lifestyle, similar values. You can live there for years and build a world model that's precise but narrow — perfectly fitted to your neighborhood, useless anywhere else. Jane Jacobs identified this decades ago: the diversity of uses, users, and buildings in dense neighborhoods is what generates the "intricate sidewalk ballet" that makes cities productive ([Jacobs, 1961](https://en.wikipedia.org/wiki/The_Death_and_Life_of_Great_American_Cities)).

The city forces you to process input you didn't choose. That's the point. You walk to work instead of driving, and the 45 minutes of "wasted" time become a data stream you can't get from a car window. You pass through neighborhoods you'd never visit on purpose. You overhear conversations in languages you don't speak. You develop intuitions about how systems work — transit, commerce, social dynamics — not from reading about them, but from being inside them.

This is the same reason street photography works: you don't go out to shoot a specific thing. You move through the environment and let the environment present itself to you. The value is in the unplanned encounters, the data you didn't know you needed.

## The Inference Phase

At some point, the marginal return on new input drops. You've seen enough lifestyles to know which one you want. You've adapted to enough systems to build your own. You've compressed the city's chaos into a set of weights — values, judgment, taste, intuition — that you can run on your own hardware.

That's when suburbs make sense. You're not learning anymore; you're executing. You have your model, and now you need a low-noise environment to run it. The quiet, the space, the predictability — these aren't bugs, they're features of an inference-optimized environment.

The mistake is doing inference before you've finished training. Move to the suburbs at 24, and you're deploying a model with undertrained weights. The outputs look fine within your narrow distribution, but they don't generalize. You've never stress-tested your values against real diversity, so you don't actually know if they're yours or just your environment's defaults.

## Regularization: The Escape Valve

Here's the nuance that pure "live in the city" advice misses: training without regularization leads to overfitting. A city can overwhelm you. The density that makes it a great training environment can also burn you out, make you anxious, or pull you in directions you didn't choose. This parallels what John Sweller formalized as cognitive load theory: when the volume and complexity of information exceeds working memory capacity, learning degrades rather than improves ([Sweller, 1988](https://doi.org/10.1207/s15516709cog1202_4)).

Suburbs, hiking, camping — these are regularization. They're not permanent exits from training; they're temporary reductions in input that let you consolidate what you've learned. You step out of the data stream, review your weights, check if you're still optimizing for the right thing.

The critical insight: **safety comes from knowing you can switch.** If you're trapped in the city with no exit, the density becomes toxic — it's not training anymore, it's noise you can't escape. If you know you can retreat to the mountains for a weekend, the city's chaos becomes manageable. You process it differently when you know it's not permanent.

This is why the best setup isn't "city forever" or "suburbs forever." It's having both available and switching based on what you need. Training with regularization beats training alone.

## Two Axes: Population Density × Intelligence Density

Population density is one axis. But there's a second one people miss: intelligence density.

A university campus has moderate population density but extreme intelligence density. Everyone around you is doing high-intensity intellectual work. The conversations are harder. The ambient expectations are higher. You're not just seeing diverse lifestyles — you're being pulled upward by the quality of thinking around you.

The internet theoretically provides intelligence density without population density. You can read brilliant people's writing from anywhere. But there's a catch: internet intelligence density is mostly read-only. Unless you're already famous or have a platform, you can't participate. You can consume the signal, but you can't interact with it. There's no feedback loop.

A campus, a research lab, a good coworking space — these provide bidirectional intelligence density at low access cost. You don't need to be famous. You just need to be there. The conversations happen naturally. The training is interactive, not passive.

The ideal environment sits high on both axes: dense population AND dense intelligence. That's why certain neighborhoods in certain cities — university districts, tech hubs, creative quarters — produce disproportionate output. Economists call these "agglomeration economies" — density generates sharing, matching, and learning spillovers ([Duranton & Puga, 2004](https://doi.org/10.1016/s1574-0080(04)80005-1)). It's not magic. It's two multiplied training signals. Glaeser makes the case that these spillovers explain most of the intellectual advantage of urban life ([Glaeser, 2011](https://www.penguinrandomhouse.com/books/303960/triumph-of-the-city-by-edward-glaeser/)).

## The Loss Function Problem

All this training data is useless without a loss function. And this is where the framework gets interesting.

Family education is not the loss function. It's the reward signal — immediate feedback on actions. Do this, get praised. Do that, get punished. But reward signals are noisy, inconsistent, and specific to the person giving them.

The loss function is your 三观 — your worldview, your values, your internal framework for evaluating what matters. It's what you optimize against *when no one is watching*. A reward signal can be ignored or gamed. A loss function is internalized. It runs whether you want it to or not.

This maps directly to a real distinction in RL research. Inverse reinforcement learning — first formalized by Ng and Russell — works by observing expert behavior and inferring the reward function that would make those actions optimal ([Ng & Russell, 2000](https://ai.stanford.edu/~ang/papers/icml00-irl.pdf)). That's exactly what children do: they watch parents, teachers, peers — not to copy the actions, but to reverse-engineer the underlying values that produced those actions. The child isn't learning "don't steal"; they're learning the reward function that makes "don't steal" an optimal action.

The deeper question is whether anyone designs their own loss function, or whether it's always the emergent product of the training environment. In standard RL, the reward function is given ([Sutton & Barto, 2018](http://incompleteideas.net/book/the-book-2nd.html)). In inverse RL, it's inferred from demonstrations. In real life, it's shaped by every agent in your environment — and in a city, there are a lot of agents. Small changes in the reward landscape can dramatically change what gets learned ([Ng et al., 1999](https://people.eecs.berkeley.edu/~russell/papers/icml99-shaping.pdf)). Anyone who grew up in a different city than their parents already knows this.

## Multi-Agent Training

You're not training in isolation. Your loss function is being shaped by:

**Peers.** Horizontal training — cooperative and adversarial. Your friends push you in directions. Some directions are good. Competition sharpens you. But peer pressure can also distort your loss function toward local optima that the group values but you don't actually care about.

**Elders.** Vertical training — a form of knowledge distillation. The term comes from ML, where Hinton, Vinyals, and Dean showed that a large, complex model can transfer its learned knowledge into a smaller one ([Hinton et al., 2015](https://arxiv.org/abs/1503.02531)). Older generations compress their experience into advice, rules, stories. The quality varies enormously. Good elder guidance is like a pretrained model: it gives you a useful initialization so you don't have to learn everything from scratch. Bad guidance is a misaligned initialization that you'll spend years unlearning.

**Recommendation algorithms.** The new third agent. The internet's recommendation systems are optimizing their own objective function — engagement, not your growth. They're actively reshaping your reward landscape to keep you consuming, not to help you train well. Allcott et al. ran a large-scale randomized experiment and found that deactivating Facebook for four weeks increased subjective well-being, reduced political polarization, and freed up an average of 60 minutes per day — while also reducing news knowledge, suggesting a genuine tradeoff between engagement and welfare ([Allcott et al., 2020](https://doi.org/10.1257/aer.20190658)). Zuboff argues this is not incidental but architectural: the business model of surveillance capitalism requires the systematic shaping of user behavior toward predictability and engagement ([Zuboff, 2019](https://www.publicaffairsbooks.com/titles/shoshana-zuboff/the-age-of-surveillance-capitalism/9781610395694/)). This is an adversarial agent in your training environment that most people don't even recognize as an agent.

**The state.** In China, there's a fourth agent with unusual power. The state doesn't just provide reward signals — it controls the data distribution itself. Censorship, education policy, the firewall — these determine what training data you can access. This is a level of environmental control that doesn't exist in most frameworks. It's not just another agent in the game; it's the game designer.

The result is that your "personal" loss function is never fully personal. It's the emergent product of all these forces. And this is fine — the Western obsession with "independent thinking" as some pure state of autonomy is itself a kind of overfitting to a particular philosophical tradition.

## 明势, Not Independence

The more useful concept isn't independence from the system. It's 明势 — reading the situation clearly. Knowing where you sit on the board. Understanding which forces are shaping you and in which directions. Knowing what you actually want versus what you've been trained to want.

This is harder than "independent thinking" but more honest. Nobody stands outside the system. The question isn't whether you're influenced — you are, always — but whether you can see the influences clearly enough to navigate them intentionally.

And this is a gradual process, not a binary switch. You don't wake up one day with perfect clarity. You slowly increase the resolution: from not seeing the system at all, to vaguely sensing it, to being able to name the forces, to being able to operate within them flexibly. Each step is progress. Each step is, in a real sense, a form of independence — not from the system, but within it.

## Exploration vs. Exploitation

There's a final tension that doesn't resolve cleanly: is exploration a waste of time?

Walking through a city for an hour instead of taking a 15-minute taxi — from a short-term efficiency perspective, that's 45 minutes of lost productivity. You could have written code, read a paper, shipped something. The walk produced no measurable output.

But this is the exploration-exploitation tradeoff — one of the foundational tensions in reinforcement learning ([Sutton & Barto, 2018](http://incompleteideas.net/book/the-book-2nd.html)) — and it has no universal solution. When you're young and your world model is incomplete, epsilon should be high. Explore more, even if it looks inefficient. You don't yet know what you don't know, and the only way to discover unknown unknowns is to wander into them. There's empirical support for this intuition beyond ML: Leung et al. found that multicultural experience — exposure to diverse cultural contexts — directly enhances creative performance, and that the depth of engagement with different environments matters more than mere exposure ([Leung et al., 2008](https://doi.org/10.1037/0003-066x.63.3.169)).

The catch: not all exploration is equal. Walking through a city while observing, thinking, absorbing — that's exploration. Walking through a city while scrolling your phone — that's neither exploration nor exploitation. Same input, zero processing. The environment offers the data either way. Whether you're actually training on it is up to you.

## The Framework

Putting it all together:

| Phase | Environment | What's happening |
|-------|-------------|-----------------|
| Training | City | Dense, diverse input. High feedback. Building weights. |
| Regularization | Nature / suburbs / retreat | Consolidation. Checking your loss function. Preventing overfit. |
| Inference | Suburbs / anywhere | Running on trained weights. Low-noise execution. |
| Fine-tuning | Back to density | Periodic updates. Preventing distribution drift. |

| Axis | Low | High |
|------|-----|------|
| Population density | Isolated, low stimulation | Dense, high friction, diverse |
| Intelligence density | Passive consumption | Active, bidirectional, challenging |

| Agent | Role | Risk |
|-------|------|------|
| Family | Reward signal | Noisy, inconsistent, can be gamed |
| 三观 (values) | Loss function | Can be shaped by adversarial agents |
| Peers | Co-training | Local optima, groupthink |
| Elders | Knowledge distillation | Misaligned initialization |
| Algorithms | Reward shaping | Optimizes engagement, not growth |
| State | Data distribution control | Limits training data, shapes possibility space |

The prescription isn't "move to a city." It's: understand which phase you're in, make sure your environment matches that phase, and maintain the ability to switch. Training without regularization burns you out. Inference without training makes you brittle. And none of it works without a loss function you've examined at least once.

---

*The city doesn't make you smarter. It makes you harder to fool — including by yourself. But only if you're actually paying attention.*

---

*References:*

- Allcott, H., Braghieri, L., Eichmeyer, S. & Gentzkow, M. (2020). "The Welfare Effects of Social Media." *American Economic Review*, 110(3). [doi:10.1257/aer.20190658](https://doi.org/10.1257/aer.20190658)
- Duranton, G. & Puga, D. (2004). "Micro-foundations of urban agglomeration economies." *Handbook of Regional and Urban Economics*, Vol. 4. [doi:10.1016/s1574-0080(04)80005-1](https://doi.org/10.1016/s1574-0080(04)80005-1)
- Glaeser, E. L. (1999). "Learning in Cities." *Journal of Urban Economics*, 46(2). [doi:10.1006/juec.1998.2121](https://doi.org/10.1006/juec.1998.2121)
- Glaeser, E. L. (2011). *Triumph of the City: How Our Greatest Invention Makes Us Richer, Smarter, Greener, Healthier, and Happier*. Penguin Press.
- Hinton, G. E., Vinyals, O. & Dean, J. (2015). "Distilling the Knowledge in a Neural Network." *arXiv:1503.02531*. [arxiv:1503.02531](https://arxiv.org/abs/1503.02531)
- Jacobs, J. (1961). *The Death and Life of Great American Cities*. Random House.
- Leung, A. K., Maddux, W., Galinsky, A. D. & Chiu, C. (2008). "Multicultural experience enhances creativity: The when and how." *American Psychologist*, 63(3). [doi:10.1037/0003-066x.63.3.169](https://doi.org/10.1037/0003-066x.63.3.169)
- Ng, A. Y., Harada, D. & Russell, S. (1999). "Policy Invariance Under Reward Transformations: Theory and Application to Reward Shaping." *Proceedings of the 16th International Conference on Machine Learning (ICML)*.
- Ng, A. Y. & Russell, S. (2000). "Algorithms for Inverse Reinforcement Learning." *Proceedings of the 17th International Conference on Machine Learning (ICML)*.
- Sutton, R. S. & Barto, A. G. (2018). *Reinforcement Learning: An Introduction*. 2nd ed. MIT Press.
- Sweller, J. (1988). "Cognitive Load During Problem Solving: Effects on Learning." *Cognitive Science*, 12(2). [doi:10.1207/s15516709cog1202_4](https://doi.org/10.1207/s15516709cog1202_4)
- Zuboff, S. (2019). *The Age of Surveillance Capitalism: The Fight for a Human Future at the New Frontier of Power*. PublicAffairs.

---
title: "ZK-First: Adding Action Without Losing Knowledge"
type: draft
format: blog
lang: en
created: 2026-01-20
status: published
published_url: https://zl190.github.io/blog/posts/zk-first-adding-action-without-losing-knowledge/
published_date: 2026-01-27
tags: [zettelkasten, pkm, productivity, emacs, org-mode]
---

# Zettelkasten + Action

How I learned from 40 years of Emacs wisdom to design a better personal knowledge system.

## The Problem

I started with a pure Zettelkasten — atomic cards, links, MOCs. It worked beautifully for knowledge. Then I wanted to track project ideas, and everything got complicated.

My first instinct: add a `project: true` field. But that felt wrong. Was I turning my knowledge base into a todo list?

## The Journey

I spent a day exploring:

1. **Trying to add an axis** — `project: true/false`? `type: idea`? Each option polluted my clean ZK schema.

2. **Researching best practices** — ZK forums, org-mode, todo.txt, GTD. Everyone had different approaches.

3. **Finding the key insight** — from Emacs org-mode, created in 2003 by Carsten Dominik.

## The Org-mode Revelation

Org-mode doesn't separate "notes" from "tasks." Instead, it makes TODO state an **optional overlay** on any content.

```org
* TODO [#A] Build practice skill                    :agent:@work:
  SCHEDULED: <2026-02-01>

  Content here...
```

Any heading can have a TODO keyword added or removed. The content doesn't change — you just add an action layer.

**This is the opposite of what I was trying to do.**

| My approach | Org-mode approach |
|-------------|-------------------|
| "Tend card to become TODO" | "Add TODO to card" |
| Card changes identity | Card stays the same |
| Binary choice | Optional overlay |

## ZK-First vs TODO-First

Then I realized the historical context:

| System | Year | Primary | Secondary |
|--------|------|---------|-----------|
| Org-mode | 2003 | TODO/GTD | Notes (later) |
| Org-roam | 2020 | ZK linking | Added to org |
| My system | 2026 | Zettelkasten | Action (adding now) |

Org-mode is TODO-first — it started as a task manager and grew into a note system. I'm ZK-first — I started with knowledge and I'm adding action capability.

**This explains why I need a `status` field that org-mode doesn't have.** My `status: seedling → growing → evergreen` tracks knowledge maturity. Org-mode doesn't care about that — it cares about action states.

## The Solution: Content + Layers

The final design separates concerns into layers:

```yaml
# Content Layer (ZK core)
type: claim
status: seedling
tags: [agent, learning]

# Action Layer (optional overlay)
todo: incubating
project: language-practice
context: personal
scheduled: 2026-02-01
deadline: 2026-03-01
```

Key principles:

1. **Cards keep their identity** — a claim stays a claim, whether or not it has action
2. **Action is optional** — most cards are pure knowledge, no todo field needed
3. **Layers are independent** — add/remove action without changing content
4. **Query by layer** — Dataview can filter by `todo` or by `tags`

## What I Learned Along the Way

### Failed Attempt: Prefixed Tags

I tried using `+project` and `@context` in tags, inspired by todo.txt. Elegant in theory, but Dataview doesn't support special characters in tags.

### The Trigger System Still Matters

My existing `_trigger/` folder isn't obsolete — it just changed roles:

| Before | After |
|--------|-------|
| Store todo items | Query cards with `todo:` |
| Maintain task lists | Generate lists via Dataview |
| Push mechanisms | Push mechanisms (unchanged) |

**Data lives in cards. Engine lives in trigger.**

### Historical Echo

My "trigger system" idea — adding push mechanisms to a knowledge base — echoes what Carsten Dominik did 40 years ago when he combined outlining with TODO management. Same problem, same solution pattern, discovered independently.

## The Final Schema

```
┌─────────────────────────────────────────────────┐
│              Card = Content + Layers            │
├─────────────────────────────────────────────────┤
│  Content Layer (required)                       │
│  ├── type: concept | claim | procedure          │
│  ├── status: seedling | growing | evergreen     │
│  └── tags: [subjects]                           │
│                                                 │
│  Action Layer (optional)                        │
│  ├── todo: incubating | active | waiting | done │
│  ├── project: project-name                      │
│  ├── context: personal | work | school          │
│  └── deadline: YYYY-MM-DD                       │
└─────────────────────────────────────────────────┘
```

## Takeaways

1. **Don't change what something IS to add what it DOES.** A card's type is its identity. Action is a temporary state.

2. **Study existing systems before inventing.** Org-mode solved this 20 years ago. I could have saved time by studying it first.

3. **ZK-first and TODO-first need different designs.** Don't copy TODO-first systems directly into a knowledge base.

4. **Layers beat categories.** Instead of "knowledge cards vs project cards," use "cards with optional action layer."

5. **Historical patterns repeat.** My "novel" trigger system idea was Carsten Dominik's solution in 2003.

---

*This post was written after a day-long design session with Claude, exploring how to add action tracking to a Zettelkasten without corrupting it. The full discussion is preserved in my vault as `schema-evolution-content-plus-layers.md`.*

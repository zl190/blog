---
title: "I Accidentally Reinvented org-mode"
type: draft
format: blog
status: published
published_url: https://zl190.github.io/blog/posts/i-accidentally-reinvented-org-mode/
published_date: 2026-01-27
created: 2026-01-19
lang: en
tags: [claude-code, emacs, org-mode, AI, PKM]
sources:
  - "[[claude-code-is-ai-emacs]]"
  - "[[time-tracking-needs-explicit-clocking]]"
  - "[[moc-personal-productivity-system]]"
---

# Reinvented org-mode Using AI in One Week (Accidentally)

*And why Claude Code is the successor to Emacs's unfinished dream*

## The Hook

Last week, I built a personal productivity system using Claude Code. Capture, daily planning, reflection, knowledge cards, slide generation — the whole stack.

Then I learned about org-mode.

I had reinvented 40 years of org-mode patterns without knowing they existed. But here's the thing: I built it in one week, in natural language, without writing a single line of elisp.

That's when it clicked: **Claude Code isn't just a tool. It's the successor to Emacs.**

---

## What I Built

A PKM + productivity system with these components:

| Feature | What it does |
|---------|--------------|
| `/capture` | Universal input → routes to cards, todos, calendar |
| `/today` | Morning planning, syncs from apps, sets priorities |
| `/reflect` | Daily/weekly review, archives completed tasks |
| Card system | Zettelkasten with typed cards, frontmatter schema |
| `/md-slides` | Compile cards into presentations |

All orchestrated by Claude Code. All text-based. All syncing to native macOS apps.

I was proud of it. Then someone asked: "Have you tried org-mode?"

---

## The org-mode Discovery

I looked it up. My jaw dropped.

| My System | org-mode Equivalent | Age |
|-----------|---------------------|-----|
| `/capture` | org-capture | ~15 years |
| `/today` | org-agenda day view | ~20 years |
| `/reflect` | org-agenda review | ~20 years |
| Card frontmatter | Properties drawer | ~20 years |
| MOCs | org-roam nodes | ~5 years |
| `/md-slides` | org-reveal, org-beamer | ~10 years |

I had rebuilt org-mode's core patterns. Features that Emacs users have refined for decades.

The irony: I'm using a Zettelkasten method that says "build on existing knowledge" — and I built from scratch.

---

## But Here's What's Different

I didn't write elisp. I didn't read documentation for weeks. I described what I wanted in English, and Claude Code figured out the implementation.

```
Me: "I want to capture todos and send them to Apple Reminders"

Claude: [writes AppleScript, handles edge cases, logs to Obsidian]
```

This is the key difference:

| Emacs | Claude Code |
|-------|-------------|
| Elisp as glue | LLM as glue |
| Rules must be explicit | Intent is understood |
| Learn elisp for years | Describe in natural language |
| Edge cases break it | Edge cases handled |

Same architecture. Different orchestration layer.

---

## The Deeper Insight: Claude Code as Emacs's Successor

Emacs has always wanted to be "one system for everything." Notes, code, email, calendar, todos — all in one environment, all in text.

But it hit a ceiling: **elisp requires you to be the programmer.**

Every workflow must be explicitly coded. Natural language doesn't work. You either learn elisp or you don't use the features. The modern web doesn't fit. Mobile doesn't exist.

Emacs dreamed of being an operating system. It became a powerful editor for power users instead.

**Claude Code picks up where Emacs left off.**

Not a reimplementation — a successor. Same vision, new foundation:

| Emacs | Claude Code |
|-------|-------------|
| Elisp interpreter | LLM engine |
| Text as truth | Text as truth |
| Shell out to Unix | Shell out to Unix |
| Programmable by experts | Programmable by anyone |
| Stuck in terminal | Works with modern web, APIs, GUIs |

The dream of "talk to your computer and it does what you mean" — that's what LLMs enable. Emacs had the architecture right. It just needed a smarter, more accessible glue layer.

```
1976: Emacs — "what if editor was programmable?"
1986: org-mode — "what if everything was text?"
2003: org-capture — "what if text was a productivity system?"
2020: org-roam — "what if text was a knowledge graph?"
2024: Claude Code — "what if the glue was AI instead of elisp?"
```

The torch passes. The vision continues.

---

## What AI Enables That Emacs Can't

### 1. Graceful Degradation

org-clock requires explicit clock-in/out. Forget? Data corrupted.

My system has layers:
- Explicit: `/clock in` → `/clock out`
- Prompted: AI asks "what have you been doing?"
- Inferred: AI tracks conversation topics
- Reconstructed: File timestamps as fallback

Forgetting isn't catastrophic. AI fills gaps.

### 2. Learning While Working

Claude corrects my English as we work. Logs patterns. Surfaces recurring mistakes.

No elisp package does this. It's AI-native functionality.

### 3. Universal Translation

Claude Code can sync between ecosystems:
- Obsidian ↔ org-mode
- Apple Reminders ↔ org-agenda
- Any format ↔ any format

The AI is the universal adapter.

---

## The Irony of Reinventing the Wheel

Was my week wasted?

No. I understand *why* these patterns exist now. I know what capture-inbox-process solves. I know why daily/weekly rhythms matter. I built the intuition.

If someone had said "just use org-mode" on day one, I'd have:
- Someone else's config I don't understand
- Features I don't know why I need
- No ownership of my system

By building, I learned. That's the Zettelkasten principle: understanding comes from writing it yourself.

---

## The Uncomfortable Question

If Claude Code can replicate org-mode in a week, what does that mean for complex software?

Emacs represents decades of accumulated wisdom. org-mode is battle-tested. The edge cases are handled.

But for 80% of users, 80% of the time — the AI-built version might be good enough. And it's infinitely more accessible.

The experts will still use Emacs. They'll have more control, more power, more stability.

But the dream of "one system for everything" — that's now accessible to everyone.

---

## Takeaways

1. **Patterns are eternal, glue layers change.** The org-mode patterns will outlive both elisp and LLMs.

2. **Reinventing wheels builds understanding.** Don't feel bad about rebuilding existing solutions. You'll understand them deeper.

3. **AI democratizes power-user tools.** What took elisp expertise now takes English. The dream is accessible to everyone.

4. **Emacs was right.** Text as universal format. Composable tools. Programmable environment. It just needed a successor to carry the torch.

5. **Claude Code is that successor.** Same architecture, new glue. AI handles orchestration. Unix tools do the work. Text remains the source of truth. The vision continues.

---

## Update: I Actually Built the Bridge

After writing this post, I spent an evening building what I described. Claude Code now talks to Emacs directly.

### Three Ways to Connect AI to Emacs

```
┌─────────────────────────────────────────────┐
│              Claude Code (LLM)               │
└─────────────────────────────────────────────┘
         │              │              │
         ▼              ▼              ▼
    ┌────────┐    ┌──────────┐   ┌────────┐
    │ Native │    │  Shell   │   │  MCP   │
    │JSON/MD │    │emacsclient│  │Protocol│
    └────────┘    └──────────┘   └────────┘
```

I benchmarked all three. The results surprised me:

| Method | Latency | Ratio | What You Get |
|--------|---------|-------|--------------|
| Native | 0.6ms | 1x | Basic tracking |
| Shell | 31ms | 54x | Full org-mode |
| MCP | ~30ms | ~50x | Full org + clean DX |

**54x slower. And you won't notice.**

Both are under 100ms — imperceptible to humans. The "slow" path gives you org-agenda, habit consistency graphs, clock tables, and org-roam.

### MCP Isn't About Speed — It's About Simplicity

The MCP server doesn't make things faster. It makes things *simpler*:

```elisp
;; Shell method (escaping nightmare):
emacsclient -e '(progn (find-file \"~/org/clock.org\") ...)'

;; MCP method (clean):
(cc/clock-in "writing blog")
```

No shell escaping. No subprocess spawn. No quote-within-quote hell.

Same performance. Better developer experience.

### What We Built Tonight

| Component | Description |
|-----------|-------------|
| `cc/clock-in/out` | Time tracking via org-clock |
| `cc/habits-with-graph` | 14-day visual streaks: `░░░░░░░░░░░░░█` |
| `cc/today-agenda` | org-agenda integration |
| `cc/sync-to-markdown` | Bidirectional Obsidian sync |
| `cc/roam-capture` | Zettelkasten in org-roam |
| Emacs MCP Server | Direct elisp execution |

The vision is now real: Claude Code orchestrates, Emacs executes, Obsidian displays.

### Update 2: Four-Way Benchmark (Native vs Shell vs MCP)

I benchmarked four approaches. **The real insight:** 8ms is imperceptible to humans. You're "paying" 8ms to access 40 years of org-mode features.

> [!info]- Benchmark details
> ```
> ┌───────────────────────────────────────────────────────────────────────┐
> │                       BENCHMARK RESULTS                               │
> ├───────────────────────────────────────────────────────────────────────┤
> │ METHOD              │ STATUS  │ CLOCK IN│ HABITS  │ FULL    │ RATIO  │
> ├─────────────────────┼─────────┼─────────┼─────────┼─────────┼────────┤
> │ Native (JSON/MD)    │ 0.03ms  │  0.4ms  │   N/A   │  0.6ms  │   1x   │
> │ Shell (emacsclient) │  7.5ms  │  ~8ms   │ 10.2ms  │  ~24ms  │  ~40x  │
> │ MCP External        │  ~8ms   │  ~8ms   │ ~11ms   │  ~24ms  │  ~40x  │
> │ MCP Ours            │  ~8ms   │  ~8ms   │ ~11ms   │  ~24ms  │  ~40x  │
> └─────────────────────┴─────────┴─────────┴─────────┴─────────┴────────┘
> ```
>
> **Wait, is this fair?** Not really. The 40x difference isn't Emacs being slow—it's the cost of crossing process boundaries:
>
> | Component | Time |
> |-----------|------|
> | Actual work (file I/O) | ~0.1ms (same for all methods) |
> | IPC overhead (subprocess + protocol) | ~8ms per call |
>
> Native writes directly to disk. Shell/MCP must: spawn subprocess → connect to Emacs → execute elisp → return result. That ~8ms is communication tax, not slowness.
>
> **MCP's win:** Parallel calls amortize the overhead. 9 sequential shell calls = ~75ms. Same 9 calls batched through MCP = ~15ms (they run concurrently).
>
> | Aspect | Native | Shell | MCP External | MCP Ours |
> |--------|--------|-------|--------------|----------|
> | Actual work | ~0.1ms | ~0.1ms | ~0.1ms | ~0.1ms |
> | IPC overhead | 0ms | ~8ms | ~8ms | ~8ms |
> | Features | Basic | Full org | Full org | Full org |
> | Habits | No | Yes | Yes | Yes |
> | Parallelism | Yes | No | Yes | Yes |

**Conclusion:** The "speed difference" is IPC overhead, not real work. 8ms is imperceptible. Use Emacs for features, build your own MCP for control.

### The Paradox of Optimization

> "I built three ways to connect AI to Emacs. The fastest is 54x faster
> than the slowest. Neither is perceptible to humans. But the slowest
> one gives me an entire operating system's worth of functionality."

Sometimes the "slower" path is the faster path to getting things done.

---

## What's Next

~~I'm planning to build:~~
~~- Hybrid time tracking (explicit + AI-inferred)~~
~~- org-mode ↔ Claude Code sync layer~~
~~- Habit streaks with spaced repetition~~

**Done.** All built in one evening. The tools evolve faster than I can write about them.

---

*Built with Claude Code — the successor to Emacs, 48 years in the making.*


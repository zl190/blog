---
title: "When Working Code Isn't Public Code"
created: 2026-04-08
date: 2026-04-10
tags: [open-source, hooks, scope, packaging, credence-goods]
topics:
  - software-engineering
qc: passed
spec: "Four-criteria rubric for deciding what hooks to ship publicly vs keep personal. Credence good framing: passing test suite is unverifiable quality signal. 5 citations (Darby & Karni 1973, Akerlof 1970, Parnas 1972, Raymond 1999, Fogel 2005) + personal cc-harness validation evidence | creator — practitioner deciding public vs personal scope | engineers packaging tools for others"
---

# When Working Code Isn't Public Code

I had five hooks. All of them passed their test suites. My instinct was to ship them all as part of the cc-harness public release.

I shipped two.

The failure mode I nearly walked into has nothing to do with bugs. It's shipping code that works in your context and fails in someone else's — where "failure" doesn't mean an exception gets thrown. It means a hook that silently enforces your assumptions onto their workflow. The tests passed because you wrote the tests in your environment, with your infrastructure present, testing the behavior you designed for yourself.

This post is about the rubric I built on April 7 to decide what belongs in a public package and what belongs in a dotfile.

## The Shape of the Problem

cc-harness is a Claude Code hook library — shell scripts that intercept tool events (PreToolUse, PostToolUse, Stop, TaskCompleted) and enforce or advise on agent behavior. Hooks block dangerous commands, inject context, log fires, gate publications. When they work, they're invisible. When they break, they break silently: exit 1 instead of exit 0, a missing file path, a gate that skips without warning.

The question I was answering on April 7 wasn't "does this hook work?" I'd run validation cards on all five. The question was "does this hook belong in something I hand to someone who isn't me?"

Parnas [1972] formalized this decades ago: the criterion for decomposing systems into modules is information hiding — each module should conceal a design decision. The same principle applies to shipping decisions. A hook that hides only its own logic is modular. A hook that depends on my file layout, my naming conventions, or my publishing pipeline has leaked its design context. It works, but it is not separable.

## The Four Criteria

After the near-miss, I wrote out four questions that should gate any hook from personal repo to public package:

| Criterion | Question |
|-----------|----------|
| **Generic shape** | Does it do something any Claude Code user would want, without modification? |
| **Mechanical** | Does it encode logic only, or does it embed opinions about how work should be structured? |
| **Stable across users** | Are there any paths, tool names, or workflow names hardcoded for my setup? |
| **Earned through actual use** | Has it accumulated organic signal — real fires, real denials, real friction — not just synthetic test coverage? |

The last criterion is the one I almost skipped. A hook that passes a test suite it authored is what Darby and Karni [1973] called a credence good: a product whose quality the buyer cannot evaluate even after purchase. In their framework — extending Akerlof's [1970] information asymmetry analysis — credence goods are vulnerable to fraud because the consumer has no way to verify the claim independently. A test suite that covers only the pass path is the software equivalent: it claims coverage, and you can't tell from the result whether the coverage is real.

## Running the Candidates

### secret-guard — ships

PreToolUse:Bash. Intercepts commands that would echo API keys, cat `.env` files, pipe credential files into the session, or expose SSH private keys. Two tiers: deny for high-confidence leaks, warn for ambiguous paths like `tail ~/.bashrc`.

It had been running organically for 5 days before this decision. In that window: 19 deny attempts, 19 correct blocks. Not synthetic — these came from real sessions where the agent was about to expose a credential.

All four criteria: yes. Generic (every user has secrets), mechanical (pattern matching, no workflow opinions), stable (no personal paths), earned (19 organic fires). Ships.

### cc-remote — ships

The background delegation infrastructure: spawn a background agent, write to a task queue, receive completion notification. Nothing about how you work, just that you want something done out of band. The hook has no opinions beyond "background work should be trackable."

Ships.

### router-prompt — stays personal

This is where I started rationalizing.

`task-router.sh` injects an audit trail requirement into every Agent delegation: log what was done, log what was decided, put artifacts in a persistent location. The logic is sound. But embedded in the same hook is a pipeline registry scan against `~/.claude/pipelines/_registry.yaml` — a file structure I built for my own workflow. The hook silently passes if the registry doesn't exist, but the injected advisory context still references pipeline matching in a way that assumes my schema.

The criterion it fails: mechanical. It has opinions about pipeline structure baked into the advisory text. Those opinions are mine. Could the hook be made generic? Yes — strip the registry scan, make the audit requirements configurable. But "could be refactored into something public" is not the same as "ready to ship." The rubric asks what it is, not what it could become.

Stays personal.

### publish-gate-bash — rejected

The easiest call, once I looked at it honestly.

publish-gate-bash blocks `gh pr comment` without a draft file, and blocks `git push` when un-gated blog content is staged. The gate for blog content runs:

```bash
$HOME/claude-skills/publish/gates/pre-publish-substack.sh
```

That path exists on exactly one machine. In a fresh environment, the gate script is absent. What happens? The hook silently allows the push. No warning, no fallback, no block — just a pass. I found this explicitly in the April 7 validation run: when the gate script is missing, the inner `if` is false and all `publish/blog-*.md` files pass silently.

That's criterion 3 failure (hardcoded path) and criterion 1 failure (encodes my publishing pipeline) simultaneously. Shipping this hook would mean shipping something that looks like it protects you but degrades silently in any environment that isn't mine.

This one isn't "stays personal." It's rejected as a public artifact unless substantially redesigned — the silently-skipped gate is a safety property that only holds in my environment.

### task-router (advisory checklist) — rejected

The hook that fires on TaskCompleted and prints a verification checklist. Useful. Lightweight. Exits 0 unconditionally. But item 4 on the checklist reads:

```
cockpit.sh step <next>
```

Cockpit is my session management dashboard. Nobody else has it. Item 4 is a command that doesn't exist in any other environment. The hook still fires and exits 0 — it doesn't break anything — but it injects a step that is nonsense in every setup but mine.

The failure mode is subtle. Advisory hooks are already unverifiable at the output layer (you can't confirm the model read the checklist, let alone acted on it). An advisory hook with wrong items is worse than useless: it conditions users to ignore the output. Rejected.

## Trust Isn't Transferable

What the validation work made visible: test coverage and scope coverage are different measurements.

secret-guard had 19 organic denies across 5 days of real use. publish-gate-bash had 9 synthetic test cases — all passing, all run inside an environment with the full publishing infrastructure in place. Both would show up as "passing" in a test summary. The difference only becomes visible when you ask "would this hook work for someone who doesn't share my setup?"

Raymond [1999] argued that open source succeeds through "release early, release often." But that advice has a prerequisite he left implicit: what you release must be separable from your personal workflow. Fogel [2005] makes this explicit in *Producing Open Source Software*: code is deployable by strangers only when it makes no assumptions about the deployer's environment beyond what is documented. My three rejected hooks all made undocumented assumptions about my file layout, my tooling, or my workflow conventions.

The four-criterion rubric is ultimately asking one question in four different ways: does this hook make assumptions about the world beyond "you are running Claude Code"? Generic shape checks the use case. Mechanical checks the logic. Stable checks the paths. Earned checks whether real use has stress-tested those assumptions.

Any three of four describes something that works for me and may fail for you in ways that are hard to diagnose — the silent skip, the missing file, the checklist item that makes no sense. All four together describes something that can survive contact with an environment it's never seen.

I almost shipped five. I shipped two. The other three are in my dotfiles, doing their jobs, in the context they were built for.

---

**One-line rule:** Before publishing a hook, ask whether it would work in an empty `~/.claude/` with no other tooling installed. If the answer is "it would skip silently," that's not public-ready — that's personal infrastructure wearing a public interface.

---

**References**

- David L. Parnas, "On the Criteria To Be Used in Decomposing Systems into Modules," *Communications of the ACM* 15(12), 1972.
- Michael R. Darby and Edi Karni, "Free Competition and the Optimal Amount of Fraud," *Journal of Law and Economics* 16(1), 1973.
- George A. Akerlof, "The Market for 'Lemons': Quality Uncertainty and the Market Mechanism," *Quarterly Journal of Economics* 84(3), 1970.
- Eric S. Raymond, *The Cathedral and the Bazaar*, O'Reilly, 1999.
- Karl Fogel, *Producing Open Source Software*, O'Reilly, 2005.

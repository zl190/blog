---
title: "The Gate That Was Always Open"
created: 2026-04-08
date: 2026-04-10
tags: [hooks, monitoring, silent-failure, observability, gates]
topics:
  - software-engineering
qc: passed
spec: "No-op gates create false confidence — a gate that silently passes on failure is worse than no gate. 375 hook fires with 0 enforcement entries. 3 citations (Leveson 2011, Norman 2013, Dekker 2011) + personal publish-gate-bash evidence | creator — practitioner discovering silent gate failure | engineers building enforcement infrastructure"
---

# The Gate That Was Always Open

I ran the validation suite on my Claude Code hook harness on 2026-04-07 and found something uncomfortable: `publish-gate-bash` had been firing on every Bash tool call for months, the hook-fires log showed 375 invocations from the prior script version, and the git push gate had never produced a single enforcement log entry. Not a DENY, not a PASS, not a SKIP. Nothing.

The substack format check existed. It was wired up. I had looked at it multiple times and assumed it was working. The green light was on.

The gate was a prop. Norman [2013] calls this a false affordance — a signal that suggests a capability the system does not actually have. The gate afforded enforcement. It delivered ceremony.

## What It Was Supposed to Do

`publish-gate-bash` is a PreToolUse hook that intercepts `Bash` tool calls. When Claude Code tries to run `git push` with staged files under `publish/`, the hook is supposed to run the matching format gate — `pre-publish-substack.sh` for blog posts, `pre-publish-xhs.sh` for XHS content — and block the push if any check fails.

The intent was sound. Blog posts shouldn't go out without a format audit. The hook fires unconditionally on every Bash call. The routing logic was there. The enforcement path existed.

None of that mattered.

## The Wire Was Cut at One Variable

The culprit was a single line near the top of the script:

```bash
# OLD (broken):
SKILL_DIR="$HOME/claude-skills/publish"
```

The correct path was `$HOME/.claude/skills/publish`. The directory `~/claude-skills/` has never existed on this machine.

Downstream, the gate check looked like this:

```bash
gate="$SKILL_DIR/gates/pre-publish-substack.sh"

if [[ ! -f "$gate" ]]; then
  # OLD behavior: pass silently, no log, no warning
  continue
fi
```

Because `SKILL_DIR` pointed nowhere, `$gate` was always a path to a nonexistent file. The `[[ ! -f "$gate" ]]` check was always true. In the old script version, the branch body was `continue` — no log entry, no block, no warning. Every staged blog post silently passed the gate that was supposed to scrutinize it.

The script ran. The hook fired. The check never happened.

## Invisible to Monitoring

The enforcement log is how I'd normally catch this. Every DENY, PASS, or SKIP is supposed to append a structured entry to `~/.claude/logs/enforcement.jsonl`. When I ran the validation session, the real-home enforcement log had 38 entries across all hooks — one from `publish-gate-bash`, and that one entry was for the PR comment path (which has its own separate check), not the git push path.

Across 375 Bash invocations from the old script, the publish format gate had never emitted a verdict. Zero. You can't see an absence in a log. The monitoring was clean because the code being monitored never ran.

This is the failure mode that Leveson [2011] identifies as one of the most dangerous in safety-critical systems: a defense mechanism that appears operational but has silently failed. She calls these "inadequate enforcement of constraints" — the constraint exists on paper, the enforcement mechanism exists in code, but the path from constraint to enforcement is broken. The system's safety depends on a component that is not functioning, and no monitoring signal reveals the gap.

A fake gate is worse than no gate at all. No gate leaves a gap in your defenses and you know it. A fake gate manufactures the feeling of coverage while the gap remains. You stop looking because the light is green.

## Why It Stayed Hidden So Long

The path typo had been in place since I first wired up the hook. Every time I looked at the enforcement log and saw entries, I interpreted absence-of-push-verdicts as "nothing got staged to the publish path" rather than "the gate never runs." That interpretation was plausible — I don't push blog content every day. Absence of signal and silence both look the same when you don't know to distinguish them.

Dekker [2011] describes this as drift into failure — the gradual acceptance of abnormal conditions as normal. Each day the gate ran without blocking anything, and each day I accepted that as evidence of clean behavior rather than evidence of a broken check. The drift was invisible because the trajectory looked stable.

The validation run on April 7 was the first time I asked the right question: not "does the enforcement log have entries?" but "does the enforcement log have entries for the specific operation this gate is supposed to defend?" Those are different questions. The first one has a comforting answer. The second one had an alarming one.

This pattern generalizes. A gate that fires on tool X, supposed to enforce against operation Y within X, can silently fail to defend Y while producing normal-looking telemetry for everything else X does. The log looks healthy. The defense is gone.

## How to Find No-Op Gates in Your Own Infra

When auditing hooks or gate scripts, three questions surface most fake gates quickly.

**Does the audit trail show verdicts for the defended operation?**

Not just that the hook fired — that the hook produced verdicts on the specific paths it's supposed to defend. A hook that fires 375 times but produces 0 enforcement entries for git pushes is not defending git pushes.

**Has it ever blocked anything in this category?**

If a gate has been running for weeks and has zero DENY records for the operation type it guards, either your team is unusually disciplined or the gate doesn't reach its blocking logic. Both are worth investigating.

**Do the gate script's dependencies exist on disk?**

Run this before trusting any hook that delegates to an external script:

```bash
SKILL_DIR="$HOME/.claude/skills/publish"
ls "$SKILL_DIR/gates/" 2>/dev/null || echo "MISSING: $SKILL_DIR/gates/"
```

If the directory doesn't exist, every `[[ -f "$gate" ]]` check that guards against it is a no-op. The gate looks conditional. It isn't.

The fix in v0.4 changed two things: the path (`~/claude-skills/publish` to `~/.claude/skills/publish`) and the missing-gate behavior (silent pass to SKIP verdict logged, push blocked). A gate that can't find its script now fails loudly.

---

A gate that silently passes on failure isn't a safety check. It's a ceremony.

If your hook has never blocked anything in the category it was built to defend, verify the wiring before assuming your code is clean.

---

**References**

- Nancy G. Leveson, *Engineering a Safer World*, MIT Press, 2011.
- Donald A. Norman, *The Design of Everyday Things*, revised ed., Basic Books, 2013.
- Sidney Dekker, *Drift into Failure*, Ashgate, 2011.

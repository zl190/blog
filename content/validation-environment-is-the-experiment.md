---
title: "The Validation Environment Is Part of the Experiment"
created: 2026-04-08
date: 2026-04-10
tags: [testing, validation, hooks, isolation, experiment-design]
topics:
  - AI
  - Engineering
qc: passed
spec: "Hook validation under contaminated environments produces 40% false-negative rate. Three failure modes: contaminated environment, no-op gate, non-actionable verdict. 5 citations (Fisher 1935, Beck 2002, Beizer 1990, Hunt & Thomas 1999, Myers 2011) + personal cc-harness validation evidence | creator — practitioner discovering experimental design principles through hook validation | engineers validating AI agent infrastructure"
---

# The Validation Environment Is Part of the Experiment

Five hooks. Five NEEDS_FIX verdicts. That was the result after running the first round of harness validation on April 7, 2026. I spent most of that afternoon fixing what seemed like a backlog of real problems. Then I re-ran the same validator in an isolated environment and watched two of those five flip to SHIPPING_READY without a single code change.

The hooks hadn't changed. The environment had.

That 40% false-negative rate was not a subtle statistical quirk. It was a basic experimental design mistake: I had run the validation while more than thirty other hooks were simultaneously active in the same Claude Code session. Those hooks interfered with each other in ways I had not anticipated, and the contamination looked exactly like real bugs.

Fisher described this problem in 1935 in *The Design of Experiments*: a confounded factor is one whose effect cannot be separated from the effect you are trying to measure. When I validated `research-gate` inside a live session with thirty-plus default hooks loaded, I was not measuring `research-gate`. I was measuring `research-gate` plus everything else.

## How the Contamination Worked

The cc-harness project runs validation via `claude -p` with a single hook loaded. The intent is isolation: one script under test, clean HOME, no interference from the surrounding configuration. In the first round, I ran the validators from within my regular Claude Code session. That session already had the full hook stack active.

The consequence was that `PreToolUse` and `PostToolUse` events during validation were hitting not just the hook under test, but every other hook in the chain. Some of those hooks log aggressively. Some exit early with non-zero codes. Some write to shared state files that the validator script also reads. The resulting signal was noise dressed as signal.

`research-gate` was the clearest case. In the contaminated run, it came back NEEDS_FIX with low confidence. In the isolated re-run, it passed. The script was correct the whole time. What failed was the measurement.

`task-verify` was the same. Advisory-only, no blocking path, three confirmed organic fires from prior sessions -- it should have been SHIPPING_READY. In a live environment with thirty-plus hooks competing for the same event slots, the validator could not cleanly attribute behavior to the right source.

What makes contaminated validation particularly dangerous is that the result is plausible. NEEDS_FIX is a reasonable verdict for any hook; hooks frequently have real issues. There is no obvious signal that the verdict is about the environment rather than the code. I went into the next session ready to fix things and spent time debugging problems that did not exist.

### What isolation actually required

The isolated re-run used `claude-p (HOME-isolated, single-hook)` -- a fresh HOME directory with only the hook under test registered in `settings.json`. No session history. No other hook registrations. No shared log files from prior runs. This is not a special technique; it is the minimum condition for a controlled experiment. The fact that the first run did not meet that minimum is what produced the false negatives.

The mechanics of isolation matter. "Fresh HOME" means the validator's environment variables point to a directory that contains no prior `.claude/logs/`, no `settings.json` with competing hooks, and no shared temp files that another hook might have written. A single stale log file can confuse a validator that counts log entries as its sample. A single competing `PreToolUse` hook can change the exit code that the session sees and produce a verdict the hook under test never generated.

## The Other Direction: No-Op Gates

False negatives from contamination are one failure mode. The inverse is a gate that runs, produces verdicts, and enforces nothing. I wrote about this in more detail in Draft 1 of this series, but the short version is: a gate that is never triggered for a real violation is not providing coverage, regardless of how clean its exit codes look.

`framework-audit-gate` was registered in `settings.json` only for the `Write` tool. The hook comment header said "Hook: PostToolUse on Write/Edit." It audited `Edit` events not at all. A developer could use `Edit` to strip out three of four required framework components from a design file, and the gate would never fire.

This is a false positive at the meta level. The system appeared to have enforcement coverage it did not have. The validation found this gap: it read the settings registration, compared it against the header claim, and flagged the contradiction as a BLOCKING issue. Without the validation, the gap would have been invisible.

`task-verify` had the same structural property in reverse: it is advisory-only by design. It fires, prints a checklist to stdout, and always exits 0. That is the correct behavior for an advisory hook. But it means the hook's "validation" result tells you nothing about whether the advice was acted on. The audit trail confirms the hook ran; it cannot confirm it mattered. Knowing that distinction before you ship is what the validator is for.

## When NEEDS_FIX Earns Its Keep

The third case is the one that justified the whole apparatus.

`publish-gate-bash` validates that Claude does not post GitHub comments without a review draft on disk. When I rewrote the script to improve its coverage, I introduced a portability bug in the `file_mtime` function:

```bash
file_mtime() {
  stat -f %m "$1" 2>/dev/null || stat -c %Y "$1" 2>/dev/null || echo 0
}
```

On macOS, `stat -f %m FILE` returns the modification time as a plain integer. On Linux, `stat -f` means `--file-system` -- the `-f` flag is not a format specifier. GNU `stat` interprets `-f` as a request for filesystem statistics, writes a multi-line block to stdout (not stderr), and exits 0. The `2>/dev/null` suppresses nothing because the output is on stdout.

The `||` then runs `stat -c %Y FILE`, which returns the correct epoch integer. But both outputs are captured in `MTIME`. The value assigned to `MTIME` is a multi-line string starting with `File: "/tmp/..."`. When the script reaches `$((NOW - MTIME))`, bash's arithmetic evaluator hits `File` as the first token, treats it as an unbound variable under `set -u`, and throws:

```
publish-gate-bash.sh: line 83: File: unbound variable
```

Exit code: 1. Claude Code treats any non-2 non-zero exit as a hook error and allows the operation to proceed. The draft-freshness check, the stale-draft block, and the too-long-body block were all broken on Linux. Only the "no draft file at all" path worked.

The validator caught this in about five minutes. The validation card listed the affected line, reproduced the failure from a known input, and specified the fix:

```bash
file_mtime() {
  stat -c %Y "$1" 2>/dev/null || stat -f %m "$1" 2>/dev/null || echo 0
}
```

Try GNU `stat -c %Y` first. Fall back to BSD `stat -f %m`. The fix is five characters reversed in ordering. Without the isolated re-run under Linux, the bug would have shipped.

This is what NEEDS_FIX is supposed to look like: a specific line, a reproducible failure path, and an exact fix. A validator that returns NEEDS_FIX with no line numbers and no reproduction case is not giving you information; it is giving you homework.

## The Environment Is the Experiment

In empirical research, you spend considerable effort separating the treatment effect from the noise introduced by the measurement apparatus itself. Beck's discussion of test isolation in *Test-Driven Development: By Example* [2002] frames this as a basic requirement: a test that interacts with shared state can only tell you about the combination of the code under test and whatever state it found. Beizer's *Software Testing Techniques* [1990] makes the same point about test environment contamination more formally. Myers, Sandler, and Badgett [2011] extend this to the psychology of testing itself: when the tester expects the software to work, they unconsciously design tests that confirm rather than challenge. My contaminated first run was exactly this failure mode — plausible NEEDS_FIX verdicts that I accepted without questioning the measurement conditions.

In software validation, the same logic applies and is routinely ignored. Running a hook validator inside the same session the hook is meant to govern produces a result that is a function of that session's state, not the hook's correctness.

The cc-harness validation format requires validators to report their environment explicitly: `validator: claude-p (HOME-isolated, single-hook)`. That one metadata line is load-bearing. It tells you whether the result is evidence about the hook or evidence about the hook inside a particular context. A result without that line is not reproducible; it is a snapshot.

The three cases from this session illustrate three distinct failure modes:

| Failure mode | Mechanism | Consequence |
|---|---|---|
| Contaminated environment | 30+ hooks loaded during validation | False negatives: NEEDS_FIX for passing hooks |
| No-op gate | Edit tool not registered | False positives: apparent coverage with real gaps |
| Non-actionable verdict | No line numbers, no repro case | NEEDS_FIX that cannot be acted on |

All three are environment problems, not code problems. The first is about what was running during measurement. The second is about what was registered as in-scope. The third is about what information the measurement surface exposed.

The cleanest framing I found: the validation environment is part of the experiment. A result produced in a contaminated environment is not wrong data; it is data about the wrong thing. And a gate that cannot block real violations is not enforcement; it is logging with extra steps.

## A Checklist for the Next Run

Before treating a validation result as ground truth, I now ask three questions in order:

**1. Is the environment isolated?**
Does the validator run with only the hook under test registered? Is it a fresh HOME? Are no other hooks active that share the same event slots, log files, or state? If no, the result measures a combination of effects, not the hook under test.

**2. Is the audit trail auditable?**
Can I verify what fired and what did not? Can I read back the enforcement log entries and confirm the sample includes real production events, not only synthetic test inputs? Does the sample size support the confidence level claimed? If no, the precision and recall figures are not estimates; they are aspirations.

**3. Is a NEEDS_FIX verdict actionable?**
Does the card contain a specific failing input, an exact line reference, and a testable fix? A NEEDS_FIX without a reproduction case is a flag that says "something is wrong here" and nothing more. That is useful as a starting point. It is not useful as a shipping gate.

The system that catches its own bugs is worth maintaining. On April 7, the validator caught a Linux portability failure that would have silently disabled a security-relevant gate on every non-macOS deployment. It found it in a single pass. That is the payoff for the overhead of isolated re-runs.

But it only found it because the environment was clean enough to let the signal through.

---

**References**

- Ronald A. Fisher, *The Design of Experiments*, Oliver & Boyd, 1935.
- Kent Beck, *Test-Driven Development: By Example*, Addison-Wesley, 2002.
- Boris Beizer, *Software Testing Techniques*, 2nd ed., Van Nostrand Reinhold, 1990.
- Andrew Hunt and David Thomas, *The Pragmatic Programmer*, Addison-Wesley, 1999.
- Glenford J. Myers, Corey Sandler, and Tom Badgett, *The Art of Software Testing*, 3rd ed., Wiley, 2011.

---
title: "N=2: The Test That Found Two Bugs in Ten Minutes"
created: 2026-04-08
date: 2026-04-10
tags: [testing, debugging, bash, boundary-testing, queues]
topics:
  - Engineering
qc: passed
spec: "N=1 tests prove code runs, N=2 tests prove it works. Two bugs (SSH stdin consumption, path shape mismatch) invisible at N=1, immediate at N=2. 3 citations (Dijkstra 1970, Beizer 1990, Myers 2011) + personal cc-remote queue evidence | creator — practitioner finding loop bugs via pointed coverage question | engineers testing sequential processing"
---

# N=2: The Test That Found Two Bugs in Ten Minutes

The question came mid-session: "Has the task/result queue been walked and tested?"

Honest answer: partially. I'd run the happy path with a single entry. It worked. I moved on.

That question forced me to actually run the queue with two entries. Within ten minutes I had two bugs, both invisible to every N=1 test I'd run before.

## What "Tested" Actually Meant

The queue pull loop reads pending remote agent tasks, runs them over SSH, and marks results as pulled. With one entry in, one entry came out. The mark-pulled file existed. The log said success.

That's not a test. That's a demonstration.

A test would have asked: what happens when there's more than one? I hadn't asked. So I hadn't noticed.

## Bug 1: SSH Slurps Your Loop

The pull loop was structured roughly like this:

```bash
while IFS= read -r entry; do
    ssh remote "run-task $entry"
done < <(list-pending-tasks)
```

With one entry, this works fine. With two, the loop processes the first entry and exits. The count reads "2 entries to pull" then "1 pulled, 0 failed." The second entry disappears silently.

The reason: `ssh` without `-n` reads from stdin. Inside a `while read` loop fed by process substitution, ssh consumes the remaining lines meant for the loop. The second iteration has nothing to read.

Fix: read everything into an array before the loop starts.

```bash
mapfile -t entries < <(list-pending-tasks)
for entry in "${entries[@]}"; do
    ssh remote "run-task $entry"
done
```

This is a known bash pitfall. Documented. I've hit variants of it before. I still didn't catch it because I ran N=1 and called it done.

## Bug 2: The Shape Mismatch

The second bug was quieter. The path prefix for `REMOTE=local` was being constructed differently depending on which helper function you called — two helpers, two path shapes. The pull loop used one; the mark-pulled function used the other.

With N=1, both code paths ran, both produced a path, a file got written. I checked the file existed. Done.

With N=2 and actual post-state verification — did both entries show up as pulled? — the answer was no. One entry was correctly marked. The other was written to a different path, the wrong one. The task appeared complete in the log. The state was wrong.

Neither bug had any symptom at N=1. Both appeared immediately at N=2 with post-state verification.

## The Asymmetry Between Running and Working

N=1 tests confirm that your code *runs*. N=2 tests confirm that your code *works*.

Dijkstra [1970] observed that testing can only show the presence of bugs, not their absence. But there is a hierarchy within testing itself: some tests are structurally incapable of revealing certain classes of bugs. An N=1 test cannot find iteration-boundary defects. It is not a weak test for these bugs — it is a non-test.

The N=1 test gave me correct-looking output every time. The individual operations all succeeded — ssh ran, mark-pulled ran, a file was written. The bugs lived in the interactions: how multiple loop iterations share stdin, and how two code paths that should agree on path shape actually diverge.

Writing more unit tests wouldn't have found either of these. The ssh stdin issue is a runtime interaction between process substitution and subprocess stdin — it only manifests across iterations. The path shape mismatch requires two distinct execution paths to produce observable divergence. Both bugs are structurally invisible inside a single invocation.

What found them: asking a pointed question about coverage, running N=2, and then checking whether the outputs were actually correct.

## Where N=2 Applies More Broadly

The ssh-stdin pitfall is specific to bash loops, but the underlying pattern is general. Beizer [1990] formalized why boundary conditions are where bugs concentrate: the transition between 0 and 1 items, between 1 and 2, between an empty loop and a populated one. My N=1 test sat squarely inside the boundary — not on it.

Any loop that processes items sequentially is only tested when it processes more than one. A loop body that works once doesn't prove the iteration boundary works.

The same principle applies to state machines: does the system transition correctly from state A to state B and then to state C? Testing A-to-B proves nothing about B-to-C. For queues, pipelines, and multi-step workflows, the transitions between steps are where the bugs hide — not inside the steps themselves.

The completion queue in cc-remote illustrates this. The queue has accumulated 17 entries across multiple sessions. An N=1 test would have proven that one record can be appended and read back. The real test — that multiple records across multiple agents complete correctly, mark as pulled, and don't interfere with each other — only becomes visible with N>=2, repeated, with post-state verification after each drain.

## Three Questions to Ask Before Calling It Tested

Before you mark any loop or queue logic as covered:

**1. What's the minimum N that makes this interesting?**
If your logic processes items in a loop, N=1 tests exactly one iteration. That's coverage of one body execution, not coverage of the loop. Run at least N=2. Myers, Sandler, and Badgett [2011] call this the difference between exercising a path and exercising a boundary — and boundaries are where the defects cluster.

**2. Are you verifying post-state, or just checking for absence of errors?**
Exit code 0 and a "success" log line do not mean the right thing happened. Check the actual output: the file that should exist, the entry that should be marked, the count that should match.

**3. Which subprocess in your loop touches stdin?**
SSH, GPG, any interactive tool reads from stdin by default. If any of them lives inside a `while read` loop, you have a latent bug. It will not show up until N>=2.

---

Questioning your coverage finds bugs faster than writing more tests. A pointed question about what you've actually exercised is cheaper than doubling your test count — and it finds the bugs that your existing tests structurally cannot see.

---

**References**

- Edsger W. Dijkstra, "Notes on Structured Programming," EWD249, 1970.
- Boris Beizer, *Software Testing Techniques*, 2nd ed., Van Nostrand Reinhold, 1990.
- Glenford J. Myers, Corey Sandler, and Tom Badgett, *The Art of Software Testing*, 3rd ed., Wiley, 2011.

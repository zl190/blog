---
title: "The Half-Async Trap"
created: 2026-04-08
date: 2026-04-10
tags: [distributed-systems, reliability, async, agent-infrastructure, queues]
topics:
  - AI
  - distributed-systems
qc: passed
spec: "Half-async systems fail silently when request side is synchronous but result side is async. Fix: symmetric enqueue (atomic append on both sides). 5 citations (Helland 2017, Lamport 1978, Haerder & Reuter 1983, Bernstein et al. 1990, Apache Kafka) + personal cc-remote system evidence | creator — practitioner discovering distributed systems principles through agent infrastructure | engineers building delegation or remote execution tools"
---

# The Half-Async Trap

The completion queue worked. I'd designed it carefully: when a remote agent finished, it
appended a JSON line to `~/cc-remote-output/.completion-queue.jsonl` with a timestamp and
a `pulled` flag. My Mac would poll that file when ready, consume the completed tasks, and
move on. Async by design. Sleep-resilient. If the Mac was closed when a job finished, the
record waited.

The spawn side was a different story.

To launch a task, my Mac opened an SSH connection to the remote machine, created a task
directory, wrote a runner script, and started a tmux session. This took under two seconds
when the network cooperated. But those two seconds crossed a reliability boundary: the SSH
session had to stay alive long enough to finish all five setup steps. Close the laptop between
writing the runner and chmod-ing it, and the SSH connection dropped. The remote was left with
a half-created directory — no prompt file, or a runner that would never be made executable.
No error surfaced on the Mac. The remote had no way to distinguish "setup in progress" from
"setup abandoned." Partial state, silent.

I had built an async result side and a synchronous request side. They looked symmetric from
the outside. They weren't.

## What the Pull-Queue Was Getting Right

The completion queue entry I could observe directly:

```json
{"name": "validate-publish-gate-bash-v0.4.1",
 "completed_at": "2026-04-07T17:46:36Z",
 "output_dir": "/home/zliang/cc-remote-output/validate-publish-gate-bash-v0.4.1",
 "status": "success",
 "pulled": false}
```

The `pulled` field is the key design choice. The Mac-side poller marks entries consumed after
reading them. The remote runner that writes these records doesn't need to know when they will
be read. This is the same pattern that Apache Kafka uses for consumer-managed offsets: the
consumer tracks its own position in the log, the producer appends blindly. Both sides are
decoupled in time.

Pat Helland [2017] called this "life beyond distributed transactions" — systems where
participants cannot rely on coordinated atomic commits and must instead use idempotent,
append-based protocols. The pull-queue is exactly that pattern. Neither side needs to know the
other's state at the moment of writing.

That decoupling is what made the result side robust. The Mac could be offline for hours, come
back, and drain the queue in order. No records lost. No coordination required at the moment
of completion.

## Why the Request Side Was Fragile

Spawning a task involved the Mac reaching across a network boundary to execute five ordered
steps on the remote machine:

1. `mkdir -p` the task directory
2. Write `_runner.sh`
3. Write `_prompt.txt`
4. `chmod +x _runner.sh`
5. `tmux new-session -d -s task-name bash _runner.sh`

These steps have no atomic guarantee. They are sequential shell commands inside a single SSH
session. If the session drops between step 2 and step 3, you get a directory with a runner
but no prompt. If it drops after step 4 but before step 5, you get a ready runner that
nothing will ever execute.

This is the partial failure problem that Lamport [1978] identified as fundamental to
distributed systems: in an asynchronous environment, there is no way for one node to
distinguish a slow peer from a dead one. My Mac could not tell whether the remote had
received step 3 or not. The remote could not tell whether the Mac was still sending or had
disconnected. Both sides had incomplete information about the other's state.

Haerder and Reuter [1983] defined atomicity as "all or nothing" — either all operations in
a transaction complete, or none of them take effect. My five-step spawn was a transaction
without any of the guarantees. POSIX does not give you a transaction primitive that spans
multiple filesystem operations across SSH.

The pull-queue had avoided this class of problem entirely. There was one writer (remote runner)
and one reader (Mac poller), operating on a single append-only file. Appending a single JSON
line under 4KB is atomic on local Linux filesystems (ext4, xfs) with `O_APPEND` — the kernel
completes the write as a single page-aligned operation, so the reader either sees the full
record or nothing. No partial records.

The spawn side had the same two parties but inverted: one remote machine being written to by
one Mac across a network. One of these patterns survives connection interruption. The other
requires the connection to stay alive through all five steps.

## The Fix: Symmetric Enqueue

The fix applies the same idea to the request side. Instead of the Mac SSHing to do setup work,
the Mac appends one line to a task queue file:

```json
{"task": "validate-new-gate",
 "submitted_at": "2026-04-07T18:30:00Z",
 "prompt_ref": "cc-remote-input/validate-new-gate/_prompt.txt"}
```

A single `>>` append. Atomic. The Mac's job ends there. Close the lid immediately after —
nothing breaks, the record is in the queue.

On the remote side, a consumer runs on a 1-minute cron schedule. It reads the queue, skips
entries already processed (tracking its own offset, exactly like the completion-queue poller),
and runs each pending task. The runner scripts get created on the remote by the remote
consumer — no Mac SSH session involved in setup. If the consumer crashes mid-run, the offset
has not advanced; it picks up the same entry on the next tick.

Bernstein, Hsu, and Mann [1990] formalized this exact approach: making request/response pairs
reliable by routing both sides through persistent queues. Their insight was that recoverable
requests need the queue to outlive both the requester and the responder. My completion queue
already had this property. The fix was giving the request side the same treatment.

The API becomes symmetric: `enqueue` (Mac appends to task queue) and `pull-queue` (Mac reads
completion queue). Both sides are async relative to the other. Both sides fail cleanly.

### On latency

The synchronous spawn felt fast: under two seconds from submission to agent running. A
1-minute cron consumer changes this to 0-60 seconds of startup wait, averaging around 30
seconds.

For tasks completing in 3-10 minutes, this is invisible. My remote agents ran around 3 minutes
on average (cc-live-brief validation, 2026-04-07); a 30-second startup overhead is a rounding
error. For interactive sessions where you're watching output in real time, the synchronous
model is genuinely better. Know which one you're building before optimizing latency.

If sub-second response matters and you're on Linux, inotifywait (from inotify-tools) can
trigger the consumer immediately on file write:

```bash
inotifywait -m -e close_write ~/.task-queue.jsonl | while read _; do
    ~/scripts/drain-task-queue.sh
done
```

This gives the best of both: atomic enqueue from Mac, fast consumer response on remote. It
costs a persistent process on the remote.

## This Pattern Shows Up Everywhere

Half-async systems emerge whenever a tool grows incrementally. The result side gets async
treatment early because that is where the obvious requirement lives: nobody wants a blocking
wait for a slow background job. The request side stays synchronous because "just SSH and set
it up" works until it doesn't.

The tell is a reliability mismatch. One side survives connection interruption; the other
leaves partial state. One side is idempotent; the other needs a rollback procedure nobody
wrote. One side can operate while the orchestrator is offline; the other cannot start without
a live connection.

Common places to look: CI pipeline triggers (webhook sync, result async), deploy scripts
(push sync, health check async), any system that "starts" work remotely and "reads" results
later. The same mismatch shows up in task queues where submission is a blocking HTTP call
but result retrieval is a poll. The submit can time out. The poll can retry. They are not
the same problem.

## Checklist: Finding the Half-Async Parts of Your System

For any delegation tool you build or maintain:

1. **Can the request side complete atomically?** A multi-step setup over SSH is not atomic.
   A single-line append to a file is. If no: you have partial-state risk on every dropped
   connection.

2. **What happens if the orchestrator disconnects mid-request?** If the answer is "partial
   state with no recovery path," the request side needs redesign. Not retry logic — redesign.

3. **Does the consumer track its own offset?** If the consumer requires the producer to stay
   involved after submission (e.g., wait for acknowledgment), it is not truly async.

4. **Is your latency requirement actually the same on both sides?** If result-side async is
   acceptable but request-side latency "feels wrong," measure whether it matters given your
   actual task durations. The mismatch is often aesthetic.

5. **Do failure modes match?** If result-side failures are logged and recoverable but
   request-side failures are silent partial state, fix the request side first.

The rule: async means the two sides are decoupled in time. If only one side is decoupled,
you have not solved the reliability problem — you have moved it to the side you didn't think
about.

---

**References**

- Pat Helland, "Life Beyond Distributed Transactions," *Communications of the ACM* 60(2), 2017.
- Leslie Lamport, "Time, Clocks, and the Ordering of Events in a Distributed System," *Communications of the ACM* 21(7), 1978.
- Theo Haerder and Andreas Reuter, "Principles of Transaction-Oriented Database Recovery," *ACM Computing Surveys* 15(4), 1983.
- Philip A. Bernstein, Meichun Hsu, and Bruce Mann, "Implementing Recoverable Requests Using Queues," *ACM SIGMOD Record* 19(2), 1990.
- Apache Kafka, "Consumer Group Protocol," kafka.apache.org/documentation.

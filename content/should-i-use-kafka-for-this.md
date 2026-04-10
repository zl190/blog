---
title: "Should I Use Kafka for This?"
created: 2026-04-08
date: 2026-04-10
tags: [infrastructure, queues, kafka, pragmatism, scale]
topics:
  - software-engineering
qc: passed
spec: "Scale rubric for message queue selection: JSONL→SQLite→Redis→Kafka by throughput. Infrastructure cosplay = adopting tooling whose complexity exceeds requirements. 5 citations (Kleppmann 2017, Kreps/Narkhede/Rao NetDB 2011, Redis, SQLite, Kreps 2013) + personal cc-remote queue evidence | creator — practitioner building 10-msg/day queue for agent delegation | engineers choosing message infrastructure"
---

# Should I Use Kafka for This?

The honest answer is almost always no.

I've seen this question come up in Slack threads, architecture reviews, and 1:1s with engineers who have perfectly reasonable problems. They're building something that needs to pass messages between two processes, or queue work items, or notify a downstream service when something finishes. And someone in the room says: "What about Kafka?"

The trouble is that Kafka is the answer to a very specific problem — one that most of us don't have. Using Kafka for a queue that processes ten events per day is not sophisticated engineering. It's infrastructure cosplay.

## The Scale Rubric

Here's the rule I use:

| Throughput | Right tool |
|------------|------------|
| Single-digit / hour | Flat JSONL file (`>>file.jsonl`) |
| Hundreds / minute | SQLite |
| Thousands / second | Redis Streams |
| Millions / second | Apache Kafka |

Each row is roughly an order-of-magnitude jump in complexity as well as throughput. You don't just get more capacity — you get more moving parts, more ops burden, more failure modes, and more on-call risk. The jump from JSONL to Kafka isn't a dial. It's four different machines.

The rubric isn't original to me. It crystallizes common engineering folklore — the kind of thing Martin Kleppmann spells out carefully in *Designing Data-Intensive Applications* [2017]: match your storage and messaging infrastructure to your actual load, not your imagined load. The mistake he identifies, and that I keep seeing in practice, is building for peak theoretical load rather than observed reality.

## Tonight's Case: Ten Messages Per Day

On April 7, 2026, I built the completion queue for cc-remote — a pull-based notification system that tells the main Claude Code session when a background agent has finished its job.

The scale of this problem: on a heavy day I dispatch maybe a dozen background agents. Each one writes a single completion record when it finishes. The orchestrator polls for unpulled records and processes them. We're talking ten messages per day, maybe twenty on an active day. There is no burst. There is no concurrency worth speaking of. There is a single writer (each `_runner.sh` script) and a single reader (the session that polls).

Here is the entire queue implementation:

```bash
# === Phase G: completion-queue append ===
QUEUE_ENABLE="true"
if [[ "$QUEUE_ENABLE" == "true" ]]; then
  QUEUE="$ORIG_HOME/cc-remote-output/.completion-queue.jsonl"
  if [[ $CLAUDE_EXIT -eq 0 ]]; then status="success"; else status="failure"; fi
  { jq -cn --arg n "$TASK_NAME" --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
       --arg dir "$ORIG_HOME/cc-remote-output/$TASK_NAME" --arg s "$status" \
       '{name:$n, completed_at:$ts, output_dir:$dir, status:$s, pulled:false}' \
       >> "$QUEUE"; } 2>/dev/null
fi
```

That's the write path. A single `jq -cn` invocation builds a JSON object and appends it to the queue file with `>>`. The write is POSIX-atomic for small payloads on local Linux filesystems (ext4, xfs) with `O_APPEND` — the kernel completes the write as a single operation. No locking needed. No broker. No schema registry.

The read path marks records as consumed by flipping `pulled:false` to `pulled:true` — done with a short `jq` one-liner that rewrites only the unread records. The whole thing is around 30 lines of bash spread across writer and reader. The `.completion-queue.jsonl` file as of tonight has seven records. Two are pulled, five are not.

You can look at this file in any text editor and understand the full state of the system. That's not a limitation. That's a feature.

A concrete example from tonight's queue file:

```jsonl
{"name":"validate-publish-gate-xhs-v0.2","completed_at":"2026-04-07T17:45:53Z","output_dir":"/home/zliang/cc-remote-output/validate-publish-gate-xhs-v0.2","status":"success","pulled":true}
{"name":"build-claim-registry","completed_at":"2026-04-07T17:58:52Z","output_dir":"/home/zliang/cc-remote-output/build-claim-registry","status":"success","pulled":false}
```

Two records. The first is pulled (processed). The second is pending. The full system state is two lines of JSON. I don't need a dashboard to tell me what's happening here.

## Infrastructure Cosplay

Let me be precise about what I mean by infrastructure cosplay: it's when you adopt tooling whose operational complexity significantly exceeds what your problem requires, and the gap is filled by vibes rather than requirements.

Apache Kafka ([kafka.apache.org](https://kafka.apache.org)) is genuinely impressive engineering. It was built at LinkedIn to handle hundreds of millions of events per day across a distributed, replicated, fault-tolerant log. The original paper by Kreps, Narkhede, and Rao [NetDB 2011] describes a system designed for a specific set of constraints — high throughput, durable replication, consumer group coordination — that most applications simply do not have.

Redis Streams ([redis.io](https://redis.io), introduced in Redis 5.0) is a better fit for high-throughput single-server workloads: thousands of events per second, optional persistence, consumer groups, and a much smaller operational footprint than Kafka. If you're building a job queue for a web application that handles significant traffic, Redis Streams is where I'd look.

SQLite ([sqlite.org](https://sqlite.org)) is an underrated queue backend. Write-ahead logging (WAL mode, introduced in SQLite 3.7.0) gives you concurrent reads with a single writer, and for hundreds of writes per minute the I/O is irrelevant. If you need ordered processing, dead-letter queues, retry counts, and schema validation, SQLite gives you all of that with a single file and zero network stack. The SQLite documentation notes that WAL mode typically improves read concurrency significantly for write-heavy workloads.

JSONL with `>>` gets you to the first row of the table. No dependencies. No daemon. No configuration. Append-only, human-readable, trivially inspectable.

The temptation to skip ahead is real. Kafka has good documentation. There are tutorials everywhere. It feels like a serious engineering decision. But the operational cost is also real: ZooKeeper (or KRaft), brokers, partitions, consumer groups, offset management, monitoring, and a cluster that needs to stay healthy. For ten messages per day, you're carrying a freight locomotive to cross the street.

The cosplay pattern usually shows up in one of two ways. First: the engineer has worked somewhere that ran Kafka at scale, and now every queue problem looks like a Kafka problem. Second: the engineer wants the system to feel production-grade before it has production traffic. Both are understandable. Neither is a good reason to add an operational dependency you'll spend years maintaining.

## The Real Risk

I want to be honest about when this rubric breaks down.

If your throughput estimate is wrong — if your system's message rate can spike unexpectedly by three orders of magnitude — then starting at JSONL creates a migration problem later. The rubric works when you have reasonable confidence in your scale envelope. It breaks when you're building infrastructure for a system whose growth profile you don't understand.

Jay Kreps' essay "The Log: What Every Software Engineer Should Know About Real-Time Data's Unifying Abstraction" [LinkedIn Engineering, 2013] is worth reading for the conceptual model, not the tool recommendation. The point is that the log abstraction is universal; the implementation is not. A flat JSONL file *is* a log. SQLite's WAL *is* a log. Kafka is a distributed, replicated, partitioned log. The abstraction scales from your laptop to a data center. The implementation should not.

The other scenario worth flagging: if you're building a public API where clients generate events, you genuinely don't know your scale envelope in advance. In that case, start with the simplest thing that lets you observe actual behavior, then migrate upward when your measurements justify it. "We might get a lot of traffic" is not a load number. When you have a load number, you can pick a tool.

## The Checklist

Before reaching for a message queue, answer these:

1. **What is your actual throughput?** Count events per unit time in the real system, not the theoretical max. Single-digit per hour → flat file. Hundreds per minute → SQLite. Thousands per second → Redis. Millions per second → Kafka.

2. **Do you have multiple concurrent writers?** JSONL with `>>` is safe for single writers. For multiple writers, move to SQLite (WAL mode handles this). For distributed writers across machines, you need a broker.

3. **Do you need consumer groups or replay?** If multiple independent consumers need to read the same messages, or if you need to replay from an offset, SQLite starts getting awkward and Redis Streams becomes the right call.

4. **What's your tolerance for data loss?** JSONL on a local disk is as durable as the disk. Redis is in-memory by default (persistence is configurable). Kafka with `acks=all` gives you replicated durability. Match the tool to the actual durability requirement.

5. **Can you read the queue state in a text editor?** If yes, you're probably at the right level of complexity. If your queue requires a specialized CLI just to observe it, make sure that cost is justified.

The cc-remote queue passes all five checks: observed throughput is ~10/day, single writer per task, no consumer groups needed, local-disk durability is sufficient, and you can `cat .completion-queue.jsonl` to see everything.

Pick the smallest tool that satisfies your actual constraints. Infrastructure is not a proxy for seriousness.

---

**References**

- Martin Kleppmann, *Designing Data-Intensive Applications*, O'Reilly, 2017.
- Jay Kreps, Neha Narkhede, and Jun Rao, "Kafka: A Distributed Messaging System for Log Processing," *NetDB Workshop*, 2011.
- Jay Kreps, "The Log: What Every Software Engineer Should Know About Real-Time Data's Unifying Abstraction," LinkedIn Engineering blog, 2013.
- SQLite, "Write-Ahead Logging," sqlite.org/wal.html.
- Redis, "Introduction to Redis Streams," redis.io/docs/data-types/streams.

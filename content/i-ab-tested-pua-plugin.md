---
title: "I A/B Tested the PUA Plugin and Found a Blind Spot"
format: blog
status: published
created: 2026-03-18
published_date: 2026-03-18
language: en
tags: [AI, claude-code, experiments, debugging]
qc: passed
---

# I A/B Tested the PUA Plugin and Found a Blind Spot

[PUA](https://github.com/tanweai/pua) is one of the most popular Claude Code plugins right now. It uses corporate pressure rhetoric to force AI into exhausting every possible solution before giving up. The author claims +36% fix rate based on 18 controlled experiments. In my experience, it does feel effective.

But I wanted to know: when does PUA fail?

## The Experiment

I designed 3 debugging scenarios with planted bugs. Each scenario has multiple "trap" fixes — plausible but wrong approaches that make things worse. I ran each scenario twice: PUA alone vs PUA plus 4 supplementary rules I wrote.

| # | Scenario | Error Location | Root Cause Location |
|---|----------|---------------|-------------------|
| S1 | TypeError: str < int | router.py | config.py |
| S2 | JSONDecodeError | client.py | serializer.py |
| S3 | Wrong count in pipeline | pipeline composition | in-place mutation |

The interesting one is S2. The traceback points to the HTTP layer (JSONDecodeError in `deserialize_response`), but the root cause is in serialization (`serialize_payload` lacks a datetime encoder). A broad `except Exception` in between swallows the real TypeError, sends an empty body, the server returns plaintext "Bad Request," and `json.loads` on that plaintext produces the misleading JSONDecodeError.

## Results

S1 and S3: both conditions solved it correctly on the first try. No difference.

S2 is where it gets interesting. I ran each condition 3 times:

| Run | PUA only | PUA + supplementary rules |
|-----|----------|--------------------------|
| 1 | No code changes | Correct fix (serializer.py) |
| 2 | No code changes | Correct fix + extra cleanup |
| 3 | Wrong file (client.py) | No code changes |
| **Correct fix rate** | **0/3** | **2/3** |

Total cost: $3.50 across all runs. Claude Sonnet 4.6.

## What Happened in S2

PUA alone failed 3 times, but not by giving up. The failure mode is more subtle.

**Failure mode A: Perfect analysis, zero delivery (2 out of 3 runs)**

The AI produced a flawless causal chain:

> `serialize_payload` has no DatetimeEncoder → `json.dumps` raises TypeError → `client.py`'s `except Exception` swallows it and sets `body = None` → empty body sent → server returns plaintext "Bad Request: empty body" → `deserialize_response` tries `json.loads` on plaintext → JSONDecodeError

Root cause identified. Fix known. Then... no edits. The AI concluded: "If I fix serializer.py, TestOriginalBug will fail." Technically correct — those tests assert the bug exists, so they naturally fail once the bug is fixed. The AI treated expected test failures as a reason not to act.

**Failure mode B: Wrong file (1 out of 3 runs)**

On the third run, the AI finally edited something — but it changed `client.py` (removing the try/except) instead of `serializer.py` (adding a DatetimeEncoder). This makes the error message more accurate (TypeError instead of JSONDecodeError) but doesn't fix the root cause. Datetime objects still can't be serialized.

## Why PUA's Existing Rules Didn't Help

PUA already has rules for this:

- "Only answering questions instead of solving problems" → "You're an engineer, not a search engine"
- "Claims 'done' without running verification" → "Where's the evidence?"

But these didn't trigger. The AI didn't think it was "only answering" — it believed it was doing the right thing by not breaking passing tests. PUA detects **giving up** and **laziness**. The S2 AI did neither. It was **overcautious**.

This is PUA's blind spot: **analysis ≠ delivery**. Exhausting all analytical paths ≠ exhausting all fix paths. The brainstorm/execute split I describe in [[brainstorm-is-training-execution-is-inference|this post]] is one way to manage context so that analysis and delivery don't compete for the same attention budget.

## The One Rule That Helped

I tested 4 supplementary rules. Only one showed any effect: requiring a one-line structured diagnosis before any edit.

```
[Diagnosis] The problem is ___, because ___ [evidence type]
```

The hypothesis for why this works: writing "the problem is serializer.py missing a DatetimeEncoder" creates commitment to act. Analysis can stay internal and produce no output. But once you write a structured diagnosis, not acting on it becomes cognitively harder.

This isn't a silver bullet — it still failed 1 out of 3 times. But 0/3 → 2/3 is a real signal on a reproducible failure. The structured diagnosis approach became [[the-researcher-persona|TheResearcher persona]].

## Limitations

I'm not overselling this:

- **N=3 per condition.** Not enough for statistical significance.
- **Sonnet only.** Opus might behave differently.
- **S2 specific.** No effect on S1 or S3.
- **Mechanism unclear.** Could be the diagnosis format, could be the longer system prompt, could be something else.

## What I'd Do Differently

The scenarios were too easy. S1 and S3 were solved immediately by both conditions. To properly stress-test PUA, I'd need scenarios where:

1. The codebase is larger (10+ files, not 2-3)
2. Multiple misleading signals compete for attention
3. The correct fix requires understanding code the AI hasn't been shown

If you want to run your own experiments, the scenario code and test suites are at [the experiment repo](https://github.com/tanweai/pua/pull/82).

## Takeaway

PUA works. In most scenarios, it does exactly what it claims — prevents the AI from giving up too early.

But there's a gap between "analyzing a problem" and "delivering a fix." PUA closes the first gap. It doesn't always close the second. One line of structured diagnosis before editing — not a methodology, not a framework, just one line — helped close it from 0/3 to 2/3 on the one scenario where PUA failed.

PR to PUA: [#82](https://github.com/tanweai/pua/pull/82)

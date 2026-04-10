---
title: "I Woke Up to Eleven Completed Tasks. Here's the Infrastructure."
created: 2026-04-07
date: 2026-04-10
tags: [agent-infrastructure, async, delegation, tmux, claude-code]
topics:
  - AI
  - agent-infrastructure
qc: passed
spec: "Overnight agent execution via 7 bash primitives (spawn, HOME isolation, completion queue, pull-queue, Discord webhook, router-prompt hook, validation cards). 13 tasks total, 11 drained on morning pull. 6 citations (tmux, jq, Claude Code, Kleppmann 2017, Thaler & Sunstein 2008, Twelve-Factor App) + personal cc-remote system evidence | creator — practitioner who built the system described | engineers building agent delegation or remote execution infrastructure"
---

# I Woke Up to Eleven Completed Tasks. Here's the Infrastructure.

It's April 8, 2026. I connect to devbox and run:

```
$ claude-code-remote pull-queue
```

Eleven unpulled entries show up (the raw file also has `output_dir`, stripped here for readability):

```jsonl
{"name":"build-claim-registry","completed_at":"2026-04-07T17:58:52Z","status":"success","pulled":false}
{"name":"build-router-prompt","completed_at":"2026-04-07T18:17:05Z","status":"success","pulled":false}
{"name":"build-hook-test-runner","completed_at":"2026-04-07T18:19:30Z","status":"success","pulled":false}
{"name":"draft-blog-01-no-op-gate","completed_at":"2026-04-07T18:31:35Z","status":"success","pulled":false}
{"name":"draft-blog-02-queue-scale-rubric","completed_at":"2026-04-07T18:32:35Z","status":"success","pulled":false}
{"name":"draft-blog-05-pointed-question-debug","completed_at":"2026-04-07T18:33:09Z","status":"success","pulled":false}
{"name":"draft-blog-03-validation-arc","completed_at":"2026-04-07T18:33:46Z","status":"success","pulled":false}
{"name":"draft-blog-06-half-async","completed_at":"2026-04-07T18:34:17Z","status":"success","pulled":false}
{"name":"build-pipeline-rest","completed_at":"2026-04-07T18:35:14Z","status":"success","pulled":false}
{"name":"draft-blog-04-harness-scope-rubric","completed_at":"2026-04-07T18:35:38Z","status":"success","pulled":false}
{"name":"draft-blog-07-cornerstone-sleep","completed_at":"2026-04-07T18:40:25Z","status":"success","pulled":false}
```

All eleven: `status: "success"`. The last timestamp is 18:40 UTC. The MacBook was closed before any of these finished.

`build-router-prompt` produced the UserPromptSubmit hook now running in production. `build-claim-registry` assembled a registry of factual claims from the session. `build-pipeline-rest` scaffolded the remaining pipeline gates. The blog drafts are rough but framed — seven of them completed in nine minutes between 18:31 and 18:40.

Two more tasks from that same afternoon had already been pulled earlier in the session: `validate-publish-gate-xhs-v0.2` at 17:45Z and `validate-publish-gate-bash-v0.4.1` at 17:46Z. Thirteen tasks total; two already consumed by the time I ran pull-queue again.

None of this happened while I was watching. That's the point. And getting to this point required building seven distinct pieces of infrastructure on 2026-04-07 — the same afternoon that produced the tasks in that queue. This post unpacks each one.

---

## Seven Primitives, One Afternoon

The primitives are:

1. **Spawn** — `claude -p` in a detached tmux session, survives SSH disconnect
2. **HOME isolation** — background agents get a clean environment, not your hook-laden production settings
3. **Completion queue** — JSONL append when an agent finishes
4. **Pull-queue** — one command to drain it in the morning
5. **Discord webhook** — push notification when a task completes (Phase F)
6. **Router-prompt hook** — catches execution inertia before you commit to inline work
7. **Validation cards** — structured receipts that say what shipped and what it actually did

None of these is exotic. Together they change the default from "I watch the agent work" to "the agent works while I sleep."

---

## Spawn: Surviving SSH Disconnect

The core mechanic is [Claude Code](https://docs.anthropic.com/en/docs/claude-code)'s `claude -p` (print mode, non-interactive) inside a [tmux](https://github.com/tmux/tmux) session:

```bash
tmux new-session -d -s "ccr-build-router-prompt" \
  bash "$HOME/cc-remote-output/build-router-prompt/_runner.sh"
```

The `new-session -d` flag detaches immediately. The runner script executes inside tmux. When I close the SSH connection, the session persists on devbox. When I reconnect, `tmux attach -t ccr-build-router-prompt` shows exactly what the agent produced.

The `_runner.sh` invocation:

```bash
claude -p --model sonnet --permission-mode bypassPermissions \
  "$(cat $ORIG_HOME/cc-remote-input/build-router-prompt/_prompt.txt)" >> "$LOG" 2>&1
```

`--permission-mode bypassPermissions` means the agent doesn't need interactive approval for tool calls. Everything goes to `run.log`. Exit code is captured as `$CLAUDE_EXIT` and used downstream for notifications and the queue entry.

One flag worth noting: `--bare`, which the `cc-live-brief` runner adds specifically for background transcript agents. `--bare` disables Claude Code's interactive UI and also prevents the spawned agent from triggering the user's Stop hooks. Without it, an agent that fires on `Stop` events — like the live-brief updater — will recurse: each background agent's `Stop` fires the same hook that spawned the background agent. The `--bare` flag is the anti-recursion guard. Validation card `cc-live-brief` has a concrete case (session `eaf932f9`, 2026-04-07T15:49:28Z) where the background agent ran without `--bare` and was blocked by the user's PreToolUse:Write hook before it could write its output. Adding `--bare` resolved it.

This is standard tmux-style background process management. The only thing distinctive is that the payload is a Claude invocation rather than a build script. The rest — process persistence, log capture, exit code checking — is the same as any background job.

---

## HOME Isolation: The Bisect Finding

The harder problem was making background agents safe. When a background agent inherits your full Claude Code environment, it also inherits your hooks. Those hooks fire. Some block. Some write to your state directories. Running five validation agents in parallel with your production hooks active is a mess.

The fix is HOME isolation. Each agent runs with `HOME` overridden to a temporary directory:

```bash
ISO_HOME="$ORIG_HOME/.cache/claude-code-remote/iso/validate-publish-gate-bash-v0.4.1"
rm -rf "$ISO_HOME"
mkdir -p "$ISO_HOME/.claude"
cp "_iso_settings.json" "$ISO_HOME/.claude/settings.json"
```

The isolated `settings.json` is minimal — one hook, or no hooks, depending on what the task needs. The real settings with all production hooks is never loaded.

But what auth state does the agent need? Here's where it got interesting. The initial approach was to symlink the entire `~/.claude/` directory. That doesn't work. From the runner comments, confirmed via bisect on claude 2.1.90:

> Symlinking `~/.claude/scripts/` causes claude to load the USER's full `settings.json` — likely a parent-dir walk from `scripts/` finds the real `settings.json` and merges it, defeating isolation.

So the curated symlink list is just auth:

```bash
for f in .credentials.json .credentials .credentials.json.backup \
          mcp-needs-auth-cache.json policy-limits.json; do
  if [[ -e "$ORIG_HOME/.claude/$f" ]]; then
    ln -sf "$ORIG_HOME/.claude/$f" "$ISO_HOME/.claude/$f"
  fi
done
```

Scripts, plugins, agents, skills directories are never symlinked. Top-level `~/.claude.json` (project metadata) gets a symlink to suppress a startup warning. That's it.

The result: background agents authenticate with your credentials but load only their own settings. No production hooks fire inside them. They run clean. This is the Unix principle of least privilege applied to agent environments — each agent gets exactly what it needs and nothing more.

---

## Completion Queue and Pull-Queue

Phase G of every `_runner.sh` appends to a shared JSONL file when the agent finishes:

```bash
QUEUE="$ORIG_HOME/cc-remote-output/.completion-queue.jsonl"
{ jq -cn \
    --arg n "build-router-prompt" \
    --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    --arg dir "$ORIG_HOME/cc-remote-output/build-router-prompt" \
    --arg s "$status" \
  '{name:$n, completed_at:$ts, output_dir:$dir, status:$s, pulled:false}' \
  >> "$QUEUE"; } 2>/dev/null
```

The `pulled:false` field is the morning marker. `claude-code-remote pull-queue` reads the file, shows everything where `pulled == false`, marks them `true`, and prints the summary. The queue file doesn't get cleaned up — it's an audit trail. Only the `pulled` flag changes.

This is append-only JSONL. No database, no daemon, no server. The queue file is the queue. [jq](https://github.com/jqlang/jq) reads it; another `jq` pass marks entries as pulled. The whole thing is transparent: `cat .completion-queue.jsonl | jq .` shows everything that's ever run.

The choice to use JSONL over a database came down to durability and inspectability. Martin Kleppmann describes this pattern as an "append-only log" in [*Designing Data-Intensive Applications*](https://dataintensive.net/) (O'Reilly, 2017) — the simplest durable data structure, where correctness comes from never mutating past entries. If the machine reboots between an agent completing and you pulling the queue, a JSONL file is still there. A daemon-managed queue might not be. The [Twelve-Factor App](https://12factor.net/) methodology (Wiggins, 2012) makes the same argument for treating logs as event streams rather than managed files — the queue file is both the data store and the audit log.

---

## Discord Webhook: Phase F

Phase F fires before Phase G:

```bash
if [[ -n "$NOTIFY_URL" ]]; then
  tail_log=$(tail -25 "$LOG" 2>/dev/null || echo "(log unavailable)")
  payload=$(jq -cn \
    --arg n "build-router-prompt" \
    --arg s "$status" \
    --arg t "$tail_log" \
    '{content: ("**" + $n + "** " + $s + "\n```\n" + $t + "\n```")}')
  curl -fsS -X POST -H "Content-Type: application/json" \
    -d "$payload" "$NOTIFY_URL" >/dev/null 2>&1 || true
fi
```

When `$NOTIFY_URL` is set to a Discord webhook URL, you get a phone notification the moment each task completes: task name, success/failure, and the last 25 lines of the run log. The `|| true` ensures a failed webhook never kills the runner.

The `NOTIFY_ON` flag controls what triggers a notification — `"success"`, `"failure"`, or `"both"`. For overnight runs, `"failure"` is the setting that matters: you don't need to know when things work, but you want to know immediately when something goes wrong at 2am so you can requeue it before morning.

In the current runners on devbox, `NOTIFY_URL` is empty. The webhook infrastructure is there; connecting it is a one-line change.

---

## The Router-Prompt Hook: Technical Fix for a Cognitive Failure

This is the most interesting primitive, and it came from watching myself fail twice in the same session.

The failure mode: I had a delegation intent ("an agent should do this"), I started typing a prompt, and by the time I submitted it I was already doing the work inline. Not because delegation was hard — by this point, spawning a task was three commands. But because the default execution path in an active Claude Code session is *continue the conversation*, not *pause, write a task.conf, spawn a tmux session, disconnect*.

That gap between "I should delegate" and "I actually delegate" is execution inertia. Thaler and Sunstein documented the same phenomenon in [*Nudge*](https://en.wikipedia.org/wiki/Nudge_(book)) (2008): when the default option has lower friction, people choose it even when they know a better option exists. Choice architecture — restructuring the decision environment to make the better option the path of least resistance — is the fix. The router-prompt hook is choice architecture for agent delegation.

The hook fires on `UserPromptSubmit` — before the model responds — and injects a delegation nudge when it detects delegation-shaped keywords:

```bash
KW_LIST="fix|rewrite|ship|build|validate|implement|refactor|audit|research|generate"
KW_REGEX="\\b(${KW_LIST})\\b"

if echo "$PROMPT" | grep -qiE "$KW_REGEX"; then
  jq -cn '{
    hookSpecificOutput: {
      hookEventName: "UserPromptSubmit",
      additionalContext: "[router-prompt] Detected delegation-shaped keyword. Default to claude-code-remote spawn task.conf on the remote. Inline editing is for true rapid iteration only (bisects, in-flight debugging). Ask: would a code-gen agent on devbox do this faster + cleaner?"
    }
  }'
fi
```

Word boundaries prevent false positives: `"fixing dinner"` doesn't match `\bfix\b` because `x` and `i` are both word characters — no boundary between them.

The `additionalContext` field injects into the model's context before it generates a response. The model sees the nudge, sees the prompt, and now has an explicit reminder that the default is delegation — not inline execution.

The key design decision: this fires on `UserPromptSubmit`, not as a post-hoc reminder. By the time you've already started executing inline, the nudge is useless. The hook interrupts at the moment of commitment, before any inline execution begins.

It won't stop a determined user from executing inline anyway. But it changes the default from "inertia wins" to "inertia meets resistance." On the two occasions I caught myself doing inline work that should have been delegated, the hook would have fired. The intervention point was the prompt submission, not the aftermath.

One practical consideration: the hook fires on every matching keyword, including ones embedded in sentences that aren't actually delegation requests. "Can you help me understand why the build broke?" contains `build` — it'll nudge you. A future refinement would be a mode flag in the session context that silences the hook for Q&A sessions. But for the current use case — a session where I'm actively building and delegating — false nudges are acceptable. The cost of an unnecessary reminder is zero. The cost of missing a delegation opportunity is another hour of waiting.

---

## The Validation Cards

The session on 2026-04-07 produced five validation cards: `cc-live-brief`, `task-verify`, `publish-gate-bash`, `framework-audit-gate`, and `research-gate`. Each is a structured document with six sections: trigger verification, result audit, idempotency test, independent review, end-to-end cases, and verdict.

Two shipped as `SHIPPING_READY` (`task-verify` at 4/5 confidence, `research-gate` at 4/5). Three are `NEEDS_FIX` with specific blocking issues identified. The `publish-gate-bash` card found a Linux-specific defect in the `stat` mtime detection that made the draft-freshness check crash with `exit 1` instead of blocking with `exit 2` — a meaningful difference when Claude Code treats non-2 non-zero exits as errors rather than intentional blocks.

These aren't documentation. They're the output of the validation agents themselves: each agent ran the hook under test, classified its behavior against a taxonomy, and wrote a card with exact reproduction scripts, confidence levels, and specific next actions. The `cc-live-brief` card pulled from 81 real `stop-fired` log events and classified each one — 6 TP, 2 TN, 2 FP, 2 FN, 71 unclassified due to log reuse behavior where the same session ID's `run.log` was overwritten across multiple runs.

The `cc-live-brief` card also has a concrete success story for what the whole system is for. Session `d278d87c-34e6-46f5-b60d-d8be52e14c7a` ran from 15:54 to 16:18Z on 2026-04-07. The Stop hook fired on each turn, spawning a background transcript agent that read the session delta and updated a live brief. By the end of the session: 59 conversation rounds captured, 9 distinct threads tracked, 4 consecutive brief-write events (adding 19, 12, 10, and 1 new entries respectively). The brief at `~/.claude/memory/briefs/live/d278d87c-...yaml` contains all of it. Total foreground cost per hook fire: about 50ms. The background agent's work was asynchronous, transparent, and never blocked the session.

The receipts are the point. A claim like "the hook fires and produces correct output" is worth nothing without a classification table and a reproduction script. The validation framework exists to prevent the gap between "I built it and it seemed to work" and "I know what it does under each input condition."

---

## The Morning Ritual

Eleven tasks. One command. MacBook was closed.

The first time you run `pull-queue` and see entries that completed while you were asleep, something shifts. The agent wasn't "a process I was watching" — it was a worker on a different schedule. You delegated at 6pm; it delivered at 6am. The shift from synchronous to asynchronous changes the unit of work from "what I can do while watching" to "what I can queue before closing the laptop."

The infrastructure for this is seven bash scripts, a JSONL file, a tmux session naming convention, and a HOME override. None of it requires a server, a daemon, or a custom runtime. The pieces are boring. What they enable is not.

**Lesson from the session:** Execution inertia beats stated policy unless a hook interrupts it. The router-prompt hook isn't a nice-to-have — it's the technical fix for a cognitive failure I demonstrated twice on the same day I built the delegation infrastructure. The gap between "I know I should delegate" and "I actually delegate" closes when something fires at the moment of submission.

---

*The system described here runs on a single Linux server using [tmux](https://github.com/tmux/tmux) for process management, [jq](https://github.com/jqlang/jq) for structured data, and [Claude Code](https://docs.anthropic.com/en/docs/claude-code) as the agent runtime. The append-only queue pattern follows Kleppmann's [event log design](https://dataintensive.net/) (2017). The router-prompt hook applies choice architecture principles from Thaler & Sunstein's [Nudge](https://en.wikipedia.org/wiki/Nudge_(book)) (2008). Process isolation follows [Twelve-Factor App](https://12factor.net/) methodology (Wiggins, 2012).*

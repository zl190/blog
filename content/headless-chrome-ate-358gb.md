---
title: "Headless Chrome Ate 358GB of My Disk"
format: blog
status: published
draft: false
qc: passed
spec: "Chrome's --disable-features=DeferredBrowserMetrics flag doesn't actually prevent .pma file creation in headless mode — chmod 555 the directory instead | practitioner — lost 358GB to this on a production server | anyone running headless Chrome in CI/CD, browser automation, or AI agent tooling"
created: 2026-04-06
published_date: 2026-04-06
language: en
tags: [devops, chrome, headless, debugging, AI]
topics:
  - Engineering
---

My server ran out of disk space on a Sunday morning. An 866GB drive, completely full. The culprit wasn't logs, wasn't Docker images, wasn't a database gone rogue. It was Chrome writing 91,470 identical 4MB telemetry files that nobody asked for and nobody would ever read.

## The Setup

I run a headless Chrome instance on an Ubuntu 22.04 server for AI agent browser automation. Specifically, it's a [claude-in-chrome](https://github.com/anthropics/claude-in-chrome) MCP extension connecting via the Chrome DevTools Protocol on port 9222. The kind of setup where Chrome sits in the background 24/7, waiting for an AI agent to tell it to open a page, fill a form, grab a screenshot.

It had been running fine for about two weeks. Then I got the alert: disk at 100%.

## Finding the Body

Standard triage. SSH in, check disk usage:

```bash
du -h --max-depth=2 /home/zliang/ | sort -rh | head -20
```

The output made me blink:

```
358G    /home/zliang/.chrome-cdp-profile/DeferredBrowserMetrics
```

358 gigabytes. In a directory I'd never heard of.

```bash
ls ~/.chrome-cdp-profile/DeferredBrowserMetrics/ | head -5
```

```
BrowserMetrics-20250325-091523.pma
BrowserMetrics-20250325-091524.pma
BrowserMetrics-20250325-091525.pma
BrowserMetrics-20250325-091526.pma
BrowserMetrics-20250325-091527.pma
```

Ninety-one thousand, four hundred and seventy files. Every single one exactly 4,194,304 bytes (4MB). Accumulated over 12 days, from March 25 to April 6. Quick math: that's roughly 7,600 files per day, about 30GB per day.

On a 100GB CI disk — the kind most cloud providers give you by default — this would fill your drive in just over three days.

## What Are These Files?

Chrome has a telemetry system called [UMA (User Metrics Analysis)](https://chromium.googlesource.com/chromium/src/+/HEAD/tools/metrics/histograms/README.md). It records browser performance data — page load times, memory usage, crash rates — into `.pma` (Persistent Memory Allocator) files. In normal desktop Chrome, these files get periodically uploaded to Google's metrics servers and then cleaned up locally.

The `DeferredBrowserMetrics` feature, a relatively recent addition to [Chromium's metrics stack](https://chromium.googlesource.com/chromium/src/+/main/components/metrics/), is a variant that defers metric collection to reduce startup overhead. It writes metrics to disk and processes them later.

The problem is obvious once you see it: as far as I can tell, headless Chrome has no metrics upload endpoint. The files get written. They never get uploaded. They never get cleaned up. Chrome just keeps writing new ones, one per second, forever.

## The Flag That Doesn't Work

Here's the part that actually frustrated me. My Chrome launch command already included the recommended flags:

```bash
chrome --headless --remote-debugging-port=9222 \
  --disable-features=DeferredBrowserMetrics,MetricsReporting \
  --no-first-run \
  --disable-background-networking \
  --user-data-dir=$HOME/.chrome-cdp-profile
```

`--disable-features=DeferredBrowserMetrics,MetricsReporting`. Right there. The flag that every Stack Overflow answer and Chromium bug tracker comment tells you to use.

It doesn't work.

Chrome 146.0.7680.80 ignores this flag for file creation. The feature flag might suppress some of the metrics collection logic, but the directory still gets created and `.pma` files still get written. I confirmed this by wiping the directory, restarting Chrome with the flag, and watching new files appear within seconds.

This is a Chrome bug. I couldn't find a definitive Chromium bug for this, but as of April 2026, the flag still doesn't fully prevent file creation. If you're relying on `--disable-features=DeferredBrowserMetrics` as your fix, check your disk. You might have a surprise waiting.

## The Fix

I considered three approaches:

**Cron job to delete files periodically.** Reactive. Your disk still fills up between runs. If your cron interval is too long or the job fails silently, you're back to a full disk on a Sunday morning. I don't like fixes that are races against time.

**Mount the directory as tmpfs.** This works well — files go to RAM and vanish on reboot. But it requires sudo, adds a line to `/etc/fstab` or a systemd mount unit, and introduces a new failure mode if the mount doesn't come up. Overkill for what's essentially a junk directory.

**Make the directory read-only.**

```bash
rm -rf ~/.chrome-cdp-profile/DeferredBrowserMetrics/*
chmod 555 ~/.chrome-cdp-profile/DeferredBrowserMetrics/
```

This is what I went with. Chrome tries to write `.pma` files, the filesystem says no, Chrome shrugs and moves on. No files accumulate. No sudo needed. No cron to maintain. The permission survives Chrome restarts.

## Does It Break Anything?

I tested the full CDP workflow after applying the fix:

```bash
# Check Chrome is responsive
curl -s http://localhost:9222/json/version | jq .Browser
# "Chrome/146.0.7680.80"

# Navigate to a page
wscat -c ws://localhost:9222/devtools/page/... \
  -x '{"id":1,"method":"Page.navigate","params":{"url":"https://example.com"}}'
# {"id":1,"result":{"frameId":"..."}}

# Execute JavaScript
wscat -c ws://localhost:9222/devtools/page/... \
  -x '{"id":2,"method":"Runtime.evaluate","params":{"expression":"document.title"}}'
# {"id":2,"result":{"result":{"type":"string","value":"Example Domain"}}}

# Take a screenshot
wscat -c ws://localhost:9222/devtools/page/... \
  -x '{"id":3,"method":"Page.captureScreenshot"}'
# {"id":3,"result":{"data":"iVBORw0KGgo..."}}  (valid PNG)
```

Everything works. Page navigation, JavaScript evaluation, screenshots — all functional. I restarted Chrome, confirmed the permissions survived, confirmed zero new `.pma` files appeared, and confirmed CDP remained fully operational.

Chrome logs a few permission-denied errors to stderr on startup, which is noise you can ignore or redirect to `/dev/null`. The browser itself doesn't care about its telemetry files failing to write.

## Who Should Care

If you're running headless Chrome in any of these contexts, this affects you:

- **CI/CD pipelines** (GitHub Actions, GitLab CI, Jenkins) — especially self-hosted runners with persistent Chrome instances
- **Browser automation frameworks** — [Puppeteer](https://pptr.dev/), [Playwright](https://playwright.dev/), [Selenium](https://www.selenium.dev/) with ChromeDriver
- **AI agent tooling** — anything connecting to Chrome via CDP for web interaction
- **Web scraping services** — long-running Chrome instances processing URLs

The ephemeral environments (fresh container per CI job) are partially protected because Chrome doesn't run long enough to accumulate dangerous amounts. But if you're reusing a Chrome profile directory across jobs, or running a persistent Chrome instance, those `.pma` files are piling up right now.

At 30GB per day, the timeline to disk failure is short:

| Disk Size | Days Until Full |
|-----------|-----------------|
| 50GB      | ~1.7            |
| 100GB     | ~3              |
| 250GB     | ~8              |
| 500GB     | ~16             |

## The One-Liner

If you're running headless Chrome and want to stop this now:

```bash
rm -rf ~/.chrome-cdp-profile/DeferredBrowserMetrics/* && \
chmod 555 ~/.chrome-cdp-profile/DeferredBrowserMetrics/
```

Replace `~/.chrome-cdp-profile` with whatever you passed to `--user-data-dir`. If you didn't pass one, Chrome defaults to `~/.config/google-chrome/` or `~/.config/chromium/`.

For Docker-based setups, add this to your Dockerfile after Chrome installation:

```dockerfile
RUN mkdir -p /home/chrome/.config/chromium/DeferredBrowserMetrics && \
    chmod 555 /home/chrome/.config/chromium/DeferredBrowserMetrics
```

## Takeaway

The `--disable-features=DeferredBrowserMetrics` flag is the answer you'll find everywhere. It's also the answer that doesn't work. I lost 358GB and a Sunday morning to a flag that Chrome silently ignores.

The lesson I keep relearning in operations work: verify the fix, don't trust the documentation. If a flag is supposed to prevent file creation, check whether files are actually being created. `ls` is a better test than `man`.

---
title: "What I Learned Diving Into AI Agent Ecosystem"
status: published
created: 2026-01-14
published_url: https://zl190.github.io/blog/posts/what-i-learned-diving-into-ai-agent-ecosystem/
published_date: 2026-01-27
---

# What I Learned Diving Into the AI Agent Ecosystem

After spending time exploring AI Agents—from Claude Code to Dify to local LLMs—I came away with some insights that surprised me. Here's what I found.

---

## Claude Code: Auto Mode for Linux

Think of Claude Code as Linux with an auto-pilot. You describe what you want in plain English, and it figures out which commands to run, in what order, handling errors along the way.

The magic isn't some sophisticated AI trick—it's the perfect marriage between LLMs and Unix. LLMs are text processors. Linux is a text-native OS where everything speaks text through pipes. Match made in heaven.

When Claude Code runs `git status` or `grep`, it's not doing anything fancy—just calling the same commands you would. But it handles the cognitive load: remembering flags, chaining tools together, parsing output, deciding what to do next.

This is why Claude Code feels so powerful. It's not reinventing the wheel. It's putting an AI brain in front of decades of battle-tested Unix tools. Auto mode for Linux.

---

## The MCP Misconception (I Had It Wrong)

Here's something I got completely wrong at first: I assumed Claude Code uses MCP (Model Context Protocol) to call *everything*, including basic Linux commands.

Nope.

Claude Code actually has two types of tools:

**Built-in tools** like Bash, Read, Write, and Glob are implemented natively in TypeScript. When you ask Claude to read a file, it calls `fs.read()` directly—no protocol overhead, no external servers.

**MCP extensions** are for things that *can't* be done with simple CLI commands: GitHub API calls with full authentication, persistent database connections, Slack integrations. These go through MCP servers.

So when should you use each? Simple rule: if you can do it in a terminal, Bash is fine. MCP shines when you need stateful connections, rich APIs, or services that don't have good CLI tools.

The design is clever when you think about it. Native tools are fast and reliable—they're always there. MCP tools are extensible but add complexity. It's like the difference between kernel mode and user mode in an operating system. Core functions run fast and direct; extensions go through a standard interface.

---

## Two Paths to "Machines Doing Work"

Looking at the history of automation, I noticed something interesting: there are actually two separate evolution tracks that are now converging.

**The Automation Track** started with cron jobs in the 1970s—scheduled tasks that run without human intervention. Then came IFTTT in 2010, making automation accessible to everyone with its "if this then that" recipes. Apple Shortcuts brought it to mobile. n8n and similar tools added visual workflow builders. Now platforms like Dify and Coze are adding AI nodes to these workflows.

The key characteristic? These are *trigger-driven*. Set them up once, and they run automatically.

**The AI Assistant Track** is different. It started with ChatGPT in 2022—conversational AI that answers questions. Then came Claude Code in 2024, which can actually *do* things, not just talk about them.

The key characteristic? These are *human-initiated*. You give a task, the AI completes it.

What's fascinating is watching these tracks converge. n8n is adding AI nodes. Claude Code can be called from automation workflows. The line between "automation" and "AI assistant" is blurring.

For what it's worth, here's how the major platforms relate to MCP:

| Platform | Type | MCP Support |
|----------|------|-------------|
| Claude Code | AI Assistant | Native |
| Dify | Automation + AI | Yes (v1.6.0+) |
| n8n | Automation + AI | Compatible |
| Coze | Automation + AI | No |

---

## The Agent Platform Race Isn't About Technology

Every tech company is building an Agent platform right now. But here's the thing: after MCP standardization, the technical barriers are actually pretty thin.

Integrating models? Everyone can do it. Wrapping tools as MCP servers? Not that hard. The actual technology is converging fast.

So what's the real competition about? Distribution, ecosystem, and standard-setting power.

ByteDance's Coze has Feishu and Douyin—massive built-in traffic. Alibaba's Bailian has DingTalk and enterprise cloud customers. OpenAI has brand and first-mover advantage. Anthropic has the protocol standard (MCP) and a deeply integrated product (Claude Code).

About MCP: yes, Anthropic open-sourced it. But "open source ≠ no moat." Google open-sourced Android but still dominates mobile. Meta open-sourced React but still sets frontend standards. As MCP's creator, Anthropic has the deepest integration, influence over the protocol's evolution, and brand association—when people think MCP, they think Anthropic.

It reminds me of the browser wars. Once HTTP standardized the web, browsers competed on rendering engines, user experience, and market share—not on who could implement HTTP better.

My takeaway? Don't chase the "latest" platform. Features are converging. Open source options like Dify and n8n can do most of what the commercial platforms do. Learn one platform well, and you basically understand them all.

---

## Going Local: Privacy, Cost, and Control

Cloud APIs are convenient, but they come with tradeoffs. Your data goes to a third party. You pay per token. You're dependent on network latency and service availability.

Local LLMs flip all of that. Your data stays on your machine. You pay once for hardware. Response times are predictable.

The tooling has matured a lot. Ollama makes it trivial to run models locally—just `ollama pull llama3.2` and you're running. For production use cases, vLLM handles high concurrency well. And llama.cpp can run models on CPU if you don't have a GPU.

### Building a Fully Offline Agent

Want to build an AI agent that works completely offline? Here's the architecture I found works well:

You need MCPHost, which bridges local LLMs (via Ollama) with MCP servers. Install it with `go install github.com/mark3labs/mcphost@latest`, create a config file pointing to your MCP servers, and run it with your local model.

But MCPHost has a limitation: it only provides MCP capabilities. It doesn't have Claude Code's native tools—the built-in Bash, file operations, etc.

That's where **goose** comes in. Open-sourced by Block (the Square company), it's the closest thing to an open-source Claude Code. It has native shell execution, file operations, MCP support, *and* works with local models.

| Capability | Claude Code | goose | MCPHost |
|------------|-------------|-------|---------|
| Native shell | ✅ | ✅ | ❌ |
| File read/write | ✅ | ✅ | Via MCP |
| MCP support | ✅ | ✅ | ✅ |
| Local models | ❌ | ✅ | ✅ |
| Open source | ❌ | ✅ | ✅ |

If you want open source + local models + a Claude Code-like experience, goose is your best bet right now.

---

## What I'm Taking Away

A few things stick with me after this deep dive:

**Claude Code is powerful because of Linux, not despite it.** The text-native, pipe-based Unix philosophy is exactly what LLMs need. AI didn't replace the command line—it made it more accessible.

**MCP extends but doesn't replace native tools.** Use Bash for CLI tasks, MCP for web services and stateful connections. The hybrid approach is intentional and smart.

**The agent platform wars are about distribution, not technology.** Technical barriers are falling. Ecosystem and users matter more.

**Local deployment is ready for real use.** If privacy or cost matters to you, the tooling is there. goose + Ollama is a solid starting point.

The AI agent space is moving fast, but the fundamentals—good architecture, clear tradeoffs, building on proven foundations—stay the same.

---

*January 2026*

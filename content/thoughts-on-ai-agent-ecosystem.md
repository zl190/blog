---
title: "Thoughts on AI Agent Ecosystem"
type: draft
format: blog
status: published
created: 2026-01-12
language: en
tags: [agent, ai, ecosystem]
published_url: https://zl190.github.io/blog/posts/thoughts-on-ai-agent-ecosystem/
published_date: 2026-01-27
---

# Thoughts on the AI Agent Ecosystem

> After diving deep into the AI Agent ecosystem, here are some insights worth sharing.

---

## 1. What Makes Claude Code Powerful: Linux + AI + MCP

Why is Claude Code so capable? Because it stands on the shoulders of the Linux ecosystem.

```
┌─────────────────────────────────────────┐
│           Claude Code (AI Layer)         │
│   Natural Language → Plan → Tools → Verify│
├─────────────────────────────────────────┤
│            MCP (Protocol Layer)          │
├─────────────────────────────────────────┤
│        Linux CLI + Web Services          │
│      grep/git/docker + GitHub/Slack      │
├─────────────────────────────────────────┤
│          Linux/Unix OS                   │
│       Pipes | Stdio | Filesystem         │
└─────────────────────────────────────────┘
```

**Three key elements**:
- **Linux is text-native**: LLMs are fundamentally text processors; Linux's "everything is text" philosophy is a perfect match
- **Unix pipe philosophy**: Small composable tools; Agents can chain them together
- **MCP extends reach**: Connects to web services that Linux CLI can't touch

---

## 2. MCP vs Bash: An Important Clarification

I initially thought Claude Code uses MCP to call all tools, including Linux commands like `grep`, `find`, and `pip`.

**Wrong.**

Claude Code has two types of tools:

| Type | Implementation | Examples |
|------|----------------|----------|
| **Built-in tools** | Native, direct execution | Bash, Read, Write, Glob |
| **MCP extensions** | Protocol-based communication | GitHub API, Slack, databases |

When Claude Code runs `git status`, it calls the built-in Bash tool to execute the command directly—**no MCP involved**.

**So what is MCP for?**

| Scenario | Use Bash | Use MCP |
|----------|----------|---------|
| Run `grep` | ✅ Direct execution | ❌ Unnecessary |
| Run Python script | ✅ `python x.py` | ❌ Unnecessary |
| Call GitHub API | ❌ CLI is limited | ✅ Full API access |
| Keep DB connection | ❌ Reconnect each time | ✅ Connection pooling |

**Core principle**: MCP **extends** Unix philosophy, it doesn't replace it. If native CLI can solve it, skip MCP.

### Deep Dive: Claude Code's Tool Architecture

**From Claude model's perspective**, native tools and MCP tools look the same—both are called via Anthropic's **Tool Use API**:

```
Claude model outputs:
{
  "type": "tool_use",
  "name": "Bash",
  "input": {"command": "git status"}
}
```

**The difference is in implementation**:

```
┌─────────────────────────────────────────────────────┐
│                   Claude Model                       │
│              (outputs tool_use requests)             │
└─────────────────────┬───────────────────────────────┘
                      │ Tool Use API
                      ▼
┌─────────────────────────────────────────────────────┐
│               Claude Code (Host)                     │
│   ┌─────────────────┐    ┌─────────────────────┐   │
│   │  Native Tools   │    │    MCP Client       │   │
│   │  (TypeScript)   │    │         │           │   │
│   │  Bash → exec()  │    │         ▼           │   │
│   │  Read → fs.read │    │   MCP Protocol      │   │
│   └─────────────────┘    └─────────┬───────────┘   │
└─────────────────────────────────────┼───────────────┘
                                      ▼
                            ┌─────────────────┐
                            │   MCP Servers   │
                            └─────────────────┘
```

### Why Not Unify Everything with MCP?

**1. Performance**
```
Native tool:  Function call → Execute → Return           ~1ms
MCP tool:     Serialize → IPC → Parse → Execute → Return  ~10-100ms
```

**2. Reliability**
- Native tools: Always available, no external dependencies
- MCP: Server process could crash, timeout

**3. Bootstrapping**
- Need basic tools to install MCP servers
- Can't use MCP to install MCP

### Analogy: Kernel Mode vs User Mode

```
┌─────────────────────────────────────────┐
│           Operating System              │
├───────────────────┬─────────────────────┤
│  User Mode        │  Kernel Mode        │
│  (applications)   │  (core functions)   │
│  syscall needed   │  direct execution   │
│  isolated         │  fast & reliable    │
└───────────────────┴─────────────────────┘

┌─────────────────────────────────────────┐
│            Claude Code                  │
├───────────────────┬─────────────────────┤
│  MCP Tools        │  Native Tools       │
│  (extensions)     │  (core functions)   │
│  protocol needed  │  direct execution   │
│  isolated         │  fast & reliable    │
└───────────────────┴─────────────────────┘
```

**Design principle**: Core functionality should be fast and reliable; extensions go through a standard interface.

---

## 3. Two Evolution Tracks

"Make machines do work for humans" has evolved along two different tracks:

### Automation Track (Event-Driven)

| Year | Milestone | Characteristics |
|------|-----------|-----------------|
| 1970s | Cron | Scheduled tasks, requires scripting |
| 2010 | IFTTT | "If This Then That", accessible to everyone |
| 2014 | Shortcuts | Mobile automation |
| 2019 | n8n | Open source, self-hosted, complex workflows |
| 2024 | Dify, Coze | **Workflows + AI nodes** |

Characteristic: **Trigger-driven**, runs automatically once set up, no human intervention needed.

### AI Assistant Track (Human-Driven)

| Year | Milestone | Characteristics |
|------|-----------|-----------------|
| 2022 | ChatGPT | Conversational AI, Q&A |
| 2024 | Claude Code | **Task-driven Agent, can execute actions** |

Characteristic: **Human-initiated**, you give a task, AI completes it.

### Convergence of Two Tracks

The current trend is convergence:
- n8n/Dify add AI nodes → Automation becomes smarter
- Claude Code can be called by other tools → Agents can integrate into automation workflows

**How platforms relate to MCP**:

| Platform | Type | MCP Support |
|----------|------|-------------|
| Claude Code | AI Assistant | Native |
| Dify | Automation + AI | Supported (v1.6.0+) |
| n8n | Automation + AI | Compatible |
| Coze | Automation + AI | No |

---

## 4. The Real Competition Among Agent Platforms

Every company is building Agent platforms, but after MCP standardization, technical barriers are actually thin.

**What is everyone doing?**

| Layer | Work | Technical Difficulty |
|-------|------|---------------------|
| Model adaptation | Integrate their own models | Low |
| Tool wrapping | Package as MCP Tools | Low |
| Prompt engineering | System prompts, orchestration | Medium |
| New tools | Develop MCP Servers | Medium |

**The real moats aren't technical**:

| Vendor | Real Moat |
|--------|-----------|
| ByteDance Coze | Traffic (Feishu, Douyin) |
| Alibaba Bailian | Enterprise customers (DingTalk, Aliyun) |
| OpenAI | Model capability |
| Anthropic | Protocol standard (MCP) |

**Browser wars analogy**:

```
MCP Protocol ≈ HTTP Protocol
Tools        ≈ Websites
Prompts      ≈ Rendering engine

After protocol standardization, competition becomes:
├── Who has more "websites" (tools)
├── Who has more users
└── Who "renders" (understands) better
```

**Takeaways**:
- Don't chase the "latest" platform—features converge
- Open source (Dify/n8n) can replace commercial platforms
- Learn one platform, you basically know them all

---

## 5. Local LLM: Balancing Privacy and Cost

| Consideration | Cloud API | Local Deployment |
|---------------|-----------|------------------|
| Privacy | Data sent to third party | Data stays local |
| Cost | Pay per token | Fixed hardware investment |
| Latency | Network delay | Local response |

**Popular options**:
- **Ollama**: Quick start, consumer GPU
- **vLLM**: Production environment, high concurrency
- **llama.cpp**: Ultra lightweight, runs on CPU

### Hands-on: Build a Fully Offline AI Agent

Local model + MCP = Fully offline AI Agent. Here's the architecture:

```
┌─────────────────────────────────────────┐
│            MCPHost                       │
│  (bridges local LLM with MCP servers)   │
├──────────────────┬──────────────────────┤
│   Local LLM      │    MCP Servers       │
│   (Ollama)       │    (local tools)     │
└──────────────────┴──────────────────────┘
```

**Step 1: Install Ollama + model**
```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama pull qwen2.5:7b  # or llama3.2, mistral, etc.
```

**Step 2: Install MCPHost**
```bash
go install github.com/mark3labs/mcphost@latest
```

**Step 3: Create MCP config** (`mcp-config.json`)
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/home/user/documents"]
    },
    "sqlite": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sqlite", "~/data.db"]
    }
  }
}
```

**Step 4: Run**
```bash
mcphost -m ollama:qwen2.5:7b --config ./mcp-config.json
```

Now you have a fully offline AI Agent that can:
- Read/write files (filesystem MCP)
- Query databases (sqlite MCP)
- Use any local MCP server you configure

### Open Source Alternative: goose

MCPHost has a limitation: it only provides MCP capabilities, not Claude Code's native tools (Bash, Read, Write, etc.).

**goose** (open sourced by Block) is the closest open source alternative to Claude Code:

| Capability | Claude Code | goose | MCPHost |
|------------|-------------|-------|---------|
| Native shell execution | ✅ | ✅ | ❌ |
| File read/write | ✅ | ✅ | Via MCP |
| MCP support | ✅ | ✅ | ✅ |
| Local models | ❌ | ✅ | ✅ |
| Open source | ❌ | ✅ | ✅ |

**Install and use goose**:
```bash
# Install
pipx install goose-ai

# Run with local model
goose session --provider ollama --model qwen2.5:7b
```

**Bottom line**: Want open source + local models + Claude Code-like experience → use goose

---

## Key Takeaways

1. **Claude Code is powerful because of Linux**: Text-native + pipe philosophy + MCP extension
2. **MCP doesn't replace Bash**: Use Bash for native CLI tasks, MCP for web services
3. **Rules vs Intent**: Different abstraction levels, each has its place
4. **Agent platform technical barriers are thin**: Competition is about ecosystem, users, and models
5. **Local deployment is mature**: A viable option for privacy-sensitive scenarios

---

*January 2026*

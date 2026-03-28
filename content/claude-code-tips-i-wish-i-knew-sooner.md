---
title: "7 Claude Code Tips That Actually Changed How I Work"
format: blog
status: published
draft: false
qc: passed
created: 2026-03-18
published_date: 2026-03-18
language: en
tags: [AI, claude-code, productivity, developer-tools]
---

# 7 Claude Code Tips That Actually Changed How I Work

I spent a weekend turning Claude Code into a location-independent development environment. I split time between Australia and the US, with a GPU server in a different timezone. I wanted one setup that works the same whether I'm on my MacBook at home, on my phone walking to class, or SSHing across the Pacific. These are the tips that actually mattered.

Most Claude Code guides focus on prompting techniques. This one is about infrastructure — the config files, the network setup, the hardware choices that remove friction before you even start a conversation.

---

## 1. The permission config that stops the waiting

**If you do nothing else, do this.** Claude Code's default permission model asks you to approve every file read, every grep, every glob. In a typical session that means hitting "y" 40-50 times before anything meaningful happens. It's the single biggest source of friction.

The fix is `settings.json`. You can allowlist safe tools entirely and use regex patterns for Bash commands you trust. Dangerous operations — `rm -rf`, `git push --force`, anything touching `/etc` — still prompt.

```json
// ~/.claude/settings.json
{
  "permissions": {
    "allow": [
      "Read",
      "Write",
      "Edit",
      "Glob",
      "Grep",
      "Agent",
      "Skill",
      "Bash(git status)",
      "Bash(git diff*)",
      "Bash(git log*)",
      "Bash(git add*)",
      "Bash(git commit*)",
      "Bash(ls*)",
      "Bash(cd*)",
      "Bash(cat*)",
      "Bash(head*)",
      "Bash(tail*)",
      "Bash(wc*)",
      "Bash(mkdir*)",
      "Bash(cp*)",
      "Bash(mv*)",
      "Bash(python*)",
      "Bash(uv *)",
      "Bash(npm *)",
      "Bash(npx *)",
      "Bash(node *)",
      "Bash(cargo *)",
      "Bash(go *)",
      "Bash(docker *)",
      "Bash(brew *)",
      "Bash(gh *)",
      "Bash(ssh *)",
      "Bash(mosh *)",
      "Bash(tmux *)",
      "Bash(curl *)",
      "Bash(jq *)"
    ],
    "deny": [
      "Bash(rm -rf*)",
      "Bash(git push --force*)",
      "Bash(git reset --hard*)",
      "Bash(sudo rm*)",
      "Bash(chmod 777*)",
      "Bash(> /dev/*)"
    ]
  }
}
```

The pattern syntax is glob-based. `Bash(git diff*)` matches `git diff`, `git diff --staged`, `git diff HEAD~3`, etc. The deny list takes priority over allow, so even if `Bash(rm*)` somehow matched, the explicit `Bash(rm -rf*)` deny would block it.

**Why this matters:** Before this config, I spent more time approving permissions than thinking about my actual task. After: the only prompts I see are for operations that genuinely deserve a second look.

---

## 2. Voice mode exists and supports 20 languages

**You can talk to Claude Code.** The `/voice` command activates speech-to-text input. Hold spacebar, speak, release to send. Transcription tokens are free — they don't count against your usage.

```bash
# Activate voice mode
/voice

# Hold spacebar → speak → release to send
# Press Escape to exit voice mode
```

This is genuinely useful when you're thinking through an architecture problem and typing feels like a bottleneck. I use it for initial problem descriptions and then switch back to keyboard for precise instructions.

The catch: there's no automatic language detection. If you set it to English and start speaking Mandarin, you'll get gibberish. You need to manually switch via `/config` each time you change languages. This is a known limitation ([GitHub #33170](https://github.com/anthropics/claude-code/issues/33170)) and it's annoying if you regularly work in multiple languages.

```bash
# Switch voice language
/config
# Navigate to: Voice → Language → select from list
```

Supported languages include English, Mandarin, Japanese, Korean, Spanish, French, German, and about 13 others. The transcription quality is solid for technical vocabulary — it handles terms like "Kubernetes," "WebSocket," and "mutex" without issues.

**Why this matters:** Voice input for the "describe the problem" phase, keyboard for the "now do exactly this" phase. Different modes for different cognitive tasks.

---

## 3. Remote control from your phone

**You can approve Claude Code permissions from your couch.** The `/rc` command generates a QR code in your terminal. Scan it with your phone's camera, and you get a full Claude Code session on `claude.ai/code` — including the ability to approve or deny permission requests.

```bash
# In your terminal
/rc

# QR code appears → scan with phone camera
# Opens claude.ai/code with your active session
```

This launched in February 2026, and it solves a specific problem: you kick off a long task, walk away, and come back to find Claude Code has been blocked on a permission prompt for 20 minutes. With `/rc`, those prompts show up on your phone.

It works globally — the session syncs through Anthropic's servers, not local network. You don't need to be on the same WiFi. I've approved permission requests from a different city while a build was running at home.

Before this, I used tmux to keep sessions alive and checked back periodically. `/rc` makes that unnecessary for the permission-approval use case. You still want tmux for keeping the session alive through SSH disconnects, but you no longer need to be physically at your terminal to unblock the agent.

**Why this matters:** Long-running tasks no longer stall on permissions when you step away. The bottleneck was never compute — it was human response time.

---

## 4. Mosh over SSH for high-latency connections

**If your server is across an ocean, stop using plain SSH.** My GPU server is in the US, and I'm often in Asia. That's 180-220ms round-trip latency. With SSH, every keystroke takes a full round-trip before it appears on screen. At 200ms, typing feels like wading through mud.

Mosh (Mobile Shell) gives you local echo — characters appear instantly as you type, and Mosh syncs the state in the background. It also handles WiFi switches, network changes, and laptop sleep/wake without dropping the connection.

```bash
# Install
brew install mosh          # macOS client
sudo apt install mosh      # Ubuntu server

# Connect (replaces ssh)
mosh user@server.example.com

# If you need a specific SSH port
mosh --ssh="ssh -p 2222" user@server.example.com

# Mosh uses UDP ports 60000-61000 — open these on the server
sudo ufw allow 60000:61000/udp
```

The difference is dramatic. SSH at 200ms: unusable for interactive work. Mosh at 200ms: feels like a local terminal. This isn't a subjective impression — local echo means your keystrokes are rendered in under 10ms regardless of network latency.

The one limitation: Mosh doesn't support scrollback. You can't scroll up to see previous output. The workaround is to always run tmux inside Mosh, which gives you scrollback plus session persistence.

```bash
# The actual workflow
mosh user@server -- tmux new-session -A -s main
```

**Why this matters:** The difference between "I can theoretically use this server" and "I actually want to use this server" is input latency. Mosh eliminates it.

---

## 5. The real workflow: local Claude Code plus remote GPU

**Don't run Claude Code on the remote server.** This was my initial instinct — SSH into the GPU box, run `claude` there. It works, but it means every character you type travels across the Pacific before Claude Code even sees it.

The better setup: run Claude Code locally on your MacBook. When it needs to run GPU-intensive tasks, it SSHs into the remote server itself. Your typing, your file browsing, your permission approvals — all local. Only the execution is remote.

```bash
# Don't do this
mosh user@gpu-server
claude  # CC runs remotely, everything is laggy

# Do this instead
claude  # CC runs locally on MacBook
# Then tell CC: "SSH into gpu-server and run the training script"
# CC uses its own Bash tool to SSH — only execution is remote
```

For this to work smoothly, set up SSH key auth and add the server to your `~/.ssh/config`:

```bash
# ~/.ssh/config
Host gpu
    HostName gpu-server.example.com
    User your-username
    IdentityFile ~/.ssh/id_ed25519
    ServerAliveInterval 60
    ServerAliveCountMax 3
```

Now Claude Code can run `ssh gpu 'cd /workspace && python train.py'` without any password prompts. The latency profile becomes: typing (0ms, local) + Claude thinking (Anthropic API, same as always) + execution (remote, but you're not typing during execution).

I keep a tmux session on the remote server for long-running jobs. Claude Code starts the job via SSH, and I can check on it later via Mosh if needed.

**Why this matters:** Separating "where you think" from "where you compute" gives you local-speed interaction with remote-scale resources.

---

## 6. Headless Chrome on Linux actually works (with caveats)

**Browser automation on a headless server is possible, but the obvious approach doesn't work.** If you want Claude Code to interact with web pages on a Linux server — scraping, testing, form filling — you need a specific setup.

The approach that does NOT work: installing `claude-in-chrome` (the browser extension MCP). Chrome extensions use Manifest V3 service workers, and on headless Linux, the service worker dies after 30 seconds of inactivity ([GitHub #16350](https://github.com/nicholasoxford/claude-in-chrome/issues/16350)). You'll get flaky connections and mysterious timeouts.

The approach that works: Xvfb (virtual framebuffer) + Chrome + Chrome DevTools Protocol (CDP).

```bash
# On your Linux server

# 1. Install dependencies
sudo apt install -y xvfb google-chrome-stable

# 2. Start virtual display
Xvfb :99 -screen 0 1920x1080x24 &
export DISPLAY=:99

# 3. Launch Chrome with remote debugging
google-chrome \
  --remote-debugging-port=9222 \
  --no-first-run \
  --no-default-browser-check \
  --disable-gpu \
  --headless=new &

# 4. Verify Chrome is running
curl -s http://localhost:9222/json/version | jq .
```

For Claude Code to use this, you connect it via an MCP server that speaks CDP. The `chrome-devtools-mcp` package works:

```json
// In your MCP config
{
  "mcpServers": {
    "chrome": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp"],
      "env": {
        "CHROME_CDP_URL": "http://localhost:9222"
      }
    }
  }
}
```

This gives Claude Code the ability to navigate pages, extract text, fill forms, and take screenshots — all on a headless server. The CDP approach is more reliable than the extension approach because there's no service worker lifecycle to fight.

**Why this matters:** If you need browser automation as part of a CI pipeline or remote workflow, CDP is the path. Skip the extension.

---

## 7. Oracle Cloud Free Tier: 4 ARM cores, 24GB RAM, zero dollars forever

**There's a permanently free VM that's powerful enough to run Claude Code tasks.** Oracle Cloud's Always Free tier includes an ARM-based Ampere A1 instance with up to 4 OCPUs and 24GB RAM. That's not a trial — it's free indefinitely.

The catch: ARM instances in popular regions (us-ashburn-1, us-phoenix-1, eu-frankfurt-1) are perpetually out of stock. You'll click "Create Instance" and get "Out of capacity for shape VM.Standard.A1.Flex." Every time.

The real tip: write a script that retries automatically.

```bash
#!/bin/bash
# oracle-retry.sh — keep trying until an ARM instance is available

COMPARTMENT_ID="ocid1.compartment.oc1..your-compartment-id"
AVAILABILITY_DOMAIN="YOUR-AD"
SUBNET_ID="ocid1.subnet.oc1..your-subnet-id"
IMAGE_ID="ocid1.image.oc1..your-image-id"  # Ubuntu 22.04 aarch64

while true; do
    echo "[$(date)] Attempting to create instance..."

    oci compute instance launch \
        --compartment-id "$COMPARTMENT_ID" \
        --availability-domain "$AVAILABILITY_DOMAIN" \
        --shape "VM.Standard.A1.Flex" \
        --shape-config '{"ocpus": 4, "memoryInGBs": 24}' \
        --image-id "$IMAGE_ID" \
        --subnet-id "$SUBNET_ID" \
        --assign-public-ip true \
        --ssh-authorized-keys-file ~/.ssh/id_ed25519.pub \
        --display-name "cc-dev-server" \
        2>&1 | tee /tmp/oci-launch.log

    if grep -q '"lifecycle-state": "PROVISIONING"' /tmp/oci-launch.log; then
        echo "Instance created!"
        break
    fi

    echo "Out of capacity. Retrying in 5 minutes..."
    sleep 300
done
```

One important gotcha: set up the networking via CLI, not the web console. The web UI for VCN (Virtual Cloud Network) creation has bugs that silently misconfigure route tables. The CLI is reliable:

```bash
# Create VCN
oci network vcn create \
    --compartment-id "$COMPARTMENT_ID" \
    --cidr-blocks '["10.0.0.0/16"]' \
    --display-name "cc-dev-vcn"

# Create Internet Gateway
oci network internet-gateway create \
    --compartment-id "$COMPARTMENT_ID" \
    --vcn-id "$VCN_ID" \
    --is-enabled true \
    --display-name "cc-dev-igw"

# Create public subnet
oci network subnet create \
    --compartment-id "$COMPARTMENT_ID" \
    --vcn-id "$VCN_ID" \
    --cidr-block "10.0.1.0/24" \
    --display-name "cc-dev-subnet" \
    --prohibit-public-ip-on-vnic false

# Update route table to use internet gateway
oci network route-table update \
    --rt-id "$ROUTE_TABLE_ID" \
    --route-rules "[{\"destination\":\"0.0.0.0/0\",\"networkEntityId\":\"$IGW_ID\"}]"
```

In my experience, the retry script can take anywhere from a few hours to several days, depending on the region. Tokyo has been particularly brutal — I'm still waiting as of this writing. Once you have the instance, it's yours for as long as you keep it running.

**Why this matters:** A free, always-on server with 24GB RAM is enough for background agents, MCP servers, and medium-weight compute tasks. The availability dance is a one-time cost.

---

## What doesn't work (yet)

Honesty section. These are the things I tried that aren't ready:

**Voice auto-detect between languages.** If you switch between English and Mandarin mid-conversation (which I do constantly), you have to manually change the voice language setting each time. There's no auto-detect. [GitHub #33170](https://github.com/anthropics/claude-code/issues/33170) tracks this. It's a dealbreaker for multilingual workflows and I've resorted to just typing when I'm going to mix languages.

**claude-in-chrome on headless Linux.** The Manifest V3 service worker issue ([#16350](https://github.com/nicholasoxford/claude-in-chrome/issues/16350)) means the extension can't maintain a connection on headless setups. The CDP approach from tip #6 is the workaround, but you lose the nice extension UI. If you only need browser automation on your local Mac with a display, the extension works fine.

**Oracle ARM availability.** It's a free resource, and you get what you pay for in terms of availability. If you need a VM today, pay for the first month on any cloud provider and run the Oracle retry script in the background. Once the Oracle instance comes up, migrate and cancel the paid one.

---

## The setup in practice

My daily workflow now looks like this:

| Task | Where it runs | Why |
|------|---------------|-----|
| Claude Code (interactive) | MacBook local | Zero typing latency |
| GPU training | Remote server via SSH | CC dispatches, I don't wait |
| Background agents | Oracle free tier | Always-on, zero cost (for team-based agent workflows, see [[agent-teams-for-research|Agent Teams for Academic Research]]) |
| MCP servers (Chrome, etc.) | Oracle free tier | Headless, CDP-based |
| Session monitoring | Phone via `/rc` | Approve permissions anywhere |

The total cost of this setup beyond the Claude Code subscription: $0/month. The Oracle instance is free. Mosh is free. The phone remote control is built in.

The common thread across all seven tips: the bottleneck in AI-assisted development is rarely the AI. It's the environment around it — permissions, latency, availability, access. Fix the environment, and the AI gets dramatically more useful. For why session management matters so much, see [[context-window-20-percent-heuristic|the 20% heuristic]].

---

*Related: [I A/B Tested the PUA Plugin and Found a Blind Spot](/en/i-ab-tested-pua-plugin) — what happens when you pressure-test AI debugging behavior.*

*March 2026*

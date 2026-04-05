---
title: "Your Deploy Infrastructure Is Overthought"
format: blog
status: published
draft: false
qc: passed
created: 2026-04-05
language: en
tags: [deployment, infrastructure, devops]
topics:
  - Systems
spec: "Single-machine deploy is the right default for solo developers | creator | solo devs overthinking infra"
---

# Your Deploy Infrastructure Is Overthought

My entire production infrastructure is rsync, a Makefile, and a bash script that checks if the new process responds to HTTP before killing the old one. It deploys 42 repositories to a single machine. The whole thing cost me an afternoon to build, nothing to maintain, and $10/month to run.

I used to think this was the part I'd eventually "do properly." Set up GitHub Actions. Write some Terraform. Maybe learn Kubernetes. Then I realized: every hour I spent on deploy infrastructure was an hour I didn't spend on the thing I was deploying. For a solo developer running side projects, that tradeoff is almost never worth it.

---

## The sync system: push and pull

I run two sync planes. The distinction matters.

**Push plane** is rsync, fired manually when I deploy. My laptop talks to the server over Tailscale, and rsync does what rsync has done since Andrew Tridgell wrote the algorithm in his 1996 technical report[^1] — it diffs the file tree, sends only what changed, and finishes in seconds. A typical deploy:

```bash
rsync -avz --exclude node_modules --exclude .venv \
  ./cortex/ server:~/apps/cortex/
```

That's the whole deploy step. No container build, no registry push, no artifact storage. The files are on the server.

**Pull plane** is a cron job that runs every 30 minutes across all 42 of my repositories:

```bash
# pull-all.sh — runs via cron every 30min
for repo in ~/apps/*/; do
  cd "$repo"
  git diff --quiet || { echo "dirty: $repo"; continue; }
  git pull --ff-only 2>/dev/null
done
```

If a repo has local changes (dirty working tree), the script skips it. Otherwise it fast-forward pulls. This handles config updates, content changes, anything that isn't time-sensitive. I don't even think about these deploys — they just happen.

Push for urgency, pull for everything else. No webhook configuration. No CI pipeline. No YAML.

Dan McKinley's "Choose Boring Technology"[^2] argues that every team gets about three innovation tokens — spend them on your product, not your plumbing. For a solo developer, I'd say you get one and a half. rsync and cron are boring in the best possible way: I understand every failure mode, and so does every answer on Stack Overflow.

## Zero-downtime deploy without the infrastructure

The textbook answer to zero-downtime deploys involves a reverse proxy, blue-green environments, maybe a load balancer doing health-check-based routing. Michael Nygard's *Release It!*[^3] covers this in depth — health checks as stability patterns, circuit breakers, graceful shutdown.

The principles are right. The implementation weight is wrong for one person.

Here's what I actually run:

```bash
#!/bin/bash
NEW_PORT=8101
OLD_PORT=8100

# Start new instance on temp port
uvicorn main:app --port $NEW_PORT &
NEW_PID=$!

# Wait for health
for i in $(seq 1 10); do
  curl -sf http://localhost:$NEW_PORT/health > /dev/null && break
  sleep 1
done

# Verify it's actually up
if ! curl -sf http://localhost:$NEW_PORT/health > /dev/null; then
  kill $NEW_PID 2>/dev/null
  echo "Deploy failed: new instance unhealthy"
  exit 1
fi

# Swap: kill old, start on production port
kill $(lsof -ti:$OLD_PORT) 2>/dev/null
sleep 1
kill $NEW_PID
uvicorn main:app --port $OLD_PORT &
echo "Deployed successfully"
```

Start a new process. Check if it responds. If it does, kill the old one and restart on the production port. If it doesn't, abort. The gap between kill and restart is under a second. For a side project with single-digit concurrent users, that's fine.

This is Factor IX (Disposability) from the Twelve-Factor App[^4] in its simplest form: processes start fast, stop gracefully, and the system recovers without manual intervention. I didn't need a process manager or a container orchestrator to get there. I needed `curl -sf` and an `if` statement.

## Makefile as orchestrator

Stuart Feldman wrote Make at Bell Labs in 1976 because his colleague stormed into his office cursing about wasting a morning on a build that silently used stale object files[^5]. Fifty years later, the problem Feldman solved — "run these commands in this order, and don't make me remember the order" — is exactly what I need for deploys.

```makefile
.PHONY: deploy start stop sync

sync:
	rsync -avz --exclude node_modules --exclude .venv \
	  ./cortex/ server:~/apps/cortex/
	rsync -avz ./web/ server:~/apps/web/

deps:
	cd cortex && uv sync
	cd web && pnpm install

build:
	cd web && pnpm build

start:
	cd cortex && uvicorn main:app --port 8100 &
	cd web && pnpm start &

stop:
	-kill $$(lsof -ti:8100) 2>/dev/null
	-kill $$(lsof -ti:3000) 2>/dev/null

deploy: sync deps build stop start
	@echo "Deployed."
```

`make deploy` does everything. `make stop` kills the running services. Each target maps to one operation. I can run any step independently, compose them in any order, or hand the Makefile to someone who's never seen the project and they'll understand it in 30 seconds.

Compare this to a GitHub Actions workflow that does the same thing. You're writing YAML that triggers a runner that SSHs into your machine that runs the same commands. You've added three layers of indirection and a vendor dependency to avoid typing `make deploy`. The Makefile is the original infrastructure-as-code, and for a single machine it's still the best.

## The scaling path nobody needs yet

The objection I hear most: "But what happens when you need to scale?"

Each piece of this stack maps cleanly onto its "serious" equivalent. This isn't an accident — it's Martin Fowler's Strangler Fig pattern[^6] applied to infrastructure. You don't rewrite; you replace one piece at a time when the pain justifies it.

| Solo stack | First scale step | Full scale |
|---|---|---|
| rsync | `docker push` to registry | ArgoCD + GitOps |
| Health-check bash | Docker Compose healthcheck | k8s readiness probes |
| Makefile | docker-compose.yml | Helm charts |
| Cron git-pull | GitHub Actions on push | ArgoCD auto-sync |
| Single VPS | Two VPS + DNS failover | k8s cluster |

The key: every row is a clean upgrade, not a rewrite. When I eventually need container isolation, I write a Dockerfile and change `make deploy` to run `docker compose up`. The health check moves into the compose file's `healthcheck` directive — same `curl -sf`, different location. The Makefile becomes the thing that calls `docker compose` instead of calling `uvicorn` directly.

I haven't needed any of the right-hand column yet. Maybe I never will. Kelsey Hightower's "nocode" repository[^7] — 60,000 GitHub stars for a project that deploys nothing — is satire, but the underlying point isn't: the best infrastructure is the infrastructure you don't have to operate.

## The everything-on-one-machine philosophy

My VPS costs $10/month. My Cloudflare Tunnel replaces nginx, Caddy, SSL certificates, and port forwarding. The tunnel binary runs on the server and punches out to Cloudflare's edge — no inbound ports open, no certificate renewal cron jobs, no reverse proxy config.

Single-user means no multi-tenancy. No multi-tenancy means you don't need:

- Role-based access control on your deploy pipeline
- Secrets management beyond environment variables in a `.env` file
- Audit logs for who deployed what when (it was you, just now)
- Approval gates, staging environments, or canary deploys

Every one of those is a real requirement in a team. None of them are a real requirement for one person pushing code to one machine. The Twelve-Factor App methodology[^4] is excellent engineering, but Factor V (Build, release, run) assumes distinct stages because teams need coordination boundaries. You don't have a team. You don't need the boundaries.

I keep a `deploy.log` that's literally:

```bash
echo "$(date) deployed $APP" >> ~/deploy.log
```

That's my audit trail. It has never been insufficient.

## The takeaway

Start with rsync, a Makefile, and a health check. You'll be surprised how long it stays sufficient — and when it finally isn't, every piece upgrades cleanly. The deploy infrastructure you don't build is the deploy infrastructure that never breaks at 2 AM.

---

[^1]: Andrew Tridgell and Paul Mackerras, "The rsync algorithm," Technical Report TR-CS-96-05, Australian National University, 1996. Expanded in Tridgell's PhD thesis, *Efficient Algorithms for Sorting and Synchronization*, ANU, 1999.

[^2]: Dan McKinley, ["Choose Boring Technology,"](https://mcfunley.com/choose-boring-technology) 2015. Talk given at OSCON Portland.

[^3]: Michael T. Nygard, *Release It! Design and Deploy Production-Ready Software*, 2nd ed., Pragmatic Bookshelf, 2018. Chapters on stability patterns and health checks.

[^4]: Adam Wiggins, ["The Twelve-Factor App,"](https://twelve-factor.herokuapp.com/) Heroku, 2011. Factor IX (Disposability) and Factor V (Build, release, run).

[^5]: Stuart Feldman, "Make — A Program for Maintaining Computer Programs," *Software: Practice and Experience* 9(4), 1979. ACM Software System Award, 2003.

[^6]: Martin Fowler, ["Strangler Fig Application,"](https://martinfowler.com/bliki/StranglerFigApplication.html) martinfowler.com, 2004.

[^7]: Kelsey Hightower, [nocode](https://github.com/kelseyhightower/nocode), GitHub, 2018. "No code is the best way to write secure and reliable applications."

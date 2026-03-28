---
title: "One Command, Multiple Sources: How I Built a Research Engine That Actually Finds What People Are Talking About"
date: 2026-03-29
tags: [ai, claude-code, research-tools, last30days, open-source]
qc: passed
---

I ran `/last30days Arizona Basketball` last week and got back NCAA Tournament championship odds from Polymarket — Arizona at 12%, #1 seed probability at 88%, Big 12 title race at 69% — pulled from 50+ open prediction markets across 10 events before I'd even opened a browser tab. I was expecting Reddit takes and maybe a few highlight reels. I got what the betting market actually believes, alongside r/CollegeBasketball's running commentary and YouTube breakdowns ranked by real view counts. That's the gap this tool is trying to close: not "what was written about this topic" but "what is everyone currently arguing about, betting on, and watching."

The Polymarket detail was the thing that changed how I thought about the project. Prediction markets aggregate genuine belief — someone is staking real money on Arizona's tournament odds. That's a different signal from a Reddit post. When both say the same thing, you have convergence that means something. When they diverge, you have a question worth investigating.

## Why I built it instead of using something else

I built last30days because I kept running into the same problem: I needed to know what people were actually saying about something right now, not what Google's index thought was authoritative six months ago.

The workflow I kept doing manually — open Reddit, run a search, skim the top threads, switch to X, skim some tweets, try to find relevant YouTube videos, cross-reference anything interesting — was taking 20-30 minutes per topic and still felt incomplete. And the worst part wasn't the time. It was that I'd do all that work and still not know if I was seeing a representative sample. Was the Reddit thread I found the main thread, or was there a bigger one I missed? Was the X take I found the original, or a response to something I hadn't seen? Manual search gives you what the algorithm surfaced, not what the community said.

Google search is good at finding what's been written. It's bad at finding what's being discussed. A well-optimized article from eight months ago will outrank a thread with 2,000 upvotes from last week, even if the thread has more actual signal about what people currently think. That asymmetry is a known failure mode and no one has really fixed it.

The existing AI research tools I tried either used AI-estimated engagement ("this post probably has high engagement") or searched without a strict recency window. I wanted real upvote counts, real view counts, real trading volume. That's why the Reddit enrichment step fetches actual thread JSON rather than trusting whatever the search API returns.

## What it does

`/last30days [topic]` searches Reddit, X, YouTube, Hacker News, Polymarket, Bluesky, TikTok, and Instagram concurrently, scores every result through a composite pipeline, deduplicates near-identical content, and synthesizes a narrative report. The whole thing takes 2-8 minutes depending on how niche the topic is.

The scoring is the part I spent the most time on. Each result gets a composite score based on text similarity (with synonym expansion), log-scaled engagement normalization, and recency decay. When the same claim appears on Reddit, X, and YouTube simultaneously, cross-source linking flags the convergence. That's itself information — it means something shifted in the conversation.

Polymarket results are scored differently because prediction markets are structured differently. The pipeline scores text similarity against individual market positions — not just event titles — then factors in a market quality sub-score based on volume, liquidity, and price movement. The top-level scoring weights relevance at 60%, recency at 20%, and engagement at 20%. That's how it finds "Arizona" as an outcome inside a broader NCAA bracket market rather than missing it because the market title says "2026 March Madness."

## Walkthrough: Seedance 2.0

I ran `/last30days Seedance 2.0` in late February and the results were more useful than anything I could have assembled manually in the same time.

The synthesis surfaced threads that no single source would have shown me. A warning from @WyldeChyldeRec about phishing emails using Seedance branding had surfaced with fake "unrestricted generation" offers. Meanwhile, CapCut integration went live on February 25 at roughly $2/generation, removing the Chinese phone number requirement. And ElevenLabs had silently removed Seedance 2.0 after a SAG-AFTRA incident, cutting off a key UGC workflow.

The phishing detail was the one that surprised me. It's not the kind of thing any single source would elevate — it's a tweet from one account with moderate engagement. But its presence alongside r/Seedance_AI complaints about account bans and third-party API uncertainty told me something real: the gap between official access and user demand had grown large enough to create a scam ecosystem. That's a meaningful data point about where the market actually is. Cross-platform convergence detection pulled it up because the same underlying signal — "people are desperately trying to access this and can't" — was appearing across Reddit, X, and third-party API discussions simultaneously.

The stats block: 16 Reddit threads across r/Seedance_AI, r/generativeAI, r/AIGuild and 5 others; 11 X posts; 10 YouTube videos including Theoretically Media's 199K-view review. Four minutes.

## Comparative mode

The v2.9.5 addition I use most is `X vs Y` queries. Type `/last30days React vs Svelte` and you get three parallel research passes — one on React, one on Svelte, one on the comparison query itself — synthesized into a side-by-side with a data-driven verdict. When I ran this, the result wasn't "React is better" or "Svelte is better." The synthesis correctly identified that the React vs Svelte debate in 2026 had shifted: React's dominance is increasingly described as inertia rather than preference, Svelte 5's rune system divided the Svelte community itself, and the highest-engagement post was actually about TypeScript-first tooling — neither framework specifically.

That nuance is what manual research misses. When you search "React vs Svelte" yourself, you find people arguing. When the tool searches all three queries and cross-references the engagement data, you find out what people actually care about underneath the argument.

## Honest limitations

Three sources require paid API keys: Reddit, TikTok, and Instagram share a single ScrapeCreators key, and X search works best with cookie-based auth from your own X session. Hacker News and Polymarket are free — they both have open APIs. Bluesky is free with an app password. The cost is real but modest; most sessions cost cents, not dollars.

Source quality is uneven. Reddit threads with high upvote counts are generally high signal. TikTok and Instagram results are noisier — view counts can be gamed, and the content is harder to quote meaningfully in a text synthesis. I weight YouTube lower than Hacker News for most technical topics because views don't map cleanly to informed opinion. I haven't fully solved this.

The 30-day window is a feature that's also a constraint. It's excellent for "what's happening now" but useless for anything where the important context is older than a month. If you're trying to understand a technology's history or a multi-year debate, this tool will mislead you by design — it will show you only the most recent layer of a conversation that has years of context underneath it.

The model fallback chain handles API outages gracefully, but when your primary synthesis model is down and you fall back to a smaller model, the quality of the narrative drops noticeably. The data is still there; the synthesis is flatter. You'll know when it happens — the report reads more like a list than a story.

One more thing I've noticed from daily use: the tool is very good at finding what people are saying and less good at evaluating whether what they're saying is true. When a r/generativeAI thread claims Seedance 2.0 generates one-minute films with zero editing, the tool reports that claim faithfully. Verifying it is still on you. I think of it as a signal collector, not a fact checker — it dramatically lowers the cost of knowing what claims are circulating, but the epistemics are still yours to manage.

## Where this ends up

The GitHub repo has 650+ tests and a comparative mode that runs three research passes in parallel. I use it daily. My actual research workflow now starts with `/last30days` before I open any browser tab, and it's changed how I allocate the rest of my research time — less casting wide, more going deep on the 2-3 things the synthesis flagged as genuinely interesting.

The auto-save feature (added in v2.9.1) means every run builds a file in `~/Documents/Last30Days/`. After a few months of daily use, that folder is a weird kind of diary — a record of what I was curious about and what the internet was saying at that moment. I didn't plan for that. It's one of the more useful things the tool does.

When you can survey a month of internet conversation about any topic in under five minutes, the scarce resource stops being information access and starts being judgment about what to do with it.

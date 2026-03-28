---
title: "The 920-Point Story That Didn't Exist"
created: 2026-03-28
date: 2026-03-29
tags: [AI, claude-code, open-source, hackernews]
topics:
  - AI
qc: passed
spec: "Keyword search against HN titles silently misses high-engagement stories whose titles don't match generic query terms; a trending-stories merge fixes the structural gap | contributor — diagnosed the failure and shipped PR #115 to mvanhorn's last30days | researchers and developers who rely on last30days for current-events monitoring"
---

I was looking at the HN front page and saw a story about a LiteLLM supply chain attack — 920 points, several hundred comments, clearly a big deal in the AI security space. Later that day I ran `/last30days` searching for recent AI security news, and it wasn't there. I searched "LLM", "security", "supply chain". Nothing. The story existed — I'd just read it — but the tool couldn't find it.

That's the kind of failure that's easy to miss. If results are wrong, you notice. If results are *absent*, you don't know what you don't know.

## What last30days is

`/last30days` is an open-source Claude Code skill by mvanhorn that searches Reddit, X, YouTube, Hacker News, and several other sources concurrently, then synthesizes what people are currently saying about a topic. I use it daily. The HN component searches Algolia's HN API by keyword.

That's where the problem lives.

## The diagnosis

Algolia's HN search is keyword-only. It matches your query against story titles. If a story's title doesn't contain your exact search term, that story is not in the result set at all — not ranked lower, not present with a low score, just absent.

"LiteLLM supply chain attack" is a story about AI security. But its title says "LiteLLM", not "AI" or "LLM" or "security". Algolia treats those as different terms. So a search for "AI security" or "LLM" doesn't find it, even at 920 points with hundreds of comments, because the title doesn't happen to contain those words.

This isn't a bug in last30days. The code was working exactly as intended — faithfully returning what Algolia returned. The problem is structural: keyword search against titles is the wrong tool for finding what's currently generating discussion on HN, because high-engagement stories often have specific titles that don't contain the generic terms you'd search for.

## The fix — PR #115

The approach: fetch trending stories (>200 points) from the same date range alongside the keyword search, then merge by story ID. One additional Algolia request. Stories that show up in both keyword and trending results appear once.

A few design decisions that weren't obvious:

**Points filter, not the `front_page` tag.** Algolia has a `front_page` tag, which sounds like exactly what you'd want. But the 920-point LiteLLM story didn't have it. The tag is unreliable — it's not populated consistently. A points threshold is deterministic: a story either has 200+ points or it doesn't.

**`search_by_date` endpoint, not `search`.** The `search` endpoint with an empty query returns unpredictable results — Algolia's relevance ranking breaks down without a query term. `search_by_date` with a points filter just gives you all qualifying stories from the time window, which is what you want.

**Over-fetch + trim.** Algolia can't sort results by points server-side, so the query fetches 200 stories and the code sorts by points locally, then returns the top N based on the depth setting (50/75/150 for quick/default/deep). The 200-point minimum keeps the request bounded — there aren't that many stories above that threshold in any 30-day window.

**Graceful fallback.** If the trending request fails, keyword results are returned unchanged. The existing behavior is unaffected.

253 additions, 1 deletion, 5 files, 8 new tests. All 27 tests pass.

## What I took away from this

Silent failures are harder to catch than noisy ones. A search that returns wrong results is obviously broken. A search that returns plausible-looking results with something missing — you have no way to know unless you independently encounter the missing thing, which I only did because I happened to see the LiteLLM story on the front page that day.

This applies beyond HN search. Any system that filters or retrieves results can have blind spots that are structurally invisible: the results you see look fine, the results you don't see are just gone. The only way to detect it is to audit from the output side — notice what should be there and isn't — rather than from the input side.

## Where it stands

The repo owner, mvanhorn, reviewed it: *"Nice find on the structural blind spot... I think I like the trending merge approach. Can't commit to merging right now — the v3.0 refactor overhauls how HN results are gathered — but I'll evaluate this in that context. Thanks for the rebase."*

DanRWilloughby: *"Great catch on the structural blind spot. Searching 'AI' and missing a 920-point story because the title says 'LiteLLM' is exactly the kind of silent failure that erodes trust in the output. The trending merge approach is clean."*

PR #115 is open. Not merged yet — it'll be evaluated when v3.0 lands. Fine by me. The fix exists; the rest is timing.

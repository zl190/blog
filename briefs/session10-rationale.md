# Session 10 Rationale Log — 2026-03-29

> Key reasoning chains preserved for audit. Not for execution agents.

## Decision evidence

### TOC + Backlinks → left sidebar
- User: "Table of Contents and backlinks now at the right columns, but right columns are so crowded, can we move them to the left?"
- Changed quartz.layout.ts: moved DesktopOnly(TableOfContents()) and Backlinks() from right[] to left[].
- Right sidebar now: Graph (conditional) + TagCloud only.
- Build clean, committed as 395fa0b, pushed.

### Vale linter
- 9 AI smell items from blog-content.md. Skipped #7 (balanced paragraphs) and #8 (no personality) — not lintable.
- SycophancyOpening = error level (blocks commit). All others = warning (informational).
- write-good package installed as baseline. Initially had So.yml at error level which blocked commit on "So a search..." in last30days. Fixed by downgrading all write-good rules to warning in .vale.ini.
- Pre-commit hook: ValeGate section appended after existing SpecGate/QCGate.

### SM P0 smoke run
- 3 tasks (easy: off-by-one paginator, medium: mutable default in Cart, hard: sort direction in EventBus), 5 conditions, 1 run each = 15 runs.
- All 15 passed. $1.63 total (under $8 budget). PUA most expensive ($0.40/run, 515K input tokens) vs Bare cheapest ($0.07/run, 235K tokens).
- No differentiation at P0 — expected. Tasks designed to be trivially solvable for harness validation.
- User: "hold the sm run, I need validate it" — wants to review task design before P1.

### Topics ≠ Arcs (expert evaluation)
- Builder initially proposed merging (overlap between categories).
- User: "感觉现在的topics 和 arcs 不是一个axis, 让合适的内容专家评估一下"
- domain-researcher (opus) evaluated: Topics = subject matter taxonomy (reader navigation), Arcs = argument-position facet (author editorial planning). Different relationship types (similarity vs narrative dependency). Simon Willison uses both (tags + series).
- Verdict: keep separate. Topics = frontmatter + UI, Arcs = blog-design.md document only.

### Blog visual style guide
- User: "后台调研有没有best practice 的blog 图文模版, ai blog生图"
- Researcher found: no single canonical template exists. Synthesized from ArtSmart workflow, Draft.dev diagram guide, Imagen 4 prompting guide, Stripe/Anthropic/Notion/Linear visual systems.
- Key finding: style anchor system — one permanent style block embedded in every prompt.
- User: "这个很重要, 需要独立的qc, 单独写出, blog, blog-design, blog-style" → created blog-visual.md.

### Blog + Platform independence
- User: "是把现在的blog扩展成platform, 还是两头碰?"
- system-architect (opus) evaluated: architecturally incompatible (SSG vs dynamic full-stack), different audiences (public readers vs self), different deployment (GitHub Pages vs remote-server). Simon Willison model: blog = thinking outlet, tool = independent product.
- Verdict: stay independent, connect via RSS feed only.

### Interaction modes framework
- User observation: "我现在在claude code 里mix了多种requests: task, brainstorm, expert 意见, push"
- Formalized into 4 modes with signal detection and context strategies.
- Key insight: brainstorm without distill = context bloat. Expert in main context = confirmation bias.
- User: "这个观察和需求要写入文件, 需要一个方案, ideally 有个top model 自动router"
- Mode router identified as potential product: API stateless = needs external state management.

## Unconfirmed proposals

- Domain Pack architecture (~/.claude/packs/blog-website/): discussed but not built. Would consolidate blog-content + blog-design + blog-visual + enforcement into a composable unit.
- Mobile roadmap 3 phases: Phase 0 (Obsidian/GitHub Mobile), Phase 1 (Blink + mosh to remote-server), Phase 2 (ctx web UI). Not started.
- SM 4-layer research decomposition: Design → Measurement → Pilot → Execution. Discussed but user hasn't started Layer 1 validation.
- Mode router T1 implementation (CLAUDE.md rules): framework written, integration pending.
- Warming Dashboard blog (P2): thesis identified but not written.

## Rejected

- Public arcs page (content/arcs.md): user said "不行, 这个设计不行, 太复杂, 显示的也不对, 回滚". Deleted.
- Merging Topics and Arcs: expert said they're different axes. User agreed.
- Merging Blog and Platform: expert said architecturally incompatible. User received.
- "大屠杀" as blog title: user said "这个名字不行, 得换". Changed to "假说淘汰赛" then "假说淘汰".
- Early work timeline in memory: user initially said "不用进memory", then said "还是加回来吧". Added back.

## Discoveries

| Finding | Source |
|---------|--------|
| write-good.So rule defaults to error level, blocks commit on "So..." sentences | ValeGate debugging |
| Quartz filters draft:true pages — they 404 | Arcs page preview attempt |
| 3 published posts had no wikilinks (last30days, thoughts-on-ai-agent-ecosystem, wuxing-gnn) | Backlinks audit |
| Blog pre-framework work spans Feb 7 - Mar 18: greedy coding → Dobby → warming dashboard (9 hypotheses, 3 killed) → mixed-good paper (UCLA Anderson 4/30) | Memory/repo archaeology |
| PUA token overhead visible at P0: 515K input vs Bare 235K | SM smoke run results |
| Style anchor system: define one permanent prompt block, embed in every Imagen generation | Visual research |
| Scene vs Schema rule: AI illustration for landscapes of components, diagrams for labeled directed relationships | Visual research |

## Constraint reasoning

| Constraint | Reason |
|-----------|--------|
| Topics ≠ Arcs, do not merge | Expert evaluation: different relationship types (similarity vs narrative dependency), different audiences (reader vs author) |
| Blog three-file convention: blog-content / blog-design / blog-visual | User: "统一命名". Each file governs one dimension with its own persona and QC. |
| ValeGate: AISmell errors block, warnings informational | Forward-looking enforcement. Existing posts have some write-good warnings (acceptable). |

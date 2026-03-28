# Session 7 Rationale Log — 2026-03-29

> Key reasoning chains preserved for audit. Not for execution agents.

## Decision evidence

1. **Landing page redesign** — Session 7 researched jzhao.xyz, simonwillison.net, jvns.ca, danluu.com via Chrome. Julia Evans pattern (date + title rows) adopted for article list. Evidence: screenshot comparison during session.

2. **Content structure flattened** — User complained about breadcrumbs showing `Home > en > Article`. Root cause: files in `content/en/` folder. User chose option 2 (move files to root) over option 1 (remove breadcrumbs). Breaking change: old `/en/*` URLs now 404.

3. **Topics vs Tags separation** — User said "tags 和 topics 分开, topics 是大类（AI, Systems, Learning）". Session 7 created TopicNav component reading `topics` frontmatter field. Tags remain for fine-grained classification.

4. **Explorer replaced with TopicNav** — User kept asking "explorer里为啥还是en, zh?" even after folder removal (localStorage cache + empty dirs). Session 7 suggested replacing Explorer entirely since RecentNotes + TagCloud covered navigation. User agreed by asking "explorer 要不显示topics呢?"

5. **Graph View fix chain** — Three failed attempts before correct solution:
   - Attempt 1: Hide graph on index (user pushed back: "谁说的?")
   - Attempt 2: Auto-trigger `renderGlobalGraph()` on index (created popup overlay, wrong UX)
   - Attempt 3: Add wikilinks to index.md as "Topics:" line (user said "你不如放在explorer?")
   - Final: `depth: -1` in localGraph config for index page — renders all nodes in sidebar widget

6. **Article dates** — 7 articles had no `created` date, defaulted to git commit date (all Mar 29). Research agent traced actual creation dates through session briefs, seminar handoff.yaml, and memory files. Dates spread from Jan 27 to Mar 28.

7. **Session blog factual error** — "zero published articles" was false. 6 articles had published dates before Session 6. User caught this ("zero 这也不是事实吧"). Fixed to "handful of articles, no process."

8. **Session blog title** — User said "15 是不是写太死了". Changed from "From Framework to 15 Articles" to "From Framework to Published: How I Batch-Shipped a Blog".

9. **AI tag case** — User asked "tags 里ai为什么不是大写?" Root cause: TagCloud used `toLowerCase()` for deduplication. Fix: standardized frontmatter to `AI`, TagCloud preserves original case for display, lowercases for URLs only.

10. **baseUrl** — Was `zl190.github.io/blog` (pre-custom-domain). User agreed to update to `blog.ylab3.com`. Affects OG images, sitemap, RSS.

## Unconfirmed proposals

- **Hero images with unified personal style** — User asked "能不能有统一的个人风格?" Session 7 proposed 4 options (algorithmic, AI-generated, typography, enhanced OG). Recommended algorithmic. User interest but no decision.
- **蒙娜丽莎 gaze-following background** — User asked twice. Session 7 flagged as conflicting with text-focused design. No decision.
- **Word cloud on blog** — User initially asked, Session 7 said no (too few articles). User overrode: "pua Word cloud 加; tag 列表也加". Implemented as TagCloud component, later moved to right sidebar when TopicNav took left sidebar.

## Rejected

- **Hide Graph on index page** — User rejected: "index 页面 Graph 本来就没什么用, 谁说的?"
- **Global graph popup on index** — Wrong UX (full-page overlay), reverted.
- **Topics: line on index.md body** — User said "你不如放在explorer?" Better to use sidebar component.
- **Removing tags from article list** — Session 7 hid tags, user said "每篇文章下面的 tags 是常规操作吧". Tags restored.

## Discoveries

| Finding | Source |
|---------|--------|
| Quartz `index.css` has no content hash — browser cache doesn't invalidate on deploy | Session 7 debugging: CSS changes not appearing after push |
| Explorer `useSavedState: true` (default) restores collapsed state from localStorage, overriding `folderDefaultState: "open"` | Session 7 debugging: Explorer folders stayed collapsed |
| Quartz Graph `depth: -1` shows all nodes in local graph widget (same as global graph content but in sidebar, not popup) | Session 7 Graph View fix attempt 4 |
| `renderGlobalGraph()` opens a full-page overlay, NOT a sidebar widget | Session 7 Graph View fix attempt 2 |
| Empty directories (en/, zh/) still show in Explorer even after moving all files out | Session 7 — had to `rm -rf` the directories |
| D3 force-directed graph layout is non-deterministic — randomized initial positions each load | User asked "为什么每次刷新 graph view 显示的都不一样?" |

## Constraint reasoning

- **Build locally before push** — Session 7 had multiple CSS/layout issues that only showed after deploy + cache clear. Local build + localhost verification catches these before pushing.
- **Read blog-design.md before layout changes** — Session 7 made many ad-hoc layout changes. Design framework created mid-session to systematize future changes.
- **Read quartz-coding-guide.md before Quartz changes** — Session 7 had 3 failed Graph View fixes due to not understanding Quartz's local vs global graph architecture. Coding guide documents these internals.

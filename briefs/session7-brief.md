# Session 7 Brief — 2026-03-29

> Execution agent reads ONLY this. No reasoning, no process.

## What was decided (Session 7)

1. Blog landing page redesigned: tagline "Experiments in AI tooling, systems, and what actually works." + RecentNotes auto-list (Julia Evans style: date left column + title)
2. Content structure flattened: `content/en/` and `content/zh/` → `content/` root. URLs now `/article-name` not `/en/article-name`
3. Topics separated from Tags: Topics = broad categories (AI, Systems, Learning) in left sidebar via TopicNav component. Tags = specific labels in right sidebar via TagCloud
4. Explorer replaced with TopicNav in left sidebar
5. Graph View: index page uses `depth: -1` (full blog graph in sidebar), article pages use `depth: 1` (local connections)
6. TagCloud component: reads frontmatter tags, sized by frequency, `minCount: 2`, preserves original case, lowercase URLs
7. Article dates redistributed to actual creation timeline (7 articles that were batch-committed Mar 29 now have real dates from Jan 27 to Mar 28)
8. Session blog published: "From Framework to Published: How I Batch-Shipped a Blog" — fixed "zero published articles" factual error
9. baseUrl updated from `zl190.github.io/blog` to `blog.ylab3.com`
10. AI tag standardized to uppercase across all articles
11. pipeline-ops pushed to GitHub: https://github.com/zl190/pipeline-ops
12. PR #115 (mvanhorn/last30days-skill) — parked, owner deferring to v3.0 refactor
13. Spina email draft reconstructed at `seminar_claude_for_research/email-spina-draft.md`
14. Design framework created: `~/.claude/memory/knowledge/output-styles/blog-design.md` (TheDesigner persona, layout QC checklist)
15. Quartz coding guide created: `~/.claude/memory/knowledge/quartz-coding-guide.md` (TheQuartzDev persona, implementation patterns)
16. No hero/banner images — text-focused design confirmed. Quartz CustomOgImages handles social sharing cards
17. Force-directed graph layout is non-deterministic by design (D3 standard behavior)

## Constraints

- User is P8 — don't ask, decide and execute
- 拿来主义 = borrow design, reject code
- No credential → need evidence on every claim
- Publish with evidence, not after perfection. 0 x infinity = 0.
- Blog: no `qc: passed` = no publish (pre-commit hook enforced)
- Blog: independent QC agent reviews, not the builder
- Before any layout change: read `blog-design.md` (TheDesigner) + `quartz-coding-guide.md` (TheQuartzDev)
- Build and verify locally (`npx quartz build` + localhost) before pushing. Browser cache issue: `index.css` has no hash, need hard reload.

## What to execute next

| Priority | Task | Status |
|----------|------|--------|
| P1 | 方法论全景图 blog | Not written. Depends on session blog (now published). Source: `~/.claude/memory/knowledge/framework-panorama.md` |
| P1 | Email Spina | Draft ready at `seminar_claude_for_research/email-spina-draft.md`. Verify blog URLs are live, fill in name, send. |
| P2 | Hero images with unified personal style | User interested. Options: algorithmic generative art (recommended), AI-generated, typography-based. No decision yet. |
| P2 | 蒙娜丽莎背景 (gaze-following background) | User floated idea. CSS + JS parallax, ~30 min. Conflicts with text-focused design. |
| P2 | SM smoke run ($8) | Experiment design complete in `sm-vs-pua/.claude/CLAUDE.md`, not executed |
| P2 | Vale linter for blog enforcement | Turn 9 AI Smell items into YAML rules. ~2-3h. |
| P2 | TIL format (`content/til/`) | Low friction quick posts, Simon Willison pattern |
| P2 | Panorama update: add Input Optimization layer | User idea from session 6, not written |
| P3 | Revise i-accidentally-reinvented-org-mode | QC'd and published but REVISE items remain |
| P3 | last30days blog as upstream PR to mvanhorn/last30days-skill | Separate from blog post |

## Key files

| File | Purpose |
|------|---------|
| `~/Developer/personal/blog/` | Blog repo (Quartz v4, GitHub Pages, blog.ylab3.com) |
| `~/Developer/personal/blog/quartz.layout.ts` | Layout config — TopicNav left, Graph+TOC+Backlinks+TagCloud right |
| `~/Developer/personal/blog/quartz/components/TopicNav.tsx` | Custom component: Topics (AI/Systems/Learning) in left sidebar |
| `~/Developer/personal/blog/quartz/components/TagCloud.tsx` | Custom component: tag cloud with frequency sizing |
| `~/Developer/personal/blog/content/` | All articles (flat, no en/zh folders) |
| `~/.claude/memory/knowledge/output-styles/blog-design.md` | Design QC framework (TheDesigner persona) |
| `~/.claude/memory/knowledge/quartz-coding-guide.md` | Quartz coding patterns (TheQuartzDev persona) |
| `~/.claude/memory/knowledge/output-styles/blog.md` | Blog content template (TheEditor persona) |
| `~/Developer/personal/pipeline-ops/` | Operator pattern repo — pushed to GitHub |
| `~/Developer/personal/seminar_claude_for_research/email-spina-draft.md` | Email draft to Alessandro Spina |

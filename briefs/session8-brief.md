# Session 8 Brief — 2026-03-29

> Execution agent reads ONLY this. No reasoning, no process.

## What was decided (Session 8)

1. Panorama blog published: "The Stack I Didn't Design: A Map of AI-Assisted Production" — QC passed, supply chain/per-capita productivity section added
2. BackgroundArt plugin: modular theme pools, CSS mask vignette, mouse parallax gaze-following, dark/light opacity, user toggle (eye icon bottom-left, localStorage `background-art-visible`)
3. Mona Lisa variant pool: 17 images — 1 classic + 6 AI-generated memes (Imagen 4: sunglasses, cat-face, vr-cyberpunk, selfie, pixel-16bit, anime) + 10 crawled public domain variants. Random on each nav
4. Color-filter variants rejected: pixel-art/silhouette/neon/pop-art/inverted are just color changes, not real style. Only memes and true二创 allowed
5. RunningCorgi refactored to RunningMascot: generic engine, mascots[] config, seasonal date rules, turbo bar (walk/run toggle), shares BackgroundArt toggle
6. Corgi sprite: PIL-generated 6-frame pixel art (48x64). Functional but crude — needs professional sprite upgrade
7. Turbo bar: right-top, default slow walk, click for fast run. Changes both horizontal speed and sprite frame rate
8. No research-institute/research-lab in public content or commit logs (feedback saved)
9. Blog里不要提research-institute — 用匿名描述如"a medical AI eval pipeline"
10. Session blog policy: 每个session至少产出一篇post
11. No Buy Me a Coffee — 没有audience时放donation button显得desperate
12. No date heatmap — 17篇文章热力图太空
13. baseUrl remains blog.ylab3.com
14. Google Imagen 4 API available via GOOGLE_API_KEY for image generation

## Constraints

- User is P8 — don't ask, decide and execute
- 拿来主义 = borrow design, reject code
- Blog: no `qc: passed` = no publish (pre-commit hook enforced)
- Blog: independent QC agent reviews, not the builder
- Before any layout change: read `blog-design.md` + `quartz-coding-guide.md`
- Build and verify locally before pushing
- Never mention research-institute/research-lab in public content, commits, or PRs
- Mona Lisa pool: only memes and style二创, no color filters
- Decorative elements (background art, mascot) must be user-toggleable

## What to execute next

| Priority | Task | Status |
|----------|------|--------|
| P1 | Email Spina | Draft ready at `seminar_claude_for_research/email-spina-draft.md`. URLs verified live. Fill name, send. |
| P1 | Corgi sprite quality upgrade | Current PIL sprite is crude. Options: $2 itch.io Welsh Corgi (32x28, 8 frames), or commission, or find Colab's actual sprite. The engine is solid; art is the bottleneck. |
| P1 | RunningMascot → plugin more animals | Architecture ready. Need bunny sprite (Easter), ghost sprite (Halloween). Drop sprite + add config line. |
| P2 | Mona Lisa variant matrix | User wants a curated matrix mapping variants × themes/moods. Maintain as registry. |
| P2 | Session blog: revise "From Framework to Published" | Add practical pipeline walkthrough section (source → builder → QC → publish with real cost/time data) |
| P2 | SM smoke run ($8) | Experiment design at `sm-vs-pua/.claude/CLAUDE.md` |
| P2 | Vale linter for blog | 9 AI Smell items → YAML rules |
| P2 | TIL format (`content/til/`) | Simon Willison pattern |
| P3 | Revise i-accidentally-reinvented-org-mode | REVISE items remain |

## Key files

| File | Purpose |
|------|---------|
| `~/Developer/personal/blog/` | Blog repo (Quartz v4, GitHub Pages, blog.ylab3.com) |
| `quartz/components/BackgroundArt.tsx` | Background art plugin (themes, toggle, parallax) |
| `quartz/components/RunningMascot.tsx` | Running mascot engine (sprite, turbo, seasonal) |
| `quartz/static/backgrounds/mona-lisa/` | 17 Mona Lisa meme variants |
| `quartz/static/sprites/corgi-run.png` | 6-frame corgi sprite sheet (needs upgrade) |
| `content/framework-panorama.md` | "The Stack I Didn't Design" blog post |
| `~/.claude/memory/project_blog-decorations.md` | Decoration architecture + variant pool reference |
| `~/.claude/memory/feedback_no-research-institute-in-blog.md` | No work project names in public content |

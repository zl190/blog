# Session 8 Rationale Log — 2026-03-29

> Key reasoning chains preserved for audit. Not for execution agents.

## Decision evidence

1. **Panorama blog** — Builder agent (sonnet) wrote draft from `~/.claude/memory/knowledge/framework-panorama.md`. Independent QC agent (opus) audited against blog style guide — 10/10 checks passed, 1 minor fix (unlabeled code fence). Published with `qc: passed`. User requested research-institute references removed → replaced with "medical AI eval pipeline". User requested supply chain/per-capita productivity section added → written.

2. **BackgroundArt plugin** — Session 7 brief listed "蒙娜丽莎背景" as P2. User escalated with specific requirements (semi-transparent, theme-aware, rotatable). Built MonaLisaBackground → immediately refactored to BackgroundArt per user's "模块化 plugin 设计" feedback. Multiple iterations: corner position → centered → mask vignette. User feedback drove each change.

3. **Mona Lisa color filters rejected** — Session 8 generated PIL filter variants (pixel-art, silhouette, neon, pop-art, inverted). User: "没有meme结合, 只变颜色没有风格, 得风格强烈". Deleted all filter variants. Generated 6 meme variants via Google Imagen 4 API. Crawl agent found 10 more public domain variants.

4. **RunningCorgi → RunningMascot** — User: "如果我要兔子怎么办, 能不能有个通用engine, 然后plugin animal或者object?" Refactored from hardcoded corgi to configurable mascot engine with seasonal date mapping.

5. **Turbo bar** — User: "不开就慢慢的走". Added walk/run speed toggle. Default slow walk (0.8s frame rate, 12s crossing), turbo fast run (0.25s frame rate, 3.6s crossing).

6. **No research-institute** — User: "blog里不要提research-institute" and "commit log里也不要有research-institute". Checked git history: clean. Saved feedback memory. Applied to panorama blog immediately.

## Unconfirmed proposals

- **Colab-style dog running banner** — User showed Colab corgi screenshot. Current PIL sprite is acknowledged as crude. User interested but no decision on whether to buy $2 itch.io sprite or find alternative.
- **Running dog should be like Colab** — User: "emoji的实现也可以留着, 反正plugin, 当成fallback也行". Emoji kept as fallback mode in RunningMascot.
- **Mona Lisa variant matrix** — User: "mona Lisa 风格二创可以维护一个matrix". No implementation yet.
- **Session blog 综合实战** — User asked if "From Framework to Published" should emphasize practical real-world application. No decision on whether to revise existing post or write new one.

## Rejected

- **Date heatmap** — User asked "pua 要不要加上日期热力图". Rejected: 17 articles too sparse, would expose low output frequency.
- **Buy Me a Coffee** — User asked "要不要加 buy me a coffee?" Rejected: no audience signal yet.
- **Color filter variants** — User: "不能用变色的, 有点奇怪, 要用就用meme". PIL-generated pixel-art/silhouette/neon/pop-art/inverted all deleted.
- **Simple image scale-up** — User: "不能单纯放大". Led to CSS mask vignette approach.

## Discoveries

| Finding | Source |
|---------|--------|
| Google Imagen 4 works via `google.genai` SDK with GOOGLE_API_KEY | Session 8 meme generation agent |
| At 5% opacity, only high-contrast silhouettes/bold modifications are recognizable | Mona Lisa variant research |
| Quartz `themechange` custom event fires on dark/light toggle | quartz-coding-guide.md |
| CSS mask-image with radial-gradient creates smooth edge fade for background art | Session 8 implementation |
| `window.addCleanup()` required in Quartz SPA mode to prevent listener leaks | quartz-coding-guide.md |

## Constraint reasoning

- **No research-institute in public content** — Work projects are confidential. Blog references patterns, not clients.
- **Decorative elements must be toggleable** — User: "用户可以关". Implemented via localStorage `background-art-visible` key, eye icon toggle.
- **Only memes/二创 for variants** — Color filters look like broken images at 5% opacity. Style changes are recognizable.

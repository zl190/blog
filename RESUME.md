# Y.Lab3 Blog — Resume Point

> Read the latest brief, execute from there.
> Rationale logs exist for audit — read only when a decision is questioned.

## Three-Layer Handoff Structure

briefs/session9-brief.md      ← Layer 1: READ THIS.
briefs/session9-rationale.md  ← Layer 2: On demand.
session.jsonl                 ← Layer 3: Auto-saved. Forensic only.

## Latest Session

**Session 9** — 2026-03-29 — `briefs/session9-brief.md`

## Session Index

| Session | Date | Brief | Rationale | Summary |
|---------|------|-------|-----------|---------|
| 6 | 2026-03-29 | (ctx) | (ctx) | Blog production pipeline + 16 articles QC'd/published |
| 7 | 2026-03-29 | session7-brief.md | session7-rationale.md | Landing page redesign, Topics/Tags separation, Graph fix, content flattened, design framework |
| 8 | 2026-03-29 | session8-brief.md | session8-rationale.md | Panorama blog, BackgroundArt plugin, Mona Lisa meme pool (17 variants), RunningMascot engine, turbo bar |
| 9 | 2026-03-29 | session9-brief.md | session9-rationale.md | SpecGate + EvidenceGate enforcement, last30days authorship fix, retro blog, Mona Lisa trimmed 5, seasonal mascots |

## Constraints (cumulative)

- P8: don't ask, decide and execute
- No `qc: passed` = no publish (pre-commit hook)
- Independent QC agent, not the builder
- Read blog-design.md + quartz-coding-guide.md before layout changes
- Build locally before push (cache issues with index.css)
- Never mention research-institute/research-lab in public content or commits
- DataFlow name OK in public content
- Mona Lisa pool: only memes and style 二创, no color filters. Currently 5 images.
- Decorative elements must be user-toggleable
- SpecGate: non-draft posts must have `spec:` in frontmatter (pre-commit enforced)
- EvidenceGate: QC first item = verify author relationship to subject
- SM: write one-line diagnosis before any blog edit or rewrite
- Session blog: must have thesis, not just volume

## Resume Command

read briefs/session9-brief.md then execute next steps

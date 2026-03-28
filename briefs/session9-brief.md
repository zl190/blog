# Session 9 Brief — 2026-03-29

> Execution agent reads ONLY this. No reasoning, no process.

## What was decided (Session 9)

1. Seasonal mascots added: bunny (Easter 03/20–04/20), ghost (Halloween 10/15–11/05). Corgi upgraded to 8-frame 48x48 sprite. Bunny is active now (03/29).
2. last30days post: caught false "How I Built" authorship claim. Unpublished immediately. Rewritten as PR #115 contribution story ("The 920-Point Story That Didn't Exist"). QC passed.
3. DataFlow reference in panorama: name is fine. Only research-institute/research-lab require anonymization. Anonymization reverted. Memory updated.
4. Panorama diagram: ASCII art replaced with Imagen 4 generated illustration.
5. Blog audit: all 19 posts checked for authorship errors. Only last30days had the issue.
6. Retro blog published: "I Published a Framework and Then Didn't Follow It" — full self-audit of the content framework, 1/5 gates operational, enforcement without hooks = 0%.
7. SpecGate enforcement: pre-commit hook now requires `spec:` field (thesis | author relationship | target reader). All 18 published posts backfilled.
8. EvidenceGate: added to SOP Content Publishing Pipeline as first QC checklist item. QC must verify author relationship to subject before reviewing prose.
9. Self-PUA: converted from aspirational (0% execution over 4 sessions) to physical gate with escalation mechanism.
10. SM in Anti-Greedy Guards: diagnosis-first required before any blog edit or rewrite.
11. Session policy: "每session一篇有thesis的post" — volume without quality standard produces fabrication.
12. REGISTRY.md control files created for both Mona Lisa pool and sprite pool.
13. Mona Lisa pool trimmed from 17 to 5 by user: classic, sunglasses, vr-cyberpunk, selfie, caricature.
14. Config was out of sync (had 9 of 17 images). Synced to the 5 user-curated images.
15. Anonymization rule updated: research-institute/research-lab = anonymize, DataFlow = OK.
16. Email Spina: name filled (Zisheng Liang 梁自胜). Ready to send manually.
17. Google Imagen 4 API model name: `imagen-4.0-generate-001` (not preview).

## Constraints

- User is P8 — don't ask, decide and execute
- 拿来主义 = borrow design, reject code
- Blog: no `qc: passed` = no publish (pre-commit hook enforced)
- Blog: independent QC agent reviews, not the builder
- Before any layout change: read `blog-design.md` + `quartz-coding-guide.md`
- Build and verify locally before pushing
- Never mention research-institute/research-lab in public content, commits, or PRs
- DataFlow name is OK in public content
- Mona Lisa pool: only memes and style 二创, no color filters. Currently 5 images.
- Decorative elements must be user-toggleable
- SpecGate: non-draft posts must have `spec:` in frontmatter (pre-commit enforced)
- EvidenceGate: QC first item = verify author relationship to subject
- SM: write one-line diagnosis before any blog edit or rewrite
- Session blog: must have thesis, not just volume

## What to execute next

| Priority | Task | Status |
|----------|------|--------|
| P1 | Email Spina | Name filled (Zisheng Liang 梁自胜), send manually |
| P1 | Vale linter for blog | 9 AI smell items → YAML rules. Physical enforcement of prose quality. |
| P1 | SM smoke run ($8) | Experiment design at `sm-vs-pua/.claude/CLAUDE.md`. Ready to execute. |
| P2 | TIL format (`content/til/`) | Simon Willison pattern. Low-friction posts with thesis. |
| P2 | Revise "From Framework to Published" | Add practical pipeline walkthrough (source→builder→QC→publish with cost/time) |
| P3 | Revise i-accidentally-reinvented-org-mode | REVISE items remain |

## Key files

| File | Purpose |
|------|---------|
| `~/Developer/personal/blog/` | Blog repo (Quartz v4, GitHub Pages, blog.ylab3.com) |
| `quartz/components/BackgroundArt.tsx` | Background art plugin |
| `quartz/components/RunningMascot.tsx` | Running mascot engine (3 mascots, seasonal) |
| `quartz/static/backgrounds/mona-lisa/REGISTRY.md` | Mona Lisa variant control panel (5 images) |
| `quartz/static/sprites/REGISTRY.md` | Mascot sprite control panel (3 sprites) |
| `.git/hooks/pre-commit` | SpecGate + QCGate enforcement |
| `content/framework-audit-retro.md` | Session 9 retro post |
| `content/last30days-research-engine.md` | Rewritten PR #115 story |
| `~/.claude/memory/feedback_session-blog-policy.md` | Thesis-required session policy |
| `~/.claude/memory/feedback_content-supply-chain.md` | Updated with EvidenceGate |
| `~/.claude/memory/feedback_self-pua.md` | Updated to physical gate |

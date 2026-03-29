# Session 10 Brief — 2026-03-29

> Execution agent reads ONLY this. No reasoning, no process.

## What was decided (Session 10)

1. TOC + Backlinks moved from right to left sidebar. Committed + pushed (395fa0b).
2. Vale linter: 7 AI smell rules (styles/AISmell/) + write-good baseline. write-good = warning only, AISmell.Sycophancy = error (blocks commit). ValeGate added to pre-commit hook.
3. Wikilinks added to last30days + wuxing-gnn (were orphans with no backlinks). thoughts-on-ai-agent-ecosystem is draft, skipped.
4. SM P0 smoke run passed: 15/15, $1.63 total. Harness validated. All 5 conditions solved all 3 tasks.
5. SM P1 on hold. User wants to validate experiment design first. 4-layer decomposition proposed (Design → Measurement → Pilot → Execution).
6. 5 blog arcs defined in blog-design.md § 5: Theory, Framework, Practice, Research, Story. Arcs = author-side editorial roadmap (not reader UI). Topics = reader navigation. Different axes, do not merge.
7. Blog visual style guide created: blog-visual.md. Imagen 4 style block, scene vs schema rule, prompt templates by arc, sizing specs, visual QC criteria.
8. blog.md renamed to blog-content.md. Three-file convention: blog-content.md / blog-design.md / blog-visual.md.
9. Early work timeline traced (Feb 7 - Mar 18): wuxing-demo, greedy coding, Dobby, warming dashboard (9 hypotheses → 3 killed), credence→mixed good pivot, mixed-good paper (UCLA Anderson 4/30), agent economy paper. Written to memory/project_early-work-timeline.md.
10. Interaction modes framework: Task / Brainstorm / Expert / Push. Signal detection + context strategy + distill mechanism. Written to knowledge/interaction-modes.md.
11. Mode router identified as potential product opportunity (API stateless = needs external state). Written to project_mode-router-opportunity.md.
12. Blog and Platform: stay independent (Simon Willison model). Connect via RSS feed, never merge codebases.
13. panorama-diagram-2.png discarded (truncated file).

## Constraints

- P8 — don't ask, decide and execute
- No qc:passed = no publish (pre-commit hook enforced)
- No spec: = no publish (pre-commit hook enforced)
- ValeGate: AISmell errors block commit, warnings informational
- Independent QC agent reviews, not the builder
- QC first item: verify author relationship to subject (EvidenceGate)
- Read blog-design.md + blog-visual.md + quartz-coding-guide.md before layout/visual changes
- Build locally and verify before pushing
- Never mention research-institute/research-lab in public content, commits, or PRs. DataFlow OK.
- Mona Lisa pool: only memes and style二创, no color filters. Currently 5 images.
- Decorative elements must be user-toggleable
- SM: write one-line diagnosis before any blog edit/rewrite
- Session blog must have thesis — volume without quality standard = fabrication
- Topics ≠ Arcs — Topics = reader navigation (frontmatter), Arcs = author editorial roadmap (blog-design.md). Do not merge.
- Blog three-file convention: blog-content.md / blog-design.md / blog-visual.md

## What to execute next

| Priority | Task | Status |
|----------|------|--------|
| P1 | Email Spina | Name filled (Zisheng Liang 梁自胜), send manually |
| P1 | SM experiment: user validates Layer 1 (task design) | User action — review 3 P0 tasks + ground truth at sm-vs-pua/tasks/ |
| P1 | Mode router: implement T1 (CLAUDE.md routing rules) | Interaction modes framework ready, needs integration into CLAUDE.md |
| P2 | TIL format (content/til/) | Simon Willison pattern. Low-friction posts with thesis. |
| P2 | Warming dashboard blog post | Arc 2. Thesis: "研究不是证明你的想法，是杀死不配活的想法" |
| P2 | Domain Pack: build blog-website pack | Architecture designed, consolidate existing files into ~/.claude/packs/blog-website/ |
| P2 | Mobile: install Blink on phone for SSH to remote-server | Phase 0 (Obsidian Mobile + GitHub Mobile) usable now. Phase 1 = Blink + mosh. |
| P2 | Revise "From Framework to Published" | Add practical pipeline walkthrough |
| P2 | Mode router: research existing solutions | Is stateful LLM mode routing a product? Check Cursor/Windsurf/agent frameworks |
| P3 | Greedy coding → anti-greedy blog post | Arc 2. Thesis: AI debugging 的贪心陷阱 |
| P3 | Revise i-accidentally-reinvented-org-mode | REVISE items remain |
| P3 | Topics 404 on production | User reported 404 on phone. Works on localhost. Investigate on blog.ylab3.com. |

## Key files

| File | Purpose |
|------|---------|
| `~/Developer/personal/blog/` | Blog repo (Quartz v4, GitHub Pages, blog.ylab3.com) |
| `~/.claude/memory/knowledge/output-styles/blog-content.md` | Content style guide (renamed from blog.md) |
| `~/.claude/memory/knowledge/output-styles/blog-design.md` | Design style guide + Arcs (§ 5) |
| `~/.claude/memory/knowledge/output-styles/blog-visual.md` | Visual style guide (Imagen 4, prompts, QC) |
| `~/.claude/memory/knowledge/interaction-modes.md` | 4-mode framework (Task/Brainstorm/Expert/Push) |
| `~/.claude/memory/project_mode-router-opportunity.md` | Mode router product opportunity + research needed |
| `~/.claude/memory/project_early-work-timeline.md` | Feb 7 - Mar 18 early work backlog |
| `~/Developer/personal/sm-vs-pua/` | SM vs PUA experiment repo (P0 passed, P1 on hold) |
| `.git/hooks/pre-commit` | SpecGate + QCGate + ValeGate |
| `.vale.ini` + `styles/AISmell/` | Vale config + 7 AI smell rules |

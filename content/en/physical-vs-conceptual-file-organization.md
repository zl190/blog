---
title: "Physical vs Conceptual File Organization"
type: draft
format: blog
status: published
published_url: https://zl190.github.io/blog/posts/physical-vs-conceptual-file-organization/
published_date: 2026-01-27
created: 2026-01-17
tags: [pkm, zettelkasten, file-organization]
---

# Physical ≠ Conceptual: A Mental Model for File Chaos

## Hook

Your files are scattered across iCloud, Git repos, Zotero, Downloads. You've tried to unify them. You've failed. Here's why that's okay — and what to do instead.

## The Problem

As a knowledge worker, I have:
- PDFs and books (need cloud sync, read anywhere)
- Code repos (need Git, can't use iCloud)
- Academic papers (Zotero manages metadata)
- Notes and knowledge (Obsidian vault)
- Course materials, work docs, personal projects...

**The instinct:** Put everything in one place.
**The reality:** Technically impossible. Git + iCloud = corruption. Zotero needs its database. Different tools, different needs.

**The anxiety:** If files are scattered, how do I find anything? And if I use my Zettelkasten to link to files... am I polluting my knowledge base?

## The Failed Attempts

1. **One mega-folder:** Tried putting everything in `~/Documents`. Git repos corrupted. Zotero confused.

2. **Abandon ZK purity:** Used Obsidian as a "life dashboard" linking to everything. Felt wrong. Cards linking to PDFs isn't knowledge connection.

3. **Separate everything:** Different app for each thing. Context switching killed productivity.

## The Insight

**Physical organization ≠ Conceptual organization**

```
CONCEPTUAL (unified)          PHYSICAL (scattered)
────────────────────          ────────────────────
     Obsidian                 ~/Documents/Life/
        │                     ~/Developer/
        │ links to            ~/Zotero/
        ▼                     ~/Downloads/
   MOCs & Cards          →    (files wherever they need to be)
```

Stop fighting the scatter. **Accept physical fragmentation. Achieve conceptual unity.**

The file system is just storage backend. Your PKM tool is the unified interface.

## The Resolution: ZK Core + Practical Scaffolding

The key insight: My Zettelkasten vault already had non-ZK elements:
- `00-dashboard.md` — Dataview queries
- `0-inbox/` — Capture inbox
- `3-drafts/` — Output production

**Only `1-cards/` is pure Zettelkasten.** Everything else is scaffolding.

| Layer | Purpose | Pure ZK? |
|-------|---------|----------|
| `1-cards/` | Atomic knowledge | **Yes** |
| `2-moc/` | Navigation | Scaffolding |
| `_references/` | External file access | Scaffolding |
| Dashboard, inbox, drafts | Workflow | Scaffolding |

**The rule:** Cards link to cards only. MOCs can link anywhere — they're maps, not territory.

This preserves ZK where it matters (idea-to-idea connections) while being practical where it helps (file navigation).

## The Implementation

### Physical Layer (Accept Fragmentation)

```
~/Documents/                    # iCloud synced
├── Obsidian/Note/             # Knowledge
└── Life/
    ├── Resources/             # PDFs, books, courses
    ├── Writing/               # Non-code outputs
    └── Archive/               # Completed

~/Developer/                    # Local, Git-managed
├── personal/
├── work/
└── courses/

~/Zotero/                       # App-managed papers

~/Downloads/                    # Transient inbox ONLY
```

### Conceptual Layer (Unified in Obsidian)

Each project gets an MOC — the "one door" to scattered files:

```markdown
# moc-project-x

## Knowledge (cards)
- [[concept-a]]
- [[concept-b]]

## Resources
- [Design Doc](_references/Projects/x/design.pdf)
- [Zotero Collection](zotero://select/...)

## Code
- Local: `~/Developer/project-x/`
- GitHub: https://github.com/...
```

### The Symlink Bridge

```bash
Note/_references → ~/Documents/Life/Resources/
```

One symlink. If `Resources/` moves, update one pointer. All MOC links stay valid.

## The Habits

What changes:
1. **Adding files:** Put in right physical location + update relevant MOC
2. **Finding files:** Go through MOC, not Finder browsing
3. **Downloads:** Treat as inbox — process weekly, never permanent

The overhead is real but small. And with AI assistants, MOC maintenance becomes trivial.

## Why Not DEVONthink?

DEVONthink solves the same problem differently — proprietary database, AI classification, smart groups.

| | This Approach | DEVONthink |
|--|---------------|------------|
| Lock-in | None (plain files) | Proprietary DB |
| Portability | High | Lower |
| Cost | Free | $99-199 |
| Philosophy | Unix (composable) | Monolith |

DEVONthink is powerful. But I prefer owning my files and knowledge in plain formats.

## Key Takeaways

1. **Physical ≠ Conceptual** — stop trying to unify files physically
2. **Accept fragmentation** — it's technically necessary
3. **Unify conceptually** — MOCs are the "one door"
4. **Keep ZK pure** — cards link to cards; everything else is scaffolding
5. **Symlinks bridge locations** — one update if paths change

---

## Meta

- Source: Conversation designing my own file system
- Related: [[2026-01-17-file-organization-plan]]
- Potential outlets: Personal blog, dev.to, Medium

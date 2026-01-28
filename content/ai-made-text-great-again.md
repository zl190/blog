---
title: "AI Made Text Great Again"
type: blog
status: published
published_url: https://zl190.github.io/blog/posts/ai-made-text-great-again/
published_date: 2026-01-27
created: 2026-01-13
tags:
  - unix-philosophy
  - ai-workflow
  - latex
  - obsidian
---

# Blog Outline: Text Renaissance

## Working Title
"AI Made Text Great Again: The Text-Based Workflow Renaissance"

---

## 1. Why Text?

### The Unix Philosophy
- Everything is a file, text is the universal interface
- Composability: small tools that do one thing well
- Version control: `git diff` your documents, not binary blobs

> [!note]- Personal backstory
> I found a linux book in my freshman year from library. Since then I became a fan of Unix philosophy — everything is a file, text is the universal interface. Simple and beautiful.
>
> However, the learning curve is steep. There are so many tools to learn and so many flags to remember before you become as efficient as you were with GUI. I never really stuck to text-based workflow for long.
>
> Switching feels like learning writing with your non-dominant hand — you know what you want, but you become slow and clumsy. Until recently, with the help of AI assistants, I finally found a way to make text-based workflow enjoyable and productive.

### The AI Renaissance
- LLMs are text-native: they read text, generate text, transform text
- Cloud tools (Overleaf, Google Docs) lock you out of this
- Local text files + AI = the workflow Unix designers dreamed of

> [!note]- The deeper insight
> LLMs fit perfectly with Unix philosophy — they're text-native. Without the need of rigid rule-based systems, they read text, generate text, transform text. AI understands content and handles format conversions (txt, md, latex) naturally.
>
> Cloud-based writing services provide convenience, but they wall you off from your local environment, limiting flexibility to combine AI with the Linux ecosystem's decades of battle-tested tools.
>
> Claude Code is the application layer upon Linux, just like TLS upon TCP. With local text files and custom agent skills, the learning curve finally flattens. The dream workflow that Unix philosophy envisioned is now within reach.

---

## 2. Trigger: Overleaf → Local LaTeX

### The Move
- Used Overleaf for years - convenient but limiting
- No LLM integration (can't use Claude Code or Copilot)
- Collaboration limits on free tier

### The Setup (Simpler Than Expected)
- `sudo apt install texlive-full` - one command
- VS Code + LaTeX Workshop + LTeX+
- SyncTeX: click PDF → jump to source

### What Changed
- Claude Code can now edit my `.tex` files directly
- Git history of my resume changes
- Local fonts, local control

### Practical Example: Awesome CV
- Professional resume/CV template
- XeLaTeX for custom fonts
- Modular structure: education.tex, experience.tex, skills.tex

---

## 3. Extending to Slides: Markdown Wins Here

### The Research
- Compared 5 tools: Marp, Pandoc Beamer, python-pptx, reveal.js, Slidev
- Key finding: Marp & python-pptx best for LLM integration (24/25)

### When to Use What
| Tool | Best For |
|------|----------|
| Marp | Quick slides, multi-format output (PDF/PPTX/HTML) |
| Pandoc Beamer | Academic, math-heavy content |
| python-pptx | Fine-grained PPTX control |

### The Connection
- Same philosophy: text source → rendered output
- Same benefits: git, AI editing, automation
- Markdown is simpler than LaTeX, good for ephemeral content

---

## 4. The Bigger Picture: A Text-Based Knowledge System

### Note-Taking: Obsidian
- Markdown files in a folder (you own them)
- Links between notes, graph view
- Plugins: LaTeX math, templates, daily notes
- Sync via git or Obsidian Sync

### Flashcards: Anki + LaTeX
- Spaced repetition for learning
- LaTeX support for math formulas
- Can generate cards from markdown notes

### The Full Loop
```
Reading/Learning
    ↓
Obsidian (notes in markdown)
    ↓
Anki (flashcards, LaTeX math)
    ↓
Writing (LaTeX for formal, Markdown for slides/docs)
    ↓
All versioned in git, all editable by AI
```

---

## 5. How AI Lowers the Barrier

### The Old Problem
- Gilles Castel's workflow required mastering:
  - Vim motions and modes
  - UltiSnips for snippets
  - LaTeX syntax and packages
  - All simultaneously, steep curve

### The New Reality
- No need to choose from a ton of tools or spend a weekend learning them
- Objects you operate on become intuitive: shape, color, table, equation
- AI handles the syntax, you focus on content

- Ask Claude: "Write a LaTeX table with these columns"
- Ask Claude: "Why won't this equation compile?"
- Ask Claude: "Convert this markdown to Beamer slides"
- Learn incrementally, AI fills the gaps

### Not Replacing Learning, Enabling It
- Still need to understand what you're doing
- But the "stuck" moments are shorter
- Can focus on concepts, not syntax lookup

---

## 6. Getting Started: Practical Steps

### Minimal Setup
1. Install TeX Live: `sudo apt install texlive-full`
2. Install VS Code + LaTeX Workshop
3. Install Marp CLI: `npm install -g @marp-team/marp-cli`
4. Pick one project: a resume, a presentation, notes

### Don't Boil the Ocean
- Start with one piece
- Add tools as you need them
- Obsidian can wait, Anki can wait
- The point is text files - the tools are secondary

---

## 7. Conclusion: AI Made Text Great Again

- The Unix philosophy: text is the universal interface
- Cloud-based AI services are convenient but create walls
- AI assistants need text to work with you
- The dream that seemed distant is now within reach
- Started with one move: Overleaf → local. The exploration continues.

---

## Appendix: Resources

- [Gilles Castel's Blog](https://castel.dev/) - The legendary LaTeX + Vim workflow
- [Awesome CV](https://github.com/posquit0/Awesome-CV) - LaTeX CV template
- [Marp](https://marp.app/) - Markdown to slides
- [Obsidian](https://obsidian.md/) - Markdown-based note-taking
- [Anki](https://apps.ankiweb.net/) - Spaced repetition flashcards

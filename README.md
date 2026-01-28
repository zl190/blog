# ZL's Notes

Personal blog on AI, development, and technology.

**Live at:** https://zl190.github.io/blog/

## Stack

- [Quartz 4](https://quartz.jzhao.xyz/) — Static site generator with backlinks and graph view
- GitHub Pages — Hosting via GitHub Actions

## Local Development

```bash
npm install
npx quartz build --serve
# Open http://localhost:8080
```

## Adding a New Post

1. Create markdown file in `content/` with frontmatter:
   ```yaml
   ---
   title: "Your Post Title"
   created: 2026-01-28
   tags: [topic1, topic2]
   ---
   ```

2. Commit and push:
   ```bash
   git add -A && git commit -m "Add: post title" && git push
   ```

3. GitHub Actions deploys automatically.

## Features

- **Explorer** — Posts sorted by date (newest first)
- **Graph View** — Visualize connections between notes
- **Backlinks** — See what links to the current page
- **LaTeX** — Math rendering via KaTeX
- **Collapsible sections** — Use `> [!note]- Title` for collapsed content
- **Dark mode** — Toggle in header

## License

Content: All rights reserved
Code: MIT (Quartz framework)

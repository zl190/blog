import { FullSlug, resolveRelative } from "../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

interface Options {
  limit: number
  minCount: number
}

const defaultOptions: Options = {
  limit: 15,
  minCount: 2,
}

export default ((userOpts?: Partial<Options>) => {
  const opts = { ...defaultOptions, ...userOpts }

  const TagCloud: QuartzComponent = ({
    fileData,
    allFiles,
    displayClass,
  }: QuartzComponentProps) => {
    const tagCounts: Record<string, number> = {}
    for (const file of allFiles) {
      const tags = file.frontmatter?.tags
      if (tags) {
        for (const tag of tags) {
          const normalized = tag.toLowerCase()
          tagCounts[normalized] = (tagCounts[normalized] || 0) + 1
        }
      }
    }

    const entries = Object.entries(tagCounts)
      .filter(([, count]) => count >= opts.minCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, opts.limit)

    if (entries.length === 0) return null

    const max = entries[0][1]

    function sizeClass(count: number): string {
      const ratio = count / max
      if (ratio > 0.7) return "tag-cloud-xl"
      if (ratio > 0.4) return "tag-cloud-lg"
      if (ratio > 0.2) return "tag-cloud-md"
      return "tag-cloud-sm"
    }

    return (
      <div class={classNames(displayClass, "tag-cloud")}>
        <h3>Tags</h3>
        <div class="tag-cloud-list">
          {entries.map(([tag, count]) => {
            const linkDest = resolveRelative(fileData.slug!, `tags/${tag}` as FullSlug)
            return (
              <a href={linkDest} class={`internal tag-cloud-link ${sizeClass(count)}`}>
                {tag}
                <span class="tag-count">{count}</span>
              </a>
            )
          })}
        </div>
      </div>
    )
  }

  TagCloud.css = `
.tag-cloud {
  margin-top: 0.5rem;
}

.tag-cloud h3 {
  font-size: 1rem;
  margin: 0 0 0.5rem 0;
}

.tag-cloud-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 0.6rem;
  line-height: 1.6;
}

.tag-cloud-link {
  white-space: nowrap;
}

.tag-count {
  font-size: 0.75em;
  opacity: 0.5;
  margin-left: 0.15em;
}

.tag-cloud-xl {
  font-size: 1.1em;
  font-weight: 700;
}

.tag-cloud-lg {
  font-size: 0.95em;
  font-weight: 600;
}

.tag-cloud-md {
  font-size: 0.85em;
}

.tag-cloud-sm {
  font-size: 0.8em;
  opacity: 0.7;
}
`

  return TagCloud
}) satisfies QuartzComponentConstructor

import { FullSlug, resolveRelative } from "../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

const TOPIC_ORDER = ["AI", "Systems", "Learning"]

const TopicNav: QuartzComponent = ({ fileData, allFiles, displayClass }: QuartzComponentProps) => {
  const topicCounts: Record<string, number> = {}

  for (const file of allFiles) {
    const topics = file.frontmatter?.topics
    if (topics && Array.isArray(topics)) {
      for (const topic of topics) {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1
      }
    }
  }

  const entries = TOPIC_ORDER.filter((t) => topicCounts[t] !== undefined).map((t) => [
    t,
    topicCounts[t],
  ] as [string, number])

  if (entries.length === 0) return null

  return (
    <div class={classNames(displayClass, "topic-nav")}>
      <h3>Topics</h3>
      <ul class="topic-nav-list">
        {entries.map(([topic, count]) => {
          const linkDest = resolveRelative(fileData.slug!, `tags/${topic.toLowerCase()}` as FullSlug)
          return (
            <li>
              <a href={linkDest} class="internal topic-nav-link">
                {topic} <span class="topic-count">{count}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

TopicNav.css = `
.topic-nav {
  margin-top: 0.5rem;
}

.topic-nav h3 {
  font-size: 1rem;
  margin: 0 0 0.5rem 0;
}

.topic-nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.topic-nav-link {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.topic-nav-link:hover {
  background: var(--highlight);
}

.topic-count {
  font-size: 0.75em;
  opacity: 0.5;
  margin-left: 0.5em;
}
`

export default (() => TopicNav) satisfies QuartzComponentConstructor

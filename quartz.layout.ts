import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [
    Component.BackgroundArt({
      themes: [
        { name: "Mona Lisa", dir: "mona-lisa", images: [
          "classic-hd.jpg", "sunglasses.jpg", "vr-cyberpunk.jpg",
          "selfie.jpg", "caricature-donkeyhotey.jpg",
        ] },
      ],
    }),
    Component.RunningMascot(),
  ],
  afterBody: [
    Component.ConditionalRender({
      component: Component.RecentNotes({
        title: "Articles",
        limit: 50,
        showTags: true,
        filter: (f) => f.slug !== "index",
        sort: (f1, f2) => {
          const p1 = f1.frontmatter?.pinned ? 1 : 0
          const p2 = f2.frontmatter?.pinned ? 1 : 0
          if (p1 !== p2) return p2 - p1
          const d1 = f1.dates?.created ?? f1.dates?.modified
          const d2 = f2.dates?.created ?? f2.dates?.modified
          if (d1 && d2) return new Date(d2).getTime() - new Date(d1).getTime()
          return (d2 ? 1 : 0) - (d1 ? 1 : 0)
        },
      }),
      condition: (page) => page.fileData.slug === "index",
    }),
  ],
  footer: Component.Footer(),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
        { Component: Component.ReaderMode() },
      ],
    }),
    Component.TopicNav(),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
    Component.SocialLinks({
      links: {
        GitHub: "https://github.com/zl190",
        "Buy Me a Coffee": "https://buymeacoffee.com/ylab3",
      },
    }),
  ],
  right: [
    Component.ConditionalRender({
      component: Component.Graph({
        localGraph: { depth: -1, showTags: false, enableRadial: true },
        globalGraph: { showTags: false },
      }),
      condition: (page) => page.fileData.slug === "index",
    }),
    Component.ConditionalRender({
      component: Component.Graph({
        localGraph: { showTags: false },
        globalGraph: { showTags: false },
      }),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.TagCloud(),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    Component.TopicNav(),
  ],
  right: [Component.TagCloud()],
}

import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/backgroundArt.scss"
// @ts-ignore
import script from "./scripts/backgroundArt.inline"

interface Theme {
  name: string
  dir: string
  images: string[]
}

interface Options {
  imageRoot: string
  themes: Theme[]
  rotation: "nav" | "fixed"
  darkOpacity: number
  lightOpacity: number
}

const defaultOptions: Options = {
  imageRoot: "/static/backgrounds",
  themes: [{ name: "Mona Lisa", dir: "mona-lisa", images: ["classic-hd.jpg"] }],
  rotation: "nav",
  darkOpacity: 0.06,
  lightOpacity: 0.03,
}

export default ((userOpts?: Partial<Options>) => {
  const opts = { ...defaultOptions, ...userOpts }

  const BackgroundArt: QuartzComponent = (_props: QuartzComponentProps) => {
    return (
      <div class="background-art-container">
        <div
          class="background-art"
          aria-hidden="true"
          data-cfg={JSON.stringify({
            imageRoot: opts.imageRoot,
            themes: opts.themes,
            rotation: opts.rotation,
            darkOpacity: opts.darkOpacity,
            lightOpacity: opts.lightOpacity,
          })}
        />
        <button
          class="background-art-toggle"
          aria-label="Toggle background art"
          title="Toggle background art"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      </div>
    )
  }

  BackgroundArt.css = style
  BackgroundArt.afterDOMLoaded = script
  return BackgroundArt
}) satisfies QuartzComponentConstructor

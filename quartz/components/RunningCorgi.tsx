import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/runningCorgi.scss"
// @ts-ignore
import script from "./scripts/runningCorgi.inline"

interface Options {
  emoji: string
  speed: number
  size: number
  spriteSheet: string | null
  spriteFrames: number
  spriteFrameWidth: number
  spriteFrameHeight: number
}

const defaultOptions: Options = {
  emoji: "🐕",
  speed: 6,
  size: 28,
  spriteSheet: "/static/sprites/corgi-run.png",
  spriteFrames: 6,
  spriteFrameWidth: 64,
  spriteFrameHeight: 48,
}

export default ((userOpts?: Partial<Options>) => {
  const opts = { ...defaultOptions, ...userOpts }

  const RunningCorgi: QuartzComponent = (_props: QuartzComponentProps) => {
    return (
      <div
        class="running-corgi-banner"
        aria-hidden="true"
        data-cfg={JSON.stringify(opts)}
      >
        <span class="running-corgi" />
      </div>
    )
  }

  RunningCorgi.css = style
  RunningCorgi.afterDOMLoaded = script
  return RunningCorgi
}) satisfies QuartzComponentConstructor

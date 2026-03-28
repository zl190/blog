import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/runningMascot.scss"
// @ts-ignore
import script from "./scripts/runningMascot.inline"

interface Mascot {
  name: string
  sprite: string
  frames: number
  width: number
  height: number
}

interface SeasonalRule {
  from: string // "MM/DD"
  to: string   // "MM/DD"
  mascot: string
}

interface Options {
  mascots: Mascot[]
  seasonal: SeasonalRule[]
  defaultMascot: string
  speed: number
  emojiFallback: string
}

const defaultOptions: Options = {
  mascots: [
    { name: "corgi", sprite: "/static/sprites/corgi-run.png", frames: 8, width: 48, height: 48 },
    { name: "bunny", sprite: "/static/sprites/bunny-hop.png", frames: 8, width: 48, height: 48 },
    { name: "ghost", sprite: "/static/sprites/ghost-float.png", frames: 8, width: 48, height: 48 },
  ],
  seasonal: [
    { from: "03/20", to: "04/20", mascot: "bunny" },    // Easter
    { from: "10/15", to: "11/05", mascot: "ghost" },     // Halloween
  ],
  defaultMascot: "corgi",
  speed: 6,
  emojiFallback: "🐕",
}

export default ((userOpts?: Partial<Options>) => {
  const opts = { ...defaultOptions, ...userOpts }

  const RunningMascot: QuartzComponent = (_props: QuartzComponentProps) => {
    return (
      <div
        class="running-mascot-banner"
        aria-hidden="true"
        data-cfg={JSON.stringify(opts)}
      >
        <span class="running-mascot" />
        <button class="turbo-bar" title="Turbo!">
          <span class="turbo-label">TURBO</span>
          <span class="turbo-track">
            <span class="turbo-fill" />
          </span>
        </button>
      </div>
    )
  }

  RunningMascot.css = style
  RunningMascot.afterDOMLoaded = script
  return RunningMascot
}) satisfies QuartzComponentConstructor

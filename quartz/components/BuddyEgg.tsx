import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/buddyEgg.scss"
// @ts-ignore
import script from "./scripts/buddyEgg.inline"

interface Options {
  /** Number of clicks needed to hatch */
  clicksToHatch: number
}

const defaultOptions: Options = {
  clicksToHatch: 5,
}

export default ((userOpts?: Partial<Options>) => {
  const opts = { ...defaultOptions, ...userOpts }

  const BuddyEgg: QuartzComponent = (_props: QuartzComponentProps) => {
    return (
      <div
        class="buddy-egg-root"
        aria-hidden="true"
        data-clicks-to-hatch={opts.clicksToHatch}
      >
        {/* Egg stage */}
        <button class="buddy-egg" title="Something is in here..." aria-label="Mystery egg">
          <span class="buddy-egg-icon">🥚</span>
          <span class="buddy-egg-cracks" aria-hidden="true" />
        </button>

        {/* Hatched pet stage */}
        <div class="buddy-pet" aria-label="Buddy">
          <span class="buddy-pet-body">🐣</span>
          <span class="buddy-pet-zzz">z</span>
        </div>
      </div>
    )
  }

  BuddyEgg.css = style
  BuddyEgg.afterDOMLoaded = script
  return BuddyEgg
}) satisfies QuartzComponentConstructor

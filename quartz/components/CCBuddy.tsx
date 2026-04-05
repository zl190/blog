import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/ccBuddy.scss"
// @ts-ignore
import script from "./scripts/ccBuddy.inline"

export default (() => {
  const CCBuddy: QuartzComponent = (_props: QuartzComponentProps) => {
    return (
      <div class="cc-buddy-root" aria-hidden="true">
        <div class="cc-buddy-bubble" />
        <pre class="cc-buddy-sprite" />
        <span class="cc-buddy-name" />
      </div>
    )
  }

  CCBuddy.css = style
  CCBuddy.afterDOMLoaded = script
  return CCBuddy
}) satisfies QuartzComponentConstructor

interface Mascot {
  name: string
  sprite: string
  frames: number
  width: number
  height: number
}

interface SeasonalRule {
  from: string
  to: string
  mascot: string
}

interface RunningMascotConfig {
  mascots: Mascot[]
  seasonal: SeasonalRule[]
  defaultMascot: string
  speed: number
  emojiFallback: string
}

function matchSeason(rules: SeasonalRule[]): string | null {
  const now = new Date()
  const m = now.getMonth() + 1
  const d = now.getDate()
  const today = m * 100 + d // e.g. 325 for Mar 25

  for (const rule of rules) {
    const [fm, fd] = rule.from.split("/").map(Number)
    const [tm, td] = rule.to.split("/").map(Number)
    const from = fm * 100 + fd
    const to = tm * 100 + td

    if (from <= to) {
      if (today >= from && today <= to) return rule.mascot
    } else {
      // Wraps around year (e.g. 12/15 to 01/10)
      if (today >= from || today <= to) return rule.mascot
    }
  }
  return null
}

document.addEventListener("nav", () => {
  const banner = document.querySelector(".running-mascot-banner") as HTMLElement | null
  const mascotEl = document.querySelector(".running-mascot") as HTMLElement | null
  const turbo = document.querySelector(".turbo-bar") as HTMLElement | null
  const turboFill = document.querySelector(".turbo-fill") as HTMLElement | null
  if (!banner || !mascotEl) return

  const raw = banner.dataset.cfg
  if (!raw) return

  const cfg: RunningMascotConfig = JSON.parse(raw)

  if (localStorage.getItem("background-art-visible") === "false") {
    banner.classList.add("art-hidden")
    return
  }
  banner.classList.remove("art-hidden")

  // Resolve which mascot to use
  const seasonalName = matchSeason(cfg.seasonal)
  const activeName = seasonalName || cfg.defaultMascot
  const activeMascot = cfg.mascots.find((m) => m.name === activeName)

  const isMobile = window.innerWidth <= 800
  const useSprite = !!activeMascot

  if (useSprite && activeMascot) {
    const scale = isMobile ? 0.75 : 1
    const fw = Math.round(activeMascot.width * scale)
    const fh = Math.round(activeMascot.height * scale)
    const totalW = fw * activeMascot.frames

    mascotEl.classList.add("sprite-mode")
    mascotEl.textContent = ""
    mascotEl.style.width = `${fw}px`
    mascotEl.style.height = `${fh}px`
    mascotEl.style.backgroundImage = `url('${activeMascot.sprite}')`
    mascotEl.style.backgroundSize = `${totalW}px ${fh}px`

    const keyId = `mascot-keyframes-${activeName}`
    if (!document.getElementById(keyId)) {
      const s = document.createElement("style")
      s.id = keyId
      s.textContent = `
        @keyframes mascot-sprint-${activeName} {
          from { background-position: 0 0; }
          to { background-position: -${totalW}px 0; }
        }
      `
      document.head.appendChild(s)
    }
    mascotEl.style.animation = `mascot-sprint-${activeName} 0.8s steps(${activeMascot.frames}) infinite`
  } else {
    // Emoji fallback
    mascotEl.classList.remove("sprite-mode")
    const size = isMobile ? 21 : 28
    mascotEl.textContent = cfg.emojiFallback
    mascotEl.style.fontSize = `${size}px`
  }

  // Speed states
  const WALK_SPEED = cfg.speed * 2
  const TURBO_SPEED = cfg.speed * 0.6
  const WALK_RATE = "0.8s"
  const TURBO_RATE = "0.25s"
  let turboMode = false
  let currentSpeed = WALK_SPEED

  if (turbo) {
    const handleTurbo = () => {
      turboMode = !turboMode
      currentSpeed = turboMode ? TURBO_SPEED : WALK_SPEED
      if (turboFill) turboFill.style.width = turboMode ? "100%" : "0%"
      turbo.classList.toggle("turbo-active", turboMode)

      if (useSprite && activeMascot) {
        const rate = turboMode ? TURBO_RATE : WALK_RATE
        mascotEl!.style.animation = `mascot-sprint-${activeName} ${rate} steps(${activeMascot.frames}) infinite`
      }
    }
    turbo.addEventListener("click", handleTurbo)
    window.addCleanup(() => turbo.removeEventListener("click", handleTurbo))
  }

  // Horizontal movement
  let animFrame: number | null = null
  let startTime: number | null = null
  let goingRight = true
  const totalDist = window.innerWidth + 80

  function tick(timestamp: number) {
    if (startTime === null) startTime = timestamp
    const elapsed = (timestamp - startTime) / 1000

    if (elapsed >= currentSpeed) {
      goingRight = !goingRight
      startTime = timestamp
      animFrame = requestAnimationFrame(tick)
      return
    }

    const progress = elapsed / currentSpeed
    let x: number
    if (goingRight) {
      x = -40 + progress * totalDist
      mascotEl!.style.transform = "translateY(-50%)"
    } else {
      x = totalDist - 40 - progress * totalDist
      mascotEl!.style.transform = "translateY(-50%) scaleX(-1)"
    }
    mascotEl!.style.left = `${x}px`

    if (!useSprite) {
      const freq = turboMode ? 8 : 3
      const bounceY = Math.sin(elapsed * freq * 2 * Math.PI) * 4
      const flip = goingRight ? "" : " scaleX(-1)"
      mascotEl!.style.transform = `translateY(calc(-50% + ${bounceY}px))${flip}`
    }

    animFrame = requestAnimationFrame(tick)
  }

  mascotEl.style.display = "inline-block"
  mascotEl.style.left = "-40px"
  startTime = null
  goingRight = true
  animFrame = requestAnimationFrame(tick)

  window.addCleanup(() => {
    if (animFrame !== null) {
      cancelAnimationFrame(animFrame)
      animFrame = null
    }
  })
})

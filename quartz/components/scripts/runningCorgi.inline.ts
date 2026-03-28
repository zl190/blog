interface RunningCorgiConfig {
  emoji: string
  speed: number
  size: number
  spriteSheet: string | null
  spriteFrames: number
  spriteFrameWidth: number
  spriteFrameHeight: number
}

document.addEventListener("nav", () => {
  const banner = document.querySelector(".running-corgi-banner") as HTMLElement | null
  const corgi = document.querySelector(".running-corgi") as HTMLElement | null
  const turbo = document.querySelector(".turbo-bar") as HTMLElement | null
  const turboFill = document.querySelector(".turbo-fill") as HTMLElement | null
  if (!banner || !corgi) return

  const raw = banner.dataset.cfg
  if (!raw) return

  const cfg: RunningCorgiConfig = JSON.parse(raw)

  if (localStorage.getItem("background-art-visible") === "false") {
    banner.classList.add("art-hidden")
    return
  }
  banner.classList.remove("art-hidden")

  const isMobile = window.innerWidth <= 800
  const useSprite = !!cfg.spriteSheet

  // Speed states: walk (default) vs turbo
  const WALK_SPEED = cfg.speed * 2      // slow: 2x the configured speed
  const TURBO_SPEED = cfg.speed * 0.6   // fast: 60% of configured
  const WALK_FRAME_RATE = "0.8s"        // slow leg animation
  const TURBO_FRAME_RATE = "0.25s"      // fast leg animation
  let turboMode = false
  let currentSpeed = WALK_SPEED

  if (useSprite) {
    const scale = isMobile ? 0.75 : 1
    const fw = Math.round(cfg.spriteFrameWidth * scale)
    const fh = Math.round(cfg.spriteFrameHeight * scale)
    const totalW = fw * cfg.spriteFrames

    corgi.classList.add("sprite-mode")
    corgi.textContent = ""
    corgi.style.width = `${fw}px`
    corgi.style.height = `${fh}px`
    corgi.style.backgroundImage = `url('${cfg.spriteSheet}')`
    corgi.style.backgroundSize = `${totalW}px ${fh}px`

    if (!document.getElementById("corgi-keyframes")) {
      const s = document.createElement("style")
      s.id = "corgi-keyframes"
      s.textContent = `
        @keyframes corgi-sprint {
          from { background-position: 0 0; }
          to { background-position: -${totalW}px 0; }
        }
      `
      document.head.appendChild(s)
    }
    // Start with walk speed
    corgi.style.animation = `corgi-sprint ${WALK_FRAME_RATE} steps(${cfg.spriteFrames}) infinite`
  } else {
    corgi.classList.remove("sprite-mode")
    const now = new Date()
    const m = now.getMonth()
    const d = now.getDate()
    let emoji = cfg.emoji
    if ((m === 2 && d >= 20) || (m === 3 && d <= 20)) emoji = "🐰"
    else if (m === 9 && d >= 20) emoji = "👻"
    else if (m === 11 && d >= 15) emoji = "🦌"
    else if ((m === 0 && d >= 20) || (m === 1 && d <= 10)) emoji = "🐉"
    const size = isMobile ? Math.round(cfg.size * 0.75) : cfg.size
    corgi.textContent = emoji
    corgi.style.fontSize = `${size}px`
  }

  // Turbo bar toggle
  if (turbo) {
    const handleTurbo = () => {
      turboMode = !turboMode
      currentSpeed = turboMode ? TURBO_SPEED : WALK_SPEED

      if (turboFill) {
        turboFill.style.width = turboMode ? "100%" : "0%"
      }
      turbo.classList.toggle("turbo-active", turboMode)

      // Update sprite frame rate (this is OK to reassign — it's user-triggered, not per-frame)
      if (useSprite) {
        const rate = turboMode ? TURBO_FRAME_RATE : WALK_FRAME_RATE
        corgi!.style.animation = `corgi-sprint ${rate} steps(${cfg.spriteFrames}) infinite`
      }
    }
    turbo.addEventListener("click", handleTurbo)
    window.addCleanup(() => turbo.removeEventListener("click", handleTurbo))
  }

  // Horizontal movement — continuous loop
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
      corgi!.style.transform = "translateY(-50%)"
    } else {
      x = totalDist - 40 - progress * totalDist
      corgi!.style.transform = "translateY(-50%) scaleX(-1)"
    }

    corgi!.style.left = `${x}px`

    if (!useSprite) {
      const freq = turboMode ? 8 : 3
      const bounceY = Math.sin(elapsed * freq * 2 * Math.PI) * 4
      const flip = goingRight ? "" : " scaleX(-1)"
      corgi!.style.transform = `translateY(calc(-50% + ${bounceY}px))${flip}`
    }

    animFrame = requestAnimationFrame(tick)
  }

  corgi.style.display = "inline-block"
  corgi.style.left = "-40px"
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

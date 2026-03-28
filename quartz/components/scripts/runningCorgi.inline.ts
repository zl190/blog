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
  if (!banner || !corgi) return

  const raw = banner.dataset.cfg
  if (!raw) return

  const cfg: RunningCorgiConfig = JSON.parse(raw)

  // Check shared visibility preference
  const saved = localStorage.getItem("background-art-visible")
  if (saved === "false") {
    banner.classList.add("art-hidden")
    return
  }
  banner.classList.remove("art-hidden")

  const isMobile = window.innerWidth <= 800
  const useSprite = !!cfg.spriteSheet

  if (useSprite) {
    // Sprite sheet mode
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
    // Frame animation via CSS steps
    corgi.style.animation = `corgi-frames 0.4s steps(${cfg.spriteFrames}) infinite`

    // Inject keyframes if not already present
    if (!document.getElementById("corgi-keyframes")) {
      const styleEl = document.createElement("style")
      styleEl.id = "corgi-keyframes"
      styleEl.textContent = `
        @keyframes corgi-frames {
          from { background-position: 0 0; }
          to { background-position: -${totalW}px 0; }
        }
        @keyframes corgi-frames-flip {
          from { background-position: -${totalW}px 0; }
          to { background-position: 0 0; }
        }
      `
      document.head.appendChild(styleEl)
    }
  } else {
    // Emoji fallback
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

  // Horizontal movement — continuous loop
  let animFrame: number | null = null
  let startTime: number | null = null
  let phase: "going" | "returning" = "going"
  const totalWidth = window.innerWidth + 80
  const legDuration = cfg.speed

  function runAnimation(timestamp: number) {
    if (startTime === null) startTime = timestamp
    const elapsed = (timestamp - startTime) / 1000

    if (phase === "going") {
      if (elapsed >= legDuration) {
        phase = "returning"
        startTime = timestamp
        if (useSprite) {
          corgi!.style.transform = "translateY(-50%) scaleX(-1)"
          corgi!.style.animation = `corgi-frames-flip 0.4s steps(${cfg.spriteFrames}) infinite`
        } else {
          corgi!.style.transform = "translateY(-50%) scaleX(-1)"
        }
        animFrame = requestAnimationFrame(runAnimation)
        return
      }
      const progress = elapsed / legDuration
      const x = -40 + progress * totalWidth
      const bounceY = useSprite ? 0 : Math.sin(elapsed * 5 * 2 * Math.PI) * 4
      corgi!.style.left = `${x}px`
      if (!useSprite) {
        corgi!.style.transform = `translateY(calc(-50% + ${bounceY}px))`
      }
    } else {
      if (elapsed >= legDuration) {
        // Restart: flip back and go again
        phase = "going"
        startTime = timestamp
        if (useSprite) {
          corgi!.style.transform = "translateY(-50%)"
          corgi!.style.animation = `corgi-frames 0.4s steps(${cfg.spriteFrames}) infinite`
        } else {
          corgi!.style.transform = "translateY(-50%)"
        }
        animFrame = requestAnimationFrame(runAnimation)
        return
      }
      const progress = elapsed / legDuration
      const x = totalWidth - 40 - progress * totalWidth
      corgi!.style.left = `${x}px`
    }

    animFrame = requestAnimationFrame(runAnimation)
  }

  corgi.style.display = "inline-block"
  corgi.style.left = "-40px"
  startTime = null
  phase = "going"
  animFrame = requestAnimationFrame(runAnimation)

  window.addCleanup(() => {
    if (animFrame !== null) {
      cancelAnimationFrame(animFrame)
      animFrame = null
    }
  })
})

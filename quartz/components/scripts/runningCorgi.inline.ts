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

  if (localStorage.getItem("background-art-visible") === "false") {
    banner.classList.add("art-hidden")
    return
  }
  banner.classList.remove("art-hidden")

  const isMobile = window.innerWidth <= 800
  const useSprite = !!cfg.spriteSheet

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

    // Inject keyframes once — never touch animation property again after setting
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
    // Set animation ONCE — never reassign
    corgi.style.animation = `corgi-sprint 0.5s steps(${cfg.spriteFrames}) infinite`
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

  // Horizontal movement — continuous loop
  let animFrame: number | null = null
  let startTime: number | null = null
  let goingRight = true
  const totalDist = window.innerWidth + 80
  const legDuration = cfg.speed

  function tick(timestamp: number) {
    if (startTime === null) startTime = timestamp
    const elapsed = (timestamp - startTime) / 1000

    if (elapsed >= legDuration) {
      // Switch direction — only change transform, NOT animation
      goingRight = !goingRight
      startTime = timestamp
      animFrame = requestAnimationFrame(tick)
      return
    }

    const progress = elapsed / legDuration
    let x: number
    if (goingRight) {
      // Sprite faces RIGHT by default — no flip needed
      x = -40 + progress * totalDist
      corgi!.style.transform = "translateY(-50%)"
    } else {
      // Returning left — flip horizontally
      x = totalDist - 40 - progress * totalDist
      corgi!.style.transform = "translateY(-50%) scaleX(-1)"
    }

    corgi!.style.left = `${x}px`

    // Emoji bounce (sprite already has built-in bounce)
    if (!useSprite) {
      const bounceY = Math.sin(elapsed * 5 * 2 * Math.PI) * 4
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

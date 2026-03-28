interface Theme {
  name: string
  dir: string
  images: string[]
}

interface BackgroundArtConfig {
  imageRoot: string
  themes: Theme[]
  rotation: "nav" | "fixed"
  darkOpacity: number
  lightOpacity: number
}

const STORAGE_KEY = "background-art-visible"

document.addEventListener("nav", () => {
  const el = document.querySelector(".background-art") as HTMLElement | null
  const toggle = document.querySelector(".background-art-toggle") as HTMLElement | null
  if (!el) return

  const raw = el.dataset.cfg
  if (!raw) return

  const cfg: BackgroundArtConfig = JSON.parse(raw)
  if (!cfg.themes || cfg.themes.length === 0) return

  // Check saved preference
  const saved = localStorage.getItem(STORAGE_KEY)
  let visible = saved !== "false" // default: visible

  function applyVisibility() {
    if (visible) {
      el!.classList.remove("art-hidden")
      toggle?.classList.remove("art-off")
    } else {
      el!.classList.add("art-hidden")
      toggle?.classList.add("art-off")
    }
  }

  applyVisibility()

  // Toggle button
  if (toggle) {
    const handleToggle = (e: Event) => {
      e.preventDefault()
      visible = !visible
      localStorage.setItem(STORAGE_KEY, String(visible))
      applyVisibility()
    }
    toggle.addEventListener("click", handleToggle)
    window.addCleanup(() => toggle.removeEventListener("click", handleToggle))
  }

  // Flatten all images across all themes
  const allImages: string[] = []
  for (const theme of cfg.themes) {
    for (const img of theme.images) {
      allImages.push(`${cfg.imageRoot}/${theme.dir}/${img}`)
    }
  }

  if (allImages.length === 0) return

  // Pick image: random on each nav, or keep first if fixed
  if (cfg.rotation === "nav" || !el.style.backgroundImage) {
    const pick = allImages[Math.floor(Math.random() * allImages.length)]
    el.style.backgroundImage = `url('${pick}')`
  }

  // Theme-aware opacity
  function updateOpacity() {
    if (!visible) return
    const theme = document.documentElement.getAttribute("saved-theme") || "light"
    el!.style.opacity = theme === "dark" ? String(cfg.darkOpacity) : String(cfg.lightOpacity)
  }

  updateOpacity()

  // Gaze-following parallax (desktop only)
  const isMobile = window.innerWidth <= 800
  let animFrame: number | null = null

  function handleMouseMove(e: MouseEvent) {
    if (!visible || animFrame) return
    animFrame = requestAnimationFrame(() => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2
      const ny = (e.clientY / window.innerHeight - 0.5) * 2
      const tx = nx * 15
      const ty = ny * 8
      el!.style.transform = `translate(${tx}px, ${ty}px)`
      animFrame = null
    })
  }

  if (!isMobile) {
    document.addEventListener("mousemove", handleMouseMove)
  }

  const themeHandler = () => updateOpacity()
  document.addEventListener("themechange", themeHandler)

  window.addCleanup(() => {
    document.removeEventListener("themechange", themeHandler)
    document.removeEventListener("mousemove", handleMouseMove)
    if (animFrame) cancelAnimationFrame(animFrame)
  })
})

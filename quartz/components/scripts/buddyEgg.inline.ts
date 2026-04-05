// BuddyEgg easter egg — egg → hatch → pet lifecycle
// State stored in localStorage under "buddy-egg-state"
// Keys: clicks (number), hatched (bool), sleeping (bool)

const LS_KEY = "buddy-egg-state"

interface BuddyState {
  clicks: number
  hatched: boolean
  sleeping: boolean
}

function loadState(): BuddyState {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) return JSON.parse(raw) as BuddyState
  } catch {
    // ignore
  }
  return { clicks: 0, hatched: false, sleeping: false }
}

function saveState(s: BuddyState): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(s))
  } catch {
    // ignore
  }
}

document.addEventListener("nav", () => {
  const root = document.querySelector(".buddy-egg-root") as HTMLElement | null
  if (!root) return

  const eggBtn = root.querySelector(".buddy-egg") as HTMLElement | null
  const eggIcon = root.querySelector(".buddy-egg-icon") as HTMLElement | null
  const eggCracks = root.querySelector(".buddy-egg-cracks") as HTMLElement | null
  const pet = root.querySelector(".buddy-pet") as HTMLElement | null
  if (!eggBtn || !pet || !eggIcon) return

  const clicksToHatch = parseInt(root.dataset.clicksToHatch ?? "5", 10)
  let state = loadState()

  // ── Apply initial state ──────────────────────────────────────────────────
  function render() {
    if (!eggBtn || !pet || !eggIcon || !root) return

    if (state.hatched) {
      eggBtn.style.display = "none"
      pet.classList.add("visible")
      pet.classList.toggle("sleeping", state.sleeping)
    } else {
      eggBtn.style.display = ""
      pet.classList.remove("visible")
      // Crack opacity proportional to progress
      const progress = Math.min(state.clicks / clicksToHatch, 1)
      root.style.setProperty("--buddy-cracks", String(progress * 0.9))
    }
  }

  render()

  // ── Egg click ────────────────────────────────────────────────────────────
  function onEggClick() {
    if (state.hatched || !eggBtn || !root) return

    state.clicks++
    saveState(state)

    const progress = state.clicks / clicksToHatch

    // Update crack overlay
    if (eggCracks) {
      root.style.setProperty("--buddy-cracks", String(Math.min(progress, 1) * 0.9))
    }

    if (state.clicks >= clicksToHatch) {
      // Hatch!
      hatch()
      return
    }

    // Pre-hatch: last 2 clicks trigger intense shake
    if (state.clicks >= clicksToHatch - 1) {
      eggBtn.classList.add("pre-hatch")
      eggBtn.classList.remove("shaking")
    } else {
      // Normal wobble
      eggBtn.classList.remove("pre-hatch")
      eggBtn.classList.add("shaking")
      if (eggIcon) {
        // Reset animation to replay
        eggIcon.style.animation = "none"
        // Force reflow
        void eggIcon.offsetWidth
        eggIcon.style.animation = ""
      }
      // Remove shaking class after animation completes
      setTimeout(() => eggBtn!.classList.remove("shaking"), 380)
    }
  }

  function hatch() {
    if (!root || !eggBtn || !pet) return

    eggBtn.classList.remove("pre-hatch", "shaking")
    root.classList.add("hatching")

    // After burst animation, switch to pet
    setTimeout(() => {
      state.hatched = true
      state.sleeping = false
      saveState(state)
      root!.classList.remove("hatching")
      render()
    }, 420)
  }

  // ── Pet click (toggle sleeping) ──────────────────────────────────────────
  function onPetClick() {
    if (!state.hatched) return
    state.sleeping = !state.sleeping
    saveState(state)
    pet!.classList.toggle("sleeping", state.sleeping)
  }

  eggBtn.addEventListener("click", onEggClick)
  pet.addEventListener("click", onPetClick)

  window.addCleanup(() => {
    eggBtn!.removeEventListener("click", onEggClick)
    pet!.removeEventListener("click", onPetClick)
  })
})

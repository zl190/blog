// CC Buddy — ASCII companion sprite adapted from Claude Code's /buddy system
// Idle animation, speech bubbles, petting — pure visual, no backend

const TICK_MS = 600
const BUBBLE_TICKS = 16 // ~10s display
const IDLE_SEQ = [0, 0, 0, 0, 1, 0, 0, 0, -1, 0, 0, 2, 0, 0, 0]

type Species = string
type Eye = string

interface CompanionBones {
  species: Species
  eye: Eye
  hat: string
  name: string
}

// Borrowed from CC source — 18 species, 3 frames each, 5 lines tall, {E} = eye slot
const BODIES: Record<string, string[][]> = {
  duck: [
    ['            ', '    __      ', '  <({E} )___  ', '   (  ._>   ', '    `--´    '],
    ['            ', '    __      ', '  <({E} )___  ', '   (  ._>   ', '    `--´~   '],
    ['            ', '    __      ', '  <({E} )___  ', '   (  .__>  ', '    `--´    '],
  ],
  cat: [
    ['            ', '   /\\_/\\    ', '  ( {E}   {E})  ', '  (  ω  )   ', '  (")_(")   '],
    ['            ', '   /\\_/\\    ', '  ( {E}   {E})  ', '  (  ω  )   ', '  (")_(")~  '],
    ['            ', '   /\\-/\\    ', '  ( {E}   {E})  ', '  (  ω  )   ', '  (")_(")   '],
  ],
  robot: [
    ['            ', '   .[||].   ', '  [ {E}  {E} ]  ', '  [ ==== ]  ', '  `------´  '],
    ['            ', '   .[||].   ', '  [ {E}  {E} ]  ', '  [ -==- ]  ', '  `------´  '],
    ['     *      ', '   .[||].   ', '  [ {E}  {E} ]  ', '  [ ==== ]  ', '  `------´  '],
  ],
  ghost: [
    ['            ', '   .----.   ', '  / {E}  {E} \\  ', '  |      |  ', '  ~`~``~`~  '],
    ['            ', '   .----.   ', '  / {E}  {E} \\  ', '  |      |  ', '  `~`~~`~`  '],
    ['    ~  ~    ', '   .----.   ', '  / {E}  {E} \\  ', '  |      |  ', '  ~~`~~`~~  '],
  ],
  blob: [
    ['            ', '   .----.   ', '  ( {E}  {E} )  ', '  (      )  ', '   `----´   '],
    ['            ', '  .------.  ', ' (  {E}  {E}  ) ', ' (        ) ', '  `------´  '],
    ['            ', '    .--.    ', '   ({E}  {E})   ', '   (    )   ', '    `--´    '],
  ],
  dragon: [
    ['            ', '  /^\\  /^\\  ', ' <  {E}  {E}  > ', ' (   ~~   ) ', '  `-vvvv-´  '],
    ['            ', '  /^\\  /^\\  ', ' <  {E}  {E}  > ', ' (        ) ', '  `-vvvv-´  '],
    ['   ~    ~   ', '  /^\\  /^\\  ', ' <  {E}  {E}  > ', ' (   ~~   ) ', '  `-vvvv-´  '],
  ],
  octopus: [
    ['            ', '   .----.   ', '  ( {E}  {E} )  ', '  (______)  ', '  /\\/\\/\\/\\  '],
    ['            ', '   .----.   ', '  ( {E}  {E} )  ', '  (______)  ', '  \\/\\/\\/\\/  '],
    ['     o      ', '   .----.   ', '  ( {E}  {E} )  ', '  (______)  ', '  /\\/\\/\\/\\  '],
  ],
  penguin: [
    ['            ', '  .---.     ', '  ({E}>{E})     ', ' /(   )\\    ', '  `---´     '],
    ['            ', '  .---.     ', '  ({E}>{E})     ', ' |(   )|    ', '  `---´     '],
    ['  .---.     ', '  ({E}>{E})     ', ' /(   )\\    ', '  `---´     ', '   ~ ~      '],
  ],
  rabbit: [
    ['            ', '   (\\__/)   ', '  ( {E}  {E} )  ', ' =(  ..  )= ', '  (")__(")  '],
    ['            ', '   (|__/)   ', '  ( {E}  {E} )  ', ' =(  ..  )= ', '  (")__(")  '],
    ['            ', '   (\\__/)   ', '  ( {E}  {E} )  ', ' =( .  . )= ', '  (")__(")  '],
  ],
  owl: [
    ['            ', '   /\\  /\\   ', '  (({E})({E}))  ', '  (  ><  )  ', '   `----´   '],
    ['            ', '   /\\  /\\   ', '  (({E})({E}))  ', '  (  ><  )  ', '   .----.   '],
    ['            ', '   /\\  /\\   ', '  (({E})(-))  ', '  (  ><  )  ', '   `----´   '],
  ],
  mushroom: [
    ['            ', ' .-o-OO-o-. ', '(__________)', '   |{E}  {E}|   ', '   |____|   '],
    ['            ', ' .-O-oo-O-. ', '(__________)', '   |{E}  {E}|   ', '   |____|   '],
    ['   . o  .   ', ' .-o-OO-o-. ', '(__________)', '   |{E}  {E}|   ', '   |____|   '],
  ],
  axolotl: [
    ['            ', '}~(______)~{', '}~({E} .. {E})~{', '  ( .--. )  ', '  (_/  \\_)  '],
    ['            ', '~}(______){~', '~}({E} .. {E}){~', '  ( .--. )  ', '  (_/  \\_)  '],
    ['            ', '}~(______)~{', '}~({E} .. {E})~{', '  (  --  )  ', '  ~_/  \\_~  '],
  ],
}

const SPECIES_LIST = Object.keys(BODIES)
const EYES: Eye[] = ['·', '✦', '×', '◉', '@', '°']
const HATS: Record<string, string> = {
  none: '',
  crown: '   \\^^^/    ',
  tophat: '   [___]    ',
  propeller: '    -+-     ',
  halo: '   (   )    ',
  wizard: '    /^\\     ',
}
const HAT_NAMES = Object.keys(HATS)
const NAMES = [
  'Bit', 'Byte', 'Pip', 'Flux', 'Fizz', 'Nix', 'Dot', 'Hex',
  'Zap', 'Boop', 'Mochi', 'Tofu', 'Bean', 'Sprout', 'Pixel', 'Widget',
  'Patch', 'Gizmo', 'Nugget', 'Chirp',
]

const BUBBLES = [
  'did you know claude has 18 companion species?',
  '/buddy',
  'try clicking me!',
  'zzz...',
  'ASCII art > SVG, fight me',
  '✦ reading is thinking ✦',
  'borrowed from the CC source leak~',
  'hatched from exit code 0',
  'i live in your localStorage',
  '*fidget*',
  'the egg was just the beginning...',
  '♪ beep boop ♪',
]

const CC_BUDDY_LS_KEY = 'cc-buddy-state'

interface BuddyState {
  species: string
  eye: string
  hat: string
  name: string
  hearts: number
}

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

function loadOrCreate(): BuddyState {
  try {
    const raw = localStorage.getItem(CC_BUDDY_LS_KEY)
    if (raw) return JSON.parse(raw) as BuddyState
  } catch { /* ignore */ }

  // Generate deterministic companion from a seed
  const seed = Date.now().toString(36) + Math.random().toString(36)
  const h = hash(seed)
  return {
    species: SPECIES_LIST[h % SPECIES_LIST.length]!,
    eye: EYES[(h >> 4) % EYES.length]!,
    hat: HAT_NAMES[(h >> 8) % HAT_NAMES.length]!,
    name: NAMES[(h >> 12) % NAMES.length]!,
    hearts: 0,
  }
}

function save(s: BuddyState) {
  try { localStorage.setItem(CC_BUDDY_LS_KEY, JSON.stringify(s)) } catch { /* ignore */ }
}

function renderSprite(species: string, eye: string, hat: string, frame: number): string {
  const frames = BODIES[species]
  if (!frames) return ''
  const body = frames[frame % frames.length]!.map(l => l.replaceAll('{E}', eye))
  const lines = [...body]
  if (hat !== 'none' && HATS[hat] && !lines[0]!.trim()) {
    lines[0] = HATS[hat]!
  }
  return lines.join('\n')
}

document.addEventListener('nav', () => {
  const root = document.querySelector('.cc-buddy-root') as HTMLElement | null
  if (!root) return

  const spriteEl = root.querySelector('.cc-buddy-sprite') as HTMLPreElement | null
  const bubbleEl = root.querySelector('.cc-buddy-bubble') as HTMLElement | null
  const nameEl = root.querySelector('.cc-buddy-name') as HTMLElement | null
  if (!spriteEl || !bubbleEl || !nameEl) return

  const state = loadOrCreate()
  save(state)

  nameEl.textContent = state.name

  let tick = 0
  let bubbleTick = -1
  let currentBubble = ''
  let petting = false
  let petTimeout: ReturnType<typeof setTimeout> | null = null

  function render() {
    if (!spriteEl || !bubbleEl) return

    // Idle frame
    const seqIdx = tick % IDLE_SEQ.length
    const frameIdx = IDLE_SEQ[seqIdx]!
    const blink = frameIdx === -1
    const frame = blink ? 0 : frameIdx

    let sprite = renderSprite(state.species, state.eye, state.hat, frame)
    if (blink) {
      sprite = sprite.replaceAll(state.eye, '-')
    }
    spriteEl.textContent = sprite

    // Petting animation override
    if (petting) {
      spriteEl.classList.add('petting')
    } else {
      spriteEl.classList.remove('petting')
    }

    // Bubble
    if (bubbleTick >= 0) {
      const age = tick - bubbleTick
      if (age > BUBBLE_TICKS) {
        bubbleEl.classList.remove('visible', 'fading')
        bubbleTick = -1
      } else if (age > BUBBLE_TICKS - 4) {
        bubbleEl.classList.add('fading')
      }
    }
  }

  function showBubble(text?: string) {
    if (!bubbleEl) return
    currentBubble = text ?? BUBBLES[Math.floor(Math.random() * BUBBLES.length)]!
    bubbleEl.textContent = currentBubble
    bubbleEl.classList.add('visible')
    bubbleEl.classList.remove('fading')
    bubbleTick = tick
  }

  function onClick() {
    state.hearts++
    save(state)

    // Pet animation
    petting = true
    if (petTimeout) clearTimeout(petTimeout)
    petTimeout = setTimeout(() => { petting = false }, 2000)

    // Show bubble
    if (state.hearts % 5 === 0) {
      showBubble(`♥ ${state.hearts} pets!`)
    } else {
      showBubble()
    }
  }

  render()

  // Random bubble on load (30% chance)
  if (Math.random() < 0.3) {
    setTimeout(() => showBubble(), 3000 + Math.random() * 5000)
  }

  const interval = setInterval(() => {
    tick++
    render()
  }, TICK_MS)

  root.addEventListener('click', onClick)

  window.addCleanup(() => {
    clearInterval(interval)
    root.removeEventListener('click', onClick)
    if (petTimeout) clearTimeout(petTimeout)
  })
})

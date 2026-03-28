# Mascot Sprite Pool

Control panel for RunningMascot. Add/remove sprites here + update `RunningMascot.tsx` config.

## How to add a new mascot
1. Drop sprite sheet PNG into this folder (horizontal strip: frame1|frame2|...|frameN, transparent bg)
2. Add entry to `quartz/components/RunningMascot.tsx` → `mascots[]`:
   ```
   { name: "newmascot", sprite: "/static/sprites/newmascot.png", frames: 8, width: 48, height: 48 },
   ```
3. Optional: add seasonal rule to `seasonal[]`:
   ```
   { from: "MM/DD", to: "MM/DD", mascot: "newmascot" },
   ```
4. `npx quartz build` to verify

## How to remove
1. Delete PNG from this folder
2. Remove from `mascots[]` and `seasonal[]` in RunningMascot.tsx

## Current sprites (3)

| File | Frames | Size | Season | Notes |
|------|--------|------|--------|-------|
| corgi-run.png | 8 | 48x48 | Default (year-round) | Orange corgi, running cycle |
| bunny-hop.png | 8 | 48x48 | Easter (03/20-04/20) | White bunny, gray outline, hopping |
| ghost-float.png | 8 | 48x48 | Halloween (10/15-11/05) | White ghost, floating + blinking |

## Sprite spec
- Format: horizontal strip PNG, RGBA (transparent background)
- Frame size: 48x48 px recommended
- Animation: CSS `steps(N)` — each frame must be clearly different
- White sprites need gray outline (#A0A0A0) for visibility on light backgrounds

## Wanted
- Reindeer (Christmas 12/15-01/05)
- Dragon (春节, lunar new year date varies)
- Professional corgi upgrade (current is PIL-generated pixel art)

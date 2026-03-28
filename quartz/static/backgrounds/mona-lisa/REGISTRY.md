# Mona Lisa Variant Pool

Control panel for background art. Add/remove images here + update `quartz.layout.ts` images array.

## How to add
1. Drop .jpg into this folder
2. Add filename to `quartz.layout.ts` → `BackgroundArt({ themes: [{ images: [...] }] })`
3. `npx quartz build` to verify

## How to remove
1. Delete file from this folder
2. Remove filename from `quartz.layout.ts`

## Current variants (5)

| File | Source | Type | Notes |
|------|--------|------|-------|
| classic-hd.jpg | Wikimedia (public domain) | Original | 1200x1815, the classic |
| sunglasses.jpg | Imagen 4 | AI meme | Cool sunglasses |
| vr-cyberpunk.jpg | Imagen 4 | AI meme | VR headset, cyberpunk |
| selfie.jpg | Imagen 4 | AI meme | Selfie angle |
| caricature-donkeyhotey.jpg | Crawled (public domain) | Caricature | DonkeyHotey style |

## Rules
- Only memes and true style variants (二创). No color filters (rejected Session 8).
- At 5% opacity, only high-contrast/bold modifications are recognizable.
- All images must be public domain or AI-generated.

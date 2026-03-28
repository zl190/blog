# Mona Lisa Variant Pool

Control panel for background art. Add/remove images here + update `quartz.layout.ts` images array.

## How to add
1. Drop .jpg into this folder
2. Add filename to `quartz.layout.ts` → `BackgroundArt({ themes: [{ images: [...] }] })`
3. `npx quartz build` to verify

## How to remove
1. Delete file from this folder
2. Remove filename from `quartz.layout.ts`

## Current variants (17)

| File | Source | Type | Notes |
|------|--------|------|-------|
| classic-hd.jpg | Wikimedia (public domain) | Original | 1200x1815, the classic |
| sunglasses.jpg | Imagen 4 | AI meme | Cool sunglasses |
| cat-face.jpg | Imagen 4 | AI meme | Cat face overlay |
| vr-cyberpunk.jpg | Imagen 4 | AI meme | VR headset, cyberpunk |
| selfie.jpg | Imagen 4 | AI meme | Selfie angle |
| pixel-16bit.jpg | Imagen 4 | AI meme | 16-bit pixel art style |
| anime.jpg | Imagen 4 | AI meme | Anime style |
| moustache-classic.jpg | Crawled (public domain) | Historical | L.H.O.O.Q. style |
| duchamp-moustache-comparison.jpg | Crawled (public domain) | Historical | Duchamp comparison |
| deepdream-neural.jpg | Crawled (public domain) | Neural art | DeepDream style |
| caricature-donkeyhotey.jpg | Crawled (public domain) | Caricature | DonkeyHotey style |
| christ-pantocrator-style.jpg | Crawled (public domain) | Style transfer | Byzantine icon |
| illusion-diffusion.jpg | Crawled (public domain) | AI art | Illusion diffusion |
| malevich-suprematist.jpg | Crawled (public domain) | Style transfer | Suprematist |
| midjourney-ai.jpg | Crawled (public domain) | AI art | Midjourney style |
| neural-american-gothic.jpg | Crawled (public domain) | Neural style | American Gothic mashup |
| neural-sunday-afternoon.jpg | Crawled (public domain) | Neural style | Seurat mashup |

## Rules
- Only memes and true style variants (二创). No color filters (rejected Session 8).
- At 5% opacity, only high-contrast/bold modifications are recognizable.
- All images must be public domain or AI-generated.

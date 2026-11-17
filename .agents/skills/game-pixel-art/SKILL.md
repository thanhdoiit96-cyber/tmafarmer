---
name: game-pixel-art
description: Create, revise, or sharpen Vườn Mùa Vui game art. Use for characters, buildings, crops, livestock, terrain, effects, item icons, sprite atlases, and high-resolution design sheets that must match the game's cozy Vietnamese pixel-art style.
---

# Vườn Mùa Vui Pixel Art

## Art direction

Use `docs/assets/vertical-slice-concept-v1.png` and the approved source for the matching asset in `docs/assets/` as visual references. Preserve rounded silhouettes, warm Vietnamese rural materials, upper-left light, a warm highlight ramp, and muted teal-brown shadows. For a resolution upgrade, keep the design recognizable at play size, including costume, pose, proportions, palette, and animation timing.

## Source, presentation, and runtime

- Use the original high-resolution artwork as the source for sharper exports. Use image generation for newly drawn artwork or intentional design revisions and keep the approved transparent master in `docs/assets/`.
- For a presentation sheet, lay out the original art on a separate high-resolution canvas. Show source views and runtime comparisons at equal display size. Enlarge runtime examples by an integer factor with nearest-neighbor sampling. Label the pixel dimensions and scale.
- Export runtime atlases separately in `public/pixel/` as RGBA PNGs. For the approved V2 art, regenerate the 2× atlases using `python3 scripts/normalize-pixel-hd.py` with Pillow. The script resamples each source cell on its own, then thresholds alpha to retain hard edges. Preserve the prior atlas for comparison.
- Use the atlas metadata in `public/pixel/frames.mjs` to select frames. For new atlases, keep full silhouettes within each cell, with transparent padding around the artwork where possible. Check especially wide poses, tools, crop tips, animal limbs, and building roofs. Keep frame origins and baselines consistent. Exclude captions, UI overlays, painted shadows on the ground, glow, and watermarks from runtime sprites.

## Current game grid

| Element | Native runtime dimensions | Frame layout |
| --- | --- | --- |
| Viewport in Pixel mode | 640 × 384 | 5:3 |
| Character | 48 × 64 per frame | Down, up, left, right. Idle 4, walk 6, work 6 per direction |
| Crop | 48 × 48 per frame | Four visually distinct growth stages per crop |
| Chicken | 48 × 48 per frame | Idle 4, walk 4, peck 4 |
| Farmhouse | 192 × 160 | One frame |

Render at the viewport's native pixel grid. Keep gameplay coordinates at 480 × 288 for the visible viewport, and convert artwork placement through the renderer. A denser sprite should occupy the same footprint as the approved lower-resolution design. Snap sprite anchors and the rendering camera to whole raster pixels, use nearest-neighbor for pixel sprites, and use integer enlargement when the display size allows.

For new terrain, effects, or icons, choose dimensions that match this pixel density and the intended in-game footprint. Inspect them beside a character or building at normal play size before locking the grid or animation count.

## Verification

Check the exported PNG size, alpha, frame order, baselines, and padding at 1× and an integer zoom. Compare the actual Canvas at normal play size, including movement and the Pixel toggle. When changing runtime references, run syntax checks, `npm test`, and `npm run build`. Record completed migrations and scope in `docs/PIXEL_ART_MIGRATION.md`.

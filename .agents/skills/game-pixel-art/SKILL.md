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

## Crop quality gate

- Use the established crop atlases in `docs/assets/crops-v2-source.png`, `docs/assets/crop-stages-orchard-source.png`, and the matching runtime atlas as the quality bar. Keep the rounded soil clod, layered foliage, warm upper-left highlights, dark green leaf undersides, and readable fruit or seed clusters.
- Do not ship a new crop as a few flat polygons, thin outlines, emoji, or procedural placeholder art. A production crop needs a distinct, fuller silhouette at every stage, multiple value steps, leaf veins or fruit texture where visible, and a recognizable mature harvest.
- Draw and approve the transparent high-resolution source first, then normalize every frame independently to 48 × 48 with hard alpha edges. Inspect the runtime-sized frames beside existing crops at 1× and 4×; detail that disappears after normalization does not count as finished detail.
- Keep a labeled source/runtime comparison sheet in `docs/assets/` and preserve previous atlases when revising approved art.

## Livestock quality gate

- Use the sheep in `public/pixel/livestock-v2.png` as the style reference for rounded proportions, warm dark outlines, compact faces, upper-left highlights, and muted shadows. New species should read as members of the same game, while keeping their own silhouettes and markings.
- Keep one camera angle, scale registration, and ground baseline across each species' animation poses. Production animal sheets should include idle, alternating walk poses, and feeding; the pose must be selected by the shared livestock motion state.
- Use the same authored sprite for Canvas scenes and HTML animal illustrations. Do not let an authored species fall back to emoji or a differently styled legacy atlas in one view.
- Keep full silhouettes and feet inside the transparent 56 × 48 runtime cells. Inspect the source and 4× nearest-neighbor preview beside the sheep before shipping; retain the previous atlas for comparison.
- Every species in `animals` must resolve to an authored sprite in gameplay and in shop/pen cards; do not leave newly added animals as emoji fallbacks. Keep crop produce and seed icons tied to each crop's mature frame from `cropFrame(kind, 3)` anywhere inventory, market, orders, or workshop recipes show that crop.

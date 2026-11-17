---
name: game-pixel-art
description: Create or revise raster artwork and sprite atlases for Vườn Mùa Vui while preserving its Vietnamese cozy pixel-art direction, runtime grids, animation states, and alpha requirements. Use for characters, buildings, crops, animals, terrain, weather effects, and item art in this game.
---

# Vườn Mùa Vui Pixel Art

Treat `docs/assets/vertical-slice-concept-v1.png` and the current `*-v2-source.png` files as the visual standard. Match their warm Vietnamese rural character, rounded silhouettes, material detail, expressive poses, upper-left morning light, warm highlights, and muted teal-brown shadows.

Use image generation for the artistic source. Do not replace a designed asset with rectangles or other code-drawn approximations. Keep the high-resolution transparent source in `docs/assets/`; normalize a separate runtime PNG into `public/pixel/` with a repeatable script in `scripts/`.

Runtime invariants:

- Production canvas is `320 × 192`.
- Character cells are `24 × 32`: four direction rows; idle 4, walk 6, work 6.
- Crop cells are `24 × 24`: four visibly different growth stages.
- Chicken cells are `24 × 24`: idle 4, walk 4, peck 4.
- The farmhouse frame is `96 × 80`.
- Use real PNG alpha, hard readable pixel edges, consistent foot baselines, scale, light direction, and palette.
- Keep every frame inside its cell. Do not add text, UI, borders, ground scenery, blur, glow, watermark, or soft edge haze.

Before changing runtime references, inspect the normalized atlas at original resolution. Preserve the previous version for comparison. Run syntax checks, tests, and the production build after integration. Update `docs/PIXEL_ART_MIGRATION.md` with the completed asset and next step.

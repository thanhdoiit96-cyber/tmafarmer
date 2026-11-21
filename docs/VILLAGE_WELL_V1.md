# Giếng công cộng tại Ao làng — V1

- Thay hình vẽ procedural bằng sprite giếng đá, trụ gỗ, mái ngói đất nung, dây kéo và gầu nước theo nền `scene-backgrounds-environments-v1.png`.
- Nguồn alpha thật: `assets/village-well-v1-source.png`; runtime RGBA 104 × 124: `../public/pixel/village-well-v1.png`.
- Xuất lại bằng `py scripts/normalize-village-well-v1.py`. Kích thước trong world: 52 × 62, chân ở (217, 327), điểm uống ở (217, 339). Chân giếng nằm trên cỏ, phía trước thông ra lối đi.
- Chỉ áp dụng cho giếng công cộng đã mở khóa tại lake. Giếng tại các scene khác giữ cách hiển thị cũ. Không thay chi phí, điều kiện mở khóa hoặc cơ chế hồi nước.
- Preview Canvas: `assets/village-well-runtime-v1.png` (toàn cảnh), `assets/village-well-viewport-v1.png` (640 × 384, có nhân vật).
- Kiểm tra: alpha runtime 0/255; đường từ cổng tới điểm uống đi được; chân đá có collision; trước mở khóa không có giếng. 116 tests đạt, production build đạt.

## Image generation

Built-in imagegen; transparent background; reference: `public/pixel/scene-backgrounds-environments-v1.png`.

Prompt: Create ONE isolated village well sprite, real transparent background. Reference image is the exact game art style: cozy Vietnamese rural pixel art, warm honey stone, dark warm brown outlines, terracotta roof, visible carefully arranged pixel clusters, top-left sunlight, elevated front view matching these buildings. Extract/reimagine the small roofed well visible in the upper left market panel, as a standalone production game asset. Low round grey-beige stone well with dark teal water opening, two weathered timber posts, modest red clay tile roof with gently curved eaves (not ornate temple), wooden spindle, rope and small bamboo bucket. Entire object visible with compact stone foot, no ground patch, no grass, no flowers, no text, no background, no characters. Simple readable silhouette at 52x60 game pixels, detailed but clean like the supplied scene, no blur or vector appearance. Centered single sprite on transparent canvas, tightly framed.

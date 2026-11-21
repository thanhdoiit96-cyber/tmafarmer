# Kế hoạch chuyển đổi Pixel Art

Tài liệu này là nguồn theo dõi chính cho việc chuyển phần thế giới Canvas của **Vườn Mùa Vui** sang pixel art. UI HTML, luật game, tọa độ gameplay và dữ liệu lưu được giữ độc lập với quá trình đổi hình ảnh.

## Quyết định đã chốt

- Chuyển thế giới trong Canvas sang pixel art; giữ UI HTML sắc nét để chữ tiếng Việt dễ đọc.
- Hướng nghệ thuật: cozy pixel art Việt Nam, mái ngói, tre, gỗ màu mật ong, cây nhiệt đới và ánh sáng ấm.
- Tỷ lệ khung hình giữ ở `5:3`.
- Tất cả các cảnh dùng Canvas Pixel `640 × 384`. Tỷ lệ từ gameplay `480 × 288` là `4/3`. Renderer căn camera và sprite theo lưới điểm ảnh.
- Gameplay tiếp tục dùng hệ tọa độ `480 × 288`; lớp render chịu trách nhiệm quy đổi.
- Sprite production phải có nền alpha thật, cạnh pixel cứng, không anti-alias và cùng hướng sáng.
- Animation production dùng frame animation/state machine thay cho biến dạng ảnh liên tục.

## Vertical slice v1

Phạm vi:

- Khu Vườn nhà.
- Nhân vật bốn hướng.
- Nhà vườn Việt Nam.
- Lúa mì, cà rốt và bắp với bốn giai đoạn.
- Gà với trạng thái đứng và đi.
- Chế độ so sánh pixel bật/tắt ngay trên bản đồ.

Trạng thái:

- [x] Thêm buffer pixel độ phân giải thấp cho riêng Vườn nhà.
- [x] Tắt nội suy khi phóng buffer.
- [x] Thêm nút `Pixel: Bật/Tắt`, ghi nhớ lựa chọn bằng `localStorage`.
- [x] Tạo concept art v1 tại `docs/assets/vertical-slice-concept-v1.png`.
- [x] Giữ nguyên va chạm, camera, thời tiết và gameplay.
- [x] Tạo atlas nhân vật production RGBA có alpha thật và cell cố định; bản V2 đầu tiên ở `public/pixel/characters-v2.png`, giữ cùng v1 để so sánh.
- [x] Thay nhân vật Vườn nhà bằng sprite sheet frame-based `idle`, `walk`, `work`.
- [x] Thay nhà, lúa mì, cà rốt, bắp và gà bằng atlas thiết kế chi tiết `public/pixel/vertical-slice-v2.png`; giữ v1 để so sánh.
- [x] Thêm skill `.agents/skills/game-pixel-art/SKILL.md` để các asset sau giữ cùng art direction và chuẩn atlas.
- [x] Chuẩn hóa trực tiếp từ hình gốc V2 thành `characters-v2-hd.png` và `vertical-slice-v2-hd.png`. Tái tạo bằng `python3 scripts/normalize-pixel-hd.py` với Pillow.
- [x] Thay bước thu nhỏ bản đồ cuối mỗi frame bằng Canvas Pixel `640 × 384` và bỏ nút chuyển renderer thử nghiệm.
- [x] Dùng cùng renderer và atlas nhân vật ở Vườn nhà, Nhà vườn, Chuồng, Chợ, Hàng xóm, Hồ làng, vườn ghé thăm và Xưởng máy. Nhà hàng xóm dùng chung sprite với nhà vườn, có chi tiết riêng theo cấp.
- [x] Thay nền ở cả tám cảnh bằng bộ vật liệu V3. Tách màu Vườn nhà và vườn ghé thăm, lát quảng trường chợ, thêm thảm sân rơm ở chuồng, đường ven hồ, ván và chiếu trong nhà, sàn đá trong xưởng. Mặt bằng chơi và điểm tương tác vẫn lấy từ dữ liệu bản đồ.
- [x] Căn lúa, cà rốt và bắp theo phần hình nhìn thấy, đặt biểu tượng công việc trên tán cây. Thêm con trỏ và vòng đánh dấu đích tự tìm đường.
- [x] Dùng chính kích thước nhà `72 × 60` trên bản đồ để vẽ sprite và xác định vùng bấm. Vườn nhà và vườn ghé thăm chia sẻ mặt bằng nhà. Mép mái cách vùng luống ít nhất 4 đơn vị gameplay; hiên đá nối thẳng với đường đi đến cửa.
- [x] Vẽ bờ cỏ, đá rìa đường, bụi cây và dải đất ẩm bằng cùng bảng màu nền; các chi tiết trang trí dùng cùng atlas cảnh vật và không thêm va chạm mới.

Ảnh vật liệu gốc ở `docs/assets/terrain-materials-v3-source.png`. Tấm chất liệu tạo từ concept Vườn Mùa Vui theo lưới 4 × 2, nhìn thẳng từ trên xuống, gồm cỏ vườn, cỏ rợp, đá lát, bờ hồ, ván gỗ, đá phiến, sân rơm và sỏi đường. Atlas chạy game là `public/pixel/terrain-materials-v3.png` với tám ô 128 × 128. Renderer lật đối xứng từng ô khi lặp texture để liền mép.

## Nhịp di chuyển và hướng sprite

- Nhân vật có bốn khung toàn thân cho mỗi hướng đi, gồm hai tư thế chạm gót và hai tư thế chuyển chân. Canvas vẽ nguyên khung với cùng kích thước ô và mốc chân; nhịp đi tính theo quãng đường. Người chơi, người cùng khu và NPC dùng cùng bộ bước.
- Camera dùng vùng an toàn ở giữa khung hình và chỉ cuộn khi nhân vật ra khỏi vùng này; ngưỡng đi xuống được chặn ở 83% chiều cao để camera theo kịp trước khi nhân vật sát mép dưới. Cảnh mới và đổi kích thước khung hình căn ngay lập tức; vị trí camera tiếp tục được snap theo lưới raster để tránh rung/mờ pixel.
- Mẫu bước đi theo thiết kế nón lá, khăn xanh và áo nâu ở `docs/assets/farmer-walk-v4-source.png`. Lệnh `python3 scripts/normalize-pixel-hd.py` xuất atlas `public/pixel/farmer-walk-v4.png` theo bốn hướng, dùng chung tỷ lệ và mốc chân (ô `48 × 64`).
- Gà bước, dừng và mổ theo trạng thái. Các khung đứng/đi trong atlas quay trái, khung mổ quay phải. Hướng gốc khai báo riêng cho từng trạng thái; chân bám mốc đất của nhóm khung.
- Vật nuôi dùng các nhịp đi và nghỉ ngắn theo từng con. Bò, lợn và các vật nuôi dùng atlas cũ luân phiên nhấc chân khi đi và cúi khi ăn. Thao tác cuốc chạy từ khung đầu, các công cụ tưới, thu hoạch và câu cá vẽ theo hành động.

## Đánh giá concept v1

Concept đã chốt được bảng màu và bản sắc: nón lá, nhà gỗ mái ngói đỏ, màu cây xanh lúa và bóng teal. Ảnh hiện chỉ dùng làm reference vì công cụ tạo ảnh chưa xuất nền alpha sạch và cell grid chưa đủ chính xác để cắt tự động. Không dùng trực tiếp concept làm atlas runtime.

Prompt gốc thuộc nhóm `stylized-concept`, tạo bằng built-in image generation:

> Production reference sprite sheet cho game nông trại pixel art Việt Nam, gồm nông dân bốn hướng, nhà gỗ mái ngói, lúa mì/cà rốt/bắp bốn giai đoạn và gà; palette giới hạn, ánh sáng trên trái, cạnh pixel cứng, không chữ và không UI.

## Chuẩn asset production

| Nhóm | Cell đề xuất | Frame tối thiểu |
| --- | ---: | --- |
| Nhân vật | `48 × 64` | idle 4, walk 6, work 6 mỗi hướng |
| Gà | `48 × 48` | idle 4, walk 4, peck 4 |
| Cây trồng | `48 × 48` | 4 giai đoạn mỗi loại |
| Nhà | `192 × 160` | 1 ảnh + lớp đèn/khói tùy chọn |
| Hiệu ứng | Theo kích thước hiển thị ở mật độ hiện tại | 4–8 frame khi cần chuyển động |

Quy tắc:

1. Tọa độ và kích thước là số nguyên.
2. Không scale lẻ từng sprite ở runtime.
3. Không dùng blur hoặc gradient mềm trong atlas.
4. Mỗi vật liệu có ramp sáng/tối riêng; tránh viền đen tuyệt đối.
5. Chừa padding trong cell khi đóng gói thiết kế mới để tránh cắt silhouette.
6. Export PNG alpha và metadata frame riêng.

## Kiến trúc dự kiến

```text
public/pixel/
├── terrain.png
├── characters.png
├── crops.png
├── animals.png
├── buildings.png
└── frames.mjs
```

Concept và tài liệu tham chiếu không dùng ở runtime được lưu trong `docs/assets/` để không làm tăng kích thước bundle game.

`world.mjs` giữ camera và gameplay. Renderer đọc atlas/metadata và vẽ trực tiếp vào Canvas Pixel; các sprite cũ còn được dùng cho đạo cụ, vật nuôi và dự phòng khi tải asset.

- Cuốc đất dùng lại sáu khung hình công việc có sẵn. Gieo hạt dùng túi hạt và các hạt rơi xuống luống; câu cá vẽ cần, dây, phao và gợn nước theo từng trạng thái thả, chờ, kéo. Các hiệu ứng dùng lại Canvas Pixel và có trạng thái tĩnh khi bật giảm chuyển động.
- Vật nuôi có tỷ lệ theo từng loài và độ trưởng thành trên bản đồ chuồng chính, ô đất mở rộng và vườn ghé thăm.
- Dê sữa và cừu có minh họa riêng trong `public/pixel/livestock-v1.png`. Hai ô 56 × 48 dùng chung đường chân, mỗi loài có đường cắt chân riêng cho chuyển động trên bản đồ. Giao diện chuồng và mua vật nuôi dùng cùng atlas. Chạy `python3 scripts/normalize-livestock.py` để xuất lại từ ảnh nguồn trong `docs/assets/`.
- Nhân vật nam mặc áo xanh, khăn vàng và nón lá. Hai atlas `public/pixel/farmer-male-walk.png` và `public/pixel/farmer-male-poses.png` dùng ô 48 × 64, bốn hướng và cùng điểm neo chân với nhân vật nữ. Atlas tư thế gồm đứng yên, chuẩn bị cuốc, nâng cuốc và bổ xuống. Chạy `python3 scripts/normalize-male-character.py` để xuất lại atlas từ ảnh nguồn trong `docs/assets/`.
- Bong bóng chat dùng màu kem và xanh lá của giao diện, tự xuống dòng, đặt trên tên người chơi và chỉ xuất hiện khi ở gần nhân vật gửi.
- Atlas `public/pixel/crop-stages.png` thêm bốn giai đoạn cho cà chua, hướng dương, dâu, nho, trà và nấm truffle. Hình ở luống và trong bảng giống dùng chung sprite 48 × 48. Hai ảnh nguồn ban đầu trong `docs/assets/` được dùng tiếp ở bản V2.
- Bản mở rộng dùng `public/pixel/crop-stages-v2.png` với 4 cột và 9 hàng, thêm khoai lang, bí đỏ và đậu phộng. Cả 12 khung mới dùng ô 48 × 48 và cùng mốc chân với các giống cũ. Nguồn mới ở `docs/assets/crop-stages-seasonal-source.png`. Script chuẩn hóa xuất bản V2 từ ba ảnh nguồn.
- Atlas `public/pixel/livestock-v2.png` thêm ngỗng và thỏ, mỗi loài một ô 56 × 48. Bản đồ dùng bước đi hiện có cho ngỗng và nhịp nhảy cả khung cho thỏ. Hình trong chuồng dùng chung atlas. Nguồn mới ở `docs/assets/livestock-goose-rabbit-source.png`. Chạy `python3 scripts/normalize-livestock.py` để xuất bản V2.

## Tiêu chí nghiệm thu vertical slice

- Nhân vật, nhà, cây và gà đọc rõ ở kích thước mobile nhỏ nhất.
- Không có pixel mờ hoặc rung khi camera di chuyển.
- Tất cả sprite dùng cùng mật độ pixel và hướng sáng.
- Mưa, sương và bóng không làm mất silhouette.
- FPS không giảm so với renderer hiện tại.
- Cảnh nào cũng khởi tạo cùng kích thước Canvas và dùng cùng renderer.

## Các bước kế tiếp

1. Chuyển terrain Vườn nhà sang tileset theo mật độ 2×.
2. Chuyển mưa, sương và ánh sáng sang hiệu ứng pixel.
3. Bổ sung sprite chuyển động riêng cho tưới và thu hoạch.
4. Chuyển dần phông nền và đạo cụ đặc thù từng cảnh sang atlas pixel riêng.

## Thủy sản năm 2026

Ảnh gốc [aquatic-v1-source.png](assets/aquatic-v1-source.png) dùng cùng bảng màu ấm với vật nuôi của Vườn Mùa Vui. Atlas dùng trong game có kích thước 168 × 40 px và ba ô 56 × 40 px theo thứ tự cá lóc, cá trê, cua đồng. Mỗi ô được thu nhỏ riêng và áp ngưỡng alpha để giữ viền pixel rõ. Tọa độ khung nằm trong `public/pixel/frames.mjs`. Chợ, Ao nuôi, Kho và đơn thủy sản dùng ảnh của cùng loài. Canvas vẽ các lứa đã thả cạnh cầu gỗ.

## Vật trang trí vườn

Nguồn [garden-decor-v1-source.png](assets/garden-decor-v1-source.png) được xuất thành atlas RGBA 168 × 48 px. Ba ô 56 × 48 px lần lượt là chậu hoa, đèn tre và bảng tên. Metadata trong `public/pixel/frames.mjs` định vị phần chữ trên bảng và tâm ánh sáng của đèn. Chủ vườn và khách ghé thăm dùng chung atlas.

Bản mở rộng dùng nguồn [garden-decor-expansion-source.png](assets/garden-decor-expansion-source.png). Atlas V2 có 13 ô 56 × 48 px trên một hàng và kích thước 728 × 48 px. Ba ô gốc được chép nguyên từ V1. Mười ô sau lần lượt là ghế tre, xe cút kít gỗ, lu nước, bù nhìn rơm, chậu sen, chuông gió tre, vòm hoa giấy, giỏ mây, kiện rơm và máng chim. Mỗi ảnh mới được thu riêng, giữ alpha sắc nét và căn đáy ở hàng 45.

## Cô Lan

Nguồn [garden-helper-v1-source.png](assets/garden-helper-v1-source.png) được xuất thành atlas 192 × 256 px, gồm 16 ô 48 × 64. Mỗi hướng có một dáng đứng, hai dáng sải chân và một dáng cúi làm việc. Chân các khung căn ở hàng 60. Bình tưới, giỏ thu hoạch và hạt hiệu ứng được vẽ riêng trên Canvas theo từng công việc.

## Progression art atlas 2026

- Added authored four-stage RGBA sprites for coffee, lotus, dragon fruit and black rice to `public/pixel/progression-crops-v1.png` (192 x 192, 48-pixel cells), with 4x nearest-neighbor source at `docs/assets/progression-crops-v1-source.png`.
- Added distinct quail and water buffalo sprites to `public/pixel/progression-livestock-v1.png` (112 x 48, 56 x 48 cells), with 4x source at `docs/assets/progression-livestock-v1-source.png`.
- Atlas frame metadata and per-stage bounds live in `public/pixel/frames.mjs`; runtime selects these frames instead of procedural crop art or recolored chicken/cow sprites.
- Regenerate both atlases with `npm run pixel:progression-art`; the progression checker verifies PNG dimensions, RGBA alpha, frame coverage, unlock data, and upgrade table consistency.
- Art quality revision V2: preserved V1 for comparison and replaced runtime crop art with `public/pixel/progression-crops-v2.png`. The 768 x 768 transparent master is `docs/assets/progression-crops-v2-source.png`; the labeled, equal-size source/runtime comparison is `docs/assets/progression-crops-v2-preview.png`.
- Art quality revision V3: preserved V2 and redrew the four late-game crops on a crisp 48px pixel grid. `public/pixel/progression-crops-v3.png` is the runtime atlas; the 768 x 768 transparent master and 4x source/runtime comparison are `docs/assets/progression-crops-v3-source.png` and `docs/assets/progression-crops-v3-preview.png`. Regenerate with `npm run pixel:progression-art`.
- Main coop: animal seats now adapt from 3x2 up to 4x4 within the existing pen bounds. The foreground rail is drawn after the sorted actors, and quails render at 23 x 21 world units. The land test verifies all 16 seats remain inside the pen and reachable.

## Pixel interior pass 2026

- Replaced the photoreal farmhouse interior runtime backdrop with a native Canvas pixel-grid room in `public/world-art.mjs`, using the approved warm wood, muted teal-green and upper-left daylight palette.
- Kept the bed interaction at `(395, 165)`, the room bounds, spawn, exit and walkable corridor unchanged. Room furniture is decorative and stays clear of the spawn-to-exit route.
- Removed the unused `public/nha-vuon.webp` runtime illustration so the obsolete style is not shipped with the game.

## Pixel weather pass 2026

- Rain streaks are drawn as short, camera-aligned pixel cells instead of antialiased vector lines. The storm uses denser, longer drops; ordinary rain stays lighter. Lightning and water splashes keep their existing behavior.
- Fog uses slow, stepped pixel wisps with low opacity. It keeps crop, character, and interaction silhouettes readable. Reduced-motion mode freezes the wisps and suppresses rain drift, flashes, splashes, and sparkles.
- The world already loads `public/pixel/terrain-materials-v3.png` and repeats mirrored material cells. The remaining terrain task is to author distinct pixel transitions at region edges, not to add a second repeating texture system.

## Scene background redesign V1 2026

- Replaced the photoreal `public/canh-quan.webp` landscape atlas and small environment buildings with crisp Canvas pixel art that shares the game’s warm highlights, earthy greens, and teal-brown shadows. The renderer covers banyan and fruit trees, saplings, flowers, bamboo, reeds, lotus, rocks, lanterns, hay, stalls, coops, barns, wells, pavilions, and docks.
- Reduced decorative clutter around routes and clearings across the field, coop, market, village, lake, and visited-farm scenes. Player-placed tree props now use the same pixel renderer as the static landscape.
- Grouped the 12 main field plots into three compact columns around the existing open route to the north and south. Plot indexes and crop state stay unchanged; the four-column expansion parcels remain in their existing coordinates.
- Locked parcels now read as future orchard/meadow space with stone corner markers and short grass. This is background-only and adds no collision blocks.
- Reworked the workshop’s center into a single workbench with a clear entry aisle. Kept the workshop action point, bedroom interaction, scene bounds, water and exits stable.
- See `docs/BACKGROUND_REDESIGN_DRAFT_V1.md` for the approved layout rationale and the V1 scope.

## Scene background art correction V2 2026

- Replaced the flat Canvas reconstructions in the eight playable scenes with authored high-resolution scene art in `public/pixel/scene-backgrounds-concept-v1.png`, `public/pixel/scene-backgrounds-environments-v1.png`, and `public/pixel/scene-background-homestead-v1.png`.
- The first atlas follows the approved bedroom, workshop, village-square, and farmyard concept. The environment atlas supplies the market, coop, lake, and neighbor courtyard. The full-size homestead plate leaves the expansion meadow visible beyond the starter plots.
- Atlas regions and scene-to-art mapping are centralized in `public/pixel/scene-backgrounds.mjs`. Dynamic crops, livestock, characters, helper actors, unlocked parcels, and weather effects remain runtime layers; baked buildings and border trees are suppressed to avoid double drawing. Hotspots, collisions, and stored plot IDs remain owned by `world-layout.mjs` and `land.mjs`.
- Aligned the homestead path, house door, starter beds, and pond docks to the production illustration while keeping saved crop IDs and the starter pond's six-slot capacity stable.
- Original high-resolution masters are kept under `docs/assets/`. Check each scene at the 640 × 384 pixel viewport before accepting further revisions; do not substitute procedural rectangles for an approved production scene.
- Verification: `node --test` (95 passed), syntax checks for both world modules, and `npm.cmd run build` passed.
- Verification: `node --test` (94 passed) and `npm.cmd run build`.

## Farmer action sprites 2026

- Added full-body action atlases for both avatars: watering, applying fertilizer, spraying crops, harvesting, and feeding livestock. Each atlas has four frames per action, four directions, 48 × 64 runtime cells, and real RGBA transparency.
- The spray action uses a handheld pressure tank, pump handle, wand, and changing mist burst across its four frames; its prop and effect stay attached to the full-body sprite in every direction.
- The planting action uses a seed pouch and a four-beat scattering motion, with seeds landing beside the farmer. Both planting and spraying replace the old separate Canvas prop drawing while active.
- Tools and action details are part of the sprite cells. The renderer switches to these full-body frames while the action timer runs, avoiding a second arm or a separate Canvas tool overlay. Hoeing, planting, and fishing keep their existing animation paths.
- Runtime atlases are `public/pixel/farmer-action-atlas-v1-female.png` and `public/pixel/farmer-action-atlas-v1-male.png`. Their 4× nearest-neighbor masters are in `docs/assets/`; the approved concept remains at `docs/assets/farmer-action-design-sample-v1.png`.
- Regenerate the atlases with `npm run pixel:farmer-actions`. Metadata and action timing are in `public/pixel/frames.mjs` and `public/world-motion.mjs`.

## Late-game crops and coop polish 2026

- Replaced the V3 runtime progression crop atlas with the approved V4 sheet for coffee, lotus, dragon fruit, and black sticky rice. V1–V3 remain available for comparison; the runtime atlas uses sixteen 48 × 48 RGBA cells and per-stage silhouette bounds.
- The cleaned 4× source and 4× nearest-neighbor comparison sheet are `docs/assets/progression-crops-v4-source.png` and `docs/assets/progression-crops-v4-preview.png`. The raw generated master is retained separately for future revisions.
- Regenerate V4 with `npm run pixel:progression-art`. This invokes `scripts/normalize-progression-crops-v4.py` and writes the atlas, frame metadata, source sheet, and comparison preview.
- Crop weather profiles affect each variety's growth and yield; accumulated exposure remains stable when crop progress is projected in smaller time intervals.
- Repositioned the main-coop rows so quails fit inside the rear and front rails. Their runtime size is 23 × 21 world units, and the front fence draws over only the feet. Automated layout coverage checks sixteen seats.

## Livestock style unification 2026

- Replaced the mismatched emoji/legacy illustrations for chicken, dairy cow, quail, and water buffalo with a shared atlas drawn to the sheep's rounded silhouette, warm outline, and upper-left light.
- The atlas has four 56 × 48 poses per species: idle, alternating walk poses, and feeding. Canvas animation and coop/shop illustrations read from the same source, so the UI and world no longer show different art for the same animal.
- Runtime output is `public/pixel/progression-livestock-v2.png`; the 4× master and sheep-reference comparison are `docs/assets/progression-livestock-v2-source.png` and `docs/assets/progression-livestock-v2-preview.png`. The original generated master is retained for revisions.
- Regenerate the atlas with `npm run pixel:livestock-art`. Pose metadata is in `public/pixel/progression-livestock-frames-v2.mjs` and is loaded through `public/pixel/frames.mjs`.
### Livestock and crop item illustrations

- Added pig and duck idle, alternating walk, and feed sprites using the approved sheep as the style reference. Runtime art is in `public/pixel/additional-livestock-v1.png`, with a transparent 4× master in `docs/assets/additional-livestock-v1-source.png` and comparison sheet in `docs/assets/additional-livestock-v1-preview.png`.
- All ten farm animals now have authored pixel illustrations in both the farm scene and animal cards. Crop produce and seeds use the crop's mature atlas frame in inventory, market, orders, and workshop recipe ingredient links; fish illustrations remain on the existing aquatic atlas.
- Regenerate pig/duck art with `npm run pixel:additional-livestock-art`.

### Homestead layout V2
Approved layout, separate dynamic soil, two-column expansion parcels, authored alpha shelter and pond sprites: see [HOMESTEAD_LAYOUT_V2.md](HOMESTEAD_LAYOUT_V2.md). Runtime comparison images and export steps are recorded there. Saved parcel IDs and aquatic capacity are preserved.

### Homestead buildings V3
Dedicated workshop art at 110 × 88 world units and a wide two-stall parcel shelter at 80 × 44 replace the undersized shared building. Shared layout metadata aligns doors, collisions and animal movement bounds. Source masters, export script and native viewport previews are recorded in HOMESTEAD_LAYOUT_V2.md.

### Homestead usability V4
Expanded parcel livestock yards preserve the central lane; animals have larger bounded movement. Repositioned all thirteen decoration spots, removed pond fences and ambient chicken, and removed map exit markers/hit targets while retaining click navigation. See HOMESTEAD_LAYOUT_V2.md and homestead-usability-runtime-v4.png for verification.

### Homestead road and pond dock V5
Moved beds 13–30 and their fence south of the painted road, adjusted expansion-row spacing, anchored decoration feet to the atlas alpha baseline and relocated northern props onto usable ground. Added an authored transparent pond jetty with shore-facing placement. See HOMESTEAD_LAYOUT_V2.md and homestead-road-dock-runtime-v5.png.

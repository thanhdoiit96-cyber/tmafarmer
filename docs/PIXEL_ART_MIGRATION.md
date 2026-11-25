# Kế hoạch chuyển đổi Pixel Art

### Đàn vật nuôi Chuồng trại V9

Đã thay bước tại chỗ bằng đi giữa các vị trí trống, đổi hàng/đi chéo khi có
chỗ, nghỉ và ăn lệch nhịp. Dùng pose đã có, không tạo hoặc sửa atlas.
Hotspot/marker theo vị trí thật; con được chọn dừng để người chơi tiếp cận.
[Chi tiết](COOP_LAYOUT_V8.md), [GIF Canvas thật](assets/coop-motion-runtime-v9.gif).

### Chuồng trại V8

Đã căn lại scene theo [bố cục V8](COOP_LAYOUT_V8.md): plate riêng cùng phong cách,
hai sân trống hai bên lối đi, 16 vị trí vật nuôi, cổng xuất phát phía trước và
collision theo background. Giữ world480×288/viewport640×384, atlas/animation,
sức chứa và dữ liệu vật nuôi. Tỷ lệ hiển thị riêng chỉ áp dụng tại Chuồng trại.
Nguồn `docs/assets/coop-scene-v8-source.png`, xuất bằng
`scripts/normalize-coop-v8.py`. [Ảnh Canvas](assets/coop-viewport-v8.png).

### Khu mở rộng V7

Đã triển khai [bố cục tám mảnh cân đối](HOMESTEAD_LAYOUT_V2.md): nền nam riêng
được vẽ theo concept đã duyệt, giữ nguyên nền/landmark phía trên, ao có alpha
và tỷ lệ mới. Vườn hỗ trợ nâng cấp3→6 luống mà giữ ID cũ; chuồng có sân sâu hơn.
Source nằm trong `docs/assets`, runtime trong `public/pixel`, xuất bằng
`scripts/normalize-expansion-v7.py`. [Ảnh runtime toàn cảnh](assets/expansion-runtime-v7.png).

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

### Homestead life and composition V6
Added authored animated dog/cat companions and the existing chicken poses on continuous yard routes. Decorations now have semantic clusters, recommended slots and a free arrange action. Tightened crop spacing and split front fences into depth-sorted sprites. Source masters, export workflow, Canvas screenshot and animation GIF are documented in HOMESTEAD_LAYOUT_V2.md.

### Village lake well V1
Replaced the unlocked public well's procedural drawing with authored transparent stone-and-tile art. Moved its foot onto the grassy shore and aligned the drinking hotspot and collision with the south path. Other wells retain their existing appearance. Source, export script, Canvas previews and validation are recorded in VILLAGE_WELL_V1.md.

### Village market V1
Added authored shoppers with independent foreground strolls and a tiled wooden order board. Aligned shop interaction points and solid footprints with the background, removed an obsolete pond collider, and retained order and trade rules. See MARKET_LAYOUT_V1.md for sources, prompts, export workflow, Canvas preview and verification.

### Neighbors village V1

Implemented the approved `assets/neighbors-concept-v1.png` with a dedicated background, five transparent home-and-garden variants and an unlockable pavilion. Six equal slots per area support twelve residents over two pages, shared between Canvas and cards. Owner names are always displayed on front gates with measured, grapheme-safe ellipsis; full names remain in cards. Own home has a `Bạn` badge. Home art follows existing strict total-wealth thresholds (>500, >1000, >5000, >20000), while farm rank is shown separately. Cards use the same authored house atlas as Canvas.

Layout metadata and pagination live in `public/neighbors-layout.mjs`, packaged for both browser and worker. The world is 720 × 432; native viewport remains 640 × 384 with existing camera movement. Shared entry points align arrivals from the farm, coop and visited gardens. Solid footprints keep gate interaction positions clear. Old baked houses/pavilion and legacy puddle colliders are replaced for this scene.

Sources, exact generation prompts and export dimensions: `assets/neighbors-production-v1.json`. Re-export with `py scripts/normalize-neighbors-v1.py`. Actual Canvas captures: `assets/neighbors-runtime-v1.png`, `assets/neighbors-runtime-page2-v1.png`, `assets/neighbors-viewport-v1.png`. Browser verification covered twelve residents, both pages, shared card portraits, mobile width 390 without horizontal overflow, and successful `world.approach()` callbacks at own home, neighbor gate and unlocked pavilion. `test/neighbors-layout.test.mjs` covers identity/pagination, all gates with/without pavilion, exact wealth boundaries and Vietnamese/emoji names.

### Garden fences V1
Replaced thin procedural rails with authored honey-wood, warm ivory and bamboo modules matching the neighboring homes. Horizontal rails repeat between post centers to avoid doubled end posts; side modules retain narrow silhouettes. Low 10.5-unit fences preserve crop visibility, central gate widths and front-edge depth sorting. Field and visited gardens share the renderer; existing saved styles, prices, garden sizes, interactions and capacity are unchanged. Source, exact prompt, atlas layout and actual 640 × 384 screenshots are recorded in `assets/garden-fences-v1.json`. Re-export with `py scripts/normalize-garden-fences-v1.py`.

### Crop-bed grass V2
Replaced sparse pixel marks with four authored layered grass variants. Four 13–15-unit clusters decorate each bed's corners with stable variation and mirroring, drawn before crops to keep produce readable. Empty plots and mature crops were inspected on the native Canvas. Source, exact prompt, export script and runtime screenshots are recorded in `assets/plot-edge-grass-v2.json`. All 122 tests and the production build pass.

### Farmer ages V1

Added four authored Vietnamese farmer variants (middle-aged and elderly, female and male) alongside the two original young farmers. Each variant includes four-direction idle, walk, hoe, water, fertilize, spray, sow, harvest and feed frames. Gender and age can be selected during registration, village entry or in-game appearance changes. Existing avatar IDs and farm progress remain compatible. See [FARMER_AGES_V1.md](FARMER_AGES_V1.md) for source art, export rules, persistence scope and verification. All 128 tests and the production build pass.

### Crop care icons V1

Replaced generic plot task marks with four authored symbols: harvest basket, caterpillar, rooted weed and water drop. Canvas markers, task cards and crop action buttons share `pixel/crop-care-icons-v1.png` (four 32 × 32 RGBA cells). Priority and gameplay rules remain unchanged; animal/pond tasks retain their existing marks. Removed the redundant ground-level Cỏ text badge while retaining actual weed clusters. Generated transparent master: `assets/crop-care-icons-v1-source.png`; re-export using `py scripts/normalize-crop-care-icons-v1.py`. Integer-zoom preview: `assets/crop-care-icons-v1-preview.png`; actual renderer comparison on the farm: `assets/crop-care-icons-v1-canvas.png` (comparison overlay, not shipped UI). Checked syntax, all 128 tests and production build.

### Garden HUD refinement V2

Removed the opaque white/cream plate and shadow from the four crop-care map symbols; their authored transparent silhouettes and dark outlines remain. Garden/visited-garden painted terrain is cached at 86% saturation and 98% brightness, including its expansion, while crops, actors and effects keep their original colors. Mini map width is reduced to 78px desktop / 48px mobile (52px narrow non-mobile layout), with 72% group opacity and a lighter frame. No collision, camera or task-priority changes. Actual Canvas comparison: `assets/crop-care-icons-v2-canvas.png`; game capture: `assets/garden-quiet-ui-v2.png`; desktop HUD: `assets/garden-quiet-ui-v2-desktop.png`. Syntax, 128 tests and production build pass.

### Crop marker alignment V3

Removed the legacy +17 horizontal offset: task symbols now sit on the plot centerline, retaining canopy clearance. Reduced their footprint from 16 to 14 world units, removed pale circles from fallback marks, and removed task-card backing colors around authored icons. Versioned the atlas URL to refresh cached images. Actual farm capture: `assets/crop-care-centered-v3.png`. The crop-layout test now checks centered task anchors for every species and growth stage; all 128 tests and build pass.

### Crop marker contrast V4 — approved option C

User approved B or C after reviewing `assets/crop-care-marker-options-v4.png`; implemented C to preserve more of the scenery. The four crop-care map icons share a 9-world-unit circular backing (`#3c38254d`, approximately 30% opacity), a thin 0.75-unit warm ivory rim (`#f4dfabcc`), and the existing 14-unit authored icon. The icon and ring share a snapped center, retaining V3 plot alignment and canopy clearance. No opaque white plate; task priority, farm rules and mini map settings remain unchanged. Actual Canvas capture: `assets/crop-care-option-c-runtime-v4.png`. Clean browser reload reported no exceptions; syntax check, all 128 tests and production build pass. The HTML comparison remains documentation only.

### Dry soil and animal task art V1 — 25/11/2026

Replaced the pale procedural overlay on compacted empty beds (the existing needs-tilling state) with an authored 64 × 42 RGBA tile: warm ochre soil, three furrows, granular clods and branching cracks, registered to the same 40 × 26 world footprint. Ordinary planted/dry/wet soil and the eight-hour compaction rule remain unchanged. Edge grass stays on its existing layer.

Added a two-cell 32 × 32 animal-task atlas: bamboo basket with egg/milk/wool for ready products, terracotta grain bowl for hunger. All animal species use these icons on the map and task list; feed/collect buttons share the same art. Map badges retain approved option C, with 14-unit art and a thin warm rim over a translucent dark circle. Movement, feeding, yields, task priority and the one-time livestock rules remain unchanged.

Masters and exact prompts: `assets/soil-animal-ui-v1.json`, `assets/soil-dry-v1-source.png`, `assets/animal-task-icons-v1-source.png`. Export: `py scripts/normalize-soil-animal-ui-v1.py`. Runtime: `public/pixel/soil-dry-v1.png`, `public/pixel/animal-task-icons-v1.png`. Integer zoom: `assets/soil-animal-ui-v1-preview.png`. Actual renderer comparison: `assets/soil-animal-ui-v1-canvas.png`; game captures: `assets/soil-dry-v1-runtime.png`, `assets/animal-task-icons-v1-runtime.png`.

Verified real Canvas field/coop views at 640 × 384; both PNGs have hard alpha, padding and correct cells; ready/hungry tasks resolve from a real farm snapshot. All 128 tests, syntax checks, asset audit and production build pass; both new assets return HTTP 200 from the packaged worker.

### Needs-tilling task icon V1

Replaced the generic plus mark for compacted empty plots with an authored Vietnamese hoe: warm wooden handle, perpendicular muted-steel blade and a small earth clod. Shared 32 × 32 hard-alpha PNG serves the map, task list and till action button. Retains centered plot placement, 14-unit art and the approved translucent circular badge C; compaction rules and work animation are unchanged.

Source/prompt: `assets/till-task-icon-v1.json`, `assets/till-task-icon-v1-source.png`. Export: `py scripts/normalize-till-task-v1.py`. Runtime: `public/pixel/till-task-icon-v1.png`. Integer-zoom preview: `assets/till-task-icon-v1-preview.png`; real farm capture: `assets/till-task-icon-v1-runtime.png`. Verified all six compacted plots resolve to the till icon from a real snapshot; native Canvas, asset audit, syntax, 128 tests and production build pass.


## 25/11/2026 — Mục tiêu tiếp theo V1

Scene background tone V1: phủ trung tính `#8d917b` ở mức 7,5% lên riêng nền vẽ sẵn của tám scene (kể cả vườn ghé thăm), giảm nhẹ tương phản và độ rực. Giữ xử lý màu Vườn nhà đang có. Pass nằm trong cache terrain, trước cây/nhân vật/vật nuôi/UI, không sửa PNG gốc hoặc tọa độ. Dùng alpha compositing, không thêm phụ thuộc Canvas filter cho bước làm dịu mới. Cấu hình ở `public/pixel/scene-backgrounds.mjs`. [Bảng kiểm tra tám nền bằng renderer thật](assets/scene-background-tone-v1.png). 145 kiểm thử và build đạt; render tám nền không có lỗi JavaScript.

UX-GAME-02: thay danh sách hạt bằng ô vật phẩm 3 cột ảnh lớn; áp dụng cùng cách trình bày cho vật nuôi và thẻ quản lý. Mục tiêu ghim thu gọn và chỉ hiện trong Việc cần làm. Dùng lại atlas đã duyệt, không tạo ảnh thay thế. Vùng va chạm/click nhà–kho–xưởng căn theo nền hiện tại; không sửa nền/ID ô. Ảnh và phạm vi kiểm thử [GAME_UI_V2.md](GAME_UI_V2.md).

UX-SEED-01: thiết kế lại bộ chọn giống bằng thẻ một dòng với atlas cây trưởng thành hiện có; tách nhóm mở/khóa, trạng thái hết hạt và nút Gieo. Giữ màu giấy kem/xanh, trạng thái khóa nâu có chữ, không thay nguồn ảnh hay Canvas. Ảnh desktop/hover/mobile ngang/dọc và kiểm chứng trong [SEED_PICKER_V1.md](SEED_PICKER_V1.md).

P1.1 bổ sung thẻ tóm tắt quay lại gồm ba dòng có thể chạm, dùng palette và font hiện tại trong bảng công cụ. Không thêm ảnh/sprite hoặc overlay Canvas. Ảnh desktop/mobile và phạm vi ở [RETURN_SUMMARY_V1.md](RETURN_SUMMARY_V1.md).

Tiếp nối P0.3: hộp chỉ dẫn mở khóa dùng hộp chi tiết, palette và ảnh minh họa hiện có. Không đổi atlas hoặc Canvas. Ảnh desktop/mobile và kiểm chứng trong [UNLOCK_GUIDANCE_V1.md](UNLOCK_GUIDANCE_V1.md).

Triển khai thẻ HTML/CSS theo phác thảo đã duyệt, dùng bảng tác vụ và palette hiện có. Ảnh runtime desktop/dọc/ngang trong [biên bản V1](NEXT_GOAL_V1.md). 134 bài kiểm thử, build và kiểm tra asset đạt.

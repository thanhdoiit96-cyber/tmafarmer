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
- Camera dùng vùng an toàn ở giữa khung hình và chỉ cuộn khi nhân vật ra khỏi vùng này. Cảnh mới và đổi kích thước khung hình căn ngay lập tức; vị trí camera tiếp tục được snap theo lưới raster để tránh rung/mờ pixel.
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

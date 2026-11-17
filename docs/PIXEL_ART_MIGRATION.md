# Kế hoạch chuyển đổi Pixel Art

Tài liệu này là nguồn theo dõi chính cho việc chuyển phần thế giới Canvas của **Vườn Mùa Vui** sang pixel art. UI HTML, luật game, tọa độ gameplay và dữ liệu lưu được giữ độc lập với quá trình đổi hình ảnh.

## Quyết định đã chốt

- Chuyển thế giới trong Canvas sang pixel art; giữ UI HTML sắc nét để chữ tiếng Việt dễ đọc.
- Hướng nghệ thuật: cozy pixel art Việt Nam, mái ngói, tre, gỗ màu mật ong, cây nhiệt đới và ánh sáng ấm.
- Tỷ lệ khung hình giữ ở `5:3`.
- Vườn nhà ở chế độ Pixel render trực tiếp ở `640 × 384`. Tỷ lệ từ gameplay `480 × 288` là `4/3`. Sprite 2× giữ nguyên kích thước trên bản đồ và tăng số điểm ảnh thể hiện chi tiết.
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
- [x] Thay bước thu nhỏ bản đồ cuối mỗi frame bằng Canvas `640 × 384`. Nút Pixel dùng cùng lựa chọn đã lưu trước đây.
- [x] Dùng cùng renderer và atlas nhân vật ở Vườn nhà, Nhà vườn, Chuồng, Chợ, Hàng xóm, Hồ làng, vườn ghé thăm và Xưởng máy. Nhà hàng xóm dùng chung sprite với nhà vườn, có chi tiết riêng theo cấp.
- [x] Thay nền ở cả tám cảnh bằng bộ vật liệu V3. Tách màu Vườn nhà và vườn ghé thăm, lát quảng trường chợ, thêm thảm sân rơm ở chuồng, đường ven hồ, ván và chiếu trong nhà, sàn đá trong xưởng. Mặt bằng chơi và điểm tương tác vẫn lấy từ dữ liệu bản đồ.
- [x] Căn lúa, cà rốt và bắp theo phần hình nhìn thấy, đặt biểu tượng công việc trên tán cây. Thêm con trỏ và vòng đánh dấu đích tự tìm đường.

Ảnh vật liệu gốc ở `docs/assets/terrain-materials-v3-source.png`. Tấm chất liệu tạo từ concept Vườn Mùa Vui theo lưới 4 × 2, nhìn thẳng từ trên xuống, gồm cỏ vườn, cỏ rợp, đá lát, bờ hồ, ván gỗ, đá phiến, sân rơm và sỏi đường. Atlas chạy game là `public/pixel/terrain-materials-v3.png` với tám ô 128 × 128. Renderer lật đối xứng từng ô khi lặp texture để liền mép.

## Nhịp di chuyển và hướng sprite

- Nhân vật có bốn khung toàn thân cho mỗi hướng đi, gồm hai tư thế chạm gót và hai tư thế chuyển chân. Canvas vẽ nguyên khung với cùng kích thước ô và mốc chân; nhịp đi tính theo quãng đường. Người chơi, người cùng khu và NPC dùng cùng bộ bước ở cả hai chế độ hiển thị.
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

`world.mjs` giữ camera và gameplay. Một renderer pixel mới sẽ đọc atlas/metadata và vẽ vào virtual canvas. Renderer hiện tại được giữ trong quá trình chuyển đổi để so sánh và rollback.

## Tiêu chí nghiệm thu vertical slice

- Nhân vật, nhà, cây và gà đọc rõ ở kích thước mobile nhỏ nhất.
- Không có pixel mờ hoặc rung khi camera di chuyển.
- Tất cả sprite dùng cùng mật độ pixel và hướng sáng.
- Mưa, sương và bóng không làm mất silhouette.
- FPS không giảm so với renderer hiện tại.
- Bật/tắt renderer không làm thay đổi trạng thái game.

## Các bước kế tiếp

1. Chuyển terrain Vườn nhà sang tileset theo mật độ 2×.
2. Chuyển mưa, sương và ánh sáng sang hiệu ứng pixel.
3. Bổ sung animation công việc riêng cho tưới, cuốc, gieo và thu hoạch.
4. Chuyển dần phông nền và đạo cụ đặc thù từng cảnh sang atlas pixel riêng.

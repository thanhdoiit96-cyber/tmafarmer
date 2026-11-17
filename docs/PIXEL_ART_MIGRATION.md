# Kế hoạch chuyển đổi Pixel Art

Tài liệu này là nguồn theo dõi chính cho việc chuyển phần thế giới Canvas của **Vườn Mùa Vui** sang pixel art. UI HTML, luật game, tọa độ gameplay và dữ liệu lưu được giữ độc lập với quá trình đổi hình ảnh.

## Quyết định đã chốt

- Chuyển thế giới trong Canvas sang pixel art; giữ UI HTML sắc nét để chữ tiếng Việt dễ đọc.
- Hướng nghệ thuật: cozy pixel art Việt Nam, mái ngói, tre, gỗ màu mật ong, cây nhiệt đới và ánh sáng ấm.
- Tỷ lệ khung hình giữ ở `5:3`.
- Độ phân giải production đã chốt: `320 × 192`. Tỷ lệ quy đổi từ gameplay `480 × 288` là `2/3`, đủ chỗ cho nhân vật 24 × 32 pixel và phóng nguyên 3× lên 960 × 576.
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
- [x] Tạo atlas nhân vật production RGBA có alpha thật và cell cố định; bản thiết kế chi tiết v2 đang dùng tại `public/pixel/characters-v2.png`, v1 được giữ để so sánh.
- [x] Thay nhân vật Vườn nhà bằng sprite sheet frame-based `idle`, `walk`, `work`.
- [x] Thay nhà, lúa mì, cà rốt, bắp và gà bằng atlas thiết kế chi tiết `public/pixel/vertical-slice-v2.png`; giữ v1 để so sánh.
- [x] Thêm skill `.agents/skills/game-pixel-art/SKILL.md` để các asset sau giữ cùng art direction và chuẩn atlas.
- [x] Chốt độ phân giải production `320 × 192`, phóng nearest-neighbor theo tỉ lệ nguyên khi kích thước màn hình cho phép.

## Đánh giá concept v1

Concept đã chốt được bảng màu và bản sắc: nón lá, nhà gỗ mái ngói đỏ, màu cây xanh lúa và bóng teal. Ảnh hiện chỉ dùng làm reference vì công cụ tạo ảnh chưa xuất nền alpha sạch và cell grid chưa đủ chính xác để cắt tự động. Không dùng trực tiếp concept làm atlas runtime.

Prompt gốc thuộc nhóm `stylized-concept`, tạo bằng built-in image generation:

> Production reference sprite sheet cho game nông trại pixel art Việt Nam, gồm nông dân bốn hướng, nhà gỗ mái ngói, lúa mì/cà rốt/bắp bốn giai đoạn và gà; palette giới hạn, ánh sáng trên trái, cạnh pixel cứng, không chữ và không UI.

## Chuẩn asset production

| Nhóm | Cell đề xuất | Frame tối thiểu |
| --- | ---: | --- |
| Nhân vật | `24 × 32` | idle 4, walk 6 mỗi hướng |
| Gà | `24 × 24` | idle 4, walk 4, peck 4 |
| Cây trồng | `24 × 24` | 4 giai đoạn mỗi loại |
| Nhà | `96 × 80` | 1 ảnh + lớp đèn/khói tùy chọn |
| Hiệu ứng | `16 × 16` hoặc `32 × 32` | 4–8 frame |

Quy tắc:

1. Tọa độ và kích thước là số nguyên.
2. Không scale lẻ từng sprite ở runtime.
3. Không dùng blur hoặc gradient mềm trong atlas.
4. Mỗi vật liệu có ramp sáng/tối riêng; tránh viền đen tuyệt đối.
5. Chừa gutter tối thiểu 2 pixel giữa các cell.
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

1. Chuyển terrain Vườn nhà sang tileset 16 pixel.
2. Chuyển mưa, sương và ánh sáng sang hiệu ứng pixel.
3. Bổ sung animation công việc riêng cho tưới, cuốc, gieo và thu hoạch.
4. Đánh giá vertical slice trước khi chuyển Chợ, Chuồng, Hàng xóm, Hồ và Xưởng máy.

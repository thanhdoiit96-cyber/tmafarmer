# Chuồng trại V8 — căn bối cảnh và lối vào

## Vấn đề và kết quả

Tọa độ cũ x=113–296, y=127–190 dùng sân chuồng của bố cục cũ. Trên background
mới, các con ở hàng sau bị đặt lên vách/cửa nhà và hàng rào; bố cục một cụm
lấn sang đường giữa. Spawn và arrival vẫn ở [29,220], bên hông bản đồ.

V8 giữ viewport 640 × 384 và world 480 × 288. Plate riêng có nhà phía sau,
hai sân rơm rộng, lối đá/cửa/cổng thẳng trục x=240. Giỏ thức ăn đặt sát nhà,
không nằm trong vùng di chuyển của vật nuôi. Không kéo dài scene hoặc đổi zoom.

- Tất cả đường vào từ nav, Vườn nhà và Hàng xóm dùng cổng [240,268], mặt hướng
  lên. Các scene khác vẫn có hướng spawn cũ. Điểm ra nằm ở lối cổng phía dưới.
- `public/coop-layout.mjs` là nguồn chung: cửa, điểm thức ăn, sân, 16 vị trí,
  khoảng đi lại và tỷ lệ hiển thị riêng tại Chuồng trại. Các vị trí xen kẽ hai
  sân, mỗi sân tối đa 8 con, hai hàng tại y=172/214. Nâng cấp không dồn lại các
  vị trí cũ; không xếp lên nhà hoặc lối giữa.
- Biên sân trái [35,141,180,82], sân phải [265,141,180,82]. Vật nuôi lớn hiển
  thị ở tỷ lệ .82 và đi ngang ±2; gà/vịt/cút tỷ lệ1.1 và đi ±8. Cả 16 trâu
  trưởng thành hoặc 16 chim cút đều giữ trọn hình trong sân, không chồng thân.
  Atlas, pose và animation đã có vẫn dùng chung; Vườn nhà giữ nguyên tỷ lệ cũ.
- Collision theo nhà và hai đoạn hàng rào trước/sau, chừa lối giữa để nhân vật
  đi qua cổng rồi rẽ vào sân qua `world.approach()`. Không còn vùng nước/vật
  cản của bối cảnh chuồng cũ.
- Bỏ hàng rào vẽ đè theo `basePen` cũ. Nền sở hữu hình nhà, thức ăn, hàng rào;
  foundation cũ cũng được ẩn để không đè mảng nâu lên nền khi chưa mở chuồng.
  Metadata trang trí cũ vẫn giữ, không ghi lại dữ liệu người chơi.
- Sức chứa, chỉ số `farm.pens`, ID, tuổi, thức ăn và sản phẩm không đổi.
  Bounds presence và worker đóng gói dùng cùng module bố cục.

## Mỹ thuật

Nguồn: `assets/coop-scene-v8-source.png`, tạo bằng built-in imagegen.
Tham chiếu: phần Chuồng trại ở góc trên phải của
`public/pixel/scene-backgrounds-environments-v1.png`.

Prompt set: chỉ scene chuồng, giữ mái rơm/nhà gỗ ấm, đèn lồng, cây chuối,
hoa và ánh sáng trên-trái theo reference; hai sân rơm trống rộng hai bên
đường đá giữa, cổng/cửa nhà cùng trục, giỏ thức ăn phía sau rào sát nhà,
không máng chắn sân, không vẽ sẵn con vật/nhân vật/chữ/UI.

Xuất bằng `py scripts/normalize-coop-v8.py` thành
`public/pixel/scene-background-coop-v8.png` (960 × 576 RGB).
Atlas môi trường cũ vẫn giữ vì các scene khác còn dùng và để đối chiếu.

## Kiểm chứng

- [Canvas toàn cảnh](assets/coop-runtime-v8.png),
  [viewport 640 × 384](assets/coop-viewport-v8.png),
  [đủ 16 trâu trưởng thành](assets/coop-buffalo-capacity-v8.png).
- Browser: xuất phát [240,268], facing up. `world.approach('animal',1)` đến
  [375,172], callback chạy, không resource404 hoặc lỗi JavaScript.
- UI thật chế độ demo, vật nuôi index0: Cho ăn đi từ cổng tới [105,172],
  feed10→9 và thời gian đã cho ăn được lưu. Thu hoạch cũng đi tới con vật
  trước khi thực hiện, trứng0→3. Dùng luồng tương tác hiện có, không gọi tắt.
- Kiểm tra chuồng chưa mở: không có foundation cũ che background.
- Regression: mọi arrival về cổng, mọi hotspot có đường đến; thân 16 trâu/cút
  được kiểm tra suốt nhiều chu kỳ đi/ăn, tính cả pixel snapping; giữ metadata
  và vật nuôi; điều chỉnh test cũ từ biên sân cũ sang hai sân của plate mới.
- Kết quả cuối: **111/111 test đạt**, build thành công. Worker đóng gói import
  được `coop-layout.mjs`, trả200 cho module và PNG mới; fixture QA đã xóa và
  trả404, không đi vào bản build.

Chưa commit/push/deploy trong bước sửa scene này.

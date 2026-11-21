# Vườn nhà: bố cục đã duyệt và triển khai V2

Người dùng đã duyệt `assets/homestead-layout-approved-v2.png` trước khi triển khai.
Ảnh concept là mục tiêu bố cục; ảnh `assets/homestead-runtime-v2.png` là kết quả
dựng bằng renderer thật, với dữ liệu kiểm tra ban đầu và mở rộng tối đa.
`assets/homestead-runtime-native-v2.png` cho thấy hai vùng nhìn 640 × 384.

## Bố cục và dữ liệu

- Giữ world 820 × 640, nhà/kho/giếng/ao lớn và đường đá của background.
- Nền V2 bỏ 12 luống và cọc được vẽ sẵn. Chỉ các luống thực sự đã mở mới được
  vẽ động. Đất lấy mẫu từ artwork gốc, cây dùng atlas hiện có; đất ẩm và đất chai
  vẫn phản ánh trạng thái trò chơi.
- Vườn chính có tối đa 12 luống theo 3 cột × 4 hàng, tâm bắt đầu (255, 96),
  khoảng cách (45, 40). Tài khoản mới vẫn có 6 luống theo cơ chế hiện hành.
- Game hiện có tối đa 30 luống, vượt số luống minh họa trong concept. 18 luống
  tăng thêm dùng 6 cột × 3 hàng phía dưới vườn chính, từ (255, 280), bước (45, 28).
- Tám ô mở rộng dùng 2 cột × 4 hàng, từ (260, 365), bước (246, 58), mỗi ô
  190 × 48. Khoảng trống giữa hai cột là lối đi; các ô nằm trong vùng cỏ,
  cách đường đá và cây ở mép bản đồ. Ô chưa mở chỉ có cọc, cỏ và hoa thấp.
- Giữ nguyên ID luống, ID ô đất, quyền sở hữu, chi phí, cây/vật nuôi và dữ liệu
  đã lưu. Ao chính vẫn chứa 6, ao mở rộng vẫn chứa 2, chuồng mở rộng vẫn chứa 2.
- Đồng bộ điểm tương tác với vị trí mới. Ao nhỏ có đích phao rõ ràng bên trong
  mặt nước. Cầu ao nhỏ nằm gọn ở bờ; chuồng có sprite alpha và hàng rào.
- Xưởng ngoài vườn chuyển sang bãi cỏ phía tây đường chính để không đè lên kho
  hoặc ao; cửa trở về từ scene xưởng cũng cập nhật. Nội thất scene xưởng giữ nguyên.
- Vườn hàng xóm sử dụng cùng hình học để hiển thị đúng dữ liệu của chủ vườn.

## Artwork và xuất bản

Dùng built-in imagegen với nền V1 làm tham chiếu, theo skill game-pixel-art.
Giữ bản gốc, không ghi đè V1:

- `assets/background-homestead-empty-v2.png` → `public/pixel/scene-background-homestead-v2.png`.
- `assets/parcel-shelter-v2-source.png` → `public/pixel/parcel-shelter-v2.png` (96 × 80).
- `assets/parcel-pond-v2-source.png` → `public/pixel/parcel-pond-v2.png` (360 × 80).

Xuất lại hai sprite bằng `py scripts/normalize-homestead-v2.py`: crop theo alpha,
resize riêng từng asset, threshold alpha để không có nền giả hoặc viền mềm.

Prompt nền: sửa tối thiểu ảnh tham chiếu, giữ nguyên kích thước 1448 × 1086,
nhà, kho, giếng, ao, đường và cây viền; chỉ thay 12 luống đất và 8 cọc bằng cỏ
liền mạch; không thêm công trình/cây trồng/chữ. Prompt chuồng: một chuồng gỗ
nhỏ mái ngói cam đỏ, cửa tối và ổ rơm, góc nhìn của kho trong ảnh tham chiếu,
alpha thật, không đất/cỏ/vật nuôi/hàng rào/chữ. Prompt ao: một ao nhỏ ngang dài,
viền đá tròn, nước teal, lá sen và hoa sen hồng, cùng góc nhìn và ánh sáng,
alpha thật, không cảnh nền/cá/cầu/chữ.

## Kiểm tra

Kiểm tra bằng Edge và chính `world-art.mjs`, với dữ liệu fixture, không sửa DB
của người chơi. Chụp cả bản đồ ban đầu, bản đồ tối đa và vùng nhìn native.
Kiểm thử tự động bổ sung kiểm tra 30 luống không đè lên 8 ô, đường đi tới các
điểm tương tác và sức chứa ao không đổi. Test người làm vườn cập nhật theo thời
gian di chuyển mới; test thời tiết vẫn đặt mốc chuyển thời tiết trước khi làm xong.

Chạy `node --test`, `npm.cmd run build`, `git diff --check` trước khi bàn giao.
Ảnh renderer là kiểm tra bố cục tĩnh; không thay thế kiểm tra toàn bộ thao tác
trong phiên chơi thật.

# Góc nhìn toàn cảnh Hồ làng

26/11/2026. Đã sửa source theo yêu cầu thu nhỏ cảnh để nhìn rõ ao; chưa commit/push/deploy.

## Thay đổi

- Hồ làng hiển thị toàn bộ world 720×432 trên Canvas 640×384, thay vùng nhìn 480×288 trước đây: cảnh thu về khoảng 2/3 kích thước cũ, thấy cả hai bến và bờ phía nam.
- Camera cố định trong toàn cảnh ao; nhân vật vẫn di chuyển bằng tọa độ/va chạm cũ. Nền, nhân vật, nước và vật thể dùng cùng scale; không thu riêng background rồi làm lệch điểm tương tác.
- Mobile ngang giữ Canvas tỷ lệ 5:3 và đặt giữa vùng chơi; phần dư dùng nền sẵn có. Không kéo giãn ao theo tỷ lệ màn hình. Pointer quy đổi qua đúng khung Canvas nên chạm/click vẫn trỏ đúng vị trí.
- Ẩn minimap riêng Hồ làng vì toàn cảnh đã hiện đủ. Các scene khác giữ góc nhìn và camera hiện tại.

Trong `world.mjs`, đổi scale khi chuyển cảnh ngay cả khi kích thước bitmap vẫn 640×384; bước này tránh dùng scale ao cho cảnh Vườn nhà hoặc ngược lại. Terrain cache được dựng lại theo scene như cơ chế hiện có.

## Ông Sáu

Cập nhật tiếp nối: [NPC runtime V1](LAKE_ELDER_V1.md) đã hoàn thiện trong source từ mẫu này. Mô tả “chưa thêm NPC” bên dưới là phạm vi của lần sửa camera trước đó.

[Phác thảo V2](LAKE_LIFE_DRAFT_V1.md) cập nhật mẫu NPC riêng bằng imagegen theo skill game-pixel-art: tóc bạc không nón, áo chàm, khăn rằn và giỏ cá. Nguồn RGBA và preview 48×64 nằm trong docs/assets, chưa thêm NPC/atlas/hội thoại vào runtime. Cần xem mẫu thu nhỏ trên nền trước khi hoàn thiện animation và tích hợp.

## Kiểm chứng

186/186 kiểm thử và build đạt; audit tài nguyên không thiếu file, public vẫn 22,63 MiB. Edge/Chromium: toàn cảnh 640×384, tỷ lệ 5:3, không tràn ngang, ẩn minimap, click đúng cầu câu và chuyển Vườn nhà → Hồ làng đạt tại 1100×800, 844×390, 568×320. Đã xem ảnh Canvas thực, không lỗi JavaScript. Chưa thử Safari iOS/Android thật.

Bản mẫu NPC cũng qua thử gần/xa, lời chào thời tiết, tab và chạm trên viewport ngang/dọc; kiểm chứng đó thuộc prototype, không thay thế kiểm tra NPC runtime tương lai. Chưa gửi lời mời pilot hoặc tự suy ra phản hồi người chơi.

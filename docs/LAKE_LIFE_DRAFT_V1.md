# Góc bờ ao — phác thảo mỹ thuật và tương tác V2

Cập nhật tiếp nối: mẫu đã được chọn và tích hợp thành [Ông Sáu runtime V1](LAKE_ELDER_V1.md), có atlas idle riêng; chưa deploy. Những trạng thái chờ duyệt bên dưới ghi lại thời điểm phác thảo.

26/11/2026. V2 theo phản hồi: cần thấy toàn cảnh ao và Ông Sáu phải khác nhân vật người chơi. [Camera toàn ao](LAKE_OVERVIEW_V1.md) đã sửa trong source, chưa deploy; NPC/hội thoại vẫn là bản mẫu chờ duyệt thiết kế riêng. Giữ tên file V1 để các liên kết cũ không hỏng. Tiếp nối [sâu nghịch V1](PRANK_PLAY_V1.md).

[Mở bản mẫu tương tác](assets/lake-life-draft-v1.html). Mở trực tiếp bằng trình duyệt; dùng ảnh nền/atlas sẵn có trong repo, không cần server, không gọi API hoặc lưu dữ liệu. Bản mẫu xem toàn cảnh 720×432 world trên Canvas 960×576; game thực vẫn có camera/viewport riêng.

## Ý tưởng để duyệt

Một ông lão quen thuộc bên bờ ao, tên tạm **Ông Sáu**. V2 dùng mẫu mới: tóc bạc không đội nón, áo bà ba chàm, khăn rằn, quần sẫm, dép và giỏ cá. Silhouette khác nông dân người chơi, không đổi các avatar hiện tại. Ông đứng cạnh lối ven bờ phía nam, mở lời chào ngắn theo thời tiết khi người chơi chủ động tương tác gần. Không tự bật hội thoại, chặn đường hoặc yêu cầu nói chuyện trước khi câu.

Hai lựa chọn trong hội thoại chỉ dẫn tới **Ven ao** và **Sổ cá** đã có. Việc dọn bờ, hai gói đổi, sổ cá, câu và quota giữ nguyên. Ông không phát quà mới, thay thế giếng hoặc giữ hộ tiền/dấu. Chủ yếu tạo một người quen và một lý do có cảm xúc để ghé lại.

## Bố cục theo tọa độ thật

| Điểm | Tọa độ world | Cách xử lý |
| --- | --- | --- |
| Ông Sáu | 260,365 | Đề xuất mới; chân ở mép đường ven bờ, không thêm quầy hoặc rào |
| Người chơi đứng gần trong mẫu | 289,374 | Khoảng cách 30,4, trong tầm tương tác 31; không mô phỏng pathfinding bằng teleport trong game |
| Dọn bờ | 326,350 | Giữ nguyên điểm/runtime V1 |
| Giếng công cộng | 217,339 | Giữ vị trí và điều kiện công trình hiện tại |
| Cầu câu trái | 178,245 | Giữ nguyên |
| Cầu câu phải | 590,245 | Giữ nguyên |
| Lối về | 16,309 | Giữ nguyên |

Đã loại vị trí đầu tiên sát chòi/bờ tây vì bụi sậy che người và hai silhouette chồng nhau khi xem toàn cảnh. Điểm mới cách điểm dọn khoảng 68 world unit, cách giếng khoảng 50; không trùng vùng tương tác của hai điểm này. `walkable` xác nhận NPC và điểm đứng gần đều trên đất. `route` hiện có tìm được đường từ spawn (36,309) đến cả hai; đã kiểm tra lại hai cầu, giếng và chỗ dọn cũng tiếp cận được.

Chưa thêm collision NPC vào runtime. Khi triển khai, NPC phải có hitbox click riêng và khoảng tiếp cận cạnh chân; tránh dùng thân người làm vật cản cứng bịt đường. Nhân vật là sprite động có depth theo chân và animation idle, không bake vào nền. Không thêm marker chữ thường trực; nhãn tọa độ/vòng nét đứt trong mẫu chỉ để duyệt.

## Lời thoại và trạng thái

- Nắng: gợi ý ghé bến và tiện tay giữ bờ sạch.
- Mưa: nhắc đi cẩn thận trên cầu, không hứa phần thưởng/cá hiếm.
- Dông: nói rõ nghỉ thả mới; không khóa việc dọn hoặc sổ cá nếu gameplay hiện tại vẫn cho phép.
- Sương: lời chào chậm rãi, nhắc cá chép vàng khó gặp hơn theo tỷ lệ hiện tại.
- Đứng xa: không mở nút hội thoại. Trong game, click NPC sẽ đi đến gần bằng `world.approach()` rồi mới mở; mẫu chỉ có công tắc gần/xa để duyệt.
- Không có mạng/dữ liệu: lời chào không sinh phần thưởng; nút hoạt động dùng luồng hiện có, máy chủ vẫn quyết định quyền nhận/đổi.

## Tài nguyên và quy trình

Theo [game-pixel-art](../.agents/skills/game-pixel-art/SKILL.md) và imagegen, giữ nền gốc và thiết kế riêng trước khi xuất atlas. Nền dùng `scene-backgrounds-environments-v1.png` khung (0,490,800,480), tint 7,5%; người chơi dùng `farmer-walk-v4.png`.

NPC mới: [nguồn RGBA](assets/ong-sau-npc-source-v1.png), 1145×1374, alpha thật. [Bản xem 48×64](assets/ong-sau-npc-preview-v1.png) lấy bounding box alpha ≥128, thu vừa 44×58, giữ tỷ lệ, đặt tâm ngang 24 và baseline 59, threshold alpha cứng. HTML đặt bản thu nhỏ vào cảnh và có so sánh nguồn với preview 4×. Chỉ là mẫu tĩnh để duyệt, chưa phải atlas idle/walk production. Không đưa ảnh nguồn vào `public`/build game.

Đây là bản xem bố cục trên plate gốc, không phải screenshot gameplay: chưa vẽ mọi actor động/công trình tùy mở khóa, camera hay thời tiết runtime. Sau khi bố cục được duyệt, tích hợp phải so lại Canvas thật, foreground, bóng, đường tiếp cận, người chơi khác và màn hình ngang. Không đổi sprite khác với mẫu hoặc thay nền bằng hình vẽ đơn giản.

## Kiểm chứng bản mẫu

Edge/Chromium: tải đủ ba ảnh nguồn; chuyển hiện tại/đề xuất, gần/xa, lời thoại thời tiết, mở Ven ao/Sổ cá, xem điểm dọn và chạm tab đều đạt. Không lỗi JavaScript hoặc tràn ngang ở 1100×800, 844×390, 568×320, 390×844. Chưa kiểm tra Safari iOS/Android thật. Kiểm tra không gian dùng dữ liệu map hiện tại; chưa chứng nhận hitbox/collision NPC tương lai. Không chạy lại suite/build gameplay vì chưa đổi runtime.

## Tiếp theo sau duyệt

Tích hợp một NPC và lời chào ngắn, dùng atlas hiện có, giữ đường và quyền hoạt động. Kiểm tra approach/keyboard/touch và cảnh đông người trước khi commit. [Kế hoạch pilot](SOCIAL_LAKE_PILOT_V1.md) chuẩn bị riêng; cần người chơi thật, chưa có kết quả pilot.

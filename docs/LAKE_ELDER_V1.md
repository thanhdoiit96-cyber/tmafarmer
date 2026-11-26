# Ông Sáu bên Hồ làng — runtime V1

Cập nhật theo phản hồi: [bố cục/UI V2](LAKE_LAYOUT_UI_V2.md) đã chuyển NPC vào chòi ở mép cỏ, đổi lối vào giữa bờ và lời xưng hô theo tuổi/giới tính. Các tọa độ và lời thoại mặc định trong bản V1 dưới đây là lịch sử.

26/11/2026. Đã hoàn thiện trong source theo mẫu NPC riêng và góc nhìn toàn ao được chọn. Chưa commit/push/deploy.

## Trải nghiệm

Ông Sáu đứng tại (260,365) trên lối ven bờ phía nam, tóc bạc, áo chàm, khăn rằn và giỏ cá. Sprite riêng tách khỏi avatar người chơi; không đổi thiết kế hoặc animation các nhân vật cũ.

Click/chạm thân NPC, hoặc chọn **Gặp Ông Sáu** trong bảng Hồ làng: `world.approach()` đưa nhân vật tới điểm (286,374), sau đó mở hội thoại. Đến gần có thể dùng E hoặc nút Tương tác. Không tự bật hội thoại khi vào cảnh hay khi poll dữ liệu. Điểm đứng nằm bên cạnh NPC, không đứng đè lên người ông; NPC không thêm collision cứng làm tắc đường.

Lời chào ngắn theo cả bảy loại thời tiết hiện có. Dông nhắc nghỉ thả câu mới, sương nhắc chép vàng khó gặp; không hứa cá hiếm hoặc thay đổi tỷ lệ. Hai nút **Việc ven ao** và **Sổ cá** mở đúng mục đã có. Có thể đóng bằng Escape, nút đóng hoặc lời chào tạm biệt. Người chơi không phải nói chuyện để câu/dọn/đổi quà.

Trò chuyện không gọi action kinh tế, không thêm save state, không phát xu/XP/vật tư/dấu hoặc thay quota. Máy chủ vẫn quyết định các hoạt động thật. Vị trí cầu, giếng, điểm dọn, nước và luật di chuyển giữ nguyên.

## Mỹ thuật và xuất atlas

Theo skill game-pixel-art và imagegen, bốn frame idle được vẽ từ [mẫu nhân vật đã chọn](assets/ong-sau-npc-source-v1.png), không vẽ đè tay/chắp dụng cụ bằng code. [Nguồn idle RGBA](assets/ong-sau-idle-source-v1.png) gồm bốn ô ngang; [bản xem 4×](assets/ong-sau-idle-review-v1.png) phóng nearest-neighbor.

- Runtime: `public/pixel/ong-sau-idle-v1.png`, 192×64 RGBA, bốn ô 48×64, alpha chỉ 0/255.
- `scripts/normalize-ong-sau.py`: threshold alpha nguồn ≥128, dùng một crop hợp nhất cho cả bốn frame, thu cùng tỷ lệ vào 44×58, tâm ngang 24, baseline 59. Không fit riêng từng frame làm nhảy chân hoặc thay kích thước giỏ.
- Metadata ở `public/pixel/frames.mjs`; render cùng hệ tọa độ/depth như người chơi, footprint 36×48 world. Asset decode nằm trong `artReady`.
- Idle nhẹ: nghỉ → hít thở → chớp mắt ngắn → thả lỏng, chu kỳ 6 giây. Reduced motion giữ frame 0, không kéo giãn thân hoặc thêm tay.
- Chỉ xuất idle mặt trước vì NPC đứng tại chỗ; không gán animation đi/chăm cây của người chơi hoặc tuyên bố có đủ hướng chưa vẽ.

Tái xuất: `py scripts/normalize-ong-sau.py` (Pillow). Nguồn/presentation chỉ trong docs; build không đóng gói ảnh master. Tài nguyên public tăng từ 22,63 lên 22,65 MiB, không thêm thư viện.

## Tích hợp

`public/lake-elder.mjs` chứa vị trí, hitbox, lời thoại và lịch chọn frame; module được copy sang build server vì world-layout dùng chung. Hotspot theo điểm đứng bên cạnh, hitbox theo silhouette, actor depth theo chân. Không có điểm chuyển scene mới.

Nút gặp NPC nằm trong bảng khu vực để người dùng bàn phím/mobile không phải chạm trúng một sprite nhỏ ở toàn cảnh. Khi mở từ nút, kiểm tra lại cảnh và khoảng cách trước khi hiển thị. Hủy đường đi hoặc đổi cảnh không mở hội thoại chậm ở nơi khác. Poll giữ focus của nút, không dựng lại dialog đang đọc.

## Kiểm chứng

- 188/188 kiểm thử đạt. Kiểm thử mới xác nhận NPC chỉ xuất hiện ở ao, các điểm NPC/cầu/giếng/dọn vẫn walkable và có route từ spawn; không thêm block; đủ lời chào, lịch idle/reduced motion và PNG RGBA 4 ô đúng kích thước.
- Build, audit asset và kiểm tra tài liệu gameplay đạt; không thiếu/unused tài nguyên. Đã kiểm tra module server trong build.
- Edge/Chromium: không mở hội thoại từ xa trước khi đến đích; đến đúng điểm rồi chào, E mở lại, đóng và mở đúng Ven ao/Sổ cá. Chạm thân NPC ở 844×390 và 568×320 đạt; không tràn ngang hoặc lỗi JavaScript. Vật tư/xu/XP/quota trước/sau trò chuyện giữ nguyên.
- Đã xem atlas ở 4× và Canvas toàn ao thực, kiểm tra silhouette/đường đứng cạnh người chơi. Không kiểm tra Safari iOS/Android thật; mô phỏng viewport không thay thế thiết bị thật.

## Tiếp theo

[Pilot](SOCIAL_LAKE_PILOT_V1.md) cần người chơi thật để đánh giá khả năng tìm thấy hoạt động, cảm giác tương tác và lượng phần thưởng. Chưa gửi lời mời, thu dữ liệu hoặc deploy. Không tự thêm chuỗi nhiệm vụ/phần thưởng NPC trước khi có phản hồi.

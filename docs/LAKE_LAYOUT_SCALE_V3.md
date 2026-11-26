# Ao làng — tỉ lệ và chòi giữa sân V3

26/11/2026. Hoàn thiện trong source; chưa commit/push/deploy.

- Dùng tỉ lệ render chung 640/480 thay cho 640/720 riêng của Ao làng: nhân vật và cảnh quan lớn hơn 1,5 lần so với chế độ toàn cảnh cũ trên desktop. Camera theo người chơi trong bản đồ 720×432.
- Màn hình ngang dùng cách tính viewport chung; bỏ CSS ép Ao làng vào khung 5:3 riêng, không kéo giãn hình.
- Chòi từ (542,402) về (390,365), trên đường đá giữa bờ nam. Ông Sáu đứng trong chòi tại (390,361), tiếp cận phía trước (390,386), hitbox (374,317,32,48). Giữ artwork, kích thước và thứ tự lớp vẽ.
- Giữ điểm xuất phát (365,377), hai bến câu, giếng, việc ven ao và polygon chặn nước. Cột chòi có va chạm; sàn giữa đi được.
- Canvas tương tác bằng `click`, tránh một lần chạm vừa mở hộp thoại vừa bấm nút trong hộp thoại đó. Giữ chuột, chạm và phím E.

Kiểm chứng: 192 kiểm thử và build đạt. Đã xem Canvas desktop, kiểm tra lời chào theo tuổi, tiếp cận NPC, phím E, chạm NPC/mở sổ cá ở 844×390 và 568×320, chuyển cảnh, reduced motion; trò chuyện không thay tài sản/XP/quota. Kiểm tra Chromium giả lập chạm chưa thay cho thử trực tiếp trên iOS Safari.

Thay phần camera và tọa độ chòi/NPC trong [V2](LAKE_LAYOUT_UI_V2.md); giữ lời thoại và UI V2.

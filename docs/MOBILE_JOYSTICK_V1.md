# Joystick mobile

Thay bốn nút hướng bằng cần tròn bán trong suốt, dùng màu xanh trầm/kem của game. Hiện trên thiết bị cảm ứng, màn hình nhỏ và màn hình ngang thấp; desktop dùng chuột không hiện.

- Độ mờ 48% khi nghỉ, 76% khi đang kéo. Vòng 104px, ngang thấp 96px hoặc 84px; vị trí tính safe area.
- Kéo mọi hướng, hỗ trợ đi chéo; vùng chết 20% bán kính kéo để chạm tâm không làm nhân vật đi. Giữ tốc độ và logic va chạm hiện có, không tăng tốc khi kéo xa.
- Chỉ ngón tay khởi tạo được điều khiển cần. Pointer capture giữ kéo khi ra khỏi vòng; thả, hủy, mất capture, blur, ẩn trang, resize, đổi vị trí/cảnh hoặc mở hộp thoại đều nhả điều khiển.
- Chạm bản đồ và bàn phím WASD/mũi tên giữ nguyên. Chạm joystick hủy đường tự đi trước đó như nút hướng cũ. Không đổi `world.approach()`.

Kiểm tra Chromium giả lập cảm ứng ở 844×390, 568×320 và 390×844: tâm không di chuyển, kéo đổi vị trí nhân vật, nhả dừng, hủy chạm và mở hộp thoại trả cần về tâm. Desktop 1280×850 ẩn cần và nhận sự kiện bàn phím không lỗi. Build, kiểm tra tài nguyên và cú pháp đạt. Chưa thử trên Safari/Android thiết bị thật.

Ảnh runtime: [ngang](assets/joystick-844.png), [ngang thấp](assets/joystick-568.png), [dọc](assets/joystick-390.png). Không thêm ảnh runtime hay thư viện điều khiển.

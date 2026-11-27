# Ăn/uống một lần bấm và quan sát Cô Lan

Ngày 27/11/2026. Đã tích hợp source, chưa commit/push/deploy.

## Ăn và uống

Nguyên nhân được xác nhận trong source: nút đi tới nơi chỉ gọi `showRecovery()` sau khi đến, nên người chơi phải bấm lại mới thực hiện. Khi đã ở đúng chỗ, nút cũng chưa có trạng thái đang xử lý trong thời gian chờ API.

- Ngoài vị trí hợp lệ: nút ghi rõ **Đến giếng uống nước**, **Về nhà uống nước** hoặc **Về nhà ăn cơm**. `world.approach()` đưa nhân vật tới đúng nơi rồi gọi hành động một lần, không mở lại popup yêu cầu bấm lần hai.
- Nếu đổi hướng trước khi đến, callback hủy thao tác và dọn phản hồi chờ. Không uống/ăn từ xa, không dịch chuyển tức thời.
- Đã đúng chỗ: nút đổi ngay thành Đang uống nước/Đang ăn cơm và khóa khi chờ. Lỗi thì khôi phục nút; thành công mới đóng popup. Dùng món trong túi cũng có trạng thái Đang dùng.
- Chưa tối ưu số request mạng: vẫn đồng bộ scene trước hành động cần vị trí và giữ xác thực phía server. Thời gian đi bộ và đường truyền vẫn có thật; không dùng cập nhật chỉ số giả trước xác nhận. Hành động uống/ăn có trong `farmActionDiagnostics` để phân biệt thời gian đi và request.
- Giữ 48 nước, 52 no bụng, cooldown và điều kiện nghỉ hiện có. Đi về để nghỉ vẫn mở popup xác nhận Nghỉ như cũ; chỉ ăn/uống được tự thực hiện theo nhãn nút.

## Xem Cô Lan

- Khi có job, **Xem Cô Lan** thay nút thuê đang bị khóa trong Sổ nhà nông; trạng thái thuê ở Vườn nhà cũng có nút xem.
- Camera theo vị trí NPC được tính bằng `gardenHelperPose()` và đường di chuyển đang dùng để vẽ cô ấy, thay vì đi tới một ô cố định. Không đổi vị trí nhân vật hoặc tiến độ job.
- Nút **Về nhân vật** trên thanh tương tác trả camera lại. Bàn phím, joystick, click map để đi hoặc đổi cảnh cũng thoát quan sát. Khi job kết thúc, camera tự trở lại theo nhân vật.

## Kiểm chứng

- 221 kiểm thử tự động đạt; build đạt.
- Trình duyệt demo riêng: nút xem, theo camera, quay lại, bàn phím hủy quan sát, vị trí nhân vật không đổi khi xem; tự ăn/uống một lần sau approach, tăng đúng 52/48 và không mở lại popup.
- API giả lập chậm 400 ms cho scene, 900 ms cho action: nút ăn/uống hiện đang xử lý ngay, thành công đóng một lần, lỗi 400 khôi phục nút. Dùng bánh mì cũng hiện đang xử lý rồi hoàn tất một request.
- Kiểm tra hình quan sát trên viewport 844×390: [ảnh runtime](assets/helper-watch-live-844.png). Chưa đo latency production hoặc thử thiết bị Safari/Android thật.

# Thông báo trạng thái và công việc V1

Ngày 27/11/2026. Đã tích hợp source, chưa commit/push/deploy.

## Vị trí và trình bày

- Desktop: thông báo kết quả và trạng thái làm việc dùng chung một vùng trong thanh dưới bản đồ, thay phần gợi ý tạm thời. Không che canvas hoặc nút tương tác.
- Mobile ngang: vùng này chuyển xuống một dòng sát dưới cụm HUD. Chiều rộng theo phần map đang nhìn thấy, tự tránh Công cụ khi mở, có safe area của HUD. Không còn thông báo nổi ở giữa phía dưới màn hình hoặc trên joystick.
- Chỉ hiện một thông báo tại một thời điểm: kết quả/lỗi ưu tiên hơn dòng trạng thái đang làm. Không xếp chồng. Khi thông báo hết, trạng thái đang làm có thể hiện lại nếu thao tác chưa xong.
- Nền xanh có alpha khoảng 70–72%; lỗi nâu khoảng 82%. Chữ giữ nguyên độ đậm/đục để còn đọc được. Bỏ khung dày và bóng lớn; vùng thông báo không bắt pointer, không chặn click/chạm.

## Thời gian

- Kết quả thường: 1,8 giây; nội dung trên 85 ký tự: 2,6 giây.
- Lỗi: 3,8 giây cộng 12 ms/ký tự, tối đa 6 giây.
- Mờ dần 180 ms rồi xóa nội dung; tắt hiệu ứng chuyển khi người dùng yêu cầu giảm chuyển động.
- Cùng một thông báo đang hiện không kéo dài thời gian khi lặp lại. Thông báo thường mới không ghi đè lỗi còn trong thời gian đọc. Lỗi mới thay lỗi cũ, không tạo hàng đợi.
- Trạng thái đang tới/đang làm vẫn đi theo vòng đời thao tác, không tự tắt giữa lúc chờ mạng và không báo thành công sớm. Các kiểm tra và thời gian xử lý hành động không đổi.

Lỗi nội tuyến trong popup, cảnh báo thiếu tài nguyên và đếm ngược vẫn ở đúng bảng có liên quan. Thay đổi này không bỏ thông tin cần xác nhận.

## Kiểm chứng

221 kiểm thử đạt, gồm hai test mới về hết hạn, chống lặp kéo dài, ưu tiên lỗi và timer cũ không xóa thông báo mới. Build đạt.

Edge với demo riêng, viewport 1100×850, 844×390, 568×320: thực hiện gieo để kiểm tra thông báo đang đi/kết quả; kiểm tra lỗi vị trí, tự tắt, vùng thông báo không bắt pointer, desktop nằm dưới canvas, mobile nằm dưới HUD và ngoài bảng Công cụ. Chưa kiểm trên thiết bị Safari/Android thật, chưa triển khai production.

Ảnh: [Desktop](assets/notices-result-1100.png), [trạng thái mobile](assets/notices-work-844.png), [lỗi khi Công cụ mở trên 568](assets/notices-error-568.png).

# Phản hồi thao tác và đo độ trễ

Cập nhật: 27/11/2026.

## Hành vi hiện tại

Các thao tác cuốc, gieo, tưới, nhổ cỏ, xịt thuốc, bón phân, thu hoạch, cho ăn và thu sản phẩm hiển thị thông báo gọn trên map ngay khi được chọn. Nhân vật vẫn đi tới mục tiêu bằng `world.approach()`. Khi tới nơi, hoạt ảnh làm việc có sẵn bắt đầu và lặp trong thời gian chờ xác nhận.

Hoạt ảnh chờ không cộng sản phẩm, trừ vật tư hoặc thay trạng thái cây/vật nuôi. Dữ liệu và hiệu ứng thành công chỉ cập nhật sau xác nhận. Khi lỗi, hoạt ảnh chờ dừng. Đổi hướng hoặc đổi cảnh trong lúc đang đi sẽ hủy thao tác đang chờ tới nơi.

## Chẩn đoán

Trong Console của trình duyệt, dùng `farmActionDiagnostics.recent()` để xem tối đa 40 thao tác gần nhất; `farmActionDiagnostics.clear()` để xóa. Chỉ lưu trong bộ nhớ tab, không gửi telemetry, không lưu token, payload hay ID người chơi.

- `travelMs`: từ click tới khi bắt đầu xử lý tại mục tiêu.
- `positionQueueMs`: chờ heartbeat vị trí đang chạy.
- `sceneRequestMs`: thời gian request đồng bộ vị trí, gồm nhận và đọc phản hồi.
- `actionRequestMs`: tổng thời gian request hành động, gồm lần thử lại nếu có.
- `renderMs`: thời gian gọi render đồng bộ; không đại diện toàn bộ thời gian GPU vẽ frame.
- Mỗi request có status, `serverMs` và `databaseMs` nếu server trả `Server-Timing`. `outsideServerMs` là phần thời gian ngoài số đo app của server, gồm đường truyền và xử lý phía client; không phải phép đo ping thuần.

Không có số đo production trong lần triển khai này. Các thao tác cần vị trí vẫn chờ đồng bộ scene trước request action; chưa giảm số request hoặc bỏ xác thực vị trí. Bước tối ưu sau chỉ nên quyết định dựa trên số đo thực tế, giữ idempotency và kiểm tra khoảng cách phía server.

## Xác minh

- 217 kiểm thử tự động đạt; production build đạt.
- Trình duyệt Edge với API giả lập: scene chậm 400 ms, action chậm 900 ms. Xác minh phản hồi ngay, hoạt ảnh trước phản hồi, click lặp chỉ gửi một action, dọn trạng thái khi thành công và khi trả lỗi 400, hủy bằng bàn phím khi đang đi không gửi action.
- Kiểm tra thông báo nằm trong viewport ở 1100×850, 844×390 và 568×320. Đây là giả lập viewport Chromium, chưa phải kiểm thử trên thiết bị Safari thật.

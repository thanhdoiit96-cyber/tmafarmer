# Kế hoạch sức tải online: 1.000 người chơi đồng thời

Tài liệu này ghi lại lộ trình trước mắt để chuẩn bị cho khoảng **1.000 người đang chơi cùng lúc**. Đây là mục tiêu cần đo bằng môi trường gần production; cấu hình hiện tại chưa có dữ liệu tải để bảo đảm mốc này.

## Hiện trạng trong mã nguồn

- Cloudflare Worker xử lý API; D1 lưu mỗi làng trong một hàng `farm_rooms`, với toàn bộ trạng thái game được mã hóa thành JSON và cập nhật bằng `revision` (optimistic concurrency).
- Một làng giới hạn 12 vườn. Nếu 1.000 người chia đều, sẽ có ít nhất khoảng 84 làng; tải dồn vào một làng vẫn có thể làm các thao tác ghi cùng tranh chấp một hàng.
- Giao diện gọi `/api/state` mỗi 4 giây khi trang đang mở. 1.000 trang đang hoạt động tương đương khoảng **250 lần gọi/giây** cho luồng này.
- Đồng bộ cảnh và chat gọi API mỗi 1,2 giây, tương đương khoảng **833 lần gọi/giây** ở cùng giả định. Mỗi heartbeat đọc danh sách hiện diện từ D1; vị trí cũng được ghi khi thay đổi hoặc đến hạn cập nhật. Tổng nền ban đầu xấp xỉ **1.083 request/giây**, chưa tính thao tác chơi, đăng nhập, tải trang và retry.
- Tin nhắn đã dùng Durable Object theo làng/cảnh, nhưng trạng thái hiện diện vẫn đi qua D1. Bảng tài khoản còn được tạo bằng `CREATE TABLE IF NOT EXISTS` trong luồng request.

> Các con số trên là phép tính từ chu kỳ gọi hiện có, giả định cả 1.000 người đều mở game và không bị trình duyệt throttle. Đây không phải kết quả benchmark hay giới hạn được nhà cung cấp bảo đảm.

## Hướng triển khai đề xuất

1. **Dọn phần khởi động database.** Chuyển các bảng tài khoản đang tạo trong request sang migration có phiên bản; việc kiểm tra/cập nhật schema không nên nằm trên đường xử lý request bình thường.
2. **Giảm traffic nền trước.** Tách nhịp cập nhật trạng thái game khỏi hiện diện/chat. Chỉ tải lại trạng thái game khi cần, giãn polling trạng thái nếu không có thay đổi, và giữ cập nhật tức thì sau thao tác có ghi. Khi tab ẩn, tiếp tục dừng polling như hiện tại.
3. **Đưa hiện diện vào Durable Object.** Dùng một đối tượng theo làng/cảnh để nhận vị trí, lọc người chơi còn hoạt động và phát thay đổi cho khách trong cùng cảnh. Giữ D1 cho dữ liệu bền vững; không ghi tọa độ liên tục vào D1. Chat đang có Durable Object và có thể chia sẻ cùng mô hình phân vùng theo làng/cảnh sau khi kiểm tra ranh giới trách nhiệm.
4. **Giữ D1 làm nguồn dữ liệu game trước mắt, rồi đo tranh chấp.** Hàng JSON theo làng giúp các làng độc lập không khóa chung một hàng. Đo độ lớn JSON, thời gian đọc/ghi và số lần cập nhật thất bại do `revision`; nếu tranh chấp đáng kể, chuyển các phần cập nhật thường xuyên hoặc dữ liệu từng vườn sang các hàng riêng bằng migration tương thích.
5. **Đặt giới hạn và quan sát được lỗi.** Ghi nhận độ trễ API theo route, lỗi Worker/D1/DO, số lần ghi xung đột, kích thước state và số người/cảnh. Có timeout, retry có giới hạn và thông báo lỗi rõ ràng; tránh retry dồn dập khi dịch vụ chậm.
6. **Chạy load test trên staging gần production.** Tạo nhiều làng với tối đa 12 người mỗi làng; mô phỏng đọc trạng thái, heartbeat, di chuyển, chat và thao tác ghi. Tăng tải lần lượt 100 → 250 → 500 → 1.000 người, sau đó giữ tải 30 phút. Kiểm tra cả một nhóm đông tập trung trong ít làng để phát hiện tranh chấp hàng state.

## Điều kiện để gọi là đạt mốc

Trước khi công bố hỗ trợ 1.000 người đồng thời, cần có load test lặp lại và dashboard cho thấy:

- p95 của thao tác API thông thường dưới 500 ms và thao tác ghi không tăng lỗi theo thời gian;
- lỗi 5xx dưới 0,5%, không mất cập nhật game đã xác nhận và không có lỗi tăng dần trong bài soak 30 phút;
- heartbeat vẫn cập nhật người chơi trong cùng cảnh ổn định, còn hàng đợi/retry D1 và Durable Object trở về mức nền sau đợt tải;
- Worker, D1 và Durable Object đều còn dư địa theo giới hạn gói production đang dùng.

Các ngưỡng này là mục tiêu khởi đầu để đánh giá, không thay thế việc kiểm tra quota, cấu hình và chi phí của tài khoản Cloudflare thực tế. Nếu không đạt, ưu tiên giảm polling và chuyển hiện diện sang Durable Object trước khi tăng độ phức tạp của mô hình lưu game.

## Thứ tự làm trước mắt

1. Chuyển DDL tài khoản khỏi request và thêm metrics cần thiết.
2. Tách nhịp polling trạng thái game khỏi heartbeat cảnh.
3. Chuyển hiện diện sang Durable Object.
4. Load test ở 100, 500 rồi 1.000 người; xử lý bottleneck dựa trên số đo.


# Kiểm thử tải và đo sức tải

Tài liệu này bổ sung quy trình kiểm chứng cho mục tiêu **1.000–5.000 người chơi đồng thời**. Chưa có kết quả tải staging trong repo, vì vậy không được xem bất kỳ mốc nào là đã đạt cho đến khi lưu được kết quả benchmark và đối chiếu dashboard Cloudflare.

## Phép đo hiện có

- Worker trả header `Server-Timing` cho mọi `/api/*`: tổng thời gian Worker (`app`), tổng thời gian chờ các truy vấn D1 (`db`) và số truy vấn D1 (`dbq`). Thời gian phía client do runner đo bao gồm cả mạng.
- Runner tổng hợp số request, mã HTTP, lỗi mạng/5xx, request/giây, p50/p95/p99 end-to-end, thời gian app và D1, cùng số truy vấn D1 theo endpoint.
- Cloudflare Workers Metrics/Logs là nguồn đối chiếu cho CPU, wall time, lỗi invocation và lưu lượng. D1 cần được theo dõi riêng cho thời gian truy vấn, hàng đợi, số hàng đọc/ghi và mức sử dụng quota.

## Chạy trên staging

Chỉ dùng Worker và D1 staging cô lập khỏi dữ liệu người chơi. Runner tạo làng và vườn thử lâu dài; cách an toàn nhất là dùng database staging riêng rồi xóa/tạo lại database sau mỗi đợt. Runner chặn Worker production hiện tại và yêu cầu cờ xác nhận staging.

```powershell
npm run test:scale -- --base-url https://<worker-staging>/ --confirm-staging --users 100 --ramp-seconds 30 --duration-seconds 60
```

Tăng tải từng bước, chạy mỗi cấu hình từ một đợt soak 30 phút trở lên sau vòng đo ngắn:

| Mốc | Người chơi | Thời gian giữ tải tối thiểu | Mục tiêu |
| ---: | ---: | ---: | --- |
| 1 | 100 | 10 phút | Xác nhận kịch bản, xác thực và số liệu cơ sở |
| 2 | 500 | 30 phút | Tìm ngưỡng bắt đầu tăng độ trễ hoặc xung đột ghi |
| 3 | 1.000 | 30 phút | Mốc mục tiêu đầu tiên |
| 4 | 2.500 | 30 phút | Xác nhận khả năng tăng ngang theo nhiều làng |
| 5 | 5.000 | 30 phút | Mốc mở rộng, chỉ chạy sau khi 2.500 đạt |

Mặc định mỗi làng có tối đa 12 người chơi; tải phân tán sẽ tạo khoảng 84 làng ở 1.000 người và 417 làng ở 5.000 người. Mỗi người gửi `/api/scene` khoảng 1,2 giây/lần và `/api/state` khoảng 4 giây/lần. Mặc định 20% người chơi di chuyển và mỗi người thực hiện một thao tác ghi avatar mỗi phút. Các giá trị này có thể điều chỉnh bằng `--moving-percent` và `--action-interval-seconds`.

Ước lượng từ luồng hiện tại: `/api/scene` chạy khoảng ba truy vấn D1 (xác thực phiên, ghi presence có điều kiện, đọc người cùng cảnh), `/api/state` khoảng hai và thao tác ghi thử khoảng ba. Tương ứng, 1.000 người tạo khoảng 1.100 request API/giây và gần 3.100 truy vấn D1/giây; 5.000 người khoảng 5.500 request và gần 15.300 truy vấn D1/giây. Đây là phép tính sơ bộ theo chu kỳ poll, không phải benchmark. D1 xử lý từng database tuần tự; vì vậy cần coi database D1 dùng chung là rủi ro kiến trúc chính và không tiến lên mốc lớn nếu số đo D1 cho thấy hàng đợi tăng.

Để đo trường hợp tập trung, chạy thêm bài riêng với fixture cùng làng thay vì tạo đều người chơi. Đây là kịch bản cần bổ sung trước khi tuyên bố sức tải 5.000, vì một làng có giới hạn 12 thành viên nhưng các thao tác của từng làng vẫn cùng cập nhật một hàng trạng thái. Không dùng các bài cực tải để dự đoán giá production nếu chưa kiểm tra giới hạn và chi phí tài khoản Cloudflare.

Có thể chạy kiểm tra contention tối đa một làng hiện có bằng đủ 12 người, tất cả di chuyển và ghi avatar mỗi giây:

```powershell
npm run test:scale -- --base-url https://<worker-staging>/ --confirm-staging --users 12 --moving-percent 100 --action-interval-seconds 1 --duration-seconds 600 --ramp-seconds 10
```

## Tiêu chí đạt

Mỗi mốc chỉ đạt khi đồng thời thỏa:

- p95 của tổng thời gian API dưới 500 ms; xem riêng `/api/state`, `/api/scene` và `/api/action` để tìm endpoint nghẽn.
- Lỗi 5xx và lỗi mạng dưới 0,5%; thao tác được xác nhận không mất dữ liệu. Theo dõi riêng 4xx/409 vì xung đột revision sau retry có giới hạn cũng ảnh hưởng trải nghiệm dù không phải lỗi Worker.
- Không có độ trễ tăng dần, lỗi quota, cảnh báo CPU/wall time hoặc backlog tồn tại sau khi dừng tải.
- Mức sử dụng D1, Worker và Durable Objects còn dư địa theo quota của gói production hiện hành.
- Lưu JSON kết quả runner, thời gian, commit, cấu hình tải, ảnh/export dashboard Workers và báo cáo D1 vào hồ sơ kiểm thử ngoài repo hoặc thư mục `docs/load-results/` nếu muốn lưu cùng mã nguồn.

## Giới hạn kiến trúc cần giải quyết

- Trước đây Worker chạy ba `CREATE TABLE IF NOT EXISTS` cho tài khoản ở mọi request. Migration `0002_accounts.sql` chuyển phần này khỏi đường xử lý nóng; staging/production cần áp dụng migration trước khi benchmark phiên bản mới.
- Hiện diện vẫn đọc/ghi D1 ở mỗi lần đồng bộ. D1 xử lý truy vấn theo thứ tự trên từng database, nên một database chung có thể trở thành giới hạn trước 5.000 người. Cần đo số liệu thực tế; nếu hàng đợi/độ trễ D1 tăng, chuyển presence sang Durable Object theo làng/cảnh trước khi tăng tải tiếp.
- Kịch bản phân tán chỉ kiểm tra thông lượng tổng. Cần giữ thêm bài tải nóng trên một nhóm nhỏ làng để kiểm tra tranh chấp revision, giới hạn retry và tính đúng đắn của thao tác cùng lúc.

## Kết quả benchmark

| Ngày | Commit | Người chơi | Soak | p95 API | 5xx | Xung đột 409 | D1/Worker | Kết luận |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Chưa chạy | — | — | — | — | — | — | — | Chưa xác nhận |

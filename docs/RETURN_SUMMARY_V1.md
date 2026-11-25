# P1.1 — Tóm tắt khi quay lại V1

Hoàn thiện trong source ngày 25/11/2026, tiếp nối [Mục tiêu tiếp theo](NEXT_GOAL_V1.md) và [Chỉ dẫn mở khóa](UNLOCK_GUIDANCE_V1.md). Chưa commit, push hoặc deploy.

## Trải nghiệm

Sau ít nhất **10 phút thực** vắng mặt, khi tải được trạng thái vườn mới, bảng công cụ có thẻ “Vườn khi bạn quay lại”. Không mở popup, không che Canvas, không tự chuyển cảnh. Ba dòng có thể chạm:

1. Số ô cây, vật nuôi, lứa thủy sản đang sẵn sàng thu; số việc chăm sóc cần chú ý. Mở Việc cần làm.
2. Chỗ trống kho hiện tại. Mở kho nông sản để dọn chỗ hoặc xem nâng cấp.
3. Mục tiêu đang ghim, kể cả đã hoàn thành; nếu chưa ghim, mở lựa chọn mục tiêu. Tiếp tục qua điều hướng V1, không tự thực hiện hành động.

Thẻ cập nhật theo trạng thái mới trong phiên. Đóng thẻ giữ nguyên nông trại và mục tiêu; đổi cảnh không tạo thêm thẻ. Tải lại ngay không hiện lại bản tóm tắt. Ngưỡng 10 phút là lựa chọn UX ban đầu (`returnAfter`), có thể điều chỉnh sau khi quan sát người thử.

## Dữ liệu và giới hạn

- `public/return-summary.mjs` dùng `farmTasks`, `capacity`, `stock` và nội dung mục tiêu hiện có, không tạo bộ luật chăm sóc thứ hai.
- Checkpoint localStorage chỉ có phiên bản, thời điểm snapshot thành công và ba số đếm sẵn sàng. Tách demo/online, mã làng và ID vườn; không lưu token hoặc bản sao nông trại.
- Chỉ cập nhật checkpoint khi trang đang hiển thị và nhận snapshot thành công. Khi trở lại tab, yêu cầu refresh; lỗi mạng không được coi là đã nhận trạng thái mới. Không dùng lần render/chuyển cảnh để tính lần ghé.
- Bộ nhớ trong phiên giữ mốc gần nhất nếu không ghi được localStorage. Khi không có mốc hợp lệ, lần đầu vào hoặc dữ liệu phiên bản lạ: không dựng kết quả vắng mặt giả.
- “Tăng/giảm N mục” là **chênh lệch tổng số đang sẵn sàng** so với lần ghé trước, không phải lịch sử thu hoạch, sản lượng tích lũy hoặc xác nhận từng vụ vừa chín. Một lứa 8 cá tính là một lứa sẵn sàng, không phải tám sản phẩm.
- Đây là tính năng trên thiết bị. Xóa dữ liệu trình duyệt hoặc đổi thiết bị không có mốc so sánh. Hai tab cùng vườn chia sẻ mốc gần nhất; không hứa thống kê vắng mặt độc lập từng tab.
- Kho trống không đảm bảo mọi lượt thu đều vừa; sức chứa vẫn được engine kiểm tra lúc thao tác. Không đổi lão hóa, thời tiết, thưởng, đơn hàng hay cơ chế mất sản lượng khi vắng lâu.

## Bố cục và kiểm chứng

Giữ nền giấy kem/xanh và font của các thẻ trước, ba dòng là nút chạm tối thiểu 44px. Nằm trước mục tiêu đang ghim trong vùng bảng có thể cuộn. Ảnh thật: [desktop](assets/return-summary-v1-desktop.png), [điện thoại 390px](assets/return-summary-v1-mobile.png).

Kiểm thử bao gồm schema/mốc thời gian, đổi vườn/demo/online, kho đầy, chênh lệch số mục, lứa thủy sản/vật nuôi và không sửa snapshot. Trình duyệt thật kiểm tra ba dòng, đường dẫn Việc/Kho/Mục tiêu, đổi cảnh, đóng, reload nhanh, trang ẩn, không tràn ngang ở 390px và không tiêu xu/XP/vật phẩm khi xem. Không ghi nhận lỗi JavaScript.

Toàn bộ 141 bài kiểm thử đạt; build production, kiểm tra asset và đối chiếu catalog gameplay đạt. Module tóm tắt được đóng gói cùng app; không có migration database.

## Tiếp tục từ đây

P1.2: giải thích ETA/sản lượng theo thời tiết, độ ẩm, cỏ/sâu bằng số liệu engine. Chỉ ghi “ước tính”, không lấy thời gian cơ sở làm giờ thu chắc chắn. P1.3 cần các kịch bản vắng 8 giờ, 24 giờ, 3 và 7 ngày trước khi đề xuất thay chính sách bảo hộ; bản này chưa thay luật đó. Analytics, ghim đơn làng và đồng bộ tùy chọn vẫn là các mục riêng trong roadmap.

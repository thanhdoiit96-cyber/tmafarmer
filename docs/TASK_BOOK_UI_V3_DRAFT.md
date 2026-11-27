# Sổ nhà nông V3 — đã duyệt

Ngày 27/11/2026. V2 không được duyệt; V3 và bảng thuê V4 đã được duyệt, tích hợp theo [báo cáo runtime](TASK_BOOK_RECOVERY_UI_V1.md). Nội dung bên dưới lưu thiết kế mẫu trước tích hợp.

[Mở bản mẫu tương tác](previews/tasks-v3.html).

- Dùng sổ giấy ấm, gáy sổ và hai cột việc gọn thay các thẻ vuông giống bảng chức năng. Dùng lại icon crop-care, animal-task và cuốc đất của game; không tạo asset mới. Ao dùng ký hiệu nước tạm.
- Nhóm cùng hành động; tên, đơn vị và số việc tách biệt. Sáu nhóm/trang, phân trang phía dưới; nhóm mở ra danh sách đối tượng có nút Đi tới.
- Thuê chăm vườn có khu vực riêng dưới danh sách, tên Cô Lan, số ô có thể làm, đơn giá và nút rõ. Không cần mở nhóm mới tìm được chức năng thuê. Nhóm Thu cây/Tưới cây cũng có lối vào thuê phù hợp.
- Luồng mẫu: chọn tưới (2 xu/ô) hoặc thu hoạch (4 xu/ô), chọn các ô qua phân trang, xem phí và số xu trong túi, xác nhận số xu sẽ trả. Giữ cơ chế làm từng ô của Cô Lan; không hứa hoàn thành ngay.
- Bản mẫu chỉ dùng dữ liệu minh họa và có bước xác nhận giả lập; không gửi request, không trừ xu. Tùy chọn giữ giống khi thu là minh họa vị trí điều khiển, lúc tích hợp phải dùng đúng các lựa chọn và cách tính hiện có. Chưa mô phỏng đầy đủ trạng thái đang làm, thiếu xu hoặc giới hạn 12 ô của engine.
- Sổ ngày vẫn giữ ba mục và thưởng hiện tại. Khi tích hợp lấy XP thật từ cấu hình; bản mẫu ghi “+ XP”. Ghim mục tiêu giữ ở Việc cần làm; chưa dựng trong bản này.

Kiểm tra trình duyệt Edge: các thẻ, phân trang nhóm/ô, chọn tất cả, tổng phí 16 xu cho 8 ô tưới và 24 xu cho 6 ô thu, xác nhận số dư, quay lại giữ lựa chọn. Bố cục không tràn viewport ở 1100×850, 844×390, 568×320. Chưa kiểm trên iOS/Android thật hoặc game runtime.

Ảnh: [Việc cần làm](assets/taskbook-v3-844.png), [Thuê chăm vườn](assets/taskbook-hire-v3-844.png), [Sổ hôm nay](assets/taskbook-journal-v3-844.png).

Khi được duyệt, tích hợp theo các điều kiện định danh, polling, số đếm và điều hướng đã ghi ở TASK_BOOK_UI_V2_DRAFT.md. Phải giữ ngữ cảnh nhóm/trang khi vào thuê rồi quay lại; bản mẫu hiện quay về trang đầu. Chưa thay đổi logic gameplay trong lần dựng này.

# Phác thảo Sổ nhà nông V2

Ngày: 27/11/2026. Trạng thái: chờ duyệt bố cục, chưa tích hợp runtime.

Bản xem tương tác: [Sổ nhà nông](previews/tasks-v2.html). Mở bằng trình duyệt; dữ liệu minh họa, không thay đổi nông trại.

## Vấn đề đã rà soát

`farmTasks()` tạo việc theo từng đối tượng; `renderTasks()` hiện toàn bộ thành danh sách dài. Sổ ngày có ba mục cố định, nhưng đang lồng dưới phần thuê chăm vườn nên khó phân biệt với việc phát sinh theo tình trạng nông trại.

## Bố cục đề xuất

- Hai thẻ cùng một cuốn sổ: **Việc cần làm** và **Sổ việc hôm nay**. Thẻ đầu hiển thị nhóm việc phát sinh, thẻ sau hiển thị ba mục và thưởng ngày hiện có.
- Việc cần làm: lưới 3×2, phân trang phía dưới. Một ô gồm icon đang có trong game, tên hành động, badge số việc và đơn vị. Bản HTML dùng ký hiệu tạm để xét bố cục, không phải thiết kế icon mới.
- Gom hành động tương tự bất kể giống: Cho vật nuôi ăn, Thu sản phẩm vật nuôi, Thu cây, Tưới cây, Nhổ cỏ, Trị sâu, Cuốc đất, Cho thủy sản ăn, Thu thủy sản. Tách cây, vật nuôi, ao vì khác đối tượng và đơn vị. Nhóm rỗng không xuất hiện; nguy cấp trước, sẵn sàng thu sau, chăm thường tiếp theo như thứ tự ưu tiên engine hiện tại.
- Badge đỏ cho cần chăm, xanh cho có thể thu; không gộp số cần ăn với số có thể thu. Số nhóm và số đối tượng là hai đại lượng riêng.
- Chạm nhóm để xem chi tiết theo trang, tên cây/con vật và vị trí rõ, có nút Đi tới. Không liệt kê tất cả ngay ở trang tổng. Mobile cực thấp dùng mật độ chi tiết phù hợp; giữ trang nhóm khi quay lại.
- Thuê người chăm vườn chuyển thành một lối mở phụ dưới phân trang, giữ nguyên chọn ô, chi phí và xác nhận hiện có.
- Sổ ngày: ba dòng cố định, dấu hoàn thành, tiến độ 0–3, thưởng và nút nhận. Tách tên việc khỏi trạng thái; không đổi điều kiện, xu hoặc XP. Bản mẫu chỉ ghi “+ XP”; tích hợp phải lấy đúng `dayReward.xp`.

## Điều kiện tích hợp sau duyệt

Không tự làm hàng loạt, không đổi thưởng/giới hạn hoặc logic tăng trưởng. Nhóm chỉ là lớp trình bày trên `farmTasks()`. Lưu khóa nhóm ổn định và định danh đối tượng, không dùng chỉ số hiển thị sau phân trang để điều hướng. Giữ `world.approach()` và xử lý index 0. Với ao, xác minh đếm theo lứa và dẫn tới đúng ao; một ao có thể có nhiều lứa.

Polling cập nhật số, giữ nhóm/trang đang mở và kẹp trang khi số việc giảm; hết việc hiện trạng thái rỗng. Nhân vật đứng tại đâu không ảnh hưởng phạm vi đếm (toàn nông trại của người chơi). Ghim mục tiêu chỉ ở Việc cần làm như quy tắc hiện có; không đưa sang thẻ Sổ ngày.

Sau tích hợp phải kiểm thử dữ liệu nhiều/ít/rỗng, chuồng phụ, ao nhiều lứa, hoàn thành và nhận thưởng; kiểm desktop, mobile ngang 844×390 và 568×320, nút chuyển trang, điều hướng và scrollbar chi tiết khi tràn. Không coi bản mẫu tĩnh là bằng chứng runtime đã đạt.

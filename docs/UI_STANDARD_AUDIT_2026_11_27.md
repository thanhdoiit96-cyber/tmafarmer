# Rà soát UI theo chuẩn công cụ — 27/11/2026

Áp dụng [GAME_UI_STANDARD.md](GAME_UI_STANDARD.md). Đợt này tập trung bộ chọn giống/vật nuôi và các danh mục công cụ dùng chung; không thay đổi giá, sức chứa, công thức chăm sóc hay dữ liệu lưu.

## Đã cập nhật

- **Đón vật nuôi:** ảnh có khung riêng, thu nhỏ sprite; tên tối đa hai dòng bên dưới, giá tách số và đơn vị. Không còn dựa vào `transform` để thu hình trong một vùng bố cục quá lớn. Tám ô/trang desktop; bốn ô/trang khi màn hình ngang cao không quá 480px. Chuyển trang ngay trong hộp thoại, giữ đúng chuồng đích, kể cả lô 0.
- **Hạt giống:** dùng chung cách phân vùng ảnh/tên; số hạt và đơn vị tách rõ.
- **Xưởng:** sáu công thức/trang; nguyên liệu và điều kiện chuyển vào chi tiết khi chọn công thức. Nút chế tạo vẫn là thao tác riêng, giữ điều kiện hiện có.
- **Chợ:** gian hàng, vật tư, bán hàng phân trang sáu mục; tìm kiếm đặt lại trang để tránh kết quả rỗng giả. Tên, lượng hàng và hành động tách riêng.
- **Cuộn:** bảng bên và hộp thoại có thanh cuộn theo màu trò chơi, thêm chỉ báo luôn hiện khi nội dung tràn, kể cả hệ điều hành ẩn thanh cuộn tự nhiên. Chỉ báo đi theo vị trí cuộn và không chặn thao tác chạm.
- **Sổ chuồng:** giữ lưới sáu ô, badge xanh thu hoạch/đỏ cho ăn và số thức ăn trong túi từ bản trước; không thêm lại thông tin trùng lặp.

## Kiểm chứng

- Runtime Chromium: desktop 1100×850, giả lập cảm ứng ngang 844×390 và 568×320.
- Đo khung sprite/tên trên các trang đón; không chồng nhau. Bộ chọn ở hai kích thước ngang không cần cuộn; nút sang trang thao tác được bằng sự kiện cảm ứng.
- Xưởng và chợ phân trang đúng; polling không làm mất trang xưởng; tìm kiếm vật tư đặt lại trang; mở được chi tiết nguyên liệu.
- Chi tiết quản lý vật nuôi thực sự tràn: chỉ báo nằm trong vùng hộp thoại nhìn thấy và con trượt thay đổi theo vị trí cuộn. Không có lỗi JavaScript trong luồng kiểm tra.
- Toàn bộ 201 kiểm thử tự động đạt; build, kiểm tra tài nguyên và tài liệu gameplay đạt. Không thêm atlas hay ảnh runtime mới.
- Ảnh đối chiếu: [desktop](assets/ui-standard-adoption-desktop.png), [ngang](assets/ui-standard-adoption-landscape.png), [chi tiết cuộn](assets/ui-standard-detail-scroll.png).

Chưa kiểm tra trên thiết bị Android/iOS Safari thật. Các mục Kho, Ao và hàng rào được rà cấu trúc; không khẳng định đã chạy mọi tổ hợp dữ liệu trên mọi màn hình. Các danh sách thông tin cũ khác tiếp tục phải được rà theo chuẩn khi chỉnh sửa, không xem đợt này là chứng nhận toàn bộ UI.

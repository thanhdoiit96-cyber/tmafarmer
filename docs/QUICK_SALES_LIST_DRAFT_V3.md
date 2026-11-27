# Bán nhanh V3 — danh sách dọc có phân trang

Trạng thái: phác thảo chưa duyệt, chưa thay runtime. Thay hướng khay lưới V2 theo yêu cầu trực tiếp của người dùng; không còn coi lưới là bắt buộc cho Bán nhanh.

## Thiết kế

- Một khung giấy chung, các hàng phân cách nhẹ; không lồng nhiều thẻ hoặc nút bán lặp.
- Mỗi hàng: ảnh có vùng riêng bên trái, tên đầy đủ và lượng Kho/đơn giá ở giữa, một nút Bán bên phải.
- Lượng tồn có badge xanh, không ghép vào tên. Tên dài xuống dòng tự nhiên. Không cắt chữ để ép chiều cao.
- Nút Bán mở chọn số lượng, tổng xu và Bán hết. Prototype chỉ mô phỏng; khi tích hợp phải giữ xác nhận bán hết và giao dịch server hiện có.
- Chạm ảnh/tên mở thông tin món. Không biến việc xem thông tin thành thao tác bán.
- Phân trang thật ở dưới danh sách: 4 món trên desktop, 3 ở mobile ngang 390px cao, 2 ở 320px cao. Tám món mẫu cho phép thử trang cuối, tên dài, lượng 1.234 và tìm kiếm rỗng.
- Khung prototype rộng 304px; chưa tích hợp chiều rộng 276/304px và toàn bộ điều hướng Công cụ của runtime. Khi triển khai phải kiểm tra lại chính bảng thật, không dùng kết quả prototype để thay nghiệm thu tích hợp.

## Xem mẫu

- [Prototype tương tác](assets/quick-sales-list-draft-v3.html)
- [Desktop](assets/quick-sales-list-v3-1100.png)
- [844 ngang](assets/quick-sales-list-v3-844.png)
- [568 ngang](assets/quick-sales-list-v3-568.png)
- [Tên dài, số lượng lớn](assets/quick-sales-list-v3-long-844.png)

Edge: duyệt hết trang tại 1100×850, 844×390, 568×320; đo cả sprite sau transform, chữ và nút không đè nhau, trang không tràn viewport. Chuyển trang, kẹp trang khi lọc, tìm kiếm rỗng, mở chi tiết/bán và chọn số lượng/Bán hết mô phỏng đạt. Chưa thử Safari/Android thật. Không đổi engine hoặc giao dịch production.

GAME_UI_STANDARD.md đã ghi nhận ngoại lệ danh sách dọc do người dùng yêu cầu. Theo mục 6, chờ duyệt bản nhìn được trước khi tích hợp bố cục mới.

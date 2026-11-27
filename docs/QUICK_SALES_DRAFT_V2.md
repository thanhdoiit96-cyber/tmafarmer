# Bán nhanh V2 — phác thảo để duyệt

Trạng thái: CHƯA DUYỆT, chỉ là prototype độc lập. Không thay runtime, không kết nối database, không bán vật phẩm thật.

## Vì sao bỏ bản vừa sửa

Bản trước tiếp tục thu nhỏ ảnh/chữ và nhồi hai nút vào mỗi thẻ. Đo không tràn chỉ chứng minh bố cục vừa khung, không chứng minh thiết kế đẹp hoặc dễ dùng. Không dùng kết quả kiểm thử kỹ thuật để tuyên bố mỹ thuật đã đạt.

## Bố cục đề xuất

- Giữ khung rộng 304px, không mở rộng bản đồ hoặc cửa sổ.
- Sáu ô, 3 cột × 2 hàng; ảnh từ atlas hiện có, tên riêng dưới ảnh, badge lượng tồn ở góc. Chỉ một món được chọn.
- Bỏ 12 nút bán lặp lại. Một thanh thao tác chung hiển thị tên món chọn, đơn giá, bộ tăng/giảm lượng và nút Bán kèm tổng xu.
- Bán hết nằm trong thanh chung; runtime sau này phải giữ bước xác nhận. Prototype chỉ thay số lượng để minh họa, không giao dịch.
- Phân trang dưới khay. Prototype có đúng sáu món mô phỏng nên hai mũi tên vô hiệu; chưa phải triển khai phân trang thật.
- Tìm món mở khi cần. Prototype chưa phải bản tích hợp với điều hướng/safe area của Công cụ; không được tuyên bố đã kiểm iOS thật.

## Xem

- [Prototype tương tác](assets/quick-sales-draft-v2.html)
- [Desktop](assets/quick-sales-draft-v2-1100.png)
- [Mobile ngang 844](assets/quick-sales-draft-v2-844.png)
- [Mobile ngang 568](assets/quick-sales-draft-v2-568.png)

Kiểm chứng prototype: sáu ô, ảnh không chồng tên, chọn món cập nhật thanh chung, tăng lượng cập nhật tổng xu; trang vừa viewport 1100×850, 844×390, 568×320 trong Edge. Không có code production thay đổi ở bước dựng mẫu này.

Theo GAME_UI_STANDARD.md mục 6: “Thiết kế lại bố cục đáng kể phải dựng bản nhìn được và duyệt trước khi tích hợp”. Chờ người dùng đánh giá hướng này trước khi thay runtime, tránh thêm một vòng tự sửa và tự tuyên bố hoàn thiện.

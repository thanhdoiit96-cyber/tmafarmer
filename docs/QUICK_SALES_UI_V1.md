# Rà soát và đồng bộ Bán nhanh

Ngày 27/11/2026. Hoàn thiện UI source, chưa commit/push/deploy. Mỹ thuật vật phẩm còn giới hạn nêu bên dưới.

## Kết quả rà soát

Bản cũ có lưới/phân trang nhưng vẫn dùng `itemLink()` trong thẻ danh sách cũ: tên có thể ghép emoji, ảnh và tên không có vùng riêng ổn định, hai nút dễ bị chật, giá lẫn trong nhãn nút. Sản phẩm vật nuôi chưa đi qua sprite dùng ở các bảng chăn nuôi. Vì vậy chưa đáp ứng đầy đủ chuẩn chung, không nên gọi là đã đồng bộ toàn bộ.

## Đã sửa

- Khung sách giấy/gỗ theo các bảng đã duyệt. Mỗi ô tách hình, tên tự xuống dòng và không cắt chữ, lượng Kho có badge xanh và đơn giá xu/món. Nút Bán mở chọn số lượng; Bán hết giữ bước xác nhận hiện có.
- Cây trồng dùng frame trưởng thành từ `itemIllustration()`; thủy sản dùng atlas có sẵn; sản phẩm vật nuôi dùng `animalProductIllustration()`/sprite cùng loài như các bảng liên quan. Không vẽ lại hoặc sửa atlas.
- Cập nhật theo yêu cầu: **6 món/trang, lưới 3×2** ở desktop và mobile ngang. Bảng Bán nhanh rộng 480px trên desktop, tối đa 540px trên mobile ngang; ảnh cây 48px trên desktop, 42px ở 844 ngang và 36px ở 568 ngang. Chỉ mở rộng bảng khi đang ở Bán nhanh, không thay kích thước bảng khác.
- Mobile đặt hình và tên cạnh nhau. 844 ngang thu gọn hàng điều hướng phụ; màn hình thấp 568 ngang mở bảng gần hết chiều rộng và ẩn điều hướng Công cụ trong lúc mở bảng, giữ các thẻ chợ và nút đóng. Đóng bảng để trở lại map/điều hướng chung. Không bỏ ô tìm kiếm, đơn giá hay nút xác nhận.
- Phân trang ở dưới; polling giữ trang, lọc tìm kiếm về đầu, item hết thì trang được kẹp hợp lệ. Không dùng chiều cao cố định hay line-clamp cho tên; ảnh và tên có vùng riêng.

## Mỹ thuật chưa hoàn tất

Chín vật phẩm vẫn dùng emoji/icon hiện có của Xưởng vì chưa có tranh riêng: cà phê rang, trà sen, sinh tố thanh long, bánh trứng cút, phô mai sữa trâu, chè nếp cẩm, vải len, keo tinh bột, tấm cách nhiệt. Khung UI của chúng đã đồng nhất nhưng hình minh họa chưa thể coi là bộ pixel art hoàn chỉnh.

Không lấy hình nguyên liệu để giả làm hình món chế biến, không tự sinh hình mới rồi đưa vào production chưa duyệt. Nếu tiếp tục mỹ thuật, cần thiết kế/duyệt nguồn cho bộ vật phẩm này, sau đó dùng chung trong Kho, Xưởng, Bán nhanh, Đơn hàng và Sạp; tránh sửa riêng một màn hình.

## Kiểm chứng

223 kiểm thử tự động và production build đạt. Edge với demo riêng ở 1100×850, 844×390, 568×320: bố cục thật có bảng Công cụ mở, hình không đè tên, không cuộn danh sách để tới nút/phân trang; chuyển trang giữ qua polling; tìm cây/sữa; ảnh sản phẩm vật nuôi dùng atlas; bán một lúa mì trừ đúng một món và cộng 6 xu; bán hết không thực hiện trước xác nhận; danh sách rỗng cập nhật đúng. Không đổi server/giá hoặc thử giao dịch production. Chưa thử trên thiết bị Safari/Android thật.

Ảnh runtime: [desktop](assets/quick-sales-live-1100.png), [844 ngang](assets/quick-sales-live-844.png), [568 ngang](assets/quick-sales-live-568.png), [sản phẩm vật nuôi](assets/quick-sales-animal-live-844.png).

Kiểm chứng bản 6 món: production build đạt; kiểm tra Edge tại cả ba kích thước trên, duyệt toàn bộ trang sản phẩm và xác nhận tên không bị cắt, danh sách/phân trang không cần cuộn. Kiểm tra lại tìm kiếm, giữ trang qua polling, bán đúng số lượng/giá và xác nhận bán hết đều đạt. Đây là kiểm tra Chromium mô phỏng kích thước, chưa phải Safari/Android thật.

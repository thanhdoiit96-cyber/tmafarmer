# Rà soát và đồng bộ Bán nhanh

Ngày 27/11/2026. Hoàn thiện UI source, chưa commit/push/deploy. Mỹ thuật vật phẩm còn giới hạn nêu bên dưới.

## Kết quả rà soát

Bản cũ có lưới/phân trang nhưng vẫn dùng `itemLink()` trong thẻ danh sách cũ: tên có thể ghép emoji, ảnh và tên không có vùng riêng ổn định, hai nút dễ bị chật, giá lẫn trong nhãn nút. Sản phẩm vật nuôi chưa đi qua sprite dùng ở các bảng chăn nuôi. Vì vậy chưa đáp ứng đầy đủ chuẩn chung, không nên gọi là đã đồng bộ toàn bộ.

## Đã sửa

- Khung sách giấy/gỗ theo các bảng đã duyệt. Mỗi ô tách hình, tên tự xuống dòng và không cắt chữ, lượng Kho có badge xanh và đơn giá xu/món. Nút Bán mở chọn số lượng; Bán hết giữ bước xác nhận hiện có.
- Cây trồng dùng frame trưởng thành từ `itemIllustration()`; thủy sản dùng atlas có sẵn; sản phẩm vật nuôi dùng `animalProductIllustration()`/sprite cùng loài như các bảng liên quan. Không vẽ lại hoặc sửa atlas.
- Điều chỉnh sau phản hồi bảng quá to: bỏ toàn bộ chiều rộng/chiều cao riêng, dùng đúng khung Công cụ chung. Lưới hai cột; desktop và mobile ngang 844 hiển thị 4 món/trang, mobile ngang thấp đến 340px hiển thị 2. Ưu tiên tên đầy đủ và nút vừa khung thay vì phóng to cửa sổ để cố giữ 6 món.
- Lựa chọn cuối của người dùng: dùng lại bố cục ô trong ảnh `quick-sales-live-1440.png`, không tích hợp prototype danh sách V3 hoặc khay V2. Ảnh bên trái và tên bên phải; hàng Kho/đơn giá tách riêng; hàng cuối có hai nút **Bán** / Bán hết. Bỏ ký tự ba chấm ở nhãn Bán. Tên dài xuống dòng đầy đủ, không line-clamp. Mobile ngang thu gọn hàng điều hướng phụ, giữ hàng điều hướng chính và nút đóng. Không bỏ ô tìm kiếm, đơn giá hay bước xác nhận.
- Phân trang ở dưới; polling giữ trang, lọc tìm kiếm về đầu, item hết thì trang được kẹp hợp lệ. Không dùng chiều cao cố định hay line-clamp cho tên; ảnh và tên có vùng riêng.

## Mỹ thuật chưa hoàn tất

Chín vật phẩm vẫn dùng emoji/icon hiện có của Xưởng vì chưa có tranh riêng: cà phê rang, trà sen, sinh tố thanh long, bánh trứng cút, phô mai sữa trâu, chè nếp cẩm, vải len, keo tinh bột, tấm cách nhiệt. Khung UI của chúng đã đồng nhất nhưng hình minh họa chưa thể coi là bộ pixel art hoàn chỉnh.

Không lấy hình nguyên liệu để giả làm hình món chế biến, không tự sinh hình mới rồi đưa vào production chưa duyệt. Nếu tiếp tục mỹ thuật, cần thiết kế/duyệt nguồn cho bộ vật phẩm này, sau đó dùng chung trong Kho, Xưởng, Bán nhanh, Đơn hàng và Sạp; tránh sửa riêng một màn hình.

## Kiểm chứng

223 kiểm thử tự động và production build đạt. Edge với demo riêng ở 1100×850, 844×390, 568×320: bố cục thật có bảng Công cụ mở, hình không đè tên, không cuộn danh sách để tới nút/phân trang; chuyển trang giữ qua polling; tìm cây/sữa; ảnh sản phẩm vật nuôi dùng atlas; bán một lúa mì trừ đúng một món và cộng 6 xu; bán hết không thực hiện trước xác nhận; danh sách rỗng cập nhật đúng. Không đổi server/giá hoặc thử giao dịch production. Chưa thử trên thiết bị Safari/Android thật.

Ảnh runtime: [desktop](assets/quick-sales-live-1100.png), [844 ngang](assets/quick-sales-live-844.png), [568 ngang](assets/quick-sales-live-568.png), [sản phẩm vật nuôi](assets/quick-sales-animal-live-844.png).

Kiểm chứng bản ô đã chọn: đo cả kích thước sprite sau transform, không chỉ khung chứa ảnh; thu icon tạm của món chế biến về 24px để không tràn sang tên. Kiểm tra nhãn Bán không có ba chấm, nút trong thẻ, tên không bị cắt, các trang và giao dịch demo. Ảnh runtime phía trên cập nhật theo lần lựa chọn này. Đây là Chromium mô phỏng kích thước, chưa phải Safari/Android thật.

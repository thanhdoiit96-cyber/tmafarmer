# Sổ chuồng và bảng phiếu đơn — phác thảo V4

27/11/2026. **Đã duyệt và tích hợp runtime**, xem [kết quả và kiểm chứng V4](ORDERS_ANIMAL_UI_V4.md). Bên dưới giữ thiết kế mẫu lịch sử thay hướng danh sách V3.

## Xem bản mẫu

- [Mở prototype tương tác](assets/orders-animal-ui-draft-v4.html)
- [Sổ chuồng](assets/animal-care-draft-v4.png) · [màn hình ngang](assets/animal-care-draft-v4-landscape.png)
- [Bảng đơn](assets/orders-draft-v4.png) · [màn hình ngang](assets/orders-draft-v4-landscape.png)

## Hướng thiết kế

V3 còn dựa vào các hàng thông tin, link và nhóm nút như màn hình quản trị. V4 đổi thành khung chơi: sổ chuồng gồm ô chân dung, bảng đơn là phiếu giấy có hình nguyên liệu và dấu tiến độ. Dùng màu gỗ, giấy, xanh trầm và sprite/icon chăm sóc hiện có. Không tạo bitmap mới hoặc thêm tài nguyên production.

Sổ chuồng: theo phản hồi tiếp theo, thu nhỏ thành **6 ô mỗi trang (3 cột × 2 hàng)** thay cho 4. Chân dung 56×48 trên desktop, 42×36 ở màn hình ngang thấp; nút chính cao ít nhất 30px trên bản ngang. Giữ nhãn đói/sẵn sàng/đang lớn và một nút thức ăn/thu hoặc một đồng hồ. Không đưa phần trăm, sản lượng/lứa và hai đồng hồ lên cùng ô. Chạm hình mở quản lý với sản lượng, thời gian và mục mở rộng; chuyển chuồng/bán vẫn có xác nhận. Giữ lọc trạng thái và phân trang.

Bảng đơn: phiếu nông sản, các ô nguyên liệu để chọn bằng hình; chỉ món đang chọn có cụm Góp/Ghim/Cách có. Mốc cá nhân gọn ở chân phiếu, phần thưởng và người góp mở khi chạm. Cảnh báo không hoàn lại/mốc thưởng phải có lại trong bước xác nhận góp. Đơn chợ được ghi là Giao, không dùng hành động Góp. Mẫu chỉ minh họa một phiếu; bản tích hợp phải có phân trang/chọn tất cả đơn hiện có.

Khung mẫu đang nổi bên phải trong ảnh cảnh game để duyệt cảm giác chơi; đây không phải bản camera/map mới. Khi tích hợp phải giữ vùng chơi, tỉ lệ nhân vật, điều khiển di chuyển và không để bảng chặn thao tác map. Có thể đặt cùng khung trong vùng bảng hiện có nếu khớp bố cục đã duyệt; không tự thay bằng danh sách V3. Khung 568×320 có bố cục riêng giảm phần chữ, giữ nút chính và khả năng xem tên món đang chọn.

## Phạm vi và kiểm chứng

Prototype chỉ mô phỏng bằng bộ nhớ trang: không API, không lưu, không thay tài sản/kinh tế. Atlas và ảnh cảnh là tài nguyên có sẵn; không dùng hình mẫu làm bằng chứng runtime hoàn thiện.

Đã kiểm tra Chromium: sáu ô/trang, trang 2 bắt đầu đúng vật nuôi số 7, lọc, mở quản lý/cảnh báo bán, chọn nguyên liệu, chỉ một cụm thao tác, chặn góp khi không có hàng hoặc số lượng sai, cảnh báo trước xác nhận. Trang và bảng không tràn ngang/dọc ở 1100×800, 844×390, 568×320, 390×844; đã kiểm tra chạm chân dung mở quản lý ở 568×320. Chưa kiểm tra thiết bị Android/Safari thật hoặc luồng backend trong bản mẫu.

Phần **đơn góp đã được người dùng chấp nhận**, giữ nguyên trong lần thu nhỏ Sổ chuồng này. Màn quản lý trong prototype vẫn chỉ minh họa vị trí; bảng tác động tốc độ/sản lượng bằng dữ liệu thật đã được hoàn thiện riêng trong [runtime V4](ORDERS_ANIMAL_UI_V4.md).

Sau duyệt mới tích hợp bằng đúng ID con vật/đợt/món của engine, bảo toàn trang/lọc/lựa chọn khi polling, giữ `world.approach()` và xác nhận trước mọi thao tác tiêu tài sản. Không thay luật nuôi, mở khóa, trộm hoặc thưởng.

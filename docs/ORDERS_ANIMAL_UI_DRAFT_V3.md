# Đơn hàng và chăm sóc vật nuôi — hướng bố cục V3

> Không chọn triển khai: người dùng đánh giá vẫn giống web. Xem [hướng V4](ORDERS_ANIMAL_UI_DRAFT_V4.md); bản V3 giữ để đối chiếu lịch sử.

27/11/2026. **Phác thảo để duyệt lại sau phản hồi chưa hài lòng V1/V2; chưa thay runtime.**

## Vấn đề thực tế

Thẻ nuôi hai cột trong bảng hẹp khiến ảnh nhỏ, chữ/nút xuống nhiều dòng, mỗi trạng thái cao khác nhau và khó quét nhanh. Bảng đơn hàng có quá nhiều khung lồng nhau; mỗi nguyên liệu lặp một nhóm nút. Việc rút gọn chữ chưa tạo được thứ tự thị giác rõ ràng.

## Bản xem

- [Prototype tương tác](assets/orders-animal-ui-draft-v3.html), mở trực tiếp trong trình duyệt. Hai nút đầu trang chuyển giữa chăm sóc và đơn hàng.
- [Ảnh chăm sóc vật nuôi](assets/animal-care-draft-v3.png).
- [Ảnh đơn hàng](assets/orders-draft-v3.png).

Dùng ảnh Canvas và atlas vật nuôi/cây trồng hiện có, không vẽ lại sprite hoặc tăng tài nguyên runtime. Bối cảnh trong bản mẫu là ảnh chụp cũ để đối chiếu, không phải thay đổi map. Số liệu/luồng trong prototype là mô phỏng, không gọi API hoặc lưu tài sản.

## Hướng bố cục

**Chăm sóc:** một hàng ngang cho mỗi con, ảnh 56×48 rõ nét, tên và một trạng thái, bên phải một hành động hoặc ETA. Không đưa sản lượng, phần trăm, hai đồng hồ và thức ăn lên cùng một thẻ. Phân trang 4 hàng trên desktop, 3 hàng khi màn hình ngang thấp; có bộ lọc sẵn sàng/cần ăn. Bộ chọn đón thêm mở theo yêu cầu, không kéo dài danh sách bên dưới. Chạm tên để quản lý; runtime cần giữ điểm mở chi tiết qua bàn phím và nhãn truy cập rõ.

**Quản lý:** ảnh/tên/trạng thái, hai thông tin chính là sản lượng và thời gian. Thức ăn, sức sản xuất và tuổi kinh tế nằm trong mục mở rộng; chuyển chuồng/bán là hai hành động tách biệt. Vẫn phải xem trước giá và cảnh báo mất sản phẩm trước khi bán.

**Đơn hàng:** khung gỗ/giấy theo màu hiện có, một danh sách nguyên liệu dạng hàng. Mỗi hàng chỉ có ảnh, tên, kho bạn, phần thiếu và tiến độ nhỏ. Chọn hàng mới hiện **một** cụm Góp/Ghim/Cách có ở dưới. Mốc cá nhân ở chân bảng; điều kiện thưởng và người góp mở theo yêu cầu. Điều kiện không hoàn lại và mốc thưởng vẫn phải hiện lại trước xác nhận góp, không bị giấu ở luồng tiêu tài sản.

Đơn chợ trong mẫu chỉ minh họa một phiếu cùng cách trình bày; khi triển khai phải hỗ trợ tất cả đơn hiện có, phân trang và giữ lựa chọn sau polling. Không thay trộm, kinh tế, quota, ID vật nuôi hay ID đợt. Mục tiêu ghim và chỉ dẫn nguồn hàng P2.1 tiếp tục dùng hệ thống đã có.

## Kiểm chứng và điều kiện triển khai

Đã kiểm tra Chromium: phân trang/lọc, mở quản lý và cảnh báo bán, một cụm hành động cho món đang chọn, kho trống không góp được, ghim, số lượng sai bị chặn, đủ mốc 3 món và cảnh báo không hoàn lại. Bố cục không tràn ngang ở 1100×800, 844×390, 568×320 và 390×844. Chưa phải kiểm chứng luồng runtime/API hoặc thử trên thiết bị Safari thật.

Sau duyệt: dựng UI theo chính bố cục này trong bảng game thực tế, kiểm tra chiều cao vùng chơi/mobile, chọn lại đúng con bằng ID và đúng món/đợt sau polling, giữ phân trang/lọc; không đưa cả trang prototype vào production. Nếu không đạt độ rõ ở bảng hẹp thì chỉnh phác thảo trước, không thay bằng một bố cục khác lúc tích hợp.

# Dùng vật phẩm trực tiếp và lối tắt nông trại

Ngày 27/11/2026. Hoàn thiện source theo yêu cầu, chưa commit/push/deploy.

## Vật phẩm

Trong popup Nước/No bụng/Thể lực, mỗi ô món trong túi có hình hiện có, tên, số phần, tất cả chỉ số hồi tối đa và nút **Dùng · 1 phần**. Không cần mở chi tiết để sử dụng. Bấm hình vẫn xem chi tiết nếu muốn; không có nút lồng trong nút.

Các chỉ số dùng icon nước, bữa ăn, tia thể lực trong hệ SVG hiện có, kèm số riêng và nhãn truy cập/tooltip. Nút dùng gọi hành động `consume` cũ, giữ server xác nhận, cooldown chung, đang nghỉ và kiểm tra các tác dụng đã đầy. Hiện Đang dùng trong lúc chờ; chỉ đóng popup sau thành công, lỗi giữ khả năng thử lại. Không sửa lượng hồi hoặc công thức.

Desktop bốn món/trang, mobile ngang hai món/trang để có chỗ cho chỉ số/nút. Giữ trang qua polling, điều chỉnh khi hết item hoặc đổi kích thước. Thời gian chờ dùng bữa nằm ở tiêu đề Đồ trong túi, không đẩy nút/phân trang xuống ngoài popup ở màn hình thấp.

## Điều hướng

- Navbar desktop có Kho, Chuồng trại và Ao nuôi; không tạo thêm một mục Chuồng trại trùng mục cũ. Ao làng vẫn là nơi riêng.
- Kho mở kho người chơi tại cảnh hiện tại; nếu đang ghé hàng xóm thì trở về vườn mình trước. Ao nuôi mở Sổ ao của người chơi tại Vườn nhà. Chuồng trại mở scene hiện có. Workshop chỉ hiện khi đã mở khóa.
- Mobile ngang có ba icon lối tắt trong HUD khi bảng Công cụ đóng. Khi Công cụ mở, ẩn nhóm lối tắt để không tranh diện tích map; các tab Công cụ vẫn hoạt động. Menu Khu vực có đầy đủ tên, gồm Kho và Ao nuôi.
- Icon kho mái/kiện hàng, chuồng hình gà và ao có mặt nước/cá được bổ sung vào bộ symbol SVG 24×24 hiện có. Giữ nét viền và màu trầm của UI; không thay atlas hoặc tạo một hệ tranh mới.
- Tablet/desktop hẹp thu navbar thành icon: hiện tên khi hover hoặc focus bàn phím. Mọi nút có `title` và `aria-label`; trạng thái active phân biệt kho/ao nuôi/cảnh, không báo đang ở Ao nuôi khi thực tế là Ao làng hay vườn hàng xóm. Giữ focus lối tắt qua polling.

## Kiểm tra

223 kiểm thử tự động đạt, gồm hai test navigation mới về không trùng chuồng, tách ao nuôi/ao làng, workshop khóa và active đúng ngữ cảnh. Build đạt.

Edge với làng demo riêng: viewport 1100×850, 844×390, 568×320; đủ hình/số/chỉ số/nút, dùng trực tiếp một lần chỉ trừ một phần, khóa do cooldown, chuyển trang không bị polling đưa về đầu. Kiểm tra lối tắt Kho/Chuồng/Ao, menu mobile mở đúng và đóng sau chọn. Kiểm hover tên ở 850×850 và tên khi Tab/focus. Popup không cần cuộn để dùng/phân trang ở các viewport trên, kể cả sau khi dùng có cooldown.

Chưa thử trên thiết bị Safari/Android thật hoặc giao dịch production.

Ảnh: [dùng trực tiếp desktop](assets/direct-items-live-1100.png), [mobile 844](assets/direct-items-live-844.png), [mobile 568](assets/direct-items-live-568.png), [navbar desktop](assets/farm-nav-live-1100.png), [navbar mobile](assets/farm-nav-live-568.png), [hover tên](assets/farm-nav-tooltip-live-850.png).

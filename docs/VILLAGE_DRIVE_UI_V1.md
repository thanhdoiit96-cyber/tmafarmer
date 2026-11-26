# P2.1 — Đơn góp hàng và UI vật nuôi gọn V2

26/11/2026. Hoàn thiện trong source sau khi [phác thảo P2.1](VILLAGE_DRIVE_DRAFT_V1.md) được duyệt. Chưa commit/push/deploy.

## Đơn làng

- Cùng một bảng được dùng trong Chợ làng và Làng → Đơn hàng. Hai tab đều nhau phân biệt Đơn chợ (giao đủ một lần, người giao trước nhận trước) và Góp hàng làng (góp từng phần).
- Bảng giấy, nút xanh trầm và icon sản phẩm lấy từ atlas đang dùng. Thể hiện tổng còn thiếu, số đã góp cá nhân, mốc thưởng, phần thiếu mỗi món và lượng trong kho. Người góp nằm trong mục mở rộng, không tạo bảng xếp hạng lớn che nội dung.
- Ghim một món vào mục tiêu hiện có trong Việc cần làm. Thay mục tiêu đang ghim cần xác nhận; bỏ ghim không mất tiến trình. Lưu theo vườn/demo/online như mục tiêu cũ và gắn ID đợt. Đủ món, hoàn thành, hết hạn hoặc thay đợt chỉ đổi thông báo; không tự ghim món/đợt mới.
- “Cách có” nêu nguồn cây trồng/vật nuôi/công thức, nối chỉ dẫn mở khóa thật. Cây có nút tìm hạt giống ở chợ (lọc đúng giống, giữ `world.approach()` tới sạp); vật nuôi/công thức dẫn tới chuồng/xưởng. Không tự mua/gieo/thu/góp.
- Góp dùng action và xác nhận số lượng cũ. Bổ sung mốc thưởng cá nhân ngay trong xác nhận; hàng trừ khỏi kho và không hoàn lại khi hết hạn. Món đủ/đợt kết thúc không còn nút góp.

Không đổi thời hạn 48 giờ thực, yêu cầu 3 món, xu/XP/phiếu hoặc engine trả thưởng. Snapshot chỉ biết tổng mỗi người; UI không tự tạo lịch sử ai góp món nào. Máy chủ vẫn kiểm tra hạn, kho và nhu cầu mới nhất nếu hai người góp đồng thời hoặc snapshot đã cũ.

## Vật nuôi

- Thẻ chăm sóc chỉ có trạng thái, sản phẩm/lứa, tiến độ, ETA và hành động phù hợp. Bỏ bảng thông tin thức ăn lặp và giải thích dài khỏi từng thẻ.
- Lượng thức ăn cần chỉ có trên nút “Cho ăn · N phần”. Đang ăn thì hiện thời gian còn lại, không có nút cho ăn bị vô hiệu. Thiếu vật tư chỉ nêu phần còn thiếu. Đủ kỳ thu chỉ hiện nút Thu/Xuất chuồng; thu xong mới trở lại trạng thái cần ăn theo engine.
- Quản lý có ảnh/chuồng/trạng thái và bốn ô: sản lượng lứa này, ETA thực tế, thức ăn hiện tại, lượng mỗi lần ăn. Bỏ thời gian “tốc độ cơ sở” gây nhầm với ETA đã tính thời tiết.
- Thời tiết/sức sản xuất và chuyển chuồng được thu gọn. Số lứa/tuổi kinh tế, mức quy đổi save cũ và quy tắc offline vẫn có thể xem. Bán sống có giá xem trước và xác nhận riêng, cảnh báo mất vật nuôi/sản phẩm chưa thu.

Không thay backend nuôi, lượng thức ăn, giá bán, tuổi hoặc sức chứa. Giữ ID vật nuôi cho thao tác sau khi danh sách được sắp theo trạng thái; không lấy thứ tự hiển thị làm ID.

## Kiểm chứng

198/198 tests đạt, gồm mục tiêu cũ, ghim góp hàng qua reload/action, ID đợt/hết hạn đúng giây, nhu cầu/kho và kết thúc. Bộ API hiện có kiểm tra hai người cùng góp món cuối: một thành công, một từ chối; retry không nhân thưởng. Build, audit assets và catalog gameplay đạt. Public vẫn 22,66 MiB, không thêm atlas/migration database.

Chromium runtime dùng dữ liệu demo riêng: góp thật qua engine demo, mốc cá nhân, ghim/đi tới/thay có xác nhận/reload, nguồn hạt, tab đơn; thẻ nuôi đói/đang ăn/đã sẵn sàng; quản lý ETA và cảnh báo bán. Kiểm tra bố cục 844×390 và 568×320, mở quản lý bằng touch giả lập, không tràn ngang/JS exception. Chưa thử trực tiếp Safari hoặc Android thật; chưa có kết quả pilot người chơi.

- [Đơn làng](assets/village-drive-ui-v1.png)
- [Thẻ chăm sóc gọn](assets/animal-care-compact-v2.png)
- [Quản lý vật nuôi](assets/animal-management-v2.png)

Tiếp theo: đánh giá UX trên bản thử và thiết bị thật; P2.2 (nhu cầu theo làng nhỏ) cần thiết kế riêng để chốt nhu cầu một lần khi mở đợt, không sửa nhu cầu đợt đang chạy. Chưa thêm cơ chế hoàn hàng hoặc thưởng một phần.

# P3.3 — Xem thử trang trí trên vườn

Ngày: 27/11/2026. Trạng thái: hoàn thiện trong source cho các món trang trí đã có; chưa push/deploy. Cơ sở: [lộ trình](GAME_DEVELOPMENT_ROADMAP.md), [chuẩn UI](GAME_UI_STANDARD.md) và skill game-pixel-art.

## Phạm vi

Từ Nông trại → Đất → Trang trí vườn, chọn **Xem thử**. Khung xem dùng nền và các đối tượng hiện tại của chính vườn, đưa vùng nhìn đến vị trí đang chọn. Chọn vị trí khác cập nhật ảnh; vị trí đã có món khác bị khóa. Mẫu đang chuyển không xuất hiện đồng thời ở vị trí cũ và mới trong ảnh thử.

Ảnh thử dùng cùng `features`, `grass`, `actor`, `drawGardenDecor` và tài nguyên runtime. Khung ảnh 640×384, vùng nhìn 480×288 theo tỷ lệ game; props giữ nguyên footprint, baseline và thứ tự trước/sau. Có chỉ dấu vị trí và nhãn **Chưa đặt**, màu/sương theo thời tiết hiện tại. Đây là ảnh tĩnh, không phải một scene tương tác; không di chuyển nhân vật/camera đang chơi.

Được xem cả khi thiếu xu/phiếu; nút xác nhận khi đó bị khóa và có giải thích. Món chưa sở hữu phải chọn thanh toán bằng xu hoặc một phiếu. Chỉ **Xác nhận đặt** mới gửi action hiện có. Món đã sở hữu được chuyển miễn phí. Hủy xem thử, đóng hoặc Escape không gửi action và không sửa save. Đặt thành công trở lại danh sách, giữ trang; lỗi vẫn ở hộp thoại để xử lý.

Danh sách 13 món chuyển từ cuộn dài sang phân trang dưới: sáu món desktop, bốn ở mobile ngang, hai ở màn hình ngang thấp. Thay đổi kích thước giữ trang chứa món đầu tiên; trở lại từ xem thử giữ trang. Dùng khung giấy/gỗ và ảnh sprite đang có, không tạo tranh mới.

## Dữ liệu và an toàn thao tác

`decorPreviewFarm` chỉ tạo bản sao farm và bản sao `gardenDecor` để dựng ảnh. Không thêm quyền sở hữu, không trừ xu/phiếu, không ghi localStorage/API, không đổi va chạm. Không đưa dữ liệu thử vào action. Server vẫn xác thực vị trí trống, quyền sở hữu và tiền/phiếu qua `placeGardenDecor`; không thêm luật thanh toán thứ hai.

Không đổi schema, không migration, không đổi giá/kinh tế. Rollback các thay đổi client của đợt này sẽ về màn chọn vị trí cũ; các món đã đặt vẫn tương thích engine hiện tại.

## Kiểm chứng

- 227 kiểm thử đạt. Hai kiểm thử mới kiểm tra dữ liệu gốc không bị sửa, không đổi va chạm, chuyển không nhân đôi prop; đối chiếu actor trong ảnh thử với actor sau action thật. Thử món chưa mua khi không có tiền, tên/vị trí không hợp lệ và vị trí bị chiếm.
- Edge demo: desktop 1100×850, mobile ngang 844×390 và 568×320. Duyệt tất cả trang, đổi vị trí thay đổi ảnh, hủy giữ tài nguyên, mua bằng xu trừ đúng 75 xu, chuyển đồ đã sở hữu không mất xu. Bảng danh mục và xem thử nằm trong khung, không cần cuộn ở ba kích thước này.
- Kiểm tra riêng trên 568×320: thiếu tiền vẫn xem được và không xác nhận được, Escape đóng, dùng một phiếu khi 0 xu, toàn bộ vị trí đầy có hướng dẫn cất món thay vì form rỗng.
- Kiểm tra cất món sau khi chuyển và đổi desktop sang màn hình ngang thấp khi đang ở trang sau: món được cất đúng, trang mới vẫn chứa món đầu tiên đang xem.
- Build và kiểm tra tài nguyên đạt. Chưa kiểm tra trên Safari/iOS hoặc Android thật; chưa chạy pilot với người chơi.

Ảnh runtime: [844×390](assets/decor-preview-844.png), [568×320](assets/decor-preview-568.png).

## Phần chưa làm và bước tiếp

Đây là nền P3.3 cho props hiện có, không đánh dấu hoàn tất toàn bộ P3. Chưa có bộ tranh Hiên nhà mùa sen, skin cổng/hàng rào mới, stamp hoặc trang kỷ niệm P3.4. Chưa có dữ liệu pilot để kết luận về giữ chân/doanh thu. Bước mỹ thuật tiếp theo là P3.1: phác thảo trên bối cảnh runtime và duyệt trước khi xuất asset mới; không thay nền/cổng hiện tại bằng ý tưởng chưa duyệt.

# Giao diện vật phẩm V2 và va chạm công trình

Ngày: 25/11/2026. Theo phản hồi về cách trình bày giống trang web, thay bố cục danh sách V1 bằng ô vật phẩm ưu tiên hình ảnh. Giữ toàn bộ atlas cây/vật nuôi đã có theo skill `game-pixel-art`. Chưa commit, push hoặc deploy.

## Bố cục đã triển khai

- Bộ chọn giống dùng ba cột ô vật phẩm, nền kem viền gỗ, ảnh cây lớn và số hạt ở góc. Tên được rút gọn ở ô; tên đầy đủ giữ trong nhãn truy cập và chi tiết. Nút Gieo/Tìm giống riêng dưới ảnh. Khóa có nhãn và sắc nâu, không chỉ phân biệt bằng màu.
- Giữ hai nhóm Đã mở/Còn khóa, 6 giống/trang desktop và 3 giống/trang màn hình nhỏ hoặc ngang. Hover/Tab xem nhanh, click/chạm xem mô tả, đặc tính, số lượng và điều kiện. Không gieo khi xem ảnh.
- Bộ chọn vật nuôi dùng cùng ô ảnh, nhãn giá, hai nhóm và phân trang. Nút Đón riêng; thiếu xu hoặc hết chỗ giữ trạng thái không mua được. Hộp xem vật nuôi có số đang nuôi trong đúng chuồng, giá, thời gian cơ sở, thức ăn, sản phẩm và điều kiện XP/cấp chuồng. Giữ ngữ cảnh chuồng chính/mảnh mở rộng, bao gồm index 0.
- Thẻ vật nuôi đang nuôi được căn lại ảnh và thông tin trong khung cùng vật liệu/màu.
- Mục tiêu ghim chỉ hiện ở **Việc cần làm**: ảnh nhỏ, tên, điều kiện tóm tắt, bốn vạch mùa vụ nếu có, nút đi tới và menu đổi/bỏ. Thẻ dưới 100px trong kiểm tra màn hình ngang. Tên/điều kiện có thể xem thêm bằng nút chi tiết. Không xuất hiện ở Khu vực, Tiến độ, Kho, Xây dựng hoặc danh sách mua.
- Tóm tắt quay lại chỉ trình bày việc sẵn sàng và kho; mục tiêu được dành riêng cho Việc cần làm. Luật lưu/hoàn thành mục tiêu không thay đổi.

Ảnh runtime: [giống desktop](assets/game-ui-v2-seeds-desktop.png), [giống ngang](assets/game-ui-v2-seeds-landscape.png), [vật nuôi ngang](assets/game-ui-v2-animals-landscape.png), [chi tiết vật nuôi](assets/game-ui-v2-animal-detail-landscape.png), [mục tiêu trong Việc cần làm](assets/game-ui-v2-tasks-landscape.png).

## Điện thoại ngang, Android và iOS Safari

Bảng công cụ rộng tối đa 360px/48vw, giữ phần bản đồ bên trái. HUD và nút tương tác được dời sang phần bản đồ còn nhìn thấy khi mở bảng để tránh bị che. Dùng safe-area cho mép/notch, vùng cuộn riêng với `-webkit-overflow-scrolling: touch`, chiều cao `vh` dự phòng trước `dvh` và fallback kích thước Canvas trước `cqh`. Các ô điều khiển Gieo/Đón/chi tiết có mục tiêu chạm ít nhất 44px. Việc xem thông tin không yêu cầu hover trên điện thoại.

Đã kiểm tra bằng Chromium/Edge với thao tác chạm thật qua CDP tại 844×390, 740×360, 568×320, 844×320 và 390×844; không tràn ngang. Đây là kiểm tra bố cục và input, **không phải kiểm thử trên Android/iPhone thật hay engine Safari/WebKit**. Cần kiểm tra Safari trên thiết bị trước khi khẳng định tương thích đầy đủ, đặc biệt khi thanh địa chỉ thay đổi chiều cao hoặc có notch. Không dùng user-agent giả để coi là đã kiểm thử Safari.

## Va chạm và click công trình

Nguyên nhân: ảnh nhà/kho đã được bake lớn trong nền nhưng vật cản vẫn là dải chân của đối tượng cũ. Nhân vật có thể đi vào thân/mái được vẽ sẵn vì renderer không vẽ lại mái trước nhân vật.

Trong `world-layout.mjs`, thêm vùng chặn theo tỷ lệ nền 820×640 cho nhà và kho; xưởng dùng kích thước sprite hiện tại thay khung nhỏ cũ. Áp dụng cho vườn mình và vườn ghé thăm. Cửa, bậc trước và điểm tương tác vẫn nằm ngoài vùng chặn. Không thay nền hoặc dịch ô đất.

Vùng click nhà/kho/xưởng được mở rộng theo hình vẽ nhưng điểm đến vẫn là trước cửa. Click mái không yêu cầu nhân vật đi lên mái. Cả di chuyển phím và tìm đường tự động dùng `walkable`; `world.approach()` vẫn giữ nguyên vai trò.

## Kiểm chứng

- 145/145 bài kiểm thử đạt. Bài mới chặn các điểm trong mái/thân nhà, kho, xưởng; kiểm tra cửa và đường tới hotspots/ô đất; lấy mẫu từng đoạn đường để tránh cắt xuyên vật cản. Các kiểm thử vườn mở rộng, chuồng đầy và index 0 cũ vẫn đạt.
- Build production, kiểm tra asset và đối chiếu catalog gameplay đạt; không tăng tài nguyên runtime hình ảnh.
- Trình duyệt kiểm tra chạm xem giống/vật nuôi không tiêu tài nguyên; Đón gà chỉ thêm một con và trừ đúng 35 xu; khóa vật nuôi hiển thị cả XP và cấp chuồng; ghim chỉ xuất hiện trong Việc cần làm; các cỡ màn hình nêu trên không tràn ngang. Không ghi nhận lỗi JavaScript.
- Điều khiển thật: giữ W dừng trước thân nhà; sau đó vẫn đi qua cửa vào Nhà vườn. Click mái kho đi tới phía trước và mở kho; giữ W tại đó không đi vào thân kho.

Đây là cải thiện giao diện và va chạm; không đổi giá, sản lượng, điều kiện unlock, sức chứa, XP hay dữ liệu đã lưu. ETA/sản lượng P1.2 vẫn là công việc riêng.

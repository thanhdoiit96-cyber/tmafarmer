# P1.3 — Kiểm tra nghỉ dài

**Cập nhật sau kiểm tra:** người dùng bỏ nghỉ dưỡng, đã chuyển tuổi kinh tế sang [chu kỳ thu thành công](LIVESTOCK_CYCLE_AGE_V1.md). Các mức tuổi theo ngày và đề xuất nghỉ dưỡng bên dưới là kết quả lịch sử trước thay đổi; không dùng làm luật hiện hành.

Ngày 25/11/2026. Kiểm tra engine, save/snapshot, Việc cần làm và tóm tắt quay lại; chưa deploy. Không thêm UI, atlas, ảnh chụp hoặc dữ liệu lưu mới.

## Ma trận đã kiểm tra

Save thử có hai ô bắp (sâu và cỏ), một chuồng phụ cấp 2 với gà/lợn được cho ăn và bò chỉ đủ ăn 10 giây; một lứa rô phi đủ ăn và một lứa tôm chỉ đủ ăn 10 giây. Tất cả đồng hồ bắt đầu cùng thời điểm. Đây là fixture xác định, không phải mô tả mọi save người chơi.

| Nghỉ thực | Ngày game trôi qua | Cây | Con/ao | Tuổi gà | Đơn cũ |
| --- | ---: | --- | --- | --- | --- |
| 8 giờ | 1 | Hai ô chín, giữ thiệt hại đã gặp | Gà/lợn/rô phi sẵn sàng; bò/tôm cần ăn | Sung sức | Hết hạn |
| 24 giờ | 3 | Như trên, không thêm lượt thu | Như trên, hết ăn không tự lớn tiếp | Sung sức | Hết hạn |
| 3 ngày | 9 | Giữ vụ đã chín | Giữ con và lứa, không tự bán/thu | Lớn tuổi | Hết hạn |
| 7 ngày | 21 | Giữ vụ đã chín | Giữ con và lứa, không tự bán/thu | Già | Hết hạn |

Các mốc trên được kiểm tra đúng thời điểm ranh giới. Tóm tắt hiện đúng 2 ô cây, 2 vật nuôi và 1 lứa thủy sản sẵn sàng; việc cần ăn giữ đúng đích. Chuồng phụ vẫn 4 chỗ và giữ hàng rào. Xu, XP, kho không tự tăng. Đất trống chai sau 8 giờ thực theo luật hiện tại.

Ngoài fixture: toàn bộ loại cây × hai nguy cơ sâu/cỏ vẫn trưởng thành sau 7 ngày và không thay đổi sản lượng khi đã chín. Kho đầy chặn thu nhưng không xóa cây hoặc cộng đồ. Gửi đơn cũ bị từ chối trước khi lấy hàng/xu. Lợn xuất một lần giữ quy tắc tuổi riêng, không giảm năng suất theo tuổi như loài cho sản phẩm lặp.

## Lỗi phát hiện và đã sửa

`eachWeather` trước đây bắt đầu từ `max(at, now - 4 × gameDay)`, tức chỉ xét 32 giờ cuối của khoảng tính bù. Với cây chưa được lưu tiến độ trong nhiều ngày, engine dùng thời tiết gần ngày quay lại thay cho thời tiết lúc mới gieo. Điều này làm lệch sâu/cỏ, phơi thời tiết và sản lượng so với cùng save được tính thường xuyên. Trong ví dụ bắp 7 ngày, đường tính cũ gặp mây thay vì nắng ở thời điểm gieo.

Đã sửa:

- Duyệt từ đúng timestamp đã lưu.
- Cho callback dừng khi cây đã chín, tránh duyệt hết thời gian vắng mặt sau khi không còn tăng trưởng.
- Con và ao giữ giới hạn tính đến khi hết thức ăn; không thêm lượt sản phẩm, không tự cho ăn.

Kiểm thử so sánh tính thẳng 7 ngày với từng bước 5 phút: tiến độ, sâu/cỏ, sản lượng cây và tiến độ vật nuôi khớp trong sai số số thực. Không thay các hệ số kinh tế/chăm sóc hoặc lịch thời tiết. Vụ đang chín đã được lưu giữ nguyên; vụ chưa lưu tính bù lại sẽ có kết quả đúng hơn, nên có thể khác bản lỗi trước.

## Rủi ro trải nghiệm còn lại

1. Loài cho sản phẩm lặp tính tuổi từ `acquiredAt`, kể cả lúc offline. Đúng 3 ngày thực vào mức Lớn tuổi, đúng 7 ngày vào mức Già; năng suất có làm tròn và tối thiểu một món nên không thể gọi mọi loài giảm đúng cùng một tỷ lệ phần trăm thực nhận.
2. Chỉ chờ không tạo nhiều lứa sản phẩm tích lũy. Người quay lại lâu cần thu rồi chăm tiếp; đây là luật hiện tại, không phải mất dữ liệu.
3. Các đơn làng thường đổi mỗi 8 giờ thực. Hết hạn không phạt kho nếu chưa giao; đợt góp hàng và thưởng góp ít thuộc phạm vi P2, chưa được chứng nhận bằng ma trận này.
4. Kiểm thử dùng engine/DB hồi quy, không mô phỏng trình duyệt chạy nền thật, mất điện hoặc nhiều thiết bị. Chưa đánh giá giữ chân người chơi bằng dữ liệu thực tế.

## Đề xuất sau kiểm tra — chưa triển khai

Ưu tiên phác thảo **nghỉ dưỡng vật nuôi** để tránh cảm giác phải bán con đã gắn bó. Trước khi code cần duyệt riêng: cách tính tuổi khi offline, quyền lợi/con số năng suất, chuyển đổi save cũ, chuyển chuồng/bán lúc nghỉ, chống bật/tắt để vượt giới hạn và thông tin người chơi nhìn thấy. Không tự hồi trẻ, hoàn lại thiệt hại, tặng thức ăn hoặc thưởng vắng mặt trong đợt này.

Kế tiếp có thể dựng bản phác thảo nghỉ dưỡng và flow P1.4 làng thân thiện; chưa thay trộm hoặc điều kiện ngày an ninh. P1.3 phần kiểm tra đã hoàn thành; phần thay chính sách vẫn chờ duyệt, không đánh dấu toàn bộ P1 hoàn tất.

## Kiểm chứng và dung lượng

`test/long-absence.test.mjs` bổ sung 11 trường hợp, gồm bốn mốc nghỉ, đơn cũ, tính bù từng bước, tất cả cây và kho đầy. Bộ hồi quy, build, asset audit và catalog check đạt. Dọn `dist` sau xác minh; không cần profile browser hoặc ảnh mới cho thay đổi engine này.

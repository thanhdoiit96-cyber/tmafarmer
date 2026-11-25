# Phác thảo nghỉ dưỡng vật nuôi V1

**Đã bỏ qua theo yêu cầu người dùng. Không triển khai runtime. Thay bằng [tuổi kinh tế theo chu kỳ](LIVESTOCK_CYCLE_AGE_V1.md).** Nội dung dưới đây chỉ giữ để tham chiếu lịch sử, không còn là hướng tiếp theo.

Trạng thái: **đề xuất để duyệt, chưa triển khai gameplay**. Tiếp nối [kiểm tra nghỉ dài P1.3](LONG_ABSENCE_AUDIT_V1.md). Prototype chạy độc lập, không gọi API hoặc đọc/ghi dữ liệu game.

## Mở bản mẫu

[Mở HTML tương tác](assets/livestock-rest-draft-v1.html) trực tiếp bằng trình duyệt. Dùng các nút ở thanh PHÁC THẢO để xem con đang nuôi, đã già, đang có sản phẩm hoặc đã nghỉ 7 ngày. Thử Cho nghỉ → hủy/xác nhận → mô phỏng thêm 7 ngày → Đón về.

[Xem ảnh phác thảo](assets/livestock-rest-draft-v1-preview.png).

Giữ hình cừu, nền chuồng và màu giao diện hiện có; đây là bố cục UI minh họa, không phải scene gameplay mới hoặc asset cần vẽ lại. Các chỉ số mẫu dùng để giải thích, không hiển thị giới hạn prototype trong sản phẩm thật.

## Đề xuất lựa chọn

**Nghỉ dưỡng chủ động, miễn phí, vẫn chiếm chỗ trong chuồng.** Dành cho loài cho sản phẩm lặp (gà, bò, cừu, trâu…). Người chơi có thể giữ con đã gắn bó, tạm ngưng chăm sóc và chủ động đón về, thay vì chỉ thấy lựa chọn bán.

| Khi nghỉ | Đề xuất |
| --- | --- |
| Tuổi nuôi | Dừng tăng tuổi kinh tế; không trẻ lại |
| Tiến độ lớn/tạo sản phẩm | Giữ đúng tiến độ lúc gửi nghỉ, không tự chạy tiếp |
| Sản phẩm đã sẵn sàng | Giữ nguyên, đón về rồi thu; không tự thu vào kho |
| Thức ăn đã dùng | Giữ số giây còn lại, đón về tiếp tục dùng; không hoàn vật tư |
| Sức chứa | Giữ nguyên chuồng/ô và chiếm một chỗ như bình thường |
| Giá, thưởng | Không phí, không thưởng, không nhân sản lượng |
| Thời gian nghỉ | Không bắt buộc chờ, không tự kết thúc |
| Vật nuôi già | Vẫn già và giữ mức năng suất hiện tại, không hồi trẻ |
| Lợn/thỏ xuất một lần | Chưa áp dụng V1 vì không bị giảm năng suất theo tuổi như loài lặp |

Không cần cooldown: tắt/bật không tạo sản phẩm, không giải phóng chỗ, không trả thức ăn hay tiền. Nếu sau này thêm quà/thưởng nghỉ hoặc giải phóng chuồng, phải thiết kế lại chống lợi dụng trước.

**Giới hạn:** người chơi cần gửi nghỉ trước khi vắng mặt. V1 này không tự bảo vệ con đang nuôi khi quên mở game, không xử lý hồi tố bảy ngày đã trôi qua. Không nên quảng bá là “offline không già”. Nếu muốn loại bỏ áp lực quay lại, cần duyệt thay đổi lớn hơn như chỉ tính tuổi theo chu kỳ chăm sóc; không gộp âm thầm vào nghỉ dưỡng.

## Flow và UI

1. Từ nút ⓘ của con vật mở chi tiết hiện có. Thêm mục nhỏ Nghỉ dưỡng và nút Cho nghỉ, không thêm nút vào mọi thẻ nhỏ.
2. Xác nhận nêu miễn phí, giữ chỗ, dừng tuổi/tiến độ và số phút thức ăn thực còn lại. Có sản phẩm sẵn thì nói rõ được giữ để thu sau khi đón.
3. Thẻ đang nghỉ có nhãn “Đang nghỉ dưỡng”, giữ hình con vật trong chuồng; không hiện đói/cần cho ăn hoặc việc thu khẩn cấp. Nút chính Đón về thay các nút chăm/thu.
4. Đón về xác nhận ngắn rồi tiếp tục đồng hồ từ trạng thái đã giữ. Không tự cho ăn, tạo sản phẩm hoặc nhận thưởng.
5. Con già hiển thị đúng tuổi và năng suất, tránh lời “khỏe lại” hoặc “tăng năng suất” sai cơ chế.

Giữ chuyển chuồng khi đang nghỉ nếu chuồng đích đủ điều kiện/chỗ. Chuyển không xóa trạng thái nghỉ, không thay các đồng hồ. Bán vẫn dùng xác nhận hiện có, nói rõ mất sản phẩm chưa thu; trả đúng giá theo tuổi kinh tế đã giữ, không cộng lợi ích cho nghỉ. Không đặt lại tuổi bằng đổi tên/chuyển chuồng.

Trên mobile ngang: không mở thêm panel nổi; tái sử dụng dialog chi tiết, nút ngắn, phần giải thích thu gọn. Giữ hình đã duyệt và nhịp animation nghỉ nhẹ hiện có, không thêm atlas trong V1.

## Thiết kế dữ liệu dự kiến — chưa code

Một phương án tối thiểu cho mỗi pen:

```text
restedSeconds: tổng giây nghỉ đã kết thúc, mặc định 0
rest: null hoặc {startedAt, feedRemaining}
```

Tuổi kinh tế dự kiến: `max(0, now - acquiredAt - restedSeconds - currentRestSeconds)`. `currentRestSeconds` chỉ tính khi đang nghỉ. Không sửa `acquiredAt` để giữ lịch sử ngày đón. Save cũ không có các trường này giữ đúng tuổi hiện tại; không tự đặt tuổi về 0. Pen thiếu `acquiredAt` dùng mốc chuẩn hóa engine hiện có, không lấy ngày đăng nhập mới làm ngày sinh.

Khi bắt đầu nghỉ, server project con đến thời điểm thao tác rồi giữ age/progress, lưu thức ăn còn lại và mốc bắt đầu. Khi đang nghỉ, projection không tăng age/progress; tuổi kinh tế và lượng thức ăn đọc từ trạng thái giữ. Khi đón, cộng thời gian nghỉ vào restedSeconds, đặt `at=now`, phục hồi `fedUntil=now+feedRemaining`, xóa rest. Không project bù toàn bộ khoảng nghỉ một lần nữa.

Năng suất/giá bán phải dùng chung hàm tính tuổi kinh tế; sửa chỉ UI là sai. Không giữ một bản sao toàn pen trong rest vì dễ lệch khi chuyển chuồng/bán. Không tự thay đổi pen của loài chưa hỗ trợ.

## Các tích hợp bắt buộc nếu được duyệt

| Khu vực | Công việc |
| --- | --- |
| Engine | Hai action riêng để gửi/đón; kiểm tra owner, ID ổn định, loài, trạng thái và timestamp server |
| Projection/tuổi | Snapshot không làm con nghỉ già đi hoặc hết phần thức ăn được giữ; không bù thời gian nghỉ khi đón |
| Chuồng chính/phụ | Con nghỉ vẫn được tính bởi kiểm tra đón/chuyển, kể cả ô index 0; không thay sức chứa |
| Thu/cho ăn | Server từ chối khi nghỉ; client ẩn nút chỉ là phần trình bày |
| Việc cần làm/tóm tắt | Không đếm con nghỉ là đói/sẵn sàng thu; có đường mở danh sách đang nghỉ khi người chơi muốn đón |
| Hàng xóm | Hiện hình nghỉ nhưng không lộ field nội bộ; không tự đưa sản phẩm đang nghỉ vào nguồn lấy/câu |
| Retry/đồng thời | Cùng requestId chỉ một lần; gửi lại action không phù hợp bị từ chối; nghỉ/thu/bán/chuyển cuối cùng được quyết định trên state server |
| Save và rollback | Mặc định cũ không nghỉ. Sau khi có pen nghỉ, bản cũ không hiểu rest sẽ tính sai; không rollback chỉ UI/code cũ mà chưa có phương án xử lý state |

Việc giữ con nghỉ có sản phẩm không làm mất quyền lấy từ kho của hàng xóm theo luật hiện có. Không gọi đây là lá chắn chống trộm toàn nông trại.

## Bộ kiểm thử cần có khi triển khai

- Con non, trưởng thành, già; con đang có sản phẩm; con hết hoặc còn thức ăn; loài xuất một lần.
- Gửi nghỉ → reload → 8 giờ/24 giờ/3 ngày/7 ngày → đón về: tuổi, tiến độ, phần thức ăn và năng suất khớp; không có lứa thứ hai.
- Bật/tắt cùng giây, hai thiết bị, retry, nghỉ đồng thời với thu/bán/chuyển, sai ID, thao tác con của hàng xóm.
- Chuồng đầy, chuồng phụ index 0/cấp 2, chuyển giữa chính/phụ, bán trong lúc nghỉ.
- Đồng hồ client sai, chuyển ngày game, save thiếu field, loài bị sửa nội dung, rollback có state nghỉ.
- Mobile ngang Android/iOS Safari, bàn phím, focus sau dialog/polling; không tăng số ảnh/profile lưu lại không cần thiết.

## Phạm vi bản phác thảo

HTML chỉ mô phỏng trạng thái trong RAM. Mô phỏng thời gian dựa trên ví dụ cố định và thời gian cơ sở, không thay thế engine thời tiết. Đóng/mở bản mẫu sẽ reset. Không thêm mã gameplay, migration, hình vẽ mới hoặc chính sách hồi trẻ. Cần duyệt bộ quy tắc này trước khi triển khai runtime theo yêu cầu trong roadmap P1.3.

Đã kiểm tra script và bản mẫu trong Edge/Chromium: hủy không đổi trạng thái; nghỉ giữ tuổi/tiến độ/thức ăn qua mô phỏng 7 ngày; đón về tiếp tục; con già không trẻ lại; sản phẩm sẵn giữ qua nghỉ và chỉ thu sau đón. Không lỗi JavaScript hoặc tràn ngang ở desktop 1050 × 720, ngang 844 × 390/568 × 320 và dọc 390 × 844; kiểm tra chạm mở/hủy dialog. Chưa kiểm tra iOS Safari thật. Chỉ lưu một ảnh, dọn profile sau kiểm chứng. Không chạy lại build/test engine vì không đổi runtime hoặc luật chơi.

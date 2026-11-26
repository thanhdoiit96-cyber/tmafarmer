# Sâu nghịch có giới hạn — V1

**Cập nhật theo yêu cầu mới:** [Ghé thăm/luật V2](NEIGHBOR_VISIT_UI_V2.md) đã bật nghịch mặc định, bỏ nút và guard opt-in, áp dụng cả save từng tắt; cấp, cổng, quota và miễn nhận giữ nguyên. Phần opt-in và kiểm chứng bên dưới là lịch sử V1, không phải hành vi hiện tại.

Ngày 26/11/2026. Hoàn thiện trong source, chưa commit/push/deploy. Tiếp nối [giúp tưới và Hồ làng](SOCIAL_LAKE_V1.md), theo [phác thảo đã chọn](SOCIAL_PLAY_AND_LAKE_DRAFT_V1.md).

## Cách chơi

1. Đạt cấp nông trại 3 (70 XP). Trong Hàng xóm, mở **Nghịch vui** để bật nhận nghịch; save cũ và người mới mặc định tắt. Tắt lựa chọn này không ngăn người khác lấy trộm theo luật cũ.
2. Hồ làng → Ven ao: đổi **2 dấu ao lấy 1 lọ sâu nghịch**. Thức ăn và lọ dùng chung giới hạn một gói/ngày game. Giữ tối đa 2 lọ; lọ không mua, bán, đăng chợ hoặc chuyển cho người khác, không tính tài sản.
3. Ghé hàng xóm → Nghịch vui: chọn cây phù hợp. Nhân vật tự đi đến ô rồi máy chủ kiểm tra lại điều kiện. Danh sách 6 ô/trang, có tên ruộng/vườn và số ô chính xác.
4. Chủ vườn chọn ô bị nghịch → **Bắt sâu nghịch · Miễn phí**. Nhân vật đi tới ô và dùng lại động tác chăm cây; không tiêu thuốc/vật tư, không thưởng hoặc trả lọ. Trong mục Nghịch vui có nút tới ô đang chịu hiệu ứng.

## Luật bảo vệ

| Điều kiện | V1 |
| --- | --- |
| Người thả và chủ vườn | Cả hai từ cấp 3; chủ bật đồng ý |
| Cổng chủ vườn | Đang mở |
| Cây | Giai đoạn 2 trở lên (ít nhất 25% tiến độ), dưới 90%, sâu và cỏ tự nhiên đều dưới 20% |
| Chi phí | 1 lọ cho một lần hợp lệ; lần bị từ chối không trừ gì |
| Lượt thả | 2/người/ngày game; một lần với cùng chủ |
| Lượt nhận | 2/chủ/ngày game, gộp cả làng |
| Hiệu ứng đồng thời | Tối đa một ô trong cả vườn; không cộng dồn/gia hạn |
| Tác động | Tốc độ nhân 0,9, tối đa 180 giây thực |
| Miễn nhận | Đến 30 phút sau hạn hết tự nhiên ban đầu; bắt sớm/tắt nhận không rút ngắn thời hạn này |
| Ngày game | 8 giờ; reset quota không reset hiệu ứng/miễn nhận |

Thả, bắt, bật/tắt nhận nghịch không cho xu, XP, dấu ao hoặc tiến độ việc làng. Lượt trộm và an ninh làng vẫn dùng luật cũ; cùng một người có thể giúp, nghịch và lấy đồ nếu từng hành động đủ điều kiện.

Sâu nghịch tách riêng khỏi `pests/pestPeak`, `weeds/weedPeak`. Không gây hình phạt mất sản phẩm trực tiếp. Độ trễ vẫn có thể đổi thời tiết và thời gian phơi nhiễm tự nhiên mà cây trải qua; vì vậy không bảo đảm sản lượng cuối luôn giống cây chưa bị nghịch. Tỷ lệ −10% hiển thị riêng trong bảng tác động và có đồng hồ tự hết, không dùng biểu tượng sâu tự nhiên để báo nguy giả.

## Tích hợp dữ liệu và thời gian

- Luật dùng chung ở `public/prank.mjs`, phiên bản quy tắc 1, đóng gói cho client/server. JSON farm thêm `prankEnabled`, `prankJars`, `prankDaily`, `prankActive`, `prankImmuneUntil`; thiếu trường tương đương chưa đồng ý/không có lọ/không có lịch sử. Không cần migration SQL.
- Mỗi plot chỉ lưu một khoảng `prank: {startedAt, until}`. Tính tăng trưởng chia đúng ranh giới bắt đầu/kết thúc, thời tiết, hết ẩm và bảo vệ sâu/cỏ. Hiệu ứng hết theo timestamp tuyệt đối dù chủ offline; snapshot không gia hạn.
- Bắt/tắt nhận phải tính bù tiến độ đến thời điểm hành động trước, rồi rút ngắn `until`. Giữ lịch sử khoảng đã chịu để không làm lại tiến độ quá khứ; lần thả mới chỉ ghi sau khi tính bù khoảng cũ. Không lưu danh sách sự kiện vô hạn.
- API kiểm tra presence mới, đúng chủ vườn, đúng ô và điều kiện tại lúc đến đích. Bắt chỉ ở ruộng chính chủ. Ô 0 và namespace ô mở rộng đều được hỗ trợ.
- Lọ/quota/hiệu ứng/miễn nhận cập nhật trong cùng revision CAS với request ID hiện có. Request lặp không tiêu thêm lọ; nhiều người cùng thả chỉ một người thắng khi vườn chưa có hiệu ứng. Hai gói quà đổi đồng thời chỉ một gói thành công.
- Nhật ký giữ giới hạn 14 dòng hiện có. Hiệu ứng không sửa background, collision hoặc dữ liệu cá/giúp tưới.

## Kiểm chứng

- **186/186 kiểm thử đạt**, gồm 9 kiểm thử mới: quyền nhận mặc định, cấp, cổng, giai đoạn/áp lực cây, quota cá nhân/chủ/cả làng, bảo vệ qua ngày/bật tắt, ô mở rộng/ô 0, bắt không dùng thuốc, nguồn lọ, không giao dịch, API sai chủ/đồng thời/replay.
- Mô phỏng nghỉ 7 ngày so với cập nhật mỗi phút đạt cho sâu/cỏ tự nhiên, có/không phân bón, đổi thời tiết và hết ẩm. Kiểm tra cửa sổ 180 giây cho đúng mức chậm tích phân, không sửa trực tiếp đỉnh sâu/cỏ hoặc công thức năng suất.
- Kiểm tra thực sự giúp + trộm + nghịch cùng một chủ không dùng chung quota. Bộ kiểm thử gameplay cũ tiếp tục đạt.
- Edge/Chromium, chơi thử: bật nhận, đổi lọ, tự đi tới ô 0 thả, bắt trên vườn mình, giữ nguyên thuốc/sâu tự nhiên/lượt trộm; bật/tắt không xóa miễn nhận. Không lỗi JavaScript. Desktop 1100×800 và mô phỏng chạm ngang 844×390, 568×320 không tràn ngang. Chưa kiểm tra Safari iOS hoặc Android thật.
- Build, audit asset và kiểm tra tài liệu gameplay đạt. Không thêm PNG/atlas; public asset vẫn 22,63 MiB. Dùng lại động tác gieo cho thả, chăm/thu cho bắt theo skill mỹ thuật.

## Tiếp theo

Chạy pilot với người chơi để đánh giá tần suất dùng/tắt nhận, cảm giác bị làm phiền và lượng lọ phát. Phần mỹ thuật bờ ao/NPC chỉ làm sau phác thảo gắn đúng cảnh được duyệt. Chưa mở thưởng trả đũa, mua lượt, bảng xếp hạng phá hoại hoặc tăng tác hại để ép online.

# Pilot tương tác hàng xóm và Hồ làng

26/11/2026. **Kế hoạch thử với người chơi, chưa chạy và chưa có kết quả.** Mục đích là đánh giá cảm giác chơi và mức dùng phần thưởng, không phải kiểm thử tải. Phạm vi source: [Ao/giúp tưới](SOCIAL_LAKE_V1.md), [sâu nghịch](PRANK_PLAY_V1.md).

## Cách tổ chức

Thử ở một làng riêng, khoảng 5–12 người tự nguyện; có cả người chưa đạt cấp 3, người chỉ thích chơi một mình và người dùng mobile ngang. Dành ít nhất ba ngày game (mỗi ngày 8 giờ), không yêu cầu online liên tục. Không sửa XP/vật tư của người đang chơi production để tạo mẫu.

Giới thiệu rõ rằng lấy trộm cũ vẫn có, tưới giúp và nghịch dùng quota riêng, nhận nghịch mặc định tắt. Không ép bật nghịch để hoàn thành thử nghiệm; người chọn tắt là phản hồi hợp lệ. Không phát quà theo số vụ nghịch hoặc số người mời.

Chưa deploy hoặc gửi lời mời tự động. Người vận hành chọn bản thử và lịch cụ thể rồi mới mời người chơi. Không thu chat, mật khẩu, token hoặc tên thật.

## Các tình huống cần quan sát

| Nhóm | Việc thử | Điều cần hỏi/ghi nhận |
| --- | --- | --- |
| Khám phá | Tự tìm chỗ dọn bờ, thử câu, xem sổ | Có hiểu vì sao ra ao? Có phân biệt nhiệm vụ với nút nhận quà? |
| Tương trợ | Tưới một ô đang cần; thử lại ô ẩm | Có hiểu chi phí thuộc người giúp? Chủ có muốn tắt nhận? |
| Nghịch tự nguyện | Hai người đồng ý thử thả/bắt; người khác giữ tắt | Có phân biệt sâu nghịch với sâu tự nhiên? Có thấy bị ép bật? |
| Chống làm phiền | Thử tiếp khi vườn đang chịu hiệu ứng hoặc miễn nhận | Thông báo có giải thích đủ? Có lo mất mùa nếu offline? |
| Kinh tế ao | Dọn, đổi một gói; ngày sau thử gói còn lại | Có lý do chọn thức ăn/lọ? Có hiểu hai gói chung giới hạn ngày? |
| Quay lại | Nghỉ qua hiệu ứng rồi mở game | Có thấy thông tin vừa đủ, không dồn popup? |
| Thiết bị | Android/iOS ngang, chạm và bàn phím desktop | Nút có dễ chạm, che map hoặc khó đóng/mở bảng? |

## Dữ liệu vừa đủ và giới hạn diễn giải

Ghi thủ công bằng mã người thử P01…P12, ngày game và bản build. Chỉ hỏi mức độ khó chịu 1–5, tác vụ hiểu/không hiểu, lựa chọn nhận nghịch và lý do. Không cần thêm dịch vụ analytics trước khi biết câu hỏi nào hữu ích.

Nếu người vận hành kiểm tra state ở môi trường thử, chỉ ghi số tổng hợp tại cùng mốc cuối ngày: số người đã dọn (`lakeDaily.worked`), đã đổi (`exchanged`), số lượt giúp/thả/nhận, tổng lọ/dấu còn giữ. Không lưu bản sao toàn farm hoặc token vào tài liệu. Không cộng hai snapshot cùng ngày để suy ra tổng lượt; quota là counter hiện tại, reset theo ngày.

State hiện tại **không cho biết** số lần bật/tắt nhận nghịch, lý do rời game, lịch sử mọi lần phát/tiêu lọ hay retention. Không suy ra các chỉ số này từ cờ cuối ngày hoặc log 14 dòng. Hỏi trực tiếp, ghi quan sát; nếu cần telemetry sau pilot thì đặc tả sự kiện và thời hạn lưu riêng trước khi thêm code.

| Mã người thử | Thiết bị | Hiểu giúp/nghịch/trộm? | Khó chịu 1–5 | Nhận nghịch? Vì sao? | Một vướng mắc cụ thể |
| --- | --- | --- | --- | --- | --- |
| P01 | Chưa ghi | Chưa thử | — | — | — |

## Cách quyết định sau pilot

- Bất kỳ lỗi mất đồ, nhân thưởng, bỏ qua opt-in/quota hoặc phá đường đi: dừng thử tình huống đó và sửa trước khi mở rộng.
- Nếu người thử nhầm sâu nghịch thành nguy cơ mất mùa hoặc không tìm thấy nút bắt: sửa nhãn/chỉ dẫn trước; không tăng phần thưởng để bù sự khó hiểu.
- Nếu có phản hồi bị quấy rối dù đã đủ guard: xem lại tần suất/miễn nhận hoặc chuyển hiệu ứng sang thuần hình ảnh. Giữ quyền tắt nhận.
- Nếu ít người ra ao: hỏi lý do và xem khả năng tìm đường/ý nghĩa hoạt động, không tự tăng tiền hay thêm việc bắt buộc.
- Với mẫu nhỏ, chỉ kết luận vấn đề UX và giả thuyết cần thử tiếp. Chưa kết luận giữ chân, doanh thu hoặc cân bằng kinh tế dài hạn.

Kết quả thật phải ghi ngày/build, số người tham gia, những gì quan sát được và thay đổi đề nghị; không thay các ô trống bằng số liệu mô phỏng.

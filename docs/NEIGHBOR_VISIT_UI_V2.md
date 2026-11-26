# Ghé thăm hàng xóm — UI và luật nghịch mặc định V2

26/11/2026. Đã thực hiện trong source theo yêu cầu mới; chưa commit/push/deploy. V2 thay phần bật/tắt nhận nghịch của V1, không thay quota hoặc cơ chế lấy trộm.

## Giao diện

- Danh sách làng giữ nhà theo mốc tài sản và phân khu hiện có; thẻ nhà nhỏ gọn, tên/cấp/tài sản/trạng thái cổng và nút Ghé thăm cùng một cấu trúc. Nhà của mình vẫn xuất hiện.
- Khi ghé: đầu bảng là hình nhà, tên chủ, cấp, ruộng, vật nuôi và nút về danh sách. Ngay dưới là lượt còn lại cho Lấy/Giúp/Nghịch.
- Bốn tab **Vườn & kho / Tưới giúp / Nghịch vui / Ao nuôi** chỉ hiện nhóm đang xem. Không đặt tất cả form và luật chơi thành một trang dài.
- Vườn & kho có bộ lọc Ngoài vườn/Trong kho, tối đa sáu món mỗi trang. Tưới giúp và Nghịch vui cũng sáu ô/trang. Item dùng hình nông sản hiện có, tên mở chi tiết, nhãn ruộng/vườn/ô và nút hành động ngắn.
- Lý do bị khóa nằm trong tab liên quan: cổng đóng, hết lượt, cây đủ ẩm, vườn đang có hiệu ứng/miễn nhận, thiếu lọ/cấp. Chi tiết quota dài nằm trong phần gấp Giới hạn & bảo vệ.
- Lựa chọn nhận tưới giúp vẫn có ở phần gấp trong danh sách làng. Nút bật/tắt nghịch đã bỏ hoàn toàn.
- Click ô/công trình trên map mở đúng tab và trang: ô chín → lấy, cây khô → giúp, cây phù hợp → nghịch; kho → Trong kho, cầu → Ao nuôi. Ô 0 và namespace mở rộng không bị bỏ qua. Tab/trang/focus giữ qua polling, chuyển sang chủ khác reset bộ chọn.

Màu giấy, viền gỗ, thẻ và tab dùng cùng hướng UI Hồ làng/Kho/Chuồng. Không thêm bitmap hoặc thư viện.

## Luật mới được yêu cầu

Nghịch vui **bật sẵn cho mọi vườn**, vẫn chỉ thả/nhận khi cả hai đạt cấp nông trại 3. Không phải vào phần cài đặt, không còn quyền bật/tắt qua UI.

Save cũ thiếu `prankEnabled`, có `true` hoặc từng lưu `false` đều dùng cùng luật mặc định. Engine không dùng cờ cũ làm guard; snapshot trả `prankEnabled:true` để client đọc nhất quán. Không cần sửa SQL hoặc reset farm. Raw flag cũ có thể còn trong JSON nhưng không còn tác dụng trong luật V2.

Action `prankPreference` từ client cũ bị từ chối với thông báo tải lại giao diện; không hủy sâu đang có hoặc xóa miễn nhận. Chủ vẫn bắt sâu nghịch miễn phí trên ô của mình. Không tự phục hồi hiệu ứng đã kết thúc trước khi cập nhật.

Giữ các bảo vệ: hai lượt/người/ngày, một lần cùng chủ, chủ nhận tối đa hai lần/ngày, một hiệu ứng/vườn, cổng đóng, lọ tối đa hai, điều kiện giai đoạn/áp lực tự nhiên, giảm tốc 10% tối đa ba phút và miễn nhận 30 phút sau hạn tự hết. Quota trộm/giúp/nghịch độc lập. Không có giảm sản phẩm trực tiếp do sâu nghịch.

Đổi lọ tại Hồ làng giữ nguyên giá và hạn mức một gói/ngày; chỉ sửa lời giải thích cũ về đồng ý. Không chỉnh giá, RNG, cá hoặc kinh tế.

## Kiểm chứng

- 192/192 kiểm thử đạt. Save mới/thiếu cờ/từng tắt đều nghịch được; vẫn chặn sai cấp/cổng/quota/túi/áp lực/miễn nhận. API xác thực đúng chủ và chống lặp/đồng thời tiếp tục đạt; toggle cũ không hủy hiệu ứng. Phân trang và chọn tab theo plot ID được kiểm tra riêng.
- Edge/Chromium: sáu item/trang, trang 2 giữ sau poll, chuyển nguồn kho, bốn tab không trộn nội dung, xem đúng ao. Từ save `prankEnabled:false`, thả thành công khi đến cây; tưới và lấy ô 0 cùng vườn vẫn tính ba quota riêng.
- Chạm tab/quay lại/ghé tiếp ở 844×390 và 568×320 đạt; tên dài xuống dòng, không tràn ngang hoặc lỗi JavaScript. Đã xem Canvas và bảng thực. Chưa kiểm tra Safari iOS/Android thật.
- Build, asset audit và kiểm tra tài liệu gameplay đạt; tài nguyên public vẫn 22,66 MiB.

[Luật V1](PRANK_PLAY_V1.md) và bản mẫu cũ giữ làm lịch sử; phần opt-in ở đó đã được yêu cầu thay bằng V2 này. Pilot chưa có kết quả người chơi.

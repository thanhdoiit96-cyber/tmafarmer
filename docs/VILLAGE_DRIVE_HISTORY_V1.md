# P2.3/P2.4 — Sổ góp hàng V1

Đã triển khai trong source, chưa deploy. Giữ nguyên luật kinh tế của P2.2: không hoàn hàng khi hết hạn, không thưởng cho phần góp dưới ba món, không thêm thưởng an ủi hoặc nút nhận lại.

## Hành vi

- Trong Góp hàng làng, mở **Sổ góp hàng** cạnh Người cùng góp. Mỗi trang là một đợt, phân trang dưới thông tin. Giữ sáu đợt gần nhất.
- Đợt hoàn thành: người có thưởng thấy số xu, XP và phiếu đã cộng; người góp dưới ngưỡng thấy “Chưa đủ mốc” và lý do. Đợt hết hạn chưa hoàn thành giải thích không có thưởng và hàng không hoàn lại. Chưa góp có trạng thái riêng.
- Biên nhận mới lưu xu/XP thực nhận ngay khi trả thưởng. Đợt cũ chưa có trường này suy ra theo công thức cũ, chỉ khi `paid=true`; không biến phần thưởng dự kiến thành đã nhận.
- Bảng chính cũng nói rõ khi đợt hoàn thành nhưng phần góp cá nhân chưa đủ mốc. Không tự bật popup.

## Lưu dữ liệu và giới hạn

`room.villageDriveHistory` chỉ thêm một tóm tắt khi chuyển khỏi đợt hiện tại, trong cùng lần lưu room/CAS. Lưu ID, phiên bản, template, nhu cầu/lượng đã góp, thời điểm kết thúc/hoàn thành và biên nhận. Không ghi log từng thao tác. Có guard khử ID trùng và cắt còn sáu bản.

Mỗi bản giữ tối đa 12 người góp nhiều nhất (tên/số lượng, có thể gồm người đã rời) và biên nhận cá nhân cho tối đa 12 vườn còn trong làng lúc chốt. Người rời trước khi chốt không có biên nhận cá nhân được giữ; người mới trùng tên không được gán phần góp cũ. Snapshot chỉ trả biên nhận của vườn đang xem, không trả ID/biên nhận tài chính của vườn khác.

Làng offline qua nhiều chu kỳ chỉ ghi đợt thực sự đã tồn tại; không bịa các đợt ở khoảng trống. Save cũ không có sổ bắt đầu rỗng, không suy diễn thêm từ `previous` thiếu dữ liệu. Trường `previous` cũ giữ nguyên để tương thích. Snapshot đọc không ghi/migrate, xem sổ không sửa kho/xu/XP.

Không thay schema database. Rollback mã UI có thể ẩn nút; engine không có tính năng này vẫn bỏ qua trường mới. Không dùng rollback engine trước P2.2 vì vẫn phải đọc nhu cầu version 2 đã chốt.

## Kiểm chứng

- Toàn bộ **212 kiểm thử đạt**; thêm ca biên nhận đã trả, dưới ngưỡng, hết hạn, chưa tham gia, giới hạn sáu đợt, nghỉ dài, save cũ và người rời/trùng tên. API chuyển đợt đồng thời chỉ ghi một bản, tiền/phiếu không tăng lại.
- Sau khi bổ sung lưu xu/XP thực nhận, nhóm kiểm thử API/lịch sử chạy lại đạt 7/7.
- Chromium runtime: ba kết quả đã trả/hết hạn/dưới mốc và sổ rỗng; chuyển trang trong đúng hộp thoại, không có thao tác tiêu tài nguyên/nhận thưởng; xu không đổi khi xem. Desktop 1100×850, giả lập ngang 844×390 và 568×320. Chưa thử thiết bị Safari/Android thật.
- Build, kiểm tài nguyên và tài liệu gameplay đạt. Module lịch sử được đóng gói cùng server, không thêm artwork runtime.

Ảnh: [desktop](assets/drive-history-1100.png), [ngang](assets/drive-history-844.png), [ngang thấp](assets/drive-history-568.png).

P2.3 ở đợt này hoàn thiện giải thích và ghi nhận. Thay đổi hoàn hàng/thưởng một phần vẫn cần thiết kế kinh tế riêng; không coi đã triển khai. Sổ sáu đợt là lịch sử ngắn, không phải album thành tích lâu dài.

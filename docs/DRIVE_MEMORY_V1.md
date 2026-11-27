# P3.4 — Trang kỷ niệm góp hàng V1

Ngày 27/11/2026. Hoàn thiện trong source, chưa commit/push/deploy. Tái sử dụng ảnh sen đã duyệt, khung sổ và dữ liệu biên nhận; không thêm atlas hoặc phần thưởng.

## Cách mở

- Đơn làng đã hoàn thành có nút **Trang kỷ niệm** cạnh Sổ góp hàng.
- Trong Sổ góp hàng, đợt đã hoàn thành cũng có nút này. Đợt hết hạn chưa đủ hàng không có trang kỷ niệm hoàn thành.
- Không tự mở khi góp món cuối, đổi cảnh hoặc reload. Không có lễ bắt buộc, không cần cờ “đã xem” trong save.

Khung ghi tên đợt, ngày hoàn thành, số món cá nhân và phần thưởng **đã cộng** nếu có. Người góp dưới mốc hoặc chưa tham gia thấy đúng lý do, không biến phần thưởng dự kiến thành đã nhận. Danh sách tối đa 12 người hiện sáu tên/trang desktop, bốn trên mobile ngang; phân trang dưới danh sách. Chạm tên xem đủ tên/số lượng, quay lại giữ trang.

**Tạo ảnh kỷ niệm** dựng PNG 960×720 ngay trên thiết bị. Ảnh có tên đợt/ngày, hình sen, tối đa 12 tên và lượng góp; tên quá dài được rút gọn theo grapheme như biển cổng. Không chụp toàn màn hình hoặc lấy chat/ID/token/số dư tài chính vào ảnh. Có thông tin trước khi lưu rằng ảnh chứa tên người góp. Người chơi bấm **Lưu ảnh PNG**; Safari chưa hỗ trợ download có thể nhấn giữ ảnh. Không tự tải hoặc gửi lên mạng.

Hình sen chọn theo phong cách vườn **hiện tại**; đây là postcard dữ liệu, không phải ảnh lịch sử của diện mạo vườn lúc hoàn thành. Nút Trang trí vườn chỉ hiện nếu biên nhận có phiếu; vẫn phải dùng quy tắc tiền/phiếu hiện có khi đặt đồ.

## Dữ liệu và tính tương thích

`drive-memory.mjs` chỉ dựng bản sao dữ liệu hiển thị từ snapshot hiện tại hoặc sổ sáu đợt. Không lưu album mới, không ghi DB/localStorage, không gọi action nhận thưởng. Mở đợt đã ra khỏi sổ báo không còn dữ liệu; không bịa lịch sử. Trang đang mở không tự nhảy khi polling.

Snapshot đơn hiện tại bổ sung `completedAt` đã có trong room. Biên nhận lịch sử tiếp tục dùng `mine` do server giới hạn cho đúng người chơi. Không sửa thuật toán thưởng, số dư, quota hoặc cấu trúc lịch sử. Rollback client chỉ bỏ các nút/trang này; trường snapshot mới có thể được client cũ bỏ qua.

Luồng này hoàn thành trang ghi nhận ngắn hạn của P3.4. Chưa có album vĩnh viễn hoặc cutscene/lễ có animation; không cần thêm một lớp popup tự động chỉ để thực hiện lễ rồi cho bỏ qua. Pilot vẫn chưa có dữ liệu người chơi; không suy ra đã đạt mốc giữ chân hoặc sẵn sàng mở bán.

## Kiểm chứng

- **235 kiểm thử đạt.** Hai kiểm thử mới: current/history, thời điểm 0, tách dữ liệu khỏi nguồn, không đưa field ID/chat vào model, từ chối đợt chưa hoàn thành/không tồn tại và không ghi nhận thưởng khi chưa paid. Các kiểm thử thưởng/lịch sử/API cũ tiếp tục đạt.
- Edge demo 1100×850, 844×390, 568×320: mở từ current/history, đủ 12 người, đổi trang, đọc tên đầy đủ/quay lại giữ trang, tạo ảnh PNG 960×720 và có link download. Mở trang/tạo ảnh không đổi xu/XP/phiếu/inventory. Trang chính vừa khung ở ba kích thước; nội dung chi tiết dài vẫn dùng chỉ báo cuộn chung.
- Build và audit tài nguyên đạt; media runtime vẫn 22,69 MiB, không thêm bitmap mới vào public. Chưa thử download trên Safari/iOS/Android thật; fallback nhấn giữ được cung cấp nhưng chưa coi là đã kiểm thiết bị thật.

Ảnh: [trang ngang thấp](assets/drive-memory-568.png), [xem ảnh PNG trước khi lưu](assets/drive-memory-photo-844.png).

Bước kế tiếp nên là kiểm chứng P4 bằng pilot theo tài liệu hiện có và hoàn thiện các điểm người thử vướng; chưa mở thanh toán hoặc tự bịa kết quả pilot khi chưa có nhóm tham gia.

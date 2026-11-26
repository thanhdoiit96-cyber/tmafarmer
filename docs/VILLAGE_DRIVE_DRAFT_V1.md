# P2.1 — Phác thảo Đơn làng đang cần

26/11/2026. **Đã duyệt và hoàn thiện runtime**, xem [kết quả tích hợp](VILLAGE_DRIVE_UI_V1.md). Nội dung dưới đây giữ bản phác thảo lịch sử. Pilot Social/Ao vẫn chờ người chơi và bản thử được chọn.

Mở [bản tương tác](assets/village-drive-draft-v1.html) trực tiếp trong trình duyệt. Dùng sáu nút PHÁC THẢO để xem đang góp, kho trống, món chưa mở, sắp đủ, hoàn thành và hết hạn. Có thể thử ghim/bỏ ghim, xem cách có, góp số lượng và đổi tab. Mọi dữ liệu chỉ ở bộ nhớ của trang mẫu; không gọi API, không lưu hoặc tiêu tài sản thật.

## Phân tích source và phạm vi

`renderVillageDrive` đã có tiến độ từng món, tổng cá nhân, bảng người góp và xác nhận số lượng. Phần còn thiếu là nhấn mạnh **còn thiếu bao nhiêu**, đường chuẩn bị nguyên liệu, ghim món và phân biệt đơn chợ với góp hàng. Không tạo một hệ nhiệm vụ, đơn hàng hoặc tiền thưởng mới.

`villageDriveSnapshot` hiện chỉ gửi tổng đóng góp mỗi người, không cho biết ai góp món nào. Bản này chỉ hiển thị tổng, không suy diễn lịch sử. Đợt kéo dài 48 giờ thực; mốc thưởng hiện tại là ít nhất 3 món, làng phải hoàn tất, thưởng xu theo giá trị đã góp cùng 12 XP và phiếu trang trí. Hàng đã góp không hoàn lại nếu hết hạn. Giữ nguyên tất cả các luật này.

## Bố cục cần duyệt

- Hai tab “Đơn chợ” / “Góp hàng làng”, ghi rõ giao đủ một lần/người giao trước và góp từng phần/cùng cả làng.
- Bảng giấy cùng màu, nút, icon crop atlas hiện có; không thêm tranh nền hay atlas mới. Bối cảnh chợ trong mẫu là ảnh runtime cũ để đối chiếu, không phải mockup map mới.
- Đầu bảng: tên đợt, hạn theo thời gian thực, tổng còn thiếu và mốc cá nhân. Ba thẻ nguyên liệu gọn, mỗi thẻ có ảnh, còn thiếu, đã góp, kho của bạn và nút tương ứng.
- “Ghim chuẩn bị” đưa một món vào mục tiêu trong Việc cần làm, không thêm overlay lên map. Khi thay mục tiêu đang ghim phải xác nhận; hết hạn/đổi đợt hoặc món đã đủ thì giải thích và cho bỏ/chọn lại, không tự chuyển món.
- “Cách có” nối tới giống, vật nuôi hoặc công thức hiện có. Nếu chưa mở, nêu điều kiện thật và gợi ý món khác đang góp được; không chặn cả đơn vì một người chưa mở món.
- “Góp” xác nhận số lượng cùng cảnh báo không hoàn lại/mốc thưởng trước khi trừ kho. Món đủ hoặc đợt đã kết thúc không còn nút góp. Không biến trạng thái kho trống thành lỗi chung chung.

Mẫu minh họa nguồn cây trồng; runtime phải mở rộng bằng catalog tới sản phẩm vật nuôi/công thức nếu có. Các thông báo điều kiện trong mẫu có nhãn mô phỏng, không thay dữ liệu mở khóa của engine.

## Kế hoạch triển khai sau duyệt

1. Tách view model thuần cho đơn làng: còn thiếu, góp tối đa, đủ điều kiện cá nhân, kết thúc; không đổi `donateVillageGoods`/trả thưởng.
2. Thêm loại mục tiêu góp hàng trong `next-goal.mjs`, khóa theo vườn/demo/online và ID đợt; giữ mục tiêu tutorial/công trình cũ khi chưa xác nhận thay.
3. Nối `itemUnlockTarget` và nguồn hàng hiện có; chỉ điều hướng, không tự mua/gieo/thu/góp. Giữ `world.approach()` khi cần thao tác tại đối tượng.
4. Áp UI đã duyệt, bảo toàn trang/tab/chi tiết qua polling và xử lý snapshot thay đổi giữa lúc mở xác nhận và góp.
5. Kiểm thử hai người góp món cuối, retry, đúng giây hết hạn, kho thay đổi, dưới/đủ 3 món, trả thưởng một lần, save cũ và reload mục tiêu. Kiểm tra desktop và mobile ngang; ghi riêng giới hạn chưa thử Safari thật.

Không thuộc đợt này: thay quy mô làng nhỏ (P2.2), hoàn hàng/trả thưởng một phần (P2.3), lịch sử dài (P2.4), thanh toán hoặc nội dung mỹ thuật mới. Chưa được coi là tính năng hoàn thiện chỉ vì bản mẫu hoạt động.

## Kiểm chứng bản mẫu

Đã kiểm tra bằng Chromium: đủ sáu trạng thái, ghim/bỏ ghim, xem nguồn bị khóa, chặn số lượng sai, vượt mốc cá nhân 3 món, góp món cuối, bỏ nút góp/ghim khi kết thúc và phân biệt hai loại đơn. Ảnh hiện có tải đủ; không lỗi JS hoặc tràn ngang ở 1100×850, 844×390, 568×320, 390×844. Trang mẫu có thể cuộn để duyệt; bản runtime phải dùng vùng bảng tác vụ và cơ chế cuộn/phân trang chung của game, không biến trang mẫu thành trang game độc lập.

- [Ảnh desktop](assets/village-drive-draft-v1-desktop.png)
- [Ảnh màn hình ngang](assets/village-drive-draft-v1-landscape.png)

Chỉ thêm tài liệu/prototype, chưa thay source gameplay ở bước P2.1; không chạy lại load test hoặc tuyên bố kiểm chứng API từ thao tác mô phỏng. Các thay đổi ETA của bước trước vẫn được giữ nguyên.

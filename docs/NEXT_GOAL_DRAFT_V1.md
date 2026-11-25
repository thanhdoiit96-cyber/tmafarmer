# P0.1 + P0.4 — Phác thảo Mục tiêu tiếp theo V1

Ngày: 25/11/2026. Trạng thái: **đã duyệt và hoàn thiện runtime V1**, xem [kết quả triển khai](NEXT_GOAL_V1.md). Cơ sở: mục 7 trong [roadmap](GAME_DEVELOPMENT_ROADMAP.md) và [chiến lược sản phẩm](GAME_PRODUCT_STRATEGY.md).

## Mở bản duyệt

- [Prototype HTML tương tác](assets/next-goal-prototype-v1.html): mở trực tiếp bằng trình duyệt từ thư mục dự án. Dùng các nút trên thanh PHÁC THẢO để chọn tình huống. Phần này chỉ phục vụ duyệt, không nằm trong giao diện game đề xuất.
- [Desktop](assets/next-goal-v1-desktop.png).
- [Điện thoại dọc](assets/next-goal-v1-mobile.png).
- [Điện thoại ngang](assets/next-goal-v1-landscape.png).
- [Các trạng thái đặt cạnh nhau](assets/next-goal-v1-states.png).

HTML dùng stylesheet hiện có, font/màu giấy và xanh trầm của game; icon là tài nguyên runtime đã có. Ba ảnh scene empty/young/ripe được chụp từ Canvas thật, với dữ liệu thử trong profile trình duyệt cô lập; không thay source của game, không thay dữ liệu người chơi. Đây là prototype HTML/CSS, không phải concept AI hoặc tính năng đã gắn vào production.

## Bố cục được đề xuất

Desktop: một thẻ ở đầu bảng tác vụ bên phải, phía dưới nhóm Tổng quan/Nông trại/Làng. Mobile dọc: bảng nằm dưới bản đồ. Mobile ngang: giữ hai cột bản đồ/bảng khi đủ chiều ngang. Không thêm popup hướng dẫn tự mở, mũi tên lớn hoặc lớp phủ lên cây và nhân vật.

Thẻ có: mục tiêu đang ghim, tiêu đề, một hướng dẫn ngắn, bước của vòng chơi, thông tin còn thiếu và một nút chính. Nút Đổi/Bỏ mở bộ chọn; Chi tiết giải thích bước. Đồ họa mới không cần thiết cho đợt này.

Phía dưới vẫn là Việc sẵn sàng và Sổ việc hôm nay. Sổ việc được trình bày thu gọn trong phác thảo để tránh cạnh tranh với thẻ mục tiêu; nội dung và thưởng của Sổ việc không đổi. Việc cần làm vẫn phản ánh tình trạng khẩn cấp, còn mục tiêu là điều người chơi đang muốn hoàn thành. Không tạo bộ nhiệm vụ/thưởng thứ hai.

## Các trạng thái có thể duyệt

| Trạng thái | Nội dung chính | Nút và điểm đến dự kiến |
| --- | --- | --- |
| Gieo | Có giống, chọn một ô trống | Đi tới ô phù hợp, mở bảng giống; chưa gieo thay người chơi |
| Tưới | Luống đã gieo, đất khô | Đi tới đúng ô, mở bảng chăm |
| Đang chờ | Đất đủ ẩm, cây chưa chín | Xem dự báo; không tự thay mục tiêu khi người chơi làm việc khác |
| Đến kỳ thu | Cây chín, kho còn chỗ | Đi tới đúng ô, mở bảng thu/giữ giống |
| Bán | Đã thu, có nông sản | Đến Chợ → Bán nhanh; không tự bán hết |
| Thiếu giống | Thiếu vật tư cho bước đang ghim | Đi tới đúng mặt hàng trong chợ; triển khai thật còn xét phương án đổi giống |
| Kho đầy | Cây chín nhưng chưa có chỗ nhận | Mở Kho; giữ nguyên mục tiêu và vụ, không tự bán món khác |
| Người chơi cũ | Ví dụ ghim mở Xưởng cấp 1 | Hiện XP/xu đang thiếu, mở điều kiện xây; không ép quay lại tutorial |
| Hoàn thành | Vòng đầu đã xong | Chủ động chọn mục tiêu khác; nhắc Sổ việc đã đủ điều kiện, không cộng thưởng riêng |

Các số 5 giống, 100 xu, 30 chỗ kho, 40 XP/120 xu mở xưởng là mẫu phù hợp định nghĩa hiện tại, không lấy từ save thật của người xem prototype. Dòng 8 phút chỉ nói thời gian cơ sở, không phải countdown hay ETA đã tính. Khi triển khai phải lấy snapshot/điều kiện engine, không sao chép bảng dữ liệu cứng của prototype vào logic sản phẩm.

## Hành vi đã thử trong prototype

- Chuyển các tình huống bằng thanh duyệt; mở Chi tiết/điểm đến dưới dạng hộp giải thích.
- Mở Đổi/Bỏ → bỏ ghim → vẫn thấy việc/Sổ việc → chọn mục tiêu xưởng để ghim lại.
- Điều hướng bàn phím, dialog native có thể đóng bằng Escape; nút chính có chiều cao tối thiểu 40px desktop, 44px mobile.
- Các ảnh tải được từ bản HTML mở trực tiếp; không gọi API, không ghi localStorage/tài khoản, không tiêu tài nguyên.
- Desktop 1100px, mobile dọc 390px và ngang 844px không tràn ngang. Ảnh chụp mobile là toàn trang có thể cuộn, không giả định mọi nội dung cùng nằm trong một màn hình.

## Điều cần làm sau khi duyệt

1. Tách resolver mục tiêu khỏi render; tái sử dụng trạng thái ruộng, kho, yêu cầu công trình và tác vụ hiện tại. Bước đã xong phải dựa vào action thành công, không dựa vào click/không còn hàng trong kho; trường hợp hàng bị lấy/bán theo cách khác cần quy tắc rõ.
2. Xác định đối tượng theo dõi ổn định: farm, mode, plot ID và vụ đang gieo; không đổi nhầm mục tiêu khi harvest rồi gieo vụ khác. Ghim theo vườn, không rò giữa demo và online.
3. Lưu lựa chọn/bỏ ghim với version; người chơi cũ không tự bị kích hoạt tutorial. Chốt phạm vi đồng bộ thiết bị trước quyết định lưu server hoặc client.
4. Gắn nút vào điều hướng `world.approach()`/bảng hiện tại. Nút thẻ chỉ đưa tới tác vụ, không bỏ qua khoảng cách, sức khỏe, nguồn lực hoặc xác nhận.
5. Giải quyết đủ các trường hợp reload, thiếu xu/giống, kho đầy, mưa không cần tưới, mục tiêu đổi giữa chừng, vụ bị thu bởi Cô Lan, đã hết hàng nhưng chưa xong bước bán. Không tự thêm thưởng hoặc rút ngắn vụ.
6. Kiểm thử resolver/luồng lưu và ảnh UI thực tế; cập nhật tài liệu/trạng thái roadmap. Phác thảo không được xem là đã hoàn thành P0.1/P0.4.

Chưa triển khai analytics, thay kinh tế, tăng cấp hoặc mở thanh toán. Đo sự kiện tối thiểu chỉ được gắn khi flow thật có định nghĩa hoàn thành rõ. Đây là bước duyệt thiết kế đã thống nhất, không phải xin duyệt lại các sửa lỗi hoặc công việc đã được cho phép trước đó.

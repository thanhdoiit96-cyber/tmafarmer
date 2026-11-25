# Mục tiêu tiếp theo — bản runtime V1

Ngày hoàn thiện: 25/11/2026. Phạm vi: lát cắt P0.1 và phần nhãn liên quan của P0.4 trong [roadmap](GAME_DEVELOPMENT_ROADMAP.md), theo [phác thảo đã duyệt](NEXT_GOAL_DRAFT_V1.md). Chưa commit hoặc deploy.

## Hành vi đã triển khai

- Thẻ nằm đầu bảng thao tác, không thêm lớp che Canvas. Sổ việc hôm nay được thu gọn để tránh hai bảng nhiệm vụ cùng mở.
- Vườn mới được gợi ý vòng lúa mì: gieo → tưới/chờ → thu → bán. Mưa có thể bỏ qua tưới; thời gian được ghi là cơ sở, không hứa thời điểm chín cố định.
- Người chơi có thể đổi mục tiêu, bỏ ghim hoặc chọn cấp kế tiếp của ruộng, chuồng, kho, xưởng. Điều kiện XP, xu, vật liệu lấy từ engine hiện có.
- Thiếu giống dẫn đến quầy giống, kho đầy dẫn đến kho, cây chín dẫn đến đúng ô, bán dẫn đến quầy bán nhanh. Nút hướng dẫn chỉ điều hướng qua cơ chế hiện có; người chơi xác nhận thao tác riêng.
- Mục tiêu chỉ tiến sau thao tác thành công hoặc bằng chứng trạng thái phù hợp. Mất cây khỏi ô không được xem là đã thu; đăng chợ không được xem là bán nhanh thành công.
- Vườn cũ không bị buộc làm lại hướng dẫn. Không phát thưởng mới, thay thời gian trồng hay chỉnh dữ liệu nông trại.

## Lưu lựa chọn và giới hạn

Lựa chọn lưu trong localStorage có phiên bản, tách theo demo/online, mã làng và ID vườn. Tải lại giữ mục tiêu, kể cả bỏ ghim và hoàn thành. Đây là tùy chọn **trên thiết bị**, không phải tiến độ đồng bộ tài khoản; xóa dữ liệu trình duyệt sẽ xóa lựa chọn.

Hỗ trợ theo dõi vụ đang ghim khi người phụ vườn/tab khác thu nếu snapshot cung cấp đủ bằng chứng XP và nông sản/hạt tăng. Nếu nhiều thao tác diễn ra giữa hai snapshot khiến không còn bằng chứng, thẻ yêu cầu theo dõi lại vụ thay vì đoán đã hoàn thành. Không cam kết theo dõi vòng hướng dẫn xuyên thiết bị.

Chưa có ghim món đơn làng, analytics mới, rút ngắn vụ đầu hay hướng dẫn mở khóa toàn bộ catalog. Các mục này vẫn thuộc backlog; không đánh dấu toàn bộ P0 hoàn thành.

## Kiểm chứng

- `node --test`: 134/134 đạt, gồm 6 bài kiểm thử mục tiêu mới.
- `npm run build`, `npm run check:assets`, `npm run check:gameplay-docs`: đạt.
- Trình duyệt thật: gieo–tưới–thu–bán, reload, kho đầy, thiếu giống, bỏ ghim, vườn cũ chọn xưởng, tới đúng hai quầy và không tự mua/bán. Không ghi nhận lỗi JavaScript.
- Kiểm tra desktop, điện thoại 390px dọc và 844px ngang; không tràn chiều ngang. Bảng thao tác dọc có đủ chiều cao để hiện nút mục tiêu trước khi cuộn.

Ảnh runtime: [desktop](assets/next-goal-runtime-v1-desktop.png), [điện thoại dọc](assets/next-goal-runtime-v1-mobile.png), [ngang](assets/next-goal-runtime-v1-landscape.png), [kho đầy](assets/next-goal-runtime-v1-full.png).

## Cấu trúc để tiếp tục

`public/next-goal.mjs` giữ model, validation, chuyển bước và nội dung thẻ. `app.mjs` quản lý lưu lựa chọn, render và điều hướng. `world.approach()` có bộ lọc style tùy chọn để chọn đúng quầy, giữ tương thích các lời gọi cũ. `test/next-goal.test.mjs` kiểm tra bằng engine thật.

Bước kế tiếp: P0.3 — chỉ rõ điều kiện còn thiếu khi mở khóa nội dung, tái sử dụng hàm yêu cầu từ engine. Cần dựng phác thảo trước nếu thay đổi bố cục. Sau đó mới đến tóm tắt quay lại P1.1.

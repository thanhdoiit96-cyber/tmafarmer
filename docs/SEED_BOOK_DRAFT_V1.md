# Sổ giống ba miền — phác thảo V1

**Không được duyệt — 28/11/2026.** Dừng triển khai vì chưa tạo giá trị gameplay rõ. Chỉ giữ tham chiếu lịch sử, không dùng làm đầu việc tiếp theo. Hướng thay thế: [Phiên chợ quê](VILLAGE_FAIR_DRAFT_V1.md).

28/11/2026. Chờ duyệt, chưa thay runtime/save. P4 đo lường tạm gác; P5 ngoài phạm vi. Áp dụng `GAME_UI_STANDARD.md`.

- [Bản mẫu tương tác](assets/seed-book-draft-v1.html) — cần phục vụ qua HTTP từ gốc repository để import luật và sprite có sẵn; không mở bằng file://.
- [Desktop](assets/seed-book-draft-v1-desktop.png)
- [Mobile ngang](assets/seed-book-draft-v1-landscape.png)

## Vai trò và phạm vi

Kho quản lý số lượng, Tiến độ quản lý XP/công trình, bộ chọn giống phục vụ mua/gieo. Sổ giống chỉ phục vụ khám phá và ghi nhận, không trở thành Kho thứ hai. Đề xuất một mục trong Nông trại, không thêm HUD hoặc navbar. Click giống mở chi tiết; nút dẫn tới bảng chọn/điều kiện hiện có, giữ approach, không tự mua hoặc gieo.

Phác thảo đầu tiên tập trung **cây trồng**: đủ 16 giống đang có, 6 ô/trang, phân trang dưới lưới, ba chương gợi cảnh quan Bắc/Trung/Nam. Một giống chỉ nằm trong một chương để tránh đếm trùng. Đây là nhóm kể chuyện đề xuất, không phải khẳng định giống chỉ có ở một vùng hoặc áp luật khí hậu mới. Danh sách có thể chỉnh sau duyệt. Vật nuôi sẽ là nhóm riêng của cùng cuốn sổ khi bố cục cây được duyệt; không gán động vật đại trà thành đặc sản độc quyền vùng.

Ba trạng thái: chưa mở; đã mở nhưng chưa ghi nhận; đã ghi nhận lần thu đầu. Ảnh lấy từ `cropFrame`, luật thiếu điều kiện lấy từ `cropRequirement`; không đưa luật mở khóa thứ hai vào UI. Số hoàn thành là tiến độ trung tính, không badge đỏ giả việc cần chăm. Không khóa mờ đến mức mất hình. Desktop và mobile đều mở chi tiết bằng click/chạm, không bắt hover để đọc.

Chi tiết trình bày điều kiện, thời gian và sản lượng **cơ sở**; không hứa ETA chắc chắn và không lặp đoạn mô tả thời tiết. Nút trên prototype chỉ giải thích đích điều hướng, không thao tác game.

## Save cũ và ghi nhận sau duyệt

Hiện không có lịch sử thu trọn đời theo từng giống. Không suy ra đã thu từ XP, đồ trong kho, hàng mua, được tặng hoặc nhận thưởng. Save cũ hiển thị “Chưa ghi nhận”, không khẳng định “Chưa từng thu”. Ghi chú rõ bắt đầu ghi từ bản có tính năng; người cũ vẫn đủ điều kiện trồng như trước.

Khi triển khai, dùng tập ID/version có giới hạn theo catalog trong farm; chỉ thêm sau action thu thành công, server quyết định online, demo tách riêng. Action thất bại/retry không thêm thành tích hoặc thưởng; snapshot chỉ đọc. Không lưu mọi thao tác, không thu thập thói quen, không thêm vật phẩm hay thưởng kinh tế. Vật nuôi ghi sau thu sản phẩm/xuất chuồng thành công, không sau mua con.

## Kiểm chứng phác thảo

Đã chạy Edge headless ở 1100×760, 844×390, 568×320, 390×844: không tràn ngang, phân trang, đổi chương về trang đầu, chi tiết giống khóa và đóng/mở đạt, không có JS exception. Đã xem ảnh mobile và thu gọn chiều cao. Chưa thử Safari/iOS hoặc Android thật. Không coi đây là screenshot đã tích hợp Canvas game; bên trái là nền tham chiếu hiện có, không có đối tượng game động.

Chỉ thêm HTML và hai ảnh phác thảo được chọn; không tạo atlas hay asset runtime. Cần duyệt bố cục, cách chia chương và quy tắc ghi nhận trước khi hoàn thiện cây/vật nuôi và kiểm thử migration/action thật.

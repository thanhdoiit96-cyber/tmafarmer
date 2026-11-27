# Thu gọn HUD và xác nhận thuê Cô Lan một bước

Đã cập nhật source, chưa commit/push/deploy. Thực hiện từ commit 5bc5ab4 sau lần hoàn tác; không đưa lại các bố cục HUD thử nghiệm trước đó.

## HUD

- Bỏ ba nút lối tắt Kho, Chuồng, Ao khỏi DOM, render và CSS. Các mục tương ứng trong điều hướng/menu Khu vực vẫn giữ.
- Ô Ngày ở góc trái nhỏ hơn trên mobile ngang: cao 28px, chữ 9px, icon 11px. Không đổi vị trí Ngày/Xu hoặc các chỉ số khác.
- Thời tiết chỉ dùng icon hiện tại; hover có tooltip trình duyệt gồm tên, tác động và hướng dẫn mở dự báo. Click/touch vẫn mở popup thời tiết và dự báo đầy đủ. Không thêm popup xác nhận hoặc thay hình minh họa.
- Không đổi chiều rộng, vị trí hay khoảng đệm của Công cụ.

## Thuê

Nút “Xác nhận thuê Cô Lan” trên bảng chọn ô là bước xác nhận cuối. Bỏ màn hình nội bộ “Đồng ý · … xu” và nút Chọn lại; không ẩn bảng chọn sang một màn hình tóm tắt nữa.

Trước khi xác nhận vẫn hiển thị số ô, phí thuê, thời gian, chỗ kho cần/trống và số xu đang có. Khi bấm, tính lại mục tiêu hiện tại bằng updateQuickGarden; giữ hạn mức, kiểm tra tiền/kho/cây đã thay đổi và payload expectedSpace/source. Chặn gửi lặp bằng busy và nút disabled hiện có; lỗi giữ lại màn hình cho người dùng sửa. Không đổi API, giá, engine hoặc database.

## Kiểm chứng

223 tests và production build đạt. Edge demo riêng 1100×850, 844×390, 568×320: không còn ba lối tắt; Ngày/Xu và các ô còn lại cao đồng nhất 28px; thời tiết chỉ có icon và tooltip đủ mô tả, click mở dự báo. Thuê tưới/thu hoạch từ một lần xác nhận, thử hai requestSubmit liên tiếp: chỉ trừ một lần phí, một công việc có đúng action/index/số ô; trường hợp chưa chọn ô không thể gửi; thu hoạch giữ lựa chọn giữ giống.

- [HUD ngang](assets/hud-compact-844.png) · [mobile nhỏ](assets/hud-compact-568.png)
- [Bảng thuê](assets/hire-one-confirm-844.png) · [mobile nhỏ](assets/hire-one-confirm-568.png)
- [Chi tiết thời tiết](assets/weather-detail-844.png)

Chưa kiểm trực tiếp thiết bị iOS Safari/Android. Các ảnh dùng demo, không giao dịch production.

## Thu nhỏ đồng bộ các ô còn lại

Theo yêu cầu tiếp theo, HUD mobile ngang dùng chiều cao 28px chung cho Ngày/Xu, nước, thức ăn, thể lực, việc cần làm, thời tiết và Khu vực. Icon chỉ số 11–12px, số chính 10px, badge việc 20px. Không đổi bố cục hoặc vị trí bảng. Kiểm tra Edge ở 844×390 và 568×320 cả đóng/mở bảng: chiều cao đúng, số không bị cắt; bấm nước, thời tiết, Khu vực và việc cần làm hoạt động. Build đạt; thay đổi CSS nên không chạy lại bộ test engine đã đạt ở bước trước.

Ảnh cập nhật: [844](assets/hud-uniform-closed-844.png), [568](assets/hud-uniform-closed-568.png), [844 mở](assets/hud-uniform-open-844.png), [568 mở](assets/hud-uniform-open-568.png).

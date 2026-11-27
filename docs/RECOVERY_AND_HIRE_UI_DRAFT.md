# Bảng thuê có hình cây và popup hồi phục

Ngày 27/11/2026. Đã được duyệt và tích hợp source. Bản HTML dưới đây giữ để đối chiếu thiết kế; kết quả runtime tại [Sổ việc và hồi phục](TASK_BOOK_RECOVERY_UI_V1.md).

## Bảng thuê V4

[Bản tương tác](previews/tasks-v4.html) · [Ảnh](assets/taskbook-hire-v4-844.png).

Thay ô chỉ có chữ bằng hình cây lấy từ atlas hiện có, tên giống, số ô và checkbox. Nền ô đã chọn đổi sắc xanh, không chỉ báo bằng màu. Giữ chọn qua phân trang, tổng phí và xác nhận như bản V3. Không vẽ lại atlas hoặc đổi cơ chế thuê.

## Popup hồi phục

[Bản tương tác](previews/recovery-v1.html). Các nút và bộ chọn bên ngoài popup chỉ phục vụ duyệt ba loại và trạng thái, không đưa vào runtime.

- Phần đầu: chỉ số hiện tại/100, thanh mức và số điểm thực nhận (giới hạn không vượt 100).
- Một hành động chính: uống/ăn/nghỉ nếu đúng vị trí; chỉ dẫn Đến giếng hoặc Về Nhà vườn khi chưa đúng nơi. Đầy điểm hoặc chờ lượt thì vô hiệu hóa đúng.
- Phần dưới: lưới bốn món/trang từ túi, hình nhận diện, tên, số phần riêng và tác dụng lên chỉ số đang xem. Chạm để xem đầy đủ tác dụng lên ba chỉ số, lượng tiêu hao và xác nhận dùng.
- Giữ 48 nước/90 giây, 52 no bụng/300 giây, nghỉ 60 giây hồi tối đa 75 thể lực; không thay công thức hiện có. Món ăn dùng hệ gain của recipes; bản mẫu dùng số lượng túi giả lập.
- Icon cây/nước dùng asset hiện có. Icon món ăn dùng emoji theo cách game hiện tại, chưa phải bộ tranh đồ ăn mới.

## Kiểm tra và điều kiện tích hợp

Đã kiểm trên Edge với viewport 1100×850, 844×390, 568×320: hình cây, chuyển tab hồi phục, mở/quay lại chi tiết món, trạng thái đầy/chờ và bố cục không tràn. Chưa kiểm trên thiết bị iOS/Android thật. Chưa kiểm server vì bản mẫu không gửi request và không tiêu tài nguyên.

Sau duyệt phải nối đúng shared dialog, close/Escape, vị trí và `world.approach()`, điều kiện mealRequirement và cooldown dùng bữa chung, tự cập nhật đếm ngược, đang nghỉ, đủ/thiếu đồ, khóa thao tác khi chờ server. Không dùng thông số giả lập của bản mẫu trong runtime. Lưới món lọc theo chỉ số nhưng chi tiết phải nêu mọi tác dụng thật. Nếu tràn, dùng chỉ báo cuộn hiện có. Tránh vô hiệu hóa tất cả món chỉ vì một chỉ số đầy: điều kiện dùng do engine quyết định.

Ảnh popup: [Nước](assets/recovery-water-draft-844.png), [Ăn cơm](assets/recovery-food-draft-844.png), [Thể lực](assets/recovery-stamina-draft-844.png).

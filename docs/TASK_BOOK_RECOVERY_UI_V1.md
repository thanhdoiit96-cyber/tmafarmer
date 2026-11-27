# Sổ nhà nông, Thuê chăm vườn và Hồi phục V1

Ngày 27/11/2026. Người dùng đã duyệt bản V3/V4 và popup hồi phục. Đã tích hợp source; chưa commit/push/deploy.

## Hành vi

- Việc cần làm gom theo hành động: không lặp từng cây/con trên trang tổng. Mỗi nhóm có icon cũ, tên, đơn vị và badge. Tách cây, vật nuôi và thủy sản; giữ ưu tiên của `farmTasks()`. Chạm nhóm xem chi tiết theo trang, Đi tới dùng `world.approach()` như cũ. Định danh vật nuôi theo ID, ao theo ao + loài + trạng thái công việc, không lấy số thứ tự sau phân trang làm đối tượng.
- Sổ hôm nay là thẻ riêng trong sổ; Nhà vườn cũng dùng trình bày ngày mới. Giữ ba điều kiện và thưởng xu/XP hiện tại. Ghim mục tiêu chỉ xuất hiện ở thẻ Việc cần làm.
- Khu vực Thuê luôn có tên Cô Lan, số ô có thể chăm, đơn giá và nút rõ. Chọn Tưới/Thu, chọn ô có hình cây và số ô, xem phí/thời gian/chỗ kho, xác nhận rồi mới gửi yêu cầu. Có thể quay lại sửa lựa chọn. Giữ giới hạn 12 ô, chi phí 2/4 xu, xác thực ô thay đổi, đủ xu, đủ kho và cách giữ giống.
- Bảng thuê giữ checkbox của tất cả trang trong form, chỉ ẩn phần ngoài trang. Chọn hết vẫn tính cả vườn và giới hạn 12; lựa chọn không mất khi sang trang hoặc polling. Server vẫn kiểm tra điều kiện cuối cùng.
- Uống nước, Ăn cơm, Thể lực dùng popup giấy ấm cùng phong cách. Chỉ số hiện tại/100, thanh mức, số hồi thực nhận và nút chính tùy vị trí. Đồ trong túi thành lưới có hình/emoji hiện có, tên và số lượng riêng. Chạm xem đầy đủ tác dụng rồi Dùng 1 phần.
- Đầy điểm/chờ lượt/đang nghỉ có trạng thái rõ. Đếm ngược tự cập nhật và mở hành động đúng lúc hết hạn. Meal cooldown dùng chung, kiểm tra mọi tác dụng bằng `mealRequirement()`; không khóa một món chỉ vì chỉ số đang xem đã đầy. Không đổi công thức, cooldown hay cách đi tới nhà/giếng.

## Mật độ theo không gian thật

Khung game có điều hướng và ghim mục tiêu nên cần ít mục hơn bản HTML đứng riêng ở màn hình thấp:

| Nội dung | Desktop | Ngang 844×390 | Ngang 568×320 |
| --- | --- | --- | --- |
| Nhóm việc | 6 | 4 | 2 |
| Ô thuê tưới | 6 | 6 | 3 |
| Ô thuê thu hoạch | 6 | 3 | 3 |
| Món hồi phục | 4 | 4 | 2 |

Phân trang nằm dưới lưới; đổi kích thước giữ vùng item đang xem và kẹp trang hợp lệ. Chi tiết dài hoặc khung nhỏ hơn nữa vẫn cuộn native với chỉ báo cuộn chung của game. Không giảm cỡ chữ để cố nhồi tất cả mục. Màn hình cực thấp ẩn tiêu đề lớn Sổ nhà nông, giữ hai thẻ và phần Thuê.

## Kiểm chứng

- 219 kiểm thử tự động đạt, bao gồm hai test mới về gom nhóm, tách đơn vị, định danh qua đổi thứ tự vật nuôi và index 0.
- Production build đạt. Các module/CSS mới nằm trong bundle tĩnh qua build hiện có.
- Edge desktop và giả lập viewport 844×390, 568×320: nhóm/sổ ngày, ẩn ghim ở sổ ngày, phân trang, hình cây, lựa chọn qua trang, sửa xác nhận giữ lựa chọn, mở chi tiết món và phân trang. Kiểm tra chuyển trang thuê bằng touch CDP.
- Trong demo chạy engine thật: chọn hết tối đa 12 ô; lần xác nhận đầu chưa thuê; lần đồng ý trừ đúng 24 xu cho 12 ô tưới; job lưu đúng 12 bước; giữ giống khi thu được tính trong dự báo. Đi tới việc tưới dẫn đúng ô 0.
- Dùng bánh mì giảm đúng một phần; lượt dùng tiếp bị khóa. Kiểm tra chỉ số đầy hồi +0, chờ uống tự mở khi hết hạn, nghỉ tự cập nhật khi xong và lưới hồi phục đổi mật độ khi đổi kích thước trong lúc popup đang mở.
- Không thử thiết bị iOS Safari/Android thật, không deploy hoặc thực hiện giao dịch trên production. Test thao tác dùng làng demo riêng trong profile trình duyệt kiểm thử.

## Ảnh runtime

- [Sổ việc desktop](assets/taskbook-live-1100.png), [844 ngang](assets/taskbook-live-844.png), [568 ngang](assets/taskbook-live-568.png).
- [Thuê có hình cây](assets/hire-live-844.png), [thuê ở màn hình thấp](assets/hire-live-568.png).
- [Uống nước](assets/recovery-water-live-844.png), [ăn cơm](assets/recovery-food-live-844.png), [thể lực](assets/recovery-stamina-live-844.png), [hồi phục trên 568](assets/recovery-water-live-568.png).

Tài liệu duyệt: [Sổ V3](TASK_BOOK_UI_V3_DRAFT.md), [hình cây và hồi phục](RECOVERY_AND_HIRE_UI_DRAFT.md). Các bản HTML dùng dữ liệu giả và chỉ để đối chiếu; source runtime dùng dữ liệu, giới hạn và điều kiện thật.

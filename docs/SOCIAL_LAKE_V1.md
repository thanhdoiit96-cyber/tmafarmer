# Giúp tưới và hoạt động Hồ làng V1

Ngày: 26/11/2026. Đã triển khai trong source; chưa commit/push/deploy.
Theo lát cắt đầu của [thiết kế song song](SOCIAL_PLAY_AND_LAKE_DRAFT_V1.md).

## Cách chơi

- **Hàng xóm → Ghé thăm → Tưới giúp:** chọn cây đang khô, chưa chín; nhân vật tự đi tới ô rồi tưới. Danh sách tối đa 6 ô/trang, giữ nhãn ruộng chính/vườn mở rộng. Mỗi người giúp 3 lượt/ngày game, tối đa 2 lượt cùng chủ; mỗi chủ nhận 6 lượt/ngày. Tưới thành công dùng 2 nước, 1 no bụng, 3 thể lực của người giúp; trời nóng thêm 1 nước như tưới thường. Không thưởng xu/XP và không tiêu lượt trộm. Trong danh sách Hàng xóm, mở mục Tưới giúp để bật/tắt quyền nhận giúp, mặc định bật.
- **Hồ làng → Ven ao:** từ cấp nông trại 2 (25 XP), chọn Dọn cỏ. Nhân vật tới bờ phía nam (326,350), dùng hoạt ảnh cuốc đất đã duyệt trong 10 giây. Di chuyển, đổi cảnh hoặc bấm Dừng sẽ hủy, không mất lượt. Hoàn thành nhận 2 dấu ao, tối đa một lần/ngày; ví tối đa 6 dấu. Công việc không tốn vật tư hoặc thể lực, không cho XP/xu.
- **Đổi thức ăn:** 2 dấu lấy 1 thức ăn thủy sản, một lần/ngày. Túi đầy thì giữ nguyên dấu và lượt. Phải ở Hồ làng để đổi.
- **Hồ làng → Sổ cá:** tự câu thành công cá nhỏ, rô phi và cá chép vàng ở hồ công cộng để điền sổ. Đủ bộ, bấm Nhận phiếu trang trí tại hồ, một lần cho cả nông trại. Mua cá, cá trong kho cũ, cá ao nhà, câu trộm, kéo cần lỗi hoặc kho đầy không điền sổ.

Ngày game vẫn 8 giờ. Giữ nguyên giá, thời gian chờ, tỷ lệ cá, lượt câu, trộm vườn/kho/ao, đóng cổng và an ninh làng. Chưa triển khai sâu nghịch, lọ sâu hoặc chế độ làng mới.

## Dữ liệu và chống lặp

Không cần migration SQL: các trường mới nằm trong JSON farm, save cũ đọc mặc định rỗng. `neighborHelp` và `lakeDaily` có ngày game; `lakeMarks`, `fishBook` và `fishBookClaimed` thuộc farm, không thuộc phiên đăng nhập. `fishBook` chỉ lưu ba counter và thời điểm bắt lần đầu; nhật ký dùng cơ chế giới hạn 14 mục hiện có.

`shoreJob` lưu ngày gốc, số giây đã làm và lần xác nhận gần nhất. Trong lúc đứng tại bờ, client xác nhận khoảng 2 giây/lần; máy chủ kiểm tra presence mới, đúng cảnh, gần bờ và không đang đi. Cách hơn 4 giây hoặc qua ngày thì hủy job, không thưởng. Mất mạng/tab bị treo phải làm lại; không cộng thời gian offline. Client hủy khi thấy nhân vật di chuyển; presence hiện tại không phải lịch sử đường đi chống gian lận tuyệt đối.

Giúp tưới được kiểm tra lại sau `world.approach()`: presence phải thuộc đúng chủ vườn, đúng ô, điều kiện ẩm/chín và quota vẫn hợp lệ. Ô 0 và namespace ô mở rộng được giữ nguyên. Quota và nước chỉ trừ sau thao tác thành công. Giúp tưới không chỉnh journal hoặc bộ đếm trộm.

Máy chủ dùng revision CAS và request ID hiện có: thay đổi vật phẩm, quota, dấu và cờ nhận quà lưu cùng một lần. Hai yêu cầu cùng ID trả lại kết quả trước; ID mới vẫn chịu giới hạn. Module dùng chung `public/lake-social.mjs` được đóng gói cho cả server và client.

## Kiểm chứng

- 177/177 kiểm thử đạt, gồm 8 kiểm thử mới về quota, ô 0/ô mở rộng, mưa, owner opt-out, chi phí người giúp, hai người tưới cùng ô, thời gian/hủy/gián đoạn/qua ngày, ví/túi đầy, sổ cá, claim và replay API. Kiểm thử trộm hiện có tiếp tục đạt.
- Build, kiểm tra tài liệu gameplay và audit tài nguyên đạt; không thêm ảnh/atlas mới, tài nguyên public vẫn 22,63 MiB.
- Edge/Chromium chạy gameplay thực ở chế độ demo: tự đến bờ, đủ thời gian nhận 2 dấu, đổi đúng một phần thức ăn, khóa quà khi sổ thiếu, tự đến ô 0 tưới giúp và giữ nguyên lượt trộm. Không lỗi JavaScript.
- Desktop 1100×800 và mô phỏng mobile ngang 844×390, 568×320: tab mới hoạt động, không tràn ngang. Chưa xác nhận trên thiết bị Android hoặc Safari iOS thật.

Chưa deploy; không thay background, collision ao/cầu, nhân vật hoặc sprite sản xuất.

## Bước tiếp theo

Sâu nghịch là phần riêng: mặc định chủ không nhận, quota thả/nhận và cooldown chống dồn phá, hiệu ứng tạm tách khỏi sâu tự nhiên, không làm giảm vĩnh viễn sản lượng. Thực hiện kiểm thử timeline và bảo hộ trước khi nối vào UI. Không tự chuyển phần này thành cơ chế phá hiện tại.

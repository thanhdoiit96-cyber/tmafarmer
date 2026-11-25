# Tuổi kinh tế theo chu kỳ sản xuất

Đã triển khai source theo yêu cầu bỏ nghỉ dưỡng ngày 25/11/2026; chưa deploy. Không thêm nút gửi nghỉ/đón về, atlas hoặc cơ chế tạm dừng thủ công.

## Quy tắc

| Tuổi kinh tế | Trạng thái | Sản lượng nền | Giá bán lại |
| --- | --- | --- | --- |
| 0–29 chu kỳ | Sung sức | 100% | 50% giá đón |
| 30–69 chu kỳ | Lớn tuổi | 75% | 40% giá đón |
| Từ 70 chu kỳ | Già | 50% | 25% giá đón |

Sản lượng làm tròn xuống, tối thiểu 1. Các hệ số giữ nguyên so với trước; mốc chuyển trạng thái đổi từ ngày thực sang số lần thu thành công. Đây là mốc cân bằng V1, chưa có dữ liệu hành vi để khẳng định tối ưu.

- Con mới bắt đầu 0 chu kỳ. Chỉ thu thành công và nhận sản phẩm vào kho mới tăng 1.
- Lứa đang thu dùng mức sản lượng trước khi tăng bộ đếm: lần thu thứ 30 vẫn theo mức trước, từ lứa tiếp theo áp dụng Lớn tuổi.
- Chờ online/offline, con lớn lên, cho ăn, di chuyển/chuyển chuồng và mở bảng không làm tăng tuổi kinh tế.
- Thu thất bại do kho đầy/chưa có sản phẩm hoặc gửi lại cùng requestId không tăng thêm chu kỳ.
- Lợn/thỏ xuất một lần giữ quy tắc hiện có, không giảm năng suất/giá theo tuổi chu kỳ.
- Thức ăn, tiến độ lớn/sản phẩm, thời tiết và sức chứa không đổi; nghỉ lâu không tự có nhiều lứa sản phẩm.

Chi tiết vật nuôi ghi chu kỳ tuổi kinh tế và các mốc 30/70. Loại bỏ “ngày nuôi” khỏi giải thích năng suất. Ngày đón vẫn được giữ trong dữ liệu để không mất lịch sử.

## Chuyển save cũ

Save trước đây không ghi số lần thu nên không thể khôi phục lịch sử chính xác. Server chốt `room.livestockCycleSince` một lần khi phòng được xử lý bởi bản mới; marker được lưu qua đường cập nhật phòng hiện có.

Ở mốc chuyển đổi, giữ trạng thái tuổi theo luật cũ bằng `ageCycleOffset`: Sung sức → 0; Lớn tuổi → 30; Già → 70. Bộ đếm thật `harvestCycles` bắt đầu 0. Tuổi kinh tế = hai trường cộng lại. Đây là chu kỳ **quy đổi**, không tuyên bố con cũ đã thu đúng 30/70 lần. Khi có offset, chi tiết hiển thị riêng phần quy đổi và số lứa thu thêm từ cập nhật.

Ngày đón thiếu dùng mốc chuẩn hóa `livestockSince` hiện có. Snapshot và hành động cùng dùng một hàm chuẩn hóa, không dùng thời điểm mở bảng mới để quy đổi lại. Khi thao tác con được lưu thì hai trường theo pen; trước đó room cutoff bảo đảm tính nhất quán qua reload. Con mới ghi cả hai trường bằng 0 ngay khi đón.

**Giới hạn chuyển đổi:** mức cũ được xác định ở lần chuyển đổi đầu tiên của phòng, không phải một thời điểm deploy toàn hệ thống đã biết. Con cũ đã già vẫn già; thời gian trước lần chuyển đổi còn thuộc luật cũ. Sau khi đã chốt, tiếp tục vắng mặt không làm tăng tuổi kinh tế. Không hứa hồi trẻ hoặc hoàn lại sản lượng cũ. Không rollback về engine tính ngày thực mà chưa có kế hoạch chuyển state vì sẽ áp dụng lại luật cũ.

## Kiểm chứng

- 169 kiểm thử toàn dự án đạt, sau đó nhóm API/chu kỳ bổ sung kiểm tra concurrent request cũng đạt.
- Mốc 29/30/69/70 của mọi loài, một năm không thu, kho đầy, thu lỗi, cho ăn, chuyển chuồng, save cũ và chốt marker không lặp.
- Bốn mốc nghỉ dài hiện giữ Sung sức với con 0 chu kỳ, các kiểm tra khác về cây/ao/đơn/kho vẫn đạt.
- API/DB: hai yêu cầu thu cùng requestId nhận một lần sản phẩm và tăng 29 → 30 một lần; reload giữ bộ đếm.
- Runtime Chromium desktop/mobile ngang: con có ngày đón cách 30 ngày nhưng 29 chu kỳ vẫn đủ năng suất; nhân vật tiếp cận rồi thu, nhận đúng 3 sữa, tăng 30 và chi tiết hiện Lớn tuổi. Không lỗi JS hoặc tràn ngang. Chưa kiểm tra Safari thật.
- Build, catalog và asset audit đạt. Không thêm ảnh chụp; dọn build/profile sau kiểm chứng.

## Hướng nghỉ dưỡng

[Phác thảo nghỉ dưỡng](LIVESTOCK_REST_DRAFT_V1.md) đã bỏ qua theo yêu cầu người dùng. Giữ làm tài liệu lịch sử, không gắn vào runtime và không tiếp tục triển khai.

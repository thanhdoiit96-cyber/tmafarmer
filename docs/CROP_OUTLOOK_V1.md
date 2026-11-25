# P1.2 — ETA và sản lượng cây trồng

Hoàn thiện trong source ngày 25/11/2026, chưa deploy.

## Hành vi

- Bảng chăm sóc có hai ô nhỏ: thời gian còn lại ước tính và số món tạm tính có thể thu. Cây chín hiển thị số còn thu được sau những lần đã lấy.
- ETA dùng tiến độ của snapshot gần nhất và đúng tốc độ engine đang áp dụng: thời tiết chung × đặc tính giống × độ ẩm × cỏ/sâu × phân bón. Làm tròn lên phút; không dùng thời gian cơ sở làm thời gian thu chắc chắn.
- Đây là ước tính nếu điều kiện hiện tại giữ nguyên. Không dự đoán thao tác chăm sóc hoặc tích phân thời tiết tương lai. ETA cập nhật theo snapshot; trời đổi, đất khô hoặc áp lực cỏ/sâu tăng đều có thể đổi kết quả.
- Mục “Vì sao?” mở bằng chuột, bàn phím hoặc chạm, giữ trạng thái mở qua lần cập nhật dữ liệu của cùng ô. Giải thích hệ số tốc độ, sản lượng trước thiệt hại, phần đã mất, phần đã lấy và giới hạn kho.
- Sản lượng trong lúc cây lớn dựa trên thời tiết đã trải qua, chưa đảm bảo kết quả cuối vụ. Thiệt hại tích lũy không hồi lại khi xử lý cỏ/sâu.

Không thay kinh tế, thời gian tăng trưởng, lưu database, hành động hay điều kiện di chuyển. Phạm vi này là cây trồng; chưa đổi ETA vật nuôi/thủy sản và chưa triển khai P1.3.

## Kiểm chứng

148/148 kiểm thử đạt; build đạt. Kiểm thử mới đối chiếu ETA với tiến độ thực của `projectPlot` trên các trạng thái đất, sâu và phân bón; kiểm tra tổn thất sau nhổ cỏ, mục tiêu legacy và thu một phần.

Đã kiểm tra runtime Edge/Chromium tại 1100 × 850 và màn hình chạm ngang 844 × 390: không tràn ngang, chạm đóng/mở giải thích được, giữ giải thích qua polling, không có lỗi JavaScript. Chưa kiểm tra trên thiết bị iOS Safari thật.

- [Desktop](assets/crop-outlook-v1-desktop.png)
- [Giải thích chi tiết](assets/crop-outlook-v1-details-desktop.png)
- [Điện thoại ngang](assets/crop-outlook-v1-compact-landscape.png)


## Rút gọn phần giải thích V2

Thay các đoạn công thức dài bằng bảng 4 yếu tố (thời tiết hiện tại, đất, sâu/cỏ, phân bón), hai cột tốc độ/năng suất có dấu ±%. Thời tiết tốc độ gồm hệ số chung và đặc tính giống; năng suất thời tiết là ảnh hưởng hiện tại, còn kết quả cuối vụ cộng dồn theo thời gian. Sâu/cỏ hiển thị phần mất thực tế sau làm tròn/giới hạn tối thiểu; xử lý sâu/cỏ không xóa thiệt hại cũ. Phân bón hiển thị mức cộng theo sản lượng cơ sở của từng giống trước hệ số thời tiết và làm tròn. Các tỷ lệ là tác động riêng, không cộng số học thành tổng.

Chi tiết giống giữ một mô tả đặc tính trong seedFacts; phần cách có chỉ ghi nguồn giống, bỏ đoạn tác dụng trùng và lời hướng dẫn đóng dialog thừa.

150/150 kiểm thử đạt, build đạt. Runtime Chromium mobile ngang kiểm tra bốn hàng ảnh hưởng và mô tả Khoai lang xuất hiện đúng một lần; không tràn ngang hoặc lỗi JavaScript. Chưa kiểm tra Safari thật.

[Ảnh bảng tác động](assets/crop-impact-v2-impacts-landscape.png) · [Ảnh chi tiết giống](assets/crop-impact-v2-seed-detail-landscape.png).

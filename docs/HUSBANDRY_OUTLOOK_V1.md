# P1.2 — Thời gian và sản lượng vật nuôi, thủy sản

Hoàn thiện source 26/11/2026, chưa commit/push/deploy. Tiếp nối [ETA cây trồng](CROP_OUTLOOK_V1.md); không thay luật nuôi, kinh tế hoặc save.

## Hành vi

- Thẻ vật nuôi ở chuồng chính và chuồng phụ hiển thị thời gian đến lần thu tiếp theo, gồm cả phần lớn lên còn thiếu và phần tạo sản phẩm. Tôn trọng `growGoal`/`productGoal` riêng của save cũ.
- Thẻ lứa thủy sản hiển thị thời gian lớn còn lại, theo hệ số `weather.water`. Số giống không nhân thời gian; sản lượng vẫn trừ số đã lấy.
- Làm tròn thời gian lên phút. Khi đói, nhãn là “Sau khi cho ăn”, không phải đếm ngược đang chạy. Nếu thời gian thức ăn còn lại ngắn hơn ETA, báo cần cho ăn tiếp. Đủ kỳ thu thì không hiện ETA hoặc yêu cầu ăn tiếp.
- Mục “Yếu tố ảnh hưởng” dùng kiểu thẻ hiện có, mở theo yêu cầu và giữ trạng thái qua polling. Hai dòng tốc độ/sản lượng có dấu ±%; không thêm panel che map. Tốc độ vật nuôi gồm thời tiết và bảo vệ của chuồng. Sản lượng vật nuôi phản ánh giảm thực tế sau làm tròn theo số lứa, không theo thời gian offline. Thời tiết không thay sản lượng vật nuôi/thủy sản.
- ETA là ước tính với thời tiết hiện tại và đủ thức ăn liên tục, không dự báo thời tiết tương lai. Snapshot đã được engine cập nhật; module trình bày không tự tính thêm thời gian đã trôi để tránh cộng hai lần.

## Kỹ thuật và kiểm chứng

`animalGrowthRate` được dùng chung bởi engine và ETA, giữ nguyên công thức cũ. `husbandry-outlook.mjs` chỉ đọc dữ liệu, không tạo migration hoặc action mới. Không áp dụng ETA nuôi cho câu miễn phí ở Ao làng.

195/195 kiểm thử đạt: đối chiếu các loài, thời tiết, cấp chuồng, chuyển lớn → sản xuất, đủ/thiếu thức ăn, mốc thu, số lứa và sản lượng còn lại. Build, import engine đã build, catalog gameplay và audit tài nguyên đạt; public vẫn 22,66 MiB, không thêm atlas.

Kiểm tra Chromium thực tế: thẻ chuồng/ao, trạng thái đói, sắp hết thức ăn, đã thu được, chi tiết giữ qua polling; bố cục 844×390 và 568×320 không tràn ngang, không lỗi JS. Chưa thử trên Android/iOS Safari thật. [Ảnh runtime](assets/husbandry-outlook-v1.png).

Pilot Social/Ao vẫn chưa có người tham gia hoặc dữ liệu thực; không dùng kết quả tự động ở đây thay cho phản hồi người chơi. Bước tiếp theo: đánh giá bản hiện tại với người chơi theo [kế hoạch pilot](SOCIAL_LAKE_PILOT_V1.md), rồi quyết định UX cần sửa hoặc chuyển P2.1; không tự tăng thưởng để khuyến khích ra ao.

# P4 — Bộ chạy pilot trải nghiệm V1

Bổ sung 28/11/2026: [công cụ cohort offline](PILOT_COHORTS_V1.md) tính D1/D7/D30 từ sổ phiên ngày thực riêng. Form quan sát bên dưới vẫn không tự đo retention; chưa có dữ liệu hoặc kết quả người chơi.

Cập nhật: theo yêu cầu người dùng, pilot sẽ bổ sung sau. Chưa có dữ liệu người chơi; chưa mở thanh toán.

Ngày 27/11/2026. **Đã chuẩn bị công cụ/quy trình; chưa chạy với người chơi, chưa có kết quả pilot.** Không coi kiểm thử demo là chứng minh giữ chân hoặc sẵn sàng bán hàng.

## Dùng ngay

Mở [bộ ghi nhận offline P4](assets/social-lake-pilot-kit-v1.html) trong trình duyệt. Đây là bản nâng cấp cùng file cũ, không tạo thêm app hoặc trang trong game. Không gọi API, gửi mạng, tự lưu trình duyệt hoặc sửa dữ liệu game. Chỉ dùng P01–P40, không ghi tên thật, tài khoản, token, chat hay save đầy đủ.

1. Chọn bản thử/môi trường thật và ngày tổ chức. Ghi mã commit của build đã chạy, không coi HEAD workspace là bằng chứng bản đã deploy. Mặc định đề xuất môi trường thử riêng; không tự deploy hoặc gửi lời mời trong đợt này.
2. Kiểm sáu mục chuẩn bị trên đúng build/thiết bị, gồm đường đi, ao, xem thử/hủy/đặt đồ và tải ảnh kỷ niệm. Gặp mất đồ/nhân thưởng/kẹt đường thì dừng tình huống liên quan, ghi lỗi và sửa trước mở rộng. Không reset tài sản production để tạo kịch bản.
3. Mời tự nguyện 20–40 người cho vòng quan sát P4; giữ mã ổn định trong cùng đợt. Ghi nhóm **Trang trí / Chơi cùng bạn / Chơi solo**, kinh nghiệm và thiết bị thật. Không ép người không muốn nghịch hoặc chưa đủ điều kiện vào tình huống đó.
4. Mở đầu bằng “Bạn cứ chơi thử rồi nói muốn làm gì tiếp”. Quan sát khoảng 5 phút trước khi chỉ dẫn; nếu phải hướng dẫn thì ghi Cần hướng dẫn, không gộp với Tự làm được.
5. Chọn các tình huống phù hợp bên dưới; mỗi lượt ghi build/ngày game/thiết bị/kết quả, mức ảnh hưởng nếu đã đánh giá và đề nghị sửa tách khỏi điều quan sát được. Chưa hỏi khó chịu thì để trống. Ngày game không phải ngày thực để tính retention.
6. Cuối buổi xuất JSON, CSV và báo cáo UX Markdown, kiểm file đã tải rồi mới đóng. Không có autosave. Nhập JSON trên trang trống để tiếp tục; không gộp hoặc ghi đè trang đang có quan sát.

## Tình huống và câu hỏi

| Nhánh | Việc để người chơi tự tìm | Ghi gì |
| --- | --- | --- |
| Phiên đầu | Gieo → tưới → tìm việc lúc chờ → thu khi sẵn sàng | Hiểu trạng thái/ETA không, có lý do ở lại hoặc quay lại không; không bắt chờ quá buổi thử |
| Quay lại | Mở lại sau nghỉ, tìm việc cần ưu tiên | Popup có rõ/phiền, có biết việc gì cần làm tiếp |
| Hợp tác | Ghim/góp hàng, giải thích kết quả cá nhân | Có hiểu mốc thưởng và hàng không hoàn lại, có lý do góp cùng bạn |
| Trang trí | Chọn phong cách, xem thử, hủy, đặt một món nếu muốn/có tài nguyên | Có hiểu chỉ xác nhận mới đặt, có thích nét ba miền, có che cửa/lối đi không |
| Kỷ niệm | Mở trang từ đơn/sổ, tìm tên, tạo/lưu PNG nếu muốn | Hiểu đây là ghi nhận chứ không nút nhận thưởng, có muốn giữ ảnh không |
| Xã hội/Ao | Chọn hoạt động ven ao, giúp/nghịch trong điều kiện có sẵn | Giá trị của việc ra ao, cảm giác bị làm phiền và tính rõ ràng của quota |

Nên có mobile ngang Android và Safari/iOS thật, desktop và người mới. Không đổi giá/quota hoặc tăng thưởng chỉ để đạt tỷ lệ hoàn thành. Không cần mỗi người thử toàn bộ nhánh; đánh dấu Chưa thử khi chưa quan sát, không coi là lỗi.

## Dữ liệu và báo cáo

Schema xuất **3**: tối đa 500 quan sát/tệp, nhập tối đa 2 MB. Giữ build/môi trường/ngày trên từng dòng; thêm nhóm, kinh nghiệm, mức ảnh hưởng và đề nghị xử lý. Tệp V1/V2 vẫn nhập được, giữ quan sát gốc và ý kiến nghịch cũ; các trường chưa từng hỏi thành Chưa phân nhóm/Chưa ghi/Chưa đánh giá, không tự suy ra. Checklist cũ được bỏ đánh dấu để xác nhận lại đủ sáu mục P4.

CSV có các trường mới và giữ xử lý ký tự đầu công thức bảng tính. JSON dùng tiếp tục nhập, bỏ các khóa ngoài danh sách cho phép; lỗi định dạng/ngày không tồn tại/tệp quá lớn không thay dữ liệu đang ghi. CSV không chứa checklist, dùng JSON để giữ checklist.

Báo cáo Markdown tổng hợp **lượt quan sát** và **mã người thử khác nhau trong tệp**, chia tình huống/nhóm/thiết bị; liệt kê các lượt mức Nghiêm trọng và đề nghị xử lý. Một người có nhiều quan sát hoặc xuất hiện nhiều nhóm; không cộng số người từng nhóm thành tổng và không gọi lượt lỗi là số bug duy nhất. Report dựa trên nội dung người vận hành nhập, không phải telemetry được server xác minh. Không có dữ liệu mẫu trong bộ ghi nhận giao cho người vận hành.

Chưa đo D1/D7/D30 hoặc doanh thu. Đánh giá retention theo cohort ngày thực UTC cần ghi nhận phiên thật riêng và chờ cohort đủ tuổi; không suy ra từ form này, từ ngày game 8 giờ hoặc từ số dòng nhật ký. Chưa cài analytics/dashboard, chưa có báo cáo kết quả người chơi. Nếu cần theo dõi tuần tiếp theo, thống nhất dữ liệu/quyền truy cập/thời hạn giữ trước khi triển khai bộ đo.

File xuất chứa ý kiến người thử: người vận hành giữ riêng cho nhóm phân tích, tránh đưa vào Git công khai. Chỉ đưa kết luận đã bỏ nhận dạng vào tài liệu dự án. Không tự gửi dữ liệu hoặc lời mời cho ai.

## Kiểm chứng và phần còn chờ

- Ba kiểm thử tự động kiểm migration V1/V2, P40/giới hạn 500, loại khóa riêng, ngày sai, bản ghi lỗi và đếm người/lượt riêng. Đây là test công cụ, không phải pilot người chơi.
- Edge offline ở desktop 1100×850, ngang 844×390 và 568×320: không tràn ngang trang; thêm P40, xuất JSON/CSV/report, nhập lại JSON qua file input thật, xóa quan sát và cập nhật tổng hợp đạt. Dùng một bản ghi QA tổng hợp, không giữ trong tài liệu kết quả; không bịa phản hồi. Download được chặn trong QA để đọc nội dung kiểm tra, không coi đó là đã thử tải trên Safari/Android thật.
- Không đổi code game hoặc media, không chạy lại build/test engine chỉ cho công cụ tài liệu này. Không thêm ảnh QA để tránh phình assets.

**Còn cần để chạy pilot thật:** URL/mã build đã triển khai, lịch, nhóm tự nguyện và người điều phối quan sát. Những đầu vào này chưa có, nên P4 chỉ ở trạng thái chuẩn bị; không đánh dấu đạt gate và chưa chuyển sang P5 thanh toán. Khi có phản hồi, ưu tiên sửa lỗi chặn chơi/khó hiểu trước bổ sung hệ thống mới.

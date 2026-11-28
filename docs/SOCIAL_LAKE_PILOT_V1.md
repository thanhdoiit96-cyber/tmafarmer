# Pilot tương tác hàng xóm và Hồ làng

Cập nhật 27/11: [Pilot P4 toàn vòng chơi](P4_PLAYER_PILOT_V1.md) mở rộng chính bộ ghi nhận lên schema 3/P01–P40, thêm decor/kỷ niệm và báo cáo UX. Các mục quy mô 5–12/schema 2 bên dưới là phạm vi đợt Ao/xã hội trước; luật gameplay vẫn tham chiếu tài liệu runtime hiện hành. Chưa có kết quả pilot người chơi.

26/11/2026. **Kế hoạch thử với người chơi, chưa chạy và chưa có kết quả.** Mục đích là đánh giá cảm giác chơi và mức dùng phần thưởng, không phải kiểm thử tải. Phạm vi source: [Ao/giúp tưới](SOCIAL_LAKE_V1.md), [sâu nghịch](PRANK_PLAY_V1.md).

Đã chuẩn bị [bộ ghi nhận offline](assets/social-lake-pilot-kit-v1.html), mở trực tiếp trong trình duyệt. Không nằm trong game, không gọi API, không tự thu dữ liệu hay lưu xuống đĩa. Có checklist, form quan sát, xuất CSV/JSON và nhập lại JSON để tiếp tục ngày sau. Không có dữ liệu người chơi mẫu.

## Trạng thái sẵn sàng

| Hạng mục | Trạng thái |
| --- | --- |
| Cơ chế giúp, nghịch, Ao làng, Ông Sáu và camera | Đã có trong source; kiểm chứng runtime ở tài liệu từng phần |
| Kế hoạch và bộ ghi nhận | Đã chuẩn bị và kiểm tra trình duyệt |
| Môi trường/build/lịch chạy pilot | Chưa được người vận hành chỉ định; chưa deploy hoặc push trong bước này |
| Người tham gia và đồng ý | Chưa tuyển/mời hoặc ghi nhận |
| Phản hồi, kinh tế và kết luận pilot | Chưa có; không thay bằng số liệu kiểm thử tự động |

## Checklist thực hiện một đợt

1. Chọn môi trường thử và build thật. Mặc định đề xuất bản thử riêng; người vận hành quyết định trước khi mời. Ghi mã commit của bản đã triển khai, không lấy HEAD của máy phát triển làm bằng chứng production. Nếu dùng workspace chưa commit, ghi rõ bản chưa đóng gói để tránh so lẫn hai phiên bản.
2. Mở bộ ghi nhận, nhập build, môi trường và ngày tổ chức. Kiểm tra camera toàn ao, gặp Ông Sáu, E/chạm/đóng bảng, đường lên hai cầu, điểm dọn và giếng có/không có công trình trên đúng bản thử.
3. Tự thử cơ chế tại môi trường đó: giúp đúng cây khô; không giúp cây ẩm; nghịch mặc định hoạt động cả với vườn từng lưu trạng thái tắt; kiểm tra cấp độ, cổng, quota và miễn nhận; đổi gói không nhân thưởng khi bấm lặp. Kiểm thử source không thay bước kiểm tra bản đã triển khai.
4. Chuẩn bị 5–12 người tự nguyện với mã P01–P12. Nên có một người mới, hai người đã đủ cấp 3 muốn thử nghịch cùng nhau và người dùng thiết bị thật. Không tăng XP/vật tư production để ép đạt kịch bản; chưa đủ cấp hoặc từ chối dùng vẫn là quan sát hợp lệ.
5. Ghi một quan sát mỗi tình huống, đúng ngày game hiển thị (UI đánh số từ 1), thiết bị thật, kết quả và lý do ngắn. Mức khó chịu không hỏi thì để trống; không coi “chưa thử” là thất bại hoặc 0 khó chịu.
6. Xuất JSON sau buổi thử và trước khi đóng trang. Ngày sau mở trang trống rồi nhập JSON; kiểm tra build/ngày và tiếp tục. Không tự lưu trong trình duyệt để tránh giữ dữ liệu ngoài ý muốn. CSV dành cho tổng hợp, JSON để tiếp tục nhập liệu; không có tính năng gộp hai file tự động.
7. Sau ít nhất ba ngày game, tổng hợp theo tình huống và thiết bị; tách quan sát thật khỏi kiểm thử mô phỏng. Ghi vấn đề, mức ảnh hưởng và thay đổi đề nghị trước khi mở thêm nội dung.

Form giới hạn 500 quan sát/tệp và nhập tối đa 2 MB; khi đủ, xuất file rồi mở phiên mới. Mỗi dòng giữ build/ngày/môi trường tại lúc ghi; checklist ở đầu thuộc trạng thái chuẩn bị hiện tại, không phải chứng nhận cho mọi build trong file. CSV không xuất checklist, dùng JSON khi cần giữ nó.

Khi gặp lỗi nghiêm trọng, ngừng tình huống liên quan, ghi build/thời điểm/tác vụ/ảnh hưởng bằng mã người thử, không ghi token hoặc toàn bộ save. Chỉ người vận hành mới quyết định tạm ngừng bản thử hay quay lại bản deploy ổn định đã xác minh. Không tự xóa dữ liệu hoặc reset làng để che lỗi; giữ tài sản người chơi cho tới khi có phương án khôi phục cụ thể.

## Cách tổ chức

Thử ở một làng riêng, khoảng 5–12 người tự nguyện; có cả người chưa đạt cấp 3, người chỉ thích chơi một mình và người dùng mobile ngang. Dành ít nhất ba ngày game (mỗi ngày 8 giờ), không yêu cầu online liên tục. Không sửa XP/vật tư của người đang chơi production để tạo mẫu.

Giới thiệu rõ rằng lấy trộm cũ vẫn có, tưới giúp và nghịch dùng quota riêng. Nghịch tự mở từ cấp 3, có giới hạn, bắt miễn phí và miễn nhận sau mỗi lượt; xem [UI và luật hiện hành](NEIGHBOR_VISIT_UI_V2.md). Tham gia thử nghiệm là tự nguyện; không muốn thử nghịch là phản hồi hợp lệ. Không phát quà theo số vụ nghịch hoặc số người mời.

Chưa deploy hoặc gửi lời mời tự động. Người vận hành chọn bản thử và lịch cụ thể rồi mới mời người chơi. Không thu chat, mật khẩu, token hoặc tên thật.

## Các tình huống cần quan sát

| Nhóm | Việc thử | Điều cần hỏi/ghi nhận |
| --- | --- | --- |
| Khám phá | Tự tìm chỗ dọn bờ, thử câu, xem sổ | Có hiểu vì sao ra ao? Có phân biệt nhiệm vụ với nút nhận quà? |
| Tương trợ | Tưới một ô đang cần; thử lại ô ẩm | Có hiểu chi phí thuộc người giúp? Chủ có muốn tắt nhận? |
| Nghịch có giới hạn | Người thử tự nguyện trải nghiệm thả/bắt; kiểm tra cấp, cổng và quota | Có phân biệt sâu nghịch với sâu tự nhiên? Có hiểu cách bắt và miễn nhận? |
| Chống làm phiền | Thử tiếp khi vườn đang chịu hiệu ứng hoặc miễn nhận | Thông báo có giải thích đủ? Có lo mất mùa nếu offline? |
| Kinh tế ao | Dọn, đổi một gói; ngày sau thử gói còn lại | Có lý do chọn thức ăn/lọ? Có hiểu hai gói chung giới hạn ngày? |
| Quay lại | Nghỉ qua hiệu ứng rồi mở game | Có thấy thông tin vừa đủ, không dồn popup? |
| Thiết bị | Android/iOS ngang, chạm và bàn phím desktop | Nút có dễ chạm, che map hoặc khó đóng/mở bảng? |

## Dữ liệu vừa đủ và giới hạn diễn giải

Ghi thủ công bằng mã người thử P01…P12, ngày game và bản build. Chỉ hỏi mức độ khó chịu 1–5, tác vụ hiểu/không hiểu, lựa chọn nhận nghịch và lý do. Không cần thêm dịch vụ analytics trước khi biết câu hỏi nào hữu ích.

Nếu người vận hành kiểm tra state ở môi trường thử, chỉ ghi số tổng hợp tại cùng mốc cuối ngày: số người đã dọn (`lakeDaily.worked`), đã đổi (`exchanged`), số lượt giúp/thả/nhận, tổng lọ/dấu còn giữ. Không lưu bản sao toàn farm hoặc token vào tài liệu. Không cộng hai snapshot cùng ngày để suy ra tổng lượt; quota là counter hiện tại, reset theo ngày.

Bộ ghi quan sát xuất schema 2, vẫn đọc bản 1 và giữ ý kiến cũ để đối chiếu lịch sử; checklist bản 1 cần xác nhận lại. Trường `consent` giữ tên để tương thích, nay ghi ý kiến về nghịch mặc định.

State hiện tại **không cho biết** ý kiến về nghịch mặc định, lý do rời game, lịch sử mọi lần phát/tiêu lọ hay retention. Không suy ra các chỉ số này từ cờ cuối ngày hoặc log 14 dòng. Hỏi trực tiếp, ghi quan sát; nếu cần telemetry sau pilot thì đặc tả sự kiện và thời hạn lưu riêng trước khi thêm code.

| Mã người thử | Thiết bị | Hiểu giúp/nghịch/trộm? | Khó chịu 1–5 | Nhận nghịch? Vì sao? | Một vướng mắc cụ thể |
| --- | --- | --- | --- | --- | --- |
| P01 | Chưa ghi | Chưa thử | — | — | — |

## Cách quyết định sau pilot

- Bất kỳ lỗi mất đồ, nhân thưởng, bỏ qua cấp/cổng/quota/miễn nhận hoặc phá đường đi: dừng thử tình huống đó và sửa trước khi mở rộng.
- Nếu người thử nhầm sâu nghịch thành nguy cơ mất mùa hoặc không tìm thấy nút bắt: sửa nhãn/chỉ dẫn trước; không tăng phần thưởng để bù sự khó hiểu.
- Nếu có phản hồi bị quấy rối dù đã đủ guard: xem lại tần suất/miễn nhận hoặc chuyển hiệu ứng sang thuần hình ảnh; ghi nhận để đánh giá, không tự thêm lại nút bật/tắt.
- Nếu ít người ra ao: hỏi lý do và xem khả năng tìm đường/ý nghĩa hoạt động, không tự tăng tiền hay thêm việc bắt buộc.
- Với mẫu nhỏ, chỉ kết luận vấn đề UX và giả thuyết cần thử tiếp. Chưa kết luận giữ chân, doanh thu hoặc cân bằng kinh tế dài hạn.

Kết quả thật phải ghi ngày/build, số người tham gia, những gì quan sát được và thay đổi đề nghị; không thay các ô trống bằng số liệu mô phỏng.

## Mẫu kết luận cuối đợt — chưa điền

- Build/môi trường/lịch: chưa có.
- Số người và thiết bị thật đã tham gia: chưa có.
- Việc tự tìm được / cần hướng dẫn / chủ động không dùng: chưa có.
- Vướng mắc nghiêm trọng và cách xử lý: chưa có.
- Phản hồi về quyền nhận nghịch và cảm giác bị làm phiền: chưa có.
- Đánh giá gói thưởng: chưa có; form không tự suy ra tổng lọ/dấu phát từ số quan sát.
- Đề nghị sửa UX hoặc thử tiếp, bằng chứng kèm giới hạn mẫu: chưa có.

## Kiểm chứng bộ ghi nhận (không phải pilot)

Edge/Chromium đã kiểm tra: trang bắt đầu trống; thiếu build/môi trường/ngày không thêm quan sát; câu chưa hỏi/checklist chưa xác nhận giữ trống/false; xuất JSON rồi nhập lại, chặn ghi đè khi trang có dữ liệu và từ chối dòng không hợp lệ. Ghi chú được dựng bằng text, không chạy HTML nhập vào; CSV đặt dấu nháy trước nội dung có thể bị spreadsheet hiểu thành công thức. Reload trang trả về trống, không tự lưu.

Không lỗi JavaScript hoặc tràn ngang ở 1100×800, 844×390, 568×320, 390×844. Chưa kiểm tra Safari iOS/Android thật. Các dòng QA tạm chỉ nằm trong bộ nhớ profile kiểm tra, không lưu vào tài liệu hoặc tính là phản hồi người chơi. Không chạy lại build/suite gameplay vì bước này không sửa runtime game.

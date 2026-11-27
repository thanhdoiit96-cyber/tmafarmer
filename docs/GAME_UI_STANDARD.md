# Chuẩn UI bảng Công cụ và thông tin trong game

Ngày chốt: 27/11/2026. Áp dụng cho tính năng mới và các lần sửa UI tiếp theo của Vườn Mùa Vui, theo yêu cầu người dùng. Đây là chuẩn chung; tài liệu/phác thảo cũ chỉ dùng tham khảo lịch sử nếu khác chuẩn này.

## 1. Bảng Công cụ: lưới và phân trang trước

Các bảng chọn giống, vật nuôi, chăm sóc, kho/túi, cửa hàng, đơn hàng, vật phẩm và công thức ưu tiên **lưới item có phân trang**. Không nối danh sách dài xuống dưới hoặc dùng cuộn vô hạn làm cách duyệt chính.

Theo phản hồi tiếp theo của người dùng, **Bán nhanh được phép dùng danh sách dọc có phân trang** để dành đủ chiều ngang cho ảnh, tên và thao tác bán. Lưới là ưu tiên, không phải ràng buộc bắt buộc khi làm giảm tính dễ dùng. Danh sách vẫn giữ phân trang ở dưới, tách tên/số lượng/giá, mật độ vừa khung và không cuộn dài làm cách duyệt chính.

- Mỗi item ưu tiên hình minh họa, tên, một trạng thái/số lượng chính và hành động cần dùng. Chạm/click hình hoặc nút thông tin để mở chi tiết; không nhét toàn bộ mô tả, công thức và điều kiện vào từng ô.
- Hiện trang hiện tại/tổng trang, nút trước/sau rõ và vô hiệu đúng ở hai đầu. Lọc hoặc đổi nhóm thì về trang đầu; dữ liệu cập nhật không tự đưa người chơi về trang đầu.
- Đặt phân trang **dưới lưới**, dùng mẫu mũi tên trước/sau và số trang như Sổ chuồng. Giữ đồng nhất trong Kho, bộ chọn và các sổ chăm sóc; không đặt phân trang xen giữa bộ lọc và item.
- Giữ trang/lọc theo ngữ cảnh: chuồng chính/chuồng phụ, kho/túi, nhóm hàng. Khi item biến mất hoặc số trang giảm, đưa về trang hợp lệ. Điều hướng từ nhiệm vụ/map phải mở đúng trang chứa đối tượng.
- Dùng ID thật của đối tượng, đợt và vật phẩm. Không lấy vị trí trong lưới làm ID thao tác; không bỏ qua index 0. Phân trang trong hộp thoại phải cập nhật chính hộp thoại đó.

**Mật độ phải cân đối, không cố nhồi số lượng:** bắt đầu với 6 item/trang, bố cục 3×2 cho bảng hẹp như Sổ chuồng đã duyệt. Bộ chọn rất gọn có thể dùng 8; item cần ảnh/nút lớn có thể giảm còn 4. Đây là điểm xuất phát, không phải hạn mức cứng cho mọi màn hình. Chọn theo diện tích vùng bảng thực tế, độ dài tên tiếng Việt và vùng chạm, không chỉ theo chiều rộng cả thiết bị.

Không thu nhỏ ảnh/chữ/nút tới mức khó đọc để giữ một số item cố định; cũng không làm vài item quá lớn khiến người chơi phải lật quá nhiều trang. Ưu tiên đổi số hàng/cột hoặc số item/trang khi vùng hiển thị thay đổi. Nếu cần giữ item đang xem khi đổi kích thước, tính lại trang chứa item đó.

## 2. Chi tiết: nơi ưu tiên dùng cuộn

Thông tin dài như đặc tính, điều kiện mở, tốc độ, sản lượng, công thức, lịch sử và hướng dẫn nằm trong bảng/hộp thoại chi tiết mở bằng hành động chủ động. Đây là nơi ưu tiên cuộn và các mục mở rộng.

- Thông tin chính hiện trước; giải thích sâu mở khi cần. Tên, trạng thái, ETA và sản lượng phải đọc được mà không lặp thành nhiều đoạn.
- Giới hạn chiều cao theo vùng hiển thị, gồm safe area trên điện thoại ngang. Có nút đóng dễ tìm, hỗ trợ bàn phím và thao tác chạm.
- Tránh hai vùng cuộn lồng nhau; không làm cuộn bảng gây trôi cả map. Đóng chi tiết trở lại đúng lưới/trang/lựa chọn.
- Cảnh báo tiêu/mất tài sản phải có ngay trong bước xác nhận, không giấu trong phần giải thích thu gọn.

## 3. Có cuộn phải nhận biết được

Nếu nội dung thực sự vượt chiều cao/chiều rộng vùng chứa, phải có thanh cuộn hoặc chỉ báo cuộn **nhìn thấy rõ**, cùng phong cách gỗ/giấy/xanh trầm. Không giấu bằng `scrollbar-width:none`, thanh trong suốt hoặc chỉ đợi hover mới hiện dấu hiệu.

- Track và thumb phải phân biệt được với nền; thumb đủ rõ, không che chữ, item hoặc nút. Không dùng viền trắng dày gây lấn nội dung.
- Phát hiện tràn bằng kích thước nội dung/vùng chứa thực tế, cập nhật khi đổi kích thước, mở mục hoặc polling. Hết tràn thì bỏ chỉ báo, không hiện thanh giả.
- Trên hệ điều hành/trình duyệt tự ẩn scrollbar native, không coi việc khai báo CSS là đã đạt: cần thêm chỉ báo thanh cuộn trong bảng, phản ánh vị trí/phần đang xem và có thể nhìn thấy khi còn tràn. Không cần thay cơ chế cuộn native bằng thư viện riêng.
- Kiểm tra cả chuột, bánh xe/trackpad, bàn phím và vuốt. Nếu thanh tùy biến có thể kéo, phải hỗ trợ tương tác tương ứng; nếu chỉ là chỉ báo thì không giả thành nút kéo.

Cuộn ở bảng Công cụ chỉ là ngoại lệ khi bố cục thực tế không thể chứa phần điều khiển/phụ trợ; danh sách item vẫn phải phân trang. Không dùng ngoại lệ này để quay lại danh sách dài.

## 4. Badge cho số việc có thể làm/cần làm

Số lượng mang ý nghĩa hành động phải có **badge riêng**, đặt sát nhãn tương ứng:

| Ý nghĩa | Màu và ví dụ |
| --- | --- |
| Có thể làm/đã sẵn sàng | Xanh: Thu **3**, Có thể giao **2** |
| Cần chăm sóc/xử lý | Đỏ: Cần ăn **4**, Cần tưới **2** |
| Đang chờ hoặc tổng số trung tính | Màu trung tính, không dùng đỏ để báo một tổng số bình thường |

Giữ nhãn chữ, số và nếu hữu ích có icon; không truyền đạt chỉ bằng màu. Badge phải đủ tương phản và giữ màu ý nghĩa khi tab được chọn. Số 0 vẫn thể hiện đúng, không giả thành cảnh báo có việc; có thể dùng sắc độ dịu hơn nhưng không đổi nhãn.

Phải xác định phạm vi đếm: tổng của chuồng/nhóm hay riêng trang hiện tại. Bộ lọc Sổ chuồng đếm toàn chuồng đang mở, không chỉ sáu con trên trang. Không cộng chung con đang đói và con có thể thu thành một nhãn mơ hồ.

**Số tài nguyên không phải số việc:** thức ăn, xu, sản phẩm trong túi cần tách riêng bằng icon/nhãn và số nổi bật. Ví dụ thức ăn trong túi nằm trên tiêu đề Sổ chuồng để luôn thấy, không bị lẫn với lượng cần cho một lần ăn. Không dùng badge đỏ cho mọi tài nguyên chỉ vì đó là con số.

## 5. Tách tên, số lượng, đơn vị và trạng thái

Không ghép toàn bộ thành một chuỗi khó quét. Tách thành các thành phần có cấp độ thị giác rõ ràng:

| Thành phần | Cách trình bày |
| --- | --- |
| Tên | Nhãn chính, có khoảng riêng với số; tên dài được xử lý có chủ đích và xem đủ trong chi tiết |
| Số lượng | Badge hoặc chữ số đậm, không chìm trong câu mô tả |
| Đơn vị/nguồn | Nhỏ hơn số nhưng rõ: phần, món, trong túi, đã góp/cần |
| Trạng thái | Nhãn ngắn/icon có nghĩa; không lặp trạng thái trong tiêu đề, nội dung và nút |
| Chi phí/kết quả thao tác | Gắn sát nút hoặc phần xác nhận, phân biệt với số đang sở hữu |

Ví dụ: **Lúa mì** ở dòng tên; **Kho bạn · 5** và **Thiếu · 6** ở vị trí riêng. Nút cho ăn chỉ ghi lượng cần một lần, số trong túi là một ô khác; không lặp “Cần 3 phần” trong nội dung rồi lại trên nút. Sản lượng lứa này, số lứa đã thu và phần trăm tốc độ là ba đại lượng khác nhau, không dùng một con số thiếu nhãn.

Trong code, dùng các node/phần tử riêng cho tên, số và đơn vị; không dựa vào khoảng trắng trong chuỗi để căn. Nhãn truy cập cần đọc đầy đủ ý nghĩa, chẳng hạn “Trong túi còn 20 phần thức ăn” hoặc “Cần cho ăn, 4 vật nuôi”.

## 6. Phong cách và tiêu chí nghiệm thu

Giữ chất liệu gỗ/giấy, màu ấm/xanh trầm và sprite/icon tác giả đang có. Ưu tiên cảm giác thao tác với vật phẩm trong game; tránh bảng dữ liệu kiểu trang quản trị, nhiều thẻ lồng nhau hoặc nhiều nút chữ lặp. Thiết kế lại bố cục đáng kể phải dựng bản nhìn được và duyệt trước khi tích hợp; runtime phải đối chiếu đúng bản duyệt.

Trước khi hoàn thành một UI:

1. Kiểm tra vùng bảng thực tế ở desktop, mobile ngang 844×390 và 568×320; xét cả tên dài, nhiều item, đủ/thiếu tài nguyên và chuồng phụ. Không chỉ đo `innerWidth`.
2. Lưới vừa mật độ; ảnh nhận diện rõ, tên/số phân biệt, nút không chồng và thao tác chạm được. Không có item bị cắt nửa mà không có chỉ báo.
3. Phân trang/lọc hoạt động trong đúng bảng/hộp thoại; giữ lựa chọn qua polling; xử lý rỗng/trang cuối/item biến mất/đổi kích thước. Mở từ map/nhiệm vụ tới đúng trang và đối tượng.
4. Badge đúng ý nghĩa và phạm vi; số tài nguyên quan trọng nhìn thấy ngay, cập nhật sau thao tác thành công. Không đổi công thức engine để khớp UI.
5. Chi tiết đủ thông tin, mở/đóng thuận tiện; mọi vùng có cuộn đều nhận biết rõ. Phải thử khi thật sự tràn, không chỉ khi nội dung ngắn.
6. Giữ định danh và điều kiện vị trí như `world.approach()`; xác nhận trước thao tác mất tài sản. Kiểm thử phù hợp với phần sửa, lưu ảnh runtime và ghi rõ hạn chế thiết bị chưa thử.

Các mốc kích thước trên là bộ kiểm tra tối thiểu, không bảo đảm đã thử trên iOS Safari/Android thật. Không báo đã kiểm thiết bị nếu mới dùng Chromium giả lập.

## 7. Áp dụng và tài liệu tham chiếu

Chuẩn này áp dụng bắt buộc khi xây/sửa tính năng từ thời điểm chốt. Không tự coi mọi UI cũ đã tuân thủ; khi chạm một màn hình cũ, rà lại các mục liên quan và ghi phần còn thiếu. Việc ghi chuẩn này không đồng nghĩa toàn bộ scrollbar/lưới cũ đã được sửa trong runtime.

Tham chiếu hiện có: [Sổ chuồng/Bảng đơn V4](ORDERS_ANIMAL_UI_V4.md), [bản được duyệt](ORDERS_ANIMAL_UI_DRAFT_V4.md), [bộ chọn giống/vật nuôi](GAME_UI_V2.md). Ví dụ cũ không được ưu tiên hơn quy tắc người dùng chốt ở tài liệu này.

## 8. Thông báo trạng thái và công việc

Dùng chung vùng thông báo hiện có: desktop ở thanh dưới map, mobile ngang sát dưới HUD và tránh bảng Công cụ. Không đặt thông báo mới ở giữa map hoặc trên joystick/nút tương tác; không xếp chồng nhiều toast. Nền trong khoảng 70–82%, giữ chữ rõ và không bắt pointer. Kết quả thường 1,8–2,6 giây, lỗi có thời gian đọc dài hơn (tối đa 6 giây), mờ dần 180 ms; tôn trọng giảm chuyển động. Không để thông báo thường ghi đè lỗi đang hiện hoặc lặp lại làm thông báo tồn tại mãi. Trạng thái đang xử lý theo vòng đời thao tác, không báo thành công trước server. Giữ lỗi/điều kiện cần xử lý trong popup tương ứng. Chi tiết và bằng chứng: [Thông báo V1](GAME_NOTICES_UI_V1.md).

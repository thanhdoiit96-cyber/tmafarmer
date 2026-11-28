# Bếp quê ngày chợ — runtime V1

28/11/2026. Triển khai theo [thiết kế gameplay](VILLAGE_FAIR_DRAFT_V1.md) và [bảng mỹ thuật đã duyệt](VILLAGE_FAIR_ART_DRAFT_V1.md). Hoàn thiện source/local; chưa commit, push hoặc deploy. P4 đo lường vẫn tạm gác, không có P5/thu thập dữ liệu mới.

## Chơi trong game

Góp hàng làng dùng ba sạp Bánh quê, Rau vườn và Quầy nước. Mỗi sạp nhận hai lựa chọn đã nêu trong bản duyệt. Thẻ tách ảnh, tên, số kho và mức quy đổi. Góp mở xác nhận số lượng, rồi nhân vật đi tới đúng sạp bằng `world.approach()` trước khi gửi action. Máy chủ kiểm tra vị trí hiện diện đúng quầy; số lượng, phần còn thiếu và kho đều được kiểm lại trước trừ.

Ghim lưu thêm ID sạp để hai mục cà rốt không lẫn nhau. Chuyển sạp không tự bỏ ghim, polling không tự đổi lựa chọn. Mục “Cách có” dùng hướng dẫn giống/công thức cũ. Người chơi không có xưởng vẫn góp nguyên liệu được; vật phẩm đã có trong kho không bị khóa lại theo cấp xưởng.

Mobile ngang giữ hai lựa chọn nhìn thấy cùng lúc, nút Góp trên thẻ; chạm hình/tên có ký hiệu ⓘ để xem giá trị góp, Ghim và Cách có. Nút ⓘ trên tiêu đề mở thời gian còn lại, quy tắc, Người cùng góp, Sổ góp hàng và Kỷ niệm khi đã hoàn tất. Desktop giữ các lối mở trực tiếp ở cuối bảng. Cuộn chi tiết dùng chỉ báo chung; không tạo danh sách vật phẩm cuộn dài.

Click quầy trên map cho chọn góp hàng hoặc chức năng gốc: Vật tư/Nông sản/Bán nhanh. Không thay chức năng mua bán bằng sự kiện. Điểm đứng, lối ra, giếng và collision map giữ nguyên.

## Cảnh thay đổi theo hàng thật

Nền sạch chỉ thay lúc đợt version 3 có hiệu lực; cảnh cũ vẫn dùng nền cũ. Master nền đã bỏ hàng ở vùng trưng bày, giữ kiến trúc/đường đi. Khay/giỏ/hàng là sprite RGBA riêng; loại chưa góp tiếp tục trống, không tự có đủ mọi món khi sạp hoàn tất. Độ đầy dùng hai mức hàng có sẵn, đổi sang mức nhiều khi sạp đạt 75%; giỏ trống là mức thứ ba. Dải nơ nhỏ hiện khi sạp đủ.

Tiểu thương dùng sprite người đi chợ đã có, clip thân dưới sau mép quầy; không ghép thêm tay, thay nhân vật người chơi hoặc bake người vào nền. Khách sân trước dùng tuyến đã có: một người khi chuẩn bị, hai người khi có hàng, ba người khi hoàn tất. Không thêm crowd chiếm đường. Mưa/sương/lớp chiều tối tiếp tục qua renderer hiện tại, tôn trọng reduced motion.

Nguồn giữ trong `docs/assets/village-fair-clean-source-v1.png` và `village-fair-props-source-v1.png`. Pipeline `py scripts/normalize-village-fair.py` xuất nền 800×480 và atlas RGBA 256×256 gồm 16 ô 64×64. Mỗi ô chuẩn hóa độc lập, alpha chỉ 0/255; không đưa ảnh bảng duyệt có chữ vào runtime. Metadata vị trí/ô nằm trong `public/pixel/village-fair-art.mjs`. Không dùng ảnh generate trực tiếp làm nguồn phụ thuộc ngoài repository.

## Dữ liệu, bật/tắt và rollback

Online: cờ `VILLAGE_FAIR_ENABLED=true` trong môi trường worker mới cho mở **đợt tiếp theo** theo version 3. Mặc định tắt; dev server truyền cờ vào worker. Demo mở đợt mới theo phiên chợ; demo cũ vẫn giữ đợt đang chạy đến hết hạn, không tự reset save để thấy nội dung mới.

Không cần SQL migration: dữ liệu lưu trong room JSON hiện có. Đợt version 1/2 giữ nhu cầu/thưởng/ảnh cũ đến hết. Version 3 chốt theme/version, ba sạp, nhu cầu theo số vườn và bảng quy đổi lúc mở; người vào/ra không sửa đợt. Khóa là `driveId + stallId + item`, không lấy index hiển thị, không bỏ index 0. Payload client cũ thiếu sạp bị từ chối trước trừ hàng. Server không nhận credit/value từ client.

Giữ 48 giờ thực, mốc ba món vật lý, thưởng một lần theo giá trị góp ×1,25, 12 XP và một phiếu. Bánh/nước ép dùng quote riêng 12/20, không thêm giá bán hoặc thưởng chế tạo. Hoàn thành sớm giữ phiên đến hết hạn. Hết hạn chưa đủ không hoàn hàng, thông tin có trong xác nhận. Sổ vẫn giới hạn sáu đợt, 12 tên; mỗi dòng có tên sạp để tránh nhầm cà rốt. Kỷ niệm dùng biên nhận cũ, không có nút nhận thưởng lần hai.

Rollback an toàn: tắt cờ để ngừng **mở phiên mới**, nhưng giữ decoder/action version 3 tới khi phiên đã mở kết thúc và lịch sử vẫn đọc được. Không rollback về binary chưa hiểu version 3 trong khi JSON còn dữ liệu mới. Không xóa đợt/kho hoặc ép hạ version. Không thay database production trong đợt QA này.

## Bằng chứng

- **245/245 tests đạt**, gồm bốn test model/art và một test API mới: quy đổi/giá trị cố định, phân sạp cà rốt, phần dư/đơn vị sai/hết hạn không trừ, trả thưởng một lần, đợt cũ và định mức cố định, gửi lặp và hai người tranh phần cuối, cờ/vị trí server, loại không góp không được vẽ thành đồ đầy. Test API dùng SQLite trong bộ nhớ.
- Build thành công; import worker từ `dist/server` đạt. Audit không thiếu asset, runtime public 23,54 MiB (trước 22,69 MiB; tăng khoảng 0,85 MiB). Chỉ hai PNG runtime mới; master/ảnh kiểm chứng nằm ngoài public.
- Edge headless chạy game demo riêng qua HTTP local: góp qua form và approach thật, ghim đúng sạp, xem chi tiết/Quy mô & quà, hoàn thành, hết đợt vào lịch sử và mở kỷ niệm. Kiểm 1100×850, 844×390, 568×320; hai thẻ nằm trong vùng bảng, không tràn ngang/JS exception. Canvas desktop giữ 640×384. Đã kiểm frame với mưa/sương và xem Canvas cuối ngày. Đây là giả lập Chromium, chưa phải Safari/iOS/Android thật hoặc bản deploy.

Ảnh runtime:

- [Chưa góp](assets/village-fair-live-empty.png)
- [Đang góp lúa mì](assets/village-fair-live-mixed.png)
- [Hoàn thành, góp hỗn hợp](assets/village-fair-live-complete.png)
- [Mobile ngang 844×390](assets/village-fair-live-844.png)
- [Mobile ngang 568×320](assets/village-fair-live-568.png)
- [Canvas 640×384, xem ở 1×](assets/village-fair-canvas-640.png)

Tỷ lệ và chất liệu đã đối chiếu bảng duyệt; khác biệt có chủ đích: dùng chính sprite tiểu thương hiện có thay nhân vật minh họa trong concept, giữ bảng đơn/nhân vật động hiện hữu, có thể bày một loại thay vì hỗn hợp theo hàng thật. Chưa tuyên bố hiệu quả giữ chân hoặc cân bằng qua người chơi thật. Bước tiếp theo là đánh giá hình/luồng bản này, sửa điểm cụ thể trước mở thêm chủ đề ba miền.

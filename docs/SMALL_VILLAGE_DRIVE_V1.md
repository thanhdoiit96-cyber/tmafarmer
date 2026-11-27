# P2.2 — Đơn làng ít người, runtime V1

Đã duyệt định mức và hoàn thiện source; chưa deploy. [Phân tích và bản phác đã duyệt](SMALL_VILLAGE_DRIVE_DRAFT_V1.md).

## Hành vi

- Đợt mới chốt số vườn lúc mở: một vườn 50%, hai vườn 75%, từ ba vườn 100%; từng món làm tròn lên. Giỏ cơ bản lần lượt 8/6/6, 12/9/9, 16/12/12.
- Lưu `version:2`, `memberCount`, `needs` trên đợt. Snapshot và hành động góp dùng chung hàm lấy nhu cầu; thêm/rời làng, nâng XP/công trình, polling không đổi đợt đang mở. Chọn template tiếp tục kiểm điều kiện mở trong làng.
- Đợt cũ chưa có version/needs dùng nhu cầu template cũ đến hết hạn. Không sửa lượng góp, ID, paid hoặc phiếu đã cấp. Đợt tiếp theo mới dùng luật mới.
- Room rỗng chưa mở đơn. Nhánh tạo làng server thêm vườn đầu tiên rồi gọi advance, lưu cùng state. Demo gọi advance sau khi đã tạo các vườn mẫu; demo có ba vườn nên mặc định vẫn mức đầy đủ. Snapshot không tự tạo/migrate đơn.
- Giữ 48 giờ thực, ngưỡng ba món, 125% giá trị bán nhanh phần góp, 12 XP và một phiếu; hàng không hoàn khi hết hạn. Chỉ một lần hoàn tất và trả thưởng theo cơ chế CAS/request ID hiện có.

## UI

Giữ phiếu ba nguyên liệu đã duyệt; thêm nhãn Quy mô, giải thích số vườn lúc mở trong Quy mô & quà. Đợt cũ ghi rõ định mức cũ. Ở mobile ngang thấp, thu gọn khoảng cách/tiêu đề để ba món và thao tác Góp vẫn nhìn thấy; phần phụ có thể cuộn với chỉ báo hiện có. Không thêm popup tự động.

Ảnh runtime: [desktop](assets/small-village-runtime-1100.png), [ngang 844×390](assets/small-village-runtime-844.png), [ngang thấp 568×320](assets/small-village-runtime-568.png).

## Kiểm chứng

- Toàn bộ **207 kiểm thử đạt**, gồm sáu ca mới về định mức/làm tròn, room rỗng, join/leave/nâng cấp, hoàn solo đúng giá trị, save cũ góp dở/đã trả, hết hạn/nghỉ dài/người góp dưới ngưỡng.
- Kiểm thử API bổ sung đạt sau đó: server tạo đơn solo 8/6/6, người vào sau giữ định mức; hai người tranh món cuối trên đơn nhỏ chỉ một người thành công, retry không trả thưởng/trừ hàng lần hai. Bộ API cũ kiểm đồng thời trên định mức đầy đủ vẫn đạt.
- Runtime Chromium demo: 1/2/3 vườn, nhãn và từng nhu cầu đúng, mở Quy mô & quà, mở xác nhận góp với cảnh báo; save cũ có nhãn riêng. Desktop và giả lập mobile 844×390, 568×320 không tràn ngang, bảng Công cụ mở thật. Chưa kiểm Safari/Android thiết bị thật.
- Build, cú pháp, kiểm tài nguyên và tài liệu gameplay đạt; bundle server kèm module định mức mới. Không thêm ảnh/atlas runtime.

## Phạm vi và rollback

Quy mô dùng tổng vườn đã tham gia lúc mở, không có phép đo hoạt động dài hạn. Làng đông nhưng nhiều người nghỉ chưa được giảm đơn theo người online. Người vào muộn có thể không còn đủ hàng cần góp để đạt ngưỡng; không tăng nhu cầu để bù.

Không rollback về engine chỉ biết template sau khi đã lưu đợt version 2: phải giữ hàm đọc `needs` tới khi các đợt mới kết thúc, hoặc tắt tạo đợt giảm định mức nhưng tiếp tục xử lý đợt đã chốt. Không migrate đợt đang mở về nhu cầu gốc. Không có thay đổi schema database.

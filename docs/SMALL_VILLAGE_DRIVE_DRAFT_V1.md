# P2.2 — Đơn góp hàng cho làng ít người

Trạng thái: **đã được duyệt và tích hợp trong source**, chưa deploy. Nội dung dưới giữ phân tích/bản phác lịch sử; kết quả thực hiện tại [SMALL_VILLAGE_DRIVE_V1.md](SMALL_VILLAGE_DRIVE_V1.md). Tiếp nối P2.1 và UI đơn hàng V4. [Mở bản tương tác](assets/village-small-room-draft-v1.html): chọn 1/2/3–12 người, đợt cũ, hoặc mô phỏng có người mới vào.

## Vấn đề đã xác minh trong source

`public/game.mjs` dùng ba `driveTemplates` với nhu cầu cố định. Giỏ nông sản cần 16 lúa mì + 12 cà rốt + 12 bắp cho cả làng một người hoặc 12 người. `advanceVillageDrive()` chốt template 48 giờ thực, nhưng nhu cầu hiện được đọc lại từ template trong snapshot và khi góp, chưa lưu trên từng đợt.

Engine đã kiểm tra món nâng cao có người mở qua `cropRequirement`/`animalRequirement`; template cơ bản là fallback, ba cây đều không có điều kiện XP/Xưởng. Giữ logic đó, không tạo hệ đơn thứ hai.

Không có trường hoạt động dài hạn đáng tin cậy trong farm. Presence server chỉ phản ánh online gần đây và không phù hợp để quyết định nhu cầu 48 giờ. V1 đề xuất dùng **số vườn đã tham gia lúc mở đợt**, ghi đúng nhãn này thay vì gọi là người hoạt động. Làng đông nhưng phần lớn nghỉ sẽ chưa được giải quyết hoàn toàn; không âm thầm coi presence là dữ liệu hoạt động.

## Định mức đề xuất

| Số vườn lúc mở | Hệ số | Giỏ nông sản: lúa mì / cà rốt / bắp | Tổng |
| --- | --- | --- | --- |
| 1 | 50% | 8 / 6 / 6 | 20 |
| 2 | 75% | 12 / 9 / 9 | 30 |
| 3–12 | 100% | 16 / 12 / 12 | 40 |

Mỗi món làm tròn lên, áp dụng cùng hệ số cho các template khác. Đây là điểm xuất phát để thử, chưa có dữ liệu người chơi chứng minh là mức cân bằng tối ưu. Kiểm tra riêng chi phí sản xuất thịt và trứng khi thử nhóm tiến trình cao.

Nhu cầu lưu một lần trên đợt dưới dạng `version`, `memberCount`, `needs`. Không đổi khi thành viên vào/ra, XP/công trình thay đổi, reconnect hoặc polling. Điều kiện chọn món vẫn cần ít nhất một vườn mở được món đó lúc tạo đợt; không đổi món giữa đợt nếu người đó rời làng.

Giữ thời hạn 48 giờ, ngưỡng 3 món, thưởng 125% giá trị góp, 12 XP, một phiếu trang trí và chỉ trả khi hoàn tất. Làng một người sẽ nhận thưởng cố định với ít hàng hơn: đây là thay đổi kinh tế có chủ đích cần duyệt, không mô tả là chỉ sửa UI. Tổng thưởng xu vẫn theo giá trị thực đã góp; không tăng thưởng mỗi món.

## Save cũ và khởi tạo

- Đợt cũ thiếu `needs/version` đọc nguyên định mức cũ đến hết hạn; không giảm lượng còn thiếu hoặc trả thưởng lại. Mọi đường đọc/ghi phải dùng chung một hàm lấy nhu cầu đợt.
- Đợt mới ghi đủ nhu cầu trong cùng lần lưu room; snapshot chỉ trình bày, không tự tạo/migrate đợt.
- `newRoom()` hiện tạo đơn khi chưa có farm. Luồng tạo làng server thêm farm sau đó nhưng chưa gọi advance lần nữa trong nhánh tạo mới; demo cũng cần rà. Khi tích hợp phải tạo/chốt đợt sau khi có vườn đầu tiên, tránh vô tình chốt quy mô 0 hoặc giữ nhu cầu đầy cho người chơi solo.
- Đợt hiện có giữ ID, lượng đã góp, contributor, dấu paid/phiếu và previous. Không thêm hành động đổi hoặc làm mới đơn theo yêu cầu người chơi.
- Người vào muộn được góp theo hạn mức còn lại; tổng nhu cầu không tăng. Không cam kết mọi thành viên đều đủ chỗ góp tối thiểu nếu vào sau khi hàng gần đủ.

## UI theo mẫu đã duyệt

Giữ phiếu đơn ba nguyên liệu, số còn thiếu và xác nhận góp của V4. Chỉ thêm nhãn nhỏ “Quy mô · 1 người/2 người/3–12 người”; giải thích cách chốt nằm trong chi tiết Quy mô & phần thưởng. Không thêm popup khi vào làng, không dùng màu đỏ cho tổng nhu cầu. Bản phác dùng bối cảnh cũ và icon có sẵn, không tạo artwork mới.

## Triển khai sau duyệt

1. Tạo bộ lập nhu cầu thuần, kiểm thử hệ số/làm tròn, chọn template theo điều kiện mở. Dùng duy nhất một bộ dữ liệu nhu cầu cho góp và snapshot.
2. Version đợt mới và fallback đợt cũ; sửa thời điểm khởi tạo server/demo; giữ xử lý CAS hiện có. Không sửa thưởng hoặc cấp phiếu ở client.
3. Tích hợp nhãn/chi tiết vào phiếu đã duyệt; kiểm lại ghim theo ID đợt, xác nhận số lượng và quota.
4. Kiểm thử solo/hai người/12 người; join/leave/nâng cấp giữa đợt; save cũ có góp dở và đã hoàn tất; hết hạn đúng giây; offline nhiều đợt; góp món cuối đồng thời/retry; người góp dưới 3 món; không trả thưởng hai lần. Kiểm runtime desktop/844×390/568×320.

Rollback trước deploy bằng revert thay đổi; nếu đã sinh đợt version mới phải giữ khả năng đọc `needs` cho đến hết các đợt đó. Không chạy bản cũ chỉ biết template lên save mới vì có thể thay định mức giữa đợt.

## Kiểm tra bản phác

Đã chạy bản HTML trong Chromium ở desktop 1100×850, ngang 844×390 và 568×320: không tràn ngang; chuyển quy mô cho đúng bộ 8/6/6, 12/9/9, 16/12/12; mô phỏng người mới vào không đổi nhu cầu; chọn đợt cũ trả lại mức 16/12/12. Đây chỉ là kiểm tra prototype, chưa phải kiểm thử engine, CAS hay thiết bị Safari thật.

Ảnh: [desktop](assets/small-village-draft-1100.png), [ngang](assets/small-village-draft-844.png), [ngang thấp](assets/small-village-draft-568.png). Bản này cần duyệt mức giảm nhu cầu trước khi tích hợp vì cùng thưởng XP/phiếu nhưng số hàng solo giảm một nửa.

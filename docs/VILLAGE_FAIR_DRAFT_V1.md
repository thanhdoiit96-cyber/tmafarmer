# Phiên chợ quê V1 — Bếp quê ngày chợ

**Cập nhật sau duyệt:** [Runtime V1 và kiểm chứng](VILLAGE_FAIR_V1.md). Đặc tả dưới đây là hồ sơ thiết kế; trạng thái hiện tại theo tài liệu runtime.

Bổ sung: [Bảng mỹ thuật V1](VILLAGE_FAIR_ART_DRAFT_V1.md) đã dựng để duyệt; chưa tích hợp runtime.

28/11/2026. **Đã duyệt hướng, chưa duyệt luật chi tiết/mỹ thuật; chưa sửa gameplay.** Thay hướng Sổ giống đã bị từ chối. P4 đo lường tạm gác, P5 ngoài phạm vi.

## Người chơi thực sự làm gì khác?

Một đợt góp hàng hiện tại đòi đúng ba mặt hàng; người chơi chọn số lượng rồi chờ đủ. Phiên chợ đề xuất giữ một đợt chung nhưng cho **chọn cách đáp ứng từng sạp**, và hàng góp làm cảnh chợ đổi dần. Không thêm một bảng nhiệm vụ chạy song song với Đơn làng.

Ví dụ làng chỉ có bạn: sạp Bánh quê cần 6 phần chuẩn bị. Bạn có thể góp 6 lúa mì, 3 bánh mì, hoặc phối hợp 2 lúa mì + 2 bánh mì. Nếu giữ bánh mì để hồi phục thể lực, góp lúa mì; nếu muốn sạp có bánh, dùng xưởng rồi mang bánh ra. Không có cách nào được nhân giá trị chỉ vì bấm chế tạo. Làng có bạn có thể chia nhau sạp, không phải chọn nghề hoặc nhận vai trò cố định.

**Giá trị gameplay dự kiến:** giảm bế tắc do đơn đòi đúng một món; tạo lựa chọn giữ đồ dùng hay góp; phối hợp theo nguồn hàng của từng người; kết quả hiện ngay trên cảnh chung. Đây là giả thuyết thiết kế, chưa có bằng chứng người chơi thích. Chưa thêm minigame bán hàng, khách đặt riêng, công thức mới hoặc buff sản xuất.

## Một phiên cụ thể

Tên: **Bếp quê ngày chợ**. Không yêu cầu game đang mưa; thời tiết hiện có tiếp tục ảnh hưởng cây/vật nuôi, không đặt thêm hệ số vì tên phiên. Bối cảnh đầu là chợ quê chung, chưa gán cả ba miền vào cùng một cảnh hoặc khẳng định món phổ thông là đặc sản riêng của vùng.

| Sạp | Hàng được nhận | Phần chuẩn bị mỗi món | Nhu cầu gốc |
| --- | --- | --- | --- |
| Bánh quê | Lúa mì / Bánh mì | 1 / 2 | 12 |
| Rau vườn | Cà rốt / Bắp | 1 / 1 | 12 |
| Quầy nước | Cà rốt / Nước ép cà rốt | 1 / 2 | 8 |

Làng 1 người dùng 50% → **6/6/4**; 2 người 75% → **9/9/6**; từ 3 người 100% → **12/12/8**, như hệ số hiện tại. Mỗi sạp luôn có lựa chọn cơ bản đang mở. Nếu phiên bản nội dung tương lai không có lựa chọn hợp lệ ở một sạp thì không mở mẫu phiên đó. Chốt nhu cầu, danh sách lựa chọn và mức quy đổi một lần khi mở đợt. Thành viên vào/ra hoặc mở xưởng sau đó không đổi nhu cầu. Người chưa mở công thức vẫn góp nông sản được.

Cà rốt có thể dùng ở hai sạp: **người chơi chỉ định sạp**, không tự chia hoặc cộng hai nơi. Chỉ góp số lượng nguyên dương, không vượt phần còn thiếu. Ví dụ sạp còn 1 phần thì không nhận một bánh quy đổi 2; UI gợi ý lúa mì, không tự làm tròn hoặc nuốt phần dư. Không giữ chỗ hàng cho một người.

Thời hạn giữ **48 giờ thực**. Chuẩn bị đủ thì hoàn thành, sạp giữ diện mạo đầy đến hết đợt; không mở vòng mới ngay để cày thưởng. NPC cho xem lại lời thoại, không có thưởng nhận thêm. Hết hạn chưa đủ thì lưu kết quả chưa hoàn thành; không dựng lễ thành công giả. Hàng không hoàn theo luật hiện tại, phải nói rõ trong xác nhận.

## Diễn biến nhìn thấy trong chợ

| Trạng thái | Cảnh sạp | Hành động/lời thoại |
| --- | --- | --- |
| Chưa góp | Giỏ/tray trống trong phạm vi mặt bàn | Chủ sạp nêu món còn thiếu; click sạp mở đúng sạp trong bảng góp |
| Có hàng, chưa đầy | Giỏ có đúng nhóm hàng đã góp; tối đa ba mức chất đầy | NPC cảm ơn ngắn, nhắc phần còn thiếu; không toast giữa map |
| Sạp đã đầy | Mâm đủ, dấu nhận diện nhỏ | Sạp đóng góp thêm bị khóa; dẫn tới sạp còn thiếu, không tự chuyển |
| Cả phiên hoàn tất | Ba sạp đầy, NPC ghé xem ở vị trí đi được | Một lời cảm ơn chủ động và Trang kỷ niệm hiện có; không popup bắt buộc |

Hình trên sạp phụ thuộc **tổng từng món đã góp**, không chỉ phần trăm: chỉ góp lúa mì thì không tự mọc bánh; góp hỗn hợp thì bày cả hai. Dùng ít props theo mức độ, không spawn vật thể cho mỗi món. NPC không che nhân vật, cửa sạp hoặc đường đi. Không thay kích thước background/camera để tạo hiệu ứng đông vui.

Chưa xuất art production trong bước này. Cần bảng đối chiếu cảnh chợ thật ở cùng tỷ lệ: trống / góp hỗn hợp / hoàn tất, kèm mobile và đường đi. Bảng đó phải theo skill game-pixel-art và được duyệt trước khi thêm layer/sprite; không thay background bằng hình concept.

## Luồng và UI cần giữ

Tái sử dụng Góp hàng làng trong Chợ và Làng → Đơn hàng. Trang chính là ba thẻ sạp, mỗi thẻ có ảnh, tên và phần còn thiếu; mở sạp mới thấy 2 lựa chọn có hình, số kho riêng và mức quy đổi rõ. Lựa chọn trong sạp dùng lưới/phân trang khi vượt sức chứa, không danh sách kéo dài. Phân trang đặt dưới như chuẩn UI. Không thêm HUD/nav/tab “Sự kiện” cạnh hệ cũ.

Xác nhận ví dụ: “Góp 2 Bánh mì vào Bánh quê → +4 phần chuẩn bị; trừ 2 bánh trong kho. Hàng không hoàn lại nếu hết hạn.” Hiện số món vật lý đã góp và còn thiếu để đủ mốc cá nhân; không gọi phần chuẩn bị là số món. Nút ghim dẫn đúng sạp/lựa chọn và ID đợt; “Cách có” dẫn bộ chọn/xưởng hiện có, giữ `world.approach()`. Polling không đổi sạp/trang đang đọc.

## Kinh tế: đề xuất giữ tổng thưởng, không mở nguồn kiếm mới

Giữ mốc **3 món vật lý**, thưởng cuối đợt `ceil(value × 1.25)`, **12 XP và 1 phiếu trang trí** khi đủ mốc và phiên hoàn tất. Một bánh là một món vật lý dù đóng góp 2 phần; UI phải phân biệt. Không thưởng riêng cho từng sạp, khách ghé hay xem lời thoại/kỷ niệm.

Giá trị tính thưởng đề xuất: lúa mì 6, bánh mì **12** (=2 lúa mì), cà rốt 10, nước ép **20** (=2 cà rốt), bắp 15. Đây là **giá trị góp hàng trong phiên**, không thêm `goods.sell`, không cho bán bánh/nước ép theo giá đó. Cố định trong nội dung phiên, không tính động theo công thức hoặc giá client. Bắp hiện có giá trị khác cà rốt như cơ chế góp cũ; không tuyên bố các lựa chọn có lợi nhuận hoàn toàn ngang nhau. Cần kiểm ngân sách tổng ở hai biên toàn hàng rẻ/đắt trước duyệt luật kinh tế.

Ngân sách đề xuất cho làng 1 người: tổng giá trị góp **136–166**, thưởng **170–208 xu** nếu một người góp đủ toàn phiên. Với nhu cầu gốc từ 3 người: giá trị **272–332**; thưởng tổng có thể chênh do làm tròn theo từng người đủ mốc và người góp dưới mốc không được trả. Hai kịch bản mô phỏng đều dùng giá trị 156, thưởng solo 195; đường chế biến không tăng giá trị, số món vật lý khác nhau (16 so với 12). Đây là kiểm số học của mẫu đề xuất, chưa phải cân bằng kinh tế đã nghiệm thu trên game thật.

Khi hiển thị thưởng dự kiến dùng giá trị từng món **đã trừ kho**, không dùng phần chuẩn bị. Không gọi `qty * goods[item].sell` cho món chưa có giá bán. Chưa duyệt phần này thì chưa đưa món chế biến vào action production.

## Tương thích và rủi ro đã thấy từ source

- `advanceVillageDrive` đang tạo version 2; `driveNeeds`, `donateVillageGoods`, snapshot và sổ đều giả định nhu cầu theo item. Không chỉ đổi title/template rồi nhét sạp vào `needs`.
- Đề xuất đợt phiên chợ có version 3 và metadata riêng (`themeId`, `contentVersion`, `stalls` với ID ổn định, `required`, lựa chọn/credit/value đã chốt, `deliveredByItem`). `contributors` giữ quantity/value/paid theo nghĩa cũ. Đây là đặc tả, chưa có migration.
- Đợt version 1/2 đang chạy giữ nguyên đến hết; chỉ sinh version 3 ở lần mở đợt mới. Có cờ server mặc định tắt. Khi tắt, không mở phiên mới; phiên đang chạy vẫn xử lý theo version đã lưu đến hết, không ép đổi hay mất hàng.
- Action cần `driveId + stallId + item + qty`; server kiểm toàn bộ, kho, thời hạn, nguyên/đủ phần và quyền vị trí. Hai người góp món cuối: chỉ một lần hoàn tất/trả thưởng; retry dùng cơ chế action hiện có. Không dùng index hiển thị làm ID, kể cả sạp index 0.
- Snapshot/sổ/kỷ niệm phải hiểu cả version cũ và mới, flatten hàng thật cho biên nhận thay vì giả phần chuẩn bị là sản phẩm. Giữ tối đa sáu đợt/12 tên; không tạo album vô hạn. Client cũ không biết version 3 cần chặn góp phiên mới bằng thông báo cập nhật, không gửi payload version 2.
- Visual là phép chiếu trạng thái đã commit, không nguồn tính thưởng. Reload/offline lấy cùng hình từ snapshot; không lưu cờ trả thưởng trong client.

## Mẫu thử và tiêu chí duyệt

[Mô phỏng luật và lựa chọn](assets/village-fair-draft-v1.html) chạy offline, không API/save/telemetry. Dùng ký hiệu và lời mô tả để thử vòng chơi, **không phải phác thảo mỹ thuật**. Có hai kịch bản: tân thủ không xưởng và có xưởng; thử góp nông sản/chế biến, chọn sạp cho cà rốt, không nhận dư, hoàn tất/hết hạn, reset. Đã có kho thử, không phải phần thưởng game.

Đã kiểm tra logic script mô phỏng bằng Node VM với DOM giả: hoàn thành cả hai đường, giá trị tương đương, số món vật lý, chặn dư/góp lặp sau hoàn thành/hết hạn. Chưa kiểm bố cục trong trình duyệt hoặc Safari/Android thật; không coi test này là kiểm engine, API hoặc xác thực server. Chưa chạy lại build vì không sửa runtime.

Trước production cần duyệt: ba sạp và lựa chọn thay thế; mức quy đổi/mốc cá nhân; giữ luật hết hạn không hoàn; cảnh thay đổi theo hàng thật. Sau đó theo thứ tự: (1) bảng mỹ thuật trên scene thật để duyệt; (2) model/version/action và test legacy/thưởng; (3) nối UI/ghim/lịch sử và renderer theo bản duyệt; (4) đối chiếu desktop, mobile ngang 844×390/568×320, mưa/đêm, NPC đủ chỗ, Safari/Android thật khi có thiết bị. Không triển khai cả ba miền hoặc thêm chủ đề tiếp theo trước hoàn thiện phiên đầu.

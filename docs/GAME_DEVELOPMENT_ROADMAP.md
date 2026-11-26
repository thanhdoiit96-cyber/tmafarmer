# Lộ trình phát triển theo trải nghiệm và doanh thu

Ngày lập: 21/11/2026. Cơ sở: [phân tích sản phẩm](GAME_PRODUCT_STRATEGY.md) và [gameplay hiện tại](GAMEPLAY_REFERENCE.md). Các sprint là thứ tự triển khai đề xuất, **không phải cam kết ngày phát hành**. Ước lượng 1–2 tuần/sprint cho một người phát triển chính có hỗ trợ mỹ thuật; cần điều chỉnh sau sprint đầu. Không chạy đồng thời nhiều hệ lớn.

## 1. Trạng thái và nguyên tắc

- `DOC-01` **Đã hoàn thành:** rà source, khảo sát đối chiếu, định hướng, gameplay, catalog và hướng dẫn. Chỉ tài liệu/công cụ xuất dữ liệu được bổ sung trong đợt này.
- Đã hoàn thiện lát cắt P0.1 và nhãn liên quan P0.4: [Mục tiêu tiếp theo V1](NEXT_GOAL_V1.md), [chỉ dẫn mở khóa P0.3](UNLOCK_GUIDANCE_V1.md) và [tóm tắt quay lại P1.1](RETURN_SUMMARY_V1.md). Phần còn lại vẫn thuộc backlog; chưa deploy production.
- Giữ ưu tiên hình ảnh, bố cục, dễ hiểu và cảm giác chơi. Chỉ đo sản phẩm vừa đủ và kiểm tra vận hành cần thiết; không quay lại làm chiến dịch tối ưu sức tải toàn diện.
- Mỗi sprint có một kết quả người chơi nhìn thấy được; hoàn thành các phần còn thiếu trước mở thêm nhánh.
- Không thay hệ lịch 8 giờ, ID ô đất, avatar hoặc cấu trúc tiến trình cũ khi chưa có kế hoạch migration. Không xóa nông trại/đơn/vật nuôi của người chơi để làm sạch dữ liệu.

## 2. Lát cắt đầu tiên cần hướng tới

**“Cùng chuẩn bị Hiên nhà mùa sen”**: một người mới hiểu cách trồng; ghim một món cho đơn làng hiện tại; góp một phần; khi hoàn thành thấy tên mình trong trang kỷ niệm và đặt được một món trang trí. Một người chơi solo vẫn có mục tiêu nông trại riêng và không bị chặn.

Tận dụng đơn 48 giờ, phiếu trang trí, đồ trang trí và scene sẵn có. Chỉ thêm một chủ đề mỹ thuật, một flow mục tiêu và một màn kết quả. Không cần thêm nghề cứng, hệ chất lượng mới hoặc scene hoàn toàn mới.

## 3. Các giai đoạn và tiêu chí qua mốc

| Sprint | Việc chính | Phụ thuộc | Qua mốc khi |
| --- | --- | --- | --- |
| 1 — P0 | Phiên đầu, ghim mục tiêu, thông tin lưu game; bộ đo tối thiểu | DOC-01 | Quan sát người mới hoàn thành vòng đầu; các event không trùng; không mất tiến trình |
| 2 — P1 | Tóm tắt quay lại, ETA/trạng thái chăm sóc dễ hiểu, kiểm tra nghỉ dài | P0 | Người thử biết việc cần làm và nguyên nhân thiếu sản lượng; không hỏng vụ cũ |
| 3 — P2 | Đơn góp hàng rõ hơn, hỗ trợ làng ít người, điểm ghi nhận | P0/P1 | Làng nhỏ hoàn thành kịch bản hợp lệ, không nhận thưởng hai lần |
| 4 — P3 | Hiên nhà mùa sen, xem thử decor, màn kỷ niệm đầu tiên | P2, concept được duyệt | Toàn bộ asset runtime đúng concept; không đè đường; miễn phí có bộ đẹp |
| 5 — P4 | Pilot 2–4 tuần thực, sửa điểm bỏ; quyết định có bán hay chưa | P0–P3 | Có cohort D7 đủ tuổi, dữ liệu và phỏng vấn; không chỉ dựa cảm giác đội làm |
| 6 — P5 | Hạ tầng mua cosmetic + một SKU thử nghiệm, chưa quảng bá rộng | P4 qua mốc, chọn nhà cung cấp | Thanh toán lặp/hoàn/khôi phục thiết bị khác đều qua kiểm tra |
| 7 — P6 | Mở bán giới hạn và đối soát; một cải tiến từ dữ liệu pilot | P5 | Quyền lợi đúng, hỗ trợ xử lý được; doanh thu tính cả chi phí nội dung |
| 8 — P7 | Chủ đề thứ hai hoặc vai trò mềm/album mở rộng | P6 hoặc pilot miễn phí tốt | Người quay lại và nhu cầu nội dung chứng minh hướng ưu tiên |

Nếu giữ chân chưa đạt hướng kỳ vọng ở P4: quay lại P0/P1/P2, không dùng giảm giá, pop-up hay tài nguyên trả phí để bù. Nếu giữ chân tốt nhưng ít người muốn mua decor: thử một mẫu/giá khác và kiểm tra chi phí mỹ thuật; không mặc định phải bán sản lượng.

## 4. Backlog cụ thể

### P0 — Người mới hiểu được game

**P0.1 — Ghim một mục tiêu đầu tiên.** Từ Việc cần làm/đơn hàng, chọn một mục tiêu; HUD chỉ hiện một thẻ nhỏ có hành động và nút đến đúng chỗ. Hoàn thành tự đánh dấu; không ép di chuyển liên tục giữa nhiều popup. Demo và online phải được phân biệt rõ; không hứa tự chuyển demo sang server nếu chưa xây cơ chế.

**P0.2 — Thu hoạch đầu tiên.** Quan sát trước thời gian thật với lúa mì 8 phút cơ sở. Nếu người mới rời trước thành quả, dựng phác thảo vụ hướng dẫn rút ngắn một lần; dùng cờ server theo vườn/tài khoản, không đổi `crops.wheat.time` toàn game. Không cho phần thưởng demo tạo xu online. Cho người chơi một việc ngắn trong lúc chờ, không bắt xem quảng cáo.

**P0.3 — Chỉ dẫn mở khóa.** Chạm vật phẩm bị khóa hiển thị đúng các điều kiện thiếu và nút đi tới; không nói chỉ cần cấp nông trại trong khi còn cấp xưởng/chuồng/vật liệu. Tận dụng `cropRequirement`, `animalRequirement`, `buildingUpgrade`, `aquaRequirement`, tránh viết luật thứ hai trong UI.

**P0.4 — Tên gọi thống nhất.** Làm rõ ngày game/ngày thực, thời gian cơ sở/ước tính, kho/túi và cấp XP/cấp công trình. Đối chiếu với catalog sinh tự động.

Ảnh hưởng: `app.mjs`, `tasks.mjs`, `game.mjs` nếu thêm cờ onboarding; tái sử dụng `world.approach()`. Lưu mục tiêu theo vườn, phiên bản mục tiêu và khả năng bỏ qua. Người chơi cũ không bị kéo lại tutorial.

Nghiệm thu: thao tác được bằng click/chạm/phím; thử 390px dọc, điện thoại ngang và desktop; reload giữa các bước vẫn đúng; không trừ hai lần vật tư do thao tác lặp.

### P1 — Quay lại dễ chịu

**P1.1 — Tóm tắt khi về.** Hiện tối đa ba ý: đã sẵn sàng gì, kho còn chỗ không, mục tiêu gần nhất. Không popup mỗi lần chuyển scene. Chỉ ra chênh lệch so với lần ghé trước mà không lưu thêm ảnh toàn bộ nông trại.

**P1.2 — ETA và giải thích sản lượng.** Dùng tốc độ hiện tại để ghi “ước tính”; hiển thị tác động trời/độ ẩm/cỏ-sâu. Ví dụ “thiệt hại đã tích lũy không hồi lại khi nhổ cỏ”; không dùng mốc cơ sở như thời gian chắc chắn. Khi dự báo đổi, nói rõ ETA có thể đổi.

**P1.3 — Kiểm tra nghỉ dài.** Bộ kịch bản 8 giờ, 24 giờ, 3 ngày, 7 ngày thực: cây chín, sâu/cỏ, thức ăn hết, vật nuôi già, đơn hết hạn. Chọn một chính sách bảo hộ sau khi người dùng duyệt; chưa âm thầm đổi quy tắc lão hóa. Phác thảo “nghỉ dưỡng” trước nếu muốn thay bán vật nuôi già.

**P1.4 — Hàng xóm đa tương tác.** Theo điều chỉnh của người dùng: giữ lấy trộm hiện tại, phát triển giúp nhau và nghịch vui song song trong cùng làng; không tách chế độ loại trừ. Phác thảo giúp tưới, sâu nghịch tạm thời có đồng ý/hạn mức và Ao làng có việc ven bờ/sổ cá. Không dùng sâu tự nhiên gây thiệt hại vĩnh viễn làm công cụ phá; không đổi quota trộm/ngày an ninh bằng việc tốt. [Bản mẫu và thứ tự triển khai](SOCIAL_PLAY_AND_LAKE_DRAFT_V1.md).

Nghiệm thu: so sánh cùng save cũ trước/sau; không âm XP/xu hoặc mất sản lượng ngoài thay đổi đã duyệt; người cũ có thể tiếp tục; logic server quyết định quyền thao tác.

### P2 — Củng cố hợp tác đã có

**P2.1 — Đơn làng đang cần.** Hiển thị phần còn thiếu, người góp và món cá nhân đã ghim; đường dẫn từ nguyên liệu → giống/con/công thức. Phân biệt đơn giao trước nhận trước với đơn góp từng phần.

**P2.2 — Làng 1–2 người vẫn tham gia được.** Thiết kế quy mô nhu cầu theo người hoạt động hoặc mức tiến trình; chốt nhu cầu một lần lúc mở đợt, không đổi theo mỗi lần thành viên vào/ra. Không hạ nhu cầu giữa đợt để farm thưởng. Làng chỉ có tân thủ không nhận món không ai mở.

**P2.3 — Hết hạn và góp ít.** Hiện tại hàng đã góp không hoàn lại; góp dưới ba món không đủ thưởng khi hoàn tất. Bắt buộc UI giải thích trước khi xác nhận. Đề xuất giảm cảm giác mất công bằng bằng mốc ghi nhận/đổi mẫu đợt sau; chỉ thay hoàn hàng hoặc trả thưởng một phần khi đã có thiết kế chống nhận hai lần và kho đầy. Không ghi rằng cơ chế này đã tồn tại.

**P2.4 — Lịch sử có giới hạn.** Lưu kết quả ngắn, người góp và phiên bản nội dung; tránh giữ vô hạn mọi thao tác trong JSON phòng. Giới hạn số trang và kích thước; khi cần album dài, thiết kế bảng riêng.

Ảnh hưởng: `advanceVillageDrive`, `donateVillageGoods`, `villageDriveSnapshot`, `app.mjs`; tránh đụng `villageFund` là góp xu xây công trình, không cùng hệ với góp hàng. Cần schema/version cho đợt mới; đợt đang mở giữ needs/quy tắc cũ đến hết.

Nghiệm thu: hai người góp món cuối đồng thời; retry request; đủ ba món/thiếu ba món; thành viên rời/bị mời ra; hết hạn đúng giây; tất cả cùng offline rồi trở lại; không sinh xu/phiếu hai lần; không giao món chưa mở.

### P3 — Lát cắt mỹ thuật và cảm xúc

**P3.1 — Bảng duyệt trước production.** Dựng cảnh Hiên nhà mùa sen có nhân vật/cây hiện tại ở cùng tỷ lệ, trong Vườn nhà và Hàng xóm. Người dùng duyệt bố cục trước xuất sprite. Tuân thủ `.agents/skills/game-pixel-art/SKILL.md`.

**P3.2 — Gói asset tối thiểu.** Đề xuất: một biến thể cổng giữ footprint; một họa tiết hàng rào giữ module; ba props hiên (chậu sen, đèn tre, bàn quà); một stamp kỷ niệm; preview và icon lấy từ chính asset runtime. Đây là số lượng dự kiến, có thể tận dụng/recolor asset được duyệt thay vẽ mới tất cả. Không đưa concept full-scene vào game như layer che các đối tượng động.

**P3.3 — Xem thử và hoàn tác.** Preview trên điểm đặt hiện có, hủy không trừ tiền/phiếu; xác nhận mới áp dụng. Không thay hitbox hoặc vật thể va chạm giữa skin miễn phí và trả phí; vẫn giữ nhân vật/lối đi rõ.

**P3.4 — Kỷ niệm đầu tiên.** Từ kết quả đơn hiện tại mở một trang, danh sách người góp, ảnh/biểu tượng đã duyệt. Lễ hoàn thành có thể bỏ qua; không phát lại mỗi lần refresh. Chụp ảnh là thao tác chủ động; không thu thập chat lên ảnh mặc định.

Nghiệm thu mỹ thuật: PNG alpha thật; baseline/frame không cắt; ảnh trước/sau Canvas 640×384 ở 1× và phóng nguyên; ngày/mưa/sương; làng đủ 12 người; tên dài; mobile. Nền paid không được dùng làm cách sửa lỗi che phủ của nền miễn phí.

### P4 — Pilot có câu hỏi rõ

Tuyển 20–40 người cho vòng quan sát nhỏ, sau đó tích lũy khoảng 200 người mới hợp lệ nếu kênh cho phép. Tách hai nhóm decor và nhóm bạn. Vòng quan sát dùng nhiệm vụ mở: “chơi thử, rồi nói bạn muốn làm gì tiếp”, không giải thích trước hết UI.

Theo dõi hai cohort tuần đủ tuổi D7; D30 đến sau, không tự suy ra D30 từ D7. So sánh làng có bạn/làng solo. Hỏi người rời: khó hiểu, mất đồ, chờ lâu, nhiều chăm sóc hay thiếu mục tiêu? Ghi cả lỗi thiết bị và vấn đề lưu.

Gate định hướng: kích hoạt khoảng 60%, D1 khoảng 30%, D7 khoảng 12% là mục tiêu thử nội bộ. Báo cáo số mẫu và độ bất định; không bật thanh toán chỉ vì một tuần nhỏ vượt ngưỡng. Cần cả lời giải thích định tính, chất lượng và khả năng sản xuất nội dung.

### P5 — Thanh toán và quyền sở hữu cosmetic

**P5.1 — Quyền sở hữu.** Tách `cosmetic entitlements` theo tài khoản khỏi `placement` theo vườn. Tạo SKU ổn định, version bộ đồ và manifest asset; không dùng `decorVouchers` kiếm trong game làm số dư tiền thật. Người đã có cùng đồ được xử lý theo chính sách trước mua, không âm thầm mất giá trị.

**P5.2 — Luồng giao dịch.** Chọn nhà cung cấp sau khi biết nền tảng phát hành; checkout server tạo, xác thực webhook server, lưu trạng thái, khóa idempotency, đối soát. Client chỉ hiển thị kết quả; không tự thêm entitlement từ URL callback. Chưa chọn nhà cung cấp/biểu phí ở tài liệu này.

**P5.3 — Khôi phục và hoàn.** Đăng nhập máy khác, nhiều làng, session hết hạn, trả tiền thành công nhưng cấp chậm, webhook đến sai thứ tự, hoàn tiền sau khi đã đặt đồ, đơn trùng. Có log hỗ trợ truy theo mã giao dịch, không cần xem mật khẩu hoặc dữ liệu chat.

Nghiệm thu: sandbox thanh toán đầy đủ; hoàn/gỡ skin không làm mất công trình/cấp; không ảnh hưởng bảng tài sản, lợi suất hoặc quota; bản miễn phí chơi trọn vòng lõi. Xác nhận các yêu cầu vận hành/phát hành trước mở bán thật.

### P6/P7 — Vận hành nhỏ rồi mới mở rộng

Mở một bộ cosmetic giới hạn đối tượng, không giới hạn giả tạo thời gian. Theo dõi nhu cầu xem thử, mua, khôi phục, hỗ trợ và chi phí vẽ; chưa có season pass. Chỉ lên vé chủ đề nếu có thể duy trì ít nhất một chu kỳ nội dung hoàn chỉnh và cơ chế nhận bù, giữ quà đã mua khi mùa kết thúc.

Vai trò mềm, sổ giống vùng miền hoặc album nhiều chương là lựa chọn tiếp theo; không triển khai cả ba. Ưu tiên theo lý do quay lại đã quan sát, không theo số ý tưởng mới.

## 5. Đo sản phẩm tối thiểu

Hiện có đo kỹ thuật trong [SCALE_TESTING.md](SCALE_TESTING.md), chưa thay cho các event bên dưới. Đây là đặc tả cần xây.

| Event đề xuất | Khi nào phát | Nguồn quyết định |
| --- | --- | --- |
| `first_play`, `session_start` | Vào gameplay thật, không phải mở landing/poll | Client, dedup theo session |
| `goal_pin`, `tutorial_step` | Ghim/qua bước | Client; bước nhận thưởng cần server xác nhận |
| `action_result` | Action thực sự thành công/thất bại | Server online; demo gắn mode riêng |
| `crop_harvest`, `product_collect`, `upgrade_done` | Sau commit trạng thái | Server; cùng action_id với kết quả |
| `drive_contribution`, `drive_complete`, `drive_expire` | Góp/hoàn thành/hết hạn một lần | Server theo drive_id, không phát lại từ snapshot |
| `decor_preview`, `decor_place` | Xem thử/đặt thành công | Client/server tương ứng |
| `shop_view`, `checkout_start`, `payment_settled`, `refund_settled` | Theo luồng mua sau P5 | Tiền và quyền lợi chỉ xác nhận server |
| `return_summary`, `help_open` | Người quay lại xem tóm tắt/hướng dẫn | Client |

Trường chung: event_id, thời gian server, phiên bản game, mode demo/online/QA, research_player_id giả danh, session_id, nguồn vào/campaign, stage tutorial, rank, nhóm quy mô làng, action_id nếu có. Không gửi mật khẩu, token, chat, tên thật hoặc raw payload farm. Không gửi tọa độ từng frame.

Mỗi action có idempotency key ổn định qua retry; đồng bộ event với kết quả commit hoặc outbox nhỏ theo thiết kế backend. Ghi chính sách lưu dữ liệu và quyền truy cập trước pilot; mốc đề xuất lưu event thô tối đa 90 ngày, tổng hợp dài hơn, cần xác nhận khi chọn công cụ. Tắt nội dung chat trong mọi dashboard sản phẩm.

## 6. Quy trình mỗi thay đổi

1. Chọn một ID trong backlog, ghi vấn đề, baseline và tiêu chí xong.
2. Đọc phần source/luật liên quan; liệt kê save cũ, scene, API và chỗ UI có thể xung đột.
3. Với hình ảnh/flow lớn: phác thảo trên nền runtime, duyệt rồi mới hoàn thiện.
4. Triển khai trọn lát cắt; có cờ tắt nội dung và kế hoạch rollback nếu chạm save.
5. Kiểm thử có ý nghĩa theo thay đổi; chạy kiểm tra tiến trình/tài nguyên, test và build khi sửa runtime. Chỉ đổi tài liệu thì kiểm link/dữ liệu sinh tự động, không chạy load test.
6. Ghi ảnh thật, dữ liệu/case đã kiểm, phần còn thiếu và cập nhật trạng thái. Commit theo ID; chỉ push/deploy khi được yêu cầu.

Không chọn hoàn thành sprint chỉ bằng “đã code xong”. Cần nghiệm thu đúng hình, đủ luồng, đúng save và có bằng chứng. Không tạo atlas/preview nháp hàng loạt rồi đưa tất cả vào `public`; chỉ giữ nguồn thiết kế trong `docs/assets` và runtime được chọn.

## 7. Công việc nên bắt đầu ở lần tiếp theo

**P0.1 + P0.4**: dựng phác thảo một thẻ “Mục tiêu tiếp theo”, liên kết Việc cần làm và điều kiện mở khóa hiện có; thử với save mới và save cũ. Song song xác định event tối thiểu, chưa cần dashboard phức tạp. Sau khi duyệt phác thảo, hoàn thiện trọn flow trước khi chuyển sang P1 hoặc nội dung mới.

### Lựa chọn hướng triển khai — 25/11/2026

Sau khi đọc lại chiến lược và đối chiếu source, chọn **P0.1 + P0.4 làm đợt tiếp theo**, rồi P0.3 và P1.1. Đây là quyết định ưu tiên, chưa đánh dấu đã triển khai.

Lý do: source đã có bảng Việc cần làm, Sổ việc hôm nay, trang Tiến độ và nút đi tới các khu vực; chưa thấy luồng ghim một mục tiêu cá nhân xuyên các bảng. Vì vậy cần nối những phần đang có thành một mục tiêu dễ theo, thay vì tạo thêm một bảng nhiệm vụ hoặc hệ thưởng khác. Đây là cải thiện trải nghiệm trực tiếp và là nền cho việc ghim món góp hàng ở P2.

Phạm vi đợt đầu:

1. Dựng phác thảo thẻ mục tiêu gọn trong vùng bảng tác vụ, không đặt một panel lớn che Canvas. Có bản desktop, điện thoại dọc và ngang để duyệt trước khi sửa UI.
2. Người mới có gợi ý vòng gieo → tưới → thu → bán; người chơi cũ tự chọn/ghim mục tiêu phù hợp, có thể bỏ ghim. Đang chờ cây thì hiện trạng thái chờ và việc tùy chọn, không ép chuyển cảnh hoặc tự đổi mục tiêu.
3. Tái sử dụng điều hướng và `world.approach()`; nút thẻ dẫn đến đúng bảng/đối tượng, không bỏ qua điều kiện vị trí hoặc tự thực hiện thao tác tiêu tài nguyên.
4. Thống nhất nhãn ngày thực/ngày game, thời gian cơ sở/ước tính, cấp nông trại/cấp công trình và kho/túi. Mục tiêu hoàn thành dựa trên trạng thái/action thành công, không phải chỉ click nút.

Nghiệm thu trọng tâm: không lặp thông tin với Sổ việc; không che lối chơi; mục tiêu tách theo vườn/demo/online và giữ đúng sau reload; người chơi cũ không bị bắt làm tutorial; không phát thưởng mới, không đổi kinh tế hoặc làm mất tiến trình. Phác thảo cần thể hiện cả lúc thiếu giống, kho đầy và đang chờ vụ chín.

Chưa đưa vào đợt này: rút ngắn vụ đầu, hệ analytics/dashboard đầy đủ, thay trộm/lão hóa, thêm cấp/giống, album, bộ trang trí mới và thanh toán. Chỉ ghi nhận bộ sự kiện tối thiểu cần dùng để đánh giá flow. Sau khi hoàn thiện luồng này mới chuyển sang chỉ dẫn mở khóa P0.3 và tóm tắt quay lại P1.1; P2–P3 vẫn là đích nội dung tiếp theo.

## 8. Nhật ký cập nhật

| Ngày | ID | Trạng thái | Bằng chứng |
| --- | --- | --- | --- |
| 21/11/2026 | DOC-01 | Hoàn thành tài liệu | Strategy, roadmap, gameplay, catalog sinh từ source và quickstart |
| 25/11/2026 | P0.1 + P0.4 | Đã chọn ưu tiên; chưa triển khai | Quyết định và phạm vi ở mục 7; bước đầu là dựng phác thảo |
| 25/11/2026 | P0-DRAFT-01 | Phác thảo đã duyệt | [Prototype, desktop/mobile và các trạng thái](NEXT_GOAL_DRAFT_V1.md) |
| 25/11/2026 | P0-GOAL-V1 | Hoàn thiện runtime, chưa deploy | [Phạm vi, ảnh và kiểm chứng](NEXT_GOAL_V1.md) |
| 25/11/2026 | P0.3 | Hoàn thiện chỉ dẫn mở khóa V1 trong source, chưa deploy | [Phạm vi, ảnh và kiểm chứng](UNLOCK_GUIDANCE_V1.md) |
| 25/11/2026 | P1.1 | Hoàn thiện tóm tắt quay lại V1 trong source, chưa deploy | [Phạm vi, ảnh và kiểm chứng](RETURN_SUMMARY_V1.md) |
| 25/11/2026 | UX-SEED-01 | Sắp lại bộ chọn giống theo yêu cầu: nhóm khóa/mở, phân trang, hover và chạm | [Ảnh và kiểm chứng](SEED_PICKER_V1.md); chưa thay ETA toàn game |
| 25/11/2026 | UX-GAME-02 | Thay danh sách bằng ô ảnh giống/vật nuôi; ghim gọn chỉ trong Việc cần làm; sửa va chạm công trình | [Bố cục, kiểm chứng và giới hạn Safari](GAME_UI_V2.md) |
| 25/11/2026 | P1.2 — cây trồng | Hoàn thiện ETA theo tốc độ hiện tại và giải thích sản lượng; chưa deploy | [Phạm vi và kiểm chứng](CROP_OUTLOOK_V1.md) |
| 25/11/2026 | UX-HUSBANDRY-01 | Hoàn thiện UI Đất/Chuồng, Ao và mẫu hàng rào; chưa deploy | [Bố cục, ảnh và kiểm chứng](HUSBANDRY_UI_V1.md) |
| 25/11/2026 | P1.3 — kiểm tra | Hoàn thành ma trận nghỉ dài và sửa tính bù thời tiết; chính sách bảo hộ chưa đổi | [Kết quả, giới hạn và đề xuất](LONG_ABSENCE_AUDIT_V1.md) |
| 25/11/2026 | P1.3 — phác thảo nghỉ dưỡng | Đã bỏ qua theo yêu cầu, giữ bản mẫu lịch sử | [Bản mẫu, quy tắc và kiểm chứng](LIVESTOCK_REST_DRAFT_V1.md) |
| 25/11/2026 | P1.3 — tuổi theo chu kỳ | Triển khai thay nghỉ dưỡng theo yêu cầu; chưa deploy | [Quy tắc, migration và kiểm chứng](LIVESTOCK_CYCLE_AGE_V1.md) |
| 25/11/2026 | P1.4 — phác thảo | Đã thay thế: không tách chế độ làng, giữ bản lịch sử | [Bản tương tác, đánh đổi và kiểm chứng](FRIENDLY_VILLAGE_DRAFT_V1.md) |
| 26/11/2026 | P1.4 + Ao — hướng song song | Giữ trộm, phác thảo giúp/nghịch có giới hạn và việc ven ao/sổ cá; chưa đổi gameplay | [Bản mới theo yêu cầu](SOCIAL_PLAY_AND_LAKE_DRAFT_V1.md) |
| 26/11/2026 | P1.4 + Ao — runtime V1 | Đã triển khai, chưa deploy | Giúp tưới quota riêng, việc ven ao 10 giây, đổi thức ăn và sổ cá có quà một lần. [Phạm vi và kiểm chứng](SOCIAL_LAKE_V1.md) |
| 26/11/2026 | P1.4 — sâu nghịch V1 | Đã triển khai, chưa deploy | Nhận nghịch mặc định tắt, giảm tốc tạm thời tách sâu tự nhiên, quota/miễn nhận, bắt miễn phí và đổi lọ tại hồ. [Quy tắc và kiểm chứng](PRANK_PLAY_V1.md) |
| 26/11/2026 | Ao — mỹ thuật/cảm xúc | Đã dựng phác thảo, chờ duyệt | Một ông lão trên lối ven bờ, lời chào thời tiết, dẫn tới hoạt động hiện có; [bố cục và prototype](LAKE_LIFE_DRAFT_V1.md). Chưa đổi runtime |
| 26/11/2026 | Ao — góc nhìn và NPC V2 | Camera đã sửa; mẫu NPC riêng chờ duyệt | [Toàn cảnh ao](LAKE_OVERVIEW_V1.md), giữ scale/hitbox đồng bộ; [mẫu Ông Sáu mới](LAKE_LIFE_DRAFT_V1.md) có nguồn alpha/preview thu nhỏ, chưa thay NPC runtime |
| 26/11/2026 | Social/Ao — pilot | Đã chuẩn bị cách thử, chưa có dữ liệu người chơi | [Tình huống, dữ liệu tối thiểu và cách quyết định](SOCIAL_LAKE_PILOT_V1.md); chưa gửi lời mời/deploy |
| 26/11/2026 | Ao — Ông Sáu runtime V1 | Hoàn thiện source, chưa deploy | Sprite idle alpha riêng, approach rồi hội thoại thời tiết, mở Ven ao/Sổ cá; [phạm vi và kiểm chứng](LAKE_ELDER_V1.md) |
| Chưa bắt đầu | Phần còn lại P0–P7 | Đề xuất | Tiếp theo: pilot người chơi theo kế hoạch; P2.1 và ETA vật nuôi-thủy sản còn backlog; chưa mở thanh toán |

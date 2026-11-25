# Định hướng sản phẩm, giữ chân và doanh thu

Ngày nghiên cứu: **21/11/2026**. Đối chiếu source tại commit `d493aea`. Đây là đề xuất sản phẩm, chưa phải các tính năng đã triển khai. Không có dữ liệu retention, doanh thu hay phỏng vấn người chơi production trong lần rà soát này; các mục tiêu và giá dưới đây là giả thuyết cần thử nghiệm.

Tài liệu đi cùng: [lộ trình thực hiện](GAME_DEVELOPMENT_ROADMAP.md), [gameplay hiện tại](GAMEPLAY_REFERENCE.md), [dữ liệu gameplay](GAMEPLAY_CATALOG.md), [hướng dẫn người mới](PLAYER_QUICKSTART.md).

## 1. Quyết định đề xuất

Phát triển Vườn Mùa Vui thành **game nông trại làng Việt nhỏ, nơi mỗi người có vườn riêng và cùng để lại dấu ấn trong làng**. Chơi được trên trình duyệt, phiên ngắn, không đòi hỏi cả nhóm online cùng lúc. Giá trị bán được là vẻ đẹp, bản sắc và kỷ niệm; không bán ưu thế sản lượng hoặc quyền thắng trong cộng đồng.

Ưu tiên ba việc: người mới sớm thấy thành quả; người quay lại luôn có một việc đáng làm; đóng góp của hàng xóm biến thành thay đổi nhìn thấy được trên bản đồ. Chưa nên thêm hàng loạt cấp, nhiều loại tiền, bản đồ lớn, hôn nhân, chiến đấu hoặc hệ lai giống phức tạp.

Nhóm người chơi đầu tiên cần kiểm chứng: người Việt thích nông trại/đời sống nhẹ nhàng, nhóm bạn nhỏ và gia đình; ưu tiên người trưởng thành trong nghiên cứu và thử nghiệm thanh toán ban đầu. Đây là phân khúc giả định, không phải kết luận từ khảo sát.

## 2. Những gì đã có và điểm nghẽn

| Nền tảng hiện có | Giá trị | Việc còn thiếu hoặc cần kiểm chứng |
| --- | --- | --- |
| Làng tối đa 12 vườn; vườn riêng, khu chung, chat gần | Quy mô đủ nhỏ để nhớ hàng xóm | Chưa chứng minh người mới tìm được làng phù hợp; làng vắng có thể thiếu động lực |
| Pixel làng Việt, nhà gỗ, sen, nếp cẩm, trâu; sáu avatar theo giới tính/tuổi | Dễ tạo hình ảnh và cảm xúc riêng | Chất lượng hình/độ đọc icon từng bị lệch; cần duyệt cảnh và asset ở kích thước thật |
| 16 cây, 10 vật nuôi, 6 loài nuôi ao; thời tiết và sâu/cỏ | Có lựa chọn canh tác và chuỗi sản xuất | Người mới có thể bị nhiều chỉ số/điều kiện làm rối; thời gian cơ sở không phải ETA |
| Cấp nông trại 1–13, công trình và vật liệu | Mục tiêu dài hạn | Tăng số XP/cấp không tự tạo trải nghiệm mới; cần mục tiêu có ý nghĩa ở giữa các mốc |
| Đơn góp hàng 48 giờ, thưởng xu/XP/phiếu trang trí; bốn dự án làng | Đã có móc nối hợp tác và trang trí | Không phải xây một hệ đóng góp mới; cần làm thành quả rõ, bảo vệ làng ít người và trường hợp hết hạn |
| Trang trí có vị trí gợi ý, hàng rào, nhà hàng xóm theo tài sản | Tự thể hiện và khoe thành quả | Cần xem thử, bộ chủ đề thống nhất và cách chia sẻ đẹp |
| Cô Lan tưới/thu hoạch bằng xu | Giảm thao tác lặp | Nên giữ đường tiện ích này cho người chơi miễn phí |
| Lấy đồ hàng xóm, giới hạn mất đồ, đóng cổng | Tương tác có kịch tính | Xung đột với định vị thư giãn và với người không muốn bị lấy đồ |
| Nước/no/thể lực, sâu/cỏ, đất chai, vật nuôi già theo thời gian thực | Tạo nhịp chăm sóc | Nhiều dạng hao hụt chồng nhau có thể biến việc quay lại thành nghĩa vụ |

Nguồn nội bộ: `public/game.mjs`, `land.mjs`, `village.mjs`, `garden-helper.mjs`, `aqua.mjs`, `wellness.mjs`, `avatar-models.mjs`; xem quy tắc chi tiết trong tài liệu gameplay. Các rủi ro trên là phân tích thiết kế, chưa phải kết quả quan sát người chơi.

## 3. Đối chiếu thị trường và giới hạn kết luận

Không thể chứng minh “toàn thị trường chưa có” bằng việc kiểm tra vài game. Đánh giá dưới đây xác định những gì **đã phổ biến**, rồi chọn một cách kết hợp phù hợp năng lực dự án. Không dùng cụm “độc quyền đầu tiên” trong marketing nếu chưa có nghiên cứu rộng hơn.

| Đối chiếu chính thức | Điều có thể xác nhận | Ý nghĩa cho dự án |
| --- | --- | --- |
| Hay Day | Có quyên góp hàng xóm, danh hiệu hào phóng; Derby cho nhóm làm nhiệm vụ; Farm Pass có đường thưởng và đặc quyền. [Quyên góp](https://support.supercell.com/hay-day/en/articles/neighborhood-requests.html), [Derby](https://support.supercell.com/hay-day/en/articles/about-the-derby.html), [Farm Pass](https://support.supercell.com/hay-day/en/articles/about-farm-pass-3.html) | Góp hàng, thi đua làng hoặc vé mùa không phải ý tưởng mới. Không nên cạnh tranh bằng số lượng sự kiện |
| FarmVille 3 | Có vật nuôi, chế tạo, trợ lý; trạm thời tiết kích hoạt boost và mở thêm slot. [Hướng dẫn chính thức](https://zyngasupport.helpshift.com/hc/en/91-farmville-3/section/1074-getting-started/), [Weather Boosts](https://zyngasupport.helpshift.com/hc/en/91-farmville-3/faq/16448-how-do-i-use-weather-boosts/) | Có thời tiết chưa đủ khác biệt; cần biến dự báo thành lựa chọn dễ hiểu và phối hợp trong làng |
| Stardew Valley | Có đời sống cộng đồng/NPC và multiplayer; bản 1.5 thêm chia màn hình. [Giới thiệu](https://www.stardewvalley.net/), [Changelog 1.5](https://www.stardewvalley.net/stardew-valley-1-5-update-full-changelog/) | Cảm xúc và câu chuyện không tự mới; dự án nên chọn lát cắt nhỏ thay vì mô phỏng toàn bộ RPG |
| Play Together tại Việt Nam | Có giao lưu, nhà/trang trí, câu cá; cập nhật 2.28 nhắc thời tiết, nông trại và đơn hàng. [Tính năng VNG](https://playtogether.vnggames.com/tin-tuc/tinh-nang/tinh-nang-play-together.html), [Cập nhật 2.28](https://playtogether.vnggames.com/tin-tuc/tin-tuc/chi-tiet-ban-cap-nhat-2-28.html) | “Chơi với bạn + câu cá + decor” cũng không phải khoảng trống riêng tại Việt Nam |
| Palia | Từng công bố hướng cosmetic; năm 2025 thông báo thử thêm tiện ích Courier và đường kiếm miễn phí. [Mô hình ban đầu](https://palia.com/news/palia-business-model), [Điều chỉnh 2025](https://palia.com/news/broadening-store-with-care) | Cosmetic là mô hình tham khảo, không phải bảo đảm doanh thu; không mô tả sai rằng Palia hiện chỉ bán ngoại hình |

Phạm vi nghiên cứu là tài liệu công khai, không có số liệu thị phần hoặc trải nghiệm mọi phiên bản. Việc không thấy một tính năng trong trang hỗ trợ không chứng minh game đó không có.

## 4. Ba trụ cột hấp dẫn cần xây

### 4.1. Một làng Việt có lịch sử của chính nhóm bạn

**Đề xuất “Ký ức làng”:** hoàn thành đợt góp hàng hiện có tạo một trang kỷ niệm và một chi tiết đẹp ở khu chung: dây đèn tre, bàn quà phiên chợ, góc sen. Lưu tên những người góp, không chỉ người góp nhiều nhất. Người ít thời gian cũng thấy phần của mình trong kết quả.

MVP: một template đóng góp đã có → một lễ hoàn thành ngắn, không khóa điều khiển → trang lưu tên/đồ đã góp → một vật trang trí theo mốc. Không thêm minigame mới. Người offline vẫn nhận kết quả và xem lại. Kỷ niệm cá nhân không tự đăng ra ngoài; có nút tải ảnh sau khi người chơi chủ động chọn chia sẻ.

Điểm khác biệt giả định là **sự gắn bó với một làng nhỏ, Việt hóa và có dấu vết bền vững**, không phải album hoặc nhiệm vụ cộng đồng riêng lẻ chưa từng tồn tại.

### 4.2. Làm nông theo dự báo và vai trò tự chọn

Nền đã có tám nhóm cây theo thời tiết. Trước hết phải giải thích dễ hiểu: “trời sắp mưa, sen hợp hơn; kho còn bao nhiêu chỗ; sản phẩm này giúp đơn nào”. Sau đó thử vai trò mềm như nhà vườn, người nuôi, người làm đặc sản: người chơi ghim mục tiêu, không khóa nghề hoặc bắt trả phí đổi nghề.

MVP: từ đơn góp hàng, chọn một món muốn góp; game chỉ ra giống/vật nuôi/công thức và điều kiện đang thiếu. Một bảng “làng đang cần” tổng hợp phần còn thiếu. Không tạo buff nghề hoặc chất lượng nông sản mới ở giai đoạn đầu. Nhóm vẫn hoàn thành được khi thiếu một vai trò.

Giá trị mong muốn: có lý do trao đổi hàng và phân công tự nhiên, thay vì mọi người lặp cùng một cây có lợi nhuận cao nhất. Cần kiểm chứng xem người chơi có thực sự chọn đa dạng hơn, không chỉ tối ưu xu/giờ.

### 4.3. Vườn đẹp là phần thưởng và là cách thể hiện mình

Hoàn thiện trang trí theo các điểm đặt hợp lý đang có; thêm xem thử, bộ chủ đề và nút chụp cảnh ẩn HUD. Bộ đầu tiên nên là **Hiên nhà mùa sen**, dùng nhà, cổng, hàng rào, vài props đồng bộ; không cần một background mới cho mỗi gói.

Giữ thân nhà/hitbox/đường đi và cấp tài sản riêng với lớp skin. Bán màu mái, họa tiết cổng hoặc props cùng kích thước; không bán “nhà giàu cấp cao” để vượt ngưỡng tài sản hiện tại. Sáu nhân vật cơ bản vẫn miễn phí. Trang phục là hạng mục sau vì mỗi mẫu cần đủ hướng và hoạt ảnh chăm sóc, rất tốn công hơn vài props.

Người miễn phí có ít nhất một bộ đẹp hoàn chỉnh và phiếu trang trí từ gameplay. Người trả tiền có lựa chọn thẩm mỹ bổ sung, không được hưởng sản lượng hoặc vị trí xếp hạng.

## 5. Giữ chân bằng thành quả, giảm áp lực

| Thời điểm | Câu hỏi cần giải đáp | Thay đổi đề xuất | Dấu hiệu có ích |
| --- | --- | --- | --- |
| 0–3 phút | Tôi đang làm gì? | Một mục tiêu đang ghim, gieo/tưới rõ, nút xem việc tiếp theo | Người mới tự thao tác được, không cần người hướng dẫn cầm tay |
| Phiên đầu | Tôi đã đạt gì? | Một thu hoạch thật, thấy xu/XP và mục tiêu gần; nếu cần cây hướng dẫn riêng chỉ rút ngắn một lần | Tăng hoàn thành phiên đầu, không phát sinh farm phần thưởng từ reset demo |
| 24 giờ đầu | Vì sao quay lại? | Tóm tắt vườn khi về, việc sẵn sàng và mục tiêu nhỏ tự chọn | Tăng quay lại có thao tác hữu ích, không chỉ mở để nhận quà |
| Ngày 2–7 thực | Tôi có vai trò gì? | Góp một phần đơn có sẵn; ghim phần làng đang thiếu; một decor kiếm được | Tăng số người đóng góp khác nhau và hoàn thành làng ít người |
| Tuần 2–4 | Vườn/làng có khác trước không? | Ký ức, bộ sưu tập, một chủ đề sự kiện nhỏ | Tăng quay lại theo tuần, giảm cảm giác chỉ nâng số |
| Sau nghỉ dài | Tôi có bị tụt quá xa? | Tóm tắt, mục tiêu trở lại; xem lại lão hóa vật nuôi và thiệt hại sâu/cỏ | Người trở lại hoàn thành việc, ít bỏ ngay sau màn chào |

Không áp dụng cùng lúc hàng loạt quà đăng nhập, streak bắt buộc và countdown. Ngày game dài 8 giờ, tức ba lượt reset trong 24 giờ thực; không thiết kế thử thách buộc người chơi thức đêm để theo đủ. Vé mùa tương lai nên theo tuần thực, có nhiệm vụ tích lũy/bù tiến độ, không bắt mua trước mới có cơ hội hoàn thành.

Những thử nghiệm cần ưu tiên:

1. **Trộm và an ninh:** chưa tự thay luật. Thử phác thảo làng “thân thiện” tự nguyện so với luật hiện tại; phải tách quota, điều kiện lên cấp làng và bảo vệ người mới. Không bán bảo vệ bằng tiền thật. Đừng gắn cảm giác bị mất đồ với cơ hội bán vật phẩm.
2. **Sâu/cỏ và nghỉ chơi:** hiển thị trước hậu quả và lượng đã mất; cân nhắc bảo hộ người mới/nghỉ dài thay vì xóa toàn bộ hệ chăm sóc. Mọi thay đổi chỉ áp dụng vụ mới hoặc có migration rõ.
3. **Vật nuôi già:** hiện giảm sản lượng sau 3/7 ngày thực. Đây có thể là nguồn khó chịu lớn với người gắn bó thú nuôi; thử “nghỉ dưỡng” không bắt giết/bán, chưa triển khai thêm phí chống già.
4. **Làng vắng:** trước khi ghép làng công khai, cần đơn có quy mô phù hợp người hoạt động và mục tiêu cá nhân thay thế. Không dùng bot đóng giả người chơi thật hoặc ép mời bạn.
5. **Đơn tranh giao trước:** giữ nhóm đơn cạnh tranh rõ ràng, làm đơn góp hàng trở thành lựa chọn hợp tác; không tăng áp lực tranh cướp để kéo dài thời gian online.

## 6. Thu hút người chơi

Thông điệp thử nghiệm: “Một góc vườn Việt, một làng cùng vun trồng”. Trang giới thiệu dùng screenshot/clip runtime thật, không dùng concept đẹp hơn sản phẩm rồi gây hiểu lầm.

- Một link chơi thử, không ép đăng ký trước khi thấy gameplay. Mời bạn vào làng sau khi đã có thành quả đầu tiên; gắn tài khoản rõ để bảo vệ tiến trình online.
- Tạo nội dung từ thành quả: ảnh hiên nhà, trước/sau một dự án làng, nhóm bạn chụp ở chợ. Chỉ xuất ảnh khi người chơi chủ động.
- Thử hai nhóm nhỏ: người thích decor và nhóm bạn muốn cùng làm nông. Phỏng vấn 5–8 người/nhóm, không gộp mọi phản hồi thành một “người chơi trung bình”.
- Nếu thưởng mời bạn, chỉ trao sau khi người được mời thực sự hoàn thành một hành động có giá trị, giới hạn theo tài khoản; không thưởng tiền giao dịch được theo mỗi click.
- Chưa chi mạnh quảng cáo khi retention và trải nghiệm quay lại chưa ổn. Đo nguồn vào → kích hoạt → D7 → chi phí giữ một người quay lại, không chỉ lượt click.

## 7. Hướng doanh thu phù hợp

### Bán gì và theo thứ tự nào

| Sản phẩm thử nghiệm | Giá giả định để nghiên cứu | Điều kiện |
| --- | --- | --- |
| Gói ủng hộ một lần | 39.000–59.000đ | Huy hiệu + vài decor, mô tả rõ không tăng sản lượng; chỉ bán khi mua/khôi phục quyền lợi hoạt động |
| Bộ trang trí theo chủ đề | 59.000–99.000đ | Xem trước trong vườn, cố định vật phẩm, không ngẫu nhiên; ưu tiên thử đầu tiên |
| Bộ lớn/skin nhà | 99.000–149.000đ | Chỉ sau khi thấy nhu cầu; không thay hitbox, tài sản hay điều kiện mở khóa |
| Vé chủ đề thẩm mỹ | 59.000–99.000đ/chu kỳ 4 tuần thực | Là bước sau, cần đủ nội dung và lịch vận hành; đường miễn phí, nhận bù, không buff kinh tế |
| Hợp tác thương hiệu phù hợp | Chưa định giá | Sau khi có cộng đồng; một chủ đề làng/đặc sản rõ tài trợ, không pop-up lấn map |

Các mức giá là giả định nội bộ, chưa có bằng chứng sẵn lòng trả. Đầu tiên cho xem mẫu và hỏi lựa chọn/giá; chỉ giao dịch tiền thật khi hoàn tất quy trình thanh toán. Không coi lựa chọn trong khảo sát là doanh số thực.

Chưa chọn quảng cáo làm nguồn chính: banner và quảng cáo xen kẽ phá trải nghiệm hình ảnh; quảng cáo thưởng nguồn lực có thể làm lệch kinh tế. Nếu xem xét sau, ưu tiên tùy chọn thật sự, không cắt phần thưởng cơ bản để buộc xem.

Không bán: XP/xu để lên bảng tài sản, giống/vật nuôi vượt cấp, sản lượng, miễn sâu/cỏ, lượt lấy đồ, tăng quota cạnh tranh, bỏ giới hạn hàng xóm. Tiện ích Cô Lan hiện mua bằng xu phải tiếp tục tiếp cận được qua gameplay. Không có giao dịch tiền thật, rút tiền, NFT hoặc chợ cosmetic giữa người chơi trong lộ trình đầu.

### Bài toán doanh thu minh họa

Không dùng “1.000–5.000 người đồng thời” làm số người trả tiền. **MAU** là số người chơi duy nhất trong tháng; **CCU** là số cùng online tại một thời điểm. Hai chỉ số không đổi trực tiếp cho nhau nếu thiếu độ dài phiên và tần suất quay lại.

`Doanh thu gộp tháng = MAU × tỷ lệ người mua trong tháng × chi tiêu trung bình/người mua/tháng`.

| Kịch bản giả định, không phải dự báo | MAU | Người mua | Chi tiêu TB | Gộp/tháng |
| --- | ---: | ---: | ---: | ---: |
| Nhỏ | 1.000 | 2% = 20 | 59.000đ | 1.180.000đ |
| Đang hình thành | 5.000 | 3% = 150 | 79.000đ | 11.850.000đ |
| Có cộng đồng ổn định | 20.000 | 4% = 800 | 99.000đ | 79.200.000đ |

Đây chưa phải lợi nhuận. Phải trừ thanh toán, hoàn tiền, các nghĩa vụ áp dụng, hạ tầng, hỗ trợ, sản xuất tranh/animation và thu hút người chơi. Phí thực phụ thuộc nền tảng và nhà cung cấp sẽ chọn, chưa được xác nhận ở tài liệu này.

Ví dụ quản trị thuần giả định: với gói 79.000đ, dự phòng 15% cho các khoản khấu trừ và chi phí vận hành/nội dung 8 triệu/tháng, cần ít nhất `ceil(8.000.000 / (79.000 × 0,85)) = 120` người mua/tháng. Nếu tỷ lệ mua 3%, cần khoảng 4.000 MAU. 15% không phải biểu phí hay thuế suất; 8 triệu cũng chưa phải ngân sách đã duyệt. Gói một lần sẽ cạn khách cũ; không lấy tháng đầu làm doanh thu lặp lại, cần xem cohort người mua mới/quay lại.

Với cộng đồng nhỏ, doanh thu thẩm mỹ có thể chỉ bù một phần công sản xuất. Vì thế thử một bộ decor trước, không xây cửa hàng/season pass quy mô lớn trước khi biết người chơi muốn mua gì.

### Những phần bắt buộc trước khi thu tiền

- Quyền sở hữu trả phí gắn với tài khoản; phân biệt quyền sở hữu toàn tài khoản với bố trí trang trí theo vườn. Không lưu quyền mua chỉ trong JSON demo/localStorage.
- Sổ giao dịch và quyền lợi phía server: SKU, phiên bản, tiền tệ/số tiền, trạng thái pending/paid/refunded; xác minh từ nhà cung cấp, xử lý webhook lặp đúng một lần, không tin redirect phía client.
- Khôi phục quyền lợi khi đăng nhập thiết bị khác; cấp bù nếu lỗi; quy tắc hoàn/thu hồi chỉ tác động cosmetic, không phá nông trại hoặc thu hồi nhầm đồ kiếm được.
- Có bản xem trước, giải thích phạm vi dùng trong nhiều làng, hỗ trợ người mua và lịch đối soát. Không bán một vật phẩm chưa có hình runtime hoàn chỉnh.
- Trước mở thanh toán cần xác nhận yêu cầu phát hành, quyền riêng tư, độ tuổi và hóa đơn theo thị trường/nền tảng với bên phụ trách phù hợp. Tài liệu này không kết luận pháp lý hoặc thuế.

## 8. Đo lường để quyết định tiếp

Chọn thước đo chính: **số người chơi mỗi tuần vừa có thành quả nông trại vừa có một tương tác có ích với làng**. Báo cáo kèm người chơi solo; không ép ai cũng phải hợp tác mới được xem là thành công.

“Thành quả” là thu hoạch/thu sản phẩm/giao đơn/nâng cấp/trang trí; “có ích với làng” là góp hàng hoặc mua hàng từ người khác. Chat/mở bảng không đủ để xác nhận thành quả. Loại demo, tài khoản QA và sự kiện trùng; hiện chưa có bộ đo sản phẩm này, không nhầm với `Server-Timing`/load test đã có.

| Chỉ số | Định nghĩa | Mốc thử nội bộ, không phải chuẩn ngành |
| --- | --- | --- |
| Kích hoạt phiên đầu | Người mới online có thu hoạch đầu + tiêu xu hoặc ghim mục tiêu / người mới đủ điều kiện | ≥60%; ghi cả thời gian tới thu đầu, trung vị kỳ vọng ≤10 phút |
| D1 / D7 | Quay lại có thao tác gameplay vào ngày thực thứ 1 / thứ 7 sau ngày đầu | Ban đầu D1 ≥30%, D7 ≥12%; ưu tiên xu hướng và nguyên nhân bỏ |
| D30 | Tương tự vào ngày thực thứ 30 | Chỉ đặt ngưỡng sau khi có cohort đủ tuổi và baseline |
| Hợp tác | Người hoạt động tuần có ≥1 đóng góp / người hoạt động tuần | Thử ≥25%; tách làng 1–2, 3–5 và 6–12 người hoạt động |
| Đợt góp hàng | Đợt hoàn thành / đợt hợp lệ | Không tối ưu tỷ lệ bằng cách loại làng vắng khỏi mẫu; báo cáo riêng quy mô và lượng hàng mất khi hết hạn |
| Mua hàng | Người mua duy nhất / MAU đủ điều kiện thanh toán | Không coi bảng doanh thu giả định là ngưỡng cam kết |
| Chất lượng | Lỗi thao tác, mất lưu, người kẹt đường, phản hồi bị quấy rối | Không mất tiến trình; lỗi mới chặn chơi phải được sửa trước mở gói trả phí |

Dùng ngày thực UTC cho cohort để tránh nhầm ngày game; giao diện có thể hiển thị giờ Việt Nam. D0 là ngày lịch UTC có lần chơi online đầu; DN là ngày lịch UTC cách D0 N ngày, không phải cửa sổ rolling N×24 giờ tính từ lần mở. D1/D7 chỉ tính cohort đã đủ tuổi; không tính người chưa đến ngày là rớt. Activation đo trong phiên đầu và báo cáo thêm cửa sổ 24h riêng, không gộp hai mẫu số.

Đợt đầu cần tối thiểu khoảng 200 người mới hợp lệ và ít nhất hai cohort tuần đủ tuổi D7 để đánh giá hướng; đây là quy mô tuyển mẫu kế hoạch, không đảm bảo đủ lực thống kê. Hiển thị số người thực và khoảng bất định, không chốt A/B từ vài lượt. Nếu traffic thấp, ưu tiên quan sát/phỏng vấn và thử tuần tự, ghi thay đổi theo phiên bản để tránh nhầm mùa/người mới với hiệu ứng thiết kế.

## 9. Thứ tự đầu tư

1. Chốt UX phiên đầu và quay lại, sửa chỗ hình/luật mâu thuẫn; đo rất gọn.
2. Nâng trải nghiệm đơn góp hàng đang có, phần thưởng thẩm mỹ và người ít thời gian.
3. Một lát cắt “Ký ức làng + Hiên nhà mùa sen”, kiểm chứng với nhóm nhỏ.
4. Thử một bộ decor trả phí sau khi có giữ chân và nền thanh toán tin cậy.
5. Mở chủ đề tiếp theo, vai trò mềm và album chỉ khi dữ liệu/khả năng sản xuất ủng hộ.

Mục tiêu không phải có nhiều hệ thống nhất, mà là người chơi có thể nói: **“Tôi thích góc vườn này, và đây là làng của chúng tôi.”**

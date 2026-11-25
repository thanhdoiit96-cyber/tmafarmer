# Gameplay hiện tại — tài liệu tham chiếu

Chuồng phụ có thể nâng riêng từ 2 lên 4 chỗ tại Nông trại → Đất, giá 160 xu và yêu cầu chuồng chính cấp 2. Save cũ giữ nguyên cấp 1; xem [phạm vi và kiểm chứng](PARCEL_COOP_UPGRADE_V1.md).

Cập nhật 25/11/2026: **Mục tiêu tiếp theo** hướng dẫn vụ đầu hoặc ghim nâng công trình. Có thể đổi/bỏ ghim; nút chỉ dẫn đường, bạn vẫn xác nhận hành động. Lựa chọn lưu theo vườn trên thiết bị, chưa đồng bộ sang thiết bị khác. Xem [chi tiết V1](NEXT_GOAL_V1.md).

Đối chiếu ngày 21/11/2026, source commit nền `d493aea`. Tài liệu này mô tả **cơ chế đang có trong source**, không cam kết mọi môi trường production đã deploy cùng commit. Các ý tưởng tương lai nằm riêng trong [strategy](GAME_PRODUCT_STRATEGY.md) và [roadmap](GAME_DEVELOPMENT_ROADMAP.md).

Các bảng số được sinh từ engine ở [GAMEPLAY_CATALOG.md](GAMEPLAY_CATALOG.md). [GAME_PROGRESSION.md](GAME_PROGRESSION.md) là bảng cấp độ/mở khóa hiện có. [PLAYER_QUICKSTART.md](PLAYER_QUICKSTART.md) là bản rút gọn cho người mới.

## 1. Mục tiêu và vòng chơi

Bộ chọn hạt giống và vật nuôi dùng ô ảnh **Đã mở / Còn khóa**, phân trang và nút Gieo/Đón riêng; hover hoặc click/chạm để xem chi tiết. Mục tiêu ghim chỉ hiện dưới dạng thẻ nhỏ trong **Việc cần làm**. Nhà, kho và xưởng có vùng chặn theo hình vẽ, vẫn đi được tới cửa. Xem [giao diện V2](GAME_UI_V2.md).

P1.1 bổ sung [tóm tắt khi quay lại](RETURN_SUMMARY_V1.md) sau ít nhất 10 phút thực. Bản V2 hiện việc sẵn sàng và chỗ kho; mục tiêu nằm riêng trong Việc cần làm. Số tăng/giảm là chênh lệch tổng mục sẵn sàng so với mốc trước trên thiết bị; không phải lịch sử thu hoặc sản lượng tích lũy. Không đổi cơ chế phát triển khi offline.

Chỉ dẫn mở khóa V1 cho cây, vật nuôi, thủy sản và nâng công trình hiển thị đồng thời các điều kiện theo engine, có nút tới tiến độ/công trình/vật liệu và ghim nâng cấp. Chỉ dẫn không thay thế điều kiện mua, trồng, thả hoặc chế biến. Xem [phạm vi và kiểm chứng](UNLOCK_GUIDANCE_V1.md).

Người chơi quản lý một vườn riêng: trồng/chăm → thu → bán hoặc chế biến/giao đơn → nhận xu và XP → nâng công trình, mở giống/con mới → trang trí và góp phần phát triển làng.

Không có điều kiện thắng cuối cùng bắt buộc. Hiện có các đích hữu hạn: cấp nông trại 13, trần công trình, bốn dự án làng, đất/trang trí; sau đó người chơi tiếp tục sản xuất, giao dịch và góp đơn. Chưa có hệ prestige/reset tự nguyện, nghề chuyên biệt, album làng nhiều chương hoặc thanh toán tiền thật trong luồng hiện tại.

Vòng ngắn: xử lý việc đang sẵn sàng, chăm vụ kế tiếp, xem kho. Vòng trung: hoàn thành đơn, chế biến nguyên liệu, nâng một công trình. Vòng dài: tiến trình vườn, đất, tài sản và cấp làng.

## 2. Chế độ, tài khoản và lưu tiến trình

- **Vườn thử:** lưu trong trình duyệt, có hàng xóm mẫu; tách dữ liệu với làng online. Xóa dữ liệu trình duyệt/đổi môi trường có thể mất bản thử. Không mô tả demo là bản cloud save.
- **Làng online:** tạo làng hoặc nhập mã/link mời; tối đa 12 vườn. Trạng thái nông trại và giao dịch được engine phía server xử lý và lưu; bản chạy local dùng SQLite, bản Worker cấu hình D1.
- **Tài khoản:** đăng ký/đăng nhập, gắn phiên khách và vào lại làng theo luồng tài khoản hiện có. Không mặc định bản demo được tự nhập lên server.
- **Avatar:** sáu mẫu: nam/nữ × thanh niên/trung niên/cao tuổi. Chọn khi đăng ký/vào làng hoặc đổi trong game; miễn phí, không thay chỉ số. Avatar hiện lưu theo vườn, không phải entitlement thẩm mỹ toàn tài khoản.
- **Offline:** cây/con được tính lại theo thời gian và thời tiết khi có xử lý trạng thái. Không có auto-loop trồng/thu/feed vô hạn. Cây chín dừng tăng trưởng và áp lực trong phép chiếu cây; vật nuôi/ao chỉ lớn trong khoảng còn thức ăn. Cô Lan là công việc đã thuê, được giải quyết theo lịch riêng.

Nguồn: `newFarm`, `snapshot`, `projectPlot`, `projectAnimal`, `advanceGardenHelpers` trong `public/game.mjs`; xử lý tài khoản/phiên trong `server/worker.mjs` và các bảng migration tương ứng.

## 3. Điều khiển và scene

WASD/phím mũi tên để đi; E tương tác khi đủ gần. Click/chạm mục tiêu để tự tìm đường. Mobile có cụm nút hướng. Các thao tác cần vị trí dùng `world.approach()` và kiểm tra vị trí theo luồng hiện có; không chỉ gửi action từ UI rồi bỏ qua tiếp cận.

Các khu: **Vườn nhà**, **Nhà vườn**, **Chuồng trại**, **Xưởng máy**, **Ao/Hồ làng**, **Chợ làng**, **Hàng xóm**, **vườn đang ghé**. Nội dung từng khu hiển thị theo điều kiện mở khóa. Vườn nhà/vườn ghé dùng world 820×900; viewport pixel 640×384, camera theo nhân vật; khu khác có kích thước riêng trong `world-layout.mjs`.

Click công trình/ô đất để đi đến và mở bảng; task điều hướng về nơi cần làm. Tại ao chỉ đi trên bờ/cầu theo collision hiện tại. Không dùng kích thước minh họa nhà/chuồng làm sức chứa gameplay.

Icon trên luống: giỏ nông sản = thu, sâu = trị sâu, bụi cỏ có rễ = nhổ cỏ, giọt nước = tưới. Biểu tượng có vòng ngà mảnh/nền tối nhẹ, ở giữa luống phía trên tán; danh sách task vẫn có chữ. Đây là tín hiệu ưu tiên, không phải mọi trạng thái cùng xuất hiện một lúc.

## 4. Khởi đầu và loại tài nguyên

Vườn mới có 100 xu, 0 XP, 6 luống chính, Kho cấp 1 (30 nông sản), Ruộng cấp 1, Chuồng/Xưởng chưa xây, Túi ghé vườn cấp 1, chưa nâng an ninh. Có hai mảnh đất mở rộng đã sở hữu nhưng chưa chọn công trình, ao chính sức chứa sáu con giống và một số vật tư khởi đầu.

Vật tư gốc: 5 giống lúa mì, 2 giống cà rốt, 1 giống bắp, 2 phân, 1 thuốc, 3 thức ăn vật nuôi, 1 giống rô phi, 1 giống tôm, 3 thức ăn thủy sản. Cần đón vật nuôi và thả giống trước khi chăm. Vườn thử có thể được UI chuẩn bị khác để minh họa; đây là `newFarm`, không phải mô tả mọi save demo.

| Tài nguyên | Cách dùng |
| --- | --- |
| Xu | Mua giống/vật tư/con, nâng cấp, đất, trang trí, thuê Cô Lan, giao dịch |
| XP | Tích lũy mở danh hiệu/điều kiện; không tiêu khi mở khóa |
| Nông sản/sản phẩm có giá bán | Tính chỗ kho, bán nhanh/đơn/chế biến hoặc sạp |
| Giống/vật tư và món không có giá bán | Có giới hạn 100 mỗi loại theo các kiểm tra túi; không dùng chung tổng chỗ kho nông sản |
| Vật liệu chế tạo | Nằm trong nhóm công thức vật liệu; một số có giá bán nên vẫn tính chỗ kho |
| Phiếu trang trí | Kiếm từ đơn góp hàng hoàn thành; dùng để sở hữu đồ trang trí theo flow hiện tại, không phải tiền thật |
| Nước/no/thể lực | Điều kiện làm việc; không phải hàng hóa trên chợ |

Kho được tính theo tổng lượng các goods có `sell`; không theo số loại. Lúc thu phải có chỗ cho lượng nhận thực tế. Hàng đã đăng sạp được trừ khỏi kho; khi gỡ sạp cần đủ chỗ để nhận lại. Giao dịch không tự nâng kho.

## 5. Lịch và thời tiết

Một ngày game = **8 giờ thực**, một ô thời tiết = **2 giờ thực**. Reset theo lịch của làng, không đồng nghĩa 0 giờ Việt Nam. Đơn góp hàng = **48 giờ thực**. Lão hóa vật nuôi tính bằng **ngày thực 24 giờ**. Hướng dẫn phải luôn ghi đơn vị này.

Bảy thời tiết: nắng nhẹ, mưa rào, nhiều mây, nắng nóng, gió mạnh, sương sớm, dông. Dự báo lấy theo lịch của room. Mưa/dông có cờ đất ướt; trời nóng làm thao tác tốn thêm một nước. Dông không cho bắt đầu thả câu.

Tốc độ cây kết hợp **hệ số thời tiết chung × hệ số riêng nhóm cây × độ ẩm × áp lực sâu/cỏ × bón phân**. Không được bỏ hệ số chung khi giải thích nhóm “ưa nắng”: hệ số riêng tốt không đảm bảo nóng nhanh hơn mọi điều kiện khác. Cây có tám nhóm: ngũ cốc, củ rễ, ưa nắng, ưa mát, ưa sương, nhiệt đới, ưa nước, chịu hạn; xem đầy đủ trong catalog.

## 6. Trồng và chăm cây

1. Chọn luống trống; nếu đất đã chai sau 8 giờ thực bỏ trống, cuốc trước.
2. Chọn giống đã đủ điều kiện và có trong túi; gieo dùng một giống. XP/cấp xưởng chỉ mở quyền trồng, không tự cấp giống miễn phí.
3. Tưới nếu khô. Đất được tưới đến `now + ceil(goal × 1,15)`; mưa cũng làm ướt. Khi ẩm nhân 1,38 tốc độ, khi khô nhân 0,65. Đây là hai trạng thái, không cộng thành 203%.
4. Có thể bón một lần: tốn một phân, nhân 1,3 tốc độ và tăng một đơn vị sản lượng nền trước hệ số sản lượng thời tiết.
5. Theo dõi cỏ hoặc sâu; xử lý đúng loại.
6. Thu khi đạt goal. Nhận nông sản và 4 XP mỗi thao tác thu; luống về trống và có 8 giờ trước khi chai.

Thời gian bảng giống là thời gian cơ sở, **không phải thời gian thực còn lại**. Khô, thời tiết, chăm sóc và save cũ có thể thay đổi thời điểm thu. Khi gieo vụ mới, goal được ghi để vụ không bị đổi đích giữa chừng bởi cập nhật cân bằng.

### Cỏ và sâu

Vụ mới chọn một loại áp lực chính lúc gieo, có cân theo thời tiết. Cỏ không phải phần cỏ trang trí quanh ô. Save cũ thiếu trường hazard được hiểu là sâu. Cỏ/sâu tăng trong lúc cây chưa chín, tùy trời và bảo vệ; mưa và 20 phút sau mưa tăng nguy cơ.

- Áp lực từ 40%: tốc độ nhân 0,68, tức chậm 32% so với tốc độ đang áp dụng.
- **Nhổ cỏ:** dùng hoạt ảnh cuốc, không tốn vật tư; vẫn tốn nước/no/thể lực. Xóa cỏ hiện tại và ngăn mọc lại 20 phút thực.
- **Xịt thuốc:** dùng một thuốc; xóa sâu hiện tại, bảo vệ trong `ceil(goal × 1,1)` giây. Thuốc không trị cỏ.
- Mức đỉnh đã chịu được giữ lại. Chăm muộn không hoàn lại tổn thất đã tích lũy.

Sản lượng trước sâu/cỏ = làm tròn `(yield cơ sở + 1 nếu bón) × trung bình có trọng số thời gian của hệ số sản lượng thời tiết riêng cây`, tối thiểu 1. Exposure là thời gian thật trong các đoạn lớn lên, không phải chỉ thời tiết đúng lúc bấm thu.

Lấy áp lực cao nhất hiện tại/đỉnh cỏ/sâu để tính thiệt hại: dưới 20% không mất; từ 20% mất 1; từ 40% mất `ceil(35% sản lượng trước thiệt hại)`; từ 70% mất `ceil(60%)`. Sản lượng cuối ít nhất 1. Nếu đã bị khách lấy một phần thì trừ tiếp phần đã lấy.

### Giữ giống

“Thu và giữ 1 giống” chuyển một đơn vị nông sản của lần thu thành một giống cùng loại, phần còn lại vào kho. Nếu chỉ còn một, có thể chỉ nhận giống. Trong Kho cũng có đổi nông sản đang sở hữu sang giống. Có giới hạn túi; giữ giống là đánh đổi sản lượng bán được, không được cộng thêm một giống miễn phí ngoài vụ thu.

## 7. Vật nuôi

Xây chuồng → đón con đủ điều kiện → cho ăn → qua giai đoạn lớn → tích kỳ sản phẩm → thu khi đủ tiến độ. Bảng thời gian lớn và thời gian mỗi kỳ là **hai giai đoạn**, lần thu đầu không chỉ bằng một kỳ sản phẩm. Hết thức ăn thì tiến độ dừng; không có cơ chế vật nuôi tự ăn đồ trong kho.

Sức chứa chuồng chính = `2 × cấp chuồng`, tối đa 16 ở cấp 8. Mỗi chuồng mảnh đất thêm có hai chỗ, tính riêng; ô trống ở chuồng khác không tự biến thành chỗ của chuồng đang chọn. Có chuyển vật nuôi giữa các chuồng phù hợp. Cấp 0 chưa xây không có chỗ chính.

- Gà, vịt, bò, dê, cừu, ngỗng, chim cút, trâu cho sản phẩm theo kỳ.
- **Lợn và thỏ xuất chuồng một lần**, nhận thịt rồi rời chuồng. Lợn hiện không tìm nấm truffle; truffle là cây trồng riêng.
- Lần cho ăn tiêu số thức ăn của loài; thức ăn kéo dài `ceil((goal lớn + goal sản phẩm) × 1,25)` giây. Tốc độ chịu thời tiết; chuồng từ cấp 2 có che chắn theo engine.
- Thu một kỳ được 5 XP; con lặp kỳ đặt tiến độ sản phẩm về 0. Có thể bán con để lấy lại một phần giá, không phải hoàn toàn bộ giá đón.
- Con lặp kỳ: dưới 3 ngày thực dùng 100% yield và bán lại 50% giá gốc; từ 3 ngày dùng 75% yield/bán 40%; từ 7 ngày dùng 50% yield/bán 25%. Yield làm tròn xuống, tối thiểu 1. Con one-time không dùng giảm này. Đây là cơ chế hiện tại, chưa có nghỉ dưỡng hay vật phẩm chống già.

## 8. Ao nuôi và câu cá

Ao chính sáu chỗ con giống; mỗi ao trên mảnh đất hai chỗ. Có thể có nhiều loài cùng ao nhưng chỉ một lứa của một loài tại một thời điểm; muốn thả thêm loài đó phải thu lứa hiện tại. Chỗ tính bằng số con giống, không phải số dòng trong danh sách lứa.

Thả giống tiêu `qty` giống → cho ăn đúng lứa → tiến độ tăng trong thời gian còn thức ăn, chịu hệ số thủy sản thời tiết → thu cả lứa. Thức ăn = số con giống × nhu cầu loài. Sản lượng = yield loài × số giống − phần đã bị câu lấy. Cho ăn kéo dài `ceil(time cơ sở × 1,5)`. Thu được 6 XP và cần đủ kho cho cả lượng nhận.

**Câu hồ làng:** 12 lần thành công/ngày game, thêm hai nếu làng đã xây Bến cá. Sau thả chờ 6 giây, có cửa sổ kéo 55 giây; sau thành công nghỉ 45 giây. Một lượt nhận một sản phẩm. Cá chép vàng: 4% khi mưa, 2% khi sương, 3% các trời còn lại có thể thả. Xác suất rô phi 12%, phần còn lại cá nhỏ. Thời tiết dùng theo lúc thả. Dông chặn bắt đầu lượt mới, không tự mô tả là hủy mọi lượt đang chờ.

**Câu ao hàng xóm:** cần lứa đủ lớn, loài có thể câu, còn ít nhất ba sản phẩm theo điều kiện `canCatch`. Tôm và cua không câu kiểu này. Thành công lấy một sản phẩm và dùng chung quota lấy đồ; cần kiểm tra lại cổng/quota khi kéo cần. Không phải chức năng thu hoạch ao của chính mình.

## 9. Chợ, đơn và chế biến

**Bán nhanh:** giá hệ thống, nhận xu ngay, có thể bán hết một mặt hàng. **Sạp làng:** tối đa ba listing của mình; giá nguyên từ 1 đến ba lần giá bán nhanh mỗi đơn vị; hàng đưa lên bị trừ khỏi kho, người mua trả đủ tổng `giá × lượng`. Không tự mua listing của mình; có thể gỡ và nhận lại nếu đủ kho. Listing là cả lô trong luồng deal, không hứa có mua một phần nếu UI không hỗ trợ.

**Đơn giao chợ:** ba đơn nền theo ngày game, có thể thêm nhóm đơn xưởng/ẩm thực/đa dạng/thủy sản theo điều kiện. Là đơn chung: một vườn giao đủ trước nhận thưởng, các vườn khác không tiếp tục giao cùng đơn đó. Đơn nhiều mặt hàng cần đủ cả giỏ. ID và hạn được kiểm tra lại, không chỉ tin bảng UI cũ.

**Xưởng máy:** mở từ 40 XP và 120 xu, tăng đến cấp 9. Công thức khóa theo cấp xưởng. Chế tạo hiện là thao tác trừ đúng nguyên liệu, cộng một thành phẩm; **chưa có hàng đợi máy, nhiên liệu, xác suất chất lượng hoặc thời gian chế tạo riêng**. Không được viết hướng dẫn “chờ máy chạy” cho bản hiện tại.

Thành phẩm chia đồ ăn/phục hồi và vật liệu. Một số đồ ăn đầu không có giá bán; đặc sản cao cấp và vật liệu có giá bán nên vào chỗ kho. Dùng món phải có công thức gain và qua cooldown ăn món 90 giây. Vật liệu không ăn được. Xem bảng công thức và lượng hồi trong catalog.

## 10. Đất, công trình, trang trí

Tám mảnh mở rộng có bố cục/kích thước chuẩn, hai đã sở hữu lúc đầu. Mua thêm giá `65 + 20 × max(0, số mảnh đã sở hữu − 2)` xu. Sau mua còn phải chọn xây: vườn 45 xu, ao 55, chuồng 70. Vườn mảnh có ba luống, nâng thêm với 120 xu để thành sáu; không tự tăng mọi vườn khi nâng cấp Ruộng chính.

Ruộng chính mỗi cấp thêm ba luống (6 → 30). Kho 10 cấp (30 → 1080 nông sản), Chuồng 8 cấp, Xưởng 9 cấp. XP, xu và vật liệu là điều kiện riêng; đủ danh hiệu không tự nâng công trình. Bảng chính xác nằm ở catalog/progression.

Hàng rào gỗ mật ong/trắng/tre là **trang trí**, khác nâng **Hàng rào an ninh**. Đồ trang trí có danh sách điểm đặt và gợi ý; có thể bố trí/cất theo UI. Đồ sở hữu dùng theo điểm đặt; không có editor kéo mọi công trình tự do. Có thể sở hữu decor bằng xu hoặc phiếu trong luồng thanh toán hiện tại. Các vật phẩm này chưa phải cosmetic mua bằng tiền thật.

Nhà trong Hàng xóm theo **tổng tài sản**, ngưỡng nghiêm ngặt: mặc định; **trên** 500, 1000, 5000, 20000 xu tương đương. Bằng đúng ngưỡng chưa lên mẫu kế tiếp. Cấp XP hiển thị riêng. Tên chủ ở cổng, sáu nhà mỗi trang để đủ 12 vườn; nhà chính mình cũng có trong danh sách.

## 11. Phát triển làng và hai loại đóng góp

**Góp xu xây công trình:** làng tiến qua Làng → Xã → Phường → Quận → Thành phố. Các mục tiêu lần lượt là Bảng tin 300 xu; Giếng công cộng 850; Bến cá 1700; Nhà sinh hoạt 3200. Xây xong chưa đủ lên cấp: còn thu nhập tích lũy, số đơn và chuỗi ngày game đã kết thúc trong giới hạn trộm. Điều kiện đầy đủ ở `village.mjs`; không gọi cấp làng là cấp vườn.

**Đơn góp hàng 48 giờ thực:** ba mẫu xoay vòng theo mở khóa trong làng. Mỗi vườn góp từng phần; hàng trừ khỏi kho ngay. Khi cả làng đủ mọi món, người góp tổng ít nhất ba món tự nhận **12 XP + ceil(125% tổng giá bán nhanh phần mình góp) xu + một phiếu trang trí**. Không cần online đúng lúc người cuối cùng giao. Chưa đủ ngưỡng ba món không có thưởng này. Hết hạn chưa xong: hiện không trả lại hàng; cần đọc cảnh báo trước khi góp. Lưu kết quả trước ở mức tóm tắt, chưa là album lâu dài.

Hai hệ trên không dùng chung điều kiện và không thay thế nhau. Góp hàng không tự hoàn thành dự án góp xu. Đợt góp hàng không phải đơn giao trước nhận trước.

## 12. Hàng xóm, lấy đồ và xã hội

Có vườn riêng và khu vực chung. Chat nổi trong phạm vi gần ở cùng scene, tồn tại ngắn và không phải hộp thư lưu lâu dài. Làng có chủ/quyền quản lý thành viên theo server; không suy ra mọi người được quyền xóa vườn khác.

Lấy đồ từ ruộng/kho hoặc câu ao dùng các giới hạn cùng nhau:

- Lượt tối đa của người lấy = hai × cấp Túi ghé vườn, còn chịu quota chung làng.
- Một người chỉ lấy thành công một lần tại cùng vườn đích trong ngày game.
- Vườn đích mất tối đa `max(1, 3 − cấp hàng rào an ninh)` món/ngày game.
- Cổng bảo vệ chặn tiếp cận lấy đồ; đóng cổng tốn 12 xu, thời gian 30/30/30/45/60 phút theo an ninh 0–4.
- Quota làng giảm theo cấp 12/8/5/3/1. Ngoài quota, từng nguồn còn kiểm hàng chín, hàng đủ và chỗ kho.

Xếp hạng tài sản tính xu + hàng trong kho/trên sạp theo giá hệ thống + giá trị tài sản đã xây/đón theo engine. Giá niêm yết tự đặt không được dùng để phóng đại điểm. Đây không phải bảng “ai nạp nhiều nhất”; hiện chưa có nạp.

## 13. Nước, no, thể lực và thuê người

Ba chỉ số tối đa 100, thao tác tiêu hao theo bảng catalog. Trời nóng thêm một nước trên action có workCost. Thiếu chỉ số thì thao tác bị từ chối; không âm thầm cho qua rồi tính nợ.

- Uống: +48 nước, chờ 90 giây; ăn cơm nắm: +52 no, chờ 300 giây. Là action phục hồi hiện có, không thấy trừ xu/vật tư trong nhánh này.
- Nghỉ trong Nhà vườn: 60 giây, +75 thể lực tối đa 100. Đang nghỉ chặn việc cần sức nhưng vẫn có thể xem bảng/giao dịch phù hợp. Không có cooldown nghỉ bổ sung bắt buộc sau khi đã xong.
- Thể lực tự hồi khoảng một điểm/phút trong thời gian idle tính theo engine; các cơ chế migration nghỉ cũ giữ xử lý riêng.
- Món xưởng hồi theo gain từng món và cooldown món, không cùng timer cơm nắm.

**Cô Lan:** thuê bằng xu cho tưới (2 xu/ô, làm 5 giây/ô) hoặc thu (4 xu/ô, làm 7 giây/ô), cộng thời gian đi. Chọn 1–12 ô/lượt, chỉ một job đang chạy. Preview lượng kho/phí và tùy chọn giữ giống; engine kiểm lại khi thuê và từng bước, có báo cáo bỏ qua/hoàn phí nếu tình trạng không còn hợp lệ. Không có thuê nhổ cỏ/xịt/bón/gieo trong định nghĩa hiện tại. Không mặc định mọi animation helper đều là tính năng thuê đã mở.

## 14. Sổ việc hôm nay

Trong mỗi ngày game, hoàn thành ba nhóm: một việc chăm cây (gồm cuốc/gieo/tưới/bón/xịt/nhổ), một lần thu cây/con/ao, và bán nhanh hoặc giao đơn. Sau đó nhận một lần **25 xu + 8 XP**. Đăng sạp đơn thuần không phải bán nhanh/giao đơn; góp hàng cũng không thay nhóm market nếu engine chưa liệt kê.

## 15. Câu hỏi thường gặp cần giữ đúng

| Câu hỏi | Trả lời hiện tại |
| --- | --- |
| Vì sao đủ XP mà chưa trồng được? | Còn cấp xưởng/giống; mở khóa không tự nâng công trình |
| Vì sao chuồng còn chỗ mà đón báo đầy? | Kiểm đúng chuồng đích; sức chứa mỗi chuồng tách riêng |
| Vì sao đã nhổ cỏ/xịt mà sản lượng chưa hồi? | Mức thiệt hại đỉnh đã được giữ |
| Vì sao đủ giờ cơ sở mà cây chưa chín? | Tốc độ theo thời tiết/ẩm/áp lực; mốc bảng không phải ETA |
| Vì sao không thể thu? | Kiểm tiến độ, vị trí, chỉ số sức khỏe, kho và hàng còn lại |
| Vì sao hết lượt lấy dù túi còn? | Quota làng, giới hạn cùng đích, mất tối đa của chủ hoặc cổng |
| Vì sao lợn biến mất sau thu? | Lợn là loài xuất chuồng một lần |
| Vì sao mất hàng sau góp? | Góp trừ ngay; hiện đợt thất bại không hoàn lại |
| Vì sao mẫu nhà không đổi ở đúng 500 xu? | Ngưỡng là tổng tài sản lớn hơn 500, không phải bằng 500 hay chỉ tiền mặt |
| Có thể trả tiền để mua cấp không? | Chưa có thanh toán; roadmap đề xuất cosmetic, không bán cấp |

## 16. Quy tắc cập nhật tài liệu

Khi thay một luật: sửa engine trước, chạy test phù hợp, xuất lại catalog, cập nhật đoạn tương ứng ở tài liệu này và quickstart nếu người mới bị ảnh hưởng. `GAMEPLAY_CATALOG.md` và `GAME_PROGRESSION.md` có bảng sinh tự động; không sửa số bằng tay. Nhánh đề xuất chưa phát hành không đưa vào phần “hiện tại”.

```powershell
npm run gameplay:docs
npm run check:gameplay-docs
npm run check:progression
```

Định nghĩa nguồn: `game.mjs` (cây/con/hàng/công trình/đơn/xưởng), `land.mjs` (đất/capacity), `aqua.mjs` (ao/câu), `wellness.mjs` (sức khỏe), `village.mjs` (cấp làng), `garden-helper.mjs` (thuê người), `avatar-models.mjs` (nhân vật), `world-layout.mjs`/`world.mjs` (di chuyển/scene), `server/worker.mjs` (làng và API). Khi giao diện khác tài liệu, đối chiếu commit deploy và source, không tự kết luận do người chơi thao tác sai.

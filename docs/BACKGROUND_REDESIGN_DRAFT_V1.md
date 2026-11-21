# Phác thảo cải tổ bối cảnh và mặt bằng

**Trạng thái: đã triển khai bản cải tổ nền V1.** Hai bảng dưới đây giữ vai trò phác thảo và lưu lại hướng đã duyệt. Renderer hiện đã dùng đạo cụ pixel theo palette của game, bố trí lại luống/vệt đường và trang trí các lô đất đang khóa.

## Bảng phác thảo

Mỗi bảng có bốn khung, đọc từ trái sang phải rồi từ trên xuống:

| Bảng ngoài trời | Cảnh |
| --- | --- |
| [Vườn nhà](assets/background-redesign-draft-v1/outdoor-scenes.png) · trên trái | Vườn nhà gọn hơn, lối chính nối nhà, giếng, kho, chuồng, ao và các luống; phía nam dành cho mở đất |
| trên phải | Chuồng trại với lối đi thoáng, sân rơm và hàng rào ôm khu vật nuôi |
| dưới trái | Chợ làng gom thành quảng trường nhỏ, ba quầy quanh lối đi thông suốt |
| dưới phải | Hồ làng có bờ cong, cầu gỗ, sen và lau sậy viền ngoài, giữ lối tới điểm câu |

| Bảng trong nhà và xã hội | Cảnh |
| --- | --- |
| [Nhà vườn](assets/background-redesign-draft-v1/indoor-and-social-scenes.png) · trên trái | Lối vào ở giữa phía dưới, giường bên phải; bàn trà, cửa sổ và vật dụng gọn dọc tường |
| trên phải | Xưởng máy có bàn chế tạo làm tâm, kệ vật tư sát tường và hành lang từ cửa tới bàn |
| dưới trái | Đường làng có nhà và nhà sinh hoạt quanh quảng trường, chừa khoảng cho thêm nhà |
| dưới phải | Vườn hàng xóm dùng cùng ngôn ngữ mặt bằng với vườn nhà, đổi mái, sắc độ và cách đặt ao/chuồng |

Các bảng nhấn vào bố cục và quan hệ giữa các khu vực. Một số chi tiết trong ảnh sinh tự động còn quá mịn và dày so với mật độ pixel của game; nếu hướng này được duyệt, asset production sẽ được vẽ lại theo skill `game-pixel-art`, không đưa nguyên các bảng vào game.

## Rà soát hiện trạng

- Các cảnh dùng gameplay grid 480 × 288; vườn nhà và vườn ghé thăm dùng homestead 820 × 640. Nền ngoài trời ghép từ vật liệu lát, polygon địa hình, đường và cây/hoa rời trong `public/landscapes.mjs`; nhà vườn và xưởng máy lại có nền vẽ riêng trong `public/world-art.mjs`. Cách ghép khác nhau làm các lối đi và chất liệu chưa có nhịp liên tục.
- Vườn nhà hiện có 12 vị trí ruộng chính theo lưới ba cột nhưng các cột bị tách thành hai cụm. Đất mở rộng đã có tám parcel theo bốn cột, hai hàng phía nam. Các dải lối ở y≈410, 515 và 623 chia mặt bằng nhưng chưa đọc thành một hệ đường rõ ràng.
- Đường hiện đã nối các cửa ra chợ, chuồng, xóm, hồ; nhà, giếng và kho có điểm tương tác cố định. Đổi trang trí mà không giữ các hành lang này có thể làm vật thể che lối, điểm đến bị khuất hoặc bộ tìm đường không tới được tương tác.
- Vườn hàng xóm dùng lại bố cục vườn nhà; nên giữ cùng cấu trúc để người chơi hiểu nhanh, nhưng thay palette mát hơn và vài landmark để phân biệt chủ vườn.

## Hướng bố cục đề xuất

- **Vườn nhà:** gom 12 luống chính thành cụm 3 cột × 4 hàng có khoảng cách đều và sát nhau; giữ nguyên ID ô đất, chỉ điều chỉnh bảng tọa độ tập trung tại `plotPosition`. Dành một hành lang chính rộng từ cổng phía nam lên nhà, rồi các nhánh ngắn tới giếng, kho, chuồng và ao. Vành cây, bờ tre, đá và hoa nằm ngoài hành lang.
- **Mở rộng đất:** giữ vùng homestead 820 × 640 và lưới parcel tái sử dụng bốn cột. Các ô khóa hiện chưa nhận ruộng sẽ hiện thành bãi cỏ có cọc ranh, cây ăn quả non, bụi tre và lối mòn nhánh; khi mở đất, cảnh vật rút ra hoặc chuyển thành hàng rào/vườn tùy ô. Như vậy khu chưa mở vẫn có chủ đích và bố cục còn chỗ cho hàng parcel tiếp theo.
- **Chuồng trại:** lấy sân rơm và chuồng làm trung tâm, giữ vùng đứng của vật nuôi, máng và hai lối ra; cây lớn chỉ đặt ở rìa để không che sprite.
- **Chợ và hồ:** dùng cùng loại đá lát cho quảng trường và đường làng; lối bờ hồ chuyển dần sang sỏi/đất, bến gỗ chỉ ở điểm câu. Quầy, giếng, cầu và bến không lấn vùng đi bộ.
- **Nhà vườn và xưởng:** giữ lối giữa từ cửa tới tương tác; chuyển bàn, giường, kệ, cửa sổ thành cụm sát tường để phòng có khoảng thở. Hướng sáng, viền gỗ và tỉ lệ đồ nội thất theo pixel slice hiện có.
- **Đường làng và vườn ghé thăm:** tạo một trục đi bộ dễ đọc và các nhánh cụt ngắn tới nhà/chuồng; các ranh đất xa lối chính có thể thêm dần khi game mở rộng.

## Ràng buộc trước khi dựng production

1. Tách sơ đồ nền khỏi logic tương tác: các nền mới không tự tạo hitbox; tọa độ tương tác, vùng nước, hàng rào và đường tìm đường tiếp tục do dữ liệu map quyết định.
2. Di chuyển ruộng theo bảng tọa độ duy nhất, giữ ID cũ và xác minh mọi hạt giống/cây đang trồng vẫn nằm đúng ô sau khi đổi bố cục.
3. Đối chiếu từng đường ra/vào và điểm đích của `features`, `walkable` và `route`; kiểm tra cả camera khi đi tới vùng mở rộng phía nam.
4. Chuẩn hóa đường đất, đá, sỏi và sân rơm thành cùng mật độ pixel, cạnh sắc và palette ấm; đặt chi tiết trang trí lớn ở lớp có thể vẽ sau nhân vật để giữ chiều sâu đúng.
5. Xem lại tám cảnh ở viewport 640 × 384, tại kích thước chơi bình thường và pixel scale; kiểm tra trạng thái ruộng trống/đang trồng, parcel khóa/mở, trời mưa và các vật thể tương tác.

## Phạm vi triển khai sau khi duyệt

Thực hiện theo từng lớp có thể kiểm tra: trước hết khóa lưới ruộng và trục đường; tiếp theo vẽ lại bộ nền/viền cảnh đồng bộ; sau đó bố trí đạo cụ theo lớp sâu; cuối cùng kiểm tra các đường đi, vùng tương tác và toàn bộ tám màn hình. Chỉ chuyển sang bước production sau khi hướng bố cục và mức độ chi tiết của hai bảng phác thảo được duyệt.

## Kết quả triển khai V1

- Thay cây, đạo cụ và công trình môi trường ảnh thật bằng hình pixel được vẽ trực tiếp trong renderer Canvas. Cây lớn, cây ăn quả, bụi hoa, tre, lau sậy, sen, đá, đèn, cây non, rơm, giếng, quầy chợ, chuồng, kho, đình và bến gỗ dùng cạnh sắc, khối màu ít bậc và cùng dải màu nâu/teal ấm với sprite nhân vật.
- Vườn nhà và vườn ghé thăm dùng chung vị trí ba cột luống `[182, 272, 320]` cùng lối bắc–nam ở x≈234; ID ruộng và trạng thái cây không đổi. Các parcel tiếp tục giữ lưới bốn cột, hai hàng phía nam.
- Lô chưa mua hiện thành bãi cỏ có cọc đá góc và nhãn “CHỜ MỞ”; lô đã mua nhưng chưa xây vẫn phân biệt bằng nền đất/viền riêng. Những trang trí mới nằm trong ranh lô, không tạo vật cản.
- Xưởng có bàn thao tác ở giữa và hành lang trống từ cửa phía nam; nhà vườn có thảm dẫn lối ra cửa. Tọa độ tương tác, cửa, vật cản, vùng nước và các lối sang cảnh vẫn do dữ liệu map hiện có quyết định.
- Xóa `public/canh-quan.webp` và metadata atlas ảnh thật không còn dùng; nền chỉ tải texture pixel đã có trong `public/pixel/terrain-materials-v3.png`.
- Đã chạy `node --test` (94/94 đạt), `npm.cmd run build`; bộ test bản đồ xác nhận spawn, hotspot, đường ra/vào, ao và các ô đất vẫn tới được.

**Phạm vi V1:** bản triển khai này làm mới renderer và mặt bằng dữ liệu; ảnh concept vẫn là phác thảo tham khảo, không được đóng gói làm ảnh nền gameplay. Các điểm trang trí được vẽ bằng Canvas để tiếp tục mở rộng mà không cần thêm bộ atlas riêng cho từng cảnh.

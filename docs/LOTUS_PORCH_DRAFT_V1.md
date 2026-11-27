# P3.1 — Phác thảo Hiên nhà mùa sen

Cập nhật: người dùng đã duyệt, bổ sung nét truyền thống ba miền và vùng cản. Đã triển khai [runtime V1](LOTUS_PORCH_RUNTIME_V1.md). Các ghi chú chờ duyệt bên dưới giữ làm lịch sử của bản phác thảo.

Ngày: 27/11/2026. **Trạng thái: phác thảo chờ duyệt, chưa thay asset/gameplay production.** Tiếp nối [xem thử trang trí P3.3](DECOR_PREVIEW_V1.md) và [lộ trình](GAME_DEVELOPMENT_ROADMAP.md).

## Xem bản đề xuất

- [Bảng mỹ thuật](assets/lotus-porch-draft-v1.png).
- [Trang đối chiếu với Canvas hiện tại](assets/lotus-porch-review-v1.html).
- Ảnh game thật: [Vườn nhà](assets/lotus-baseline-field.png), [Hàng xóm](assets/lotus-baseline-neighbors.png), đều 640×384. Chụp từ demo riêng, không sửa dữ liệu người chơi.

Ảnh concept được dựng bằng imagegen, tham chiếu hai Canvas thật và nguồn `garden-decor-expansion-source.png`. Nó là mục tiêu mỹ thuật để thảo luận, không phải ảnh sau tích hợp hoặc atlas có thể cắt rồi đưa thẳng vào game. Những thay đổi nhỏ do công cụ sinh ảnh đối với mái nhà/cây/nhân vật không thuộc phạm vi được đề nghị thay. Dải đồ vật bên dưới là hình phóng để duyệt chi tiết, không phải mọi món có cùng kích thước trong game.

## Hướng chốt đề xuất

Giữ gỗ/tre mật ong, gốm xanh ngọc, lá xanh trầm và một lượng ít sen hồng. Sen là điểm nhấn ở hiên/cổng, không phủ cả nền hoặc thay cây trồng bằng họa tiết trang trí.

**Gói đầu nên gọn:** chậu sen dựa trên nguồn đã có, biến thể đèn tre với tua sen nhỏ, một nút thắt sen trên trụ hàng rào và dấu kỷ niệm. Bàn quà tre trong bảng là phương án tùy chọn, chưa chốt triển khai. Không đặt thêm bàn nếu không còn chỗ hợp lý trong hệ vị trí hiện tại; không tự thay lối đi để ép đủ số món.

### Vườn nhà

Giữ nhà, kho/xưởng, giếng, ruộng, bờ ao và toàn bộ tọa độ gameplay. Chậu sen bên bậc hiên; đèn tre trên điểm trang trí hiện có. Nền không vẽ sẵn các món này: chúng phải là sprite động để người chơi xem thử, đặt/cất và không bị nhân đôi.

Nguồn sen hiện có được dùng làm chuẩn chất lượng và ưu tiên tái sử dụng thay vì vẽ một chậu khác kém đồng bộ. Khi đặt cạnh hiên, chỉ cho một món tại mỗi vị trí, thay món đang có theo cơ chế cất/đặt hiện tại; không vẽ đè lên lu/chậu hoa cũ. Không tự đổi vị trí đã lưu của người chơi.

### Hàng xóm

Giữ **tối đa 12 người, sáu nhà/trang**, bao gồm nhà của chính người chơi. Giữ năm bậc tài sản theo `neighborHouseTier`: mặc định, trên 500, trên 1.000, trên 5.000, trên 20.000. Level vẫn tách khỏi tài sản; trang trí không biến nhà nghèo thành nhà của bậc cao hơn.

Chỉ thêm điểm nhấn nhỏ vào cổng/hiên của nhà đang dùng chủ đề; không đồng loạt gắn sen cho cả làng hoặc đặt sân lễ giữa đường. Biển tên thật tiếp tục vẽ bằng code và `fitGateName`, không bake tên trong sprite. Ô biển trống trong concept là vùng dành cho tên, không phải đề xuất bỏ tên. Không áp hệ vị trí Vườn nhà trực tiếp lên tọa độ Hàng xóm: cần module gắn theo từng footprint nhà.

## Ràng buộc để xuất production sau duyệt

| Hạng mục | Ràng buộc |
| --- | --- |
| Chậu sen | Ưu tiên sprite `lotusPot` đã có; footprint hiện tại rộng 41 đơn vị world, giữ baseline và bóng phù hợp |
| Đèn tre | Giữ footprint `bambooLamp` rộng 39; tua không che biển tên hoặc người đi. Không tự biến món đứng đất thành vật treo trên mái |
| Hàng rào/cổng | Một họa tiết nhỏ trên trụ, giữ module và bề rộng lối vào; không thêm vật cản |
| Bàn quà, nếu duyệt | Dựng source riêng và đo cạnh nhân vật/cây tại vị trí thật trước khi xuất atlas; chưa cam kết footprint hoặc điểm đặt mới |
| Dấu kỷ niệm | Icon nhỏ trong trang kết quả; không tự phát thêm xu/phiếu hoặc tạo quyền sở hữu mới |
| Nguồn và runtime | Source alpha riêng → chuẩn hóa từng frame → thử cạnh sprite hiện hành ở 1×/4×; không lấy thumbnail concept làm sprite |

Các vị trí hiện có nằm trong `gardenDecorSpots`. Concept không chốt việc gắn đèn vào cột nhà: nếu muốn vật treo, cần xác định anchor riêng và duyệt đúng ảnh trên Canvas trước khi làm. Giai đoạn production không được âm thầm thay bản được duyệt bằng các hình thủ tục đơn giản hoặc đổi cả bố cục.

## Tiến độ và nghiệm thu tiếp theo

- Đã đọc skill game-pixel-art và chuẩn UI, đối chiếu slot trang trí, bậc tài sản và phân trang hàng xóm từ source.
- Đã chụp hai Canvas baseline với fixture làng 12 người, tạo một bảng concept và một trang đối chiếu. Chỉ giữ các file có tham chiếu ở tài liệu này; chưa thêm gì vào `public`.
- Trang đối chiếu kiểm tra bằng Edge ở 1440×1000, 844×390 và 568×320: ba ảnh tải đủ, không tràn ngang. Hai baseline 640×384, bảng concept 1568×1003; ba PNG khoảng 4,33 MiB. Không sinh thêm bộ screenshot QA cho trang tài liệu này.
- Chưa thử bộ sprite mới ở runtime, chưa kiểm thời tiết/mưa/sương, alpha, va chạm hoặc tên dài với chủ đề mới vì chưa xuất asset. Ảnh baseline chỉ là vùng camera đang nhìn, không phải chứng minh đã thấy đủ 12 nhà trong một khung.
- Không đổi engine/save/API/giá, không chạy lại kiểm thử engine cho thay đổi chỉ có tài liệu và ảnh.

**Bước sau duyệt:** P3.2 xuất gói tối thiểu theo đúng hướng chốt; nối vào cơ chế xem thử đã có. Trước production phải có ảnh Canvas đối chiếu ngày/mưa/sương, đủ hai trang hàng xóm, năm bậc nhà, tên dài và mobile. Chưa bắt đầu trang kỷ niệm P3.4 hoặc thanh toán; pilot vẫn chưa có dữ liệu người chơi.

Điểm dừng duyệt theo P3.1 trong lộ trình: “Người dùng duyệt bố cục trước xuất sprite.” Đây là yêu cầu của mốc kế hoạch, không phải yêu cầu thêm API key hay cài công cụ.

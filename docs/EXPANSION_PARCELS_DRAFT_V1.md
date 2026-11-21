# Phác thảo khu mở rộng V1 — đã duyệt

Người dùng đã duyệt và yêu cầu triển khai. Thông số cuối cùng và kết quả kiểm tra
được ghi tại [bố cục V7](HOMESTEAD_LAYOUT_V2.md). Các thông số dưới đây là bản đề xuất ban đầu.

Ảnh: [Phác thảo V1](assets/expansion-parcels-draft-v1.png).
Ảnh tập trung khu mở rộng; các luống chính bổ sung đang có trên runtime chưa
được thể hiện đầy đủ ở vùng chuyển tiếp phía trên. Khi triển khai phải giữ
chúng và dành lại vùng chuyển tiếp thích hợp, không xóa ô đang sở hữu theo ảnh.

## Mục tiêu

Tám mảnh dùng cùng ranh giới, bố trí hai cột × bốn hàng. Vườn, chuồng và ao
khác phần nội thất, không khác diện tích bao ngoài. Giữ khu nhà và ao chính;
mở bản đồ về phía nam để tránh thu nhỏ cây, vật nuôi hoặc ép lối đi.

Thông số để thử trong Canvas sau khi duyệt: mỗi mảnh 190 × 100 đơn vị thế giới,
hai cột cách nhau 56 đơn vị, giữa các hàng có lối tiếp cận 16 đơn vị. Nếu giữ
hàng đầu ở y=375, hàng cuối kết thúc ở y=823; chiều cao map cần khoảng 880–900
để có vành cảnh quan. Đây là thông số thử nghiệm, chưa phải kích thước chốt.

## Nội dung minh họa

| Hàng | Mảnh trái | Mảnh phải |
| --- | --- | --- |
| 1 | 1: vườn 3 × 2 luống | 2: chuồng gà |
| 2 | 3: chuồng cừu | 4: ao |
| 3 | 5: vườn 3 × 2 luống | 6: chuồng trâu |
| 4 | 7: đất chưa mở, cỏ và bụi thấp | 8: vườn có hàng luống nâng cấp |

Đây là cách phối loại đất để kiểm tra thẩm mỹ; người chơi vẫn tự chọn công năng,
không bị buộc chuyển những mảnh đã mua sang công năng trong hình.

Vườn giữ ba ô đang sử dụng, có thể nâng cấp thêm ba ô thành 3 cột × 2 hàng.
Chuồng có mái che ở góc sau và sân phía trước. Ao có bờ tự nhiên nằm trong
ranh giới chung, không cần hàng rào chữ nhật quanh mặt nước. Lối chính ở phía
tây được giữ thông; cửa mảnh hướng ra lối tiếp cận. Rào trước phải sắp lớp theo
chiều sâu như hiện tại. Cây lớn và đồ trang trí không che cửa, luống hay vật nuôi.

## Điều kiện triển khai sau khi duyệt

- Giữ chỉ số tám mảnh, quyền sở hữu, hàng rào, loại đất và vật nuôi đang có.
- Giữ nguyên ID ba ô trồng cũ; cấp ID riêng cho ô mới. Không thay hệ số `*3`
  thành `*6` trực tiếp vì sẽ xung đột dải ID ô vườn chính và dữ liệu lưu.
- Chưa tự tăng sản lượng hoặc sức chứa chuồng. Thiết kế giá/điều kiện nâng cấp
  ba ô mới riêng; lưu trạng thái mở khóa và kiểm tra trên máy chủ.
- Rà camera, giới hạn map, nền, va chạm, hotspot, đường `world.approach()`,
  thăm vườn người khác, lưu/tải và thao tác hàng loạt theo ranh giới mới.
- Kiểm tra Canvas ở 640 × 384, cả cừu/trâu và cây cao; không dựa riêng vào concept.

## Cách tạo bản vẽ

Dùng built-in imagegen với ảnh tham chiếu `assets/homestead-life-runtime-v6.png`.
Prompt: bản concept pixel-art nông thôn Việt Nam, giữ kiến trúc và bảng màu của
map hiện tại, mở rộng phía nam, đúng tám mảnh bằng nhau theo lưới 2 × 4;
vườn sáu luống 3 × 2, mái chuồng góc sau và sân rộng, ao bờ đá tự nhiên,
đất chưa mở có cảnh quan thấp, lối đi thông thoáng, đánh số 1–8 theo hàng.
Ảnh minh họa thể hiện hướng mỹ thuật, không phải ảnh chụp runtime hoặc bản đo.

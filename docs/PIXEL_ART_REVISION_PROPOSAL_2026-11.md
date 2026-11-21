# Bản phác thảo duyệt mỹ thuật: cây trồng và chuồng chính

**Trạng thái:** đã hoàn thiện; atlas V1–V3 được giữ nguyên để so sánh.  
**Ngày:** 21-11-2026

## Vấn đề quan sát được

### Cây cà phê, thanh long, sen và nếp cẩm

Các cây mới hiện dùng atlas 4 giai đoạn `progression-crops-v2.png`, mỗi ô 48 × 48. Ảnh nguồn có đủ alpha và hình dáng riêng, nhưng độ phong phú của mảng lá, độ dày thân, điểm sáng và texture chưa đạt mức của các cây bắp, cà rốt và lúa mì trong atlas dọc. Khi thu về kích thước chơi, thân thanh long và nếp cẩm đặc biệt mảnh; các mốc trưởng thành cũng chưa tạo cảm giác cây lớn lên bằng cấu trúc mới. Đây là vấn đề mỹ thuật và độ đọc hình, không phải thiếu số frame.

Đích tham chiếu là hình khối tròn, tán lá phân lớp, sáng ấm từ phía trên-trái, mặt tối xanh-teal, đất nâu có khối và chi tiết vụ mùa dễ nhận ra. Mỗi cây cần thay đổi hình thái ở cả bốn mốc, không chỉ cao/lớn dần.

### Chim trong chuồng chính

Trong `world-layout.mjs`, chuồng cấp dưới 4 xếp vật nuôi thành 3 cột; sức chứa ở các cấp này tối đa 6 nên không tự tạo ra hàng thứ tư. Từ cấp 4 trở lên, bố cục chuyển sang 4 cột, cách hàng 36 đơn vị. Hàng thứ ba đặt chân ở `y=198`, chỉ cách cạnh dưới chuồng `y=201` ba đơn vị; hai thanh rào trước đi qua khoảng `y=197–200` nhưng được vẽ phía sau actor. Vì vậy chân/thân chim đè lên thanh rào và tạo cảm giác chim ở ngoài chuồng. Chim cút còn nhỏ hơn đáng kể: renderer vẽ loài này ở 18 × 16 đơn vị. Đây là vấn đề khoảng cách mép và thứ tự lớp vẽ, không phải chỉ cần tăng sức chứa hay dời cả đàn vào một chuồng khác.

## Phác thảo tạo hình cây — bốn mốc cho từng giống

| Giống | 1 · Nảy mầm | 2 · Lớn lên | 3 · Trổ nụ / kết hạt | 4 · Thu hoạch |
| --- | --- | --- | --- | --- |
| **Cà phê** | Chồi kép có hai lá dày | Thân gỗ ngắn, vài cặp lá đối xứng | Tán bụi phân tầng, lấm tấm quả xanh | Bụi tròn đầy, cụm quả đỏ rõ ở mặt trước |
| **Thanh long** | Mầm mọng ngắn | Một nhánh bẹ dày, gợn cạnh rõ | Nhiều bẹ phân nhánh, tựa giàn tre thấp | Bẹ xanh dày trên giàn; vài trái hồng lớn, tai quả xanh đọc được ở 48 px |
| **Sen** | Mầm trong luống nước nâu ẩm | Hai lá nổi lớn, cuống rõ | Lá nhiều tầng và nụ hồng dựng cao | Hoa sen hồng kem nở, thêm gương sen làm dấu hiệu vụ mùa |
| **Nếp cẩm** | Hai lá mạ | Bụi mạ rộng, nhiều lá cong | Thân vươn và bông tím bắt đầu trĩu | Cụm bông dày tím sẫm, hạt sáng lấm tấm, lá vẫn giữ khối xanh |

Các hình sẽ dùng chung độ cao đế đất và đường sáng, nhưng khác hẳn silhouette để không lẫn giống. Chi tiết nhỏ được ưu tiên theo thứ tự: hình cây, cụm quả/bông, mảng sáng-tối, rồi mới đến gân lá. Bản nguồn vẽ ở độ phân giải cao, sau đó thu riêng từng frame về 48 × 48 để kiểm tra nét ở kích thước game.

## Phác thảo bố trí chuồng chính

Giữ nguyên khung cảnh và lối đi. Bên trong chuồng, dùng lưới **4 cột × 3 hàng** từ lúc chuồng vượt sức chứa 6 con; với cấp tối đa 14–16 con, chuyển sang **4 × 4** thay vì để các hàng tràn qua mép. Đặt chân của 3 hàng ở khoảng `y=125`, `153`, `181`; khi cần hàng thứ tư, phân bố lại thành khoảng `y=121`, `143`, `165`, `187`. Như vậy đàn cách cạnh trước tại `y=197–200` và nằm gọn trong sân:

```text
          cạnh sau
       ●     ●     ●     ●       hàng 1
       ●     ●     ●     ●       hàng 2
       ●     ●     ●     ●       hàng 3
       ●     ●     ●     ●       hàng 4 khi chuồng có 14–16 chỗ
          cạnh trước / cửa
```

Render dự kiến: chim cút tăng từ 18 × 16 lên khoảng **23 × 21** đơn vị; gà giữ silhouette atlas riêng và tăng khoảng cách theo kích thước thật. Giữ actor trong vùng rào an toàn; vẽ cạnh trước sau thân vật nuôi để tạo chiều sâu, nhưng chỉ che phần chân sát nền, không phủ thân. Nếu có vật nuôi lớn trong cùng chuồng, dùng bố cục riêng theo nhóm kích thước để không thu nhỏ trâu/bò theo lưới của chim.

## Phạm vi thực hiện sau khi duyệt

1. Vẽ lại bốn giống theo cùng chuẩn nguồn trong `docs/assets/`, giữ atlas cũ để so sánh.
2. Xuất atlas runtime 48 × 48, cập nhật bounds riêng nếu cần; kiểm tra alpha, baseline và đủ bốn silhouette.
3. Sửa vị trí trong chuồng theo số lượng/cấp chuồng, tăng kích thước chim cút, và chỉnh lớp vẽ cạnh rào trước.
4. Chụp bảng đối chiếu ở 1× và 4× cạnh bắp, cà chua, cà rốt, chim cút và trâu; kiểm tra sức chứa tối đa 16 con để xác nhận không con nào vượt rào.

## Điều kiện duyệt

- Bốn cây mới trông cùng một bộ với bắp/cà rốt ở kích thước 48 × 48; mỗi mốc đều đọc được và mốc cuối nhìn ra đúng nông sản.
- Chim cút có khối lượng thị giác gần gà con, không còn như chấm nhỏ; cả 16 vị trí vẫn nằm trong rào và cửa chuồng thông thoáng.
- Bản nguồn và ảnh so sánh được trình bày trước khi thay ảnh runtime.

Đã hoàn thiện atlas V4 runtime 48 × 48 tại `public/pixel/progression-crops-v4.png`; bản nguồn alpha 768 × 768 và bảng đối chiếu 4× nằm trong `docs/assets/`. V1–V3 được giữ lại. Thời tiết tiếp tục tác động riêng đến tốc độ lớn và sản lượng của từng giống; exposure được cộng dồn ổn định qua các lần chuyển thời tiết. Lưới chuồng đã được căn lại, cút tăng lên 23 × 21, thanh rào trước vẽ sau đàn và kiểm tra vị trí đủ 16 con.

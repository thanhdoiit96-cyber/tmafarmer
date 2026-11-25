# Bảng chọn hạt giống V1

**Bản lịch sử.** Bố cục danh sách dưới đây đã được thay bằng [ô vật phẩm V2](GAME_UI_V2.md), gồm 6 ô/trang desktop và 3 ô/trang mobile. Giữ tài liệu/ảnh V1 để đối chiếu thiết kế; hành vi xem thông tin và luật gieo vẫn được kế thừa.

Ngày: 25/11/2026. Phạm vi: danh sách giống khi chọn ô trống trong Vườn nhà, theo yêu cầu tách rõ đã mở/còn khóa và hỗ trợ chuột, bàn phím, chạm. Giữ style `game-pixel-art`, ảnh cây từ atlas đã có và nền giấy kem/xanh. Chưa commit, push hoặc deploy.

## Bố cục

```text
Chọn hạt giống                               Ô 1
[Đã mở · số giống]        [Còn khóa · số giống]

[Ảnh + tên + số hạt + đặc tính + trạng thái] [Gieo]
[Ảnh + tên + 0 hạt + đặc tính + Hết giống] [Tìm giống]

[Trang trước]          Trang N/M          [Trang sau]
```

Hai nhóm hiển thị riêng, không trộn các nút dài ghi lỗi mở khóa vào nhóm có thể trồng. Nhóm đã mở ưu tiên giống còn trong túi, sau đó theo thời gian cơ sở tăng dần. Nhóm khóa sắp theo cấp Xưởng, XP và thời gian cơ sở; đây là thứ tự hiển thị, không phải cam kết giống nào dễ mở nhất.

Desktop: 3 dòng/trang. Màn hình rộng tối đa 760px hoặc chế độ điện thoại ngang: 2 dòng/trang. Không xếp toàn bộ catalog vào một danh sách cuộn dài. Vùng công cụ vẫn có thể cuộn theo bố cục chung, nhất là khi bàn phím/hộp thông tin đang mở.

Trạng thái phân biệt bằng chữ và màu: đã mở/có hạt xanh, đã mở/hết giống kem vàng, còn khóa nâu trung tính có nhãn Khóa. Giống khóa vẫn giữ nguyên ảnh minh họa và số hạt thực có. Có hạt không có nghĩa đã đủ điều kiện gieo.

## Tương tác

- Desktop: rê chuột trên ảnh/tên xem nhanh số lượng, thời gian cơ sở, sản lượng cơ sở, đặc tính thời tiết và từng điều kiện hiện có/cần. Tooltip không mất khi poll cập nhật game. Click mở hộp chi tiết.
- Bàn phím: Tab tới ảnh/tên để đọc tooltip, Enter mở chi tiết, Escape đóng tooltip/hộp theo hành vi hiện có. Điều khiển dùng button thật và có nhãn trạng thái/số lượng.
- Điện thoại, gồm màn hình ngang: chạm ảnh/tên mở hộp chi tiết có thể cuộn; không phụ thuộc hover. Mục chi tiết và Gieo là hai nút riêng, không lồng nhau. Mục tiêu chạm tối thiểu 44px.
- Hộp chi tiết hiển thị số hạt, đặc tính, mô tả, cách có giống, 4 giai đoạn phát triển và toàn bộ điều kiện mở khóa cùng nút tới công trình/tiến độ của P0.3.
- Gieo tiếp tục qua `world.approach('plot', index, ...)` và engine hiện có. Xem thông tin, đổi nhóm, sang trang không gieo hoặc tiêu tài nguyên.
- Hết hạt: “Tìm giống” đi tới đúng quầy vật tư và lọc tên giống tại chợ, không tự mua. Đất chai vẫn yêu cầu cuốc trước khi mở danh sách.

## Mã và giới hạn

`public/seed-picker.mjs` tạo catalog và phân trang từ `crops`, `goods`, `cropWeatherProfiles` và `unlockGuide`. Trạng thái khóa tiếp tục lấy điều kiện engine. Không đổi giá, sản lượng, thời gian, luật gieo, ID ô đất hoặc schema lưu game. Bộ chọn nhóm/trang là trạng thái giao diện trong phiên, không thêm lựa chọn lưu server.

Các số thời gian/sản lượng là **cơ sở**, không phải ETA chắc chắn; thời tiết, độ ẩm và chăm sóc vẫn ảnh hưởng theo engine. Bản này không thay thế công việc P1.2 về giải thích ETA toàn game.

## Kiểm chứng

- 144 bài kiểm thử đạt, gồm sở hữu hạt nhưng vẫn khóa, phân trang không sót/lặp giống, mở hết catalog và ưu tiên giống có sẵn; không sửa dữ liệu vườn.
- Build, audit asset và đối chiếu catalog gameplay đạt.
- Trình duyệt thật: hover qua một vòng poll; Tab/Enter xem tooltip và chi tiết; mở mô tả/điều kiện; thao tác chạm thật ở 844×390; không tràn ngang ở 390px; xem không tiêu hạt, bấm Gieo chỉ tiêu đúng một hạt. Nút Tìm giống lọc đúng loại ở quầy vật tư và không tự mua.
- Ảnh runtime: [desktop](assets/seed-picker-v1-desktop.png), [hover](assets/seed-picker-v1-hover.png), [nhóm khóa](assets/seed-picker-v1-locked.png), [ngang](assets/seed-picker-v1-landscape.png), [chi tiết ngang](assets/seed-picker-v1-landscape-detail.png), [dọc](assets/seed-picker-v1-mobile.png).

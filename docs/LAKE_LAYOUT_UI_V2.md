# Hồ làng — xưng hô, lối vào, chòi và UI V2

> Tỉ lệ camera và vị trí chòi/Ông Sáu đã thay bằng [V3](LAKE_LAYOUT_SCALE_V3.md). Các tọa độ dưới đây là lịch sử V2.

26/11/2026. Hoàn thiện trong source theo phản hồi người dùng; chưa commit/push/deploy. Chưa kết luận gameplay/pilot; chờ người dùng đánh giá sau thay đổi này.

## Những gì đã đổi

| Phần | Trước | Hiện tại |
| --- | --- | --- |
| Xưng hô | Gọi mọi nhân vật là cháu | Theo tuổi và giới tính của avatar đang chọn |
| Điểm vào ao | (36,309), bờ trái | (365,377), lối giữa bờ phía nam; cả chuyển cảnh bằng menu và lối ra Vườn nhà |
| Ông Sáu | (260,365), giữa đường | (542,398), trong chòi ở mép cỏ bên phải |
| Tiếp cận NPC | (286,374) | (520,414), phía trước chòi, không đứng đè NPC |
| Chòi | Actor đơn giản đặt lệch ở (101,122) trên mặt ao | Chòi tre mái lá có alpha, (542,402), 106×100 world |
| UI | Đoạn văn/nút rời, tab chưa cùng cỡ | Ba tab đều nhau, thẻ hoạt động, đổi dấu hai cột, sổ cá ba hàng gọn |

Các tọa độ NPC V1 trong tài liệu cũ chỉ còn là lịch sử. V2 giữ nguyên toàn cảnh camera 720×432, hai bến, giếng, chỗ dọn bờ (326,350), polygon nước và quyền chơi hiện có.

## Lời thoại theo nhân vật

`lakeElderGreeting(weather, avatar)` lấy avatar đã được chuẩn hóa từ save hiện có, không suy tuổi từ tên tài khoản hoặc cấp farm.

| Người chơi | NPC gọi | Lời tạm biệt của người chơi |
| --- | --- | --- |
| Nam/nữ thanh niên | cháu | Cháu chào ông, cháu đi nhé |
| Nữ trung niên | cô | Chào bác Sáu, tôi đi nhé |
| Nam trung niên | chú | Chào bác Sáu, tôi đi nhé |
| Nữ cao tuổi | bà | Chào ông Sáu, tôi đi nhé |
| Nam cao tuổi | ông | Chào ông Sáu, tôi đi nhé |

Áp dụng cả đầu câu viết hoa và mọi loại thời tiết. Đổi avatar rồi mở lại hội thoại sẽ dùng cách gọi mới; không lưu lời thoại cố định vào farm. Avatar cũ/không hợp lệ dùng quy tắc fallback hiện có, không làm lỗi game. Lời thoại không phát thưởng hoặc thay quota.

## Chòi và đường đi

Mái lá và cột tre theo skill `game-pixel-art`/`imagegen`, dùng background ao làm tham chiếu. [Nguồn RGBA](assets/lake-shelter-source-v1.png) xuất qua `scripts/normalize-lake-shelter.py` thành `public/pixel/lake-shelter-v1.png`: 106×100, alpha chỉ 0/255, nền giữa các cột trong suốt, baseline 98. Không bake NPC vào chòi.

Chòi render ở lớp phía sau NPC/người đứng trước, để nền sàn không che chân người; đầu NPC nằm dưới mái. Chỉ hai cột có block nhỏ, lòng chòi vẫn đi được. Điểm trò chuyện nằm trước sàn, trong tầm 31 world unit. Vị trí này tránh đường giữa và lối lên bến phải. Mái là bối cảnh trú chân, không thêm cơ chế che mưa tăng chỉ số hoặc thay thời tiết.

Đã bỏ actor/chặn chòi cũ trên mặt nước; không thay bằng hình khối placeholder. Sprite người chơi, NPC và camera giữ tỷ lệ hiện tại.

## UI khu vực

- Đầu bảng gọn, nút Gặp Ông Sáu cùng cụm; tab Bến câu/Ven ao/Sổ cá rộng đều.
- Bến câu dùng một thẻ, lượt còn lại dạng badge, thông báo thời tiết và nút câu/kéo cần hiện có.
- Ven ao hiển thị dấu/thức ăn/lọ thành một hàng thông tin ngắn. Thẻ dọn có trạng thái, tiến độ khi đang làm và lý do bị khóa/đã làm. Hai gói đổi đặt cạnh nhau, nêu rõ thiếu dấu, chưa đủ cấp, túi đầy hoặc đã đổi hôm nay.
- Sổ cá có tiến độ số loài, mỗi loài một hàng, trạng thái chưa gặp/đã câu; quà kỷ niệm nằm trong thẻ riêng. Không lặp các đoạn giải thích dài.
- Màu giấy, viền gỗ, cỡ chữ và nút dùng cùng hướng UI Kho/Chuồng hiện tại; ảnh nền game không đổi độ tương phản trong bước này.

Không thay giá, tỷ lệ cá, thời gian chờ/hồi, quota dọn/đổi, chi phí giúp, sâu nghịch hoặc phần thưởng. Các nút tiếp tục gọi action cũ và `world.approach()`.

## Kiểm chứng

- 189/189 kiểm thử đạt; ma trận sáu avatar × bảy thời tiết kiểm tra cách gọi và lời tạm biệt, không sót “cháu” với trung niên/cao tuổi. Kiểm tra spawn menu/lối vào dùng cùng điểm; các bến/giếng/chỗ dọn/NPC vẫn đi tới được, lòng chòi mở và cột chặn đúng.
- Edge/Chromium: nhân vật ông lão xuất hiện ở (365,377), đi tới chòi rồi mới chào đúng, không còn “cháu” trong dialog. E, chạm NPC và mở đúng tab hoạt động đạt. Đã xem Canvas và UI thật; 844×390/568×320 không tràn ngang hoặc lỗi JavaScript. Kiểm tra hội thoại giữ nguyên vật tư/xu/XP/quota.
- Build, audit asset, kiểm tra tài liệu gameplay đạt. Public asset 22,66 MiB, không thiếu hoặc unused asset; ảnh nguồn không đóng gói vào game.
- Chưa thử Safari iOS/Android thật. Chưa có kết quả đánh giá gameplay từ người chơi; [pilot](SOCIAL_LAKE_PILOT_V1.md) vẫn là bước sau.

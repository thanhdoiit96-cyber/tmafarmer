# Nâng cấp chuồng phụ

Hoàn thiện source ngày 25/11/2026, chưa deploy.

## Người chơi

Tại **Nông trại → Đất**, chọn ô chuồng. Bên dưới danh sách vật nuôi có nút **Nâng lên 4 chỗ · 160 xu**. Yêu cầu chuồng chính cấp 2; mỗi chuồng phụ nâng riêng. Cấp 1 có 2 chỗ, cấp 2 có 4 chỗ và là mức tối đa hiện tại. Khi chưa đủ cấp, bảng hiển thị điều kiện; khi thiếu xu, nút bị khóa.

Nâng cấp chỉ mở thêm chỗ tại ô đó. Điều kiện đón loài vẫn theo chuồng chính và XP. Không đổi chi phí xây chuồng ban đầu, sản lượng hay thức ăn.

## Source và save

- Dùng bảng `parcelCoopLevels` trong `public/land.mjs`; UI, kiểm tra đón con và chuyển chuồng đều đọc cùng sức chứa.
- Lưu `coopLevel` trên entry đất. Save không có trường này mặc định cấp 1; không migration database, không đổi ID hoặc di chuyển con đang có.
- Action `upgradeParcelCoop` kiểm tra loại ô, chỉ số, cấp, xu và giới hạn tối đa tại engine. Chỉ trừ xu sau khi điều kiện đạt. Giữ các thuộc tính hàng rào của ô.
- Chuồng chính giữ sức chứa hiện có; nâng nó không tự nâng chuồng phụ.
- Chuồng mở rộng dùng hai vị trí sau bên phải mái và hai vị trí sân trước. Giữ atlas, kích thước chuồng và map; giảm quãng đi ở hai vị trí phía sau để đủ khoảng trống cho vật nuôi lớn. Dùng cùng bố trí khi hàng xóm ghé thăm, giữ luồng `world.approach()` hiện tại.
- Chưa thêm cấp cao hơn 4 chỗ: footprint hiện tại được kiểm chứng với bốn con trâu trưởng thành. Khi bổ sung cấp trong bảng phải có đủ vị trí và kiểm chứng sức chứa hiển thị tương ứng, không chỉ tăng con số.

## Kiểm chứng

- Toàn bộ 154 kiểm thử đạt; kiểm tra bổ sung API và chuồng phụ đạt sau khi thêm trường hợp chống lặp request.
- Save cũ, cấp/tiền không đủ, sai ô, vượt cấp tối đa, đủ 4 con rồi từ chối con thứ 5, chuyển con vào ô index 0 và serialize/reload đều được kiểm thử.
- Own/neighbor scene: bốn con trâu trưởng thành có vị trí hữu hạn, đường đi tiếp cận được; lấy mẫu chuyển động để kiểm tra không ra khỏi ô, chồng lên thân nhau hoặc mái chuồng.
- API thật với DB in-memory: request nâng cấp đồng thời cùng requestId chỉ trừ tiền một lần; tải lại giữ cấp và rào, nâng quá mức bị từ chối.
- Build và asset audit đạt; không thêm atlas/ảnh runtime. Runtime Chromium kiểm tra nâng cấp, đón thêm, reload và mobile ngang không tràn; chưa kiểm tra Safari thật.
- Giữ một ảnh chứng minh, dọn build và profile sau kiểm tra.

[Ảnh runtime — bốn trâu trưởng thành](assets/parcel-coop-upgrade-v1-runtime.png)

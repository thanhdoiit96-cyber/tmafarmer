# Hàng xóm đa tương tác và Ao làng — phác thảo V1

Cập nhật mới hơn: người dùng yêu cầu nghịch bật sẵn và bỏ nút bật/tắt. [Runtime V2](NEIGHBOR_VISIT_UI_V2.md) đã thực hiện, giữ các bảo vệ và quota. Đề xuất opt-in bên dưới chỉ giữ làm lịch sử thiết kế.

**Định hướng mới theo yêu cầu người dùng:** giữ toàn bộ lấy trộm hiện tại; phát triển giúp nhau và nghịch vui **song song trong cùng làng**. Không chọn Thân thiện/Tinh nghịch làm hai chế độ loại trừ nhau. Bản này thay [đề xuất tách chế độ trước đó](FRIENDLY_VILLAGE_DRAFT_V1.md).

Trạng thái 26/11/2026: giúp tưới, việc ven ao, đổi thức ăn và sổ cá đã triển khai trong source; xem [runtime đầu](SOCIAL_LAKE_V1.md). Phần sâu nghịch có đồng ý/giới hạn và đổi lọ cũng đã có trong source; xem [quy tắc và kiểm chứng](PRANK_PLAY_V1.md). Chưa deploy. Bản mẫu dưới đây vẫn bao gồm các hướng dài hạn chưa triển khai; thông số runtime xem hai tài liệu trên.

[Mở bản mẫu tương tác](assets/social-lake-draft-v1.html). Không gọi API hoặc lưu vào game; dùng hình nền hiện có. Không thêm PNG/atlas để tránh phình dự án.

## Vòng chơi mong muốn

Ra Ao làng → câu/ghi sổ cá hoặc làm một việc ven ao → nhận dấu ven ao có giới hạn → đổi thức ăn hoặc lọ sâu nghịch. Ghé cùng một hàng xóm có thể lấy một món theo luật cũ, giúp ô đang cần chăm và nghịch một ô đủ điều kiện; ba loại hành động không khóa nhau thành phe/chế độ.

Không ép ghé ao để được trồng/chăn nuôi. Không mở bảng xếp hạng phá hoại, thưởng thiệt hại hoặc thưởng trả đũa. Các việc có thể làm được trình bày theo bối cảnh, tránh biến ao thành dãy nút nhận quà hàng ngày.

## 1. Giữ lấy trộm hiện tại

Giữ nguồn vườn/kho, câu trộm ao, hạn mức cá nhân/từng chủ vườn/toàn làng, cổng và hàng rào như engine hiện có. Không tự hoàn đồ đã lấy, không cho hành động giúp xóa lượt lấy hoặc giảm lịch sử an ninh.

Túi ghé vườn và rào bảo vệ vẫn có công dụng cũ. Chế độ hai lựa chọn, biểu quyết đổi làng và vô hiệu hóa đồ chống trộm trong phác thảo trước **không còn triển khai**.

## 2. Hành động thiện — giúp việc đang cần

Lát cắt đầu: **giúp tưới**. Sau khi flow ổn mới thêm nhổ cỏ/xử lý sâu tự nhiên, dùng vật tư của người giúp nếu cần; không thu hoạch hoặc bón thay vì có thể làm mất lựa chọn giữ giống/kế hoạch của chủ vườn.

| Quy tắc dự kiến | V1 |
| --- | --- |
| Lượt giúp thành công/người/ngày game | 3 |
| Giúp cùng một chủ vườn/ngày game | Tối đa 2 |
| Lượt giúp một chủ vườn nhận/ngày game | 6, gộp mọi người |
| Cùng một ô | Chỉ khi thật sự cần chăm; tưới đủ ẩm rồi không tưới tiếp được |
| Quyền của chủ vườn | Mặc định nhận giúp tưới, có thể tắt; thao tác đang chờ phải kiểm tra lại |
| Chi phí | Chỉ trừ chỉ số/vật tư của người giúp theo hành động; không lấy từ túi chủ |
| Phần thưởng V1 | Lời cảm ơn/ghi nhận ngắn, chưa cộng xu/XP/phiếu mới |
| Lấy trộm | Lượt giúp riêng, không dùng hoặc hoàn quota lấy cũ |

Tưới dùng thời hạn ẩm và quy tắc hiện có, không cho tăng tốc vượt mức khi nhiều người giúp. Không giúp ô trống/chín hoặc ô đã đủ ẩm do mưa. Server xác thực người giúp, chủ vườn, plot ID gồm ô mở rộng, điều kiện và vị trí; không gọi action chăm cây của chính mình rồi đổi target ở client.

Giúp tưới không bảo đảm năng suất cuối tăng một tỷ lệ cố định vì tốc độ và khoảng phơi thời tiết cùng thay đổi; chủ vườn muốn tự điều khiển thời điểm tưới có thể tắt nhận giúp. Không thưởng xu/XP theo số lần giúp trong V1 để tránh biến tưới qua lại thành vòng farm.

Sổ tương tác ngắn có tên người giúp, ô và việc đã làm, gộp thông báo trong cùng lần ghé; không popup dồn khi người chơi quay lại. Chủ có thể gửi một cảm ơn mỗi tương tác; không sinh vật phẩm hoặc yêu cầu phải đáp lễ.

## 3. Nghịch vui — thả sâu có giới hạn

### Hiệu ứng riêng, không dùng sâu tự nhiên

`pests/pestPeak`, `weeds/weedPeak` hiện làm giảm năng suất không phục hồi. Không sửa trực tiếp các field này khi người khác chọc phá.

Đề xuất tách `prank` khỏi nguy cơ cây:

- Lọ sâu nghịch làm tốc độ của **một ô** giảm 10%, tối đa 3 phút thực, sau đó tự hết. Không lây sang ô khác, không giết cây, không làm hỏng giống/vật nuôi/ao.
- Không cộng vào sâu tự nhiên hoặc mức đỉnh gây mất sản phẩm. Chủ có nút **Bắt sâu nghịch** miễn vật tư để kết thúc ngay, không cần thuốc trừ sâu.
- Nếu người bị nghịch không mở game, hiệu ứng vẫn tự hết theo server time; không chờ họ đăng nhập mới chạy ba phút.
- Tác động tương đương tối đa 18 giây tiến độ ở cùng tốc độ nền trong cửa sổ ba phút; không cam kết thời điểm thu thực tế chỉ chậm đúng 18 giây khi thời tiết/tốc độ khác đổi.
- Không hứa “sản lượng cuối không bao giờ đổi”: thời tiết sản lượng được tích lũy theo thời gian tăng trưởng, nên độ trễ có thể gián tiếp đổi phân bố thời tiết/làm tròn. V1 chỉ bảo đảm **không có hình phạt mất sản phẩm trực tiếp do sâu nghịch**. Nếu yêu cầu không có cả tác động gián tiếp, cần tách sổ thời tiết hoặc chọn hiệu ứng thuần hình ảnh trước khi code.

### Điều kiện và chống dồn phá

| Quy tắc dự kiến | V1 |
| --- | --- |
| Mở quyền thả/nhận | Cả hai đạt cấp nông trại 3, không phải chuồng cấp 3 |
| Chủ vườn nhận nghịch | Chủ động bật “Cho phép nghịch vui”; mặc định tắt cho hiệu ứng mới |
| Lấy trộm cũ | Không bị tắt bởi lựa chọn nhận nghịch; đây không phải lá chắn miễn phí |
| Người thả | Tối đa 2 lần thành công/ngày game |
| Cùng một chủ vườn | Một lần/người thả/ngày game |
| Người nhận | Tối đa 2 lần/ngày game, gộp cả làng |
| Đang chịu hiệu ứng | Tối đa 1 ô trong cả vườn; không chồng hoặc gia hạn |
| Sau hiệu ứng | Miễn nhận mới 30 phút thực, không reset khi tải lại/đổi ngày |
| Ô được chọn | Có cây, từ giai đoạn 2, tiến độ dưới 90%, áp lực sâu/cỏ tự nhiên dưới 20% |
| Cổng đóng | Không thả được; giữ ý nghĩa bảo vệ cũ |
| Vật tư | Một lọ cho một lần hợp lệ; giữ tối đa 2 lọ, không mua bằng xu/tiền thật hoặc bán/chuyển |

Tắt nhận nghịch kết thúc sâu nghịch đang có nhưng không trả lọ cho người thả; bật lại không xóa quota/miễn nhiễm. Không thể tự thả, đổi vườn/ô giữa lúc tiếp cận để bỏ guard hoặc dùng request cũ làm mới hiệu ứng. Không thưởng xu, XP, dấu hoặc tiến độ việc làng cho việc thả/bắt sâu nghịch; tránh hai tài khoản tự tạo vấn đề rồi farm thưởng giúp nhau.

Trong cùng làng, người đã giúp vẫn có thể lấy đồ hoặc nghịch nếu đủ điều kiện; không có phe tốt/xấu cố định. Giúp xử lý sâu tự nhiên có thể có sau, nhưng **bắt sâu nghịch** và **xịt sâu tự nhiên** phải là hai hành động được ghi nhãn khác nhau. Không dùng một icon/đoạn chữ khiến chủ tưởng sẽ mất 60% vụ thu nếu không online ngay.

Nghịch vui không làm giảm hoặc xóa số vụ lấy của `recordVillageTheft`; theo đề xuất V1 cũng không được ghi thành một vụ trộm làm đổi chuỗi ngày an ninh. Đây là sổ phụ với giới hạn riêng. Cần duyệt lựa chọn này, không lén trộn vào quota trộm cũ.

## 4. Ao làng — thêm giá trị mà không dời mọi chức năng về ao

Ao công cộng trong code là scene `lake`, khác các ao nuôi riêng. Hiện có câu công cộng, điều kiện thời tiết/cooldown, Giếng công cộng khi làng xây xong và Bến cá thêm lượt. Giữ chúng; không bán lại quyền cơ bản hoặc chặn bằng hệ mới.

### A. Bến câu — giữ cơ chế, làm rõ mục tiêu

- Câu như hiện tại: chờ 6 giây, cửa sổ kéo 55 giây, hồi 45 giây, 12 lượt thành công/ngày game và +2 khi có Bến cá.
- Gợi ý loại cá/ảnh hưởng thời tiết theo dữ liệu thật: cá chép vàng hiện 3%, mưa 4%, sương 2%; dông không thả mới. Không ghi “chắc chắn cá hiếm”.
- Không thêm mồi tăng tỷ lệ hoặc tăng giá cá trong V1; giữ kinh tế hiện có.

### B. Việc ven ao — một việc nhỏ có ý nghĩa

Lát cắt đầu: **nhặt rác bờ ao**, mở ở cấp nông trại 2. Một lượt hoàn thành/người/ngày game; khoảng 10 giây, có hoạt ảnh làm việc hiện có, thực hiện ở bờ chứ không bắt nhân vật đi vào nước. Đi xa/hủy trước khi xong không nhận thưởng, không mất lượt. Không chia thành 10 lần click.

Hoàn thành nhận **2 dấu ven ao**, giới hạn ví 6. Khi đầy, nút nói rõ cần dùng bớt; không âm thầm cắt phần thưởng hoặc tiêu lượt. Đây là điểm đổi riêng không giao dịch, không cộng tài sản/xếp hạng, không đổi trực tiếp thành xu.

Mỗi ngày game chỉ đổi tối đa một gói, chọn một:

| Đổi 2 dấu | Công dụng | Giới hạn |
| --- | --- | --- |
| 1 phần thức ăn thủy sản hiện có | Giúp nuôi ao riêng | Đủ túi; không phát thêm nếu request lặp |
| 1 lọ sâu nghịch | Một lần nghịch vui có điều kiện | Cấp nông trại 3, túi lọ tối đa 2 |

Hai lựa chọn không biến làng thành hai chế độ. Người chơi vẫn giúp bằng chỉ số/vật tư của mình, câu và lấy theo luật cũ; chọn gói chỉ là dùng một phần thưởng nhỏ. Không thêm bộ tiền tệ mua bằng tiền thật. Một phần thức ăn trị giá vật tư nhỏ, nhưng vẫn phải theo dõi lượng phát ra sau pilot; chưa chứng minh cân bằng chỉ bằng giới hạn ngày.

Không trừ dấu nếu túi/lọ đầy, chưa đủ cấp hoặc thao tác bị từ chối. Khi ví đầy mà còn 1 dấu trống, không cho làm việc rồi chỉ nhận 1/2 dấu mà không biết. Làng một người vẫn hoàn thành được việc này.

### C. Sổ cá — lý do quay lại không bắt phải nhận thưởng

Ghi ba loại câu công cộng thật hiện có: cá nhỏ, rô phi, cá chép vàng. Lưu lần đầu bắt được và tổng số; chỉ ghi khi kéo thành công ở hồ công cộng. Mua trên chợ, cá nuôi hoặc câu trộm không điền vào sổ này. Không tự cấp bộ sưu tập từ kho cũ vì không biết nguồn cá.

Hoàn thành đủ ba loài lần đầu cho vườn nhận **1 phiếu trang trí hiện có** làm kỷ niệm bến nước, không thưởng sản xuất hoặc tăng tỷ lệ cá. Một lần cho cả vườn, không theo ngày/thiết bị và không phát lại khi mở sổ, bỏ làng rồi vào lại hoặc gửi request lặp. Lưu trạng thái đã nhận cùng dữ liệu sở hữu vườn, không biến token/session đổi mới thành bộ sổ mới. Không reset ghi nhận khi nghỉ chơi. Chưa thêm loài mới cho đến khi có art cùng phong cách được duyệt; cá hiếm vẫn theo RNG hiện tại.

### Sau V1

Hẹn câu chung, thả cá, mùa cá hoặc trang trí bờ ao có thể làm sau. Không đặt mục tiêu sáu người vào làng chỉ có một người; nếu làm việc nhóm phải chốt nhu cầu theo quy mô tại lúc mở đợt và xử lý offline. Phần này cần nối P2.2, chưa nhồi thêm vào bản đầu.

## 5. Prototype cho duyệt

- Cùng vườn hàng xóm: ba nhóm Lấy / Giúp / Nghịch cùng tồn tại; chọn cây chín hoặc cây đang lớn để xem điều kiện từng nhóm.
- Thử chủ cho phép/tắt nghịch, thả một lần rồi bị khóa do hiệu ứng, bắt sâu nghịch không đổi mức sâu tự nhiên.
- Ao: Bến câu / Việc ven ao / Sổ cá; hoàn thành việc mô phỏng để nhận dấu, xem thiếu dấu/cấp/túi và đổi một gói.
- Nút “mô phỏng” chỉ phục vụ review; không có API, inventory thật, đồng hồ nền, RNG hoặc replay an ninh. Không coi prototype là chứng nhận server/cân bằng.

## 6. Thứ tự triển khai đề nghị

1. **Nền tương tác và Ao nhỏ:** hạn mức social riêng, bản ghi tương tác có giới hạn, idempotency/CAS; giúp tưới; việc ven ao/đổi thức ăn; sổ cá lấy dữ liệu lần kéo thành công và một phiếu kỷ niệm cho bộ đầu tiên. Giữ mọi action trộm hiện tại. Chưa có lọ nếu chưa bật phần nghịch.
2. **Sâu nghịch opt-in:** tách trạng thái/timeline khỏi sâu tự nhiên, tự hết/miễn nhiễm, quota nhận-thả, vật tư và cấp; sau khi test trường hợp đủ 12 người cùng nhắm một nhà mới bật đổi lọ.
3. **Mỹ thuật và cảm xúc:** dấu bờ ao, vật dụng tương tác hoặc NPC nếu cần; phác thảo gắn đúng bờ/cầu, không chiếm đường đi. Art mới duyệt nguồn trước, xuất atlas sau. Không repaint background rồi để hotspot lệch.
4. **Pilot rồi mở rộng:** đo lượt ao có hoạt động thật, giúp có ích, số chủ tắt nghịch, phản hồi bị dồn phá, lượng thức ăn phát và việc kinh tế có lệch không. Chưa thêm câu nhóm/thưởng trả đũa hoặc mua lượt.

## 7. Tích hợp và kiểm thử bắt buộc

- Schema version và limit định nghĩa chung, server quyết định. Thiếu state mới mặc định lấy trộm cũ, chưa cho phép nhận nghịch, không đoán lịch sử trợ giúp/cá.
- Tạo trạng thái theo ngày game server, không ngày máy; cooldown 30 phút và expiry 3 phút là thời gian thực độc lập reset ngày. Giữ miễn nhiễm qua hủy/bật/tắt.
- Chăm/lấy/đổi phải revalidate khi nhân vật đến đích qua `world.approach()`. Cùng ô đang có job Cô Lan, chủ tự tưới/thu hoặc hai khách cùng giúp phải chỉ một thao tác hợp lệ, không trừ vật tư/lượt lần thất bại.
- Vườn có hazard cỏ: sâu nghịch riêng không đổi hazard, pest/weed peak. Kiểm tra bước đầu/cuối phút, trước khi chín, phân bón, hết ẩm, trời đổi và tính bù 7 ngày so với chơi liên tục. Không snapshot nào kéo dài prank vì lấy `now` làm start mới.
- 12 khách dồn một nhà vẫn tối đa 2 prank nhận/ngày và 1 đang có; tân thủ, không đồng ý, đóng cổng, áp lực cao, ô ID 0/ô mở rộng đều được guard server.
- Hành động cấm/retry, ví 6 dấu, túi/lọ đầy, đổi hai gói đồng thời, reset ngày sát giây hoàn thành không nhân thưởng. Dùng ID job/ngày gốc để không nhận hai ngày từ cùng một việc.
- Sổ cá chỉ sau commit kéo thành công; kho đầy/cần hết hạn/đang câu trộm không tăng. Không dùng dữ liệu cá hiện có để hồi tố. Nhận phiếu kỷ niệm và đặt cờ đã nhận phải cùng transaction/CAS; hai thiết bị, retry và vào lại phòng không nhận hai lần. Không cộng phiếu nếu dữ liệu bộ sổ chưa đủ.
- Không giảm theft quota/peaceStreak từ việc tốt. Không đổi giá/cooldown/odds câu trước khi có cân bằng riêng được duyệt.
- Nhật ký social giữ ví dụ tối đa 30 mục gộp mỗi vườn; lịch sử cá chỉ counter/firstAt, không mọi lần kéo. Không lưu ảnh/bản sao cả farm hoặc profile browser sau kiểm chứng.
- Test Android ngang, Safari iOS, keyboard, tên dài, nhận 12 thông báo, còn đường đi trên bờ/cầu và giếng chưa xây. Chưa tuyên bố đã kiểm tra thiết bị thật.

## Những điểm cần chốt trước runtime

Các con số -10%/3 phút, quota 2 lần, opt-in mặc định tắt, ngưỡng cấp 3, ví 6 dấu và đổi 2 dấu là **bộ đề xuất đầu tiên**. Bản cập nhật này sửa hướng thiết kế theo yêu cầu, không áp các hình phạt hay phần thưởng mới vào save đang chơi. Cần duyệt bản mẫu trước khi thay kinh tế/timeline tăng trưởng và bối cảnh tương tác.

## Kiểm chứng bản mẫu

Đã kiểm tra cú pháp và Edge/Chromium: hủy lấy không tốn lượt, lấy xong vẫn giúp/nghịch được trên ô phù hợp; chủ tắt nhận nghịch không khóa lấy trộm; thả/bắt sâu nghịch giữ 12% sâu tự nhiên trong ví dụ, không trả lọ và giữ nhãn miễn nhận; hủy/hoàn thành việc ven ao, nhận dấu một lần; thiếu dấu/cấp, ví/lọ đầy, đổi một gói; câu mẫu ghi sổ; nhận kỷ niệm đủ bộ một lần, hủy không tiêu quyền nhận.

Không lỗi JavaScript hoặc tràn ngang tại desktop 1050 × 720, mobile ngang 844 × 390/568 × 320 và dọc 390 × 844; chạm bắt đầu/hủy việc đạt. Chưa kiểm tra Safari thật. Đây là kiểm tra UI mô phỏng, **chưa kiểm chứng quota, RNG hoặc guard server**; không chạy lại build/test gameplay vì chưa đổi runtime. Không thêm PNG và dọn ảnh/profile kiểm tra tạm.

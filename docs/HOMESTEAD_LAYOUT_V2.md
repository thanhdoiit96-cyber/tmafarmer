# Vườn nhà: bố cục đã duyệt và triển khai V2

## Khu mở rộng cân đối V7

Triển khai từ [phác thảo đã duyệt](EXPANSION_PARCELS_DRAFT_V1.md).
[Ảnh Canvas toàn cảnh](assets/expansion-runtime-v7.png) dùng bộ render thật của
game với dữ liệu mẫu; loại đất minh họa không ép thay đổi công năng đất đã mua.

- World 820 × 900; khu nhà/ao chính giữ nguyên tọa độ và tỷ lệ, không kéo giãn.
- Tám mảnh 190 × 100, hai cột tại x=260/506, bốn hàng y=395/511/627/743.
  Khoảng giữa cột 56, giữa hàng 16. Hàng đầu lùi thêm 20 so với đề xuất để
  giữ đủ vùng chuyển tiếp cho tất cả 30 luống chính và hàng rào của chúng.
- Chuồng, vườn và ao dùng chung ranh giới. Mái che sau-trái, hai vật nuôi ở
  sân trước, biên đi lại giữ cả trâu trưởng thành trong sân và tránh mái che.
  Sức chứa chuồng vẫn 2/mảnh, ao vẫn 2/mảnh, ao chính vẫn 6.
- Vườn bắt đầu với ba luống hàng sau. Nút **Mở thêm 3 ô · 120 xu** có ở phần
  Đất và phần chăm vườn; mở một lần để thành 3 cột × 2 hàng. Hàng chưa mở chỉ
  có dấu đất mờ, không thể gieo. Không tự cộng thêm ô cho dữ liệu cũ.
- Giữ nguyên ID ô cũ 12–35 và ID ruộng chính. ID hàng mới là 10000–10023,
  lưu trong `extraPlots`, trạng thái nâng cấp lưu `land[i].expanded=true`.
  `gardenPlotId`, `gardenForPlot`, `gardenPlotSlot`, `gardenPlotCount` là nguồn
  chung cho số ô, nhóm vườn, tọa độ, nhãn tác vụ và hiển thị khách thăm.
- Kiểm tra nâng cấp ở engine, từ chối mua lại/thiếu xu/sai loại đất. Chi phí
  nâng cấp được cộng vào giá trị tài sản, không làm mất tổng tài sản vì chi xu.
- Nền phía trên lấy plate V2 tại world y=0–372; phần mới nối từ y=360 đến900
  với vùng chuyển tiếp cỏ 12 đơn vị. Các lối đá được căn vào y=387+116×hàng,
  tâm đường chính x=205, lối giữa x=478. Cổng và đồ trang trí cạnh cổng dời
  xuống cuối map. Radar dùng đúng tỷ lệ bản đồ mới, camera giữ thuật toán cũ.

### Mỹ thuật và xuất tài nguyên

Dùng built-in imagegen, tham chiếu `background-homestead-empty-v2.png` và
`expansion-parcels-draft-v1.png`. Source và runtime giữ riêng, không thay các
atlas cũ. Chạy `py scripts/normalize-expansion-v7.py` để xuất lại.

- `expansion-terrain-v7-source.png` → `public/pixel/expansion-terrain-v7.png`
  (1640 × 1080). Prompt: chỉ phần nền phía nam, cùng chất liệu cỏ/đá/hoa,
  lối chính dọc bên trái, lối bước đá giữa và năm lối ngang; đất trong tám
  mảnh để trống, không vẽ sẵn rào, luống, chuồng, ao hoặc vật nuôi.
  Export đăng ký các tâm lối đá theo lưới world bằng từng ô ảnh.
- `parcel-pond-v7-source.png` → `public/pixel/parcel-pond-v7.png`
  (364 × 188 RGBA, alpha cứng). Prompt: ao bờ đá bo tự nhiên tỷ lệ khoảng2:1,
  nước teal, lá sen/hoa hồng và cá nhỏ, góc nhìn/màu theo concept; không vẽ
  cầu, rào hay nền cỏ. Cầu V5 vẫn là actor riêng, gắn ở mép trước ao.
- `parcel-grove-v7-source.png` → `public/pixel/parcel-grove-v7.png`
  (120 × 60 RGBA, alpha cứng). Prompt: cụm đá tròn, dương xỉ thấp và hai hoa
  cúc nhỏ theo phong cách concept, không nền/cast shadow; hai cụm đặt hoàn toàn
  trong đất chưa mở. Thay hình bụi cây thủ tục cũ vốn đặt quá mép dưới mảnh.

### Kiểm tra

Đã kiểm tra Canvas thật ở 640 × 384 và toàn cảnh: các lối đi giữa mảnh,
ô trồng cũ, sân cừu/trâu, ao và hàng rào; nhân vật đi xuống hàng cuối bằng
`world.approach()`, camera theo được. UI thật ở chế độ demo: nâng cấp955→835xu,
giữ cây ở ID12, hiện đủ ô1–6 gồm10000–10002, nút mua biến mất và trạng thái
còn sau reload. API/D1-style kiểm tra gửi lặp cùng request không trừ hai lần,
lưu/tải và khách thăm nhìn thấy cây tại10023, presence chấp nhận vị trí phía nam.

Regression còn bao phủ: không trùng ID khi đủ30 ô chính và48 ô mở rộng,
từ chối gieo vào ô chưa mở, bảo toàn cây/túi/rào/tài sản, người chăm vườn dùng
ô mới, đúng nhãn tác vụ, mọi hotspot có đường đến cho chủ vườn và khách.
Build bổ sung hai module phụ thuộc của `world-layout.mjs` vào server bundle
(`yard-pets.mjs`, `pixel/homestead-buildings.mjs`) để worker đóng gói import được.

Kết quả cuối: **108/108 test đạt**, `npm run build` thành công, import worker đã
build thành công; HTML/app và cả ba PNG mới trả200 từ worker đóng gói. Fixture
QA đã xóa trước build và trả404. Giao diện390px không tràn ngang, radar70×77px
giữ đúng tỷ lệ. Chưa commit/push/deploy trong bước triển khai này.

## Sân nhà và bố cục có công năng V6

### Gà, chó, mèo

`public/yard-pets.mjs` định nghĩa ba bạn nhỏ ambient, đường đi khép kín và
các nhịp đứng/ngửi/mổ thóc. Chó đi ở sân đường cong, mèo quanh bậc hiên, gà
ở khoảng sân cạnh giếng. Chúng không nằm trong `farm.pens`, không dùng sức
chứa chuồng hoặc tạo sản phẩm. Chủ vườn và khách đều thấy chúng.

Chó/mèo có atlas 2 × 2: idle, walk A, walk B, sniff. Mỗi ô 64 × 56, alpha
thật, chân tại y=52, cùng tỷ lệ giữa các pose. Render bằng frame toàn thân,
không ghép thêm tay/chân. Gà dùng các pose đã có trong atlas vật nuôi. Tọa độ
di chuyển cập nhật trước khi sắp lớp sprite; ảnh không nhảy khi quay lại đầu
vòng. Khi hệ điều hành yêu cầu giảm chuyển động, ba con vật nghỉ ở ba chỗ riêng.

Nguồn: `assets/yard-dog-v1-source.png`, `assets/yard-cat-v1-source.png`.
Xuất lại bằng `py scripts/normalize-yard-pets-v1.py`; script crop từng quadrant
độc lập, dùng chung hệ số scale cho bốn pose, căn chân và threshold alpha.
Runtime: `public/pixel/yard-dog-v1.png`, `public/pixel/yard-cat-v1.png`.

Artwork được tạo bằng built-in imagegen, lấy cừu trong `livestock-v2.png` làm
mẫu. Prompt set: cùng một nhân vật trong lưới 2 × 2, nhìn sang phải, camera
hơi từ trên xuống, pixel-art tròn ấm, alpha thật, bốn pose toàn thân riêng;
không nền, bóng đổ vẽ sẵn, caption hoặc bộ phận thừa. Dog: chó vàng nhỏ, mõm
và ngực kem, tai cụp và đuôi cuộn. Cat: mèo mướp cam kem, bàn chân trắng,
mặt tròn và đuôi cong dựng. Giữ silhouette và baseline đồng nhất, có padding
để tai/đuôi không chạm mép ô.

### Đồ trang trí theo cảnh

Các vị trí giờ gắn với công năng thay vì chia đều trên bãi cỏ:

- Hiên nhà: chậu hoa, lu nước, chuông gió.
- Cổng nam: cổng hoa ôm chính đường đá, bảng tên và đèn đứng bên cạnh.
- Kho: xe đẩy bên góc sân phải, rơm bên góc trái, không đè cầu ao hoặc lối cửa.
- Ruộng: người rơm đứng ở bờ cỏ phía đông.
- Ao: ghế nghỉ và chậu sen cạnh nhau; giỏ mây cạnh Xưởng, máng chim cạnh giếng.

`gardenDecorRecommendedSpots` là bảng gợi ý rõ theo từng loại. Giao diện đặt
đồ đưa gợi ý lên đầu, vẫn giữ đặt thủ công. Nút **Sắp xếp theo bối cảnh** gọi
`arrangeGardenDecor` để sắp lại toàn bộ món đang đặt trong một lần. Không
mua thêm, không trừ xu/phiếu, không tự đặt những món đang cất và gọi lại an toàn.
Không tự ghi lại vị trí đã lưu chỉ vì người chơi mở game.

### Luống và hàng rào

Ba cột vườn chính giảm bước ngang từ 45 xuống 42, bước hàng từ 40 xuống 34.
Vườn tăng thêm giảm bước ngang xuống 42; khoảng cách với đường đá vẫn được
kiểm tra ở mọi giai đoạn cây. Ba luống trong mỗi ô mở rộng giảm bước từ 61
xuống 46 và cân giữa ô. Hàng rào vườn mở rộng ôm cụm luống bằng `gardenParcelRect`.

Rào sau và hai bên được vẽ ở nền; rào trước là actor `fence-front` có độ sâu
tại cạnh dưới. Nhờ đó đất/cây không xóa mất rào trước; nhân vật đi phía trước
hoặc phía sau rào được che đúng. Culling xét chiều rộng thật của rào để tránh
mất một đoạn khi camera chỉ nhìn thấy mép. Giữ ID, số ô và cơ chế chăm sóc.

### Xác minh

Ảnh `assets/homestead-life-runtime-v6.png` gồm toàn cảnh và hai viewport
640 × 384. `assets/yard-companions-runtime-v6.gif` ghi 20 frame từ Canvas
`createWorld()` đang chạy với animation bật. Kiểm tra riêng trạng thái giảm
chuyển động; kiểm tra Canvas không truyền tọa độ không hữu hạn khi vẽ gà.
Thử nút sắp xếp qua giao diện thật với dữ liệu chơi thử trong profile Edge
riêng: xu giữ nguyên và món đang cất vẫn cất. Không sửa database người chơi.
Test bổ sung kiểm tra đường đi liên tục/an toàn, RGBA atlas, lớp rào trước,
bố cục gợi ý, sắp xếp miễn phí và khả năng lặp lại.

## Cập nhật đường đi, trang trí và cầu ao V5

- Dãy luống chính từ số 13 chuyển từ y=280 xuống y=302, cách hàng 26,
  vẫn 6 cột và giữ nguyên ID. Luống 13–30 được kiểm tra bằng footprint ảnh
  thực của mọi giống, cả bốn giai đoạn: đất và tán đều ở phía nam vùng đường
  đá kết thúc tại y=274. Hàng rào vườn tăng thêm bắt đầu y=288 thay vì y=266.
- Tám ô mở rộng bắt đầu y=375, cách hàng 56 (thay vì y=365, cách 58) để chừa
  khoảng đệm dưới dãy ruộng. Hai cột, diện tích/sức chứa và lối giữa không đổi.
  Hàng cuối kết thúc y=591, trước viền trang trí phía nam.
- Dời điểm hiên nhà về góc bậc hiên trái; chuyển điểm trên rặng cây phía bắc
  thành góc nghỉ dưới Xưởng và bờ cỏ cạnh ruộng/ao. Cụm chậu, ghế, lu, giỏ và
  rơm phía tây giữ khoảng đệm với đường đá và công trình. Tên vị trí trong
  giao diện cập nhật tương ứng; key và quyền sở hữu đồ trang trí giữ nguyên.
- Atlas trang trí có alpha kết thúc ở hàng 45, không phải hàng 48. Renderer
  căn chân tại hàng 45 để chân vật và bóng tiếp xúc cùng mặt đất, đồng thời
  giữ đúng vị trí chữ bảng tên và tâm đèn so với ảnh.
- Cầu ao nuôi dùng artwork gỗ pixel-art alpha thật: vân ván, cọc gỗ và dây
  buộc cùng chất liệu với nhà. Đầu cầu hướng vào nước theo từng bờ; ao chính
  hiển thị 26 × 40, ao mở rộng 18 × 22. Cá hiển thị quanh đích phao trong ao.
  Giữ cầu hồ công cộng và cơ chế câu/cho ăn/thu hoạch hiện có.

Nguồn `assets/pond-dock-v5-source.png`, runtime `public/pixel/pond-dock-v5.png`
(52 × 80), xuất bằng `py scripts/normalize-pond-dock-v5.py`. Dùng built-in
imagegen với nền V2 làm tham chiếu; yêu cầu một cầu gỗ ngắn hướng lên mặt nước,
ván gỗ mật ong, cọc tròn và dây buộc, ánh sáng trái trên, nền alpha thật, không
vẽ nước/bờ/cây/người/chữ vào sprite. Giữ bản nguồn và threshold alpha khi xuất.

Ảnh `assets/homestead-road-dock-runtime-v5.png` chụp toàn cảnh, Canvas game
đang chạy với cây trưởng thành và vùng ao ở 640 × 384. Dữ liệu kiểm tra có
30 luống, tám ô mở rộng, 13 món trang trí và vật nuôi, không sửa DB người chơi.

## Cập nhật trải nghiệm V4

- Sân chuồng mở rộng từ 190 lên 220 world units theo chiều ngang, nới ra phía
  ngoài: cột trái bắt đầu x=230, cột phải kết thúc x=726. Giữ lối đi giữa hai
  cột rộng 56 và khoảng cách hàng hiện có, không đổi ô đất/ID/sức chứa.
- Hai vị trí nuôi trong sân mới có biên đi lại 16 và 6 thay vì đều là 3.
  Kiểm tra cả hai trâu trưởng thành trong 25 giây chuyển động để bảo đảm không
  vượt rào hoặc đụng mái che. `coopRect()` là hình học sân, `lotRect()` vẫn là
  hình học ô đất chung cho vườn và ao.
- Dời 13 điểm trang trí thành các góc cỏ cạnh giếng, sau ruộng, dưới ao và
  cụm sân phía tây. Giữ key vị trí và vật phẩm đã mua; không yêu cầu mua lại.
  Test dùng footprint trang trí lớn nhất để kiểm tra không chồng lên 30 luống,
  mọi sân chuồng mở rộng, ao, Xưởng, đường chính hoặc món trang trí khác.
- Bỏ hình vẽ và bắt click/phím tương tác cho các điểm exit trên map. Giữ
  metadata exit phục vụ nút trở về và `world.approach()`. Thanh chọn cảnh
  desktop và menu khu vực mobile tiếp tục là cách chuyển cảnh bằng click.
- Ao chính và ao mở rộng không còn vẽ rào, kể cả bản lưu từng mua rào. Giao
  diện không chào mua rào ao nữa; metadata cũ không bị xóa hoặc đổi sức chứa.
- Bỏ chú gà ambient ở trước nhà. Không thay đổi đàn vật nuôi người chơi sở hữu.

Ảnh `assets/homestead-usability-runtime-v4.png` gồm toàn cảnh với 13 món
trang trí, Canvas của `createWorld()` đang chạy và góc sân phía tây ở 640 × 384.
Kiểm tra trình duyệt xác nhận click điểm exit cũ không đổi cảnh; các nút
market/neighbors/coop/lake/workshop/field vẫn chuyển đúng cảnh, và giao diện
ao/nhà chính không còn nút mua rào ao. Dùng dữ liệu fixture và chơi thử trong
profile Edge riêng, không sửa database người chơi.

## Cập nhật tỷ lệ chuồng và Xưởng V3

Theo yêu cầu tăng kích thước công trình trong Vườn nhà, Xưởng hiện có artwork
riêng (bàn dụng cụ, cửa lớn, bánh răng và mái ngói), không dùng ảnh chuồng.
Kích thước hiển thị tăng từ 54 × 45 lên 110 × 88 world units, gần tỷ lệ Kho
trong background. Chân nhà tại (115, 392); vùng chặn và cửa trở về từ scene
Xưởng theo cùng anchor. Nhà nằm bên trái đường đá, phía dưới giếng.

Chuồng mở rộng thay ảnh nhà nhỏ đặt giữa sân bằng mái che hai gian 80 × 44,
đặt về bên trái ô đất. Hai vật nuôi ở sân bên phải, với biên đi lại 3 world
units để cả trâu trưởng thành vẫn nằm trong hàng rào và không chạm nhà che.
Giữ kích thước ô đất, số ô, sức chứa, giá và dữ liệu đã lưu.

Thông số dùng chung ở `public/pixel/homestead-buildings.mjs`; renderer, điểm
tương tác và va chạm dùng cùng nguồn. Test kiểm tra cả vườn chủ và vườn ghé thăm,
hai trâu trên mỗi ô ở mọi pha chuyển động, cửa Xưởng và điểm trở về.

Nguồn alpha: `assets/homestead-workshop-v3-source.png` và
`assets/parcel-shelter-v3-source.png`. Xuất bằng
`py scripts/normalize-homestead-buildings-v3.py` thành ảnh runtime 220 × 176
và 160 × 88. Giữ các bản V2 để đối chiếu.

Hai artwork được tạo bằng built-in imagegen, tham chiếu nền V2: Xưởng gỗ cùng
tỷ lệ/góc nhìn với Kho, mái ngói cam, cửa có bàn dụng cụ, bánh răng, alpha thật;
chuồng mái rộng thấp hai gian mở, cùng vật liệu/ánh sáng, alpha thật, không
vẽ vật nuôi hoặc sân vào ảnh. Crop theo alpha, resize và làm cứng alpha khi xuất.

Ảnh `assets/homestead-buildings-runtime-v3.png` chụp bằng Edge từ renderer
game với dữ liệu fixture: toàn cảnh và hai viewport 640 × 384, bao gồm gà,
chim cút, cừu, trâu và nhân vật để so sánh tỷ lệ. Đây là kiểm tra renderer và
đường đi tự động, không phải kiểm thử toàn bộ phiên chơi production.

Người dùng đã duyệt `assets/homestead-layout-approved-v2.png` trước khi triển khai.
Ảnh concept là mục tiêu bố cục; ảnh `assets/homestead-runtime-v2.png` là kết quả
dựng bằng renderer thật, với dữ liệu kiểm tra ban đầu và mở rộng tối đa.
`assets/homestead-runtime-native-v2.png` cho thấy hai vùng nhìn 640 × 384.

## Bố cục và dữ liệu

- Giữ world 820 × 640, nhà/kho/giếng/ao lớn và đường đá của background.
- Nền V2 bỏ 12 luống và cọc được vẽ sẵn. Chỉ các luống thực sự đã mở mới được
  vẽ động. Đất lấy mẫu từ artwork gốc, cây dùng atlas hiện có; đất ẩm và đất chai
  vẫn phản ánh trạng thái trò chơi.
- Vườn chính có tối đa 12 luống theo 3 cột × 4 hàng, tâm bắt đầu (255, 96),
  khoảng cách (45, 40). Tài khoản mới vẫn có 6 luống theo cơ chế hiện hành.
- Game hiện có tối đa 30 luống, vượt số luống minh họa trong concept. 18 luống
  tăng thêm dùng 6 cột × 3 hàng phía dưới vườn chính, từ (255, 280), bước (45, 28).
- Tám ô mở rộng dùng 2 cột × 4 hàng, từ (260, 365), bước (246, 58), mỗi ô
  190 × 48. Khoảng trống giữa hai cột là lối đi; các ô nằm trong vùng cỏ,
  cách đường đá và cây ở mép bản đồ. Ô chưa mở chỉ có cọc, cỏ và hoa thấp.
- Giữ nguyên ID luống, ID ô đất, quyền sở hữu, chi phí, cây/vật nuôi và dữ liệu
  đã lưu. Ao chính vẫn chứa 6, ao mở rộng vẫn chứa 2, chuồng mở rộng vẫn chứa 2.
- Đồng bộ điểm tương tác với vị trí mới. Ao nhỏ có đích phao rõ ràng bên trong
  mặt nước. Cầu ao nhỏ nằm gọn ở bờ; chuồng có sprite alpha và hàng rào.
- Xưởng ngoài vườn chuyển sang bãi cỏ phía tây đường chính để không đè lên kho
  hoặc ao; cửa trở về từ scene xưởng cũng cập nhật. Nội thất scene xưởng giữ nguyên.
- Vườn hàng xóm sử dụng cùng hình học để hiển thị đúng dữ liệu của chủ vườn.

## Artwork và xuất bản

Dùng built-in imagegen với nền V1 làm tham chiếu, theo skill game-pixel-art.
Giữ bản gốc, không ghi đè V1:

- `assets/background-homestead-empty-v2.png` → `public/pixel/scene-background-homestead-v2.png`.
- `assets/parcel-shelter-v2-source.png` → `public/pixel/parcel-shelter-v2.png` (96 × 80).
- `assets/parcel-pond-v2-source.png` → `public/pixel/parcel-pond-v2.png` (360 × 80).

Xuất lại hai sprite bằng `py scripts/normalize-homestead-v2.py`: crop theo alpha,
resize riêng từng asset, threshold alpha để không có nền giả hoặc viền mềm.

Prompt nền: sửa tối thiểu ảnh tham chiếu, giữ nguyên kích thước 1448 × 1086,
nhà, kho, giếng, ao, đường và cây viền; chỉ thay 12 luống đất và 8 cọc bằng cỏ
liền mạch; không thêm công trình/cây trồng/chữ. Prompt chuồng: một chuồng gỗ
nhỏ mái ngói cam đỏ, cửa tối và ổ rơm, góc nhìn của kho trong ảnh tham chiếu,
alpha thật, không đất/cỏ/vật nuôi/hàng rào/chữ. Prompt ao: một ao nhỏ ngang dài,
viền đá tròn, nước teal, lá sen và hoa sen hồng, cùng góc nhìn và ánh sáng,
alpha thật, không cảnh nền/cá/cầu/chữ.

## Kiểm tra

Kiểm tra bằng Edge và chính `world-art.mjs`, với dữ liệu fixture, không sửa DB
của người chơi. Chụp cả bản đồ ban đầu, bản đồ tối đa và vùng nhìn native.
Kiểm thử tự động bổ sung kiểm tra 30 luống không đè lên 8 ô, đường đi tới các
điểm tương tác và sức chứa ao không đổi. Test người làm vườn cập nhật theo thời
gian di chuyển mới; test thời tiết vẫn đặt mốc chuyển thời tiết trước khi làm xong.

Chạy `node --test`, `npm.cmd run build`, `git diff --check` trước khi bàn giao.
Ảnh renderer là kiểm tra bố cục tĩnh; không thay thế kiểm tra toàn bộ thao tác
trong phiên chơi thật.

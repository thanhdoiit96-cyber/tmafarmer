# Chợ làng — bố cục và khách đi chợ V1

## Bố cục

- Giữ background Chợ làng đã có. Thay hai NPC đứng trong vùng sạp bằng ba khách có giỏ/túi: áo bà ba tím, ông tóc bạc áo xanh, cô đội nón áo vàng.
- Khách đi chậm 12 world units/giây, dừng 3,5 giây ở hai đầu đường, quay hướng và đổi pose. Ba tuyến độc lập ở phía trước các sạp và lối vào, đủ chỗ hiển thị trọn đầu và chân. Vị trí được tính trước khi sắp xếp lớp theo y. Giảm chuyển động giữ nguyên vị trí và pose.
- Nguồn và runtime: `assets/market-shoppers-v1-source.png`, `public/pixel/market-shoppers-v1.png` (192 × 192, 4 cột × 3 hàng, ô 48 × 64). Runtime hiển thị 30 × 40 world units; không thay atlas nhân vật người chơi.
- Vùng va chạm chặn toàn bộ phần sạp và giếng đã vẽ trên nền. Điểm quầy vật tư (88,170), sạp nông sản (296,160), bán nhanh (392,179) nằm ngoài quầy. Sạp giữa dùng lối bên phải để tránh mái giếng che đầu người chơi.
- Bỏ vùng nước va chạm cũ bên phải vì background chợ không còn ao.
- Bảng đơn hàng mới: khung gỗ mái ngói, ba phiếu nông sản có dấu niêm và ruy băng; chân ở (170,252), kích thước 48 × 58. Điểm đứng (170,265), vùng click ở giữa bảng. Số đơn hiển thị rõ phía trên; nâng cấp bảng vẫn có dấu vàng riêng.
- Chỉ đổi bố cục/hiển thị, không đổi đơn hàng, phần thưởng hay thao tác mua bán.

## Tài nguyên và kiểm tra

- Nguồn bảng alpha thật: `assets/market-order-board-v1-source.png`; runtime `public/pixel/market-order-board-v1.png` (96 × 116).
- Xuất lại: `py scripts/normalize-market-v1.py`; scale/baseline thống nhất trong từng hàng, alpha runtime 0/255.
- Ảnh Canvas 640 × 384: `assets/market-viewport-v1.png`; hoạt ảnh thực tế: `assets/market-life-v1.gif`.
- Kiểm thử `test/market-life.test.mjs`: mọi điểm tương tác đi được, sạp/giếng chặn di chuyển, tuyến khách không xuyên vật cản, chuyển động liên tục, có pose nghỉ và đi, giảm chuyển động ổn định.
- Kiểm tra trình duyệt: `world.approach()` tới quầy, giếng và bảng đều gọi callback thành công; vị trí dừng lần lượt (296,156), (241,244), (169,268). Không có lỗi JavaScript.

## Prompts — built-in imagegen

Tham chiếu: `public/pixel/farmer-walk-v4.png` và `public/pixel/scene-backgrounds-environments-v1.png`.

Shoppers: Production transparent pixel-art sprite sheet for this Vietnamese farming game. Match farmer reference exactly in chibi proportions, warm dark outlines, detailed pixel clusters, top-left sunlight, and the market background palette. EXACT grid 4 columns by 3 rows, 12 equally sized cells, transparent background and generous transparent separation, no labels. Each ROW a distinct friendly adult villager shopper: row1 woman in plum ao ba ba with dark trousers, tied hair and small woven shopping basket; row2 older man in muted teal shirt and brown trousers, grey hair, carrying a small cloth shopping bag; row3 woman in ochre ao ba ba, dark trousers, conical hat and basket. All face RIGHT in three-quarter side view, entire feet and head inside each cell. Columns: standing idle, standing with subtle friendly head turn, walking left leg forward, walking right leg forward. Same character size and baseline in every frame, no stretching, baskets remain attached naturally, normal two arms only. Crisp authored pixel art readable at 32x48 pixels per cell, not vector, not flat procedural shapes. Transparent background true alpha, no ground shadow, no scenery.

Shopper revision: Keep this exact transparent sprite sheet, 4 columns 3 rows, same characters, faces, clothes, baskets, style, alignment, full silhouettes. Correct ONLY the fourth/rightmost column of every row to be the opposite phase of the third column's walking pose. In third column near/right visible leg swings forward to the RIGHT. In FOURTH column visible near leg must swing BACK to LEFT while far leg steps to RIGHT, a clearly opposite alternating footfall with both feet visible and separated, natural arm counter-swing. No duplicate poses between columns3 and4. First two columns standing and third column unchanged. True transparent alpha no background no text.

Board: ONE isolated village market order notice board sprite on truly transparent background. Match supplied market scene: Vietnamese cozy pixel art, warm timber and honey highlights, muted brown-teal shadows, upper-left sunlight, elevated front view. A sturdy attractive waist-height wooden bulletin board on two short timber legs with a small terracotta tiled roof, dark carved wood frame, pale cork backing, three distinct pinned parchment delivery orders with tiny illustrated vegetable/basket symbols and illegible short line marks, a small red seal and green ribbon. No readable text, no UI, no characters, no ground patch, no background, no painted ground shadow. Compact balanced silhouette readable at 56x64 game pixels. Handcrafted pixel clusters, beautiful material detail matching the roofs in the reference. Entire roof and legs visible, single tightly centered object.

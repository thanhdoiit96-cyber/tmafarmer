# Vườn Mùa Vui

Game nông trại 2D trên trình duyệt, giao diện tiếng Việt. Chơi ngay ở vườn thử, hoặc tạo làng và gửi mã cho bạn bè. Mỗi làng có tối đa 12 vườn. Vườn thử có sẵn hai hàng xóm mẫu. Làng online lưu riêng.

## Tài liệu gameplay và phát triển

- [Gameplay hiện tại](docs/GAMEPLAY_REFERENCE.md) và [hướng dẫn người mới](docs/PLAYER_QUICKSTART.md).
- [Catalog số liệu từ source](docs/GAMEPLAY_CATALOG.md): cây, vật nuôi, ao, công thức, nâng cấp, thời tiết và tiêu hao. Cập nhật bằng `npm run gameplay:docs`, kiểm tra bằng `npm run check:gameplay-docs`.
- [Phân tích sản phẩm, thị trường, giữ chân và doanh thu](docs/GAME_PRODUCT_STRATEGY.md).
- [Lộ trình thực hiện và tiêu chí nghiệm thu](docs/GAME_DEVELOPMENT_ROADMAP.md). Các mục P0–P7 là đề xuất, chưa phải tính năng đã triển khai.

## Điều khiển

Dùng **WASD** hoặc **phím mũi tên** để đi. Tới gần lối ra, ô đất, quầy chợ hoặc cửa kho rồi nhấn **E**. Bạn cũng có thể bấm hoặc chạm trên bản đồ để nhân vật tự tìm đường đến điểm đó. Trên màn hình cảm ứng có thêm cụm nút hướng.

Bản đồ gồm vườn nhà, chuồng trại, chợ, đường làng và vườn hàng xóm. Nhân vật, công trình và vật nuôi dùng sprites minh họa WebP. Canvas 2D vẽ các lớp cảnh, cây trồng và hiệu ứng thời tiết. Dùng các tab bên cạnh bản đồ để mở tác vụ trong khu, đơn hàng, kho, xây dựng hoặc nhật ký. Bấm thời tiết trên bản đồ để xem dự báo. Tọa độ nhân vật chỉ dùng trên thiết bị đang chơi. Trạng thái ruộng, chuồng, kho, sạp và lượt ghé vẫn dùng chung trong làng online.

## Tiến độ và âm thanh

- XP tích lũy theo vườn. Thu hoạch, thu sản phẩm vật nuôi, giao đơn, xây công trình và hoàn thành Sổ việc hôm nay đều có thưởng XP. Tab **Tổng quan → Tiến độ** hiển thị danh hiệu, cách kiếm XP và các mốc.
- Cấp nông trại kéo dài từ cấp 1 đến cấp 13, đạt mốc cuối ở 16.000 XP. XP mở khóa giống, vật nuôi, sức chứa và công thức; xu, cấp công trình và vật liệu vẫn là các điều kiện riêng, không thể lên cấp chỉ bằng tích XP.
- Giai đoạn chuyên canh mở cà phê ở 3.200 XP, chim cút ở 3.600 XP, sen ở 5.600 XP và trâu nước ở 7.200 XP; thanh long và sinh tố cao cấp mở từ 9.600 XP, nếp cẩm mở ở 16.000 XP. Mốc giống cũ được giữ nguyên để không khóa lại vật phẩm người chơi đã mở.
- Xem [lộ trình cấp độ và nội dung nông trại](docs/GAME_PROGRESSION.md) để biết các mốc, trần công trình và nguyên tắc cân bằng.
- Nút **Nhạc nền** cho phép chỉnh âm lượng và tắt tiếng. Bản nhạc Vườn sớm lặp khoảng 53 giây, được xuất từ `scripts/compose-vuon-som.py` với NumPy và FFmpeg.
- Chọn **4 giai đoạn** trên luống hoặc mở chi tiết giống trong chợ để xem hình từng giai đoạn. Cây có thể thu hoạch khi tiến độ đạt 100%.

## Lịch và thủy sản

- Một ngày game kéo dài 8 giờ thực. Thời tiết thay đổi mỗi 2 giờ gồm nắng nhẹ, mưa rào, nhiều mây, nắng nóng, gió mạnh, sương và dông. Dữ liệu làng cũ ghi nhận thời điểm chuyển lịch khi vào lại. Vườn có sẵn cá giống, tôm giống và thức ăn khởi đầu.
- Vườn nhà và vườn đang ghé có kích thước 820 × 900 đơn vị, hồ làng có kích thước 720 × 432 đơn vị, với camera theo nhân vật và bản đồ nhỏ. Dùng nút khu vực hoặc lối ra để chuyển khu.
- Chọn Ao nuôi hoặc đến cầu gỗ cạnh ao. Cá và tôm ở chung ao, với sức chứa 6 con ở ao chính và 2 con ở ao xây thêm. Cá rô phi, tôm càng và cá chép cần lần lượt 20, 35 và 55 phút tăng trưởng cơ sở khi có thức ăn. Thời tiết làm thay đổi tốc độ lớn.
- Hồ làng miễn phí 12 lượt thành công/ngày. Thả câu và chờ 6 giây trước khi kéo cần, sau đó nghỉ 45 giây. Tỷ lệ cá chép vàng là 2% lúc sương, 4% lúc mưa rào và 3% trong các thời tiết còn lại có thể thả câu.
- Câu ở ao hàng xóm chỉ lấy được 1 cá trưởng thành nếu chủ ao còn tối thiểu 3 con trước khi câu. Lượt câu dùng chung giới hạn lấy đồ từ ruộng và kho. Cổng đóng bảo vệ 30 phút.

## Đất và chơi cùng khu vực

- Mỗi người có 2 mảnh đất trống cùng kích thước. Trong tab **Đất**, mua thêm tối đa 6 mảnh, chọn xây vườn có 3 luống (nâng riêng lên 6 luống với 120 xu), ao nuôi hoặc chuồng tối đa 2 con. Giá mảnh mua đầu tiên là 65 xu. Có thể chọn công trình từ bản đồ hoặc dùng **Tới ô**.
- Hàng rào có kiểu gỗ mật ong, gỗ trắng và tre xanh. Trang trí từng công trình từ tab **Đất** hoặc mở **Hàng rào công trình chính** trong **Xây dựng**. Hàng rào trang trí khác với nâng cấp an ninh.
- Trong làng online, chợ, hồ và đường làng là khu chung. Ở vườn nhà, chủ và khách cùng xem một bố cục. Vị trí cập nhật khoảng 1,2 giây, trình duyệt nội suy giữa các cập nhật. Nút **Chat** nằm dưới bản đồ, chỉ hiện khi đã vào làng. Tin nhắn nổi trên đầu nhân vật 5 giây và chỉ hiện cho người ở gần trong cùng khu vực. Tin nhắn mới chỉ giữ trong RAM.
- Nút **Nhân vật** cho phép đổi Nam/Nữ và độ tuổi Thanh niên/Trung niên/Cao tuổi. Sáu mẫu có chỉ số như nhau. Lựa chọn được lưu theo vườn và các người chơi khác sẽ thấy mẫu mới.

## Nhịp chăm sóc, sức khỏe và tài sản

- Vụ mới có thời gian cơ sở 8 phút (lúa mì), 15 phút (cà rốt), 25 phút (bắp). Gà lớn sau 20 phút có thức ăn và cần thêm 15 phút mỗi kỳ trứng, bò 45 phút và 30 phút mỗi kỳ sữa. Lợn lớn 60 phút rồi cần 40 phút cho kỳ xuất chuồng một lần, nhận thịt lợn; nấm truffle là cây riêng. Chuồng cấp 7 mở chim cút, cấp 8 mở trâu nước, vẫn cần XP tương ứng. Kho tối đa cấp 10, ruộng cấp 9, chuồng cấp 8 và xưởng máy cấp 9. Thời tiết và chăm sóc tác động vào tốc độ. Vụ đã gieo giữ mốc cũ, vật nuôi đang nuôi hoàn thành kỳ hiện tại rồi chuyển sang thời gian mới.
- Ô đất trống trong 8 giờ thực sẽ chai và cần **Cuốc đất** trước khi gieo. Ô mới mở và ô vừa thu hoạch có 8 giờ để gieo ngay. Bản đồ vẽ vết nứt trên đất chai, bảng Việc cần làm chỉ đến ô đó. Làng cũ bắt đầu tính thời gian đất trống từ lần đầu mở bản cập nhật.
- Trong mưa và 20 phút sau mưa, nguy cơ sâu tăng nhanh. Bảng Việc cần làm nhắc trị sâu sớm hơn trong thời gian này. Thuốc còn hiệu lực vẫn ngăn sâu tích lũy.
- **Chợ làng → Vật tư / Bán nhanh / Sạp làng** đều có tìm theo tên, hỗ trợ gõ tiếng Việt có dấu hoặc không dấu. Ở **Bán nhanh**, chọn **Bán hết** để bán toàn bộ hàng hiện có của riêng mặt hàng đã chọn.
- Giữ giống: khi thu hoạch, chọn **Thu và giữ 1 giống**, hoặc vào **Nông trại → Kho** để đổi nông sản còn giữ thành giống. Mỗi nông sản đổi được một giống cùng loại. Ô trồng được sử dụng lại ngay sau thu hoạch.
- **Chợ làng → Đơn làng** có 3 đơn nền dùng chung mỗi ngày game (8 giờ), có thể thêm nhóm đơn theo nội dung đã mở. Vườn nào giao đủ trước sẽ nhận thưởng. Đơn đã giao rời bảng của mọi vườn. Một đơn có thể là giỏ nhiều mặt hàng. Xem trước đơn ngày mai ở cuối bảng. Làng cũ giữ hạng và các dự án, các đơn đã giao trong ngày được ẩn khỏi bảng.
- **Làng → Đơn hàng → Đơn góp hàng** có một đợt kéo dài 48 giờ thực. Giỏ nông sản, Bếp làng và Quầy đặc sản luân phiên theo các giống đã mở khóa trong làng. Mỗi vườn được góp từng phần. Khi làng đủ hàng, vườn góp ít nhất 3 món tự nhận 12 XP, 125% giá bán nhanh của hàng đã góp (làm tròn lên) và 1 phiếu trang trí. Hàng đã góp được trừ khỏi kho và không hoàn lại khi hết hạn. Bảng hiển thị tiến độ, người góp và kết quả đợt trước.
- **Làng → Cấp làng** có các mốc Làng, Xã, Phường, Quận và Thành phố. Thu nhập là tổng tiền bán nhanh và thưởng giao đơn, tính từ bản có cấp làng. Số đơn cộng dồn. Trộm thành công ở vườn, kho và ao dùng chung giới hạn theo ngày game của làng, giảm theo cấp từ 12 xuống 8, 5, 3 và 1. Lên cấp cần góp đủ xu xây một công trình và có chuỗi ngày liên tiếp đã kết thúc với số vụ nằm trong giới hạn xét duyệt. Làng cũ bắt đầu tính chuỗi kể từ ngày mở bản này, giữ tiến độ đã tích lũy. Khi hoàn thành đủ điều kiện, cấp tăng tự động.
- Sổ việc hôm nay nằm trong Nhà vườn và bảng Việc cần làm. Chăm cây, thu sản phẩm và bán nông sản hoặc giao đơn để nhận 25 xu và 8 XP mỗi ngày game.
- HUD hiển thị nước, độ no và thể lực. Trồng, chăm, thu hoạch, câu, xây dựng dùng các chỉ số theo thao tác. Trời nóng tốn thêm nước. Bấm thanh Nước để uống, No bụng để ăn, hoặc Thể lực → Về Nhà vườn. Trong Nhà vườn, chọn Nghỉ ngay ở bất kỳ vị trí nào. Sau 60 giây, thể lực hồi tối đa 75 điểm. Trong lúc nghỉ vẫn có thể xem kho, trò chuyện và giao dịch. Thể lực cũng hồi chậm theo thời gian.
- Việc cần làm hiển thị dấu đỏ khi cần xử lý sâu hoặc cho ăn, xanh lá khi đến kỳ thu và xanh lam khi cần tưới. Bấm một việc để điều hướng nhân vật đến khu vực và mở bảng chăm sóc.
- Vào làng online, mở **Tổng quan → Tài sản** để xem xếp hạng. Điểm gồm xu tiền mặt, giá hệ thống của hàng trong kho và trên sạp, chi phí đất, công trình, hàng rào và vật nuôi. Giá tự đặt trên sạp không thay đổi điểm xếp hạng.

## Chạy trên Windows hoặc Linux

Cần Node.js **22.13+**. Giải nén, mở terminal trong thư mục dự án rồi chạy:

```powershell
npm run dev
```

Mở `http://localhost:3000`. SQLite tự khởi tạo tại `.local/farm.sqlite`. Có thể mở cửa sổ ẩn danh để tạo người chơi thứ hai và nhập mã làng. Nếu PowerShell chặn `npm.ps1`, chạy `npm.cmd run dev`.

```text
npm test
npm run build
```

Kiểm tra dung lượng bằng `npm run check:size`. Trên Windows, xem trước việc dọn bản build bằng `powershell -NoProfile -File scripts/clean-build.ps1`, thêm `-Apply` để dọn `dist`. Chạy lại `npm run build` khi cần bản xuất để deploy. Công cụ không dọn tài liệu, database hoặc backup. Xem [báo cáo dọn dung lượng](docs/PROJECT_CLEANUP_2026-11-25.md).

Dọn cache kiểm thử cũ: `powershell -NoProfile -File scripts/clean-local-cache.ps1` để xem trước, thêm `-Apply` để sao lưu và dọn. Công cụ chỉ xử lý ba hồ sơ Edge QA đã nghỉ và các helper dùng một lần trong `.local`, kiểm tra trình duyệt đã đóng, giữ database/tài liệu/backup và các kiểm tra `qa-*`.

Trước khi commit hoặc sau một đợt thử UI, chạy `npm run check:workspace` để phát hiện tệp tạm, database, cấu hình môi trường hoặc cache bị đưa nhầm vào source. Kiểm tra chỉ đọc, giữ ngoại lệ bản nén thiết kế trong `docs`, không báo lỗi chỉ vì có bản build `dist` đang được Git bỏ qua. Xuất báo cáo JSON bằng `node scripts/audit-workspace.mjs --json`; dùng cùng `npm run check:assets` để kiểm tra tham chiếu tài nguyên. Không có thao tác tự xóa hoặc tự chạy theo lịch.

## Deploy lên Vercel

Chọn **Vercel** cho giao diện. Nếu muốn tạo làng, mời bạn bè, chat và lưu tiến trình online, dùng thêm **Cloudflare Worker + D1**. Bản chơi thử lưu riêng trong trình duyệt và chỉ cần Vercel.

### Chơi online với Cloudflare Worker và D1

Lộ trình chuẩn bị sức tải cho 1.000 người chơi đồng thời được theo dõi tại [docs/SCALE_PLAN_1000.md](docs/SCALE_PLAN_1000.md). Quy trình đo lường và load test từ 100 đến 5.000 người chơi nằm trong [docs/SCALE_TESTING.md](docs/SCALE_TESTING.md). Mốc tải chỉ được xem là đạt sau khi có số liệu staging xác nhận.

Mở PowerShell tại thư mục chứa `package.json`, dùng Node.js 22.13+ và chạy:

```powershell
npx.cmd wrangler login
npm.cmd run d1:create
```

Chạy lệnh tạo D1 một lần. Nếu đã có D1 từ lần deploy trước, lấy ID của cơ sở dữ liệu hiện có. Mở `wrangler.toml`, thay `CHANGE_ME` bằng ID đó. Giữ binding `DB` và thư mục migration `drizzle`. Nếu Wrangler đề nghị tự thêm binding, chọn không và sửa binding hiện có để tránh khai báo trùng.

```powershell
npm.cmd run d1:migrate
npm.cmd run deploy:worker
```

Với bản đã triển khai, binding `CHAT` và migration Durable Object trong `wrangler.toml` được cài khi deploy Worker. Chức năng mới không cần migration D1.

Ghi lại URL Worker mà Wrangler trả về, ví dụ `https://vuon-mua-vui.ten-ban.workers.dev`. Mở URL Worker với đuôi `/api/health` để kiểm tra phản hồi `{"ok":true}`. Tiếp theo, sửa `destination` trong `vercel.json` thành URL Worker thực, giữ đuôi `/api/:path*`.

#### Cấp quyền super admin cho tài khoản ntdoi

Đăng nhập bằng tài khoản `ntdoi` do bạn quản lý. Chạy truy vấn bên dưới để lấy ID của tài khoản trên D1 đã triển khai, rồi nhập giá trị `id` khi Wrangler hỏi giá trị của `SUPER_ADMIN_ACCOUNT_ID`.

```bash
npx wrangler d1 execute DB --remote --command "SELECT id FROM farm_accounts WHERE username = 'ntdoi'"
npx wrangler secret put SUPER_ADMIN_ACCOUNT_ID
```

Có thể đặt cùng biến này trong cấu hình của Worker trên Cloudflare. Để trống biến thì tính năng super admin tắt. Tài khoản cần có phiên đăng nhập hợp lệ và cả username lẫn ID phải khớp. [Lệnh D1](https://developers.cloudflare.com/d1/wrangler-commands/) · [Biến bí mật của Worker](https://developers.cloudflare.com/workers/configuration/secrets/)

Trong game, vào làng bằng tài khoản `ntdoi`, mở bảng **Công cụ** nếu đang chơi trên điện thoại nằm ngang, rồi chọn **Làng → Thành viên → Mời ra** và xác nhận. Nếu đang ở làng khác, chọn **Về vườn chơi thử**, mở **Vào làng** và nhập mã làng cần quản lý. Người tạo làng được bảo vệ khỏi thao tác mời ra.

### Đưa giao diện lên Vercel

1. **Chơi thử:** Xóa trường `rewrites` và dấu phẩy cuối sau `"buildCommand": null` trong `vercel.json`. **Chơi online:** Giữ rewrite đã chỉnh ở bước Cloudflare.
2. Đẩy mã nguồn lên GitHub rồi chọn **Add New → Project** trong Vercel để import, hoặc chạy `npx.cmd vercel --prod` ngay tại thư mục gốc. Chọn **Other**, để `public` làm Output Directory, không đặt lệnh build. Cấu hình này đã có trong `vercel.json`. Trên macOS hoặc Linux, dùng `npm` và `npx` thay cho `npm.cmd` và `npx.cmd`.
3. Mở URL Vercel. Với chế độ online, thử `/api/health` qua URL Vercel, sau đó tạo làng và dùng cửa sổ ẩn danh để vào bằng mã. Reload để kiểm tra lưu tiến trình. `/api/health` chỉ xác nhận Worker có binding D1. Tạo và vào làng sẽ kiểm tra các bảng trong D1.

Trình duyệt gọi `/api/*` trên tên miền Vercel. Vercel chuyển tiếp sang Worker, Worker giữ binding D1. Giao diện không cần API token hay biến môi trường. D1 mới bắt đầu với dữ liệu trống. Phiên khách gắn với dữ liệu trình duyệt của từng tên miền, vì vậy khi đổi từ site đang chơi sang tên miền Vercel, bạn cần tạo hoặc tham gia làng trên bản mới.

## Tổ chức mã nguồn

Chuẩn thiết kế giao diện cho tính năng mới và các lần sửa UI: [GAME_UI_STANDARD.md](docs/GAME_UI_STANDARD.md). Bảng Công cụ ưu tiên lưới/phân trang; chi tiết ưu tiên cuộn có chỉ báo rõ; số việc dùng badge, tên và số lượng được tách riêng.

| Thư mục | Nội dung |
| --- | --- |
| `public/` | Giao diện, bản đồ Canvas và engine JavaScript dùng chung với bản thử |
| `server/` | Worker xác thực phiên, chạy engine, ghi D1 |
| `drizzle/` | Migration SQL |
| `scripts/` | Máy chủ SQLite cục bộ và gói build dùng cho bản xem trước |
| `test/` | Kiểm thử luật game và API |

## Kiểm thử nhanh sau triển khai

Rà soát dung lượng và tài nguyên cũ: xem [báo cáo dọn project 21/11/2026](docs/PROJECT_CLEANUP_2026-11-21.md), gồm danh sách file đã loại, backup và lệnh khôi phục. Chạy `npm run check:assets` để kiểm tra tham chiếu tài nguyên trước khi deploy.

- Khách A tạo làng. Khách B nhập cùng mã từ trình duyệt khác. Cả hai thấy nhau trong Hàng xóm.
- A thu tối thiểu 4 sản phẩm cùng loại vào kho. B ghé kho và lấy 1. B không thể lấy lần hai ở cùng vườn trong cùng ngày. Tải lại và đối chiếu kho cùng nhật ký.
- A đăng bán nông sản. B mua. Sạp biến mất, tiền chuyển cho A và nông sản xuất hiện trong kho B.
- Phiên đăng nhập vẫn dùng được sau khi tải lại. Bản demo và làng online có tiến trình độc lập.

## Nguồn triển khai

- [Cloudflare D1 Getting Started](https://developers.cloudflare.com/d1/get-started/)
- [Cloudflare Worker D1 API](https://developers.cloudflare.com/d1/worker-api/)
- [Vercel Rewrites](https://vercel.com/docs/routing/rewrites)


Mục tiêu tiếp theo V1: hướng dẫn vụ đầu và ghim nâng công trình, theo [tài liệu triển khai](docs/NEXT_GOAL_V1.md).

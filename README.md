# Vườn Mùa Vui

Game nông trại 2D trên trình duyệt, giao diện tiếng Việt. Chơi ngay ở vườn thử, hoặc tạo làng và gửi mã cho bạn bè. Mỗi làng có tối đa 12 vườn. Vườn thử có sẵn hai hàng xóm mẫu. Làng online lưu riêng.

## Điều khiển

Dùng **WASD** hoặc **phím mũi tên** để đi. Tới gần lối ra, ô đất, quầy chợ hoặc cửa kho rồi nhấn **E**. Bạn cũng có thể bấm hoặc chạm trên bản đồ để nhân vật tự tìm đường đến điểm đó. Trên màn hình cảm ứng có thêm cụm nút hướng.

Bản đồ gồm vườn nhà, chuồng trại, chợ, đường làng và vườn hàng xóm. Nhân vật, công trình và vật nuôi dùng sprites minh họa WebP. Canvas 2D vẽ các lớp cảnh, cây trồng và hiệu ứng thời tiết. Dùng các tab bên cạnh bản đồ để mở tác vụ trong khu, đơn hàng, kho, xây dựng hoặc nhật ký. Bấm thời tiết trên bản đồ để xem dự báo. Tọa độ nhân vật chỉ dùng trên thiết bị đang chơi. Trạng thái ruộng, chuồng, kho, sạp và lượt ghé vẫn dùng chung trong làng online.

## Lịch và thủy sản

- Một ngày game kéo dài 8 giờ thực. Thời tiết thay đổi mỗi 2 giờ gồm nắng nhẹ, mưa rào, nhiều mây, nắng nóng, gió mạnh, sương và dông. Dữ liệu làng cũ ghi nhận thời điểm chuyển lịch khi vào lại. Vườn có sẵn cá giống, tôm giống và thức ăn khởi đầu.
- Vườn nhà và vườn hàng xóm có kích thước 820 × 640 đơn vị, hồ làng có kích thước 720 × 432 đơn vị, với camera theo nhân vật và bản đồ nhỏ. Dùng nút khu vực để đi nhanh tới hồ làng hoặc men theo lối ra phía đông nam vườn nhà.
- Chọn Ao nuôi hoặc đến cầu gỗ cạnh ao. Cá và tôm ở chung ao, với sức chứa 6 con ở ao chính và 2 con ở ao xây thêm. Cá rô phi, tôm càng và cá chép cần lần lượt 20, 35 và 55 phút tăng trưởng cơ sở khi có thức ăn. Thời tiết làm thay đổi tốc độ lớn.
- Hồ làng miễn phí 12 lượt thành công/ngày. Thả câu và chờ 6 giây trước khi kéo cần, sau đó nghỉ 45 giây. Tỷ lệ cá chép vàng là 2% lúc sương, 4% lúc mưa rào và 3% trong các thời tiết còn lại có thể thả câu.
- Câu ở ao hàng xóm chỉ lấy được 1 cá trưởng thành nếu chủ ao còn tối thiểu 3 con trước khi câu. Lượt câu dùng chung giới hạn lấy đồ từ ruộng và kho. Cổng đóng bảo vệ 30 phút.

## Đất và chơi cùng khu vực

- Mỗi người có 2 ô đất trống cùng kích thước và các công trình cơ bản như nhau. Trong tab **Đất**, mua thêm tối đa 6 ô, chọn xây vườn có 3 luống, ao nuôi hoặc chuồng tối đa 2 con. Giá ô mua đầu tiên là 65 xu. Có thể chọn công trình từ bản đồ hoặc dùng **Tới ô**.
- Hàng rào có kiểu gỗ mật ong, gỗ trắng và tre xanh. Trang trí từng công trình từ tab **Đất** hoặc mở **Hàng rào công trình chính** trong **Xây dựng**. Hàng rào trang trí khác với nâng cấp an ninh.
- Trong làng online, chợ, hồ và đường làng là khu chung. Ở vườn nhà, chủ và khách cùng xem một bố cục. Vị trí cập nhật khoảng 1,2 giây, trình duyệt nội suy giữa các cập nhật. Nút **Chat** nằm dưới bản đồ, chỉ hiện khi đã vào làng. Phòng chat theo khu vực, cùng người chơi trong làng.
- Khi nâng cấp một bản tự triển khai, chạy lệnh migration D1 trước khi cập nhật Worker. Migration mới thêm bảng vị trí và chat, giữ dữ liệu farm hiện có.

## Nhịp chăm sóc, sức khỏe và tài sản

- Vụ mới có thời gian cơ sở 8 phút (lúa mì), 15 phút (cà rốt), 25 phút (bắp). Gà lớn sau 20 phút có thức ăn và cần thêm 15 phút mỗi kỳ trứng, bò 45 phút và 30 phút mỗi kỳ sữa, lợn 60 phút và 40 phút mỗi kỳ tìm nấm truffle. Chuồng chính cấp 2 mở bò và lợn. Thời tiết và chăm sóc tác động vào tốc độ. Vụ đã gieo giữ mốc cũ, vật nuôi đang nuôi hoàn thành kỳ hiện tại rồi chuyển sang thời gian mới.
- Ô đất trống trong 8 giờ thực sẽ chai và cần **Cuốc đất** trước khi gieo. Ô mới mở và ô vừa thu hoạch có 8 giờ để gieo ngay. Bản đồ vẽ vết nứt trên đất chai, bảng Việc cần làm chỉ đến ô đó. Làng cũ bắt đầu tính thời gian đất trống từ lần đầu mở bản cập nhật.
- Trong mưa và 20 phút sau mưa, nguy cơ sâu tăng nhanh. Bảng Việc cần làm nhắc trị sâu sớm hơn trong thời gian này. Thuốc còn hiệu lực vẫn ngăn sâu tích lũy.
- **Chợ làng → Vật tư / Bán nhanh / Sạp làng** đều có tìm theo tên, hỗ trợ gõ tiếng Việt có dấu hoặc không dấu. Ở **Bán nhanh**, chọn **Bán hết** để bán toàn bộ hàng hiện có của riêng mặt hàng đã chọn.
- Giữ giống: khi thu hoạch, chọn **Thu và giữ 1 giống**, hoặc vào **Nông trại → Kho** để đổi nông sản còn giữ thành giống. Mỗi nông sản đổi được một giống cùng loại. Ô trồng được sử dụng lại ngay sau thu hoạch.
- **Chợ làng → Đơn làng** có 3 đơn dùng chung mỗi ngày game (8 giờ). Vườn nào giao đủ trước sẽ nhận thưởng. Đơn đã giao rời bảng của mọi vườn. Một đơn có thể là giỏ nhiều mặt hàng. Xem trước đơn ngày mai ở cuối bảng. Làng cũ giữ hạng và các dự án, các đơn đã giao trong ngày được ẩn khỏi bảng.
- **Làng → Cấp làng** có các mốc Làng, Xã, Phường, Quận và Thành phố. Thu nhập là tổng tiền bán nhanh và thưởng giao đơn, tính từ bản có cấp làng. Số đơn cộng dồn. Trộm thành công ở vườn, kho và ao dùng chung giới hạn theo ngày game của làng, giảm theo cấp từ 12 xuống 8, 5, 3 và 1. Lên cấp cần góp đủ xu xây một công trình và có chuỗi ngày liên tiếp đã kết thúc với số vụ nằm trong giới hạn xét duyệt. Làng cũ bắt đầu tính chuỗi kể từ ngày mở bản này, giữ tiến độ đã tích lũy. Khi hoàn thành đủ điều kiện, cấp tăng tự động.
- Sổ việc hôm nay nằm trong Nhà vườn và bảng Việc cần làm. Chăm cây, thu sản phẩm và bán nông sản hoặc giao đơn để nhận 25 xu và 8 XP mỗi ngày game.
- HUD hiển thị nước, độ no và thể lực. Trồng, chăm, thu hoạch, câu, xây dựng dùng các chỉ số theo thao tác. Trời nóng tốn thêm nước. Bấm thanh Nước để uống, No bụng để ăn, hoặc Thể lực → Chỉ đường về nhà. Trong Nhà vườn, chọn Đến giường rồi Nghỉ lấy sức. Sau 30 giây, thể lực hồi tối đa 46 điểm. Trong lúc nghỉ vẫn có thể xem kho, trò chuyện và giao dịch. Thể lực cũng hồi chậm theo thời gian.
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

## Deploy lên Vercel

Chọn **Vercel** cho giao diện. Nếu muốn tạo làng, mời bạn bè, chat và lưu tiến trình online, dùng thêm **Cloudflare Worker + D1**. Bản chơi thử lưu riêng trong trình duyệt và chỉ cần Vercel.

### Chơi online với Cloudflare Worker và D1

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

Ghi lại URL Worker mà Wrangler trả về, ví dụ `https://vuon-mua-vui.ten-ban.workers.dev`. Mở URL Worker với đuôi `/api/health` để kiểm tra phản hồi `{"ok":true}`. Tiếp theo, sửa `destination` trong `vercel.json` thành URL Worker thực, giữ đuôi `/api/:path*`.

### Đưa giao diện lên Vercel

1. **Chơi thử:** Xóa trường `rewrites` và dấu phẩy cuối sau `"buildCommand": null` trong `vercel.json`. **Chơi online:** Giữ rewrite đã chỉnh ở bước Cloudflare.
2. Đẩy mã nguồn lên GitHub rồi chọn **Add New → Project** trong Vercel để import, hoặc chạy `npx.cmd vercel --prod` ngay tại thư mục gốc. Chọn **Other**, để `public` làm Output Directory, không đặt lệnh build. Cấu hình này đã có trong `vercel.json`. Trên macOS hoặc Linux, dùng `npm` và `npx` thay cho `npm.cmd` và `npx.cmd`.
3. Mở URL Vercel. Với chế độ online, thử `/api/health` qua URL Vercel, sau đó tạo làng và dùng cửa sổ ẩn danh để vào bằng mã. Reload để kiểm tra lưu tiến trình. `/api/health` chỉ xác nhận Worker có binding D1. Tạo và vào làng sẽ kiểm tra các bảng trong D1.

Trình duyệt gọi `/api/*` trên tên miền Vercel. Vercel chuyển tiếp sang Worker, Worker giữ binding D1. Giao diện không cần API token hay biến môi trường. D1 mới bắt đầu với dữ liệu trống. Phiên khách gắn với dữ liệu trình duyệt của từng tên miền, vì vậy khi đổi từ site đang chơi sang tên miền Vercel, bạn cần tạo hoặc tham gia làng trên bản mới.

## Tổ chức mã nguồn

| Thư mục | Nội dung |
| --- | --- |
| `public/` | Giao diện, bản đồ Canvas và engine JavaScript dùng chung với bản thử |
| `server/` | Worker xác thực phiên, chạy engine, ghi D1 |
| `drizzle/` | Migration SQL |
| `scripts/` | Máy chủ SQLite cục bộ và gói build dùng cho bản xem trước |
| `test/` | Kiểm thử luật game và API |

## Kiểm thử nhanh sau triển khai

- Khách A tạo làng. Khách B nhập cùng mã từ trình duyệt khác. Cả hai thấy nhau trong Hàng xóm.
- A thu tối thiểu 4 sản phẩm cùng loại vào kho. B ghé kho và lấy 1. B không thể lấy lần hai ở cùng vườn trong cùng ngày. Tải lại và đối chiếu kho cùng nhật ký.
- A đăng bán nông sản. B mua. Sạp biến mất, tiền chuyển cho A và nông sản xuất hiện trong kho B.
- Phiên đăng nhập vẫn dùng được sau khi tải lại. Bản demo và làng online có tiến trình độc lập.

## Nguồn triển khai

- [Cloudflare D1 Getting Started](https://developers.cloudflare.com/d1/get-started/)
- [Cloudflare Worker D1 API](https://developers.cloudflare.com/d1/worker-api/)
- [Vercel Rewrites](https://vercel.com/docs/routing/rewrites)
#   t m a f a r m e r  
 
# Dọn dung lượng — 25/11/2026

## Kết quả

Giảm khoảng **54 MiB**, từ khoảng **486,25 MiB xuống 432,13 MiB** (sai số làm tròn; đo trước khi thêm báo cáo này). Không thay source gameplay, database, tài nguyên runtime hoặc hình/tài liệu thiết kế.

| Thư mục | Trước (MiB) | Sau (MiB) | Xử lý |
| --- | ---: | ---: | --- |
| `dist` | 54,12 | 0 | Build thử thành công rồi dọn bản xuất có thể tạo lại |
| `.local` | 51,30 | 51,29 | 24 file tạm gom vào ZIP; giữ QA, database và backup cũ |
| `docs` | 174,60 | 174,60 | Giữ mô tả, kế hoạch, concept, master và ảnh kiểm chứng |
| `public` | 23,13 | 23,13 | Không có tài nguyên dư theo kiểm tra tham chiếu |
| `.git` | 182,74 | 182,74 | Giữ lịch sử; không xóa object, không viết lại commit |

Không có profile Edge lớn cần dọn trong lần này. So với lần dọn trước, dung lượng tăng chủ yếu ở tài liệu/ảnh ghi nhận thiết kế và lịch sử Git. `dist` tạo thêm bản sao client và bản asset mã hóa cho server; đây là đầu ra build, không phải tài nguyên nguồn bị nhân đôi ngoài ý muốn.

Đã thử tính khả năng nén PNG lossless nhưng **không ghi lại ảnh**: tiết kiệm khoảng 4,65 MiB trên 51 file. Việc commit lại nhiều ảnh đã được theo dõi sẽ tạo thêm phiên bản nhị phân trong Git, không phù hợp mục tiêu giảm dung lượng hiện tại. Giữ nguyên toàn bộ byte ảnh gốc.

## Backup

24 file được dọn là các script chạy một lần để ghép/sửa code, tạo script kiểm tra, ghi tài liệu và báo cáo thử nén PNG trong `.local`. Giữ script QA có thể dùng lại; không dọn `.local/farm.sqlite` hoặc `.local/cleanup-backups/2026-11-21-*`.

Backup mới (chỉ có trên máy hiện tại, không commit/deploy):

```text
.local/cleanup-backups/2026-11-25-temporary-scripts.zip
SHA-256: 4515ade8f353ca86fb07bc6265de67e673767b354b986fa22d7e24e44ee2c6ee
```

Đã mở lại ZIP để kiểm tra kích thước và SHA-256 từng file trước khi xóa. Manifest `_cleanup-manifest.json` trong ZIP tương thích công cụ khôi phục hiện có:

```powershell
py scripts/restore-cleanup-backup.py .local/cleanup-backups/2026-11-25-temporary-scripts.zip
# Thêm --apply khi cần khôi phục; công cụ không ghi đè file đang tồn tại.
```

`dist` không cần backup vì tạo lại bằng `npm run build`.

## Theo dõi và dọn lần sau

```powershell
npm.cmd run check:size
# Xem trước đúng đường dẫn dist sẽ dọn:
powershell -NoProfile -File scripts/clean-build.ps1
# Dọn đầu ra build:
powershell -NoProfile -File scripts/clean-build.ps1 -Apply
```

Công cụ chỉ nhận đúng thư mục `dist` trực tiếp dưới workspace và từ chối thư mục liên kết. Không dọn database, tài liệu, lịch sử hoặc backup. `check:size` chỉ đọc dung lượng, bỏ qua symlink để không tính nhầm dữ liệu ngoài dự án.

Các lần kiểm chứng UI sau nên giữ số ảnh tối thiểu cần đối chiếu, để ảnh tạm/profile trình duyệt trong `.local` rồi dọn khi kết thúc. Không xuất lại cả bộ ảnh nếu chỉ sửa một phần UI.

## Kiểm chứng

- 150/150 kiểm thử đạt.
- `npm run build` đạt; sau đó dọn lại `dist` để giữ dung lượng đã giảm.
- `check:assets`: không thiếu tài nguyên, không có tài nguyên cần xem xét xóa; `progression-crops-v2.png` vẫn là đầu vào quy trình đồ họa.
- `check:gameplay-docs`: catalog khớp source.
- `git diff --check` đạt. Cần build lại khi muốn dùng đầu ra `dist` để deploy.

## Rà soát tiếp ngày 27/11/2026

Đã hoàn thành dọn cục bộ, chưa commit/push. Không thay code gameplay, hình vẽ, UI hoặc database.

| Phạm vi | Trước | Sau |
| --- | ---: | ---: |
| Toàn workspace, gồm Git/tài liệu/backup | 708,49 MiB | 539,56 MiB |
| `.local` | 233,63 MiB | 64,69 MiB |
| Tài nguyên media trong `public` | 22,66 MiB | 22,66 MiB |

Giảm khoảng **168,93 MiB (23,8%)**. Số sau đo khi đã xóa `dist` vừa sinh từ lần kiểm tra build; build có thể tạo lại.

### Đã dọn

- Ba hồ sơ Edge QA cũ không còn tiến trình sử dụng: `edge-recovery-qa`, `edge-taskbook-qa`, `edge-taskbook-v3-qa`, tổng 168,92 MiB. Giữ bản nén Local Storage/IndexedDB/Session Storage nếu có; cache, lịch sử và cookies của hồ sơ kiểm thử được loại, không phải hồ sơ Edge cá nhân.
- 40 script chỉnh sửa/chụp/kiểm tra tạm dùng một lần trong `.local` đã đưa vào ZIP; giữ các script `qa-*` có thể tái sử dụng, database `farm.sqlite`, ảnh, manifest và các backup trước.
- Xóa đầu ra build sau khi xác nhận build thành công.

### Không xóa

- `docs` và tài nguyên thiết kế/concept/kế hoạch (~220,97 MiB), `.git` (~230,15 MiB), toàn bộ database và backup.
- Atlas cũ còn dùng trong pipeline, gồm `public/pixel/progression-crops-v2.png`.
- Asset runtime: audit không tìm thấy thiếu tham chiếu hoặc ứng viên dư rõ ràng. Không dùng kết quả tìm chuỗi đơn giản để tự xóa sprite có URL động.

### Khôi phục

Manifest tại `.local/cleanup-backups/20261127-201908-local-cleanup-manifest.json`, ghi đường dẫn gốc, kích thước, SHA-256 của từng helper và tên ZIP.

Khôi phục các helper vào `.local` bằng:

```powershell
Expand-Archive -LiteralPath '.local/cleanup-backups/20261127-201908-one-off-helpers.zip' -DestinationPath '.local'
```

Mỗi hồ sơ QA có ZIP riêng dạng `20261127-201908-edge-...-qa-state.zip`. Khi cần, giải nén vào thư mục `Default` của đúng hồ sơ, chỉ sau khi đóng trình duyệt đó. Cache không sao lưu vì Edge tự tạo lại. Không giải nén vào hồ sơ Edge cá nhân hoặc ghi đè database game.

### Công cụ và kiểm chứng

Thêm `scripts/clean-local-cache.ps1`: mặc định chỉ xem trước; `-Apply` kiểm tra đường dẫn, từ chối symlink/junction, kiểm tra Edge không dùng hồ sơ, sao lưu trước khi xóa. Danh sách hồ sơ cố định, không tự quét xóa các hồ sơ mới. ZIP helper được mở kiểm tra tên/kích thước entry trước khi xóa bản gốc. Chạy lại sau dọn cho kết quả 0 hồ sơ, 0 helper.

```powershell
powershell -NoProfile -File scripts/clean-local-cache.ps1
powershell -NoProfile -File scripts/clean-local-cache.ps1 -Apply
```

223 tests và build đạt; asset audit không thiếu file; progression hợp lệ (13 cấp bậc, 16 cây, 10 vật nuôi); tài liệu gameplay khớp source. Không deploy hoặc thao tác database production.

### Bước tiếp theo: kiểm tra chống đưa tệp rác trở lại source

Thêm `npm run check:workspace` (`scripts/audit-workspace.mjs`) để kiểm tra chỉ đọc sau mỗi đợt thử hoặc trước commit:

- Liệt kê tệp tracked và untracked không bị Git bỏ qua; báo lỗi nếu có thư mục sinh tự động, cache, tệp môi trường thật, database cục bộ hoặc bản backup ngoài tài liệu thiết kế trong source. Giữ `.env.example` và fixture database trong `test/fixtures`.
- Không coi ảnh/concept/kế hoạch hoặc ZIP trong `docs` là tệp rác. Không tự xóa asset; tiếp tục dùng `check:assets` cho tham chiếu runtime.
- Báo riêng `docs`, `.git`, dữ liệu/cache/backup `.local` và đầu ra build. `dist` có thể tồn tại để deploy nếu được Git bỏ qua; không báo lỗi chỉ vì vừa build xong.
- Liệt kê dung lượng các hồ sơ Edge QA nếu xuất hiện lại, nhưng không tự đóng trình duyệt hoặc xóa profile đang sử dụng.
- Có `--json` cho công cụ khác đọc; khi không gọi được Git, báo lỗi rằng chưa kiểm tra, không trả kết quả đạt giả.

Đã thử bằng tệp `.tmp` giả trong source: báo lỗi đúng; ZIP giả trong đường dẫn tài liệu thiết kế không bị báo nhầm. Các tệp thử đã được xóa và kiểm tra lại đạt. Build đạt; chạy audit khi có `dist` 54,52 MiB vẫn đạt và báo rõ đây là đầu ra sinh tự động; sau kiểm tra dọn `dist` trở lại. Không chạy lại test engine vì không thay code game; 223 kiểm thử của lần dọn trước đã đạt. Chưa commit/push.

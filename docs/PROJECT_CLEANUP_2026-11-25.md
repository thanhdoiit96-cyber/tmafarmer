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

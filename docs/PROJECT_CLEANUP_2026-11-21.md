# Rà soát và dọn dung lượng — 21/11/2026

Đã dọn các bản xuất đồ họa cũ không còn được game dùng và dữ liệu kiểm thử tạm. Giữ nguyên toàn bộ 138 file tài liệu/thiết kế ban đầu trong `docs`, các mô tả, kế hoạch, ảnh nguồn, concept được duyệt, mẫu so sánh và script xuất hình. Không sửa luật chơi, layout, database hay lịch sử Git.

## Dung lượng

Đơn vị MiB; số liệu trước khi bổ sung báo cáo này. Tổng tính cả thư mục ẩn, build và bản sao lưu.

| Nhóm | Trước | Sau |
| --- | ---: | ---: |
| `.local` | 1458,19 | 51,18 |
| `public` | 23,64 | 23,06 |
| `dist` sau build lại | 55,30 | 53,96 |
| `docs` | 145,24 | 145,24 |
| `.git` | 153,80 | 153,80 |
| Toàn thư mục | khoảng 1836,51 | khoảng 427,57 |

Giải phóng khoảng **1409 MiB (1,38 GiB)**, đã tính cả bản backup còn giữ. Nguồn tăng bất thường là 14 profile Edge kiểm thử: cache, mô hình trình duyệt, thư viện DRM và các component tự tải. Không phải toàn bộ dung lượng này được đưa lên production; `.local` vốn đã nằm trong `.gitignore`.

## Đã dọn

- 14 profile trình duyệt kiểm thử `.local/edge-*` và 92 ảnh frame/chụp tạm trực tiếp trong `.local`. Đã sao lưu dữ liệu Local Storage, IndexedDB, Session Storage, phiên và thiết lập của những profile này. Cache và component Edge có thể tải/tạo lại nên không giữ lâu dài.
- 15 file cũ trong `public`, tổng 603.000 byte, không còn được runtime, CSS hoặc atlas metadata hiện tại sử dụng:

```text
public/dia-hinh.webp
public/pixel/characters-v1.png
public/pixel/characters-v2.png
public/pixel/crop-stages.png
public/pixel/garden-decor-v1.png
public/pixel/livestock-v1.png
public/pixel/parcel-pond-v2.png
public/pixel/parcel-shelter-v2.png
public/pixel/progression-crop-frames-v2.mjs
public/pixel/progression-crop-frames-v3.mjs
public/pixel/progression-crops-v1.png
public/pixel/progression-crops-v3.png
public/pixel/progression-livestock-v1.png
public/pixel/vertical-slice-v1.png
public/pixel/vertical-slice-v2.png
```

Các tên file trong ghi chép lịch sử vẫn được giữ để bảo toàn diễn biến thiết kế; khi cần so sánh bản runtime cũ, khôi phục từ archive bên dưới. Các generator lịch sử cũng được giữ; chạy chúng sẽ tạo lại các bản cũ và cần rà soát trước khi build/deploy.

## Những file cần giữ dù tên dễ gây nhầm

- `scene-backgrounds-concept-v1.png`, `scene-backgrounds-environments-v1.png`: game vẫn dùng cho các scene.
- `scene-background-homestead-v1.png`: renderer vẫn lấy texture đất từ ảnh này.
- `progression-crops-v2.png`: không dùng trực tiếp trong game nhưng bộ xuất cây V4 còn đọc để so sánh. Xóa sẽ làm hỏng quy trình xuất hình.
- Tám atlas nhân vật trung niên/cao tuổi: URL tạo động từ `avatar-models.mjs`; không thể kết luận là thừa chỉ bằng tìm tên file tĩnh.
- Ảnh nguồn trong `docs/assets`: phục vụ thiết kế, kế hoạch, đối chiếu và tái xuất tài nguyên.
- `.local/farm.sqlite` và script QA nhỏ: giữ nguyên. Không dọn `.git` hoặc viết lại lịch sử.

## Backup và khôi phục

Archive cục bộ, không commit và không deploy:

```text
.local/cleanup-backups/2026-11-21-project-cleanup.zip
.local/cleanup-backups/2026-11-21-manifest.json
```

Archive khoảng **50,99 MiB**, chứa 385 file. Manifest bên trong `_cleanup-manifest.json` ghi đường dẫn tương đối, kích thước và SHA-256 từng file. Manifest bên ngoài còn ghi checksum archive, danh sách target đã dọn và số file cache có thể tái tạo đã bỏ qua. Không đưa dữ liệu phiên trình duyệt vào tài liệu hay Git.

SHA-256 của ZIP:

```text
22f149936e0e335bf275c9757ae310852106641a650c1ae121d6c069df413abd
```

Kiểm tra file cũ trước khi khôi phục (không ghi file):

```powershell
py scripts/restore-cleanup-backup.py .local/cleanup-backups/2026-11-21-project-cleanup.zip --prefix public/pixel
```

Khôi phục riêng một file:

```powershell
py scripts/restore-cleanup-backup.py .local/cleanup-backups/2026-11-21-project-cleanup.zip --prefix public/pixel/characters-v2.png --apply
```

Bỏ `--prefix` để kiểm tra toàn archive hoặc khôi phục tất cả file đã sao lưu. Công cụ kiểm checksum trước khi ghi, giới hạn đường dẫn trong project và từ chối ghi đè file đã tồn tại. Profile trình duyệt chỉ khôi phục dữ liệu đã lưu; cache/component sẽ được trình duyệt tạo lại. Đã thử khôi phục thực tế `characters-v2.png`, kiểm tra thành công rồi dọn lại file thử đó.

Backup nằm trên máy hiện tại. Một checkout mới chỉ có tài liệu và công cụ khôi phục; cần chép ZIP sang máy đó nếu muốn dùng archive này.

## Kiểm tra sau dọn

- 128/128 test đạt; build production thành công.
- Kiểm tra mọi asset trong worker production trả HTTP 200; 15 file đã loại trả 404.
- `npm run check:assets`: không thiếu file được tham chiếu, không còn ảnh runtime cần xem xét loại bỏ; chỉ còn atlas V2 phục vụ xuất hình.
- Công cụ audit có tính đến tám URL avatar tạo động. Đây là báo cáo hỗ trợ rà soát, không tự xóa file và không thay thế kiểm thử trình duyệt khi thay đổi renderer.

Để hạn chế tăng lại: dùng một profile QA ổn định, giữ các screenshot đã chọn trong `docs/assets`, dọn frame tạm sau khi tổng hợp và chạy `npm run check:assets` trước khi triển khai thay đổi tài nguyên.

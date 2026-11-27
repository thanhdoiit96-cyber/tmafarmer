# Hiên nhà ba miền — runtime V1

Ngày 27/11/2026. P3.1 đã duyệt, bổ sung yêu cầu truyền thống ba miền và chặn đi xuyên. P3.2 hoàn thiện source; chưa commit/push/deploy.

## Cách sử dụng

Nông trại → Đất → Trang trí vườn → **Phong cách · miễn phí**:

- Bắc Bộ: gốm xanh men lam, tre vàng, sen hồng và đèn tre tròn.
- Miền Trung: gốm nâu mộc, đèn lồng nhỏ màu ấm, ấm trà đất.
- Nam Bộ: chậu đất nung, đèn mây đan, khay tre và chén sáng màu.
- Mẫu hiện tại: giữ sprite chậu/đèn cũ; bàn trà mới dùng mẫu Bắc Bộ làm mặc định.

Đây là hướng mỹ thuật lấy cảm hứng từ vật liệu ba miền, không khẳng định mỗi vật dụng chỉ có ở một miền. Giữ cùng góc nhìn, ánh sáng và mật độ pixel.

Đổi lựa chọn chỉ đổi ảnh danh mục/xem thử. **Áp dụng** mới lưu phong cách, miễn phí. Xác nhận đặt có thể lưu phong cách kèm món trong cùng action; hủy xem thử không lưu. Phong cách đổi hình chậu sen/đèn tre/bàn trà đã sở hữu, không cấp hoặc đặt đồ miễn phí.

Thêm **Bàn trà sen**, 75 xu hoặc một phiếu theo cơ chế trang trí hiện có. Điểm gợi ý riêng **Sân trà trước xưởng** `(100,435)` ngoài đường/ruộng; không ép bàn vào hiên chật. Giữ nguyên ID/tọa độ điểm đặt cũ. Có 14 món và 14 vị trí, sắp xếp tự động không đặt trùng chỗ.

Hàng xóm có họa tiết nhỏ trên trụ khi chủ nhà áp phong cách, thêm chậu nhỏ nếu đã đặt sen. Giữ năm bậc tài sản, tên vẽ bằng code, sáu nhà/trang, tối đa 12 người. Không thay nền hoặc mái nhà. Stamp/trang kỷ niệm P3.4 chưa triển khai.

## Nguồn và runtime

[Master alpha](assets/lotus-three-regions-source-v1.png) 1448×1086: hàng Bắc/Trung/Nam; cột chậu/đèn/bàn/trụ sen. `public/pixel/lotus-porch-v1.png` 224×144, 12 frame 56×48, baseline 45, alpha 0/255, padding đầy đủ. [Bản đối chiếu 4× nearest-neighbor](assets/lotus-three-regions-runtime-v1.png).

Xuất lại bằng `py scripts/normalize-lotus-porch-v1.py`: chuẩn hóa từng cell, kiểm silhouette và alpha. Metadata `porchAtlas`/`porchFrame` export qua `public/pixel/frames.mjs`. Canvas và danh mục dùng cùng sprite. Giữ atlas cũ; không lấy thumbnail concept làm sprite.

## Vùng cản và dữ liệu

`gardenDecorBlocks` cản ở chân đồ trong Vườn nhà/vườn đang thăm, không cản toàn bộ tán lá/chụp đèn. Cổng hoa cản hai trụ, chừa giữa. Các phong cách dùng cùng footprint. Hàng xóm có vùng cản nhỏ tại chậu/trụ, giữ lối vào tên/cổng. `walkable`/`route` dùng cùng blocks cho phím/joystick/click; giữ `world.approach`.

Nếu snapshot mới khiến nhân vật nằm trong vật cản mới đặt, tìm điểm đi được gần đó trong bán kính 40; không đổi scene hoặc dịch chuyển xa. Không tìm được thì giữ vị trí. Xem thử dựng scene riêng với vùng cản dự kiến, không chặn vườn thật trước xác nhận. Chưa mở rộng thành hệ chống gian lận tọa độ server.

`farm.porchTheme` là trường JSON tùy chọn, save cũ dùng `classic`; server chỉ chấp nhận bốn ID khai báo. Snapshot hàng xóm trả phong cách. Không đổi schema DB/cấp/XP/sản lượng/giá đồ cũ. Vị trí/tiền/phiếu được kiểm trước khi lưu phong cách kèm món.

Tắt hình mới bằng Mẫu hiện tại, cất bàn nếu cần; không xóa quyền sở hữu. Khi rollback code cần giữ trường JSON và ID món mới. Client cũ không biết bàn sẽ không hiện nó; không xóa save để rollback hình ảnh.

## Kiểm chứng

- **233 kiểm thử đạt**: phong cách không tăng tài sản; xem thử không lưu; trả phiếu; chỗ bị chiếm không đổi phong cách/trừ tiền; chặn chân đồ, cổng còn lối, thoát vật cản mới, mọi hotspot cửa/ruộng/ao còn tiếp cận khi đủ 14 món; đủ hai trang làng 12 người/tên dài.
- Edge demo 1100×850, 844×390, 568×320: chọn/thử/áp dụng ba phong cách, các trang danh mục và popup vừa khung, xem thử bàn có hình. Hai trang Hàng xóm và scene mưa/sương chạy không lỗi JS. Chưa thử Safari/iOS/Android thật.
- Master/atlas đã kiểm alpha, padding, 4× và Canvas 640×384. Build, asset audit, catalog gameplay đạt. Runtime media tăng khoảng 0,03 MiB, 22,66 → 22,69 MiB.

Ảnh thật: [Vườn nhà](assets/porch-three-regions-field-v1.png), [Hàng xóm](assets/porch-three-regions-neighbors-v1.png), [popup ngang thấp](assets/porch-regional-preview-568.png). Chỉ giữ hai ảnh Canvas và một popup; dọn profile QA/dist sau kiểm tra.

Bước tiếp theo: P3.4 trang kỷ niệm từ kết quả góp hàng hiện có. Chưa bắt đầu; pilot chưa có dữ liệu, chưa mở thanh toán.

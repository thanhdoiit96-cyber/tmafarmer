# Sổ chuồng và bảng đơn V4 — tích hợp runtime

27/11/2026. **Hoàn thiện source theo bản được duyệt**, chưa commit/push/deploy. Thay UI V1/V2 và hướng danh sách V3; giữ nguyên engine nuôi, kinh tế, lưu database và trả thưởng.

## Sổ chuồng

- Khung gỗ và giấy trong vùng bảng tác vụ hiện có; không mang trang prototype vào game hoặc đặt bảng đè lên map.
- Sáu ô/trang (3×2), ảnh dùng cùng atlas với cảnh chơi, nhãn trạng thái và một nút thức ăn/thu hoặc ETA. Chạm ảnh mở quản lý. Không lặp số thức ăn cần trong nội dung ô.
- Bộ lọc Tất cả/Thu/Cần ăn, trang riêng cho chuồng chính và từng chuồng phụ. Giữ trang/lọc qua polling; thu hẹp danh sách thì giới hạn trang hợp lệ. Không sửa thứ tự mảng `farm.pens`.
- Mỗi thao tác giữ ID con vật và index nguồn, không dùng vị trí ô trên trang. Mở từ Việc cần làm hoặc map tự chọn trang có con cần chăm, kể cả index 0. `world.approach()` vẫn chạy trước feed/collect.
- Đón thêm mở bộ chọn hiện có trong hộp thoại; mua thành công thì đóng và đưa sổ tới con mới. Không gắn bộ chọn dài phía dưới sổ. Nâng cấp chuồng phụ nằm trong mục mở rộng.

## Quản lý và thông tin thật

Ảnh/chuồng/trạng thái cùng hai thông tin chính: sản lượng lứa này và ETA tới lần thu. ETA gồm phần lớn lên còn thiếu và thời gian tạo sản phẩm; lúc đói ghi “Sau cho ăn”, không giả đếm ngược.

Mục **Tốc độ & sản lượng** mở sẵn, lấy dữ liệu thật:

| Dòng | Ý nghĩa |
| --- | --- |
| Thời tiết | Chênh lệch hệ số `weather.animal` so cơ sở |
| Chuồng · che chắn/mưa | Hệ số còn lại từ engine sau tác động thời tiết, gồm bảo vệ chuồng cao và bất lợi mưa ở chuồng cấp 1 |
| Tốc độ đạt / cơ sở | Tỷ lệ tốc độ cuối; 100% là tốc độ cơ sở, không phải đứng yên |
| Sản lượng · số lứa | Mức giảm thật sau làm tròn theo `animalCondition`; thời tiết không giảm lượng sản phẩm |

Các hệ số tốc độ nhân nhau, không cộng phần trăm. Ví dụ dông hệ số 0,70, chuồng cao giữ tốc độ 0,95: thời tiết −30%, chuồng bù khoảng +35,7% trên tốc độ đó, kết quả đạt 95% cơ sở. Không đổi công thức engine để phù hợp bảng giải thích.

Thức ăn, quá trình lớn/tạo sản phẩm, tuổi kinh tế và chuyển chuồng có mục mở rộng. Hiển thị số lứa, ngưỡng 30/70, quy đổi save cũ và quy tắc nghỉ chơi không tăng tuổi. Bán vẫn có giá thật và xác nhận mất con vật/sản phẩm chưa thu; không thực hiện chỉ bằng mở quản lý.

## Bảng đơn

- Bảng gỗ, phiếu giấy, dấu tiến độ và ba ô nguyên liệu theo bản duyệt. Một cụm Góp/Ghim/Cách có cho món đang chọn, không lặp nút trong từng thẻ.
- Chọn món giữ qua polling của cùng đợt; đổi đợt thì chọn món hợp lệ. Ghim vẫn theo ID đợt và vườn, không tự chuyển mục tiêu.
- Mốc cá nhân ở chân phiếu. Quà/điều kiện và người góp mở riêng, lấy từ snapshot thật. Cảnh báo không hoàn lại và điều kiện đủ 3 món/cả làng hoàn thành được hiện lại trong xác nhận góp.
- Đơn chợ dùng một phiếu/trang và nút Giao hiện có; giữ phiếu đang xem bằng ID khi đồng bộ. Không thay bằng cơ chế góp. Không thay thời hạn/thưởng hoặc hoàn hàng.

## Kiểm chứng

201/201 tests đạt, thêm coverage cho sáu ô, lọc/trang, chuồng phụ, index 0, mở đúng trang theo target và tác động tốc độ nhân nhau/sản lượng thật. Các kiểm thử API góp cuối đồng thời/retry và engine nuôi hiện có vẫn đạt. Build, import engine build, audit assets và catalog gameplay đạt. Public giữ 22,66 MiB, không thêm atlas hoặc migration.

Chromium runtime dùng demo riêng: giữ trang/lựa chọn qua polling, cho ăn đúng ID/index 0 sau approach, góp qua engine demo và cảnh báo, ghim, phân trang đơn chợ, đón thêm thực sự, chuyển đúng con sang chuồng phụ và kiểm tra ở sổ chuồng phụ, bước xem trước bán. Touch mở quản lý và kiểm tra không tràn ngang ở 844×390/568×320. Chưa thử trực tiếp Android/iOS Safari; không dùng kiểm chứng demo làm kết quả pilot người chơi.

- [Sổ chuồng desktop](assets/stable-book-v4-runtime.png) · [ngang](assets/stable-book-v4-runtime-landscape.png)
- [Bảng đơn desktop](assets/order-book-v4-runtime.png) · [ngang](assets/order-book-v4-runtime-landscape.png)
- [Quản lý với tác động thật](assets/animal-management-v4-runtime.png)

Giữ bản phác thảo ở [V4](ORDERS_ANIMAL_UI_DRAFT_V4.md) để đối chiếu. Bước tiếp theo là đánh giá bản chạy này trên thiết bị thật trước khi chuyển sang nội dung P2.2; pilot Social/Ao vẫn chưa có kết quả người chơi.

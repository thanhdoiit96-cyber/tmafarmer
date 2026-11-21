# Sáu nhân vật nông dân Việt Nam

## Lựa chọn và lưu

Hai mã cũ `female`, `male` giữ nguyên, thuộc nhóm thanh niên. Bốn mã mới: `female-middle` (cô), `male-middle` (chú), `female-elder` (bà), `male-elder` (ông). Dùng áo bà ba, nón lá, dép nâu; nhân vật cao tuổi có tóc bạc/râu bạc và nét mặt lớn tuổi. Ngoại hình không ảnh hưởng chỉ số, tốc độ, phần thưởng hay tiến trình.

`public/avatar-models.mjs` là nguồn chung cho giới tính, độ tuổi, tên, kiểm tra mã và đường dẫn atlas. Mã lưu trong `farm.avatar` như trước, được đưa vào snapshot và presence. Không đổi schema database. Các farm cũ không bị đổi nhân vật. Tạo tài khoản có cùng bộ chọn; sau đăng ký, lựa chọn được áp dụng bằng action `avatar` vào vườn đã gắn tài khoản hoặc vườn demo khi chưa có vườn online. Khi tạo/vào làng, bộ chọn lấy ngoại hình vườn hiện tại; nhân vật được lưu theo từng vườn, không phải thay đồng loạt mọi vườn của tài khoản.

Bộ chọn có giới tính và độ tuổi, đồng bộ với sáu thẻ hình. Có thể đổi miễn phí trong quá trình chơi. Mã không hợp lệ bị server từ chối; dữ liệu cũ thiếu mã dùng nữ thanh niên như trước.

## Hoạt ảnh và tài nguyên

- Giữ nguyên hai atlas nhân vật cũ.
- Mỗi nhân vật mới có atlas base 576 × 256: 12 cột × 4 hướng (xuống, lên, trái, phải). Cột 0–3 đứng, 4–7 đi bộ, 8–11 cuốc đất. Nhổ cỏ dùng cùng động tác cuốc.
- Atlas actions 1152 × 256: 24 cột × 4 hướng; mỗi nhóm bốn cột lần lượt tưới, bón phân, xịt thuốc, gieo hạt, thu hoạch, cho ăn. Thu vật nuôi dùng tư thế thu hoạch như trước.
- Ô runtime 48 × 64, alpha nhị phân, chân ở hàng 59. Tất cả là ảnh toàn thân gồm tay và dụng cụ; không chồng thêm tay/công cụ cho những hành động đã có trong atlas. Các đạo cụ nhỏ khi câu cá/ăn uống vẫn dùng cơ chế hiện có.
- Nguồn `docs/assets/farmer-{id}-{base|actions}-v1-source.png`, runtime tương ứng trong `public/pixel/`. Xuất lại bằng `py scripts/normalize-farmer-ages-v1.py`.
- Script tìm bốn dải hướng và vị trí đầu nhân vật trong nguồn để căn hàng/cột, thay vì chia ảnh theo khoảng đệm tổng thể. Dùng scale chung trong một atlas, ghép chân cố định; atlas actions căn chiều cao theo tư thế đứng của base để giảm nhảy tỷ lệ. Mọi pose phải có alpha thật và không được rỗng.
- Riêng nguồn actions của bà có 22 pose/hướng: xịt và cho ăn có ba pose. Runtime giữ đủ nhịp bốn frame bằng hold tư thế chuẩn bị/hồi phục, không vẽ tay mới và không thay bằng động tác khác. Mapping nằm rõ trong script.
- `scripts/build.mjs` đóng gói module avatar chung cho worker và toàn bộ PNG cho client. Không chỉ giữ tài nguyên ở thư mục generated_images.

## Xem và kiểm tra

- `docs/assets/farmer-ages-actions-preview-v1.png`: sáu người, chín trạng thái cạnh nhau ở cùng tỷ lệ.
- `docs/assets/farmer-ages-actions-v1.gif`: các trạng thái theo cả bốn hướng, từ Canvas renderer thực tế.
- `docs/assets/farmer-ages-game-v1.png`: nhân vật mới trên nền Vườn nhà.
- `docs/assets/farmer-ages-picker-v1.png`: bộ chọn trong form tạo tài khoản.
- Prompt và nguồn tham chiếu được lưu tại `docs/assets/farmer-ages-v1.json`; dùng built-in imagegen.

`test/avatar-ages.test.mjs` kiểm tra sáu tổ hợp, mã cũ, dữ liệu lưu, thay nhân vật không đổi nông trại, kích thước và alpha của tám atlas. `test/api.test.mjs` kiểm tra đổi nhân vật cao tuổi qua API và presence mà người chơi khác nhận. Trình duyệt đã kiểm tra dropdown chọn Nam/Cao tuổi lưu `male-elder`, sáu lựa chọn trong form đăng ký và giao diện 390px không tràn ngang.

# Chỉ dẫn mở khóa P0.3 — V1

Ngày: 25/11/2026. Tiếp nối [Mục tiêu tiếp theo](NEXT_GOAL_V1.md).

## Bố cục và phạm vi

Giữ hộp chi tiết, palette giấy kem/xanh và ảnh hiện có. Nút bị khóa trong danh sách giống, vật nuôi và thủy sản trở thành nút “Xem mở khóa”, không trở thành nút mua. Hộp hiển thị tên nội dung, trạng thái và danh sách điều kiện:

```text
Điều kiện · Dâu
XP nông trại       hiện có / cần    Xem tiến độ
Xưởng máy · cấp    hiện có / cần    Xem công trình

Điều kiện · Xưởng máy cấp kế tiếp
XP, Xu, từng vật liệu: hiện có / cần, đã đạt hoặc còn thiếu
[Ghim cấp kế tiếp]  [Xem bảng công trình]
```

Đây là mở rộng hộp hiện có, không thiết kế lại map hay thêm tranh minh họa. Không có bước tự mua, xây hoặc dùng vật liệu. Công trình đã tối đa không có nút ghim cấp mới. Cấp ghim là cấp kế tiếp hiện tại; không hứa bỏ qua các cấp trung gian để mở cây cao cấp.

## Nguồn dữ liệu và giới hạn

`public/unlock-guide.mjs` lấy ngưỡng từ định nghĩa engine; trạng thái mở khóa lấy `cropRequirement`, `animalRequirement`, `aquaRequirement`, `upgradeRequirement`. Chi phí nâng từ `buildingUpgrade`. Kiểm thử đối chiếu toàn catalog với nhiều mức XP/công trình, gồm chuồng ở mảnh mở rộng index 0.

Hộp liệt kê đồng thời các điều kiện thay vì chỉ lỗi đầu tiên. Không đổi luật engine hay dữ liệu đã lưu. Đủ điều kiện mở khóa không đồng nghĩa đủ nguyên liệu chế biến, giống, sức chứa hoặc xu mua. Những kiểm tra thao tác vẫn do engine quyết định. Xem vật liệu mở chi tiết vật phẩm; không tự chế biến hoặc tự đặt đơn mua.

Ghim mục tiêu vẫn lưu trên thiết bị theo V1 trước. Chưa thêm analytics hoặc đồng bộ lựa chọn sang thiết bị khác. Tóm tắt khi quay lại P1.1 là bước sau, chưa thuộc bản này.

## Kết quả kiểm tra

- 137/137 bài kiểm thử đạt; gồm đối chiếu toàn catalog, nhiều mốc XP/công trình, thiếu đồng thời xu/XP/vật liệu và chuồng mảnh mở rộng index 0.
- Build, kiểm tra asset và đối chiếu catalog gameplay đạt.
- Trình duyệt thật: mở cà phê → xem Xưởng → ghim cấp kế tiếp; xem bò và cua đồng; điều hướng tới Tiến độ; dữ liệu nông trại không đổi sau toàn bộ thao tác chỉ dẫn. Không có lỗi JavaScript; hộp ở 390px không tràn ngang.
- Ảnh thực tế: [desktop](assets/unlock-guide-v1-desktop.png), [điện thoại](assets/unlock-guide-v1-mobile.png).

Chưa commit, push hoặc deploy trong đợt này.

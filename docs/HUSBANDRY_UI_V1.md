# UI Đất, Chuồng và Ao nuôi

Hoàn thiện source ngày 25/11/2026; chưa commit/push hoặc deploy.

## Cách tổ chức

- Đất: danh sách 8 ô nằm trong mục “Đổi ô đất”, mặc định thu gọn khi ô đang chọn đã mua. Ô chưa mua mở danh sách để dễ chọn. Tên ô và loại công trình luôn hiện tại tiêu đề mục chọn.
- Chuồng: tổng hợp số chỗ, số có thể thu, số cần ăn và thức ăn trong túi. Vật nuôi sẵn sàng thu hiện trước, sau đó đến con cần cho ăn và con đang lớn. Giữ chỉ số và ID gốc khi sắp xếp, không thay đích thao tác.
- Mỗi thẻ có hình vật nuôi hiện có, trạng thái, sản phẩm mỗi lứa/có thể thu, thức ăn, tiến độ và nút hành động. Không dồn tất cả vào một đoạn văn. “Chi tiết” chứa thông tin chăm nuôi, tuổi/sản lượng, chuyển chuồng và bán với xác nhận cũ.
- Phần đón thêm vật nuôi nằm sau danh sách; tự mở khi chuồng trống. Số còn chỗ thể hiện ngay ở tiêu đề.
- Ao: cùng bố cục trạng thái và thức ăn; hiển thị từng lứa đang nuôi trước lựa chọn thả mới. Thức ăn tính cho cả lứa, sản phẩm trừ phần đã lấy. Mục “Cách nuôi & sản lượng” giải thích năng suất mỗi giống và thời gian cơ sở, không gọi đó là ETA chắc chắn.
- Thả giống: mặc định thu gọn khi ao có vật nuôi. Nêu rõ đang nuôi loài này, hết chỗ, chưa có giống hoặc chưa mở khóa; giữ nút xem điều kiện mở khóa. Khi thả vẫn chọn số lượng qua form hiện có.
- Hàng rào nằm sau nội dung chăm chuồng, trong mục trang trí thu gọn. Mỗi mẫu dùng đúng hàng sprite của atlas `garden-fences-v1.png`, kèm tên, giá và “Đang dùng”. Chọn mẫu mở xác nhận, chưa trừ xu. Nêu rõ rào chỉ trang trí, thay/gỡ không hoàn lại chi phí cũ. Sau thành công đóng hộp xác nhận.
- Các mục mở rộng giữ trạng thái qua polling trong cùng bảng/ô. Chuyển ô/bảng dùng trạng thái mặc định của nội dung mới.

Không sửa công thức, sức chứa, kinh tế, database hoặc luồng `world.approach()` cho ăn/thu hoạch.

## Kiểm chứng

148/148 kiểm thử hồi quy đạt; syntax, build và diff check đạt.

Kiểm tra Edge/Chromium thực tế trên desktop 1100 × 850, chạm ngang 844 × 390 và kiểm tra tràn ngang ở 568 × 320, 740 × 360. Chưa kiểm chứng trên thiết bị iOS Safari thật.

Luồng kiểm tra: chuồng ở ô index 0 hiện đúng hai vật nuôi, sắp xếp không đổi index; xem chi tiết; đổi ô sang ao; nhiều lứa và ao trống; mục giải thích ao và thả giống giữ mở qua polling; xem mẫu rào rồi hủy không trừ xu, xác nhận tre xanh trừ đúng 14 xu và đóng dialog. Không có ngoại lệ JavaScript trong các luồng đạt.

## Ảnh runtime

- [Chuồng desktop](assets/husbandry-ui-v1-coop-desktop.png)
- [Chuồng trên điện thoại ngang](assets/husbandry-ui-v1-coop-landscape.png)
- [Chi tiết vật nuôi](assets/husbandry-ui-v1-animal-detail.png)
- [Ao nuôi](assets/husbandry-ui-v1-pond-landscape.png)
- [Ao trống và chọn giống](assets/husbandry-ui-v1-empty-pond-landscape.png)
- [Chọn hàng rào](assets/husbandry-ui-v1-fences-landscape.png)
- [Xác nhận hàng rào](assets/husbandry-ui-v1-fence-confirm.png)


## Bản thu gọn V2

Theo yêu cầu hiển thị nhiều item hơn: danh sách vật nuôi/lứa ao chuyển thành hai cột, giảm padding, hình minh họa, chữ, thanh tiến độ và nút; Chi tiết đổi thành nút ⓘ có tên truy cập đầy đủ. Mẫu rào và danh sách thả giống giảm khoảng trống. Không đổi số lượng, ID, sức chứa hay cơ chế.

Build và kiểm tra runtime Chromium đạt: hai thẻ trên một hàng, giữ mục mở qua polling, xem/hủy/xác nhận rào đúng chi phí; không tràn ngang tại 568 × 320, 740 × 360, 844 × 390. Chưa kiểm tra Safari thật.

Ảnh mới: [Chuồng](assets/husbandry-compact-v2-coop-landscape.png), [Ao](assets/husbandry-compact-v2-pond-landscape.png), [Rào](assets/husbandry-compact-v2-fences-landscape.png), [Desktop](assets/husbandry-compact-v2-coop-desktop.png).

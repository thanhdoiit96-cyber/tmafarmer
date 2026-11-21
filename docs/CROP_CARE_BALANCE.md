# Cân bằng truffle và chăm cỏ dại

## Truffle

Giữ Xưởng cấp 3, thời gian cơ sở 120 phút và sản lượng cơ sở 3. Sửa mốc mở khóa từ 350 lên 2.200 XP, thống nhất mô tả xưởng. Giá giống 180 → 85 xu; giá bán 95 → 60 xu/món. Không xóa giống, nấm hay cây đã lưu. Cây đang trồng vẫn thu hoạch được; mua giống và gieo vụ mới áp dụng điều kiện mới. Giá bán mới áp dụng cả hàng tồn và các phép định giá dùng chung.

| Cây | Giống | Giá bán/món | Sản lượng | Phút | Lãi cơ sở/vụ |
| --- | ---: | ---: | ---: | ---: | ---: |
| Truffle | 85 | 60 | 3 | 120 | 95 |
| Cà phê | 95 | 72 | 5 | 95 | 265 |
| Sen | 125 | 90 | 5 | 115 | 325 |

Lãi cơ sở = bán toàn bộ vụ trừ một giống mua mới, chưa tính thời tiết, phân, sâu/cỏ, vật tư và cách giữ giống. Thu và giữ một giống truffle còn hai món để bán (120 xu), thấp hơn cà phê và sen. Danh mục và bảng tiến trình sinh từ định nghĩa trong `public/game.mjs`.

## Cỏ dại

- Vụ mới chọn một nguy cơ chính khi gieo: sâu hoặc cỏ. Lựa chọn xác định ổn định theo chủ vườn, ô, thời điểm và tỷ trọng rủi ro thời tiết lúc gieo; không đổi loại khi tải lại hay đồng bộ. Trong vụ, tốc độ tăng chịu thời tiết đang trải qua.
- Cây cũ không có `hazard` giữ sâu, cỏ bằng 0; không áp thêm cỏ hồi tố. Không thay thời gian mục tiêu đã lưu của cây.
- Hệ số tăng cỏ: nắng nhẹ 0,14; mưa 0,46; mây 0,18; nóng 0,04; gió 0,09; sương 0,28; dông 0,36. Sau mưa dùng tối thiểu 0,44 trong khoảng ẩm hiện có của game. Tốc độ tăng thực = hệ số × 120 / thời gian cơ sở cây.
- Mức nhiễm tối đa 90%. Từ 40%, nhân tốc độ tăng trưởng với 0,68. Sản lượng theo mức nặng nhất từng gặp: từ 20% mất 1; từ 40% mất 35% làm tròn lên; từ 70% mất 60% làm tròn lên, còn ít nhất 1 món. Các hệ số độ ẩm, phân và thời tiết riêng từng giống vẫn áp dụng.
- Nhổ cỏ chỉ cho cây chưa chín có cỏ; không tốn vật tư, tiêu hao như cuốc đất (nước 2, no bụng 1, thể lực 5, có điều chỉnh thời tiết chung). Xóa cỏ hiện tại, bảo vệ 20 phút. Tổn thất tích lũy đã xảy ra không được hoàn lại, giống cơ chế sâu. Cây đã chín ngừng tích lũy nguy cơ.
- Xịt thuốc không xử lý cỏ; ô nguy cơ cỏ có nút Nhổ cỏ thay cho thuốc. Thao tác phải tiếp cận đúng ô bằng `world.approach()`, kiểm tra vị trí phía server và dùng hoạt ảnh cuốc đất có sẵn cho cả hai giới tính. Không tạo tay hay công cụ rời mới.
- Cỏ trang trí nằm ngoài mép đất, không gây hại. Cỏ dại xuất hiện trong đất từ 5%, kèm nhãn Cỏ; danh sách việc nhắc từ 15%, hoặc 12% khi trời ẩm. Snapshot vườn hàng xóm cũng thể hiện cỏ, nhưng chỉ chủ vườn được chăm cây của mình.

## Kiểm tra

`test/crop-weeds.test.mjs` kiểm tra chia nhỏ thời gian, vượt ngưỡng 40%, mưa/nắng, bảo vệ và mọc lại, tương thích cây cũ, chi phí, từ chối thao tác lặp, ô số 0, việc cần làm, snapshot khách và mốc/lợi nhuận truffle. `test/game.test.mjs` giữ kiểm thử mua giống, trồng, chăm và thu giữ giống.

Ảnh Canvas trước/sau: `assets/crop-weeds-before-v1.png`, `assets/crop-weeds-after-v1.png`. 126 kiểm thử và build production đạt. Các lựa chọn cân bằng tập trung ở `weedWeatherRate`, `cropHazard`, `projectPlot`, `cropYield` và nhánh `weed` trong `public/game.mjs`.

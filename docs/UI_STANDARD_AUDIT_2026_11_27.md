# Rà soát UI theo chuẩn công cụ — 27/11/2026

Chuẩn hóa format Xưởng theo phản hồi: khung Sổ gỗ/giấy, tên tối đa hai dòng và chiều cao cố định, lượng Kho tách nhãn/số, trạng thái khóa/thiếu nguyên liệu/có thể làm, badge xanh số lần làm theo nguyên liệu và sức chứa. Công thức khóa mở Điều kiện thay vì một nút chế biến vô dụng. Phân trang dưới lưới; sáu ô desktop, ba ô khi ngang thấp, giữ item đầu khi đổi mật độ. Không vẽ mới hình sản phẩm trong đợt này; emoji hiện có vẫn được giữ cho công thức chưa có atlas. Đã kiểm 18 công thức qua mọi nhóm/trang desktop/844×390/568×320, tên/ảnh không chồng, trạng thái và chi tiết khóa đúng, nút phân trang nằm trong màn hình ngang thấp. [Desktop](assets/workshop-format-1100.png), [trạng thái khóa/mở](assets/workshop-format-states.png), [ngang thấp](assets/workshop-format-568.png). Badge đã đối chiếu bằng thao tác chế biến engine, bao gồm giới hạn túi và thiếu một nguyên liệu.

Sửa hồi quy ảnh Xưởng: công thức không có atlas riêng dùng lại `goods[item].icon`, bỏ fallback SVG `i-workshop` không tồn tại. Khung ảnh cố định 32px, icon 26px. Đã kiểm đủ 18 công thức qua mọi nhóm/trang ở desktop, ngang 844×390 và 568×320: không trống ảnh/đè tên, mở chi tiết nguyên liệu được; build đạt. [Desktop](assets/workshop-art-fixed-1100.png), [ngang](assets/workshop-art-fixed-844.png), [ngang thấp](assets/workshop-art-fixed-568.png). Không thay artwork hoặc công thức chế tạo.

Áp dụng [GAME_UI_STANDARD.md](GAME_UI_STANDARD.md). Đợt này tập trung bộ chọn giống/vật nuôi và các danh mục công cụ dùng chung; không thay đổi giá, sức chứa, công thức chăm sóc hay dữ liệu lưu.

## Đã cập nhật

- **Đón vật nuôi:** ảnh có khung riêng, thu nhỏ sprite; tên tối đa hai dòng bên dưới, giá tách số và đơn vị. Không còn dựa vào `transform` để thu hình trong một vùng bố cục quá lớn. Tám ô/trang desktop; bốn ô/trang khi màn hình ngang cao không quá 480px. Chuyển trang ngay trong hộp thoại, giữ đúng chuồng đích, kể cả lô 0.
- **Hạt giống:** dùng chung cách phân vùng ảnh/tên; số hạt và đơn vị tách rõ.
- **Xưởng:** sáu công thức/trang; nguyên liệu và điều kiện chuyển vào chi tiết khi chọn công thức. Nút chế tạo vẫn là thao tác riêng, giữ điều kiện hiện có.
- **Chợ:** gian hàng, vật tư, bán hàng phân trang sáu mục; tìm kiếm đặt lại trang để tránh kết quả rỗng giả. Tên, lượng hàng và hành động tách riêng.
- **Cuộn:** bảng bên và hộp thoại có thanh cuộn theo màu trò chơi, thêm chỉ báo luôn hiện khi nội dung tràn, kể cả hệ điều hành ẩn thanh cuộn tự nhiên. Chỉ báo đi theo vị trí cuộn và không chặn thao tác chạm.
- **Sổ chuồng:** giữ lưới sáu ô, badge xanh thu hoạch/đỏ cho ăn và số thức ăn trong túi từ bản trước; không thêm lại thông tin trùng lặp.

## Kiểm chứng

- Runtime Chromium: desktop 1100×850, giả lập cảm ứng ngang 844×390 và 568×320.
- Đo khung sprite/tên trên các trang đón; không chồng nhau. Bộ chọn ở hai kích thước ngang không cần cuộn; nút sang trang thao tác được bằng sự kiện cảm ứng.
- Xưởng và chợ phân trang đúng; polling không làm mất trang xưởng; tìm kiếm vật tư đặt lại trang; mở được chi tiết nguyên liệu.
- Chi tiết quản lý vật nuôi thực sự tràn: chỉ báo nằm trong vùng hộp thoại nhìn thấy và con trượt thay đổi theo vị trí cuộn. Không có lỗi JavaScript trong luồng kiểm tra.
- Toàn bộ 201 kiểm thử tự động đạt; build, kiểm tra tài nguyên và tài liệu gameplay đạt. Không thêm atlas hay ảnh runtime mới.
- Ảnh đối chiếu: [desktop](assets/ui-standard-adoption-desktop.png), [ngang](assets/ui-standard-adoption-landscape.png), [chi tiết cuộn](assets/ui-standard-detail-scroll.png).

Chưa kiểm tra trên thiết bị Android/iOS Safari thật. Các mục Kho, Ao và hàng rào được rà cấu trúc; không khẳng định đã chạy mọi tổ hợp dữ liệu trên mọi màn hình. Các danh sách thông tin cũ khác tiếp tục phải được rà theo chuẩn khi chỉnh sửa, không xem đợt này là chứng nhận toàn bộ UI.

## Bổ sung: Kho & túi và Ao nuôi

- Kho giữ tám ô trên desktop, bốn ô khi màn hình ngang cao tối đa 480px. Đổi kích thước giữ trang chứa vật phẩm đầu tiên đang xem; lọc nhóm về trang đầu, polling không đổi trang. Thu gọn tiêu đề/tab/phân trang trên màn hình thấp để bốn ô hiển thị trọn ở 568×320.
- Ao có badge xanh **Thu**, đỏ **Cần ăn**, đếm số lứa trong ao đang chọn, không đếm số con giống. Lứa đã thu được không cộng vào số đói. Số thức ăn ao trong túi là một nhãn riêng trên tiêu đề.
- Lượng thức ăn một lần nằm ở nút cho ăn; bỏ câu lặp trong phần cách nuôi. Khi thiếu vẫn ghi rõ phần còn thiếu, khi đang ăn vẫn có thời gian còn lại.
- Đã chạy runtime desktop 1100×850, cảm ứng giả lập 844×390 và 568×320, mở bảng Công cụ thực tế. Kiểm tra chuyển trang, giữ vật phẩm khi resize/polling và mở/đóng chi tiết. Fixture ao có một lứa sẵn sàng, một đói, một đang ăn: badge tương ứng 1/1, túi 17 phần. Không đổi dữ liệu lưu hay engine.
- Ảnh: [Kho 844×390](assets/stock-standard-844.png), [Kho 568×320](assets/stock-standard-568.png), [Ao desktop](assets/pond-standard-desktop.png), [Ao màn hình ngang](assets/pond-standard-568.png). Ao vẫn cần cuộn để xem thông tin nuôi; không đánh dấu đã hoàn thiện việc đưa toàn bộ chi tiết ao vào hộp thoại.
- Build, kiểm tra cú pháp, tài liệu gameplay và `git diff --check` đạt. Chưa thử trên Safari/Android thật; bộ 201 kiểm thử ở trên là kết quả của đợt trước, không chạy lại cho thay đổi bố cục này.

## Chỉnh theo phản hồi: phân trang dưới và Sổ ao

- Kho chuyển phân trang xuống dưới lưới, dùng mũi tên và số trang cùng mẫu Sổ chuồng. Giữ mật độ 8/4 ô, trạng thái khóa, nhóm và logic giữ trang đã có.
- Ao chuyển sang Sổ ao theo mẫu Sổ chuồng: lọc Tất cả/Thu/Cần ăn, ô hình + tên + thao tác chính, thức ăn trong túi trên tiêu đề, phân trang và Thả giống ở chân sổ. Desktop sáu lứa/trang; ngang thấp ba lứa/trang để không cắt hàng cuối. Chuyển trang dùng loài thật, thao tác giữ chỉ số ao thật (bao gồm 0).
- Chạm hình mở Quản lý thủy sản: lứa còn, ETA, tốc độ/sản lượng, thức ăn và quá trình. Không nhét thông tin dài vào ô chăm sóc. Bộ chọn thả giống mở riêng; giữ nguyên giới hạn chỗ, một loài/lứa và điều kiện giống hiện có.
- Dùng tài nguyên có sẵn; ba loài cũ chưa có atlas riêng tiếp tục dùng icon hiện có, ba loài mới dùng atlas thủy sản. Không tạo hoặc thay artwork trong đợt này.
- Runtime: kiểm tra Kho desktop/844×390/568×320 có phân trang dưới lưới và nằm trong màn hình. Ao thử cả ba và sáu loài, lọc đúng, polling giữ bộ lọc, chuyển trang hai chiều, mở/đóng chi tiết, thả giống khi còn chỗ; kiểm tra nút thu giữ `index=0`. Cho ăn/thu đi qua handler `world.approach()` hiện có, không đổi engine. Build/cú pháp/diff đạt; chưa chạy Safari thật.
- Ảnh hiện hành: [Kho ngang thấp](assets/stock-bottom-568.png), [Kho ngang](assets/stock-bottom-844.png), [Sổ ao desktop](assets/pond-book-desktop.png), [Sổ ao ngang thấp](assets/pond-book-568.png), [Quản lý desktop](assets/pond-management-desktop.png), [Quản lý ngang thấp](assets/pond-management-568.png). Các ảnh phần trước là lịch sử, không phải bố cục cuối.

# Bếp quê ngày chợ — bảng mỹ thuật V1

**Đã được người dùng duyệt.** Tiến độ triển khai và ảnh game thật: [Runtime V1](VILLAGE_FAIR_V1.md). Nội dung bên dưới giữ hồ sơ bản phác thảo lúc dựng.

28/11/2026. Bản duyệt mỹ thuật, chưa tích hợp game. Áp dụng skill `game-pixel-art` và chuẩn UI. Phạm vi gameplay: [Phiên chợ quê V1](VILLAGE_FAIR_DRAFT_V1.md).

## Xem và duyệt

- [Bảng mỹ thuật](assets/village-fair-art-board-v1.png): ba trạng thái cùng bố cục và các chi tiết hàng trên sạp. Đây là concept được tạo từ ảnh tham chiếu, không phải ảnh Canvas đã triển khai.
- [Bản đối chiếu và vị trí](assets/village-fair-art-review-v1.html): nền gốc, bảng mỹ thuật và sơ đồ lối đi/điểm tiếp cận từ tọa độ hiện có. Mở trực tiếp được, không API hoặc ghi save.

Giữ quy mô hình ảnh 5:3; mục tiêu renderer 640×384, tọa độ world 480×288. Cảnh tham chiếu lấy đúng ô market `[0,0,800,480]` trong `scene-backgrounds-environments-v1.png`; không thay bằng cảnh khác. Concept chưa phải file đo tọa độ chính xác; vị trí tích hợp phải theo bản đồ trong trang đối chiếu, không theo tọa độ tự suy ra từ ảnh AI.

## Ba trạng thái cần đọc được

| Trạng thái | Bánh quê — trái | Rau vườn — giữa | Quầy nước — phải |
| --- | --- | --- | --- |
| Chuẩn bị | Khay bánh và giỏ lúa trống | Hai giỏ rau trống | Khay cốc đất và giỏ cà rốt chưa có hàng góp |
| Đang góp | Ít bó lúa và bánh nếu thực sự đã góp | Ít cà rốt/bắp theo hàng thật | Cà rốt và cốc nước ép theo hàng thật |
| Sẵn sàng | Khay đầy trong mặt bàn | Giỏ đầy, tách màu cam/vàng/xanh | Khay cốc đầy vừa phải; dấu trang trí nhỏ |

Trạng thái trong bảng là ví dụ góp **hỗn hợp**. Renderer phải hỗ trợ chỉ lúa, chỉ bánh, chỉ cà rốt, chỉ bắp hoặc chỉ nước ép; không dùng một ảnh đầy chung bất chấp hàng thật. Mức đầy lấy từ dữ liệu đã commit; không đồng nghĩa xuất hiện thêm thưởng. Không cần vẽ từng đơn vị sản phẩm.

Chất liệu: giỏ tre, khay nứa, gỗ sẫm, cốc đất; sáng ấm phía trên trái, bóng nâu/xanh trầm, biên pixel rõ. Không dùng viền trắng dày, halo hoặc nút nổi phủ mặt sạp. Bánh/cốc phải đọc được ở 1×, không chỉ đẹp khi phóng lớn.

## Bảo toàn cảnh và chức năng

Ba quầy hiện có là Quầy vật tư, Sạp nông sản, Quầy bán nhanh. Tên Bánh quê/Rau vườn/Quầy nước chỉ là **vai trò trưng bày của phiên**, không thay các chức năng mua/bán đang có. Khi tích hợp, giữ đường vào chức năng cũ và bổ sung lựa chọn góp ở đúng ngữ cảnh; không tự chuyển mọi click quầy thành góp hàng.

Nền đã vẽ đầy trái cây/rau. Cần một bản nền/patch dọn **vùng trưng bày được chọn** dưới mái quầy; không đặt khay rỗng chồng lên hàng vẽ sẵn. Chỉ dọn các mặt bàn/kệ thuộc phiên; giữ mái, cột, chum nền, cây, hoa và giếng. Ngoài phiên dùng cảnh cũ. Các patch, hàng và NPC là những lớp tách riêng; không đưa toàn bộ concept vào game.

Không di chuyển giếng, cổng dưới, mái nhà hoặc nới camera. Không mở thêm quầy thứ tư trong sân. Khách ghé/nhân vật không đứng lên giếng, luống hoa hoặc phía sau mái khiến bị mất đầu. Không vẽ NPC cố định lên background.

## Vị trí và đường đi

Giữ spawn `[238,260]`, lối ra `[238,273]`, các block công trình và điểm tiếp cận hiện có: trái `[88,170]`, giữa `[296,160]`, phải `[392,179]`. Giếng có block `[206,145,67,87]`; tuyến chính phải vòng hai bên, không chạy thẳng từ cổng lên xuyên giếng.

Khách hiện có đi ở sân trước, dùng `market-life.mjs`: x58–125/y195, x326–420/y199, x320–394/y254. Đề xuất giữ các tuyến này thay vì tạo đám đông mới; khi hoàn tất chỉ thay pose/điểm dừng phù hợp. Chưa đổi logic va chạm. Sơ đồ chỉ minh họa khoảng thông thoáng, không thay pathfinding hoặc chứng minh sprite không đè nhau; cần kiểm Canvas với nhân vật động sau duyệt.

## Từ concept tới runtime sau khi duyệt

1. Duyệt bố cục/độ đầy/chất liệu; ghi rõ khác biệt cần chỉnh thay vì tự diễn giải sang phong cách khác.
2. Tạo master alpha thật cho khay/giỏ/hàng và patch nền được chọn; crop từng đối tượng riêng, footprint đúng vùng mặt bàn. Không xuất atlas trước khi kiểm cạnh nhân vật tại 1× và phóng nguyên nearest-neighbor.
3. Ghép Canvas ba trạng thái với **chính** master đã duyệt, kiểm chỉ góp một loại/mixed/hết hạn, NPC/điểm tiếp cận, mưa/đêm, người chơi tên dài. Kiểm mobile ngang 844×390 và 568×320; UI không che sạp.
4. Chỉ sau đó nối version/action mới theo thiết kế gameplay, chạy test và build phù hợp. Giữ đường rollback và cảnh đợt cũ; chưa deploy hoặc push trong bước mỹ thuật này.

Chưa có kiểm chứng gameplay thật hoặc Safari/Android thật. Không sửa `public`, database hoặc luật thưởng trong đợt dựng bảng này.

## Bằng chứng và giới hạn bản V1

Đã tạo và xem bảng PNG 1536×1024 từ hai tham chiếu: atlas môi trường hiện có (chỉ cảnh market góc trên trái) và `vertical-slice-concept-v1.png` cho chất liệu/nhân vật. Bản được chọn lưu ngay tại `docs/assets/village-fair-art-board-v1.png`; không phụ thuộc đường dẫn generated_images ngoài repository. Đã kiểm cú pháp script trang đối chiếu và các file tham chiếu tồn tại. Chưa kiểm tương tác trang trong trình duyệt, không báo đã kiểm bố cục mobile thực tế.

Ảnh concept tái diễn giải một số chi tiết nhỏ và dùng nhân vật minh họa lặp; không dùng để thay sprite, vẽ NPC vào nền hoặc suy ra baseline chính xác. Cảnh vẫn cần ghép lại từ nền/props/sprite được duyệt tại đúng kích thước runtime, có đối chiếu trước/sau. Bản V1 duyệt hướng chất liệu, mức đầy và sự liền mạch; kiểm sprite riêng, các tổ hợp hàng đơn lẻ, độ rõ ở 640×384 và mobile vẫn là gate trước khi production.

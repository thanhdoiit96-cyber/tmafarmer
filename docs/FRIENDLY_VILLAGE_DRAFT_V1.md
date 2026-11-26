# P1.4 — Phác thảo làng thân thiện

**Đã thay thế theo yêu cầu:** không tách Thân thiện/Tinh nghịch. Giữ lấy trộm, phát triển giúp nhau/nghịch vui song song và Ao làng; xem [bản mới](SOCIAL_PLAY_AND_LAKE_DRAFT_V1.md). Nội dung dưới đây chỉ là lịch sử, không triển khai.

Trạng thái: **bản mẫu để duyệt, chưa sửa gameplay**. Tiếp theo [roadmap](GAME_DEVELOPMENT_ROADMAP.md). Thay đổi tuổi vật nuôi theo chu kỳ thuộc đợt trước, không gộp thành luật làng.

## Mở mẫu

[HTML tương tác — mở trực tiếp bằng trình duyệt](assets/friendly-village-draft-v1.html).

Thanh PHÁC THẢO cho thử: tạo làng → chọn luật → xác nhận; vào làng bạn → xem luật trước khi đồng ý; làng cũ → gửi đề xuất → đồng ý/từ chối → chờ hiệu lực → chế độ mới. Các nút mô phỏng không thuộc giao diện sản phẩm thật. Chỉ dùng dữ liệu mẫu trong RAM, không gọi API, không đọc/ghi game.

Dùng nền Hàng xóm và CSS hiện có; không vẽ lại map, không thêm PNG/atlas hoặc scene mới. Phần bối cảnh chỉ dùng đối chiếu phong cách; chưa phải renderer với nhà/thành viên động.

## Mục đích

Cho nhóm muốn trồng/chăn nuôi và giao thương cùng nhau giữ nông sản riêng, giảm lo bị lấy đồ khi vắng mặt. Đây là lựa chọn luật của **cả làng**, không phải nút bật bảo vệ cá nhân, cũng chưa phải cơ chế cho quà/giúp chăm tự động.

| Nội dung | Thân thiện | Tinh nghịch |
| --- | --- | --- |
| Thăm nhà, xem vườn | Có | Có |
| Chợ/sạp, đơn làng, góp xu/góp hàng | Giữ cơ chế hiện tại | Giữ cơ chế hiện tại |
| Câu ở Hồ làng; chăm/thu ao của mình | Giữ cơ chế hiện tại | Giữ cơ chế hiện tại |
| Lấy nông sản từ vườn hoặc kho hàng xóm | Không | Theo luật/hạn mức hiện tại |
| Câu trộm ao hàng xóm | Không | Theo điều kiện loài, hạn mức và cổng hiện tại |
| Thưởng vì chọn chế độ | Không | Không |
| Mất mùa do sâu/cỏ/thời tiết | Không đổi | Không đổi |

Không thể quảng bá Thân thiện là “không bao giờ mất nông sản”: chăm sóc và giao dịch vẫn theo luật cũ; lựa chọn chỉ ngăn việc lấy từ hàng xóm.

## Làng mới

- Khi tạo, chọn Thân thiện (gợi ý mặc định) hoặc Tinh nghịch; tên không thay cho phần giải thích rõ việc được lấy đồ hay không.
- Xác nhận tạo nhắc lại luật; chế độ được ghi trong cùng giao dịch tạo phòng, không tạo trước rồi cập nhật sau.
- Khi vào làng bằng mã, xem tên làng/chế độ/luật trước nút Đồng ý và vào. Không cho người mới tự đổi chế độ làng.
- Trang xem luật trước khi vào chỉ lộ dữ liệu công khai tối thiểu; không mở kho, token hoặc trạng thái riêng của các vườn. Cần giới hạn tra mã.
- Không thay đổi avatar, cấp hoặc tiến trình vì chọn luật.

## Làng cũ — đề xuất chuyển một chiều

Phòng không có trường chế độ được hiểu là **Tinh nghịch**, giữ nguyên hành vi cũ. Không tự chuyển cả người đang chơi sang Thân thiện sau deploy.

Đề xuất V1:

1. Chủ làng tạo đề xuất Tinh nghịch → Thân thiện; phiếu đồng ý của chủ làng cũng được ghi rõ.
2. Cần tất cả chủ vườn đang là thành viên của phòng đồng ý (tối đa 12 vườn, gồm vườn offline). Một từ chối kết thúc đề xuất; không phản hồi không được coi là đồng ý. Hết hạn sau 72 giờ thực nếu chưa đủ phiếu.
3. Khi đủ, hẹn hiệu lực ở đầu ngày game kế tiếp có đủ thời gian chuyển tiếp; không thay ngay giữa thao tác thu/lấy/câu.
4. V1 chỉ chuyển một chiều. Không cho bật lại Tinh nghịch để lấy đồ từ nhóm đã gia nhập với kỳ vọng được giữ nông sản riêng.
5. Trước hiệu lực, chủ làng rút đề xuất thì giữ luật cũ. Bất kỳ thay đổi thành viên/chủ làng nào cũng hủy đề xuất/chờ chuyển và cần biểu quyết lại. Không mang phiếu của người đã rời sang nhóm mới. Màn xác nhận vào/rời/mời thành viên phải nói rõ nếu việc đó hủy lịch chuyển.

Phiếu theo farm ID đã xác thực, không theo tên hiển thị. Đây không phải bằng chứng một người thật chỉ sở hữu một vườn. Chủ làng vẫn có quyền quản lý thành viên hiện có; không hứa chống được mọi hành vi ép đồng ý bằng quyền chủ làng. Sự đồng thuận được đảm bảo cho tập thành viên hiện tại trước chuyển, không phải quyền ở lại vô hạn của người đã bị mời ra.

**Đánh đổi:** làng có người offline lâu có thể không chuyển được; không ép họ qua timeout. Cần duyệt giới hạn này thay vì âm thầm giảm xuống đa số hoặc chỉ người online. Prototype dùng 3 vườn để dễ xem, server phải tính đúng toàn bộ phòng thực tế.

## Cần câu đang chờ và thao tác đồng thời

V1 ưu tiên kết thúc toàn bộ cửa sổ câu trộm trước giờ chuyển, không hủy cần đã trả chi phí và không tạo hoàn tiền/chỉ số thiếu dữ liệu:

- Lấy `effectiveAt` từ lịch ngày game server. Nếu thời gian còn lại đến ranh giới không lớn hơn `fishing.wait + fishing.window` (hiện 61 giây), hẹn ranh giới sau đó.
- Trong 61 giây cuối trước hiệu lực, chặn **thả cần trộm mới**, giải thích làng sắp chuyển luật. Thả trước thời điểm chặn phải có `expires < effectiveAt`; được kéo theo luật cũ trong cửa sổ của nó.
- Lấy vườn/kho trực tiếp vẫn theo Tinh nghịch trước hiệu lực; từ đúng hiệu lực server từ chối. Không rollback món đã lấy hợp lệ trước thời điểm đó.
- Câu Hồ làng không bị chặn bởi chuyển chế độ. Cần trộm hết hạn không nhận cá; không thêm cơ chế hoàn chỉ số hoặc quà.
- Hai người đồng ý cuối cùng, gửi lặp request hoặc chuyển đúng giây hiệu lực phải quyết định trên một revision server. UI không tự tính rằng đã chuyển khi request chưa thành công.

Không gia hạn cần đã hết hạn hoặc cho kéo trộm sau hiệu lực chỉ vì client vẫn còn nút. Nếu dữ liệu cast cũ/corrupt có hạn vượt thời điểm hợp lệ, không được nhận nông sản trái luật mới; trường hợp khôi phục đặc biệt cần thiết kế trước deploy, không dựa vào client.

## Tiến độ làng và giá trị nâng cấp

Giữ các mốc công trình, xu đã góp, thu nhập, số đơn và điều kiện ngày an ninh hiện có. Với Thân thiện, đổi nhãn dễ hiểu thành **ngày bình yên đã kết thúc**:

- Ngày hiện tại chưa kết thúc không được cộng là một ngày.
- Những ngày cũ đáp ứng điều kiện vẫn được giữ; không reset chuỗi chỉ vì đổi luật, không đặt chuỗi đủ ngay khi bật chế độ.
- Các ngày sau khi chuyển không có vụ lấy từ hàng xóm, nhưng vẫn phải thực sự kết thúc. Không bỏ kiểm tra đã xây công trình, đủ thu nhập và đủ đơn.
- Không dựng một hệ thưởng/đơn thay thế để bù XP trộm trong V1.

Phân biệt hai hệ hàng rào:

| Hạng mục | Khi Thân thiện |
| --- | --- |
| Rào trang trí từng vườn/chuồng | Giữ mẫu, vẫn đặt/gỡ/thay theo cơ chế hiện có |
| Công trình Hàng rào bảo vệ chống lấy đồ | Giữ cấp cũ trong save, không còn lợi ích chống lấy ở chế độ này |
| Túi ghé vườn dùng cho hạn mức lấy | Giữ cấp cũ, không chuyển thành hạn mức thăm hoặc phần thưởng |
| Đóng cổng có thời hạn | Không cần mua để chặn lấy; giữ dữ liệu cũ, không kéo dài, không tự hoàn xu |

Trong làng Thân thiện, không bán/nâng thêm các quyền chỉ phục vụ lấy hoặc chống lấy đồ: ẩn đề xuất mua và server cũng từ chối nâng Hàng rào bảo vệ/Túi hoặc mua đóng cổng vì mục đích đó. Vẫn hiển thị cấp đã sở hữu kèm “Không áp dụng trong chế độ này” tại chi tiết khi cần. Không xóa rào trang trí hoặc công trình đang vẽ trên map.

**Cần thấy trước khi đồng ý:** đầu tư cũ vẫn lưu nhưng một số công dụng không còn áp dụng, không hoàn xu tự động. Đây là đánh đổi thật, không chỉ đổi tên chế độ. Nếu muốn đền bù sau này cần chống nhận lặp và chính sách riêng; chưa hứa ở V1.

## Tích hợp server dự kiến — chưa code

- Một helper chung lấy chế độ hiệu lực từ `room.rules`, mặc định Tinh nghịch chỉ khi field cũ chưa tồn tại. Giá trị lạ cần xử lý lỗi/version có chủ đích, không tự cho phép lấy đồ.
- Dữ liệu phiên bản gồm chế độ hiện tại và proposal (ID, tập thành viên, phiếu, hạn, thời điểm hiệu lực). Chỉ giữ một đề xuất hiện tại/kết quả ngắn, không lưu lịch sử vô hạn mọi phiếu.
- Cập nhật proposal/mode trong transaction/CAS hiện có. Migrate field thiếu không sửa trạng thái kinh tế hoặc gán bừa phiếu đồng ý.
- Kiểm tra chế độ ở cả `steal`, `cast` ao hàng xóm và `reel`; chỉ ẩn `pick` hoặc `visitFishing` ở client là không đủ.
- Gating trước khi trừ vật tư/chỉ số của hành động bị cấm. Giữ nguyên kiểm tra chủ sở hữu, vùng tương tác, quota/cổng ở Tinh nghịch.
- Snapshot Hàng xóm Thân thiện vẫn đủ dữ liệu hiển thị, không có danh sách gợi ý “có thể lấy”; nút ghé không bị gắn với số lượt lấy bằng 0.
- Gating nâng rào/túi/đóng cổng phải phân biệt action trang trí. Những đường đơn hàng, chợ, góp hàng, câu công cộng và chăm ao của mình không đi qua guard cấm nhầm.
- Lời mời, vào lại phòng, quick join, guest/account đều xem cùng luật server. Không cho tạo/chuyển qua URL/client payload để bỏ xác nhận.

## Kiểm chứng cần có trước runtime

1. Phòng cũ thiếu field giữ đúng Tinh nghịch; phòng mới hai chế độ; reload và hai session nhất quán.
2. Gọi trực tiếp API lấy vườn/kho/câu trộm ở Thân thiện bị từ chối, không mất hàng/chỉ số/quota; thao tác của chủ vườn và câu công cộng không bị chặn.
3. Hai phiếu cuối đồng thời, requestId lặp, từ chối, hết hạn, rút, đổi thành viên, làng đủ 12 vườn và có offline.
4. Thời điểm sát ranh giới, cửa sổ cần đang chờ, đúng giây chuyển và request client cũ. Không nhân cá/hoàn chỉ số.
5. Chuỗi ngày an ninh trước/sau, ngày chưa kết thúc, ngày đủ nhưng chưa đủ đơn/thu nhập/công trình. Không lên cấp vì chỉ bật chế độ.
6. Phòng có rào/túi cao, cổng đang đóng, rào trang trí; giữ dữ liệu và giải thích đúng, không mua thêm quyền vô dụng qua API.
7. Mobile ngang, keyboard/focus, tên dài, 12 nhà; không dùng thêm panel lớn che map. Cần kiểm tra Safari thật khi triển khai.

## Phạm vi duyệt

Bản này chỉ chốt vấn đề và luồng lựa chọn để duyệt; chưa triển khai mode, biểu quyết, guard API hoặc migration. Các số 72 giờ, đồng thuận toàn bộ, chuyển một chiều, không hoàn xu và quy tắc cửa sổ cần câu đều là **đề xuất**. Cần duyệt trước khi áp dụng vì thay đổi quyền lấy nông sản và giá trị nâng cấp đã mua, đúng yêu cầu P1.4 trong roadmap.

## Kiểm chứng bản mẫu

Đã kiểm tra cú pháp JavaScript và runtime Edge/Chromium: tạo cả hai chế độ; hủy không tạo; vào làng phải xác nhận luật; một người từ chối giữ luật cũ; đủ 3/3 vẫn chưa chuyển trước hiệu lực; rút được cả khi đang lấy ý kiến và khi chờ; đến hiệu lực mới chuyển; Thân thiện không có đường đổi lại hoặc nút lấy đồ. Kiểm tra này chỉ chứng minh UI mô phỏng, không chứng nhận luật server chưa được viết.

Không lỗi JavaScript hoặc tràn ngang ở 1050 × 720, 844 × 390, 568 × 320 và 390 × 844; thao tác chạm mở/hủy dialog đạt. Chưa kiểm tra iOS Safari thật. Không chạy lại build/test gameplay vì không thay runtime. Không lưu ảnh PNG mới; ảnh kiểm tra tạm và profile trình duyệt được dọn sau khi xem.

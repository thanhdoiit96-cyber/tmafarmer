# P4 — Phân tích cohort offline V1

28/11/2026. Bổ sung cách tính quay lại theo ngày thực; không triển khai P5 hoặc tự thu thập dữ liệu. Chưa có dữ liệu người chơi, chưa có kết quả giữ chân.

## Cách dùng

Người điều phối lập sổ phiên riêng sau khi thống nhất với người tham gia về dữ liệu, người được xem và thời hạn giữ. Không đưa sổ này vào Git. Chỉ dùng mã giả danh ổn định; không nhập tài khoản, token, tên thật, chat hoặc save. Công cụ không gửi mạng, không lưu dữ liệu ngoài tệp báo cáo được chỉ định.

Định dạng đầu vào (ví dụ cấu trúc, không phải kết quả pilot):

```json
{
  "schema": 1,
  "players": [{"id": "P01", "mode": "online", "firstPlay": "2026-11-01"}],
  "sessions": [{"id": "P01", "date": "2026-11-02"}]
}
```

`firstPlay` là ngày UTC của phiên gameplay đầu tiên thực sự, không phải ngày đăng ký hay ngày mở trang. Mã P01–P99999 không được tái dùng cho người khác trong cùng đợt. Mode chỉ nhận `online`, `demo`, `QA`; demo/QA bị loại khỏi cohort online. Không suy ra phiên từ số lượt quan sát trong form P4 hoặc ngày game 8 giờ. Nếu một người chơi nhiều môi trường, chỉ đăng ký danh tính nghiên cứu riêng cho môi trường cần phân tích và không tính hai lần trong online.

```powershell
node scripts/pilot-cohorts.mjs <duong-dan-so-phien.json> 2026-11-08 <duong-dan-bao-cao-moi.json>
```

Ngày chốt phải là **ngày UTC cuối cùng đã quan sát đầy đủ**, không lấy ngày hôm nay đang dở. Báo cáo từ chối ghi đè tệp đã có. Giới hạn 10 MB, 10.000 người, 100.000 phiên. Ngày sai, phiên trước ngày đầu/sau ngày chốt, mã trùng/không đăng ký và mode lạ gây lỗi; không âm thầm bỏ dòng để tạo số đẹp.

## Đọc kết quả

Mỗi cohort là ngày chơi đầu. D1/D7/D30 nghĩa là quay lại **đúng ngày UTC thứ 1/7/30** sau ngày đầu, không phải bất kỳ lúc nào sau đó. Phiên lặp cùng ngày chỉ tính một người. `eligible` là số người đã đủ tuổi quan sát, `returned` là số người quay lại ngày đó, `rate` là tỷ lệ 0–1. Chưa đủ tuổi thì `rate=null`, không phải 0%. Báo cáo chỉ chứa số tổng hợp, không xuất mã người thử; vẫn cần giữ riêng vì mẫu nhỏ có thể dễ nhận diện.

Không có phiên trong sổ được tính là không quay lại **chỉ khi sổ được ghi đầy đủ**. Công cụ không chứng minh độ đầy đủ, xác thực phiên hay phân biệt thiếu ghi với nghỉ chơi. Nếu thiếu dữ liệu trong một ngày, chưa chốt qua ngày đó. Dùng số mẫu và phản hồi quan sát cùng báo cáo, không coi tỷ lệ nhỏ là bằng chứng sẵn sàng mở bán. Công cụ chưa tính activation, khoảng tin cậy, phân nhóm bạn/solo hoặc so sánh nhiều build; không gộp các đợt khác luật/build thành một báo cáo.

## Kiểm chứng và bước tiếp theo

Hai test `node --test test/pilot-cohorts.test.mjs` đạt: mẫu số cohort đủ tuổi, ngày chính xác, khử phiên lặp, loại demo/QA, không lộ mã trong báo cáo và từ chối dữ liệu mâu thuẫn. Dữ liệu trong test là tổng hợp, không phải người chơi thật. Không đổi runtime, tài nguyên hoặc database game.

Tiếp theo vẫn là chạy pilot khi có build, nhóm tự nguyện và lịch; ghi nhận có kiểm soát rồi sửa vấn đề UX quan sát được. Chưa tự bật telemetry, gửi lời mời, deploy hoặc quay lại P5. Nếu tiếp tục phát triển tính năng trước pilot, cần chọn một phạm vi gameplay cụ thể thay vì suy diễn nhu cầu từ tỷ lệ chưa tồn tại.

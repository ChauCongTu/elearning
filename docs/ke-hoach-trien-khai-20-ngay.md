# Kế hoạch triển khai 20 ngày

**Dự án:** Website bán khóa học online — Học Viện Bông Nhài Trắng  
**Thời gian:** 20/07/2026 → 08/08/2026 (20 ngày làm việc)  
**Phạm vi:** Theo báo giá trọn gói 6.500.000 VNĐ (07/07/2026)  
**Cập nhật:** 16/07/2026

---

## Lời mở đầu

Kế hoạch dưới đây mô tả **từng giai đoạn sẽ làm gì** và **kết quả khách hàng nhận được** sau mỗi mốc thời gian. Không đi vào chi tiết kỹ thuật — tập trung vào lợi ích thực tế cho Học Viện.

**Tiến độ hiện tại:** Giai đoạn 1 & 2 trong bảng dưới (**Nền tảng** và **Website công khai**) đã hoàn thành trước thời hạn, tương đương **Ngày 1–5**. Các giai đoạn còn lại sẽ triển khai theo lịch từ **Ngày 6**.

---

## Tổng quan 20 ngày

```
20/07 ─── 24/07 ─── 29/07 ─── 03/08 ─── 08/08
  │         │         │         │         │
 Nền tảng  Website   Thanh     Học      Nghiệm
 + Công    + Tài     toán +    online +  thu &
 khai      khoản     Quản trị  Chứng    Bàn giao
 ✅ Xong   ✅ Xong
```

| # | Giai đoạn | Thời gian | Trạng thái |
|---|-----------|-----------|------------|
| 1 | Nền tảng hệ thống | Ngày 1–2 (20–21/07) | ✅ Hoàn thành |
| 2 | Website công khai | Ngày 3–5 (22–24/07) | ✅ Hoàn thành |
| 3 | Tài khoản học viên | Ngày 6–7 (25–26/07) | 🔜 Sắp triển khai |
| 4 | Thanh toán VietQR | Ngày 8–10 (27–29/07) | ⬜ Chưa bắt đầu |
| 5 | Học online (video) | Ngày 11–14 (30/07–02/08) | ⬜ Chưa bắt đầu |
| 6 | Trang quản trị | Ngày 15–17 (03–05/08) | ⬜ Chưa bắt đầu |
| 7 | Chuyển dữ liệu cũ | Ngày 16–18 (04–06/08) | ⬜ Chưa bắt đầu |
| 8 | Chứng chỉ điện tử | Ngày 18–19 (06–07/08) | ⬜ Chưa bắt đầu |
| 9 | Triển khai & nghiệm thu | Ngày 19–20 (07–08/08) | ⬜ Chưa bắt đầu |

> *Giai đoạn 6 (chuyển dữ liệu) chạy song song một phần với Giai đoạn 5 để tối ưu thời gian.*

---

## Chi tiết từng giai đoạn

### Giai đoạn 1 — Nền tảng hệ thống
**Ngày 1–2 | 20–21/07/2026 | ✅ Hoàn thành**

**Làm gì:** Dựng khung hệ thống, cơ sở dữ liệu, phân quyền quản trị viên / học viên.

**Khách hàng nhận được:**
- Hệ thống sẵn sàng cho các tính năng tiếp theo
- Tài khoản thử nghiệm để kiểm tra
- Vài khóa học mẫu trong hệ thống

---

### Giai đoạn 2 — Website công khai
**Ngày 3–5 | 22–24/07/2026 | ✅ Hoàn thành**

**Làm gì:** Xây dựng toàn bộ website giới thiệu như báo giá — trang chủ, khóa học, tin tức, bảng giá, liên hệ, về chúng tôi.

**Khách hàng nhận được:**

| Hạng mục | Mô tả |
|----------|-------|
| Trang chủ đầy đủ | Banner, giới thiệu, khóa học, tin tức, form tư vấn, hotline |
| Trang khóa học | Danh sách + chi tiết từng khóa, tìm kiếm & lọc |
| Tin tức | Đọc bài viết, phân loại theo danh mục (10 bài mẫu) |
| Bảng giá | Giá dịch vụ spa + giá khóa học online |
| Liên hệ | Hotline, Zalo, Facebook, địa chỉ cơ sở, form tư vấn |
| Về chúng tôi | Câu chuyện Học Viện, thống kê, founder, video |
| Thương hiệu | Logo, màu sắc, font tiếng Việt chuẩn |
| Cấu hình tập trung | Đổi hotline, menu, số liệu… chỉ cần sửa một file |
| Chế độ bảo trì | Tạm đóng website khi nâng cấp |

**Mốc nghiệm thu:** Khách duyệt website công khai, xác nhận nội dung & bố cục phù hợp.

---

### Giai đoạn 3 — Tài khoản học viên
**Ngày 6–7 | 25–26/07/2026**

**Làm gì:** Hoàn thiện đăng ký, đăng nhập, trang cá nhân và mục "Khóa học của tôi".

**Khách hàng nhận được:**
- Học viên đăng ký tài khoản, sửa thông tin cá nhân
- Trang **Khóa học của tôi** — xem các khóa đã đăng ký (sẵn sàng cho thanh toán ở bước sau)
- Quên mật khẩu qua email
- Giao diện đăng nhập/đăng ký đồng bộ thương hiệu Học Viện

**Mốc nghiệm thu:** Đăng ký → đăng nhập → thấy trang cá nhân hoạt động.

---

### Giai đoạn 4 — Thanh toán chuyển khoản (VietQR)
**Ngày 8–10 | 27–29/07/2026**

**Làm gì:** Kết nối cổng thanh toán SePay — học viên mua khóa bằng quét mã VietQR, hệ thống tự mở khóa sau khi nhận tiền.

**Khách hàng nhận được:**
- Nút **Mua khóa** trên trang chi tiết khóa học
- Màn hình hiển thị mã QR + hướng dẫn chuyển khoản
- Tự động mở khóa trong vài phút sau khi chuyển khoản thành công
- Không cần duyệt tay từng đơn (trừ trường hợp chuyển khoản thủ công đặc biệt)

**Cần từ phía Học Viện:**
- Tài khoản SePay đã kích hoạt VietQR
- Thông tin tài khoản ngân hàng nhận tiền

**Mốc nghiệm thu:** Mua thử 1 khóa bằng chuyển khoản → khóa tự hiện trong "Khóa học của tôi".

---

### Giai đoạn 5 — Học online (xem video bài học)
**Ngày 11–14 | 30/07–02/08/2026**

**Làm gì:** Xây giao diện học — xem video theo chương/bài, tự lưu tiến độ (đã xem đến đâu, hoàn thành bao nhiêu %).

**Khách hàng nhận được:**
- Trang học với danh sách chương/bài bên trái, video bên phải
- Tiếp tục học từ đúng chỗ đã dừng khi quay lại
- Thanh tiến độ % trên từng khóa
- Video bảo mật — chỉ học viên đã mua mới xem được
- Hỗ trợ xem trên điện thoại

**Cần từ phía Học Viện:**
- Tài khoản AWS (lưu video) — hướng dẫn đăng ký nếu chưa có
- File video bài học hoặc danh sách video hiện có trên website cũ

**Mốc nghiệm thu:** Học viên đã mua xem được video, thoát ra vào lại vẫn giữ tiến độ.

---

### Giai đoạn 6 — Trang quản trị
**Ngày 15–17 | 03–05/08/2026**

**Làm gì:** Xây trang quản trị để Học Viện tự quản lý nội dung — không cần nhờ lập trình viên mỗi lần thêm khóa hay đổi banner.

**Khách hàng nhận được:**

| Chức năng quản trị | Mô tả |
|--------------------|-------|
| Tổng quan | Số đơn hàng, doanh thu, học viên mới |
| Khóa học | Thêm / sửa / ẩn khóa, upload ảnh bìa, đặt giá |
| Chương & bài học | Sắp xếp nội dung, upload video bài giảng |
| Danh mục | Phân loại khóa học |
| Đơn hàng | Xem lịch sử thanh toán, đối soát |
| Banner | Đổi banner trang chủ |
| Tin tức | Thêm / sửa / xóa bài viết (thay cho 10 bài mẫu) |
| Học viên | Xem danh sách, cấp khóa thủ công nếu khách CK tay |
| Yêu cầu tư vấn | Xem form tư vấn từ website |

**Mốc nghiệm thu:** Admin tự thêm 1 khóa học mới + upload video → học viên mua và học được.

---

### Giai đoạn 7 — Chuyển dữ liệu từ website cũ
**Ngày 16–18 | 04–06/08/2026** *(song song Giai đoạn 6)*

**Làm gì:** Chuyển dữ liệu từ website WordPress/WooCommerce hiện tại sang hệ thống mới.

**Khách hàng nhận được:**
- Tài khoản học viên cũ (nếu có) chuyển sang hệ thống mới
- Khóa học, giá, mô tả từ website cũ
- Lịch sử mua khóa & tiến độ học (nếu dữ liệu cũ đầy đủ)
- Báo cáo chi tiết: bao nhiêu tài khoản/khóa/đơn hàng chuyển thành công, mục nào cần xử lý tay

**Cần từ phía Học Viện:**
- File backup database website cũ (hoặc quyền truy cập đọc)
- Xác nhận danh sách khóa học cần chuyển

**Mốc nghiệm thu:** Học viên cũ đăng nhập → thấy khóa đã mua và tiến độ học.

---

### Giai đoạn 8 — Chứng chỉ điện tử
**Ngày 18–19 | 06–07/08/2026**

**Làm gì:** Tự động cấp chứng chỉ PDF khi học viên hoàn thành 100% khóa học; trang tra cứu chứng chỉ công khai.

**Khách hàng nhận được:**
- Học viên tải chứng chỉ PDF trong tài khoản
- Mã tra cứu trên chứng chỉ — ai cũng kiểm tra được tính xác thực
- Mẫu chứng chỉ mang thương hiệu Học Viện Bông Nhài Trắng

**Cần từ phía Học Viện (tuỳ chọn):**
- File thiết kế chứng chỉ mẫu nếu có yêu cầu riêng

**Mốc nghiệm thu:** Hoàn thành khóa học thử → nhận chứng chỉ → tra cứu mã thành công.

---

### Giai đoạn 9 — Triển khai chính thức & nghiệm thu
**Ngày 19–20 | 07–08/08/2026**

**Làm gì:** Đưa website lên hosting, trỏ tên miền, kiểm tra toàn bộ luồng, bàn giao.

**Khách hàng nhận được:**
- Website chạy trên tên miền chính thức (HTTPS)
- Thanh toán VietQR hoạt động trên môi trường thật
- Video học online hoạt động ổn định
- Tài khoản quản trị viên + hướng dẫn sử dụng ngắn
- Bộ kiểm tra nghiệm thu (checklist 9 kịch bản)
- Bảo hành kỹ thuật **3 tháng** theo báo giá

**Cần từ phía Học Viện:**
- Hosting Hostinger (hoặc tương đương) + tên miền
- Xác nhận nghiệm thu sau khi chạy thử

**Mốc nghiệm thu cuối:** Ký nghiệm thu — hệ thống vận hành ổn định.

---

## Checklist nghiệm thu cuối (Ngày 20)

| # | Kịch bản kiểm tra | Kết quả mong đợi |
|---|-------------------|------------------|
| 1 | Vào trang chủ, tìm khóa học | Hiển thị đúng, tìm được khóa |
| 2 | Đăng ký tài khoản mới | Tạo tài khoản thành công |
| 3 | Mua khóa bằng VietQR | Quét mã → khóa tự mở |
| 4 | Xem video bài học | Phát được, thoát vào lại giữ chỗ dừng |
| 5 | Hoàn thành 100% khóa | Nhận chứng chỉ PDF |
| 6 | Tra cứu chứng chỉ | Nhập mã → hiện thông tin xác thực |
| 7 | Admin thêm khóa + upload video | Học viên xem được khóa mới |
| 8 | Admin xem đơn hàng | Thấy lịch sử thanh toán |
| 9 | Admin đổi banner trang chủ | Banner cập nhật ngay |

---

## Lịch theo tuần (dễ theo dõi)

### Tuần 1 — 20/07 → 26/07
| Ngày | Việc chính | Kết quả |
|------|------------|---------|
| T2 20/07 | Nền tảng hệ thống | ✅ Xong |
| T3 21/07 | Nền tảng (tiếp) | ✅ Xong |
| T4 22/07 | Website: trang chủ + khóa học | ✅ Xong |
| T5 23/07 | Website: tin tức + landing pages | ✅ Xong |
| T6 24/07 | Website: hoàn thiện + bàn giao xem trước | ✅ Xong |
| T7 25/07 | Tài khoản học viên | Trang cá nhân, khóa của tôi |
| CN 26/07 | Tài khoản (tiếp) | Hoàn thiện đăng nhập/đăng ký |

### Tuần 2 — 27/07 → 02/08
| Ngày | Việc chính | Kết quả |
|------|------------|---------|
| T2 27/07 | Thanh toán VietQR | Kết nối SePay |
| T3 28/07 | Thanh toán (tiếp) | Màn hình QR, tự mở khóa |
| T4 29/07 | Thanh toán (hoàn thiện) | Kiểm thử mua khóa |
| T5 30/07 | Học online | Giao diện xem video |
| T6 31/07 | Học online (tiếp) | Lưu tiến độ học |
| T7 01/08 | Học online (tiếp) | Bảo mật video |
| CN 02/08 | Học online (hoàn thiện) | Kiểm thử luồng học |

### Tuần 3 — 03/08 → 08/08
| Ngày | Việc chính | Kết quả |
|------|------------|---------|
| T2 03/08 | Trang quản trị | Quản lý khóa học, video |
| T3 04/08 | Quản trị + Chuyển dữ liệu | CRUD tin tức, banner; bắt đầu import |
| T4 05/08 | Quản trị (hoàn thiện) | Đơn hàng, học viên |
| T5 06/08 | Chuyển dữ liệu (tiếp) | Import học viên & khóa cũ |
| T6 07/08 | Chứng chỉ + Triển khai | PDF chứng chỉ; đưa lên hosting |
| T7 08/08 | **Nghiệm thu & bàn giao** | Ký nghiệm thu, bảo hành 3 tháng |

---

## Việc cần chuẩn bị từ phía Học Viện

| Thời điểm | Hạng mục | Mục đích |
|-----------|----------|----------|
| Trước 27/07 | Tài khoản SePay + VietQR | Thanh toán |
| Trước 30/07 | Tài khoản AWS S3 | Lưu video bài học |
| Trước 04/08 | Backup database website cũ | Chuyển dữ liệu |
| Trước 07/08 | Hosting + tên miền | Triển khai chính thức |
| Trước 07/08 | Email gửi thông báo (SMTP) | Quên mật khẩu |
| Tuỳ chọn | File thiết kế chứng chỉ | Chứng chỉ PDF đẹp hơn |

---

## Phạm vi không nằm trong 20 ngày (giai đoạn sau)

Các tính năng sau **không** nằm trong gói báo giá hiện tại — có thể bổ sung sau nếu Học Viện có nhu cầu:

- Đăng nhập bằng Facebook / Google
- Mã giảm giá, gói membership
- Chương trình affiliate / giới thiệu bạn bè
- Đánh giá & bình luận khóa học
- Livestream, blog nâng cao

---

## Cam kết & bảo hành

- **Thời hạn:** 20 ngày làm việc (20/07 → 08/08/2026)
- **Phí:** 6.500.000 VNĐ trọn gói theo báo giá
- **Bảo hành:** 3 tháng kể từ ngày nghiệm thu — sửa lỗi kỹ thuật từ mã nguồn
- **Không bao gồm bảo hành:** thêm tính năng mới, thay đổi thiết kế lớn, nội dung marketing

---

## Liên hệ & cập nhật tiến độ

Tiến độ sẽ được cập nhật sau mỗi giai đoạn hoàn thành. Khách hàng nghiệm thu từng mốc trước khi chuyển sang giai đoạn tiếp theo.

**Tài liệu liên quan:**
- [Tổng kết Giai đoạn 0 & 1](./tong-ket-phase-0-1.md) — chi tiết những gì đã xong
- [Tổng quan dự án](./README.md) — phạm vi & tài liệu kỹ thuật

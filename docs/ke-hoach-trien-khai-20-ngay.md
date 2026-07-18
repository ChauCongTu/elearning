# Kế hoạch triển khai 20 ngày

**Dự án:** Website bán khóa học online — Học Viện Bông Nhài Trắng  
**Thời gian:** 20/07/2026 → 08/08/2026 (20 ngày làm việc)  
**Phạm vi:** Theo báo giá trọn gói 6.500.000 VNĐ (07/07/2026)  
**Cập nhật:** 17/07/2026

---

## Lời mở đầu

Kế hoạch dưới đây mô tả **từng giai đoạn sẽ làm gì** và **kết quả Học Viện nhận được** sau mỗi mốc thời gian. Trình bày theo ngôn ngữ dễ hiểu, không đi sâu kỹ thuật.

**Nguyên tắc triển khai:** Thiết kế giao diện được làm **trước và đầy đủ** (4 ngày), khách duyệt xong mới triển khai lập trình — tránh làm xong rồi sửa lớn, tốn thời gian cả hai bên.

---

## Tổng quan 20 ngày

```
20/07      23/07      29/07      03/08      08/08
  │          │          │          │          │
 Thiết kế   Website    Quản trị   TT + Học   DL + NT
           công khai              online     & bàn giao
            + Nền tảng
```

| # | Giai đoạn | Thời gian | Số ngày |
|---|-----------|-----------|---------|
| 1 | **Thiết kế giao diện** | 20–23/07 | **4 ngày** |
| 2 | Nền tảng hệ thống | 24/07 | 1 ngày |
| 3 | Website công khai | 25–27/07 | 3 ngày |
| 4 | Tài khoản học viên | 28–29/07 | 2 ngày |
| 5 | **Trang quản trị** | 30–31/07 | 2 ngày |
| 6 | Học online (video) | 01–03/08 | 3 ngày |
| 7 | Thanh toán tự động | 04–05/08 | 2 ngày |
| 8 | Chứng chỉ + Chuyển dữ liệu | 06–07/08 | 2 ngày |
| 9 | Triển khai & nghiệm thu | 08/08 | 1 ngày |
| | **Tổng** | | **20 ngày** |

> *Giai đoạn 8: chứng chỉ trước (06/08), chuyển dữ liệu cuối (07/08) trước go-live.*

---

## Giai đoạn 1 — Thiết kế giao diện *(4 ngày)*
**20–23/07/2026**

Đây là giai đoạn **quan trọng nhất** — quyết định website trông như thế nào trước khi viết một dòng code giao diện chính thức.

### Làm gì từng ngày?

| Ngày | Công việc | Đầu ra |
|------|-----------|--------|
| **T2 20/07** | Khảo sát & định hướng | Tham chiếu website cũ, báo giá, đối thủ; chốt danh sách trang cần có; bảng màu & font sơ bộ |
| **T3 21/07** | Bố cục các trang | Phác thảo bố cục trang chủ, khóa học, tin tức, liên hệ, bảng giá, về chúng tôi |
| **T4 22/07** | Thiết kế chi tiết | Mockup đầy màu: trang chủ, trang khóa học, đăng nhập; phiên bản mobile; giao diện học & thanh toán (phác thảo) |
| **T5 23/07** | Duyệt & chốt | Trình Học Viện xem, ghi nhận chỉnh sửa, **chốt thiết kế** — sau ngày này mới code giao diện chính thức |

### Học Viện nhận được

- Bộ **phác thảo / mockup** toàn bộ website công khai
- Thống nhất **màu sắc, font chữ, logo, bố cục** từng trang
- Danh sách **khu vực trang chủ** (banner, giới thiệu, khóa học, tin tức, form tư vấn…)
- Hình dung trước giao diện **học video** và **màn hình thanh toán QR**

### Việc cần phía Học Viện

- Cung cấp logo file gốc (nếu có bản chất lượng cao hơn)
- Góp ý nội dung ưu tiên hiển thị (ảnh founder, video, số liệu thống kê…)
- **Phản hồi trong ngày 23/07** để kịp tiến độ lập trình từ 24/07

### Mốc nghiệm thu

✅ Học Viện **ký duyệt thiết kế** (hoặc xác nhận qua Zalo/email) → chuyển sang giai đoạn lập trình.

---

## Giai đoạn 2 — Nền tảng hệ thống
**24/07/2026 | 1 ngày**

**Làm gì:** Dựng khung hệ thống phía sau — cơ sở dữ liệu, phân quyền quản trị viên / học viên, môi trường thử nghiệm.

**Học Viện nhận được:**
- Hệ thống sẵn sàng cho các tính năng tiếp theo
- Tài khoản thử để kiểm tra (quản trị + học viên)
- Vài khóa học mẫu trong hệ thống

---

## Giai đoạn 3 — Website công khai
**25–27/07/2026 | 3 ngày**

**Làm gì:** Lập trình giao diện theo **thiết kế đã duyệt** — toàn bộ website giới thiệu như báo giá.

**Học Viện nhận được:**

| Hạng mục | Mô tả |
|----------|-------|
| Trang chủ | Banner, giới thiệu, khóa học, tin tức, form tư vấn, hotline |
| Khóa học | Danh sách + chi tiết, tìm kiếm & lọc |
| Tin tức | Đọc bài viết, phân loại danh mục |
| Bảng giá | Giá dịch vụ spa + giá khóa học online |
| Liên hệ | Hotline, Zalo, Facebook, cơ sở, form tư vấn |
| Về chúng tôi | Câu chuyện, thống kê, founder, video |
| Thông tin | Chính sách & quy định học online |
| Đăng nhập / Đăng ký | Giao diện đồng bộ thương hiệu |

**Mốc nghiệm thu:** Duyệt website công khai trên môi trường thử — xác nhận khớp thiết kế đã chốt.

---

## Giai đoạn 4 — Tài khoản học viên
**28–29/07/2026 | 2 ngày**

**Làm gì:** Hoàn thiện khu vực cá nhân — đăng ký, đăng nhập, quên mật khẩu, trang **Khóa học của tôi**.

**Học Viện nhận được:**
- Học viên tự đăng ký, sửa thông tin cá nhân
- Trang xem các khóa đã đăng ký (sẵn sàng cho bước thanh toán)
- Quên mật khẩu qua email

**Mốc nghiệm thu:** Đăng ký → đăng nhập → thấy trang cá nhân hoạt động.

---

## Giai đoạn 5 — Trang quản trị
**30–31/07/2026 | 2 ngày**

**Làm gì:** Trang quản lý để Học Viện **tự thêm/sửa nội dung** — không cần nhờ lập trình viên mỗi lần đổi khóa hay banner.

**Học Viện nhận được:**

| Chức năng | Mô tả |
|-----------|-------|
| Tổng quan | Đơn hàng, doanh thu, học viên mới |
| Khóa học | Thêm / sửa / ẩn khóa, ảnh bìa, giá |
| Chương & bài | Sắp xếp nội dung, upload video |
| Đơn hàng | Lịch sử thanh toán |
| Banner & tin tức | Đổi banner trang chủ, đăng bài viết |
| Học viên | Danh sách, cấp khóa thủ công (CK tay) |
| Form tư vấn | Xem yêu cầu từ website |

**Mốc nghiệm thu:** Admin tự thêm 1 khóa + upload video → sẵn sàng cho bước thanh toán và học online.

---

## Giai đoạn 6 — Học online (xem video)
**01–03/08/2026 | 3 ngày**

**Làm gì:** Giao diện học — xem video theo chương/bài, tự lưu tiến độ, biết đã hoàn thành bao nhiêu %.

**Học Viện nhận được:**
- Trang học: danh sách bài bên trái, video bên phải
- Tiếp tục học đúng chỗ đã dừng
- Video chỉ học viên đã mua mới xem được
- Xem được trên điện thoại

**Cần từ Học Viện:** Tài khoản AWS (lưu video) + file video hoặc danh sách video hiện có.

**Mốc nghiệm thu:** Học viên đã mua xem được video, thoát vào lại vẫn giữ tiến độ.

---

## Giai đoạn 7 — Thanh toán tự động
**04–05/08/2026 | 2 ngày**

**Làm gì:** Học viên mua khóa trực tuyến — hệ thống **tự kích hoạt khóa học 24/7** sau khi nhận tiền, không cần duyệt tay từng đơn.

**Học Viện nhận được:**
- Nút **Mua khóa** trên trang chi tiết
- Màn hình thanh toán + hướng dẫn chuyển khoản
- Tự động mở khóa trong vài phút

**Cần từ Học Viện:** Tài khoản cổng thanh toán + thông tin ngân hàng nhận tiền.

**Mốc nghiệm thu:** Mua thử 1 khóa → khóa tự hiện trong "Khóa học của tôi".

---

## Giai đoạn 8 — Chứng chỉ & Chuyển dữ liệu
**06–07/08/2026 | 2 ngày**

### Chứng chỉ điện tử

**Làm gì:** Tự động cấp chứng chỉ PDF khi hoàn thành 100% khóa; trang tra cứu mã công khai.

**Học Viện nhận được:**
- Học viên tải chứng chỉ trong tài khoản
- Tra cứu mã trên chứng chỉ để xác minh

**Mốc nghiệm thu:** Hoàn thành khóa thử → nhận chứng chỉ PDF.

### Chuyển dữ liệu website cũ

**Làm gì:** Import tài khoản, khóa học, đơn hàng, tiến độ học từ WordPress/WooCommerce sang hệ thống mới.

**Học Viện nhận được:**
- Học viên cũ đăng nhập thấy khóa đã mua
- Báo cáo: bao nhiêu bản ghi chuyển thành công, mục nào cần xử lý tay

**Cần từ Học Viện:** File backup database website cũ.

**Mốc nghiệm thu:** Học viên cũ thấy khóa đã mua; tiến độ học giữ nguyên.

---

## Giai đoạn 9 — Triển khai & nghiệm thu
**08/08/2026 | 1 ngày**

**Làm gì:** Đưa website lên hosting chính thức, trỏ tên miền, chạy thử toàn bộ, bàn giao.

**Học Viện nhận được:**
- Website chạy trên tên miền thật (HTTPS)
- Thanh toán & video hoạt động ổn định
- Tài khoản quản trị + hướng dẫn sử dụng ngắn
- Checklist nghiệm thu 9 kịch bản
- Bảo hành kỹ thuật **3 tháng**

**Cần từ Học Viện:** Hosting + tên miền; xác nhận nghiệm thu.

---

## Lịch theo tuần

### Tuần 1 — 20/07 → 26/07 *(Thiết kế + Website)*

| Ngày | Việc chính | Kết quả |
|------|------------|---------|
| T2 20/07 | Thiết kế: khảo sát & định hướng | Moodboard, danh sách trang |
| T3 21/07 | Thiết kế: bố cục các trang | Wireframe toàn site |
| T4 22/07 | Thiết kế: mockup chi tiết + mobile | Bản thiết kế đầy màu |
| T5 23/07 | **Duyệt & chốt thiết kế** | ✅ Khách phê duyệt |
| T6 24/07 | Nền tảng hệ thống | Khung hệ thống sẵn sàng |
| T7 25/07 | Code website: trang chủ + khóa học | Theo mockup đã duyệt |
| CN 26/07 | Code website: tin tức + landing pages | Website công khai gần xong |

### Tuần 2 — 27/07 → 02/08 *(Tài khoản + Quản trị + Học)*

| Ngày | Việc chính | Kết quả |
|------|------------|---------|
| T2 27/07 | Hoàn thiện website + nghiệm thu | Website công khai ✅ |
| T3 28/07 | Tài khoản học viên | Trang cá nhân |
| T4 29/07 | Tài khoản (hoàn thiện) | Khóa học của tôi |
| T5 30/07 | Trang quản trị | Quản lý khóa, video |
| T6 31/07 | Quản trị (hoàn thiện) | Banner, tin tức, form tư vấn |
| T7 01/08 | Học online | Giao diện xem video |
| CN 02/08 | Học online (tiếp) | Lưu tiến độ học |

### Tuần 3 — 03/08 → 08/08 *(Thanh toán + Go-live)*

| Ngày | Việc chính | Kết quả |
|------|------------|---------|
| T2 03/08 | Học online (hoàn thiện) | Luồng học ổn định |
| T3 04/08 | Thanh toán tự động | Kết nối cổng TT |
| T4 05/08 | Thanh toán (hoàn thiện) | Mua khóa tự kích hoạt |
| T5 06/08 | Chứng chỉ điện tử | PDF + tra cứu |
| T6 07/08 | Chuyển dữ liệu cũ | Import từ WordPress |
| T7 08/08 | **Nghiệm thu & bàn giao** | Ký nghiệm thu, bảo hành 3 tháng |

---

## Checklist nghiệm thu cuối (08/08)

| # | Kịch bản | Kết quả mong đợi |
|---|----------|------------------|
| 1 | Vào trang chủ, tìm khóa học | Hiển thị đúng thiết kế đã duyệt |
| 2 | Đăng ký tài khoản mới | Tạo tài khoản thành công |
| 3 | Mua khóa — thanh toán tự động | Chuyển khoản → khóa tự kích hoạt |
| 4 | Xem video bài học | Phát được, giữ tiến độ khi quay lại |
| 5 | Hoàn thành 100% khóa | Nhận chứng chỉ PDF |
| 6 | Tra cứu chứng chỉ | Nhập mã → xác thực được |
| 7 | Admin thêm khóa + video | Học viên xem được |
| 8 | Admin xem đơn hàng | Thấy lịch sử thanh toán |
| 9 | Admin đổi banner | Trang chủ cập nhật ngay |

---

## Việc Học Viện cần chuẩn bị

| Thời điểm | Hạng mục | Phục vụ giai đoạn |
|-----------|----------|-------------------|
| **Trước 20/07** | Logo file gốc, ảnh founder, nội dung ưu tiên | Thiết kế |
| **23/07** | Phản hồi duyệt thiết kế | Chốt mockup |
| Trước 04/08 | Tài khoản cổng thanh toán + ngân hàng nhận tiền | Thanh toán tự động |
| Trước 01/08 | Tài khoản AWS + file video | Học online |
| Trước 06/08 | Mẫu thiết kế chứng chỉ (tuỳ chọn) | Chứng chỉ PDF |
| Trước 07/08 | Backup database website cũ | Chuyển dữ liệu |
| Trước 08/08 | Hosting + tên miền + email SMTP | Go-live |

---

## Phạm vi ngoài 20 ngày (giai đoạn sau)

Không nằm trong gói báo giá hiện tại — có thể bổ sung sau:

- Đăng nhập Facebook / Google
- Mã giảm giá, membership, affiliate
- Đánh giá khóa học, livestream

---

## Cam kết

| Hạng mục | Nội dung |
|----------|----------|
| Thời hạn | 20 ngày làm việc (20/07 → 08/08/2026) |
| Phí | 6.500.000 VNĐ trọn gói |
| Thiết kế | 4 ngày đầu, có duyệt trước khi code |
| Bảo hành | 3 tháng sau nghiệm thu — sửa lỗi kỹ thuật |
| Không bao gồm | Thêm tính năng mới, đổi thiết kế lớn sau khi đã chốt |

---

## Cập nhật tiến độ

Tiến độ báo cáo sau **mỗi giai đoạn**. Đặc biệt: sau **23/07** cần xác nhận thiết kế để toàn bộ lịch còn lại chạy đúng hạn.

**Tài liệu liên quan:**
- [Tổng kết đã triển khai](./tong-ket-phase-0-1.md)
- [Tổng quan dự án](./README.md)

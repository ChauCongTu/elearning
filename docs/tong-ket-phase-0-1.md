# Tổng kết Giai đoạn 0 & 1 — Học Viện Bông Nhài Trắng

**Dự án:** Website bán khóa học online  
**Báo giá:** Trọn gói 6.500.000 VNĐ (07/07/2026)  
**Cập nhật:** 16/07/2026  
**Trạng thái:** ✅ Giai đoạn 0 & 1 hoàn thành

---

## 1. Tóm tắt nhanh

Hai giai đoạn đầu đã xây xong **nền móng kỹ thuật** và **toàn bộ website công khai** theo báo giá và đối chiếu với website cũ [hocvienbongnhaitrang.com](https://hocvienbongnhaitrang.com/).

Khách hàng có thể xem trước website với đầy đủ trang giới thiệu, khóa học, tin tức, bảng giá, liên hệ. Các tính năng **mua khóa, học video, quản trị nội dung** sẽ triển khai ở các giai đoạn tiếp theo.

| Giai đoạn | Mục tiêu | Trạng thái |
|-----------|----------|------------|
| **0 — Nền tảng** | Hệ thống cơ sở, cơ sở dữ liệu, phân quyền | ✅ Xong |
| **1 — Website công khai** | Trang chủ, landing pages, tin tức, form tư vấn | ✅ Xong |
| 2 — Tài khoản học viên | Đăng ký, trang cá nhân, khóa đã mua | ⬜ Chưa bắt đầu |
| 3 — Thanh toán | VietQR SePay, tự mở khóa sau chuyển khoản | ⬜ Chưa bắt đầu |
| 4 — Học online | Xem video, lưu tiến độ học | ⬜ Chưa bắt đầu |
| 5 — Quản trị | Thêm/sửa khóa học, đơn hàng, banner, tin tức | ⬜ Chưa bắt đầu |
| 6 — Chuyển dữ liệu | Import từ WordPress/WooCommerce cũ | ⬜ Chưa bắt đầu |
| 7 — Chứng chỉ | PDF tự động khi hoàn thành khóa | ⬜ Chưa bắt đầu |
| 8 — Triển khai | Đưa lên hosting, nghiệm thu, bàn giao | ⬜ Chưa bắt đầu |

---

## 2. Giai đoạn 0 — Nền tảng hệ thống

### Đã làm được gì?

- **Cơ sở dữ liệu** đầy đủ cho toàn bộ dự án: tài khoản, khóa học, chương/bài, đơn hàng, tiến độ học, banner, tin tức, yêu cầu tư vấn…
- **Phân quyền:** tài khoản Quản trị viên và Học viên tách biệt; quản trị viên có khu vực riêng.
- **Giao diện nền:** bố cục trang công khai và trang quản trị (khung sườn).
- **Dữ liệu mẫu:** vài khóa học demo, tài khoản thử nghiệm để kiểm tra.
- **Kiểm thử tự động** các luồng cơ bản (đăng ký, phân quyền admin).

### Tài khoản demo (môi trường dev)

| Email | Mật khẩu | Vai trò |
|-------|----------|---------|
| `admin@example.com` | `password` | Quản trị viên |
| `student@example.com` | `password` | Học viên |

> *Tài khoản trên chỉ dùng khi chạy thử trên máy dev. Khi lên website chính thức sẽ tạo tài khoản thật cho Học Viện.*

---

## 3. Giai đoạn 1 — Website công khai

### Các trang đã có

| Trang | Địa chỉ | Nội dung chính |
|-------|---------|----------------|
| Trang chủ | `/` | Banner, giới thiệu, khóa học, tin tức, form tư vấn, hotline |
| Danh sách khóa học | `/courses` | Tìm kiếm, lọc, sắp xếp khóa học |
| Chi tiết khóa học | `/courses/{tên-khóa}` | Thông tin khóa, giá, giảng viên |
| Tin tức | `/tin-tuc` | Danh sách bài viết (10 bài mẫu) |
| Tin theo danh mục | `/tin-tuc/danh-muc/...` | Hướng nghiệp, kiến thức, tin nổi bật |
| Chi tiết bài viết | `/tin-tuc/{slug}` | Nội dung bài viết |
| Bảng giá | `/bang-gia` | Giá dịch vụ spa + giá khóa học online |
| Về chúng tôi | `/ve-chung-toi` | Câu chuyện, thống kê, founder, video |
| Liên hệ | `/lien-he` | Hotline, Zalo, Facebook, cơ sở, form tư vấn |
| Thông tin | `/thong-tin` | Chính sách, quy định học online |

### Trang chủ — các khu vực (đối chiếu website cũ)

1. Banner carousel + nút kêu gọi hành động  
2. Tìm kiếm nhanh khóa học  
3. Thống kê (25+ năm kinh nghiệm, 3.000+ học viên…)  
4. Giới thiệu Học Viện  
5. Khóa học đang tuyển sinh  
6. Vì sao chọn Học Viện (4 lý do)  
7. Dịch vụ nổi bật  
8. Lĩnh vực đào tạo  
9. Giới thiệu nghệ nhân / Founder  
10. Video nổi bật  
11. Khóa học nổi bật & khóa mới  
12. Tin tức / Hướng nghiệp / Kiến thức  
13. Form đặt lịch tư vấn (lưu vào hệ thống)  
14. Dải hotline cuối trang  

### Thương hiệu & giao diện

- Logo và favicon Học Viện Bông Nhài Trắng  
- Font tiếng Việt **Plus Jakarta Sans** (hiển thị đúng dấu)  
- Giao diện hiện đại: gradient, glass effect, responsive mobile  
- Menu header/footer thống nhất trên mọi trang  

### File cấu hình tập trung — `config/site.json`

Toàn bộ thông tin cố định (tên web, logo, hotline, Zalo, Facebook, menu, số liệu thống kê, video, bảng giá dịch vụ…) nằm **một chỗ duy nhất**. Khi cần đổi hotline hay thêm mục menu, chỉ sửa file này — không phải tìm sửa nhiều nơi.

**Chế độ bảo trì:** bật `maintenance.enabled: true` → website công khai tạm đóng, hiện trang thông báo; quản trị viên vẫn đăng nhập được.

### Form tư vấn

Khách điền form tại trang Liên hệ hoặc cuối trang chủ → dữ liệu lưu vào bảng `consultation_requests` để Học Viện xử lý sau (hiện chưa có màn hình admin xem — sẽ có ở Giai đoạn 5).

### Tin tức

- Giao diện đọc tin đầy đủ (danh sách, danh mục, chi tiết)  
- 10 bài viết mẫu + 4 danh mục (seeder)  
- **Chưa có** trang admin thêm/sửa bài — chuyển sang Giai đoạn 5  

### Đăng nhập / Đăng ký

- Có sẵn từ nền tảng (đăng nhập, đăng ký, quên mật khẩu)  
- Giao diện đồng bộ thương hiệu Học Viện  
- Trang **Khóa học của tôi** chưa hoàn thiện — Giai đoạn 2  

---

## 4. Những gì khách hàng có thể làm ngay

- Duyệt toàn bộ website công khai như người dùng thật  
- Gửi form tư vấn (dữ liệu đã lưu trong hệ thống)  
- Xem danh sách và chi tiết khóa học demo  
- Đọc tin tức mẫu  
- Đăng ký / đăng nhập tài khoản thử  
- Đăng nhập admin → vào `/admin` (dashboard khung, chưa có CRUD đầy đủ)  

---

## 5. Chưa có trong Giai đoạn 0 & 1 (theo đúng phạm vi)

| Tính năng | Giai đoạn dự kiến |
|-----------|-------------------|
| Mua khóa học, thanh toán VietQR | Giai đoạn 3 |
| Xem video bài học, lưu tiến độ | Giai đoạn 4 |
| Trang quản trị: thêm/sửa khóa, video, đơn hàng, tin tức | Giai đoạn 5 |
| Chuyển dữ liệu từ website WordPress cũ | Giai đoạn 6 |
| Chứng chỉ PDF khi hoàn thành khóa | Giai đoạn 7 |
| Đưa website lên hosting chính thức | Giai đoạn 8 |

Các tính năng **ngoài gói** (đăng nhập Facebook/Google, mã giảm giá, membership, affiliate…): xem [out-of-scope.md](./out-of-scope.md).

---

## 6. Việc cần phía Học Viện chuẩn bị (cho các giai đoạn sau)

| Hạng mục | Dùng cho | Ghi chú |
|----------|----------|---------|
| Tài khoản SePay (VietQR) | Thanh toán | API key, webhook |
| Tài khoản AWS S3 | Lưu video bài học | Bucket riêng, chi phí lưu trữ |
| Hosting / domain | Website chính thức | Hostinger theo báo giá |
| Backup database website cũ | Chuyển dữ liệu | File SQL hoặc quyền đọc DB |
| File thiết kế chứng chỉ (nếu có) | Chứng chỉ PDF | Logo, layout mẫu |
| Nội dung video khóa học | Upload bài học | File MP4 hoặc link hiện có |
| Email SMTP | Quên mật khẩu, thông báo | Gmail app password hoặc email Hostinger |

---

## 7. Chất lượng & kiểm thử

- **54 bài kiểm thử tự động** (51 pass, 3 bỏ qua do tính năng 2FA tùy chọn)  
- Kiểm tra: trang công khai, tin tức, navigation, chế độ bảo trì, phân quyền admin  
- Build frontend production thành công, sẵn sàng upload lên hosting  

---

## 8. Tài liệu kỹ thuật (tham khảo nội bộ)

| File | Nội dung |
|------|----------|
| [phases/phase-0-foundation.md](./phases/phase-0-foundation.md) | Checklist chi tiết Giai đoạn 0 |
| [phases/phase-1-public-website.md](./phases/phase-1-public-website.md) | Checklist chi tiết Giai đoạn 1 |
| [ui-system.md](./ui-system.md) | Cấu trúc giao diện & file `site.json` |
| [ke-hoach-trien-khai-20-ngay.md](./ke-hoach-trien-khai-20-ngay.md) | Kế hoạch 20 ngày gửi khách hàng |

---

## 9. Bước tiếp theo

→ **Giai đoạn 2:** Hoàn thiện khu vực tài khoản học viên — trang cá nhân, danh sách khóa đã mua (giao diện), đồng bộ đăng nhập/đăng ký.

Xem lịch triển khai đầy đủ: [ke-hoach-trien-khai-20-ngay.md](./ke-hoach-trien-khai-20-ngay.md).

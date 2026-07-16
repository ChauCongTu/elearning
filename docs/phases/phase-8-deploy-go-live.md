# Phase 8 — Deploy & Go-live

**Mục tiêu:** Triển khai Hostinger, UAT, bàn giao, bảo hành 3 tháng.  
**Phụ thuộc:** Phase 0–7  
**Ước lượng:** 2–3 ngày

## Checklist

### Hostinger setup

- [ ] Tạo database MySQL, user, grant
- [ ] Upload code theo [deployment.md](../deployment.md)
- [ ] Document root → `public/`
- [ ] `.env` production
- [ ] `php artisan migrate --force`
- [ ] `php artisan storage:link`
- [ ] Cron `schedule:run`
- [ ] SSL + domain

### Third-party production

- [ ] SePay: webhook URL live, test 1 giao dịch nhỏ
- [ ] AWS S3: bucket policy private, IAM least privilege
- [ ] Email SMTP (Hostinger hoặc Gmail/app password) — reset password

### Migration production

- [ ] Backup legacy DB trước
- [ ] `php artisan migrate:legacy --dry-run` trên staging
- [ ] Production run + validation report
- [ ] Thông báo học viên đổi mật khẩu nếu cần

### UAT script (khách hàng)

| # | Kịch bản | Pass |
|---|----------|------|
| 1 | Xem trang chủ, tìm khóa | [ ] |
| 2 | Đăng ký tài khoản mới | [ ] |
| 3 | Mua khóa VietQR → tự mở | [ ] |
| 4 | Xem video, thoát vào lại giữ tiến độ | [ ] |
| 5 | Hoàn thành 100% → chứng chỉ | [ ] |
| 6 | Tra cứu chứng chỉ công khai | [ ] |
| 7 | Admin: thêm khóa, upload video | [ ] |
| 8 | Admin: xem đơn hàng | [ ] |
| 9 | Đổi banner homepage | [ ] |

### DNS cutover

- [ ] Giảm TTL trước 24h
- [ ] Trỏ domain mới hoặc thay thế domain cũ
- [ ] Giữ legacy read-only 1–2 tuần fallback

### Bàn giao

- [ ] Tài khoản admin
- [ ] Tài liệu `.env` keys (bàn giao an toàn)
- [ ] Hướng dẫn admin ngắn (video hoặc doc)
- [ ] Source code repo access

### Bảo hành (3 tháng)

- [ ] Theo dõi lỗi kỹ thuật từ mã nguồn
- [ ] Không bao gồm: nội dung mới, tính năng ngoài gói ([out-of-scope.md](../out-of-scope.md))

## Post-launch monitoring

- [ ] Log webhook SePay (`payments` table)
- [ ] Laravel log rotation
- [ ] S3 cost alert (AWS billing)

## Acceptance criteria

1. UAT 9/9 pass
2. Khách ký nghiệm thu
3. Hệ thống chạy ổn định 48h không lỗi critical

## Hoàn tất dự án

Tất cả phase checklist `[x]` → chuyển sang maintenance / giai đoạn 2 nếu có hợp đồng mới.

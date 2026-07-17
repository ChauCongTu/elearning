# Phase 7 — Digital Certificates

**Mục tiêu:** Tự động cấp chứng chỉ PDF khi hoàn thành 100%, mã tra cứu công khai.  
**Phụ thuộc:** Phase 5 (progress 100%)  
**Ước lượng:** 2–3 ngày

## Checklist

### Package

- [ ] `composer require barryvdh/laravel-dompdf`
- [ ] Template Blade `resources/views/certificates/template.blade.php`
  - Logo Học Viện, tên HV, tên khóa, ngày cấp, mã tra cứu
  - Khách cung cấp file thiết kế → adjust template

### Backend

- [ ] `CertificateService::issue(Enrollment)` — generate PDF, store `storage/app/certificates/`
- [ ] `verification_code` — format `BNT-XXXX-XXXX` (unique)
- [ ] Listener/Job: khi `progress_percent` chạm 100 → dispatch `IssueCertificateJob`
- [ ] Idempotent: một enrollment một certificate

### Routes

```
GET /account/certificates              → list certificates (auth)
GET /account/certificates/{id}/download→ download PDF (auth, policy)
GET /certificates/verify/{code}        → public verify page (no auth)
```

### Public verify page

- [ ] Hiển thị: tên học viên, khóa học, ngày cấp, trạng thái hợp lệ
- [ ] Không lộ email/phone
- [ ] SEO `noindex` trang verify

### Frontend

- [ ] `pages/account/certificates.tsx` — list + download
- [ ] `pages/public/certificate-verify.tsx` — form nhập mã + kết quả
- [ ] Trong player: badge "Hoàn thành" + link chứng chỉ khi 100%

### Tests

- [ ] 100% progress triggers certificate
- [ ] Verify valid code returns course info
- [ ] Invalid code → 404
- [ ] User A cannot download cert of user B

## Acceptance criteria

1. Học viên hoàn thành khóa → nhận PDF trong account
2. Bên thứ ba tra cứu mã → thấy thông tin xác thực
3. Tạo lại không duplicate certificate

## Không làm trong phase này

- Chứng chỉ có chữ ký số PKI
- Gửi email tự động đính kèm PDF (có thể thêm sau với queue mail)

## Tiếp theo

→ [phase-8-deploy-go-live.md](./phase-8-deploy-go-live.md)

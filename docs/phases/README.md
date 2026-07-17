# Lộ trình triển khai

Triển khai **tuần tự** theo dependency. Mỗi phase có checklist — đánh dấu `[x]` khi xong.

## Sơ đồ phụ thuộc

```
Phase 0 Foundation
    └── Phase 1 Public Website
            └── Phase 2 Auth & Account (mở rộng)
                    └── Phase 3 Payment (SePay)
                            └── Phase 4 Learning (S3 + progress)
                                    ├── Phase 5 Admin
                                    ├── Phase 6 Migration
                                    └── Phase 7 Certificates
                                            └── Phase 8 Deploy & Go-live
```

Phase 5–7 có thể song song một phần sau khi Phase 4 có skeleton.

## Danh sách phase

| Phase | File | Mô tả | Ước lượng |
|-------|------|-------|-----------|
| 0 | [phase-0-foundation.md](./phase-0-foundation.md) | DB, models, Mantine, roles | 2–3 ngày |
| 1 | [phase-1-public-website.md](./phase-1-public-website.md) | Homepage, listing, chi tiết khóa | 3–4 ngày |
| 2 | [phase-2-auth-account.md](./phase-2-auth-account.md) | Profile, khóa đã mua | 2 ngày |
| 3 | [phase-3-payment.md](./phase-3-payment.md) | SePay VietQR, webhook | 3–4 ngày |
| 4 | [phase-4-learning.md](./phase-4-learning.md) | Player, S3, tiến độ | 4–5 ngày |
| 5 | [phase-5-admin.md](./phase-5-admin.md) | CRUD admin, banner | 4–5 ngày |
| 6 | [phase-6-migration.md](./phase-6-migration.md) | Import WordPress/WC | 3–4 ngày |
| 7 | [phase-7-certificates.md](./phase-7-certificates.md) | PDF + tra cứu | 2–3 ngày |
| 8 | [phase-8-deploy-go-live.md](./phase-8-deploy-go-live.md) | Hostinger, UAT, bàn giao | 2–3 ngày |

**Tổng:** ~20–30 ngày làm việc (khớp báo giá)

## Trạng thái hiện tại

| Phase | Status |
|-------|--------|
| 0 | ✅ Hoàn thành | |
| 1 | ✅ Hoàn thành | |
| 2 | ✅ Hoàn thành | |
| 3–8 | ⬜ Chưa bắt đầu | |

## Tài liệu gửi khách

| File | Mục đích |
|------|----------|
| [tong-ket-phase-0-1.md](../tong-ket-phase-0-1.md) | Tổng kết đã làm xong (Giai đoạn 0 & 1) |
| [ke-hoach-trien-khai-20-ngay.md](../ke-hoach-trien-khai-20-ngay.md) | Lịch 20 ngày 20/07 → 08/08 |

## Cách dùng với Cursor Agent

```
Implement Phase X theo docs/phases/phase-X-*.md và skill elearning-platform
```

Agent sẽ đọc checklist, code đúng phạm vi, không nhảy phase.

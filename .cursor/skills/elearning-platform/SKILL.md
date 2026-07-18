---
name: elearning-platform
description: Triển khai website bán khóa học online Laravel + Inertia React cho Học Viện Bông Nhài Trắng. Bao gồm thanh toán VietQR SePay, học video AWS S3, admin, migrate từ WordPress/WooCommerce, chứng chỉ PDF. Use when building features in this repo, implementing phases from docs/phases/, migrating legacy data, or deploying to Hostinger.
---

# E-Learning Platform — Học Viện Bông Nhài Trắng

## Trước khi code

1. Đọc [docs/README.md](../../docs/README.md) để nắm phạm vi giai đoạn hiện tại.
2. Mở file phase tương ứng trong [docs/phases/](../../docs/phases/) — chỉ triển khai đúng phase đang active.
3. Tham chiếu [docs/data-model.md](../../docs/data-model.md) cho schema; [docs/legacy-survey.md](../../docs/legacy-survey.md) cho mapping dữ liệu cũ.
4. Không implement tính năng trong [docs/out-of-scope.md](../../docs/out-of-scope.md) trừ khi user yêu cầu rõ.

## Tech stack (bắt buộc)

| Layer | Stack |
|-------|-------|
| Backend | PHP 8.3, Laravel 13, Fortify, Sanctum, Inertia Laravel 3 |
| Frontend | React 18+, Inertia React 3, **Mantine 7**, Tailwind 4, TypeScript, Vite 5 |
| DB | MySQL 8 / MariaDB 10.6 |
| Video | AWS S3 + signed URL |
| Payment | SePay VietQR webhook |
| Deploy | Build FE local/CI → upload Laravel + `public/build/` lên Hostinger (không Node trên server) |

**Lưu ý:** Starter hiện dùng Radix/shadcn. Khi bắt đầu phase UI công khai (phase 1), chuyển sang Mantine theo [docs/architecture.md](../../docs/architecture.md).

## Quy tắc triển khai

- **UI tái sử dụng:** Marketing content + thông tin cố định → `config/site.json`; section UI → `components/public/sections/`; compose trong page. Xem [docs/ui-system.md](../../docs/ui-system.md).
- Homepage đủ section legacy + báo giá: banner, tuyển sinh, tìm kiếm, vì sao chọn, founder, video, tư vấn, hotline.
- Một PR / một phase feature nhỏ; hoàn thành checklist phase trước khi sang phase tiếp.
- Controller mỏng, logic nghiệp vụ trong Service/Action class.
- **Backend pattern:** `Controller → Interface (Contracts) → Service → Model`. Bind interface trong `AppServiceProvider`. Xem [docs/architecture.md](../../docs/architecture.md).
- Mọi route Inertia trả props typed; page React dùng TypeScript interface.
- Video **không** public URL trực tiếp — luôn qua signed URL có TTL.
- Webhook SePay: verify signature, idempotent (không mở khóa 2 lần).
- Migration legacy: chạy dry-run trước, log mapping `legacy_id → new_id`.

## Workflow mỗi phase

```
1. Đọc phase MD → xác nhận dependencies đã xong
2. Migration + Model + Factory/Seeder (nếu cần)
3. Backend: routes, controllers, policies, form requests
4. Frontend: Inertia pages + Mantine components
5. Test: Pest feature test cho happy path + edge case chính
6. Cập nhật checklist trong phase MD (đánh dấu [x])
```

## Deploy checklist (Hostinger)

Chi tiết: [docs/deployment.md](../../docs/deployment.md)

```bash
# Local / CI
composer install --no-dev --optimize-autoloader
npm ci && npm run build
php artisan config:cache && php artisan route:cache && php artisan view:cache

# Upload: toàn bộ project trừ node_modules, .git
# Server: chỉ PHP — không cần npm/node
```

## Mapping legacy → mới (tóm tắt)

| Legacy (WordPress/WooCommerce) | Hệ thống mới |
|-------------------------------|--------------|
| `wp_users` | `users` |
| WooCommerce `product` (khóa học) | `courses` |
| Product categories | `categories` |
| Order / order items | `orders`, `order_items` |
| LMS progress (plugin — cần xác nhận) | `lesson_progress`, `enrollments` |
| Media attachments | `lessons.video_s3_key` |

Chi tiết: [docs/legacy-survey.md](../../docs/legacy-survey.md), [docs/phases/phase-7-migration.md](../../docs/phases/phase-7-migration.md).

## Tài liệu tham khảo

- [design.md](../../design.md) — **Hallmark design system (Atelier editorial)**
- [docs/ui-system.md](../../docs/ui-system.md) — **section architecture tái sử dụng**
- [docs/architecture.md](../../docs/architecture.md) — kiến trúc, package, cấu trúc thư mục
- [docs/data-model.md](../../docs/data-model.md) — ERD và bảng
- [docs/deployment.md](../../docs/deployment.md) — Hostinger, env vars
- [docs/out-of-scope.md](../../docs/out-of-scope.md) — giai đoạn sau

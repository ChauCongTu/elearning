# Phase 0 — Foundation

**Mục tiêu:** Nền tảng kỹ thuật — database, models, roles, Mantine setup.  
**Phụ thuộc:** Không  
**Ước lượng:** 2–3 ngày  
**Trạng thái:** ✅ Hoàn thành

## Checklist

### Database & Models

- [x] Migration tất cả bảng theo [data-model.md](../data-model.md)
- [x] Eloquent models + relationships + factories
- [x] Seeder: 1 admin, 2–3 course demo, chapters/lessons mẫu
- [x] Enum `UserRole`, `OrderStatus`, `EnrollmentStatus`, `EnrollmentSource`

### Auth & Roles

- [x] Thêm `role`, `phone` vào `users`
- [x] Middleware `EnsureUserIsAdmin`
- [x] Policy stubs: `CoursePolicy`, `EnrollmentPolicy`
- [x] Fortify register: thu thập phone (optional)

### Frontend baseline

- [x] Cài Mantine 7 + `@mantine/notifications`
- [x] `MantineProvider` trong `resources/js/app.tsx`
- [x] Layout shell: `PublicLayout`, `AdminLayout` (skeleton)
- [x] Types TS: `Course`, `Chapter`, `Lesson`, `Enrollment`

### Packages

- [x] `composer require laravel/sanctum` (publish config)
- [x] `composer require league/flysystem-aws-s3-v3` (phase 4 dùng, cài sớm OK)

### DevEx

- [x] Pest test: user registration creates student role
- [x] Pest test: admin middleware blocks student

## Demo routes

| URL | Mô tả |
|-----|-------|
| `/courses` | Danh sách khóa học từ DB (Mantine) |
| `/admin` | Dashboard admin (cần login admin) |

## Tài khoản demo

| Email | Password | Role |
|-------|----------|------|
| `admin@example.com` | `password` | admin |
| `student@example.com` | `password` | student |

## Tiếp theo

→ [phase-1-public-website.md](./phase-1-public-website.md)

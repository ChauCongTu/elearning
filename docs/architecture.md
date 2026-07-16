# Kiến trúc hệ thống

## Tổng quan

```
┌─────────────┐     Inertia JSON      ┌──────────────────┐
│  React SPA  │ ◄──────────────────► │  Laravel 13 API  │
│  (Mantine)  │     + cookies        │  Fortify + Web   │
└─────────────┘                       └────────┬─────────┘
                                               │
                    ┌──────────────────────────┼──────────────────────────┐
                    ▼                          ▼                          ▼
              ┌──────────┐              ┌────────────┐              ┌────────────┐
              │  MySQL   │              │  AWS S3    │              │  SePay     │
              │  (Host)  │              │  (video)   │              │  Webhook   │
              └──────────┘              └────────────┘              └────────────┘
```

## Tech stack

### Backend

| Thành phần | Phiên bản | Vai trò |
|------------|-----------|---------|
| PHP | 8.3+ | Runtime |
| Laravel | 13.x | Framework |
| Inertia Laravel | ^3.x | Bridge server ↔ React |
| Fortify | ^1.x | Auth (login, register, 2FA, reset) |
| Sanctum | ^4.x | API token + SPA cookie (webhook nội bộ nếu cần) |
| MySQL | 8.0+ / MariaDB 10.6+ | Database |

### Frontend

| Thành phần | Phiên bản | Vai trò |
|------------|-----------|---------|
| React | 18.x+ | UI (hiện starter: 19.x) |
| Inertia React | ^3.x | Client adapter |
| Mantine | 7.x | Component library (**target**) |
| Tailwind CSS | 4.x | Layout, spacing, responsive |
| Vite | 5.x+ | Bundler |
| TypeScript | 5.x | Type safety |

### Dev & quality

- Laravel Pint — PHP style
- ESLint + Prettier — JS/TS
- PHPUnit / Pest — backend tests

## Chuyển từ Starter Kit sang Mantine

Starter hiện dùng Radix + shadcn. Khi bắt phase 1:

```bash
npm install @mantine/core @mantine/hooks @mantine/form @mantine/notifications @mantine/dates dayjs
```

- Layout công khai + admin: Mantine `AppShell`, `NavLink`, `DataTable`
- Giữ Tailwind cho utility; Mantine cho form, modal, table, notification
- Auth pages có thể giữ layout hiện tại tạm thời, refactor dần

## Cấu trúc thư mục

```
app/
├── Actions/              # Fortify actions (register, reset password)
├── Contracts/            # Service interfaces
│   ├── Admin/
│   ├── Catalog/
│   ├── Consultation/
│   └── Content/
├── Enums/                # OrderStatus, EnrollmentStatus, UserRole
├── Http/
│   ├── Controllers/      # Mỏng — chỉ validate + gọi service + Inertia
│   │   ├── Admin/
│   │   ├── Public/
│   │   └── Webhook/      # SePayWebhookController (phase 3)
│   ├── Middleware/
│   └── Requests/
├── Models/               # Eloquent + scopes quan hệ
├── Policies/
├── Services/             # Implementations (bind trong AppServiceProvider)
│   ├── Admin/
│   ├── Catalog/
│   ├── Consultation/
│   ├── Content/
│   ├── SePayService.php          # phase 3
│   ├── VideoStreamService.php    # phase 4
│   └── CertificateService.php    # phase 7
└── Console/Commands/
```

### Luồng xử lý (Phase 1+)

```
Request → Controller → Interface → Service → Model
```

| Layer | Trách nhiệm |
|-------|-------------|
| **Controller** | Nhận request, validate (FormRequest), gọi service, trả Inertia/JSON |
| **Interface** | Contract trong `app/Contracts/*` — dễ mock/test, swap implementation |
| **Service** | Query, filter, orchestration, business rules |
| **Model** | Eloquent, scopes (`published`, `active`, `featured`), relations |

Bindings đăng ký tại `AppServiceProvider::register()`.

### Services hiện có (Phase 1)

| Interface | Service | Dùng bởi |
|-----------|---------|----------|
| `CourseCatalogServiceInterface` | `CourseCatalogService` | `CourseController`, `PageController`, `HomePageService` |
| `CategoryServiceInterface` | `CategoryService` | `CourseController`, `HomePageService` |
| `BannerServiceInterface` | `BannerService` | `HomePageService` |
| `HomePageServiceInterface` | `HomePageService` | `HomeController` |
| `SiteContentServiceInterface` | `SiteContentService` | `PageController`, `HomePageService` |
| `ConsultationServiceInterface` | `ConsultationService` | `ConsultationController` |
| `PostServiceInterface` | `PostService` | `PostController`, `HomePageService` |
| `PostCategoryServiceInterface` | `PostCategoryService` | `PostController` |

resources/js/
├── pages/
│   ├── public/        # home, courses, course-detail
│   ├── learn/         # lesson player
│   ├── account/       # my-courses
│   └── admin/
├── components/
│   └── mantine/       # wrappers nếu cần
└── types/
    ├── course.ts
    └── order.ts
```

## Phân quyền

| Role | Quyền |
|------|-------|
| `student` | Mua khóa, học, tải chứng chỉ của mình |
| `admin` | CRUD toàn bộ, xem đơn hàng, upload video |
| `super_admin` | Cài đặt hệ thống, webhook secrets |

Implement: column `users.role` + Policy trên Course, Lesson, Order.

## Luồng thanh toán SePay

```
1. Student click "Mua khóa" → POST /orders → tạo order pending + mã đơn unique
2. Hiển thị VietQR (SePay API) với nội dung chuyển khoản = mã đơn
3. SePay webhook POST /webhooks/sepay → verify HMAC/signature
4. Khớp số tiền + mã đơn → order paid → Enrollment::create
5. Redirect student tới "Khóa học của tôi"
```

Idempotency: `orders.sepay_transaction_id` unique; bỏ qua webhook trùng.

## Luồng video S3

```
1. Admin upload → presigned PUT hoặc multipart qua backend
2. Lưu lessons.video_s3_key, lessons.duration_seconds
3. Student request xem → policy check enrollment → signed GET URL (TTL 1–4h)
4. Frontend player gửi heartbeat → PATCH lesson_progress.watched_seconds
```

Không expose bucket public. CloudFront optional (giai đoạn sau).

## Chứng chỉ

- Trigger: `Enrollment.progress_percent >= 100`
- Job queue: render PDF (DomPDF hoặc Browsershot), lưu `certificates.pdf_path`
- Mã tra cứu: `certificates.verification_code` (UUID rút gọn hoặc custom format)
- Route công khai: `GET /certificates/verify/{code}` — không cần auth

## Package bổ sung (cài theo phase)

| Phase | Composer / NPM |
|-------|----------------|
| 3 | `laravel/sanctum` (nếu chưa có) |
| 3 | SePay SDK hoặc HTTP client tự viết |
| 4 | `league/flysystem-aws-s3-v3` |
| 7 | `barryvdh/laravel-dompdf` hoặc `spatie/browsershot` |
| 6 | — (Artisan command + DB connection legacy read-only) |

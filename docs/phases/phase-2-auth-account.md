# Phase 2 — Auth & Account

**Mục tiêu:** Hoàn thiện luồng tài khoản học viên — đăng ký, đăng nhập, xác minh email, trang cá nhân & khóa đã mua.  
**Phụ thuộc:** Phase 0, 1  
**Ước lượng:** 2 ngày  
**Trạng thái:** ✅ Hoàn thành

## Hiện trạng

- Fortify: login, register, forgot/reset password, email verification, 2FA settings
- Layout: `AppLayout` cho `/account/*`, `SettingsLayout` cho `/settings/*`
- Schema: UUID PK (bảng nghiệp vụ), soft-delete + audit (`created_by`/`updated_by`)

## Checklist

### Tùy chỉnh Fortify

- [x] Register form: thêm `phone` (optional, validated)
- [x] Login redirect: student → `/account/courses`, admin → `/admin`
- [x] Email verification bật (`MustVerifyEmail`, route `/account/*` yêu cầu `verified`)
- [x] Ghi `last_login_at`, `last_login_ip` sau đăng nhập (`RecordUserLogin` listener)

### Trang cá nhân

- [x] `GET /account/courses` — danh sách enrollments (`MyCoursesController`)
  - Card: thumbnail, title, progress bar %, nút "Tiếp tục học" (disabled — chờ Phase 4)
  - Empty state: CTA xem khóa học
- [x] `PATCH /settings/profile` — update name, email, phone, avatar, gender, age, preference
- [x] Đổi mật khẩu — Fortify/settings hiện có

### Frontend

- [x] `pages/account/courses.tsx` — My Courses
- [x] `pages/settings/profile.tsx` — mở rộng avatar, phone, gender, age, preference (Việt hóa)
- [x] `pages/auth/verify-email.tsx`
- [x] Nav: sidebar/header link "Khóa học của tôi"

### Enrollment (read-only UI)

- [x] `EnrollmentService::listActiveForUser()` — enrollments `status=active` với `progress_percent`
- [x] Nút "Tiếp tục học" disabled (Phase 4: `/learn/{course_slug}`)
- [x] Seeder: 2 enrollments demo cho `student@example.com`

### Tests

- [x] Register tạo user role student, redirect verify email
- [x] Authenticated + verified user xem được `/account/courses`
- [x] Guest / unverified redirect
- [x] Login ghi `last_login_at`
- [x] Profile update gender/age/preference; soft-delete khi xóa tài khoản
- [x] Dashboard redirect → `/account/courses`

## Acceptance criteria

1. ✅ Học viên đăng ký → xác minh email → đăng nhập → thấy "Khóa học của tôi"
2. ✅ Sửa profile (kể cả avatar) thành công
3. ✅ Quên mật khẩu gửi email (mail driver cấu hình)

## Không làm trong phase này

- Mua khóa, enrollment tạo từ payment
- Social login
- Refactor auth pages sang Mantine (giữ starter shadcn)

## Tiếp theo

→ [phase-3-payment.md](./phase-3-payment.md)

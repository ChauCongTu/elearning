# Phase 2 — Auth & Account

**Mục tiêu:** Hoàn thiện luồng tài khoản học viên — đăng ký, đăng nhập, quên MK, trang cá nhân & khóa đã mua.  
**Phụ thuộc:** Phase 0, 1  
**Ước lượng:** 2 ngày

## Hiện trạng

Starter đã có Fortify: login, register, forgot/reset password, 2FA settings.

## Checklist

### Tùy chỉnh Fortify

- [ ] Register form: thêm `phone` (optional, validated)
- [ ] Login redirect: student → `/account/courses`, admin → `/admin`
- [ ] Email verification bật nếu khách yêu cầu (config `MustVerifyEmail`)

### Trang cá nhân

- [ ] `GET /account` — profile overview
- [ ] `GET /account/courses` — danh sách enrollments
  - Card: thumbnail, title, progress bar %, nút "Tiếp tục học"
  - Empty state: CTA xem khóa học
- [ ] `PATCH /account/profile` — update name, phone
- [ ] Đổi mật khẩu — dùng Fortify/settings hiện có hoặc Mantine form mới

### Frontend

- [ ] `pages/account/courses.tsx` — My Courses
- [ ] `pages/account/profile.tsx`
- [ ] Refactor auth pages sang Mantine (login, register, forgot) — đồng bộ brand Học Viện

### Enrollment (read-only UI)

- [ ] Hiển thị enrollments `status=active` với `progress_percent`
- [ ] Nút "Vào học" link `/learn/{course_slug}` (phase 4 — có thể disabled tạm)

### Tests

- [ ] Register tạo user role student
- [ ] Authenticated user xem được `/account/courses`
- [ ] Guest redirect login

## Acceptance criteria

1. Học viên đăng ký → đăng nhập → thấy trang "Khóa học của tôi" (trống hoặc có data seed)
2. Sửa profile thành công
3. Quên mật khẩu gửi email (mail driver cấu hình)

## Không làm trong phase này

- Mua khóa, enrollment tạo từ payment
- Social login

## Tiếp theo

→ [phase-3-payment.md](./phase-3-payment.md)

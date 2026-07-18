# Phase 3 — Admin Panel

**Mục tiêu:** Trang quản trị — user, danh mục, khóa/bài, video, đơn hàng, banner.  
**Phụ thuộc:** Phase 0, 1, 2  
**Ước lượng:** 4–5 ngày

## Checklist

### Access

- [x] Prefix route `/admin`, middleware `auth` + `admin`
- [x] `DashboardLayout` — sidebar + topbar thống nhất account/admin

### Modules

#### Dashboard

- [x] Tổng quan: đơn hôm nay, doanh thu tháng, học viên mới, khóa active
- [x] Biểu đồ doanh thu 6 tháng, phân bổ trạng thái đơn, đơn/ghi danh gần đây

#### Users

- [x] List/search users (name, email, phone)
- [x] Edit role (student/admin) — không tự hạ quyền super
- [x] Xem enrollments của user
- [x] Manual grant enrollment (support khách CK tay)

#### Categories

- [x] CRUD categories, sort_order, active toggle

#### Courses

- [x] CRUD courses (all fields [data-model.md](../data-model.md))
- [x] Rich text description (textarea)
- [x] Upload thumbnail → local `storage/app/public`
- [x] Publish/unpublish, featured toggle

#### Chapters & Lessons

- [x] Nested management UI per course
- [x] Reorder chapters/lessons (sort_order, nút lên/xuống)
- [x] Lesson: upload video, nhập duration, free preview flag

#### Orders

- [x] List orders: filter status, date range
- [x] Detail: user, course, amount, mã giao dịch, payment log
- [ ] Export CSV optional

#### Banners

- [x] CRUD banner tĩnh homepage
- [x] Upload image, link, schedule, active

#### Posts (Tin tức)

- [x] CRUD `post_categories` (slug, sort, active)
- [x] CRUD `posts` — title, slug, excerpt, content, featured image
- [x] Publish/unpublish, featured toggle, category assign
- [ ] (Optional) Import từ WordPress legacy

### Frontend pages

```
/admin/dashboard
/admin/users
/admin/categories
/admin/courses
/admin/courses/{id}/curriculum
/admin/orders
/admin/banners
/admin/posts
/admin/post-categories
```

Dùng Mantine Table + Modal forms + Pagination.

### Tests

- [x] Student cannot access `/admin`
- [x] Admin CRUD course
- [x] Admin manual enrollment creates record

## Acceptance criteria

1. Admin quản lý full vòng đời khóa học không cần DB trực tiếp
2. Upload video + publish → học viên xem được (Phase 4)
3. Đổi banner → homepage cập nhật

## Không làm trong phase này

- Phân quyền admin chi tiết (editor vs super)
- Analytics nâng cao

## Tiếp theo

→ [phase-4-learning.md](./phase-4-learning.md)

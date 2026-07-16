# Phase 5 — Admin Panel

**Mục tiêu:** Trang quản trị — user, danh mục, khóa/bài, video, đơn hàng, banner.  
**Phụ thuộc:** Phase 0–4  
**Ước lượng:** 4–5 ngày

## Checklist

### Access

- [ ] Prefix route `/admin`, middleware `auth` + `admin`
- [ ] `AdminLayout` — Mantine AppShell + nav

### Modules

#### Dashboard

- [ ] Tổng quan: đơn hôm nay, doanh thu tháng, học viên mới, khóa active

#### Users

- [ ] List/search users (name, email, phone)
- [ ] Edit role (student/admin) — không tự hạ quyền super
- [ ] Xem enrollments của user
- [ ] Manual grant enrollment (support khách CK tay)

#### Categories

- [ ] CRUD categories, sort_order, active toggle

#### Courses

- [ ] CRUD courses (all fields [data-model.md](../data-model.md))
- [ ] Rich text description (Mantine RichTextEditor hoặc textarea markdown)
- [ ] Upload thumbnail → S3 hoặc local `storage/app/public`
- [ ] Publish/unpublish, featured toggle

#### Chapters & Lessons

- [ ] Nested management UI per course
- [ ] Drag reorder chapters/lessons (sort_order)
- [ ] Lesson: upload video (presigned), nhập duration, free preview flag

#### Orders

- [ ] List orders: filter status, date range
- [ ] Detail: user, course, amount, SePay transaction, payment log
- [ ] Export CSV optional

#### Banners

- [ ] CRUD banner tĩnh homepage
- [ ] Upload image, link, schedule, active

#### Posts (Tin tức)

- [ ] CRUD `post_categories` (slug, sort, active)
- [ ] CRUD `posts` — title, slug, excerpt, rich content, featured image
- [ ] Publish/unpublish, featured toggle, category assign
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

Dùng Mantine `DataTable` hoặc Table + Pagination + Modal forms.

### Tests

- [ ] Student cannot access `/admin`
- [ ] Admin CRUD course
- [ ] Admin manual enrollment creates record

## Acceptance criteria

1. Admin quản lý full vòng đời khóa học không cần DB trực tiếp
2. Upload video + publish → học viên xem được (phase 4)
3. Đổi banner → homepage cập nhật

## Không làm trong phase này

- Phân quyền admin chi tiết (editor vs super)
- Analytics nâng cao

## Tiếp theo

→ [phase-6-migration.md](./phase-6-migration.md)

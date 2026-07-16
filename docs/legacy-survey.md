# Khảo sát Legacy System

**URL:** https://hocvienbongnhaitrang.com/  
**Ngày khảo sát:** 15/07/2026  
**Nền tảng xác định:** WordPress + WooCommerce

## Bằng chứng kỹ thuật

| Dấu hiệu | Chi tiết |
|----------|----------|
| `robots.txt` | Disallow `/wp-admin/`, WooCommerce upload paths (`wc-logs`, `woocommerce_uploads`) |
| URL pattern | `/khoa-hoc-*`, `/category/tin-tuc/*` — cấu trúc WordPress |
| Đăng nhập | Form WP: username/email + password, "Quên mật khẩu" |
| Sitemap | `sitemap_index.xml` (lỗi 500 khi fetch — cần truy cập admin để export) |

## Cấu trúc nội dung công khai

### Trang chủ

- Banner / hero giới thiệu Học Viện
- Khối "Khóa Học Đang Tuyển Sinh" — card khóa học (badge HOT, PHỔ BIẾN, RA NGHỀ NHANH)
- Mỗi card: tên khóa, mô tả ngắn, thời lượng (25–40 buổi, 2–3 tháng, 25 bài), giảng viên
- CTA: "Nhận tư vấn", "Xem Chi tiết"
- Dịch vụ thẩm mỹ nổi bật (landing marketing — **không** trong gói e-learning)
- Tin tức / Hướng nghiệp / Kiến thức (blog WP — **ngoài gói** giai đoạn này)
- Form đặt lịch tư vấn + hotline 0918.068.063
- Modal đăng nhập (overlay)

### Trang khóa học (landing)

Ví dụ: `/khoa-hoc/` → redirect/nội dung "Chăm Sóc Da Cơ Bản"

| Thành phần | Dữ liệu cần migrate/map |
|------------|-------------------------|
| Tiêu đề & mô tả | `courses.title`, `courses.description`, `courses.slug` |
| Giá | Giá sale + giá gốc (VD: 6.000.000 / 10.000.000 VNĐ) → `courses.price`, `courses.compare_price` |
| Thời lượng | Bảng thông tin: 1 tháng, T2–T6, 5–10 HV/lớp → `courses.meta` JSON |
| Đề cương | Danh sách bullet chi tiết → `chapters` + `lessons` |
| Lợi ích / FAQ | `courses.benefits`, `courses.faq` (JSON hoặc bảng riêng) |
| Giảng viên | Tên, chức danh → `instructors` hoặc field trên course |
| CTA | Form tư vấn (giữ marketing form đơn giản hoặc link Zalo) |

### Các khóa học đã xác định (URL)

- `/khoa-hoc-phun-xam-tham-my-co-ban/`
- `/khoa-hoc-cham-soc-da-co-ban/` (và nâng cao)
- `/khoa-hoc-goi-dau-duong-sinh/`
- Các biến thể phun xăm nâng cao, toàn diện (trang chủ liệt kê nhiều card trùng tên — cần admin làm sạch khi migrate)

## Luồng nghiệp vụ cần tái hiện (hệ thống mới)

```
Khách xem khóa → Đăng ký/Đăng nhập → Mua khóa (VietQR SePay)
    → Webhook xác nhận → Enrollment active → Vào học video theo chương
    → Lưu tiến độ → 100% → Cấp chứng chỉ PDF + mã tra cứu
```

Legacy hiện **ưu tiên tư vấn offline** (form, hotline). Phần **mua online + học video** là trọng tâm build mới theo báo giá.

## Dữ liệu cần truy xuất từ WordPress (cho migration)

> Cần quyền admin DB hoặc phpMyAdmin từ khách hàng.

### Bảng WordPress core

| Bảng WP | Mục đích |
|---------|----------|
| `wp_users` | Học viên, admin |
| `wp_usermeta` | Phone, billing info |
| `wp_posts` | Products (course), pages, attachments |
| `wp_postmeta` | Giá, ảnh, custom fields khóa học |
| `wp_terms` / `wp_term_taxonomy` | Danh mục khóa |
| `wp_term_relationships` | Course ↔ category |

### WooCommerce

| Bảng / post type | Mục đích |
|------------------|----------|
| `shop_order` | Đơn hàng đã thanh toán |
| Order items | Khóa đã mua |
| Product meta `_price`, `_regular_price` | Giá |

### LMS plugin (cần xác nhận)

Kiểm tra `wp_plugins` active — thường gặp: LearnDash, Tutor LMS, LifterLMS, Sensei.

```sql
SELECT option_value FROM wp_options WHERE option_name = 'active_plugins';
```

Nếu có LMS:

- Map `course progress`, `lesson completion`, `quiz` (nếu có) sang `lesson_progress`, `enrollments`
- Map video URL (có thể embed YouTube/Vimeo hoặc self-hosted) → upload/migrate lên S3

### Media

- `wp_posts` type `attachment` — ảnh khóa học, banner
- Video có thể nằm ngoài WP (YouTube, Google Drive) — thu thập URL từ postmeta

## Mapping đề xuất → schema mới

Chi tiết bảng: [data-model.md](./data-model.md)

| Legacy | Mới |
|--------|-----|
| `wp_users.ID` | `users.legacy_wp_id` |
| WC product ID | `courses.legacy_product_id` |
| Order ID | `orders.legacy_order_id` |
| Post slug | `courses.slug` (giữ SEO nếu có thể) |

## Rủi ro migration

1. **Plugin LMS chưa rõ** — khảo sát DB trước khi chốt script
2. **Dữ liệu trùng / demo** — nhiều card khóa học giống nhau trên homepage
3. **Giá & khuyến mãi** — legacy dùng giá landing, có thể khác WC product
4. **Mật khẩu** — WP hash (`$P$` / bcrypt) → không reverse; buộc reset password hoặc migrate hash nếu Fortify hỗ trợ
5. **Video** — cần re-upload S3, không symlink từ WP uploads

## Việc cần khách hàng cung cấp

- [ ] Dump MySQL WordPress hoặc quyền phpMyAdmin
- [ ] Danh sách plugin đang active
- [ ] Tài khoản AWS S3 (bucket, IAM)
- [ ] Tài khoản SePay + tài khoản ngân hàng nhận tiền
- [ ] Domain mới hoặc subdomain cho hệ thống mới
- [ ] File thiết kế chứng chỉ (logo, chữ ký) nếu có

# Phase 7 — Legacy Data Migration

**Mục tiêu:** Script chuyển users, khóa học, đơn hàng, tiến độ từ WordPress/WooCommerce sang hệ thống mới.  
**Phụ thuộc:** Phase 0, 3 (admin verify), 6 (certificates)  
**Ước lượng:** 3–4 ngày

> Migration là bước **cuối cùng trước go-live** — chạy sau khi chứng chỉ và các tính năng khác đã sẵn sàng.

## Tiền đề

- [ ] Dump DB legacy từ khách ([legacy-survey.md](../legacy-survey.md))
- [ ] Xác định LMS plugin: `SELECT option_value FROM wp_options WHERE option_name='active_plugins'`
- [ ] Dry-run trên staging

## Checklist

### Connection

- [ ] `.env` thêm `LEGACY_DB_*` (read-only user)
- [ ] `config/database.php` connection `legacy`

### Artisan command

```bash
php artisan migrate:legacy {--dry-run} {--only=users,courses,orders,progress}
```

- [ ] `MigrateLegacyCommand` orchestrator
- [ ] Idempotent: skip nếu `legacy_*_id` đã tồn tại
- [ ] Log file `storage/logs/migrate-legacy-{date}.log`

### Importers

#### Users (`MigrateLegacyUsers`)

- [ ] Map `wp_users` → `users`
- [ ] Lưu `legacy_wp_id`
- [ ] Password: import `user_pass` nếu dùng custom hasher WP, hoặc flag `must_reset_password`
- [ ] Map `wp_usermeta` phone nếu có

#### Categories & Courses (`MigrateLegacyCourses`)

- [ ] WC `product` type course → `courses`
- [ ] Map categories `wp_terms`
- [ ] Giá: `_price`, `_regular_price`
- [ ] Slug: `post_name`
- [ ] Thumbnail: attachment URL → download → S3/local
- [ ] Description: `post_content`

#### Curriculum (`MigrateLegacyCurriculum`)

- [ ] Nếu LMS plugin: map sections/lessons
- [ ] Fallback: tách `post_content` headings hoặc manual CSV từ khách
- [ ] Video URLs: queue job `MigrateVideoToS3` (async)

#### Orders & Enrollments (`MigrateLegacyOrders`)

- [ ] WC orders `completed` → `orders` paid + `enrollments`
- [ ] Map order items → courses qua `legacy_product_id`

#### Progress (`MigrateLegacyProgress`)

- [ ] LMS progress tables → `lesson_progress`
- [ ] Recalculate `enrollment.progress_percent`

### Validation report

- [ ] Command in ra summary:

```
Users:     120 imported, 3 skipped
Courses:   8 imported
Orders:    450 imported
Progress:  3200 lesson rows
Errors:    [list]
```

### Rollback plan

- [ ] `php artisan migrate:legacy:rollback` — xóa records có `source=migration` (optional)

### Tests

- [ ] Dry-run không ghi DB
- [ ] Import user không duplicate email
- [ ] Order paid tạo enrollment

## Mapping reference

| Legacy | New |
|--------|-----|
| `wp_users.ID` | `users.legacy_wp_id` |
| WC product ID | `courses.legacy_product_id` |
| shop_order ID | `orders.legacy_order_id` |

## Acceptance criteria

1. Dry-run báo cáo đầy đủ không exception
2. Production run: học viên cũ login (hoặc reset pass) thấy khóa đã mua
3. Tiến độ học giữ nguyên ±1 bài (document exceptions)

## Rủi ro & xử lý

| Rủi ro | Xử lý |
|--------|-------|
| Không có LMS | Admin nhập curriculum thủ công + import enrollment only |
| Video hosted YouTube | Lưu embed tạm hoặc download tool riêng |
| Dữ liệu demo trùng | Filter `post_status=publish` + dedupe slug |

## Tiếp theo

→ [phase-8-deploy-go-live.md](./phase-8-deploy-go-live.md)

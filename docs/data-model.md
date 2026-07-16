# Data Model

> **Trạng thái:** Đã triển khai migration `2026_07_15_142501_create_elearning_tables.php`  
> Chạy: `php artisan migrate:fresh --seed`

## ERD (tóm tắt)

```
users ─────┬──── enrollments ──── courses ──── chapters ──── lessons
           │                         │
           │                         └── categories (M:N course_category)
           │
           └── orders ──── order_items ──── courses
                    │
                    └── payments (SePay log)

enrollments ──── lesson_progress ──── lessons
enrollments ──── certificates

banners (standalone)
```

## Bảng chi tiết

### `users`

| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| name | string | |
| email | string unique | |
| phone | string nullable | |
| password | string | |
| role | enum: student, admin | default student |
| legacy_wp_id | bigint nullable unique | migration |
| email_verified_at | timestamp nullable | |
| timestamps | | |

### `categories`

| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| name | string | VD: Phun xăm, Chăm sóc da |
| slug | string unique | |
| parent_id | bigint nullable | nested optional |
| sort_order | int | default 0 |
| is_active | boolean | default true |

### `courses`

| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| category_id | FK nullable | primary category |
| title | string | |
| slug | string unique | giữ slug WP nếu có |
| excerpt | text nullable | card listing |
| description | longtext | landing detail |
| price | decimal(12,0) | VNĐ |
| compare_price | decimal(12,0) nullable | giá gốc gạch ngang |
| thumbnail_path | string nullable | |
| instructor_name | string nullable | |
| instructor_title | string nullable | |
| duration_label | string nullable | "2-3 tháng" |
| lesson_count_label | string nullable | "25 bài" |
| benefits | json nullable | array string |
| faq | json nullable | [{q,a}] |
| is_featured | boolean | banner homepage |
| is_published | boolean | |
| legacy_product_id | bigint nullable unique | |
| meta | json nullable | thời gian học, sĩ số lớp |
| published_at | timestamp nullable | |
| timestamps | | |

### `chapters`

| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| course_id | FK | |
| title | string | |
| sort_order | int | |
| is_published | boolean | |

### `lessons`

| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| chapter_id | FK | |
| title | string | |
| sort_order | int | |
| video_s3_key | string nullable | |
| duration_seconds | int default 0 | |
| is_free_preview | boolean | optional preview |
| is_published | boolean | |

### `enrollments`

| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| user_id | FK | |
| course_id | FK | unique(user_id, course_id) |
| status | enum: active, revoked | |
| progress_percent | decimal(5,2) | 0–100, cached |
| enrolled_at | timestamp | |
| completed_at | timestamp nullable | |
| source | enum: purchase, migration, manual | |

### `lesson_progress`

| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| enrollment_id | FK | |
| lesson_id | FK | unique pair |
| watched_seconds | int | |
| completed | boolean | >= 90% duration |
| last_watched_at | timestamp | |

### `orders`

| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| user_id | FK | |
| code | string unique | mã CK SePay, VD: ELN20260715001 |
| status | enum: pending, paid, expired, cancelled | |
| amount | decimal(12,0) | |
| paid_at | timestamp nullable | |
| sepay_transaction_id | string nullable unique | |
| legacy_order_id | bigint nullable unique | migration |
| expires_at | timestamp | QR hết hạn |
| timestamps | | |

### `order_items`

| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| order_id | FK | |
| course_id | FK | |
| price | decimal(12,0) | snapshot giá lúc mua |

### `payments` (audit log)

| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| order_id | FK | |
| gateway | string | sepay |
| payload | json | raw webhook |
| amount | decimal(12,0) | |
| received_at | timestamp | |

### `certificates`

| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| enrollment_id | FK unique | |
| verification_code | string unique | tra cứu công khai |
| student_name | string | snapshot |
| course_title | string | snapshot |
| issued_at | timestamp | |
| pdf_path | string | storage path |

### `banners`

| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| title | string nullable | |
| image_path | string | |
| link_url | string nullable | |
| sort_order | int | |
| is_active | boolean | |
| starts_at / ends_at | timestamp nullable | optional schedule |

### `course_category` (pivot, nếu M:N)

| course_id | category_id |

## Indexes quan trọng

- `courses(slug)`, `courses(is_published, is_featured)`
- `orders(code)`, `orders(status)`
- `enrollments(user_id, status)`
- `certificates(verification_code)`

## Tính progress

```php
// Pseudo: progress_percent = completed_lessons / total_published_lessons * 100
// lesson completed khi watched_seconds >= duration_seconds * 0.9
```

Chạy recalculate sau mỗi heartbeat hoặc qua queued job debounce 30s.

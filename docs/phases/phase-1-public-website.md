# Phase 1 — Public Website

**Mục tiêu:** Trang công khai đầy đủ theo báo giá + legacy.  
**Trạng thái:** ✅ Hoàn thành (homepage v2 + landing pages + service layer)

## Backend refactor (Phase 1)

- [x] `Controller → Interface → Service → Model`
- [x] Contracts: Catalog, Content, Consultation, Admin
- [x] Bindings trong `AppServiceProvider`
- [x] Model scopes: `Category::active()`, `Course::featured()`

## Tin tức (Phase 1)

- [x] Public UI: `/tin-tuc`, danh mục, chi tiết bài
- [x] Homepage teasers từ DB
- [x] Seeder mẫu (`PostSeeder`)
- [ ] **CRUD admin** → chuyển sang [phase-3-admin.md](./phase-3-admin.md)

## Backend refactor (Phase 1)

- [x] `/bang-gia` — Bảng giá dịch vụ spa + giá khóa học online
- [x] `/ve-chung-toi` — Giới thiệu, thống kê, founder, video
- [x] `/lien-he` — Hotline, Zalo, Facebook, cơ sở + form tư vấn
- [x] `/thong-tin` — Chính sách & thông tin học viện
- [x] Navigation header/footer từ `config/site.json`
- [x] Thông tin cố định (logo, hotline, Zalo, stats…) — single source `config/site.json`
- [x] Chế độ bảo trì `maintenance.enabled` — chặn trang public

## Homepage sections (đối chiếu legacy)

- [x] Hero carousel + CTA
- [x] Tìm kiếm nhanh khóa học
- [x] Thống kê (25+ năm, 3000+ HV...)
- [x] Giới thiệu học viện
- [x] Khóa học đang tuyển sinh (badge HOT/PHỔ BIẾN...)
- [x] Vì sao chọn (4 mục)
- [x] Dịch vụ nổi bật
- [x] Lĩnh vực đào tạo
- [x] Founder spotlight
- [x] Video nổi bật
- [x] Khóa nổi bật + khóa mới
- [x] Tin tức / hướng nghiệp / kiến thức (teaser + link)
- [x] Form đặt lịch tư vấn → `consultation_requests`
- [x] Hotline band

## Kiến trúc tái sử dụng

Xem [ui-system.md](../ui-system.md) — `config/site.json` + `sections/*`

## Routes

```
GET  /              → home
GET  /courses       → index (search, filter, sort)
GET  /courses/{slug}→ show
GET  /tin-tuc              → danh sách tin tức
GET  /tin-tuc/danh-muc/{category} → tin theo danh mục
GET  /tin-tuc/{slug}       → chi tiết bài viết
GET  /bang-gia      → bảng giá dịch vụ + khóa học
GET  /ve-chung-toi  → giới thiệu học viện
GET  /lien-he       → liên hệ + form tư vấn
GET  /thong-tin     → thông tin & chính sách
POST /consultation  → lưu yêu cầu tư vấn
```

## Tiếp theo

→ [phase-2-auth-account.md](./phase-2-auth-account.md)

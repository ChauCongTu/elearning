# UI System — Tái sử dụng cho dự án E-Learning tương tự

Thiết kế tách **nội dung** (config) khỏi **presentation** (React sections) để clone sang academy/spa khác chỉ bằng cách đổi `config/site.json` + `theme/brand.ts`.

## Kiến trúc 3 tầng

```
config/site.json            ← Nội dung marketing + thông tin cố định (JSON, server-side)
                              ← theme.primary, gradient_* — màu chủ đạo (→ siteSettings.theme)
resources/js/theme/brand.ts ← Mantine theme + CSS variable helpers
BrandProviders              ← Inject --brand-* từ siteSettings.theme
hooks/use-site-config.ts    ← Logo, hotline, nav từ Inertia `siteSettings`
components/public/sections/ ← Section UI tái sử dụng
pages/public/home.tsx       ← Compose sections (registry)
```

## Homepage section map

| Section component | Legacy tương ứng | Nguồn dữ liệu |
|-------------------|------------------|---------------|
| `HeroBanner` | Banner carousel | `banners` DB + `hero_slides` + `hero_trust_stats` config |
| `QuickSearchBar` | — | Redirect `/courses?q=` (báo giá: tìm kiếm) |
| `StatsStrip` | Số liệu nghệ nhân | `config stats` |
| `AboutAcademy` | Về học viện | `config about` |
| `CourseShowcase` | Khóa tuyển sinh | `courses` DB |
| `WhyChooseUs` | 4 lý do chọn | `config why_choose_us` |
| `ServiceHighlights` | Dịch vụ nổi bật | `config services` |
| `CategoryShowcase` | Khóa học / dịch vụ hot | `config category_showcase` |
| `FounderSpotlight` | Người sáng lập | `config founder` |
| `VideoGallery` | Video nổi bật | `config videos` |
| `ArticleTeasers` | Tin tức / hướng nghiệp / kiến thức | `PostService::listHomeSections()` + `config article_sections` |
| `ConsultationSection` | Form đặt lịch tư vấn | `config consultation` + POST `/consultation` |
| `HotlineCta` | Hotline band | Inertia `siteSettings` |

## Landing pages (Phase 1)

| Route | Page | Components / config |
|-------|------|---------------------|
| `/bang-gia` | `pages/pricing` | `PricingTables` + bảng khóa học DB + `config pricing` |
| `/ve-chung-toi` | `pages/about` | `AboutAcademy`, `StatsStrip`, `WhyChooseUs`, `FounderSpotlight`, `VideoGallery` |
| `/lien-he` | `pages/contact` | `ContactChannels` + `ConsultationSection` + `config contact` |
| `/thong-tin` | `pages/info` | `config info.sections` |

Navigation: `config/site.json` → `navigation` → shared Inertia prop `navigation`.

Thông tin cố định (tên web, logo, hotline, Zalo, Facebook…): `config/site.json` → `SiteSettingsService::forFrontend()` → shared Inertia prop `siteSettings` → `useSiteConfig()`.

## Bảo trì (maintenance)

Trong `config/site.json`:

```json
"maintenance": {
  "enabled": true,
  "title": "...",
  "message": "..."
}
```

Khi `enabled: true`, middleware `site.online` chặn mọi route public (503 + trang `public/maintenance`). Vẫn truy cập được: `/login`, `/register`, `/dashboard`, `/settings`, `/admin` (admin user bypass mọi trang).

## Clone sang dự án mới

1. Copy `config/site.json` → sửa copy, founder, stats, contact, navigation
2. Copy `resources/js/theme/brand.ts` → đổi màu primary
3. Giữ nguyên `sections/*` — không sửa nếu layout giống
4. `home.tsx` — thêm/bớt section bằng cách compose (không nhét logic vào 1 file)

## Quy ước component

- Mỗi section nhận props typed, **không** fetch API riêng
- Text marketing → `config/site.json`, không hardcode trong TS
- Logo / hotline / social → `useSiteConfig()` từ shared props
- Khóa học / banner → luôn từ DB
- Form tư vấn → `consultation_requests` table

## Báo giá vs Legacy

| Yêu cầu báo giá | Đã có |
|-----------------|-------|
| Banner trang chủ | ✅ HeroBanner + banners DB |
| Khóa mới/nổi bật | ✅ enrollment + featured + latest |
| Tìm kiếm/lọc | ✅ QuickSearchBar + `/courses` |
| Chi tiết khóa | ✅ `/courses/{slug}` |
| Đăng ký/đăng nhập | ✅ PublicLayout auth |
| Tin tức full CMS | ✅ Public read + seeder (admin CRUD → phase sau) |

## File tham chiếu

- [legacy-survey.md](./legacy-survey.md)
- [phases/phase-1-public-website.md](./phases/phase-1-public-website.md)

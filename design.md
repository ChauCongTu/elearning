# Design System — Học Viện Bông Nhài Trắng

Soft modern UI — màu chủ đạo lấy từ `config/site.json` → `theme`.

## Màu sắc (config/site.json)

```json
"theme": {
  "primary": "#e64980",
  "primary_dark": "#c2255c",
  "primary_light": "#fff0f6",
  "secondary": "#be4bdb",
  "surface": "#fff5f8",
  "gradient_from": "#e64980",
  "gradient_via": "#be4bdb",
  "gradient_to": "#7950f2"
}
```

Clone sang academy khác: chỉ sửa block `theme` — CSS variables và Mantine tự cập nhật qua `siteSettings.theme`.

## Typography

**Be Vietnam Pro** — hỗ trợ tiếng Việt đầy đủ (subset `vietnamese`).

## Layouts

| Layout | File | CSS | Dùng cho |
|--------|------|-----|----------|
| Public | `layouts/public-layout.tsx` | `public-ui.css` | Trang marketing, auth |
| App shell | `layouts/account/layout.tsx`, `layouts/admin-layout.tsx`, `app-content.tsx` | `app-shell-ui.css` | Account, admin, settings |

## Token flow

```
config/site.json (theme)
  → SiteSettingsService::forFrontend()
  → Inertia siteSettings.theme
  → BrandProviders (CSS variables + Mantine theme)
  → public-ui.css / app-shell-ui.css (var(--brand-*))
```

# Học Viện Bông Nhài Trắng — E-Learning Platform

Website bán khóa học online trên Laravel 13 + Inertia React, thay thế hệ thống legacy [hocvienbongnhaitrang.com](https://hocvienbongnhaitrang.com/).

**Báo giá:** `Bao_Gia_Website_Khoa_Hoc_Tinh_Gon.pdf` (07/07/2026)  
**Thời gian:** 20–30 ngày làm việc  
**Tổng phí dev:** 6.500.000 VNĐ (trọn gói)

## Mục tiêu giai đoạn hiện tại (trong gói)

| Phân hệ | Mô tả ngắn |
|---------|------------|
| Website công cộng | Trang chủ, tìm kiếm/lọc khóa học, chi tiết khóa, tài khoản |
| Thanh toán | Mua từng khóa, VietQR SePay, tự động mở khóa |
| Học online | Chương/bài, video S3, lưu tiến độ |
| Admin | User, danh mục, bài học, video, đơn hàng, banner |
| Hạ tầng | Hostinger, domain, webhook SePay, AWS S3 |
| Migrate data | WordPress/WooCommerce → DB mới |
| Chứng chỉ | PDF tự động khi hoàn thành 100%, tra cứu online |

## Giai đoạn sau (ngoài gói)

Xem [out-of-scope.md](./out-of-scope.md): MXH login, coupon, membership, affiliate, blog, đánh giá, livestream, UI/UX custom.

## Tài liệu

| File | Nội dung |
|------|----------|
| [legacy-survey.md](./legacy-survey.md) | Khảo sát hệ thống cũ |
| [architecture.md](./architecture.md) | Tech stack, kiến trúc, cấu trúc code |
| [data-model.md](./data-model.md) | Schema database |
| [deployment.md](./deployment.md) | Deploy Hostinger (không Node server) |
| [out-of-scope.md](./out-of-scope.md) | Backlog giai đoạn sau |
| [phases/README.md](./phases/README.md) | **Lộ trình triển khai từng bước** |
| [tong-ket-phase-0-1.md](./tong-ket-phase-0-1.md) | **Tổng kết Giai đoạn 0 & 1** (gửi khách) |
| [ke-hoach-trien-khai-20-ngay.md](./ke-hoach-trien-khai-20-ngay.md) | **Kế hoạch 20 ngày** 20/07 → 08/08 (gửi khách) |
| [ui-system.md](./ui-system.md) | Section architecture tái sử dụng |

## Skill cho Agent

Khi triển khai trong Cursor, attach skill: `.cursor/skills/elearning-platform/SKILL.md`

## Trạng thái codebase

Dự án khởi tạo từ Laravel React Starter Kit:

- ✅ Laravel 13, Fortify (auth), Inertia 3, Vite, Tailwind 4, TypeScript
- ✅ Phase 0: DB schema, models, Mantine, admin middleware, demo routes
- ✅ Phase 1: Homepage, landing pages, tin tức, `config/site.json`, maintenance mode
- ⬜ Phase 2+: SePay, S3, migration legacy, chứng chỉ

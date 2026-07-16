# Ngoài phạm vi giai đoạn hiện tại

Theo báo giá `Bao_Gia_Website_Khoa_Hoc_Tinh_Gon.pdf` — các hạng mục sau **chưa** nằm trong gói 6.500.000 VNĐ. Ghi nhận là backlog giai đoạn sau.

| # | Tính năng | Ghi chú khi triển khai sau |
|---|-----------|----------------------------|
| 1 | Thiết kế UI/UX custom | Hiện dùng Mantine + layout chuẩn, không design riêng |
| 2 | Đăng nhập MXH (Google/Facebook) | Laravel Socialite |
| 3 | Mã giảm giá (Coupon) | Bảng `coupons`, `coupon_redemptions`, hook vào checkout |
| 4 | Gói hội viên tháng/năm | `subscriptions`, recurring billing (chưa có trong SePay gói hiện tại) |
| 5 | Tiếp thị liên kết (Affiliate) | Mã ref, commission, payout |
| 6 | Tin tức / Blog — **admin CRUD** | Phase 1: public read + seeder ✅ — CRUD → Phase 5 |
| 7 | Bình luận & đánh giá khóa học | `reviews` polymorphic |
| 8 | Livestream | RTMP/HLS, scheduling — hạ tầng riêng |

## Legacy có nhưng không build ở giai đoạn này

- Landing dịch vụ thẩm mỹ (phun mày, chăm sóc da tại spa)
- Form đặt lịch tư vấn offline đa chi nhánh
- Blog tin tức / SEO content

Có thể giữ link sang site cũ hoặc trang tĩnh đơn giản.

## Ưu tiên đề xuất giai đoạn 2 (tham khảo)

1. Blog/Tin tức (SEO, giữ traffic legacy)
2. Coupon (chiến dịch marketing)
3. Đánh giá khóa học (social proof)
4. Đăng nhập Google (giảm friction đăng ký)

Không implement các mục này trừ khi có báo giá / yêu cầu mới từ khách hàng.

# Phase 3 — Payment (SePay VietQR)

**Mục tiêu:** Mua từng khóa học qua VietQR, webhook tự động mở khóa.  
**Phụ thuộc:** Phase 0, 1, 2  
**Ước lượng:** 3–4 ngày

## Checklist

### Config

- [ ] `.env`: `SEPAY_*` keys (API, webhook secret, bank account)
- [ ] `config/sepay.php` — bank, account name, template nội dung CK

### Backend

- [ ] `OrderService::createForCourse(User, Course)` — tạo order pending + unique `code`
- [ ] `SePayService::generateQr(Order)` — gọi API SePay lấy QR image / payload
- [ ] `POST /courses/{slug}/checkout` — auth required, 1 course per order (gói hiện tại)
- [ ] `GET /orders/{code}/payment` — trang chờ thanh toán + QR + countdown expires
- [ ] `POST /webhooks/sepay` — `SePayWebhookController`
  - Verify signature/HMAC
  - Parse mã đơn từ nội dung CK
  - Khớp `amount` (cho phép tolerance 0 VNĐ)
  - Idempotent: skip nếu `sepay_transaction_id` đã xử lý
  - Update order → paid, tạo `Enrollment`, log `payments`
- [ ] Order expiry job: cancel pending sau 24h (scheduled)

### Frontend

- [ ] Nút "Mua khóa" trên course detail → checkout flow
- [ ] `pages/checkout/payment.tsx`
  - Hiển thị QR (Mantine Image)
  - Số tiền, mã đơn, hướng dẫn CK
  - Polling hoặc Inertia reload: check order status mỗi 5s
  - Success → redirect `/account/courses` + notification

### Admin visibility (tối thiểu)

- [ ] Route admin list orders (có thể placeholder đến phase 5)

### Tests

- [ ] Tạo order pending với code unique
- [ ] Webhook hợp lệ → enrollment created
- [ ] Webhook trùng transaction → không duplicate enrollment
- [ ] Webhook sai amount → reject
- [ ] Guest không checkout được

## Mã đơn hàng (gợi ý format)

```
ELN + YYYYMMDD + 4-digit sequence
VD: ELN202607150001
```

Nội dung chuyển khoản SePay: chỉ chứa `code` để parser đơn giản.

## Acceptance criteria

1. Học viên tạo đơn → thấy QR VietQR
2. Webhook test (SePay sandbox hoặc manual POST) → khóa mở trong "Khóa học của tôi"
3. Không mở khóa khi chưa thanh toán

## Tài liệu SePay

- Đăng ký webhook URL production khi deploy ([deployment.md](../deployment.md))
- Lưu raw payload vào `payments.payload` để đối soát

## Không làm trong phase này

- Coupon, giảm giá
- Giỏ hàng nhiều khóa (có thể mở rộng sau)
- Hoàn tiền tự động

## Tiếp theo

→ [phase-4-learning.md](./phase-4-learning.md)

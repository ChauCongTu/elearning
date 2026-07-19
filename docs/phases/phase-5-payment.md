# Phase 5 — Payment

**Mục tiêu:** Mua từng khóa học, thanh toán tự động kích hoạt khóa 24/7.  
**Phụ thuộc:** Phase 0, 1, 2, 3, 4 (player học đã sẵn sàng)  
**Ước lượng:** 3–4 ngày

## Checklist

### Config

- [x] `.env`: `SEPAY_*` keys (bank account, webhook API key)
- [x] `config/sepay.php` — bank, account name, thời hạn thanh toán 15 phút

### Backend

- [x] `OrderService::createForCourse(User, Course)` — tạo order pending + unique `code`
- [x] `SePayService::generateQr(Order)` — VietQR URL qua `vietqr.app/img`
- [x] `POST /courses/{slug}/checkout` — auth required, 1 course per order (gói hiện tại)
- [x] `GET /orders/{code}/payment` — trang chờ thanh toán + QR + countdown expires
- [x] `GET /orders/{code}/status` — polling trạng thái đơn
- [x] `POST /webhooks/sepay` — `SePayWebhookController`
  - Verify `Authorization: Apikey {key}` — key giải mã runtime từ `.env` (dạng `enc:...`)
  - Parse mã đơn từ `code` hoặc nội dung CK
  - Khớp `amount` (tolerance 0 VNĐ)
  - Idempotent: skip nếu `sepay_transaction_id` đã xử lý
  - Update order → paid, tạo `Enrollment`, log `payments`
- [x] `php artisan sepay:rotate-webhook-key` — sinh key mới + cập nhật `.env`
- [x] `php artisan orders:expire-pending` — scheduled mỗi phút

### Frontend

- [x] Nút "Mua khóa" trên course detail → checkout flow
- [x] `pages/public/checkout/payment.tsx`
  - Hiển thị QR (Mantine Image)
  - Số tiền, mã đơn, hướng dẫn CK
  - Polling: check order status mỗi 5s
  - Success → redirect `/account/courses` + notification

### Admin visibility (tối thiểu)

- [x] Route admin list orders (Phase 3)

### Tests

- [x] Tạo order pending với code unique
- [x] Webhook hợp lệ → enrollment created
- [x] Webhook trùng transaction → không duplicate enrollment
- [x] Webhook sai amount → reject
- [x] Guest không checkout được

## Mã đơn hàng (gợi ý format)

```
ELN + YYYYMMDD + 4-digit sequence
VD: ELN202607150001
```

Nội dung chuyển khoản SePay: chỉ chứa `code` để parser đơn giản.

## Thời hạn thanh toán

**15 phút / đơn** (`SEPAY_PAYMENT_EXPIRY_MINUTES=15`). Hết hạn → status `expired`, học viên tạo đơn mới.

## Webhook auth (API Key)

SePay gửi header:

```
Authorization: Apikey YOUR_API_KEY
```

**Lưu trữ:** `.env` chỉ chứa bản **mã hóa** (`enc:...`, khóa `APP_KEY`). Plaintext **chỉ hiện một lần** khi chạy rotate.

```bash
php artisan sepay:rotate-webhook-key          # sinh + mã hóa + ghi .env, in key một lần
php artisan sepay:rotate-webhook-key --show   # chỉ xem ****xxxx (4 ký tự cuối)
php artisan sepay:rotate-webhook-key --dry-run # xem key thử, chưa ghi .env
```

Quên/mất full key → **bắt buộc rotate** (không khôi phục từ `.env`). Sau rotate: cập nhật cùng key trên SePay Dashboard.

## Acceptance criteria

1. Học viên tạo đơn → thấy QR VietQR
2. Webhook test (SePay sandbox hoặc manual POST) → khóa mở trong "Khóa học của tôi" và học được ngay (Phase 4)
3. Không mở khóa khi chưa thanh toán

## Tài liệu SePay

- Đăng ký webhook URL production khi deploy ([deployment.md](../deployment.md))
- Lưu raw payload vào `payments.payload` để đối soát
- Cấu hình cấu trúc mã thanh toán trên SePay khớp prefix `ELN`

## Không làm trong phase này

- Coupon, giảm giá
- Giỏ hàng nhiều khóa (có thể mở rộng sau)
- Hoàn tiền tự động

## Tiếp theo

→ [phase-6-certificates.md](./phase-6-certificates.md)

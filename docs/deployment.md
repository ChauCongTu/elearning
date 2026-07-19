# Deployment — Hostinger

## Mô hình

```
Developer machine / CI          Hostinger (PHP only)
─────────────────────          ────────────────────
npm run build        ──────►   public/build/  (static assets)
composer install     ──────►   vendor/
php artisan *        ──────►   Laravel app root
```

**Không** cài Node.js trên server. **Không** chạy `npm run dev` trên production.

## Yêu cầu server

- PHP 8.3+ (extensions: mbstring, openssl, pdo_mysql, tokenizer, xml, ctype, json, bcmath, fileinfo)
- MySQL 8 / MariaDB 10.6
- Composer (chạy local trước upload, hoặc SSH nếu Hostinger cho phép)
- Document root trỏ tới `public/`

## Build trước khi upload

```bash
# 1. Dependencies
composer install --no-dev --optimize-autoloader
npm ci
npm run build

# 2. Cache config (chạy trên server sau khi có .env thật)
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan migrate --force
```

## Files upload

| Upload | Bỏ qua |
|--------|--------|
| `app/`, `bootstrap/`, `config/`, `database/`, `public/` (gồm `build/`), `resources/`, `routes/`, `storage/`, `vendor/`, `artisan`, `composer.json` | `node_modules/`, `.git/`, `tests/`, `.env` (tạo riêng trên server) |

`storage/` và `bootstrap/cache/` cần quyền ghi (775).

## `.env` production (mẫu)

```env
APP_NAME="Hoc Vien Bong Nhai Trang"
APP_ENV=production
APP_KEY=base64:...
APP_DEBUG=false
APP_URL=https://your-domain.com

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=...
DB_USERNAME=...
DB_PASSWORD=...

FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_DEFAULT_REGION=ap-southeast-1
AWS_BUCKET=...
AWS_USE_PATH_STYLE_ENDPOINT=false

SEPAY_BANK_CODE=Vietcombank
SEPAY_ACCOUNT_NUMBER=...
SEPAY_ACCOUNT_NAME=...
SEPAY_WEBHOOK_API_KEY=   # enc:... — sinh bằng php artisan sepay:rotate-webhook-key
SEPAY_PAYMENT_EXPIRY_MINUTES=15

SESSION_DRIVER=database
QUEUE_CONNECTION=database
```

## Cron (Hostinger hPanel)

```
* * * * * cd /path/to/project && php artisan schedule:run >> /dev/null 2>&1
```

Queue worker: nếu không có supervisor, dùng `database` queue + cron chạy `php artisan queue:work --stop-when-empty` mỗi phút (hoặc nâng cấp hosting có daemon).

## SePay webhook

- URL: `https://your-domain.com/webhooks/sepay`
- Đăng ký trên dashboard SePay
- **Security:** chọn **API Key** — dán key plaintext lúc chạy `php artisan sepay:rotate-webhook-key` (SePay + app dùng cùng key; `.env` app chỉ lưu bản mã hóa)
- Header SePay gửi: `Authorization: Apikey {key}`
- Rotate key: `php artisan sepay:rotate-webhook-key` rồi cập nhật lại trên SePay Dashboard
- Route **không** CSRF — đã exclude trong `bootstrap/app.php`
- Chỉ HTTPS

## SSL & domain

- Bật SSL miễn phí Hostinger
- `APP_URL` khớp domain chính thức
- Redirect www ↔ non-www thống nhất một kiểu

## CI pipeline (tùy chọn)

```yaml
# GitHub Actions sketch
- composer install --no-dev
- npm ci && npm run build
- rsync/ftp deploy (exclude node_modules)
- ssh: php artisan migrate --force && php artisan optimize
```

## Rollback

- Giữ backup DB trước migrate
- Giữ bản `public/build/` trước đó
- Legacy site giữ nguyên cho đến khi UAT xong

## Checklist go-live

- [ ] Domain trỏ đúng, SSL active
- [ ] `.env` production, `APP_DEBUG=false`
- [ ] Migration chạy thành công
- [ ] SePay webhook test giao dịch thật nhỏ
- [ ] S3 upload + signed URL play video OK
- [ ] Fortify register/login/reset email hoạt động
- [ ] Admin tài khoản seed hoặc tạo thủ công
- [ ] Migrate legacy dry-run + production run
- [ ] Tra cứu chứng chỉ public route OK

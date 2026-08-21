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

## Docker (PHP-FPM + Nginx + Supervisor)

Image **Alpine**: one `app` container (Nginx + PHP 8.3-FPM + queue + scheduler). Frontend is built with Bun in a multi-stage Dockerfile; runtime has no Node/Composer/git.

Compose runs **two containers**: `app` + `mysql:8`. MySQL data lives in the named volume `mysql_data` (survives `compose down` and EC2 **stop**; lost on `compose down -v` or terminate instance).

```bash
cp .env.example .env
php artisan key:generate
# Set DB_PASSWORD (Compose defaults to elearning if unset)

docker compose build
RUN_MIGRATIONS=1 docker compose up -d
```

- Local URL: `http://localhost:8080` (`APP_PORT`)
- Health: `GET /up`
- Logs: `docker compose logs -f app`
- `DB_HOST` inside Compose is the service name **`mysql`**, never `localhost`
- Volume `storage_data` holds local uploads; lab/production media should use S3

EC2 lab (pull-only, no build on the instance):

```bash
docker compose -f docker-compose.yml -f docker-compose.ec2.yml pull
docker compose -f docker-compose.yml -f docker-compose.ec2.yml up -d
```

## Lab EC2 (CDK + ECR + GitHub Actions)

Cheap on/off lab: **one `t4g.small` ARM** in `ap-southeast-1`, Docker Compose `app` + `mysql`, image from ECR. No Fargate, ALB, NAT, or RDS.

Details: [`infra/README.md`](../infra/README.md). Stack: `infra/` (`npx cdk deploy`).

**ENV:** SSM prefix `/elearning/lab/` → `/opt/elearning/.env` via `fetch-env.sh`. GitHub Secrets only store `AWS_ROLE_ARN` (OIDC). After changing SSM, recreate the app container (`sudo /opt/elearning/deploy.sh`).

**CI:** [`.github/workflows/deploy-ec2.yml`](../.github/workflows/deploy-ec2.yml) assumes the OIDC role, builds `linux/arm64`, pushes ECR, SSM-runs `deploy.sh` if the instance is **running**. If the instance is stopped, the image is still pushed.

**OIDC (once):** `cdk deploy` creates the GitHub identity provider + role `elearning-github-deploy`. Paste output `GitHubDeployRoleArn` into GitHub secret `AWS_ROLE_ARN`. Do not create IAM access keys.

**Stop/start:**

```bash
aws ec2 stop-instances --instance-ids i-...   # keep EBS / MySQL
aws ec2 start-instances --instance-ids i-...  # public IP may change
aws ssm start-session --target i-...          # no SSH
```

Backup: `docker compose exec mysql mysqldump ...` on the instance.

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

# Dockerize ứng dụng — các bước chính

Hướng dẫn rút gọn: làm gì, file nào, rule từng file, param cần nhớ.

---

## Các bước chính

1. **Chốt runtime** — app chạy bằng gì, cần worker/cron không, DB nằm đâu.
2. **Viết `Dockerfile` multi-stage** — build → runtime mỏng.
3. **Thêm config process** — Nginx, Supervisor/entrypoint.
4. **`docker-compose.yml`** — `app` + `mysql`; lab EC2 thêm `docker-compose.ec2.yml`.
5. **`.dockerignore` + `.env` ngoài image** — context nhẹ; secret qua env.
6. **Build → up → healthcheck**.

**Dev:** local, không rebuild mỗi lần sửa.  
**Release:** build image → deploy → migrate (nếu có).

---

## Cấu trúc

```text
.
├── Dockerfile
├── docker-compose.yml
├── docker-compose.ec2.yml   # EC2: pull ECR, port 80, no build
├── .dockerignore
├── .env                     # không commit
└── docker/
    ├── entrypoint.sh
    ├── ec2/                 # fetch-env.sh, deploy.sh, bootstrap.sh
    ├── nginx/default.conf
    ├── php/...              # PHP-FPM
    └── supervisor/supervisord.conf
```

---

## Rule & nguyên tắc theo từng file

### `Dockerfile`

| Rule | Chi tiết |
|------|----------|
| Multi-stage | Stage build có compiler/deps; stage runtime **không** copy tool build. |
| COPY có chọn lọc | Chỉ artifact cần chạy (không `COPY . .` bừa vào runtime). |
| Pin base | `php:8.3-fpm-alpine` (hoặc digest), tránh base “mập” không lý do. |
| Một layer sạch | `apk add` + build ext + `apk del .build-deps` trong cùng `RUN`. |
| Không secret | Cấm `COPY .env`, cấm `ARG` chứa password/key. |
| Non-root khi được | Runtime chạy user hạn chế (trừ process cần bind :80). |
| `ENTRYPOINT` mỏng | Chỉ bootstrap + `exec` process chính (PID 1 đúng). |
| `HEALTHCHECK` | Gọi HTTP/TCP thật của app, không chỉ `ps`. |
| Cache deps | Copy lockfile trước source; dùng BuildKit cache mount nếu CI. |

**Không:** cài `git`, `vim`, test runner vào runtime.  
**Có:** `EXPOSE` đúng cổng; tag image theo git SHA khi release.

### `docker-compose.yml`

| Rule | Chi tiết |
|------|----------|
| Compose = cách *chạy*, không phải chỗ chứa logic build phức tạp | Build để trong `Dockerfile`. |
| 1 service = 1 trách nhiệm (lý tưởng) | Tách `worker` nếu scale riêng; all-in-one chấp nhận được khi nhỏ. |
| DB/Redis | Compose lab: service `mysql` + volume `mysql_data`. Hostinger/RDS: không chạy MySQL trong Compose. |
| `env_file` + `environment` | Secret/base từ `.env`; flag runtime (`RUN_MIGRATIONS`) override rõ. |
| Port qua biến | `"${APP_PORT:-8080}:80"` — không hardcode. |
| `restart: unless-stopped` | Prod/staging. |
| Volume chỉ data | Upload local / DB data — **không** mount source code vào prod. |
| `extra_hosts` | `host.docker.internal` khi DB trên máy host. Compose MySQL: `DB_HOST=mysql`. |
| Healthcheck trùng app | Cùng path với `Dockerfile` health. |

**Không:** mount `.:/app` ở profile production.  
**Không:** nhét toàn bộ secret thành plain text trong file commit.

### `.dockerignore`

| Rule | Chi tiết |
|------|----------|
| Loại mọi thứ không cần build | `.git`, IDE, `tests`, docs, archive, log. |
| Loại secret | `.env`, `.env.*` (giữ `!.env.example` nếu cần). |
| Loại artifact nặng | `node_modules`, thường cả `vendor` (trừ khi seed chống rate-limit). |
| Mục tiêu | Context nhỏ → build nhanh, ít lộ file nhầm. |

**Nguyên tắc:** “không chắc cần trong build → ignore”.  
**Ngoại lệ:** cần file X để build (lockfile, `vite.config`) → **không** ignore.

### `.env` (runtime, không đưa vào image)

| Rule | Chi tiết |
|------|----------|
| Source of truth config | Local: `.env`. Lab EC2: SSM `/elearning/lab/*` → `/opt/elearning/.env`. |
| Không commit | Chỉ `.env.example` (placeholder, không secret thật). |
| `DB_HOST` đúng ngữ cảnh | Compose: `mysql`. RDS: endpoint. DB trên PC: `host.docker.internal`. **Không** `localhost` (đó là chính container app). |
| Disk media | `UPLOAD_DISK` / `FILESYSTEM_DISK` / `AWS_*` khớp thực tế (S3 vs local). |
| `APP_URL` khớp URL truy cập | Cookie, link, signed URL phụ thuộc cái này. |

### `docker/entrypoint.sh`

| Rule | Chi tiết |
|------|----------|
| `set -e` | Lỗi bước chuẩn bị → đừng start nửa vời. |
| Idempotent | Chạy lại container không phá data (mkdir -p, migrate có flag). |
| Migrate **opt-in** | `RUN_MIGRATIONS=1` — mặc định tắt (tránh race nhiều replica). |
| Cache config sau khi có env | `config:cache` khi đã inject `.env`. |
| Kết bằng `exec` | Process cuối = PID 1 (nhận tín hiệu stop). |
| LF line ending | Trên Windows: đảm bảo `\n` (sed strip `\r` trong Docker nếu cần). |

**Không:** hardcode secret trong script.  
**Không:** `php artisan serve` làm process prod.

### `docker/nginx/default.conf` (nếu có)

| Rule | Chi tiết |
|------|----------|
| `root` = public web root | Laravel: `/var/www/html/public`. |
| PHP qua FastCGI | `fastcgi_pass 127.0.0.1:9000` (cùng container) hoặc `app:9000` (tách service). |
| Buffer đủ lớn | Laravel/Inertia dễ `upstream sent too big header` → tăng `fastcgi_buffer_size` / `fastcgi_buffers`. |
| Chặn file nhạy cảm | `deny` `.env`, php trong `storage`. |
| Static cache | `/build/` hoặc `/assets/` — `expires` + `immutable`. |
| `client_max_body_size` | Khớp upload PHP/`post_max_size`. |

### `docker/php/*` (nếu PHP-FPM)

| Rule | Chi tiết |
|------|----------|
| `www.conf` gọn | `listen`, `pm.*`, `clear_env = no` (để nhận env từ Compose). |
| `php.ini` tối thiểu | `memory_limit`, upload, opcache (prod: không validate timestamps). |
| Không conflict pool | Xóa/override `zz-docker.conf` nếu listen trùng. |

### `docker/supervisor/supervisord.conf` (all-in-one)

| Rule | Chi tiết |
|------|----------|
| `nodaemon=true` | Bắt buộc trong Docker. |
| Mỗi program 1 việc | `php-fpm`, `nginx`, `queue:work`, `schedule:work`. |
| Log → stdout/stderr | `logfile_maxbytes=0` — để `docker logs`. |
| `autorestart=true` | Worker chết thì lên lại. |
| `stopwaitsecs` đủ cho queue | Tránh cắt job giữa chừng khi deploy. |
| User phù hợp | Worker chạy `www-data` nếu app cần. |

**Khi nào dùng:** 1 container cho web+queue.  
**Khi scale:** tách service `worker` riêng, bỏ queue khỏi supervisor web.

---

## File sample (rút gọn)

### `Dockerfile`

```dockerfile
# syntax=docker/dockerfile:1
FROM <build-base> AS build
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install
COPY . .
RUN bun run build

FROM <runtime-base> AS runtime
WORKDIR /app
COPY --from=build /app/<artifact> ./
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENV APP_ENV=production
EXPOSE 80
HEALTHCHECK CMD curl -fsS http://127.0.0.1/up || exit 1
ENTRYPOINT ["/entrypoint.sh"]
```

### `docker-compose.yml`

```yaml
services:
  app:
    build: .
    ports:
      - "${APP_PORT:-8080}:80"
    env_file: [.env]
    environment:
      DB_HOST: mysql
      RUN_MIGRATIONS: ${RUN_MIGRATIONS:-0}
    depends_on:
      mysql:
        condition: service_healthy
    restart: unless-stopped
  mysql:
    image: mysql:8
    volumes:
      - mysql_data:/var/lib/mysql
    # do not publish 3306
volumes:
  mysql_data:
```

### `.dockerignore`

```gitignore
.git
node_modules
vendor
.env
.env.*
!.env.example
tests
docs
*.md
*.zip
storage/logs/*
```

### `docker/entrypoint.sh`

```sh
#!/bin/sh
set -e
cd /app
# mkdir, quyền ghi, storage:link (tuỳ app)...
[ "${CACHE_CONFIG:-1}" = "1" ] && php artisan config:cache
[ "${RUN_MIGRATIONS:-0}" = "1" ] && php artisan migrate --force
exec supervisord -c /etc/supervisord.conf
```

---

## Param hay dùng

| Param | Ý nghĩa | Gợi ý |
|--------|---------|--------|
| `APP_PORT` | Port host | `8080` |
| `APP_ENV` / `APP_DEBUG` | Môi trường | prod: `production` / `false` |
| `APP_URL` | URL public | Khớp domain:port |
| `RUN_MIGRATIONS` | Migrate lúc start | mặc định `0` |
| `CACHE_CONFIG` | Cache config | prod: `1` |
| `DB_HOST` | DB | `mysql` (Compose), RDS, hoặc `host.docker.internal` |
| `UPLOAD_DISK` / `AWS_*` | Media | `s3` + credentials |

---

## Lưu ý chung

1. Image **không** chứa `.env`.
2. `localhost` trong container ≠ máy host.
3. Data bền vững → volume hoặc S3/RDS.
4. Release = **đổi image tag**, không “sửa file trong container”.
5. Secret chỉ qua env/secret store.

---

## Lệnh

```bash
docker compose build && RUN_MIGRATIONS=1 docker compose up -d
docker compose logs -f app
RUN_MIGRATIONS=1 docker compose up -d
```

| | Làm gì |
|--|--------|
| **Sửa code** | Local. |
| **Release** | Build image → up → migrate nếu cần. |

# Lab EC2 — build Docker trên máy (AWS Console + GitLab)

Không ECR, không ECS, không CDK, không Parameter Store. Region **`ap-southeast-2` (Sydney)**.

EC2 `t4g.small` ARM: **git pull → cp .env.lab → docker compose build → up**.

ENV: [`.env.lab`](../.env.lab) trong GitLab → copy thành `.env` lúc build.

```text
GitLab  --git pull-->  EC2
                       cp .env.lab .env
                       docker compose up -d --build
                  app  <-->  mysql   (volume EBS)
```

Vào máy: **EC2 → Connect → Session Manager** (không SSH, không cần AWS CLI).

---

## 0. Chuẩn bị

| Việc | Cách lấy |
|------|----------|
| Region | Console góc phải → **ap-southeast-2** |
| Account ID | Góc phải avatar → **Account** (12 số) |
| IP nhà | `curl -s https://checkip.amazonaws.com` → dùng `x.x.x.x/32` cho SG |
| GitLab repo | `gitlab.com/GROUP/PROJECT`, nhánh `main` |

Cài **Session Manager plugin** trên laptop nếu Connect báo thiếu plugin: [hướng dẫn AWS](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-install-plugin.html).

---

## 0b. Xóa stack CDK cũ (nếu có)

**CloudFormation** → region Sydney → stack **`ElearningLab`** → **Delete**.

Xóa tay resource còn sót (nếu có):

- **ECR** → repo `elearning` → Delete
- **IAM** → Roles → `elearning-github-deploy`, `elearning-ec2-app` → Delete

---

## 1. `.env.lab` (trong source)

Điền [`.env.lab`](../.env.lab) rồi **push GitLab** trước khi clone trên EC2.

```bash
php artisan key:generate --show   # → APP_KEY=
```

Sau khi tạo S3 (bước 2): `AWS_BUCKET`, `AWS_DEFAULT_REGION=ap-southeast-2`.  
Sau khi có Public IP (bước 5): `APP_URL=http://PUBLIC_IP`.

---

## 2. S3 bucket media

**S3** → **Create bucket**

| Field | Value |
|-------|--------|
| Bucket name | `elearning-lab-media-ACCOUNT_ID` (unique) |
| Region | ap-southeast-2 |
| Block all public access | Bật (giữ mặc định) |
| Bucket Versioning | Off |
| Default encryption | SSE-S3 |

**Create bucket** → mở bucket → **Permissions** → **Bucket policy** → Edit, dán (đổi `BUCKET_NAME`):

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "HttpsOnly",
    "Effect": "Deny",
    "Principal": "*",
    "Action": "s3:*",
    "Resource": [
      "arn:aws:s3:::BUCKET_NAME",
      "arn:aws:s3:::BUCKET_NAME/*"
    ],
    "Condition": { "Bool": { "aws:SecureTransport": "false" } }
  }]
}
```

Ghi tên bucket → sửa `AWS_BUCKET` trong `.env.lab` → push.

---

## 3. IAM role cho EC2

**IAM** → **Roles** → **Create role**

1. Trusted entity: **AWS service** → **EC2** → Next  
2. Permissions: tick **`AmazonSSMManagedInstanceCore`** → Next  
3. Role name: **`elearning-ec2-app`** → Create role  

Mở role vừa tạo → **Permissions** → **Add permissions** → **Create inline policy** → tab **JSON** (đổi `BUCKET_NAME`):

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "S3Media",
    "Effect": "Allow",
    "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject", "s3:ListBucket"],
    "Resource": [
      "arn:aws:s3:::BUCKET_NAME",
      "arn:aws:s3:::BUCKET_NAME/*"
    ]
  }]
}
```

Policy name: `elearning-ec2-s3` → **Create policy**.

(Không tạo Access Key. App dùng instance profile qua role trên.)

---

## 4. Security group

**EC2** → **Security Groups** → **Create security group**

| Field | Value |
|-------|--------|
| Name | `elearning-lab-sg` |
| VPC | default VPC |
| Inbound | Type **HTTP**, Port **80**, Source **My IP** (hoặc Custom `IP_NHA/32`) |
| Outbound | All traffic (mặc định) |

**Create**. Ghi **Security group ID** (`sg-...`).

IP nhà đổi: mở SG → **Edit inbound rules** → thêm/sửa rule HTTP `/32`.

---

## 5. Launch EC2

**EC2** → **Launch instance**

| Tab / field | Value |
|-------------|--------|
| Name | `elearning-lab` |
| AMI | **Amazon Linux 2023**, **64-bit (Arm)** |
| Instance type | **t4g.small** |
| Key pair | Proceed without a key pair |
| Network / Subnet | default VPC, **public subnet** |
| Auto-assign public IP | **Enable** |
| Security group | Select existing → `elearning-lab-sg` |
| IAM instance profile | **`elearning-ec2-app`** |
| Storage | 30 GiB gp3, encrypted |

**Advanced details** → **User data** — dán:

```bash
#!/bin/bash
set -euxo pipefail
dnf install -y docker git
fallocate -l 4G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
systemctl enable --now docker
mkdir -p /usr/local/lib/docker/cli-plugins
curl -fsSL https://github.com/docker/compose/releases/download/v2.32.4/docker-compose-linux-aarch64 \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
usermod -aG docker ec2-user || true
install -d -m 0755 /opt/elearning
```

**Launch instance**.

Đợi **Status checks: 2/2**. Ghi **Instance ID** (`i-...`) và **Public IPv4 address**.

Sửa `APP_URL=http://PUBLIC_IP` trong `.env.lab` → push.

---

## 6. Vào EC2 (Session Manager)

**EC2** → **Instances** → chọn `elearning-lab` → **Connect** → tab **Session Manager** → **Connect**.

(Cửa sổ shell trong browser. User mặc định thường là `ssm-user`; lệnh docker cần `sudo`.)

---

## 7. Clone + build + run (trên EC2)

GitLab → **Settings → Access Tokens** → tạo token (role **Reporter**, scope **`read_repository`**).

Trên EC2:

```bash
sudo su -
TOKEN="glpat-..."   # dán token

git clone --branch main "https://oauth2:${TOKEN}@gitlab.com/GROUP/PROJECT.git" /opt/elearning
cd /opt/elearning
printf "protocol=https\nhost=gitlab.com\nusername=oauth2\npassword=%s\n" "$TOKEN" | git credential approve
git config credential.helper store
git remote set-url origin "https://gitlab.com/GROUP/PROJECT.git"
unset TOKEN

cp .env.lab .env
docker compose up -d --build
docker compose ps
```

Lần đầu build ~10–20 phút.

```text
http://PUBLIC_IP
http://PUBLIC_IP/up
```

---

## 8. Deploy lại

Trên EC2 (Session Manager):

```bash
sudo bash /opt/elearning/docker/ec2/deploy-local.sh
```

(`git pull` → `cp .env.lab .env` → `docker compose up -d --build`)

---

## 9. Stop / start (Console)

**EC2** → **Instances** → chọn máy → **Instance state** → **Stop instance** / **Start instance**.

Sau start, **Public IP thường đổi** — xem cột **Public IPv4** → cập nhật `APP_URL` trong `.env.lab`, push, rồi chạy lại bước 8.

Hoặc trên EC2:

```bash
cd /opt/elearning
sed -i "s|^APP_URL=.*|APP_URL=http://IP_MOI|" .env.lab .env
docker compose up -d --force-recreate app
```

---

## 10. Sửa ENV / logs / backup

Sửa `.env.lab` trên GitLab → push → trên EC2: `deploy-local.sh`.

Chỉ đổi env, không đổi code:

```bash
cd /opt/elearning
cp .env.lab .env
docker compose up -d --force-recreate app
```

Không chạy `docker compose down -v` (mất DB).

```bash
cd /opt/elearning
docker compose ps
docker compose logs -f app
docker compose exec -T mysql mysqldump -u app -pelearning elearning > backup.sql
```

---

## Checklist

1. Region **ap-southeast-2**, lấy IP nhà `/32`
2. Điền `.env.lab` → push GitLab
3. Console: S3 bucket
4. Console: IAM role `elearning-ec2-app`
5. Console: SG inbound HTTP `/32`
6. Console: Launch `t4g.small` + user data
7. Session Manager: clone → `cp .env.lab .env` → `compose up -d --build`
8. Mở `http://PublicIp/up`
9. Học xong: Console **Stop instance**

---

## Gỡ lab (Console)

1. **EC2** → instance → **Instance state** → **Terminate instance**
2. **EC2** → **Security Groups** → `elearning-lab-sg` → **Delete**
3. **S3** → bucket → Empty → **Delete bucket**
4. **IAM** → **Roles** → `elearning-ec2-app` → Delete inline policy → Detach `AmazonSSMManagedInstanceCore` → **Delete role**

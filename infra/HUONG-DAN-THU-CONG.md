# Lab EC2 — build Docker trên máy (AWS Console + GitLab)

Không ECR, không ECS, không CDK, không Parameter Store. Region **`ap-southeast-2` (Sydney)**.

EC2 `t4g.small` ARM: **git pull → cp .env.lab → docker compose build → up**.

ENV: **`.env.lab` chỉ trên EC2** (gitignore). Mẫu commit: [`.env.lab.example`](../.env.lab.example).

```text
GitLab CI  --OIDC-->  IAM role  --SSM SendCommand-->  /deploy/elearning.sh
                                                              |
GitLab  --git pull (trong script)------------------------------+
                       .env.lab (chỉ trên EC2, gitignore)
                       docker compose up -d --build
                  app  <-->  mysql
```

Vào máy: **SSM Session Manager qua CLI** (không SSH).

---

## 0. Chuẩn bị

| Việc | Cách lấy |
|------|----------|
| Region | Console góc phải → **ap-southeast-2** |
| Account ID | Góc phải avatar → **Account** (12 số) |
| IP nhà | `curl -s https://checkip.amazonaws.com` → dùng `x.x.x.x/32` cho SG |
| GitLab repo | `gitlab.com/GROUP/PROJECT`, nhánh `main` |

Trên laptop (bước 6):

1. [AWS CLI v2](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
2. [Session Manager plugin](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-install-plugin.html)

```bash
aws configure
# Default region: ap-southeast-2

session-manager-plugin --version
```

---

## 0b. Xóa stack CDK cũ (nếu có)

**CloudFormation** → region Sydney → stack **`ElearningLab`** → **Delete**.

Xóa tay resource còn sót (nếu có): **ECR** `elearning`, **IAM** roles `elearning-github-deploy`, `elearning-ec2-app`.

---

## 1. S3 bucket media

**S3** → **Create bucket**

| Field | Value |
|-------|--------|
| Bucket name | `elearning-lab-media-ACCOUNT_ID` (unique) |
| Region | ap-southeast-2 |
| Block all public access | Bật |
| Default encryption | SSE-S3 |

**Permissions** → **Bucket policy** (đổi `BUCKET_NAME`):

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

**Ghi tên bucket** — dùng khi tạo `.env.lab` trên EC2 (bước 7).

---

## 2. IAM role cho EC2

**IAM** → **Roles** → **Create role**

1. **EC2** → Next  
2. Tick **`AmazonSSMManagedInstanceCore`** → Next  
3. Role name: **`elearning-ec2-app`** → Create  

**Add permissions** → **Create inline policy** → JSON (đổi `BUCKET_NAME`):

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

Policy name: `elearning-ec2-s3`. Không tạo Access Key.

---

## 3. Security group

**EC2** → **Security Groups** → **Create security group**

| Field | Value |
|-------|--------|
| Name | `elearning-lab-sg` |
| VPC | default |
| Inbound | HTTP **80**, Source **My IP** hoặc `IP_NHA/32` |

---

## 4. Launch EC2

**EC2** → **Launch instance**

| Field | Value |
|-------|--------|
| Name | `elearning-lab` |
| AMI | **Ubuntu Server 24.04 LTS**, **64-bit (Arm)** |
| Type | **t4g.small** |
| Key pair | Proceed without a key pair |
| Subnet | default VPC, **public** |
| Public IP | Enable |
| SG | `elearning-lab-sg` |
| IAM profile | `elearning-ec2-app` |
| Storage | 30 GiB gp3, encrypted |

**Advanced details** → **User data**:

```bash
#!/bin/bash
set -euxo pipefail
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y docker.io docker-compose-v2 git
fallocate -l 4G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
systemctl enable --now docker
systemctl enable --now snap.amazon-ssm-agent.amazon-ssm-agent.service || true
usermod -aG docker ubuntu || true
install -d -m 0755 /opt/elearning
```

**Launch** → đợi **Status checks: 2/2**.

Ghi **Instance ID** (`i-...`) và **Public IPv4** — dùng cho bước 5–7.

---

## 5. Tạo `.env.lab` trên EC2

**Không commit, không push GitLab.**

Trên laptop (sinh `APP_KEY`):

```bash
php artisan key:generate --show
```

SSM vào máy (bước 6) rồi — **sau khi clone repo** (bước 7) — chạy:

```bash
cd /opt/elearning
cp .env.lab.example .env.lab
nano .env.lab
```

Điền tối thiểu:

```env
APP_KEY=base64:...          # từ lệnh trên
APP_URL=http://PUBLIC_IP    # IPv4 bước 4
AWS_BUCKET=elearning-lab-media-ACCOUNT_ID
AWS_DEFAULT_REGION=ap-southeast-2
# AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY để trống (instance profile)
```

Đổi `DB_PASSWORD` / `MYSQL_ROOT_PASSWORD` nếu muốn (mặc định `elearning`).

File nằm tại `/opt/elearning/.env.lab` — **git pull không ghi đè** (gitignore).

---

## 6. Vào EC2 (SSM CLI)

```bash
export AWS_REGION=ap-southeast-2
export INSTANCE_ID=i-xxxxxxxx

aws ssm start-session --target "$INSTANCE_ID" --region "$AWS_REGION"
```

Profile: thêm `--profile TEN_PROFILE`. Thoát: `exit`.

User thường `ubuntu` / `ssm-user` → lệnh docker dùng `sudo`.

| Lỗi | Xử lý |
|-----|--------|
| `SessionManagerPlugin is not found` | Cài plugin (mục 0) |
| `Target not connected` | Đợi user-data; kiểm tra `AmazonSSMManagedInstanceCore` |

---

## 7. Clone + `.env.lab` + build

GitLab → **Access Tokens** (Reporter, `read_repository`).

Trên EC2:

```bash
sudo su -
TOKEN="glpat-..."

git clone --branch main "https://oauth2:${TOKEN}@gitlab.com/GROUP/PROJECT.git" /opt/elearning
cd /opt/elearning
printf "protocol=https\nhost=gitlab.com\nusername=oauth2\npassword=%s\n" "$TOKEN" | git credential approve
git config credential.helper store
git remote set-url origin "https://gitlab.com/GROUP/PROJECT.git"
unset TOKEN

cp .env.lab.example .env.lab
nano .env.lab          # bước 5 — APP_KEY, APP_URL, AWS_BUCKET
cp .env.lab .env

sudo install -d -m 0755 /deploy
sudo cp deploy/elearning.sh /deploy/elearning.sh
sudo chmod +x /deploy/elearning.sh

docker compose up -d --build
docker compose ps
```

Lần đầu ~10–20 phút.

```text
http://PUBLIC_IP/up
```

---

## 8. GitLab CI/CD (OIDC + SSM)

Pipeline: **lint → test → deploy**. Deploy chỉ chạy khi lint/test pass, trên `main`/`develop` (hoặc Run pipeline). MR chỉ lint + test.

OIDC + SSM gọi **`bash /deploy/elearning.sh`**. Không Access Key.

Repo: [`.gitlab-ci.yml`](../.gitlab-ci.yml) (include), [`.gitlab/workflows/`](../.gitlab/workflows/), [`deploy/elearning.sh`](../deploy/elearning.sh).

Job **`deploy:production`** — environment GitLab `production`, chỉ nhánh `main`.

### 8a. OIDC provider (Console)

**IAM** → **Identity providers** → **Add provider**

| Field | Value |
|-------|--------|
| Provider type | OpenID Connect |
| Provider URL | `https://gitlab.com` |
| Audience | `https://gitlab.com` |

**Add provider**. (Thumbprint Console tự lấy.)

### 8b. IAM role GitLab deploy (Console)

**IAM** → **Roles** → **Create role** → **Web identity**

| Field | Value |
|-------|--------|
| Identity provider | `gitlab.com` |
| Audience | `https://gitlab.com` |
| GitLab organization | `GROUP/PROJECT` (đúng path repo) |

**Next** → không gắn managed policy → Role name: **`elearning-gitlab-deploy`** → Create.

Mở role → **Trust relationships** → **Edit** → thay `Statement` bằng (đổi `GROUP/PROJECT`):

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/gitlab.com"
    },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": {
        "gitlab.com:aud": "https://gitlab.com"
      },
      "StringLike": {
        "gitlab.com:sub": "project_path:GROUP/PROJECT:ref_type:branch:ref:*"
      }
    }
  }]
}
```

**Permissions** → **Add permissions** → **Create inline policy** → JSON (đổi `INSTANCE_ID`, `ACCOUNT_ID`, region):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "ssm:SendCommand",
      "Resource": [
        "arn:aws:ec2:ap-southeast-2:ACCOUNT_ID:instance/INSTANCE_ID",
        "arn:aws:ssm:ap-southeast-2::document/AWS-RunShellScript"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "ssm:GetCommandInvocation",
        "ssm:ListCommandInvocations",
        "ssm:ListCommands"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": "ec2:DescribeInstances",
      "Resource": "*"
    }
  ]
}
```

Policy name: `elearning-gitlab-deploy`.

Ghi **Role ARN**: `arn:aws:iam::ACCOUNT_ID:role/elearning-gitlab-deploy`.

### 8c. GitLab CI variables

**Settings → CI/CD → Variables**:

| Key | Value |
|-----|--------|
| `AWS_ROLE_ARN` | `arn:aws:iam::ACCOUNT:role/elearning-gitlab-deploy` |
| `AWS_DEFAULT_REGION` | `ap-southeast-2` |
| `EC2_INSTANCE_ID` | `i-...` (bước 4) |

Push lên GitLab → **Build → Pipelines**. Job `deploy:production` chỉ trên `main`.

Máy **stop**: pipeline báo not running, không deploy. Bật EC2 → Run pipeline lại.

**Lỗi `Not authorized to perform sts:AssumeRoleWithWebIdentity`:** trust policy `sub` không khớp path repo GitLab.

---

## 9. Deploy lại

**CI (sau bước 8):** push `main` / `develop` hoặc Run pipeline.

**Tay trên EC2:**

```bash
sudo bash /deploy/elearning.sh
```

**Tay từ laptop (SSM):**

```bash
aws ssm send-command \
  --instance-ids "$INSTANCE_ID" \
  --document-name AWS-RunShellScript \
  --comment "elearning deploy" \
  --parameters '{"commands":["bash /deploy/elearning.sh"]}' \
  --region ap-southeast-2
```

(`git pull` giữ `.env.lab` → rebuild)

---

## 10. Stop / start (Console)

**EC2** → **Stop** / **Start**. Public IP thường đổi → sửa trên EC2:

```bash
cd /opt/elearning
sed -i "s|^APP_URL=.*|APP_URL=http://IP_MOI|" .env.lab .env
docker compose up -d --force-recreate app
```

---

## 11. Sửa ENV / logs / backup

Sửa **`/opt/elearning/.env.lab`** (nano trên EC2), không push git:

```bash
cp .env.lab .env
docker compose up -d --force-recreate app
```

Không `docker compose down -v`.

```bash
docker compose logs -f app
docker compose exec -T mysql mysqldump -u app -pelearning elearning > backup.sql
```

---

## Checklist

1. Console: S3 + IAM EC2 + SG + Launch EC2
2. SSM: clone + `.env.lab` + cài `/deploy/elearning.sh` + build lần đầu
3. Console: OIDC + role `elearning-gitlab-deploy` + GitLab CI variables
4. Push `main` → `deploy:production` → SSM → `/deploy/elearning.sh`
5. `http://PublicIp/up`
6. Học xong: **Stop instance**

---

## Gỡ lab (Console)

1. **EC2** → Terminate instance  
2. **Security Groups** → Delete `elearning-lab-sg`  
3. **S3** → Empty + Delete bucket  
4. **IAM** → Delete role `elearning-ec2-app`
5. **IAM** → Delete role `elearning-gitlab-deploy` + identity provider `gitlab.com` (nếu không dùng chỗ khác)

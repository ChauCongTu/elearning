# Lab EC2 — hướng dẫn từng bước

Lab học AWS: **một máy EC2** (`t4g.small`, ARM) chạy **hai container** (app Laravel + MySQL). Image build trên GitHub Actions, đẩy ECR, máy pull về. Tắt máy khi không học.

- Region: **`ap-southeast-2` (Sydney)**
- Package CDK: **Bun** (`bunx cdk`), không dùng npm trong `infra/`
- Không Fargate, không ALB, không NAT, không RDS

```text
GitHub Actions  --OIDC-->  ECR (image arm64)
                              |
                              v
                         EC2 (Compose)
                    app  <-->  mysql
                         volume trên EBS
ENV lab: SSM /elearning/lab/*  →  /opt/elearning/.env
```

Lệnh CDK rút gọn: [README.md](./README.md).

---

## 0. Cần có sẵn

| Thứ | Ghi chú |
|-----|---------|
| Tài khoản AWS | Account ID ví dụ `502429879716` |
| [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) | Máy bạn |
| [Bun](https://bun.sh) | `bun --version` |
| [Session Manager plugin](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-install-plugin.html) | Để `aws ssm start-session` (không SSH) |
| GitHub repo | `ChauCongTu/elearning` — code lab đã push `main` hoặc `develop` |
| Default VPC | Trong region `ap-southeast-2` (account mới thường đã có) |

**IAM:** user đang `aws configure` phải tạo được CloudFormation, IAM role, EC2, ECR, SSM, S3, Budgets. User `lifeos_app` **không đủ quyền** (`cloudformation:DescribeStacks` bị từ chối). Dùng user Admin, hoặc gắn **AdministratorAccess** cho user deploy.

Kiểm tra user hiện tại:

```bash
aws sts get-caller-identity
```

`Arn` phải là user/role **có quyền**, không phải `lifeos_app` nếu user đó vẫn thiếu policy.

---

## 1. Cấu hình AWS CLI (region Sydney)

```bash
aws configure
```

- Access Key / Secret của **user đủ quyền** (bước 0)
- Default region: **`ap-southeast-2`**
- Output: `json`

```bash
aws configure get region
# phải ra: ap-southeast-2
```

Lấy IP nhà (chỉ IP này vào cổng 80):

```bash
curl -s https://checkip.amazonaws.com
```

Ví dụ `1.2.3.4` → dùng `1.2.3.4/32` ở bước 3.

---

## 2. Cài dependency CDK

Trong repo:

```bash
cd infra
bun install
```

---

## 3. Bootstrap CDK (một lần / account + region)

Bootstrap **cùng region** với lab:

```bash
bunx cdk bootstrap aws://ACCOUNT_ID/ap-southeast-2
```

Thay `ACCOUNT_ID` (12 số). Ví dụ:

```bash
bunx cdk bootstrap aws://502429879716/ap-southeast-2
```

Gõ `y` nếu hỏi. Thành công = stack `CDKToolkit` trong CloudFormation **Sydney**.

**Lỗi thường gặp**

| Lỗi | Cách xử lý |
|-----|------------|
| `AccessDenied` … `cloudformation:DescribeStacks` | User IAM thiếu quyền — xem bước 0 |
| `GroupDescription is invalid` / `Character sets beyond ASCII` | Đã sửa trong code. Deploy lại: `bunx cdk deploy ...` |
| `repository already exists` (`elearning`) | Repo ECR còn lại sau lần fail. Xóa rồi deploy: `aws ecr delete-repository --repository-name elearning --force --region ap-southeast-2` |
| Bootstrap nhầm `ap-southeast-1` | Bootstrap **`ap-southeast-2`** |
| Không assume `cdk-...-lookup-role` | Cùng nguyên nhân quyền; user Admin thì hết |

---

## 4. Deploy stack lab (`cdk deploy`)

Vẫn trong `infra/`:

```bash
bunx cdk deploy \
  -c githubRepo=ChauCongTu/elearning \
  -c allowedCidr=1.2.3.4/32
```

Đổi IP cho đúng bước 1. Muốn mail khi gần $20/tháng:

```bash
bunx cdk deploy \
  -c githubRepo=ChauCongTu/elearning \
  -c allowedCidr=1.2.3.4/32 \
  -c budgetEmail=you@email.com
```

**Nếu account đã có GitHub OIDC** (project khác), thêm ARN provider:

```bash
bunx cdk deploy \
  -c githubRepo=ChauCongTu/elearning \
  -c allowedCidr=1.2.3.4/32 \
  -c githubOidcProviderArn=arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com
```

Chờ 3–5 phút. **Copy các output:**

| Output | Việc tiếp theo |
|--------|----------------|
| `GitHubDeployRoleArn` | Dán GitHub Secret (bước 5) |
| `InstanceId` | `i-...` — stop/start, SSM |
| `PublicIp` | Mở web (đổi mỗi lần start máy) |
| `EcrUri` | Registry image |
| `MediaBucketName` | Bucket S3 lab |

Lúc này EC2 **đang chạy** (tính tiền). **Chưa có image app** — làm bước 6.

---

## 5. GitHub OIDC (một lần)

Không tạo IAM Access Key cho GitHub.

1. Repo GitHub → **Settings → Secrets and variables → Actions**
2. **Secrets** → New repository secret
   - Name: `AWS_ROLE_ARN`
   - Value **đúng 55 ký tự**, hai dấu `:` sau `iam`:

```text
arn:aws:iam::502429879716:role/elearning-github-deploy
```

Sai: `arn:aws:iam:502429879716:...` (một dấu `:` → AWS báo Request ARN is invalid).
3. **Variables** (tuỳ chọn)
   - Name: `AWS_REGION`
   - Value: `ap-southeast-2`  
   (Workflow đã mặc định region này nếu không set.)

Trust OIDC: `repo:ChauCongTu/elearning:*`. Repo khác / fork **không** assume được role.

---

## 6. Build image và lên EC2

1. GitHub → **Actions → Deploy lab EC2 → Run workflow**
2. Chọn nhánh `main` hoặc `develop` → Run
3. Đợi build `linux/arm64` (lần đầu 10–20 phút) → push ECR → SSM `deploy.sh` trên EC2

Push lên `main`/`develop` cũng chạy workflow này.

**Nếu fail “instance not running / SSM timeout”:** máy còn cài Docker. Đợi 2–3 phút, Run workflow lại.

Mở trình duyệt:

```text
http://PublicIp
http://PublicIp/up
```

`PublicIp` = output CDK hoặc:

```bash
aws ec2 describe-instances --instance-ids i-xxxxxxxx \
  --query "Reservations[0].Instances[0].PublicIpAddress" --output text \
  --region ap-southeast-2
```

IP nhà đổi mà không vào được `:80` → cập nhật Security Group hoặc:

```bash
cd infra
bunx cdk deploy -c githubRepo=ChauCongTu/elearning -c allowedCidr=IP_MỚI/32
```

---

## 7. Hàng ngày: tắt / bật

Tắt (MySQL + volume EBS **còn**, hết tiền compute):

```bash
aws ec2 stop-instances --instance-ids i-xxxxxxxx --region ap-southeast-2
```

Bật:

```bash
aws ec2 start-instances --instance-ids i-xxxxxxxx --region ap-southeast-2
```

IP public **thường đổi**. Lấy IP mới (lệnh bước 6) rồi mở `http://IP_MỚI`.

Cập nhật `APP_URL` cho khớp IP:

```bash
aws ssm put-parameter --region ap-southeast-2 \
  --name /elearning/lab/APP_URL --type String --overwrite \
  --value "http://IP_MỚI"

aws ssm start-session --target i-xxxxxxxx --region ap-southeast-2
```

Trên máy EC2:

```bash
sudo /opt/elearning/fetch-env.sh
sudo /opt/elearning/deploy.sh latest
```

Máy đang **stop**: push GitHub vẫn **đẩy image ECR**, không deploy vào EC2. Bật máy rồi Run workflow lại, hoặc SSM + `deploy.sh`.

---

## 8. Sửa ENV lab

Nguồn đúng: **SSM** prefix `/elearning/lab/` — không sửa `.env` trên GitHub, không nhét secret vào image.

1. AWS Console → Systems Manager → Parameter Store  
   hoặc `aws ssm put-parameter --overwrite ...`
2. Trên EC2: `fetch-env.sh` rồi `deploy.sh` (bước 7)

Lần boot đầu, script tự tạo SecureString: `APP_KEY`, `DB_PASSWORD`, `MYSQL_ROOT_PASSWORD` nếu chưa có.

Entrypoint app chạy `config:cache` — **phải recreate container app** sau khi đổi ENV (`deploy.sh` làm việc đó). Không xóa volume MySQL.

---

## 9. Vào shell máy (không SSH)

```bash
aws ssm start-session --target i-xxxxxxxx --region ap-southeast-2
```

```bash
cd /opt/elearning
docker compose -f docker-compose.yml -f docker-compose.ec2.yml ps
docker compose -f docker-compose.yml -f docker-compose.ec2.yml logs -f app
```

Backup MySQL:

```bash
docker compose -f docker-compose.yml -f docker-compose.ec2.yml \
  exec -T mysql mysqldump -u app -p"$DB_PASSWORD" elearning > backup.sql
```

(`DB_PASSWORD` lấy từ `/opt/elearning/.env`.)

---

## 10. Checklist thứ tự

1. User IAM đủ quyền, `aws configure` region **`ap-southeast-2`**
2. `cd infra && bun install`
3. `bunx cdk bootstrap aws://ACCOUNT/ap-southeast-2`
4. `bunx cdk deploy -c githubRepo=... -c allowedCidr=IP/32`
5. GitHub secret `AWS_ROLE_ARN`
6. Actions → **Deploy lab EC2**
7. Mở `http://PublicIp`
8. Học xong → `stop-instances`

---

## Tham số CDK (tuỳ chọn)

| Context | Mặc định | Ý nghĩa |
|---------|----------|---------|
| `githubRepo` | `ChauCongTu/elearning` | Trust OIDC `repo:OWNER/REPO:*` |
| `allowedCidr` | `0.0.0.0/0` | Ai vào `:80` — nên siết `/32` |
| `githubOidcProviderArn` | tạo mới | Reuse OIDC GitHub đã có trong account |
| `budgetEmail` | không | Mail khi đạt 80% budget $20 |

---

## Chi phí

- Máy **running** 24/7: khoảng $15–20/tháng (Sydney, `t4g.small`)
- **Stop:** còn EBS ~30 GB (~$2–4) + không compute
- ECR + SSM: gần $0
- Không NAT / ALB / RDS

Không gắn Elastic IP (EIP vẫn tính khi máy stop).

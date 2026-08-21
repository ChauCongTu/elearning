# Lab infra (EC2 + Compose + ECR + GitHub OIDC)

CDK stack for a cheap **on/off** lab: one `t4g.small` ARM instance running **app + MySQL** via Docker Compose. Image is built in GitHub Actions (`linux/arm64`) and pushed to ECR.

Region default: `ap-southeast-1`.

## One-time setup

1. AWS CLI + credentials that can deploy CloudFormation (your laptop, not GitHub).
2. Default VPC must exist in the account/region.
3. From this directory:

```bash
npm install
npx cdk bootstrap aws://ACCOUNT/ap-southeast-1
npx cdk deploy \
  -c githubRepo=ChauCongTu/elearning \
  -c allowedCidr=YOUR.IP.V4.0/32
```

Optional context:

| Context | Default | Meaning |
|---------|---------|---------|
| `githubRepo` | `ChauCongTu/elearning` | OIDC trust `repo:OWNER/REPO:*` |
| `allowedCidr` | `0.0.0.0/0` | Who can hit `:80` (restrict this) |
| `githubOidcProviderArn` | (create new) | Reuse existing GitHub OIDC provider in the account |
| `budgetEmail` | none | Email for 80% of the $20/month budget alarm |

4. Copy stack output **`GitHubDeployRoleArn`**.
5. GitHub repo → Settings → Secrets and variables → Actions:
   - Secret `AWS_ROLE_ARN` = that ARN
   - Variable `AWS_REGION` = `ap-southeast-1` (optional; workflow defaults to this)
6. Do **not** add `AWS_ACCESS_KEY_ID`. Workflow uses OIDC (`id-token: write`).
7. Run **Actions → Deploy lab EC2** (or push `develop`/`main`). If the instance is still booting Docker, wait and re-run.

## ENV (lab)

Source of truth: SSM prefix **`/elearning/lab/`**.

- First boot generates `APP_KEY`, `DB_PASSWORD`, `MYSQL_ROOT_PASSWORD` if missing.
- Script `/opt/elearning/fetch-env.sh` writes `/opt/elearning/.env`.
- After changing a parameter:

```bash
# Session Manager (no SSH)
aws ssm start-session --target INSTANCE_ID

sudo /opt/elearning/fetch-env.sh
sudo /opt/elearning/deploy.sh latest
```

`config:cache` in the app entrypoint means you must recreate the **app** container after ENV changes (`deploy.sh` does that; MySQL volume is not wiped).

## Day-to-day

```bash
# Stop (keep EBS / MySQL data; stop compute)
aws ec2 stop-instances --instance-ids i-...

# Start (public IPv4 usually changes — update APP_URL in SSM if needed)
aws ec2 start-instances --instance-ids i-...

# Shell
aws ssm start-session --target i-...
```

Backup DB:

```bash
docker compose -f /opt/elearning/docker-compose.yml \
  -f /opt/elearning/docker-compose.ec2.yml \
  exec -T mysql mysqldump -u app -p"$DB_PASSWORD" elearning > backup.sql
```

## Outputs

- `GitHubDeployRoleArn` — GitHub secret
- `EcrUri` — image registry
- `InstanceId`
- `MediaBucketName` — private S3 for lab uploads (instance role, no static keys)

## Cost

Stop the instance when idle. You still pay for the 30 GB gp3 volume (~$2–3). No NAT, ALB, or RDS.

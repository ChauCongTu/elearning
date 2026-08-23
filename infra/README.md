# Lab infra (EC2 + Compose + ECR + GitHub OIDC)

Hướng dẫn **từng bước (tiếng Việt):** [HUONG-DAN.md](./HUONG-DAN.md) (CDK + GitHub).

Bản **thủ công AWS Console + GitLab:** [HUONG-DAN-THU-CONG.md](./HUONG-DAN-THU-CONG.md).

Tóm tắt: một EC2 `t4g.small` ARM, Compose **app + MySQL**, image `linux/arm64` từ GitHub Actions → ECR. Region **`ap-southeast-2`**. Dùng **Bun** trong thư mục này.

```bash
cd infra
bun install
bunx cdk bootstrap aws://ACCOUNT/ap-southeast-2
bunx cdk deploy \
  -c githubRepo=ChauCongTu/elearning \
  -c allowedCidr=YOUR.IP.V4.0/32
```

Copy output `GitHubDeployRoleArn` → GitHub secret `AWS_ROLE_ARN`. Không dùng Access Key trên GitHub.

Context CDK: `githubRepo`, `allowedCidr`, `githubOidcProviderArn`, `budgetEmail` — xem bảng trong [HUONG-DAN.md](./HUONG-DAN.md).

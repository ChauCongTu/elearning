#!/bin/bash
# First-boot (and reboot) bootstrap for the elearning lab EC2.
set -euxo pipefail

MD_TOKEN="$(curl -fsS -X PUT --max-time 2 \
  -H 'X-aws-ec2-metadata-token-ttl-seconds: 60' \
  http://169.254.169.254/latest/api/token)"
REGION="$(curl -fsS --max-time 2 \
  -H "X-aws-ec2-metadata-token: ${MD_TOKEN}" \
  http://169.254.169.254/latest/meta-data/placement/region)"
export AWS_DEFAULT_REGION="$REGION"
export AWS_REGION="$REGION"

dnf install -y docker python3
if ! command -v aws >/dev/null 2>&1; then
  dnf install -y aws-cli || dnf install -y awscli
fi

systemctl enable --now docker

COMPOSE_URL="https://github.com/docker/compose/releases/download/v2.32.4/docker-compose-linux-aarch64"
mkdir -p /usr/local/lib/docker/cli-plugins
curl -fsSL "$COMPOSE_URL" -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

usermod -aG docker ec2-user || true

install -d -m 0755 /opt/elearning
cd /opt/elearning

chmod +x /opt/elearning/fetch-env.sh

ECR_URI="$(aws ssm get-parameter --name /elearning/lab/ECR_URI --query Parameter.Value --output text --region "$REGION" || true)"
if [ -n "$ECR_URI" ] && [ "$ECR_URI" != "None" ]; then
  export APP_IMAGE="${ECR_URI}:latest"
  echo "APP_IMAGE=${APP_IMAGE}" > /opt/elearning/.app-image
fi

/opt/elearning/fetch-env.sh

if [ -n "${APP_IMAGE:-}" ]; then
  ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
  aws ecr get-login-password --region "$REGION" \
    | docker login --username AWS --password-stdin "${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com" || true

  if docker compose -f docker-compose.yml -f docker-compose.ec2.yml pull; then
    docker compose -f docker-compose.yml -f docker-compose.ec2.yml up -d
  else
    echo "ECR image not available yet; wait for GitHub Actions deploy."
  fi
fi

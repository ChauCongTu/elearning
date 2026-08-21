#!/bin/bash
# Pull the app image from ECR and recreate the app container (MySQL volume is left intact).
set -euo pipefail

cd /opt/elearning
MD_TOKEN="$(curl -fsS -X PUT --max-time 2 \
  -H 'X-aws-ec2-metadata-token-ttl-seconds: 60' \
  http://169.254.169.254/latest/api/token)"
REGION="$(curl -fsS --max-time 2 \
  -H "X-aws-ec2-metadata-token: ${MD_TOKEN}" \
  http://169.254.169.254/latest/meta-data/placement/region)"
export AWS_DEFAULT_REGION="$REGION"
export AWS_REGION="$REGION"

ECR_URI="$(aws ssm get-parameter --name /elearning/lab/ECR_URI --query Parameter.Value --output text --region "$REGION")"
TAG="${1:-latest}"
export APP_IMAGE="${ECR_URI}:${TAG}"
echo "APP_IMAGE=${APP_IMAGE}" > /opt/elearning/.app-image

ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
aws ecr get-login-password --region "$REGION" \
  | docker login --username AWS --password-stdin "${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"

/opt/elearning/fetch-env.sh

# Ensure APP_IMAGE is in .env for compose interpolation
if grep -q '^APP_IMAGE=' /opt/elearning/.env; then
  sed -i "s|^APP_IMAGE=.*|APP_IMAGE=${APP_IMAGE}|" /opt/elearning/.env
else
  echo "APP_IMAGE=${APP_IMAGE}" >> /opt/elearning/.env
fi

docker compose -f docker-compose.yml -f docker-compose.ec2.yml pull
docker compose -f docker-compose.yml -f docker-compose.ec2.yml up -d mysql
docker compose -f docker-compose.yml -f docker-compose.ec2.yml up -d --no-deps --force-recreate app

docker compose -f docker-compose.yml -f docker-compose.ec2.yml ps

#!/bin/bash
# Build /opt/elearning/.env from SSM /elearning/lab/* (SecureString decrypted).
# Creates APP_KEY / DB passwords on first boot if the parameters are missing.
set -euo pipefail

PREFIX="${SSM_PREFIX:-/elearning/lab}"
OUT="${ENV_FILE:-/opt/elearning/.env}"
REGION="${AWS_DEFAULT_REGION:-${AWS_REGION:-}}"
if [ -z "$REGION" ]; then
  MD_TOKEN="$(curl -fsS -X PUT --max-time 2 \
    -H 'X-aws-ec2-metadata-token-ttl-seconds: 60' \
    http://169.254.169.254/latest/api/token)"
  REGION="$(curl -fsS --max-time 2 \
    -H "X-aws-ec2-metadata-token: ${MD_TOKEN}" \
    http://169.254.169.254/latest/meta-data/placement/region)"
fi
export AWS_DEFAULT_REGION="$REGION"
export AWS_REGION="$REGION"

mkdir -p "$(dirname "$OUT")"

ensure_param() {
  local name="$1"
  local type="$2"
  local value="$3"
  if aws ssm get-parameter --name "$name" --region "$REGION" >/dev/null 2>&1; then
    return 0
  fi
  aws ssm put-parameter \
    --name "$name" \
    --type "$type" \
    --value "$value" \
    --region "$REGION" >/dev/null
}

rand_alnum() {
  openssl rand -base64 24 | tr -d '/+=\n' | head -c 24
}

ensure_param "${PREFIX}/APP_KEY" SecureString "base64:$(openssl rand -base64 32 | tr -d '\n')"
ensure_param "${PREFIX}/DB_PASSWORD" SecureString "$(rand_alnum)"
ensure_param "${PREFIX}/MYSQL_ROOT_PASSWORD" SecureString "$(rand_alnum)"

TMP="$(mktemp)"
NEXT=""
while :; do
  if [ -n "$NEXT" ]; then
    PAGE="$(aws ssm get-parameters-by-path \
      --path "$PREFIX" \
      --recursive \
      --with-decryption \
      --region "$REGION" \
      --starting-token "$NEXT" \
      --output json)"
  else
    PAGE="$(aws ssm get-parameters-by-path \
      --path "$PREFIX" \
      --recursive \
      --with-decryption \
      --region "$REGION" \
      --output json)"
  fi

  echo "$PAGE" | python3 -c '
import json, sys
data = json.load(sys.stdin)
skip = {
    "EC2_INSTANCE_ID",
    "ECR_URI",
    "GITHUB_DEPLOY_ROLE_ARN",
    "GITLAB_DEPLOY_ROLE_ARN",
    "GITLAB_DEPLOY_TOKEN",
    "GITLAB_REPO",
    "GITLAB_BRANCH",
}
for p in data.get("Parameters", []):
    key = p["Name"].rsplit("/", 1)[-1]
    if key in skip:
        continue
    value = p.get("Value", "").replace("\n", "")
    print(f"{key}={value}")
'
  NEXT="$(echo "$PAGE" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("NextToken") or "")')"
  [ -z "$NEXT" ] && break
done > "$TMP"

set_default() {
  local key="$1"
  local val="$2"
  grep -q "^${key}=" "$TMP" || echo "${key}=${val}" >> "$TMP"
}

PUBLIC_IP=""
MD_TOKEN="$(curl -fsS -X PUT --max-time 2 \
  -H 'X-aws-ec2-metadata-token-ttl-seconds: 60' \
  http://169.254.169.254/latest/api/token 2>/dev/null || true)"
if [ -n "$MD_TOKEN" ]; then
  PUBLIC_IP="$(curl -fsS --max-time 2 \
    -H "X-aws-ec2-metadata-token: ${MD_TOKEN}" \
    http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || true)"
fi

set_default "APP_NAME" "Elearning Lab"
set_default "APP_ENV" "production"
set_default "APP_DEBUG" "false"
set_default "APP_URL" "http://${PUBLIC_IP:-127.0.0.1}"
set_default "LOG_CHANNEL" "stderr"
set_default "CACHE_CONFIG" "1"
set_default "RUN_MIGRATIONS" "1"
set_default "DB_CONNECTION" "mysql"
set_default "DB_HOST" "mysql"
set_default "DB_PORT" "3306"
set_default "DB_DATABASE" "elearning"
set_default "DB_USERNAME" "app"
set_default "SESSION_DRIVER" "database"
set_default "QUEUE_CONNECTION" "database"
set_default "CACHE_STORE" "database"
set_default "AWS_DEFAULT_REGION" "$REGION"
set_default "AWS_USE_PATH_STYLE_ENDPOINT" "false"

if grep -qE '^AWS_BUCKET=.+' "$TMP"; then
  set_default "FILESYSTEM_DISK" "s3"
  set_default "UPLOAD_DISK" "s3"
else
  set_default "FILESYSTEM_DISK" "local"
  set_default "UPLOAD_DISK" "public"
fi

if [ -n "${APP_IMAGE:-}" ]; then
  grep -q '^APP_IMAGE=' "$TMP" || echo "APP_IMAGE=${APP_IMAGE}" >> "$TMP"
fi

chmod 600 "$TMP"
mv "$TMP" "$OUT"
echo "Wrote $OUT"

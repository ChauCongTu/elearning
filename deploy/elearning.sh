#!/bin/bash
# Deploy on EC2: git pull → env file → docker compose build + up.
# Installed at /deploy/elearning.sh (see infra/HUONG-DAN-THU-CONG.md).
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/elearning}"
cd "$APP_DIR"

git pull --ff-only

ENV_SRC=""
if [ -f .env.production ]; then
  ENV_SRC=.env.production
elif [ -f .env.lab ]; then
  ENV_SRC=.env.lab
else
  echo "Missing ${APP_DIR}/.env.production or .env.lab — copy from .env.lab.example first."
  exit 1
fi

cp "$ENV_SRC" .env
echo "Using ${ENV_SRC}"
docker compose up -d --build
docker compose ps

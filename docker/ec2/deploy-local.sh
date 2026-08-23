#!/bin/bash
# On-instance deploy: git pull → .env.lab → docker compose build + up.
# MySQL volume is left intact.
set -euo pipefail

cd /opt/elearning
git pull --ff-only
cp .env.lab .env
docker compose up -d --build
docker compose ps

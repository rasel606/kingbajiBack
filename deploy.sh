#!/bin/bash
# Local prep for VPS deploy

echo "Preparing backend for Contabo VPS..."

cd "$(dirname "$0")"

# Install prod deps
npm ci --production

# Create dirs
mkdir -p logs uploads

# PM2 setup (run on VPS)
echo "Local prep complete."
echo "1. scp -r . root@161.97.180.157:/var/www/megabaji-backend/backend/"
echo "2. On VPS: cp .env.example .env && edit secrets"
echo "3. pm2 start ecosystem.config.js --env production"
echo "Run VPS setup commands from TODO.md"


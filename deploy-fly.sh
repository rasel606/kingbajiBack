#!/bin/bash
# Deploy to Fly.io - FREE TIER
# Supports: WebSockets, Cron jobs, No timeout

echo "🪂 Deploying to Fly.io..."

# Install Fly CLI if not installed
if ! command -v flyctl &> /dev/null; then
    echo "📦 Installing Fly CLI..."
    curl -L https://fly.io/install.sh | sh
fi

# Login to Fly.io
echo "🔐 Logging in to Fly.io..."
flyctl auth login

# Launch the app (first time)
if [ ! -f "fly.toml" ]; then
    echo "🆕 Creating new Fly.io app..."
    flyctl launch --name kingbaji-backend --region iad --no-deploy
fi

# Set secrets (environment variables)
echo "⚙️ Setting environment variables..."
flyctl secrets set \
  NODE_ENV=production \
  MONGODB_URI="$MONGODB_URI" \
  JWT_SECRET="$JWT_SECRET" \
  JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET" \
  API_OPERATOR_CODE="$API_OPERATOR_CODE" \
  API_SECRET_KEY="$API_SECRET_KEY" \
  API_BASE_URL="$API_BASE_URL" \
  REDIS_URL="$REDIS_URL" \
  CORS_ORIGINS="$CORS_ORIGINS"

# Deploy to Fly.io
echo "🚀 Deploying to Fly.io..."
flyctl deploy

echo "✅ Deployment complete!"
echo "📍 Your backend is live at: https://kingbaji-backend.fly.dev"

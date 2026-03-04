#!/bin/bash
# Railway Deployment Script

echo "🚂 Deploying to Railway..."

# Install Railway CLI if not installed
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Login to Railway
echo "🔐 Logging in to Railway..."
railway login

# Initialize project
echo "🆕 Initializing Railway project..."
railway init --name kingbaji-backend

# Set environment variables
echo "⚙️ Setting environment variables..."
railway variables set \
  NODE_ENV="production" \
  PORT="5000" \
  MONGODB_URI="$MONGODB_URI" \
  JWT_SECRET="$JWT_SECRET" \
  JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET" \
  API_OPERATOR_CODE="$API_OPERATOR_CODE" \
  API_SECRET_KEY="$API_SECRET_KEY" \
  API_BASE_URL="$API_BASE_URL" \
  REDIS_URL="$REDIS_URL" \
  CORS_ORIGINS="$CORS_ORIGINS"

# Deploy
echo "🚀 Deploying to Railway..."
railway up

echo "✅ Deployment complete!"
echo "📍 Your backend is now live at the URL shown above"
echo "🔌 Socket.IO is fully supported"
echo "⏰ Cron jobs will run automatically"

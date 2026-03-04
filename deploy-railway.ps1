# Railway Deployment Script (Windows)

Write-Host "🚂 Deploying to Railway..." -ForegroundColor Cyan

# Install Railway CLI if not installed
if (-not (Get-Command railway -ErrorAction SilentlyContinue)) {
    Write-Host "📦 Installing Railway CLI..." -ForegroundColor Yellow
    npm install -g @railway/cli
}

# Login to Railway
Write-Host "🔐 Logging in to Railway..." -ForegroundColor Cyan
railway login

# Initialize project
Write-Host "🆕 Initializing Railway project..." -ForegroundColor Cyan
railway init --name kingbaji-backend

# Deploy
Write-Host "🚀 Deploying to Railway..." -ForegroundColor Cyan
railway up

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "📍 Your backend is now live"
Write-Host "🔌 Socket.IO is fully supported"
Write-Host "⏰ Cron jobs will run automatically"

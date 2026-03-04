# Deploy to Fly.io - FREE TIER (Windows PowerShell)

Write-Host "🪂 Deploying to Fly.io..." -ForegroundColor Cyan

# Check if Fly CLI is installed
if (-not (Get-Command flyctl -ErrorAction SilentlyContinue)) {
    Write-Host "📦 Installing Fly CLI..." -ForegroundColor Yellow
    Write-Host "Please download from: https://fly.io/docs/hands-on/install-flyctl/" -ForegroundColor Yellow
    Write-Host "Or run: iwr https://fly.io/install.ps1 -useb | iex" -ForegroundColor Yellow
    exit 1
}

# Login to Fly.io
Write-Host "🔐 Logging in to Fly.io..." -ForegroundColor Cyan
flyctl auth login

# Deploy
Write-Host "🚀 Deploying to Fly.io..." -ForegroundColor Cyan
flyctl deploy

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "📍 Your backend is live at: https://kingbaji-backend.fly.dev" -ForegroundColor Cyan

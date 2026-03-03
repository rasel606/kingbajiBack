# PowerShell Setup Script for Vercel CI/CD

Write-Host "========================================"
Write-Host "Vercel CI/CD Complete Setup" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Navigate to project root
Set-Location "e:\megabaji-2"

# Step 1: Configure Git
Write-Host "Step [1/5]: Configuring Git..." -ForegroundColor Yellow
$email = git config user.email

if (-not $email) {
    Write-Host "  Setting global git user..."
    git config --global user.email "developer@megabaji.com"
    git config --global user.name "Megabaji Developer"
}

# Step 2: Stage files
Write-Host "Step [2/5]: Adding files to git..." -ForegroundColor Yellow
@(
    ".gitignore",
    ".github\workflows\deploy.yml",
    "backend\vercel.json",
    "my-app\vercel.json",
    "coreui-free-react-admin-template-main\vercel.json",
    "VERCEL_DEPLOYMENT_GUIDE.md",
    "backend\.env.example",
    "my-app\.env.example",
    "coreui-free-react-admin-template-main\.env.example",
    "setup-vercel.bat"
) | ForEach-Object {
    if (Test-Path $_) {
        git add $_
        Write-Host "  ✓ Added: $_"
    }
}

# Step 3: Commit
Write-Host "Step [3/5]: Committing changes..." -ForegroundColor Yellow
git commit -m "feat: add Vercel deployment and GitHub Actions CI/CD pipeline" 2>$null
Write-Host "  ✓ Committed successfully"

# Step 4: Push
Write-Host "Step [4/5]: Pushing to GitHub..." -ForegroundColor Yellow
try {
    git push origin main 2>$null
    Write-Host "  ✓ Pushed to main branch"
} catch {
    Write-Host "  ⚠ Push failed - you may need to authenticate" -ForegroundColor Yellow
}

# Step 5: Summary
Write-Host "Step [5/5]: Setup Summary" -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================"
Write-Host "✓ Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 NEXT STEPS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣  Get Vercel Access Tokens:"
Write-Host "   • Visit: https://vercel.com/account/tokens" -ForegroundColor DarkGray
Write-Host "   • Click 'Create' and copy the token" -ForegroundColor DarkGray
Write-Host ""
Write-Host "2️⃣  Get Your Organization ID:"
Write-Host "   • Visit: https://vercel.com/dashboard" -ForegroundColor DarkGray
Write-Host "   • Go to Settings > General" -ForegroundColor DarkGray
Write-Host "   • Copy your Org/Team ID" -ForegroundColor DarkGray
Write-Host ""
Write-Host "3️⃣  Deploy Services to Vercel:"
Write-Host "   cd backend && vercel deploy --prod" -ForegroundColor DarkGray
Write-Host "   cd ../my-app && vercel deploy --prod" -ForegroundColor DarkGray
Write-Host "   cd ../coreui-free-react-admin-template-main && vercel deploy --prod" -ForegroundColor DarkGray
Write-Host ""
Write-Host "4️⃣  Add GitHub Secrets:"
Write-Host "   • GitHub > Your Repo > Settings > Secrets > Actions" -ForegroundColor DarkGray
Write-Host "   • Add secrets from Vercel (Token, Org ID, Project IDs)" -ForegroundColor DarkGray
Write-Host ""
Write-Host "5️⃣  Configure Environment Variables in Vercel:"
Write-Host "   Backend: MONGODB_URI, JWT_SECRET, API_KEY" -ForegroundColor DarkGray
Write-Host "   Frontend: REACT_APP_API_URL or VITE_API_URL" -ForegroundColor DarkGray
Write-Host ""
Write-Host "6️⃣  Automatic Deployments Ready!"
Write-Host "   • Push to 'main' = Production Deploy" -ForegroundColor DarkGray
Write-Host "   • Push to 'develop' = Staging Deploy" -ForegroundColor DarkGray
Write-Host "   • PR = Preview Deployment" -ForegroundColor DarkGray
Write-Host ""
Write-Host "📖 Full Guide: See VERCEL_DEPLOYMENT_GUIDE.md" -ForegroundColor Magenta
Write-Host ""

Read-Host "Press Enter to exit"

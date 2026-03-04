@echo off
setlocal enabledelayedexpansion

echo.
echo ========================================
echo Starting Vercel CI/CD Complete Setup
echo ========================================
echo.

cd /d e:\megabaji-2

echo [1/6] Checking Git configuration...
git config user.email >nul 2>&1
if errorlevel 1 (
    echo Git not configured. Setting user...
    git config --global user.email "developer@megabaji.com"
    git config --global user.name "Megabaji Developer"
)

echo [2/6] Adding new files to git...
git add .gitignore
git add .github/workflows/deploy.yml
git add backend/vercel.json
git add my-app/vercel.json
git add coreui-free-react-admin-template-main/vercel.json
git add VERCEL_DEPLOYMENT_GUIDE.md

echo [3/6] Checking git status...
git status

echo.
echo [4/6] Committing changes...
git commit -m "feat: add Vercel deployment and GitHub Actions CI/CD pipeline"

echo.
echo [5/6] Pushing to GitHub...
git push origin main

echo.
echo [6/6] Upload complete!
echo.
echo ========================================
echo Setup Complete! Next Steps:
echo ========================================
echo.
echo 1. Get Vercel Token:
echo    Visit: https://vercel.com/account/tokens
echo    Click "Create" and copy the token
echo.
echo 2. Get Vercel Org ID:
echo    Visit: https://vercel.com/dashboard
echo    Go to Settings ^> General
echo    Copy your Org/Team ID
echo.
echo 3. Deploy each service:
echo    cd backend && vercel deploy --prod
echo    cd ../my-app && vercel deploy --prod
echo    cd ../coreui-free-react-admin-template-main && vercel deploy --prod
echo.
echo 4. Add GitHub Secrets:
echo    Go to: GitHub ^> Your Repo ^> Settings ^> Secrets ^> Actions
echo    Add these secrets:
echo    - VERCEL_TOKEN (from step 1)
echo    - VERCEL_ORG_ID (from step 2)
echo    - VERCEL_PROJECT_ID_BACKEND
echo    - VERCEL_PROJECT_ID_MYAPP
echo    - VERCEL_PROJECT_ID_COREUI
echo.
echo 5. Add Environment Variables in Vercel:
echo    Backend:
echo      - MONGODB_URI
echo      - JWT_SECRET
echo      - API_KEY
echo      - NODE_ENV=production
echo.
echo    Frontends:
echo      - REACT_APP_API_URL (or VITE_API_URL)
echo.
echo 6. GitHub Actions will auto-deploy on push!
echo.
pause

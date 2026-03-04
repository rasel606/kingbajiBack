@echo off
setlocal enabledelayedexpansion

color 0a
echo.
echo ========================================
echo Megabaji Complete Deployment Script
echo ========================================
echo.

cd /d e:\megabaji-2

REM Step 1: Configure Git
echo [STEP 1/4] Configuring Git...
git config --global user.email "developer@megabaji.com"
git config --global user.name "Megabaji Developer"
echo ✓ Git configured
echo.

REM Step 2: Push to GitHub
echo [STEP 2/4] Pushing code to GitHub...
git status
echo.
echo Adding all files...
git add .
echo.
echo Committing changes...
git commit -m "feat: complete Vercel CI/CD setup with deployment configurations"
echo.
echo Pushing to GitHub main branch...
git push origin main
echo ✓ Code pushed to GitHub
echo.

REM Step 3: Deploy Backend
echo [STEP 3/4] Deploying Backend to Vercel...
echo.
echo Navigate to backend directory...
cd backend
echo Installing Vercel CLI globally...
npm install -g vercel --force
echo.
echo Starting Vercel deployment...
echo You may be prompted to login to Vercel
echo.
vercel deploy --prod
echo ✓ Backend deployed
echo.
cd ..

REM Step 4: Deploy My-App Frontend
echo [STEP 4/4a] Deploying My-App Frontend to Vercel...
cd my-app
echo Installing dependencies...
call npm install
echo Building project...
call npm run build
echo.
echo Starting Vercel deployment...
vercel deploy --prod
echo ✓ My-App deployed
cd ..
echo.

REM Step 5: Deploy CoreUI Admin
echo [STEP 4/4b] Deploying CoreUI Admin to Vercel...
cd coreui-free-react-admin-template-main
echo Installing dependencies...
call npm install
echo Building project...
call npm run build
echo.
echo Starting Vercel deployment...
vercel deploy --prod
echo ✓ CoreUI Admin deployed
cd ..
echo.

REM Success Summary
color 0b
echo.
echo ========================================
echo ✓ DEPLOYMENT COMPLETE!
echo ========================================
echo.
color 0a
echo Next Steps:
echo.
echo 1. Check your deployment status:
echo    - GitHub: https://github.com/rasel606/kingbajiBack
echo    - Vercel: https://vercel.com/dashboard
echo.
echo 2. Note your Vercel deployment URLs:
echo    - Backend: https://[project-name].vercel.app
echo    - My-App: https://[project-name].vercel.app
echo    - CoreUI: https://[project-name].vercel.app
echo.
echo 3. Add GitHub Secrets with:
echo    - VERCEL_TOKEN
echo    - VERCEL_ORG_ID
echo    - VERCEL_PROJECT_ID_BACKEND
echo    - VERCEL_PROJECT_ID_MYAPP
echo    - VERCEL_PROJECT_ID_COREUI
echo.
echo 4. Configure Vercel Environment Variables (per project):
echo    Backend: MONGODB_URI, JWT_SECRET, API_KEY, NODE_ENV
echo    Frontends: REACT_APP_API_URL or VITE_API_URL
echo.
echo 5. GitHub Actions will now auto-deploy on future commits!
echo.

pause

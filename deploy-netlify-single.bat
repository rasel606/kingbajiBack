@echo off
REM ============================================
REM Deploy Single Application to Netlify
REM ============================================

echo.
echo ███████████████████████████████████████████
echo     NETLIFY DEPLOYMENT - SINGLE APP
echo ███████████████████████████████████████████
echo.

REM Check if Netlify CLI is installed
where netlify >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Netlify CLI not found!
    echo Please install it first: npm install -g netlify-cli
    pause
    exit /b 1
)

echo [✓] Netlify CLI found
echo.

REM Select application to deploy
echo Select application to deploy:
echo.
echo 1. Backend Server (backend)
echo 2. Affiliate Portal (my-app)
echo 3. Player Frontend (png71-front)
echo 4. Main Admin Panel (coreui-free-react-admin-template-main)
echo 5. Agent Admin Panel (agentPng71)
echo 6. Sub-Admin Panel (SubAdminPng71)
echo 7. Sub-Agent Panel (subAgentPng71)
echo.
set /p APP_CHOICE="Enter choice (1-7): "

if "%APP_CHOICE%"=="1" (
    set APP_DIR=backend
    set APP_NAME=Backend Server
) else if "%APP_CHOICE%"=="2" (
    set APP_DIR=my-app
    set APP_NAME=Affiliate Portal
) else if "%APP_CHOICE%"=="3" (
    set APP_DIR=png71-front
    set APP_NAME=Player Frontend
) else if "%APP_CHOICE%"=="4" (
    set APP_DIR=coreui-free-react-admin-template-main
    set APP_NAME=Main Admin Panel
) else if "%APP_CHOICE%"=="5" (
    set APP_DIR=agentPng71
    set APP_NAME=Agent Admin Panel
) else if "%APP_CHOICE%"=="6" (
    set APP_DIR=SubAdminPng71
    set APP_NAME=Sub-Admin Panel
) else if "%APP_CHOICE%"=="7" (
    set APP_DIR=subAgentPng71
    set APP_NAME=Sub-Agent Panel
) else (
    echo [ERROR] Invalid choice!
    pause
    exit /b 1
)

echo.
echo Select deployment type:
echo 1. Production (--prod)
echo 2. Draft (preview)
echo.
set /p DEPLOY_TYPE="Enter choice (1 or 2): "

if "%DEPLOY_TYPE%"=="1" (
    set DEPLOY_FLAG=--prod
    set DEPLOY_ENV=PRODUCTION
) else (
    set DEPLOY_FLAG=--build
    set DEPLOY_ENV=DRAFT
)

echo.
echo ============================================
echo Deploying %APP_NAME% to %DEPLOY_ENV%
echo ============================================
echo.

cd "%~dp0%APP_DIR%"
call netlify deploy %DEPLOY_FLAG%

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Deployment failed!
    cd "%~dp0"
    pause
    exit /b 1
)

echo.
echo ============================================
echo ✓ %APP_NAME% DEPLOYED SUCCESSFULLY!
echo ============================================
echo.
echo Visit your Netlify dashboard to view deployment:
echo https://app.netlify.com/
echo.

cd "%~dp0"
pause

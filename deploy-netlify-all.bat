@echo off
REM ============================================
REM Deploy All Applications to Netlify
REM ============================================

echo.
echo ███████████████████████████████████████████
echo   NETLIFY DEPLOYMENT - ALL APPLICATIONS
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

REM Ask for deployment type
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
echo Deploying to %DEPLOY_ENV%
echo ============================================
echo.

REM Backend Deployment
echo.
echo [1/7] Deploying Backend Server...
echo ============================================
cd "%~dp0backend"
call netlify deploy %DEPLOY_FLAG%
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Backend deployment failed!
    cd "%~dp0"
    pause
    exit /b 1
)
echo [✓] Backend deployed successfully!
cd "%~dp0"

REM my-app Deployment
echo.
echo [2/7] Deploying Affiliate Portal (my-app)...
echo ============================================
cd "%~dp0my-app"
call netlify deploy %DEPLOY_FLAG%
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] my-app deployment failed!
    cd "%~dp0"
    pause
    exit /b 1
)
echo [✓] my-app deployed successfully!
cd "%~dp0"

REM png71-front Deployment
echo.
echo [3/7] Deploying Player Frontend (png71-front)...
echo ============================================
cd "%~dp0png71-front"
call netlify deploy %DEPLOY_FLAG%
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] png71-front deployment failed!
    cd "%~dp0"
    pause
    exit /b 1
)
echo [✓] png71-front deployed successfully!
cd "%~dp0"

REM CoreUI Admin Deployment
echo.
echo [4/7] Deploying Main Admin Panel (CoreUI)...
echo ============================================
cd "%~dp0coreui-free-react-admin-template-main"
call netlify deploy %DEPLOY_FLAG%
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] CoreUI deployment failed!
    cd "%~dp0"
    pause
    exit /b 1
)
echo [✓] CoreUI deployed successfully!
cd "%~dp0"

REM agentPng71 Deployment
echo.
echo [5/7] Deploying Agent Admin Panel (agentPng71)...
echo ============================================
cd "%~dp0agentPng71"
call netlify deploy %DEPLOY_FLAG%
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] agentPng71 deployment failed!
    cd "%~dp0"
    pause
    exit /b 1
)
echo [✓] agentPng71 deployed successfully!
cd "%~dp0"

REM SubAdminPng71 Deployment
echo.
echo [6/7] Deploying Sub-Admin Panel (SubAdminPng71)...
echo ============================================
cd "%~dp0SubAdminPng71"
call netlify deploy %DEPLOY_FLAG%
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] SubAdminPng71 deployment failed!
    cd "%~dp0"
    pause
    exit /b 1
)
echo [✓] SubAdminPng71 deployed successfully!
cd "%~dp0"

REM subAgentPng71 Deployment
echo.
echo [7/7] Deploying Sub-Agent Panel (subAgentPng71)...
echo ============================================
cd "%~dp0subAgentPng71"
call netlify deploy %DEPLOY_FLAG%
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] subAgentPng71 deployment failed!
    cd "%~dp0"
    pause
    exit /b 1
)
echo [✓] subAgentPng71 deployed successfully!
cd "%~dp0"

echo.
echo ============================================
echo ✓ ALL APPLICATIONS DEPLOYED SUCCESSFULLY!
echo ============================================
echo.
echo Visit your Netlify dashboard to view deployments:
echo https://app.netlify.com/
echo.

pause

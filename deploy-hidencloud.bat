@echo off
REM ###############################################################################
REM HidenCloud Deployment Script for Backend (Windows)
REM Script to deploy BajiCrick Backend to HidenCloud.com
REM ###############################################################################

setlocal enabledelayedexpansion

set PROJECT_NAME=bajicrick-backend
set BACKEND_DIR=%~dp0

cls
echo.
echo ============================================
echo HidenCloud Backend Deployment Script
echo ============================================
echo.

REM Step 1: Check if HidenCloud CLI is installed
echo [1/6] Checking HidenCloud CLI...
where hidencloud >nul 2>nul
if %errorlevel% neq 0 (
    echo HidenCloud CLI not found. Installing globally...
    call npm install -g hidencloud-cli
    if %errorlevel% neq 0 (
        echo Error: Failed to install HidenCloud CLI
        exit /b 1
    )
)
echo [OK] HidenCloud CLI is installed
echo.

REM Step 2: Check authentication
echo [2/6] Checking HidenCloud authentication...
call hidencloud auth:status >nul 2>nul
if %errorlevel% neq 0 (
    echo Please authenticate with HidenCloud:
    call hidencloud auth login
)
echo [OK] Authentication verified
echo.

REM Step 3: Validate project structure
echo [3/6] Validating project structure...
if not exist "%BACKEND_DIR%package.json" (
    echo Error: package.json not found!
    exit /b 1
)
if not exist "%BACKEND_DIR%index.js" (
    echo Error: index.js not found!
    exit /b 1
)
echo [OK] Project structure is valid
echo.

REM Step 4: Install dependencies
echo [4/6] Installing dependencies...
cd /d "%BACKEND_DIR%"
call npm install
if %errorlevel% neq 0 (
    echo Error: Failed to install dependencies
    exit /b 1
)
echo [OK] Dependencies installed
echo.

REM Step 5: Setup HidenCloud project
echo [5/6] Setting up HidenCloud project...
call hidencloud projects:select %PROJECT_NAME% >nul 2>nul
if %errorlevel% neq 0 (
    echo Creating new HidenCloud project: %PROJECT_NAME%
    call hidencloud projects:create %PROJECT_NAME%
    call hidencloud projects:select %PROJECT_NAME%
)
echo [OK] HidenCloud project configured
echo.

REM Step 6: Deploy to HidenCloud
echo [6/6] Deploying to HidenCloud...
call hidencloud deploy --source "%BACKEND_DIR%"
if %errorlevel% neq 0 (
    echo Error: Deployment failed
    exit /b 1
)

echo.
echo ============================================
echo Deployment completed successfully!
echo ============================================
echo.
echo Checking deployment status...
call hidencloud status
echo.

echo Useful commands:
echo   View logs:     hidencloud logs --follow
echo   Check status:  hidencloud status
echo   View metrics:  hidencloud metrics
echo   Environment:   hidencloud env:list
echo.

pause
exit /b 0

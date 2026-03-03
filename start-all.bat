@echo off
echo Starting BajiCrick Applications...
echo.

REM Start Backend Server (Port 5000)
echo [1/3] Starting Backend Server on port 5000...
start "Backend Server" cmd /k "cd /d %~dp0backend && npm start"
timeout /t 5 /nobreak

REM Start CoreUI Admin Panel (Port 5173 - Vite default)
echo [2/3] Starting CoreUI Admin Panel...
start "CoreUI Admin" cmd /k "cd /d %~dp0coreui-free-react-admin-template-main && npm start"
timeout /t 5 /nobreak

REM Start My App Frontend (Port 3000 - React default)
echo [3/3] Starting My App Frontend...
start "My App Frontend" cmd /k "cd /d %~dp0my-app && npm start"

echo.
echo ===============================================
echo All applications are starting!
echo ===============================================
echo Backend Server:     http://localhost:5000
echo CoreUI Admin:       http://localhost:5173
echo My App Frontend:    http://localhost:3000
echo ===============================================
echo.
echo Press any key to exit this window (applications will keep running)
pause

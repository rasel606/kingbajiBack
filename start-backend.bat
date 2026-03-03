@echo off
echo Starting Backend Server...
echo ===============================================
echo Port: 5000
echo API will be available at: http://localhost:5000
echo ===============================================
cd /d %~dp0backend
npm start
pause

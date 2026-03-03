@echo off
echo Starting Sub Admin Panel...
echo ===============================================
echo This will start the sub admin panel using Vite
echo Default Port: 5173
echo Sub Admin Panel: http://localhost:5173
echo ===============================================
cd /d %~dp0subadmin-panel
npm start
pause

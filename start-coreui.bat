@echo off
echo Starting CoreUI Admin Panel...
echo ===============================================
echo This will start the admin panel using Vite
echo Default Port: 5173
echo Admin Panel: http://localhost:5173
echo ===============================================
cd /d %~dp0coreui-free-react-admin-template-main
npm start
pause

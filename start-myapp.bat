@echo off
echo Starting My App Frontend...
echo ===============================================
echo This will start the React application
echo Default Port: 3000
echo Application: http://localhost:3000
echo ===============================================
cd /d %~dp0my-app
npm start
pause

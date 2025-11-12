@echo off
cd /d D:\Uruguay\backend
echo ========================================
echo AgroRed Backend - PRODUCTION MODE
echo ========================================
echo Port: 5000
echo Storage: Cloudflare R2
echo Debug Logs: ENABLED
echo ========================================
echo.
echo Starting backend...
echo.
node dist/app.js
pause


@echo off
cls
echo.
echo ========================================
echo   AgroRed Backend - PRODUCTION MODE
echo ========================================
echo.
echo Configuration:
echo   Port: 5000
echo   Storage: Cloudflare R2
echo   Environment: Production
echo   Debug Logs: ENABLED
echo.
echo ========================================
echo.

cd /d D:\Uruguay\backend
npm run dev

pause


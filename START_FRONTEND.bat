@echo off
cls
echo.
echo ========================================
echo   AgroRed Frontend
echo ========================================
echo.
echo Configuration:
echo   Port: 3000
echo   API URL: http://localhost:5000/api/v1
echo   Images: Direct from Cloudflare R2
echo.
echo ========================================
echo.

cd /d D:\Uruguay\frontend
npm run dev

pause


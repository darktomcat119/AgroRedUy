@echo off
REM AgroRedUy Frontend Setup Script for Windows
REM This script sets up the development environment for the AgroRedUy frontend

echo 🌾 AgroRedUy Frontend Setup
echo ==========================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js version: 
node --version

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Create environment file if it doesn't exist
if not exist .env.local (
    echo 📝 Creating environment file...
    echo NEXT_PUBLIC_API_URL=http://localhost:3003/api/v1 > .env.local
    echo NEXT_PUBLIC_MAP_API_KEY=your-map-api-key >> .env.local
    echo ⚠️  Please edit .env.local file with your API URL and map API key
)

echo.
echo 🎉 Frontend setup completed successfully!
echo.
echo Next steps:
echo 1. Edit .env.local file with your API URL and map API key
echo 2. Run 'npm run dev' to start the development server
echo 3. Visit http://localhost:3000 to see the application
echo.
echo Available commands:
echo   npm run dev          # Start development server
echo   npm run build        # Build for production
echo   npm start            # Start production server
echo   npm test             # Run tests
echo   npm run lint         # Run ESLint
echo.
echo Frontend Features:
echo   ✅ Service creation form
echo   ✅ Booking management
echo   ✅ Admin dashboard
echo   ✅ Content management
echo   ✅ Authentication system
echo   ✅ Mobile-responsive design
echo.
echo Happy coding! 🚀
pause

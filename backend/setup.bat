@echo off
REM AgroRedUy Backend Setup Script for Windows
REM This script sets up the development environment for the AgroRedUy backend

echo 🌾 AgroRedUy Backend Setup
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

REM Check if PostgreSQL is installed
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL is not installed. Please install PostgreSQL 14+ first.
    pause
    exit /b 1
)

echo ✅ PostgreSQL is installed

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Create environment file if it doesn't exist
if not exist .env (
    echo 📝 Creating environment file...
    copy env.example .env
    echo ⚠️  Please edit .env file with your database credentials
)

REM Generate Prisma client
echo 🔧 Generating Prisma client...
call npm run db:generate

REM Create logs directory
if not exist logs mkdir logs

REM Create uploads directory
if not exist uploads mkdir uploads

echo.
echo 🎉 Setup completed successfully!
echo.
echo Next steps:
echo 1. Edit .env file with your database credentials
echo 2. Run 'npm run dev' to start the development server
echo 3. Visit http://localhost:3001/health to check if the server is running
echo.
echo Available commands:
echo   npm run dev          # Start development server
echo   npm run build        # Build for production
echo   npm start            # Start production server
echo   npm test             # Run tests
echo   npm run db:studio    # Open Prisma Studio
echo.
echo API Endpoints:
echo   GET  /health         # Health check
echo   POST /api/v1/auth/register  # User registration
echo   POST /api/v1/auth/login     # User login
echo   GET  /api/v1/services      # Get services
echo   POST /api/v1/services      # Create service (auth required)
echo   GET  /api/v1/bookings      # Get bookings (auth required)
echo   POST /api/v1/bookings      # Create booking (auth required)
echo.
echo Happy coding! 🚀
pause

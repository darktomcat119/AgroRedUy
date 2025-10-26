#!/bin/bash

# AgroRedUy Backend Setup Script
# This script sets up the development environment for the AgroRedUy backend

set -e

echo "🌾 AgroRedUy Backend Setup"
echo "=========================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL 14+ first."
    exit 1
fi

echo "✅ PostgreSQL is installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating environment file..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your database credentials"
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:generate

# Check if database exists
echo "🗄️  Setting up database..."

# Read database URL from .env
if [ -f .env ]; then
    DATABASE_URL=$(grep DATABASE_URL .env | cut -d'=' -f2 | tr -d '"')
    if [ -z "$DATABASE_URL" ]; then
        echo "❌ DATABASE_URL not found in .env file"
        exit 1
    fi
else
    echo "❌ .env file not found"
    exit 1
fi

# Extract database name from URL
DB_NAME=$(echo $DATABASE_URL | sed 's/.*\/\([^?]*\).*/\1/')

# Create database if it doesn't exist
echo "Creating database: $DB_NAME"
createdb $DB_NAME 2>/dev/null || echo "Database already exists"

# Run migrations
echo "🔄 Running database migrations..."
npm run db:migrate

# Seed database
echo "🌱 Seeding database..."
npm run db:seed

# Create logs directory
mkdir -p logs

# Create uploads directory
mkdir -p uploads

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your database credentials"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Visit http://localhost:3001/health to check if the server is running"
echo ""
echo "Available commands:"
echo "  npm run dev          # Start development server"
echo "  npm run build        # Build for production"
echo "  npm start            # Start production server"
echo "  npm test             # Run tests"
echo "  npm run db:studio    # Open Prisma Studio"
echo ""
echo "API Endpoints:"
echo "  GET  /health         # Health check"
echo "  POST /api/v1/auth/register  # User registration"
echo "  POST /api/v1/auth/login     # User login"
echo "  GET  /api/v1/services      # Get services"
echo "  POST /api/v1/services      # Create service (auth required)"
echo "  GET  /api/v1/bookings      # Get bookings (auth required)"
echo "  POST /api/v1/bookings      # Create booking (auth required)"
echo ""
echo "Happy coding! 🚀"

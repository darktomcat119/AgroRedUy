#!/bin/bash

# AgroRedUy Frontend Setup Script
# This script sets up the development environment for the AgroRedUy frontend

set -e

echo "🌾 AgroRedUy Frontend Setup"
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

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create environment file if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating environment file..."
    cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3003/api/v1
NEXT_PUBLIC_MAP_API_KEY=your-map-api-key
EOF
    echo "⚠️  Please edit .env.local file with your API URL and map API key"
fi

echo ""
echo "🎉 Frontend setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local file with your API URL and map API key"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Visit http://localhost:3000 to see the application"
echo ""
echo "Available commands:"
echo "  npm run dev          # Start development server"
echo "  npm run build        # Build for production"
echo "  npm start            # Start production server"
echo "  npm test             # Run tests"
echo "  npm run lint         # Run ESLint"
echo ""
echo "Frontend Features:"
echo "  ✅ Service creation form"
echo "  ✅ Booking management"
echo "  ✅ Admin dashboard"
echo "  ✅ Content management"
echo "  ✅ Authentication system"
echo "  ✅ Mobile-responsive design"
echo ""
echo "Happy coding! 🚀"

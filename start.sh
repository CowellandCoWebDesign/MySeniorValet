#!/bin/bash

# MySeniorValet Platform Startup Script
# This script helps start the platform outside of Replit

set -e

echo "🏠 MySeniorValet Platform Startup"
echo "================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from template..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "📝 Please edit .env file with your configuration before starting the server"
        exit 1
    else
        echo "❌ No .env.example found. Please create .env file manually"
        exit 1
    fi
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    CHROMEDRIVER_SKIP_DOWNLOAD=true npm install
fi

# Check database connection
echo "🗄️  Checking database configuration..."
if ! grep -q "postgresql://" .env; then
    echo "⚠️  No DATABASE_URL found in .env file"
    echo "📝 Please configure your database connection in .env"
    exit 1
fi

# Build the application
echo "🔨 Building the application..."
npm run build

echo "✅ Build complete!"
echo "🚀 Starting MySeniorValet Platform..."
echo ""
echo "📌 The platform will be available at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5000"
echo ""
echo "💡 To stop the server, press Ctrl+C"
echo ""

# Start the application
npm run start
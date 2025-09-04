#!/bin/bash

# MySeniorValet Platform Development Startup Script

set -e

echo "🏠 MySeniorValet Platform - Development Mode"
echo "==========================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating minimal development config..."
    cat > .env << 'EOF'
# Development configuration
DATABASE_URL=postgresql://user:password@localhost:5432/myseniorvalet_dev
NODE_ENV=development
PORT=5000
JWT_SECRET=dev_jwt_secret_change_in_production
SESSION_SECRET=dev_session_secret_change_in_production

# Optional: Add your API keys for full functionality
# OPENAI_API_KEY=your_openai_api_key
# STRIPE_SECRET_KEY=your_stripe_secret_key
# GOOGLE_PLACES_API_KEY=your_google_places_api_key
EOF
    echo "📝 Created .env file with development defaults"
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    CHROMEDRIVER_SKIP_DOWNLOAD=true npm install
fi

echo "🚀 Starting MySeniorValet Platform in Development Mode..."
echo ""
echo "📌 The platform will be available at:"
echo "   Development Server: http://localhost:5000"
echo ""
echo "💡 To stop the server, press Ctrl+C"
echo "🔄 Files will auto-reload when changed"
echo ""

# Start in development mode
npm run dev
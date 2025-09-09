#!/bin/bash

echo "🚀 STARTING MYSENIORVALET IN PRODUCTION MODE"
echo "==========================================="
echo "Version: v3.3"
echo "Date: $(date)"
echo "Environment: PRODUCTION"
echo "==========================================="

# Set production environment
export NODE_ENV=production

# Run the production build
echo "📦 Building for production..."
npm run build

# Start production server
echo "🎯 Starting production server..."
node dist/index.js
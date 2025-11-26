#!/bin/bash
# Deployment build script - syncs database schema and builds the application

echo "🔄 Step 1: Syncing database schema..."
npm run db:push

if [ $? -ne 0 ]; then
    echo "⚠️ Database schema push failed, but continuing with build..."
fi

echo "📦 Step 2: Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Deployment build completed successfully!"
else
    echo "❌ Build failed!"
    exit 1
fi

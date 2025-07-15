# Mapbox Token Issue - Help Needed

## Problem
Frontend shows "configuration required" for Mapbox. Server has correct token, frontend loads old cached token.

## Evidence
- Server environment: `MAPBOX_ACCESS_TOKEN=sk.eyJ1Ijo...` (correct)
- Frontend console: `pk.eyJ1IjoidHJ1ZXZpZ...` (old token)
- `process.env.VITE_MAPBOX_ACCESS_TOKEN` returns UNDEFINED

## Current Setup
- Replit environment
- Vite runs in middleware mode inside Express server
- Cannot modify vite.config.ts (forbidden)
- Frontend loads token: `import.meta.env.VITE_MAPBOX_ACCESS_TOKEN`

## Files
**.env**: `VITE_MAPBOX_ACCESS_TOKEN=sk.eyJ1Ijo...`
**Frontend**: `const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'fallback';`

## Attempted Solutions (Failed)
- Updated Replit Secrets
- Created .env file with VITE_ prefix
- Cleared Vite cache (rm -rf node_modules/.vite)
- Multiple application restarts
- All failed - frontend still loads old token

## Question
How do I get the server environment variable to reach the Vite frontend in this Replit middleware setup? The token exists on server but import.meta.env.VITE_MAPBOX_ACCESS_TOKEN is undefined.
// Version endpoint to force cache updates
import { Router } from 'express';
import { CURRENT_VERSION } from './cache-buster';

const router = Router();

// Version check endpoint
router.get('/api/version', (req, res) => {
  res.json({
    version: CURRENT_VERSION,
    timestamp: Date.now(),
    environment: process.env.NODE_ENV,
    communityCount: 26306,
    message: 'MySeniorValet v2.0 - 26,306+ communities',
    cache: {
      mustRevalidate: true,
      noCache: true,
      noStore: true
    }
  });
});

// Force refresh endpoint
router.post('/api/force-refresh', (req, res) => {
  // Send headers to force browser refresh
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'X-Force-Refresh': 'true'
  });
  
  res.json({
    success: true,
    message: 'Cache cleared, please refresh your browser',
    newVersion: Date.now()
  });
});

export default router;
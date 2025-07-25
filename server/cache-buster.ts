// Cache busting middleware for development
import { Request, Response, NextFunction } from 'express';

export const CURRENT_VERSION = Date.now().toString();

export function cacheBuster(req: Request, res: Response, next: NextFunction) {
  // Add version to all responses
  res.set('X-App-Version', CURRENT_VERSION);
  res.set('X-Timestamp', Date.now().toString());
  
  // For API responses, add version to JSON
  if (req.path.startsWith('/api/')) {
    const originalJson = res.json;
    res.json = function(data: any) {
      if (typeof data === 'object' && data !== null) {
        data._version = CURRENT_VERSION;
        data._timestamp = Date.now();
      }
      return originalJson.call(this, data);
    };
  }
  
  next();
}

export function devModeHeaders(req: Request, res: Response, next: NextFunction) {
  if (process.env.NODE_ENV === 'development') {
    // Force browser to always fetch fresh content
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate, private',
      'Pragma': 'no-cache',
      'Expires': '-1',
      'X-Dev-Mode': 'true',
      'X-No-Cache': Date.now().toString()
    });
  }
  next();
}
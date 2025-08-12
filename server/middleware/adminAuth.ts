import { Request, Response, NextFunction } from 'express';

/**
 * Simple admin authentication middleware
 * In production, this should verify admin permissions
 */
export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  // For development, allow all requests
  // In production, this should check for admin role/permissions
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  // Check if user is authenticated and has admin role
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // For now, allow authenticated users
  // In production, add proper role checking
  next();
};
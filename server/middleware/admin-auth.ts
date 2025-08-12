import { Request, Response, NextFunction } from 'express';

// Admin authentication middleware
export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  // In development, allow access for testing
  // In production, this should check for proper admin authentication
  
  // Check if user is authenticated (you would implement proper auth here)
  const isAdmin = true; // For testing purposes
  
  if (isAdmin) {
    next();
  } else {
    res.status(403).json({ error: 'Admin access required' });
  }
};

// Alias for backward compatibility
export const requireAdmin = adminAuth;

// Super admin authentication middleware
export const superAdminAuth = (req: Request, res: Response, next: NextFunction) => {
  // Check for super admin access
  const isSuperAdmin = true; // For testing purposes
  
  if (isSuperAdmin) {
    next();
  } else {
    res.status(403).json({ error: 'Super admin access required' });
  }
};
import { Request, Response, NextFunction } from 'express';

// Basic auth middleware for authenticated users
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  next();
};

// Admin auth middleware - requires admin or super_admin role
export const requireAdminAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  const user = req.user as any;
  if (!user || !['admin', 'super_admin'].includes(user.role)) {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }

  next();
};

// Super admin auth middleware - requires super_admin role only
export const requireSuperAdminAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  const user = req.user as any;
  if (!user || user.role !== 'super_admin') {
    return res.status(403).json({ success: false, error: 'Super admin access required' });
  }

  next();
};
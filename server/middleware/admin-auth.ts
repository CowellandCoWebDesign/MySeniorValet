import { Request, Response, NextFunction } from 'express';

// Super admin emails from configuration
const SUPER_ADMIN_EMAILS = [
  'william.cowell01@gmail.com',
  'cowellandcowebdesign@gmail.com'
];

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  // Check if user is authenticated
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'You must be logged in to access this resource'
    });
  }

  const user = req.user as any;
  
  // Check if user exists
  if (!user) {
    return res.status(401).json({ 
      error: 'User not found',
      message: 'No user session found'
    });
  }

  // Check if user is super admin by email
  const userEmail = user.email?.toLowerCase();
  const isSuperAdmin = SUPER_ADMIN_EMAILS.some(
    adminEmail => adminEmail.toLowerCase() === userEmail
  );

  // Check if user has admin role or is super admin
  if (!user.isAdmin && !user.role?.includes('admin') && !isSuperAdmin) {
    return res.status(403).json({ 
      error: 'Access denied',
      message: 'This resource requires administrator privileges'
    });
  }

  // Grant access
  next();
}

export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  // Check if user is authenticated
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'You must be logged in to access this resource'
    });
  }

  const user = req.user as any;
  
  // Check if user exists
  if (!user) {
    return res.status(401).json({ 
      error: 'User not found',
      message: 'No user session found'
    });
  }

  // Check if user is super admin by email
  const userEmail = user.email?.toLowerCase();
  const isSuperAdmin = SUPER_ADMIN_EMAILS.some(
    adminEmail => adminEmail.toLowerCase() === userEmail
  );

  if (!isSuperAdmin) {
    return res.status(403).json({ 
      error: 'Access denied',
      message: 'This resource requires super administrator privileges'
    });
  }

  // Grant access
  next();
}
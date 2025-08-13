/**
 * Custom Authentication Middleware
 * Replaces Replit Auth with our custom email/password system
 */

import { RequestHandler } from 'express';

// Check if user is authenticated
export const isAuthenticated: RequestHandler = (req, res, next) => {
  if ((req.session as any)?.userId) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

// Check if user is admin
export const isAdmin: RequestHandler = (req, res, next) => {
  const user = (req.session as any)?.user;
  if (user && (user.role === 'admin' || user.role === 'super_admin')) {
    return next();
  }
  return res.status(403).json({ message: "Admin access required" });
};

// Check for specific role
export const checkRole = (requiredRole: string): RequestHandler => {
  return (req, res, next) => {
    const user = (req.session as any)?.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Super admin can access everything
    if (user.role === 'super_admin') {
      return next();
    }
    
    // Check if user has the required role
    if (user.role === requiredRole) {
      return next();
    }
    
    return res.status(403).json({ message: `${requiredRole} access required` });
  };
};

// Create authenticated session (for payment flows)
export const createAuthenticatedSession = async (req: any, userId: number) => {
  const { db } = await import('./db');
  const { users } = await import('../shared/schema');
  const { eq } = await import('drizzle-orm');
  
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
    
  if (user) {
    req.session.userId = user.id;
    req.session.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
  }
};

// Alias for backwards compatibility
export const requireAuth = isAuthenticated;
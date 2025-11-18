/**
 * Authentication Middleware Compatibility Layer
 * Bridges Replit Auth with existing route handlers that expect session-based auth
 */

import { RequestHandler } from 'express';
import { isAuthenticated as replitIsAuthenticated } from './replitAuth';
import { storage } from './storage';

// Middleware to hydrate full user data from database after Replit Auth
export const attachDbUser: RequestHandler = async (req, res, next) => {
  // Replit Auth sets req.user with claims containing the user ID
  if ((req as any).user?.claims?.sub) {
    try {
      const replitUserId = (req as any).user.claims.sub; // This is the Replit sub claim
      
      // First try to get user by authId (for users already linked to Replit)
      const fullUser = await storage.getUserByAuthId(replitUserId.toString());
      
      if (fullUser) {
        // Update req.user with full database user object
        (req as any).user = {
          ...fullUser,
          claims: (req as any).user.claims, // Keep the original claims
          access_token: (req as any).user.access_token,
          refresh_token: (req as any).user.refresh_token,
          expires_at: (req as any).user.expires_at
        };
        
        // Also set on session for backward compatibility
        if ((req as any).session) {
          (req as any).session.userId = fullUser.id;
          (req as any).session.user = fullUser;
        }
      } else {
        // User not found in database - this shouldn't happen if upsertUser worked
        console.warn(`User with Replit ID ${replitUserId} not found in database`);
      }
    } catch (error) {
      console.error('Error hydrating user data:', error);
      // Continue without full user data - let route handlers decide what to do
    }
  }
  next();
};

// Check if user is authenticated (compatible with both Replit Auth and session)
export const isAuthenticated: RequestHandler = (req, res, next) => {
  // First try Replit Auth - check for claims.sub which contains the user ID
  if ((req as any).user?.claims?.sub || (req as any).user?.expires_at) {
    return next();
  }
  
  // Check if user has been hydrated from database
  if ((req as any).user?.id && (req as any).user?.authId) {
    return next();
  }
  
  // Fallback to session (for transition period)
  if ((req as any).session?.userId) {
    return next();
  }
  
  return res.status(401).json({ message: "Unauthorized" });
};

// Check if user is admin
export const isAdmin: RequestHandler = (req, res, next) => {
  const user = (req as any).user || (req as any).session?.user;
  
  if (user && (user.role === 'admin' || user.role === 'super_admin')) {
    return next();
  }
  
  return res.status(403).json({ message: "Admin access required" });
};

// Check for specific role
export const checkRole = (requiredRole: string): RequestHandler => {
  return (req, res, next) => {
    const user = (req as any).user || (req as any).session?.user;
    
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

// Create authenticated session (for payment flows and special cases)
export const createAuthenticatedSession = async (req: any, userId: number) => {
  const fullUser = await storage.getUserById(userId);
  
  if (fullUser) {
    req.user = {
      id: fullUser.id,
      email: fullUser.email,
      firstName: fullUser.firstName,
      lastName: fullUser.lastName,
      role: fullUser.role,
      authId: fullUser.authId,
      ...fullUser
    };
    
    if (req.session) {
      req.session.userId = fullUser.id;
      req.session.user = req.user;
    }
  }
};

// Alias for backwards compatibility with existing routes
export const requireAuth = isAuthenticated;

// Re-export Replit Auth's isAuthenticated for direct use if needed
export { replitIsAuthenticated };
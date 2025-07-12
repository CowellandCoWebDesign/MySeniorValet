/**
 * Admin Protection System
 * Prevents unauthorized database modifications
 * Requires creator/admin key for destructive operations
 */

import { Request, Response, NextFunction } from 'express';

// Environment variable for admin key
const ADMIN_KEY = process.env.ADMIN_KEY || process.env.CREATOR_KEY;

// Destructive operations that require admin authorization
const DESTRUCTIVE_OPERATIONS = [
  'DROP',
  'DELETE',
  'TRUNCATE',
  'ALTER',
  'UPDATE',
  'REPLACE',
  'CLEAR',
  'RESET',
  'REMOVE',
  'DESTROY'
];

// Routes that require admin authorization
const PROTECTED_ROUTES = [
  '/api/admin/database/clear',
  '/api/admin/database/reset',
  '/api/admin/database/seed',
  '/api/admin/database/drop',
  '/api/admin/communities/delete',
  '/api/admin/communities/update-all',
  '/api/admin/communities/clear',
  '/api/admin/system/reset'
];

export interface AdminProtectedRequest extends Request {
  adminAuthorized?: boolean;
  adminKey?: string;
}

/**
 * Middleware to protect admin routes
 */
export const requireAdminKey = (req: AdminProtectedRequest, res: Response, next: NextFunction) => {
  const providedKey = req.headers['x-admin-key'] || req.headers['x-creator-key'] || req.query.adminKey || req.body.adminKey;

  if (!ADMIN_KEY) {
    return res.status(500).json({
      error: 'Admin Protection Not Configured',
      message: 'ADMIN_KEY or CREATOR_KEY environment variable not set',
      code: 'ADMIN_KEY_MISSING'
    });
  }

  if (!providedKey || providedKey !== ADMIN_KEY) {
    console.warn(`🚨 UNAUTHORIZED ADMIN ACCESS ATTEMPT: ${req.ip} tried to access ${req.path}`);
    return res.status(403).json({
      error: 'Unauthorized',
      message: 'Valid admin/creator key required for this operation',
      code: 'ADMIN_KEY_REQUIRED',
      hint: 'Provide admin key in X-Admin-Key header or adminKey parameter'
    });
  }

  req.adminAuthorized = true;
  req.adminKey = providedKey as string;
  console.log(`✅ ADMIN ACCESS GRANTED: ${req.ip} accessing ${req.path}`);
  next();
};

/**
 * Check if a SQL query contains destructive operations
 */
export const containsDestructiveOperation = (sql: string): boolean => {
  const upperSQL = sql.toUpperCase();
  return DESTRUCTIVE_OPERATIONS.some(op => upperSQL.includes(op));
};

/**
 * Middleware to protect SQL queries
 */
export const protectSQLQueries = (req: AdminProtectedRequest, res: Response, next: NextFunction) => {
  if (req.body.sql_query || req.body.query || req.query.sql) {
    const query = req.body.sql_query || req.body.query || req.query.sql;
    
    if (containsDestructiveOperation(query)) {
      if (!req.adminAuthorized) {
        console.warn(`🚨 UNAUTHORIZED SQL OPERATION: ${req.ip} tried to execute: ${query.substring(0, 100)}...`);
        return res.status(403).json({
          error: 'Destructive SQL Operation Blocked',
          message: 'Admin/creator key required for destructive SQL operations',
          code: 'DESTRUCTIVE_SQL_BLOCKED',
          operation: query.substring(0, 100),
          hint: 'Provide admin key in X-Admin-Key header'
        });
      }
      
      console.log(`⚠️  ADMIN SQL OPERATION: ${req.adminKey} executing: ${query.substring(0, 100)}...`);
    }
  }
  
  next();
};

/**
 * Check if a route is protected
 */
export const isProtectedRoute = (path: string): boolean => {
  return PROTECTED_ROUTES.some(route => path.includes(route));
};

/**
 * Global admin protection middleware
 */
export const adminProtection = (req: AdminProtectedRequest, res: Response, next: NextFunction) => {
  // Check if this is a protected route
  if (isProtectedRoute(req.path)) {
    return requireAdminKey(req, res, next);
  }
  
  // Check for destructive SQL operations
  if (req.body.sql_query || req.body.query || req.query.sql) {
    return protectSQLQueries(req, res, next);
  }
  
  next();
};

/**
 * Create admin-protected route handler
 */
export const createProtectedRoute = (handler: (req: AdminProtectedRequest, res: Response, next: NextFunction) => void) => {
  return [requireAdminKey, handler];
};

/**
 * Log admin operations for audit trail
 */
export const logAdminOperation = (req: AdminProtectedRequest, operation: string, details?: any) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    ip: req.ip,
    adminKey: req.adminKey ? `${req.adminKey.substring(0, 8)}...` : 'unknown',
    operation,
    path: req.path,
    method: req.method,
    details,
    userAgent: req.headers['user-agent']
  };
  
  console.log(`📝 ADMIN OPERATION LOG:`, JSON.stringify(logEntry, null, 2));
  
  // In production, you might want to write this to a file or database
  // fs.appendFileSync('admin-operations.log', JSON.stringify(logEntry) + '\n');
};

export default {
  requireAdminKey,
  containsDestructiveOperation,
  protectSQLQueries,
  isProtectedRoute,
  adminProtection,
  createProtectedRoute,
  logAdminOperation
};
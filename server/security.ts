import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Security configuration
const SECURITY_CONFIG = {
  rateLimiting: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 300, // per window - increased for normal browsing
    apiMaxRequests: 200, // for API endpoints - increased for communities data
    authMaxRequests: 50, // for auth endpoints - increased for demo testing
  },
  headers: {
    contentSecurityPolicy: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://api.mapbox.com; img-src 'self' data: https: blob:; connect-src 'self' https: https://api.mapbox.com https://events.mapbox.com; font-src 'self' data:;",
    hsts: 'max-age=31536000; includeSubDomains; preload',
  }
};

// Rate limiting middleware
export function createRateLimit(maxRequests: number = SECURITY_CONFIG.rateLimiting.maxRequests) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip rate limiting for static files and main app routes
    if (req.path.startsWith('/src/') || 
        req.path.startsWith('/@') || 
        req.path === '/' || 
        req.path === '/search' || 
        req.path === '/community' ||
        req.path.startsWith('/community/') ||
        req.path.endsWith('.js') || 
        req.path.endsWith('.css') || 
        req.path.endsWith('.map') ||
        req.path.includes('vite') ||
        req.path.includes('hmr') ||
        req.path === '/api/search/suggestions') {
      return next();
    }
    
    const clientId = req.ip || 'unknown';
    const now = Date.now();
    const windowMs = SECURITY_CONFIG.rateLimiting.windowMs;
    
    const clientData = rateLimitStore.get(clientId) || { count: 0, resetTime: now + windowMs };
    
    // Reset if window expired
    if (now > clientData.resetTime) {
      clientData.count = 0;
      clientData.resetTime = now + windowMs;
    }
    
    clientData.count++;
    rateLimitStore.set(clientId, clientData);
    
    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - clientData.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(clientData.resetTime / 1000));
    
    if (clientData.count > maxRequests) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
      });
    }
    
    next();
  };
}

// Security headers middleware
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Basic security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // HSTS for HTTPS
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', SECURITY_CONFIG.headers.hsts);
  }
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', SECURITY_CONFIG.headers.contentSecurityPolicy);
  
  // Remove server identification
  res.removeHeader('X-Powered-By');
  
  next();
}

// Input sanitization middleware
export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      // Remove potential XSS patterns
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
    }
    
    if (obj && typeof obj === 'object') {
      if (Array.isArray(obj)) {
        return obj.map(sanitize);
      } else {
        const sanitized: any = {};
        for (const [key, value] of Object.entries(obj)) {
          sanitized[key] = sanitize(value);
        }
        return sanitized;
      }
    }
    
    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }
  
  if (req.query) {
    req.query = sanitize(req.query);
  }
  
  next();
}

// Comprehensive input validation middleware
export function validateInput(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));
        
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Invalid input data',
          details: errors
        });
      }
      
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid input format'
      });
    }
  };
}

// SQL injection protection
export function sqlInjectionProtection(req: Request, res: Response, next: NextFunction) {
  // Skip photo proxy endpoint - Google photo references are legitimate
  if (req.path === '/api/images/photo-proxy') {
    return next();
  }
  
  // Skip search suggestions endpoint - legitimate search queries
  if (req.path === '/api/search/suggestions') {
    console.log('Skipping SQL injection protection for search suggestions');
    return next();
  }

  const suspiciousPatterns = [
    // Modified: Allow legitimate apostrophes in names like "Frye's Care Home"
    /(';)|(\';)|(;)|(--)|(\s(OR|AND)\s.*(=|LIKE))/i,
    /(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)\s/i,
    /(\bEXEC\b|\bEXECUTE\b)/i,
    /(\bSP_\w+)/i
  ];
  
  const checkForSQLInjection = (value: any): boolean => {
    if (typeof value === 'string') {
      return suspiciousPatterns.some(pattern => pattern.test(value));
    }
    
    if (value && typeof value === 'object') {
      return Object.values(value).some(checkForSQLInjection);
    }
    
    return false;
  };
  
  // Check body, query, and params
  const suspicious = [req.body, req.query, req.params].some(checkForSQLInjection);
  
  if (suspicious) {
    console.warn('Potential SQL injection attempt detected:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
      body: req.body,
      query: req.query
    });
    
    return res.status(400).json({
      error: 'Invalid Request',
      message: 'Request contains potentially harmful content'
    });
  }
  
  next();
}

// Request logging for security monitoring
export function securityLogger(req: Request, res: Response, next: NextFunction) {
  const sensitiveEndpoints = ['/api/auth', '/api/admin', '/api/user'];
  const isSensitive = sensitiveEndpoints.some(endpoint => req.path.startsWith(endpoint));
  
  if (isSensitive) {
    console.log('Security Log:', {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      method: req.method,
      path: req.path,
      userAgent: req.get('User-Agent'),
      referer: req.get('Referer'),
      // Don't log actual body content for privacy
      hasBody: !!req.body && Object.keys(req.body).length > 0
    });
  }
  
  next();
}

// CORS configuration for production
export function corsPolicy(req: Request, res: Response, next: NextFunction) {
  const allowedOrigins = [
    'https://7a9daf58-f7c7-49c7-b4de-a709c13987b5-00-3l1b8tvcpa4bp.janeway.replit.dev',
    'http://localhost:5000',
    'http://127.0.0.1:5000'
  ];
  
  const origin = req.headers.origin;
  
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
}

// Session security enhancement - sets secure cookie options
export function enhanceSessionSecurity(req: Request, res: Response, next: NextFunction) {
  // Add security headers for auth endpoints
  if (req.path.includes('/auth/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  next();
}

// Cleanup expired rate limit entries
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes
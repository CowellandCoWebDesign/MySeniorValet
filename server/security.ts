import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { auditService } from './audit';

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
    contentSecurityPolicy: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://checkout.stripe.com; style-src 'self' 'unsafe-inline' https://api.mapbox.com https://fonts.googleapis.com; img-src 'self' data: https: blob:; connect-src 'self' https: https://api.mapbox.com https://events.mapbox.com https://api.stripe.com; font-src 'self' data: https://fonts.gstatic.com; frame-src 'self' https://js.stripe.com https://checkout.stripe.com;",
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
        req.path === '/api/search/suggestions' ||
        req.path.startsWith('/api/communities/search') ||
        req.path.startsWith('/api/communities/by-location') ||
        req.path.startsWith('/api/communities/count') ||
        req.path.startsWith('/api/communities/trending') ||
        req.path.startsWith('/api/communities/coastal') ||
        req.path.startsWith('/api/communities/clusters') ||
        req.path.includes('/spatial') ||
        req.path.endsWith('/spatial')) {
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
  
  // Enhanced Content Security Policy with better coverage
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://checkout.stripe.com https://www.googletagmanager.com https://www.google-analytics.com https://maps.googleapis.com https://cdn.platform.openai.com https://replit.com",
    "style-src 'self' 'unsafe-inline' https://api.mapbox.com https://fonts.googleapis.com https://unpkg.com",
    "img-src 'self' data: https: blob: https://cdn.pixabay.com https://images.unsplash.com https://lh3.googleusercontent.com https://*.stripe.com",
    "connect-src 'self' https: wss: ws: https://api.perplexity.ai https://api.anthropic.com https://api.openai.com https://www.google-analytics.com https://maps.googleapis.com https://api.stripe.com https://checkout.stripe.com https://cdn.platform.openai.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "frame-src 'self' https://js.stripe.com https://checkout.stripe.com https://hooks.stripe.com https://www.youtube.com https://www.google.com",
    "object-src 'none'",
    "media-src 'self' https:",
    "child-src 'self' blob:",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "form-action 'self'",
    "base-uri 'self'",
    "frame-ancestors 'none'"
  ].join('; ');
  
  res.setHeader('Content-Security-Policy', csp);
  
  // Remove server identification
  res.removeHeader('X-Powered-By');
  
  next();
}

// Enhanced input sanitization middleware with XSS and SQL injection protection
export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  // Certain trusted admin endpoints send SQL-keyword strings as legitimate enum values
  // (e.g. action:"delete").  XSS protection still runs; only the SQL keyword stripping
  // block is bypassed for these fully-authenticated, explicitly listed admin routes.
  const skipSqlPatterns = (
    req.path === '/api/admin/communities/bulk' ||
    req.path === '/api/admin/communities/bulk-quality-action' ||
    (req.method === 'POST' && /^\/api\/admin\/communities\/\d+\/hide$/.test(req.path)) ||
    (req.method === 'DELETE' && /^\/api\/admin\/communities\/\d+$/.test(req.path))
  );

  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      // Enhanced XSS protection patterns
      let cleaned = obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
        .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/vbscript:/gi, '')
        .replace(/data:text\/html/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .replace(/eval\(/gi, '')
        .replace(/setTimeout\(/gi, '')
        .replace(/setInterval\(/gi, '')
        .replace(/alert\(/gi, '')
        .replace(/confirm\(/gi, '')
        .replace(/prompt\(/gi, '')
        .trim();
      
      if (!skipSqlPatterns) {
        // SQL injection protection patterns
        const sqlPatterns = [
          /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|UNION|EXEC|EXECUTE)\b)/gi,
          /(';|";|--|\*\/|xp_|sp_)/gi,
          /(\bOR\b\s*\d+\s*=\s*\d+)/gi,
          /(\bAND\b\s*\d+\s*=\s*\d+)/gi,
          /(\bOR\b\s*'[^']*'\s*=\s*'[^']*')/gi,
          /(\bAND\b\s*'[^']*'\s*=\s*'[^']*')/gi
        ];
        
        for (const pattern of sqlPatterns) {
          if (pattern.test(cleaned)) {
            console.warn(`[SECURITY] Potential SQL injection blocked: ${req.method} ${req.path} - Pattern: ${cleaned.substring(0, 100)}`);
            cleaned = cleaned.replace(pattern, '');
          }
        }
      }
      
      return cleaned;
    }
    
    if (obj && typeof obj === 'object') {
      if (Array.isArray(obj)) {
        return obj.map(sanitize);
      } else {
        const sanitized: any = {};
        for (const [key, value] of Object.entries(obj)) {
          // Sanitize keys to prevent prototype pollution
          const sanitizedKey = typeof key === 'string' ? key.replace(/[^\w\s-_.]/gi, '') : key;
          sanitized[sanitizedKey] = sanitize(value);
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
  // Skip photo proxy endpoints - External photo references are legitimate
  if (req.path === '/api/images/photo-proxy' || req.path === '/api/image-proxy') {
    return next();
  }
  
  // Skip all search endpoints - legitimate search queries
  if (req.path.startsWith('/api/search')) {
    return next();
  }

  // Skip Perplexity community insights endpoint - legitimate community search
  if (req.path === '/api/perplexity/community-insights') {
    console.log('Skipping SQL injection protection for Perplexity community insights');
    return next();
  }

  // Skip emergency contact endpoint - critical safety feature
  if (req.path === '/api/emergency/contact') {
    console.log('Skipping SQL injection protection for emergency contact - safety critical');
    return next();
  }

  // Skip service intelligence endpoint - business names with special characters are legitimate
  if (req.path === '/api/service-intelligence') {
    console.log('Skipping SQL injection protection for service intelligence - business names with special characters');
    return next();
  }
  
  // Skip global discovery endpoint - business names often have parentheses like "Hotel Name (Adult Only)"
  if (req.path === '/api/global-discovery/search' || req.path === '/api/nlp/search' || req.path === '/api/search/unified') {
    console.log('Skipping SQL injection protection for discovery/search - business names can have parentheses');
    return next();
  }

  const suspiciousPatterns = [
    // Enhanced SQL injection patterns
    /(';)|(\';)|(;)|(--)|(\s(OR|AND)\s.*(=|LIKE))/i,
    /(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)\s/i,
    /(\bEXEC\b|\bEXECUTE\b)/i,
    /(\bSP_\w+)/i,
    // XSS patterns
    /(<script|<\/script>|javascript:|vbscript:|onload=|onerror=|eval\(|alert\()/i,
    // Command injection patterns (exclude standalone & for business names)
    /(\||;|&&|`|\$\(|exec|system|shell_exec|passthru)/i,
    // LDAP injection patterns
    /(\*\)|&\(|\|\(|\(cn=|\(uid=|\(mail=)/i,
    // NoSQL injection patterns
    /(\$where|\$ne|\$in|\$nin|\$or|\$and|\$not|\$nor|\$exists|\$type|\$mod|\$regex|\$text|\$search)/i
  ];
  
  const checkForSQLInjection = (value: any): boolean => {
    if (typeof value === 'string') {
      // Allow HTML entities for legitimate business names (e.g., "Hinshaw & Culbertson LLP" becomes "Hinshaw &amp; Culbertson LLP")
      // Skip checks if it's just a business name with HTML entities
      const decodedValue = value.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'");
      
      // Check if this is likely a business name (contains letters and common business characters)
      const isLikelyBusinessName = /^[A-Za-z0-9\s&',\.\-]+$/.test(decodedValue);
      if (isLikelyBusinessName && value.length < 200) {
        return false; // Allow legitimate business names
      }
      
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
    console.warn('🚨 CRITICAL SECURITY THREAT DETECTED:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
      body: req.body,
      query: req.query,
      timestamp: new Date().toISOString(),
      severity: 'HIGH',
      threatType: 'INJECTION_ATTEMPT'
    });
    
    // Log to security audit
    try {
      auditService.logSuspiciousActivity(req, 'Injection attack detected', {
        patterns: suspiciousPatterns.map(p => p.source),
        requestData: { body: req.body, query: req.query },
        severity: 'HIGH'
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
    
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
  
  if (isSensitive && process.env.NODE_ENV !== 'production') {
    console.log('Security Log:', {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      method: req.method,
      path: req.path,
      userAgent: req.get('User-Agent'),
      referer: req.get('Referer'),
      hasBody: !!req.body && Object.keys(req.body).length > 0
    });
  }
  
  next();
}

// CORS configuration for production
export function corsPolicy(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers.origin;
  
  // Allow all Replit domains and local development
  const isAllowedOrigin = origin && (
    origin.includes('.replit.dev') ||
    origin.includes('.repl.co') ||
    origin.includes('.replit.app') || // Added support for Replit app domains
    origin.includes('localhost') ||
    origin.includes('127.0.0.1') ||
    origin === 'https://myseniorvalet.com' || 
    origin === 'https://www.myseniorvalet.com' ||
    origin === 'https://myseniorvalet.replit.app' || // Explicitly allow production domain
    origin === 'https://MySeniorValet.replit.app' // Case-sensitive variant
  );
  
  if (isAllowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    // Allow requests with no origin (like from the same domain)
    res.setHeader('Access-Control-Allow-Origin', '*');
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
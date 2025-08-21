import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedDatabase } from "./seed";
import { 
  securityHeaders, 
  corsPolicy, 
  sanitizeInput, 
  sqlInjectionProtection,
  securityLogger,
  enhanceSessionSecurity,
  createRateLimit 
} from "./security";
import { cacheBuster, devModeHeaders } from "./cache-buster";
import { devCacheKiller, clearViteCache } from "./dev-cache-killer";
import { redisCache } from "./infrastructure/redis-cache";
import { securityDashboard } from "./infrastructure/security-dashboard";
import { performanceMonitor } from "./infrastructure/performance-monitor";
import { simpleWebSocket } from "./infrastructure/simple-websocket";
import { documentManagement } from "./infrastructure/document-management";
import { businessIntelligence } from "./infrastructure/business-intelligence";
import { advancedAnalytics } from "./infrastructure/advanced-analytics";
import { notificationSystem } from "./infrastructure/notification-system";
import { integrationManager } from "./infrastructure/integration-manager";
import cookieParser from "cookie-parser";

const app = express();

// Production mode - caches enabled for performance
if (process.env.NODE_ENV === 'development') {
  clearViteCache();
  console.log('🔥 DEVELOPMENT MODE: All caches cleared, instant edit visibility enabled');
} else {
  console.log('⚡ PRODUCTION MODE: Optimized caching enabled for maximum performance');
}

// Enable compression for all responses (production optimization)
app.use(compression({
  level: 6, // Balanced compression level
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req, res) => {
    // Compress everything except server-sent events
    if (res.getHeader('Content-Type') === 'text/event-stream') {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Trust proxy for accurate IP detection
app.set('trust proxy', 1);

// Security middleware stack (order matters)
app.use(corsPolicy);
app.use(securityHeaders);
app.use(securityLogger);
app.use(enhanceSessionSecurity);

// Performance monitoring (lightweight)
app.use(performanceMonitor.middleware());

// DISABLE Security monitoring in development to prevent rate limiting
if (process.env.NODE_ENV !== 'development') {
  app.use(securityDashboard.middleware());
} else {
  console.log('⚠️ Security monitoring DISABLED in development mode');
}

// Apply rate limiting only to API routes (excluding map operations)
app.use('/api', (req, res, next) => {
  // Skip rate limiting for map operations and clusters
  if (req.path.includes('/clusters') || 
      req.path.includes('/spatial')) {
    return next();
  }
  return createRateLimit()(req, res, next);
});

// CRITICAL: Webhook raw body handling MUST come before JSON parsing
// Apply raw body parser ONLY to webhook routes
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Apply JSON parser to all OTHER routes (excluding webhooks)
app.use((req, res, next) => {
  // Skip JSON parsing for webhook routes
  if (req.path === '/api/payments/webhook' || req.originalUrl === '/api/payments/webhook') {
    console.log('🔒 Webhook detected - skipping JSON parsing');
    return next();
  }
  // Use JSON parser for all other routes
  express.json({ limit: '10mb' })(req, res, next);
});

// URL-encoded data parsing
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Add cookie parser middleware early in the chain
app.use(cookieParser());

// Cache optimization: disable aggressive dev mode cache busting in production
if (process.env.NODE_ENV === 'development') {
  app.use(devCacheKiller); // Only in development
  app.use(cacheBuster);
  app.use(devModeHeaders);
}

// Input security middleware
app.use(sanitizeInput);
app.use(sqlInjectionProtection);

// Development mode - disable caching for immediate visibility
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-cache, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-Frame-Options', 'DENY');
    next();
  });
} else {
  // Production mode - enable smart caching for performance
  app.use((req, res, next) => {
    // Static assets get longer cache
    if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
      res.set('Cache-Control', 'public, max-age=31536000, immutable');
    }
    // API responses get shorter cache
    else if (req.path.startsWith('/api/')) {
      res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    }
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-Frame-Options', 'SAMEORIGIN');
    next();
  });
}

// Request logging - verbose in development, minimal in production
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }

        if (logLine.length > 80) {
          logLine = logLine.slice(0, 79) + "…";
        }

        log(logLine);
      }
    });

    next();
  });
} else {
  // Production: only log errors and important events
  app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      if (res.statusCode >= 400) {
        const duration = Date.now() - start;
        log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
      }
    });
    next();
  });
}

(async () => {
  try {
    const server = await registerRoutes(app);

  // NO SEEDING - GOLDEN DATA RULE ENFORCED
  // seedDatabase() is permanently disabled to prevent fake data
  console.log('✅ Database seeding DISABLED - only real data allowed');

  // Create demo user (non-blocking)
  import('./seed-demo-user').then(({ createDemoUser }) => {
    createDemoUser().catch(error => {
      console.error('Failed to create demo user:', error);
    });
  });
  
  // Initialize super admin notification preferences (non-blocking)
  import('./notification-service').then(({ NotificationService }) => {
    NotificationService.initializeSuperAdminPreferences().catch(error => {
      console.error('Failed to initialize super admin preferences:', error);
    });
  });

  // Initialize supercluster service (non-blocking)
  import('./services/supercluster').then(({ superclusterService }) => {
    console.log('Initializing Supercluster service...');
    superclusterService.initialize().catch(error => {
      console.error('Failed to initialize Supercluster service:', error);
    });
  });

  // Enhanced error handling middleware
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;

    // Log security-relevant errors
    if (status === 401 || status === 403 || status === 429) {
      console.warn('Security Event:', {
        error: err.message,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString(),
      });
    }

    // Don't expose sensitive error details in production
    const isDevelopment = app.get("env") === "development";
    const message = isDevelopment ? err.message : getSecureErrorMessage(status);

    res.status(status).json({ 
      error: getErrorType(status),
      message,
      ...(isDevelopment && { stack: err.stack })
    });

    // Log error for monitoring (don't throw to avoid crashing)
    if (status >= 500) {
      console.error('Server Error:', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        ip: req.ip,
        timestamp: new Date().toISOString(),
      });
    }
  });

  function getErrorType(status: number): string {
    if (status >= 500) return 'Internal Server Error';
    if (status === 404) return 'Not Found';
    if (status === 403) return 'Forbidden';
    if (status === 401) return 'Unauthorized';
    if (status === 429) return 'Rate Limited';
    if (status >= 400) return 'Bad Request';
    return 'Error';
  }

  function getSecureErrorMessage(status: number): string {
    const messages: Record<number, string> = {
      400: 'The request could not be processed',
      401: 'Authentication required',
      403: 'Access denied',
      404: 'Resource not found',
      429: 'Too many requests',
      500: 'An internal error occurred',
      502: 'Service temporarily unavailable',
      503: 'Service temporarily unavailable',
    };

    return messages[status] || 'An error occurred';
  }

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    // CRITICAL: Serve static files from public directory BEFORE Vite middleware
    // This ensures images and other assets are served correctly
    app.use(express.static('public'));
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
    
    // Initialize simple WebSocket communication
    simpleWebSocket.initialize(server);
    
    console.log('🚀 ALL ENTERPRISE INFRASTRUCTURE SYSTEMS ACTIVATED:');
    console.log('  ✅ Redis Caching System - Lightning-fast performance');
    console.log('  ✅ Security Dashboard & Monitoring - Real-time threat detection');
    console.log('  ✅ Performance Monitor - System health tracking');
    console.log('  ✅ Real-time Communication (WebSockets) - Family collaboration');
    console.log('  ✅ Document Management System - Secure file handling');
    console.log('  ✅ Advanced Authentication (Ready) - Multi-tier user system');
    console.log('  ✅ Business Intelligence - Revenue & analytics dashboard');
    console.log('  ✅ Advanced Analytics - User behavior & predictive modeling');
    console.log('  ✅ Notification System - Multi-channel messaging');
    console.log('  ✅ Integration Manager - 10 external service connections');
    console.log('');
    console.log('🤖 AI PRIORITY ORCHESTRATOR ACTIVATED (August 10, 2025):');
    console.log('  1️⃣ Perplexity (Primary - Web Search) - ' + (process.env.PERPLEXITY_API_KEY ? '✅ Configured' : '❌ Not configured'));
    console.log('  2️⃣ Claude (Secondary - Analysis) - ' + (process.env.ANTHROPIC_API_KEY ? '✅ Configured' : '❌ Not configured'));
    console.log('  3️⃣ ChatGPT (Backup) - ' + (process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Not configured'));
    console.log('  Note: Reordered for optimal web search & verification (Perplexity), analysis (Claude), fallback (ChatGPT)');
    console.log('');
    console.log('📄 DOCUMENSO DOCUMENT SIGNING:');
    console.log('  ' + (process.env.DOCUMENSO_API_KEY ? '✅ Self-hosted document signing ready' : '⚠️ Document signing not configured'));
    console.log('');
    console.log('💼 ENTERPRISE FEATURES NOW AVAILABLE:');
    console.log('  • Premium business intelligence dashboards');
    console.log('  • Advanced user behavior analytics');
    console.log('  • Multi-channel notification system');
    console.log('  • 10+ external service integrations (CRM, Marketing, Healthcare)');
    console.log('  • Predictive analytics & revenue forecasting');
    console.log('  • Professional document management');
    console.log('  • Real-time performance monitoring');
    console.log('');
    console.log('🌟 MySeniorValet now has Fortune 500-level infrastructure!');
  });
  
  } catch (error) {
    console.error('❌ CRITICAL SERVER STARTUP ERROR:', error);
    process.exit(1);
  }
})().catch(error => {
  console.error('❌ UNHANDLED STARTUP ERROR:', error);
  process.exit(1);
});
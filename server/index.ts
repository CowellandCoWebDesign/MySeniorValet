import 'dotenv/config';
// Route all outbound email through the connected Gmail account (Replit
// google-mail connector). This import self-installs the transport at
// module-evaluation time — before any mail-sending modules load — replacing
// the @sendgrid/mail singleton's send so every existing caller uses Gmail.
import "./services/gmail-sender";
import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import { registerRoutes } from "./routes";
import { runStartupMigrations } from "./run-migration";
import { setupVite, serveStatic, log } from "./vite";
import { seoSSRMiddleware } from "./seo-ssr-middleware";
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
import { prewarmSitemapCaches } from "./sitemap-generator";
import { scheduleSitemapWarmup } from "./utils/sitemap-pinger";

const app = express();

// Global error handlers to prevent crashes
process.on('uncaughtException', (error) => {
  console.error('❌ UNCAUGHT EXCEPTION:', error);
  console.error('Stack:', error.stack);
  // Don't exit in production, try to keep serving
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ UNHANDLED REJECTION at:', promise, 'reason:', reason);
  // Don't exit, just log the error
});

// Log current environment mode
const envMode = process.env.NODE_ENV || 'development';
console.log(`⚡ Running in ${envMode.toUpperCase()} mode`);

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

// Lightweight health check endpoint (no database required)
// Note: Root '/' serves the frontend, so health check is on /health only
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'MySeniorValet API',
    version: '1.0.0'
  });
});

// Security middleware stack (order matters)
app.use(corsPolicy);
app.use(securityHeaders);
app.use(securityLogger);
app.use(enhanceSessionSecurity);

// Performance monitoring (lightweight)
app.use(performanceMonitor.middleware());

// Enable security monitoring in production
app.use(securityDashboard.middleware());

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

// Cache optimization: Force fresh JavaScript for development
// Add aggressive cache-busting headers for JavaScript files
app.use((req, res, next) => {
  // Apply no-cache headers to JavaScript and HTML files
  if (req.path.endsWith('.js') || req.path.endsWith('.html') || req.path === '/dashboard' || req.path === '/') {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
});

// Input security middleware
app.use(sanitizeInput);
app.use(sqlInjectionProtection);

// Analytics tracking middleware - track all API interactions
import { trackAnalytics } from './middleware/analytics-tracker';
app.use(trackAnalytics);

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

(async () => {
  try {
    // Run idempotent schema migrations (adds community trust columns if absent)
    await runStartupMigrations();

    const server = await registerRoutes(app);

  // NO SEEDING - GOLDEN DATA RULE ENFORCED
  // seedDatabase() is permanently disabled to prevent fake data
  console.log('✅ Database seeding DISABLED - only real data allowed');

  // NO DEMO USERS - Golden Data Rule enforced
  // Demo users violate platform authenticity principles
  
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

  // Initialize Phase 4: Advanced Monitoring Services
  import('./services/alert.service').then(({ EnterpriseAlertService }) => {
    const alertService = EnterpriseAlertService.getInstance();
    console.log('🚨 Enterprise Alert Service initialized');
  }).catch(error => {
    console.error('Failed to initialize alert service:', error);
  });

  import('./services/performance.service').then(({ PerformanceMonitorService }) => {
    const performanceService = PerformanceMonitorService.getInstance();
    console.log('📈 Performance Monitor Service initialized');
  }).catch(error => {
    console.error('Failed to initialize performance service:', error);
  });

  import('./services/cache-optimizer.service').then(({ CacheOptimizerService }) => {
    const cacheService = CacheOptimizerService.getInstance();
    console.log('🗄️ Cache Optimizer Service initialized');
  }).catch(error => {
    console.error('Failed to initialize cache service:', error);
  });

  // ScheduledAuditService completely removed - was causing deployment connection timeouts

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

    // CRITICAL: Check if headers already sent to prevent "Cannot set headers" error
    if (res.headersSent) {
      console.warn('Headers already sent, cannot send error response for:', req.path);
      return;
    }

    // Don't expose sensitive error details in production
    const isDevelopment = app.get("env") === "development";
    const message = isDevelopment ? err.message : getSecureErrorMessage(status);

    res.status(status).json({ 
      error: getErrorType(status),
      message,
      ...(isDevelopment && { stack: err.stack })
    });
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

  // CRITICAL: SSR middleware must run BEFORE all route registration
  // This ensures crawlers get pre-rendered HTML instead of the SPA
  app.use(seoSSRMiddleware());
  
  // SEO Meta Tags Middleware for Social Media Crawlers
  // Must be added before static file serving to intercept HTML requests
  import('./middleware/seo-meta-tags').then(({ createSEOMiddleware }) => {
    app.use(createSEOMiddleware());
    console.log('🔍 SEO Meta Tags middleware activated for social media previews');
  }).catch(error => {
    console.error('Failed to initialize SEO middleware:', error);
  });

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
  const port = parseInt(process.env.PORT || '5000', 10);
  
  // Add error event handler for the server
  server.on('error', (error: any) => {
    console.error('❌ Server error:', error);
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use. Trying to restart...`);
      process.exit(1);
    }
  });
  
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(`serving on port ${port}`);
    
    // Initialize simple WebSocket communication
    simpleWebSocket.initialize(server);
    
    // Pre-warm all sitemap caches so Google always hits a hot cache
    prewarmSitemapCaches().catch(e => console.error('[Sitemap] Startup pre-warm error:', e));

    // Schedule recurring 20h warmup to keep caches fresh before 24h TTL expires
    scheduleSitemapWarmup();
    
    console.log('🚀 MySeniorValet server ready — all systems active');
  });
  
  } catch (error) {
    console.error('❌ CRITICAL SERVER STARTUP ERROR:', error);
    process.exit(1);
  }
})().catch(error => {
  console.error('❌ UNHANDLED STARTUP ERROR:', error);
  process.exit(1);
});
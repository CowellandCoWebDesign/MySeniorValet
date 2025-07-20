import express, { type Request, Response, NextFunction } from "express";
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

const app = express();

// Trust proxy for accurate IP detection
app.set('trust proxy', 1);

// Security middleware stack (order matters)
app.use(corsPolicy);
app.use(securityHeaders);
app.use(securityLogger);
app.use(enhanceSessionSecurity);

// Apply rate limiting only to API routes (excluding map operations)
app.use('/api', (req, res, next) => {
  // Skip rate limiting for map operations
  if (req.path.startsWith('/communities/clusters') || 
      req.path.startsWith('/communities/spatial')) {
    return next();
  }
  return createRateLimit()(req, res, next);
});

// Basic parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Input security middleware
app.use(sanitizeInput);
app.use(sqlInjectionProtection);

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

(async () => {
  const server = await registerRoutes(app);
  
  // Seed the database on startup (non-blocking)
  seedDatabase().catch(error => {
    console.error('Failed to seed database:', error);
  });

  // Create demo user (non-blocking)
  import('./seed-demo-user').then(({ createDemoUser }) => {
    createDemoUser().catch(error => {
      console.error('Failed to create demo user:', error);
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
  });
})();

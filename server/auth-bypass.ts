import type { Express } from "express";
import cookieParser from "cookie-parser";

/**
 * Temporary authentication bypass for development testing
 * This allows the enhanced Weaviate features to be tested without auth crashes
 */
export async function setupAuthBypass(app: Express): Promise<void> {
  console.log('⚠️ Using authentication bypass for testing enhanced Weaviate features');
  
  // Add cookie parser middleware
  app.use(cookieParser());
  
  // Mock authentication middleware that always succeeds
  app.use((req, res, next) => {
    // Mock user for testing
    req.user = {
      id: 'test-user-123',
      email: 'test@example.com',
      name: 'Test User'
    };
    next();
  });

  // Mock auth routes with proper cookie handling
  app.get('/api/auth/user', (req, res) => {
    res.json({
      success: true,
      user: req.user || null
    });
  });

  app.get('/api/auth/quick-user', (req, res) => {
    res.json({
      success: true,
      user: req.user || null,
      authenticated: true
    });
  });

  app.post('/api/auth/login', (req, res) => {
    const user = {
      id: 'test-user-123',
      email: req.body.email || 'test@example.com',
      name: 'Test User'
    };
    res.cookie('sessionId', 'mock-session-123', { httpOnly: true });
    res.json({
      success: true,
      user: user
    });
  });

  app.post('/api/auth/quick-login', (req, res) => {
    const user = {
      id: 'test-user-123',
      email: req.body.email || 'test@example.com',
      name: 'Test User'
    };
    res.cookie('sessionId', 'mock-session-123', { httpOnly: true });
    res.json({
      success: true,
      user: user
    });
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('sessionId');
    res.json({ success: true });
  });

  app.post('/api/auth/quick-logout', (req, res) => {
    res.clearCookie('sessionId');
    res.json({ success: true });
  });

  console.log('✅ Authentication bypass configured with cookie support');
}
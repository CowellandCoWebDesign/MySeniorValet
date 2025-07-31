import type { Express } from "express";

/**
 * Temporary authentication bypass for development testing
 * This allows the enhanced Weaviate features to be tested without auth crashes
 */
export async function setupAuthBypass(app: Express): Promise<void> {
  console.log('⚠️ Using authentication bypass for testing enhanced Weaviate features');
  
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

  // Mock auth routes
  app.get('/api/auth/user', (req, res) => {
    res.json({
      success: true,
      user: req.user || null
    });
  });

  app.post('/api/auth/login', (req, res) => {
    res.json({
      success: true,
      user: {
        id: 'test-user-123',
        email: req.body.email || 'test@example.com',
        name: 'Test User'
      }
    });
  });

  app.post('/api/auth/logout', (req, res) => {
    res.json({ success: true });
  });

  console.log('✅ Authentication bypass configured');
}
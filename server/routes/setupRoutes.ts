import { type Express, type Request, type Response } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import { storage } from '../storage';
import { authService } from '../auth';
import { createRateLimitMiddleware, authLimiter } from '../infrastructure/rateLimiter';

// Setup session storage (in-memory, resets on restart)
const setupSessions = new Map<string, {
  csrfToken: string;
  createdAt: Date;
  ipAddress: string;
}>();

// Setup validation schema
const setupAdminSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  csrfToken: z.string().min(1, 'CSRF token is required')
});

// Clean up expired setup sessions (30 minute TTL)
function cleanupExpiredSessions() {
  const now = new Date();
  const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
  
  for (const [sessionId, session] of setupSessions.entries()) {
    if (session.createdAt < thirtyMinutesAgo) {
      setupSessions.delete(sessionId);
    }
  }
}

// Generate a setup secret on first run if not configured
function getSetupSecret(): string {
  if (process.env.ADMIN_SETUP_SECRET) {
    return process.env.ADMIN_SETUP_SECRET;
  }
  
  // Generate and log a one-time setup secret
  const generatedSecret = crypto.randomBytes(32).toString('hex');
  console.log('\n' + '='.repeat(70));
  console.log('🔐 ADMIN SETUP SECRET (Save this - Required for setup!)');
  console.log('='.repeat(70));
  console.log(`Setup Secret: ${generatedSecret}`);
  console.log('\nTo create your admin account after deployment:');
  console.log('1. Visit: /admin/setup');
  console.log('2. Copy and paste the setup secret when prompted');
  console.log('\nIMPORTANT: Never put this secret in URLs or query parameters!');
  console.log('='.repeat(70) + '\n');
  
  // Store for this session
  process.env.ADMIN_SETUP_SECRET = generatedSecret;
  return generatedSecret;
}

// Initialize setup secret
const SETUP_SECRET = getSetupSecret();

// Middleware to check if setup is needed and allowed
async function setupGuardMiddleware(req: Request, res: Response, next: Function) {
  try {
    const superAdminCount = await storage.getSuperAdminCount();
    
    // If super admin exists, setup is not allowed - return 404 to hide endpoint
    if (superAdminCount > 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    
    // Require setup secret via header only (never in URL/query params to prevent leaks)
    const providedSecret = req.headers['x-setup-secret'];
    if (!providedSecret || providedSecret !== SETUP_SECRET) {
      return res.status(404).json({ error: 'Not found' }); // Hide that setup exists
    }
    
    next();
  } catch (error) {
    console.error('Setup guard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export function registerSetupRoutes(app: Express) {
  // Clean up expired sessions periodically
  setInterval(cleanupExpiredSessions, 5 * 60 * 1000); // Every 5 minutes

  // Check if admin setup is needed (requires setup secret)
  app.get('/api/setup/status', 
    createRateLimitMiddleware(authLimiter),
    setupGuardMiddleware, // Apply security checks
    async (req: Request, res: Response) => {
      try {
        // If we reach here, setupGuardMiddleware confirmed no admins exist and secret is valid
        
        // Generate a setup session with CSRF token
        const sessionId = crypto.randomBytes(32).toString('hex');
        const csrfToken = crypto.randomBytes(32).toString('hex');
        
        setupSessions.set(sessionId, {
          csrfToken,
          createdAt: new Date(),
          ipAddress: req.ip || 'unknown'
        });
        
        // Set session cookie (httpOnly, secure in production)
        res.cookie('setupSessionId', sessionId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 30 * 60 * 1000 // 30 minutes
        });
        
        res.json({ 
          needsSetup: true,
          csrfToken, // Frontend must include this in the POST
          message: 'Admin setup required. Use the provided CSRF token to create the first administrator account.'
        });
      } catch (error) {
        console.error('Setup status error:', error);
        res.status(500).json({ error: 'Failed to check setup status' });
      }
    }
  );

  // Create the first admin account
  app.post('/api/setup/create-admin',
    createRateLimitMiddleware(authLimiter), // Rate limiting
    setupGuardMiddleware, // Check if setup is allowed
    async (req: Request, res: Response) => {
      try {
        // Validate setup session
        const sessionId = req.cookies.setupSessionId;
        if (!sessionId) {
          return res.status(403).json({ 
            error: 'No setup session',
            message: 'Please refresh the page and try again.' 
          });
        }
        
        const session = setupSessions.get(sessionId);
        if (!session) {
          return res.status(403).json({ 
            error: 'Invalid or expired setup session',
            message: 'Your setup session has expired. Please refresh the page.' 
          });
        }
        
        // Verify IP hasn't changed (extra security)
        if (session.ipAddress !== req.ip) {
          setupSessions.delete(sessionId);
          return res.status(403).json({ 
            error: 'Session security violation',
            message: 'Your IP address has changed. Please start over.' 
          });
        }
        
        // Validate request data
        const validationResult = setupAdminSchema.safeParse(req.body);
        if (!validationResult.success) {
          return res.status(400).json({ 
            error: 'Validation failed',
            errors: validationResult.error.errors 
          });
        }
        
        const { email, password, firstName, lastName, csrfToken } = validationResult.data;
        
        // Verify CSRF token
        if (csrfToken !== session.csrfToken) {
          return res.status(403).json({ 
            error: 'CSRF token mismatch',
            message: 'Security validation failed. Please refresh and try again.' 
          });
        }
        
        // Double-check no super admin was created (race condition prevention)
        const currentCount = await storage.getSuperAdminCount();
        if (currentCount > 0) {
          setupSessions.delete(sessionId);
          return res.status(410).json({ 
            error: 'Setup already completed',
            message: 'An administrator was already created.' 
          });
        }
        
        // Check if user exists and upgrade, or create new
        const existingUser = await storage.getUserByEmail(email);
        
        let userId: number;
        const hashedPassword = await authService.hashPassword(password);
        
        if (existingUser) {
          // Update existing user to super admin
          await storage.updateUser(existingUser.id, {
            role: 'super_admin',
            password: hashedPassword,
            firstName,
            lastName,
            emailVerified: true,
            isActive: true
          });
          userId = existingUser.id;
        } else {
          // Create new super admin
          const username = email.split('@')[0].toLowerCase();
          const newUser = await storage.createUser({
            email,
            username,
            password: hashedPassword,
            firstName,
            lastName,
            role: 'super_admin',
            emailVerified: true,
            isActive: true
          });
          userId = newUser.id;
        }
        
        // Invalidate cache to ensure count is updated
        const { cache } = await import('../cache');
        cache.delete('super_admin_count');
        
        // Clean up setup session
        setupSessions.delete(sessionId);
        res.clearCookie('setupSessionId');
        
        // Create auth session for auto-login
        const authSessionId = await authService.createSession(
          userId,
          req.ip,
          req.get('user-agent')
        );
        
        res.cookie('sessionId', authSessionId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        
        res.json({
          success: true,
          message: 'Administrator account created successfully!',
          redirect: '/' // Redirect to home after setup
        });
      } catch (error: any) {
        console.error('Setup create admin error:', error);
        res.status(500).json({ 
          error: 'Setup failed',
          message: 'Failed to create administrator account. Please try again.'
        });
      }
    }
  );
}
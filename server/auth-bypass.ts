import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { storage } from './storage';

// Super admin bypass for production deployment
const SUPER_ADMIN_CREDENTIALS = {
  'William.cowell01@gmail.com': process.env.SUPER_ADMIN_PASSWORD || 'MySV2025!Admin',
  'admin@myseniorvalet.com': process.env.ADMIN_PASSWORD || 'AdminMySV2025!'
};

export async function setupAuthBypass(app: any) {
  // Standard login endpoint that doesn't require Replit OAuth
  app.post('/api/auth/login-bypass', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      console.log('Login bypass attempt for:', email);
      
      // Check if this is a super admin bypass
      if (SUPER_ADMIN_CREDENTIALS[email as keyof typeof SUPER_ADMIN_CREDENTIALS]) {
        const expectedPassword = SUPER_ADMIN_CREDENTIALS[email as keyof typeof SUPER_ADMIN_CREDENTIALS];
        
        if (password === expectedPassword) {
          // Create or get the super admin user
          let user = await storage.getUserByEmail(email);
          
          if (!user) {
            // Create super admin user
            user = await storage.createUser({
              username: email,
              email: email,
              password: await bcrypt.hash(password, 10),
              role: 'super_admin',
              firstName: email === 'William.cowell01@gmail.com' ? 'William' : 'Admin',
              lastName: email === 'William.cowell01@gmail.com' ? 'Cowell' : 'Team'
            });
            console.log('Created super admin user:', email);
          }
          
          // Create session
          (req as any).session.userId = user.id;
          (req as any).session.user = user;
          (req as any).session.isAuthenticated = true;
          
          // Set req.user for compatibility
          (req as any).user = {
            claims: {
              sub: user.id,
              email: user.email
            },
            dbUserId: user.id,
            email: user.email
          };
          
          return res.json({ 
            success: true, 
            user: {
              id: user.id,
              email: user.email,
              role: user.role,
              firstName: user.firstName,
              lastName: user.lastName
            }
          });
        }
      }
      
      // Standard user login
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      const isValid = await bcrypt.compare(password, user.password || '');
      
      if (!isValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Create session
      (req as any).session.userId = user.id;
      (req as any).session.user = user;
      (req as any).session.isAuthenticated = true;
      
      // Set req.user for compatibility
      (req as any).user = {
        claims: {
          sub: user.id,
          email: user.email
        },
        dbUserId: user.id,
        email: user.email
      };
      
      res.json({ 
        success: true, 
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName
        }
      });
    } catch (error: any) {
      console.error('Login bypass error:', error);
      res.status(500).json({ message: 'Login failed', error: error.message });
    }
  });
  
  // Check auth status endpoint
  app.get('/api/auth/status', (req: Request, res: Response) => {
    const isAuthenticated = !!(req as any).session?.isAuthenticated || !!(req as any).isAuthenticated?.();
    const user = (req as any).session?.user || (req as any).user;
    
    res.json({
      isAuthenticated,
      user: isAuthenticated && user ? {
        id: user.dbUserId || user.id,
        email: user.email,
        role: user.role
      } : null
    });
  });
  
  // Logout endpoint
  app.post('/api/auth/logout-bypass', (req: Request, res: Response) => {
    (req as any).session?.destroy?.((err: any) => {
      if (err) {
        console.error('Logout error:', err);
      }
      res.json({ success: true });
    });
  });
}

// Middleware to check authentication from either Replit OAuth or bypass
export const isAuthenticatedFlexible: any = async (req: Request, res: Response, next: NextFunction) => {
  // Check session-based auth first
  if ((req as any).session?.isAuthenticated && (req as any).session?.user) {
    (req as any).user = {
      claims: {
        sub: (req as any).session.user.id,
        email: (req as any).session.user.email
      },
      dbUserId: (req as any).session.user.id,
      email: (req as any).session.user.email
    };
    return next();
  }
  
  // Check Replit OAuth
  const user = (req as any).user;
  
  if (!req.isAuthenticated || !req.isAuthenticated() || !user?.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    // Refresh token logic would go here
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
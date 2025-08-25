/**
 * Custom Authentication System for MySeniorValet
 * This replaces Replit Auth with a production-ready authentication system
 * that doesn't require users to have Replit accounts.
 */

import bcrypt from 'bcrypt';
import { Router } from 'express';
import { db } from './db';
import { users } from '../shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { notifySuperAdmin } from './sendgrid-service';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import type { Express } from 'express';

// Session configuration for production
export function setupCustomAuth(app: Express) {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Use PostgreSQL for session storage
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  app.use(session({
    secret: process.env.SESSION_SECRET || 'mysv-secret-2025',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: sessionTtl,
    },
  }));
  
  const router = Router();
  
  // Register new user
  router.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, firstName, lastName, accountType = 'family' } = req.body;
      
      // Check if user exists
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);
      
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email already registered' 
        });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      const username = email.split('@')[0].toLowerCase();
      
      // Create user with proper account type
      const [newUser] = await db
        .insert(users)
        .values({
          email: email.toLowerCase(),
          username: username,
          password: hashedPassword,
          firstName,
          lastName,
          role: accountType === 'family' ? 'user' : accountType,
          emailVerified: false,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      
      // Send notification to admin about new registration
      await notifySuperAdmin(
        'New User Registration',
        `A new ${accountType} user has registered on MySeniorValet!`,
        {
          name: `${firstName} ${lastName}`,
          email: email,
          accountType: accountType,
          registeredAt: new Date().toISOString()
        }
      );
      
      // Create session
      (req.session as any).userId = newUser.id;
      (req.session as any).user = {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
      };
      
      res.json({ 
        success: true, 
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Registration failed' 
      });
    }
  });
  
  // Login
  router.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Find user
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);
      
      if (!user || !user.password) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }
      
      // Verify password
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }
      
      // Create session
      (req.session as any).userId = user.id;
      (req.session as any).user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      };
      
      res.json({ 
        success: true, 
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Login failed' 
      });
    }
  });
  
  // Get current user
  router.get('/api/auth/user', (req, res) => {
    const sessionData = req.session as any;
    if (!sessionData.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    res.json(sessionData.user);
  });
  
  // Check auth status
  router.get('/api/auth/status', (req, res) => {
    const sessionData = req.session as any;
    res.json({
      isAuthenticated: !!sessionData.user,
      user: sessionData.user || null,
    });
  });
  
  // Logout
  router.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: 'Logout failed' 
        });
      }
      res.clearCookie('connect.sid');
      res.json({ success: true });
    });
  });
  
  // Password reset request
  router.post('/api/auth/reset-password-request', async (req, res) => {
    try {
      const { email } = req.body;
      
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);
      
      if (!user) {
        // Don't reveal if email exists
        return res.json({ 
          success: true, 
          message: 'If the email exists, a reset link has been sent' 
        });
      }
      
      // TODO: Implement email sending with reset token
      // For now, just acknowledge the request
      res.json({ 
        success: true, 
        message: 'If the email exists, a reset link has been sent' 
      });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Password reset request failed' 
      });
    }
  });
  
  // Admin endpoint: Get recent users
  router.get('/api/admin/users/recent', async (req, res) => {
    try {
      // Check if user is admin
      if (!req.session || !(req.session as any).userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const currentUser = (req.session as any).user;
      if (currentUser?.role !== 'super_admin' && currentUser?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      // Get recent users
      const recentUsers = await db
        .select({
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          role: users.role,
          role: users.role,
          createdAt: users.createdAt,
          emailVerified: users.emailVerified,
          lastLoginAt: users.lastLoginAt,
        })
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(50);
      
      res.json({ 
        users: recentUsers,
        total: recentUsers.length 
      });
    } catch (error) {
      console.error('Error fetching recent users:', error);
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  });
  
  // Admin endpoint: Get user statistics
  router.get('/api/admin/users/stats', async (req, res) => {
    try {
      // Check if user is admin
      if (!req.session || !(req.session as any).userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const currentUser = (req.session as any).user;
      if (currentUser?.role !== 'super_admin' && currentUser?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      // Get user statistics
      const stats = await db
        .select({
          totalUsers: sql<number>`COUNT(*)::int`,
          families: sql<number>`COUNT(CASE WHEN account_type = 'family' THEN 1 END)::int`,
          communities: sql<number>`COUNT(CASE WHEN account_type = 'community' THEN 1 END)::int`,
          vendors: sql<number>`COUNT(CASE WHEN account_type = 'vendor' THEN 1 END)::int`,
          admins: sql<number>`COUNT(CASE WHEN account_type = 'admin' THEN 1 END)::int`,
          verifiedEmails: sql<number>`COUNT(CASE WHEN email_verified = true THEN 1 END)::int`,
          activeUsers: sql<number>`COUNT(CASE WHEN is_active = true THEN 1 END)::int`,
          newToday: sql<number>`COUNT(CASE WHEN created_at > CURRENT_DATE THEN 1 END)::int`,
          newThisWeek: sql<number>`COUNT(CASE WHEN created_at > CURRENT_DATE - INTERVAL '7 days' THEN 1 END)::int`,
          newThisMonth: sql<number>`COUNT(CASE WHEN created_at > CURRENT_DATE - INTERVAL '30 days' THEN 1 END)::int`,
        })
        .from(users);
      
      res.json(stats[0]);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      res.status(500).json({ message: 'Failed to fetch stats' });
    }
  });
  
  app.use(router);
  
  console.log('✅ Custom authentication system initialized (no Replit account required)');
}

// Authentication middleware
export const requireAuth = (req: any, res: any, next: any) => {
  if (!req.session?.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
};

// Admin middleware
export const requireAdmin = (req: any, res: any, next: any) => {
  if (!req.session?.user || !['admin', 'super_admin'].includes(req.session.user.role)) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};
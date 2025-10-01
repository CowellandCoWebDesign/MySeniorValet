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
import { validatePassword } from './auth/password-validator';
import { 
  generateTOTPSecret, 
  verifyTOTP, 
  generateBackupCodes, 
  enable2FA, 
  disable2FA,
  requires2FA,
  useBackupCode
} from './auth/two-factor-auth';

// Session configuration for production
export function setupCustomAuth(app: Express) {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Require SESSION_SECRET in production
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    if (isProduction) {
      throw new Error('SESSION_SECRET environment variable is required in production');
    }
    console.warn('⚠️  WARNING: SESSION_SECRET not set. Using default for development only.');
  }
  
  // Enable trust proxy for Replit's proxied environment
  app.set('trust proxy', 1);
  
  // Use PostgreSQL for session storage
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  app.use(session({
    secret: sessionSecret || 'dev-only-secret-change-this',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: 'auto', // Automatically detect secure connections
      sameSite: 'lax',
      maxAge: sessionTtl,
    },
  }));
  
  const router = Router();
  
  // Register new user
  router.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, firstName, lastName, accountType = 'family' } = req.body;
      
      // Validate password strength
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Password does not meet security requirements',
          details: passwordValidation.feedback
        });
      }
      
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
      const { email, password, totpCode, backupCode } = req.body;
      
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
      
      // Check if 2FA is required
      if (user.twoFactorEnabled || requires2FA(user.email)) {
        // If 2FA is enabled but no code provided, request it
        if (!totpCode && !backupCode) {
          return res.status(200).json({
            success: false,
            requires2FA: true,
            message: 'Two-factor authentication required'
          });
        }
        
        // Verify 2FA code
        let valid2FA = false;
        if (totpCode && user.twoFactorSecret) {
          valid2FA = verifyTOTP(user.twoFactorSecret, totpCode);
        } else if (backupCode) {
          valid2FA = await useBackupCode(user.id, backupCode);
        }
        
        if (!valid2FA) {
          return res.status(401).json({
            success: false,
            message: 'Invalid two-factor authentication code'
          });
        }
      }
      
      // Update last login time
      await db
        .update(users)
        .set({ lastLoginAt: new Date() })
        .where(eq(users.id, user.id));
      
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
          twoFactorEnabled: user.twoFactorEnabled
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
      
      // Generate reset token
      const resetToken = Math.random().toString(36).substring(2, 15) + 
                        Math.random().toString(36).substring(2, 15);
      const resetExpires = new Date(Date.now() + 3600000); // 1 hour expiry
      
      // Update user with reset token
      await db
        .update(users)
        .set({
          passwordResetToken: resetToken,
          passwordResetExpires: resetExpires,
          updatedAt: new Date()
        })
        .where(eq(users.id, user.id));
      
      // Send reset email using SendGrid
      try {
        const { sendPasswordResetEmail } = await import('./sendgrid-service');
        await sendPasswordResetEmail(email, resetToken);
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        // Continue anyway - don't reveal email sending failure to user
      }
      
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
  
  // Password validation endpoint
  router.post('/api/auth/validate-password', async (req, res) => {
    const { password } = req.body;
    const validation = validatePassword(password);
    res.json(validation);
  });
  
  // Change password endpoint
  router.post('/api/auth/change-password', async (req, res) => {
    try {
      const sessionData = req.session as any;
      if (!sessionData.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const { currentPassword, newPassword } = req.body;
      
      // Validate new password strength
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'New password does not meet security requirements',
          details: passwordValidation.feedback
        });
      }
      
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, sessionData.userId))
        .limit(1);
        
      if (!user || !user.password) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return res.status(401).json({ 
          success: false, 
          message: 'Current password is incorrect' 
        });
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update password
      await db
        .update(users)
        .set({
          password: hashedPassword,
          lastPasswordChangeAt: new Date(),
          requiresPasswordChange: false,
          updatedAt: new Date()
        })
        .where(eq(users.id, user.id));
      
      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Password change error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to change password' 
      });
    }
  });
  
  // Setup 2FA - Generate TOTP secret and QR code
  router.post('/api/auth/2fa/setup', async (req, res) => {
    try {
      const sessionData = req.session as any;
      if (!sessionData.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, sessionData.userId))
        .limit(1);
        
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Generate TOTP secret and backup codes
      const { secret, qrCode, manualEntryKey } = await generateTOTPSecret(user.email);
      const backupCodes = generateBackupCodes(10);
      
      // Store the secret temporarily (not enabled yet)
      await db
        .update(users)
        .set({
          twoFactorSecret: secret,
          updatedAt: new Date()
        })
        .where(eq(users.id, user.id));
      
      res.json({
        success: true,
        qrCode,
        secret: manualEntryKey,
        backupCodes,
        requiresVerification: true
      });
    } catch (error) {
      console.error('2FA setup error:', error);
      res.status(500).json({ message: 'Failed to setup 2FA' });
    }
  });
  
  // Verify 2FA setup - Enable 2FA after verification
  router.post('/api/auth/2fa/verify', async (req, res) => {
    try {
      const sessionData = req.session as any;
      if (!sessionData.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const { code, backupCodes } = req.body;
      
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, sessionData.userId))
        .limit(1);
        
      if (!user || !user.twoFactorSecret) {
        return res.status(400).json({ message: '2FA not configured' });
      }
      
      // Verify the TOTP code
      const isValid = verifyTOTP(user.twoFactorSecret, code);
      if (!isValid) {
        return res.status(400).json({ message: 'Invalid verification code' });
      }
      
      // Enable 2FA
      await enable2FA(user.id, user.twoFactorSecret, backupCodes);
      
      res.json({
        success: true,
        message: '2FA enabled successfully'
      });
    } catch (error) {
      console.error('2FA verification error:', error);
      res.status(500).json({ message: 'Failed to verify 2FA' });
    }
  });
  
  // Disable 2FA
  router.post('/api/auth/2fa/disable', async (req, res) => {
    try {
      const sessionData = req.session as any;
      if (!sessionData.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const { password } = req.body;
      
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, sessionData.userId))
        .limit(1);
        
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Verify password before disabling 2FA
      if (!user.password || !await bcrypt.compare(password, user.password)) {
        return res.status(401).json({ message: 'Invalid password' });
      }
      
      await disable2FA(user.id);
      
      res.json({
        success: true,
        message: '2FA disabled successfully'
      });
    } catch (error) {
      console.error('2FA disable error:', error);
      res.status(500).json({ message: 'Failed to disable 2FA' });
    }
  });
  
  // Get 2FA status
  router.get('/api/auth/2fa/status', async (req, res) => {
    try {
      const sessionData = req.session as any;
      if (!sessionData.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const [user] = await db
        .select({
          twoFactorEnabled: users.twoFactorEnabled,
          email: users.email
        })
        .from(users)
        .where(eq(users.id, sessionData.userId))
        .limit(1);
        
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json({
        enabled: user.twoFactorEnabled,
        required: requires2FA(user.email),
        email: user.email
      });
    } catch (error) {
      console.error('2FA status error:', error);
      res.status(500).json({ message: 'Failed to get 2FA status' });
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
/**
 * Custom Authentication System for MySeniorValet
 * This replaces Replit Auth with a production-ready authentication system
 * that doesn't require users to have Replit accounts.
 */

import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { Router } from 'express';
import { db } from './db';
import { users } from '../shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { notifySuperAdmin } from './sendgrid-service';
import session from 'express-session';
import MemoryStore from 'memorystore';
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
import { EmailService } from './services/email';
import { emailVerificationEmail } from './templates/emailTemplates';

// Secure base URL configuration - never trust request headers
const ALLOWED_HOSTS = [
  'myseniorvalet.com',
  'www.myseniorvalet.com',
  'localhost:5000',
  '127.0.0.1:5000'
];

// Add Replit workspace hosts dynamically
const REPLIT_HOST_PATTERN = /^[a-z0-9-]+\.replit\.dev$/;
const REPLIT_JANEWAY_PATTERN = /^[a-z0-9-]+\.janeway\.replit\.dev$/;

function getSecureBaseUrl(requestHost?: string): string {
  // In production, always use the canonical domain
  if (process.env.NODE_ENV === 'production') {
    return 'https://myseniorvalet.com';
  }
  
  // In development, validate the host
  if (requestHost) {
    if (ALLOWED_HOSTS.includes(requestHost) || 
        REPLIT_HOST_PATTERN.test(requestHost) ||
        REPLIT_JANEWAY_PATTERN.test(requestHost)) {
      const protocol = requestHost.includes('localhost') ? 'http' : 'https';
      return `${protocol}://${requestHost}`;
    }
  }
  
  // Fallback to localhost in development
  return 'http://localhost:5000';
}

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
  
  // Session store setup - PostgreSQL for production, memory for development
  let sessionStore: session.Store;
  
  if (process.env.DATABASE_URL && isProduction) {
    // Production: Use PostgreSQL for persistent sessions
    try {
      const PgStore = connectPg(session);
      sessionStore = new PgStore({
        conString: process.env.DATABASE_URL,
        createTableIfMissing: true,
        ttl: sessionTtl,
        tableName: "sessions",
        errorLog: (error: Error) => {
          console.error('Session store error (non-fatal):', error.message);
        }
      });
      console.log('✅ Using PostgreSQL session store for production');
    } catch (err) {
      // Fallback to memory store if PostgreSQL fails
      console.warn('⚠️ PostgreSQL session store failed, using memory store:', (err as Error).message);
      const MemStore = MemoryStore(session);
      sessionStore = new MemStore({
        checkPeriod: 86400000
      });
    }
  } else {
    // Development: Use memory store for reliability (avoids timeout issues)
    const MemStore = MemoryStore(session);
    sessionStore = new MemStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    console.log('✅ Using in-memory session store for development');
  }
  
  app.use(session({
    secret: sessionSecret || 'dev-only-secret-change-this',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    rolling: true, // Reset cookie expiry on activity
    cookie: {
      httpOnly: true,
      secure: false, // Allow cookies over HTTP in development
      sameSite: 'lax',
      maxAge: sessionTtl,
      path: '/', // Ensure cookie is available on all paths
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
      
      // Generate email verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      
      // Create user with proper account type and verification token
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
          emailVerificationToken: verificationToken,
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
      
      // Send email verification email - use secure base URL
      const baseUrl = getSecureBaseUrl(req.get('host'));
      const verificationLink = `${baseUrl}/verify-email?token=${verificationToken}`;
      
      try {
        await EmailService.sendEmail({
          to: email.toLowerCase(),
          subject: emailVerificationEmail.subject,
          html: emailVerificationEmail.html({
            name: firstName || 'there',
            verificationLink
          }),
          isTransactional: true
        });
        console.log(`Verification email sent to ${email}`);
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
        // Don't fail registration if email fails
      }
      
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
          emailVerified: false,
        },
        message: 'Account created! Please check your email to verify your account.'
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Registration failed' 
      });
    }
  });
  
  // Resend email verification
  router.post('/api/auth/resend-verification', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }
      
      // Find user
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);
      
      // Always return success to prevent email enumeration
      if (!user || user.emailVerified) {
        return res.json({
          success: true,
          message: 'If an account exists with this email, a verification link has been sent.'
        });
      }
      
      // Generate new verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      
      // Update user with new token
      await db
        .update(users)
        .set({
          emailVerificationToken: verificationToken,
          updatedAt: new Date()
        })
        .where(eq(users.id, user.id));
      
      // Send verification email - use secure base URL
      const baseUrl = getSecureBaseUrl(req.get('host'));
      const verificationLink = `${baseUrl}/verify-email?token=${verificationToken}`;
      
      try {
        await EmailService.sendEmail({
          to: email.toLowerCase(),
          subject: emailVerificationEmail.subject,
          html: emailVerificationEmail.html({
            name: user.firstName || 'there',
            verificationLink
          }),
          isTransactional: true
        });
        console.log(`Verification email resent to ${email}`);
      } catch (emailError) {
        console.error('Error resending verification email:', emailError);
      }
      
      res.json({
        success: true,
        message: 'If an account exists with this email, a verification link has been sent.'
      });
    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to resend verification email'
      });
    }
  });
  
  // Login
  router.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password, totpCode, backupCode } = req.body;
      
      console.log('🔐 Login attempt for:', email?.toLowerCase());
      
      // Find user
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);
      
      if (!user) {
        console.log('❌ Login failed: User not found for:', email?.toLowerCase());
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }
      
      if (!user.password) {
        console.log('❌ Login failed: No password set (OAuth-only) for:', email?.toLowerCase());
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }
      
      console.log('✓ User found, checking password for:', user.email);
      
      // Verify password
      const isValid = await bcrypt.compare(password, user.password);
      console.log('🔑 Password check result:', isValid ? 'VALID' : 'INVALID');
      
      if (!isValid) {
        console.log('❌ Login failed: Wrong password for:', user.email);
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }
      
      console.log('✅ Password verified for:', user.email);
      
      // Check if 2FA is required
      if (user.twoFactorEnabled || (user.email && requires2FA(user.email))) {
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
      
      // Create session with explicit save to ensure persistence
      (req.session as any).userId = user.id;
      (req.session as any).user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      };
      
      // Explicitly save session before responding
      req.session.save((err: Error | null) => {
        if (err) {
          console.error('❌ Session save error:', err);
          return res.status(500).json({ 
            success: false, 
            message: 'Login failed - session error' 
          });
        }
        
        console.log('✅ Session saved successfully for:', user.email);
        
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
  router.get('/api/auth/user', async (req, res) => {
    const sessionData = req.session as any;
    if (!sessionData || !sessionData.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // If the user has an ID, fetch their full data including role from database
    if (sessionData.user.id) {
      try {
        const [dbUser] = await db
          .select()
          .from(users)
          .where(eq(users.id, Number(sessionData.user.id)))
          .limit(1);
        
        if (dbUser) {
          // Merge database data with session data to include role
          const userWithRole = {
            ...sessionData.user,
            role: dbUser.role || 'user',
            email: dbUser.email || sessionData.user.email
          };
          console.log('Auth user with role:', userWithRole.email, userWithRole.role);
          res.json(userWithRole);
        } else {
          res.json(sessionData.user);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        res.json(sessionData.user);
      }
    } else {
      res.json(sessionData.user);
    }
  });
  
  // Check auth status
  router.get('/api/auth/status', async (req, res) => {
    const sessionData = req.session as any;
    if (!sessionData || !sessionData.user) {
      return res.json({
        isAuthenticated: false,
        user: null,
      });
    }
    
    // Fetch user role from database if user is authenticated
    let userWithRole = sessionData.user;
    if (sessionData.user.id) {
      try {
        const [dbUser] = await db
          .select()
          .from(users)
          .where(eq(users.id, Number(sessionData.user.id)))
          .limit(1);
        
        if (dbUser) {
          userWithRole = {
            ...sessionData.user,
            role: dbUser.role || 'user',
            email: dbUser.email || sessionData.user.email
          };
          console.log('Auth status with role:', userWithRole.email, userWithRole.role);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    }
    
    res.json({
      isAuthenticated: true,
      user: userWithRole,
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
      const { secret, qrCode, manualEntryKey } = await generateTOTPSecret(user.email || '');
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
        required: user.email ? requires2FA(user.email) : false,
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
  
  // Add authentication helper middleware - MUST come before routes
  app.use((req: any, res: any, next: any) => {
    // Add isAuthenticated method to request object (Passport.js compatibility)
    req.isAuthenticated = () => {
      return !!(req.session?.userId && req.session?.user);
    };
    
    // Add user to request object if authenticated
    if (req.session?.user) {
      req.user = req.session.user;
    }
    
    next();
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
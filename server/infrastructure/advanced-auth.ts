import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { redisCache } from './redis-cache';

// Auth configuration
const AUTH_CONFIG = {
  jwt: {
    secret: process.env.JWT_SECRET || 'mysv-jwt-secret-key-2025',
    expiresIn: '7d',
    refreshExpiresIn: '30d'
  },
  session: {
    secret: process.env.SESSION_SECRET || 'mysv-session-secret-2025',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  },
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
  },
  facebook: {
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: '/auth/facebook/callback'
  }
};

// User authentication levels
export enum UserRole {
  FAMILY = 'family',
  COMMUNITY_MANAGER = 'community_manager',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

export interface AuthUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  subscriptionTier: 'free' | 'premium' | 'enterprise';
  familyAccountId?: number;
  communityIds?: number[];
  permissions: string[];
  lastLogin: Date;
  isVerified: boolean;
}

class AdvancedAuthService {
  constructor() {
    this.initializePassport();
  }

  private initializePassport(): void {
    // Local strategy for email/password
    passport.use(new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password'
    }, async (email: string, password: string, done) => {
      try {
        const user = await storage.getUserByEmail(email);
        if (!user) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        // Update last login
        await storage.updateUser(user.id, { 
          lastLogin: new Date(),
          loginCount: (user.loginCount || 0) + 1
        });

        return done(null, this.formatAuthUser(user));
      } catch (error) {
        return done(error);
      }
    }));

    // Google OAuth strategy
    if (AUTH_CONFIG.google.clientID) {
      passport.use(new GoogleStrategy({
        clientID: AUTH_CONFIG.google.clientID,
        clientSecret: AUTH_CONFIG.google.clientSecret,
        callbackURL: AUTH_CONFIG.google.callbackURL
      }, async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await storage.getUserByEmail(profile.emails?.[0]?.value || '');
          
          if (!user) {
            // Create new user from Google profile
            user = await storage.createUser({
              email: profile.emails?.[0]?.value || '',
              firstName: profile.name?.givenName || '',
              lastName: profile.name?.familyName || '',
              passwordHash: '', // No password for OAuth users
              role: UserRole.FAMILY,
              subscriptionTier: 'free',
              isVerified: true,
              googleId: profile.id,
              profilePicture: profile.photos?.[0]?.value
            });
          } else if (!user.googleId) {
            // Link existing account to Google
            await storage.updateUser(user.id, {
              googleId: profile.id,
              isVerified: true
            });
          }

          return done(null, this.formatAuthUser(user));
        } catch (error) {
          return done(error);
        }
      }));
    }

    // Serialize/deserialize for sessions
    passport.serializeUser((user: any, done) => {
      done(null, user.id);
    });

    passport.deserializeUser(async (id: number, done) => {
      try {
        const user = await storage.getUser(id);
        done(null, user ? this.formatAuthUser(user) : null);
      } catch (error) {
        done(error);
      }
    });
  }

  private formatAuthUser(user: any): AuthUser {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role || UserRole.FAMILY,
      subscriptionTier: user.subscriptionTier || 'free',
      familyAccountId: user.familyAccountId,
      communityIds: user.communityIds || [],
      permissions: this.getUserPermissions(user.role || UserRole.FAMILY),
      lastLogin: user.lastLogin || new Date(),
      isVerified: user.isVerified || false
    };
  }

  private getUserPermissions(role: UserRole): string[] {
    const permissions: Record<UserRole, string[]> = {
      [UserRole.FAMILY]: [
        'search_communities',
        'save_favorites',
        'share_with_family',
        'schedule_tours',
        'view_pricing'
      ],
      [UserRole.COMMUNITY_MANAGER]: [
        'search_communities',
        'save_favorites',
        'share_with_family',
        'schedule_tours',
        'view_pricing',
        'manage_community_profile',
        'respond_to_inquiries',
        'update_availability',
        'manage_pricing',
        'view_analytics'
      ],
      [UserRole.ADMIN]: [
        'search_communities',
        'save_favorites',
        'share_with_family',
        'schedule_tours',
        'view_pricing',
        'manage_community_profile',
        'respond_to_inquiries',
        'update_availability',
        'manage_pricing',
        'view_analytics',
        'moderate_reviews',
        'manage_users',
        'view_admin_dashboard'
      ],
      [UserRole.SUPER_ADMIN]: [
        'search_communities',
        'save_favorites',
        'share_with_family',
        'schedule_tours',
        'view_pricing',
        'manage_community_profile',
        'respond_to_inquiries',
        'update_availability',
        'manage_pricing',
        'view_analytics',
        'moderate_reviews',
        'manage_users',
        'view_admin_dashboard',
        'manage_platform',
        'access_system_settings',
        'view_security_logs'
      ]
    };

    return permissions[role] || permissions[UserRole.FAMILY];
  }

  // Generate JWT tokens
  generateTokens(user: AuthUser): { accessToken: string; refreshToken: string } {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions
    };

    const accessToken = jwt.sign(payload, AUTH_CONFIG.jwt.secret, {
      expiresIn: AUTH_CONFIG.jwt.expiresIn
    });

    const refreshToken = jwt.sign(
      { id: user.id, type: 'refresh' },
      AUTH_CONFIG.jwt.secret,
      { expiresIn: AUTH_CONFIG.jwt.refreshExpiresIn }
    );

    return { accessToken, refreshToken };
  }

  // Verify JWT token
  async verifyToken(token: string): Promise<AuthUser | null> {
    try {
      const decoded = jwt.verify(token, AUTH_CONFIG.jwt.secret) as any;
      
      // Check if token is cached as blacklisted
      const isBlacklisted = await redisCache.get(`blacklist:${token}`);
      if (isBlacklisted) {
        return null;
      }

      const user = await storage.getUser(decoded.id);
      return user ? this.formatAuthUser(user) : null;
    } catch (error) {
      return null;
    }
  }

  // Blacklist token (for logout)
  async blacklistToken(token: string): Promise<void> {
    try {
      const decoded = jwt.verify(token, AUTH_CONFIG.jwt.secret) as any;
      const ttl = decoded.exp - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        await redisCache.set(`blacklist:${token}`, true, ttl);
      }
    } catch (error) {
      // Token already invalid
    }
  }

  // Create family account
  async createFamilyAccount(primaryUserId: number, familyName: string): Promise<number> {
    // Implementation for family account creation
    // This would create a family group that multiple users can join
    const familyAccount = {
      primaryUserId,
      familyName,
      createdAt: new Date(),
      memberLimit: 5, // Adjust based on subscription tier
      inviteCode: this.generateInviteCode()
    };
    
    // Store in database and return family account ID
    // This would require extending the database schema
    return 1; // Placeholder
  }

  private generateInviteCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }

  // Middleware for role-based access control
  requireRole(roles: UserRole | UserRole[]) {
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    return (req: Request, res: Response, next: NextFunction) => {
      const user = req.user as AuthUser;
      
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          required: allowedRoles,
          current: user.role
        });
      }

      next();
    };
  }

  // Middleware for permission-based access control
  requirePermission(permission: string) {
    return (req: Request, res: Response, next: NextFunction) => {
      const user = req.user as AuthUser;
      
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (!user.permissions.includes(permission)) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          required: permission,
          available: user.permissions
        });
      }

      next();
    };
  }

  // Subscription tier middleware
  requireSubscription(tiers: string | string[]) {
    const allowedTiers = Array.isArray(tiers) ? tiers : [tiers];
    
    return (req: Request, res: Response, next: NextFunction) => {
      const user = req.user as AuthUser;
      
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (!allowedTiers.includes(user.subscriptionTier)) {
        return res.status(402).json({ 
          error: 'Subscription upgrade required',
          required: allowedTiers,
          current: user.subscriptionTier
        });
      }

      next();
    };
  }
}

export const advancedAuth = new AdvancedAuthService();
export { AUTH_CONFIG };
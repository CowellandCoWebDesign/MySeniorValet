import { type Express } from "express";
import { db } from "../db";
import { users, userSessions } from "@shared/schema";
import { eq } from "drizzle-orm";
import { loginSchema, signupSchema } from "@shared/schema";
import { authService } from "../auth";
import { isAuthenticated as requireAuth } from "../auth-middleware";
import { z } from "zod";
import { authLimiter, createRateLimitMiddleware } from "../infrastructure/rateLimiter";
import { internalNotifications } from "../services/internal-notifications";

export function registerAuthRoutes(app: Express) {
  // Auth limiter is already imported from infrastructure/rateLimiter

  // User signup
  app.post("/api/auth/signup", createRateLimitMiddleware(authLimiter), async (req, res) => {
    try {
      const validatedData = signupSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, validatedData.email))
        .limit(1);

      if (existingUser.length > 0) {
        return res.status(400).json({ message: "User already exists" });
      }

      const newUser = await authService.signup(validatedData);
      const sessionId = await authService.createSession(newUser.id);
      
      res.cookie('sessionId', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // Send internal notification
      try {
        await internalNotifications.notifyUserRegistered({
          userId: newUser.id,
          userName: `${newUser.firstName} ${newUser.lastName}`.trim() || newUser.email,
          userEmail: newUser.email,
          role: newUser.role,
          signupMethod: 'standard'
        });
      } catch (notificationError) {
        console.error('Error sending internal user registration notification:', notificationError);
        // Don't fail the registration if internal notification fails
      }

      res.status(201).json({
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Signup error:", error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  // User login
  app.post("/api/auth/login", createRateLimitMiddleware(authLimiter), async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      const user = await authService.login(validatedData.email, validatedData.password);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const sessionId = await authService.createSession(user.id);
      
      res.cookie('sessionId', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Login error:", error);
      res.status(401).json({ message: "Invalid credentials" });
    }
  });

  // Get current user
  app.get("/api/auth/user", requireAuth, async (req: any, res) => {
    try {
      // Get Replit user ID from claims
      const replitUserId = req.user?.claims?.sub;
      if (!replitUserId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Get user from database using Replit user ID as string
      // Only select columns that exist in the database
      const [user] = await db
        .select({
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          phone: users.phone,
          role: users.role,
          relationshipToCare: users.relationshipToCare,
          careNeeds: users.careNeeds,
          searchPreferences: users.searchPreferences,
          notifications: users.notifications,
          dashboardPreferences: users.dashboardPreferences,
          createdAt: users.createdAt
        })
        .from(users)
        .where(eq(users.id, String(replitUserId)))
        .limit(1);

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Return user data including role for admin dashboard access control
      return res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        relationshipToCare: user.relationshipToCare,
        careNeeds: user.careNeeds,
        searchPreferences: user.searchPreferences,
        notifications: user.notifications,
        dashboardPreferences: user.dashboardPreferences,
        createdAt: user.createdAt
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user profile
  app.patch("/api/auth/user", requireAuth, async (req: any, res) => {
    try {
      const replitUserId = req.user?.claims?.sub;
      if (!replitUserId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const updates = req.body;
      
      // Remove fields that shouldn't be updated directly
      delete updates.id;
      delete updates.email; // Email update should be done through separate endpoint
      delete updates.password;
      delete updates.role;
      delete updates.stripeCustomerId;
      delete updates.stripeSubscriptionId;

      const [updatedUser] = await db
        .update(users)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(eq(users.id, String(replitUserId)))
        .returning();

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phone: updatedUser.phone,
        role: updatedUser.role,
        dateOfBirth: updatedUser.dateOfBirth,
        relationshipToCare: updatedUser.relationshipToCare,
        careNeeds: updatedUser.careNeeds,
        searchPreferences: updatedUser.searchPreferences,
        notifications: updatedUser.notifications,
        dashboardPreferences: updatedUser.dashboardPreferences
      });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Logout
  app.post("/api/auth/logout", requireAuth, async (req: any, res) => {
    try {
      const sessionId = req.cookies?.sessionId;
      if (sessionId) {
        await authService.logout(sessionId);
      }
      
      res.clearCookie('sessionId');
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Failed to logout" });
    }
  });

  // Auth status check
  app.get("/api/auth/status", async (req: any, res) => {
    try {
      const sessionId = req.cookies?.sessionId;
      
      if (!sessionId) {
        return res.json({ authenticated: false, user: null });
      }

      const userId = await authService.validateSession(sessionId);
      
      if (!userId) {
        return res.json({ authenticated: false, user: null });
      }

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        return res.json({ authenticated: false, user: null });
      }

      // Check if user is super admin by email
      const SUPER_ADMIN_EMAILS = [
        'william.cowell01@gmail.com',
        'cowellandcowebdesign@gmail.com'
      ];
      
      const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(user.email?.toLowerCase() || '');
      
      res.json({
        authenticated: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isAdmin: user.role === 'admin' || isSuperAdmin
        }
      });
    } catch (error) {
      console.error("Auth status error:", error);
      res.json({ authenticated: false, user: null });
    }
  });

  // Password reset request
  app.post("/api/auth/forgot-password", createRateLimitMiddleware(authLimiter), async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!user) {
        // Don't reveal if user exists or not
        return res.json({ message: "If an account exists, a password reset link will be sent" });
      }

      // Generate reset token
      const resetToken = await authService.generatePasswordResetToken(user.id);
      
      // TODO: Send reset email with token
      console.log(`Password reset token for ${email}: ${resetToken}`);

      res.json({ message: "If an account exists, a password reset link will be sent" });
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ message: "Failed to process password reset" });
    }
  });

  // Password reset
  app.post("/api/auth/reset-password", createRateLimitMiddleware(authLimiter), async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
      }

      const success = await authService.resetPassword(token, newPassword);
      
      if (!success) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // Email verification
  app.post("/api/auth/verify-email", async (req, res) => {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ message: "Verification token is required" });
      }

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.emailVerificationToken, token))
        .limit(1);

      if (!user) {
        return res.status(400).json({ message: "Invalid verification token" });
      }

      await db
        .update(users)
        .set({
          emailVerified: true,
          emailVerificationToken: null,
          updatedAt: new Date()
        })
        .where(eq(users.id, user.id));

      res.json({ message: "Email verified successfully" });
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).json({ message: "Failed to verify email" });
    }
  });

  // Resend verification email
  app.post("/api/auth/resend-verification", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.emailVerified) {
        return res.status(400).json({ message: "Email already verified" });
      }

      // Generate new verification token
      const verificationToken = await authService.generateEmailVerificationToken(userId);
      
      // TODO: Send verification email with token
      console.log(`Email verification token for ${user.email}: ${verificationToken}`);

      res.json({ message: "Verification email sent" });
    } catch (error) {
      console.error("Resend verification error:", error);
      res.status(500).json({ message: "Failed to resend verification email" });
    }
  });
}
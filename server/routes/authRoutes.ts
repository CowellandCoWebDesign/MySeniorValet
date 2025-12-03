import { type Express } from "express";
import { db } from "../db";
import { users, userSessions } from "@shared/schema";
import { eq } from "drizzle-orm";
import { signupSchema } from "@shared/schema";
import { authService } from "../auth";
import { isAuthenticated as requireAuth } from "../auth-middleware";
import { z } from "zod";
import { authLimiter, createRateLimitMiddleware } from "../infrastructure/rateLimiter";
import { internalNotifications } from "../services/internal-notifications";
import { EmailService } from "../services/email";
import { passwordResetEmail } from "../templates/emailTemplates";
import { handleAdminSetupStatus, handleCreateFirstAdmin } from "../setup-admin";

/**
 * Auth Routes - Supplementary endpoints
 * 
 * NOTE: The primary auth endpoints (login, logout, status, user GET) are handled by
 * custom-auth.ts which is registered first. This file provides additional endpoints:
 * - /api/auth/signup - Alternative signup with notifications
 * - /api/auth/user PATCH - Profile update
 * - /api/auth/forgot-password - Password reset request
 * - /api/auth/reset-password - Password reset completion
 * - /api/auth/verify-email - Email verification
 */
export function registerAuthRoutes(app: Express) {
  // Auth limiter is already imported from infrastructure/rateLimiter

  // User signup (alternative to /api/auth/register in custom-auth.ts)
  // This version sends internal notifications
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

      const result = await authService.signup(validatedData);
      const { user: newUser, sessionId } = result;
      
      // Set session data for consistent session management
      (req as any).session.userId = newUser.id;
      (req as any).session.user = {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role
      };

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
        success: true,
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

  // NOTE: /api/auth/login is handled by custom-auth.ts (registered first)
  // NOTE: /api/auth/user GET is handled by custom-auth.ts (registered first)
  // NOTE: /api/auth/status is handled by custom-auth.ts (registered first)
  // NOTE: /api/auth/logout is handled by custom-auth.ts (registered first)

  // Update user profile
  app.patch("/api/auth/user", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
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
        .where(eq(users.id, userId))
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

  // NOTE: /api/auth/logout is handled by custom-auth.ts (registered first)
  // NOTE: /api/auth/status is handled by custom-auth.ts (registered first)

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
      
      // SECURITY: Validate host against whitelist with EXACT matching to prevent bypasses
      const requestHost = req.get('host');
      const requestProtocol = req.get('x-forwarded-proto') || req.protocol;
      
      // Whitelist of allowed domains (development and production) - EXACT MATCH ONLY
      const ALLOWED_HOSTS = [
        'localhost:5000',
        '7a9daf58-f7c7-49c7-b4de-a709c13987b5-00-3l1b8tvcpa4bp.janeway.replit.dev', // Development
        'workspace-williamcowell01.replit.app', // Production
        'myseniorvalet.com', // Custom domain
        'www.myseniorvalet.com' // Custom domain with www
      ];
      
      // SECURITY: Use exact host matching (not substring) to prevent bypass attacks like "myseniorvalet.com.attacker.com"
      const isValidHost = ALLOWED_HOSTS.includes(requestHost || '');
      
      // SECURITY: Only allow https protocol (reject javascript:, data:, etc.)
      const isSafeProtocol = requestProtocol === 'https' || requestProtocol === 'http';
      
      if (!isValidHost || !isSafeProtocol) {
        console.error(`🚨 SECURITY: Invalid host/protocol detected - Host: ${requestHost}, Protocol: ${requestProtocol}`);
        // Use hardcoded secure fallback (never trust request headers when validation fails)
        const resetLink = `https://myseniorvalet.com/reset-password?token=${resetToken}`;
        console.log(`Password reset requested for ${email} (using secure fallback due to invalid host/protocol)`);
        
        try {
          await EmailService.sendEmail({
            to: email,
            subject: passwordResetEmail.subject,
            html: passwordResetEmail.html({
              name: user.firstName || 'there',
              resetLink
            }),
            isTransactional: true
          });
        } catch (emailError) {
          console.error('Error sending password reset email:', emailError);
        }
        
        return res.json({ message: "If an account exists, a password reset link will be sent" });
      }
      
      // Generate reset link using validated host and protocol
      const resetLink = `${requestProtocol}://${requestHost}/reset-password?token=${resetToken}`;
      
      // SECURITY: Don't log the reset token - only log the request
      console.log(`Password reset requested for ${email} on validated host: ${requestHost}`);
      
      // Send password reset email
      try {
        await EmailService.sendEmail({
          to: email,
          subject: passwordResetEmail.subject,
          html: passwordResetEmail.html({
            name: user.firstName || 'there',
            resetLink
          }),
          isTransactional: true // Password reset is transactional, no unsubscribe needed
        });
        console.log(`Password reset email sent to ${email}`);
      } catch (emailError) {
        console.error('Error sending password reset email:', emailError);
        // Don't fail the request if email fails, but log it
      }

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
        return res.status(400).json({ message: "Invalid or expired verification token" });
      }

      // Check token expiry - tokens are valid for 24 hours
      // We use updatedAt as the timestamp when the token was last generated
      const tokenAge = user.updatedAt ? Date.now() - new Date(user.updatedAt).getTime() : Infinity;
      const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
      
      if (tokenAge > TOKEN_EXPIRY_MS) {
        return res.status(400).json({ 
          message: "Verification token has expired. Please request a new verification email." 
        });
      }

      // Invalidate token after use
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

  // NOTE: /api/auth/resend-verification is handled by custom-auth.ts (registered first)
}
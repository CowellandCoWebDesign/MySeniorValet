import { Router } from 'express';
import { AuthService } from '../auth';
import { storage } from '../storage';
import { db } from '../db';
import { userSessions } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import crypto from 'crypto';
import { rateLimit } from 'express-rate-limit';

const router = Router();
const authService = new AuthService();

// Generate or get emergency reset secret
function getEmergencySecret(): string {
  if (process.env.EMERGENCY_ADMIN_SECRET) {
    return process.env.EMERGENCY_ADMIN_SECRET;
  }
  
  // Generate one for this session
  const secret = crypto.randomBytes(32).toString('hex');
  console.log('\n' + '='.repeat(70));
  console.log('🚨 EMERGENCY ADMIN RESET SECRET (Save this!)');
  console.log('='.repeat(70));
  console.log(`Secret: ${secret}`);
  console.log('\nTo reset admin password in emergency:');
  console.log('POST /api/emergency/admin-reset');
  console.log('Header: X-Emergency-Secret: ' + secret);
  console.log('='.repeat(70) + '\n');
  
  process.env.EMERGENCY_ADMIN_SECRET = secret;
  return secret;
}

const EMERGENCY_SECRET = getEmergencySecret();

// Rate limiting for emergency endpoint
const emergencyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 attempts
  message: 'Too many reset attempts',
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation schema
const resetSchema = z.object({
  email: z.string().email(),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[a-z]/, 'Password must contain lowercase letter')
    .regex(/[0-9]/, 'Password must contain number'),
});

export function registerEmergencyRoutes(app: Router) {
  // Emergency admin password reset
  app.post('/api/emergency/admin-reset', emergencyLimiter, async (req, res) => {
    try {
      // Verify emergency secret
      const providedSecret = req.headers['x-emergency-secret'];
      if (!providedSecret || providedSecret !== EMERGENCY_SECRET) {
        console.error('Emergency reset: Invalid secret provided');
        return res.status(404).json({ error: 'Not found' });
      }

      // Validate request body
      const validation = resetSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Invalid request',
          issues: validation.error.issues 
        });
      }

      const { email, newPassword } = validation.data;

      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        console.error('Emergency reset: User not found:', email);
        return res.status(404).json({ error: 'User not found' });
      }

      // Only allow reset for super_admin accounts
      if (user.role !== 'super_admin') {
        console.error('Emergency reset: Not a super admin:', email);
        return res.status(403).json({ error: 'Not authorized for emergency reset' });
      }

      // Hash new password
      const hashedPassword = await authService.hashPassword(newPassword);

      // Update password and clear any reset tokens
      await storage.updateUser(user.id, {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      });

      // Clear all existing sessions for this user
      await db.delete(userSessions).where(eq(userSessions.userId, user.id));

      console.log(`🚨 Emergency password reset for admin: ${email}`);
      console.log(`IP: ${req.ip}, User-Agent: ${req.headers['user-agent']}`);

      res.json({ 
        success: true, 
        message: 'Password reset successfully. Please login with your new password.' 
      });
    } catch (error) {
      console.error('Emergency reset error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Health check for emergency system
  app.get('/api/emergency/status', (req, res) => {
    const secretConfigured = !!process.env.EMERGENCY_ADMIN_SECRET;
    res.json({ 
      emergency_system: 'active',
      secret_configured: secretConfigured,
      message: secretConfigured 
        ? 'Emergency reset available' 
        : 'Emergency secret will be generated on first server start'
    });
  });
}

export default router;
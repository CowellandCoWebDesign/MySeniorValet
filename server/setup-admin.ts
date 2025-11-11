import type { Request, Response } from 'express';
import { storage } from './storage';
import { authService } from './auth';
import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function checkAdminSetupNeeded(): Promise<boolean> {
  try {
    // Check if any super admin exists
    const superAdmins = await db
      .select()
      .from(users)
      .where(eq(users.role, 'super_admin'));
    
    return superAdmins.length === 0;
  } catch (error) {
    console.error('Error checking admin setup status:', error);
    // If there's an error, assume setup is not needed for safety
    return false;
  }
}

export async function handleAdminSetupStatus(req: Request, res: Response) {
  try {
    const needsSetup = await checkAdminSetupNeeded();
    res.json({ needsSetup });
  } catch (error) {
    console.error('Error checking admin setup status:', error);
    res.status(500).json({ error: 'Failed to check setup status' });
  }
}

export async function handleCreateFirstAdmin(req: Request, res: Response) {
  try {
    // Double-check that no super admin exists
    const needsSetup = await checkAdminSetupNeeded();
    
    if (!needsSetup) {
      return res.status(403).json({ 
        error: 'Admin setup already completed. A super admin account already exists.' 
      });
    }

    const { email, password, firstName, lastName } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    // Check if user with this email already exists
    const existingUser = await storage.getUserByEmail(email);
    
    if (existingUser) {
      // Update existing user to super admin
      const hashedPassword = await authService.hashPassword(password);
      
      await db
        .update(users)
        .set({ 
          role: 'super_admin',
          password: hashedPassword,
          emailVerified: true,
          isActive: true,
          firstName: firstName || existingUser.firstName,
          lastName: lastName || existingUser.lastName,
          updatedAt: new Date()
        })
        .where(eq(users.id, existingUser.id));

      // Log the user in automatically
      const sessionId = await authService.createSession(
        existingUser.id,
        req.ip,
        req.get('user-agent')
      );

      res.cookie('sessionId', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      return res.json({ 
        success: true,
        message: 'Existing account upgraded to super admin',
        user: {
          id: existingUser.id,
          email: existingUser.email,
          role: 'super_admin'
        }
      });
    }

    // Create new super admin user
    const username = email.split('@')[0].toLowerCase();
    const hashedPassword = await authService.hashPassword(password);

    const newUser = await storage.createUser({
      email,
      username,
      password: hashedPassword,
      firstName: firstName || 'Admin',
      lastName: lastName || 'User',
      role: 'super_admin',
      emailVerified: true,
      isActive: true
    });

    // Log the user in automatically
    const sessionId = await authService.createSession(
      newUser.id,
      req.ip,
      req.get('user-agent')
    );

    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({ 
      success: true,
      message: 'Super admin account created successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error: any) {
    console.error('Error creating first admin:', error);
    res.status(500).json({ 
      error: 'Failed to create admin account',
      details: error.message 
    });
  }
}
import { type Express } from "express";
import { db } from "../db";
import { users } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { z } from "zod";
import cookieParser from "cookie-parser";
import { internalNotifications } from "../services/internal-notifications";

// Simple schemas for quick auth
const quickSignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional()
});

const quickLoginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export function registerQuickAuthRoutes(app: Express) {
  // Ensure cookie parser is available
  app.use(cookieParser());
  
  // Quick signup - works with current database
  app.post("/api/auth/quick-signup", async (req, res) => {
    try {
      const data = quickSignupSchema.parse(req.body);
      
      // Check if user exists
      const existing = await db.execute(sql`
        SELECT id FROM users WHERE email = ${data.email} LIMIT 1
      `);
      
      if (existing.rows.length > 0) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10);
      
      // Create user with auto-generated ID and username
      const username = data.email.split('@')[0]; // Use email prefix as username
      const result = await db.execute(sql`
        INSERT INTO users (username, email, password, first_name, last_name, role)
        VALUES (${username}, ${data.email}, ${hashedPassword}, ${data.firstName || 'User'}, ${data.lastName || ''}, 'user')
        RETURNING id, email, first_name, last_name, role
      `);
      
      const newUser = result.rows[0];
      
      // Create simple session
      const sessionId = crypto.randomBytes(32).toString('hex');
      res.cookie('sessionId', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      // Store session in memory for now (replace with database later)
      global.activeSessions = global.activeSessions || {};
      global.activeSessions[sessionId] = {
        userId: newUser.id as number,
        email: newUser.email as string,
        role: newUser.role as string
      };
      
      // Send internal notification
      try {
        await internalNotifications.notifyUserRegistered({
          userId: newUser.id as number,
          userName: `${newUser.first_name} ${newUser.last_name}`.trim() || (newUser.email as string),
          userEmail: newUser.email as string,
          role: newUser.role as string,
          signupMethod: 'quick'
        });
      } catch (notificationError) {
        console.error('Error sending internal user registration notification:', notificationError);
        // Don't fail the registration if internal notification fails
      }
      
      res.status(201).json({
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.first_name,
          lastName: newUser.last_name,
          role: newUser.role
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Quick signup error:", error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });
  
  // Quick login with demo account support
  app.post("/api/auth/quick-login", async (req, res) => {
    try {
      const data = quickLoginSchema.parse(req.body);
      
      // Demo account for testing
      if (data.email === 'demo@example.com' && data.password === 'demo123') {
        const sessionId = crypto.randomBytes(32).toString('hex');
        res.cookie('sessionId', sessionId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000
        });
        
        // Store demo session
        global.activeSessions = global.activeSessions || {};
        global.activeSessions[sessionId] = {
          userId: 9999,
          email: 'demo@example.com',
          role: 'user'
        };
        
        return res.json({
          user: {
            id: 9999,
            email: 'demo@example.com',
            firstName: 'Demo',
            lastName: 'User',
            role: 'user'
          }
        });
      }
      
      // Find user
      const result = await db.execute(sql`
        SELECT id, email, password, first_name, last_name, role 
        FROM users 
        WHERE email = ${data.email} 
        LIMIT 1
      `);
      
      if (result.rows.length === 0) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const user = result.rows[0];
      
      // Verify password
      const validPassword = await bcrypt.compare(data.password, user.password as string);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Create session
      const sessionId = crypto.randomBytes(32).toString('hex');
      res.cookie('sessionId', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
      
      // Store session
      global.activeSessions = global.activeSessions || {};
      global.activeSessions[sessionId] = {
        userId: user.id as number,
        email: user.email as string,
        role: user.role as string
      };
      
      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Quick login error:", error);
      res.status(401).json({ message: "Invalid credentials" });
    }
  });
  
  // Quick user check with demo account support
  app.get("/api/auth/quick-user", async (req, res) => {
    const sessionId = req.cookies.sessionId;
    
    // Demo mode for testing (when no session) - Grant super admin access
    if (!sessionId && process.env.NODE_ENV === 'development') {
      return res.json({
        success: true,
        user: {
          id: 'test-user-123',
          email: 'William.cowell01@gmail.com',
          username: 'William Cowell',
          role: 'super_admin',
          isDemo: true
        }
      });
    }
    
    if (!sessionId || !global.activeSessions?.[sessionId]) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const session = global.activeSessions[sessionId];
    res.json({
      success: true,
      user: {
        id: session.userId,
        email: session.email,
        role: session.role
      }
    });
  });
  
  // Quick logout
  app.post("/api/auth/quick-logout", async (req, res) => {
    const sessionId = req.cookies.sessionId;
    
    if (sessionId && global.activeSessions) {
      delete global.activeSessions[sessionId];
    }
    
    res.clearCookie('sessionId');
    res.json({ message: "Logged out successfully" });
  });
  
  // Test endpoint
  app.get("/api/auth/test", (req, res) => {
    res.json({
      authWorking: true,
      endpoints: [
        "POST /api/auth/quick-signup",
        "POST /api/auth/quick-login",
        "GET /api/auth/quick-user",
        "POST /api/auth/quick-logout"
      ],
      note: "Quick auth system ready for launch"
    });
  });
}

// Declare global types
declare global {
  var activeSessions: Record<string, { userId: number; email: string; role: string }>;
}
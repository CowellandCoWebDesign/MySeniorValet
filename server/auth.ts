import bcrypt from 'bcrypt';
import crypto from 'crypto';
import type { User, InsertUser, LoginForm, SignupForm } from '@shared/schema';
import { storage } from './storage';

const SALT_ROUNDS = 10;
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface AuthSession {
  id: string;
  userId: number;
  expiresAt: Date;
}

// In-memory session store (replace with database later)
const sessions = new Map<string, AuthSession>();

export class AuthService {
  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, SALT_ROUNDS);
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  generateSessionId(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  async createSession(userId: number): Promise<string> {
    const sessionId = this.generateSessionId();
    const expiresAt = new Date(Date.now() + SESSION_DURATION);
    
    sessions.set(sessionId, {
      id: sessionId,
      userId,
      expiresAt,
    });

    return sessionId;
  }

  async getSessionUser(sessionId: string): Promise<User | null> {
    const session = sessions.get(sessionId);
    if (!session || session.expiresAt < new Date()) {
      if (session) {
        sessions.delete(sessionId);
      }
      return null;
    }

    const user = await storage.getUser(session.userId);
    return user || null;
  }

  async destroySession(sessionId: string): Promise<void> {
    sessions.delete(sessionId);
  }

  async cleanupExpiredSessions(): Promise<void> {
    const now = new Date();
    for (const [id, session] of sessions.entries()) {
      if (session.expiresAt < now) {
        sessions.delete(id);
      }
    }
  }

  async signup(data: SignupForm): Promise<{ user: User; sessionId: string }> {
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(data.email);
    if (existingUser) {
      throw new Error('An account with this email already exists');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(data.password);

    // Create user
    const userData: InsertUser = {
      email: data.email,
      username: data.email, // Use email as username for now
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      relationshipToCare: data.relationshipToCare,
    };

    const user = await storage.createUser(userData);
    const sessionId = await this.createSession(user.id);

    return { user, sessionId };
  }

  async login(data: LoginForm): Promise<{ user: User; sessionId: string }> {
    // Find user by email
    const user = await storage.getUserByEmail(data.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await this.verifyPassword(data.password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Create session
    const sessionId = await this.createSession(user.id);

    return { user, sessionId };
  }

  async logout(sessionId: string): Promise<void> {
    await this.destroySession(sessionId);
  }
}

export const authService = new AuthService();

// Middleware for protecting routes
export async function requireAuth(req: any, res: any, next: any) {
  const sessionId = req.cookies?.sessionId || req.headers.authorization?.replace('Bearer ', '');
  
  if (!sessionId) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const user = await authService.getSessionUser(sessionId);
  if (!user) {
    return res.status(401).json({ message: 'Invalid or expired session' });
  }

  req.user = user;
  req.sessionId = sessionId;
  next();
}
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { storage } from './storage';
import type { User, LoginForm } from '@shared/schema';

// Simple JWT-based authentication (for demo purposes)
const JWT_SECRET = process.env.JWT_SECRET || 'demo-secret-key-change-in-production';

export class SimpleAuthService {
  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  async login(data: LoginForm): Promise<{ user: User; token: string }> {
    // Find user by email (treating it as username in our simplified schema)
    const user = await storage.getUserByEmail(data.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await this.verifyPassword(data.password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return { user, token };
  }

  async verifyToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; username: string };
      const user = await storage.getUser(decoded.userId);
      return user || null;
    } catch (error) {
      return null;
    }
  }
}

export const simpleAuthService = new SimpleAuthService();

// Middleware for protecting routes
export async function requireSimpleAuth(req: any, res: any, next: any) {
  const token = req.cookies?.authToken || req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const user = await simpleAuthService.verifyToken(token);
  if (!user) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  req.user = user;
  next();
}
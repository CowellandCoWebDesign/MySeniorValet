/**
 * TourMate™ Security Service
 * Enterprise-grade security for tour scheduling
 * Implements rate limiting, fraud detection, data encryption, and audit logging
 */

import crypto from 'crypto';
import { db } from '../db';
import { tours, users, communities, auditLogs } from '@shared/schema';
import { eq, and, gte, sql } from 'drizzle-orm';
import { RateLimiterMemory } from 'rate-limiter-flexible';

// Environment-based encryption key (should be in env vars in production)
const ENCRYPTION_KEY = process.env.TOURMATE_ENCRYPTION_KEY || 
  crypto.scryptSync('TourMate-Enterprise-Security', 'salt', 32);
const IV_LENGTH = 16;

export class TourMateSecurity {
  private static instance: TourMateSecurity;
  
  // Rate limiters for different operations
  private schedulingLimiter = new RateLimiterMemory({
    points: 10, // Number of tours
    duration: 3600, // Per hour
    blockDuration: 3600, // Block for 1 hour
  });
  
  private apiLimiter = new RateLimiterMemory({
    points: 100, // API calls
    duration: 60, // Per minute
    blockDuration: 300, // Block for 5 minutes
  });
  
  private loginLimiter = new RateLimiterMemory({
    points: 5, // Login attempts
    duration: 900, // Per 15 minutes
    blockDuration: 1800, // Block for 30 minutes
  });
  
  // Suspicious activity tracking
  private suspiciousPatterns = new Map<string, number>();
  private blockedIPs = new Set<string>();
  
  private constructor() {
    // Initialize security monitoring
    this.startSecurityMonitoring();
  }
  
  static getInstance(): TourMateSecurity {
    if (!TourMateSecurity.instance) {
      TourMateSecurity.instance = new TourMateSecurity();
    }
    return TourMateSecurity.instance;
  }
  
  /**
   * Encrypt sensitive data
   */
  encrypt(text: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      ENCRYPTION_KEY,
      iv
    );
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }
  
  /**
   * Decrypt sensitive data
   */
  decrypt(text: string): string {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = textParts.join(':');
    
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      ENCRYPTION_KEY,
      iv
    );
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
  
  /**
   * Hash sensitive data for storage
   */
  hashData(data: string): string {
    return crypto
      .createHash('sha256')
      .update(data + process.env.TOURMATE_SALT || 'TourMate-Salt')
      .digest('hex');
  }
  
  /**
   * Check rate limits for tour scheduling
   */
  async checkSchedulingRateLimit(
    identifier: string,
    ipAddress?: string
  ): Promise<{ allowed: boolean; retryAfter?: number }> {
    try {
      // Check IP-based rate limit
      if (ipAddress && this.blockedIPs.has(ipAddress)) {
        await this.logSecurityEvent('BLOCKED_IP_ATTEMPT', { ipAddress });
        return { allowed: false, retryAfter: 3600 };
      }
      
      // Check user-based rate limit
      await this.schedulingLimiter.consume(identifier);
      return { allowed: true };
    } catch (rejRes: any) {
      await this.logSecurityEvent('RATE_LIMIT_EXCEEDED', { 
        identifier,
        type: 'scheduling',
        retryAfter: Math.round(rejRes.msBeforeNext / 1000)
      });
      
      return {
        allowed: false,
        retryAfter: Math.round(rejRes.msBeforeNext / 1000)
      };
    }
  }
  
  /**
   * Check API rate limits
   */
  async checkApiRateLimit(
    identifier: string
  ): Promise<{ allowed: boolean; retryAfter?: number }> {
    try {
      await this.apiLimiter.consume(identifier);
      return { allowed: true };
    } catch (rejRes: any) {
      return {
        allowed: false,
        retryAfter: Math.round(rejRes.msBeforeNext / 1000)
      };
    }
  }
  
  /**
   * Validate and sanitize tour data
   */
  validateTourData(data: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];
    
    // Check for SQL injection patterns
    const sqlPatterns = [
      /(\b(SELECT|UPDATE|DELETE|INSERT|DROP|UNION|ALTER|CREATE)\b)/gi,
      /(--|\/\*|\*\/|;|\||\\)/g
    ];
    
    const checkField = (field: string, value: any) => {
      if (typeof value === 'string') {
        for (const pattern of sqlPatterns) {
          if (pattern.test(value)) {
            errors.push(`Potentially malicious content in ${field}`);
            break;
          }
        }
        
        // Check field length limits
        if (value.length > 1000) {
          errors.push(`${field} exceeds maximum length`);
        }
      }
    };
    
    // Validate all string fields
    Object.entries(data).forEach(([key, value]) => {
      checkField(key, value);
    });
    
    // Validate date is in the future
    if (data.tourDate) {
      const tourDate = new Date(data.tourDate);
      if (tourDate < new Date()) {
        errors.push('Tour date must be in the future');
      }
      if (tourDate > new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)) {
        errors.push('Tour date cannot be more than 1 year in the future');
      }
    }
    
    // Validate attendee count
    if (data.attendeeCount) {
      if (data.attendeeCount < 1 || data.attendeeCount > 20) {
        errors.push('Invalid attendee count');
      }
    }
    
    // Validate email format
    if (data.contactEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.contactEmail)) {
        errors.push('Invalid email format');
      }
    }
    
    // Validate phone format
    if (data.contactPhone) {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(data.contactPhone) || data.contactPhone.length < 10) {
        errors.push('Invalid phone format');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }
  
  /**
   * Detect suspicious activity patterns
   */
  async detectSuspiciousActivity(
    userId: string,
    action: string,
    metadata?: any
  ): Promise<boolean> {
    const key = `${userId}_${action}`;
    const count = (this.suspiciousPatterns.get(key) || 0) + 1;
    this.suspiciousPatterns.set(key, count);
    
    // Define suspicious thresholds
    const suspiciousThresholds: Record<string, number> = {
      rapid_scheduling: 5, // 5 tours in quick succession
      multiple_communities: 10, // Scheduling at 10+ communities
      failed_attempts: 3, // 3 failed attempts
      data_export: 5, // 5 data export attempts
    };
    
    const threshold = suspiciousThresholds[action] || 10;
    
    if (count > threshold) {
      await this.logSecurityEvent('SUSPICIOUS_ACTIVITY', {
        userId,
        action,
        count,
        metadata
      });
      
      // Auto-block after severe suspicious activity
      if (count > threshold * 2) {
        await this.blockUser(userId, 'Automated: Suspicious activity detected');
      }
      
      return true;
    }
    
    // Reset counter after 1 hour
    setTimeout(() => {
      this.suspiciousPatterns.delete(key);
    }, 3600000);
    
    return false;
  }
  
  /**
   * Log security events for audit trail
   */
  async logSecurityEvent(
    eventType: string,
    details: any,
    userId?: string
  ): Promise<void> {
    try {
      // Store in audit logs table
      await db.insert(auditLogs).values({
        userId: userId || 'system',
        action: `TOURMATE_SECURITY_${eventType}`,
        entityType: 'tour',
        entityId: details.tourId || null,
        changes: details,
        ipAddress: details.ipAddress || null,
        userAgent: details.userAgent || null,
        createdAt: new Date()
      });
      
      // Log critical events
      if (['BLOCKED_IP_ATTEMPT', 'SUSPICIOUS_ACTIVITY', 'DATA_BREACH_ATTEMPT'].includes(eventType)) {
        console.error(`[TourMate™ Security Alert] ${eventType}:`, details);
        
        // Would trigger alerts to security team
        // await this.sendSecurityAlert(eventType, details);
      }
    } catch (error) {
      console.error('[TourMate™ Security] Failed to log security event:', error);
    }
  }
  
  /**
   * Block a user temporarily
   */
  async blockUser(userId: string, reason: string): Promise<void> {
    await db.execute(sql`
      UPDATE users 
      SET account_status = 'suspended',
          suspension_reason = ${reason},
          suspension_date = NOW()
      WHERE id = ${userId}
    `);
    
    await this.logSecurityEvent('USER_BLOCKED', { userId, reason });
  }
  
  /**
   * Block an IP address
   */
  blockIP(ipAddress: string, duration: number = 3600000): void {
    this.blockedIPs.add(ipAddress);
    
    // Auto-unblock after duration
    setTimeout(() => {
      this.blockedIPs.delete(ipAddress);
    }, duration);
    
    this.logSecurityEvent('IP_BLOCKED', { ipAddress, duration });
  }
  
  /**
   * Generate secure session token
   */
  generateSecureToken(userId: string): string {
    const timestamp = Date.now();
    const random = crypto.randomBytes(32).toString('hex');
    const hash = crypto
      .createHash('sha256')
      .update(`${userId}-${timestamp}-${random}`)
      .digest('hex');
    
    return Buffer.from(`${timestamp}:${userId}:${hash}`).toString('base64');
  }
  
  /**
   * Verify secure token
   */
  verifySecureToken(token: string): { valid: boolean; userId?: string } {
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf8');
      const [timestamp, userId, hash] = decoded.split(':');
      
      // Check token age (max 24 hours)
      const tokenAge = Date.now() - parseInt(timestamp);
      if (tokenAge > 24 * 60 * 60 * 1000) {
        return { valid: false };
      }
      
      // Verify hash
      const expectedHash = crypto
        .createHash('sha256')
        .update(`${userId}-${timestamp}-${hash.substring(0, 32)}`)
        .digest('hex');
      
      if (hash === expectedHash) {
        return { valid: true, userId };
      }
      
      return { valid: false };
    } catch {
      return { valid: false };
    }
  }
  
  /**
   * Start security monitoring
   */
  private startSecurityMonitoring(): void {
    // Monitor for brute force attacks
    setInterval(async () => {
      // Check for patterns indicating attacks
      const suspiciousCount = this.suspiciousPatterns.size;
      const blockedCount = this.blockedIPs.size;
      
      if (suspiciousCount > 50 || blockedCount > 10) {
        await this.logSecurityEvent('HIGH_THREAT_LEVEL', {
          suspiciousPatterns: suspiciousCount,
          blockedIPs: blockedCount
        });
      }
      
      // Clean up old patterns
      this.suspiciousPatterns.clear();
    }, 300000); // Every 5 minutes
  }
  
  /**
   * Get security metrics
   */
  async getSecurityMetrics(): Promise<any> {
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // Get recent security events
    const recentEvents = await db
      .select()
      .from(auditLogs)
      .where(and(
        gte(auditLogs.createdAt, dayAgo),
        sql`${auditLogs.action} LIKE 'TOURMATE_SECURITY_%'`
      ));
    
    return {
      totalSecurityEvents: recentEvents.length,
      blockedIPs: this.blockedIPs.size,
      suspiciousPatterns: this.suspiciousPatterns.size,
      securityScore: this.calculateSecurityScore(),
      lastThreatDetected: recentEvents[0]?.createdAt || null
    };
  }
  
  private calculateSecurityScore(): number {
    // Base score
    let score = 100;
    
    // Deduct for active threats
    score -= this.blockedIPs.size * 2;
    score -= this.suspiciousPatterns.size;
    
    // Ensure score stays between 0-100
    return Math.max(0, Math.min(100, score));
  }
}

export const tourMateSecurity = TourMateSecurity.getInstance();
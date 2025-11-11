import { db } from "../db";
import { users } from "@shared/schema";
import { sql } from "drizzle-orm";

/**
 * Password Change Logger Middleware
 * Logs all password change attempts for security audit purposes
 */

interface PasswordChangeLog {
  userId: number | string;
  email: string;
  action: 'password_changed' | 'password_reset' | 'password_created';
  initiator: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

export class PasswordChangeLogger {
  private static logs: PasswordChangeLog[] = [];
  private static slidingWindows: Map<string, { count: number; windowStart: Date }> = new Map();
  private static recentAlerts: Map<string, Date> = new Map();

  // Thresholds for different actions
  private static readonly THRESHOLDS = {
    password_reset: { perMinute: 3, perIP: 5 },
    password_changed: { perMinute: 5, perIP: 7 },
    password_created: { perMinute: 10, perIP: 15 }
  };

  static async logPasswordChange(
    userId: number | string,
    email: string,
    action: PasswordChangeLog['action'],
    initiator: string = 'system',
    ipAddress?: string,
    userAgent?: string
  ) {
    const log: PasswordChangeLog = {
      userId,
      email,
      action,
      initiator,
      timestamp: new Date(),
      ipAddress,
      userAgent
    };

    // Add to in-memory logs
    this.logs.push(log);

    // Log to console with appropriate visibility level
    const isHighRisk = action === 'password_reset' || action === 'password_changed';
    if (isHighRisk) {
      console.log('🔐 PASSWORD CHANGE ALERT 🔐');
      console.log('━'.repeat(50));
      console.log(`User: ${email} (ID: ${userId})`);
      console.log(`Action: ${action}`);
      console.log(`Initiator: ${initiator}`);
      console.log(`Time: ${log.timestamp.toISOString()}`);
      if (ipAddress) console.log(`IP: ${ipAddress}`);
      console.log('━'.repeat(50));
    } else {
      console.log(`✅ Password created for ${email} via ${initiator}`);
    }

    // Store in database audit table if it exists
    try {
      await db.execute(sql`
        INSERT INTO password_audit_log (user_id, email, action, initiator, ip_address, user_agent, created_at)
        VALUES (${userId}, ${email}, ${action}, ${initiator}, ${ipAddress || null}, ${userAgent || null}, ${log.timestamp})
        ON CONFLICT DO NOTHING
      `);
    } catch (error) {
      // Table might not exist yet, that's ok during initial setup
    }

    // Multi-dimensional anomaly detection
    this.detectAnomalies(action, initiator, ipAddress);
  }

  private static detectAnomalies(action: string, initiator: string, ipAddress?: string) {
    const now = new Date();
    const windowSize = 60000; // 1 minute window

    // Clean old windows
    for (const [key, window] of this.slidingWindows.entries()) {
      if (window.windowStart.getTime() < now.getTime() - windowSize) {
        this.slidingWindows.delete(key);
      }
    }

    // Track by action type
    const actionKey = `action:${action}`;
    const actionWindow = this.slidingWindows.get(actionKey) || { count: 0, windowStart: now };
    actionWindow.count++;
    this.slidingWindows.set(actionKey, actionWindow);

    // Track by IP if available
    let ipWindow;
    if (ipAddress) {
      const ipKey = `ip:${ipAddress}:${action}`;
      ipWindow = this.slidingWindows.get(ipKey) || { count: 0, windowStart: now };
      ipWindow.count++;
      this.slidingWindows.set(ipKey, ipWindow);
    }

    // Track by initiator
    const initiatorKey = `initiator:${initiator}:${action}`;
    const initiatorWindow = this.slidingWindows.get(initiatorKey) || { count: 0, windowStart: now };
    initiatorWindow.count++;
    this.slidingWindows.set(initiatorKey, initiatorWindow);

    // Check thresholds
    const threshold = this.THRESHOLDS[action as keyof typeof this.THRESHOLDS] || { perMinute: 10, perIP: 15 };
    
    let alertLevel = 0;
    let alertReasons: string[] = [];

    if (actionWindow.count > threshold.perMinute) {
      alertLevel = Math.max(alertLevel, 2);
      alertReasons.push(`${actionWindow.count} ${action} operations in 1 minute (threshold: ${threshold.perMinute})`);
    }

    if (ipWindow && ipWindow.count > threshold.perIP) {
      alertLevel = Math.max(alertLevel, 3);
      alertReasons.push(`${ipWindow.count} ${action} operations from IP ${ipAddress} (threshold: ${threshold.perIP})`);
    }

    if (initiatorWindow.count > threshold.perMinute * 2) {
      alertLevel = Math.max(alertLevel, 2);
      alertReasons.push(`${initiatorWindow.count} operations via ${initiator}`);
    }

    // Send deduplicated alerts
    if (alertLevel > 0) {
      const alertKey = `${action}:${initiator}:${ipAddress || 'no-ip'}`;
      const lastAlert = this.recentAlerts.get(alertKey);
      
      // Only alert if we haven't alerted for this combination in the last 5 minutes
      if (!lastAlert || lastAlert.getTime() < now.getTime() - 300000) {
        this.recentAlerts.set(alertKey, now);
        
        const alertSymbol = alertLevel === 3 ? '🚨' : alertLevel === 2 ? '⚠️' : 'ℹ️';
        console.error(`\n${alertSymbol} SECURITY ALERT - BULK PASSWORD OPERATION DETECTED`);
        console.error('Level:', alertLevel === 3 ? 'CRITICAL' : alertLevel === 2 ? 'WARNING' : 'INFO');
        console.error('Reasons:', alertReasons.join('; '));
        console.error('Time:', now.toISOString());
        console.error('Consider investigating or temporarily blocking suspicious IPs\n');
      }
    }
  }

  static getRecentLogs(minutes: number = 60): PasswordChangeLog[] {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    return this.logs.filter(l => l.timestamp.getTime() > cutoff);
  }

  static async createAuditTable() {
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS password_audit_log (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(255),
          email VARCHAR(255),
          action VARCHAR(50),
          initiator VARCHAR(100),
          ip_address VARCHAR(45),
          user_agent TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      console.log('✅ Password audit table created');

      // Create index for faster queries
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_password_audit_email ON password_audit_log(email);
        CREATE INDEX IF NOT EXISTS idx_password_audit_created ON password_audit_log(created_at);
      `);
    } catch (error) {
      console.error('Error creating audit table:', error);
    }
  }
}

// Export for use in auth services
export default PasswordChangeLogger;
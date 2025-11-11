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

    // Log to console with high visibility
    console.log('🔐 PASSWORD CHANGE ALERT 🔐');
    console.log('━'.repeat(50));
    console.log(`User: ${email} (ID: ${userId})`);
    console.log(`Action: ${action}`);
    console.log(`Initiator: ${initiator}`);
    console.log(`Time: ${log.timestamp.toISOString()}`);
    if (ipAddress) console.log(`IP: ${ipAddress}`);
    if (userAgent) console.log(`User Agent: ${userAgent}`);
    console.log('━'.repeat(50));

    // Store in database audit table if it exists
    try {
      await db.execute(sql`
        INSERT INTO password_audit_log (user_id, email, action, initiator, ip_address, user_agent, created_at)
        VALUES (${userId}, ${email}, ${action}, ${initiator}, ${ipAddress || null}, ${userAgent || null}, ${log.timestamp})
        ON CONFLICT DO NOTHING
      `);
    } catch (error) {
      // Table might not exist yet, that's ok
      console.log('Note: Password audit table not yet created');
    }

    // Alert if bulk password changes detected
    const recentLogs = this.logs.filter(l => 
      l.timestamp.getTime() > Date.now() - 60000 // Last minute
    );

    if (recentLogs.length > 3) {
      console.error('⚠️ SECURITY ALERT: Multiple password changes detected in last minute!');
      console.error(`${recentLogs.length} passwords changed. Possible bulk operation.`);
      console.error('Affected users:', recentLogs.map(l => l.email).join(', '));
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
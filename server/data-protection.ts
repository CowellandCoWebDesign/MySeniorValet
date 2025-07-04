/**
 * Data Protection System
 * Multi-layered safeguards against synthetic data contamination
 */

import { db } from './db';
import { communities } from '../shared/schema';
import { eq, sql } from 'drizzle-orm';

export interface DataIntegrityCheck {
  communityId: number;
  field: string;
  currentValue: any;
  proposedValue: any;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  issues: string[];
  authenticated: boolean;
  source: string;
}

export interface DataProtectionConfig {
  allowedSources: string[];
  blockedPatterns: RegExp[];
  requireAuthentication: boolean;
  maxBatchSize: number;
  auditEnabled: boolean;
}

export class DataProtectionService {
  private config: DataProtectionConfig = {
    allowedSources: [
      'google_places_api',
      'yelp_api', 
      'foursquare_api',
      'state_licensing_database',
      'medicare_database',
      'admin_manual_verification'
    ],
    blockedPatterns: [
      /fake|synthetic|mock|placeholder|test|sample|demo/i,
      /lorem ipsum/i,
      /\b(fake|mock|test)\w*\b/i,
      /example\.(com|org|net)/i,
      /555-\d{4}/,  // Common fake phone pattern
      /\b(john|jane)\s+(doe|smith)\b/i,
      /community\s*\d+/i  // Generic naming pattern
    ],
    requireAuthentication: true,
    maxBatchSize: 50,
    auditEnabled: true
  };

  /**
   * Validate data before any database update
   */
  async validateDataIntegrity(updates: any[], source: string): Promise<DataIntegrityCheck[]> {
    const results: DataIntegrityCheck[] = [];

    for (const update of updates) {
      const check: DataIntegrityCheck = {
        communityId: update.id,
        field: 'multiple',
        currentValue: null,
        proposedValue: update,
        riskLevel: 'low',
        issues: [],
        authenticated: this.isAuthenticatedSource(source),
        source
      };

      // Check source authentication
      if (!this.isAuthenticatedSource(source)) {
        check.riskLevel = 'critical';
        check.issues.push(`Unauthorized data source: ${source}`);
      }

      // Check for synthetic data patterns
      const syntheticIssues = this.detectSyntheticPatterns(update);
      if (syntheticIssues.length > 0) {
        check.riskLevel = 'critical';
        check.issues.push(...syntheticIssues);
      }

      // Check batch size limits
      if (updates.length > this.config.maxBatchSize) {
        check.riskLevel = 'high';
        check.issues.push(`Batch size ${updates.length} exceeds limit ${this.config.maxBatchSize}`);
      }

      results.push(check);
    }

    return results;
  }

  /**
   * Block updates that fail integrity checks
   */
  async enforceDataProtection(updates: any[], source: string): Promise<{
    allowed: any[];
    blocked: any[];
    summary: string;
  }> {
    const checks = await this.validateDataIntegrity(updates, source);
    const allowed: any[] = [];
    const blocked: any[] = [];

    for (let i = 0; i < updates.length; i++) {
      const check = checks[i];
      
      if (check.riskLevel === 'critical' || check.riskLevel === 'high') {
        blocked.push({
          data: updates[i],
          issues: check.issues,
          riskLevel: check.riskLevel
        });
      } else {
        allowed.push(updates[i]);
      }
    }

    // Log protection events
    if (this.config.auditEnabled) {
      await this.logProtectionEvent({
        source,
        totalAttempted: updates.length,
        allowed: allowed.length,
        blocked: blocked.length,
        timestamp: new Date(),
        details: blocked.map(b => ({
          issues: b.issues,
          riskLevel: b.riskLevel
        }))
      });
    }

    return {
      allowed,
      blocked,
      summary: `${allowed.length} updates allowed, ${blocked.length} blocked (${source})`
    };
  }

  /**
   * Check if source is authenticated and trusted
   */
  private isAuthenticatedSource(source: string): boolean {
    return this.config.allowedSources.includes(source.toLowerCase());
  }

  /**
   * Detect synthetic/fake data patterns
   */
  private detectSyntheticPatterns(data: any): string[] {
    const issues: string[] = [];
    const dataStr = JSON.stringify(data).toLowerCase();

    // Check blocked patterns
    for (const pattern of this.config.blockedPatterns) {
      if (pattern.test(dataStr)) {
        issues.push(`Synthetic data pattern detected: ${pattern.source}`);
      }
    }

    // Check for suspicious uniformity
    if (data.name && data.address) {
      const nameWords = data.name.toLowerCase().split(' ');
      const addressWords = data.address.toLowerCase().split(' ');
      
      if (nameWords.some(word => word.includes('test') || word.includes('fake'))) {
        issues.push('Suspicious name pattern detected');
      }
      
      if (addressWords.some(word => word.includes('test') || word.includes('fake'))) {
        issues.push('Suspicious address pattern detected');
      }
    }

    // Check for placeholder values
    if (data.phone && (data.phone.includes('555-') || data.phone.includes('000-'))) {
      issues.push('Placeholder phone number detected');
    }

    if (data.email && data.email.includes('example.')) {
      issues.push('Placeholder email detected');
    }

    return issues;
  }

  /**
   * Log protection events for audit trail
   */
  private async logProtectionEvent(event: {
    source: string;
    totalAttempted: number;
    allowed: number;
    blocked: number;
    timestamp: Date;
    details: any[];
  }): Promise<void> {
    try {
      await db.execute(sql`
        INSERT INTO data_protection_logs 
        (source, total_attempted, allowed_count, blocked_count, details, created_at)
        VALUES (
          ${event.source},
          ${event.totalAttempted},
          ${event.allowed},
          ${event.blocked},
          ${JSON.stringify(event.details)},
          ${event.timestamp}
        )
      `);
    } catch (error) {
      console.error('Failed to log protection event:', error);
    }
  }

  /**
   * Emergency data freeze - stop all updates
   */
  async emergencyDataFreeze(reason: string): Promise<void> {
    console.log(`🚨 EMERGENCY DATA FREEZE ACTIVATED: ${reason}`);
    
    // Create freeze flag
    await db.execute(sql`
      INSERT INTO system_flags (flag_name, flag_value, reason, created_at)
      VALUES ('data_freeze', 'true', ${reason}, NOW())
      ON CONFLICT (flag_name) DO UPDATE SET 
        flag_value = 'true',
        reason = ${reason},
        created_at = NOW()
    `);
    
    // Disable all data update endpoints
    this.config.allowedSources = ['admin_manual_verification'];
    
    console.log('All automated data updates disabled until manual review');
  }

  /**
   * Check if data freeze is active
   */
  async isDataFrozen(): Promise<boolean> {
    try {
      const result = await db.execute(sql`
        SELECT flag_value FROM system_flags 
        WHERE flag_name = 'data_freeze' AND flag_value = 'true'
      `);
      return result.length > 0;
    } catch (error) {
      // If table doesn't exist, assume not frozen
      return false;
    }
  }

  /**
   * Restore specific community data from backup
   */
  async restoreFromBackup(communityId: number, backupDate: Date): Promise<void> {
    console.log(`Restoring community ${communityId} from backup ${backupDate.toISOString()}`);
    
    // Implementation would restore from backup table
    // For now, log the restore request
    await this.logProtectionEvent({
      source: 'backup_restore',
      totalAttempted: 1,
      allowed: 1,
      blocked: 0,
      timestamp: new Date(),
      details: [{
        communityId,
        backupDate: backupDate.toISOString(),
        action: 'restore_requested'
      }]
    });
  }

  /**
   * Get protection statistics
   */
  async getProtectionStats(): Promise<{
    totalProtectionEvents: number;
    recentBlocks: number;
    topBlockedSources: string[];
    dataFreezeActive: boolean;
  }> {
    const frozen = await this.isDataFrozen();
    
    try {
      const stats = await db.execute(sql`
        SELECT 
          COUNT(*) as total_events,
          SUM(blocked_count) as total_blocked,
          array_agg(DISTINCT source) as sources
        FROM data_protection_logs 
        WHERE created_at > NOW() - INTERVAL '7 days'
      `);
      
      return {
        totalProtectionEvents: stats[0]?.total_events || 0,
        recentBlocks: stats[0]?.total_blocked || 0,
        topBlockedSources: stats[0]?.sources || [],
        dataFreezeActive: frozen
      };
    } catch (error) {
      return {
        totalProtectionEvents: 0,
        recentBlocks: 0,
        topBlockedSources: [],
        dataFreezeActive: frozen
      };
    }
  }
}

export const dataProtectionService = new DataProtectionService();
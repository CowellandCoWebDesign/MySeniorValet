import { db } from '../db';
import { communities } from '@shared/schema';
import { eq, and, sql, desc } from 'drizzle-orm';
import { sendEmail } from './notification-service';

interface AuditReport {
  timestamp: Date;
  totalCommunities: number;
  duplicatesFound: number;
  testDataFound: number;
  deactivated: number;
  warnings: string[];
  details: Array<{
    type: 'duplicate' | 'test_data';
    communities: Array<{
      id: number;
      name: string;
      address: string;
      city: string;
      state: string;
    }>;
  }>;
}

export class ScheduledAuditService {
  private static auditInterval: NodeJS.Timeout | null = null;
  private static lastAuditReport: AuditReport | null = null;

  /**
   * Start the scheduled audit service
   * Runs immediately on start, then monthly
   */
  public static startScheduledAudits(): void {
    // Run immediately on startup
    this.runAudit();

    // Then schedule monthly (on the 1st of each month at 2 AM)
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 2, 0, 0, 0);
    const timeUntilNextMonth = nextMonth.getTime() - now.getTime();

    // Schedule first run for next month
    setTimeout(() => {
      this.runAudit();
      
      // Then run monthly
      this.auditInterval = setInterval(() => {
        this.runAudit();
      }, 30 * 24 * 60 * 60 * 1000); // 30 days
    }, timeUntilNextMonth);

    console.log('📊 Scheduled audit service started. Next audit:', nextMonth.toLocaleString());
  }

  /**
   * Stop the scheduled audit service
   */
  public static stopScheduledAudits(): void {
    if (this.auditInterval) {
      clearInterval(this.auditInterval);
      this.auditInterval = null;
      console.log('📊 Scheduled audit service stopped');
    }
  }

  /**
   * Run a comprehensive data integrity audit
   */
  public static async runAudit(): Promise<AuditReport> {
    console.log('🔍 Starting monthly data integrity audit...');

    const report: AuditReport = {
      timestamp: new Date(),
      totalCommunities: 0,
      duplicatesFound: 0,
      testDataFound: 0,
      deactivated: 0,
      warnings: [],
      details: []
    };

    try {
      // 1. Count total active communities
      const totalResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(communities)
        .where(eq(communities.isActive, true));
      
      report.totalCommunities = Number(totalResult[0]?.count || 0);

      // 2. Find duplicates
      const duplicates = await this.findDuplicates();
      if (duplicates.length > 0) {
        report.duplicatesFound = duplicates.length;
        report.details.push({
          type: 'duplicate',
          communities: duplicates
        });
        report.warnings.push(`Found ${duplicates.length} duplicate communities`);
      }

      // 3. Find test data
      const testData = await this.findTestData();
      if (testData.length > 0) {
        report.testDataFound = testData.length;
        report.details.push({
          type: 'test_data',
          communities: testData
        });
        report.warnings.push(`Found ${testData.length} communities with test data patterns`);
      }

      // 4. Auto-deactivate if configured (disabled by default for safety)
      if (process.env.AUTO_DEACTIVATE_DUPLICATES === 'true') {
        const deactivated = await this.deactivateDuplicatesAndTestData(duplicates, testData);
        report.deactivated = deactivated;
      }

      // 5. Store the report
      this.lastAuditReport = report;

      // 6. Send notification if issues found
      if (report.duplicatesFound > 0 || report.testDataFound > 0) {
        await this.sendAuditNotification(report);
      }

      console.log(`✅ Audit complete: ${report.totalCommunities} communities, ${report.duplicatesFound} duplicates, ${report.testDataFound} test data`);

      return report;
    } catch (error) {
      console.error('❌ Audit failed:', error);
      report.warnings.push(`Audit error: ${error.message}`);
      return report;
    }
  }

  /**
   * Find duplicate communities
   */
  private static async findDuplicates(): Promise<Array<any>> {
    const duplicatesQuery = await db.execute(sql`
      WITH duplicates AS (
        SELECT 
          LOWER(name) as lower_name,
          LOWER(address) as lower_address,
          LOWER(city) as lower_city,
          COUNT(*) as duplicate_count
        FROM communities
        WHERE is_active = true
        GROUP BY LOWER(name), LOWER(address), LOWER(city)
        HAVING COUNT(*) > 1
      )
      SELECT 
        c.id,
        c.name,
        c.address,
        c.city,
        c.state
      FROM communities c
      INNER JOIN duplicates d ON (
        LOWER(c.name) = d.lower_name 
        AND LOWER(c.address) = d.lower_address 
        AND LOWER(c.city) = d.lower_city
      )
      WHERE c.is_active = true
      ORDER BY d.lower_name, c.id
    `);

    return duplicatesQuery.rows || [];
  }

  /**
   * Find communities with test data patterns
   */
  private static async findTestData(): Promise<Array<any>> {
    const testDataQuery = await db.execute(sql`
      SELECT 
        id,
        name,
        address,
        city,
        state
      FROM communities
      WHERE is_active = true
        AND (
          -- Test addresses
          address ILIKE '123 Main St%'
          OR address ILIKE '2123 Main St%'
          OR address = '1234 Wilshire Blvd'
          
          -- Test phone numbers
          OR phone = '000-000-0001'
          OR phone = '111-111-1111'
          OR phone = '123-456-7890'
          OR phone = '555-555-5555'
          
          -- Test names
          OR name ILIKE 'Test%'
          OR name ILIKE 'Sample%'
          OR name ILIKE 'Demo%'
          OR name ILIKE 'Placeholder%'
          
          -- Name is just an address
          OR name ~ '^\d+\s+.+\s+(St|Street|Ave|Avenue|Blvd|Boulevard|Rd|Road)'
        )
      LIMIT 100
    `);

    return testDataQuery.rows || [];
  }

  /**
   * Deactivate duplicates and test data (keeping first of duplicates)
   */
  private static async deactivateDuplicatesAndTestData(
    duplicates: Array<any>,
    testData: Array<any>
  ): Promise<number> {
    let deactivatedCount = 0;

    // Group duplicates and keep only the first ID
    const duplicateGroups = new Map<string, number[]>();
    duplicates.forEach(dup => {
      const key = `${dup.name?.toLowerCase()}_${dup.address?.toLowerCase()}_${dup.city?.toLowerCase()}`;
      if (!duplicateGroups.has(key)) {
        duplicateGroups.set(key, []);
      }
      duplicateGroups.get(key)!.push(dup.id);
    });

    // Collect IDs to deactivate (all but first in each group)
    const idsToDeactivate: number[] = [];
    
    duplicateGroups.forEach(ids => {
      ids.sort((a, b) => a - b); // Keep the lowest ID
      idsToDeactivate.push(...ids.slice(1)); // Deactivate all others
    });

    // Add test data IDs
    testData.forEach(td => {
      if (!idsToDeactivate.includes(td.id)) {
        idsToDeactivate.push(td.id);
      }
    });

    // Deactivate in batches
    if (idsToDeactivate.length > 0) {
      const result = await db
        .update(communities)
        .set({
          isActive: false,
          enrichmentStatus: 'failed',
          updatedAt: new Date()
        })
        .where(sql`id = ANY(${idsToDeactivate})`);
      
      deactivatedCount = idsToDeactivate.length;
    }

    return deactivatedCount;
  }

  /**
   * Send audit notification email
   */
  private static async sendAuditNotification(report: AuditReport): Promise<void> {
    const subject = `🔍 Monthly Data Integrity Audit - ${report.duplicatesFound + report.testDataFound} Issues Found`;
    
    const htmlContent = `
      <h2>Monthly Data Integrity Audit Report</h2>
      <p><strong>Date:</strong> ${report.timestamp.toLocaleString()}</p>
      <p><strong>Total Active Communities:</strong> ${report.totalCommunities.toLocaleString()}</p>
      
      <h3>Issues Found:</h3>
      <ul>
        <li><strong>Duplicates:</strong> ${report.duplicatesFound}</li>
        <li><strong>Test Data:</strong> ${report.testDataFound}</li>
        <li><strong>Auto-Deactivated:</strong> ${report.deactivated}</li>
      </ul>
      
      ${report.warnings.length > 0 ? `
        <h3>Warnings:</h3>
        <ul>
          ${report.warnings.map(w => `<li>${w}</li>`).join('')}
        </ul>
      ` : ''}
      
      <p>Review the admin dashboard for detailed information.</p>
    `;

    try {
      // Send to admin email
      await sendEmail({
        to: 'admin@myseniorvalet.com',
        subject,
        html: htmlContent
      });
      
      console.log('📧 Audit notification sent to admin');
    } catch (error) {
      console.error('Failed to send audit notification:', error);
    }
  }

  /**
   * Get the last audit report
   */
  public static getLastAuditReport(): AuditReport | null {
    return this.lastAuditReport;
  }

  /**
   * Manually trigger an audit (for admin dashboard)
   */
  public static async manualAudit(): Promise<AuditReport> {
    console.log('🔍 Manual audit triggered by admin');
    return this.runAudit();
  }
}
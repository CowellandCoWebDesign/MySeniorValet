import { sendEmail } from '../sendgrid-service';
import ComprehensiveNotificationService from './comprehensive-notifications';

interface EmailTestResult {
  testId: string;
  timestamp: Date;
  recipient: string;
  type: string;
  success: boolean;
  deliveryTime?: number;
  error?: string;
  metadata?: any;
}

export class ProductionEmailTester {
  private static testResults: EmailTestResult[] = [];

  static async runProductionTest(recipientEmail: string = 'admin@myseniorvalet.com'): Promise<{
    success: boolean;
    results: EmailTestResult[];
    summary: any;
  }> {
    console.log('🧪 Starting Production Email Delivery Test...');
    const testId = `test_${Date.now()}`;
    const results: EmailTestResult[] = [];

    // Test 1: Direct SendGrid Email
    const directTest = await this.testDirectEmail(testId, recipientEmail);
    results.push(directTest);

    // Test 2: Community Claim Notification
    const claimTest = await this.testCommunityClaimEmail(testId);
    results.push(claimTest);

    // Test 3: Tour Scheduling Notification
    const tourTest = await this.testTourSchedulingEmail(testId);
    results.push(tourTest);

    // Test 4: Emergency Contact (Low Priority)
    const emergencyTest = await this.testEmergencyEmail(testId);
    results.push(emergencyTest);

    // Test 5: Batch Email Performance
    const batchTest = await this.testBatchEmails(testId);
    results.push(...batchTest);

    // Store results
    this.testResults.push(...results);

    // Generate summary
    const summary = this.generateTestSummary(results);

    // Send test report
    await this.sendTestReport(recipientEmail, results, summary);

    return {
      success: summary.overallSuccess,
      results,
      summary
    };
  }

  private static async testDirectEmail(testId: string, recipient: string): Promise<EmailTestResult> {
    const startTime = Date.now();
    try {
      const success = await sendEmail({
        to: recipient,
        from: 'hello@myseniorvalet.com',
        subject: `[TEST ${testId}] Direct SendGrid Email Test`,
        html: `
          <h2>Production Email Test - Direct SendGrid</h2>
          <p>Test ID: ${testId}</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
          <p>This is a direct SendGrid API test to verify email delivery.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            This is an automated test email from MySeniorValet production system.
          </p>
        `
      });

      const deliveryTime = Date.now() - startTime;
      
      return {
        testId,
        timestamp: new Date(),
        recipient,
        type: 'direct_sendgrid',
        success,
        deliveryTime,
        metadata: { method: 'sendEmail' }
      };
    } catch (error: any) {
      return {
        testId,
        timestamp: new Date(),
        recipient,
        type: 'direct_sendgrid',
        success: false,
        error: error.message,
        metadata: { method: 'sendEmail' }
      };
    }
  }

  private static async testCommunityClaimEmail(testId: string): Promise<EmailTestResult> {
    const startTime = Date.now();
    try {
      await ComprehensiveNotificationService.notifyCommunityClaimSubmitted({
        communityId: 999999,
        communityName: `Test Community ${testId}`,
        claimantName: 'Test Manager',
        claimantEmail: 'test@myseniorvalet.com',
        claimantPhone: '555-TEST',
        message: `Production test claim ${testId}`
      });

      const deliveryTime = Date.now() - startTime;
      
      return {
        testId,
        timestamp: new Date(),
        recipient: 'test@myseniorvalet.com',
        type: 'community_claim',
        success: true,
        deliveryTime,
        metadata: { notificationType: 'COMMUNITY_CLAIM' }
      };
    } catch (error: any) {
      return {
        testId,
        timestamp: new Date(),
        recipient: 'test@myseniorvalet.com',
        type: 'community_claim',
        success: false,
        error: error.message,
        metadata: { notificationType: 'COMMUNITY_CLAIM' }
      };
    }
  }

  private static async testTourSchedulingEmail(testId: string): Promise<EmailTestResult> {
    const startTime = Date.now();
    try {
      await ComprehensiveNotificationService.notifyTourScheduled({
        tourId: `test_tour_${testId}`,
        communityId: 999999,
        communityName: `Test Community ${testId}`,
        visitorName: 'Test Visitor',
        visitorEmail: 'visitor.test@myseniorvalet.com',
        tourDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        tourTime: '10:00 AM',
        phoneNumber: '555-TOUR'
      });

      const deliveryTime = Date.now() - startTime;
      
      return {
        testId,
        timestamp: new Date(),
        recipient: 'visitor.test@myseniorvalet.com',
        type: 'tour_scheduled',
        success: true,
        deliveryTime,
        metadata: { notificationType: 'TOUR_SCHEDULED' }
      };
    } catch (error: any) {
      return {
        testId,
        timestamp: new Date(),
        recipient: 'visitor.test@myseniorvalet.com',
        type: 'tour_scheduled',
        success: false,
        error: error.message,
        metadata: { notificationType: 'TOUR_SCHEDULED' }
      };
    }
  }

  private static async testEmergencyEmail(testId: string): Promise<EmailTestResult> {
    const startTime = Date.now();
    try {
      await ComprehensiveNotificationService.notifyEmergencyContact({
        userName: 'Test Emergency User',
        userEmail: 'emergency.test@myseniorvalet.com',
        userLocation: 'Test Location',
        message: `PRODUCTION TEST ONLY - Not a real emergency (${testId})`,
        contactNumber: '555-SAFE',
        urgency: 'low'
      });

      const deliveryTime = Date.now() - startTime;
      
      return {
        testId,
        timestamp: new Date(),
        recipient: 'admin@myseniorvalet.com',
        type: 'emergency_contact',
        success: true,
        deliveryTime,
        metadata: { 
          notificationType: 'EMERGENCY_CONTACT',
          urgency: 'low',
          testOnly: true
        }
      };
    } catch (error: any) {
      return {
        testId,
        timestamp: new Date(),
        recipient: 'admin@myseniorvalet.com',
        type: 'emergency_contact',
        success: false,
        error: error.message,
        metadata: { 
          notificationType: 'EMERGENCY_CONTACT',
          urgency: 'low',
          testOnly: true
        }
      };
    }
  }

  private static async testBatchEmails(testId: string): Promise<EmailTestResult[]> {
    const results: EmailTestResult[] = [];
    const batchSize = 5;
    const recipients = [
      'batch1.test@myseniorvalet.com',
      'batch2.test@myseniorvalet.com',
      'batch3.test@myseniorvalet.com',
      'batch4.test@myseniorvalet.com',
      'batch5.test@myseniorvalet.com'
    ];

    console.log(`📧 Testing batch email delivery (${batchSize} emails)...`);

    for (let i = 0; i < batchSize; i++) {
      const startTime = Date.now();
      try {
        const success = await sendEmail({
          to: recipients[i],
          from: 'hello@myseniorvalet.com',
          subject: `[BATCH TEST ${i + 1}/${batchSize}] ${testId}`,
          html: `
            <h3>Batch Email Test ${i + 1} of ${batchSize}</h3>
            <p>Testing email delivery performance and reliability.</p>
            <p>Test ID: ${testId}</p>
            <p>Batch Position: ${i + 1}</p>
          `
        });

        results.push({
          testId,
          timestamp: new Date(),
          recipient: recipients[i],
          type: `batch_email_${i + 1}`,
          success,
          deliveryTime: Date.now() - startTime,
          metadata: { batchPosition: i + 1, batchSize }
        });

        // Small delay between emails to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error: any) {
        results.push({
          testId,
          timestamp: new Date(),
          recipient: recipients[i],
          type: `batch_email_${i + 1}`,
          success: false,
          error: error.message,
          metadata: { batchPosition: i + 1, batchSize }
        });
      }
    }

    return results;
  }

  private static generateTestSummary(results: EmailTestResult[]) {
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    const avgDeliveryTime = successful.length > 0
      ? successful.reduce((sum, r) => sum + (r.deliveryTime || 0), 0) / successful.length
      : 0;

    const byType = results.reduce((acc, r) => {
      acc[r.type] = {
        total: (acc[r.type]?.total || 0) + 1,
        success: (acc[r.type]?.success || 0) + (r.success ? 1 : 0),
        failed: (acc[r.type]?.failed || 0) + (r.success ? 0 : 1)
      };
      return acc;
    }, {} as Record<string, any>);

    return {
      overallSuccess: failed.length === 0,
      totalTests: results.length,
      successful: successful.length,
      failed: failed.length,
      successRate: (successful.length / results.length * 100).toFixed(1) + '%',
      avgDeliveryTime: Math.round(avgDeliveryTime) + 'ms',
      byType,
      errors: failed.map(f => ({
        type: f.type,
        error: f.error
      }))
    };
  }

  private static async sendTestReport(
    recipient: string, 
    results: EmailTestResult[], 
    summary: any
  ) {
    const reportHtml = `
      <h2>📊 Production Email Test Report</h2>
      
      <div style="background: ${summary.overallSuccess ? '#d4edda' : '#f8d7da'}; 
                  border: 1px solid ${summary.overallSuccess ? '#28a745' : '#dc3545'}; 
                  padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: ${summary.overallSuccess ? '#155724' : '#721c24'};">
          ${summary.overallSuccess ? '✅ All Tests Passed' : '❌ Some Tests Failed'}
        </h3>
        <ul>
          <li>Success Rate: ${summary.successRate}</li>
          <li>Tests Run: ${summary.totalTests}</li>
          <li>Successful: ${summary.successful}</li>
          <li>Failed: ${summary.failed}</li>
          <li>Avg Delivery Time: ${summary.avgDeliveryTime}</li>
        </ul>
      </div>

      <h3>Test Results by Type:</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f8f9fa;">
            <th style="border: 1px solid #dee2e6; padding: 8px;">Type</th>
            <th style="border: 1px solid #dee2e6; padding: 8px;">Total</th>
            <th style="border: 1px solid #dee2e6; padding: 8px;">Success</th>
            <th style="border: 1px solid #dee2e6; padding: 8px;">Failed</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(summary.byType).map(([type, data]: [string, any]) => `
            <tr>
              <td style="border: 1px solid #dee2e6; padding: 8px;">${type}</td>
              <td style="border: 1px solid #dee2e6; padding: 8px;">${data.total}</td>
              <td style="border: 1px solid #dee2e6; padding: 8px; color: green;">${data.success}</td>
              <td style="border: 1px solid #dee2e6; padding: 8px; color: red;">${data.failed}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      ${summary.errors.length > 0 ? `
        <h3 style="color: red;">⚠️ Errors Encountered:</h3>
        <ul>
          ${summary.errors.map((e: any) => `
            <li><strong>${e.type}:</strong> ${e.error}</li>
          `).join('')}
        </ul>
      ` : ''}

      <hr>
      <p style="color: #666; font-size: 12px;">
        Test completed at ${new Date().toISOString()}<br>
        MySeniorValet Production Email System v1.0
      </p>
    `;

    try {
      await sendEmail({
        to: recipient,
        from: 'hello@myseniorvalet.com',
        subject: `[TEST REPORT] Email System ${summary.overallSuccess ? 'PASSED ✅' : 'FAILED ❌'}`,
        html: reportHtml
      });
    } catch (error) {
      console.error('Failed to send test report:', error);
    }
  }

  static getTestHistory(limit = 50): EmailTestResult[] {
    return this.testResults.slice(-limit);
  }

  static getTestStats() {
    const stats = {
      totalTests: this.testResults.length,
      successful: this.testResults.filter(r => r.success).length,
      failed: this.testResults.filter(r => !r.success).length,
      byType: {} as Record<string, any>,
      recentTests: this.testResults.slice(-10)
    };

    this.testResults.forEach(result => {
      if (!stats.byType[result.type]) {
        stats.byType[result.type] = { success: 0, failed: 0 };
      }
      if (result.success) {
        stats.byType[result.type].success++;
      } else {
        stats.byType[result.type].failed++;
      }
    });

    return stats;
  }
}
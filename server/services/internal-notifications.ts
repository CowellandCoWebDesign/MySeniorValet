import { EmailService } from './email';
import { db } from '../db';
import { communities, tours, users, vendorRegistrations } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { NOTIFICATION_EMAIL_CONFIG, getEmailsForNotificationType } from '../config/notification-emails';

interface NotificationEvent {
  type: 'tour_scheduled' | 'community_added' | 'payment_received' | 'vendor_registered' | 
        'community_claimed' | 'user_registered' | 'message_sent' | 'review_posted';
  data: any;
  priority?: 'low' | 'medium' | 'high';
}

export class InternalNotificationService {
  private static instance: InternalNotificationService;

  static getInstance(): InternalNotificationService {
    if (!InternalNotificationService.instance) {
      InternalNotificationService.instance = new InternalNotificationService();
    }
    return InternalNotificationService.instance;
  }

  async sendInternalNotification(event: NotificationEvent) {
    try {
      const recipients = this.getRecipients(event);
      const emailContent = await this.formatNotification(event);
      
      // Send to all relevant recipients
      for (const recipient of recipients) {
        await EmailService.sendEmail({
          to: recipient,
          subject: emailContent.subject,
          html: emailContent.html
        });
      }
      
      console.log(`Internal notification sent: ${event.type}`, {
        recipients,
        priority: event.priority || 'medium'
      });
    } catch (error) {
      console.error('Failed to send internal notification:', error);
    }
  }

  private getRecipients(event: NotificationEvent): string[] {
    const recipients: string[] = [];
    
    // Always notify super admin for high priority events and critical security threats
    if (event.priority === 'high' || event.priority === 'critical') {
      recipients.push(NOTIFICATION_EMAIL_CONFIG.superAdmin.primary);
      recipients.push(NOTIFICATION_EMAIL_CONFIG.superAdmin.backup);
    }
    
    // Route based on event type
    switch (event.type) {
      case 'security_threat':
        // Always notify super admin and security team for security threats
        recipients.push(NOTIFICATION_EMAIL_CONFIG.superAdmin.primary);
        recipients.push(NOTIFICATION_EMAIL_CONFIG.superAdmin.backup);
        recipients.push(...getEmailsForNotificationType('systemAlerts'));
        break;
        
      case 'payment_received':
        recipients.push(...getEmailsForNotificationType('paymentIssues'));
        break;
        
      case 'vendor_registered':
        recipients.push(...getEmailsForNotificationType('vendorSignups'));
        break;
        
      case 'community_claimed':
      case 'community_added':
        recipients.push(...getEmailsForNotificationType('communityMilestones'));
        break;
        
      case 'community_claim_submitted':
      case 'community_claim_approved':
      case 'community_claim_rejected':
        // Community claims require admin attention
        recipients.push(NOTIFICATION_EMAIL_CONFIG.superAdmin.primary);
        recipients.push(NOTIFICATION_EMAIL_CONFIG.superAdmin.backup);
        break;
        
      case 'tour_scheduled':
        recipients.push(NOTIFICATION_EMAIL_CONFIG.superAdmin.primary);
        recipients.push(NOTIFICATION_EMAIL_CONFIG.superAdmin.backup);
        break;
        
      case 'user_registered':
        recipients.push(...getEmailsForNotificationType('userRegistrations'));
        break;
        
      case 'message_sent':
      case 'review_posted':
        recipients.push(...getEmailsForNotificationType('userContributions'));
        break;
        
      default:
        recipients.push(...getEmailsForNotificationType('systemAlerts'));
    }
    
    // Remove duplicates
    return [...new Set(recipients)];
  }

  private async formatNotification(event: NotificationEvent): Promise<{ subject: string; html: string }> {
    let subject = '';
    let html = '';
    
    switch (event.type) {
      case 'security_threat':
        const severity = event.data.severity?.toUpperCase() || 'UNKNOWN';
        const icon = severity === 'CRITICAL' ? '🚨🚨🚨' : severity === 'HIGH' ? '⚠️⚠️' : '⚠️';
        
        subject = `${icon} SECURITY ALERT: ${severity} - ${event.data.threatType} detected`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: ${severity === 'CRITICAL' ? '#DC2626' : '#F59E0B'}; color: white; padding: 15px; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">${icon} SECURITY THREAT DETECTED</h1>
            </div>
            <div style="background: #FEF2F2; padding: 20px; border: 2px solid ${severity === 'CRITICAL' ? '#DC2626' : '#F59E0B'}; border-radius: 0 0 8px 8px;">
              <h2 style="color: #991B1B; margin-top: 0;">Threat Details:</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;"><strong>Threat ID:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;">${event.data.threatId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;"><strong>Type:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;">${event.data.threatType}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;"><strong>Severity:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;"><span style="color: ${severity === 'CRITICAL' ? '#DC2626' : '#F59E0B'}; font-weight: bold;">${severity}</span></td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;"><strong>IP Address:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;">${event.data.ipAddress}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;"><strong>User Agent:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #E5E7EB; word-break: break-all;">${event.data.userAgent}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;"><strong>Endpoint:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;">${event.data.endpoint}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;"><strong>Action:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;">${event.data.action}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;"><strong>Timestamp:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;">${event.data.timestamp}</td>
                </tr>
              </table>
              
              ${event.data.details ? `
              <h3 style="color: #991B1B; margin-top: 20px;">Additional Details:</h3>
              <pre style="background: white; padding: 10px; border-radius: 4px; overflow-x: auto;">${JSON.stringify(event.data.details, null, 2)}</pre>
              ` : ''}
              
              <div style="background: #FEF3C7; padding: 15px; border-radius: 8px; margin-top: 20px;">
                <h3 style="color: #92400E; margin-top: 0;">⚡ Immediate Action Required:</h3>
                <ul style="color: #92400E;">
                  <li>Review the Security Dashboard at <a href="https://myseniorvalet.com/admin/security">https://myseniorvalet.com/admin/security</a></li>
                  <li>Check if this IP should be blocked</li>
                  <li>Review server logs for additional context</li>
                  ${severity === 'CRITICAL' ? '<li><strong>CRITICAL: Consider enabling maintenance mode immediately</strong></li>' : ''}
                </ul>
              </div>
            </div>
            <p style="color: #6B7280; font-size: 12px; text-align: center; margin-top: 20px;">
              This is an automated security alert from MySeniorValet Security Monitoring System.<br>
              Sent to: admin@myseniorvalet.com
            </p>
          </div>
        `;
        break;
        
      case 'tour_scheduled':
        subject = `🏠 New Tour Scheduled - ${event.data.communityName}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1e40af;">New Tour Request</h2>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Community:</strong> ${event.data.communityName}</p>
              <p><strong>User:</strong> ${event.data.userName} (${event.data.userEmail})</p>
              <p><strong>Phone:</strong> ${event.data.userPhone || 'Not provided'}</p>
              <p><strong>Requested Date:</strong> ${event.data.requestedDate}</p>
              <p><strong>Message:</strong> ${event.data.message || 'No message'}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              This notification was sent to the MySeniorValet admin team.
            </p>
          </div>
        `;
        break;
        
      case 'community_added':
        subject = `✨ New Community Added - ${event.data.name}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1e40af;">New Community Added</h2>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Name:</strong> ${event.data.name}</p>
              <p><strong>Location:</strong> ${event.data.city}, ${event.data.state}</p>
              <p><strong>Type:</strong> ${event.data.type}</p>
              <p><strong>Added By:</strong> ${event.data.addedBy || 'System'}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
          </div>
        `;
        break;
        
      case 'payment_received':
        subject = `💰 Payment Received - $${event.data.amount}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #16a34a;">Payment Received</h2>
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Amount:</strong> $${event.data.amount}</p>
              <p><strong>Type:</strong> ${event.data.type}</p>
              <p><strong>Customer:</strong> ${event.data.customerName} (${event.data.customerEmail})</p>
              <p><strong>Subscription:</strong> ${event.data.subscriptionTier || 'One-time'}</p>
              <p><strong>Transaction ID:</strong> ${event.data.transactionId}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
          </div>
        `;
        break;
        
      case 'vendor_registered':
        subject = `🏪 New Vendor Registration - ${event.data.businessName}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7c3aed;">New Vendor Registration</h2>
            <div style="background: #faf5ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Business:</strong> ${event.data.businessName}</p>
              <p><strong>Category:</strong> ${event.data.category}</p>
              <p><strong>Contact:</strong> ${event.data.contactName}</p>
              <p><strong>Email:</strong> ${event.data.email}</p>
              <p><strong>Phone:</strong> ${event.data.phone}</p>
              <p><strong>Coverage:</strong> ${event.data.coverageArea}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
          </div>
        `;
        break;
        
      case 'community_claimed':
        subject = `🎯 Community Claimed - ${event.data.communityName}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Community Claimed</h2>
            <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Community:</strong> ${event.data.communityName}</p>
              <p><strong>Claimed By:</strong> ${event.data.claimedBy}</p>
              <p><strong>Email:</strong> ${event.data.email}</p>
              <p><strong>Role:</strong> ${event.data.role}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
          </div>
        `;
        break;
        
      case 'user_registered':
        subject = `👤 New User Registration - ${event.data.userName}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0891b2;">New User Registration</h2>
            <div style="background: #f0fdfa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Name:</strong> ${event.data.userName}</p>
              <p><strong>Email:</strong> ${event.data.userEmail}</p>
              <p><strong>Role:</strong> ${event.data.role}</p>
              <p><strong>Signup Method:</strong> ${event.data.signupMethod || 'Standard'}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
          </div>
        `;
        break;
        
      case 'community_claim_submitted':
        subject = `🏢 New Community Claim - ${event.data.communityName}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #9333ea;">New Community Claim Submitted</h2>
            <div style="background: #faf5ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Community:</strong> ${event.data.communityName}</p>
              <p><strong>Business Name:</strong> ${event.data.businessName}</p>
              <p><strong>Contact:</strong> ${event.data.contactName}</p>
              <p><strong>Email:</strong> ${event.data.email}</p>
              <p><strong>Phone:</strong> ${event.data.phone}</p>
              <p><strong>Operator Type:</strong> ${event.data.operatorType}</p>
              <p><strong>Subscription Plan:</strong> ${event.data.subscriptionPlan}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              This claim requires admin approval.
            </p>
          </div>
        `;
        break;
        
      case 'community_claim_approved':
        subject = `✅ Community Claim Approved - ${event.data.communityName}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #16a34a;">Community Claim Approved</h2>
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Community:</strong> ${event.data.communityName}</p>
              <p><strong>Business Name:</strong> ${event.data.businessName}</p>
              <p><strong>Contact:</strong> ${event.data.contactName}</p>
              <p><strong>Email:</strong> ${event.data.email}</p>
              <p><strong>Operator Type:</strong> ${event.data.operatorType}</p>
              <p><strong>Subscription Plan:</strong> ${event.data.subscriptionPlan}</p>
              <p><strong>Approved By:</strong> ${event.data.approvedBy}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
          </div>
        `;
        break;
        
      case 'community_claim_rejected':
        subject = `❌ Community Claim Rejected - ${event.data.communityName}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Community Claim Rejected</h2>
            <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Community:</strong> ${event.data.communityName}</p>
              <p><strong>Business Name:</strong> ${event.data.businessName}</p>
              <p><strong>Contact:</strong> ${event.data.contactName}</p>
              <p><strong>Email:</strong> ${event.data.email}</p>
              <p><strong>Rejection Reason:</strong> ${event.data.rejectionReason}</p>
              <p><strong>Rejected By:</strong> ${event.data.rejectedBy}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
          </div>
        `;
        break;
        
      default:
        subject = `📢 Platform Event - ${event.type}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Platform Event</h2>
            <pre>${JSON.stringify(event.data, null, 2)}</pre>
          </div>
        `;
    }
    
    // Add priority indicator to subject
    if (event.priority === 'high') {
      subject = `🚨 ${subject}`;
    } else if (event.priority === 'low') {
      subject = `ℹ️ ${subject}`;
    }
    
    return { subject, html };
  }

  // Helper methods for common notifications
  async notifyTourScheduled(tourData: any) {
    const community = await db.select().from(communities)
      .where(eq(communities.id, tourData.communityId))
      .limit(1);
      
    await this.sendInternalNotification({
      type: 'tour_scheduled',
      data: {
        ...tourData,
        communityName: community[0]?.name || 'Unknown Community'
      },
      priority: 'medium'
    });
  }

  async notifyPaymentReceived(paymentData: any) {
    await this.sendInternalNotification({
      type: 'payment_received',
      data: paymentData,
      priority: 'high'
    });
  }

  async notifyCommunityAdded(communityData: any) {
    await this.sendInternalNotification({
      type: 'community_added',
      data: communityData,
      priority: 'medium'
    });
  }

  async notifyVendorRegistered(vendorData: any) {
    await this.sendInternalNotification({
      type: 'vendor_registered',
      data: vendorData,
      priority: 'medium'
    });
  }

  async notifyCommunityClaimed(claimData: any) {
    await this.sendInternalNotification({
      type: 'community_claimed',
      data: claimData,
      priority: 'high'
    });
  }

  async notifyUserRegistered(userData: any) {
    await this.sendInternalNotification({
      type: 'user_registered',
      data: userData,
      priority: 'medium'
    });
  }

  async notifyCommunityClaimSubmitted(claimData: any) {
    await this.sendInternalNotification({
      type: 'community_claim_submitted',
      data: claimData,
      priority: 'high'
    });
  }

  async notifyCommunityClaimApproved(claimData: any) {
    await this.sendInternalNotification({
      type: 'community_claim_approved',
      data: claimData,
      priority: 'high'
    });
  }

  async notifyCommunityClaimRejected(claimData: any) {
    await this.sendInternalNotification({
      type: 'community_claim_rejected',
      data: claimData,
      priority: 'high'
    });
  }
}

export const internalNotifications = InternalNotificationService.getInstance();
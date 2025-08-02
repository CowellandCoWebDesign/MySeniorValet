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
    
    // Always notify super admin for high priority events
    if (event.priority === 'high') {
      recipients.push(NOTIFICATION_EMAIL_CONFIG.superAdmin.primary);
      recipients.push(NOTIFICATION_EMAIL_CONFIG.superAdmin.backup);
    }
    
    // Route based on event type
    switch (event.type) {
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
import sgMail from '@sendgrid/mail';
import { db } from '../db';
import { auditLogs } from '@shared/schema';

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

interface PaymentNotification {
  type: 'subscription_created' | 'payment_successful' | 'payment_failed' | 'subscription_cancelled';
  customerEmail: string;
  tierName: string;
  amount: number;
  subscriptionType: 'community' | 'vendor';
  metadata?: Record<string, any>;
}

export class PaymentNotificationService {
  private readonly adminEmail = 'william.cowell01@gmail.com';
  private readonly billingEmail = 'billing@myseniorvalet.com';
  private readonly supportEmail = 'hello@myseniorvalet.com';

  async sendPaymentNotification(notification: PaymentNotification): Promise<void> {
    try {
      // Send admin notification
      await this.sendAdminNotification(notification);

      // Send customer notification
      await this.sendCustomerNotification(notification);

      // Log notification
      await db.insert(auditLogs).values({
        entityType: 'payment_notification',
        entityId: 0,
        userId: null,
        operation: `payment_notification_${notification.type}`,
        details: JSON.stringify({
          type: notification.type,
          recipient: notification.customerEmail,
          tier: notification.tierName,
          amount: notification.amount
        }),
        ipAddress: 'system',
        userAgent: 'payment-notification-service',
        createdAt: new Date()
      });

    } catch (error) {
      console.error('Failed to send payment notification:', error);
    }
  }

  private async sendAdminNotification(notification: PaymentNotification): Promise<void> {
    const subject = this.getAdminSubject(notification);
    const html = this.getAdminHtml(notification);

    const msg = {
      to: this.adminEmail,
      from: this.supportEmail,
      subject,
      html,
      cc: [this.billingEmail]
    };

    await sgMail.send(msg);
  }

  private async sendCustomerNotification(notification: PaymentNotification): Promise<void> {
    const subject = this.getCustomerSubject(notification);
    const html = this.getCustomerHtml(notification);

    const msg = {
      to: notification.customerEmail,
      from: this.supportEmail,
      subject,
      html
    };

    await sgMail.send(msg);
  }

  private getAdminSubject(notification: PaymentNotification): string {
    const prefix = notification.subscriptionType === 'community' ? 'Community' : 'Vendor';
    
    switch (notification.type) {
      case 'subscription_created':
        return `🎉 New ${prefix} Subscription: ${notification.tierName} - $${notification.amount}/mo`;
      case 'payment_successful':
        return `✅ Payment Received: ${prefix} ${notification.tierName} - $${notification.amount}`;
      case 'payment_failed':
        return `⚠️ Payment Failed: ${prefix} ${notification.tierName}`;
      case 'subscription_cancelled':
        return `🚫 Subscription Cancelled: ${prefix} ${notification.tierName}`;
      default:
        return `Payment Update: ${prefix} ${notification.tierName}`;
    }
  }

  private getAdminHtml(notification: PaymentNotification): string {
    const timestamp = new Date().toLocaleString();
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Payment Notification</h2>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Transaction Details</h3>
          <p><strong>Type:</strong> ${notification.type.replace('_', ' ').toUpperCase()}</p>
          <p><strong>Customer:</strong> ${notification.customerEmail}</p>
          <p><strong>Subscription Type:</strong> ${notification.subscriptionType}</p>
          <p><strong>Tier:</strong> ${notification.tierName}</p>
          <p><strong>Amount:</strong> $${notification.amount}/month</p>
          <p><strong>Timestamp:</strong> ${timestamp}</p>
        </div>

        ${notification.metadata ? `
          <div style="background: #e8f4fd; padding: 20px; border-radius: 8px;">
            <h3 style="margin-top: 0;">Additional Information</h3>
            <pre style="font-size: 12px;">${JSON.stringify(notification.metadata, null, 2)}</pre>
          </div>
        ` : ''}

        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          This is an automated notification from MySeniorValet Payment System.
        </p>
      </div>
    `;
  }

  private getCustomerSubject(notification: PaymentNotification): string {
    switch (notification.type) {
      case 'subscription_created':
        return `Welcome to MySeniorValet ${notification.tierName}!`;
      case 'payment_successful':
        return `Payment Confirmation - MySeniorValet`;
      case 'payment_failed':
        return `Action Required: Payment Failed - MySeniorValet`;
      case 'subscription_cancelled':
        return `Subscription Cancelled - MySeniorValet`;
      default:
        return `MySeniorValet Subscription Update`;
    }
  }

  private getCustomerHtml(notification: PaymentNotification): string {
    let content = '';
    
    switch (notification.type) {
      case 'subscription_created':
        content = `
          <h2 style="color: #2563eb;">Welcome to MySeniorValet!</h2>
          <p>Thank you for subscribing to our ${notification.tierName} plan.</p>
          <p>Your subscription is now active and you have access to all premium features.</p>
          <p><strong>Monthly charge:</strong> $${notification.amount}</p>
        `;
        break;
      
      case 'payment_successful':
        content = `
          <h2 style="color: #059669;">Payment Received</h2>
          <p>We've successfully processed your payment of $${notification.amount} for your ${notification.tierName} subscription.</p>
          <p>Thank you for your continued support!</p>
        `;
        break;
      
      case 'payment_failed':
        content = `
          <h2 style="color: #dc2626;">Payment Failed</h2>
          <p>We were unable to process your payment for your ${notification.tierName} subscription.</p>
          <p>Please update your payment method to avoid service interruption.</p>
          <p><a href="https://myseniorvalet.com/subscriptions" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Update Payment Method</a></p>
        `;
        break;
      
      case 'subscription_cancelled':
        content = `
          <h2>Subscription Cancelled</h2>
          <p>Your ${notification.tierName} subscription has been cancelled.</p>
          <p>You'll continue to have access until the end of your billing period.</p>
          <p>We're sorry to see you go! If you change your mind, you can resubscribe anytime.</p>
        `;
        break;
    }

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        ${content}
        
        <hr style="margin: 40px 0; border: none; border-top: 1px solid #e5e5e5;">
        
        <p style="color: #666; font-size: 14px;">
          If you have any questions, please contact us at ${this.supportEmail}
        </p>
        
        <p style="color: #999; font-size: 12px;">
          MySeniorValet - Clarity in Senior Living<br>
          This email was sent to ${notification.customerEmail}
        </p>
      </div>
    `;
  }
}

export const paymentNotificationService = new PaymentNotificationService();
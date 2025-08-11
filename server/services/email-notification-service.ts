import sgMail from '@sendgrid/mail';
import { db } from '../db';
import { users, communities, conversations, messages } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('✅ SendGrid email notifications configured');
} else {
  console.log('⚠️ SendGrid API key not configured - email notifications disabled');
}

interface EmailNotificationOptions {
  recipientId: string;
  recipientType: 'user' | 'community';
  conversationId: number;
  messageContent: string;
  senderName: string;
  messageId: number;
}

export class EmailNotificationService {
  private static instance: EmailNotificationService;
  
  constructor() {}
  
  static getInstance(): EmailNotificationService {
    if (!EmailNotificationService.instance) {
      EmailNotificationService.instance = new EmailNotificationService();
    }
    return EmailNotificationService.instance;
  }
  
  async sendMessageNotification(options: EmailNotificationOptions): Promise<boolean> {
    if (!process.env.SENDGRID_API_KEY) {
      console.log('Email notifications disabled - no SendGrid API key');
      return false;
    }
    
    try {
      // Get recipient details
      const recipientEmail = await this.getRecipientEmail(options.recipientId, options.recipientType);
      
      if (!recipientEmail) {
        console.log(`No email found for ${options.recipientType} ${options.recipientId}`);
        return false;
      }
      
      // Check if recipient has email notifications enabled
      const notificationsEnabled = await this.checkNotificationPreferences(
        options.recipientId, 
        options.recipientType
      );
      
      if (!notificationsEnabled) {
        console.log(`Email notifications disabled for ${options.recipientType} ${options.recipientId}`);
        return false;
      }
      
      // Get conversation details
      const [conversation] = await db.select()
        .from(conversations)
        .where(eq(conversations.id, options.conversationId))
        .limit(1);
      
      if (!conversation) {
        console.log('Conversation not found');
        return false;
      }
      
      // Prepare email content
      const emailContent = this.prepareEmailContent({
        senderName: options.senderName,
        messageContent: options.messageContent,
        conversationTitle: conversation.title,
        recipientType: options.recipientType
      });
      
      // Send email
      const msg = {
        to: recipientEmail,
        from: {
          email: 'hello@myseniorvalet.com',
          name: 'MySeniorValet'
        },
        subject: `New message from ${options.senderName} on MySeniorValet`,
        text: emailContent.text,
        html: emailContent.html,
        trackingSettings: {
          clickTracking: { enable: true },
          openTracking: { enable: true }
        }
      };
      
      await sgMail.send(msg);
      
      console.log(`✅ Email notification sent to ${recipientEmail}`);
      
      // Log notification
      await this.logNotification({
        recipientId: options.recipientId,
        recipientType: options.recipientType,
        messageId: options.messageId,
        emailSent: true,
        sentAt: new Date()
      });
      
      return true;
      
    } catch (error) {
      console.error('Failed to send email notification:', error);
      return false;
    }
  }
  
  private async getRecipientEmail(recipientId: string, recipientType: 'user' | 'community'): Promise<string | null> {
    try {
      if (recipientType === 'user') {
        // Convert string ID to integer for users table
        const userId = parseInt(recipientId);
        if (isNaN(userId)) return null;
        
        const [user] = await db.select()
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);
        
        return user?.email || null;
      } else {
        // Communities use string IDs
        const [community] = await db.select()
          .from(communities)
          .where(eq(communities.id, recipientId))
          .limit(1);
        
        // Use contact email or primary email
        const emails = community?.emails as any;
        if (emails && typeof emails === 'object') {
          return emails.contact || emails.primary || null;
        }
        return null;
      }
    } catch (error) {
      console.error('Error getting recipient email:', error);
      return null;
    }
  }
  
  private async checkNotificationPreferences(recipientId: string, recipientType: 'user' | 'community'): Promise<boolean> {
    try {
      if (recipientType === 'user') {
        const userId = parseInt(recipientId);
        if (isNaN(userId)) return false;
        
        const [user] = await db.select()
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);
        
        // Check user preferences (default to true if not set)
        const preferences = user?.preferences as any;
        if (preferences && typeof preferences === 'object') {
          return preferences.emailNotifications !== false;
        }
        return true; // Default to enabled
        
      } else {
        const [community] = await db.select()
          .from(communities)
          .where(eq(communities.id, recipientId))
          .limit(1);
        
        // Check community preferences
        const settings = community?.settings as any;
        if (settings && typeof settings === 'object') {
          return settings.emailNotifications !== false;
        }
        return true; // Default to enabled
      }
    } catch (error) {
      console.error('Error checking notification preferences:', error);
      return true; // Default to enabled if error
    }
  }
  
  private prepareEmailContent(params: {
    senderName: string;
    messageContent: string;
    conversationTitle: string;
    recipientType: 'user' | 'community';
  }) {
    const dashboardUrl = recipientType === 'user' 
      ? 'https://myseniorvalet.com/dashboard/messages'
      : 'https://myseniorvalet.com/community-dashboard/messages';
    
    const text = `
New Message on MySeniorValet

You have received a new message from ${params.senderName}

Conversation: ${params.conversationTitle}

Message:
${params.messageContent}

View and reply to this message at: ${dashboardUrl}

---
The trusted platform for authentic senior living community information.
To manage your email preferences, visit your dashboard settings.
    `.trim();
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 10px 10px 0 0;
      text-align: center;
    }
    .content {
      background: white;
      padding: 30px;
      border: 1px solid #e5e7eb;
      border-radius: 0 0 10px 10px;
    }
    .message-box {
      background: #f9fafb;
      border-left: 4px solid #667eea;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 5px;
      margin-top: 20px;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0; font-size: 24px;">New Message on MySeniorValet</h1>
  </div>
  
  <div class="content">
    <p>Hello,</p>
    
    <p>You have received a new message from <strong>${params.senderName}</strong></p>
    
    <p><strong>Conversation:</strong> ${params.conversationTitle}</p>
    
    <div class="message-box">
      <p style="margin: 0;">${params.messageContent}</p>
    </div>
    
    <div style="text-align: center;">
      <a href="${dashboardUrl}" class="button">View Message & Reply</a>
    </div>
  </div>
  
  <div class="footer">
    <p><strong>MySeniorValet</strong><br>
    The trusted platform for authentic senior living community information.</p>
    <p>To manage your email preferences, visit your dashboard settings.</p>
  </div>
</body>
</html>
    `.trim();
    
    return { text, html };
  }
  
  private async logNotification(data: {
    recipientId: string;
    recipientType: 'user' | 'community';
    messageId: number;
    emailSent: boolean;
    sentAt: Date;
  }) {
    try {
      // Log notification for analytics
      console.log('Email notification logged:', {
        recipientId: data.recipientId,
        recipientType: data.recipientType,
        messageId: data.messageId,
        emailSent: data.emailSent,
        sentAt: data.sentAt
      });
    } catch (error) {
      console.error('Failed to log notification:', error);
    }
  }
  
  // Batch send for broadcast messages
  async sendBroadcastNotifications(
    messageId: number,
    senderName: string,
    messageContent: string,
    recipientIds: string[],
    conversationId: number
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;
    
    for (const recipientId of recipientIds) {
      const success = await this.sendMessageNotification({
        recipientId,
        recipientType: 'user',
        conversationId,
        messageContent,
        senderName,
        messageId
      });
      
      if (success) {
        sent++;
      } else {
        failed++;
      }
      
      // Rate limiting - wait 100ms between emails
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`Broadcast notifications: ${sent} sent, ${failed} failed`);
    return { sent, failed };
  }
}

export const emailNotificationService = EmailNotificationService.getInstance();
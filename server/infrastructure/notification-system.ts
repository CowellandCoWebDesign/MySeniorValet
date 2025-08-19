import { Request, Response } from 'express';
import { redisCache } from './redis-cache';

interface NotificationChannel {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push' | 'in_app' | 'webhook';
  isActive: boolean;
  configuration: Record<string, any>;
}

interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  bodyTemplate: string;
  channels: string[];
  variables: string[];
  category: 'user' | 'community' | 'system' | 'marketing';
}

interface NotificationQueue {
  id: string;
  recipientId: string;
  templateId: string;
  channel: string;
  data: Record<string, any>;
  scheduledTime: Date;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  attempts: number;
  lastAttempt?: Date;
  error?: string;
}

class NotificationSystem {
  private channels: Map<string, NotificationChannel> = new Map();
  private templates: Map<string, NotificationTemplate> = new Map();
  private queue: NotificationQueue[] = [];

  constructor() {
    this.initializeDefaultChannels();
    this.initializeDefaultTemplates();
  }

  private initializeDefaultChannels(): void {
    const defaultChannels: NotificationChannel[] = [
      {
        id: 'email_primary',
        name: 'Primary Email Service',
        type: 'email',
        isActive: true,
        configuration: {
          provider: 'sendgrid',
          fromEmail: 'Admin@myseniorvalet.com',
          fromName: 'MySeniorValet'
        }
      },
      {
        id: 'sms_primary',
        name: 'SMS Service',
        type: 'sms',
        isActive: true,
        configuration: {
          provider: 'twilio',
          fromNumber: '+1-855-MY-VALET'
        }
      },
      {
        id: 'push_mobile',
        name: 'Mobile Push Notifications',
        type: 'push',
        isActive: true,
        configuration: {
          provider: 'firebase',
          icon: '/icons/notification-icon.png'
        }
      },
      {
        id: 'in_app',
        name: 'In-App Notifications',
        type: 'in_app',
        isActive: true,
        configuration: {
          displayDuration: 5000,
          position: 'top-right'
        }
      },
      {
        id: 'webhook_integrations',
        name: 'Webhook Integrations',
        type: 'webhook',
        isActive: true,
        configuration: {
          retryAttempts: 3,
          timeout: 30000
        }
      }
    ];

    defaultChannels.forEach(channel => {
      this.channels.set(channel.id, channel);
    });
  }

  private initializeDefaultTemplates(): void {
    const defaultTemplates: NotificationTemplate[] = [
      // User notifications
      {
        id: 'welcome_user',
        name: 'Welcome New User',
        subject: 'Welcome to MySeniorValet - Your Senior Living Journey Begins',
        bodyTemplate: `
          Dear {{firstName}},
          
          Welcome to MySeniorValet! We're thrilled to help you find the perfect senior living community.
          
          Your account is now active with access to:
          • 31,000+ verified communities across North America
          • Transparent pricing and availability
          • Family collaboration tools
          • Personal consultation services
          
          Get started: {{dashboardUrl}}
          
          Need help? Our senior living advisors are available at {{supportPhone}}.
          
          Best regards,
          The MySeniorValet Team
        `,
        channels: ['email_primary', 'in_app'],
        variables: ['firstName', 'dashboardUrl', 'supportPhone'],
        category: 'user'
      },
      {
        id: 'community_inquiry',
        name: 'New Community Inquiry',
        subject: 'New inquiry about {{communityName}}',
        bodyTemplate: `
          Hello {{firstName}},
          
          Thank you for your interest in {{communityName}}. We've notified them of your inquiry.
          
          Community Details:
          • Location: {{communityLocation}}
          • Care Type: {{careType}}
          • Monthly Cost: {{monthlyRent}}
          • Availability: {{availability}}
          
          Next Steps:
          1. The community will contact you within 24 hours
          2. Schedule a virtual or in-person tour
          3. Ask about availability and pricing
          
          View full details: {{communityUrl}}
          
          Questions? Call us at {{supportPhone}}.
        `,
        channels: ['email_primary', 'sms_primary'],
        variables: ['firstName', 'communityName', 'communityLocation', 'careType', 'monthlyRent', 'availability', 'communityUrl', 'supportPhone'],
        category: 'user'
      },
      {
        id: 'tour_reminder',
        name: 'Tour Reminder',
        subject: 'Reminder: Tour at {{communityName}} tomorrow',
        bodyTemplate: `
          Hi {{firstName}},
          
          This is a friendly reminder about your scheduled tour:
          
          📅 Date: {{tourDate}}
          🕐 Time: {{tourTime}}
          📍 Location: {{communityName}}
          {{communityAddress}}
          
          Tour Contact: {{tourContact}}
          Phone: {{tourPhone}}
          
          What to bring:
          • List of questions about care services
          • Insurance or financial information
          • Family member if desired
          
          Need to reschedule? Call {{tourPhone}}.
        `,
        channels: ['email_primary', 'sms_primary', 'push_mobile'],
        variables: ['firstName', 'tourDate', 'tourTime', 'communityName', 'communityAddress', 'tourContact', 'tourPhone'],
        category: 'user'
      },
      // Community notifications
      {
        id: 'new_lead',
        name: 'New Lead Notification',
        subject: 'New inquiry for {{communityName}}',
        bodyTemplate: `
          New Inquiry Alert
          
          Community: {{communityName}}
          Inquiry Type: {{inquiryType}}
          
          Contact Information:
          Name: {{contactName}}
          Phone: {{contactPhone}}
          Email: {{contactEmail}}
          
          Inquiry Details:
          Care Level: {{careLevel}}
          Timeline: {{timeline}}
          Budget: {{budget}}
          Special Needs: {{specialNeeds}}
          
          Message: {{message}}
          
          Respond within 4 hours for best conversion rates.
          Login to your dashboard: {{communityDashboard}}
        `,
        channels: ['email_primary', 'sms_primary', 'webhook_integrations'],
        variables: ['communityName', 'inquiryType', 'contactName', 'contactPhone', 'contactEmail', 'careLevel', 'timeline', 'budget', 'specialNeeds', 'message', 'communityDashboard'],
        category: 'community'
      },
      {
        id: 'listing_performance',
        name: 'Weekly Performance Report',
        subject: '{{communityName}} - Weekly Performance Report',
        bodyTemplate: `
          Weekly Performance Summary for {{communityName}}
          
          📊 This Week's Stats:
          • Profile Views: {{weeklyViews}}
          • New Inquiries: {{weeklyInquiries}}
          • Tour Requests: {{weeklyTours}}
          • Phone Calls: {{weeklyCalls}}
          
          🎯 Performance vs Last Week:
          • Views: {{viewsChange}}
          • Inquiries: {{inquiriesChange}}
          • Conversion Rate: {{conversionRate}}
          
          💡 Optimization Tips:
          {{optimizationTips}}
          
          📈 Upgrade to Premium for:
          • Featured placement in search results
          • Advanced analytics dashboard
          • Priority customer support
          
          View full report: {{performanceUrl}}
        `,
        channels: ['email_primary'],
        variables: ['communityName', 'weeklyViews', 'weeklyInquiries', 'weeklyTours', 'weeklyCalls', 'viewsChange', 'inquiriesChange', 'conversionRate', 'optimizationTips', 'performanceUrl'],
        category: 'community'
      },
      // System notifications
      {
        id: 'system_maintenance',
        name: 'Scheduled Maintenance Notice',
        subject: 'MySeniorValet Maintenance - {{maintenanceDate}}',
        bodyTemplate: `
          Scheduled Maintenance Notice
          
          We'll be performing system maintenance to improve your experience:
          
          📅 Date: {{maintenanceDate}}
          🕐 Time: {{maintenanceTime}}
          ⏱️ Duration: {{estimatedDuration}}
          
          During this time:
          • Website may be temporarily unavailable
          • Mobile app may have limited functionality
          • Email notifications may be delayed
          
          What we're improving:
          {{improvementsList}}
          
          We apologize for any inconvenience and appreciate your patience.
        `,
        channels: ['email_primary', 'push_mobile', 'in_app'],
        variables: ['maintenanceDate', 'maintenanceTime', 'estimatedDuration', 'improvementsList'],
        category: 'system'
      }
    ];

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  // Send notification using template
  async sendNotification(
    recipientId: string,
    templateId: string,
    data: Record<string, any>,
    channels?: string[],
    scheduledTime?: Date
  ): Promise<{
    success: boolean;
    notificationIds: string[];
    errors?: string[];
  }> {
    try {
      const template = this.templates.get(templateId);
      if (!template) {
        throw new Error(`Template ${templateId} not found`);
      }

      const targetChannels = channels || template.channels;
      const notificationIds: string[] = [];
      const errors: string[] = [];

      for (const channelId of targetChannels) {
        const channel = this.channels.get(channelId);
        if (!channel || !channel.isActive) {
          errors.push(`Channel ${channelId} not available`);
          continue;
        }

        const notificationId = await this.queueNotification(
          recipientId,
          templateId,
          channelId,
          data,
          scheduledTime
        );
        
        notificationIds.push(notificationId);
      }

      return {
        success: true,
        notificationIds,
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (error) {
      console.error('Error sending notification:', error);
      return {
        success: false,
        notificationIds: [],
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  private async queueNotification(
    recipientId: string,
    templateId: string,
    channelId: string,
    data: Record<string, any>,
    scheduledTime?: Date
  ): Promise<string> {
    const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const queueItem: NotificationQueue = {
      id: notificationId,
      recipientId,
      templateId,
      channel: channelId,
      data,
      scheduledTime: scheduledTime || new Date(),
      status: 'pending',
      attempts: 0
    };

    this.queue.push(queueItem);
    
    // Store in Redis for persistence
    await redisCache.set(`notification:${notificationId}`, queueItem, 86400); // 24 hours

    // If immediate send, process now
    if (!scheduledTime || scheduledTime <= new Date()) {
      this.processNotification(notificationId);
    }

    return notificationId;
  }

  private async processNotification(notificationId: string): Promise<boolean> {
    try {
      const notification = this.queue.find(n => n.id === notificationId);
      if (!notification) {
        console.error(`Notification ${notificationId} not found in queue`);
        return false;
      }

      const template = this.templates.get(notification.templateId);
      const channel = this.channels.get(notification.channel);

      if (!template || !channel) {
        notification.status = 'failed';
        notification.error = 'Template or channel not found';
        return false;
      }

      // Process template variables
      const processedContent = this.processTemplate(template, notification.data);

      // Simulate sending based on channel type
      const success = await this.sendToChannel(channel, notification.recipientId, processedContent);

      if (success) {
        notification.status = 'sent';
        notification.lastAttempt = new Date();
      } else {
        notification.attempts++;
        notification.lastAttempt = new Date();
        
        if (notification.attempts >= 3) {
          notification.status = 'failed';
          notification.error = 'Max retry attempts reached';
        }
      }

      // Update in Redis
      await redisCache.set(`notification:${notificationId}`, notification, 86400);

      return success;
    } catch (error) {
      console.error(`Error processing notification ${notificationId}:`, error);
      return false;
    }
  }

  private processTemplate(template: NotificationTemplate, data: Record<string, any>): {
    subject: string;
    body: string;
  } {
    let subject = template.subject;
    let body = template.bodyTemplate;

    // Replace template variables
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, String(value));
      body = body.replace(regex, String(value));
    }

    return { subject, body };
  }

  private async sendToChannel(
    channel: NotificationChannel,
    recipientId: string,
    content: { subject: string; body: string }
  ): Promise<boolean> {
    // Simulate sending based on channel type
    console.log(`📨 Sending ${channel.type} notification to ${recipientId}:`);
    console.log(`Subject: ${content.subject}`);
    console.log(`Channel: ${channel.name}`);
    
    // In a real implementation, this would integrate with actual services:
    // - Email: SendGrid, AWS SES, Mailgun
    // - SMS: Twilio, AWS SNS
    // - Push: Firebase, OneSignal
    // - Webhook: HTTP requests to external systems

    return true; // Simulate success
  }

  // Get notification status and analytics
  async getNotificationStats(): Promise<{
    totalSent: number;
    totalPending: number;
    totalFailed: number;
    channelBreakdown: Array<{
      channel: string;
      sent: number;
      pending: number;
      failed: number;
    }>;
    templateUsage: Array<{
      template: string;
      usage: number;
      successRate: number;
    }>;
  }> {
    const stats = {
      totalSent: this.queue.filter(n => n.status === 'sent').length,
      totalPending: this.queue.filter(n => n.status === 'pending').length,
      totalFailed: this.queue.filter(n => n.status === 'failed').length,
      channelBreakdown: [] as any[],
      templateUsage: [] as any[]
    };

    // Calculate channel breakdown
    const channelStats = new Map();
    this.queue.forEach(notification => {
      if (!channelStats.has(notification.channel)) {
        channelStats.set(notification.channel, { sent: 0, pending: 0, failed: 0 });
      }
      const stat = channelStats.get(notification.channel);
      stat[notification.status]++;
    });

    stats.channelBreakdown = Array.from(channelStats.entries()).map(([channel, counts]) => ({
      channel,
      ...counts
    }));

    // Calculate template usage
    const templateStats = new Map();
    this.queue.forEach(notification => {
      if (!templateStats.has(notification.templateId)) {
        templateStats.set(notification.templateId, { usage: 0, sent: 0 });
      }
      const stat = templateStats.get(notification.templateId);
      stat.usage++;
      if (notification.status === 'sent') {
        stat.sent++;
      }
    });

    stats.templateUsage = Array.from(templateStats.entries()).map(([template, counts]) => ({
      template,
      usage: counts.usage,
      successRate: counts.usage > 0 ? Math.round((counts.sent / counts.usage) * 100) : 0
    }));

    return stats;
  }

  // Bulk notification sending for campaigns
  async sendBulkNotification(
    recipients: string[],
    templateId: string,
    data: Record<string, any>,
    options?: {
      batchSize?: number;
      delayBetweenBatches?: number; // milliseconds
      channels?: string[];
    }
  ): Promise<{
    totalQueued: number;
    batchCount: number;
    estimatedCompletionTime: Date;
  }> {
    const batchSize = options?.batchSize || 100;
    const delay = options?.delayBetweenBatches || 1000;
    const batches = Math.ceil(recipients.length / batchSize);
    
    let totalQueued = 0;
    
    for (let i = 0; i < batches; i++) {
      const batch = recipients.slice(i * batchSize, (i + 1) * batchSize);
      
      for (const recipientId of batch) {
        await this.sendNotification(recipientId, templateId, data, options?.channels);
        totalQueued++;
      }
      
      // Delay between batches to avoid overwhelming the system
      if (i < batches - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    const estimatedCompletionTime = new Date(Date.now() + (batches * delay) + (totalQueued * 100)); // Rough estimate
    
    return {
      totalQueued,
      batchCount: batches,
      estimatedCompletionTime
    };
  }
}

export const notificationSystem = new NotificationSystem();
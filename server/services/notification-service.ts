import { db } from '../db';
import { notifications, userNotificationPreferences, users } from '@shared/schema';
import { eq, and, or, inArray, desc, lt } from 'drizzle-orm';
import sgMail from '@sendgrid/mail';
import { websocketService } from './websocket-service';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

export class NotificationService {
  private readonly ADMIN_EMAIL = 'william.cowell01@gmail.com';
  private readonly PLATFORM_NAME = 'MySeniorValet';
  
  /**
   * Create and send a notification
   */
  async createNotification({
    userId,
    type,
    category,
    priority = 'normal',
    title,
    message,
    actionUrl,
    iconType,
    communityId,
    metadata,
    channels = ['in_app']
  }: {
    userId?: string;
    type: string;
    category: string;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    title: string;
    message: string;
    actionUrl?: string;
    iconType?: string;
    communityId?: number;
    metadata?: any;
    channels?: string[];
  }) {
    try {
      // Create notification record
      const [notification] = await db.insert(notifications).values({
        userId,
        type,
        category,
        priority,
        title,
        message,
        actionUrl,
        iconType,
        communityId,
        metadata,
        createdAt: new Date()
      }).returning();
      
      // Send through requested channels
      if (channels.includes('in_app') && userId) {
        await this.sendInAppNotification(parseInt(userId), notification);
      }
      
      if (channels.includes('email') && userId) {
        await this.sendEmailNotification(userId, notification);
      }
      
      return notification;
      
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }
  
  /**
   * Send in-app notification via WebSocket
   */
  private async sendInAppNotification(userId: number, notification: any) {
    websocketService.sendToUser(userId, {
      type: 'notification',
      data: notification
    });
  }
  
  /**
   * Send email notification
   */
  private async sendEmailNotification(userId: string, notification: any) {
    try {
      // Get user preferences
      const [preferences] = await db.select()
        .from(userNotificationPreferences)
        .where(eq(userNotificationPreferences.userId, userId));
      
      // Check if email notifications are enabled
      if (!preferences?.emailEnabled) return;
      
      // Check notification type preferences
      const shouldSend = this.checkNotificationTypePreference(notification.type, preferences);
      if (!shouldSend) return;
      
      // Get user email  
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user?.email) return;
      
      // Check quiet hours
      if (this.isInQuietHours(preferences)) {
        console.log(`Skipping email notification for user ${userId} - quiet hours`);
        return;
      }
      
      // Prepare email content
      const emailContent = {
        to: user.email,
        from: 'hello@myseniorvalet.com',
        subject: `${this.getPriorityEmoji(notification.priority)} ${notification.title}`,
        html: this.generateEmailHtml(notification, user)
      };
      
      await sgMail.send(emailContent);
      
      // Update notification record
      await db.update(notifications)
        .set({
          emailSent: true,
          emailSentAt: new Date()
        })
        .where(eq(notifications.id, notification.id));
      
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  }
  
  /**
   * Check if notification type should be sent based on preferences
   */
  private checkNotificationTypePreference(type: string, preferences: any): boolean {
    const typeMap: Record<string, string> = {
      'community_update': 'communityUpdates',
      'price_change': 'priceChanges',
      'photo_added': 'newPhotos',
      'review': 'newReviews',
      'availability': 'availabilityChanges',
      'milestone': 'milestones',
      'system': 'systemAnnouncements'
    };
    
    const preferenceKey = typeMap[type];
    return preferenceKey ? preferences[preferenceKey] !== false : true;
  }
  
  /**
   * Check if current time is in quiet hours
   */
  private isInQuietHours(preferences: any): boolean {
    if (!preferences?.quietHoursEnabled) return false;
    
    const now = new Date();
    const timezone = preferences.timezone || 'America/New_York';
    const currentTime = new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      timeZone: timezone
    });
    
    const start = preferences.quietHoursStart || '22:00';
    const end = preferences.quietHoursEnd || '08:00';
    
    // Handle overnight quiet hours
    if (start > end) {
      return currentTime >= start || currentTime <= end;
    } else {
      return currentTime >= start && currentTime <= end;
    }
  }
  
  /**
   * Get priority emoji for email subject
   */
  private getPriorityEmoji(priority?: string): string {
    switch (priority) {
      case 'urgent': return '🔴';
      case 'high': return '🟠';
      case 'normal': return '🟢';
      case 'low': return '🔵';
      default: return '';
    }
  }
  
  /**
   * Generate email HTML content
   */
  private generateEmailHtml(notification: any, user: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 10px 25px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
          .metadata { background: #f9fafb; padding: 10px; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>${notification.title}</h2>
          </div>
          <div class="content">
            <p>Hi ${user.firstName || user.username || 'there'},</p>
            <p>${notification.message}</p>
            
            ${notification.metadata && Object.keys(notification.metadata).length > 0 ? `
              <div class="metadata">
                <h4>Details:</h4>
                ${Object.entries(notification.metadata).map(([key, value]) => 
                  `<p><strong>${this.formatKey(key)}:</strong> ${value}</p>`
                ).join('')}
              </div>
            ` : ''}
            
            ${notification.actionUrl ? `
              <div style="text-align: center;">
                <a href="${notification.actionUrl}" class="button">View Details</a>
              </div>
            ` : ''}
          </div>
          <div class="footer">
            <p>${this.PLATFORM_NAME} - The trusted platform for authentic senior living community information</p>
            <p><a href="${process.env.REPLIT_DOMAINS?.split(',')[0] || 'https://myseniorvalet.com'}/settings/notifications">Manage notification preferences</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
  
  /**
   * Format metadata key for display
   */
  private formatKey(key: string): string {
    return key.replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/^./, str => str.toUpperCase());
  }
  
  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: number, userId: string) {
    await db.update(notifications)
      .set({
        isRead: true,
        readAt: new Date()
      })
      .where(and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId)
      ));
  }
  
  /**
   * Get user notifications
   */
  async getUserNotifications(userId: string, limit = 50) {
    return await db.select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }
  
  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string) {
    const result = await db.select()
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ));
    
    return result.length;
  }
  
  /**
   * Update user notification preferences
   */
  async updatePreferences(userId: string, preferences: any) {
    const existing = await db.select()
      .from(userNotificationPreferences)
      .where(eq(userNotificationPreferences.userId, userId));
    
    if (existing.length > 0) {
      await db.update(userNotificationPreferences)
        .set(preferences)
        .where(eq(userNotificationPreferences.userId, userId));
    } else {
      await db.insert(userNotificationPreferences)
        .values({
          userId,
          ...preferences
        });
    }
  }
  
  /**
   * Send system-wide announcement
   */
  async sendSystemAnnouncement(title: string, message: string, priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal') {
    // Get all users
    const allUsers = await db.select().from(users);
    
    for (const user of allUsers) {
      await this.createNotification({
        userId: user.id.toString(),
        type: 'system',
        category: 'general',
        priority,
        title,
        message,
        channels: ['in_app', 'email']
      });
    }
  }
  
  /**
   * Clean up old notifications
   */
  async cleanupOldNotifications(daysToKeep = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    await db.delete(notifications)
      .where(and(
        eq(notifications.isRead, true),
        lt(notifications.createdAt, cutoffDate)
      ));
  }
}

export const notificationService = new NotificationService();
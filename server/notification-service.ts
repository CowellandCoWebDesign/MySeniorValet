import { db } from "./db";
import { 
  notifications, 
  userNotificationPreferences, 
  communityMilestones,
  notificationQueue,
  communities,
  users,
  type InsertNotification,
  type InsertCommunityMilestone
} from "@shared/schema";
import { eq, and, gte, lte, or, desc, inArray } from "drizzle-orm";
import sgMail from "@sendgrid/mail";
import { 
  NOTIFICATION_EMAIL_CONFIG, 
  getEmailsForNotificationType, 
  isSuperAdminEmail,
  getNotificationSenderEmail 
} from "./config/notification-emails";

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export class NotificationService {
  // Create a new notification
  static async createNotification(data: InsertNotification) {
    try {
      const [notification] = await db.insert(notifications).values(data).returning();
      
      // Check if user wants email notifications
      const [userPrefs] = await db
        .select()
        .from(userNotificationPreferences)
        .where(eq(userNotificationPreferences.userId, data.userId!))
        .limit(1);
      
      if (userPrefs?.emailEnabled && userPrefs.emailFrequency === 'immediate') {
        await this.queueEmailNotification(notification.id, data.userId!);
      }
      
      // Check if this notification should also go to super admin or team
      await this.handleAdminNotifications(notification, data);
      
      return notification;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }
  
  // Handle admin and team notifications
  static async handleAdminNotifications(notification: any, data: InsertNotification) {
    try {
      // Determine notification routing based on type
      let routingKey: keyof typeof NOTIFICATION_EMAIL_CONFIG.routing | null = null;
      
      switch (data.type) {
        case 'system':
          routingKey = 'systemAlerts';
          break;
        case 'milestone':
          routingKey = 'communityMilestones';
          break;
        case 'price_change':
        case 'availability_change':
          // Important updates go to super admin
          routingKey = 'communityMilestones';
          break;
      }
      
      if (routingKey) {
        const emails = getEmailsForNotificationType(routingKey);
        for (const email of emails) {
          await this.queueAdminEmailNotification(notification.id, email, notification.title, data.message);
        }
      }
    } catch (error) {
      console.error("Error handling admin notifications:", error);
    }
  }
  
  // Queue admin email notification
  static async queueAdminEmailNotification(notificationId: number, email: string, subject: string, body: string) {
    try {
      await db.insert(notificationQueue).values({
        notificationId,
        userId: 'system', // System generated for admin
        emailTo: email,
        emailSubject: `[MySeniorValet Admin] ${subject}`,
        emailBody: body,
        status: 'pending'
      });
    } catch (error) {
      console.error("Error queueing admin email notification:", error);
    }
  }
  
  // Create super admin notification
  static async createSuperAdminNotification(
    type: string,
    title: string,
    message: string,
    data?: any
  ) {
    try {
      // Get super admin user
      const [superAdmin] = await db
        .select()
        .from(users)
        .where(eq(users.email, NOTIFICATION_EMAIL_CONFIG.superAdmin.primary))
        .limit(1);
      
      if (!superAdmin) {
        console.error("Super admin user not found");
        return null;
      }
      
      // Create notification for super admin
      const notification = await this.createNotification({
        userId: superAdmin.id,
        type,
        title,
        message,
        category: data?.category || 'general',
        metadata: data || {},
        communityId: data?.communityId || null
      });
      
      return notification;
    } catch (error) {
      console.error("Error creating super admin notification:", error);
      return null;
    }
  }
  
  // Initialize super admin preferences
  static async initializeSuperAdminPreferences() {
    try {
      // Get super admin user
      const [superAdmin] = await db
        .select()
        .from(users)
        .where(eq(users.email, NOTIFICATION_EMAIL_CONFIG.superAdmin.primary))
        .limit(1);
      
      if (!superAdmin) {
        console.log("Super admin user not found, will initialize when created");
        return;
      }
      
      // Check if preferences exist
      const [existingPrefs] = await db
        .select()
        .from(userNotificationPreferences)
        .where(eq(userNotificationPreferences.userId, superAdmin.id))
        .limit(1);
      
      if (!existingPrefs) {
        // Create super admin preferences with all notifications enabled
        await db.insert(userNotificationPreferences).values({
          userId: superAdmin.id,
          emailEnabled: true,
          emailFrequency: 'immediate',
          communityUpdates: true,
          priceChanges: true,
          newPhotos: true,
          newReviews: true,
          availabilityChanges: true,
          milestones: true,
          systemAnnouncements: true,
          watchedCommunities: [],
          quietHoursEnabled: false,
          quietHoursStart: '22:00',
          quietHoursEnd: '08:00',
          timezone: 'America/New_York'
        });
        
        console.log("Super admin notification preferences initialized");
      }
    } catch (error) {
      console.error("Error initializing super admin preferences:", error);
    }
  }
  
  // Queue email notification
  static async queueEmailNotification(notificationId: number, userId: string) {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      
      if (!user?.email) return;
      
      const [notification] = await db
        .select()
        .from(notifications)
        .where(eq(notifications.id, notificationId))
        .limit(1);
      
      if (!notification) return;
      
      await db.insert(notificationQueue).values({
        notificationId,
        userId,
        emailTo: user.email,
        emailSubject: notification.title,
        emailBody: this.generateEmailBody(notification),
        status: 'pending'
      });
    } catch (error) {
      console.error("Error queueing email notification:", error);
    }
  }
  
  // Generate email body from notification
  static generateEmailBody(notification: any): string {
    let body = `<h2>${notification.title}</h2>`;
    body += `<p>${notification.message}</p>`;
    
    if (notification.actionUrl) {
      body += `<p><a href="${process.env.REPLIT_URL || 'https://myseniorvalet.com'}${notification.actionUrl}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Details</a></p>`;
    }
    
    body += `<hr><p style="color: #666; font-size: 12px;">You received this email because you have notifications enabled for MySeniorValet. <a href="${process.env.REPLIT_URL || 'https://myseniorvalet.com'}/dashboard/notification-preferences">Manage your preferences</a></p>`;
    
    return body;
  }
  
  // Process email queue
  static async processEmailQueue() {
    try {
      const pendingEmails = await db
        .select()
        .from(notificationQueue)
        .where(
          and(
            eq(notificationQueue.status, 'pending'),
            lte(notificationQueue.scheduledFor, new Date())
          )
        )
        .limit(10);
      
      for (const email of pendingEmails) {
        try {
          await sgMail.send({
            to: email.emailTo!,
            from: 'notifications@myseniorvalet.com',
            subject: email.emailSubject!,
            html: email.emailBody!
          });
          
          await db
            .update(notificationQueue)
            .set({
              status: 'sent',
              sentAt: new Date()
            })
            .where(eq(notificationQueue.id, email.id));
          
          // Update notification email sent status
          if (email.notificationId) {
            await db
              .update(notifications)
              .set({
                emailSent: true,
                emailSentAt: new Date()
              })
              .where(eq(notifications.id, email.notificationId));
          }
        } catch (error) {
          console.error(`Error sending email ${email.id}:`, error);
          
          await db
            .update(notificationQueue)
            .set({
              status: 'failed',
              attempts: (email.attempts || 0) + 1,
              lastAttemptAt: new Date(),
              error: String(error)
            })
            .where(eq(notificationQueue.id, email.id));
        }
      }
    } catch (error) {
      console.error("Error processing email queue:", error);
    }
  }
  
  // Check and create milestone notifications
  static async checkCommunityMilestones(communityId: number) {
    try {
      const [community] = await db
        .select()
        .from(communities)
        .where(eq(communities.id, communityId))
        .limit(1);
      
      if (!community) return;
      
      const milestoneChecks = [
        {
          type: 'reviews',
          milestones: [
            { name: '10_reviews', threshold: 10, message: 'reached 10 reviews!' },
            { name: '50_reviews', threshold: 50, message: 'reached 50 reviews!' },
            { name: '100_reviews', threshold: 100, message: 'reached 100 reviews! 🎉' }
          ],
          currentValue: community.googleReviewCount || 0
        },
        {
          type: 'photos',
          milestones: [
            { name: '5_photos', threshold: 5, message: 'now has 5 photos' },
            { name: '25_photos', threshold: 25, message: 'now has 25 photos!' },
            { name: '50_photos', threshold: 50, message: 'reached 50 photos! 📸' }
          ],
          currentValue: community.photos?.length || 0
        },
        {
          type: 'rating',
          milestones: [
            { name: '4_star_rating', threshold: 4, message: 'achieved a 4-star rating!' },
            { name: '4.5_star_rating', threshold: 4.5, message: 'achieved a 4.5-star rating! ⭐' }
          ],
          currentValue: parseFloat(community.googleRating || '0')
        }
      ];
      
      for (const check of milestoneChecks) {
        for (const milestone of check.milestones) {
          if (check.currentValue >= milestone.threshold) {
            // Check if milestone already achieved
            const [existing] = await db
              .select()
              .from(communityMilestones)
              .where(
                and(
                  eq(communityMilestones.communityId, communityId),
                  eq(communityMilestones.type, check.type),
                  eq(communityMilestones.milestone, milestone.name)
                )
              )
              .limit(1);
            
            if (!existing) {
              // Create milestone record
              await db.insert(communityMilestones).values({
                communityId,
                type: check.type,
                milestone: milestone.name,
                threshold: milestone.threshold,
                currentValue: check.currentValue,
                achievedAt: new Date(),
                notificationSent: false
              });
              
              // Get users watching this community
              const watchingUsers = await db
                .select()
                .from(userNotificationPreferences)
                .where(
                  and(
                    eq(userNotificationPreferences.milestones, true),
                    or(
                      eq(userNotificationPreferences.watchedCommunities, [communityId]),
                      // This is a simplified check - in production, you'd use a proper array contains check
                    )
                  )
                );
              
              // Create notifications for watching users
              for (const user of watchingUsers) {
                await this.createNotification({
                  type: 'milestone',
                  category: 'milestones',
                  priority: 'high',
                  title: `${community.name} ${milestone.message}`,
                  message: `Great news! ${community.name} has ${milestone.message} This is a significant achievement showing the quality and popularity of this community.`,
                  actionUrl: `/community/${communityId}`,
                  iconType: 'trophy',
                  userId: user.userId,
                  communityId,
                  metadata: {
                    milestone: milestone.name,
                    threshold: milestone.threshold,
                    newValue: check.currentValue
                  }
                });
              }
              
              // Mark milestone notification as sent
              await db
                .update(communityMilestones)
                .set({ notificationSent: true })
                .where(
                  and(
                    eq(communityMilestones.communityId, communityId),
                    eq(communityMilestones.type, check.type),
                    eq(communityMilestones.milestone, milestone.name)
                  )
                );
            }
          }
        }
      }
    } catch (error) {
      console.error("Error checking community milestones:", error);
    }
  }
  
  // Create community update notification
  static async createCommunityUpdateNotification(
    communityId: number,
    updateType: 'price_change' | 'photo_added' | 'availability' | 'review',
    details: any
  ) {
    try {
      const [community] = await db
        .select()
        .from(communities)
        .where(eq(communities.id, communityId))
        .limit(1);
      
      if (!community) return;
      
      // Get users watching this community
      const watchingUsers = await db
        .select()
        .from(userNotificationPreferences);
      
      const notificationConfig = {
        price_change: {
          enabled: 'priceChanges',
          title: `Price update at ${community.name}`,
          message: `The pricing has been updated from ${details.oldValue} to ${details.newValue}.`,
          iconType: 'dollar-sign'
        },
        photo_added: {
          enabled: 'newPhotos',
          title: `New photos added to ${community.name}`,
          message: `${details.photoCount} new photos have been added. Check them out!`,
          iconType: 'camera'
        },
        availability: {
          enabled: 'availabilityChanges',
          title: `Availability update at ${community.name}`,
          message: details.message || 'Availability status has changed.',
          iconType: 'home'
        },
        review: {
          enabled: 'newReviews',
          title: `New review for ${community.name}`,
          message: `A new ${details.rating}-star review has been posted.`,
          iconType: 'star'
        }
      };
      
      const config = notificationConfig[updateType];
      
      for (const userPref of watchingUsers) {
        // Check if user has this type of notification enabled
        const isEnabled = userPref[config.enabled as keyof typeof userPref];
        const isWatching = userPref.watchedCommunities?.includes(communityId);
        
        if (isEnabled && isWatching) {
          await this.createNotification({
            type: updateType,
            category: 'updates',
            priority: 'normal',
            title: config.title,
            message: config.message,
            actionUrl: `/community/${communityId}`,
            iconType: config.iconType,
            userId: userPref.userId,
            communityId,
            metadata: details
          });
        }
      }
    } catch (error) {
      console.error("Error creating community update notification:", error);
    }
  }
  
  // Get user notifications
  static async getUserNotifications(userId: string, unreadOnly = false) {
    try {
      const conditions = [eq(notifications.userId, userId)];
      
      if (unreadOnly) {
        conditions.push(eq(notifications.isRead, false));
      }
      
      const userNotifications = await db
        .select({
          notification: notifications,
          community: communities
        })
        .from(notifications)
        .leftJoin(communities, eq(notifications.communityId, communities.id))
        .where(and(...conditions))
        .orderBy(desc(notifications.createdAt))
        .limit(50);
      
      return userNotifications;
    } catch (error) {
      console.error("Error getting user notifications:", error);
      throw error;
    }
  }
  
  // Mark notification as read
  static async markAsRead(notificationId: number, userId: string) {
    try {
      await db
        .update(notifications)
        .set({
          isRead: true,
          readAt: new Date()
        })
        .where(
          and(
            eq(notifications.id, notificationId),
            eq(notifications.userId, userId)
          )
        );
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }
  
  // Mark all notifications as read
  static async markAllAsRead(userId: string) {
    try {
      await db
        .update(notifications)
        .set({
          isRead: true,
          readAt: new Date()
        })
        .where(
          and(
            eq(notifications.userId, userId),
            eq(notifications.isRead, false)
          )
        );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  }
  
  // Get unread count
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const result = await db
        .select()
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, userId),
            eq(notifications.isRead, false)
          )
        );
      
      return result.length;
    } catch (error) {
      console.error("Error getting unread count:", error);
      return 0;
    }
  }
  
  // Clean up old notifications
  static async cleanupOldNotifications() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      await db
        .delete(notifications)
        .where(
          and(
            eq(notifications.isRead, true),
            lte(notifications.createdAt, thirtyDaysAgo)
          )
        );
    } catch (error) {
      console.error("Error cleaning up old notifications:", error);
    }
  }
}

// Set up periodic tasks
if (process.env.NODE_ENV === 'production') {
  // Process email queue every minute
  setInterval(() => {
    NotificationService.processEmailQueue();
  }, 60 * 1000);
  
  // Clean up old notifications daily
  setInterval(() => {
    NotificationService.cleanupOldNotifications();
  }, 24 * 60 * 60 * 1000);
}
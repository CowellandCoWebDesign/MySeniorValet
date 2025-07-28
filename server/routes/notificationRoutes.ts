import { type Express } from "express";
import { db } from "../db";
import { messages, users } from "@shared/schema";
import { eq, and, desc, or, sql } from "drizzle-orm";
import { isAuthenticated as requireAuth } from "../replitAuth";
import { z } from "zod";

const createNotificationSchema = z.object({
  type: z.enum(['system', 'community', 'tour', 'message', 'price_alert', 'review']),
  title: z.string().min(1),
  message: z.string().min(1),
  link: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

export function registerNotificationRoutes(app: Express) {
  // Get user notifications
  app.get('/api/notifications', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const { unreadOnly = 'false', limit = '50', offset = '0' } = req.query;

      let conditions = [eq(notifications.userId, userId)];
      
      if (unreadOnly === 'true') {
        conditions.push(eq(notifications.read, false));
      }

      const userNotifications = await db
        .select()
        .from(notifications)
        .where(and(...conditions))
        .orderBy(desc(notifications.createdAt))
        .limit(parseInt(limit as string))
        .offset(parseInt(offset as string));

      // Get unread count
      const [{ unreadCount }] = await db
        .select({ unreadCount: sql`COUNT(*)` })
        .from(notifications)
        .where(and(
          eq(notifications.userId, userId),
          eq(notifications.read, false)
        ));

      res.json({
        notifications: userNotifications,
        unreadCount: parseInt(unreadCount as string)
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ message: 'Failed to fetch notifications' });
    }
  });

  // Mark notification as read
  app.patch('/api/notifications/:notificationId/read', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const notificationId = parseInt(req.params.notificationId);

      const [updated] = await db
        .update(notifications)
        .set({
          read: true,
          readAt: new Date(),
          updatedAt: new Date()
        })
        .where(and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId)
        ))
        .returning();

      if (!updated) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      res.json(updated);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ message: 'Failed to mark notification as read' });
    }
  });

  // Mark all notifications as read
  app.post('/api/notifications/mark-all-read', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const result = await db
        .update(notifications)
        .set({
          read: true,
          readAt: new Date(),
          updatedAt: new Date()
        })
        .where(and(
          eq(notifications.userId, userId),
          eq(notifications.read, false)
        ));

      res.json({ success: true });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({ message: 'Failed to mark all notifications as read' });
    }
  });

  // Delete notification
  app.delete('/api/notifications/:notificationId', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const notificationId = parseInt(req.params.notificationId);

      await db
        .delete(notifications)
        .where(and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId)
        ));

      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({ message: 'Failed to delete notification' });
    }
  });

  // Delete all read notifications
  app.delete('/api/notifications/clear-read', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      await db
        .delete(notifications)
        .where(and(
          eq(notifications.userId, userId),
          eq(notifications.read, true)
        ));

      res.json({ success: true });
    } catch (error) {
      console.error('Error clearing read notifications:', error);
      res.status(500).json({ message: 'Failed to clear read notifications' });
    }
  });

  // Get notification preferences
  app.get('/api/notifications/preferences', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const [user] = await db
        .select({ notifications: users.notifications })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user.notifications || {
        emailNotifications: true,
        smsNotifications: false,
        newListings: false,
        priceAlerts: false,
        messageAlerts: true,
        reviewReminders: false,
        tourReminders: true
      });
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      res.status(500).json({ message: 'Failed to fetch notification preferences' });
    }
  });

  // Update notification preferences
  app.patch('/api/notifications/preferences', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const preferences = req.body;

      const [updated] = await db
        .update(users)
        .set({
          notifications: preferences,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId))
        .returning({ notifications: users.notifications });

      if (!updated) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(updated.notifications);
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      res.status(500).json({ message: 'Failed to update notification preferences' });
    }
  });

  // Send notification (internal use)
  app.post('/api/notifications/send', requireAuth, async (req: any, res) => {
    try {
      const validatedData = createNotificationSchema.parse(req.body);
      const { targetUserId } = req.body;

      if (!targetUserId) {
        return res.status(400).json({ message: 'Target user ID is required' });
      }

      const [notification] = await db
        .insert(notifications)
        .values({
          userId: targetUserId,
          ...validatedData,
          read: false
        })
        .returning();

      // TODO: Trigger real-time notification via WebSocket
      // TODO: Send email/SMS if user preferences allow

      res.json(notification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid notification data', errors: error.errors });
      }
      console.error('Error sending notification:', error);
      res.status(500).json({ message: 'Failed to send notification' });
    }
  });

  // Subscribe to price alerts
  app.post('/api/notifications/price-alerts/subscribe', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const { communityId, targetPrice } = req.body;

      if (!communityId || !targetPrice) {
        return res.status(400).json({ message: 'Community ID and target price are required' });
      }

      // TODO: Implement price alert subscription system
      res.json({ 
        success: true, 
        message: 'Subscribed to price alerts for this community' 
      });
    } catch (error) {
      console.error('Error subscribing to price alerts:', error);
      res.status(500).json({ message: 'Failed to subscribe to price alerts' });
    }
  });

  // Unsubscribe from price alerts
  app.delete('/api/notifications/price-alerts/:communityId', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const communityId = parseInt(req.params.communityId);

      // TODO: Implement price alert unsubscription
      res.json({ 
        success: true, 
        message: 'Unsubscribed from price alerts for this community' 
      });
    } catch (error) {
      console.error('Error unsubscribing from price alerts:', error);
      res.status(500).json({ message: 'Failed to unsubscribe from price alerts' });
    }
  });
}
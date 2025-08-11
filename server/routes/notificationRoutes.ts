import { Request, Response, Router } from "express";
import { NotificationService } from "../notification-service";
import { db } from "../db";
import { userNotificationPreferences, notifications } from "@shared/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const router = Router();

// Get user notifications
router.get("/api/notifications", async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const unreadOnly = req.query.unreadOnly === 'true';
    const userNotifications = await NotificationService.getUserNotifications(
      req.user.id,
      unreadOnly
    );
    
    res.json(userNotifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// Get unread count
router.get("/api/notifications/unread-count", async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const count = await NotificationService.getUnreadCount(req.user.id);
    res.json({ count });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ error: "Failed to fetch unread count" });
  }
});

// Mark notification as read
router.post("/api/notifications/:id/read", async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const notificationId = parseInt(req.params.id);
    await NotificationService.markAsRead(notificationId, req.user.id);
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});

// Mark all notifications as read
router.post("/api/notifications/read-all", async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    await NotificationService.markAllAsRead(req.user.id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ error: "Failed to mark all notifications as read" });
  }
});

// Get user notification preferences
router.get("/api/notifications/preferences", async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const [preferences] = await db
      .select()
      .from(userNotificationPreferences)
      .where(eq(userNotificationPreferences.userId, req.user.id))
      .limit(1);
    
    // If no preferences exist, create default ones
    if (!preferences) {
      const [newPreferences] = await db
        .insert(userNotificationPreferences)
        .values({
          userId: req.user.id
        })
        .returning();
      
      return res.json(newPreferences);
    }
    
    res.json(preferences);
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    res.status(500).json({ error: "Failed to fetch notification preferences" });
  }
});

// Update notification preferences
const updatePreferencesSchema = z.object({
  emailEnabled: z.boolean().optional(),
  emailFrequency: z.enum(['immediate', 'daily', 'weekly', 'never']).optional(),
  communityUpdates: z.boolean().optional(),
  priceChanges: z.boolean().optional(),
  newPhotos: z.boolean().optional(),
  newReviews: z.boolean().optional(),
  availabilityChanges: z.boolean().optional(),
  milestones: z.boolean().optional(),
  systemAnnouncements: z.boolean().optional(),
  watchedCommunities: z.array(z.number()).optional(),
  quietHoursEnabled: z.boolean().optional(),
  quietHoursStart: z.string().optional(),
  quietHoursEnd: z.string().optional(),
  timezone: z.string().optional()
});

router.put("/api/notifications/preferences", async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const parsed = updatePreferencesSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid preferences data" });
    }
    
    // Check if preferences exist
    const [existing] = await db
      .select()
      .from(userNotificationPreferences)
      .where(eq(userNotificationPreferences.userId, req.user.id))
      .limit(1);
    
    if (existing) {
      // Update existing preferences
      const [updated] = await db
        .update(userNotificationPreferences)
        .set({
          ...parsed.data,
          updatedAt: new Date()
        })
        .where(eq(userNotificationPreferences.userId, req.user.id))
        .returning();
      
      res.json(updated);
    } else {
      // Create new preferences
      const [created] = await db
        .insert(userNotificationPreferences)
        .values({
          userId: req.user.id,
          ...parsed.data
        })
        .returning();
      
      res.json(created);
    }
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    res.status(500).json({ error: "Failed to update notification preferences" });
  }
});

// Add/remove community from watch list
router.post("/api/notifications/watch-community/:id", async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const communityId = parseInt(req.params.id);
    const { watch } = req.body;
    
    // Get current preferences
    const [preferences] = await db
      .select()
      .from(userNotificationPreferences)
      .where(eq(userNotificationPreferences.userId, req.user.id))
      .limit(1);
    
    if (!preferences) {
      // Create new preferences with this community watched
      await db.insert(userNotificationPreferences).values({
        userId: req.user.id,
        watchedCommunities: watch ? [communityId] : []
      });
    } else {
      // Update watched communities list
      let watchedCommunities = preferences.watchedCommunities || [];
      
      if (watch) {
        if (!watchedCommunities.includes(communityId)) {
          watchedCommunities.push(communityId);
        }
      } else {
        watchedCommunities = watchedCommunities.filter(id => id !== communityId);
      }
      
      await db
        .update(userNotificationPreferences)
        .set({
          watchedCommunities,
          updatedAt: new Date()
        })
        .where(eq(userNotificationPreferences.userId, req.user.id));
    }
    
    res.json({ success: true, watching: watch });
  } catch (error) {
    console.error("Error updating watched communities:", error);
    res.status(500).json({ error: "Failed to update watched communities" });
  }
});

// Create test notification (for development)
router.post("/api/notifications/test", async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const notification = await NotificationService.createNotification({
      type: 'system',
      category: 'general',
      priority: 'normal',
      title: 'Test Notification',
      message: 'This is a test notification to verify the notification system is working properly.',
      actionUrl: '/dashboard',
      iconType: 'bell',
      userId: req.user.id
    });
    
    res.json(notification);
  } catch (error) {
    console.error("Error creating test notification:", error);
    res.status(500).json({ error: "Failed to create test notification" });
  }
});

export default router;
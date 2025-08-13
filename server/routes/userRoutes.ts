import { type Express } from "express";
import { db } from "../db";
import { 
  users, 
  userFavorites, 
  userSavedSearches,
  userActivity,
  tours,
  communities 
} from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { isAuthenticated as requireAuth } from "../auth-middleware";
import { storage } from "../storage";

export function registerUserRoutes(app: Express) {
  // User favorites
  app.get('/api/user/favorites', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      // Handle test users in development
      if (typeof userId === 'string' && userId.startsWith('test-')) {
        // Return empty favorites array for test users
        return res.json([]);
      }
      
      // Ensure userId is a number for database queries
      const numericUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
      if (isNaN(numericUserId)) {
        return res.json([]); // Return empty array for invalid user IDs
      }
      
      const favorites = await db
        .select({
          id: userFavorites.id,
          communityId: userFavorites.communityId,
          notes: userFavorites.notes,
          priority: userFavorites.priority,
          tags: userFavorites.tags,
          addedAt: userFavorites.updatedAt,
          community: {
            id: communities.id,
            name: communities.name,
            address: communities.address,
            city: communities.city,
            state: communities.state,
            careTypes: communities.careTypes,
            photos: communities.photos,
            rating: communities.rating,
            priceRange: communities.priceRange,
          }
        })
        .from(userFavorites)
        .leftJoin(communities, eq(userFavorites.communityId, communities.id))
        .where(eq(userFavorites.userId, numericUserId))
        .orderBy(desc(userFavorites.updatedAt));

      res.json(favorites);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      res.status(500).json({ message: 'Failed to fetch favorites' });
    }
  });

  app.post('/api/user/favorites', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      // Handle test users in development
      if (typeof userId === 'string' && userId.startsWith('test-')) {
        // Return success without actually creating a favorite for test users
        return res.json({ message: 'Favorite simulated for test user' });
      }
      
      // Ensure userId is a number for database queries
      const numericUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
      if (isNaN(numericUserId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      const { communityId, notes, priority, tags } = req.body;

      // Check if already favorited
      const existing = await db
        .select()
        .from(userFavorites)
        .where(and(
          eq(userFavorites.userId, numericUserId),
          eq(userFavorites.communityId, communityId)
        ))
        .limit(1);

      if (existing.length > 0) {
        return res.status(400).json({ message: 'Community already in favorites' });
      }

      const [favorite] = await db
        .insert(userFavorites)
        .values({
          userId: numericUserId,
          communityId,
          notes: notes || null,
          priority: priority || 0,
          tags: tags || [],
        })
        .returning();

      res.json(favorite);
    } catch (error) {
      console.error('Error adding favorite:', error);
      res.status(500).json({ message: 'Failed to add favorite' });
    }
  });

  app.delete('/api/user/favorites/:communityId', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      // Handle test users in development
      if (typeof userId === 'string' && userId.startsWith('test-')) {
        return res.json({ message: 'Favorite removed for test user' });
      }
      
      // Ensure userId is a number for database queries
      const numericUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
      if (isNaN(numericUserId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      const communityId = parseInt(req.params.communityId);

      await db
        .delete(userFavorites)
        .where(and(
          eq(userFavorites.userId, numericUserId),
          eq(userFavorites.communityId, communityId)
        ));

      res.json({ success: true });
    } catch (error) {
      console.error('Error removing favorite:', error);
      res.status(500).json({ message: 'Failed to remove favorite' });
    }
  });

  app.patch('/api/user/favorites/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const favoriteId = parseInt(req.params.id);
      const { notes, priority, tags } = req.body;

      const [updated] = await db
        .update(userFavorites)
        .set({
          notes: notes !== undefined ? notes : undefined,
          priority: priority !== undefined ? priority : undefined,
          tags: tags !== undefined ? tags : undefined,
          updatedAt: new Date()
        })
        .where(and(
          eq(userFavorites.id, favoriteId),
          eq(userFavorites.userId, userId)
        ))
        .returning();

      if (!updated) {
        return res.status(404).json({ message: 'Favorite not found' });
      }

      res.json(updated);
    } catch (error) {
      console.error('Error updating favorite:', error);
      res.status(500).json({ message: 'Failed to update favorite' });
    }
  });

  // Saved searches
  app.get('/api/user/saved-searches', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const savedSearches = await db
        .select()
        .from(userSavedSearches)
        .where(eq(userSavedSearches.userId, userId))
        .orderBy(desc(userSavedSearches.createdAt));

      res.json(savedSearches);
    } catch (error) {
      console.error('Error fetching saved searches:', error);
      res.status(500).json({ message: 'Failed to fetch saved searches' });
    }
  });

  app.post('/api/user/saved-searches', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const { searchName, searchParams, alertsEnabled } = req.body;

      const [savedSearch] = await db
        .insert(userSavedSearches)
        .values({
          userId,
          searchName,
          searchParams,
          alertsEnabled: alertsEnabled || false,
        })
        .returning();

      res.json(savedSearch);
    } catch (error) {
      console.error('Error saving search:', error);
      res.status(500).json({ message: 'Failed to save search' });
    }
  });

  app.delete('/api/user/saved-searches/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const searchId = parseInt(req.params.id);

      await db
        .delete(userSavedSearches)
        .where(and(
          eq(userSavedSearches.id, searchId),
          eq(userSavedSearches.userId, userId)
        ));

      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting saved search:', error);
      res.status(500).json({ message: 'Failed to delete saved search' });
    }
  });

  // Dashboard preferences
  app.get('/api/user/dashboard-preferences', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const [user] = await db
        .select({ dashboardPreferences: users.dashboardPreferences })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user.dashboardPreferences || {
        layoutType: 'detailed',
        fontSize: 'medium',
        highContrast: false,
        reducedMotion: false,
        cardSize: 'comfortable',
        showHelpTips: true,
        quickActions: ['search', 'favorites', 'schedule-tour', 'family-share'],
        dashboardSections: {
          favorites: { visible: true, order: 1 },
          recentSearches: { visible: true, order: 2 },
          recommendations: { visible: true, order: 3 },
          savedCommunities: { visible: true, order: 4 },
          tourSchedule: { visible: true, order: 5 },
          familyNotes: { visible: true, order: 6 }
        }
      });
    } catch (error) {
      console.error('Error fetching dashboard preferences:', error);
      res.status(500).json({ message: 'Failed to fetch dashboard preferences' });
    }
  });

  app.patch('/api/user/dashboard-preferences', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const preferences = req.body;

      const [updated] = await db
        .update(users)
        .set({
          dashboardPreferences: preferences,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId))
        .returning({ dashboardPreferences: users.dashboardPreferences });

      if (!updated) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(updated.dashboardPreferences);
    } catch (error) {
      console.error('Error updating dashboard preferences:', error);
      res.status(500).json({ message: 'Failed to update dashboard preferences' });
    }
  });

  // Dashboard data
  app.get('/api/user/dashboard-data', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      // Get user's favorite communities with details
      const favorites = await db
        .select({
          id: userFavorites.id,
          communityId: userFavorites.communityId,
          notes: userFavorites.notes,
          priority: userFavorites.priority,
          tags: userFavorites.tags,
          createdAt: userFavorites.updatedAt,
          community: {
            id: communities.id,
            name: communities.name,
            city: communities.city,
            state: communities.state,
            rating: communities.rating,
            priceRange: communities.priceRange,
            careTypes: communities.careTypes,
            photos: communities.photos
          }
        })
        .from(userFavorites)
        .innerJoin(communities, eq(userFavorites.communityId, communities.id))
        .where(eq(userFavorites.userId, userId))
        .orderBy(desc(userFavorites.priority), desc(userFavorites.updatedAt))
        .limit(10);

      // Get recent searches
      const recentSearches = await db
        .select()
        .from(userSavedSearches)
        .where(eq(userSavedSearches.userId, userId))
        .orderBy(desc(userSavedSearches.createdAt))
        .limit(5);

      // Get upcoming tours
      const upcomingTours = await storage.getToursByUser(userId);

      // Get personalized recommendations
      const recommendations = await db
        .select()
        .from(communities)
        .where(sql`${communities.rating}::float >= 4.5`)
        .orderBy(desc(communities.rating))
        .limit(6);

      res.json({
        favorites: favorites.map(f => ({
          ...f.community,
          favoriteId: f.id,
          notes: f.notes,
          priority: f.priority,
          tags: f.tags,
          lastVisited: f.createdAt
        })),
        recentSearches: recentSearches.map(s => ({
          query: s.searchName,
          date: s.createdAt,
          params: s.searchParams
        })),
        upcomingTours: upcomingTours.filter(t => t.status === 'scheduled'),
        recommendations
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      res.status(500).json({ message: 'Failed to fetch dashboard data' });
    }
  });

  // User activity tracking
  app.post('/api/user/activity', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const { action, resourceType, resourceId, details } = req.body;

      await db.insert(userActivity).values({
        userId,
        action,
        resourceType,
        resourceId,
        details,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Error tracking user activity:', error);
      res.status(500).json({ message: 'Failed to track activity' });
    }
  });

  // User notifications preferences
  app.get('/api/user/notifications', requireAuth, async (req: any, res) => {
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
      });
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      res.status(500).json({ message: 'Failed to fetch notification preferences' });
    }
  });

  app.patch('/api/user/notifications', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const notifications = req.body;

      const [updated] = await db
        .update(users)
        .set({
          notifications,
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

  // User notes
  app.get("/api/notes", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const favorites = await db
        .select({
          id: userFavorites.id,
          communityId: userFavorites.communityId,
          notes: userFavorites.notes,
          updatedAt: userFavorites.updatedAt,
          community: {
            name: communities.name,
            city: communities.city,
            state: communities.state
          }
        })
        .from(userFavorites)
        .innerJoin(communities, eq(userFavorites.communityId, communities.id))
        .where(
          and(
            eq(userFavorites.userId, userId),
            sql`${userFavorites.notes} IS NOT NULL AND ${userFavorites.notes} != ''`
          )
        )
        .orderBy(desc(userFavorites.updatedAt));
      
      const notesData = favorites.map(fav => ({
        id: fav.id,
        communityId: fav.communityId,
        communityName: `${fav.community.name} - ${fav.community.city}, ${fav.community.state}`,
        notes: fav.notes,
        createdAt: fav.updatedAt
      }));
      
      res.json(notesData);
    } catch (error) {
      console.error("Error fetching notes:", error);
      res.status(500).json({ message: "Failed to fetch notes" });
    }
  });
}
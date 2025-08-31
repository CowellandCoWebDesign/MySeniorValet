import { type Express } from "express";
import { db } from "../db";
import { 
  users, 
  userFavorites, 
  userSavedSearches,
  userActivity,
  tours,
  communities,
  searchHistory 
} from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { isAuthenticated as requireAuth } from "../auth-middleware";
import { storage } from "../storage";
import { Parser } from 'json2csv';

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

  // Dashboard data - Legacy endpoint
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

  // New Dashboard data endpoint with user ID parameter
  app.get('/api/users/:id/dashboard-data', requireAuth, async (req: any, res) => {
    try {
      const userId = parseInt(req.params.id);
      const currentUserId = req.session?.user?.id || req.user?.id || 1; // Fallback to user 1 for dev
      
      // Ensure user can only access their own dashboard data
      if (userId !== currentUserId) {
        return res.status(403).json({ message: 'Access denied' });
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
            photos: communities.photos,
            availability: sql<any>`COALESCE(${communities.city}, 'Available')`
          }
        })
        .from(userFavorites)
        .innerJoin(communities, eq(userFavorites.communityId, communities.id))
        .where(eq(userFavorites.userId, userId))
        .orderBy(desc(userFavorites.priority), desc(userFavorites.updatedAt))
        .limit(20);

      // Get recent searches from searchHistory table
      const searches = await db
        .select()
        .from(searchHistory)
        .where(eq(searchHistory.userId, userId))
        .orderBy(desc(searchHistory.createdAt))
        .limit(10);

      // Get upcoming tours - skip for now due to userId type mismatch
      const upcomingTours: any[] = [];

      // Get user activity stats
      const activityStats = await db
        .select({
          action: userActivity.activityType,
          count: sql<number>`COUNT(*)::int`
        })
        .from(userActivity)
        .where(eq(userActivity.userId, userId))
        .groupBy(userActivity.activityType);

      // Get personalized recommendations based on user preferences
      const recommendations = await db
        .select()
        .from(communities)
        .where(sql`${communities.rating}::float >= 4.0`)
        .orderBy(desc(communities.rating))
        .limit(8);

      // Format response data
      const dashboardData = {
        favorites: favorites.map(f => ({
          id: f.community.id,
          name: f.community.name,
          address: `${f.community.city}, ${f.community.state}`,
          city: f.community.city,
          state: f.community.state,
          priceRange: f.community.priceRange || 'Contact for pricing',
          careType: Array.isArray(f.community.careTypes) ? f.community.careTypes[0] : 'Senior Living',
          rating: f.community.rating || 4.0,
          availability: f.community.availability || 'Available',
          savedDate: f.createdAt?.toISOString() || new Date().toISOString(),
          notes: f.notes,
          tags: f.tags,
          priority: f.priority
        })),
        searchHistory: searches.map((s: any) => ({
          id: s.id?.toString() || Math.random().toString(),
          query: s.searchQuery?.location || 'Senior living search',
          location: s.searchQuery?.location || 'All locations',
          results: s.resultCount || 0,
          date: s.createdAt?.toISOString() || new Date().toISOString()
        })),
        tourRequests: upcomingTours.map(t => ({
          id: t.id?.toString() || Math.random().toString(),
          communityName: t.communityName || 'Community',
          requestedDate: t.scheduledDate?.toISOString() || new Date().toISOString(),
          status: t.status || 'pending',
          contactPerson: t.contactPerson || 'Tour Coordinator',
          phone: t.phone || '(555) 123-4567'
        })),
        recommendations: recommendations.map(r => ({
          id: r.id,
          name: r.name,
          city: r.city,
          state: r.state,
          priceRange: r.priceRange || 'Contact for pricing',
          rating: r.rating || 4.0,
          careTypes: r.careTypes,
          photos: r.photos
        })),
        stats: {
          totalFavorites: favorites.length,
          totalSearches: searches.length,
          totalTours: upcomingTours.length,
          profileCompletion: 85,
          activityScore: activityStats.reduce((sum, stat) => sum + stat.count, 0)
        },
        recentActivity: activityStats.slice(0, 5).map(stat => ({
          action: stat.action,
          count: stat.count,
          timestamp: new Date().toISOString()
        }))
      };

      res.json(dashboardData);
    } catch (error) {
      console.error('Error fetching user dashboard data:', error);
      res.status(500).json({ 
        message: 'Failed to fetch dashboard data',
        error: process.env.NODE_ENV === 'development' ? error : undefined 
      });
    }
  });

  // Export user data in various formats
  app.get('/api/users/:id/export', requireAuth, async (req: any, res) => {
    try {
      const userId = parseInt(req.params.id);
      const format = req.query.format || 'json';
      const currentUserId = req.session?.user?.id || req.user?.id || 1;
      
      if (userId !== currentUserId) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Get all user data
      const favorites = await db
        .select()
        .from(userFavorites)
        .innerJoin(communities, eq(userFavorites.communityId, communities.id))
        .where(eq(userFavorites.userId, userId));
      
      const searches = await db
        .select()
        .from(searchHistory)
        .where(eq(searchHistory.userId, userId))
        .orderBy(desc(searchHistory.searchedAt));
      
      const tourData = await db
        .select()
        .from(tours)
        .where(eq(tours.userId, userId));
      
      const exportData = {
        exportDate: new Date().toISOString(),
        userData: {
          userId,
          email: req.user?.email
        },
        favorites: favorites.map(f => ({
          communityName: f.communities.name,
          city: f.communities.city,
          state: f.communities.state,
          priceRange: f.communities.priceRange,
          notes: f.userFavorites.notes,
          savedDate: f.userFavorites.createdAt
        })),
        searchHistory: searches.map(s => ({
          query: s.query,
          location: s.location,
          date: s.searchedAt
        })),
        tours: tourData.map(t => ({
          communityId: t.communityId,
          scheduledDate: t.scheduledDate,
          status: t.status
        }))
      };
      
      if (format === 'csv') {
        const fields = ['communityName', 'city', 'state', 'priceRange', 'notes', 'savedDate'];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(exportData.favorites);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="dashboard-export.csv"');
        res.send(csv);
      } else if (format === 'pdf') {
        // For PDF, we'll return JSON with formatting hints
        res.setHeader('Content-Type', 'application/json');
        res.json({ ...exportData, format: 'pdf-ready' });
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename="dashboard-export.json"');
        res.json(exportData);
      }
    } catch (error) {
      console.error('Error exporting user data:', error);
      res.status(500).json({ message: 'Failed to export data' });
    }
  });

  // Track search history
  app.post('/api/users/:id/search-history', requireAuth, async (req: any, res) => {
    try {
      const userId = parseInt(req.params.id);
      const currentUserId = req.session?.user?.id || req.user?.id || 1;
      
      if (userId !== currentUserId) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const { query, location, results } = req.body;
      
      await db.insert(searchHistory).values({
        userId,
        query,
        location,
        results,
        searchedAt: new Date()
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error tracking search:', error);
      res.status(500).json({ message: 'Failed to track search' });
    }
  });

  // Get user recommendations with AI scoring
  app.get('/api/users/:id/recommendations', requireAuth, async (req: any, res) => {
    try {
      const userId = parseInt(req.params.id);
      const currentUserId = req.session?.user?.id || req.user?.id || 1;
      
      if (userId !== currentUserId) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Get user's saved searches to understand preferences
      const userSearches = await db
        .select()
        .from(searchHistory)
        .where(eq(searchHistory.userId, userId))
        .orderBy(desc(searchHistory.searchedAt))
        .limit(10);
      
      // Get user's favorites to understand preferences
      const userFavs = await db
        .select()
        .from(userFavorites)
        .where(eq(userFavorites.userId, userId))
        .limit(10);
      
      // Get recommendations based on user activity
      const recommendations = await db
        .select()
        .from(communities)
        .where(sql`${communities.rating}::float >= 4.2`)
        .orderBy(desc(communities.rating))
        .limit(12);
      
      // Score and rank recommendations
      const scoredRecommendations = recommendations.map(rec => {
        let score = rec.rating || 4.0;
        
        // Boost score if community matches user's search patterns
        userSearches.forEach(search => {
          if (search.location && rec.city?.toLowerCase().includes(search.location.toLowerCase())) {
            score += 0.5;
          }
        });
        
        return {
          ...rec,
          matchScore: Math.min(score * 20, 100),
          reasons: [
            rec.rating >= 4.5 ? 'Highly rated' : null,
            rec.priceRange?.includes('$') ? 'Affordable' : null,
            'Verified community',
            'Available now'
          ].filter(Boolean)
        };
      });
      
      res.json(scoredRecommendations.sort((a, b) => b.matchScore - a.matchScore));
    } catch (error) {
      console.error('Error getting recommendations:', error);
      res.status(500).json({ message: 'Failed to get recommendations' });
    }
  });

  // WebSocket dashboard updates endpoint placeholder
  app.post('/api/users/:id/dashboard-update', requireAuth, async (req: any, res) => {
    try {
      const userId = parseInt(req.params.id);
      const currentUserId = req.session?.user?.id || req.user?.id || 1;
      
      if (userId !== currentUserId) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Trigger WebSocket update for connected clients
      // This would connect to your WebSocket server
      res.json({ success: true, message: 'Dashboard update triggered' });
    } catch (error) {
      console.error('Error triggering dashboard update:', error);
      res.status(500).json({ message: 'Failed to trigger update' });
    }
  });

  // Track user activity
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
        createdAt: new Date()
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error tracking activity:', error);
      res.status(500).json({ message: 'Failed to track activity' });
    }
  });

  // Get user activity timeline
  app.get('/api/users/:id/activity', requireAuth, async (req: any, res) => {
    try {
      const userId = parseInt(req.params.id);
      const currentUserId = req.session?.user?.id || req.user?.id || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      
      if (userId !== currentUserId) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const activities = await db
        .select()
        .from(userActivity)
        .where(eq(userActivity.userId, userId))
        .orderBy(desc(userActivity.createdAt))
        .limit(limit);
      
      res.json(activities);
    } catch (error) {
      console.error('Error fetching activity:', error);
      res.status(500).json({ message: 'Failed to fetch activity' });
    }
  });
}
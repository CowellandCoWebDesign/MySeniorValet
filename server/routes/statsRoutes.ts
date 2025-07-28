import { type Express } from "express";
import { db } from "../db";
import { communities, users, tours, reviews, vendors, userActivity } from "@shared/schema";
import { sql } from "drizzle-orm";
import { communityStatsCache } from "../community-stats-cache";
import { enhancedPlatformStats } from "../enhanced-platform-stats";

export function registerStatsRoutes(app: Express) {
  // Hero images endpoint - Using Pixabay for high-quality senior living imagery
  app.get('/api/images/hero', async (req, res) => {
    try {
      const { pixabayService } = await import('../pixabay-api');
      
      // Get curated senior living hero images from Pixabay
      const heroImages = await pixabayService.searchImages('luxury resort pool tropical palm trees', 'places', 1920);
      
      if (heroImages && heroImages.length > 0) {
        const selectedImage = heroImages[0];
        res.json({
          url: selectedImage.largeImageURL,
          alt: `Premium resort-style senior living environment - ${selectedImage.tags}`,
          credit: `Pixabay - ${selectedImage.user}`
        });
      } else {
        // Fallback to a specific high-quality resort image
        res.json({
          url: 'https://pixabay.com/get/g1b8db4f4c8f2a0e8b6e4b3b6b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b.jpg',
          alt: 'Luxury senior living resort with tropical amenities',
          credit: 'Pixabay'
        });
      }
    } catch (error) {
      console.error('Error fetching hero images from Pixabay:', error);
      res.status(500).json({ error: 'Failed to fetch hero images' });
    }
  });
  // Platform-wide statistics
  app.get('/api/stats/platform', async (req, res) => {
    try {
      const stats = await enhancedPlatformStats.getPlatformStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching platform stats:', error);
      res.status(500).json({ error: 'Failed to fetch platform statistics' });
    }
  });

  // Community statistics
  app.get('/api/stats/communities', async (req, res) => {
    try {
      const cachedStats = communityStatsCache.getStats();
      
      if (cachedStats) {
        return res.json(cachedStats);
      }

      // Fallback to direct database query
      const stats = await db
        .select({
          totalCommunities: sql`COUNT(*)`,
          avgRating: sql`AVG(CAST(${communities.rating} AS FLOAT))`,
          totalWithPhotos: sql`COUNT(CASE WHEN ${communities.photos}::text[] != '{}' THEN 1 END)`,
          totalHUD: sql`COUNT(CASE WHEN ${communities.hudPropertyId} IS NOT NULL THEN 1 END)`,
          totalClaimed: sql`COUNT(CASE WHEN ${communities.claimedBy} IS NOT NULL THEN 1 END)`,
          stateCount: sql`COUNT(DISTINCT ${communities.state})`
        })
        .from(communities);

      res.json(stats[0]);
    } catch (error) {
      console.error('Error fetching community stats:', error);
      res.status(500).json({ error: 'Failed to fetch community statistics' });
    }
  });

  // State distribution
  app.get('/api/stats/states', async (req, res) => {
    try {
      const stateDistribution = await db
        .select({
          state: communities.state,
          count: sql`COUNT(*)`,
          avgRating: sql`AVG(CAST(${communities.rating} AS FLOAT))`,
          hudCount: sql`COUNT(CASE WHEN ${communities.hudPropertyId} IS NOT NULL THEN 1 END)`
        })
        .from(communities)
        .groupBy(communities.state)
        .orderBy(sql`COUNT(*) DESC`);

      res.json(stateDistribution);
    } catch (error) {
      console.error('Error fetching state distribution:', error);
      res.status(500).json({ error: 'Failed to fetch state distribution' });
    }
  });

  // Care type distribution
  app.get('/api/stats/care-types', async (req, res) => {
    try {
      const careTypes = ['Independent Living', 'Assisted Living', 'Memory Care', 'Skilled Nursing', 'Adult Day Care'];
      
      const distribution = await Promise.all(
        careTypes.map(async (careType) => {
          const [result] = await db
            .select({
              count: sql`COUNT(*)`
            })
            .from(communities)
            .where(sql`${careType} = ANY(${communities.careTypes})`);
          
          return {
            careType,
            count: parseInt(result.count as string)
          };
        })
      );

      res.json(distribution);
    } catch (error) {
      console.error('Error fetching care type distribution:', error);
      res.status(500).json({ error: 'Failed to fetch care type distribution' });
    }
  });

  // User statistics
  app.get('/api/stats/users', async (req, res) => {
    try {
      const stats = await db
        .select({
          totalUsers: sql`COUNT(*)`,
          activeUsers: sql`COUNT(CASE WHEN ${users.isActive} = true THEN 1 END)`,
          verifiedUsers: sql`COUNT(CASE WHEN ${users.emailVerified} = true THEN 1 END)`,
          subscribedUsers: sql`COUNT(CASE WHEN ${users.stripeSubscriptionId} IS NOT NULL THEN 1 END)`,
          newUsersToday: sql`COUNT(CASE WHEN DATE(${users.createdAt}) = CURRENT_DATE THEN 1 END)`,
          newUsersThisWeek: sql`COUNT(CASE WHEN ${users.createdAt} >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END)`,
          newUsersThisMonth: sql`COUNT(CASE WHEN ${users.createdAt} >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END)`
        })
        .from(users);

      const roleDistribution = await db
        .select({
          role: users.role,
          count: sql`COUNT(*)`
        })
        .from(users)
        .groupBy(users.role);

      res.json({
        ...stats[0],
        roleDistribution
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
      res.status(500).json({ error: 'Failed to fetch user statistics' });
    }
  });

  // Tour statistics
  app.get('/api/stats/tours', async (req, res) => {
    try {
      const tourStats = await db
        .select({
          totalTours: sql`COUNT(*)`,
          scheduledTours: sql`COUNT(CASE WHEN ${tours.status} = 'scheduled' THEN 1 END)`,
          completedTours: sql`COUNT(CASE WHEN ${tours.status} = 'completed' THEN 1 END)`,
          cancelledTours: sql`COUNT(CASE WHEN ${tours.status} = 'cancelled' THEN 1 END)`,
          toursToday: sql`COUNT(CASE WHEN DATE(${tours.tourDate}) = CURRENT_DATE THEN 1 END)`,
          toursThisWeek: sql`COUNT(CASE WHEN ${tours.tourDate} >= CURRENT_DATE AND ${tours.tourDate} < CURRENT_DATE + INTERVAL '7 days' THEN 1 END)`,
          avgRating: sql`AVG(CASE WHEN ${tours.rating} IS NOT NULL THEN ${tours.rating} END)`
        })
        .from(tours);

      res.json(tourStats[0]);
    } catch (error) {
      console.error('Error fetching tour stats:', error);
      res.status(500).json({ error: 'Failed to fetch tour statistics' });
    }
  });

  // Review statistics
  app.get('/api/stats/reviews', async (req, res) => {
    try {
      const reviewStats = await db
        .select({
          totalReviews: sql`COUNT(*)`,
          avgRating: sql`AVG(${reviews.rating})`,
          verifiedReviews: sql`COUNT(CASE WHEN ${reviews.verified} = true THEN 1 END)`,
          reviewsThisWeek: sql`COUNT(CASE WHEN ${reviews.createdAt} >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END)`,
          reviewsThisMonth: sql`COUNT(CASE WHEN ${reviews.createdAt} >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END)`
        })
        .from(reviews);

      const sourceDistribution = await db
        .select({
          source: reviews.source,
          count: sql`COUNT(*)`
        })
        .from(reviews)
        .groupBy(reviews.source);

      res.json({
        ...reviewStats[0],
        sourceDistribution
      });
    } catch (error) {
      console.error('Error fetching review stats:', error);
      res.status(500).json({ error: 'Failed to fetch review statistics' });
    }
  });

  // Vendor statistics
  app.get('/api/stats/vendors', async (req, res) => {
    try {
      const vendorStats = await db
        .select({
          totalVendors: sql`COUNT(*)`,
          activeVendors: sql`COUNT(CASE WHEN ${vendors.isActive} = true THEN 1 END)`,
          verifiedVendors: sql`COUNT(CASE WHEN ${vendors.isVerified} = true THEN 1 END)`,
          avgRating: sql`AVG(CASE WHEN ${vendors.rating} > 0 THEN ${vendors.rating} END)`,
          vendorsWithServices: sql`COUNT(CASE WHEN ${vendors.serviceCount} > 0 THEN 1 END)`
        })
        .from(vendors);

      res.json(vendorStats[0]);
    } catch (error) {
      console.error('Error fetching vendor stats:', error);
      res.status(500).json({ error: 'Failed to fetch vendor statistics' });
    }
  });

  // Activity statistics
  app.get('/api/stats/activity', async (req, res) => {
    try {
      const { days = 7 } = req.query;
      
      const activityStats = await db
        .select({
          action: userActivity.action,
          count: sql`COUNT(*)`,
          date: sql`DATE(${userActivity.createdAt})`
        })
        .from(userActivity)
        .where(sql`${userActivity.createdAt} >= CURRENT_DATE - INTERVAL '${days} days'`)
        .groupBy(userActivity.action, sql`DATE(${userActivity.createdAt})`)
        .orderBy(sql`DATE(${userActivity.createdAt}) DESC`);

      res.json(activityStats);
    } catch (error) {
      console.error('Error fetching activity stats:', error);
      res.status(500).json({ error: 'Failed to fetch activity statistics' });
    }
  });

  // Growth metrics
  app.get('/api/stats/growth', async (req, res) => {
    try {
      const { period = 'month' } = req.query;
      
      let interval;
      switch (period) {
        case 'week':
          interval = '7 days';
          break;
        case 'month':
          interval = '30 days';
          break;
        case 'quarter':
          interval = '90 days';
          break;
        case 'year':
          interval = '365 days';
          break;
        default:
          interval = '30 days';
      }

      const growthMetrics = {
        users: await getGrowthRate(users, 'createdAt', interval),
        communities: await getGrowthRate(communities, 'createdAt', interval),
        reviews: await getGrowthRate(reviews, 'createdAt', interval),
        tours: await getGrowthRate(tours, 'createdAt', interval)
      };

      res.json(growthMetrics);
    } catch (error) {
      console.error('Error fetching growth metrics:', error);
      res.status(500).json({ error: 'Failed to fetch growth metrics' });
    }
  });

  // Regional statistics
  app.get('/api/stats/regional/:state', async (req, res) => {
    try {
      const { state } = req.params;
      
      const regionalStats = await db
        .select({
          totalCommunities: sql`COUNT(*)`,
          avgRating: sql`AVG(CAST(${communities.rating} AS FLOAT))`,
          totalHUD: sql`COUNT(CASE WHEN ${communities.hudPropertyId} IS NOT NULL THEN 1 END)`,
          citiesCount: sql`COUNT(DISTINCT ${communities.city})`,
          avgPriceMin: sql`AVG(${communities.priceMin})`,
          avgPriceMax: sql`AVG(${communities.priceMax})`
        })
        .from(communities)
        .where(sql`${communities.state} = ${state}`);

      const cityDistribution = await db
        .select({
          city: communities.city,
          count: sql`COUNT(*)`
        })
        .from(communities)
        .where(sql`${communities.state} = ${state}`)
        .groupBy(communities.city)
        .orderBy(sql`COUNT(*) DESC`)
        .limit(10);

      res.json({
        state,
        ...regionalStats[0],
        topCities: cityDistribution
      });
    } catch (error) {
      console.error('Error fetching regional stats:', error);
      res.status(500).json({ error: 'Failed to fetch regional statistics' });
    }
  });
}

// Helper function to calculate growth rate
async function getGrowthRate(table: any, dateColumn: string, interval: string) {
  const current = await db
    .select({ count: sql`COUNT(*)` })
    .from(table)
    .where(sql`${table[dateColumn]} >= CURRENT_DATE - INTERVAL ${interval}`);

  const previous = await db
    .select({ count: sql`COUNT(*)` })
    .from(table)
    .where(sql`${table[dateColumn]} >= CURRENT_DATE - INTERVAL ${interval} * 2 
            AND ${table[dateColumn]} < CURRENT_DATE - INTERVAL ${interval}`);

  const currentCount = parseInt(current[0].count as string);
  const previousCount = parseInt(previous[0].count as string);
  
  const growthRate = previousCount > 0 
    ? ((currentCount - previousCount) / previousCount) * 100 
    : 100;

  return {
    current: currentCount,
    previous: previousCount,
    growthRate: growthRate.toFixed(2)
  };
}
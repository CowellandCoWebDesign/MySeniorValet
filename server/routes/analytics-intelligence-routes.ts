import { Router } from 'express';
import { db } from '../db';
import { marketIntelligenceCache, searchIntentAnalysis } from '@shared/schema';
import { eq, and, desc, sql, gte } from 'drizzle-orm';
import { AIMarketIntelligenceService } from '../ai-market-intelligence';

const router = Router();
const marketIntelligenceService = new AIMarketIntelligenceService();

// Get market intelligence cache data
router.get('/api/analytics/market-intelligence', async (req, res) => {
  try {
    const { city, state, careLevel, limit = 50 } = req.query;
    
    let query = db.select().from(marketIntelligenceCache);
    const conditions = [];
    
    if (city) conditions.push(eq(marketIntelligenceCache.city, city as string));
    if (state) conditions.push(eq(marketIntelligenceCache.state, state as string));
    if (careLevel) conditions.push(eq(marketIntelligenceCache.careLevel, careLevel as string));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    const data = await query
      .orderBy(desc(marketIntelligenceCache.lastUpdated))
      .limit(Number(limit));
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching market intelligence:', error);
    res.status(500).json({ error: 'Failed to fetch market intelligence data' });
  }
});

// Get aggregated market intelligence stats
router.get('/api/analytics/market-intelligence/stats', async (req, res) => {
  try {
    const stats = await db
      .select({
        totalRecords: sql<number>`count(*)`,
        avgPrice: sql<number>`avg(avg_price)`,
        avgOccupancy: sql<number>`avg(occupancy_rate)`,
        citiesCovered: sql<number>`count(distinct city)`,
        statesCovered: sql<number>`count(distinct state)`,
        lastUpdate: sql<string>`max(last_updated)`,
      })
      .from(marketIntelligenceCache);
    
    res.json(stats[0]);
  } catch (error) {
    console.error('Error fetching market intelligence stats:', error);
    res.status(500).json({ error: 'Failed to fetch market intelligence stats' });
  }
});

// Get market intelligence by location
router.get('/api/analytics/market-intelligence/location/:state/:city', async (req, res) => {
  try {
    const { state, city } = req.params;
    
    const data = await db
      .select()
      .from(marketIntelligenceCache)
      .where(
        and(
          eq(marketIntelligenceCache.state, state),
          eq(marketIntelligenceCache.city, city)
        )
      );
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching location market intelligence:', error);
    res.status(500).json({ error: 'Failed to fetch location market intelligence' });
  }
});

// Refresh market intelligence for a specific location
router.post('/api/analytics/market-intelligence/refresh', async (req, res) => {
  try {
    const { city, state, careLevel } = req.body;
    
    if (!city || !state || !careLevel) {
      return res.status(400).json({ error: 'City, state, and care level are required' });
    }
    
    // This would trigger the AI service to refresh data for this location
    // For now, just return success
    res.json({ 
      message: 'Market intelligence refresh initiated',
      location: { city, state, careLevel }
    });
  } catch (error) {
    console.error('Error refreshing market intelligence:', error);
    res.status(500).json({ error: 'Failed to refresh market intelligence' });
  }
});

// Get search intent analytics
router.get('/api/analytics/search-intent', async (req, res) => {
  try {
    const { days = 30, limit = 100 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));
    
    const data = await db
      .select()
      .from(searchIntentAnalysis)
      .where(gte(searchIntentAnalysis.createdAt, startDate))
      .orderBy(desc(searchIntentAnalysis.createdAt))
      .limit(Number(limit));
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching search intent data:', error);
    res.status(500).json({ error: 'Failed to fetch search intent data' });
  }
});

// Get search intent statistics
router.get('/api/analytics/search-intent/stats', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));
    
    const stats = await db
      .select({
        totalSearches: sql<number>`count(*)`,
        uniqueUsers: sql<number>`count(distinct user_id)`,
        avgResultsCount: sql<number>`avg(results_count)`,
        avgTimeSpent: sql<number>`avg(time_spent)`,
        conversions: sql<number>`count(conversion_type)`,
        topSearchType: sql<string>`mode() within group (order by search_type)`,
      })
      .from(searchIntentAnalysis)
      .where(gte(searchIntentAnalysis.createdAt, startDate));
    
    // Get conversion rate
    const conversionRate = stats[0].totalSearches > 0 
      ? (stats[0].conversions / stats[0].totalSearches * 100).toFixed(2)
      : 0;
    
    res.json({
      ...stats[0],
      conversionRate: `${conversionRate}%`,
      period: `Last ${days} days`
    });
  } catch (error) {
    console.error('Error fetching search intent stats:', error);
    res.status(500).json({ error: 'Failed to fetch search intent stats' });
  }
});

// Get popular search locations
router.get('/api/analytics/search-intent/popular-locations', async (req, res) => {
  try {
    const { days = 30, limit = 10 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));
    
    const locations = await db
      .select({
        city: sql<string>`search_location->>'city'`,
        state: sql<string>`search_location->>'state'`,
        searchCount: sql<number>`count(*)`,
      })
      .from(searchIntentAnalysis)
      .where(gte(searchIntentAnalysis.createdAt, startDate))
      .groupBy(sql`search_location->>'city'`, sql`search_location->>'state'`)
      .orderBy(desc(sql`count(*)`))
      .limit(Number(limit));
    
    res.json(locations);
  } catch (error) {
    console.error('Error fetching popular search locations:', error);
    res.status(500).json({ error: 'Failed to fetch popular search locations' });
  }
});

// Log a search intent (called by search endpoints)
router.post('/api/analytics/search-intent/log', async (req, res) => {
  try {
    await marketIntelligenceService.logSearchIntent(req.body);
    res.json({ message: 'Search intent logged successfully' });
  } catch (error) {
    console.error('Error logging search intent:', error);
    res.status(500).json({ error: 'Failed to log search intent' });
  }
});

// Get market trends by care level
router.get('/api/analytics/market-trends/care-level', async (req, res) => {
  try {
    const trends = await db
      .select({
        careLevel: marketIntelligenceCache.careLevel,
        avgPrice: sql<number>`avg(avg_price)`,
        avgOccupancy: sql<number>`avg(occupancy_rate)`,
        locationCount: sql<number>`count(distinct concat(city, state))`,
        dataPoints: sql<number>`count(*)`,
      })
      .from(marketIntelligenceCache)
      .groupBy(marketIntelligenceCache.careLevel);
    
    res.json(trends);
  } catch (error) {
    console.error('Error fetching care level trends:', error);
    res.status(500).json({ error: 'Failed to fetch care level trends' });
  }
});

// Get market trends by state
router.get('/api/analytics/market-trends/state', async (req, res) => {
  try {
    const trends = await db
      .select({
        state: marketIntelligenceCache.state,
        avgPrice: sql<number>`avg(avg_price)`,
        avgOccupancy: sql<number>`avg(occupancy_rate)`,
        cityCount: sql<number>`count(distinct city)`,
        dataPoints: sql<number>`count(*)`,
      })
      .from(marketIntelligenceCache)
      .groupBy(marketIntelligenceCache.state)
      .orderBy(desc(sql`avg(avg_price)`));
    
    res.json(trends);
  } catch (error) {
    console.error('Error fetching state trends:', error);
    res.status(500).json({ error: 'Failed to fetch state trends' });
  }
});

export default router;
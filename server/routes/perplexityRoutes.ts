import { type Express } from "express";
import { db } from "../db";
import { communities } from "@shared/schema";
import { sql, and, or } from "drizzle-orm";
import { perplexityService } from "../perplexity-ai-service";

export function registerPerplexityRoutes(app: Express) {
  // Enhanced search with Perplexity real-time data
  app.post('/api/ai/enhanced-search', async (req, res) => {
    try {
      const { query, location } = req.body;
      
      if (!query) {
        return res.status(400).json({ error: 'Query is required' });
      }

      console.log(`🌐 Enhanced AI Search: "${query}" with Perplexity integration`);

      // First, search your database
      const dbConditions = [];
      if (location) {
        dbConditions.push(
          or(
            sql`LOWER(${communities.city}) LIKE LOWER(${'%' + location + '%'})`,
            sql`LOWER(${communities.state}) LIKE LOWER(${'%' + location + '%'})`
          )
        );
      }

      let dbQuery = db.select({
        id: communities.id,
        name: communities.name,
        city: communities.city,
        state: communities.state,
        phone: communities.phone,
        website: communities.website,
        priceRange: communities.priceRange,
        rentPerMonth: communities.rentPerMonth,
        hudPropertyId: communities.hudPropertyId
      }).from(communities);

      if (dbConditions.length > 0) {
        dbQuery = dbQuery.where(and(...dbConditions));
      }

      const dbResults = await dbQuery.limit(10);

      // Then enhance with Perplexity real-time data if configured
      let perplexityInsights = '';
      let sources: string[] = [];
      if (perplexityService.isConfigured()) {
        try {
          const enhancedQuery = `Current senior living costs and availability in ${location || 'the area'} for ${query}. Include 2024-2025 pricing data and recent market trends. Avoid aggregator sites.`;
          const result = await perplexityService.searchRealTime(enhancedQuery);
          perplexityInsights = result.summary;
          sources = result.sources;
        } catch (error: any) {
          console.log('Perplexity search failed, using database only:', error.message);
        }
      }

      res.json({
        communities: dbResults,
        databaseResults: dbResults.length,
        perplexityInsights: perplexityInsights || 'Real-time web search not available',
        sources: sources,
        searchQuery: query,
        location: location,
        enhanced: !!perplexityInsights,
        _version: "enhanced_v1"
      });

    } catch (error) {
      console.error('Enhanced search error:', error);
      res.status(500).json({ error: 'Enhanced search failed' });
    }
  });

  // Community enhancement with real-time data
  app.post('/api/ai/enhance-community/:id', async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      
      const [community] = await db
        .select()
        .from(communities)
        .where(sql`${communities.id} = ${communityId}`)
        .limit(1);

      if (!community) {
        return res.status(404).json({ error: 'Community not found' });
      }

      // Get enhanced data from Perplexity
      let enhancement = {};
      if (perplexityService.isConfigured()) {
        try {
          enhancement = await perplexityService.enhanceCommunityData(
            community.name, 
            `${community.city}, ${community.state}`
          );
        } catch (error: any) {
          console.log('Community enhancement failed:', error.message);
        }
      }

      res.json({
        community: {
          id: community.id,
          name: community.name,
          location: `${community.city}, ${community.state}`,
          phone: community.phone,
          website: community.website,
          databasePrice: community.rentPerMonth 
            ? `HUD Verified: $${community.rentPerMonth}/month`
            : community.priceRange 
              ? `$${(community.priceRange as any)?.min || 'Call'} - $${(community.priceRange as any)?.max || 'Call'}/month`
              : 'Contact for pricing'
        },
        enhancement: enhancement,
        enhanced: Object.keys(enhancement).length > 0,
        _version: "community_enhanced_v1"
      });

    } catch (error) {
      console.error('Community enhancement error:', error);
      res.status(500).json({ error: 'Failed to enhance community data' });
    }
  });

  // Real-time market analysis
  app.post('/api/ai/market-analysis', async (req, res) => {
    try {
      const { location, careType } = req.body;
      
      if (!location) {
        return res.status(400).json({ error: 'Location is required' });
      }

      console.log(`📊 Market Analysis for: ${location}`);

      // Get database statistics
      const stats = await db
        .select({
          count: sql<number>`count(*)`,
          avgRent: sql<number>`avg(${communities.rentPerMonth})`,
          minRent: sql<number>`min(${communities.rentPerMonth})`,
          maxRent: sql<number>`max(${communities.rentPerMonth})`
        })
        .from(communities)
        .where(
          or(
            sql`LOWER(${communities.city}) LIKE LOWER(${'%' + location + '%'})`,
            sql`LOWER(${communities.state}) LIKE LOWER(${'%' + location + '%'})`
          )
        );

      // Get real-time market data
      let marketInsights = '';
      let sources: string[] = [];
      if (perplexityService.isConfigured()) {
        try {
          const marketQuery = `Senior living market analysis for ${location} in 2024-2025. Include average costs, market trends, new construction, and occupancy rates. Focus on authentic community data, not aggregator sites.`;
          const result = await perplexityService.searchRealTime(marketQuery);
          marketInsights = result.summary;
          sources = result.sources;
        } catch (error: any) {
          console.log('Market analysis failed:', error.message);
        }
      }

      res.json({
        location: location,
        databaseStats: {
          totalCommunities: stats[0]?.count || 0,
          averageRent: stats[0]?.avgRent ? Math.round(stats[0].avgRent) : null,
          rentRange: {
            min: stats[0]?.minRent || null,
            max: stats[0]?.maxRent || null
          }
        },
        marketInsights: marketInsights || 'Real-time market data not available',
        sources: sources,
        enhanced: !!marketInsights,
        _version: "market_analysis_v1"
      });

    } catch (error) {
      console.error('Market analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze market' });
    }
  });
}
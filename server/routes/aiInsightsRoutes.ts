import { type Express } from "express";
import { db } from "../db";
import { communities } from "@shared/schema";
import { sql, and, isNotNull, or, eq } from "drizzle-orm";
import { AISearchInsights } from "../ai-search-insights";
import { eliminateCallForPricing } from "../intelligent-pricing-system";
import { cache } from "../cache";

export function registerAIInsightsRoutes(app: Express) {
  /**
   * Get AI-powered insights for communities in current map view
   */
  app.post("/api/ai/search-insights", async (req, res) => {
    try {
      const { bounds, communityIds, searchQuery } = req.body;
      
      // Cache key for insights
      const cacheKey = `ai-insights:${JSON.stringify({ bounds, communityIds, searchQuery })}`;
      const cached = await cache.get(cacheKey);
      if (cached) {
        return res.json(cached);
      }
      
      let communitiesToAnalyze = [];
      
      // If specific community IDs provided, use those
      if (communityIds && communityIds.length > 0) {
        const results = await db
          .select()
          .from(communities)
          .where(sql`${communities.id} = ANY(${communityIds})`);
          
        communitiesToAnalyze = results.map(c => eliminateCallForPricing(c));
      }
      // If bounds provided, get communities in bounds
      else if (bounds) {
        const { west, south, east, north } = bounds;
        
        const results = await db
          .select()
          .from(communities)
          .where(
            and(
              sql`${communities.longitude}::numeric BETWEEN ${west} AND ${east}`,
              sql`${communities.latitude}::numeric BETWEEN ${south} AND ${north}`,
              isNotNull(communities.latitude),
              isNotNull(communities.longitude)
            )
          )
          .limit(100); // Limit to prevent overload
          
        communitiesToAnalyze = results.map(c => eliminateCallForPricing(c));
      }
      // If search query provided, use search results
      else if (searchQuery) {
        const searchTerm = `%${searchQuery}%`;
        const results = await db
          .select()
          .from(communities)
          .where(
            or(
              sql`${communities.name} ILIKE ${searchTerm}`,
              sql`${communities.city} ILIKE ${searchTerm}`,
              sql`${communities.state} ILIKE ${searchTerm}`
            )
          )
          .limit(50);
          
        communitiesToAnalyze = results.map(c => eliminateCallForPricing(c));
      }
      
      if (communitiesToAnalyze.length === 0) {
        return res.json({
          insights: null,
          message: 'No communities found in the specified area'
        });
      }
      
      // Generate AI insights
      console.log(`Generating AI insights for ${communitiesToAnalyze.length} communities...`);
      const insights = await AISearchInsights.generateViewInsights(communitiesToAnalyze);
      
      const response = {
        insights,
        communityCount: communitiesToAnalyze.length,
        searchContext: {
          bounds,
          searchQuery,
          timestamp: new Date().toISOString()
        }
      };
      
      // Cache for 10 minutes
      await cache.set(cacheKey, response, 600);
      
      res.json(response);
      
    } catch (error) {
      console.error('Error generating AI insights:', error);
      res.status(500).json({ 
        error: 'Failed to generate AI insights',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  /**
   * Get quick AI summary for a specific community
   */
  app.get("/api/ai/community-summary/:id", async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      
      const [community] = await db
        .select()
        .from(communities)
        .where(eq(communities.id, communityId))
        .limit(1);
        
      if (!community) {
        return res.status(404).json({ error: 'Community not found' });
      }
      
      const enrichedCommunity = eliminateCallForPricing(community);
      
      // Generate a quick AI summary
      const summary = {
        strengths: [],
        considerations: [],
        priceContext: '',
        recommendation: ''
      };
      
      // Analyze strengths
      const rating = parseFloat(community.rating || '0');
      if (rating >= 4.5) {
        summary.strengths.push('Exceptional resident satisfaction');
      } else if (rating >= 4.0) {
        summary.strengths.push('Strong community ratings');
      }
      
      if (community.hudPropertyId) {
        summary.strengths.push('Government-subsidized housing available');
      }
      
      if (community.photos && community.photos.length > 10) {
        summary.strengths.push('Extensively documented facilities');
      }
      
      // Analyze considerations
      if (rating > 0 && rating < 3.5) {
        summary.considerations.push('Mixed resident reviews');
      }
      
      if (!community.website) {
        summary.considerations.push('Limited online presence');
      }
      
      // Price context
      const priceRange = enrichedCommunity.displayPricing?.priceRange;
      if (priceRange) {
        const avgPrice = (priceRange.min + priceRange.max) / 2;
        if (avgPrice < 3000) {
          summary.priceContext = 'Budget-friendly option in the area';
        } else if (avgPrice > 7000) {
          summary.priceContext = 'Premium community with luxury amenities';
        } else {
          summary.priceContext = 'Mid-range pricing for the market';
        }
      }
      
      // Overall recommendation
      if (rating >= 4.0 && priceRange && priceRange.min < 5000) {
        summary.recommendation = 'Excellent value - high ratings at reasonable price';
      } else if (rating >= 4.5) {
        summary.recommendation = 'Top-rated community worth considering';
      } else if (community.hudPropertyId) {
        summary.recommendation = 'Affordable option for qualified seniors';
      } else {
        summary.recommendation = 'Compare with other options in the area';
      }
      
      res.json({
        communityId,
        name: community.name,
        summary,
        generatedAt: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error generating community summary:', error);
      res.status(500).json({ error: 'Failed to generate community summary' });
    }
  });
}
import { type Express } from "express";
import { db } from "../db";
import { communities } from "@shared/schema";
import { eq } from "drizzle-orm";
import { isAuthenticated as requireAuth, isAdmin } from "../replitAuth";
import { intelligentPricingService } from "../intelligent-pricing-service";
import { nationwidePricingResearch } from "../nationwide-pricing-research";
import { pricingTransparencyService } from "../pricing-transparency-badges";

export function registerPricingRoutes(app: Express) {
  // Get pricing for a community
  app.get('/api/pricing/community/:communityId', async (req, res) => {
    try {
      const communityId = parseInt(req.params.communityId);
      
      const [community] = await db
        .select()
        .from(communities)
        .where(eq(communities.id, communityId))
        .limit(1);

      if (!community) {
        return res.status(404).json({ error: 'Community not found' });
      }

      // Get intelligent pricing if no HUD pricing
      let pricing;
      if (community.hudPropertyId && community.rentPerMonth) {
        pricing = {
          type: 'hud',
          monthly: parseFloat(community.rentPerMonth),
          source: 'HUD',
          verified: true,
          lastUpdated: community.updatedAt
        };
      } else if (community.claimedBy && community.pricingType === 'live') {
        pricing = {
          type: 'claimed',
          priceRange: community.priceRange,
          source: 'Community Owner',
          verified: true,
          lastUpdated: community.pricingLastUpdated
        };
      } else {
        // Use intelligent pricing service
        const intelligentPricing = await intelligentPricingService.getPricing(community);
        pricing = {
          type: 'estimated',
          priceRange: intelligentPricing.priceRange,
          source: intelligentPricing.source,
          verified: false,
          confidence: intelligentPricing.confidence,
          lastUpdated: new Date()
        };
      }

      res.json({ pricing });
    } catch (error) {
      console.error('Error fetching pricing:', error);
      res.status(500).json({ error: 'Failed to fetch pricing' });
    }
  });

  // Get pricing transparency badge
  app.get('/api/pricing/transparency/:communityId', async (req, res) => {
    try {
      const communityId = parseInt(req.params.communityId);
      
      const [community] = await db
        .select()
        .from(communities)
        .where(eq(communities.id, communityId))
        .limit(1);

      if (!community) {
        return res.status(404).json({ error: 'Community not found' });
      }

      const badge = await pricingTransparencyService.getBadge(community);
      res.json(badge);
    } catch (error) {
      console.error('Error fetching transparency badge:', error);
      res.status(500).json({ error: 'Failed to fetch transparency badge' });
    }
  });

  // Research pricing for a location
  app.get('/api/pricing/research', async (req, res) => {
    try {
      const { city, state, careType } = req.query;
      
      if (!city || !state) {
        return res.status(400).json({ error: 'City and state are required' });
      }

      const research = await nationwidePricingResearch.researchLocation({
        city: city as string,
        state: state as string,
        careType: careType as string
      });

      res.json(research);
    } catch (error) {
      console.error('Error researching pricing:', error);
      res.status(500).json({ error: 'Failed to research pricing' });
    }
  });

  // Update community pricing (admin only)
  app.patch('/api/pricing/community/:communityId', requireAuth, isAdmin, async (req, res) => {
    try {
      const communityId = parseInt(req.params.communityId);
      const { priceRange, pricingType, source } = req.body;

      const [updated] = await db
        .update(communities)
        .set({
          priceRange,
          pricingType,
          pricingSource: source,
          pricingLastUpdated: new Date(),
          updatedAt: new Date()
        })
        .where(eq(communities.id, communityId))
        .returning();

      if (!updated) {
        return res.status(404).json({ error: 'Community not found' });
      }

      res.json(updated);
    } catch (error) {
      console.error('Error updating pricing:', error);
      res.status(500).json({ error: 'Failed to update pricing' });
    }
  });

  // Batch update pricing (admin only)
  app.post('/api/pricing/batch-update', requireAuth, isAdmin, async (req, res) => {
    try {
      const { communities: communityUpdates } = req.body;
      
      if (!Array.isArray(communityUpdates)) {
        return res.status(400).json({ error: 'Communities array is required' });
      }

      const results = {
        successful: 0,
        failed: 0,
        errors: [] as any[]
      };

      for (const update of communityUpdates) {
        try {
          await db
            .update(communities)
            .set({
              priceRange: update.priceRange,
              pricingType: update.pricingType,
              pricingSource: update.source,
              pricingLastUpdated: new Date(),
              updatedAt: new Date()
            })
            .where(eq(communities.id, update.id));
          
          results.successful++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            id: update.id,
            error: error.message
          });
        }
      }

      res.json(results);
    } catch (error) {
      console.error('Error batch updating pricing:', error);
      res.status(500).json({ error: 'Failed to batch update pricing' });
    }
  });

  // Get pricing statistics
  app.get('/api/pricing/stats', async (req, res) => {
    try {
      const { state, careType } = req.query;
      
      let conditions = [];
      
      if (state) {
        conditions.push(eq(communities.state, state as string));
      }
      
      if (careType) {
        conditions.push(sql`${careType} = ANY(${communities.careTypes})`);
      }

      const stats = await db
        .select({
          totalWithPricing: sql`COUNT(CASE WHEN ${communities.priceRange} IS NOT NULL THEN 1 END)`,
          totalHUD: sql`COUNT(CASE WHEN ${communities.hudPropertyId} IS NOT NULL THEN 1 END)`,
          totalClaimed: sql`COUNT(CASE WHEN ${communities.claimedBy} IS NOT NULL AND ${communities.pricingType} = 'live' THEN 1 END)`,
          avgMinPrice: sql`AVG(CASE WHEN ${communities.priceMin} > 0 THEN ${communities.priceMin} END)`,
          avgMaxPrice: sql`AVG(CASE WHEN ${communities.priceMax} > 0 THEN ${communities.priceMax} END)`,
          lowestHUD: sql`MIN(CAST(${communities.rentPerMonth} AS DECIMAL))`,
          highestHUD: sql`MAX(CAST(${communities.rentPerMonth} AS DECIMAL))`
        })
        .from(communities)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      res.json(stats[0]);
    } catch (error) {
      console.error('Error fetching pricing stats:', error);
      res.status(500).json({ error: 'Failed to fetch pricing statistics' });
    }
  });

  // Price comparison tool
  app.post('/api/pricing/compare', async (req, res) => {
    try {
      const { communityIds } = req.body;
      
      if (!Array.isArray(communityIds) || communityIds.length < 2) {
        return res.status(400).json({ error: 'At least 2 community IDs required' });
      }

      const communitiesData = await db
        .select()
        .from(communities)
        .where(sql`${communities.id} IN (${sql.join(communityIds.map(id => sql`${id}`), sql`, `)})`);

      const comparison = communitiesData.map(community => ({
        id: community.id,
        name: community.name,
        location: `${community.city}, ${community.state}`,
        pricing: {
          type: community.hudPropertyId ? 'HUD' : community.claimedBy ? 'Claimed' : 'Estimated',
          monthly: community.rentPerMonth ? parseFloat(community.rentPerMonth) : null,
          priceRange: community.priceRange,
          priceMin: community.priceMin,
          priceMax: community.priceMax
        },
        careTypes: community.careTypes,
        rating: community.rating
      }));

      res.json({ comparison });
    } catch (error) {
      console.error('Error comparing pricing:', error);
      res.status(500).json({ error: 'Failed to compare pricing' });
    }
  });
}
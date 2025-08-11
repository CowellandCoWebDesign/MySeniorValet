import { Router } from 'express';
import { db } from '../db';
import { pricingHistory, priceChangeAlerts, communities } from '@shared/schema';
import { eq, desc, and, isNull, gte, lte } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

// Get pricing history for a community
router.get('/communities/:id/pricing-history', async (req, res) => {
  try {
    const communityId = parseInt(req.params.id);
    
    const history = await db
      .select()
      .from(pricingHistory)
      .where(eq(pricingHistory.communityId, communityId))
      .orderBy(desc(pricingHistory.effectiveDate));
    
    res.json({
      success: true,
      data: history,
      count: history.length
    });
  } catch (error) {
    console.error('Error fetching pricing history:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch pricing history' 
    });
  }
});

// Add new pricing record (for verified community owners)
const addPricingSchema = z.object({
  priceType: z.enum(['base', 'assisted_living', 'memory_care', 'independent_living', 'skilled_nursing']),
  priceAmount: z.number().optional(),
  priceMin: z.number().optional(),
  priceMax: z.number().optional(),
  effectiveDate: z.string().optional(),
  notes: z.string().optional(),
  source: z.string().default('community_reported')
});

router.post('/communities/:id/pricing', async (req, res) => {
  try {
    const communityId = parseInt(req.params.id);
    const validatedData = addPricingSchema.parse(req.body);
    
    // TODO: Check if user is authorized to update this community's pricing
    // This would check claimedCommunities table
    
    // End previous pricing record if exists
    const currentPricing = await db
      .select()
      .from(pricingHistory)
      .where(
        and(
          eq(pricingHistory.communityId, communityId),
          eq(pricingHistory.priceType, validatedData.priceType),
          isNull(pricingHistory.endDate)
        )
      )
      .limit(1);
    
    if (currentPricing.length > 0) {
      await db
        .update(pricingHistory)
        .set({ endDate: new Date().toISOString().split('T')[0] })
        .where(eq(pricingHistory.id, currentPricing[0].id));
    }
    
    // Insert new pricing record
    const [newPricing] = await db
      .insert(pricingHistory)
      .values({
        communityId,
        ...validatedData,
        effectiveDate: validatedData.effectiveDate || new Date().toISOString().split('T')[0],
        verificationStatus: 'verified',
        verifiedBy: 'community_owner', // TODO: Use actual user ID
        verifiedAt: new Date()
      })
      .returning();
    
    // Check for significant price changes and create alerts
    if (currentPricing.length > 0 && validatedData.priceAmount) {
      const oldPrice = currentPricing[0].priceAmount;
      if (oldPrice) {
        const changeAmount = Number(validatedData.priceAmount) - Number(oldPrice);
        const changePercentage = (changeAmount / Number(oldPrice)) * 100;
        
        if (Math.abs(changePercentage) > 5) { // Alert if > 5% change
          await db.insert(priceChangeAlerts).values({
            communityId,
            priceType: validatedData.priceType,
            oldPrice: oldPrice.toString(),
            newPrice: validatedData.priceAmount.toString(),
            changeAmount: changeAmount.toString(),
            changePercentage: changePercentage.toFixed(2),
            alertType: changeAmount > 0 ? 'price_increase' : 'price_drop'
          });
        }
      }
    }
    
    res.json({
      success: true,
      data: newPricing,
      message: 'Pricing updated successfully'
    });
  } catch (error) {
    console.error('Error updating pricing:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update pricing' 
    });
  }
});

// Get pricing trends for a community
router.get('/communities/:id/pricing-trends', async (req, res) => {
  try {
    const communityId = parseInt(req.params.id);
    const { priceType = 'base', months = 12 } = req.query;
    
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - Number(months));
    
    const trends = await db
      .select()
      .from(pricingHistory)
      .where(
        and(
          eq(pricingHistory.communityId, communityId),
          eq(pricingHistory.priceType, priceType as string),
          gte(pricingHistory.effectiveDate, startDate.toISOString().split('T')[0])
        )
      )
      .orderBy(pricingHistory.effectiveDate);
    
    res.json({
      success: true,
      data: {
        communityId,
        priceType,
        period: `${months} months`,
        trends
      }
    });
  } catch (error) {
    console.error('Error fetching pricing trends:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch pricing trends' 
    });
  }
});

// Subscribe to price alerts for a community
router.post('/pricing/alerts/subscribe', async (req, res) => {
  try {
    const { communityId, userId } = req.body;
    
    // TODO: Implement subscription logic
    // This would add user to a notification list for price changes
    
    res.json({
      success: true,
      message: 'Successfully subscribed to price alerts'
    });
  } catch (error) {
    console.error('Error subscribing to alerts:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to subscribe to alerts' 
    });
  }
});

// Get recent price changes across all communities
router.get('/pricing/recent-changes', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - Number(days));
    
    const recentChanges = await db
      .select({
        alert: priceChangeAlerts,
        community: {
          id: communities.id,
          name: communities.name,
          city: communities.city,
          state: communities.state
        }
      })
      .from(priceChangeAlerts)
      .innerJoin(communities, eq(priceChangeAlerts.communityId, communities.id))
      .where(gte(priceChangeAlerts.createdAt, cutoffDate))
      .orderBy(desc(priceChangeAlerts.createdAt))
      .limit(50);
    
    res.json({
      success: true,
      data: recentChanges,
      period: `${days} days`
    });
  } catch (error) {
    console.error('Error fetching recent price changes:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch recent price changes' 
    });
  }
});

export default router;
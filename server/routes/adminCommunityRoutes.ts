import { Router } from 'express';
import { db } from '../db';
import { communities, users, listingFlags } from '../../shared/schema';
import { eq, like, and, or, sql, desc, asc, ne } from 'drizzle-orm';
import cookieParser from 'cookie-parser';
import { DataIntegrityValidator } from '../services/data-integrity-validator';
// ScheduledAuditService removed - was causing deployment issues
import { batchVerifier } from '../services/batch-perplexity-verifier';
import { cityBatchVerifier } from '../services/city-batch-verifier';

const router = Router();

// Ensure cookie parser is available
router.use(cookieParser());

// Test endpoint (no auth required for testing)
router.get('/admin/test', (req, res) => {
  res.json({ 
    message: 'Admin routes are accessible',
    cookies: req.cookies,
    headers: req.headers,
    env: process.env.NODE_ENV
  });
});

// Middleware to check admin access — uses the same express-session auth as the rest of the app
const requireAdmin = async (req: any, res: any, next: any) => {
  const user = (req.session as any)?.user;

  if (user && (user.role === 'admin' || user.role === 'super_admin')) {
    req.adminUser = { id: user.id, email: user.email, role: user.role };
    return next();
  }

  return res.status(403).json({ message: 'Admin access required' });
};

// Get all communities with filters and pagination
router.get('/admin/communities', requireAdmin, async (req, res) => {
  try {
    const {
      page = '1',
      limit = '20',
      search = '',
      state = 'all',
      type = 'all',
      verification = 'all'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    let conditions = [];

    // Search filter
    if (search) {
      conditions.push(
        or(
          like(communities.name, `%${search}%`),
          like(communities.city, `%${search}%`),
          eq(communities.id, isNaN(Number(search)) ? -1 : Number(search))
        )
      );
    }

    // State filter
    if (state !== 'all') {
      conditions.push(eq(communities.state, state));
    }

    // Type filter (care_types is an array column — use @> array-contains operator)
    if (type !== 'all') {
      conditions.push(sql`${communities.careTypes} @> ARRAY[${type}]::text[]`);
    }

    // Verification filter
    if (verification === 'verified') {
      conditions.push(eq(communities.isVerified, true));
    } else if (verification === 'unverified') {
      conditions.push(eq(communities.isVerified, false));
    }

    // Build where clause
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get communities with pagination
    const communitiesQuery = db.select()
      .from(communities)
      .where(whereClause)
      .limit(limitNum)
      .offset(offset);

    const countQuery = db.select({ count: sql<number>`count(*)` })
      .from(communities)
      .where(whereClause);

    const [communitiesData, totalCount] = await Promise.all([
      communitiesQuery,
      countQuery
    ]);

    res.json({
      communities: communitiesData,
      total: totalCount[0]?.count || 0,
      page: pageNum,
      totalPages: Math.ceil((totalCount[0]?.count || 0) / limitNum)
    });
  } catch (error) {
    console.error('Error fetching admin communities:', error);
    res.status(500).json({ message: 'Failed to fetch communities' });
  }
});

// Get community statistics — uses aggregate SQL (no full table scan)
router.get('/admin/communities/stats', requireAdmin, async (req, res) => {
  try {
    const [[totalRow], [verifiedRow], [withPhotosRow], [withPricingRow], [hiddenRow], [flaggedRow], topStatesRows] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(communities),
      db.select({ count: sql<number>`count(*)` }).from(communities).where(eq(communities.isVerified, true)),
      db.select({ count: sql<number>`count(*)` }).from(communities).where(sql`array_length(${communities.photos}, 1) > 0`),
      db.select({ count: sql<number>`count(*)` }).from(communities).where(sql`${communities.rentPerMonth} IS NOT NULL`),
      db.select({ count: sql<number>`count(*)` }).from(communities).where(eq(communities.isHidden, true)),
      db.select({ count: sql<number>`count(*)` }).from(communities).where(sql`${communities.flagStatus} IS NOT NULL`),
      db.select({
        state: communities.state,
        count: sql<number>`count(*)`
      }).from(communities).groupBy(communities.state).orderBy(sql`count(*) DESC`).limit(5),
    ]);

    res.json({
      total: Number(totalRow.count),
      verified: Number(verifiedRow.count),
      withPhotos: Number(withPhotosRow.count),
      withPricing: Number(withPricingRow.count),
      hidden: Number(hiddenRow.count),
      flagged: Number(flaggedRow.count),
      topStates: topStatesRows.map(r => ({ state: r.state, count: Number(r.count) })),
      featured: 0,
      platinum: 0,
      standard: 0,
      premium: 0,
    });
  } catch (error) {
    console.error('Error fetching community stats:', error);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
});

// Hide a community (reversible soft-hide)
router.post('/admin/communities/:id/hide', requireAdmin, async (req, res) => {
  try {
    const communityId = parseInt(req.params.id);
    const [updated] = await db.update(communities)
      .set({ isHidden: true, updatedAt: new Date() })
      .where(eq(communities.id, communityId))
      .returning({ id: communities.id, name: communities.name, isHidden: communities.isHidden });
    if (!updated) return res.status(404).json({ message: 'Community not found' });
    res.json({ message: 'Community hidden', community: updated });
  } catch (error) {
    console.error('Error hiding community:', error);
    res.status(500).json({ message: 'Failed to hide community' });
  }
});

// Unhide a community
router.post('/admin/communities/:id/unhide', requireAdmin, async (req, res) => {
  try {
    const communityId = parseInt(req.params.id);
    const [updated] = await db.update(communities)
      .set({ isHidden: false, updatedAt: new Date() })
      .where(eq(communities.id, communityId))
      .returning({ id: communities.id, name: communities.name, isHidden: communities.isHidden });
    if (!updated) return res.status(404).json({ message: 'Community not found' });
    res.json({ message: 'Community unhidden', community: updated });
  } catch (error) {
    console.error('Error unhiding community:', error);
    res.status(500).json({ message: 'Failed to unhide community' });
  }
});

// Get pending listing flags for admin moderation
router.get('/admin/listing-flags', requireAdmin, async (req, res) => {
  try {
    const { status = 'Pending', page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const [flags, [countRow]] = await Promise.all([
      db.select({
        id: listingFlags.id,
        communityId: listingFlags.communityId,
        communityName: communities.name,
        communityCity: communities.city,
        communityState: communities.state,
        flagType: listingFlags.flagType,
        reason: listingFlags.reason,
        details: listingFlags.details,
        status: listingFlags.status,
        reporterEmail: listingFlags.reporterEmail,
        reporterName: listingFlags.reporterName,
        createdAt: listingFlags.createdAt,
      })
        .from(listingFlags)
        .innerJoin(communities, eq(listingFlags.communityId, communities.id))
        .where(status === 'all' ? undefined : eq(listingFlags.status, status as string))
        .orderBy(desc(listingFlags.createdAt))
        .limit(limitNum)
        .offset(offset),
      db.select({ count: sql<number>`count(*)` })
        .from(listingFlags)
        .where(status === 'all' ? undefined : eq(listingFlags.status, status as string)),
    ]);

    res.json({ flags, total: Number(countRow.count), page: pageNum, totalPages: Math.ceil(Number(countRow.count) / limitNum) });
  } catch (error) {
    console.error('Error fetching listing flags:', error);
    res.status(500).json({ message: 'Failed to fetch listing flags' });
  }
});

// Dismiss a flag (no action on community)
router.post('/admin/listing-flags/:id/dismiss', requireAdmin, async (req, res) => {
  try {
    const flagId = parseInt(req.params.id);
    const [updated] = await db.update(listingFlags)
      .set({ status: 'Dismissed', reviewedAt: new Date(), updatedAt: new Date() })
      .where(eq(listingFlags.id, flagId))
      .returning({ id: listingFlags.id, communityId: listingFlags.communityId });
    if (!updated) return res.status(404).json({ message: 'Flag not found' });

    // Clear communities.flagStatus if no active (Pending) flags remain for this community
    const [remaining] = await db
      .select({ count: sql<number>`count(*)` })
      .from(listingFlags)
      .where(and(
        eq(listingFlags.communityId, updated.communityId),
        sql`${listingFlags.status} IN ('Pending', 'Under Review')`
      ));
    if (Number(remaining.count) === 0) {
      await db.update(communities)
        .set({ flagStatus: null } as any)
        .where(eq(communities.id, updated.communityId));
    }

    res.json({ message: 'Flag dismissed' });
  } catch (error) {
    console.error('Error dismissing flag:', error);
    res.status(500).json({ message: 'Failed to dismiss flag' });
  }
});

// Confirm a flag: mark flag Resolved + set community flagStatus = 'confirmed'
router.post('/admin/listing-flags/:id/confirm', requireAdmin, async (req, res) => {
  try {
    const flagId = parseInt(req.params.id);
    const { hideListingAlso = false } = req.body;

    const [flag] = await db.update(listingFlags)
      .set({ status: 'Resolved', reviewedAt: new Date(), updatedAt: new Date() })
      .where(eq(listingFlags.id, flagId))
      .returning({ id: listingFlags.id, communityId: listingFlags.communityId });

    if (!flag) return res.status(404).json({ message: 'Flag not found' });

    const communityUpdates: Record<string, any> = {
      flagStatus: 'confirmed',
      updatedAt: new Date(),
    };
    if (hideListingAlso) {
      communityUpdates.isHidden = true;
    }

    await db.update(communities).set(communityUpdates).where(eq(communities.id, flag.communityId));

    res.json({ message: hideListingAlso ? 'Flag confirmed and listing hidden' : 'Flag confirmed' });
  } catch (error) {
    console.error('Error confirming flag:', error);
    res.status(500).json({ message: 'Failed to confirm flag' });
  }
});

// Get single community by ID — admin bypass (no visibility filter, sees hidden/fake records)
router.get('/admin/communities/:id', requireAdmin, async (req, res) => {
  try {
    const communityId = parseInt(req.params.id);
    if (isNaN(communityId)) return res.status(400).json({ message: 'Invalid community ID' });

    const [community] = await db.select().from(communities).where(eq(communities.id, communityId));
    if (!community) return res.status(404).json({ message: 'Community not found' });

    res.json(community);
  } catch (error) {
    console.error('Error fetching community for admin:', error);
    res.status(500).json({ message: 'Failed to fetch community' });
  }
});

// Update community
router.put('/admin/communities/:id', requireAdmin, async (req, res) => {
  try {
    const communityId = parseInt(req.params.id);
    const updates = req.body;

    // Remove any fields that shouldn't be updated directly
    delete updates.id;
    delete updates.created_at;

    // Validate the community data for test patterns and integrity issues
    const validationResult = await DataIntegrityValidator.performFullValidation({
      id: communityId,
      name: updates.name || '',
      address: updates.address,
      city: updates.city,
      state: updates.state,
      phone: updates.phone,
      website: updates.website,
      description: updates.description
    });

    // If validation fails, return errors
    if (!validationResult.isValid) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationResult.errors,
        warnings: validationResult.warnings
      });
    }

    // Log warnings but still proceed with update
    if (validationResult.warnings.length > 0) {
      console.warn('Community update warnings:', validationResult.warnings);
    }

    // Sanitize the data before updating
    const sanitizedUpdates = DataIntegrityValidator.sanitizeCommunityData(updates);

    // Update the community
    const [updatedCommunity] = await db.update(communities)
      .set({
        ...sanitizedUpdates,
        updated_at: new Date()
      })
      .where(eq(communities.id, communityId))
      .returning();

    if (!updatedCommunity) {
      return res.status(404).json({ message: 'Community not found' });
    }

    res.json(updatedCommunity);
  } catch (error) {
    console.error('Error updating community:', error);
    res.status(500).json({ message: 'Failed to update community' });
  }
});

// Delete community
router.delete('/admin/communities/:id', requireAdmin, async (req, res) => {
  try {
    const communityId = parseInt(req.params.id);
    
    // Check if community exists
    const [existingCommunity] = await db.select()
      .from(communities)
      .where(eq(communities.id, communityId))
      .limit(1);
      
    if (!existingCommunity) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Delete the community
    await db.delete(communities)
      .where(eq(communities.id, communityId));

    res.json({ message: 'Community deleted successfully' });
  } catch (error) {
    console.error('Error deleting community:', error);
    res.status(500).json({ message: 'Failed to delete community' });
  }
});

// Verify community
router.post('/admin/communities/:id/verify', requireAdmin, async (req, res) => {
  try {
    const communityId = parseInt(req.params.id);

    const [updatedCommunity] = await db.update(communities)
      .set({
        is_verified: true,
        updated_at: new Date()
      })
      .where(eq(communities.id, communityId))
      .returning();

    if (!updatedCommunity) {
      return res.status(404).json({ message: 'Community not found' });
    }

    res.json(updatedCommunity);
  } catch (error) {
    console.error('Error verifying community:', error);
    res.status(500).json({ message: 'Failed to verify community' });
  }
});

// Audit endpoints removed - ScheduledAuditService was causing deployment issues
// These endpoints are temporarily disabled until a better solution is implemented

// Run batch Perplexity verification
router.post('/admin/verify/batch', requireAdmin, async (req, res) => {
  try {
    const { limit = 50 } = req.body;
    
    console.log(`🚀 Starting batch verification for ${limit} communities...`);
    
    // Start the verification process in the background
    batchVerifier.runVerificationProcess(limit).catch(error => {
      console.error('Batch verification failed:', error);
    });
    
    res.json({
      message: `Batch verification started for up to ${limit} communities`,
      status: 'processing',
      note: 'Check server logs for progress'
    });
  } catch (error) {
    console.error('Error starting batch verification:', error);
    res.status(500).json({ message: 'Failed to start batch verification' });
  }
});

// Get verification statistics
router.get('/admin/verify/stats', requireAdmin, async (req, res) => {
  try {
    const stats = await batchVerifier.getVerificationStats();
    
    res.json({
      total: stats.total,
      verified: stats.verified || 0,
      needsVerification: stats.needs_verification || 0,
      fake: stats.fake || 0,
      international: stats.international || 0,
      percentVerified: stats.total > 0 ? 
        Math.round((stats.verified || 0) / stats.total * 100) : 0
    });
  } catch (error) {
    console.error('Error fetching verification stats:', error);
    res.status(500).json({ message: 'Failed to fetch verification stats' });
  }
});

// City-based batch verification - MUCH MORE EFFICIENT!
router.post('/admin/verify/cities', requireAdmin, async (req, res) => {
  try {
    const { cities, limit = 100 } = req.body;
    
    let targetCities = cities;
    
    // If no cities provided, get top unverified cities
    if (!targetCities || targetCities.length === 0) {
      targetCities = await cityBatchVerifier.getTopUnverifiedCities(10);
      console.log(`🏙️ Auto-selected top ${targetCities.length} cities with unverified communities`);
    }
    
    console.log(`🚀 Starting city-based verification for ${targetCities.length} cities...`);
    
    // Start verification in background
    cityBatchVerifier.verifyCitiesBatch(targetCities, limit).catch(error => {
      console.error('City batch verification failed:', error);
    });
    
    res.json({
      message: `City-based verification started for ${targetCities.length} cities`,
      cities: targetCities,
      status: 'processing'
    });
  } catch (error) {
    console.error('Error starting city verification:', error);
    res.status(500).json({ message: 'Failed to start city verification' });
  }
});

// Get cities with most unverified communities
router.get('/admin/verify/top-cities', requireAdmin, async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const topCities = await cityBatchVerifier.getTopUnverifiedCities(Number(limit));
    
    res.json({
      cities: topCities,
      total: topCities.reduce((sum, c) => sum + c.count, 0)
    });
  } catch (error) {
    console.error('Error fetching top cities:', error);
    res.status(500).json({ message: 'Failed to fetch top cities' });
  }
});

export default router;
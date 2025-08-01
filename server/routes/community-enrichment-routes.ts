import { Router } from 'express';
import { db } from '../db';
import { communities, enrichments } from '@shared/schema';
import { eq, and, isNull, sql } from 'drizzle-orm';
import { communityEnrichmentService } from '../community-enrichment-service';
import { isAuthenticated, checkRole } from '../replitAuth';

const router = Router();

// Get enrichments for a community
router.get('/community/:communityId', async (req, res) => {
  try {
    const communityId = parseInt(req.params.communityId);
    
    const communityEnrichments = await db
      .select()
      .from(enrichments)
      .where(eq(enrichments.communityId, communityId))
      .orderBy(enrichments.createdAt);

    res.json(communityEnrichments);
  } catch (error) {
    console.error('Error fetching enrichments:', error);
    res.status(500).json({ error: 'Failed to fetch enrichments' });
  }
});

// Admin: Fix subtype tagging
router.post('/fix-subtypes', isAuthenticated, checkRole(['admin', 'super_admin']), async (req, res) => {
  try {
    // Run in background as this can take time
    communityEnrichmentService.fixSubtypeTagging()
      .then(() => console.log('Subtype tagging completed'))
      .catch(err => console.error('Subtype tagging error:', err));

    res.json({ 
      success: true, 
      message: 'Subtype tagging started in background' 
    });
  } catch (error) {
    console.error('Error starting subtype fix:', error);
    res.status(500).json({ error: 'Failed to start subtype tagging' });
  }
});

// Admin: Enrich a specific community
router.post('/enrich/:communityId', isAuthenticated, checkRole(['admin', 'super_admin']), async (req, res) => {
  try {
    const communityId = parseInt(req.params.communityId);
    const result = await communityEnrichmentService.enrichCommunity(communityId);

    if (!result) {
      return res.status(400).json({ error: 'Failed to enrich community' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error enriching community:', error);
    res.status(500).json({ error: 'Failed to enrich community' });
  }
});

// Admin: Batch enrich communities
router.post('/batch-enrich', isAuthenticated, checkRole(['admin', 'super_admin']), async (req, res) => {
  try {
    const { limit = 50 } = req.body;

    // Run in background
    communityEnrichmentService.batchEnrichCommunities(limit)
      .then(result => console.log('Batch enrichment completed:', result))
      .catch(err => console.error('Batch enrichment error:', err));

    res.json({ 
      success: true, 
      message: `Batch enrichment started for up to ${limit} communities` 
    });
  } catch (error) {
    console.error('Error starting batch enrichment:', error);
    res.status(500).json({ error: 'Failed to start batch enrichment' });
  }
});

// Get enrichment statistics
router.get('/stats', isAuthenticated, checkRole(['admin', 'super_admin']), async (req, res) => {
  try {
    const stats = await db.execute(sql`
      SELECT 
        COUNT(DISTINCT c.id) as total_communities,
        COUNT(DISTINCT e.community_id) as enriched_communities,
        COUNT(e.id) as total_enrichments,
        COUNT(CASE WHEN e.is_approved THEN 1 END) as approved_enrichments,
        COUNT(CASE WHEN c.community_subtype IS NOT NULL AND c.community_subtype != 'traditional_assisted_living' THEN 1 END) as tagged_subtypes
      FROM communities c
      LEFT JOIN enrichments e ON c.id = e.community_id
    `);

    res.json(stats.rows[0]);
  } catch (error) {
    console.error('Error fetching enrichment stats:', error);
    res.status(500).json({ error: 'Failed to fetch enrichment statistics' });
  }
});

// Approve an enrichment
router.post('/approve/:enrichmentId', isAuthenticated, checkRole(['admin', 'super_admin']), async (req, res) => {
  try {
    const enrichmentId = parseInt(req.params.enrichmentId);

    await db
      .update(enrichments)
      .set({
        isApproved: true,
        approvedBy: parseInt((req as any).user?.id || (req as any).user?.claims?.sub),
        approvedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(enrichments.id, enrichmentId));

    res.json({ success: true, message: 'Enrichment approved' });
  } catch (error) {
    console.error('Error approving enrichment:', error);
    res.status(500).json({ error: 'Failed to approve enrichment' });
  }
});

// Get communities needing enrichment
router.get('/needed', isAuthenticated, checkRole(['admin', 'super_admin']), async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const unenrichedCommunities = await db
      .select({
        id: communities.id,
        name: communities.name,
        city: communities.city,
        state: communities.state,
        careTypes: communities.careTypes,
        communitySubtype: communities.communitySubtype
      })
      .from(communities)
      .leftJoin(enrichments, eq(communities.id, enrichments.communityId))
      .where(isNull(enrichments.id))
      .limit(Number(limit));

    res.json(unenrichedCommunities);
  } catch (error) {
    console.error('Error fetching unenriched communities:', error);
    res.status(500).json({ error: 'Failed to fetch communities needing enrichment' });
  }
});

export default router;
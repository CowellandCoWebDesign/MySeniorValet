import { Router, Request, Response } from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';
import { communities } from '@shared/schema';

const router = Router();

// Get all Provincial-managed communities (Provincial + Solstice + Hilltop/Shasta)
router.get('/provincial-all', async (req: Request, res: Response) => {
  try {
    const allProvincialCommunities = await db.select()
      .from(communities)
      .where(sql`
        LOWER(${communities.name}) LIKE '%provincial%'
        OR LOWER(${communities.name}) LIKE '%solstice%'
        OR ${communities.name} = 'Hilltop Estates'
        OR ${communities.name} = 'Shasta Estates'
      `)
      .orderBy(communities.name);
    
    console.log(`Found ${allProvincialCommunities.length} Provincial-managed communities`);
    
    res.json({
      communities: allProvincialCommunities,
      total: allProvincialCommunities.length,
      success: true
    });
  } catch (error) {
    console.error('Error fetching Provincial communities:', error);
    res.status(500).json({
      error: 'Failed to fetch Provincial communities',
      communities: [],
      total: 0
    });
  }
});

export default router;
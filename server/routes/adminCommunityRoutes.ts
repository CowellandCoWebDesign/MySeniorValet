import { Router } from 'express';
import { db } from '../db';
import { communities, users } from '../../shared/schema';
import { eq, like, and, or, sql, desc, asc } from 'drizzle-orm';
import { isAuthenticated } from '../replitAuth';

const router = Router();

// Middleware to check admin access
const requireAdmin = async (req: any, res: any, next: any) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const userId = req.user.claims?.sub;
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const [user] = await db.select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
    
  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  req.adminUser = user;
  next();
};

// Get all communities with filters and pagination
router.get('/admin/communities', isAuthenticated, requireAdmin, async (req, res) => {
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

    // Type filter
    if (type !== 'all') {
      conditions.push(eq(communities.care_type, type));
    }

    // Verification filter
    if (verification === 'verified') {
      conditions.push(eq(communities.is_verified, true));
    } else if (verification === 'unverified') {
      conditions.push(eq(communities.is_verified, false));
    }

    // Build where clause
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get communities with pagination
    const [communitiesData, totalCount] = await Promise.all([
      db.select()
        .from(communities)
        .where(whereClause)
        .orderBy(desc(communities.updated_at))
        .limit(limitNum)
        .offset(offset),
      db.select({ count: sql<number>`count(*)` })
        .from(communities)
        .where(whereClause)
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

// Get community statistics
router.get('/admin/communities/stats', isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const [
      totalResult,
      verifiedResult,
      premiumResult,
      activeResult
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(communities),
      db.select({ count: sql<number>`count(*)` })
        .from(communities)
        .where(eq(communities.is_verified, true)),
      db.select({ count: sql<number>`count(*)` })
        .from(communities)
        .where(
          or(
            eq(communities.tier, 'featured'),
            eq(communities.tier, 'platinum'),
            eq(communities.tier, 'standard')
          )
        ),
      db.select({ count: sql<number>`count(*)` })
        .from(communities)
        .where(
          sql`${communities.updated_at} > NOW() - INTERVAL '30 days'`
        )
    ]);

    res.json({
      total: totalResult[0]?.count || 0,
      verified: verifiedResult[0]?.count || 0,
      premium: premiumResult[0]?.count || 0,
      activeThisMonth: activeResult[0]?.count || 0
    });
  } catch (error) {
    console.error('Error fetching community stats:', error);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
});

// Update community
router.put('/admin/communities/:id', isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const communityId = parseInt(req.params.id);
    const updates = req.body;

    // Remove any fields that shouldn't be updated directly
    delete updates.id;
    delete updates.created_at;

    // Update the community
    const [updatedCommunity] = await db.update(communities)
      .set({
        ...updates,
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
router.delete('/admin/communities/:id', isAuthenticated, requireAdmin, async (req, res) => {
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
router.post('/admin/communities/:id/verify', isAuthenticated, requireAdmin, async (req, res) => {
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

export default router;
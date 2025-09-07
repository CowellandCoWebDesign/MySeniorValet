import { Router } from 'express';
import { db } from '../db';
import { communities, users } from '../../shared/schema';
import { eq, like, and, or, sql, desc, asc } from 'drizzle-orm';
import cookieParser from 'cookie-parser';
import { DataIntegrityValidator } from '../services/data-integrity-validator';
import { ScheduledAuditService } from '../services/scheduled-audit-service';

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

// Middleware to check admin access
const requireAdmin = async (req: any, res: any, next: any) => {
  // Check for demo mode in development (no session required)
  const sessionId = req.cookies?.sessionId;
  
  if (!sessionId && process.env.NODE_ENV === 'development') {
    // Demo super admin user for testing
    req.adminUser = {
      id: 'test-user-123',
      email: 'William.cowell01@gmail.com',
      username: 'William Cowell',
      role: 'super_admin'
    };
    return next();
  }
  
  // Check for active session
  if (!sessionId || !global.activeSessions?.[sessionId]) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const session = global.activeSessions[sessionId];
  
  // Check if user has admin or super_admin role
  if (session.role !== 'admin' && session.role !== 'super_admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  req.adminUser = {
    id: session.userId,
    email: session.email,
    role: session.role
  };
  next();
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

// Get community statistics
router.get('/admin/communities/stats', requireAdmin, async (req, res) => {
  try {
    // Get total count of all communities
    const allCommunities = await db.select().from(communities);
    const totalCount = allCommunities.length;
    
    // Calculate stats from the fetched communities
    const stats = {
      total: totalCount,
      licensed: 0,
      withPricing: 0,
      byState: {} as Record<string, number>
    };
    
    // Process each community for stats
    allCommunities.forEach(community => {
      // Count licensed communities
      if (community.license_number && community.license_number.trim() !== '') {
        stats.licensed++;
      }
      
      // Count communities with pricing
      if (community.price_range) {
        stats.withPricing++;
      }
      
      // Count by state
      if (community.state) {
        stats.byState[community.state] = (stats.byState[community.state] || 0) + 1;
      }
    });
    
    // Get top 5 states
    const topStates = Object.entries(stats.byState)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([state, count]) => ({ state, count }));

    res.json({
      total: stats.total,
      licensed: stats.licensed,
      withPricing: stats.withPricing,
      topStates,
      // Placeholder values until tier system is implemented in database
      featured: 0,
      platinum: 0,
      standard: 0,
      premium: 0
    });
  } catch (error) {
    console.error('Error fetching community stats:', error);
    res.status(500).json({ message: 'Failed to fetch statistics' });
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

// Run manual data integrity audit
router.post('/admin/audit/run', requireAdmin, async (req, res) => {
  try {
    console.log('🔍 Manual audit requested by admin');
    const report = await ScheduledAuditService.manualAudit();
    
    res.json({
      message: 'Audit completed successfully',
      report: {
        timestamp: report.timestamp,
        totalCommunities: report.totalCommunities,
        duplicatesFound: report.duplicatesFound,
        testDataFound: report.testDataFound,
        deactivated: report.deactivated,
        warnings: report.warnings,
        details: report.details
      }
    });
  } catch (error) {
    console.error('Error running manual audit:', error);
    res.status(500).json({ message: 'Failed to run audit' });
  }
});

// Get last audit report
router.get('/admin/audit/last-report', requireAdmin, async (req, res) => {
  try {
    const report = ScheduledAuditService.getLastAuditReport();
    
    if (!report) {
      return res.json({ message: 'No audit report available yet' });
    }
    
    res.json({
      report: {
        timestamp: report.timestamp,
        totalCommunities: report.totalCommunities,
        duplicatesFound: report.duplicatesFound,
        testDataFound: report.testDataFound,
        deactivated: report.deactivated,
        warnings: report.warnings,
        details: report.details
      }
    });
  } catch (error) {
    console.error('Error fetching audit report:', error);
    res.status(500).json({ message: 'Failed to fetch audit report' });
  }
});

export default router;
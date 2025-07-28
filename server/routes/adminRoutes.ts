import express, { type Express } from "express";
import { db } from "../db";
import { 
  communities, 
  users, 
  auditLogs, 
  securityAuditLogs,
  communityDashboardStats,
  vendors,
  communityClaims,
  claimedCommunities
} from "@shared/schema";
import { eq, desc, sql, and, or, gte } from "drizzle-orm";
import { isAuthenticated as requireAuth, isAdmin, checkRole } from "../replitAuth";
import { 
  getSecurityDashboard, 
  getUserTrace, 
  blockIP, 
  unblockIP, 
  getSecurityEvents, 
  generateSecurityReport 
} from "../security-admin-endpoints";
import { enhancedPlatformStats } from "../enhanced-platform-stats";
import { communityStatsCache } from "../community-stats-cache";

export function registerAdminRoutes(app: Express) {
  // Create a separate router for admin routes
  const adminRouter = express.Router();
  
  // Apply admin authentication to all routes
  adminRouter.use(requireAuth);
  adminRouter.use(isAdmin);

  // Admin dashboard stats
  adminRouter.get('/dashboard/stats', async (req, res) => {
    try {
      const stats = await enhancedPlatformStats.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching admin dashboard stats:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
  });

  // User management
  adminRouter.get('/users', async (req, res) => {
    try {
      const { page = 1, limit = 50, role, search } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      let conditions = [];
      
      if (role) {
        conditions.push(eq(users.role, role as any));
      }
      
      if (search) {
        conditions.push(
          or(
            sql`${users.email} ILIKE ${'%' + search + '%'}`,
            sql`${users.firstName} ILIKE ${'%' + search + '%'}`,
            sql`${users.lastName} ILIKE ${'%' + search + '%'}`
          )
        );
      }

      const query = db.select().from(users);
      if (conditions.length > 0) {
        query.where(and(...conditions));
      }

      const usersData = await query
        .orderBy(desc(users.createdAt))
        .limit(parseInt(limit as string))
        .offset(offset);

      const [{ count }] = await db
        .select({ count: sql`COUNT(*)` })
        .from(users)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      res.json({
        users: usersData,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: parseInt(count as string),
          totalPages: Math.ceil(parseInt(count as string) / parseInt(limit as string))
        }
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  // Update user role
  adminRouter.patch('/users/:userId/role', async (req, res) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      const validRoles = ["user", "admin", "community_owner", "vendor", "financial_admin", "support_agent", "analytics_viewer", "super_admin"];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }

      const [updatedUser] = await db
        .update(users)
        .set({ role, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning();

      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Log the role change
      await db.insert(auditLogs).values({
        userId: null,
        adminId: (req as any).user?.id,
        action: 'user_role_updated',
        resourceType: 'user',
        resourceId: userId,
        details: { oldRole: updatedUser.role, newRole: role },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        severity: 'High',
        outcome: 'Success'
      });

      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating user role:', error);
      res.status(500).json({ error: 'Failed to update user role' });
    }
  });

  // Audit logs
  adminRouter.get('/audit-logs', async (req, res) => {
    try {
      const { page = 1, limit = 50, action, severity, startDate, endDate } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      let conditions = [];
      
      if (action) {
        conditions.push(eq(auditLogs.action, action as string));
      }
      
      if (severity) {
        conditions.push(eq(auditLogs.severity, severity as any));
      }
      
      if (startDate) {
        conditions.push(gte(auditLogs.createdAt, new Date(startDate as string)));
      }
      
      if (endDate) {
        conditions.push(sql`${auditLogs.createdAt} <= ${new Date(endDate as string)}`);
      }

      const query = db.select().from(auditLogs);
      if (conditions.length > 0) {
        query.where(and(...conditions));
      }

      const logs = await query
        .orderBy(desc(auditLogs.createdAt))
        .limit(parseInt(limit as string))
        .offset(offset);

      const [{ count }] = await db
        .select({ count: sql`COUNT(*)` })
        .from(auditLogs)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      res.json({
        logs,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: parseInt(count as string),
          totalPages: Math.ceil(parseInt(count as string) / parseInt(limit as string))
        }
      });
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
  });

  // Community management
  adminRouter.get('/communities/pending', async (req, res) => {
    try {
      const pendingCommunities = await db
        .select()
        .from(communities)
        .where(eq(communities.status, 'pending'))
        .orderBy(desc(communities.createdAt));

      res.json(pendingCommunities);
    } catch (error) {
      console.error('Error fetching pending communities:', error);
      res.status(500).json({ error: 'Failed to fetch pending communities' });
    }
  });

  // Approve/reject community
  adminRouter.patch('/communities/:id/status', async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      const { status, reason } = req.body;

      if (!['active', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const [updated] = await db
        .update(communities)
        .set({ 
          status,
          updatedAt: new Date()
        })
        .where(eq(communities.id, communityId))
        .returning();

      if (!updated) {
        return res.status(404).json({ error: 'Community not found' });
      }

      // Log the action
      await db.insert(auditLogs).values({
        userId: null,
        adminId: (req as any).user?.id,
        action: `community_${status}`,
        resourceType: 'community',
        resourceId: communityId.toString(),
        details: { reason },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        severity: 'Medium',
        outcome: 'Success'
      });

      res.json(updated);
    } catch (error) {
      console.error('Error updating community status:', error);
      res.status(500).json({ error: 'Failed to update community status' });
    }
  });

  // Analytics
  adminRouter.get('/analytics/usage', async (req, res) => {
    try {
      const { timeframe = '24h' } = req.query;
      
      // This would be replaced with real analytics data
      const analytics = {
        totalCalls: 175,
        totalCost: 1.40,
        avgResponseTime: 245,
        successRate: 98.5,
        breakdown: {
          communities: { calls: 25, cost: 0.20, percentage: 60 },
          search: { calls: 70, cost: 0.56, percentage: 40 },
        },
        timeframe,
        lastUpdated: new Date()
      };

      res.json(analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  });

  // Security dashboard
  adminRouter.get('/security/dashboard', async (req, res) => {
    try {
      const dashboard = await getSecurityDashboard();
      res.json(dashboard);
    } catch (error) {
      console.error('Error fetching security dashboard:', error);
      res.status(500).json({ error: 'Failed to fetch security dashboard' });
    }
  });

  // User trace
  adminRouter.get('/security/user-trace/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const trace = await getUserTrace(userId);
      res.json(trace);
    } catch (error) {
      console.error('Error fetching user trace:', error);
      res.status(500).json({ error: 'Failed to fetch user trace' });
    }
  });

  // Block/unblock IP
  adminRouter.post('/security/block-ip', async (req, res) => {
    try {
      const { ip, reason } = req.body;
      await blockIP(ip, reason);
      
      // Log the action
      await db.insert(securityAuditLogs).values({
        adminId: (req as any).user?.id,
        action: 'ip_blocked',
        resourceType: 'ip_address',
        resourceId: ip,
        details: { reason },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        severity: 'High',
        outcome: 'Success'
      });

      res.json({ success: true, message: `IP ${ip} blocked` });
    } catch (error) {
      console.error('Error blocking IP:', error);
      res.status(500).json({ error: 'Failed to block IP' });
    }
  });

  adminRouter.post('/security/unblock-ip', async (req, res) => {
    try {
      const { ip } = req.body;
      await unblockIP(ip);
      
      // Log the action
      await db.insert(securityAuditLogs).values({
        adminId: (req as any).user?.id,
        action: 'ip_unblocked',
        resourceType: 'ip_address',
        resourceId: ip,
        details: {},
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        severity: 'Medium',
        outcome: 'Success'
      });

      res.json({ success: true, message: `IP ${ip} unblocked` });
    } catch (error) {
      console.error('Error unblocking IP:', error);
      res.status(500).json({ error: 'Failed to unblock IP' });
    }
  });

  // Community stats refresh
  adminRouter.post('/communities/refresh-stats', async (req, res) => {
    try {
      await communityStatsCache.refresh();
      res.json({ success: true, message: 'Community stats refreshed' });
    } catch (error) {
      console.error('Error refreshing community stats:', error);
      res.status(500).json({ error: 'Failed to refresh community stats' });
    }
  });

  // Claim management
  adminRouter.get('/claims/pending', async (req, res) => {
    try {
      const pendingClaims = await db
        .select({
          claim: communityClaims,
          community: {
            id: communities.id,
            name: communities.name,
            address: communities.address,
            city: communities.city,
            state: communities.state
          }
        })
        .from(communityClaims)
        .innerJoin(communities, eq(communityClaims.communityId, communities.id))
        .where(eq(communityClaims.status, 'Pending'))
        .orderBy(desc(communityClaims.createdAt));

      res.json(pendingClaims);
    } catch (error) {
      console.error('Error fetching pending claims:', error);
      res.status(500).json({ error: 'Failed to fetch pending claims' });
    }
  });

  // Mount admin router
  app.use('/api/admin', adminRouter);
}
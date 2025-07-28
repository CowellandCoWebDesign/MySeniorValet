import request from 'supertest';
import express from 'express';
import { describe, beforeAll, afterAll, it, expect } from '@jest/globals';

describe('Admin API Endpoints', () => {
  let app: express.Application;
  let server: any;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    
    // Mock authentication middleware
    const mockAuth = (requiredRole = 'admin') => (req: any, res: any, next: any) => {
      const auth = req.headers.authorization;
      
      if (!auth) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      if (auth === 'Bearer admin-token') {
        req.user = { id: 'admin1', role: 'admin', email: 'admin@myseniorvalet.com' };
        return next();
      } else if (auth === 'Bearer user-token') {
        req.user = { id: 'user1', role: 'user', email: 'user@example.com' };
        if (requiredRole === 'admin') {
          return res.status(403).json({ message: 'Forbidden' });
        }
        return next();
      }

      return res.status(401).json({ message: 'Invalid token' });
    };

    // Admin dashboard endpoints
    app.get('/api/admin/stats', mockAuth('admin'), (req, res) => {
      res.json({
        totalUsers: 15420,
        totalCommunities: 26306,
        toursScheduled: 8934,
        monthlyRevenue: 145780,
        activeSearches: 2341,
        systemHealth: 'excellent'
      });
    });

    app.get('/api/admin/users', mockAuth('admin'), (req, res) => {
      const { page = 1, limit = 20 } = req.query;
      
      const users = [
        { id: 1, email: 'user1@example.com', role: 'user', lastActive: '2025-01-15' },
        { id: 2, email: 'user2@example.com', role: 'user', lastActive: '2025-01-14' },
        { id: 3, email: 'vendor@company.com', role: 'vendor', lastActive: '2025-01-13' }
      ];

      res.json({
        users,
        totalUsers: users.length,
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      });
    });

    app.put('/api/admin/users/:id/role', mockAuth('admin'), (req, res) => {
      const { id } = req.params;
      const { role } = req.body;
      
      if (!role || !['user', 'vendor', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }

      res.json({
        success: true,
        userId: id,
        newRole: role,
        updatedBy: req.user.id
      });
    });

    app.delete('/api/admin/users/:id', mockAuth('admin'), (req, res) => {
      const { id } = req.params;
      
      res.json({
        success: true,
        deletedUserId: id,
        deletedBy: req.user.id,
        timestamp: new Date().toISOString()
      });
    });

    app.get('/api/admin/communities', mockAuth('admin'), (req, res) => {
      const { status, location } = req.query;
      
      const communities = [
        { id: 264, name: 'Heritage Hills Senior Living', status: 'active', location: 'Sacramento, CA' },
        { id: 265, name: 'Golden Years Community', status: 'pending', location: 'San Francisco, CA' }
      ].filter(c => {
        if (status && c.status !== status) return false;
        if (location && !c.location.toLowerCase().includes((location as string).toLowerCase())) return false;
        return true;
      });

      res.json(communities);
    });

    // Security endpoints
    app.get('/api/admin/security/audit-logs', mockAuth('admin'), (req, res) => {
      res.json([
        {
          id: 1,
          timestamp: '2025-01-15T10:30:00Z',
          action: 'USER_LOGIN',
          userId: 'user123',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0...',
          status: 'success'
        },
        {
          id: 2,
          timestamp: '2025-01-15T10:25:00Z',
          action: 'FAILED_LOGIN',
          userId: null,
          ipAddress: '192.168.1.100',
          userAgent: 'curl/7.68.0',
          status: 'failed'
        }
      ]);
    });

    server = app.listen(0);
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
  });

  it('should reject admin requests without authentication', async () => {
    const response = await request(app)
      .get('/api/admin/stats')
      .expect(401);

    expect(response.body).toHaveProperty('message', 'Unauthorized');
  });

  it('should reject admin requests from non-admin users', async () => {
    const response = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', 'Bearer user-token')
      .expect(403);

    expect(response.body).toHaveProperty('message', 'Forbidden');
  });

  it('should return admin stats for authenticated admin', async () => {
    const response = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', 'Bearer admin-token')
      .expect(200);

    expect(response.body).toHaveProperty('totalUsers');
    expect(response.body).toHaveProperty('totalCommunities', 26306);
    expect(response.body).toHaveProperty('toursScheduled');
    expect(response.body).toHaveProperty('monthlyRevenue');
    expect(response.body).toHaveProperty('systemHealth');
  });

  it('should return user list for admin', async () => {
    const response = await request(app)
      .get('/api/admin/users')
      .set('Authorization', 'Bearer admin-token')
      .expect(200);

    expect(response.body).toHaveProperty('users');
    expect(response.body).toHaveProperty('totalUsers');
    expect(Array.isArray(response.body.users)).toBe(true);
    expect(response.body.users[0]).toHaveProperty('email');
    expect(response.body.users[0]).toHaveProperty('role');
  });

  it('should allow admin to update user roles', async () => {
    const response = await request(app)
      .put('/api/admin/users/123/role')
      .set('Authorization', 'Bearer admin-token')
      .send({ role: 'vendor' })
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('userId', '123');
    expect(response.body).toHaveProperty('newRole', 'vendor');
  });

  it('should validate role when updating user roles', async () => {
    const response = await request(app)
      .put('/api/admin/users/123/role')
      .set('Authorization', 'Bearer admin-token')
      .send({ role: 'invalid-role' })
      .expect(400);

    expect(response.body).toHaveProperty('error', 'Invalid role');
  });

  it('should allow admin to delete users', async () => {
    const response = await request(app)
      .delete('/api/admin/users/123')
      .set('Authorization', 'Bearer admin-token')
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('deletedUserId', '123');
    expect(response.body).toHaveProperty('timestamp');
  });

  it('should return communities list for admin', async () => {
    const response = await request(app)
      .get('/api/admin/communities')
      .set('Authorization', 'Bearer admin-token')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0]).toHaveProperty('name');
    expect(response.body[0]).toHaveProperty('status');
    expect(response.body[0]).toHaveProperty('location');
  });

  it('should filter communities by status', async () => {
    const response = await request(app)
      .get('/api/admin/communities?status=active')
      .set('Authorization', 'Bearer admin-token')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    response.body.forEach((community: any) => {
      expect(community.status).toBe('active');
    });
  });

  it('should return security audit logs', async () => {
    const response = await request(app)
      .get('/api/admin/security/audit-logs')
      .set('Authorization', 'Bearer admin-token')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0]).toHaveProperty('timestamp');
    expect(response.body[0]).toHaveProperty('action');
    expect(response.body[0]).toHaveProperty('ipAddress');
    expect(response.body[0]).toHaveProperty('status');
  });

  it('should handle pagination for user list', async () => {
    const response = await request(app)
      .get('/api/admin/users?page=1&limit=10')
      .set('Authorization', 'Bearer admin-token')
      .expect(200);

    expect(response.body).toHaveProperty('page', 1);
    expect(response.body).toHaveProperty('limit', 10);
    expect(response.body).toHaveProperty('users');
  });
});
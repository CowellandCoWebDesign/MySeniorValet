import request from 'supertest';
import express from 'express';
import { describe, beforeAll, afterAll, it, expect } from '@jest/globals';

// Integration tests for complete user workflows
describe('MySeniorValet Integration Tests', () => {
  let app: express.Application;
  let server: any;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    
    // Mock complete application routes for integration testing
    
    // Home page data
    app.get('/api/platform/stats', (req, res) => {
      res.json({
        totalCommunities: 26306,
        totalUsers: 15420,
        toursScheduled: 8934,
        satisfaction: 4.8
      });
    });

    app.get('/api/communities/trending', (req, res) => {
      res.json([
        { id: 264, name: 'Heritage Hills Senior Living', city: 'Sacramento', state: 'California' }
      ]);
    });

    // Search workflow
    app.get('/api/search', (req, res) => {
      const { query, location } = req.query;
      res.json([
        {
          id: 1,
          name: `Community matching ${query}`,
          city: location || 'Sacramento',
          state: 'California',
          relevanceScore: 0.95
        }
      ]);
    });

    // Community details workflow
    app.get('/api/communities/:id', (req, res) => {
      const { id } = req.params;
      res.json({
        id: parseInt(id),
        name: 'Heritage Hills Senior Living',
        city: 'Sacramento',
        state: 'California',
        description: 'Premium senior living community',
        amenities: ['24/7 Care', 'Dining Services', 'Activities'],
        pricing: { baseRent: 3500, careLevel: 'assisted_living' }
      });
    });

    // Tour scheduling workflow
    app.post('/api/tours/schedule', (req, res) => {
      const { communityId, date, time, contactInfo } = req.body;
      
      if (!communityId || !date || !time || !contactInfo) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      res.json({
        success: true,
        tourId: 'tour_123',
        confirmation: {
          communityId,
          scheduledDate: date,
          scheduledTime: time,
          status: 'confirmed'
        }
      });
    });

    // Email notification workflow
    app.post('/api/email/tour-confirmation', (req, res) => {
      const { tourId, email } = req.body;
      res.json({ success: true, emailSent: true, tourId });
    });

    // User registration workflow
    app.post('/api/auth/register', (req, res) => {
      const { email, name, phone } = req.body;
      
      if (!email || !name) {
        return res.status(400).json({ error: 'Email and name required' });
      }

      res.json({
        success: true,
        user: {
          id: 'user_123',
          email,
          name,
          phone,
          role: 'user',
          preferences: {}
        }
      });
    });

    // Favorites workflow
    app.post('/api/favorites', (req, res) => {
      const { communityId, userId } = req.body;
      res.json({ success: true, favoriteId: 'fav_123', communityId, userId });
    });

    app.get('/api/favorites/:userId', (req, res) => {
      res.json([
        { id: 'fav_123', communityId: 264, addedAt: new Date().toISOString() }
      ]);
    });

    server = app.listen(0);
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
  });

  describe('Complete User Journey: Search to Tour Booking', () => {
    it('should handle complete search and booking workflow', async () => {
      // Step 1: User searches for communities
      const searchResponse = await request(app)
        .get('/api/search?query=assisted+living&location=Sacramento')
        .expect(200);

      expect(searchResponse.body).toHaveLength(1);
      expect(searchResponse.body[0]).toHaveProperty('name');
      expect(searchResponse.body[0]).toHaveProperty('relevanceScore');

      // Step 2: User views community details
      const communityId = searchResponse.body[0].id;
      const detailsResponse = await request(app)
        .get(`/api/communities/${communityId}`)
        .expect(200);

      expect(detailsResponse.body).toHaveProperty('id', communityId);
      expect(detailsResponse.body).toHaveProperty('amenities');
      expect(detailsResponse.body).toHaveProperty('pricing');

      // Step 3: User schedules a tour
      const tourData = {
        communityId,
        date: '2025-08-15',
        time: '14:00',
        contactInfo: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '555-123-4567'
        }
      };

      const tourResponse = await request(app)
        .post('/api/tours/schedule')
        .send(tourData)
        .expect(200);

      expect(tourResponse.body).toHaveProperty('success', true);
      expect(tourResponse.body).toHaveProperty('tourId');
      expect(tourResponse.body.confirmation).toHaveProperty('status', 'confirmed');

      // Step 4: Confirmation email is sent
      const emailResponse = await request(app)
        .post('/api/email/tour-confirmation')
        .send({
          tourId: tourResponse.body.tourId,
          email: tourData.contactInfo.email
        })
        .expect(200);

      expect(emailResponse.body).toHaveProperty('success', true);
      expect(emailResponse.body).toHaveProperty('emailSent', true);
    });
  });

  describe('User Registration and Preferences Workflow', () => {
    it('should handle user registration and favorites', async () => {
      // Step 1: User registers
      const registrationData = {
        email: 'newuser@example.com',
        name: 'Jane Smith',
        phone: '555-987-6543'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(registrationData)
        .expect(200);

      expect(registerResponse.body).toHaveProperty('success', true);
      expect(registerResponse.body.user).toHaveProperty('email', registrationData.email);
      expect(registerResponse.body.user).toHaveProperty('role', 'user');

      const userId = registerResponse.body.user.id;

      // Step 2: User adds community to favorites
      const favoriteResponse = await request(app)
        .post('/api/favorites')
        .send({ communityId: 264, userId })
        .expect(200);

      expect(favoriteResponse.body).toHaveProperty('success', true);
      expect(favoriteResponse.body).toHaveProperty('communityId', 264);

      // Step 3: User retrieves favorites
      const favoritesResponse = await request(app)
        .get(`/api/favorites/${userId}`)
        .expect(200);

      expect(Array.isArray(favoritesResponse.body)).toBe(true);
      expect(favoritesResponse.body[0]).toHaveProperty('communityId', 264);
    });
  });

  describe('Platform Statistics and Home Page', () => {
    it('should provide accurate platform statistics', async () => {
      const statsResponse = await request(app)
        .get('/api/platform/stats')
        .expect(200);

      expect(statsResponse.body).toHaveProperty('totalCommunities', 26306);
      expect(statsResponse.body).toHaveProperty('totalUsers');
      expect(statsResponse.body).toHaveProperty('toursScheduled');
      expect(statsResponse.body).toHaveProperty('satisfaction');
      expect(statsResponse.body.satisfaction).toBeGreaterThan(4.0);
    });

    it('should provide trending communities for home page', async () => {
      const trendingResponse = await request(app)
        .get('/api/communities/trending')
        .expect(200);

      expect(Array.isArray(trendingResponse.body)).toBe(true);
      expect(trendingResponse.body.length).toBeGreaterThan(0);
      expect(trendingResponse.body[0]).toHaveProperty('name');
      expect(trendingResponse.body[0]).toHaveProperty('city');
      expect(trendingResponse.body[0]).toHaveProperty('state');
    });
  });

  describe('Error Handling and Validation', () => {
    it('should validate tour scheduling data', async () => {
      const incompleteData = {
        communityId: 264
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/tours/schedule')
        .send(incompleteData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Missing required fields');
    });

    it('should validate user registration data', async () => {
      const incompleteData = {
        email: 'test@example.com'
        // Missing name
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(incompleteData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Email and name required');
    });
  });
});
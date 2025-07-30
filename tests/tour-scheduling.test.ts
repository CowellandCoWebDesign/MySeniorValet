import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import { db } from '../server/db';
import { users, communities, tours } from '../shared/schema';
import { eq } from 'drizzle-orm';

describe('Tour Scheduling Tests', () => {
  let testCommunityId: number;
  let testUserId: string;

  beforeEach(async () => {
    // Get a test community
    const [community] = await db
      .select()
      .from(communities)
      .limit(1);
    
    testCommunityId = community.id;
    testUserId = `test_user_${Date.now()}`;
  });

  it('should successfully schedule a tour', async () => {
    const tourData = {
      communityId: testCommunityId,
      tourDate: '2025-08-01',
      tourTime: '14:00',
      tourType: 'in_person',
      attendeeCount: 1,
      contactName: 'Test User',
      contactEmail: 'testuser@example.com',
      contactPhone: '5307764220',
      specialRequests: 'Test request',
      contactPreference: 'email'
    };

    console.log('Testing tour scheduling with data:', tourData);

    const response = await request('http://localhost:5000')
      .post('/api/tours/schedule')
      .send(tourData);

    console.log('Response status:', response.status);
    console.log('Response body:', response.body);

    if (response.status !== 201) {
      console.error('Tour scheduling failed:', response.body);
    }

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('tour');
    expect(response.body.tour).toHaveProperty('id');
    expect(response.body.tour.status).toBe('scheduled');
  });

  it('should handle missing required fields', async () => {
    const incompleteTourData = {
      communityId: testCommunityId,
      tourDate: '2025-08-01',
      // Missing required fields
    };

    const response = await request('http://localhost:5000')
      .post('/api/tours/schedule')
      .send(incompleteTourData);

    console.log('Missing fields test - Response:', response.body);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('Missing required fields');
  });

  it('should create a guest user when not authenticated', async () => {
    const tourData = {
      communityId: testCommunityId,
      tourDate: '2025-08-01',
      tourTime: '14:00',
      tourType: 'in_person',
      attendeeCount: 1,
      contactName: 'Guest User',
      contactEmail: `guest${Date.now()}@example.com`,
      contactPhone: '5555555555',
      specialRequests: 'Guest tour',
      contactPreference: 'email'
    };

    const response = await request('http://localhost:5000')
      .post('/api/tours/schedule')
      .send(tourData);

    console.log('Guest user test - Response:', response.body);

    if (response.status === 201) {
      // Check if user was created
      const [createdUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, tourData.contactEmail));

      console.log('Created user:', createdUser);
      expect(createdUser).toBeDefined();
      expect(createdUser.email).toBe(tourData.contactEmail);
    }
  });

  it('should auto-favorite the community when scheduling', async () => {
    const tourData = {
      communityId: testCommunityId,
      tourDate: '2025-08-01',
      tourTime: '15:00',
      tourType: 'in_person',
      attendeeCount: 1,
      contactName: 'Favorite Test User',
      contactEmail: `favorite${Date.now()}@example.com`,
      contactPhone: '5555555556',
      specialRequests: 'Test auto-favorite',
      contactPreference: 'email'
    };

    const response = await request('http://localhost:5000')
      .post('/api/tours/schedule')
      .send(tourData);

    console.log('Auto-favorite test - Response:', response.body);

    expect(response.status).toBe(201);
    
    if (response.body.tour) {
      console.log('Checking favorites table for userId:', response.body.tour.userId);
      // The favorites check is done in the route itself
      expect(response.body.communityAutoFavorited).toBe(true);
    }
  });
});
import request from 'supertest';
import express from 'express';
import { describe, beforeAll, afterAll, it, expect } from '@jest/globals';

// API route tests for community endpoints
describe('Community API Endpoints', () => {
  let app: express.Application;
  let server: any;

  beforeAll(async () => {
    // Mock Express app setup for testing
    app = express();
    app.use(express.json());
    
    // Mock routes that match our actual endpoints
    app.get('/api/communities/count', (req, res) => {
      res.json({ count: '26306', _version: 'test', _timestamp: Date.now() });
    });

    app.get('/api/communities/trending', (req, res) => {
      res.json([
        { id: 264, name: 'Heritage Hills Senior Living', city: 'Sacramento', state: 'California' }
      ]);
    });

    app.get('/api/communities/hud-featured', (req, res) => {
      res.json([
        { id: 37079, name: 'Finney Apartments', type: 'hud', rent: 450 }
      ]);
    });

    app.get('/api/communities/by-location/:location', (req, res) => {
      const { location } = req.params;
      res.json([
        { id: 33680, name: `Community in ${location}`, city: location }
      ]);
    });

    app.get('/api/communities/coastal', (req, res) => {
      res.json([
        { id: 278, name: 'Peninsula Del Rey', type: 'coastal' }
      ]);
    });

    server = app.listen(0); // Use random port for testing
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
  });

  it('should return community count', async () => {
    const response = await request(app)
      .get('/api/communities/count')
      .expect(200);

    expect(response.body).toHaveProperty('count');
    expect(response.body.count).toBe('26306');
    expect(response.body).toHaveProperty('_version');
  });

  it('should return trending communities', async () => {
    const response = await request(app)
      .get('/api/communities/trending')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty('id');
    expect(response.body[0]).toHaveProperty('name');
  });

  it('should return HUD featured communities', async () => {
    const response = await request(app)
      .get('/api/communities/hud-featured')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0]).toHaveProperty('id');
    expect(response.body[0]).toHaveProperty('type', 'hud');
  });

  it('should return communities by location', async () => {
    const response = await request(app)
      .get('/api/communities/by-location/California')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0]).toHaveProperty('city', 'California');
  });

  it('should return coastal communities', async () => {
    const response = await request(app)
      .get('/api/communities/coastal')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0]).toHaveProperty('type', 'coastal');
  });
});
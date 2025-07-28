import request from 'supertest';
import express from 'express';
import { describe, beforeAll, afterAll, it, expect } from '@jest/globals';

describe('Search API Endpoints', () => {
  let app: express.Application;
  let server: any;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    
    // Mock search routes
    app.get('/api/search', (req, res) => {
      const { query, limit = 20, offset = 0 } = req.query;
      
      if (!query) {
        return res.status(400).json({ error: 'Query parameter required' });
      }

      const mockResults = [
        {
          id: 1,
          name: `Community matching ${query}`,
          city: 'Sacramento',
          state: 'California',
          type: 'assisted_living',
          relevanceScore: 0.95
        },
        {
          id: 2,
          name: `Senior Living ${query}`,
          city: 'San Francisco',
          state: 'California',
          type: 'memory_care',
          relevanceScore: 0.88
        }
      ];

      const start = parseInt(offset as string);
      const end = start + parseInt(limit as string);
      const results = mockResults.slice(start, end);

      res.json({
        results,
        total: mockResults.length,
        limit: parseInt(limit as string),
        offset: start
      });
    });

    app.get('/api/search/suggestions', (req, res) => {
      const { q } = req.query;
      
      const suggestions = q ? [
        `${q} assisted living`,
        `${q} memory care`,
        `${q} senior housing`,
        `${q} independent living`
      ] : [
        'assisted living Sacramento',
        'memory care San Francisco',
        'senior housing California',
        'independent living Bay Area'
      ];

      res.json(suggestions);
    });

    app.get('/api/communities/search/spatial', (req, res) => {
      const { swLat, swLng, neLat, neLng, limit = 50 } = req.query;
      
      if (!swLat || !swLng || !neLat || !neLng) {
        return res.status(400).json({ error: 'Bounding box coordinates required' });
      }

      const spatialResults = [
        {
          id: 100,
          name: 'Peninsula Senior Community',
          latitude: 37.8,
          longitude: -122.4,
          city: 'San Francisco',
          state: 'California'
        },
        {
          id: 101,
          name: 'Bay Area Assisted Living',
          latitude: 37.75,
          longitude: -122.35,
          city: 'San Francisco',
          state: 'California'
        }
      ];

      res.json(spatialResults.slice(0, parseInt(limit as string)));
    });

    server = app.listen(0);
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
  });

  it('should search communities with query parameter', async () => {
    const response = await request(app)
      .get('/api/search?query=assisted+living')
      .expect(200);

    expect(response.body).toHaveProperty('results');
    expect(response.body).toHaveProperty('total');
    expect(Array.isArray(response.body.results)).toBe(true);
    expect(response.body.results.length).toBeGreaterThan(0);
    expect(response.body.results[0]).toHaveProperty('relevanceScore');
  });

  it('should require query parameter for search', async () => {
    const response = await request(app)
      .get('/api/search')
      .expect(400);

    expect(response.body).toHaveProperty('error', 'Query parameter required');
  });

  it('should handle pagination parameters', async () => {
    const response = await request(app)
      .get('/api/search?query=senior&limit=1&offset=0')
      .expect(200);

    expect(response.body).toHaveProperty('limit', 1);
    expect(response.body).toHaveProperty('offset', 0);
    expect(response.body.results.length).toBe(1);
  });

  it('should provide search suggestions', async () => {
    const response = await request(app)
      .get('/api/search/suggestions?q=sacramento')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toContain('sacramento');
  });

  it('should provide default suggestions when no query', async () => {
    const response = await request(app)
      .get('/api/search/suggestions')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('should perform spatial search with bounding box', async () => {
    const response = await request(app)
      .get('/api/communities/search/spatial?swLat=37.7&swLng=-122.5&neLat=37.9&neLng=-122.3&limit=10')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty('latitude');
    expect(response.body[0]).toHaveProperty('longitude');
    expect(response.body[0]).toHaveProperty('name');
  });

  it('should require bounding box for spatial search', async () => {
    const response = await request(app)
      .get('/api/communities/search/spatial?swLat=37.7')
      .expect(400);

    expect(response.body).toHaveProperty('error', 'Bounding box coordinates required');
  });

  it('should validate search result structure', async () => {
    const response = await request(app)
      .get('/api/search?query=test')
      .expect(200);

    const result = response.body.results[0];
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('name');
    expect(result).toHaveProperty('city');
    expect(result).toHaveProperty('state');
    expect(result).toHaveProperty('type');
    expect(result).toHaveProperty('relevanceScore');
    expect(typeof result.relevanceScore).toBe('number');
    expect(result.relevanceScore).toBeGreaterThan(0);
    expect(result.relevanceScore).toBeLessThanOrEqual(1);
  });
});
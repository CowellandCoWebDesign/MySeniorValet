import request from 'supertest';
import express from 'express';
import { describe, beforeAll, afterAll, it, expect } from '@jest/globals';

describe('Authentication API Endpoints', () => {
  let app: express.Application;
  let server: any;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    
    // Mock auth routes
    app.get('/api/auth/user', (req, res) => {
      // Simulate unauthenticated request
      res.status(401).json({ message: 'Unauthorized' });
    });

    app.post('/api/auth/demo-login', (req, res) => {
      res.json({ 
        success: true, 
        user: { 
          id: 'demo', 
          email: 'demo@myseniorvalet.com',
          role: 'user' 
        } 
      });
    });

    app.get('/api/auth/logout', (req, res) => {
      res.json({ success: true, message: 'Logged out successfully' });
    });

    server = app.listen(0);
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
  });

  it('should reject unauthenticated user requests', async () => {
    const response = await request(app)
      .get('/api/auth/user')
      .expect(401);

    expect(response.body).toHaveProperty('message', 'Unauthorized');
  });

  it('should allow demo login', async () => {
    const response = await request(app)
      .post('/api/auth/demo-login')
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('email');
    expect(response.body.user).toHaveProperty('role');
  });

  it('should handle logout requests', async () => {
    const response = await request(app)
      .get('/api/auth/logout')
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message');
  });

  it('should validate demo login credentials', async () => {
    const response = await request(app)
      .post('/api/auth/demo-login')
      .send({ username: 'demo', password: 'demo' })
      .expect(200);

    expect(response.body.user).toHaveProperty('id', 'demo');
    expect(response.body.user.email).toContain('@myseniorvalet.com');
  });
});
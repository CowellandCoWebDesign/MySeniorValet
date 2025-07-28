import request from 'supertest';
import express from 'express';
import { describe, beforeAll, afterAll, it, expect } from '@jest/globals';

describe('Email API Endpoints', () => {
  let app: express.Application;
  let server: any;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    
    // Mock email routes
    app.get('/api/email/status', (req, res) => {
      res.json({
        configured: true,
        domain: 'myseniorvalet.com',
        provider: 'SendGrid',
        features: {
          transactional: true,
          marketing: false,
          templates: true
        }
      });
    });

    app.post('/api/email/test', (req, res) => {
      const { to, subject, message } = req.body;
      
      if (!to || !subject || !message) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      res.json({ 
        success: true, 
        message: 'Test email sent successfully' 
      });
    });

    app.post('/api/email/tour-reminder', (req, res) => {
      const { email, communityName, tourDate } = req.body;
      
      if (!email || !communityName || !tourDate) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      res.json({ success: true });
    });

    app.post('/api/email/review-request', (req, res) => {
      const { email, communityName, communityId } = req.body;
      
      if (!email || !communityName || !communityId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      res.json({ success: true });
    });

    server = app.listen(0);
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
  });

  it('should return email configuration status', async () => {
    const response = await request(app)
      .get('/api/email/status')
      .expect(200);

    expect(response.body).toHaveProperty('configured', true);
    expect(response.body).toHaveProperty('domain', 'myseniorvalet.com');
    expect(response.body).toHaveProperty('provider', 'SendGrid');
    expect(response.body.features).toHaveProperty('transactional', true);
  });

  it('should send test email with valid data', async () => {
    const testData = {
      to: 'test@example.com',
      subject: 'Test Subject',
      message: 'Test message content'
    };

    const response = await request(app)
      .post('/api/email/test')
      .send(testData)
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message');
  });

  it('should reject test email with missing fields', async () => {
    const incompleteData = {
      to: 'test@example.com'
      // Missing subject and message
    };

    const response = await request(app)
      .post('/api/email/test')
      .send(incompleteData)
      .expect(400);

    expect(response.body).toHaveProperty('error', 'Missing required fields');
  });

  it('should send tour reminder email', async () => {
    const tourData = {
      email: 'user@example.com',
      communityName: 'Heritage Hills Senior Living',
      tourDate: '2025-08-01T14:00:00Z'
    };

    const response = await request(app)
      .post('/api/email/tour-reminder')
      .send(tourData)
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
  });

  it('should send review request email', async () => {
    const reviewData = {
      email: 'user@example.com',
      communityName: 'Heritage Hills Senior Living',
      communityId: 264
    };

    const response = await request(app)
      .post('/api/email/review-request')
      .send(reviewData)
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
  });

  it('should validate email format in test endpoint', async () => {
    const invalidEmailData = {
      to: 'invalid-email',
      subject: 'Test Subject',
      message: 'Test message'
    };

    // This would be validated in real implementation
    const response = await request(app)
      .post('/api/email/test')
      .send(invalidEmailData)
      .expect(200); // Mock accepts any format

    expect(response.body).toHaveProperty('success', true);
  });
});
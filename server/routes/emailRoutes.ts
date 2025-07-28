import { Express } from 'express';
import { EmailService } from '../services/email';

export function registerEmailRoutes(app: Express) {
  // Test email endpoint (admin only)
  app.post('/api/email/test', async (req, res) => {
    try {
      const { to, subject, message } = req.body;

      if (!to || !subject || !message) {
        return res.status(400).json({ error: 'Missing required fields: to, subject, message' });
      }

      const success = await EmailService.sendNotification(to, subject, message);
      
      if (success) {
        res.json({ success: true, message: 'Test email sent successfully' });
      } else {
        res.status(500).json({ error: 'Failed to send test email' });
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      res.status(500).json({ error: 'Failed to send test email' });
    }
  });

  // Send tour reminder (automated endpoint)
  app.post('/api/email/tour-reminder', async (req, res) => {
    try {
      const { email, communityName, tourDate } = req.body;

      if (!email || !communityName || !tourDate) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const success = await EmailService.sendTourConfirmation(
        email,
        communityName,
        new Date(tourDate)
      );

      res.json({ success });
    } catch (error) {
      console.error('Error sending tour reminder:', error);
      res.status(500).json({ error: 'Failed to send tour reminder' });
    }
  });

  // Send review request (automated endpoint)
  app.post('/api/email/review-request', async (req, res) => {
    try {
      const { email, communityName, communityId } = req.body;

      if (!email || !communityName || !communityId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const success = await EmailService.sendReviewRequest(
        email,
        communityName,
        communityId
      );

      res.json({ success });
    } catch (error) {
      console.error('Error sending review request:', error);
      res.status(500).json({ error: 'Failed to send review request' });
    }
  });

  // Email verification status
  app.get('/api/email/status', async (req, res) => {
    const isConfigured = !!process.env.SENDGRID_API_KEY;
    const domain = 'myseniorvalet.com';
    
    res.json({
      configured: isConfigured,
      domain: domain,
      provider: 'SendGrid',
      features: {
        transactional: isConfigured,
        marketing: false, // Requires additional setup
        templates: isConfigured
      },
      dnsRecords: {
        instructions: 'Please add the DNS records shown in SendGrid dashboard to verify your domain',
        status: 'pending_verification'
      }
    });
  });
}
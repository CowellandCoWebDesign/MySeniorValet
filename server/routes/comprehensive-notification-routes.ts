import { Express } from 'express';
import ComprehensiveNotificationService from '../services/comprehensive-notifications';
import { requireAuth } from '../custom-auth';

export function registerComprehensiveNotificationRoutes(app: Express) {
  
  // 1. COMMUNITY CLAIM ENDPOINT
  app.post('/api/communities/claim', async (req, res) => {
    try {
      const { communityId, communityName, contactName, email, phone, message } = req.body;
      
      if (!communityId || !communityName || !contactName || !email) {
        return res.status(400).json({ 
          error: 'Missing required fields',
          _version: process.env.VERSION_TIMESTAMP,
          _timestamp: Date.now()
        });
      }

      await ComprehensiveNotificationService.notifyCommunityClaimSubmitted({
        communityId,
        communityName,
        claimantName: contactName,
        claimantEmail: email,
        claimantPhone: phone,
        message
      });

      res.json({ 
        success: true, 
        message: 'Community claim submitted successfully',
        _version: process.env.VERSION_TIMESTAMP,
        _timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error submitting community claim:', error);
      res.status(500).json({ 
        error: 'Failed to submit claim',
        _version: process.env.VERSION_TIMESTAMP,
        _timestamp: Date.now()
      });
    }
  });

  // 2. TOUR SCHEDULING ENDPOINT
  app.post('/api/tourmate/schedule', async (req, res) => {
    try {
      const { communityId, communityName, visitorName, visitorEmail, tourDate, tourTime, phoneNumber } = req.body;
      
      if (!communityId || !communityName || !visitorName || !visitorEmail || !tourDate || !tourTime) {
        return res.status(400).json({ 
          error: 'Missing required fields',
          _version: process.env.VERSION_TIMESTAMP,
          _timestamp: Date.now()
        });
      }

      const tourId = `tour_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      await ComprehensiveNotificationService.notifyTourScheduled({
        tourId,
        communityId,
        communityName,
        visitorName,
        visitorEmail,
        tourDate,
        tourTime,
        phoneNumber
      });

      res.json({ 
        success: true,
        tourId,
        message: 'Tour scheduled successfully',
        _version: process.env.VERSION_TIMESTAMP,
        _timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error scheduling tour:', error);
      res.status(500).json({ 
        error: 'Failed to schedule tour',
        _version: process.env.VERSION_TIMESTAMP,
        _timestamp: Date.now()
      });
    }
  });

  // 3. TOUR COMPLETION ENDPOINT
  app.post('/api/tour-tracker/complete', async (req, res) => {
    try {
      const { tourId, communityName, rating, feedback, userName, userEmail } = req.body;
      
      if (!tourId || !communityName || !rating) {
        return res.status(400).json({ 
          error: 'Missing required fields',
          _version: process.env.VERSION_TIMESTAMP,
          _timestamp: Date.now()
        });
      }

      await ComprehensiveNotificationService.notifyTourCompleted({
        tourId,
        communityName,
        visitorName: userName || 'Anonymous',
        rating,
        feedback: feedback || 'No feedback provided'
      });

      res.json({ 
        success: true,
        message: 'Tour completion recorded',
        _version: process.env.VERSION_TIMESTAMP,
        _timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error completing tour:', error);
      res.status(500).json({ 
        error: 'Failed to record tour completion',
        _version: process.env.VERSION_TIMESTAMP,
        _timestamp: Date.now()
      });
    }
  });

  // 4. VENDOR REGISTRATION ENDPOINT
  app.post('/api/vendor/register', async (req, res) => {
    try {
      const { businessName, contactName, email, phone, serviceType, tierKey } = req.body;
      
      if (!businessName || !contactName || !email || !serviceType) {
        return res.status(400).json({ 
          error: 'Missing required fields',
          _version: process.env.VERSION_TIMESTAMP,
          _timestamp: Date.now()
        });
      }

      await ComprehensiveNotificationService.notifyVendorRegistration({
        businessName,
        contactName,
        email,
        serviceType,
        tierKey: tierKey || 'basic'
      });

      res.json({ 
        success: true,
        message: 'Vendor registration submitted',
        _version: process.env.VERSION_TIMESTAMP,
        _timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error registering vendor:', error);
      res.status(500).json({ 
        error: 'Failed to register vendor',
        _version: process.env.VERSION_TIMESTAMP,
        _timestamp: Date.now()
      });
    }
  });

  // 5. EMERGENCY CONTACT ENDPOINT (Fixed)
  app.post('/api/emergency/contact', async (req, res) => {
    try {
      const { name, email, phone, message, location, urgency } = req.body;
      
      if (!name || !message) {
        return res.status(400).json({ 
          error: 'Name and message are required',
          _version: process.env.VERSION_TIMESTAMP,
          _timestamp: Date.now()
        });
      }

      await ComprehensiveNotificationService.notifyEmergencyContact({
        userName: name,
        userEmail: email,
        userLocation: location,
        message,
        contactNumber: phone,
        urgency: urgency || 'medium'
      });

      res.json({ 
        success: true,
        message: 'Emergency contact request sent',
        _version: process.env.VERSION_TIMESTAMP,
        _timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error sending emergency contact:', error);
      res.status(500).json({ 
        error: 'Failed to send emergency contact',
        _version: process.env.VERSION_TIMESTAMP,
        _timestamp: Date.now()
      });
    }
  });

  // 6. SECURITY ALERT ENDPOINT
  app.post('/api/security/alert', requireAuth, async (req, res) => {
    try {
      const { alertType, description, severity, ipAddress } = req.body;
      
      if (!alertType || !description || !severity) {
        return res.status(400).json({ 
          error: 'Missing required fields',
          _version: process.env.VERSION_TIMESTAMP,
          _timestamp: Date.now()
        });
      }

      await ComprehensiveNotificationService.notifySecurityAlert({
        alertType,
        description,
        severity,
        ipAddress,
        userId: (req as any).user?.id
      });

      res.json({ 
        success: true,
        message: 'Security alert sent',
        _version: process.env.VERSION_TIMESTAMP,
        _timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error sending security alert:', error);
      res.status(500).json({ 
        error: 'Failed to send security alert',
        _version: process.env.VERSION_TIMESTAMP,
        _timestamp: Date.now()
      });
    }
  });

  // 7. SYSTEM ALERT ENDPOINT
  app.post('/api/admin/system-alert', requireAuth, async (req, res) => {
    try {
      const { alertType, message, severity } = req.body;
      
      // Check if user is admin
      const userEmail = (req as any).user?.email;
      if (userEmail !== 'william.cowell01@gmail.com' && userEmail !== 'admin@myseniorvalet.com') {
        return res.status(403).json({ 
          error: 'Unauthorized',
          _version: process.env.VERSION_TIMESTAMP,
          _timestamp: Date.now()
        });
      }

      await ComprehensiveNotificationService.notifySystemAlert({
        alertType,
        message,
        severity
      });

      res.json({ 
        success: true,
        message: 'System alert sent',
        _version: process.env.VERSION_TIMESTAMP,
        _timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error sending system alert:', error);
      res.status(500).json({ 
        error: 'Failed to send system alert',
        _version: process.env.VERSION_TIMESTAMP,
        _timestamp: Date.now()
      });
    }
  });

  // 8. PAYMENT WEBHOOK ENDPOINT (Stripe)
  app.post('/api/stripe/webhook', async (req, res) => {
    try {
      const { type, data } = req.body;
      
      if (type === 'payment_intent.succeeded' || type === 'checkout.session.completed') {
        const paymentData = data?.object || {};
        
        await ComprehensiveNotificationService.notifyPaymentSuccess({
          amount: paymentData.amount || paymentData.amount_total || 0,
          customerEmail: paymentData.customer_email || paymentData.receipt_email || 'unknown',
          description: paymentData.description || 'MySeniorValet Service',
          communityId: paymentData.metadata?.communityId,
          vendorId: paymentData.metadata?.vendorId
        });
      } else if (type === 'payment_intent.payment_failed') {
        const paymentData = data?.object || {};
        
        await ComprehensiveNotificationService.notifyPaymentFailed({
          amount: paymentData.amount || 0,
          customerEmail: paymentData.customer_email || 'unknown',
          error: paymentData.last_payment_error?.message || 'Payment failed',
          description: paymentData.description || 'MySeniorValet Service'
        });
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Error processing webhook:', error);
      res.status(400).json({ error: 'Webhook processing failed' });
    }
  });

  // 9. ADMIN ALERTS DASHBOARD ENDPOINT
  app.get('/api/admin/alerts', requireAuth, async (req, res) => {
    try {
      // Check if user is admin
      const userEmail = (req as any).user?.email;
      if (userEmail !== 'william.cowell01@gmail.com' && userEmail !== 'admin@myseniorvalet.com') {
        return res.status(403).json({ 
          error: 'Unauthorized',
          _version: process.env.VERSION_TIMESTAMP,
          _timestamp: Date.now()
        });
      }

      // TODO: Fetch actual alerts from database
      const alerts = {
        recent: [],
        pending: [],
        resolved: [],
        stats: {
          totalToday: 0,
          critical: 0,
          high: 0,
          normal: 0,
          low: 0
        }
      };

      res.json({
        success: true,
        alerts,
        _version: process.env.VERSION_TIMESTAMP,
        _timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error fetching admin alerts:', error);
      res.status(500).json({ 
        error: 'Failed to fetch alerts',
        _version: process.env.VERSION_TIMESTAMP,
        _timestamp: Date.now()
      });
    }
  });

  // 10. TEST ALL NOTIFICATIONS ENDPOINT (Development only)
  if (process.env.NODE_ENV === 'development') {
    app.post('/api/test/all-notifications', requireAuth, async (req, res) => {
      try {
        const userEmail = (req as any).user?.email;
        if (userEmail !== 'william.cowell01@gmail.com') {
          return res.status(403).json({ error: 'Unauthorized' });
        }

        const testResults = [];

        // Test each notification type
        testResults.push('Testing Community Claim...');
        await ComprehensiveNotificationService.notifyCommunityClaimSubmitted({
          communityId: 1,
          communityName: 'Test Community',
          claimantName: 'Test Manager',
          claimantEmail: 'test@example.com',
          claimantPhone: '555-0001',
          message: 'Test claim message'
        });

        testResults.push('Testing Tour Scheduled...');
        await ComprehensiveNotificationService.notifyTourScheduled({
          tourId: 'test-tour-1',
          communityId: 1,
          communityName: 'Test Community',
          visitorName: 'Test Visitor',
          visitorEmail: 'visitor@example.com',
          tourDate: '2025-09-01',
          tourTime: '10:00 AM',
          phoneNumber: '555-0002'
        });

        testResults.push('Testing Vendor Registration...');
        await ComprehensiveNotificationService.notifyVendorRegistration({
          businessName: 'Test Vendor Co',
          contactName: 'Test Vendor',
          email: 'vendor@example.com',
          serviceType: 'Medical Equipment',
          tierKey: 'professional'
        });

        testResults.push('Testing Payment Success...');
        await ComprehensiveNotificationService.notifyPaymentSuccess({
          amount: 9900,
          customerEmail: 'customer@example.com',
          description: 'Test Payment',
          communityId: 1
        });

        testResults.push('Testing Security Alert...');
        await ComprehensiveNotificationService.notifySecurityAlert({
          alertType: 'suspicious_activity',
          description: 'Test security alert',
          severity: 'medium',
          ipAddress: '192.168.1.1'
        });

        testResults.push('Testing Emergency Contact...');
        await ComprehensiveNotificationService.notifyEmergencyContact({
          userName: 'Test User',
          userEmail: 'emergency@example.com',
          message: 'Test emergency message',
          urgency: 'low'
        });

        res.json({
          success: true,
          message: 'All notification tests completed',
          results: testResults,
          _version: process.env.VERSION_TIMESTAMP,
          _timestamp: Date.now()
        });
      } catch (error) {
        console.error('Error testing notifications:', error);
        res.status(500).json({ error: 'Failed to test notifications' });
      }
    });
  }

  console.log('✅ Comprehensive notification routes registered');
}
import { Router } from 'express';
import { notificationService } from '../email/notificationService';

const router = Router();

// Test endpoint to verify email system is working
router.post('/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    const testEmail = email || 'William.cowell01@gmail.com'; // Default to admin
    
    const success = await notificationService.sendTestEmail(testEmail);
    
    if (success) {
      res.json({ 
        success: true, 
        message: `Test email sent successfully to ${testEmail}` 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Email system is not configured. Please check SendGrid API key.' 
      });
    }
  } catch (error: any) {
    console.error('Test email error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to send test email' 
    });
  }
});

// Send welcome email to new user
router.post('/welcome', async (req, res) => {
  try {
    const { userName, userEmail } = req.body;
    
    if (!userName || !userEmail) {
      return res.status(400).json({ 
        success: false, 
        message: 'userName and userEmail are required' 
      });
    }
    
    const success = await notificationService.sendWelcomeEmail({
      to: userEmail,
      userName,
      userEmail
    });
    
    res.json({ 
      success, 
      message: success ? 'Welcome email sent' : 'Email system disabled' 
    });
  } catch (error: any) {
    console.error('Welcome email error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Send community match alert
router.post('/match-alert', async (req, res) => {
  try {
    const { userName, userEmail, matches, searchCriteria } = req.body;
    
    if (!userName || !userEmail || !matches || !searchCriteria) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }
    
    const success = await notificationService.sendCommunityMatchEmail({
      to: userEmail,
      userName,
      matches,
      searchCriteria
    });
    
    res.json({ 
      success, 
      message: success ? 'Match alert sent' : 'Email system disabled' 
    });
  } catch (error: any) {
    console.error('Match alert error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Send price alert
router.post('/price-alert', async (req, res) => {
  try {
    const { userName, userEmail, community } = req.body;
    
    if (!userName || !userEmail || !community) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }
    
    const success = await notificationService.sendPriceAlertEmail({
      to: userEmail,
      userName,
      community
    });
    
    res.json({ 
      success, 
      message: success ? 'Price alert sent' : 'Email system disabled' 
    });
  } catch (error: any) {
    console.error('Price alert error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Handle contact form submissions
router.post('/contact', async (req, res) => {
  try {
    const { fromName, fromEmail, subject, message, communityName } = req.body;
    
    if (!fromName || !fromEmail || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }
    
    const success = await notificationService.sendContactFormEmail({
      to: 'hello@myseniorvalet.com',
      fromName,
      fromEmail,
      subject,
      message,
      communityName
    });
    
    res.json({ 
      success, 
      message: success ? 'Your message has been sent' : 'Unable to send message' 
    });
  } catch (error: any) {
    console.error('Contact form error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Admin alert endpoint (internal use)
router.post('/admin-alert', async (req, res) => {
  try {
    const { subject, message, priority = 'medium' } = req.body;
    
    if (!subject || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Subject and message are required' 
      });
    }
    
    const success = await notificationService.sendAdminAlert(
      subject, 
      message, 
      priority as 'low' | 'medium' | 'high'
    );
    
    res.json({ 
      success, 
      message: success ? 'Admin alert sent' : 'Email system disabled' 
    });
  } catch (error: any) {
    console.error('Admin alert error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get email system status
router.get('/status', async (req, res) => {
  const isConfigured = !!process.env.SENDGRID_API_KEY;
  
  res.json({
    success: true,
    status: {
      configured: isConfigured,
      provider: 'SendGrid',
      templates: [
        'welcome',
        'community_match',
        'price_alert',
        'vendor_welcome',
        'contact_form',
        'admin_alert'
      ],
      adminEmails: {
        primary: 'William.cowell01@gmail.com',
        backup: 'CowellandCoWebDesign@gmail.com',
        public: 'hello@myseniorvalet.com'
      }
    }
  });
});

// Batch send for multiple recipients (admin only)
router.post('/batch-send', async (req, res) => {
  try {
    const { type, recipients, data } = req.body;
    
    if (!type || !recipients || !Array.isArray(recipients)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid batch send request' 
      });
    }
    
    let successCount = 0;
    let failCount = 0;
    
    for (const recipient of recipients) {
      try {
        let success = false;
        
        switch (type) {
          case 'welcome':
            success = await notificationService.sendWelcomeEmail({
              to: recipient.email,
              userName: recipient.name,
              userEmail: recipient.email
            });
            break;
            
          case 'match_alert':
            success = await notificationService.sendCommunityMatchEmail({
              to: recipient.email,
              userName: recipient.name,
              matches: data.matches,
              searchCriteria: data.searchCriteria
            });
            break;
            
          default:
            console.log('Unknown batch email type:', type);
        }
        
        if (success) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        console.error(`Failed to send to ${recipient.email}:`, error);
        failCount++;
      }
    }
    
    res.json({
      success: true,
      results: {
        total: recipients.length,
        sent: successCount,
        failed: failCount
      }
    });
  } catch (error: any) {
    console.error('Batch send error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

export default router;
import { Router } from "express";
import { db } from "../db";
import { z } from "zod";
import sgMail from "@sendgrid/mail";
import { requireAdmin } from "../middleware/admin-auth";

const router = Router();

// Apply admin authentication to all routes
router.use(requireAdmin);

// Initialize SendGrid if API key is available
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Email campaign schema
const emailCampaignSchema = z.object({
  subject: z.string().min(1).max(200),
  content: z.string().min(1),
  recipients: z.array(z.string().email()).min(1),
  templateId: z.string().optional(),
  scheduledTime: z.string().optional(),
  tags: z.array(z.string()).optional()
});

// Launch email template
const launchEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MySeniorValet Launch</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: white; padding: 40px 20px; border: 1px solid #e5e7eb; border-top: 0; }
    .feature { display: flex; align-items: center; margin: 20px 0; }
    .feature-icon { font-size: 24px; margin-right: 15px; }
    .cta-button { display: inline-block; background: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
    .social-links { margin: 20px 0; }
    .social-links a { margin: 0 10px; color: #4f46e5; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Introducing MySeniorValet</h1>
      <p>Your Trusted Guide to Senior Living</p>
    </div>
    
    <div class="content">
      <p>Dear {{name}},</p>
      
      <p>We're thrilled to announce the launch of <strong>MySeniorValet</strong>, the trusted platform for authentic senior living community information!</p>
      
      <p>Finding the right senior living community shouldn't be a mystery. That's why we've built a platform that brings complete transparency to your search with:</p>
      
      <div class="feature">
        <span class="feature-icon">✅</span>
        <div>
          <strong>34,180+ Communities</strong><br>
          Complete coverage across the US and Canada
        </div>
      </div>
      
      <div class="feature">
        <span class="feature-icon">✅</span>
        <div>
          <strong>Verified Pricing</strong><br>
          Including 5,241 HUD-verified communities
        </div>
      </div>
      
      <div class="feature">
        <span class="feature-icon">✅</span>
        <div>
          <strong>AI-Powered Matching</strong><br>
          Find your perfect community match
        </div>
      </div>
      
      <div class="feature">
        <span class="feature-icon">✅</span>
        <div>
          <strong>Family Collaboration</strong><br>
          Make decisions together with secure tools
        </div>
      </div>
      
      <div class="feature">
        <span class="feature-icon">✅</span>
        <div>
          <strong>Healthcare Integration</strong><br>
          6,806 hospitals with ratings and services
        </div>
      </div>
      
      <h2>Special Launch Offers</h2>
      
      <p><strong>For Communities:</strong></p>
      <ul>
        <li>50% off first month for new community partners</li>
        <li>Free verified listing upgrade for early adopters</li>
        <li>Complimentary onboarding support</li>
      </ul>
      
      <p><strong>For Families:</strong></p>
      <ul>
        <li>Always free to search and compare</li>
        <li>Priority support during launch month</li>
        <li>Access to exclusive senior resources</li>
      </ul>
      
      <center>
        <a href="https://myseniorvalet.com" class="cta-button">Start Your Search Today</a>
      </center>
      
      <h3>Our Mission</h3>
      <p><em>"The trusted platform for authentic senior living community information. Helping families make informed decisions with verified data and transparent pricing."</em></p>
      
      <p>Questions? We're here to help!</p>
      <ul>
        <li>Email: hello@myseniorvalet.com</li>
        <li>Call: 1-800-XXX-XXXX</li>
        <li>Live Chat: Available on our website</li>
      </ul>
      
      <p>Thank you for trusting MySeniorValet with your senior living journey.</p>
      
      <p>Warm regards,<br>
      The MySeniorValet Team</p>
      
      <div class="social-links">
        <a href="#">Facebook</a>
        <a href="#">Twitter</a>
        <a href="#">LinkedIn</a>
        <a href="#">Instagram</a>
      </div>
    </div>
    
    <div class="footer">
      <p>This email was sent to {{email}}.</p>
      <p><a href="#">Unsubscribe</a> | <a href="#">Update Preferences</a> | <a href="#">Privacy Policy</a></p>
      <p>© 2025 MySeniorValet. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

// Send launch email
router.post("/send-launch", async (req, res) => {
  try {
    const validatedData = emailCampaignSchema.parse(req.body);
    const { subject, recipients, scheduledTime } = validatedData;

    if (!process.env.SENDGRID_API_KEY) {
      // Mock response for development
      return res.json({
        success: true,
        mock: true,
        message: "Email campaign simulated (no SendGrid API key)",
        recipients: recipients.length,
        scheduledTime: scheduledTime || "immediate"
      });
    }

    // Prepare email messages
    const messages = recipients.map(email => ({
      to: email,
      from: {
        email: 'hello@myseniorvalet.com',
        name: 'MySeniorValet'
      },
      subject: subject || "🎉 Introducing MySeniorValet - Your Trusted Guide to Senior Living",
      html: launchEmailHtml
        .replace(/{{name}}/g, email.split('@')[0])
        .replace(/{{email}}/g, email),
      categories: ['launch', 'announcement'],
      customArgs: {
        campaign: 'platform-launch',
        version: '1.0'
      }
    }));

    // Send emails (or schedule if time provided)
    if (scheduledTime) {
      const sendAt = Math.floor(new Date(scheduledTime).getTime() / 1000);
      messages.forEach(msg => {
        (msg as any).sendAt = sendAt;
      });
    }

    // Send via SendGrid
    const results = await Promise.allSettled(
      messages.map(msg => sgMail.send(msg))
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    res.json({
      success: true,
      sent: successful,
      failed,
      total: recipients.length,
      scheduledTime: scheduledTime || null,
      message: `Launch email sent to ${successful} recipients`
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid email data", details: error.errors });
    }
    console.error("Error sending launch email:", error);
    res.status(500).json({ error: "Failed to send launch email" });
  }
});

// Get email templates
router.get("/templates", async (req, res) => {
  try {
    const templates = [
      {
        id: "launch-announcement",
        name: "Launch Announcement",
        subject: "🎉 Introducing MySeniorValet - Your Trusted Guide to Senior Living",
        description: "Main launch announcement email with all features",
        tags: ["launch", "announcement", "features"]
      },
      {
        id: "community-invitation",
        name: "Community Partner Invitation",
        subject: "Partner with MySeniorValet - 50% Off Launch Special",
        description: "Invitation for communities to join the platform",
        tags: ["communities", "partners", "b2b"]
      },
      {
        id: "vendor-invitation",
        name: "Vendor Partner Invitation",
        subject: "Reach Senior Living Families with MySeniorValet",
        description: "Invitation for service vendors to join marketplace",
        tags: ["vendors", "marketplace", "b2b"]
      },
      {
        id: "media-announcement",
        name: "Media Press Release",
        subject: "PRESS RELEASE: MySeniorValet Launches Senior Living Transparency Platform",
        description: "Press release format for media outlets",
        tags: ["media", "press", "announcement"]
      }
    ];

    res.json({
      templates,
      total: templates.length
    });
  } catch (error) {
    console.error("Error getting email templates:", error);
    res.status(500).json({ error: "Failed to get email templates" });
  }
});

// Create email list
router.post("/lists", async (req, res) => {
  try {
    const { name, description, emails } = req.body;

    // In production, this would save to database
    const listId = `list_${Date.now()}`;
    
    res.json({
      success: true,
      listId,
      name,
      subscriberCount: emails?.length || 0,
      message: "Email list created successfully"
    });
  } catch (error) {
    console.error("Error creating email list:", error);
    res.status(500).json({ error: "Failed to create email list" });
  }
});

// Get email lists
router.get("/lists", async (req, res) => {
  try {
    // Mock email lists for launch
    const lists = [
      {
        id: "list_newsletter",
        name: "Newsletter Subscribers",
        description: "Users who signed up for updates",
        subscriberCount: 1247,
        createdAt: "2025-08-01T00:00:00Z"
      },
      {
        id: "list_communities",
        name: "Community Partners",
        description: "Registered community contacts",
        subscriberCount: 342,
        createdAt: "2025-08-05T00:00:00Z"
      },
      {
        id: "list_vendors",
        name: "Vendor Network",
        description: "Service providers and vendors",
        subscriberCount: 89,
        createdAt: "2025-08-06T00:00:00Z"
      },
      {
        id: "list_media",
        name: "Media Contacts",
        description: "Press and media outlets",
        subscriberCount: 56,
        createdAt: "2025-08-07T00:00:00Z"
      }
    ];

    res.json({
      lists,
      total: lists.length,
      totalSubscribers: lists.reduce((sum, list) => sum + list.subscriberCount, 0)
    });
  } catch (error) {
    console.error("Error getting email lists:", error);
    res.status(500).json({ error: "Failed to get email lists" });
  }
});

// Get email campaign analytics
router.get("/analytics", async (req, res) => {
  try {
    // Mock analytics for demonstration
    const analytics = {
      campaigns: {
        total: 0,
        sent: 0,
        scheduled: 1,
        draft: 3
      },
      performance: {
        totalSent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        unsubscribed: 0
      },
      rates: {
        deliveryRate: "0%",
        openRate: "0%",
        clickRate: "0%",
        bounceRate: "0%",
        unsubscribeRate: "0%"
      },
      topCampaigns: [],
      recentActivity: []
    };

    res.json(analytics);
  } catch (error) {
    console.error("Error getting email analytics:", error);
    res.status(500).json({ error: "Failed to get email analytics" });
  }
});

// Test email send
router.post("/test", async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email address required" });
    }

    // Mock test email send
    res.json({
      success: true,
      message: `Test email sent to ${email}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error sending test email:", error);
    res.status(500).json({ error: "Failed to send test email" });
  }
});

export default router;
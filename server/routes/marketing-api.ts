import { Express, Request, Response, Router } from 'express';
import { db } from '../db';
import { 
  marketingCampaigns,
  emailCampaigns,
  leadWorkflows,
  workflowEnrollments,
  virtualTours,
  tourAnalytics,
  socialMediaPosts,
  marketingLeads,
  roiTracking,
  automationRules
} from '@shared/schema';
import { eq, and, desc, sql, gte, lte } from 'drizzle-orm';
import { requireAuth, requireRole } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

// ==================== DASHBOARD & OCCUPANCY ====================

// Get marketing dashboard data
router.get('/:communityId/dashboard', 
  apiLimiter,
  requireAuth,
  requireRole(['community_admin', 'super_admin']),
  async (req: Request, res: Response) => {
    try {
      // Mock data for marketing dashboard
      const dashboardData = {
        occupancy: {
          rate: 92,
          available: 8,
          occupied: 92,
          reserved: 3
        },
        leads: {
          active: 47,
          total: 47,
          byStage: [12, 15, 8, 7, 5],
          list: [
            { id: 1, name: 'John Smith', phone: '(555) 123-4567', stage: 'New', source: 'Website', daysInStage: 2 },
            { id: 2, name: 'Mary Johnson', phone: '(555) 234-5678', stage: 'Contacted', source: 'Referral', daysInStage: 4 },
            { id: 3, name: 'Robert Davis', phone: '(555) 345-6789', stage: 'Tour Scheduled', source: 'Google', daysInStage: 1 },
            { id: 4, name: 'Linda Wilson', phone: '(555) 456-7890', stage: 'Application', source: 'Event', daysInStage: 6 },
            { id: 5, name: 'James Brown', phone: '(555) 567-8901', stage: 'Move-In Ready', source: 'Social', daysInStage: 3 }
          ]
        },
        tours: {
          thisWeek: 8,
          today: [
            { id: 1, time: '10:00 AM', name: 'Sarah Miller', type: 'in-person' },
            { id: 2, time: '2:00 PM', name: 'Tom Anderson', type: 'virtual' },
            { id: 3, time: '4:00 PM', name: 'Jennifer White', type: 'in-person' }
          ],
          byDay: { Mon: 2, Tue: 1, Wed: 3, Thu: 1, Fri: 1 }
        },
        conversion: {
          rate: 24
        },
        units: {
          available: 8,
          occupied: 92,
          reserved: 3,
          list: [
            { id: 101, number: '101', status: 'occupied', type: 'Studio', squareFeet: 450, price: 3200 },
            { id: 102, number: '102', status: 'available', type: '1 Bedroom', squareFeet: 650, price: 4100 },
            { id: 103, number: '103', status: 'reserved', type: '2 Bedroom', squareFeet: 850, price: 5200, moveInDate: 'Oct 15' },
            { id: 104, number: '104', status: 'occupied', type: 'Studio', squareFeet: 450, price: 3200 },
            { id: 105, number: '105', status: 'available', type: '1 Bedroom', squareFeet: 650, price: 4100 },
            { id: 106, number: '106', status: 'occupied', type: '2 Bedroom', squareFeet: 850, price: 5200 },
            { id: 201, number: '201', status: 'available', type: 'Studio', squareFeet: 450, price: 3400 },
            { id: 202, number: '202', status: 'occupied', type: '1 Bedroom', squareFeet: 650, price: 4300 }
          ]
        },
        moveIns: [
          { id: 1, resident: 'Patricia Martinez', unit: '103', date: 'Oct 15', status: 'Confirmed' },
          { id: 2, resident: 'Michael Thompson', unit: '207', date: 'Oct 22', status: 'Pending' }
        ],
        moveOuts: [
          { id: 1, resident: 'Dorothy Clark', unit: '305', date: 'Oct 31', reason: 'Health' },
          { id: 2, resident: 'Charles Lewis', unit: '412', date: 'Nov 15', reason: 'Financial' }
        ],
        campaigns: [
          { id: 1, name: 'Fall Open House', type: 'Email', status: 'active', sent: 450, openRate: 32, clickRate: 8, conversions: 3, progress: 75 },
          { id: 2, name: 'Referral Program', type: 'Multi-channel', status: 'active', sent: 200, openRate: 45, clickRate: 12, conversions: 5, progress: 60 },
          { id: 3, name: 'Holiday Special', type: 'Social', status: 'scheduled', sent: 0, openRate: 0, clickRate: 0, conversions: 0, progress: 0 }
        ],
        referralSources: [
          { name: 'Website', count: 142, percentage: 35, color: 'bg-blue-500' },
          { name: 'Referrals', count: 87, percentage: 22, color: 'bg-green-500' },
          { name: 'Google Ads', count: 63, percentage: 16, color: 'bg-yellow-500' },
          { name: 'Social Media', count: 41, percentage: 10, color: 'bg-purple-500' },
          { name: 'Events', count: 23, percentage: 6, color: 'bg-pink-500' },
          { name: 'Other', count: 44, percentage: 11, color: 'bg-gray-500' }
        ]
      };

      res.json(dashboardData);
    } catch (error) {
      console.error('Error fetching marketing dashboard:', error);
      res.status(500).json({ error: 'Failed to fetch marketing data' });
    }
  }
);

// Get available units for families
router.get('/:communityId/available-units',
  apiLimiter,
  async (req: Request, res: Response) => {
    try {
      // Public endpoint - no auth required
      const availableUnits = {
        units: [
          {
            id: 102,
            name: 'Sunny Garden View Suite',
            type: '1 Bedroom Apartment',
            floor: '1st Floor',
            squareFeet: 650,
            price: 4100,
            features: ['Private Bathroom', 'Kitchenette', 'Emergency Call System', 'Garden View'],
            imageUrl: null,
            virtualTourUrl: '/virtual-tours/102'
          },
          {
            id: 105,
            name: 'Cozy Corner Studio',
            type: 'Studio Apartment',
            floor: '1st Floor', 
            squareFeet: 450,
            price: 3200,
            features: ['Private Bathroom', 'Emergency Call System', 'Street View'],
            imageUrl: null,
            virtualTourUrl: '/virtual-tours/105'
          },
          {
            id: 201,
            name: 'Premium Mountain View',
            type: '2 Bedroom Suite',
            floor: '2nd Floor',
            squareFeet: 850,
            price: 5400,
            features: ['Full Kitchen', 'Balcony', 'Walk-in Closet', 'Mountain View'],
            imageUrl: null,
            virtualTourUrl: '/virtual-tours/201'
          }
        ],
        waitlistCount: 12,
        averageWaitTime: '2-3 months'
      };

      res.json(availableUnits);
    } catch (error) {
      console.error('Error fetching available units:', error);
      res.status(500).json({ error: 'Failed to fetch available units' });
    }
  }
);

// Update unit status
router.put('/:communityId/units/:unitId',
  apiLimiter,
  requireAuth,
  requireRole(['community_admin', 'super_admin']),
  async (req: Request, res: Response) => {
    try {
      const { communityId, unitId } = req.params;
      const updateData = req.body;

      // Mock updating unit status
      const updatedUnit = {
        id: unitId,
        communityId,
        ...updateData,
        updatedAt: new Date().toISOString(),
        updatedBy: req.user?.email
      };

      res.json({ success: true, unit: updatedUnit });
    } catch (error) {
      console.error('Error updating unit:', error);
      res.status(500).json({ error: 'Failed to update unit' });
    }
  }
);

// Get tour analytics
router.get('/:communityId/analytics/tours',
  apiLimiter,
  requireAuth,
  requireRole(['community_admin', 'super_admin']),
  async (req: Request, res: Response) => {
    try {
      const analytics = {
        totalTours: 89,
        completed: 67,
        noShows: 12,
        cancelled: 10,
        showRate: 85,
        conversionRate: 32,
        averageFollowUps: 3.2,
        averageCloseTime: 7,
        byType: {
          inPerson: { count: 56, conversion: 38 },
          virtual: { count: 33, conversion: 24 }
        },
        bySource: {
          website: { count: 45, conversion: 26 },
          referral: { count: 28, conversion: 42 },
          ads: { count: 16, conversion: 18 }
        }
      };

      res.json(analytics);
    } catch (error) {
      console.error('Error fetching tour analytics:', error);
      res.status(500).json({ error: 'Failed to fetch tour analytics' });
    }
  }
);

// Get occupancy trends
router.get('/:communityId/analytics/occupancy',
  apiLimiter,
  requireAuth,
  requireRole(['community_admin', 'super_admin']),
  async (req: Request, res: Response) => {
    try {
      const trends = {
        current: 92,
        target: 95,
        average: 90,
        history: [
          { month: 'Jan', rate: 88 },
          { month: 'Feb', rate: 89 },
          { month: 'Mar', rate: 90 },
          { month: 'Apr', rate: 91 },
          { month: 'May', rate: 90 },
          { month: 'Jun', rate: 92 }
        ],
        forecast: [
          { month: 'Jul', rate: 93 },
          { month: 'Aug', rate: 94 },
          { month: 'Sep', rate: 94 }
        ],
        byUnitType: {
          studio: { occupied: 18, total: 20, rate: 90 },
          oneBedroom: { occupied: 45, total: 50, rate: 90 },
          twoBedroom: { occupied: 29, total: 30, rate: 97 }
        }
      };

      res.json(trends);
    } catch (error) {
      console.error('Error fetching occupancy trends:', error);
      res.status(500).json({ error: 'Failed to fetch occupancy trends' });
    }
  }
);

// ==================== EMAIL CAMPAIGNS ====================

// Get all email campaigns for a community
router.get('/campaigns/email', async (req: Request, res: Response) => {
  try {
    const { communityId } = req.query;
    
    if (!communityId) {
      return res.status(400).json({ error: 'Community ID required' });
    }

    const campaigns = await db
      .select()
      .from(emailCampaigns)
      .where(eq(emailCampaigns.communityId, Number(communityId)))
      .orderBy(desc(emailCampaigns.createdAt));

    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching email campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch email campaigns' });
  }
});

// Create new email campaign
router.post('/campaigns/email', async (req: Request, res: Response) => {
  try {
    const campaignData = req.body;
    
    const [campaign] = await db
      .insert(emailCampaigns)
      .values(campaignData)
      .returning();

    res.status(201).json(campaign);
  } catch (error) {
    console.error('Error creating email campaign:', error);
    res.status(500).json({ error: 'Failed to create email campaign' });
  }
});

// Send email campaign
router.post('/campaigns/email/:id/send', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Update campaign status to sending
    const [campaign] = await db
      .update(emailCampaigns)
      .set({ 
        status: 'sending',
        sentAt: new Date()
      })
      .where(eq(emailCampaigns.id, Number(id)))
      .returning();

    // TODO: Integrate with SendGrid to actually send emails
    
    // Update to sent status after processing
    await db
      .update(emailCampaigns)
      .set({ status: 'sent' })
      .where(eq(emailCampaigns.id, Number(id)));

    res.json({ message: 'Campaign sent successfully', campaign });
  } catch (error) {
    console.error('Error sending email campaign:', error);
    res.status(500).json({ error: 'Failed to send email campaign' });
  }
});

// ==================== LEAD WORKFLOWS ====================

// Get all lead workflows
router.get('/workflows', async (req: Request, res: Response) => {
  try {
    const { communityId } = req.query;
    
    if (!communityId) {
      return res.status(400).json({ error: 'Community ID required' });
    }

    const workflows = await db
      .select()
      .from(leadWorkflows)
      .where(eq(leadWorkflows.communityId, Number(communityId)))
      .orderBy(desc(leadWorkflows.createdAt));

    res.json(workflows);
  } catch (error) {
    console.error('Error fetching workflows:', error);
    res.status(500).json({ error: 'Failed to fetch workflows' });
  }
});

// Create new workflow
router.post('/workflows', async (req: Request, res: Response) => {
  try {
    const workflowData = req.body;
    
    const [workflow] = await db
      .insert(leadWorkflows)
      .values(workflowData)
      .returning();

    res.json(workflow);
  } catch (error) {
    console.error('Error creating workflow:', error);
    res.status(500).json({ error: 'Failed to create workflow' });
  }
});

// Enroll lead in workflow
router.post('/workflows/:id/enroll', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { leadId } = req.body;
    
    const [enrollment] = await db
      .insert(workflowEnrollments)
      .values({
        workflowId: Number(id),
        leadId: Number(leadId)
      })
      .returning();

    res.json(enrollment);
  } catch (error) {
    console.error('Error enrolling in workflow:', error);
    res.status(500).json({ error: 'Failed to enroll in workflow' });
  }
});

// ==================== VIRTUAL TOURS ====================

// Get all virtual tours
router.get('/tours', async (req: Request, res: Response) => {
  try {
    const { communityId } = req.query;
    
    if (!communityId) {
      return res.status(400).json({ error: 'Community ID required' });
    }

    const tours = await db
      .select()
      .from(virtualTours)
      .where(eq(virtualTours.communityId, Number(communityId)))
      .orderBy(desc(virtualTours.createdAt));

    res.json(tours);
  } catch (error) {
    console.error('Error fetching virtual tours:', error);
    res.status(500).json({ error: 'Failed to fetch virtual tours' });
  }
});

// Create new virtual tour
router.post('/tours', async (req: Request, res: Response) => {
  try {
    const tourData = req.body;
    
    const [tour] = await db
      .insert(virtualTours)
      .values(tourData)
      .returning();

    res.json(tour);
  } catch (error) {
    console.error('Error creating virtual tour:', error);
    res.status(500).json({ error: 'Failed to create virtual tour' });
  }
});

// Track tour view
router.post('/tours/:id/view', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const analyticsData = req.body;
    
    // Update view count
    await db
      .update(virtualTours)
      .set({ 
        viewCount: sql`${virtualTours.viewCount} + 1`
      })
      .where(eq(virtualTours.id, Number(id)));
    
    // Record analytics
    const [analytics] = await db
      .insert(tourAnalytics)
      .values({
        ...analyticsData,
        tourId: Number(id)
      })
      .returning();

    res.json(analytics);
  } catch (error) {
    console.error('Error tracking tour view:', error);
    res.status(500).json({ error: 'Failed to track tour view' });
  }
});

// ==================== SOCIAL MEDIA ====================

// Get scheduled social media posts
router.get('/social-media/posts', async (req: Request, res: Response) => {
  try {
    const { communityId } = req.query;
    
    if (!communityId) {
      return res.status(400).json({ error: 'Community ID required' });
    }

    const posts = await db
      .select()
      .from(socialMediaPosts)
      .where(eq(socialMediaPosts.communityId, Number(communityId)))
      .orderBy(desc(socialMediaPosts.scheduledAt));

    res.json(posts);
  } catch (error) {
    console.error('Error fetching social media posts:', error);
    res.status(500).json({ error: 'Failed to fetch social media posts' });
  }
});

// Schedule new social media post
router.post('/social-media/posts', async (req: Request, res: Response) => {
  try {
    const postData = req.body;
    
    const [post] = await db
      .insert(socialMediaPosts)
      .values(postData)
      .returning();

    res.json(post);
  } catch (error) {
    console.error('Error creating social media post:', error);
    res.status(500).json({ error: 'Failed to create social media post' });
  }
});

// Publish social media post
router.post('/social-media/posts/:id/publish', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // TODO: Integrate with social media APIs (Facebook, Twitter, LinkedIn, etc.)
    
    const [post] = await db
      .update(socialMediaPosts)
      .set({ 
        status: 'published',
        publishedAt: new Date()
      })
      .where(eq(socialMediaPosts.id, Number(id)))
      .returning();

    res.json({ message: 'Post published successfully', post });
  } catch (error) {
    console.error('Error publishing social media post:', error);
    res.status(500).json({ error: 'Failed to publish social media post' });
  }
});

// ==================== MARKETING LEADS ====================

// Get all marketing leads
router.get('/leads', async (req: Request, res: Response) => {
  try {
    const { communityId } = req.query;
    
    if (!communityId) {
      return res.status(400).json({ error: 'Community ID required' });
    }

    const leads = await db
      .select()
      .from(marketingLeads)
      .where(eq(marketingLeads.communityId, Number(communityId)))
      .orderBy(desc(marketingLeads.createdAt));

    res.json(leads);
  } catch (error) {
    console.error('Error fetching marketing leads:', error);
    res.status(500).json({ error: 'Failed to fetch marketing leads' });
  }
});

// Create new lead
router.post('/leads', async (req: Request, res: Response) => {
  try {
    const leadData = req.body;
    
    const [lead] = await db
      .insert(marketingLeads)
      .values(leadData)
      .returning();

    res.json(lead);
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({ error: 'Failed to create lead' });
  }
});

// Update lead stage
router.patch('/leads/:id/stage', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { stage } = req.body;
    
    const updateData: any = { stage };
    
    if (stage === 'converted') {
      updateData.convertedAt = new Date();
    }
    
    const [lead] = await db
      .update(marketingLeads)
      .set(updateData)
      .where(eq(marketingLeads.id, Number(id)))
      .returning();

    res.json(lead);
  } catch (error) {
    console.error('Error updating lead stage:', error);
    res.status(500).json({ error: 'Failed to update lead stage' });
  }
});

// ==================== ROI TRACKING ====================

// Get ROI metrics
router.get('/roi', async (req: Request, res: Response) => {
  try {
    const { communityId, startDate, endDate } = req.query;
    
    if (!communityId) {
      return res.status(400).json({ error: 'Community ID required' });
    }

    let query = db
      .select()
      .from(roiTracking)
      .where(eq(roiTracking.communityId, Number(communityId)));
    
    if (startDate) {
      query = query.where(gte(roiTracking.date, startDate as string));
    }
    
    if (endDate) {
      query = query.where(lte(roiTracking.date, endDate as string));
    }

    const metrics = await query.orderBy(desc(roiTracking.date));

    // Calculate aggregate metrics
    const totals = metrics.reduce((acc, metric) => ({
      spend: acc.spend + (metric.spend || 0),
      revenue: acc.revenue + (metric.revenue || 0),
      impressions: acc.impressions + (metric.impressions || 0),
      clicks: acc.clicks + (metric.clicks || 0),
      conversions: acc.conversions + (metric.conversions || 0)
    }), { spend: 0, revenue: 0, impressions: 0, clicks: 0, conversions: 0 });

    const overallRoi = totals.spend > 0 
      ? ((totals.revenue - totals.spend) / totals.spend) * 100 
      : 0;

    res.json({
      metrics,
      totals: {
        ...totals,
        roi: overallRoi,
        costPerClick: totals.clicks > 0 ? totals.spend / totals.clicks : 0,
        costPerConversion: totals.conversions > 0 ? totals.spend / totals.conversions : 0,
        conversionRate: totals.clicks > 0 ? (totals.conversions / totals.clicks) * 100 : 0
      }
    });
  } catch (error) {
    console.error('Error fetching ROI metrics:', error);
    res.status(500).json({ error: 'Failed to fetch ROI metrics' });
  }
});

// Record ROI data
router.post('/roi', async (req: Request, res: Response) => {
  try {
    const roiData = req.body;
    
    // Calculate derived metrics
    const { spend, clicks, conversions, revenue } = roiData;
    
    const calculatedData = {
      ...roiData,
      costPerClick: clicks > 0 ? spend / clicks : null,
      costPerConversion: conversions > 0 ? spend / conversions : null,
      conversionRate: clicks > 0 ? (conversions / clicks) * 100 : null,
      roi: spend > 0 ? ((revenue - spend) / spend) * 100 : null
    };
    
    const [roi] = await db
      .insert(roiTracking)
      .values(calculatedData)
      .returning();

    res.json(roi);
  } catch (error) {
    console.error('Error recording ROI data:', error);
    res.status(500).json({ error: 'Failed to record ROI data' });
  }
});

// ==================== MARKETING CAMPAIGNS ====================

// Get all marketing campaigns
router.get('/campaigns', async (req: Request, res: Response) => {
  try {
    const { communityId } = req.query;
    
    if (!communityId) {
      return res.status(400).json({ error: 'Community ID required' });
    }

    const campaigns = await db
      .select()
      .from(marketingCampaigns)
      .where(eq(marketingCampaigns.communityId, Number(communityId)))
      .orderBy(desc(marketingCampaigns.createdAt));

    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching marketing campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch marketing campaigns' });
  }
});

// Create new marketing campaign
router.post('/campaigns', async (req: Request, res: Response) => {
  try {
    const campaignData = req.body;
    
    const [campaign] = await db
      .insert(marketingCampaigns)
      .values(campaignData)
      .returning();

    res.json(campaign);
  } catch (error) {
    console.error('Error creating marketing campaign:', error);
    res.status(500).json({ error: 'Failed to create marketing campaign' });
  }
});

// ==================== AUTOMATION RULES ====================

// Get automation rules
router.get('/automation', async (req: Request, res: Response) => {
  try {
    const { communityId } = req.query;
    
    if (!communityId) {
      return res.status(400).json({ error: 'Community ID required' });
    }

    const rules = await db
      .select()
      .from(automationRules)
      .where(eq(automationRules.communityId, Number(communityId)))
      .orderBy(desc(automationRules.priority));

    res.json(rules);
  } catch (error) {
    console.error('Error fetching automation rules:', error);
    res.status(500).json({ error: 'Failed to fetch automation rules' });
  }
});

// Create automation rule
router.post('/automation', async (req: Request, res: Response) => {
  try {
    const ruleData = req.body;
    
    const [rule] = await db
      .insert(automationRules)
      .values(ruleData)
      .returning();

    res.json(rule);
  } catch (error) {
    console.error('Error creating automation rule:', error);
    res.status(500).json({ error: 'Failed to create automation rule' });
  }
});

// Toggle automation rule
router.patch('/automation/:id/toggle', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [rule] = await db
      .select()
      .from(automationRules)
      .where(eq(automationRules.id, Number(id)));
    
    if (!rule) {
      return res.status(404).json({ error: 'Rule not found' });
    }
    
    const [updated] = await db
      .update(automationRules)
      .set({ isActive: !rule.isActive })
      .where(eq(automationRules.id, Number(id)))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error('Error toggling automation rule:', error);
    res.status(500).json({ error: 'Failed to toggle automation rule' });
  }
});

export default router;

// Export function to register routes on Express app
export function registerMarketingRoutes(app: Express) {
  app.use('/api/marketing', router);
  console.log('✅ Marketing & Occupancy routes registered');
}
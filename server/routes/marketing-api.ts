import { Request, Response, Router } from 'express';
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

const router = Router();

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
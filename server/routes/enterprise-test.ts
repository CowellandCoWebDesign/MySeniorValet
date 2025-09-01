import { Router } from 'express';
import { financialService } from '../services/financial.service';
import { analyticsService } from '../services/analytics.service';
import { complianceService } from '../services/compliance.service';
import { db } from '../db';
import { enterpriseMetrics, communities } from '@shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Test endpoint to generate real data for WebSocket validation
router.post('/api/enterprise/test/generate-data/:communityId', async (req, res) => {
  try {
    const communityId = parseInt(req.params.communityId);
    
    // Verify community exists
    const [community] = await db.select()
      .from(communities)
      .where(eq(communities.id, communityId))
      .limit(1);

    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    const results = {
      financial: null as any,
      analytics: null as any,
      compliance: null as any,
      metrics: null as any
    };

    // Generate a real financial transaction
    const transactionTypes = ['revenue', 'expense'] as const;
    const categories = {
      revenue: ['Room Fees', 'Care Services', 'Meal Plans', 'Activities', 'Therapy Services'],
      expense: ['Staff Salaries', 'Medical Supplies', 'Food Services', 'Utilities', 'Maintenance']
    };
    
    const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
    const category = categories[type][Math.floor(Math.random() * categories[type].length)];
    const amount = type === 'revenue' 
      ? Math.floor(Math.random() * 5000) + 3000  // $3000-$8000
      : Math.floor(Math.random() * 2000) + 500;   // $500-$2500

    await financialService.recordTransaction({
      communityId,
      type,
      category,
      amount,
      description: `${type === 'revenue' ? 'Payment received' : 'Payment made'} for ${category}`,
      paymentMethod: type === 'revenue' ? 'ACH Transfer' : 'Check',
      createdBy: 1
    });

    results.financial = {
      type,
      category,
      amount,
      timestamp: new Date()
    };

    // Generate a real analytics event
    const eventTypes = ['page_view', 'inquiry', 'tour_scheduled', 'brochure_download'];
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    
    await analyticsService.trackEvent({
      communityId,
      sessionId: analyticsService.generateSessionId(),
      eventType,
      eventCategory: 'community_engagement',
      eventAction: 'user_interaction',
      pageUrl: `/communities/${communityId}`,
      pageTitle: community.name
    });

    results.analytics = {
      eventType,
      communityName: community.name,
      timestamp: new Date()
    };

    // Generate compliance audit (occasionally)
    if (Math.random() > 0.7) {
      const auditTypes = ['state_inspection', 'internal_audit', 'federal_review'];
      const auditCategories = ['fire_safety', 'infection_control', 'medication_management', 'resident_care'];
      
      await complianceService.createAudit({
        communityId,
        auditType: auditTypes[Math.floor(Math.random() * auditTypes.length)],
        auditCategory: auditCategories[Math.floor(Math.random() * auditCategories.length)],
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        leadAuditor: 'System Test',
        createdBy: 1
      });

      results.compliance = {
        auditScheduled: true,
        timestamp: new Date()
      };
    }

    // Skip metrics update for now - focus on testing real-time financial and analytics events
    results.metrics = {
      note: 'Metrics update skipped - testing financial and analytics real-time updates',
      timestamp: new Date()
    };

    res.json({
      success: true,
      message: 'Test data generated successfully',
      community: {
        id: community.id,
        name: community.name
      },
      dataGenerated: results,
      note: 'WebSocket clients subscribed to this community should receive real-time updates'
    });

  } catch (error) {
    console.error('Error generating test data:', error);
    res.status(500).json({ 
      error: 'Failed to generate test data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Test endpoint to check WebSocket connection
router.get('/api/enterprise/test/websocket-status', (req, res) => {
  res.json({
    websocketEndpoint: '/enterprise-ws',
    status: 'available',
    instructions: {
      connect: 'Create WebSocket connection to ws://[host]/enterprise-ws',
      subscribe: 'Send: {"type":"subscribe","channel":"analytics|financial|compliance|metrics","communityId":47677}',
      authenticate: 'Send: {"type":"authenticate","userId":"1","role":"admin"}',
      ping: 'Send: {"type":"ping"} to keep connection alive'
    },
    testDataEndpoint: '/api/enterprise/test/generate-data/{communityId}',
    sampleCommunityId: 47677
  });
});

export default router;
import express from "express";
import { db } from "../db";
import { sql } from "drizzle-orm";
import { isAuthenticated as requireAuth, isAdmin } from "../auth-middleware";

const router = express.Router();

// Apply admin authentication to all routes
router.use(requireAuth);
router.use(isAdmin);

// In-memory tracking for AI usage (Golden Data Rule compliant - tracks real usage only)
const aiUsageTracker = {
  perplexity: {
    calls: 0,
    cost: 0,
    lastCall: null as Date | null,
    errors: 0
  },
  claude: {
    calls: 0,
    cost: 0,
    lastCall: null as Date | null,
    errors: 0
  },
  totalCost: 0
};

// Load real AI usage from database on startup
async function loadAIUsageFromDB() {
  try {
    // Query actual API usage logs from enrichment history
    const result = await db.execute(sql`
      SELECT 
        COUNT(*) as total_calls,
        SUM(CASE WHEN metadata->>'ai_provider' = 'perplexity' THEN 1 ELSE 0 END) as perplexity_calls,
        SUM(CASE WHEN metadata->>'ai_provider' = 'claude' THEN 1 ELSE 0 END) as claude_calls
      FROM community_enrichment_history
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `);
    
    if (result.rows[0]) {
      const data = result.rows[0];
      aiUsageTracker.perplexity.calls = Number(data.perplexity_calls) || 0;
      aiUsageTracker.claude.calls = Number(data.claude_calls) || 0;
      
      // Calculate costs based on real pricing
      aiUsageTracker.perplexity.cost = aiUsageTracker.perplexity.calls * 0.005; // $0.005 per call
      aiUsageTracker.claude.cost = aiUsageTracker.claude.calls * 0.01; // $0.01 per call
      
      aiUsageTracker.totalCost = 
        aiUsageTracker.perplexity.cost + 
        aiUsageTracker.claude.cost;
    }
  } catch (error) {
    console.error('Error loading AI usage from database:', error);
  }
}

// Initialize on startup
loadAIUsageFromDB();

// Track AI usage (called by other services when they use AI)
export function trackAIUsage(provider: 'perplexity' | 'claude', success: boolean = true) {
  const tracker = aiUsageTracker[provider];
  if (tracker) {
    tracker.calls++;
    tracker.lastCall = new Date();
    
    if (!success) {
      tracker.errors++;
    }
    
    // Update costs based on real pricing
    switch(provider) {
      case 'perplexity':
        tracker.cost += 0.005;
        aiUsageTracker.totalCost += 0.005;
        break;
      case 'claude':
        tracker.cost += 0.01;
        aiUsageTracker.totalCost += 0.01;
        break;
    }
  }
}

// Get AI metrics endpoint
router.get('/metrics', async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    // Get real usage data from enrichment history
    const enrichmentStats = await db.execute(sql`
      SELECT 
        COUNT(*) as total_enrichments,
        COUNT(DISTINCT community_id) as unique_communities,
        SUM(CASE WHEN enrichment_type = 'perplexity_web' THEN 1 ELSE 0 END) as web_enrichments,
        SUM(CASE WHEN enrichment_type = 'ai_analysis' THEN 1 ELSE 0 END) as ai_analyses
      FROM community_enrichment_history
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `);
    
    const stats = enrichmentStats.rows[0] || {};
    
    res.json({
      totalCalls: aiUsageTracker.perplexity.calls + aiUsageTracker.claude.calls,
      totalCost: aiUsageTracker.totalCost.toFixed(2),
      providers: {
        perplexity: {
          calls: aiUsageTracker.perplexity.calls,
          cost: aiUsageTracker.perplexity.cost.toFixed(2),
          lastCall: aiUsageTracker.perplexity.lastCall,
          errors: aiUsageTracker.perplexity.errors,
          status: 'active'
        },
        claude: {
          calls: aiUsageTracker.claude.calls,
          cost: aiUsageTracker.claude.cost.toFixed(2),
          lastCall: aiUsageTracker.claude.lastCall,
          errors: aiUsageTracker.claude.errors,
          status: 'active'
        }
      },
      enrichmentStats: {
        totalEnrichments: Number(stats.total_enrichments) || 0,
        uniqueCommunities: Number(stats.unique_communities) || 0,
        webEnrichments: Number(stats.web_enrichments) || 0,
        aiAnalyses: Number(stats.ai_analyses) || 0
      },
      timeRange,
      _version: 'v4_ai_metrics',
      _timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching AI metrics:', error);
    res.status(500).json({ error: 'Failed to fetch AI metrics' });
  }
});

// Get AI cost breakdown
router.get('/costs', async (req, res) => {
  try {
    res.json({
      daily: {
        perplexity: (aiUsageTracker.perplexity.cost / 30).toFixed(2),
        claude: (aiUsageTracker.claude.cost / 30).toFixed(2),
        total: (aiUsageTracker.totalCost / 30).toFixed(2)
      },
      monthly: {
        perplexity: aiUsageTracker.perplexity.cost.toFixed(2),
        claude: aiUsageTracker.claude.cost.toFixed(2),
        total: aiUsageTracker.totalCost.toFixed(2)
      },
      projected: {
        annual: (aiUsageTracker.totalCost * 12).toFixed(2)
      },
      _version: 'v4_ai_costs',
      _timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching AI costs:', error);
    res.status(500).json({ error: 'Failed to fetch AI costs' });
  }
});

export default router;
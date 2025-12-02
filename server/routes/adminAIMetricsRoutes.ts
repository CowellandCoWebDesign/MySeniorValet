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
    errors: 0,
    totalResponseTime: 0,
    avgResponseTime: 0
  },
  claude: {
    calls: 0,
    cost: 0,
    lastCall: null as Date | null,
    errors: 0,
    totalResponseTime: 0,
    avgResponseTime: 0
  },
  chatgpt: {
    calls: 0,
    cost: 0, 
    lastCall: null as Date | null,
    errors: 0,
    totalResponseTime: 0,
    avgResponseTime: 0
  },
  totalCost: 0,
  totalCalls: 0,
  totalErrors: 0
};

// Load real AI usage from database on startup
async function loadAIUsageFromDB() {
  try {
    // Query actual API usage logs from enrichment history
    const result = await db.execute(sql`
      SELECT 
        COUNT(*) as total_calls,
        SUM(CASE WHEN metadata->>'ai_provider' = 'perplexity' THEN 1 ELSE 0 END) as perplexity_calls,
        SUM(CASE WHEN metadata->>'ai_provider' = 'claude' THEN 1 ELSE 0 END) as claude_calls,
        SUM(CASE WHEN metadata->>'ai_provider' = 'chatgpt' THEN 1 ELSE 0 END) as chatgpt_calls
      FROM community_enrichment_history
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `);
    
    if (result.rows[0]) {
      const data = result.rows[0];
      aiUsageTracker.perplexity.calls = Number(data.perplexity_calls) || 0;
      aiUsageTracker.claude.calls = Number(data.claude_calls) || 0;
      aiUsageTracker.chatgpt.calls = Number(data.chatgpt_calls) || 0;
      
      // Calculate costs based on real pricing
      aiUsageTracker.perplexity.cost = aiUsageTracker.perplexity.calls * 0.005; // $0.005 per call
      aiUsageTracker.claude.cost = aiUsageTracker.claude.calls * 0.01; // $0.01 per call
      aiUsageTracker.chatgpt.cost = aiUsageTracker.chatgpt.calls * 0.002; // $0.002 per call
      
      aiUsageTracker.totalCost = 
        aiUsageTracker.perplexity.cost + 
        aiUsageTracker.claude.cost + 
        aiUsageTracker.chatgpt.cost;
    }
  } catch (error) {
    console.error('Error loading AI usage from database:', error);
  }
}

// Initialize on startup
loadAIUsageFromDB();

// Track AI usage (called by other services when they use AI)
export function trackAIUsage(provider: 'perplexity' | 'claude' | 'chatgpt', success: boolean = true, responseTimeMs?: number) {
  const tracker = aiUsageTracker[provider];
  if (tracker) {
    tracker.calls++;
    tracker.lastCall = new Date();
    aiUsageTracker.totalCalls++;
    
    if (!success) {
      tracker.errors++;
      aiUsageTracker.totalErrors++;
    }
    
    // Track response time
    if (responseTimeMs !== undefined) {
      tracker.totalResponseTime += responseTimeMs;
      tracker.avgResponseTime = tracker.totalResponseTime / tracker.calls;
    }
    
    // Update costs based on real pricing
    let cost = 0;
    switch(provider) {
      case 'perplexity':
        cost = 0.005;  // $5 per 1000 requests
        break;
      case 'claude':
        cost = 0.01;   // ~$0.01 per request average
        break;
      case 'chatgpt':
        cost = 0.002;  // ~$0.002 per request average
        break;
    }
    
    tracker.cost += cost;
    aiUsageTracker.totalCost += cost;
    
    console.log(`📊 AI Usage tracked: ${provider} (${success ? 'success' : 'error'})${responseTimeMs ? ` in ${responseTimeMs}ms` : ''} - Total: ${aiUsageTracker.totalCalls} calls, $${aiUsageTracker.totalCost.toFixed(2)}`);
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
    
    // Calculate success rate
    const totalCalls = aiUsageTracker.totalCalls;
    const totalErrors = aiUsageTracker.totalErrors;
    const successRate = totalCalls > 0 ? ((totalCalls - totalErrors) / totalCalls) * 100 : 0;
    
    // Calculate average response time across all providers
    const totalResponseTime = 
      aiUsageTracker.perplexity.totalResponseTime + 
      aiUsageTracker.claude.totalResponseTime + 
      aiUsageTracker.chatgpt.totalResponseTime;
    const avgResponseTime = totalCalls > 0 ? Math.round(totalResponseTime / totalCalls) : 0;
    
    res.json({
      totalRequests: totalCalls,
      totalCalls: totalCalls, // For backwards compatibility
      totalCost: aiUsageTracker.totalCost.toFixed(2),
      successRate: Number(successRate.toFixed(1)),
      avgResponseTime: avgResponseTime,
      byProvider: {
        perplexity: aiUsageTracker.perplexity.calls,
        claude: aiUsageTracker.claude.calls,
        chatgpt: aiUsageTracker.chatgpt.calls,
        gemini: 0,  // Not currently used
        grok: 0     // Not currently used
      },
      costs: {
        total: Number(aiUsageTracker.totalCost.toFixed(2)),
        perplexity: Number(aiUsageTracker.perplexity.cost.toFixed(2)),
        claude: Number(aiUsageTracker.claude.cost.toFixed(2)),
        chatgpt: Number(aiUsageTracker.chatgpt.cost.toFixed(2)),
        gemini: 0,
      },
      providers: {
        perplexity: {
          calls: aiUsageTracker.perplexity.calls,
          cost: aiUsageTracker.perplexity.cost.toFixed(2),
          lastCall: aiUsageTracker.perplexity.lastCall,
          errors: aiUsageTracker.perplexity.errors,
          avgResponseTime: Math.round(aiUsageTracker.perplexity.avgResponseTime),
          status: process.env.PERPLEXITY_API_KEY ? 'active' : 'not_configured'
        },
        claude: {
          calls: aiUsageTracker.claude.calls,
          cost: aiUsageTracker.claude.cost.toFixed(2),
          lastCall: aiUsageTracker.claude.lastCall,
          errors: aiUsageTracker.claude.errors,
          avgResponseTime: Math.round(aiUsageTracker.claude.avgResponseTime),
          status: process.env.ANTHROPIC_API_KEY ? 'active' : 'not_configured'
        },
        chatgpt: {
          calls: aiUsageTracker.chatgpt.calls,
          cost: aiUsageTracker.chatgpt.cost.toFixed(2),
          lastCall: aiUsageTracker.chatgpt.lastCall,
          errors: aiUsageTracker.chatgpt.errors,
          avgResponseTime: Math.round(aiUsageTracker.chatgpt.avgResponseTime),
          status: process.env.OPENAI_API_KEY ? 'active' : 'not_configured'
        }
      },
      enrichmentStats: {
        totalEnrichments: Number(stats.total_enrichments) || 0,
        uniqueCommunities: Number(stats.unique_communities) || 0,
        webEnrichments: Number(stats.web_enrichments) || 0,
        aiAnalyses: Number(stats.ai_analyses) || 0
      },
      timeRange,
      _version: 'v5_ai_metrics_enhanced',
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
        chatgpt: (aiUsageTracker.chatgpt.cost / 30).toFixed(2),
        total: (aiUsageTracker.totalCost / 30).toFixed(2)
      },
      monthly: {
        perplexity: aiUsageTracker.perplexity.cost.toFixed(2),
        claude: aiUsageTracker.claude.cost.toFixed(2),
        chatgpt: aiUsageTracker.chatgpt.cost.toFixed(2),
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
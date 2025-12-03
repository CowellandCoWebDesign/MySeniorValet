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

// Query real AI usage directly from database (not in-memory)
async function getAIUsageFromDB(days: number = 30) {
  try {
    // Sanitize days parameter to prevent SQL injection (must be positive integer)
    const safeDays = Math.max(1, Math.min(365, Math.floor(Number(days) || 30)));
    
    // Query actual API usage with costs and response times from metadata
    // Using parameterized interval calculation to prevent SQL injection
    const result = await db.execute(sql`
      SELECT 
        COALESCE(ai_provider, metadata->>'ai_provider', 'unknown') as provider,
        COUNT(*) as call_count,
        SUM((metadata->>'cost')::numeric) as total_cost,
        AVG((metadata->>'response_time')::numeric) as avg_response_time,
        COUNT(CASE WHEN verification_status = 'error' OR verification_status = 'failed' THEN 1 END) as error_count,
        MAX(created_at) as last_call
      FROM community_enrichment_history
      WHERE created_at >= NOW() - (${safeDays} * INTERVAL '1 day')
      GROUP BY COALESCE(ai_provider, metadata->>'ai_provider', 'unknown')
    `);
    
    const stats = {
      perplexity: { calls: 0, cost: 0, avgResponseTime: 0, errors: 0, lastCall: null as Date | null },
      claude: { calls: 0, cost: 0, avgResponseTime: 0, errors: 0, lastCall: null as Date | null },
      chatgpt: { calls: 0, cost: 0, avgResponseTime: 0, errors: 0, lastCall: null as Date | null },
      totalCalls: 0,
      totalCost: 0,
      totalErrors: 0
    };
    
    for (const row of result.rows) {
      const provider = (row.provider as string || '').toLowerCase();
      const calls = Number(row.call_count) || 0;
      // Only use default cost if metadata cost is null/undefined, not if it's 0
      const dbCost = row.total_cost;
      const cost = (dbCost !== null && dbCost !== undefined) 
        ? Number(dbCost) 
        : (calls * getDefaultCost(provider));
      const avgTime = Number(row.avg_response_time) || 0;
      const errors = Number(row.error_count) || 0;
      const lastCall = row.last_call ? new Date(row.last_call as string) : null;
      
      if (provider === 'perplexity') {
        stats.perplexity = { calls, cost, avgResponseTime: avgTime, errors, lastCall };
      } else if (provider === 'claude' || provider === 'anthropic') {
        stats.claude = { calls, cost, avgResponseTime: avgTime, errors, lastCall };
      } else if (provider === 'chatgpt' || provider === 'openai') {
        stats.chatgpt = { calls, cost, avgResponseTime: avgTime, errors, lastCall };
      }
      
      stats.totalCalls += calls;
      stats.totalCost += cost;
      stats.totalErrors += errors;
    }
    
    return stats;
  } catch (error) {
    console.error('Error loading AI usage from database:', error);
    return {
      perplexity: { calls: 0, cost: 0, avgResponseTime: 0, errors: 0, lastCall: null },
      claude: { calls: 0, cost: 0, avgResponseTime: 0, errors: 0, lastCall: null },
      chatgpt: { calls: 0, cost: 0, avgResponseTime: 0, errors: 0, lastCall: null },
      totalCalls: 0,
      totalCost: 0,
      totalErrors: 0
    };
  }
}

function getDefaultCost(provider: string): number {
  switch(provider) {
    case 'perplexity': return 0.005;
    case 'claude': case 'anthropic': return 0.01;
    case 'chatgpt': case 'openai': return 0.002;
    default: return 0.005;
  }
}

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

// Get AI metrics endpoint - queries real data from database
router.get('/metrics', async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    // Parse time range to days
    const days = parseInt(timeRange.toString().replace('d', '')) || 30;
    
    // Get real AI usage from database
    const dbStats = await getAIUsageFromDB(days);
    
    // Get enrichment stats (using same safeDays for parameterized query)
    const safeDays = Math.max(1, Math.min(365, Math.floor(Number(days) || 30)));
    const enrichmentStats = await db.execute(sql`
      SELECT 
        COUNT(*) as total_enrichments,
        COUNT(DISTINCT community_id) as unique_communities,
        SUM(CASE WHEN enrichment_type = 'perplexity_web' THEN 1 ELSE 0 END) as web_enrichments,
        SUM(CASE WHEN enrichment_type = 'ai_analysis' THEN 1 ELSE 0 END) as ai_analyses
      FROM community_enrichment_history
      WHERE created_at >= NOW() - (${safeDays} * INTERVAL '1 day')
    `);
    
    const stats = enrichmentStats.rows[0] || {};
    
    // Calculate success rate from database stats
    const successRate = dbStats.totalCalls > 0 
      ? ((dbStats.totalCalls - dbStats.totalErrors) / dbStats.totalCalls) * 100 
      : 100; // 100% if no calls yet
    
    // Calculate weighted average response time
    const totalResponseTime = 
      (dbStats.perplexity.avgResponseTime * dbStats.perplexity.calls) +
      (dbStats.claude.avgResponseTime * dbStats.claude.calls) +
      (dbStats.chatgpt.avgResponseTime * dbStats.chatgpt.calls);
    const avgResponseTime = dbStats.totalCalls > 0 
      ? Math.round(totalResponseTime / dbStats.totalCalls) 
      : 0;
    
    res.json({
      totalRequests: dbStats.totalCalls,
      totalCalls: dbStats.totalCalls,
      totalCost: dbStats.totalCost.toFixed(2),
      successRate: Number(successRate.toFixed(1)),
      avgResponseTime: avgResponseTime,
      byProvider: {
        perplexity: dbStats.perplexity.calls,
        claude: dbStats.claude.calls,
        chatgpt: dbStats.chatgpt.calls,
        gemini: 0,
        grok: 0
      },
      costs: {
        total: Number(dbStats.totalCost.toFixed(2)),
        perplexity: Number(dbStats.perplexity.cost.toFixed(2)),
        claude: Number(dbStats.claude.cost.toFixed(2)),
        chatgpt: Number(dbStats.chatgpt.cost.toFixed(2)),
        gemini: 0,
      },
      providers: {
        perplexity: {
          calls: dbStats.perplexity.calls,
          cost: dbStats.perplexity.cost.toFixed(2),
          lastCall: dbStats.perplexity.lastCall,
          errors: dbStats.perplexity.errors,
          avgResponseTime: Math.round(dbStats.perplexity.avgResponseTime),
          status: process.env.PERPLEXITY_API_KEY ? 'active' : 'not_configured'
        },
        claude: {
          calls: dbStats.claude.calls,
          cost: dbStats.claude.cost.toFixed(2),
          lastCall: dbStats.claude.lastCall,
          errors: dbStats.claude.errors,
          avgResponseTime: Math.round(dbStats.claude.avgResponseTime),
          status: process.env.ANTHROPIC_API_KEY ? 'active' : 'not_configured'
        },
        chatgpt: {
          calls: dbStats.chatgpt.calls,
          cost: dbStats.chatgpt.cost.toFixed(2),
          lastCall: dbStats.chatgpt.lastCall,
          errors: dbStats.chatgpt.errors,
          avgResponseTime: Math.round(dbStats.chatgpt.avgResponseTime),
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
      _source: 'database',
      _version: 'v6_database_backed',
      _timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching AI metrics:', error);
    res.status(500).json({ error: 'Failed to fetch AI metrics' });
  }
});

// Get AI cost breakdown - queries real data from database
router.get('/costs', async (req, res) => {
  try {
    // Get real costs from database
    const dbStats = await getAIUsageFromDB(30);
    
    res.json({
      daily: {
        perplexity: (dbStats.perplexity.cost / 30).toFixed(2),
        claude: (dbStats.claude.cost / 30).toFixed(2),
        chatgpt: (dbStats.chatgpt.cost / 30).toFixed(2),
        total: (dbStats.totalCost / 30).toFixed(2)
      },
      monthly: {
        perplexity: dbStats.perplexity.cost.toFixed(2),
        claude: dbStats.claude.cost.toFixed(2),
        chatgpt: dbStats.chatgpt.cost.toFixed(2),
        total: dbStats.totalCost.toFixed(2)
      },
      projected: {
        annual: (dbStats.totalCost * 12).toFixed(2)
      },
      _source: 'database',
      _version: 'v5_database_backed',
      _timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching AI costs:', error);
    res.status(500).json({ error: 'Failed to fetch AI costs' });
  }
});

export default router;
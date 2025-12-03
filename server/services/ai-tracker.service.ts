import { db } from "../db";
import { communityEnrichmentHistory } from "@shared/schema";
import { trackAIUsage } from "../routes/adminAIMetricsRoutes";

// Re-export trackAIUsage for use in other services
export { trackAIUsage };

/**
 * AI Tracker Service - Intercepts and tracks all AI API calls
 * Golden Data Rule compliant - only tracks real API usage
 */
export class AITrackerService {
  private static instance: AITrackerService;

  static getInstance(): AITrackerService {
    if (!this.instance) {
      this.instance = new AITrackerService();
    }
    return this.instance;
  }

  /**
   * Track Perplexity API call
   */
  async trackPerplexityCall(communityId: number, enrichmentData: any, responseTime: number) {
    try {
      // Track in-memory for immediate dashboard updates
      trackAIUsage('perplexity', true);
      
      // Store in database for permanent record
      await db.insert(communityEnrichmentHistory).values({
        communityId,
        enrichmentType: 'perplexity_web',
        aiProvider: 'perplexity',
        dataEnriched: enrichmentData,
        verificationStatus: 'completed',
        metadata: {
          ai_provider: 'perplexity',
          cost: 0.005,
          response_time: responseTime
        }
      });
      
      console.log(`📊 Tracked Perplexity API call for community ${communityId}`);
    } catch (error) {
      console.error('Error tracking Perplexity call:', error);
      trackAIUsage('perplexity', false);
    }
  }

  /**
   * Track Claude API call
   */
  async trackClaudeCall(communityId: number, analysisData: any, tokensUsed: number, responseTime: number) {
    try {
      // Track in-memory
      trackAIUsage('claude', true);
      
      // Store in database
      await db.insert(communityEnrichmentHistory).values({
        communityId,
        enrichmentType: 'ai_analysis',
        aiProvider: 'claude',
        dataEnriched: analysisData,
        verificationStatus: 'completed',
        metadata: {
          ai_provider: 'claude',
          cost: 0.01,
          tokens_used: tokensUsed,
          response_time: responseTime
        }
      });
      
      console.log(`📊 Tracked Claude API call for community ${communityId}`);
    } catch (error) {
      console.error('Error tracking Claude call:', error);
      trackAIUsage('claude', false);
    }
  }

  /**
   * Track ChatGPT API call
   */
  async trackChatGPTCall(communityId: number, responseData: any, tokensUsed: number, responseTime: number) {
    try {
      // Track in-memory
      trackAIUsage('chatgpt', true);
      
      // Store in database
      await db.insert(communityEnrichmentHistory).values({
        communityId,
        enrichmentType: 'ai_analysis',
        aiProvider: 'chatgpt',
        dataEnriched: responseData,
        verificationStatus: 'completed',
        metadata: {
          ai_provider: 'chatgpt',
          cost: 0.002,
          tokens_used: tokensUsed,
          response_time: responseTime
        }
      });
      
      console.log(`📊 Tracked ChatGPT API call for community ${communityId}`);
    } catch (error) {
      console.error('Error tracking ChatGPT call:', error);
      trackAIUsage('chatgpt', false);
    }
  }

  /**
   * Get AI usage statistics for a specific time period
   */
  async getUsageStats(days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const stats = await db.query.communityEnrichmentHistory.findMany({
        where: (table, { gte }) => gte(table.createdAt, startDate),
      });
      
      const summary = {
        perplexity: stats.filter(s => s.aiProvider === 'perplexity').length,
        claude: stats.filter(s => s.aiProvider === 'claude').length,
        chatgpt: stats.filter(s => s.aiProvider === 'chatgpt').length,
        totalCost: stats.reduce((sum, s) => {
          const cost = s.metadata?.cost || 0;
          return sum + cost;
        }, 0)
      };
      
      return summary;
    } catch (error) {
      console.error('Error getting usage stats:', error);
      return null;
    }
  }
}

// Export singleton instance
export const aiTracker = AITrackerService.getInstance();
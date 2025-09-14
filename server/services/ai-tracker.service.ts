import { db } from "../db";
import { communityEnrichmentHistory } from "@shared/schema";
import { trackAIUsage } from "../routes/adminAIMetricsRoutes";

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

  // Removed tracking method for discontinued service

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
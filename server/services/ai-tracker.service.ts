import { db } from "../db";
import { aiUsageLogs } from "@shared/schema";
import { sql } from "drizzle-orm";

/**
 * AI Tracker Service - Tracks all AI API calls to the database
 * This is the ONLY place AI usage should be tracked for the admin dashboard
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
   * Track any AI API call - main method for all tracking
   */
  async trackCall(params: {
    provider: 'perplexity' | 'claude' | 'chatgpt' | 'openai';
    model: string;
    action: string;
    context?: string;
    inputTokens?: number;
    outputTokens?: number;
    estimatedCost?: number;
    requestDuration?: number;
    success?: boolean;
    errorMessage?: string;
    metadata?: Record<string, any>;
    userId?: number;
    prompt?: string;
    response?: string;
  }) {
    try {
      const totalTokens = (params.inputTokens || 0) + (params.outputTokens || 0);
      
      await db.insert(aiUsageLogs).values({
        provider: params.provider,
        model: params.model,
        action: params.action,
        context: params.context,
        inputTokens: params.inputTokens,
        outputTokens: params.outputTokens,
        totalTokens: totalTokens > 0 ? totalTokens : undefined,
        estimatedCost: params.estimatedCost?.toString(),
        requestDuration: params.requestDuration,
        success: params.success ?? true,
        errorMessage: params.errorMessage,
        metadata: params.metadata,
        userId: params.userId,
        prompt: params.prompt?.substring(0, 5000), // Limit prompt size
        response: params.response?.substring(0, 5000), // Limit response size
      });

      console.log(`📊 AI Usage Tracked: ${params.provider}/${params.model} - ${params.action} (${params.requestDuration}ms, $${params.estimatedCost?.toFixed(4) || '0.0000'})`);
    } catch (error) {
      console.error('Failed to track AI usage:', error);
    }
  }

  /**
   * Track Perplexity API call
   */
  async trackPerplexityCall(params: {
    action: string;
    model?: string;
    context?: string;
    inputTokens?: number;
    outputTokens?: number;
    requestDuration: number;
    success?: boolean;
    errorMessage?: string;
    metadata?: Record<string, any>;
    prompt?: string;
    response?: string;
  }) {
    // Perplexity pricing: ~$0.005 per 1K tokens for sonar-pro
    const tokens = (params.inputTokens || 0) + (params.outputTokens || 0);
    const estimatedCost = (tokens / 1000) * 0.005;

    await this.trackCall({
      provider: 'perplexity',
      model: params.model || 'sonar-pro',
      action: params.action,
      context: params.context,
      inputTokens: params.inputTokens,
      outputTokens: params.outputTokens,
      estimatedCost,
      requestDuration: params.requestDuration,
      success: params.success,
      errorMessage: params.errorMessage,
      metadata: params.metadata,
      prompt: params.prompt,
      response: params.response,
    });
  }

  /**
   * Track Claude API call
   */
  async trackClaudeCall(params: {
    action: string;
    model?: string;
    context?: string;
    inputTokens?: number;
    outputTokens?: number;
    requestDuration: number;
    success?: boolean;
    errorMessage?: string;
    metadata?: Record<string, any>;
    prompt?: string;
    response?: string;
  }) {
    // Claude pricing: ~$0.01 per 1K tokens for claude-3
    const tokens = (params.inputTokens || 0) + (params.outputTokens || 0);
    const estimatedCost = (tokens / 1000) * 0.01;

    await this.trackCall({
      provider: 'claude',
      model: params.model || 'claude-3-sonnet',
      action: params.action,
      context: params.context,
      inputTokens: params.inputTokens,
      outputTokens: params.outputTokens,
      estimatedCost,
      requestDuration: params.requestDuration,
      success: params.success,
      errorMessage: params.errorMessage,
      metadata: params.metadata,
      prompt: params.prompt,
      response: params.response,
    });
  }

  /**
   * Track ChatGPT/OpenAI API call
   */
  async trackChatGPTCall(params: {
    action: string;
    model?: string;
    context?: string;
    inputTokens?: number;
    outputTokens?: number;
    requestDuration: number;
    success?: boolean;
    errorMessage?: string;
    metadata?: Record<string, any>;
    prompt?: string;
    response?: string;
  }) {
    // ChatGPT pricing: ~$0.002 per 1K tokens for gpt-4o-mini
    const tokens = (params.inputTokens || 0) + (params.outputTokens || 0);
    const estimatedCost = (tokens / 1000) * 0.002;

    await this.trackCall({
      provider: 'chatgpt',
      model: params.model || 'gpt-4o-mini',
      action: params.action,
      context: params.context,
      inputTokens: params.inputTokens,
      outputTokens: params.outputTokens,
      estimatedCost,
      requestDuration: params.requestDuration,
      success: params.success,
      errorMessage: params.errorMessage,
      metadata: params.metadata,
      prompt: params.prompt,
      response: params.response,
    });
  }

  /**
   * Get AI usage statistics for dashboard
   */
  async getUsageStats(days: number = 30) {
    try {
      const result = await db.execute(sql`
        SELECT 
          provider,
          COUNT(*) as call_count,
          SUM(COALESCE(estimated_cost, 0)) as total_cost,
          AVG(COALESCE(request_duration, 0)) as avg_response_time,
          SUM(COALESCE(total_tokens, 0)) as total_tokens,
          COUNT(CASE WHEN success = false THEN 1 END) as error_count
        FROM ai_usage_logs
        WHERE created_at >= NOW() - (${days} * INTERVAL '1 day')
        GROUP BY provider
      `);

      return result.rows;
    } catch (error) {
      console.error('Error getting AI usage stats:', error);
      return [];
    }
  }
}

// Export singleton instance
export const aiTracker = AITrackerService.getInstance();

// Legacy compatibility - deprecated, use aiTracker.trackCall() instead
export function trackAIUsage(provider: 'perplexity' | 'claude' | 'chatgpt', success: boolean = true, responseTimeMs?: number) {
  // This is deprecated but kept for backwards compatibility
  // It now forwards to the proper database tracking
  aiTracker.trackCall({
    provider,
    model: provider === 'perplexity' ? 'sonar-pro' : provider === 'claude' ? 'claude-3-sonnet' : 'gpt-4o-mini',
    action: 'legacy_call',
    context: 'legacy_tracking',
    requestDuration: responseTimeMs,
    success,
    estimatedCost: provider === 'perplexity' ? 0.005 : provider === 'claude' ? 0.01 : 0.002,
  });
}

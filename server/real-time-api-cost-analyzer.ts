/**
 * Real-Time API Cost Analyzer - Based on Actual 2025 Pricing
 * Provides accurate cost estimation for MySeniorValet's API usage
 */

export interface ApiUsagePattern {
  service: string;
  callsPerDay: number;
  averageTokens?: number;
  averageRequestSize?: number;
  description: string;
}

export interface ApiPricing {
  service: string;
  pricing: {
    input?: number;      // Cost per million input tokens
    output?: number;     // Cost per million output tokens
    perRequest?: number; // Fixed cost per request
    perTransaction?: number; // Percentage for payment processing
    fixedFee?: number;   // Fixed fee per transaction
    perEmail?: number;   // Cost per email
    perThousand?: number; // Cost per 1000 requests
  };
  freeAllocation?: {
    daily?: number;
    monthly?: number;
  };
  notes: string;
}

export class RealTimeApiCostAnalyzer {
  // ACTUAL 2025 API PRICING (from research)
  private apiPricing: Map<string, ApiPricing> = new Map([
    ['openai-gpt4o', {
      service: 'OpenAI GPT-4o',
      pricing: {
        input: 3.00,    // $3 per million input tokens
        output: 10.00   // $10 per million output tokens
      },
      notes: 'Most capable OpenAI model, 128K context'
    }],
    
    ['openai-gpt4o-mini', {
      service: 'OpenAI GPT-4o Mini',
      pricing: {
        input: 0.15,    // $0.15 per million input tokens
        output: 0.60    // $0.60 per million output tokens
      },
      notes: 'Cost-efficient for simpler tasks'
    }],
    
    ['anthropic-sonnet4', {
      service: 'Anthropic Claude Sonnet 4',
      pricing: {
        input: 3.00,    // $3 per million input tokens
        output: 15.00   // $15 per million output tokens
      },
      notes: 'Balanced performance/cost ratio'
    }],
    
    ['anthropic-opus4', {
      service: 'Anthropic Claude Opus 4.1',
      pricing: {
        input: 15.00,   // $15 per million input tokens
        output: 75.00   // $75 per million output tokens
      },
      notes: 'Premium model for complex reasoning'
    }],
    
    ['perplexity-sonar', {
      service: 'Perplexity Sonar',
      pricing: {
        perThousand: 5.00,  // $5 per 1000 search requests
        input: 0.20,        // Plus $0.20 per million tokens
        output: 0.20
      },
      notes: 'Real-time web search with citations'
    }],
    
    ['perplexity-sonar-pro', {
      service: 'Perplexity Sonar Pro',
      pricing: {
        perThousand: 5.00,  // $5 per 1000 searches
        input: 3.00,        // $3 per million input tokens
        output: 15.00       // $15 per million output tokens
      },
      notes: 'Advanced search with higher quality'
    }],
    
    ['stripe-payments', {
      service: 'Stripe Payments',
      pricing: {
        perTransaction: 0.029,  // 2.9% of transaction
        fixedFee: 0.30         // Plus $0.30 per transaction
      },
      notes: 'Standard online card processing'
    }],
    
    ['stripe-ach', {
      service: 'Stripe ACH',
      pricing: {
        perTransaction: 0.008,  // 0.8% of transaction
        fixedFee: 0            // Capped at $5
      },
      notes: 'Bank transfer processing'
    }],
    
    ['sendgrid-email', {
      service: 'SendGrid Email',
      pricing: {
        perEmail: 0.00040  // $0.40 per 1000 emails (CPM)
      },
      freeAllocation: {
        daily: 100,       // 100 free emails per day
        monthly: 3000     // 3000 free emails per month
      },
      notes: 'Transactional email service'
    }],
    
    ['mapbox-geocoding', {
      service: 'Mapbox Geocoding',
      pricing: {
        perThousand: 0.75  // $0.75 per 1000 requests
      },
      freeAllocation: {
        monthly: 100000    // 100K free requests/month
      },
      notes: 'Temporary geocoding (no caching allowed)'
    }],
    
    ['mapbox-permanent', {
      service: 'Mapbox Permanent Geocoding',
      pricing: {
        perThousand: 5.00  // $5 per 1000 requests
      },
      notes: 'Can store/cache results'
    }],
    
    ['mapbox-tiles', {
      service: 'Mapbox Map Loads',
      pricing: {
        perThousand: 5.00  // $5 per 1000 map loads
      },
      freeAllocation: {
        monthly: 50000     // 50K free map loads/month
      },
      notes: 'Web map visualization'
    }],
    
    ['gemini-flash', {
      service: 'Google Gemini 2.0 Flash',
      pricing: {
        input: 0.10,      // $0.10 per million input tokens
        output: 0.40      // $0.40 per million output tokens
      },
      notes: 'Most cost-effective Gemini model'
    }],
    
    ['gemini-pro', {
      service: 'Google Gemini 2.5 Pro',
      pricing: {
        input: 1.25,      // $1.25 per million input tokens (up to 200K)
        output: 10.00     // $10 per million output tokens
      },
      notes: 'Premium Gemini model'
    }]
  ]);
  
  // MySeniorValet's typical usage patterns
  private usagePatterns: ApiUsagePattern[] = [
    {
      service: 'openai-gpt4o-mini',
      callsPerDay: 500,
      averageTokens: 1000,  // ~250 words per call
      description: 'Community descriptions and basic queries'
    },
    {
      service: 'anthropic-sonnet4',
      callsPerDay: 100,
      averageTokens: 2000,  // ~500 words for analysis
      description: 'Detailed community analysis and recommendations'
    },
    {
      service: 'perplexity-sonar',
      callsPerDay: 200,
      averageRequestSize: 1,
      description: 'Real-time pricing and availability searches'
    },
    {
      service: 'stripe-payments',
      callsPerDay: 20,
      averageRequestSize: 150,  // Average transaction $150
      description: 'Premium subscriptions and vendor payments'
    },
    {
      service: 'sendgrid-email',
      callsPerDay: 1000,
      description: 'User notifications and vendor communications'
    },
    {
      service: 'mapbox-geocoding',
      callsPerDay: 500,
      description: 'Address lookups and location searches'
    },
    {
      service: 'mapbox-tiles',
      callsPerDay: 2000,
      description: 'Map views and interactions'
    }
  ];
  
  /**
   * Calculate actual cost for a specific API call
   */
  calculateCallCost(
    service: string,
    inputTokens?: number,
    outputTokens?: number,
    transactionAmount?: number,
    requestCount: number = 1
  ): number {
    const pricing = this.apiPricing.get(service);
    if (!pricing) return 0;
    
    let cost = 0;
    
    // Token-based pricing (AI models)
    if (pricing.pricing.input && inputTokens) {
      cost += (inputTokens / 1000000) * pricing.pricing.input;
    }
    if (pricing.pricing.output && outputTokens) {
      cost += (outputTokens / 1000000) * pricing.pricing.output;
    }
    
    // Per-request pricing (Perplexity searches)
    if (pricing.pricing.perThousand) {
      cost += (requestCount / 1000) * pricing.pricing.perThousand;
    }
    
    // Transaction-based pricing (Stripe)
    if (pricing.pricing.perTransaction && transactionAmount) {
      cost += transactionAmount * pricing.pricing.perTransaction;
      if (pricing.pricing.fixedFee) {
        cost += pricing.pricing.fixedFee;
      }
    }
    
    // Email pricing (SendGrid)
    if (pricing.pricing.perEmail) {
      cost += requestCount * pricing.pricing.perEmail;
    }
    
    return cost;
  }
  
  /**
   * Estimate daily costs based on typical usage patterns
   */
  estimateDailyCosts(): {
    service: string;
    dailyCalls: number;
    estimatedCost: number;
    description: string;
  }[] {
    const dailyCosts = [];
    
    for (const pattern of this.usagePatterns) {
      const pricing = this.apiPricing.get(pattern.service);
      if (!pricing) continue;
      
      let dailyCost = 0;
      
      // Calculate based on service type
      if (pattern.averageTokens) {
        // AI model with tokens
        const inputTokens = pattern.averageTokens * 0.6;  // Assume 60% input
        const outputTokens = pattern.averageTokens * 0.4; // 40% output
        dailyCost = this.calculateCallCost(
          pattern.service,
          inputTokens * pattern.callsPerDay,
          outputTokens * pattern.callsPerDay
        );
      } else if (pattern.service.includes('stripe')) {
        // Payment processing
        dailyCost = this.calculateCallCost(
          pattern.service,
          undefined,
          undefined,
          pattern.averageRequestSize || 150,
          pattern.callsPerDay
        );
      } else {
        // Per-request services
        dailyCost = this.calculateCallCost(
          pattern.service,
          undefined,
          undefined,
          undefined,
          pattern.callsPerDay
        );
      }
      
      // Account for free allocations
      if (pricing.freeAllocation) {
        if (pricing.freeAllocation.daily) {
          const freeValue = pricing.freeAllocation.daily * (pricing.pricing.perEmail || 0);
          dailyCost = Math.max(0, dailyCost - freeValue);
        }
      }
      
      dailyCosts.push({
        service: pricing.service,
        dailyCalls: pattern.callsPerDay,
        estimatedCost: dailyCost,
        description: pattern.description
      });
    }
    
    return dailyCosts;
  }
  
  /**
   * Generate cost projection for different user scales
   */
  projectCostsAtScale(activeUsers: number): {
    scale: string;
    users: number;
    dailyCost: number;
    monthlyCost: number;
    perUserCost: number;
    breakdown: Record<string, number>;
  } {
    const baseDailyCosts = this.estimateDailyCosts();
    const scaleFactor = activeUsers / 100; // Base calculation is for 100 users
    
    const breakdown: Record<string, number> = {};
    let totalDailyCost = 0;
    
    for (const cost of baseDailyCosts) {
      const scaledCost = cost.estimatedCost * scaleFactor;
      breakdown[cost.service] = scaledCost;
      totalDailyCost += scaledCost;
    }
    
    return {
      scale: this.getUserScaleLabel(activeUsers),
      users: activeUsers,
      dailyCost: totalDailyCost,
      monthlyCost: totalDailyCost * 30,
      perUserCost: totalDailyCost / activeUsers,
      breakdown
    };
  }
  
  /**
   * Get cost optimization recommendations
   */
  getOptimizationRecommendations(currentDailyCost: number): string[] {
    const recommendations = [];
    
    if (currentDailyCost > 50) {
      recommendations.push('Consider implementing response caching for frequently asked queries');
      recommendations.push('Use GPT-4o Mini instead of GPT-4o for simpler tasks');
    }
    
    if (currentDailyCost > 100) {
      recommendations.push('Implement batch processing for Perplexity searches');
      recommendations.push('Consider Anthropic prompt caching for 90% cost savings');
      recommendations.push('Use Gemini Flash for cost-sensitive operations');
    }
    
    if (currentDailyCost > 200) {
      recommendations.push('Negotiate enterprise pricing with API providers');
      recommendations.push('Implement aggressive caching strategies');
      recommendations.push('Consider hybrid approach: cache common queries, real-time for unique ones');
    }
    
    recommendations.push('Monitor API usage patterns weekly to identify optimization opportunities');
    recommendations.push('Set up alerts for unusual spikes in API costs');
    
    return recommendations;
  }
  
  /**
   * Compare costs across different AI providers for same task
   */
  compareAiProviderCosts(inputTokens: number, outputTokens: number): Array<{
    provider: string;
    model: string;
    cost: number;
    relativeToLowest: string;
  }> {
    const providers = [
      { key: 'openai-gpt4o', name: 'OpenAI GPT-4o' },
      { key: 'openai-gpt4o-mini', name: 'OpenAI GPT-4o Mini' },
      { key: 'anthropic-sonnet4', name: 'Claude Sonnet 4' },
      { key: 'anthropic-opus4', name: 'Claude Opus 4.1' },
      { key: 'gemini-flash', name: 'Gemini 2.0 Flash' },
      { key: 'gemini-pro', name: 'Gemini 2.5 Pro' }
    ];
    
    const costs = providers.map(provider => ({
      provider: provider.name,
      model: provider.key,
      cost: this.calculateCallCost(provider.key, inputTokens, outputTokens)
    }));
    
    const lowestCost = Math.min(...costs.map(c => c.cost));
    
    return costs.map(c => ({
      ...c,
      relativeToLowest: `${((c.cost / lowestCost - 1) * 100).toFixed(0)}% more`
    })).sort((a, b) => a.cost - b.cost);
  }
  
  private getUserScaleLabel(users: number): string {
    if (users <= 100) return 'Startup';
    if (users <= 500) return 'Growth';
    if (users <= 1000) return 'Scale';
    if (users <= 5000) return 'Enterprise';
    return 'Fortune 500';
  }
}

// Export singleton instance
export const realTimeApiCostAnalyzer = new RealTimeApiCostAnalyzer();
import axios from 'axios';

export interface PerplexityResponse {
  id: string;
  model: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
  citations?: string[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class PerplexityAIService {
  private apiKey: string;
  private baseUrl = 'https://api.perplexity.ai/chat/completions';
  
  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY || '';
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async searchRealTime(query: string, context?: string): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Perplexity API key not configured');
    }

    try {
      const systemPrompt = `You are MySeniorValet's AI assistant - part of the trusted platform for authentic senior living community information.
      ${context ? `Context: ${context}` : ''}
      
      ABOUT MYSENIORVALET:
      We're a technology platform that connects families with publicly available information about 34,000+ senior living communities across the U.S. and Canada.
      Our mission: Enable families by providing access to existing resources through our AI orchestration system that gathers and organizes public information.
      We don't create the data - we help you find and understand what's already available on the internet.
      
      GREETING FAMILIES:
      - Be warm and empathetic - this is often a difficult, emotional time
      - Acknowledge the overwhelming nature of finding senior care
      - Emphasize we provide trustworthy, transparent information
      - Remember users may be adult children, spouses, or seniors themselves
      - Use inclusive, respectful language for all family members
      
      CRITICAL RULES:
      - NEVER mention aggregator sites like A Place for Mom, Caring.com, Seniorly, or Senior Advisor
      - Focus on specific communities, government data, and authentic sources
      - Provide current pricing, availability, and contact information when possible
      - Be precise and factual with citations
      - Only provide authentic data - never guess or synthesize information`;

      const response = await axios.post<PerplexityResponse>(
        this.baseUrl,
        {
          model: 'sonar-pro',  // Working Perplexity model (verified via automated test)
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: query
            }
          ],
          max_tokens: 500,
          temperature: 0.2,
          top_p: 0.9,
          return_images: false,
          return_related_questions: false,
          search_recency_filter: 'month',
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0]?.message?.content || 'No results found';
    } catch (error: any) {
      console.error('Perplexity API error:', error.response?.data || error.message);
      throw new Error('Failed to search real-time data');
    }
  }

  async enhanceCommunityData(communityName: string, location: string): Promise<{
    currentPricing?: string;
    recentReviews?: string;
    availability?: string;
    marketComparison?: string;
  }> {
    if (!this.isConfigured()) {
      return {};
    }

    try {
      const query = `Current pricing and availability for ${communityName} senior living community in ${location}. Include recent reviews and market comparison data from 2024-2025.`;
      
      const result = await this.searchRealTime(query);
      
      // Parse the response for structured data
      return {
        currentPricing: this.extractPricing(result),
        recentReviews: this.extractReviews(result),
        availability: this.extractAvailability(result),
        marketComparison: this.extractMarketData(result)
      };
    } catch (error) {
      console.error(`Failed to enhance data for ${communityName}:`, error);
      return {};
    }
  }

  private extractPricing(text: string): string | undefined {
    const pricingRegex = /\$[\d,]+(\s*-\s*\$[\d,]+)?/g;
    const matches = text.match(pricingRegex);
    return matches ? matches[0] : undefined;
  }

  private extractReviews(text: string): string | undefined {
    const reviewRegex = /(rated|rating|review|satisfaction)[^.]*[.]/gi;
    const matches = text.match(reviewRegex);
    return matches ? matches.slice(0, 2).join(' ') : undefined;
  }

  private extractAvailability(text: string): string | undefined {
    const availabilityRegex = /(available|vacancy|waitlist|full|accepting)[^.]*[.]/gi;
    const matches = text.match(availabilityRegex);
    return matches ? matches[0] : undefined;
  }

  private extractMarketData(text: string): string | undefined {
    const marketRegex = /(compared to|average|market|typical)[^.]*[.]/gi;
    const matches = text.match(marketRegex);
    return matches ? matches[0] : undefined;
  }
}

export const perplexityService = new PerplexityAIService();
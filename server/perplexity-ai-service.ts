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
  images?: string[];  // URLs of relevant images found
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

  async searchRealTime(query: string, context?: string): Promise<{ summary: string; sources: string[]; images?: string[] }> {
    if (!this.isConfigured()) {
      throw new Error('Perplexity API key not configured');
    }

    try {
      const systemPrompt = `You are a senior living research expert providing comprehensive, accurate information for families making critical decisions.

Your PRIMARY goals in order of importance:
1. **FIND THE OFFICIAL WEBSITE** - Search for the community's actual .com, .org, or corporate website
2. Include the official website URL prominently in your response
3. Extract information directly from their official site when possible

Focus on finding and organizing key information about the requested senior living community:
- **Official Website URL** (most important - find their actual site)
- Current pricing and costs (monthly rates, fees, deposits)
- Available care levels and services
- Contact information (phone, website, address)
- Recent reviews or ratings if available
- Availability and waitlist status
- Management company and ownership details
- Key amenities and features
- Any recent news or changes

Prioritize information from the community's own website over third-party sources. Provide well-organized, factual information that helps families understand their options. ${context ? `Context: ${context}` : ''}`;

      const response = await axios.post<PerplexityResponse>(
        this.baseUrl,
        {
          model: 'sonar-pro',  // Perplexity's flagship model (legacy models deprecated Feb 2025)
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
          max_tokens: 2000,  // Increased for comprehensive responses
          temperature: 0.2,
          top_p: 0.9,
          return_images: true,  // Request actual images from search results
          search_recency_filter: 'month',  // Get fresh data from last 30 days
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const summary = response.data.choices[0]?.message?.content || 'No results found';
      const sources = response.data.citations || [];
      const images = response.data.images || [];
      
      return { summary, sources, images };
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
        currentPricing: this.extractPricing(result.summary),
        recentReviews: this.extractReviews(result.summary),
        availability: this.extractAvailability(result.summary),
        marketComparison: this.extractMarketData(result.summary)
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

  // Method for enhanced search intelligence compatibility
  async searchCommunityInfo(query: string): Promise<{ success: boolean; data: string; sources?: string[] }> {
    try {
      const result = await this.searchRealTime(query);
      return {
        success: true,
        data: result.summary,
        sources: result.sources
      };
    } catch (error) {
      console.error('Error searching community info:', error);
      return {
        success: false,
        data: 'Community search temporarily unavailable'
      };
    }
  }
}

export const perplexityService = new PerplexityAIService();
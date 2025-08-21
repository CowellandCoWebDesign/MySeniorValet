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

  async searchRealTime(query: string, context?: string): Promise<{ summary: string; sources: string[] }> {
    if (!this.isConfigured()) {
      throw new Error('Perplexity API key not configured');
    }

    try {
      const systemPrompt = `PROVIDE RAW, UNFILTERED SEARCH RESULTS. Include EVERYTHING found:
- ALL text about the searched topic
- EVERY mention of facilities, communities, or locations
- ALL pricing information discovered
- COMPLETE content without filtering
- DO NOT SUMMARIZE - provide the FULL content
- DO NOT FILTER - show EVERYTHING found
- Include even tangentially related information
This is for MySeniorValet's transparent information system. ${context ? `Context: ${context}` : ''}`;

      const response = await axios.post<PerplexityResponse>(
        this.baseUrl,
        {
          model: 'llama-3.1-sonar-large-128k-online',  // Sonar Pro/Large model for best accuracy and real-time data
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

      const summary = response.data.choices[0]?.message?.content || 'No results found';
      const sources = response.data.citations || [];
      
      return { summary, sources };
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
}

export const perplexityService = new PerplexityAIService();
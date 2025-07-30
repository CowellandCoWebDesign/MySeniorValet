import fetch from 'node-fetch';

interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class DeepSeekService {
  private apiKey: string;
  private baseUrl = 'https://api.deepseek.com/v1';

  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY || '';
    if (!this.apiKey) {
      console.warn('DEEPSEEK_API_KEY not found in environment variables');
    }
  }

  async generateCompletion(messages: DeepSeekMessage[], options: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
  } = {}): Promise<string> {
    if (!this.apiKey) {
      throw new Error('DeepSeek API key not configured');
    }

    const {
      model = 'deepseek-chat',
      temperature = 0.7,
      max_tokens = 1000,
      top_p = 0.9
    } = options;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens,
          top_p,
          stream: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`DeepSeek API error: ${response.status} ${errorText}`);
      }

      const data = await response.json() as DeepSeekResponse;
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from DeepSeek API');
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error('DeepSeek API error:', error);
      throw error;
    }
  }

  // Senior living specific search enhancement
  async enhanceCommunitySearch(query: string, communities: any[], location?: string): Promise<string> {
    const messages: DeepSeekMessage[] = [
      {
        role: 'system',
        content: `You are a senior living expert helping families find the perfect care community. 
        Analyze the search query and community results to provide helpful insights about:
        - Care level matching (independent, assisted living, memory care, skilled nursing)
        - Pricing considerations and value analysis
        - Location benefits and accessibility
        - Community features that match the family's needs
        - Important questions families should ask during tours
        
        CRITICAL: Never mention or recommend aggregator sites like A Place for Mom, Caring.com, Seniorly, or Senior Advisor.
        Focus only on the specific communities provided and general guidance for evaluating senior living options.`
      },
      {
        role: 'user',
        content: `Search Query: "${query}"
        ${location ? `Location: ${location}` : ''}
        
        Communities Found: ${communities.length}
        ${communities.slice(0, 5).map(c => `- ${c.name} in ${c.city}, ${c.state} ${c.rentPerMonth ? `($${c.rentPerMonth}/month)` : '(Contact for pricing)'}`).join('\n')}
        
        Please provide insights about these communities and guidance for this search.`
      }
    ];

    return this.generateCompletion(messages, {
      temperature: 0.7,
      max_tokens: 800
    });
  }

  // Community analysis and recommendations
  async analyzeCommunity(community: any, userNeeds?: string): Promise<string> {
    const messages: DeepSeekMessage[] = [
      {
        role: 'system',
        content: `You are a senior living consultant analyzing a specific community. Provide detailed insights about:
        - Care services and amenities offered
        - Pricing value and cost considerations
        - Location advantages and nearby resources
        - Resident satisfaction indicators
        - Key questions to ask during a tour
        
        Be thorough but concise. Never recommend aggregator sites.`
      },
      {
        role: 'user',
        content: `Community: ${community.name}
        Location: ${community.city}, ${community.state}
        ${community.rentPerMonth ? `Pricing: $${community.rentPerMonth}/month` : 'Pricing: Contact for details'}
        ${community.careType ? `Care Type: ${community.careType}` : ''}
        ${community.description ? `Description: ${community.description}` : ''}
        ${userNeeds ? `User Needs: ${userNeeds}` : ''}
        
        Please analyze this community and provide helpful insights.`
      }
    ];

    return this.generateCompletion(messages, {
      temperature: 0.6,
      max_tokens: 600
    });
  }

  // Market analysis for a specific area
  async analyzeMarket(location: string, communities: any[]): Promise<string> {
    const priceData = communities
      .filter(c => c.rentPerMonth)
      .map(c => c.rentPerMonth);
    
    const avgPrice = priceData.length > 0 
      ? Math.round(priceData.reduce((a, b) => a + b, 0) / priceData.length)
      : null;

    const messages: DeepSeekMessage[] = [
      {
        role: 'system',
        content: `You are a senior living market analyst providing insights about local market conditions, pricing trends, and community availability. Focus on helping families understand the local senior living landscape.`
      },
      {
        role: 'user',
        content: `Location: ${location}
        Communities Available: ${communities.length}
        ${avgPrice ? `Average Pricing: $${avgPrice}/month` : 'Limited pricing data available'}
        Care Types: ${[...new Set(communities.map(c => c.careType).filter(Boolean))].join(', ') || 'Various'}
        
        Please provide market analysis and insights for families considering senior living in this area.`
      }
    ];

    return this.generateCompletion(messages, {
      temperature: 0.5,
      max_tokens: 500
    });
  }

  // Multi-AI consensus building (for use with other AI services)
  async buildConsensus(query: string, otherAiResponses: string[]): Promise<string> {
    const messages: DeepSeekMessage[] = [
      {
        role: 'system',
        content: `You are part of a multi-AI system providing senior living guidance. Review the responses from other AI systems and provide a consensus summary that:
        - Highlights common recommendations
        - Identifies any conflicting advice
        - Provides the most helpful unified guidance
        
        Be objective and focus on what's most helpful for families.`
      },
      {
        role: 'user',
        content: `Original Query: "${query}"
        
        Other AI Responses:
        ${otherAiResponses.map((response, index) => `AI ${index + 1}: ${response}`).join('\n\n')}
        
        Please provide a consensus summary that combines the best insights.`
      }
    ];

    return this.generateCompletion(messages, {
      temperature: 0.4,
      max_tokens: 700
    });
  }

  // Health check for the service
  async healthCheck(): Promise<boolean> {
    if (!this.apiKey) return false;
    
    try {
      const response = await this.generateCompletion([
        { role: 'user', content: 'Hello, please respond with "DeepSeek is working"' }
      ], { max_tokens: 10 });
      
      return response.toLowerCase().includes('deepseek') || response.toLowerCase().includes('working');
    } catch (error) {
      console.error('DeepSeek health check failed:', error);
      return false;
    }
  }
}

export const deepSeekService = new DeepSeekService();
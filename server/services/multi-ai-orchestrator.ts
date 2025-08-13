import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

// Multi-AI Orchestrator Service for AI Map Intelligence
// Combines ChatGPT, Perplexity, and Claude for comprehensive analysis

interface AIProvider {
  name: string;
  analyze: (query: string, context?: any) => Promise<any>;
}

class MultiAIOrchestrator {
  private openai: OpenAI | null = null;
  private anthropic: Anthropic | null = null;
  private perplexityApiKey: string | null = null;

  constructor() {
    // Initialize AI services if API keys are available
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }
    
    if (process.env.PERPLEXITY_API_KEY) {
      this.perplexityApiKey = process.env.PERPLEXITY_API_KEY;
    }
  }

  // Analyze location using multiple AI services
  async analyzeLocation(lat: number, lng: number, communityData: any[]) {
    const results: any = {
      location: { lat, lng },
      timestamp: new Date().toISOString(),
      providers: [],
      insights: {},
      recommendations: []
    };

    // Prepare context for AI analysis
    const context = {
      location: `${lat}, ${lng}`,
      nearbyCommunities: communityData.slice(0, 10),
      totalCommunities: communityData.length
    };

    // Run parallel AI analysis
    const analyses = await Promise.allSettled([
      this.analyzeWithClaude(context),
      this.analyzeWithChatGPT(context),
      this.analyzeWithPerplexity(context)
    ]);

    // Combine results from all AI providers
    analyses.forEach((result, index) => {
      const providerName = ['Claude', 'ChatGPT', 'Perplexity'][index];
      if (result.status === 'fulfilled' && result.value) {
        results.providers.push(providerName);
        
        // Merge insights
        if (result.value.insights) {
          Object.assign(results.insights, result.value.insights);
        }
        
        // Combine recommendations
        if (result.value.recommendations) {
          if (Array.isArray(result.value.recommendations)) {
            results.recommendations.push(...result.value.recommendations);
          } else {
            results.recommendations.push(result.value.recommendations);
          }
        }
      }
    });

    // Synthesize final analysis
    results.summary = this.synthesizeAnalysis(results);
    
    return results;
  }

  // Claude Analysis - Focus on comprehensive understanding
  private async analyzeWithClaude(context: any) {
    if (!this.anthropic) return null;

    try {
      const prompt = `Analyze this senior living location and nearby communities. 
        Location: ${context.location}
        Nearby communities: ${context.nearbyCommunities.length} found
        
        Provide insights on:
        1. Area suitability for seniors
        2. Community density and options
        3. Key considerations for families
        4. Recommendations based on the area
        
        Format as JSON with insights and recommendations.`;

      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022', // Using Claude 3.5 Sonnet
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      });

      const content = response.content[0];
      if (content.type === 'text') {
        try {
          return JSON.parse(content.text);
        } catch {
          return {
            insights: { claude_analysis: content.text },
            recommendations: []
          };
        }
      }
    } catch (error) {
      console.error('Claude analysis error:', error);
      return null;
    }
  }

  // ChatGPT Analysis - Focus on detailed recommendations
  private async analyzeWithChatGPT(context: any) {
    if (!this.openai) return null;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o', // Using latest GPT-4o model
        messages: [
          {
            role: 'system',
            content: 'You are an expert in senior living analysis. Provide detailed, actionable recommendations in JSON format.'
          },
          {
            role: 'user',
            content: `Analyze this senior living area:
              Location: ${context.location}
              Communities found: ${context.totalCommunities}
              
              Provide:
              1. Market analysis
              2. Quality indicators
              3. Pricing insights
              4. Family decision factors
              
              Return as JSON with insights and recommendations arrays.`
          }
        ],
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0].message.content;
      return content ? JSON.parse(content) : null;
    } catch (error) {
      console.error('ChatGPT analysis error:', error);
      return null;
    }
  }

  // Perplexity Analysis - Focus on real-time web information
  private async analyzeWithPerplexity(context: any) {
    if (!this.perplexityApiKey) return null;

    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.perplexityApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'sonar-small-online',
          messages: [
            {
              role: 'system',
              content: 'Provide current, factual information about senior living in the specified area. Be precise and concise.'
            },
            {
              role: 'user',
              content: `What are the current senior living trends and important factors for the area at coordinates ${context.location}? Include recent developments, pricing trends, and quality indicators.`
            }
          ],
          temperature: 0.2,
          top_p: 0.9,
          return_related_questions: false,
          search_recency_filter: 'month',
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        insights: {
          market_trends: data.choices[0]?.message?.content || 'No trends available',
          citations: data.citations || []
        },
        recommendations: []
      };
    } catch (error) {
      console.error('Perplexity analysis error:', error);
      return null;
    }
  }

  // Search enhancement using multi-AI consensus
  async enhanceSearch(query: string, filters?: any) {
    const enhancements: any = {
      originalQuery: query,
      enhancedQueries: [],
      suggestedFilters: {},
      semanticExpansions: []
    };

    // Get enhancements from each AI
    const aiEnhancements = await Promise.allSettled([
      this.getClaudeSearchEnhancement(query),
      this.getChatGPTSearchEnhancement(query),
      this.getPerplexitySearchEnhancement(query)
    ]);

    // Combine and deduplicate enhancements
    aiEnhancements.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        if (result.value.enhancedQuery) {
          enhancements.enhancedQueries.push(result.value.enhancedQuery);
        }
        if (result.value.filters) {
          Object.assign(enhancements.suggestedFilters, result.value.filters);
        }
        if (result.value.expansions) {
          if (Array.isArray(result.value.expansions)) {
            enhancements.semanticExpansions.push(...result.value.expansions);
          } else {
            enhancements.semanticExpansions.push(result.value.expansions);
          }
        }
      }
    });

    // Remove duplicates
    enhancements.enhancedQueries = [...new Set(enhancements.enhancedQueries)];
    enhancements.semanticExpansions = [...new Set(enhancements.semanticExpansions)];

    return enhancements;
  }

  private async getClaudeSearchEnhancement(query: string) {
    if (!this.anthropic) return null;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: `Enhance this senior living search query: "${query}"
            
            Provide:
            1. An improved query
            2. Suggested filters (care types, price ranges, etc.)
            3. Related search terms
            
            Return as JSON.`
        }]
      });

      const content = response.content[0];
      if (content.type === 'text') {
        try {
          return JSON.parse(content.text);
        } catch {
          return { enhancedQuery: query };
        }
      }
    } catch (error) {
      console.error('Claude search enhancement error:', error);
      return null;
    }
  }

  private async getChatGPTSearchEnhancement(query: string) {
    if (!this.openai) return null;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: `Enhance this senior living search: "${query}". Return JSON with enhancedQuery, filters, and expansions.`
          }
        ],
        response_format: { type: 'json_object' }
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('ChatGPT search enhancement error:', error);
      return null;
    }
  }

  private async getPerplexitySearchEnhancement(query: string) {
    if (!this.perplexityApiKey) return null;

    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.perplexityApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'sonar-small-online',
          messages: [
            {
              role: 'user',
              content: `What are the current best practices for searching "${query}" in senior living? Include trending terms and important factors.`
            }
          ],
          temperature: 0.3,
          stream: false
        })
      });

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      
      // Extract key terms from the response
      const terms = content.match(/["']([^"']+)["']/g) || [];
      
      return {
        enhancedQuery: query,
        expansions: terms.map((t: string) => t.replace(/["']/g, ''))
      };
    } catch (error) {
      console.error('Perplexity search enhancement error:', error);
      return null;
    }
  }

  // Synthesize analysis from multiple AI sources
  private synthesizeAnalysis(results: any) {
    const providerCount = results.providers.length;
    
    if (providerCount === 0) {
      return 'AI analysis temporarily unavailable. Showing community data only.';
    }

    const insights = Object.values(results.insights).filter(i => i).join(' ');
    const recommendationCount = results.recommendations.length;

    return `Analysis from ${providerCount} AI providers: ${results.providers.join(', ')}. 
            Generated ${recommendationCount} recommendations and ${Object.keys(results.insights).length} key insights.
            ${insights.substring(0, 200)}...`;
  }

  // Community matching with AI consensus
  async matchCommunities(userPreferences: any, communities: any[]) {
    const matches: any[] = [];

    // Get matching scores from each AI
    const aiMatches = await Promise.allSettled([
      this.getClaudeMatches(userPreferences, communities),
      this.getChatGPTMatches(userPreferences, communities),
      this.getPerplexityContext(userPreferences)
    ]);

    // Combine and score matches
    const scoredCommunities = new Map();
    
    aiMatches.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        const matches = result.value.matches || [];
        if (Array.isArray(matches)) {
          matches.forEach((match: any) => {
            const existing = scoredCommunities.get(match.id) || { 
              ...match, 
              scores: [], 
              reasons: [] 
            };
            existing.scores.push(match.score || 0);
            existing.reasons.push(match.reason || '');
            scoredCommunities.set(match.id, existing);
          });
        }
      }
    });

    // Calculate final scores and sort
    scoredCommunities.forEach((community) => {
      const avgScore = community.scores.reduce((a: number, b: number) => a + b, 0) / community.scores.length;
      matches.push({
        ...community,
        finalScore: avgScore,
        consensus: community.scores.length,
        reasoning: [...new Set(community.reasons)].join('; ')
      });
    });

    return matches.sort((a, b) => b.finalScore - a.finalScore).slice(0, 10);
  }

  private async getClaudeMatches(preferences: any, communities: any[]) {
    if (!this.anthropic) return null;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `Match communities to user preferences:
            Preferences: ${JSON.stringify(preferences)}
            Communities: ${JSON.stringify(communities.slice(0, 20))}
            
            Return JSON array of matches with id, score (0-100), and reason.`
        }]
      });

      const content = response.content[0];
      if (content.type === 'text') {
        try {
          return { matches: JSON.parse(content.text) };
        } catch {
          return null;
        }
      }
    } catch (error) {
      console.error('Claude matching error:', error);
      return null;
    }
  }

  private async getChatGPTMatches(preferences: any, communities: any[]) {
    if (!this.openai) return null;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{
          role: 'user',
          content: `Score these communities (0-100) based on preferences. Return JSON array with id, score, reason.
            Preferences: ${JSON.stringify(preferences)}
            Communities: ${JSON.stringify(communities.slice(0, 20))}`
        }],
        response_format: { type: 'json_object' }
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('ChatGPT matching error:', error);
      return null;
    }
  }

  private async getPerplexityContext(preferences: any) {
    if (!this.perplexityApiKey) return null;

    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.perplexityApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'sonar-small-online',
          messages: [{
            role: 'user',
            content: `What are current best practices for matching senior living communities to these preferences: ${JSON.stringify(preferences)}?`
          }],
          temperature: 0.2,
          stream: false
        })
      });

      const data = await response.json();
      // Perplexity provides context, not direct matches
      return { context: data.choices?.[0]?.message?.content || 'No additional context' };
    } catch (error) {
      console.error('Perplexity context error:', error);
      return null;
    }
  }
}

export const multiAIOrchestrator = new MultiAIOrchestrator();
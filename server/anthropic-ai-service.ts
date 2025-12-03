import Anthropic from '@anthropic-ai/sdk';
import { aiTracker } from './services/ai-tracker.service';

/*
The newest Anthropic model is "claude-sonnet-4-20250514", not "claude-3-7-sonnet-20250219", "claude-sonnet-4-20250514" nor "claude-3-sonnet-20240229". 
If the user doesn't specify a model, always prefer using "claude-sonnet-4-20250514" as it is the latest model.
*/

// <important_do_not_delete>
const DEFAULT_MODEL_STR = "claude-sonnet-4-20250514";
// </important_do_not_delete>

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface SearchIntent {
  location?: {
    city?: string;
    state?: string;
    zipCode?: string;
    county?: string;
    latitude?: number;
    longitude?: number;
  };
  careTypes?: string[];
  priceRange?: {
    min?: number;
    max?: number;
  };
  amenities?: string[];
  specialNeeds?: string[];
  searchType: 'location' | 'community_name' | 'care_type' | 'complex_query';
  originalQuery: string;
}

export async function interpretSearchQuery(query: string): Promise<SearchIntent> {
  const startTime = Date.now();
  try {
    const systemPrompt = `You are MySeniorValet's search interpreter - helping connect families with publicly available senior living information.
    
ABOUT MYSENIORVALET: We're a technology platform that connects families with existing resources about 34,000+ communities across U.S. & Canada. We enable access to public information through our AI orchestration system.

Available care types: "Assisted Living", "Memory Care", "Independent Living", "Skilled Nursing", "Continuing Care", "Adult Day Care", "Hospice Care", "Respite Care", "Home Care"

Available amenities: "Pet Friendly", "Pool", "Fitness Center", "Library", "Garden", "Transportation", "Meals Included", "24/7 Staff", "Security", "Housekeeping", "Laundry Service", "Medical Services", "Physical Therapy", "Occupational Therapy", "Speech Therapy", "Social Activities", "Religious Services", "Beauty Salon", "WiFi"

Parse the user's query and return a JSON object with the search intent. Be flexible with natural language variations.

Examples:
- "memory care in Sacramento" -> location search with care type filter
- "cheap assisted living near 95825" -> location search with price and care type filters
- "pet friendly communities in San Francisco" -> location search with amenity filter
- "nursing homes under $3000" -> care type search with price filter`;

    const userPrompt = `Parse this search query: "${query}"

Return a JSON object with these fields:
{
  "location": {
    "city": "string or null",
    "state": "string or null", 
    "zipCode": "string or null",
    "county": "string or null"
  },
  "careTypes": ["array of matching care types"],
  "priceRange": {
    "min": number or null,
    "max": number or null
  },
  "amenities": ["array of matching amenities"],
  "specialNeeds": ["array of special requirements mentioned"],
  "searchType": "location|community_name|care_type|complex_query",
  "originalQuery": "${query}"
}`;

    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt }
      ],
    });

    const responseTime = Date.now() - startTime;
    
    // Extract the JSON from the response
    const responseText = response.content[0].type === 'text' ? response.content[0].text : '';
    
    // Track successful Claude API call to database
    await aiTracker.trackClaudeCall({
      action: 'interpret_search',
      context: 'search_query_interpretation',
      requestDuration: responseTime,
      success: true,
      inputTokens: Math.ceil(userPrompt.length / 4),
      outputTokens: Math.ceil(responseText.length / 4),
      prompt: userPrompt,
      response: responseText.substring(0, 500),
    });
    
    // Try to find JSON in the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const searchIntent = JSON.parse(jsonMatch[0]) as SearchIntent;
    
    // Validate and clean the response
    if (!searchIntent.searchType) {
      searchIntent.searchType = 'complex_query';
    }
    
    searchIntent.originalQuery = query;
    
    return searchIntent;
  } catch (error) {
    // Track failed Claude API call to database
    const responseTime = Date.now() - startTime;
    await aiTracker.trackClaudeCall({
      action: 'interpret_search',
      context: 'search_query_interpretation',
      requestDuration: responseTime,
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });
    
    console.error('Error interpreting search query:', error);
    
    // Fallback to basic parsing
    return {
      location: {
        city: query.split(',')[0]?.trim() || undefined,
        state: query.split(',')[1]?.trim() || undefined,
      },
      searchType: 'location',
      originalQuery: query
    };
  }
}

export async function generateSearchSuggestions(partialQuery: string): Promise<string[]> {
  const startTime = Date.now();
  try {
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      max_tokens: 256,
      system: `You are a search suggestion generator for a senior living community platform. Generate 3-5 relevant search suggestions based on the partial query. Focus on common searches for senior care.

Return suggestions as a JSON array of strings.

Examples:
- "mem" -> ["memory care near me", "memory care facilities", "memory care in California", "memory care costs"]
- "assist" -> ["assisted living near me", "assisted living costs", "assisted living vs nursing home", "assisted living in Sacramento"]`,
      messages: [
        { 
          role: 'user', 
          content: `Generate search suggestions for: "${partialQuery}"\n\nReturn as JSON array.`
        }
      ],
    });

    const responseTime = Date.now() - startTime;
    const responseText = response.content[0].type === 'text' ? response.content[0].text : '';
    
    await aiTracker.trackClaudeCall({
      action: 'generate_suggestions',
      context: 'search_suggestions',
      requestDuration: responseTime,
      success: true,
      inputTokens: Math.ceil(partialQuery.length / 4),
      outputTokens: Math.ceil(responseText.length / 4),
    });

    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return [];
  } catch (error) {
    const responseTime = Date.now() - startTime;
    await aiTracker.trackClaudeCall({
      action: 'generate_suggestions',
      context: 'search_suggestions',
      requestDuration: responseTime,
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });
    console.error('Error generating suggestions:', error);
    return [];
  }
}

export async function enhanceSearchResults(query: string, results: any[]): Promise<string> {
  const startTime = Date.now();
  try {
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      max_tokens: 512,
      system: `You are a helpful assistant for seniors and their families searching for senior living communities. Provide a brief, friendly summary of the search results.`,
      messages: [
        {
          role: 'user',
          content: `User searched for: "${query}"
          
Found ${results.length} communities. Here are the top results:
${results.slice(0, 3).map(r => `- ${r.name} in ${r.city}, ${r.state}`).join('\n')}

Provide a 2-3 sentence summary of what was found and any helpful context.`
        }
      ],
    });

    const responseTime = Date.now() - startTime;
    const responseText = response.content[0].type === 'text' ? response.content[0].text : '';
    
    await aiTracker.trackClaudeCall({
      action: 'enhance_search',
      context: 'search_results_enhancement',
      requestDuration: responseTime,
      success: true,
      inputTokens: Math.ceil(query.length / 4),
      outputTokens: Math.ceil(responseText.length / 4),
    });
    
    return responseText;
  } catch (error) {
    const responseTime = Date.now() - startTime;
    await aiTracker.trackClaudeCall({
      action: 'enhance_search',
      context: 'search_results_enhancement',
      requestDuration: responseTime,
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });
    console.error('Error enhancing search results:', error);
    return `Found ${results.length} communities matching your search.`;
  }
}

// Export class for build compatibility
export class AnthropicAIService {
  static interpretSearchQuery = interpretSearchQuery;
  static generateSearchSuggestions = generateSearchSuggestions;
  static enhanceSearchResults = enhanceSearchResults;
  
  // Instance methods for AI matching compatibility
  isConfigured(): boolean {
    return !!process.env.ANTHROPIC_API_KEY;
  }
  
  async analyze(prompt: string): Promise<string> {
    const startTime = Date.now();
    try {
      if (!this.isConfigured()) {
        return 'AI service not configured';
      }
      
      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL_STR,
        max_tokens: 1024,
        messages: [
          { role: 'user', content: prompt }
        ],
      });
      
      const responseTime = Date.now() - startTime;
      const responseText = response.content[0].type === 'text' ? response.content[0].text : '';
      
      await aiTracker.trackClaudeCall({
        action: 'analyze',
        context: 'general_analysis',
        requestDuration: responseTime,
        success: true,
        inputTokens: Math.ceil(prompt.length / 4),
        outputTokens: Math.ceil(responseText.length / 4),
      });
      
      return responseText;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      await aiTracker.trackClaudeCall({
        action: 'analyze',
        context: 'general_analysis',
        requestDuration: responseTime,
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
      console.error('Error in AI analysis:', error);
      return 'Analysis unavailable at this time';
    }
  }

  // Static method for enhanced search intelligence compatibility
  static async analyzeText(prompt: string): Promise<string> {
    const startTime = Date.now();
    try {
      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL_STR,
        max_tokens: 1024,
        messages: [
          { role: 'user', content: prompt }
        ],
      });
      
      const responseTime = Date.now() - startTime;
      const responseText = response.content[0].type === 'text' ? response.content[0].text : '';
      
      await aiTracker.trackClaudeCall({
        action: 'analyze_text',
        context: 'text_analysis',
        requestDuration: responseTime,
        success: true,
        inputTokens: Math.ceil(prompt.length / 4),
        outputTokens: Math.ceil(responseText.length / 4),
      });
      
      return responseText;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      await aiTracker.trackClaudeCall({
        action: 'analyze_text',
        context: 'text_analysis',
        requestDuration: responseTime,
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
      console.error('Error in AI text analysis:', error);
      return 'Analysis unavailable at this time';
    }
  }
}
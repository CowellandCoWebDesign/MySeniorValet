/**
 * Groq + Llama 3.3 70B Service
 * 
 * FREE replacement for Perplexity, Claude, and OpenAI
 * Uses Groq's lightning-fast inference with Llama 3.3 70B model
 * 
 * Free tier limits:
 * - 14,400 requests/day
 * - 500,000 tokens/day
 * - ~6,000 tokens/minute for some models
 */

import OpenAI from 'openai';

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

interface GroqResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: string;
}

interface SearchQuery {
  query: string;
  intent: string;
}

export class GroqLlamaService {
  private client: OpenAI | null = null;
  private readonly defaultModel = 'llama-3.3-70b-versatile';
  private readonly fallbackModels = [
    'llama-3.1-70b-versatile',
    'llama-3.1-8b-instant',
    'mixtral-8x7b-32768'
  ];
  
  private requestCount = 0;
  private tokenCount = 0;
  private lastResetTime = Date.now();
  private readonly DAILY_REQUEST_LIMIT = 14000; // Stay under 14,400
  private readonly DAILY_TOKEN_LIMIT = 480000; // Stay under 500,000
  
  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    
    if (apiKey) {
      this.client = new OpenAI({
        apiKey,
        baseURL: 'https://api.groq.com/openai/v1'
      });
      console.log('🚀 Groq + Llama 3.3 70B Service initialized (FREE tier)');
      console.log('   Model: llama-3.3-70b-versatile');
      console.log('   Daily limits: 14,400 requests, 500K tokens');
    } else {
      console.warn('⚠️ GROQ_API_KEY not configured - Groq service disabled');
    }
  }
  
  isConfigured(): boolean {
    return this.client !== null;
  }
  
  private resetDailyCountersIfNeeded(): void {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    if (now - this.lastResetTime > oneDayMs) {
      this.requestCount = 0;
      this.tokenCount = 0;
      this.lastResetTime = now;
      console.log('🔄 Groq daily counters reset');
    }
  }
  
  private checkLimits(): { allowed: boolean; reason?: string } {
    this.resetDailyCountersIfNeeded();
    
    if (this.requestCount >= this.DAILY_REQUEST_LIMIT) {
      return { allowed: false, reason: 'Daily request limit reached' };
    }
    
    if (this.tokenCount >= this.DAILY_TOKEN_LIMIT) {
      return { allowed: false, reason: 'Daily token limit reached' };
    }
    
    return { allowed: true };
  }
  
  async complete(
    prompt: string,
    options: GroqCompletionOptions = {}
  ): Promise<GroqResponse> {
    if (!this.client) {
      throw new Error('Groq service not configured - missing GROQ_API_KEY');
    }
    
    const limitCheck = this.checkLimits();
    if (!limitCheck.allowed) {
      throw new Error(`Groq rate limit: ${limitCheck.reason}`);
    }
    
    const {
      model = this.defaultModel,
      temperature = 0.7,
      maxTokens = 4096,
      systemPrompt = 'You are a helpful AI assistant specializing in senior living and care communities. Provide accurate, detailed, and compassionate information.'
    } = options;
    
    const messages: GroqMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ];
    
    let lastError: Error | null = null;
    const modelsToTry = [model, ...this.fallbackModels.filter(m => m !== model)];
    
    for (const currentModel of modelsToTry) {
      try {
        const response = await this.client.chat.completions.create({
          model: currentModel,
          messages,
          temperature,
          max_tokens: maxTokens
        });
        
        this.requestCount++;
        const usage = response.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
        this.tokenCount += usage.total_tokens;
        
        const content = response.choices[0]?.message?.content || '';
        
        console.log(`✅ Groq (${currentModel}): ${usage.total_tokens} tokens used`);
        
        return {
          content,
          model: currentModel,
          usage: {
            promptTokens: usage.prompt_tokens,
            completionTokens: usage.completion_tokens,
            totalTokens: usage.total_tokens
          },
          finishReason: response.choices[0]?.finish_reason || 'unknown'
        };
      } catch (error: any) {
        lastError = error;
        console.warn(`⚠️ Groq model ${currentModel} failed:`, error.message);
        
        // If rate limited, wait and retry with same model
        if (error.status === 429) {
          const retryAfter = parseInt(error.headers?.['retry-after'] || '60', 10);
          console.log(`⏳ Rate limited, waiting ${retryAfter}s...`);
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          continue;
        }
        
        // Try next model
        continue;
      }
    }
    
    throw lastError || new Error('All Groq models failed');
  }
  
  /**
   * Generate search queries for web discovery
   * Replaces Perplexity's query generation capability
   */
  async generateSearchQueries(
    communityName: string,
    location: string,
    intent: 'general' | 'pricing' | 'photos' | 'reviews' = 'general'
  ): Promise<SearchQuery[]> {
    const prompt = `Generate 3-5 specific search queries to find information about "${communityName}" senior living community in ${location}.

Intent: ${intent}

Requirements:
- Queries should be optimized for web search engines
- Include the community name and location
- Focus on finding: ${intent === 'pricing' ? 'pricing, costs, fees, rates' : 
                     intent === 'photos' ? 'photos, images, virtual tours, gallery' :
                     intent === 'reviews' ? 'reviews, ratings, testimonials' :
                     'general information, services, amenities, contact'}

Return ONLY a JSON array of objects with "query" and "intent" fields. No other text.
Example: [{"query": "Sunrise Senior Living pricing costs 2024", "intent": "pricing"}]`;

    try {
      const response = await this.complete(prompt, {
        temperature: 0.3,
        maxTokens: 500,
        systemPrompt: 'You are a search query optimization expert. Return only valid JSON arrays.'
      });
      
      // Extract JSON from response
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback: generate basic queries
      return this.getDefaultSearchQueries(communityName, location, intent);
    } catch (error) {
      console.error('Failed to generate search queries:', error);
      return this.getDefaultSearchQueries(communityName, location, intent);
    }
  }
  
  private getDefaultSearchQueries(
    communityName: string,
    location: string,
    intent: string
  ): SearchQuery[] {
    const baseQuery = `"${communityName}" ${location}`;
    
    const queries: SearchQuery[] = [
      { query: `${baseQuery} senior living`, intent: 'general' },
      { query: `${baseQuery} reviews ratings`, intent: 'reviews' }
    ];
    
    if (intent === 'pricing' || intent === 'general') {
      queries.push({ query: `${baseQuery} pricing cost monthly`, intent: 'pricing' });
    }
    
    if (intent === 'photos' || intent === 'general') {
      queries.push({ query: `${baseQuery} photos gallery virtual tour`, intent: 'photos' });
    }
    
    return queries;
  }
  
  /**
   * Synthesize information from search results
   * Replaces Perplexity's answer synthesis capability
   */
  async synthesizeSearchResults(
    communityName: string,
    location: string,
    searchResults: Array<{ title: string; url: string; snippet: string }>,
    websiteContent?: string
  ): Promise<{
    summary: string;
    pricing?: string;
    phone?: string;
    website?: string;
    amenities?: string[];
    careTypes?: string[];
    sources: string[];
  }> {
    const sourcesText = searchResults.map((r, i) => 
      `[${i + 1}] ${r.title}\nURL: ${r.url}\n${r.snippet}`
    ).join('\n\n');
    
    const websiteSection = websiteContent ? 
      `\n\nWEBSITE CONTENT:\n${websiteContent.slice(0, 3000)}` : '';
    
    const prompt = `Analyze the following search results about "${communityName}" senior living community in ${location}.

SEARCH RESULTS:
${sourcesText}
${websiteSection}

CRITICAL: Extract ALL available information, especially PRICING. Look for:
- Monthly rates (e.g., "$3,500/month", "starting at $4,000", "$2,800 - $5,500")
- Different care level costs (assisted living, memory care, independent living)
- Entry fees or community fees
- Any price mentions in snippets

Format your response as JSON:
{
  "summary": "2-3 paragraph description of the community including services and atmosphere",
  "pricing": "All pricing info found. Example: 'Assisted Living: $3,500-$5,000/month. Memory Care: $5,000-$7,000/month.'",
  "phone": "Primary contact phone number with area code",
  "website": "Official website URL (must start with http)",
  "amenities": ["List", "of", "amenities", "and", "services"],
  "careTypes": ["Independent Living", "Assisted Living", "Memory Care", "etc"],
  "sources": ["url1", "url2", "url3"]
}

IMPORTANT: For pricing, extract ANY dollar amounts mentioned. If no exact pricing found, note "Contact for pricing" but include any price ranges or starting prices mentioned. Do not return null for pricing if any dollar amounts are in the content.`;

    try {
      const response = await this.complete(prompt, {
        temperature: 0.3,
        maxTokens: 2000,
        systemPrompt: 'You are an expert at extracting and synthesizing information about senior living communities. Always cite sources and be accurate.'
      });
      
      // Extract JSON from response
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          summary: parsed.summary || '',
          pricing: parsed.pricing || undefined,
          phone: parsed.phone || undefined,
          website: parsed.website || undefined,
          amenities: parsed.amenities || [],
          careTypes: parsed.careTypes || [],
          sources: parsed.sources || searchResults.map(r => r.url)
        };
      }
      
      // Fallback: return raw content as summary
      return {
        summary: response.content,
        sources: searchResults.map(r => r.url)
      };
    } catch (error) {
      console.error('Failed to synthesize search results:', error);
      return {
        summary: `Information about ${communityName} in ${location}. Please contact the community directly for details.`,
        sources: searchResults.map(r => r.url)
      };
    }
  }
  
  /**
   * Analyze community data - general purpose analysis
   * Replaces Claude's analysis capability
   */
  async analyzeData(
    data: any,
    analysisType: 'pricing' | 'quality' | 'comparison' | 'recommendation' | 'general',
    context?: string
  ): Promise<string> {
    const prompt = `Analyze the following data for a senior living community.

DATA:
${JSON.stringify(data, null, 2)}

${context ? `CONTEXT: ${context}` : ''}

Analysis type: ${analysisType}

Provide a detailed ${analysisType} analysis. Be specific, accurate, and helpful for families researching senior living options.`;

    const response = await this.complete(prompt, {
      temperature: 0.5,
      maxTokens: 2000,
      systemPrompt: `You are a senior living industry expert providing ${analysisType} analysis. Be thorough, compassionate, and practical.`
    });
    
    return response.content;
  }
  
  /**
   * Chat completion for conversational AI
   * Replaces OpenAI's chat capability
   */
  async chat(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    systemPrompt?: string
  ): Promise<string> {
    if (!this.client) {
      throw new Error('Groq service not configured');
    }
    
    const limitCheck = this.checkLimits();
    if (!limitCheck.allowed) {
      throw new Error(`Groq rate limit: ${limitCheck.reason}`);
    }
    
    const fullMessages: GroqMessage[] = [
      { 
        role: 'system', 
        content: systemPrompt || 'You are MySeniorValet AI, a helpful assistant specializing in senior living communities. Help families find the right care options with compassion and expertise.'
      },
      ...messages.map(m => ({ role: m.role, content: m.content }))
    ];
    
    try {
      const response = await this.client.chat.completions.create({
        model: this.defaultModel,
        messages: fullMessages,
        temperature: 0.7,
        max_tokens: 2048
      });
      
      this.requestCount++;
      const usage = response.usage || { total_tokens: 0 };
      this.tokenCount += usage.total_tokens;
      
      return response.choices[0]?.message?.content || '';
    } catch (error: any) {
      console.error('Groq chat error:', error);
      throw error;
    }
  }
  
  /**
   * Web-enabled search using Groq Compound model
   * This uses Groq's built-in Tavily-powered web search
   * Returns synthesized information with sources
   */
  async webSearch(
    communityName: string,
    location: string
  ): Promise<{
    summary: string;
    pricing?: string;
    phone?: string;
    website?: string;
    amenities?: string[];
    careTypes?: string[];
    sources: Array<{ title: string; url: string; snippet: string }>;
    rawContent: string;
  }> {
    if (!this.client) {
      throw new Error('Groq service not configured - missing GROQ_API_KEY');
    }
    
    const limitCheck = this.checkLimits();
    if (!limitCheck.allowed) {
      throw new Error(`Groq rate limit: ${limitCheck.reason}`);
    }
    
    console.log(`🔍 Groq Compound web search for: ${communityName}, ${location}`);
    
    const searchPrompt = `Search the web for comprehensive information about "${communityName}" senior living community in ${location}.

Find and provide:
1. Overview and description of the community
2. Pricing information (monthly costs, fees, pricing tiers)
3. Contact information (phone number, website)
4. Care types offered (assisted living, memory care, independent living, etc.)
5. Amenities and services
6. Reviews and ratings if available

Return your findings in this JSON format:
{
  "summary": "Detailed description of the community...",
  "pricing": "Pricing information found (e.g., '$3,500 - $5,500/month for assisted living')",
  "phone": "Phone number if found",
  "website": "Official website URL if found",
  "amenities": ["amenity1", "amenity2"],
  "careTypes": ["Assisted Living", "Memory Care"],
  "sources": [{"title": "Source title", "url": "https://...", "snippet": "Relevant excerpt"}]
}

If information is not found, omit that field. Be thorough and cite your sources.`;

    try {
      // Try compound model first (has built-in web search via Tavily)
      // Model ID: groq/compound - NOT compound-beta
      const response = await this.client.chat.completions.create({
        model: 'groq/compound', // Correct model ID for Groq Compound with web search
        messages: [
          {
            role: 'system',
            content: 'You are a senior living research assistant with web search capabilities. Search the web thoroughly and provide accurate, sourced information about senior living communities. Always cite your sources.'
          },
          { role: 'user', content: searchPrompt }
        ],
        temperature: 0.3,
        max_tokens: 4096
      });
      
      this.requestCount++;
      const usage = response.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
      this.tokenCount += usage.total_tokens;
      
      const content = response.choices[0]?.message?.content || '';
      console.log(`✅ Groq Compound search complete: ${usage.total_tokens} tokens`);
      
      // Parse the JSON response
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            summary: parsed.summary || `${communityName} is a senior living community in ${location}.`,
            pricing: parsed.pricing,
            phone: parsed.phone,
            website: parsed.website,
            amenities: parsed.amenities || [],
            careTypes: parsed.careTypes || [],
            sources: parsed.sources || [],
            rawContent: content
          };
        }
      } catch (parseError) {
        console.warn('Failed to parse Groq Compound response as JSON');
      }
      
      // Return raw content if JSON parsing fails
      return {
        summary: content,
        sources: [],
        rawContent: content
      };
      
    } catch (error: any) {
      // If compound model fails, try with compound-mini
      console.warn(`Groq groq/compound failed: ${error.message}, trying groq/compound-mini...`);
      
      try {
        const fallbackResponse = await this.client.chat.completions.create({
          model: 'groq/compound-mini', // Correct fallback model ID
          messages: [
            {
              role: 'system',
              content: 'You are a senior living research assistant. Search the web and provide accurate information about senior living communities.'
            },
            { role: 'user', content: searchPrompt }
          ],
          temperature: 0.3,
          max_tokens: 2048
        });
        
        this.requestCount++;
        const usage = fallbackResponse.usage || { total_tokens: 0 };
        this.tokenCount += usage.total_tokens;
        
        const content = fallbackResponse.choices[0]?.message?.content || '';
        console.log(`✅ Groq Compound-mini search complete: ${usage.total_tokens} tokens`);
        
        // Try to parse JSON
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
              summary: parsed.summary || `${communityName} is a senior living community in ${location}.`,
              pricing: parsed.pricing,
              phone: parsed.phone,
              website: parsed.website,
              amenities: parsed.amenities || [],
              careTypes: parsed.careTypes || [],
              sources: parsed.sources || [],
              rawContent: content
            };
          }
        } catch (parseError) {
          // Continue with raw content
        }
        
        return {
          summary: content,
          sources: [],
          rawContent: content
        };
        
      } catch (fallbackError: any) {
        console.error('Both Groq Compound models failed:', fallbackError.message);
        throw fallbackError;
      }
    }
  }
  
  /**
   * Discovery search - finds senior living directory URLs for a location
   * Specifically designed for the Groq → Crawlee discovery pipeline
   */
  async discoveryCommunitySearch(
    location: string
  ): Promise<{
    sources: Array<{ title: string; url: string; snippet: string }>;
    rawContent: string;
  }> {
    if (!this.client) {
      throw new Error('Groq service not configured - missing GROQ_API_KEY');
    }
    
    const limitCheck = this.checkLimits();
    if (!limitCheck.allowed) {
      throw new Error(`Groq rate limit: ${limitCheck.reason}`);
    }
    
    console.log(`🔍 Groq Discovery Search for: ${location}`);
    
    const searchPrompt = `Search the web and find senior living communities and facilities in ${location}.

I need URLs from reputable senior living directories like:
- A Place for Mom (aplaceformom.com)
- SeniorAdvisor (senioradvisor.com) 
- Caring.com
- Brookdale (brookdale.com)
- Senior Housing Net (seniorhousingnet.com)
- New LifeStyles (newlifestyles.com)

Return a JSON array of senior living community pages you find:
{
  "communities": [
    {"name": "Community Name", "url": "https://...", "snippet": "Brief description"},
    ...
  ]
}

Find at least 5-10 specific senior living communities in ${location}. Include the direct URL to each community's page on these directory sites.`;

    const maxRetries = 3;
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.client.chat.completions.create({
          model: 'groq/compound',
          messages: [
            {
              role: 'system',
              content: 'You are a senior living research assistant with web search capabilities. Find senior living community listings from directory websites. Return URLs to specific community pages, not just directory homepages.'
            },
            { role: 'user', content: searchPrompt }
          ],
          temperature: 0.2,
          max_tokens: 4096
        });
        
        this.requestCount++;
        const usage = response.usage || { total_tokens: 0 };
        this.tokenCount += usage.total_tokens;
        
        const content = response.choices[0]?.message?.content || '';
        console.log(`✅ Groq Discovery Search complete: ${usage.total_tokens} tokens`);
      
        // Parse the JSON response
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            const communities = parsed.communities || [];
            return {
              sources: communities.map((c: any) => ({
                title: c.name || '',
                url: c.url || '',
                snippet: c.snippet || c.description || ''
              })),
              rawContent: content
            };
          }
        } catch (parseError) {
          console.warn('Failed to parse Groq discovery response as JSON, extracting URLs...');
          
          // Extract URLs from raw content
          const urlMatches = content.match(/https?:\/\/[^\s\"\'\<\>]+/g) || [];
          const sources = urlMatches
            .filter((url: string) => 
              url.includes('aplaceformom.com') ||
              url.includes('senioradvisor.com') ||
              url.includes('caring.com') ||
              url.includes('brookdale.com') ||
              url.includes('seniorhousingnet.com') ||
              url.includes('newlifestyles.com')
            )
            .map((url: string) => ({ title: '', url, snippet: '' }));
          
          return { sources, rawContent: content };
        }
        
        return { sources: [], rawContent: content };
        
      } catch (error: any) {
        lastError = error;
        if (error.status === 429) {
          // Rate limit - wait and retry
          const waitTime = Math.min(2000 * attempt, 10000);
          console.log(`⏳ Rate limit hit (attempt ${attempt}/${maxRetries}), waiting ${waitTime/1000}s...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        // Non-rate-limit error, throw immediately
        console.error('Groq Discovery Search failed:', error.message);
        throw error;
      }
    }
    
    // All retries exhausted
    console.error('Groq Discovery Search failed after retries:', lastError?.message);
    throw lastError || new Error('Discovery search failed after retries');
  }
  
  /**
   * Get current usage stats
   */
  getUsageStats(): {
    requestsToday: number;
    tokensToday: number;
    requestsRemaining: number;
    tokensRemaining: number;
    percentUsed: number;
  } {
    this.resetDailyCountersIfNeeded();
    
    return {
      requestsToday: this.requestCount,
      tokensToday: this.tokenCount,
      requestsRemaining: Math.max(0, this.DAILY_REQUEST_LIMIT - this.requestCount),
      tokensRemaining: Math.max(0, this.DAILY_TOKEN_LIMIT - this.tokenCount),
      percentUsed: Math.round((this.tokenCount / this.DAILY_TOKEN_LIMIT) * 100)
    };
  }
}

// Singleton instance
export const groqLlamaService = new GroqLlamaService();

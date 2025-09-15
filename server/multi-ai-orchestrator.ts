/**
 * Multi-AI Orchestrator for MySeniorValet
 * Coordinates 5 AI services for comprehensive senior living intelligence
 * Enhanced with timeout handling and partial result support
 */

import { PerplexityAIService } from './perplexity-ai-service';
import { AnthropicAIService } from './anthropic-ai-service';
import { GrokAIService } from './grok-ai-service';
import { GeminiAIService } from './gemini-ai-service';
import { DeepSeekAIService } from './deepseek-ai-service';
import { ScalableCache } from './infrastructure/cache';

// Create instances of AI services (only for services that use instance methods)
const perplexityService = new PerplexityAIService();
const anthropicService = new AnthropicAIService();

// Default timeout for AI services (45 seconds for complex analysis, 30 seconds for web search)
const DEFAULT_AI_TIMEOUT = 45000; // Increased to 45 seconds for Claude/Gemini analysis
const WEB_SEARCH_TIMEOUT = 30000; // Keep 30 seconds for web search operations
const CLAUDE_TIMEOUT = 45000; // Specific timeout for Claude's deep analysis
const DEEPSEEK_TIMEOUT = 45000; // Specific timeout for DeepSeek's reasoning

// Cache for AI responses - 5 minute TTL to prevent duplicate calls
const aiResponseCache = new ScalableCache(1000, 5 * 60 * 1000);

// Log cache hits/misses for debugging duplicate calls
let cacheStats = { hits: 0, misses: 0, inProgress: 0 };

// Track AI calls in progress to prevent concurrent duplicate calls
const aiCallsInProgress = new Map<string, Promise<MultiAIResult>>();

export interface AIResponse {
  service: string;
  success: boolean;
  content?: string;
  data?: any;
  error?: string;
  model?: string;
  timestamp: string;
  processingTime?: number;
  costEstimate?: string;
  status?: 'success' | 'timeout' | 'error' | 'skipped';
  features?: string[];
  sources?: string[];
}

export interface MultiAIResult {
  query: string;
  responses: {
    perplexity?: AIResponse;
    claude?: AIResponse;
    grok?: AIResponse;
    gemini?: AIResponse;
    deepseek?: AIResponse;
  };
  consensus: {
    pricing?: {
      average: number;
      range: { min: number; max: number };
      confidence: number;
      sources: string[];
    };
    insights: string[];
    recommendations: string[];
    warnings: string[];
  };
  metadata: {
    totalProcessingTime: number;
    successfulServices: number;
    failedServices: number;
    timeoutServices: number;
    timestamp: string;
    partialResults: boolean;
  };
}

export class MultiAIOrchestrator {
  /**
   * Wrapper function to add timeout to any promise
   */
  private static async withTimeout<T>(
    promise: Promise<T>, 
    timeoutMs: number, 
    serviceName: string
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error(`${serviceName} timeout after ${timeoutMs}ms`)), timeoutMs)
      )
    ]);
  }

  /**
   * Execute a single AI service call with timeout handling
   */
  private static async callAIService(
    serviceName: string,
    serviceCall: () => Promise<any>,
    timeout: number = DEFAULT_AI_TIMEOUT
  ): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      const result = await this.withTimeout(serviceCall(), timeout, serviceName);
      const processingTime = Date.now() - startTime;
      
      // Handle successful response
      if (result && result.success !== false) {
        return {
          service: serviceName,
          success: true,
          content: result.content || result.summary || result.response || '',
          data: result,
          model: result.model || serviceName,
          timestamp: new Date().toISOString(),
          processingTime,
          status: 'success',
          features: result.features || [],
          sources: result.sources || []
        };
      } else {
        throw new Error('Empty response from service');
      }
    } catch (error: any) {
      const processingTime = Date.now() - startTime;
      const isTimeout = error.message?.includes('timeout');
      
      console.log(`⚠️ ${serviceName} ${isTimeout ? 'timed out' : 'failed'}: ${error.message}`);
      
      return {
        service: serviceName,
        success: false,
        error: error.message || `${serviceName} failed`,
        timestamp: new Date().toISOString(),
        processingTime,
        status: isTimeout ? 'timeout' : 'error'
      };
    }
  }

  /**
   * Execute search across all 5 AI services in parallel with timeout handling and caching
   */
  static async searchAllAIs(query: string, context?: any): Promise<MultiAIResult> {
    // Generate cache key based on query
    const cacheKey = `ai_multi:${query.substring(0, 100)}`;
    
    // Check if a call is already in progress for this query
    if (aiCallsInProgress.has(cacheKey)) {
      cacheStats.inProgress++;
      console.log(`⏳ Multi-AI call already in progress for query (prevented duplicate), waiting... [Stats: ${cacheStats.hits} hits, ${cacheStats.misses} misses, ${cacheStats.inProgress} deduplicated]`);
      return aiCallsInProgress.get(cacheKey)!;
    }
    
    // Check cache first
    const cached = aiResponseCache.get<MultiAIResult>(cacheKey);
    if (cached) {
      cacheStats.hits++;
      console.log(`✅ Using cached Multi-AI response (5-minute cache) [Stats: ${cacheStats.hits} hits, ${cacheStats.misses} misses, ${cacheStats.inProgress} deduplicated]`);
      return cached;
    }
    
    cacheStats.misses++;
    console.log(`🔍 Cache miss for Multi-AI query [Stats: ${cacheStats.hits} hits, ${cacheStats.misses} misses, ${cacheStats.inProgress} deduplicated]`);
    
    // Create promise for this AI call and track it
    const aiCallPromise = this.performSearchAllAIs(query, context, cacheKey);
    aiCallsInProgress.set(cacheKey, aiCallPromise);
    
    try {
      const result = await aiCallPromise;
      return result;
    } finally {
      // Clean up tracking
      aiCallsInProgress.delete(cacheKey);
    }
  }
  
  /**
   * Perform the actual multi-AI search
   */
  private static async performSearchAllAIs(query: string, context: any, cacheKey: string): Promise<MultiAIResult> {
    const startTime = Date.now();
    console.log(`🚀 Multi-AI Orchestrator: Processing query across 5 AI services with ${DEFAULT_AI_TIMEOUT}ms timeout`);
    console.log(`⚡ Web Search Enabled for: Perplexity, Grok, DeepSeek`);
    
    // Define all AI service calls with capabilities
    const aiServices = [
      {
        name: 'perplexity',
        call: () => perplexityService.searchRealTime(query, context),
        capabilities: ['web-search', 'real-time', 'citations'],
        timeout: WEB_SEARCH_TIMEOUT
      },
      {
        name: 'claude',
        call: () => anthropicService.searchAndAnalyze(query, context),
        capabilities: ['analysis', 'reasoning'],
        timeout: CLAUDE_TIMEOUT // Use specific Claude timeout for deep analysis
      },
      {
        name: 'grok',
        call: () => GrokAIService.searchAndAnalyze(query, context),
        capabilities: ['web-search', 'real-time', 'x-twitter', 'citations'],
        timeout: WEB_SEARCH_TIMEOUT
      },
      {
        name: 'gemini',
        call: () => GeminiAIService.searchAndAnalyze(query, context),
        capabilities: ['analysis', 'multimodal'],
        timeout: DEFAULT_AI_TIMEOUT
      },
      {
        name: 'deepseek',
        call: () => DeepSeekAIService.searchAndAnalyze(query, context),
        capabilities: ['web-search', 'deep-reasoning', 'cost-effective', 'citations'],
        timeout: DEEPSEEK_TIMEOUT // Use specific DeepSeek timeout for reasoning
      }
    ];
    
    // Execute all AI calls in parallel with timeout handling
    const servicePromises = aiServices.map(service => 
      this.callAIService(service.name, service.call, service.timeout)
    );
    
    // Use Promise.allSettled to get all results regardless of failures
    const results = await Promise.allSettled(servicePromises);
    
    // Process results
    const responses: MultiAIResult['responses'] = {};
    let successCount = 0;
    let failCount = 0;
    let timeoutCount = 0;
    
    results.forEach((result, index) => {
      const serviceName = aiServices[index].name;
      
      if (result.status === 'fulfilled') {
        const response = result.value;
        responses[serviceName as keyof MultiAIResult['responses']] = response;
        
        if (response.success) {
          successCount++;
          const features = response.features?.length ? ` [${response.features.join(', ')}]` : '';
          const sourceCount = response.sources?.length ? ` (${response.sources.length} sources)` : '';
          console.log(`✅ ${serviceName}: Success (${response.processingTime}ms)${features}${sourceCount}`);
        } else if (response.status === 'timeout') {
          timeoutCount++;
          console.log(`⏱️ ${serviceName}: Timeout`);
        } else {
          failCount++;
          console.log(`❌ ${serviceName}: Failed`);
        }
      } else {
        // This shouldn't happen with our error handling, but just in case
        failCount++;
        responses[serviceName as keyof MultiAIResult['responses']] = {
          service: serviceName,
          success: false,
          error: 'Unexpected failure',
          timestamp: new Date().toISOString(),
          status: 'error'
        };
      }
    });
    
    // Generate consensus from successful responses
    const consensus = this.generateConsensus(responses);
    
    const totalTime = Date.now() - startTime;
    const partialResults = successCount < aiServices.length;
    
    console.log(`✅ Multi-AI processing complete: ${successCount} successful, ${failCount} failed, ${timeoutCount} timed out in ${totalTime}ms`);
    if (partialResults) {
      console.log(`⚠️ Returning partial results from ${successCount}/${aiServices.length} services`);
    }
    
    const result: MultiAIResult = {
      query,
      responses,
      consensus,
      metadata: {
        totalProcessingTime: totalTime,
        successfulServices: successCount,
        failedServices: failCount,
        timeoutServices: timeoutCount,
        timestamp: new Date().toISOString(),
        partialResults
      }
    };
    
    // Cache the result if we got at least one successful response
    if (successCount > 0) {
      aiResponseCache.set(cacheKey, result);
      console.log(`💾 Cached multi-AI response for 5 minutes`);
    }
    
    return result;
  }
  
  /**
   * Get pricing estimates from all AIs with timeout handling
   */
  static async analyzePricing(communityInfo: any): Promise<any> {
    console.log(`💰 Multi-AI Pricing Analysis for ${communityInfo.name}`);
    
    const pricingQuery = `What is the current 2025 pricing for ${communityInfo.name} in ${communityInfo.city}, ${communityInfo.state}? Include all care levels, fees, and total monthly costs.`;
    
    const results = await this.searchAllAIs(pricingQuery, communityInfo);
    
    // Extract pricing from each AI response
    const prices: number[] = [];
    const priceDetails: any[] = [];
    const aiPerspectives: any[] = [];
    
    Object.entries(results.responses).forEach(([serviceName, response]) => {
      if (response) {
        // Add AI perspective even if failed
        aiPerspectives.push({
          service: serviceName,
          status: response.status || (response.success ? 'success' : 'error'),
          processingTime: response.processingTime
        });
        
        if (response.success && response.content) {
          // Extract prices using regex
          const priceMatches = response.content.match(/\$[\d,]+/g);
          if (priceMatches) {
            // Collect all prices from this AI service
            const servicePrices: number[] = [];
            
            priceMatches.forEach(match => {
              const price = parseInt(match.replace(/[$,]/g, ''));
              if (price > 500 && price < 20000) { // Reasonable monthly price range
                prices.push(price);
                servicePrices.push(price);
              }
            });
            
            // Create ONE consolidated entry per AI service (not per price)
            if (servicePrices.length > 0) {
              // Calculate average and range for this service
              servicePrices.sort((a, b) => a - b);
              const avgPrice = Math.round(servicePrices.reduce((sum, p) => sum + p, 0) / servicePrices.length);
              const minPrice = servicePrices[0];
              const maxPrice = servicePrices[servicePrices.length - 1];
              
              // Extract meaningful context (look for care levels or pricing details)
              let contextSummary = '';
              const contentLines = response.content.split('\n');
              for (const line of contentLines) {
                if (line.includes('$') || 
                    line.toLowerCase().includes('assisted living') || 
                    line.toLowerCase().includes('memory care') ||
                    line.toLowerCase().includes('independent living') ||
                    line.toLowerCase().includes('monthly') ||
                    line.toLowerCase().includes('pricing')) {
                  contextSummary = line.substring(0, 250);
                  break;
                }
              }
              
              // If no specific context found, use first non-empty line
              if (!contextSummary) {
                contextSummary = contentLines.find(line => line.trim().length > 0)?.substring(0, 200) || '';
              }
              
              // Add single consolidated entry for this AI service
              priceDetails.push({
                source: response.service,
                price: avgPrice,
                priceRange: servicePrices.length > 1 ? { min: minPrice, max: maxPrice } : null,
                priceCount: servicePrices.length,
                context: contextSummary
              });
            }
          }
        }
      }
    });
    
    // Calculate consensus pricing even with partial results
    if (prices.length > 0) {
      prices.sort((a, b) => a - b);
      const average = Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length);
      const median = prices[Math.floor(prices.length / 2)];
      
      return {
        success: true,
        pricing: {
          average,
          median,
          min: prices[0],
          max: prices[prices.length - 1],
          confidence: Math.min(95, 60 + (results.metadata.successfulServices * 7)),
          sources: priceDetails,
          aiServices: results.metadata.successfulServices,
          totalServices: 5,
          partialResults: results.metadata.partialResults
        },
        aiPerspectives,
        rawResponses: results.responses,
        metadata: results.metadata
      };
    }
    
    // Return partial failure with details about which services responded
    return {
      success: false,
      message: `Unable to determine pricing. ${results.metadata.successfulServices} of 5 AI services responded.`,
      aiPerspectives,
      rawResponses: results.responses,
      metadata: results.metadata
    };
  }
  
  /**
   * Enhanced Discovery Mode using all AIs with timeout handling
   */
  static async discoverCommunities(location: string, requirements?: any): Promise<any> {
    console.log(`🔮 Multi-AI Discovery Mode for ${location}`);
    
    const discoveryQuery = `Find all senior living communities in ${location}. Include assisted living, memory care, independent living, nursing homes, and continuing care retirement communities. Provide names, addresses, phone numbers, websites, and approximate pricing.`;
    
    const results = await this.searchAllAIs(discoveryQuery, requirements);
    
    // Extract communities from all AI responses
    const discoveredCommunities = new Map<string, any>();
    const aiContributions: any = {};
    
    Object.entries(results.responses).forEach(([serviceName, response]) => {
      aiContributions[serviceName] = {
        status: response?.status || 'unknown',
        communitiesFound: 0
      };
      
      if (response?.success && response.content) {
        // Parse communities from response
        const communities = this.extractCommunitiesFromText(response.content, location);
        aiContributions[serviceName].communitiesFound = communities.length;
        
        communities.forEach(community => {
          const key = `${community.name}-${community.city}`.toLowerCase();
          if (!discoveredCommunities.has(key)) {
            discoveredCommunities.set(key, {
              ...community,
              sources: [response.service],
              confidence: 60
            });
          } else {
            // Merge information from multiple sources
            const existing = discoveredCommunities.get(key);
            existing.sources.push(response.service);
            existing.confidence = Math.min(95, existing.confidence + 10);
            // Merge additional details
            if (!existing.phone && community.phone) existing.phone = community.phone;
            if (!existing.website && community.website) existing.website = community.website;
            if (!existing.pricing && community.pricing) existing.pricing = community.pricing;
          }
        });
      }
    });
    
    const communitiesArray = Array.from(discoveredCommunities.values());
    console.log(`✨ Discovered ${communitiesArray.length} unique communities from ${results.metadata.successfulServices} AI sources`);
    
    return {
      success: true,
      communities: communitiesArray,
      totalFound: communitiesArray.length,
      aiSources: results.metadata.successfulServices,
      aiContributions,
      consensus: results.consensus,
      metadata: results.metadata,
      partialResults: results.metadata.partialResults
    };
  }
  
  /**
   * Compare communities using all AI perspectives with timeout handling
   */
  static async compareCommunities(communities: any[]): Promise<any> {
    const compareQuery = `Compare these senior living communities: ${communities.map(c => c.name).join(', ')}. Analyze pricing, care quality, amenities, location, and value. Provide rankings and recommendations.`;
    
    const results = await this.searchAllAIs(compareQuery, { communities });
    
    // Aggregate comparisons from all AIs
    const comparisons: any = {
      rankings: [],
      insights: [],
      recommendations: [],
      aiPerspectives: []
    };
    
    Object.entries(results.responses).forEach(([serviceName, response]) => {
      const perspective = {
        service: serviceName,
        status: response?.status || 'unknown',
        analysis: null as any
      };
      
      if (response?.success && response.content) {
        perspective.analysis = response.content;
        comparisons.insights.push({
          source: response.service,
          analysis: response.content
        });
      }
      
      comparisons.aiPerspectives.push(perspective);
    });
    
    return {
      success: results.metadata.successfulServices > 0,
      comparisons,
      aiPerspectives: results.metadata.successfulServices,
      totalServices: 5,
      consensus: results.consensus,
      metadata: results.metadata,
      partialResults: results.metadata.partialResults
    };
  }
  
  /**
   * Generate consensus from multiple AI responses
   */
  private static generateConsensus(responses: MultiAIResult['responses']): MultiAIResult['consensus'] {
    const insights: string[] = [];
    const recommendations: string[] = [];
    const warnings: string[] = [];
    const prices: number[] = [];
    const allSources = new Set<string>();
    let successfulResponses = 0;
    let webSearchCount = 0;
    
    // Analyze each response
    Object.values(responses).forEach(response => {
      if (response?.success && response.content) {
        successfulResponses++;
        
        // Track web search capabilities
        if (response.features?.includes('web-search') || response.sources?.length) {
          webSearchCount++;
        }
        
        // Collect all sources
        if (response.sources) {
          response.sources.forEach(source => allSources.add(source));
        }
        
        // Extract meaningful insights from the response
        const contentLower = response.content.toLowerCase();
        const sentences = response.content.split(/[.!?]+/).filter(s => s.trim().length > 20);
        
        // Look for key insight indicators and extract relevant sentences
        sentences.forEach((sentence, idx) => {
          const sentenceLower = sentence.toLowerCase();
          const trimmedSentence = sentence.trim();
          
          // Prioritize sentences with key information
          if (
            sentenceLower.includes('pricing') ||
            sentenceLower.includes('cost') ||
            sentenceLower.includes('average') ||
            sentenceLower.includes('range') ||
            sentenceLower.includes('assisted living') ||
            sentenceLower.includes('memory care') ||
            sentenceLower.includes('amenities') ||
            sentenceLower.includes('features') ||
            sentenceLower.includes('offers') ||
            sentenceLower.includes('provides') ||
            sentenceLower.includes('specializes') ||
            sentenceLower.includes('reputation') ||
            sentenceLower.includes('rated') ||
            sentenceLower.includes('reviews') ||
            sentenceLower.includes('important') ||
            sentenceLower.includes('note that') ||
            sentenceLower.includes('typically') ||
            sentenceLower.includes('generally')
          ) {
            // Add service name prefix only for important insights
            const insight = `${response.service}: ${trimmedSentence}`;
            if (!insights.some(i => i.includes(trimmedSentence.substring(0, 50)))) {
              insights.push(insight);
            }
          }
        });
        
        // If no specific insights found, take the first 2 meaningful sentences
        if (insights.filter(i => i.includes(response.service)).length === 0 && sentences.length > 0) {
          insights.push(`${response.service}: ${sentences[0].trim()}`);
          if (sentences.length > 1) {
            insights.push(`${response.service}: ${sentences[1].trim()}`);
          }
        }
        
        // Extract prices
        const priceMatches = response.content.match(/\$[\d,]+/g);
        if (priceMatches) {
          priceMatches.forEach(match => {
            const price = parseInt(match.replace(/[$,]/g, ''));
            if (price > 500 && price < 20000) {
              prices.push(price);
            }
          });
        }
        
        // Look for warnings or concerns with more context
        const warningIndicators = ['warning', 'concern', 'be aware', 'caution', 'note that', 'keep in mind', 'important', 'limitation'];
        const warningSentences = sentences.filter(s => 
          warningIndicators.some(indicator => s.toLowerCase().includes(indicator))
        );
        
        warningSentences.forEach(sentence => {
          const trimmedSentence = sentence.trim();
          if (!warnings.some(w => w.includes(trimmedSentence.substring(0, 50)))) {
            warnings.push(trimmedSentence);
          }
        });
      }
    });
    
    // Generate pricing consensus if prices found
    let pricingConsensus = undefined;
    if (prices.length > 0) {
      prices.sort((a, b) => a - b);
      pricingConsensus = {
        average: Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length),
        range: { min: prices[0], max: prices[prices.length - 1] },
        confidence: Math.min(95, 60 + (prices.length * 10)),
        sources: Array.from(allSources)
      };
    }
    
    // Extract actionable recommendations from AI responses
    Object.values(responses).forEach(response => {
      if (response?.success && response.content) {
        const contentLower = response.content.toLowerCase();
        const sentences = response.content.split(/[.!?]+/).filter(s => s.trim().length > 20);
        
        sentences.forEach(sentence => {
          const sentenceLower = sentence.toLowerCase();
          const trimmedSentence = sentence.trim();
          
          // Look for recommendation indicators
          if (
            sentenceLower.includes('recommend') ||
            sentenceLower.includes('suggest') ||
            sentenceLower.includes('consider') ||
            sentenceLower.includes('should') ||
            sentenceLower.includes('advised') ||
            sentenceLower.includes('best to') ||
            sentenceLower.includes('important to') ||
            sentenceLower.includes('make sure') ||
            sentenceLower.includes('don\'t forget') ||
            sentenceLower.includes('would benefit') ||
            sentenceLower.includes('good idea')
          ) {
            if (!recommendations.some(r => r.includes(trimmedSentence.substring(0, 50)))) {
              recommendations.push(trimmedSentence);
            }
          }
        });
      }
    });
    
    // Add metadata recommendations if no specific ones found
    if (recommendations.length === 0) {
      if (successfulResponses > 0) {
        recommendations.push(`${successfulResponses} AI source${successfulResponses > 1 ? 's' : ''} analyzed this community`);
      }
      if (webSearchCount > 0) {
        recommendations.push(`Real-time data from ${webSearchCount} web-enabled AI${webSearchCount > 1 ? 's' : ''}`);
      }
      if (allSources.size > 0) {
        recommendations.push(`Analysis based on ${allSources.size} verified sources`);
      }
      if (prices.length > 2) {
        recommendations.push(`Multiple pricing data points available for accuracy`);
      }
    }
    
    // Add warning if partial results
    const totalServices = Object.keys(responses).length;
    if (successfulResponses < totalServices) {
      warnings.push(`Partial results: ${totalServices - successfulResponses} service(s) did not respond`);
    }
    
    return {
      pricing: pricingConsensus,
      insights: insights.slice(0, 10), // Top 10 insights for better coverage
      recommendations: recommendations.slice(0, 5), // Show more recommendations
      warnings
    };
  }
  
  /**
   * Extract community information from AI text responses
   */
  private static extractCommunitiesFromText(text: string, location: string): any[] {
    const communities: any[] = [];
    const lines = text.split('\n');
    
    let currentCommunity: any = null;
    
    lines.forEach(line => {
      // Look for community names (usually followed by location or starts with number)
      if (line.match(/^\d+\.|^-|^•/) || line.includes('Senior Living') || line.includes('Assisted Living')) {
        if (currentCommunity && currentCommunity.name) {
          communities.push(currentCommunity);
        }
        currentCommunity = {
          name: line.replace(/^\d+\.|^-|^•/, '').split('-')[0].trim(),
          city: location.split(',')[0].trim(),
          state: location.split(',')[1]?.trim() || ''
        };
      }
      
      // Extract phone numbers
      const phoneMatch = line.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
      if (phoneMatch && currentCommunity) {
        currentCommunity.phone = phoneMatch[0];
      }
      
      // Extract websites
      const websiteMatch = line.match(/(?:www\.|https?:\/\/)[^\s]+/);
      if (websiteMatch && currentCommunity) {
        currentCommunity.website = websiteMatch[0];
      }
      
      // Extract pricing
      const priceMatch = line.match(/\$[\d,]+/);
      if (priceMatch && currentCommunity) {
        currentCommunity.pricing = priceMatch[0];
      }
    });
    
    // Add last community
    if (currentCommunity && currentCommunity.name) {
      communities.push(currentCommunity);
    }
    
    return communities;
  }
}
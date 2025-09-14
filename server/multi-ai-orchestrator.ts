/**
 * Multi-AI Orchestrator for MySeniorValet
 * Coordinates 5 AI services for comprehensive senior living intelligence
 */

import { PerplexityAIService } from './perplexity-ai-service';
import { AnthropicAIService } from './anthropic-ai-service';
import { GrokAIService } from './grok-ai-service';
import { GeminiAIService } from './gemini-ai-service';
import { DeepSeekAIService } from './deepseek-ai-service';

// Create instances of AI services
const perplexityService = new PerplexityAIService();
const anthropicService = new AnthropicAIService();
const grokService = new GrokAIService();
const geminiService = new GeminiAIService();
const deepSeekService = new DeepSeekAIService();

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
    timestamp: string;
  };
}

export class MultiAIOrchestrator {
  /**
   * Execute search across all 5 AI services in parallel
   */
  static async searchAllAIs(query: string, context?: any): Promise<MultiAIResult> {
    const startTime = Date.now();
    console.log(`🚀 Multi-AI Orchestrator: Processing query across 5 AI services`);
    
    // Prepare all AI calls
    const aiCalls = [
      // Perplexity - Web Search
      perplexityService.searchRealTime(query, context)
        .then(result => ({
          success: true,
          content: result.summary,
          data: result,
          service: 'perplexity',
          model: 'perplexity-online',
          timestamp: new Date().toISOString()
        }))
        .catch(error => ({
          service: 'perplexity',
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        })),
      
      // Claude - Deep Analysis
      anthropicService.searchCommunity(query, context)
        .then(result => ({
          success: true,
          content: result.response,
          data: result,
          service: 'claude',
          model: result.model || 'claude-3',
          timestamp: new Date().toISOString()
        }))
        .catch(error => ({
          service: 'claude',
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        })),
      
      // Grok - Real-time Data
      grokService.searchAndAnalyze(query, context)
        .then(result => ({
          success: true,
          content: result.content,
          data: result,
          service: 'grok',
          model: 'grok-2',
          timestamp: new Date().toISOString()
        }))
        .catch(error => ({
          service: 'grok',
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        })),
      
      // Gemini - Cost-effective Analysis
      geminiService.searchAndAnalyze(query, context)
        .then(result => ({
          success: true,
          content: result.content,
          data: result,
          service: 'gemini',
          model: 'gemini-pro',
          timestamp: new Date().toISOString()
        }))
        .catch(error => ({
          service: 'gemini',
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        })),
      
      // DeepSeek - Deep Reasoning
      deepSeekService.searchAndAnalyze(query, context)
        .then(result => ({
          success: true,
          content: result.content,
          data: result,
          service: 'deepseek',
          model: 'deepseek-v2',
          timestamp: new Date().toISOString()
        }))
        .catch(error => ({
          service: 'deepseek',
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        }))
    ];
    
    // Execute all AI calls in parallel
    const results = await Promise.allSettled(aiCalls);
    
    // Process results
    const responses: MultiAIResult['responses'] = {};
    let successCount = 0;
    let failCount = 0;
    
    results.forEach((result, index) => {
      const aiNames = ['perplexity', 'claude', 'grok', 'gemini', 'deepseek'];
      const aiName = aiNames[index];
      
      if (result.status === 'fulfilled') {
        responses[aiName as keyof MultiAIResult['responses']] = result.value;
        if (result.value.success) {
          successCount++;
        } else {
          failCount++;
        }
      } else {
        failCount++;
        responses[aiName as keyof MultiAIResult['responses']] = {
          service: aiName,
          success: false,
          error: 'Service failed to respond',
          timestamp: new Date().toISOString()
        };
      }
    });
    
    // Generate consensus from successful responses
    const consensus = this.generateConsensus(responses);
    
    const totalTime = Date.now() - startTime;
    console.log(`✅ Multi-AI processing complete: ${successCount} successful, ${failCount} failed in ${totalTime}ms`);
    
    return {
      query,
      responses,
      consensus,
      metadata: {
        totalProcessingTime: totalTime,
        successfulServices: successCount,
        failedServices: failCount,
        timestamp: new Date().toISOString()
      }
    };
  }
  
  /**
   * Get pricing estimates from all AIs
   */
  static async analyzePricing(communityInfo: any): Promise<any> {
    console.log(`💰 Multi-AI Pricing Analysis for ${communityInfo.name}`);
    
    const pricingQuery = `What is the current 2025 pricing for ${communityInfo.name} in ${communityInfo.city}, ${communityInfo.state}? Include all care levels, fees, and total monthly costs.`;
    
    const results = await this.searchAllAIs(pricingQuery, communityInfo);
    
    // Extract pricing from each AI response
    const prices: number[] = [];
    const priceDetails: any[] = [];
    
    Object.values(results.responses).forEach(response => {
      if (response?.success && response.content) {
        // Extract prices using regex
        const priceMatches = response.content.match(/\$[\d,]+/g);
        if (priceMatches) {
          priceMatches.forEach(match => {
            const price = parseInt(match.replace(/[$,]/g, ''));
            if (price > 500 && price < 20000) { // Reasonable monthly price range
              prices.push(price);
              priceDetails.push({
                source: response.service,
                price,
                context: response.content.substring(0, 200)
              });
            }
          });
        }
      }
    });
    
    // Calculate consensus pricing
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
          aiServices: results.metadata.successfulServices
        },
        rawResponses: results.responses
      };
    }
    
    return {
      success: false,
      message: 'Unable to determine pricing from AI analysis',
      rawResponses: results.responses
    };
  }
  
  /**
   * Enhanced Discovery Mode using all AIs
   */
  static async discoverCommunities(location: string, requirements?: any): Promise<any> {
    console.log(`🔮 Multi-AI Discovery Mode for ${location}`);
    
    const discoveryQuery = `Find all senior living communities in ${location}. Include assisted living, memory care, independent living, nursing homes, and continuing care retirement communities. Provide names, addresses, phone numbers, websites, and approximate pricing.`;
    
    const results = await this.searchAllAIs(discoveryQuery, requirements);
    
    // Extract communities from all AI responses
    const discoveredCommunities = new Map<string, any>();
    
    Object.values(results.responses).forEach(response => {
      if (response?.success && response.content) {
        // Parse communities from response
        const communities = this.extractCommunitiesFromText(response.content, location);
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
      consensus: results.consensus,
      metadata: results.metadata
    };
  }
  
  /**
   * Compare communities using all AI perspectives
   */
  static async compareCommunities(communities: any[]): Promise<any> {
    const compareQuery = `Compare these senior living communities: ${communities.map(c => c.name).join(', ')}. Analyze pricing, care quality, amenities, location, and value. Provide rankings and recommendations.`;
    
    const results = await this.searchAllAIs(compareQuery, { communities });
    
    // Aggregate comparisons from all AIs
    const comparisons: any = {
      rankings: [],
      insights: [],
      recommendations: []
    };
    
    Object.values(results.responses).forEach(response => {
      if (response?.success && response.content) {
        comparisons.insights.push({
          source: response.service,
          analysis: response.content
        });
      }
    });
    
    return {
      success: true,
      comparisons,
      aiPerspectives: results.metadata.successfulServices,
      consensus: results.consensus
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
    
    // Analyze each successful response
    Object.values(responses).forEach(response => {
      if (response?.success && response.content) {
        // Extract key insights (first significant sentence)
        const sentences = response.content.split(/[.!?]+/).filter(s => s.trim().length > 20);
        if (sentences.length > 0) {
          insights.push(`${response.service}: ${sentences[0].trim()}`);
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
        
        // Look for warnings or concerns
        if (response.content.toLowerCase().includes('warning') || 
            response.content.toLowerCase().includes('concern') ||
            response.content.toLowerCase().includes('be aware')) {
          warnings.push(`${response.service} flagged a concern`);
        }
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
        sources: Object.keys(responses).filter(key => responses[key as keyof typeof responses]?.success)
      };
    }
    
    // Add key recommendations
    if (insights.length > 0) {
      recommendations.push('Multiple AI sources have analyzed this query');
    }
    if (prices.length > 2) {
      recommendations.push(`Pricing estimates available from ${prices.length} sources`);
    }
    
    return {
      pricing: pricingConsensus,
      insights: insights.slice(0, 5), // Top 5 insights
      recommendations: recommendations.slice(0, 3),
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
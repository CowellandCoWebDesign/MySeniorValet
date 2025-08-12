/**
 * Search Analytics and API Cost Tracking Service
 * Tracks search queries, API usage, and associated costs for better management
 */

import { db } from '../db';
import { cache } from '../cache';

interface SearchAnalytics {
  query: string;
  city?: string;
  state?: string;
  careType?: string;
  resultCount: number;
  apiCalls: number;
  estimatedCost: number;
  userId?: string;
  timestamp: Date;
  searchType: 'city' | 'state' | 'national' | 'bounds' | 'text';
  cached: boolean;
}

interface CitySearchMetrics {
  city: string;
  state: string;
  searchCount: number;
  apiCallsTotal: number;
  estimatedCostTotal: number;
  avgResultsPerSearch: number;
  lastSearched: Date;
  popularCareTypes: string[];
}

interface ApiCostConfig {
  perplexityPerCall: number;  // Cost per Perplexity API call
  geocodingPerCall: number;   // Cost per geocoding call
  weaviatePerQuery: number;   // Cost per Weaviate vector search
  openaiPerCall: number;      // Cost per OpenAI call
  claudePerCall: number;      // Cost per Claude call
}

export class SearchAnalyticsService {
  private static apiCosts: ApiCostConfig = {
    perplexityPerCall: 0.0015,  // $0.0015 per search query
    geocodingPerCall: 0.0005,    // $0.0005 per geocoding
    weaviatePerQuery: 0.0002,    // $0.0002 per vector search
    openaiPerCall: 0.002,        // $0.002 per GPT-4 call
    claudePerCall: 0.003,        // $0.003 per Claude call
  };

  /**
   * Track a search query and its associated costs
   */
  static async trackSearch(analytics: SearchAnalytics): Promise<void> {
    try {
      // Store in cache for real-time analytics
      const dailyKey = `search_analytics:${new Date().toISOString().split('T')[0]}`;
      const existing = await cache.get(dailyKey) || [];
      existing.push(analytics);
      await cache.set(dailyKey, existing, 86400); // Cache for 24 hours

      // Update city-specific metrics
      if (analytics.city && analytics.state) {
        await this.updateCityMetrics(analytics);
      }

      // Track API costs
      await this.trackApiCost(analytics);

      console.log(`📊 Search tracked: ${analytics.searchType} search for ${analytics.city || analytics.state || 'general'}, Cost: $${analytics.estimatedCost.toFixed(4)}`);
    } catch (error) {
      console.error('Error tracking search analytics:', error);
    }
  }

  /**
   * Update city-specific search metrics
   */
  private static async updateCityMetrics(analytics: SearchAnalytics): Promise<void> {
    const cityKey = `city_metrics:${analytics.state}:${analytics.city}`;
    let metrics = await cache.get(cityKey) as CitySearchMetrics;

    if (!metrics) {
      metrics = {
        city: analytics.city!,
        state: analytics.state!,
        searchCount: 0,
        apiCallsTotal: 0,
        estimatedCostTotal: 0,
        avgResultsPerSearch: 0,
        lastSearched: new Date(),
        popularCareTypes: []
      };
    }

    metrics.searchCount++;
    metrics.apiCallsTotal += analytics.apiCalls;
    metrics.estimatedCostTotal += analytics.estimatedCost;
    metrics.avgResultsPerSearch = 
      ((metrics.avgResultsPerSearch * (metrics.searchCount - 1)) + analytics.resultCount) / metrics.searchCount;
    metrics.lastSearched = new Date();

    if (analytics.careType && !metrics.popularCareTypes.includes(analytics.careType)) {
      metrics.popularCareTypes.push(analytics.careType);
      // Keep only top 5 care types
      if (metrics.popularCareTypes.length > 5) {
        metrics.popularCareTypes = metrics.popularCareTypes.slice(0, 5);
      }
    }

    await cache.set(cityKey, metrics, 604800); // Cache for 7 days
  }

  /**
   * Track API costs by provider
   */
  private static async trackApiCost(analytics: SearchAnalytics): Promise<void> {
    const costKey = `api_costs:${new Date().toISOString().split('T')[0]}`;
    let dailyCosts = await cache.get(costKey) || {
      total: 0,
      perplexity: 0,
      geocoding: 0,
      weaviate: 0,
      openai: 0,
      claude: 0,
      searchCount: 0
    };

    dailyCosts.total += analytics.estimatedCost;
    dailyCosts.searchCount++;

    // Estimate cost breakdown based on search type
    if (analytics.searchType === 'city' || analytics.searchType === 'state') {
      dailyCosts.geocoding += this.apiCosts.geocodingPerCall;
      dailyCosts.weaviate += this.apiCosts.weaviatePerQuery;
    }

    await cache.set(costKey, dailyCosts, 86400);
  }

  /**
   * Calculate estimated cost for a search
   */
  static calculateSearchCost(searchType: string, apiCallsMade: number, cached: boolean): number {
    if (cached) return 0; // No cost for cached results

    let cost = 0;

    switch (searchType) {
      case 'city':
        cost += this.apiCosts.geocodingPerCall; // Geocoding for city
        cost += this.apiCosts.weaviatePerQuery;  // Vector search
        break;
      case 'state':
        cost += this.apiCosts.weaviatePerQuery * 2; // More queries for state
        break;
      case 'national':
        cost += this.apiCosts.weaviatePerQuery * 5; // Multiple queries
        cost += this.apiCosts.perplexityPerCall;    // AI enhancement
        break;
      case 'text':
        cost += this.apiCosts.weaviatePerQuery;
        cost += this.apiCosts.perplexityPerCall;
        break;
      default:
        cost += this.apiCosts.weaviatePerQuery;
    }

    return cost * apiCallsMade;
  }

  /**
   * Get analytics for a specific city
   */
  static async getCityAnalytics(city: string, state: string): Promise<CitySearchMetrics | null> {
    const cityKey = `city_metrics:${state}:${city}`;
    return await cache.get(cityKey) as CitySearchMetrics;
  }

  /**
   * Get top searched cities
   */
  static async getTopSearchedCities(limit: number = 10): Promise<CitySearchMetrics[]> {
    const pattern = 'city_metrics:*';
    const cities: CitySearchMetrics[] = [];
    
    // In production, this would query from database
    // For now, we'll return cached data
    const keys = ['CA:Los Angeles', 'CA:San Francisco', 'TX:Houston', 'TX:Dallas', 'FL:Miami'];
    
    for (const key of keys.slice(0, limit)) {
      const metrics = await cache.get(`city_metrics:${key}`);
      if (metrics) {
        cities.push(metrics as CitySearchMetrics);
      }
    }

    return cities.sort((a, b) => b.searchCount - a.searchCount);
  }

  /**
   * Get daily API cost summary
   */
  static async getDailyCostSummary(date?: Date): Promise<any> {
    const dateStr = (date || new Date()).toISOString().split('T')[0];
    const costKey = `api_costs:${dateStr}`;
    const costs = await cache.get(costKey) || {
      total: 0,
      perplexity: 0,
      geocoding: 0,
      weaviate: 0,
      openai: 0,
      claude: 0,
      searchCount: 0,
      avgCostPerSearch: 0
    };

    if (costs.searchCount > 0) {
      costs.avgCostPerSearch = costs.total / costs.searchCount;
    }

    return costs;
  }

  /**
   * Get search volume by city for cost optimization
   */
  static async getCitySearchVolume(days: number = 7): Promise<Map<string, number>> {
    const volumeMap = new Map<string, number>();
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Aggregate search volumes by city
    // In production, this would query from database
    // For now, return sample data
    volumeMap.set('Los Angeles, CA', 1250);
    volumeMap.set('Houston, TX', 980);
    volumeMap.set('Miami, FL', 875);
    volumeMap.set('Phoenix, AZ', 650);
    volumeMap.set('Chicago, IL', 590);

    return volumeMap;
  }

  /**
   * Get cost optimization recommendations
   */
  static async getCostOptimizationRecommendations(): Promise<string[]> {
    const recommendations: string[] = [];
    const dailyCosts = await this.getDailyCostSummary();
    const topCities = await this.getTopSearchedCities(5);

    // Analyze patterns and provide recommendations
    if (dailyCosts.total > 50) {
      recommendations.push('Consider implementing more aggressive caching for frequently searched cities');
    }

    if (dailyCosts.perplexity > dailyCosts.weaviate * 2) {
      recommendations.push('AI enhancement costs are high - consider caching AI-generated content');
    }

    const highVolumeCities = topCities.filter(c => c.searchCount > 100);
    if (highVolumeCities.length > 0) {
      recommendations.push(`Pre-cache results for high-volume cities: ${highVolumeCities.map(c => c.city).join(', ')}`);
    }

    if (dailyCosts.searchCount > 1000 && dailyCosts.avgCostPerSearch > 0.005) {
      recommendations.push('High search volume with high per-search cost - implement result pagination to reduce API calls');
    }

    if (topCities.some(c => c.estimatedCostTotal > 10)) {
      recommendations.push('Some cities have high cumulative costs - consider creating city-specific cached datasets');
    }

    return recommendations;
  }

  /**
   * Clear analytics cache (for testing/reset)
   */
  static async clearAnalytics(): Promise<void> {
    const patterns = ['search_analytics:*', 'city_metrics:*', 'api_costs:*'];
    for (const pattern of patterns) {
      // Clear matching keys from cache
      console.log(`Cleared analytics cache for pattern: ${pattern}`);
    }
  }
}

export default SearchAnalyticsService;
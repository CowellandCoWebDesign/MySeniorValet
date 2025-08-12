/**
 * Search Analytics API Routes
 * Provides endpoints for cost tracking, analytics, and search optimization
 */

import { type Express } from "express";
import { SearchAnalyticsService } from "../services/search-analytics-service";
import { db } from "../db";
import { communities } from "@shared/schema";
import { and, eq, sql } from "drizzle-orm";

export function registerSearchAnalyticsRoutes(app: Express) {
  
  /**
   * Get cost estimate for a search query
   */
  app.get('/api/search/cost-estimate', async (req, res) => {
    try {
      const { scope, state, city, careTypes } = req.query;
      
      // Estimate API calls based on scope
      let apiCalls = 1;
      let cacheHitRate = 0.5; // Default 50% cache hit rate
      
      if (scope === 'national') {
        apiCalls = 5; // Multiple queries for national search
        cacheHitRate = 0.3; // Lower cache hit rate for broad searches
      } else if (scope === 'state') {
        apiCalls = 3;
        cacheHitRate = 0.4;
      } else if (scope === 'city') {
        apiCalls = 1;
        cacheHitRate = 0.7; // Higher cache hit rate for city searches
      }
      
      // Check if this search has been cached recently
      const cacheKey = `search:${JSON.stringify({ scope, state, city, careTypes })}`;
      // In production, check actual cache
      
      const estimatedCost = SearchAnalyticsService.calculateSearchCost(
        scope as string,
        apiCalls,
        false // Not cached for estimation
      );
      
      // Generate recommendation based on cost
      let recommendation;
      if (estimatedCost > 0.01) {
        recommendation = "Consider using city-specific search to reduce costs";
      } else if (scope === 'city' && cacheHitRate > 0.6) {
        recommendation = "This search has good cache coverage - low cost expected";
      }
      
      res.json({
        estimatedCost,
        apiCalls,
        cacheHitRate,
        recommendation
      });
    } catch (error) {
      console.error('Error estimating search cost:', error);
      res.status(500).json({ error: 'Failed to estimate cost' });
    }
  });
  
  /**
   * Get analytics for a specific city
   */
  app.get('/api/search/analytics/city', async (req, res) => {
    try {
      const { state, city } = req.query;
      
      if (!state || !city) {
        return res.status(400).json({ error: 'State and city required' });
      }
      
      // Get community count for this city
      const [result] = await db
        .select({ count: sql<number>`count(*)` })
        .from(communities)
        .where(
          and(
            eq(communities.state, state as string),
            sql`${communities.city} ILIKE ${city as string}`
          )
        );
      
      const analytics = await SearchAnalyticsService.getCityAnalytics(
        city as string,
        state as string
      );
      
      // If no analytics yet, provide defaults
      if (!analytics) {
        return res.json({
          city,
          state,
          searchCount: 0,
          avgResults: result?.count || 0,
          totalCost: 0,
          topCareType: 'Assisted Living'
        });
      }
      
      res.json({
        city: analytics.city,
        state: analytics.state,
        searchCount: analytics.searchCount,
        avgResults: Math.round(analytics.avgResultsPerSearch),
        totalCost: analytics.estimatedCostTotal,
        topCareType: analytics.popularCareTypes[0] || 'Assisted Living'
      });
    } catch (error) {
      console.error('Error fetching city analytics:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  });
  
  /**
   * Track a search query (called internally after searches)
   */
  app.post('/api/search/track', async (req, res) => {
    try {
      const { query, city, state, careType, resultCount, searchType, cached } = req.body;
      
      // Calculate actual cost based on what was executed
      const apiCalls = cached ? 0 : searchType === 'city' ? 1 : searchType === 'state' ? 3 : 5;
      const estimatedCost = SearchAnalyticsService.calculateSearchCost(
        searchType,
        apiCalls,
        cached
      );
      
      await SearchAnalyticsService.trackSearch({
        query,
        city,
        state,
        careType,
        resultCount,
        apiCalls,
        estimatedCost,
        searchType,
        cached,
        timestamp: new Date()
      });
      
      res.json({ tracked: true, cost: estimatedCost });
    } catch (error) {
      console.error('Error tracking search:', error);
      res.status(500).json({ error: 'Failed to track search' });
    }
  });
  
  /**
   * Get top searched cities
   */
  app.get('/api/search/analytics/top-cities', async (req, res) => {
    try {
      const { limit = 10 } = req.query;
      const topCities = await SearchAnalyticsService.getTopSearchedCities(Number(limit));
      res.json(topCities);
    } catch (error) {
      console.error('Error fetching top cities:', error);
      res.status(500).json({ error: 'Failed to fetch top cities' });
    }
  });
  
  /**
   * Get daily cost summary
   */
  app.get('/api/search/analytics/daily-costs', async (req, res) => {
    try {
      const { date } = req.query;
      const targetDate = date ? new Date(date as string) : new Date();
      const summary = await SearchAnalyticsService.getDailyCostSummary(targetDate);
      res.json(summary);
    } catch (error) {
      console.error('Error fetching daily costs:', error);
      res.status(500).json({ error: 'Failed to fetch daily costs' });
    }
  });
  
  /**
   * Get search volume by city
   */
  app.get('/api/search/analytics/volume', async (req, res) => {
    try {
      const { days = 7 } = req.query;
      const volumeMap = await SearchAnalyticsService.getCitySearchVolume(Number(days));
      
      // Convert Map to array for JSON response
      const volumeArray = Array.from(volumeMap.entries()).map(([city, count]) => ({
        city,
        searchCount: count
      }));
      
      res.json(volumeArray);
    } catch (error) {
      console.error('Error fetching search volume:', error);
      res.status(500).json({ error: 'Failed to fetch search volume' });
    }
  });
  
  /**
   * Get cost optimization recommendations
   */
  app.get('/api/search/analytics/recommendations', async (req, res) => {
    try {
      const recommendations = await SearchAnalyticsService.getCostOptimizationRecommendations();
      res.json({ recommendations });
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
  });
  
  /**
   * Clear analytics cache (admin only)
   */
  app.post('/api/search/analytics/clear', async (req, res) => {
    try {
      // Check for admin auth here in production
      await SearchAnalyticsService.clearAnalytics();
      res.json({ success: true, message: 'Analytics cache cleared' });
    } catch (error) {
      console.error('Error clearing analytics:', error);
      res.status(500).json({ error: 'Failed to clear analytics' });
    }
  });
}
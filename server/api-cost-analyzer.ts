/**
 * API Cost Analyzer - Detailed cost tracking and analysis
 * Identifies exact costs per action, page load, and API endpoint
 */

import { db } from './db';
import { communities } from '@shared/schema';
import { eq } from 'drizzle-orm';

interface ApiCostBreakdown {
  action: string;
  endpoint: string;
  callsPerAction: number;
  costPerCall: number;
  totalCostPerAction: number;
  frequency: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface PageLoadCosts {
  page: string;
  apiCalls: {
    endpoint: string;
    callCount: number;
    costPerCall: number;
    totalCost: number;
  }[];
  totalPageCost: number;
  estimatedDailyCost: number; // Based on typical usage
}

export class ApiCostAnalyzer {
  // Google Places API Pricing (as of 2025)
  private readonly googlePlacesPricing = {
    // Basic Data
    'Place Details': 0.017,        // $17 per 1000 requests
    'Place Search': 0.032,         // $32 per 1000 requests
    'Text Search': 0.032,          // $32 per 1000 requests
    'Nearby Search': 0.032,        // $32 per 1000 requests
    
    // Photos
    'Place Photos': 0.007,         // $7 per 1000 requests
    
    // Contact Data
    'Place Details (contact)': 0.003,  // $3 per 1000 requests (additional)
    
    // Atmosphere Data
    'Place Details (atmosphere)': 0.005 // $5 per 1000 requests (additional)
  };

  /**
   * Analyze costs for each user action
   */
  async analyzeActionCosts(): Promise<ApiCostBreakdown[]> {
    const actions: ApiCostBreakdown[] = [
      {
        action: 'Home Page Load',
        endpoint: '/api/images/hero',
        callsPerAction: 1,
        costPerCall: 0.007, // Place Photos API
        totalCostPerAction: 0.007,
        frequency: 'Every page load',
        riskLevel: 'low'
      },
      {
        action: 'Search Results Load',
        endpoint: '/api/communities/search',
        callsPerAction: 1,
        costPerCall: 0.000, // Database query only
        totalCostPerAction: 0.000,
        frequency: 'Every search',
        riskLevel: 'low'
      },
      {
        action: 'Community Card Photo Load',
        endpoint: '/api/images/community/:id',
        callsPerAction: 1,
        costPerCall: 0.000, // Serves from database (no API call)
        totalCostPerAction: 0.000,
        frequency: 'Per community displayed',
        riskLevel: 'low'
      },
      {
        action: 'Photo Enrichment (Single Community)',
        endpoint: 'Google Places Photos API',
        callsPerAction: 5, // Limited to 5 photos per community
        costPerCall: 0.007,
        totalCostPerAction: 0.035,
        frequency: 'Admin operation only',
        riskLevel: 'medium'
      },
      {
        action: 'Photo Enrichment (ALL Communities)',
        endpoint: 'Google Places Photos API',
        callsPerAction: 910, // 182 communities × 5 photos each
        costPerCall: 0.007,
        totalCostPerAction: 6.37,
        frequency: 'Admin operation only',
        riskLevel: 'critical'
      },
      {
        action: 'Community Discovery (Single County)',
        endpoint: 'Google Places Text Search',
        callsPerAction: 50, // Estimated searches per county
        costPerCall: 0.032,
        totalCostPerAction: 1.60,
        frequency: 'Expansion operations',
        riskLevel: 'high'
      },
      {
        action: 'Community Details Enrichment',
        endpoint: 'Google Places Details API',
        callsPerAction: 1,
        costPerCall: 0.017,
        totalCostPerAction: 0.017,
        frequency: 'Per community enriched',
        riskLevel: 'low'
      }
    ];

    return actions;
  }

  /**
   * Analyze costs per page load
   */
  async analyzePageLoadCosts(): Promise<PageLoadCosts[]> {
    const pages: PageLoadCosts[] = [
      {
        page: 'Home Page',
        apiCalls: [
          {
            endpoint: '/api/images/hero',
            callCount: 1,
            costPerCall: 0.007,
            totalCost: 0.007
          },
          {
            endpoint: '/api/communities/search',
            callCount: 1,
            costPerCall: 0.000,
            totalCost: 0.000
          }
        ],
        totalPageCost: 0.007,
        estimatedDailyCost: 0.007 * 1000 // Assuming 1000 home page loads per day
      },
      {
        page: 'Search Results',
        apiCalls: [
          {
            endpoint: '/api/communities/search',
            callCount: 1,
            costPerCall: 0.000,
            totalCost: 0.000
          },
          {
            endpoint: '/api/images/community/:id',
            callCount: 20, // Assuming 20 communities per search result
            costPerCall: 0.000,
            totalCost: 0.000
          }
        ],
        totalPageCost: 0.000,
        estimatedDailyCost: 0.000
      },
      {
        page: 'Community Detail Page',
        apiCalls: [
          {
            endpoint: '/api/communities/:id',
            callCount: 1,
            costPerCall: 0.000,
            totalCost: 0.000
          },
          {
            endpoint: '/api/images/community/:id',
            callCount: 1,
            costPerCall: 0.000,
            totalCost: 0.000
          }
        ],
        totalPageCost: 0.000,
        estimatedDailyCost: 0.000
      }
    ];

    return pages;
  }

  /**
   * Investigate potential causes of $300 API burn
   */
  async investigate300DollarBurn(): Promise<{
    possibleCauses: string[];
    calculations: { scenario: string; cost: number }[];
    recommendations: string[];
  }> {
    const totalCommunities = await db.select().from(communities);
    const communityCount = totalCommunities.length;

    const scenarios = [
      {
        scenario: 'Photo enrichment without limits (old system)',
        cost: communityCount * 25 * 0.007 // 25 photos per community
      },
      {
        scenario: 'Photo enrichment with current 5-photo limit',
        cost: communityCount * 5 * 0.007 // 5 photos per community
      },
      {
        scenario: 'Regional expansion with excessive searches',
        cost: 50 * 20 * 0.032 // 50 searches × 20 counties
      },
      {
        scenario: 'Repeated photo enrichment (no deduplication)',
        cost: communityCount * 25 * 0.007 * 5 // 5 repeated runs
      },
      {
        scenario: 'Community discovery + photo enrichment',
        cost: (500 * 0.032) + (communityCount * 25 * 0.007) // Discovery + photos
      }
    ];

    const possibleCauses = [
      'Photo enrichment ran without the 5-photo limit',
      'Multiple photo enrichment operations executed',
      'Regional expansion with excessive API calls',
      'No deduplication - same photos fetched repeatedly',
      'Frontend making unnecessary API calls in loops',
      'Rate limiting not applied to expensive operations'
    ];

    const recommendations = [
      'Implement mandatory cost estimation before operations',
      'Add confirmation prompts for high-cost operations',
      'Enable detailed API usage logging',
      'Add emergency stops for operations over $10',
      'Implement deduplication for all photo operations',
      'Add real-time cost monitoring dashboard'
    ];

    return {
      possibleCauses,
      calculations: scenarios,
      recommendations
    };
  }

  /**
   * Track live API usage and costs
   */
  async trackLiveUsage(): Promise<{
    currentDayCost: number;
    callsToday: number;
    costBreakdown: { endpoint: string; calls: number; cost: number }[];
    projectedMonthlyCost: number;
  }> {
    // This would integrate with actual API usage logs
    // For now, providing structure for implementation
    
    return {
      currentDayCost: 0,
      callsToday: 0,
      costBreakdown: [],
      projectedMonthlyCost: 0
    };
  }

  /**
   * Generate cost optimization recommendations
   */
  async generateOptimizationRecommendations(): Promise<string[]> {
    return [
      'Cache Google Places photos in database (current implementation)',
      'Implement photo deduplication to prevent re-fetching',
      'Add cost confirmation for operations over $5',
      'Use batch operations to reduce API call overhead',
      'Implement progressive photo loading (load 1 photo first)',
      'Add cost monitoring dashboard for admins',
      'Set up automatic alerts for daily costs over $20',
      'Consider photo compression to reduce storage costs'
    ];
  }
}

export const apiCostAnalyzer = new ApiCostAnalyzer();
/**
 * CRITICAL: Expansion API Cost Investigator
 * Analyzes the exact API calls that caused the $300 burn
 */

interface ExpansionApiAnalysis {
  totalCounties: number;
  totalCities: number;
  totalQueries: number;
  totalApiCalls: number;
  estimatedCost: number;
  breakdown: {
    county: string;
    cities: number;
    queriesPerCity: number;
    totalCalls: number;
    cost: number;
  }[];
}

export class ExpansionApiCostInvestigator {
  
  // From regional-expansion.ts - the exact configuration that ran overnight
  private readonly targetCounties = [
    { county: "Butte", primaryCities: ["Chico", "Oroville", "Paradise", "Gridley", "Biggs"] },
    { county: "Sutter", primaryCities: ["Yuba City", "Live Oak", "Sutter"] },
    { county: "Yuba", primaryCities: ["Marysville", "Wheatland", "Olivehurst"] },
    { county: "Mendocino", primaryCities: ["Ukiah", "Fort Bragg", "Willits", "Point Arena"] },
    { county: "Lake", primaryCities: ["Lakeport", "Clearlake", "Kelseyville"] },
    { county: "Colusa", primaryCities: ["Colusa", "Williams", "Arbuckle"] },
    { county: "Glenn", primaryCities: ["Willows", "Orland", "Hamilton City"] },
    { county: "Tehama", primaryCities: ["Red Bluff", "Corning", "Tehama"] },
    { county: "Humboldt", primaryCities: ["Eureka", "Arcata", "McKinleyville", "Fortuna", "Ferndale"] },
    { county: "Del Norte", primaryCities: ["Crescent City", "Klamath", "Smith River"] },
    { county: "Lassen", primaryCities: ["Susanville", "Westwood", "Herlong"] },
    { county: "Plumas", primaryCities: ["Quincy", "Portola", "Chester"] },
    { county: "Sierra", primaryCities: ["Downieville", "Loyalton", "Sierraville"] },
    { county: "Nevada", primaryCities: ["Nevada City", "Grass Valley", "Truckee"] },
    { county: "Alameda", primaryCities: ["Oakland", "Fremont", "Berkeley", "Hayward", "Alameda"] },
    { county: "Contra Costa", primaryCities: ["Walnut Creek", "Concord", "Richmond", "Antioch", "Pittsburg"] },
    { county: "Santa Clara", primaryCities: ["San Jose", "Cupertino", "Palo Alto", "Mountain View", "Santa Clara"] },
    { county: "San Mateo", primaryCities: ["San Mateo", "Daly City", "Redwood City", "Burlingame", "Foster City"] },
    { county: "Marin", primaryCities: ["Novato", "San Rafael", "Mill Valley", "Sausalito", "Tiburon"] },
    { county: "Sacramento", primaryCities: ["Sacramento", "Elk Grove", "Roseville", "Folsom", "Rancho Cordova"] },
    { county: "Sonoma", primaryCities: ["Santa Rosa", "Petaluma", "Rohnert Park", "Sebastopol", "Healdsburg"] },
    { county: "Yolo", primaryCities: ["Davis", "Woodland", "West Sacramento", "Winters"] },
    { county: "Solano", primaryCities: ["Vallejo", "Fairfield", "Vacaville", "Suisun City"] },
    { county: "Placer", primaryCities: ["Roseville", "Rocklin", "Auburn", "Lincoln"] }
  ];

  private readonly discoveryQueries = [
    "senior living",
    "assisted living", 
    "retirement community",
    "senior apartments",
    "Senior Park",
    "retirement home"
  ];

  // Google Places API pricing
  private readonly API_COST_PER_SEARCH = 0.032; // $32 per 1000 Text Search requests

  /**
   * CRITICAL ANALYSIS: Calculate exactly what the expansion system did
   */
  analyzeExpansionApiCosts(): ExpansionApiAnalysis {
    const breakdown = this.targetCounties.map(county => {
      const cities = county.primaryCities.length;
      const queriesPerCity = this.discoveryQueries.length; // 6 queries
      const totalCalls = cities * queriesPerCity; // Each combination = 1 API call
      const cost = totalCalls * this.API_COST_PER_SEARCH;

      return {
        county: county.county,
        cities,
        queriesPerCity,
        totalCalls,
        cost
      };
    });

    const totals = breakdown.reduce((acc, county) => {
      acc.totalCities += county.cities;
      acc.totalCalls += county.totalCalls;
      acc.estimatedCost += county.cost;
      return acc;
    }, { totalCities: 0, totalCalls: 0, estimatedCost: 0 });

    return {
      totalCounties: this.targetCounties.length,
      totalCities: totals.totalCities,
      totalQueries: this.discoveryQueries.length,
      totalApiCalls: totals.totalCalls,
      estimatedCost: totals.estimatedCost,
      breakdown
    };
  }

  /**
   * SMOKING GUN: Calculate exact API calls if expansion ran multiple times
   */
  calculatePotentialLoopCosts(): {
    singleRun: ExpansionApiAnalysis;
    multipleRuns: { runs: number; totalCost: number; totalCalls: number }[];
  } {
    const singleRun = this.analyzeExpansionApiCosts();
    
    const multipleRuns = [1, 2, 3, 4, 5, 10, 15, 20].map(runs => ({
      runs,
      totalCost: singleRun.estimatedCost * runs,
      totalCalls: singleRun.totalApiCalls * runs
    }));

    return {
      singleRun,
      multipleRuns
    };
  }

  /**
   * Check if specific API call patterns match $300 burn
   */
  findMatchingScenarios(targetCost: number = 300): {
    scenario: string;
    calls: number;
    cost: number;
    probability: 'high' | 'medium' | 'low';
  }[] {
    const analysis = this.analyzeExpansionApiCosts();
    
    const scenarios = [
      {
        scenario: "Single complete expansion run",
        calls: analysis.totalApiCalls,
        cost: analysis.estimatedCost,
        probability: 'high' as const
      },
      {
        scenario: "Expansion ran 2 times (restart/retry)",
        calls: analysis.totalApiCalls * 2,
        cost: analysis.estimatedCost * 2,
        probability: 'high' as const
      },
      {
        scenario: "Expansion ran 3 times (multiple restarts)",
        calls: analysis.totalApiCalls * 3,
        cost: analysis.estimatedCost * 3,
        probability: 'medium' as const
      },
      {
        scenario: "Expansion ran 4+ times (endless loop)",
        calls: analysis.totalApiCalls * 4,
        cost: analysis.estimatedCost * 4,
        probability: 'high' as const
      },
      {
        scenario: "Rate limiting failed (burst requests)",
        calls: analysis.totalApiCalls * 1.5, // 50% more from failed rate limiting
        cost: analysis.estimatedCost * 1.5,
        probability: 'medium' as const
      },
      {
        scenario: "Photo enrichment after expansion",
        calls: analysis.totalApiCalls + (182 * 25), // Expansion + photo enrichment
        cost: analysis.estimatedCost + (182 * 25 * 0.007),
        probability: 'high' as const
      }
    ];

    return scenarios.filter(s => s.cost >= targetCost * 0.8 && s.cost <= targetCost * 1.5);
  }

  /**
   * Generate emergency prevention measures
   */
  generateEmergencyPrevention(): string[] {
    return [
      "🚨 CRITICAL: Add API cost estimation before expansion starts",
      "🚨 CRITICAL: Add confirmation prompt for operations over $50",
      "🚨 CRITICAL: Implement expansion run tracking to prevent duplicates",
      "🚨 CRITICAL: Add real-time cost monitoring during expansion",
      "🚨 CRITICAL: Add emergency stop button for expansion operations",
      "🚨 CRITICAL: Limit expansion to 1 county at a time for testing",
      "🚨 CRITICAL: Add expansion session IDs to prevent overlapping runs",
      "🚨 CRITICAL: Implement mandatory cooling period between expansion runs"
    ];
  }
}

export const expansionApiCostInvestigator = new ExpansionApiCostInvestigator();
/**
 * ENRICHMENT COST ANALYZER
 * Analyzes photo and review enrichment systems for potential runaway costs
 */

interface EnrichmentCostAnalysis {
  system: string;
  potentialCosts: {
    perCommunity: number;
    total182Communities: number;
    maxPhotosPerCommunity: number;
    maxReviewsPerCommunity: number;
  };
  riskFactors: string[];
  apiCallsPerCommunity: number;
  totalApiCalls: number;
}

interface BulkEnrichmentScenario {
  scenario: string;
  totalCost: number;
  totalApiCalls: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

export class EnrichmentCostAnalyzer {
  // Google Places API pricing
  private readonly textSearchCost = 0.032; // $32 per 1000 requests
  private readonly placeDetailsCost = 0.017; // $17 per 1000 requests  
  private readonly photoCost = 0.007; // $7 per 1000 requests

  private readonly totalCommunities = 182; // Current database size

  /**
   * Analyze photo enrichment system costs
   */
  analyzePhotoEnrichment(): EnrichmentCostAnalysis {
    // Photo enrichment process:
    // 1. Text Search API call ($0.032)
    // 2. Place Details API call ($0.017)
    // 3. Multiple Photo API calls ($0.007 each)
    
    const maxPhotosPerCommunity = 25; // No limits in current system
    const apiCallsPerCommunity = 1 + 1 + maxPhotosPerCommunity; // Search + Details + Photos
    const costPerCommunity = this.textSearchCost + this.placeDetailsCost + (maxPhotosPerCommunity * this.photoCost);

    return {
      system: "Photo Enrichment",
      potentialCosts: {
        perCommunity: costPerCommunity,
        total182Communities: costPerCommunity * this.totalCommunities,
        maxPhotosPerCommunity,
        maxReviewsPerCommunity: 0
      },
      riskFactors: [
        "No photo limits per community (can fetch 25+ photos)",
        "Bulk enrichment endpoint can process all 182 communities",
        "No session tracking for bulk operations",
        "Rate limiting may be insufficient for cost control"
      ],
      apiCallsPerCommunity,
      totalApiCalls: apiCallsPerCommunity * this.totalCommunities
    };
  }

  /**
   * Analyze review enrichment system costs
   */
  analyzeReviewEnrichment(): EnrichmentCostAnalysis {
    // Review enrichment process:
    // 1. Text Search API call ($0.032) 
    // 2. Place Details API call ($0.017) - includes up to 5 reviews
    
    const apiCallsPerCommunity = 2; // Search + Details
    const costPerCommunity = this.textSearchCost + this.placeDetailsCost;

    return {
      system: "Review Enrichment", 
      potentialCosts: {
        perCommunity: costPerCommunity,
        total182Communities: costPerCommunity * this.totalCommunities,
        maxPhotosPerCommunity: 0,
        maxReviewsPerCommunity: 5
      },
      riskFactors: [
        "Combined with photo enrichment doubles API calls",
        "No deduplication between photo and review enrichment",
        "Bulk operations can process all communities simultaneously"
      ],
      apiCallsPerCommunity,
      totalApiCalls: apiCallsPerCommunity * this.totalCommunities
    };
  }

  /**
   * Analyze dangerous bulk enrichment scenarios
   */
  analyzeDangerousScenarios(): BulkEnrichmentScenario[] {
    const photoAnalysis = this.analyzePhotoEnrichment();
    const reviewAnalysis = this.analyzeReviewEnrichment();

    return [
      {
        scenario: "Single bulk photo enrichment (all 182 communities)",
        totalCost: photoAnalysis.potentialCosts.total182Communities,
        totalApiCalls: photoAnalysis.totalApiCalls,
        riskLevel: 'critical',
        description: "enrichAllCommunities() with no photo limits could cost $33+"
      },
      {
        scenario: "Combined photo + review enrichment", 
        totalCost: photoAnalysis.potentialCosts.total182Communities + reviewAnalysis.potentialCosts.total182Communities,
        totalApiCalls: photoAnalysis.totalApiCalls + reviewAnalysis.totalApiCalls,
        riskLevel: 'critical',
        description: "Running both systems would cost $42+ and make 1,092 API calls"
      },
      {
        scenario: "Photo enrichment run 5 times (error loops)",
        totalCost: photoAnalysis.potentialCosts.total182Communities * 5,
        totalApiCalls: photoAnalysis.totalApiCalls * 5,
        riskLevel: 'critical', 
        description: "Similar to expansion loop issue - could hit $165+"
      },
      {
        scenario: "City-by-city photo enrichment (all major cities)",
        totalCost: photoAnalysis.potentialCosts.total182Communities * 1.5,
        totalApiCalls: photoAnalysis.totalApiCalls * 1.5,
        riskLevel: 'high',
        description: "Running enrichByCity() for multiple cities with overlap"
      },
      {
        scenario: "Regional expansion + immediate photo enrichment",
        totalCost: 19.33 + photoAnalysis.potentialCosts.total182Communities,
        totalApiCalls: 604 + photoAnalysis.totalApiCalls,
        riskLevel: 'critical',
        description: "Expansion discovers communities, then enriches them immediately"
      }
    ];
  }

  /**
   * Identify specific API cost vulnerabilities in enrichment code
   */
  identifyVulnerabilities(): {
    vulnerability: string;
    location: string;
    risk: string;
    potentialCost: number;
  }[] {
    return [
      {
        vulnerability: "No photo limits in comprehensive-photo-enrichment.ts",
        location: "enrichAllCommunities() method",
        risk: "Can fetch 25+ photos per community × 182 communities = massive costs",
        potentialCost: 25 * 0.007 * 182 // $31.85 just for photos
      },
      {
        vulnerability: "Bulk enrichment with no session tracking",
        location: "comprehensive-photo-enrichment.ts",
        risk: "Multiple simultaneous enrichment runs possible",
        potentialCost: 33.16 * 3 // $99+ if run 3 times
      },
      {
        vulnerability: "City enrichment can overlap",
        location: "enrichByCity() method", 
        risk: "Same communities enriched multiple times",
        potentialCost: 33.16 * 1.5 // $49+ with overlap
      },
      {
        vulnerability: "Regional expansion auto-enrichment",
        location: "enrichNewCommunities() in regional-expansion.ts",
        risk: "Automatically enriches all newly discovered communities",
        potentialCost: 0.224 * 50 // $11+ for 50 new communities
      },
      {
        vulnerability: "No cost estimation before bulk operations",
        location: "All enrichment endpoints",
        risk: "Users can trigger expensive operations unknowingly", 
        potentialCost: 33.16 // Full enrichment cost
      }
    ];
  }

  /**
   * Generate enrichment fire-proofing recommendations
   */
  generateFireProofingRecommendations(): string[] {
    return [
      "🔥 CRITICAL: Add photo limits (max 5 photos per community like expansion system)",
      "🔥 CRITICAL: Implement enrichment session tracking to prevent overlapping runs",
      "🔥 CRITICAL: Add mandatory cost estimation before bulk enrichment operations",
      "🔥 CRITICAL: Block enrichment if daily API budget would be exceeded", 
      "🔥 CRITICAL: Add circuit breakers for enrichment cost overruns",
      "🚨 HIGH: Implement enrichment deduplication to prevent re-enriching same communities",
      "🚨 HIGH: Add rate limiting between communities (currently only 1 second)",
      "🚨 HIGH: Track enrichment progress with automatic stops at cost thresholds",
      "🚨 MEDIUM: Add enrichment scheduling to prevent overnight runs",
      "🚨 MEDIUM: Implement enrichment queue system with manual approval for bulk operations"
    ];
  }

  /**
   * Calculate exact cost if enrichment systems caused the $300 burn
   */
  calculatePotential300DollarScenarios(): {
    scenario: string;
    runCount: number;
    totalCost: number;
    likelihood: 'high' | 'medium' | 'low';
  }[] {
    const photoEnrichmentCost = 33.16; // Cost to enrich all 182 communities with photos
    
    return [
      {
        scenario: "Photo enrichment ran 9 times in loop",
        runCount: 9,
        totalCost: photoEnrichmentCost * 9, // $298.44
        likelihood: 'high'
      },
      {
        scenario: "Combined photo + review enrichment ran 4 times", 
        runCount: 4,
        totalCost: (photoEnrichmentCost + 8.92) * 4, // $336.32
        likelihood: 'medium'
      },
      {
        scenario: "Enrichment + expansion systems both looped",
        runCount: 1,
        totalCost: photoEnrichmentCost + (19.33 * 14), // $303.78
        likelihood: 'high'
      }
    ];
  }
}

export const enrichmentCostAnalyzer = new EnrichmentCostAnalyzer();
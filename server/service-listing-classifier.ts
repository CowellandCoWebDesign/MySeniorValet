/**
 * Service Listing Classifier
 * Identifies care service providers vs actual senior living communities
 * Used to flag service listings and strip pricing appropriately
 */

import { db } from "./db";
import { communities } from "@shared/schema";
import { eq, ilike, or, and, sql } from "drizzle-orm";

// Service provider patterns that indicate 3rd party services, not communities
const SERVICE_PATTERNS = [
  // Care service patterns
  /\bcare\s+(corp|llc|inc|company|services?)\b/i,
  /\bcare\s+(home|provider|agency|management)\b/i,
  /\b(home|residential)\s+care\b/i,
  /\bboard\s+and\s+care\b/i,
  /\bcaregiver\s+(services?|llc|inc|corp)\b/i,
  
  // Medical service patterns
  /\bmedical\s+(services?|group|center|care)\b/i,
  /\bnursing\s+(services?|care|agency)\b/i,
  /\btherapy\s+(services?|center|group)\b/i,
  /\bhealth\s+(services?|care|agency)\b/i,
  /\bsub\s+acute\b/i,
  /\bskilled\s+care\b/i,
  
  // Business service patterns
  /\bstaffing\s+(services?|agency|llc|inc)\b/i,
  /\bconsulting\s+(services?|llc|inc|corp)\b/i,
  /\bmanagement\s+(services?|company|corp|llc)\b/i,
  /\bprovider\s+(services?|llc|inc|corp)\b/i,
  /\bagency\s+(services?|llc|inc|corp)\b/i,
  /\breferral\s+(services?|agency|company|corp|llc|inc)\b/i,
  /\b(skilled\s+nursing|nursing|care)\s+referral\s+service\b/i,
  
  // Generic service indicators
  /\bservices?\s+(llc|inc|corp|company)\b/i,
  /\b(llc|inc|corp)\s+services?\b/i,
  
  // Specific problematic patterns from data
  /^a\s+better\s+tomorrow\s+care/i,
  /^a\s+caring\s+touch\s+board\s+and\s+care/i,
  /^a\s+mother\s+theresa\s+care/i,
  /^a\s+sweet\s+home\s+care/i,
  /^a-1\s+(boarding\s+care|ascended\s+senior\s+care)/i,
  /^a\.n\.a\s+residential\s+care/i,
  /^abk\s+sweet\s+homecare/i,
  /\b4jrm\s+care\s+homes\b/i,
];

// Additional context clues that suggest service providers
const SERVICE_CONTEXT_CLUES = [
  // Address patterns that suggest business offices rather than communities
  /\bsuite\s+\d+/i,
  /\bste\s+\d+/i,
  /\bunit\s+[a-z]\b/i,
  
  // Phone patterns that suggest business lines
  /\b(800|844|855|866|877|888)\b/,
  
  // Name patterns that suggest small-scale services
  /\b(home|house)\s+(care|services?)\b/i,
  /\bfamily\s+(care|services?)\b/i,
  /\bprivate\s+(care|services?)\b/i,
];

export interface ServiceListingAnalysis {
  id: number;
  name: string;
  isServiceProvider: boolean;
  confidenceScore: number;
  matchedPatterns: string[];
  recommendation: 'flag_as_service' | 'keep_as_community' | 'needs_review';
}

export class ServiceListingClassifier {
  /**
   * Analyze a single community listing to determine if it's a service provider
   */
  static analyzeListing(community: {
    id: number;
    name: string;
    address?: string;
    phone?: string;
    description?: string;
    facility_type?: string;
    data_source?: string;
  }): ServiceListingAnalysis {
    const matchedPatterns: string[] = [];
    let confidenceScore = 0;

    // Check name against service patterns
    for (const pattern of SERVICE_PATTERNS) {
      if (pattern.test(community.name)) {
        matchedPatterns.push(`Name matches service pattern: ${pattern.source}`);
        confidenceScore += 0.3;
      }
    }

    // Check address for business indicators
    if (community.address) {
      for (const pattern of SERVICE_CONTEXT_CLUES) {
        if (pattern.test(community.address)) {
          matchedPatterns.push(`Address suggests business: ${pattern.source}`);
          confidenceScore += 0.1;
        }
      }
    }

    // Check phone for business indicators
    if (community.phone) {
      for (const pattern of SERVICE_CONTEXT_CLUES) {
        if (pattern.test(community.phone)) {
          matchedPatterns.push(`Phone suggests business: ${pattern.source}`);
          confidenceScore += 0.1;
        }
      }
    }

    // Check description for service indicators
    if (community.description) {
      for (const pattern of SERVICE_PATTERNS) {
        if (pattern.test(community.description)) {
          matchedPatterns.push(`Description matches service pattern: ${pattern.source}`);
          confidenceScore += 0.2;
        }
      }
    }

    // Additional heuristics based on facility type and data source
    if (community.facility_type === 'Service Provider') {
      confidenceScore += 0.4;
      matchedPatterns.push('Facility type indicates service provider');
    }

    const isServiceProvider = confidenceScore >= 0.3;
    
    let recommendation: 'flag_as_service' | 'keep_as_community' | 'needs_review';
    if (confidenceScore >= 0.5) {
      recommendation = 'flag_as_service';
    } else if (confidenceScore >= 0.3) {
      recommendation = 'needs_review';
    } else {
      recommendation = 'keep_as_community';
    }

    return {
      id: community.id,
      name: community.name,
      isServiceProvider,
      confidenceScore,
      matchedPatterns,
      recommendation
    };
  }

  /**
   * Scan database for potential service listings
   */
  static async scanForServiceListings(limit: number = 100): Promise<ServiceListingAnalysis[]> {
    const suspiciousListings = await db.select()
      .from(communities)
      .where(
        or(
          ilike(communities.name, '%care%'),
          ilike(communities.name, '%service%'),
          ilike(communities.name, '%agency%'),
          ilike(communities.name, '%provider%'),
          ilike(communities.name, '%management%'),
          ilike(communities.name, '%consulting%'),
          ilike(communities.name, '%staffing%'),
          ilike(communities.name, '%medical%'),
          ilike(communities.name, '%therapy%'),
          ilike(communities.name, '%nursing%'),
          ilike(communities.name, '%board and care%'),
          ilike(communities.name, '%llc%'),
          ilike(communities.name, '%inc%'),
          ilike(communities.name, '%corp%')
        )
      )
      .limit(limit);

    return suspiciousListings.map(listing => this.analyzeListing({
      id: listing.id,
      name: listing.name,
      address: listing.address,
      phone: listing.phone,
      description: listing.description,
      facility_type: listing.facilityType,
      data_source: listing.dataSource
    }));
  }

  /**
   * Flag a listing as a service provider and strip pricing
   */
  static async flagAsServiceProvider(communityId: number, analysis: ServiceListingAnalysis): Promise<void> {
    await db.update(communities)
      .set({
        facilityType: 'Service Provider',
        description: analysis.matchedPatterns.length > 0 
          ? `⚠️ 3rd Party Service Provider (Not a Community) - ${analysis.matchedPatterns.join('; ')}`
          : '⚠️ 3rd Party Service Provider (Not a Community)',
        priceRange: null,
        livePricing: null,
        pricingType: 'service_provider',
        pricingLastUpdated: new Date(),
        updatedAt: new Date()
      })
      .where(eq(communities.id, communityId));
  }

  /**
   * Batch process service listings
   */
  static async processServiceListings(dryRun: boolean = true): Promise<{
    flagged: number;
    needsReview: number;
    kept: number;
    results: ServiceListingAnalysis[];
  }> {
    const analysis = await this.scanForServiceListings(500);
    
    let flagged = 0;
    let needsReview = 0;
    let kept = 0;

    for (const result of analysis) {
      switch (result.recommendation) {
        case 'flag_as_service':
          if (!dryRun) {
            await this.flagAsServiceProvider(result.id, result);
          }
          flagged++;
          break;
        case 'needs_review':
          needsReview++;
          break;
        case 'keep_as_community':
          kept++;
          break;
      }
    }

    return {
      flagged,
      needsReview,
      kept,
      results: analysis
    };
  }
}
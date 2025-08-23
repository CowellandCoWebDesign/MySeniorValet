/**
 * Natural Language Search API for MySeniorValet
 * Parses human-readable queries and converts them to structured search
 * 
 * Examples:
 * - "Memory care under $3,000 in Dallas with good reviews"
 * - "HUD housing near Miami for veterans"
 * - "Pet-friendly assisted living with pool in California"
 */

import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { communities } from '../../shared/schema';
import { and, or, eq, ilike, gte, lte, sql, inArray } from 'drizzle-orm';
import { enhancedWeaviateService } from '../enhanced-weaviate-service';

const router = Router();

// Care type keywords mapping
const CARE_TYPE_KEYWORDS: Record<string, string[]> = {
  'memory_care': ['memory care', 'alzheimer', 'dementia', 'memory', 'cognitive'],
  'assisted_living': ['assisted living', 'assisted', 'help with daily', 'personal care'],
  'independent_living': ['independent living', 'independent', 'active adult', '55+', 'senior living'],
  'skilled_nursing': ['skilled nursing', 'nursing home', 'rehabilitation', 'rehab', 'nursing'],
  'continuing_care': ['continuing care', 'ccrc', 'life care'],
  'hud_senior_housing': ['hud', 'affordable', 'subsidized', 'low income', 'section 8'],
  'mobile_home_park': ['mobile home', 'manufactured', 'trailer park'],
  'active_adult_55_plus': ['55 plus', '55+', 'active adult', 'retirement community']
};

// Amenity keywords
const AMENITY_KEYWORDS: Record<string, string[]> = {
  'pet_friendly': ['pet', 'pets', 'dog', 'cat', 'pet-friendly', 'pet friendly'],
  'pool': ['pool', 'swimming', 'aquatic'],
  'transportation': ['transportation', 'shuttle', 'transport', 'bus'],
  'meals': ['meals', 'dining', 'food', 'restaurant'],
  'fitness': ['gym', 'fitness', 'exercise', 'workout'],
  'garden': ['garden', 'outdoor', 'nature'],
  'activities': ['activities', 'social', 'entertainment', 'events'],
  'library': ['library', 'reading', 'books'],
  'wifi': ['wifi', 'internet', 'wireless', 'wi-fi'],
  'parking': ['parking', 'garage', 'car']
};

// Quality indicators
const QUALITY_KEYWORDS = {
  high: ['good reviews', 'highly rated', '5 star', 'five star', 'excellent', 'best', 'top rated', 'premium'],
  verified: ['verified', 'certified', 'accredited', 'licensed']
};

/**
 * Parse natural language query into structured search parameters
 */
function parseNaturalLanguageQuery(query: string) {
  const lowerQuery = query.toLowerCase();
  
  // Extract care types
  const careTypes: string[] = [];
  for (const [type, keywords] of Object.entries(CARE_TYPE_KEYWORDS)) {
    if (keywords.some(keyword => lowerQuery.includes(keyword))) {
      careTypes.push(type);
    }
  }

  // Extract amenities
  const amenities: string[] = [];
  for (const [amenity, keywords] of Object.entries(AMENITY_KEYWORDS)) {
    if (keywords.some(keyword => lowerQuery.includes(keyword))) {
      amenities.push(amenity);
    }
  }

  // Extract price range
  let priceRange: { min?: number; max?: number } = {};
  
  // Pattern: "under $X" or "less than $X" or "below $X"
  const underPriceMatch = lowerQuery.match(/(?:under|less than|below|cheaper than|max)\s*\$?\s*(\d{1,5}(?:,\d{3})*)/);
  if (underPriceMatch) {
    priceRange.max = parseInt(underPriceMatch[1].replace(/,/g, ''));
  }
  
  // Pattern: "over $X" or "more than $X" or "above $X"
  const overPriceMatch = lowerQuery.match(/(?:over|more than|above|at least|min)\s*\$?\s*(\d{1,5}(?:,\d{3})*)/);
  if (overPriceMatch) {
    priceRange.min = parseInt(overPriceMatch[1].replace(/,/g, ''));
  }
  
  // Pattern: "$X to $Y" or "between $X and $Y"
  const rangePriceMatch = lowerQuery.match(/(?:\$?\s*(\d{1,5}(?:,\d{3})*)\s*(?:to|-)\s*\$?\s*(\d{1,5}(?:,\d{3})*)|between\s*\$?\s*(\d{1,5}(?:,\d{3})*)\s*and\s*\$?\s*(\d{1,5}(?:,\d{3})*))/) ;
  if (rangePriceMatch) {
    priceRange.min = parseInt((rangePriceMatch[1] || rangePriceMatch[3]).replace(/,/g, ''));
    priceRange.max = parseInt((rangePriceMatch[2] || rangePriceMatch[4]).replace(/,/g, ''));
  }

  // Extract location
  let location: { city?: string; state?: string; radius?: number } = {};
  
  // Common city patterns
  const cityPatterns = [
    /(?:in|near|around|at)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),?\s*([A-Z]{2})/,  // "in Dallas, TX"
    /(?:in|near|around|at)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/,  // "in Dallas"
  ];
  
  for (const pattern of cityPatterns) {
    const match = query.match(pattern);  // Use original case for city names
    if (match) {
      location.city = match[1];
      if (match[2]) {
        location.state = match[2].toUpperCase();
      }
      break;
    }
  }
  
  // State patterns
  if (!location.state) {
    const stateMatch = query.match(/\b([A-Z]{2})\b/);
    if (stateMatch) {
      location.state = stateMatch[1];
    }
  }
  
  // Distance/radius patterns
  const radiusMatch = lowerQuery.match(/within\s*(\d+)\s*(?:miles?|mi)/);
  if (radiusMatch) {
    location.radius = parseInt(radiusMatch[1]);
  }

  // Extract quality requirements
  const requiresHighQuality = QUALITY_KEYWORDS.high.some(keyword => lowerQuery.includes(keyword));
  const requiresVerified = QUALITY_KEYWORDS.verified.some(keyword => lowerQuery.includes(keyword));
  
  // Extract availability preference
  let availability: 'available' | 'waitlist' | 'any' = 'any';
  if (lowerQuery.includes('available now') || lowerQuery.includes('immediate')) {
    availability = 'available';
  } else if (lowerQuery.includes('waitlist') || lowerQuery.includes('wait list')) {
    availability = 'waitlist';
  }

  // Special keywords
  const isVeteran = lowerQuery.includes('veteran') || lowerQuery.includes('va ') || lowerQuery.includes('vets');
  const needsHUD = lowerQuery.includes('hud') || lowerQuery.includes('affordable') || lowerQuery.includes('subsidized');

  return {
    originalQuery: query,
    parsedIntent: {
      careTypes: careTypes.length > 0 ? careTypes : undefined,
      priceRange: Object.keys(priceRange).length > 0 ? priceRange : undefined,
      location: Object.keys(location).length > 0 ? location : undefined,
      amenities: amenities.length > 0 ? amenities : undefined,
      requiresHighQuality,
      requiresVerified,
      availability: availability !== 'any' ? availability : undefined,
      isVeteran,
      needsHUD
    },
    searchType: 'hybrid' as const,
    confidence: calculateConfidence(careTypes, location, priceRange)
  };
}

/**
 * Calculate confidence score based on parsed elements
 */
function calculateConfidence(
  careTypes: string[], 
  location: any, 
  priceRange: any
): number {
  let score = 0.5; // Base confidence
  
  if (careTypes.length > 0) score += 0.2;
  if (location.city || location.state) score += 0.15;
  if (Object.keys(priceRange).length > 0) score += 0.15;
  
  return Math.min(score, 1.0);
}

/**
 * POST /api/natural-language/search
 * Parse natural language query and perform search
 */
router.post('/search', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Query is required'
      });
    }

    console.log(`🗣️ Natural language query: "${query}"`);
    
    // Parse the natural language query
    const parsed = parseNaturalLanguageQuery(query);
    
    console.log('📊 Parsed intent:', JSON.stringify(parsed.parsedIntent, null, 2));

    // Build filters for Weaviate search
    const filters: any = {};
    
    if (parsed.parsedIntent.careTypes) {
      filters.careTypes = parsed.parsedIntent.careTypes;
    }
    
    if (parsed.parsedIntent.priceRange) {
      filters.priceRange = parsed.parsedIntent.priceRange;
    }
    
    if (parsed.parsedIntent.location) {
      filters.location = parsed.parsedIntent.location;
    }
    
    if (parsed.parsedIntent.availability) {
      filters.availability = parsed.parsedIntent.availability;
    }
    
    if (parsed.parsedIntent.requiresHighQuality) {
      filters.qualityMin = 4.0; // Minimum 4-star rating
    }

    // Enhance query for semantic search
    let enhancedQuery = query;
    if (parsed.parsedIntent.amenities && parsed.parsedIntent.amenities.length > 0) {
      enhancedQuery += ' ' + parsed.parsedIntent.amenities.join(' ');
    }
    if (parsed.parsedIntent.isVeteran) {
      enhancedQuery += ' veterans VA';
    }
    if (parsed.parsedIntent.needsHUD) {
      enhancedQuery += ' HUD affordable subsidized';
    }

    // Try to use Weaviate enhanced search first
    let searchResults: any[] = [];
    let searchMethod = 'weaviate';
    
    try {
      // Use Weaviate enhanced semantic search
      const weaviateResults = await enhancedWeaviateService.enhancedSemanticSearch({
        query: enhancedQuery,
        limit: 20,
        searchType: 'hybrid',
        alpha: 0.75,
        filters
      });
      
      searchResults = weaviateResults.map((result: any) => ({
        ...result.community,
        score: result.score,
        relevanceFactors: result.relevanceFactors
      }));
      
      console.log(`✅ Weaviate returned ${searchResults.length} results`);
      
      // If Weaviate returns no results, fall back to database search
      if (searchResults.length === 0) {
        console.log('⚠️ No Weaviate results, falling back to database search');
        searchMethod = 'database';
      }
      
    } catch (weaviateError) {
      console.log('⚠️ Weaviate error, falling back to database search:', weaviateError);
      searchMethod = 'database';
    }
    
    // Execute database fallback if needed
    if (searchMethod === 'database') {
      
      // Fallback to database search
      const conditions: any[] = [];
      
      // Apply care type filters - check if care types array contains the requested types
      if (parsed.parsedIntent.careTypes && parsed.parsedIntent.careTypes.length > 0) {
        // Map our internal care type names to database care type strings
        const careTypeMapping: Record<string, string[]> = {
          'memory_care': ['Memory Care', 'Alzheimer\'s Care', 'Dementia Care'],
          'assisted_living': ['Assisted Living', 'Assisted Care', 'Assisted Living Residence'],
          'independent_living': ['Independent Living', 'Senior Apartments', 'Retirement Community'],
          'skilled_nursing': ['Skilled Nursing', 'Nursing Home', 'Nursing Care'],
          'continuing_care': ['Continuing Care', 'CCRC', 'Life Care'],
          'hud_senior_housing': ['HUD Senior Housing', 'Low Income Housing', 'Subsidized Housing'],
          'mobile_home_park': ['Mobile Home Park', 'RV Park', 'Manufactured Home Community'],
          'active_adult_55_plus': ['Active Adult', '55+', '55 Plus', 'Age-Restricted']
        };
        
        // Collect all care type strings to search for
        const allCareTypeStrings: string[] = [];
        for (const type of parsed.parsedIntent.careTypes) {
          const dbCareTypes = careTypeMapping[type];
          if (dbCareTypes) {
            allCareTypeStrings.push(...dbCareTypes);
          }
        }
        
        // If we have care type strings to search for, add a single condition
        if (allCareTypeStrings.length > 0) {
          // Skip care type filtering for now due to array column complexity
          // This would need a more sophisticated approach
          console.log('Note: Care type filtering temporarily disabled in database fallback');
        }
      }
      
      // Apply location filters
      if (parsed.parsedIntent.location) {
        if (parsed.parsedIntent.location.city) {
          conditions.push(ilike(communities.city, `%${parsed.parsedIntent.location.city}%`));
        }
        if (parsed.parsedIntent.location.state) {
          conditions.push(eq(communities.state, parsed.parsedIntent.location.state));
        }
      }
      
      // Apply price filters - check the price_range JSON column
      if (parsed.parsedIntent.priceRange) {
        // The price_range column is JSON with structure like: {"min": 2000, "max": 4000}
        if (parsed.parsedIntent.priceRange.min) {
          conditions.push(
            sql`(${communities.price_range}->>'min')::numeric >= ${parsed.parsedIntent.priceRange.min}`
          );
        }
        if (parsed.parsedIntent.priceRange.max) {
          conditions.push(
            sql`(${communities.price_range}->>'max')::numeric <= ${parsed.parsedIntent.priceRange.max}`
          );
        }
      }
      
      // Apply quality filter (using rating)
      if (parsed.parsedIntent.requiresHighQuality) {
        conditions.push(sql`${communities.rating} >= 4.0`);
      }
      
      // Execute database search
      const dbResults = await db
        .select()
        .from(communities)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .limit(20);
      
      searchResults = dbResults.map(community => ({
        ...community,
        score: 0.8, // Default relevance score for database results
        relevanceFactors: {
          semanticMatch: 0,
          keywordMatch: 0.8,
          personalizationBoost: 0,
          qualityScore: community.rating || 0,
          availabilityBonus: 0
        }
      }));
      
      console.log(`✅ Database returned ${searchResults.length} results`);
    }
    
    res.json({
      success: true,
      query,
      parsed: parsed.parsedIntent,
      confidence: parsed.confidence,
      searchMethod,
      results: searchResults,
      resultCount: searchResults.length,
      explanation: generateExplanation(parsed.parsedIntent),
      filters,
      _version: 'v4_natural_language_search',
      _timestamp: Date.now()
    });

  } catch (error) {
    console.error('Natural language search error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process natural language query'
    });
  }
});

/**
 * Generate human-readable explanation of parsed intent
 */
function generateExplanation(intent: any): string {
  const parts: string[] = [];
  
  if (intent.careTypes && intent.careTypes.length > 0) {
    const types = intent.careTypes.map((t: string) => t.replace(/_/g, ' ')).join(', ');
    parts.push(`Looking for ${types}`);
  }
  
  if (intent.location) {
    if (intent.location.city && intent.location.state) {
      parts.push(`in ${intent.location.city}, ${intent.location.state}`);
    } else if (intent.location.city) {
      parts.push(`in ${intent.location.city}`);
    } else if (intent.location.state) {
      parts.push(`in ${intent.location.state}`);
    }
    
    if (intent.location.radius) {
      parts.push(`within ${intent.location.radius} miles`);
    }
  }
  
  if (intent.priceRange) {
    if (intent.priceRange.max && !intent.priceRange.min) {
      parts.push(`under $${intent.priceRange.max.toLocaleString()}/month`);
    } else if (intent.priceRange.min && !intent.priceRange.max) {
      parts.push(`over $${intent.priceRange.min.toLocaleString()}/month`);
    } else if (intent.priceRange.min && intent.priceRange.max) {
      parts.push(`$${intent.priceRange.min.toLocaleString()}-$${intent.priceRange.max.toLocaleString()}/month`);
    }
  }
  
  if (intent.amenities && intent.amenities.length > 0) {
    const amenities = intent.amenities.map((a: string) => a.replace(/_/g, ' ')).join(', ');
    parts.push(`with ${amenities}`);
  }
  
  if (intent.requiresHighQuality) {
    parts.push('with good reviews');
  }
  
  if (intent.isVeteran) {
    parts.push('for veterans');
  }
  
  if (intent.availability === 'available') {
    parts.push('available immediately');
  }
  
  return parts.length > 0 ? parts.join(' ') : 'Searching all communities';
}

export default router;
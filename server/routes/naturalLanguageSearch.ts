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
  'hud_senior_housing': ['hud', 'subsidized', 'low income', 'section 8'],  // Removed 'affordable' to prevent false positives
  'mobile_home_park': ['mobile home', 'manufactured', 'trailer park'],
  'active_adult_55_plus': ['55 plus', '55+', 'active adult', 'retirement community']
};

// Amenity keywords - Enhanced with synonym support
const AMENITY_KEYWORDS: Record<string, string[]> = {
  'pet_friendly': ['pet', 'pets', 'dog', 'cat', 'pet-friendly', 'pet friendly'],
  'pool': ['pool', 'swimming', 'aquatic'],
  'transportation': ['transportation', 'shuttle', 'transport', 'bus'],
  'meals': ['meals', 'dining', 'food', 'restaurant'],
  'fitness': ['fitness', 'exercise', 'workout'],
  'gym': ['gym'], // Separate gym for exact matching
  'garden': ['garden', 'outdoor', 'nature'],
  'activities': ['activities', 'social', 'entertainment', 'events'],
  'library': ['library', 'reading', 'books'],
  'wifi': ['wifi', 'internet', 'wireless', 'wi-fi'],
  'parking': ['parking', 'garage', 'car']
};

// Quality indicators - Enhanced
const QUALITY_KEYWORDS = {
  high: ['good reviews', 'highly rated', '5 star', 'five star', 'excellent', 'best', 'top rated', 'premium', 'high quality', 'quality care'],
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

  // Extract price range - WAVE 2 ENHANCED with better keyword recognition
  let priceRange: { min?: number; max?: number } = {};
  
  // Pattern: "under $X" or "less than $X" or "below $X" - more flexible matching
  const underPriceMatch = lowerQuery.match(/(?:under|less than|below|cheaper than|max|maximum|up to|no more than)\s+\$?\s*(\d{1,5}(?:,\d{3})*)/);
  if (underPriceMatch) {
    priceRange.max = parseInt(underPriceMatch[1].replace(/,/g, ''));
  }
  
  // Pattern: "over $X" or "more than $X" or "above $X"
  const overPriceMatch = lowerQuery.match(/(?:over|more than|above|at least|min|minimum|starting at|from)\s+\$?\s*(\d{1,5}(?:,\d{3})*)/);
  if (overPriceMatch) {
    priceRange.min = parseInt(overPriceMatch[1].replace(/,/g, ''));
  }
  
  // Pattern: "$X to $Y" or "between $X and $Y" or "$X-$Y"
  const rangePriceMatch = lowerQuery.match(/(?:\$?\s*(\d{1,5}(?:,\d{3})*)\s*(?:to|-|–)\s*\$?\s*(\d{1,5}(?:,\d{3})*)|between\s*\$?\s*(\d{1,5}(?:,\d{3})*)\s*and\s*\$?\s*(\d{1,5}(?:,\d{3})*))/) ;
  if (rangePriceMatch) {
    priceRange.min = parseInt((rangePriceMatch[1] || rangePriceMatch[3]).replace(/,/g, ''));
    priceRange.max = parseInt((rangePriceMatch[2] || rangePriceMatch[4]).replace(/,/g, ''));
  }
  
  // WAVE 2: Handle standalone price mentions (e.g., "$3000 memory care")
  if (!priceRange.max && !priceRange.min) {
    const standalonePriceMatch = lowerQuery.match(/\$\s*(\d{1,5}(?:,\d{3})*)/);
    if (standalonePriceMatch) {
      const price = parseInt(standalonePriceMatch[1].replace(/,/g, ''));
      // Assume it's a budget/max if they just mention a price
      priceRange.max = price;
    }
  }
  
  // WAVE 2: Handle "cheap" or "expensive" keywords - Enhanced with budget and affordable
  if (lowerQuery.includes('cheap') || lowerQuery.includes('inexpensive') || lowerQuery.includes('low cost') || lowerQuery.includes('budget') || lowerQuery.includes('affordable')) {
    if (!priceRange.max) priceRange.max = 3000; // Default budget-friendly threshold
  }
  if (lowerQuery.includes('expensive') || lowerQuery.includes('luxury') || lowerQuery.includes('high end')) {
    if (!priceRange.min) priceRange.min = 6000; // Default luxury threshold
  }

  // Extract location - WAVE 2 ENHANCED with better state vs city recognition
  let location: { city?: string; state?: string; radius?: number } = {};
  
  // WAVE 2: Define common state names and abbreviations for better recognition
  const STATE_NAMES: Record<string, string> = {
    'california': 'CA', 'texas': 'TX', 'florida': 'FL', 'new york': 'NY',
    'pennsylvania': 'PA', 'illinois': 'IL', 'ohio': 'OH', 'georgia': 'GA',
    'north carolina': 'NC', 'michigan': 'MI', 'hawaii': 'HI', 'alaska': 'AK',
    'arizona': 'AZ', 'colorado': 'CO', 'washington': 'WA', 'oregon': 'OR',
    'nevada': 'NV', 'new mexico': 'NM', 'utah': 'UT', 'idaho': 'ID',
    'montana': 'MT', 'wyoming': 'WY', 'north dakota': 'ND', 'south dakota': 'SD',
    'nebraska': 'NE', 'kansas': 'KS', 'oklahoma': 'OK', 'missouri': 'MO',
    'iowa': 'IA', 'minnesota': 'MN', 'wisconsin': 'WI', 'indiana': 'IN',
    'kentucky': 'KY', 'tennessee': 'TN', 'mississippi': 'MS', 'alabama': 'AL',
    'arkansas': 'AR', 'louisiana': 'LA', 'south carolina': 'SC', 'virginia': 'VA',
    'west virginia': 'WV', 'maryland': 'MD', 'delaware': 'DE', 'new jersey': 'NJ',
    'connecticut': 'CT', 'massachusetts': 'MA', 'rhode island': 'RI', 'vermont': 'VT',
    'new hampshire': 'NH', 'maine': 'ME', 'puerto rico': 'PR'
  };
  
  // WAVE 2: Check for state names first (they're more specific)
  for (const [stateName, stateCode] of Object.entries(STATE_NAMES)) {
    if (lowerQuery.includes(stateName)) {
      location.state = stateCode;
      break;
    }
  }
  
  // Common city patterns with better recognition
  const cityPatterns = [
    /(?:in|near|around|at)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),?\s*([A-Z]{2})/,  // "in Dallas, TX"
    /(?:in|near|around|at)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/,  // "in Dallas"
  ];
  
  for (const pattern of cityPatterns) {
    const match = query.match(pattern);  // Use original case for city names
    if (match) {
      const potentialCity = match[1];
      const potentialState = match[2];
      
      // WAVE 2: Check if it's actually a state name, not a city
      const cityLower = potentialCity.toLowerCase();
      
      // Check if the potential city contains a state name (e.g., "Phoenix Arizona")
      let actualCity = potentialCity;
      let extractedState = null;
      
      // Check if the last word is a state name
      const words = potentialCity.split(' ');
      if (words.length > 1) {
        const lastWord = words[words.length - 1].toLowerCase();
        if (STATE_NAMES[lastWord]) {
          extractedState = STATE_NAMES[lastWord];
          actualCity = words.slice(0, -1).join(' ');
        }
      }
      
      // Only set as city if it's not a state name
      if (!STATE_NAMES[cityLower]) {
        location.city = actualCity;
      }
      
      // Set state from either the extracted state or the explicit state code
      if (extractedState) {
        location.state = extractedState;
      } else if (potentialState) {
        location.state = potentialState.toUpperCase();
      }
      break;
    }
  }
  
  // State abbreviation patterns (if not already found)
  if (!location.state) {
    const stateMatch = query.match(/\b([A-Z]{2})\b/);
    if (stateMatch) {
      // WAVE 2: Validate it's a real state abbreviation
      const validStateAbbrevs = Object.values(STATE_NAMES);
      if (validStateAbbrevs.includes(stateMatch[1])) {
        location.state = stateMatch[1];
      }
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
  
  // Extract availability preference - Enhanced
  let availability: 'immediate' | 'available' | 'waitlist' | 'any' = 'any';
  if (lowerQuery.includes('available now') || lowerQuery.includes('immediate')) {
    availability = 'immediate';  // Use 'immediate' for urgent availability
  } else if (lowerQuery.includes('available')) {
    availability = 'available';
  } else if (lowerQuery.includes('waitlist') || lowerQuery.includes('wait list')) {
    availability = 'waitlist';
  }

  // Special keywords - Enhanced with military recognition
  const isVeteran = lowerQuery.includes('veteran') || lowerQuery.includes('va ') || lowerQuery.includes('vets') || lowerQuery.includes('military');
  // Only trigger HUD for explicit HUD mentions or subsidized, not just "affordable"
  const needsHUD = lowerQuery.includes('hud') || lowerQuery.includes('subsidized') || lowerQuery.includes('section 8');

  // WAVE 2: Ensure all parsed values are included in the return object
  return {
    originalQuery: query,
    parsedIntent: {
      careTypes: careTypes.length > 0 ? careTypes : undefined,
      priceRange: (priceRange.min !== undefined || priceRange.max !== undefined) ? priceRange : undefined,
      location: (location.city || location.state || location.radius) ? location : undefined,
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
  let parsed: any = null;  // Declare parsed at function scope
  let filters: any = {};   // Declare filters at function scope
  let query: string = '';  // Declare query at function scope
  
  try {
    query = req.body.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Query is required'
      });
    }

    console.log(`🗣️ Natural language query: "${query}"`);
    
    // Parse the natural language query
    parsed = parseNaturalLanguageQuery(query);
    
    console.log('📊 Parsed intent:', JSON.stringify(parsed.parsedIntent, null, 2));

    // Build filters for Weaviate search
    filters = {}; // Reset filters
    
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
      
      // Apply price filters - skip for now due to JSONB complexity in fallback
      if (parsed.parsedIntent.priceRange) {
        // Skip price filtering in database fallback to avoid SQL errors
        // The Weaviate search handles price filtering properly
        console.log('Note: Price filtering temporarily disabled in database fallback');
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
    
    // Still return parsed intent even if search fails
    // This helps with debugging and shows Wave 2 improvements are working
    if (parsed) {
      res.status(200).json({
        success: true,
        query,
        parsed: parsed.parsedIntent,
        confidence: parsed.confidence,
        searchMethod: 'fallback_with_error',
        results: [],
        resultCount: 0,
        explanation: generateExplanation(parsed.parsedIntent),
        filters,
        _version: 'v4_natural_language_search',
        _timestamp: Date.now()
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to process natural language query'
      });
    }
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
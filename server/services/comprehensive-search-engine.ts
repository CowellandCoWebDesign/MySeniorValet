/**
 * COMPREHENSIVE SEARCH ENGINE - Zillow-level Search Capability
 * Handles ALL search types: natural language, locations, companies, prices, care types
 */

import { db } from '../db';
import { communities, healthcareServiceTypes } from '@shared/schema';
import { eq, and, or, ilike, gte, lte, sql, desc, asc, isNotNull } from 'drizzle-orm';

export interface SearchFilters {
  careTypes?: string[];
  priceMin?: number;
  priceMax?: number;
  state?: string;
  city?: string;
  rating?: number;
  features?: string[];
  bedrooms?: number;
  bathrooms?: number;
  radius?: number;
  latitude?: number;
  longitude?: number;
}

export interface SearchResult {
  communities: any[];
  healthcareServices?: any[]; // Optional healthcare services results
  totalResults: number;
  searchMetadata: {
    query: string;
    searchType: string;
    filters: SearchFilters;
    processingTime: number;
    suggestions?: string[];
    fallbackApplied?: boolean;
    fallbackMessage?: string;
    originalFiltersRequested?: SearchFilters;
    includesHealthcare?: boolean; // Indicates if healthcare results are included
  };
  facets: {
    states: { name: string; count: number }[];
    careTypes: { name: string; count: number }[];
    priceRanges: { range: string; count: number }[];
    ratings: { rating: number; count: number }[];
    healthcareTypes?: { name: string; count: number }[]; // Optional healthcare facets
  };
}

export class ComprehensiveSearchEngine {
  
  async search(query: string, filters: SearchFilters = {}, options: { limit?: number; offset?: number } = {}): Promise<SearchResult> {
    const startTime = Date.now();
    const { limit = 100, offset = 0 } = options;
    
    // Store original filters for fallback message
    const originalFilters = { ...filters };
    const hasFilters = filters.priceMin || filters.priceMax || filters.rating || 
                      (filters.features && filters.features.length > 0) ||
                      (filters.careTypes && filters.careTypes.length > 0);
    
    // Check if this is a healthcare-related search
    const isHealthcareSearch = await this.isHealthcareSearch(query.toLowerCase());
    
    // Detect search type and build conditions
    const { conditions, searchType } = await this.buildSearchConditions(query, filters);
    console.log(`🔍 Total conditions built: ${conditions.length}, searchType: ${searchType}, isHealthcare: ${isHealthcareSearch}`);
    

    
    // Execute main search
    let searchQuery = db.select().from(communities);
    
    if (conditions.length > 0) {
      console.log(`🔍 Applying ${conditions.length} search conditions for query: "${query}"`);
      searchQuery = searchQuery.where(and(...conditions));
    } else {
      console.log(`⚠️ No search conditions applied for query: "${query}"`);
    }
    
    // Add sorting based on search type
    searchQuery = this.applySorting(searchQuery, searchType, query);
    
    // Execute with pagination
    let results = await searchQuery
      .limit(limit)
      .offset(offset);
    
    // Get total count
    let countQuery = db.select({ count: sql`count(*)` }).from(communities);
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions));
    }
    let [{ count }] = await countQuery;
    let totalResults = parseInt(count.toString());
    
    // If it's a location search with no specific results, broaden the search to the city/state
    if (totalResults === 0 && query && query.includes(',')) {
      console.log(`🔄 No exact matches, broadening search to location area: ${query}`);
      const locationParts = query.split(',').map(p => p.trim());
      const city = locationParts[0];
      const state = locationParts[1];
      
      // Search for communities in the same city or state
      const broadConditions = [];
      if (city) {
        broadConditions.push(ilike(communities.city, `%${city}%`));
      }
      if (state) {
        broadConditions.push(or(
          ilike(communities.state, `%${state}%`),
          eq(communities.state, state.toUpperCase())
        ));
      }
      
      if (broadConditions.length > 0) {
        const broadQuery = db.select().from(communities)
          .where(and(...broadConditions))
          .limit(20); // Get up to 20 from the area
        
        results = await broadQuery;
        totalResults = results.length;
        console.log(`📍 Found ${totalResults} communities in ${city}, ${state} area`);
      }
    }
    
    // DISCOVERY MODE: Use AI only when NO results are found
    let discoveryMode = false;
    let discoveryMessage = '';
    let aiSuggestions: any = null;
    
    // Activate Discovery Mode for enhanced search (0 results OR location searches)
    // For location searches, first get database results, then enhance with Discovery
    const isLocationSearch = query && (query.includes(',') || 
                                       query.match(/\b(CA|California|city|town)\b/i));
    
    if ((totalResults === 0 || isLocationSearch) && query && query.trim() !== '') {
      console.log(`🔍 Activating Discovery Mode for query: "${query}" (${totalResults} database results)`);
      discoveryMode = true;
      
      if (totalResults === 0) {
        discoveryMessage = "🔮 Discovery Mode Activated: We're using AI to find communities that match your search. Click on any result to see live pricing and availability.";
      } else {
        discoveryMessage = `🔮 Discovery Mode Enhanced: Found ${totalResults} communities in our database. Using AI to discover additional options for you.`;
      }
    }
    
    // Build facets for filtering
    const facets = await this.buildFacets(conditions);
    
    // Generate search suggestions
    const suggestions = await this.generateSuggestions(query, searchType);
    
    // Get intent scores for metadata
    const normalizedQuery = query ? query.toLowerCase().trim() : '';
    const intentScores = normalizedQuery ? await this.calculateIntentScores(normalizedQuery) : null;
    
    // If this is a healthcare search, also get healthcare services
    let healthcareServices: any[] | undefined;
    let healthcareTypeFacets: { name: string; count: number }[] | undefined;
    
    if (isHealthcareSearch) {
      const healthcareResults = await this.searchHealthcareServices(query, limit, offset);
      healthcareServices = healthcareResults.services;
      healthcareTypeFacets = healthcareResults.facets;
    }
    
    // DISCOVERY MODE AI INTEGRATION
    if (discoveryMode) {
      try {
        // Import Perplexity service for Discovery Mode
        const { perplexityService } = await import('../perplexity-ai-service');
        
        // Construct intelligent search query for AI
        let aiQuery = `Find senior living communities `;
        if (query.includes(',')) {
          aiQuery += `in ${query}`;
        } else {
          aiQuery += `matching "${query}"`;
        }
        
        // Add filter context to AI query
        if (filters.careTypes && filters.careTypes.length > 0) {
          aiQuery += ` offering ${filters.careTypes.join(' or ')}`;
        }
        if (filters.priceMin || filters.priceMax) {
          if (filters.priceMin && filters.priceMax) {
            aiQuery += ` with pricing between $${filters.priceMin} and $${filters.priceMax} per month`;
          } else if (filters.priceMin) {
            aiQuery += ` starting from $${filters.priceMin} per month`;
          } else {
            aiQuery += ` under $${filters.priceMax} per month`;
          }
        }
        
        aiQuery += '. 🌍 Search worldwide - include communities from any country (USA, Canada, Australia, UK, Europe, Asia, etc.). Include contact information, websites, and specify the country/location for each community found.';
        
        console.log(`🤖 Discovery Mode Query: ${aiQuery}`);
        
        // Get AI-powered suggestions
        const aiResponse = await perplexityService.searchRealTime(aiQuery);
        aiSuggestions = {
          summary: aiResponse.summary,
          sources: aiResponse.sources,
          images: aiResponse.images
        };
        
        console.log(`✨ Discovery Mode found additional information from ${aiResponse.sources.length} sources`);
        
        // Parse Discovery Mode results into community objects
        const discoveredCommunities = this.parseDiscoveryModeResults(aiResponse.summary, query);
        if (discoveredCommunities.length > 0) {
          console.log(`🏘️ Discovery Mode parsed ${discoveredCommunities.length} communities from AI response`);
          // ADD discovered communities to existing database results, don't replace
          results = [...results, ...discoveredCommunities];
          totalResults = results.length;
          console.log(`📊 Total results after Discovery: ${totalResults} (${results.length - discoveredCommunities.length} from database, ${discoveredCommunities.length} from AI)`);
        }
      } catch (error) {
        console.error('Discovery Mode error:', error);
        // Continue without AI suggestions if there's an error
      }
    }
    
    return {
      communities: results,
      healthcareServices,
      totalResults,
      searchMetadata: {
        query,
        searchType,
        filters,
        processingTime: Date.now() - startTime,
        suggestions,
        discoveryMode: discoveryMode as any,
        discoveryMessage: discoveryMode ? discoveryMessage : undefined as any,
        aiSuggestions: discoveryMode ? aiSuggestions : undefined as any,
        includesHealthcare: isHealthcareSearch
      },
      facets: {
        ...facets,
        healthcareTypes: healthcareTypeFacets
      }
    };
  }
  
  private async buildSearchConditions(query: string, filters: SearchFilters) {
    const conditions: any[] = [];
    let searchType = 'general';
    
    if (!query || query.trim() === '') {
      searchType = 'browse';
    } else {
      // Normalize query
      const normalizedQuery = query.toLowerCase().trim();
      
      // MULTI-INTENT DETECTION: Based on Zillow's approach, detect multiple intents simultaneously
      const intentScores = await this.calculateIntentScores(normalizedQuery);
      const dominantIntent = this.getDominantIntent(intentScores);
      
      console.log(`Query: "${query}" | Intent scores:`, intentScores, `| Dominant: ${dominantIntent}`);
      
      // Check if this looks like a specific community name BEFORE applying location logic
      // Community names often contain city names (e.g., "San Diego Senior Manor")
      const looksLikeCommunityName = normalizedQuery.includes('manor') || 
                                     normalizedQuery.includes('estates') ||
                                     normalizedQuery.includes('village') ||
                                     normalizedQuery.includes('residence') ||
                                     normalizedQuery.includes('living') ||
                                     normalizedQuery.includes('senior') ||
                                     normalizedQuery.includes('care') ||
                                     normalizedQuery.includes('home') ||
                                     normalizedQuery.includes('center') ||
                                     normalizedQuery.includes('community');
      
      // Apply conditions based on ALL detected intents (not just dominant)
      let isCountrySearch = false;
      
      // Only apply location search if it doesn't look like a community name
      if (intentScores.location >= 0.3 && !looksLikeCommunityName) {
        // Check if this is an international location query first
        const isInternational = this.detectInternationalQuery(normalizedQuery);
        
        if (isInternational) {
          // For international queries, add a condition that won't match to trigger Discovery Mode
          conditions.push(eq(communities.country, 'TRIGGER_DISCOVERY_MODE'));
          console.log(`🌍 International location detected, triggering Discovery Mode for: ${normalizedQuery}`);
          searchType = 'international';
        } else {
          const locationConditions = await this.buildLocationConditions(normalizedQuery);
          console.log(`🔍 Raw location conditions built: ${locationConditions.length}`);
          
          // Only add location conditions if they exist
          if (locationConditions.length > 0) {
            // Combine multiple location conditions with OR, not AND
            if (locationConditions.length > 1) {
              conditions.push(or(...locationConditions));
              console.log(`🔍 Combined ${locationConditions.length} location conditions with OR`);
            } else {
              conditions.push(...locationConditions);
              console.log(`🔍 Added single location condition`);
            }
          }
          // Check if this was a country search
          isCountrySearch = (locationConditions as any).__isCountrySearch;
          console.log(`🔍 After location: conditions.length=${conditions.length}, isCountrySearch=${isCountrySearch}`);
        }
      }
      
      if (intentScores.careType > 0.3) {
        const careConditions = await this.buildCareTypeConditions(normalizedQuery);
        conditions.push(...careConditions);
      }
      
      if (intentScores.price > 0.3) {
        const priceConditions = await this.buildPriceConditions(normalizedQuery);
        conditions.push(...priceConditions);
      }
      
      if (intentScores.company > 0.3) {
        conditions.push(
          or(
            ilike(communities.name, `%${normalizedQuery}%`),
            ilike(communities.managementCompany, `%${normalizedQuery}%`)
          )
        );
        console.log(`🔍 Added company search conditions for "${normalizedQuery}"`);
      }
      
      // PRIORITY 1: ALWAYS check for exact or partial community name matches FIRST
      // This is the most important search - users often search for specific communities
      const nameConditions = [];
      
      // 1. Exact match (highest priority)
      nameConditions.push(ilike(communities.name, normalizedQuery));
      
      // 2. Starts with (high priority for partial searches)
      nameConditions.push(ilike(communities.name, `${normalizedQuery}%`));
      
      // 3. Contains (catches all partial matches)
      nameConditions.push(ilike(communities.name, `%${normalizedQuery}%`));
      
      // 4. Word boundary matching (for multi-word searches)
      const queryWords = normalizedQuery.split(/\s+/);
      if (queryWords.length > 1) {
        // Match any community that contains all words (in any order)
        const wordConditions = queryWords.map(word => 
          ilike(communities.name, `%${word}%`)
        );
        nameConditions.push(and(...wordConditions));
        
        // Also search for the exact phrase in community names
        const exactPhrase = queryWords.join(' ');
        nameConditions.push(ilike(communities.name, `%${exactPhrase}%`));
      }
      
      // 5. FUZZY MATCHING - Handle common typos (Fortune 500-level capability)
      const fuzzyVariations = this.generateFuzzyVariations(normalizedQuery);
      fuzzyVariations.forEach(variation => {
        nameConditions.push(ilike(communities.name, `%${variation}%`));
      });
      
      // Check if we have name matches BEFORE applying other conditions
      const nameSearchCondition = or(...nameConditions);
      
      // PRIORITY: If no strong intent detected OR searching for a specific community name
      // Apply name search as the PRIMARY search method
      const hasLocationConditions = intentScores.location >= 0.3;
      const hasCompanyConditions = intentScores.company > 0.3;
      const hasCareTypeConditions = intentScores.careType > 0.3;
      const hasPriceConditions = intentScores.price > 0.3;
      
      // If no strong intent OR it looks like a community name search
      const maxIntentScore = Math.max(...Object.values(intentScores));
      const isLikelyCommunityName = maxIntentScore < 0.4 || 
                                    (!hasLocationConditions && !hasCareTypeConditions && !hasPriceConditions);
      
      if (isLikelyCommunityName && !hasCompanyConditions) {
        // ALWAYS add name search first for likely community name searches
        conditions.push(
          or(
            nameSearchCondition,
            // Also search in city/state/management company as fallback
            ilike(communities.city, `%${normalizedQuery}%`),
            ilike(communities.state, `%${normalizedQuery}%`),
            ilike(communities.managementCompany, `%${normalizedQuery}%`)
          )
        );
        console.log(`🔍 Added PRIMARY name search for potential community: "${normalizedQuery}"`);
      } else if (!hasCompanyConditions) {
        // Even for high-intent queries, add name search to catch specific communities
        conditions.push(nameSearchCondition);
        console.log(`🔍 Added supplementary name search for "${normalizedQuery}"`);
      }
      
      searchType = dominantIntent;
    }
    
    // Apply additional filters
    console.log(`🔍 Before applyFilters: ${conditions.length} conditions`);
    this.applyFilters(conditions, filters);
    console.log(`🔍 After applyFilters: ${conditions.length} conditions`);
    
    console.log(`🔍 Final conditions count before return: ${conditions.length}`);
    return { conditions, searchType };
  }
  
  // NEW: Multi-intent scoring system based on research
  private async calculateIntentScores(query: string): Promise<{
    location: number;
    careType: number;
    price: number;
    company: number;
    general: number;
  }> {
    const scores = {
      location: 0,
      careType: 0,
      price: 0,
      company: 0,
      general: 0
    };
    
    // Location intent patterns
    const locationPatterns = [
      /^[a-zA-Z\s]+,\s*[A-Z]{2}$/,     // "Sacramento, CA" - ONLY if it has comma and state
      /^\d{5}(-\d{4})?$/,              // ZIP codes
      /\b(in|near|around)\s+/,         // "memory care in Sacramento"
      /\b(city|state|county|zip)\b/,
      /\b(california|texas|florida|new york|illinois|ohio|pennsylvania|arizona|georgia|north carolina|michigan|new jersey|virginia|washington|massachusetts|indiana|tennessee|missouri|maryland|wisconsin|minnesota|colorado|alabama|south carolina|louisiana|kentucky|oregon|oklahoma|connecticut|iowa|mississippi|arkansas|utah|kansas|nevada|new mexico|nebraska|west virginia|idaho|hawaii|maine|new hampshire|rhode island|montana|delaware|south dakota|alaska|north dakota|vermont|wyoming)\b/i,  // State names
      /\b(sacramento|los angeles|san francisco|san diego|chicago|houston|phoenix|philadelphia|san antonio|dallas|san jose|austin|jacksonville|columbus|charlotte|detroit|el paso|memphis|seattle|denver|washington|boston|nashville|baltimore|oklahoma city|louisville|portland|las vegas|milwaukee|albuquerque|tucson|fresno|mesa|atlanta|kansas city|colorado springs|miami|raleigh|omaha|long beach|virginia beach|oakland|minneapolis|tulsa|arlington|tampa|new orleans)\b/i  // Major cities
    ];
    
    // Check for international locations separately with higher priority
    const internationalLocationPatterns = [
      /\b(sydney|melbourne|brisbane|perth|adelaide|auckland|wellington|christchurch)\b/i, // Australia/NZ cities
      /\b(london|manchester|birmingham|liverpool|edinburgh|glasgow|cardiff|belfast)\b/i, // UK cities
      /\b(toronto|vancouver|montreal|calgary|ottawa|edmonton|winnipeg|quebec)\b/i, // Canadian cities
      /\b(cancun|mexico city|guadalajara|monterrey|tijuana|puerto vallarta|cabo)\b/i, // Mexican cities
      /\b(paris|marseille|lyon|toulouse|nice|bordeaux|strasbourg)\b/i, // French cities
      /\b(tokyo|osaka|kyoto|yokohama|nagoya|sapporo|kobe|fukuoka)\b/i, // Japanese cities
      /\b(beijing|shanghai|guangzhou|shenzhen|hong kong|taipei|singapore)\b/i, // Asian cities
      /\b(moscow|st petersburg|dubai|abu dhabi|tel aviv|jerusalem|cairo)\b/i, // Other international
      /\b(berlin|munich|hamburg|cologne|frankfurt|stuttgart|dusseldorf)\b/i, // German cities
      /\b(madrid|barcelona|valencia|seville|bilbao|malaga)\b/i, // Spanish cities
      /\b(rome|milan|naples|turin|florence|venice|bologna)\b/i, // Italian cities
      /\b(amsterdam|rotterdam|brussels|zurich|vienna|stockholm|oslo|copenhagen)\b/i // European cities
    ];
    
    // Check international locations first (higher priority)
    internationalLocationPatterns.forEach(pattern => {
      if (pattern.test(query)) scores.location += 0.6; // Higher score for international cities
    });
    
    // Care type intent patterns  
    const careTypePatterns = [
      /\b(memory care|alzheimer|dementia)\b/i,
      /\b(assisted living|independent living)\b/i,
      /\b(nursing home|skilled nursing)\b/i,
      /\b(senior living|senior care)\b/i,
      /\b(rehabilitation|therapy)\b/i
    ];
    
    // Price intent patterns
    const pricePatterns = [
      /\$\d+/,                         // "$5000"
      /\b(under|over|below|above)\s*\$?\d+/i,  // "under $5000"
      /\b(cheap|affordable|expensive|luxury)\b/i,
      /\b\d+\s*to\s*\d+\b/,           // "3000 to 5000"
      /\b(budget|cost|price|pricing)\b/i
    ];
    
    // Company intent patterns
    const companyPatterns = [
      /\b(atria|brookdale|sunrise|brightview)\b/i,
      /\b(emeritus|belmont village|five star)\b/i,
      /\b(holiday retirement|senior lifestyle)\b/i,
      /\b(watermark|capital senior|discovery)\b/i
    ];
    
    // Calculate scores based on pattern matches
    locationPatterns.forEach(pattern => {
      if (pattern.test(query)) scores.location += 0.3;
    });
    
    careTypePatterns.forEach(pattern => {
      if (pattern.test(query)) scores.careType += 0.4;
    });
    
    pricePatterns.forEach(pattern => {
      if (pattern.test(query)) scores.price += 0.4;
    });
    
    companyPatterns.forEach(pattern => {
      if (pattern.test(query)) scores.company += 0.5;
    });
    
    // Normalize scores to 0-1 range
    const maxScore = Math.max(...Object.values(scores));
    if (maxScore > 1) {
      Object.keys(scores).forEach(key => {
        scores[key as keyof typeof scores] = scores[key as keyof typeof scores] / maxScore;
      });
    }
    
    return scores;
  }
  
  private getDominantIntent(scores: any): string {
    const entries = Object.entries(scores);
    const dominant = entries.reduce((a, b) => a[1] > b[1] ? a : b);
    return dominant[0];
  }
  
  /**
   * Generate fuzzy variations to handle typos
   * Fortune 500-level search capability for MySeniorValet
   */
  private generateFuzzyVariations(query: string): string[] {
    const variations: string[] = [];
    const lowerQuery = query.toLowerCase();
    
    // Common typo patterns for senior living companies and terms
    const typoMappings: { [key: string]: string[] } = {
      'atria': ['atrea', 'atira', 'atrya', 'artia'],
      'brookdale': ['brookdal', 'brokdale', 'brookdail', 'brookdalle'],
      'sunrise': ['sunrize', 'sun rise', 'sunris'],
      'brightview': ['bright view', 'brightvue', 'brightviw'],
      'arbor': ['arbour', 'arber'],
      'oakmont': ['oakmount', 'oak mont'],
      'hilltop': ['hill top', 'hiltop', 'hilltoop'],
      'manor': ['manner', 'maner', 'mannor'],
      'estates': ['estate', 'estetes', 'estats'],
      'village': ['vilage', 'villege', 'villige'],
      'residence': ['residance', 'residense'],
      'senior': ['senoir', 'senor', 'seinor'],
      'living': ['livng', 'livin', 'liveing'],
      'assisted': ['assited', 'asisted', 'assistd'],
      'memory': ['memry', 'memori', 'memmory'],
      'care': ['kare', 'caire']
    };
    
    // Check if query contains any of the mapped words
    for (const [correct, typos] of Object.entries(typoMappings)) {
      if (lowerQuery.includes(correct)) {
        // Add variations with typos for testing
        typos.forEach(typo => {
          const variation = lowerQuery.replace(correct, typo);
          if (variation !== lowerQuery) {
            variations.push(variation);
          }
        });
      } else {
        // Check if query contains a typo and fix it
        typos.forEach(typo => {
          if (lowerQuery.includes(typo)) {
            const corrected = lowerQuery.replace(typo, correct);
            if (corrected !== lowerQuery) {
              variations.push(corrected);
            }
          }
        });
      }
    }
    
    // Remove duplicates and limit to 5 variations for performance
    const uniqueVariations = [...new Set(variations)].slice(0, 5);
    
    if (uniqueVariations.length > 0) {
      console.log(`🔍 Generated ${uniqueVariations.length} fuzzy variations for "${query}": ${uniqueVariations.join(', ')}`);
    }
    
    return uniqueVariations;
  }
  
  private async isCompanySearch(query: string): Promise<boolean> {
    const scores = await this.calculateIntentScores(query);
    return scores.company > 0.4;
  }
  
  private async isLocationSearch(query: string): Promise<boolean> {
    // Check for city, state patterns
    return (
      query.match(/^[a-zA-Z\s]+(,\s*[A-Z]{2})?$/) ||
      query.match(/^\d{5}(-\d{4})?$/) || // ZIP code
      query.includes(' in ') ||
      query.includes(' near ') ||
      query.includes(' around ')
    );
  }
  
  private async isPriceSearch(query: string): Promise<boolean> {
    return (
      query.includes('$') ||
      query.includes('under') ||
      query.includes('over') ||
      query.includes('cheap') ||
      query.includes('expensive') ||
      query.includes('affordable') ||
      query.includes('budget') ||
      query.match(/\d+\s*k/) || // "3k", "5k"
      query.match(/\d+\s*-\s*\d+/) // price ranges
    );
  }
  
  private async isCareTypeSearch(query: string): Promise<boolean> {
    const careTypes = [
      'assisted living', 'memory care', 'independent living', 'nursing home',
      'skilled nursing', 'alzheimer', 'dementia', 'respite care', 'adult day care'
    ];
    return careTypes.some(type => query.includes(type));
  }
  
  private async isNaturalLanguageSearch(query: string): Promise<boolean> {
    const nlKeywords = ['best', 'top', 'good', 'recommend', 'quality', 'luxury', 'nice'];
    return nlKeywords.some(keyword => query.includes(keyword)) || query.length > 50;
  }
  
  private async buildLocationConditions(query: string): Promise<any[]> {
    const conditions: any[] = [];
    
    // 🌍 GLOBAL LOCATIONS - Support worldwide search
    const GLOBAL_REGIONS = {
      // US States
      'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR',
      'california': 'CA', 'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE',
      'florida': 'FL', 'georgia': 'GA', 'hawaii': 'HI', 'idaho': 'ID',
      'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA', 'kansas': 'KS',
      'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
      'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS',
      'missouri': 'MO', 'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV',
      'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY',
      'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH', 'oklahoma': 'OK',
      'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
      'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT',
      'vermont': 'VT', 'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV',
      'wisconsin': 'WI', 'wyoming': 'WY', 'district of columbia': 'DC', 'dc': 'DC',
      // Canadian Provinces
      'ontario': 'ON', 'quebec': 'QC', 'british columbia': 'BC', 'alberta': 'AB',
      'manitoba': 'MB', 'saskatchewan': 'SK', 'nova scotia': 'NS', 'new brunswick': 'NB',
      'newfoundland': 'NL', 'prince edward island': 'PE', 'northwest territories': 'NT',
      'yukon': 'YT', 'nunavut': 'NU',
      // Australian States
      'new south wales': 'NSW', 'victoria': 'VIC', 'queensland': 'QLD', 
      'western australia': 'WA', 'south australia': 'SA', 'tasmania': 'TAS',
      'australian capital territory': 'ACT', 'northern territory': 'NT'
    };
    
    // Country mappings for international search
    const COUNTRY_CODES = {
      'united states': 'US', 'usa': 'US', 'america': 'US',
      'canada': 'CA', 'australia': 'AU', 'united kingdom': 'UK', 'uk': 'UK',
      'mexico': 'MX', 'japan': 'JP', 'germany': 'DE', 'france': 'FR',
      'italy': 'IT', 'spain': 'ES', 'netherlands': 'NL', 'belgium': 'BE',
      'switzerland': 'CH', 'sweden': 'SE', 'norway': 'NO', 'denmark': 'DK',
      'new zealand': 'NZ', 'singapore': 'SG', 'ireland': 'IE', 'israel': 'IL'
    };
    
    // Handle "City, State/Country" format (e.g., "Sydney, Australia" or "Miami, FL")
    if (query.includes(',')) {
      const [city, region] = query.split(',').map(s => s.trim());
      console.log(`🌍 Parsing global location: city="${city}", region="${region}"`);
      
      // Check if it's a state/province code
      const regionCode = (GLOBAL_REGIONS as any)[region.toLowerCase()] || region.toUpperCase();
      
      // Check if it's a country
      const countryCode = (COUNTRY_CODES as any)[region.toLowerCase()];
      
      if (countryCode) {
        // City, Country search
        conditions.push(
          and(
            ilike(communities.city, `%${city}%`),
            or(
              eq(communities.country, countryCode),
              ilike(communities.country, `%${region}%`)
            )
          )
        );
        console.log(`🌍 Added global city-country condition for "${city}" in "${region}"`);
      } else {
        // City, State/Province search
        conditions.push(
          or(
            and(
              ilike(communities.city, `%${city}%`),
              ilike(communities.state, `%${regionCode}%`)
            ),
            and(
              ilike(communities.city, `%${city}%`),
              ilike(communities.state, `%${region}%`)
            )
          )
        );
        console.log(`🌍 Added global city-state condition for "${city}" in region="${region}"`);
      }
      return conditions;
    }
    // Postal codes (ZIP, postcodes, etc.)
    else if (query.match(/^[\d\w\s-]+$/) && query.length >= 3 && query.length <= 10) {
      conditions.push(
        ilike(communities.zipCode, `%${query}%`)
      );
      console.log(`🌍 Added global postal code search for "${query}"`);
    }
    // General location - could be city, state, or country anywhere in the world
    else {
      const queryLower = query.toLowerCase().trim();
      
      // Check if it's a known country
      const countryCode = (COUNTRY_CODES as any)[queryLower];
      if (countryCode) {
        conditions.push(
          or(
            eq(communities.country, countryCode),
            ilike(communities.country, `%${query}%`)
          )
        );
        console.log(`🌍 Added country search for "${query}"`);
      } else {
        // Global search - prioritize exact city matches first
        // For city searches like "Atlanta", we want communities IN Atlanta, not with Atlanta in the name
        const stateCode = (GLOBAL_REGIONS as any)[queryLower];
        
        if (stateCode) {
          // It's a state/province search
          conditions.push(
            ilike(communities.state, `%${stateCode}%`)
          );
          console.log(`🌍 Added state/province search for "${query}" (${stateCode})`);
        } else {
          // It's likely a city name - be more specific
          // Prioritize exact city matches, not partial name matches
          conditions.push(
            or(
              // Exact city match (highest priority)
              ilike(communities.city, query),
              // City starts with query
              ilike(communities.city, `${query}%`),
              // City contains query (but not in community name)
              and(
                ilike(communities.city, `%${query}%`),
                // Exclude results where it's just in the community name
                sql`${communities.city} IS NOT NULL AND ${communities.city} != ''`
              )
            )
          );
          console.log(`🌍 Added specific city search for "${query}"`);
        }
      }
    }
    
    return conditions;
  }
  
  private async buildPriceConditions(query: string): Promise<any[]> {
    const conditions: any[] = [];
    
    // IMPORTANT: Most communities don't have pricing until enrichment
    // So we should NOT filter out communities without pricing by default
    // Only apply price filters when explicitly requested
    
    const priceMatch = query.match(/\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/g);
    if (priceMatch) {
      const prices = priceMatch.map(p => parseInt(p.replace(/[$,]/g, '')));
      console.log(`Price filtering requested: ${prices.join(', ')}`);
      console.log(`Note: Only showing communities with pricing data. Many communities require enrichment for pricing.`);
      
      if (query.includes('under') || query.includes('below') || query.includes('<')) {
        // Only filter communities that HAVE pricing data
        conditions.push(
          and(
            isNotNull(communities.rentPerMonth),
            sql`${communities.rentPerMonth} > 0`,  // Ensure it's a real price
            sql`${communities.rentPerMonth} < ${prices[0]}`
          )
        );
      } else if (query.includes('over') || query.includes('above') || query.includes('>')) {
        conditions.push(
          and(
            isNotNull(communities.rentPerMonth),
            sql`${communities.rentPerMonth} > ${prices[0]}`
          )
        );
      } else if (prices.length === 2) {
        const [min, max] = [Math.min(...prices), Math.max(...prices)];
        conditions.push(
          and(
            isNotNull(communities.rentPerMonth),
            sql`${communities.rentPerMonth} BETWEEN ${min} AND ${max}`
          )
        );
      }
    }
    
    // Handle qualitative terms
    if (query.includes('cheap') || query.includes('affordable')) {
      console.log('Affordable filtering: showing communities under $4000/month (where pricing is available)');
      conditions.push(
        and(
          isNotNull(communities.rentPerMonth),
          sql`${communities.rentPerMonth} > 0`,
          sql`${communities.rentPerMonth} < 4000`
        )
      );
    } else if (query.includes('expensive') || query.includes('luxury') || query.includes('premium')) {
      console.log('Luxury filtering: showing communities over $7000/month (where pricing is available)');
      conditions.push(
        and(
          isNotNull(communities.rentPerMonth),
          sql`${communities.rentPerMonth} > 7000`
        )
      );
    }
    
    return conditions;
  }
  
  private async buildCareTypeConditions(query: string): Promise<any[]> {
    const conditions: any[] = [];
    const careTypeMap = {
      'memory care': 'Memory Care',
      'alzheimer': 'Memory Care', 
      'dementia': 'Memory Care',
      'assisted living': 'Assisted Living',
      'independent living': 'Independent Living',
      'nursing home': 'Skilled Nursing',
      'skilled nursing': 'Skilled Nursing',
      'rehabilitation': 'Rehabilitation',
      'therapy': 'Rehabilitation'
    };
    
    // Find all matching care types (allow multiple)
    const matchedCareTypes: string[] = [];
    for (const [keyword, careType] of Object.entries(careTypeMap)) {
      if (query.includes(keyword)) {
        matchedCareTypes.push(careType);
      }
    }
    
    if (matchedCareTypes.length > 0) {
      console.log(`Care type filtering: ${matchedCareTypes.join(', ')}`);
      
      // Use correct column name: careTypes (camelCase, not snake_case)
      const careTypeConditions = matchedCareTypes.map(careType => 
        sql`${communities.careTypes}::text ILIKE '%' || ${careType} || '%'`
      );
      
      conditions.push(or(...careTypeConditions));
    }
    
    return conditions;
  }
  
  private async buildNaturalLanguageConditions(query: string): Promise<any[]> {
    const conditions: any[] = [];
    
    // Extract entities from natural language
    if (query.includes('best') || query.includes('top') || query.includes('quality')) {
      conditions.push(gte(communities.rating, 4.0));
    }
    
    if (query.includes('luxury') || query.includes('upscale')) {
      conditions.push(gte(sql`CAST(REPLACE(${communities.rentPerMonth}, '$', '') AS INTEGER)`, 4000));
    }
    
    // Look for location mentions within natural language
    const locationMatch = query.match(/(?:in|near|around)\s+([a-zA-Z\s,]+)/);
    if (locationMatch) {
      const location = locationMatch[1].trim();
      conditions.push(
        or(
          ilike(communities.city, `%${location}%`),
          ilike(communities.state, `%${location}%`)
        )
      );
    }
    
    return conditions;
  }
  
  private applyFilters(conditions: any[], filters: SearchFilters) {
    if (filters.state) {
      conditions.push(eq(communities.state, filters.state));
    }
    
    if (filters.city) {
      conditions.push(eq(communities.city, filters.city));
    }
    
    if (filters.careTypes?.length) {
      conditions.push(
        or(...filters.careTypes.map(type =>
          sql`${communities.careTypes}::text[] && ARRAY[${type}]::text[]`
        ))
      );
    }
    
    // Apply basic price filtering
    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      console.log(`Price range filtering requested: ${filters.priceMin}-${filters.priceMax}, applying basic filter`);
      conditions.push(sql`${communities.rentPerMonth} IS NOT NULL`);
    }
    
    if (filters.rating !== undefined) {
      conditions.push(gte(communities.rating, filters.rating));
    }
  }
  
  private applySorting(query: any, searchType: string, searchQuery: string) {
    // Normalize the search query for comparison
    const normalizedSearch = searchQuery?.toLowerCase().trim() || '';
    
    // Enhanced sorting that prioritizes exact and prefix matches
    if (normalizedSearch && searchType !== 'price') {
      // Add relevance scoring based on how well the name matches the search
      return query.orderBy(sql`
        CASE 
          -- Exact match (highest priority)
          WHEN LOWER(${communities.name}) = LOWER(${normalizedSearch}) THEN 1
          -- Starts with exact query (very high priority)
          WHEN LOWER(${communities.name}) LIKE LOWER(${normalizedSearch}) || '%' THEN 2
          -- Contains the query as a whole word (high priority)
          WHEN LOWER(${communities.name}) LIKE '% ' || LOWER(${normalizedSearch}) || '%' THEN 3
          -- Contains the query anywhere (medium priority)
          WHEN LOWER(${communities.name}) LIKE '%' || LOWER(${normalizedSearch}) || '%' THEN 4
          -- Everything else (low priority)
          ELSE 5
        END,
        -- Secondary sort by rating
        ${communities.rating} DESC NULLS LAST,
        -- Tertiary sort by name length (shorter names usually more relevant)
        LENGTH(${communities.name}) ASC,
        -- Final sort alphabetically
        ${communities.name} ASC
      `);
    }
    
    // Default sorting for specific search types
    switch (searchType) {
      case 'price':
        // Order by price when price search is detected (numeric column)
        return query.orderBy(sql`COALESCE(${communities.rentPerMonth}, 999999) ASC`);
      case 'company':
        return query.orderBy(sql`
          CASE 
            WHEN LOWER(${communities.name}) LIKE LOWER(${normalizedSearch}) || '%' THEN 1
            WHEN LOWER(${communities.managementCompany}) LIKE LOWER(${normalizedSearch}) || '%' THEN 2
            ELSE 3
          END,
          ${communities.name} ASC
        `);
      case 'location':
        return query.orderBy(desc(communities.rating), asc(communities.city));
      case 'careType':
        return query.orderBy(desc(communities.rating));
      default:
        return query.orderBy(desc(communities.rating), asc(communities.name));
    }
  }
  
  private async buildFacets(conditions: any[]) {
    // Build facets for filtering UI
    let baseQuery = db.select().from(communities);
    if (conditions.length > 0) {
      baseQuery = baseQuery.where(and(...conditions));
    }
    
    // Get state facets
    const states = await db
      .select({ state: communities.state, count: sql`count(*)` })
      .from(communities)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(communities.state)
      .orderBy(desc(sql`count(*)`))
      .limit(10);
    
    return {
      states: states.map(s => ({ name: s.state, count: parseInt(s.count.toString()) })),
      careTypes: [], // TODO: Implement
      priceRanges: [], // TODO: Implement  
      ratings: [] // TODO: Implement
    };
  }
  
  private async generateSuggestions(query: string, searchType: string): Promise<string[]> {
    const suggestions: string[] = [];
    
    if (searchType === 'location') {
      // Enhanced geographic suggestions
      suggestions.push(
        `${query} assisted living`,
        `${query} memory care`,
        `best senior living in ${query}`,
        `${query} under $5000`,
        `affordable communities in ${query}`
      );
    } else if (searchType === 'company') {
      suggestions.push(
        `${query} locations`,
        `${query} pricing`,
        `${query} reviews`,
        `${query} near me`
      );
    } else if (searchType === 'price') {
      suggestions.push(
        `under $3000`,
        `under $5000`,
        `affordable senior living`,
        `luxury communities`
      );
    } else {
      // Generic suggestions for unknown search types
      suggestions.push(
        `${query} near me`,
        `best ${query}`,
        `affordable ${query}`
      );
    }
    
    return suggestions;
  }
  
  // Check if the query is healthcare-related
  private async isHealthcareSearch(query: string): Promise<boolean> {
    const healthcareKeywords = [
      'hospital', 'hospitals', 'medical', 'clinic', 'urgent care', 
      'therapy', 'therapist', 'physical therapy', 'occupational therapy',
      'speech therapy', 'adult day', 'respite', 'home care', 'home health',
      'personal care', 'emergency', 'surgery', 'diagnostic', 'radiology',
      'cardiology', 'neurology', 'oncology', 'pediatric', 'maternity',
      'trauma', 'rehabilitation', 'rehab', 'hospice', 'palliative',
      'dialysis', 'infusion', 'wound care', 'pain management',
      'mental health', 'behavioral health', 'psychiatric', 'counseling',
      'pharmacy', 'laboratory', 'lab', 'imaging', 'x-ray', 'mri', 'ct scan',
      'specialist', 'primary care', 'doctor', 'physician', 'nurse',
      'healthcare', 'health care', 'medical center', 'health center',
      'community health', 'wellness', 'preventive care', 'screening',
      'vaccine', 'immunization', 'testing', 'diagnosis', 'treatment',
      // Additional healthcare services
      'dental', 'dentist', 'dentistry', 'orthodontic', 'oral',
      'vision', 'eye', 'optometry', 'optometrist', 'ophthalmology', 'optical',
      'hearing', 'audiology', 'audiologist', 'ear',
      'podiatry', 'podiatrist', 'foot', 'chiropractor', 'chiropractic',
      'acupuncture', 'nutritionist', 'dietitian', 'nutrition',
      'substance abuse', 'addiction', 'detox', 'recovery',
      'outpatient', 'inpatient', 'ambulatory', 'telemedicine', 'telehealth'
    ];
    
    const lowerQuery = query.toLowerCase();
    return healthcareKeywords.some(keyword => lowerQuery.includes(keyword));
  }
  
  // Search healthcare services
  private async searchHealthcareServices(query: string, limit: number, offset: number): Promise<{
    services: any[];
    facets: { name: string; count: number }[];
  }> {
    try {
      const lowerQuery = query.toLowerCase();
      
      // Search healthcare service types
      const searchQuery = db
        .select()
        .from(healthcareServiceTypes)
        .where(
          or(
            ilike(healthcareServiceTypes.name, `%${lowerQuery}%`),
            ilike(healthcareServiceTypes.displayName, `%${lowerQuery}%`),
            ilike(healthcareServiceTypes.serviceType, `%${lowerQuery}%`)
          )
        )
        .orderBy(desc(healthcareServiceTypes.count))
        .limit(limit)
        .offset(offset);
      
      const services = await searchQuery;
      
      // Build facets from results
      const facets = services
        .filter(s => s.count > 0)
        .map(s => ({
          name: s.displayName,
          count: s.count
        }))
        .slice(0, 10); // Top 10 facets
      
      return { services, facets };
    } catch (error) {
      console.error('Healthcare services search error:', error);
      return { services: [], facets: [] };
    }
  }
  
  // Add dedicated suggestions method for the suggestions endpoint
  async generateSearchSuggestions(query: string): Promise<string[]> {
    const normalizedQuery = query.toLowerCase().trim();
    const suggestions: string[] = [];
    
    // Provide suggestions even for single character (more responsive predictive text)
    if (normalizedQuery.length < 1) {
      return [];
    }
    
    // Check for international query patterns
    const isInternational = this.detectInternationalQuery(normalizedQuery);
    
    if (isInternational) {
      // For international queries, provide smart suggestions
      return this.generateInternationalSuggestions(normalizedQuery);
    }
    
    try {
      // Enhanced fuzzy matching for typos and variations
      const fuzzyQuery = this.generateFuzzyVariations(normalizedQuery);
      
      // 1. Search for actual community names (highest priority)
      // Include fuzzy matching for better typo tolerance
      const communityNameConditions = [
        ilike(communities.name, `${normalizedQuery}%`),  // Exact prefix match
        ilike(communities.name, `%${normalizedQuery}%`), // Contains
      ];
      
      // Add fuzzy variations for typo tolerance
      fuzzyQuery.forEach(variant => {
        communityNameConditions.push(ilike(communities.name, `%${variant}%`));
      });
      
      const communityNameResults = await db
        .select({
          name: communities.name,
          city: communities.city,
          state: communities.state
        })
        .from(communities)
        .where(or(...communityNameConditions))
        .orderBy(sql`
          CASE 
            WHEN LOWER(${communities.name}) LIKE LOWER(${normalizedQuery}) || '%' THEN 1
            WHEN LOWER(${communities.name}) LIKE '%' || LOWER(${normalizedQuery}) || '%' THEN 2
            ELSE 3
          END,
          LENGTH(${communities.name})
        `)
        .limit(8);
      
      // Add community names to suggestions with location context
      communityNameResults.forEach(community => {
        const fullName = community.city && community.state 
          ? `${community.name} - ${community.city}, ${community.state}`
          : community.name;
        if (!suggestions.includes(fullName) && !suggestions.includes(community.name)) {
          suggestions.push(fullName);
        }
      });
      
      // 2. Enhanced city search with fuzzy matching
      const cityConditions = [
        ilike(communities.city, `${normalizedQuery}%`),  // Starts with
        ilike(communities.city, `%${normalizedQuery}%`), // Contains
      ];
      
      // Add fuzzy variations for cities
      fuzzyQuery.forEach(variant => {
        cityConditions.push(ilike(communities.city, `%${variant}%`));
      });
      
      const cityResults = await db
        .select({
          city: communities.city,
          state: communities.state,
          count: sql<number>`COUNT(*)::int`.as('count')
        })
        .from(communities)
        .where(or(...cityConditions))
        .groupBy(communities.city, communities.state)
        .having(sql`COUNT(*) > 0`)
        .orderBy(desc(sql`COUNT(*)`))
        .limit(5);
      
      // Add city suggestions
      cityResults.forEach(location => {
        const cityStateSuggestion = `${location.city}, ${location.state}`;
        if (!suggestions.includes(cityStateSuggestion)) {
          suggestions.push(cityStateSuggestion);
        }
      });
      
      // 3. Enhanced state search with abbreviation support
      if (normalizedQuery.length >= 1) {
        // Map common state abbreviations and names
        const stateMapping = this.getStateMapping();
        const matchedStates = Object.entries(stateMapping)
          .filter(([name, abbr]) => 
            name.toLowerCase().includes(normalizedQuery) || 
            abbr.toLowerCase().includes(normalizedQuery)
          )
          .map(([name, abbr]) => abbr);
        
        const stateConditions = [
          ilike(communities.state, `${normalizedQuery}%`),
          ilike(communities.state, `%${normalizedQuery}%`),
          ...matchedStates.map(state => eq(communities.state, state))
        ];
        
        const stateResults = await db
          .select({
            state: communities.state,
            count: sql<number>`COUNT(*)::int`.as('count')
          })
          .from(communities)
          .where(or(...stateConditions))
          .groupBy(communities.state)
          .having(sql`COUNT(*) > 0`)
          .orderBy(desc(sql`COUNT(*)`))
          .limit(3);
        
        stateResults.forEach(state => {
          if (!suggestions.includes(state.state)) {
            suggestions.push(state.state);
          }
        });
      }
      
      // 4. Enhanced company search with fuzzy matching
      const companyConditions = [
        ilike(communities.managementCompany, `${normalizedQuery}%`),  // Starts with
        ilike(communities.managementCompany, `%${normalizedQuery}%`), // Contains
      ];
      
      // Add fuzzy variations for companies
      fuzzyQuery.forEach(variant => {
        companyConditions.push(ilike(communities.managementCompany, `%${variant}%`));
      });
      
      const companyResults = await db
        .select({
          managementCompany: communities.managementCompany,
          count: sql<number>`COUNT(*)::int`.as('count')
        })
        .from(communities)
        .where(
          and(
            or(...companyConditions),
            sql`${communities.managementCompany} IS NOT NULL`,
            sql`${communities.managementCompany} != ''`
          )
        )
        .groupBy(communities.managementCompany)
        .orderBy(desc(sql`COUNT(*)`))
        .limit(3);
      
      companyResults.forEach(company => {
        if (company.managementCompany && !suggestions.includes(company.managementCompany)) {
          suggestions.push(company.managementCompany);
        }
      });
      
    } catch (error) {
      console.error('Database suggestion error:', error);
      // Return smart fallback suggestions if database fails
      const fallbackSuggestions = [];
      if (query.length > 2) {
        fallbackSuggestions.push(
          `${query} senior living`,
          `${query} assisted living`,
          `senior living near ${query}`,
          `memory care ${query}`,
          `${query} retirement communities`
        );
      }
      return fallbackSuggestions.slice(0, 5);
    }
    
    // Remove duplicates and limit to 10 suggestions for better predictive text
    return [...new Set(suggestions)].slice(0, 10);
  }
  
  // Generate fuzzy variations for typo tolerance
  private generateFuzzyVariations(query: string): string[] {
    const variations: string[] = [];
    
    // Skip very short queries
    if (query.length < 3) {
      return variations;
    }
    
    // Common typo patterns
    const typoPatterns = [
      // Double letters (brookdale -> brokdale)
      query.replace(/(.)\1/g, '$1'),
      // Missing letters (atlanta -> atlnta)
      query.substring(0, query.length - 1),
      // Swapped adjacent letters (atlanta -> atlnata)
      query.length > 2 ? query.substring(0, query.length - 2) + query[query.length - 1] + query[query.length - 2] : query,
    ];
    
    // Add common phonetic variations
    const phoneticReplacements = [
      { from: 'ph', to: 'f' },
      { from: 'f', to: 'ph' },
      { from: 'k', to: 'c' },
      { from: 'c', to: 'k' },
      { from: 's', to: 'c' },
      { from: 'z', to: 's' },
    ];
    
    phoneticReplacements.forEach(({ from, to }) => {
      if (query.includes(from)) {
        variations.push(query.replace(from, to));
      }
    });
    
    // Add typo patterns
    typoPatterns.forEach(pattern => {
      if (pattern && pattern !== query && pattern.length > 0) {
        variations.push(pattern);
      }
    });
    
    return [...new Set(variations)].slice(0, 3); // Limit variations
  }
  
  // Get state name to abbreviation mapping
  private getStateMapping(): Record<string, string> {
    return {
      'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR',
      'california': 'CA', 'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE',
      'florida': 'FL', 'georgia': 'GA', 'hawaii': 'HI', 'idaho': 'ID',
      'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA', 'kansas': 'KS',
      'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
      'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS',
      'missouri': 'MO', 'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV',
      'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY',
      'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH', 'oklahoma': 'OK',
      'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
      'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT',
      'vermont': 'VT', 'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV',
      'wisconsin': 'WI', 'wyoming': 'WY', 'district of columbia': 'DC'
    };
  }
  
  // Detect if query contains international location
  private detectInternationalQuery(query: string): boolean {
    const internationalPatterns = [
      // Countries
      /\b(mexico|canada|uk|united kingdom|england|france|spain|italy|germany|japan|china|australia|brazil|russia|india|dubai|uae|thailand|singapore|philippines|indonesia|malaysia|vietnam|korea|taiwan|israel|turkey|greece|portugal|netherlands|belgium|switzerland|austria|sweden|norway|denmark|finland|poland|czech|romania|hungary|croatia|serbia|bulgaria|ukraine|belarus|latvia|lithuania|estonia|iceland|ireland|scotland|wales)\b/i,
      // International cities
      /\b(cancun|playa del carmen|puerto vallarta|cabo|tijuana|toronto|vancouver|montreal|calgary|ottawa|london|paris|barcelona|madrid|rome|milan|berlin|munich|tokyo|osaka|kyoto|beijing|shanghai|sydney|melbourne|brisbane|auckland|dubai|abu dhabi|bangkok|singapore|manila|jakarta|kuala lumpur|hanoi|seoul|taipei|tel aviv|istanbul|athens|lisbon|amsterdam|brussels|zurich|vienna|stockholm|oslo|copenhagen|helsinki|warsaw|prague|bucharest|budapest|zagreb|belgrade|sofia|kiev|minsk|riga|vilnius|tallinn|reykjavik|dublin|edinburgh|cardiff)\b/i,
      // Common international phrases
      /\b(outside us|outside usa|outside united states|international|abroad|overseas|expat|emigrate)\b/i
    ];
    
    return internationalPatterns.some(pattern => pattern.test(query));
  }
  
  // Generate suggestions for international queries
  private generateInternationalSuggestions(query: string): string[] {
    const suggestions: string[] = [];
    
    // Parse city and country if present
    const parts = query.split(',').map(p => p.trim());
    const city = parts[0];
    const country = parts[1];
    
    if (country) {
      // If country is specified, provide targeted suggestions
      suggestions.push(
        `${city}, ${country} senior living`,
        `retirement communities in ${city}, ${country}`,
        `expat retirement ${city}`,
        `${country} senior care options`,
        `international retirement ${city}`
      );
    } else {
      // Generic international suggestions
      suggestions.push(
        `${query} senior living`,
        `${query} retirement communities`,
        `${query} expat communities`,
        `international senior living ${query}`,
        `retire abroad ${query}`
      );
    }
    
    // Add Discovery Mode hint
    suggestions.push('🌍 Try Discovery Mode for worldwide search');
    
    return suggestions.slice(0, 10);
  }

  // Parse Discovery Mode AI results into community objects
  private parseDiscoveryModeResults(summary: string, originalQuery: string): any[] {
    const communities: any[] = [];
    
    try {
      // Split the summary into sections for each community
      const lines = summary.split('\n');
      let currentCommunity: any = null;
      let currentSection = '';
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Check for community names (usually in bold or starting with a dash/bullet)
        if (trimmedLine.match(/^[-•]\s*(.+?)(?:\s*[-–:]|$)/) || 
            trimmedLine.match(/^\*\*(.+?)\*\*/) ||
            trimmedLine.match(/^(\d+\.\s)?([A-Z][A-Za-z\s]+(?:Manor|Village|Living|Care|Residence|Estate|Home|Center|Community|Place))(?:\s*[-–:]|$)/)) {
          
          // Save previous community if exists
          if (currentCommunity && currentCommunity.name) {
            communities.push(currentCommunity);
          }
          
          // Extract community name
          let name = trimmedLine
            .replace(/^[-•]\s*/, '')
            .replace(/^\*\*(.+?)\*\*.*/, '$1')
            .replace(/^\d+\.\s/, '')
            .replace(/\s*[-–:].*/, '')
            .trim();
          
          // Create new community object
          currentCommunity = {
            id: `discovery-${Date.now()}-${communities.length}`,
            name: name,
            city: '',
            state: '',
            address: '',
            description: '',
            care_type_provided: [],
            phone: '',
            website: '',
            isDiscovered: true,
            discoverySource: 'AI Discovery Mode',
            pricing_information: 'Contact for pricing'
          };
        }
        
        // Parse address and location
        if (currentCommunity && trimmedLine.match(/\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Place|Pl|Court|Ct)/i)) {
          currentCommunity.address = trimmedLine.replace(/[-–].*/, '').trim();
          
          // Extract city and state from address if present
          const addressMatch = trimmedLine.match(/,\s*([A-Za-z\s]+),\s*([A-Z]{2})\s*\d{5}/);
          if (addressMatch) {
            currentCommunity.city = addressMatch[1].trim();
            currentCommunity.state = addressMatch[2].trim();
          }
        }
        
        // Parse phone number
        if (currentCommunity && trimmedLine.match(/Phone:|Tel:|Call:/i)) {
          const phoneMatch = trimmedLine.match(/(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/);
          if (phoneMatch) {
            currentCommunity.phone = phoneMatch[1];
          }
        }
        
        // Parse care types
        if (currentCommunity && (trimmedLine.match(/Care Levels:|Services:|Care Types:|Offers:/i) || 
            trimmedLine.match(/(Independent Living|Assisted Living|Memory Care|Nursing|Skilled Nursing)/i))) {
          const careTypes = [];
          if (trimmedLine.match(/Independent Living/i)) careTypes.push('Independent Living');
          if (trimmedLine.match(/Assisted Living/i)) careTypes.push('Assisted Living');
          if (trimmedLine.match(/Memory Care/i)) careTypes.push('Memory Care');
          if (trimmedLine.match(/Nursing|Skilled Nursing/i)) careTypes.push('Skilled Nursing');
          
          if (careTypes.length > 0) {
            currentCommunity.care_type_provided = [...new Set([...currentCommunity.care_type_provided, ...careTypes])];
          }
        }
        
        // Parse pricing if mentioned
        if (currentCommunity && trimmedLine.match(/\$[\d,]+|Pricing:|Rates:|Cost:/i)) {
          const priceMatch = trimmedLine.match(/\$[\d,]+/);
          if (priceMatch) {
            currentCommunity.pricing_information = trimmedLine;
          }
        }
        
        // Collect description text
        if (currentCommunity && trimmedLine && !trimmedLine.match(/^[-•*]|\*\*|Phone:|Address:|Pricing:|Care Levels:/)) {
          currentCommunity.description += (currentCommunity.description ? ' ' : '') + trimmedLine;
        }
      }
      
      // Save last community
      if (currentCommunity && currentCommunity.name) {
        communities.push(currentCommunity);
      }
      
      // If no structured parsing worked, try to extract any mentioned community names
      if (communities.length === 0) {
        const namePatterns = [
          /([A-Z][A-Za-z\s]+(?:Manor|Village|Living|Care|Residence|Estate|Home|Center|Community|Place))/g,
          /\*\*([^*]+)\*\*/g
        ];
        
        for (const pattern of namePatterns) {
          const matches = summary.matchAll(pattern);
          for (const match of matches) {
            const name = match[1].trim();
            if (name && name.length > 3 && !communities.some(c => c.name === name)) {
              communities.push({
                id: `discovery-${Date.now()}-${communities.length}`,
                name: name,
                city: originalQuery.includes(',') ? originalQuery.split(',')[0].trim() : '',
                state: originalQuery.includes(',') && originalQuery.split(',')[1] ? originalQuery.split(',')[1].trim() : '',
                address: '',
                description: `Discovered through AI search for "${originalQuery}"`,
                care_type_provided: ['Senior Living'],
                phone: '',
                website: '',
                isDiscovered: true,
                discoverySource: 'AI Discovery Mode',
                pricing_information: 'Contact for pricing'
              });
            }
          }
        }
      }
      
      console.log(`📋 Parsed ${communities.length} communities from Discovery Mode response`);
      return communities;
    } catch (error) {
      console.error('Error parsing Discovery Mode results:', error);
      return [];
    }
  }
}

export const comprehensiveSearchEngine = new ComprehensiveSearchEngine();
/**
 * COMPREHENSIVE SEARCH ENGINE - Zillow-level Search Capability
 * Handles ALL search types: natural language, locations, companies, prices, care types
 */

import { db } from '../db';
import { communities, healthcareServiceTypes } from '@shared/schema';
import { eq, and, or, ilike, gte, lte, sql, desc, asc, isNotNull, not } from 'drizzle-orm';

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
  
  async search(query: string, filters: SearchFilters = {}, options: { limit?: number; offset?: number; discover?: boolean } = {}): Promise<SearchResult> {
    const startTime = Date.now();
    const { limit = 100, offset = 0, discover: forceDiscovery = false } = options;
    
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
    

    // CRITICAL: Only show active communities (excludes contaminated/fake entries)
    // All fake entries have been marked as is_active = false in the database
    const activeFilter = sql`is_active = true`;
    
    // Add active filter to existing conditions
    conditions.push(activeFilter);
    
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
    
    // DISCOVERY MODE: Self-healing Perplexity discovery (decided below once we
    // know whether this is a location query with no real local matches).
    let discoveryMode = false;
    let discoveryMessage = '';
    let aiSuggestions: any = null;
    
    // Build facets for filtering
    const facets = await this.buildFacets(conditions);
    
    // Generate search suggestions
    const suggestions = await this.generateSuggestions(query, searchType);
    
    // Get intent scores for metadata
    const normalizedQuery = query ? query.toLowerCase().trim() : '';
    const intentScores = normalizedQuery ? await this.calculateIntentScores(normalizedQuery) : null;

    // LOCATION-SCOPED DISCOVERY: decide whether this query targets a place and
    // whether the DB actually has communities IN that place. This decouples the
    // discovery trigger from the global zero-count (which almost never happens).
    const isLocationStyleQuery = !!normalizedQuery && this.isLocationStyleQuery(query, intentScores);
    let locationHasNoRealMatches = false;
    if (isLocationStyleQuery) {
      try {
        const locationOnly = this.extractLocationString(query).toLowerCase();
        const locConds = await this.buildLocationConditions(locationOnly);
        if (locConds.length > 0) {
          const locWhere = locConds.length > 1 ? or(...locConds) : locConds[0];
          const [{ count: locCount }] = await db
            .select({ count: sql`count(*)` })
            .from(communities)
            .where(and(locWhere, sql`is_active = true`));
          locationHasNoRealMatches = parseInt(locCount.toString()) === 0;
        } else {
          locationHasNoRealMatches = true;
        }
      } catch (e) {
        console.warn('⚠️ Location-scoped match count failed:', e);
      }
    }

    // Decide whether to run self-healing Perplexity discovery.
    // Cost control: auto-discovery ONLY when a location query has no real local
    // match (or zero total results); the explicit `discover` flag forces it.
    const shouldDiscover = !!normalizedQuery && (
      forceDiscovery ||
      (isLocationStyleQuery && (totalResults === 0 || locationHasNoRealMatches))
    );

    // If this is a healthcare search, also get healthcare services
    let healthcareServices: any[] | undefined;
    let healthcareTypeFacets: { name: string; count: number }[] | undefined;
    
    if (isHealthcareSearch) {
      const healthcareResults = await this.searchHealthcareServices(query, limit, offset);
      healthcareServices = healthcareResults.services;
      healthcareTypeFacets = healthcareResults.facets;
    }
    
    // SELF-HEALING DISCOVERY: Perplexity (sonar). Golden Data Rule compliant —
    // real, sourced, labeled `ai_discovered_perplexity`, never synthetic.
    if (shouldDiscover) {
      discoveryMode = true;
      try {
        const { perplexitySearchAPI } = await import('./perplexity-search-api');
        const { discoveredCommunityService } = await import('./discovered-community-service');

        // Resolve a clean location + optional care type for the discovery prompt
        let discoveryLocation = this.extractLocationString(query);
        if (filters.city) {
          discoveryLocation = filters.state ? `${filters.city}, ${filters.state}` : filters.city;
        }

        const careTypeHint = (filters.careTypes && filters.careTypes.length > 0)
          ? filters.careTypes[0]
          : (intentScores && intentScores.careType > 0.3 ? this.extractCareTypeHint(normalizedQuery) : undefined);

        console.log(`🔮 Self-healing Perplexity discovery for "${discoveryLocation}"${careTypeHint ? ` (${careTypeHint})` : ''}`);
        const discovery = await perplexitySearchAPI.discoverCommunities(discoveryLocation, {
          careType: careTypeHint,
          limit: 15,
        });

        const discovered = discovery.communities || [];

        if (discovered.length > 0) {
          // Format discovered communities to match the existing response shape
          const formattedDiscovered = discovered.map((d, idx) => ({
            id: -(idx + 1), // Negative IDs indicate discovered (not in DB)
            name: d.name,
            address: d.address || '',
            city: d.city || filters.city || '',
            state: d.state || filters.state || '',
            country: 'US',
            phone: d.phone || null,
            website: d.website || null,
            description: `Senior living community discovered via Perplexity AI for ${discoveryLocation}. Contact the community to verify current pricing and availability.`,
            careTypes: d.careTypes && d.careTypes.length > 0 ? d.careTypes : ['Senior Living'],
            photos: [],
            latitude: null,
            longitude: null,
            isVerified: false,
            isActive: true,
            data_source: 'ai_discovered_perplexity',
            isDiscovered: true,
            confidence: d.confidence
          }));

          // Surface discovered communities alongside any real DB matches
          results = [...results, ...formattedDiscovered];
          totalResults = results.length;

          aiSuggestions = {
            summary: `Found ${discovered.length} senior living ${discovered.length === 1 ? 'community' : 'communities'} via Perplexity AI for ${discoveryLocation}.`,
            sources: discovery.sources || [],
            images: []
          };
          discoveryMessage = `🔮 Discovery Mode: We searched the web with Perplexity AI and found ${discovered.length} senior living ${discovered.length === 1 ? 'community' : 'communities'} for "${discoveryLocation}". These are newly discovered — contact each community to verify current pricing and availability.`;

          // Persist so future searches self-heal from the DB (labeled
          // ai_discovered_perplexity; pricing only added once verified).
          try {
            await discoveredCommunityService.saveDiscoveredCommunities(
              discovered.map(d => ({
                name: d.name,
                address: d.address,
                city: d.city || filters.city,
                state: d.state || filters.state,
                phone: d.phone,
                website: d.website,
                careTypes: d.careTypes,
                discoverySource: 'perplexity',
              }))
            );
          } catch (saveErr) {
            console.error('⚠️ Failed to persist discovered communities:', saveErr);
          }

          console.log(`✨ Perplexity discovery added ${discovered.length} communities for "${discoveryLocation}"`);
        } else {
          aiSuggestions = {
            summary: `No additional senior living communities were found via Perplexity AI for "${discoveryLocation}".`,
            sources: discovery.sources || [],
            images: []
          };
          discoveryMessage = `🔮 Discovery Mode: We searched the web with Perplexity AI but did not find additional senior living communities for "${discoveryLocation}".`;
          console.log(`⚠️ Perplexity discovery found nothing for "${discoveryLocation}"`);
        }
      } catch (error) {
        console.error('Perplexity discovery error:', error);
        discoveryMessage = `🔮 Discovery Mode: We tried to search the web for new communities, but the discovery service is temporarily unavailable. Please try again shortly.`;
        aiSuggestions = aiSuggestions || { summary: '', sources: [], images: [] };
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
  
  /**
   * Decide whether a query targets a place (and is therefore a candidate for
   * self-healing location discovery). Community-name signals (dash, quotes,
   * distinctive name keywords) are explicitly NOT location-style.
   */
  private isLocationStyleQuery(query: string, intentScores: any): boolean {
    const q = query.trim();
    if (!q) return false;
    if (q.includes(' - ')) return false;            // "Name - City, ST" = community name
    if (/"/.test(q)) return false;                  // quoted = explicit name
    if (/\b(?:in|near|around)\s+\S/i.test(q)) return true;          // "... in <place>"
    if (/^[a-zA-Z\s.']+,\s*[a-zA-Z]{2,}$/i.test(q)) return true;    // "City, ST"
    if (/^\d{5}(-\d{4})?$/.test(q)) return true;                    // ZIP code
    if (intentScores && intentScores.location >= 0.3) return true;  // scored location

    // Bare 1-3 word place name with no name/care/price/company signal — treat as
    // an (unknown) town to search rather than a community name.
    const lower = q.toLowerCase();
    const words = q.split(/\s+/);
    if (words.length <= 3 && /^[a-zA-Z][a-zA-Z\s.']*$/.test(q)) {
      const nameSignals = ['manor', 'estates', 'village', 'residence', 'lodge', 'plaza', 'terrace', 'gardens', 'court', 'villa', 'oaks', 'pines', 'meadows', 'ridge', 'heights', 'grove', 'pointe', 'crossing', 'commons', 'towers', 'square'];
      const careOrGeneric = ['memory', 'care', 'assisted', 'nursing', 'independent', 'skilled', 'senior', 'living', 'retirement', 'hospice', 'respite', 'rehabilitation', 'dementia', 'alzheimer', 'community', 'facility', 'home', 'house'];
      const hasNameSignal = nameSignals.some(s => lower.includes(s));
      const hasCareOrGeneric = careOrGeneric.some(s => lower.includes(s));
      const hasOtherIntent = intentScores && (intentScores.careType >= 0.3 || intentScores.price >= 0.3 || intentScores.company >= 0.3);
      if (!hasNameSignal && !hasCareOrGeneric && !hasOtherIntent) return true;
    }
    return false;
  }

  /**
   * Extract the place portion of a query for location filtering / discovery.
   * Strips "in/near/around" prepositions and leading/embedded care-type and
   * generic senior-living words, leaving just the location (e.g.
   * "memory care in Bend, OR" → "bend, or"). Falls back to the trimmed query.
   */
  private extractLocationString(query: string): string {
    let q = query.trim();
    const prep = q.match(/\b(?:in|near|around)\s+(.+)$/i);
    if (prep) q = prep[1].trim();
    // Drop leading qualifiers ("best", "affordable", ...)
    q = q.replace(/^(?:the\s+)?(?:best|top|cheap|affordable|luxury|premium|nearby|local)\s+/i, '');
    // Remove care-type / generic senior-living phrases wherever they appear
    q = q.replace(/\b(?:memory care|assisted living|independent living|skilled nursing|nursing homes?|retirement communit(?:y|ies)|retirement homes?|senior living|senior care|senior housing|hospice care|respite care|rehabilitation|continuing care|care facilit(?:y|ies)|communit(?:y|ies)|facilit(?:y|ies))\b/gi, '');
    q = q.replace(/\s{2,}/g, ' ').replace(/^[\s,]+|[\s,]+$/g, '').trim();
    return q || query.trim();
  }

  /**
   * Map a query to a single care-type label to focus discovery prompts.
   */
  private extractCareTypeHint(query: string): string | undefined {
    const q = query.toLowerCase();
    if (/\b(memory care|alzheimer|dementia)\b/.test(q)) return 'memory care';
    if (/\bassisted living\b/.test(q)) return 'assisted living';
    if (/\bindependent living\b/.test(q)) return 'independent living';
    if (/\b(skilled nursing|nursing home)\b/.test(q)) return 'skilled nursing';
    if (/\bretirement\b/.test(q)) return 'retirement community';
    return undefined;
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
      // Community names often contain city names (e.g., "San Diego Senior Manor", "Redwood Lodge - Fremont, CA")
      // IMPORTANT: generic words ("senior", "living", "care", "home", "community",
      // "house", etc.) are intentionally EXCLUDED — phrases like "senior living in
      // <town>" are location searches, not community-name searches.
      const communityNameKeywords = [
        'manor', 'estates', 'village', 'residence', 'lodge', 'plaza', 'terrace',
        'gardens', 'court', 'villa', 'oaks', 'pines', 'meadows', 'ridge',
        'heights', 'grove', 'pointe', 'crossing', 'commons', 'towers', 'square'
      ];

      // "Name - City, State" and quoted text are explicit community-name signals.
      const dashPattern = normalizedQuery.includes(' - ');
      const hasQuotedName = /"/.test(query);
      // Strict "City, State" / "City, Country" pattern (no dash) is a location.
      const isCityStatePattern = !dashPattern && /^[a-zA-Z\s.']+,\s*[a-zA-Z]{2,}$/i.test(query.trim());
      const hasLocationPreposition = /\b(?:in|near|around)\s+\S/i.test(query);
      // Location intent wins over generic words: if the query is clearly a place,
      // do NOT treat it as a community name.
      const isLocationIntent = isCityStatePattern || hasLocationPreposition || intentScores.location >= 0.3;

      const looksLikeCommunityName = dashPattern || hasQuotedName || (
        !isLocationIntent && communityNameKeywords.some(keyword => normalizedQuery.includes(keyword))
      );
      
      // Apply conditions based on ALL detected intents (not just dominant)
      let isCountrySearch = false;
      
      // Only apply location search if it doesn't look like a community name
      if (intentScores.location >= 0.3 && !looksLikeCommunityName) {
        // Check if this is an international location query first
        const isInternational = this.detectInternationalQuery(normalizedQuery);
        
        // ALWAYS search location conditions, even for international queries
        // This will find communities in our database first before triggering Discovery Mode.
        // Use the extracted place portion so "senior living in <town>" / "memory
        // care in <town>" filter on the town, not the whole phrase.
        const locationOnly = this.extractLocationString(query).toLowerCase();
        const locationConditions = await this.buildLocationConditions(locationOnly);
        console.log(`🔍 Raw location conditions built: ${locationConditions.length} (location="${locationOnly}")`);
        
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
        
        if (isInternational) {
          console.log(`🌍 International location detected: ${normalizedQuery}`);
          searchType = 'international';
        }
        
        console.log(`🔍 After location: conditions.length=${conditions.length}, isCountrySearch=${isCountrySearch}`);
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
      
      // Check if query follows "Name - City, State" pattern
      let searchQuery = normalizedQuery;
      let extractedLocation = null;
      if (normalizedQuery.includes(' - ')) {
        const parts = normalizedQuery.split(' - ');
        searchQuery = parts[0].trim(); // Extract just the community name part
        extractedLocation = parts[1]?.trim(); // Extract the location part
        console.log(`🔍 Extracted community name: "${searchQuery}" from location format: "${normalizedQuery}"`);
      }
      
      // 1. Exact match (highest priority)
      nameConditions.push(ilike(communities.name, searchQuery));
      
      // 2. Starts with (high priority for partial searches)
      nameConditions.push(ilike(communities.name, `${searchQuery}%`));
      
      // 3. Contains (catches all partial matches)
      nameConditions.push(ilike(communities.name, `%${searchQuery}%`));
      
      // 4. Word boundary matching (for multi-word searches)
      const queryWords = searchQuery.split(/\s+/);
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
      
      // If we extracted a location, add it as an additional filter
      if (extractedLocation) {
        const locationParts = extractedLocation.split(',').map(part => part.trim());
        const cityName = locationParts[0];
        const stateName = locationParts[1];
        
        if (cityName) {
          nameConditions.push(
            and(
              ilike(communities.name, `%${searchQuery}%`),
              ilike(communities.city, `%${cityName}%`)
            )
          );
        }
        
        if (stateName) {
          nameConditions.push(
            and(
              ilike(communities.name, `%${searchQuery}%`),
              or(
                ilike(communities.state, stateName),
                ilike(communities.state, `%${stateName}%`)
              )
            )
          );
        }
      }
      
      // Check if we have name matches BEFORE applying other conditions
      const nameSearchCondition = or(...nameConditions);
      
      // PRIORITY: Only add name search if it looks like a community name or isn't clearly a location
      const hasCompanyConditions = intentScores.company > 0.3;
      const hasLocationConditions = intentScores.location >= 0.3 && !looksLikeCommunityName;
      
      // Only add name search if:
      // 1. It looks like a community name
      // 2. OR it's not clearly a location search
      // 3. OR no other conditions were added
      if (looksLikeCommunityName) {
        // This looks like a community name, prioritize name search
        conditions.push(
          or(
            nameSearchCondition,
            // Also search in management company as fallback
            ilike(communities.managementCompany, `%${normalizedQuery}%`)
          )
        );
        console.log(`🔍 Added PRIMARY name search for potential community: "${normalizedQuery}"`);
      } else if (!hasLocationConditions && !hasCompanyConditions && conditions.length === 0) {
        // No other clear intent and no conditions added, add name search as fallback
        conditions.push(nameSearchCondition);
        console.log(`🔍 Added fallback name search for "${normalizedQuery}"`);
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
      /^[a-zA-Z\s]+,\s*[A-Za-z]{2,}$/i,  // "Sacramento, CA" or "Toronto, Ontario" - City, State/Province
      /^\d{5}(-\d{4})?$/,              // ZIP codes
      /\b(in|near|around)\s+/,         // "memory care in Sacramento"
      /\b(city|state|county|zip)\b/,
      /\b(california|texas|florida|new york|illinois|ohio|pennsylvania|arizona|georgia|north carolina|michigan|new jersey|virginia|washington|massachusetts|indiana|tennessee|missouri|maryland|wisconsin|minnesota|colorado|alabama|south carolina|louisiana|kentucky|oregon|oklahoma|connecticut|iowa|mississippi|arkansas|utah|kansas|nevada|new mexico|nebraska|west virginia|idaho|hawaii|maine|new hampshire|rhode island|montana|delaware|south dakota|alaska|north dakota|vermont|wyoming)\b/i,  // State names
      /\b(sacramento|los angeles|san francisco|san diego|chicago|houston|phoenix|philadelphia|san antonio|dallas|san jose|austin|jacksonville|columbus|charlotte|detroit|el paso|memphis|seattle|denver|washington|boston|nashville|baltimore|oklahoma city|louisville|portland|las vegas|milwaukee|albuquerque|tucson|fresno|mesa|atlanta|kansas city|colorado springs|miami|raleigh|omaha|long beach|virginia beach|oakland|minneapolis|tulsa|arlington|tampa|new orleans)\b/i,  // Major cities
      // Country names - CRITICAL for international search
      /\b(australia|canada|mexico|united kingdom|uk|france|germany|spain|italy|japan|china|india|brazil|russia|singapore|new zealand|ireland|netherlands|belgium|switzerland|sweden|norway|denmark|finland|poland|greece|turkey|portugal|israel|dubai|egypt|south africa|argentina|chile|peru|colombia)\b/i
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
    // Postal codes (ZIP, postcodes, etc.) - Must contain at least one digit
    else if (query.match(/^\d{5}(-\d{4})?$/) || (query.match(/\d/) && query.match(/^[\d\w\s-]+$/) && query.length >= 3 && query.length <= 10)) {
      conditions.push(
        ilike(communities.zipCode, `%${query}%`)
      );
      console.log(`🌍 Added global postal code search for "${query}"`);
    }
    // General location - could be city, state, or country anywhere in the world
    else {
      const queryLower = query.toLowerCase().trim();
      
      // Check if it's a known country - search both the code AND full country name
      const countryCode = (COUNTRY_CODES as any)[queryLower];
      if (countryCode || queryLower === 'australia' || queryLower === 'canada' || queryLower === 'mexico') {
        // Search for both the country code AND the full country name
        conditions.push(
          or(
            eq(communities.country, countryCode),
            ilike(communities.country, `%${query}%`),
            ilike(communities.state, `%${query}%`), // Some countries might be stored in state field
            ilike(communities.city, `%${query}%`)   // Or search in cities of that country
          )
        );
        console.log(`🌍 Added country search for "${query}" - searching all location fields`);
        (conditions as any).__isCountrySearch = true;
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
        .where(and(
          sql`${communities.isActive} = true`,
          sql`(${communities.isHidden} IS NULL OR ${communities.isHidden} = false)`,
          or(...communityNameConditions)
        ))
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
        .where(and(
          sql`${communities.isActive} = true`,
          sql`(${communities.isHidden} IS NULL OR ${communities.isHidden} = false)`,
          or(...cityConditions)
        ))
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
          .where(and(
            sql`${communities.isActive} = true`,
            sql`(${communities.isHidden} IS NULL OR ${communities.isHidden} = false)`,
            or(...stateConditions)
          ))
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
            sql`${communities.isActive} = true`,
            sql`(${communities.isHidden} IS NULL OR ${communities.isHidden} = false)`,
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
}

export const comprehensiveSearchEngine = new ComprehensiveSearchEngine();
/**
 * COMPREHENSIVE SEARCH ENGINE - Zillow-level Search Capability
 * Handles ALL search types: natural language, locations, companies, prices, care types
 */

import { db } from '../db';
import { communities, healthcareServiceTypes } from '@shared/schema';
import { eq, and, or, ilike, gte, lte, sql, desc, asc, isNotNull, not } from 'drizzle-orm';
import { MultiAIOrchestrator } from '../multi-ai-orchestrator';

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
    aiConsensus?: { // Multi-AI consensus data
      insights: string[];
      recommendations: string[];
      warnings: string[];
      pricing?: {
        average: number;
        range: { min: number; max: number };
        confidence: number;
        sources: string[];
      };
    };
    aiSources?: { // Which AIs contributed
      perplexity?: boolean;
      claude?: boolean;
      grok?: boolean;
      gemini?: boolean;
      deepseek?: boolean;
      totalResponding: number;
    };
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
    searchQuery = this.applySorting(searchQuery as any, searchType, query);
    
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
    let totalResults = Number(count) || 0;
    
    // DISCOVERY MODE: Use AI only when NO results are found
    let discoveryMode = false;
    let discoveryMessage = '';
    let aiSuggestions: any = null;
    
    // Activate Discovery Mode ONLY when we have ZERO results
    // Don't trigger for valid searches that found 1-2 specific communities
    if (totalResults === 0 && query && query.trim() !== '') {
      console.log(`🔍 Activating Discovery Mode for query: "${query}" (no results found)`);
      discoveryMode = true;
      
      // Only keep the existing database results - don't add random locations
      // AI suggestions will be provided separately
      
      if (totalResults === 0) {
        discoveryMessage = "🔮 Discovery Mode Activated: We're using AI to find communities that match your search. Click on any result to see live pricing and availability.";
      } else {
        discoveryMessage = `🔮 Discovery Mode Enhanced: Found ${totalResults} direct match${totalResults === 1 ? '' : 'es'}. Using AI to discover additional options for you.`;
      }
      
      // We'll integrate Perplexity AI suggestions later in the response
      // This prevents random locations from appearing
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
    
    // ENHANCED DISCOVERY MODE WITH MULTI-AI ORCHESTRATOR
    let aiConsensus: any = null;
    let aiSources: any = null;
    
    if (discoveryMode) {
      try {
        console.log(`🚀 Discovery Mode: Engaging Multi-AI Orchestrator for query: "${query}"`);
        
        // Use Multi-AI Orchestrator to discover communities from all 5 AI services
        const multiAIResults = await MultiAIOrchestrator.discoverCommunities(
          query,
          {
            filters,
            careTypes: filters.careTypes,
            priceRange: filters.priceMin || filters.priceMax ? {
              min: filters.priceMin,
              max: filters.priceMax
            } : undefined
          }
        );
        
        // Extract consensus and AI sources
        if (multiAIResults && multiAIResults.success) {
          // Build AI consensus data
          aiConsensus = multiAIResults.consensus || {
            insights: [],
            recommendations: [],
            warnings: []
          };
          
          // Track which AIs responded
          aiSources = {
            perplexity: false,
            claude: false,
            grok: false,
            gemini: false,
            deepseek: false,
            totalResponding: multiAIResults.aiSources || 0
          };
          
          // Mark successful AI services
          if (multiAIResults.metadata) {
            const successfulServices = multiAIResults.metadata.successfulServices || 0;
            console.log(`✨ Discovery Mode: ${successfulServices} AI services provided insights`);
          }
          
          // Build AI suggestions from discovered communities
          const discoveredCommunities = multiAIResults.communities || [];
          
          if (discoveredCommunities.length > 0) {
            // Format discovered communities into readable suggestions
            const communityList = discoveredCommunities
              .slice(0, 10) // Limit to top 10
              .map(c => {
                let details = `• **${c.name}**`;
                if (c.city) details += ` - ${c.city}`;
                if (c.state || c.country) details += `, ${c.state || c.country}`;
                if (c.phone) details += ` | 📞 ${c.phone}`;
                if (c.website) details += ` | 🌐 ${c.website}`;
                if (c.pricing) details += ` | 💰 ${c.pricing}`;
                if (c.confidence) details += ` | Confidence: ${c.confidence}%`;
                if (c.sources && c.sources.length > 0) {
                  details += ` | Sources: ${c.sources.join(', ')}`;
                }
                return details;
              })
              .join('\n');
            
            aiSuggestions = {
              summary: `🌍 Multi-AI Discovery found ${discoveredCommunities.length} communities worldwide:\n\n${communityList}\n\n💡 **AI Consensus:** ${aiConsensus.insights.length > 0 ? aiConsensus.insights[0] : 'Multiple AI services analyzed your search to provide these results.'}\n\n🤖 **Contributing AIs:** ${multiAIResults.aiSources} services provided data`,
              sources: multiAIResults.sources || [],
              images: multiAIResults.images || [],
              communities: discoveredCommunities,
              aiMetadata: {
                totalFound: discoveredCommunities.length,
                aiSources: multiAIResults.aiSources,
                consensus: aiConsensus
              }
            };
            
            discoveryMessage = `🔮 Multi-AI Discovery Mode: ${multiAIResults.aiSources} AI services searched worldwide to find ${discoveredCommunities.length} communities matching your criteria.`;
          } else {
            // No communities found even with multi-AI search
            aiSuggestions = {
              summary: `Multi-AI search completed across ${multiAIResults.aiSources} services. No exact matches found for "${query}". Try:\n• Searching for nearby cities\n• Using broader search terms\n• Contacting communities directly for availability`,
              sources: [],
              images: [],
              communities: []
            };
            
            discoveryMessage = `🔮 Multi-AI Discovery Mode: ${multiAIResults.aiSources} AI services searched but found no exact matches. Try adjusting your search criteria.`;
          }
        } else {
          // Fallback to original Perplexity-only approach if Multi-AI fails
          console.log('⚠️ Multi-AI Orchestrator failed, falling back to Perplexity');
          const { perplexityService } = await import('../perplexity-ai-service');
          
          let aiQuery = `Find senior living communities `;
          if (query.includes(',')) {
            aiQuery += `in ${query}`;
          } else {
            aiQuery += `matching "${query}"`;
          }
          
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
          
          const aiResponse = await perplexityService.searchRealTime(aiQuery);
          
          if (aiResponse && aiResponse.summary) {
            aiSuggestions = {
              summary: aiResponse.summary,
              sources: aiResponse.sources || [],
              images: aiResponse.images || []
            };
            aiSources = { perplexity: true, totalResponding: 1 };
          } else {
            aiSuggestions = {
              summary: `AI search is temporarily unavailable. Please try searching with more specific terms or contact communities directly for information.`,
              sources: [],
              images: []
            };
          }
        }
      } catch (error: any) {
        console.error('🚨 Discovery Mode error:', error.message);
        // Provide a helpful fallback message when AI fails
        aiSuggestions = {
          summary: `Discovery Mode is temporarily limited. Try these search tips:
• Search by city and state (e.g., "Sacramento, CA")
• Use specific care types (e.g., "memory care")
• Try nearby cities if your exact location shows no results
• Contact communities directly for the most current information`,
          sources: [],
          images: []
        };
        aiSources = { totalResponding: 0 };
      }
    }
    
    // PRICING ANALYSIS: Use Multi-AI for pricing queries
    if (!discoveryMode && intentScores && intentScores.price > 0.5 && results.length > 0) {
      try {
        console.log(`💰 Detected pricing search, analyzing with Multi-AI Orchestrator`);
        
        // Analyze pricing for top results
        const topCommunities = results.slice(0, 3);
        const pricingPromises = topCommunities.map(community => 
          MultiAIOrchestrator.analyzePricing(community)
        );
        
        const pricingResults = await Promise.allSettled(pricingPromises);
        
        // Aggregate pricing insights
        const pricingInsights: any[] = [];
        pricingResults.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value.success) {
            const community = topCommunities[index];
            const pricing = result.value.pricing;
            
            // Update community with AI-analyzed pricing
            if (pricing) {
              community.aiPricing = {
                average: pricing.average,
                median: pricing.median,
                range: { min: pricing.min, max: pricing.max },
                confidence: pricing.confidence,
                aiServices: pricing.aiServices,
                lastUpdated: new Date().toISOString()
              };
              
              pricingInsights.push({
                community: community.name,
                pricing: `$${pricing.min.toLocaleString()} - $${pricing.max.toLocaleString()}/month`,
                confidence: `${pricing.confidence}%`,
                sources: pricing.sources?.length || 0
              });
            }
          }
        });
        
        // Add pricing insights to consensus
        if (pricingInsights.length > 0) {
          if (!aiConsensus) {
            aiConsensus = { insights: [], recommendations: [], warnings: [] };
          }
          aiConsensus.insights.push(
            `AI-analyzed pricing for ${pricingInsights.length} communities based on multiple sources`
          );
          aiConsensus.pricing = {
            communities: pricingInsights,
            lastAnalyzed: new Date().toISOString()
          };
          
          if (!aiSources) {
            aiSources = { totalResponding: 0 };
          }
          aiSources.pricingAnalysis = true;
        }
      } catch (error) {
        console.error('Pricing analysis error:', error);
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
        fallbackApplied: discoveryMode,
        fallbackMessage: discoveryMode ? discoveryMessage : undefined,
        originalFiltersRequested: discoveryMode ? originalFilters : undefined,
        includesHealthcare: isHealthcareSearch,
        // Add AI consensus and sources
        aiConsensus: aiConsensus || undefined,
        aiSources: aiSources || undefined,
        // Add AI suggestions as part of extended metadata
        ...(discoveryMode && aiSuggestions ? { aiSuggestions } : {})
      } as any,
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
      // Community names often contain city names (e.g., "San Diego Senior Manor", "Redwood Lodge - Fremont, CA")
      const communityNameKeywords = [
        'manor', 'estates', 'village', 'residence', 'living', 'senior', 'care', 
        'home', 'center', 'community', 'lodge', 'plaza', 'terrace', 'gardens',
        'court', 'place', 'park', 'villa', 'oaks', 'pines', 'meadows', 'ridge',
        'haven', 'house', 'assisted', 'memory', 'nursing', 'retirement', 'heights',
        'grove', 'pointe', 'crossing', 'commons', 'towers', 'square', 'club'
      ];
      
      // Check if query contains community name keywords OR has specific patterns
      // Don't treat simple "City, State" patterns as community names
      const isCityStatePattern = /^[a-zA-Z\s]+,\s*[A-Z]{2}$/i.test(query.trim());
      const looksLikeCommunityName = !isCityStatePattern && (
        communityNameKeywords.some(keyword => normalizedQuery.includes(keyword)) ||
        normalizedQuery.includes(' - ') // Common pattern: "Name - City, State"
      );
      
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
      
      // CRITICAL FIX: If we extracted a community name from "Name - Location" format, ALWAYS search for it
      const extractedCommunityName = normalizedQuery.includes(' - ');
      
      // Only add name search if:
      // 1. We extracted a community name from "Name - Location" format
      // 2. OR it looks like a community name
      // 3. OR it's not clearly a location search
      // 4. OR no other conditions were added
      if (extractedCommunityName || looksLikeCommunityName) {
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
    const dominant = entries.reduce((a: any, b: any) => (a[1] as number) > (b[1] as number) ? a : b);
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
          // It's likely a city name - search for it properly
          // Use simple ILIKE for case-insensitive matching
          const cityConditions = [];
          
          // Exact city match (highest priority) - case insensitive
          cityConditions.push(ilike(communities.city, query));
          
          // City starts with query (for partial matches like "San" for "San Francisco")
          cityConditions.push(ilike(communities.city, `${query}%`));
          
          // City contains query (for substring matches)
          cityConditions.push(ilike(communities.city, `%${query}%`));
          
          // Combine with OR to match any condition
          if (cityConditions.length > 0) {
            conditions.push(or(...cityConditions));
            console.log(`🌍 Added city search conditions for "${query}" (${cityConditions.length} patterns)`);
          }
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
      conditions.push(gte(sql`CAST(${communities.rating} AS DECIMAL)`, filters.rating));
    }
  }
  
  private applySorting(query: any, searchType: string, searchQuery: string): any {
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
      states: states.map(s => ({ name: s.state, count: Number(s.count) || 0 })),
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
        .filter(s => s.count && Number(s.count) > 0)
        .map(s => ({
          name: s.displayName,
          count: Number(s.count) || 0
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
}

export const comprehensiveSearchEngine = new ComprehensiveSearchEngine();
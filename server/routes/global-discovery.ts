import { Express } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { communities, vendors, services } from '@shared/schema';
import { eq, and, isNull, or, like, sql } from 'drizzle-orm';
import { geocodeWithNominatim } from '../nominatim-geocoding';
import { perplexitySearchAPI } from '../services/perplexity-search-api';

// Schema for global discovery search
const globalSearchSchema = z.object({
  query: z.string(),
  searchType: z.enum(['location', 'service', 'services', 'community']).optional(),
  limit: z.number().min(1).max(100).default(30)
});

// Schema for discovered community data
const discoveredCommunitySchema = z.object({
  name: z.string(),
  location: z.string(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  description: z.string().optional(),
  website: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  careTypes: z.array(z.string()).optional(),
  photos: z.array(z.string()).optional(),
  pricing: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    description: z.string().optional()
  }).optional(),
  source: z.string(), // Where we found it (Perplexity, Google, etc.)
  sourceUrl: z.string().optional(),
  confidence: z.number().min(0).max(100).optional() // How confident we are in the data
});

// Import multi-AI orchestrator for comparisons
// import { MultiAIOrchestrator } from '../services/multi-ai-orchestrator';

// Business validation function using new Search API
async function validateBusinessExists(businessName: string, city?: string, state?: string): Promise<boolean> {
  try {
    const location = [city, state].filter(Boolean).join(', ');
    console.log(`🔍 Validating business exists: ${businessName}${location ? ` in ${location}` : ''}`);
    
    // Use new Search API for cost-effective validation ($5/1K vs higher Sonar Pro costs)
    const validation = await perplexitySearchAPI.validateBusinessExists(businessName, location);
    
    // Consider it valid if confidence is 50% or higher, or if we have multiple sources
    const isValid = validation.confidence >= 50 || validation.sources.length >= 2;
    
    console.log(`✅ Search API validation: ${businessName} = ${isValid ? 'VALID' : 'INVALID'} (confidence: ${validation.confidence}%, sources: ${validation.sources.length})`);
    
    return isValid;
  } catch (error) {
    console.error('⚠️ Business validation error:', error);
    return true; // Default to true if validation fails
  }
}

export function setupGlobalDiscoveryRoutes(app: Express) {
  
  // Global discovery search endpoint
  app.post('/api/global-discovery/search', async (req, res) => {
    // Declare variables outside try block to avoid scope issues
    let existingCommunities: any[] = [];
    let query = '';
    let searchType: string | undefined = undefined;
    let limit = 30;
    
    try {
      const parsed = globalSearchSchema.parse(req.body);
      query = parsed.query;
      searchType = parsed.searchType;
      limit = parsed.limit;
      
      console.log(`🌍 Global Discovery Search: "${query}" (type: ${searchType || 'auto-detect'})`);
      
      // Step 1: PRIORITIZE DATABASE SEARCH - We have services and communities tables!
      // For services, search SERVICES table; for locations, search communities
      if (searchType === 'services' || searchType === 'service') {
        // Search SERVICES table for discovered businesses like hotels, restaurants, etc.
        const queryLower = query.toLowerCase();
        
        // Clean query for database search (remove parentheses which can cause injection warnings)
        const cleanedQuery = queryLower.replace(/[()]/g, ' ').trim();
        
        // Parse location if query contains " in "
        let serviceType = '';
        let searchLocation = '';
        
        if (cleanedQuery.includes(' in ')) {
          const parts = cleanedQuery.split(' in ');
          serviceType = parts[0].trim();
          searchLocation = parts[1].trim();
        } else {
          serviceType = cleanedQuery;
        }
        
        console.log(`🔍 Parsed service search - Type: "${serviceType}", Location: "${searchLocation}"`);
        
        // Handle plural/singular forms for common service searches
        let searchTerms = [];
        
        // Check if the service type contains these keywords and add both forms
        if (serviceType.includes('hotels') || serviceType.includes('hotel')) {
          searchTerms.push('hotel');
          searchTerms.push('hotels');
        } else if (serviceType.includes('restaurants') || serviceType.includes('restaurant')) {
          searchTerms.push('restaurant');
          searchTerms.push('restaurants');
        } else if (serviceType.includes('pharmacies') || serviceType.includes('pharmacy')) {
          searchTerms.push('pharmacy');
          searchTerms.push('pharmacies');
        } else if (serviceType.includes('stores') || serviceType.includes('store')) {
          searchTerms.push('store');
          searchTerms.push('stores');
        } else {
          searchTerms.push(serviceType);
        }
        
        // Remove duplicates
        searchTerms = [...new Set(searchTerms)];
        
        // Build search conditions for service type
        const typeConditions = searchTerms.map(term => 
          or(
            sql`LOWER(${services.name}) LIKE ${'%' + term + '%'}`,
            sql`LOWER(${services.description}) LIKE ${'%' + term + '%'}`,
            sql`LOWER(${services.shortDescription}) LIKE ${'%' + term + '%'}`
          )
        );
        
        // Build location conditions if location specified
        const locationConditions = [];
        if (searchLocation) {
          locationConditions.push(
            or(
              sql`LOWER(CAST(${services.metadata} AS TEXT)) LIKE ${'%' + searchLocation + '%'}`,
              sql`LOWER(CAST(${services.availability} AS TEXT)) LIKE ${'%' + searchLocation + '%'}`
            )
          );
        }
        
        // Combine conditions
        const allConditions = searchLocation 
          ? [or(...typeConditions), ...locationConditions]
          : [or(...typeConditions)];
        
        // Search the SERVICES table for discovered businesses
        const serviceResults = await db.select()
          .from(services)
          .where(allConditions.length > 0 ? and(...allConditions) : sql`true`)
          .limit(50);
        
        console.log(`💾 Found ${serviceResults.length} existing services in database for "${query}"`);
        
        // If we found services, format and return them
        if (serviceResults.length > 0) {
          const formattedServiceResults = serviceResults.map(service => ({
            id: service.id,
            name: service.name,
            type: 'service',
            serviceType: service.serviceType || 'Service',
            description: service.description || '',
            shortDescription: service.shortDescription || '',
            website: service.externalUrl || '',
            metadata: service.metadata || {},
            isExisting: true,
            isDiscovered: false
          }));
          
          // Return service results immediately
          return res.json({
            success: true,
            query: query,
            searchType: 'services',
            results: formattedServiceResults.slice(0, limit),
            metadata: {
              totalFound: serviceResults.length,
              existingCount: serviceResults.length,
              discoveredCount: 0,
              sources: ['Database'],
              searchLocation: query,
              timestamp: new Date().toISOString(),
              aiConfidence: 100,
              dataSource: 'Services Database'
            },
            message: `Found ${serviceResults.length} services in database`
          });
        }
        // If we didn't find enough results with exact match, fall back to expanded search
        if (serviceResults.length === 0) {
          // Secondary condition: Also search for individual terms if query has multiple words
          const searchTerms = cleanedQuery.split(' ').filter(term => 
            term.length > 2 && !['for', 'in', 'at', 'the', 'and', 'or', 'near', 'adult', 'only'].includes(term)
          );
          
          if (searchTerms.length > 0) {
            // Handle plural/singular forms for common business types
            const expandedTerms = [];
            for (const term of searchTerms) {
              expandedTerms.push(term);
              // Add singular form if plural
              if (term === 'hotels') expandedTerms.push('hotel');
              else if (term === 'restaurants') expandedTerms.push('restaurant');
              else if (term === 'pharmacies') expandedTerms.push('pharmacy');
              else if (term === 'stores') expandedTerms.push('store');
              else if (term === 'shops') expandedTerms.push('shop');
              else if (term === 'cafes') expandedTerms.push('cafe');
              // Add plural form if singular  
              else if (term === 'hotel') expandedTerms.push('hotels');
              else if (term === 'restaurant') expandedTerms.push('restaurants');
              else if (term === 'pharmacy') expandedTerms.push('pharmacies');
              else if (term === 'store') expandedTerms.push('stores');
              else if (term === 'shop') expandedTerms.push('shops');
              else if (term === 'cafe') expandedTerms.push('cafes');
            }
            
            // Build conditions for individual terms
            const vendorConditions = [];
            for (const term of expandedTerms) {
              vendorConditions.push(
                or(
                  sql`LOWER(${vendors.businessName}) LIKE ${'%' + term + '%'}`,
                  sql`LOWER(${vendors.businessType}) LIKE ${'%' + term + '%'}`,
                  sql`LOWER(${vendors.description}) LIKE ${'%' + term + '%'}`,
                  sql`LOWER(${vendors.businessCity}) LIKE ${'%' + term + '%'}`
                )
              );
            }
            
            // Execute expanded vendor search
            const expandedVendorResults = await db.select()
              .from(vendors)
              .where(
                vendorConditions.length > 0 ? or(...vendorConditions) : sql`true`
              )
              .limit(50);
            
            console.log(`💾 Found ${expandedVendorResults.length} vendors with expanded search for "${query}"`);
            
            // If we found vendors with expanded search, use those
            if (expandedVendorResults.length > 0) {
              const formattedVendorResults = expandedVendorResults.map(vendor => ({
                id: vendor.id,
                name: vendor.businessName,
                type: 'vendor',
                businessType: vendor.businessType || 'Service',
                address: vendor.businessAddress || '',
                city: vendor.businessCity || '',
                state: vendor.businessState || '',
                phone: vendor.primaryContactPhone || '',
                website: vendor.website || '',
                description: vendor.description || '',
                isExisting: true,
                isDiscovered: false
              }));
              
              // Store vendor results for later combination with discovery results
              existingCommunities = formattedVendorResults;
              
              // Return vendor results immediately if we have enough
              if (!req.body.discoveryMode && expandedVendorResults.length >= 5) {
                return res.json({
                  success: true,
                  query: query,
                  searchType: 'services',
                  results: formattedVendorResults.slice(0, limit),
                  metadata: {
                    totalFound: expandedVendorResults.length,
                    existingCount: expandedVendorResults.length,
                    discoveredCount: 0,
                    sources: ['Database'],
                    searchLocation: query,
                    timestamp: new Date().toISOString(),
                    aiConfidence: 100,
                    dataSource: 'Vendors Database'
                  },
                  message: `Found ${expandedVendorResults.length} services/vendors in database`
                });
              }
            }
          }
        }
      } else if (searchType !== 'services') {
        // Parse location from query (e.g., "Dallas, Texas" or just "France")
        const queryParts = query.split(',').map(p => p.trim());
        const citySearch = queryParts[0] || query;
        const stateSearch = queryParts[1] || '';
        
        // Check if it's a country search
        const countryNames = [
          'japan', 'france', 'germany', 'italy', 'spain', 'uk', 'united kingdom', 'canada', 
          'australia', 'china', 'india', 'brazil', 'mexico', 'russia', 'south korea', 'korea',
          'netherlands', 'belgium', 'switzerland', 'sweden', 'norway', 'denmark', 'finland',
          'poland', 'czech republic', 'austria', 'portugal', 'greece', 'turkey', 'israel',
          'new zealand', 'singapore', 'thailand', 'vietnam', 'philippines', 'indonesia',
          'malaysia', 'hong kong', 'taiwan', 'argentina', 'chile', 'colombia', 'peru', 'usa', 'united states'
        ];
        const queryLower = query.toLowerCase();
        const isCountrySearch = countryNames.some(country => queryLower.includes(country));
        
        if (isCountrySearch && !query.includes(',')) {
          // Country-only search (e.g., "Japan", "France")
          existingCommunities = await db.select()
            .from(communities)
            .where(
              and(
                sql`LOWER(${communities.country}) LIKE ${queryLower + '%'}`,
                eq(communities.isVerified, true)
              )
            )
            .limit(50);
        } else {
          // City/state search (existing logic)
          existingCommunities = await db.select()
            .from(communities)
            .where(
              and(
                sql`LOWER(${communities.city}) = ${citySearch.toLowerCase()}`,
                stateSearch ? sql`LOWER(${communities.state}) LIKE ${stateSearch.toLowerCase() + '%'}` : sql`true`,
                eq(communities.isVerified, true) // Only return verified communities
              )
            )
            .limit(50); // Get more results from database
        }
      }
      
      // If not enough results, broaden search (skip for services)
      if (searchType !== 'services' && existingCommunities.length < 15) {
        const searchTerms = query.toLowerCase().split(' ').filter(term => 
          term.length > 2 && !['for', 'in', 'at', 'the', 'senior', 'living', 'care'].includes(term)
        );
        
        const additionalResults = await db.select()
          .from(communities)
          .where(
            and(
              or(
                ...searchTerms.map(term => 
                  or(
                    sql`LOWER(${communities.city}) LIKE ${'%' + term + '%'}`,
                    sql`LOWER(${communities.state}) LIKE ${'%' + term + '%'}`,
                    sql`LOWER(${communities.name}) LIKE ${'%' + term + '%'}`
                  )
                )
              ),
              eq(communities.isVerified, true)
            )
          )
          .limit(50 - existingCommunities.length);
        
        // Combine and deduplicate
        const existingIds = new Set(existingCommunities.map(c => c.id));
        additionalResults.forEach(result => {
          if (!existingIds.has(result.id)) {
            existingCommunities.push(result);
          }
        });
      }
      
      console.log(`💾 Found ${existingCommunities.length} existing communities in database`);
      
      // Check if we're in Discovery Mode or searching for services
      const isDiscoveryMode = req.body.discoveryMode === true;
      
      // If NOT in Discovery Mode and we have enough database results (skip for services)
      if (!isDiscoveryMode && searchType !== 'services' && existingCommunities.length >= 15) {
        // Mark all database results as existing/verified
        const markedResults = existingCommunities.slice(0, limit).map(community => ({
          ...community,
          isExisting: true,
          isDiscovered: false
        }));
        
        return res.json({
          success: true,
          query: query,
          searchType: searchType || 'database',
          results: markedResults,
          metadata: {
            totalFound: existingCommunities.length,
            existingCount: existingCommunities.length,
            discoveredCount: 0,
            sources: ['Database'],
            searchLocation: query,
            timestamp: new Date().toISOString(),
            aiConfidence: 100,
            dataSource: 'Database (33k+ verified communities)'
          },
          message: `Found ${existingCommunities.length} verified communities in ${query}`
        });
      }
      
      // If NOT in Discovery Mode and we have some database results, return them
      if (!isDiscoveryMode) {
        // Return database results without calling Perplexity
        console.log(`✅ Returning ${existingCommunities.length} database results without Perplexity (Discovery Mode: false)`);
        
        // Mark all database results as existing/verified
        const markedResults = existingCommunities.slice(0, limit || 30).map(community => ({
          ...community,
          isExisting: true,
          isDiscovered: false
        }));
        
        return res.json({
          success: true,
          query: query || '',
          searchType: searchType || 'auto-detected',
          results: markedResults,
          metadata: {
            totalFound: existingCommunities.length,
            existingCount: existingCommunities.length,
            discoveredCount: 0,
            sources: ['Database'],
            searchLocation: query,
            timestamp: new Date().toISOString(),
            aiConfidence: 100,
            dataSource: 'Database (33k+ verified communities)',
            discoveryModeUsed: false
          },
          message: existingCommunities.length === 0 
            ? 'No communities found in database. Use Discovery Mode to search the web.'
            : `Found ${existingCommunities.length} communities in database`
        });
      }
      
      // ============ DISCOVERY MODE ACTIVE ============
      // When Discovery Mode is TRUE, ALWAYS search the web to find ALL options,
      // then compare to database to identify which ones we already have
      // 🚀 USING NEW SEARCH API (Sept 25, 2025) - $5/1K requests vs higher Sonar costs
      
      const perplexityApiKey = process.env.PERPLEXITY_API_KEY;
      if (!perplexityApiKey) {
        console.error('❌ Perplexity API key not configured');
        return res.status(500).json({ error: 'Search service not configured for Discovery Mode' });
      }
      
      console.log(`🔍 Discovery Mode ACTIVE: Using NEW Search API for cost-effective discovery in ${query}, then comparing to database`);
      
      // Construct an intelligent search query for Perplexity - optimized for international searches
      let searchQuery = '';
      
      // List of known country names for detection
      const countryNames = [
        'japan', 'france', 'germany', 'italy', 'spain', 'uk', 'united kingdom', 'canada', 
        'australia', 'china', 'india', 'brazil', 'mexico', 'russia', 'south korea', 'korea',
        'netherlands', 'belgium', 'switzerland', 'sweden', 'norway', 'denmark', 'finland',
        'poland', 'czech republic', 'austria', 'portugal', 'greece', 'turkey', 'israel',
        'new zealand', 'singapore', 'thailand', 'vietnam', 'philippines', 'indonesia',
        'malaysia', 'hong kong', 'taiwan', 'argentina', 'chile', 'colombia', 'peru'
      ];
      
      // Detect if query contains a country name
      const queryLower = query.toLowerCase();
      const isCountrySearch = countryNames.some(country => queryLower.includes(country));
      const isSpecificCitySearch = query.includes(',') || query.match(/\b(city|town|suburb|district)\b/i);
      
      let discoveredCommunities: any[] = [];
      let citations: any[] = []; // Initialize citations for both Search API and Sonar API paths
      let aiResponse = ''; // Initialize for both paths
      // searchQuery already declared earlier in the function

      // Detect default country from the beginning
      const defaultCountry = (() => {
        const lowerQuery = query.toLowerCase();
        if (lowerQuery.includes('australia') || lowerQuery.includes('brisbane') || lowerQuery.includes('sydney') || lowerQuery.includes('melbourne') || lowerQuery.includes('perth')) return 'Australia';
        if (lowerQuery.includes('scotland') || lowerQuery.includes('edinburgh') || lowerQuery.includes('glasgow')) return 'United Kingdom';
        if (lowerQuery.includes('england') || lowerQuery.includes('london') || lowerQuery.includes('manchester')) return 'United Kingdom';
        if (lowerQuery.includes('wales') || lowerQuery.includes('cardiff')) return 'United Kingdom';
        if (lowerQuery.includes('uk') || lowerQuery.includes('united kingdom')) return 'United Kingdom';
        if (lowerQuery.includes('canada') || lowerQuery.includes('toronto') || lowerQuery.includes('vancouver')) return 'Canada';
        if (lowerQuery.includes('france') || lowerQuery.includes('paris')) return 'France';
        if (lowerQuery.includes('germany') || lowerQuery.includes('berlin')) return 'Germany';
        if (lowerQuery.includes('japan') || lowerQuery.includes('tokyo')) return 'Japan';
        if (lowerQuery.includes('italy') || lowerQuery.includes('rome')) return 'Italy';
        if (lowerQuery.includes('spain') || lowerQuery.includes('madrid')) return 'Spain';
        return 'United States'; // Default
      })();

      // Helper function to detect country from query
      const detectCountry = (query: string): string => {
        const lowerQuery = query.toLowerCase();
        if (lowerQuery.includes('australia') || lowerQuery.includes('brisbane') || lowerQuery.includes('sydney') || lowerQuery.includes('melbourne') || lowerQuery.includes('perth')) return 'Australia';
        if (lowerQuery.includes('scotland') || lowerQuery.includes('edinburgh') || lowerQuery.includes('glasgow')) return 'United Kingdom';
        if (lowerQuery.includes('england') || lowerQuery.includes('london') || lowerQuery.includes('manchester')) return 'United Kingdom';
        if (lowerQuery.includes('wales') || lowerQuery.includes('cardiff')) return 'United Kingdom';
        if (lowerQuery.includes('uk') || lowerQuery.includes('united kingdom')) return 'United Kingdom';
        if (lowerQuery.includes('canada') || lowerQuery.includes('toronto') || lowerQuery.includes('vancouver')) return 'Canada';
        if (lowerQuery.includes('france') || lowerQuery.includes('paris')) return 'France';
        if (lowerQuery.includes('germany') || lowerQuery.includes('berlin')) return 'Germany';
        if (lowerQuery.includes('japan') || lowerQuery.includes('tokyo')) return 'Japan';
        if (lowerQuery.includes('italy') || lowerQuery.includes('rome')) return 'Italy';
        if (lowerQuery.includes('spain') || lowerQuery.includes('madrid')) return 'Spain';
        return 'United States'; // Default
      };

      // Step 1: TRY NEW SEARCH API FIRST (much cheaper at $5/1K requests)
      try {
        console.log(`🔍 Step 1: Using NEW Search API for initial discovery...`);
        
        if (searchType === 'services') {
          // Parse service type and location from query
          const queryParts = query.toLowerCase().split(' in ');
          const serviceType = queryParts[0]?.trim() || query;
          const location = queryParts[1]?.trim() || '';
          
          console.log(`🔍 Searching for services: "${serviceType}" in "${location}"`);
          
          // Use specialized business search
          const searchResults = await perplexitySearchAPI.searchBusinesses(serviceType, location, {
            max_results: 20,
            max_tokens_per_page: 512
          });
          
          // Extract business data from search results
          const businesses = perplexitySearchAPI.extractBusinessData(searchResults.results, 'service');
          
          console.log(`✅ Search API found ${businesses.length} businesses from ${searchResults.results.length} search results`);
          
          // Convert to discovery format
          discoveredCommunities = businesses.map(business => ({
            name: business.name,
            website: business.website || '',
            description: business.description || `${serviceType} service in ${location}`,
            city: location.split(',')[0]?.trim() || '',
            state: location.split(',')[1]?.trim() || '',
            country: 'United States',
            source: 'Search API',
            confidence: business.confidence,
            isDiscovered: true,
            careTypes: [serviceType]
          }));
          
        } else if (searchType === 'location' || isSpecificCitySearch || isCountrySearch) {
          // Use specialized senior community search
          const location = query;
          const searchResults = await perplexitySearchAPI.searchSeniorCommunities(location, '', {
            max_results: 15,
            max_tokens_per_page: 512
          });
          
          // Extract community data from search results
          const communities = perplexitySearchAPI.extractBusinessData(searchResults.results, 'senior_community');
          
          console.log(`✅ Search API found ${communities.length} senior communities from ${searchResults.results.length} search results`);
          
          // Convert to discovery format
          discoveredCommunities = communities.map(community => ({
            name: community.name,
            website: community.website || '',
            description: community.description || `Senior living community in ${location}`,
            city: location.split(',')[0]?.trim() || '',
            state: location.split(',')[1]?.trim() || '',
            country: detectCountry(query),
            source: 'Search API',
            confidence: community.confidence,
            isDiscovered: true,
            careTypes: ['Senior Living']
          }));
        }
        
        // If Search API found good results, use them directly
        if (discoveredCommunities.length >= 5) {
          console.log(`✅ Search API success: Found ${discoveredCommunities.length} results, skipping expensive Sonar API`);
        } else {
          console.log(`⚠️ Search API found only ${discoveredCommunities.length} results, falling back to Sonar API for comprehensive search`);
          discoveredCommunities = []; // Clear for fallback
        }
        
      } catch (searchApiError) {
        console.error('⚠️ Search API failed, falling back to Sonar API:', searchApiError);
        discoveredCommunities = []; // Clear for fallback
      }

      // Step 2: FALLBACK TO SONAR API if Search API didn't find enough results
      if (discoveredCommunities.length < 5) {
        console.log(`🔍 Step 2: Using Sonar API for comprehensive discovery (fallback)...`);
        
        try {

        if (searchType === 'services') {
          // KISS approach - use the user's query directly with minimal wrapper
          searchQuery = `Find at least 15-20 businesses or services matching: "${query}". For each result provide: exact business name, complete street address, city, state/region, country, phone number, website, description of their services, and suggested places to find photos (like their website gallery, Facebook page, Instagram, Yelp, TripAdvisor, or other review sites where they might have photos). Include as many relevant results as possible.`;
        } else if (searchType === 'location' || isSpecificCitySearch || isCountrySearch) {
        // Adjust for country-level searches
        let searchScope = '';
        if (isCountrySearch && !isSpecificCitySearch) {
          searchScope = `Search across major cities and regions in ${query}. Include facilities from different areas of the country.`;
        } else {
          searchScope = `Include ONLY facilities physically located in ${query}.`;
        }
        
        searchQuery = `Find at least 15-20 senior housing options and senior living facilities in ${query}. ${searchScope} Include ALL types of senior housing: independent living communities, senior apartments, 55+ apartments, affordable senior housing, HUD Section 202 housing, subsidized senior housing, low-income senior housing, active adult communities, continuing care retirement communities (CCRCs), assisted living facilities, memory care centers, skilled nursing facilities, nursing homes, board and care homes, adult family homes, residential care homes, and ANY other housing options for seniors. List ALL facilities you can find, not just a few examples. For each facility provide: exact facility name, complete street address with street number, city, state/region, country, phone number, website, type of housing/care level, and description of their services. Provide comprehensive results - list every senior housing option you know of in this location, regardless of care level or housing type. Minimum 15 facilities if they exist in this area.`;
      } else if (searchType === 'service') {
        // Legacy service type for backward compatibility
        searchQuery = `Find at least 10-15 senior care services and providers offering ${query}. Include company names, locations, contact information, and service descriptions. List as many providers as possible.`;
      } else {
        searchQuery = `Find at least 10-15 facilities about ${query} related to senior housing, senior living, senior apartments, 55+ communities, affordable senior housing, or elder care. Include ALL types of senior housing options. Include facility names, locations, and contact details. Provide comprehensive results.`;
      }
      
      console.log(`🔍 Perplexity Query: ${searchQuery}`);
      
      // Call Perplexity API with STRUCTURED JSON OUTPUT and timeout
      // Use adaptive timeout: longer for international and service searches
      const isComplexSearch = (isCountrySearch || searchType === 'services' || query.toLowerCase().includes('hotels') || query.toLowerCase().includes('transportation'));
      const TIMEOUT_MS = isComplexSearch ? 55000 : 30000; // 55s for complex searches, 30s for simple ones
      console.log(`⏱️ Using ${TIMEOUT_MS/1000}s timeout for ${isComplexSearch ? 'complex' : 'simple'} search`);
      
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
      
      // Adjust system prompt based on search type
      let systemPrompt = '';
      if (searchType === 'services') {
        systemPrompt = 'You are a helpful assistant that finds businesses and services based on user searches. Provide accurate and relevant results.';
      } else {
        systemPrompt = 'You are a comprehensive senior housing research assistant. Search for ALL types of senior housing and living options, not just care facilities. Include: independent living, senior apartments, 55+ communities, affordable/subsidized senior housing, HUD housing, active adult communities, CCRCs, assisted living, memory care, nursing homes, board and care homes, and ANY housing option available to seniors. Return ONLY facilities from the requested location with accurate information.';
      }
      
      const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
        signal: controller.signal,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${perplexityApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'sonar', // Standard model for cost-effective search (same as community details)
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: searchQuery + ' Provide the response as structured JSON data with ALL facilities found, not just examples. Include every single facility you can find.'
            }
          ],
          web_search_options: {
            search_context_size: 'low' // Use low context to reduce costs
          },
          response_format: {
            type: 'json_schema',
            json_schema: {
              schema: {
                type: 'object',
                properties: {
                  facilities: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        address: { type: 'string' },
                        city: { type: 'string' },
                        state: { type: 'string' },
                        country: { type: 'string' },
                        phone: { type: 'string' },
                        website: { type: 'string' },
                        email: { type: 'string' },
                        description: { type: 'string' },
                        careTypes: {
                          type: 'array',
                          items: { type: 'string' }
                        },
                        zipCode: { type: 'string' }
                      },
                      required: ['name']
                    }
                  },
                  totalFound: { type: 'number' },
                  searchLocation: { type: 'string' }
                },
                required: ['facilities']
              }
            }
          },
          temperature: 0.2, // Lower temperature for more accurate results
          max_tokens: 4000, // Increased to handle full JSON responses with 15-20 facilities
          top_p: 0.9,
          stream: false
        })
      }).finally(() => clearTimeout(timeout));
      
      if (!perplexityResponse.ok) {
        console.error('❌ Perplexity API error:', perplexityResponse.status);
        throw new Error('Search service error');
      }
      
      const perplexityData = await perplexityResponse.json();
      const aiResponse = perplexityData.choices[0]?.message?.content || '';
      const citations = perplexityData.citations || [];
      
      console.log(`✅ Perplexity Response Length: ${aiResponse.length} characters`);
      console.log(`📚 Citations: ${citations.length} sources`);
      
      // Log the raw response for debugging
      console.log(`🔍 Raw Perplexity Response:`, aiResponse.substring(0, 500));
      
      // Step 3: Parse the structured JSON response
      // discoveredCommunities already declared above
      
      // Use the detectCountry function already defined above
      const defaultCountry = detectCountry(query);
      
      try {
        // First, try to extract JSON from code fences if present
        let jsonContent = aiResponse;
        const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)```/);
        if (jsonMatch) {
          jsonContent = jsonMatch[1];
        }
        
        // Parse the structured JSON response from Perplexity
        const structuredData = JSON.parse(jsonContent);
        
        if (structuredData.facilities && Array.isArray(structuredData.facilities)) {
          // Filter out any facilities that don't have valid names or are duplicates
          const uniqueFacilities = new Map<string, any>();
          
          structuredData.facilities.forEach((facility: any) => {
            // Skip if no name or name is too short
            if (!facility.name || facility.name.length < 3) return;
            
            // Use name + city as unique key to avoid exact duplicates
            const key = `${facility.name.toLowerCase()}_${(facility.city || '').toLowerCase()}`;
            
            // Only add if we haven't seen this facility before
            if (!uniqueFacilities.has(key)) {
              uniqueFacilities.set(key, {
                name: facility.name,
                address: facility.address || '',
                city: facility.city || query.split(',')[0]?.trim() || '',
                state: facility.state || query.split(',')[1]?.trim() || '',
                country: facility.country || defaultCountry,
                phone: facility.phone || '',
                website: facility.website || '',
                email: facility.email || '',
                zipCode: facility.zipCode || '',
                description: facility.description || `Senior living facility in ${facility.city || query}`,
                careTypes: facility.careTypes || [],
                photoSources: facility.photoSources || [], // Add photo sources from Perplexity
                source: 'Perplexity AI Discovery',
                confidence: 95,
                isDiscovered: true
              });
            }
          });
          
          discoveredCommunities = Array.from(uniqueFacilities.values());
          console.log(`✅ Successfully parsed ${discoveredCommunities.length} unique facilities from structured JSON`);
        }
      } catch (parseError) {
        console.error('⚠️ Error parsing structured JSON:', parseError);
        console.log('Attempting enhanced fallback parsing for markdown/URL response...');
        
        // Enhanced fallback: Extract from markdown, URLs, and lists
        try {
          const uniqueFallbackFacilities = new Map();
          
          // First, extract facilities from URL patterns with names
          // Pattern: "Name: website" or "Name - website" or "Name (website)"
          const urlPatterns = [
            /([A-Z][\w\s&'\-\.]+?)\s*[-–—:]\s*(https?:\/\/[^\s\)\]]+)/gi,
            /\*\*([^\*]+)\*\*.*?(https?:\/\/[^\s\)\]]+)/gi,
            /\b([A-Z][\w\s&'\-\.]+?)\s*\(?(https?:\/\/[^\s\)\]]+)\)?/gi
          ];
          
          for (const pattern of urlPatterns) {
            const matches = aiResponse.matchAll(pattern);
            for (const match of matches) {
              const name = match[1]?.trim();
              const website = match[2]?.trim();
              
              // Filter out directories and aggregators, and validate name
              const isValidName = name && 
                name.length > 8 && // Minimum length for a real business name
                !name.startsWith('and ') && // Filter out fragments
                !name.startsWith('www.') && // Filter out partial URLs
                !name.match(/^https?:\/\//i) && // Filter out URLs
                /^[A-Z]/.test(name) && // Must start with capital letter
                name.split(' ').length <= 12; // Reasonable word count
              
              const isValidWebsite = website && 
                !website.includes('google.') && 
                !website.includes('yelp.') && 
                !website.includes('wikipedia.') && 
                !website.includes('/find-a-') && 
                !website.includes('/locations');
              
              if (isValidWebsite && isValidName) {
                
                const key = name.toLowerCase().replace(/\s+(aged care|care services|retirement|village|group|ltd|inc|pty|plc).*$/i, '').trim();
                if (!uniqueFallbackFacilities.has(key)) {
                  uniqueFallbackFacilities.set(key, {
                    name: name,
                    website: website,
                    address: '',
                    city: query.split(',')[0]?.trim() || '',
                    state: query.split(',')[1]?.trim() || '',
                    country: defaultCountry,
                    description: `${name} - found via search for "${query}"`,
                    photoSources: [], // Empty array for fallback parsing
                    source: 'Perplexity Web Search',
                    confidence: 85,
                    isDiscovered: true
                  });
                }
              }
            }
          }
          
          // Try more patterns to extract facility information
          const patterns = [
            /\*\*([^\*]+)\*\*[\s\S]*?(?:Address|Location)?:?\s*([^\n]+)?/gi,
            /\d+\.\s+([^\n,:]+)(?:[,:]\s*([^\n]+))?/gi,
            /^[-•*]\s+([^\n,:]+)(?:[,:]\s*([^\n]+))?/gim,
            /(?:Name|Facility):\s*([^\n]+)[\s\S]*?(?:Address|Location)?:?\s*([^\n]+)?/gi,
            /\b([A-Z][\w\s&'\-\.]+(?:Retirement|Care|Living|Village|Home|Center|Centre|Aged Care|Services))\b/gi
          ];
          
          for (const pattern of patterns) {
            const matches = aiResponse.matchAll(pattern);
            for (const match of matches) {
              const name = match[1]?.trim();
              const location = match[2]?.trim() || '';
              
              // Validate the name - must be a proper facility name
              const isValidName = name && 
                name.length > 8 && // Minimum length for a real business name
                !name.includes('?') && 
                !name.includes('example') &&
                !name.startsWith('and ') && // Filter out fragments like "and a fitness center"
                !name.startsWith('www.') && // Filter out partial URLs
                !name.startsWith('http') && // Filter out URLs
                /^[A-Z]/.test(name) && // Must start with capital letter
                !/^\d/.test(name) && // Shouldn't start with a number
                name.split(' ').length <= 10; // Reasonable word count for a business name
              
              if (isValidName) {
                const key = name.toLowerCase();
                if (!uniqueFallbackFacilities.has(key)) {
                  uniqueFallbackFacilities.set(key, {
                    name: name,
                    address: location,
                    city: query.split(',')[0]?.trim() || '',
                    state: query.split(',')[1]?.trim() || '',
                    country: defaultCountry,
                    description: `Found via search for "${query}"`,
                    photoSources: [], // Empty array for fallback parsing
                    source: 'Perplexity Web Search',
                    confidence: 85,
                    isDiscovered: true
                  });
                }
              }
            }
          }
          
          const fallbackResults = Array.from(uniqueFallbackFacilities.values());
          if (fallbackResults.length > 0) {
            discoveredCommunities = fallbackResults;
            console.log(`✅ Fallback parsing extracted ${discoveredCommunities.length} unique facilities`);
          }
        } catch (fallbackError) {
          console.error('❌ Fallback parsing also failed:', fallbackError);
        }
      }
      
      } catch (sonarError) {
        console.error('⚠️ Sonar API error:', sonarError);
        // Continue with empty results if Sonar fails
      }
      } // End of Sonar API fallback block
      
      // Step 4: Save discovered communities or services to database
      const savedCommunities = [];
      const savedServices = [];
      
      if (searchType === 'services') {
        // Save discovered services to services table
        console.log(`💾 Saving ${discoveredCommunities.length} discovered services to database`);
        
        for (const discovered of discoveredCommunities) {
          try {
            // Check if service already exists in services table
            const existing = await db.select()
              .from(services)
              .where(
                sql`LOWER(${services.name}) = ${discovered.name.toLowerCase()}`
              )
              .limit(1);
            
            if (existing.length === 0 && discovered.name) {
              // Save new discovered service to database
              const [newService] = await db.insert(services)
                .values({
                  name: discovered.name,
                  description: discovered.description || `Service discovered in ${discovered.city || query}`,
                  shortDescription: discovered.description ? discovered.description.substring(0, 200) : `Service in ${discovered.city || query}`,
                  serviceType: 'service', // Using the enum value from schema
                  deliveryMethod: ['in-person'], // Default to in-person
                  externalUrl: discovered.website || null,
                  isActive: true,
                  isFeatured: false,
                  sortOrder: 0,
                  metadata: {
                    source: 'Perplexity Search API Discovery',
                    discoveryQuery: query,
                    discoveryDate: new Date().toISOString(),
                    confidence: discovered.confidence || 85,
                    photoSources: discovered.photoSources || [],
                    // Store location info in metadata
                    location: {
                      address: discovered.address || discovered.location || '',
                      city: discovered.city || query.split(',')[0]?.trim() || '',
                      state: discovered.state || query.split(',')[1]?.trim() || '',
                      zipCode: discovered.zipCode || '',
                      phone: discovered.phone || null,
                      email: discovered.email || null
                    },
                    // Mark as resource if it's an article/guide
                    isResource: discovered.isResource || false,
                    resourceType: discovered.resourceType || 'direct_business'
                  }
                })
                .returning();
              
              savedServices.push(newService);
              console.log(`💾 Saved new service to database: ${discovered.name} (ID: ${newService.id})`);
            } else if (existing.length > 0) {
              // Use existing service
              savedServices.push(existing[0]);
              console.log(`✅ Found existing service: ${existing[0].name} (ID: ${existing[0].id})`);
            }
          } catch (saveError) {
            console.error(`⚠️ Error saving discovered service ${discovered.name}:`, saveError);
            // Create a fallback object if save fails
            const fallbackService = {
              id: 0,
              name: discovered.name,
              serviceType: 'service',
              description: discovered.description || '',
              metadata: {
                location: {
                  city: discovered.city || '',
                  state: discovered.state || '',
                  phone: discovered.phone || null
                }
              },
              externalUrl: discovered.website || null,
              isDiscovered: true,
              confidence: discovered.confidence || 85
            };
            savedServices.push(fallbackService as any);
          }
        }
        console.log(`📊 Processed ${savedServices.length} services for display`);
      } else {
        // Save communities (existing logic)
        for (const discovered of discoveredCommunities) {
        try {
          // Check if we already have this community - use more flexible matching
          const nameParts = discovered.name.toLowerCase().split(/\s+/);
          const mainNamePart = nameParts.filter((p: string) => p.length > 3)[0] || nameParts[0];
          
          const existing = await db.select()
            .from(communities)
            .where(
              and(
                sql`LOWER(${communities.name}) LIKE ${'%' + mainNamePart + '%'}`,
                discovered.city ? 
                  sql`LOWER(${communities.city}) = ${discovered.city.toLowerCase()}` : 
                  sql`true`
              )
            )
            .limit(1);
          
          if (existing.length === 0 && discovered.name) {
            // Save new discovered community to database
            try {
              // Geocode the location to get coordinates for map display
              let latitude: number | null = null;
              let longitude: number | null = null;
              
              const locationString = discovered.address && discovered.city 
                ? `${discovered.address}, ${discovered.city}, ${discovered.state || discovered.country || ''}`
                : discovered.city && discovered.state
                ? `${discovered.city}, ${discovered.state}, ${discovered.country || ''}`
                : discovered.city || query;
              
              console.log(`🌍 Geocoding discovered community: ${locationString}`);
              const coordinates = await geocodeWithNominatim(locationString);
              
              if (coordinates) {
                latitude = coordinates.lat;
                longitude = coordinates.lng;
                console.log(`✅ Got coordinates: ${latitude}, ${longitude}`);
              } else {
                console.log(`⚠️ Could not geocode location: ${locationString}`);
              }
              
              const [newCommunity] = await db.insert(communities)
                .values({
                  name: discovered.name,
                  address: discovered.address || discovered.location || 'Address pending verification',
                  city: discovered.city || query.split(',')[0] || 'Unknown',
                  state: discovered.state || query.split(',')[1]?.trim() || 'Unknown',
                  country: discovered.country || defaultCountry,
                  zipCode: discovered.zipCode || '00000',
                  latitude: latitude,
                  longitude: longitude,
                  phone: discovered.phone || null,
                  email: discovered.email || null,
                  website: discovered.website || null,
                  description: discovered.description || `Discovered via search for "${query}"`,
                  careTypes: discovered.careTypes || ['Unknown'],
                  photos: [],
                  data_source: 'AI Discovery (Perplexity Global Search)',
                  discoverySource: 'Global Discovery Search',
                  discoveryDate: new Date(),
                  enrichmentStatus: 'pending',
                  enrichmentCompleted: false,
                  enrichmentHistory: [{
                    timestamp: new Date().toISOString(),
                    source: 'Perplexity Global Search',
                    fieldsUpdated: ['initial_discovery'],
                    autoApproved: false
                  }] as any[], // Cast to any[] to match JSON type
                  isVerified: false
                })
                .returning();
              
              console.log(`💾 Saved new discovered community: ${discovered.name} (ID: ${newCommunity.id})`);
              savedCommunities.push(newCommunity);
            } catch (insertError) {
              console.error(`⚠️ Error inserting community ${discovered.name}:`, insertError);
              // Create a fallback object if insert fails
              const fallbackCommunity = {
                id: 0, // Invalid ID to indicate error
                name: discovered.name,
                address: discovered.address || discovered.location || 'Address pending verification',
                city: discovered.city || query.split(',')[0] || 'Unknown',
                state: discovered.state || query.split(',')[1]?.trim() || 'Unknown',
                country: discovered.country || defaultCountry,
                zipCode: discovered.zipCode || '00000',
                phone: discovered.phone || null,
                email: discovered.email || null,
                website: discovered.website || null,
                description: discovered.description || `Discovered via search for "${query}"`,
                careTypes: discovered.careTypes || ['Unknown'],
                photos: [],
                data_source: 'ai_discovered_global_search',
                isVerified: false
              };
              savedCommunities.push(fallbackCommunity);
            }
          } else if (existing.length > 0) {
            // Add existing community to saved list
            savedCommunities.push(existing[0]);
            console.log(`✅ Found existing community: ${existing[0].name} (ID: ${existing[0].id})`);
          }
        } catch (saveError) {
          console.error(`⚠️ Error processing discovered community ${discovered.name}:`, saveError);
        }
      }
      } // End of if (searchType !== 'services')
      
      // Step 5: Map saved communities to have all the display fields needed
      let discoveredWithRealIds: any[] = [];
      
      if (searchType === 'services') {
        // Map saved services to display format
        discoveredWithRealIds = savedServices.map((service) => {
          // Extract location data from metadata
          const metadata = service.metadata as any || {};
          return {
            id: service.id, // Use real database ID
            name: service.name, // Services table uses 'name' column
            type: 'service',
            serviceType: service.serviceType || 'General Service',
            address: metadata.address || '',
            city: metadata.city || '',
            state: metadata.state || '',
            phone: metadata.phone || '',
            website: service.externalUrl || metadata.website || '',
            description: service.description || '',
            isDiscovered: true,
            isService: true,
            confidence: 90,
            data_source: 'AI Discovery',
            citations: citations
          };
        });
      } else {
        // For communities, map saved communities
        discoveredWithRealIds = savedCommunities.map((saved) => {
        // Find the original discovered data to get additional fields
        const originalData = discoveredCommunities.find(d => 
          d.name === saved.name || 
          (d.name && saved.name && d.name.toLowerCase().includes(saved.name.toLowerCase()))
        );
        
        return {
          id: saved.id, // Use the REAL database ID
          slug: `${saved.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${saved.id}`,
          name: saved.name,
          address: saved.address || originalData?.address || '',
          city: saved.city || '',
          state: saved.state || '',
          country: saved.country || '',
          zipCode: saved.zipCode || '00000',
          phone: saved.phone || originalData?.phone || '',
          website: saved.website || originalData?.website || '',
          description: saved.description || originalData?.description || '',
          careTypes: saved.careTypes || originalData?.careTypes || [],
          data_source: 'AI Discovery',
          isDiscovered: true,
          confidence: originalData?.confidence || 90,
          verificationStatus: 'pending', // Requires verification
          citations: citations, // Include Perplexity citations
          // Add fields needed for community details view
          photos: saved.photos || [],
          amenities: (saved as any).amenities || [],
          // Note: These fields don't exist in database but may be needed by frontend
          pricing: null,
          capacity: null,
          yearFounded: null,
          certifications: [],
          specialties: saved.careTypes || []
        };
      });
      }
      
      // Step 6: Compare web results to database to identify which are existing vs new
      // This is the KEY LOGIC for Discovery Mode
      const allWebResults: any[] = [];
      const dbIndex = new Map<string, any>();
      
      // Create a normalized index of database communities for matching
      existingCommunities.forEach(community => {
        // Normalize name for matching (remove common suffixes, lowercase, trim)
        const normalizedName = community.name
          .toLowerCase()
          .replace(/\s*(senior living|assisted living|memory care|llc|inc|corp).*$/i, '')
          .replace(/[^\w\s]/g, '')
          .trim();
        const key = `${normalizedName}_${(community.city || '').toLowerCase().trim()}`;
        dbIndex.set(key, community);
      });
      
      // Process all web-discovered communities
      discoveredWithRealIds.forEach(webCommunity => {
        // Skip if no name exists
        if (!webCommunity.name) {
          console.log('⚠️ Skipping web result with no name:', webCommunity);
          return;
        }
        
        // Normalize the web result name for matching
        const normalizedName = webCommunity.name
          .toLowerCase()
          .replace(/\s*(senior living|assisted living|memory care|llc|inc|corp).*$/i, '')
          .replace(/[^\w\s]/g, '')
          .trim();
        const key = `${normalizedName}_${(webCommunity.city || '').toLowerCase().trim()}`;
        
        // Check if this web result matches a database entry
        const dbMatch = dbIndex.get(key);
        
        if (dbMatch) {
          // This web result IS in our database - mark as existing/verified
          allWebResults.push({
            ...dbMatch,
            isExisting: true,
            isDiscovered: false,
            webData: webCommunity // Keep web data for reference
          });
        } else {
          // This web result is NOT in our database - mark as newly discovered
          allWebResults.push({
            ...webCommunity,
            isExisting: false,
            isDiscovered: true
          });
        }
      });
      
      const allResults = allWebResults;
      
      // Step 7: Return results with metadata
      // Count how many web results were existing vs new
      const existingInWebResults = allResults.filter(r => r.isExisting).length;
      const newlyDiscovered = allResults.filter(r => r.isDiscovered).length;
      
      res.json({
        success: true,
        query: query,
        searchType: searchType || 'auto-detected',
        results: allResults.slice(0, limit),
        metadata: {
          totalFound: allResults.length,
          existingCount: existingInWebResults,
          discoveredCount: newlyDiscovered,
          sources: citations.length > 0 ? [...citations, 'Database'] : ['Perplexity Web Search', 'Database'],
          searchLocation: query,
          timestamp: new Date().toISOString(),
          aiConfidence: discoveredCommunities.length > 0 ? 85 : 50,
          rawPerplexityResponse: aiResponse, // Include raw AI response for display
          perplexityQuery: searchQuery // Include the actual query sent to Perplexity
        },
        message: allResults.length === 0 
          ? `No communities found for "${query}". Try a different location or search term.`
          : `Discovery Mode found ${allResults.length} communities via web search: ${existingInWebResults} already in our database, ${newlyDiscovered} newly discovered`
      });
      
    } catch (error) {
      console.error('❌ Global discovery search error:', error);
      
      // If it's a timeout error, return existing results or timeout indicator
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('⏱️ Perplexity API timeout - checking for existing results');
        const { query, searchType, limit } = req.body;
        
        // If we have existing communities, return them
        if (existingCommunities.length > 0) {
          res.json({
            success: true,
            query: query || '',
            searchType: searchType || 'auto-detected',
            results: existingCommunities.slice(0, limit || 30),
            metadata: {
              totalFound: existingCommunities.length,
              existingCount: existingCommunities.length,
              discoveredCount: 0,
              sources: ['Database'],
              searchLocation: query,
              timestamp: new Date().toISOString(),
              aiConfidence: 0,
              timeout: true,
              status: 'partial',
              note: 'Discovery service timed out - showing existing communities only'
            },
            message: `Found ${existingCommunities.length} existing communities. Discovery service timed out while searching for new results.`
          });
        } else {
          // No existing results - indicate timeout clearly
          res.json({
            success: true,
            query: query || '',
            searchType: searchType || 'auto-detected',
            results: [],
            metadata: {
              totalFound: 0,
              existingCount: 0,
              discoveredCount: 0,
              sources: [],
              searchLocation: query,
              timestamp: new Date().toISOString(),
              aiConfidence: 0,
              timeout: true,
              status: 'timeout',
              retryAfterMs: 30000,
              note: 'Discovery service timed out before results could be retrieved'
            },
            message: `Discovery service timed out while searching for "${query}". This search is taking longer than expected. Please try again in a moment, or try searching for a specific city instead of a country.`
          });
        }
        return;
      } else {
        res.status(500).json({ 
          success: false,
          error: 'Failed to perform global search',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });
  
  // Get discovered communities pending approval (for admin dashboard)
  app.get('/api/global-discovery/pending', async (req, res) => {
    try {
      const pendingCommunities = await db.select()
        .from(communities)
        .where(
          and(
            eq(communities.enrichmentStatus, 'pending'),
            eq(communities.discoverySource, 'Global Discovery Search')
          )
        )
        .orderBy(communities.discoveryDate);
      
      res.json({
        success: true,
        communities: pendingCommunities,
        count: pendingCommunities.length
      });
    } catch (error) {
      console.error('Error fetching pending communities:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch pending communities' 
      });
    }
  });
  
  // Approve a discovered community
  app.post('/api/global-discovery/approve/:id', async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      
      const [updated] = await db.update(communities)
        .set({
          enrichmentStatus: 'completed',
          isVerified: true,
          data_source: 'Verified via Global Discovery',
          enrichmentHistory: sql`array_append(enrichment_history, ${JSON.stringify({
            timestamp: new Date().toISOString(),
            source: 'Admin Approval',
            fieldsUpdated: ['status_approved'],
            approvedBy: (req as any).user?.id || 'admin'
          })}::jsonb)`
        })
        .where(eq(communities.id, communityId))
        .returning();
      
      res.json({
        success: true,
        community: updated,
        message: 'Community approved successfully'
      });
    } catch (error) {
      console.error('Error approving community:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to approve community' 
      });
    }
  });
  
  // Reject a discovered community
  app.post('/api/global-discovery/reject/:id', async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      
      // Delete the rejected community
      await db.delete(communities)
        .where(
          and(
            eq(communities.id, communityId),
            eq(communities.enrichmentStatus, 'pending')
          )
        );
      
      res.json({
        success: true,
        message: 'Community rejected and removed'
      });
    } catch (error) {
      console.error('Error rejecting community:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to reject community' 
      });
    }
  });
  
  // AI Comparison endpoint for global discovery
  app.post('/api/global-discovery/compare', async (req, res) => {
    try {
      const { query } = req.body;
      console.log(`🌍 AI Comparison Search: "${query}"`);
      
      const results = {
        query,
        timestamp: new Date().toISOString(),
        providers: {} as Record<string, any>,
        summary: ''
      };
      
      // Test with Perplexity
      try {
        const perplexityQuery = `Find ONLY senior living communities in ${query}. List actual facility names, addresses, and contact details.`;
        const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'sonar', // Standard model for cost-effective search
            messages: [
              { role: 'system', content: 'List senior living facilities with accurate details.' },
              { role: 'user', content: perplexityQuery }
            ],
            web_search_options: {
              search_context_size: 'low' // Use low context to reduce costs
            },
            temperature: 0.1,
            max_tokens: 2000
          })
        });
        const perplexityData = await perplexityResponse.json();
        results.providers['perplexity'] = {
          response: perplexityData.choices[0]?.message?.content?.substring(0, 500),
          sources: perplexityData.citations || []
        };
      } catch (e) {
        results.providers['perplexity'] = { error: 'Failed to query Perplexity' };
      }
      
      // Test with Claude
      if (process.env.ANTHROPIC_API_KEY) {
        try {
          const Anthropic = require('@anthropic-ai/sdk');
          const anthropic = new Anthropic.Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
          const claudeResponse = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1000,
            messages: [{
              role: 'user',
              content: `List real senior living facilities in ${query}. Include actual names and addresses.`
            }]
          });
          results.providers['claude'] = {
            response: claudeResponse.content[0].text?.substring(0, 500)
          };
        } catch (e) {
          results.providers['claude'] = { error: 'Failed to query Claude' };
        }
      }
      
      // Test with ChatGPT
      if (process.env.OPENAI_API_KEY) {
        try {
          const OpenAI = require('openai');
          const openai = new OpenAI.default({ apiKey: process.env.OPENAI_API_KEY });
          const gptResponse = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{
              role: 'system',
              content: 'List real senior living facilities with accurate location data.'
            }, {
              role: 'user',
              content: `Find senior living communities in ${query}. List real facility names and addresses.`
            }],
            temperature: 0.1,
            max_tokens: 1000
          });
          results.providers['chatgpt'] = {
            response: gptResponse.choices[0]?.message?.content?.substring(0, 500)
          };
        } catch (e) {
          results.providers['chatgpt'] = { error: 'Failed to query ChatGPT' };
        }
      }
      
      // Summarize findings
      const activeProviders = Object.keys(results.providers).filter(p => !results.providers[p].error);
      results.summary = `Tested ${activeProviders.length} AI providers for "${query}". Active: ${activeProviders.join(', ')}`;
      
      res.json(results);
    } catch (error) {
      console.error('❌ AI comparison error:', error);
      res.status(500).json({ error: 'Comparison failed' });
    }
  });
  
  console.log('✅ Global Discovery routes initialized');
}
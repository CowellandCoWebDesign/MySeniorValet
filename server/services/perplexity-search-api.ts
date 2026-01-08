/**
 * 🚀 PERPLEXITY SEARCH API SERVICE
 * ===============================
 * Leverages the NEW Perplexity Search API (launched Sept 25, 2025)
 * - $5 per 1,000 requests (vs higher Sonar Pro costs)
 * - Raw search results with structured data
 * - Sub-document precision with ranked snippets
 * - Perfect for discovery operations across all MySeniorValet tabs
 */

import { aiTracker } from "./ai-tracker.service";

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  published_date?: string;
  domain: string;
}

interface SearchResponse {
  results: SearchResult[];
  query: string;
  total_results?: number;
}

interface SearchOptions {
  max_results?: number;          // 1-20 results (default: 10)
  max_tokens_per_page?: number; // Token limit per page (default: 1024)
  regional_filter?: string;     // ISO country code for regional targeting
  date_filter?: {               // Date range filtering
    start_date?: string;
    end_date?: string;
  };
  domain_allowlist?: string[];  // Up to 20 allowed domains
  domain_denylist?: string[];   // Up to 20 denied domains
}

export class PerplexitySearchAPI {
  private apiKey: string;
  private baseUrl = 'https://api.perplexity.ai';

  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️ Perplexity API key not found - Search API will not work');
    } else {
      console.log(`✅ Perplexity Search API initialized with key: ${this.apiKey.substring(0, 10)}...${this.apiKey.substring(this.apiKey.length - 4)}`);
    }
  }

  /**
   * Perform a raw search using Perplexity's actual Search API
   * Cost: $5 per 1,000 requests (significantly cheaper than chat completions)
   */
  async search(query: string, options: SearchOptions = {}): Promise<SearchResponse> {
    const startTime = Date.now();
    try {
      console.log(`🔍 Perplexity Search API: "${query}"`);
      
      if (!this.apiKey) {
        throw new Error('Perplexity API key not configured');
      }

      // Build request body with proper Search API parameters
      const requestBody: any = {
        query,
        max_results: options.max_results || 10,
        max_tokens_per_page: options.max_tokens_per_page || 1024
      };
      
      // Add optional parameters if provided
      if (options.regional_filter) requestBody.country = options.regional_filter;
      if (options.date_filter) requestBody.date_filter = options.date_filter;
      if (options.domain_allowlist) requestBody.domain_allowlist = options.domain_allowlist;
      if (options.domain_denylist) requestBody.domain_denylist = options.domain_denylist;

      // Use the actual Search API endpoint
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Search API error (${response.status}):`, errorText);
        const errorTime = Date.now() - startTime;
        // Track failed API call to database
        await aiTracker.trackPerplexityCall({
          action: 'search',
          context: 'perplexity_search_api',
          requestDuration: errorTime,
          success: false,
          errorMessage: `${response.status} - ${errorText}`,
          prompt: query,
        });
        throw new Error(`Search API failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const responseTime = Date.now() - startTime;
      console.log(`✅ Found ${data.results?.length || 0} search results (${responseTime}ms)`);
      
      // Track successful API call to database
      await aiTracker.trackPerplexityCall({
        action: 'search',
        context: 'perplexity_search_api',
        requestDuration: responseTime,
        success: true,
        inputTokens: Math.ceil(query.length / 4),
        outputTokens: Math.ceil(JSON.stringify(data).length / 4),
        prompt: query,
        response: JSON.stringify(data.results?.slice(0, 3)),
      });
      
      return {
        results: data.results || [],
        query: data.query || query,
        total_results: data.results?.length || 0
      };

    } catch (error) {
      // Track failed API call if not already tracked
      const responseTime = Date.now() - startTime;
      await aiTracker.trackPerplexityCall({
        action: 'search',
        context: 'perplexity_search_api',
        requestDuration: responseTime,
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        prompt: query,
      });
      console.error('❌ Perplexity Search API error:', error);
      throw error;
    }
  }

  /**
   * Search for businesses/services in a specific location
   * Optimized for MySeniorValet's service discovery needs
   */
  async searchBusinesses(businessType: string, location: string, options: SearchOptions = {}): Promise<SearchResponse> {
    // COMPLETELY NEW APPROACH: Query for actual business names directly
    let query = '';
    
    // Normalize business type for better matching
    const normalizedType = businessType.toLowerCase().trim();
    
    // Use specific queries that will return actual business names, not articles
    if (normalizedType.includes('restaurant') || normalizedType.includes('dining')) {
      // Ask for specific restaurant names, not articles about restaurants
      query = `list of popular restaurant names in ${location} with addresses`;
    } else if (normalizedType.includes('moving') || normalizedType.includes('movers')) {
      query = `moving company names in ${location} with phone numbers`;
    } else if (normalizedType.includes('hotel') || normalizedType.includes('lodging')) {
      query = `hotel names in ${location} with booking information`;
    } else if (normalizedType.includes('pharmacy') || normalizedType.includes('drugstore')) {
      query = `pharmacy names in ${location} CVS Walgreens Rite Aid`;
    } else if (normalizedType.includes('lawyer') || normalizedType.includes('attorney') || normalizedType.includes('legal')) {
      query = `law firm names in ${location} contact information`;
    } else if (normalizedType.includes('doctor') || normalizedType.includes('medical') || normalizedType.includes('clinic')) {
      query = `medical clinic names in ${location} doctors offices`;
    } else {
      // Generic query focusing on actual business names
      query = `list of ${businessType} business names in ${location}`;
    }
    
    console.log(`🔍 Business name search query: "${query}"`);
    
    // Don't restrict domains - let it search broadly for business names
    return this.search(query, {
      max_results: options.max_results || 20,
      ...options
    });
  }

  /**
   * Search for senior living communities
   * Specialized for community discovery
   */
  async searchSeniorCommunities(location: string, careType?: string, options: SearchOptions = {}): Promise<SearchResponse> {
    // Build more specific queries that will return actual community names
    let query = '';
    
    if (careType) {
      query = `${careType} assisted living memory care nursing homes "${location}" facility names addresses phone numbers`;
    } else {
      query = `senior living retirement communities assisted living "${location}" facility names contact information addresses`;
    }
    
    console.log(`🏠 Refined senior community search query: "${query}"`);
    
    return this.search(query, {
      max_results: options.max_results || 15,
      domain_allowlist: [
        'caring.com',
        'seniorhousing.net',
        'seniorliving.org',
        'assistedliving.com',
        'aplaceformom.com',
        'seniorlivingguide.com',
        'senioradvisor.com',
        'medicare.gov',
        'nursinghomes.org',
        'memorycare.com'
      ],
      ...options
    });
  }

  /**
   * Search for healthcare providers
   * Optimized for healthcare discovery
   */
  async searchHealthcareProviders(providerType: string, location: string, options: SearchOptions = {}): Promise<SearchResponse> {
    const query = `${providerType} healthcare providers in ${location}`;
    
    return this.search(query, {
      max_results: options.max_results || 15,
      domain_allowlist: [
        'healthgrades.com',
        'vitals.com',
        'zocdoc.com',
        'medicare.gov',
        'cms.gov',
        'npi.npes.cms.hhs.gov'
      ],
      ...options
    });
  }

  /**
   * Search for resources (legal, financial, etc.)
   * Optimized for resource discovery
   */
  async searchResources(resourceType: string, location: string, options: SearchOptions = {}): Promise<SearchResponse> {
    const query = `${resourceType} resources services in ${location}`;
    
    return this.search(query, {
      max_results: options.max_results || 15,
      domain_allowlist: [
        'martindale.com',
        'avvo.com',
        'lawyers.com',
        'findlaw.com',
        'nolo.com',
        'aarp.org'
      ],
      ...options
    });
  }

  /**
   * Validate if a business exists using the Search API
   * Much cheaper than using Sonar Pro for simple validation
   */
  async validateBusinessExists(businessName: string, location?: string): Promise<{
    exists: boolean;
    confidence: number;
    sources: string[];
  }> {
    try {
      const query = location 
        ? `"${businessName}" business in ${location}`
        : `"${businessName}" business`;

      const results = await this.search(query, {
        max_results: 5,
        max_tokens_per_page: 512
      });

      // Analyze results to determine if business exists
      const businessMentions = results.results.filter(result => 
        result.title.toLowerCase().includes(businessName.toLowerCase()) ||
        result.snippet.toLowerCase().includes(businessName.toLowerCase())
      );

      const exists = businessMentions.length > 0;
      const confidence = Math.min(businessMentions.length * 25, 100); // 25% per mention, max 100%
      const sources = businessMentions.map(result => result.domain);

      console.log(`🔍 Business validation: ${businessName} = ${exists ? 'EXISTS' : 'NOT FOUND'} (confidence: ${confidence}%)`);

      return {
        exists,
        confidence,
        sources: [...new Set(sources)] // Remove duplicates
      };

    } catch (error) {
      console.error('❌ Business validation error:', error);
      return {
        exists: true, // Default to exists if validation fails
        confidence: 0,
        sources: []
      };
    }
  }

  /**
   * Extract structured business data from search results
   * Intelligently handles both direct businesses AND article/guide sources
   */
  extractBusinessData(results: SearchResult[], businessType: string = 'service'): Array<{
    name: string;
    website?: string;
    description?: string;
    phone?: string;
    address?: string;
    source: string;
    confidence: number;
    isResource?: boolean;
    resourceType?: string;
  }> {
    const businesses: Array<{
      name: string;
      website?: string;
      description?: string;
      phone?: string;
      address?: string;
      source: string;
      confidence: number;
      isResource?: boolean;
      resourceType?: string;
    }> = [];

    for (const result of results) {
      // Extract name from title - but also look for business names in snippet
      let name = result.title;
      let phone: string | undefined;
      let address: string | undefined;
      
      // IDENTIFY ARTICLE/GUIDE PATTERNS - These are VALUABLE discovery sources!
      const articlePatterns = [
        { pattern: /^(the\s+)?(\d+\s+)?(best|top)\s+/i, type: 'curated_list' },
        { pattern: /^(ultimate|complete|definitive|essential)\s+guide/i, type: 'comprehensive_guide' },
        { pattern: /^guide\s+(to|for)\s+/i, type: 'guide' },
        { pattern: /\s+(guide|list|tips|masterclass|explained)$/i, type: 'educational_resource' },
        { pattern: /^where\s+(to\s+find|can\s+i\s+find)/i, type: 'location_guide' },
        { pattern: /^how\s+to\s+/i, type: 'how_to_guide' },
        { pattern: /\s+you\s+(must|should)\s+/i, type: 'recommendation_list' },
        { pattern: /^\d+\s+of\s+/i, type: 'numbered_list' },
        { pattern: /franchise\s+opportunities/i, type: 'business_directory' },
        // ADD MORE GENERIC PATTERNS TO FILTER OUT
        { pattern: /^list\s+of\s+/i, type: 'generic_list' },
        { pattern: /number\s+of\s+.*\s+businesses/i, type: 'statistics' },
        { pattern: /^find\s+.*\s+companies/i, type: 'directory' },
        { pattern: /the\s+secret\s+to/i, type: 'advice_article' },
        { pattern: /business\s+guide/i, type: 'business_guide' },
        { pattern: /food\s+guide/i, type: 'food_guide' }
      ];
      
      // Check if this is an article/guide
      let isArticle = false;
      let resourceType = 'direct_business';
      
      for (const { pattern, type } of articlePatterns) {
        if (pattern.test(name)) {
          isArticle = true;
          resourceType = type;
          console.log(`📚 Found ${type}: "${name}" - This is a valuable discovery source!`);
          break;
        }
      }
      
      // Clean up the name
      const originalName = name;
      name = name.replace(/\s*[-|]\s*.*$/, ''); // Remove everything after dash or pipe
      name = name.replace(/\s*\(.*\)/, ''); // Remove content in parentheses  
      name = name.replace(/,\s+à\s+.*$/, ''); // Remove location suffixes
      name = name.replace(/\s+in\s+[A-Z][\w\s]*$/i, ''); // Remove "in City" suffixes
      name = name.trim();
      
      // For articles/guides, we want to KEEP them as discovery sources
      if (isArticle) {
        // Articles are valuable - they contain lists of real businesses!
        businesses.push({
          name: originalName, // Keep full article title
          website: result.url,
          description: result.snippet,
          source: `search_api_${result.domain}`,
          confidence: 95, // High confidence for curated content
          isResource: true,
          resourceType: resourceType
        });
        console.log(`✅ Saved as discovery resource: "${originalName}" (type: ${resourceType})`);
        
        // TODO: In the future, we can crawl this URL with Sonar API 
        // to extract the actual business names mentioned in the article
        continue;
      }
      
      // Try to extract phone and address from snippet
      const phoneMatch = result.snippet.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
      if (phoneMatch) {
        phone = phoneMatch[0];
        console.log(`📞 Extracted phone from snippet: ${phone}`);
      }
      
      // Try to extract address patterns
      const addressMatch = result.snippet.match(/\d+\s+[A-Za-z\s]+(?:St|Street|Ave|Avenue|Blvd|Boulevard|Rd|Road|Dr|Drive|Ln|Lane|Way|Pkwy|Parkway|Plaza|Place|Ct|Court)/i);
      if (addressMatch) {
        address = addressMatch[0];
        console.log(`📍 Extracted address from snippet: ${address}`);
      }
      
      // For direct businesses, apply validation
      if (name.length > 80) {
        console.log(`⚠️ Name too long, might be article: "${name}"`);
        // Still save it as a potential resource
        businesses.push({
          name: originalName,
          website: result.url,
          description: result.snippet,
          phone,
          address,
          source: `search_api_${result.domain}`,
          confidence: 60,
          isResource: true,
          resourceType: 'potential_article'
        });
        continue;
      }
      
      const wordCount = name.split(/\s+/).length;
      
      // Check for business indicators
      const businessIndicators = /\b(hotel|motel|hostel|cafe|café|coffee|pharmacy|pharmacie|restaurant|ristorante|trattoria|osteria|pizzeria|bistro|brasserie|bar|pub|shop|store|boutique|market|clinic|center|centre|hospital|medical|dental|inc|llc|ltd|corp|co|company|group|services?|resort|inn|lodge|suites?|plaza|tower|place|mansion|villa|residence)\b/i;
      const hasBusinessIndicator = businessIndicators.test(name);
      
      // Check source credibility
      const listingSites = [
        'tripadvisor',
        'yelp',
        'foursquare',
        'timeout',
        'thrillist',
        'eater',
        'zagat',
        'michelin'
      ];
      
      const isFromListingSite = result.domain ? listingSites.some(site => 
        result.domain.toLowerCase().includes(site)
      ) : false;
      
      // Calculate confidence
      let confidence = 70; // Base confidence
      
      if (hasBusinessIndicator) confidence += 15;
      if (!isFromListingSite) confidence += 10;
      if (wordCount <= 5) confidence += 5;
      
      // Save everything - both direct businesses and potential resources
      businesses.push({
        name,
        website: result.url,
        description: result.snippet,
        phone,
        address,
        source: `search_api_${result.domain}`,
        confidence,
        isResource: false,
        resourceType: 'direct_business'
      });
      
      console.log(`✅ Accepted: "${name}" (confidence: ${confidence}%, type: direct_business${phone ? ' with phone' : ''}${address ? ' with address' : ''})`);
    }

    console.log(`📊 Extracted ${businesses.filter(b => !b.isResource).length} businesses and ${businesses.filter(b => b.isResource).length} discovery resources`);
    return businesses;
  }

  /**
   * Verify if a city/location exists using Search API
   * Replaces expensive sonar-pro city verification calls
   * Cost: ~$0.005 per call vs $0.015+ for Sonar Pro
   */
  async verifyCityExists(city: string, state?: string): Promise<{
    exists: boolean;
    normalizedName: string;
    country: string;
    confidence: number;
    sources: string[];
  }> {
    try {
      const locationQuery = state ? `${city}, ${state}` : city;
      const query = `"${locationQuery}" city population location information`;

      const results = await this.search(query, {
        max_results: 5,
        max_tokens_per_page: 512
      });

      // Analyze results to determine if city exists
      const cityMentions = results.results.filter(result => {
        const lowerTitle = result.title.toLowerCase();
        const lowerSnippet = result.snippet.toLowerCase();
        const lowerCity = city.toLowerCase();
        return lowerTitle.includes(lowerCity) || lowerSnippet.includes(lowerCity);
      });

      const exists = cityMentions.length > 0;
      const confidence = Math.min(cityMentions.length * 25, 100);
      
      // Try to extract country from snippets
      let country = 'United States';
      const countryPatterns = [
        { pattern: /\bcanada\b/i, country: 'Canada' },
        { pattern: /\buk\b|\bunited kingdom\b|\bengland\b/i, country: 'United Kingdom' },
        { pattern: /\baustralia\b/i, country: 'Australia' },
        { pattern: /\bfrance\b/i, country: 'France' },
        { pattern: /\bgermany\b/i, country: 'Germany' },
        { pattern: /\buae\b|\bdubai\b|\bunited arab emirates\b/i, country: 'United Arab Emirates' },
      ];

      for (const result of cityMentions) {
        for (const { pattern, country: c } of countryPatterns) {
          if (pattern.test(result.snippet)) {
            country = c;
            break;
          }
        }
      }

      console.log(`🏙️ City verification: ${locationQuery} = ${exists ? 'EXISTS' : 'NOT FOUND'} (confidence: ${confidence}%)`);

      return {
        exists,
        normalizedName: city,
        country,
        confidence,
        sources: cityMentions.map(r => r.domain)
      };

    } catch (error) {
      console.error('❌ City verification error:', error);
      return {
        exists: true, // Default to exists if verification fails
        normalizedName: city,
        country: 'United States',
        confidence: 0,
        sources: []
      };
    }
  }

  /**
   * Discover senior living communities in a location
   * Returns structured data for community discovery
   * Cost: $0.005 per request vs $0.03+ for Sonar Pro with high context
   * 
   * FILTERING PIPELINE (Jan 2026):
   * 1. Entity type detection - exclude referral services, directories, articles
   * 2. Required fields validation - must have (phone OR website) to be actionable
   * 3. Quality scoring - 0-100 threshold (minimum 60 to be included)
   * 4. Location matching - bonus points for results matching queried location
   */
  async discoverCommunities(location: string, options: {
    careType?: string;
    limit?: number;
  } = {}): Promise<{
    communities: Array<{
      name: string;
      address?: string;
      city?: string;
      state?: string;
      phone?: string;
      website?: string;
      careTypes?: string[];
      source: string;
      confidence: number;
    }>;
    sources: string[];
    searchQuery: string;
  }> {
    const careType = options.careType || '';
    const query = careType
      ? `${careType} senior living communities facilities in "${location}" names addresses phone numbers websites`
      : `senior living assisted living memory care communities in "${location}" facility names addresses contact information`;

    console.log(`🏠 Discovering communities in ${location}: "${query}"`);

    const results = await this.search(query, {
      max_results: options.limit || 15,
      domain_allowlist: [
        'caring.com',
        'seniorhousing.net', 
        'seniorliving.org',
        'assistedliving.com',
        'aplaceformom.com',
        'seniorlivingguide.com',
        'senioradvisor.com',
        'medicare.gov'
      ]
    });

    // ========== AGGREGATOR/REFERRAL SERVICE EXCLUSION LIST ==========
    // These are NOT actual senior living communities - they are referral/placement services
    // NOTE: We match against TITLES only (not snippets) to avoid blocking legitimate community listings
    const AGGREGATOR_TITLE_PATTERNS = [
      /\bcarepatrol\b/i,
      /\ba\s*place\s*for\s*mom\b/i,
      /\bseniorly\b/i,
      /\boasis\s+senior\s+advisors?\b/i,
      /\bsenior\s+care\s+authority\b/i,
      /\bassisted\s+living\s+locators?\b/i,
      /\bsenior\s+living\s+advisors?\b/i,
      /\beldercare\s+locator\b/i,
      /\bplacement\s+services?\b/i,
      /\bsenior\s+placement\b/i,
      /\bsenior\s+care\s+finder\b/i,
      // Home care agencies (not residential communities)
      /\bhome\s+care\s+assistance\b/i,
      /\bcomfort\s+keepers\b/i,
      /\bvisiting\s+angels\b/i,
      /\bright\s+at\s+home\b/i,
      /\bfirstlight\s+home\s+care\b/i,
      /\bsenior\s+helpers\b/i,
      /\bhome\s+instead\b/i,
      /\bbrightstar\s+care\b/i,
      /\binterim\s+healthcare\b/i,
    ];

    // ========== ARTICLE/GUIDE PATTERNS ==========
    // Use word boundaries to avoid false positives (e.g., "Liston House" matching "list")
    const ARTICLE_PATTERNS = [
      /^(the\s+)?(\d+\s+)?(best|top)\s+/i,        // "The 10 Best...", "Top..."
      /\bguide\s+(to|for)\b/i,                     // "Guide to...", "Guide for..."
      /\bcomplete\s+guide\b/i,                     // "Complete Guide"
      /\bhow\s+to\s+(find|choose|select)\b/i,      // "How to Find..."
      /\btips\s+(for|on)\b/i,                      // "Tips for..."
      /\bexplained\b/i,                            // "...Explained"
      /\bversus\b|\bvs\.?\s+\b/i,                  // "A vs B"
      /\bcompared\b/i,                             // "...Compared"
      /^find\s+.*\s+(near|in)\s+/i,                // "Find X near..."
      /^search\s+(for\s+)?/i,                      // "Search for..."
      /^\d+\s+things?\s+/i,                        // "10 Things..."
      /^what\s+(is|are)\s+/i,                      // "What is..."
      /\breview(s|ed)?\s+of\b/i,                   // "Reviews of..."
      /\bdirectory\s+of\b/i,                       // "Directory of..."
      /\blisting(s)?\s+of\b/i,                     // "Listings of..."
      /\bcost(s)?\s+of\b/i,                        // "Costs of..." (pricing articles)
      /\bpricing\s+(guide|information)\b/i,        // "Pricing Guide"
    ];

    // ========== GENERIC LIST TITLE PATTERNS ==========
    // These are page titles from aggregator sites, NOT actual community names
    // Real communities have proper nouns like "Brookdale", "Sunrise at...", "The Arbors"
    // Generic titles describe CATEGORIES, not specific facilities
    const GENERIC_LIST_TITLE_PATTERNS = [
      // Pattern: "[Number] [Care Type] in [Location]" - e.g., "38 Assisted Living Facilities in Tulsa County"
      /^\d+\s+(?:assisted\s+living|senior\s+living|memory\s+care|nursing\s+home|retirement|independent\s+living|skilled\s+nursing|ccrc)s?\s+(?:facilities|communities|homes|centers?)?\s*(?:in|near)\s+/i,
      
      // Pattern: "[Care Type] in [Location]" - e.g., "Assisted Living Facilities in Tulsa"
      /^(?:assisted\s+living|senior\s+living|memory\s+care|nursing\s+home|retirement|independent\s+living|skilled\s+nursing)s?\s+(?:facilities|communities|homes|centers?)?\s*(?:in|near)\s+\w/i,
      
      // Pattern: "[Location], [State] [Care Type]" - e.g., "Tulsa, Oklahoma Assisted Living Facilities & Senior Care"
      /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,?\s+(?:[A-Z]{2}|[A-Z][a-z]+)\s+(?:assisted\s+living|senior\s+living|memory\s+care)/i,
      
      // Pattern: "[Care Type] [Location] County" - e.g., "Memory care facilities in Tulsa County"
      /^(?:memory\s+care|senior\s+living|assisted\s+living)\s+(?:facilities|communities|homes)?\s*(?:in\s+)?[A-Z][a-z]+\s+County/i,
      
      // Pattern: "CCRCs & Senior Living in [Location]"
      /^CCRCs?\s*[&+]\s*(?:Senior\s+Living|Assisted\s+Living|Memory\s+Care)\s+(?:in|near)\s+/i,
      
      // Pattern: "[Care Type] [Location]" without "in" - e.g., "Senior Living Tulsa County"
      /^(?:Senior\s+Living|Memory\s+Care|Assisted\s+Living)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?(?:\s+County)?$/i,
      
      // Pattern: "Accredited [Care Type] in [Location]" - e.g., "Accredited Independent Senior Living in Tulsa"
      /^(?:Accredited|Certified|Licensed)\s+(?:Independent\s+)?(?:Senior\s+Living|Assisted\s+Living|Memory\s+Care)\s+(?:in|near)\s+/i,
      
      // Pattern: "[PDF] [anything]" - PDF documents are never community names
      /^\[PDF\]\s+/i,
      
      // Pattern: "Find [anything] in/for [Location]" - e.g., "Find THE BEST Assisted Living Facilities for Seniors in Glendale"
      /^find\s+.+\s+(?:in|for|near)\s+/i,
      
      // Pattern: "[Care Type] and Costs in [Location]" - e.g., "Assisted Living Facilities and Costs in Jackson"
      /(?:facilities|communities|homes)\s+and\s+(?:costs?|pricing)\s+in\s+/i,
      
      // Pattern: "Continuing Care Retirement Community" - generic category, not a name
      /^Continuing\s+Care\s+Retirement\s+Community$/i,
      
      // Pattern: "Alzheimers, Dementia and Memory Care Facilities in" 
      /^Alzheimers?,?\s*(?:Dementia)?\s*(?:and|&)?\s*Memory\s+Care\s+(?:Facilities|Communities)\s+(?:in|near)\s+/i,
      
      // Pattern: "List of [anything]" - e.g., "List of Independent Living Facilities in Jackson"
      /^list\s+of\s+/i,
      
      // Pattern: "Luxury [Care Type] [City]" - e.g., "Luxury Senior Living Glendale"
      /^Luxury\s+(?:Senior|Assisted)\s+(?:Living|Care)\s+[A-Z][a-z]+$/i,
      
      // Pattern: Generic tool names - "Facility Finder", "Care Locator"
      /^(?:facility|care|senior)\s+(?:finder|locator|search|directory)$/i,
      
      // Pattern: Script/technical artifacts - "Draft a target schema..."
      /^(?:draft|create|design|build|target|schema)\s+a?\s+/i,
      
      // Pattern: "55+ Communities" variations - e.g., "55+ Communities & Senior Living in Daytona Beach, Florida"
      /^55\+\s*(?:communities|living|housing)/i,
      /55\+\s*(?:communities|living)\s*(?:&|and)\s*(?:senior\s+living|retirement)/i,
      
      // Pattern: "[Age]+ [Type] in [Location]" - e.g., "55+ Active Adult Communities in Phoenix"
      /^\d+\+\s*(?:active\s+)?(?:adult|senior)\s+(?:communities|living|housing)\s+(?:in|near)\s+/i,
      
      // Pattern: "Best [anything] in [Location]" - aggregator/list titles
      /^best\s+.+\s+(?:in|near|for)\s+/i,
      
      // Pattern: "Top [Number] [anything]" - list titles
      /^top\s+\d+\s+/i,
      
      // Pattern: "[Location] Senior Living" where location is just a city name (2-3 words max)
      /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\s+(?:Senior\s+Living|Assisted\s+Living|Memory\s+Care)$/i,
    ];

    // ========== TOLL-FREE REFERRAL SERVICE NUMBERS ==========
    // These prefixes (800, 833, 844, 855, 866, 877, 888) indicate referral services, NOT direct community lines
    const TOLL_FREE_PREFIXES = ['800', '833', '844', '855', '866', '877', '888'];

    // ========== COMMUNITY-INDICATIVE KEYWORDS ==========
    const COMMUNITY_KEYWORDS = [
      'senior living',
      'assisted living',
      'memory care',
      'independent living',
      'skilled nursing',
      'nursing home',
      'retirement community',
      'continuing care',
      'ccrc',
      'alzheimer',
      'dementia care',
      'residential care',
      'board and care',
      'adult family home',
      'personal care home',
    ];

    // Extract community data from search results with smart filtering
    const communities: Array<{
      name: string;
      address?: string;
      city?: string;
      state?: string;
      phone?: string;
      website?: string;
      careTypes?: string[];
      source: string;
      confidence: number;
    }> = [];

    for (const result of results.results) {
      const originalName = result.title;
      const lowerName = originalName.toLowerCase();
      const lowerSnippet = result.snippet.toLowerCase();
      
      // ========== PHASE 1: ENTITY TYPE DETECTION ==========
      
      // Check if this is an aggregator/referral service (match title only to avoid blocking listings)
      const isAggregator = AGGREGATOR_TITLE_PATTERNS.some(pattern => pattern.test(originalName));
      if (isAggregator) {
        console.log(`🚫 Skipping aggregator/referral service: "${originalName}"`);
        continue;
      }

      // Check if this is an article/guide
      const isArticle = ARTICLE_PATTERNS.some(pattern => pattern.test(originalName));
      if (isArticle) {
        console.log(`📰 Skipping article/guide: "${originalName}"`);
        continue;
      }

      // Check if this is a generic list title (category description, not a community name)
      const isGenericListTitle = GENERIC_LIST_TITLE_PATTERNS.some(pattern => pattern.test(originalName));
      if (isGenericListTitle) {
        console.log(`📋 Skipping generic list title: "${originalName}"`);
        continue;
      }

      // Check for toll-free referral service phone numbers in snippet
      const snippetPhoneMatch = result.snippet.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
      if (snippetPhoneMatch) {
        const phoneDigits = snippetPhoneMatch[0].replace(/\D/g, '');
        const areaCode = phoneDigits.substring(0, 3);
        if (TOLL_FREE_PREFIXES.includes(areaCode)) {
          console.log(`📞 Skipping toll-free referral number (${areaCode}): "${originalName}"`);
          continue;
        }
      }

      // ========== PHASE 2: NAME CLEANING ==========
      let name = originalName;
      name = name.replace(/\s*[-|–—]\s*.*$/, ''); // Remove everything after dash/pipe
      name = name.replace(/\s*\(.*\)/, ''); // Remove parentheses content
      name = name.replace(/,\s+(AL|FL|TX|CA|NY|GA|NC|AZ|PA|OH|IL|MI|WA|CO|TN|MO|IN|MA|VA|NJ|MD|MN|WI|SC|OR|KY|OK|CT|UT|LA|NV|IA|AR|MS|KS|NM|NE|WV|ID|HI|ME|NH|RI|MT|DE|SD|ND|AK|DC|VT|WY)$/i, ''); // Remove state suffix
      name = name.trim();
      
      // Skip if name is too short, too long, or generic
      if (name.length < 5 || name.length > 80) {
        console.log(`⚠️ Skipping invalid name length: "${name}"`);
        continue;
      }

      // ========== PHASE 3: QUALITY SCORING ==========
      let qualityScore = 50; // Base score
      
      // +20 points: Has community-indicative keywords in title or snippet
      const hasCommunityKeywords = COMMUNITY_KEYWORDS.some(kw => 
        lowerName.includes(kw) || lowerSnippet.includes(kw)
      );
      if (hasCommunityKeywords) qualityScore += 20;

      // Extract contact info (excluding toll-free referral numbers)
      const allPhoneMatches = result.snippet.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g) || [];
      let phone: string | undefined = undefined;
      for (const match of allPhoneMatches) {
        const digits = match.replace(/\D/g, '');
        const areaCode = digits.substring(0, 3);
        if (!TOLL_FREE_PREFIXES.includes(areaCode)) {
          phone = match;
          break; // Use first non-toll-free number
        }
      }

      const addressMatch = result.snippet.match(/\d+\s+[A-Za-z\s]+(?:St|Street|Ave|Avenue|Blvd|Boulevard|Rd|Road|Dr|Drive|Ln|Lane|Way|Pkwy|Parkway|Place|Pl|Circle|Cir|Court|Ct)/i);
      const address = addressMatch ? addressMatch[0] : undefined;

      // +15 points: Has LOCAL phone number (not toll-free)
      if (phone) qualityScore += 15;

      // +15 points: Has address
      if (address) qualityScore += 15;

      // +10 points: Website is from trusted domain
      const trustedDomains = ['caring.com', 'seniorhousing.net', 'medicare.gov', 'seniorliving.org'];
      if (trustedDomains.some(d => result.domain?.includes(d))) qualityScore += 10;

      // +5 points: Location matches in snippet
      const locationParts = location.toLowerCase().split(/[,\s]+/).filter(p => p.length > 2);
      const locationMatch = locationParts.some(part => lowerSnippet.includes(part));
      if (locationMatch) qualityScore += 5;

      // -10 points: Name has too many words (might be an article)
      if (name.split(/\s+/).length > 8) qualityScore -= 10;

      // -15 points: No contact info at all
      if (!phone && !address && !result.url) qualityScore -= 15;

      // ========== PHASE 4: THRESHOLD FILTER ==========
      const MINIMUM_QUALITY_SCORE = 60;
      if (qualityScore < MINIMUM_QUALITY_SCORE) {
        console.log(`📉 Skipping low-quality result (score: ${qualityScore}): "${name}"`);
        continue;
      }

      // ========== PHASE 5: REQUIRED FIELDS VALIDATION ==========
      // Must have at least (phone OR website) to be actionable
      if (!phone && !result.url) {
        console.log(`📋 Skipping entry without contact info: "${name}"`);
        continue;
      }

      // Detect care types from snippet
      const careTypes: string[] = [];
      if (/assisted\s+living/i.test(result.snippet)) careTypes.push('Assisted Living');
      if (/memory\s+care/i.test(result.snippet)) careTypes.push('Memory Care');
      if (/independent\s+living/i.test(result.snippet)) careTypes.push('Independent Living');
      if (/skilled\s+nursing/i.test(result.snippet)) careTypes.push('Skilled Nursing');
      if (/nursing\s+home/i.test(result.snippet)) careTypes.push('Skilled Nursing');
      if (/continuing\s+care|ccrc/i.test(result.snippet)) careTypes.push('Continuing Care');

      communities.push({
        name,
        address,
        phone,
        website: result.url,
        careTypes: careTypes.length > 0 ? careTypes : undefined,
        source: `search_api_${result.domain}`,
        confidence: qualityScore
      });

      console.log(`✅ Accepted community (score: ${qualityScore}): "${name}"${phone ? ' [has phone]' : ''}${address ? ' [has address]' : ''}`);
    }

    console.log(`✅ Discovered ${communities.length} verified communities in ${location} (filtered from ${results.results?.length || 0} results)`);

    return {
      communities,
      sources: results.results.map(r => r.url),
      searchQuery: query
    };
  }

  /**
   * Get enrichment data for a specific community
   * Uses Search API to find community details
   * Cost: $0.005 per request
   */
  async enrichCommunity(communityName: string, location: string): Promise<{
    found: boolean;
    data: {
      description?: string;
      phone?: string;
      website?: string;
      address?: string;
      pricing?: string;
      careTypes?: string[];
      amenities?: string[];
      ratings?: string;
    };
    sources: string[];
  }> {
    const query = `"${communityName}" ${location} senior living community phone address pricing reviews`;

    console.log(`📋 Enriching community: ${communityName} in ${location}`);

    const results = await this.search(query, {
      max_results: 10,
      max_tokens_per_page: 1024
    });

    // Check if we found relevant results
    const relevantResults = results.results.filter(r => 
      r.title.toLowerCase().includes(communityName.toLowerCase().split(' ')[0]) ||
      r.snippet.toLowerCase().includes(communityName.toLowerCase())
    );

    if (relevantResults.length === 0) {
      return { found: false, data: {}, sources: [] };
    }

    // Combine snippets for description
    const description = relevantResults
      .slice(0, 3)
      .map(r => r.snippet)
      .join(' ')
      .substring(0, 1000);

    // Extract phone
    const phoneMatch = description.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    
    // Extract care types
    const careTypes: string[] = [];
    if (/assisted\s+living/i.test(description)) careTypes.push('Assisted Living');
    if (/memory\s+care/i.test(description)) careTypes.push('Memory Care');
    if (/independent\s+living/i.test(description)) careTypes.push('Independent Living');
    if (/skilled\s+nursing/i.test(description)) careTypes.push('Skilled Nursing');

    // Extract pricing mentions
    const pricingMatch = description.match(/\$[\d,]+(?:\s*[-–]\s*\$[\d,]+)?(?:\s*(?:per\s+)?(?:month|monthly))?/i);

    // Extract ratings
    const ratingMatch = description.match(/(\d\.?\d?)\s*(?:\/\s*5|stars?|out\s+of\s+5)/i);

    return {
      found: true,
      data: {
        description,
        phone: phoneMatch ? phoneMatch[0] : undefined,
        website: relevantResults[0]?.url,
        pricing: pricingMatch ? pricingMatch[0] : undefined,
        careTypes: careTypes.length > 0 ? careTypes : undefined,
        ratings: ratingMatch ? `${ratingMatch[1]}/5` : undefined
      },
      sources: relevantResults.map(r => r.url)
    };
  }

  /**
   * Search for news and market intelligence about senior living
   * Cost: $0.005 per request
   */
  async searchMarketIntelligence(topic: string, location?: string): Promise<SearchResponse> {
    const query = location
      ? `${topic} senior living industry news ${location} 2025`
      : `${topic} senior living industry news trends 2025`;

    return this.search(query, {
      max_results: 10,
      date_filter: {
        start_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Last 90 days
      }
    });
  }

  /**
   * Search for business/service intelligence (restaurants, vendors, etc.)
   * Migrated from routes.ts Sonar Pro fallback - uses Search API instead
   * Cost: $0.005 per request vs ~$0.02-0.10+ for Sonar Pro
   */
  async searchBusinessIntelligence(
    serviceName: string,
    location: string,
    serviceType: string = 'business'
  ): Promise<{
    found: boolean;
    data: {
      description?: string;
      website?: string;
      phone?: string;
      email?: string;
      address?: string;
      hours?: string;
      rating?: string;
      services?: string[];
    };
    photos: string[];
    sources: string[];
  }> {
    const query = `"${serviceName}" ${location} ${serviceType} phone address website hours reviews`;

    console.log(`🏪 Business intelligence search: ${serviceName} in ${location}`);

    const results = await this.search(query, {
      max_results: 15,
      max_tokens_per_page: 1024
    });

    if (!results.results || results.results.length === 0) {
      return { found: false, data: {}, photos: [], sources: [] };
    }

    // Combine snippets from relevant results
    const combinedText = results.results
      .map(r => `${r.title} ${r.snippet}`)
      .join(' ');

    // Extract phone
    const phoneMatch = combinedText.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);

    // Extract website - prefer the first result that's not a directory site
    const websiteResult = results.results.find(r => 
      !r.domain.includes('yelp.com') &&
      !r.domain.includes('tripadvisor.com') &&
      !r.domain.includes('facebook.com') &&
      !r.domain.includes('google.com')
    );

    // Extract email
    const emailMatch = combinedText.match(/[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}/);

    // Extract rating
    const ratingMatch = combinedText.match(/(\d\.?\d?)\s*(?:\/\s*5|stars?|out\s+of\s+5)/i);

    // Extract hours patterns
    const hoursMatch = combinedText.match(/(?:hours?|open)\s*:?\s*([^.]+(?:am|pm)[^.]*)/i);

    // Extract photos from result URLs (image CDNs)
    const photos: string[] = [];
    for (const result of results.results) {
      if (/\.(jpg|jpeg|png|webp|gif)(?:\?|$)/i.test(result.url)) {
        photos.push(result.url);
      }
      // Extract image URLs from snippets
      const imgMatches = result.snippet.match(/https?:\/\/[^\s"<>]+\.(?:jpg|jpeg|png|webp|gif)/gi);
      if (imgMatches) {
        photos.push(...imgMatches.filter(url => !photos.includes(url)));
      }
    }

    return {
      found: true,
      data: {
        description: results.results.slice(0, 3).map(r => r.snippet).join(' ').substring(0, 1500),
        website: websiteResult?.url,
        phone: phoneMatch?.[0],
        email: emailMatch?.[0],
        rating: ratingMatch ? `${ratingMatch[1]}/5` : undefined,
        hours: hoursMatch?.[1]?.trim()
      },
      photos: photos.slice(0, 10),
      sources: results.results.map(r => r.url)
    };
  }

  /**
   * Unified discovery method for all MySeniorValet tabs with PRICING TRANSPARENCY
   * Supports: communities, services, healthcare, resources
   * Each category uses its own query builder, filtering, and extraction logic
   * Cost: $5 per 1,000 requests via Search API
   */
  async discoverEntities(
    query: string,
    discoveryType: 'communities' | 'services' | 'healthcare' | 'resources',
    options: { limit?: number; location?: string } = {}
  ): Promise<{
    results: Array<{
      name: string;
      address?: string;
      city?: string;
      state?: string;
      phone?: string;
      website?: string;
      description?: string;
      pricing?: string;
      hours?: string;
      services?: string[];
      source: string;
      confidence: number;
      entityType: string;
    }>;
    sources: string[];
    searchQuery: string;
    aiNarrative?: string;
  }> {
    const location = options.location || query;
    const limit = options.limit || 15;

    // ========== CATEGORY-SPECIFIC QUERY BUILDERS ==========
    let searchQuery = '';
    let domainAllowlist: string[] = [];
    
    switch (discoveryType) {
      case 'communities':
        // Senior living - pricing and availability focus
        searchQuery = `senior living assisted living memory care communities in "${location}" pricing costs monthly rates availability facility names addresses phone`;
        domainAllowlist = [
          'caring.com', 'seniorhousing.net', 'seniorliving.org', 
          'assistedliving.com', 'aplaceformom.com', 'medicare.gov'
        ];
        break;
        
      case 'services':
        // Daycare, home care, meal delivery - pricing tiers focus
        searchQuery = `${query} senior services in ${location} pricing rates costs packages hours phone address`;
        domainAllowlist = []; // Allow all domains for services
        break;
        
      case 'healthcare':
        // Doctors, clinics, hospitals - costs and insurance focus
        searchQuery = `${query} healthcare providers medical doctors clinics in ${location} costs insurance accepted pricing address phone`;
        domainAllowlist = [
          'healthgrades.com', 'vitals.com', 'zocdoc.com', 
          'medicare.gov', 'yelp.com', 'google.com'
        ];
        break;
        
      case 'resources':
        // Senior centers, food programs, legal aid - programs and eligibility focus
        searchQuery = `${query} senior resources support services in ${location} programs eligibility hours address phone`;
        domainAllowlist = [
          'aarp.org', 'eldercare.acl.gov', 'benefits.gov',
          'medicare.gov', 'ssa.gov'
        ];
        break;
    }

    console.log(`🔍 [${discoveryType.toUpperCase()}] Discovery query: "${searchQuery}"`);

    // Execute search
    const searchOptions: any = {
      max_results: limit,
    };
    if (domainAllowlist.length > 0) {
      searchOptions.domain_allowlist = domainAllowlist;
    }
    
    const results = await this.search(searchQuery, searchOptions);

    // ========== CATEGORY-SPECIFIC EXTRACTION & FILTERING ==========
    const entities: Array<{
      name: string;
      address?: string;
      city?: string;
      state?: string;
      phone?: string;
      website?: string;
      description?: string;
      pricing?: string;
      hours?: string;
      services?: string[];
      source: string;
      confidence: number;
      entityType: string;
    }> = [];

    // Universal exclusion patterns (aggregators, articles)
    const EXCLUDE_PATTERNS = [
      /^(the\s+)?(\d+\s+)?(best|top)\s+/i,
      /\bguide\s+(to|for)\b/i,
      /^\d+\s+(?:best|top|things?)/i,
      /\b(a\s+place\s+for\s+mom|seniorly|caring\.com\s+reviews?)\b/i,
      /\bdirectory\s+of\b/i,
      /^find\s+.*\s+(near|in)\s+/i,
      /^list\s+of\s+/i,
    ];

    // Toll-free prefixes (referral services, not direct lines)
    const TOLL_FREE_PREFIXES = ['800', '833', '844', '855', '866', '877', '888'];

    for (const result of results.results) {
      const originalTitle = result.title;
      
      // Skip aggregator/article patterns
      if (EXCLUDE_PATTERNS.some(pattern => pattern.test(originalTitle))) {
        console.log(`📰 [${discoveryType}] Skipping article/aggregator: "${originalTitle}"`);
        continue;
      }

      // Clean the name
      let name = originalTitle;
      name = name.replace(/\s*[-|–—]\s*.*$/, ''); // Remove after dash/pipe
      name = name.replace(/\s*\(.*\)/, ''); // Remove parentheses
      name = name.trim();

      // Skip very short or very long names
      if (name.length < 3 || name.length > 100) {
        continue;
      }

      // Extract phone (skip toll-free for communities, allow for services)
      const allPhones = result.snippet.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g) || [];
      let phone: string | undefined;
      for (const p of allPhones) {
        const digits = p.replace(/\D/g, '');
        const areaCode = digits.substring(0, 3);
        // For communities, skip toll-free; for services/healthcare/resources, allow them
        if (discoveryType === 'communities' && TOLL_FREE_PREFIXES.includes(areaCode)) {
          continue;
        }
        phone = p;
        break;
      }

      // Extract address
      const addressMatch = result.snippet.match(/\d+\s+[A-Za-z\s]+(?:St|Street|Ave|Avenue|Blvd|Boulevard|Rd|Road|Dr|Drive|Ln|Lane|Way|Pkwy|Parkway|Place|Pl|Circle|Cir|Court|Ct)/i);
      const address = addressMatch ? addressMatch[0] : undefined;

      // Extract pricing mentions (key for transparency!)
      const pricingPatterns = [
        /\$[\d,]+(?:\s*[-–]\s*\$[\d,]+)?(?:\s*(?:per\s+)?(?:month|monthly|day|daily|hour|hourly|visit|session))?/gi,
        /(?:starting\s+(?:at|from)\s+)?\$[\d,]+/gi,
        /(?:costs?|rates?|pricing|fees?):\s*\$[\d,]+/gi,
        /free|no\s+cost|sliding\s+scale/gi
      ];
      let pricing: string | undefined;
      for (const pattern of pricingPatterns) {
        const match = result.snippet.match(pattern);
        if (match) {
          pricing = match[0];
          break;
        }
      }

      // Extract hours
      const hoursMatch = result.snippet.match(/(?:hours?|open)\s*:?\s*([^.]+(?:am|pm|AM|PM)[^.]*)/i);
      const hours = hoursMatch ? hoursMatch[1].trim() : undefined;

      // Parse city/state from location parameter
      let city = '';
      let state = '';
      if (location) {
        if (location.includes(',')) {
          const parts = location.split(',').map(p => p.trim());
          city = parts[0] || '';
          state = parts[1] || '';
        } else {
          // Try to parse "City State" format
          const words = location.trim().split(/\s+/);
          if (words.length >= 2) {
            // Last word might be state
            const lastWord = words[words.length - 1];
            if (lastWord.length === 2 && lastWord === lastWord.toUpperCase()) {
              state = lastWord;
              city = words.slice(0, -1).join(' ');
            } else {
              city = location;
            }
          } else {
            city = location;
          }
        }
      }

      // Calculate confidence based on available info
      let confidence = 50;
      if (phone) confidence += 20;
      if (address) confidence += 15;
      if (pricing) confidence += 10;
      if (result.url) confidence += 5;

      entities.push({
        name,
        address,
        city,
        state,
        phone,
        website: result.url,
        description: result.snippet?.substring(0, 500),
        pricing,
        hours,
        source: `perplexity_${result.domain}`,
        confidence,
        entityType: discoveryType
      });

      console.log(`✅ [${discoveryType}] Accepted: "${name}" (confidence: ${confidence}${pricing ? `, pricing: ${pricing}` : ''})`);
    }

    // Generate AI narrative summary
    const aiNarrative = entities.length > 0
      ? `Found ${entities.length} ${discoveryType} options in ${location}. ${
          entities.filter(e => e.pricing).length > 0 
            ? `${entities.filter(e => e.pricing).length} have pricing information available.`
            : 'Contact providers directly for pricing details.'
        }`
      : `No ${discoveryType} found matching your search. Try a different location or search term.`;

    console.log(`✅ [${discoveryType}] Discovery complete: ${entities.length} results (from ${results.results.length} raw)`);

    return {
      results: entities,
      sources: results.results.map(r => r.url),
      searchQuery,
      aiNarrative
    };
  }
}

// Create singleton instance
export const perplexitySearchAPI = new PerplexitySearchAPI();
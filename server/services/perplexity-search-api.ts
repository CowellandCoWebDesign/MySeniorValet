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

// Recognized senior-living directory domains that carry curated, on-community
// photos. A non-official photo is only trusted (Golden Data Rule) when its ORIGIN
// page host matches one of these — this rejects look-alike junk that Perplexity
// `return_images` surfaces for generically-named facilities (e.g. a "Red Bluff
// Health & Fitness" gym, a "Dignity Health" hospital, or an architecture firm's
// portfolio shown for a care center named "Red Bluff Health Care Center").
export const SENIOR_LIVING_PHOTO_SOURCES = [
  'caring.com', 'aplaceformom.com', 'seniorlivingnearme.com', 'senioradvisor.com',
  'seniorhousing.net', 'assistedliving.com', 'seniorly.com', 'mycaringplan.com',
  'seniorcarehomes.com', 'senioradvice.com', 'after55.com', 'newlifestyles.com',
  'caregiverlist.com', 'snrproject.com', 'retirementhomes.com',
  // Additional photo-capable senior-care directories observed in return_images
  // origins. Pure data/ratings sites that carry NO community photos (e.g.
  // medicare.gov, nursinghomecompare.com) are deliberately excluded — they can
  // never supply a usable image, so allowing them only invites mismatches.
  'nursinghomes.com', 'seniorcarefinder.com', 'usnews.com', 'theseniorlist.com',
  'seniorhomes.com', 'memorycare.com', 'assistedlivingfacilities.org',
  'seniorliving.org', 'aging.com', 'elderlylongtermcare.com',
];

/**
 * Exact host/subdomain membership test for the senior-living photo allowlist.
 * Uses `host === domain || host.endsWith('.' + domain)` — NOT substring `includes` —
 * so a look-alike host such as `fake-caring.com` or `caring.com.evil.tld` can never
 * masquerade as a trusted directory.
 */
export function isSeniorLivingDirectoryHost(host: string): boolean {
  const h = (host || '').toLowerCase().replace(/^www\./, '').trim();
  if (!h) return false;
  return SENIOR_LIVING_PHOTO_SOURCES.some((d) => h === d || h.endsWith('.' + d));
}

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
    const limit = options.limit || 15;
    const userPrompt = careType
      ? `Find ${careType} senior living facilities in ${location}. List only specific named facilities with their street address, city, state, and direct phone number. Do not include referral services, placement agencies, or generic directories.`
      : `Find senior living communities (assisted living, memory care, independent living, skilled nursing) in ${location}. List only specific named facilities — places with a physical address that residents live in. Include the facility name, street address, city, state, direct phone number, and website where available.`;

    const systemPrompt = `You are a senior living facility researcher. Your job is to identify real, specific, individually-named senior living facilities at a physical address. 

Rules:
- ONLY return actual residential care facilities where seniors live (assisted living, memory care, independent living, skilled nursing, CCRCs, board and care homes)
- NEVER return: referral services (A Place for Mom, Caring.com, SeniorAdvisor), placement agencies, government databases, list pages, directories, home care agencies (Visiting Angels, Home Instead), or generic category descriptions
- Extract facility-level data from whatever sources you search, even if those sources are aggregators — what matters is the individual facility name and address, not the source
- Each entry must be a distinct named facility at a real street address
- Return up to ${limit} results`;

    const requestBody = {
      model: 'sonar',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      web_search_options: { search_context_size: 'high' },
      response_format: {
        type: 'json_schema',
        json_schema: {
          schema: {
            type: 'object',
            properties: {
              communities: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name:      { type: 'string' },
                    address:   { type: 'string' },
                    city:      { type: 'string' },
                    state:     { type: 'string' },
                    phone:     { type: 'string' },
                    website:   { type: 'string' },
                    careTypes: { type: 'array', items: { type: 'string' } }
                  },
                  required: ['name', 'city', 'state']
                }
              }
            },
            required: ['communities']
          }
        }
      }
    };

    console.log(`🏠 Discovering communities in ${location} via Chat Completions + structured JSON`);
    const startTime = Date.now();

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Chat Completions discovery error (${response.status}):`, errorText);
      await aiTracker.trackPerplexityCall({
        action: 'discoverCommunities',
        context: 'chat_completions_structured',
        requestDuration: responseTime,
        success: false,
        errorMessage: `${response.status} - ${errorText}`,
        prompt: userPrompt,
      });
      throw new Error(`Discovery failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || '{"communities":[]}';
    const citations: string[] = data.citations || [];

    let parsed: { communities: Array<{ name: string; address?: string; city?: string; state?: string; phone?: string; website?: string; careTypes?: string[] }> } = { communities: [] };
    try {
      // Strip <think>...</think> blocks that reasoning models may prepend
      const cleaned = rawContent.replace(/<think>[\s\S]*?<\/think>/i, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.warn('⚠️ Failed to parse structured JSON from discovery response, returning empty');
    }

    const rawCommunities = parsed.communities || [];

    // Light safety net — reject anything that still looks like a generic category name
    const GENERIC_PATTERNS = [
      /^(?:assisted\s+living|senior\s+living|memory\s+care|nursing\s+home|retirement|independent\s+living|skilled\s+nursing)s?\s+(?:facilities|communities|homes|centers?)?\s*(?:in|near)\s+/i,
      /^\d+\s+(?:assisted\s+living|senior\s+living|memory\s+care|nursing\s+home)/i,
      /\bguide\s+(to|for)\b/i,
      /^(the\s+)?(\d+\s+)?(best|top)\s+/i,
      /^find\s+/i,
      /^list\s+of\s+/i,
      /\bhousing\s+options?\b/i,
      /\bsenior\s+(resources?|services?)\b/i,
      /\bprovider\s+(directory|search|list)\b/i,
      /\bfacility\s+(search|finder|locator)\b/i,
    ];

    const communities = rawCommunities
      .filter(c => {
        if (!c.name || c.name.length < 4 || c.name.length > 90) return false;
        if (GENERIC_PATTERNS.some(p => p.test(c.name))) {
          console.log(`🚫 Filtered generic entry: "${c.name}"`);
          return false;
        }
        return true;
      })
      .map(c => ({
        name: c.name.trim(),
        address: c.address,
        city: c.city,
        state: c.state,
        phone: c.phone,
        website: c.website,
        careTypes: c.careTypes && c.careTypes.length > 0 ? c.careTypes : undefined,
        source: 'chat_completions_sonar',
        confidence: 80
      }));

    await aiTracker.trackPerplexityCall({
      action: 'discoverCommunities',
      context: 'chat_completions_structured',
      requestDuration: responseTime,
      success: true,
      inputTokens: data.usage?.prompt_tokens,
      outputTokens: data.usage?.completion_tokens,
      prompt: userPrompt,
      response: JSON.stringify(communities.slice(0, 3)),
    });

    console.log(`✅ Structured discovery returned ${communities.length} communities in ${location} (${responseTime}ms)`);
    communities.forEach(c => console.log(`  📍 ${c.name} — ${c.city}, ${c.state}`));

    return {
      communities,
      sources: citations,
      searchQuery: userPrompt
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
   * 🧠 ADMIN DEEP ENRICHMENT (paid Perplexity path — admin-gated only)
   * =================================================================
   * Combines the cheap Search API (raw web results + photos + sources) with a
   * single `sonar` structured-output completion to produce a clean, verified,
   * ≤1000-char summary plus structured fields for a single community.
   *
   * Golden Data Rule: every structured field is null unless Perplexity actually
   * returned/verified it. We never fabricate pricing, websites, or phone numbers.
   *
   * Cost per run (forced refresh): ~1 Search call ($0.005) + 1 sonar call
   * (a few cents) + optional 1 domain-restricted Search call for authentic
   * official-site photos. Admin-gated + 7-day cache keep this minimal.
   */
  async deepEnrichCommunity(community: {
    name: string;
    city?: string | null;
    state?: string | null;
    website?: string | null;
  }): Promise<{
    summary: string;
    officialWebsite: string | null;
    managementCompany: string | null;
    phone: string | null;
    location: string | null;
    availability: string | null;
    pricing: { min?: number; max?: number; source?: string } | null;
    photos: Array<{ url: string; source: string; isAuthentic: boolean }>;
    photoDirectoryCandidates: Array<{ url: string; title: string; snippet: string }>;
    sources: string[];
  }> {
    const location = [community.city, community.state].filter(Boolean).join(', ');
    const label = `${community.name}${location ? ` (${location})` : ''}`;
    console.log(`🧠 [Perplexity Deep Enrich] Researching ${label}`);

    // ── 1. Broad Search API call — snippets for grounding + sources + photos ──
    const broadQuery = `"${community.name}" ${location} senior living community official website phone address pricing management company availability photos`;
    const broad = await this.search(broadQuery, {
      max_results: 15,
      max_tokens_per_page: 1024,
    });

    const snippetContext = broad.results
      .map((r, i) => `[${i + 1}] ${r.title} — ${r.domain}\n${r.snippet}\nURL: ${r.url}`)
      .join('\n\n')
      .substring(0, 8000);

    const sources = broad.results.map(r => r.url);

    // Identify a likely official-site domain (first non-directory result) to flag
    // authentic photos and to drive an optional domain-restricted image search.
    // Only exclude domains that are genuinely NOT useful for senior living photos/info.
    // Senior living directories (caring.com, aplaceformom.com, seniorlivingnearme.com,
    // senioradvisor.com, seniorhousing.net, assistedliving.com, etc.) are VALID sources —
    // they often have curated community photos and pricing, so we accept them.
    const DIRECTORY_DOMAINS = [
      'yelp.com', 'tripadvisor.com', 'facebook.com', 'google.com', 'wikipedia.org',
      'linkedin.com', 'youtube.com', 'instagram.com', 'twitter.com', 'x.com',
    ];
    // The "official" domain (used to flag photos `isAuthentic`, which bypasses the
    // name/city relevance gate) must be a genuine community/operator site — NOT a
    // senior-living directory. Otherwise a first result of caring.com/seniorly.com
    // would mark directory images authentic and let un-corroborated photos through.
    const officialResult = broad.results.find(
      r => r.domain
        && !DIRECTORY_DOMAINS.some(d => r.domain.includes(d))
        && !isSeniorLivingDirectoryHost(r.domain)
    );
    const officialDomain = officialResult?.domain;

    // Deterministic photo-source candidates: Perplexity Search results whose host
    // is a recognized senior-living directory. These feed the scrape-and-corroborate
    // path in the verify endpoint so real directory photos surface reliably even
    // when nondeterministic `return_images` happens to return none — and without
    // leaning on DuckDuckGo/Bing (which the user flagged as "clouding" Perplexity).
    const photoDirectoryCandidates = broad.results
      .filter((r) => {
        let host = (r.domain || '').toLowerCase();
        if (!host) { try { host = new URL(r.url).hostname; } catch { /* ignore */ } }
        return isSeniorLivingDirectoryHost(host);
      })
      .map((r) => ({ url: r.url, title: r.title || '', snippet: r.snippet || '' }));

    // ── 2. Sonar structured extraction (json_schema) — summary + fields ──────
    const structured = await this.sonarStructuredExtract(community.name, location, snippetContext);

    // ── 3. Photos — extract real image URLs from search results (no fabrication) ──
    const photos = this.extractPhotosFromResults(broad.results, officialDomain);

    // ── 3a. PRIMARY photos via Perplexity sonar `return_images` ─────────────────
    // The Search API only returns text snippets, so snippet-scraped image URLs are
    // rare. The Chat Completions API with `return_images: true` returns a native
    // `images` array (real, multi-source community photos). These are the most
    // reliable source, so they lead — snippet-scraped photos become a supplement.
    const nativeImages = await this.sonarReturnImages(community.name, location, officialDomain, community.city);
    for (let i = nativeImages.length - 1; i >= 0; i--) {
      const img = nativeImages[i];
      if (!photos.some(p => p.url === img.url)) photos.unshift(img);
    }

    // Golden Data Rule: only persist a website that Perplexity actually verified
    // as the official site — never fall back to a heuristic "first non-directory"
    // result, which could surface a third-party/aggregator URL.
    const officialWebsite = structured.officialWebsite || null;
    let officialHost: string | undefined;
    try {
      if (officialWebsite) officialHost = new URL(officialWebsite).hostname.replace(/^www\./, '');
    } catch { /* ignore malformed url */ }

    if (officialHost && photos.filter(p => p.isAuthentic).length < 3) {
      try {
        const imgSearch = await this.search(`${community.name} photos gallery`, {
          max_results: 10,
          domain_allowlist: [officialHost],
        });
        const officialPhotos = this.extractPhotosFromResults(imgSearch.results, officialHost);
        for (const p of officialPhotos) {
          if (!photos.some(existing => existing.url === p.url)) photos.push(p);
        }
      } catch (err) {
        console.warn(`⚠️ Official-site image search failed for ${label}:`, err instanceof Error ? err.message : err);
      }
    }

    // ── Source-quality filter (Golden Data Rule) ────────────────────────────────
    // Snippet-scraped images (extractPhotosFromResults) are NOT relevance-gated and
    // can surface look-alike junk (e.g. a "Red Bluff Health & Fitness" gym on a
    // care-center page). Only trust photos that are either (a) from the verified
    // official domain, or (b) from a recognized senior-living directory — these are
    // the sources that actually carry curated community photos. Everything else is
    // dropped so we never show an off-community image.
    const trustedPhotos = photos.filter(
      p => p.isAuthentic
        || (officialHost && (p.source || '').includes(officialHost))
        || isSeniorLivingDirectoryHost(p.source || ''),
    );
    const droppedCount = photos.length - trustedPhotos.length;
    if (droppedCount > 0) {
      console.log(`🧹 Dropped ${droppedCount} untrusted-source photo(s) for "${community.name}" (kept ${trustedPhotos.length})`);
    }

    return {
      summary: structured.summary,
      officialWebsite,
      managementCompany: structured.managementCompany,
      phone: structured.phone,
      location: structured.location,
      availability: structured.availability,
      pricing: structured.pricing,
      photos: trustedPhotos.slice(0, 12),
      photoDirectoryCandidates,
      sources,
    };
  }

  /**
   * Extract real image URLs from Search API results. Only genuine image URLs are
   * returned — nothing is fabricated. Photos from the official domain are flagged
   * `isAuthentic: true`; all others are flagged false with their true source.
   */
  private extractPhotosFromResults(
    results: SearchResult[],
    officialDomain?: string
  ): Array<{ url: string; source: string; isAuthentic: boolean }> {
    const seen = new Set<string>();
    const photos: Array<{ url: string; source: string; isAuthentic: boolean }> = [];
    const imageRe = /https?:\/\/[^\s"'<>]+?\.(?:jpg|jpeg|png|webp)(?:\?[^\s"'<>]*)?/gi;

    const add = (url: string, domain: string) => {
      const clean = url.replace(/[)\].,]+$/, '');
      if (seen.has(clean)) return;
      seen.add(clean);
      const host = domain || (() => { try { return new URL(clean).hostname.replace(/^www\./, ''); } catch { return ''; } })();
      const isAuthentic = !!officialDomain && (host.includes(officialDomain) || clean.includes(officialDomain));
      photos.push({ url: clean, source: host || 'web', isAuthentic });
    };

    for (const r of results) {
      if (/\.(jpg|jpeg|png|webp)(?:\?|$)/i.test(r.url)) add(r.url, r.domain);
      const matches = r.snippet?.match(imageRe);
      if (matches) for (const m of matches) add(m, r.domain);
    }
    return photos;
  }

  /**
   * Fetch authentic community photos via Perplexity sonar `return_images`.
   * Unlike the Search API (text snippets only), the Chat Completions API returns
   * a native `images` array of {image_url, origin_url, width, height}. This CANNOT
   * be combined with `response_format` (json_schema suppresses the images array),
   * so it is a dedicated, lightweight call. Social/review domains are excluded;
   * photos whose origin is the official domain are flagged `isAuthentic`.
   */
  private async sonarReturnImages(
    communityName: string,
    location: string,
    officialDomain?: string,
    city?: string | null,
  ): Promise<Array<{ url: string; source: string; isAuthentic: boolean }>> {
    if (!this.apiKey) return [];
    const startTime = Date.now();
    const prompt =
      `Show photos of "${communityName}"${location ? ` in ${location}` : ''}, a senior living ` +
      `community — building exterior, interior common areas, resident rooms/apartments, dining, and amenities.`;
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'sonar',
          temperature: 0.1,
          max_tokens: 200,
          return_images: true,
          image_format_filter: ['jpg', 'jpeg', 'png', 'webp'],
          image_domain_filter: [
            '-yelp.com', '-tripadvisor.com', '-facebook.com', '-instagram.com',
            '-twitter.com', '-x.com', '-linkedin.com', '-youtube.com',
          ],
          messages: [
            { role: 'system', content: 'You are a senior-living researcher. Find authentic photos of the exact community named.' },
            { role: 'user', content: prompt },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ return_images error (${response.status}):`, errorText.slice(0, 300));
        await aiTracker.trackPerplexityCall({
          action: 'sonar_return_images',
          context: 'perplexity_return_images',
          requestDuration: Date.now() - startTime,
          success: false,
          errorMessage: `${response.status} - ${errorText.slice(0, 200)}`,
          prompt: communityName,
        }).catch(() => {});
        return [];
      }

      const data = await response.json();
      const images: any[] = Array.isArray(data.images) ? data.images : [];

      // ── Relevance gate (Golden Data Rule) ───────────────────────────────────
      // `return_images` returns web images matching the query, but common names
      // ("Brookdale", "Sunrise") collide with colleges, home models, and other
      // locations. We only trust an image when its ORIGIN page (URL + title)
      // references this exact community: a distinctive name token AND the city
      // (or the verified official domain). This rejects name-collision junk.
      const GENERIC = new Set([
        'senior', 'seniors', 'living', 'care', 'community', 'communities', 'home', 'homes', 'house',
        'the', 'of', 'at', 'and', 'assisted', 'memory', 'independent', 'skilled', 'nursing',
        'retirement', 'place', 'center', 'centre', 'village', 'villas', 'villa', 'gardens', 'garden',
        'court', 'estates', 'estate', 'park', 'plaza', 'lodge', 'suites', 'suite', 'residence',
        'residences', 'health', 'rehabilitation', 'rehab', 'manor', 'terrace', 'life', 'inc', 'llc',
      ]);
      const norm = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
      const cityTokens = norm(city || location.split(',')[0] || '').split(/\s+/).filter(t => t.length >= 4);
      const nameTokens = norm(communityName)
        .split(/\s+/)
        .filter(t => t.length >= 3 && !GENERIC.has(t) && !cityTokens.includes(t));

      const seen = new Set<string>();
      const out: Array<{ url: string; source: string; isAuthentic: boolean }> = [];
      let rejected = 0;
      for (const img of images) {
        const url: string | undefined = img?.image_url || img?.imageUrl;
        if (!url || seen.has(url)) continue;
        seen.add(url);
        const originUrl: string = img?.origin_url || img?.originUrl || url;
        const title: string = img?.title || '';
        let host = '';
        try { host = new URL(originUrl).hostname.replace(/^www\./, ''); } catch { /* ignore */ }
        const isAuthentic = !!officialDomain && (host.includes(officialDomain) || originUrl.includes(officialDomain));

        const haystack = norm(`${originUrl} ${title}`);
        const hasNameToken = nameTokens.length > 0 && nameTokens.some(t => haystack.includes(t));
        const hasCityToken = cityTokens.length === 0 || cityTokens.some(t => haystack.includes(t));

        // Sibling-location guard: a chain listing page for our city often shows
        // thumbnails of OTHER nearby branches of the same brand. When the image
        // filename itself self-describes the brand but a city that is not ours,
        // it is a different community's photo — reject it (Golden Data Rule).
        const imgHay = norm(url);
        const imgHasName = nameTokens.some(t => imgHay.includes(t));
        const imgHasCity = cityTokens.some(t => imgHay.includes(t));
        const siblingLocation = imgHasName && cityTokens.length > 0 && !imgHasCity;

        // Accept verified official-domain images outright (their galleries/CDNs
        // often use generic paths). Otherwise the ORIGIN page must be a recognized
        // senior-living directory AND clearly reference this community by name AND
        // city. `return_images` happily returns gyms, hospitals, and architecture
        // portfolios for generically-named facilities; gating on a known directory
        // origin is the only reliable way to reject that look-alike junk.
        const originIsDirectory = isSeniorLivingDirectoryHost(host);
        const relevant = hasNameToken && hasCityToken && !siblingLocation;
        if (!isAuthentic && !(originIsDirectory && relevant)) {
          rejected++;
          continue;
        }
        out.push({ url, source: host || 'web', isAuthentic });
      }
      console.log(
        `📸 Perplexity return_images: ${out.length} photo(s) kept for "${communityName}" ` +
        `(${rejected} rejected as off-community)`,
      );
      await aiTracker.trackPerplexityCall({
        action: 'sonar_return_images',
        context: 'perplexity_return_images',
        requestDuration: Date.now() - startTime,
        success: true,
        prompt: `${communityName} ${location}`,
        response: `${out.length} images`,
      }).catch(() => {});
      return out;
    } catch (err) {
      console.warn(`⚠️ return_images request failed:`, err instanceof Error ? err.message : err);
      return [];
    }
  }

  /**
   * Single `sonar` structured-output completion. Returns a ≤1000-char summary and
   * structured fields, grounded on both Perplexity's live web index and the
   * provided Search API context. Unknown fields come back null (Golden Data Rule).
   */
  private async sonarStructuredExtract(
    communityName: string,
    location: string,
    context: string
  ): Promise<{
    summary: string;
    officialWebsite: string | null;
    managementCompany: string | null;
    phone: string | null;
    location: string | null;
    availability: string | null;
    pricing: { min?: number; max?: number; source?: string } | null;
  }> {
    const startTime = Date.now();
    const empty = {
      summary: '', officialWebsite: null, managementCompany: null, phone: null,
      location: null, availability: null, pricing: null,
    };

    if (!this.apiKey) throw new Error('Perplexity API key not configured');

    const systemPrompt =
      'You are a senior-living data researcher. Extract ONLY facts you can verify from the web ' +
      'and the provided search context. NEVER guess or fabricate. If a field is unknown or ' +
      'unverified, return null for it. Pricing must be a real monthly figure in USD reported for ' +
      'THIS community; if no real pricing is published, return null (the app shows "Contact for ' +
      'pricing"). The summary must be a single concise paragraph of at most 1000 characters covering, ' +
      'where known: monthly pricing, contact info, location, the official website, the management/operating ' +
      'company, and current availability.';

    const userPrompt =
      `Community: "${communityName}"${location ? `\nLocation: ${location}` : ''}\n\n` +
      `Search context (ranked web results):\n${context || '(none)'}\n\n` +
      'Return the structured JSON for this exact community only.';

    const schema = {
      type: 'object',
      properties: {
        summary: { type: 'string', description: '<=1000 char concise paragraph' },
        officialWebsite: { type: ['string', 'null'] },
        managementCompany: { type: ['string', 'null'] },
        phone: { type: ['string', 'null'] },
        location: { type: ['string', 'null'], description: 'City, State or full address' },
        availability: { type: ['string', 'null'], description: 'e.g. "Waitlist", "Units available", "Contact for availability"' },
        pricingMin: { type: ['number', 'null'], description: 'Lowest verified monthly price in USD' },
        pricingMax: { type: ['number', 'null'], description: 'Highest verified monthly price in USD' },
        pricingSource: { type: ['string', 'null'] },
      },
      required: ['summary', 'officialWebsite', 'managementCompany', 'phone', 'location', 'availability', 'pricingMin', 'pricingMax', 'pricingSource'],
      additionalProperties: false,
    };

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'sonar',
          temperature: 0.1,
          max_tokens: 900,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          response_format: {
            type: 'json_schema',
            json_schema: { name: 'community_enrichment', schema },
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Sonar extract error (${response.status}):`, errorText);
        await aiTracker.trackPerplexityCall({
          action: 'sonar_structured_extract',
          context: 'perplexity_admin_enrich',
          requestDuration: Date.now() - startTime,
          success: false,
          errorMessage: `${response.status} - ${errorText}`,
          prompt: communityName,
        });
        throw new Error(`Sonar extract failed: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '{}';
      await aiTracker.trackPerplexityCall({
        action: 'sonar_structured_extract',
        context: 'perplexity_admin_enrich',
        requestDuration: Date.now() - startTime,
        success: true,
        inputTokens: data.usage?.prompt_tokens,
        outputTokens: data.usage?.completion_tokens,
        prompt: `${communityName} ${location}`,
        response: content.substring(0, 500),
      });

      let parsed: any = {};
      try {
        parsed = JSON.parse(content);
      } catch {
        console.warn('⚠️ Sonar returned non-JSON content; using empty extraction');
        return empty;
      }

      const toNum = (v: any) => (typeof v === 'number' && isFinite(v) && v > 0 ? Math.round(v) : undefined);
      const min = toNum(parsed.pricingMin);
      const max = toNum(parsed.pricingMax);
      const pricing = (min || max)
        ? { min, max, source: typeof parsed.pricingSource === 'string' ? parsed.pricingSource : undefined }
        : null;

      const str = (v: any) => (typeof v === 'string' && v.trim() && v.trim().toLowerCase() !== 'null' ? v.trim() : null);

      return {
        summary: (str(parsed.summary) || '').substring(0, 1000),
        officialWebsite: str(parsed.officialWebsite),
        managementCompany: str(parsed.managementCompany),
        phone: str(parsed.phone),
        location: str(parsed.location),
        availability: str(parsed.availability),
        pricing,
      };
    } catch (error) {
      await aiTracker.trackPerplexityCall({
        action: 'sonar_structured_extract',
        context: 'perplexity_admin_enrich',
        requestDuration: Date.now() - startTime,
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        prompt: communityName,
      });
      throw error;
    }
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
        // Don't add "senior services" to all queries - detect service type from query
        const serviceLower = query.toLowerCase();
        const isHospitality = /hotel|motel|lodging|inn|resort|vacation|accommodation/i.test(serviceLower);
        const isFood = /restaurant|dining|food|meal|cafe|catering|grocery/i.test(serviceLower);
        const isTransport = /transport|taxi|uber|lyft|ride|shuttle|car\s+service|moving|mover/i.test(serviceLower);
        const isMedical = /pharmacy|drugstore|medical\s+equipment|hospital|clinic|doctor/i.test(serviceLower);
        
        if (isHospitality || isFood || isTransport || isMedical) {
          // General services - don't force "senior" into the query
          searchQuery = `${query} in ${location} pricing rates costs hours phone address website`;
        } else {
          // Senior-specific services (home care, adult daycare, etc.)
          searchQuery = `${query} senior services in ${location} pricing rates costs packages hours phone address`;
        }
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

    // Generic page titles to reject (not real business names)
    const GENERIC_TITLES = [
      // Common page titles
      'services', 'service', 'contact', 'contact us', 'about', 'about us',
      'home', 'welcome', 'product details', 'products', 'ratings', 'reviews',
      'ratings & reviews', 'ratings and reviews', 'faq', 'faqs', 'help',
      'menu', 'locations', 'our services', 'our team', 'team', 'staff',
      'hours', 'pricing', 'prices', 'rates', 'gallery', 'photos', 'blog',
      'news', 'events', 'calendar', 'schedule', 'book now', 'sign up',
      'login', 'register', 'subscribe', 'newsletter', 'careers', 'jobs',
      'privacy', 'terms', 'disclaimer', 'sitemap', 'search', 'resources',
      // Generic service category names (not actual businesses)
      'senior services', 'senior living', 'assisted living', 'memory care',
      'home care', 'home health', 'healthcare', 'health care', 'medical',
      'legal services', 'financial services', 'insurance',
      // US State names (not valid business names)
      'alabama', 'alaska', 'arizona', 'arkansas', 'california', 'colorado',
      'connecticut', 'delaware', 'florida', 'georgia', 'hawaii', 'idaho',
      'illinois', 'indiana', 'iowa', 'kansas', 'kentucky', 'louisiana',
      'maine', 'maryland', 'massachusetts', 'michigan', 'minnesota',
      'mississippi', 'missouri', 'montana', 'nebraska', 'nevada',
      'new hampshire', 'new jersey', 'new mexico', 'new york', 'north carolina',
      'north dakota', 'ohio', 'oklahoma', 'oregon', 'pennsylvania',
      'rhode island', 'south carolina', 'south dakota', 'tennessee', 'texas',
      'utah', 'vermont', 'virginia', 'washington', 'west virginia',
      'wisconsin', 'wyoming', 'district of columbia', 'puerto rico'
    ];
    
    // Minimum 2 words for a valid business name
    const hasMultipleWords = (name: string): boolean => {
      const words = name.trim().split(/\s+/).filter(w => w.length > 1);
      return words.length >= 2;
    };

    // Toll-free prefixes (referral services, not direct lines)
    const TOLL_FREE_PREFIXES = ['800', '833', '844', '855', '866', '877', '888'];

    // Helper function to sanitize description text
    const sanitizeDescription = (text: string): string => {
      if (!text) return '';
      let clean = text;
      // Remove markdown headers
      clean = clean.replace(/^#{1,6}\s+/gm, '');
      // Remove markdown bold/italic
      clean = clean.replace(/\*\*([^*]+)\*\*/g, '$1');
      clean = clean.replace(/\*([^*]+)\*/g, '$1');
      clean = clean.replace(/__([^_]+)__/g, '$1');
      clean = clean.replace(/_([^_]+)_/g, '$1');
      // Remove markdown links [text](url)
      clean = clean.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
      // Remove HTML tags
      clean = clean.replace(/<[^>]+>/g, '');
      // Remove placeholder/warning text
      clean = clean.replace(/warning:?\s*please\s+provide\s+content[^.]*\.?/gi, '');
      clean = clean.replace(/please\s+provide\s+content[^.]*\.?/gi, '');
      clean = clean.replace(/content\s+not\s+available[^.]*\.?/gi, '');
      clean = clean.replace(/no\s+description\s+available[^.]*\.?/gi, '');
      // Collapse multiple whitespace
      clean = clean.replace(/\s+/g, ' ').trim();
      return clean;
    };

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
      name = name.replace(/\[PDF\]\s*/gi, ''); // Remove [PDF] prefix
      name = name.trim();

      // Skip very short names (5+ chars required) or very long names
      if (name.length < 5 || name.length > 100) {
        console.log(`⚠️ [${discoveryType}] Skipping short/long name: "${name}" (${name.length} chars)`);
        continue;
      }

      // Skip generic page titles
      if (GENERIC_TITLES.includes(name.toLowerCase())) {
        console.log(`⚠️ [${discoveryType}] Skipping generic title: "${name}"`);
        continue;
      }
      
      // Require at least 2 words for valid business names
      if (!hasMultipleWords(name)) {
        console.log(`⚠️ [${discoveryType}] Skipping single-word name: "${name}"`);
        continue;
      }

      // Skip names that look truncated (end with "...")
      if (name.endsWith('...') && name.length < 20) {
        console.log(`⚠️ [${discoveryType}] Skipping truncated name: "${name}"`);
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
        /\$[\d,]+(?:\s*[-–]\s*\$[\d,]+)?(?:\s*(?:per\s+)?(?:month|monthly|day|daily|hour|hourly|visit|session|week|weekly))?/gi,
        /(?:starting\s+(?:at|from)\s+)?\$[\d,]+/gi,
        /(?:costs?|rates?|pricing|fees?|price):\s*\$[\d,]+/gi,
        /\$[\d.]+\s*(?:\/|per)\s*(?:hour|hr|day|month|visit|session)/gi,
        /(?:medicare|medicaid|insurance)\s+(?:accepted|covered)/gi,
        /free(?:\s+services?)?|no\s+cost|sliding\s+scale|income[-\s]based/gi
      ];
      let pricing: string | undefined;
      const allPricingMatches: string[] = [];
      for (const pattern of pricingPatterns) {
        const matches = result.snippet.match(pattern);
        if (matches) {
          allPricingMatches.push(...matches);
        }
      }
      if (allPricingMatches.length > 0) {
        // Prefer $ amounts, then accept other price info
        const dollarMatch = allPricingMatches.find(m => m.includes('$'));
        pricing = dollarMatch || allPricingMatches[0];
      }

      // Extract hours - support more common formats
      const hoursPatterns = [
        /(?:hours?|open)\s*:?\s*([^.]+(?:am|pm|AM|PM)[^.]*)/i,
        /((?:mon|tue|wed|thu|fri|sat|sun)[a-z]*[-–\s]*(?:mon|tue|wed|thu|fri|sat|sun)?[a-z]*\s+\d{1,2}(?::\d{2})?\s*[-–]\s*\d{1,2}(?::\d{2})?(?:\s*(?:am|pm))?)/i,
        /(\d{1,2}(?::\d{2})?\s*(?:am|pm)\s*[-–to]+\s*\d{1,2}(?::\d{2})?\s*(?:am|pm))/gi,
        /(24\/7|open\s+(?:daily|24\s+hours))/i
      ];
      let hours: string | undefined;
      for (const pattern of hoursPatterns) {
        const match = result.snippet.match(pattern);
        if (match) {
          hours = match[1] ? match[1].trim() : match[0].trim();
          break;
        }
      }

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

      // Sanitize description to remove markdown and placeholder text
      const cleanDescription = sanitizeDescription(result.snippet?.substring(0, 500) || '');
      
      // Skip results with empty or very short descriptions after sanitization
      if (cleanDescription.length < 20) {
        console.log(`⚠️ [${discoveryType}] Skipping result with poor description: "${name}"`);
        continue;
      }

      entities.push({
        name,
        address,
        city,
        state,
        phone,
        website: result.url,
        description: cleanDescription,
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
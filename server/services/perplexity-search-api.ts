/**
 * 🚀 PERPLEXITY SEARCH API SERVICE
 * ===============================
 * Leverages the NEW Perplexity Search API (launched Sept 25, 2025)
 * - $5 per 1,000 requests (vs higher Sonar Pro costs)
 * - Raw search results with structured data
 * - Sub-document precision with ranked snippets
 * - Perfect for discovery operations across all MySeniorValet tabs
 */

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
        throw new Error(`Search API failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log(`✅ Found ${data.results?.length || 0} search results`);
      
      return {
        results: data.results || [],
        query: data.query || query,
        total_results: data.results?.length || 0
      };

    } catch (error) {
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
}

// Create singleton instance
export const perplexitySearchAPI = new PerplexitySearchAPI();
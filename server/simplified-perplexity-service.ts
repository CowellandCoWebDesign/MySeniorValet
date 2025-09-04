/**
 * Simplified Perplexity-First Intelligence Service
 * 
 * Philosophy: Let Perplexity do what it does best - understand and find information
 * Then use official sources only for photos
 */

interface PerplexityResponse {
  id: string;
  model: string;
  object: string;
  created: number;
  citations: string[];
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
}

interface CommunityIntelligence {
  found: boolean;
  name: string;
  officialWebsite?: string;
  address?: string;
  phone?: string;
  pricing?: {
    assistedLiving?: string;
    memoryCare?: string;
    independentLiving?: string;
    details?: string;
  };
  careLevels?: string[];
  description?: string;
  amenities?: string[];
  nearbyOptions?: Array<{
    name: string;
    address: string;
    distance: string;
  }>;
  photos?: string[];
  sources: string[];
  notes?: string; // Additional notes about the search result
}

export class SimplifiedPerplexityService {
  private apiKey: string;

  constructor() {
    if (!process.env.PERPLEXITY_API_KEY) {
      throw new Error('PERPLEXITY_API_KEY is required');
    }
    this.apiKey = process.env.PERPLEXITY_API_KEY;
  }

  /**
   * Detect if the response is about a different community than requested
   */
  private detectWrongCommunity(requestedName: string, content: string, citations: string[]): string | null {
    const requestedParts = requestedName.toLowerCase().split(' ');
    const requestedFirstWord = requestedParts[0];
    const requestedLastWord = requestedParts[requestedParts.length - 1];
    
    // Common variations that might be confused
    const commonSuffixes = ['estates', 'springs', 'gardens', 'manor', 'place', 'village', 'residence', 'center', 'home', 'living', 'ridge', 'view', 'park'];
    
    // Check content for wrong community names
    for (const suffix of commonSuffixes) {
      if (suffix !== requestedLastWord) {
        const wrongName = `${requestedFirstWord} ${suffix}`;
        if (content.toLowerCase().includes(wrongName)) {
          // Verify it's actually a different community by checking if it appears more than the requested name
          const wrongNameCount = (content.toLowerCase().match(new RegExp(wrongName, 'g')) || []).length;
          const requestedNameCount = (content.toLowerCase().match(new RegExp(requestedName.toLowerCase(), 'g')) || []).length;
          
          if (wrongNameCount > requestedNameCount) {
            return wrongName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          }
        }
      }
    }
    
    // Check citations for wrong community references
    // Be very careful - URLs naturally use hyphens instead of spaces
    // Don't flag "hilltop-estates" as wrong when searching for "Hilltop Estates"
    const requestedNameHyphenated = requestedName.toLowerCase().replace(/\s+/g, '-');
    
    for (const citation of citations) {
      const lowerCitation = citation.toLowerCase();
      
      // Only check for ACTUALLY wrong communities, not the same community with hyphens
      // For example: if searching for "Hilltop Estates", don't flag "hilltop-estates" as wrong
      if (lowerCitation.includes('hilltop-springs') && requestedName.toLowerCase() === 'hilltop estates') {
        return 'Hilltop Springs';
      }
      if (lowerCitation.includes('hilltop-estates') && requestedName.toLowerCase() === 'hilltop springs') {
        return 'Hilltop Estates';
      }
      
      // Generic check for mismatched suffixes in URLs
      // But skip if the URL actually contains the correct hyphenated name
      if (!lowerCitation.includes(requestedNameHyphenated)) {
        for (const suffix of commonSuffixes) {
          if (suffix !== requestedLastWord && lowerCitation.includes(`${requestedFirstWord}-${suffix}`)) {
            // Double-check it's not just the correct name with hyphens
            const potentialWrongName = `${requestedFirstWord} ${suffix}`;
            if (potentialWrongName.toLowerCase() !== requestedName.toLowerCase()) {
              return potentialWrongName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            }
          }
        }
      }
    }
    
    return null;
  }

  /**
   * Step 1: Enhanced query to Perplexity for comprehensive community information
   */
  async findExactCommunity(
    communityName: string, 
    location: string
  ): Promise<CommunityIntelligence> {
    console.log(`🔍 Enhanced Perplexity search for: ${communityName} in ${location}`);

    // Enhanced query with STRICT name matching to prevent confusion
    const query = `Find information about senior living community named EXACTLY "${communityName}" in ${location}.

CRITICAL ACCURACY REQUIREMENT:
⚠️ ONLY provide information if the community name is EXACTLY "${communityName}"
⚠️ DO NOT provide information about communities with similar but different names
⚠️ If searching for "Hilltop Estates", DO NOT give information about "Hilltop Springs" or other variations
⚠️ If the exact community "${communityName}" cannot be found, clearly state it was not found

VERIFICATION CHECK:
- Community name must be: "${communityName}" (exact match)
- Location must be: ${location}

IF FOUND, provide:
1. CONTACT:
   - Official website URL (full URL including https://)
   - Main phone number (formatted as XXX-XXX-XXXX)
   - Complete street address with zip code
   - Email address if available

2. PRICING (provide specific numbers when available):
   - Assisted Living monthly cost range (e.g., $3,500-$5,000)
   - Memory Care monthly cost range
   - Independent Living monthly cost range
   - Any entrance fees or deposits
   - Note if pricing includes meals, utilities, etc.

3. CARE SERVICES:
   - All care levels offered (Assisted Living, Memory Care, Independent Living, Skilled Nursing)
   - Specialized programs (dementia care, respite care, hospice)
   - Medical services available on-site

4. AMENITIES & FEATURES:
   - Dining options (restaurant-style, private dining, etc.)
   - Activities and recreation programs
   - Transportation services
   - Pet policy
   - Room types (studio, 1-bedroom, 2-bedroom)

5. FACILITY DETAILS:
   - Year established
   - Number of units/beds
   - Accreditations or certifications
   - Parent company or management group

ALSO INCLUDE:
- Market analysis for ${location} area
- List of 5-10 comparable communities in the area with their pricing
- Average market rates for different care levels
- Market trends and insights

If "${communityName}" is not found exactly, still provide all the market data and comparable communities.`;

    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'sonar-pro',
          messages: [
            {
              role: 'system',
              content: `You are a comprehensive senior living market analyst providing detailed market research.
Your goal is to provide valuable market data and analysis, not just exact matches.

IMPORTANT: 
1. Search for the requested community AND provide comprehensive market analysis
2. If the exact community isn't found, still provide valuable market data for the area
3. Include ALL senior living communities found in the specified location
4. Provide actual pricing ranges, not just "Contact for pricing"
5. Extract real data from your sources - websites, phone numbers, addresses
6. Format phone numbers as XXX-XXX-XXXX. Include full website URLs with https://`
            },
            {
              role: 'user',
              content: query
            }
          ],
          temperature: 0.1, // Lower for more consistent extraction
          max_tokens: 2000, // Increased for more comprehensive responses
          stream: false,
          return_citations: true,
          return_images: false,
          return_related_questions: false,
          search_recency_filter: "month",
          search_domain_filter: [], // Remove restrictions to get more sources
          top_k: 10, // Get more results
          presence_penalty: 0,
          frequency_penalty: 0.5
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Perplexity API error (${response.status}):`, errorBody);
        throw new Error(`Perplexity API error: ${response.statusText} - ${errorBody}`);
      }

      const data: PerplexityResponse = await response.json();
      const content = data.choices[0]?.message?.content || '';
      const citations = data.citations || [];

      console.log(`  📚 Received ${citations.length} citations from Perplexity`);

      // Enhanced parsing with better extraction patterns
      return this.parseEnhancedResponse(content, citations, communityName);
    } catch (error) {
      console.error('Perplexity query failed:', error);
      return {
        found: false,
        name: communityName,
        sources: []
      };
    }
  }

  /**
   * Step 2: Enhanced photo fetching with multiple strategies
   */
  async getOfficialPhotos(websiteUrl: string): Promise<string[]> {
    if (!websiteUrl) return [];

    console.log(`📸 Enhanced photo search for: ${websiteUrl}`);

    try {
      const response = await fetch(websiteUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; MySeniorValet/1.0)'
        }
      }).catch(() => null);
      
      if (!response || !response.ok) {
        console.log(`  ⚠️ Could not access website`);
        return [];
      }

      const html = await response.text();
      const photos = new Set<string>();

      // Strategy 1: Standard img tags with enhanced patterns
      const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
      let match;

      while ((match = imgRegex.exec(html)) !== null) {
        const fullMatch = match[0];
        const imageUrl = match[1];
        
        // Handle relative URLs properly
        let absoluteUrl: string;
        try {
          absoluteUrl = new URL(imageUrl, websiteUrl).href;
        } catch {
          continue;
        }
        
        // Enhanced skip patterns - more comprehensive exclusions
        const skipPatterns = [
          'logo', 'icon', 'pixel', 'twitter', 'facebook', 
          'instagram', 'linkedin', 'youtube', 'pinterest',
          'tracking', 'analytics', '.svg', 'badge', 'button',
          'arrow', 'spinner', 'loader', 'x1f', 'emoji',
          'data:image', 'base64', '1x1', 'spacer', 'blank'
        ];
        
        const shouldSkip = skipPatterns.some(pattern => 
          absoluteUrl.toLowerCase().includes(pattern) ||
          fullMatch.toLowerCase().includes(pattern)
        );
        
        // Enhanced relevance patterns
        const relevantPatterns = [
          'community', 'living', 'resident', 'room', 'bedroom',
          'dining', 'activity', 'exterior', 'interior', 'lobby',
          'apartment', 'facility', 'building', 'lounge', 'garden',
          'courtyard', 'amenity', 'kitchen', 'bathroom', 'suite',
          'senior', 'care', 'home', 'residence', 'gallery'
        ];
        
        // Check for minimum image size indicators
        const hasSize = /width=["']?(\d+)/i.exec(fullMatch);
        const width = hasSize ? parseInt(hasSize[1]) : 0;
        
        if (!shouldSkip && width !== 1) {
          const isRelevant = relevantPatterns.some(pattern =>
            fullMatch.toLowerCase().includes(pattern) ||
            absoluteUrl.toLowerCase().includes(pattern)
          );
          
          // Prioritize relevant and larger images
          if (isRelevant || (width > 200 || photos.size < 5)) {
            photos.add(absoluteUrl);
          }
        }
      }

      // Strategy 2: Look for gallery/slideshow data
      const galleryPatterns = [
        /data-src=["']([^"']+\.(jpg|jpeg|png|webp))/gi,
        /data-image=["']([^"']+\.(jpg|jpeg|png|webp))/gi,
        /href=["']([^"']+\.(jpg|jpeg|png|webp))["']/gi,
        /"image":\s*"([^"]+\.(jpg|jpeg|png|webp))"/gi
      ];

      for (const pattern of galleryPatterns) {
        let galleryMatch;
        while ((galleryMatch = pattern.exec(html)) !== null) {
          try {
            const imageUrl = new URL(galleryMatch[1], websiteUrl).href;
            if (!imageUrl.includes('thumb') && !imageUrl.includes('icon')) {
              photos.add(imageUrl);
            }
          } catch {}
        }
      }

      // Strategy 3: Open Graph and meta images
      const metaRegex = /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/gi;
      let metaMatch;
      while ((metaMatch = metaRegex.exec(html)) !== null) {
        try {
          photos.add(new URL(metaMatch[1], websiteUrl).href);
        } catch {}
      }

      const photoArray = Array.from(photos);
      console.log(`  ✅ Found ${photoArray.length} unique photos`);
      
      // Return up to 15 photos for good coverage
      return photoArray.slice(0, 15);
    } catch (error) {
      console.error('Enhanced photo fetch failed:', error);
      return [];
    }
  }

  /**
   * Step 3: Only if no exact match, search surrounding area
   */
  async findNearbyOptions(location: string): Promise<CommunityIntelligence> {
    console.log(`🗺️ Searching for communities near: ${location}`);

    const query = `List ALL senior living communities in ${location}.

CRITICAL: Provide a NUMBERED LIST of actual community names. Format EXACTLY like this:

1. Community Name Here - Address if available
2. Another Community Name - Address  
3. Third Community Name - Address

Include:
- At least 20-30 communities if available
- Focus on community NAMES, not descriptions
- Include assisted living, independent living, memory care, nursing homes
- Include major chains like Brookdale, Sunrise, Atria, Holiday, etc.
- Include local communities too

DO NOT provide general descriptions. ONLY list actual community names.`;

    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'sonar-pro',
          messages: [
            {
              role: 'user',
              content: query
            }
          ],
          temperature: 0.2,
          max_tokens: 1000,
          stream: false,
          return_citations: true,
          return_images: false,
          return_related_questions: false,
          search_recency_filter: "month"
        })
      });

      const data: PerplexityResponse = await response.json();
      const content = data.choices[0]?.message?.content || '';
      
      return this.parseNearbyOptions(content, data.citations || []);
    } catch (error) {
      console.error('Nearby search failed:', error);
      return {
        found: false,
        name: 'Search',
        sources: []
      };
    }
  }

  /**
   * Main method - Simple 3-step process
   */
  async getCommunityIntelligence(
    communityName: string,
    location: string
  ): Promise<CommunityIntelligence> {
    // Step 1: Ask Perplexity for exact match
    const communityInfo = await this.findExactCommunity(communityName, location);

    // Step 2: If found, get photos from official website
    if (communityInfo.found && communityInfo.officialWebsite) {
      communityInfo.photos = await this.getOfficialPhotos(communityInfo.officialWebsite);
    }

    // Step 3: If not found, search nearby
    if (!communityInfo.found) {
      const nearbyInfo = await this.findNearbyOptions(location);
      return nearbyInfo;
    }

    return communityInfo;
  }

  /**
   * Parse and format Perplexity's response comprehensively
   */
  private parseEnhancedResponse(
    content: string, 
    citations: string[],
    communityName: string
  ): CommunityIntelligence {
    console.log('\n=== PERPLEXITY RAW RESPONSE ===');
    console.log(content.substring(0, 2000));
    console.log('=== END PERPLEXITY RESPONSE ===\n');
    
    const lowerContent = content.toLowerCase();
    const lowerCommunityName = communityName.toLowerCase();
    
    // First, try to extract actual data from the response
    const extractedWebsite = this.extractUrl(content);
    const extractedPhone = this.extractPhone(content);
    const extractedPhotos = this.extractPhotos(content);
    
    // Check for structured data (JSON) in the response
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                     content.match(/(\{[\s\S]*\})/);
    
    let structuredData: any = null;
    if (jsonMatch) {
      try {
        structuredData = JSON.parse(jsonMatch[1]);
      } catch (e) {
        // Ignore parsing errors
      }
    }
    
    // Check if we have actual data (photos, website, phone, or structured data)
    const hasActualData = !!(
      extractedWebsite ||
      extractedPhone ||
      (extractedPhotos && extractedPhotos.length > 0) ||
      (structuredData && (structuredData.website || structuredData.phone || structuredData.photos))
    );
    
    // Check if community was found - more lenient now that we want market data
    const notFoundIndicators = [
      'could not find any senior living',
      'no information available for any communities',
      'unable to find any facilities', 
      'no listings available'
    ];
    
    // Check for negative context around the community name
    const hasNegativeContext = notFoundIndicators.some(indicator => lowerContent.includes(indicator));
    
    // Check for positive indicators that suggest specific information was found
    const hasPositiveIndicators = (
      lowerContent.includes('located at') ||
      lowerContent.includes('offers') ||
      lowerContent.includes('provides') ||
      lowerContent.includes('features') ||
      lowerContent.includes('phone') ||
      lowerContent.includes('contact') ||
      lowerContent.includes('website') ||
      lowerContent.includes('pricing') ||
      lowerContent.includes('assisted living') ||
      lowerContent.includes('memory care')
    );
    
    // Consider it found if:
    // 1. We have actual data (photos, website, phone) regardless of text
    // 2. OR there are positive indicators and no negative ones
    // 3. OR we have market data even if the specific community wasn't found
    const found = hasActualData || (!hasNegativeContext && hasPositiveIndicators) || citations.length > 0;

    if (!found) {
      console.log(`  ⚠️ Community not found by Perplexity`);
      console.log(`  Debug: Content check - contains "${lowerCommunityName}": ${lowerContent.includes(lowerCommunityName)}`);
      console.log(`  Debug: Citations count: ${citations.length}`);
      console.log(`  Debug: Has actual data: ${hasActualData}`);
      console.log(`  Debug: First 200 chars of content: ${lowerContent.substring(0, 200)}`);
      return {
        found: false,
        name: communityName,
        sources: citations
      };
    }
    
    console.log(`  ✅ Found market information for ${communityName} area`);
    
    // Verify the response is about the correct community
    // Check for wrong community names in the content
    const wrongCommunityIndicators = this.detectWrongCommunity(communityName, content, citations);
    if (wrongCommunityIndicators) {
      console.log(`  ⚠️ Response appears to be about wrong community: ${wrongCommunityIndicators}`);
      return {
        found: false,
        name: communityName,
        sources: [],
        notes: `Search results contained information about "${wrongCommunityIndicators}" instead of "${communityName}"`
      };
    }

    // Initialize result object
    const result: CommunityIntelligence = {
      found: true,
      name: communityName,
      sources: citations
    };

    // Extract from structured data if already parsed above
    if (structuredData) {
      // Extract website
      result.officialWebsite = structuredData.website || 
                              structuredData.officialWebsite || 
                              structuredData.url ||
                              this.extractUrl(content);

      // Extract phone
      result.phone = structuredData.phone || 
                     structuredData.phoneNumber || 
                     structuredData.contact ||
                     this.extractPhone(content);

      // Extract address
      result.address = structuredData.address || 
                      structuredData.location ||
                      structuredData.specificLocationFound;

      // Extract pricing
      const pricing: any = {};
      if (structuredData.pricing) {
        if (typeof structuredData.pricing === 'object') {
          Object.assign(pricing, structuredData.pricing);
        } else if (typeof structuredData.pricing === 'string') {
          pricing.general = structuredData.pricing;
        }
      }
      // Check for care-specific pricing
      if (structuredData.assistedLivingPricing) {
        pricing.assistedLiving = structuredData.assistedLivingPricing;
      }
      if (structuredData.memoryCarePricing) {
        pricing.memoryCare = structuredData.memoryCarePricing;
      }
      if (structuredData.independentLivingPricing) {
        pricing.independentLiving = structuredData.independentLivingPricing;
      }

      // Extract care levels
      const careLevels = structuredData.careLevels || 
                        structuredData.careTypes || 
                        [];
      
      // Add from content analysis
      if (lowerContent.includes('assisted living') && !careLevels.includes('Assisted Living')) {
        careLevels.push('Assisted Living');
      }
      if (lowerContent.includes('memory care') && !careLevels.includes('Memory Care')) {
        careLevels.push('Memory Care');
      }

      // Extract amenities
      const amenities = structuredData.amenities || 
                       structuredData.features || 
                       [];

      // Build description from structured data
      const descriptionParts = [];
      
      if (structuredData.description) {
        descriptionParts.push(structuredData.description);
      } else if (structuredData.findings || structuredData.notes) {
        // Extract key findings as description
        const findings = structuredData.findings || structuredData.notes;
        if (Array.isArray(findings)) {
          descriptionParts.push(findings.join(' '));
        } else if (typeof findings === 'string') {
          descriptionParts.push(findings);
        }
      }

      // Add verified status if available
      if (structuredData.verified || structuredData.identityVerified) {
        descriptionParts.push('✓ Identity verified');
      }

      result.pricing = Object.keys(pricing).length > 0 ? pricing : undefined;
      result.careLevels = careLevels.length > 0 ? careLevels : undefined;
      result.amenities = amenities.length > 0 ? amenities : undefined;
      result.description = descriptionParts.join('. ');

    } else {
      // Fallback to pattern extraction for natural language responses
      result.officialWebsite = this.extractUrl(content);
      result.phone = this.extractPhone(content);
      result.address = this.extractAddress(content);
      
      // Extract pricing with patterns
      const pricing: any = {};
      
      // More robust regex patterns for pricing extraction
      const assistedMatch = content.match(/assisted living:?\s*\$?([\d,]+(?:\.\d{2})?)/i) ||
                           content.match(/assisted living[^$]*\$\s*([\d,]+(?:\.\d{2})?)/i);
      if (assistedMatch && assistedMatch[1] && /\d/.test(assistedMatch[1])) {
        pricing.assistedLiving = `$${assistedMatch[1].replace(/,/g, '')}`;
      }
      
      const memoryMatch = content.match(/memory care:?\s*\$?([\d,]+(?:\.\d{2})?)/i) ||
                         content.match(/memory care[^$]*\$\s*([\d,]+(?:\.\d{2})?)/i);
      if (memoryMatch && memoryMatch[1] && /\d/.test(memoryMatch[1])) {
        pricing.memoryCare = `$${memoryMatch[1].replace(/,/g, '')}`;
      }
      
      const independentMatch = content.match(/independent living:?\s*\$?([\d,]+(?:\.\d{2})?)/i) ||
                              content.match(/independent living[^$]*\$\s*([\d,]+(?:\.\d{2})?)/i);
      if (independentMatch && independentMatch[1] && /\d/.test(independentMatch[1])) {
        pricing.independentLiving = `$${independentMatch[1].replace(/,/g, '')}`;
      }

      result.pricing = Object.keys(pricing).length > 0 ? pricing : undefined;

      // Extract care levels
      const careLevels = [];
      if (lowerContent.includes('assisted living')) careLevels.push('Assisted Living');
      if (lowerContent.includes('memory care')) careLevels.push('Memory Care');
      if (lowerContent.includes('independent living')) careLevels.push('Independent Living');
      if (lowerContent.includes('skilled nursing')) careLevels.push('Skilled Nursing');
      
      result.careLevels = careLevels.length > 0 ? careLevels : undefined;

      // Extract amenities
      const amenities = [];
      const amenityKeywords = [
        'dining', 'fitness', 'pool', 'salon', 'library', 'garden',
        'transportation', 'activities', 'pet', 'wifi', 'laundry'
      ];
      
      amenityKeywords.forEach(keyword => {
        if (lowerContent.includes(keyword)) {
          amenities.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
        }
      });
      
      result.amenities = amenities.length > 0 ? amenities : undefined;

      // Extract nearby/comparable communities
      const nearbyOptions = [];
      const communityListPattern = /\d+\.\s*([^:]+?)(?:\s*[-–:]\s*)([^$\n]+)(\$[\d,]+(?:\s*[-–]\s*\$[\d,]+)?)?/g;
      let communityMatch;
      while ((communityMatch = communityListPattern.exec(content)) !== null) {
        const name = communityMatch[1].trim();
        const details = communityMatch[2].trim();
        const pricing = communityMatch[3];
        
        if (name && name.length < 60 && !name.toLowerCase().includes('pricing')) {
          nearbyOptions.push({
            name: name,
            address: details.replace(/\$[\d,]+(?:\s*[-–]\s*\$[\d,]+)?/, '').trim(),
            distance: 'In area',
            pricing: pricing,
            description: details
          });
        }
      }
      
      if (nearbyOptions.length > 0) {
        result.nearbyOptions = nearbyOptions.slice(0, 10);
      }

      // Create a clean description with market analysis info
      let cleanDescription = content
        .replace(/```json[\s\S]*?```/g, '')
        .replace(/\{[\s\S]*?\}/g, '')
        .replace(/https?:\/\/[^\s]+/g, '')
        .replace(/\n+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // Include market analysis if present
      const marketMatch = cleanDescription.match(/(?:market|average|pricing in).+?(?:\.|$)/i);
      const marketInfo = marketMatch ? marketMatch[0] : '';
      
      // Take first meaningful sentence plus market info
      const firstSentence = cleanDescription.match(/^[^.!?]+[.!?]/);
      result.description = marketInfo || (firstSentence ? 
        firstSentence[0].trim() : 
        cleanDescription.slice(0, 200) + (cleanDescription.length > 200 ? '...' : ''));
    }

    return result;
  }

  // Helper extraction functions
  private extractUrl(content: string): string | undefined {
    const match = content.match(/(?:website|site|url):\s*(https?:\/\/[^\s]+)/i) ||
                  content.match(/(https?:\/\/[^\s]+)/);
    return match ? match[1] : undefined;
  }

  private extractPhone(content: string): string | undefined {
    const match = content.match(/(?:phone|tel|call):\s*([\d-().\s]+)/i) ||
                  content.match(/\b(\d{3}[-.)]\s*\d{3}[-.\s]?\d{4})\b/);
    return match ? match[1].trim() : undefined;
  }

  private extractAddress(content: string): string | undefined {
    const match = content.match(/(?:address|located at):\s*([^,\n]+(?:,[^,\n]+)?)/i);
    return match ? match[1].trim() : undefined;
  }

  private extractPhotos(content: string): string[] {
    const photos: string[] = [];
    // Extract image URLs from the content
    const imgPattern = /https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|gif|webp)/gi;
    const matches = content.match(imgPattern);
    if (matches) {
      photos.push(...matches);
    }
    return photos;
  }

  /**
   * Helper to validate if a string is a valid community name
   */
  private isValidCommunityName(name: string): boolean {
    if (!name || name.length < 5 || name.length > 80) return false;
    
    // Skip invalid patterns
    const invalidPatterns = [
      'additional', 'context', 'typically', 'designed for',
      'communities are', 'pricing', 'contact', 'information',
      'available', 'website', 'phone', 'email', 'address'
    ];
    
    const lowerName = name.toLowerCase();
    for (const pattern of invalidPatterns) {
      if (lowerName.includes(pattern)) return false;
    }
    
    // Must not be just symbols or numbers
    if (/^[|\\-•*\d\s]+$/.test(name)) return false;
    
    // Must contain at least one uppercase letter (proper noun)
    if (!/[A-Z]/.test(name)) return false;
    
    return true;
  }
  
  /**
   * Parse nearby communities from Perplexity response
   */
  private parseNearbyOptions(content: string, citations: string[]): CommunityIntelligence {
    console.log('\n=== PARSING NEARBY OPTIONS FROM CONTENT ===');
    console.log(content.substring(0, 1000));
    console.log('=== END CONTENT PREVIEW ===\n');
    
    const nearbyOptions = [];
    
    // First, try to extract community names using multiple patterns
    const communityNames = new Set<string>();
    
    // Pattern 1: Look for bold/marked community names (more flexible)
    const boldPattern = /\*\*([A-Z][^*]+?(?:Estates?|Living|Care|Community|Center|Home|Residence|Village|Manor|Place|Gardens?|Lodge|Park|Heights|Terrace|Court|Plaza|Meadows?|Springs?|Oaks?|Hills?|Valley|of\s+[A-Z]\w+))\*\*/g;
    let boldMatch;
    while ((boldMatch = boldPattern.exec(content)) !== null) {
      const name = boldMatch[1].trim();
      if (this.isValidCommunityName(name)) {
        communityNames.add(name);
        // Also check for parenthetical variations
        const parenMatch = name.match(/^(.+?)\s*\((.+?)\)/);
        if (parenMatch) {
          if (this.isValidCommunityName(parenMatch[1].trim())) {
            communityNames.add(parenMatch[1].trim());
          }
          if (this.isValidCommunityName(parenMatch[2].trim())) {
            communityNames.add(parenMatch[2].trim());
          }
        }
      }
    }
    
    // Also look for numbered list items with community names (even without bold)
    const numberedListPattern = /^\*\*?\d+\.\s*([A-Z][^*\n]+?(?:Estates?|Living|Care|Community|Center|Home|Residence|Village|Manor|Place|Gardens?|Lodge|Park|Heights|Terrace|Court|Plaza|Meadows?|Springs?|Oaks?|Hills?|Valley))\*?\*?/gm;
    let listMatch;
    while ((listMatch = numberedListPattern.exec(content)) !== null) {
      const name = listMatch[1].trim().replace(/\*+$/, '').trim();
      if (this.isValidCommunityName(name)) {
        communityNames.add(name);
      }
    }
    
    // Pattern 2: Communities in numbered lists
    const numberedCommunityPattern = /^\d+\.\s*([A-Z][^:\n]+?(?:Senior Living|Assisted Living|Memory Care|Community|Center|Residence|of\s+[A-Z]\w+))(?:\s*[-–:]|$)/gm;
    let numberedMatch;
    while ((numberedMatch = numberedCommunityPattern.exec(content)) !== null) {
      const name = numberedMatch[1].trim();
      if (this.isValidCommunityName(name)) {
        communityNames.add(name);
      }
    }
    
    // Pattern 3: Look for specific senior living community names
    const specificPattern = /((?:Oakmont|Sunrise|Brookdale|Atria|Holiday|Waterstone|Benchmark|Five Star|Silverado|Belmont Village|Vi at|MorningStar|Aegis|Capital Senior|Enlivant|Discovery|Integral Senior|Life Care Services|Presbyterian|Hebrew)\s+(?:of\s+)?[A-Z]\w+(?:\s+[A-Z]\w+)*)/g;
    let specificMatch;
    while ((specificMatch = specificPattern.exec(content)) !== null) {
      const name = specificMatch[1].trim();
      if (this.isValidCommunityName(name)) {
        communityNames.add(name);
      }
    }
    
    console.log(`Extracted ${communityNames.size} unique community names:`, Array.from(communityNames));
    
    // Convert found names to nearbyOptions format
    Array.from(communityNames).forEach(name => {
      nearbyOptions.push({
        name: name,
        address: '',
        distance: 'In area',
        description: `Senior living community in the area`
      });
    });
    
    // If we didn't find communities with patterns, fall back to line-by-line parsing
    if (nearbyOptions.length === 0) {
      const lines = content.split('\n');
      
      // Pattern 1: Numbered lists
      const numberedPattern = /^\d+\.\s*(.+)/;
      // Pattern 2: Bulleted lists
      const bulletPattern = /^[-•*]\s*(.+)/;
      // Pattern 3: Communities with pricing
      const pricePattern = /\$[\d,]+(?:\s*[-–]\s*\$[\d,]+)?/;
      
      for (const line of lines) {
        let communityInfo = null;
      
      // Check for numbered or bulleted items
      const numberedMatch = line.match(numberedPattern);
      const bulletMatch = line.match(bulletPattern);
      const itemContent = numberedMatch?.[1] || bulletMatch?.[1] || line;
      
      if (itemContent) {
        // Extract name (usually before dash or colon)
        const nameMatch = itemContent.match(/^([^-–:]+)/);
        const name = nameMatch ? nameMatch[1].trim() : itemContent.trim();
        
        // Extract pricing
        const priceMatch = itemContent.match(pricePattern);
        const pricing = priceMatch ? priceMatch[0] : undefined;
        
        // Extract distance
        const distanceMatch = itemContent.match(/(\d+\.?\d*)\s*mi(?:les)?/i);
        const distance = distanceMatch ? `${distanceMatch[1]} miles` : 'In area';
        
        // Extract address if present
        const addressMatch = itemContent.match(/(?:at|located at)\s+([^,]+(?:,\s*[A-Z]{2}\s+\d{5})?)/i);
        const address = addressMatch ? addressMatch[1] : '';
        
        // Only add if we have a reasonable name
        if (name && name.length < 80 && !name.toLowerCase().includes('pricing') && 
            !name.toLowerCase().includes('average') && !name.toLowerCase().includes('market')) {
          nearbyOptions.push({
            name: name,
            address: address,
            distance: distance,
            pricing: pricing,
            description: itemContent
          });
        }
        }
      }
    }
    
    // Return enriched data even for area searches
    return {
      found: nearbyOptions.length > 0,
      name: 'Market Analysis',
      nearbyOptions: nearbyOptions.slice(0, 15),
      description: nearbyOptions.length > 0 
        ? `Found ${nearbyOptions.length} senior living communities in the area with market data`
        : 'No specific communities found in this search',
      sources: citations
    };
  }
}

// Export singleton instance
export const simplifiedPerplexityService = new SimplifiedPerplexityService();
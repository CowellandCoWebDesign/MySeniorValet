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
    for (const citation of citations) {
      const lowerCitation = citation.toLowerCase();
      
      // Look for specific community name patterns in URLs
      if (lowerCitation.includes('hilltop-springs') && requestedName.toLowerCase().includes('hilltop estates')) {
        return 'Hilltop Springs';
      }
      if (lowerCitation.includes('hilltop-estates') && requestedName.toLowerCase().includes('hilltop springs')) {
        return 'Hilltop Estates';
      }
      
      // Generic check for mismatched suffixes in URLs
      for (const suffix of commonSuffixes) {
        if (suffix !== requestedLastWord && lowerCitation.includes(`${requestedFirstWord}-${suffix}`)) {
          return `${requestedFirstWord.charAt(0).toUpperCase() + requestedFirstWord.slice(1)} ${suffix.charAt(0).toUpperCase() + suffix.slice(1)}`;
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

Remember: Only provide details if the facility is EXACTLY named "${communityName}"`;

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
              content: `You are an expert senior living research specialist with STRICT accuracy requirements.
CRITICAL RULES:
1. ONLY provide information about communities with the EXACT name requested
2. If the community name in your sources doesn't match exactly, state that the specific community was not found
3. Never mix or confuse information from different communities with similar names
4. Example: If asked about "Hilltop Estates", DO NOT provide information about "Hilltop Springs" or any other variation
5. Always verify the community name matches exactly before providing any details
Format phone numbers as XXX-XXX-XXXX. Include full website URLs with https://.`
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

    const query = `List senior living communities near ${location}. 
    Include for each:
    - Community name
    - Address
    - Distance from ${location}
    - Brief description
    
    Focus on communities within 10 miles.`;

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
    const lowerContent = content.toLowerCase();
    const lowerCommunityName = communityName.toLowerCase();
    
    // Check if community was found - be more precise with negative indicators
    const notFoundIndicators = [
      'could not find',
      'no information available',
      'unable to find', 
      'no senior living community named',
      'no listings',
      'was not found',
      'was **not found**',
      'not found',
      'cannot be found',
      'does not exist'
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
    
    // Only consider it found if there are no negative indicators AND positive indicators exist
    const found = !hasNegativeContext && hasPositiveIndicators;

    if (!found) {
      console.log(`  ⚠️ Community not found by Perplexity`);
      console.log(`  Debug: Content check - contains "${lowerCommunityName}": ${lowerContent.includes(lowerCommunityName)}`);
      console.log(`  Debug: Citations count: ${citations.length}`);
      console.log(`  Debug: First 200 chars of content: ${lowerContent.substring(0, 200)}`);
      return {
        found: false,
        name: communityName,
        sources: citations
      };
    }
    
    console.log(`  ✅ Found specific information for ${communityName}`);
    
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

    // Check if content contains JSON data
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                     content.match(/(\{[\s\S]*\})/);
    
    let structuredData: any = null;
    if (jsonMatch) {
      try {
        structuredData = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.log('  ⚠️ Could not parse JSON from response');
      }
    }

    // Extract from structured data if available
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
      if (structuredData.memoryCareePricing) {
        pricing.memoryCare = structuredData.memoryCarePricing;
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
      const assistedMatch = content.match(/assisted living:?\s*\$?([\d,]+)/i);
      if (assistedMatch) pricing.assistedLiving = `$${assistedMatch[1]}`;
      
      const memoryMatch = content.match(/memory care:?\s*\$?([\d,]+)/i);
      if (memoryMatch) pricing.memoryCare = `$${memoryMatch[1]}`;
      
      const independentMatch = content.match(/independent living:?\s*\$?([\d,]+)/i);
      if (independentMatch) pricing.independentLiving = `$${independentMatch[1]}`;

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

      // Create a clean description by removing JSON and URLs
      let cleanDescription = content
        .replace(/```json[\s\S]*?```/g, '')
        .replace(/\{[\s\S]*?\}/g, '')
        .replace(/https?:\/\/[^\s]+/g, '')
        .replace(/\n+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // Take first meaningful sentence or 200 chars
      const firstSentence = cleanDescription.match(/^[^.!?]+[.!?]/);
      result.description = firstSentence ? 
        firstSentence[0].trim() : 
        cleanDescription.slice(0, 200) + (cleanDescription.length > 200 ? '...' : '');
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

  /**
   * Parse nearby communities from Perplexity response
   */
  private parseNearbyOptions(content: string, citations: string[]): CommunityIntelligence {
    const nearbyOptions = [];
    
    // Simple pattern to extract community mentions
    const lines = content.split('\n');
    for (const line of lines) {
      if (line.includes('miles') || line.includes('mi')) {
        const nameMatch = line.match(/^[-•*]?\s*([^:,]+)/);
        const distanceMatch = line.match(/(\d+\.?\d*)\s*mi/i);
        
        if (nameMatch) {
          nearbyOptions.push({
            name: nameMatch[1].trim(),
            address: '',
            distance: distanceMatch ? `${distanceMatch[1]} miles` : 'nearby'
          });
        }
      }
    }

    // Always return found: false for area searches since they're fallbacks when specific community isn't found
    return {
      found: false,
      name: 'Area Search',
      nearbyOptions: nearbyOptions.slice(0, 10),
      description: `Found ${nearbyOptions.length} communities in the area`,
      sources: citations
    };
  }
}

// Export singleton instance
export const simplifiedPerplexityService = new SimplifiedPerplexityService();
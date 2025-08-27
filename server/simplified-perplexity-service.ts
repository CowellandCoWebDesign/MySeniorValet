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
   * Step 1: Enhanced query to Perplexity for comprehensive community information
   */
  async findExactCommunity(
    communityName: string, 
    location: string
  ): Promise<CommunityIntelligence> {
    console.log(`🔍 Enhanced Perplexity search for: ${communityName} in ${location}`);

    // Enhanced query with specific instructions for better data extraction
    const query = `Find comprehensive information about "${communityName}" senior living community in ${location}. 

REQUIRED INFORMATION (provide all available):
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

Provide the most current information available from official sources, reviews, and directories.`;

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
              content: 'You are an expert senior living research specialist. Extract and provide all available information in a structured format. Always include phone numbers, websites, and pricing when found. Format phone numbers as XXX-XXX-XXXX. Include full website URLs with https://.'
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
   * Enhanced parser with better extraction patterns
   */
  private parseEnhancedResponse(
    content: string, 
    citations: string[],
    communityName: string
  ): CommunityIntelligence {
    const lowerContent = content.toLowerCase();
    
    // Check if community was found
    const found = !lowerContent.includes('could not find') && 
                  !lowerContent.includes('no information') &&
                  !lowerContent.includes('unable to find');

    if (!found) {
      console.log(`  ⚠️ Community not found by Perplexity`);
      return {
        found: false,
        name: communityName,
        sources: citations
      };
    }

    // Enhanced extraction patterns for all data points
    const result: CommunityIntelligence = {
      found: true,
      name: communityName,
      sources: citations
    };

    // Extract official website with multiple patterns
    const websiteMatch = content.match(/(?:website|site|url):\s*(https?:\/\/[^\s]+)/i) ||
                        content.match(/(https?:\/\/[^\s]+)/);
    const officialWebsite = websiteMatch ? websiteMatch[1] : undefined;

    // Extract phone
    const phoneMatch = content.match(/(?:phone|tel|call):\s*([\d-().\s]+)/i) ||
                      content.match(/\b(\d{3}[-.)]\s*\d{3}[-.\s]?\d{4})\b/);
    const phone = phoneMatch ? phoneMatch[1].trim() : undefined;

    // Extract pricing
    const pricing: any = {};
    const assistedMatch = content.match(/assisted living:?\s*\$?([\d,]+)/i);
    if (assistedMatch) pricing.assistedLiving = `$${assistedMatch[1]}`;
    
    const memoryMatch = content.match(/memory care:?\s*\$?([\d,]+)/i);
    if (memoryMatch) pricing.memoryCare = `$${memoryMatch[1]}`;
    
    const independentMatch = content.match(/independent living:?\s*\$?([\d,]+)/i);
    if (independentMatch) pricing.independentLiving = `$${independentMatch[1]}`;

    // Extract care levels
    const careLevels = [];
    if (lowerContent.includes('assisted living')) careLevels.push('Assisted Living');
    if (lowerContent.includes('memory care')) careLevels.push('Memory Care');
    if (lowerContent.includes('independent living')) careLevels.push('Independent Living');
    if (lowerContent.includes('skilled nursing')) careLevels.push('Skilled Nursing');

    // Extract amenities (simple keyword matching)
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

    return {
      found: true,
      name: communityName,
      officialWebsite,
      phone,
      pricing: Object.keys(pricing).length > 0 ? pricing : undefined,
      careLevels: careLevels.length > 0 ? careLevels : undefined,
      amenities: amenities.length > 0 ? amenities : undefined,
      description: content.slice(0, 500),
      sources: citations
    };
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

    return {
      found: nearbyOptions.length > 0,
      name: 'Area Search',
      nearbyOptions: nearbyOptions.slice(0, 10),
      description: `Found ${nearbyOptions.length} communities in the area`,
      sources: citations
    };
  }
}

// Export singleton instance
export const simplifiedPerplexityService = new SimplifiedPerplexityService();
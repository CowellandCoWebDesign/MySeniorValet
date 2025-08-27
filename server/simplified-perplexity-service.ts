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
   * Step 1: Direct query to Perplexity for exact community match
   */
  async findExactCommunity(
    communityName: string, 
    location: string
  ): Promise<CommunityIntelligence> {
    console.log(`🔍 Asking Perplexity about: ${communityName} in ${location}`);

    const query = `Find information about "${communityName}" senior living community in ${location}. 
    Include:
    - Their official website URL
    - Current pricing for different care levels
    - Phone number and exact address
    - Care levels offered (assisted living, memory care, independent living)
    - Key amenities and features
    - Brief description
    
    Please provide specific, current information from official sources.`;

    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'sonar',
          messages: [
            {
              role: 'system',
              content: 'You are a senior living research assistant. Provide accurate, current information from official sources. If you cannot find the exact community, clearly state that.'
            },
            {
              role: 'user',
              content: query
            }
          ],
          temperature: 0.2,
          max_tokens: 1500,
          stream: false,
          return_citations: true,
          return_images: false,
          return_related_questions: false,
          search_recency_filter: "month",
          top_k: 0,
          presence_penalty: 0,
          frequency_penalty: 1
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

      // Parse the response intelligently
      return this.parsePerplexityResponse(content, citations, communityName);
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
   * Step 2: Get photos from official website only
   */
  async getOfficialPhotos(websiteUrl: string): Promise<string[]> {
    if (!websiteUrl) return [];

    console.log(`📸 Fetching photos from official site: ${websiteUrl}`);

    try {
      const response = await fetch(websiteUrl);
      const html = await response.text();

      // More selective photo extraction - prioritize community photos
      const imageRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
      const photos: string[] = [];
      let match;

      while ((match = imageRegex.exec(html)) !== null) {
        const fullMatch = match[0];
        const imageUrl = match[1];
        
        // Convert relative to absolute URLs
        const absoluteUrl = new URL(imageUrl, websiteUrl).href;
        
        // Skip logos, icons, social media images, tracking pixels
        const skipPatterns = [
          'logo', 'icon', 'pixel', 'twitter', 'facebook', 
          'social', 'x-20-20', 'linkedin', 'youtube', 
          'tracking', 'analytics', '.svg', 'badge'
        ];
        
        const shouldSkip = skipPatterns.some(pattern => 
          absoluteUrl.toLowerCase().includes(pattern) ||
          fullMatch.toLowerCase().includes(pattern)
        );
        
        if (!shouldSkip) {
          // Prioritize images with relevant alt text or filenames
          const relevantPatterns = [
            'community', 'living', 'resident', 'room', 
            'dining', 'activity', 'exterior', 'interior',
            'apartment', 'facility', 'building', 'lounge'
          ];
          
          const isRelevant = relevantPatterns.some(pattern =>
            fullMatch.toLowerCase().includes(pattern) ||
            absoluteUrl.toLowerCase().includes(pattern)
          );
          
          // Add relevant photos first, then others if we don't have enough
          if (isRelevant || photos.length < 3) {
            photos.push(absoluteUrl);
          }
        }
      }

      console.log(`  Found ${photos.length} relevant photos from website`);
      // Return first 10 relevant photos
      return photos.slice(0, 10);
    } catch (error) {
      console.error('Failed to fetch photos:', error);
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
          model: 'sonar',
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
   * Parse Perplexity's natural language response
   */
  private parsePerplexityResponse(
    content: string, 
    citations: string[],
    communityName: string
  ): CommunityIntelligence {
    const lowerContent = content.toLowerCase();
    
    // Check if community was found
    const found = !lowerContent.includes('could not find') && 
                  !lowerContent.includes('no information') &&
                  lowerContent.includes(communityName.toLowerCase());

    if (!found) {
      return {
        found: false,
        name: communityName,
        sources: citations
      };
    }

    // Extract official website
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
import axios from 'axios';

export interface PerplexityResponse {
  id: string;
  model: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
  citations?: string[];
  images?: string[];  // URLs of relevant images found
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class PerplexityAIService {
  private apiKey: string;
  private baseUrl = 'https://api.perplexity.ai/chat/completions';
  
  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY || '';
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async searchRealTime(query: string, context?: string): Promise<{ summary: string; sources: string[]; images?: string[] }> {
    if (!this.isConfigured()) {
      throw new Error('Perplexity API key not configured');
    }

    try {
      const systemPrompt = `You are a senior living research expert providing structured, comprehensive information for families making critical decisions.

${context ? `SPECIFIC SEARCH TARGET:
${context}

Focus ONLY on the exact community and location specified above. Do not mix information from other locations or similar-named facilities.
` : ''}

REQUIRED RESPONSE FORMAT - You MUST structure your response with these exact section headers:

**OFFICIAL WEBSITE:**
[Put the community's official website URL here, or "Not found" if none exists]

**DIRECTORY LISTINGS:**
[List all directory URLs where this community is listed - Caring.com, Seniorly, etc.]

**CURRENT PRICING:**
[Monthly rates by care level, fees, deposits - be specific with dollar amounts]

**CONTACT INFORMATION:**
[Phone number, address, email if available - for THIS specific location only]

**CARE LEVELS OFFERED:**
[Independent Living, Assisted Living, Memory Care, etc.]

**KEY AMENITIES:**
[Main features and services offered]

**AVAILABILITY STATUS:**
[Current availability, waitlist information if known]

**RECENT UPDATES:**
[Any recent news, changes, or reviews from 2024-2025]

**MANAGEMENT/OWNERSHIP:**
[Parent company or management group if applicable]

CRITICAL INSTRUCTIONS:
1. Always use the exact section headers above
2. If no specific information is found for a section, provide context about why and what alternatives exist. For example:
   - Instead of "Information not available", say "No public website found. Contact community directly at [phone] for current information."
   - Or "Pricing varies by care level and room type. Contact for personalized quote."
3. Focus ONLY on the specific location mentioned in the search
4. If you find information about other communities with similar names in different locations, clearly note the distinction
5. Include ALL URLs found - official sites, parent companies, and directories
6. Be specific with pricing when found, but provide market context when exact pricing isn't available
7. Always provide helpful, actionable information - never just say "not available"`;

      const response = await axios.post<PerplexityResponse>(
        this.baseUrl,
        {
          model: 'sonar-pro',  // Use best model for comprehensive, accurate results
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: query
            }
          ],
          max_tokens: 2000,  // Full responses for complete transparency
          temperature: 0.2,
          top_p: 0.9,
          return_images: true,  // Include images from search results
          search_recency_filter: undefined,  // No time restriction - get all available data for transparency
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const summary = response.data.choices[0]?.message?.content || 'No results found';
      const sources = response.data.citations || [];
      const images = response.data.images || [];
      
      // Log the unfiltered Perplexity response for debugging
      console.log('\n=== UNFILTERED PERPLEXITY RESPONSE ===');
      console.log(`Query: ${query}`);
      console.log('Raw Response:');
      console.log(summary);
      console.log('Sources:', sources);
      console.log('Images found:', images?.length || 0);
      console.log('=== END PERPLEXITY RESPONSE ===\n');
      
      return { summary, sources, images };
    } catch (error: any) {
      console.error('Perplexity API error:', error.response?.data || error.message);
      throw new Error('Failed to search real-time data');
    }
  }

  async enhanceCommunityData(communityName: string, location: string): Promise<{
    currentPricing?: string;
    recentReviews?: string;
    availability?: string;
    marketComparison?: string;
  }> {
    if (!this.isConfigured()) {
      return {};
    }

    try {
      const query = `Current pricing and availability for ${communityName} senior living community in ${location}. Include recent reviews and market comparison data from 2024-2025.`;
      
      const result = await this.searchRealTime(query);
      
      // Parse the response for structured data
      return {
        currentPricing: this.extractPricing(result.summary),
        recentReviews: this.extractReviews(result.summary),
        availability: this.extractAvailability(result.summary),
        marketComparison: this.extractMarketData(result.summary)
      };
    } catch (error) {
      console.error(`Failed to enhance data for ${communityName}:`, error);
      return {};
    }
  }

  private extractPricing(text: string): string | undefined {
    // Enhanced extraction for various pricing formats
    const pricingPatterns = [
      // Markdown table cells with pricing
      /\|\s*\$[\d,]+(?:\.\d{2})?\s*(?:[–—-]\s*\$[\d,]+(?:\.\d{2})?)?(?:\s*\/?\s*(?:per\s+)?(?:month|mo|monthly))?\s*\|/gi,
      // Price ranges with various dash types
      /\$[\d,]+(?:\.\d{2})?\s*[–—-]\s*\$[\d,]+(?:\.\d{2})?(?:\s*\/?\s*(?:per\s+)?(?:month|mo|monthly))?/gi,
      // Starting/from prices
      /(?:starting\s+(?:at|from)|from|starts\s+at)\s*\$[\d,]+(?:\.\d{2})?(?:\s*\/?\s*(?:per\s+)?(?:month|mo|monthly))?/gi,
      // Standalone prices with context
      /\$[\d,]+(?:\.\d{2})?(?:\s*\/?\s*(?:per\s+)?(?:month|mo|monthly|day|daily|week|weekly|year|yearly|annually))/gi,
      // Price in sentences
      /(?:cost(?:s)?|price(?:d)?|rate(?:s)?|fee(?:s)?)[^$]*\$[\d,]+(?:\.\d{2})?[^.]*(?:month|mo|week|day|year)/gi,
      // Simple dollar amounts
      /\$[\d,]+(?:\.\d{2})?/g
    ];

    const allMatches = new Set<string>();
    
    for (const pattern of pricingPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          // Clean up markdown table formatting if present
          const cleaned = match.replace(/\|/g, '').trim();
          if (cleaned) allMatches.add(cleaned);
        });
      }
    }

    // Look for pricing information in table rows specifically
    const tableRowPattern = /\|[^|]*\|[^|]*\|\s*([^|]*(?:Living|Care|Memory|Nursing|Skilled)[^|]*)\s*\|\s*([^|]*\$[^|]*)\s*\|/gi;
    let tableMatch;
    while ((tableMatch = tableRowPattern.exec(text)) !== null) {
      const priceCell = tableMatch[2];
      if (priceCell && priceCell.includes('$')) {
        allMatches.add(priceCell.trim());
      }
    }

    if (allMatches.size > 0) {
      const prices = Array.from(allMatches).join(' | ');
      console.log(`💰 Extracted pricing: ${prices}`);
      return prices;
    }

    // If no pricing found with patterns, look for pricing-related sentences
    const pricingContext = text.match(/(?:pricing|cost|rate|fee)[^.]*[.]/gi);
    if (pricingContext && pricingContext.length > 0) {
      const contextStr = pricingContext.join(' ');
      console.log(`💰 Found pricing context: ${contextStr.substring(0, 100)}...`);
      return contextStr;
    }

    console.log(`⚠️ No pricing found in text of length ${text.length}`);
    return undefined;
  }

  private extractReviews(text: string): string | undefined {
    const reviewRegex = /(rated|rating|review|satisfaction)[^.]*[.]/gi;
    const matches = text.match(reviewRegex);
    return matches ? matches.slice(0, 2).join(' ') : undefined;
  }

  private extractAvailability(text: string): string | undefined {
    const availabilityRegex = /(available|vacancy|waitlist|full|accepting)[^.]*[.]/gi;
    const matches = text.match(availabilityRegex);
    return matches ? matches[0] : undefined;
  }

  private extractMarketData(text: string): string | undefined {
    const marketRegex = /(compared to|average|market|typical)[^.]*[.]/gi;
    const matches = text.match(marketRegex);
    return matches ? matches[0] : undefined;
  }

  // Method for enhanced search intelligence compatibility
  async searchCommunityInfo(query: string): Promise<{ success: boolean; data: string; sources?: string[] }> {
    try {
      const result = await this.searchRealTime(query);
      return {
        success: true,
        data: result.summary,
        sources: result.sources
      };
    } catch (error) {
      console.error('Error searching community info:', error);
      return {
        success: false,
        data: 'Community search temporarily unavailable'
      };
    }
  }

  // Enhanced Image Analysis Integration
  async searchWithImageAnalysis(communityName: string, location: string): Promise<{
    summary: string;
    sources: string[];
    images?: string[];
    imageAnalysis?: {
      photoCount: number;
      photoTypes: string[];
      qualityIndicators: string[];
      amenitiesDetected: string[];
      virtualTourAvailable: boolean;
    }
  }> {
    const result = await this.searchRealTime(
      `${communityName} ${location} photos gallery virtual tour floor plans amenities`,
      'Find all available images, photos, virtual tours and visual content'
    );

    // Analyze images if found
    const imageAnalysis = result.images && result.images.length > 0 ? {
      photoCount: result.images.length,
      photoTypes: this.categorizeImages(result.images, result.summary),
      qualityIndicators: this.assessImageQuality(result.summary),
      amenitiesDetected: this.extractAmenitiesFromDescription(result.summary),
      virtualTourAvailable: this.checkVirtualTourAvailability(result.summary)
    } : undefined;

    return {
      ...result,
      imageAnalysis
    };
  }

  private categorizeImages(imageUrls: string[], description: string): string[] {
    const categories = new Set<string>();
    
    // Check URLs for image type hints
    imageUrls.forEach(url => {
      const urlLower = url.toLowerCase();
      if (urlLower.includes('exterior') || urlLower.includes('building')) categories.add('Exterior');
      if (urlLower.includes('interior') || urlLower.includes('room')) categories.add('Interior');
      if (urlLower.includes('dining')) categories.add('Dining');
      if (urlLower.includes('activity') || urlLower.includes('recreation')) categories.add('Activities');
      if (urlLower.includes('floor') || urlLower.includes('plan')) categories.add('Floor Plans');
      if (urlLower.includes('garden') || urlLower.includes('outdoor')) categories.add('Outdoor Spaces');
    });

    // Check description for mentioned photo types
    const descLower = description.toLowerCase();
    if (descLower.includes('apartment') || descLower.includes('suite')) categories.add('Living Spaces');
    if (descLower.includes('fitness') || descLower.includes('gym')) categories.add('Fitness Center');
    if (descLower.includes('library') || descLower.includes('lounge')) categories.add('Common Areas');
    if (descLower.includes('memory care')) categories.add('Specialized Care Areas');

    return Array.from(categories);
  }

  private assessImageQuality(description: string): string[] {
    const indicators: string[] = [];
    const descLower = description.toLowerCase();

    if (descLower.includes('professional photo')) indicators.push('Professional Photography');
    if (descLower.includes('virtual tour')) indicators.push('Virtual Tour Available');
    if (descLower.includes('360') || descLower.includes('panoramic')) indicators.push('360° Views');
    if (descLower.includes('recent') || descLower.includes('updated')) indicators.push('Recently Updated');
    if (descLower.includes('high resolution')) indicators.push('High Resolution');
    if (descLower.includes('drone') || descLower.includes('aerial')) indicators.push('Aerial Views');

    return indicators;
  }

  private extractAmenitiesFromDescription(description: string): string[] {
    const amenities: string[] = [];
    const amenityKeywords = [
      { keyword: 'pool', amenity: 'Swimming Pool' },
      { keyword: 'fitness', amenity: 'Fitness Center' },
      { keyword: 'salon', amenity: 'Beauty/Barber Salon' },
      { keyword: 'library', amenity: 'Library' },
      { keyword: 'theater', amenity: 'Theater/Media Room' },
      { keyword: 'chapel', amenity: 'Chapel/Spiritual Center' },
      { keyword: 'dining', amenity: 'Restaurant-Style Dining' },
      { keyword: 'transportation', amenity: 'Transportation Services' },
      { keyword: 'garden', amenity: 'Gardens/Outdoor Spaces' },
      { keyword: 'pet', amenity: 'Pet-Friendly' },
      { keyword: 'wifi', amenity: 'WiFi/Internet' },
      { keyword: 'laundry', amenity: 'Laundry Services' },
      { keyword: 'parking', amenity: 'Parking' },
      { keyword: 'security', amenity: '24/7 Security' }
    ];

    const descLower = description.toLowerCase();
    amenityKeywords.forEach(({ keyword, amenity }) => {
      if (descLower.includes(keyword)) {
        amenities.push(amenity);
      }
    });

    return amenities;
  }

  private checkVirtualTourAvailability(description: string): boolean {
    const virtualTourKeywords = ['virtual tour', '360 tour', 'online tour', 'video tour', 'interactive tour'];
    const descLower = description.toLowerCase();
    return virtualTourKeywords.some(keyword => descLower.includes(keyword));
  }

  // Method to get comprehensive visual information about a community
  async getVisualIntelligence(communityName: string, location: string): Promise<{
    hasPhotos: boolean;
    photoQuality: 'high' | 'medium' | 'low' | 'none';
    virtualTourUrl?: string;
    photoGalleryUrl?: string;
    floorPlansAvailable: boolean;
    visualTransparencyScore: number; // 0-100
  }> {
    const searchResult = await this.searchWithImageAnalysis(communityName, location);
    
    const hasPhotos = (searchResult.images && searchResult.images.length > 0) || false;
    const analysis = searchResult.imageAnalysis;
    
    // Calculate photo quality based on indicators
    let photoQuality: 'high' | 'medium' | 'low' | 'none' = 'none';
    if (analysis) {
      if (analysis.qualityIndicators.length >= 3) photoQuality = 'high';
      else if (analysis.qualityIndicators.length >= 1) photoQuality = 'medium';
      else if (hasPhotos) photoQuality = 'low';
    }

    // Extract URLs from search results
    const virtualTourUrl = this.extractUrl(searchResult.summary, ['virtual tour', '360 tour']);
    const photoGalleryUrl = this.extractUrl(searchResult.summary, ['photo gallery', 'photos', 'gallery']);
    
    // Check for floor plans
    const floorPlansAvailable = searchResult.summary.toLowerCase().includes('floor plan') ||
                                (analysis?.photoTypes.includes('Floor Plans') || false);

    // Calculate transparency score based on visual content availability
    let transparencyScore = 0;
    if (hasPhotos) transparencyScore += 30;
    if (photoQuality === 'high') transparencyScore += 20;
    if (analysis?.virtualTourAvailable) transparencyScore += 25;
    if (floorPlansAvailable) transparencyScore += 15;
    if (analysis && analysis.photoTypes.length > 3) transparencyScore += 10;

    return {
      hasPhotos,
      photoQuality,
      virtualTourUrl,
      photoGalleryUrl,
      floorPlansAvailable,
      visualTransparencyScore: Math.min(100, transparencyScore)
    };
  }

  private extractUrl(text: string, keywords: string[]): string | undefined {
    // Simple URL extraction near keywords
    const urlRegex = /https?:\/\/[^\s]+/g;
    const urls = text.match(urlRegex);
    
    if (!urls) return undefined;
    
    // Find URLs near relevant keywords
    for (const url of urls) {
      const surroundingText = text.substring(
        Math.max(0, text.indexOf(url) - 50),
        Math.min(text.length, text.indexOf(url) + url.length + 50)
      ).toLowerCase();
      
      if (keywords.some(keyword => surroundingText.includes(keyword))) {
        return url;
      }
    }
    
    return undefined;
  }
}

export const perplexityService = new PerplexityAIService();
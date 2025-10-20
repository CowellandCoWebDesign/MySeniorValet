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
  images?: string[];  // URLs of relevant images found (deprecated)
  provider_metadata?: {
    images?: Array<{
      imageUrl: string;
      originUrl: string;
      height?: number;
      width?: number;
    }>;
  };
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
      const systemPrompt = `You are a senior living research expert. Provide comprehensive community information.

${context ? `Target: ${context}` : ''}

Provide a detailed overview, then include ALL the following sections (use "Not found" if unavailable):

**OFFICIAL WEBSITE:** [URL or "Not found"]

**PRICING & RATES:**
- Monthly rates by care level (Independent, Assisted, Memory Care)
- Entry fees or deposits
- Additional service fees
- Financial assistance programs accepted

**FLOOR PLANS & ROOM OPTIONS:**
- Available room types (studio, 1BR, 2BR, suites)
- Square footage ranges
- Private vs shared rooms
- Special features (kitchenettes, balconies)

**CONTACT INFORMATION:**
- Phone number
- Full address
- Email if available
- Tours/admissions contact

**CARE LEVELS & SERVICES:**
- All care types offered
- Specialized programs (dementia, Parkinson's, diabetes)
- Medical services on-site
- Therapy services (PT, OT, Speech)
- Hospice/palliative care

**AMENITIES & FEATURES:**
- Dining (number of meals, restaurant-style, special diets)
- Activities & social programs
- Transportation services
- Pet policies
- Beauty salon/barber
- Fitness facilities
- Outdoor spaces

**STAFFING & CARE:**
- Staff-to-resident ratios
- 24/7 nursing availability
- Staff qualifications
- Languages spoken

**ADDITIONAL DETAILS:**
- Visiting hours
- Religious services
- Insurance accepted (Medicare, Medicaid, private)
- Respite care availability
- Year established
- Number of residents/capacity
- Recent awards or certifications

Include specific details, prices, and numbers whenever available.`;

      const response = await axios.post<PerplexityResponse>(
        this.baseUrl,
        {
          model: 'sonar-pro',  // Enhanced model with low context for cost optimization
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
          max_tokens: 3000,  // Increased for more complete responses
          temperature: 0.2,
          top_p: 0.9,
          return_images: true,  // Include images from search results
          return_related_questions: false,
          search_domain_filter: [],  // Search all domains for maximum photo coverage
          search_recency_filter: undefined,  // No time restriction - search all available data from last 2+ years
          web_search_options: {
            search_context_size: "medium"  // Medium context for balanced cost and quality
          },
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
      
      // Extract real image URLs from provider_metadata if available (return_images feature)
      let images: string[] = [];
      if (response.data.provider_metadata?.images) {
        console.log(`📸 Found ${response.data.provider_metadata.images.length} real images from provider_metadata`);
        images = response.data.provider_metadata.images.map(img => img.imageUrl);
      } else {
        // Fallback to extracting from response text
        // Normalize response.data.images to ensure they're strings
        const normalizedImages = response.data.images ? 
          response.data.images.map((img: any) => {
            // Handle various image formats from Perplexity API
            if (typeof img === 'string') return img;
            if (img?.imageUrl) return img.imageUrl;
            if (img?.url) return img.url;
            return null;
          }).filter(Boolean) : [];
        
        images = this.extractImagesFromResponse(summary, normalizedImages);
      }
      
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
    floorPlans?: string;
    amenities?: string;
    careServices?: string;
    staffing?: string;
  }> {
    if (!this.isConfigured()) {
      return {};
    }

    try {
      const query = `Comprehensive information for ${communityName} senior living community in ${location}. Include all pricing tiers, floor plans, amenities, services, staffing, and recent data from 2024-2025.`;
      
      const result = await this.searchRealTime(query);
      
      // Parse the response for structured data
      return {
        currentPricing: this.extractPricing(result.summary),
        recentReviews: this.extractReviews(result.summary),
        availability: this.extractAvailability(result.summary),
        marketComparison: this.extractMarketData(result.summary),
        floorPlans: this.extractFloorPlans(result.summary),
        amenities: this.extractAmenities(result.summary),
        careServices: this.extractCareServices(result.summary),
        staffing: this.extractStaffing(result.summary)
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

  private extractFloorPlans(text: string): string | undefined {
    // Extract floor plan information
    const floorPlanSection = text.match(/\*\*FLOOR PLANS[^*]*\*\*[\s\S]*?(?=\*\*[A-Z]|\n\n|$)/i);
    if (floorPlanSection) {
      return floorPlanSection[0].replace(/\*\*/g, '').trim();
    }
    
    // Fallback: look for room type mentions
    const roomRegex = /(studio|one.bedroom|two.bedroom|suite|apartment|floor.plan|square.feet|sq\.?ft)[^.]*[.]/gi;
    const matches = text.match(roomRegex);
    return matches ? matches.join(' ') : undefined;
  }

  private extractAmenities(text: string): string | undefined {
    // Extract amenities section
    const amenitiesSection = text.match(/\*\*AMENITIES[^*]*\*\*[\s\S]*?(?=\*\*[A-Z]|\n\n|$)/i);
    if (amenitiesSection) {
      return amenitiesSection[0].replace(/\*\*/g, '').trim();
    }
    
    // Fallback: look for amenity mentions
    const amenityRegex = /(dining|restaurant|salon|fitness|pool|garden|activity|transportation|pet)[^.]*[.]/gi;
    const matches = text.match(amenityRegex);
    return matches ? matches.join(' ') : undefined;
  }

  private extractCareServices(text: string): string | undefined {
    // Extract care services section
    const careSection = text.match(/\*\*CARE LEVELS[^*]*\*\*[\s\S]*?(?=\*\*[A-Z]|\n\n|$)/i);
    if (careSection) {
      return careSection[0].replace(/\*\*/g, '').trim();
    }
    
    // Fallback: look for care service mentions
    const careRegex = /(assisted.living|memory.care|skilled.nursing|independent.living|therapy|medical|hospice)[^.]*[.]/gi;
    const matches = text.match(careRegex);
    return matches ? matches.join(' ') : undefined;
  }

  private extractStaffing(text: string): string | undefined {
    // Extract staffing section
    const staffSection = text.match(/\*\*STAFFING[^*]*\*\*[\s\S]*?(?=\*\*[A-Z]|\n\n|$)/i);
    if (staffSection) {
      return staffSection[0].replace(/\*\*/g, '').trim();
    }
    
    // Fallback: look for staffing mentions
    const staffRegex = /(staff|nurse|caregiver|ratio|qualified|certified|24.7|24\/7)[^.]*[.]/gi;
    const matches = text.match(staffRegex);
    return matches ? matches.join(' ') : undefined;
  }

  private extractImagesFromResponse(text: string, perplexityImages?: string[]): string[] {
    const extractedImages = new Set<string>();
    
    // First add any images that Perplexity API might return directly
    if (perplexityImages && Array.isArray(perplexityImages)) {
      perplexityImages.forEach(img => extractedImages.add(img));
    }
    
    // Extract image URLs from the text content
    // Look for markdown image syntax: ![alt](url)
    const markdownImageRegex = /!\[[^\]]*\]\(([^)]+)\)/g;
    let match;
    while ((match = markdownImageRegex.exec(text)) !== null) {
      if (match[1] && this.isValidImageUrl(match[1])) {
        extractedImages.add(match[1]);
      }
    }
    
    // Look for direct image URLs in the text
    const imageUrlRegex = /https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp|svg|JPG|JPEG|PNG)(?:\?[^\s]*)?/gi;
    const urlMatches = text.match(imageUrlRegex);
    if (urlMatches) {
      urlMatches.forEach(url => {
        if (this.isValidImageUrl(url)) {
          extractedImages.add(url.trim());
        }
      });
    }
    
    // Look for URLs that might be images (common CDN patterns)
    const cdnImageRegex = /https?:\/\/[^\s]*(?:cloudinary|imgix|fastly|cloudfront|amazonaws|googleusercontent|ggpht|fbcdn|twimg)[^\s]*\/[^\s]+/gi;
    const cdnMatches = text.match(cdnImageRegex);
    if (cdnMatches) {
      cdnMatches.forEach(url => {
        if (this.isValidImageUrl(url)) {
          extractedImages.add(url.trim());
        }
      });
    }
    
    const imageArray = Array.from(extractedImages);
    if (imageArray.length > 0) {
      console.log(`📸 Extracted ${imageArray.length} images from Perplexity response`);
    }
    return imageArray;
  }
  
  private isValidImageUrl(url: string): boolean {
    if (!url || url.length < 10) return false;
    
    // Filter out known non-image URLs
    const excludePatterns = [
      /\.pdf$/i,
      /\.doc/i,
      /\.xls/i,
      /youtube\.com/i,
      /vimeo\.com/i,
      /facebook\.com(?!\/.*\/photos)/i,
      /twitter\.com(?!\/.*\/photo)/i,
      /linkedin\.com/i
    ];
    
    for (const pattern of excludePatterns) {
      if (pattern.test(url)) return false;
    }
    
    return true;
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
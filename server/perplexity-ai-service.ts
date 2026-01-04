/**
 * @deprecated LEGACY SERVICE - DO NOT USE FOR NEW DEVELOPMENT
 * This service uses the old Perplexity Sonar chat API (variable pricing).
 * 
 * For all new implementations, use:
 *   import { perplexitySearchAPI } from './services/perplexity-search-api';
 * 
 * The Search API offers fixed $5/1K pricing and is the recommended approach.
 * This file is kept for backward compatibility with existing test routes.
 * 
 * Migration completed: January 2026
 */
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
      const systemPrompt = `You are an expert senior living research analyst providing comprehensive, SEO-optimized community information for family caregivers searching for senior living options.

${context ? `Target Facility: ${context}` : ''}

**IMPORTANT: Write in a natural, informative style that helps families make informed decisions. Include specific facts, numbers, and details.**

Provide information in this structured format:

## Overview
Write a compelling 2-3 paragraph overview of this community highlighting what makes it unique, its care philosophy, and who it's best suited for. Include the year established, capacity, and any notable features.

## Pricing & Financial Information
### Monthly Rates (provide ranges when exact rates unavailable)
- Independent Living: $X,XXX - $X,XXX/month
- Assisted Living: $X,XXX - $X,XXX/month  
- Memory Care: $X,XXX - $X,XXX/month
- Skilled Nursing: $X,XXX - $X,XXX/month

### Additional Costs
- Entry/Community Fee: $X,XXX
- Second Person Fee: $X,XXX/month
- Level of Care Charges: Starting at $X,XXX/month

### Financial Assistance
List accepted: Medicare, Medicaid, VA Benefits, Long-term Care Insurance, etc.

## Room Types & Floor Plans
List all available options with square footage:
- Studio apartments (XXX-XXX sq ft)
- One-bedroom apartments (XXX-XXX sq ft)
- Two-bedroom apartments (XXX-XXX sq ft)
- Companion/shared rooms
- Private rooms

## Care Services & Medical Support
### Care Levels Offered
- Independent Living
- Assisted Living
- Memory Care/Alzheimer's Care
- Skilled Nursing
- Rehabilitation Services

### Medical Services On-Site
- 24/7 nursing availability
- Medication management
- Physical therapy, occupational therapy, speech therapy
- Specialized care programs (diabetes, Parkinson's, cardiac)

### Staff Qualifications
- Staff-to-resident ratios
- Nurse credentials (RN, LPN)
- Caregiver training and certifications

## Amenities & Lifestyle
### Dining
- Meals per day, dining style
- Special diets accommodated
- Restaurant-style vs cafeteria

### Activities & Programs
- Daily activities, entertainment
- Fitness programs, wellness center
- Religious services, spiritual programs
- Educational and social events

### Community Features
- Beauty salon/barber shop
- Library, computer center
- Outdoor spaces, gardens
- Pet-friendly policies
- Transportation services

## Contact Information
- **Phone:** (XXX) XXX-XXXX
- **Address:** Full street address, City, State ZIP
- **Website:** Full URL
- **Email:** if available

## Recent Reviews & Ratings
Summarize recent feedback from Google Reviews, Yelp, or Caring.com including:
- Average rating (X.X/5 stars)
- Number of reviews
- Common praise and concerns
- Notable quotes from families

## Health & Safety
- Most recent inspection results
- Any violations or citations  
- Compliance status
- COVID-19 protocols if relevant

## Virtual Tour & Photos
If available, note virtual tour links and describe facility appearance.

Include specific numbers, prices, and factual details wherever possible. For unavailable information, state "Contact community for current information" rather than "Not found".`;

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
          max_tokens: 4000,  // Increased for more comprehensive SEO content
          temperature: 0.1,  // Lower temperature for more factual, consistent responses
          top_p: 0.95,
          return_images: true,  // Include images from search results
          return_related_questions: false,
          search_domain_filter: [],  // Search all domains for maximum coverage
          search_recency_filter: 'year',  // Focus on recent data for accuracy
          web_search_options: {
            search_context_size: "high"  // High context for comprehensive data
          },
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000  // 60 second timeout for comprehensive searches
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
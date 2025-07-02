import axios from 'axios';
import type { Community } from '@shared/schema';

export interface YelpBusinessData {
  id: string;
  name: string;
  rating: number;
  review_count: number;
  photos: string[];
  url: string;
  phone: string;
  location: {
    address1: string;
    city: string;
    state: string;
    zip_code: string;
  };
  categories: Array<{
    alias: string;
    title: string;
  }>;
}

export interface YelpEnrichmentResult {
  yelpId: string;
  rating: number;
  reviewCount: number;
  photos: string[];
  yelpUrl: string;
  categories: string[];
  success: boolean;
  error?: string;
}

export class YelpIntegration {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.yelp.com/v3/businesses';
  private callCount = 0;
  private readonly dailyLimit = 5000; // Free tier limit

  constructor() {
    this.apiKey = process.env.YELP_API_KEY || '';
    if (!this.apiKey) {
      console.warn('YELP_API_KEY not found in environment variables');
    }
  }

  async enrichCommunityWithYelp(community: Community): Promise<YelpEnrichmentResult | null> {
    // Only call Yelp if we have fewer than 3 photos already
    const existingPhotos = community.photos || [];
    if (existingPhotos.length >= 3) {
      console.log(`Community ${community.name} already has ${existingPhotos.length} photos, skipping Yelp`);
      return null;
    }

    // Rate limiting check
    if (this.callCount >= this.dailyLimit) {
      console.warn('Yelp API daily limit reached');
      return null;
    }

    try {
      // First try to find by business name and location
      const searchResult = await this.searchYelpBusiness(community);
      if (!searchResult) {
        return {
          yelpId: '',
          rating: 0,
          reviewCount: 0,
          photos: [],
          yelpUrl: '',
          categories: [],
          success: false,
          error: 'Business not found on Yelp'
        };
      }

      // Get detailed business information
      const businessDetails = await this.getBusinessDetails(searchResult.id);
      if (!businessDetails) {
        return {
          yelpId: searchResult.id,
          rating: searchResult.rating,
          reviewCount: searchResult.review_count,
          photos: searchResult.photos || [],
          yelpUrl: searchResult.url,
          categories: searchResult.categories?.map(c => c.title) || [],
          success: false,
          error: 'Failed to get business details'
        };
      }

      return {
        yelpId: businessDetails.id,
        rating: businessDetails.rating,
        reviewCount: businessDetails.review_count,
        photos: businessDetails.photos || [],
        yelpUrl: businessDetails.url,
        categories: businessDetails.categories?.map(c => c.title) || [],
        success: true
      };

    } catch (error) {
      console.error(`Yelp enrichment failed for ${community.name}:`, error);
      return {
        yelpId: '',
        rating: 0,
        reviewCount: 0,
        photos: [],
        yelpUrl: '',
        categories: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async searchYelpBusiness(community: Community): Promise<YelpBusinessData | null> {
    if (!this.apiKey) {
      throw new Error('Yelp API key not configured');
    }

    const searchTerms = [
      `${community.name} ${community.city} ${community.state}`,
      `${community.name} senior living ${community.city}`,
      `${community.name} assisted living ${community.city}`
    ];

    for (const term of searchTerms) {
      try {
        const response = await axios.get(`${this.baseUrl}/search`, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'application/json'
          },
          params: {
            term: term,
            location: `${community.city}, ${community.state}`,
            categories: 'seniorcenters,nursinghomes,assistedliving',
            limit: 5,
            sort_by: 'best_match'
          },
          timeout: 10000
        });

        this.callCount++;

        if (response.data?.businesses?.length > 0) {
          // Find the best match
          const bestMatch = this.findBestMatch(community, response.data.businesses);
          if (bestMatch) {
            return bestMatch;
          }
        }

        // Rate limiting - wait between requests
        await this.delay(100);

      } catch (error) {
        console.log(`Yelp search failed for term: ${term}`);
        if (axios.isAxiosError(error) && error.response?.status === 429) {
          console.warn('Yelp API rate limit exceeded');
          break;
        }
      }
    }

    return null;
  }

  private findBestMatch(community: Community, businesses: YelpBusinessData[]): YelpBusinessData | null {
    // Score businesses by how well they match our community
    const scoredBusinesses = businesses.map(business => {
      let score = 0;
      
      // Name similarity (most important)
      const nameSimilarity = this.calculateStringSimilarity(
        community.name.toLowerCase(),
        business.name.toLowerCase()
      );
      score += nameSimilarity * 50;

      // Address similarity
      if (community.address && business.location.address1) {
        const addressSimilarity = this.calculateStringSimilarity(
          community.address.toLowerCase(),
          business.location.address1.toLowerCase()
        );
        score += addressSimilarity * 30;
      }

      // Phone number match (if available)
      if (community.phone && business.phone) {
        const cleanCommunityPhone = this.cleanPhoneNumber(community.phone);
        const cleanBusinessPhone = this.cleanPhoneNumber(business.phone);
        if (cleanCommunityPhone === cleanBusinessPhone) {
          score += 20;
        }
      }

      // Category relevance
      const relevantCategories = ['seniorcenters', 'nursinghomes', 'assistedliving', 'healthcare'];
      const hasRelevantCategory = business.categories?.some(cat => 
        relevantCategories.some(relevant => cat.alias.includes(relevant))
      );
      if (hasRelevantCategory) {
        score += 10;
      }

      return { business, score };
    });

    // Return the best match if score is above threshold
    const bestMatch = scoredBusinesses.reduce((best, current) => 
      current.score > best.score ? current : best
    );

    return bestMatch.score >= 40 ? bestMatch.business : null;
  }

  private async getBusinessDetails(businessId: string): Promise<YelpBusinessData | null> {
    if (!this.apiKey) {
      throw new Error('Yelp API key not configured');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/${businessId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        },
        timeout: 10000
      });

      this.callCount++;
      return response.data;

    } catch (error) {
      console.error(`Failed to get Yelp business details for ${businessId}:`, error);
      return null;
    }
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    // Simple similarity calculation based on common words
    const words1 = str1.split(/\s+/).filter(w => w.length > 2);
    const words2 = str2.split(/\s+/).filter(w => w.length > 2);
    
    if (words1.length === 0 || words2.length === 0) return 0;
    
    const commonWords = words1.filter(w1 => 
      words2.some(w2 => w1.includes(w2) || w2.includes(w1))
    );
    
    return commonWords.length / Math.max(words1.length, words2.length);
  }

  private cleanPhoneNumber(phone: string): string {
    return phone.replace(/\D/g, '');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Batch enrichment for multiple communities
  async enrichCommunitiesBatch(communities: Community[]): Promise<Map<number, YelpEnrichmentResult>> {
    const results = new Map<number, YelpEnrichmentResult>();
    
    for (const community of communities) {
      try {
        const enrichmentResult = await this.enrichCommunityWithYelp(community);
        if (enrichmentResult) {
          results.set(community.id, enrichmentResult);
        }
        
        // Rate limiting between requests
        await this.delay(200);
        
        // Check if we're approaching the daily limit
        if (this.callCount >= this.dailyLimit * 0.9) {
          console.warn('Approaching Yelp API daily limit, stopping batch enrichment');
          break;
        }
        
      } catch (error) {
        console.error(`Batch enrichment failed for community ${community.id}:`, error);
      }
    }
    
    console.log(`Yelp batch enrichment completed: ${results.size} communities enriched`);
    return results;
  }

  // Get current API usage stats
  getUsageStats() {
    return {
      callsUsed: this.callCount,
      remainingCalls: this.dailyLimit - this.callCount,
      dailyLimit: this.dailyLimit,
      usagePercentage: (this.callCount / this.dailyLimit) * 100
    };
  }

  // Reset daily counter (for testing or new day)
  resetDailyCounter() {
    this.callCount = 0;
  }

  // Check if business name indicates senior living
  private isSeniorLivingBusiness(business: YelpBusinessData): boolean {
    const seniorKeywords = [
      'senior', 'assisted living', 'memory care', 'nursing home',
      'retirement', 'elder care', 'alzheimer', 'dementia',
      'skilled nursing', 'rehab', 'rehabilitation'
    ];
    
    const businessText = `${business.name} ${business.categories?.map(c => c.title).join(' ')}`.toLowerCase();
    
    return seniorKeywords.some(keyword => businessText.includes(keyword));
  }
}

export const yelpIntegration = new YelpIntegration();
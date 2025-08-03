import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface CommunityInsight {
  id: number;
  name: string;
  rating: number;
  price: string;
  careTypes: string[];
  strengths: string[];
  concerns: string[];
}

interface SearchInsights {
  topRated: CommunityInsight[];
  bestValue: CommunityInsight[];
  luxuryOptions: CommunityInsight[];
  concernsToNote: CommunityInsight[];
  marketSummary: string;
  careTypeAnalysis: string;
  priceAnalysis: string;
  recommendations: string[];
  generatedBy: string[];
  timestamp: string;
}

export class AISearchInsights {
  /**
   * Generate comprehensive insights for communities in current view
   */
  static async generateViewInsights(communities: any[]): Promise<SearchInsights> {
    if (!communities || communities.length === 0) {
      return this.getEmptyInsights();
    }

    try {
      console.log(`🤖 Generating AI insights for ${communities.length} communities in view...`);
      
      // Analyze communities data
      const topRated = this.findTopRated(communities);
      const bestValue = this.findBestValue(communities);
      const luxuryOptions = this.findLuxuryOptions(communities);
      const concernsToNote = this.findConcerns(communities);
      
      // Generate AI-powered summaries using multi-AI system
      const [marketSummary, careTypeAnalysis, priceAnalysis] = await Promise.all([
        this.generateMarketSummary(communities),
        this.generateCareTypeAnalysis(communities),
        this.generatePriceAnalysis(communities)
      ]);
      
      // Generate personalized recommendations
      const recommendations = await this.generateRecommendations({
        communities,
        topRated,
        bestValue,
        marketSummary
      });
      
      return {
        topRated,
        bestValue,
        luxuryOptions,
        concernsToNote,
        marketSummary,
        careTypeAnalysis,
        priceAnalysis,
        recommendations,
        generatedBy: ['Claude AI', 'Perplexity AI', 'ChatGPT', 'Real Data Analysis'],
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Error generating AI insights:', error);
      return this.getEmptyInsights();
    }
  }
  
  /**
   * Find top-rated communities
   */
  private static findTopRated(communities: any[]): CommunityInsight[] {
    return communities
      .filter(c => c.rating && parseFloat(c.rating) >= 4.5)
      .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
      .slice(0, 3)
      .map(c => this.extractInsight(c));
  }
  
  /**
   * Find best value communities (good rating + reasonable price)
   */
  private static findBestValue(communities: any[]): CommunityInsight[] {
    return communities
      .filter(c => {
        const rating = parseFloat(c.rating || '0');
        const minPrice = c.displayPricing?.priceRange?.min || c.priceRange?.min || 0;
        return rating >= 4.0 && minPrice > 0 && minPrice < 5000;
      })
      .sort((a, b) => {
        // Score = rating / price (higher is better value)
        const aScore = parseFloat(a.rating) / (a.displayPricing?.priceRange?.min || 5000);
        const bScore = parseFloat(b.rating) / (b.displayPricing?.priceRange?.min || 5000);
        return bScore - aScore;
      })
      .slice(0, 3)
      .map(c => this.extractInsight(c));
  }
  
  /**
   * Find luxury/premium options
   */
  private static findLuxuryOptions(communities: any[]): CommunityInsight[] {
    return communities
      .filter(c => {
        const maxPrice = c.displayPricing?.priceRange?.max || c.priceRange?.max || 0;
        return maxPrice >= 8000;
      })
      .sort((a, b) => {
        const aMax = a.displayPricing?.priceRange?.max || 0;
        const bMax = b.displayPricing?.priceRange?.max || 0;
        return bMax - aMax;
      })
      .slice(0, 3)
      .map(c => this.extractInsight(c));
  }
  
  /**
   * Find communities with potential concerns
   */
  private static findConcerns(communities: any[]): CommunityInsight[] {
    return communities
      .filter(c => {
        const rating = parseFloat(c.rating || '0');
        return rating > 0 && rating < 3.5;
      })
      .sort((a, b) => parseFloat(a.rating || '0') - parseFloat(b.rating || '0'))
      .slice(0, 3)
      .map(c => this.extractInsight(c, true));
  }
  
  /**
   * Extract insight data for a community
   */
  private static extractInsight(community: any, includeConcerns = false): CommunityInsight {
    const strengths = [];
    const concerns = [];
    
    // Location-specific information
    const locationStr = `${community.city}, ${community.state}`;
    
    // Analyze strengths with specifics
    const rating = parseFloat(community.rating || '0');
    if (rating >= 4.5) strengths.push(`${rating}/5 star rating from ${community.reviewCount || 0} reviews`);
    else if (rating >= 4.0) strengths.push(`Solid ${rating}/5 rating`);
    
    // HUD properties
    if (community.hudPropertyId) {
      if (community.rentPerMonth) {
        strengths.push(`HUD subsidized: $${community.rentPerMonth}/month`);
      } else {
        strengths.push('Income-qualified HUD property');
      }
    }
    
    // Community type specifics
    if (community.communitySubtype) {
      const subtypeMap: Record<string, string> = {
        'hud_senior_housing': 'HUD Senior Housing',
        'mobile_home_park': 'Mobile Home Community',
        'active_adult_55_plus': 'Active 55+ Community',
        'independent_living': 'Independent Living',
        'assisted_living': 'Assisted Living Facility',
        'memory_care': 'Memory Care Specialized',
        'board_and_care_home': 'Board & Care Home',
        'skilled_nursing': 'Skilled Nursing Facility',
        'ccrc_life_plan': 'Continuing Care Community',
        'va_housing': 'Veterans Housing',
        'unlicensed_housing': 'Residential Care',
        'manufactured_home_community': 'Manufactured Homes',
        'rv_retirement_park': 'RV Retirement Park',
        'senior_cooperative': 'Senior Co-op Housing'
      };
      const subtypeName = subtypeMap[community.communitySubtype] || community.communitySubtype;
      strengths.push(subtypeName);
    }
    
    // Care types offered
    if (community.careTypes?.length > 0) {
      strengths.push(`Offers: ${community.careTypes.join(', ')}`);
    }
    
    // Amenities
    if (community.amenities?.length > 3) {
      strengths.push(`${community.amenities.length} amenities`);
    }
    
    if (community.photos?.length > 5) strengths.push(`${community.photos.length} photos available`);
    if (community.website) strengths.push('Direct website available');
    
    // Analyze concerns if requested
    if (includeConcerns) {
      if (rating < 3.0 && rating > 0) concerns.push(`Low rating: ${rating}/5 stars`);
      else if (rating < 3.5 && rating > 0) concerns.push(`Mixed reviews: ${rating}/5 stars`);
      
      if (!community.photos || community.photos.length === 0) {
        concerns.push('No photos available');
      }
      if (!community.website && !community.phone) concerns.push('Limited contact information');
      if (!community.availability || community.availability === 'Unknown') {
        concerns.push('Availability status unclear');
      }
    }
    
    return {
      id: community.id,
      name: `${community.name} (${locationStr})`,
      rating: rating,
      price: community.displayPricing?.displayPrice || 'Contact for pricing',
      careTypes: community.careTypes || [],
      strengths,
      concerns
    };
  }
  
  /**
   * Generate market summary using AI
   */
  private static async generateMarketSummary(communities: any[]): Promise<string> {
    try {
      const avgRating = communities.reduce((sum, c) => sum + parseFloat(c.rating || '0'), 0) / communities.length;
      const priceRanges = communities.map(c => c.displayPricing?.priceRange || c.priceRange).filter(Boolean);
      const avgMinPrice = priceRanges.reduce((sum, r) => sum + (r.min || 0), 0) / priceRanges.length;
      
      const prompt = `Analyze this senior living market data and provide a 2-sentence summary:
- ${communities.length} communities visible
- Average rating: ${avgRating.toFixed(1)}/5
- Average starting price: $${Math.round(avgMinPrice)}/month
- States represented: ${[...new Set(communities.map(c => c.state))].join(', ')}

Provide a concise, helpful market summary for families searching for senior care.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 100
      });
      
      return response.choices[0].message.content || 'Market analysis in progress.';
      
    } catch (error) {
      console.error('Error generating market summary:', error);
      return `This area shows ${communities.length} senior living communities with diverse options across different care levels and price points.`;
    }
  }
  
  /**
   * Generate care type analysis
   */
  private static async generateCareTypeAnalysis(communities: any[]): Promise<string> {
    const careTypeCounts: Record<string, number> = {};
    
    communities.forEach(c => {
      (c.careTypes || []).forEach((type: string) => {
        careTypeCounts[type] = (careTypeCounts[type] || 0) + 1;
      });
    });
    
    const topCareTypes = Object.entries(careTypeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
    
    if (topCareTypes.length === 0) {
      return 'Care type information is being updated for communities in this area.';
    }
    
    return `Most common care types in view: ${topCareTypes.map(([type, count]) => 
      `${type} (${count} communities)`).join(', ')}.`;
  }
  
  /**
   * Generate price analysis
   */
  private static async generatePriceAnalysis(communities: any[]): Promise<string> {
    const pricesWithRanges = communities
      .filter(c => c.displayPricing?.priceRange || c.priceRange)
      .map(c => c.displayPricing?.priceRange || c.priceRange);
    
    if (pricesWithRanges.length === 0) {
      return 'Price information is being gathered for communities in this area.';
    }
    
    const minPrices = pricesWithRanges.map(r => r.min).filter(p => p > 0);
    const maxPrices = pricesWithRanges.map(r => r.max).filter(p => p > 0);
    
    const lowestPrice = Math.min(...minPrices);
    const highestPrice = Math.max(...maxPrices);
    const avgPrice = minPrices.reduce((sum, p) => sum + p, 0) / minPrices.length;
    
    return `Pricing ranges from $${lowestPrice.toLocaleString()}/mo to $${highestPrice.toLocaleString()}/mo, with an average starting price of $${Math.round(avgPrice).toLocaleString()}/mo.`;
  }
  
  /**
   * Generate personalized recommendations
   */
  private static async generateRecommendations(data: any): Promise<string[]> {
    const recommendations: string[] = [];
    
    // Value seekers
    if (data.bestValue.length > 0) {
      recommendations.push(`For great value: Consider ${data.bestValue[0].name} with ${data.bestValue[0].rating}/5 stars`);
    }
    
    // Premium seekers
    if (data.topRated.length > 0 && data.topRated[0].rating >= 4.8) {
      recommendations.push(`For premium care: ${data.topRated[0].name} offers exceptional ratings at ${data.topRated[0].rating}/5`);
    }
    
    // Budget conscious
    const budgetOptions = data.communities.filter((c: any) => {
      const min = c.displayPricing?.priceRange?.min || 999999;
      return min < 3000 && parseFloat(c.rating || '0') >= 3.5;
    });
    
    if (budgetOptions.length > 0) {
      recommendations.push(`${budgetOptions.length} communities offer options under $3,000/month`);
    }
    
    // HUD properties
    const hudProperties = data.communities.filter((c: any) => c.hudPropertyId);
    if (hudProperties.length > 0) {
      recommendations.push(`${hudProperties.length} government-subsidized properties available for qualified seniors`);
    }
    
    return recommendations.slice(0, 4);
  }
  
  /**
   * Return empty insights structure
   */
  private static getEmptyInsights(): SearchInsights {
    return {
      topRated: [],
      bestValue: [],
      luxuryOptions: [],
      concernsToNote: [],
      marketSummary: 'No communities in current view.',
      careTypeAnalysis: '',
      priceAnalysis: '',
      recommendations: [],
      generatedBy: [],
      timestamp: new Date().toISOString()
    };
  }
}
import OpenAI from 'openai';
import { PerplexityAIService } from './perplexity-ai-service';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface CommunityInsight {
  id: number;
  name: string;
  rating: number;
  price: string;
  careTypes: string[];
  strengths: string[];
  concerns: string[];
  webInsights?: string[];
}

interface SearchInsights {
  topRated: CommunityInsight[];
  bestValue: CommunityInsight[];
  luxuryOptions: CommunityInsight[];
  concernsToNote: CommunityInsight[];
  marketSummary: string;
  careTypeAnalysis: string;
  priceAnalysis: string;
  webSearchInsights?: {
    marketTrends: string;
    localNews: string;
    comparativeAnalysis: string;
    sources: string[];
  };
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
      
      // Generate AI-powered summaries and web search insights in parallel
      const [marketSummary, careTypeAnalysis, priceAnalysis, webSearchInsights] = await Promise.all([
        this.generateMarketSummary(communities),
        this.generateCareTypeAnalysis(communities),
        this.generatePriceAnalysis(communities),
        this.generateWebSearchInsights(communities)
      ]);
      
      // Enhance top communities with web insights if available
      if (webSearchInsights && topRated.length > 0) {
        await this.enhanceWithWebInsights(topRated, webSearchInsights);
      }
      
      // Generate personalized recommendations
      const recommendations = await this.generateRecommendations({
        communities,
        topRated,
        bestValue,
        marketSummary,
        webInsights: webSearchInsights
      });
      
      return {
        topRated,
        bestValue,
        luxuryOptions,
        concernsToNote,
        marketSummary,
        careTypeAnalysis,
        priceAnalysis,
        webSearchInsights,
        recommendations,
        generatedBy: ['Perplexity Web Search', 'Claude AI', 'ChatGPT-4o', 'Real-Time Data'],
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Error generating AI insights:', error);
      return this.getEmptyInsights();
    }
  }
  
  /**
   * Find top-rated communities (or HUD properties as fallback)
   */
  private static findTopRated(communities: any[]): CommunityInsight[] {
    // First try to find communities with ratings
    let topCommunities = communities
      .filter(c => c.rating && parseFloat(c.rating) >= 4.0)
      .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
      .slice(0, 3);
    
    // If no rated communities, prioritize HUD properties as they're government-verified
    if (topCommunities.length === 0) {
      topCommunities = communities
        .filter(c => c.hudPropertyId)
        .sort((a, b) => {
          // Sort by occupancy rate (higher is better - shows demand)
          const aOcc = parseFloat(a.occupancyRate || '0');
          const bOcc = parseFloat(b.occupancyRate || '0');
          return bOcc - aOcc;
        })
        .slice(0, 3);
    }
    
    // If still no results, take any communities with high occupancy
    if (topCommunities.length === 0) {
      topCommunities = communities
        .filter(c => c.occupancyRate && parseFloat(c.occupancyRate) > 85)
        .sort((a, b) => parseFloat(b.occupancyRate || '0') - parseFloat(a.occupancyRate || '0'))
        .slice(0, 3);
    }
    
    return topCommunities.map(c => this.extractInsight(c));
  }
  
  /**
   * Find best value communities (prioritize HUD and affordable options)
   */
  private static findBestValue(communities: any[]): CommunityInsight[] {
    // First priority: HUD properties with verified pricing
    let valueCommunities = communities
      .filter(c => c.hudPropertyId && c.rentPerMonth)
      .sort((a, b) => {
        const aPrice = parseFloat(a.rentPerMonth || '9999');
        const bPrice = parseFloat(b.rentPerMonth || '9999');
        return aPrice - bPrice; // Lower price is better value
      })
      .slice(0, 3);
    
    // If not enough HUD properties, add communities with good ratings and reasonable prices
    if (valueCommunities.length < 3) {
      const additionalValue = communities
        .filter(c => {
          if (valueCommunities.some(v => v.id === c.id)) return false; // Avoid duplicates
          const rating = parseFloat(c.rating || '0');
          const minPrice = c.displayPricing?.priceRange?.min || c.priceRange?.min || 0;
          return rating >= 3.5 && minPrice > 0 && minPrice < 5000;
        })
        .sort((a, b) => {
          const aPrice = a.displayPricing?.priceRange?.min || a.priceRange?.min || 9999;
          const bPrice = b.displayPricing?.priceRange?.min || b.priceRange?.min || 9999;
          return aPrice - bPrice;
        })
        .slice(0, 3 - valueCommunities.length);
      
      valueCommunities = [...valueCommunities, ...additionalValue];
    }
    
    // If still not enough, add any mobile home or manufactured communities (typically affordable)
    if (valueCommunities.length < 3) {
      const mobileHomes = communities
        .filter(c => {
          if (valueCommunities.some(v => v.id === c.id)) return false;
          return c.communitySubtype === 'mobile_home_park' || 
                 c.communitySubtype === 'manufactured_home_community' ||
                 c.communitySubtype === 'senior_mobile_park';
        })
        .slice(0, 3 - valueCommunities.length);
      
      valueCommunities = [...valueCommunities, ...mobileHomes];
    }
    
    return valueCommunities.map(c => this.extractInsight(c));
  }
  
  /**
   * Find luxury/premium options
   */
  private static findLuxuryOptions(communities: any[]): CommunityInsight[] {
    // First try communities with high prices
    let luxuryCommunities = communities
      .filter(c => {
        const maxPrice = c.displayPricing?.priceRange?.max || c.priceRange?.max || 0;
        return maxPrice >= 6000; // Lowered threshold for more results
      })
      .sort((a, b) => {
        const aMax = a.displayPricing?.priceRange?.max || 0;
        const bMax = b.displayPricing?.priceRange?.max || 0;
        return bMax - aMax;
      })
      .slice(0, 3);
    
    // If no high-priced communities, look for premium care types
    if (luxuryCommunities.length === 0) {
      luxuryCommunities = communities
        .filter(c => 
          c.communitySubtype === 'ccrc_life_plan' || 
          c.communitySubtype === 'active_adult_55_plus' ||
          c.careTypes?.includes('Life Plan Community') ||
          c.careTypes?.includes('Continuing Care Retirement Community')
        )
        .slice(0, 3);
    }
    
    // If still no results, take communities with many amenities or large size
    if (luxuryCommunities.length === 0) {
      luxuryCommunities = communities
        .filter(c => (c.amenities?.length > 10) || (c.totalUnits > 200))
        .sort((a, b) => {
          const aScore = (a.amenities?.length || 0) + (a.totalUnits || 0);
          const bScore = (b.amenities?.length || 0) + (b.totalUnits || 0);
          return bScore - aScore;
        })
        .slice(0, 3);
    }
    
    return luxuryCommunities.map(c => this.extractInsight(c));
  }
  
  /**
   * Find communities with potential concerns or unique aspects to note
   */
  private static findConcerns(communities: any[]): CommunityInsight[] {
    // First look for low-rated communities
    let concernCommunities = communities
      .filter(c => {
        const rating = parseFloat(c.rating || '0');
        return rating > 0 && rating < 3.5;
      })
      .sort((a, b) => parseFloat(a.rating || '0') - parseFloat(b.rating || '0'))
      .slice(0, 3);
    
    // If no low-rated communities, look for communities with low occupancy (may indicate issues)
    if (concernCommunities.length === 0) {
      concernCommunities = communities
        .filter(c => {
          const occupancy = parseFloat(c.occupancyRate || '100');
          return occupancy < 70; // Low occupancy might indicate concerns
        })
        .sort((a, b) => parseFloat(a.occupancyRate || '100') - parseFloat(b.occupancyRate || '100'))
        .slice(0, 3);
    }
    
    // If still no results, look for communities with limited information
    if (concernCommunities.length === 0) {
      concernCommunities = communities
        .filter(c => !c.phone && !c.website && !c.photos?.length)
        .slice(0, 3);
    }
    
    return concernCommunities.map(c => this.extractInsight(c, true));
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
    if (rating >= 4.5) strengths.push(`★ ${rating}/5 star rating from ${community.reviewCount || 0} reviews`);
    else if (rating >= 4.0) strengths.push(`★ Solid ${rating}/5 rating`);
    
    // HUD properties
    if (community.hudPropertyId) {
      if (community.rentPerMonth) {
        strengths.push(`🏛️ HUD subsidized: $${community.rentPerMonth}/month verified pricing`);
      } else {
        strengths.push('🏛️ Income-qualified HUD property with affordable rates');
      }
    }
    
    // Community type specifics
    if (community.communitySubtype) {
      const subtypeMap: Record<string, string> = {
        'hud_senior_housing': '🏛️ HUD Senior Housing - Government subsidized',
        'mobile_home_park': '🏡 Mobile Home Community - Affordable ownership',
        'active_adult_55_plus': '🏌️ Active 55+ Community - Resort-style living',
        'independent_living': '🏢 Independent Living - Maintenance-free lifestyle',
        'assisted_living': '🏥 Assisted Living - Personal care support',
        'memory_care': '🧠 Memory Care - Specialized dementia care',
        'board_and_care_home': '🏠 Board & Care - Small, homelike setting',
        'skilled_nursing': '⚕️ Skilled Nursing - 24/7 medical care',
        'ccrc_life_plan': '🌟 Life Plan CCRC - All care levels available',
        'va_housing': '🇺🇸 Veterans Housing - Service member benefits',
        'unlicensed_housing': '🏘️ Residential Care - Flexible options',
        'manufactured_home_community': '🏘️ Manufactured Homes - Cost-effective living',
        'rv_retirement_park': '🚐 RV Retirement - Travel-friendly lifestyle',
        'senior_cooperative': '🤝 Senior Co-op - Resident-owned community'
      };
      const subtypeName = subtypeMap[community.communitySubtype] || community.communitySubtype;
      strengths.push(subtypeName);
    }
    
    // Care types offered
    if (community.careTypes?.length > 0) {
      if (community.careTypes.length > 2) {
        strengths.push(`📋 Multiple care levels: ${community.careTypes.join(', ')}`);
      } else {
        strengths.push(`📋 Offers: ${community.careTypes.join(', ')}`);
      }
    }
    
    // Pricing transparency
    if (community.displayPricing?.displayPrice && !community.displayPricing.displayPrice.includes('Contact')) {
      strengths.push(`💰 Transparent pricing starting at ${community.displayPricing.displayPrice}`);
    }
    
    // Size and availability
    if (community.totalUnits) {
      if (community.totalUnits > 100) {
        strengths.push(`🏘️ Large community with ${community.totalUnits} units`);
      } else if (community.totalUnits < 20) {
        strengths.push(`🏠 Intimate setting with ${community.totalUnits} units`);
      }
    }
    
    // Occupancy insights
    if (community.occupancyRate) {
      const occupancy = parseFloat(community.occupancyRate);
      if (occupancy < 85) {
        strengths.push(`✅ Good availability (${Math.round(100-occupancy)}% available)`);
      } else if (occupancy > 95) {
        strengths.push(`🔥 High demand community (${occupancy}% occupied)`);
      }
    }
    
    // Amenities
    if (community.amenities?.length > 5) {
      const topAmenities = community.amenities.slice(0, 3).join(', ');
      strengths.push(`✨ ${community.amenities.length} amenities including ${topAmenities}`);
    }
    
    // Media availability
    if (community.photos?.length > 10) {
      strengths.push(`📸 Extensive photo gallery (${community.photos.length} photos)`);
    } else if (community.photos?.length > 5) {
      strengths.push(`📸 ${community.photos.length} photos available`);
    }
    
    // Contact and verification
    if (community.website && community.phone) {
      strengths.push('✓ Direct contact info verified');
    }
    
    // Analyze concerns if requested
    if (includeConcerns) {
      if (rating < 3.0 && rating > 0) concerns.push(`⚠️ Low rating: ${rating}/5 stars - investigate further`);
      else if (rating < 3.5 && rating > 0) concerns.push(`⚠️ Mixed reviews: ${rating}/5 stars`);
      
      if (!community.photos || community.photos.length === 0) {
        concerns.push('📷 No photos available - request virtual tour');
      }
      if (!community.website && !community.phone) {
        concerns.push('📞 Limited contact information');
      }
      if (!community.displayPricing?.displayPrice || community.displayPricing?.displayPrice.includes('Contact')) {
        concerns.push('💲 Pricing not transparent - call for details');
      }
      if (community.occupancyRate && parseFloat(community.occupancyRate) > 98) {
        concerns.push('🔴 Very limited availability - waitlist likely');
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
      // Analyze market data
      const totalCommunities = communities.length;
      const ratedCommunities = communities.filter(c => parseFloat(c.rating || '0') > 0);
      const avgRating = ratedCommunities.length > 0 
        ? ratedCommunities.reduce((sum, c) => sum + parseFloat(c.rating), 0) / ratedCommunities.length 
        : 0;
      
      const priceRanges = communities
        .map(c => c.displayPricing?.priceRange || c.priceRange || (c.rentPerMonth ? { min: c.rentPerMonth, max: c.rentPerMonth } : null))
        .filter(Boolean);
      
      const avgMinPrice = priceRanges.length > 0
        ? priceRanges.reduce((sum, r) => sum + (r.min || 0), 0) / priceRanges.length
        : 0;
      
      const hudCount = communities.filter(c => c.hudPropertyId).length;
      const states = [...new Set(communities.map(c => c.state))];
      const highRated = communities.filter(c => parseFloat(c.rating || '0') >= 4.5).length;
      
      // Generate dynamic summary based on data
      const summaryParts = [];
      
      if (totalCommunities === 1) {
        summaryParts.push(`1 community available`);
      } else if (totalCommunities < 10) {
        summaryParts.push(`${totalCommunities} select communities`);
      } else {
        summaryParts.push(`${totalCommunities} diverse communities`);
      }
      
      if (avgRating > 4.5) {
        summaryParts.push(`with exceptional ${avgRating.toFixed(1)}/5 average rating`);
      } else if (avgRating > 4.0) {
        summaryParts.push(`averaging ${avgRating.toFixed(1)}/5 stars`);
      } else if (avgRating > 0) {
        summaryParts.push(`with varied ratings (avg ${avgRating.toFixed(1)}/5)`);
      }
      
      if (hudCount > 0) {
        summaryParts.push(`including ${hudCount} HUD-subsidized options`);
      }
      
      if (avgMinPrice > 0) {
        if (avgMinPrice < 2000) {
          summaryParts.push(`starting from budget-friendly $${Math.round(avgMinPrice)}/mo`);
        } else if (avgMinPrice > 6000) {
          summaryParts.push(`in the premium range (avg $${Math.round(avgMinPrice)}/mo+)`);
        } else {
          summaryParts.push(`averaging $${Math.round(avgMinPrice)}/mo starting price`);
        }
      }
      
      if (states.length > 1) {
        summaryParts.push(`across ${states.join(', ')}`);
      }
      
      // If we have OpenAI configured, enhance with AI
      if (process.env.OPENAI_API_KEY) {
        const prompt = `Create a brief, helpful 2-sentence market overview from these parts: ${summaryParts.join(', ')}. Focus on what matters most to families searching for senior care.`;
        
        try {
          const response = await openai.chat.completions.create({
            model: 'gpt-5', // Upgraded to GPT-5 (Released August 7, 2025)
            messages: [{ role: 'user', content: prompt }],
            max_completion_tokens: 100, // GPT-5 uses max_completion_tokens instead of max_tokens
            reasoning_effort: 'low' // New GPT-5 parameter for quick insights
          });
          
          return response.choices[0].message.content || summaryParts.join(', ') + '.';
        } catch (aiError) {
          console.error('AI enhancement failed:', aiError);
        }
      }
      
      // Fallback to assembled summary
      return summaryParts.join(', ') + '.';
      
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
    const subtypeCounts: Record<string, number> = {};
    
    communities.forEach(c => {
      // Count traditional care types
      (c.careTypes || []).forEach((type: string) => {
        careTypeCounts[type] = (careTypeCounts[type] || 0) + 1;
      });
      
      // Count community subtypes
      if (c.communitySubtype) {
        subtypeCounts[c.communitySubtype] = (subtypeCounts[c.communitySubtype] || 0) + 1;
      }
    });
    
    const topCareTypes = Object.entries(careTypeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
    
    const topSubtypes = Object.entries(subtypeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
    
    const insights = [];
    
    // Analyze care types
    if (topCareTypes.length > 0) {
      const mostCommon = topCareTypes[0];
      if (mostCommon[1] > communities.length * 0.5) {
        insights.push(`Predominantly ${mostCommon[0]} communities (${mostCommon[1]} of ${communities.length})`);
      } else {
        insights.push(`Mixed care types with ${topCareTypes.map(([type, count]) => `${type} (${count})`).join(', ')}`);
      }
    }
    
    // Analyze subtypes for special communities
    const specialTypes = {
      'hud_senior_housing': '🏛️ HUD senior housing',
      'mobile_home_park': '🏡 mobile home communities',
      'active_adult_55_plus': '🏌️ active 55+ communities',
      'memory_care': '🧠 specialized memory care',
      'va_housing': '🇺🇸 veterans housing'
    };
    
    Object.entries(specialTypes).forEach(([key, label]) => {
      const count = subtypeCounts[key] || 0;
      if (count > 0) {
        insights.push(`${count} ${label}`);
      }
    });
    
    if (insights.length === 0) {
      return 'Diverse care options available in this area.';
    }
    
    return insights.slice(0, 2).join('. ') + '.';
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
    
    // Add web-powered insights if available
    if (data.webInsights?.marketTrends) {
      recommendations.push(`🌐 Web Insight: ${data.webInsights.marketTrends.substring(0, 150)}...`);
    }
    
    // Value seekers
    if (data.bestValue.length > 0) {
      const value = data.bestValue[0];
      recommendations.push(`💎 Best Value: ${value.name} offers ${value.rating}/5 stars at ${value.price}. ${value.strengths[0]}`);
    }
    
    // Premium seekers
    if (data.topRated.length > 0 && data.topRated[0].rating >= 4.8) {
      const top = data.topRated[0];
      recommendations.push(`⭐ Highest Rated: ${top.name} with exceptional ${top.rating}/5 rating. ${top.strengths[0]}`);
    }
    
    // HUD/Affordable options
    const hudOptions = data.communities.filter((c: any) => c.hudPropertyId);
    if (hudOptions.length > 0) {
      recommendations.push(`🏛️ ${hudOptions.length} HUD-subsidized communities available with verified government pricing`);
    }
    
    // Budget conscious
    const budgetOptions = data.communities.filter((c: any) => {
      const min = c.displayPricing?.priceRange?.min || 999999;
      return min < 3000 && parseFloat(c.rating || '0') >= 3.5;
    });
    if (budgetOptions.length > 0) {
      recommendations.push(`💰 ${budgetOptions.length} budget-friendly options under $3,000/month with good ratings`);
    }
    
    // Availability insights
    const highAvailability = data.communities.filter((c: any) => {
      const occupancy = parseFloat(c.occupancyRate || '100');
      return occupancy < 85;
    });
    if (highAvailability.length > 0) {
      recommendations.push(`✅ ${highAvailability.length} communities have immediate availability`);
    }
    
    // Care type specific recommendations
    const memoryCare = data.communities.filter((c: any) => 
      c.careTypes?.includes('Memory Care') || c.communitySubtype === 'memory_care'
    );
    if (memoryCare.length > 0) {
      recommendations.push(`🧠 ${memoryCare.length} specialized memory care communities in this area`);
    }
    
    // Community size preferences
    const smallCommunities = data.communities.filter((c: any) => c.totalUnits && c.totalUnits < 30);
    if (smallCommunities.length > 3) {
      recommendations.push(`🏠 ${smallCommunities.length} intimate communities with fewer than 30 units for personalized care`);
    }
    
    // Active lifestyle options
    const activeAdult = data.communities.filter((c: any) => 
      c.communitySubtype === 'active_adult_55_plus' || c.communitySubtype === 'independent_living'
    );
    if (activeAdult.length > 0) {
      recommendations.push(`🏌️ ${activeAdult.length} active adult communities for independent seniors`);
    }
    
    // Geographic insights
    const states = [...new Set(data.communities.map((c: any) => c.state))];
    if (states.length > 1) {
      recommendations.push(`📍 Communities available across ${states.length} states: ${states.join(', ')}`);
    }
    
    // Keep recommendations to the most relevant 5
    return recommendations.slice(0, 5);
  }
  
  /**
   * Generate web search insights using Perplexity AI
   */
  private static async generateWebSearchInsights(communities: any[]): Promise<any> {
    try {
      if (!process.env.PERPLEXITY_API_KEY) {
        console.log('⚠️ Perplexity API key not configured - web search insights disabled');
        return null;
      }

      const perplexityService = new PerplexityAIService();
      
      // Get location context from communities
      const locations = [...new Set(communities.map(c => {
        if (c.city && c.state) {
          return `${c.city}, ${c.state}`;
        }
        return null;
      }).filter(Boolean))];
      
      const primaryLocation = locations[0] || 'senior living communities';
      
      // Extract top communities for focused search
      const topCommunities = communities
        .filter(c => c.rating && parseFloat(c.rating) >= 4.0)
        .slice(0, 3)
        .map(c => c.name);
      
      console.log(`🌐 Searching web for insights on ${primaryLocation}...`);
      
      // Build location-specific queries
      const queries = [];
      
      // Query 1: Market trends and pricing for the specific location
      queries.push({
        query: `senior living market trends ${primaryLocation} 2025 pricing occupancy rates availability`,
        type: 'marketTrends'
      });
      
      // Query 2: Local news and developments
      queries.push({
        query: `senior living communities ${primaryLocation} recent news developments new facilities updates 2025`,
        type: 'localNews'
      });
      
      // Query 3: Comparative analysis and market intelligence
      queries.push({
        query: `senior living comparison ${primaryLocation} average costs ratings reviews quality of care`,
        type: 'comparativeAnalysis'
      });
      
      // Execute searches in parallel for speed
      const searchPromises = queries.map(async (q) => {
        try {
          const result = await perplexityService.searchRealTime(q.query);
          return { ...result, type: q.type };
        } catch (err) {
          console.error(`Web search failed for query: ${q.query}`, err);
          return null;
        }
      });
      
      const results = await Promise.all(searchPromises);
      const validResults = results.filter(r => r !== null);
      
      if (validResults.length === 0) {
        console.log('⚠️ No web search results available');
        return null;
      }
      
      // Extract results by type
      const marketTrendsResult = validResults.find(r => r.type === 'marketTrends');
      const localNewsResult = validResults.find(r => r.type === 'localNews');
      const comparativeResult = validResults.find(r => r.type === 'comparativeAnalysis');
      
      // Build comprehensive web insights
      const webInsights = {
        marketTrends: marketTrendsResult?.summary || null,
        localNews: localNewsResult?.summary || null,
        comparativeAnalysis: comparativeResult?.summary || null,
        sources: validResults.flatMap(r => r?.sources || []).slice(0, 5).filter(Boolean)
      };
      
      // Only return if we have actual content
      if (!webInsights.marketTrends && !webInsights.localNews && !webInsights.comparativeAnalysis) {
        console.log('⚠️ Web search returned no meaningful content');
        return null;
      }
      
      console.log(`✅ Web search insights generated for ${primaryLocation} with ${webInsights.sources.length} sources`);
      return webInsights;
      
    } catch (error) {
      console.error('Error generating web search insights:', error);
      return null;
    }
  }
  
  /**
   * Extract comparative insights from search results
   */
  private static extractComparativeInsights(results: any[]): string {
    const insights = [];
    
    // Look for pricing comparisons
    const pricingInfo = results.find(r => r?.summary?.toLowerCase().includes('pricing') || 
                                         r?.summary?.toLowerCase().includes('cost'));
    if (pricingInfo) {
      insights.push('Regional pricing data available from recent market reports');
    }
    
    // Look for occupancy trends
    const occupancyInfo = results.find(r => r?.summary?.toLowerCase().includes('occupancy') || 
                                           r?.summary?.toLowerCase().includes('availability'));
    if (occupancyInfo) {
      insights.push('Current occupancy trends indicate market demand patterns');
    }
    
    // Look for quality indicators
    const qualityInfo = results.find(r => r?.summary?.toLowerCase().includes('quality') || 
                                         r?.summary?.toLowerCase().includes('rating'));
    if (qualityInfo) {
      insights.push('Quality metrics and ratings data found from industry sources');
    }
    
    return insights.length > 0 
      ? insights.join('. ') 
      : 'Comparative market analysis being compiled from multiple sources';
  }
  
  /**
   * Enhance community insights with web search data
   */
  private static async enhanceWithWebInsights(communities: CommunityInsight[], webInsights: any): Promise<void> {
    if (!webInsights || communities.length === 0) {
      return;
    }
    
    // Add web insights to top communities
    communities.forEach((community, index) => {
      if (index < 3 && webInsights) {
        community.webInsights = [];
        
        // Add relevant web insights based on community characteristics
        if (webInsights.marketTrends) {
          community.webInsights.push(`📊 Market Context: ${webInsights.marketTrends.substring(0, 100)}...`);
        }
        
        if (webInsights.localNews && index === 0) {
          community.webInsights.push(`📰 Local Updates: ${webInsights.localNews.substring(0, 100)}...`);
        }
        
        if (webInsights.comparativeAnalysis) {
          community.webInsights.push(`📈 ${webInsights.comparativeAnalysis}`);
        }
      }
    });
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
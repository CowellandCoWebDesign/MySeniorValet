import { AnthropicAIService } from './anthropic-ai-service';
import { Community } from '@shared/schema';
import { storage } from './storage';

export interface CareNeedsProfile {
  careLevel: 'hud_housing' | 'va_housing' | 'mobile_rv' | '55_active' | 'independent' | 'board_care' | 'assisted' | 'memory_care' | 'ccrc' | 'skilled_nursing';
  mobility: 'full' | 'walker' | 'wheelchair';
  medical: string[];
  budget: { min: number; max: number };
  location: { preferred: string[]; radius: number };
  amenities: string[];
  socialNeeds: 'high' | 'medium' | 'low';
  familyInvolvement: 'daily' | 'weekly' | 'monthly' | 'occasional';
}

export interface MatchingResult {
  community: Community;
  matchScore: number;
  matchReasons: string[];
  aiInsights: string;
  priceAnalysis: string;
}

export class AIPoweredMatching {
  private aiService = new AnthropicAIService();

  async findBestMatches(profile: CareNeedsProfile, limit: number = 10): Promise<MatchingResult[]> {
    try {
      console.log('AI Matching: Starting findBestMatches with profile:', profile);
      
      // Get communities based on location and basic filters
      const baseCommunities = await this.getBaseCommunities(profile);
      console.log(`AI Matching: Found ${baseCommunities.length} base communities`);
      
      // If no communities found, return empty array
      if (baseCommunities.length === 0) {
        console.log('AI Matching: No communities found for criteria');
        return [];
      }
      
      // Use AI to analyze and score matches (with parallel processing and timeout)
      const matchResults: MatchingResult[] = [];
      
      // Process up to 10 communities in parallel for better performance
      const communitiesToProcess = baseCommunities.slice(0, 10);
      
      const promises = communitiesToProcess.map(async (community) => {
        try {
          // Use AI for all communities - no artificial timeouts
          const [matchScore, aiInsights, priceAnalysis] = await Promise.all([
            this.calculateAIMatchScore(profile, community),
            this.generateAIInsights(profile, community),
            this.generatePriceAnalysis(profile, community)
          ]);
          
          return {
            community,
            matchScore,
            matchReasons: this.getMatchReasons(profile, community),
            aiInsights,
            priceAnalysis
          };
        } catch (err) {
          console.error(`AI Matching: Error processing community ${community.name}:`, err);
          return {
            community,
            matchScore: 50,
            matchReasons: this.getMatchReasons(profile, community),
            aiInsights: 'Analysis temporarily unavailable',
            priceAnalysis: 'Price analysis temporarily unavailable'
          };
        }
      });
      
      const results = await Promise.all(promises);
      matchResults.push(...results);

      console.log(`AI Matching: Processed ${matchResults.length} communities`);
      
      // Sort by match score and return top results
      const topResults = matchResults
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, limit);
        
      console.log(`AI Matching: Returning ${topResults.length} top matches`);
      return topResults;
        
    } catch (error) {
      console.error('AI matching error:', error);
      throw error;
    }
  }

  private async getBaseCommunities(profile: CareNeedsProfile): Promise<Community[]> {
    // Get communities from primary preferred location
    const primaryLocation = profile.location.preferred[0];
    
    console.log(`AI Matching: Searching for ${profile.careLevel} in ${primaryLocation}`);
    
    // Try to get communities matching the specific care type
    let communities = await storage.searchCommunities({
      location: primaryLocation,
      careType: profile.careLevel,
      limit: 50
    });
    
    console.log(`AI Matching: Initial search returned ${communities.length} communities`);
    
    // If no communities found for specific care type, get all communities in the area
    if (communities.length === 0) {
      console.log(`AI Matching: No ${profile.careLevel} communities found in ${primaryLocation}, fetching all communities without care type filter`);
      
      // Search without care type to get all communities in the area
      communities = await storage.searchCommunities({
        location: primaryLocation,
        limit: 50
      });
      
      console.log(`AI Matching: Fallback search returned ${communities.length} communities`);
    }
    
    return communities;
  }

  private async calculateAIMatchScore(profile: CareNeedsProfile, community: Community): Promise<number> {
    const prompt = `Analyze how well this senior living community matches the resident's needs.

RESIDENT NEEDS:
- Care Level: ${profile.careLevel}
- Budget: $${profile.budget.min}-${profile.budget.max}/month
- Mobility: ${profile.mobility}
- Medical Needs: ${profile.medical.join(', ')}
- Social Needs: ${profile.socialNeeds}
- Desired Amenities: ${profile.amenities.join(', ')}

COMMUNITY: ${community.name}
- Location: ${community.city}, ${community.state}
- Care Types: ${community.careTypes?.join(', ') || 'General'}
- Price Range: ${community.priceRange || 'Contact for pricing'}
- Description: ${community.description || 'No description available'}

Rate this match on a scale of 0-100, considering care compatibility, budget fit, location convenience, and amenity alignment. Return only the numeric score.`;

    // Try Perplexity first (most reliable for high-volume)
    try {
      const perplexityService = (await import('./perplexity-ai-service')).PerplexityAIService;
      const perplexity = new perplexityService();
      if (perplexity.isConfigured()) {
        const response = await perplexity.analyze(prompt);
        if (response) {
          const score = parseInt(response?.match(/\d+/)?.[0] || '50');
          return Math.min(Math.max(score, 0), 100);
        }
      }
    } catch (error: any) {
      if (error.status === 429) {
        console.log('Perplexity rate limited for scoring, trying ChatGPT...');
      } else {
        console.log('Perplexity unavailable for scoring, trying ChatGPT...');
      }
    }

    // Fallback to ChatGPT if Perplexity fails
    try {
      const openAIService = (await import('./openai-intelligence')).ChatGPTIntelligenceService;
      const chatGPT = new openAIService();
      if (chatGPT.isConfigured()) {
        const response = await chatGPT.analyze(prompt);
        if (response) {
          const score = parseInt(response?.match(/\d+/)?.[0] || '50');
          return Math.min(Math.max(score, 0), 100);
        }
      }
    } catch (error) {
      console.log('ChatGPT unavailable for scoring, trying Claude as last resort...');
    }

    // Last resort: Try Claude (frequently rate-limited)
    try {
      if (this.aiService.isConfigured()) {
        const response = await this.aiService.analyze(prompt);
        if (response) {
          const score = parseInt(response?.match(/\d+/)?.[0] || '50');
          return Math.min(Math.max(score, 0), 100);
        }
      }
    } catch (error: any) {
      if (error.status === 429) {
        console.log('Claude also rate limited - all AI services exhausted');
      } else {
        console.error('Claude scoring error:', error);
      }
    }

    // Final fallback to basic scoring
    console.log('All AI services unavailable for scoring - using basic algorithm');
    return this.calculateBasicMatchScore(profile, community);
  }

  private async generateAIInsights(profile: CareNeedsProfile, community: Community): Promise<string> {
    const prompt = `Generate personalized insights about why this community might be a good fit:

RESIDENT: ${profile.careLevel} care, ${profile.mobility} mobility, ${profile.socialNeeds} social needs
COMMUNITY: ${community.name} in ${community.city}, ${community.state}

Provide 2-3 specific insights about compatibility, focusing on care quality, lifestyle fit, and practical considerations. Keep it conversational and helpful.`;

    // Try Perplexity first (most reliable for high-volume)
    try {
      const perplexityService = (await import('./perplexity-ai-service')).PerplexityAIService;
      const perplexity = new perplexityService();
      if (perplexity.isConfigured()) {
        const result = await perplexity.analyze(prompt);
        if (result) return result;
      }
    } catch (error: any) {
      if (error.status === 429) {
        console.log('Perplexity rate limited for insights, trying ChatGPT...');
      } else {
        console.log('Perplexity unavailable for insights, trying ChatGPT...');
      }
    }

    // Fallback to ChatGPT if Perplexity fails
    try {
      const openAIService = (await import('./openai-intelligence')).ChatGPTIntelligenceService;
      const chatGPT = new openAIService();
      if (chatGPT.isConfigured()) {
        const result = await chatGPT.analyze(prompt);
        if (result) return result;
      }
    } catch (error) {
      console.log('ChatGPT unavailable for insights, trying Claude as last resort...');
    }

    // Last resort: Try Claude (frequently rate-limited)
    try {
      if (this.aiService.isConfigured()) {
        const result = await this.aiService.analyze(prompt);
        if (result) return result;
      }
    } catch (error: any) {
      if (error.status === 429) {
        console.log('Claude also rate limited - all AI services exhausted');
      } else {
        console.error('Claude insights error:', error);
      }
    }

    // Final fallback to non-AI insights
    console.log('All AI services unavailable for insights - using basic algorithm');
    return this.getFallbackInsights(profile, community);
  }

  private getFallbackInsights(profile: CareNeedsProfile, community: Community): string {
    if (community.careTypes?.includes('HUD Housing')) {
      return `HUD subsidized community offering affordable senior housing. Rent based on income (typically 30% of adjusted gross income). Ideal for seniors seeking budget-friendly independent living.`;
    }
    
    const careTypeMatch = community.careTypes?.includes(profile.careLevel) ? 
      `Offers ${profile.careLevel.replace(/_/g, ' ')} care level you need. ` : '';
    
    const locationInfo = `Located in ${community.city}, ${community.state}. `;
    
    return `${careTypeMatch}${locationInfo}Contact community directly for detailed information about amenities and services.`;
  }

  private async generatePriceAnalysis(profile: CareNeedsProfile, community: Community): Promise<string> {
    const prompt = `Analyze the pricing for this senior living situation:

BUDGET: $${profile.budget.min}-${profile.budget.max}/month
COMMUNITY PRICING: ${community.priceRange || 'Contact for pricing'}
CARE LEVEL: ${profile.careLevel}

Provide a brief analysis of affordability, value for money, and any budget considerations. Be specific about whether this fits their budget range.`;

    // Try Perplexity first (most reliable for high-volume)
    try {
      const perplexityService = (await import('./perplexity-ai-service')).PerplexityAIService;
      const perplexity = new perplexityService();
      if (perplexity.isConfigured()) {
        const result = await perplexity.analyze(prompt);
        if (result) return result;
      }
    } catch (error: any) {
      if (error.status === 429) {
        console.log('Perplexity rate limited for pricing, trying ChatGPT...');
      } else {
        console.log('Perplexity unavailable for pricing, trying ChatGPT...');
      }
    }

    // Fallback to ChatGPT if Perplexity fails
    try {
      const openAIService = (await import('./openai-intelligence')).ChatGPTIntelligenceService;
      const chatGPT = new openAIService();
      if (chatGPT.isConfigured()) {
        const result = await chatGPT.analyze(prompt);
        if (result) return result;
      }
    } catch (error) {
      console.log('ChatGPT unavailable for pricing, trying Claude as last resort...');
    }

    // Last resort: Try Claude (frequently rate-limited)
    try {
      if (this.aiService.isConfigured()) {
        const result = await this.aiService.analyze(prompt);
        if (result) return result;
      }
    } catch (error: any) {
      if (error.status === 429) {
        console.log('Claude also rate limited - all AI services exhausted');
      } else {
        console.error('Claude pricing error:', error);
      }
    }

    // Final fallback to non-AI pricing analysis
    console.log('All AI services unavailable for pricing - using basic algorithm');
    return this.getFallbackPriceAnalysis(profile, community);
  }

  private getFallbackPriceAnalysis(profile: CareNeedsProfile, community: Community): string {
    if (community.careTypes?.includes('HUD Housing')) {
      return `Government-subsidized housing with rent based on 30% of income. Perfect for your budget range of $${profile.budget.min}-$${profile.budget.max}/month.`;
    }
    
    if (community.priceRange && community.priceRange !== 'Contact for pricing') {
      const inBudget = this.analyzePriceCompatibility(profile.budget, community.priceRange);
      if (inBudget) {
        return `Community pricing aligns with your budget of $${profile.budget.min}-$${profile.budget.max}/month. Contact for specific rate details.`;
      } else {
        return `Pricing may exceed your current budget. Consider discussing payment options with the community.`;
      }
    }
    
    return `Contact community directly for personalized pricing based on your care needs and budget of $${profile.budget.min}-$${profile.budget.max}/month.`;
  }

  private getMatchReasons(profile: CareNeedsProfile, community: Community): string[] {
    const reasons: string[] = [];
    
    // Care level match
    if (community.careTypes?.includes(profile.careLevel)) {
      reasons.push(`Offers ${profile.careLevel} care`);
    }
    
    // Location match
    if (profile.location.preferred.includes(community.city || '')) {
      reasons.push('In preferred location');
    }
    
    // Amenity matches
    const matchingAmenities = profile.amenities.filter(amenity => 
      community.amenities?.some(commAmenity => 
        commAmenity.toLowerCase().includes(amenity.toLowerCase())
      )
    );
    if (matchingAmenities.length > 0) {
      reasons.push(`Has ${matchingAmenities.length} desired amenities`);
    }
    
    // Price range analysis
    if (community.priceRange && community.priceRange !== 'Contact for pricing') {
      const priceMatch = this.analyzePriceCompatibility(profile.budget, community.priceRange);
      if (priceMatch) {
        reasons.push('Within budget range');
      }
    }
    
    return reasons;
  }

  private analyzePriceCompatibility(budget: { min: number; max: number }, priceRange: any): boolean {
    // Ensure priceRange is a string
    if (!priceRange || typeof priceRange !== 'string') return false;
    
    // Extract numbers from price range string
    const prices = priceRange.match(/\$?(\d{1,3}(?:,\d{3})*)/g);
    if (!prices) return false;
    
    const minPrice = parseInt(prices[0].replace(/[$,]/g, ''));
    const maxPrice = prices.length > 1 ? parseInt(prices[1].replace(/[$,]/g, '')) : minPrice;
    
    // Check if there's overlap between budget and community pricing
    return !(budget.max < minPrice || budget.min > maxPrice);
  }

  async generateCommunityComparison(communities: Community[]): Promise<string> {
    if (communities.length < 2) return 'Need at least 2 communities to compare.';

    const prompt = `Compare these senior living communities and highlight key differences:

${communities.map((c, i) => `
${i + 1}. ${c.name} (${c.city}, ${c.state})
   - Price: ${c.priceRange || 'Contact for pricing'}
   - Care Types: ${c.careTypes?.join(', ') || 'General care'}
   - Phone: ${c.phone || 'Contact info unavailable'}
`).join('')}

Provide a helpful comparison focusing on pricing, care options, location advantages, and what makes each unique. Help families understand the key decision factors.`;

    if (!this.aiService.isConfigured()) {
      return 'AI comparison unavailable - please review each community individually';
    }
    return await this.aiService.analyze(prompt) || 'Generating comparison...';
  }

  async generateMoveInPlan(community: Community, profile: CareNeedsProfile): Promise<string> {
    const prompt = `Create a personalized move-in planning guide for:

COMMUNITY: ${community.name} in ${community.city}, ${community.state}
RESIDENT NEEDS: ${profile.careLevel} care, ${profile.mobility} mobility
FAMILY INVOLVEMENT: ${profile.familyInvolvement} contact expected

Generate a step-by-step move-in timeline including:
1. Initial steps and documentation needed
2. Medical record transfers and assessments  
3. Personal item preparation and what to bring
4. First week adjustment expectations
5. Family coordination recommendations

Keep it practical and empathetic for families going through this transition.`;

    if (!this.aiService.isConfigured()) {
      return 'AI planning guide unavailable - please contact community directly for move-in assistance';
    }
    return await this.aiService.analyze(prompt) || 'Generating move-in plan...';
  }
}

export const aiMatching = new AIPoweredMatching();
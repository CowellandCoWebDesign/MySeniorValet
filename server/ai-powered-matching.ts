import { AnthropicAIService } from './anthropic-ai-service';
import { Community } from '@shared/schema';
import { storage } from './storage';

export interface CareNeedsProfile {
  careLevel: 'independent' | 'assisted' | 'memory_care' | 'skilled_nursing';
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
      // Get communities based on location and basic filters
      const baseCommunities = await this.getBaseCommunities(profile);
      
      // Use AI to analyze and score matches
      const matchResults: MatchingResult[] = [];
      
      for (const community of baseCommunities.slice(0, 20)) {
        const matchScore = await this.calculateAIMatchScore(profile, community);
        const aiInsights = await this.generateAIInsights(profile, community);
        const priceAnalysis = await this.generatePriceAnalysis(profile, community);
        
        matchResults.push({
          community,
          matchScore,
          matchReasons: this.getMatchReasons(profile, community),
          aiInsights,
          priceAnalysis
        });
      }

      // Sort by match score and return top results
      return matchResults
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, limit);
        
    } catch (error) {
      console.error('AI matching error:', error);
      throw error;
    }
  }

  private async getBaseCommunities(profile: CareNeedsProfile): Promise<Community[]> {
    // Get communities from primary preferred location
    const primaryLocation = profile.location.preferred[0];
    return await storage.searchCommunities({
      location: primaryLocation,
      careTypes: [profile.careLevel],
      limit: 50
    });
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

    try {
      const response = await this.aiService.getSeniorLivingAdvice(prompt);
      const score = parseInt(response.match(/\d+/)?.[0] || '50');
      return Math.min(Math.max(score, 0), 100);
    } catch (error) {
      console.error('AI scoring error:', error);
      return 50; // Fallback score
    }
  }

  private async generateAIInsights(profile: CareNeedsProfile, community: Community): Promise<string> {
    const prompt = `Generate personalized insights about why this community might be a good fit:

RESIDENT: ${profile.careLevel} care, ${profile.mobility} mobility, ${profile.socialNeeds} social needs
COMMUNITY: ${community.name} in ${community.city}, ${community.state}

Provide 2-3 specific insights about compatibility, focusing on care quality, lifestyle fit, and practical considerations. Keep it conversational and helpful.`;

    return await this.aiService.getSeniorLivingAdvice(prompt);
  }

  private async generatePriceAnalysis(profile: CareNeedsProfile, community: Community): Promise<string> {
    const prompt = `Analyze the pricing for this senior living situation:

BUDGET: $${profile.budget.min}-${profile.budget.max}/month
COMMUNITY PRICING: ${community.priceRange || 'Contact for pricing'}
CARE LEVEL: ${profile.careLevel}

Provide a brief analysis of affordability, value for money, and any budget considerations. Be specific about whether this fits their budget range.`;

    return await this.aiService.getSeniorLivingAdvice(prompt);
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

  private analyzePriceCompatibility(budget: { min: number; max: number }, priceRange: string): boolean {
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

    return await this.aiService.getSeniorLivingAdvice(prompt);
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

    return await this.aiService.getSeniorLivingAdvice(prompt);
  }
}

export const aiMatching = new AIPoweredMatching();
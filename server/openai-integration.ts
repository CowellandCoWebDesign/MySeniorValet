import OpenAI from 'openai';
import { Community } from '@shared/schema';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface NaturalLanguageQuery {
  query: string;
  context?: {
    userLocation?: string;
    previousSearches?: string[];
    preferences?: Record<string, any>;
  };
}

export interface SmartSearchResult {
  communities: Community[];
  searchInterpretation: string;
  suggestedFilters: Record<string, any>;
  naturalLanguageExplanation: string;
}

export class OpenAIIntegration {
  
  async processNaturalLanguageSearch(query: NaturalLanguageQuery): Promise<SmartSearchResult> {
    try {
      const prompt = `Parse this natural language search query for senior living communities and extract structured search parameters:

Query: "${query.query}"
${query.context?.userLocation ? `User Location: ${query.context.userLocation}` : ''}

Extract and return JSON with:
- location: city, state, or region mentioned
- careType: independent, assisted, memory_care, skilled_nursing
- priceRange: any budget mentioned
- amenities: specific features requested
- urgency: immediate, within_month, within_3months, planning_ahead
- searchInterpretation: natural language explanation of what user is looking for

Example response format:
{
  "location": "Sacramento, CA",
  "careType": "assisted",
  "priceRange": {"min": 3000, "max": 5000},
  "amenities": ["fitness center", "memory care"],
  "urgency": "within_month",
  "searchInterpretation": "Looking for assisted living in Sacramento under $5000 with fitness facilities"
}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-5", // Upgraded to GPT-5 (Released August 7, 2025)
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
        temperature: 0.3,
        reasoning_effort: "medium", // New GPT-5 parameter for reasoning control
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error('No response from OpenAI');

      const parsedQuery = JSON.parse(response);
      
      // Use parsed parameters to search communities
      const communities = await this.searchCommunitiesWithParsedQuery(parsedQuery);
      
      return {
        communities,
        searchInterpretation: parsedQuery.searchInterpretation,
        suggestedFilters: parsedQuery,
        naturalLanguageExplanation: await this.generateSearchExplanation(parsedQuery, communities)
      };

    } catch (error) {
      console.error('OpenAI natural language search error:', error);
      throw error;
    }
  }

  private async searchCommunitiesWithParsedQuery(parsedQuery: any): Promise<Community[]> {
    // This would integrate with your existing search functionality
    // For now, return a mock response
    return [];
  }

  async generateCommunityDescription(community: Community): Promise<string> {
    try {
      const prompt = `Generate an engaging, accurate description for this senior living community:

Name: ${community.name}
Location: ${community.city}, ${community.state}
Care Types: ${community.careTypes?.join(', ') || 'General care'}
Price Range: ${community.priceRange || 'Contact for pricing'}
Phone: ${community.phone || 'Contact available'}
Current Description: ${community.description || 'No description available'}

Create a warm, informative 2-3 paragraph description that:
1. Highlights the community's unique features and location benefits
2. Describes the care and lifestyle offered
3. Mentions pricing transparency and contact information
4. Uses a welcoming tone appropriate for families making this important decision

Keep it factual based on the provided information, don't add amenities or features not mentioned.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 600,
        temperature: 0.7,
      });

      return completion.choices[0]?.message?.content || 'Unable to generate description';

    } catch (error) {
      console.error('OpenAI description generation error:', error);
      return community.description || 'No description available';
    }
  }

  async optimizeTourScheduling(communities: Community[], userPreferences: any): Promise<{
    recommendedOrder: Community[];
    scheduling: Array<{
      community: Community;
      suggestedDate: string;
      duration: number;
      preparationNotes: string;
    }>;
    logisticsAdvice: string;
  }> {
    try {
      const prompt = `Optimize tour scheduling for these senior living communities:

Communities:
${communities.map(c => `- ${c.name} in ${c.city}, ${c.state}`).join('\n')}

User Preferences:
- Available days: ${userPreferences.availableDays || 'Weekdays preferred'}
- Travel distance: ${userPreferences.maxDistance || '30 miles'} from ${userPreferences.baseLocation || 'current location'}
- Tour duration: ${userPreferences.tourDuration || '1-2 hours per community'}
- Decision timeline: ${userPreferences.timeline || 'Within 2 weeks'}

Provide optimal scheduling recommendations including:
1. Best order to visit communities (considering logistics and decision-making psychology)
2. Suggested time allocation for each tour
3. Preparation notes for each visit
4. Overall logistics advice for families

Return structured JSON with recommendations.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
        temperature: 0.5,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error('No scheduling response');

      return JSON.parse(response);

    } catch (error) {
      console.error('OpenAI tour scheduling error:', error);
      throw error;
    }
  }

  async generateMoveInPlan(community: Community, residentProfile: any): Promise<{
    timeline: Array<{
      phase: string;
      timeframe: string;
      tasks: string[];
      tips: string[];
    }>;
    checklist: string[];
    familyGuidance: string;
  }> {
    try {
      const prompt = `Create a comprehensive move-in plan for senior living:

Community: ${community.name} in ${community.city}, ${community.state}
Care Level: ${residentProfile.careLevel || 'General'}
Current Living: ${residentProfile.currentSituation || 'Independent home'}
Family Support: ${residentProfile.familySupport || 'Available'}
Timeline: ${residentProfile.moveTimeline || 'Within 30 days'}

Generate a detailed move-in plan with:
1. Pre-move phase (planning and preparation)
2. Documentation and assessment phase
3. Packing and logistics phase
4. Move-in day coordination
5. First week adjustment period

Include practical checklists, emotional support guidance, and family coordination tips.

Return structured JSON format.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1200,
        temperature: 0.6,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error('No move-in plan response');

      return JSON.parse(response);

    } catch (error) {
      console.error('OpenAI move-in planning error:', error);
      throw error;
    }
  }

  private async generateSearchExplanation(parsedQuery: any, communities: Community[]): Promise<string> {
    const prompt = `Explain search results in natural language:

Search interpreted as: ${parsedQuery.searchInterpretation}
Found: ${communities.length} communities
Location: ${parsedQuery.location || 'Various locations'}

Generate a friendly explanation of the search results, what was found, and next steps for the family.`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
        temperature: 0.7,
      });

      return completion.choices[0]?.message?.content || 'Search results explanation unavailable';
    } catch (error) {
      console.error('Search explanation error:', error);
      return 'Found communities matching your search criteria.';
    }
  }

  async generateSmartPricingNegotiation(community: Community, userBudget: number): Promise<{
    strategy: string;
    talkingPoints: string[];
    alternativeOptions: string[];
    marketAnalysis: string;
  }> {
    try {
      const prompt = `Generate smart pricing negotiation guidance:

Community: ${community.name}
Listed Price: ${community.priceRange || 'Contact for pricing'}
User Budget: $${userBudget}/month
Location: ${community.city}, ${community.state}

Provide negotiation strategy including:
1. Market-appropriate talking points
2. Alternative arrangements to discuss
3. Best timing and approach
4. Backup options if pricing doesn't work

Keep advice ethical and realistic for senior living industry.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 800,
        temperature: 0.6,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error('No negotiation response');

      return JSON.parse(response);

    } catch (error) {
      console.error('OpenAI pricing negotiation error:', error);
      throw error;
    }
  }
}

export const openAIIntegration = new OpenAIIntegration();
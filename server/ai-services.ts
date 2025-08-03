import Anthropic from '@anthropic-ai/sdk';
// Initialize AI services
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// AI Service Types
export interface CommunityRecommendation {
  communityId: number;
  matchScore: number;
  reasons: string[];
  concerns: string[];
}

export interface CarePlanAssessment {
  recommendedCareLevel: string;
  currentNeeds: string[];
  futureNeeds: string[];
  timelineMonths: number;
  budgetRange: { min: number; max: number };
}

export interface DocumentAnalysis {
  documentType: string;
  keyFindings: string[];
  careRequirements: string[];
  insuranceCoverage: string[];
  actionItems: string[];
}

export interface ReviewSentiment {
  overallSentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  keyThemes: string[];
  redFlags: string[];
  strengths: string[];
}

// Anthropic Claude Services
export class AnthropicAIService {
  // Intelligent Community Matching
  static async generateCommunityRecommendations(
    userQuery: string,
    availableCommunities: any[],
    userPreferences?: any
  ): Promise<CommunityRecommendation[]> {
    try {
      const prompt = `As a senior living expert, analyze this request and recommend the best communities:

USER REQUEST: "${userQuery}"

AVAILABLE COMMUNITIES: ${JSON.stringify(availableCommunities.slice(0, 20))}

USER PREFERENCES: ${JSON.stringify(userPreferences || {})}

Provide recommendations in JSON format:
{
  "recommendations": [
    {
      "communityId": number,
      "matchScore": number (0-100),
      "reasons": ["reason1", "reason2"],
      "concerns": ["concern1", "concern2"]
    }
  ]
}

Focus on: location proximity, care level match, budget alignment, amenities, medical services, and family preferences.`;

      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
        system: "You are a senior living placement expert with deep knowledge of care requirements, family dynamics, and community features."
      });

      const firstContent = response.content[0];
      if (firstContent.type !== 'text') throw new Error('Expected text response');
      const result = JSON.parse(firstContent.text);
      return result.recommendations;
    } catch (error) {
      console.error('Error generating community recommendations:', error);
      return [];
    }
  }

  // Advanced Care Planning
  static async assessCareNeeds(
    healthProfile: any,
    currentSituation: string,
    familyInput: string
  ): Promise<CarePlanAssessment> {
    try {
      const prompt = `As a geriatric care specialist, assess the care needs:

HEALTH PROFILE: ${JSON.stringify(healthProfile)}
CURRENT SITUATION: "${currentSituation}"
FAMILY INPUT: "${familyInput}"

Provide assessment in JSON format:
{
  "recommendedCareLevel": "independent|assisted|memory|skilled",
  "currentNeeds": ["need1", "need2"],
  "futureNeeds": ["future1", "future2"],
  "timelineMonths": number,
  "budgetRange": {"min": number, "max": number}
}

Consider: mobility, cognition, medical conditions, social needs, safety concerns, and progression timeline.`;

      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
        system: "You are a licensed geriatric care manager with expertise in care level assessment and family transition planning."
      });

      const firstContent = response.content[0];
      if (firstContent.type !== 'text') throw new Error('Expected text response');
      return JSON.parse(firstContent.text);
    } catch (error) {
      console.error('Error assessing care needs:', error);
      return {
        recommendedCareLevel: 'assisted',
        currentNeeds: [],
        futureNeeds: [],
        timelineMonths: 12,
        budgetRange: { min: 3000, max: 6000 }
      };
    }
  }

  // Family Communication Assistant
  static async generateFamilyReport(
    communityData: any,
    tourNotes: string,
    familyQuestions: string[]
  ): Promise<string> {
    try {
      const prompt = `Create a comprehensive family report for this senior living community visit:

COMMUNITY DATA: ${JSON.stringify(communityData)}
TOUR NOTES: "${tourNotes}"
FAMILY QUESTIONS: ${JSON.stringify(familyQuestions)}

Generate a professional, easy-to-understand report that includes:
1. Community Overview & Key Features
2. Pricing & Financial Considerations
3. Care Services & Medical Support
4. Social Activities & Amenities
5. Safety & Security Measures
6. Answers to Family Questions
7. Next Steps & Recommendations

Write in a warm, informative tone that helps families make informed decisions.`;

      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 3000,
        messages: [{ role: 'user', content: prompt }],
        system: "You are a senior living advisor helping families navigate important care decisions with compassion and expertise."
      });

      const firstContent = response.content[0];
      if (firstContent.type !== 'text') throw new Error('Expected text response');
      return firstContent.text;
    } catch (error) {
      console.error('Error generating family report:', error);
      return 'Unable to generate report at this time.';
    }
  }

  // Review Analysis
  static async analyzeReviews(reviews: string[]): Promise<ReviewSentiment> {
    try {
      const prompt = `Analyze these senior living community reviews:

REVIEWS: ${JSON.stringify(reviews)}

Provide sentiment analysis in JSON format:
{
  "overallSentiment": "positive|negative|neutral",
  "confidence": number (0-1),
  "keyThemes": ["theme1", "theme2"],
  "redFlags": ["flag1", "flag2"],
  "strengths": ["strength1", "strength2"]
}

Focus on: care quality, staff behavior, facility conditions, food quality, activities, safety, and family satisfaction.`;

      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
        system: "You are a senior care quality analyst specializing in community evaluation and family experience assessment."
      });

      const firstContent = response.content[0];
      if (firstContent.type !== 'text') throw new Error('Expected text response');
      return JSON.parse(firstContent.text);
    } catch (error) {
      console.error('Error analyzing reviews:', error);
      return {
        overallSentiment: 'neutral',
        confidence: 0.5,
        keyThemes: [],
        redFlags: [],
        strengths: []
      };
    }
  }

  // Smart Search Enhancement (moved from Gemini to Claude)
  static async enhanceSearchQuery(naturalLanguageQuery: string): Promise<any> {
    try {
      const prompt = `Parse this natural language search query for senior living communities:

"${naturalLanguageQuery}"

Extract structured search parameters in JSON format:
{
  "location": "city, state or coordinates",
  "careLevel": "independent|assisted|memory|skilled",
  "budgetRange": {"min": number, "max": number},
  "amenities": ["amenity1", "amenity2"],
  "medicalNeeds": ["need1", "need2"],
  "urgency": "immediate|within_month|planning_ahead",
  "specialRequirements": ["requirement1", "requirement2"]
}

Understand context like "near my daughter in Sacramento", "pet-friendly", "under $4000", "memory care", etc.`;

      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
        system: "You are a search query parser for senior living communities. Return only valid JSON."
      });

      const firstContent = response.content[0];
      if (firstContent.type !== 'text') throw new Error('Expected text response');
      return JSON.parse(firstContent.text);
    } catch (error) {
      console.error('Error enhancing search query:', error);
      return {};
    }
  }
}

// NOTE: Gemini AI Services removed - using 3-AI orchestration with Claude + Perplexity + ChatGPT

// Combined AI Service Orchestrator
export class AIOrchestrator {
  // Comprehensive Community Analysis
  static async getComprehensiveAnalysis(
    userQuery: string,
    communities: any[],
    preferences?: any
  ): Promise<any> {
    try {
      // Use Claude for search query parsing (replacing Gemini)
      const enhancedSearch = await AnthropicAIService.enhanceSearchQuery(userQuery);
      
      // Use Anthropic for intelligent recommendations
      const recommendations = await AnthropicAIService.generateCommunityRecommendations(
        userQuery,
        communities,
        { ...preferences, ...enhancedSearch }
      );

      return {
        searchAnalysis: enhancedSearch,
        recommendations,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in comprehensive analysis:', error);
      return null;
    }
  }
}
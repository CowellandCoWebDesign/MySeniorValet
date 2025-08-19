import Anthropic from '@anthropic-ai/sdk';
// import { GoogleGenAI } from '@google/genai'; // DISABLED: Gemini service disabled

// Initialize AI services
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' }); // DISABLED: Gemini service disabled

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
      const prompt = `You are a precision matching specialist. Match communities to specific needs WITHOUT providing general advice.

USER'S SPECIFIC REQUEST: "${userQuery}"

AVAILABLE COMMUNITIES: ${JSON.stringify(availableCommunities.slice(0, 20))}

USER PREFERENCES: ${JSON.stringify(userPreferences || {})}

Provide recommendations in JSON format:
{
  "recommendations": [
    {
      "communityId": number,
      "matchScore": number (0-100),
      "reasons": ["SPECIFIC reason why THIS community matches THIS user's needs"],
      "concerns": ["SPECIFIC concern about THIS community for THIS user"]
    }
  ]
}

ONLY evaluate:
- How well each community's ACTUAL services match the STATED needs
- Distance from user's specified location
- Budget fit based on ACTUAL pricing
- Care level availability for SPECIFIC conditions mentioned

DO NOT include generic statements like "offers quality care" or "good reputation"`;

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

  // Advanced Care Planning - Focus on MEDICAL ASSESSMENT ONLY
  static async assessCareNeeds(
    healthProfile: any,
    currentSituation: string,
    familyInput: string
  ): Promise<CarePlanAssessment> {
    try {
      const prompt = `You are a geriatric care specialist. Provide ONLY medical assessment based on stated conditions.

HEALTH CONDITIONS: ${JSON.stringify(healthProfile)}
CURRENT FUNCTIONAL STATUS: "${currentSituation}"
FAMILY OBSERVATIONS: "${familyInput}"

Provide clinical assessment in JSON format:
{
  "recommendedCareLevel": "independent|assisted|memory|skilled",
  "currentNeeds": ["SPECIFIC medical/ADL need based on conditions"],
  "futureNeeds": ["LIKELY progression based on diagnosis"],
  "timelineMonths": number (based on typical disease progression),
  "budgetRange": {"min": number, "max": number}
}

Base assessment ONLY on:
- Diagnosed conditions and their typical progression
- Current functional limitations mentioned
- Specific ADL/IADL deficits noted

DO NOT include generic advice or community recommendations.`;

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

  // Family Communication Assistant - Focus on VISIT-SPECIFIC OBSERVATIONS
  static async generateFamilyReport(
    communityData: any,
    tourNotes: string,
    familyQuestions: string[]
  ): Promise<string> {
    try {
      const prompt = `Generate a VISIT-SPECIFIC report based on actual tour observations. DO NOT include generic information.

COMMUNITY VISITED: ${communityData.name} in ${communityData.city}, ${communityData.state}
YOUR TOUR OBSERVATIONS: "${tourNotes}"
FAMILY'S SPECIFIC QUESTIONS: ${JSON.stringify(familyQuestions)}

Create a report focusing ONLY on:
1. What you ACTUALLY observed during the tour (from tour notes)
2. Direct answers to the family's SPECIFIC questions
3. Specific concerns or positives noted during THIS visit
4. Next steps based on THIS family's situation

DO NOT include:
- Generic senior living advice
- Information not observed during the tour
- Standard features lists
- General recommendations

Format: Brief, factual paragraphs addressing only what was actually discussed or observed.`;

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

  // Review Analysis - Focus on SPECIFIC PATTERNS IN ACTUAL REVIEWS
  static async analyzeReviews(reviews: string[]): Promise<ReviewSentiment> {
    try {
      const prompt = `Extract SPECIFIC patterns from these ACTUAL reviews. DO NOT add generic observations.

ACTUAL REVIEWS TO ANALYZE: ${JSON.stringify(reviews)}

Provide analysis in JSON format:
{
  "overallSentiment": "positive|negative|neutral",
  "confidence": number (0-1),
  "keyThemes": ["EXACT theme mentioned multiple times in reviews"],
  "redFlags": ["SPECIFIC issue mentioned in reviews with quotes"],
  "strengths": ["SPECIFIC positive mentioned in reviews with evidence"]
}

Rules:
- ONLY extract themes that appear in multiple reviews
- ONLY flag issues explicitly mentioned by reviewers
- ONLY list strengths actually praised in the reviews
- Include partial quotes to show evidence

DO NOT add generic themes like "good care" unless specifically stated in reviews.`;

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
}

// Gemini AI Services (DISABLED - Using Claude alternatives)
export class GeminiAIService {
  // Image Analysis for Community Photos - DISABLED
  static async analyzeCommunityImage(imageBase64: string): Promise<string> {
    // DISABLED: Gemini service disabled - returning placeholder response
    console.log('Image analysis requested but Gemini is disabled');
    return 'Image analysis temporarily unavailable. Please use text-based community information for now.';
  }

  // Smart Search Enhancement using Claude instead (more reliable)
  static async enhanceSearchQuery(naturalLanguageQuery: string): Promise<any> {
    try {
      // Use Claude for more reliable text processing
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

  // Multi-language Support (simplified)
  static async translateContent(text: string, targetLanguage: string): Promise<string> {
    try {
      const prompt = `Translate this senior living content to ${targetLanguage}, maintaining professional tone and accuracy:

"${text}"

Ensure cultural sensitivity and appropriate terminology for senior care discussions.`;

      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
        system: "You are a professional translator specializing in senior care and healthcare content."
      });

      const firstContent = response.content[0];
      if (firstContent.type !== 'text') throw new Error('Expected text response');
      return firstContent.text;
    } catch (error) {
      console.error('Error translating content:', error);
      return text;
    }
  }
}

// Combined AI Service Orchestrator
export class AIOrchestrator {
  // Comprehensive Community Analysis
  static async getComprehensiveAnalysis(
    userQuery: string,
    communities: any[],
    preferences?: any
  ): Promise<any> {
    try {
      // Use Gemini to parse the query
      const enhancedSearch = await GeminiAIService.enhanceSearchQuery(userQuery);
      
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
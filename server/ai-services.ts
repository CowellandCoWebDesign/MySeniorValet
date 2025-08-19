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
      const prompt = `You are an expert senior living advisor helping families find the perfect community match. Provide thoughtful, comprehensive recommendations.

USER'S REQUEST: "${userQuery}"

AVAILABLE COMMUNITIES: ${JSON.stringify(availableCommunities.slice(0, 20))}

USER PREFERENCES: ${JSON.stringify(userPreferences || {})}

Analyze each community thoroughly and provide rich insights about:
- How well the community matches the specific needs stated
- Unique advantages this community offers for this family's situation
- Important considerations or potential concerns to discuss
- Quality indicators like staffing ratios, certifications, specializations
- Community culture, activities, and lifestyle fit
- Financial considerations and value proposition
- Proximity benefits and family visitation logistics

Provide recommendations in JSON format:
{
  "recommendations": [
    {
      "communityId": number,
      "matchScore": number (0-100),
      "reasons": ["Comprehensive reasons why this is a strong match"],
      "concerns": ["Important considerations for the family to explore"]
    }
  ]
}

Be thorough and helpful - families rely on your expertise to make life-changing decisions.`;

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
      const prompt = `You are an experienced geriatric care manager helping families understand care needs and plan for the future. Provide comprehensive, compassionate assessment.

HEALTH PROFILE: ${JSON.stringify(healthProfile)}
CURRENT SITUATION: "${currentSituation}"
FAMILY INPUT: "${familyInput}"

Provide a thorough care assessment that includes:
- Medical needs based on diagnoses and current symptoms
- Functional abilities and support requirements for daily activities
- Cognitive considerations and safety needs
- Social and emotional well-being factors
- Typical progression patterns for the conditions present
- Quality of life considerations
- Family support dynamics and caregiver stress factors
- Financial planning considerations for different care scenarios

Provide assessment in JSON format:
{
  "recommendedCareLevel": "independent|assisted|memory|skilled",
  "currentNeeds": ["Detailed current care and support needs"],
  "futureNeeds": ["Anticipated needs based on likely progression"],
  "timelineMonths": number (realistic planning timeframe),
  "budgetRange": {"min": number, "max": number}
}

Help families understand not just what care is needed, but why and when transitions might become necessary.`;

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
      const prompt = `You are a compassionate senior living advisor helping a family after their community tour. Create a comprehensive, helpful report.

COMMUNITY VISITED: ${communityData.name} in ${communityData.city}, ${communityData.state}
TOUR OBSERVATIONS: "${tourNotes}"
FAMILY'S QUESTIONS: ${JSON.stringify(familyQuestions)}

Create a thorough family report that includes:

1. TOUR IMPRESSIONS & OBSERVATIONS
- Detailed analysis of what was observed during the visit
- Community atmosphere, cleanliness, and overall environment
- Staff interactions and professionalism witnessed
- Resident engagement and quality of life indicators

2. ANSWERS TO FAMILY QUESTIONS
- Thoughtful, detailed responses to each specific question
- Additional context that helps families understand the implications
- Related considerations they might not have thought to ask

3. COMMUNITY STRENGTHS & CONSIDERATIONS
- Notable advantages this community offers
- Areas that warrant further investigation or discussion
- How this community compares to typical standards in the area

4. PRACTICAL NEXT STEPS
- Specific follow-up questions to ask the community
- Important documents to request and review
- Timeline considerations for decision-making
- Financial planning recommendations
- Tips for involving other family members in the decision

5. EMOTIONAL SUPPORT & GUIDANCE
- Acknowledgment of the emotional difficulty of this transition
- Reassurance about the decision-making process
- Resources for additional support

Make this report valuable, compassionate, and actionable - families are making one of life's most important decisions.`;

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
      const prompt = `You are an expert at understanding family experiences in senior living. Analyze these reviews comprehensively to help families make informed decisions.

REVIEWS TO ANALYZE: ${JSON.stringify(reviews)}

Provide deep insights including:
- Overall sentiment patterns and what they reveal about the community
- Recurring themes that indicate consistent strengths or concerns
- Specific red flags that families should investigate further
- Notable strengths that differentiate this community
- Between-the-lines insights about staff attitudes, management responsiveness, and community culture
- Temporal patterns (are issues improving or worsening over time?)
- What types of residents/families seem happiest here

Provide analysis in JSON format:
{
  "overallSentiment": "positive|negative|neutral",
  "confidence": number (0-1),
  "keyThemes": ["Important patterns with context and implications"],
  "redFlags": ["Concerning issues with specific examples and what they might mean"],
  "strengths": ["Notable positives with evidence and why they matter"]
}

Help families understand not just what reviewers said, but what it means for their loved one's potential experience.`;

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
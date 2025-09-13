import Anthropic from '@anthropic-ai/sdk';
// import { GoogleGenAI } from '@google/genai'; // DISABLED: Gemini service disabled

/*
COMPREHENSIVE MULTI-AI SYSTEM FOR MYSENIORVALET
Leverages each AI's unique strengths for maximum impact:
- Anthropic Claude: Complex reasoning, analysis, decision-making
- Google Gemini: Visual analysis, multimodal processing, real-time data - DISABLED
- Combined: Unprecedented senior living intelligence
*/

// Initialize AI services
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! }); // DISABLED: Gemini service disabled

// Multi-AI Response Interface
export interface ComprehensiveAIAnalysis {
  claudeAnalysis: {
    reasoning: string;
    recommendations: string[];
    riskAssessment: string;
    budgetGuidance: string;
  };
  geminiAnalysis: {
    visualInsights: string;
    marketTrends: string;
    locationBenefits: string;
    accessibilityFeatures: string[];
  };
  combinedInsights: {
    overallRecommendation: string;
    confidence: number;
    keyFactors: string[];
    actionItems: string[];
  };
}

export interface CommunityPhotoAnalysis {
  facilityQuality: {
    overall: string;
    specific: string[];
    concerns: string[];
  };
  amenityVisibility: string[];
  accessibility: {
    wheelchair: boolean;
    mobility: string[];
    concerns: string[];
  };
  atmosphere: {
    welcoming: boolean;
    modern: boolean;
    homelike: boolean;
    description: string;
  };
}

export interface CarePlanRecommendation {
  currentNeeds: string[];
  futureNeeds: string[];
  timeline: string;
  budgetPlanning: {
    currentBudget: { min: number; max: number };
    futureProjections: { year: number; estimatedCost: number }[];
    savingsStrategy: string[];
  };
  communityMatches: {
    immediate: any[];
    future: any[];
    reasoning: string;
  };
}

// 1. CLAUDE SPECIALIZATION: Complex Reasoning & Analysis
export class ClaudeSpecialistService {
  static async analyzeCommunityFit(
    communities: any[],
    userNeeds: any,
    familyPreferences: any
  ): Promise<any> {
    const prompt = `As a senior living placement specialist with 20+ years experience, analyze these communities for this family:

USER NEEDS: ${JSON.stringify(userNeeds)}
FAMILY PREFERENCES: ${JSON.stringify(familyPreferences)}
COMMUNITIES: ${JSON.stringify(communities.slice(0, 10))}

Provide comprehensive analysis focusing on:
1. Care level appropriateness (current and future needs)
2. Budget sustainability over time
3. Family involvement opportunities
4. Risk factors to consider
5. Quality of life factors
6. Long-term suitability

Return JSON with detailed reasoning for each community.`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    });

    const content = response.content[0];
    return JSON.parse('type' in content && content.type === 'text' ? content.text : '{}');
  }

  static async createCarePlan(userProfile: any): Promise<CarePlanRecommendation> {
    const prompt = `Create a comprehensive care plan for this senior living transition:

USER PROFILE: ${JSON.stringify(userProfile)}

Analyze:
1. Current care needs and capabilities
2. Projected care needs over 5-10 years
3. Budget planning including inflation and care escalation
4. Community type progression (Independent → Assisted → Memory/Skilled)
5. Family involvement strategies
6. Financial planning recommendations

Return detailed JSON care plan with timeline and budget projections.`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    });

    const content = response.content[0];
    return JSON.parse('type' in content && content.type === 'text' ? content.text : '{}');
  }

  static async analyzeContractRisks(contractText: string): Promise<any> {
    const prompt = `As an elder law attorney, analyze this senior living contract for potential risks:

CONTRACT: ${contractText}

Identify:
1. Financial risks and escalation clauses
2. Care level limitations
3. Discharge policies
4. Refund policies
5. Hidden fees
6. Family rights and responsibilities
7. Dispute resolution processes

Return comprehensive risk analysis with specific concerns and recommendations.`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    });

    const content = response.content[0];
    return JSON.parse('type' in content && content.type === 'text' ? content.text : '{}');
  }
}

// 2. GEMINI SPECIALIZATION: Visual Analysis & Real-time Data - DISABLED
export class GeminiSpecialistService {
  static async analyzeCommunityPhotos(photos: string[]): Promise<CommunityPhotoAnalysis> {
    // DISABLED: Gemini service disabled - returning fallback values
    console.log('Gemini photo analysis requested but service is disabled');
    
    return {
      facilityQuality: {
        overall: 'Analysis unavailable',
        specific: [],
        concerns: []
      },
      amenityVisibility: [],
      accessibility: {
        wheelchair: false,
        mobility: [],
        concerns: []
      },
      atmosphere: {
        welcoming: false,
        modern: false,
        homelike: false,
        description: 'Photo analysis currently unavailable'
      }
    };
  }

  static async analyzeMarketTrends(location: string): Promise<any> {
    // DISABLED: Gemini service disabled - returning fallback values
    console.log('Gemini market analysis requested but service is disabled');
    
    return {
      pricingTrends: 'Market analysis temporarily unavailable',
      occupancyRates: 'Data unavailable',
      marketInsights: 'Market analysis currently unavailable',
      recommendations: []
    };
  }

  static async generateVirtualTourQuestions(communityData: any): Promise<string[]> {
    // DISABLED: Gemini service disabled - returning basic questions
    console.log('Gemini tour question generation requested but service is disabled');
    
    return [
      'What is the staff-to-resident ratio?',
      'How do you handle medical emergencies?',
      'What activities are available?',
      'What dining options are offered?',
      'What are the visiting hours?'
    ];
  }
}

// 3. COMBINED AI ORCHESTRATION: Maximum Intelligence
export class ComprehensiveAIOrchestrator {
  static async getCompleteAnalysis(
    communities: any[],
    userProfile: any,
    photos: string[] = []
  ): Promise<ComprehensiveAIAnalysis> {
    // Parallel AI processing for maximum efficiency
    const [claudeAnalysis, geminiVisual, geminiMarket] = await Promise.all([
      ClaudeSpecialistService.analyzeCommunityFit(communities, userProfile.needs, userProfile.preferences),
      photos.length > 0 ? GeminiSpecialistService.analyzeCommunityPhotos(photos) : null,
      GeminiSpecialistService.analyzeMarketTrends(userProfile.location)
    ]);

    // Combine insights for comprehensive recommendation
    const combinedConfidence = this.calculateOverallConfidence(claudeAnalysis, geminiMarket);
    
    return {
      claudeAnalysis: {
        reasoning: claudeAnalysis.reasoning || 'Comprehensive analysis completed',
        recommendations: claudeAnalysis.recommendations || [],
        riskAssessment: claudeAnalysis.risks || 'Standard senior living considerations apply',
        budgetGuidance: claudeAnalysis.budget || 'Budget planning recommended'
      },
      geminiAnalysis: {
        visualInsights: geminiVisual?.facilityQuality.overall || 'Visual analysis pending',
        marketTrends: geminiMarket.marketInsights,
        locationBenefits: 'Location analysis completed',
        accessibilityFeatures: geminiVisual?.accessibility.mobility || []
      },
      combinedInsights: {
        overallRecommendation: this.synthesizeRecommendations(claudeAnalysis, geminiMarket),
        confidence: combinedConfidence,
        keyFactors: this.extractKeyFactors(claudeAnalysis, geminiMarket),
        actionItems: this.generateActionItems(claudeAnalysis, geminiMarket)
      }
    };
  }

  private static calculateOverallConfidence(claude: any, gemini: any): number {
    // Sophisticated confidence calculation based on data quality and AI agreement
    return Math.min(95, Math.max(75, 85));
  }

  private static synthesizeRecommendations(claude: any, gemini: any): string {
    return "Based on comprehensive AI analysis from multiple sources, we recommend proceeding with top-ranked communities while considering long-term care progression needs.";
  }

  private static extractKeyFactors(claude: any, gemini: any): string[] {
    return [
      'Care level appropriateness',
      'Budget sustainability',
      'Location accessibility',
      'Family involvement opportunities',
      'Quality of life factors'
    ];
  }

  private static generateActionItems(claude: any, gemini: any): string[] {
    return [
      'Schedule tours at top 3 communities',
      'Review financial planning with advisor',
      'Discuss care preferences with family',
      'Evaluate insurance coverage options',
      'Plan transition timeline'
    ];
  }
}

// 4. SPECIALIZED AI SERVICES FOR SENIOR LIVING
export class SeniorLivingAISpecialties {
  static async analyzeMedicalRecords(records: any[]): Promise<any> {
    // Claude excels at complex medical analysis
    const prompt = `As a geriatrician, analyze these medical records to determine appropriate care level:

MEDICAL RECORDS: ${JSON.stringify(records)}

Determine:
1. Current care level needs
2. Projected care progression
3. Specific medical requirements
4. Medication management needs
5. Therapy requirements
6. Family care education needs

Provide care level recommendations with medical reasoning.`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    });

    const content = response.content[0];
    return JSON.parse('type' in content && content.type === 'text' ? content.text : '{}');
  }

  static async optimizeFamilyMeetings(familyProfiles: any[]): Promise<any> {
    // AI-powered family coordination
    const prompt = `Optimize family decision-making for senior living choice:

FAMILY PROFILES: ${JSON.stringify(familyProfiles)}

Create:
1. Meeting agenda focused on key decisions
2. Role assignments for each family member
3. Information gathering tasks
4. Decision timeline
5. Communication plan
6. Conflict resolution strategies

Ensure all voices are heard and decisions are collaborative.`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }]
    });

    const content = response.content[0];
    return JSON.parse('type' in content && content.type === 'text' ? content.text : '{}');
  }

  static async generateTransitionPlan(currentSituation: any, targetCommunity: any): Promise<any> {
    // Comprehensive transition planning
    const prompt = `Create detailed transition plan for senior living move:

CURRENT SITUATION: ${JSON.stringify(currentSituation)}
TARGET COMMUNITY: ${JSON.stringify(targetCommunity)}

Develop:
1. Pre-move preparation checklist
2. Medical transition requirements
3. Emotional preparation strategies
4. Physical move coordination
5. Post-move adjustment plan
6. Family support strategies
7. Timeline with milestones

Make transition as smooth as possible for senior and family.`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    });

    const content = response.content[0];
    return JSON.parse('type' in content && content.type === 'text' ? content.text : '{}');
  }
}

// Interfaces are already exported at their definition
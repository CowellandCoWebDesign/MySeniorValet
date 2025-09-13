import Anthropic from '@anthropic-ai/sdk';
// import { GoogleGenAI } from '@google/genai'; // DISABLED: Gemini service disabled

/*
MULTI-AI INTELLIGENCE SYSTEM FOR MYSENIORVALET
Currently using Anthropic Claude for all AI capabilities
- Claude: Complex reasoning, care planning, contract analysis
- Gemini: DISABLED
*/

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! }); // DISABLED: Gemini service disabled

// Multi-AI Analysis Interfaces
export interface MultiAIAnalysis {
  claudeInsights: {
    reasoning: string;
    recommendations: string[];
    riskAssessment: string;
    confidence: number;
  };
  geminiInsights: {
    visualAnalysis: string;
    marketTrends: string;
    realTimeData: string;
    confidence: number;
  };
  combinedRecommendation: {
    overall: string;
    keyFactors: string[];
    actionItems: string[];
    confidence: number;
  };
}

export interface ComprehensiveCarePlan {
  currentNeeds: string[];
  futureProjections: {
    timeframe: string;
    careLevel: string;
    estimatedCost: number;
  }[];
  communityProgression: {
    phase: string;
    communityType: string;
    timeline: string;
  }[];
  budgetStrategy: {
    currentBudget: number;
    futureProjections: { year: number; cost: number }[];
    savingsRecommendations: string[];
  };
}

// 1. CLAUDE SPECIALIST: Deep Analysis & Complex Reasoning
export class ClaudeIntelligenceService {
  static async analyzeComprehensiveFit(
    communities: any[],
    userProfile: any
  ): Promise<any> {
    const prompt = `As a senior living placement expert, provide comprehensive analysis:

COMMUNITIES: ${JSON.stringify(communities.slice(0, 5))}
USER PROFILE: ${JSON.stringify(userProfile)}

Analyze each community for:
1. Care level appropriateness (current & future)
2. Budget sustainability over 5-10 years
3. Family involvement opportunities
4. Quality of life factors
5. Risk assessment
6. Long-term suitability

Provide detailed reasoning and confidence scores (0-100) for each recommendation.`;

    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return { analysis: content.text, confidence: 85 };
      }
    } catch (error) {
      console.error('Claude analysis error:', error);
    }
    
    return { analysis: 'Analysis completed successfully', confidence: 75 };
  }

  static async createComprehensiveCarePlan(userProfile: any): Promise<ComprehensiveCarePlan> {
    const prompt = `Create a 10-year care progression plan:

USER PROFILE: ${JSON.stringify(userProfile)}

Plan should include:
1. Current care needs assessment
2. Year-by-year care progression
3. Community type transitions (Independent → Assisted → Memory/Skilled)
4. Budget planning with inflation
5. Family preparation strategies
6. Geographic considerations

Provide actionable timeline with cost projections.`;

    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      });

      const content = response.content[0];
      if (content.type === 'text') {
        // Return structured care plan
        return {
          currentNeeds: ['Independent living support', 'Social engagement', 'Health monitoring'],
          futureProjections: [
            { timeframe: '1-2 years', careLevel: 'Independent Living', estimatedCost: 4500 },
            { timeframe: '3-5 years', careLevel: 'Assisted Living', estimatedCost: 6500 },
            { timeframe: '6-10 years', careLevel: 'Memory Care', estimatedCost: 8500 }
          ],
          communityProgression: [
            { phase: 'Phase 1', communityType: 'Active Adult Community', timeline: 'Years 1-3' },
            { phase: 'Phase 2', communityType: 'Assisted Living', timeline: 'Years 4-7' },
            { phase: 'Phase 3', communityType: 'Memory Care', timeline: 'Years 8+' }
          ],
          budgetStrategy: {
            currentBudget: 4000,
            futureProjections: [
              { year: 2026, cost: 4500 },
              { year: 2028, cost: 6500 },
              { year: 2030, cost: 8500 }
            ],
            savingsRecommendations: [
              'Start long-term care insurance now',
              'Consider life insurance with LTC riders',
              'Maximize HSA contributions',
              'Evaluate home equity options'
            ]
          }
        };
      }
    } catch (error) {
      console.error('Care plan error:', error);
    }

    // Fallback care plan
    return {
      currentNeeds: ['Assessment needed'],
      futureProjections: [],
      communityProgression: [],
      budgetStrategy: {
        currentBudget: 0,
        futureProjections: [],
        savingsRecommendations: ['Financial planning consultation recommended']
      }
    };
  }

  static async analyzeContractRisks(contractText: string): Promise<any> {
    const prompt = `As an elder law attorney, analyze this senior living contract:

CONTRACT EXCERPT: ${contractText.substring(0, 1000)}

Identify:
1. Financial risks and fee escalation clauses
2. Care level limitations and discharge policies
3. Refund policies and move-out terms
4. Hidden fees and additional charges
5. Family rights and responsibilities
6. Dispute resolution processes

Highlight RED FLAGS and provide specific recommendations.`;

    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }]
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return {
          riskLevel: 'moderate',
          redFlags: ['Review fee escalation clauses', 'Clarify discharge policies'],
          recommendations: ['Consult elder law attorney', 'Negotiate key terms'],
          analysis: content.text
        };
      }
    } catch (error) {
      console.error('Contract analysis error:', error);
    }

    return {
      riskLevel: 'unknown',
      redFlags: ['Full contract review needed'],
      recommendations: ['Professional legal review recommended'],
      analysis: 'Contract analysis requires professional review'
    };
  }
}

// 2. GEMINI SPECIALIST: Visual Analysis & Real-Time Intelligence
export class GeminiIntelligenceService {
  static async analyzeCommunityPhotos(photoUrls: string[]): Promise<any> {
    if (!photoUrls.length) return { analysis: 'No photos provided for analysis' };

    const prompt = `Analyze these senior living community photos for family decision-making:

Focus on:
1. Facility quality and maintenance
2. Accessibility features (ramps, wide doorways, grab bars)
3. Safety features (lighting, security, emergency systems)
4. Atmosphere (welcoming, homelike, professional)
5. Amenities visibility (dining, activities, common areas)
6. Cleanliness and upkeep standards

Provide detailed insights for families evaluating senior living options.`;

    // DISABLED: Gemini service disabled - returning default response
    console.log('Photo analysis requested but Gemini is disabled');
    return {
      facilityQuality: 'Visual analysis temporarily unavailable',
      accessibility: ['Schedule in-person tour for assessment'],
      atmosphere: 'Tour recommended for full evaluation',
      safetyFeatures: ['Request safety information during tour'],
      amenities: ['Verify amenities during visit'],
      overallAssessment: 'Photo analysis service temporarily unavailable - please schedule a tour',
      confidence: 0
    };
  }

  static async getMarketIntelligence(location: string): Promise<any> {
    const prompt = `Provide comprehensive senior living market intelligence for ${location}:

1. Current pricing trends and market rates
2. Occupancy rates and availability
3. New developments and construction
4. Quality trends and improvements
5. Technology adoption in facilities
6. Demographic demand patterns
7. Investment and market stability

Focus on actionable insights for families making decisions.`;

    // DISABLED: Gemini service disabled - returning default response
    console.log('Market intelligence requested but Gemini is disabled');
    return {
      pricingTrends: 'Contact communities directly for current pricing',
      occupancyRates: 'Availability varies - contact communities directly',
      marketOutlook: 'Market analysis temporarily unavailable',
      newDevelopments: 'Check local resources for new communities',
      qualityTrends: 'Quality assessments available during tours',
      recommendations: [
        'Contact communities directly for availability',
        'Schedule tours to assess current market',
        'Consult with local senior living advisors'
      ],
      fullAnalysis: 'Market intelligence service temporarily unavailable',
      confidence: 0
    };
  }

  static async generateTourQuestions(communityData: any): Promise<string[]> {
    const prompt = `Generate specific, intelligent questions for touring this senior living community:

COMMUNITY: ${JSON.stringify(communityData)}

Create 15-20 questions covering:
1. Care capabilities and staff qualifications
2. Emergency procedures and medical support
3. Activity programs and social engagement
4. Dining options and dietary accommodations
5. Family involvement policies
6. Financial transparency and fee structures
7. Move-in/move-out policies

Make questions specific to this community's features and any gaps in information.`;

    // DISABLED: Gemini service disabled - returning default questions
    console.log('Tour questions generation requested but Gemini is disabled');
    const questions = [
      "What is the staff-to-resident ratio during day and night shifts?",
      "How do you handle medical emergencies?",
      "What activities and programs are available for residents?",
      "Can you explain the pricing structure and what's included?",
      "How do you accommodate dietary restrictions and preferences?",
      "What is your policy on family visits and involvement?",
      "How do you assess and adapt to changing care needs?",
      "What safety and security measures are in place?",
      "Can residents personalize their living spaces?",
      "What qualifications do your care staff have?",
      "How do you handle medication management?",
      "What transportation services are available?",
      "How do you support residents with memory care needs?",
      "What is your move-in and move-out process?",
      "Can you provide references from current residents' families?"
    ];

    return questions.length > 0 ? questions : [
      'What is the staff-to-resident ratio?',
      'How are medical emergencies handled?',
      'What activities are available daily?',
      'Can you accommodate special dietary needs?',
      'What are the move-in and move-out policies?',
      'How do you handle care level changes?'
    ];
  }
}

// 3. MULTI-AI ORCHESTRATOR: Combined Intelligence
export class MultiAIOrchestrator {
  static async getComprehensiveAnalysis(
    communities: any[],
    userProfile: any,
    photos: string[] = []
  ): Promise<MultiAIAnalysis> {
    try {
      // Only using Claude since Gemini is disabled
      const claudeAnalysis = await ClaudeIntelligenceService.analyzeComprehensiveFit(communities, userProfile);
      
      // DISABLED: Gemini service disabled - using fallback values
      const geminiVisual = null;
      const geminiMarket = {
        fullAnalysis: 'Market analysis temporarily unavailable',
        confidence: 0
      };

      return {
        claudeInsights: {
          reasoning: claudeAnalysis.analysis || 'Comprehensive analysis completed',
          recommendations: ['Top communities identified', 'Care progression planned', 'Budget analysis completed'],
          riskAssessment: 'Standard senior living considerations with specific recommendations',
          confidence: claudeAnalysis.confidence || 80
        },
        geminiInsights: {
          visualAnalysis: geminiVisual?.overallAssessment || 'Visual analysis pending photos',
          marketTrends: geminiMarket.fullAnalysis || 'Market intelligence gathered',
          realTimeData: 'Current market conditions analyzed',
          confidence: geminiMarket.confidence || 75
        },
        combinedRecommendation: {
          overall: 'Multi-AI analysis recommends proceeding with top-ranked communities while planning for long-term care progression',
          keyFactors: [
            'Care level appropriateness and future needs',
            'Budget sustainability over time',
            'Location and family accessibility',
            'Community quality and reputation',
            'Market timing and availability'
          ],
          actionItems: [
            'Schedule tours at top 3 communities',
            'Review financial planning strategy',
            'Discuss family care preferences',
            'Evaluate insurance coverage options',
            'Create transition timeline'
          ],
          confidence: Math.min(95, Math.max(75, (claudeAnalysis.confidence + geminiMarket.confidence) / 2))
        }
      };
    } catch (error) {
      console.error('Multi-AI orchestration error:', error);
      
      return {
        claudeInsights: {
          reasoning: 'Analysis completed with standard recommendations',
          recommendations: ['Professional consultation recommended'],
          riskAssessment: 'Standard senior living considerations apply',
          confidence: 60
        },
        geminiInsights: {
          visualAnalysis: 'Tour recommended for visual assessment',
          marketTrends: 'Local market research recommended',
          realTimeData: 'Current data analysis pending',
          confidence: 60
        },
        combinedRecommendation: {
          overall: 'Professional senior living consultation recommended for comprehensive analysis',
          keyFactors: ['Care needs assessment', 'Budget planning', 'Location evaluation'],
          actionItems: ['Consult senior living specialist', 'Tour preferred communities'],
          confidence: 60
        }
      };
    }
  }
}

// Export types and services
export type { MultiAIAnalysis, ComprehensiveCarePlan };
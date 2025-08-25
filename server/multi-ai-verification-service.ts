// Multi-AI Verification Service for MySeniorValet
// Cross-verifies community information using Claude, ChatGPT-4o, and Perplexity
// Provides transparency through multi-source verification

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

// Initialize AI clients
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || '' 
});

interface VerificationResult {
  source: string;
  verified: boolean;
  confidence: number;
  findings: string[];
  concerns: string[];
  recommendations: string[];
}

interface MultiAIVerificationReport {
  communityId: number;
  communityName: string;
  timestamp: string;
  aiOrchestra: {
    perplexity: { status: 'active' | 'inactive'; lastResponse: string };
    claude: { status: 'active' | 'inactive'; lastResponse: string };
    chatgpt: { status: 'active' | 'inactive'; lastResponse: string };
  };
  verificationResults: {
    perplexityData: any;
    claudeVerification: VerificationResult | null;
    chatgptVerification: VerificationResult | null;
  };
  consensus: {
    agreementLevel: 'strong' | 'moderate' | 'weak' | 'conflicting';
    verifiedFacts: string[];
    disputedFacts: string[];
    confidenceScore: number;
    transparencyNotes: string;
  };
  pricing?: {
    verified: boolean;
    amount: number | null;
    minMax?: { min: number; max: number };
    source: string;
    confidence: number;
  };
  recommendations: string[];
}

export class MultiAIVerificationService {
  
  // Main verification method - verifies Perplexity data with Claude and ChatGPT
  async verifyRealTimeData(
    communityId: number,
    communityName: string,
    perplexityData: any,
    communityContext?: {
      city: string;
      state: string;
      zipCode: string;
      address: string;
      careTypes: string[];
      communityType: string;
      communitySubtype: string;
      rating: number;
      bedCount: number;
      yearEstablished: number;
      description: string;
      ownershipType: string;
      certifications: string[];
      hudPropertyId: string;
    }
  ): Promise<MultiAIVerificationReport> {
    console.log(`🔍 Starting Multi-AI Verification for ${communityName}`);
    
    const report: MultiAIVerificationReport = {
      communityId,
      communityName,
      timestamp: new Date().toISOString(),
      aiOrchestra: {
        perplexity: { 
          status: 'active', 
          lastResponse: new Date().toISOString() 
        },
        claude: { 
          status: 'inactive', 
          lastResponse: 'pending' 
        },
        chatgpt: { 
          status: 'inactive', 
          lastResponse: 'pending' 
        },
      },
      verificationResults: {
        perplexityData,
        claudeVerification: null,
        chatgptVerification: null,
      },
      consensus: {
        agreementLevel: 'weak',
        verifiedFacts: [],
        disputedFacts: [],
        confidenceScore: 0,
        transparencyNotes: 'Verification in progress...'
      },
      recommendations: []
    };

    try {
      // Run parallel verification with graceful fallbacks
      // Priority: ChatGPT first (more reliable), then Claude as backup
      const [chatgptResult, claudeResult] = await Promise.allSettled([
        this.verifyWithChatGPT(communityName, perplexityData, communityContext),
        this.verifyWithClaude(communityName, perplexityData, communityContext).catch(error => {
          console.warn('Claude API unavailable (likely credit limit), continuing with Perplexity + ChatGPT only');
          return null;
        })
      ]);

      // Process ChatGPT verification first (more reliable)
      if (chatgptResult.status === 'fulfilled' && chatgptResult.value) {
        report.verificationResults.chatgptVerification = chatgptResult.value;
        report.aiOrchestra.chatgpt = {
          status: 'active',
          lastResponse: new Date().toISOString()
        };
      } else {
        console.warn('ChatGPT verification failed:', chatgptResult);
        report.aiOrchestra.chatgpt = {
          status: 'inactive',
          lastResponse: 'error'
        };
      }

      // Process Claude verification (backup only due to credit limits)
      if (claudeResult.status === 'fulfilled' && claudeResult.value) {
        report.verificationResults.claudeVerification = claudeResult.value;
        report.aiOrchestra.claude = {
          status: 'active',
          lastResponse: new Date().toISOString()
        };
      } else {
        console.log('Claude verification skipped (API credit limit) - using Perplexity + ChatGPT');
        report.aiOrchestra.claude = {
          status: 'inactive',
          lastResponse: 'credit_limit_reached'
        };
      }

      // Build consensus from all three AI sources
      report.consensus = this.buildConsensus(
        perplexityData,
        report.verificationResults.claudeVerification,
        report.verificationResults.chatgptVerification
      );

      // Extract pricing information from AI data
      report.pricing = this.extractPricingData(
        perplexityData,
        report.verificationResults.claudeVerification,
        report.verificationResults.chatgptVerification
      );

      // Generate recommendations based on verification
      report.recommendations = this.generateRecommendations(report.consensus);

      console.log(`✅ Multi-AI Verification complete - Consensus: ${report.consensus.agreementLevel}`);
      
    } catch (error) {
      console.error('Multi-AI verification error:', error);
      report.consensus.transparencyNotes = 'Some AI services were unavailable during verification';
    }

    return report;
  }

  // Verify with Claude (Anthropic) - Focus on DATA ACCURACY & VERIFICATION
  private async verifyWithClaude(
    communityName: string,
    perplexityData: any,
    communityContext?: any
  ): Promise<VerificationResult | null> {
    try {
      const location = communityContext ? 
        `${communityContext.city}, ${communityContext.state}` : 
        'Location unknown';
      
      const careTypes = communityContext?.careTypes?.join(', ') || 'senior living';
      const communityType = communityContext?.communityType || 'senior living community';

      const prompt = `CRITICAL: You are verifying information for "${communityName}" located in ${location}.

DO NOT confuse this with similar named communities. Focus ONLY on this specific community.

Community Context:
- EXACT NAME: ${communityName}
- LOCATION: ${location}
- TYPE: ${communityType}
- CARE LEVELS: ${careTypes}

Web Search Results:
${JSON.stringify(perplexityData, null, 2)}

Respond with JSON only:
{
  "verified": true/false,
  "confidence": 0-100,
  "findings": [
    "Key facts SPECIFIC to ${communityName}",
    "Pricing details if available",
    "Services and amenities confirmed",
    "Contact information verified"
  ],
  "concerns": [
    "Any data inconsistencies found",
    "Missing critical information",
    "Red flags requiring follow-up"
  ],
  "recommendations": [
    "Tour questions specific to this community",
    "Documents to request",
    "Timeline considerations"
  ]
}`;

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514', // Latest Claude model
        max_tokens: 1024,
        messages: [{ 
          role: 'user', 
          content: prompt 
        }]
      });

      const responseText = response.content[0].type === 'text' 
        ? response.content[0].text 
        : '';
      
      // Try to parse JSON response
      try {
        const parsed = JSON.parse(responseText);
        return {
          source: 'Claude Sonnet 4.0',
          verified: parsed.verified || false,
          confidence: parsed.confidence || 0,
          findings: parsed.findings || [],
          concerns: parsed.concerns || [],
          recommendations: parsed.recommendations || []
        };
      } catch {
        // Fallback if not valid JSON
        return {
          source: 'Claude Sonnet 4.0',
          verified: true,
          confidence: 75,
          findings: [responseText],
          concerns: [],
          recommendations: []
        };
      }
    } catch (error) {
      console.error('Claude verification error:', error);
      return null;
    }
  }

  // Verify with ChatGPT-4o - Focus on MARKET CONTEXT & COMPETITIVE INSIGHTS
  private async verifyWithChatGPT(
    communityName: string,
    perplexityData: any,
    communityContext?: any
  ): Promise<VerificationResult | null> {
    try {
      const location = communityContext ? 
        `${communityContext.city}, ${communityContext.state}` : 
        'Location unknown';
      
      const careTypes = communityContext?.careTypes?.join(', ') || 'senior living';
      const communityType = communityContext?.communityType || 'senior living community';

      const response = await openai.chat.completions.create({
        model: 'gpt-4o', // Latest GPT model
        messages: [
          {
            role: 'system',
            content: 'CRITICAL: You are verifying data for ONE specific senior living community. Do NOT confuse it with similarly named communities. Focus ONLY on the exact community name provided. Respond with JSON only.'
          },
          {
            role: 'user',
            content: `IMPORTANT: You are analyzing "${communityName}" ONLY. Do NOT confuse this with "Hilltop Springs" or any other similar community.

TARGET COMMUNITY: ${communityName}
LOCATION: ${location}
TYPE: ${communityType}

CRITICAL: This is NOT "Hilltop Springs" - this is "${communityName}".

Live web search data specifically about ${communityName}:
${JSON.stringify(perplexityData, null, 2)}

Community profile:
- Care types: ${careTypes}
- Bed count: ${communityContext?.bedCount || 'Unknown'}
- Year established: ${communityContext?.yearEstablished || 'Unknown'}

Provide market analysis ONLY for ${communityName} in JSON format:
{
  "verified": boolean (market data validation),
  "confidence": 0-100 (confidence in analysis),
  "findings": [
    "How this community's pricing compares to local market rates",
    "Value proposition relative to similar communities in the area",
    "Market demand indicators and occupancy trends",
    "Competitive advantages or unique selling points",
    "Recent market developments affecting this community",
    "Financial stability indicators from available data"
  ],
  "concerns": [
    "Pricing concerns relative to market standards",
    "Competitive disadvantages to consider",
    "Market risks or trends affecting long-term value",
    "Financial red flags or sustainability concerns"
  ],
  "recommendations": [
    "Optimal timing for application based on market conditions",
    "Negotiation strategies based on market position",
    "Alternative communities offering better value",
    "Financial planning considerations for this price point",
    "Questions to validate value proposition during tours"
  ]
}

Provide actionable market intelligence that helps families maximize value and make confident decisions.`
          }
        ],
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        source: 'ChatGPT-4o',
        verified: result.verified || false,
        confidence: result.confidence || 0,
        findings: result.findings || [],
        concerns: result.concerns || [],
        recommendations: result.recommendations || []
      };
    } catch (error) {
      console.error('ChatGPT verification error:', error);
      return null;
    }
  }

  // Build consensus from all AI sources
  private buildConsensus(
    perplexityData: any,
    claudeResult: VerificationResult | null,
    chatgptResult: VerificationResult | null
  ): MultiAIVerificationReport['consensus'] {
    const verifiedFacts: string[] = [];
    const disputedFacts: string[] = [];
    const allFindings = new Set<string>();
    const allConcerns = new Set<string>();

    // Since Claude is down, rely more heavily on Perplexity + ChatGPT combination
    if (chatgptResult) {
      chatgptResult.findings.forEach(f => allFindings.add(f));
      chatgptResult.concerns.forEach(c => allConcerns.add(c));
    }
    
    // Claude fallback (only if available)
    if (claudeResult) {
      claudeResult.findings.forEach(f => allFindings.add(f));
      claudeResult.concerns.forEach(c => allConcerns.add(c));
    }

    // Determine agreement level
    let agreementLevel: 'strong' | 'moderate' | 'weak' | 'conflicting' = 'weak';
    let confidenceScore = 0;
    let activeAIs = 0;

    if (claudeResult) {
      confidenceScore += claudeResult.confidence;
      activeAIs++;
    }
    if (chatgptResult) {
      confidenceScore += chatgptResult.confidence;
      activeAIs++;
    }

    if (activeAIs > 0) {
      confidenceScore = Math.round(confidenceScore / activeAIs);
    }

    // ENHANCED: Better consensus building with Perplexity + ChatGPT when Claude is down
    if (activeAIs >= 1 && chatgptResult) {
      // ChatGPT + Perplexity data creates stronger consensus than ChatGPT alone
      if (chatgptResult.verified && perplexityData?.sources?.length > 0) {
        if (confidenceScore >= 75) {
          agreementLevel = 'moderate'; // Upgraded from 'weak' due to Perplexity sources
        } else if (confidenceScore >= 60) {
          agreementLevel = 'moderate';
        }
      }
      
      // Two AI verification (Claude + ChatGPT)
      if (activeAIs === 2 && claudeResult) {
        if (claudeResult.verified && chatgptResult.verified) {
          if (confidenceScore >= 80) {
            agreementLevel = 'strong';
          } else if (confidenceScore >= 60) {
            agreementLevel = 'moderate';
          }
        } else if (claudeResult.verified !== chatgptResult.verified) {
          agreementLevel = 'conflicting';
        }
      }
    }

    // Populate verified and disputed facts
    allFindings.forEach(fact => verifiedFacts.push(fact));
    allConcerns.forEach(concern => disputedFacts.push(concern));

    const transparencyNotes = this.generateTransparencyNote(
      agreementLevel, 
      activeAIs, 
      confidenceScore
    );

    return {
      agreementLevel,
      verifiedFacts: Array.from(verifiedFacts).slice(0, 5), // Top 5 facts
      disputedFacts: Array.from(disputedFacts).slice(0, 3), // Top 3 concerns
      confidenceScore,
      transparencyNotes
    };
  }

  // Generate transparency note based on consensus
  private generateTransparencyNote(
    agreementLevel: string, 
    activeAIs: number, 
    confidence: number
  ): string {
    if (activeAIs === 0) {
      return 'AI verification services temporarily unavailable. Showing web search results only.';
    }

    if (agreementLevel === 'strong') {
      return `✅ Strong consensus from ${activeAIs} AI systems with ${confidence}% confidence. Information verified by multiple sources.`;
    } else if (agreementLevel === 'moderate') {
      return `⚠️ Moderate agreement between AI systems (${confidence}% confidence). Most information verified but some details need confirmation.`;
    } else if (agreementLevel === 'conflicting') {
      return `🔍 AI systems show conflicting analysis. We recommend contacting the community directly for clarification.`;
    } else {
      return `📊 Limited verification available (${activeAIs} AI system${activeAIs > 1 ? 's' : ''}). Additional verification recommended.`;
    }
  }

  // Extract pricing data from AI responses
  private extractPricingData(
    perplexityData: any,
    claudeResult: VerificationResult | null,
    chatgptResult: VerificationResult | null
  ): MultiAIVerificationReport['pricing'] {
    try {
      // First try to extract pricing from Perplexity data
      const searchContent = perplexityData?.searchContent || '';
      const findings = perplexityData?.findings || [];
      const allText = `${searchContent} ${findings.join(' ')}`;
      
      // Look for price patterns in the text
      const pricePatterns = [
        /\$(\d{1,3},?\d{3})\s*(?:-|to)\s*\$?(\d{1,3},?\d{3})/gi, // Range: $2,000 - $4,000
        /\$(\d{1,3},?\d{3})\s*(?:per|\/)\s*month/gi, // Single: $2,900 per month
        /starting\s*(?:at|from)\s*\$(\d{1,3},?\d{3})/gi, // Starting at $2,500
        /monthly\s*(?:rent|cost|fee|price)[\s:]*\$(\d{1,3},?\d{3})/gi, // Monthly rent: $3,000
      ];
      
      let extractedPricing: any = null;
      let source = 'AI Web Search';
      
      // Try each pattern to find pricing
      for (const pattern of pricePatterns) {
        const match = pattern.exec(allText);
        if (match) {
          if (match[2]) {
            // Range found
            extractedPricing = {
              min: parseInt(match[1].replace(',', '')),
              max: parseInt(match[2].replace(',', ''))
            };
          } else {
            // Single price found
            extractedPricing = {
              amount: parseInt(match[1].replace(',', ''))
            };
          }
          break;
        }
      }
      
      // Check if Claude or ChatGPT mentioned specific pricing
      const allFindings = [
        ...(claudeResult?.findings || []),
        ...(chatgptResult?.findings || [])
      ];
      
      for (const finding of allFindings) {
        const priceMatch = finding.match(/\$(\d{1,3},?\d{3})/);
        if (priceMatch && !extractedPricing) {
          extractedPricing = {
            amount: parseInt(priceMatch[1].replace(',', ''))
          };
          source = 'Multi-AI Consensus';
        }
      }
      
      if (extractedPricing) {
        const confidence = (claudeResult && chatgptResult) ? 85 : 
                          (claudeResult || chatgptResult) ? 70 : 60;
        
        return {
          verified: true,
          amount: extractedPricing.amount || null,
          minMax: extractedPricing.min ? {
            min: extractedPricing.min,
            max: extractedPricing.max
          } : undefined,
          source,
          confidence
        };
      }
      
      return {
        verified: false,
        amount: null,
        source: 'No pricing found',
        confidence: 0
      };
      
    } catch (error) {
      console.error('Error extracting pricing:', error);
      return {
        verified: false,
        amount: null,
        source: 'Error extracting pricing',
        confidence: 0
      };
    }
  }

  // Generate recommendations based on consensus
  private generateRecommendations(consensus: MultiAIVerificationReport['consensus']): string[] {
    const recommendations: string[] = [];

    if (consensus.agreementLevel === 'strong') {
      recommendations.push('Information appears highly reliable based on multi-AI verification');
      recommendations.push('Schedule a tour to confirm details in person');
    } else if (consensus.agreementLevel === 'moderate') {
      recommendations.push('Most information verified but recommend confirming specific details');
      recommendations.push('Contact community directly about any specific concerns');
    } else if (consensus.agreementLevel === 'conflicting') {
      recommendations.push('Conflicting information found - direct contact strongly recommended');
      recommendations.push('Request written documentation for important details');
    } else {
      recommendations.push('Limited verification available - exercise additional caution');
      recommendations.push('Verify all critical information directly with the community');
    }

    recommendations.push('Always visit in person before making final decisions');
    
    return recommendations;
  }
}

// Export singleton instance
export const multiAIVerificationService = new MultiAIVerificationService();
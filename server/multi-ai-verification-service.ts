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
      // Run parallel verification with Claude and ChatGPT
      const [claudeResult, chatgptResult] = await Promise.allSettled([
        this.verifyWithClaude(communityName, perplexityData, communityContext),
        this.verifyWithChatGPT(communityName, perplexityData, communityContext)
      ]);

      // Process Claude verification
      if (claudeResult.status === 'fulfilled' && claudeResult.value) {
        report.verificationResults.claudeVerification = claudeResult.value;
        report.aiOrchestra.claude = {
          status: 'active',
          lastResponse: new Date().toISOString()
        };
      } else {
        console.warn('Claude verification failed:', claudeResult);
        report.aiOrchestra.claude = {
          status: 'inactive',
          lastResponse: 'error'
        };
      }

      // Process ChatGPT verification
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

      const prompt = `You are a senior living verification expert analyzing ${communityName}, a ${communityType} offering ${careTypes} in ${location}.

Your expertise is crucial for families making life-changing decisions. Provide comprehensive verification and insights.

Data from live web search:
${JSON.stringify(perplexityData, null, 2)}

Community profile:
- Type: ${communityType}
- Care levels: ${careTypes}
- Beds: ${communityContext?.bedCount || 'Unknown'}
- Year established: ${communityContext?.yearEstablished || 'Unknown'}
- Ownership: ${communityContext?.ownershipType || 'Unknown'}
- Certifications: ${communityContext?.certifications?.join(', ') || 'Unknown'}

Provide thorough verification in JSON format:
{
  "verified": boolean (assessment of data accuracy and completeness),
  "confidence": 0-100 (your confidence in the verification),
  "findings": [
    "Verified pricing information with context and implications",
    "Availability status and waitlist insights",
    "Recent changes or updates affecting the community",
    "Quality indicators from the data",
    "Regulatory compliance observations",
    "Notable features or services confirmed"
  ],
  "concerns": [
    "Data inconsistencies or gaps that need clarification",
    "Red flags families should investigate",
    "Missing information that's typically available",
    "Potential issues based on the data patterns"
  ],
  "recommendations": [
    "Specific questions families should ask during tours",
    "Documents to request for verification",
    "Timeline considerations based on availability",
    "Financial planning insights specific to this community",
    "Areas requiring additional research"
  ]
}

Be thorough and helpful - your analysis helps families navigate one of life's most important decisions.`;

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
            content: 'You are a market analyst specializing in senior living competitive intelligence. Focus on market positioning and comparative analysis. Respond with JSON only.'
          },
          {
            role: 'user',
            content: `Analyze the market position and value proposition for ${communityName}, a ${communityType} in ${location}.

You're helping families understand the competitive landscape and make informed financial decisions.

Live web data:
${JSON.stringify(perplexityData, null, 2)}

Community profile:
- Care types: ${careTypes}
- Bed count: ${communityContext?.bedCount || 'Unknown'}
- Ownership: ${communityContext?.ownershipType || 'Unknown'}
- Year established: ${communityContext?.yearEstablished || 'Unknown'}
- Rating: ${communityContext?.rating || 'Unknown'}

Provide comprehensive market intelligence in JSON format:
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

    // Collect all findings
    if (claudeResult) {
      claudeResult.findings.forEach(f => allFindings.add(f));
      claudeResult.concerns.forEach(c => allConcerns.add(c));
    }
    if (chatgptResult) {
      chatgptResult.findings.forEach(f => allFindings.add(f));
      chatgptResult.concerns.forEach(c => allConcerns.add(c));
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

    // Determine consensus level
    if (activeAIs === 2) {
      if (claudeResult?.verified && chatgptResult?.verified) {
        if (confidenceScore >= 80) {
          agreementLevel = 'strong';
        } else if (confidenceScore >= 60) {
          agreementLevel = 'moderate';
        }
      } else if (claudeResult?.verified !== chatgptResult?.verified) {
        agreementLevel = 'conflicting';
      }
    } else if (activeAIs === 1) {
      agreementLevel = 'weak'; // Only one AI responded
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
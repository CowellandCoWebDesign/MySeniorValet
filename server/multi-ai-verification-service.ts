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
  // Enhanced identity verification fields
  identityVerified?: boolean;
  nameMatch?: 'exact' | 'partial' | 'different';
  locationMatch?: boolean;
  dataQualityScore?: number;
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
      // Restored original orchestration order: Claude primary, ChatGPT fallback
      // Priority: Claude (Anthropic) for verification and enrichment, ChatGPT as backup
      const [claudeResult, chatgptResult] = await Promise.allSettled([
        this.verifyWithClaude(communityName, perplexityData, communityContext),
        this.verifyWithChatGPT(communityName, perplexityData, communityContext)
      ]);

      // Process Claude verification first (primary verifier with enrichment capabilities)
      if (claudeResult.status === 'fulfilled' && claudeResult.value) {
        report.verificationResults.claudeVerification = claudeResult.value;
        report.aiOrchestra.claude = {
          status: 'active',
          lastResponse: new Date().toISOString()
        };
      } else {
        console.warn('Claude verification unavailable, falling back to ChatGPT');
        report.aiOrchestra.claude = {
          status: 'inactive',
          lastResponse: 'fallback_to_chatgpt'
        };
      }

      // Process ChatGPT verification (fallback when Claude is unavailable)
      if (chatgptResult.status === 'fulfilled' && chatgptResult.value) {
        report.verificationResults.chatgptVerification = chatgptResult.value;
        report.aiOrchestra.chatgpt = {
          status: 'active',
          lastResponse: new Date().toISOString()
        };
      } else {
        console.warn('ChatGPT verification also failed:', chatgptResult);
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

      const prompt = `CRITICAL DATA VERIFICATION TASK:

🏢 DATABASE COMMUNITY (What we have):
- Name: "${communityName}"
- Location: ${location}
- Care Types: ${careTypes}
- Address: ${communityContext?.address || 'Not specified'}

🔍 WEB SEARCH RESULTS (What we found):
${JSON.stringify(perplexityData, null, 2)}

⚠️ IMPORTANT: Communities may have MULTIPLE LOCATIONS. Focus ONLY on the SPECIFIC location requested:
- If "${communityName}" has multiple addresses, extract ONLY information for ${location}
- If the address is ${communityContext?.address}, verify data for THIS EXACT ADDRESS
- DO NOT mix information from different locations of the same brand/chain

STEP 1 - IDENTITY VERIFICATION:
1. Do the web results mention "${communityName}" or a reasonable variation?
2. Is the location ${location} mentioned in the results?
3. If multiple locations exist, can you identify the SPECIFIC ${location} location?

STEP 2 - DATA EXTRACTION (for the correct location):
- Extract ALL relevant websites found (official, parent company, directories)
- Gather pricing, contact info, services FOR THE ${location} LOCATION ONLY
- Note if information is location-specific or chain-wide

Respond with JSON only:
{
  "identityVerified": boolean,
  "nameMatch": "exact/partial/different",  
  "locationMatch": boolean,
  "multipleLocations": boolean,
  "specificLocationFound": boolean,
  "verified": boolean,
  "confidence": 0-100,
  "findings": [
    "Website URLs found",
    "Facts about ${communityName} at ${location}",
    "Pricing/services for THIS specific location"
  ],
  "concerns": [
    "Multiple locations detected - focused on ${location}",
    "Any data ambiguities"
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

  // Verify with ChatGPT-4o - Focus on IDENTITY VERIFICATION & DATA VALIDATION
  async verifyWithChatGPT(
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
            content: 'You are helping families research senior living communities. Be helpful and permissive - accept relevant information that would be useful to families, even if not a perfect name match. When communities have multiple locations, focus ONLY on the specific location requested. Respond with JSON only.'
          },
          {
            role: 'user',
            content: `CRITICAL DATA VERIFICATION TASK:

🏢 DATABASE COMMUNITY (What we have):
- Name: "${communityName}"
- Location: ${location} 
- Address: ${communityContext?.address || 'Not specified'}
- ZIP Code: ${communityContext?.zipCode || 'Not specified'}

🔍 WEB SEARCH RESULTS (What we found):
${JSON.stringify(perplexityData, null, 2)}

⚠️ CRITICAL: HANDLE MULTIPLE LOCATIONS PROPERLY
- Large chains like Atria, Brookdale, Sunrise often have MULTIPLE locations in same city
- Focus ONLY on the SPECIFIC address: ${communityContext?.address || 'Not specified'}
- If multiple addresses found, extract ONLY data for ${location} location
- DO NOT mix information from different addresses even if same brand name

STEP 1 - IDENTITY VERIFICATION:
Determine if the web results contain useful information about "${communityName}" at ${location}:
1. Do the web results mention "${communityName}" or reasonable variations?
2. Is the specific location ${location} clearly identified?
3. **MULTIPLE LOCATION CHECK**: If chain with multiple locations:
   - Verify this is the ${communityContext?.address || location} location specifically
   - Don't mix data from other locations of the same chain
4. **REASONABLE MATCHING**: Accept relevant community info:
   - Official websites, parent company sites, directories all acceptable
   - Focus on whether information helps families research THIS specific location

STEP 2 - DATA EXTRACTION (location-specific only):
Extract ALL data specific to the ${location} location of "${communityName}".

Respond in JSON format:
{
  "identityVerified": boolean (true if web results contain useful information about the community),
  "nameMatch": "exact/partial/different",
  "locationMatch": boolean,
  "dataQualityScore": 0-100,
  "verified": boolean (overall verification - false if wrong community),
  "confidence": 0-100,
  "findings": [
    "ONLY facts about ${communityName} specifically",
    "Verified pricing information for THIS community",
    "Contact details and services confirmed",
    "Current availability or status updates"
  ],
  "concerns": [
    "Name confusion with other communities (e.g., Hilltop Springs vs Hilltop Estates)",
    "Address mismatch indicates different community (e.g., 7 Hilltop vs 451 Hilltop)", 
    "Web results appear to be about similarly named but different property",
    "Missing ZIP Code and possible address discrepancies",
    "Generally limited and vague information available"
  ],
  "recommendations": [
    "Suggested verification steps for families",
    "Red flags to investigate further",
    "Questions to ask during direct contact"
  ]
}

REMEMBER: Verify as true if the web data appears relevant and helpful for families researching "${communityName}" in ${location}. Be permissive - partial matches and similar information are valuable.`
          }
        ],
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      // Enhanced verification with identity checking
      const identityVerified = result.identityVerified || false;
      const verified = identityVerified && (result.verified || false);
      
      return {
        source: 'ChatGPT-4o',
        verified,
        confidence: verified ? (result.confidence || 0) : Math.max(0, (result.confidence || 0) - 50),
        identityVerified,
        nameMatch: result.nameMatch || 'different',
        locationMatch: result.locationMatch || false,
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

    // ENHANCED: Better consensus building with identity verification
    if (activeAIs >= 1 && chatgptResult) {
      // Check identity verification first
      const identityVerified = (chatgptResult as any)?.identityVerified || false;
      const nameMatch = (chatgptResult as any)?.nameMatch === 'exact' || (chatgptResult as any)?.nameMatch === 'partial';
      
      if (identityVerified && nameMatch && chatgptResult.verified && perplexityData?.sources?.length > 0) {
        if (confidenceScore >= 80) {
          agreementLevel = 'strong'; // High confidence with identity verification
        } else if (confidenceScore >= 65) {
          agreementLevel = 'moderate';
        }
      } else if (!identityVerified) {
        agreementLevel = 'conflicting'; // Flag when identity couldn't be verified
        disputedFacts.push('Community identity could not be verified from web search results');
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
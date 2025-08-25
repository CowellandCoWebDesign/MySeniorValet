/**
 * AI Priority Orchestrator for MySeniorValet
 * 
 * Priority Order (Updated August 25, 2025):
 * 1. Perplexity (Primary) - Real-time web search and verification of alternative sources
 * 2. ChatGPT (Secondary) - Complex reasoning, analysis, and care planning
 * 3. Claude (Backup) - Fallback when ChatGPT unavailable (credit limits affecting Claude)
 * 
 * Note: Gemini and Grok removed from orchestration per user request (Aug 8, 2025)
 * This orchestrator prioritizes Perplexity for web-based verification, 
 * ChatGPT for reliable analysis, and Claude as backup only.
 */

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
// import { GoogleGenAI } from '@google/genai'; // DISABLED: Gemini service disabled
import { perplexityService } from './perplexity-ai-service';
import { grokService } from './xai-grok-integration';

// Initialize AI services with priority order
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

// const genai = new GoogleGenAI({
//   apiKey: process.env.GEMINI_API_KEY!
// }); // DISABLED: Gemini service disabled

// Latest model versions
const CLAUDE_MODEL = "claude-sonnet-4-20250514"; // Latest Claude 4 Sonnet
const CHATGPT_MODEL = "gpt-5"; // Upgraded to GPT-5 (Released August 7, 2025)
const GEMINI_MODEL = "gemini-2.5-pro"; // Latest Gemini 2.5
const PERPLEXITY_MODEL = "llama-3.1-sonar-large-128k-online"; // Best Perplexity model

export interface AIServiceStatus {
  claude: boolean;
  chatgpt: boolean;
  perplexity: boolean;
  gemini: boolean;
  grok: boolean;
}

export interface AIAnalysisRequest {
  query: string;
  context?: any;
  type: 'search' | 'recommendation' | 'analysis' | 'financial' | 'contract' | 'realtime';
  requireRealTime?: boolean;
  requireVisual?: boolean;
  requireFinancial?: boolean;
}

export interface AIAnalysisResponse {
  primaryResult: any;
  secondaryResult?: any;
  tertiaryResult?: any;
  servicesUsed: string[];
  consensusScore?: number;
  timestamp: Date;
}

export class AIPriorityOrchestrator {
  private aiStatus: AIServiceStatus;

  constructor() {
    this.aiStatus = {
      claude: !!process.env.ANTHROPIC_API_KEY,
      chatgpt: !!process.env.OPENAI_API_KEY,
      perplexity: !!process.env.PERPLEXITY_API_KEY,
      gemini: !!process.env.GEMINI_API_KEY,
      grok: !!process.env.XAI_API_KEY
    };

    console.log('🚀 AI Priority Orchestrator initialized:');
    console.log('  1️⃣ Perplexity:', this.aiStatus.perplexity ? '✅ Active (Primary - Web Search)' : '❌ Missing API key');
    console.log('  2️⃣ ChatGPT:', this.aiStatus.chatgpt ? '✅ Active (Secondary - Analysis)' : '❌ Missing API key');
    console.log('  3️⃣ Claude:', this.aiStatus.claude ? '✅ Active (Backup)' : '❌ Missing API key');
    console.log('  ❌ Gemini: Removed from orchestration');
    console.log('  ❌ Grok: Removed from orchestration');
  }

  /**
   * Main orchestration method - routes to appropriate AI based on task type and priority
   */
  async analyzeWithPriority(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    const servicesUsed: string[] = [];
    let primaryResult = null;
    let secondaryResult = null;
    let tertiaryResult = null;

    try {
      // Special case: Real-time search goes to Perplexity first
      if (request.requireRealTime && this.aiStatus.perplexity) {
        console.log('🔍 Using Perplexity for real-time search...');
        primaryResult = await this.callPerplexity(request);
        servicesUsed.push('Perplexity');
        
        // Get Claude's analysis of Perplexity results
        if (this.aiStatus.claude) {
          secondaryResult = await this.callClaude({
            ...request,
            context: { ...request.context, perplexityResults: primaryResult }
          });
          servicesUsed.push('Claude');
        }
      }
      // Financial analysis prioritizes ChatGPT
      else if (request.requireFinancial && this.aiStatus.chatgpt) {
        console.log('💰 Using ChatGPT for financial analysis...');
        primaryResult = await this.callChatGPT(request);
        servicesUsed.push('ChatGPT');
        
        // Get Claude's verification
        if (this.aiStatus.claude) {
          secondaryResult = await this.callClaude({
            ...request,
            context: { ...request.context, chatgptAnalysis: primaryResult }
          });
          servicesUsed.push('Claude');
        }
      }
      // Default: Use new priority order (Perplexity first for search/verification)
      else {
        // Try Perplexity first for search and verification (Priority 1)
        if (this.aiStatus.perplexity && (request.type === 'search' || request.type === 'realtime')) {
          console.log('🔍 Using Perplexity (Primary AI - Web Search)...');
          primaryResult = await this.callPerplexity(request);
          servicesUsed.push('Perplexity');
        }
        
        // Use Claude for analysis (Priority 2)
        if (this.aiStatus.claude) {
          if (!primaryResult) {
            // Claude as primary if Perplexity not applicable
            console.log('🧠 Using Claude (Secondary AI - Analysis)...');
            primaryResult = await this.callClaude(request);
            servicesUsed.push('Claude');
          } else {
            // Claude analyzes Perplexity results
            console.log('🧠 Claude analyzing Perplexity results...');
            secondaryResult = await this.callClaude({
              ...request,
              context: { ...request.context, perplexityResults: primaryResult }
            });
            servicesUsed.push('Claude');
          }
        }
        
        // ChatGPT as backup (Priority 3)
        if (!primaryResult && this.aiStatus.chatgpt) {
          console.log('🤖 Using ChatGPT (Backup AI)...');
          primaryResult = await this.callChatGPT(request);
          servicesUsed.push('ChatGPT');
        }
      }

      // Calculate consensus if multiple services responded
      const consensusScore = this.calculateConsensus(primaryResult, secondaryResult, tertiaryResult);

      return {
        primaryResult,
        secondaryResult,
        tertiaryResult,
        servicesUsed,
        consensusScore,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('❌ AI Priority Orchestrator error:', error);
      throw error;
    }
  }

  /**
   * Call Claude API (Priority 1)
   */
  private async callClaude(request: AIAnalysisRequest): Promise<any> {
    try {
      const systemPrompt = this.getSystemPrompt(request.type);
      const userPrompt = this.buildPrompt(request);

      const response = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 2000,
        messages: [{ role: 'user', content: userPrompt }],
        system: systemPrompt
      });

      const content = response.content[0];
      if (content.type === 'text') {
        try {
          return JSON.parse(content.text);
        } catch {
          return { analysis: content.text };
        }
      }
      return null;
    } catch (error) {
      console.error('Claude API error:', error);
      throw error;
    }
  }

  /**
   * Call ChatGPT-5 API (Priority 1)
   */
  private async callChatGPT(request: AIAnalysisRequest): Promise<any> {
    try {
      const systemPrompt = this.getSystemPrompt(request.type);
      const userPrompt = this.buildPrompt(request);

      const response = await openai.chat.completions.create({
        model: CHATGPT_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        max_completion_tokens: 2000, // GPT-5 uses max_completion_tokens instead of max_tokens
        temperature: 0.7,
        reasoning_effort: 'medium' // New GPT-5 parameter for balanced reasoning
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        return JSON.parse(content);
      }
      return null;
    } catch (error) {
      console.error('ChatGPT API error:', error);
      throw error;
    }
  }

  /**
   * Call Perplexity API (Priority 3)
   */
  private async callPerplexity(request: AIAnalysisRequest): Promise<any> {
    try {
      const searchResults = await perplexityService.searchRealTime(
        request.query,
        JSON.stringify(request.context)
      );
      
      return {
        source: 'Perplexity',
        realTimeData: searchResults.summary,
        sources: searchResults.sources,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Perplexity API error:', error);
      throw error;
    }
  }

  /**
   * Call Gemini API (Priority 4) - DISABLED
   */
  private async callGemini(request: AIAnalysisRequest): Promise<any> {
    // DISABLED: Gemini service disabled
    console.log('Gemini service requested but is disabled');
    throw new Error('Gemini service is currently disabled');
  }

  /**
   * Get appropriate system prompt based on analysis type
   */
  private getSystemPrompt(type: string): string {
    const prompts: Record<string, string> = {
      search: "You are an expert web search specialist for MySeniorValet, helping families find comprehensive, current information about senior living communities. Provide thorough research including pricing, availability, reviews, quality indicators, and any relevant context that helps families make informed decisions.",
      recommendation: "You are a compassionate senior living advisor providing personalized community recommendations. Consider all aspects of care needs, lifestyle preferences, financial constraints, and family dynamics. Provide rich insights that help families understand why each recommendation is valuable.",
      analysis: "You are a comprehensive quality assessment expert evaluating senior living communities. Analyze care quality, safety records, resident satisfaction, staffing levels, activities, dining programs, and overall community culture. Help families understand what makes each community unique.",
      financial: "You are a senior care financial advisor helping families understand the complete cost picture. Explain pricing structures, identify hidden costs, suggest financial assistance options, and provide budgeting strategies. Make complex financial information accessible and actionable.",
      contract: "You are a senior living legal advisor reviewing contracts and agreements. Explain important terms in plain language, identify potential concerns, highlight resident rights, and suggest questions families should ask. Make legal complexity understandable.",
      realtime: "You are a real-time intelligence specialist providing current market insights. Report on availability, waitlists, recent changes, market trends, and timing considerations. Help families understand the urgency and opportunities in their search."
    };
    
    return prompts[type] || prompts.analysis;
  }

  /**
   * Build appropriate prompt based on request
   */
  private buildPrompt(request: AIAnalysisRequest): string {
    let prompt = request.query;
    
    // Add comprehensive instructions based on request type
    const focusInstructions: Record<string, string> = {
      search: "\n\nProvide comprehensive findings including:\n- Current pricing and availability\n- Recent news and updates\n- Reviews and ratings\n- Quality indicators\n- Market positioning\n- Any relevant information that helps families make informed decisions",
      recommendation: "\n\nProvide thoughtful recommendations including:\n- Detailed match analysis for each community\n- Specific advantages for this family's needs\n- Important considerations to explore\n- Lifestyle and culture fit\n- Financial value assessment\n- Practical next steps",
      analysis: "\n\nProvide thorough quality analysis including:\n- Care quality indicators and certifications\n- Safety records and regulatory compliance\n- Resident and family satisfaction patterns\n- Staffing levels and expertise\n- Activities and lifestyle programs\n- Community culture and atmosphere",
      financial: "\n\nProvide complete financial guidance including:\n- Detailed cost breakdown\n- Payment options and structures\n- Financial assistance opportunities\n- Budget planning strategies\n- Value comparison with alternatives\n- Hidden costs to consider",
      contract: "\n\nProvide comprehensive contract review including:\n- Key terms explained in plain language\n- Resident rights and protections\n- Potential concerns or red flags\n- Questions to ask before signing\n- Negotiation opportunities\n- Important deadlines and obligations",
      realtime: "\n\nProvide current market intelligence including:\n- Real-time availability and waitlist status\n- Recent price changes or promotions\n- Market trends affecting this community\n- Timing considerations for application\n- Competitive landscape updates\n- Urgency indicators"
    };
    
    if (request.context) {
      // Include comprehensive context
      prompt += `\n\nContext: ${JSON.stringify(request.context, null, 2)}`;
    }
    
    prompt += focusInstructions[request.type] || focusInstructions.analysis;
    prompt += "\n\nProvide comprehensive, valuable insights in JSON format. Help families make confident, informed decisions.";
    
    return prompt;
  }

  /**
   * Calculate consensus score between multiple AI responses
   */
  private calculateConsensus(primary: any, secondary: any, tertiary: any): number {
    if (!primary) return 0;
    if (!secondary && !tertiary) return 100; // Only one response
    
    // Simple consensus calculation - can be enhanced
    let score = 100;
    let comparisons = 0;
    
    if (secondary) {
      comparisons++;
      // Compare key findings or recommendations
      // This is simplified - implement more sophisticated comparison
      if (JSON.stringify(primary).length > 0 && JSON.stringify(secondary).length > 0) {
        score -= 10; // Slight variance expected
      }
    }
    
    if (tertiary) {
      comparisons++;
      if (JSON.stringify(primary).length > 0 && JSON.stringify(tertiary).length > 0) {
        score -= 10;
      }
    }
    
    return Math.max(0, score);
  }

  /**
   * Get current AI service status
   */
  getStatus(): AIServiceStatus {
    return this.aiStatus;
  }

  /**
   * Test all AI services
   */
  async testAllServices(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    
    // Test Claude
    if (this.aiStatus.claude) {
      try {
        await this.callClaude({ 
          query: "Test connection", 
          type: 'analysis' 
        });
        results.claude = true;
      } catch {
        results.claude = false;
      }
    }
    
    // Test ChatGPT
    if (this.aiStatus.chatgpt) {
      try {
        await this.callChatGPT({ 
          query: "Test connection", 
          type: 'analysis' 
        });
        results.chatgpt = true;
      } catch {
        results.chatgpt = false;
      }
    }
    
    // Test Perplexity
    if (this.aiStatus.perplexity) {
      try {
        await perplexityService.searchRealTime("Test search", "");
        results.perplexity = true;
      } catch {
        results.perplexity = false;
      }
    }
    
    // Test Gemini
    if (this.aiStatus.gemini) {
      try {
        await this.callGemini({ 
          query: "Test connection", 
          type: 'analysis' 
        });
        results.gemini = true;
      } catch {
        results.gemini = false;
      }
    }
    
    // Grok status
    results.grok = grokService.getCapabilities().realTimeFactChecking;
    
    return results;
  }
}

// Export singleton instance
export const aiPriorityOrchestrator = new AIPriorityOrchestrator();
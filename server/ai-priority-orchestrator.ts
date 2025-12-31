/**
 * AI Priority Orchestrator for MySeniorValet
 * 
 * Priority Order (Updated December 31, 2025):
 * 1. Groq + Llama 3.3 70B (PRIMARY - FREE) - All AI tasks routed through Groq
 * 2. DuckDuckGo + Crawlee (FREE) - Web search and scraping
 * 3. Paid APIs (DISABLED) - Claude, OpenAI, Perplexity disabled to save costs
 * 
 * This update replaces ALL paid AI services with FREE alternatives:
 * - Groq provides FREE Llama 3.3 70B inference (14,400 req/day, 500K tokens/day)
 * - DuckDuckGo provides FREE web search
 * - Crawlee provides FREE web scraping
 */

import OpenAI from 'openai';
import { groqLlamaService } from './services/groq-llama-service';
import { freeAISearchPipeline } from './services/free-ai-search-pipeline';
import { perplexityService } from './perplexity-ai-service';
import { grokService } from './xai-grok-integration';

// Initialize Groq client (FREE - primary AI service)
const groqClient = process.env.GROQ_API_KEY ? new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1'
}) : null;

// Paid services (DISABLED by default - only used as fallback)
const PAID_SERVICES_ENABLED = false; // Set to true to enable paid fallbacks

// Model versions
const GROQ_MODEL = "llama-3.3-70b-versatile"; // FREE via Groq
const CLAUDE_MODEL = "claude-sonnet-4-20250514"; // DISABLED - paid
const CHATGPT_MODEL = "gpt-5"; // DISABLED - paid
const PERPLEXITY_MODEL = "llama-3.1-sonar-large-128k-online"; // DISABLED - paid

export interface AIServiceStatus {
  groq: boolean; // PRIMARY - FREE
  claude: boolean; // DISABLED - paid
  chatgpt: boolean; // DISABLED - paid
  perplexity: boolean; // DISABLED - paid
  gemini: boolean; // DISABLED - paid
  grok: boolean; // DISABLED - paid
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
      groq: !!process.env.GROQ_API_KEY, // PRIMARY - FREE
      claude: PAID_SERVICES_ENABLED && !!process.env.ANTHROPIC_API_KEY,
      chatgpt: PAID_SERVICES_ENABLED && !!process.env.OPENAI_API_KEY,
      perplexity: PAID_SERVICES_ENABLED && !!process.env.PERPLEXITY_API_KEY,
      gemini: false, // DISABLED
      grok: false // DISABLED
    };

    console.log('🚀 AI Priority Orchestrator initialized (FREE MODE):');
    console.log('  1️⃣ Groq + Llama 3.3:', this.aiStatus.groq ? '✅ Active (PRIMARY - FREE)' : '❌ Missing GROQ_API_KEY');
    console.log('  2️⃣ DuckDuckGo Search: ✅ Active (FREE - no API key needed)');
    console.log('  3️⃣ Crawlee Scraper: ✅ Active (FREE - Playwright-based)');
    console.log('  ❌ Perplexity: DISABLED (paid)');
    console.log('  ❌ Claude: DISABLED (paid)');
    console.log('  ❌ ChatGPT: DISABLED (paid)');
    
    if (!this.aiStatus.groq) {
      console.warn('⚠️ GROQ_API_KEY not set - AI features will be limited');
    }
  }

  /**
   * Main orchestration method - ALL REQUESTS GO THROUGH GROQ (FREE)
   */
  async analyzeWithPriority(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    const servicesUsed: string[] = [];
    let primaryResult = null;
    let secondaryResult = null;
    let tertiaryResult = null;

    try {
      // ==========================================
      // PRIMARY: Use Groq + Llama 3.3 70B (FREE)
      // ==========================================
      if (this.aiStatus.groq) {
        console.log('🆓 Using Groq + Llama 3.3 (FREE) for analysis...');
        primaryResult = await this.callGroq(request);
        servicesUsed.push('Groq (Llama 3.3 70B)');
        
        // For real-time search, also use free web search pipeline
        if (request.requireRealTime || request.type === 'search' || request.type === 'realtime') {
          console.log('🔍 Using FREE web search pipeline (DuckDuckGo + Crawlee)...');
          try {
            // Extract search terms from request
            const searchResult = await freeAISearchPipeline.quickSearch(
              request.query,
              request.context?.location || ''
            );
            secondaryResult = searchResult;
            servicesUsed.push('DuckDuckGo (FREE)');
          } catch (searchError) {
            console.warn('Web search pipeline failed:', searchError);
          }
        }
      }
      // Fallback to paid services ONLY if explicitly enabled and Groq unavailable
      else if (PAID_SERVICES_ENABLED) {
        console.log('💰 Groq unavailable, falling back to paid services...');
        
        if (this.aiStatus.perplexity && (request.requireRealTime || request.type === 'search')) {
          primaryResult = await this.callPerplexity(request);
          servicesUsed.push('Perplexity (PAID)');
        } else if (this.aiStatus.claude) {
          primaryResult = await this.callClaude(request);
          servicesUsed.push('Claude (PAID)');
        } else if (this.aiStatus.chatgpt) {
          primaryResult = await this.callChatGPT(request);
          servicesUsed.push('ChatGPT (PAID)');
        }
      }
      // No AI services available
      else {
        console.error('❌ No AI services available - GROQ_API_KEY required');
        primaryResult = {
          error: 'AI services unavailable',
          message: 'Please configure GROQ_API_KEY for free AI functionality'
        };
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
   * Call Groq + Llama 3.3 70B (FREE - Primary AI)
   */
  private async callGroq(request: AIAnalysisRequest): Promise<any> {
    if (!groqClient) {
      throw new Error('Groq client not initialized');
    }
    
    const systemPrompt = this.getSystemPrompt(request.type);
    const userPrompt = this.buildPrompt(request);
    
    try {
      const response = await groqClient.chat.completions.create({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4096
      });
      
      const content = response.choices[0]?.message?.content || '';
      const usage = response.usage || { total_tokens: 0 };
      
      console.log(`✅ Groq response: ${usage.total_tokens} tokens (FREE)`);
      
      return {
        response: content,
        model: GROQ_MODEL,
        tokens: usage.total_tokens,
        cost: 0 // FREE!
      };
    } catch (error: any) {
      console.error('Groq API error:', error.message);
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
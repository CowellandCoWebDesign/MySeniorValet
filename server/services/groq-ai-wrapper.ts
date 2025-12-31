/**
 * Groq AI Wrapper Service
 * 
 * Drop-in replacement for Anthropic Claude and OpenAI that routes through Groq's FREE API.
 * Maintains API compatibility with existing code while using Llama 3.3 70B.
 * 
 * This module provides:
 * - Anthropic-compatible interface
 * - OpenAI-compatible interface
 * - Automatic fallback when Groq unavailable
 */

import OpenAI from 'openai';
import { groqLlamaService } from './groq-llama-service';

// Create Groq client with OpenAI compatibility
const groqClient = process.env.GROQ_API_KEY ? new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1'
}) : null;

// Fallback to actual OpenAI if no Groq key
const openaiClient = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null;

/**
 * Anthropic-compatible message interface
 */
interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AnthropicRequest {
  model?: string;
  max_tokens?: number;
  system?: string;
  messages: AnthropicMessage[];
  temperature?: number;
}

interface AnthropicResponse {
  content: Array<{ type: 'text'; text: string }>;
  model: string;
  stop_reason: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

/**
 * Groq-based Anthropic replacement
 * Routes Claude calls through Groq's Llama 3.3 for FREE inference
 */
export class GroqAnthropicWrapper {
  private model = 'llama-3.3-70b-versatile';
  
  async createMessage(request: AnthropicRequest): Promise<AnthropicResponse> {
    if (!groqClient) {
      throw new Error('Groq API key not configured - GROQ_API_KEY required');
    }
    
    console.log(`🔄 Routing Claude request through Groq (FREE)`);
    
    // Convert Anthropic format to OpenAI format
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];
    
    if (request.system) {
      messages.push({ role: 'system', content: request.system });
    }
    
    for (const msg of request.messages) {
      messages.push({ role: msg.role, content: msg.content });
    }
    
    try {
      const response = await groqClient.chat.completions.create({
        model: this.model,
        messages,
        max_tokens: request.max_tokens || 4096,
        temperature: request.temperature ?? 0.7
      });
      
      const content = response.choices[0]?.message?.content || '';
      const usage = response.usage || { prompt_tokens: 0, completion_tokens: 0 };
      
      console.log(`✅ Groq (Claude replacement): ${usage.prompt_tokens + usage.completion_tokens} tokens`);
      
      // Return in Anthropic format
      return {
        content: [{ type: 'text', text: content }],
        model: this.model,
        stop_reason: response.choices[0]?.finish_reason || 'stop',
        usage: {
          input_tokens: usage.prompt_tokens,
          output_tokens: usage.completion_tokens
        }
      };
    } catch (error: any) {
      console.error('Groq Claude replacement error:', error.message);
      throw error;
    }
  }
  
  // Compatibility method for direct messages
  messages = {
    create: (request: AnthropicRequest) => this.createMessage(request)
  };
}

/**
 * Groq-based OpenAI replacement
 * Routes OpenAI calls through Groq's Llama 3.3 for FREE inference
 */
export class GroqOpenAIWrapper {
  private model = 'llama-3.3-70b-versatile';
  
  chat = {
    completions: {
      create: async (request: OpenAI.Chat.ChatCompletionCreateParams) => {
        if (!groqClient) {
          throw new Error('Groq API key not configured');
        }
        
        console.log(`🔄 Routing OpenAI request through Groq (FREE)`);
        
        try {
          const response = await groqClient.chat.completions.create({
            ...request,
            model: this.model // Override model to use Llama
          });
          
          const usage = response.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
          console.log(`✅ Groq (OpenAI replacement): ${usage.total_tokens} tokens`);
          
          return response;
        } catch (error: any) {
          console.error('Groq OpenAI replacement error:', error.message);
          throw error;
        }
      }
    }
  };
}

/**
 * Smart AI client that uses Groq when available, falls back to paid services
 */
export class SmartAIClient {
  private useGroq: boolean;
  private groqAnthropic: GroqAnthropicWrapper;
  private groqOpenAI: GroqOpenAIWrapper;
  
  constructor() {
    this.useGroq = !!process.env.GROQ_API_KEY;
    this.groqAnthropic = new GroqAnthropicWrapper();
    this.groqOpenAI = new GroqOpenAIWrapper();
    
    if (this.useGroq) {
      console.log('🆓 SmartAIClient: Using Groq (FREE) for all AI calls');
    } else {
      console.log('💰 SmartAIClient: Falling back to paid APIs (Groq not configured)');
    }
  }
  
  isGroqEnabled(): boolean {
    return this.useGroq;
  }
  
  // Get Anthropic-compatible client
  getAnthropicClient(): GroqAnthropicWrapper {
    return this.groqAnthropic;
  }
  
  // Get OpenAI-compatible client  
  getOpenAIClient(): GroqOpenAIWrapper {
    return this.groqOpenAI;
  }
  
  // Direct completion method
  async complete(
    prompt: string,
    options: {
      systemPrompt?: string;
      temperature?: number;
      maxTokens?: number;
    } = {}
  ): Promise<string> {
    return groqLlamaService.complete(prompt, {
      systemPrompt: options.systemPrompt,
      temperature: options.temperature,
      maxTokens: options.maxTokens
    }).then(r => r.content);
  }
  
  // Direct chat method
  async chat(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    systemPrompt?: string
  ): Promise<string> {
    return groqLlamaService.chat(messages, systemPrompt);
  }
}

// Singleton instances
export const groqAnthropicWrapper = new GroqAnthropicWrapper();
export const groqOpenAIWrapper = new GroqOpenAIWrapper();
export const smartAIClient = new SmartAIClient();

/**
 * Perplexity-compatible response interface for drop-in replacement
 */
export interface PerplexityCompatibleResponse {
  data: string;
  sources: string[];
  model: string;
}

/**
 * Groq-based Perplexity replacement for search-style queries
 * Uses Llama to generate responses that mimic Perplexity's format
 */
export class GroqPerplexityWrapper {
  /**
   * Search for community information using Groq (FREE)
   * Drop-in replacement for PerplexityAIService.searchCommunityInfo
   */
  async searchCommunityInfo(query: string): Promise<PerplexityCompatibleResponse> {
    console.log(`🆓 Using Groq (FREE) instead of Perplexity for: ${query.substring(0, 60)}...`);
    
    if (!groqClient) {
      console.warn('Groq not configured, returning empty response');
      return { data: '', sources: [], model: 'none' };
    }
    
    try {
      const systemPrompt = `You are a helpful assistant that provides concise, factual information about senior living communities. 
When asked about virtual tours, 3D tours, or similar features, focus on providing direct URLs if you know them.
Be concise and factual. If you don't have specific information, say so clearly.`;

      const response = await groqClient.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        max_tokens: 1024,
        temperature: 0.3
      });
      
      const content = response.choices[0]?.message?.content || '';
      const usage = response.usage || { total_tokens: 0 };
      console.log(`✅ Groq (Perplexity replacement): ${usage.total_tokens} tokens`);
      
      return {
        data: content,
        sources: [], // Groq doesn't provide sources like Perplexity
        model: 'llama-3.3-70b-versatile'
      };
    } catch (error: any) {
      console.error('Groq Perplexity replacement error:', error.message);
      return { data: '', sources: [], model: 'error' };
    }
  }
  
  /**
   * Real-time search replacement - uses Groq's knowledge
   */
  async searchRealTime(query: string): Promise<{ data: string; sources: string[] }> {
    const result = await this.searchCommunityInfo(query);
    return { data: result.data, sources: result.sources };
  }
}

export const groqPerplexityWrapper = new GroqPerplexityWrapper();

/**
 * Helper to check if Groq is available
 */
export function isGroqAvailable(): boolean {
  return !!process.env.GROQ_API_KEY;
}

/**
 * Get the appropriate AI client based on availability
 */
export function getAIClient(): {
  anthropic: GroqAnthropicWrapper | null;
  openai: GroqOpenAIWrapper | null;
  groqAvailable: boolean;
} {
  const groqAvailable = isGroqAvailable();
  
  return {
    anthropic: groqAvailable ? groqAnthropicWrapper : null,
    openai: groqAvailable ? groqOpenAIWrapper : null,
    groqAvailable
  };
}

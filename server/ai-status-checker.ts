/**
 * AI API Status Checker Service
 * Quick health check for all AI services
 */

import { Anthropic } from '@anthropic-ai/sdk';
import OpenAI from 'openai';

interface AIStatus {
  claude: { working: boolean; message: string };
  openai: { working: boolean; message: string };
  perplexity: { working: boolean; message: string };
}

export async function checkAllAIStatus(): Promise<AIStatus> {
  const results: AIStatus = {
    claude: { working: false, message: '' },
    openai: { working: false, message: '' },
    perplexity: { working: false, message: '' }
  };

  // Test Claude
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      results.claude.message = 'API key not found';
    } else {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }]
      });
      results.claude.working = true;
      results.claude.message = 'Working';
    }
  } catch (error: any) {
    results.claude.message = error.message?.includes('credit balance') ? 'Credit balance too low' : 'API Error';
  }

  // Test OpenAI
  try {
    if (!process.env.OPENAI_API_KEY) {
      results.openai.message = 'API key not found';
    } else {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 10
      });
      results.openai.working = true;
      results.openai.message = 'Working';
    }
  } catch (error: any) {
    results.openai.message = error.message?.includes('quota') ? 'Quota exceeded' : 'API Error';
  }

  // Test Perplexity - COST CONTROL: Skip actual API call to prevent spending
  // Each health check was costing money - just verify key exists instead
  try {
    if (!process.env.PERPLEXITY_API_KEY) {
      results.perplexity.message = 'API key not found';
    } else {
      // COST CONTROL: Don't make actual API call - just verify key format
      // The actual API call was contributing to unnecessary spending
      const keyPrefix = process.env.PERPLEXITY_API_KEY.substring(0, 8);
      if (keyPrefix.startsWith('pplx-')) {
        results.perplexity.working = true;
        results.perplexity.message = 'API key configured (health check skipped for cost control)';
      } else {
        results.perplexity.message = 'Invalid API key format';
      }
    }
  } catch (error: any) {
    results.perplexity.message = 'Configuration check failed';
  }

  return results;
}
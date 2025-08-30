import { Router } from 'express';
import OpenAI from 'openai';
import { db } from '../db';
import { communities } from '../../shared/schema';
import { like, or, and, sql, desc } from 'drizzle-orm';

const router = Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Safety check for malicious prompts
function isSafePrompt(prompt: string): boolean {
  const blockedTerms = [
    'password', 'hack', 'exploit', 'vulnerability', 'injection',
    'bypass', 'admin', 'root', 'sudo', 'execute', 'system',
    'eval', 'script', 'delete all', 'drop table', 'truncate'
  ];
  
  const lowerPrompt = prompt.toLowerCase();
  return !blockedTerms.some(term => lowerPrompt.includes(term));
}

// Find relevant platform resources based on the query
async function findRelevantResources(query: string) {
  const resources = [];
  const lowerQuery = query.toLowerCase();
  
  // Check for common topics and suggest relevant pages
  const topicMappings = [
    {
      keywords: ['price', 'cost', 'afford', 'cheap', 'expensive', 'budget', 'payment'],
      suggestions: [
        { title: 'Pricing Explorer', url: '/pricing', description: 'Compare pricing across different care levels and regions' },
        { title: 'HUD Affordable Housing', url: '/map-search?hud=true', description: 'Search 4,784+ government-subsidized communities' }
      ]
    },
    {
      keywords: ['map', 'location', 'near me', 'close by', 'area', 'region', 'city', 'state'],
      suggestions: [
        { title: 'Interactive Map Search', url: '/map-search', description: 'Visual map with 32,970+ communities' },
        { title: 'Location-Based Search', url: '/ai-search-intelligence', description: 'AI-powered location search' }
      ]
    },
    {
      keywords: ['compare', 'versus', 'vs', 'difference', 'better', 'best', 'top'],
      suggestions: [
        { title: 'AI Compare Tool', url: '/ai-search-intelligence?tab=compare', description: 'Side-by-side community comparisons' },
        { title: 'Market Analysis', url: '/competitive-analysis', description: 'Regional pricing and trend analysis' }
      ]
    },
    {
      keywords: ['memory care', 'alzheimer', 'dementia', 'cognitive'],
      suggestions: [
        { title: 'Memory Care Communities', url: '/search?careType=memory_care', description: 'Specialized memory care facilities' },
        { title: 'Care Guide', url: '/care-guide', description: 'Understanding different care levels' }
      ]
    },
    {
      keywords: ['veteran', 'va', 'military', 'service member'],
      suggestions: [
        { title: 'VA Resources', url: '/va-resources', description: 'Veterans benefits and facilities' },
        { title: 'Military-Friendly Communities', url: '/search?veteran=true', description: 'Communities with veteran programs' }
      ]
    },
    {
      keywords: ['canada', 'canadian', 'ontario', 'quebec', 'british columbia'],
      suggestions: [
        { title: 'Canadian Communities', url: '/canadian-hub', description: 'Senior living across Canada' },
        { title: 'Provincial Resources', url: '/map-search?country=CA', description: 'Search by Canadian province' }
      ]
    },
    {
      keywords: ['tour', 'visit', 'schedule', 'appointment', 'contact'],
      suggestions: [
        { title: 'TourMate Scheduling', url: '/tours', description: 'Schedule community tours' },
        { title: 'Contact Communities', url: '/messages', description: 'Direct messaging with communities' }
      ]
    },
    {
      keywords: ['vendor', 'supplier', 'service provider', 'business', 'marketplace'],
      suggestions: [
        { title: 'Vendor Marketplace', url: '/vendor-marketplace', description: 'Products and services for seniors' },
        { title: 'Become a Vendor', url: '/vendor-signup', description: 'Join our vendor network' }
      ]
    }
  ];
  
  // Find matching topics
  for (const topic of topicMappings) {
    if (topic.keywords.some(keyword => lowerQuery.includes(keyword))) {
      resources.push(...topic.suggestions);
    }
  }
  
  // Search for specific communities mentioned in the query
  try {
    const searchTerms = query.split(' ').filter(term => term.length > 3);
    if (searchTerms.length > 0) {
      // Search for each term individually and combine results
      for (const term of searchTerms.slice(0, 2)) { // Limit to first 2 terms for performance
        try {
          const communityResults = await db
            .select({
              id: communities.id,
              name: communities.name,
              city: communities.city,
              state: communities.state
            })
            .from(communities)
            .where(
              or(
                like(communities.name, `%${term}%`),
                like(communities.city, `%${term}%`)
              )
            )
            .limit(2);
          
          if (communityResults && communityResults.length > 0) {
            communityResults.forEach(community => {
              if (community && community.name) {
                resources.push({
                  title: community.name,
                  url: `/community/${community.id}`,
                  description: `${community.city || 'Unknown'}, ${community.state || ''} - View community details`
                });
              }
            });
          }
        } catch (searchError) {
          console.error(`Error searching for term "${term}":`, searchError);
        }
      }
    }
  } catch (error) {
    console.error('Error in community search:', error);
  }
  
  // Remove duplicates
  const uniqueResources = resources.reduce((acc, current) => {
    const exists = acc.find(item => item.url === current.url);
    if (!exists) {
      acc.push(current);
    }
    return acc;
  }, [] as typeof resources);
  
  return uniqueResources.slice(0, 5); // Return top 5 most relevant
}

// Main AI chat endpoint - Public endpoint for research mode
router.post('/public/ai-chat', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    if (query.length > 1000) {
      return res.status(400).json({ error: 'Query is too long (max 1000 characters)' });
    }
    
    // Safety check
    if (!isSafePrompt(query)) {
      return res.status(400).json({ error: 'Query contains prohibited terms' });
    }
    
    // Find relevant platform resources
    const platformResources = await findRelevantResources(query);
    
    // Create the ChatGPT prompt
    const systemPrompt = `You are MySeniorValet's AI Assistant, helping families find senior living information. 
    
IMPORTANT CONTEXT:
- MySeniorValet has 32,970+ senior living communities in the database
- We cover all US states and Canadian provinces
- We have 4,784 HUD/affordable housing properties
- We provide transparent pricing without paywalls
- Our AI Orchestra includes Perplexity (web search), Claude (analysis), and ChatGPT (general assistance)

When answering:
1. Be helpful, empathetic, and informative
2. If the question is about senior care, provide practical guidance
3. Reference specific features of MySeniorValet when relevant
4. Keep responses concise but comprehensive
5. Use the newest OpenAI model "gpt-5" which was released August 7, 2025`;

    // Call OpenAI API
    let completion;
    try {
      console.log('Calling OpenAI GPT-5 with query:', query);
      completion = await openai.chat.completions.create({
        model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query }
        ],
        max_completion_tokens: 500, // gpt-5 uses max_completion_tokens instead of max_tokens
        // temperature: 1 is the default and only supported value for gpt-5
      });
      console.log('OpenAI response received:', completion.choices[0]);
    } catch (openaiError: any) {
      console.error('OpenAI API Error:', openaiError?.message || openaiError);
      console.error('Error details:', openaiError?.response?.data || openaiError);
      
      // Provide a fallback response if OpenAI fails
      const fallbackResponse = {
        answer: "I'm here to help you navigate senior living options. While I'm experiencing a temporary connection issue, MySeniorValet has extensive resources including 32,970+ communities across the US and Canada. You can explore our pricing comparisons, map search, or browse by care type. What specific information are you looking for?",
        suggestions: ["Search by location", "Compare pricing", "Learn about care types", "View HUD properties"]
      };
      
      return res.json({
        success: true,
        query: query,
        answer: fallbackResponse.answer,
        platformResources: platformResources,
        suggestions: fallbackResponse.suggestions,
        timestamp: new Date().toISOString()
      });
    }

    const aiResponse = completion?.choices?.[0]?.message?.content;
    
    if (!aiResponse) {
      console.error('Empty response from OpenAI:', completion);
      throw new Error('No response from AI');
    }

    // Create a structured response from the plain text
    const parsedResponse = {
      answer: aiResponse,
      suggestions: ["Search by location", "Compare pricing", "Learn about care types", "View HUD properties"]
    };

    // Format the final response
    const response = {
      success: true,
      query: query,
      answer: parsedResponse.answer || aiResponse,
      platformResources: platformResources,
      suggestions: parsedResponse.suggestions || [],
      timestamp: new Date().toISOString()
    };

    res.json(response);
    
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ 
      error: 'Failed to process your request',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Endpoint to get AI suggestions for a topic
router.post('/ai/suggestions', async (req, res) => {
  try {
    const { topic } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }
    
    const resources = await findRelevantResources(topic);
    
    res.json({
      success: true,
      topic: topic,
      resources: resources
    });
    
  } catch (error) {
    console.error('AI Suggestions Error:', error);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

export default router;
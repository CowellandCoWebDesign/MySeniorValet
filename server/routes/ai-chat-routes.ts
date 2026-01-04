import { Router } from 'express';
import { db } from '../db';
import { communities } from '../../shared/schema';
import { like, or, and, sql, desc } from 'drizzle-orm';
import fetch from 'node-fetch';
import { aiTracker } from '../services/ai-tracker.service';

const router = Router();

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
  
  // Only search for communities if the query specifically mentions a community name or location
  // This prevents random unrelated communities from appearing
  const lowerQueryForCommunity = lowerQuery;
  const locationKeywords = ['in ', 'at ', 'near ', ' facility', ' community', ' residence', ' manor', ' center'];
  const hasLocationContext = locationKeywords.some(keyword => lowerQueryForCommunity.includes(keyword));
  
  if (hasLocationContext) {
    try {
      // Extract potential community or location names (capitalize words that might be proper nouns)
      const words = query.split(' ');
      const potentialNames = words.filter(word => 
        word.length > 4 && 
        word[0] === word[0].toUpperCase() &&
        !['What', 'Where', 'When', 'How', 'Why', 'The'].includes(word)
      );
      
      if (potentialNames.length > 0) {
        // Search only for capitalized proper nouns that might be community names
        for (const name of potentialNames.slice(0, 1)) { // Only check the most likely name
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
                  like(communities.name, `%${name}%`),
                  like(communities.city, `${name}%`) // City match should be from beginning
                )
              )
              .limit(1); // Only show 1 relevant community
            
            if (communityResults && communityResults.length > 0) {
              const community = communityResults[0];
              if (community && community.name) {
                resources.push({
                  title: community.name,
                  url: `/community/${community.id}`,
                  description: `${community.city || 'Unknown'}, ${community.state || ''} - View community details`
                });
              }
            }
          } catch (searchError) {
            console.error(`Error searching for community "${name}":`, searchError);
          }
        }
      }
    } catch (error) {
      console.error('Error in community search:', error);
    }
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
    
    // Create the Perplexity prompt
    const systemPrompt = `You are a knowledgeable senior living expert providing helpful information about senior care, retirement communities, and elder care services.

When answering:
1. Be helpful, empathetic, and informative
2. Provide practical guidance about senior care topics
3. Share relevant statistics and facts from reliable sources
4. Keep responses concise but comprehensive
5. Include relevant information from web sources when available
6. Focus on general senior living information without promoting specific platforms`;

    // Call Perplexity Search API ($5/1K requests - MIGRATED from sonar Jan 2026)
    let searchResponse: any;
    const perplexityStartTime = Date.now();
    try {
      console.log('Calling Perplexity Search API with query:', query);
      
      // Use Search API endpoint instead of chat/completions
      const response = await fetch('https://api.perplexity.ai/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: `${query} senior living senior care elderly`,
          max_results: 10,
          max_tokens_per_page: 1024
        })
      });
      
      const perplexityDuration = Date.now() - perplexityStartTime;
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Perplexity Search API error:', response.status, errorText);
        
        await aiTracker.trackPerplexityCall({
          action: 'public_ai_chat',
          context: 'ai_chat_endpoint',
          model: 'search-api',
          requestDuration: perplexityDuration,
          success: false,
          errorMessage: `API error: ${response.status}`,
          prompt: query,
        });
        
        throw new Error(`Perplexity Search API error: ${response.status}`);
      }
      
      searchResponse = await response.json();
      const searchResults = searchResponse.results || [];
      
      // Format search results into a conversational response
      const formattedAnswer = searchResults.length > 0 
        ? searchResults.slice(0, 5).map((r: any) => 
            `**${r.title}**\n${r.snippet}`
          ).join('\n\n')
        : "I couldn't find specific information for your query. Please try searching our database directly or refining your question.";
      
      await aiTracker.trackPerplexityCall({
        action: 'public_ai_chat',
        context: 'ai_chat_endpoint',
        model: 'search-api',
        requestDuration: perplexityDuration,
        success: true,
        inputTokens: Math.ceil(query.length / 4),
        outputTokens: Math.ceil(formattedAnswer.length / 4),
        prompt: query,
        response: formattedAnswer.substring(0, 1000),
        metadata: { resultsCount: searchResults.length },
      });
      
      console.log('Perplexity Search API response received:', searchResults.length, 'results');
      
      // Extract citations from search results
      const citations = searchResults.map((r: any) => r.url).filter(Boolean);
      
      // Format the final response
      const responseData = {
        success: true,
        query: query,
        answer: formattedAnswer,
        platformResources: platformResources,
        suggestions: ["Search by location", "Compare pricing", "Learn about care types", "View HUD properties"],
        citations: citations,
        model: 'perplexity-search-api',
        timestamp: new Date().toISOString()
      };

      return res.json(responseData);
      
    } catch (perplexityError: any) {
      console.error('Perplexity Search API Error:', perplexityError?.message || perplexityError);
      
      // Provide a fallback response if Perplexity fails
      const fallbackResponse = {
        answer: "I'm here to help you navigate senior living options. MySeniorValet has extensive resources including 32,970+ communities across the US and Canada. You can explore our pricing comparisons, map search, or browse by care type. What specific information are you looking for?",
        suggestions: ["Search by location", "Compare pricing", "Learn about care types", "View HUD properties"]
      };
      
      return res.json({
        success: true,
        query: query,
        answer: fallbackResponse.answer,
        platformResources: platformResources,
        suggestions: fallbackResponse.suggestions,
        timestamp: new Date().toISOString(),
        model: 'fallback'
      });
    }
    
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
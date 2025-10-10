import { Router, Request, Response } from 'express';
import OpenAI from 'openai';
import { db } from '../db';
import { communities } from '@shared/schema';
import { eq, and, or, ilike, sql, desc } from 'drizzle-orm';
import axios from 'axios';

const router = Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Store assistant ID (in production, store in env or database)
let ASSISTANT_ID: string | null = null;

// Define function tools for the assistant
const tools = [
  {
    type: "function" as const,
    function: {
      name: "search_communities",
      description: "Search for senior living communities in our database of 33,834 verified communities. Use this when users ask for specific locations or care types.",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: "City, state, or region to search (e.g., 'Dallas', 'Texas', 'California')"
          },
          careType: {
            type: "string",
            description: "Type of care: 'Assisted Living', 'Memory Care', 'Independent Living', 'Skilled Nursing', or leave empty for all",
            enum: ["Assisted Living", "Memory Care", "Independent Living", "Skilled Nursing", ""]
          },
          maxPrice: {
            type: "number",
            description: "Maximum monthly price in USD, if specified"
          }
        },
        required: ["location"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "show_on_map",
      description: "Display communities on the interactive map with clustering. Use after showing search results or when user wants to see locations visually.",
      parameters: {
        type: "object",
        properties: {
          communityIds: {
            type: "array",
            items: { type: "string" },
            description: "Array of community IDs to show on map"
          },
          centerLocation: {
            type: "string",
            description: "Center location for the map (e.g., 'Dallas, TX')"
          }
        },
        required: ["communityIds"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "show_community_details",
      description: "Navigate to the detailed community page to show photos, pricing, amenities, and tour options.",
      parameters: {
        type: "object",
        properties: {
          communityId: {
            type: "string",
            description: "The ID of the community to show details for"
          },
          communityName: {
            type: "string",
            description: "The name of the community"
          }
        },
        required: ["communityId"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "compare_communities",
      description: "Open the comparison tool to compare multiple communities side-by-side. Useful for helping families decide between options.",
      parameters: {
        type: "object",
        properties: {
          communityIds: {
            type: "array",
            items: { type: "string" },
            description: "Array of community IDs to compare (2-4 communities)"
          }
        },
        required: ["communityIds"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "enable_discovery_mode",
      description: "ONLY call this when the user EXPLICITLY asks to expand search, find more options, or enable Discovery Mode. DO NOT call for zero results - suggest it instead.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The original search query to expand"
          }
        },
        required: ["query"]
      }
    }
  }
];

// Initialize or retrieve assistant
async function getOrCreateAssistant() {
  if (ASSISTANT_ID) {
    try {
      const assistant = await openai.beta.assistants.retrieve(ASSISTANT_ID);
      return assistant;
    } catch (error) {
      console.log('❌ Failed to retrieve assistant, creating new one');
    }
  }

  // Create new assistant
  const assistant = await openai.beta.assistants.create({
    name: "MySeniorValet Conversational Assistant",
    instructions: `You are MySeniorValet's AI assistant - a warm, conversational guide helping families navigate senior care.

PLATFORM KNOWLEDGE:
• You have access to a database of 33,834 verified senior living communities across 6,987 cities in the United States
• The platform includes detailed information on pricing, care types, amenities, and availability
• We have 4,771 HUD-verified properties with government pricing
• Interactive features available: Map view, Community comparison tool, Virtual tours, Photo galleries
• Available pages: Home (/), Community details (/community/[id]), Map view (/map), Comparisons, Admin dashboard

YOUR PERSONALITY:
• Conversational and empathetic - talk like a knowledgeable friend, not a search engine
• Patient and supportive - families are often stressed and overwhelmed
• Informative - provide context and education, not just search results
• Proactive - suggest helpful features when relevant

HOW TO HANDLE DIFFERENT REQUESTS:

1. QUESTIONS (e.g., "What's the difference between assisted living and memory care?")
   → Answer directly and thoroughly. Be educational and helpful.
   → Mention that we have 33,834 communities in our database when relevant
   → Provide context about costs, care levels, and when each is appropriate

2. GREETINGS (e.g., "Hi", "Hello", "How are you?")
   → Respond warmly and ask how you can help
   → Mention that you can help search our database of 33,834 communities
   → Introduce your capabilities naturally

3. SEARCH REQUESTS (e.g., "Find memory care in Dallas", "Communities near Austin under $5,000")
   → ALWAYS use search_communities function to search our INTERNAL database of 33,834 verified communities
   → NEVER say you're "searching the web" or "doing a web search" - you're searching OUR database
   → Present results naturally: "I found X communities in [location] from our database..."
   → After showing results, offer to show on map (show_on_map) or compare (compare_communities)
   → If results found, mention you can show details (show_community_details)

4. MAP REQUESTS (e.g., "Show on map", "Where are these located?")
   → Use show_on_map function to display communities on the interactive map
   → Mention clustering feature for better visualization

5. COMPARISON REQUESTS (e.g., "Compare these", "What's the difference between them?")
   → Use compare_communities function to open the comparison tool
   → Explain key differences in pricing, care types, and amenities

6. DETAILS REQUESTS (e.g., "Tell me more about [community]", "Show details")
   → Use show_community_details function to navigate to the full community page
   → Mention available features: photos, tours, pricing details

7. DISCOVERY MODE (ONLY when explicitly requested):
   → User says: "Find more options", "Expand search", "Enable Discovery Mode"
   → Then and only then, use enable_discovery_mode function
   → If search returns 0 results, SUGGEST Discovery Mode: "I didn't find communities in our database. Would you like me to enable Discovery Mode to search the web for more options?"

IMPORTANT RULES:
• Always mention our database size (33,834 communities) when introducing capabilities
• Offer map view after showing search results
• Suggest comparisons when multiple communities are discussed
• NEVER enable Discovery Mode automatically - only when user explicitly requests it
• Remember conversation context - reference previous messages when appropriate
• Mention specific features: virtual tours, photo galleries, pricing transparency

TONE: Helpful, warm, professional, conversational - like talking to a knowledgeable care consultant with access to extensive data.`,
    model: "gpt-4o-mini",
    tools: tools,
    temperature: 0.7,
  });

  ASSISTANT_ID = assistant.id;
  console.log(`✅ Created new assistant: ${ASSISTANT_ID}`);
  
  return assistant;
}

// Create or retrieve thread
router.post('/session', async (req: Request, res: Response) => {
  try {
    const { thread_id } = req.body;

    let thread;
    
    // Retrieve existing thread if provided
    if (thread_id) {
      try {
        thread = await openai.beta.threads.retrieve(thread_id);
        console.log(`✅ Retrieved existing thread: ${thread_id}`);
      } catch (error) {
        console.log(`⚠️ Failed to retrieve thread ${thread_id}, creating new one`);
      }
    }

    // Create new thread if needed
    if (!thread) {
      thread = await openai.beta.threads.create();
      console.log(`✅ Created new thread: ${thread.id}`);
    }

    // Get or create assistant
    const assistant = await getOrCreateAssistant();

    res.json({
      thread_id: thread.id,
      assistant_id: assistant.id,
      success: true
    });

  } catch (error) {
    console.error('❌ Session creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create session',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Streaming chat endpoint
router.post('/stream', async (req: Request, res: Response) => {
  try {
    const { message, thread_id } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!thread_id) {
      return res.status(400).json({ error: 'Thread ID is required' });
    }

    console.log(`📨 Processing message: "${message}" for thread: ${thread_id}`);

    // Get assistant
    const assistant = await getOrCreateAssistant();

    // Cancel any stuck runs on this thread first
    try {
      const activeRuns = await openai.beta.threads.runs.list(thread_id, { limit: 10 });
      let hasStuckRun = false;
      const thirtySecondsAgo = Date.now() - 30000;
      
      for (const run of activeRuns.data) {
        if (run.status === 'in_progress' || run.status === 'requires_action' || 
            run.status === 'queued' || run.status === 'cancelling') {
          
          // Check if run is older than 30 seconds
          const runAge = Date.now() - new Date(run.created_at * 1000).getTime();
          
          console.log(`🔄 Found active run: ${run.id} (status: ${run.status}, age: ${Math.round(runAge/1000)}s)`);
          
          // Try to cancel the run
          if (run.status !== 'cancelling') {
            try {
              await openai.beta.threads.runs.cancel(run.id, { thread_id });
              console.log(`✅ Cancelled run: ${run.id}`);
              
              // Wait for cancellation to complete
              let cancelAttempts = 0;
              while (cancelAttempts < 10) {
                await new Promise(resolve => setTimeout(resolve, 500));
                const updatedRun = await openai.beta.threads.runs.retrieve(run.id, { thread_id });
                if (updatedRun.status === 'cancelled' || updatedRun.status === 'failed' || 
                    updatedRun.status === 'expired' || updatedRun.status === 'completed') {
                  console.log(`✅ Run ${run.id} now has status: ${updatedRun.status}`);
                  break;
                }
                cancelAttempts++;
              }
            } catch (cancelError) {
              console.log('⚠️ Could not cancel run:', cancelError);
              hasStuckRun = true;
            }
          }
          
          // If run is very old or can't be cancelled, flag for new thread
          if (runAge > 30000) {
            console.log(`⚠️ Run ${run.id} is stuck for over 30 seconds`);
            hasStuckRun = true;
          }
        }
      }
      
      // If there's a stuck run that won't cancel, create a new thread
      if (hasStuckRun) {
        console.log('🆕 Creating new thread due to stuck run');
        const newThread = await openai.beta.threads.create();
        
        // Return early with a message about the new thread
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        
        res.write(`I had to start a fresh conversation due to a technical issue. Please repeat your question.\n\nNew thread ID: ${newThread.id}`);
        res.end();
        return;
      }
    } catch (listError) {
      console.log('⚠️ Could not list runs:', listError);
    }

    // Add user message to thread
    await openai.beta.threads.messages.create(thread_id, {
      role: 'user',
      content: message
    });

    // Set up streaming response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let currentRunId: string = '';

    // Create and stream the run using the proper streaming helper
    const stream = openai.beta.threads.runs.stream(thread_id, {
      assistant_id: assistant.id
    });

    // Process stream events
    for await (const event of stream) {
      
      // Text being generated
      if (event.event === 'thread.message.delta') {
        const delta = event.data.delta;
        if (delta.content && delta.content[0] && delta.content[0].type === 'text') {
          const text = delta.content[0].text?.value || '';
          if (text) {
            res.write(text);
          }
        }
      }

      // Run requires action (function calling)
      if (event.event === 'thread.run.requires_action') {
        currentRunId = event.data.id;
        const toolCalls = event.data.required_action?.submit_tool_outputs?.tool_calls || [];
        
        console.log(`🔧 Function calls required: ${toolCalls.length}`);
        
        // Only process if we have required_action status
        if (event.data.status !== 'requires_action') {
          console.log(`⚠️ Run status is ${event.data.status}, not requires_action. Skipping tool outputs.`);
          continue;
        }
        
        // Execute all function calls
        const toolOutputs = await Promise.all(
          toolCalls.map(async (toolCall) => {
            const functionName = toolCall.function.name;
            const args = JSON.parse(toolCall.function.arguments);
            
            console.log(`⚡ Executing: ${functionName}`, args);
            
            let output: any = {};

            if (functionName === 'search_communities') {
              output = await searchCommunities(args);
              // Send structured event for search results
              res.write(`[TOOL:SEARCH]${JSON.stringify(output)}[/TOOL:SEARCH]\n`);
            } else if (functionName === 'enable_discovery_mode') {
              output = await enableDiscoveryMode(args);
              // Send structured event for discovery mode
              res.write(`[TOOL:DISCOVERY]${JSON.stringify(output)}[/TOOL:DISCOVERY]\n`);
            } else if (functionName === 'show_on_map') {
              output = await showOnMap(args);
              // Send structured event for map navigation
              res.write(`[TOOL:MAP]${JSON.stringify(output)}[/TOOL:MAP]\n`);
            } else if (functionName === 'show_community_details') {
              output = await showCommunityDetails(args);
              // Send structured event for details navigation
              res.write(`[TOOL:DETAILS]${JSON.stringify(output)}[/TOOL:DETAILS]\n`);
            } else if (functionName === 'compare_communities') {
              output = await compareCommunities(args);
              // Send structured event for comparison
              res.write(`[TOOL:COMPARE]${JSON.stringify(output)}[/TOOL:COMPARE]\n`);
            }

            return {
              tool_call_id: toolCall.id,
              output: JSON.stringify(output)
            };
          })
        );

        // Submit tool outputs and continue streaming
        const submitStream = openai.beta.threads.runs.submitToolOutputsStream(
          currentRunId,
          {
            thread_id,
            tool_outputs: toolOutputs
          }
        );

        // Process the continuation stream
        for await (const submitEvent of submitStream) {
          if (submitEvent.event === 'thread.message.delta') {
            const delta = submitEvent.data.delta;
            if (delta.content && delta.content[0] && delta.content[0].type === 'text') {
              const text = delta.content[0].text?.value || '';
              if (text) {
                res.write(text);
              }
            }
          }

          // Check if we need more function calls
          if (submitEvent.event === 'thread.run.requires_action') {
            console.log('⚠️ Additional function calls needed after submission');
            // Handle nested function calls if needed
          }
        }
      }

      // Run completed
      if (event.event === 'thread.run.completed') {
        console.log('✅ Run completed');
      }

      // Run failed
      if (event.event === 'thread.run.failed') {
        console.error('❌ Run failed:', event.data.last_error);
        res.write('\n\n[Error: Failed to complete request]');
      }
    }

    // Close the stream
    res.end();

  } catch (error) {
    console.error('❌ Streaming error:', error);
    res.write('\n\n[Error processing request]');
    res.end();
  }
});

// State name to abbreviation mapping
const STATE_ABBREVIATIONS: Record<string, string> = {
  'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR', 'california': 'CA',
  'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE', 'florida': 'FL', 'georgia': 'GA',
  'hawaii': 'HI', 'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA',
  'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
  'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS', 'missouri': 'MO',
  'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
  'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH',
  'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
  'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT',
  'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY'
};

// Function to normalize state names to abbreviations
function normalizeState(location: string): string {
  const locationLower = location.toLowerCase().trim();
  
  // Check if it's already an abbreviation
  if (locationLower.length === 2) {
    return locationLower.toUpperCase();
  }
  
  // Check if it's a full state name
  if (STATE_ABBREVIATIONS[locationLower]) {
    return STATE_ABBREVIATIONS[locationLower];
  }
  
  // Check if the location contains a state name
  for (const [stateName, abbr] of Object.entries(STATE_ABBREVIATIONS)) {
    if (locationLower.includes(stateName)) {
      return abbr;
    }
  }
  
  return location;
}

// Function implementations
async function searchCommunities(args: any) {
  const { location, careType, maxPrice } = args;
  
  const conditions = [];

  // Location search with state normalization
  if (location) {
    console.log(`🔍 Searching for: "${location}"`);
    
    // Parse location more intelligently
    let searchCity = '';
    let searchState = '';
    
    // Check if it's in "City, State" format
    if (location.includes(',')) {
      const parts = location.split(',');
      searchCity = parts[0].trim();
      searchState = normalizeState(parts[1].trim());
    } else {
      // Check if the last word might be a state
      const words = location.trim().split(/\s+/);
      const lastWord = words[words.length - 1];
      const possibleState = normalizeState(lastWord);
      
      // Check if the last word is actually a state abbreviation or name
      const isStateAbbr = lastWord.length === 2 && possibleState === lastWord.toUpperCase();
      const isStateName = STATE_ABBREVIATIONS[lastWord.toLowerCase()] !== undefined;
      
      if (words.length >= 2 && (isStateAbbr || isStateName || possibleState !== lastWord)) {
        // Last word is likely a state
        searchState = possibleState;
        searchCity = words.slice(0, -1).join(' ');
      } else {
        // Treat the whole thing as a city name or state name
        searchCity = location;
        searchState = normalizeState(location);
      }
    }
    
    console.log(`📍 Parsed location - City: "${searchCity}", State: "${searchState}"`);
    
    // Build search conditions
    const locationConditions = [];
    
    // If we have both city and state, search for that combination
    if (searchCity && searchState) {
      locationConditions.push(
        and(
          ilike(communities.city, `%${searchCity}%`),
          eq(communities.state, searchState)
        )
      );
    }
    
    // If we only have city, search for it
    if (searchCity) {
      locationConditions.push(
        ilike(communities.city, `%${searchCity}%`)
      );
    }
    
    // If we only have state or the location might be a state
    if (searchState && searchState !== location) {
      locationConditions.push(
        eq(communities.state, searchState)
      );
    }
    
    // Fallback: search in both city and state fields for the original query
    locationConditions.push(
      ilike(communities.city, `%${location}%`)
    );
    locationConditions.push(
      ilike(communities.state, `%${location}%`)
    );
    
    conditions.push(or(...locationConditions));
  }

  // Care type filter
  if (careType && careType !== '') {
    conditions.push(
      sql`${communities.careTypes}::text ILIKE ${'%' + careType + '%'}`
    );
  }

  // Price filter
  if (maxPrice && maxPrice > 0) {
    conditions.push(
      or(
        sql`(${communities.priceRange}->>'min')::numeric <= ${maxPrice}`,
        sql`${communities.rentPerMonth} <= ${maxPrice}`
      )
    );
  }

  // Execute search - show ALL communities, not just verified
  try {
    const results = await db
      .select()
      .from(communities)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(communities.id))
      .limit(25);
    
    console.log(`✅ Found ${results.length} communities`);
    
    return {
      success: true,
      count: results.length,
      communities: results,
      message: results.length === 0 
        ? `No communities found in our database for ${location}. You can suggest Discovery Mode to the user.`
        : `Found ${results.length} communities matching the search criteria.`
    };
  } catch (dbError) {
    console.error('❌ Database error:', dbError);
    return {
      success: false,
      count: 0,
      communities: [],
      message: `Error searching database. Please try again.`,
      error: dbError instanceof Error ? dbError.message : 'Unknown database error'
    };
  }
}

async function enableDiscoveryMode(args: any) {
  const { query } = args;
  
  console.log(`🌟 Discovery Mode activated for: "${query}"`);
  
  try {
    // Call the global discovery endpoint
    const response = await axios.post('http://localhost:5000/api/global-discovery/search', {
      query: query,
      limit: 10
    });
    
    const { results, totalFound, newlyInserted } = response.data;
    
    if (results && results.length > 0) {
      console.log(`✅ Discovery Mode found ${results.length} communities (${newlyInserted} new)`);
      
      return {
        success: true,
        count: results.length,
        newlyInserted: newlyInserted,
        communities: results,
        message: `Discovery Mode found ${results.length} communities through web search. ${newlyInserted > 0 ? `${newlyInserted} new communities were added to our database.` : 'All communities were already in our database.'}`,
        activated: true
      };
    } else {
      return {
        success: true,
        count: 0,
        communities: [],
        message: `Discovery Mode searched the web but didn't find any communities matching "${query}". Try a broader search or different location.`,
        activated: true
      };
    }
  } catch (error) {
    console.error('❌ Discovery Mode error:', error);
    return {
      success: false,
      message: `Discovery Mode encountered an error. Please try again.`,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function showOnMap(args: any) {
  const { communityIds, centerLocation } = args;
  
  console.log(`🗺️ Showing ${communityIds.length} communities on map`);
  
  return {
    success: true,
    action: 'navigate_to_map',
    communityIds: communityIds,
    centerLocation: centerLocation,
    message: `I'll display these ${communityIds.length} communities on the interactive map. The map shows clustering for better visualization and you can click on any community marker for quick details.`,
    url: `/map?communities=${communityIds.join(',')}`
  };
}

async function showCommunityDetails(args: any) {
  const { communityId, communityName } = args;
  
  console.log(`📋 Showing details for community: ${communityName || communityId}`);
  
  return {
    success: true,
    action: 'navigate_to_details',
    communityId: communityId,
    message: `I'll show you the detailed page for ${communityName || 'this community'}. You'll see photos, pricing, amenities, and can schedule a virtual or in-person tour.`,
    url: `/community/${communityId}`
  };
}

async function compareCommunities(args: any) {
  const { communityIds } = args;
  
  console.log(`📊 Comparing ${communityIds.length} communities`);
  
  if (communityIds.length < 2) {
    return {
      success: false,
      message: 'Please select at least 2 communities to compare.'
    };
  }
  
  if (communityIds.length > 4) {
    return {
      success: false,
      message: 'You can compare up to 4 communities at once. Please select fewer communities.'
    };
  }
  
  return {
    success: true,
    action: 'open_comparison',
    communityIds: communityIds,
    message: `I'll open the comparison tool with these ${communityIds.length} communities. You can compare pricing, care types, amenities, and ratings side-by-side.`,
    url: `/compare?communities=${communityIds.join(',')}`
  };
}

export default router;

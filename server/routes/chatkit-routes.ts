import { Router, Request, Response } from 'express';
import OpenAI from 'openai';
import { db } from '../db';
import { communities } from '@shared/schema';
import { eq, and, or, ilike, sql } from 'drizzle-orm';

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
      description: "Search for senior living communities in our database. Use this when users ask for specific locations or care types. DO NOT use for general questions about senior care.",
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

YOUR PERSONALITY:
• Conversational and empathetic - talk like a knowledgeable friend, not a search engine
• Patient and supportive - families are often stressed and overwhelmed
• Informative - provide context and education, not just search results
• Proactive - suggest helpful features when relevant

HOW TO HANDLE DIFFERENT REQUESTS:

1. QUESTIONS (e.g., "What's the difference between assisted living and memory care?")
   → Answer directly and thoroughly. Be educational and helpful.
   → DO NOT search for communities
   → Provide context about costs, care levels, and when each is appropriate

2. GREETINGS (e.g., "Hi", "Hello", "How are you?")
   → Respond warmly and ask how you can help
   → DO NOT trigger any functions
   → Introduce your capabilities naturally

3. SEARCH REQUESTS (e.g., "Find memory care in Dallas", "Communities near Austin under $5,000")
   → Use search_communities function
   → After showing results, offer to show on map or compare

4. DISCOVERY MODE (ONLY when explicitly requested):
   → User says: "Find more options", "Expand search", "Enable Discovery Mode"
   → Then and only then, use enable_discovery_mode function
   → If search returns 0 results, SUGGEST Discovery Mode, don't enable it automatically

IMPORTANT RULES:
• NEVER call functions for greetings or general questions
• NEVER enable Discovery Mode automatically - only when user explicitly requests it
• When search returns 0 results, say: "I didn't find communities in our database. Would you like me to enable Discovery Mode to search the web?"
• Remember conversation context - reference previous messages when appropriate
• Mention platform features naturally (maps, comparisons, tours) when relevant

TONE: Helpful, warm, professional, conversational - like talking to a knowledgeable care consultant.`,
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
        
        // Execute all function calls
        const toolOutputs = await Promise.all(
          toolCalls.map(async (toolCall) => {
            const functionName = toolCall.function.name;
            const args = JSON.parse(toolCall.function.arguments);
            
            console.log(`⚡ Executing: ${functionName}`, args);
            
            let output: any = {};

            if (functionName === 'search_communities') {
              output = await searchCommunities(args);
            } else if (functionName === 'enable_discovery_mode') {
              output = await enableDiscoveryMode(args);
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

// Function implementations
async function searchCommunities(args: any) {
  const { location, careType, maxPrice } = args;
  
  const conditions = [];

  // Location search
  if (location) {
    conditions.push(
      or(
        ilike(communities.city, `%${location}%`),
        ilike(communities.state, `%${location}%`)
      )
    );
  }

  // Care type filter
  if (careType) {
    conditions.push(
      sql`${communities.careTypes}::text ILIKE ${'%' + careType + '%'}`
    );
  }

  // Price filter
  if (maxPrice) {
    conditions.push(
      or(
        sql`(${communities.priceRange}->>'min')::numeric <= ${maxPrice}`,
        sql`${communities.rentPerMonth} <= ${maxPrice}`
      )
    );
  }

  // Add verified status
  conditions.push(eq(communities.isVerified, true));

  // Execute search
  const results = await db
    .select({
      id: communities.id,
      name: communities.name,
      city: communities.city,
      state: communities.state,
      address: communities.address,
      rating: communities.rating,
      priceRange: communities.priceRange,
      careTypes: communities.careTypes,
      photos: communities.photos,
      latitude: communities.latitude,
      longitude: communities.longitude
    })
    .from(communities)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .limit(10);

  console.log(`✅ Found ${results.length} communities`);

  return {
    success: true,
    count: results.length,
    communities: results,
    message: results.length === 0 
      ? `No communities found in our database for ${location}. You can suggest Discovery Mode to the user.`
      : `Found ${results.length} communities matching the search criteria.`
  };
}

async function enableDiscoveryMode(args: any) {
  const { query } = args;
  
  console.log(`🌟 Discovery Mode activated for: "${query}"`);
  
  // In production, this would call the global discovery endpoint
  // For now, return a placeholder
  return {
    success: true,
    message: `Discovery Mode would search the web for: "${query}". This requires explicit user confirmation.`,
    activated: true
  };
}

export default router;

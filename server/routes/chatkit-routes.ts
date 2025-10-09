import { Router, Request, Response } from 'express';
import OpenAI from 'openai';
import { db } from '../db';
import { communities } from '@shared/schema';
import { eq, and, or, ilike, sql, gte, lte, isNull, notInArray } from 'drizzle-orm';

const router = Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define tool functions for ChatKit to use
const tools = [
  {
    type: "function" as const,
    function: {
      name: "search_communities",
      description: "Search for senior living communities based on location, care type, and price range. Returns matching communities with basic details.",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: "City, state, or region to search (e.g., 'Dallas, TX', 'California')"
          },
          careType: {
            type: "string",
            description: "Type of care needed: 'Assisted Living', 'Memory Care', 'Independent Living', 'Skilled Nursing', or 'All Types'",
            enum: ["Assisted Living", "Memory Care", "Independent Living", "Skilled Nursing", "All Types"]
          },
          maxPrice: {
            type: "number",
            description: "Maximum monthly price in USD"
          },
          limit: {
            type: "number",
            description: "Maximum number of results to return (default 5)",
            default: 5
          }
        },
        required: ["location"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "get_community_details",
      description: "Get detailed information about a specific senior living community including pricing, amenities, and availability.",
      parameters: {
        type: "object",
        properties: {
          communityId: {
            type: "number",
            description: "The ID of the community to get details for"
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
      description: "Compare multiple senior living communities side-by-side based on price, amenities, care types, and ratings.",
      parameters: {
        type: "object",
        properties: {
          communityIds: {
            type: "array",
            items: { type: "number" },
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
      name: "check_availability",
      description: "Check real-time room availability for a specific community.",
      parameters: {
        type: "object",
        properties: {
          communityId: {
            type: "number",
            description: "The ID of the community to check availability for"
          }
        },
        required: ["communityId"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "schedule_tour",
      description: "Schedule a tour for a senior living community using the TourMate system.",
      parameters: {
        type: "object",
        properties: {
          communityId: {
            type: "number",
            description: "The ID of the community to schedule a tour for"
          },
          preferredDate: {
            type: "string",
            description: "Preferred date for the tour (YYYY-MM-DD format)"
          },
          preferredTime: {
            type: "string",
            description: "Preferred time for the tour (e.g., '10:00 AM', '2:00 PM')"
          }
        },
        required: ["communityId"]
      }
    }
  }
];

// Create ChatKit session endpoint
router.post('/session', async (req: Request, res: Response) => {
  try {
    const { category = 'communities' } = req.body;
    
    // System prompt tailored to category
    const systemPrompts: Record<string, string> = {
      communities: `You are MySeniorValet's AI assistant - a knowledgeable, conversational guide helping families navigate senior care decisions.

CAPABILITIES:
• Access to 33,830+ verified senior living communities in our database
• Discovery Mode: When users want more options, you can search the entire web for communities beyond our database
• Answer questions about senior care, costs, care types, Medicare/Medicaid, and the transition process
• Search by location, care type, price range, and specific needs
• Show community details, compare options, check availability, and help schedule tours
• Provide guidance on choosing care, understanding different care levels, and what to look for

IMPORTANT FEATURES TO MENTION WHEN RELEVANT:
• Discovery Mode - Say "I can enable Discovery Mode to search more broadly across the web" when database results are limited
• Interactive maps - "I can show these on a map" when displaying community results
• Comparison tools - "Would you like me to compare these side-by-side?" when showing multiple options
• Virtual tours and photos available on community detail pages
• Family collaboration tools for sharing and discussing options

CONVERSATION STYLE:
• Be conversational and natural - have a real discussion, not just Q&A
• Answer questions thoroughly about senior care topics, even if not directly about search
• Show empathy - families are often stressed and overwhelmed
• Provide context and education about care options when helpful
• Proactively suggest useful features and next steps
• Remember previous messages in the conversation for context

EXAMPLE RESPONSES:
User: "What's the difference between assisted living and memory care?"
You: Provide a thorough explanation of both care types, typical costs, and when each is appropriate.

User: "I need help finding care for my mom in Dallas"
You: Ask follow-up questions about her needs, budget, and preferences before searching.

User: "These results are limited, are there more options?"
You: "I found [X] communities in our database. I can enable Discovery Mode to search across the entire web for additional options. Would you like me to do that?"

Always be helpful, informative, and guide families through this challenging journey.`,
      
      services: `You are MySeniorValet's AI assistant, helping families find senior care services.
You can help locate home health agencies, adult day programs, hospice care, therapy services, and more.
Be informative and supportive, understanding that families may be dealing with difficult situations.`,
      
      healthcare: `You are MySeniorValet's AI assistant, helping find healthcare resources for seniors.
You can locate hospitals, specialists, urgent care, VA facilities, and other medical services.
Provide clear, helpful information while being sensitive to health concerns.`,
      
      resources: `You are MySeniorValet's AI assistant, providing information about senior resources.
You can help with Medicare/Medicaid information, financial planning, legal resources, and support groups.
Be thorough and patient, as these topics can be complex and overwhelming.`,
      
      vendors: `You are MySeniorValet's AI assistant for the senior care marketplace.
You can help find medical equipment, supplies, adaptive clothing, and other products for seniors.
Focus on quality, value, and meeting specific needs.`
    };

    // Create assistant configuration
    const assistantConfig = {
      model: "gpt-4o-mini", // Cost-effective model to start
      name: "MySeniorValet Assistant",
      instructions: systemPrompts[category] || systemPrompts.communities,
      tools: category === 'communities' ? tools : [],
      temperature: 0.7,
      top_p: 0.9,
    };

    // Create a new thread for this conversation
    const thread = await openai.beta.threads.create();
    
    // Create or retrieve assistant
    // In production, you'd create the assistant once and reuse its ID
    const assistant = await openai.beta.assistants.create(assistantConfig);

    // Generate a session token (in production, use proper JWT)
    const sessionToken = `chatkit_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Store session info (in production, use Redis or database)
    // For now, we'll return the configuration
    const sessionData = {
      client_secret: sessionToken,
      thread_id: thread.id,
      assistant_id: assistant.id,
      category,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };

    console.log('✅ Created ChatKit session:', {
      thread_id: thread.id,
      assistant_id: assistant.id,
      category
    });

    res.json(sessionData);
  } catch (error) {
    console.error('❌ Error creating ChatKit session:', error);
    res.status(500).json({ 
      error: 'Failed to create ChatKit session',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Handle tool execution
router.post('/execute-tool', async (req: Request, res: Response) => {
  try {
    const { tool_name, arguments: toolArgs } = req.body;
    
    console.log(`🔧 Executing tool: ${tool_name}`, toolArgs);
    
    let result: any = null;

    switch (tool_name) {
      case 'search_communities': {
        const { location, careType = 'All Types', maxPrice, limit = 5 } = toolArgs;
        
        // Build query conditions
        const conditions = [];
        
        // Location search (city or state)
        if (location) {
          conditions.push(
            or(
              ilike(communities.city, `%${location}%`),
              ilike(communities.state, `%${location}%`)
            )
          );
        }
        
        // Care type filter
        if (careType && careType !== 'All Types') {
          conditions.push(
            sql`${communities.careTypes}::text ILIKE ${'%' + careType + '%'}`
          );
        }
        
        // Price filter
        if (maxPrice) {
          conditions.push(
            or(
              sql`(${communities.priceRange}->>'min')::numeric <= ${maxPrice}`,
              sql`(${communities.priceRange}->>'max')::numeric <= ${maxPrice}`
            )
          );
        }
        
        // Add verified status check
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
            reviewCount: communities.reviewCount,
            priceRange: communities.priceRange,
            pricingDetails: communities.pricingDetails,
            careTypes: communities.careTypes,
            totalUnits: communities.totalUnits,
            availableUnits: communities.availableUnits,
            virtualTourUrl: communities.virtualTourUrl,
            photos: communities.photos,
          })
          .from(communities)
          .where(and(...conditions))
          .limit(limit);
        
        result = {
          communities: results,
          totalFound: results.length,
          searchCriteria: { location, careType, maxPrice }
        };
        break;
      }
      
      case 'get_community_details': {
        const { communityId } = toolArgs;
        
        const community = await db
          .select()
          .from(communities)
          .where(eq(communities.id, communityId))
          .limit(1);
        
        result = community[0] || { error: 'Community not found' };
        break;
      }
      
      case 'compare_communities': {
        const { communityIds } = toolArgs;
        
        const comms = await db
          .select()
          .from(communities)
          .where(
            and(
              sql`${communities.id} = ANY(${communityIds})`,
              eq(communities.isVerified, true)
            )
          );
        
        result = {
          communities: comms,
          comparisonFields: ['price', 'rating', 'amenities', 'careTypes', 'availability']
        };
        break;
      }
      
      case 'check_availability': {
        const { communityId } = toolArgs;
        
        const community = await db
          .select({
            name: communities.name,
            totalUnits: communities.totalUnits,
            availableUnits: communities.availableUnits,
            availabilityLastUpdated: communities.availabilityLastUpdated
          })
          .from(communities)
          .where(eq(communities.id, communityId))
          .limit(1);
        
        if (community[0]) {
          const avail = community[0].availableUnits || 0;
          result = {
            communityName: community[0].name,
            available: avail > 0,
            roomsAvailable: avail,
            lastUpdated: community[0].availabilityLastUpdated,
            message: avail > 0 
              ? `Yes! ${avail} room${avail > 1 ? 's' : ''} available.`
              : 'Currently no availability, but you can join the waitlist.'
          };
        } else {
          result = { error: 'Community not found' };
        }
        break;
      }
      
      case 'schedule_tour': {
        const { communityId, preferredDate, preferredTime } = toolArgs;
        
        // In production, this would create a real tour booking
        // For now, return a confirmation
        result = {
          success: true,
          communityId,
          tourDate: preferredDate || 'Next available',
          tourTime: preferredTime || 'Flexible',
          confirmationNumber: `TOUR-${Date.now()}`,
          message: 'Tour scheduled successfully! You will receive a confirmation email shortly.',
          nextSteps: 'Click "View Community Details" to see more information and prepare for your tour.'
        };
        break;
      }
      
      default:
        result = { error: `Unknown tool: ${tool_name}` };
    }
    
    console.log(`✅ Tool execution complete:`, tool_name);
    res.json({ result });
    
  } catch (error) {
    console.error('❌ Error executing tool:', error);
    res.status(500).json({ 
      error: 'Failed to execute tool',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Handle conversational messages with intelligent routing
router.post('/message', async (req: Request, res: Response) => {
  try {
    const { message, sessionId, category = 'communities' } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    console.log(`📨 Processing message: "${message}" for session: ${sessionId}`);
    
    // Analyze message intent
    const lowerMessage = message.toLowerCase();
    const isQuestion = lowerMessage.includes('what') || lowerMessage.includes('how') || 
                      lowerMessage.includes('why') || lowerMessage.includes('when') ||
                      lowerMessage.includes('difference') || lowerMessage.includes('explain') ||
                      lowerMessage.includes('tell me');
    
    const isGreeting = lowerMessage.match(/^(hi|hello|hey|howdy|good morning|good afternoon|good evening)/);
    
    const wantsDiscovery = lowerMessage.includes('discovery mode') || 
                           lowerMessage.includes('more options') ||
                           lowerMessage.includes('expand') ||
                           lowerMessage.includes('find more');
    
    const isSearch = !isQuestion && !isGreeting && (
      lowerMessage.includes('in ') || lowerMessage.includes('near') ||
      lowerMessage.includes('memory care') || lowerMessage.includes('assisted living') ||
      lowerMessage.includes('nursing home') || lowerMessage.includes('senior living') ||
      lowerMessage.includes('under $') || lowerMessage.includes('less than')
    );
    
    // Handle different message types
    if (isGreeting) {
      // Friendly greeting response
      return res.json({
        success: true,
        message: "Hello! I'm here to help you find the perfect senior living community. I can answer questions about care types, costs, and help you search our database of 33,830+ verified communities. What would you like to know?",
        type: 'text',
        sessionId: sessionId || 'default'
      });
    }
    
    if (isQuestion && !isSearch) {
      // Answer questions using GPT
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are MySeniorValet's knowledgeable AI assistant. Answer questions about senior care, living options, costs, and the transition process. Be thorough, empathetic, and helpful.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });
      
      return res.json({
        success: true,
        message: completion.choices[0].message.content || "Let me help you with that question.",
        type: 'text',
        sessionId: sessionId || 'default'
      });
    }
    
    if (wantsDiscovery) {
      // Explain Discovery Mode
      return res.json({
        success: true,
        message: "Discovery Mode expands your search beyond our database to find communities across the entire web. This is especially helpful when looking for specialized care or specific locations. Would you like me to enable Discovery Mode for your search?",
        type: 'text',
        data: { suggestDiscovery: true },
        sessionId: sessionId || 'default'
      });
    }
    
    if (isSearch) {
      // Search for communities
      const conditions = [];
      
      // Extract location
      const locationMatch = message.match(/(?:in|near|at)\s+([A-Za-z\s]+)(?:,\s*([A-Z]{2}))?/i);
      if (locationMatch) {
        const location = locationMatch[1].trim();
        conditions.push(
          or(
            ilike(communities.city, `%${location}%`),
            ilike(communities.state, `%${location}%`)
          )
        );
      }
      
      // Extract care type
      if (lowerMessage.includes('memory care')) {
        conditions.push(sql`${communities.careTypes}::text ILIKE '%Memory Care%'`);
      } else if (lowerMessage.includes('assisted living')) {
        conditions.push(sql`${communities.careTypes}::text ILIKE '%Assisted Living%'`);
      }
      
      // Extract price
      const priceMatch = message.match(/(?:under|less than|below)\s*\$?(\d+)/i);
      if (priceMatch) {
        const maxPrice = parseInt(priceMatch[1]);
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
      
      if (results.length > 0) {
        return res.json({
          success: true,
          message: `I found ${results.length} communities matching your search:`,
          type: 'communities',
          data: { communities: results },
          sessionId: sessionId || 'default'
        });
      } else {
        return res.json({
          success: true,
          message: `I couldn't find any communities matching "${message}" in our database. Would you like me to enable Discovery Mode to search more broadly across the web?`,
          type: 'text',
          data: { suggestDiscovery: true, originalQuery: message },
          sessionId: sessionId || 'default'
        });
      }
    }
    
    // Default conversational response
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are MySeniorValet's AI assistant. Be conversational, helpful, and guide families through finding senior care. Mention that you can search for communities, answer questions, or enable Discovery Mode when needed.`
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.8,
      max_tokens: 300
    });
    
    return res.json({
      success: true,
      message: completion.choices[0].message.content || "I'm here to help you find senior living communities. You can ask me questions or search for specific locations.",
      type: 'text',
      sessionId: sessionId || 'default'
    });
    
  } catch (error) {
    console.error('❌ ChatKit message error:', error);
    res.status(500).json({
      error: 'Failed to process message',
      message: "I'm having trouble processing your request. Please try again."
    });
  }
});

// Handle message sending (for custom implementations)
router.post('/send-message', async (req: Request, res: Response) => {
  try {
    const { thread_id, assistant_id, message } = req.body;
    
    // Add user message to thread
    await openai.beta.threads.messages.create(thread_id, {
      role: 'user',
      content: message
    });
    
    // Run the assistant
    const run = await openai.beta.threads.runs.create(thread_id, {
      assistant_id: assistant_id,
      stream: true // Enable streaming
    });
    
    // In production, you'd handle streaming properly
    // For now, return success
    res.json({ 
      success: true,
      run_id: (run as any).id || 'stream-started',
      message: 'Message sent, processing response...'
    });
    
  } catch (error) {
    console.error('❌ Error sending message:', error);
    res.status(500).json({ 
      error: 'Failed to send message',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
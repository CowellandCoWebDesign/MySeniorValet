import express from 'express';
import OpenAI from 'openai';
import { activeSessions } from './chatkit-create-session';
import { db } from '../db';
import { communities } from '../../shared/schema';
import { sql } from 'drizzle-orm';

const router = express.Router();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Helper function to search communities in database
async function searchCommunities(args: any) {
  const { location, careType, maxPrice } = args;
  
  console.log(`🔍 Searching for: "${location}"`);
  
  try {
    // Parse location to extract city and state
    const locationParts = location.split(',').map((p: string) => p.trim());
    const city = locationParts[0];
    const state = locationParts[1] || '';
    
    console.log(`📍 Parsed location - City: "${city}", State: "${state}"`);
    
    // Build query
    let query = db.select().from(communities);
    const conditions = [];
    
    // Location search - try different strategies
    if (city && state) {
      // Strategy 1: Exact city and state match
      conditions.push(sql`LOWER(${communities.city}) = LOWER(${city}) AND LOWER(${communities.state}) = LOWER(${state})`);
    } else if (city) {
      // Strategy 2: City only
      conditions.push(sql`LOWER(${communities.city}) = LOWER(${city})`);
    }
    
    if (conditions.length > 0) {
      query = query.where(conditions[0]) as any;
    }
    
    // Add care type filter if specified
    if (careType) {
      const careTypeMap: Record<string, string> = {
        'assisted living': 'Assisted Living',
        'memory care': 'Memory Care', 
        'independent living': 'Independent Living',
        'nursing home': 'Nursing Home',
        'skilled nursing': 'Skilled Nursing',
        'ccrc': 'CCRC',
        'senior apartments': 'Senior Apartments'
      };
      
      const mappedCareType = careTypeMap[careType.toLowerCase()] || careType;
      query = query.where(sql`${communities.careTypes} ILIKE ${`%${mappedCareType}%`}`) as any;
    }
    
    // Execute query with limit
    const results = await query.limit(20);
    
    console.log(`✅ Found ${results.length} communities`);
    
    if (results.length === 0 && city) {
      // Try broader search
      console.log(`🔄 Strategy 2: Broader search for city: ${city}`);
      const broaderResults = await db.select()
        .from(communities)
        .where(sql`LOWER(${communities.city}) LIKE LOWER(${`%${city}%`})`)
        .limit(20);
      
      if (broaderResults.length > 0) {
        console.log(`✅ Found ${broaderResults.length} communities with broader city search`);
        return {
          communities: broaderResults.map(c => ({
            id: c.id,
            name: c.name,
            city: c.city,
            state: c.state,
            address: c.address,
            phone: c.phone,
            website: c.website,
            careTypes: c.careTypes,
            pricing: c.lotRent || c.hoaFee || null
          }))
        };
      }
    }
    
    return {
      communities: results.map(c => ({
        id: c.id,
        name: c.name,
        city: c.city,
        state: c.state,
        address: c.address,
        phone: c.phone,
        website: c.website,
        careTypes: c.careTypes,
        pricing: c.lotRent || c.hoaFee || null
      }))
    };
  } catch (error) {
    console.error('Error searching communities:', error);
    return { 
      communities: [],
      error: 'Failed to search communities'
    };
  }
}

// Helper function to enable discovery mode (stub for now)
async function enableDiscoveryMode(args: any) {
  const { query } = args;
  console.log(`🌟 Discovery Mode activated for: "${query}"`);
  
  // For now, return a simple response
  // In production, this would trigger web search via Perplexity
  return {
    message: `Discovery Mode would search for "${query}" using AI`,
    communities: [],
    newlyInserted: 0
  };
}

// Middleware to validate ChatKit session
async function validateSession(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Invalid authorization header' });
  }
  
  const token = authHeader.replace('Bearer ', '');
  
  // For real ChatKit tokens (ek_*), we trust them
  if (token.startsWith('ek_')) {
    // Decode the token to get session info
    const sessionFromMap = activeSessions.get(token);
    if (!sessionFromMap) {
      return res.status(401).json({ error: 'Session not found' });
    }
    (req as any).session = sessionFromMap;
    return next();
  }
  
  // For demo tokens, reject
  const session = activeSessions.get(token);
  if (!session) {
    return res.status(401).json({ error: 'Invalid session' });
  }
  
  if (session.expiresAt < new Date()) {
    activeSessions.delete(token);
    return res.status(401).json({ error: 'Session expired' });
  }
  
  // Attach session to request
  (req as any).session = session;
  next();
}

// ChatKit-compatible streaming endpoint
router.post('/api/chatkit/stream', validateSession, async (req, res) => {
  try {
    const session = (req as any).session;
    const { message, thread_id: threadId } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Use threadId from request or session
    const thread_id = threadId || session.threadId;
    
    // Set up SSE headers for streaming
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });
    
    // Add message to thread
    await openai.beta.threads.messages.create(thread_id, {
      role: 'user',
      content: message,
    });
    
    // Create and run the assistant
    const run = await openai.beta.threads.runs.create(thread_id, {
      assistant_id: session.assistantId,
    });
    
    console.log(`📨 Processing message: "${message}" for thread: ${thread_id}`);
    
    // Send initial status
    res.write(`event: status\n`);
    res.write(`data: ${JSON.stringify({ 
      type: 'status',
      status: 'processing',
      message: 'Processing your request...'
    })}\n\n`);
    if (res.flush) res.flush();
    
    // Poll for run completion
    let runStatus = run;
    
    while (runStatus.status === 'queued' || runStatus.status === 'in_progress' || runStatus.status === 'requires_action') {
      // Handle tool calls  
      if (runStatus.status === 'requires_action') {
        const toolCalls = runStatus.required_action?.submit_tool_outputs?.tool_calls || [];
        
        if (toolCalls.length > 0) {
          console.log(`🔧 Function calls required: ${toolCalls.length}`);
          
          // Send status for tool execution
          res.write(`event: tool\n`);
          res.write(`data: ${JSON.stringify({ 
            type: 'tool_start',
            message: `🔧 Executing ${toolCalls.length} function(s)...`
          })}\n\n`);
          if (res.flush) res.flush();
          
          // Execute tools
          const toolOutputs = await Promise.all(
            toolCalls.map(async (toolCall: any) => {
              const functionName = toolCall.function.name;
              const args = JSON.parse(toolCall.function.arguments);
              
              console.log(`⚡ Executing: ${functionName}`, args);
              
              let output: any = {};
              
              // Handle different functions
              if (functionName === 'search_communities') {
                res.write(`event: tool\n`);
                res.write(`data: ${JSON.stringify({ 
                  type: 'tool_start',
                  tool: 'search_communities',
                  message: `🔍 Searching for communities in ${args.location || 'database'}...`
                })}\n\n`);
                if (res.flush) res.flush();
                
                output = await searchCommunities(args);
                
                res.write(`event: tool\n`);
                res.write(`data: ${JSON.stringify({ 
                  type: 'tool_result',
                  tool: 'search_communities',
                  result: output,
                  message: output.communities?.length > 0 
                    ? `✅ Found ${output.communities.length} communities`
                    : `No results in database`
                })}\n\n`);
                if (res.flush) res.flush();
                
              } else if (functionName === 'enable_discovery_mode') {
                res.write(`event: tool\n`);
                res.write(`data: ${JSON.stringify({ 
                  type: 'tool_start',
                  tool: 'enable_discovery_mode',
                  message: `🌟 Activating Discovery Mode for "${args.query}"...`
                })}\n\n`);
                if (res.flush) res.flush();
                
                output = await enableDiscoveryMode(args);
                
                res.write(`event: tool\n`);
                res.write(`data: ${JSON.stringify({ 
                  type: 'tool_result',
                  tool: 'enable_discovery_mode',
                  result: output,
                  message: output.communities?.length > 0
                    ? `✅ Found ${output.communities.length} communities${output.newlyInserted > 0 ? ` (${output.newlyInserted} new)` : ''}`
                    : `Discovery complete`
                })}\n\n`);
                if (res.flush) res.flush();
              }
              
              return {
                tool_call_id: toolCall.id,
                output: JSON.stringify(output)
              };
            })
          );
          
          // Submit tool outputs
          await openai.beta.threads.runs.submitToolOutputs(
            run.id,
            { 
              thread_id,
              tool_outputs: toolOutputs 
            }
          );
          
          console.log('📤 Tool outputs submitted, continuing to poll...');
        }
      }
      
      // Wait a bit before polling again
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get updated status
      runStatus = await openai.beta.threads.runs.retrieve(run.id, { thread_id });
      console.log(`📊 Run status: ${runStatus.status}`);
    }
    
    // Check final status
    if (runStatus.status === 'completed') {
      console.log('✅ Run completed successfully');
      
      // Get the assistant's response messages
      const messages = await openai.beta.threads.messages.list(thread_id, {
        limit: 10,
        order: 'desc'
      });
      
      // Find the most recent assistant message
      const assistantMessage = messages.data.find(msg => msg.role === 'assistant');
      
      if (assistantMessage && assistantMessage.content && assistantMessage.content[0]) {
        const content = assistantMessage.content[0];
        if (content.type === 'text') {
          const finalText = (content as any).text.value;
          
          console.log('📤 Sending assistant response:', finalText.substring(0, 100) + '...');
          
          // Send the complete message as a delta
          res.write(`event: message\n`);
          res.write(`data: ${JSON.stringify({ 
            type: 'delta',
            content: finalText
          })}\n\n`);
          if (res.flush) res.flush();
        }
      } else {
        console.log('⚠️ No assistant message found in thread');
      }
      
      // Send completion event
      res.write(`event: done\n`);
      res.write(`data: ${JSON.stringify({ 
        type: 'done',
        message: 'Response complete'
      })}\n\n`);
      if (res.flush) res.flush();
      
    } else if (runStatus.status === 'failed' || runStatus.status === 'cancelled' || runStatus.status === 'expired') {
      console.error('Run failed:', runStatus);
      res.write(`event: error\n`);
      res.write(`data: ${JSON.stringify({ 
        type: 'error',
        message: runStatus.last_error?.message || `Run ${runStatus.status}`
      })}\n\n`);
      if (res.flush) res.flush();
    }
    
    res.end();
    
  } catch (error) {
    console.error('ChatKit streaming error:', error);
    
    // If headers not sent, send error response
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Streaming failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    } else {
      // Send error event if already streaming
      res.write(`event: error\n`);
      res.write(`data: ${JSON.stringify({ 
        type: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      })}\n\n`);
      res.end();
    }
  }
});

export default router;
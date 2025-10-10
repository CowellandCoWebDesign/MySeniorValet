import { Router, Request, Response } from 'express';
import OpenAI from 'openai';
import { searchCommunities, enableDiscoveryMode } from './chatkit-routes';

const router = Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Import session management from chatkit-session
import { activeSessions } from './chatkit-session';

// Export for use in chatkit-session
export { activeSessions };

// Validate session token middleware
async function validateSession(req: Request, res: Response, next: any) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }
  
  const token = authHeader.replace('Bearer ', '');
  const session = activeSessions.get(token);
  
  if (!session) {
    return res.status(401).json({ error: 'Invalid or expired session token' });
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
    const { message, threadId } = req.body;
    
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
    
    // Create streaming run
    const stream = openai.beta.threads.runs.stream(thread_id, {
      assistant_id: session.assistantId,
    });
    
    // Process stream events
    for await (const event of stream) {
      // Send status events
      if (event.event === 'thread.run.created' || 
          event.event === 'thread.run.queued' ||
          event.event === 'thread.run.in_progress') {
        res.write(`event: status\n`);
        res.write(`data: ${JSON.stringify({ 
          type: 'status',
          status: event.data.status,
          message: 'Processing your request...'
        })}\n\n`);
      }
      
      // Stream message deltas
      if (event.event === 'thread.message.delta') {
        const delta = event.data.delta;
        if (delta.content && delta.content[0] && delta.content[0].type === 'text') {
          const text = delta.content[0].text?.value || '';
          if (text) {
            res.write(`event: message\n`);
            res.write(`data: ${JSON.stringify({ 
              type: 'delta',
              content: text 
            })}\n\n`);
          }
        }
      }
      
      // Handle tool calls
      if (event.event === 'thread.run.requires_action') {
        const toolCalls = event.data.required_action?.submit_tool_outputs?.tool_calls || [];
        
        // Send status for tool execution
        res.write(`event: status\n`);
        res.write(`data: ${JSON.stringify({ 
          type: 'status',
          message: 'Executing tools...'
        })}\n\n`);
        
        // Execute tools
        const toolOutputs = await Promise.all(
          toolCalls.map(async (toolCall: any) => {
            const functionName = toolCall.function.name;
            const args = JSON.parse(toolCall.function.arguments);
            
            let output: any = {};
            
            // Send tool-specific status
            if (functionName === 'search_communities') {
              res.write(`event: tool\n`);
              res.write(`data: ${JSON.stringify({ 
                type: 'tool_start',
                tool: 'search_communities',
                message: `🔍 Searching database for communities in ${args.location}...`
              })}\n\n`);
              
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
              
            } else if (functionName === 'enable_discovery_mode') {
              res.write(`event: tool\n`);
              res.write(`data: ${JSON.stringify({ 
                type: 'tool_start',
                tool: 'enable_discovery_mode',
                message: `🌟 Activating Discovery Mode for "${args.query}"...`
              })}\n\n`);
              
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
            }
            
            return {
              tool_call_id: toolCall.id,
              output: JSON.stringify(output)
            };
          })
        );
        
        // Submit tool outputs
        const submitStream = openai.beta.threads.runs.submitToolOutputsStream(
          event.data.id,
          {
            thread_id,
            tool_outputs: toolOutputs
          }
        );
        
        // Continue streaming after tool submission
        for await (const submitEvent of submitStream) {
          if (submitEvent.event === 'thread.message.delta') {
            const delta = submitEvent.data.delta;
            if (delta.content && delta.content[0] && delta.content[0].type === 'text') {
              const text = delta.content[0].text?.value || '';
              if (text) {
                res.write(`event: message\n`);
                res.write(`data: ${JSON.stringify({ 
                  type: 'delta',
                  content: text 
                })}\n\n`);
              }
            }
          }
        }
      }
      
      // Run completed
      if (event.event === 'thread.run.completed') {
        res.write(`event: done\n`);
        res.write(`data: ${JSON.stringify({ 
          type: 'done',
          message: 'Response complete'
        })}\n\n`);
      }
      
      // Run failed
      if (event.event === 'thread.run.failed') {
        res.write(`event: error\n`);
        res.write(`data: ${JSON.stringify({ 
          type: 'error',
          message: event.data.last_error?.message || 'Request failed'
        })}\n\n`);
      }
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
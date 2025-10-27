import express, { Request, Response } from 'express';
import crypto from 'crypto';
import OpenAI from 'openai';

const router = express.Router();

// Store active sessions
export const activeSessions = new Map();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Constants from OpenAI's official implementation
const DEFAULT_CHATKIT_BASE = "https://api.openai.com";
const SESSION_COOKIE_NAME = "chatkit_session_id";
const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const WORKFLOW_ID = process.env.CHATKIT_WORKFLOW_ID;

interface CreateSessionRequestBody {
  workflow?: { id?: string | null } | null;
  user?: string | null;
  threadId?: string | null;
}

// Create ChatKit session using direct HTTP API calls (official workaround)
router.post('/create-session', async (req: Request, res: Response) => {
  try {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      return res.status(500).json({ 
        error: "Missing OPENAI_API_KEY environment variable" 
      });
    }

    const body = req.body as CreateSessionRequestBody;
    
    // Generate or retrieve user ID from session
    let userId: string;
    const sessionData = (req.session as any) || {};
    
    if (sessionData.userId) {
      userId = sessionData.userId;
    } else {
      userId = crypto.randomUUID();
      if (req.session) {
        (req.session as any).userId = userId;
      }
    }
    
    // Use provided user ID or session user ID
    const resolvedUserId = body.user || userId;
    
    // Check if we have a ChatKit workflow ID configured
    // Note: Workflows must be created in OpenAI's Agent Builder platform
    const workflowId = body.workflow?.id || process.env.CHATKIT_WORKFLOW_ID;
    
    if (!workflowId) {
      console.log('[ChatKit] No workflow ID configured, creating fallback session with real OpenAI thread');
      
      try {
        // Create a real OpenAI thread for the fallback session
        const OpenAI = (await import('openai')).default;
        const { MYSENIORVALET_SYSTEM_KNOWLEDGE, CHATKIT_TOOL_FUNCTIONS } = await import('./chatkit-knowledge-base');
        const openai = new OpenAI({
          apiKey: openaiApiKey,
        });
        
        let threadId = body.threadId;
        
        // Only create a new thread if one wasn't provided
        if (!threadId) {
          const thread = await openai.beta.threads.create();
          threadId = thread.id;
          console.log('[ChatKit] Created real OpenAI thread for fallback:', threadId);
        }
        
        // Check if we have a configured assistant ID or need to create one
        let assistantId = process.env.OPENAI_ASSISTANT_ID || 'asst_WKYShD9dPx7wYOmkC0OFiBJl';
        
        // Try to update the existing assistant with our knowledge base
        try {
          await openai.beta.assistants.update(assistantId, {
            name: "MySeniorValet AI Assistant",
            instructions: MYSENIORVALET_SYSTEM_KNOWLEDGE,
            tools: CHATKIT_TOOL_FUNCTIONS.map(fn => ({
              type: 'function' as const,
              function: fn
            })),
            model: "gpt-4-turbo-preview"
          });
          console.log('[ChatKit] Updated assistant with MySeniorValet knowledge');
        } catch (updateError) {
          console.log('[ChatKit] Could not update assistant, using existing configuration');
        }
        
        // Generate a fallback token
        const fallbackToken = `ck_fallback_${crypto.randomBytes(32).toString('hex')}`;
        
        // Store the fallback session with assistant ID
        activeSessions.set(fallbackToken, {
          userId: resolvedUserId,
          threadId,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
          workflowId: undefined,
          assistantId
        } as any);
        
        // Return a fallback session with a token
        return res.json({
          client_secret: fallbackToken,
          thread_id: threadId,
          user_id: resolvedUserId,
          expires_at: Date.now() + 3600000, // 1 hour in ms
          metadata: { 
            session_type: 'assistant_fallback',
            message: 'ChatKit workflow not configured - using Assistant API streaming'
          }
        });
      } catch (error) {
        console.error('[ChatKit] Failed to create OpenAI thread for fallback:', error);
        // If thread creation fails, return error
        return res.status(500).json({
          error: 'Failed to create fallback session',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    console.log('[ChatKit] Creating session for user:', resolvedUserId, 'workflow:', workflowId);
    
    // Make direct API call to OpenAI ChatKit endpoint
    const apiBase = process.env.CHATKIT_API_BASE || DEFAULT_CHATKIT_BASE;
    const url = `${apiBase}/v1/chatkit/sessions`;
    
    const upstreamResponse = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
        "OpenAI-Beta": "chatkit_beta=v1",
      },
      body: JSON.stringify({
        workflow: { id: workflowId },
        user: resolvedUserId,
        // Include thread ID if provided for conversation continuity
        ...(body.threadId && { thread: { id: body.threadId } })
      }),
    });

    const upstreamJson = await upstreamResponse.json().catch(() => ({})) as Record<string, unknown>;

    if (!upstreamResponse.ok) {
      console.error("OpenAI ChatKit session creation failed", {
        status: upstreamResponse.status,
        statusText: upstreamResponse.statusText,
        body: upstreamJson,
      });
      
      // If workflow not found or other API error, return fallback session
      const errorMessage = extractUpstreamError(upstreamJson);
      if (errorMessage?.includes('Workflow') || errorMessage?.includes('not found')) {
        console.log('[ChatKit] Workflow not found, creating fallback mode with real thread');
        
        try {
          // Create a real OpenAI thread for the fallback session
          const OpenAI = (await import('openai')).default;
          const openai = new OpenAI({
            apiKey: openaiApiKey,
          });
          
          let threadId = body.threadId;
          
          // Only create a new thread if one wasn't provided
          if (!threadId) {
            const thread = await openai.beta.threads.create();
            threadId = thread.id;
            console.log('[ChatKit] Created real OpenAI thread for fallback:', threadId);
          }
          
          // Generate a fallback token
          const fallbackToken = `ck_fallback_${crypto.randomBytes(32).toString('hex')}`;
          
          // Store the fallback session with assistant ID
          activeSessions.set(fallbackToken, {
            userId: resolvedUserId,
            threadId,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
            workflowId: undefined,
            assistantId: process.env.OPENAI_ASSISTANT_ID || 'asst_WKYShD9dPx7wYOmkC0OFiBJl'
          } as any);
          
          return res.json({
            client_secret: fallbackToken,
            thread_id: threadId,
            user_id: resolvedUserId,
            expires_at: Date.now() + 3600000, // 1 hour in ms
            metadata: { 
              session_type: 'assistant_fallback',
              message: 'ChatKit workflow not available - using Assistant API streaming'
            }
          });
        } catch (error) {
          console.error('[ChatKit] Failed to create OpenAI thread for fallback:', error);
          return res.status(500).json({
            error: 'Failed to create fallback session',
            details: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
      
      return res.status(upstreamResponse.status).json({
        error: errorMessage || `Failed to create session: ${upstreamResponse.statusText}`,
        details: upstreamJson,
      });
    }

    // Extract session details from response
    const clientSecret = upstreamJson?.client_secret as string || null;
    const expiresAfter = upstreamJson?.expires_after as number || null;
    // ChatKit doesn't return a thread ID on session creation - threads are created when first message is sent
    const threadId = body.threadId || null; // Use provided thread ID or null for new conversations
    
    console.log('[ChatKit] Session created successfully:', {
      hasSecret: !!clientSecret,
      expiresAfter,
      threadId: threadId || 'will be created on first message'
    });
    
    // Calculate expires_at timestamp for frontend compatibility
    const expiresAt = expiresAfter ? Date.now() + (expiresAfter * 1000) : null;
    
    // For real ChatKit sessions (starting with ek_), add to active sessions map
    // This allows the streaming endpoint to validate the session
    if (clientSecret && clientSecret.startsWith('ek_')) {
      // Create or get thread ID for Assistant API fallback
      let assistantThreadId = threadId;
      if (!assistantThreadId) {
        // Create a thread for the Assistant API to use as fallback
        const thread = await openai.beta.threads.create();
        assistantThreadId = thread.id;
      }
      
      // Store session for validation
      activeSessions.set(clientSecret, {
        userId: resolvedUserId,
        threadId: assistantThreadId,
        expiresAt: new Date(expiresAt || Date.now() + 24 * 60 * 60 * 1000), // Default 24 hours
        workflowId: WORKFLOW_ID,
        assistantId: process.env.OPENAI_ASSISTANT_ID || 'asst_Yn6yajSm1GDD4C7PJSlSvwCL' // Fallback assistant
      });
      
      console.log('[ChatKit] Session stored in activeSessions for streaming validation');
    }
    
    // Return the session data with expires_at for frontend
    return res.json({
      client_secret: clientSecret,
      expires_at: expiresAt,  // Frontend expects timestamp, not seconds
      thread_id: threadId || activeSessions.get(clientSecret!)?.threadId, // Return the created thread ID
      user_id: resolvedUserId
    });
    
  } catch (error) {
    console.error('[ChatKit] Create session error:', error);
    
    // Check if it's a network error
    if (error instanceof Error && error.message.includes('fetch')) {
      return res.status(503).json({ 
        error: "Unable to connect to OpenAI API. Please check your API key and network connection.",
        details: error.message
      });
    }
    
    return res.status(500).json({ 
      error: "Unexpected error creating ChatKit session",
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Refresh session endpoint
router.post('/refresh-session', async (req: Request, res: Response) => {
  try {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      return res.status(500).json({ 
        error: "Missing OPENAI_API_KEY environment variable" 
      });
    }
    
    const { thread_id, user_id } = req.body;
    
    if (!thread_id) {
      return res.status(400).json({ 
        error: "Missing thread_id for session refresh" 
      });
    }
    
    console.log('[ChatKit] Refreshing session for thread:', thread_id);
    
    // Check if we have a ChatKit workflow ID configured
    const workflowId = process.env.CHATKIT_WORKFLOW_ID;
    
    if (!workflowId) {
      console.log('[ChatKit] No workflow ID configured for refresh, returning fallback session');
      // Return a fallback session for refresh
      return res.json({
        client_secret: null,
        thread_id,
        user_id: user_id || (req.session as any)?.userId,
        metadata: { 
          session_type: 'assistant_fallback',
          message: 'ChatKit workflow not configured - using Assistant API streaming'
        }
      });
    }
    
    // Make direct API call to refresh the session
    const apiBase = process.env.CHATKIT_API_BASE || DEFAULT_CHATKIT_BASE;
    const url = `${apiBase}/v1/chatkit/sessions`;
    
    const upstreamResponse = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
        "OpenAI-Beta": "chatkit_beta=v1",
      },
      body: JSON.stringify({
        workflow: { id: workflowId },
        user: user_id || (req.session as any)?.userId,
        thread: { id: thread_id }
      }),
    });

    const upstreamJson = await upstreamResponse.json().catch(() => ({})) as Record<string, unknown>;

    if (!upstreamResponse.ok) {
      console.error("ChatKit session refresh failed", upstreamJson);
      return res.status(upstreamResponse.status).json({
        error: "Failed to refresh session",
        details: upstreamJson,
      });
    }

    const clientSecret = upstreamJson?.client_secret as string || null;
    const expiresAfter = upstreamJson?.expires_after as number || null;
    
    // Calculate expires_at timestamp for frontend compatibility
    const expiresAt = expiresAfter ? Date.now() + (expiresAfter * 1000) : null;
    
    return res.json({
      client_secret: clientSecret,
      expires_at: expiresAt,  // Frontend expects timestamp, not seconds
      thread_id,
      user_id: user_id || (req.session as any)?.userId
    });
    
  } catch (error) {
    console.error('[ChatKit] Refresh session error:', error);
    return res.status(500).json({ 
      error: "Failed to refresh ChatKit session" 
    });
  }
});

// Helper function to extract error messages from upstream response
function extractUpstreamError(
  payload: Record<string, unknown> | undefined
): string | null {
  if (!payload) return null;

  // Check for direct error string
  const error = payload.error;
  if (typeof error === "string") {
    return error;
  }

  // Check for error object with message
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }

  // Check details field
  const details = payload.details;
  if (typeof details === "string") {
    return details;
  }

  // Check nested error in details
  if (details && typeof details === "object" && "error" in details) {
    const nestedError = (details as { error?: unknown }).error;
    if (typeof nestedError === "string") {
      return nestedError;
    }
    if (
      nestedError &&
      typeof nestedError === "object" &&
      "message" in nestedError &&
      typeof (nestedError as { message?: unknown }).message === "string"
    ) {
      return (nestedError as { message: string }).message;
    }
  }

  // Check for top-level message
  if (typeof payload.message === "string") {
    return payload.message;
  }

  return null;
}

export default router;
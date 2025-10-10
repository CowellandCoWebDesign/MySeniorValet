import { Router } from 'express';
import OpenAI from 'openai';
import crypto from 'crypto';

const router = Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Store active sessions (in production, use Redis or database)
export const activeSessions = new Map<string, {
  threadId: string;
  assistantId: string;
  expiresAt: Date;
  userId?: string;
}>();

// Generate a secure client token (simulating ChatKit's client_secret)
function generateClientToken(): string {
  return `ck_${crypto.randomBytes(32).toString('hex')}`;
}

// Session creation endpoint (ChatKit-style)
router.post('/api/chatkit/session', async (req, res) => {
  try {
    const { threadId, userId } = req.body;
    
    // Call Python microservice for real ChatKit session
    const pythonServiceUrl = process.env.CHATKIT_SERVICE_URL || 'http://localhost:8001';
    
    try {
      // Try to use the Python service for real ChatKit sessions
      const response = await fetch(`${pythonServiceUrl}/api/chatkit/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thread_id: threadId,
          user_id: userId,
          assistant_id: process.env.ASSISTANT_ID || 'asst_FnXClWdC8GsX5jzOLrYAh5UE'
        })
      });
      
      if (response.ok) {
        const sessionData = await response.json();
        
        // Store session info locally for validation
        activeSessions.set(sessionData.client_secret, {
          threadId: sessionData.thread_id,
          assistantId: sessionData.assistant_id,
          expiresAt: new Date(sessionData.expires_at),
          userId,
        });
        
        res.json(sessionData);
        return;
      }
      
      console.warn('Python ChatKit service not available, falling back to local implementation');
    } catch (error) {
      console.warn('Failed to connect to Python ChatKit service:', error);
    }
    
    // Fallback: Local implementation if Python service is not available
    // Create or retrieve thread
    let thread;
    if (threadId) {
      // Verify thread exists
      try {
        thread = await openai.beta.threads.retrieve(threadId);
      } catch (error) {
        // Thread doesn't exist, create new one
        thread = await openai.beta.threads.create();
      }
    } else {
      // Create new thread
      thread = await openai.beta.threads.create();
    }
    
    // Generate secure client token
    const clientToken = generateClientToken();
    
    // Store session info
    const sessionInfo = {
      threadId: thread.id,
      assistantId: process.env.ASSISTANT_ID || 'asst_FnXClWdC8GsX5jzOLrYAh5UE',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      userId,
    };
    
    activeSessions.set(clientToken, sessionInfo);
    
    // Return ChatKit-compatible response
    res.json({
      client_secret: clientToken,
      thread_id: thread.id,
      assistant_id: sessionInfo.assistantId,
      expires_at: sessionInfo.expiresAt.toISOString(),
      // Additional metadata for our use
      metadata: {
        session_type: 'assistant_fallback',
        capabilities: ['search_communities', 'enable_discovery_mode', 'show_on_map', 'show_community_details', 'compare_communities'],
      }
    });
    
  } catch (error) {
    console.error('Error creating ChatKit session:', error);
    res.status(500).json({ 
      error: 'Failed to create session',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Token validation endpoint
router.post('/api/chatkit/validate', async (req, res) => {
  try {
    const { client_secret } = req.body;
    
    if (!client_secret) {
      return res.status(400).json({ error: 'Missing client_secret' });
    }
    
    const session = activeSessions.get(client_secret);
    
    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    if (session.expiresAt < new Date()) {
      activeSessions.delete(client_secret);
      return res.status(401).json({ error: 'Token expired' });
    }
    
    res.json({
      valid: true,
      thread_id: session.threadId,
      assistant_id: session.assistantId,
      expires_at: session.expiresAt.toISOString(),
    });
    
  } catch (error) {
    console.error('Error validating token:', error);
    res.status(500).json({ 
      error: 'Failed to validate token',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Token refresh endpoint
router.post('/api/chatkit/refresh', async (req, res) => {
  try {
    const { client_secret } = req.body;
    
    if (!client_secret) {
      return res.status(400).json({ error: 'Missing client_secret' });
    }
    
    // Try to use Python service for refresh
    const pythonServiceUrl = process.env.CHATKIT_SERVICE_URL || 'http://localhost:8001';
    
    try {
      const response = await fetch(`${pythonServiceUrl}/api/chatkit/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_secret })
      });
      
      if (response.ok) {
        const sessionData = await response.json();
        
        // Update local session info
        activeSessions.set(sessionData.client_secret, {
          threadId: sessionData.thread_id,
          assistantId: sessionData.assistant_id,
          expiresAt: new Date(sessionData.expires_at),
          userId: activeSessions.get(client_secret)?.userId,
        });
        
        // Remove old session
        activeSessions.delete(client_secret);
        
        res.json(sessionData);
        return;
      }
    } catch (error) {
      console.warn('Failed to refresh via Python service:', error);
    }
    
    // Fallback: Local implementation
    const session = activeSessions.get(client_secret);
    
    if (!session) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Generate new token
    const newToken = generateClientToken();
    
    // Update session with new token and expiry
    session.expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    activeSessions.set(newToken, session);
    
    // Delete old token
    activeSessions.delete(client_secret);
    
    res.json({
      client_secret: newToken,
      thread_id: session.threadId,
      assistant_id: session.assistantId,
      expires_at: session.expiresAt.toISOString(),
    });
    
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({ 
      error: 'Failed to refresh token',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Cleanup expired sessions periodically
setInterval(() => {
  const now = new Date();
  for (const [token, session] of activeSessions) {
    if (session.expiresAt < now) {
      activeSessions.delete(token);
    }
  }
}, 5 * 60 * 1000); // Every 5 minutes

export default router;
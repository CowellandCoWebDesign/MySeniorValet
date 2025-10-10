import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Maximize2, Minimize2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// Declare the custom element type for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'openai-chatkit': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          ref?: React.RefObject<HTMLElement>;
        },
        HTMLElement
      >;
    }
  }
}

interface ChatKitOfficialProps {
  className?: string;
  threadId?: string;
  userId?: string;
  onThreadChange?: (threadId: string) => void;
  onClose?: () => void;
}

interface ChatKitSession {
  client_secret: string;
  thread_id: string;
  assistant_id: string;
  expires_at: string;
  metadata?: {
    session_type: string;
    capabilities: string[];
  };
}

export function ChatKitOfficial({ 
  className = '', 
  threadId: initialThreadId,
  userId,
  onThreadChange,
  onClose 
}: ChatKitOfficialProps) {
  const { toast } = useToast();
  const chatkitRef = useRef<HTMLElement>(null);
  const scriptLoadedRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentSession, setCurrentSession] = useState<ChatKitSession | null>(null);
  const [threadId, setThreadId] = useState(initialThreadId);

  // Create session mutation
  const createSession = useMutation({
    mutationFn: async (data: { threadId?: string; userId?: string }) => {
      const response = await apiRequest('/api/chatkit/session', 'POST', data);
      return response as ChatKitSession;
    },
    onSuccess: (session) => {
      setCurrentSession(session);
      setThreadId(session.thread_id);
      onThreadChange?.(session.thread_id);
      
      // Configure the web component with the session
      if (chatkitRef.current && (window as any).OpenAIChatKit) {
        const chatkit = chatkitRef.current as any;
        chatkit.setOptions({
          api: {
            clientToken: session.client_secret,
            assistantId: session.assistant_id,
            threadId: session.thread_id,
          },
          // Custom configuration
          placeholder: "Ask me about senior living communities...",
          greeting: "👋 Welcome to MySeniorValet! I can help you search for senior living communities, get pricing information, and schedule tours.",
          starterPrompts: [
            "Show me assisted living in San Jose, California",
            "What senior care options are available in Phoenix?",
            "Find memory care communities near Miami",
            "Compare senior living costs in Denver vs Seattle"
          ],
          theme: {
            primaryColor: "#10b981",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }
        });
        
        setIsLoading(false);
      }
    },
    onError: (error: any) => {
      console.error('Failed to create ChatKit session:', error);
      toast({
        title: "Connection Error",
        description: "Failed to start chat session. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  });

  // Refresh session mutation
  const refreshSession = useMutation({
    mutationFn: async (client_secret: string) => {
      const response = await apiRequest('/api/chatkit/refresh', 'POST', { client_secret });
      return response as ChatKitSession;
    },
    onSuccess: (session) => {
      setCurrentSession(session);
      
      // Update the web component with new token
      if (chatkitRef.current) {
        const chatkit = chatkitRef.current as any;
        chatkit.updateClientToken(session.client_secret);
      }
      
      toast({
        title: "Session refreshed",
        description: "Your chat session has been extended.",
      });
    },
    onError: (error: any) => {
      console.error('Failed to refresh session:', error);
      toast({
        title: "Session Error",
        description: "Failed to refresh session. Please reload the page.",
        variant: "destructive",
      });
    }
  });

  // Load ChatKit script
  useEffect(() => {
    if (!scriptLoadedRef.current) {
      const script = document.createElement('script');
      script.src = 'https://cdn.platform.openai.com/deployments/chatkit/chatkit.js';
      script.async = true;
      script.onload = () => {
        console.log('✅ ChatKit script loaded');
        scriptLoadedRef.current = true;
        
        // Create initial session once script is loaded
        createSession.mutate({ threadId, userId });
      };
      script.onerror = () => {
        console.error('Failed to load ChatKit script');
        toast({
          title: "Loading Error",
          description: "Failed to load chat interface. Please refresh the page.",
          variant: "destructive",
        });
        setIsLoading(false);
      };
      
      document.head.appendChild(script);
      
      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    } else {
      // Script already loaded, create session
      createSession.mutate({ threadId, userId });
    }
  }, []);

  // Set up event listeners for ChatKit events
  useEffect(() => {
    if (!chatkitRef.current) return;

    const chatkit = chatkitRef.current as any;

    // Listen for ChatKit events
    const handleMessage = (event: CustomEvent) => {
      console.log('ChatKit message:', event.detail);
      
      // Handle tool calls from our custom Assistant
      if (event.detail.type === 'tool_call') {
        const { tool, args } = event.detail;
        
        // These will be handled by our existing backend
        if (tool === 'search_communities' || 
            tool === 'enable_discovery_mode' || 
            tool === 'show_on_map') {
          console.log(`Tool call: ${tool}`, args);
        }
      }
    };

    const handleError = (event: CustomEvent) => {
      console.error('ChatKit error:', event.detail);
      toast({
        title: "Chat Error",
        description: event.detail.message || "An error occurred in the chat.",
        variant: "destructive",
      });
    };

    const handleThreadChange = (event: CustomEvent) => {
      const newThreadId = event.detail.threadId;
      setThreadId(newThreadId);
      onThreadChange?.(newThreadId);
    };

    chatkit.addEventListener('chatkit.message', handleMessage);
    chatkit.addEventListener('chatkit.error', handleError);
    chatkit.addEventListener('chatkit.thread.change', handleThreadChange);

    return () => {
      chatkit.removeEventListener('chatkit.message', handleMessage);
      chatkit.removeEventListener('chatkit.error', handleError);
      chatkit.removeEventListener('chatkit.thread.change', handleThreadChange);
    };
  }, [chatkitRef.current, onThreadChange]);

  // Auto-refresh session before expiry
  useEffect(() => {
    if (!currentSession) return;

    const expiryTime = new Date(currentSession.expires_at).getTime();
    const now = Date.now();
    const timeUntilExpiry = expiryTime - now;
    
    // Refresh 5 minutes before expiry
    const refreshTime = Math.max(0, timeUntilExpiry - 5 * 60 * 1000);
    
    const timer = setTimeout(() => {
      if (currentSession) {
        refreshSession.mutate(currentSession.client_secret);
      }
    }, refreshTime);

    return () => clearTimeout(timer);
  }, [currentSession]);

  return (
    <Card className={`relative overflow-hidden ${className} ${isExpanded ? 'fixed inset-4 z-50' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-lg">MySeniorValet AI Assistant</h3>
          {currentSession && (
            <span className="text-xs text-muted-foreground">
              Thread: {threadId?.slice(-8)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Refresh button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => createSession.mutate({ userId })}
            disabled={createSession.isPending}
            title="Start new conversation"
          >
            <RefreshCw className={`h-4 w-4 ${createSession.isPending ? 'animate-spin' : ''}`} />
          </Button>
          
          {/* Expand/Collapse button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          
          {/* Close button */}
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              title="Close chat"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Chat Container */}
      <div className={`relative ${isExpanded ? 'h-[calc(100vh-8rem)]' : 'h-[600px]'}`}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-sm text-muted-foreground">Initializing AI Assistant...</p>
            </div>
          </div>
        ) : (
          <openai-chatkit 
            ref={chatkitRef}
            className="w-full h-full"
            style={{ height: '100%', width: '100%' }}
          />
        )}
      </div>

      {/* Footer with capabilities */}
      <div className="p-3 border-t bg-muted/50">
        <p className="text-xs text-muted-foreground text-center">
          Powered by OpenAI ChatKit • Search 33,834+ communities • Real-time pricing • Tour scheduling
        </p>
      </div>
    </Card>
  );
}
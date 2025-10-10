import { ChatKit, useChatKit } from '@openai/chatkit-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Maximize2, Minimize2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

interface OfficialChatKitProps {
  className?: string;
  threadId?: string;
  userId?: string;
  onThreadChange?: (threadId: string) => void;
  onClose?: () => void;
}

export function OfficialChatKit({ 
  className = '', 
  threadId: initialThreadId,
  userId,
  onThreadChange,
  onClose 
}: OfficialChatKitProps) {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentThreadId, setCurrentThreadId] = useState(initialThreadId);
  const [sessionData, setSessionData] = useState<any>(null);

  // Initialize ChatKit with secure client token
  const { control, setThreadId, sendUserMessage, focusComposer } = useChatKit({
    api: {
      async getClientSecret(existing) {
        try {
          // If we have an existing token that's still valid, check if we need to refresh
          if (existing && sessionData?.expires_at) {
            const expiryTime = new Date(sessionData.expires_at).getTime();
            const now = Date.now();
            const timeUntilExpiry = expiryTime - now;
            
            // If we have more than 5 minutes left, keep using the existing token
            if (timeUntilExpiry > 5 * 60 * 1000) {
              return existing;
            }
            
            // Otherwise refresh the token
            const refreshResponse = await fetch('/api/chatkit/refresh', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ client_secret: existing }),
            });
            
            if (refreshResponse.ok) {
              const refreshedSession = await refreshResponse.json();
              setSessionData(refreshedSession);
              setCurrentThreadId(refreshedSession.thread_id);
              onThreadChange?.(refreshedSession.thread_id);
              return refreshedSession.client_secret;
            }
          }
          
          // Create new session
          const response = await fetch('/api/chatkit/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              threadId: currentThreadId,
              userId 
            }),
          });
          
          if (!response.ok) {
            throw new Error('Failed to create session');
          }
          
          const session = await response.json();
          setSessionData(session);
          setCurrentThreadId(session.thread_id);
          onThreadChange?.(session.thread_id);
          
          console.log('✅ ChatKit session created:', session.thread_id);
          return session.client_secret;
          
        } catch (error) {
          console.error('Failed to get ChatKit client secret:', error);
          toast({
            title: "Connection Error",
            description: "Failed to connect to chat service. Please try again.",
            variant: "destructive",
          });
          throw error;
        }
      },
    },
    // Configuration options
    placeholder: "Ask me about senior living communities...",
    greeting: "👋 Welcome to MySeniorValet! I can help you search for senior living communities, get pricing information, and schedule tours.\n\nWhat location would you like to explore?",
    starterPrompts: [
      "Show me assisted living in San Jose, California",
      "What senior care options are available in Phoenix?",
      "Find memory care communities near Miami",
      "Compare senior living costs in Denver vs Seattle"
    ],
    // Event handlers
    onMessage: (message) => {
      console.log('ChatKit message:', message);
    },
    onError: (error) => {
      console.error('ChatKit error:', error);
      toast({
        title: "Chat Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle new conversation
  const handleNewConversation = async () => {
    try {
      // Create a new session with no threadId
      const response = await fetch('/api/chatkit/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create new session');
      }
      
      const session = await response.json();
      setSessionData(session);
      setCurrentThreadId(session.thread_id);
      onThreadChange?.(session.thread_id);
      
      // Set the new thread in ChatKit
      await setThreadId(session.thread_id);
      
      toast({
        title: "New Conversation",
        description: "Started a new chat session.",
      });
      
    } catch (error) {
      console.error('Failed to start new conversation:', error);
      toast({
        title: "Error",
        description: "Failed to start new conversation. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Focus composer when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      focusComposer?.();
    }, 500);
    return () => clearTimeout(timer);
  }, [focusComposer]);

  return (
    <Card className={`relative overflow-hidden ${className} ${isExpanded ? 'fixed inset-4 z-50' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-lg">MySeniorValet AI Assistant</h3>
          {currentThreadId && (
            <span className="text-xs text-muted-foreground">
              Thread: {currentThreadId.slice(-8)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* New conversation button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNewConversation}
            title="Start new conversation"
          >
            <RefreshCw className="h-4 w-4" />
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

      {/* ChatKit Component */}
      <ChatKit 
        control={control} 
        className={`${isExpanded ? 'h-[calc(100vh-8rem)]' : 'h-[600px]'} w-full`}
      />

      {/* Footer with capabilities */}
      <div className="p-3 border-t bg-muted/50">
        <p className="text-xs text-muted-foreground text-center">
          Powered by OpenAI ChatKit • Search 33,834+ communities • Real-time pricing • Tour scheduling
        </p>
      </div>
    </Card>
  );
}
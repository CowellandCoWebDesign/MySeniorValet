import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RefreshCw, Maximize2, Minimize2, X, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatKitWrapper } from './ChatKitWrapper';

interface OfficialChatKitProps {
  className?: string;
  threadId?: string;
  userId?: string;
  onThreadChange?: (threadId: string) => void;
  onClose?: () => void;
}

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp?: Date;
}

export function OfficialChatKitWithFallback({ 
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
  const [useFallback, setUseFallback] = useState<boolean | null>(null); // null = not yet determined
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize session on mount
  useEffect(() => {
    initializeSession();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function initializeSession() {
    try {
      const response = await fetch('/api/chatkit/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          threadId: currentThreadId,
          user: userId 
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[ChatKit] Session initialization failed:', errorData);
        throw new Error(errorData.error || 'Failed to create session');
      }
      
      const session = await response.json();
      setSessionData(session);
      
      if (session.thread_id) {
        setCurrentThreadId(session.thread_id);
        onThreadChange?.(session.thread_id);
      }
      
      // Use real ChatKit component when we have a valid client_secret (starts with "ek_")
      // Use fallback for demo/test tokens, fallback tokens (ck_fallback_), or when metadata indicates fallback
      const hasRealChatKitToken = session.client_secret && session.client_secret.startsWith('ek_');
      const shouldUseFallback = !hasRealChatKitToken ||
          session.metadata?.session_type === 'assistant_fallback' ||
          session.metadata?.session_type === 'assistant';
      
      setUseFallback(shouldUseFallback);
      
      if (shouldUseFallback) {
        console.log('⚠️ Using MySeniorValet Assistant (fallback mode - no widgets)', {
          tokenType: session.client_secret?.substring(0, 15) + '...',
          sessionType: session.metadata?.session_type
        });
      } else {
        console.log('✅ Using ChatKit Beta with OpenAI widgets:', {
          threadId: session.thread_id,
          tokenType: 'ek_...'
        });
      }
      
      // Add welcome message
      setMessages([{
        id: '1',
        role: 'assistant',
        content: "👋 Welcome to MySeniorValet! I can help you search for senior living communities, get pricing information, and schedule tours.\n\nWhat location would you like to explore?",
        timestamp: new Date()
      }]);
      
    } catch (error) {
      console.error('Failed to initialize session:', error);
      setUseFallback(true); // Use fallback on error
      toast({
        title: "Connection Notice",
        description: "Using alternative connection method.",
      });
    }
  }

  // Fallback message handler
  async function handleSendMessage() {
    if (!input.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/chatkit/stream', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': sessionData?.client_secret ? `Bearer ${sessionData.client_secret}` : ''
        },
        body: JSON.stringify({
          message: userMessage.content,
          thread_id: currentThreadId  // Changed from threadId to thread_id
        })
      });
      
      if (!response.ok) throw new Error('Failed to send message');
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';
      const messageId = Date.now().toString();
      
      // Add initial assistant message
      setMessages(prev => [...prev, {
        id: messageId,
        role: 'assistant',
        content: '',
        timestamp: new Date()
      }]);
      
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          // Handle both 'data:' and 'event:' SSE format
          if (line.trim().startsWith('data: ')) {
            const data = line.trim().slice(6);
            
            try {
              const parsed = JSON.parse(data);
              console.log('SSE Event:', parsed);
              
              // Handle different event types
              if (parsed.type === 'delta' && parsed.content) {
                assistantMessage += parsed.content;
                // Update the assistant message
                setMessages(prev => prev.map(msg => 
                  msg.id === messageId 
                    ? { ...msg, content: assistantMessage }
                    : msg
                ));
              } else if (parsed.type === 'tool_start') {
                // Show tool status
                assistantMessage += `\n${parsed.message}\n`;
                setMessages(prev => prev.map(msg => 
                  msg.id === messageId 
                    ? { ...msg, content: assistantMessage }
                    : msg
                ));
              } else if (parsed.type === 'tool_result') {
                // Handle search results
                if (parsed.result?.communities) {
                  const communities = parsed.result.communities;
                  assistantMessage += `\n${parsed.message || `Found ${communities.length} communities`}\n\n`;
                  communities.slice(0, 5).forEach((comm: any, idx: number) => {
                    assistantMessage += `${idx + 1}. **${comm.name}**\n`;
                    assistantMessage += `   📍 ${comm.city}, ${comm.state}\n`;
                    if (comm.pricing) {
                      assistantMessage += `   💰 Starting at $${comm.pricing}/month\n`;
                    }
                    assistantMessage += '\n';
                  });
                } else {
                  assistantMessage += `\n${parsed.message}\n`;
                }
                setMessages(prev => prev.map(msg => 
                  msg.id === messageId 
                    ? { ...msg, content: assistantMessage }
                    : msg
                ));
              } else if (parsed.type === 'done') {
                // Stream completed
                break;
              } else if (parsed.type === 'error') {
                throw new Error(parsed.message);
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
      
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: "Message Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Handle new conversation
  const handleNewConversation = async () => {
    try {
      const response = await fetch('/api/chatkit/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: userId }),
      });
      
      if (!response.ok) throw new Error('Failed to create new session');
      
      const session = await response.json();
      setSessionData(session);
      setCurrentThreadId(session.thread_id);
      onThreadChange?.(session.thread_id);
      
      // Clear messages and add welcome
      setMessages([{
        id: '1',
        role: 'assistant',
        content: "👋 Welcome to MySeniorValet! I can help you search for senior living communities. What location would you like to explore?",
        timestamp: new Date()
      }]);
      
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

  // Show loading state while determining which UI to use
  if (useFallback === null) {
    return (
      <Card className={`relative overflow-hidden flex flex-col items-center justify-center ${className} ${isExpanded ? 'fixed inset-4 z-50' : 'h-[600px]'}`}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Initializing chat...</p>
      </Card>
    );
  }

  // Render fallback UI when ChatKit tokens aren't available
  if (useFallback) {
    return (
      <Card className={`relative overflow-hidden flex flex-col ${className} ${isExpanded ? 'fixed inset-4 z-50' : ''}`}>
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
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNewConversation}
              title="Start new conversation"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
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

        {/* Messages Area */}
        <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${isExpanded ? 'max-h-[calc(100vh-12rem)]' : 'max-h-[500px]'}`}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {message.role === 'assistant' ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t p-4">
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me about senior living communities..."
              disabled={isLoading}
              className="flex-1"
              data-testid="input-chat-message"
            />
            <Button type="submit" disabled={isLoading || !input.trim()} data-testid="button-send-message">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
          
          {/* Starter prompts */}
          {messages.length === 1 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                "Show me assisted living in San Jose",
                "Memory care near Miami",
                "Compare costs in Denver vs Seattle"
              ].map((prompt, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setInput(prompt);
                    handleSendMessage();
                  }}
                  className="text-xs"
                  data-testid={`button-starter-${i}`}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t bg-muted/50">
          <p className="text-xs text-muted-foreground text-center">
            MySeniorValet Assistant • Search 33,834+ communities • Real-time pricing
          </p>
        </div>
      </Card>
    );
  }

  // Use real ChatKit when tokens are available  
  // Only render ChatKit component if we have a valid client_secret
  const hasValidClientSecret = sessionData?.client_secret && sessionData.client_secret.startsWith('ek_');
  
  if (!hasValidClientSecret) {
    return (
      <Card className={`relative overflow-hidden flex flex-col items-center justify-center ${className} ${isExpanded ? 'fixed inset-4 z-50' : 'h-[600px]'}`}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Connecting to ChatKit...</p>
      </Card>
    );
  }
  
  // Render the ChatKit wrapper with the client_secret
  return (
    <ChatKitWrapper 
      clientSecret={sessionData.client_secret}
      threadId={currentThreadId}
      className={className}
      onClose={onClose}
      onNewConversation={handleNewConversation}
    />
  );
}
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Send, Sparkles, Bot, User, MapPin, Building, BarChart3, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

interface CommunityResult {
  id: number;
  name: string;
  city: string;
  state: string;
  careTypes: string[];
  priceRange?: { min: number; max: number };
  availability?: string;
  photos?: string[];
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  communities?: CommunityResult[]; // For inline community cards
  toolType?: string; // Track what tool was used
}

interface MySeniorValetChatKitProps {
  category?: 'communities' | 'services' | 'healthcare' | 'resources' | 'vendors';
  onCategoryChange?: (category: string) => void;
  className?: string;
}

export function MySeniorValetChatKit({ 
  category = 'communities', 
  onCategoryChange,
  className = ''
}: MySeniorValetChatKitProps) {
  const [messages, setMessages] = useState<Message[]>([{
    id: 'welcome',
    role: 'assistant',
    content: "👋 Hi! I'm your MySeniorValet assistant. I can answer questions about senior care and help you find communities from our database of 33,000+ verified options. What would you like to know?",
    timestamp: new Date()
  }]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [assistantId, setAssistantId] = useState<string | null>(null);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  // Initialize session once on mount
  useEffect(() => {
    initializeSession();
  }, []);

  // Auto-scroll to bottom when messages change (only if near bottom)
  useEffect(() => {
    // Don't auto-scroll on initial load or if user has scrolled up
    if (messages.length > 1) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [messages]);

  // Initialize ChatKit session with thread
  const initializeSession = async () => {
    try {
      // Check if we have a stored thread ID
      const storedThreadId = localStorage.getItem('chatkit_thread_id');
      
      const response = await fetch('/api/chatkit/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thread_id: storedThreadId })
      });
      
      if (response.ok) {
        const data = await response.json();
        setThreadId(data.thread_id);
        setAssistantId(data.assistant_id);
        
        // Store thread ID for conversation persistence
        localStorage.setItem('chatkit_thread_id', data.thread_id);
        
        setSessionReady(true);
        
        console.log('✅ ChatKit session initialized:', data.thread_id);
      }
    } catch (error) {
      console.error('Failed to initialize ChatKit session:', error);
      toast({
        title: "Connection Error",
        description: "Failed to start chat session",
        variant: "destructive"
      });
    }
  };

  // Handle tool events from the assistant
  const handleToolEvent = (toolType: string, data: any, messageId: string) => {
    console.log(`🔧 Tool event: ${toolType}`, data);
    
    switch (toolType) {
      case 'SEARCH':
        // Handle search results - display community cards
        if (data.communities && data.communities.length > 0) {
          console.log(`Found ${data.communities.length} communities - adding to message`);
          
          // Add communities to the current message
          setMessages(prev =>
            prev.map(msg =>
              msg.id === messageId
                ? { ...msg, communities: data.communities, toolType: 'SEARCH' }
                : msg
            )
          );
        }
        break;
      
      case 'MAP':
        // Navigate to map with selected communities
        if (data.url) {
          toast({
            title: "Opening Map View",
            description: data.message || "Showing communities on map",
          });
          setTimeout(() => setLocation(data.url), 1000);
        }
        break;
      
      case 'DETAILS':
        // Navigate to community details page
        if (data.url) {
          toast({
            title: "Opening Community Details",
            description: data.message || "Loading community information",
          });
          setTimeout(() => setLocation(data.url), 1000);
        }
        break;
      
      case 'COMPARE':
        // Navigate to comparison tool
        if (data.url) {
          toast({
            title: "Opening Comparison Tool",
            description: data.message || "Comparing selected communities",
          });
          setTimeout(() => setLocation(data.url), 1000);
        }
        break;
      
      case 'DISCOVERY':
        // Handle Discovery Mode results - display community cards
        if (data.communities && data.communities.length > 0) {
          console.log(`Discovery Mode found ${data.communities.length} communities - adding to message`);
          
          // Add communities to the current message
          setMessages(prev =>
            prev.map(msg =>
              msg.id === messageId
                ? { ...msg, communities: data.communities, toolType: 'DISCOVERY' }
                : msg
            )
          );
        }
        break;
    }
  };

  // Handle sending messages with streaming
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !threadId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Create placeholder for assistant response
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      // Call streaming endpoint
      const response = await fetch('/api/chatkit/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputValue,
          thread_id: threadId
        })
      });

      if (!response.ok) {
        throw new Error('Stream request failed');
      }

      // Read the stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      let accumulatedText = '';
      let buffer = '';  // Buffer for handling partial chunks

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        // Decode the chunk
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        
        // Check for complete tool events
        const toolEventRegex = /\[TOOL:(\w+)\](.*?)\[\/TOOL:\1\]/;
        let hasMoreTools = true;
        
        while (hasMoreTools) {
          const match = toolEventRegex.exec(buffer);
          
          if (match) {
            const toolType = match[1];
            const toolDataStr = match[2];
            
            try {
              const toolData = JSON.parse(toolDataStr);
              handleToolEvent(toolType, toolData, assistantMessageId);
            } catch (e) {
              console.error('Failed to parse tool event:', e);
            }
            
            // Remove the processed tool event from buffer
            buffer = buffer.replace(match[0], '');
          } else {
            hasMoreTools = false;
          }
        }
        
        // Check if buffer contains partial tool event start
        const partialToolStart = /\[TOOL:\w+\]/.test(buffer);
        
        if (!partialToolStart) {
          // No partial tool events, add buffer to accumulated text
          accumulatedText += buffer;
          buffer = '';
        }

        // Update the assistant message with accumulated text
        setMessages(prev =>
          prev.map(msg =>
            msg.id === assistantMessageId
              ? { ...msg, content: accumulatedText, isStreaming: true }
              : msg
          )
        );
      }

      // Mark streaming as complete
      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMessageId
            ? { ...msg, isStreaming: false }
            : msg
        )
      );

      console.log('✅ Streaming complete');

    } catch (error) {
      console.error('Chat error:', error);
      
      // Remove the placeholder message and show error
      setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId));
      
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: "I encountered an issue. If this persists, try clicking 'New Chat' to start fresh.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      // If the error is about active runs, clear the session
      if (error instanceof Error && error.message.includes('active')) {
        console.log('🔄 Clearing stuck session');
        localStorage.removeItem('chatkit_thread_id');
        setThreadId(null);
        setTimeout(() => initializeSession(), 1000);
      }
      
      toast({
        title: "Connection Error",
        description: "Please try again or start a new chat",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Clear conversation
  const clearConversation = () => {
    localStorage.removeItem('chatkit_thread_id');
    setMessages([]);
    setThreadId(null);
    setAssistantId(null);
    initializeSession();
  };

  return (
    <Card className={`flex flex-col h-[600px] shadow-lg ${className}`} data-testid="chatkit-container">
      <CardHeader className="border-b bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-semibold text-lg">MySeniorValet Assistant</h3>
          </div>
          {threadId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearConversation}
              className="text-white hover:bg-white/20"
              data-testid="button-clear-chat"
            >
              New Chat
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        <div className="flex-1 overflow-y-auto p-4 max-h-full">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
                data-testid={`message-${message.role}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                
                <div
                  className={`max-w-[85%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                      : message.role === 'system'
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 border border-blue-200 dark:border-blue-800'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                    {message.isStreaming && (
                      <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse" />
                    )}
                  </p>
                  
                  {/* Inline community cards */}
                  {message.communities && message.communities.length > 0 && (
                    <div className="mt-3">
                      {/* Results header with count and map button */}
                      <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Found {message.communities.length} {message.communities.length === 1 ? 'community' : 'communities'}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Navigate to map with communities data
                            const communityIds = message.communities?.map(c => c.id).join(',') || '';
                            setLocation(`/map-search?communities=${communityIds}`);
                          }}
                          className="flex items-center gap-1 text-xs"
                        >
                          <MapPin className="w-3 h-3" />
                          Show on Map
                        </Button>
                      </div>
                      
                      {/* Scrollable community list */}
                      <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
                        {message.communities.map((community) => (
                          <button
                            key={community.id}
                            onClick={() => setLocation(`/community/${community.id}`)}
                            className="w-full text-left bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-400 transition-colors"
                            data-testid={`community-card-${community.id}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Building className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                                  {community.name}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                  {community.city}, {community.state}
                                </p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {community.careTypes?.slice(0, 2).map((type, idx) => (
                                    <span key={idx} className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded">
                                      {type}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            ))}
            
            {!sessionReady && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                <span className="ml-2 text-gray-500">Initializing chat...</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={
                sessionReady
                  ? "Ask a question or search for communities..."
                  : "Connecting..."
              }
              disabled={!sessionReady || isLoading}
              className="flex-1"
              data-testid="input-chat-message"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!sessionReady || isLoading || !inputValue.trim()}
              size="icon"
              className="bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              data-testid="button-send-message"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 mt-2 text-center">
            Powered by OpenAI • {threadId ? 'Conversation active' : 'Starting new chat'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

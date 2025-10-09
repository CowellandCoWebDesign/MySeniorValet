import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Sparkles, Bot, User, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Import inline components for rendering
import { CommunityCard } from './chatkit/CommunityCard';
import { CommunityMap } from './chatkit/CommunityMap';
import { ComparisonTable } from './chatkit/ComparisonTable';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  type?: 'text' | 'communities' | 'map' | 'comparison';
  data?: any;
  timestamp: Date;
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { toast } = useToast();

  // Initialize with welcome message - only on first mount
  useEffect(() => {
    setMessages([{
      id: '1',
      role: 'system',
      content: getGreetingMessage(category),
      timestamp: new Date()
    }]);
    
    // Initialize session only once when component mounts
    if (!sessionId) {
      initializeSession();
    }
  }, []); // Remove category dependency to maintain session
  
  // Update greeting when category changes but keep conversation
  useEffect(() => {
    if (sessionId && messages.length > 1) {
      // Add a system message about category change but keep history
      const categoryChangeMessage: Message = {
        id: Date.now().toString(),
        role: 'system',
        content: `Switching to ${category} search...`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, categoryChangeMessage]);
    }
  }, [category]);

  // Initialize ChatKit session
  const initializeSession = async () => {
    try {
      const response = await fetch('/api/chatkit/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category })
      });
      
      if (response.ok) {
        const data = await response.json();
        // Store session ID if returned
        if (data.sessionId || data.thread_id) {
          setSessionId(data.sessionId || data.thread_id);
        }
        setSessionReady(true);
      }
    } catch (error) {
      console.error('Failed to initialize ChatKit session:', error);
    }
  };

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Check if user is asking for a map view
      const isAskingForMap = inputValue.toLowerCase().includes('map') || 
                             inputValue.toLowerCase().includes('show') ||
                             inputValue.toLowerCase().includes('where');
      
      // If asking for map and we have previous results, show them on map
      if (isAskingForMap && messages.length > 0) {
        // Look for the last message with communities data
        const lastMessageWithCommunities = messages.filter(m => 
          m.data?.communities && m.data.communities.length > 0
        ).pop();
        
        if (lastMessageWithCommunities) {
          const mapMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `Here's the map view of the communities:`,
            type: 'map',
            data: { communities: lastMessageWithCommunities.data.communities },
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, mapMessage]);
          return; // Exit early since we're just showing map view
        }
      }
      
      // Use comprehensive search for communities
      if (category === 'communities') {
        const searchResponse = await fetch(`/api/search/comprehensive?q=${encodeURIComponent(inputValue)}&limit=10`);
        
        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          
          // Check if we found communities
          if (searchData.communities && searchData.communities.length > 0) {
            const resultMessage: Message = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: `I found ${searchData.totalFound || searchData.communities.length} communities matching "${inputValue}":`,
              type: 'communities',
              data: { 
                communities: searchData.communities,
                metadata: searchData.searchMetadata
              },
              timestamp: new Date()
            };
            
            setMessages(prev => [...prev, resultMessage]);
            
            // If discovery mode was triggered, show that info
            if (searchData.searchMetadata?.discoveryMode) {
              const discoveryMessage: Message = {
                id: (Date.now() + 2).toString(),
                role: 'system',
                content: searchData.searchMetadata.discoveryMessage || 'Discovery Mode activated to find new communities.',
                timestamp: new Date()
              };
              setMessages(prev => [...prev, discoveryMessage]);
            }
          } else {
            // No results found
            const noResultsMessage: Message = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: `I couldn't find any communities matching "${inputValue}". Try adjusting your search or using different keywords.`,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, noResultsMessage]);
          }
        } else {
          throw new Error('Search failed');
        }
      } else {
        // For other categories, use NLP search
        const response = await fetch('/api/nlp/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            query: inputValue,
            category,
            limit: 10
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: data.message || `Found ${data.results?.length || 0} results for "${inputValue}"`,
            type: 'text',
            data: data.results,
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, assistantMessage]);
        } else {
          throw new Error('Search failed');
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Connection Error",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get category-specific greeting
  function getGreetingMessage(cat: string): string {
    const greetings: Record<string, string> = {
      communities: "👋 Hi! I'm your MySeniorValet assistant. I can help you find the perfect senior living community from our database of 33,830+ verified communities. Try asking about specific locations, care types, or price ranges!",
      services: "👋 Hello! I can help you find senior care services in your area. What type of service do you need?",
      healthcare: "👋 Hi there! I can help you locate healthcare resources for seniors. What are you looking for?",
      resources: "👋 Welcome! I can provide information about senior resources, Medicare, and support programs. How can I help?",
      vendors: "👋 Hello! I can help you find products and equipment for senior care. What do you need?"
    };
    return greetings[cat] || greetings.communities;
  }

  // Get category-specific placeholder
  function getPlaceholder(cat: string): string {
    const placeholders: Record<string, string> = {
      communities: "Try: 'Memory care in Dallas under $5,000' or 'Pet-friendly near me'",
      services: "Try: 'Home health agencies near me'",
      healthcare: "Ask: 'Hospitals with geriatric units'",
      resources: "Try: 'Medicare Part B help'",
      vendors: "Search: 'Wheelchair rentals'"
    };
    return placeholders[cat] || placeholders.communities;
  }

  // Render message content based on type
  const renderMessageContent = (message: Message) => {
    switch (message.type) {
      case 'communities':
        if (message.data?.communities && message.data.communities.length > 0) {
          // Check if we have communities with valid coordinates for map
          const communitiesWithCoords = message.data.communities.filter((c: any) => 
            c.latitude && c.longitude
          );
          
          return (
            <div className="space-y-4">
              <p className="text-sm font-medium">{message.content}</p>
              <div className="grid gap-3">
                {message.data.communities.slice(0, 5).map((community: any) => (
                  <CommunityCard key={community.id} community={community} />
                ))}
              </div>
              {message.data.communities.length > 5 && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Showing 5 of {message.data.communities.length} results
                </p>
              )}
              {/* Show map if we have communities with coordinates */}
              {communitiesWithCoords.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">📍 View on Map:</p>
                  <CommunityMap communities={communitiesWithCoords} />
                </div>
              )}
            </div>
          );
        }
        break;

      case 'comparison':
        if (message.data?.communities && message.data.communities.length > 1) {
          return (
            <div className="space-y-4">
              <p className="text-sm font-medium">{message.content}</p>
              <ComparisonTable communities={message.data.communities} />
            </div>
          );
        }
        break;

      case 'map':
        if (message.data?.communities) {
          return (
            <div className="space-y-4">
              <p className="text-sm font-medium">{message.content}</p>
              <CommunityMap communities={message.data.communities} />
            </div>
          );
        }
        break;

      default:
        return <p className="text-sm whitespace-pre-wrap">{message.content}</p>;
    }

    return <p className="text-sm whitespace-pre-wrap">{message.content}</p>;
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const scrollArea = document.querySelector('.chat-scroll-area');
    if (scrollArea) {
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [messages]);

  return (
    <div className={`mysenirvalet-chatkit ${className}`}>
      <Card className="w-full shadow-2xl border-purple-200 dark:border-purple-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur">
        <CardHeader className="pb-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <h3 className="text-base font-semibold">MySeniorValet AI Assistant</h3>
            </div>
            <div className="flex items-center gap-1 text-xs bg-white/20 px-2 py-1 rounded-full">
              <Sparkles className="w-3 h-3" />
              <span>33,830+ Communities</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {/* Messages Area */}
          <ScrollArea className="h-[350px] p-4 chat-scroll-area">
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role !== 'user' && (
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'system' 
                        ? 'bg-purple-100 dark:bg-purple-900/30' 
                        : 'bg-gradient-to-r from-purple-600 to-blue-600'
                    }`}>
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[85%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                        : message.role === 'system'
                        ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-900 dark:text-purple-100 border border-purple-200 dark:border-purple-800'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    {renderMessageContent(message)}
                  </div>
                  
                  {message.role === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-2 justify-start">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Searching communities...
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          {/* Input Area */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-2"
            >
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={getPlaceholder(category)}
                disabled={isLoading}
                className="flex-1 bg-white dark:bg-gray-800"
                autoFocus
              />
              <Button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>
            
            {/* Quick Actions */}
            <div className="mt-2 flex flex-wrap gap-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">Try:</span>
              {[
                'Memory care Dallas',
                'Under $5000',
                'Pet-friendly',
                'Near me'
              ].map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 px-2"
                  onClick={() => {
                    setInputValue(suggestion);
                  }}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
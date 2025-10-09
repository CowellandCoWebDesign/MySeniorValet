import { useState, useEffect, useCallback } from 'react';
// @ts-ignore - ChatKit types not fully documented
import { ChatKit, useChatKit } from '@openai/chatkit-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, MessageCircle, Sparkles, Home, Heart, Users, Stethoscope, ShoppingBag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import './chatkit-styles.css'; // Custom styles

// Import inline components for rendering
import { CommunityCard } from './chatkit/CommunityCard';
import { CommunityMap } from './chatkit/CommunityMap';
import { ComparisonTable } from './chatkit/ComparisonTable';

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
  const [isLoading, setIsLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const { toast } = useToast();
  
  // ChatKit hook with custom configuration
  const { control } = useChatKit({
    api: {
      async getClientSecret(existing: any) {
        try {
          setIsLoading(true);
          
          // If we have an existing token and it's still valid, return it
          if (existing && sessionToken) {
            return sessionToken;
          }
          
          // Create new session
          const response = await fetch('/api/chatkit/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category })
          });
          
          if (!response.ok) {
            throw new Error('Failed to create ChatKit session');
          }
          
          const data = await response.json();
          setSessionToken(data.client_secret);
          return data.client_secret;
        } catch (error) {
          console.error('❌ ChatKit session error:', error);
          toast({
            title: "Connection Error",
            description: "Unable to connect to AI assistant. Please try again.",
            variant: "destructive"
          });
          throw error;
        } finally {
          setIsLoading(false);
        }
      }
    },
    // Event handlers for custom rendering
    onMessage: (message: any) => {
      // Handle tool responses and custom rendering
      console.log('ChatKit message:', message);
      // Check if this is a tool response with custom rendering
      if (message.type === 'tool_response') {
        const { tool_name, result } = message;
        
        switch (tool_name) {
          case 'search_communities':
            if (result?.communities && result.communities.length > 0) {
              return (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Found {result.totalFound} communities matching your search:
                  </p>
                  <div className="grid gap-4">
                    {result.communities.map((community: any) => (
                      <CommunityCard key={community.id} community={community} />
                    ))}
                  </div>
                  {result.communities.length > 3 && (
                    <CommunityMap communities={result.communities} />
                  )}
                </div>
              );
            }
            break;
            
          case 'compare_communities':
            if (result?.communities && result.communities.length > 1) {
              return <ComparisonTable communities={result.communities} />;
            }
            break;
            
          case 'check_availability':
            if (result) {
              return (
                <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                    Availability Check: {result.communityName}
                  </h4>
                  <p className="text-green-700 dark:text-green-300">
                    {result.message}
                  </p>
                  {result.available && (
                    <Button 
                      className="mt-3" 
                      variant="default"
                      onClick={() => window.location.href = `/community/${result.communityId}`}
                    >
                      View Details & Schedule Tour
                    </Button>
                  )}
                </Card>
              );
            }
            break;
            
          case 'schedule_tour':
            if (result?.success) {
              return (
                <Card className="p-4 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                  <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                    ✅ Tour Scheduled!
                  </h4>
                  <p className="text-purple-700 dark:text-purple-300">
                    {result.message}
                  </p>
                  <p className="text-sm text-purple-600 dark:text-purple-400 mt-2">
                    Confirmation: {result.confirmationNumber}
                  </p>
                  <Button 
                    className="mt-3" 
                    variant="default"
                    onClick={() => window.location.href = `/community/${result.communityId}`}
                  >
                    View Community Details
                  </Button>
                </Card>
              );
            }
            break;
        }
      }
    }
  }) as any; // Type assertion for incomplete ChatKit types

  // Get category-specific greeting
  function getGreetingMessage(cat: string): string {
    const greetings: Record<string, string> = {
      communities: "👋 Hi! I'm your MySeniorValet assistant. I can help you find the perfect senior living community from our database of 33,830+ verified communities. What are you looking for?",
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
      communities: "Ask me anything: 'Memory care in Dallas under $5,000' or 'Pet-friendly assisted living near me'",
      services: "Try: 'Home health agencies near me' or 'Adult day programs in Phoenix'",
      healthcare: "Ask: 'Hospitals with geriatric units' or 'VA facilities in California'",
      resources: "Try: 'How does Medicare Part B work?' or 'Financial assistance for seniors'",
      vendors: "Search: 'Wheelchair rentals' or 'Medical alert systems'"
    };
    return placeholders[cat] || placeholders.communities;
  }

  // Category icons
  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'communities': return <Home className="w-4 h-4" />;
      case 'services': return <Heart className="w-4 h-4" />;
      case 'healthcare': return <Stethoscope className="w-4 h-4" />;
      case 'resources': return <Users className="w-4 h-4" />;
      case 'vendors': return <ShoppingBag className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className={`mysenirvalet-chatkit ${className}`}>
      {/* Category selector (optional, if you want to switch contexts) */}
      {onCategoryChange && (
        <div className="flex gap-2 mb-4 justify-center">
          {['communities', 'services', 'healthcare', 'resources', 'vendors'].map((cat) => (
            <Button
              key={cat}
              variant={category === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => onCategoryChange(cat)}
              className="capitalize"
            >
              {getCategoryIcon(cat)}
              <span className="ml-2">{cat}</span>
            </Button>
          ))}
        </div>
      )}
      
      {/* ChatKit Component */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Connecting to AI assistant...
              </p>
            </div>
          </div>
        )}
        
        <ChatKit 
          control={control}
          className="h-[600px] w-full rounded-lg border border-purple-200 dark:border-purple-800 shadow-xl"
        />
      </div>
      
      {/* Powered by badge */}
      <div className="mt-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-white text-xs font-medium">
          <Sparkles className="w-3 h-3" />
          Powered by OpenAI + MySeniorValet Database (33,830+ Communities)
        </div>
      </div>
    </div>
  );
}
/**
 * Natural Language Search Bar Component
 * Wave 1 Enhancement: Natural language query understanding
 * 
 * Allows users to search using natural phrases like:
 * - "Memory care under $3,000 in Dallas with good reviews"
 * - "HUD housing near Miami for veterans"
 * - "Pet-friendly assisted living with pool in California"
 */

import { useState, useCallback } from 'react';
import { Search, Sparkles, Brain, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useNavigate } from 'wouter';

interface ParsedIntent {
  careTypes?: string[];
  priceRange?: { min?: number; max?: number };
  location?: { city?: string; state?: string; radius?: number };
  amenities?: string[];
  requiresHighQuality?: boolean;
  requiresVerified?: boolean;
  availability?: string;
  isVeteran?: boolean;
  needsHUD?: boolean;
}

interface NaturalLanguageSearchBarProps {
  onSearchResults?: (results: any[]) => void;
  className?: string;
}

export function NaturalLanguageSearchBar({ 
  onSearchResults, 
  className = "" 
}: NaturalLanguageSearchBarProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [parsedIntent, setParsedIntent] = useState<ParsedIntent | null>(null);
  const [explanation, setExplanation] = useState<string>('');
  const { toast } = useToast();
  const [, navigate] = useNavigate();

  const exampleQueries = [
    "Memory care under $3,000 in Dallas",
    "HUD housing near Miami for veterans", 
    "Pet-friendly assisted living with pool",
    "5-star nursing homes in California",
    "Available now independent living under $2,500"
  ];

  const handleSearch = useCallback(async () => {
    if (!query.trim()) {
      toast({
        title: "Please enter a search query",
        description: "Try something like: 'Memory care in Dallas under $3,000'",
        variant: "default"
      });
      return;
    }

    setIsSearching(true);
    setParsedIntent(null);
    setExplanation('');

    try {
      const response = await apiRequest('POST', '/api/natural-language/search', {
        query: query.trim()
      });

      const data = await response.json();

      if (data.success) {
        setParsedIntent(data.parsed);
        setExplanation(data.explanation);

        // Show what we understood
        toast({
          title: "🧠 AI Understanding",
          description: data.explanation,
          duration: 3000
        });

        // If we have results, pass them to parent or navigate
        if (data.results && data.results.length > 0) {
          if (onSearchResults) {
            onSearchResults(data.results);
          } else {
            // Navigate to map search with the parsed filters
            const searchParams = new URLSearchParams();
            searchParams.set('q', query);
            searchParams.set('nlp', 'true');
            if (data.parsed.careTypes) {
              searchParams.set('types', data.parsed.careTypes.join(','));
            }
            if (data.parsed.location?.city) {
              searchParams.set('city', data.parsed.location.city);
            }
            if (data.parsed.location?.state) {
              searchParams.set('state', data.parsed.location.state);
            }
            if (data.parsed.priceRange?.max) {
              searchParams.set('maxPrice', data.parsed.priceRange.max.toString());
            }
            navigate(`/map-search?${searchParams.toString()}`);
          }

          toast({
            title: `Found ${data.resultCount} communities!`,
            description: `Search method: ${data.searchMethod === 'weaviate' ? 'AI Semantic Search' : 'Database Search'}`,
            duration: 3000
          });
        } else {
          toast({
            title: "No results found",
            description: "Try adjusting your search criteria",
            variant: "default"
          });
        }
      } else {
        throw new Error(data.error || 'Search failed');
      }
    } catch (error) {
      console.error('Natural language search error:', error);
      toast({
        title: "Search failed",
        description: "Please try again or use the regular search",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  }, [query, onSearchResults, navigate, toast]);

  const handleExampleClick = (example: string) => {
    setQuery(example);
    // Auto-search after setting example
    setTimeout(() => {
      const searchButton = document.getElementById('nlp-search-button');
      searchButton?.click();
    }, 100);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Brain className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-500" />
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Ask naturally: 'Memory care under $3,000 in Dallas with good reviews'"
              className="pl-10 pr-4 h-12 text-base border-2 border-purple-200 dark:border-purple-800 focus:border-purple-500"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Badge variant="outline" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                <Sparkles className="h-3 w-3 mr-1" />
                AI-Powered
              </Badge>
            </div>
          </div>
          <Button
            id="nlp-search-button"
            onClick={handleSearch}
            disabled={isSearching}
            className="h-12 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isSearching ? (
              <>
                <Zap className="h-5 w-5 mr-2 animate-pulse" />
                Understanding...
              </>
            ) : (
              <>
                <Search className="h-5 w-5 mr-2" />
                Search
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Example Queries */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-muted-foreground">Try:</span>
        {exampleQueries.map((example, index) => (
          <button
            key={index}
            onClick={() => handleExampleClick(example)}
            className="text-sm px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors cursor-pointer"
          >
            {example}
          </button>
        ))}
      </div>

      {/* Parsed Intent Display (for debugging/transparency) */}
      {parsedIntent && explanation && (
        <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-4 w-4 text-purple-600" />
            <span className="font-semibold text-purple-700 dark:text-purple-300">AI Understanding:</span>
          </div>
          <p className="text-sm text-purple-600 dark:text-purple-400">{explanation}</p>
          
          {/* Show parsed elements */}
          <div className="mt-3 flex flex-wrap gap-2">
            {parsedIntent.careTypes?.map(type => (
              <Badge key={type} variant="secondary" className="text-xs">
                {type.replace(/_/g, ' ')}
              </Badge>
            ))}
            {parsedIntent.priceRange && (
              <Badge variant="secondary" className="text-xs">
                {parsedIntent.priceRange.max ? `Under $${parsedIntent.priceRange.max}` : 
                 parsedIntent.priceRange.min ? `Over $${parsedIntent.priceRange.min}` : ''}
              </Badge>
            )}
            {parsedIntent.location?.city && (
              <Badge variant="secondary" className="text-xs">
                📍 {parsedIntent.location.city}
                {parsedIntent.location.state && `, ${parsedIntent.location.state}`}
              </Badge>
            )}
            {parsedIntent.requiresHighQuality && (
              <Badge variant="secondary" className="text-xs">⭐ High Rated</Badge>
            )}
            {parsedIntent.needsHUD && (
              <Badge variant="secondary" className="text-xs">🏛️ HUD/Affordable</Badge>
            )}
            {parsedIntent.isVeteran && (
              <Badge variant="secondary" className="text-xs">🎖️ Veterans</Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
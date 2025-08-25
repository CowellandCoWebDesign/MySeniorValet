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
import { Search, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

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
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const exampleQueries = [
    "Memory care under $3,000 in Dallas",
    "HUD housing near Miami", 
    "5-star nursing homes in California",
    "Available now under $2,500"
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

    try {
      const response = await fetch('/api/natural-language/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query.trim() })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Show what we understood
        toast({
          title: "🧠 Search Complete",
          description: `Found ${data.resultCount || 0} communities matching your criteria`,
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
            if (data.parsed?.careTypes) {
              searchParams.set('types', data.parsed.careTypes.join(','));
            }
            if (data.parsed?.location?.city) {
              searchParams.set('city', data.parsed.location.city);
            }
            if (data.parsed?.location?.state) {
              searchParams.set('state', data.parsed.location.state);
            }
            if (data.parsed?.priceRange?.max) {
              searchParams.set('maxPrice', data.parsed.priceRange.max.toString());
            }
            navigate(`/map-search?${searchParams.toString()}`);
          }
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
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Search Bar */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Try: 'Memory care under $3,000 in Dallas' or 'HUD housing in Miami'"
              className="pl-4 pr-32 h-12 text-base border-2 border-purple-200 dark:border-purple-800 focus:border-purple-500 rounded-lg"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <Badge variant="outline" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                AI-Powered
              </Badge>
            </div>
          </div>
          <Button
            onClick={handleSearch}
            disabled={isSearching}
            className="h-12 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg"
          >
            {isSearching ? (
              <span>Searching...</span>
            ) : (
              <>
                <Search className="h-5 w-5 mr-2" />
                Search
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Example Queries - Simpler Display */}
      <div className="flex flex-wrap gap-2 justify-center">
        <span className="text-xs text-muted-foreground">Quick examples:</span>
        {exampleQueries.map((example, index) => (
          <button
            key={index}
            onClick={() => handleExampleClick(example)}
            className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors cursor-pointer"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
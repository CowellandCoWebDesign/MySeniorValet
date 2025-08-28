import { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, Brain, Globe, MapPin, Building, TrendingUp, X, Clock, TrendingDown, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useDebounce } from '@/hooks/use-debounce';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchResult {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  careTypes?: string[];
  price?: string;
  type: 'community' | 'service' | 'resource' | 'location';
  confidence?: number;
  source?: string;
}

interface UnifiedSearchResponse {
  results: SearchResult[];
  metadata: {
    totalResults: number;
    searchTime: number;
    intent: string;
    confidence: number;
    sourcesUsed: string[];
  };
  suggestions?: string[];
  relatedSearches?: string[];
  aiInsights?: {
    summary?: string;
    recommendations?: string[];
  };
}

interface UnifiedSearchProps {
  onSearch?: (query: string, results: any[]) => void;
  initialQuery?: string;
  autoFocus?: boolean;
  showDropdownResults?: boolean;
  placeholder?: string;
  className?: string;
}

export function UnifiedSearch({ 
  onSearch, 
  initialQuery = '', 
  autoFocus = false,
  showDropdownResults = true,
  placeholder = "Search by city, state, community name, or ask a question...",
  className = ""
}: UnifiedSearchProps = {}) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [metadata, setMetadata] = useState<UnifiedSearchResponse['metadata'] | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [aiInsights, setAiInsights] = useState<UnifiedSearchResponse['aiInsights']>();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 300);
  const [, setLocation] = useLocation();
  
  // Popular search suggestions
  const popularSearches = [
    { text: "Memory care under $5000", icon: Brain },
    { text: "HUD housing California", icon: Building },
    { text: "Pet friendly assisted living", icon: Sparkles },
    { text: "New York senior communities", icon: MapPin },
    { text: "Affordable Texas nursing homes", icon: TrendingDown },
  ];
  
  // Update query when initialQuery prop changes
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Fetch suggestions as user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery && debouncedQuery.length >= 2) {
        try {
          const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(debouncedQuery)}`);
          if (response.ok) {
            const data = await response.json();
            setSuggestions(data.suggestions || []);
            setShowSuggestions(true);
          }
        } catch (err) {
          console.error('Failed to fetch suggestions:', err);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };
    
    fetchSuggestions();
  }, [debouncedQuery]);

  // Enhanced search function supporting natural language
  const performSearch = async (searchQuery?: string) => {
    const queryToSearch = searchQuery || query;
    
    if (!queryToSearch || queryToSearch.length < 2) {
      setResults([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setShowSuggestions(false);
    
    try {
      // Try natural language search first for complex queries
      const isComplexQuery = queryToSearch.includes(' ') || 
                            queryToSearch.toLowerCase().includes('under') ||
                            queryToSearch.toLowerCase().includes('cheap') ||
                            queryToSearch.toLowerCase().includes('near') ||
                            queryToSearch.toLowerCase().includes('?');
      
      const endpoint = isComplexQuery ? '/api/natural-language/search' : '/api/search/unified';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryToSearch })
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      
      // Handle both natural language and unified search responses
      let searchResults = [];
      if (data.results) {
        searchResults = data.results;
      } else if (data.communities) {
        searchResults = data.communities;
      } else if (data.searchResults?.communities) {
        searchResults = data.searchResults.communities;
      }
      
      setResults(searchResults);
      setMetadata(data.metadata || data.searchMetadata || data.parsed || null);
      setAiInsights(data.aiInsights || data.insights || data.analysis);
      
      // Call the onSearch callback if provided
      if (onSearch) {
        onSearch(queryToSearch, searchResults);
      }
      
    } catch (err) {
      console.error('Search error:', err);
      setError('Search is temporarily unavailable');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  };
  
  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    performSearch(suggestion);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSourceIcon = (source?: string) => {
    switch (source) {
      case 'ai': return <Brain className="w-3 h-3" />;
      case 'semantic': return <Sparkles className="w-3 h-3" />;
      case 'web': return <Globe className="w-3 h-3" />;
      case 'predictive': return <TrendingUp className="w-3 h-3" />;
      default: return <Building className="w-3 h-3" />;
    }
  };

  const getIntentBadge = (intent?: string | any) => {
    if (!intent || typeof intent !== 'string') return null;
    
    const intentColors: Record<string, string> = {
      navigation: 'bg-blue-500',
      information: 'bg-green-500',
      comparison: 'bg-purple-500',
      pricing: 'bg-yellow-500',
      availability: 'bg-cyan-500',
      emergency: 'bg-red-500'
    };

    return (
      <Badge className={`${intentColors[intent] || 'bg-gray-500'} text-white text-xs`}>
        {intent.charAt(0).toUpperCase() + intent.slice(1)} Search
      </Badge>
    );
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-4xl mx-auto">
      {/* Unified Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <Input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            // Clear results if input is cleared
            if (e.target.value === '') {
              setResults([]);
              setShowSuggestions(false);
              // Notify parent component about the clear
              if (onSearch) {
                onSearch('', []);
              }
            }
          }}
          onKeyPress={handleKeyPress}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          className={`pl-10 pr-32 py-6 text-lg bg-white/95 backdrop-blur-sm border-2 border-purple-200 focus:border-purple-500 rounded-xl ${className}`}
          autoFocus={autoFocus}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-2">
          {isLoading ? (
            <div className="animate-spin h-5 w-5 border-2 border-purple-500 border-t-transparent rounded-full" />
          ) : (
            <Button
              onClick={performSearch}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg px-4 py-2"
            >
              <Search className="h-4 w-4 mr-1" />
              Search
            </Button>
          )}
        </div>
      </div>

      {/* Real-time Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-purple-200 overflow-hidden max-h-96"
          >
            {/* Popular Searches - Show when query is empty */}
            {query.length === 0 && popularSearches.length > 0 && (
              <div className="p-4">
                <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-500" />
                  Popular Searches
                </p>
                <div className="space-y-2">
                  {popularSearches.map((search, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(search.text)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-purple-50 transition-colors flex items-center gap-2 group"
                    >
                      <search.icon className="w-4 h-4 text-purple-400 group-hover:text-purple-600" />
                      <span className="text-sm text-gray-700 group-hover:text-purple-900">{search.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Suggestions from backend */}
            {query.length > 0 && suggestions.length > 0 && (
              <div className="p-4">
                <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  Suggestions
                </p>
                <div className="space-y-1">
                  {suggestions.slice(0, 5).map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-purple-50 transition-colors group"
                    >
                      <span className="text-sm text-gray-700 group-hover:text-purple-900">{suggestion}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      {error && (
        <div className="absolute z-50 w-full mt-2 p-4 bg-red-50 rounded-xl border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}
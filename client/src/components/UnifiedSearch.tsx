import { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, Brain, Globe, MapPin, Building, TrendingUp, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useDebounce } from '@/hooks/use-debounce';
import { Link } from 'wouter';
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

export function UnifiedSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [metadata, setMetadata] = useState<UnifiedSearchResponse['metadata'] | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [aiInsights, setAiInsights] = useState<UnifiedSearchResponse['aiInsights']>();
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  // Manual search function - only triggered by user action
  const performSearch = async () => {
    if (!query || query.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/search/unified', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      
      // Handle both 'results' and 'communities' field names
      const searchResults = data.results || data.communities || [];
      setResults(searchResults);
      setMetadata(data.metadata || data.searchMetadata || null);
      setSuggestions(data.suggestions || []);
      setAiInsights(data.aiInsights || data.insights);
      setShowResults(true);
    } catch (err) {
      console.error('Unified search error:', err);
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

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    // Wait for state update then search
    setTimeout(() => performSearch(), 0);
  };

  const getSourceIcon = (source?: string) => {
    switch (source) {
      case 'ai': return <Brain className="w-3 h-3" />;
      case 'semantic': return <Sparkles className="w-3 h-3" />;
      case 'web': return <Globe className="w-3 h-3" />;
      case 'predictive': return <TrendingUp className="w-3 h-3" />;
      default: return <Building className="w-3 h-3" />;
    }
  };

  const getIntentBadge = (intent?: string) => {
    if (!intent) return null;
    
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
              setShowResults(false);
            }
          }}
          onKeyPress={handleKeyPress}
          placeholder="Ask anything: locations, care types, pricing, availability, services..."
          className="pl-10 pr-32 py-6 text-lg bg-white/95 backdrop-blur-sm border-2 border-purple-200 focus:border-purple-500 rounded-xl"
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

      {/* Real-time Results Dropdown */}
      <AnimatePresence>
        {showResults && (results.length > 0 || suggestions.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
          >
            {/* Search Metadata */}
            {metadata && (
              <div className="px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getIntentBadge(metadata.intent)}
                    <span className="text-xs text-gray-600">
                      {metadata.totalResults} results in {metadata.searchTime.toFixed(2)}s
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {metadata.sourcesUsed.map(source => (
                      <span key={source} className="text-xs text-gray-500 flex items-center gap-1">
                        {getSourceIcon(source)}
                        {source}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* AI Insights */}
            {aiInsights?.summary && (
              <div className="px-4 py-3 bg-blue-50 border-b border-blue-200">
                <div className="flex items-start gap-2">
                  <Brain className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-700">{aiInsights.summary}</p>
                    {aiInsights.recommendations && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {aiInsights.recommendations.map((rec, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {rec}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Search Results */}
            <div className="max-h-96 overflow-y-auto">
              {results.map((result) => (
                <Link
                  key={result.id}
                  href={result.type === 'community' ? `/community/${result.id}` : '#'}
                >
                  <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{result.name}</h4>
                          {result.confidence && result.confidence > 0.8 && (
                            <Badge className="bg-green-100 text-green-700 text-xs">
                              High Match
                            </Badge>
                          )}
                        </div>
                        {result.address && (
                          <p className="text-sm text-gray-600 mt-1">
                            <MapPin className="inline w-3 h-3 mr-1" />
                            {result.address}, {result.city}, {result.state}
                          </p>
                        )}
                        {result.careTypes && result.careTypes.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {result.careTypes.slice(0, 3).map((type) => (
                              <Badge key={type} variant="secondary" className="text-xs">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      {result.price && (
                        <div className="text-right">
                          <p className="font-semibold text-green-600">{result.price}</p>
                          <p className="text-xs text-gray-500">per month</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                <p className="text-xs text-gray-600 mb-2">Try searching for:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs"
                    >
                      {suggestion}
                    </Button>
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
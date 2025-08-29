/**
 * COMPREHENSIVE SEARCH COMPONENT - Zillow-level Search
 * Handles ALL search types: natural language, locations, companies, prices
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Brain, Sparkles, MessageCircle, Loader2, MapPin, DollarSign, Building } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { MascotLoadingDisplay } from './MascotLoadingDisplay';

interface SearchResult {
  communities: any[];
  totalResults: number;
  searchMetadata: {
    query: string;
    searchType: string;
    processingTime: number;
    suggestions?: string[];
  };
  facets: {
    states: { name: string; count: number }[];
    careTypes: { name: string; count: number }[];
    priceRanges: { range: string; count: number }[];
  };
}

interface ComprehensiveSearchProps {
  onSearch: (results: SearchResult) => void;
  onQueryChange?: (query: string) => void;
  initialQuery?: string;
  placeholder?: string;
  className?: string;
  showSuggestions?: boolean;
}

export function ComprehensiveSearch({ 
  onSearch,
  onQueryChange,
  initialQuery = '',
  placeholder = "🔍 Search communities, cities, companies, or ask anything... ✨",
  className = "",
  showSuggestions = true
}: ComprehensiveSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestionDropdown, setShowSuggestionDropdown] = useState(false);
  const [searchType, setSearchType] = useState<string>('general');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Detect search type based on query
  const detectSearchType = useCallback((query: string) => {
    const lowerQuery = query.toLowerCase().trim();
    
    if (!lowerQuery) return 'general';
    
    // Company search
    const companyKeywords = ['atria', 'brookdale', 'sunrise', 'brightview'];
    if (companyKeywords.some(company => lowerQuery.includes(company))) {
      return 'company';
    }
    
    // Location search
    if (lowerQuery.match(/^[a-zA-Z\s]+(,\s*[A-Z]{2})?$/) || lowerQuery.includes(' in ') || lowerQuery.includes(' near ')) {
      return 'location';
    }
    
    // Price search
    if (lowerQuery.includes('$') || lowerQuery.includes('under') || lowerQuery.includes('cheap') || lowerQuery.includes('affordable')) {
      return 'price';
    }
    
    // Care type search
    const careTypes = ['assisted living', 'memory care', 'independent living', 'nursing home'];
    if (careTypes.some(type => lowerQuery.includes(type))) {
      return 'careType';
    }
    
    // Natural language / research
    const researchKeywords = ['what', 'how', 'why', 'best', 'compare', 'recommend'];
    if (researchKeywords.some(keyword => lowerQuery.includes(keyword)) || lowerQuery.includes('?')) {
      return 'naturalLanguage';
    }
    
    return 'general';
  }, []);

  // Handle input changes
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onQueryChange?.(value);
    
    const detectedType = detectSearchType(value);
    setSearchType(detectedType);
    
    // Get suggestions if query is long enough
    if (value.length >= 2 && showSuggestions) {
      try {
        const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(value)}`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.suggestions || []);
          setShowSuggestionDropdown(true);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    } else {
      setShowSuggestionDropdown(false);
    }
  };

  // Handle search execution
  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setShowSuggestionDropdown(false);
    
    try {
      const response = await fetch('/api/search/comprehensive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          limit: 100,
          offset: 0
        })
      });
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const result = await response.json();
      
      // Process metadata to include fallback information
      if (result.searchMetadata) {
        result.metadata = {
          ...result.searchMetadata,
          fallbackApplied: result.searchMetadata.fallbackApplied,
          fallbackMessage: result.searchMetadata.fallbackMessage,
          originalResultCount: result.searchMetadata.originalFiltersRequested ? 0 : result.totalResults,
          searchLocation: extractLocationFromQuery(searchQuery)
        };
      }
      
      onSearch(result);
      
    } catch (error) {
      console.error('Search error:', error);
      // Provide fallback empty result
      onSearch({
        communities: [],
        totalResults: 0,
        searchMetadata: {
          query: searchQuery,
          searchType: 'error',
          processingTime: 0,
          suggestions: []
        },
        facets: {
          states: [],
          careTypes: [],
          priceRanges: []
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestionDropdown(false);
    handleSearch(suggestion);
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestionDropdown(false);
    }
  };

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestionDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get search type icon and color with emojis
  const getSearchTypeIndicator = () => {
    switch (searchType) {
      case 'location':
        return { icon: MapPin, color: 'text-blue-500', label: '📍 Location', emoji: '🗺️' };
      case 'company':
        return { icon: Building, color: 'text-purple-500', label: '🏢 Company', emoji: '🏢' };
      case 'price':
        return { icon: DollarSign, color: 'text-green-500', label: '💰 Price', emoji: '💵' };
      case 'careType':
        return { icon: Brain, color: 'text-orange-500', label: '🧠 Care Type', emoji: '🏥' };
      case 'naturalLanguage':
        return { icon: MessageCircle, color: 'text-pink-500', label: '🤖 AI Research', emoji: '✨' };
      default:
        return { icon: Search, color: 'text-gray-500', label: '🔍 General', emoji: '🔎' };
    }
  };

  const searchIndicator = getSearchTypeIndicator();
  const SearchIcon = searchIndicator.icon;

  // Helper function to extract location from search query
  const extractLocationFromQuery = (query: string) => {
    const locationKeywords = ['in', 'near', 'at'];
    for (const keyword of locationKeywords) {
      const index = query.toLowerCase().indexOf(keyword);
      if (index !== -1) {
        return query.substring(index + keyword.length).trim();
      }
    }
    // If no location keyword, check if query looks like a location
    if (query.match(/^[a-zA-Z\s]+(,\s*[A-Z]{2})?$/)) {
      return query;
    }
    return null;
  };

  // Show loading overlay when searching
  if (isLoading) {
    return (
      <div className={`relative w-full ${className}`}>
        {/* Search input (disabled) */}
        <form onSubmit={handleSubmit} className="relative mb-4">
          <div className="relative flex items-center">
            <Input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder={placeholder}
              className="w-full pl-12 pr-20 py-4 text-lg border-2 border-gray-300 dark:border-gray-600 
                       rounded-xl bg-gray-100 dark:bg-gray-700 
                       shadow-lg transition-all duration-200
                       placeholder:text-gray-500 dark:placeholder:text-gray-400"
              disabled={true}
            />
            <div className="absolute left-4 flex items-center">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <Button
              type="submit"
              disabled={true}
              className="absolute right-2 px-4 py-2 bg-gray-400 dark:bg-gray-600
                       text-white rounded-lg"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
            </Button>
          </div>
        </form>

        {/* Loading Display with Thinker */}
        <MascotLoadingDisplay 
          title="Deep in Thought..."
          subtitle={`Contemplating 32,970+ communities for "${query}"`}
          showProgress={true}
          progressDuration={8}
          factRotationSpeed={3000}
          compact={false}
          processStages={[
            "Searching official websites for photos",
            "Scanning social media and listings", 
            "Analyzing image quality and authenticity",
            "Verifying photo sources and ownership",
            "Organizing visual content library"
          ]}
        />
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            className="w-full pl-16 pr-32 py-5 text-lg border-3 border-purple-400 dark:border-purple-600 
                     rounded-2xl bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900
                     focus:border-purple-500 dark:focus:border-purple-400 focus:from-white focus:to-blue-50
                     shadow-xl hover:shadow-2xl transition-all duration-300
                     placeholder:text-gray-600 dark:placeholder:text-gray-400 font-medium"
            disabled={isLoading}
          />
          
          {/* Rich Search type indicator with emoji */}
          <div className="absolute left-3 flex items-center gap-2">
            <span className="text-2xl animate-pulse">{searchIndicator.emoji}</span>
            <SearchIcon className={`w-5 h-5 ${searchIndicator.color}`} />
          </div>
          
          {/* Search type badge */}
          {query && (
            <Badge className="absolute left-16 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 text-xs">
              {searchIndicator.label}
            </Badge>
          )}
          
          {/* Enhanced Search button with emojis */}
          <Button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="absolute right-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-blue-600 
                     hover:from-purple-700 hover:to-blue-700 
                     disabled:from-gray-400 disabled:to-gray-500
                     text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200
                     font-bold flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">🔄</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span className="text-sm">✨</span>
                <span className="hidden sm:inline text-sm">SEARCH</span>
                <span className="text-sm">🚀</span>
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {showSuggestionDropdown && suggestions.length > 0 && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 -mt-2 bg-white dark:bg-gray-800 
                     border border-gray-200 dark:border-gray-700 rounded-b-xl rounded-t-none shadow-xl z-50 
                     max-h-80 overflow-y-auto border-t-0"
          >
            {suggestions.map((suggestion, index) => {
              // Determine emoji based on suggestion content
              const getSuggestionEmoji = () => {
                const lower = suggestion.toLowerCase();
                if (lower.includes('cheap') || lower.includes('affordable') || lower.includes('$')) return '💰';
                if (lower.includes('near') || lower.includes('location')) return '📍';
                if (lower.includes('memory') || lower.includes('dementia')) return '🧠';
                if (lower.includes('assisted') || lower.includes('care')) return '🏥';
                if (lower.includes('luxury') || lower.includes('premium')) return '💎';
                if (lower.includes('pet') || lower.includes('animal')) return '🐕';
                return '🔍';
              };
              
              return (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-3 text-left hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 
                           dark:hover:from-gray-700 dark:hover:to-gray-800
                           transition-all duration-150 first:rounded-t-xl last:rounded-b-xl
                           border-b border-gray-100 dark:border-gray-700 last:border-b-0 group"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg group-hover:scale-125 transition-transform">{getSuggestionEmoji()}</span>
                    <Search className="w-4 h-4 text-gray-400 group-hover:text-purple-500" />
                    <span className="text-gray-900 dark:text-gray-100 font-medium group-hover:text-purple-600 dark:group-hover:text-purple-400">
                      {suggestion}
                    </span>
                    <span className="ml-auto text-sm opacity-0 group-hover:opacity-100 transition-opacity">✨</span>
                  </div>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  );
}

export default ComprehensiveSearch;
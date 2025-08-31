import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Brain, Sparkles, MessageCircle, Loader2, MapPin, Home, Building, Building2, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';

interface AutoExpandingSearchProps {
  onSearch: (query: string, isResearchMode?: boolean) => void;
  onQueryChange?: (query: string) => void;
  onFocusChange?: (focused: boolean) => void;
  initialQuery?: string;
  placeholder?: string;
  className?: string;
}

export function AutoExpandingSearch({ 
  onSearch, 
  onQueryChange,
  onFocusChange,
  initialQuery = '',
  placeholder = "Search communities or ask anything...",
  className = ""
}: AutoExpandingSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isResearchMode, setIsResearchMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;
    const lineHeight = 24; // Approximate line height in pixels
    const maxHeight = lineHeight * 8; // Max 8 lines
    
    textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    
    // Auto-expand if content is getting longer
    if (scrollHeight > lineHeight * 2 && !isExpanded) {
      setIsExpanded(true);
    }
  }, [isExpanded]);

  // Detect Research mode based on query content
  const detectResearchMode = useCallback((text: string) => {
    const researchTriggers = [
      'what', 'how', 'why', 'when', 'where', 'which',
      'tell me', 'explain', 'compare', 'recommend', 'suggest',
      'best', 'worst', 'cheapest', 'most expensive',
      'difference between', 'pros and cons', 'versus', 'vs',
      '?'
    ];
    
    const lowerText = text.toLowerCase();
    const isQuestion = researchTriggers.some((trigger: string) => lowerText.includes(trigger));
    const isLongQuery = text.length > 50;
    const hasMultipleSentences = text.split(/[.!?]/).length > 2;
    
    return isQuestion || isLongQuery || hasMultipleSentences;
  }, []);

  // Fetch suggestions
  const { data: suggestions } = useQuery<string[]>({
    queryKey: ['/api/search/suggestions', query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.suggestions || [];
    },
    enabled: query.length >= 2 && !isResearchMode,
    staleTime: 60000, // Cache for 1 minute
  });

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setQuery(value);
    onQueryChange?.(value);
    setSelectedSuggestionIndex(-1);
    setShowSuggestions(value.length >= 2);
    
    // Detect if we should enter Research mode
    const shouldUseResearch = detectResearchMode(value);
    if (shouldUseResearch !== isResearchMode) {
      setIsResearchMode(shouldUseResearch);
    }
    
    adjustTextareaHeight();
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (selectedSuggestionIndex >= 0 && suggestions) {
        handleSuggestionClick(suggestions[selectedSuggestionIndex]);
      } else {
        handleSearch();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (suggestions && suggestions.length > 0) {
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (suggestions && suggestions.length > 0) {
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    onSearch(suggestion, false);
  };

  // Handle search
  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      await onSearch(query, isResearchMode);
    } finally {
      setIsLoading(false);
    }
  };

  // Focus management
  const handleFocus = () => {
    setIsExpanded(true);
    onFocusChange?.(true);
  };

  const handleBlur = () => {
    // Delay to allow clicking on suggestions
    setTimeout(() => {
      if (!query.trim()) {
        setIsExpanded(false);
      }
      setShowSuggestions(false);
      onFocusChange?.(false);
    }, 200);
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [query, adjustTextareaHeight]);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  return (
    <motion.div 
      ref={containerRef}
      className={`relative w-full ${className}`}
      layout
    >
      <div className="relative">
        {/* Main Search Input */}
        <div className={`
          relative bg-white dark:bg-gray-800 
          rounded-2xl shadow-lg border-2 transition-all duration-300
          ${isExpanded 
            ? 'border-purple-500 shadow-purple-500/20' 
            : 'border-gray-200 dark:border-gray-600 hover:border-purple-300'
          }
          ${isResearchMode ? 'ring-2 ring-purple-400/50' : ''}
        `}>
          
          {/* Research Mode Indicator */}
          <AnimatePresence>
            {isResearchMode && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute -top-8 left-4 flex items-center space-x-2 text-xs"
              >
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full flex items-center space-x-1">
                  <span className="text-sm">🕵️</span>
                  <span>Learn Mode Active</span>
                  <Sparkles className="w-3 h-3 animate-pulse" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search Icon */}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
            {isResearchMode ? (
              <span className="text-lg">🕵️</span>
            ) : (
              <Search className="h-5 w-5 text-gray-400" />
            )}
          </div>

          {/* Auto-expanding Textarea */}
          <textarea
            ref={textareaRef}
            value={query}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            className={`
              w-full pl-12 pr-20 py-4 
              bg-transparent resize-none outline-none
              text-gray-900 dark:text-gray-100 placeholder-gray-500
              font-medium text-lg leading-6
              min-h-[56px] max-h-[200px]
              scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent
            `}
            style={{ 
              height: isExpanded ? 'auto' : '56px',
              transition: 'height 0.2s ease'
            }}
            disabled={isLoading}
          />

          {/* Search Button */}
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <Button
              onClick={handleSearch}
              disabled={!query.trim() || isLoading}
              size="sm"
              className={`
                px-4 py-2 rounded-xl transition-all
                ${isResearchMode 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' 
                  : 'bg-purple-600 hover:bg-purple-700'
                }
                text-white shadow-md
              `}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isResearchMode ? (
                <>
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Ask
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-1" />
                  Search
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Expanded Features */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 overflow-hidden"
            >
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      <span>Live search across 32,970+ communities</span>
                    </span>
                    {isResearchMode && (
                      <span className="flex items-center space-x-1">
                        <span className="text-sm">🕵️</span>
                        <span>Advanced AI analysis active</span>
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    Press Shift+Enter for new line
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Search Suggestions */}
      <AnimatePresence>
        {showSuggestions && suggestions && suggestions.length > 0 && !isResearchMode && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute top-full left-0 right-0 mt-2 z-50"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-2">
                <div className="text-xs text-gray-500 dark:text-gray-400 px-3 py-1 mb-1">Suggestions</div>
                {suggestions.map((suggestion, index) => {
                  // Determine icon based on suggestion content
                  const Icon = suggestion.toLowerCase().includes('near') ? MapPin :
                              suggestion.toLowerCase().includes('memory') ? Brain :
                              suggestion.toLowerCase().includes('assisted') ? Building2 :
                              suggestion.toLowerCase().includes('home') ? Home :
                              suggestion.toLowerCase().includes('under') ? Building :
                              Clock;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={`
                        w-full text-left px-3 py-2.5 rounded-lg
                        flex items-center space-x-3
                        transition-colors duration-150
                        ${
                          selectedSuggestionIndex === index
                            ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm font-medium truncate">{suggestion}</span>
                    </button>
                  );
                })}
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 px-3 py-2 bg-gray-50 dark:bg-gray-900/50">
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
                  <span>Press ↑↓ to navigate</span>
                  <span>Enter to select</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Search, MapPin, Building2, Heart, Users, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { apiRequest } from '@/lib/queryClient';

interface AutocompleteSuggestion {
  label: string;
  value: string;
  type: 'city' | 'state' | 'county' | 'community' | 'care_type' | 'vendor' | 'healthcare';
  count?: number;
  id?: number;
  description?: string;
}

interface AutocompleteSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  hideSearchButton?: boolean;
  inputClassName?: string;
}

export function AutocompleteSearch({ 
  value, 
  onChange, 
  onSubmit, 
  placeholder = "Search cities, communities, care types...",
  isLoading = false,
  hideSearchButton = false,
  inputClassName = ""
}: AutocompleteSearchProps) {
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  const debouncedValue = useDebounce(value, 300);

  // Fetch suggestions
  useEffect(() => {
    if (debouncedValue && debouncedValue.length >= 2) {
      setLoadingSuggestions(true);
      apiRequest('GET', `/api/autocomplete/suggestions?query=${encodeURIComponent(debouncedValue)}&limit=10`)
        .then(res => res.json())
        .then(data => {
          // Ensure suggestions are in the correct format
          const validSuggestions = (data.suggestions || []).filter((s: AutocompleteSuggestion) => {
            // Ensure all fields are strings, not objects
            return s && 
              typeof s.label === 'string' && 
              typeof s.value === 'string' && 
              typeof s.type === 'string';
          });
          setSuggestions(validSuggestions);
          setShowSuggestions(validSuggestions.length > 0);
          setLoadingSuggestions(false);
        })
        .catch(error => {
          console.error('Autocomplete error:', error);
          setSuggestions([]);
          setShowSuggestions(false);
          setLoadingSuggestions(false);
        });
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedValue]);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSelectSuggestion(suggestions[selectedIndex]);
      } else {
        onSubmit(value);
        setShowSuggestions(false);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (suggestion: AutocompleteSuggestion) => {
    onChange(suggestion.value);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    onSubmit(suggestion.value);
  };

  const getIcon = (type: string | undefined) => {
    if (!type) return <Search className="h-4 w-4" />;
    
    switch (type) {
      case 'city':
      case 'state':
      case 'county':
        return <MapPin className="h-4 w-4" />;
      case 'community':
        return <Building2 className="h-4 w-4" />;
      case 'care_type':
        return <Heart className="h-4 w-4" />;
      case 'vendor':
        return <Users className="h-4 w-4" />;
      case 'healthcare':
        return <Heart className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'city':
      case 'state':
      case 'county':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'community':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'care_type':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'vendor':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'healthcare':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder}
          className={inputClassName || "w-full pl-14 pr-6 py-5 text-lg md:text-xl border-0 bg-transparent focus:outline-none focus:ring-0 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"}
          disabled={isLoading}
        />
        {!hideSearchButton && (
          <Button 
            onClick={() => onSubmit(value)}
            disabled={isLoading || !value}
            className="absolute right-1 top-1/2 transform -translate-y-1/2"
            size="sm"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Search'
            )}
          </Button>
        )}
      </div>

      {/* Autocomplete Suggestions Dropdown */}
      {showSuggestions && (suggestions.length > 0 || loadingSuggestions) && (
        <Card 
          ref={suggestionsRef}
          className="absolute w-full mt-1 max-h-80 overflow-y-auto shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
          style={{ zIndex: 999999, position: 'absolute', top: '100%', left: 0, right: 0 }}
        >
          {loadingSuggestions ? (
            <div className="p-4 text-center">
              <Loader2 className="h-5 w-5 animate-spin mx-auto text-gray-400" />
            </div>
          ) : (
            <div className="py-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.type}-${suggestion.value}-${index}`}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center space-x-3 ${
                    index === selectedIndex ? 'bg-gray-100 dark:bg-gray-800' : ''
                  }`}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <span className={`p-1 rounded ${getTypeColor(suggestion.type)}`}>
                    {getIcon(suggestion.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{String(suggestion.label || '')}</div>
                  </div>
                  <Badge variant="secondary" className="ml-auto">
                    {String(suggestion.type || '').replace('_', ' ')}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
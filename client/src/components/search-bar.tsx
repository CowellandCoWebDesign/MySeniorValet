import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Search, Filter, Home } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

interface SearchBarProps {
  onSearch?: (params: {
    location: string;
    careType: string;
    budget: string;
    availability: string;
  }) => void;
  showAdvancedFilters?: boolean;
  onToggleAdvancedFilters?: () => void;
}

export function SearchBar({ onSearch, showAdvancedFilters, onToggleAdvancedFilters }: SearchBarProps) {
  const [, setLocation] = useLocation();
  const [searchParams, setSearchParams] = useState({
    location: "", // DEFAULT TO NORTHERN CALIFORNIA MARKET
    careType: "All Types",
    budget: "Any Budget",
    availability: "All Status",
  });
  const [locationQuery, setLocationQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Fetch location suggestions
  const { data: locationSuggestions = [], isLoading: isSuggestionsLoading } = useQuery<Array<{label: string, value: string, type: string}>>({
    queryKey: ['/api/locations/search', locationQuery],
    queryFn: async ({ queryKey }) => {
      const [, query] = queryKey;
      if (!query || (query as string).length < 2) return [];
      console.log('Fetching suggestions for:', query);
      const response = await fetch(`/api/locations/search?q=${encodeURIComponent(query as string)}`);
      if (!response.ok) throw new Error('Failed to fetch locations');
      const results = await response.json();
      console.log('Got suggestions:', results);
      return results;
    },
    enabled: locationQuery.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle clicks outside to close suggestions
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

  const handleLocationInputChange = (value: string) => {
    console.log('Location input changed:', value);
    setLocationQuery(value);
    setSearchParams(prev => ({ ...prev, location: value }));
    setShowSuggestions(value.length >= 2);
  };

  const handleLocationSelect = (location: string) => {
    setSearchParams(prev => ({ ...prev, location }));
    setLocationQuery(location);
    setShowSuggestions(false);
  };

  const handleSearch = () => {
    console.log('SearchBar handleSearch called with:', searchParams);
    
    if (onSearch) {
      onSearch(searchParams);
    } else {
      // Navigate to map-search page with params
      const params = new URLSearchParams();
      if (searchParams.location) params.set('location', searchParams.location);
      if (searchParams.careType !== 'All Types') params.set('careType', searchParams.careType);
      if (searchParams.budget !== 'Any Budget') params.set('budget', searchParams.budget);

      const url = `/map-search?${params.toString()}`;
      console.log('Navigating to:', url);
      setLocation(url);
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Mobile-Responsive Search Context Header */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-50 to-blue-50 backdrop-blur-md px-3 py-2 rounded-full shadow-md border border-green-200/50 mb-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs sm:text-sm font-bold text-green-800">
            31,023+ verified communities
          </span>
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
        </div>
        <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base font-medium px-2">
          Search by city, zip code, community name, or care type
        </p>
        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 px-2">
          Authentic HUD pricing • Real availability • Government verified
        </p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="relative">
        <div className={`relative bg-white dark:bg-gray-800 ${showSuggestions && locationSuggestions && locationSuggestions.length > 0 ? 'rounded-t-3xl' : 'rounded-3xl'} shadow-2xl overflow-hidden border-2 border-gradient-to-r from-blue-200/50 to-purple-200/50 dark:border-gray-600 hover:border-blue-300/70 focus-within:border-blue-500 focus-within:shadow-blue-200/25 focus-within:shadow-2xl transition-all duration-500 backdrop-blur-sm`}>
          <div className="flex items-center relative">
            <div className="pl-3 sm:pl-4 pr-2">
              <Search className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 drop-shadow-sm" />
            </div>
            <Input
              ref={inputRef}
              type="text"
              placeholder="Try 'Sacramento, CA' or '90210'..."
              value={locationQuery}
              onChange={(e) => handleLocationInputChange(e.target.value)}
              onFocus={() => {
                if (locationSuggestions && locationSuggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch();
                  setShowSuggestions(false);
                }
                if (e.key === 'Escape') {
                  setShowSuggestions(false);
                }
              }}
              onBlur={() => {
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              className="flex-1 px-2 sm:px-3 py-3 sm:py-4 text-sm sm:text-base border-0 bg-transparent focus:outline-none focus:ring-0 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 font-medium"
            />
            {locationQuery && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setLocationQuery('');
                  setSearchParams(prev => ({ ...prev, location: '' }));
                  setShowSuggestions(false);
                }}
                className="mr-1 text-gray-400 hover:text-gray-600 p-1 sm:p-2"
              >
                ✕
              </Button>
            )}
            <Button
              type="submit"
              onClick={handleSearch}
              disabled={!locationQuery.trim()}
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white px-3 py-2 sm:px-4 sm:py-3 m-1 sm:m-2 rounded-xl sm:rounded-2xl transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:hover:scale-100 font-bold text-xs sm:text-sm"
            >
              <Search className="w-5 h-5 lg:w-6 lg:h-6 mr-2" />
              <span className="hidden sm:inline">Search</span>
              <span className="sm:hidden">Go</span>
            </Button>
          </div>
        </div>

        {/* Enhanced Search Suggestions Dropdown */}
        {showSuggestions && (
          <div 
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 bg-white/98 dark:bg-gray-800/98 backdrop-blur-md border border-gray-200/50 dark:border-gray-700 rounded-b-3xl shadow-2xl z-50 max-h-64 overflow-y-auto"
            style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)' }}
          >
            {isSuggestionsLoading ? (
              <div className="px-6 py-4 text-sm text-gray-500 flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                Searching locations...
              </div>
            ) : locationSuggestions.length > 0 ? (
              locationSuggestions.map((suggestion: any, index: number) => {
                const getLocationIcon = (type: string) => {
                  switch (type) {
                    case 'community': return { icon: Home, color: 'red', label: 'Senior Community' };
                    case 'city': return { icon: MapPin, color: 'blue', label: 'City' };
                    case 'state': return { icon: MapPin, color: 'purple', label: 'State' };
                    case 'county': return { icon: MapPin, color: 'green', label: 'County' };
                    case 'zip': return { icon: MapPin, color: 'orange', label: 'ZIP Code' };
                    case 'zip_pattern': return { icon: MapPin, color: 'orange', label: 'ZIP Area' };
                    default: return { icon: MapPin, color: 'blue', label: 'Location' };
                  }
                };

                const { icon: Icon, color, label } = getLocationIcon(suggestion.type);
                const colorClasses: Record<string, string> = {
                  red: 'bg-gradient-to-r from-red-100 to-red-200 text-red-700 border-red-300',
                  blue: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 border-blue-300',
                  purple: 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 border-purple-300', 
                  green: 'bg-gradient-to-r from-green-100 to-green-200 text-green-700 border-green-300',
                  orange: 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700 border-orange-300'
                };

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleLocationSelect(suggestion.value)}
                    className="w-full px-6 py-4 text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 focus:bg-gradient-to-r focus:from-blue-50 focus:to-purple-50 focus:outline-none transition-all duration-200 first:rounded-t-lg last:rounded-b-3xl border-b border-gray-100/50 last:border-b-0 group"
                  >
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center mr-4 border transition-all duration-200 group-hover:scale-110 ${colorClasses[color]}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-base text-gray-900 dark:text-white font-semibold">
                            {suggestion.label}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300 rounded-full font-medium">
                            {label}
                          </span>
                        </div>
                        {suggestion.type === 'community' && (
                          <div className="text-xs text-green-600 mt-1 font-medium">
                            🏠 Senior Living Community
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            ) : locationQuery.length >= 2 ? (
              <div className="px-6 py-4 text-sm text-gray-500 text-center">
                <div className="text-gray-400 mb-2">🔍</div>
                No locations found for "{locationQuery}"
                <div className="text-xs text-gray-400 mt-1">
                  Try searching for a city, state, or ZIP code
                </div>
              </div>
            ) : null}
          </div>
        )}
      </form>
    </div>
  );
}
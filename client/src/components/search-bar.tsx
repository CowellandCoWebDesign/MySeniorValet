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
      {/* Search Context Header */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center space-x-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-md border border-green-200/50 mb-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-semibold text-green-800">Live data from 25,782+ communities</span>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Search by city, zip code, community name, or care type
        </p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="relative">
        <div className={`relative bg-white dark:bg-gray-800 ${showSuggestions && locationSuggestions && locationSuggestions.length > 0 ? 'rounded-t-2xl' : 'rounded-2xl'} shadow-2xl overflow-hidden border-2 border-blue-200/50 dark:border-gray-600 hover:border-blue-300/70 focus-within:border-blue-400 transition-all duration-300`}>
          <div className="flex items-center">
            <div className="pl-6 pr-2">
              <Search className="w-5 h-5 lg:w-6 lg:h-6 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Try 'San Francisco', '94102', or 'Memory Care'..."
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
                }
              }}
              onBlur={() => {
                // Delay hiding suggestions to allow click events
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              className="flex-1 px-3 py-4 lg:py-5 text-base lg:text-lg border-0 bg-transparent focus:outline-none focus:ring-0 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />
            <Button
              type="submit"
              onClick={handleSearch}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-3 lg:p-4 m-2 rounded-xl transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <Search className="w-5 h-5 lg:w-6 lg:h-6 mr-2" />
              <span className="hidden sm:inline font-semibold">Search</span>
            </Button>
          </div>
        </div>

        {/* Search Suggestions Dropdown */}
        {showSuggestions && (
          <div 
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-b-2xl shadow-xl z-30 max-h-56 overflow-y-auto"
            style={{ boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)' }}
          >
            {isSuggestionsLoading ? (
              <div className="px-4 py-3 text-sm text-gray-500">Loading...</div>
            ) : locationSuggestions.length > 0 ? (
              locationSuggestions.map((suggestion: any, index: number) => {
                // Determine icon and color based on location type
                const getLocationIcon = (type: string) => {
                  switch (type) {
                    case 'community': return { icon: Home, color: 'red' };
                    case 'city': return { icon: MapPin, color: 'blue' };
                    case 'state': return { icon: MapPin, color: 'purple' };
                    case 'county': return { icon: MapPin, color: 'green' };
                    case 'zip': return { icon: MapPin, color: 'orange' };
                    case 'zip_pattern': return { icon: MapPin, color: 'orange' };
                    default: return { icon: MapPin, color: 'blue' };
                  }
                };

                const { icon: Icon, color } = getLocationIcon(suggestion.type);
                const colorClasses: Record<string, string> = {
                  red: 'bg-red-100 text-red-600',
                  blue: 'bg-blue-100 text-blue-600',
                  purple: 'bg-purple-100 text-purple-600', 
                  green: 'bg-green-100 text-green-600',
                  orange: 'bg-orange-100 text-orange-600'
                };

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleLocationSelect(suggestion.value)}
                    className="w-full px-4 py-3 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-3 ${colorClasses[color]}`}>
                        <Icon className="h-3 w-3" />
                      </div>
                      <div className="flex-1">
                        <span className="text-sm text-gray-900 dark:text-white font-medium">{suggestion.label}</span>
                        {suggestion.type && (
                          <span className="text-xs text-gray-500 ml-2 capitalize">
                            {suggestion.type === 'zip_pattern' ? 'ZIP Area' : 
                             suggestion.type === 'community' ? 'Senior Community' : 
                             suggestion.type}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500">No locations found</div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
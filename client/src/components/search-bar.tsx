import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Search, Filter } from "lucide-react";
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
  const { data: locationSuggestions = [], isLoading: isSuggestionsLoading } = useQuery<Array<{label: string, value: string}>>({
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
    if (onSearch) {
      onSearch(searchParams);
    } else {
      // Navigate to search page with params
      const params = new URLSearchParams();
      if (searchParams.location) params.set('location', searchParams.location);
      if (searchParams.careType !== 'All Types') params.set('careType', searchParams.careType);
      if (searchParams.budget !== 'Any Budget') params.set('budget', searchParams.budget);
      
      setLocation(`/map-search?${params.toString()}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 md:p-5 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
          <div className="md:col-span-2">
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
              <Input
                ref={inputRef}
                type="text"
                placeholder="Search by community name or location..."
                className="pl-10"
                value={locationQuery}
                onChange={(e) => handleLocationInputChange(e.target.value)}
                onFocus={() => locationQuery.length >= 2 && setShowSuggestions(true)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
                autoComplete="off"
              />
              
              {/* Location Suggestions Dropdown */}
              {showSuggestions && (
                <div 
                  ref={suggestionsRef}
                  className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-30 max-h-56 overflow-y-auto mt-2"
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
            </div>
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Care Type</Label>
            <Select value={searchParams.careType} onValueChange={(value) => setSearchParams(prev => ({ ...prev, careType: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Types">All Types</SelectItem>
                <SelectItem value="Independent Living">Independent Living</SelectItem>
                <SelectItem value="Assisted Living">Assisted Living</SelectItem>
                <SelectItem value="Memory Care">Memory Care</SelectItem>
                <SelectItem value="Skilled Nursing">Skilled Nursing</SelectItem>
                <SelectItem value="55+ Housing">55+ Housing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Prominent Availability Filter */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Availability Status
              <span className="text-xs text-blue-600 ml-2">(Live Updates)</span>
            </Label>
            <Select value={searchParams.availability} onValueChange={(value) => setSearchParams(prev => ({ ...prev, availability: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Status">All Status</SelectItem>
                <SelectItem value="Available Now">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Available Now
                  </div>
                </SelectItem>
                <SelectItem value="Waitlist">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                    Waitlist
                  </div>
                </SelectItem>
                <SelectItem value="Contact for Availability">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>
                    Contact for Availability
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Budget</Label>
            <Select value={searchParams.budget} onValueChange={(value) => setSearchParams(prev => ({ ...prev, budget: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Any Budget">Any Budget</SelectItem>
                <SelectItem value="$2,000 - $4,000">$2,000 - $4,000</SelectItem>
                <SelectItem value="$4,000 - $6,000">$4,000 - $6,000</SelectItem>
                <SelectItem value="$6,000 - $8,000">$6,000 - $8,000</SelectItem>
                <SelectItem value="$8,000+">$8,000+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={handleSearch} 
            className="flex-1 bg-primary hover:bg-primary/90 h-12 text-base font-semibold"
            size="lg"
          >
            <Search className="mr-2 h-5 w-5" />
            Search Communities
          </Button>
          {onToggleAdvancedFilters && (
            <Button 
              variant="outline" 
              onClick={onToggleAdvancedFilters}
              className="h-12 text-base font-semibold"
              size="lg"
            >
              <Filter className="mr-2 h-5 w-5" />
              More Filters
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

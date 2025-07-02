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
  }) => void;
  showAdvancedFilters?: boolean;
  onToggleAdvancedFilters?: () => void;
}

export function SearchBar({ onSearch, showAdvancedFilters, onToggleAdvancedFilters }: SearchBarProps) {
  const [, setLocation] = useLocation();
  const [searchParams, setSearchParams] = useState({
    location: "",
    careType: "All Types",
    budget: "Any Budget",
  });
  const [locationQuery, setLocationQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Fetch location suggestions
  const { data: locationSuggestions = [] } = useQuery<Array<{label: string, value: string}>>({
    queryKey: ['/api/locations/search', locationQuery],
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
      
      setLocation(`/search?${params.toString()}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
          <div className="md:col-span-2">
            <Label className="block text-sm font-medium text-gray-700 mb-2">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
              <Input
                ref={inputRef}
                type="text"
                placeholder="City, State or ZIP Code"
                className="pl-10"
                value={searchParams.location}
                onChange={(e) => handleLocationInputChange(e.target.value)}
                onFocus={() => setShowSuggestions(locationQuery.length >= 2)}
                autoComplete="off"
              />
              
              {/* Location Suggestions Dropdown */}
              {showSuggestions && locationSuggestions.length > 0 && (
                <div 
                  ref={suggestionsRef}
                  className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-20 max-h-48 overflow-y-auto mt-1"
                >
                  {locationSuggestions.map((suggestion: any, index: number) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleLocationSelect(suggestion.value)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none first:rounded-t-md last:rounded-b-md"
                    >
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{suggestion.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">Care Type</Label>
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
          
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">Budget</Label>
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
          <Button onClick={handleSearch} className="flex-1 bg-primary hover:bg-primary/90">
            <Search className="mr-2 h-4 w-4" />
            Search Communities
          </Button>
          {onToggleAdvancedFilters && (
            <Button variant="outline" onClick={onToggleAdvancedFilters}>
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

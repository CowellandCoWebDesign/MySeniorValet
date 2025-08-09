import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Search, Filter } from "lucide-react";
import { useLocation } from "wouter";

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
    location: "",
    careType: "All Types",
    budget: "Any Budget",
    availability: "All Status",
  });

  const handleLocationInputChange = (value: string) => {
    setSearchParams(prev => ({ ...prev, location: value }));
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

      const url = `/ai-search-intelligence?${params.toString()}`;
      console.log('Navigating to AI Search Intelligence:', url);
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
            27,112+ verified communities
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
        <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border-2 border-gradient-to-r from-blue-200/50 to-purple-200/50 dark:border-gray-600 hover:border-blue-300/70 focus-within:border-blue-500 focus-within:shadow-blue-200/25 focus-within:shadow-2xl transition-all duration-500 backdrop-blur-sm">
          <div className="flex items-center relative">
            <div className="pl-3 sm:pl-4 pr-2">
              <Search className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 drop-shadow-sm" />
            </div>
            <Input
              type="text"
              placeholder="Try 'Sacramento, CA' or '90210'..."
              value={searchParams.location}
              onChange={(e) => handleLocationInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              className="flex-1 px-2 sm:px-3 py-3 sm:py-4 text-sm sm:text-base border-0 bg-transparent focus:outline-none focus:ring-0 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 font-medium"
            />
            {searchParams.location && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchParams(prev => ({ ...prev, location: '' }));
                }}
                className="mr-1 text-gray-400 hover:text-gray-600 p-1 sm:p-2"
              >
                ✕
              </Button>
            )}
            <Button
              type="submit"
              onClick={handleSearch}
              disabled={!searchParams.location.trim()}
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white px-3 py-2 sm:px-4 sm:py-3 m-1 sm:m-2 rounded-xl sm:rounded-2xl transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:hover:scale-100 font-bold text-xs sm:text-sm"
            >
              <Search className="w-5 h-5 lg:w-6 lg:h-6 mr-2" />
              <span className="hidden sm:inline">Search</span>
              <span className="sm:hidden">Go</span>
            </Button>
          </div>
        </div>
      </form>

      {/* Advanced Search Filters */}
      {showAdvancedFilters && (
        <div className="mt-4 p-4 bg-gradient-to-br from-gray-50/80 to-white/80 dark:from-gray-800/80 dark:to-gray-700/80 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-gray-600/50 shadow-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Care Type Filter */}
            <div className="space-y-2">
              <Label htmlFor="care-type" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Care Type
              </Label>
              <Select
                value={searchParams.careType}
                onValueChange={(value) => setSearchParams(prev => ({ ...prev, careType: value }))}
              >
                <SelectTrigger className="w-full bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm">
                  <SelectValue placeholder="Select care type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Types">All Types</SelectItem>
                  <SelectItem value="Independent Living">Independent Living</SelectItem>
                  <SelectItem value="Assisted Living">Assisted Living</SelectItem>
                  <SelectItem value="Memory Care">Memory Care</SelectItem>
                  <SelectItem value="Nursing Care">Nursing Care</SelectItem>
                  <SelectItem value="Continuing Care">Continuing Care</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Budget Filter */}
            <div className="space-y-2">
              <Label htmlFor="budget" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Monthly Budget
              </Label>
              <Select
                value={searchParams.budget}
                onValueChange={(value) => setSearchParams(prev => ({ ...prev, budget: value }))}
              >
                <SelectTrigger className="w-full bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm">
                  <SelectValue placeholder="Select budget range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Any Budget">Any Budget</SelectItem>
                  <SelectItem value="Under $2,000">Under $2,000</SelectItem>
                  <SelectItem value="$2,000 - $4,000">$2,000 - $4,000</SelectItem>
                  <SelectItem value="$4,000 - $6,000">$4,000 - $6,000</SelectItem>
                  <SelectItem value="$6,000 - $8,000">$6,000 - $8,000</SelectItem>
                  <SelectItem value="$8,000+">$8,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Availability Filter */}
            <div className="space-y-2">
              <Label htmlFor="availability" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Availability Status
              </Label>
              <Select
                value={searchParams.availability}
                onValueChange={(value) => setSearchParams(prev => ({ ...prev, availability: value }))}
              >
                <SelectTrigger className="w-full bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm">
                  <SelectValue placeholder="Select availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Status">All Status</SelectItem>
                  <SelectItem value="Available Now">Available Now</SelectItem>
                  <SelectItem value="Waitlist Available">Waitlist Available</SelectItem>
                  <SelectItem value="Opening Soon">Opening Soon</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Advanced Filters Button */}
      {onToggleAdvancedFilters && (
        <div className="flex justify-center mt-4">
          <Button
            type="button"
            onClick={onToggleAdvancedFilters}
            variant="outline"
            className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-300"
          >
            <Filter className="w-4 h-4" />
            {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
          </Button>
        </div>
      )}
    </div>
  );
}
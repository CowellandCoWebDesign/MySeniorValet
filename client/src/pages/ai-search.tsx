import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'wouter';
import { Search, Filter, MapIcon, SlidersHorizontal, X, Sparkles, ChevronDown } from 'lucide-react';
import { NavigationHeader } from "@/components/NavigationHeader";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import Map from '@/components/Map';
import MapErrorBoundary from '@/components/MapErrorBoundary';
import { PrioritizedCommunityCard } from '@/components/PrioritizedCommunityCard';
import { useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useDebounce } from '@/hooks/use-debounce';

// Reuse the same interfaces from map-search
interface Community {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  careTypes: string[];
  rating: number;
  reviewCount: number;
  phone: string;
  website: string;
  priceRange: string;
  availability: string;
  photos: string[];
  description: string;
}

interface SearchFilters {
  careType: string;
  selectedCareTypes: string[];
  minRating: number;
  amenities: string[];
  budget: string;
  availability: string;
}

export default function AISearch() {
  const [, setLocation] = useLocation();
  
  // Get search query from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const initialQuery = urlParams.get('query') || urlParams.get('q') || '';
  const budgetParam = urlParams.get('budget') || '';
  const careTypesParam = urlParams.get('careTypes') || '';

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchFilters>({
    careType: 'all',
    selectedCareTypes: careTypesParam ? careTypesParam.split(',') : [],
    minRating: 0,
    amenities: [],
    budget: budgetParam || 'Any Budget',
    availability: 'all'
  });

  // Map states - reusing the same logic from map-search
  const [mapCenter, setMapCenter] = useState<[number, number]>([37.7749, -122.4194]);
  const [mapZoom, setMapZoom] = useState<number>(12);
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);
  const [hoveredCommunityId, setHoveredCommunityId] = useState<number | null>(null);
  const [selectedCommunityId, setSelectedCommunityId] = useState<number | null>(null);
  const [isManualSearch, setIsManualSearch] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const mapRef = useRef<any>(null);

  // Care types available
  const careTypes = [
    { value: 'independent', label: 'Independent Living' },
    { value: 'assisted', label: 'Assisted Living' },
    { value: 'memory', label: 'Memory Care' },
    { value: 'nursing', label: 'Nursing Home' },
    { value: 'ccrc', label: 'CCRC' },
    { value: '55plus', label: '55+ Active Adult' },
    { value: 'mobile', label: 'Mobile Home Parks' }
  ];

  // Amenities options
  const amenityOptions = [
    'Pet Friendly',
    'Pool',
    'Fitness Center',
    'Library',
    'Garden',
    'Transportation',
    'Meal Plans',
    '24/7 Staff',
    'Emergency Response',
    'Social Activities'
  ];

  // Fetch communities using the same endpoint as map-search
  const { 
    data: communities = [], 
    isLoading,
    error 
  } = useQuery({
    queryKey: ['/api/communities/search/spatial', {
      bounds: mapBounds?.toBBoxString(),
      filters: filters,
      search: debouncedSearchQuery
    }],
    queryFn: async () => {
      if (!mapBounds) return [];
      
      const params = new URLSearchParams();
      const bounds = mapBounds.toBBoxString().split(',');
      params.append('west', bounds[0]);
      params.append('south', bounds[1]);
      params.append('east', bounds[2]);
      params.append('north', bounds[3]);
      
      if (debouncedSearchQuery) params.append('search', debouncedSearchQuery);
      if (filters.budget && filters.budget !== 'Any Budget') params.append('budget', filters.budget);
      if (filters.selectedCareTypes.length > 0) {
        params.append('careTypes', filters.selectedCareTypes.join(','));
      }
      if (filters.minRating > 0) params.append('minRating', filters.minRating.toString());
      if (filters.availability !== 'all') params.append('availability', filters.availability);

      const response = await fetch(`/api/communities/search/spatial?${params}`);
      if (!response.ok) throw new Error('Failed to fetch communities');
      const data = await response.json();
      return data.communities || [];
    },
    enabled: !!mapBounds,
    staleTime: 30000,
  });

  // Handle filter changes
  const handleCareTypeToggle = (careType: string) => {
    setFilters(prev => ({
      ...prev,
      selectedCareTypes: prev.selectedCareTypes.includes(careType)
        ? prev.selectedCareTypes.filter(ct => ct !== careType)
        : [...prev.selectedCareTypes, careType]
    }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const clearFilters = () => {
    setFilters({
      careType: 'all',
      selectedCareTypes: [],
      minRating: 0,
      amenities: [],
      budget: 'Any Budget',
      availability: 'all'
    });
  };

  const hasActiveFilters = 
    filters.selectedCareTypes.length > 0 || 
    filters.minRating > 0 || 
    filters.amenities.length > 0 || 
    filters.budget !== 'Any Budget' || 
    filters.availability !== 'all';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <NavigationHeader />
      
      {/* Header with Title */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="w-6 h-6" />
            <h1 className="text-2xl font-bold">AI-Powered Senior Living Search</h1>
          </div>
          <p className="text-purple-100">Find your perfect match with intelligent filtering and smart connections</p>
        </div>
      </div>

      {/* SECTION 1: Beautiful Filtering at Top */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto p-4">
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search by city, state, ZIP code, or community name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full text-lg"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Filter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* Care Types */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Care Types</Label>
              <Select 
                value={filters.selectedCareTypes[0] || 'all'}
                onValueChange={(value) => {
                  if (value === 'all') {
                    setFilters(prev => ({ ...prev, selectedCareTypes: [] }));
                  } else {
                    setFilters(prev => ({ ...prev, selectedCareTypes: [value] }));
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select care type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {careTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Budget */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Budget</Label>
              <Select value={filters.budget} onValueChange={(value) => setFilters(prev => ({ ...prev, budget: value }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select budget" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Any Budget">Any Budget</SelectItem>
                  <SelectItem value="HUD/Government">HUD/Government</SelectItem>
                  <SelectItem value="Under $2,000">Under $2,000</SelectItem>
                  <SelectItem value="$2,000-$4,000">$2,000-$4,000</SelectItem>
                  <SelectItem value="$4,000-$6,000">$4,000-$6,000</SelectItem>
                  <SelectItem value="Above $6,000">Above $6,000</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Availability */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Availability</Label>
              <Select value={filters.availability} onValueChange={(value) => setFilters(prev => ({ ...prev, availability: value }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Availability</SelectItem>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="30days">Within 30 Days</SelectItem>
                  <SelectItem value="waitlist">Waitlist Available</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Min Rating</Label>
              <Select 
                value={filters.minRating.toString()} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, minRating: parseFloat(value) }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Any rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any Rating</SelectItem>
                  <SelectItem value="3">3+ Stars</SelectItem>
                  <SelectItem value="3.5">3.5+ Stars</SelectItem>
                  <SelectItem value="4">4+ Stars</SelectItem>
                  <SelectItem value="4.5">4.5+ Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters Button */}
            <div className="flex items-end">
              {hasActiveFilters && (
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Amenities (expandable) */}
          <div className="mt-3">
            <details className="group">
              <summary className="cursor-pointer flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600">
                <ChevronDown className="w-4 h-4 transform group-open:rotate-180 transition-transform" />
                <span>Amenities & Features</span>
                {filters.amenities.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {filters.amenities.length} selected
                  </Badge>
                )}
              </summary>
              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {amenityOptions.map(amenity => (
                  <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                    <Checkbox
                      checked={filters.amenities.includes(amenity)}
                      onCheckedChange={() => handleAmenityToggle(amenity)}
                    />
                    <span className="text-sm">{amenity}</span>
                  </label>
                ))}
              </div>
            </details>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-3 flex flex-wrap gap-2">
              {filters.selectedCareTypes.map(ct => (
                <Badge key={ct} variant="secondary" className="flex items-center gap-1">
                  {careTypes.find(t => t.value === ct)?.label}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => handleCareTypeToggle(ct)}
                  />
                </Badge>
              ))}
              {filters.budget !== 'Any Budget' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {filters.budget}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => setFilters(prev => ({ ...prev, budget: 'Any Budget' }))}
                  />
                </Badge>
              )}
              {filters.minRating > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {filters.minRating}+ Stars
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => setFilters(prev => ({ ...prev, minRating: 0 }))}
                  />
                </Badge>
              )}
              {filters.amenities.map(amenity => (
                <Badge key={amenity} variant="secondary" className="flex items-center gap-1">
                  {amenity}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => handleAmenityToggle(amenity)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: Map in the Middle */}
      <div className="h-96 w-full border-y">
        <MapErrorBoundary>
          <Map
            ref={mapRef}
            communities={communities}
            center={mapCenter}
            zoom={mapZoom}
            onBoundsChange={setMapBounds}
            onCenterChange={setMapCenter}
            onZoomChange={setMapZoom}
            hoveredCommunityId={hoveredCommunityId}
            selectedCommunityId={selectedCommunityId}
            onMarkerClick={(community) => {
              setSelectedCommunityId(community.id);
              // Scroll to the community card in the list
              const element = document.getElementById(`community-${community.id}`);
              element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
            filters={filters}
            searchQuery={searchQuery}
            className="h-full w-full"
          />
        </MapErrorBoundary>
      </div>

      {/* SECTION 3: List at the Bottom */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {isLoading ? (
              'Searching...'
            ) : (
              <>
                {communities.length} {communities.length === 1 ? 'Community' : 'Communities'} Found
              </>
            )}
          </h2>
          <Select defaultValue="relevance">
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="distance">Distance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Community Cards List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {communities.map((community: any) => (
            <div
              key={community.id}
              id={`community-${community.id}`}
              onMouseEnter={() => setHoveredCommunityId(community.id)}
              onMouseLeave={() => setHoveredCommunityId(null)}
              className={`transition-all ${
                hoveredCommunityId === community.id ? 'ring-2 ring-purple-500 rounded-lg' : ''
              }`}
            >
              <PrioritizedCommunityCard 
                community={community}
                onClick={() => setLocation(`/communities/${community.id}`)}
              />
            </div>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && communities.length === 0 && (
          <Card className="p-12 text-center">
            <CardContent>
              <MapIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No communities found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your filters or search in a different area
              </p>
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="mt-4"
              >
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SearchBar } from "@/components/search-bar";
import { Filters } from "@/components/filters";
import { CommunityCard } from "@/components/community-card";
import { MapView } from "@/components/map-view";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { List, Map as MapIcon, Filter, X, Target, DollarSign, MapPin, Star } from "lucide-react";
import type { Community, SearchCommunity } from "@shared/schema";

export default function Search() {
  const [searchParams, setSearchParams] = useState<SearchCommunity>({});
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showFilters, setShowFilters] = useState(false); // Start collapsed
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);

  // Parse URL parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const initialParams: SearchCommunity = {};
    
    if (urlParams.get('location')) initialParams.location = urlParams.get('location')!;
    if (urlParams.get('careType')) initialParams.careType = urlParams.get('careType')!;
    if (urlParams.get('budget')) initialParams.budget = urlParams.get('budget')!;
    if (urlParams.get('availability')) initialParams.availability = urlParams.get('availability')!;
    
    setSearchParams(initialParams);
  }, []);

  const { data: communities, isLoading, error } = useQuery<Community[]>({
    queryKey: ['/api/communities/search', searchParams],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else {
            params.set(key, value.toString());
          }
        }
      });
      
      console.log('Making search request with params:', params.toString());
      const response = await fetch(`/api/communities/search?${params.toString()}`);
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    },
    enabled: true,
  });

  const handleSearch = (newParams: any) => {
    setSearchParams(prev => ({ ...prev, ...newParams }));
  };

  const handleFiltersChange = (filters: any) => {
    console.log('Filters changed:', filters);
    const newParams: SearchCommunity = { ...searchParams };
    
    // Handle care services (convert to careType for API)
    if (filters.careServices?.length > 0) {
      newParams.careType = filters.careServices.join(',');
    } else {
      delete newParams.careType;
    }
    
    // Handle amenities
    if (filters.amenities?.length > 0) {
      newParams.amenities = filters.amenities;
    } else {
      delete newParams.amenities;
    }
    
    // Handle budget/price range
    if (filters.priceRange?.min || filters.priceRange?.max) {
      if (filters.priceRange.min && filters.priceRange.max) {
        newParams.budget = `$${filters.priceRange.min} - $${filters.priceRange.max}`;
      } else if (filters.priceRange.min) {
        newParams.budget = `$${filters.priceRange.min}+`;
      } else if (filters.priceRange.max) {
        newParams.budget = `Under $${filters.priceRange.max}`;
      }
    } else {
      delete newParams.budget;
    }
    
    // Handle distance (extract number from string)  
    if (filters.distance) {
      console.log('Processing distance:', filters.distance);
      const distanceMatch = filters.distance.match(/(\d+)/);
      if (distanceMatch) {
        newParams.distance = parseInt(distanceMatch[1]);
        console.log('Set distance to:', newParams.distance);
      }
    } else {
      delete newParams.distance;
    }
    
    // Handle minimum rating
    if (filters.minRating && filters.minRating !== "any") {
      newParams.minRating = parseFloat(filters.minRating);
    } else {
      delete newParams.minRating;
    }

    // Handle availability
    if (filters.availability && filters.availability !== "all" && filters.availability !== "All Status") {
      newParams.availability = filters.availability;
    } else {
      delete newParams.availability;
    }

    console.log('New search params:', newParams);
    setSearchParams(newParams);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Search Error</h2>
          <p className="text-gray-600">Please try again or adjust your search criteria.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/5 w-72 h-72 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/5 w-64 h-64 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-2/3 left-2/3 w-56 h-56 bg-gradient-to-r from-emerald-400/10 to-teal-400/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      
      <div className="relative z-10">
        <Header />
      
      {/* Search Header */}
      <section className="bg-white shadow-sm py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SearchBar 
            onSearch={handleSearch}
            showAdvancedFilters={showAdvancedFilters}
            onToggleAdvancedFilters={() => setShowAdvancedFilters(!showAdvancedFilters)}
          />
        </div>
      </section>

      {/* Results Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Enhanced Results Header */}
          {!isLoading && communities && communities.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Results Count and Summary */}
                <div className="flex items-center space-x-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">
                      {communities.length} Senior Living {communities.length === 1 ? 'Community' : 'Communities'} Found
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {searchParams.location && `in ${searchParams.location}`}
                      {searchParams.careType && ` • ${searchParams.careType}`}
                      {searchParams.budget && ` • ${searchParams.budget} budget`}
                    </p>
                  </div>
                </div>

                {/* View Controls */}
                <div className="flex items-center space-x-3">
                  {/* View Mode Toggle */}
                  <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="h-8"
                    >
                      <List className="h-4 w-4 mr-1" />
                      List
                    </Button>
                    <Button
                      variant={viewMode === 'map' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('map')}
                      className="h-8"
                    >
                      <MapIcon className="h-4 w-4 mr-1" />
                      Map
                    </Button>
                  </div>
                  
                  {/* Filter Button */}
                  <Button
                    variant={showFilters ? 'default' : 'outline'}
                    size="sm"
                    className="relative group transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    onClick={() => {
                      console.log('Filter button clicked. Current state:', showFilters);
                      setShowFilters(!showFilters);
                      console.log('Filter state will change to:', !showFilters);
                    }}
                  >
                    <Filter className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                    Filters
                    {showFilters && (
                      <X className="h-3 w-3 ml-2 animate-spin" />
                    )}
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-300"></div>
                  </Button>
                  
                  {/* Sort Options */}
                  <Select>
                    <SelectTrigger className="w-40">
                      <Target className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Best Match</SelectItem>
                      <SelectItem value="distance">Distance</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="availability">Availability</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Active Filters */}
              {(searchParams.location || searchParams.careType || searchParams.budget) && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Active filters:</span>
                  {searchParams.location && (
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{searchParams.location}</span>
                      <button 
                        onClick={() => setSearchParams(prev => ({ ...prev, location: undefined }))}
                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {searchParams.careType && (
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <span>{searchParams.careType}</span>
                      <button 
                        onClick={() => setSearchParams(prev => ({ ...prev, careType: undefined }))}
                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {searchParams.budget && (
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <DollarSign className="h-3 w-3" />
                      <span>{searchParams.budget}</span>
                      <button 
                        onClick={() => setSearchParams(prev => ({ ...prev, budget: undefined }))}
                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSearchParams({})}
                    className="text-xs h-6 px-2"
                  >
                    Clear all
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Loading State Header */}
          {isLoading && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex items-center space-x-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Searching Communities...</h2>
                  <p className="text-sm text-gray-600">Finding the best matches for your needs</p>
                </div>
              </div>
            </div>
          )}

          {/* Collapsible Filters */}
          {showFilters && (
            <div className="mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <Filters 
                  onFiltersChange={handleFiltersChange} 
                  initialFilters={searchParams}
                />
              </div>
            </div>
          )}

          {/* Results */}
          <div>
            {viewMode === 'map' ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden" style={{ height: '600px' }}>
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MapIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Loading map...</p>
                    </div>
                  </div>
                ) : communities && communities.length > 0 ? (
                  <MapView 
                    communities={communities} 
                    selectedCommunity={selectedCommunity}
                    onCommunitySelect={setSelectedCommunity}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MapIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No communities to display on map</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {isLoading ? (
                  // Loading skeletons
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                        <Skeleton className="h-48 md:h-full" />
                        <div className="md:col-span-2 p-6 space-y-4">
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <div className="flex space-x-2">
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-6 w-24" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                          </div>
                          <div className="flex space-x-3">
                            <Skeleton className="h-10 w-24" />
                            <Skeleton className="h-10 w-28" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : communities && communities.length > 0 ? (
                  communities.map((community) => (
                    <CommunityCard 
                      key={community.id} 
                      community={community}
                    />
                  ))
                ) : (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">No communities found</h3>
                      <p className="text-gray-600 mb-4">
                        Try adjusting your search criteria or expanding your search area.
                      </p>
                      <Button onClick={() => setSearchParams({})} variant="outline">
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                )}

                {communities && communities.length > 0 && (
                  <div className="text-center py-8">
                    <Button size="lg">
                      Load More Communities
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
      </div>
    </div>
  );
}
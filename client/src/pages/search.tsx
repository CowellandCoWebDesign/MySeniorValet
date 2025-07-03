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
import { List, Map as MapIcon, Filter, X } from "lucide-react";
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
    enabled: true,
  });

  const handleSearch = (newParams: any) => {
    setSearchParams(prev => ({ ...prev, ...newParams }));
  };

  const handleFiltersChange = (filters: any) => {
    const newParams: SearchCommunity = { ...searchParams };
    
    if (filters.careServices?.length > 0) {
      newParams.careType = filters.careServices[0]; // Use first selected care service
    }
    
    if (filters.amenities?.length > 0) {
      newParams.amenities = filters.amenities;
    }
    
    if (filters.budget) {
      newParams.budget = filters.budget;
    }
    
    if (filters.distance) {
      newParams.distance = filters.distance;
    }
    
    if (filters.minRating) {
      newParams.minRating = filters.minRating;
    }

    if (filters.availability && filters.availability !== "All Status") {
      newParams.availability = filters.availability;
    }

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
    <div className="min-h-screen bg-gray-50">
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
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
            <div>
              <h2 className="text-3xl font-display font-bold text-gray-900 mb-2">
                {isLoading ? "Searching..." : `${communities?.length || 0} Communities Found`}
              </h2>
              <p className="text-gray-600">
                {searchParams.location && `Near ${searchParams.location}`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-4 lg:mt-0">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                {showFilters ? <X className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
                <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
              </Button>
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  onClick={() => setViewMode('list')}
                  className="flex items-center space-x-2"
                >
                  <List className="h-4 w-4" />
                  <span>List View</span>
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'default' : 'outline'}
                  onClick={() => setViewMode('map')}
                  className="flex items-center space-x-2"
                >
                  <MapIcon className="h-4 w-4" />
                  <span>Map View</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Collapsible Filters */}
          {showFilters && (
            <div className="mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <Filters onFiltersChange={handleFiltersChange} />
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
                      showBadges={true}
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
  );
}
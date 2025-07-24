import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'wouter';
import { Search, Filter, List, MapIcon, SlidersHorizontal, X, Star, MapPin, Phone, Globe, Heart, ExternalLink, Home, Moon, Sun, Info, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Separator } from '@/components/ui/separator';
import Map from '@/components/Map';
import MapErrorBoundary from '@/components/MapErrorBoundary';
import { EnhancedCommunityCard } from '@/components/EnhancedCommunityCard';
import { useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

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
  minRating: number;
  amenities: string[];
  budget: string;
  availability: string;
}

export default function MapSearchClean() {
  const [, setLocation] = useLocation();

  // Get search query from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const initialQuery = urlParams.get('location') || urlParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    careType: 'All Types',
    minRating: 0,
    amenities: [],
    budget: 'Any Budget',
    availability: 'All Status'
  });
  const [mapCenter, setMapCenter] = useState<[number, number]>([37.7749, -122.4194]);
  const [mapZoom, setMapZoom] = useState(12);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [mapBounds, setMapBounds] = useState<any>(null);
  const [showBottomPanel, setShowBottomPanel] = useState(false);
  const [panelHeight, setPanelHeight] = useState(75);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [isMapMoving, setIsMapMoving] = useState(false);

  // Create a stable bounds key for query caching
  const boundsKey = useMemo(() => {
    if (!mapBounds) return 'no-bounds';

    const sw = mapBounds.getSouthWest();
    const ne = mapBounds.getNorthEast();

    return `bounds_${sw.lng.toFixed(6)}_${sw.lat.toFixed(6)}_${ne.lng.toFixed(6)}_${ne.lat.toFixed(6)}`;
  }, [mapBounds]);

  // Fetch communities within map bounds for list view
  const { data: mapCommunities = [], isLoading: isLoadingCommunities, isFetching: isFetchingCommunities } = useQuery<Community[]>({
    queryKey: ['communities-spatial', boundsKey, showBottomPanel, viewMode],
    queryFn: async () => {
      if (!mapBounds) {
        console.log('🚫 SKIPPING QUERY - no bounds available');
        return [];
      }

      console.log('🌍 FETCHING COMMUNITIES FOR BOUNDS:', boundsKey);
      const sw = mapBounds.getSouthWest();
      const ne = mapBounds.getNorthEast();

      try {
        const response = await fetch(`/api/communities/search/spatial?swLat=${sw.lat}&swLng=${sw.lng}&neLat=${ne.lat}&neLng=${ne.lng}&limit=100`);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const communities = await response.json();
        console.log(`✅ LOADED ${communities.length} COMMUNITIES FOR BOUNDS:`, boundsKey);

        return communities;
      } catch (error) {
        console.error('❌ SPATIAL QUERY ERROR:', error);
        throw error;
      }
    },
    enabled: !!mapBounds && (showBottomPanel || viewMode === 'list'),
    staleTime: 30000,
    retry: (failureCount, error) => {
      console.log(`Query retry ${failureCount}:`, error);
      return failureCount < 2;
    },
  });

  // Handle initial search query from URL
  useEffect(() => {
    if (initialQuery && !hasSearched) {
      console.log('Performing initial search for:', initialQuery);
      handleLocationSearch(initialQuery);
    }
  }, [initialQuery, hasSearched]);

  const handleCommunityClick = (community: Community) => {
    setSelectedCommunity(community);
    setLocation(`/communities/${community.id}`);
  };

  const handleLocationSearch = async (location: string) => {
    if (!location || location.trim() === '') return;

    setHasSearched(true);
    console.log('🔍 Searching for location:', location);

    // Try to geocode the location using enhanced API
    try {
      const response = await fetch(`/api/communities/search/enhanced?location=${encodeURIComponent(location)}&limit=1`);
      console.log('Enhanced API response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Enhanced API data:', data);

        // Check if metadata has coordinates
        if (data.searchMetadata?.coordinates) {
          console.log('✅ Using searchMetadata coordinates:', data.searchMetadata.coordinates);
          setMapCenter([data.searchMetadata.coordinates.lat, data.searchMetadata.coordinates.lng]);
          setMapZoom(data.searchMetadata.searchType === 'state' ? 7 : 
                    data.searchMetadata.searchType === 'city' ? 12 : 10);
          return;
        }

        // Fallback to first community coordinates if no metadata
        if (data.communities && data.communities.length > 0) {
          const firstCommunity = data.communities[0];
          if (firstCommunity.latitude && firstCommunity.longitude) {
            console.log('✅ Using first community coordinates:', firstCommunity);
            setMapCenter([firstCommunity.latitude, firstCommunity.longitude]);
            setMapZoom(12);
            return;
          }
        }
      }
    } catch (error) {
      console.error('Enhanced API error:', error);
    }

    // Final fallback: manual location mapping
    const locationMap: Record<string, [number, number]> = {
      'redding': [40.5865, -122.3917],
      'redding, ca': [40.5865, -122.3917],
      'california': [36.7783, -119.4179],
      'san francisco': [37.7749, -122.4194],
      'los angeles': [34.0522, -118.2437],
      'sacramento': [38.5816, -121.4944],
    };

    const coords = locationMap[location.toLowerCase()];
    if (coords) {
      setMapCenter(coords);
      const lowerLocation = location.toLowerCase();
      if (lowerLocation === 'california') {
        setMapZoom(6);
      } else {
        setMapZoom(12);
      }
    }
  };

  // Handle map bounds change
  const handleMapBoundsChange = useCallback((bounds: any) => {
    console.log('🗺️ MAP BOUNDS CHANGE DETECTED:', {
      bounds: bounds ? `${bounds.getSouthWest().lng},${bounds.getSouthWest().lat},${bounds.getNorthEast().lng},${bounds.getNorthEast().lat}` : 'null',
      previousBounds: mapBounds ? `${mapBounds.getSouthWest().lng},${mapBounds.getSouthWest().lat},${mapBounds.getNorthEast().lng},${mapBounds.getNorthEast().lat}` : 'null',
      showBottomPanel,
      currentCommunities: mapCommunities.length,
      timestamp: Date.now()
    });

    if (bounds) {
      setMapBounds(bounds);
      setIsMapMoving(true);

      if (showBottomPanel) {
        queryClient.invalidateQueries({ queryKey: ['communities-spatial'] });
      }

      setTimeout(() => setIsMapMoving(false), 800);
    }
  }, [mapBounds, showBottomPanel, mapCommunities.length, queryClient]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const toggleListView = () => {
    setShowBottomPanel(!showBottomPanel);
    if (!showBottomPanel && mapBounds) {
      queryClient.invalidateQueries({ queryKey: ['communities-spatial'] });
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Enhanced Header */}
      <div className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Enhanced Logo */}
            <div className="flex items-center">
              <button
                onClick={() => setLocation('/')}
                className="flex items-center space-x-3 group"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                  <Home className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">MySeniorValet</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Senior Living Search</p>
                </div>
              </button>
            </div>

            {/* Enhanced Search bar */}
            <div className="flex-1 max-w-3xl mx-8 relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search by city, state, or ZIP code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleLocationSearch(searchQuery);
                    }
                  }}
                  className="pl-12 pr-6 py-4 w-full border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-lg transition-all duration-200 hover:bg-white dark:hover:bg-gray-700"
                />
              </div>
            </div>

            {/* Enhanced Controls */}
            <div className="flex items-center space-x-4">
              {/* Enhanced Dark mode toggle */}
              <Button
                variant="ghost"
                size="lg"
                onClick={toggleDarkMode}
                className="text-gray-600 dark:text-gray-300 h-12 w-12 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
              >
                {isDarkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
              </Button>

              {/* Enhanced View toggle */}
              <div className="flex rounded-xl border-2 border-gray-200 dark:border-gray-600 overflow-hidden bg-gray-50 dark:bg-gray-800">
                <Button
                  variant={viewMode === 'map' ? 'default' : 'ghost'}
                  size="lg"
                  onClick={() => setViewMode('map')}
                  className={`rounded-none border-0 h-12 px-6 ${viewMode === 'map' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  <MapIcon className="h-5 w-5 mr-2" />
                  Map
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="lg"
                  onClick={() => setViewMode('list')}
                  className={`rounded-none border-0 h-12 px-6 ${viewMode === 'list' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  <List className="h-5 w-5 mr-2" />
                  List
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative h-[calc(100vh-5rem)]">
        {viewMode === 'map' ? (
          <>
            {/* Map Container */}
            <div className="h-full w-full">
              <MapErrorBoundary>
                <Map
                  searchFilters={filters}
                  onCommunityClick={handleCommunityClick}
                  onBoundsChange={handleMapBoundsChange}
                  center={mapCenter}
                  zoom={mapZoom}
                  height="100%"
                />
              </MapErrorBoundary>
            </div>

            {/* Enhanced Floating list toggle button */}
            <Button
              onClick={toggleListView}
              className="fixed bottom-8 right-8 z-50 rounded-full h-16 w-16 p-0 shadow-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-4 border-white dark:border-gray-800 transition-all duration-300 hover:scale-110"
            >
              <List className="h-7 w-7" />
            </Button>

            {/* Enhanced Bottom panel for list view */}
            {showBottomPanel && (
              <div 
                className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t-2 border-gray-200 dark:border-gray-700 shadow-2xl z-40 overflow-hidden transition-all duration-500 rounded-t-3xl"
                style={{ height: `${panelHeight}vh` }}
              >
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700">
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-12 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Communities in View
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {mapCommunities.length} communities found • {mapCommunities.filter(c => c.hudPropertyId).length} with live data
                      </p>
                    </div>
                    {(isLoadingCommunities || isFetchingCommunities || isMapMoving) && (
                      <div className="flex items-center space-x-3 text-sm text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-full">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        <span className="font-medium">{isMapMoving ? 'Map moving...' : 'Loading communities...'}</span>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={toggleListView}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 h-12 w-12 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>

                <div className="overflow-auto h-full pb-20 bg-gray-50 dark:bg-gray-900">
                  {mapCommunities.length > 0 ? (
                    <div className="grid gap-6 p-6">
                      {mapCommunities.map((community) => (
                        <EnhancedCommunityCard
                          key={community.id}
                          community={community}
                          variant="horizontal"
                          onSelect={() => handleCommunityClick(community)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500 space-y-4">
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <MapIcon className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          {isLoadingCommunities ? 'Finding communities...' : 'No communities in this area'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {isLoadingCommunities ? 'Please wait while we search' : 'Try zooming out or moving the map to explore more areas'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Enhanced List View */
          <div className="h-full overflow-auto bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="max-w-6xl mx-auto p-8">
              {/* Enhanced Header */}
              <div className="mb-8 text-center">
                <div className="inline-flex items-center space-x-3 bg-white dark:bg-gray-800 rounded-2xl px-8 py-4 shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="w-4 h-12 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                      Senior Living Communities
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                      {mapCommunities.length} communities found • {mapCommunities.filter(c => c.hudPropertyId).length} with live data
                    </p>
                  </div>
                </div>
              </div>

              {/* Enhanced Community List */}
              <div className="space-y-8">
                {mapCommunities.map((community, index) => (
                  <div key={community.id} className="group">
                    <EnhancedCommunityCard
                      community={community}
                      variant="horizontal"
                      onSelect={() => handleCommunityClick(community)}
                      index={index}
                    />
                  </div>
                ))}
              </div>

              {/* Enhanced Empty State */}
              {mapCommunities.length === 0 && !isLoadingCommunities && (
                <div className="text-center py-20">
                  <div className="max-w-md mx-auto">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <MapIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      No communities found
                    </h3>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                      Try adjusting your search location or expanding your search area on the map.
                    </p>
                    <Button 
                      onClick={() => setViewMode('map')}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl text-lg font-semibold transition-all duration-300 hover:scale-105"
                    >
                      <MapIcon className="h-5 w-5 mr-2" />
                      Back to Map
                    </Button>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {isLoadingCommunities && (
                <div className="text-center py-20">
                  <div className="max-w-md mx-auto">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      Finding communities...
                    </h3>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                      Please wait while we search for senior living options in your area.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
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
  const [isDarkMode, setIsDarkMode] = useState(true);
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
  const [panelHeight, setPanelHeight] = useState(70);
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
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <button
                onClick={() => setLocation('/')}
                className="text-2xl font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                MySeniorValet
              </button>
            </div>

            {/* Search bar */}
            <div className="flex-1 max-w-2xl mx-8 relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search communities, cities, or neighborhoods..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleLocationSearch(searchQuery);
                    }
                  }}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-3">
              {/* Dark mode toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className="text-gray-600 dark:text-gray-300"
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              {/* View toggle */}
              <div className="flex rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
                <Button
                  variant={viewMode === 'map' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('map')}
                  className="rounded-none border-0"
                >
                  <MapIcon className="h-4 w-4 mr-1" />
                  Map
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-none border-0"
                >
                  <List className="h-4 w-4 mr-1" />
                  List
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative h-[calc(100vh-4rem)]">
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

            {/* Floating list toggle button */}
            <Button
              onClick={toggleListView}
              className="fixed bottom-6 right-6 z-50 rounded-full h-14 w-14 p-0 shadow-lg bg-blue-600 hover:bg-blue-700 text-white border-2 border-white dark:border-gray-800"
            >
              <List className="h-6 w-6" />
            </Button>

            {/* Bottom panel for list view */}
            {showBottomPanel && (
              <div 
                className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-40 overflow-hidden transition-all duration-300"
                style={{ height: `${panelHeight}vh` }}
              >
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Communities in View ({mapCommunities.length})
                    </h3>
                    {(isLoadingCommunities || isFetchingCommunities || isMapMoving) && (
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span>{isMapMoving ? 'Map moving...' : 'Loading communities...'}</span>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleListView}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="overflow-auto h-full pb-16">
                  {mapCommunities.length > 0 ? (
                    <div className="grid gap-4 p-4">
                      {mapCommunities.map((community) => (
                        <EnhancedCommunityCard
                          key={community.id}
                          community={community}
                          onClick={() => handleCommunityClick(community)}
                          className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                      {isLoadingCommunities ? 'Loading communities...' : 'No communities found in this area'}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          /* List View */
          <div className="h-full overflow-auto bg-gray-50 dark:bg-gray-900">
            <div className="max-w-4xl mx-auto p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Senior Living Communities
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {mapCommunities.length} communities found
                </p>
              </div>

              <div className="space-y-6">
                {mapCommunities.map((community) => (
                  <EnhancedCommunityCard
                    key={community.id}
                    community={community}
                    onClick={() => handleCommunityClick(community)}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                  />
                ))}
              </div>

              {mapCommunities.length === 0 && !isLoadingCommunities && (
                <div className="text-center py-12">
                  <MapIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No communities found</h3>
                  <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
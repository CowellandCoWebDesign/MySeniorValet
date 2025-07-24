import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
import MapTutorial from '@/components/MapTutorial';
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

export default function MapSearch() {
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
  const [showTutorial, setShowTutorial] = useState(false);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [isMapMoving, setIsMapMoving] = useState(false);
  const [showExpandedSearch, setShowExpandedSearch] = useState(false);

  // Tutorial disabled - keeping localStorage check for compatibility
  useEffect(() => {
    const hasSeenTutorialBefore = localStorage.getItem('map-tutorial-completed');
    setHasSeenTutorial(true);
  }, []);

  // Debug mapBounds changes
  useEffect(() => {
    console.log('MapBounds updated:', mapBounds ? 'bounds set' : 'bounds null');
    if (mapBounds) {
      console.log('MapBounds details:', {
        sw: mapBounds.getSouthWest(),
        ne: mapBounds.getNorthEast()
      });
    }
  }, [mapBounds]);

  const handleTutorialComplete = () => {
    console.log('handleTutorialComplete called');
    try {
      localStorage.setItem('map-tutorial-completed', 'true');
      console.log('Tutorial completion saved to localStorage');

      setHasSeenTutorial(true);
      console.log('hasSeenTutorial set to true');

      setShowTutorial(false);
      console.log('showTutorial set to false');

      setTimeout(() => {
        document.querySelectorAll('.tutorial-highlight').forEach(el => el.remove());
        console.log('Tutorial cleanup completed');
      }, 100);

    } catch (error) {
      console.error('Error in handleTutorialComplete:', error);
      setShowTutorial(false);
    }
  };

  const handleStartTutorial = () => {
    setShowTutorial(true);
  };

  // Debug log
  console.log('Map Search Component - showBottomPanel:', showBottomPanel, 'viewMode:', viewMode);
  console.log('Tutorial state - hasSeenTutorial:', hasSeenTutorial, 'showTutorial:', showTutorial);
  console.log('Map Search state:', { 
    mapCenter, 
    mapZoom, 
    hasFilters: Object.keys(filters).length > 0,
    mapBounds: mapBounds ? 'set' : 'null'
  });

  // Create a stable bounds key for query caching
  const boundsKey = useMemo(() => {
    if (!mapBounds) return 'no-bounds';

    const sw = mapBounds.getSouthWest();
    const ne = mapBounds.getNorthEast();

    return `bounds_${sw.lng.toFixed(6)}_${sw.lat.toFixed(6)}_${ne.lng.toFixed(6)}_${ne.lat.toFixed(6)}`;
  }, [mapBounds]);

  // Fetch communities within map bounds for list view
  const { data: mapCommunities = [], isLoading: isLoadingCommunities, isFetching: isFetchingCommunities, refetch: refetchCommunities, error: communitiesError } = useQuery<Community[]>({
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

  // Aggressive debug logging for communities
  useEffect(() => {
    console.log('🔄 COMMUNITIES STATE UPDATE:', {
      mapCount: mapCommunities.length,
      isLoading: isLoadingCommunities,
      isFetching: isFetchingCommunities,
      hasBounds: !!mapBounds,
      showBottomPanel,
      error: communitiesError ? communitiesError.message : null,
      mapCommunities: mapCommunities.slice(0, 5).map((c: Community) => `${c.name} (${c.city})`),
      boundsKey: boundsKey,
      timestamp: Date.now()
    });

    if (communitiesError) {
      console.error('🚨 COMMUNITIES ERROR DETAILS:', communitiesError);
    }
  }, [mapCommunities, isLoadingCommunities, isFetchingCommunities, mapBounds, showBottomPanel, boundsKey, communitiesError]);

  // Handle initial search query from URL
  useEffect(() => {
    if (initialQuery && !hasSearched) {
      console.log('Performing initial search for:', initialQuery);
      handleLocationSearch(initialQuery);
    }
  }, [initialQuery, hasSearched]);

  // Debounced search suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      setLoadingSuggestions(true);
      try {
        const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.slice(0, 8));
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

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
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(e.target.value.length > 0);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleLocationSearch(searchQuery);
                      setShowSuggestions(false);
                    }
                    if (e.key === 'Escape') {
                      setShowSuggestions(false);
                    }
                  }}
                  onFocus={() => setShowSuggestions(searchQuery.length > 0)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Autocomplete suggestions */}
              {showSuggestions && searchQuery.length > 0 && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 max-h-60 overflow-auto">
                  {loadingSuggestions ? (
                    <div className="p-4 text-center text-gray-500">Loading suggestions...</div>
                  ) : (
                    suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                        onClick={() => {
                          setSearchQuery(suggestion);
                          handleLocationSearch(suggestion);
                          setShowSuggestions(false);
                        }}
                      >
                        <Search className="inline h-4 w-4 mr-2 text-gray-400" />
                        {suggestion}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <Button
                  variant={viewMode === 'map' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setViewMode('map');
                    setShowBottomPanel(false);
                  }}
                  className={viewMode === 'map' ? '' : 'text-gray-600 dark:text-gray-300'}
                >
                  <MapIcon className="h-4 w-4 mr-2" />
                  Map
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setViewMode('list');
                    setShowBottomPanel(true);
                  }}
                  className={viewMode === 'list' ? '' : 'text-gray-600 dark:text-gray-300'}
                >
                  <List className="h-4 w-4 mr-2" />
                  List
                </Button>
              </div>

              <Drawer>
                <DrawerTrigger asChild>
                  <Button variant="outline" size="sm" className="border-gray-300 dark:border-gray-600">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="bg-white dark:bg-gray-800">
                  <DrawerHeader>
                    <DrawerTitle className="text-gray-900 dark:text-white">Search Filters</DrawerTitle>
                  </DrawerHeader>
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Care Type
                      </label>
                      <Select value={filters.careType} onValueChange={(value) => setFilters({...filters, careType: value})}>
                        <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                          <SelectItem value="All Types">All Types</SelectItem>
                          <SelectItem value="Independent Living">Independent Living</SelectItem>
                          <SelectItem value="Assisted Living">Assisted Living</SelectItem>
                          <SelectItem value="Memory Care">Memory Care</SelectItem>
                          <SelectItem value="Skilled Nursing">Skilled Nursing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Minimum Rating
                      </label>
                      <Select value={filters.minRating.toString()} onValueChange={(value) => setFilters({...filters, minRating: parseInt(value)})}>
                        <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                          <SelectItem value="0">Any Rating</SelectItem>
                          <SelectItem value="3">3+ Stars</SelectItem>
                          <SelectItem value="4">4+ Stars</SelectItem>
                          <SelectItem value="5">5 Stars</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Budget Range
                      </label>
                      <Select value={filters.budget} onValueChange={(value) => setFilters({...filters, budget: value})}>
                        <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                          <SelectItem value="Any Budget">Any Budget</SelectItem>
                          <SelectItem value="Under $3,000">Under $3,000</SelectItem>
                          <SelectItem value="$3,000 - $5,000">$3,000 - $5,000</SelectItem>
                          <SelectItem value="$5,000 - $7,000">$5,000 - $7,000</SelectItem>
                          <SelectItem value="Above $7,000">Above $7,000</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </DrawerContent>
              </Drawer>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative h-[calc(100vh-4rem)]">
        {viewMode === 'map' ? (
          <div className="relative h-full">
            <MapErrorBoundary>
              <Map
                center={mapCenter}
                zoom={mapZoom}
                onBoundsChange={handleMapBoundsChange}
                selectedCommunity={selectedCommunity}
                onCommunityClick={handleCommunityClick}
                isDarkMode={isDarkMode}
                communities={mapCommunities}
              />
            </MapErrorBoundary>

            {showTutorial && (
              <MapTutorial
                isOpen={showTutorial}
                onComplete={handleTutorialComplete}
                onClose={() => setShowTutorial(false)}
              />
            )}

            {/* Map Controls */}
            <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleStartTutorial}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 shadow-lg"
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Help
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBottomPanel(!showBottomPanel)}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 shadow-lg"
              >
                <List className="h-4 w-4 mr-2" />
                {showBottomPanel ? 'Hide List' : 'Show List'}
              </Button>
            </div>

            {/* Bottom Panel */}
            {showBottomPanel && (
              <div 
                className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-20 overflow-hidden"
                style={{ height: `${panelHeight}%` }}
              >
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {isLoadingCommunities ? 'Loading Communities...' : 
                     `${mapCommunities.length} Communities Found`}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPanelHeight(panelHeight === 70 ? 40 : 70)}
                      className="text-gray-600 dark:text-gray-400"
                    >
                      {panelHeight === 70 ? 'Minimize' : 'Expand'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowBottomPanel(false)}
                      className="text-gray-600 dark:text-gray-400"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-4 h-full overflow-y-auto">
                  {isLoadingCommunities ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="text-gray-500 dark:text-gray-400">Loading communities...</div>
                    </div>
                  ) : mapCommunities.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        No communities found in this area.
                      </p>
                      <Button
                        onClick={() => setShowExpandedSearch(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Search Nearby Areas
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {mapCommunities.map((community) => (
                        <EnhancedCommunityCard
                          key={community.id}
                          community={community}
                          onClick={() => handleCommunityClick(community)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          // List View
          <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Senior Living Communities
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {isLoadingCommunities ? 'Loading...' : `${mapCommunities.length} communities found`}
                </p>
              </div>

              {isLoadingCommunities ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-400">Loading communities...</span>
                </div>
              ) : mapCommunities.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                    No communities found in this area.
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm">
                    Try zooming out or searching a different location.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {mapCommunities.map((community) => (
                    <EnhancedCommunityCard
                      key={community.id}
                      community={community}
                      variant="horizontal"
                      onSelect={() => handleCommunityClick(community)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
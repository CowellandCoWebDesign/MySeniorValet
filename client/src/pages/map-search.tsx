import React, { useState, useEffect, useCallback } from 'react';
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
  const initialQuery = urlParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode for eye comfort
  const [filters, setFilters] = useState<SearchFilters>({
    careType: 'All Types',
    minRating: 0,
    amenities: [],
    budget: 'Any Budget',
    availability: 'All Status'
  });
  const [mapCenter, setMapCenter] = useState<[number, number]>([37.7749, -122.4194]); // San Francisco - city center
  const [mapZoom, setMapZoom] = useState(12); // City-level zoom (12-14 shows individual locations)
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [mapBounds, setMapBounds] = useState<any>(null);
  const [showBottomPanel, setShowBottomPanel] = useState(false);
  const [panelHeight, setPanelHeight] = useState(70); // Percentage of screen height - increased for better visibility
  const [showTutorial, setShowTutorial] = useState(false);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Check if user has seen tutorial before (localStorage)
  useEffect(() => {
    const hasSeenTutorialBefore = localStorage.getItem('map-tutorial-completed');
    setHasSeenTutorial(!!hasSeenTutorialBefore);
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

  // Auto-show tutorial for first-time users
  useEffect(() => {
    if (!hasSeenTutorial && viewMode === 'map') {
      const timer = setTimeout(() => {
        try {
          setShowTutorial(true);
        } catch (error) {
          console.error('Error showing tutorial:', error);
        }
      }, 2000); // Show tutorial after 2 seconds for first-time users
      return () => clearTimeout(timer);
    }
  }, [hasSeenTutorial, viewMode]);

  const handleTutorialComplete = () => {
    console.log('handleTutorialComplete called');
    try {
      localStorage.setItem('map-tutorial-completed', 'true');
      console.log('Tutorial completion saved to localStorage');
      
      setHasSeenTutorial(true);
      console.log('hasSeenTutorial set to true');
      
      setShowTutorial(false);
      console.log('showTutorial set to false');
      
      // Force cleanup of any remaining tutorial elements
      setTimeout(() => {
        document.querySelectorAll('.tutorial-highlight').forEach(el => el.remove());
        console.log('Tutorial cleanup completed');
      }, 100);
      
    } catch (error) {
      console.error('Error in handleTutorialComplete:', error);
      // Force close tutorial even on error
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
  
  // Fetch communities within map bounds for list view
  const { data: mapCommunities = [], isLoading: isLoadingCommunities, isFetching: isFetchingCommunities, refetch: refetchCommunities } = useQuery({
    queryKey: ['communities-map-bounds', mapBounds ? 'has-bounds' : 'no-bounds'],
    queryFn: async () => {
      if (!mapBounds) return [];
      
      try {
        const sw = mapBounds.getSouthWest();
        const ne = mapBounds.getNorthEast();
        
        // Add a minimal buffer (0.5%) for very close zoom to ensure edge communities are included
        const latBuffer = (ne.lat - sw.lat) * 0.005;
        const lngBuffer = (ne.lng - sw.lng) * 0.005;
        
        console.log('Fetching communities for bounds:', {
          sw: { lat: sw.lat, lng: sw.lng },
          ne: { lat: ne.lat, lng: ne.lng },
          showBottomPanel
        });
        
        const params = new URLSearchParams({
          swLat: (sw.lat - latBuffer).toString(),
          swLng: (sw.lng - lngBuffer).toString(),
          neLat: (ne.lat + latBuffer).toString(),
          neLng: (ne.lng + lngBuffer).toString(),
          limit: '100',
          ...(filters.careType !== 'All Types' && { careType: filters.careType }),
          ...(filters.minRating > 0 && { minRating: filters.minRating.toString() }),
        });
        
        console.log('Making spatial search request to:', `/api/communities/search/spatial?${params}`);
        console.log('Window origin:', window.location.origin);
        
        const response = await fetch(`/api/communities/search/spatial?${params}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          console.error('Spatial search failed:', {
            status: response.status, 
            statusText: response.statusText,
            url: response.url,
            origin: window.location.origin,
            href: window.location.href
          });
          throw new Error(`Failed to fetch communities: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Spatial search response:', {
          count: data.length,
          firstCommunity: data[0] ? data[0].name : 'none',
          allNames: data.slice(0, 5).map((c: any) => c.name)
        });
        return data;
      } catch (error) {
        console.error('Error fetching communities:', error);
        return [];
      }
    },
    enabled: !!mapBounds, // Fetch when we have bounds
    staleTime: 0, // No cache - always fresh data
    gcTime: 0, // No garbage collection time
    retry: 1, // Only retry once on failure
    refetchOnMount: 'always', // Always refetch when component mounts
    refetchOnWindowFocus: false,
  });

  // State for expanded search
  const [showExpandedSearch, setShowExpandedSearch] = useState(false);
  
  // Debug communities after query
  console.log('Communities fetched:', {
    count: mapCommunities.length,
    isLoading: isLoadingCommunities,
    hasBounds: !!mapBounds,
    showBottomPanel,
    communities: mapCommunities.slice(0, 3).map(c => c.name)
  });

  // State to track if we're waiting for initial load
  const [isInitialLoad, setIsInitialLoad] = useState(false);

  // Force refetch when panel opens or bounds change
  useEffect(() => {
    if (showBottomPanel && mapBounds) {
      console.log('Panel is open with bounds, triggering refetch...');
      refetchCommunities();
    }
  }, [showBottomPanel, mapBounds, refetchCommunities]);

  // Fetch expanded search results when no communities in current view
  const { data: expandedCommunities = [], isLoading: isLoadingExpanded } = useQuery({
    queryKey: ['communities-expanded-search', mapBounds],
    queryFn: async () => {
      if (!mapBounds) return [];
      
      try {
        // Get center of current map view
        const center = mapBounds.getCenter();
        const centerLat = center.lat;
        const centerLng = center.lng;
        
        // Search for closest communities within a larger radius (100km)
        const response = await fetch(`/api/communities/search/nearest?lat=${centerLat}&lng=${centerLng}&radius=100&limit=20`);
        if (!response.ok) throw new Error('Failed to fetch expanded communities');
        return response.json();
      } catch (error) {
        console.error('Error fetching expanded communities:', error);
        return [];
      }
    },
    enabled: !!mapBounds && showBottomPanel && showExpandedSearch,
    staleTime: 30000,
    retry: 1,
  });

  // Handle initial search query from URL
  useEffect(() => {
    if (initialQuery) {
      handleLocationSearch(initialQuery);
    }
  }, [initialQuery]);

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

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

  const handleLocationSearch = async (location: string) => {
    // Try to geocode the location
    try {
      const response = await fetch(`/api/communities/search/enhanced?location=${encodeURIComponent(location)}&limit=1`);
      if (response.ok) {
        const data = await response.json();
        if (data.searchMetadata?.coordinates) {
          setMapCenter([data.searchMetadata.coordinates.lat, data.searchMetadata.coordinates.lng]);
          setMapZoom(data.searchMetadata.searchType === 'state' ? 8 : 12);
          return;
        }
      }
    } catch (error) {
      console.error('Error searching location:', error);
    }

    
    // Fallback to manual mapping
    const locationMap: Record<string, [number, number]> = {
      'san francisco': [37.7749, -122.4194],
      'los angeles': [34.0522, -118.2437],
      'sacramento': [38.5816, -121.4944],
      'san diego': [32.7157, -117.1611],
      'fresno': [36.7378, -119.7871],
      'san jose': [37.3382, -121.8863],
      'california': [36.7783, -119.4179],
    };
    
    const coords = locationMap[location.toLowerCase()];
    if (coords) {
      setMapCenter(coords);
      setMapZoom(location.toLowerCase() === 'california' ? 6 : 12);
    }
  };

  const handleCommunityClick = (community: Community) => {
    setSelectedCommunity(community);
    setLocation(`/communities/${community.id}`);
  };
  
  // Handle map bounds change with proper debugging
  const handleMapBoundsChange = useCallback((bounds: any) => {
    console.log('Map bounds changed in MapSearch:', bounds);
    console.log('Setting mapBounds state, current communities:', mapCommunities.length);
    setMapBounds(bounds);
  }, [mapCommunities.length]);

  const handleClusterClick = (clusterId: number, lat: number, lng: number, zoomLevel: number) => {
    // FIXED: Do not switch to list view automatically on cluster clicks
    // Let users manually control view mode via the floating button
    // The Map component will handle the zoom-in functionality
    console.log(`Cluster ${clusterId} clicked at zoom ${zoomLevel} - staying in map view for drill-down`);
  };

  const availableAmenities = [
    'Pet Friendly',
    'Fitness Center',
    'Swimming Pool',
    'Transportation',
    'Dining Services',
    'Laundry Services',
    'Housekeeping',
    'Activities Program',
    'Beauty/Barber Shop',
    'Library',
    'Chapel Services',
    'Memory Care',
    'Rehabilitation Services'
  ];

  const clearFilters = () => {
    setFilters({
      careType: 'All Types',
      minRating: 0,
      amenities: [],
      budget: 'Any Budget',
      availability: 'All Status'
    });
  };

  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== 'All Types' && value !== 'Any Budget' && value !== 'All Status' && 
    value !== 0 && (Array.isArray(value) ? value.length > 0 : true)
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
      {/* Header */}
      <div className={`shadow-sm border-b ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/')}
                className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white'}`}
              >
                ← Back
              </Button>
              <div 
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setLocation('/')}
              >
                <Home className="w-5 h-5 text-blue-600" />
                <span className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  MySeniorValet
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Tutorial Help Button - Only show in map mode */}
              {viewMode === 'map' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleStartTutorial}
                  className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white'}`}
                  title="Map Navigation Tutorial"
                >
                  <HelpCircle className="w-4 h-4" />
                </Button>
              )}
              
              {/* Dark Mode Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white'}`}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              
              {/* View Mode Toggles - List button opens bottom panel */}
              <div className="flex items-center gap-1 bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setViewMode('map');
                    setShowBottomPanel(false);
                  }}
                  className={`relative transition-all duration-300 ${
                    viewMode === 'map' && !showBottomPanel
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105' 
                      : isDarkMode 
                      ? 'text-gray-300 hover:text-white hover:bg-gray-600' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white hover:bg-gray-100 dark:bg-gray-700'
                  }`}
                >
                  <MapIcon className="w-4 h-4" />
                  {viewMode === 'map' && !showBottomPanel && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-md animate-pulse opacity-20"></div>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setViewMode('map'); // Stay in map mode
                    setShowBottomPanel(true); // Open bottom panel for list
                  }}
                  className={`relative transition-all duration-300 ${
                    showBottomPanel 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105' 
                      : isDarkMode 
                      ? 'text-gray-300 hover:text-white hover:bg-gray-600' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white hover:bg-gray-100 dark:bg-gray-700'
                  }`}
                >
                  <List className="w-4 h-4" />
                  {showBottomPanel && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-md animate-pulse opacity-20"></div>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className={`border-b p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search city, state or ZIP code"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleLocationSearch(searchQuery);
                  setShowSuggestions(false);
                }
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className={`pl-10 ${isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500' 
                : 'bg-white dark:bg-gray-800 border-gray-300 text-gray-900 dark:text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500'
              }`}
            />
            {/* Autocomplete suggestions */}
            {showSuggestions && searchQuery.length > 0 && suggestions.length > 0 && (
              <div className={`absolute top-full left-0 right-0 mt-1 rounded-md shadow-lg z-50 max-h-60 overflow-auto ${
                isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
              } border`}>
                {loadingSuggestions ? (
                  <div className="px-4 py-2 text-gray-500">Loading...</div>
                ) : (
                  suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      className={`w-full text-left px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-600 ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSearchQuery(suggestion);
                        handleLocationSearch(suggestion);
                        setShowSuggestions(false);
                      }}
                    >
                      <div className="font-medium">{suggestion}</div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          <Button 
            onClick={() => {
              handleLocationSearch(searchQuery);
              setShowSuggestions(false);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Search
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className={`border-b p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
        <div className="flex items-center gap-2 overflow-x-auto">
          <Drawer>
            <DrawerTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className={isDarkMode 
                  ? 'border-gray-600 bg-gray-700 text-white hover:bg-gray-600' 
                  : 'border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:bg-gray-800'
                }
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="destructive" className="ml-2 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Filter Communities</DrawerTitle>
              </DrawerHeader>
              <div className="p-4 space-y-4">
                {/* Care Type Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Care Type</label>
                  <Select value={filters.careType} onValueChange={(value) => setFilters({...filters, careType: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Types">All Types</SelectItem>
                      <SelectItem value="Independent Living">Independent Living</SelectItem>
                      <SelectItem value="Assisted Living">Assisted Living</SelectItem>
                      <SelectItem value="Memory Care">Memory Care</SelectItem>
                      <SelectItem value="Skilled Nursing">Skilled Nursing</SelectItem>
                      <SelectItem value="Continuing Care">Continuing Care</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Budget Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Budget</label>
                  <Select value={filters.budget} onValueChange={(value) => setFilters({...filters, budget: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Any Budget">Any Budget</SelectItem>
                      <SelectItem value="Under $3,000">Under $3,000</SelectItem>
                      <SelectItem value="$3,000 - $5,000">$3,000 - $5,000</SelectItem>
                      <SelectItem value="$5,000 - $7,000">$5,000 - $7,000</SelectItem>
                      <SelectItem value="$7,000+">$7,000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Minimum Rating</label>
                  <Select value={filters.minRating.toString()} onValueChange={(value) => setFilters({...filters, minRating: parseInt(value)})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Any Rating</SelectItem>
                      <SelectItem value="3">3+ Stars</SelectItem>
                      <SelectItem value="4">4+ Stars</SelectItem>
                      <SelectItem value="5">5 Stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Amenities Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Amenities</label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableAmenities.map((amenity) => (
                      <Button
                        key={amenity}
                        variant={filters.amenities.includes(amenity) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          const newAmenities = filters.amenities.includes(amenity)
                            ? filters.amenities.filter(a => a !== amenity)
                            : [...filters.amenities, amenity];
                          setFilters({...filters, amenities: newAmenities});
                        }}
                      >
                        {amenity}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={clearFilters} variant="outline" className="flex-1">
                    Clear All
                  </Button>
                  <Button className="flex-1">Apply Filters</Button>
                </div>
              </div>
            </DrawerContent>
          </Drawer>

          {/* Map Legend Info Button - Only in Map View */}
          {viewMode === 'map' && (
            <Drawer>
              <DrawerTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={isDarkMode 
                    ? 'border-gray-600 bg-gray-700 text-white hover:bg-gray-600' 
                    : 'border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:bg-gray-800'
                  }
                >
                  <Info className="w-4 h-4 mr-2" />
                  Legend
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Map Legend</DrawerTitle>
                </DrawerHeader>
                <div className="p-4 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        #
                      </div>
                      <span className="text-sm">Cluster (Multiple Communities)</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                      <span className="text-sm">General Community</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                      <span className="text-sm">Assisted Living</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-red-600 rounded-full"></div>
                      <span className="text-sm">Memory Care</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
                      <span className="text-sm">Independent Living</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Click on markers to view community details. Click on clusters to zoom in and see individual communities.
                    </p>
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          )}

          {/* Active Filters */}
          {filters.careType !== 'All Types' && (
            <Badge variant="secondary" className={`gap-1 ${isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 dark:text-gray-200 hover:bg-gray-300'}`}>
              {filters.careType}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters({...filters, careType: 'All Types'})} />
            </Badge>
          )}
          {filters.budget !== 'Any Budget' && (
            <Badge variant="secondary" className={`gap-1 ${isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 dark:text-gray-200 hover:bg-gray-300'}`}>
              {filters.budget}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters({...filters, budget: 'Any Budget'})} />
            </Badge>
          )}
          {filters.minRating > 0 && (
            <Badge variant="secondary" className={`gap-1 ${isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 dark:text-gray-200 hover:bg-gray-300'}`}>
              {filters.minRating}+ Stars
              <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters({...filters, minRating: 0})} />
            </Badge>
          )}
          {filters.amenities.map((amenity) => (
            <Badge key={amenity} variant="secondary" className={`gap-1 ${isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 dark:text-gray-200 hover:bg-gray-300'}`}>
              {amenity}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => setFilters({...filters, amenities: filters.amenities.filter(a => a !== amenity)})} 
              />
            </Badge>
          ))}
        </div>
      </div>

      {/* Map Container - Always show map */}
      <div className="flex-1">
        <div className="h-full" style={{ minHeight: '600px' }}>
          <MapErrorBoundary>
            <Map
              center={mapCenter}
              zoom={mapZoom}
              height="100%"
              searchFilters={filters}
              onCommunityClick={handleCommunityClick}
              onBoundsChange={handleMapBoundsChange}
              onClusterClick={handleClusterClick}
            />
          </MapErrorBoundary>
        </div>
      </div>

      {/* Enhanced Bottom Slide Panel - Fixed visibility */}
      <div 
        className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 dark:bg-gray-900 shadow-2xl rounded-t-2xl transition-all duration-500 ease-out z-[998] border-t-4 border-blue-500 ${
          showBottomPanel ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
        style={{ 
          height: showBottomPanel ? `${panelHeight}vh` : '0vh',
          minHeight: showBottomPanel ? '300px' : '0px',
          maxHeight: '80vh'
        }}
      >
        {/* Panel Handle - Enhanced visibility */}
        <div className="flex justify-center pt-3 pb-2 bg-blue-50 dark:bg-blue-900/30">
          <div 
            className="w-16 h-2 bg-blue-400 rounded-full cursor-grab active:cursor-grabbing shadow-sm"
            onMouseDown={(e) => {
              // Add drag functionality for resizing panel
              const startY = e.clientY;
              const startHeight = panelHeight;
              
              const handleMouseMove = (e: MouseEvent) => {
                const deltaY = startY - e.clientY;
                const newHeight = Math.max(20, Math.min(80, startHeight + (deltaY / window.innerHeight) * 100));
                setPanelHeight(newHeight);
              };
              
              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };
              
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          />
        </div>

        {/* Panel Header - Enhanced visibility */}
        <div className="px-4 pb-3 border-b-2 border-blue-200 dark:border-blue-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2">
              🏠 {!mapBounds ? 'Position map to see communities' : 
               isLoadingCommunities ? 'Loading communities...' : 
               `${mapCommunities.length} Communities Found`}
              {isFetchingCommunities && !isLoadingCommunities && (
                <div className="inline-flex items-center gap-1 text-sm font-normal text-blue-600 dark:text-blue-400">
                  <div className="w-3 h-3 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  Updating...
                </div>
              )}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBottomPanel(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Enhanced Panel Content - Beautiful List View */}
        <div className="overflow-y-auto p-4 bg-gradient-to-b from-blue-50/30 to-white dark:from-blue-900/10 dark:to-gray-900" style={{ height: `calc(${panelHeight}vh - 140px)` }}>
          {!mapBounds ? (
            <div className="text-center py-12">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 mx-4">
                <MapIcon className="w-16 h-16 mx-auto text-blue-500 mb-4" />
                <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Explore Communities on Map
                </h4>
                <p className="text-blue-700 dark:text-blue-300">
                  Pan and zoom the map to discover senior living communities in your area
                </p>
              </div>
            </div>
          ) : (isLoadingCommunities || isFetchingCommunities) ? (
            <div className="space-y-4">
              {/* Playful loading animation */}
              <div className="text-center py-8">
                <div className="relative inline-block">
                  <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-700 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <p className="mt-4 text-blue-600 dark:text-blue-400 font-medium animate-pulse">
                  Finding communities in this area...
                </p>
                <div className="flex justify-center gap-1 mt-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '200ms'}}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '400ms'}}></div>
                </div>
              </div>
              {/* Skeleton cards */}
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 animate-pulse border border-blue-200 dark:border-blue-700">
                  <div className="h-6 bg-blue-200 dark:bg-blue-700 rounded-lg mb-3"></div>
                  <div className="h-4 bg-blue-150 dark:bg-blue-600 rounded mb-2 w-3/4"></div>
                  <div className="h-4 bg-blue-150 dark:bg-blue-600 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : mapCommunities.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl p-8 mx-4">
                <MapIcon className="w-16 h-16 mx-auto text-orange-500 mb-4" />
                <h4 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-2">
                  No Communities Found
                </h4>
                <p className="text-orange-700 dark:text-orange-300">
                  Try zooming out or searching a different area
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {mapCommunities.map((community, index) => (
                <div
                  key={community.id}
                  className="bg-gradient-to-r from-white to-blue-50/50 dark:from-gray-800 dark:to-blue-900/20 rounded-xl border-2 border-blue-200/50 dark:border-blue-700/50 p-5 cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300 hover:border-blue-400 dark:hover:border-blue-500"
                  onClick={() => handleCommunityClick(community)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-4">
                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <h4 className="font-bold text-lg text-gray-900 dark:text-white dark:text-white line-clamp-2 mb-1">
                            {community.name}
                          </h4>
                          <p className="text-sm text-blue-700 dark:text-blue-300 line-clamp-1 mb-3">
                            📍 {community.address}, {community.city}, {community.state}
                          </p>
                          
                          {/* Care Types */}
                          {community.careTypes && community.careTypes.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {community.careTypes.slice(0, 2).map((type, typeIndex) => (
                                <span key={typeIndex} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 text-xs rounded-full font-medium">
                                  {type}
                                </span>
                              ))}
                              {community.careTypes.length > 2 && (
                                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200 text-xs rounded-full font-medium">
                                  +{community.careTypes.length - 2} more
                                </span>
                              )}
                            </div>
                          )}
                          
                          {/* Rating and Availability */}
                          <div className="flex items-center gap-4 mb-3">
                            {community.rating > 0 && (
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-bold text-gray-900 dark:text-white dark:text-white">
                                  {community.rating}
                                </span>
                                <span className="text-xs text-gray-500">
                                  ({community.reviewCount || 0} reviews)
                                </span>
                              </div>
                            )}
                            
                            {community.availability && (
                              <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                                community.availability === 'Available' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200'
                                  : community.availability === 'Limited'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200'
                              }`}>
                                {community.availability}
                              </div>
                            )}
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 font-medium"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCommunityClick(community);
                              }}
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              View Details
                            </Button>
                            
                            {community.phone && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(`tel:${community.phone}`);
                                }}
                              >
                                <Phone className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Price Display */}
                    <div className="text-right pl-2">
                      <div className="bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 rounded-lg p-3 border border-green-200 dark:border-green-700">
                        <div className="text-lg font-bold text-green-800 dark:text-green-200">
                          {typeof community.priceRange === 'string' 
                            ? community.priceRange 
                            : community.priceRange?.min 
                            ? `$${community.priceRange.min.toLocaleString()}`
                            : '$3,800'}
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-400">
                          {!community.claimed ? 'estimated' : 'live pricing'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Floating Action Button with Toggle Functionality */}
      {viewMode === 'map' && (
        <div className="fixed bottom-6 right-6 z-[1000]">
          {!showBottomPanel && (
            <>
              {/* Pulse rings for attention when panel is closed */}
              <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20"></div>
              <div className="absolute inset-0 bg-purple-500 rounded-full animate-ping opacity-20" style={{animationDelay: '0.5s'}}></div>
            </>
          )}
          
          <Button
            onClick={() => {
              console.log(`Floating button clicked! ${showBottomPanel ? 'Closing' : 'Opening'} list view...`);
              if (!showBottomPanel) {
                setPanelHeight(70); // Set to 70% when opening
                setShowBottomPanel(true);
              } else {
                setShowBottomPanel(false);
              }
            }}
            className={`relative transition-all duration-300 transform hover:scale-105 group w-14 h-14 rounded-full shadow-lg hover:shadow-xl ${
              showBottomPanel 
                ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white' 
                : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
            }`}
            title={showBottomPanel ? "Close Communities List" : "View Communities List"}
            size="lg"
          >
            {showBottomPanel ? <X className="w-6 h-6" /> : <List className="w-6 h-6" />}
            
            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              {showBottomPanel ? "Close List ▲" : "View List ▲"}
            </div>
          </Button>
        </div>
      )}

      {/* Map Navigation Tutorial */}
      {showTutorial && (
        <MapTutorial
          isVisible={showTutorial}
          onClose={() => {
            console.log('Tutorial onClose called directly');
            setShowTutorial(false);
            // Cleanup any tutorial elements
            setTimeout(() => {
              document.querySelectorAll('.tutorial-highlight').forEach(el => el.remove());
            }, 100);
          }}
          onComplete={handleTutorialComplete}
        />
      )}
    </div>
  );
}
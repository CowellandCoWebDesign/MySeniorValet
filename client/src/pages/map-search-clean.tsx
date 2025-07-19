import React, { useState, useEffect } from 'react';
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
import { useQuery } from '@tanstack/react-query';

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
  const [mapCenter, setMapCenter] = useState<[number, number]>([34.0522, -118.2437]); // Los Angeles - city center
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
    hasFilters: Object.keys(filters).length > 0 
  });
  
  // Fetch communities within map bounds for list view
  const { data: mapCommunities = [], isLoading: isLoadingCommunities } = useQuery({
    queryKey: ['communities-map-bounds', mapBounds, filters],
    queryFn: async () => {
      if (!mapBounds) return [];
      
      try {
        const sw = mapBounds.getSouthWest();
        const ne = mapBounds.getNorthEast();
        
        const params = new URLSearchParams({
          swLat: sw.lat.toString(),
          swLng: sw.lng.toString(),
          neLat: ne.lat.toString(),
          neLng: ne.lng.toString(),
          limit: '50',
          ...(filters.careType !== 'All Types' && { careType: filters.careType }),
          ...(filters.minRating > 0 && { minRating: filters.minRating.toString() }),
        });
        
        const response = await fetch(`/api/communities/search/spatial?${params}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch communities');
        }
        
        return response.json();
      } catch (error) {
        console.warn('Error fetching communities:', error);
        return [];
      }
    },
    enabled: !!mapBounds && viewMode === 'list',
    staleTime: 30000, // Cache for 30 seconds
    retry: 1, // Only retry once on failure
  });

  // State for expanded search
  const [showExpandedSearch, setShowExpandedSearch] = useState(false);

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
    enabled: !!mapBounds && viewMode === 'list' && showExpandedSearch,
    staleTime: 30000,
    retry: 1,
  });

  // Handle initial search query from URL
  useEffect(() => {
    if (initialQuery) {
      handleLocationSearch(initialQuery);
    }
  }, [initialQuery]);

  const getLocationSuggestions = (query: string) => {
    const locations = [
      { name: 'Los Angeles, CA', state: 'California', coords: [34.0522, -118.2437] },
      { name: 'San Francisco, CA', state: 'California', coords: [37.7749, -122.4194] },
      { name: 'San Diego, CA', state: 'California', coords: [32.7157, -117.1611] },
      { name: 'Sacramento, CA', state: 'California', coords: [38.5816, -121.4944] },
      { name: 'San Jose, CA', state: 'California', coords: [37.3382, -121.8863] },
      { name: 'Fresno, CA', state: 'California', coords: [36.7378, -119.7871] },
      { name: 'Oakland, CA', state: 'California', coords: [37.8044, -122.2712] },
      { name: 'Long Beach, CA', state: 'California', coords: [33.7701, -118.1937] },
      { name: 'Bakersfield, CA', state: 'California', coords: [35.3733, -119.0187] },
      { name: 'Anaheim, CA', state: 'California', coords: [33.8366, -117.9143] },
      { name: 'Santa Monica, CA', state: 'California', coords: [34.0195, -118.4912] },
      { name: 'Pasadena, CA', state: 'California', coords: [34.1478, -118.1445] },
      { name: 'Riverside, CA', state: 'California', coords: [33.9806, -117.3755] },
      { name: 'Houston, TX', state: 'Texas', coords: [29.7604, -95.3698] },
      { name: 'Dallas, TX', state: 'Texas', coords: [32.7767, -96.7970] },
      { name: 'Phoenix, AZ', state: 'Arizona', coords: [33.4484, -112.0740] },
      { name: 'Las Vegas, NV', state: 'Nevada', coords: [36.1699, -115.1398] },
      { name: 'Seattle, WA', state: 'Washington', coords: [47.6062, -122.3321] },
      { name: 'Portland, OR', state: 'Oregon', coords: [45.5152, -122.6784] },
      { name: 'Denver, CO', state: 'Colorado', coords: [39.7392, -104.9903] },
    ];
    
    const lowerQuery = query.toLowerCase();
    return locations
      .filter(loc => loc.name.toLowerCase().includes(lowerQuery))
      .slice(0, 5);
  };

  const handleLocationSearch = (location: string) => {
    // First check our suggestions
    const suggestions = getLocationSuggestions(location);
    if (suggestions.length > 0) {
      const firstMatch = suggestions[0];
      setMapCenter(firstMatch.coords as [number, number]);
      setMapZoom(12);
      return;
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
            {showSuggestions && searchQuery.length > 1 && (
              <div className={`absolute top-full left-0 right-0 mt-1 rounded-md shadow-lg z-50 max-h-60 overflow-auto ${
                isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
              } border`}>
                {getLocationSuggestions(searchQuery).map((suggestion, idx) => (
                  <button
                    key={idx}
                    className={`w-full text-left px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-600 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setSearchQuery(suggestion.name);
                      handleLocationSearch(suggestion.name);
                      setShowSuggestions(false);
                    }}
                  >
                    <div className="font-medium">{suggestion.name}</div>
                    {suggestion.state && (
                      <div className="text-sm text-gray-500">{suggestion.state}</div>
                    )}
                  </button>
                ))}
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
          <Map
            center={mapCenter}
            zoom={mapZoom}
            height="100%"
            searchFilters={filters}
            onCommunityClick={handleCommunityClick}
            onBoundsChange={setMapBounds}
            onClusterClick={handleClusterClick}
          />
        </div>
      </div>
                  Move around the map to set the area, then switch back to list view
                </p>
              </div>

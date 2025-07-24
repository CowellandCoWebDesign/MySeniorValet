import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'wouter';
import { Search, Filter, List, MapIcon, SlidersHorizontal, X, Star, MapPin, Phone, Globe, Heart, ExternalLink, Home, Moon, Sun, Info, HelpCircle, Users, Building, DollarSign, Sparkles, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
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
  priceRange: { min: number; max: number; } | string;
  availability: string;
  photos: string[];
  description: string;
  hudPropertyId?: string;
  // Extended properties for enhanced functionality
  totalUnits?: number;
  availabilityStatus?: string;
  monthlyRentRangeStart?: number;
  monthlyRentRangeEnd?: number;
  priceTier?: string;
  sizeCategory?: string;
  occupancyRate?: number;
  seniorPercentage?: number;
  // Enhanced HUD data from extractor
  displayPricing?: {
    displayPrice: string;
    priceLabel: string;
    qualityBadge: string;
    showContactButton: boolean;
  };
  displayAvailability?: {
    availabilityStatus: string;
    occupancyDisplay?: string;
    availabilityColor: string;
    unitsDisplay?: string;
  };
  transparencyBadges?: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    type: string;
    rarity: string;
    points: number;
  }>;
  transparencyScore?: number;
  dataQuality?: {
    isAuthentic: boolean;
    source: string;
    qualityScore: number;
    lastVerified: string;
  };
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
  
  // Advanced filter state
  const [activeCareTypes, setActiveCareTypes] = useState<string[]>([]);
  const [activePriceRanges, setActivePriceRanges] = useState<string[]>([]);
  const [activeAmenities, setActiveAmenities] = useState<string[]>([]);
  const [activeFeatures, setActiveFeatures] = useState<string[]>([]);
  const [activeRatings, setActiveRatings] = useState<string[]>([]);
  const [activeAvailability, setActiveAvailability] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [savedSearches, setSavedSearches] = useState<{name: string, filters: any}[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([37.7749, -122.4194]);
  const [mapZoom, setMapZoom] = useState(12);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [mapBounds, setMapBounds] = useState<any>(null);
  const [showBottomPanel, setShowBottomPanel] = useState(true); // Show panel by default
  const [panelHeight, setPanelHeight] = useState(75);
  const [peekHeight] = useState(80); // Height when panel is "peeking"
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [isMapMoving, setIsMapMoving] = useState(false);

  // Restore search state from sessionStorage when page loads
  useEffect(() => {
    const savedSearchQuery = sessionStorage.getItem('lastSearchQuery');
    const savedMapCenter = sessionStorage.getItem('lastMapCenter');
    const savedMapZoom = sessionStorage.getItem('lastMapZoom');

    if (savedSearchQuery) {
      setSearchQuery(savedSearchQuery);
    }
    if (savedMapCenter) {
      try {
        setMapCenter(JSON.parse(savedMapCenter));
      } catch (e) {
        console.error('Failed to parse saved map center');
      }
    }
    if (savedMapZoom) {
      setMapZoom(Number(savedMapZoom));
    }
  }, []);

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

  const handleLocationSearch = async (query: string) => {
    if (!query || query.trim() === '') return;

    setHasSearched(true);
    console.log('🔍 AI-Powered Search for:', query);

    try {
      // First try AI-powered search
      const aiResponse = await fetch('/api/communities/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        console.log('🤖 AI Search Intent:', aiData.searchIntent);
        console.log(`📊 AI Found ${aiData.totalResults} communities`);

        // Show AI summary if available
        if (aiData.summary) {
          console.log('💬 AI Summary:', aiData.summary);
        }

        // Update search query to display the interpreted location
        if (aiData.searchIntent.location) {
          const loc = aiData.searchIntent.location;
          if (loc.city || loc.state || loc.zipCode) {
            const displayLocation = [loc.city, loc.state].filter(Boolean).join(', ') || loc.zipCode || query;
            setSearchQuery(displayLocation);
          }
        }

        // If we have results, center map on the first result
        if (aiData.results && aiData.results.length > 0) {
          const firstResult = aiData.results[0];
          if (firstResult.latitude && firstResult.longitude) {
            console.log(`📍 Centering map on first result: ${firstResult.name}`);
            setMapCenter([firstResult.latitude, firstResult.longitude]);
            
            // Adjust zoom based on number of results
            if (aiData.totalResults > 20) {
              setMapZoom(10); // Wider view for many results
            } else if (aiData.totalResults > 5) {
              setMapZoom(12); // Medium view
            } else {
              setMapZoom(14); // Close view for few results
            }
            
            return; // Success, exit early
          }
        }
      }
    } catch (error) {
      console.error('AI search error:', error);
    }

    // Fallback to enhanced search API for geocoding
    try {
      const response = await fetch(`/api/communities/search/enhanced?location=${encodeURIComponent(query)}&limit=1`);
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

    const coords = locationMap[query.toLowerCase()];
    if (coords) {
      setMapCenter(coords);
      const lowerLocation = query.toLowerCase();
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
      {/* Simplified Header */}
      <div className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
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

            {/* Controls */}
            <div className="flex items-center space-x-4">
              {/* Dark mode toggle */}
              <Button
                variant="ghost"
                size="lg"
                onClick={toggleDarkMode}
                className="text-gray-600 dark:text-gray-300 h-10 w-10 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              {/* View toggle */}
              <div className="flex rounded-xl border-2 border-gray-200 dark:border-gray-600 overflow-hidden bg-gray-50 dark:bg-gray-800">
                <Button
                  variant={viewMode === 'map' ? 'default' : 'ghost'}
                  size="lg"
                  onClick={() => setViewMode('map')}
                  className={`rounded-none border-0 h-10 px-4 ${viewMode === 'map' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  <MapIcon className="h-4 w-4 mr-2" />
                  Map
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="lg"
                  onClick={() => setViewMode('list')}
                  className={`rounded-none border-0 h-10 px-4 ${viewMode === 'list' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  <List className="h-4 w-4 mr-2" />
                  List
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI-Powered Search Bar Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="space-y-4">
            {/* Search Input with AI */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Search className="h-5 w-5" />
              </div>
              <Input
                placeholder="Ask me anything: 'memory care near me', 'assisted living under $3000', 'pet-friendly in Sacramento'..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  // Save search to session storage
                  sessionStorage.setItem('lastSearchQuery', e.target.value);
                  sessionStorage.setItem('lastMapCenter', JSON.stringify(mapCenter));
                  sessionStorage.setItem('lastMapZoom', String(mapZoom));
                }}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    handleLocationSearch(searchQuery);
                    setHasSearched(true);
                  }
                }}
                className="pl-12 pr-24 py-4 w-full border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg transition-all duration-200 hover:shadow-lg"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
                  AI-Powered
                </Badge>
              </div>
            </div>

            {/* Beautiful Filter Interface */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5" />
                  Filter Communities
                  {/* Active Filter Count */}
                  {(activeCareTypes.length + activePriceRanges.length + activeAmenities.length + activeFeatures.length + activeRatings.length + activeAvailability.length) > 0 && (
                    <Badge className="ml-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      {activeCareTypes.length + activePriceRanges.length + activeAmenities.length + activeFeatures.length + activeRatings.length + activeAvailability.length} Active
                    </Badge>
                  )}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-gray-500"
                >
                  {showFilters ? 'Hide' : 'Show'} Filters
                </Button>
              </div>
              
              {showFilters && (
                <div className="space-y-4">
                  {/* Care Types */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Care Types
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {['Memory Care', 'Assisted Living', 'Independent Living', 'Skilled Nursing', 'Continuing Care', 'Adult Day Care'].map((careType) => (
                        <Button
                          key={careType}
                          variant={activeCareTypes.includes(careType) ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setActiveCareTypes(prev => 
                              prev.includes(careType) 
                                ? prev.filter(t => t !== careType)
                                : [...prev, careType]
                            );
                          }}
                          className={`transition-all ${activeCareTypes.includes(careType) ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                        >
                          {careType}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Price Ranges */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Monthly Price Range
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {['Under $2,000', '$2,000-$3,000', '$3,000-$4,000', '$4,000-$5,000', 'Over $5,000'].map((range) => (
                        <Button
                          key={range}
                          variant={activePriceRanges.includes(range) ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setActivePriceRanges(prev => 
                              prev.includes(range) 
                                ? prev.filter(r => r !== range)
                                : [...prev, range]
                            );
                          }}
                          className={`transition-all ${activePriceRanges.includes(range) ? 'bg-green-600 hover:bg-green-700' : ''}`}
                        >
                          {range}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Amenities */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Amenities & Features
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {['Pet Friendly', 'Pool', 'Fitness Center', 'Transportation', 'Meals Included', '24/7 Staff', 'Garden', 'Library'].map((amenity) => (
                        <Button
                          key={amenity}
                          variant={activeAmenities.includes(amenity) ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setActiveAmenities(prev => 
                              prev.includes(amenity) 
                                ? prev.filter(a => a !== amenity)
                                : [...prev, amenity]
                            );
                          }}
                          className={`transition-all ${activeAmenities.includes(amenity) ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                        >
                          {amenity}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Special Features */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Special Features
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {['Live Pricing', 'Available Now', 'Virtual Tours', 'New Community', 'Medicare Accepted', 'Medicaid Accepted'].map((feature) => (
                        <Button
                          key={feature}
                          variant={activeFeatures.includes(feature) ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setActiveFeatures(prev => 
                              prev.includes(feature) 
                                ? prev.filter(f => f !== feature)
                                : [...prev, feature]
                            );
                            // Don't trigger location search for filters
                          }}
                          className={`transition-all ${activeFeatures.includes(feature) ? 'bg-orange-600 hover:bg-orange-700' : ''}`}
                        >
                          {feature}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Community Ratings */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Community Ratings
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {['5 Stars', '4+ Stars', '3+ Stars', 'Highly Rated', 'New (No Ratings)'].map((rating) => (
                        <Button
                          key={rating}
                          variant={activeRatings.includes(rating) ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setActiveRatings(prev => 
                              prev.includes(rating) 
                                ? prev.filter(r => r !== rating)
                                : [...prev, rating]
                            );
                          }}
                          className={`transition-all ${activeRatings.includes(rating) ? 'bg-yellow-600 hover:bg-yellow-700' : ''}`}
                        >
                          {rating}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Availability Status */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Availability Status
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {['Available Now', 'Waitlist Open', 'Coming Soon', 'Limited Availability', 'Contact for Info'].map((status) => (
                        <Button
                          key={status}
                          variant={activeAvailability.includes(status) ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setActiveAvailability(prev => 
                              prev.includes(status) 
                                ? prev.filter(s => s !== status)
                                : [...prev, status]
                            );
                          }}
                          className={`transition-all ${activeAvailability.includes(status) ? 'bg-teal-600 hover:bg-teal-700' : ''}`}
                        >
                          {status}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Apply/Clear/Save Buttons */}
                  <div className="space-y-2 pt-2">
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        onClick={() => {
                          // Apply filters directly to map view instead of treating as location search
                          setFilters({
                            careType: activeCareTypes.length > 0 ? activeCareTypes.join(',') : 'All Types',
                            minRating: activeRatings.includes('5 Stars') ? 5 : 
                                      activeRatings.includes('4+ Stars') ? 4 : 
                                      activeRatings.includes('3+ Stars') ? 3 : 0,
                            amenities: activeAmenities,
                            budget: activePriceRanges.length > 0 ? activePriceRanges.join(',') : 'Any Budget',
                            // Check if "Live Pricing" is selected in activeFeatures
                            availability: activeFeatures.includes('Live Pricing') ? 'livePricing' : 
                                        activeAvailability.length > 0 ? activeAvailability.join(',') : 'All Status'
                          });
                          
                          // Show a visual indicator that filters were applied
                          // Don't trigger a location search
                        }}
                      >
                        Apply Filters
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setActiveCareTypes([]);
                          setActivePriceRanges([]);
                          setActiveAmenities([]);
                          setActiveFeatures([]);
                          setActiveRatings([]);
                          setActiveAvailability([]);
                        }}
                      >
                        Clear All
                      </Button>
                    </div>
                    
                    {/* Save Search */}
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => {
                        const searchName = prompt('Name this search:');
                        if (searchName) {
                          setSavedSearches(prev => [...prev, {
                            name: searchName,
                            filters: {
                              careTypes: activeCareTypes,
                              priceRanges: activePriceRanges,
                              amenities: activeAmenities,
                              features: activeFeatures,
                              ratings: activeRatings,
                              availability: activeAvailability
                            }
                          }]);
                        }
                      }}
                      disabled={(activeCareTypes.length + activePriceRanges.length + activeAmenities.length + activeFeatures.length + activeRatings.length + activeAvailability.length) === 0}
                    >
                      Save This Search
                    </Button>
                  </div>

                  {/* Saved Searches */}
                  {savedSearches.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Saved Searches
                      </h4>
                      <div className="space-y-2">
                        {savedSearches.map((search, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex-1 justify-start"
                              onClick={() => {
                                // Load saved search
                                setActiveCareTypes(search.filters.careTypes);
                                setActivePriceRanges(search.filters.priceRanges);
                                setActiveAmenities(search.filters.amenities);
                                setActiveFeatures(search.filters.features);
                                setActiveRatings(search.filters.ratings);
                                setActiveAvailability(search.filters.availability);
                              }}
                            >
                              {search.name}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSavedSearches(prev => prev.filter((_, i) => i !== index))}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative h-[calc(100vh-13rem)]">
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

            {/* Enhanced Bottom panel for list view - Always show with peek effect */}
            <div 
              className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t-2 border-gray-200 dark:border-gray-700 shadow-2xl z-40 overflow-hidden transition-all duration-500 rounded-t-3xl"
              style={{ height: showBottomPanel ? `${panelHeight}vh` : `${peekHeight}px` }}
            >
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700">
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-12 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Communities in View
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {mapCommunities.length} communities found • {mapCommunities.filter(c => 
                          c?.hudPropertyId || 
                          (c as any)?.salesDirector?.name || 
                          (c as any)?.liveDataVerified || 
                          (c as any)?.claimedBy ||
                          c?.phone || 
                          c?.website
                        ).length} with live data
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

                <div className="overflow-auto h-full pb-20 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                  {mapCommunities.length > 0 ? (
                    <div className="space-y-4 p-6">
                      {mapCommunities.map((community, index) => (
                        <div 
                          key={community.id}
                          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01] border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer"
                          onClick={() => handleCommunityClick(community)}
                        >
                          <div className="flex flex-row h-48">
                            {/* Enhanced Image Section */}
                            <div className="w-64 flex-shrink-0 relative">
                              <div className="aspect-[4/3] bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 flex items-center justify-center relative overflow-hidden h-full">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                <Home className="w-12 h-12 text-gray-400 dark:text-gray-500 opacity-60" />
                                
                                {/* Live Data Indicator - GOLDEN RULE: Only for verified pricing/availability */}
                                {(
                                  // Government verified with actual pricing
                                  ((community?.hudPropertyId && (community as any)?.rentPerMonth) ||
                                  ((community as any)?.governmentSourced && 
                                   typeof community?.priceRange === 'object' && 
                                   community?.priceRange?.min)) ||
                                  // Vendor verified with recent confirmation
                                  ((community as any)?.claimedBy && (community as any)?.pricing_type === 'live' && 
                                   (community as any)?.pricingLastVerified &&
                                   new Date((community as any).pricingLastVerified) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
                                ) && (
                                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-green-500 text-white px-3 py-2 rounded-full text-sm font-semibold shadow-lg">
                                    <div className="w-2.5 h-2.5 bg-green-200 rounded-full animate-pulse" />
                                    LIVE DATA
                                  </div>
                                )}
                                
                                {/* Availability Badge */}
                                <div className="absolute bottom-3 left-3 bg-blue-600 text-white text-sm px-3 py-2 font-semibold rounded-full shadow-lg backdrop-blur-sm">
                                  {community?.availability || 'Available'}
                                </div>

                                {/* Index Badge for Quick Reference */}
                                <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center shadow-lg">
                                  {index + 1}
                                </div>
                              </div>
                            </div>

                            {/* Enhanced Content Section */}
                            <div className="flex-1 p-6 flex flex-col justify-between">
                              <div className="space-y-4">
                                {/* Community Name with Rating */}
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 mr-4">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                                      {community?.name || 'Community Name'}
                                    </h3>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <MapPin className="w-4 h-4 text-gray-500" />
                                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                                        {community?.address && community.address !== community.city ? 
                                          `${community.address}, ${community.city || 'City'}, ${community.state || 'State'}` : 
                                          `${community?.city || 'City'}, ${community?.state || 'State'}`
                                        }
                                      </p>
                                    </div>
                                  </div>
                                  
                                  {(community?.rating && typeof community.rating === 'number' && community.rating > 0) && (
                                    <div className="flex items-center space-x-2 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1.5 rounded-full">
                                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                      <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
                                        {community.rating.toFixed(1)}
                                      </span>
                                      {(community?.reviewCount && community.reviewCount > 0) && (
                                        <span className="text-xs text-yellow-600 dark:text-yellow-400">
                                          ({community.reviewCount})
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* Care Types */}
                                <div className="flex flex-wrap gap-2">
                                  {community.careTypes?.slice(0, 3).map((type, idx) => (
                                    <Badge 
                                      key={idx} 
                                      className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700 text-xs px-2 py-1"
                                    >
                                      {type}
                                    </Badge>
                                  ))}
                                  {(community.careTypes?.length || 0) > 3 && (
                                    <Badge className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1">
                                      +{(community.careTypes?.length || 0) - 3} more
                                    </Badge>
                                  )}
                                </div>

                                {/* Enhanced Pricing Section */}
                                <div className="space-y-2">
                                  <div className="flex items-baseline space-x-2">
                                    <div className={`text-2xl font-bold ${
                                      community?.hudPropertyId || (community as any)?.liveDataVerified ? 
                                      'text-green-600 dark:text-green-400' : 
                                      'text-gray-900 dark:text-white'
                                    }`}>
                                      {community?.hudPropertyId && (community as any)?.rentPerMonth ? 
                                        `$${(community as any).rentPerMonth}/month` :
                                        typeof community?.priceRange === 'object' && community.priceRange?.min ? 
                                        `$${community.priceRange.min.toLocaleString()}/month` : 
                                        'Contact for Pricing'
                                      }
                                    </div>
                                    {!(community?.hudPropertyId || (community as any)?.liveDataVerified) && (
                                      <span className="text-sm text-orange-600 dark:text-orange-400 font-normal">estimate</span>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {community?.hudPropertyId ? 
                                      'HUD Official Database' : 
                                      (community as any)?.liveDataVerified ? 
                                      'Verified Live Data' : 
                                      'Market-based estimate - Call for current pricing'
                                    }
                                  </div>
                                </div>

                                {/* Enhanced Occupancy and Units Info */}
                                {((community as any).occupancyRate || (community as any).totalUnits) && (
                                  <div className="flex items-center space-x-4 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                    {(community as any).occupancyRate && (
                                      <div className="flex items-center space-x-2">
                                        <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                          {Math.round((community as any).occupancyRate)}% occupied
                                        </span>
                                      </div>
                                    )}
                                    {(community as any).totalUnits && (
                                      <div className="flex items-center space-x-2">
                                        <Building className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                          {(community as any).totalUnits} units
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
                                <div className="flex items-center space-x-3">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/50"
                                  >
                                    <Phone className="w-4 h-4 mr-1" />
                                    Call
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-800/50"
                                  >
                                    <ExternalLink className="w-4 h-4 mr-1" />
                                    Visit
                                  </Button>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                                >
                                  <Heart className="w-5 h-5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
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
                      community={{
                        ...community,
                        priceRange: typeof community.priceRange === 'string' ? undefined : community.priceRange
                      }}
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
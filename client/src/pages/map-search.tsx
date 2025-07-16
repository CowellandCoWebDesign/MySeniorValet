import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Search, Filter, List, MapIcon, SlidersHorizontal, X, Star, MapPin, Phone, Globe, Heart, ExternalLink, Home, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Separator } from '@/components/ui/separator';
import Map from '@/components/Map';
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
  const [mapCenter, setMapCenter] = useState<[number, number]>([37.0, -119.0]); // California center
  const [mapZoom, setMapZoom] = useState(6);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [mapBounds, setMapBounds] = useState<any>(null);
  const [showBottomPanel, setShowBottomPanel] = useState(false);
  const [panelHeight, setPanelHeight] = useState(40); // Percentage of screen height
  
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

  // Handle initial search query from URL
  useEffect(() => {
    if (initialQuery) {
      handleLocationSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleLocationSearch = (location: string) => {
    // Geocode location and update map center
    // For now, we'll use some common locations
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className={`shadow-sm border-b ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/')}
                className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'}`}
              >
                ← Back
              </Button>
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5 text-blue-600" />
                <span className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  MySeniorValet
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Dark Mode Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'}`}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              
              {/* View Mode Toggles */}
              <div className="flex items-center gap-1 bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('map')}
                  className={`relative transition-all duration-300 ${
                    viewMode === 'map' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105' 
                      : isDarkMode 
                      ? 'text-gray-300 hover:text-white hover:bg-gray-600' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <MapIcon className="w-4 h-4" />
                  {viewMode === 'map' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-md animate-pulse opacity-20"></div>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`relative transition-all duration-300 ${
                    viewMode === 'list' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105' 
                      : isDarkMode 
                      ? 'text-gray-300 hover:text-white hover:bg-gray-600' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <List className="w-4 h-4" />
                  {viewMode === 'list' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-md animate-pulse opacity-20"></div>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className={`border-b p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search location (e.g., San Francisco, CA)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLocationSearch(searchQuery)}
              className={`pl-10 ${isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500'
              }`}
            />
          </div>
          <Button 
            onClick={() => handleLocationSearch(searchQuery)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Search
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className={`border-b p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-2 overflow-x-auto">
          <Drawer>
            <DrawerTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className={isDarkMode 
                  ? 'border-gray-600 bg-gray-700 text-white hover:bg-gray-600' 
                  : 'border-gray-300 bg-white text-gray-900 hover:bg-gray-50'
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

          {/* Active Filters */}
          {filters.careType !== 'All Types' && (
            <Badge variant="secondary" className={`gap-1 ${isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>
              {filters.careType}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters({...filters, careType: 'All Types'})} />
            </Badge>
          )}
          {filters.budget !== 'Any Budget' && (
            <Badge variant="secondary" className={`gap-1 ${isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>
              {filters.budget}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters({...filters, budget: 'Any Budget'})} />
            </Badge>
          )}
          {filters.minRating > 0 && (
            <Badge variant="secondary" className={`gap-1 ${isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>
              {filters.minRating}+ Stars
              <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters({...filters, minRating: 0})} />
            </Badge>
          )}
          {filters.amenities.map((amenity) => (
            <Badge key={amenity} variant="secondary" className={`gap-1 ${isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>
              {amenity}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => setFilters({...filters, amenities: filters.amenities.filter(a => a !== amenity)})} 
              />
            </Badge>
          ))}
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1">
        {viewMode === 'map' ? (
          <Map
            center={mapCenter}
            zoom={mapZoom}
            height="calc(100vh - 200px)"
            searchFilters={filters}
            onCommunityClick={handleCommunityClick}
            onBoundsChange={setMapBounds}
          />
        ) : (
          <div className="p-4">
            {/* List View Header */}
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">Communities in Current Area</h2>
              <p className="text-sm text-gray-600">
                {!mapBounds ? 'Move the map to view communities in this area' : 
                 isLoadingCommunities ? 'Loading...' : `${mapCommunities.length} communities found`}
              </p>
            </div>
            
            {/* Communities List */}
            {isLoadingCommunities ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : !mapBounds ? (
              <div className="text-center py-8">
                <MapIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Switch to map view first</p>
                <p className="text-sm text-gray-500 mt-2">
                  Move around the map to set the area, then switch back to list view
                </p>
              </div>
            ) : mapCommunities.length === 0 ? (
              <div className="text-center py-8">
                <List className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No communities found in current area</p>
                <p className="text-sm text-gray-500 mt-2">
                  Try adjusting your search location or filters
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {mapCommunities.map((community, index) => (
                  <Card key={community.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group border-gray-200 animate-fade-in-up" style={{animationDelay: `${index * 0.05}s`}}>
                    <div className="flex">
                      {/* Image Section */}
                      <div className="relative w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center flex-shrink-0">
                        <div className="w-16 h-16 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <Home className="w-8 h-8 text-blue-600" />
                        </div>
                        
                        {/* Heart Icon */}
                        <div className="absolute top-2 right-2">
                          <div className="w-6 h-6 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <Heart className="w-3 h-3 text-gray-600 hover:text-red-500 transition-colors" />
                          </div>
                        </div>
                        
                        {/* Availability Badge */}
                        {index % 3 === 0 && (
                          <Badge className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-1 font-medium">
                            🟢 Available
                          </Badge>
                        )}
                        {index % 3 === 1 && (
                          <Badge className="absolute bottom-2 left-2 bg-orange-600 text-white text-xs px-2 py-1 font-medium">
                            🟡 Waitlist
                          </Badge>
                        )}
                        {index % 3 === 2 && (
                          <Badge className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 font-medium">
                            📞 Call
                          </Badge>
                        )}
                      </div>
                      
                      {/* Content Section */}
                      <CardContent className="p-4 flex-1">
                        {/* Pricing - Top Priority */}
                        <div className="mb-2">
                          <div className="text-lg font-bold text-gray-900">
                            {typeof community.priceRange === 'string' 
                              ? community.priceRange 
                              : community.priceRange?.min && community.priceRange?.max
                              ? `$${community.priceRange.min.toLocaleString()}`
                              : '$3,800'}
                            {!community.claimed && (
                              <span className="text-xs text-gray-500 ml-1 font-normal">est.</span>
                            )}
                          </div>
                          
                          {/* Care Type & Location */}
                          <div className="text-sm text-gray-700 mb-1">
                            {community.careTypes?.length > 0 ? 
                              `${community.careTypes[0]} • Premium Care` : 
                              'Assisted Living • Featured Community'
                            }
                          </div>
                        </div>
                        
                        {/* Community Name */}
                        <div className="text-sm font-medium text-gray-900 mb-1 line-clamp-1">
                          {community.name}
                        </div>
                        
                        {/* Address */}
                        <div className="text-xs text-gray-600 line-clamp-1 mb-2 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {community.address}, {community.city}, {community.state} {community.zipCode}
                        </div>
                        
                        {/* Rating */}
                        {community.rating > 0 && (
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs font-medium">{community.rating}</span>
                            </div>
                            <span className="text-xs text-gray-600">
                              ({community.reviewCount} reviews)
                            </span>
                          </div>
                        )}
                        
                        {/* Premium Badges */}
                        <div className="mb-2">
                          {index % 4 === 0 && (
                            <Badge className="text-white text-xs px-2 py-1 font-medium bg-purple-600/90">
                              🏆 Featured
                            </Badge>
                          )}
                          {index % 4 === 1 && (
                            <Badge className="text-white text-xs px-2 py-1 font-medium bg-indigo-600/90">
                              ⭐ Premium
                            </Badge>
                          )}
                          {index % 4 === 2 && (
                            <Badge className="text-white text-xs px-2 py-1 font-medium bg-violet-600/90">
                              🎯 Top Rated
                            </Badge>
                          )}
                          {index % 4 === 3 && (
                            <Badge className="text-white text-xs px-2 py-1 font-medium bg-pink-600/90">
                              💎 Exclusive
                            </Badge>
                          )}
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="flex-1 gradient-primary hover:opacity-90 text-white border-0"
                            onClick={() => handleCommunityClick(community)}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View Details
                          </Button>
                          
                          {community.phone && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="border-blue-200 text-blue-600 hover:bg-blue-50"
                              onClick={() => window.open(`tel:${community.phone}`)}
                            >
                              <Phone className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Yelp-style Bottom Slide Panel */}
      <div 
        className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 shadow-2xl rounded-t-2xl transition-transform duration-300 ease-out z-50 ${
          showBottomPanel ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ height: `${panelHeight}vh` }}
      >
        {/* Panel Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div 
            className="w-12 h-1 bg-gray-300 rounded-full cursor-grab active:cursor-grabbing"
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

        {/* Panel Header */}
        <div className="px-4 pb-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {mapCommunities.length} communities in this area
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBottomPanel(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Panel Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoadingCommunities ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 animate-pulse">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : mapCommunities.length === 0 ? (
            <div className="text-center py-8">
              <MapIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No communities found in current area</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Try adjusting your search location or zoom level
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {mapCommunities.map((community, index) => (
                <div
                  key={community.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleCommunityClick(community)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white line-clamp-1">
                        {community.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1 mt-1">
                        {community.address}, {community.city}, {community.state}
                      </p>
                      
                      {/* Rating and Price */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          {community.rating > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {community.rating}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm font-bold text-gray-900 dark:text-white">
                            {typeof community.priceRange === 'string' 
                              ? community.priceRange 
                              : community.priceRange?.min 
                              ? `$${community.priceRange.min.toLocaleString()}`
                              : '$3,800'}
                            {!community.claimed && (
                              <span className="text-xs text-gray-500 ml-1 font-normal">est.</span>
                            )}
                          </div>
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

      {/* Floating Action Button to Show Panel */}
      {viewMode === 'map' && !showBottomPanel && (
        <button
          onClick={() => setShowBottomPanel(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 z-40"
        >
          <List className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
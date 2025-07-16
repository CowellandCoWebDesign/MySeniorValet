import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Search, Filter, List, MapIcon, SlidersHorizontal, X, Star, MapPin, Phone, Globe, Heart, ExternalLink, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Separator } from '@/components/ui/separator';
import Map from '@/components/Map';
import BottomNavigation from '@/components/BottomNavigation';
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

export default function Search() {
  const [, setLocation] = useLocation();
  
  // Get search query from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const initialQuery = urlParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
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
  
  // Bottom navigation state
  const [activeTab, setActiveTab] = useState('search');
  
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

  // Handle bottom navigation
  const handleTabChange = (tab: string) => {
    console.log('Bottom navigation clicked:', tab);
    setActiveTab(tab);
    switch (tab) {
      case 'search':
        // Already on search page
        console.log('Staying on search page');
        break;
      case 'updates':
        console.log('Navigating to updates');
        setLocation('/updates');
        break;
      case 'saved':
        console.log('Navigating to dashboard favorites');
        setLocation('/dashboard?tab=favorites');
        break;
      case 'tours':
        console.log('Navigating to dashboard tours');
        setLocation('/dashboard?tab=tours');
        break;
      case 'more':
        console.log('Navigating to dashboard');
        setLocation('/dashboard');
        break;
      default:
        console.log('Unknown tab:', tab);
    }
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
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/')}
              >
                <Home className="w-4 h-4 mr-2" />
                MySeniorValet
              </Button>
              <h1 className="text-xl font-semibold">Search Communities</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'map' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('map')}
              >
                <MapIcon className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border-b p-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search location (e.g., San Francisco, CA)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLocationSearch(searchQuery)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => handleLocationSearch(searchQuery)}>
            Search
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline" size="sm">
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
            <Badge variant="secondary" className="gap-1">
              {filters.careType}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters({...filters, careType: 'All Types'})} />
            </Badge>
          )}
          {filters.budget !== 'Any Budget' && (
            <Badge variant="secondary" className="gap-1">
              {filters.budget}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters({...filters, budget: 'Any Budget'})} />
            </Badge>
          )}
          {filters.minRating > 0 && (
            <Badge variant="secondary" className="gap-1">
              {filters.minRating}+ Stars
              <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters({...filters, minRating: 0})} />
            </Badge>
          )}
          {filters.amenities.map((amenity) => (
            <Badge key={amenity} variant="secondary" className="gap-1">
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
            height="calc(100vh - 280px)"
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
                  <Card key={community.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group animate-float border-gray-200" style={{animationDelay: `${index * 0.1}s`}}>
                    <div className="flex">
                      {/* Image Section */}
                      <div className="relative w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                        {community.photos && community.photos.length > 0 ? (
                          <img 
                            src={community.photos[0]} 
                            alt={community.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center">
                            <Home className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                            <span className="text-xs text-blue-600 font-medium">Photo Coming Soon</span>
                          </div>
                        )}
                        
                        {/* Heart favorite in top right */}
                        <div className="absolute top-2 right-2 z-10">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-8 h-8 p-0 bg-white/80 backdrop-blur-sm hover:bg-white/90 rounded-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle favorite logic
                            }}
                          >
                            <Heart className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors" />
                          </Button>
                        </div>
                        
                        {/* Availability badge */}
                        <div className="absolute bottom-2 left-2">
                          <Badge 
                            variant={community.availability === 'Available' ? 'default' : 
                                   community.availability === 'Waitlist' ? 'secondary' : 'outline'}
                            className="text-xs"
                          >
                            {community.availability || 'Available'}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Content Section */}
                      <div className="flex-1 p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {community.name}
                          </h3>
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="font-medium">{community.rating?.toFixed(1) || 'N/A'}</span>
                            <span className="text-gray-500">({community.reviewCount || 0})</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                          <MapPin className="w-4 h-4" />
                          <span className="line-clamp-1">{community.address}, {community.city}, {community.state}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            {community.careTypes?.slice(0, 2).map((type) => (
                              <Badge key={type} variant="outline" className="text-xs">
                                {type}
                              </Badge>
                            ))}
                            {community.careTypes?.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{community.careTypes.length - 2} more
                              </Badge>
                            )}
                          </div>
                          
                          <div className="text-right">
                            <div className="font-semibold text-green-600">
                              {community.priceRange || 'Call for Pricing'}
                            </div>
                            <div className="text-xs text-gray-500">per month</div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`tel:${community.phone}`, '_self');
                            }}
                          >
                            <Phone className="w-4 h-4 mr-1" />
                            Call
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            onClick={() => handleCommunityClick(community)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation 
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  );
}
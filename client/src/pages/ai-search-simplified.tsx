import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'wouter';
import { Search, MapPin, Filter, List, MapIcon, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { NavigationHeader } from "@/components/NavigationHeader";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import Map from '@/components/Map';
import { PrioritizedCommunityCard } from '@/components/PrioritizedCommunityCard';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';

// Reuse the same interfaces from map-search
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
  selectedCareTypes: string[];
  minRating: number;
  amenities: string[];
  budget: string;
  availability: string;
  distance: number;
}

export default function AISearchSimplified() {
  const [, setLocation] = useLocation();
  
  // Get search query from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const initialQuery = urlParams.get('query') || urlParams.get('location') || '';
  
  // Search and filter state - same as map-search
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchFilters>({
    careType: 'all',
    selectedCareTypes: [],
    minRating: 0,
    amenities: [],
    budget: 'Any Budget',
    availability: 'all',
    distance: 25
  });
  
  // Map state
  const [mapCenter, setMapCenter] = useState<[number, number]>([39.8283, -98.5795]); // US center
  const [mapZoom, setMapZoom] = useState(4);
  const [mapBounds, setMapBounds] = useState<any>(null);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  
  // Section expansion state for mobile
  const [expandedSection, setExpandedSection] = useState<'filters' | 'map' | 'list'>('filters');
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  
  // Fetch communities using the same endpoint as map-search
  const { data: communities = [], isLoading } = useQuery({
    queryKey: ['/api/communities/spatial', mapBounds, debouncedSearchQuery, filters],
    queryFn: async () => {
      if (!mapBounds) return [];
      
      const params = new URLSearchParams({
        west: mapBounds.getWest().toString(),
        south: mapBounds.getSouth().toString(),
        east: mapBounds.getEast().toString(),
        north: mapBounds.getNorth().toString(),
      });
      
      if (debouncedSearchQuery) params.append('search', debouncedSearchQuery);
      if (filters.budget !== 'Any Budget') params.append('budget', filters.budget);
      if (filters.selectedCareTypes.length > 0) {
        params.append('careTypes', filters.selectedCareTypes.join(','));
      }
      
      const response = await fetch(`/api/communities/spatial?${params}`);
      if (!response.ok) throw new Error('Failed to fetch communities');
      return response.json();
    },
    enabled: !!mapBounds,
  });
  
  // Care type options
  const careTypeOptions = [
    { value: 'independent_living', label: 'Independent Living', emoji: '🏡' },
    { value: 'assisted_living', label: 'Assisted Living', emoji: '🤝' },
    { value: 'memory_care', label: 'Memory Care', emoji: '🧠' },
    { value: 'skilled_nursing', label: 'Skilled Nursing', emoji: '🏥' },
    { value: 'continuing_care', label: 'Continuing Care', emoji: '♾️' },
    { value: '55_plus', label: '55+ Active Adult', emoji: '🎾' },
    { value: 'mobile_home', label: 'Mobile Home Park', emoji: '🚐' },
    { value: 'manufactured_home', label: 'Manufactured Home', emoji: '🏘️' },
    { value: 'low_income', label: 'Low Income Housing', emoji: '💰' },
    { value: 'veterans', label: 'Veterans Community', emoji: '🎖️' }
  ];
  
  // Amenity options
  const amenityOptions = [
    'Pet Friendly',
    'Pool',
    'Fitness Center',
    'Library',
    'Garden',
    'Transportation',
    'Dining Room',
    'Activity Programs',
    'Medical Services',
    'Security'
  ];
  
  const toggleCareType = (careType: string) => {
    setFilters(prev => ({
      ...prev,
      selectedCareTypes: prev.selectedCareTypes.includes(careType)
        ? prev.selectedCareTypes.filter(ct => ct !== careType)
        : [...prev.selectedCareTypes, careType]
    }));
  };
  
  const toggleAmenity = (amenity: string) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };
  
  const handleMapBoundsChange = useCallback((bounds: any) => {
    setMapBounds(bounds);
  }, []);
  
  const handleCommunitySelect = (community: Community) => {
    setSelectedCommunity(community);
    setMapCenter([community.latitude, community.longitude]);
    setMapZoom(15);
    if (isMobile) setExpandedSection('list');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <NavigationHeader />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="h-8 w-8" />
            <h1 className="text-3xl font-bold">AI-Powered Senior Living Search</h1>
          </div>
          <p className="text-blue-100 text-lg">
            Find your perfect community with our simplified, intelligent search experience
          </p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Section 1: Beautiful Filtering */}
        <Card className={cn(
          "overflow-hidden transition-all duration-300",
          isMobile && expandedSection !== 'filters' && "max-h-20"
        )}>
          <CardHeader 
            className="cursor-pointer"
            onClick={() => isMobile && setExpandedSection('filters')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-blue-600" />
                <CardTitle>Step 1: Tell Us What You're Looking For</CardTitle>
              </div>
              {isMobile && (
                expandedSection === 'filters' ? <ChevronUp /> : <ChevronDown />
              )}
            </div>
          </CardHeader>
          
          {(!isMobile || expandedSection === 'filters') && (
            <CardContent className="space-y-6">
              {/* Location Search */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">Location</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Enter city, state, or ZIP code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 text-lg"
                  />
                </div>
              </div>
              
              {/* Care Types Grid */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">Care Types Needed</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {careTypeOptions.map(option => (
                    <Button
                      key={option.value}
                      variant={filters.selectedCareTypes.includes(option.value) ? "default" : "outline"}
                      className="h-auto py-3 px-2 flex flex-col gap-1"
                      onClick={() => toggleCareType(option.value)}
                    >
                      <span className="text-2xl">{option.emoji}</span>
                      <span className="text-xs text-center leading-tight">{option.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Budget and Distance Sliders */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-base font-semibold">
                    Budget Range: {filters.budget}
                  </Label>
                  <Slider
                    value={[
                      filters.budget === 'Under $2,000' ? 1 :
                      filters.budget === '$2,000-$4,000' ? 2 :
                      filters.budget === '$4,000-$6,000' ? 3 :
                      filters.budget === 'Above $6,000' ? 4 : 0
                    ]}
                    onValueChange={([value]) => {
                      const budgets = ['Any Budget', 'Under $2,000', '$2,000-$4,000', '$4,000-$6,000', 'Above $6,000'];
                      setFilters(prev => ({ ...prev, budget: budgets[value] }));
                    }}
                    max={4}
                    step={1}
                    className="mt-2"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-base font-semibold">
                    Distance: {filters.distance} miles
                  </Label>
                  <Slider
                    value={[filters.distance]}
                    onValueChange={([value]) => setFilters(prev => ({ ...prev, distance: value }))}
                    max={100}
                    step={5}
                    className="mt-2"
                  />
                </div>
              </div>
              
              {/* Amenities */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">Amenities & Features</Label>
                <div className="flex flex-wrap gap-2">
                  {amenityOptions.map(amenity => (
                    <Badge
                      key={amenity}
                      variant={filters.amenities.includes(amenity) ? "default" : "outline"}
                      className="cursor-pointer py-2 px-3"
                      onClick={() => toggleAmenity(amenity)}
                    >
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Quick Options */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch id="hud" />
                    <Label htmlFor="hud">HUD/Government Assisted</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="available" />
                    <Label htmlFor="available">Available Now</Label>
                  </div>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => setFilters({
                    careType: 'all',
                    selectedCareTypes: [],
                    minRating: 0,
                    amenities: [],
                    budget: 'Any Budget',
                    availability: 'all',
                    distance: 25
                  })}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
        
        {/* Section 2: Map */}
        <Card className={cn(
          "overflow-hidden transition-all duration-300",
          isMobile && expandedSection !== 'map' && "max-h-20"
        )}>
          <CardHeader 
            className="cursor-pointer"
            onClick={() => isMobile && setExpandedSection('map')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapIcon className="h-5 w-5 text-green-600" />
                <CardTitle>Step 2: Explore Communities on the Map</CardTitle>
                {communities.length > 0 && (
                  <Badge variant="secondary">{communities.length} found</Badge>
                )}
              </div>
              {isMobile && (
                expandedSection === 'map' ? <ChevronUp /> : <ChevronDown />
              )}
            </div>
          </CardHeader>
          
          {(!isMobile || expandedSection === 'map') && (
            <CardContent className="p-0">
              <div className="h-[500px] relative">
                <Map
                  communities={communities}
                  center={mapCenter}
                  zoom={mapZoom}
                  onBoundsChange={handleMapBoundsChange}
                  onCommunitySelect={handleCommunitySelect}
                  selectedCommunityId={selectedCommunity?.id}
                  showLegend={true}
                  showLayersControl={true}
                />
              </div>
            </CardContent>
          )}
        </Card>
        
        {/* Section 3: List */}
        <Card className={cn(
          "overflow-hidden transition-all duration-300",
          isMobile && expandedSection !== 'list' && "max-h-20"
        )}>
          <CardHeader 
            className="cursor-pointer"
            onClick={() => isMobile && setExpandedSection('list')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <List className="h-5 w-5 text-purple-600" />
                <CardTitle>Step 3: View Matching Communities</CardTitle>
                {communities.length > 0 && (
                  <span className="text-sm text-gray-500">
                    ({communities.length} results)
                  </span>
                )}
              </div>
              {isMobile && (
                expandedSection === 'list' ? <ChevronUp /> : <ChevronDown />
              )}
            </div>
          </CardHeader>
          
          {(!isMobile || expandedSection === 'list') && (
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Searching for communities...</p>
                </div>
              ) : communities.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No communities found in this area</p>
                  <p className="text-sm text-gray-400 mt-2">Try adjusting your filters or search location</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {communities.slice(0, 12).map((community: any) => (
                    <div
                      key={community.id}
                      onClick={() => handleCommunitySelect(community)}
                      className={cn(
                        "cursor-pointer transition-all duration-200",
                        selectedCommunity?.id === community.id && "ring-2 ring-blue-500 rounded-lg"
                      )}
                    >
                      <PrioritizedCommunityCard
                        community={community}
                        onSelect={() => setLocation(`/community/${community.id}`)}
                      />
                    </div>
                  ))}
                </div>
              )}
              
              {communities.length > 12 && (
                <div className="mt-6 text-center">
                  <Button
                    onClick={() => setLocation('/map-search?query=' + searchQuery)}
                    variant="outline"
                    size="lg"
                  >
                    View All {communities.length} Results in Full Map
                  </Button>
                </div>
              )}
            </CardContent>
          )}
        </Card>
        
        {/* Help Text */}
        <div className="text-center text-sm text-gray-500 py-4">
          <p>Need the traditional map view? <Button
            variant="link"
            className="text-blue-600 p-0 h-auto"
            onClick={() => setLocation('/map-search')}
          >
            Switch to Classic Map Search
          </Button></p>
        </div>
      </div>
    </div>
  );
}
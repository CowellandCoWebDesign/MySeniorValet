import React, { useState, useCallback, useEffect } from 'react';
import { NavigationHeader } from '@/components/NavigationHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import Map from '@/components/Map';
import { EnhancedCommunityCard } from '@/components/EnhancedCommunityCard';
import { AutocompleteSearch } from '@/components/AutocompleteSearch';
import { 
  MapPin, 
  Search, 
  Shield, 
  DollarSign,
  Heart,
  ChevronRight,
  Loader2,
  Home,
  Star,
  Users,
  Activity,
  CheckCircle,
  Building2,
  Calendar,
  Clock,
  User,
  MessageCircle,
  BookOpen,
  UserCheck,
  Bed,
  Car,
  Utensils,
  Wifi,
  Dumbbell,
  TreePine,
  Stethoscope,
  Baby,
  Dog,
  Gamepad2,
  Filter,
  RotateCcw
} from 'lucide-react';

interface SearchFilters {
  typeOfLiving: string[];
  amenities: string[];
  unitType: string[];
  distance: number;
  priceRange: [number, number];
  immediateAvailability: boolean;
  location: string;
}

const CARE_TYPES = [
  { id: 'independent', name: 'Independent Living', icon: <Home className="w-6 h-6" />, description: '55+' },
  { id: 'assisted', name: 'Assisted Living', icon: <Heart className="w-6 h-6" />, description: 'Daily Support' },
  { id: 'memory', name: 'Memory Care', icon: <Activity className="w-6 h-6" />, description: 'Specialized Care' },
  { id: 'skilled', name: 'Skilled Nursing', icon: <Stethoscope className="w-6 h-6" />, description: '24/7 Medical' },
  { id: 'hud', name: 'HUD Housing', icon: <Building2 className="w-6 h-6" />, description: 'Government' },
  { id: 'ccrc', name: 'CCRC', icon: <Users className="w-6 h-6" />, description: 'Continuing Care' },
  { id: 'mobile', name: 'Mobile Home', icon: <Car className="w-6 h-6" />, description: 'Affordable' },
  { id: 'more', name: 'More', icon: <ChevronRight className="w-6 h-6" />, description: 'Options' }
];

const AMENITIES = [
  { id: 'fitness', name: 'Fitness Center', icon: <Dumbbell className="w-5 h-5" /> },
  { id: 'dining', name: 'Daily Meal Prep', icon: <Utensils className="w-5 h-5" /> },
  { id: 'medical', name: 'Medical Services', icon: <Stethoscope className="w-5 h-5" /> },
  { id: 'wifi', name: 'WiFi', icon: <Wifi className="w-5 h-5" /> },
  { id: 'transportation', name: 'Transportation', icon: <Car className="w-5 h-5" /> },
  { id: 'outdoors', name: 'Outdoor Areas', icon: <TreePine className="w-5 h-5" /> },
  { id: 'pets', name: 'Pet Friendly', icon: <Dog className="w-5 h-5" /> },
  { id: 'activities', name: 'Activities', icon: <Gamepad2 className="w-5 h-5" /> },
];

const UNIT_TYPES = [
  { id: 'studio', name: 'Studio', icon: <Bed className="w-6 h-6" /> },
  { id: 'one-bed', name: '1 Bedroom', icon: <Home className="w-6 h-6" /> },
  { id: 'two-bed', name: '2 Bedroom', icon: <Users className="w-6 h-6" /> },
  { id: 'more', name: 'More', icon: <ChevronRight className="w-6 h-6" /> }
];

export default function SimplifiedSearch() {
  const [filters, setFilters] = useState<SearchFilters>({
    typeOfLiving: [],
    amenities: [],
    unitType: [],
    distance: 50,
    priceRange: [500, 8000],
    immediateAvailability: false,
    location: ''
  });

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([39.8283, -98.5795]); // Center of US
  const [mapZoom, setMapZoom] = useState(4);

  // Toggle filter selection
  const toggleFilter = (category: keyof SearchFilters, value: string) => {
    if (category === 'typeOfLiving' || category === 'amenities' || category === 'unitType') {
      const currentValues = filters[category] as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      setFilters({ ...filters, [category]: newValues });
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      typeOfLiving: [],
      amenities: [],
      unitType: [],
      distance: 50,
      priceRange: [500, 8000],
      immediateAvailability: false,
      location: ''
    });
  };

  // Apply search with current filters
  const applySearch = async () => {
    if (!filters.location.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      // Convert filters to search parameters using existing unified search endpoint
      const searchParams = new URLSearchParams({
        location: filters.location,
        careType: filters.typeOfLiving.join(',') || 'All Types',
        priceMin: filters.priceRange[0].toString(),
        priceMax: filters.priceRange[1].toString(),
        limit: '50',
        offset: '0'
      });

      const response = await fetch(`/api/communities/search/unified?${searchParams}`);
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.results || []);
        
        // Update map center based on first result if available
        if (data.results && data.results.length > 0) {
          const firstResult = data.results[0];
          if (firstResult.latitude && firstResult.longitude) {
            setMapCenter([parseFloat(firstResult.latitude), parseFloat(firstResult.longitude)]);
            setMapZoom(10);
          }
        }
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavigationHeader />
      
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Senior Living Research
              </h1>
              <h2 className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
                Simplified
              </h2>
            </div>
            
            {/* Key Features */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mt-4 lg:mt-0">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span>Privacy</span>
                <p className="text-xs">We Don't Sell Your Personal Information To Facilities</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span>Transparency</span>
                <p className="text-xs">Each Listing Has A Starting Price, Average Price, And Current Availability</p>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-purple-600" />
                <span>Convenience</span>
                <p className="text-xs">Have Questions? Direct Message The Facility Right From Their Listing</p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
                <User className="w-4 h-4 mr-2" />
                Create A Profile
              </Button>
            </div>
          </div>

          {/* Location Search */}
          <div className="relative mb-6">
            <AutocompleteSearch
              value={filters.location}
              onChange={(value) => setFilters({ ...filters, location: value })}
              placeholder="Search by Zip code, City, Location"
              className="w-full h-12 pl-12 pr-4 text-lg"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Filter Categories */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
            
            {/* Type of Living */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Type of Living
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {CARE_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => toggleFilter('typeOfLiving', type.id)}
                    className={`p-3 rounded-lg border text-center transition-all hover:shadow-md ${
                      filters.typeOfLiving.includes(type.id)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      {type.icon}
                      <span className="text-xs font-medium">{type.name}</span>
                      <span className="text-xs opacity-75">{type.description}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Amenities/Care Services */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Amenities/Care Services
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {AMENITIES.slice(0, 8).map((amenity) => (
                  <button
                    key={amenity.id}
                    onClick={() => toggleFilter('amenities', amenity.id)}
                    className={`p-2 rounded-lg border text-center transition-all hover:shadow-md ${
                      filters.amenities.includes(amenity.id)
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-green-300'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      {amenity.icon}
                      <span className="text-xs font-medium">{amenity.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Unit/Room Type */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Unit/Room Type
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {UNIT_TYPES.map((unit) => (
                  <button
                    key={unit.id}
                    onClick={() => toggleFilter('unitType', unit.id)}
                    className={`p-3 rounded-lg border text-center transition-all hover:shadow-md ${
                      filters.unitType.includes(unit.id)
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      {unit.icon}
                      <span className="text-xs font-medium">{unit.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Distance */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Distance
              </Label>
              <div className="space-y-2">
                <Slider
                  value={[filters.distance]}
                  onValueChange={(value) => setFilters({ ...filters, distance: value[0] })}
                  max={100}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0</span>
                  <span>{filters.distance} Miles</span>
                  <span>100</span>
                </div>
                <div className="text-center text-xs text-gray-600 dark:text-gray-400">
                  min/max
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Price
              </Label>
              <div className="space-y-2">
                <Slider
                  value={filters.priceRange}
                  onValueChange={(value) => setFilters({ ...filters, priceRange: value as [number, number] })}
                  max={10000}
                  min={0}
                  step={100}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>${filters.priceRange[0]}</span>
                  <span>${filters.priceRange[1]}</span>
                </div>
                <div className="text-center text-xs text-gray-600 dark:text-gray-400">
                  min/max
                </div>
              </div>
            </div>

            {/* Immediate Availability */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Immediate Availability
              </Label>
              <div className="space-y-2">
                <button
                  onClick={() => setFilters({ ...filters, immediateAvailability: !filters.immediateAvailability })}
                  className={`w-full p-3 rounded-lg border text-center transition-all hover:shadow-md ${
                    filters.immediateAvailability
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-green-300'
                  }`}
                >
                  <CheckCircle className="w-6 h-6 mx-auto mb-1" />
                  <span className="text-sm font-medium">Apply</span>
                </button>
                
                <button
                  onClick={resetFilters}
                  className="w-full p-2 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                >
                  <RotateCcw className="w-4 h-4 mx-auto mb-1" />
                  <span className="text-xs">Reset Filter</span>
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Search className="w-4 h-4" />
              <span>AI Smart Search</span>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={applySearch}
                disabled={isLoading || !filters.location.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  'Apply'
                )}
              </Button>
              
              <Button variant="outline" className="text-sm">
                View all
              </Button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {searchResults.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map */}
            <div className="lg:col-span-2">
              <Card className="h-[600px]">
                <CardContent className="h-full p-0">
                  <Map
                    center={mapCenter}
                    zoom={mapZoom}
                    searchFilters={{
                      careType: filters.typeOfLiving.join(','),
                      budget: `${filters.priceRange[0]}-${filters.priceRange[1]}`
                    }}
                    onBoundsChange={(bounds: any) => {
                      console.log('Map bounds changed:', bounds);
                    }}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Community Cards */}
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {searchResults.map((community, index) => (
                <EnhancedCommunityCard
                  key={community.id || index}
                  community={community}
                />
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {!isLoading && searchResults.length === 0 && filters.location && (
          <Card className="text-center p-8">
            <CardContent>
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No communities found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your filters or searching in a different location.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
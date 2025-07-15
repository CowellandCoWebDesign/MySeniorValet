import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Search, Filter, List, MapIcon, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Separator } from '@/components/ui/separator';
import Map from '@/components/Map';

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
  const [searchQuery, setSearchQuery] = useState('');
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
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/')}
              >
                ← Back
              </Button>
              <h1 className="text-xl font-semibold">Map Search</h1>
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
            height="calc(100vh - 200px)"
            searchFilters={filters}
            onCommunityClick={handleCommunityClick}
          />
        ) : (
          <div className="p-4">
            <div className="text-center py-8">
              <List className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">List view coming soon!</p>
              <p className="text-sm text-gray-500 mt-2">
                Switch to map view to see communities in your area
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
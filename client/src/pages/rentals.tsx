import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Heart, 
  Home,
  DollarSign,
  Users,
  Calendar,
  Phone,
  Mail,
  Grid3X3,
  List,
  SlidersHorizontal,
  Bed,
  Bath,
  Car,
  Wifi,
  Dumbbell,
  Utensils,
  Shield,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import BottomNavigation from '@/components/BottomNavigation';
import RentalMapbox from '@/components/RentalMapbox';
import SlidePanel from '@/components/SlidePanel';
import type { Community } from '@shared/schema';

interface RentalFilters {
  priceRange: [number, number];
  careTypes: string[];
  amenities: string[];
  availabilityOnly: boolean;
  rating: number;
  location: string;
  sortBy: 'price' | 'rating' | 'distance' | 'newest';
}

export default function Rentals() {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [slidePanelHeight, setSlidePanelHeight] = useState(120);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [filters, setFilters] = useState<RentalFilters>({
    priceRange: [2000, 8000],
    careTypes: [],
    amenities: [],
    availabilityOnly: false,
    rating: 0,
    location: '',
    sortBy: 'price'
  });

  // Fetch communities data
  const { data: communities = [], isLoading, error } = useQuery({
    queryKey: ['/api/communities/search', { limit: 200 }],
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Filter communities based on search and filters
  const filteredCommunities = useMemo(() => {
    let filtered = communities.filter((community: Community) => {
      // Search query filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
          community.name.toLowerCase().includes(searchLower) ||
          community.city.toLowerCase().includes(searchLower) ||
          community.state.toLowerCase().includes(searchLower) ||
          community.careTypes?.some(type => type.toLowerCase().includes(searchLower));
        
        if (!matchesSearch) return false;
      }

      // Price range filter
      if (community.monthlyRent) {
        if (community.monthlyRent < filters.priceRange[0] || community.monthlyRent > filters.priceRange[1]) {
          return false;
        }
      }

      // Care types filter
      if (filters.careTypes.length > 0) {
        const hasCareType = filters.careTypes.some(type => 
          community.careTypes?.includes(type)
        );
        if (!hasCareType) return false;
      }

      // Availability filter
      if (filters.availabilityOnly) {
        if (community.availabilityStatus !== 'Immediate Availability') {
          return false;
        }
      }

      // Rating filter
      if (filters.rating > 0) {
        if (!community.rating || community.rating < filters.rating) {
          return false;
        }
      }

      return true;
    });

    // Sort communities
    filtered.sort((a: Community, b: Community) => {
      switch (filters.sortBy) {
        case 'price':
          return (a.monthlyRent || 0) - (b.monthlyRent || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [communities, searchQuery, filters]);

  // Handle community selection
  const handleCommunityClick = (communityId: number) => {
    const community = communities.find((c: Community) => c.id === communityId);
    setSelectedCommunity(community || null);
    setSlidePanelHeight(window.innerHeight * 0.6); // Expand panel when community selected
  };

  // Handle filter changes
  const updateFilter = (key: keyof RentalFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Care type options
  const careTypeOptions = [
    'Independent Living',
    'Assisted Living',
    'Memory Care',
    'Skilled Nursing',
    'Continuing Care'
  ];

  // Amenity options
  const amenityOptions = [
    'Fitness Center',
    'Swimming Pool',
    'Dining Room',
    'Library',
    'Garden',
    'Chapel',
    'Beauty Salon',
    'Transportation',
    'Wifi',
    'Parking'
  ];

  if (error) {
    return (
      <div className="min-h-screen bg-white pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading</h3>
            <p className="text-red-600 mb-4">{error.message}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-16">
      {/* Header */}
      <div className="sticky top-0 bg-white z-40 border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">Rentals</h1>
              <Badge variant="secondary" className="text-sm">
                {filteredCommunities.length} found
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'map' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('map')}
                  className="rounded-none"
                >
                  <MapPin className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>

              {/* Filters Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="relative"
              >
                <SlidersHorizontal className="w-4 h-4" />
                {(filters.careTypes.length > 0 || filters.amenities.length > 0 || filters.availabilityOnly) && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full" />
                )}
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search communities, cities, or care types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="border-t border-gray-200 bg-gray-50 p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Price Range */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Price Range: ${filters.priceRange[0].toLocaleString()} - ${filters.priceRange[1].toLocaleString()}
                </Label>
                <Slider
                  value={filters.priceRange}
                  onValueChange={(value) => updateFilter('priceRange', value)}
                  min={1000}
                  max={15000}
                  step={500}
                  className="w-full"
                />
              </div>

              {/* Care Types */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Care Types</Label>
                <Select 
                  value={filters.careTypes[0] || ''}
                  onValueChange={(value) => updateFilter('careTypes', value ? [value] : [])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select care type" />
                  </SelectTrigger>
                  <SelectContent>
                    {careTypeOptions.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Sort By</Label>
                <Select 
                  value={filters.sortBy}
                  onValueChange={(value) => updateFilter('sortBy', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price">Price: Low to High</SelectItem>
                    <SelectItem value="rating">Rating: High to Low</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Additional Filters */}
            <div className="mt-4 flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="availability"
                  checked={filters.availabilityOnly}
                  onCheckedChange={(checked) => updateFilter('availabilityOnly', checked)}
                />
                <Label htmlFor="availability" className="text-sm">Immediate Availability Only</Label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="relative h-[calc(100vh-140px)]">
        {viewMode === 'map' ? (
          <>
            {/* Mapbox Component */}
            <RentalMapbox
              communities={filteredCommunities}
              onCommunityClick={handleCommunityClick}
              selectedCommunity={selectedCommunity}
              className="w-full h-full"
            />

            {/* Slide Panel */}
            <SlidePanel
              communities={filteredCommunities}
              sortBy={filters.sortBy}
              setSortBy={(value) => updateFilter('sortBy', value)}
              isLoading={isLoading}
              initialHeight={slidePanelHeight}
              autoExpand={!!selectedCommunity}
            />
          </>
        ) : (
          /* List View */
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCommunities.map((community: Community) => (
                <Card 
                  key={community.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => window.location.href = `/community/${community.id}`}
                >
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{community.name}</h3>
                    <p className="text-gray-600 mb-3">
                      {community.city}, {community.state}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {community.careTypes?.slice(0, 2).map((type, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">{type}</Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-green-600">
                        {community.monthlyRent 
                          ? `$${community.monthlyRent.toLocaleString()}/mo`
                          : 'Contact for pricing'
                        }
                      </span>
                      {community.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="font-medium">{community.rating}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation 
        activeTab="rentals"
        onTabChange={(tab) => {
          if (tab === 'search') window.location.href = '/search';
          else if (tab === 'updates') window.location.href = '/dashboard?tab=updates';
          else if (tab === 'saved') window.location.href = '/dashboard?tab=saved';
          else if (tab === 'tours') window.location.href = '/dashboard?tab=tours';
          else if (tab === 'inbox') window.location.href = '/dashboard?tab=inbox';
        }}
      />
    </div>
  );
}
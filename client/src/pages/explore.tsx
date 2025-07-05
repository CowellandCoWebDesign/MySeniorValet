import { useEffect, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Filter, Search, Star, Clock, DollarSign, Phone, Globe, Heart, MapIcon } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Footer } from '@/components/footer';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Community {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string | null;
  website: string | null;
  description: string | null;
  careTypes: string[];
  amenities: string[];
  latitude: number | null;
  longitude: number | null;
  googleRating: number | null;
  googleReviewCount: number | null;
  yelpRating: number | null;
  yelpReviewCount: number | null;
  photosCount: number | null;
  verified: boolean;
  featured: boolean;
  priceRange: string | null;
  availabilityStatus: string | null;
  lastUpdated: string | null;
}

interface ExploreFilters {
  city: string;
  careType: string;
  minRating: string;
  hasPhotos: boolean;
}

// Create custom markers for different care types
const createCustomIcon = (careType: string) => {
  const colors = {
    'Independent Living': '#10B981', // green
    'Assisted Living': '#F59E0B', // yellow
    'Memory Care': '#EF4444', // red
    'Skilled Nursing': '#3B82F6', // blue
    'CCRC': '#8B5CF6', // purple
    'default': '#6B7280' // gray
  };
  
  const color = colors[careType as keyof typeof colors] || colors.default;
  
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>`,
    className: 'custom-marker',
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    popupAnchor: [0, -6]
  });
};

export default function Explore() {
  const [filters, setFilters] = useState<ExploreFilters>({
    city: 'all',
    careType: 'all',
    minRating: 'all',
    hasPhotos: false
  });
  
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([37.7749, -122.4194]); // Default to SF
  const [mapZoom, setMapZoom] = useState(10);

  const { data: allCommunities, isLoading } = useQuery<Community[]>({
    queryKey: ['/api/communities'],
    queryFn: async () => {
      const response = await fetch('/api/communities');
      if (!response.ok) throw new Error('Failed to fetch communities');
      return response.json();
    },
  });

  // Filter communities on the frontend
  const communities = useMemo(() => {
    if (!allCommunities) return [];
    
    return allCommunities.filter(community => {
      // City filter
      if (filters.city && filters.city !== 'all' && community.city !== filters.city) return false;
      
      // Care type filter
      if (filters.careType && filters.careType !== 'all' && !community.careTypes.includes(filters.careType)) return false;
      
      // Rating filter
      if (filters.minRating && filters.minRating !== 'all') {
        const rating = community.googleRating || 0;
        if (rating < parseInt(filters.minRating)) return false;
      }
      
      // Photos filter
      if (filters.hasPhotos && (!community.photosCount || community.photosCount === 0)) return false;
      
      return true;
    });
  }, [allCommunities, filters]);

  // Filter communities that have location data for the map
  const mappableCommunities = communities?.filter(c => c.latitude && c.longitude) || [];

  // Get unique cities and care types for filters
  const cities = [...new Set(allCommunities?.map(c => c.city) || [])].sort();
  const careTypes = [...new Set(allCommunities?.flatMap(c => c.careTypes) || [])].sort();

  // Center map on filtered results
  useEffect(() => {
    if (mappableCommunities.length > 0) {
      const lats = mappableCommunities.map(c => c.latitude!);
      const lngs = mappableCommunities.map(c => c.longitude!);
      const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
      const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
      setMapCenter([centerLat, centerLng]);
    }
  }, [mappableCommunities]);

  const handleFilterChange = (key: keyof ExploreFilters, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      city: 'all',
      careType: 'all',
      minRating: 'all',
      hasPhotos: false
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Modern Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-6">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  ← Home
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <MapIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Community Explorer</h1>
                  <p className="text-xs text-gray-500 -mt-0.5">
                    {communities?.length || 0} verified communities
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" onClick={clearFilters} className="hidden sm:flex">
                <Filter className="h-4 w-4 mr-2" />
                Reset Filters
              </Button>
              <Link href="/search">
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <Search className="mr-2 h-4 w-4" />
                  Advanced Search
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Filters */}
      <section className="bg-gray-50/50 border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Refine Your Search</h2>
                <p className="text-sm text-gray-500 mt-1">Find the perfect community for your needs</p>
              </div>
              <div className="text-sm font-medium text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                {communities?.length || 0} of {allCommunities?.length || 0} communities
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center">
                  <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                  Location
                </label>
                <Select value={filters.city} onValueChange={(value) => handleFilterChange('city', value)}>
                  <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="All Cities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities ({allCommunities?.length || 0})</SelectItem>
                    {cities.map(city => {
                      const count = allCommunities?.filter(c => c.city === city).length || 0;
                      return (
                        <SelectItem key={city} value={city}>{city} ({count})</SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center">
                  <Heart className="h-4 w-4 mr-1 text-gray-500" />
                  Care Type
                </label>
                <Select value={filters.careType} onValueChange={(value) => handleFilterChange('careType', value)}>
                  <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="All Care Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Care Types</SelectItem>
                    {careTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center">
                  <Star className="h-4 w-4 mr-1 text-gray-500" />
                  Rating
                </label>
                <Select value={filters.minRating} onValueChange={(value) => handleFilterChange('minRating', value)}>
                  <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="All Ratings" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="4">4+ Stars ⭐⭐⭐⭐</SelectItem>
                    <SelectItem value="3">3+ Stars ⭐⭐⭐</SelectItem>
                    <SelectItem value="2">2+ Stars ⭐⭐</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Actions</label>
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="w-full h-12 border-gray-200 hover:bg-gray-50"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Reset Filters
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Map */}
          <div className="lg:sticky lg:top-32 h-[600px]">
            <Card className="h-full">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Community Locations</CardTitle>
                <CardDescription>
                  {mappableCommunities.length} communities with location data
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 h-[500px]">
                {mappableCommunities.length > 0 ? (
                  <MapContainer 
                    center={mapCenter} 
                    zoom={mapZoom} 
                    style={{ height: '100%', width: '100%' }}
                    className="rounded-b-lg"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {mappableCommunities.map(community => (
                      <Marker
                        key={community.id}
                        position={[community.latitude!, community.longitude!]}
                        icon={createCustomIcon(community.careTypes[0] || 'default')}
                        eventHandlers={{
                          click: () => setSelectedCommunity(community)
                        }}
                      >
                        <Popup>
                          <div className="w-64">
                            <h3 className="font-semibold text-gray-900 mb-1">{community.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">{community.address}</p>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {community.careTypes.slice(0, 2).map(type => (
                                <Badge key={type} variant="secondary" className="text-xs">{type}</Badge>
                              ))}
                            </div>
                            {community.googleRating && (
                              <div className="flex items-center text-sm text-gray-600 mb-2">
                                <Star className="h-3 w-3 text-yellow-400 mr-1" />
                                {community.googleRating} ({community.googleReviewCount} reviews)
                              </div>
                            )}
                            <Link href={`/community/${community.id}`}>
                              <Button size="sm" className="w-full">View Details</Button>
                            </Link>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-50 rounded-b-lg">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No communities with location data found</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Community List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : communities && communities.length > 0 ? (
              <>
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {communities.length} {communities.length === 1 ? 'Community' : 'Communities'} Found
                  </h2>
                </div>
                {communities.map(community => (
                  <Card 
                    key={community.id} 
                    className={`group hover:shadow-lg hover:shadow-blue-100/50 transition-all duration-200 cursor-pointer border border-gray-200 hover:border-blue-300 ${
                      selectedCommunity?.id === community.id ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-100/50' : ''
                    }`}
                    onClick={() => setSelectedCommunity(community)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                            {community.name}
                          </CardTitle>
                          <CardDescription className="flex items-center mt-2 text-gray-600">
                            <MapPin className="h-4 w-4 mr-1.5 text-gray-500" />
                            {community.city}, {community.state}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          {community.verified && (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium">
                              ✓ Verified
                            </Badge>
                          )}
                          {community.photosCount && community.photosCount > 0 && (
                            <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                              {community.photosCount} photos
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {/* Care Types */}
                        <div className="flex flex-wrap gap-2">
                          {community.careTypes.slice(0, 3).map(type => (
                            <Badge key={type} variant="secondary" className="text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">
                              {type}
                            </Badge>
                          ))}
                          {community.careTypes.length > 3 && (
                            <Badge variant="outline" className="text-xs text-gray-500">
                              +{community.careTypes.length - 3} more
                            </Badge>
                          )}
                        </div>

                        {/* Ratings Row */}
                        {(community.googleRating || community.yelpRating) && (
                          <div className="flex items-center space-x-6 text-sm">
                            {community.googleRating && (
                              <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-lg">
                                <Star className="h-4 w-4 text-yellow-500 mr-1.5 fill-current" />
                                <span className="font-medium text-gray-900">{community.googleRating}</span>
                                <span className="text-gray-600 ml-1">({community.googleReviewCount})</span>
                              </div>
                            )}
                            {community.yelpRating && (
                              <div className="flex items-center bg-red-50 px-2 py-1 rounded-lg">
                                <Star className="h-4 w-4 text-red-500 mr-1.5 fill-current" />
                                <span className="font-medium text-gray-900">{community.yelpRating}</span>
                                <span className="text-gray-600 ml-1">({community.yelpReviewCount})</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Price and Availability */}
                        <div className="border-t border-gray-100 pt-4 mt-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              {community.priceRange && (
                                <div className="flex items-center bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                                  <DollarSign className="h-4 w-4 mr-1.5" />
                                  {typeof community.priceRange === 'string' 
                                    ? community.priceRange 
                                    : typeof community.priceRange === 'object' && community.priceRange.min && community.priceRange.max
                                      ? `$${community.priceRange.min} - $${community.priceRange.max}`
                                      : 'Contact for pricing'
                                  }
                                </div>
                              )}
                              {community.availabilityStatus && (
                                <div className="flex items-center bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                                  <Clock className="h-4 w-4 mr-1.5" />
                                  {community.availabilityStatus}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center space-x-3">
                              {community.phone && (
                                <Button size="sm" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50" asChild>
                                  <a href={`tel:${community.phone}`}>
                                    <Phone className="h-4 w-4 mr-1.5" />
                                    Call
                                  </a>
                                </Button>
                              )}
                              <Link href={`/community/${community.id}`}>
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 shadow-sm">
                                  View Details
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No communities found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your filters or search criteria.
                  </p>
                  <Button onClick={clearFilters} variant="outline">
                    Clear All Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
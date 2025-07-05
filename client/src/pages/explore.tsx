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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  ← Back to Home
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <MapIcon className="h-6 w-6 text-primary" />
                  Explore Communities
                </h1>
                <p className="text-sm text-gray-600">
                  {communities?.length || 0} communities across Northern California
                </p>
              </div>
            </div>
            <Link href="/search">
              <Button>
                <Search className="mr-2 h-4 w-4" />
                Advanced Search
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Select value={filters.city} onValueChange={(value) => handleFilterChange('city', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={filters.careType} onValueChange={(value) => handleFilterChange('careType', value)}>
                <SelectTrigger>
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
            <div>
              <Select value={filters.minRating} onValueChange={(value) => handleFilterChange('minRating', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Ratings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="4">4+ Stars</SelectItem>
                  <SelectItem value="3">3+ Stars</SelectItem>
                  <SelectItem value="2">2+ Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="flex-1"
              >
                Clear Filters
              </Button>
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
                    className={`hover:shadow-lg transition-shadow cursor-pointer ${
                      selectedCommunity?.id === community.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedCommunity(community)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{community.name}</CardTitle>
                          <CardDescription className="flex items-center mt-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            {community.city}, {community.state}
                          </CardDescription>
                        </div>
                        {community.verified && (
                          <Badge className="bg-green-100 text-green-800">Verified</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* Care Types */}
                        <div className="flex flex-wrap gap-1">
                          {community.careTypes.map(type => (
                            <Badge key={type} variant="outline" className="text-xs">{type}</Badge>
                          ))}
                        </div>

                        {/* Ratings */}
                        {(community.googleRating || community.yelpRating) && (
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            {community.googleRating && (
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                {community.googleRating} Google ({community.googleReviewCount})
                              </div>
                            )}
                            {community.yelpRating && (
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-red-400 mr-1" />
                                {community.yelpRating} Yelp ({community.yelpReviewCount})
                              </div>
                            )}
                          </div>
                        )}

                        {/* Price and Availability */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm">
                            {community.priceRange && (
                              <div className="flex items-center text-green-600">
                                <DollarSign className="h-4 w-4 mr-1" />
                                {typeof community.priceRange === 'string' 
                                  ? community.priceRange 
                                  : typeof community.priceRange === 'object' && community.priceRange.min && community.priceRange.max
                                    ? `$${community.priceRange.min} - $${community.priceRange.max}`
                                    : 'Contact for pricing'
                                }
                              </div>
                            )}
                            {community.availabilityStatus && (
                              <div className="flex items-center text-blue-600">
                                <Clock className="h-4 w-4 mr-1" />
                                {community.availabilityStatus}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {community.phone && (
                              <Button size="sm" variant="outline" asChild>
                                <a href={`tel:${community.phone}`}>
                                  <Phone className="h-4 w-4 mr-1" />
                                  Call
                                </a>
                              </Button>
                            )}
                            <Link href={`/community/${community.id}`}>
                              <Button size="sm">View Details</Button>
                            </Link>
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
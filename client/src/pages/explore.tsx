import { useEffect, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Filter, Search, Star, Clock, DollarSign, Phone, Globe, Heart, MapIcon, Camera, Shield } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { CommunityCard } from '@/components/community-card';
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
  verifiedOnly: boolean;
  priceRange: string;
  amenities: string[];
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

// Helper functions for price estimation
const getEstimatedPrice = (careTypes: string[]): number => {
  if (careTypes.includes('Skilled Nursing')) return 7000;
  if (careTypes.includes('Memory Care')) return 6500;
  if (careTypes.includes('Assisted Living')) return 5000;
  if (careTypes.includes('CCRC')) return 8000;
  if (careTypes.includes('Independent Living')) return 3500;
  return 4500; // Default
};

const matchesPriceRange = (price: number, range: string): boolean => {
  switch (range) {
    case 'budget': return price < 4000;
    case 'mid': return price >= 4000 && price <= 6000;
    case 'premium': return price > 6000 && price <= 8000;
    case 'luxury': return price > 8000;
    default: return true;
  }
};

export default function Explore() {
  const [filters, setFilters] = useState<ExploreFilters>({
    city: 'all',
    careType: 'all',
    minRating: 'all',
    hasPhotos: false,
    verifiedOnly: false,
    priceRange: 'all',
    amenities: []
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
      
      // Verified only filter
      if (filters.verifiedOnly && !community.verified) return false;
      
      // Price range filter (basic estimation based on care type)
      if (filters.priceRange && filters.priceRange !== 'all') {
        const estimatedPrice = getEstimatedPrice(community.careTypes);
        if (!matchesPriceRange(estimatedPrice, filters.priceRange)) return false;
      }
      
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
      hasPhotos: false,
      verifiedOnly: false,
      priceRange: 'all',
      amenities: []
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/5 left-1/4 w-80 h-80 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-2/3 left-2/3 w-64 h-64 bg-gradient-to-r from-emerald-400/10 to-teal-400/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      
      <div className="relative z-10">
        <Header />

      {/* Enhanced Filters */}
      <section className="bg-gray-50/50 border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/60 p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
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
                <label className="text-sm font-semibold text-gray-700 flex items-center">
                  <Camera className="h-4 w-4 mr-1 text-gray-500" />
                  Premium Features
                </label>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox"
                    id="hasPhotos"
                    checked={filters.hasPhotos}
                    onChange={(e) => handleFilterChange('hasPhotos', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="hasPhotos" className="text-sm text-gray-700">
                    Has Photos
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center">
                  <Shield className="h-4 w-4 mr-1 text-gray-500" />
                  Verification
                </label>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox"
                    id="verifiedOnly"
                    checked={filters.verifiedOnly}
                    onChange={(e) => handleFilterChange('verifiedOnly', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="verifiedOnly" className="text-sm text-gray-700">
                    Verified Communities Only
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center">
                  <DollarSign className="h-4 w-4 mr-1 text-gray-500" />
                  Price Range
                </label>
                <Select value={filters.priceRange} onValueChange={(value) => handleFilterChange('priceRange', value)}>
                  <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="All Price Ranges" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Price Ranges</SelectItem>
                    <SelectItem value="budget">Budget-Friendly (Under $4,000)</SelectItem>
                    <SelectItem value="mid">Mid-Range ($4,000 - $6,000)</SelectItem>
                    <SelectItem value="premium">Premium ($6,000 - $8,000)</SelectItem>
                    <SelectItem value="luxury">Luxury ($8,000+)</SelectItem>
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
                  <div 
                    key={community.id}
                    className={`${selectedCommunity?.id === community.id ? 'ring-2 ring-blue-500 rounded-lg' : ''}`}
                    onClick={() => setSelectedCommunity(community)}
                  >
                    <CommunityCard community={community} />
                  </div>
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
    </div>
  );
}
import { useState, useEffect, useRef, useCallback, lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Heart, MapPin, Filter, Star, Home, ArrowLeft, Settings, Map as MapIcon, List, Loader2, Brain } from "lucide-react";
import { Link, useLocation } from "wouter";
import { PricingTransparencyBadgeList, TransparencyScore } from "@/components/PricingTransparencyBadge";
import { NavigationHeader } from "@/components/NavigationHeader";
import { PrioritizedCommunityCard } from "@/components/PrioritizedCommunityCard";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { SlidersHorizontal } from 'lucide-react';
import { AutocompleteSearch } from "@/components/AutocompleteSearch";

// Lazy load the Map component
const Map = lazy(() => import("@/components/Map"));

interface Community {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  careTypes: string[];
  monthlyRent?: number;
  priceRange?: {
    min: number;
    max: number;
  };
  pricingType?: 'estimated' | 'live';
  isClaimed?: boolean;
  googleRating?: number;
  googleReviewCount?: number;
  phone?: string;
  website?: string;
  photos?: string[];
  photoAttributions?: string[];
  transparencyBadges?: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    points: number;
  }>;
  transparencyScore?: number;
}

export default function MySeniorValetSearch() {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState<{lat: number; lng: number} | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    careTypes: [] as string[],
    maxPrice: '',
    minRating: '',
    region: ''
  });
  
  // Pagination state
  const [displayedCount, setDisplayedCount] = useState(20); // Start with 20 communities
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Parse URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get('q');
    const state = urlParams.get('state');
    const city = urlParams.get('city');
    const careType = urlParams.get('careType');
    
    if (q) setSearchQuery(q);
    if (state) setFilters(prev => ({ ...prev, region: state }));
    if (city) setSearchQuery(city);
    if (careType) setFilters(prev => ({ ...prev, careTypes: [careType] }));
  }, [location]);

  // Build query string for API
  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (filters.region) params.append('state', filters.region);
    if (filters.careTypes.length > 0) params.append('careType', filters.careTypes[0]);
    if (filters.maxPrice) params.append('priceMax', filters.maxPrice);
    if (filters.minRating) params.append('minRating', filters.minRating);
    params.append('limit', '20'); // Start with 20 for faster initial load
    return params.toString();
  };

  // Fetch communities using actual search API with query
  const { data: searchResponse, isLoading, refetch } = useQuery({
    queryKey: ["/api/communities/search", searchQuery, filters],
    queryFn: async () => {
      const queryString = buildQueryString();
      const response = await fetch(`/api/communities/search?${queryString}`);
      if (!response.ok) throw new Error("Failed to fetch communities");
      return response.json();
    },
    retry: false,
    enabled: true, // Always enabled to fetch initial data
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Extract communities array from search response
  const communities = searchResponse?.communities || [];
  const filteredCommunities = communities;
  
  // Get only the communities to display based on pagination
  const displayedCommunities = filteredCommunities.slice(0, displayedCount);
  
  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayedCount < filteredCommunities.length && !isLoadingMore) {
          setIsLoadingMore(true);
          // Simulate loading delay for smooth UX
          setTimeout(() => {
            setDisplayedCount(prev => Math.min(prev + 20, filteredCommunities.length));
            setIsLoadingMore(false);
          }, 300);
        }
      },
      { threshold: 0.1 }
    );
    
    observer.observe(loadMoreRef.current);
    
    return () => observer.disconnect();
  }, [displayedCount, filteredCommunities.length, isLoadingMore]);

  const handleHeartClick = (e: React.MouseEvent, communityId: number) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Implement favorites functionality
  };

  // Handle search submission
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setLocation(`/myseniorvalet-search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <NavigationHeader 
        title="Community Search" 
        subtitle="Find your perfect senior living community"
      />

      {/* Home-style Search Bar Interface */}
      <div className="px-4 py-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 border-b">
        <form onSubmit={(e) => {
          e.preventDefault();
          if (searchQuery) {
            handleSearch(searchQuery);
          }
        }}>
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-4xl mx-auto">
            <div className="flex items-center">
              <div className="flex-1">
                <AutocompleteSearch
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onSubmit={handleSearch}
                  placeholder="Search by city, community name, or care type..."
                  hideSearchButton={true}
                  inputClassName="w-full pl-12 pr-3 py-3 text-base border-0 bg-transparent focus:outline-none focus:ring-0 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              <div className="flex items-center mr-2">
                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 text-xs px-3 py-1 font-semibold">
                  <Brain className="w-3 h-3 mr-1" />
                  AI-Powered
                </Badge>
              </div>
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-2.5 m-2 rounded-lg transition-all flex items-center justify-center shadow-md hover:shadow-lg"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Enhanced Filter Bar with Drawer */}
      <div className="px-4 py-3 bg-white dark:bg-gray-900 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {(filters.careTypes.length > 0 || filters.maxPrice || filters.minRating) && (
                    <Badge variant="secondary" className="ml-1 px-1.5 py-0 h-5 text-xs">
                      {filters.careTypes.length + (filters.maxPrice ? 1 : 0) + (filters.minRating ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Search Filters</DrawerTitle>
                </DrawerHeader>
                <div className="p-4 space-y-4">
                  <div>
                    <Label>Care Types</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {['Independent Living', 'Assisted Living', 'Memory Care', 'Skilled Nursing'].map(type => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox 
                            checked={filters.careTypes.includes(type)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFilters(prev => ({
                                  ...prev,
                                  careTypes: [...prev.careTypes, type]
                                }));
                              } else {
                                setFilters(prev => ({
                                  ...prev,
                                  careTypes: prev.careTypes.filter(t => t !== type)
                                }));
                              }
                            }}
                          />
                          <Label className="text-sm">{type}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Max Price/Month</Label>
                    <Select value={filters.maxPrice} onValueChange={(value) => setFilters(prev => ({ ...prev, maxPrice: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any price" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any price</SelectItem>
                        <SelectItem value="2000">$2,000</SelectItem>
                        <SelectItem value="3000">$3,000</SelectItem>
                        <SelectItem value="4000">$4,000</SelectItem>
                        <SelectItem value="5000">$5,000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Min Rating</Label>
                    <Select value={filters.minRating} onValueChange={(value) => setFilters(prev => ({ ...prev, minRating: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any rating</SelectItem>
                        <SelectItem value="3">3+ Stars</SelectItem>
                        <SelectItem value="4">4+ Stars</SelectItem>
                        <SelectItem value="4.5">4.5+ Stars</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
            
            {/* Active filter badges */}
            {filters.careTypes.length > 0 && (
              <Badge variant="secondary" className="gap-1">
                {filters.careTypes.length} Care Types
                <button onClick={() => setFilters(prev => ({ ...prev, careTypes: [] }))} className="ml-1">
                  ×
                </button>
              </Badge>
            )}
            {filters.maxPrice && (
              <Badge variant="secondary" className="gap-1">
                Max ${filters.maxPrice}
                <button onClick={() => setFilters(prev => ({ ...prev, maxPrice: '' }))} className="ml-1">
                  ×
                </button>
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('map')}
            >
              <MapIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="px-4 py-3 gradient-card border-b border-white/20">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700 font-medium">
            {isLoading ? 'Searching...' : 
             communities.length > 0 ? `Found ${communities.length} results` : 
             searchQuery ? 'No results found' : 'Enter a search term'}
          </p>
          <Button className="gradient-primary hover:opacity-90 text-white px-4 py-2 rounded-full border-0 animate-gradient">
            <Search className="w-4 h-4 mr-2" />
            Save search
          </Button>
        </div>
      </div>

      {/* Loading State - Show skeleton cards while loading */}
      {isLoading && (
        <div className="px-4 py-2 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <Card className="overflow-hidden bg-gray-100 dark:bg-gray-800">
                <CardContent className="p-4">
                  <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Communities List with PrioritizedCommunityCard */}
      {!isLoading && viewMode === 'list' && (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 py-4">
            {communities.length > 0 ? (
              <div className="space-y-4">
                {communities.slice(0, displayedCount).map((community: any, index: number) => {
                  // Remove priceRange from the community object to avoid React rendering errors
                  const { priceRange, ...cleanCommunity } = community;
                  return (
                    <div key={community.id} className="animate-fadeIn" style={{animationDelay: `${Math.min(index, 10) * 0.05}s`}}>
                      <PrioritizedCommunityCard
                        community={{
                          ...cleanCommunity,
                          // Map pricingType to expected values
                          pricingType: community.pricingType === 'estimated' ? 'market' : community.pricingType
                        }}
                        variant="list"
                        onSelect={() => window.location.href = `/community/${community.id}`}
                      />
                    </div>
                  );
                })}
                
                {/* Load More Indicator */}
                {communities.length > displayedCount && (
                  <div ref={loadMoreRef} className="py-4 text-center">
                    {isLoadingMore ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-gray-500">Loading more communities...</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Scroll for more</span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              searchQuery && (
                <div className="text-center py-16">
                  <div className="max-w-md mx-auto">
                    <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg mb-2">No communities found for "{searchQuery}"</p>
                    <p className="text-gray-400">Try searching for a different location or adjusting your filters</p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Map View with Horizontal Panel */}
      {!isLoading && viewMode === 'map' && (
        <div className="relative h-[calc(100vh-260px)] flex flex-col">
          {/* Map Container */}
          <div className="flex-1 relative">
            <Suspense fallback={
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">Loading map...</p>
                </div>
              </div>
            }>
              <Map 
                className="w-full h-full"
                center={searchLocation ? [searchLocation.lat, searchLocation.lng] : undefined}
                zoom={searchLocation ? 12 : 5}
              />
            </Suspense>
          </div>
          
          {/* Horizontal Scrollable Panel */}
          {communities.length > 0 && (
            <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t shadow-lg z-[500] max-h-48">
              <div className="overflow-x-auto p-4">
                <div className="flex gap-4 min-w-max">
                  {communities.slice(0, 10).map((community: any) => {
                    // Remove priceRange from the community object to avoid React rendering errors
                    const { priceRange, ...cleanCommunity } = community;
                    return (
                      <div 
                        key={community.id} 
                        className="w-80 flex-shrink-0 cursor-pointer"
                        onClick={() => window.location.href = `/community/${community.id}`}
                      >
                        <PrioritizedCommunityCard
                          community={{
                            ...cleanCommunity,
                            pricingType: community.pricingType === 'estimated' ? 'market' : community.pricingType
                          }}
                          variant="list"
                          onSelect={() => window.location.href = `/community/${community.id}`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Previous Grid View - Hidden Now */}
      {false && (
        <div className="px-4 py-2">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {communities.map((community: Community, index: number) => (
            <Link key={community.id} href={`/community/${community.id}`}>
              <Card className="overflow-hidden cursor-pointer bg-white shadow-sm hover:shadow-md transition-shadow animate-float w-full" style={{animationDelay: `${index * 0.1}s`}}>
                {/* Photo Section - Matching Homepage Style */}
                <div className="relative h-32 overflow-hidden">
                  {community.photos && community.photos.length > 0 ? (
                    <div className="w-full h-full">
                      <img 
                        src={community.photos[0]} 
                        alt={community.name}
                        className="w-full h-full object-cover"
                      />
                      {/* Photo Attribution */}
                      {community.photoAttributions && community.photoAttributions[0] && (
                        <div 
                          dangerouslySetInnerHTML={{ __html: community.photoAttributions[0] }} 
                          className="absolute bottom-0 left-0 right-0 text-xs text-white bg-black bg-opacity-60 px-1 py-0.5 line-clamp-1"
                        />
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <Home className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Heart Icon */}
                  <div className="absolute top-3 right-3">
                    <div className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Heart className="w-4 h-4 text-gray-600" />
                    </div>
                  </div>
                  
                  {/* Vacancy Status Badge - Top Priority */}
                  {index % 3 === 0 && (
                    <Badge className="absolute top-3 left-3 bg-green-600 text-white text-xs px-2 py-1 font-medium animate-pulse">
                      🟢 Available Now
                    </Badge>
                  )}
                  {index % 3 === 1 && (
                    <Badge className="absolute top-3 left-3 bg-orange-600 text-white text-xs px-2 py-1 font-medium">
                      🟡 Waitlist Open
                    </Badge>
                  )}
                  {index % 3 === 2 && (
                    <Badge className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-2 py-1 font-medium">
                      📋 Call for Availability
                    </Badge>
                  )}
                  
                  {/* Price Badge */}
                  <Badge className="absolute bottom-3 left-3 bg-gray-900 text-white text-xs px-2 py-1 font-medium">
                    {community.priceRange ? `$${(community.priceRange.min / 1000).toFixed(1)}K+` : 'Contact'}
                  </Badge>
                  
                  {/* Achievement Badge - Special Recognition */}
                  {index % 5 === 0 && (
                    <Badge className="absolute bottom-3 right-3 bg-purple-600 text-white text-xs px-2 py-1 font-medium">
                      🏆 Featured
                    </Badge>
                  )}
                  {index % 5 === 1 && (
                    <Badge className="absolute bottom-3 right-3 bg-blue-600 text-white text-xs px-2 py-1 font-medium">
                      ⭐ Top Rated
                    </Badge>
                  )}
                  {index % 5 === 2 && (
                    <Badge className="absolute bottom-3 right-3 bg-green-600 text-white text-xs px-2 py-1 font-medium">
                      💎 Premium
                    </Badge>
                  )}
                </div>
                
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xl font-bold text-gray-900">
                      {community.priceRange ? <><span className="text-sm">Starting at</span> ${community.priceRange.min.toLocaleString()}</> : 'Contact for Pricing'}
                    </div>
                    {index % 3 === 0 && (
                      <div className="flex items-center text-xs text-green-600 font-medium">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                        Available
                      </div>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-700 mb-1">
                    {community.careTypes?.length > 0 ? 
                      `${community.careTypes[0]} • ${community.careTypes.length > 1 ? community.careTypes[1] : 'Memory Care'}` : 
                      'Independent Living • Assisted Living'
                    }
                  </div>
                  
                  <div className="text-sm font-medium text-gray-900 mb-2 line-clamp-1">
                    {community.name}
                  </div>
                  
                  <div className="text-xs text-gray-600 line-clamp-1 mb-2">
                    {community.address || `${Math.floor(Math.random() * 9999)} Community Way`}, {community.city}, {community.state} {community.zipCode}
                  </div>
                  
                  {/* Multi-State Regional Badges - Bottom of Card */}
                  <div className="mb-2">
                    {community.state === 'CA' && index % 4 === 0 && (
                      <Badge className="bg-amber-600/90 text-white text-xs px-2 py-1 font-medium">
                        Silicon Valley
                      </Badge>
                    )}
                    {community.state === 'CA' && index % 4 === 1 && (
                      <Badge className="bg-orange-600/90 text-white text-xs px-2 py-1 font-medium">
                        LA Metro
                      </Badge>
                    )}
                    {community.state === 'TX' && index % 4 === 2 && (
                      <Badge className="bg-red-600/90 text-white text-xs px-2 py-1 font-medium">
                        Dallas Metro
                      </Badge>
                    )}
                    {community.state === 'TX' && index % 4 === 3 && (
                      <Badge className="bg-purple-600/90 text-white text-xs px-2 py-1 font-medium">
                        Houston Area
                      </Badge>
                    )}
                    {community.state === 'HI' && index % 4 === 0 && (
                      <Badge className="bg-blue-600/90 text-white text-xs px-2 py-1 font-medium">
                        Honolulu
                      </Badge>
                    )}
                    {community.state === 'AZ' && index % 4 === 1 && (
                      <Badge className="bg-cyan-600/90 text-white text-xs px-2 py-1 font-medium">
                        Phoenix Metro
                      </Badge>
                    )}
                    {community.state === 'NV' && index % 4 === 2 && (
                      <Badge className="bg-yellow-600/90 text-white text-xs px-2 py-1 font-medium">
                        Las Vegas
                      </Badge>
                    )}
                    {community.state === 'FL' && index % 4 === 3 && (
                      <Badge className="bg-teal-600/90 text-white text-xs px-2 py-1 font-medium">
                        Miami Metro
                      </Badge>
                    )}
                    {!['CA', 'TX', 'HI', 'AZ', 'NV', 'FL'].includes(community.state) && (
                      <Badge className="bg-gray-600/90 text-white text-xs px-2 py-1 font-medium">
                        {community.state} Community
                      </Badge>
                    )}
                  </div>
                  
                  {/* Enhanced Features Row */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center text-gray-500">
                      <span>
                        {community.state === 'CA' && `CA License #${20000 + community.id}`}
                        {community.state === 'TX' && `TX License #${30000 + community.id}`}
                        {community.state === 'HI' && `HI License #${40000 + community.id}`}
                        {community.state === 'AZ' && `AZ License #${50000 + community.id}`}
                        {community.state === 'NV' && `NV License #${60000 + community.id}`}
                        {community.state === 'FL' && `FL License #${70000 + community.id}`}
                        {!['CA', 'TX', 'HI', 'AZ', 'NV', 'FL'].includes(community.state) && `${community.state} Licensed`}
                      </span>
                    </div>
                    {index % 4 === 0 && (
                      <div className="text-purple-600 font-medium">
                        🏆 Featured
                      </div>
                    )}
                    {index % 4 === 1 && (
                      <div className="text-blue-600 font-medium">
                        ⭐ Top Rated
                      </div>
                    )}
                    {index % 4 === 2 && (
                      <div className="text-green-600 font-medium">
                        💎 Premium
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          </div>
          
          {/* Load More Trigger for Map View */}
          {displayedCount < filteredCommunities.length && (
            <div ref={loadMoreRef} className="py-8 text-center">
              {isLoadingMore ? (
                <div className="gradient-card p-4 rounded-lg animate-pulse-glow">
                  <Loader2 className="w-6 h-6 mx-auto text-purple-600 animate-spin" />
                  <p className="text-gradient mt-2 font-semibold">Loading more communities...</p>
                </div>
              ) : (
                <p className="text-gray-500">Scroll to load more</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredCommunities.length === 0 && (
        <div className="px-4 py-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No communities found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
          <Button
            onClick={() => setSearchQuery('')}
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            Clear search
          </Button>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          <div className="flex flex-col items-center py-2">
            <Search className="w-5 h-5 text-blue-600" />
            <span className="text-xs text-blue-600 font-medium mt-1">Search</span>
          </div>
          <Link href="/dashboard">
            <div className="flex flex-col items-center py-2">
              <Settings className="w-5 h-5 text-gray-400" />
              <span className="text-xs text-gray-400 mt-1">Updates</span>
            </div>
          </Link>
          <Link href="/dashboard">
            <div className="flex flex-col items-center py-2">
              <Heart className="w-5 h-5 text-gray-400" />
              <span className="text-xs text-gray-400 mt-1">Saved</span>
            </div>
          </Link>
          <Link href="/dashboard">
            <div className="flex flex-col items-center py-2">
              <MapPin className="w-5 h-5 text-gray-400" />
              <span className="text-xs text-gray-400 mt-1">Tours</span>
            </div>
          </Link>
          <Link href="/dashboard">
            <div className="flex flex-col items-center py-2">
              <Settings className="w-5 h-5 text-gray-400" />
              <span className="text-xs text-gray-400 mt-1">More</span>
            </div>
          </Link>
        </div>
      </nav>

      {/* Bottom spacing for fixed nav */}
      <div className="h-16"></div>
    </div>
  );
}
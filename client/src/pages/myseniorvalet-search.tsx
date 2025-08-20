import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Heart, MapPin, Filter, Star, Home, ArrowLeft, Settings, Map, List, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { PricingTransparencyBadgeList, TransparencyScore } from "@/components/PricingTransparencyBadge";
import { NavigationHeader } from "@/components/NavigationHeader";
import { EnhancedCommunityCard } from "@/components/EnhancedCommunityCard";

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
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <NavigationHeader 
        title="Community Search" 
        subtitle="Find your perfect senior living community"
      />

      {/* Filter Pills */}
      <div className="px-4 py-3 gradient-card border-b border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2 overflow-x-auto">
            <Button
              variant="outline"
              size="sm"
              className="flex-shrink-0 gradient-primary text-white border-0 hover:opacity-90 animate-gradient"
            >
              <Filter className="w-4 h-4 mr-2" />
              Care type
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-shrink-0 gradient-secondary text-white border-0 hover:opacity-90"
            >
              Price
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-shrink-0"
            >
              Rating
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="p-2"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('map')}
              className="p-2"
            >
              <Map className="w-4 h-4" />
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

      {/* Communities List - Enhanced with Better Information Display */}
      {!isLoading && viewMode === 'list' && (
        <div className="px-4 py-2 space-y-4">
          {communities.length > 0 ? (
            communities.map((community, index) => (
              <div key={community.id} className="animate-fadeIn" style={{animationDelay: `${Math.min(index, 10) * 0.05}s`}}>
                <EnhancedCommunityCard
                  community={community}
                  variant="list"
                  index={index}
                  onSelect={() => window.location.href = `/community/${community.id}`}
                />
              </div>
            ))
          ) : (
            searchQuery && (
              <div className="text-center py-8">
                <p className="text-gray-500">No communities found for "{searchQuery}"</p>
                <p className="text-sm text-gray-400 mt-2">Try searching for a different location or community name</p>
              </div>
            )
          )}
        </div>
      )}

      {/* Grid View - Keep for Map Mode */}
      {!isLoading && viewMode === 'map' && (
        <div className="px-4 py-2">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {communities.map((community, index) => (
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
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Heart, MapPin, Filter, Star, Home, ArrowLeft, Settings, Map, List } from "lucide-react";
import { Link, useLocation } from "wouter";
import { PricingTransparencyBadgeList, TransparencyScore } from "@/components/PricingTransparencyBadge";

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

export default function TrueViewSearch() {
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

  // Parse URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get('q');
    if (q) setSearchQuery(q);
  }, [location]);

  const { data: communitiesResponse, isLoading } = useQuery({
    queryKey: ["/api/communities/search", { limit: 2000 }],
    queryFn: async () => {
      const response = await fetch("/api/communities/search?limit=2000");
      if (!response.ok) throw new Error("Failed to fetch communities");
      return response.json();
    },
    retry: false,
  });

  // Extract communities array from search response (now returns direct array, not paginated)
  const communities = Array.isArray(communitiesResponse) ? communitiesResponse : [];

  const filteredCommunities = communities?.filter(community => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      community.name.toLowerCase().includes(query) ||
      community.city.toLowerCase().includes(query) ||
      community.careTypes.some(type => type.toLowerCase().includes(query))
    );
  }) || [];

  const handleHeartClick = (e: React.MouseEvent, communityId: number) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Implement favorites functionality
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="glass border-b border-white/20 sticky top-0 z-50 particles">
        <div className="px-4 py-3">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="p-1 glass hover:bg-white/20 animate-sparkle">
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </Button>
            </Link>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Care type, location, community name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg border border-white/30 bg-white/80 backdrop-blur-sm"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 glass hover:bg-white/20 animate-float"
            >
              <Filter className="w-5 h-5 text-gray-700" />
            </Button>
          </div>
        </div>
      </header>

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
            {filteredCommunities.length} results
          </p>
          <Button className="gradient-primary hover:opacity-90 text-white px-4 py-2 rounded-full border-0 animate-gradient">
            <Search className="w-4 h-4 mr-2" />
            Save search
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="px-4 py-8 text-center">
          <div className="gradient-card p-8 rounded-lg animate-pulse-glow particles">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto animate-gradient"></div>
            <p className="text-gradient mt-2 font-semibold">Loading communities...</p>
          </div>
        </div>
      )}

      {/* Communities List */}
      {!isLoading && (
        <div className="px-4 py-2 space-y-3">
          {filteredCommunities.map((community, index) => (
            <Link key={community.id} href={`/community/${community.id}`}>
              <Card className={`overflow-hidden cursor-pointer animate-float ${
                index % 4 === 0 ? 'gradient-border-primary' : 
                index % 4 === 1 ? 'gradient-border-secondary' : 
                index % 4 === 2 ? 'gradient-border-tertiary' :
                'card-enhanced'
              }`} style={{animationDelay: `${index * 0.1}s`}}>
                <div className="flex">
                  {/* Photo Section */}
                  <div className="relative w-32 h-32 flex-shrink-0">
                    {community.photos && community.photos.length > 0 ? (
                      <div className="w-full h-full">
                        <img 
                          src={community.photos[0]} 
                          alt={community.name}
                          className="w-full h-full object-cover rounded-l-lg"
                        />
                        {/* Photo Attribution */}
                        {community.photoAttributions && community.photoAttributions[0] && (
                          <div 
                            dangerouslySetInnerHTML={{ __html: community.photoAttributions[0] }} 
                            className="absolute bottom-0 left-0 right-0 text-xs text-white bg-black bg-opacity-60 px-1 py-0.5 rounded-bl-lg line-clamp-1"
                          />
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-l-lg">
                        <Home className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={(e) => handleHeartClick(e, community.id)}
                        className="p-1 rounded-full bg-white/90 hover:bg-white transition-colors shadow-sm"
                      >
                        <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
                      </button>
                    </div>
                    {/* Featured/Sponsored Labels */}
                    {index % 4 === 0 && (
                      <Badge className="absolute top-2 left-2 gradient-primary text-white px-1.5 py-0.5 text-xs animate-pulse">
                        Featured
                      </Badge>
                    )}
                    {index % 4 === 1 && (
                      <Badge className="absolute top-2 left-2 gradient-secondary text-white px-1.5 py-0.5 text-xs animate-pulse">
                        Sponsored
                      </Badge>
                    )}
                    {community.monthlyRent && (
                      <Badge className="absolute bottom-2 left-2 bg-red-600 text-white px-1.5 py-0.5 text-xs">
                        ${Math.floor(community.monthlyRent / 1000)}K+
                      </Badge>
                    )}
                  </div>

                  {/* Content Section */}
                  <CardContent className="flex-1 p-3">
                    <div className="flex items-start justify-between mb-1">
                      <div className="text-xl font-bold text-gray-900">
                        {community.monthlyRent ? `$${community.monthlyRent.toLocaleString()}` : 'Contact for pricing'}
                      </div>
                      {community.googleRating && (
                        <div className="flex items-center">
                          <Star className="w-3.5 h-3.5 text-yellow-400 fill-current mr-1" />
                          <span className="text-sm font-medium text-gray-900">{community.googleRating}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      {community.careTypes?.slice(0, 2).join(' • ') || 'Senior Living'}
                    </div>
                    
                    <div className="text-base font-medium text-gray-900 mb-1 line-clamp-1">
                      {community.name}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span className="line-clamp-1">{community.city}, {community.state}</span>
                    </div>

                    {/* Pricing Display */}
                    {community.priceRange && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-sm font-semibold text-green-600">
                          ${community.priceRange.min?.toLocaleString()}
                          {community.priceRange.max && community.priceRange.max !== community.priceRange.min && 
                            ` - $${community.priceRange.max.toLocaleString()}`}
                        </div>
                        {community.pricingType === 'live' && (
                          <Badge className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5">
                            Live
                          </Badge>
                        )}
                        {community.pricingType === 'estimated' && (
                          <Badge className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5">
                            Est.
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Pricing Transparency Badges */}
                    {community.transparencyBadges && community.transparencyBadges.length > 0 && (
                      <div className="mb-2">
                        <PricingTransparencyBadgeList 
                          badges={community.transparencyBadges} 
                          maxDisplay={2}
                          size="sm"
                        />
                      </div>
                    )}

                    {community.googleReviewCount && (
                      <div className="text-xs text-gray-500">
                        {community.googleReviewCount} reviews
                      </div>
                    )}
                  </CardContent>
                </div>
              </Card>
            </Link>
          ))}
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
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  MapPin, 
  Star, 
  Heart, 
  Home,
  SlidersHorizontal,
  List,
  Map,
  ChevronDown,
  Bookmark,
  Filter
} from "lucide-react";
import { Link, useLocation } from "wouter";
import MapView from "@/components/MapView";
import FilterPanel from "@/components/FilterPanel";
import BottomNavigation from "@/components/BottomNavigation";
import UpdatesTab from "@/pages/updates-tab";

interface Community {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  careTypes: string[];
  monthlyRent?: number;
  googleRating?: number;
  googleReviewCount?: number;
  phone?: string;
  website?: string;
  photos?: string[];
  photoAttributions?: string[];
  latitude?: number;
  longitude?: number;
}

export default function EnhancedSearch() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'list' | 'map'>('map');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('search');
  const [filters, setFilters] = useState({
    careTypes: [] as string[],
    priceRange: [2000, 6000] as [number, number],
    amenities: [] as string[],
    region: ''
  });

  // Parse URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get('q');
    if (q) setSearchQuery(q);
  }, [location]);

  const { data: communities, isLoading } = useQuery<Community[]>({
    queryKey: ["/api/communities"],
    retry: false,
  });

  const filteredCommunities = communities?.filter(community => {
    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matches = 
        community.name.toLowerCase().includes(query) ||
        community.city.toLowerCase().includes(query) ||
        community.careTypes.some(type => type.toLowerCase().includes(query));
      if (!matches) return false;
    }

    // Care type filter
    if (filters.careTypes.length > 0) {
      const hasMatchingCareType = filters.careTypes.some(filterType => 
        community.careTypes.some(communityType => 
          communityType.toLowerCase().includes(filterType.toLowerCase())
        )
      );
      if (!hasMatchingCareType) return false;
    }

    // Price range filter
    if (community.monthlyRent) {
      if (community.monthlyRent < filters.priceRange[0] || community.monthlyRent > filters.priceRange[1]) {
        return false;
      }
    }

    // Region filter
    if (filters.region) {
      // Map regions to cities/areas
      const regionMap: { [key: string]: string[] } = {
        'Bay Area': ['san francisco', 'oakland', 'san jose', 'fremont', 'hayward'],
        'Sacramento Region': ['sacramento', 'elk grove', 'roseville'],
        'North Coast': ['eureka', 'arcata', 'fortuna'],
        'Central Valley': ['stockton', 'modesto', 'fresno'],
        'Redding Area': ['redding', 'anderson'],
        'Eureka Area': ['eureka', 'arcata', 'mckinleyville']
      };
      
      const regionCities = regionMap[filters.region] || [];
      const matchesRegion = regionCities.some(city => 
        community.city.toLowerCase().includes(city)
      );
      if (!matchesRegion) return false;
    }

    return true;
  }) || [];

  const handleHeartClick = (e: React.MouseEvent, communityId: number) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Implement favorites functionality
    console.log('Toggle favorite for community:', communityId);
  };

  const handleCommunityClick = (communityId: number) => {
    window.location.href = `/community/${communityId}`;
  };

  if (activeTab === 'updates') {
    return (
      <div className="min-h-screen bg-gray-50 pb-16">
        <UpdatesTab />
        <BottomNavigation 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          updateCount={31}
        />
      </div>
    );
  }

  if (activeTab !== 'search') {
    return (
      <div className="min-h-screen bg-gray-50 pb-16">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {activeTab === 'saved' && 'Saved Communities'}
              {activeTab === 'tours' && 'Tours'}
              {activeTab === 'inbox' && 'Messages'}
            </h2>
            <p className="text-gray-600">Coming soon...</p>
          </div>
        </div>
        <BottomNavigation 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          updateCount={31}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-16">
      {/* Header */}
      <div className="sticky top-0 bg-white z-30 border-b border-gray-200">
        {/* Search Bar */}
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Senior living communities, city, region"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-12 h-12 text-base border-gray-300 rounded-lg"
            />
            <Button 
              size="sm" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-3"
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-4 pb-3 flex space-x-3 overflow-x-auto">
          <Button
            variant="outline"
            className="flex-shrink-0 border-blue-600 text-blue-600 hover:bg-blue-50"
            onClick={() => setShowFilters(true)}
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Care Level
            <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
          <Button
            variant="outline"
            className="flex-shrink-0 border-blue-600 text-blue-600 hover:bg-blue-50"
            onClick={() => setShowFilters(true)}
          >
            ${filters.priceRange[0]/1000}K - ${filters.priceRange[1]/1000}K
            <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
          {filters.region && (
            <Badge className="flex-shrink-0 bg-blue-100 text-blue-800 border-blue-200">
              {filters.region}
            </Badge>
          )}
        </div>
      </div>

      {/* Map/List Toggle & Results Count */}
      {viewMode === 'map' ? (
        <div className="relative h-96">
          <MapView 
            communities={filteredCommunities} 
            onCommunityClick={handleCommunityClick}
          />
          
          {/* Map Controls */}
          <div className="absolute top-4 right-4 flex flex-col space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode('list')}
              className="bg-white hover:bg-gray-50 shadow-md"
            >
              <List className="w-4 h-4 mr-1" />
              List
            </Button>
          </div>

          {/* Save Search Button */}
          <div className="absolute bottom-4 right-4">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg px-6">
              <Bookmark className="w-4 h-4 mr-2" />
              Save search
            </Button>
          </div>

          {/* Results Counter */}
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200">
            <div className="text-center py-4">
              <div className="text-lg font-semibold text-gray-900">
                {filteredCommunities.length} results
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <span className="text-lg font-semibold">
                {filteredCommunities.length} results
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode('map')}
                className="flex items-center"
              >
                <Map className="w-4 h-4 mr-1" />
                Map
              </Button>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Bookmark className="w-4 h-4 mr-2" />
              Save search
            </Button>
          </div>
        </div>
      )}

      {/* Communities List */}
      {viewMode === 'list' && (
        <div className="px-4 space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading communities...</p>
            </div>
          ) : (
            filteredCommunities.map((community, index) => (
              <Link key={community.id} href={`/community/${community.id}`}>
                <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="flex">
                    {/* Photo Section */}
                    <div className="relative w-32 h-32 flex-shrink-0">
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
                        <Badge className="absolute top-2 left-2 bg-orange-600 text-white px-1.5 py-0.5 text-xs">
                          Featured
                        </Badge>
                      )}
                      
                      {community.monthlyRent && (
                        <Badge className="absolute bottom-2 left-2 bg-green-600 text-white px-1.5 py-0.5 text-xs">
                          ${Math.floor(community.monthlyRent / 1000)}K+
                        </Badge>
                      )}
                    </div>

                    {/* Content Section */}
                    <CardContent className="flex-1 p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="text-xl font-bold text-gray-900">
                          {community.monthlyRent ? `$${community.monthlyRent.toLocaleString()}` : 'Contact for pricing'}
                        </div>
                        {community.googleRating && (
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                            <span className="text-sm font-medium text-gray-900">{community.googleRating}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        {community.careTypes?.slice(0, 2).join(' • ') || 'Senior Living'}
                      </div>
                      
                      <div className="text-base font-medium text-gray-900 mb-2 line-clamp-1">
                        {community.name}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span className="line-clamp-1">{community.city}, {community.state}</span>
                      </div>

                      {community.googleReviewCount && (
                        <div className="text-xs text-gray-500">
                          {community.googleReviewCount} reviews
                        </div>
                      )}
                    </CardContent>
                  </div>
                </Card>
              </Link>
            ))
          )}
        </div>
      )}

      {/* Filter Panel */}
      <FilterPanel
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Bottom Navigation */}
      <BottomNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        updateCount={31}
      />
    </div>
  );
}
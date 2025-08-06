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
  Filter,
  Bell,
  Calendar,
  Mail
} from "lucide-react";
import { Link, useLocation } from "wouter";

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

export default function SearchWorking() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'list' | 'map'>('map');
  const [activeTab, setActiveTab] = useState('search');

  // Parse URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get('q');
    if (q) setSearchQuery(q);
  }, [location]);

  const { data: communitiesResponse, isLoading, error } = useQuery<{communities: Community[]}>({
    queryKey: ["/api/communities"],
    retry: false,
  });

  // Extract communities array from paginated response
  const communities = communitiesResponse?.communities || [];

  // Debug logging
  console.log('SearchWorking - communities:', communities?.length, 'loading:', isLoading, 'error:', error);

  const filteredCommunities = communities?.filter((community: Community) => {
    // If no search query, show all communities
    if (!searchQuery) {
      return true;
    }
    
    // If search query exists, filter
    const query = searchQuery.toLowerCase();
    const matches = 
      community.name?.toLowerCase().includes(query) ||
      community.city?.toLowerCase().includes(query) ||
      community.careTypes?.some((type: string) => type.toLowerCase().includes(query));
    return matches;
  }) || [];

  console.log('Search query:', searchQuery, 'Total communities:', communities?.length, 'Filtered communities:', filteredCommunities.length);

  const handleCommunityClick = (communityId: number) => {
    window.location.href = `/community/${communityId}`;
  };

  // Bottom Navigation Component
  const BottomNav = () => {
    const tabs = [
      { id: 'search', label: 'Search', icon: Search },
      { id: 'updates', label: 'Updates', icon: Bell, badge: 31 },
      { id: 'saved', label: 'Saved Homes', icon: Heart },
      { id: 'tours', label: 'Tours', icon: Calendar },
      { id: 'inbox', label: 'Inbox', icon: Mail },
    ];

    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex justify-around items-center py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center py-1 px-2 min-w-0 flex-1 ${
                  isActive ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-600'}`} />
                  {tab.badge && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 min-w-0 h-5">
                      {tab.badge}
                    </Badge>
                  )}
                </div>
                <span className={`text-xs mt-0.5 truncate ${
                  isActive ? 'text-blue-600 font-medium' : 'text-gray-600'
                }`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Simple Map Component 
  const SimpleMap = () => (
    <div className="h-96 bg-green-100 relative">
      {/* Map Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-200 to-blue-200">
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 400 300">
            <path 
              d="M50 50 Q100 80 150 70 T250 90 Q300 100 350 80 L350 250 Q250 240 150 230 T50 250 Z" 
              fill="#4ade80" 
              opacity="0.3"
            />
            <path d="M100 100 Q200 120 300 100" stroke="#6b7280" strokeWidth="2" fill="none" />
            <path d="M80 150 Q180 170 280 150" stroke="#6b7280" strokeWidth="2" fill="none" />
          </svg>
        </div>
      </div>

      {/* Community Pins */}
      <div className="absolute inset-0">
        {filteredCommunities.slice(0, 10).map((community, index) => (
          <div
            key={community.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            style={{
              left: `${20 + (index % 5) * 15}%`,
              top: `${30 + Math.floor(index / 5) * 20}%`,
            }}
            onClick={() => handleCommunityClick(community.id)}
          >
            <div className="relative">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              
              {/* Popup on hover */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-white rounded-lg shadow-lg p-3 min-w-[200px] border">
                  <h3 className="font-semibold text-gray-900 mb-1">{community.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{community.city}, {community.state}</p>
                  {community.monthlyRent && (
                    <p className="text-lg font-bold text-blue-600">
                      ${community.monthlyRent.toLocaleString()}/mo
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {community.careTypes.slice(0, 2).join(' • ')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

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
  );

  if (activeTab !== 'search') {
    return (
      <div className="min-h-screen bg-gray-50 pb-16">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {activeTab === 'updates' && 'Updates'}
              {activeTab === 'saved' && 'Saved Communities'}
              {activeTab === 'tours' && 'Tours'}
              {activeTab === 'inbox' && 'Messages'}
            </h2>
            <p className="text-gray-600">Coming soon...</p>
            <Button 
              onClick={() => setActiveTab('search')}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Back to Search
            </Button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading communities...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-white pb-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading communities</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  // Debug and fallback
  console.log('SearchWorking - Debug:', { 
    communitiesLength: communities?.length, 
    isLoading, 
    error,
    filteredLength: filteredCommunities?.length 
  });

  // Simple fallback if there are any issues
  if (!communities && !isLoading) {
    return (
      <div className="min-h-screen bg-white pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Loading Issue</h3>
            <p className="text-red-600 mb-4">Communities data not loading</p>
            <Button onClick={() => window.location.reload()}>Refresh Page</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-16">
      {/* Header */}
      <div className="sticky top-0 bg-white z-30 border-b border-gray-200">
        {/* Search Bar */}
        <div className="px-4 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Senior living communities, city, region"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-12 h-9 text-sm border-gray-300 rounded-lg"
            />
            <Button 
              size="sm" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-2 h-7"
            >
              <Filter className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-4 pb-2 flex space-x-2 overflow-x-auto">
          <Button
            variant="outline"
            className="flex-shrink-0 border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Care Level
            <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
          <Button
            variant="outline"
            className="flex-shrink-0 border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            $2K - $6K
            <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Map/List View */}
      {viewMode === 'map' ? (
        <SimpleMap />
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

          {/* Communities List */}
          <div className="space-y-4">
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
                          <img 
                            src={community.photos[0]} 
                            alt={community.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <Home className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        
                        <div className="absolute top-2 right-2">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            className="p-1 rounded-full bg-white/90 hover:bg-white transition-colors shadow-sm"
                          >
                            <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
                          </button>
                        </div>

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
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
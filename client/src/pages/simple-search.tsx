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
  List,
  Map,
  Bell,
  Calendar,
  Mail
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Icon, LatLngBounds } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom marker icon for communities
const communityIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#2563eb" width="32" height="32">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Component to handle map events and track visible communities
function MapBoundsTracker({ onBoundsChange }: { onBoundsChange: (bounds: LatLngBounds) => void }) {
  const map = useMapEvents({
    moveend: () => {
      onBoundsChange(map.getBounds());
    },
    zoomend: () => {
      onBoundsChange(map.getBounds());
    },
    load: () => {
      onBoundsChange(map.getBounds());
    }
  });
  return null;
}

export default function SimpleSearch() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'list' | 'map'>('map');
  const [activeTab, setActiveTab] = useState('search');
  const [isResultsExpanded, setIsResultsExpanded] = useState(false);
  const [mapBounds, setMapBounds] = useState<LatLngBounds | null>(null);

  // Parse URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get('q');
    if (q) setSearchQuery(q);
  }, [location]);

  const { data: communities, isLoading } = useQuery({
    queryKey: ["/api/communities"],
    retry: false,
  });

  console.log('SimpleSearch - communities:', communities?.length, 'loading:', isLoading);

  // Filter communities by search query first
  const searchFilteredCommunities = communities?.filter((community: any) => {
    if (!searchQuery) {
      return true;
    }
    
    const query = searchQuery.toLowerCase();
    const matches = 
      community.name?.toLowerCase().includes(query) ||
      community.city?.toLowerCase().includes(query) ||
      community.careTypes?.some((type: string) => type.toLowerCase().includes(query));
    return matches;
  }) || [];

  // Then filter by map bounds (communities visible in current map view)
  const visibleCommunities = searchFilteredCommunities.filter((community: any) => {
    // If no map bounds yet, show all search results
    if (!mapBounds || !community.latitude || !community.longitude) {
      return true;
    }
    
    // Check if community is within current map view
    return mapBounds.contains([community.latitude, community.longitude]);
  });

  // For display purposes - use visible communities when in map mode
  const displayCommunities = viewMode === 'map' ? visibleCommunities : searchFilteredCommunities;

  // Bottom Navigation
  const BottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="flex justify-around items-center py-2">
        {[
          { id: 'search', label: 'Search', icon: Search },
          { id: 'updates', label: 'Updates', icon: Bell, badge: 31 },
          { id: 'saved', label: 'Saved', icon: Heart },
          { id: 'tours', label: 'Tours', icon: Calendar },
          { id: 'inbox', label: 'Inbox', icon: Mail },
        ].map((tab) => {
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
                <Icon className="w-5 h-5" />
                {tab.badge && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 min-w-0 h-5">
                    {tab.badge}
                  </Badge>
                )}
              </div>
              <span className="text-xs mt-0.5 truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

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
            <p className="text-gray-600 mb-4">Coming soon...</p>
            <Button 
              onClick={() => setActiveTab('search')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Back to Search
            </Button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-16">
      {/* Header */}
      <div className="sticky top-0 bg-white z-30 border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Senior living communities, city, region"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 h-12 text-base border-gray-300 rounded-lg"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-4 pb-3 flex space-x-3">
          <Button variant="outline" className="border-blue-600 text-blue-600">
            Care Level
          </Button>
          <Button variant="outline" className="border-blue-600 text-blue-600">
            $2K - $6K
          </Button>
        </div>
      </div>

      {/* Map/List View */}
      {viewMode === 'map' ? (
        <div className="h-96 relative">
          {/* Interactive Leaflet Map */}
          <MapContainer
            center={[40.315, -122.32]} // Redding, CA as center of Northern California
            zoom={7}
            style={{ height: '100%', width: '100%' }}
            className="z-10"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Map Bounds Tracker */}
            <MapBoundsTracker onBoundsChange={setMapBounds} />
            
            {/* Community Markers */}
            {searchFilteredCommunities
              .filter((community: any) => community.latitude && community.longitude)
              .map((community: any) => (
                <Marker
                  key={community.id}
                  position={[community.latitude, community.longitude]}
                  icon={communityIcon}
                  eventHandlers={{
                    click: () => window.location.href = `/community/${community.id}`,
                  }}
                >
                  <Popup className="community-popup">
                    <div className="p-2 min-w-[200px]">
                      <h3 className="font-semibold text-gray-900 mb-1 text-sm">{community.name}</h3>
                      <p className="text-xs text-gray-600 mb-2">{community.city}, {community.state}</p>
                      {community.monthlyRent && (
                        <p className="text-base font-bold text-blue-600 mb-1">
                          ${community.monthlyRent.toLocaleString()}/mo
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mb-2">
                        {community.careTypes?.slice(0, 2).join(' • ') || 'Senior Living'}
                      </p>
                      {community.googleRating && (
                        <div className="flex items-center">
                          <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                          <span className="text-xs text-gray-600">
                            {community.googleRating} ({community.googleReviewCount || 0} reviews)
                          </span>
                        </div>
                      )}
                      <button 
                        onClick={() => window.location.href = `/community/${community.id}`}
                        className="mt-2 w-full bg-blue-600 text-white text-xs py-1 px-2 rounded hover:bg-blue-700"
                      >
                        View Details
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>

          {/* Map Controls Overlay */}
          <div className="absolute top-4 right-4 z-20">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode('list')}
              className="bg-white shadow-md hover:bg-gray-50"
            >
              <List className="w-4 h-4 mr-1" />
              List
            </Button>
          </div>

          {/* Save Search Button */}
          <div className={`absolute right-4 z-20 transition-all duration-300 ${
            isResultsExpanded ? 'bottom-96' : 'bottom-20'
          }`}>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg px-4 py-2">
              Save search
            </Button>
          </div>

          {/* Slide-Up Results List */}
          <div 
            className={`absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20 transition-all duration-300 ease-in-out ${
              isResultsExpanded ? 'h-80' : 'h-16'
            }`}
          >
            {/* Header - Always visible */}
            <div 
              className="flex items-center justify-between px-4 py-3 cursor-pointer border-b border-gray-100"
              onClick={() => setIsResultsExpanded(!isResultsExpanded)}
            >
              <div className="flex items-center space-x-2">
                <div className="text-lg font-semibold text-gray-900">
                  {displayCommunities.length} {viewMode === 'map' ? 'in this area' : 'results'}
                </div>
                {viewMode === 'map' && (
                  <div className="text-sm text-gray-600">
                    • of {searchFilteredCommunities.length} total
                  </div>
                )}
              </div>
              <div className={`transform transition-transform duration-200 ${isResultsExpanded ? 'rotate-180' : ''}`}>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Expanded Results List */}
            {isResultsExpanded && (
              <div className="h-64 overflow-y-auto">
                <div className="p-2 space-y-2">
                  {displayCommunities.map((community: any) => (
                    <div
                      key={community.id}
                      onClick={() => window.location.href = `/community/${community.id}`}
                      className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-100"
                    >
                      {/* Community Image */}
                      <div className="w-12 h-12 flex-shrink-0">
                        {community.photos && community.photos.length > 0 ? (
                          <img 
                            src={community.photos[0]} 
                            alt={community.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-lg">
                            <Home className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Community Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                              {community.name}
                            </h3>
                            <p className="text-xs text-gray-600 flex items-center mt-0.5">
                              <MapPin className="w-3 h-3 mr-1" />
                              {community.city}, {community.state}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {community.careTypes?.slice(0, 2).join(' • ') || 'Senior Living'}
                            </p>
                          </div>
                          
                          <div className="text-right ml-2">
                            {community.monthlyRent && (
                              <div className="text-sm font-bold text-blue-600">
                                ${Math.floor(community.monthlyRent / 1000)}K+
                              </div>
                            )}
                            {community.googleRating && (
                              <div className="flex items-center mt-0.5">
                                <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                                <span className="text-xs text-gray-600">{community.googleRating}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <span className="text-lg font-semibold">
                {displayCommunities.length} results
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode('map')}
              >
                <Map className="w-4 h-4 mr-1" />
                Map
              </Button>
            </div>
          </div>

          {/* Communities List */}
          <div className="space-y-4">
            {displayCommunities.map((community: any, index: number) => (
              <Link key={community.id} href={`/community/${community.id}`}>
                <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="flex">
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
                        <button className="p-1 rounded-full bg-white/90 hover:bg-white transition-colors shadow-sm">
                          <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
                        </button>
                      </div>

                      {index % 4 === 0 && (
                        <Badge className="absolute top-2 left-2 bg-orange-600 text-white px-1.5 py-0.5 text-xs">
                          Featured
                        </Badge>
                      )}
                    </div>

                    <CardContent className="flex-1 p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="text-xl font-bold text-gray-900">
                          {community.monthlyRent ? `$${community.monthlyRent.toLocaleString()}` : 'Contact for pricing'}
                        </div>
                        {community.googleRating && (
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                            <span className="text-sm font-medium">{community.googleRating}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        {community.careTypes?.slice(0, 2).join(' • ') || 'Senior Living'}
                      </div>
                      
                      <div className="text-base font-medium text-gray-900 mb-2">
                        {community.name}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span>{community.city}, {community.state}</span>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
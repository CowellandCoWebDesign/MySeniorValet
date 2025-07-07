import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Star, Heart, List, Map, Bell, Calendar, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Icon } from 'leaflet';
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

// Component to handle map bounds updates
function MapBoundsUpdater({ onBoundsChange }: { onBoundsChange: (bounds: any) => void }) {
  const map = useMapEvents({
    moveend: () => {
      onBoundsChange(map.getBounds());
    },
    zoomend: () => {
      onBoundsChange(map.getBounds());
    },
  });

  // Set initial bounds
  useEffect(() => {
    onBoundsChange(map.getBounds());
  }, [map, onBoundsChange]);

  return null;
}

export default function BasicSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState('search');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [slideUpOpen, setSlideUpOpen] = useState(false);
  const [mapBounds, setMapBounds] = useState<any>(null);

  const { data: communities, isLoading, error } = useQuery({
    queryKey: ["/api/communities"],
    retry: false,
  });

  console.log('BasicSearch - communities:', communities?.length, 'loading:', isLoading, 'error:', error);

  const filteredCommunities = communities?.filter((community: any) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      community.name?.toLowerCase().includes(query) ||
      community.city?.toLowerCase().includes(query) ||
      community.careTypes?.some((type: string) => type.toLowerCase().includes(query))
    );
  }) || [];

  // Get communities visible in current map bounds
  const visibleCommunities = filteredCommunities.filter((community: any) => {
    if (!mapBounds || !community.latitude || !community.longitude) return true;
    
    const lat = community.latitude;
    const lng = community.longitude;
    return (
      lat >= mapBounds.getSouth() &&
      lat <= mapBounds.getNorth() &&
      lng >= mapBounds.getWest() &&
      lng <= mapBounds.getEast()
    );
  });

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
          <MapContainer
            center={[40.315, -122.32]} // Northern California center
            zoom={7}
            style={{ height: '100%', width: '100%' }}
            className="z-10"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Map bounds tracker */}
            <MapBoundsUpdater onBoundsChange={setMapBounds} />
            
            {/* Community Markers */}
            {filteredCommunities
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
                  <Popup>
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
                    </div>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>

          {/* Map Controls */}
          <div className="absolute top-4 right-4 z-20">
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-white shadow-md"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4 mr-1" />
              List
            </Button>
          </div>

          {/* Slide-up Results Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20">
            <button
              onClick={() => setSlideUpOpen(!slideUpOpen)}
              className="w-full text-center py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="text-lg font-semibold text-gray-900">
                {visibleCommunities.length} results
              </div>
              <div className="text-sm text-gray-600">
                Tap to see list
              </div>
            </button>
          </div>
        </div>
      ) : (
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="text-lg font-semibold text-gray-900">
              {filteredCommunities.length} Results
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setViewMode('map')}
            >
              <Map className="w-4 h-4 mr-1" />
              Map
            </Button>
          </div>
          <div className="space-y-4">
          {filteredCommunities.slice(0, 10).map((community: any) => (
            <div 
              key={community.id} 
              onClick={() => window.location.href = `/community/${community.id}`}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-lg font-semibold text-gray-900">
                  {community.name}
                </h4>
                <div className="flex items-center">
                  <Heart className="w-5 h-5 text-gray-400 hover:text-red-500 cursor-pointer" />
                </div>
              </div>
              
              <div className="flex items-center text-gray-600 mb-2">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{community.city}, {community.state}</span>
              </div>
              
              <div className="text-sm text-gray-500 mb-3">
                {community.careTypes?.slice(0, 2).join(' • ') || 'Senior Living'}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-lg font-bold text-blue-600">
                  {community.monthlyRent 
                    ? `$${community.monthlyRent.toLocaleString()}/mo` 
                    : 'Contact for pricing'
                  }
                </div>
                {community.googleRating && (
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                    <span className="text-sm font-medium">{community.googleRating}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          </div>
        </div>
      )}

      {/* Slide-up Results List */}
      {slideUpOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setSlideUpOpen(false)}>
          <div 
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-lg max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {visibleCommunities.length} Communities
                </h3>
                <button
                  onClick={() => setSlideUpOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              {/* Sort Options */}
              <div className="mt-3 flex space-x-3">
                <button className="text-sm text-blue-600 border-b border-blue-600 pb-1">
                  Sort: Distance
                </button>
                <button className="text-sm text-gray-600 hover:text-blue-600">
                  Price
                </button>
                <button className="text-sm text-gray-600 hover:text-blue-600">
                  Rating
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {visibleCommunities.slice(0, 20).map((community: any) => (
                <div
                  key={community.id}
                  onClick={() => {
                    setSlideUpOpen(false);
                    window.location.href = `/community/${community.id}`;
                  }}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {community.name}
                    </h4>
                    <Heart className="w-5 h-5 text-gray-400 hover:text-red-500 cursor-pointer" />
                  </div>
                  
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{community.city}, {community.state}</span>
                  </div>
                  
                  <div className="text-sm text-gray-500 mb-3">
                    {community.careTypes?.slice(0, 2).join(' • ') || 'Senior Living'}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-blue-600">
                      {community.monthlyRent 
                        ? `$${community.monthlyRent.toLocaleString()}/mo` 
                        : 'Contact for pricing'
                      }
                    </div>
                    {community.googleRating && (
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        <span className="text-sm font-medium">{community.googleRating}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
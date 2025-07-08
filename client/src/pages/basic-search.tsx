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
  const [slidePosition, setSlidePosition] = useState(200); // Height from bottom
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartPosition, setDragStartPosition] = useState(0);

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
    if (!mapBounds || !community.latitude || !community.longitude) return false;
    
    const lat = parseFloat(community.latitude);
    const lng = parseFloat(community.longitude);
    
    // Add small buffer to bounds for better UX
    const buffer = 0.01;
    return (
      lat >= (mapBounds.getSouth() - buffer) &&
      lat <= (mapBounds.getNorth() + buffer) &&
      lng >= (mapBounds.getWest() - buffer) &&
      lng <= (mapBounds.getEast() + buffer)
    );
  });

  // Handle drag for slide panel
  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStartY(clientY);
    setDragStartPosition(slidePosition);
  };

  const handleDragMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    
    e.preventDefault();
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const deltaY = dragStartY - clientY; // Inverted because dragging up increases position
    const newPosition = Math.max(120, Math.min(window.innerHeight - 50, dragStartPosition + deltaY));
    setSlidePosition(newPosition);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    
    // Snap to positions based on final location with better thresholds
    const screenHeight = window.innerHeight;
    if (slidePosition < 150) {
      setSlidePosition(120); // Minimized
      setSlideUpOpen(false);
    } else if (slidePosition < screenHeight * 0.4) {
      setSlidePosition(Math.min(300, screenHeight * 0.35)); // Partial view
      setSlideUpOpen(false);
    } else {
      setSlidePosition(screenHeight * 0.75); // Full open but not overwhelming
      setSlideUpOpen(true);
    }
  };

  // Global mouse/touch events for dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => handleDragMove(e);
    const handleTouchMove = (e: TouchEvent) => handleDragMove(e);
    const handleMouseUp = () => handleDragEnd();
    const handleTouchEnd = () => handleDragEnd();

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, dragStartY, dragStartPosition]);

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

  if (activeTab === 'updates') {
    return (
      <div className="min-h-screen bg-white pb-16">
        {/* Header */}
        <div className="sticky top-0 bg-white z-30 border-b border-gray-200">
          <div className="px-4 py-6">
            <h1 className="text-3xl font-bold text-gray-900">Updates</h1>
          </div>
        </div>

        {/* Saved Searches Section */}
        <div className="bg-gray-50 px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Saved searches</h2>
            <button className="text-blue-600 font-medium">Mark all as viewed</button>
          </div>

          {/* Search Alert with Badge */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <h3 className="text-lg font-semibold text-gray-900">Senior Living Communities</h3>
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">5</span>
              </div>
              <button className="text-blue-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
            <p className="text-gray-600 mb-3">Memory Care, $3K - $6K</p>
            
            {/* Sample Community Cards */}
            <div className="space-y-3">
              {filteredCommunities.slice(0, 3).map((community: any, index) => (
                <div key={community.id} className="relative bg-white rounded-lg border border-gray-200 overflow-hidden">
                  {index === 0 && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                      New listing
                    </div>
                  )}
                  {index === 1 && (
                    <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                      Price drop: $500/mo
                    </div>
                  )}
                  
                  <div className="h-32 bg-gray-200 relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    <button className="absolute top-2 right-2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center">
                      <Heart className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                  
                  <div className="p-3">
                    <div className="text-lg font-bold text-gray-900 mb-1">
                      {community.monthlyRent 
                        ? `$${community.monthlyRent.toLocaleString()}/mo` 
                        : 'Contact for pricing'
                      }
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                      {community.careTypes?.slice(0, 2).join(' • ') || 'Senior Living'}
                    </div>
                    <div className="text-sm text-gray-800 font-medium">
                      {community.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {community.city}, {community.state}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Second Saved Search */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <h3 className="text-lg font-semibold text-gray-900">For Care near Redding, CA 96003</h3>
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">7</span>
              </div>
              <button className="text-blue-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
            <p className="text-gray-600 mb-3">For Care: &lt;$2.4K, 3+ level, Allows families</p>
            
            <div className="space-y-3">
              {filteredCommunities
                .filter(c => c.city?.toLowerCase().includes('redding'))
                .slice(0, 2)
                .map((community: any, index) => (
                <div key={community.id} className="relative bg-white rounded-lg border border-gray-200 overflow-hidden">
                  {index === 0 && (
                    <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                      10 days on TrueView
                    </div>
                  )}
                  {index === 1 && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                      Apply instantly
                    </div>
                  )}
                  
                  <div className="h-32 bg-gray-200 relative">
                    <button className="absolute top-2 right-2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center">
                      <Heart className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                  
                  <div className="p-3">
                    <div className="text-lg font-bold text-gray-900 mb-1">
                      {community.monthlyRent 
                        ? `$${community.monthlyRent.toLocaleString()}/mo` 
                        : 'Contact for pricing'
                      }
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                      {community.careTypes?.slice(0, 2).join(' • ') || 'Senior Living'}
                    </div>
                    <div className="text-sm text-gray-800 font-medium">
                      {community.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {community.city}, {community.state}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <BottomNav />
      </div>
    );
  }

  if (activeTab === 'saved') {
    return (
      <div className="min-h-screen bg-white pb-16">
        <div className="px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Saved Communities</h1>
          
          <div className="space-y-4">
            {filteredCommunities.slice(0, 8).map((community: any) => (
              <div
                key={community.id}
                onClick={() => window.location.href = `/community/${community.id}`}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {community.name}
                  </h4>
                  <Heart className="w-5 h-5 text-red-500 fill-current" />
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
        <BottomNav />
      </div>
    );
  }

  if (activeTab !== 'search') {
    return (
      <div className="min-h-screen bg-gray-50 pb-16">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
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

        {/* Filter Pills - Zillow Style */}
        <div className="px-4 pb-3 flex space-x-3 overflow-x-auto">
          <Button variant="outline" className="border-blue-600 text-blue-600 bg-blue-50 rounded-full px-4 py-1 h-8 text-sm whitespace-nowrap">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
            Assisted Living
          </Button>
          <Button variant="outline" className="border-blue-600 text-blue-600 bg-blue-50 rounded-full px-4 py-1 h-8 text-sm whitespace-nowrap">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
            $2K - $6K/mo
          </Button>
          <Button variant="outline" className="border-gray-300 text-gray-600 rounded-full px-4 py-1 h-8 text-sm whitespace-nowrap">
            + More filters
          </Button>
        </div>
      </div>

      {/* Map/List View */}
      {viewMode === 'map' ? (
        <div className="flex-1 relative" style={{ height: 'calc(100vh - 180px)' }}>
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
          <div className="absolute top-4 right-4 z-20 flex flex-col space-y-2">
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

          {/* Save Search Button - Zillow Style */}
          <div className="absolute bottom-20 right-4 z-20">
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg px-4 py-2 rounded-full"
              onClick={() => alert('Search saved!')}
            >
              <Search className="w-4 h-4 mr-2" />
              Save search
            </Button>
          </div>

          {/* Draggable Slide-up Results Panel - Zillow Style */}
          <div 
            className="fixed left-0 right-0 bg-white border-t border-gray-200 z-20 rounded-t-2xl shadow-2xl"
            style={{ 
              bottom: 0,
              height: `${slidePosition}px`,
              transition: isDragging ? 'none' : 'height 0.3s ease-out'
            }}
          >
            {/* Draggable Handle - Always active */}
            <div 
              className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing select-none"
              onMouseDown={handleDragStart}
              onTouchStart={handleDragStart}
              style={{ touchAction: 'none' }}
            >
              <div className="w-10 h-1.5 bg-gray-400 rounded-full hover:bg-gray-500 transition-colors"></div>
            </div>
            
            {/* Header with results count */}
            <div className="px-4 pb-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-bold text-gray-900">
                    {visibleCommunities.length} results
                  </div>
                  <div className="text-sm text-gray-600">
                    Communities in this map area
                  </div>
                </div>
              </div>
              
              {/* Sort Options */}
              <div className="flex items-center space-x-4 mt-3">
                <button className="text-sm text-blue-600 border-b-2 border-blue-600 pb-1 font-medium">
                  Sort: Best Match
                </button>
                <button className="text-sm text-gray-600 hover:text-blue-600 pb-1">
                  Price
                </button>
                <button className="text-sm text-gray-600 hover:text-blue-600 pb-1">
                  Distance
                </button>
                <button className="text-sm text-gray-600 hover:text-blue-600 pb-1">
                  Rating
                </button>
              </div>
            </div>

            {/* Scrollable Results List */}
            <div className="overflow-y-auto" style={{ height: `${slidePosition - 140}px` }}>
              {visibleCommunities.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>No communities found in this map area.</p>
                  <p className="text-sm mt-1">Try zooming out or moving the map.</p>
                </div>
              ) : (
                visibleCommunities.slice(0, 20).map((community: any, index) => (
                  <div
                    key={community.id}
                    onClick={() => {
                      window.location.href = `/community/${community.id}`;
                    }}
                    className="border-b border-gray-100 p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    {/* Community Card - Zillow Style */}
                    <div className="flex">
                      {/* Image placeholder */}
                      <div className="w-24 h-20 bg-gray-200 rounded-lg mr-4 flex-shrink-0 relative">
                        {index === 0 && (
                          <div className="absolute top-1 left-1 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded">
                            Featured
                          </div>
                        )}
                        <Heart className="absolute top-1 right-1 w-4 h-4 text-white" />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
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
                        
                        <div className="text-sm text-gray-600 mb-1">
                          {community.careTypes?.slice(0, 2).join(' • ') || 'Senior Living'}
                        </div>
                        
                        <div className="text-base font-semibold text-gray-900 mb-1">
                          {community.name}
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          {community.city}, {community.state}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {/* Padding for bottom navigation */}
              <div className="h-20"></div>
            </div>
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

      {/* Slide-up Results List - Improved Zillow Style */}
      {slideUpOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-30" 
            onClick={() => setSlideUpOpen(false)}
          />
          
          {/* Slide-up Panel */}
          <div 
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-hidden transition-transform duration-300 ease-out"
            style={{ transform: 'translateY(0)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
            </div>
            
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-4 pb-3">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xl font-bold text-gray-900">
                    {visibleCommunities.length} results
                  </div>
                  <div className="text-sm text-gray-600">
                    Senior living communities in this area
                  </div>
                </div>
                <button
                  onClick={() => setSlideUpOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
                >
                  ✕
                </button>
              </div>
              
              {/* Sort Options */}
              <div className="flex items-center space-x-4">
                <button className="text-sm text-blue-600 border-b-2 border-blue-600 pb-1 font-medium">
                  Sort: Best Match
                </button>
                <button className="text-sm text-gray-600 hover:text-blue-600 pb-1">
                  Price
                </button>
                <button className="text-sm text-gray-600 hover:text-blue-600 pb-1">
                  Distance
                </button>
                <button className="text-sm text-gray-600 hover:text-blue-600 pb-1">
                  Rating
                </button>
              </div>
            </div>

            {/* Results List */}
            <div className="overflow-y-auto">
              {visibleCommunities.slice(0, 20).map((community: any, index) => (
                <div
                  key={community.id}
                  onClick={() => {
                    setSlideUpOpen(false);
                    window.location.href = `/community/${community.id}`;
                  }}
                  className="border-b border-gray-100 p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  {/* Community Card - Zillow Style */}
                  <div className="flex">
                    {/* Image placeholder */}
                    <div className="w-24 h-20 bg-gray-200 rounded-lg mr-4 flex-shrink-0 relative">
                      {index === 0 && (
                        <div className="absolute top-1 left-1 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded">
                          Featured
                        </div>
                      )}
                      <Heart className="absolute top-1 right-1 w-4 h-4 text-white" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
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
                      
                      <div className="text-sm text-gray-600 mb-1">
                        {community.careTypes?.slice(0, 2).join(' • ') || 'Senior Living'}
                      </div>
                      
                      <div className="text-base font-semibold text-gray-900 mb-1">
                        {community.name}
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        {community.city}, {community.state}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Padding for bottom navigation */}
              <div className="h-20"></div>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
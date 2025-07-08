import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Star, Heart, List, Map, Bell, Calendar, Mail, Phone, ExternalLink, Users, CheckCircle, AlertTriangle, Activity, UserCheck, Stethoscope, Clock, ImageIcon, ChevronDown, SortAsc, ArrowLeft, Home } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Link } from "wouter";
import 'leaflet/dist/leaflet.css';

// Custom house-style marker icons for communities (Zillow-style)
const createHouseIcon = (isViewed: boolean = false, isFavorited: boolean = false) => {
  const fillColor = isFavorited ? '#dc2626' : isViewed ? '#fca5a5' : '#dc2626'; // Red for unviewed, light red for viewed, red for favorited
  const strokeColor = '#991b1b';
  
  const heartIcon = isFavorited ? `
    <path d="M16 8c0-2.21-1.79-4-4-4S8 5.79 8 8c0 1.5.83 2.8 2.05 3.48L12 14l1.95-2.52C15.17 10.8 16 9.5 16 8z" fill="white" stroke="#991b1b" stroke-width="0.5"/>
  ` : '';
  
  return new Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28">
        <!-- House body -->
        <rect x="6" y="12" width="12" height="8" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1.5" rx="1"/>
        <!-- House roof -->
        <path d="M4 14 L12 6 L20 14 L18 14 L12 8 L6 14 Z" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1.5"/>
        <!-- Door -->
        <rect x="10" y="16" width="4" height="4" fill="white" stroke="${strokeColor}" stroke-width="0.8"/>
        <!-- Window -->
        <rect x="7.5" y="14" width="2.5" height="2.5" fill="white" stroke="${strokeColor}" stroke-width="0.8"/>
        <rect x="14" y="14" width="2.5" height="2.5" fill="white" stroke="${strokeColor}" stroke-width="0.8"/>
        <!-- Heart for favorited -->
        ${heartIcon}
      </svg>
    `),
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
};

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
  const [sortBy, setSortBy] = useState('recommended');
  const [showSortOptions, setShowSortOptions] = useState(false);

  const [mapBounds, setMapBounds] = useState<any>(null);
  const [slidePosition, setSlidePosition] = useState(200); // Height from bottom
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartPosition, setDragStartPosition] = useState(0);
  const [dragFromHandle, setDragFromHandle] = useState(false);
  const [displayCount, setDisplayCount] = useState(20); // For pagination

  const { data: communities, isLoading, error } = useQuery({
    queryKey: ["/api/communities"],
    retry: false,
  });

  console.log('BasicSearch - communities:', communities?.length, 'loading:', isLoading, 'error:', error);

  const sortOptions = [
    { id: 'recommended', label: 'Communities for You', description: 'Best match for your needs' },
    { id: 'rating', label: 'Highest Rated', description: 'Best reviews first' },
    { id: 'price-low', label: 'Price: Low to High', description: 'Most affordable first' },
    { id: 'price-high', label: 'Price: High to Low', description: 'Premium communities first' },
    { id: 'newest', label: 'Recently Added', description: 'Latest listings' },
    { id: 'name', label: 'Alphabetical', description: 'A to Z by name' },
    { id: 'distance', label: 'Nearest First', description: 'Closest to map center' }
  ];

  const filteredCommunities = communities?.filter((community: any) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      community.name?.toLowerCase().includes(query) ||
      community.city?.toLowerCase().includes(query) ||
      community.careTypes?.some((type: string) => type.toLowerCase().includes(query))
    );
  }) || [];

  const sortCommunities = (communities: any[], sortType: string) => {
    const sorted = [...communities];
    
    switch (sortType) {
      case 'rating':
        return sorted.sort((a, b) => (b.googleRating || 0) - (a.googleRating || 0));
      case 'price-low':
        return sorted.sort((a, b) => {
          const aPrice = a.priceRange?.min || 999999;
          const bPrice = b.priceRange?.min || 999999;
          return aPrice - bPrice;
        });
      case 'price-high':
        return sorted.sort((a, b) => {
          const aPrice = a.priceRange?.max || 0;
          const bPrice = b.priceRange?.max || 0;
          return bPrice - aPrice;
        });
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'distance':
        // For now, sort by ID as a proxy for distance - could be enhanced with actual distance calculation
        return sorted.sort((a, b) => a.id - b.id);
      case 'recommended':
      default:
        // Recommended: combination of rating, availability, and completeness
        return sorted.sort((a, b) => {
          const aScore = (a.googleRating || 0) * 2 + (a.photos?.length || 0) * 0.1 + (a.priceRange ? 1 : 0);
          const bScore = (b.googleRating || 0) * 2 + (b.photos?.length || 0) * 0.1 + (b.priceRange ? 1 : 0);
          return bScore - aScore;
        });
    }
  };

  // Get communities visible in current map bounds
  const boundsFilteredCommunities = filteredCommunities.filter((community: any) => {
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

  // Apply sorting to visible communities
  const visibleCommunities = sortCommunities(boundsFilteredCommunities, sortBy);
  
  // Pagination for community display
  const displayedCommunities = visibleCommunities.slice(0, displayCount);
  
  // Load more communities when scrolling near bottom
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const { scrollTop, scrollHeight, clientHeight } = target;
    
    // Load more when within 200px of bottom
    if (scrollHeight - scrollTop <= clientHeight + 200 && displayCount < visibleCommunities.length) {
      setDisplayCount(prev => Math.min(prev + 20, visibleCommunities.length));
    }
  };
  
  // Reset display count when communities change
  useEffect(() => {
    setDisplayCount(20);
  }, [visibleCommunities.length]);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSortOptions) {
        setShowSortOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSortOptions]);

  // Handle drag for slide panel - Entire header is draggable
  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    // Don't start drag if clicking on interactive elements (buttons, dropdowns)
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('.sort-dropdown')) {
      return;
    }
    
    setIsDragging(true);
    setDragFromHandle(true);
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStartY(clientY);
    setDragStartPosition(slidePosition);
    e.preventDefault();
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
    setDragFromHandle(false);
    
    // Snap to positions based on final location with better thresholds
    const screenHeight = window.innerHeight;
    if (slidePosition < 150) {
      setSlidePosition(120); // Minimized
    } else if (slidePosition < screenHeight * 0.4) {
      setSlidePosition(Math.min(300, screenHeight * 0.35)); // Partial view
    } else {
      setSlidePosition(screenHeight * 0.75); // Full open but not overwhelming
    }
  };

  // Global mouse/touch events for dragging - Handle both mouse and touch
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleDragMove(e);
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && dragFromHandle) {
        e.preventDefault();
        handleDragMove(e);
      }
    };
    const handleMouseUp = () => handleDragEnd();
    const handleTouchEnd = () => handleDragEnd();

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, dragStartY, dragStartPosition, slidePosition, dragFromHandle]);

  // Bottom Navigation
  const BottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="flex justify-around items-center py-2">
        {[
          { id: 'search', label: 'Search', icon: Search },
          { id: 'updates', label: 'Updates', icon: Bell, badge: communities?.length || 0 },
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
      {/* Navigation Bar */}
      <div className="sticky top-0 bg-white z-40 border-b border-gray-200 shadow-sm">
        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link href="/">
                <Button variant="ghost" size="sm" className="p-1.5 hover:bg-gray-100">
                  <ArrowLeft className="w-4 h-4 text-gray-600" />
                </Button>
              </Link>
              <Link href="/" className="flex items-center space-x-1.5">
                <div className="w-6 h-6 gradient-primary rounded-md flex items-center justify-center">
                  <Home className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-900">TrueView</span>
              </Link>
            </div>
            <div className="text-gray-600 font-medium text-xs">
              {communities?.length || 0} communities
            </div>
          </div>
        </div>
      </div>

      {/* Header - Compact Search */}
      <div className="sticky top-12 bg-white z-30 border-b border-gray-200">
        <div className="px-4 py-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search communities, cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 h-9 text-sm border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:border-blue-500"
            />
          </div>
        </div>

        {/* Filter Pills - Refined */}
        <div className="px-4 pb-2.5 flex space-x-2 overflow-x-auto scrollbar-hide">
          <Button variant="outline" className="border-blue-500 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full px-3 py-1 h-7 text-xs font-medium whitespace-nowrap flex items-center">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-1.5"></div>
            Assisted Living
          </Button>
          <Button variant="outline" className="border-blue-500 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full px-3 py-1 h-7 text-xs font-medium whitespace-nowrap flex items-center">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-1.5"></div>
            $2K - $6K
          </Button>
          <Button variant="outline" className="border-gray-300 text-gray-600 hover:bg-gray-50 rounded-full px-3 py-1 h-7 text-xs font-medium whitespace-nowrap">
            + Filters
          </Button>
        </div>
      </div>

      {/* Map/List View */}
      {viewMode === 'map' ? (
        <div className="flex-1 relative" style={{ height: 'calc(100vh - 160px)' }}>
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
            
            {/* Community Markers - House Style with State */}
            {filteredCommunities
              .filter((community: any) => community.latitude && community.longitude)
              .map((community: any) => {
                // Determine marker state (for demo purposes, using community ID for variety)
                const isViewed = community.id % 3 === 0; // Every 3rd community is "viewed"
                const isFavorited = community.id % 7 === 0; // Every 7th community is "favorited"
                
                return (
                  <Marker
                    key={community.id}
                    position={[community.latitude, community.longitude]}
                    icon={createHouseIcon(isViewed, isFavorited)}
                    eventHandlers={{
                      click: () => window.location.href = `/community/${community.id}`,
                    }}
                  >
                    <Popup>
                      <div className="p-3 min-w-[220px]">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-sm text-gray-900 pr-2 leading-tight">{community.name}</h3>
                          {isFavorited && (
                            <div className="flex-shrink-0">
                              <Heart className="w-4 h-4 text-red-500 fill-current" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center text-xs text-gray-600 mb-2">
                          <MapPin className="w-3 h-3 mr-1" />
                          {community.city}, {community.state}
                        </div>
                        
                        {community.googleRating && (
                          <div className="flex items-center mb-2">
                            <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                            <span className="text-xs text-gray-600">{community.googleRating} rating</span>
                            {community.googleReviewCount && (
                              <span className="text-xs text-gray-500 ml-1">({community.googleReviewCount})</span>
                            )}
                          </div>
                        )}
                        
                        {community.careTypes && community.careTypes.length > 0 && (
                          <div className="mb-2">
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              {community.careTypes.slice(0, 2).join(' • ')}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center mt-3">
                          <div className="text-sm font-bold text-gray-900">
                            {community.priceRange?.min 
                              ? `$${Math.floor(community.priceRange.min/1000)}K+/mo` 
                              : community.monthlyRent
                              ? `$${community.monthlyRent.toLocaleString()}/mo`
                              : 'Contact for pricing'
                            }
                          </div>
                          <button
                            onClick={() => window.location.href = `/community/${community.id}`}
                            className="bg-blue-600 text-white text-xs py-1.5 px-3 rounded-lg hover:bg-blue-700 font-medium transition-colors"
                          >
                            View Details
                          </button>
                        </div>
                        
                        {isViewed && !isFavorited && (
                          <div className="mt-2 text-xs text-gray-500 flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Recently viewed
                          </div>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
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

          {/* Save Search Button - Enhanced */}
          <div className="absolute bottom-20 right-4 z-20">
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg px-3 py-2 rounded-full text-sm font-medium"
              onClick={() => alert('Search saved!')}
            >
              <Search className="w-4 h-4 mr-1.5" />
              Save
            </Button>
          </div>

          {/* Draggable Slide-up Results Panel - Refined & Professional */}
          <div 
            className="fixed left-0 right-0 bg-white z-20 shadow-2xl overflow-hidden"
            style={{ 
              bottom: 0,
              height: `${slidePosition}px`,
              transition: isDragging ? 'none' : 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              maxHeight: '90vh',
              borderRadius: slidePosition > 120 ? '20px 20px 0 0' : '12px 12px 0 0',
              borderTop: '1px solid #e5e7eb'
            }}
          >
            {/* Professional Header Design - Entire header is draggable */}
            <div className="absolute inset-0 flex flex-col">
              {/* Draggable Header Section */}
              <div 
                className="flex-shrink-0 bg-white cursor-grab active:cursor-grabbing select-none"
                onMouseDown={handleDragStart}
                onTouchStart={handleDragStart}
                style={{ 
                  borderRadius: slidePosition > 120 ? '20px 20px 0 0' : '12px 12px 0 0',
                  touchAction: 'none'
                }}
              >
                {/* Drag Handle */}
                <div className="flex justify-center pt-2.5 pb-1">
                  <div className="w-8 h-1 bg-gray-400 rounded-full transition-colors hover:bg-gray-500"></div>
                </div>

                {/* Refined Header */}
                <div className="px-4 pt-1 pb-3 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h2 className="text-lg font-bold text-gray-900">
                          {visibleCommunities.length} communities
                        </h2>
                        <div className="h-1 w-1 bg-gray-400 rounded-full"></div>
                        <span className="text-sm text-gray-500 font-medium">in map area</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Showing {displayedCommunities.length} of {visibleCommunities.length} visible • {communities?.length || 0} total
                      </p>
                    </div>
                    
                    {/* Professional Sort Button */}
                    <div className="relative sort-dropdown">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowSortOptions(!showSortOptions);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all duration-200 font-medium"
                      >
                        <SortAsc className="w-3.5 h-3.5 text-gray-600" />
                        <span className="text-gray-700">Sort</span>
                        <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${showSortOptions ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {/* Enhanced Sort Dropdown */}
                      {showSortOptions && (
                        <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                          <div className="p-3">
                            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                              <h3 className="text-sm font-bold text-gray-900">Sort communities</h3>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowSortOptions(false);
                                }}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                            <div className="space-y-1">
                              {sortOptions.map((option) => (
                                <button
                                  key={option.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSortBy(option.id);
                                    setShowSortOptions(false);
                                  }}
                                  className={`w-full text-left px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-all duration-200 ${
                                    sortBy === option.id ? 'bg-blue-50 border border-blue-200' : 'border border-transparent'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className={`font-semibold text-sm ${sortBy === option.id ? 'text-blue-700' : 'text-gray-900'}`}>
                                        {option.label}
                                      </div>
                                      <div className={`text-xs mt-0.5 ${sortBy === option.id ? 'text-blue-600' : 'text-gray-500'}`}>
                                        {option.description}
                                      </div>
                                    </div>
                                    {sortBy === option.id && (
                                      <div className="flex items-center justify-center w-5 h-5 bg-blue-600 rounded-full flex-shrink-0 ml-2">
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                        </svg>
                                      </div>
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Scrollable Results - Enhanced with Infinite Loading */}
              <div
                className="flex-1 overflow-y-auto bg-gray-50"
                style={{
                  WebkitOverflowScrolling: 'touch',
                  touchAction: 'auto',
                }}
                onScroll={handleScroll}
              >
                {visibleCommunities.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MapPin className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">No communities in this area</h3>
                    <p className="text-sm text-gray-500">Try zooming out or moving the map to see more options</p>
                  </div>
                ) : (
                  <div className="p-3 space-y-2">
                    {displayedCommunities.map((community: any) => {
                      const firstPhoto = community.photos && community.photos.length > 0 ? community.photos[0] : null;
                      const careTypeIcons = {
                        'Independent Living': <Activity className="h-3 w-3" />,
                        'Assisted Living': <UserCheck className="h-3 w-3" />,
                        'Memory Care': <Stethoscope className="h-3 w-3" />,
                        'Skilled Nursing': <Activity className="h-3 w-3" />
                      };
                      
                      return (
                        <div
                          key={community.id}
                          onClick={() => window.location.href = `/community/${community.id}`}
                          className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-200 cursor-pointer"
                        >
                          <div className="flex">
                            {/* Enhanced Photo Section */}
                            <div className="w-28 h-28 flex-shrink-0 bg-gray-100 relative rounded-l-xl overflow-hidden">
                              {firstPhoto ? (
                                <img
                                  src={firstPhoto.startsWith('http') ? firstPhoto : `/api/communities/${community.id}/photos/${firstPhoto}`}
                                  alt={community.name}
                                  className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 ${firstPhoto ? 'hidden' : ''}`}>
                                <ImageIcon className="w-8 h-8 text-gray-400" />
                              </div>
                              
                              {/* Enhanced Heart Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Add favorite logic here
                                }}
                                className="absolute top-2 right-2 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-200 shadow-sm"
                              >
                                <Heart className="w-3.5 h-3.5 text-gray-600 hover:text-red-500 transition-colors" />
                              </button>

                              {/* Photo count badge */}
                              {community.photos && community.photos.length > 1 && (
                                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                                  +{community.photos.length - 1}
                                </div>
                              )}
                            </div>
                            
                            {/* Enhanced Content Section */}
                            <div className="flex-1 p-3.5">
                              <div className="flex items-start justify-between mb-1.5">
                                <h4 className="text-sm font-bold text-gray-900 leading-tight line-clamp-1 pr-2">
                                  {community.name}
                                </h4>
                                {community.googleRating && (
                                  <div className="flex items-center flex-shrink-0 bg-yellow-50 px-1.5 py-0.5 rounded-full">
                                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                    <span className="ml-1 text-xs font-semibold text-yellow-700">
                                      {community.googleRating}
                                    </span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex items-center text-xs text-gray-500 mb-2">
                                <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                                <span className="line-clamp-1 font-medium">{community.city}, {community.state}</span>
                              </div>
                              
                              {/* Enhanced Care Types */}
                              <div className="flex flex-wrap gap-1 mb-2.5">
                                {community.careTypes?.slice(0, 2).map((careType) => (
                                  <div key={careType} className="flex items-center bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-xs border border-blue-100">
                                    {careTypeIcons[careType] || <Activity className="h-3 w-3" />}
                                    <span className="ml-1 font-semibold">{careType}</span>
                                  </div>
                                ))}
                              </div>
                              
                              {/* Enhanced Price Display */}
                              <div className="flex items-center justify-between">
                                <div className="text-sm font-bold text-gray-900">
                                  {community.monthlyRent 
                                    ? `$${community.monthlyRent.toLocaleString()}/mo` 
                                    : community.priceRange?.min 
                                      ? `$${community.priceRange.min.toLocaleString()}+/mo`
                                      : 'Contact for pricing'
                                  }
                                </div>
                                <div className="flex items-center space-x-1">
                                  {community.phone && (
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                  )}
                                  <span className="text-xs text-gray-500 font-medium">Available</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Load More Indicator */}
                    {displayCount < visibleCommunities.length && (
                      <div className="p-4 text-center">
                        <div className="inline-flex items-center text-sm text-gray-500">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                          Loading more communities...
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Showing {displayCount} of {visibleCommunities.length} in this area
                        </p>
                      </div>
                    )}
                    
                    {/* End of Results */}
                    {displayCount >= visibleCommunities.length && visibleCommunities.length > 20 && (
                      <div className="p-4 text-center">
                        <p className="text-sm text-gray-500 font-medium">All communities loaded</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {visibleCommunities.length} communities in this map area
                        </p>
                      </div>
                    )}
                    
                    <div className="h-20" /> {/* Spacer for bottom */}
                  </div>
                )}
              </div>
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



      <BottomNav />
    </div>
  );
}
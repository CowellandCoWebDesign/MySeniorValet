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
  
  // Sort options with better organization
  const sortOptions = [
    { value: 'recommended', label: 'Recommended', description: 'Best matches for your search' },
    { value: 'priceAsc', label: 'Price: Low to High', description: 'Most affordable first' },
    { value: 'priceDesc', label: 'Price: High to Low', description: 'Premium options first' },
    { value: 'rating', label: 'Highest Rated', description: 'Best reviews first' },
    { value: 'newest', label: 'Newest Listings', description: 'Recently added communities' },
    { value: 'nameAsc', label: 'A to Z', description: 'Alphabetical order' },
    { value: 'distance', label: 'Distance', description: 'Closest to you first' }
  ];

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
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  // communities is now a direct array from the fast endpoint

  console.log('BasicSearch - communities:', communities?.length, 'loading:', isLoading, 'error:', error);

  // Optimize display count based on viewport for better performance
  const getOptimalDisplayCount = () => {
    const viewportHeight = window.innerHeight;
    const cardHeight = 120; // Approximate card height
    const visibleCards = Math.floor(viewportHeight / cardHeight);
    return Math.max(20, visibleCards * 2); // Show 2x visible cards for smooth scrolling
  };

  // Enhanced sorting function
  const sortCommunities = (communities: any[], sortBy: string) => {
    if (!communities) return [];
    
    return [...communities].sort((a, b) => {
      switch (sortBy) {
        case 'priceAsc':
          const priceA = a.priceRange?.min || a.monthlyRent || 0;
          const priceB = b.priceRange?.min || b.monthlyRent || 0;
          return priceA - priceB;
        case 'priceDesc':
          const priceA2 = a.priceRange?.min || a.monthlyRent || 0;
          const priceB2 = b.priceRange?.min || b.monthlyRent || 0;
          return priceB2 - priceA2;
        case 'rating':
          return (b.googleRating || 0) - (a.googleRating || 0);
        case 'nameAsc':
          return a.name.localeCompare(b.name);
        case 'newest':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'distance':
          // For now, sort by random to simulate distance
          return Math.random() - 0.5;
        default: // recommended
          // Prioritize communities with ratings and photos
          const scoreA = (a.googleRating || 0) * 2 + (a.googlePhotos?.length || 0) * 0.1;
          const scoreB = (b.googleRating || 0) * 2 + (b.googlePhotos?.length || 0) * 0.1;
          return scoreB - scoreA;
      }
    });
  };

  // Filter communities based on search query and map bounds
  const filteredCommunities = communities?.filter((community: any) => {
    // Search query filter
    const searchMatch = !searchQuery || 
      community.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.careTypes?.some((type: string) => 
        type.toLowerCase().includes(searchQuery.toLowerCase())
      );

    // Map bounds filter (if bounds are available)
    const boundsMatch = !mapBounds || (
      community.latitude >= mapBounds.getSouth() &&
      community.latitude <= mapBounds.getNorth() &&
      community.longitude >= mapBounds.getWest() &&
      community.longitude <= mapBounds.getEast()
    );

    return searchMatch && boundsMatch;
  }) || [];

  // Apply sorting to filtered communities
  const sortedCommunities = sortCommunities(filteredCommunities, sortBy);

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
  // Smart pagination for performance - only render what's needed
  const optimalCount = getOptimalDisplayCount();
  const displayedCommunities = visibleCommunities.slice(0, Math.min(displayCount, optimalCount));
  
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
    
    // Use requestAnimationFrame for smoother updates
    requestAnimationFrame(() => {
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const deltaY = dragStartY - clientY; // Inverted because dragging up increases position
      const newPosition = Math.max(120, Math.min(window.innerHeight - 50, dragStartPosition + deltaY));
      setSlidePosition(newPosition);
    });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragFromHandle(false);
    
    // Smooth snap to positions with better thresholds
    requestAnimationFrame(() => {
      const screenHeight = window.innerHeight;
      if (slidePosition < 150) {
        setSlidePosition(120); // Minimized
      } else if (slidePosition < screenHeight * 0.4) {
        setSlidePosition(Math.min(280, screenHeight * 0.35)); // Partial view
      } else {
        setSlidePosition(screenHeight * 0.75); // Full open but not overwhelming
      }
    });
  };

  // Global mouse/touch events for dragging - Handle both mouse and touch
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
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
            {sortedCommunities
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

          {/* Draggable Slide-up Results Panel - Smooth & Optimized */}
          <div 
            className={`fixed left-0 right-0 bg-white z-30 shadow-2xl overflow-hidden slide-panel ${isDragging ? 'dragging' : ''}`}
            style={{ 
              bottom: 0,
              height: `${slidePosition}px`,
              transition: isDragging ? 'none' : 'height 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              maxHeight: '90vh',
              borderRadius: slidePosition > 120 ? '16px 16px 0 0' : '10px 10px 0 0',
              borderTop: '1px solid #e5e7eb'
            }}
          >
            {/* Professional Header Design - Entire header is draggable */}
            <div className="absolute inset-0 flex flex-col">
              {/* Ultra-Thin Draggable Header - Minimal & Refined */}
              <div 
                className="flex-shrink-0 bg-white cursor-grab active:cursor-grabbing select-none"
                onMouseDown={handleDragStart}
                onTouchStart={handleDragStart}
                style={{ 
                  borderRadius: slidePosition > 120 ? '16px 16px 0 0' : '10px 10px 0 0',
                  touchAction: 'none'
                }}
              >
                {/* Minimal Drag Handle */}
                <div className="flex justify-center pt-2 pb-1">
                  <div className="w-8 h-1 bg-gray-300 rounded-full transition-colors hover:bg-gray-400"></div>
                </div>

                {/* Ultra-Compact Header */}
                <div className="px-3 pb-2 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-1.5">
                        <h2 className="text-sm font-semibold text-gray-900">
                          {visibleCommunities.length} communities
                        </h2>
                        <div className="h-0.5 w-0.5 bg-gray-400 rounded-full"></div>
                        <span className="text-xs text-gray-500">in view</span>
                      </div>
                    </div>
                    
                    {/* Minimal Sort Button */}
                    <div className="relative sort-dropdown">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowSortOptions(!showSortOptions);
                        }}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md transition-all duration-200"
                      >
                        <SortAsc className="w-3 h-3 text-gray-600" />
                        <span className="text-gray-600">Sort</span>
                        <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform duration-200 ${showSortOptions ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {/* Compact Sort Dropdown */}
                      {showSortOptions && (
                        <div className="absolute top-full right-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
                          <div className="p-2">
                            <div className="flex items-center justify-between mb-2 pb-1 border-b border-gray-100">
                              <h3 className="text-xs font-medium text-gray-700">Sort by</h3>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowSortOptions(false);
                                }}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                            <div className="space-y-0.5">
                              {sortOptions.map((option) => (
                                <button
                                  key={option.value}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSortBy(option.value);
                                    setShowSortOptions(false);
                                  }}
                                  className={`w-full text-left px-2 py-1.5 rounded-md text-xs transition-all duration-200 flex items-center justify-between ${
                                    sortBy === option.value 
                                      ? 'bg-blue-50 text-blue-700' 
                                      : 'hover:bg-gray-50 text-gray-700'
                                  }`}
                                >
                                  <div className="flex-1">
                                    <div className="font-medium">{option.label}</div>
                                    <div className="text-xs text-gray-500 mt-0.5 leading-tight">{option.description}</div>
                                  </div>
                                  {sortBy === option.value && (
                                    <CheckCircle className="w-3 h-3 text-blue-600 flex-shrink-0" />
                                  )}
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

              {/* Scrollable Results - Optimized Performance */}
              <div
                className="flex-1 overflow-y-auto bg-gray-50"
                style={{
                  WebkitOverflowScrolling: 'touch',
                  touchAction: 'auto',
                  transform: 'translateZ(0)', // Hardware acceleration
                  contain: 'layout style paint' // Optimize rendering
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
                          className={`bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer mb-4 ${
                            community.id % 8 === 0 ? 'border-2 border-yellow-300 shadow-md ring-1 ring-yellow-200' : 'border border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {/* Sponsored Badge */}
                          {community.id % 8 === 0 && (
                            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 text-center">
                              ⭐ SPONSORED LISTING
                            </div>
                          )}
                          
                          {/* Large Photo Above - Zillow Style */}
                          <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
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
                              <ImageIcon className="w-12 h-12 text-gray-400" />
                            </div>
                            
                            {/* Top Left Badges */}
                            {community.id % 5 === 0 && (
                              <div className="absolute top-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded-md font-medium">
                                Large lot
                              </div>
                            )}
                            
                            {/* Enhanced Heart Button - Top Right */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Add favorite logic here
                              }}
                              className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-200 shadow-sm"
                            >
                              <Heart className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors" />
                            </button>

                            {/* Photo count indicators - Bottom Center */}
                            {community.photos && community.photos.length > 1 && (
                              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
                                {Array.from({ length: Math.min(community.photos.length, 5) }).map((_, index) => (
                                  <div
                                    key={index}
                                    className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-white' : 'bg-white/50'}`}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                          
                          {/* Content Section Below Photo */}
                          <div className="p-4">
                            {/* Community Name and Rating - Top Priority */}
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="text-base font-semibold text-gray-900 leading-tight flex-1 pr-2">
                                {community.name}
                              </h4>
                              {community.googleRating && (
                                <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full flex-shrink-0">
                                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                  <span className="ml-1 text-xs font-semibold text-yellow-700">
                                    {community.googleRating}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            {/* Address */}
                            <div className="text-sm text-gray-600 mb-2">
                              {community.address}, {community.city}, {community.state}
                            </div>

                            {/* Contact Information */}
                            <div className="flex items-center justify-between text-xs mb-3">
                              {community.phone && (
                                <div className="flex items-center text-gray-500">
                                  <Phone className="w-3 h-3 mr-1" />
                                  <span className="font-medium">{community.phone}</span>
                                </div>
                              )}
                              
                              <div className="flex items-center space-x-2">
                                {community.website && (
                                  <div className="flex items-center text-blue-600">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1"></div>
                                    <span className="text-xs font-medium">Website</span>
                                  </div>
                                )}
                                <span className="text-gray-500 font-medium">
                                  {community.availabilityStatus || 'Available Now'}
                                </span>
                              </div>
                            </div>

                            {/* Availability Information */}
                            <div className="mb-3">
                              {community.unitTypes && community.unitTypes.length > 0 ? (
                                <div>
                                  <div className="flex items-center text-xs text-gray-600 mb-1.5">
                                    <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                                    <span className="font-medium">Confirmed Availability</span>
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {community.unitTypes.slice(0, 3).map((unit: any, index: number) => (
                                      <div key={index} className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs border border-green-100 font-medium">
                                        {unit.type} ({unit.available} available)
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div className="flex items-center text-xs text-gray-600 mb-1.5">
                                    <CheckCircle className="w-3 h-3 mr-1 text-blue-500" />
                                    <span className="font-medium">Estimated Availability</span>
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs border border-blue-100 font-medium">
                                      Studio (2-3 available)
                                    </div>
                                    <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs border border-blue-100 font-medium">
                                      1BR (1-2 available)
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Price - Bottom Priority */}
                            <div className="flex items-center justify-between">
                              <div className="text-lg font-bold text-gray-900">
                                {community.priceRange?.min && community.priceRange?.max 
                                  ? `$${(community.priceRange.min / 1000).toFixed(1)}K - $${(community.priceRange.max / 1000).toFixed(1)}K`
                                  : community.priceRange?.min 
                                    ? `$${(community.priceRange.min / 1000).toFixed(1)}K+`
                                    : '$4.2K - $8.5K'
                                }
                                <span className="text-sm text-gray-500 font-normal">/mo</span>
                              </div>
                              
                              {/* Care Types as Tags */}
                              <div className="flex gap-1">
                                {community.careTypes?.slice(0, 2).map((careType) => (
                                  <div key={careType} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                                    {careType === 'Independent Living' ? 'Independent' : 
                                     careType === 'Assisted Living' ? 'Assisted' :
                                     careType === 'Memory Care' ? 'Memory' :
                                     careType === 'Skilled Nursing' ? 'Skilled' : careType}
                                  </div>
                                ))}
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
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Star, Heart, List, Map, Bell, Calendar, Mail, Phone, ExternalLink, Users, CheckCircle, AlertTriangle, Activity, UserCheck, Stethoscope, Clock, ImageIcon, ChevronDown, SortAsc, ArrowLeft, Home, Plus, Minus, Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Icon } from 'leaflet';
import { Link, useLocation } from "wouter";
import SlidePanel from "@/components/SlidePanel";
import BottomNavigation from "@/components/BottomNavigation";
import { TransparencyBadgeList } from "@/components/TransparencyBadge";
import 'leaflet/dist/leaflet.css';

// Care type icons and colors mapping
const careTypeConfig = {
  'Independent Living': { 
    color: '#10b981', // Green
    icon: 'home',
    description: 'Independent senior apartments'
  },
  'Assisted Living': { 
    color: '#3b82f6', // Blue
    icon: 'users',
    description: 'Assistance with daily activities'
  },
  'Memory Care': { 
    color: '#8b5cf6', // Purple
    icon: 'brain',
    description: 'Specialized dementia care'
  },
  'Skilled Nursing': { 
    color: '#ef4444', // Red
    icon: 'stethoscope',
    description: '24/7 medical care'
  },
  'Continuing Care': { 
    color: '#f59e0b', // Orange
    icon: 'activity',
    description: 'Multiple care levels'
  },
  'HUD': { 
    color: '#059669', // Dark green
    icon: 'shield',
    description: 'HUD-VASH veterans housing'
  },
  'Affordable Housing': { 
    color: '#0891b2', // Cyan
    icon: 'dollar-sign',
    description: 'Income-based housing'
  }
};

// Create custom marker icons based on care type
const createCareTypeIcon = (careTypes: string[], isViewed: boolean = false, isFavorited: boolean = false) => {
  // Determine primary care type
  const primaryCareType = careTypes?.find(type => careTypeConfig[type as keyof typeof careTypeConfig]) || 'Independent Living';
  const config = careTypeConfig[primaryCareType as keyof typeof careTypeConfig] || careTypeConfig['Independent Living'];
  
  const fillColor = isFavorited ? '#dc2626' : isViewed ? '#fca5a5' : config.color;
  const strokeColor = '#ffffff';
  
  // Icon paths for different care types
  const iconPaths = {
    'home': `<path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" stroke="white" stroke-width="1.5" fill="none"/>`,
    'users': `<path d="M12 14c2.206 0 4-1.794 4-4s-1.794-4-4-4-4 1.794-4 4 1.794 4 4 4z" fill="white"/><path d="M12 14c-5 0-8 3-8 6h16c0-3-3-6-8-6z" fill="white"/>`,
    'brain': `<circle cx="12" cy="8" r="3" fill="white"/><path d="M9 16s0-2 3-2 3 2 3 2" stroke="white" stroke-width="1.5" fill="none"/>`,
    'stethoscope': `<path d="M11 2a2 2 0 0 0-2 2v6.5a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5V4a2 2 0 0 0-4 0v6.5a2.5 2.5 0 0 0 5 0V4" stroke="white" stroke-width="1.5" fill="none"/>`,
    'activity': `<polyline points="22,12 18,12 15,21 9,3 6,12 2,12" stroke="white" stroke-width="1.5" fill="none"/>`,
    'shield': `<path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" fill="white" stroke="white"/>`,
    'shield-check': `<path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" fill="white" stroke="white"/><polyline points="9,12 11,14 16,9" stroke="${fillColor}" stroke-width="1.5" fill="none"/>`,
    'dollar-sign': `<line x1="12" y1="1" x2="12" y2="23" stroke="white" stroke-width="1.5"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="white" stroke-width="1.5" fill="none"/>`
  };
  
  const iconPath = iconPaths[config.icon as keyof typeof iconPaths] || iconPaths.home;
  
  const heartIcon = isFavorited ? `
    <path d="M16 8c0-2.21-1.79-4-4-4S8 5.79 8 8c0 1.5.83 2.8 2.05 3.48L12 14l1.95-2.52C15.17 10.8 16 9.5 16 8z" fill="white" stroke="#991b1b" stroke-width="0.5"/>
  ` : '';
  
  return new Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
        <!-- Background circle -->
        <circle cx="12" cy="12" r="10" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2"/>
        <!-- Icon -->
        ${iconPath}
        <!-- Heart for favorited -->
        ${heartIcon}
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
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

export default function BasicSearch({ initialFilters = [] }: { initialFilters?: string[] }) {
  // Parse URL parameters for initial search query
  const urlParams = new URLSearchParams(window.location.search);
  const urlSearchQuery = urlParams.get('q');
  
  const [searchQuery, setSearchQuery] = useState(urlSearchQuery || "");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(urlSearchQuery || "");
  const [activeTab, setActiveTab] = useState('search');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [sortBy, setSortBy] = useState('recommended');
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [, navigate] = useLocation();
  
  // Debounce search query to prevent excessive API calls - reduced to 300ms for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms delay as specified
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // Parse URL parameters for filters  
  const urlCareType = urlParams.get('careType');
  const urlFilters = urlParams.get('filters');
  const urlFiltersArray = [];
  
  // Add care type from URL parameter
  if (urlCareType) {
    urlFiltersArray.push(urlCareType);
  }
  
  // Add filters from URL parameter
  if (urlFilters) {
    urlFiltersArray.push(...urlFilters.split(','));
  }
  
  // Filter states
  const [selectedCareTypes, setSelectedCareTypes] = useState<string[]>([...initialFilters, ...urlFiltersArray]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Mobile filter drawer states
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<string[]>([]);
  
  // Filter chip options for mobile drawer
  const availabilityOptions = ['Available Now', 'Available Soon', 'Waitlist Open'];
  const budgetOptions = ['< $3k', '$3k-$5k', '$5k+'];
  
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

  // Handle tab change for bottom navigation
  const handleTabChange = (tabId: string) => {
    console.log('Bottom navigation tab clicked:', tabId);
    setActiveTab(tabId);
    
    switch (tabId) {
      case 'search':
        navigate('/search');
        break;
      case 'updates':
        navigate('/dashboard?tab=updates');
        break;
      case 'saved':
        navigate('/dashboard?tab=saved');
        break;
      case 'tours':
        navigate('/dashboard?tab=tours');
        break;
      case 'inbox':
        navigate('/dashboard?tab=inbox');
        break;
    }
  };

  const { data: communitiesResponse, isLoading, error } = useQuery({
    queryKey: ["/api/communities/search", { 
      limit: viewMode === 'map' ? 200 : 50, // More communities for map view, optimized for list view
      location: debouncedSearchQuery,
      careTypes: selectedCareTypes 
    }],
    queryFn: async () => {
      // Dynamic limit based on view mode
      const limit = viewMode === 'map' ? 200 : 50;
      let url = `/api/communities/search?limit=${limit}`;
      
      // Add location parameter if debounced search query exists
      if (debouncedSearchQuery) {
        url += `&location=${encodeURIComponent(debouncedSearchQuery)}`;
      }
      
      // Add care type parameters to trigger HUD inclusion
      if (selectedCareTypes.length > 0) {
        selectedCareTypes.forEach(careType => {
          url += `&careType=${encodeURIComponent(careType)}`;
        });
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch communities");
      return response.json();
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  // Extract communities array from search response (now returns direct array, not paginated)
  const communities = Array.isArray(communitiesResponse) ? communitiesResponse : [];
  
  // Filter options
  const careTypeOptions = [
    'Independent Living',
    'Assisted Living', 
    'Memory Care',
    'Skilled Nursing',
    'Continuing Care',
    'Veterans Housing',
    'HUD/VASH',
    'Affordable Housing'
  ];
  
  const amenityOptions = [
    'Pet Friendly',
    'Outdoor Space',
    'Fitness Center',
    'Swimming Pool',
    'Library',
    'Beauty Salon',
    'Transportation',
    'Dining Room',
    'Activities',
    'WiFi'
  ];

  // Enhanced sorting function with sponsored listing priority
  const sortCommunities = (communities: any[], sortBy: string) => {
    if (!communities) return [];
    
    return [...communities].sort((a, b) => {
      // First priority: Sponsored listings always appear first
      const isASponsored = a.id % 8 === 0;
      const isBSponsored = b.id % 8 === 0;
      
      if (isASponsored && !isBSponsored) return -1;
      if (!isASponsored && isBSponsored) return 1;
      
      // If both are sponsored or both are not sponsored, apply regular sorting
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

  // Filter communities based on search query, filters, and map bounds
  const filteredCommunities = communities?.filter((community: any) => {
    // Search query filter
    const searchMatch = !searchQuery || 
      community.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.careTypes?.some((type: string) => 
        type.toLowerCase().includes(searchQuery.toLowerCase())
      );

    // Care type filter - enhanced for affordable housing
    const careTypeMatch = selectedCareTypes.length === 0 || 
      selectedCareTypes.some(careType => {
        // Special handling for affordable housing
        if (careType === 'Affordable Housing') {
          return community.type === 'Affordable Senior' || 
                 community.care_types?.some((ct: string) => 
                   ct.toLowerCase().includes('low income') || 
                   ct.toLowerCase().includes('section 202') || 
                   ct.toLowerCase().includes('section 811') ||
                   ct.toLowerCase().includes('affordable')
                 );
        }
        
        // Regular care type matching
        return community.careTypes?.some((ct: string) => 
          ct.toLowerCase().includes(careType.toLowerCase())
        ) || community.care_types?.some((ct: string) => 
          ct.toLowerCase().includes(careType.toLowerCase())
        );
      });

    // Price range filter
    const priceMatch = !community.priceRange || 
      (community.priceRange.min >= priceRange.min && 
       community.priceRange.max <= priceRange.max);

    // Amenities filter
    const amenityMatch = selectedAmenities.length === 0 ||
      selectedAmenities.every(amenity =>
        community.amenities?.some((a: string) => 
          a.toLowerCase().includes(amenity.toLowerCase())
        )
      );

    // Map bounds filter (if bounds are available)
    const boundsMatch = !mapBounds || (
      community.latitude >= mapBounds.getSouth() &&
      community.latitude <= mapBounds.getNorth() &&
      community.longitude >= mapBounds.getWest() &&
      community.longitude <= mapBounds.getEast()
    );

    return searchMatch && careTypeMatch && priceMatch && amenityMatch && boundsMatch;
  }) || [];

  // Apply sorting to filtered communities
  const sortedCommunities = sortCommunities(filteredCommunities, sortBy);

  // Get communities visible in current map bounds
  const boundsFilteredCommunities = filteredCommunities.filter((community: any) => {
    if (!mapBounds || !community.latitude || !community.longitude) return false;
    
    const lat = parseFloat(community.latitude);
    const lng = parseFloat(community.longitude);
    
    // Check if community is within map bounds
    return mapBounds.contains([lat, lng]);
  });

  // Apply sorting to visible communities
  const visibleCommunities = sortCommunities(boundsFilteredCommunities, sortBy);

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

  // Note: BottomNav component is defined at the end of the file

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
                      {community.monthlyRent && !community.claimed && (
                        <span className="text-xs text-gray-500 ml-1 font-normal">est.</span>
                      )}
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
                      {community.monthlyRent && !community.claimed && (
                        <span className="text-xs text-gray-500 ml-1 font-normal">est.</span>
                      )}
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
              {viewMode === 'map' ? (
                <>
                  {visibleCommunities?.length || 0} shown
                  {(filteredCommunities?.length || 0) > (visibleCommunities?.length || 0) && (
                    <span className="text-blue-600 ml-1">
                      • {filteredCommunities?.length || 0} total
                    </span>
                  )}
                </>
              ) : (
                <>{filteredCommunities?.length || 0} communities</>
              )}
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
              placeholder="Try 'San Francisco' or 'Memory Care'"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 h-9 text-sm border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:border-blue-500"
            />
          </div>
        </div>

        {/* Filter Pills - Mobile-Friendly */}
        <div className="px-4 pb-2.5 flex space-x-2 overflow-x-auto scrollbar-hide">
          {/* Mobile Filter Drawer Trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                className="border-gray-300 text-gray-600 hover:bg-gray-50 rounded-full px-3 py-1 h-7 text-xs font-medium whitespace-nowrap flex items-center"
              >
                <Filter className="w-3 h-3 mr-1.5" />
                Filters {(selectedCareTypes.length + selectedAvailability.length + selectedBudget.length) > 0 && 
                  <span className="ml-1 bg-blue-600 text-white rounded-full px-1.5 text-[10px]">
                    {selectedCareTypes.length + selectedAvailability.length + selectedBudget.length}
                  </span>
                }
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filter Communities</SheetTitle>
                <SheetDescription>
                  Filter by care type, availability, and budget to find your perfect community.
                </SheetDescription>
              </SheetHeader>
              
              <div className="mt-6 space-y-6">
                {/* Care Types Filter */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Care Types</h3>
                  <div className="flex flex-wrap gap-2">
                    {careTypeOptions.map(careType => {
                      const config = careTypeConfig[careType as keyof typeof careTypeConfig];
                      const isSelected = selectedCareTypes.includes(careType);
                      return (
                        <Button
                          key={careType}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedCareTypes(selectedCareTypes.filter(ct => ct !== careType));
                            } else {
                              setSelectedCareTypes([...selectedCareTypes, careType]);
                            }
                          }}
                          className={`rounded-full text-xs h-8 flex items-center ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div 
                            className="w-2 h-2 rounded-full mr-2" 
                            style={{ backgroundColor: config?.color || '#3b82f6' }}
                          ></div>
                          {careType}
                        </Button>
                      );
                    })}
                  </div>
                </div>
                
                {/* Availability Filter */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Availability</h3>
                  <div className="flex flex-wrap gap-2">
                    {availabilityOptions.map(availability => {
                      const isSelected = selectedAvailability.includes(availability);
                      return (
                        <Button
                          key={availability}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedAvailability(selectedAvailability.filter(a => a !== availability));
                            } else {
                              setSelectedAvailability([...selectedAvailability, availability]);
                            }
                          }}
                          className={`rounded-full text-xs h-8 flex items-center ${
                            isSelected
                              ? 'bg-green-600 text-white border-green-600 hover:bg-green-700'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {availability === 'Available Now' && <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>}
                          {availability === 'Available Soon' && <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>}
                          {availability === 'Waitlist Open' && <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>}
                          {availability}
                        </Button>
                      );
                    })}
                  </div>
                </div>
                
                {/* Budget Filter */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Budget</h3>
                  <div className="flex flex-wrap gap-2">
                    {budgetOptions.map(budget => {
                      const isSelected = selectedBudget.includes(budget);
                      return (
                        <Button
                          key={budget}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedBudget(selectedBudget.filter(b => b !== budget));
                            } else {
                              setSelectedBudget([...selectedBudget, budget]);
                            }
                          }}
                          className={`rounded-full text-xs h-8 flex items-center ${
                            isSelected
                              ? 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                          {budget}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          {selectedCareTypes.map(careType => {
            const config = careTypeConfig[careType as keyof typeof careTypeConfig];
            return (
              <Button 
                key={careType}
                variant="outline" 
                onClick={() => setSelectedCareTypes(selectedCareTypes.filter(ct => ct !== careType))}
                className="border-blue-500 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full px-3 py-1 h-7 text-xs font-medium whitespace-nowrap flex items-center"
              >
                <div 
                  className="w-1.5 h-1.5 rounded-full mr-1.5" 
                  style={{ backgroundColor: config?.color || '#3b82f6' }}
                ></div>
                {careType}
                <X className="w-3 h-3 ml-1" />
              </Button>
            );
          })}
          
          {priceRange.min > 0 || priceRange.max < 10000 ? (
            <Button 
              variant="outline" 
              onClick={() => setPriceRange({ min: 0, max: 10000 })}
              className="border-blue-500 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full px-3 py-1 h-7 text-xs font-medium whitespace-nowrap flex items-center"
            >
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-1.5"></div>
              ${priceRange.min/1000}K - ${priceRange.max/1000}K
              <X className="w-3 h-3 ml-1" />
            </Button>
          ) : null}
          
          {selectedAmenities.length > 0 && (
            <Button 
              variant="outline" 
              onClick={() => setSelectedAmenities([])}
              className="border-blue-500 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full px-3 py-1 h-7 text-xs font-medium whitespace-nowrap flex items-center"
            >
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-1.5"></div>
              {selectedAmenities.length} Amenities
              <X className="w-3 h-3 ml-1" />
            </Button>
          )}
        </div>
        
        {/* Expanded Filter Panel */}
        {showFilters && (
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            {/* Care Types */}
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-gray-700 mb-2">CARE TYPES</h3>
              <div className="flex flex-wrap gap-2">
                {careTypeOptions.map(careType => {
                  const config = careTypeConfig[careType as keyof typeof careTypeConfig];
                  const isSelected = selectedCareTypes.includes(careType);
                  return (
                    <Button
                      key={careType}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (isSelected) {
                          setSelectedCareTypes(selectedCareTypes.filter(ct => ct !== careType));
                        } else {
                          setSelectedCareTypes([...selectedCareTypes, careType]);
                        }
                      }}
                      className={`rounded-full text-xs h-7 flex items-center ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div 
                        className="w-2 h-2 rounded-full mr-1.5" 
                        style={{ backgroundColor: config?.color || '#3b82f6' }}
                      ></div>
                      {careType}
                    </Button>
                  );
                })}
              </div>
            </div>
            
            {/* Price Range */}
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-gray-700 mb-2">PRICE RANGE</h3>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min || ''}
                  onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) || 0 })}
                  className="w-24 h-8 text-xs"
                />
                <span className="text-gray-500">to</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max === 10000 ? '' : priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) || 10000 })}
                  className="w-24 h-8 text-xs"
                />
                <span className="text-xs text-gray-600">/month</span>
              </div>
            </div>
            
            {/* Amenities */}
            <div>
              <h3 className="text-xs font-semibold text-gray-700 mb-2">AMENITIES</h3>
              <div className="flex flex-wrap gap-2">
                {amenityOptions.map(amenity => (
                  <Button
                    key={amenity}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (selectedAmenities.includes(amenity)) {
                        setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
                      } else {
                        setSelectedAmenities([...selectedAmenities, amenity]);
                      }
                    }}
                    className={`rounded-full text-xs h-7 ${
                      selectedAmenities.includes(amenity)
                        ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {amenity}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Map/List View */}
      {viewMode === 'map' ? (
        <div className="flex-1 relative" style={{ height: 'calc(100vh - 160px)' }}>
          {/* Map Loading State */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2">Loading communities...</p>
              </div>
            </div>
          )}
          
          <MapContainer
            center={selectedCareTypes.includes('Affordable Housing') ? [37.7749, -122.4194] : [40.315, -122.32]} // SF center for affordable housing, Northern CA for others
            zoom={selectedCareTypes.includes('Affordable Housing') ? 5 : 7}
            style={{ height: '100%', width: '100%' }}
            className="z-10"
            zoomControl={false} // Disable default zoom control
            attributionControl={false} // Disable default attribution control
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Map bounds tracker */}
            <MapBoundsUpdater onBoundsChange={setMapBounds} />
            
            {/* Community Markers with Clustering */}
            <MarkerClusterGroup
              chunkedLoading
              maxClusterRadius={60}
              spiderfyOnMaxZoom={true}
              showCoverageOnHover={false}
              zoomToBoundsOnClick={true}
              spiderfyDistanceMultiplier={1.5}
              iconCreateFunction={(cluster) => {
                const childCount = cluster.getChildCount();
                let c = ' marker-cluster-';
                if (childCount < 10) {
                  c += 'small';
                } else if (childCount < 100) {
                  c += 'medium';
                } else {
                  c += 'large';
                }
                
                return new Icon({
                  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" width="60" height="60">
                      <circle cx="30" cy="30" r="25" fill="#2563eb" stroke="#ffffff" stroke-width="3" opacity="0.9"/>
                      <text x="30" y="35" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle">${childCount}</text>
                    </svg>
                  `),
                  iconSize: [60, 60],
                  iconAnchor: [30, 30],
                  popupAnchor: [0, -30],
                  className: 'marker-cluster' + c
                });
              }}
            >
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
                      icon={createCareTypeIcon(community.careTypes || ['Independent Living'], isViewed, isFavorited)}
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
            </MarkerClusterGroup>
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
          
          {/* Custom Zoom Controls - Positioned away from slide panel */}
          <div className="absolute top-32 left-4 z-20 flex flex-col space-y-1">
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-white shadow-md w-8 h-8 p-0 flex items-center justify-center"
              onClick={() => {
                // Zoom in functionality would go here
                console.log('Zoom in clicked');
              }}
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-white shadow-md w-8 h-8 p-0 flex items-center justify-center"
              onClick={() => {
                // Zoom out functionality would go here
                console.log('Zoom out clicked');
              }}
            >
              <Minus className="w-4 h-4" />
            </Button>
          </div>

          {/* Save Search Button - Enhanced */}
          <div className="absolute bottom-32 right-4 z-20">
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg px-3 py-2 rounded-full text-sm font-medium"
              onClick={() => alert('Search saved!')}
            >
              <Search className="w-4 h-4 mr-1.5" />
              Save
            </Button>
          </div>

          {/* Optimized Slide Panel with Virtualization */}
          <SlidePanel
            communities={visibleCommunities}
            sortBy={sortBy}
            setSortBy={setSortBy}
            isLoading={isLoading}
            initialHeight={
              (debouncedSearchQuery || urlSearchQuery) && visibleCommunities.length > 0
                ? typeof window !== 'undefined' 
                  ? window.innerHeight * 0.85  // 85% of screen height when there are search results
                  : 600
                : 120  // Default collapsed height
            }
            autoExpand={!!(debouncedSearchQuery || urlSearchQuery) && visibleCommunities.length > 0}
          />
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
          <div className="flex flex-col items-center space-y-4">
          {filteredCommunities.map((community: any, index) => (
            <Link key={community.id} href={`/community/${community.id}`}>
              <Card className="overflow-hidden w-56 h-[30rem] animate-float hover:shadow-xl transition-all duration-300" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="relative">
                  <div className="aspect-[4/3] bg-gray-200 flex items-center justify-center">
                    <Home className="w-12 h-12 text-gray-400" />
                  </div>
                  
                  {/* Heart Icon */}
                  <div className="absolute top-2 right-2 z-10">
                    <div className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Heart className="w-4 h-4 text-gray-600" />
                    </div>
                  </div>
                  
                  {/* Availability Badge - Top Left */}
                  {index % 3 === 0 && (
                    <Badge className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 font-medium animate-pulse z-10">
                      🟢 Available Now
                    </Badge>
                  )}
                  {index % 3 === 1 && (
                    <Badge className="absolute top-2 left-2 bg-orange-600 text-white text-xs px-2 py-1 font-medium z-10">
                      🟡 Waitlist Open
                    </Badge>
                  )}
                  {index % 3 === 2 && (
                    <Badge className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 font-medium z-10">
                      📋 Call for Availability
                    </Badge>
                  )}
                  
                  {/* Price Badge - Bottom Left */}
                  <Badge className="absolute bottom-2 left-2 bg-gray-900 text-white text-xs px-2 py-1 font-medium z-10">
                    {community.monthlyRent ? `$${(community.monthlyRent / 1000).toFixed(1)}K+` : '$4K+'}
                    {!community.claimed && (
                      <span className="text-xs text-gray-300 ml-1 font-normal">est.</span>
                    )}
                  </Badge>
                  
                  {/* Achievement Badge - Bottom Right */}
                  {index % 5 === 0 && (
                    <Badge className="absolute bottom-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 font-medium z-10">
                      🏆 Featured
                    </Badge>
                  )}
                  {index % 5 === 1 && (
                    <Badge className="absolute bottom-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 font-medium z-10">
                      ⭐ Top Rated
                    </Badge>
                  )}
                  {index % 5 === 2 && (
                    <Badge className="absolute bottom-2 right-2 bg-cyan-600 text-white text-xs px-2 py-1 font-medium z-10">
                      🌊 Premium
                    </Badge>
                  )}
                  {index % 5 === 3 && (
                    <Badge className="absolute bottom-2 right-2 bg-teal-600 text-white text-xs px-2 py-1 font-medium z-10">
                      ⚡ Trending
                    </Badge>
                  )}
                  {index % 5 === 4 && (
                    <Badge className="absolute bottom-2 right-2 bg-green-600 text-white text-xs px-2 py-1 font-medium z-10">
                      💎 Exclusive
                    </Badge>
                  )}
                </div>
                
                <CardContent className="p-3">
                  {/* Availability Status - Above Price */}
                  {index % 3 === 0 && (
                    <div className="flex items-center text-xs text-green-600 font-medium mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                      Available
                    </div>
                  )}
                  
                  <div className="text-xl font-bold text-gray-900 mb-2">
                    {community.monthlyRent ? `$${community.monthlyRent.toLocaleString()}` : '$3,800'}
                    {!community.claimed && (
                      <span className="text-xs text-gray-500 ml-1 font-normal">est.</span>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-700 mb-1">
                    {community.careTypes?.length > 0 ? 
                      `${community.careTypes[0]} • Senior Living` : 
                      'Assisted Living • Senior Care'
                    }
                  </div>
                  
                  <div className="text-sm font-medium text-gray-900 mb-2 line-clamp-1">
                    {community.name}
                  </div>
                  
                  <div className="text-xs text-gray-600 line-clamp-1 mb-2">
                    {community.address || 'Senior Living Community'}, {community.city}, {community.state || 'CA'}
                  </div>
                  
                  {/* Multi-State Regional Badges */}
                  <div className="mb-3">
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
                  
                  {/* Transparency Badges */}
                  {community.transparencyBadges && community.transparencyBadges.length > 0 && (
                    <div className="mb-3">
                      <TransparencyBadgeList 
                        badges={community.transparencyBadges} 
                        transparencyScore={community.transparencyScore}
                        showScore={true}
                        maxBadges={2}
                      />
                    </div>
                  )}
                  
                  <div className="mt-1">
                    <div className="flex items-center text-gray-500">
                      <span>{index < 4 ? '🌊 Coastal Views' : '🏆 Featured'}</span>
                    </div>
                    {index % 4 === 0 && (
                      <div className="text-purple-600 font-medium">
                        {index < 4 ? '🌊 Ocean View' : '🏆 Featured'}
                      </div>
                    )}
                    {index % 4 === 1 && (
                      <div className="text-blue-600 font-medium">
                        ⭐ Top Rated
                      </div>
                    )}
                    {index % 4 === 2 && (
                      <div className="text-cyan-600 font-medium">
                        {index < 4 ? '🌊 Waterfront' : '🏆 Premium'}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          </div>
        </div>
      )}



      <BottomNavigation 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        updateCount={0}
      />
    </div>
  );
};
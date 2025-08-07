import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useLocation } from 'wouter';
import { Search, Filter, List, MapIcon, SlidersHorizontal, X, Star, MapPin, Phone, Globe, Heart, ExternalLink, Home, Moon, Sun, Info, HelpCircle } from 'lucide-react';
import { NavigationHeader } from "@/components/NavigationHeader";
import { BreadcrumbNavigation } from "@/components/BreadcrumbNavigation";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Separator } from '@/components/ui/separator';
import Map from '@/components/Map';
import MapTutorial from '@/components/MapTutorial';
import MapErrorBoundary from '@/components/MapErrorBoundary';
import { EnhancedCommunityCard } from '@/components/EnhancedCommunityCard';
import { VendorCard } from '@/components/VendorCard';
import EnhancedVendorCard from '@/components/EnhancedVendorCard';
import { HealthcareServiceCard } from '@/components/HealthcareServiceCard';
import { ResourceCard } from '@/components/ResourceCard';
import { AISearchInsights } from '@/components/AISearchInsights';
import { useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useDebounce } from '@/hooks/use-debounce';

interface Community {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  careTypes: string[];
  rating: number;
  reviewCount: number;
  phone: string;
  website: string;
  priceRange: string;
  availability: string;
  photos: string[];
  description: string;
}

interface Vendor {
  id: number;
  businessName: string;
  businessType: string;
  city: string;
  state: string;
  address: string;
  phone: string;
  rating: number;
  description: string;
}

interface HealthcareService {
  id: number | string;
  name: string;
  category: string;
  city?: string;
  state?: string;
  location?: string;
  description?: string;
  priceRange?: string;
  availability?: string;
  rating?: number;
  reviewCount?: number;
  isHospital?: boolean;
  phone?: string;
  website?: string;
}

interface Resource {
  id: number;
  title: string;
  type: string;
  category: string;
  description: string;
  url?: string;
}

type SearchResult = {
  type: 'community' | 'vendor' | 'healthcare' | 'resource';
  data: Community | Vendor | HealthcareService | Resource;
};

interface SearchFilters {
  careType: string;
  minRating: number;
  amenities: string[];
  budget: string;
  availability: string;
}

export default function MapSearch() {
  const [, setLocation] = useLocation();

  // Get search query from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const initialQuery = urlParams.get('query') || urlParams.get('location') || urlParams.get('q') || '';
  const budgetParam = urlParams.get('budget') || '';
  const careTypesParam = urlParams.get('careTypes') || '';

  // Map budget values from onboarding to filter values
  const getBudgetFilter = (budget: string) => {
    switch(budget) {
      case 'hud': return 'HUD/Government';
      case 'low': return 'Under $2,000';
      case 'mid': return '$2,000-$4,000';
      case 'high': return '$4,000-$6,000';
      case 'premium': return 'Above $6,000';
      case 'flexible': return 'Any Budget';
      default: return 'Any Budget';
    }
  };

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode for eye comfort
  const [hasSearched, setHasSearched] = useState(false);
  const [resultType, setResultType] = useState<'all' | 'communities' | 'vendors' | 'healthcare' | 'resources'>('all');
  const [filters, setFilters] = useState<SearchFilters>({
    careType: careTypesParam || 'All Types',
    minRating: 0,
    amenities: [],
    budget: getBudgetFilter(budgetParam),
    availability: 'All Status'
  });
  const [mapCenter, setMapCenter] = useState<[number, number]>([37.7749, -122.4194]); // San Francisco - city center
  const [mapZoom, setMapZoom] = useState(12); // City-level zoom (12-14 shows individual locations)
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [mapBounds, setMapBounds] = useState<any>(null);
  const [showBottomPanel, setShowBottomPanel] = useState(false);
  const [panelHeight, setPanelHeight] = useState(70); // Percentage of screen height - increased for better visibility
  const [showTutorial, setShowTutorial] = useState(false);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);
  
  // Drag state for panel resizing
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartHeight, setDragStartHeight] = useState(70);
  
  // Refs for pull-down gesture
  const listContentRef = useRef<HTMLDivElement>(null);
  const [pullDownStart, setPullDownStart] = useState<number | null>(null);
  
  // Autocomplete state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Tutorial disabled - keeping localStorage check for compatibility
  useEffect(() => {
    const hasSeenTutorialBefore = localStorage.getItem('map-tutorial-completed');
    setHasSeenTutorial(true); // Always mark as seen to disable tutorial
  }, []);

  // Debug mapBounds changes
  useEffect(() => {
    console.log('MapBounds updated:', mapBounds ? 'bounds set' : 'bounds null');
    if (mapBounds) {
      console.log('MapBounds details:', {
        sw: mapBounds.getSouthWest(),
        ne: mapBounds.getNorthEast()
      });
    }
  }, [mapBounds]);

  // Tutorial auto-show disabled
  // useEffect(() => {
  //   if (!hasSeenTutorial && viewMode === 'map') {
  //     const timer = setTimeout(() => {
  //       try {
  //         setShowTutorial(true);
  //       } catch (error) {
  //         console.error('Error showing tutorial:', error);
  //       }
  //     }, 2000); // Show tutorial after 2 seconds for first-time users
  //     return () => clearTimeout(timer);
  //   }
  // }, [hasSeenTutorial, viewMode]);

  const handleTutorialComplete = () => {
    console.log('handleTutorialComplete called');
    try {
      localStorage.setItem('map-tutorial-completed', 'true');
      console.log('Tutorial completion saved to localStorage');

      setHasSeenTutorial(true);
      console.log('hasSeenTutorial set to true');

      setShowTutorial(false);
      console.log('showTutorial set to false');

      // Force cleanup of any remaining tutorial elements
      setTimeout(() => {
        document.querySelectorAll('.tutorial-highlight').forEach(el => el.remove());
        console.log('Tutorial cleanup completed');
      }, 100);

    } catch (error) {
      console.error('Error in handleTutorialComplete:', error);
      // Force close tutorial even on error
      setShowTutorial(false);
    }
  };

  const handleStartTutorial = () => {
    setShowTutorial(true);
  };

  // Drag handlers for panel resizing
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setIsDragging(true);
    setDragStartY(clientY);
    setDragStartHeight(panelHeight);
  };

  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const deltaY = dragStartY - clientY;
    const windowHeight = window.innerHeight;
    const deltaPercent = (deltaY / windowHeight) * 100;
    
    // Calculate max height to reach just below navbar (64px navbar + 10px gap = 74px from top)
    const navbarHeight = 74; // pixels
    const maxHeightPercent = ((windowHeight - navbarHeight) / windowHeight) * 100;
    
    const newHeight = Math.min(Math.max(20, dragStartHeight + deltaPercent), maxHeightPercent); // Min 20%, Max to navbar
    
    setPanelHeight(newHeight);
  }, [isDragging, dragStartY, dragStartHeight]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add global mouse/touch move and up listeners when dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      document.addEventListener('touchmove', handleDragMove);
      document.addEventListener('touchend', handleDragEnd);
      
      // Prevent text selection while dragging
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
        document.removeEventListener('touchmove', handleDragMove);
        document.removeEventListener('touchend', handleDragEnd);
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, handleDragMove, handleDragEnd]);

  // Debug log
  console.log('Map Search Component - showBottomPanel:', showBottomPanel, 'viewMode:', viewMode);
  console.log('Tutorial state - hasSeenTutorial:', hasSeenTutorial, 'showTutorial:', showTutorial);
  console.log('Map Search state:', { 
    mapCenter, 
    mapZoom, 
    hasFilters: Object.keys(filters).length > 0,
    mapBounds: mapBounds ? 'set' : 'null'
  });

  // Fetch communities within map bounds for list view
  // Create a stable bounds key for query caching - use higher precision for better accuracy
  const boundsKey = useMemo(() => {
    if (!mapBounds) return 'no-bounds';

    const sw = mapBounds.getSouthWest();
    const ne = mapBounds.getNorthEast();

    // Use 6 decimal places for precise bounds tracking
    return `${sw.lng.toFixed(6)},${sw.lat.toFixed(6)},${ne.lng.toFixed(6)},${ne.lat.toFixed(6)}`;
  }, [mapBounds]);

  // Use direct query data instead of local state to prevent stale data
  // Remove local state management that was causing ordering issues

  const { data: mapCommunities = [], isLoading: isLoadingCommunities, isFetching: isFetchingCommunities, refetch: refetchCommunities, error: communitiesError } = useQuery<Community[]>({
    queryKey: ['communities-map-bounds', boundsKey, showBottomPanel, filters.careType, filters.minRating],
    queryFn: async () => {
      // If we're showing the bottom panel but no bounds yet, fetch default San Francisco area
      if (!mapBounds && showBottomPanel) {
        console.log('No bounds yet, fetching default San Francisco area communities...');
        const params = new URLSearchParams({
          swLat: '37.7000',
          swLng: '-122.5200',
          neLat: '37.8200',
          neLng: '-122.3800',
          limit: '500',
          ...(filters.careType !== 'All Types' && { careType: filters.careType }),
          ...(filters.minRating > 0 && { minRating: filters.minRating.toString() }),
        });

        const response = await fetch(`/api/communities/search/spatial?${params}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch communities: ${response.statusText}`);
        }

        const communities = await response.json();
        console.log('Fetched default area communities:', communities.length);
        return communities;
      }

      if (!mapBounds) return [];

      const startTime = Date.now();
      try {
        console.log('🚀 STARTING COMMUNITY FETCH:', { 
          boundsKey, 
          showBottomPanel, 
          timestamp: startTime,
          mapBounds: mapBounds ? 'present' : 'missing' 
        });

        const sw = mapBounds.getSouthWest();
        const ne = mapBounds.getNorthEast();

        // Check if search includes radius filtering (e.g., "within 25 miles")
        const radiusMatch = searchQuery.match(/within\s+(\d+)\s+miles?/i);
        
        let params: URLSearchParams;
        
        if (radiusMatch) {
          // Radius search mode - use center point and radius
          const center = mapBounds.getCenter();
          params = new URLSearchParams({
            radius: radiusMatch[1],
            centerLat: center.lat.toString(),
            centerLng: center.lng.toString(),
            limit: '500',
            ...(filters.careType !== 'All Types' && { careType: filters.careType }),
            ...(filters.minRating > 0 && { minRating: filters.minRating.toString() }),
          });
          console.log('📍 RADIUS SEARCH MODE:', {
            radius: radiusMatch[1],
            center: { lat: center.lat, lng: center.lng },
            showBottomPanel
          });
        } else {
          // Default map bounds mode for pan/zoom
          // No buffer - use exact viewport bounds for precise list synchronization
          const latBuffer = 0;
          const lngBuffer = 0;

          params = new URLSearchParams({
            swLat: (sw.lat - latBuffer).toString(),
            swLng: (sw.lng - lngBuffer).toString(),
            neLat: (ne.lat + latBuffer).toString(),
            neLng: (ne.lng + lngBuffer).toString(),
            limit: '500',
            ...(filters.careType !== 'All Types' && { careType: filters.careType }),
            ...(filters.minRating > 0 && { minRating: filters.minRating.toString() }),
          });
          console.log('📍 BOUNDS SEARCH MODE:', {
            sw: { lat: sw.lat, lng: sw.lng },
            ne: { lat: ne.lat, lng: ne.lng },
            showBottomPanel
          });
        }

        const requestUrl = `/api/communities/search/spatial?${params}`;
        console.log('🌐 MAKING SPATIAL REQUEST:', {
          url: requestUrl,
          origin: window.location.origin,
          requestStartTime: Date.now()
        });

        const fetchStartTime = Date.now();
        const response = await fetch(requestUrl, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(7000) // 7 second timeout for individual requests
        });

        const fetchEndTime = Date.now();
        console.log('⏱️ FETCH COMPLETED:', {
          duration: fetchEndTime - fetchStartTime,
          status: response.status,
          ok: response.ok
        });

        if (!response.ok) {
          const errorDetails = {
            status: response.status, 
            statusText: response.statusText,
            url: response.url,
            origin: window.location.origin,
            href: window.location.href,
            fetchDuration: fetchEndTime - fetchStartTime
          };
          console.error('❌ SPATIAL SEARCH FAILED:', errorDetails);
          throw new Error(`Failed to fetch communities: ${response.status} ${response.statusText}`);
        }

        const parseStartTime = Date.now();
        const data = await response.json();
        const parseEndTime = Date.now();

        const totalTime = parseEndTime - startTime;
        console.log('✅ SPATIAL SEARCH SUCCESS:', {
          count: data.length,
          firstCommunity: data[0] ? `${data[0].name} (${data[0].city})` : 'none',
          allNames: data.slice(0, 10).map((c: any) => `${c.name} (${c.city})`),
          boundsKey,
          timing: {
            total: totalTime,
            fetch: fetchEndTime - fetchStartTime,
            parse: parseEndTime - parseStartTime
          },
          timestamp: parseEndTime
        });
        return data;
      } catch (error: any) {
        const errorTime = Date.now();
        console.error('💥 COMMUNITY FETCH ERROR:', {
          error: error?.message || 'Unknown error',
          boundsKey,
          totalTime: errorTime - startTime,
          timestamp: errorTime,
          stack: error?.stack
        });
        throw error; // Re-throw to trigger React Query error handling
      }
    },
    enabled: (showBottomPanel && !!mapBounds) || (!!mapBounds && !showBottomPanel), // Always fetch when we have bounds
    staleTime: 5000, // Cache for 5 seconds to prevent excessive requests
    gcTime: 15000, // Keep in cache for 15 seconds
    retry: 1, // Only retry once on failure - faster timeout
    refetchOnMount: false, // Don't always refetch on mount
    refetchOnWindowFocus: false,
    // timeout: 8000, // 8 second timeout for queries - not supported in React Query
  });

  // State for expanded search
  const [showExpandedSearch, setShowExpandedSearch] = useState(false);
  
  // Fetch vendors within map bounds
  const { data: vendors = [], isLoading: isLoadingVendors } = useQuery({
    queryKey: ['vendors-map-bounds', boundsKey, showBottomPanel],
    queryFn: async () => {
      if (!mapBounds || resultType === 'communities' || resultType === 'healthcare' || resultType === 'resources') return [];
      
      const sw = mapBounds.getSouthWest();
      const ne = mapBounds.getNorthEast();
      
      const params = new URLSearchParams({
        swLat: sw.lat.toString(),
        swLng: sw.lng.toString(),
        neLat: ne.lat.toString(),
        neLng: ne.lng.toString(),
        limit: '50'
      });
      
      const response = await fetch(`/api/vendors/search/spatial?${params}`);
      if (!response.ok) return [];
      
      return response.json();
    },
    enabled: showBottomPanel && !!mapBounds && (resultType === 'all' || resultType === 'vendors'),
    staleTime: 5000,
    gcTime: 15000
  });
  
  // Fetch healthcare services and hospitals
  const { data: healthcareServices = [], isLoading: isLoadingHealthcare } = useQuery({
    queryKey: ['healthcare-services', searchQuery, boundsKey, resultType],
    queryFn: async () => {
      if (resultType === 'communities' || resultType === 'vendors' || resultType === 'resources') return [];
      
      // Build query params
      const params = new URLSearchParams({
        q: searchQuery,
        limit: '50'
      });
      
      // Check if search includes radius filtering (e.g., "within 25 miles")
      const radiusMatch = searchQuery.match(/within\s+(\d+)\s+miles?/i);
      if (radiusMatch) {
        params.append('radius', radiusMatch[1]);
        // For radius searches, include center point if available
        if (mapBounds) {
          const center = mapBounds.getCenter();
          params.append('centerLat', center.lat.toString());
          params.append('centerLng', center.lng.toString());
        }
      } else if (mapBounds) {
        // Default behavior: use map bounds for filtering (pan/zoom)
        const sw = mapBounds.getSouthWest();
        const ne = mapBounds.getNorthEast();
        params.append('swLat', sw.lat.toString());
        params.append('swLng', sw.lng.toString());
        params.append('neLat', ne.lat.toString());
        params.append('neLng', ne.lng.toString());
      }
      
      const response = await fetch(`/api/healthcare/search?${params}`);
      if (!response.ok) return [];
      
      const data = await response.json();
      console.log('Healthcare data fetched:', data.length, 'items (hospitals + services)');
      return data;
    },
    enabled: showBottomPanel && (resultType === 'all' || resultType === 'healthcare'),
    staleTime: 10000,
    gcTime: 30000
  });
  
  // Fetch resources
  const { data: resources = [], isLoading: isLoadingResources } = useQuery({
    queryKey: ['resources', searchQuery],
    queryFn: async () => {
      if (resultType === 'communities' || resultType === 'vendors' || resultType === 'healthcare') return [];
      
      const response = await fetch(`/api/resources/search?q=${encodeURIComponent(searchQuery)}&limit=20`);
      if (!response.ok) return [];
      
      return response.json();
    },
    enabled: showBottomPanel && searchQuery.length > 0 && (resultType === 'all' || resultType === 'resources'),
    staleTime: 10000,
    gcTime: 30000
  });

  // Remove complex local state management - use query data directly

  // Aggressive debug logging for communities
  useEffect(() => {
    console.log('🔄 COMMUNITIES STATE UPDATE:', {
      mapCount: mapCommunities.length,
      isLoading: isLoadingCommunities,
      isFetching: isFetchingCommunities,
      hasBounds: !!mapBounds,
      showBottomPanel,
      error: communitiesError ? communitiesError.message : null,
      mapCommunities: mapCommunities.slice(0, 5).map((c: Community) => `${c.name} (${c.city})`),
      boundsKey: boundsKey,
      timestamp: Date.now()
    });

    if (communitiesError) {
      console.error('🚨 COMMUNITIES ERROR DETAILS:', communitiesError);
    }
  }, [mapCommunities, isLoadingCommunities, isFetchingCommunities, mapBounds, showBottomPanel, boundsKey, communitiesError]);

  // State to track if we're waiting for initial load
  const [isInitialLoad, setIsInitialLoad] = useState(false);
  const [isMapMoving, setIsMapMoving] = useState(false);

  // Track bounds changes for forced refetch
  const prevBoundsRef = useRef(boundsKey);
  useEffect(() => {
    if (mapBounds && showBottomPanel && prevBoundsRef.current !== boundsKey) {
      console.log('Bounds changed, will refetch on next query...', {
        prevBounds: prevBoundsRef.current,
        newBounds: boundsKey,
        showBottomPanel,
        timestamp: Date.now()
      });
      prevBoundsRef.current = boundsKey;
      // Let React Query handle the refetch automatically via key change
    }
  }, [boundsKey, showBottomPanel]);

  // Fetch expanded search results when no communities in current view
  const { data: expandedCommunities = [], isLoading: isLoadingExpanded } = useQuery({
    queryKey: ['communities-expanded-search', mapBounds],
    queryFn: async () => {
      if (!mapBounds) return [];

      try {
        // Get center of current map view
        const center = mapBounds.getCenter();
        const centerLat = center.lat;
        const centerLng = center.lng;

        // Search for closest communities within a larger radius (100km)
        const response = await fetch(`/api/communities/search/nearest?lat=${centerLat}&lng=${centerLng}&radius=100&limit=20`);
        if (!response.ok) throw new Error('Failed to fetch expanded communities');
        return response.json();
      } catch (error) {
        console.error('Error fetching expanded communities:', error);
        return [];
      }
    },
    enabled: !!mapBounds && showBottomPanel && showExpandedSearch,
    staleTime: 30000,
    retry: 1,
  });

  interface AutocompleteSuggestion {
    label: string;
    value: string;
    type: string;
    id?: number;
    description?: string;
  }
  
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Fetch autocomplete suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedSearchQuery && debouncedSearchQuery.length >= 2) {
        setLoadingSuggestions(true);
        try {
          const response = await fetch(
            `/api/autocomplete/suggestions?query=${encodeURIComponent(debouncedSearchQuery)}&limit=8&type=${resultType}`
          );
          if (response.ok) {
            const data = await response.json();
            setSuggestions(data.suggestions || []);
            setShowSuggestions(true);
          }
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        } finally {
          setLoadingSuggestions(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    fetchSuggestions();
  }, [debouncedSearchQuery, resultType]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSuggestionClick = (suggestion: AutocompleteSuggestion | string) => {
    const value = typeof suggestion === 'string' ? suggestion : suggestion.value;
    setSearchQuery(value);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    handleLocationSearch(value);
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < suggestions.length) {
        handleSuggestionClick(suggestions[selectedSuggestionIndex]);
      } else if (searchQuery) {
        handleLocationSearch(searchQuery);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  }

  const handleLocationSearch = async (location: string) => {
    if (!location || location.trim() === '') return;

    setHasSearched(true);
    console.log('🔍 Searching for location:', location);
    
    // Clear any existing map bounds to force a fresh search
    setMapBounds(null);
    setShowBottomPanel(false); // Hide panel during search

    // Try to geocode the location using enhanced API
    try {
      // First try the enhanced API with filters if we have them
      const careTypeFilter = filters.careType !== 'All Types' ? `&careType=${encodeURIComponent(filters.careType)}` : '';
      const budgetFilter = filters.budget !== 'Any Budget' ? `&budget=${encodeURIComponent(filters.budget)}` : '';
      
      const response = await fetch(`/api/communities/search/enhanced?location=${encodeURIComponent(location)}&limit=50${careTypeFilter}${budgetFilter}`);
      console.log('Enhanced API response status:', response.status, 'for location:', location);

      if (response.ok) {
        const data = await response.json();
        console.log('Enhanced API data:', data);

        // PRIORITY 1: Check if metadata has coordinates (this is the primary fix!)
        if (data.searchMetadata?.coordinates) {
          console.log('✅ Using searchMetadata coordinates:', data.searchMetadata.coordinates);
          setMapCenter([data.searchMetadata.coordinates.lat, data.searchMetadata.coordinates.lng]);
          setMapZoom(data.searchMetadata.searchType === 'state' ? 7 : 
                    data.searchMetadata.searchType === 'city' ? 12 : 10);
          // Delay showing panel to allow map to update first
          setTimeout(() => {
            setShowBottomPanel(true); // Show results
          }, 500);
          return;
        }

        // PRIORITY 2: Fallback to first community coordinates if no metadata
        if (data.communities && data.communities.length > 0) {
          const firstCommunity = data.communities[0];
          if (firstCommunity.latitude && firstCommunity.longitude) {
            console.log('✅ Using first community coordinates:', firstCommunity);
            setMapCenter([firstCommunity.latitude, firstCommunity.longitude]);
            setMapZoom(12);
            // Delay showing panel to allow map to update first
            setTimeout(() => {
              setShowBottomPanel(true); // Show results
            }, 500);
            return;
          }
        }
      }
    } catch (error) {
      console.error('Error searching location:', error);
    }

    console.log('Enhanced API failed, falling back to location map...');


    // Fallback to comprehensive North American location mapping
    const locationMap: Record<string, [number, number]> = {
      // === UNITED STATES ===
      // Major US States (all 50 covered by MySeniorValet)
      'california': [36.7783, -119.4179],
      'texas': [31.9686, -99.9018],
      'florida': [27.7663, -81.6868],
      'new york': [42.1657, -74.9481],
      'pennsylvania': [40.5908, -77.2098],
      'illinois': [40.3495, -88.9861],
      'ohio': [40.3888, -82.7649],
      'georgia': [33.0406, -83.6431],
      'north carolina': [35.5397, -79.8431],
      'michigan': [43.3266, -84.5361],
      'new jersey': [40.2989, -74.5210],
      'virginia': [37.7693, -78.2057],
      'washington': [47.0379, -121.0187],
      'arizona': [33.7712, -111.3877],
      'massachusetts': [42.2373, -71.5314],
      'tennessee': [35.7478, -86.6923],
      'indiana': [39.8494, -86.2583],
      'missouri': [38.4561, -92.2884],
      'maryland': [39.0639, -76.8021],
      'wisconsin': [44.2619, -89.6165],
      'colorado': [39.0598, -105.3111],
      'minnesota': [45.6945, -93.9002],
      'south carolina': [33.8191, -80.9066],
      'alabama': [32.5331, -86.9023],
      'louisiana': [31.1695, -91.8678],
      'kentucky': [37.6681, -84.6701],
      'oregon': [44.5722, -122.0709],
      'oklahoma': [35.5653, -96.9289],
      'connecticut': [41.5978, -72.7555],
      'utah': [40.1135, -111.8535],
      'iowa': [42.0115, -93.2105],
      'nevada': [38.4199, -116.4069],
      'arkansas': [34.9513, -92.3809],
      'mississippi': [32.7673, -89.6812],
      'kansas': [38.5111, -96.8005],
      'new mexico': [34.8405, -106.2485],
      'nebraska': [41.1254, -98.2681],
      'west virginia': [38.4680, -80.9696],
      'idaho': [44.2394, -114.5103],
      'hawaii': [21.0943, -157.4983],
      'new hampshire': [43.4525, -71.5639],
      'maine': [44.6939, -69.3819],
      'montana': [47.0527, -110.2140],
      'rhode island': [41.6809, -71.5118],
      'delaware': [39.3185, -75.5071],
      'south dakota': [44.2998, -99.4388],
      'north dakota': [47.5362, -99.7930],
      'alaska': [61.2181, -149.9003],
      'vermont': [44.0459, -72.7107],
      'wyoming': [42.7559, -107.3025],

      // Major US Cities (comprehensive coverage)
      'new york city': [40.7128, -74.0060],
      'los angeles': [34.0522, -118.2437],
      'chicago': [41.8781, -87.6298],
      'houston': [29.7604, -95.3698],
      'phoenix': [33.4484, -112.0740],
      'philadelphia': [39.9526, -75.1652],
      'san antonio': [29.4241, -98.4936],
      'san diego': [32.7157, -117.1611],
      'dallas': [32.7767, -96.7970],
      'san jose': [37.3382, -121.8863],
      'austin': [30.2672, -97.7431],
      'jacksonville': [30.3322, -81.6557],
      'san francisco': [37.7749, -122.4194],
      'columbus': [39.9612, -82.9988],
      'fort worth': [32.7555, -97.3308],
      'indianapolis': [39.7684, -86.1581],
      'charlotte': [35.2271, -80.8431],
      'seattle': [47.6062, -122.3321],
      'denver': [39.7392, -104.9903],
      'washington dc': [38.9072, -77.0369],
      'boston': [42.3601, -71.0589],
      'el paso': [31.7619, -106.4850],
      'detroit': [42.3314, -83.0458],
      'nashville': [36.1627, -86.7816],
      'portland': [45.5152, -122.6784],
      'memphis': [35.1495, -90.0490],
      'oklahoma city': [35.4676, -97.5164],
      'las vegas': [36.1699, -115.1398],
      'louisville': [38.2527, -85.7585],
      'baltimore': [39.2904, -76.6122],
      'milwaukee': [43.0389, -87.9065],
      'albuquerque': [35.0844, -106.6504],
      'tucson': [32.2226, -110.9747],
      'fresno': [36.7378, -119.7871],
      'sacramento': [38.5816, -121.4944],
      'mesa': [33.4152, -111.8315],
      'kansas city': [39.0997, -94.5786],
      'atlanta': [33.7490, -84.3880],
      'long beach': [33.7701, -118.1937],
      'omaha': [41.2565, -95.9345],
      'raleigh': [35.7796, -78.6382],
      'colorado springs': [38.8339, -104.8214],
      'miami': [25.7617, -80.1918],
      'virginia beach': [36.8529, -75.9780],
      'oakland': [37.8044, -122.2711],
      'minneapolis': [44.9778, -93.2650],
      'tulsa': [36.1540, -95.9928],
      'arlington': [32.7357, -97.1081],
      'tampa': [27.9506, -82.4572],
      'new orleans': [29.9511, -90.0715],
      'wichita': [37.6872, -97.3301],
      'cleveland': [41.4993, -81.6944],
      'bakersfield': [35.3733, -119.0187],
      'aurora': [39.7294, -104.8319],
      'anaheim': [33.8366, -117.9143],
      'honolulu': [21.3099, -157.8581],
      'santa ana': [33.7456, -117.8678],
      'riverside': [33.9806, -117.3755],
      'corpus christi': [27.8006, -97.3964],
      'lexington': [38.0406, -84.5037],
      'stockton': [37.9577, -121.2908],
      'henderson': [36.0395, -114.9817],
      'saint paul': [44.9537, -93.0900],
      'st louis': [38.6270, -90.1994],
      'cincinnati': [39.1031, -84.5120],
      'pittsburgh': [40.4406, -79.9959],

      // Additional Florida Cities
      'panama city': [30.1588, -85.6602],
      'panama city florida': [30.1588, -85.6602],
      'tallahassee': [30.4383, -84.2807],
      'gainesville': [29.6516, -82.3248],
      'fort lauderdale': [26.1224, -80.1373],
      'orlando': [28.5383, -81.3792],
      'pensacola': [30.4213, -87.2169],
      'fort myers': [26.6406, -81.8723],
      'naples': [26.1420, -81.7948],
      'daytona beach': [29.2108, -81.0228],
      'sarasota': [27.3364, -82.5307],
      'west palm beach': [26.7153, -80.0534],
      'clearwater': [27.9659, -82.8001],
      'lakeland': [28.0395, -81.9498],
      'palm bay': [28.0345, -80.5887],
      'st petersburg': [27.7676, -82.6403],
      'cape coral': [26.5629, -81.9495],
      'port st lucie': [27.2730, -80.3582],
      'ocala': [29.1872, -82.1401],
      'kissimmee': [28.2920, -81.4076],
      'bradenton': [27.4989, -82.5748],
      'boca raton': [26.3683, -80.1289],
      'melbourne': [28.0836, -80.6081],
      'palm beach': [26.7056, -80.0364],
      'deltona': [28.9005, -81.2637],
      'vero beach': [27.6386, -80.3973],
      'jupiter': [26.9342, -80.0942],
      'delray beach': [26.4615, -80.0728],
      'venice': [27.0998, -82.4543],
      'titusville': [28.6122, -80.8076],
      'sanford': [28.8028, -81.2690],
      'bonita springs': [26.3398, -81.7787],
      'palm coast': [29.5497, -81.2234],

      // === CANADA ===
      // Major Canadian Provinces/Territories (all covered by MySeniorValet)
      'ontario': [51.2538, -85.3232],
      'quebec': [52.9399, -73.5491],
      'british columbia': [53.7267, -127.6476],
      'alberta': [53.9333, -116.5765],
      'manitoba': [53.7609, -98.8139],
      'saskatchewan': [52.9399, -106.4509],
      'nova scotia': [44.6820, -63.7443],
      'new brunswick': [46.5653, -66.4619],
      'newfoundland': [53.1355, -57.6604],
      'prince edward island': [46.5107, -63.4168],
      'northwest territories': [61.2181, -113.5570],
      'yukon': [64.0685, -139.0686],
      'nunavut': [70.2998, -83.1076],

      // Major Canadian Cities
      'toronto': [43.6532, -79.3832],
      'montreal': [45.5017, -73.5673],
      'vancouver': [49.2827, -123.1207],
      'calgary': [51.0447, -114.0719],
      'edmonton': [53.5461, -113.4938],
      'ottawa': [45.4215, -75.6972],
      'winnipeg': [49.8951, -97.1384],
      'quebec city': [46.8139, -71.2080],
      'hamilton': [43.2557, -79.8711],
      'kitchener': [43.4643, -80.5204],
      'london': [42.9849, -81.2453],
      'victoria': [48.4284, -123.3656],
      'halifax': [44.6488, -63.5752],
      'oshawa': [43.8971, -78.8658],
      'windsor': [42.3149, -83.0364],
      'saskatoon': [52.1579, -106.6702],
      'regina': [50.4452, -104.6189],
      'sherbrooke': [45.4042, -71.8929],
      'barrie': [44.3894, -79.6903],
      'kelowna': [49.8880, -119.4960],
      'abbotsford': [49.0504, -122.3045],
      'kingston': [44.2312, -76.4860],
      'sudbury': [46.4917, -80.9930],
      'saguenay': [48.3350, -71.0733],
      'thunder bay': [48.3809, -89.2477],
      'kamloops': [50.6745, -120.3273],
      'nanaimo': [49.1659, -123.9401],
      'saint john': [45.2733, -66.0633],
      'moncton': [46.0878, -64.7782],
      'red deer': [52.2681, -113.8112],
      'lethbridge': [49.7016, -112.8414],
      'medicine hat': [50.0265, -110.6769],

      // === MEXICO ===
      // Mexican States (MySeniorValet covers all 32 states)
      'mexico city': [19.4326, -99.1332],
      'guadalajara': [20.6597, -103.3496],
      'monterrey': [25.6866, -100.3161],
      'puebla': [19.0414, -98.2063],
      'tijuana': [32.5027, -117.0039],
      'león': [21.1619, -101.6921],
      'juarez': [31.6904, -106.4245],
      'torreon': [25.5428, -103.4068],
      'querétaro': [20.5888, -100.3899],
      'san luis potosí': [22.1565, -100.9855],
      'mérida': [20.9674, -89.5926],
      'mexicali': [32.6245, -115.4523],
      'aguascalientes': [21.8853, -102.2916],
      'cuernavaca': [18.9261, -99.2319],
      'saltillo': [25.4232, -101.0053],
      'hermosillo': [29.0729, -110.9559],
      'cancun': [21.1619, -86.8515],
      'chihuahua': [28.6353, -106.0889],
      'morelia': [19.7069, -101.1956],
      'veracruz': [19.1738, -96.1342],
      'villahermosa': [17.9892, -92.9475],
      'tuxtla gutierrez': [16.7516, -93.1161],
      'acapulco': [16.8531, -99.8237],
      'culiacán': [24.7999, -107.3841],
      'durango': [24.0277, -104.6532],
      'oaxaca': [17.0732, -96.7266],
      'tampico': [22.2908, -97.8475],
      'reynosa': [26.0895, -98.2888],
      'toluca': [19.2926, -99.6568],
      'mazatlán': [23.2494, -106.4103],

      // === US TERRITORIES ===
      'puerto rico': [18.2208, -66.5901],
      'san juan': [18.4655, -66.1057],
      'bayamon': [18.3985, -66.1548],
      'carolina': [18.3813, -65.9579],
      'ponce': [18.0111, -66.6141],
      'caguas': [18.2342, -66.0308],
      'guaynabo': [18.3679, -66.1081],
      'arecibo': [18.4508, -66.7203],
      'mayaguez': [18.2016, -67.1397],

      // === CONTINENTAL LEVEL ===
      'north america': [45.0, -100.0],
      'canada': [56.1304, -106.3468],
      'united states': [39.8283, -98.5795],
      'usa': [39.8283, -98.5795],
      'mexico': [23.6345, -102.5528],
    };

    const coords = locationMap[location.toLowerCase()];
    if (coords) {
      setMapCenter(coords);
      // Set appropriate zoom levels based on location type
      const lowerLocation = location.toLowerCase();
      if (lowerLocation === 'california' || lowerLocation === 'texas' || lowerLocation === 'florida' || 
          lowerLocation === 'ontario' || lowerLocation === 'quebec' || lowerLocation === 'british columbia') {
        setMapZoom(6); // Large states/provinces
      } else if (['alaska', 'montana', 'new mexico', 'arizona', 'colorado', 'wyoming', 'nevada', 'utah', 'idaho'].includes(lowerLocation)) {
        setMapZoom(7); // Medium-large states
      } else if (lowerLocation.includes('mexico') && !lowerLocation.includes('new mexico')) {
        setMapZoom(5); // Country-level Mexico
      } else if (['canada', 'united states', 'usa', 'north america'].includes(lowerLocation)) {
        setMapZoom(4); // Continental level
      } else {
        setMapZoom(12); // Cities and smaller areas
      }
      setShowBottomPanel(true); // Show results panel when using fallback location
    }
  };

  // Handle initial search query from URL and onboarding data
  useEffect(() => {
    if (initialQuery && !hasSearched) {
      console.log('Performing initial search with onboarding data:', {
        location: initialQuery,
        budget: budgetParam,
        careTypes: careTypesParam
      });
      
      // Apply filters and then search
      let newFilters = { ...filters };
      
      // Apply budget filter from onboarding
      if (budgetParam) {
        newFilters.budget = getBudgetFilter(budgetParam);
      }
      
      // Apply care type filter from onboarding
      if (careTypesParam) {
        // The careTypes param might be a comma-separated list
        const firstCareType = careTypesParam.split(',')[0];
        if (firstCareType) {
          newFilters.careType = firstCareType;
        }
      }
      
      // Set filters and perform search
      setFilters(newFilters);
      
      // Small delay to ensure filters are set
      setTimeout(() => {
        handleLocationSearch(initialQuery);
      }, 100);
    }
  }, []); // Only run once on mount



  const handleCommunityClick = (community: Community) => {
    setSelectedCommunity(community);
    setLocation('/communities/' + community.id);
  };

  // Handle map bounds change with enhanced debugging and forced refresh
  const handleMapBoundsChange = useCallback((bounds: any) => {
    console.log('🗺️ MAP BOUNDS CHANGE DETECTED:', {
      bounds: bounds ? 
        bounds.getSouthWest().lng + ',' + bounds.getSouthWest().lat + ',' + bounds.getNorthEast().lng + ',' + bounds.getNorthEast().lat : 
        'null',
      previousBounds: mapBounds ? 
        mapBounds.getSouthWest().lng + ',' + mapBounds.getSouthWest().lat + ',' + mapBounds.getNorthEast().lng + ',' + mapBounds.getNorthEast().lat : 
        'null',
      showBottomPanel,
      currentCommunities: mapCommunities.length,
      timestamp: Date.now()
    });

    if (bounds) {
      setMapBounds(bounds);
      setIsMapMoving(true);

      // Force query invalidation to ensure fresh data
      if (showBottomPanel) {
        queryClient.invalidateQueries({ queryKey: ['communities-spatial'] });
      }

      setTimeout(() => setIsMapMoving(false), 800); // Shorter timeout for better UX
    }
  }, [mapBounds, showBottomPanel, mapCommunities.length, queryClient]);

  // Force initial bounds when map center changes from search OR panel opens
  useEffect(() => {
    if ((hasSearched && !mapBounds) || (showBottomPanel && !mapBounds)) {
      console.log('🚀 FORCING INITIAL LOAD:', { hasSearched, showBottomPanel, mapBounds: !!mapBounds });
      // Force a small delay to ensure map is ready
      setTimeout(() => {
        if (!mapBounds) {
          console.log('⚡ Forcing map to report bounds for initial load...');
          // Force map to report its bounds by triggering a minimal change
          setMapZoom(prev => prev === 12 ? 12.01 : 12);
        }
      }, 200); // Reduced delay for faster initial load
    }
  }, [hasSearched, mapBounds, showBottomPanel]);

  // Force query when panel opens with existing bounds
  useEffect(() => {
    if (showBottomPanel && mapBounds && mapCommunities.length === 0) {
      console.log('🔄 PANEL OPENED WITH BOUNDS - FORCING QUERY:', {
        mapBounds: mapBounds ? 
          mapBounds.getSouthWest().lng + ',' + mapBounds.getSouthWest().lat + ',' + mapBounds.getNorthEast().lng + ',' + mapBounds.getNorthEast().lat : 
          'null',
        timestamp: Date.now()
      });
      queryClient.invalidateQueries({ queryKey: ['communities-spatial'] });
    }
  }, [showBottomPanel, mapBounds, mapCommunities.length, queryClient]);

  const handleClusterClick = (clusterId: number, lat: number, lng: number, zoomLevel: number) => {
    // FIXED: Do not switch to list view automatically on cluster clicks
    // Let users manually control view mode via the floating button
    // The Map component will handle the zoom-in functionality
    console.log('Cluster ' + clusterId + ' clicked at zoom ' + zoomLevel + ' - staying in map view for drill-down');
  };

  const availableAmenities = [
    'Pet Friendly',
    'Fitness Center',
    'Swimming Pool',
    'Transportation',
    'Dining Services',
    'Laundry Services',
    'Housekeeping',
    'Activities Program',
    'Beauty/Barber Shop',
    'Library',
    'Chapel Services',
    'Memory Care',
    'Rehabilitation Services'
  ];

  const clearFilters = () => {
    setFilters({
      careType: 'All Types',
      minRating: 0,
      amenities: [],
      budget: 'Any Budget',
      availability: 'All Status'
    });
  };

  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== 'All Types' && value !== 'Any Budget' && value !== 'All Status' && 
    value !== 0 && (Array.isArray(value) ? value.length > 0 : true)
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
      {/* Header */}
      <div className={"shadow-sm border-b " + (isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700')}>
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/')}
                className={isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white'}
              >
                ← Back
              </Button>
              <div 
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setLocation('/')}
              >
                <Home className="w-5 h-5 text-blue-600" />
                <span className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  MySeniorValet
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Tutorial Help Button - Only show in map mode */}
              {viewMode === 'map' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleStartTutorial}
                  className={isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white'}
                  title="Map Navigation Tutorial"
                >
                  <HelpCircle className="w-4 h-4" />
                </Button>
              )}

              {/* Dark Mode Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white'}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>

              {/* View Mode Toggles - List button opens bottom panel */}
              <div className="flex items-center gap-1 bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setViewMode('map');
                    setShowBottomPanel(false);
                  }}
                  className={"relative transition-all duration-300 " + (
                    viewMode === 'map' && !showBottomPanel
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105' 
                      : isDarkMode 
                      ? 'text-gray-300 hover:text-white hover:bg-gray-600' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white hover:bg-gray-100 dark:bg-gray-700'
                  )}
                >
                  <MapIcon className="w-4 h-4" />
                  {viewMode === 'map' && !showBottomPanel && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-md opacity-20"></div>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setViewMode('map'); // Stay in map mode
                    setShowBottomPanel(true); // Open bottom panel for list
                    // Force refresh communities when list is opened
                    console.log('List clicked, refreshing communities...');
                    refetchCommunities();
                  }}
                  className={"relative transition-all duration-300 " + (
                    showBottomPanel 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105' 
                      : isDarkMode 
                      ? 'text-gray-300 hover:text-white hover:bg-gray-600' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white hover:bg-gray-100 dark:bg-gray-700'
                  )}
                >
                  <List className="w-4 h-4" />
                  {showBottomPanel && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-md opacity-20"></div>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <div className={"border-b " + (isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700')}>
        <div className="max-w-7xl mx-auto">
          <BreadcrumbNavigation 
            items={[
              { label: 'Home', href: '/' },
              { label: 'Map Search' }
            ]}
          />
        </div>
      </div>

      {/* Search Bar */}
      <div className={"border-b p-4 " + (isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700')}>
        <form onSubmit={(e) => {
          e.preventDefault();
          handleLocationSearch(searchQuery);
          setShowSuggestions(false);
        }} className="flex gap-2">
          <div className="relative flex-1" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search city, state or ZIP code"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedSuggestionIndex(-1);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (suggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              className={"pl-10 " + (isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500' 
                : 'bg-white dark:bg-gray-800 border-gray-300 text-gray-900 dark:text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500'
              )}
            />
            
            {/* Autocomplete Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                {loadingSuggestions && (
                  <div className="px-4 py-2 text-gray-500 dark:text-gray-400 text-sm">
                    Loading suggestions...
                  </div>
                )}
                {!loadingSuggestions && suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`px-4 py-2.5 cursor-pointer transition-colors ${
                      index === selectedSuggestionIndex
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100'
                    } ${index !== suggestions.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    onMouseEnter={() => setSelectedSuggestionIndex(index)}
                  >
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm">{typeof suggestion === 'string' ? suggestion : suggestion.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Removed duplicate autocomplete suggestions - using the one above */}
          </div>
          <Button 
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Search
          </Button>
        </form>
      </div>

      {/* Filters Bar */}
      <div className={"border-b p-2 " + (isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700')}>
        <div className="flex items-center gap-2 overflow-x-auto">
          <Drawer>
            <DrawerTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className={isDarkMode 
                  ? 'border-gray-600 bg-gray-700 text-white hover:bg-gray-600' 
                  : 'border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:bg-gray-800'
                }
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="destructive" className="ml-2 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Filter Communities</DrawerTitle>
              </DrawerHeader>
              <div className="p-4 space-y-4">
                {/* Care Type Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Care Type</label>
                  <Select value={filters.careType} onValueChange={(value) => setFilters({...filters, careType: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Types">All Types</SelectItem>
                      <SelectItem value="Independent Living">Independent Living</SelectItem>
                      <SelectItem value="Assisted Living">Assisted Living</SelectItem>
                      <SelectItem value="Memory Care">Memory Care</SelectItem>
                      <SelectItem value="Skilled Nursing">Skilled Nursing</SelectItem>
                      <SelectItem value="Continuing Care">Continuing Care</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Budget Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Budget</label>
                  <Select value={filters.budget} onValueChange={(value) => setFilters({...filters, budget: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Any Budget">Any Budget</SelectItem>
                      <SelectItem value="Under $3,000">Under $3,000</SelectItem>
                      <SelectItem value="$3,000 - $5,000">$3,000 - $5,000</SelectItem>
                      <SelectItem value="$5,000 - $7,000">$5,000 - $7,000</SelectItem>
                      <SelectItem value="$7,000+">$7,000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Minimum Rating</label>
                  <Select value={filters.minRating.toString()} onValueChange={(value) => setFilters({...filters, minRating: parseInt(value)})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Any Rating</SelectItem>
                      <SelectItem value="3">3+ Stars</SelectItem>
                      <SelectItem value="4">4+ Stars</SelectItem>
                      <SelectItem value="5">5 Stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Amenities Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Amenities</label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableAmenities.map((amenity) => (
                      <Button
                        key={amenity}
                        variant={filters.amenities.includes(amenity) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          const newAmenities = filters.amenities.includes(amenity)
                            ? filters.amenities.filter(a => a !== amenity)
                            : [...filters.amenities, amenity];
                          setFilters({...filters, amenities: newAmenities});
                        }}
                      >
                        {amenity}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={clearFilters} variant="outline" className="flex-1">
                    Clear All
                  </Button>
                  <Button className="flex-1">Apply Filters</Button>
                </div>
              </div>
            </DrawerContent>
          </Drawer>

          {/* Map Legend Info Button - Only in Map View */}
          {viewMode === 'map' && (
            <Drawer>
              <DrawerTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={isDarkMode 
                    ? 'border-gray-600 bg-gray-700 text-white hover:bg-gray-600' 
                    : 'border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:bg-gray-800'
                  }
                >
                  <Info className="w-4 h-4 mr-2" />
                  Legend
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Map Legend</DrawerTitle>
                </DrawerHeader>
                <div className="p-4 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        #
                      </div>
                      <span className="text-sm">Cluster (Multiple Communities)</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                      <span className="text-sm">General Community</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                      <span className="text-sm">Assisted Living</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-red-600 rounded-full"></div>
                      <span className="text-sm">Memory Care</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
                      <span className="text-sm">Independent Living</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Click on markers to view community details. Click on clusters to zoom in and see individual communities.
                    </p>
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          )}

          {/* Active Filters */}
          {filters.careType !== 'All Types' && (
            <Badge variant="secondary" className={"gap-1 " + (isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 dark:text-gray-200 hover:bg-gray-300')}>
              {filters.careType}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters({...filters, careType: 'All Types'})} />
            </Badge>
          )}
          {filters.budget !== 'Any Budget' && (
            <Badge variant="secondary" className={"gap-1 " + (isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 dark:text-gray-200 hover:bg-gray-300')}>
              {filters.budget}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters({...filters, budget: 'Any Budget'})} />
            </Badge>
          )}
          {filters.minRating > 0 && (
            <Badge variant="secondary" className={"gap-1 " + (isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 dark:text-gray-200 hover:bg-gray-300')}>
              {filters.minRating}+ Stars
              <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters({...filters, minRating: 0})} />
            </Badge>
          )}
          {filters.amenities.map((amenity) => (
            <Badge key={amenity} variant="secondary" className={"gap-1 " + (isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 dark:text-gray-200 hover:bg-gray-300')}>
              {amenity}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => setFilters({...filters, amenities: filters.amenities.filter(a => a !== amenity)})} 
              />
            </Badge>
          ))}
        </div>
      </div>

      {/* Map Container - Always show map */}
      <div className="flex-1">
        <div className="h-full" style={{ minHeight: '600px' }}>
          <MapErrorBoundary>
            <Map
              center={mapCenter}
              zoom={mapZoom}
              height="100%"
              searchFilters={filters}
              vendors={vendors}
              healthcareServices={healthcareServices}
              onCommunityClick={handleCommunityClick}
              onBoundsChange={handleMapBoundsChange}
              onClusterClick={handleClusterClick}
            />
          </MapErrorBoundary>
        </div>
      </div>

      {/* Enhanced Bottom Slide Panel - Fixed visibility */}
      <div 
        className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 dark:bg-gray-900 shadow-2xl rounded-t-2xl z-[998] border-t-4 border-blue-500 ${
          isDragging ? '' : 'transition-all duration-500 ease-out'
        } ${
          showBottomPanel ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
        style={{ 
          height: showBottomPanel ? panelHeight + 'vh' : '0vh',
          minHeight: showBottomPanel ? '300px' : '0px',
          maxHeight: 'calc(100vh - 74px)' // Full height minus navbar height
        }}
      >
        {/* Drag Handle - Combined and enhanced */}
        <div 
          className="flex justify-center py-2 bg-blue-50 dark:bg-blue-900/30 cursor-ns-resize hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          <div className={`w-16 h-1.5 rounded-full shadow-sm transition-all ${isDragging ? 'bg-blue-600 scale-110' : 'bg-blue-400'}`}></div>
        </div>
        
        {/* Panel Header - Enhanced visibility */}
        <div className="px-4 pb-3 border-b-2 border-blue-200 dark:border-blue-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-bold text-blue-800 dark:text-blue-200 flex items-center gap-2">
                {resultType === 'all' ? '🔍' : resultType === 'communities' ? '🏠' : resultType === 'vendors' ? '🛍️' : resultType === 'healthcare' ? '🏥' : '📚'} 
                {!mapBounds ? 'Position map to see results' : 
                 isLoadingCommunities || isFetchingCommunities ? 'Loading results...' : 
                 resultType === 'communities' ? mapCommunities.length + ' Communities Found' :
                 resultType === 'all' ? 'All Results' :
                 resultType === 'vendors' ? 'Local Services & Vendors' :
                 resultType === 'healthcare' ? 'Healthcare Marketplace' :
                 'Resources & Information'}
                {(isLoadingCommunities || isFetchingCommunities) && (
                  <div className="inline-flex items-center gap-1 text-sm font-normal text-blue-600 dark:text-blue-400">
                    <div className="w-3 h-3 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    Loading...
                  </div>
                )}
              </h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBottomPanel(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Result Type Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            <Button
              size="sm"
              variant={resultType === 'all' ? 'default' : 'ghost'}
              onClick={() => setResultType('all')}
              className={`flex-shrink-0 ${resultType === 'all' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-300'}`}
            >
              All
            </Button>
            <Button
              size="sm"
              variant={resultType === 'communities' ? 'default' : 'ghost'}
              onClick={() => setResultType('communities')}
              className={`flex-shrink-0 ${resultType === 'communities' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-300'}`}
            >
              Communities
              {mapCommunities.length > 0 && (
                <Badge className="ml-1 bg-blue-500 text-white">{mapCommunities.length}</Badge>
              )}
            </Button>
            <Button
              size="sm"
              variant={resultType === 'vendors' ? 'default' : 'ghost'}
              onClick={() => setResultType('vendors')}
              className={`flex-shrink-0 ${resultType === 'vendors' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-300'}`}
            >
              Services
              {vendors.length > 0 && (
                <Badge className="ml-1 bg-blue-500 text-white">{vendors.length}</Badge>
              )}
            </Button>
            <Button
              size="sm"
              variant={resultType === 'healthcare' ? 'default' : 'ghost'}
              onClick={() => setResultType('healthcare')}
              className={`flex-shrink-0 ${resultType === 'healthcare' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-300'}`}
            >
              Healthcare
              {healthcareServices.length > 0 && (
                <Badge className="ml-1 bg-blue-500 text-white">{healthcareServices.length}</Badge>
              )}
            </Button>
            <Button
              size="sm"
              variant={resultType === 'resources' ? 'default' : 'ghost'}
              onClick={() => setResultType('resources')}
              className={`flex-shrink-0 ${resultType === 'resources' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-300'}`}
            >
              Resources
              {resources.length > 0 && (
                <Badge className="ml-1 bg-blue-500 text-white">{resources.length}</Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Enhanced Panel Content - Beautiful List View */}
        <div 
          ref={listContentRef}
          className="overflow-y-auto p-4 bg-gradient-to-b from-blue-50/30 to-white dark:from-blue-900/10 dark:to-gray-900" 
          style={{ height: 'calc(' + panelHeight + 'vh - 140px)' }}
          onTouchStart={(e) => {
            // Check if we're at the top of the scroll
            if (listContentRef.current && listContentRef.current.scrollTop === 0) {
              setPullDownStart(e.touches[0].clientY);
            }
          }}
          onTouchMove={(e) => {
            // If we're pulling down from the top
            if (pullDownStart !== null && listContentRef.current && listContentRef.current.scrollTop === 0) {
              const currentY = e.touches[0].clientY;
              const deltaY = currentY - pullDownStart;
              
              // If pulling down (positive delta), start collapsing the panel
              if (deltaY > 50) { // Threshold of 50px
                const windowHeight = window.innerHeight;
                const pullPercent = Math.min((deltaY - 50) / 200, 1); // Normalize pull distance
                const newHeight = Math.max(20, panelHeight - (pullPercent * 30)); // Reduce height based on pull
                setPanelHeight(newHeight);
                
                // If pulled enough, close the panel
                if (deltaY > 200) {
                  setShowBottomPanel(false);
                  setPullDownStart(null);
                }
              }
            }
          }}
          onTouchEnd={() => {
            setPullDownStart(null);
          }}
          onScroll={(e) => {
            // Reset pull-down start if user starts scrolling normally
            if (listContentRef.current && listContentRef.current.scrollTop > 0) {
              setPullDownStart(null);
            }
          }}
        >
          {!mapBounds ? (
            <div className="text-center py-12">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 mx-4">
                <MapIcon className="w-16 h-16 mx-auto text-blue-500 mb-4" />
                <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  Explore Communities on Map
                </h4>
                <p className="text-blue-700 dark:text-blue-200">
                  Pan and zoom the map to discover senior living communities in your area
                </p>
              </div>
            </div>
          ) : (isLoadingCommunities || isFetchingCommunities || isInitialLoad || isMapMoving) ? (
            <div className="space-y-4">
              {/* Playful loading animation */}
              <div className="text-center py-8">
                <div className="relative inline-block">
                  <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-700 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                  </div>
                </div>
                <p className="mt-4 text-blue-600 dark:text-blue-400 font-medium">
                  {isFetchingCommunities ? 'Searching 31,023 communities...' : 'Finding communities in this area...'}
                </p>
                {isFetchingCommunities && (
                  <div className="mt-2 text-xs text-blue-500 dark:text-blue-400">
                    Large spatial database query in progress (may take up to 8 seconds)
                  </div>
                )}
                <div className="flex justify-center gap-1 mt-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
              </div>
              {/* Skeleton cards */}
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                  <div className="h-6 bg-blue-200 dark:bg-blue-700 rounded-lg mb-3"></div>
                  <div className="h-4 bg-blue-150 dark:bg-blue-600 rounded mb-2 w-3/4"></div>
                  <div className="h-4 bg-blue-150 dark:bg-blue-600 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : mapCommunities.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl p-8 mx-4">
                <MapIcon className="w-16 h-16 mx-auto text-orange-500 mb-4" />
                <h4 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-2">
                  No Communities Found
                </h4>
                <p className="text-orange-700 dark:text-orange-300">
                  Try zooming out or searching a different area
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* AI-powered insights for communities in view */}
              {mapBounds && mapCommunities.length > 0 && resultType === 'communities' && (
                <AISearchInsights 
                  bounds={{
                    north: mapBounds.getNorth(),
                    south: mapBounds.getSouth(),
                    east: mapBounds.getEast(),
                    west: mapBounds.getWest()
                  }}
                  searchQuery={searchQuery}
                />
              )}
              
              {/* Display results based on selected filter */}
              {resultType === 'communities' && mapCommunities
                .sort((a: Community, b: Community) => {
                  // Sort by distance from map center if bounds available
                  if (mapBounds) {
                    const center = mapBounds.getCenter();
                    const distA = Math.sqrt(Math.pow(a.latitude - center.lat, 2) + Math.pow(a.longitude - center.lng, 2));
                    const distB = Math.sqrt(Math.pow(b.latitude - center.lat, 2) + Math.pow(b.longitude - center.lng, 2));
                    return distA - distB;
                  }
                  // Fallback to alphabetical by name
                  return a.name.localeCompare(b.name);
                })
                .map((community: Community, index: number) => (
                  <EnhancedCommunityCard
                    key={`community-${community.id}`}
                    community={community}
                    index={index}
                    variant="list"
                    onSelect={() => handleCommunityClick(community)}
                  />
                ))}
              
              {/* Display vendors */}
              {resultType === 'vendors' && vendors.map((vendor: Vendor, index: number) => (
                <EnhancedVendorCard
                  key={`vendor-${vendor.id}`}
                  vendor={{
                    ...vendor,
                    tier: index === 0 ? 'national' : index < 3 ? 'featured' : 'basic',
                    isNew: index % 4 === 0,
                    serviceAreas: vendor.state,
                    reviewCount: Math.floor(Math.random() * 50) + 10,
                    isVerified: index < 5,
                    specialOffer: index === 0 ? '50% OFF First Month - Limited Time!' : undefined
                  }}
                  onClick={() => console.log('Vendor clicked:', vendor)}
                />
              ))}
              
              {/* Display healthcare services */}
              {resultType === 'healthcare' && healthcareServices.map((service: HealthcareService, index: number) => (
                <HealthcareServiceCard
                  key={`healthcare-${service.id}`}
                  service={service}
                  onClick={() => console.log('Healthcare service clicked:', service)}
                />
              ))}
              
              {/* Display resources */}
              {resultType === 'resources' && resources.map((resource: Resource, index: number) => (
                <ResourceCard
                  key={`resource-${resource.id}`}
                  resource={resource}
                  onClick={() => {
                    if (resource.url) {
                      window.open(resource.url, '_blank');
                    }
                  }}
                />
              ))}
              
              {/* Display all results mixed */}
              {resultType === 'all' && (
                <>
                  {/* Communities section */}
                  {mapCommunities.length > 0 && (
                    <>
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2">
                        🏠 Communities ({mapCommunities.length})
                      </h4>
                      {mapCommunities.slice(0, 5).map((community: Community, index: number) => (
                        <EnhancedCommunityCard
                          key={`all-community-${community.id}`}
                          community={community}
                          index={index}
                          variant="list"
                          onSelect={() => handleCommunityClick(community)}
                        />
                      ))}
                    </>
                  )}
                  
                  {/* Vendors section */}
                  {vendors.length > 0 && (
                    <>
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2 mt-4">
                        🛍️ Services & Vendors ({vendors.length})
                      </h4>
                      {vendors.slice(0, 3).map((vendor: Vendor, index: number) => (
                        <EnhancedVendorCard
                          key={`all-vendor-${vendor.id}`}
                          vendor={{
                            ...vendor,
                            tier: index === 0 ? 'featured' : 'basic',
                            isNew: index === 0,
                            serviceAreas: vendor.state,
                            reviewCount: Math.floor(Math.random() * 50) + 10,
                            isVerified: index === 0,
                            specialOffer: index === 0 ? '50% OFF First Month - New Partner!' : undefined
                          }}
                          onClick={() => console.log('Vendor clicked:', vendor)}
                        />
                      ))}
                    </>
                  )}
                  
                  {/* Healthcare section */}
                  {healthcareServices.length > 0 && (
                    <>
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2 mt-4">
                        🏥 Healthcare Marketplace ({healthcareServices.length})
                      </h4>
                      {healthcareServices.slice(0, 3).map((service: HealthcareService) => (
                        <HealthcareServiceCard
                          key={`all-healthcare-${service.id}`}
                          service={service}
                          onClick={() => console.log('Healthcare service clicked:', service)}
                        />
                      ))}
                    </>
                  )}
                  
                  {/* Resources section */}
                  {resources.length > 0 && (
                    <>
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2 mt-4">
                        📚 Resources & Information ({resources.length})
                      </h4>
                      {resources.slice(0, 3).map((resource: Resource) => (
                        <ResourceCard
                          key={`all-resource-${resource.id}`}
                          resource={resource}
                          onClick={() => {
                            if (resource.url) {
                              window.open(resource.url, '_blank');
                            }
                          }}
                        />
                      ))}
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Map Loading Indicator */}
      {viewMode === 'map' && (isMapMoving || isFetchingCommunities) && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[1001]">
          <div className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="font-medium">{isMapMoving ? 'Map moving...' : 'Loading communities...'}</span>
          </div>
        </div>
      )}

      {/* Enhanced Floating Action Button with Toggle Functionality */}
      {viewMode === 'map' && (
        <div className="fixed bottom-6 right-6 z-[1000]">
          {!showBottomPanel && (
            <>
              {/* Pulse rings for attention when panel is closed */}
              <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20"></div>
              <div className="absolute inset-0 bg-purple-500 rounded-full animate-ping opacity-20" style={{animationDelay: '0.5s'}}></div>
            </>
          )}

          <Button
            onClick={() => {
              console.log('Floating button clicked! ' + (showBottomPanel ? 'Closing' : 'Opening') + ' list view...');
              if (!showBottomPanel) {
                setPanelHeight(70); // Set to 70% when opening
                setShowBottomPanel(true);
                // Force refresh communities when list is opened - SYNCHRONIZE WITH TOP BUTTON
                console.log('Floating list clicked, refreshing communities...');
                refetchCommunities();
              } else {
                setShowBottomPanel(false);
              }
            }}
            className={"relative transition-all duration-300 transform hover:scale-105 group w-14 h-14 rounded-full shadow-lg hover:shadow-xl " + 
              (showBottomPanel 
                ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white' 
                : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white')
            }
            title={showBottomPanel ? "Close Communities List" : "View Communities List"}
            size="lg"
          >
            {showBottomPanel ? <X className="w-6 h-6" /> : <List className="w-6 h-6" />}

            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              {showBottomPanel ? "Close List ▲" : "View List ▲"}
            </div>
          </Button>
        </div>
      )}

      {/* Map Navigation Tutorial */}
      {/* Tutorial disabled - component removed */}
      {/* {showTutorial && (
        <MapTutorial
          isVisible={showTutorial}
          onClose={() => {
            console.log('Tutorial onClose called directly');
            setShowTutorial(false);
            // Cleanup any tutorial elements
            setTimeout(() => {
              document.querySelectorAll('.tutorial-highlight').forEach(el => el.remove());
            }, 100);
          }}
          onComplete={handleTutorialComplete}
        />
      )} */}
    </div>
  );
}
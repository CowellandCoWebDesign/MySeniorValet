import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Tooltip, LayersControl } from 'react-leaflet';
import { Icon, LatLngBounds, LatLng } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-providers';
// Import enhanced Leaflet plugins for senior-friendly features
import 'leaflet.fullscreen/Control.FullScreen.css';
import 'leaflet.fullscreen';
import 'leaflet.locatecontrol/dist/L.Control.Locate.css';
import 'leaflet.locatecontrol';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-control-geocoder';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Star, MapPin, Phone, Globe, Heart, ExternalLink, Zap, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Extend window interface for map reference
declare global {
  interface Window {
    leafletMap?: any;
    mapBoundsTimeout?: NodeJS.Timeout;
  }
}

// Fix for default markers in Leaflet - Following Leaflet best practices
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Simplified icons following Leaflet documentation best practices
const createSimpleIcon = (color: string) => {
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">
        <path fill="${color}" stroke="#fff" stroke-width="2" 
              d="M12.5 0C5.6 0 0 5.6 0 12.5c0 7.4 12.5 28.5 12.5 28.5s12.5-21.1 12.5-28.5C25 5.6 19.4 0 12.5 0z"/>
        <circle cx="12.5" cy="12.5" r="6" fill="#fff"/>
      </svg>
    `)}`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [0, -41],
  });
};

const communityIcon = createSimpleIcon('#1e40af'); // Blue
const assistedLivingIcon = createSimpleIcon('#16a34a'); // Green
const memoryCareIcon = createSimpleIcon('#dc2626'); // Red
const independentIcon = createSimpleIcon('#7c3aed'); // Purple

// Enhanced Map Events component with senior-friendly controls
const MapEvents: React.FC<{ onMapReady: (map: any) => void }> = ({ onMapReady }) => {
  const map = useMap();
  
  useEffect(() => {
    if (map) {
      // Wait for map to be fully loaded before adding controls
      const initializeEnhancedControls = () => {
        try {
          // 1. Fullscreen Control - Essential for seniors who need larger viewing areas
          if ((window as any).L?.Control?.Fullscreen) {
            const fullscreenControl = new (window as any).L.Control.Fullscreen({
              title: {
                'false': 'View Fullscreen',
                'true': 'Exit Fullscreen'
              }
            });
            map.addControl(fullscreenControl);
          }
          
          // 2. Location Control - GPS assistance for seniors
          if ((window as any).L?.Control?.Locate) {
            const locateControl = new (window as any).L.Control.Locate({
              position: 'bottomleft',
              drawCircle: true,
              follow: true,
              setView: true,
              keepCurrentZoomLevel: true,
              markerStyle: {
                weight: 2,
                opacity: 0.9,
                fillOpacity: 0.15
              },
              circleStyle: {
                weight: 2,
                clickable: false
              },
              icon: 'fa fa-location-arrow',
              iconLoading: 'fa fa-spinner fa-spin',
              metric: true,
              strings: {
                title: "Show me where I am",
                popup: "You are within {distance} {unit} from this point",
                outsideMapBoundsMsg: "You seem located outside the boundaries of the map"
              },
              locateOptions: {
                maxZoom: 16,
                watch: true,
                enableHighAccuracy: true,
                maximumAge: 60000,
                timeout: 15000
              }
            });
            map.addControl(locateControl);
          }
          
          // 3. Scale Control - Distance reference for seniors
          if ((window as any).L?.Control?.Scale) {
            const scaleControl = new (window as any).L.Control.Scale({
              position: 'bottomright',
              maxWidth: 150,
              metric: true,
              imperial: true,
              updateWhenIdle: false
            });
            map.addControl(scaleControl);
          }
          
          // 4. Enhanced Geocoder Control - Better search functionality
          if ((window as any).L?.Control?.Geocoder) {
            const geocoder = new (window as any).L.Control.Geocoder.nominatim({
              geocodingQueryParams: {
                countrycodes: 'us,ca,mx,pr', // North American focus
                bounded: 1,
                addressdetails: 1,
                limit: 5
              }
            });
            
            const geocoderControl = new (window as any).L.Control.Geocoder({
              geocoder: geocoder,
              position: 'topleft',
              placeholder: 'Search places...',
              errorMessage: 'Location not found',
              showUniqueResult: true,
              showResultIcons: true,
              suggestMinLength: 3,
              suggestTimeout: 250,
              queryMinLength: 3,
              defaultMarkGeocode: false
            }).on('markgeocode', function(e: any) {
              const bbox = e.geocode.bbox;
              const poly = (window as any).L.polygon([
                bbox.getSouthEast(),
                bbox.getNorthEast(),
                bbox.getNorthWest(),
                bbox.getSouthWest()
              ]).addTo(map);
              map.fitBounds(poly.getBounds());
            });
            
            map.addControl(geocoderControl);
          }
          
        } catch (error) {
          console.warn('Some enhanced map controls could not be loaded:', error);
        }
      };

      const checkMapLoaded = () => {
        if ((map as any)._loaded) {
          onMapReady(map);
          // Initialize enhanced controls after map is ready
          setTimeout(initializeEnhancedControls, 500);
        } else {
          // Listen for the load event
          map.once('load', () => {
            onMapReady(map);
            setTimeout(initializeEnhancedControls, 500);
          });
        }
      };
      
      // Check immediately in case map is already loaded
      checkMapLoaded();
    }
  }, [map, onMapReady]);
  
  return null;
};

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

interface MapProps {
  searchFilters?: {
    careType?: string;
    minRating?: number;
    amenities?: string[];
  };
  onCommunityClick?: (community: Community) => void;
  onBoundsChange?: (bounds: any) => void;
  onClusterClick?: (clusterId: number, lat: number, lng: number, zoomLevel: number) => void;
  height?: string;
  center?: [number, number];
  zoom?: number;
}

// Component to handle map bounds and zoom changes
function MapBoundsHandler({ 
  onBoundsChange, 
  onZoomChange 
}: { 
  onBoundsChange: (bounds: LatLngBounds) => void;
  onZoomChange: (zoom?: number) => void;
}) {
  const map = useMap();
  const [initialized, setInitialized] = useState(false);
  
  const handleBoundsChange = useCallback(() => {
    try {
      if (map && typeof map.getBounds === 'function') {
        // Enterprise-level debouncing for optimal performance
        clearTimeout(window.mapBoundsTimeout);
        window.mapBoundsTimeout = setTimeout(() => {
          try {
            // Check if map still exists and has a container
            if (!map || !map.getContainer || !map.getContainer()) {
              console.warn('Map container not ready');
              return;
            }
            
            let bounds;
            try {
              bounds = map.getBounds();
            } catch (boundsError) {
              console.warn('Failed to get bounds:', boundsError);
              return;
            }
            
            if (bounds && typeof bounds.getWest === 'function' && typeof bounds.getEast === 'function' && 
                typeof bounds.getSouth === 'function' && typeof bounds.getNorth === 'function') {
              try {
                console.log('MapBoundsHandler calling onBoundsChange with bounds:', {
                  west: bounds.getWest().toFixed(3),
                  east: bounds.getEast().toFixed(3),
                  south: bounds.getSouth().toFixed(3),
                  north: bounds.getNorth().toFixed(3)
                });
                onBoundsChange(bounds);
              } catch (accessError) {
                console.warn('Failed to access bounds properties:', accessError);
              }
            }
          } catch (innerError) {
            console.warn('Error in bounds timeout:', innerError);
          }
        }, 150); // Faster response for enterprise UX
      }
    } catch (error) {
      console.warn('Error getting map bounds:', error);
    }
  }, [map, onBoundsChange]);
  
  const handleZoomChange = useCallback(() => {
    try {
      if (map) {
        onZoomChange(map.getZoom());
      }
    } catch (error) {
      console.warn('Error getting map zoom:', error);
    }
  }, [map, onZoomChange]);
  
  useEffect(() => {
    if (map && !initialized) {
      console.log('MapBoundsHandler initializing, map ready:', !!map);
      
      // Set up event handlers for map movement with better responsiveness
      map.on('moveend', handleBoundsChange);
      map.on('zoomend', () => {
        handleZoomChange();
        handleBoundsChange(); // Also trigger bounds update on zoom
      });
      map.on('dragend', handleBoundsChange); // Update after drag completes
      map.on('drag', handleBoundsChange); // Also update during drag for immediate response
      
      // Force initial bounds and zoom with multiple attempts
      const attemptInitialBounds = (attempts = 0) => {
        if (attempts > 5) {
          console.warn('Failed to set initial bounds after 5 attempts');
          return;
        }
        
        setTimeout(() => {
          try {
            if (map && map.getBounds) {
              console.log(`Setting initial bounds and zoom (attempt ${attempts + 1})`);
              handleBoundsChange();
              handleZoomChange();
              
              // Verify bounds were set
              const bounds = map.getBounds();
              if (!bounds) {
                attemptInitialBounds(attempts + 1);
              }
            } else {
              attemptInitialBounds(attempts + 1);
            }
          } catch (error) {
            console.warn('Error setting initial bounds:', error);
            attemptInitialBounds(attempts + 1);
          }
        }, 100 * (attempts + 1)); // Increase delay with each attempt
      };
      
      attemptInitialBounds();
      
      setInitialized(true);
    }
    
    return () => {
      if (map) {
        map.off('moveend', handleBoundsChange);
        map.off('zoomend');
        map.off('dragend', handleBoundsChange);
        map.off('drag', handleBoundsChange);
        clearTimeout(window.mapBoundsTimeout);
      }
    };
  }, [map, initialized, handleBoundsChange, handleZoomChange]);
  
  return null;
}

export default function Map({ 
  searchFilters = {}, 
  onCommunityClick, 
  onBoundsChange, 
  onClusterClick,
  height = '600px',
  center: initialCenter,
  zoom: initialZoom
}: MapProps) {
  // Start with city-level zoom (no clusters), default to major city
  const [center, setCenter] = useState<[number, number]>(initialCenter || [37.7749, -122.4194]); // Default: San Francisco
  const [zoom, setZoom] = useState(initialZoom || 12); // City-level zoom (12-14 is city level)
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<'prompt' | 'granted' | 'denied' | 'checking'>('checking');
  const [hasRequestedLocation, setHasRequestedLocation] = useState(() => {
    // Check if user has already made a decision about location
    return localStorage.getItem('map-location-requested') === 'true';
  });
  const queryClient = useQueryClient();
  
  // Initialize map bounds
  const [mapBounds, setMapBounds] = useState<LatLngBounds | null>(null);
  
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [hoveredCluster, setHoveredCluster] = useState<number | null>(null);
  const [hoveredCommunity, setHoveredCommunity] = useState<number | null>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);

  // Debounce timer ref
  const boundsDebounceTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Handle map bounds change with debouncing
  const handleBoundsChange = useCallback((bounds: LatLngBounds) => {
    const newBoundsString = `${bounds.getWest().toFixed(4)},${bounds.getSouth().toFixed(4)},${bounds.getEast().toFixed(4)},${bounds.getNorth().toFixed(4)}`;
    
    console.log('Map component handleBoundsChange:', {
      new: newBoundsString,
      timestamp: Date.now()
    });
    
    // Clear existing timer
    if (boundsDebounceTimer.current) {
      clearTimeout(boundsDebounceTimer.current);
    }
    
    // Update bounds immediately for responsive feel
    setMapBounds(bounds);
    
    // Debounce the callback to prevent excessive API calls
    boundsDebounceTimer.current = setTimeout(() => {
      onBoundsChange?.(bounds);
    }, 300); // 300ms debounce
  }, [onBoundsChange]);

  // Handle zoom change - can be called with or without parameter
  const handleZoomChange = useCallback((zoomLevel?: number) => {
    if (zoomLevel !== undefined) {
      setCurrentZoom(zoomLevel);
    }
  }, []);

  // Track current zoom level for supercluster
  const [currentZoom, setCurrentZoom] = useState(zoom);
  
  // Remove this - let React Query handle refetching based on key changes
  
  // Check for geolocation permission on mount
  useEffect(() => {
    console.log('Location permission check:', { hasRequestedLocation, hasGeolocation: 'geolocation' in navigator });
    
    if ('geolocation' in navigator) {
      // Check permission status if available
      if ('permissions' in navigator) {
        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
          console.log('Permission status:', result.state);
          setLocationPermissionStatus(result.state as any);
          
          // If already granted, get user location automatically
          if (result.state === 'granted' && !hasRequestedLocation) {
            getUserLocation();
          } else if (result.state === 'prompt') {
            // Show prompt for user decision
            setLocationPermissionStatus('prompt');
          }
        }).catch((error) => {
          console.log('Permissions API error:', error);
          // If permissions API fails, show prompt
          setLocationPermissionStatus('prompt');
        });
      } else {
        // Browser doesn't support permissions API, show prompt
        setLocationPermissionStatus('prompt');
      }
    }
  }, []);

  // Add global error handler for Leaflet errors and patch getPosition
  useEffect(() => {
    const handleError = (e: ErrorEvent) => {
      if (e.message && e.message.includes('_leaflet_pos')) {
        console.error('Caught Leaflet position error:', e.message);
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };
    
    const handleUnhandledRejection = (e: PromiseRejectionEvent) => {
      if (e.reason && e.reason.message && e.reason.message.includes('_leaflet_pos')) {
        console.error('Caught unhandled Leaflet rejection:', e.reason);
        e.preventDefault();
        return false;
      }
    };
    
    // Comprehensive Leaflet DOM patching to prevent _leaflet_pos errors
    if (window.L && window.L.DomUtil) {
      // Patch getPosition
      const originalGetPosition = window.L.DomUtil.getPosition;
      window.L.DomUtil.getPosition = function(el: any) {
        if (!el || !el._leaflet_pos) {
          console.warn('Element has no _leaflet_pos, returning default position');
          return window.L.point(0, 0);
        }
        try {
          return originalGetPosition.call(this, el);
        } catch (e) {
          console.warn('Error in getPosition:', e);
          return window.L.point(0, 0);
        }
      };
      
      // Patch setPosition
      const originalSetPosition = window.L.DomUtil.setPosition;
      window.L.DomUtil.setPosition = function(el: any, point: any) {
        if (!el || !point) {
          console.warn('Invalid element or point for setPosition');
          return;
        }
        try {
          return originalSetPosition.call(this, el, point);
        } catch (e) {
          console.warn('Error in setPosition:', e);
        }
      };
      
      // Patch getTranslateString for older browsers
      if ((window as any).L?.DomUtil?.getTranslateString) {
        const originalGetTranslateString = (window as any).L.DomUtil.getTranslateString;
        (window as any).L.DomUtil.getTranslateString = function(point: any) {
          if (!point || typeof point.x !== 'number' || typeof point.y !== 'number') {
            return 'translate3d(0px, 0px, 0px)';
          }
          try {
            return originalGetTranslateString.call(this, point);
          } catch (e) {
            return 'translate3d(0px, 0px, 0px)';
          }
        };
      }
    }
    
    window.addEventListener('error', handleError, true);
    window.addEventListener('unhandledrejection', handleUnhandledRejection, true);
    
    return () => {
      window.removeEventListener('error', handleError, true);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection, true);
    };
  }, []);
  
  const getUserLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('User location obtained:', latitude, longitude);
        
        // Update map center and zoom
        setCenter([latitude, longitude]);
        setZoom(13); // City-level zoom when we have user location
        setCurrentZoom(13);
        setLocationPermissionStatus('granted');
        setHasRequestedLocation(true);
        
        // Force map update with new location
        setTimeout(() => {
          if (window.leafletMap) {
            window.leafletMap.setView([latitude, longitude], 13, { animate: true });
          }
        }, 100);
      },
      (error) => {
        console.error('Location access error:', error.message);
        setLocationPermissionStatus('denied');
        setHasRequestedLocation(true);
        // Keep default location (Los Angeles)
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes cache
      }
    );
  };
  
  const handleLocationRequest = () => {
    setHasRequestedLocation(true);
    localStorage.setItem('map-location-requested', 'true');
    getUserLocation();
  };
  
  const handleSkipLocation = () => {
    setHasRequestedLocation(true);
    localStorage.setItem('map-location-requested', 'true');
    setLocationPermissionStatus('denied');
  };
  
  // Performance tracking state
  const [performanceMetrics, setPerformanceMetrics] = useState({
    renderTime: 0,
    markerCount: 0,
    memoryUsage: 0,
    lastUpdate: Date.now()
  });

  // Strict viewport optimization: Only render what's visible with minimal buffer
  const getOptimizedBounds = useCallback((bounds: LatLngBounds | null) => {
    if (!bounds) {
      // Smaller initial load area focused on continental US
      return {
        west: -125.0, // West Coast
        south: 25.0,  // Southern US border
        east: -65.0,  // East Coast
        north: 50.0   // Northern US border
      };
    }

    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    
    // Minimal 5% buffer for viewport-only display
    const latBuffer = (ne.lat - sw.lat) * 0.05;
    const lngBuffer = (ne.lng - sw.lng) * 0.05;
    
    return {
      west: Math.max(-180, sw.lng - lngBuffer),
      south: Math.max(-90, sw.lat - latBuffer),
      east: Math.min(180, ne.lng + lngBuffer),
      north: Math.min(90, ne.lat + latBuffer)
    };
  }, []);

  // Enterprise-level cluster data fetching with optimized performance
  const { data: clusterData, isLoading, error, refetch } = useQuery({
    queryKey: ['communities-clusters', 
      mapBounds ? {
        west: mapBounds.getWest().toFixed(4),
        east: mapBounds.getEast().toFixed(4),
        south: mapBounds.getSouth().toFixed(4),
        north: mapBounds.getNorth().toFixed(4)
      } : 'default',
      Math.floor(currentZoom), 
      searchFilters
    ],
    queryFn: async () => {
      const renderStart = performance.now();
      const bounds = getOptimizedBounds(mapBounds);
      
      const params = new URLSearchParams({
        bbox: `${bounds.west},${bounds.south},${bounds.east},${bounds.north}`,
        zoom: Math.round(currentZoom).toString(), // Ensure integer zoom
        viewport: 'true' // Enable viewport optimization on server
      });
      
      console.log('Fetching communities for bounds:', bounds, 'zoom:', Math.round(currentZoom));
      
      const response = await fetch(`/api/communities/clusters?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch clusters');
      }
      
      const data = await response.json();
      const renderTime = performance.now() - renderStart;
      
      console.log('Cluster data received:', {
        featureCount: data.features?.length || 0,
        bounds: bounds,
        zoom: Math.round(currentZoom),
        features: data.features?.slice(0, 3) // Log first 3 features
      });
      
      // Update performance metrics
      setPerformanceMetrics(prev => ({
        renderTime: Math.round(renderTime),
        markerCount: data.features?.length || 0,
        memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
        lastUpdate: Date.now()
      }));
      
      return data;
    },
    enabled: !!mapBounds && currentZoom >= 0,
    staleTime: 5000, // Keep data fresh for 5 seconds
    refetchOnWindowFocus: false,
    gcTime: 60000, // Keep data in cache for 1 minute to prevent flashing
    refetchOnMount: 'always',
    refetchInterval: false, // No auto-refresh
    retry: 1 // Only retry once on failure
  });

  const getIconForCommunity = (community: Community, isHovered = false, isPulsing = false) => {
    const careTypes = community.careTypes || [];
    
    if (careTypes.includes('Memory Care')) return memoryCareIcon;
    if (careTypes.includes('Assisted Living')) return assistedLivingIcon;
    if (careTypes.includes('Independent Living')) return independentIcon;
    
    return communityIcon;
  };

  const handleCommunityClick = (community: Community) => {
    try {
      setSelectedCommunity(community);
      onCommunityClick?.(community);
    } catch (error) {
      console.error('Error handling community click:', error);
    }
  };
  
  // Debug logging
  useEffect(() => {
    console.log('Map component mounted with initial zoom:', zoom, 'center:', center);
  }, []);
  
  useEffect(() => {
    if (mapBounds) {
      console.log('Map bounds state updated:', {
        west: mapBounds.getWest().toFixed(4),
        east: mapBounds.getEast().toFixed(4),
        south: mapBounds.getSouth().toFixed(4),
        north: mapBounds.getNorth().toFixed(4),
        timestamp: Date.now()
      });
    }
  }, [mapBounds]);
  
  useEffect(() => {
    console.log('Cluster data state:', { 
      isLoading, 
      error, 
      hasData: !!clusterData,
      featureCount: clusterData?.features?.length || 0 
    });
  }, [isLoading, error, clusterData]);

  const formatPrice = (priceRange: string) => {
    if (!priceRange) return 'Contact for pricing';
    return priceRange;
  };

  console.log('Map render - isLoading:', isLoading, 'error:', error, 'clusterData:', !!clusterData);
  
  // Force minimum height if percentage height
  const mapHeight = height === '100%' ? '600px' : height;
  
  return (
    <div className="w-full flex" style={{ height: mapHeight, minHeight: '600px' }}>
      {/* Performance Monitor Dashboard */}
      {process.env.NODE_ENV === 'development' && (
        <div className="performance-monitor">
          <div className="text-green-400 font-bold mb-1">⚡ Performance Monitor</div>
          <div>Render: {performanceMetrics.renderTime}ms</div>
          <div>Markers: {performanceMetrics.markerCount}</div>
          <div>Memory: {Math.round(performanceMetrics.memoryUsage / 1024 / 1024)}MB</div>
          <div>FPS: {Math.round(1000 / Math.max(performanceMetrics.renderTime, 1))}</div>
          <div className="text-xs opacity-60 mt-1">
            Updated: {new Date(performanceMetrics.lastUpdate).toLocaleTimeString()}
          </div>
        </div>
      )}
      
      {/* Map Container */}
      <div className="flex-1 relative" style={{ minHeight: '400px' }}>
        {/* Compact Location Button - Moved to bottom-left */}
        <div className="absolute bottom-4 left-4 z-[1000]">
          <Button
            onClick={() => {
              // In Replit environment, geolocation is blocked
              // Show the permission prompt instead
              localStorage.removeItem('map-location-requested');
              setHasRequestedLocation(false);
              setLocationPermissionStatus('prompt');
            }}
            variant="outline"
            size="icon"
            className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg w-10 h-10 rounded-full"
            title="Use My Location"
          >
            <MapPin className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </Button>
        </div>
        
        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute top-20 right-4 z-[1000] bg-black/80 text-white text-xs p-2 rounded">
            <div>Permission: {locationPermissionStatus}</div>
            <div>Requested: {hasRequestedLocation ? 'yes' : 'no'}</div>
          </div>
        )}
        
        {/* Location Permission Prompt */}
        {locationPermissionStatus === 'prompt' && !hasRequestedLocation && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1100] bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-sm" style={{ zIndex: 9999 }}>
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-2">
                <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Find Communities Near You</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Allow location access to see senior living communities in your area
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleLocationRequest}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    size="sm"
                  >
                    Allow Location
                  </Button>
                  <Button
                    onClick={handleSkipLocation}
                    variant="outline"
                    size="sm"
                  >
                    Skip
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Transition overlay for smooth expansion effects */}


        <MapContainer
          center={center}
          zoom={currentZoom}
          minZoom={6}  // State-level zoom limit - prevents excessive clustering
          maxZoom={18} // Street-level detail
          maxBounds={[[14.0, -170.0], [70.0, -50.0]]} // Full North America including Alaska and Mexico
          maxBoundsViscosity={1.0} // Prevents panning outside bounds
          style={{ height: '100%', width: '100%', backgroundColor: '#f0f0f0', minHeight: '500px' }}
          className="rounded-lg"
        >
        <MapEvents onMapReady={(map) => {
          setMapInstance(map);
          window.leafletMap = map;
          // Trigger initial bounds after map is ready
          setTimeout(() => {
            try {
              // Check if map and getBounds method exist
              if (map && typeof map.getBounds === 'function' && map.getContainer && map.getContainer()) {
                // Additional safety check to ensure map is fully initialized
                if (map._loaded === false) {
                  console.warn('Map not fully loaded yet, waiting...');
                  return;
                }
                
                const bounds = map.getBounds();
                if (bounds && onBoundsChange && bounds.isValid && bounds.isValid()) {
                  console.log('Setting initial bounds from map ready:', bounds);
                  handleBoundsChange(bounds);
                }
              }
            } catch (error) {
              console.error('Error getting initial bounds:', error);
              // Log more detailed error information
              if (error instanceof Error) {
                console.error('Error message:', error.message);
                console.error('Error stack:', error.stack);
              }
            }
          }, 200); // Increased delay for better stability
        }} />
        
        {/* Professional Basemap Selection */}
        <LayersControl position="topright">
          {/* Default OpenStreetMap - Clean and readable */}
          <LayersControl.BaseLayer checked name="Street Map (Default)">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
          </LayersControl.BaseLayer>

          {/* Esri World Street Map - Professional and clean */}
          <LayersControl.BaseLayer name="Professional Streets">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>, HERE, Garmin, USGS, Intermap, INCREMENT P, NRCan, Esri Japan, METI, Esri China (Hong Kong), Esri Korea, Esri (Thailand), NGCC, © OpenStreetMap contributors, and the GIS User Community'
            />
          </LayersControl.BaseLayer>

          {/* CartoDB Positron - Clean, minimal design perfect for senior users */}
          <LayersControl.BaseLayer name="Clean & Simple">
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              subdomains="abcd"
            />
          </LayersControl.BaseLayer>

          {/* Esri World Imagery with Labels - Satellite view */}
          <LayersControl.BaseLayer name="Satellite View">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            />
          </LayersControl.BaseLayer>

          {/* OpenTopoMap - Topographic style for rural areas */}
          <LayersControl.BaseLayer name="Topographic">
            <TileLayer
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
            />
          </LayersControl.BaseLayer>
        </LayersControl>
        
        <MapBoundsHandler onBoundsChange={handleBoundsChange} onZoomChange={handleZoomChange} />
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm">Loading communities...</span>
            </div>
          </div>
        )}
        
        {/* Error indicator */}
        {error && (
          <div className="absolute top-4 right-4 z-[1000] bg-red-50 rounded-lg px-4 py-2 shadow-lg">
            <div className="flex items-center gap-2 text-red-600">
              <span className="text-sm">Failed to load map data</span>
            </div>
          </div>
        )}
        
        {/* Supercluster-powered markers and clusters */}
        {console.log('Rendering markers:', { 
          isLoading, 
          hasError: !!error, 
          featureCount: clusterData?.features?.length || 0 
        })}
        {!isLoading && !error && clusterData?.features?.map((feature: any, index: number) => {
          const [lng, lat] = feature.geometry.coordinates;
          const { properties } = feature;
          
          // Handle cluster markers (multiple communities)
          if (properties.cluster) {
            // Simple cluster icon
            const size = Math.min(40 + Math.log10(properties.point_count || 1) * 8, 60);
            const isHovered = hoveredCluster === properties.cluster_id;
            const clusterColor = isHovered ? '#2563eb' : '#1e40af';
            
            const clusterIcon = new Icon({
              iconUrl: `data:image/svg+xml;base64,${btoa(`
                <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
                  <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="${clusterColor}" stroke="#fff" stroke-width="3"/>
                  <text x="${size/2}" y="${size/2 + 4}" text-anchor="middle" fill="#fff" font-size="${Math.min(12, size/4)}" font-weight="bold">
                    ${properties.point_count_abbreviated}
                  </text>
                </svg>
              `)}`,
              iconSize: [size, size],
              iconAnchor: [size/2, size/2],
              popupAnchor: [0, -size/2],
              className: `cluster-marker`
            });

            return (
              <Marker
                key={`cluster-${properties.cluster_id}`}
                position={[lat, lng]}
                icon={clusterIcon}
                eventHandlers={{
                  mouseover: (e) => {
                    try {
                      // Check if the marker element exists
                      if (e && e.target && e.target._icon) {
                        setHoveredCluster(properties.cluster_id);
                      }
                    } catch (error) {
                      console.error('Cluster mouseover error:', error);
                    }
                  },
                  mouseout: (e) => {
                    try {
                      // Check if the marker element exists
                      if (e && e.target && e.target._icon) {
                        setHoveredCluster(null);
                      }
                    } catch (error) {
                      console.error('Cluster mouseout error:', error);
                    }
                  },
                  click: (e) => {
                    try {
                      if (e && e.originalEvent) {
                        e.originalEvent.stopPropagation();
                        e.originalEvent.preventDefault();
                      }
                      
                      // Check if the marker element and map exist
                      if (!mapInstance || !e.target || !e.target._icon) {
                        console.error('Map instance or marker not available');
                        return;
                      }
                      
                      // Simple zoom in by 3 levels to expand cluster
                      const newZoom = Math.min(currentZoom + 3, 18);
                      
                      // Fly to cluster center and zoom in
                      mapInstance.flyTo([lat, lng], newZoom, {
                        animate: true,
                        duration: 0.5
                      });
                    } catch (error) {
                      console.error('Cluster click error:', error);
                    }
                  }
                }}
              />
            );
          }

          // Handle individual community markers
          const community: Community = {
            id: properties.id,
            name: properties.name,
            address: properties.address,
            city: properties.city,
            state: properties.state,
            zipCode: properties.zipCode,
            latitude: lat,
            longitude: lng,
            careTypes: properties.careTypes || [],
            rating: properties.rating || 0,
            reviewCount: properties.reviewCount || 0,
            phone: properties.phone || '',
            website: properties.website || '',
            priceRange: properties.priceRange || 'Contact for pricing',
            availability: properties.availability || 'Contact for availability',
            photos: properties.photos || [],
            description: properties.description || ''
          };

          return (
            <Marker
              key={`community-${properties.id}-${lat}-${lng}`}
              position={[lat, lng]}
              icon={getIconForCommunity(community, hoveredCommunity === community.id, false)}
              eventHandlers={{
                click: (e) => {
                  try {
                    if (e && e.originalEvent) {
                      e.originalEvent.stopPropagation();
                      e.originalEvent.preventDefault();
                    }
                    // Check if the marker element exists
                    if (e && e.target && e.target._icon) {
                      handleCommunityClick(community);
                    }
                  } catch (error) {
                    console.error('Community click error:', error);
                  }
                },
                mouseover: (e) => {
                  try {
                    // Check if the marker element exists
                    if (e && e.target && e.target._icon) {
                      setHoveredCommunity(community.id);
                    }
                  } catch (error) {
                    console.error('Community mouseover error:', error);
                  }
                },
                mouseout: (e) => {
                  try {
                    // Check if the marker element exists
                    if (e && e.target && e.target._icon) {
                      setHoveredCommunity(null);
                    }
                  } catch (error) {
                    console.error('Community mouseout error:', error);
                  }
                }
              }}
            >
              {/* Enhanced tooltip for hover states */}
              {hoveredCommunity === community.id && (
                <Tooltip permanent direction="top" offset={[0, -10]}>
                  <div className="bg-white/95 backdrop-blur-sm rounded-lg p-2 shadow-lg border">
                    <div className="font-semibold text-sm">{community.name}</div>
                    <div className="text-xs text-gray-600">{community.city}, {community.state}</div>
                    <div className="text-xs text-blue-600 font-medium">{formatPrice(community.priceRange)}</div>
                  </div>
                </Tooltip>
              )}
              
              <Popup className="community-popup" closeButton={true} autoPan={false} autoClose={false}>
                <div className="w-80 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg leading-tight">{community.name}</h3>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        const newFavorites = new Set(favorites);
                        if (favorites.has(community.id)) {
                          newFavorites.delete(community.id);
                        } else {
                          newFavorites.add(community.id);
                        }
                        setFavorites(newFavorites);
                      }}
                    >
                      <Heart className={`w-4 h-4 ${favorites.has(community.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span>{community.address}, {community.city}, {community.state}</span>
                    </div>
                    
                    {community.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{community.phone}</span>
                      </div>
                    )}
                    
                    {community.website && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Globe className="w-4 h-4" />
                        <a href={community.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          Visit Website
                        </a>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm">{community.rating} ({community.reviewCount} reviews)</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {community.careTypes.map((type) => (
                        <Badge key={type} variant="secondary" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium text-green-600">
                        {formatPrice(community.priceRange)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {community.availability}
                      </p>
                    </div>
                    
                    <Button 
                      className="w-full mt-2" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCommunityClick(community);
                      }}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
        
        </MapContainer>
        
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium">Loading communities...</span>
            </div>
          </div>
        )}
        
        {/* Error overlay */}
        {error && (
          <div className="absolute inset-0 bg-red-50/90 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <p className="text-red-600 font-medium">Failed to load communities</p>
              <p className="text-sm text-red-500 mt-1">Please try again later</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Minimal Map Stats Overlay - Moved to top-left corner */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg p-2 z-10 shadow-sm">
        <p className="text-xs text-gray-600 font-medium">
          {clusterData?.features?.length || 0} locations
        </p>
      </div>
    </div>
  );
}
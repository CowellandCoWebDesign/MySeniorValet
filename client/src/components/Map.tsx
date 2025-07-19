import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Tooltip } from 'react-leaflet';
import { Icon, LatLngBounds, LatLng } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Import Leaflet CSS explicitly
import 'leaflet/dist/leaflet.css';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Star, MapPin, Phone, Globe, Heart, ExternalLink, Zap, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Extend window interface for map reference
declare global {
  interface Window {
    leafletMap?: any;
  }
}

// Fix for default markers in Leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// WebGL-optimized icons with hardware acceleration hints
const createCustomIcon = (color: string, isHovered = false, isPulsing = false) => {
  const size = isHovered ? [30, 50] : [25, 41];
  const strokeWidth = isHovered ? 3 : 2;
  const opacity = isPulsing ? 0.8 : 1;
  
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="${size[0]}" height="${size[1]}" viewBox="0 0 25 41" style="transform: translateZ(0); will-change: transform;">
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/> 
            </feMerge>
          </filter>
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" ${!isPulsing ? 'begin="indefinite"' : ''}/>
        </defs>
        <path fill="${color}" stroke="#fff" stroke-width="${strokeWidth}" 
              d="M12.5 0C5.6 0 0 5.6 0 12.5c0 7.4 12.5 28.5 12.5 28.5s12.5-21.1 12.5-28.5C25 5.6 19.4 0 12.5 0z"
              opacity="${opacity}" ${isHovered ? 'filter="url(#glow)"' : ''} style="transform: translateZ(0);"/>
        <circle cx="12.5" cy="12.5" r="6" fill="#fff" style="transform: translateZ(0);"/>
        ${isHovered ? '<circle cx="12.5" cy="12.5" r="4" fill="' + color + '" style="transform: translateZ(0);"/>' : ''}
      </svg>
    `)}`,
    iconSize: size,
    iconAnchor: [size[0]/2, size[1]],
    popupAnchor: [0, -size[1]],
    className: `optimized-marker ${isHovered ? 'marker-hover' : ''}`
  });
};

const communityIcon = createCustomIcon('#1e40af'); // Blue
const assistedLivingIcon = createCustomIcon('#16a34a'); // Green
const memoryCareIcon = createCustomIcon('#dc2626'); // Red
const independentIcon = createCustomIcon('#7c3aed'); // Purple

// Map Events component to access the map instance
const MapEvents: React.FC<{ onMapReady: (map: any) => void }> = ({ onMapReady }) => {
  const map = useMap();
  
  useEffect(() => {
    if (map) {
      onMapReady(map);
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
      if (map && map.getBounds) {
        // Enterprise-level debouncing for optimal performance
        clearTimeout(window.mapBoundsTimeout);
        window.mapBoundsTimeout = setTimeout(() => {
          const bounds = map.getBounds();
          onBoundsChange(bounds);
          console.log('handleBoundsChange called with bounds:', {
            west: bounds.getWest().toFixed(3),
            east: bounds.getEast().toFixed(3),
            south: bounds.getSouth().toFixed(3),
            north: bounds.getNorth().toFixed(3)
          });
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
      
      // Force initial bounds and zoom
      setTimeout(() => {
        console.log('Setting initial bounds and zoom');
        handleBoundsChange();
        handleZoomChange();
      }, 100);
      
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
  const [center, setCenter] = useState<[number, number]>(initialCenter || [34.0522, -118.2437]); // Default: Los Angeles
  const [zoom, setZoom] = useState(initialZoom || 12); // City-level zoom (12-14 is city level)
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<'prompt' | 'granted' | 'denied' | 'checking'>('checking');
  const [hasRequestedLocation, setHasRequestedLocation] = useState(() => {
    // Check if user has already made a decision about location
    return localStorage.getItem('map-location-requested') === 'true';
  });
  const queryClient = useQueryClient();
  const [mapBounds, setMapBounds] = useState<LatLngBounds | null>(null);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [hoveredCluster, setHoveredCluster] = useState<number | null>(null);
  const [hoveredCommunity, setHoveredCommunity] = useState<number | null>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);

  // Handle map bounds change
  const handleBoundsChange = useCallback((bounds: LatLngBounds) => {
    console.log('handleBoundsChange called with bounds:', {
      west: bounds.getWest().toFixed(3),
      east: bounds.getEast().toFixed(3),
      south: bounds.getSouth().toFixed(3),
      north: bounds.getNorth().toFixed(3)
    });
    setMapBounds(bounds);
    onBoundsChange?.(bounds);
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
          const map = mapRef.current;
          if (map) {
            map.setView([latitude, longitude], 13, { animate: true });
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
      mapBounds ? `${mapBounds.getSouthWest().lng.toFixed(4)},${mapBounds.getSouthWest().lat.toFixed(4)},${mapBounds.getNorthEast().lng.toFixed(4)},${mapBounds.getNorthEast().lat.toFixed(4)}` : 'default',
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
    staleTime: 0, // Real-time data for natural clustering
    refetchOnWindowFocus: false,
    gcTime: 0, // No cache - always fresh data when bounds change
    keepPreviousData: false, // Fresh data on every interaction
    refetchInterval: false, // No auto-refresh
    retry: 1 // Only retry once on failure
  });

  const getIconForCommunity = (community: Community, isHovered = false, isPulsing = false) => {
    const careTypes = community.careTypes || [];
    let baseColor = '#1e40af'; // Blue
    
    if (careTypes.includes('Memory Care')) baseColor = '#dc2626'; // Red
    else if (careTypes.includes('Assisted Living')) baseColor = '#16a34a'; // Green
    else if (careTypes.includes('Independent Living')) baseColor = '#7c3aed'; // Purple
    
    return createCustomIcon(baseColor, isHovered, isPulsing);
  };

  const handleCommunityClick = (community: Community) => {
    setSelectedCommunity(community);
    onCommunityClick?.(community);
  };
  
  // Debug logging
  useEffect(() => {
    console.log('Map component mounted with initial zoom:', zoom, 'center:', center);
  }, []);
  
  useEffect(() => {
    console.log('Map bounds changed:', mapBounds);
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
        {/* Compact Location Button */}
        <div className="absolute top-4 right-4 z-[1000]">
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
            className="bg-white shadow-md hover:shadow-lg w-10 h-10 rounded-full"
            title="Use My Location"
          >
            <MapPin className="h-5 w-5" />
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
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1100] bg-white rounded-lg shadow-lg p-4 max-w-sm" style={{ zIndex: 9999 }}>
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 rounded-full p-2">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Find Communities Near You</h3>
                <p className="text-sm text-gray-600 mb-3">
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
        }} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
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
                  mouseover: () => {
                    setHoveredCluster(properties.cluster_id);
                  },
                  mouseout: () => {
                    setHoveredCluster(null);
                  },
                  click: () => {
                    if (!mapInstance) {
                      console.error('Map instance not available');
                      return;
                    }
                    
                    // Simple zoom in by 3 levels to expand cluster
                    const newZoom = Math.min(currentZoom + 3, 18);
                    
                    // Fly to cluster center and zoom in
                    mapInstance.flyTo([lat, lng], newZoom, {
                      animate: true,
                      duration: 0.5
                    });
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
              key={`community-${properties.id}`}
              position={[lat, lng]}
              icon={getIconForCommunity(community, hoveredCommunity === community.id, false)}
              eventHandlers={{
                click: () => {
                  handleCommunityClick(community);
                },
                mouseover: () => {
                  setHoveredCommunity(community.id);
                },
                mouseout: () => {
                  setHoveredCommunity(null);
                }
              }}
            >
              {/* Enhanced tooltip for hover states */}
              {hoveredCommunity === community.id && (
                <Tooltip permanent>
                  <div className="bg-white/95 backdrop-blur-sm rounded-lg p-2 shadow-lg border">
                    <div className="font-semibold text-sm">{community.name}</div>
                    <div className="text-xs text-gray-600">{community.city}, {community.state}</div>
                    <div className="text-xs text-blue-600 font-medium">{formatPrice(community.priceRange)}</div>
                  </div>
                </Tooltip>
              )}
              
              <Popup>
                <div className="w-80 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg leading-tight">{community.name}</h3>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
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
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
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
                      onClick={() => handleCommunityClick(community)}
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
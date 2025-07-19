import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Tooltip } from 'react-leaflet';
import { Icon, LatLngBounds, LatLng } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useQuery } from '@tanstack/react-query';
import { Star, MapPin, Phone, Globe, Heart, ExternalLink, Zap, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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
  onZoomChange: (zoom: number) => void;
}) {
  const map = useMap();
  const [initialized, setInitialized] = useState(false);
  
  const handleBoundsChange = useCallback(() => {
    try {
      if (map && map.getBounds) {
        // Add small delay to prevent excessive API calls during dragging
        clearTimeout(window.mapBoundsTimeout);
        window.mapBoundsTimeout = setTimeout(() => {
          onBoundsChange(map.getBounds());
        }, 250); // 250ms debounce for smoother experience
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
      // Set up event handlers for map movement with better responsiveness
      map.on('moveend', handleBoundsChange);
      map.on('zoomend', handleZoomChange);
      map.on('drag', handleBoundsChange); // Update during drag for better UX
      
      // Initial bounds and zoom
      handleBoundsChange();
      handleZoomChange();
      
      setInitialized(true);
    }
    
    return () => {
      if (map) {
        map.off('moveend', handleBoundsChange);
        map.off('zoomend', handleZoomChange);
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
  center = [39.8283, -98.5795], // Geographic center of US
  zoom = 3
}: MapProps) {
  const [mapBounds, setMapBounds] = useState<LatLngBounds | null>(null);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [expandingCluster, setExpandingCluster] = useState<number | null>(null);
  const [transitionState, setTransitionState] = useState<'idle' | 'expanding' | 'complete'>('idle');
  const [hoveredCluster, setHoveredCluster] = useState<number | null>(null);
  const [hoveredCommunity, setHoveredCommunity] = useState<number | null>(null);
  const [pulsingMarkers, setPulsingMarkers] = useState<Set<number>>(new Set());
  const [animatingClusters, setAnimatingClusters] = useState<Set<number>>(new Set());

  // Handle map bounds change
  const handleBoundsChange = useCallback((bounds: LatLngBounds) => {
    setMapBounds(bounds);
    onBoundsChange?.(bounds);
  }, [onBoundsChange]);

  // Handle zoom change
  const handleZoomChange = useCallback((zoomLevel: number) => {
    setCurrentZoom(zoomLevel);
  }, []);

  // Track current zoom level for supercluster
  const [currentZoom, setCurrentZoom] = useState(zoom);
  
  // Performance tracking state
  const [performanceMetrics, setPerformanceMetrics] = useState({
    renderTime: 0,
    markerCount: 0,
    memoryUsage: 0,
    lastUpdate: Date.now()
  });

  // Viewport-based optimization: Only render clusters in current view with buffer
  const getOptimizedBounds = useCallback((bounds: LatLngBounds | null) => {
    if (!bounds) {
      // Use full North America bounds for initial load
      return {
        west: -170.0, // Include Alaska
        south: 14.0, // Include southern Mexico  
        east: -50.0, // Include eastern Canada
        north: 70.0 // Include northern Canada
      };
    }

    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    
    // Add 20% buffer around viewport for smoother panning
    const latBuffer = (ne.lat - sw.lat) * 0.2;
    const lngBuffer = (ne.lng - sw.lng) * 0.2;
    
    return {
      west: Math.max(-180, sw.lng - lngBuffer),
      south: Math.max(-90, sw.lat - latBuffer),
      east: Math.min(180, ne.lng + lngBuffer),
      north: Math.min(90, ne.lat + latBuffer)
    };
  }, []);

  // Fetch clustered communities using supercluster service with viewport optimization
  const { data: clusterData, isLoading, error } = useQuery({
    queryKey: ['communities-clusters', 
      mapBounds ? `${mapBounds.getSouthWest().lng.toFixed(3)},${mapBounds.getSouthWest().lat.toFixed(3)},${mapBounds.getNorthEast().lng.toFixed(3)},${mapBounds.getNorthEast().lat.toFixed(3)}` : 'default',
      currentZoom, 
      searchFilters
    ],
    queryFn: async () => {
      const renderStart = performance.now();
      const bounds = getOptimizedBounds(mapBounds);
      
      const params = new URLSearchParams({
        bbox: `${bounds.west},${bounds.south},${bounds.east},${bounds.north}`,
        zoom: currentZoom.toString(),
        viewport: 'true' // Enable viewport optimization on server
      });
      
      console.log('Optimized viewport request:', bounds, 'zoom:', currentZoom);
      
      const response = await fetch(`/api/communities/clusters?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch clusters');
      }
      
      const data = await response.json();
      const renderTime = performance.now() - renderStart;
      
      // Update performance metrics
      setPerformanceMetrics(prev => ({
        renderTime: Math.round(renderTime),
        markerCount: data.features?.length || 0,
        memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
        lastUpdate: Date.now()
      }));
      
      return data;
    },
    enabled: !!mapBounds || currentZoom > 0,
    staleTime: 30000, // Reduced for more responsive viewport updates
    refetchOnWindowFocus: false,
    gcTime: 300000,
    keepPreviousData: true
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

  const formatPrice = (priceRange: string) => {
    if (!priceRange) return 'Contact for pricing';
    return priceRange;
  };

  return (
    <div className="w-full flex" style={{ height }}>
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
      <div className="flex-1 relative">
        {/* Transition overlay for smooth expansion effects */}
        {transitionState === 'expanding' && (
          <div className="map-transition-overlay active">
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                  <span className="text-xs font-medium">Expanding...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <MapContainer
          center={center}
          zoom={zoom}
          minZoom={3}
          maxZoom={18}
          bounds={[[14.0, -170.0], [70.0, -50.0]]} // Full North America including Alaska and Mexico
          style={{ height: '100%', width: '100%' }}
          className="rounded-lg"
        >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <MapBoundsHandler onBoundsChange={handleBoundsChange} onZoomChange={handleZoomChange} />
        
        {/* Supercluster-powered markers and clusters */}
        {clusterData?.features?.map((feature: any, index: number) => {
          const [lng, lat] = feature.geometry.coordinates;
          const { properties } = feature;
          
          // Handle cluster markers (multiple communities)
          if (properties.cluster) {
            // Create dynamic cluster icon with intelligent expansion feedback
            const size = Math.min(40 + Math.log10(properties.point_count || 1) * 8, 60);
            const isExpanding = expandingCluster === properties.cluster_id;
            const expandingSize = isExpanding ? size * 1.1 : size;
            
            // Enhanced cluster styling with hover and expansion states
            const isHovered = hoveredCluster === properties.cluster_id;
            const isAnimating = animatingClusters.has(properties.cluster_id);
            const clusterColor = isExpanding ? '#3b82f6' : isHovered ? '#2563eb' : '#1e40af';
            const hoverGlow = isHovered ? `
              <circle cx="${expandingSize/2}" cy="${expandingSize/2}" r="${expandingSize/2 + 2}" fill="none" stroke="#fbbf24" stroke-width="2" opacity="0.6">
                <animate attributeName="stroke-opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/>
              </circle>
            ` : '';
            const pulseEffect = isExpanding ? `
              <circle cx="${expandingSize/2}" cy="${expandingSize/2}" r="${expandingSize/2 - 2}" fill="${clusterColor}" stroke="#fff" stroke-width="3" opacity="0.8">
                <animate attributeName="r" values="${expandingSize/2 - 2};${expandingSize/2 + 4};${expandingSize/2 - 2}" dur="1.5s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.8;0.4;0.8" dur="1.5s" repeatCount="indefinite"/>
              </circle>
            ` : '';
            
            const clusterIcon = new Icon({
              iconUrl: `data:image/svg+xml;base64,${btoa(`
                <svg xmlns="http://www.w3.org/2000/svg" width="${expandingSize}" height="${expandingSize}" viewBox="0 0 ${expandingSize} ${expandingSize}">
                  ${hoverGlow}
                  ${pulseEffect}
                  <circle cx="${expandingSize/2}" cy="${expandingSize/2}" r="${expandingSize/2 - 2}" fill="${clusterColor}" stroke="#fff" stroke-width="${isHovered ? 4 : 3}"/>
                  <circle cx="${expandingSize/2}" cy="${expandingSize/2}" r="${expandingSize/2 - 6}" fill="rgba(59, 130, 246, ${isHovered ? 0.5 : 0.3})" stroke="none"/>
                  <text x="${expandingSize/2}" y="${expandingSize/2 + 4}" text-anchor="middle" fill="#fff" font-size="${Math.min(12, expandingSize/4)}" font-weight="bold">
                    ${properties.point_count_abbreviated}
                  </text>
                  ${isExpanding ? `
                    <circle cx="${expandingSize/2}" cy="${expandingSize/2}" r="${expandingSize/2 - 1}" fill="none" stroke="#fbbf24" stroke-width="2" opacity="0.7">
                      <animate attributeName="stroke-dasharray" values="0,${Math.PI * 2 * (expandingSize/2 - 1)};${Math.PI * 2 * (expandingSize/2 - 1)},0" dur="1.2s" repeatCount="1"/>
                    </circle>
                  ` : ''}
                </svg>
              `)}`,
              iconSize: [expandingSize, expandingSize],
              iconAnchor: [expandingSize/2, expandingSize/2],
              popupAnchor: [0, -expandingSize/2],
              className: `cluster-marker ${isExpanding ? 'expanding' : ''}`
            });

            return (
              <Marker
                key={`cluster-${properties.cluster_id}`}
                position={[lat, lng]}
                icon={clusterIcon}
                eventHandlers={{
                  mouseover: () => {
                    setHoveredCluster(properties.cluster_id);
                    setAnimatingClusters(prev => new Set([...prev, properties.cluster_id]));
                  },
                  mouseout: () => {
                    setHoveredCluster(null);
                    setAnimatingClusters(prev => {
                      const newSet = new Set(prev);
                      newSet.delete(properties.cluster_id);
                      return newSet;
                    });
                  },
                  click: async () => {
                    console.log('Intelligent cluster expansion:', properties.cluster_id, 'with', properties.point_count, 'communities');
                    
                    // Prevent multiple simultaneous expansions
                    if (expandingCluster !== null) {
                      console.log('Expansion already in progress, ignoring click');
                      return;
                    }
                    
                    try {
                      // Set expansion state for visual feedback
                      setExpandingCluster(properties.cluster_id);
                      setTransitionState('expanding');
                      
                      // Get optimal expansion zoom level from server
                      const response = await fetch(`/api/communities/clusters/${properties.cluster_id}/expansion-zoom`);
                      const data = await response.json();
                      
                      // Get map instance for intelligent expansion
                      const mapContainer = document.querySelector('.leaflet-container') as any;
                      if (mapContainer && mapContainer._leaflet_map) {
                        const map = mapContainer._leaflet_map;
                        
                        // Intelligent zoom calculation based on cluster characteristics
                        const expansionZoom = data.expansionZoom || currentZoom + 3;
                        
                        // Optimized zoom targeting for granular clustering
                        let targetZoom;
                        if (properties.point_count > 500) {
                          // Very large clusters: conservative zoom
                          targetZoom = Math.min(expansionZoom + 1, currentZoom + 2);
                        } else if (properties.point_count > 50) {
                          // Large clusters: moderate zoom
                          targetZoom = Math.min(expansionZoom + 1, currentZoom + 3);
                        } else if (properties.point_count > 10) {
                          // Medium clusters: normal zoom
                          targetZoom = Math.min(expansionZoom + 2, currentZoom + 4);
                        } else if (properties.point_count > 3) {
                          // Small clusters: aggressive zoom
                          targetZoom = Math.min(expansionZoom + 3, currentZoom + 5);
                        } else {
                          // Very small clusters: maximum zoom to show individuals
                          targetZoom = Math.min(expansionZoom + 4, 18);
                        }
                        
                        // Ensure meaningful zoom increase for granular breakdown
                        targetZoom = Math.max(targetZoom, currentZoom + 2);
                        targetZoom = Math.min(targetZoom, 18);
                        
                        console.log(`Intelligent expansion: ${properties.point_count} communities, ${currentZoom} → ${targetZoom} (optimal: ${expansionZoom})`);
                        
                        // Smooth transition with enhanced easing
                        map.setView([lat, lng], targetZoom, {
                          animate: true,
                          duration: 0.8, // Optimized duration for performance
                          easeLinearity: 0.25
                        });
                        
                        // Progressive data refresh with transition states
                        setTimeout(() => {
                          setTransitionState('complete');
                          
                          // Clear expansion state and refresh data
                          setTimeout(() => {
                            setExpandingCluster(null);
                            setTransitionState('idle');
                            handleZoomChange(targetZoom);
                          }, 100);
                        }, 800); // Match animation duration
                      }
                      
                      // Call optional callback with enhanced data
                      onClusterClick?.(properties.cluster_id, lat, lng, data.expansionZoom);
                      
                    } catch (error) {
                      console.error('Error in intelligent cluster expansion:', error);
                      // Reset expansion state on error
                      setExpandingCluster(null);
                      setTransitionState('idle');
                      
                      // Enhanced fallback with smooth transitions
                      const mapContainer = document.querySelector('.leaflet-container') as any;
                      if (mapContainer && mapContainer._leaflet_map) {
                        const map = mapContainer._leaflet_map;
                        
                        // Intelligent fallback zoom based on cluster characteristics
                        let zoomIncrease;
                        if (properties.point_count > 1000) zoomIncrease = 2;
                        else if (properties.point_count > 100) zoomIncrease = 3;
                        else if (properties.point_count > 50) zoomIncrease = 4;
                        else if (properties.point_count > 10) zoomIncrease = 5;
                        else zoomIncrease = 6;
                        
                        const targetZoom = Math.min(currentZoom + zoomIncrease, 18);
                        
                        map.setView([lat, lng], targetZoom, {
                          animate: true,
                          duration: 0.8,
                          easeLinearity: 0.25
                        });
                        
                        console.log(`Fallback intelligent expansion: ${properties.point_count} communities to zoom ${targetZoom}`);
                        
                        // Fallback data refresh
                        setTimeout(() => {
                          setTransitionState('complete');
                          setTimeout(() => {
                            setExpandingCluster(null);
                            setTransitionState('idle');
                            handleZoomChange(targetZoom);
                          }, 100);
                        }, 800);
                      }
                    }
                  }
                }}
              >
                <Popup>
                  <div className="p-4 text-center">
                    <h4 className="font-bold text-lg mb-1">{properties.point_count} Communities</h4>
                    {isExpanding ? (
                      <div className="text-sm text-blue-600 mb-2 flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        Intelligent expansion in progress...
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600 mb-2">Click for intelligent cluster expansion</p>
                    )}
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Current zoom: {currentZoom}</div>
                      <div className="text-xs text-blue-500">
                        {properties.point_count > 1000 ? 'Large cluster - conservative expansion' :
                         properties.point_count > 100 ? 'Medium cluster - moderate expansion' :
                         properties.point_count > 10 ? 'Small cluster - aggressive expansion' :
                         'Micro cluster - maximum detail expansion'}
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
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
              icon={getIconForCommunity(community, hoveredCommunity === community.id, pulsingMarkers.has(community.id))}
              eventHandlers={{
                click: () => {
                  handleCommunityClick(community);
                  setPulsingMarkers(prev => new Set([...prev, community.id]));
                  // Remove pulse after animation
                  setTimeout(() => {
                    setPulsingMarkers(prev => {
                      const newSet = new Set(prev);
                      newSet.delete(community.id);
                      return newSet;
                    });
                  }, 2000);
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
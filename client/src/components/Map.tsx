import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, LatLngBounds, LatLng } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useQuery } from '@tanstack/react-query';
import { Star, MapPin, Phone, Globe, Heart, ExternalLink } from 'lucide-react';
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

// Custom icons for different community types
const createCustomIcon = (color: string) => new Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">
      <path fill="${color}" stroke="#fff" stroke-width="2" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 7.4 12.5 28.5 12.5 28.5s12.5-21.1 12.5-28.5C25 5.6 19.4 0 12.5 0z"/>
      <circle cx="12.5" cy="12.5" r="6" fill="#fff"/>
    </svg>
  `)}`,
  iconSize: [25, 41],
  iconAnchor: [12.5, 41],
  popupAnchor: [0, -41],
});

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
  
  // Fetch clustered communities using supercluster service with optimized caching
  const { data: clusterData, isLoading, error } = useQuery({
    queryKey: ['communities-clusters', 
      mapBounds ? `${mapBounds.getSouthWest().lng.toFixed(3)},${mapBounds.getSouthWest().lat.toFixed(3)},${mapBounds.getNorthEast().lng.toFixed(3)},${mapBounds.getNorthEast().lat.toFixed(3)}` : 'default',
      currentZoom, 
      searchFilters
    ],
    queryFn: async () => {
      let west, south, east, north;
      
      if (!mapBounds) {
        // Use full North America bounds including Mexico for initial load
        west = -170.0; // Include Alaska
        south = 14.0; // Include southern Mexico  
        east = -50.0; // Include eastern Canada
        north = 70.0; // Include northern Canada
      } else {
        const sw = mapBounds.getSouthWest();
        const ne = mapBounds.getNorthEast();
        west = sw.lng;
        south = sw.lat;
        east = ne.lng;
        north = ne.lat;
      }
      
      const params = new URLSearchParams({
        bbox: `${west},${south},${east},${north}`,
        zoom: currentZoom.toString(),
      });
      
      console.log('Supercluster request:', { west, south, east, north, zoom: currentZoom });
      
      const response = await fetch(`/api/communities/clusters?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch clusters');
      }
      
      return response.json();
    },
    enabled: !!mapBounds || currentZoom > 0, // Enable when we have bounds or valid zoom
    staleTime: 30000, // 30 second cache for more responsive updates
    refetchOnWindowFocus: false, // Don't refetch when switching tabs
    gcTime: 300000, // 5 minute garbage collection for better memory management
    keepPreviousData: true // Keep previous data while loading new data for smoother transitions
  });

  const getIconForCommunity = (community: Community) => {
    const careTypes = community.careTypes || [];
    
    if (careTypes.includes('Memory Care')) return memoryCareIcon;
    if (careTypes.includes('Assisted Living')) return assistedLivingIcon;
    if (careTypes.includes('Independent Living')) return independentIcon;
    
    return communityIcon;
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
      {/* Map Container */}
      <div className="flex-1 relative">
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
            // Create dynamic cluster icon size based on point count
            const size = Math.min(40 + Math.log10(properties.point_count || 1) * 8, 60);
            const clusterIcon = new Icon({
              iconUrl: `data:image/svg+xml;base64,${btoa(`
                <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
                  <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="#1e40af" stroke="#fff" stroke-width="3"/>
                  <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 6}" fill="rgba(59, 130, 246, 0.3)" stroke="none"/>
                  <text x="${size/2}" y="${size/2 + 4}" text-anchor="middle" fill="#fff" font-size="${Math.min(12, size/4)}" font-weight="bold">
                    ${properties.point_count_abbreviated}
                  </text>
                </svg>
              `)}`,
              iconSize: [size, size],
              iconAnchor: [size/2, size/2],
              popupAnchor: [0, -size/2],
              className: 'cluster-marker'
            });

            return (
              <Marker
                key={`cluster-${properties.cluster_id}`}
                position={[lat, lng]}
                icon={clusterIcon}
                eventHandlers={{
                  click: async () => {
                    console.log('Cluster clicked:', properties.cluster_id);
                    
                    try {
                      // Get optimal expansion zoom level from server
                      const response = await fetch(`/api/communities/clusters/${properties.cluster_id}/expansion-zoom`);
                      const data = await response.json();
                      
                      // Get map instance and zoom to cluster
                      const mapContainer = document.querySelector('.leaflet-container') as any;
                      if (mapContainer && mapContainer._leaflet_map) {
                        const map = mapContainer._leaflet_map;
                        // Use expansion zoom with fallback, ensuring meaningful zoom increase
                        const expansionZoom = data.expansionZoom || currentZoom + 3;
                        const targetZoom = Math.min(Math.max(expansionZoom, currentZoom + 2), 18);
                        
                        map.setView([lat, lng], targetZoom, {
                          animate: true,
                          duration: 0.8,
                          easeLinearity: 0.5
                        });
                        
                        console.log(`Zooming to cluster ${properties.cluster_id} from ${currentZoom} to ${targetZoom} (expansion: ${expansionZoom})`);
                        
                        // Force refresh cluster data after zoom
                        setTimeout(() => {
                          handleZoomChange(targetZoom);
                        }, 900);
                      }
                      
                      // Call optional callback
                      onClusterClick?.(properties.cluster_id, lat, lng, data.expansionZoom);
                      
                    } catch (error) {
                      console.error('Error expanding cluster:', error);
                      // Fallback: intelligent zoom based on cluster size
                      const mapContainer = document.querySelector('.leaflet-container') as any;
                      if (mapContainer && mapContainer._leaflet_map) {
                        const map = mapContainer._leaflet_map;
                        // Zoom more for smaller clusters, less for larger ones
                        const zoomIncrease = properties.point_count > 100 ? 2 : 
                                           properties.point_count > 50 ? 3 : 
                                           properties.point_count > 10 ? 4 : 5;
                        const targetZoom = Math.min(currentZoom + zoomIncrease, 18);
                        map.setView([lat, lng], targetZoom, {
                          animate: true,
                          duration: 0.8,
                          easeLinearity: 0.5
                        });
                        console.log(`Fallback zoom for cluster with ${properties.point_count} communities to level ${targetZoom}`);
                        
                        // Force refresh cluster data after zoom
                        setTimeout(() => {
                          handleZoomChange(targetZoom);
                        }, 900);
                      }
                    }
                  }
                }}
              >
                <Popup>
                  <div className="p-3 text-center">
                    <h4 className="font-bold text-lg">{properties.point_count} Communities</h4>
                    <p className="text-sm text-gray-600 mb-2">Click cluster to zoom in and explore</p>
                    <div className="text-xs text-gray-500">
                      Zoom level: {currentZoom}
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
              icon={getIconForCommunity(community)}
              eventHandlers={{
                click: () => handleCommunityClick(community)
              }}
            >
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
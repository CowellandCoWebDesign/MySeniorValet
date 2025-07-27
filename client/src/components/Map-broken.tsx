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
        onBoundsChange(map.getBounds());
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
      // Set up event handlers for map movement
      map.on('moveend', handleBoundsChange);
      map.on('zoomend', () => {
        handleBoundsChange();
        handleZoomChange();
      });
      map.on('dragend', handleBoundsChange);
      
      // Initial bounds when map is ready
      map.whenReady(() => {
        setTimeout(() => {
          handleBoundsChange();
          handleZoomChange();
        }, 100);
      });
      
      setInitialized(true);
    }
    
    return () => {
      if (map) {
        map.off('moveend', handleBoundsChange);
        map.off('zoomend', handleBoundsChange);
        map.off('dragend', handleBoundsChange);
      }
    };
  }, [map, handleBoundsChange, handleZoomChange, initialized]);
  
  return null;
}

export default function Map({ 
  searchFilters = {}, 
  onCommunityClick, 
  onBoundsChange,
  onClusterClick,
  height = "500px",
  center = [37.0, -119.0], // Default to California center
  zoom = 6
}: MapProps) {
  const [mapBounds, setMapBounds] = useState<LatLngBounds | null>(null);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  
  const handleBoundsChange = useCallback((bounds: LatLngBounds) => {
    setMapBounds(bounds);
    onBoundsChange?.(bounds);
  }, [onBoundsChange]);

  const handleZoomChange = useCallback((zoom: number) => {
    setCurrentZoom(zoom);
  }, []);

  // Track current zoom level for supercluster
  const [currentZoom, setCurrentZoom] = useState(zoom);
  
  // Fetch clustered communities using supercluster service
  const { data: clusterData, isLoading, error } = useQuery({
    queryKey: ['communities-clusters', mapBounds, currentZoom, searchFilters],
    queryFn: async () => {
      let west, south, east, north;
      
      if (!mapBounds) {
        // Use default North America bounds for better coverage display
        west = -140.0; // Western North America
        south = 25.0; // Southern North America
        east = -60.0; // Eastern North America
        north = 60.0; // Northern North America
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
    enabled: true, // Always enabled - will use fallback bounds if needed
    staleTime: 30000, // 30 second cache time for better performance
    gcTime: 60000, // 1 minute garbage collection time
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
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
          maxZoom={16}
          bounds={[[14.0, -140.0], [70.0, -52.0]]} // North America bounds for 25,000+ communities
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
            const clusterIcon = new Icon({
              iconUrl: `data:image/svg+xml;base64,${btoa(`
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="20" fill="#1e40af" stroke="#fff" stroke-width="2"/>
                  <text x="20" y="26" text-anchor="middle" fill="#fff" font-size="12" font-weight="bold">
                    ${properties.point_count_abbreviated}
                  </text>
                </svg>
              `)}`,
              iconSize: [40, 40],
              iconAnchor: [20, 20],
            });
            
            return (
              <Marker
                key={`cluster-${properties.cluster_id}`}
                position={[lat, lng]}
                icon={clusterIcon}
                eventHandlers={{
                  click: async () => {
                    // Call cluster click callback with current zoom level
                    if (onClusterClick) {
                      onClusterClick(properties.cluster_id, lat, lng, currentZoom);
                    }
                    
                    // Get cluster expansion zoom to zoom into cluster
                    try {
                      const response = await fetch(`/api/communities/clusters/${properties.cluster_id}/expansion-zoom`);
                      const data = await response.json();
                      const map = (document.querySelector('.leaflet-container') as any)?._leaflet_map;
                      if (map) {
                        map.setView([lat, lng], data.expansionZoom);
                      }
                    } catch (error) {
                      console.error('Error expanding cluster:', error);
                    }
                  },
                }}
              >
                <Popup>
                  <div className="text-center">
                    <div className="font-semibold text-lg text-blue-900">
                      {properties.point_count} Communities
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Click to zoom in and see individual communities
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          }
          
          // Handle individual community markers
          const community = {
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
            phone: properties.phone,
            website: properties.website,
            priceRange: properties.priceRange,
            availability: properties.availability,
            photos: properties.photos || [],
            description: properties.description || '',
          };
          
          return (
            <Marker
              key={`community-${properties.id}`}
              position={[lat, lng]}
              icon={getIconForCommunity(community)}
              eventHandlers={{
                click: () => handleCommunityClick(community),
              }}
            >
              <Popup maxWidth={400} className="custom-popup">
                <Card className="border-0 shadow-none">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Header */}
                      <div>
                        <h3 className="font-semibold text-lg leading-tight">
                          {community.name}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {community.address}, {community.city}, {community.state} {community.zipCode}
                        </p>
                      </div>
                      
                      {/* Rating */}
                      {community.rating > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{community.rating}</span>
                          </div>
                          <span className="text-sm text-gray-600">
                            ({community.reviewCount} reviews)
                          </span>
                        </div>
                      )}
                      
                      {/* Care Types */}
                      <div className="flex flex-wrap gap-1">
                        {community.careTypes?.map((type, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                      
                      {/* Pricing */}
                      <div className="bg-blue-50 p-2 rounded">
                        <p className="text-sm font-medium text-blue-900">
                          {formatPrice(community.priceRange)}
                        </p>
                        {community.availability && (
                          <p className="text-xs text-blue-700">
                            {community.availability}
                          </p>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleCommunityClick(community)}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                        
                        {community.phone && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.open(`tel:${community.phone}`)}
                          >
                            <Phone className="w-4 h-4" />
                          </Button>
                        )}
                        
                        {community.website && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.open(community.website, '_blank')}
                          >
                            <Globe className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {/* Loading/Error States */}
      {isLoading && (
        <div className="absolute top-4 left-4 bg-white p-2 rounded shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">Loading communities...</span>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute top-4 left-4 bg-red-50 text-red-700 p-2 rounded shadow-lg">
          <span className="text-sm">Error loading communities</span>
        </div>
      )}
      
      {/* Community Count */}
      {!isLoading && clusterData?.features && clusterData.features.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white p-2 rounded shadow-lg">
          <span className="text-sm font-medium">
            {clusterData.features.length} clusters/communities found
          </span>
        </div>
      )}
      </div>
    </div>
  );
}
import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, LatLngBounds, LatLng } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useQuery } from '@tanstack/react-query';
import { Star, MapPin, Phone, Globe, Heart, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import MarkerClusterGroup from 'react-leaflet-cluster';

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
  height?: string;
  center?: [number, number];
  zoom?: number;
}

// Component to handle map bounds changes
function MapBoundsHandler({ onBoundsChange }: { onBoundsChange: (bounds: LatLngBounds) => void }) {
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
  
  useEffect(() => {
    if (map && !initialized) {
      // Set up event handlers for map movement
      map.on('moveend', handleBoundsChange);
      map.on('zoomend', handleBoundsChange);
      map.on('dragend', handleBoundsChange);
      
      // Initial bounds when map is ready
      map.whenReady(() => {
        setTimeout(() => {
          handleBoundsChange();
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
  }, [map, handleBoundsChange, initialized]);
  
  return null;
}

export default function Map({ 
  searchFilters = {}, 
  onCommunityClick, 
  onBoundsChange,
  height = "500px",
  center = [37.7749, -122.4194], // Default to San Francisco
  zoom = 12
}: MapProps) {
  const [mapBounds, setMapBounds] = useState<LatLngBounds | null>(null);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  
  const handleBoundsChange = useCallback((bounds: LatLngBounds) => {
    setMapBounds(bounds);
    onBoundsChange?.(bounds);
  }, [onBoundsChange]);

  // Fetch communities within map bounds using PostGIS spatial search
  const { data: communities = [], isLoading, error } = useQuery({
    queryKey: ['communities-spatial', mapBounds, searchFilters],
    queryFn: async () => {
      let swLat, swLng, neLat, neLng;
      
      if (!mapBounds) {
        // Use default San Francisco bounds
        swLat = '37.7049';
        swLng = '-122.5262';
        neLat = '37.8449';
        neLng = '-122.3832';
      } else {
        const sw = mapBounds.getSouthWest();
        const ne = mapBounds.getNorthEast();
        swLat = sw.lat.toString();
        swLng = sw.lng.toString();
        neLat = ne.lat.toString();
        neLng = ne.lng.toString();
      }
      
      // Calculate appropriate limit based on zoom level (approximate)
      const bounds = mapBounds ? mapBounds : null;
      let limit = '500';
      
      if (bounds) {
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();
        const latSpan = ne.lat - sw.lat;
        const lngSpan = ne.lng - sw.lng;
        const area = latSpan * lngSpan;
        
        // Optimize for nationwide scaling (up to 40,000+ communities)
        if (area > 1000) limit = '5000'; // Continental US level
        else if (area > 500) limit = '3000'; // Multi-state regions
        else if (area > 100) limit = '2000'; // State/large region level
        else if (area > 50) limit = '1500'; // Large metro areas
        else if (area > 10) limit = '1000'; // Metro/city level
        else if (area > 1) limit = '800'; // City districts
        else limit = '500'; // Neighborhood level
      }
      
      const params = new URLSearchParams({
        swLat,
        swLng,
        neLat,
        neLng,
        limit,
        ...(searchFilters.careType && { careType: searchFilters.careType }),
        ...(searchFilters.minRating && { minRating: searchFilters.minRating.toString() }),
      });
      
      const response = await fetch(`/api/communities/search/spatial?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch communities');
      }
      
      return response.json();
    },
    enabled: true, // Always enabled - will use fallback bounds if needed
    staleTime: 2000, // Very short cache time for dynamic updates
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    gcTime: 5000, // Garbage collect after 5 seconds
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
          minZoom={2}
          maxZoom={19}
          style={{ height: '100%', width: '100%' }}
          className="rounded-lg"
        >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <MapBoundsHandler onBoundsChange={handleBoundsChange} />
        
        {/* Clustered community markers */}
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={50}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
          zoomToBoundsOnClick={true}
          removeOutsideVisibleBounds={true}
          animate={true}
          animateAddingMarkers={true}
          disableClusteringAtZoom={16}
        >
          {communities.map((community: Community) => (
          <Marker
            key={community.id}
            position={[community.latitude, community.longitude]}
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
          ))}
        </MarkerClusterGroup>
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
      {!isLoading && communities.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white p-2 rounded shadow-lg">
          <span className="text-sm font-medium">
            {communities.length} communities found
          </span>
        </div>
      )}
      </div>
    </div>
  );
}
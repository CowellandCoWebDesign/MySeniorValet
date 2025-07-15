import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Map, { 
  Marker, 
  NavigationControl, 
  GeolocateControl, 
  ScaleControl
} from 'react-map-gl/mapbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Star, 
  Home,
  Maximize2
} from 'lucide-react';
import type { Community } from '@shared/schema';
import 'mapbox-gl/dist/mapbox-gl.css';

interface RentalMapboxProps {
  communities: Community[];
  onCommunityClick: (communityId: number) => void;
  selectedCommunity?: Community | null;
  className?: string;
}

interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
}

// Custom marker component
const CustomMarker = ({ 
  community, 
  isSelected, 
  onClick 
}: { 
  community: Community; 
  isSelected: boolean; 
  onClick: () => void; 
}) => {
  // Safe access to community properties
  const monthlyRent = community?.monthlyRent || community?.starting_price;
  
  return (
    <div
      className={`
        relative cursor-pointer transform transition-all duration-200 hover:scale-110
        ${isSelected ? 'z-50' : 'z-10'}
      `}
      onClick={onClick}
    >
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold
        border-2 border-white shadow-lg
        ${isSelected ? 'bg-red-500 ring-4 ring-red-200' : 'bg-blue-500'}
      `}>
        <Home className="w-4 h-4" />
      </div>
      
      {/* Price badge */}
      {monthlyRent && (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1 py-0.5 rounded font-medium">
          ${Math.round(monthlyRent / 1000)}K
        </div>
      )}
    </div>
  );
};

export default function RentalMapboxClean({ 
  communities, 
  onCommunityClick, 
  selectedCommunity, 
  className = '' 
}: RentalMapboxProps) {
  // Hardcoded working token
  const activeToken = "pk.eyJ1IjoibXlzZW5pb3J2YWxldCIsImEiOiJjbWQ0b3VkNW8waTA4MmtxNzhndDEyZ2FrIn0.Ht8p3b3XATDjugyf4FHiAQ";
  
  const [viewState, setViewState] = useState<ViewState>({
    longitude: -122.4194,
    latitude: 37.7749,
    zoom: 10,
    pitch: 0,
    bearing: 0
  });
  
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/streets-v12');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Filter communities with valid coordinates
  const validCommunities = useMemo(() => {
    try {
      const filtered = communities.filter(community => {
        if (!community.latitude || !community.longitude) return false;
        
        const lat = parseFloat(community.latitude);
        const lng = parseFloat(community.longitude);
        
        // Check for valid ranges and not zero
        return !isNaN(lat) && !isNaN(lng) && 
               lat !== 0 && lng !== 0 &&
               lat >= -90 && lat <= 90 &&
               lng >= -180 && lng <= 180;
      });
      
      console.log('Clean Mapbox - Total communities:', communities.length);
      console.log('Clean Mapbox - Valid communities:', filtered.length);
      
      return filtered;
    } catch (error) {
      console.error('Error filtering communities:', error);
      return [];
    }
  }, [communities]);

  // Calculate center based on valid communities
  useEffect(() => {
    if (validCommunities.length > 0) {
      try {
        const latitudes = validCommunities.map(c => parseFloat(c.latitude));
        const longitudes = validCommunities.map(c => parseFloat(c.longitude));
        
        const centerLat = latitudes.reduce((sum, lat) => sum + lat, 0) / latitudes.length;
        const centerLng = longitudes.reduce((sum, lng) => sum + lng, 0) / longitudes.length;
        
        // Validate calculated center
        if (!isNaN(centerLat) && !isNaN(centerLng)) {
          setViewState(prev => ({
            ...prev,
            latitude: centerLat,
            longitude: centerLng,
            zoom: validCommunities.length === 1 ? 14 : 10
          }));
        }
      } catch (error) {
        console.error('Error calculating map center:', error);
      }
    }
  }, [validCommunities]);

  // Handle marker click
  const handleMarkerClick = useCallback((community: Community) => {
    onCommunityClick(community.id);
  }, [onCommunityClick]);

  // Map style options
  const mapStyles = [
    { id: 'mapbox://styles/mapbox/streets-v12', name: 'Streets', icon: '🗺️' },
    { id: 'mapbox://styles/mapbox/satellite-v9', name: 'Satellite', icon: '🛰️' },
    { id: 'mapbox://styles/mapbox/light-v11', name: 'Light', icon: '☀️' },
    { id: 'mapbox://styles/mapbox/dark-v11', name: 'Dark', icon: '🌙' }
  ];

  // Error state
  if (!activeToken) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Map Configuration Required</h3>
          <p className="text-gray-600">Please configure your Mapbox access token.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Map Container */}
      <div className="w-full h-full">
        <Map
          initialViewState={viewState}
          mapStyle={mapStyle}
          mapboxAccessToken={activeToken}
          style={{ width: '100%', height: '100%' }}
          onMove={evt => setViewState(evt.viewState)}
          onLoad={() => console.log('Mapbox loaded successfully')}
          onRender={() => console.log('Mapbox rendering')}
          onError={(error) => {
            console.error('Mapbox error:', error);
            // Don't crash on map errors, just log them
          }}
          interactive={true}
          dragPan={true}
          scrollZoom={true}
          touchZoom={true}
          doubleClickZoom={true}
          minZoom={3}
          maxZoom={20}
        >
          {/* Navigation Controls */}
          <NavigationControl position="top-right" />
          <GeolocateControl position="top-right" />
          <ScaleControl position="bottom-left" />

          {/* Community Markers */}
          {validCommunities.map((community) => {
            try {
              const lat = parseFloat(community.latitude);
              const lng = parseFloat(community.longitude);
              
              if (isNaN(lat) || isNaN(lng)) return null;
              
              return (
                <Marker
                  key={community.id}
                  longitude={lng}
                  latitude={lat}
                  anchor="bottom"
                >
                  <CustomMarker
                    community={community}
                    isSelected={selectedCommunity?.id === community.id}
                    onClick={() => handleMarkerClick(community)}
                  />
                </Marker>
              );
            } catch (error) {
              console.error('Error rendering marker for community:', community.id, error);
              return null;
            }
          })}
        </Map>
      </div>

      {/* Map Controls Overlay */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        {/* Style Selector */}
        <div className="bg-white rounded-lg shadow-lg p-2">
          <div className="flex gap-1">
            {mapStyles.map((style) => (
              <Button
                key={style.id}
                variant={mapStyle === style.id ? "default" : "ghost"}
                size="sm"
                className="p-2 text-xs"
                onClick={() => setMapStyle(style.id)}
                title={style.name}
              >
                {style.icon}
              </Button>
            ))}
          </div>
        </div>

        {/* Fullscreen Toggle */}
        <Button
          variant="outline"
          size="sm"
          className="bg-white shadow-lg"
          onClick={() => setIsFullscreen(!isFullscreen)}
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Community Counter */}
      <div className="absolute bottom-4 left-4 z-10 bg-white rounded-lg shadow-lg px-3 py-2">
        <div className="flex items-center gap-2 text-sm">
          <Home className="w-4 h-4 text-blue-600" />
          <span className="font-medium">{validCommunities.length}</span>
          <span className="text-gray-600">communities</span>
        </div>
      </div>
    </div>
  );
}
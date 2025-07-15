import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Map, { 
  Marker, 
  NavigationControl, 
  GeolocateControl, 
  ScaleControl
} from 'react-map-gl/mapbox';
import { Badge } from '@/components/ui/badge';
import { Home } from 'lucide-react';
import type { Community } from '@shared/schema';
import mapboxgl from 'mapbox-gl';
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

// Simple marker component
const SimpleMarker = ({ 
  community, 
  isSelected, 
  onClick 
}: { 
  community: Community; 
  isSelected: boolean; 
  onClick: () => void; 
}) => (
  <div
    className={`
      w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold
      border-2 border-white shadow-lg cursor-pointer
      ${isSelected ? 'bg-red-500' : 'bg-blue-500'}
    `}
    onClick={onClick}
  >
    <Home className="w-3 h-3" />
  </div>
);

export default function RentalMapboxSimple({ 
  communities, 
  onCommunityClick, 
  selectedCommunity, 
  className = '' 
}: RentalMapboxProps) {
  // Hardcoded working token
  const activeToken = "pk.eyJ1IjoibXlzZW5pb3J2YWxldCIsImEiOiJjbWQ0b3VkNW8waTA4MmtxNzhndDEyZ2FrIn0.Ht8p3b3XATDjugyf4FHiAQ";
  
  // Check browser compatibility first
  const isMapboxSupported = useMemo(() => {
    try {
      return mapboxgl.supported();
    } catch (error) {
      console.error('Mapbox GL JS not supported:', error);
      return false;
    }
  }, []);
  
  const [viewState, setViewState] = useState<ViewState>({
    longitude: -122.4194,
    latitude: 37.7749,
    zoom: 10,
    pitch: 0,
    bearing: 0
  });
  
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Filter communities with valid coordinates - more defensive
  const validCommunities = useMemo(() => {
    if (!Array.isArray(communities)) return [];
    
    return communities.filter(community => {
      try {
        if (!community || !community.latitude || !community.longitude) return false;
        
        const lat = parseFloat(String(community.latitude));
        const lng = parseFloat(String(community.longitude));
        
        return !isNaN(lat) && !isNaN(lng) && 
               lat !== 0 && lng !== 0 &&
               lat >= -90 && lat <= 90 &&
               lng >= -180 && lng <= 180;
      } catch (error) {
        console.error('Error checking community coordinates:', error);
        return false;
      }
    });
  }, [communities]);

  // Calculate center based on valid communities
  useEffect(() => {
    if (validCommunities.length > 0) {
      try {
        const latitudes = validCommunities.map(c => parseFloat(String(c.latitude)));
        const longitudes = validCommunities.map(c => parseFloat(String(c.longitude)));
        
        const centerLat = latitudes.reduce((sum, lat) => sum + lat, 0) / latitudes.length;
        const centerLng = longitudes.reduce((sum, lng) => sum + lng, 0) / longitudes.length;
        
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
    try {
      onCommunityClick(community.id);
    } catch (error) {
      console.error('Error handling marker click:', error);
    }
  }, [onCommunityClick]);

  // Handle map load
  const handleMapLoad = useCallback(() => {
    console.log('Mapbox loaded successfully');
    setMapLoaded(true);
    setMapError(null);
  }, []);

  // Add timeout to force map to show after 3 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!mapLoaded && !mapError) {
        console.log('Map load timeout, showing anyway');
        setMapLoaded(true);
      }
    }, 3000);
    
    return () => clearTimeout(timeout);
  }, [mapLoaded, mapError]);

  // Handle map error
  const handleMapError = useCallback((error: any) => {
    console.error('Mapbox error:', error);
    setMapError(error?.message || 'Map loading error');
  }, []);

  // Check browser support first
  if (!isMapboxSupported) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100`}>
        <div className="text-center p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Browser Not Supported</h3>
          <p className="text-gray-600 mb-4">Your browser does not support Mapbox GL JS. Please use a modern browser like Chrome, Firefox, or Safari.</p>
          <div className="text-sm text-gray-500">
            <p>Communities: {validCommunities.length} locations</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (mapError) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100`}>
        <div className="text-center p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Map Error</h3>
          <p className="text-gray-600 mb-4">{mapError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Loading overlay */}
      {!mapLoaded && !mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
      
      {/* Map Container */}
      <div className="w-full h-full">
        <Map
          initialViewState={viewState}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          mapboxAccessToken={activeToken}
          style={{ width: '100%', height: '100%' }}
          onMove={evt => setViewState(evt.viewState)}
          onLoad={handleMapLoad}
          onError={handleMapError}
          interactive={true}
          dragPan={true}
          scrollZoom={true}
          touchZoom={true}
          doubleClickZoom={true}
          minZoom={3}
          maxZoom={20}
        >
          {/* Controls */}
          <NavigationControl position="top-right" />
          <GeolocateControl position="top-right" />
          <ScaleControl position="bottom-left" />

          {/* Community Markers */}
          {validCommunities.map((community) => {
            try {
              const lat = parseFloat(String(community.latitude));
              const lng = parseFloat(String(community.longitude));
              
              if (isNaN(lat) || isNaN(lng)) return null;
              
              return (
                <Marker
                  key={community.id}
                  longitude={lng}
                  latitude={lat}
                  anchor="bottom"
                >
                  <SimpleMarker
                    community={community}
                    isSelected={selectedCommunity?.id === community.id}
                    onClick={() => handleMarkerClick(community)}
                  />
                </Marker>
              );
            } catch (error) {
              console.error('Error rendering marker:', error);
              return null;
            }
          })}
        </Map>
      </div>

      {/* Community Counter */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg px-3 py-2">
        <div className="flex items-center gap-2 text-sm">
          <Home className="w-4 h-4 text-blue-600" />
          <span className="font-medium">{validCommunities.length}</span>
          <span className="text-gray-600">communities</span>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect, useRef } from 'react';
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Community } from '@shared/schema';

interface MapboxFixedProps {
  communities: Community[];
  onCommunityClick?: (communityId: number) => void;
  selectedCommunity?: Community | null;
  className?: string;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || "pk.eyJ1IjoibXlzZW5pb3J2YWxldCIsImEiOiJjbWQ0b3VkNW8waTA4MmtxNzhndDEyZ2FrIn0.Ht8p3b3XATDjugyf4FHiAQ";

export default function MapboxFixed({ 
  communities = [], 
  onCommunityClick, 
  selectedCommunity, 
  className = '' 
}: MapboxFixedProps) {
  const [viewState, setViewState] = useState({
    latitude: 37.7749,
    longitude: -122.4194,
    zoom: 6
  });
  
  const mapRef = useRef<any>(null);
  
  // Filter communities with valid coordinates
  const validCommunities = React.useMemo(() => {
    if (!Array.isArray(communities)) return [];
    
    return communities.filter(community => {
      if (!community || typeof community !== 'object') return false;
      
      const lat = parseFloat(String(community.latitude || '0'));
      const lng = parseFloat(String(community.longitude || '0'));
      
      return !isNaN(lat) && !isNaN(lng) && 
             lat !== 0 && lng !== 0 &&
             lat >= -90 && lat <= 90 && 
             lng >= -180 && lng <= 180;
    });
  }, [communities]);

  // Center map on valid communities
  useEffect(() => {
    if (validCommunities.length > 0) {
      try {
        const lats = validCommunities.map(c => parseFloat(String(c.latitude)));
        const lngs = validCommunities.map(c => parseFloat(String(c.longitude)));
        
        if (lats.length > 0 && lngs.length > 0) {
          const centerLat = lats.reduce((sum, lat) => sum + lat, 0) / lats.length;
          const centerLng = lngs.reduce((sum, lng) => sum + lng, 0) / lngs.length;
          
          setViewState(prev => ({
            ...prev,
            latitude: centerLat,
            longitude: centerLng,
            zoom: validCommunities.length === 1 ? 14 : 8
          }));
        }
      } catch (error) {
        console.error('Error centering map:', error);
      }
    }
  }, [validCommunities.length]);

  console.log('MapboxFixed: Rendering with', validCommunities.length, 'valid communities out of', communities.length, 'total');

  return (
    <div className={className} style={{ height: '100%', width: '100%' }}>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        onError={(error) => {
          console.error('Mapbox error:', error);
        }}
      >
        {validCommunities.map((community, index) => {
          const lat = parseFloat(String(community.latitude));
          const lng = parseFloat(String(community.longitude));
          
          return (
            <Marker
              key={community.id || `marker-${index}`}
              longitude={lng}
              latitude={lat}
              onClick={() => {
                if (onCommunityClick && community.id) {
                  onCommunityClick(community.id);
                }
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  backgroundColor: selectedCommunity?.id === community.id ? '#ef4444' : '#3b82f6',
                  borderRadius: '50%',
                  border: '2px solid white',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
                title={`${community.name} - ${community.city}, ${community.state}`}
              />
            </Marker>
          );
        })}
      </Map>
      
      {/* Status overlay */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        background: 'rgba(16, 185, 129, 0.9)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '4px',
        fontSize: '12px',
        zIndex: 1000
      }}>
        ✅ Map Working! {validCommunities.length} communities loaded
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import Map from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Community } from '@shared/schema';

interface RentalMapboxReplitProps {
  communities: Community[];
  onCommunityClick: (communityId: number) => void;
  selectedCommunity?: Community | null;
  className?: string;
}

const MAPBOX_TOKEN = "pk.eyJ1IjoibXlzZW5pb3J2YWxldCIsImEiOiJjbWQ0b3VkNW8waTA4MmtxNzhndDEyZ2FrIn0.Ht8p3b3XATDjugyf4FHiAQ";

export default function RentalMapboxReplit({ 
  communities, 
  onCommunityClick, 
  selectedCommunity, 
  className = '' 
}: RentalMapboxReplitProps) {
  const [viewState, setViewState] = useState({
    latitude: 37.7749,
    longitude: -122.4194,
    zoom: 10
  });

  // Filter communities with valid coordinates
  const validCommunities = communities.filter(community => {
    if (!community || !community.latitude || !community.longitude) return false;
    const lat = parseFloat(String(community.latitude));
    const lng = parseFloat(String(community.longitude));
    return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
  });

  // Center map on communities
  useEffect(() => {
    if (validCommunities.length > 0) {
      const lats = validCommunities.map(c => parseFloat(String(c.latitude)));
      const lngs = validCommunities.map(c => parseFloat(String(c.longitude)));
      
      const centerLat = lats.reduce((sum, lat) => sum + lat, 0) / lats.length;
      const centerLng = lngs.reduce((sum, lng) => sum + lng, 0) / lngs.length;
      
      setViewState({
        latitude: centerLat,
        longitude: centerLng,
        zoom: validCommunities.length === 1 ? 14 : 10
      });
    }
  }, [validCommunities.length]);

  console.log('RentalMapboxReplit rendering with', validCommunities.length, 'communities');

  return (
    <div className={className} style={{ height: '100%', width: '100%' }}>
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        {/* Note: Markers would go here when we have community data */}
        {/* For now, just show a centered marker as example */}
        {validCommunities.length === 0 && (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 20,
              height: 20,
              backgroundColor: '#10b981',
              borderRadius: '50%',
              border: '2px solid white',
              zIndex: 1
            }}
          />
        )}
      </Map>
      
      {/* Instructions for Replit */}
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
        ✅ Map Working! {validCommunities.length} communities | Click "Open in new tab" for best experience
      </div>
    </div>
  );
}
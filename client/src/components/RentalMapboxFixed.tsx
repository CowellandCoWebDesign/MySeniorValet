import React, { useState, useEffect, useCallback } from 'react';
import Map, { Marker, Popup, NavigationControl, GeolocateControl } from 'react-map-gl/mapbox';
import type { Community } from '@shared/schema';
import 'mapbox-gl/dist/mapbox-gl.css';

interface RentalMapboxFixedProps {
  communities: Community[];
  onCommunityClick: (communityId: number) => void;
  selectedCommunity?: Community | null;
  className?: string;
}

export default function RentalMapboxFixed({ 
  communities, 
  onCommunityClick, 
  selectedCommunity, 
  className = '' 
}: RentalMapboxFixedProps) {
  const [selectedMarker, setSelectedMarker] = useState<Community | null>(null);
  const [viewState, setViewState] = useState({
    longitude: -120,
    latitude: 36,
    zoom: 5.5
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
      
      setViewState(prev => ({
        ...prev,
        latitude: centerLat,
        longitude: centerLng,
        zoom: validCommunities.length === 1 ? 14 : 10
      }));
    }
  }, [validCommunities.length]);

  const handleMarkerClick = useCallback((e: any, community: Community) => {
    e.originalEvent.stopPropagation();
    setSelectedMarker(community);
    onCommunityClick(community.id);
  }, [onCommunityClick]);

  console.log('RentalMapboxFixed rendering with', validCommunities.length, 'communities');

  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapboxAccessToken="pk.eyJ1IjoibXlzZW5pb3J2YWxldCIsImEiOiJjbWQ0b3VkNW8waTA4MmtxNzhndDEyZ2FrIn0.Ht8p3b3XATDjugyf4FHiAQ"
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
      >
        {/* Navigation Controls */}
        <NavigationControl position="top-right" />
        <GeolocateControl position="top-right" />

        {/* Markers */}
        {validCommunities.map(community => (
          <Marker
            key={community.id}
            longitude={parseFloat(String(community.longitude))}
            latitude={parseFloat(String(community.latitude))}
            onClick={e => handleMarkerClick(e, community)}
            style={{ cursor: 'pointer' }}
          >
            <div style={{
              backgroundColor: selectedCommunity?.id === community.id ? '#ef4444' : '#3b82f6',
              width: 24,
              height: 24,
              borderRadius: '50%',
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }} />
          </Marker>
        ))}

        {/* Popup */}
        {selectedMarker && (
          <Popup
            longitude={parseFloat(String(selectedMarker.longitude))}
            latitude={parseFloat(String(selectedMarker.latitude))}
            onClose={() => setSelectedMarker(null)}
            closeButton={true}
            closeOnClick={false}
            offsetTop={-30}
          >
            <div style={{ padding: '8px', minWidth: '200px' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '4px' }}>{selectedMarker.name}</h3>
              <p style={{ fontSize: '14px', color: '#666' }}>
                {selectedMarker.city}, {selectedMarker.state}
              </p>
              {selectedMarker.monthlyRent && (
                <p style={{ fontSize: '14px', color: '#059669', marginTop: '4px' }}>
                  ${Math.round(selectedMarker.monthlyRent).toLocaleString()}/month
                </p>
              )}
              {selectedMarker.careTypes && selectedMarker.careTypes.length > 0 && (
                <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  {selectedMarker.careTypes.join(', ')}
                </p>
              )}
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
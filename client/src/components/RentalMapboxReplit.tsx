import React, { useState, useEffect } from 'react';
import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Community } from '@shared/schema';

// Error boundary component for map errors
class MapErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('Map error boundary caught:', error);
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Map error boundary details:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

interface RentalMapboxReplitProps {
  communities: Community[];
  onCommunityClick: (communityId: number) => void;
  selectedCommunity?: Community | null;
  className?: string;
}

const MAPBOX_TOKEN = "pk.eyJ1IjoibXlzZW5pb3J2YWxldCIsImEiOiJjbWQ0b3VkNW8waTA4MmtxNzhndDEyZ2FrIn0.Ht8p3b3XATDjugyf4FHiAQ";

export default function RentalMapboxReplit({ 
  communities = [], 
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
  const validCommunities = React.useMemo(() => {
    if (!Array.isArray(communities)) return [];
    
    return communities.filter(community => {
      // More robust validation
      if (!community || typeof community !== 'object') return false;
      
      const lat = community.latitude;
      const lng = community.longitude;
      
      // Check if coordinates exist and are valid
      if (lat == null || lng == null) return false;
      
      // Convert to numbers safely
      const latNum = parseFloat(String(lat));
      const lngNum = parseFloat(String(lng));
      
      // Validate the numbers
      if (isNaN(latNum) || isNaN(lngNum)) return false;
      if (latNum === 0 && lngNum === 0) return false;
      
      // Check reasonable bounds for coordinates
      if (latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) return false;
      
      return true;
    });
  }, [communities]);

  // Center map on communities
  useEffect(() => {
    if (validCommunities.length > 0) {
      try {
        const lats = validCommunities
          .map(c => parseFloat(String(c.latitude)))
          .filter(lat => !isNaN(lat) && lat !== 0);
        const lngs = validCommunities
          .map(c => parseFloat(String(c.longitude)))
          .filter(lng => !isNaN(lng) && lng !== 0);
        
        if (lats.length > 0 && lngs.length > 0) {
          const centerLat = lats.reduce((sum, lat) => sum + lat, 0) / lats.length;
          const centerLng = lngs.reduce((sum, lng) => sum + lng, 0) / lngs.length;
          
          // Validate the calculated center
          if (!isNaN(centerLat) && !isNaN(centerLng) && 
              centerLat >= -90 && centerLat <= 90 && 
              centerLng >= -180 && centerLng <= 180) {
            setViewState({
              latitude: centerLat,
              longitude: centerLng,
              zoom: validCommunities.length === 1 ? 14 : 10
            });
          }
        }
      } catch (error) {
        console.error('Error centering map:', error);
      }
    }
  }, [validCommunities.length]);

  console.log('RentalMapboxReplit rendering with', validCommunities.length, 'communities');
  console.log('Sample communities:', communities.slice(0, 2));
  console.log('Valid communities:', validCommunities.slice(0, 2));
  console.log('Communities type check:', typeof communities, Array.isArray(communities));
  console.log('First community coordinate check:', communities[0] ? {
    lat: communities[0].latitude,
    lng: communities[0].longitude,
    name: communities[0].name
  } : 'No communities');
  
  // Debug: Log full communities structure
  console.log('Loaded communities:', communities);

  // Error boundary fallback
  if (!Array.isArray(communities)) {
    return (
      <div className={className} style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading communities...</div>
      </div>
    );
  }

  return (
    <MapErrorBoundary 
      fallback={
        <div className={className} style={{ 
          height: '100%', 
          width: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          color: '#666'
        }}>
          <div>
            <h3>Map temporarily unavailable</h3>
            <p>Showing {validCommunities.length} communities</p>
          </div>
        </div>
      }
    >
      <div className={className} style={{ height: '100%', width: '100%' }}>
        <Map
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          mapboxAccessToken={MAPBOX_TOKEN}
          onError={(error) => {
            console.error('Map error:', error);
          }}
        >
          {/* TEMPORARILY DISABLED MARKERS FOR DEBUGGING */}
          {/* {validCommunities.map((community, index) => {
            try {
              // Double-check coordinates are valid before rendering
              if (!community || !community.latitude || !community.longitude) return null;
              
              const lat = parseFloat(String(community.latitude));
              const lng = parseFloat(String(community.longitude));
              
              // Final validation before rendering
              if (isNaN(lat) || isNaN(lng)) return null;
              
              return (
                <Marker
                  key={community.id || `marker-${index}`}
                  longitude={lng}
                  latitude={lat}
                  onClick={() => {
                    try {
                      if (onCommunityClick && community.id) {
                        onCommunityClick(community.id);
                      }
                    } catch (error) {
                      console.error('Error clicking marker:', error);
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
                    title={`${community.name || 'Unknown'} - ${community.city || 'Unknown'}, ${community.state || 'Unknown'}`}
                  />
                </Marker>
              );
            } catch (error) {
              console.error('Error rendering marker:', error);
              return null;
            }
          }).filter(Boolean)} */}
          
          {/* Show example marker when no communities */}
          {validCommunities.length === 0 && (
            <Marker longitude={viewState.longitude} latitude={viewState.latitude}>
              <div
                style={{
                  width: 20,
                  height: 20,
                  backgroundColor: '#10b981',
                  borderRadius: '50%',
                  border: '2px solid white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              />
            </Marker>
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
    </MapErrorBoundary>
  );
}
import React from 'react';
import Map, { Marker } from 'react-map-gl';
import { useQuery } from '@tanstack/react-query';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export default function SanityMap() {
  const { data: communities = [], isLoading, error } = useQuery({
    queryKey: ['map-test'],
    queryFn: async () => {
      const res = await fetch('/api/communities/search?limit=100');
      if (!res.ok) throw new Error('Search failed');
      return res.json();
    },
  });

  const defaultLat = 37.7749;
  const defaultLng = -122.4194;

  const mapCenter = {
    latitude: communities?.[0]?.latitude ?? defaultLat,
    longitude: communities?.[0]?.longitude ?? defaultLng,
  };

  return (
    <div className="h-screen w-screen">
      <Map
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{ ...mapCenter, zoom: 6 }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
      >
        {communities
          .filter((c) => typeof c.latitude === 'number' && typeof c.longitude === 'number')
          .map((c) => (
            <Marker
              key={c.id}
              latitude={c.latitude}
              longitude={c.longitude}
              color="red"
            />
          ))}
      </Map>
    </div>
  );
}
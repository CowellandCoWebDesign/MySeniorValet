import React, { useState } from 'react';
import Map, { Marker, Popup, NavigationControl, GeolocateControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Location {
  id: number;
  name: string;
  longitude: number;
  latitude: number;
  description: string;
}

const sampleData: Location[] = [
  {
    id: 1,
    name: "San Francisco",
    longitude: -122.4194,
    latitude: 37.7749,
    description: "The City by the Bay"
  },
  {
    id: 2,
    name: "Los Angeles",
    longitude: -118.2437,
    latitude: 34.0522,
    description: "City of Angels"
  },
  {
    id: 3,
    name: "San Diego",
    longitude: -117.1611,
    latitude: 32.7157,
    description: "America's Finest City"
  }
];

export default function MapboxWorking() {
  const [selectedMarker, setSelectedMarker] = useState<Location | null>(null);
  const [viewState, setViewState] = useState({
    longitude: -120,
    latitude: 36,
    zoom: 5.5
  });

  return (
    <div style={{ width: '100%', height: '500px' }}>
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
        {sampleData.map(location => (
          <Marker
            key={location.id}
            longitude={location.longitude}
            latitude={location.latitude}
            onClick={e => {
              e.originalEvent.stopPropagation();
              setSelectedMarker(location);
            }}
            style={{ cursor: 'pointer' }}
          >
            <div style={{
              backgroundColor: '#ff0000',
              width: 20,
              height: 20,
              borderRadius: '50%',
              border: '2px solid white'
            }} />
          </Marker>
        ))}

        {/* Popup */}
        {selectedMarker && (
          <Popup
            longitude={selectedMarker.longitude}
            latitude={selectedMarker.latitude}
            onClose={() => setSelectedMarker(null)}
            closeButton={true}
            closeOnClick={false}
            offsetTop={-30}
          >
            <div>
              <h3>{selectedMarker.name}</h3>
              <p>{selectedMarker.description}</p>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
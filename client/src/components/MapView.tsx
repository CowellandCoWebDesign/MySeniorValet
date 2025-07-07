import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Community {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  monthlyRent?: number;
  latitude?: number;
  longitude?: number;
  careTypes: string[];
}

interface MapViewProps {
  communities: Community[];
  onCommunityClick: (communityId: number) => void;
}

// Custom marker icon
const communityIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#007cba" width="24" height="24">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
});

export default function MapView({ communities, onCommunityClick }: MapViewProps) {
  const mapRef = useRef<any>(null);

  // Filter communities with valid coordinates
  const mappableCommunities = communities.filter(
    community => community.latitude && community.longitude
  );

  // Calculate map center based on communities
  const center = mappableCommunities.length > 0 
    ? [
        mappableCommunities.reduce((sum, c) => sum + (c.latitude || 0), 0) / mappableCommunities.length,
        mappableCommunities.reduce((sum, c) => sum + (c.longitude || 0), 0) / mappableCommunities.length
      ] as [number, number]
    : [40.315, -122.32] as [number, number]; // Redding, CA default

  return (
    <div className="h-full w-full">
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {mappableCommunities.map((community) => (
          <Marker
            key={community.id}
            position={[community.latitude!, community.longitude!]}
            icon={communityIcon}
            eventHandlers={{
              click: () => onCommunityClick(community.id),
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-semibold text-gray-900 mb-1">{community.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{community.city}, {community.state}</p>
                {community.monthlyRent && (
                  <p className="text-lg font-bold text-blue-600">
                    ${community.monthlyRent.toLocaleString()}/mo
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {community.careTypes.slice(0, 2).join(' • ')}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Community {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  latitude: string;
  longitude: string;
  care_types?: string[];
  starting_price?: number;
  photos?: string[];
}

interface LeafletMapFallbackProps {
  communities: Community[];
  onCommunityClick: (communityId: number) => void;
  selectedCommunity?: Community | null;
  className?: string;
}

export default function LeafletMapFallback({
  communities,
  onCommunityClick,
  selectedCommunity,
  className = "w-full h-full"
}: LeafletMapFallbackProps) {
  const mapRef = useRef<L.Map>(null);

  // Filter communities with valid coordinates
  const validCommunities = communities.filter(c => 
    c.latitude && c.longitude && 
    !isNaN(parseFloat(c.latitude)) && 
    !isNaN(parseFloat(c.longitude))
  );

  console.log('LeafletMapFallback - Valid communities:', validCommunities.length);

  // Calculate center and bounds
  const centerLat = validCommunities.length > 0 
    ? validCommunities.reduce((sum, c) => sum + parseFloat(c.latitude), 0) / validCommunities.length
    : 39.8283; // Default US center
  
  const centerLng = validCommunities.length > 0
    ? validCommunities.reduce((sum, c) => sum + parseFloat(c.longitude), 0) / validCommunities.length
    : -98.5795; // Default US center

  const defaultZoom = validCommunities.length === 1 ? 12 : 6;

  // Create custom markers
  const createMarker = (community: Community) => {
    const isSelected = selectedCommunity?.id === community.id;
    const markerColor = isSelected ? '#ef4444' : '#3b82f6';
    
    return L.divIcon({
      html: `
        <div style="
          background-color: ${markerColor};
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
          font-weight: bold;
        ">
          ${community.starting_price ? '$' : '📍'}
        </div>
      `,
      className: 'custom-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12]
    });
  };

  return (
    <div className={className}>
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={defaultZoom}
        style={{ width: '100%', height: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        
        {validCommunities.map((community) => (
          <Marker
            key={community.id}
            position={[parseFloat(community.latitude), parseFloat(community.longitude)]}
            icon={createMarker(community)}
            eventHandlers={{
              click: () => onCommunityClick(community.id)
            }}
          >
            <Popup>
              <div className="p-2 max-w-xs">
                <h3 className="font-semibold text-sm mb-1">{community.name}</h3>
                <p className="text-xs text-gray-600 mb-1">
                  {community.address}, {community.city}, {community.state}
                </p>
                {community.care_types && (
                  <p className="text-xs text-blue-600 mb-1">
                    {community.care_types.join(', ')}
                  </p>
                )}
                {community.starting_price && (
                  <p className="text-xs font-semibold text-green-600">
                    Starting from ${community.starting_price.toLocaleString()}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
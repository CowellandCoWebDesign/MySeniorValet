import { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';

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

export default function MapView({ communities, onCommunityClick }: MapViewProps) {
  // Temporary placeholder map while we fix the leaflet loading issue
  return (
    <div className="h-full w-full bg-green-100 relative">
      {/* Map Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-200 to-blue-200">
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 400 300">
            {/* California-like coastline */}
            <path 
              d="M50 50 Q100 80 150 70 T250 90 Q300 100 350 80 L350 250 Q250 240 150 230 T50 250 Z" 
              fill="#4ade80" 
              opacity="0.3"
            />
            {/* Roads */}
            <path d="M100 100 Q200 120 300 100" stroke="#6b7280" strokeWidth="2" fill="none" />
            <path d="M80 150 Q180 170 280 150" stroke="#6b7280" strokeWidth="2" fill="none" />
          </svg>
        </div>
      </div>

      {/* Community Pins */}
      <div className="absolute inset-0">
        {communities.filter(c => c.latitude && c.longitude).map((community, index) => (
          <div
            key={community.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            style={{
              left: `${20 + (index % 5) * 15}%`,
              top: `${30 + Math.floor(index / 5) * 20}%`,
            }}
            onClick={() => onCommunityClick(community.id)}
          >
            <div className="relative">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              
              {/* Popup on hover */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-white rounded-lg shadow-lg p-3 min-w-[200px] border">
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
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Map Controls */}
      <div className="absolute bottom-4 left-4 text-xs text-gray-600 bg-white px-2 py-1 rounded shadow">
        Interactive Map View
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import Map from '@/components/Map';

interface CommunityMapProps {
  communities: Array<{
    id: number;
    name: string;
    latitude?: number | string;
    longitude?: number | string;
    city?: string;
    state?: string;
    priceRange?: { min: number; max: number };
  }>;
}

export function CommunityMap({ communities }: CommunityMapProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>([37.7749, -122.4194]);
  const [mapZoom, setMapZoom] = useState(10);
  
  // Calculate center based on communities with valid coordinates
  useEffect(() => {
    const validCommunities = communities.filter(c => 
      c.latitude && c.longitude
    );
    
    if (validCommunities.length > 0) {
      // Calculate average lat/lng for center
      const avgLat = validCommunities.reduce((sum, c) => {
        const lat = typeof c.latitude === 'string' ? parseFloat(c.latitude) : c.latitude!;
        return sum + lat;
      }, 0) / validCommunities.length;
      
      const avgLng = validCommunities.reduce((sum, c) => {
        const lng = typeof c.longitude === 'string' ? parseFloat(c.longitude) : c.longitude!;
        return sum + lng;
      }, 0) / validCommunities.length;
      
      setMapCenter([avgLat, avgLng]);
      
      // Adjust zoom based on number of communities
      if (validCommunities.length === 1) {
        setMapZoom(14);
      } else if (validCommunities.length < 5) {
        setMapZoom(12);
      } else {
        setMapZoom(10);
      }
    }
  }, [communities]);
  
  // Convert communities to map-compatible format
  const mapCommunities = communities
    .filter(c => c.latitude && c.longitude)
    .map(c => ({
      ...c,
      latitude: typeof c.latitude === 'string' ? parseFloat(c.latitude) : c.latitude!,
      longitude: typeof c.longitude === 'string' ? parseFloat(c.longitude) : c.longitude!,
    }));
  
  if (mapCommunities.length === 0) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
        <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600 dark:text-gray-400">
          No location data available for map display
        </p>
      </div>
    );
  }
  
  return (
    <div className="rounded-lg overflow-hidden border border-purple-200 dark:border-purple-800 shadow-md">
      <div className="h-[400px]">
        <Map 
          communities={mapCommunities}
          center={mapCenter}
          zoom={mapZoom}
          showHeatmap={false}
          showClusters={mapCommunities.length > 10}
        />
      </div>
      <div className="bg-purple-50 dark:bg-purple-900/20 p-2 text-center">
        <p className="text-xs text-purple-700 dark:text-purple-300">
          Showing {mapCommunities.length} communities on map
        </p>
      </div>
    </div>
  );
}
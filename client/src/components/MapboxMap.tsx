import { useEffect, useRef, useState } from "react";

// Simple map component using Static Maps API to avoid CSP issues
const MAPBOX_TOKEN = "pk.eyJ1IjoibXlzZW5pb3J2YWxldCIsImEiOiJjbWQ0OTlhc3YwZDZ3MmtweHhkc3lueGpzIn0.3l9MasL6_ZAZHw1y44d04A";

interface Community {
  id: number;
  name: string;
  city: string;
  state: string;
  latitude?: number;
  longitude?: number;
}

interface MapboxMapProps {
  communities?: Community[];
}

export default function MapboxMap({ communities = [] }: MapboxMapProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Calculate map bounds based on communities or use San Francisco default
  const getMapBounds = () => {
    if (communities.length === 0) {
      return { center: [-122.4194, 37.7749], zoom: 9 };
    }

    const validCommunities = communities.filter(c => c.latitude && c.longitude);
    if (validCommunities.length === 0) {
      return { center: [-122.4194, 37.7749], zoom: 9 };
    }

    const lats = validCommunities.map(c => c.latitude!);
    const lons = validCommunities.map(c => c.longitude!);
    
    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const centerLon = (Math.min(...lons) + Math.max(...lons)) / 2;
    
    return { center: [centerLon, centerLat], zoom: 8 };
  };

  const { center, zoom } = getMapBounds();
  const width = 600;
  const height = 400;

  // Create markers for communities with coordinates
  const markers = communities
    .filter(c => c.latitude && c.longitude)
    .slice(0, 10) // Limit to first 10 to avoid URL length issues
    .map(c => `pin-s+ff6b35(${c.longitude},${c.latitude})`)
    .join(',');

  // Use Mapbox Static Images API to avoid CSP issues
  const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${markers ? markers + '/' : ''}${center[0]},${center[1]},${zoom}/${width}x${height}?access_token=${MAPBOX_TOKEN}`;

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setMapError(null);
  };

  const handleImageError = () => {
    setMapError("Failed to load map image");
    setImageLoaded(false);
  };

  return (
    <div className="w-full h-full relative bg-gray-100 overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Loading map...</p>
          </div>
        </div>
      )}
      
      {mapError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
          <div className="text-center max-w-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Map Preview</h3>
            <p className="text-sm text-gray-600 mb-4">{mapError}</p>
            <div className="bg-white rounded-lg shadow p-4 text-left">
              <h4 className="font-medium mb-2">Static Map Preview:</h4>
              <p className="text-sm text-gray-600">
                Interactive map features will be available once WebGL is supported in this environment.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="w-full h-full flex items-center justify-center">
        <img
          src={mapUrl}
          alt="San Francisco Map"
          className={`max-w-full max-h-full object-contain rounded-lg shadow-lg transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{ maxWidth: '100%', maxHeight: '100%' }}
        />
      </div>
      
      {imageLoaded && (
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow p-2 text-xs text-gray-600">
          {communities.length > 0 ? `${communities.length} communities` : 'San Francisco, CA'} - Map Preview
        </div>
      )}
      
      {imageLoaded && communities.length > 0 && (
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow p-2 text-xs text-gray-600">
          🏠 {communities.filter(c => c.latitude && c.longitude).length} communities with locations
        </div>
      )}
    </div>
  );
}
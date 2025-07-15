import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = "pk.eyJ1IjoibXlzZW5pb3J2YWxldCIsImEiOiJjbWQ0OTlhc3YwZDZ3MmtweHhkc3lueGpzIn0.3l9MasL6_ZAZHw1y44d04A";

export default function MapboxMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!MAPBOX_TOKEN) {
      setMapError("Mapbox token not configured");
      setIsLoading(false);
      return;
    }

    if (!mapContainerRef.current) {
      setMapError("Map container not found");
      setIsLoading(false);
      return;
    }

    try {
      mapboxgl.accessToken = MAPBOX_TOKEN;
      
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [-122.4194, 37.7749], // San Francisco default center
        zoom: 9,
        attributionControl: false
      });

      map.on('load', () => {
        setIsLoading(false);
        setMapError(null);
      });

      map.on('error', (e) => {
        console.error('Mapbox error:', e);
        setMapError("Failed to load map");
        setIsLoading(false);
      });

      return () => {
        map.remove();
      };
    } catch (error) {
      console.error('Map initialization error:', error);
      setMapError("Failed to initialize map");
      setIsLoading(false);
    }
  }, []);

  if (mapError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Map Unavailable</h3>
          <p className="text-sm text-gray-600 mb-4">{mapError}</p>
          <div className="bg-white rounded-lg shadow p-4 max-w-sm">
            <p className="text-sm text-gray-600">
              Map functionality will be available once properly configured.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Loading map...</p>
          </div>
        </div>
      )}
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
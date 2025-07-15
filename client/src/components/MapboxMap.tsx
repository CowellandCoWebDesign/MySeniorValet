import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || "";

export default function MapboxMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapboxgl.accessToken) {
      console.error("Mapbox token not set.");
      return;
    }

    const map = new mapboxgl.Map({
      container: mapContainerRef.current!,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-122.4194, 37.7749], // San Francisco default center
      zoom: 9,
    });

    return () => map.remove();
  }, []);

  return (
    <div className="w-full h-[500px] rounded-lg shadow-md border border-gray-300 overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
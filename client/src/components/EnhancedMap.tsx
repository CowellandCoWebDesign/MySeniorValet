import { useEffect, useState, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, CircleMarker, Tooltip } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Icon, DivIcon, point } from 'leaflet';
import { Heart, MapPin, Star, Home, Building, Users, Plus, Minus, Locate, Layers, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-cluster/lib/assets/MarkerCluster.css';
import 'react-leaflet-cluster/lib/assets/MarkerCluster.Default.css';

// Custom marker icons with different states
const createEnhancedIcon = (
  community: any,
  isViewed: boolean = false,
  isFavorited: boolean = false,
  isHighlighted: boolean = false
) => {
  const baseColor = isHighlighted ? '#3b82f6' : isFavorited ? '#dc2626' : isViewed ? '#6b7280' : '#059669';
  const fillOpacity = isHighlighted ? 1 : 0.9;
  
  // Price display
  const price = community.priceRange?.min 
    ? `$${Math.round(community.priceRange.min / 1000)}K` 
    : community.monthlyRent 
    ? `$${Math.round(community.monthlyRent / 1000)}K`
    : '';
  
  return new DivIcon({
    html: `
      <div class="custom-marker ${isHighlighted ? 'highlighted' : ''}">
        <div class="marker-content" style="background-color: ${baseColor}; opacity: ${fillOpacity};">
          ${price ? `<span class="price-label">${price}</span>` : '<span class="icon-label">📍</span>'}
          ${isFavorited ? '<span class="favorite-indicator">♥</span>' : ''}
        </div>
        <div class="marker-arrow" style="border-top-color: ${baseColor};"></div>
      </div>
    `,
    className: 'custom-div-icon',
    iconSize: [60, 40],
    iconAnchor: [30, 40],
    popupAnchor: [0, -35],
  });
};

// Cluster icon with count
const createClusterIcon = (cluster: any) => {
  const count = cluster.getChildCount();
  let size = 'small';
  let sizeClass = 'cluster-small';
  
  if (count > 50) {
    size = 'large';
    sizeClass = 'cluster-large';
  } else if (count > 20) {
    size = 'medium';
    sizeClass = 'cluster-medium';
  }
  
  return new DivIcon({
    html: `
      <div class="custom-cluster ${sizeClass}">
        <div class="cluster-inner">
          <span class="cluster-count">${count}</span>
          <span class="cluster-label">homes</span>
        </div>
      </div>
    `,
    className: 'custom-cluster-div',
    iconSize: point(40, 40)
  });
};

// Map controls component
function MapControls({ onZoomIn, onZoomOut, onLocate, onLayerToggle }: any) {
  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col space-y-2">
      <Button
        size="sm"
        variant="secondary"
        className="w-10 h-10 p-0 bg-white shadow-md hover:bg-gray-50"
        onClick={onZoomIn}
      >
        <Plus className="w-5 h-5" />
      </Button>
      <Button
        size="sm"
        variant="secondary"
        className="w-10 h-10 p-0 bg-white shadow-md hover:bg-gray-50"
        onClick={onZoomOut}
      >
        <Minus className="w-5 h-5" />
      </Button>
      <div className="w-full h-px bg-gray-300" />
      <Button
        size="sm"
        variant="secondary"
        className="w-10 h-10 p-0 bg-white shadow-md hover:bg-gray-50"
        onClick={onLocate}
      >
        <Locate className="w-5 h-5" />
      </Button>
      <Button
        size="sm"
        variant="secondary"
        className="w-10 h-10 p-0 bg-white shadow-md hover:bg-gray-50"
        onClick={onLayerToggle}
      >
        <Layers className="w-5 h-5" />
      </Button>
    </div>
  );
}

// Map event handler
function MapEventHandler({ onBoundsChange, onZoomChange }: any) {
  const map = useMapEvents({
    moveend: () => {
      onBoundsChange(map.getBounds());
    },
    zoomend: () => {
      onZoomChange(map.getZoom());
      onBoundsChange(map.getBounds());
    },
  });

  useEffect(() => {
    onBoundsChange(map.getBounds());
    onZoomChange(map.getZoom());
  }, [map]);

  return null;
}

// Zoom handler component
function ZoomHandler({ zoomLevel }: { zoomLevel: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setZoom(zoomLevel);
  }, [zoomLevel, map]);
  
  return null;
}

// Enhanced popup content
function PopupContent({ community }: { community: any }) {
  return (
    <div className="p-3 min-w-[280px] max-w-[320px]">
      {/* Header */}
      <div className="mb-3">
        <h3 className="font-bold text-base text-gray-900 mb-1">{community.name}</h3>
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="w-3 h-3 mr-1" />
          <span>{community.city}, {community.state}</span>
        </div>
      </div>
      
      {/* Image */}
      {community.googlePhotos?.length > 0 && (
        <div className="mb-3 -mx-3 -mt-1">
          <img 
            src={`/api/communities/${community.id}/photos/0`}
            alt={community.name}
            className="w-full h-32 object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}
      
      {/* Details */}
      <div className="space-y-2 mb-3">
        {/* Price */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-blue-600">
            {community.priceRange?.min 
              ? `$${community.priceRange.min.toLocaleString()}-${community.priceRange.max.toLocaleString()}/mo`
              : community.monthlyRent 
              ? `$${community.monthlyRent.toLocaleString()}/mo`
              : 'Contact for pricing'
            }
          </span>
          {community.googleRating && (
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium ml-1">{community.googleRating}</span>
            </div>
          )}
        </div>
        
        {/* Care Types */}
        {community.careTypes?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {community.careTypes.slice(0, 3).map((type: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {type}
              </Badge>
            ))}
          </div>
        )}
      </div>
      
      {/* CTA */}
      <Button 
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        onClick={() => window.location.href = `/community/${community.id}`}
      >
        View Details
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
}

interface EnhancedMapProps {
  communities: any[];
  center?: [number, number];
  zoom?: number;
  onBoundsChange?: (bounds: any) => void;
  selectedCommunity?: any;
  className?: string;
}

export default function EnhancedMap({ 
  communities, 
  center = [36.7783, -119.4179], // California center
  zoom = 6,
  onBoundsChange,
  selectedCommunity,
  className = ""
}: EnhancedMapProps) {
  const [mapBounds, setMapBounds] = useState<any>(null);
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [mapLayer, setMapLayer] = useState('street');
  const mapRef = useRef<any>(null);
  
  // Filter communities with valid coordinates
  const validCommunities = useMemo(() => {
    return communities.filter(c => c.latitude && c.longitude);
  }, [communities]);
  
  // Map layer options
  const mapLayers = {
    street: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    terrain: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
  };
  
  // Handle map controls
  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.setZoom(mapRef.current.getZoom() + 1);
    }
  };
  
  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.setZoom(mapRef.current.getZoom() - 1);
    }
  };
  
  const handleLocate = () => {
    if (navigator.geolocation && mapRef.current) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          mapRef.current.setView([latitude, longitude], 12);
        },
        (error) => {
          console.error('Location error:', error);
        }
      );
    }
  };
  
  const handleLayerToggle = () => {
    const layers = ['street', 'satellite', 'terrain'];
    const currentIndex = layers.indexOf(mapLayer);
    const nextIndex = (currentIndex + 1) % layers.length;
    setMapLayer(layers[nextIndex]);
  };
  
  // Handle bounds change
  const handleBoundsChange = (bounds: any) => {
    setMapBounds(bounds);
    if (onBoundsChange) {
      onBoundsChange(bounds);
    }
  };
  
  return (
    <div className={`relative ${className}`}>
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={zoom}
        className="h-full w-full"
        zoomControl={false}
        attributionControl={true}
      >
        <TileLayer
          key={mapLayer}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url={mapLayers[mapLayer as keyof typeof mapLayers]}
          maxZoom={19}
        />
        
        {/* Event handlers */}
        <MapEventHandler 
          onBoundsChange={handleBoundsChange}
          onZoomChange={setCurrentZoom}
        />
        
        {/* Marker clustering for performance */}
        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={createClusterIcon}
          maxClusterRadius={currentZoom > 10 ? 40 : 80}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
          zoomToBoundsOnClick={true}
        >
          {validCommunities.map((community) => {
            const isViewed = community.id % 3 === 0;
            const isFavorited = community.id % 7 === 0;
            const isHighlighted = selectedCommunity?.id === community.id;
            
            return (
              <Marker
                key={community.id}
                position={[community.latitude, community.longitude]}
                icon={createEnhancedIcon(community, isViewed, isFavorited, isHighlighted)}
              >
                <Popup>
                  <PopupContent community={community} />
                </Popup>
                {currentZoom > 12 && (
                  <Tooltip direction="top" offset={[0, -35]} permanent>
                    <span className="text-xs font-medium">{community.name}</span>
                  </Tooltip>
                )}
              </Marker>
            );
          })}
        </MarkerClusterGroup>
        
        {/* Custom zoom controls */}
        <MapControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onLocate={handleLocate}
          onLayerToggle={handleLayerToggle}
        />
      </MapContainer>
      
      {/* Map stats overlay */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-3 z-[1000]">
        <div className="text-sm">
          <div className="font-semibold text-gray-900">
            {validCommunities.length} communities
          </div>
          <div className="text-xs text-gray-600">
            Zoom: {currentZoom} • Layer: {mapLayer}
          </div>
        </div>
      </div>
      
      {/* Custom CSS */}
      <style jsx global>{`
        /* Custom marker styles */
        .custom-marker {
          position: relative;
          animation: fadeIn 0.3s ease-out;
        }
        
        .custom-marker.highlighted {
          z-index: 1000 !important;
          animation: pulse 2s infinite;
        }
        
        .marker-content {
          background: white;
          border-radius: 6px;
          padding: 4px 8px;
          font-size: 12px;
          font-weight: 600;
          color: white;
          display: flex;
          align-items: center;
          gap: 4px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          transition: all 0.2s ease;
        }
        
        .custom-marker:hover .marker-content {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        }
        
        .marker-arrow {
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid;
        }
        
        .price-label {
          font-size: 11px;
          line-height: 1;
        }
        
        .icon-label {
          font-size: 14px;
          line-height: 1;
        }
        
        .favorite-indicator {
          color: white;
          font-size: 10px;
          position: absolute;
          top: -2px;
          right: -2px;
        }
        
        /* Cluster styles */
        .custom-cluster {
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          transition: all 0.2s ease;
        }
        
        .custom-cluster:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 16px rgba(0,0,0,0.4);
        }
        
        .cluster-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        
        .cluster-count {
          font-weight: 700;
          line-height: 1;
        }
        
        .cluster-label {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #6b7280;
          margin-top: 1px;
        }
        
        .cluster-small {
          width: 40px;
          height: 40px;
          background: #10b981;
          color: white;
        }
        
        .cluster-small .cluster-count {
          font-size: 14px;
        }
        
        .cluster-medium {
          width: 50px;
          height: 50px;
          background: #3b82f6;
          color: white;
        }
        
        .cluster-medium .cluster-count {
          font-size: 16px;
        }
        
        .cluster-large {
          width: 60px;
          height: 60px;
          background: #8b5cf6;
          color: white;
        }
        
        .cluster-large .cluster-count {
          font-size: 18px;
        }
        
        /* Animations */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }
        
        /* Override Leaflet defaults for smoother experience */
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          padding: 0;
          overflow: hidden;
        }
        
        .leaflet-popup-content {
          margin: 0;
          min-width: 280px;
        }
        
        .leaflet-popup-tip {
          background: white;
        }
        
        .leaflet-container {
          font-family: inherit;
        }
        
        /* Smooth tile loading */
        .leaflet-tile {
          transition: opacity 0.3s ease-in-out;
        }
        
        .leaflet-tile-loaded {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
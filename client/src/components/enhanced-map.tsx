import { useEffect, useRef, useMemo, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { Community } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Users, DollarSign, MapPin, Phone } from "lucide-react";
import { Link } from "wouter";

// Optimized marker icons with caching
const markerCache = new Map<string, L.DivIcon>();

const createMarkerIcon = (type: 'default' | 'available' | 'selected', isAvailable?: boolean): L.DivIcon => {
  const cacheKey = `${type}-${isAvailable}`;
  
  if (markerCache.has(cacheKey)) {
    return markerCache.get(cacheKey)!;
  }

  let iconClass = "bg-blue-600";
  let iconContent = "📍";
  
  if (type === 'selected') {
    iconClass = "bg-red-600 scale-125";
    iconContent = "🎯";
  } else if (type === 'available' && isAvailable) {
    iconClass = "bg-green-600";
    iconContent = "✓";
  }

  const icon = L.divIcon({
    html: `<div class="${iconClass} w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold hover:scale-110 transition-transform duration-200 cursor-pointer">
      ${iconContent}
    </div>`,
    className: 'enhanced-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  markerCache.set(cacheKey, icon);
  return icon;
};

// Performance optimized bounds fitting
function OptimizedFitBounds({ 
  communities, 
  selectedCommunity 
}: { 
  communities: Community[];
  selectedCommunity?: Community | null;
}) {
  const map = useMap();
  
  useEffect(() => {
    if (communities.length === 0) {
      // Default to multi-state center covering CA, TX, AZ, HI
      map.setView([36.7783, -119.4179], 5);
      return;
    }
    
    const validCommunities = communities.filter(c => c.latitude && c.longitude);
    
    if (validCommunities.length === 0) {
      // Smart fallback based on state data in communities
      const stateMap = new Map<string, [number, number]>([
        ['CA', [36.7783, -119.4179]], // California center
        ['TX', [31.9686, -99.9018]], // Texas center  
        ['AZ', [34.0489, -111.0937]], // Arizona center
        ['HI', [19.8968, -155.5828]], // Hawaii center
      ]);
      
      const states = [...new Set(communities.map(c => c.state?.toUpperCase()).filter(Boolean))];
      
      if (states.length === 1 && stateMap.has(states[0])) {
        const [lat, lng] = stateMap.get(states[0])!;
        map.setView([lat, lng], 6);
        return;
      }
      
      // Multi-state fallback
      map.setView([36.7783, -119.4179], 5);
      return;
    }
    
    // Focus on selected community if available
    if (selectedCommunity?.latitude && selectedCommunity?.longitude) {
      map.setView([
        parseFloat(selectedCommunity.latitude), 
        parseFloat(selectedCommunity.longitude)
      ], 12);
      return;
    }
    
    // Single community case
    if (validCommunities.length === 1) {
      const community = validCommunities[0];
      map.setView([parseFloat(community.latitude!), parseFloat(community.longitude!)], 12);
    } else {
      // Multiple communities - fit bounds with optimization
      const bounds = L.latLngBounds(
        validCommunities.map(c => [parseFloat(c.latitude!), parseFloat(c.longitude!)])
      );
      
      // Add padding based on number of communities
      const padding = validCommunities.length > 50 ? [10, 10] : [20, 20];
      map.fitBounds(bounds, { padding });
    }
  }, [communities, map, selectedCommunity]);
  
  return null;
}

// Bounds change tracker for search functionality
function MapBoundsTracker({ 
  onBoundsChange 
}: { 
  onBoundsChange?: (bounds: L.LatLngBounds) => void 
}) {
  const map = useMap();
  
  useEffect(() => {
    if (!onBoundsChange) return;
    
    const handleMoveEnd = () => {
      const bounds = map.getBounds();
      onBoundsChange(bounds);
    };
    
    // Debounced bounds change handler
    let timeoutId: NodeJS.Timeout;
    const debouncedHandler = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleMoveEnd, 300);
    };
    
    map.on('moveend', debouncedHandler);
    map.on('zoomend', debouncedHandler);
    
    return () => {
      map.off('moveend', debouncedHandler);
      map.off('zoomend', debouncedHandler);
      clearTimeout(timeoutId);
    };
  }, [map, onBoundsChange]);
  
  return null;
}

interface EnhancedMapProps {
  communities: Community[];
  selectedCommunity?: Community | null;
  onCommunitySelect?: (community: Community) => void;
  onBoundsChange?: (bounds: L.LatLngBounds) => void;
  center?: [number, number];
  zoom?: number;
  height?: string;
  showBoundsTracker?: boolean;
  className?: string;
}

export function EnhancedMap({ 
  communities, 
  selectedCommunity, 
  onCommunitySelect, 
  onBoundsChange,
  center, 
  zoom = 7, 
  height = "100%",
  showBoundsTracker = false,
  className = ""
}: EnhancedMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  
  // Performance optimization: filter and memoize valid communities
  const validCommunities = useMemo(() => 
    communities.filter(c => c.latitude && c.longitude && 
      !isNaN(parseFloat(c.latitude)) && !isNaN(parseFloat(c.longitude))),
    [communities]
  );
  
  // Memoized default center with intelligent defaults
  const defaultCenter: [number, number] = useMemo(() => {
    if (center) return center;
    
    // Multi-state intelligent center based on our expansion
    if (validCommunities.length > 0) {
      const states = [...new Set(validCommunities.map(c => c.state?.toUpperCase()).filter(Boolean))];
      
      // Single state optimization
      if (states.length === 1) {
        switch (states[0]) {
          case 'CA': return [36.7783, -119.4179];
          case 'TX': return [31.9686, -99.9018];
          case 'AZ': return [34.0489, -111.0937];
          case 'HI': return [19.8968, -155.5828];
        }
      }
    }
    
    // Default to California (our primary state)
    return [36.7783, -119.4179];
  }, [center, validCommunities]);

  // Optimized click handler
  const handleCommunityClick = useCallback((community: Community) => {
    if (onCommunitySelect) {
      onCommunitySelect(community);
    } else {
      // Fallback navigation
      window.location.href = `/community/${community.id}`;
    }
  }, [onCommunitySelect]);

  // Optimized popup content renderer
  const renderPopupContent = useCallback((community: Community) => (
    <div className="p-3 min-w-[280px] max-w-[320px]">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg leading-tight pr-2">{community.name}</h3>
        {community.availabilityStatus && (
          <Badge className={`ml-2 text-xs ${
            community.availabilityStatus === "Available Now" ? "bg-green-100 text-green-800" :
            community.availabilityStatus === "Waitlist" ? "bg-yellow-100 text-yellow-800" :
            "bg-gray-100 text-gray-800"
          }`}>
            {community.availabilityStatus}
          </Badge>
        )}
      </div>
      
      <div className="flex items-center text-sm text-gray-600 mb-2">
        <MapPin className="w-4 h-4 mr-1" />
        <span>{community.address}, {community.city}, {community.state}</span>
      </div>
      
      {/* Care Types */}
      <div className="flex flex-wrap gap-1 mb-3">
        {community.careTypes.slice(0, 3).map((type) => (
          <Badge key={type} variant="secondary" className="text-xs">
            {type}
          </Badge>
        ))}
        {community.careTypes.length > 3 && (
          <Badge variant="outline" className="text-xs">
            +{community.careTypes.length - 3} more
          </Badge>
        )}
      </div>
      
      {/* Pricing and Rating Row */}
      <div className="flex justify-between items-center mb-3">
        <div>
          {community.monthlyRent ? (
            <div className="text-lg font-bold text-blue-600">
              ${community.monthlyRent.toLocaleString()}/mo
            </div>
          ) : (
            <div className="text-sm text-gray-500">Contact for pricing</div>
          )}
        </div>
        
        {community.googleRating && (
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
            <span className="text-sm font-medium">
              {community.googleRating}
            </span>
            <span className="text-xs text-gray-500 ml-1">
              ({community.googleReviewCount || 0})
            </span>
          </div>
        )}
      </div>
      
      {/* Contact Info */}
      {community.phone && (
        <div className="flex items-center text-sm text-gray-600 mb-3">
          <Phone className="w-4 h-4 mr-1" />
          <span>{community.phone}</span>
        </div>
      )}
      
      {/* Action Button */}
      <Button 
        onClick={(e) => {
          e.stopPropagation();
          handleCommunityClick(community);
        }}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        size="sm"
      >
        View Details & Photos
      </Button>
    </div>
  ), [handleCommunityClick]);

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <MapContainer
        center={defaultCenter}
        zoom={zoom}
        className="h-full w-full rounded-lg"
        ref={mapRef}
        zoomControl={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={18}
          minZoom={3}
        />
        
        <OptimizedFitBounds 
          communities={validCommunities} 
          selectedCommunity={selectedCommunity}
        />
        
        {showBoundsTracker && (
          <MapBoundsTracker onBoundsChange={onBoundsChange} />
        )}
        
        {/* Optimized community markers */}
        {validCommunities.map((community) => {
          const isSelected = selectedCommunity?.id === community.id;
          const isAvailable = community.availabilityStatus === "Available Now";
          
          return (
            <Marker
              key={community.id}
              position={[parseFloat(community.latitude!), parseFloat(community.longitude!)]}
              icon={createMarkerIcon(
                isSelected ? 'selected' : isAvailable ? 'available' : 'default',
                isAvailable
              )}
              eventHandlers={{
                click: () => handleCommunityClick(community),
              }}
            >
              <Popup 
                className="enhanced-popup"
                maxWidth={320}
                minWidth={280}
              >
                {renderPopupContent(community)}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {/* Map Stats Overlay */}
      <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-gray-600 shadow-md">
        <div className="flex items-center space-x-3">
          <span>{validCommunities.length} communities</span>
          <span>•</span>
          <span className="flex items-center">
            <span className="w-2 h-2 bg-green-600 rounded-full mr-1"></span>
            Available
          </span>
          <span className="flex items-center">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-1"></span>
            Contact
          </span>
        </div>
      </div>
    </div>
  );
}

// CSS improvements for enhanced markers
const enhancedMapStyles = `
.enhanced-marker {
  background: transparent !important;
  border: none !important;
}

.enhanced-popup .leaflet-popup-content-wrapper {
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.enhanced-popup .leaflet-popup-content {
  margin: 0;
  font-family: inherit;
}

.enhanced-popup .leaflet-popup-tip {
  border-top-color: rgba(0, 0, 0, 0.05);
}
`;

// Inject styles if not already present
if (!document.getElementById('enhanced-map-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'enhanced-map-styles';
  styleSheet.textContent = enhancedMapStyles;
  document.head.appendChild(styleSheet);
}
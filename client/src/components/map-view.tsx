import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { Community } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Users, DollarSign } from "lucide-react";
import { Link } from "wouter";

// Fix for default markers in react-leaflet
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import markerIconRetina from "leaflet/dist/images/marker-icon-2x.png";

let DefaultIcon = L.divIcon({
  html: `<div class="bg-blue-600 w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">📍</div>`,
  className: 'custom-marker',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapViewProps {
  communities: Community[];
  selectedCommunity?: Community | null;
  onCommunitySelect?: (community: Community) => void;
  center?: [number, number];
  zoom?: number;
}

// Component to fit map bounds to markers
function FitBounds({ communities }: { communities: Community[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (communities.length === 0) return;
    
    const validCommunities = communities.filter(c => c.latitude && c.longitude);
    if (validCommunities.length === 0) return;
    
    if (validCommunities.length === 1) {
      const community = validCommunities[0];
      map.setView([parseFloat(community.latitude!), parseFloat(community.longitude!)], 12);
    } else {
      const bounds = L.latLngBounds(
        validCommunities.map(c => [parseFloat(c.latitude!), parseFloat(c.longitude!)])
      );
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [communities, map]);
  
  return null;
}

export function MapView({ communities, selectedCommunity, onCommunitySelect, center, zoom = 10 }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  
  // Default center to Denver, CO if no center provided
  const defaultCenter: [number, number] = center || [39.7392, -104.9903];
  
  const validCommunities = communities.filter(c => c.latitude && c.longitude);
  
  const formatPrice = (priceRange?: { min: number; max: number } | null) => {
    if (!priceRange) return "Contact for pricing";
    return `$${priceRange.min.toLocaleString()}+/month`;
  };
  
  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case "Available": return "text-green-600";
      case "Waitlist": return "text-yellow-600";
      case "Full": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const createCustomIcon = (community: Community) => {
    const isSelected = selectedCommunity?.id === community.id;
    const color = isSelected ? "bg-red-600" : community.availabilityStatus === "Available" ? "bg-green-600" : "bg-blue-600";
    
    return L.divIcon({
      html: `<div class="${color} w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold transform ${isSelected ? 'scale-125' : 'hover:scale-110'} transition-transform">
        ${community.availabilityStatus === "Available" ? "✓" : "📍"}
      </div>`,
      className: 'custom-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });
  };

  return (
    <div className="h-full w-full">
      <MapContainer
        center={defaultCenter}
        zoom={zoom}
        className="h-full w-full rounded-lg"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <FitBounds communities={validCommunities} />
        
        {validCommunities.map((community) => (
          <Marker
            key={community.id}
            position={[parseFloat(community.latitude!), parseFloat(community.longitude!)]}
            icon={createCustomIcon(community)}
            eventHandlers={{
              click: () => onCommunitySelect?.(community),
            }}
          >
            <Popup className="min-w-[280px]">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg leading-tight">{community.name}</h3>
                  {community.availabilityStatus && (
                    <Badge className={`ml-2 ${getAvailabilityColor(community.availabilityStatus)}`}>
                      {community.availabilityStatus}
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-gray-600">{community.address}, {community.city}</p>
                
                <div className="flex flex-wrap gap-1">
                  {community.careTypes.slice(0, 2).map((type) => (
                    <Badge key={type} variant="secondary" className="text-xs">
                      {type}
                    </Badge>
                  ))}
                  {community.careTypes.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{community.careTypes.length - 2}
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-medium">{formatPrice(community.priceRange)}</span>
                  </div>
                  
                  {community.totalUnits && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span>{community.availableUnits || 0}/{community.totalUnits} units available</span>
                    </div>
                  )}
                  
                  {community.googleRating && (
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span>{parseFloat(community.googleRating).toFixed(1)} ({community.googleReviewCount} reviews)</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 pt-2 border-t">
                  <Link href={`/community/${community.id}`} className="flex-1">
                    <Button size="sm" className="w-full">View Details</Button>
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Community } from '@shared/schema';

// Fix default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface WorkingMapProps {
  communities: Community[];
  onCommunityClick?: (communityId: number) => void;
  selectedCommunity?: Community | null;
  className?: string;
}

export default function WorkingMap({ 
  communities = [], 
  onCommunityClick, 
  selectedCommunity, 
  className = '' 
}: WorkingMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current).setView([37.7749, -122.4194], 10);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update markers when communities change
  useEffect(() => {
    if (!mapRef.current || !Array.isArray(communities)) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Filter valid communities
    const validCommunities = communities.filter(community => {
      if (!community || typeof community !== 'object') return false;
      
      const lat = parseFloat(String(community.latitude));
      const lng = parseFloat(String(community.longitude));
      
      return !isNaN(lat) && !isNaN(lng) && 
             lat >= -90 && lat <= 90 && 
             lng >= -180 && lng <= 180 &&
             !(lat === 0 && lng === 0);
    });

    console.log('WorkingMap: Processing', validCommunities.length, 'valid communities');

    // Add markers for valid communities
    validCommunities.forEach(community => {
      const lat = parseFloat(String(community.latitude));
      const lng = parseFloat(String(community.longitude));
      
      const marker = L.marker([lat, lng])
        .addTo(mapRef.current!)
        .bindPopup(`
          <div>
            <h3>${community.name}</h3>
            <p>${community.city}, ${community.state}</p>
            <p>${community.address}</p>
          </div>
        `);

      if (onCommunityClick) {
        marker.on('click', () => onCommunityClick(community.id));
      }

      markersRef.current.push(marker);
    });

    // Fit map to markers if we have communities
    if (validCommunities.length > 0) {
      const group = new L.featureGroup(markersRef.current);
      mapRef.current.fitBounds(group.getBounds().pad(0.1));
    }
  }, [communities, onCommunityClick]);

  // Highlight selected community
  useEffect(() => {
    if (!mapRef.current || !selectedCommunity) return;

    const selectedMarker = markersRef.current.find(marker => {
      const popup = marker.getPopup();
      return popup && popup.getContent()?.includes(selectedCommunity.name);
    });

    if (selectedMarker) {
      selectedMarker.openPopup();
    }
  }, [selectedCommunity]);

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={containerRef} 
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      />
      
      {/* Status overlay */}
      <div className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded text-sm z-[1000]">
        ✅ Map Working! {Array.isArray(communities) ? communities.length : 0} communities
      </div>
    </div>
  );
}
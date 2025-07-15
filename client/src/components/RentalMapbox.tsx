import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Map, { 
  Marker, 
  Popup, 
  NavigationControl, 
  GeolocateControl, 
  ScaleControl,
  Source,
  Layer
} from 'react-map-gl/mapbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Star, 
  Heart, 
  DollarSign, 
  Phone, 
  Users, 
  Home,
  Filter,
  Grid3X3,
  Search,
  Navigation,
  Maximize2,
  X
} from 'lucide-react';
import type { Community } from '@shared/schema';
import 'mapbox-gl/dist/mapbox-gl.css';
import LeafletMapFallback from './LeafletMapFallback';

interface RentalMapboxProps {
  communities: Community[];
  onCommunityClick: (communityId: number) => void;
  selectedCommunity?: Community | null;
  className?: string;
}

interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
}

// Custom marker styles for different community types
const getMarkerColor = (community: Community) => {
  if (community.careTypes?.includes('Memory Care')) return '#dc2626'; // Red for Memory Care
  if (community.careTypes?.includes('Assisted Living')) return '#2563eb'; // Blue for Assisted Living
  if (community.careTypes?.includes('Independent Living')) return '#16a34a'; // Green for Independent Living
  if (community.careTypes?.includes('Skilled Nursing')) return '#7c3aed'; // Purple for Skilled Nursing
  return '#f59e0b'; // Orange for other/mixed care
};

// Custom marker component
const CustomMarker = ({ 
  community, 
  isSelected, 
  onClick 
}: { 
  community: Community; 
  isSelected: boolean; 
  onClick: () => void; 
}) => {
  const markerColor = getMarkerColor(community);
  
  return (
    <div
      className={`relative cursor-pointer transition-all duration-200 ${
        isSelected ? 'scale-125 z-30' : 'hover:scale-110 z-20'
      }`}
      onClick={onClick}
    >
      {/* Price bubble */}
      <div 
        className={`absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded text-xs font-bold text-white shadow-lg ${
          isSelected ? 'bg-blue-600' : 'bg-gray-800'
        }`}
      >
        {community.monthlyRent 
          ? `$${(community.monthlyRent / 1000).toFixed(1)}K`
          : 'Call'
        }
      </div>
      
      {/* Marker pin */}
      <div 
        className={`w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center ${
          isSelected ? 'ring-4 ring-blue-400 ring-opacity-50' : ''
        }`}
        style={{ backgroundColor: markerColor }}
      >
        <Home className="w-3 h-3 text-white" />
      </div>
      
      {/* Availability indicator */}
      {community.availabilityStatus && (
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
          <div className={`w-2 h-2 rounded-full ${
            community.availabilityStatus === 'Immediate Availability' 
              ? 'bg-green-500' 
              : community.availabilityStatus === 'Limited Availability'
              ? 'bg-yellow-500'
              : 'bg-red-500'
          }`} />
        </div>
      )}
    </div>
  );
};

export default function RentalMapbox({ 
  communities, 
  onCommunityClick, 
  selectedCommunity, 
  className = '' 
}: RentalMapboxProps) {
  // Direct environment variable access - no server fetch needed
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
  
  const [viewState, setViewState] = useState<ViewState>({
    longitude: -122.4194,
    latitude: 37.7749,
    zoom: 11,
    pitch: 0,
    bearing: 0
  });
  
  const [selectedMarker, setSelectedMarker] = useState<Community | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/streets-v12');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Debug logging for token
  useEffect(() => {
    console.log('Mapbox Token:', mapboxToken);
    console.log('MAPBOX_TOKEN:', mapboxToken ? 'Token loaded successfully' : 'Token not found');
    console.log('Token type:', mapboxToken?.startsWith('pk.') ? 'PUBLIC TOKEN' : 'SECRET TOKEN');
    console.log('Full env check:', import.meta.env.VITE_MAPBOX_TOKEN);
  }, [mapboxToken]);

  // Filter communities with valid coordinates
  const validCommunities = useMemo(() => {
    const filtered = communities.filter(community => 
      community.latitude && 
      community.longitude &&
      community.latitude !== 0 && 
      community.longitude !== 0
    );
    
    // Debug logging
    console.log('RentalMapbox - Total communities:', communities.length);
    console.log('RentalMapbox - Valid communities with coordinates:', filtered.length);
    if (filtered.length > 0) {
      console.log('RentalMapbox - Sample community coordinates:', {
        name: filtered[0].name,
        latitude: filtered[0].latitude,
        longitude: filtered[0].longitude,
        address: filtered[0].address,
        city: filtered[0].city,
        state: filtered[0].state
      });
    }
    
    return filtered;
  }, [communities]);

  // Calculate map bounds based on communities
  const mapBounds = useMemo(() => {
    if (validCommunities.length === 0) return null;
    
    const lats = validCommunities.map(c => parseFloat(c.latitude!));
    const lngs = validCommunities.map(c => parseFloat(c.longitude!));
    
    return {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lngs),
      west: Math.min(...lngs)
    };
  }, [validCommunities]);

  // Auto-fit map bounds when communities change
  useEffect(() => {
    if (mapBounds && validCommunities.length > 0) {
      const centerLat = (mapBounds.north + mapBounds.south) / 2;
      const centerLng = (mapBounds.east + mapBounds.west) / 2;
      
      setViewState(prev => ({
        ...prev,
        latitude: centerLat,
        longitude: centerLng,
        zoom: validCommunities.length === 1 ? 14 : 10
      }));
    }
  }, [mapBounds, validCommunities.length]);

  // Handle marker click
  const handleMarkerClick = useCallback((community: Community) => {
    setSelectedMarker(community);
    setShowPopup(true);
    onCommunityClick(community.id);
  }, [onCommunityClick]);

  // Handle popup close
  const handlePopupClose = useCallback(() => {
    setShowPopup(false);
    setSelectedMarker(null);
  }, []);

  // Force use of hardcoded token for now
  const activeToken = "pk.eyJ1IjoibXlzZW5pb3J2YWxldCIsImEiOiJjbWQ0b3VkNW8waTA4MmtxNzhndDEyZ2FrIn0.Ht8p3b3XATDjugyf4FHiAQ";
  
  // Official Mapbox GL JS browser support check
  const [mapboxSupported, setMapboxSupported] = useState(true);
  const [mapboxError, setMapboxError] = useState<string | null>(null);
  
  useEffect(() => {
    // Import and use the official mapbox-gl supported() method
    const checkMapboxSupport = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const mapboxgl = await import('mapbox-gl');
        
        // Use the official supported() method
        const isSupported = mapboxgl.supported();
        
        if (!isSupported) {
          console.error('Mapbox GL JS not supported in this browser');
          setMapboxSupported(false);
          setMapboxError('Mapbox GL JS is not supported in this browser');
          return;
        }
        
        console.log('Mapbox GL JS browser support check passed');
        setMapboxSupported(true);
        setMapboxError(null);
      } catch (error) {
        console.error('Error checking Mapbox compatibility:', error);
        setMapboxSupported(false);
        setMapboxError(error instanceof Error ? error.message : 'Unknown error');
      }
    };
    
    checkMapboxSupport();
  }, []);
  
  // Enhanced error handling with detailed logging
  const handleMapError = useCallback((error: any) => {
    console.error('Mapbox error details:', {
      error,
      type: error?.type,
      message: error?.message,
      stack: error?.stack,
      originalEvent: error?.originalEvent
    });
    
    // Try to provide more specific error information
    if (error?.message?.includes('not supported')) {
      setMapboxSupported(false);
      setMapboxError('Browser compatibility issue: ' + error.message);
    }
  }, []);
  
  // Show fallback only if definitively unsupported
  if (!mapboxSupported) {
    console.log('Mapbox not supported, using Leaflet fallback:', mapboxError);
    return (
      <LeafletMapFallback
        communities={communities}
        onCommunityClick={onCommunityClick}
        selectedCommunity={selectedCommunity}
        className={className}
      />
    );
  }
  
  // Error handling for missing token - moved after ALL hooks
  if (!activeToken) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-8">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Mapbox Configuration Required</h3>
          <p className="text-gray-600">Please configure your Mapbox access token to enable the interactive map.</p>
        </div>
      </div>
    );
  }

  // Map style options
  const mapStyles = [
    { id: 'mapbox://styles/mapbox/streets-v12', name: 'Streets', icon: '🗺️' },
    { id: 'mapbox://styles/mapbox/satellite-v9', name: 'Satellite', icon: '🛰️' },
    { id: 'mapbox://styles/mapbox/light-v11', name: 'Light', icon: '☀️' },
    { id: 'mapbox://styles/mapbox/dark-v11', name: 'Dark', icon: '🌙' }
  ];

  // Debug map rendering
  console.log('RentalMapbox - Rendering map with:', {
    viewState,
    activeToken: activeToken ? 'LOADED' : 'MISSING',
    validCommunities: validCommunities.length,
    mapStyle,
    containerDimensions: {
      width: '100%',
      height: '100%'
    }
  });

  return (
    <div className={`relative ${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <Map
          initialViewState={viewState}
          mapStyle={mapStyle}
          mapboxAccessToken={activeToken}
          style={{ width: '100%', height: '100%' }}
          dragPan={true}
          dragRotate={true}
          scrollZoom={true}
          touchZoom={true}
          touchRotate={true}
          keyboard={true}
          doubleClickZoom={true}
          minZoom={3}
          maxZoom={20}
          onError={handleMapError}
          attributionControl={false}
          preserveDrawingBuffer={true}
          onMove={evt => setViewState(evt.viewState)}
          onLoad={() => {
            console.log('Mapbox map loaded successfully');
          }}
          onRender={() => {
            console.log('Mapbox map rendered');
          }}
        >
        {/* Navigation Controls */}
        <NavigationControl position="top-right" />
        <GeolocateControl position="top-right" />
        <ScaleControl position="bottom-left" />

        {/* Community Markers */}
        {validCommunities.map((community) => (
          <Marker
            key={community.id}
            longitude={parseFloat(community.longitude!)}
            latitude={parseFloat(community.latitude!)}
            anchor="bottom"
          >
            <CustomMarker
              community={community}
              isSelected={selectedCommunity?.id === community.id}
              onClick={() => handleMarkerClick(community)}
            />
          </Marker>
        ))}

        {/* Popup */}
        {showPopup && selectedMarker && (
          <Popup
            longitude={parseFloat(selectedMarker.longitude!)}
            latitude={parseFloat(selectedMarker.latitude!)}
            anchor="bottom"
            onClose={handlePopupClose}
            closeButton={false}
            className="rental-popup"
          >
            <Card className="w-80 border-0 shadow-lg">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 z-10 h-6 w-6 p-0"
                  onClick={handlePopupClose}
                >
                  <X className="w-4 h-4" />
                </Button>
                
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1 pr-6">
                        {selectedMarker.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {selectedMarker.address}, {selectedMarker.city}, {selectedMarker.state}
                      </p>
                      
                      {/* Care Types */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {selectedMarker.careTypes?.slice(0, 2).map((type, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                      
                      {/* Pricing */}
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="font-semibold text-green-600">
                          {selectedMarker.monthlyRent 
                            ? `$${selectedMarker.monthlyRent.toLocaleString()}/mo`
                            : 'Contact for pricing'
                          }
                        </span>
                        {selectedMarker.monthlyRent && !selectedMarker.claimed && (
                          <span className="text-xs text-gray-500">est.</span>
                        )}
                      </div>
                      
                      {/* Rating */}
                      {selectedMarker.rating && (
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{selectedMarker.rating}</span>
                          <span className="text-xs text-gray-500">
                            ({selectedMarker.reviewCount || 0} reviews)
                          </span>
                        </div>
                      )}
                      
                      {/* Availability */}
                      {selectedMarker.availabilityStatus && (
                        <div className="flex items-center gap-1 mb-3">
                          <div className={`w-2 h-2 rounded-full ${
                            selectedMarker.availabilityStatus === 'Immediate Availability' 
                              ? 'bg-green-500' 
                              : selectedMarker.availabilityStatus === 'Limited Availability'
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`} />
                          <span className="text-xs text-gray-600">
                            {selectedMarker.availabilityStatus}
                          </span>
                        </div>
                      )}
                      
                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => window.location.href = `/community/${selectedMarker.id}`}
                        >
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          <Phone className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Heart className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          </Popup>
        )}
        </Map>

        {/* Map Controls Overlay */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          {/* Style Selector */}
          <div className="bg-white rounded-lg shadow-lg p-2">
            <div className="flex gap-1">
              {mapStyles.map((style) => (
                <Button
                  key={style.id}
                  variant={mapStyle === style.id ? "default" : "ghost"}
                  size="sm"
                  className="p-2 text-xs"
                  onClick={() => setMapStyle(style.id)}
                  title={style.name}
                >
                  {style.icon}
                </Button>
              ))}
            </div>
          </div>

          {/* Fullscreen Toggle */}
          <Button
            variant="outline"
            size="sm"
            className="bg-white shadow-lg"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Community Counter */}
        <div className="absolute bottom-4 left-4 z-10 bg-white rounded-lg shadow-lg px-3 py-2">
          <div className="flex items-center gap-2 text-sm">
            <Home className="w-4 h-4 text-blue-600" />
            <span className="font-medium">{validCommunities.length}</span>
            <span className="text-gray-600">communities</span>
          </div>
        </div>
      </div>
    </div>
  );
}
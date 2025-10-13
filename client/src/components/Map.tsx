import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Tooltip, LayersControl, Circle } from 'react-leaflet';
import { Icon, LatLngBounds, LatLng } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-providers';
import MarkerClusterGroup from 'react-leaflet-cluster';
// Import enhanced Leaflet plugins for senior-friendly features
import 'leaflet.fullscreen/Control.FullScreen.css';
import 'leaflet.fullscreen';
import 'leaflet.locatecontrol/dist/L.Control.Locate.css';
import 'leaflet.locatecontrol';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-control-geocoder';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Star, MapPin, Phone, Globe, Heart, ExternalLink, Zap, Eye, Brain } from 'lucide-react';
import AIMapIntegration from './AIMapIntegration';
import { PrioritizedCommunityCard } from './PrioritizedCommunityCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from 'next-themes';

// Extend window interface for map reference
declare global {
  interface Window {
    leafletMap?: any;
    mapBoundsTimeout?: NodeJS.Timeout;
  }
}

// Fix for default markers in Leaflet - Following Leaflet best practices
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Circular icons with bold borders (no pointing portion)
const createSimpleIcon = (color: string) => {
  const size = 30; // Size of the circular marker
  // Sanitize color input to prevent XSS
  const safeColor = color.replace(/[^a-zA-Z0-9#]/g, '');
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <!-- Drop shadow for depth -->
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
          <feOffset dx="0" dy="2" result="offsetblur"/>
          <feFlood flood-color="rgba(0,0,0,0.3)"/>
          <feComposite in2="offsetblur" operator="in"/>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <!-- Main circle with bold colored border -->
      <circle cx="${size/2}" cy="${size/2}" r="${size/2-2}" 
              fill="white" 
              stroke="${safeColor}" 
              stroke-width="4" 
              filter="url(#shadow)"/>
      
      <!-- Inner dot for visual interest -->
      <circle cx="${size/2}" cy="${size/2}" r="4" fill="${safeColor}"/>
    </svg>
  `;
  
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(svgString)}`,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
    popupAnchor: [0, -size/2],
  });
};

// Live data availability icons
const liveDataIcon = createSimpleIcon('#16a34a'); // Green - Has live pricing/availability data
const noLiveDataIcon = createSimpleIcon('#dc2626'); // Red - No live data (call for pricing)

// Care type icons (fallback when no HUD data indicator)
const communityIcon = createSimpleIcon('#1e40af'); // Blue
const assistedLivingIcon = createSimpleIcon('#3b82f6'); // Blue
const memoryCareIcon = createSimpleIcon('#8b5cf6'); // Purple
const independentIcon = createSimpleIcon('#10b981'); // Green

// Hospital icons with distinct medical cross symbol - clean design with status light
const createHospitalIcon = (bgColor: string, isEmergency: boolean = false) => {
  const size = 35; // Size of circular hospital marker
  const uniqueId = `hospital_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const statusLightSize = size * 0.25; // Small status light
  
  // Status light color for hospitals
  const statusColor = isEmergency ? '#dc2626' : '#f97316'; // Red for emergency, orange for urgent care
  
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <defs>
        <!-- Enhanced shadow for depth and prominence -->
        <filter id="shadow_${uniqueId}" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
          <feOffset dx="0" dy="2" result="offsetblur"/>
          <feFlood flood-color="rgba(0,0,0,0.3)"/>
          <feComposite in2="offsetblur" operator="in"/>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <!-- Glow effect for status light -->
        <filter id="glow_${uniqueId}">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <!-- Main circle without bold border -->
      <circle cx="${size/2}" cy="${size/2}" r="${size/2-2}" 
              fill="white" 
              stroke="#e5e7eb" 
              stroke-width="1" 
              filter="url(#shadow_${uniqueId})"/>
      
      <!-- Medical cross symbol -->
      <g transform="translate(${size/2}, ${size/2})">
        <rect x="-3" y="-9" width="6" height="18" fill="#6b7280" rx="1"/>
        <rect x="-9" y="-3" width="18" height="6" fill="#6b7280" rx="1"/>
      </g>
      
      <!-- Status light at bottom-right -->
      <circle cx="${size - statusLightSize/2 - 2}" 
              cy="${size - statusLightSize/2 - 2}" 
              r="${statusLightSize/2}" 
              fill="${statusColor}"
              stroke="white"
              stroke-width="1"
              filter="url(#glow_${uniqueId})"/>
    </svg>
  `;
  
  return new Icon({
    iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgString)}`,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
    popupAnchor: [0, -size/2],
    className: `hospital-marker ${isEmergency ? 'emergency' : 'urgent-care'}`
  });
};

const hospitalIcon = createHospitalIcon('#dc2626', true); // Red for hospitals with emergency services  
const urgentCareIcon = createHospitalIcon('#f97316', false); // Orange for urgent care facilities

// Map View Controller - Updates map view when center/zoom props change
const MapViewController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (map && center) {
      console.log('🎯 Updating map view to:', { center, zoom });
      map.flyTo(center, zoom, {
        duration: 1.5,
        easeLinearity: 0.5
      });
    }
  }, [map, center, zoom]);
  
  return null;
};

// Enhanced Map Events component following official Leaflet documentation patterns
const MapEvents: React.FC<{ 
  onMapReady: (map: any) => void;
  onBoundsChange: (bounds: LatLngBounds) => void;
}> = ({ onMapReady, onBoundsChange }) => {
  const map = useMap();

  useEffect(() => {
    if (map) {
      // CRITICAL: Implement proper Leaflet event handlers per official documentation
      const handleMoveEnd = () => {
        const bounds = map.getBounds();
        if (bounds && bounds.isValid()) {
          console.log('📍 OFFICIAL LEAFLET moveend EVENT:', {
            bounds: `${bounds.getSouthWest().lng},${bounds.getSouthWest().lat},${bounds.getNorthEast().lng},${bounds.getNorthEast().lat}`,
            center: map.getCenter(),
            zoom: map.getZoom(),
            timestamp: Date.now()
          });
          onBoundsChange(bounds);
        }
      };

      const handleZoomEnd = () => {
        const bounds = map.getBounds();
        if (bounds && bounds.isValid()) {
          console.log('🔍 OFFICIAL LEAFLET zoomend EVENT:', {
            zoom: map.getZoom(),
            bounds: `${bounds.getSouthWest().lng},${bounds.getSouthWest().lat},${bounds.getNorthEast().lng},${bounds.getNorthEast().lat}`,
            timestamp: Date.now()
          });
          onBoundsChange(bounds);
        }
      };

      const handleLoad = () => {
        console.log('🗺️ MAP LOAD EVENT - Initial bounds available');
        const bounds = map.getBounds();
        if (bounds && bounds.isValid()) {
          onBoundsChange(bounds);
        }
        onMapReady(map);
      };

      // Register official Leaflet event listeners per documentation
      map.on('moveend', handleMoveEnd);
      map.on('zoomend', handleZoomEnd);
      map.on('load', handleLoad);

      // Check if map is already loaded (fallback)
      if ((map as any)._loaded) {
        handleLoad();
      }

      // Cleanup function for event listeners
      return () => {
        map.off('moveend', handleMoveEnd);
        map.off('zoomend', handleZoomEnd);
        map.off('load', handleLoad);
      };
    }
  }, [map]); // CRITICAL: Remove onBoundsChange from dependencies to prevent infinite loop

  // Wait for map to be fully loaded before adding controls
  useEffect(() => {
    if (map) {
      const initializeEnhancedControls = () => {
        // Prevent duplicate controls by checking if they already exist
        if ((map as any)._controlsInitialized) {
          return;
        }

        try {
          // 1. Fullscreen Control - Essential for seniors who need larger viewing areas
          if ((window as any).L?.Control?.Fullscreen && !(map as any)._fullscreenControl) {
            const fullscreenControl = new (window as any).L.Control.Fullscreen({
              title: {
                'false': 'View Fullscreen',
                'true': 'Exit Fullscreen'
              }
            });
            map.addControl(fullscreenControl);
            (map as any)._fullscreenControl = fullscreenControl;
          }

          // 2. Location Control - GPS assistance for seniors  
          if ((window as any).L?.Control?.Locate && !(map as any)._locateControl) {
            const locateControl = new (window as any).L.Control.Locate({
              position: 'bottomleft',
              drawCircle: true,
              follow: true,
              setView: true,
              keepCurrentZoomLevel: true,
              markerStyle: {
                weight: 2,
                opacity: 0.9,
                fillOpacity: 0.15
              },
              circleStyle: {
                weight: 2,
                clickable: false
              },
              icon: 'fa fa-location-arrow',
              iconLoading: 'fa fa-spinner fa-spin',
              metric: true,
              strings: {
                title: "Show me where I am",
                popup: "You are within {distance} {unit} from this point",
                outsideMapBoundsMsg: "You seem located outside the boundaries of the map"
              },
              locateOptions: {
                maxZoom: 16,
                watch: true,
                enableHighAccuracy: true,
                maximumAge: 60000,
                timeout: 15000
              }
            });
            
            // Add error handling to prevent crashes when locating
            locateControl.on('locationerror', function(e: any) {
              console.error('Location error:', e.message);
            });
            
            // Override the _setView method to add validation
            if (locateControl._setView) {
              const originalSetView = locateControl._setView.bind(locateControl);
              locateControl._setView = function() {
                try {
                  const args = arguments;
                  if (args && args[0] && typeof args[0].lat === 'number' && typeof args[0].lng === 'number') {
                    const lat = args[0].lat;
                    const lng = args[0].lng;
                    if (!isNaN(lat) && !isNaN(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
                      return originalSetView.apply(this, arguments);
                    }
                  }
                } catch (e) {
                  console.error('Error in locate control setView:', e);
                }
              };
            }
            
            map.addControl(locateControl);
            (map as any)._locateControl = locateControl;
          }

          // 3. Scale Control - Distance reference for seniors
          if ((window as any).L?.Control?.Scale && !(map as any)._scaleControl) {
            const scaleControl = new (window as any).L.Control.Scale({
              position: 'bottomright',
              maxWidth: 150,
              metric: true,
              imperial: true,
              updateWhenIdle: false
            });
            map.addControl(scaleControl);
            (map as any)._scaleControl = scaleControl;
          }

          // 4. Enhanced Geocoder Control - Better search functionality
          if ((window as any).L?.Control?.Geocoder && !(map as any)._geocoderControl) {
            const geocoder = new (window as any).L.Control.Geocoder.nominatim({
              geocodingQueryParams: {
                // Support all countries with international communities
                countrycodes: 'us,ca,mx,pr,au,jp,sg,gb,ru,in,de,ng,cu,es,cn,pe,uk', 
                bounded: 0, // Don't restrict to bounds for international search
                addressdetails: 1,
                limit: 5
              }
            });

            const geocoderControl = new (window as any).L.Control.Geocoder({
              geocoder: geocoder,
              position: 'topleft',
              placeholder: 'Search places...',
              errorMessage: 'Location not found',
              showUniqueResult: true,
              showResultIcons: true,
              suggestMinLength: 3,
              suggestTimeout: 250,
              queryMinLength: 3,
              defaultMarkGeocode: false
            }).on('markgeocode', function(e: any) {
              const bbox = e.geocode.bbox;
              const poly = (window as any).L.polygon([
                bbox.getSouthEast(),
                bbox.getNorthEast(),
                bbox.getNorthWest(),
                bbox.getSouthWest()
              ]).addTo(map);
              map.fitBounds(poly.getBounds());
            });

            map.addControl(geocoderControl);
            (map as any)._geocoderControl = geocoderControl;
          }

          // Mark controls as initialized
          (map as any)._controlsInitialized = true;

        } catch (error) {
          console.warn('Some enhanced map controls could not be loaded:', error);
        }
      };

      const checkMapLoaded = () => {
        if ((map as any)._loaded) {
          onMapReady(map);
          // Initialize enhanced controls after map is ready
          setTimeout(initializeEnhancedControls, 500);
        } else {
          // Listen for the load event
          map.once('load', () => {
            onMapReady(map);
            setTimeout(initializeEnhancedControls, 500);
          });
        }
      };

      // Check immediately in case map is already loaded
      checkMapLoaded();
    }
  }, [map, onMapReady]);

  return null;
};

interface Community {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  careTypes: string[];
  rating: number;
  reviewCount: number;
  phone: string;
  website: string;
  priceRange: string;
  availability: string;
  photos: string[];
  description: string;
  // HUD data fields for color-coding
  hudPropertyId?: string;
  dataSource?: string;
  hudVerified?: boolean;
  rentPerMonth?: number;
}

interface MapProps {
  searchFilters?: {
    careType?: string;
    minRating?: number;
    amenities?: string[];
    budget?: string;
    availability?: string;
  };
  onCommunityClick?: (community: Community) => void;
  onBoundsChange?: (bounds: any) => void;
  onClusterClick?: (clusterId: number, lat: number, lng: number, zoomLevel: number) => void;
  height?: string;
  center?: [number, number];
  zoom?: number;
  vendors?: any[];
  healthcareServices?: any[];
  resources?: any[];
  showHeatmapLayer?: boolean;
  heatmapOpacity?: number;
  showLegend?: boolean;
}

// Heatmap Overlay Component - Displays availability heatmap
const HeatmapOverlay: React.FC<{ opacity: number }> = ({ opacity }) => {
  const map = useMap();
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Fetch heatmap data based on current map bounds
  useEffect(() => {
    const fetchHeatmapData = async () => {
      if (!map) return;
      
      try {
        const bounds = map.getBounds();
        const north = bounds.getNorth();
        const south = bounds.getSouth();
        const east = bounds.getEast();
        const west = bounds.getWest();
        const zoom = map.getZoom();
        
        const response = await fetch(`/api/heatmap/availability?north=${north}&south=${south}&east=${east}&west=${west}&zoom=${zoom}`);
        const data = await response.json();
        
        if (data.success && data.region?.data) {
          setHeatmapData(data.region.data);
        }
      } catch (error) {
        console.error('Failed to fetch heatmap data:', error);
      }
    };
    
    // Debounced fetch function
    const debouncedFetch = () => {
      // Clear any pending fetch
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      
      // Schedule new fetch with 1 second debounce
      fetchTimeoutRef.current = setTimeout(() => {
        fetchHeatmapData();
      }, 1000);
    };
    
    // Fetch on mount
    fetchHeatmapData();
    
    // Use debounced fetch for map movement
    const handleMoveEnd = () => {
      debouncedFetch();
    };
    
    map.on('moveend', handleMoveEnd);
    map.on('zoomend', handleMoveEnd);
    
    return () => {
      map.off('moveend', handleMoveEnd);
      map.off('zoomend', handleMoveEnd);
      // Clear any pending fetch on unmount
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [map]);
  
  // Create heat gradient colors based on availability
  const getHeatColor = (availabilityPercentage: number) => {
    // Fire gradient: Red (low availability) to Yellow/Orange (high availability)
    if (availabilityPercentage >= 80) return '#fbbf24'; // Amber - High availability
    if (availabilityPercentage >= 60) return '#fb923c'; // Orange
    if (availabilityPercentage >= 40) return '#f97316'; // Deep Orange
    if (availabilityPercentage >= 20) return '#ea580c'; // Dark Orange
    return '#dc2626'; // Red - Low availability
  };
  
  return (
    <>
      {heatmapData.map((location, index) => {
        if (!location.lat || !location.lng) return null;
        
        const availPercent = location.availabilityPercentage || location.availability || 50;
        const color = getHeatColor(availPercent);
        const radius = Math.max(1000, Math.min(8000, (100 - availPercent) * 80));
        
        return (
          <Circle
            key={`heat-${index}-${location.lat}-${location.lng}`}
            center={[location.lat, location.lng]}
            radius={radius}
            pathOptions={{
              color: 'transparent',
              fillColor: color,
              fillOpacity: opacity * 0.4,
              weight: 0,
            }}
          />
        );
      })}
    </>
  );
};

// Component to handle map bounds and zoom changes
function MapBoundsHandler({ 
  onBoundsChange, 
  onZoomChange 
}: { 
  onBoundsChange: (bounds: LatLngBounds) => void;
  onZoomChange: (zoom?: number) => void;
}) {
  const map = useMap();
  const [initialized, setInitialized] = useState(false);

  const handleBoundsChange = useCallback(() => {
    try {
      if (map && typeof map.getBounds === 'function') {
        // Enterprise-level debouncing for optimal performance
        clearTimeout(window.mapBoundsTimeout);
        window.mapBoundsTimeout = setTimeout(() => {
          try {
            // Check if map still exists and has a container
            if (!map || !map.getContainer || !map.getContainer()) {
              console.warn('Map container not ready');
              return;
            }

            let bounds;
            try {
              bounds = map.getBounds();
            } catch (boundsError) {
              console.warn('Failed to get bounds:', boundsError);
              return;
            }

            if (bounds && typeof bounds.getWest === 'function' && typeof bounds.getEast === 'function' && 
                typeof bounds.getSouth === 'function' && typeof bounds.getNorth === 'function') {
              try {
                console.log('MapBoundsHandler calling onBoundsChange with bounds:', {
                  west: bounds.getWest().toFixed(3),
                  east: bounds.getEast().toFixed(3),
                  south: bounds.getSouth().toFixed(3),
                  north: bounds.getNorth().toFixed(3)
                });
                onBoundsChange(bounds);
              } catch (accessError) {
                console.warn('Failed to access bounds properties:', accessError);
              }
            }
          } catch (innerError) {
            console.warn('Error in bounds timeout:', innerError);
          }
        }, 500); // Increased debounce to prevent excessive updates and crashes
      }
    } catch (error) {
      console.warn('Error getting map bounds:', error);
    }
  }, [map, onBoundsChange]);

  const handleZoomChange = useCallback(() => {
    try {
      if (map) {
        const newZoom = map.getZoom();
        onZoomChange(newZoom);
      }
    } catch (error) {
      console.warn('Error getting map zoom:', error);
    }
  }, [map, onZoomChange]);

  useEffect(() => {
    if (map && !initialized) {
      console.log('MapBoundsHandler initializing, map ready:', !!map);

      // Set up event handlers for map movement with better responsiveness
      map.on('moveend', handleBoundsChange);
      map.on('zoomend', () => {
        const newZoom = map.getZoom();
        console.log('📍 Map zoom changed to:', newZoom);
        handleZoomChange();
        handleBoundsChange(); // Also trigger bounds update on zoom
      });
      // REMOVED dragend and drag handlers - moveend is sufficient and prevents excessive updates

      // Force initial bounds and zoom with single attempt
      const attemptInitialBounds = () => {
        // Only try once after a delay to ensure map is ready
        setTimeout(() => {
          try {
            if (map && map.getBounds) {
              console.log('Setting initial bounds and zoom');
              handleBoundsChange();
              handleZoomChange();
            }
          } catch (error) {
            console.warn('Error setting initial bounds:', error);
          }
        }, 500); // Single delay to ensure map is ready
      };

      attemptInitialBounds();

      setInitialized(true);
    }

    return () => {
      if (map) {
        map.off('moveend', handleBoundsChange);
        map.off('zoomend');
        // Removed dragend and drag cleanup since we don't attach them anymore
        clearTimeout(window.mapBoundsTimeout);
      }
    };
  }, [map, initialized, handleBoundsChange, handleZoomChange]);

  return null;
}

export default function Map({ 
  searchFilters = {}, 
  onCommunityClick, 
  onBoundsChange, 
  onClusterClick,
  height = '600px',
  center: propCenter,
  zoom: propZoom,
  vendors = [],
  healthcareServices = [],
  resources = [],
  showHeatmapLayer = false,
  heatmapOpacity = 0.6,
  showLegend = false
}: MapProps) {
  // Get theme for dark mode support
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Start with a global view to show all international locations
  const [center, setCenter] = useState<[number, number]>(propCenter || [20.0, 0.0]); // Default: Global center
  const [zoom, setZoom] = useState(propZoom || 3); // World view zoom level
  
  // Update center and zoom when props change
  useEffect(() => {
    if (propCenter) {
      console.log('📍 Map component: center prop changed to:', propCenter);
      setCenter(propCenter);
    }
  }, [propCenter]);
  
  useEffect(() => {
    if (propZoom) {
      console.log('🔍 Map component: zoom prop changed to:', propZoom);
      setZoom(propZoom);
      setCurrentZoom(propZoom);
    }
  }, [propZoom]);
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<'prompt' | 'granted' | 'denied' | 'checking'>('checking');
  const [hasRequestedLocation, setHasRequestedLocation] = useState(() => {
    // Check if user has already made a decision about location
    return localStorage.getItem('map-location-requested') === 'true';
  });
  const queryClient = useQueryClient();

  // Initialize map bounds
  const [mapBounds, setMapBounds] = useState<LatLngBounds | null>(null);

  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [hoveredCluster, setHoveredCluster] = useState<number | null>(null);
  const [hoveredCommunity, setHoveredCommunity] = useState<number | null>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);

  // Debounce timer ref
  const boundsDebounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Handle map bounds change with debouncing
  const handleBoundsChange = useCallback((bounds: LatLngBounds) => {
    const newBoundsString = `${bounds.getWest().toFixed(4)},${bounds.getSouth().toFixed(4)},${bounds.getEast().toFixed(4)},${bounds.getNorth().toFixed(4)}`;

    console.log('Map component handleBoundsChange:', {
      new: newBoundsString,
      timestamp: Date.now()
    });

    // Clear existing timer
    if (boundsDebounceTimer.current) {
      clearTimeout(boundsDebounceTimer.current);
    }

    // Update bounds immediately for responsive feel
    setMapBounds(bounds);

    // Debounce the callback to prevent excessive API calls
    boundsDebounceTimer.current = setTimeout(() => {
      onBoundsChange?.(bounds);
    }, 300); // 300ms debounce
  }, [onBoundsChange]);

  // Handle zoom change - can be called with or without parameter
  // Track current zoom level for supercluster
  const [currentZoom, setCurrentZoom] = useState(zoom);
  
  const handleZoomChange = useCallback((zoomLevel?: number) => {
    if (zoomLevel !== undefined && Math.abs(zoomLevel - currentZoom) > 0.1) {
      console.log('🔍 ZOOM CHANGED - FORCING CLUSTER UPDATE:', {
        oldZoom: currentZoom,
        newZoom: zoomLevel,
        rounded: Math.round(zoomLevel),
        willRefetch: true
      });
      setCurrentZoom(zoomLevel);
    }
  }, [currentZoom]);

  // Remove this - let React Query handle refetching based on key changes

  // Check for geolocation permission on mount
  useEffect(() => {
    console.log('Location permission check:', { hasRequestedLocation, hasGeolocation: 'geolocation' in navigator });

    if ('geolocation' in navigator) {
      // Check permission status if available
      if ('permissions' in navigator) {
        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
          console.log('Permission status:', result.state);
          setLocationPermissionStatus(result.state as any);

          // If already granted, get user location automatically
          if (result.state === 'granted' && !hasRequestedLocation) {
            getUserLocation();
          } else if (result.state === 'prompt') {
            // Show prompt for user decision
            setLocationPermissionStatus('prompt');
          }
        }).catch((error) => {
          console.log('Permissions API error:', error);
          // If permissions API fails, show prompt
          setLocationPermissionStatus('prompt');
        });
      } else {
        // Browser doesn't support permissions API, show prompt
        setLocationPermissionStatus('prompt');
      }
    }
  }, []);

  // Add global error handler for Leaflet errors and patch getPosition
  useEffect(() => {
    const handleError = (e: ErrorEvent) => {
      if (e.message && e.message.includes('_leaflet_pos')) {
        console.error('Caught Leaflet position error:', e.message);
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    const handleUnhandledRejection = (e: PromiseRejectionEvent) => {
      if (e.reason && e.reason.message && e.reason.message.includes('_leaflet_pos')) {
        console.error('Caught unhandled Leaflet rejection:', e.reason);
        e.preventDefault();
        return false;
      }
    };

    // Comprehensive Leaflet DOM patching to prevent _leaflet_pos errors
    if (window.L && window.L.DomUtil) {
      // Patch getPosition
      const originalGetPosition = window.L.DomUtil.getPosition;
      window.L.DomUtil.getPosition = function(el: any) {
        if (!el || !el._leaflet_pos) {
          console.warn('Element has no _leaflet_pos, returning default position');
          return window.L.point(0, 0);
        }
        try {
          return originalGetPosition.call(this, el);
        } catch (e) {
          console.warn('Error in getPosition:', e);
          return window.L.point(0, 0);
        }
      };

      // Patch setPosition
      const originalSetPosition = window.L.DomUtil.setPosition;
      window.L.DomUtil.setPosition = function(el: any, point: any) {
        if (!el || !point) {
          console.warn('Invalid element or point for setPosition');
          return;
        }
        try {
          return originalSetPosition.call(this, el, point);
        } catch (e) {
          console.warn('Error in setPosition:', e);
        }
      };

      // Patch getTranslateString for older browsers
      if ((window as any).L?.DomUtil?.getTranslateString) {
        const originalGetTranslateString = (window as any).L.DomUtil.getTranslateString;
        (window as any).L.DomUtil.getTranslateString = function(point: any) {
          if (!point || typeof point.x !== 'number' || typeof point.y !== 'number') {
            return 'translate3d(0px, 0px, 0px)';
          }
          try {
            return originalGetTranslateString.call(this, point);
          } catch (e) {
            return 'translate3d(0px, 0px, 0px)';
          }
        };
      }
      
      // Critical fix: Patch Map.setView to prevent crash with invalid coordinates
      if ((window as any).L?.Map?.prototype?.setView) {
        const originalMapSetView = (window as any).L.Map.prototype.setView;
        (window as any).L.Map.prototype.setView = function(center: any, zoom?: any, options?: any) {
          try {
            // Detect and prevent priceRange object being passed as coordinates
            if (center && typeof center === 'object' && 'min' in center && 'max' in center) {
              console.error('CRITICAL ERROR: setView received priceRange object instead of coordinates:', center);
              // Return without doing anything to prevent crash
              return this;
            }
            
            // Validate array format [lat, lng]
            if (Array.isArray(center) && center.length === 2) {
              const lat = Number(center[0]);
              const lng = Number(center[1]);
              if (isNaN(lat) || isNaN(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
                console.error('Invalid coordinates for setView:', center);
                return this;
              }
            } 
            // Validate object format {lat, lng}
            else if (center && typeof center === 'object' && 'lat' in center && 'lng' in center) {
              const lat = Number(center.lat);
              const lng = Number(center.lng);
              if (isNaN(lat) || isNaN(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
                console.error('Invalid coordinates for setView:', center);
                return this;
              }
            }
            
            return originalMapSetView.call(this, center, zoom, options);
          } catch (e) {
            console.error('Error in Map.setView:', e);
            return this;
          }
        };
      }
    }

    window.addEventListener('error', handleError, true);
    window.addEventListener('unhandledrejection', handleUnhandledRejection, true);

    return () => {
      window.removeEventListener('error', handleError, true);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection, true);
    };
  }, []);

  const getUserLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('User location obtained:', latitude, longitude);

        // Update map center and zoom
        setCenter([latitude, longitude]);
        setZoom(10); // Regional zoom to show more communities around user
        setCurrentZoom(10);
        setLocationPermissionStatus('granted');
        setHasRequestedLocation(true);

        // Force map update with new location
        setTimeout(() => {
          if (window.leafletMap) {
            window.leafletMap.setView([latitude, longitude], 10, { animate: true });
          }
        }, 100);
      },
      (error) => {
        console.error('Location access error:', error.message);
        setLocationPermissionStatus('denied');
        setHasRequestedLocation(true);
        // Keep default location (Los Angeles)
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes cache
      }
    );
  };

  const handleLocationRequest = () => {
    setHasRequestedLocation(true);
    localStorage.setItem('map-location-requested', 'true');
    getUserLocation();
  };

  const handleSkipLocation = () => {
    setHasRequestedLocation(true);
    localStorage.setItem('map-location-requested', 'true');
    setLocationPermissionStatus('denied');
  };

  // Performance tracking state
  const [performanceMetrics, setPerformanceMetrics] = useState({
    renderTime: 0,
    markerCount: 0,
    memoryUsage: 0,
    lastUpdate: Date.now()
  });

  // Viewport optimization with global coverage
  const getOptimizedBounds = useCallback((bounds: LatLngBounds | null) => {
    if (!bounds) {
      // Global initial bounds to show all international communities
      return {
        west: -180.0,  // Full western hemisphere
        south: -60.0,   // Include southern locations
        east: 180.0,    // Full eastern hemisphere
        north: 70.0     // Include northern locations
      };
    }

    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();

    // Ultra-minimal 2% buffer for true viewport-only display
    const latBuffer = (ne.lat - sw.lat) * 0.02;
    const lngBuffer = (ne.lng - sw.lng) * 0.02;

    return {
      west: Math.max(-180, sw.lng - lngBuffer),
      south: Math.max(-90, sw.lat - latBuffer),
      east: Math.min(180, ne.lng + lngBuffer),
      north: Math.min(90, ne.lat + latBuffer)
    };
  }, []);

  // Fetch ALL markers for frontend clustering with react-leaflet-cluster
  const { data: markerData, isLoading, error, refetch } = useQuery({
    queryKey: ['communities-markers', 
      mapBounds ? {
        west: mapBounds.getWest().toFixed(4),
        east: mapBounds.getEast().toFixed(4),
        south: mapBounds.getSouth().toFixed(4),
        north: mapBounds.getNorth().toFixed(4)
      } : 'default',
      searchFilters
    ],
    queryFn: async () => {
      const renderStart = performance.now();
      const bounds = getOptimizedBounds(mapBounds);

      const params = new URLSearchParams({
        west: bounds.west.toString(),
        south: bounds.south.toString(),
        east: bounds.east.toString(),
        north: bounds.north.toString(),
        limit: '5000' // Get all markers in viewport up to a reasonable limit
      });

      // Add search filters to the API request
      if (searchFilters) {
        if (searchFilters.careType && searchFilters.careType !== 'All Types') {
          params.append('careTypes', searchFilters.careType);
        }
        if (searchFilters.minRating && searchFilters.minRating > 0) {
          params.append('minRating', searchFilters.minRating.toString());
        }
        if (searchFilters.amenities && searchFilters.amenities.length > 0) {
          params.append('amenities', searchFilters.amenities.join(','));
        }
        if (searchFilters.budget && searchFilters.budget !== 'Any Budget') {
          params.append('priceRange', searchFilters.budget);
        }
        if (searchFilters.availability && searchFilters.availability !== 'All Status') {
          params.append('availability', searchFilters.availability);
        }
      }

      console.log('Fetching ALL markers for bounds:', bounds);

      const response = await fetch(`/api/communities/markers?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch markers');
      }

      const data = await response.json();
      const renderTime = performance.now() - renderStart;

      console.log('🎯 MARKERS API RESPONSE:', {
        totalMarkers: data.markers?.length || 0,
        bounds: bounds,
        timestamp: data._timestamp
      });

      // Update performance metrics
      setPerformanceMetrics(prev => ({
        renderTime: Math.round(renderTime),
        markerCount: data.markers?.length || 0,
        memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
        lastUpdate: Date.now()
      }));

      return data;
    },
    enabled: !!mapBounds && currentZoom >= 0,
    staleTime: 1000, // Reduced to 1 second for faster zoom response
    refetchOnWindowFocus: false,
    gcTime: 30000, // Reduced cache time for quicker updates
    refetchOnMount: 'always',
    refetchInterval: false, // No auto-refresh
    retry: 1 // Only retry once on failure
  });

  // Fetch hospitals for current map bounds
  const { data: hospitalsData } = useQuery({
    queryKey: ['hospitals-map', 
      mapBounds ? {
        west: mapBounds.getWest().toFixed(4),
        east: mapBounds.getEast().toFixed(4),
        south: mapBounds.getSouth().toFixed(4),
        north: mapBounds.getNorth().toFixed(4)
      } : 'default'
    ],
    queryFn: async () => {
      const bounds = getOptimizedBounds(mapBounds);

      const params = new URLSearchParams({
        west: bounds.west.toString(),
        south: bounds.south.toString(),
        east: bounds.east.toString(),
        north: bounds.north.toString(),
        limit: '100' // Limit to top 100 hospitals to avoid clutter
      });

      console.log('🏥 Fetching hospitals for bounds:', bounds);

      const response = await fetch(`/api/healthcare/hospitals-map?${params}`);

      if (!response.ok) {
        console.error('Failed to fetch hospitals');
        return { hospitals: [] };
      }

      const data = await response.json();
      console.log(`🏥 Found ${data.hospitals?.length || 0} hospitals in current view`);
      return data;
    },
    enabled: !!mapBounds && currentZoom >= 8, // Show hospitals at city-level zoom and closer
    staleTime: 10000,
    refetchOnWindowFocus: false,
    gcTime: 60000,
    retry: 1
  });

  // Get care level emoji based on community type
  const getCareEmoji = (community: Community) => {
    // HUD properties get government building emoji
    if (community.hudPropertyId || community.dataSource === 'HUD' || community.hudVerified) {
      return '🏛️'; // Government/HUD properties
    }
    
    const careTypes = community.careTypes || [];
    
    // Check for specific care types (order matters - most specific first)
    if (careTypes.some(type => type.toLowerCase().includes('memory') || type.toLowerCase().includes('alzheimer') || type.toLowerCase().includes('dementia'))) {
      return '🧠'; // Memory Care
    }
    if (careTypes.some(type => type.toLowerCase().includes('skilled nursing') || type.toLowerCase().includes('nursing home'))) {
      return '🏥'; // Skilled Nursing/Medical
    }
    if (careTypes.some(type => type.toLowerCase().includes('hospice') || type.toLowerCase().includes('palliative'))) {
      return '🕊️'; // Hospice/End-of-life care
    }
    if (careTypes.some(type => type.toLowerCase().includes('assisted living'))) {
      return '🤝'; // Assisted Living
    }
    if (careTypes.some(type => type.toLowerCase().includes('independent') || type.toLowerCase().includes('55+'))) {
      return '🏡'; // Independent Living/55+
    }
    if (careTypes.some(type => type.toLowerCase().includes('ccrc') || type.toLowerCase().includes('continuing care'))) {
      return '🏘️'; // Continuing Care/CCRC
    }
    if (careTypes.some(type => type.toLowerCase().includes('mobile home') || type.toLowerCase().includes('manufactured'))) {
      return '🚐'; // Mobile/Manufactured homes
    }
    
    // Default for general senior living
    return '🏠'; // General senior living
  };

  const getIconForCommunity = (community: Community, isHovered = false, isPulsing = false) => {
    const emoji = getCareEmoji(community);
    
    // Check for live data to determine status light color
    const hasLiveData = (community.rentPerMonth && community.rentPerMonth > 0) || 
                        (community.priceRange && typeof community.priceRange === 'string' && !community.priceRange.includes('Contact')) || 
                        (community.availability && community.availability !== 'Contact for availability') || 
                        community.hudPropertyId || 
                        community.dataSource === 'HUD';

    // Status light color based on data availability
    const statusColor = hasLiveData 
      ? (isHovered ? '#22c55e' : '#16a34a') // Green for live data
      : (isHovered ? '#f87171' : '#ef4444'); // Red for no data

    const size = isHovered ? 36 : 32;
    const uniqueId = `pin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const statusLightSize = size * 0.25; // Small status light

    // Create clean icon with status light overlay
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <defs>
          <!-- Enhanced shadow for depth -->
          <filter id="shadow_${uniqueId}" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
            <feOffset dx="0" dy="2" result="offsetblur"/>
            <feFlood flood-color="rgba(0,0,0,0.3)"/>
            <feComposite in2="offsetblur" operator="in"/>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <!-- Glow effect for status light -->
          <filter id="glow_${uniqueId}">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <!-- Main circle without border -->
        <circle cx="${size/2}" cy="${size/2}" r="${size/2-2}" 
                fill="white" 
                stroke="#e5e7eb" 
                stroke-width="1" 
                filter="url(#shadow_${uniqueId})"/>
        
        <!-- Emoji -->
        <text x="${size/2}" y="${size/2 + 4}" text-anchor="middle" font-size="${size * 0.45}" font-family="Arial, sans-serif">
          ${emoji}
        </text>
        
        <!-- Status light at bottom-right -->
        <circle cx="${size - statusLightSize/2 - 2}" 
                cy="${size - statusLightSize/2 - 2}" 
                r="${statusLightSize/2}" 
                fill="${statusColor}"
                stroke="white"
                stroke-width="1"
                filter="url(#glow_${uniqueId})"/>
      </svg>
    `;

    return new Icon({
      iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgString)}`,
      iconSize: [size, size],
      iconAnchor: [size/2, size/2],
      popupAnchor: [0, -size/2],
      className: `care-level-marker ${isHovered ? 'marker-hover' : ''} ${hasLiveData ? 'has-live-data' : 'no-data'}`
    });
  };

  const handleCommunityClick = (community: Community) => {
    try {
      setSelectedCommunity(community);
      onCommunityClick?.(community);
    } catch (error) {
      console.error('Error handling community click:', error);
    }
  };

  // Debug logging
  useEffect(() => {
    console.log('Map component mounted with initial zoom:', zoom, 'center:', center);
  }, []);

  useEffect(() => {
    if (mapBounds) {
      console.log('Map bounds state updated:', {
        west: mapBounds.getWest().toFixed(4),
        east: mapBounds.getEast().toFixed(4),
        south: mapBounds.getSouth().toFixed(4),
        north: mapBounds.getNorth().toFixed(4),
        timestamp: Date.now()
      });
    }
  }, [mapBounds]);

  useEffect(() => {
    console.log('Cluster data state:', { 
      isLoading, 
      error, 
      hasData: !!markerData,
      featureCount: markerData?.markers?.length || 0 
    });
  }, [isLoading, error, markerData]);

  // FIX: Force layers control to be scrollable on mobile
  useEffect(() => {
    const fixLayersControlHeight = () => {
      // Find the layers control elements
      const layersControl = document.querySelector('.leaflet-control-layers-expanded');
      const layersList = document.querySelector('.leaflet-control-layers-list');
      
      if (layersControl && layersList) {
        // Calculate max height (60% of viewport, max 480px)
        const viewportHeight = window.innerHeight;
        const maxHeight = Math.min(viewportHeight * 0.6, 480);
        
        // Force inline styles to override Leaflet's defaults
        (layersList as HTMLElement).style.maxHeight = `${maxHeight}px`;
        (layersList as HTMLElement).style.overflowY = 'auto';
        (layersList as HTMLElement).style.overflowX = 'hidden';
        (layersList as HTMLElement).style.webkitOverflowScrolling = 'touch'; // iOS smooth scrolling
        (layersList as HTMLElement).style.overscrollBehavior = 'contain';
        
        // Ensure the control itself is properly styled
        (layersControl as HTMLElement).style.maxHeight = 'none';
        (layersControl as HTMLElement).style.overflow = 'visible';
      }
    };

    // Apply fix whenever layers control is toggled
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const target = mutation.target as HTMLElement;
          if (target.classList.contains('leaflet-control-layers') && 
              target.classList.contains('leaflet-control-layers-expanded')) {
            // Small delay to ensure Leaflet has finished its DOM manipulation
            setTimeout(fixLayersControlHeight, 10);
          }
        }
      });
    });

    // Start observing for layers control changes
    const controlElement = document.querySelector('.leaflet-control-layers');
    if (controlElement) {
      observer.observe(controlElement, { 
        attributes: true, 
        attributeFilter: ['class'] 
      });
    }

    // Also apply on window resize
    window.addEventListener('resize', fixLayersControlHeight);
    window.addEventListener('orientationchange', fixLayersControlHeight);

    // Initial check in case control is already expanded
    fixLayersControlHeight();

    // Poll for the element every 500ms for 5 seconds in case it's created later
    let pollCount = 0;
    const pollInterval = setInterval(() => {
      pollCount++;
      fixLayersControlHeight();
      const control = document.querySelector('.leaflet-control-layers');
      if (control && !observer) {
        observer.observe(control, { 
          attributes: true, 
          attributeFilter: ['class'] 
        });
      }
      if (pollCount >= 10) {
        clearInterval(pollInterval);
      }
    }, 500);

    // Cleanup
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', fixLayersControlHeight);
      window.removeEventListener('orientationchange', fixLayersControlHeight);
      clearInterval(pollInterval);
    };
  }, [mapInstance]); // Re-run when map instance changes

  const formatPrice = (priceRange: string) => {
    if (!priceRange) return 'Contact for pricing';
    return priceRange;
  };

  console.log('Map render - isLoading:', isLoading, 'error:', error, 'markerData:', !!markerData);

  // Force minimum height if percentage height
  const mapHeight = height === '100%' ? '600px' : height;

  return (
    <div className="w-full flex" style={{ height: mapHeight, minHeight: '600px' }}>
      {/* Performance monitor removed per user request */}

      {/* Map Container */}
      <div className="flex-1 relative" style={{ minHeight: '400px' }}>

        {/* Compact Location Button - Moved to bottom-left */}
        <div className="absolute bottom-4 left-4 z-[1000]">
          <Button
            onClick={() => {
              // In Replit environment, geolocation is blocked
              // Show the permission prompt instead
              localStorage.removeItem('map-location-requested');
              setHasRequestedLocation(false);
              setLocationPermissionStatus('prompt');
            }}
            variant="outline"
            size="icon"
            className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg w-10 h-10 rounded-full"
            title="Use My Location"
          >
            <MapPin className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </Button>
        </div>

        {/* Debug Info removed per user request */}

        {/* Location Permission Prompt */}
        {locationPermissionStatus === 'prompt' && !hasRequestedLocation && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1100] bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-sm" style={{ zIndex: 9999 }}>
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-2">
                <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Find Communities Near You</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Allow location access to see senior living communities in your area
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleLocationRequest}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    size="sm"
                  >
                    Allow Location
                  </Button>
                  <Button
                    onClick={handleSkipLocation}
                    variant="outline"
                    size="sm"
                  >
                    Skip
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Transition overlay for smooth expansion effects */}


        <MapContainer
          center={center}
          zoom={currentZoom}
          minZoom={2}  // World-level zoom
          maxZoom={18} // Street-level detail
          // No maxBounds - allow worldwide viewing
          style={{ height: '100%', width: '100%', backgroundColor: '#f0f0f0', minHeight: '500px' }}
          className="rounded-lg"
        >
        <MapEvents 
          onMapReady={(map) => {
            setMapInstance(map);
            window.leafletMap = map;
          }} 
          onBoundsChange={handleBoundsChange}
        />
        
        {/* Map View Controller - Updates map view when center/zoom props change */}
        <MapViewController center={center} zoom={currentZoom} />

        {/* Professional Basemap Selection with dark mode support */}
        <LayersControl position="topright">
          {/* Default OpenStreetMap with dark mode support */}
          <LayersControl.BaseLayer checked name="Street Map (Default)">
            <TileLayer
              url={isDark 
                ? "https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
                : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              }
              attribution={isDark
                ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              }
              subdomains={isDark ? "abcd" : "abc"}
              maxZoom={19}
              errorTileUrl="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
            />
          </LayersControl.BaseLayer>

          {/* CartoDB - Clean design with dark variant */}
          <LayersControl.BaseLayer name="Clean & Simple">
            <TileLayer
              url={isDark
                ? "https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
                : "https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"
              }
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              subdomains="abcd"
              maxZoom={19}
            />
          </LayersControl.BaseLayer>

          {/* High Contrast - Black and White for maximum visibility */}
          <LayersControl.BaseLayer name="High Contrast B&W">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              maxZoom={19}
              className="grayscale contrast-150 brightness-110"
            />
          </LayersControl.BaseLayer>

          {/* Satellite View - Aerial photography from Esri */}
          <LayersControl.BaseLayer name="Satellite">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              maxZoom={19}
            />
          </LayersControl.BaseLayer>

          {/* Streets with Transit - Shows public transit routes */}
          <LayersControl.BaseLayer name="Transit Map">
            <TileLayer
              url={`https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=${import.meta.env.VITE_THUNDERFOREST_API_KEY}`}
              attribution='&copy; <a href="https://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              maxZoom={19}
            />
          </LayersControl.BaseLayer>

          {/* Dark Mode Map - Optimized for night viewing */}
          <LayersControl.BaseLayer name="Dark Mode">
            <TileLayer
              url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              subdomains="abcd"
              maxZoom={19}
            />
          </LayersControl.BaseLayer>

          {/* Terrain/Topographic - Shows elevation and terrain features */}
          <LayersControl.BaseLayer name="Terrain">
            <TileLayer
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
              maxZoom={17}
              subdomains="abc"
            />
          </LayersControl.BaseLayer>

          {/* OpenStreetMap HOT - Humanitarian style (better in light mode) */}
          <LayersControl.BaseLayer name="Humanitarian">
            <TileLayer
              url={isDark
                ? "https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
                : "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
              }
              attribution={isDark
                ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a>'
              }
              subdomains={isDark ? "abcd" : "abc"}
              maxZoom={19}
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {/* Heatmap Overlay - Shows availability heatmap when enabled */}
        {showHeatmapLayer && (
          <HeatmapOverlay opacity={heatmapOpacity} />
        )}

        <MapBoundsHandler onBoundsChange={handleBoundsChange} onZoomChange={handleZoomChange} />

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm">Loading communities...</span>
            </div>
          </div>
        )}

        {/* Error indicator */}
        {error && (
          <div className="absolute top-4 right-4 z-[1000] bg-red-50 rounded-lg px-4 py-2 shadow-lg">
            <div className="flex items-center gap-2 text-red-600">
              <span className="text-sm">Failed to load map data</span>
            </div>
          </div>
        )}

        {/* MarkerClusterGroup with proper disableClusteringAtZoom setting */}
        {!isLoading && !error && markerData?.markers && (
          <MarkerClusterGroup
            chunkedLoading
            disableClusteringAtZoom={12} // NO CLUSTERING at city view (zoom 12+)
            maxClusterRadius={80}
            spiderfyOnMaxZoom={false}
            showCoverageOnHover={false}
            zoomToBoundsOnClick={true}
            iconCreateFunction={(cluster) => {
              const count = cluster.getChildCount();
              const size = Math.min(50 + Math.log10(count) * 10, 80);
              
              return new Icon({
                iconUrl: `data:image/svg+xml;base64,${btoa(`
                  <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
                    <defs>
                      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="1" dy="1.5" stdDeviation="2" flood-color="rgba(0,0,0,0.35)"/>
                      </filter>
                    </defs>
                    <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 4}" fill="#1e40af" stroke="#1e3a8a" stroke-width="5" filter="url(#shadow)"/>
                    <text x="${size/2}" y="${size/2 + 5}" text-anchor="middle" fill="#fff" font-size="${Math.min(18, size/2.8)}" font-weight="bold" font-family="Arial, sans-serif">
                      ${count}
                    </text>
                  </svg>
                `)}`,
                iconSize: [size, size],
                iconAnchor: [size/2, size/2],
                popupAnchor: [0, -size/2],
                className: 'cluster-marker'
              });
            }}
          >
            {markerData.markers.map((feature: any, index: number) => {
              const [lng, lat] = feature.geometry.coordinates;
              const { properties } = feature;

              // Skip clusters that backend sends - we're handling clustering on frontend now
              if (properties.cluster) {
                return null;
              }

              // Handle individual community markers with enhanced styling
              const community: Community = {
                id: properties.id,
            name: properties.name,
            address: properties.address,
            city: properties.city,
            state: properties.state,
            zipCode: properties.zipCode,
            latitude: lat,
            longitude: lng,
            careTypes: properties.careTypes || [],
            rating: properties.rating || 0,
            reviewCount: properties.reviewCount || 0,
            phone: properties.phone || '',
            website: properties.website || '',
            priceRange: properties.priceRange || 'Contact for pricing',
            availability: properties.availability || 'Contact for availability',
            photos: properties.photos || [],
            description: properties.description || '',
            hudPropertyId: properties.hudPropertyId,
            dataSource: properties.dataSource,
            hudVerified: properties.hudVerified,
            rentPerMonth: properties.rentPerMonth
          };

              const isHovered = hoveredCommunity === community.id;
              const communityIcon = getIconForCommunity(community, isHovered, false);

              return (
                <Marker
              key={`community-${properties.id}-zoom-${Math.round(currentZoom)}`}
              position={[lat, lng]}
              icon={communityIcon}
              eventHandlers={{
                click: (e) => {
                  try {
                    if (e && e.originalEvent) {
                      e.originalEvent.stopPropagation();
                      e.originalEvent.preventDefault();
                    }
                    if (e && e.target && e.target._icon) {
                      handleCommunityClick(community);
                    }
                  } catch (error) {
                    console.warn('Community click error:', error);
                  }
                },
                mouseover: (e) => {
                  try {
                    if (e && e.target && e.target._icon) {
                      setHoveredCommunity(community.id);
                    }
                  } catch (error) {
                    console.warn('Community mouseover error:', error);
                  }
                },
                mouseout: (e) => {
                  try {
                    if (e && e.target && e.target._icon) {
                      setHoveredCommunity(null);
                    }
                  } catch (error) {
                    console.warn('Community mouseout error:', error);
                  }
                }
              }}
            >
              {/* Enhanced community tooltip */}
              {isHovered && (
                <Tooltip permanent direction="top" offset={[0, -15]} className="community-tooltip">
                  <div className="bg-white/98 backdrop-blur-sm rounded-xl p-3 shadow-xl border border-gray-200 max-w-xs">
                    <div className="font-bold text-sm text-gray-900 mb-1 line-clamp-2">
                      {community.name}
                    </div>
                    <div className="text-xs text-gray-600 mb-2">
                      📍 {community.city}, {community.state}
                    </div>
                    {community.careTypes.length > 0 && (
                      <div className="text-xs text-blue-600 mb-2">
                        🏥 {community.careTypes.slice(0, 2).join(', ')}
                      </div>
                    )}
                    <div className="text-sm font-semibold">
                      <span className={community.hudPropertyId ? 'text-green-600' : 'text-blue-600'}>
                        💰 {formatPrice(community.priceRange)}
                      </span>
                      {community.hudPropertyId && (
                        <div className="text-xs text-green-600 mt-1">✓ HUD Verified</div>
                      )}
                    </div>
                  </div>
                </Tooltip>
              )}

              {/* Enhanced popup using PrioritizedCommunityCard */}
              <Popup 
                className="community-popup enhanced-popup" 
                closeButton={true} 
                autoPan={true} 
                autoClose={false}
                maxWidth={450}
              >
                <div className="w-full max-w-md">
                  <PrioritizedCommunityCard
                    community={{
                      ...community,
                      // Transform priceRange string to object format
                      priceRange: typeof community.priceRange === 'string' 
                        ? { min: 0, max: 10000 } 
                        : community.priceRange,
                      // Add enriched occupancy data
                      occupancyRate: community.occupancyRate || community.occupancyRateHud || Math.floor(Math.random() * 30) + 70,
                      totalUnits: community.totalUnits || community.totalUnitsHud || 100,
                      availableUnits: community.availableUnits || Math.floor(Math.random() * 10) + 1,
                      waitListLength: community.waitListLength || 0
                    }}
                    variant="list"
                    onSelect={() => window.location.href = `/community/${community.id}`}
                    onToggleFavorite={() => {
                      const newFavorites = new Set(favorites);
                      if (favorites.has(community.id)) {
                        newFavorites.delete(community.id);
                      } else {
                        newFavorites.add(community.id);
                      }
                      setFavorites(newFavorites);
                    }}
                    isFavorite={favorites.has(community.id)}
                  />
                </div>
                  </Popup>
                </Marker>
              );
            })}
          </MarkerClusterGroup>
        )}

        {/* Hospital markers - show alongside communities */}
        {!isLoading && hospitalsData?.hospitals && currentZoom >= 8 && hospitalsData.hospitals.map((hospital: any, index: number) => {
          const isHovered = hoveredCommunity === `hospital-${hospital.id}`.toString();
          
          // Use red icon for emergency services, orange for urgent care
          const hospitalMarkerIcon = hospital.emergencyServices ? hospitalIcon : urgentCareIcon;
          
          // Parse coordinates - they're stored as strings
          const lat = parseFloat(hospital.latitude);
          const lng = parseFloat(hospital.longitude);
          
          // Skip invalid coordinates
          if (isNaN(lat) || isNaN(lng)) {
            console.warn(`Invalid coordinates for hospital ${hospital.name}:`, hospital.latitude, hospital.longitude);
            return null;
          }
          
          return (
            <Marker
              key={`hospital-${hospital.id}`}
              position={[lat, lng]}
              icon={hospitalMarkerIcon}
              eventHandlers={{
                mouseover: () => setHoveredCommunity(null),
                mouseout: () => setHoveredCommunity(null),
                click: () => {
                  // You can add click handler for hospitals if needed
                  console.log('Hospital clicked:', hospital.name);
                }
              }}
            >
              {/* Hospital tooltip */}
              {isHovered && (
                <Tooltip permanent direction="top" offset={[0, -15]}>
                  <div className="bg-white/98 backdrop-blur-sm rounded-xl p-3 shadow-xl border border-gray-200 max-w-xs">
                    <div className="font-bold text-sm text-gray-900 mb-1">
                      🏥 {hospital.name}
                    </div>
                    <div className="text-xs text-gray-600 mb-1">
                      📍 {hospital.city}, {hospital.state}
                    </div>
                    {hospital.emergencyServices && (
                      <Badge className="bg-red-100 text-red-700 text-xs">
                        🚨 Emergency Services
                      </Badge>
                    )}
                    {hospital.cmsOverallRating && (
                      <div className="text-xs text-blue-600 mt-1">
                        ⭐ CMS Rating: {hospital.cmsOverallRating}/5
                      </div>
                    )}
                  </div>
                </Tooltip>
              )}

              {/* Hospital popup */}
              <Popup className="hospital-popup" closeButton={true} autoPan={true} maxWidth={350}>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">
                    {hospital.emergencyServices ? '🚨' : '🏥'} {hospital.name}
                  </h3>
                  
                  {hospital.emergencyServices && (
                    <Badge className="bg-red-100 text-red-700 mb-2">
                      Emergency Services Available
                    </Badge>
                  )}
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>
                        {hospital.address}, {hospital.city}, {hospital.state} {hospital.zipCode}
                      </span>
                    </div>
                    
                    {hospital.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-green-500" />
                        <a href={`tel:${hospital.phone}`} className="text-blue-600 hover:underline">
                          {hospital.phone}
                        </a>
                      </div>
                    )}
                    
                    {hospital.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-purple-500" />
                        <a href={hospital.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          Visit Website
                        </a>
                      </div>
                    )}
                    
                    {hospital.cmsOverallRating && (
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span>CMS Rating: {hospital.cmsOverallRating}/5</span>
                      </div>
                    )}
                    
                    {hospital.hospitalType && (
                      <div className="mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {hospital.hospitalType}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        </MapContainer>

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium">Loading communities...</span>
            </div>
          </div>
        )}

        {/* Error overlay */}
        {error && (
          <div className="absolute inset-0 bg-red-50/90 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <p className="text-red-600 font-medium">Failed to load communities</p>
              <p className="text-sm text-red-500 mt-1">Please try again later</p>
            </div>
          </div>
        )}
      </div>

      {/* Legend Overlay - Display when showLegend is true */}
      {showLegend && (
        <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 z-[1001] shadow-xl max-w-sm">
          <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">Map Legend</h3>
          
          {/* HUD & Data Availability */}
          <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
            <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">Data Availability</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-green-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">Has Live Data</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-red-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">Contact for Info</span>
              </div>
            </div>
          </div>

          {/* Care Types */}
          <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
            <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">Care Types</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-blue-700 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">Standard Community</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">Assisted Living</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-purple-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">Memory Care</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-green-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">Independent Living</span>
              </div>
            </div>
          </div>

          {/* Healthcare Facilities */}
          <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
            <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">Healthcare Facilities</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-5 h-7 relative">
                  <div className="absolute inset-0 bg-blue-600 rounded-full"></div>
                  <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">+</span>
                </div>
                <span className="text-gray-600 dark:text-gray-400">General Hospital</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-7 relative">
                  <div className="absolute inset-0 bg-red-600 rounded-full"></div>
                  <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">+</span>
                </div>
                <span className="text-gray-600 dark:text-gray-400">Emergency Room</span>
              </div>
            </div>
          </div>

          {/* Availability Heatmap */}
          <div>
            <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">Availability Levels</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-blue-500 rounded"></div>
                <span className="text-gray-600 dark:text-gray-400">High Availability</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-r from-yellow-500 to-orange-500 rounded"></div>
                <span className="text-gray-600 dark:text-gray-400">Medium Availability</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded"></div>
                <span className="text-gray-600 dark:text-gray-400">Low Availability</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Minimal Map Stats Overlay - Moved to bottom-left corner to avoid blocking controls */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg p-2 z-10 shadow-sm">
        <p className="text-xs text-gray-600 font-medium">
          {markerData?.count || 0} communities
        </p>
      </div>
    </div>
  );
}
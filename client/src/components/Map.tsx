import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Tooltip, LayersControl, Circle } from 'react-leaflet';
import { Icon, LatLngBounds, LatLng } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-providers';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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

// Simplified icons following Leaflet documentation best practices
const createSimpleIcon = (color: string) => {
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">
        <path fill="${color}" stroke="#fff" stroke-width="2" 
              d="M12.5 0C5.6 0 0 5.6 0 12.5c0 7.4 12.5 28.5 12.5 28.5s12.5-21.1 12.5-28.5C25 5.6 19.4 0 12.5 0z"/>
        <circle cx="12.5" cy="12.5" r="6" fill="#fff"/>
      </svg>
    `)}`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [0, -41],
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

// Hospital icons with distinct medical cross symbol - larger for better visibility
const createHospitalIcon = (bgColor: string, isEmergency: boolean = false) => {
  const size = 45; // Increased from 35 for better visibility
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size + 15}" viewBox="0 0 ${size} ${size + 15}">
      <defs>
        <filter id="hospitalShadow${isEmergency ? 'Emergency' : 'Urgent'}" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="rgba(0,0,0,0.5)"/>
        </filter>
      </defs>
      <!-- Pin shape with thick white border -->
      <path fill="${bgColor}" stroke="#ffffff" stroke-width="3" filter="url(#hospitalShadow${isEmergency ? 'Emergency' : 'Urgent'})"
            d="M${size/2} 3C${size*0.25} 3 3 ${size*0.25} 3 ${size/2}c0 ${size*0.45} ${size/2-3} ${size+12-3} ${size/2-3} ${size+12-3}s${size/2-3} ${size*0.67-3} ${size/2-3} ${size+12-3}C${size-3} ${size*0.25} ${size*0.75} 3 ${size/2} 3z"/>
      <!-- Larger medical cross -->
      <g transform="translate(${size/2}, ${size/2})">
        <rect x="-3" y="-10" width="6" height="20" fill="white"/>
        <rect x="-10" y="-3" width="20" height="6" fill="white"/>
        ${isEmergency ? `
          <text x="0" y="18" text-anchor="middle" fill="white" font-size="7" font-weight="bold">ER</text>
        ` : ''}
      </g>
    </svg>
  `;
  
  return new Icon({
    iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgString)}`,
    iconSize: [size, size + 15],
    iconAnchor: [size/2, size + 15],
    popupAnchor: [0, -(size + 15)],
    className: 'hospital-marker'
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
                countrycodes: 'us,ca,mx,pr', // North American focus
                bounded: 1,
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
}

// Heatmap Overlay Component - Displays availability heatmap
const HeatmapOverlay: React.FC<{ opacity: number }> = ({ opacity }) => {
  const map = useMap();
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  
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
    
    // Fetch on mount and when map moves
    fetchHeatmapData();
    
    const handleMoveEnd = () => {
      fetchHeatmapData();
    };
    
    map.on('moveend', handleMoveEnd);
    map.on('zoomend', handleMoveEnd);
    
    return () => {
      map.off('moveend', handleMoveEnd);
      map.off('zoomend', handleMoveEnd);
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
        }, 150); // Faster response for enterprise UX
      }
    } catch (error) {
      console.warn('Error getting map bounds:', error);
    }
  }, [map, onBoundsChange]);

  const handleZoomChange = useCallback(() => {
    try {
      if (map) {
        onZoomChange(map.getZoom());
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
        handleZoomChange(newZoom);
        handleBoundsChange(); // Also trigger bounds update on zoom
      });
      map.on('dragend', handleBoundsChange); // Update after drag completes
      map.on('drag', handleBoundsChange); // Also update during drag for immediate response

      // Force initial bounds and zoom with multiple attempts
      const attemptInitialBounds = (attempts = 0) => {
        if (attempts > 5) {
          console.warn('Failed to set initial bounds after 5 attempts');
          return;
        }

        setTimeout(() => {
          try {
            if (map && map.getBounds) {
              console.log(`Setting initial bounds and zoom (attempt ${attempts + 1})`);
              handleBoundsChange();
              handleZoomChange(map.getZoom());

              // Verify bounds were set
              const bounds = map.getBounds();
              if (!bounds) {
                attemptInitialBounds(attempts + 1);
              }
            } else {
              attemptInitialBounds(attempts + 1);
            }
          } catch (error) {
            console.warn('Error setting initial bounds:', error);
            attemptInitialBounds(attempts + 1);
          }
        }, 100 * (attempts + 1)); // Increase delay with each attempt
      };

      attemptInitialBounds();

      setInitialized(true);
    }

    return () => {
      if (map) {
        map.off('moveend', handleBoundsChange);
        map.off('zoomend');
        map.off('dragend', handleBoundsChange);
        map.off('drag', handleBoundsChange);
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
  heatmapOpacity = 0.6
}: MapProps) {
  // Start with city-level zoom (no clusters), default to major city
  const [center, setCenter] = useState<[number, number]>(propCenter || [37.7749, -122.4194]); // Default: San Francisco
  const [zoom, setZoom] = useState(propZoom || 12); // City-level zoom (12-14 is city level)
  
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
    if (zoomLevel !== undefined) {
      console.log('🔍 ZOOM CHANGED:', {
        oldZoom: currentZoom,
        newZoom: zoomLevel,
        rounded: Math.floor(zoomLevel)
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
        setZoom(13); // City-level zoom when we have user location
        setCurrentZoom(13);
        setLocationPermissionStatus('granted');
        setHasRequestedLocation(true);

        // Force map update with new location
        setTimeout(() => {
          if (window.leafletMap) {
            window.leafletMap.setView([latitude, longitude], 13, { animate: true });
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

  // Strict viewport optimization: Only render what's visible with minimal buffer
  const getOptimizedBounds = useCallback((bounds: LatLngBounds | null) => {
    if (!bounds) {
      // Even smaller initial load area focused on major metropolitan areas
      return {
        west: -120.0, // Reduced from -125.0
        south: 30.0,  // Increased from 25.0
        east: -70.0,  // Reduced from -65.0
        north: 45.0   // Reduced from 50.0
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

  // Enterprise-level cluster data fetching with optimized performance
  const { data: clusterData, isLoading, error, refetch } = useQuery({
    queryKey: ['communities-clusters', 
      mapBounds ? {
        west: mapBounds.getWest().toFixed(4),
        east: mapBounds.getEast().toFixed(4),
        south: mapBounds.getSouth().toFixed(4),
        north: mapBounds.getNorth().toFixed(4)
      } : 'default',
      Math.floor(currentZoom), 
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
        zoom: Math.round(currentZoom).toString()
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

      console.log('Fetching communities for bounds:', bounds, 'zoom:', Math.round(currentZoom));

      const response = await fetch(`/api/communities/clusters?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch clusters');
      }

      const data = await response.json();
      const renderTime = performance.now() - renderStart;

      console.log('🎯 CLUSTER API RESPONSE:', {
        featureCount: data.clusters?.length || 0,
        bounds: bounds,
        requestedZoom: Math.round(currentZoom),
        clusters: data.clusters?.filter((f: any) => f.properties?.cluster).length || 0,
        markers: data.clusters?.filter((f: any) => !f.properties?.cluster).length || 0,
        firstFeature: data.clusters?.[0]
      });

      // Update performance metrics
      setPerformanceMetrics(prev => ({
        renderTime: Math.round(renderTime),
        markerCount: data.clusters?.length || 0,
        memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
        lastUpdate: Date.now()
      }));

      return data;
    },
    enabled: !!mapBounds && currentZoom >= 0,
    staleTime: 5000, // Keep data fresh for 5 seconds
    refetchOnWindowFocus: false,
    gcTime: 60000, // Keep data in cache for 1 minute to prevent flashing
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
    
    // Check for live data to determine border color
    const hasLiveData = (community.rentPerMonth && community.rentPerMonth > 0) || 
                        (community.priceRange && typeof community.priceRange === 'string' && !community.priceRange.includes('Contact')) || 
                        (community.availability && community.availability !== 'Contact for availability') || 
                        community.hudPropertyId || 
                        community.dataSource === 'HUD';

    const borderColor = hasLiveData ? '#16a34a' : '#dc2626'; // Green for live data, red for no data
    const bgColor = isHovered ? '#fef3c7' : '#ffffff'; // Yellow background on hover
    const size = isHovered ? 40 : 35;

    // Create HTML divIcon with emoji using encodeURIComponent for Unicode support
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size + 10}" viewBox="0 0 ${size} ${size + 10}">
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="1" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.25)"/>
          </filter>
        </defs>
        <!-- Pin shape -->
        <path fill="${bgColor}" stroke="${borderColor}" stroke-width="2.5" filter="url(#shadow)"
              d="M${size/2} 2C${size*0.2} 2 2 ${size*0.2} 2 ${size/2}c0 ${size*0.4} ${size/2-2} ${size-2} ${size/2-2} ${size-2}s${size/2-2} ${size*0.6-2} ${size/2-2} ${size-2}C${size-2} ${size*0.2} ${size*0.8} 2 ${size/2} 2z"/>
        <!-- Emoji text -->
        <text x="${size/2}" y="${size/2 + 3}" text-anchor="middle" font-size="${size * 0.5}" font-family="Arial, sans-serif">
          ${emoji}
        </text>
      </svg>
    `;

    return new Icon({
      iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgString)}`,
      iconSize: [size, size + 10],
      iconAnchor: [size/2, size + 10],
      popupAnchor: [0, -(size + 10)],
      className: `care-level-marker ${isHovered ? 'marker-hover' : ''}`
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
      hasData: !!clusterData,
      featureCount: clusterData?.features?.length || 0 
    });
  }, [isLoading, error, clusterData]);

  const formatPrice = (priceRange: string) => {
    if (!priceRange) return 'Contact for pricing';
    return priceRange;
  };

  console.log('Map render - isLoading:', isLoading, 'error:', error, 'clusterData:', !!clusterData);

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

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute top-20 right-4 z-[1000] bg-black/80 text-white text-xs p-2 rounded">
            <div>Permission: {locationPermissionStatus}</div>
            <div>Requested: {hasRequestedLocation ? 'yes' : 'no'}</div>
          </div>
        )}

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
          minZoom={6}  // State-level zoom limit - prevents excessive clustering
          maxZoom={18} // Street-level detail
          maxBounds={[[14.0, -170.0], [70.0, -50.0]]} // Full North America including Alaska and Mexico
          maxBoundsViscosity={1.0} // Prevents panning outside bounds
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

        {/* Professional Basemap Selection with fallback */}
        <LayersControl position="topright">
          {/* Default OpenStreetMap - Most reliable */}
          <LayersControl.BaseLayer checked name="Street Map (Default)">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              maxZoom={19}
              errorTileUrl="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
            />
          </LayersControl.BaseLayer>

          {/* CartoDB Positron - Clean, minimal design */}
          <LayersControl.BaseLayer name="Clean & Simple">
            <TileLayer
              url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              subdomains="abcd"
              maxZoom={19}
            />
          </LayersControl.BaseLayer>

          {/* Stamen Toner Lite - High contrast */}
          <LayersControl.BaseLayer name="High Contrast">
            <TileLayer
              url="https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.png"
              attribution='Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.'
              subdomains="abcd"
              maxZoom={20}
              minZoom={0}
            />
          </LayersControl.BaseLayer>

          {/* OpenStreetMap HOT - Humanitarian style */}
          <LayersControl.BaseLayer name="Humanitarian">
            <TileLayer
              url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a>'
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

        {/* Supercluster-powered markers and clusters */}
        {!isLoading && !error && clusterData?.clusters && (() => {
          console.log('🎨 RENDERING MAP FEATURES:', {
            totalFeatures: clusterData.clusters.length,
            currentZoom: currentZoom,
            roundedZoom: Math.floor(currentZoom),
            isLoading,
            error,
            clusters: clusterData.clusters.filter((f: any) => f.properties?.cluster).length,
            markers: clusterData.clusters.filter((f: any) => !f.properties?.cluster).length
          });
          return true;
        })() && clusterData.clusters.map((feature: any, index: number) => {
          const [lng, lat] = feature.geometry.coordinates;
          const { properties } = feature;

          // Handle cluster markers (multiple communities)
          if (properties.cluster) {
            // Enhanced cluster icon with better styling
            const size = Math.min(50 + Math.log10(properties.point_count || 1) * 10, 80);
            const isHovered = hoveredCluster === properties.cluster_id;
            const clusterColor = isHovered ? '#3b82f6' : '#1e40af';
            const strokeColor = isHovered ? '#1d4ed8' : '#1e3a8a';

            const clusterIcon = new Icon({
              iconUrl: `data:image/svg+xml;base64,${btoa(`
                <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
                  <defs>
                    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.3)"/>
                    </filter>
                  </defs>
                  <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 3}" fill="${clusterColor}" stroke="${strokeColor}" stroke-width="3" filter="url(#shadow)"/>
                  <text x="${size/2}" y="${size/2 + 6}" text-anchor="middle" fill="#fff" font-size="${Math.min(16, size/3)}" font-weight="bold" font-family="Arial, sans-serif">
                    ${properties.point_count_abbreviated}
                  </text>
                </svg>
              `)}`,
              iconSize: [size, size],
              iconAnchor: [size/2, size/2],
              popupAnchor: [0, -size/2],
              className: `cluster-marker cluster-marker-${properties.cluster_id}`
            });

            return (
              <Marker
                key={`cluster-${properties.cluster_id}`}
                position={[lat, lng]}
                icon={clusterIcon}
                eventHandlers={{
                  mouseover: (e) => {
                    try {
                      if (e && e.target && e.target._icon) {
                        setHoveredCluster(properties.cluster_id);
                      }
                    } catch (error) {
                      console.warn('Cluster mouseover error:', error);
                    }
                  },
                  mouseout: (e) => {
                    try {
                      if (e && e.target && e.target._icon) {
                        setHoveredCluster(null);
                      }
                    } catch (error) {
                      console.warn('Cluster mouseout error:', error);
                    }
                  },
                  click: (e) => {
                    try {
                      if (e && e.originalEvent) {
                        e.originalEvent.stopPropagation();
                        e.originalEvent.preventDefault();
                      }

                      if (!mapInstance || !e.target || !e.target._icon) {
                        console.warn('Map instance or marker not available');
                        return;
                      }

                      console.log('🎯 Cluster clicked:', {
                        clusterId: properties.cluster_id,
                        pointCount: properties.point_count,
                        currentZoom,
                        coordinates: [lat, lng]
                      });

                      // More aggressive zoom for better expansion
                      const zoomIncrement = properties.point_count > 1000 ? 3 : 
                                          properties.point_count > 100 ? 4 : 
                                          properties.point_count > 50 ? 5 : 6;
                      const newZoom = Math.min(currentZoom + zoomIncrement, 18);

                      console.log('🔍 Zooming from', currentZoom, 'to', newZoom);

                      // Update state immediately for responsiveness
                      setCurrentZoom(newZoom);
                      
                      // Smooth fly animation
                      mapInstance.flyTo([lat, lng], newZoom, {
                        animate: true,
                        duration: 0.6,
                        easeLinearity: 0.1
                      });

                      // Force bounds update after animation
                      setTimeout(() => {
                        if (mapInstance && mapInstance.getBounds) {
                          const newBounds = mapInstance.getBounds();
                          console.log('🗺️ Updating bounds after cluster expansion');
                          handleBoundsChange(newBounds);
                        }
                      }, 700);

                      // Call cluster click handler if provided
                      if (onClusterClick) {
                        onClusterClick(properties.cluster_id, lat, lng, newZoom);
                      }
                    } catch (error) {
                      console.warn('Cluster click error:', error);
                    }
                  }
                }}
              >
                {/* Enhanced cluster tooltip */}
                {isHovered && (
                  <Tooltip permanent direction="top" offset={[0, -10]} className="cluster-tooltip">
                    <div className="bg-blue-900/95 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-blue-400">
                      <div className="font-semibold text-sm text-white">
                        {properties.point_count} Communities
                      </div>
                      <div className="text-xs text-blue-200">
                        Click to expand
                      </div>
                    </div>
                  </Tooltip>
                )}
              </Marker>
            );
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
              key={`community-${properties.id}-${lat}-${lng}-${index}`}
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

              {/* Enhanced popup with better design */}
              <Popup 
                className="community-popup enhanced-popup" 
                closeButton={true} 
                autoPan={true} 
                autoClose={false}
                maxWidth={400}
              >
                <div className="w-full max-w-sm p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-lg leading-tight text-gray-900 pr-2">
                      {community.name}
                    </h3>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="flex-shrink-0 hover:bg-gray-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        const newFavorites = new Set(favorites);
                        if (favorites.has(community.id)) {
                          newFavorites.delete(community.id);
                        } else {
                          newFavorites.add(community.id);
                        }
                        setFavorites(newFavorites);
                      }}
                    >
                      <Heart className={`w-4 h-4 ${favorites.has(community.id) ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-400'}`} />
                    </Button>
                  </div>

                  {/* Enhanced data quality indicator */}
                  <div className="mb-3">
                    {(community.hudPropertyId || community.dataSource === 'HUD' || community.hudVerified || (community.rentPerMonth && community.rentPerMonth > 0)) ? (
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-sm">
                        ✓ Government Verified Data
                      </Badge>
                    ) : (
                      <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-sm">
                        ⚠ Call for Current Pricing
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3 text-sm text-gray-700">
                      <MapPin className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="leading-relaxed">
                        {community.address}, {community.city}, {community.state}
                        {community.zipCode && ` ${community.zipCode}`}
                      </span>
                    </div>

                    {community.phone && (
                      <div className="flex items-center gap-3 text-sm text-gray-700">
                        <Phone className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <a href={`tel:${community.phone}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                          {community.phone}
                        </a>
                      </div>
                    )}

                    {community.website && (
                      <div className="flex items-center gap-3 text-sm text-gray-700">
                        <Globe className="w-4 h-4 text-purple-500 flex-shrink-0" />
                        <a href={community.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">
                          Visit Website
                        </a>
                      </div>
                    )}

                    {community.rating > 0 && (
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-medium">{community.rating}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          ({community.reviewCount} reviews)
                        </span>
                      </div>
                    )}

                    {community.careTypes.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {community.careTypes.slice(0, 3).map((type) => (
                          <Badge key={type} variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            {type}
                          </Badge>
                        ))}
                        {community.careTypes.length > 3 && (
                          <Badge variant="secondary" className="text-xs bg-gray-50 text-gray-600">
                            +{community.careTypes.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-lg font-bold text-green-600">
                          {formatPrice(community.priceRange)}
                        </p>
                        {community.hudPropertyId && (
                          <Badge className="bg-blue-100 text-blue-800 text-xs">
                            HUD ID: {community.hudPropertyId}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-600">
                        {community.availability}
                      </p>
                    </div>

                    <Button 
                      className="w-full mt-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCommunityClick(community);
                      }}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Full Details
                    </Button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        }) || []}

        {/* Hospital markers - show alongside communities */}
        {!isLoading && hospitalsData?.hospitals && currentZoom >= 8 && hospitalsData.hospitals.map((hospital: any, index: number) => {
          const isHovered = hoveredCommunity === `hospital-${hospital.id}`;
          
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
                mouseover: () => setHoveredCommunity(`hospital-${hospital.id}`),
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

      {/* Minimal Map Stats Overlay - Moved to bottom-left corner to avoid blocking controls */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg p-2 z-10 shadow-sm">
        <p className="text-xs text-gray-600 font-medium">
          {clusterData?.clusters?.filter((f: any) => !f.properties?.cluster).length || 0} communities
        </p>
      </div>
    </div>
  );
}
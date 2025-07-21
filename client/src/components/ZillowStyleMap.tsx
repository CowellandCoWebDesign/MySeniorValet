import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, CircleMarker, useMap, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Icon, LatLngBounds, LatLng } from 'leaflet';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Heart, MapPin, X, ChevronUp, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom cluster icon without numbers - Zillow style
const createClusterCustomIcon = function (cluster: any) {
  const count = cluster.getChildCount();
  let size = 'small';
  let className = 'marker-cluster-';
  
  // Determine cluster size based on count
  if (count < 10) {
    className += 'small';
    size = 'small';
  } else if (count < 50) {
    className += 'medium';
    size = 'medium';
  } else {
    className += 'large';
    size = 'large';
  }

  // Check if any featured communities in cluster
  const hasFeatured = cluster.getAllChildMarkers().some((marker: any) => 
    marker.options.community?.isFeatured
  );

  return L.divIcon({
    html: `<div class="zillow-cluster ${size} ${hasFeatured ? 'has-featured' : ''}">
      <div class="cluster-inner"></div>
      ${hasFeatured ? '<div class="featured-dot"></div>' : ''}
    </div>`,
    className: 'custom-cluster-icon',
    iconSize: L.point(40, 40, true)
  });
};

// Community marker icon
const createCommunityIcon = (community: any) => {
  const isFeatured = community.isFeatured || community.availability === 'Available Now';
  
  return L.divIcon({
    html: `<div class="zillow-marker ${isFeatured ? 'featured' : ''}">
      <div class="marker-dot"></div>
    </div>`,
    className: 'custom-marker-icon',
    iconSize: L.point(20, 20, true)
  });
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
  isFeatured?: boolean;
}

interface ZillowStyleMapProps {
  searchFilters?: any;
  onCommunityClick?: (community: Community) => void;
  height?: string;
  center?: [number, number];
  zoom?: number;
}

// Photo carousel component for cards
const PhotoCarousel: React.FC<{ photos: string[]; name: string }> = ({ photos, name }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const validPhotos = photos?.filter(p => p) || [];

  if (validPhotos.length === 0) {
    return (
      <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
        <MapPin className="h-8 w-8 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-48 overflow-hidden group">
      <img 
        src={validPhotos[currentIndex]} 
        alt={name}
        className="w-full h-full object-cover"
      />
      
      {validPhotos.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev - 1 + validPhotos.length) % validPhotos.length);
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev + 1) % validPhotos.length);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {validPhotos.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-colors",
                  idx === currentIndex ? "bg-white" : "bg-white/50"
                )}
              />
            ))}
          </div>
        </>
      )}
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          // TODO: Add to favorites
        }}
        className="absolute top-2 right-2 p-1.5 bg-white/80 dark:bg-black/80 rounded-full hover:bg-white dark:hover:bg-black transition-colors"
      >
        <Heart className="h-4 w-4" />
      </button>
    </div>
  );
};

// Community card component
const CommunityCard: React.FC<{ 
  community: Community; 
  onClick: () => void;
  isDarkMode: boolean;
}> = ({ community, onClick, isDarkMode }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
    >
      <PhotoCarousel photos={community.photos} name={community.name} />
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{community.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{community.city}, {community.state}</p>
        
        <div className="flex items-center justify-between mb-3">
          <div className="text-xl font-bold text-primary">
            {community.priceRange || 'Contact for pricing'}
          </div>
          {community.rating > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-yellow-500">★</span>
              <span className="text-sm font-medium">{community.rating.toFixed(1)}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">({community.reviewCount})</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {community.careTypes.slice(0, 2).map((type, idx) => (
            <Badge 
              key={idx} 
              variant="secondary" 
              className="text-xs"
            >
              {type}
            </Badge>
          ))}
          {community.careTypes.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{community.careTypes.length - 2}
            </Badge>
          )}
        </div>
        
        {community.availability === 'Available Now' && (
          <Badge className="w-full justify-center" variant="default">
            Available Now
          </Badge>
        )}
      </div>
    </div>
  );
};

// Map controls component
const MapControls: React.FC<{ map: any }> = ({ map }) => {
  useMapEvents({
    moveend: () => {
      console.log('Map moved');
    },
    zoomend: () => {
      console.log('Map zoomed to:', map.getZoom());
    }
  });

  return null;
};

export default function ZillowStyleMap({ 
  searchFilters,
  onCommunityClick,
  height = "100vh",
  center = [37.7749, -122.4194],
  zoom = 12
}: ZillowStyleMapProps) {
  const [map, setMap] = useState<any>(null);
  const [showList, setShowList] = useState(false);
  const [listHeight, setListHeight] = useState(40); // percentage
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mapBounds, setMapBounds] = useState<LatLngBounds | null>(null);

  // Check dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  // Fetch communities based on map bounds
  const { data: communities = [], isLoading } = useQuery({
    queryKey: ['/api/communities/map', mapBounds?.toBBoxString()],
    queryFn: async () => {
      if (!mapBounds) return [];
      
      const bounds = {
        west: mapBounds.getWest(),
        east: mapBounds.getEast(),
        south: mapBounds.getSouth(),
        north: mapBounds.getNorth()
      };
      
      const params = new URLSearchParams({
        west: bounds.west.toString(),
        east: bounds.east.toString(),
        south: bounds.south.toString(),
        north: bounds.north.toString()
      });
      
      const response = await fetch(`/api/communities/map?${params}`);
      if (!response.ok) throw new Error('Failed to fetch communities');
      return response.json();
    },
    enabled: !!mapBounds,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle map ready
  const handleMapReady = useCallback((mapInstance: any) => {
    setMap(mapInstance);
    setMapBounds(mapInstance.getBounds());
    
    // Update bounds on map move
    mapInstance.on('moveend', () => {
      setMapBounds(mapInstance.getBounds());
    });
  }, []);

  return (
    <div className="relative w-full" style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        className="w-full h-full"
        zoomControl={false}
        ref={setMap}
      >
        <TileLayer
          url={isDarkMode 
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          }
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={createClusterCustomIcon}
          maxClusterRadius={80}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
          zoomToBoundsOnClick={true}
          animate={true}
        >
          {communities.map((community: Community) => (
            <Marker
              key={community.id}
              position={[community.latitude, community.longitude]}
              icon={createCommunityIcon(community)}
              eventHandlers={{
                click: () => onCommunityClick?.(community)
              }}
              community={community}
            />
          ))}
        </MarkerClusterGroup>
        
        <MapControls map={map} />
      </MapContainer>
      
      {/* Bottom toolbar */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 transition-all duration-300",
        showList ? `h-[${listHeight}%]` : "h-16"
      )}>
        {/* Toolbar handle */}
        <button
          onClick={() => setShowList(!showList)}
          className="absolute -top-5 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 rounded-t-lg px-4 py-1 border border-b-0 border-gray-200 dark:border-gray-700"
        >
          {showList ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </button>
        
        {/* Toolbar content */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <h3 className="font-semibold">{communities.length} Communities</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {isLoading ? 'Loading...' : 'In current view'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setListHeight(listHeight === 40 ? 70 : 40)}
              disabled={!showList}
            >
              {listHeight === 40 ? 'Expand' : 'Collapse'}
            </Button>
          </div>
        </div>
        
        {/* Community list */}
        {showList && (
          <div className="overflow-y-auto" style={{ height: `calc(100% - 4rem)` }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
              {communities.map((community: Community) => (
                <CommunityCard
                  key={community.id}
                  community={community}
                  onClick={() => onCommunityClick?.(community)}
                  isDarkMode={isDarkMode}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      
      <style jsx global>{`
        /* Zillow-style cluster dots */
        .zillow-cluster {
          position: relative;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .zillow-cluster.small .cluster-inner {
          width: 24px;
          height: 24px;
          background: #3b82f6;
        }
        
        .zillow-cluster.medium .cluster-inner {
          width: 32px;
          height: 32px;
          background: #2563eb;
        }
        
        .zillow-cluster.large .cluster-inner {
          width: 40px;
          height: 40px;
          background: #1d4ed8;
        }
        
        .cluster-inner {
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .zillow-cluster.has-featured .featured-dot {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 12px;
          height: 12px;
          background: #f59e0b;
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        /* Individual community markers */
        .zillow-marker {
          position: relative;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .zillow-marker .marker-dot {
          width: 12px;
          height: 12px;
          background: #3b82f6;
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .zillow-marker.featured .marker-dot {
          width: 16px;
          height: 16px;
          background: #f59e0b;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(245, 158, 11, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(245, 158, 11, 0);
          }
        }
        
        /* Remove default cluster numbers */
        .marker-cluster div {
          display: none !important;
        }
        
        /* Dark mode adjustments */
        .dark .cluster-inner {
          border-color: #374151;
        }
        
        .dark .zillow-cluster.has-featured .featured-dot {
          border-color: #374151;
        }
        
        .dark .zillow-marker .marker-dot {
          border-color: #374151;
        }
      `}</style>
    </div>
  );
}
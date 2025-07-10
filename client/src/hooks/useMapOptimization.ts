import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Community } from '@shared/schema';
import L from 'leaflet';

interface MapOptimizationConfig {
  enableClustering?: boolean;
  maxMarkersBeforeClustering?: number;
  boundsChangeDebounce?: number;
  enableVirtualization?: boolean;
}

interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface UseMapOptimizationReturn {
  visibleCommunities: Community[];
  mapBounds: MapBounds | null;
  isLoading: boolean;
  shouldCluster: boolean;
  handleBoundsChange: (bounds: L.LatLngBounds) => void;
  resetBounds: () => void;
}

export function useMapOptimization(
  communities: Community[],
  config: MapOptimizationConfig = {}
): UseMapOptimizationReturn {
  const {
    enableClustering = true,
    maxMarkersBeforeClustering = 100,
    boundsChangeDebounce = 300,
    enableVirtualization = true
  } = config;

  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Memoize valid communities to prevent unnecessary recalculations
  const validCommunities = useMemo(() => 
    communities.filter(c => 
      c.latitude && 
      c.longitude && 
      !isNaN(parseFloat(c.latitude)) && 
      !isNaN(parseFloat(c.longitude))
    ),
    [communities]
  );

  // Determine if clustering should be enabled
  const shouldCluster = useMemo(() => 
    enableClustering && validCommunities.length > maxMarkersBeforeClustering,
    [enableClustering, validCommunities.length, maxMarkersBeforeClustering]
  );

  // Calculate visible communities based on map bounds
  const visibleCommunities = useMemo(() => {
    if (!enableVirtualization || !mapBounds) {
      return validCommunities;
    }

    // Filter communities within current map bounds for performance
    return validCommunities.filter(community => {
      const lat = parseFloat(community.latitude!);
      const lng = parseFloat(community.longitude!);
      
      return lat >= mapBounds.south && 
             lat <= mapBounds.north && 
             lng >= mapBounds.west && 
             lng <= mapBounds.east;
    });
  }, [validCommunities, mapBounds, enableVirtualization]);

  // Debounced bounds change handler
  const handleBoundsChange = useCallback((bounds: L.LatLngBounds) => {
    setIsLoading(true);
    
    const timeoutId = setTimeout(() => {
      const newBounds: MapBounds = {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest()
      };
      
      setMapBounds(newBounds);
      setIsLoading(false);
    }, boundsChangeDebounce);

    return () => clearTimeout(timeoutId);
  }, [boundsChangeDebounce]);

  // Reset bounds to show all communities
  const resetBounds = useCallback(() => {
    setMapBounds(null);
  }, []);

  // Performance metrics logging in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Map Optimization Stats:`, {
        totalCommunities: validCommunities.length,
        visibleCommunities: visibleCommunities.length,
        shouldCluster,
        hasBounds: !!mapBounds,
        enableVirtualization
      });
    }
  }, [validCommunities.length, visibleCommunities.length, shouldCluster, mapBounds, enableVirtualization]);

  return {
    visibleCommunities,
    mapBounds,
    isLoading,
    shouldCluster,
    handleBoundsChange,
    resetBounds
  };
}

// Utility function for calculating optimal zoom level based on community spread
export function calculateOptimalZoom(communities: Community[]): number {
  if (communities.length === 0) return 5;
  if (communities.length === 1) return 12;

  const validCommunities = communities.filter(c => c.latitude && c.longitude);
  if (validCommunities.length === 0) return 5;

  const latitudes = validCommunities.map(c => parseFloat(c.latitude!));
  const longitudes = validCommunities.map(c => parseFloat(c.longitude!));

  const latRange = Math.max(...latitudes) - Math.min(...latitudes);
  const lngRange = Math.max(...longitudes) - Math.min(...longitudes);
  const maxRange = Math.max(latRange, lngRange);

  // Calculate zoom based on coordinate spread
  if (maxRange > 20) return 4;      // Multi-state view
  if (maxRange > 10) return 5;      // State view
  if (maxRange > 5) return 6;       // Large region
  if (maxRange > 2) return 7;       // Medium region
  if (maxRange > 1) return 8;       // Small region
  if (maxRange > 0.5) return 9;     // City area
  if (maxRange > 0.1) return 10;    // Neighborhood
  return 12;                        // Local area
}

// Utility function for intelligent map centering
export function calculateMapCenter(communities: Community[]): [number, number] {
  const validCommunities = communities.filter(c => c.latitude && c.longitude);
  
  if (validCommunities.length === 0) {
    // Default to TrueView's primary coverage area (California)
    return [36.7783, -119.4179];
  }

  if (validCommunities.length === 1) {
    const community = validCommunities[0];
    return [parseFloat(community.latitude!), parseFloat(community.longitude!)];
  }

  // Calculate centroid of all communities
  const latSum = validCommunities.reduce((sum, c) => sum + parseFloat(c.latitude!), 0);
  const lngSum = validCommunities.reduce((sum, c) => sum + parseFloat(c.longitude!), 0);

  return [
    latSum / validCommunities.length,
    lngSum / validCommunities.length
  ];
}

// State-based intelligent defaults for our multi-state coverage
export const STATE_MAP_DEFAULTS = {
  CA: { center: [36.7783, -119.4179] as [number, number], zoom: 6 },
  TX: { center: [31.9686, -99.9018] as [number, number], zoom: 6 },
  AZ: { center: [34.0489, -111.0937] as [number, number], zoom: 7 },
  HI: { center: [19.8968, -155.5828] as [number, number], zoom: 7 },
  MULTI_STATE: { center: [36.7783, -119.4179] as [number, number], zoom: 5 }
} as const;
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, Info, TrendingUp, AlertCircle, MapPin } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { AvailabilityHeatmapData, HeatmapRegion } from "@shared/schema";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Map event handler component
function MapUpdater({ onBoundsChange }: { onBoundsChange: (bounds: any, zoom: number) => void }) {
  const map = useMapEvents({
    moveend: () => {
      const bounds = map.getBounds();
      const zoom = map.getZoom();
      onBoundsChange({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest()
      }, zoom);
    },
    zoomend: () => {
      const bounds = map.getBounds();
      const zoom = map.getZoom();
      onBoundsChange({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest()
      }, zoom);
    }
  });
  return null;
}

interface AvailabilityHeatmapProps {
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  zoom?: number;
  onDataPointClick?: (dataPoint: AvailabilityHeatmapData) => void;
  showTrends?: boolean;
  className?: string;
}

export function AvailabilityHeatmap({
  bounds: initialBounds = { north: 49.0, south: 25.0, east: -66.0, west: -125.0 }, // Default to USA
  zoom: initialZoom = 5,
  onDataPointClick,
  showTrends = true,
  className = ""
}: AvailabilityHeatmapProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedDataPoint, setSelectedDataPoint] = useState<AvailabilityHeatmapData | null>(null);
  const [mapBounds, setMapBounds] = useState(initialBounds);
  const [mapZoom, setMapZoom] = useState(initialZoom);
  const mapRef = useRef<L.Map | null>(null);
  const boundsUpdateTimeout = useRef<NodeJS.Timeout | null>(null);

  // Handle map bounds change with debouncing
  const handleBoundsChange = useCallback((newBounds: any, newZoom: number) => {
    // Clear existing timeout
    if (boundsUpdateTimeout.current) {
      clearTimeout(boundsUpdateTimeout.current);
    }
    
    // Set new timeout to update bounds after user stops panning
    boundsUpdateTimeout.current = setTimeout(() => {
      setMapBounds(newBounds);
      setMapZoom(newZoom);
    }, 500); // Wait 500ms after user stops panning
  }, []);

  // Fetch heatmap data
  const { data: heatmapData, isLoading: heatmapLoading, error: heatmapError, refetch: refetchHeatmap } = useQuery({
    queryKey: ['heatmap', 'availability', mapBounds, mapZoom, refreshKey],
    queryFn: async () => {
      const params = new URLSearchParams({
        north: mapBounds.north.toString(),
        south: mapBounds.south.toString(),
        east: mapBounds.east.toString(),
        west: mapBounds.west.toString(),
        zoom: mapZoom.toString()
      });
      
      const response = await fetch(`/api/heatmap/availability?${params}`);
      if (!response.ok) throw new Error('Failed to fetch heatmap data');
      return response.json() as Promise<{
        success: boolean;
        region: HeatmapRegion;
        dataPoints: number;
        lastUpdated: string;
      }>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!(mapBounds.north && mapBounds.south && mapBounds.east && mapBounds.west)
  });

  // Fetch availability trends
  const { data: trendsData, isLoading: trendsLoading } = useQuery({
    queryKey: ['heatmap', 'trends', refreshKey],
    queryFn: async () => {
      const response = await fetch('/api/heatmap/trends');
      if (!response.ok) throw new Error('Failed to fetch trends data');
      return response.json() as Promise<{
        success: boolean;
        trends: {
          totalCommunities: number;
          availableNow: number;
          limitedAvailability: number;
          waitlistOnly: number;
          noAvailability: number;
          lastUpdated: string;
        };
      }>;
    },
    enabled: showTrends,
    staleTime: 5 * 60 * 1000
  });

  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
    refetchHeatmap();
  }, [refetchHeatmap]);

  const getAvailabilityColor = (score: number): string => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    if (score >= 20) return 'bg-red-500';
    return 'bg-gray-400';
  };

  const getAvailabilityLabel = (score: number): string => {
    if (score >= 80) return 'High Availability';
    if (score >= 60) return 'Moderate Availability';
    if (score >= 40) return 'Limited Availability';
    if (score >= 20) return 'Low Availability';
    return 'No Data';
  };

  const handleDataPointClick = (dataPoint: AvailabilityHeatmapData) => {
    setSelectedDataPoint(dataPoint);
    onDataPointClick?.(dataPoint);
  };

  if (heatmapError) {
    return (
      <Card className={`border-red-200 ${className}`}>
        <CardContent className="p-6 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <p className="text-red-600 mb-4">Failed to load heatmap data</p>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Availability Trends */}
      {showTrends && trendsData?.success && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Real-time Availability Overview
              </CardTitle>
              <Button onClick={handleRefresh} variant="outline" size="sm" disabled={trendsLoading}>
                {trendsLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {trendsData.trends.totalCommunities.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Communities</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {trendsData.trends.availableNow.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Available Now</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {trendsData.trends.limitedAvailability.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Limited</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {trendsData.trends.waitlistOnly.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Waitlist</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {trendsData.trends.noAvailability.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">None</div>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
              Last updated: {new Date(trendsData.trends.lastUpdated).toLocaleTimeString()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interactive Map with Heatmap */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Live Availability Heatmap
            </CardTitle>
            <div className="flex items-center gap-2">
              {heatmapData?.success && (
                <Badge variant="outline">
                  {heatmapData.dataPoints} regions
                </Badge>
              )}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-gray-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Pan and zoom to explore availability by region</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative h-[600px] w-full rounded-b-lg overflow-hidden">
            {heatmapLoading && (
              <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 z-[1000] flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="text-gray-600 dark:text-gray-400">Loading map data...</span>
                </div>
              </div>
            )}
            
            <MapContainer
              center={[39.8283, -98.5795]} // Center of USA
              zoom={mapZoom}
              className="h-full w-full"
              ref={(map) => { if (map) mapRef.current = map; }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              <MapUpdater onBoundsChange={handleBoundsChange} />
              
              {/* Render heatmap data points */}
              {heatmapData?.success && heatmapData.region.data.map((dataPoint, index) => {
                const color = dataPoint.availabilityScore >= 80 ? '#10b981' : // green
                             dataPoint.availabilityScore >= 60 ? '#eab308' : // yellow
                             dataPoint.availabilityScore >= 40 ? '#f97316' : // orange
                             dataPoint.availabilityScore >= 20 ? '#ef4444' : // red
                             '#6b7280'; // gray
                
                const radius = Math.max(5, Math.min(30, dataPoint.communityCount * 2));
                
                return (
                  <CircleMarker
                    key={index}
                    center={[dataPoint.latitude, dataPoint.longitude]}
                    radius={radius}
                    pathOptions={{
                      fillColor: color,
                      color: color,
                      weight: 2,
                      opacity: 0.7,
                      fillOpacity: 0.4 + (dataPoint.availabilityScore / 200)
                    }}
                    eventHandlers={{
                      click: () => handleDataPointClick(dataPoint),
                    }}
                  >
                    <Popup>
                      <div className="p-2 min-w-[200px]">
                        <h3 className="font-semibold text-sm mb-2">{dataPoint.regionName}</h3>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Availability Score:</span>
                            <span className="font-medium">{dataPoint.availabilityScore}/100</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Communities:</span>
                            <span className="font-medium">{dataPoint.communityCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Avg Availability:</span>
                            <span className="font-medium">{dataPoint.averageAvailability}%</span>
                          </div>
                          <div className="pt-1 mt-1 border-t text-gray-500">
                            Coordinates: {dataPoint.latitude.toFixed(3)}, {dataPoint.longitude.toFixed(3)}
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>
          
          {/* Legend */}
          {heatmapData?.success && heatmapData.region.data.length > 0 && (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-green-500 rounded" />
                  <span>High (80-100)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-yellow-500 rounded" />
                  <span>Moderate (60-79)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-orange-500 rounded" />
                  <span>Limited (40-59)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-red-500 rounded" />
                  <span>Low (20-39)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-gray-400 rounded" />
                  <span>No Data (0-19)</span>
                </div>
              </div>

              {/* Selected Data Point Details */}
              {selectedDataPoint && (
                <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="font-semibold text-blue-900 dark:text-blue-100">Region</div>
                        <div>{selectedDataPoint.regionName}</div>
                      </div>
                      <div>
                        <div className="font-semibold text-blue-900 dark:text-blue-100">Availability Score</div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{selectedDataPoint.availabilityScore}/100</span>
                          <Badge variant={selectedDataPoint.availabilityScore >= 60 ? "default" : "destructive"}>
                            {getAvailabilityLabel(selectedDataPoint.availabilityScore)}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold text-blue-900 dark:text-blue-100">Communities</div>
                        <div>{selectedDataPoint.communityCount}</div>
                      </div>
                      <div>
                        <div className="font-semibold text-blue-900 dark:text-blue-100">Avg Availability</div>
                        <div>{selectedDataPoint.averageAvailability}%</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Last updated: {new Date(heatmapData.lastUpdated).toLocaleTimeString()}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
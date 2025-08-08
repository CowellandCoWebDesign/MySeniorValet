import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, Info, TrendingUp, AlertCircle, MapPin, Filter, ZoomIn, Download, ChevronRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  
  // Force California bounds on initial mount
  useEffect(() => {
    const californiaBounds = L.latLngBounds(
      [32.5, -124.5], // Southwest corner
      [42, -114]      // Northeast corner
    );
    map.fitBounds(californiaBounds);
  }, [map]);
  
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

// Care type options for filtering
const CARE_TYPES = [
  { value: 'all', label: 'All Care Types' },
  { value: 'assisted_living', label: 'Assisted Living' },
  { value: 'memory_care', label: 'Memory Care' },
  { value: 'independent_living', label: 'Independent Living' },
  { value: 'skilled_nursing', label: 'Skilled Nursing' },
  { value: 'continuing_care', label: 'Continuing Care' },
  { value: '55_plus', label: '55+ Active Adult' },
  { value: 'mobile_home', label: 'Mobile Home Parks' }
];

export function AvailabilityHeatmap({
  bounds: initialBounds = { north: 42.0, south: 32.5, east: -114.0, west: -124.5 }, // Default to California
  zoom: initialZoom = 4, // Zoom level 4 to show entire California state
  onDataPointClick,
  showTrends = true,
  className = ""
}: AvailabilityHeatmapProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedDataPoint, setSelectedDataPoint] = useState<AvailabilityHeatmapData | null>(null);
  const [mapBounds, setMapBounds] = useState(initialBounds);
  const [mapZoom, setMapZoom] = useState(initialZoom);
  const [careTypeFilter, setCareTypeFilter] = useState('all');
  const [showHeatGradient, setShowHeatGradient] = useState(false);
  const [showTopRegions, setShowTopRegions] = useState(true);
  const [mapInitialized, setMapInitialized] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const boundsUpdateTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Ensure map is initialized and data loads on mount
  useEffect(() => {
    // Small delay to ensure map is fully initialized
    const timer = setTimeout(() => {
      setMapInitialized(true);
      setRefreshKey(prev => prev + 1);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

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

  // Fetch heatmap data with care type filter
  const { data: heatmapData, isLoading: heatmapLoading, error: heatmapError, refetch: refetchHeatmap } = useQuery({
    queryKey: ['heatmap', 'availability', mapBounds, mapZoom, refreshKey, careTypeFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        north: mapBounds.north.toString(),
        south: mapBounds.south.toString(),
        east: mapBounds.east.toString(),
        west: mapBounds.west.toString(),
        zoom: mapZoom.toString()
      });
      
      // Add care type filter if not 'all'
      if (careTypeFilter !== 'all') {
        params.set('careType', careTypeFilter);
      }
      
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
    enabled: true, // Always enabled to ensure immediate load
    refetchOnMount: true // Force refetch on mount
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
    
    // Zoom in to the selected region
    if (mapRef.current) {
      mapRef.current.setView([dataPoint.latitude, dataPoint.longitude], 10, {
        animate: true,
        duration: 1
      });
    }
  };

  // Export heatmap data as CSV
  const exportData = () => {
    if (!heatmapData?.region?.data) return;
    
    const csv = [
      ['Latitude', 'Longitude', 'Availability Score', 'Community Count', 'Region Name', 'Average Availability'],
      ...heatmapData.region.data.map((d: AvailabilityHeatmapData) => [
        d.latitude,
        d.longitude,
        d.availabilityScore,
        d.communityCount,
        d.regionName,
        d.averageAvailability
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `availability-heatmap-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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

  // Get top regions sorted by availability score
  const topRegions = heatmapData?.region?.data
    ?.sort((a, b) => b.availabilityScore - a.availabilityScore)
    ?.slice(0, 10) || [];

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-4 gap-6 ${className}`}>
      {/* Main Content Area */}
      <div className="lg:col-span-3 space-y-6">
        {/* Control Panel */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Map Controls</CardTitle>
              <div className="flex items-center gap-2">
                <Button onClick={exportData} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Export CSV
                </Button>
                <Button onClick={handleRefresh} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <Label className="text-sm mb-1">Care Type Filter</Label>
                <Select value={careTypeFilter} onValueChange={setCareTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select care type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CARE_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={showHeatGradient} 
                  onCheckedChange={setShowHeatGradient}
                  id="heat-gradient"
                />
                <Label htmlFor="heat-gradient" className="text-sm">Heat Gradient</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={showTopRegions} 
                  onCheckedChange={setShowTopRegions}
                  id="show-regions"
                />
                <Label htmlFor="show-regions" className="text-sm">Top Regions</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Availability Trends */}
        {showTrends && trendsData?.success && (
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Real-time Availability Overview
                </CardTitle>
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
              center={[37.3, -119.5]} // Center point for viewing all of California
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

      {/* Side Panel - Top Regions */}
      {showTopRegions && (
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Top Availability Regions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {topRegions.map((region, index) => (
                    <div
                      key={`${region.latitude}-${region.longitude}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                      onClick={() => handleDataPointClick(region)}
                    >
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                          index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                          index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                          index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                          'bg-gray-400'
                        }`}>
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{region.regionName}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {region.communityCount} communities
                          </Badge>
                          <Badge 
                            variant={region.availabilityScore >= 60 ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {region.availabilityScore}% available
                          </Badge>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
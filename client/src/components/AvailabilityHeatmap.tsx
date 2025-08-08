import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, Info, TrendingUp, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { AvailabilityHeatmapData, HeatmapRegion } from "@shared/schema";

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
  bounds = { north: 40.7589, south: 40.7489, east: -73.9841, west: -73.9941 }, // Default to NYC area
  zoom = 10,
  onDataPointClick,
  showTrends = true,
  className = ""
}: AvailabilityHeatmapProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedDataPoint, setSelectedDataPoint] = useState<AvailabilityHeatmapData | null>(null);

  // Fetch heatmap data
  const { data: heatmapData, isLoading: heatmapLoading, error: heatmapError, refetch: refetchHeatmap } = useQuery({
    queryKey: ['heatmap', 'availability', bounds, zoom, refreshKey],
    queryFn: async () => {
      const params = new URLSearchParams({
        north: bounds.north.toString(),
        south: bounds.south.toString(),
        east: bounds.east.toString(),
        west: bounds.west.toString(),
        zoom: zoom.toString()
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
    enabled: !!(bounds.north && bounds.south && bounds.east && bounds.west)
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

      {/* Heatmap Visualization */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Availability Heatmap
            </CardTitle>
            <div className="flex items-center gap-2">
              {heatmapData?.success && (
                <Badge variant="outline">
                  {heatmapData.dataPoints} points
                </Badge>
              )}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-gray-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Color intensity shows availability density in each region</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {heatmapLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading heatmap data...</span>
            </div>
          ) : heatmapData?.success && heatmapData.region.data.length > 0 ? (
            <div className="space-y-4">
              {/* Heatmap Grid */}
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-96 overflow-y-auto">
                {heatmapData.region.data.map((dataPoint, index) => (
                  <TooltipProvider key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`
                            aspect-square rounded cursor-pointer transition-all duration-200 
                            hover:scale-110 hover:shadow-lg border-2 border-transparent
                            ${getAvailabilityColor(dataPoint.availabilityScore)}
                            ${selectedDataPoint === dataPoint ? 'border-blue-500 scale-110' : ''}
                          `}
                          style={{
                            opacity: Math.max(0.3, dataPoint.availabilityScore / 100)
                          }}
                          onClick={() => handleDataPointClick(dataPoint)}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1">
                          <div className="font-semibold">{dataPoint.regionName}</div>
                          <div>Score: {dataPoint.availabilityScore}/100</div>
                          <div>Communities: {dataPoint.communityCount}</div>
                          <div>Avg Availability: {dataPoint.averageAvailability}%</div>
                          <div className="text-xs text-gray-500">
                            {dataPoint.latitude.toFixed(3)}, {dataPoint.longitude.toFixed(3)}
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>

              {/* Legend */}
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
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <div className="text-lg mb-2">No availability data found</div>
              <div className="text-sm">Try adjusting the geographic bounds or zoom level</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
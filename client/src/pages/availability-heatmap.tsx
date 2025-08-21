import React, { useState } from 'react';
import { AvailabilityHeatmap } from "@/components/AvailabilityHeatmap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Settings, Activity } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import type { AvailabilityHeatmapData } from "@shared/schema";
import { Header } from "@/components/header";

export default function AvailabilityHeatmapPage() {
  const [customBounds, setCustomBounds] = useState({
    north: 40.7589,
    south: 40.7489,
    east: -73.9841,
    west: -73.9941
  });
  const [zoomLevel, setZoomLevel] = useState(10);
  const [useCustomBounds, setUseCustomBounds] = useState(false);
  const [selectedDataPoint, setSelectedDataPoint] = useState<AvailabilityHeatmapData | null>(null);

  // Predefined regions for quick testing
  const predefinedRegions = [
    {
      name: "New York City",
      bounds: { north: 40.7589, south: 40.7489, east: -73.9841, west: -73.9941 }
    },
    {
      name: "Los Angeles",
      bounds: { north: 34.0522, south: 34.0422, east: -118.2437, west: -118.2537 }
    },
    {
      name: "Chicago",
      bounds: { north: 41.8781, south: 41.8681, east: -87.6298, west: -87.6398 }
    },
    {
      name: "Florida (Large Area)",
      bounds: { north: 30.0, south: 25.0, east: -80.0, west: -85.0 }
    },
    {
      name: "Texas (Large Area)",
      bounds: { north: 33.0, south: 28.0, east: -94.0, west: -99.0 }
    }
  ];

  // Get heatmap status
  const { data: statusData } = useQuery({
    queryKey: ['heatmap', 'status'],
    queryFn: async () => {
      const response = await fetch('/api/heatmap/status');
      if (!response.ok) throw new Error('Failed to fetch status');
      return response.json();
    },
    staleTime: 30 * 1000
  });

  const handleRegionSelect = (region: typeof predefinedRegions[0]) => {
    setCustomBounds(region.bounds);
    setUseCustomBounds(true);
  };

  const handleDataPointClick = (dataPoint: AvailabilityHeatmapData) => {
    setSelectedDataPoint(dataPoint);
  };

  const currentBounds = useCustomBounds ? customBounds : predefinedRegions[0].bounds;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <div className="p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 flex items-center justify-center gap-3">
            <Activity className="h-8 w-8 text-blue-600" />
            Real-time Community Availability Heatmap
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Visualize senior living community availability across geographic regions in real-time. 
            Color intensity and patterns show availability density and trends.
          </p>
        </div>

        {/* Status Overview */}
        {statusData?.success && (
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100">Service Status</div>
                  <div className={`capitalize ${statusData.status === 'operational' ? 'text-green-600' : 'text-red-600'}`}>
                    {statusData.status}
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100">Total Communities</div>
                  <div>{statusData.metrics?.totalCommunities?.toLocaleString() || 'N/A'}</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100">Cache Duration</div>
                  <div>{statusData.serviceInfo?.cacheDuration || 'N/A'}</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100">Max Area Size</div>
                  <div>{statusData.serviceInfo?.maxAreaSize || 'N/A'}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Controls */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Region Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Predefined Regions */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Quick Select Regions</Label>
              <div className="flex flex-wrap gap-2">
                {predefinedRegions.map((region) => (
                  <Button
                    key={region.name}
                    onClick={() => handleRegionSelect(region)}
                    variant={JSON.stringify(currentBounds) === JSON.stringify(region.bounds) ? "default" : "outline"}
                    size="sm"
                  >
                    {region.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Bounds */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="north" className="text-sm">North</Label>
                <Input
                  id="north"
                  type="number"
                  step="0.001"
                  value={customBounds.north}
                  onChange={(e) => setCustomBounds(prev => ({ ...prev, north: Number(e.target.value) }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="south" className="text-sm">South</Label>
                <Input
                  id="south"
                  type="number"
                  step="0.001"
                  value={customBounds.south}
                  onChange={(e) => setCustomBounds(prev => ({ ...prev, south: Number(e.target.value) }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="east" className="text-sm">East</Label>
                <Input
                  id="east"
                  type="number"
                  step="0.001"
                  value={customBounds.east}
                  onChange={(e) => setCustomBounds(prev => ({ ...prev, east: Number(e.target.value) }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="west" className="text-sm">West</Label>
                <Input
                  id="west"
                  type="number"
                  step="0.001"
                  value={customBounds.west}
                  onChange={(e) => setCustomBounds(prev => ({ ...prev, west: Number(e.target.value) }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="zoom" className="text-sm">Zoom Level</Label>
                <Input
                  id="zoom"
                  type="number"
                  min="1"
                  max="15"
                  value={zoomLevel}
                  onChange={(e) => setZoomLevel(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
            </div>

            <Button
              onClick={() => setUseCustomBounds(true)}
              className="w-full"
            >
              Apply Custom Bounds
            </Button>
          </CardContent>
        </Card>

        {/* Heatmap Component */}
        <AvailabilityHeatmap
          bounds={currentBounds}
          zoom={zoomLevel}
          onDataPointClick={handleDataPointClick}
          showTrends={true}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-lg rounded-lg"
        />

        {/* Usage Instructions */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-lg">
          <CardHeader>
            <CardTitle>How to Use the Availability Heatmap</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Understanding the Colors</h4>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• <span className="text-green-600">Green</span>: High availability (80-100 score)</li>
                  <li>• <span className="text-yellow-600">Yellow</span>: Moderate availability (60-79 score)</li>
                  <li>• <span className="text-orange-600">Orange</span>: Limited availability (40-59 score)</li>
                  <li>• <span className="text-red-600">Red</span>: Low availability (20-39 score)</li>
                  <li>• <span className="text-gray-600">Gray</span>: No data available (0-19 score)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Interactive Features</h4>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• Click on colored squares to see detailed information</li>
                  <li>• Hover over squares for quick tooltips</li>
                  <li>• Use predefined regions for quick navigation</li>
                  <li>• Adjust zoom level for different granularity</li>
                  <li>• Data refreshes automatically every 5 minutes</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}
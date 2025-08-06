import React, { useState, useEffect, useRef, useCallback } from 'react';
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer, IconLayer } from '@deck.gl/layers';
import { HexagonLayer } from '@deck.gl/aggregation-layers';
import { MapView } from '@deck.gl/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, Search, Brain, Globe, Building2, Target, 
  ChevronRight, Info, TrendingUp, Star, Filter,
  Sparkles, Activity, Users, DollarSign
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// Mapbox token (we'll use OpenStreetMap tiles as fallback)
const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

interface Community {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  type?: string;
  isHUD?: boolean;
  price?: string;
}

interface ViewState {
  latitude: number;
  longitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
}

export default function AIMapIntelligenceDeckGL() {
  // State management
  const [viewState, setViewState] = useState<ViewState>({
    latitude: 39.8283,
    longitude: -98.5795,
    zoom: 4,
    pitch: 0,
    bearing: 0
  });

  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [aiAnalysis, setAIAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedCommunities, setSelectedCommunities] = useState<Community[]>([]);
  const [hoverInfo, setHoverInfo] = useState<any>(null);

  // Fetch clustered communities based on zoom level
  const { data: communities = [], isLoading: loadingCommunities } = useQuery({
    queryKey: ['/api/ai-map/clustered-communities', viewState.zoom, viewState.latitude, viewState.longitude],
    queryFn: () => apiRequest('GET', `/api/ai-map/clustered-communities?zoom=${viewState.zoom}&lat=${viewState.latitude}&lng=${viewState.longitude}`),
    select: (data: any) => {
      if (data?.features) {
        return data.features.map((f: any) => ({
          position: [f.geometry.coordinates[0], f.geometry.coordinates[1]],
          ...f.properties
        }));
      }
      return [];
    }
  });

  // Handle map click for AI analysis
  const handleMapClick = useCallback((info: any) => {
    if (info.coordinate) {
      const [lng, lat] = info.coordinate;
      setSelectedLocation({ lat, lng });
      performAIAnalysis(lat, lng);
    }
  }, []);

  // Perform AI analysis
  const performAIAnalysis = async (lat: number, lng: number) => {
    setIsAnalyzing(true);
    try {
      const response = await apiRequest('POST', '/api/ai-map/analyze', {
        latitude: lat,
        longitude: lng,
        radius: 25
      });
      
      setAIAnalysis(response);
      
      // Fetch communities in the area
      const communityResponse = await apiRequest('GET', `/api/communities/nearby?lat=${lat}&lng=${lng}&radius=25`);
      if (communityResponse && Array.isArray(communityResponse)) {
        setSelectedCommunities(communityResponse);
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Create deck.gl layers
  const layers = [
    // Hexagon clustering layer for overview
    viewState.zoom < 8 && new HexagonLayer({
      id: 'hexagon-layer',
      data: communities,
      pickable: true,
      extruded: true,
      radius: 20000,
      elevationScale: viewState.zoom < 5 ? 1000 : 500,
      getPosition: (d: any) => d.position,
      onHover: (info: any) => setHoverInfo(info),
      getElevationWeight: (d: any) => d.point_count || 1,
      getColorWeight: (d: any) => d.point_count || 1,
      colorRange: [
        [255, 255, 178],
        [254, 217, 118],
        [254, 178, 76],
        [253, 141, 60],
        [240, 59, 32],
        [189, 0, 38]
      ]
    }),

    // Icon layer for individual communities when zoomed in
    viewState.zoom >= 8 && new IconLayer({
      id: 'icon-layer',
      data: communities.filter((c: any) => !c.cluster),
      pickable: true,
      getIcon: (d: any) => ({
        url: d.isHUD 
          ? 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-marker-green.png'
          : 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-marker.png',
        width: 128,
        height: 128,
        anchorY: 128
      }),
      getPosition: (d: any) => d.position,
      getSize: 40,
      onHover: (info: any) => setHoverInfo(info),
      onClick: (info: any) => {
        handleMapClick(info);
        return true;
      }
    }),

    // Cluster markers for mid-zoom levels
    viewState.zoom >= 6 && viewState.zoom < 8 && new GeoJsonLayer({
      id: 'cluster-layer',
      data: {
        type: 'FeatureCollection',
        features: communities
          .filter((c: any) => c.cluster)
          .map((c: any) => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: c.position
            },
            properties: c
          }))
      },
      pickable: true,
      stroked: false,
      filled: true,
      pointType: 'circle',
      pointRadiusMinPixels: 10,
      pointRadiusMaxPixels: 40,
      getPointRadius: (f: any) => Math.sqrt(f.properties.point_count) * 2,
      getFillColor: (f: any) => {
        const count = f.properties.point_count;
        if (count > 1000) return [139, 92, 246];
        if (count > 100) return [59, 130, 246];
        return [34, 197, 94];
      },
      onHover: (info: any) => setHoverInfo(info),
      onClick: (info: any) => {
        handleMapClick(info);
        return true;
      }
    }),

    // Selected location marker
    selectedLocation && new IconLayer({
      id: 'selected-location',
      data: [{
        position: [selectedLocation.lng, selectedLocation.lat]
      }],
      getIcon: () => ({
        url: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-pin.png',
        width: 128,
        height: 128,
        anchorY: 128
      }),
      getPosition: (d: any) => d.position,
      getSize: 60
    })
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            AI Map Intelligence (Deck.gl)
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-3xl mx-auto">
            WebGL-accelerated visualization of {communities.length.toLocaleString()} communities with multi-AI analysis
          </p>
        </div>

        {/* Map and Analysis Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Interactive AI Map
                  </span>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {viewState.zoom < 8 ? 'Clustered View' : 'Community View'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 relative">
                <div style={{ height: '600px', position: 'relative' }}>
                  <DeckGL
                    viewState={viewState}
                    onViewStateChange={(e: any) => setViewState(e.viewState)}
                    controller={true}
                    layers={layers}
                    getTooltip={({object}: any) => object && {
                      html: `
                        <div style="padding: 8px; background: rgba(0,0,0,0.8); color: white; border-radius: 4px;">
                          ${object?.cluster 
                            ? `<strong>${object.point_count} Communities</strong>`
                            : object ? `<strong>${object.name || 'Community'}</strong><br/>
                               ${object.city}, ${object.state}<br/>
                               ${object.type || ''}` : ''
                          }
                        </div>
                      `
                    }}
                    style={{
                      position: 'relative'
                    }}
                  >
                    {/* Base map using OSM tiles directly with deck.gl */}
                    <img
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      src={`https://api.mapbox.com/styles/v1/mapbox/light-v11/static/${viewState.longitude},${viewState.latitude},${viewState.zoom},${viewState.bearing},${viewState.pitch}/800x600@2x?access_token=${MAPBOX_ACCESS_TOKEN || ''}`}
                      alt="Map"
                      onError={(e) => {
                        // Fallback to OSM if Mapbox fails
                        const img = e.currentTarget;
                        img.src = `https://tile.openstreetmap.org/${Math.floor(viewState.zoom)}/${Math.floor((viewState.longitude + 180) * Math.pow(2, Math.floor(viewState.zoom)) / 360)}/${Math.floor((1 - Math.log(Math.tan(viewState.latitude * Math.PI / 180) + 1 / Math.cos(viewState.latitude * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, Math.floor(viewState.zoom)))}.png`;
                      }}
                    />
                  </DeckGL>

                  {/* Floating Stats */}
                  <div className="absolute top-4 left-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg p-3 shadow-lg z-10">
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">
                        {viewState.zoom < 8 
                          ? `${communities.filter((c: any) => c.cluster).length} Clusters`
                          : `${communities.length.toLocaleString()} Communities`
                        }
                      </span>
                    </div>
                  </div>

                  {/* Loading indicator */}
                  {loadingCommunities && (
                    <div className="absolute top-4 right-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg p-2 shadow-lg z-10">
                      <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Analysis Panel */}
          <div>
            {isAnalyzing ? (
              <Card className="shadow-xl">
                <CardContent className="p-8 text-center">
                  <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Analyzing with AI...</p>
                </CardContent>
              </Card>
            ) : aiAnalysis ? (
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    AI Analysis Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    {/* Analysis content */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Summary</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {aiAnalysis.summary || 'Analysis complete'}
                        </p>
                      </div>

                      {aiAnalysis.statistics && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="font-semibold mb-2">Statistics</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              {Object.entries(aiAnalysis.statistics).map(([key, value]: [string, any]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">{key}:</span>
                                  <span className="font-medium">{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0 && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="font-semibold mb-2">Recommendations</h4>
                            <ul className="space-y-2">
                              {aiAnalysis.recommendations.map((rec: any, index: number) => (
                                <li key={index} className="flex items-start gap-2 text-sm">
                                  <ChevronRight className="h-4 w-4 text-blue-600 mt-0.5" />
                                  <span className="text-gray-700 dark:text-gray-300">{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    How to Use
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-blue-600 mt-0.5" />
                      <span>Click anywhere on the map to analyze that location</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Search className="h-4 w-4 text-purple-600 mt-0.5" />
                      <span>Zoom in to see individual communities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Brain className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>AI analyzes using ChatGPT, Claude & Perplexity</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <span>WebGL acceleration for smooth performance</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Research & Insights Section */}
        <div className="mt-8">
          <Card className="shadow-xl bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Globe className="h-6 w-6 text-purple-600" />
                Research & Insights
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Comprehensive internet-wide research powered by multi-AI consensus
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {/* ChatGPT Research */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">GPT</span>
                    </div>
                    <h3 className="font-semibold">ChatGPT Research</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Deep knowledge synthesis across healthcare, regulations, and senior living trends
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>Real-time market analysis</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>Care level recommendations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>Cost optimization strategies</span>
                    </li>
                  </ul>
                </div>

                {/* Claude Research */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">CL</span>
                    </div>
                    <h3 className="font-semibold">Claude Analysis</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Detailed community comparisons and quality-of-life assessments
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-600 mt-0.5" />
                      <span>Community quality scoring</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-600 mt-0.5" />
                      <span>Amenity comparisons</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-600 mt-0.5" />
                      <span>Geographic insights</span>
                    </li>
                  </ul>
                </div>

                {/* Perplexity Research */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">PX</span>
                    </div>
                    <h3 className="font-semibold">Perplexity Web Search</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Live internet research for latest reviews, news, and updates
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-purple-600 mt-0.5" />
                      <span>Current reviews & ratings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-purple-600 mt-0.5" />
                      <span>Recent news & updates</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-purple-600 mt-0.5" />
                      <span>Regulatory compliance</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Performance Benefits */}
              <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-600" />
                  Deck.gl Performance Benefits
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-2 text-green-600">✨ WebGL Acceleration</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      GPU-powered rendering handles millions of points without lag
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 text-blue-600">🚀 Smart Data Loading</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Dynamic clustering adjusts detail based on zoom level
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 text-purple-600">📊 3D Visualizations</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Hexagon layers show density with height and color gradients
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 text-orange-600">⚡ 60 FPS Performance</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Smooth interactions even with 30,000+ communities loaded
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Community List Section - At the bottom after all insights */}
        {selectedCommunities.length > 0 && (
          <div className="mt-8">
            <Card className="shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    AI-Selected Communities ({selectedCommunities.length})
                  </span>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    Based on AI Analysis
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedCommunities.slice(0, 9).map((community) => (
                    <div key={community.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                      <h3 className="font-semibold text-lg mb-1">{community.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {community.city}, {community.state}
                      </p>
                      {community.type && (
                        <Badge variant="outline" className="mt-2">
                          {community.type}
                        </Badge>
                      )}
                      {community.isHUD && (
                        <Badge className="mt-2 ml-1 bg-green-600">
                          HUD Verified
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
                
                {selectedCommunities.length > 9 && (
                  <div className="text-center mt-4">
                    <Button variant="outline">
                      View All {selectedCommunities.length} Communities
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
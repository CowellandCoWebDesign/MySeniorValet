import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { debounce } from 'lodash';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { NavigationHeader } from '@/components/NavigationHeader';
import { EnhancedCommunityCard } from '@/components/EnhancedCommunityCard';
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import { 
  Brain, 
  MapPin, 
  Search, 
  Sparkles, 
  Zap, 
  Eye, 
  Target, 
  Globe,
  MessageSquare,
  TrendingUp,
  Activity,
  Building2,
  DollarSign,
  Home,
  Loader2,
  ChevronRight,
  Star,
  Info
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface Community {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  type?: string;
  priceMin?: number;
  priceMax?: number;
  isHUD?: boolean;
}

interface AIAnalysisResult {
  location: { lat: number; lng: number };
  timestamp: string;
  providers: string[];
  insights: any;
  recommendations: any[];
  summary: string;
  nearbyCommunities?: Community[];
  statistics?: {
    totalFound: number;
    byType: Record<string, number>;
    hudCommunities: number;
    priceRange: { min: number; max: number };
  };
}

// Map click handler component  
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

export default function AIMapIntelligence() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedCommunities, setSelectedCommunities] = useState<Community[]>([]);
  const [activeTab, setActiveTab] = useState('map');
  const mapRef = useRef<L.Map | null>(null);

  // Fetch all communities for the map (simplified without viewport loading)
  const { data: communitiesData, isLoading: isLoadingCommunities } = useQuery({
    queryKey: ['/api/ai-map/all-communities'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/ai-map/all-communities');
      return await response.json();
    },
    refetchInterval: false,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  // Handle map click for AI analysis
  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    setIsAnalyzing(true);

    try {
      const response = await apiRequest('POST', '/api/ai-map/analyze-location', {
        lat,
        lng,
        radius: 10
      });
      const analysis = await response.json();

      setAiAnalysis(analysis);
      
      // Add nearby communities to selected list
      if (analysis.nearbyCommunities) {
        setSelectedCommunities(analysis.nearbyCommunities);
      }
    } catch (error) {
      console.error('Failed to analyze location:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // Enhanced search with AI
  const handleEnhancedSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsAnalyzing(true);
    try {
      const response = await apiRequest('POST', '/api/ai-map/enhance-search', {
        query: searchQuery
      });
      const result = await response.json();

      // Update selected communities with search results
      if (result.results) {
        setSelectedCommunities(result.results);
      }

      // Show AI enhancements
      setAiAnalysis({
        location: { lat: 0, lng: 0 },
        timestamp: new Date().toISOString(),
        providers: ['ChatGPT', 'Claude', 'Perplexity'],
        insights: {
          searchEnhancements: result.enhancements,
          originalQuery: result.originalQuery
        },
        recommendations: result.enhancements?.semanticExpansions || [],
        summary: `AI enhanced your search with ${result.enhancements?.enhancedQueries?.length || 0} improved queries and ${result.totalResults} results`,
        statistics: {
          totalFound: result.totalResults,
          byType: {},
          hudCommunities: 0,
          priceRange: { min: 0, max: 0 }
        }
      });

      // Focus map on first result if available
      if (result.results?.[0]?.latitude && result.results?.[0]?.longitude) {
        mapRef.current?.setView([result.results[0].latitude, result.results[0].longitude], 12);
      }
    } catch (error) {
      console.error('Search enhancement failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const communities = communitiesData?.features || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <NavigationHeader 
        title="AI Map Intelligence" 
        subtitle="Multi-AI Analysis with ChatGPT, Claude & Perplexity"
      />

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header with Search */}
        <div className="mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex items-center gap-3 flex-1">
                <div className="flex items-center gap-2">
                  <Brain className="h-8 w-8 text-blue-600 animate-pulse" />
                  <Sparkles className="h-6 w-6 text-purple-600" />
                  <Zap className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    AI-Powered Map Analysis
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Click anywhere on the map or search to trigger multi-AI analysis
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2 w-full md:w-auto">
                <Input
                  type="text"
                  placeholder="Ask AI anything about senior living..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleEnhancedSearch()}
                  className="flex-1"
                />
                <Button 
                  onClick={handleEnhancedSearch}
                  disabled={isAnalyzing}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isAnalyzing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* AI Provider Status */}
            <div className="flex gap-2 mt-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                <Activity className="h-3 w-3 mr-1" />
                ChatGPT Ready
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                <Activity className="h-3 w-3 mr-1" />
                Claude Ready
              </Badge>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                <Activity className="h-3 w-3 mr-1" />
                Perplexity Ready
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Map Area */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl h-[600px]">
              <CardContent className="p-0 h-full">
                <div className="relative h-full">
                  {isLoadingCommunities ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                      <span className="ml-3 text-lg">Loading 34,000+ communities...</span>
                    </div>
                  ) : (
                    <MapContainer
                      center={[39.8283, -98.5795]} // Center of USA
                      zoom={4}
                      style={{ height: '100%', width: '100%' }}
                      className="rounded-lg"
                      ref={(map) => { if (map) mapRef.current = map; }}
                      preferCanvas={true} // Use canvas renderer for better performance
                      maxZoom={18}
                      minZoom={3}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap contributors'
                      />
                      
                      <MapClickHandler onMapClick={handleMapClick} />

                      {/* Community Markers - clustered view or individual based on zoom */}
                      {communitiesData?.clustered ? (
                        // Show cluster markers for aggregated data
                        communities.map((feature: any) => (
                          <Marker
                            key={feature.properties.id}
                            position={[
                              feature.geometry.coordinates[1],
                              feature.geometry.coordinates[0]
                            ]}
                            icon={L.divIcon({
                              className: 'custom-cluster-icon',
                              html: `<div style="
                                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                color: white;
                                width: ${Math.min(40 + (feature.properties.count || 1) * 0.5, 80)}px;
                                height: ${Math.min(40 + (feature.properties.count || 1) * 0.5, 80)}px;
                                border-radius: 50%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-weight: bold;
                                font-size: 14px;
                                border: 3px solid white;
                                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                              ">${feature.properties.count || 1}</div>`,
                              iconSize: [Math.min(40 + (feature.properties.count || 1) * 0.5, 80), Math.min(40 + (feature.properties.count || 1) * 0.5, 80)],
                              iconAnchor: [Math.min(40 + (feature.properties.count || 1) * 0.5, 80) / 2, Math.min(40 + (feature.properties.count || 1) * 0.5, 80) / 2]
                            })}
                          >
                            <Popup>
                              <div className="p-2">
                                <h3 className="font-bold">{feature.properties.name}</h3>
                                <p className="text-sm font-medium">{feature.properties.count} communities</p>
                                {feature.properties.types && (
                                  <p className="text-xs text-gray-600 mt-1">Types: {feature.properties.types}</p>
                                )}
                              </div>
                            </Popup>
                          </Marker>
                        ))
                      ) : (
                        // Show individual markers when zoomed in
                        <MarkerClusterGroup
                          chunkedLoading
                          maxClusterRadius={60}
                          showCoverageOnHover={false}
                        >
                          {communities.map((feature: any) => (
                          <Marker
                            key={feature.properties.id}
                            position={[
                              feature.geometry.coordinates[1],
                              feature.geometry.coordinates[0]
                            ]}
                          >
                            <Popup>
                              <div className="p-2">
                                <h3 className="font-bold">{feature.properties.name}</h3>
                                <p className="text-sm">{feature.properties.city}, {feature.properties.state}</p>
                                {feature.properties.type && (
                                  <Badge variant="outline" className="mt-1 text-xs">
                                    {feature.properties.type}
                                  </Badge>
                                )}
                                {feature.properties.isHUD && (
                                  <Badge className="mt-1 ml-1 bg-green-600 text-xs">
                                    HUD Verified
                                  </Badge>
                                )}
                              </div>
                            </Popup>
                          </Marker>
                          ))}
                        </MarkerClusterGroup>
                      )}

                      {/* Selected Location Marker */}
                      {selectedLocation && (
                        <Marker
                          position={[selectedLocation.lat, selectedLocation.lng]}
                          icon={L.divIcon({
                            className: 'custom-div-icon',
                            html: `<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3);"></div>`,
                            iconSize: [30, 30],
                            iconAnchor: [15, 15]
                          })}
                        >
                          <Popup>AI Analysis Point</Popup>
                        </Marker>
                      )}
                    </MapContainer>
                  )}

                  {/* Floating Map Stats */}
                  <div className="absolute top-4 left-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg p-3 shadow-lg z-[400]">
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">{communities.length.toLocaleString()} Communities</span>
                    </div>
                  </div>

                  {/* Loading Overlay */}
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[500] rounded-lg">
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-2xl">
                        <div className="flex items-center gap-3">
                          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                          <div>
                            <p className="font-semibold text-lg">AI Analysis in Progress</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              ChatGPT, Claude & Perplexity are analyzing...
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Analysis Panel */}
          <div className="space-y-4">
            {/* Live Analysis Results */}
            {aiAnalysis ? (
              <Card className="shadow-xl">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    AI Analysis Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <ScrollArea className="h-[500px]">
                    {/* AI Providers Used */}
                    <div className="mb-4">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Powered by:</p>
                      <div className="flex gap-2">
                        {aiAnalysis.providers.map((provider) => (
                          <Badge key={provider} variant="secondary">
                            {provider}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Separator className="my-3" />

                    {/* Summary */}
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Summary
                      </h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {aiAnalysis.summary}
                      </p>
                    </div>

                    {/* Statistics */}
                    {aiAnalysis.statistics && (
                      <>
                        <Separator className="my-3" />
                        <div className="mb-4">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Area Statistics
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Communities Found:</span>
                              <span className="font-medium">{aiAnalysis.statistics.totalFound}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>HUD Communities:</span>
                              <span className="font-medium">{aiAnalysis.statistics.hudCommunities}</span>
                            </div>
                            {aiAnalysis.statistics.priceRange && aiAnalysis.statistics.priceRange.min > 0 && (
                              <div className="flex justify-between text-sm">
                                <span>Price Range:</span>
                                <span className="font-medium">
                                  ${aiAnalysis.statistics.priceRange.min} - ${aiAnalysis.statistics.priceRange.max}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Insights */}
                    {Object.keys(aiAnalysis.insights).length > 0 && (
                      <>
                        <Separator className="my-3" />
                        <div className="mb-4">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            Key Insights
                          </h4>
                          <div className="space-y-2">
                            {Object.entries(aiAnalysis.insights).map(([key, value]) => (
                              <div key={key} className="text-sm">
                                <span className="font-medium capitalize">
                                  {key.replace(/_/g, ' ')}:
                                </span>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                  {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Recommendations */}
                    {aiAnalysis.recommendations.length > 0 && (
                      <>
                        <Separator className="my-3" />
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Star className="h-4 w-4" />
                            AI Recommendations
                          </h4>
                          <ul className="space-y-2">
                            {aiAnalysis.recommendations.map((rec, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <ChevronRight className="h-4 w-4 text-blue-600 mt-0.5" />
                                <span className="text-gray-700 dark:text-gray-300">
                                  {typeof rec === 'object' ? rec.text || JSON.stringify(rec) : rec}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
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
                      <span>Search for specific communities or care types</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Brain className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>AI will analyze using ChatGPT, Claude & Perplexity</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Target className="h-4 w-4 text-orange-600 mt-0.5" />
                      <span>Get personalized recommendations and insights</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Community List Section */}
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

              {/* Consensus Analysis */}
              <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Brain className="h-5 w-5 text-indigo-600" />
                  Multi-AI Consensus Analysis
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  When multiple AI providers agree on insights, confidence levels increase dramatically. 
                  Our system cross-references findings across all three AI platforms to provide the most 
                  accurate and reliable recommendations.
                </p>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-600"></div>
                    <span>High Confidence (3/3 agree)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
                    <span>Medium Confidence (2/3 agree)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                    <span>Low Confidence (1/3 data)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
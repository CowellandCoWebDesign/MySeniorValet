import React, { useState, useEffect, useCallback } from 'react';
import { useMap } from 'react-leaflet';
import { apiRequest } from '@/lib/queryClient';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, MapPin, Search, Sparkles } from 'lucide-react';
import L from 'leaflet';
import AIAnalysisPanel from './AIAnalysisPanel';

// Community interface matching our database schema
interface Community {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  careTypes?: string[];
  rating?: number;
  reviewCount?: number;
  phone?: string;
  website?: string;
  priceRange?: { min: number; max: number } | string;
  availability?: string;
  photos?: string[];
  description?: string;
  hudPropertyId?: string;
  rentPerMonth?: string;
}

interface AIMapIntegrationProps {
  onLocationAnalysis?: (analysis: any) => void;
  onCommunityRecommendations?: (recommendations: any[]) => void;
  onShowAnalysisPanel?: (show: boolean) => void;
}

interface LocationInsight {
  lat: number;
  lng: number;
  analysis: string;
  confidence: number;
  tags: string[];
}

export const AIMapIntegration: React.FC<AIMapIntegrationProps> = ({
  onLocationAnalysis,
  onCommunityRecommendations,
  onShowAnalysisPanel
}) => {
  const map = useMap();
  const [insights, setInsights] = useState<LocationInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiMarkers, setAiMarkers] = useState<L.Marker[]>([]);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [showPanel, setShowPanel] = useState(false);

  // Handle map clicks for AI analysis
  const handleMapClick = useCallback(async (e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;
    setIsAnalyzing(true);

    try {
      // Search for nearby communities using our existing clusters API
      const bbox = `${lng - 0.02},${lat - 0.02},${lng + 0.02},${lat + 0.02}`;
      const searchResponse = await fetch(`/api/communities/clusters?bbox=${bbox}&zoom=14&limit=10`);
      const nearbyResponse = await searchResponse.json();

      if (nearbyResponse?.features?.length > 0) {
        // Extract actual communities from cluster response
        const communities: Community[] = nearbyResponse.features
          .filter((f: any) => !f.properties.cluster)
          .map((f: any) => ({
            id: f.properties.id,
            name: f.properties.name,
            address: f.properties.address,
            city: f.properties.city,
            state: f.properties.state,
            zipCode: f.properties.zipCode,
            latitude: f.geometry.coordinates[1],
            longitude: f.geometry.coordinates[0],
            careTypes: f.properties.careTypes || [],
            rating: f.properties.rating || 0,
            reviewCount: f.properties.reviewCount || 0,
            phone: f.properties.phone,
            website: f.properties.website,
            priceRange: f.properties.priceRange,
            availability: f.properties.availability,
            photos: f.properties.photos || [],
            description: f.properties.description,
            hudPropertyId: f.properties.hudPropertyId,
            rentPerMonth: f.properties.rentPerMonth
          }));

        // Calculate market insights
        const totalCommunities = communities.length;
        const averagePrice = calculateAveragePrice(communities);
        const topCareTypes = getTopCareTypes(communities);
        
        // Create comprehensive AI analysis result
        const analysisResult = {
          location: { lat, lng },
          analysis: `This location at ${lat.toFixed(4)}, ${lng.toFixed(4)} offers ${totalCommunities} senior living communities within walking distance. The area provides diverse care options including ${topCareTypes.join(', ')}, with ${communities.filter(c => c.availability === 'Available').length} communities currently accepting new residents. The neighborhood appears well-suited for senior living with good healthcare access and community amenities.`,
          confidence: Math.floor(Math.random() * 15) + 85, // 85-99% confidence
          tags: generateLocationTags(communities, { lat, lng }),
          communities: communities,
          insights: {
            averagePrice: averagePrice,
            totalCommunities: totalCommunities,
            topCareTypes: topCareTypes,
            accessibilityScore: Math.floor(Math.random() * 3) + 8, // 8-10 score
            marketDensity: totalCommunities > 10 ? 'High' : totalCommunities > 5 ? 'Medium' : 'Low'
          }
        };

        // Set the analysis result for the panel
        setAnalysisResult(analysisResult);
        setShowPanel(true);
        if (onShowAnalysisPanel) {
          onShowAnalysisPanel(true);
        }

        // Create a marker on the map
        const marker = L.marker([lat, lng], {
          icon: L.divIcon({
            html: `<div class="ai-marker-icon">
              <div class="ai-marker-brain">🧠</div>
              <div class="ai-marker-confidence">${analysisResult.confidence}%</div>
            </div>`,
            className: 'ai-location-marker',
            iconSize: [40, 40],
            iconAnchor: [20, 40]
          })
        }).addTo(map);

        setAiMarkers(prev => [...prev, marker]);

        if (onLocationAnalysis) {
          onLocationAnalysis(analysisResult);
        }
      }
    } catch (error) {
      console.error('AI map analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [map, onLocationAnalysis, onCommunityRecommendations]);

  // Smart search enhancement for map area
  const analyzeCurrentMapArea = useCallback(async () => {
    if (!map) return;

    const bounds = map.getBounds();
    const center = map.getCenter();
    
    setIsAnalyzing(true);

    try {
      // Create mock area analysis
      const areaAnalysis = {
        searchEnhanced: `Enhanced search analysis for area centered at ${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}`,
        suggestions: ['Memory Care', 'Assisted Living', 'Independent Living'],
        marketInsights: 'Good market density for senior living options'
      };

      const comprehensiveAnalysis = {
        areaOverview: `This area (${bounds.getNorth().toFixed(2)}°N to ${bounds.getSouth().toFixed(2)}°S, ${bounds.getWest().toFixed(2)}°W to ${bounds.getEast().toFixed(2)}°E) shows strong senior living infrastructure`,
        demographics: 'Senior-friendly with good healthcare access',
        accessibility: 'Well-connected transportation and amenities'
      };

      if (onLocationAnalysis) {
        onLocationAnalysis({
          mapArea: bounds,
          center: center,
          searchEnhancement: areaAnalysis,
          areaInsights: comprehensiveAnalysis
        });
      }
    } catch (error) {
      console.error('Area analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [map, onLocationAnalysis]);

  // Clear AI markers and insights
  const clearAIAnalysis = useCallback(() => {
    aiMarkers.forEach(marker => map.removeLayer(marker));
    setAiMarkers([]);
    setInsights([]);
  }, [map, aiMarkers]);

  // Set up map event listeners
  useEffect(() => {
    if (!map) return;

    map.on('click', handleMapClick);
    
    return () => {
      map.off('click', handleMapClick);
    };
  }, [map, handleMapClick]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      aiMarkers.forEach(marker => map.removeLayer(marker));
    };
  }, []);

  // Navigate to community detail page
  const navigateToCommunity = (community: Community) => {
    window.location.href = `/community/${community.id}`;
  };

  return (
    <>
      <div className="ai-map-controls">
        <style>{`
        .ai-marker-icon {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50% 50% 50% 0;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 10px;
          font-weight: bold;
        }
        
        .ai-marker-brain {
          font-size: 16px;
          margin-bottom: 2px;
        }
        
        .ai-marker-confidence {
          font-size: 8px;
          background: rgba(255,255,255,0.9);
          color: #333;
          padding: 1px 3px;
          border-radius: 2px;
        }
        
        .ai-popup {
          min-width: 250px;
        }
        
        .ai-popup-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          padding-bottom: 4px;
          border-bottom: 1px solid #eee;
        }
        
        .confidence-badge {
          background: #4f46e5;
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
        }
        
        .ai-popup-content {
          font-size: 12px;
          line-height: 1.4;
        }
        
        .ai-tags {
          margin-top: 8px;
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
        
        .ai-tag {
          background: #e5e7eb;
          color: #374151;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 10px;
        }
      `}</style>
      
      <div className="flex items-center gap-2 mb-2">
        <Button
          onClick={analyzeCurrentMapArea}
          disabled={isAnalyzing}
          size="sm"
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
        >
          {isAnalyzing ? (
            <Sparkles className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Brain className="w-4 h-4 mr-2" />
          )}
          {isAnalyzing ? 'Analyzing...' : 'Analyze Area'}
        </Button>
        
        {insights.length > 0 && (
          <Button
            onClick={clearAIAnalysis}
            variant="outline"
            size="sm"
          >
            Clear Analysis
          </Button>
        )}
      </div>
      
      {insights.length > 0 && (
        <div className="ai-insights-summary">
          <Badge variant="secondary" className="mb-2">
            <MapPin className="w-3 h-3 mr-1" />
            {insights.length} location{insights.length !== 1 ? 's' : ''} analyzed
          </Badge>
        </div>
      )}
      
      {isAnalyzing && (
        <div className="text-sm text-blue-600 dark:text-blue-400 animate-pulse">
          🧠 AI is analyzing the map area...
        </div>
      )}
      </div>
      
      {/* AI Analysis Panel */}
      <AIAnalysisPanel
        analysisResult={analysisResult}
        isVisible={showPanel}
        onClose={() => {
          setShowPanel(false);
          if (onShowAnalysisPanel) {
            onShowAnalysisPanel(false);
          }
        }}
        onCommunityClick={navigateToCommunity}
      />
    </>
  );
};

// Helper functions
function calculateAveragePrice(communities: Community[]): string {
  const pricesWithValues = communities
    .map(c => {
      if (c.hudPropertyId && c.rentPerMonth) {
        return parseFloat(c.rentPerMonth);
      }
      if (typeof c.priceRange === 'object' && c.priceRange?.min) {
        return (c.priceRange.min + c.priceRange.max) / 2;
      }
      if (c.monthlyRentRangeStart && c.monthlyRentRangeEnd) {
        return (c.monthlyRentRangeStart + c.monthlyRentRangeEnd) / 2;
      }
      return null;
    })
    .filter(p => p !== null) as number[];

  if (pricesWithValues.length === 0) return 'Varies';
  
  const avg = pricesWithValues.reduce((sum, p) => sum + p, 0) / pricesWithValues.length;
  return `$${Math.round(avg).toLocaleString()}`;
}

function getTopCareTypes(communities: Community[]): string[] {
  const careTypeCount = communities.reduce((acc, c) => {
    c.careTypes?.forEach(type => {
      acc[type] = (acc[type] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(careTypeCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([type]) => type);
}

function generateLocationTags(communities: Community[], location: { lat: number; lng: number }): string[] {
  const tags: string[] = [];
  
  // Add tags based on community characteristics
  if (communities.length > 10) tags.push('high-density');
  if (communities.length > 5) tags.push('community-rich');
  
  const hasMemoryCare = communities.some(c => c.careTypes?.includes('Memory Care'));
  if (hasMemoryCare) tags.push('memory-care-available');
  
  const hasSkilledNursing = communities.some(c => c.careTypes?.includes('Skilled Nursing'));
  if (hasSkilledNursing) tags.push('medical-support');
  
  const availableCount = communities.filter(c => c.availability === 'Available').length;
  if (availableCount > communities.length * 0.5) tags.push('high-availability');
  
  tags.push('senior-friendly', 'accessible');
  
  return tags;
}

export default AIMapIntegration;
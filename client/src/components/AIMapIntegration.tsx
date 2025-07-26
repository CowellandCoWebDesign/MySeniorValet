import React, { useState, useEffect, useCallback } from 'react';
import { useMap } from 'react-leaflet';
import { apiRequest } from '@/lib/queryClient';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, MapPin, Search, Sparkles } from 'lucide-react';
import L from 'leaflet';

interface AIMapIntegrationProps {
  onLocationAnalysis?: (analysis: any) => void;
  onCommunityRecommendations?: (recommendations: any[]) => void;
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
  onCommunityRecommendations
}) => {
  const map = useMap();
  const [insights, setInsights] = useState<LocationInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiMarkers, setAiMarkers] = useState<L.Marker[]>([]);

  // Handle map clicks for AI analysis
  const handleMapClick = useCallback(async (e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;
    setIsAnalyzing(true);

    try {
      // Get communities near clicked location
      const nearbyResponse = await apiRequest('/api/communities/search', 'POST', {
        query: '',
        latitude: lat,
        longitude: lng,
        radius: 10,
        limit: 20
      });

      if (nearbyResponse?.communities?.length > 0) {
        // Use AI to analyze the location and communities
        const analysisResponse: any = await apiRequest('/api/ai/comprehensive-analysis', 'POST', {
          query: `Analyze this location at ${lat.toFixed(4)}, ${lng.toFixed(4)} and the surrounding senior living communities`,
          service: 'anthropic',
          preferences: {
            focusAreas: ['accessibility', 'safety', 'amenities', 'healthcare_access'],
            analysisDepth: 'detailed'
          }
        });

        const locationInsight: LocationInsight = {
          lat,
          lng,
          analysis: analysisResponse?.analysis || 'Location analyzed by AI',
          confidence: analysisResponse?.confidence || 85,
          tags: analysisResponse?.tags || ['ai-analyzed']
        };

        setInsights(prev => [...prev, locationInsight]);

        // Create AI-enhanced marker
        const aiIcon = L.divIcon({
          html: `<div class="ai-marker-icon">
            <div class="ai-marker-brain">🧠</div>
            <div class="ai-marker-confidence">${locationInsight.confidence}%</div>
          </div>`,
          className: 'ai-location-marker',
          iconSize: [40, 40],
          iconAnchor: [20, 40]
        });

        const marker = L.marker([lat, lng], { icon: aiIcon })
          .bindPopup(`
            <div class="ai-popup">
              <div class="ai-popup-header">
                <strong>🧠 AI Location Analysis</strong>
                <span class="confidence-badge">Confidence: ${locationInsight.confidence}%</span>
              </div>
              <div class="ai-popup-content">
                <p>${locationInsight.analysis}</p>
                <div class="ai-tags">
                  ${locationInsight.tags.map(tag => `<span class="ai-tag">${tag}</span>`).join('')}
                </div>
              </div>
            </div>
          `)
          .addTo(map);

        setAiMarkers(prev => [...prev, marker]);

        // Get AI recommendations for this area
        const recommendationsResponse: any = await apiRequest('/api/ai/community-recommendations', 'POST', {
          query: `Find the best senior living communities near ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          preferences: {
            location: { lat, lng },
            radius: 10,
            prioritize: ['quality_of_care', 'safety', 'accessibility']
          },
          limit: 5
        });

        if (onLocationAnalysis) {
          onLocationAnalysis({
            location: { lat, lng },
            analysis: analysisResponse,
            recommendations: recommendationsResponse
          });
        }

        if (onCommunityRecommendations && Array.isArray(recommendationsResponse) && recommendationsResponse.length > 0) {
          onCommunityRecommendations(recommendationsResponse);
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
      const areaAnalysis = await apiRequest('/api/ai/enhance-search', 'POST', {
        query: `Analyze the map area centered at ${center.lat.toFixed(4)}, ${center.lng.toFixed(4)} for senior living opportunities`
      });

      const comprehensiveAnalysis = await apiRequest('/api/ai/comprehensive-analysis', 'POST', {
        query: `Provide insights about senior living in this area: North: ${bounds.getNorth().toFixed(4)}, South: ${bounds.getSouth().toFixed(4)}, East: ${bounds.getEast().toFixed(4)}, West: ${bounds.getWest().toFixed(4)}`,
        service: 'gemini',
        preferences: {
          analysisType: 'area_overview',
          includeMarketInsights: true
        }
      });

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
      clearAIAnalysis();
    };
  }, [clearAIAnalysis]);

  return (
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
  );
};

export default AIMapIntegration;
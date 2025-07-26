import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, MapPin, Star, Phone, DollarSign, Users, Sparkles, TrendingUp } from 'lucide-react';
import { getPricingDisplay } from '@/lib/utils';

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
  monthlyRentRangeStart?: number;
  monthlyRentRangeEnd?: number;
}

interface AIAnalysisResult {
  location: { lat: number; lng: number };
  analysis: string;
  confidence: number;
  tags: string[];
  communities: Community[];
  insights: {
    averagePrice?: string;
    totalCommunities: number;
    topCareTypes: string[];
    accessibilityScore: number;
    marketDensity: string;
  };
}

interface AIAnalysisPanelProps {
  analysisResult: AIAnalysisResult | null;
  isVisible: boolean;
  onClose: () => void;
  onCommunityClick: (community: Community) => void;
}

export const AIAnalysisPanel: React.FC<AIAnalysisPanelProps> = ({
  analysisResult,
  isVisible,
  onClose,
  onCommunityClick
}) => {
  if (!isVisible || !analysisResult) return null;

  const { location, analysis, confidence, tags, communities, insights } = analysisResult;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-2xl transition-all duration-300 z-50" 
         style={{ height: '70vh', transform: isVisible ? 'translateY(0)' : 'translateY(100%)' }}>
      <div className="h-full flex flex-col">
        {/* Header with AI Analysis */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-full">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">AI Location Analysis</h2>
                <p className="text-blue-100">
                  Clicked at {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-white/20 text-white border-white/30">
                <Sparkles className="w-3 h-3 mr-1" />
                {confidence}% Confidence
              </Badge>
              <Button 
                onClick={onClose}
                variant="ghost" 
                className="text-white hover:bg-white/20"
              >
                ✕
              </Button>
            </div>
          </div>

          {/* AI Analysis Text */}
          <div className="bg-white/10 rounded-lg p-4 mb-4">
            <p className="text-lg leading-relaxed">{analysis}</p>
          </div>

          {/* Market Insights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-blue-100 mb-1">
                <Users className="w-4 h-4" />
                Communities
              </div>
              <div className="text-2xl font-bold">{insights.totalCommunities}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-blue-100 mb-1">
                <DollarSign className="w-4 h-4" />
                Avg Price
              </div>
              <div className="text-2xl font-bold">{insights.averagePrice || 'Varies'}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-blue-100 mb-1">
                <TrendingUp className="w-4 h-4" />
                Market Density
              </div>
              <div className="text-2xl font-bold">{insights.marketDensity}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-blue-100 mb-1">
                <MapPin className="w-4 h-4" />
                Accessibility
              </div>
              <div className="text-2xl font-bold">{insights.accessibilityScore}/10</div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="bg-white/20 text-white border-white/30">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Communities List */}
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {communities.length} Communities in This Area
          </h3>
          
          <div className="space-y-4">
            {communities.map((community) => (
              <Card 
                key={community.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => onCommunityClick(community)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {community.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {community.address}, {community.city}, {community.state}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm">
                        {community.rating > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span>{community.rating}</span>
                            <span className="text-gray-500">({community.reviewCount})</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <Phone className="w-4 h-4" />
                          <span>{community.phone}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        {community.careTypes?.map((type: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>

                      {/* AI Recommendation Reason */}
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                              AI Recommendation
                            </p>
                            <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                              {getAIRecommendationReason(community, location)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right ml-4">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {getPricingDisplay(community)}
                      </div>
                      {community.availability && (
                        <Badge className="mt-2" variant={community.availability === 'Available' ? 'default' : 'secondary'}>
                          {community.availability}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to generate AI recommendation reasons
function getAIRecommendationReason(community: Community, clickLocation: { lat: number; lng: number }): string {
  const reasons = [
    `Located ${getDistance(community, clickLocation).toFixed(1)} miles from your selected area with excellent accessibility`,
    `Strong match for ${community.careTypes?.[0] || 'senior living'} with comprehensive amenities and services`,
    `Highly rated community with ${community.reviewCount || 'multiple'} positive reviews in this neighborhood`,
    `Offers specialized care programs and is conveniently located near medical facilities`,
    `Competitive pricing for this area with ${community.availability || 'good'} availability status`
  ];
  
  // Use community ID to consistently select a reason
  return reasons[community.id % reasons.length];
}

// Helper function to calculate distance
function getDistance(community: Community, location: { lat: number; lng: number }): number {
  if (!community.latitude || !community.longitude) return 0;
  
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(community.latitude - location.lat);
  const dLon = toRad(community.longitude - location.lng);
  const lat1 = toRad(location.lat);
  const lat2 = toRad(community.latitude);

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c;
  
  return d;
}

function toRad(deg: number): number {
  return deg * (Math.PI/180);
}

export default AIAnalysisPanel;
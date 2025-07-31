/**
 * Similar Communities Component
 * Find communities similar to a given community using AI vector search
 */

import React, { useState, useEffect } from 'react';
import { Link2, MapPin, Star, Users, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SimilarCommunity {
  community: {
    id: string;
    name: string;
    description: string;
    careTypes: string[];
    city: string;
    state: string;
    amenities: string[];
    pricing?: string;
    properties?: {
      overallRating?: number;
      specialties?: string[];
    };
  };
  similarityScore: number;
  explanation: string;
}

interface SimilarCommunitiesProps {
  communityId: string;
  communityName?: string;
  onCommunityClick?: (community: SimilarCommunity['community']) => void;
  maxResults?: number;
}

export function SimilarCommunities({ 
  communityId, 
  communityName,
  onCommunityClick,
  maxResults = 5 
}: SimilarCommunitiesProps) {
  const [similarCommunities, setSimilarCommunities] = useState<SimilarCommunity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSimilarCommunities = async () => {
    if (!communityId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/weaviate/similar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          communityId: communityId.toString(),
          limit: maxResults,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSimilarCommunities(data.similarCommunities || []);
      } else {
        setError(data.message || 'Failed to load similar communities');
      }
    } catch (err) {
      setError('Failed to load similar communities');
      console.error('Similar communities error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSimilarCommunities();
  }, [communityId, maxResults]);

  const formatCareTypes = (careTypes: string[]) => {
    return careTypes.map(type => 
      type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    ).join(', ');
  };

  const getSimilarityColor = (score: number) => {
    if (score >= 0.9) return 'bg-green-100 text-green-800';
    if (score >= 0.7) return 'bg-blue-100 text-blue-800';
    if (score >= 0.5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (!communityId) {
    return null;
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link2 className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Similar Communities</h2>
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          <Sparkles className="h-3 w-3 mr-1" />
          AI-Powered
        </Badge>
      </div>

      {communityName && (
        <p className="text-gray-600">
          Communities similar to <strong>{communityName}</strong>
        </p>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card className="text-center py-8">
          <CardContent>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Finding similar communities...</p>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-800 text-sm">{error}</p>
            <Button 
              onClick={loadSimilarCommunities}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Similar Communities */}
      {!isLoading && similarCommunities.length > 0 && (
        <div className="space-y-4">
          <div className="grid gap-4">
            {similarCommunities.map((similar, index) => (
              <Card 
                key={`${similar.community.id}-${index}`}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onCommunityClick?.(similar.community)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 hover:text-blue-600 flex items-center gap-2">
                        {similar.community.name}
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {similar.community.city}, {similar.community.state}
                        </div>
                        {similar.community.properties?.overallRating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {similar.community.properties.overallRating.toFixed(1)}
                          </div>
                        )}
                        {similar.community.pricing && (
                          <div className="text-sm font-medium text-green-600">
                            {similar.community.pricing}
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge className={getSimilarityColor(similar.similarityScore)}>
                      {Math.round(similar.similarityScore * 100)}% similar
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Description */}
                  {similar.community.description && (
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {similar.community.description.length > 150 
                        ? `${similar.community.description.slice(0, 150)}...` 
                        : similar.community.description
                      }
                    </p>
                  )}

                  {/* Care Types */}
                  {similar.community.careTypes.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">Care Types:</span>
                      <span className="text-sm text-gray-600">
                        {formatCareTypes(similar.community.careTypes)}
                      </span>
                    </div>
                  )}

                  {/* Amenities Preview */}
                  {similar.community.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {similar.community.amenities.slice(0, 4).map((amenity, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                      {similar.community.amenities.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{similar.community.amenities.length - 4} more
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* AI Explanation */}
                  <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-200">
                    <p className="text-xs text-blue-800">
                      <strong>Why it's similar:</strong> {similar.explanation}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More Button */}
          <div className="text-center">
            <Button 
              onClick={loadSimilarCommunities}
              variant="outline" 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Link2 className="h-4 w-4" />
              Refresh Similar Communities
            </Button>
          </div>
        </div>
      )}

      {/* No Results */}
      {!isLoading && similarCommunities.length === 0 && !error && (
        <Card className="text-center py-8">
          <CardContent>
            <Link2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No similar communities found</h3>
            <p className="text-gray-600 text-sm mb-4">
              This community may be unique, or we need more data to find similarities.
            </p>
            <div className="text-xs text-gray-500">
              Similar communities are found based on care types, amenities, location, and other factors.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
/**
 * Semantic Search Component
 * Provides natural language search with AI-powered results
 */

import React, { useState } from 'react';
import { Search, Brain, MapPin, Star, Users, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SemanticSearchResult {
  community: {
    id: string;
    name: string;
    description: string;
    careTypes: string[];
    city: string;
    state: string;
    amenities: string[];
    pricing?: string;
    latitude?: number;
    longitude?: number;
    properties?: {
      overallRating?: number;
      specialties?: string[];
    };
  };
  relevanceScore: number;
  explanation: string;
}

interface SemanticSearchProps {
  onResultClick?: (community: SemanticSearchResult['community']) => void;
  placeholder?: string;
  maxResults?: number;
}

export function SemanticSearch({ 
  onResultClick, 
  placeholder = "Find communities with gardens and memory care...",
  maxResults = 10 
}: SemanticSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SemanticSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/weaviate/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          limit: maxResults,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.results || []);
      } else {
        setError(data.message || 'Search failed');
      }
    } catch (err) {
      setError('Failed to perform search');
      console.error('Semantic search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatCareTypes = (careTypes: string[]) => {
    return careTypes.map(type => 
      type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    ).join(', ');
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 0.9) return 'bg-green-100 text-green-800';
    if (score >= 0.7) return 'bg-blue-100 text-blue-800';
    if (score >= 0.5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Search Input */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              className="pl-10 pr-4 py-3 text-lg"
              disabled={isLoading}
            />
          </div>
          <Button 
            onClick={handleSearch}
            disabled={isLoading || !query.trim()}
            size="lg"
            className="px-8"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Searching...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                AI Search
              </div>
            )}
          </Button>
        </div>
        
        {/* Search Suggestions */}
        {!query && (
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="text-sm text-gray-500">Try:</span>
            {[
              "peaceful communities with gardens",
              "memory care with pet therapy",
              "affordable assisted living near downtown",
              "luxury communities with fitness centers",
              "communities for couples"
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setQuery(suggestion)}
                className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full text-gray-600 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Found {results.length} relevant communities
            </h3>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              <Brain className="h-3 w-3 mr-1" />
              AI-Powered Results
            </Badge>
          </div>

          <div className="grid gap-4">
            {results.map((result, index) => (
              <Card 
                key={`${result.community.id}-${index}`}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onResultClick?.(result.community)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                        {result.community.name}
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {result.community.city}, {result.community.state}
                        </div>
                        {result.community.properties?.overallRating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {result.community.properties.overallRating.toFixed(1)}
                          </div>
                        )}
                        {result.community.pricing && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {result.community.pricing}
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge className={getRelevanceColor(result.relevanceScore)}>
                      {Math.round(result.relevanceScore * 100)}% match
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Description */}
                  {result.community.description && (
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {result.community.description.length > 200 
                        ? `${result.community.description.slice(0, 200)}...` 
                        : result.community.description
                      }
                    </p>
                  )}

                  {/* Care Types */}
                  {result.community.careTypes.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">Care Types:</span>
                      <span className="text-sm text-gray-600">
                        {formatCareTypes(result.community.careTypes)}
                      </span>
                    </div>
                  )}

                  {/* Amenities */}
                  {result.community.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {result.community.amenities.slice(0, 6).map((amenity, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                      {result.community.amenities.length > 6 && (
                        <Badge variant="outline" className="text-xs">
                          +{result.community.amenities.length - 6} more
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* AI Explanation */}
                  <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-200">
                    <p className="text-xs text-blue-800">
                      <strong>Why this matches:</strong> {result.explanation}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {!isLoading && results.length === 0 && query && !error && (
        <Card className="text-center py-8">
          <CardContent>
            <Brain className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No communities found</h3>
            <p className="text-gray-600 text-sm mb-4">
              Try rephrasing your search or using different keywords.
            </p>
            <div className="text-xs text-gray-500">
              <strong>Tips:</strong> Use natural language like "quiet communities with gardens" 
              or specify care needs like "memory care with outdoor spaces"
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
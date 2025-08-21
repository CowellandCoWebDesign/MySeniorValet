import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, TrendingUp, Lightbulb, Clock, MapPin, DollarSign } from 'lucide-react';

/**
 * Enhanced Search Intelligence Demo Component
 * Showcases the new AI-powered search capabilities
 */

interface SearchResult {
  success: boolean;
  data?: {
    communities: any[];
    insights: {
      searchInterpretation: string;
      marketIntelligence: string;
      personalizedRecommendations: string[];
      alternativeSearches: string[];
    };
    suggestions: any[];
    searchStats: {
      totalMatches: number;
      averagePrice: number;
      popularCareTypes: string[];
      availabilityInsight: string;
    };
  };
}

const EnhancedSearchDemo: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleSmartSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/search/smart-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          userId: 'demo-user',
          context: {
            userPreferences: {
              communitySize: 'medium',
              amenityPriorities: ['dining', 'activities', 'transportation']
            }
          }
        }),
      });

      const result = await response.json();
      setSearchResult(result);
      console.log('Smart search results:', result);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResult({
        success: false
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSuggestions = async () => {
    try {
      const response = await fetch(`/api/search/search-suggestions?q=${encodeURIComponent(query)}&limit=5`);
      const result = await response.json();
      setSuggestions(result.suggestions || []);
    } catch (error) {
      console.error('Suggestions error:', error);
    }
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (value.length > 2) {
      loadSuggestions();
    } else {
      setSuggestions([]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Enhanced Search Intelligence Demo
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Experience AI-powered search with real-time market intelligence and personalized recommendations
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Try: 'memory care in California under $5000' or 'assisted living with pets allowed'"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSmartSearch()}
                className="flex-1"
              />
              <Button 
                onClick={handleSmartSearch} 
                disabled={isLoading || !query.trim()}
              >
                {isLoading ? 'Searching...' : 'Smart Search'}
              </Button>
            </div>

            {/* Search Suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Suggestions:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() => {
                        setQuery(suggestion);
                        setSuggestions([]);
                      }}
                    >
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResult && searchResult.success && searchResult.data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Search Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-2">Search Interpretation</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {searchResult.data.insights.searchInterpretation}
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium text-sm mb-2">Market Intelligence</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {searchResult.data.insights.marketIntelligence}
                </p>
              </div>

              {searchResult.data.insights.personalizedRecommendations.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium text-sm mb-2">Personalized Recommendations</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {searchResult.data.insights.personalizedRecommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Search Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Search Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {searchResult.data.searchStats.totalMatches}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Communities Found
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {searchResult.data.searchStats.averagePrice > 0 
                      ? `$${searchResult.data.searchStats.averagePrice.toLocaleString()}`
                      : 'N/A'
                    }
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Average Price
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium text-sm mb-2">Popular Care Types</h4>
                <div className="flex flex-wrap gap-2">
                  {searchResult.data.searchStats.popularCareTypes.map((type, index) => (
                    <Badge key={index} variant="secondary">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium text-sm mb-2">Availability Insight</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {searchResult.data.searchStats.availabilityInsight}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Alternative Searches */}
          {searchResult.data.insights.alternativeSearches.length > 0 && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Try These Searches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {searchResult.data.insights.alternativeSearches.map((search, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() => setQuery(search)}
                    >
                      {search}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Community Results Preview */}
      {searchResult?.data?.communities && searchResult.data.communities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Community Results ({searchResult.data.communities.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResult.data.communities.slice(0, 6).map((community: any) => (
                <Card key={community.id} className="p-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">{community.name}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {community.city}, {community.state}
                    </p>
                    {community.careTypes && (
                      <div className="flex flex-wrap gap-1">
                        {community.careTypes.slice(0, 2).map((type: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {community.pricing?.baseRate && (
                      <div className="flex items-center gap-1 text-xs">
                        <DollarSign className="h-3 w-3" />
                        Starting at ${community.pricing.baseRate.toLocaleString()}/month
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
            {searchResult.data.communities.length > 6 && (
              <div className="text-center mt-4">
                <Button variant="outline">
                  View All {searchResult.data.communities.length} Results
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedSearchDemo;
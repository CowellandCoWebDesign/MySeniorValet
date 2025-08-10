import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, AlertTriangle, DollarSign, Sparkles, MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface AIInsightsProps {
  bounds?: { north: number; south: number; east: number; west: number };
  communityIds?: number[];
  searchQuery?: string;
}

interface CommunityInsight {
  id: number;
  name: string;
  rating: number;
  price: string;
  careTypes: string[];
  strengths: string[];
  concerns: string[];
  webInsights?: string[];
}

interface SearchInsights {
  topRated: CommunityInsight[];
  bestValue: CommunityInsight[];
  luxuryOptions: CommunityInsight[];
  concernsToNote: CommunityInsight[];
  marketSummary: string;
  careTypeAnalysis: string;
  priceAnalysis: string;
  webSearchInsights?: {
    marketTrends: string;
    localNews: string;
    comparativeAnalysis: string;
    sources: string[];
  };
  recommendations: string[];
  generatedBy: string[];
  timestamp: string;
}

export function AISearchInsights({ bounds, communityIds, searchQuery }: AIInsightsProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const { data, isLoading, error } = useQuery({
    queryKey: ['ai-insights', bounds, communityIds, searchQuery],
    queryFn: async () => {
      const response = await fetch('/api/ai/search-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bounds, communityIds, searchQuery })
      });
      if (!response.ok) {
        throw new Error('Failed to fetch AI insights');
      }
      return response.json();
    },
    enabled: !!(bounds || communityIds || searchQuery),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (!bounds && !communityIds && !searchQuery) {
    return null;
  }

  if (isLoading) {
    return (
      <Card className="mb-6 border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400 animate-pulse" />
            <CardTitle className="text-gray-900 dark:text-gray-100">AI is analyzing communities in view...</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data?.insights) {
    return null;
  }

  const insights: SearchInsights = data.insights;

  return (
    <Card className="mb-6 border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <CardTitle className="text-gray-900 dark:text-gray-100">AI Search Insights</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {insights.generatedBy.map((ai, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                {ai}
              </Badge>
            ))}
          </div>
        </div>
        <CardDescription className="mt-2 text-gray-700 dark:text-gray-300">
          {data.communityCount} communities analyzed • {insights.marketSummary}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className={`grid w-full ${insights.webSearchInsights ? 'grid-cols-5' : 'grid-cols-4'}`}>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="top-picks">Top Picks</TabsTrigger>
            <TabsTrigger value="value">Best Value</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            {insights.webSearchInsights && (
              <TabsTrigger value="web">Web Intel</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                  Price Analysis
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">{insights.priceAnalysis}</p>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Care Type Distribution
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">{insights.careTypeAnalysis}</p>
              </div>
            </div>
            
            {insights.recommendations.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  AI Recommendations
                </h4>
                <ul className="space-y-1">
                  {insights.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400 mt-0.5">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="top-picks" className="space-y-4 mt-4">
            {insights.topRated.length > 0 ? (
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                  Highest Rated Communities
                </h4>
                {insights.topRated.map((community) => (
                  <CommunityInsightCard key={community.id} community={community} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">No highly-rated communities in current view</p>
            )}
          </TabsContent>
          
          <TabsContent value="value" className="space-y-4 mt-4">
            {insights.bestValue.length > 0 ? (
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                  Best Value Communities
                </h4>
                {insights.bestValue.map((community) => (
                  <CommunityInsightCard key={community.id} community={community} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">No value picks found in current view</p>
            )}
          </TabsContent>
          
          <TabsContent value="insights" className="space-y-4 mt-4">
            {insights.luxuryOptions.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Premium Options</h4>
                {insights.luxuryOptions.map((community) => (
                  <CommunityInsightCard key={community.id} community={community} />
                ))}
              </div>
            )}
            
            {insights.concernsToNote.length > 0 && (
              <div className="space-y-3 mt-4">
                <h4 className="font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  Communities to Review Carefully
                </h4>
                {insights.concernsToNote.map((community) => (
                  <CommunityInsightCard key={community.id} community={community} showConcerns />
                ))}
              </div>
            )}
          </TabsContent>
          
          {insights.webSearchInsights && (
            <TabsContent value="web" className="space-y-4 mt-4">
              <div className="space-y-4">
                {insights.webSearchInsights.marketTrends && (
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                      <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      Market Trends & Analysis
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{insights.webSearchInsights.marketTrends}</p>
                  </div>
                )}
                
                {insights.webSearchInsights.localNews && (
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                      <MapPin className="w-4 h-4 text-green-600 dark:text-green-400" />
                      Local Senior Living News
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{insights.webSearchInsights.localNews}</p>
                  </div>
                )}
                
                {insights.webSearchInsights.comparativeAnalysis && (
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                      <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      Comparative Market Intelligence
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{insights.webSearchInsights.comparativeAnalysis}</p>
                  </div>
                )}
                
                {insights.webSearchInsights.sources && insights.webSearchInsights.sources.length > 0 && (
                  <div className="space-y-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Sources</h4>
                    <ul className="space-y-1">
                      {insights.webSearchInsights.sources.map((source, idx) => (
                        <li key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                          <span className="text-purple-500 dark:text-purple-400">•</span>
                          <span className="break-all">{source}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}

function CommunityInsightCard({ community, showConcerns = false }: { 
  community: CommunityInsight; 
  showConcerns?: boolean;
}) {
  const navigate = (id: number) => {
    // Navigate to community detail page
    window.location.href = `/community/${id}`;
  };

  return (
    <Card 
      className="p-3 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer group"
      onClick={() => navigate(community.id)}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h5 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{community.name}</h5>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300">
              {community.rating}/5 ⭐
            </Badge>
            <span className="text-sm text-gray-700 dark:text-gray-300">{community.price}</span>
          </div>
          
          {community.careTypes && community.careTypes.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {community.careTypes.map((type, idx) => (
                <Badge key={idx} className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                  {type}
                </Badge>
              ))}
            </div>
          )}
          
          {/* Show top 2 strengths */}
          {community.strengths.length > 0 && !showConcerns && (
            <div className="space-y-1 mt-2">
              {community.strengths.slice(0, 2).map((strength, idx) => (
                <div key={idx} className="text-xs text-green-700 dark:text-green-300 flex items-start gap-1">
                  <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                  <span>{strength}</span>
                </div>
              ))}
              {community.strengths.length > 2 && (
                <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                  +{community.strengths.length - 2} more features
                </div>
              )}
            </div>
          )}
          
          {/* Show top 2 concerns */}
          {community.concerns.length > 0 && showConcerns && (
            <div className="space-y-1 mt-2 border-t pt-2">
              {community.concerns.slice(0, 2).map((concern, idx) => (
                <div key={idx} className="text-xs text-amber-700 dark:text-amber-300 flex items-start gap-1">
                  <span className="text-amber-600 dark:text-amber-400 mt-0.5">⚠</span>
                  <span>{concern}</span>
                </div>
              ))}
            </div>
          )}
          
          {/* Show web insights if available */}
          {community.webInsights && community.webInsights.length > 0 && (
            <div className="space-y-1 mt-2 border-t pt-2 border-purple-200 dark:border-purple-700">
              <div className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">🌐 Web Intelligence</div>
              {community.webInsights.slice(0, 2).map((insight, idx) => (
                <div key={idx} className="text-xs text-purple-600 dark:text-purple-400 flex items-start gap-1">
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
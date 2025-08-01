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
}

interface SearchInsights {
  topRated: CommunityInsight[];
  bestValue: CommunityInsight[];
  luxuryOptions: CommunityInsight[];
  concernsToNote: CommunityInsight[];
  marketSummary: string;
  careTypeAnalysis: string;
  priceAnalysis: string;
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
      <Card className="mb-6 border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600 animate-pulse" />
            <CardTitle>AI is analyzing communities in view...</CardTitle>
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
    <Card className="mb-6 border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <CardTitle>AI Search Insights</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {insights.generatedBy.map((ai, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {ai}
              </Badge>
            ))}
          </div>
        </div>
        <CardDescription className="mt-2">
          {data.communityCount} communities analyzed • {insights.marketSummary}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="top-picks">Top Picks</TabsTrigger>
            <TabsTrigger value="value">Best Value</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  Price Analysis
                </h4>
                <p className="text-sm text-gray-600">{insights.priceAnalysis}</p>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Care Type Distribution
                </h4>
                <p className="text-sm text-gray-600">{insights.careTypeAnalysis}</p>
              </div>
            </div>
            
            {insights.recommendations.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  AI Recommendations
                </h4>
                <ul className="space-y-1">
                  {insights.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-purple-600 mt-0.5">•</span>
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
                <h4 className="font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  Highest Rated Communities
                </h4>
                {insights.topRated.map((community) => (
                  <CommunityInsightCard key={community.id} community={community} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No highly-rated communities in current view</p>
            )}
          </TabsContent>
          
          <TabsContent value="value" className="space-y-4 mt-4">
            {insights.bestValue.length > 0 ? (
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  Best Value Communities
                </h4>
                {insights.bestValue.map((community) => (
                  <CommunityInsightCard key={community.id} community={community} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No value picks found in current view</p>
            )}
          </TabsContent>
          
          <TabsContent value="insights" className="space-y-4 mt-4">
            {insights.luxuryOptions.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold">Premium Options</h4>
                {insights.luxuryOptions.map((community) => (
                  <CommunityInsightCard key={community.id} community={community} />
                ))}
              </div>
            )}
            
            {insights.concernsToNote.length > 0 && (
              <div className="space-y-3 mt-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Communities to Review Carefully
                </h4>
                {insights.concernsToNote.map((community) => (
                  <CommunityInsightCard key={community.id} community={community} showConcerns />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function CommunityInsightCard({ community, showConcerns = false }: { 
  community: CommunityInsight; 
  showConcerns?: boolean;
}) {
  return (
    <Card className="p-3">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h5 className="font-medium text-sm">{community.name}</h5>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">
              {community.rating}/5 ⭐
            </Badge>
            <span className="text-sm text-gray-600">{community.price}</span>
          </div>
          
          {community.strengths.length > 0 && !showConcerns && (
            <div className="flex flex-wrap gap-1 mt-2">
              {community.strengths.map((strength, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {strength}
                </Badge>
              ))}
            </div>
          )}
          
          {community.concerns.length > 0 && showConcerns && (
            <div className="flex flex-wrap gap-1 mt-2">
              {community.concerns.map((concern, idx) => (
                <Badge key={idx} variant="destructive" className="text-xs">
                  {concern}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
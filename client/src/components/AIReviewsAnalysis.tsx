import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, RefreshCw, Loader2, TrendingUp, AlertTriangle,
  MessageSquare, Star, ThumbsUp, Users, Shield, CheckCircle
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface AIReviewsAnalysisProps {
  communityId: number;
  communityName: string;
  communityCity: string;
  communityState: string;
}

interface ReviewAnalysis {
  grok?: {
    sentiment: string;
    socialInsights: string[];
    twitterMentions?: number;
    recentTrends?: string[];
    sources?: string[];
  };
  gemini?: {
    overallRating: number;
    positiveThemes: string[];
    negativeThemes: string[];
    summary: string;
    recommendations: string[];
  };
  consensus?: {
    sentiment: 'positive' | 'mixed' | 'negative';
    averageRating: number;
    keyHighlights: string[];
    warnings?: string[];
  };
  timestamp?: string;
}

export function AIReviewsAnalysis({ 
  communityId, 
  communityName, 
  communityCity, 
  communityState 
}: AIReviewsAnalysisProps) {
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState<ReviewAnalysis | null>(null);
  const [selectedTab, setSelectedTab] = useState('overview');

  // Mutation to fetch AI reviews analysis
  const fetchAIAnalysisMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(
        'POST',
        `/api/communities/${communityId}/reviews/ai-analysis`,
        {
          communityName,
          communityCity,
          communityState
        }
      );
      return response;
    },
    onSuccess: (data) => {
      setAnalysis(data.analysis);
      toast({
        title: "AI Analysis Complete",
        description: "Social sentiment and review patterns analyzed",
        duration: 3000
      });
    },
    onError: (error: any) => {
      console.error('Error fetching AI reviews analysis:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Could not complete AI analysis",
        variant: "destructive",
        duration: 4000
      });
    }
  });

  const getSentimentColor = (sentiment?: string) => {
    if (!sentiment) return 'text-gray-500';
    if (sentiment === 'positive') return 'text-green-600 dark:text-green-400';
    if (sentiment === 'negative') return 'text-red-600 dark:text-red-400';
    return 'text-yellow-600 dark:text-yellow-400';
  };

  const getSentimentIcon = (sentiment?: string) => {
    if (!sentiment) return <MessageSquare className="h-4 w-4" />;
    if (sentiment === 'positive') return <ThumbsUp className="h-4 w-4" />;
    if (sentiment === 'negative') return <AlertTriangle className="h-4 w-4" />;
    return <TrendingUp className="h-4 w-4" />;
  };

  return (
    <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50/50 to-indigo-50/50 dark:from-purple-950/20 dark:to-indigo-950/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            AI-Powered Review Analysis
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => fetchAIAnalysisMutation.mutate()}
            disabled={fetchAIAnalysisMutation.isPending}
            className="border-purple-300 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/30"
          >
            {fetchAIAnalysisMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Analyze Reviews
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!analysis && !fetchAIAnalysisMutation.isPending && (
          <Alert className="border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/30">
            <Sparkles className="h-4 w-4" />
            <AlertDescription>
              Click "Analyze Reviews" to get AI-powered insights from social media sentiment (Grok) 
              and comprehensive review analysis (Gemini).
            </AlertDescription>
          </Alert>
        )}

        {analysis && (
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-purple-100 dark:bg-purple-900/30">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="grok">Social Sentiment</TabsTrigger>
              <TabsTrigger value="gemini">Review Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              {analysis.consensus && (
                <div className="space-y-4">
                  {/* Overall Sentiment */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-white dark:bg-gray-800 border">
                    <div className="flex items-center gap-3">
                      {getSentimentIcon(analysis.consensus.sentiment)}
                      <div>
                        <div className="font-medium">Overall Sentiment</div>
                        <div className={`text-sm ${getSentimentColor(analysis.consensus.sentiment)}`}>
                          {analysis.consensus.sentiment?.charAt(0).toUpperCase() + analysis.consensus.sentiment?.slice(1)}
                        </div>
                      </div>
                    </div>
                    {analysis.consensus.averageRating > 0 && (
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                        <span className="font-bold text-lg">{analysis.consensus.averageRating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  {/* Key Highlights */}
                  {analysis.consensus.keyHighlights && analysis.consensus.keyHighlights.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400">Key Highlights</h4>
                      <ul className="space-y-1">
                        {analysis.consensus.keyHighlights.map((highlight, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Warnings */}
                  {analysis.consensus.warnings && analysis.consensus.warnings.length > 0 && (
                    <Alert className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/30">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="font-medium mb-1">Areas of Concern:</div>
                        <ul className="space-y-1">
                          {analysis.consensus.warnings.map((warning, idx) => (
                            <li key={idx} className="text-sm">{warning}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="grok" className="space-y-4 mt-4">
              {analysis.grok ? (
                <div className="space-y-4">
                  {/* Social Sentiment */}
                  <div className="p-4 rounded-lg bg-white dark:bg-gray-800 border">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-black text-white">Grok</Badge>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Social Media Analysis</span>
                    </div>
                    
                    {analysis.grok.sentiment && (
                      <div className="mb-3">
                        <span className="text-sm font-medium">Social Sentiment: </span>
                        <span className={getSentimentColor(analysis.grok.sentiment)}>
                          {analysis.grok.sentiment}
                        </span>
                      </div>
                    )}

                    {analysis.grok.twitterMentions && (
                      <div className="mb-3">
                        <span className="text-sm font-medium">Recent Mentions: </span>
                        <span className="text-blue-600 dark:text-blue-400">
                          {analysis.grok.twitterMentions} on X/Twitter
                        </span>
                      </div>
                    )}

                    {analysis.grok.socialInsights && analysis.grok.socialInsights.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium">Social Insights:</h5>
                        <ul className="space-y-1">
                          {analysis.grok.socialInsights.map((insight, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <MessageSquare className="h-3 w-3 mt-1 flex-shrink-0" />
                              <span>{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analysis.grok.recentTrends && analysis.grok.recentTrends.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <h5 className="text-sm font-medium">Recent Trends:</h5>
                        <div className="flex flex-wrap gap-2">
                          {analysis.grok.recentTrends.map((trend, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {trend}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <Alert>
                  <AlertDescription>
                    Social sentiment analysis not available. Click "Analyze Reviews" to fetch data.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="gemini" className="space-y-4 mt-4">
              {analysis.gemini ? (
                <div className="space-y-4">
                  {/* Review Summary */}
                  <div className="p-4 rounded-lg bg-white dark:bg-gray-800 border">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">Gemini</Badge>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Comprehensive Analysis</span>
                    </div>
                    
                    {analysis.gemini.summary && (
                      <p className="text-sm mb-4">{analysis.gemini.summary}</p>
                    )}

                    {analysis.gemini.overallRating > 0 && (
                      <div className="flex items-center gap-2 mb-4">
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                        <span className="font-bold">{analysis.gemini.overallRating.toFixed(1)}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Average Rating</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Positive Themes */}
                      {analysis.gemini.positiveThemes && analysis.gemini.positiveThemes.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium text-green-600 dark:text-green-400">Positive Themes</h5>
                          <ul className="space-y-1">
                            {analysis.gemini.positiveThemes.map((theme, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <ThumbsUp className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                                <span>{theme}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Negative Themes */}
                      {analysis.gemini.negativeThemes && analysis.gemini.negativeThemes.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium text-red-600 dark:text-red-400">Areas for Improvement</h5>
                          <ul className="space-y-1">
                            {analysis.gemini.negativeThemes.map((theme, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <AlertTriangle className="h-3 w-3 text-red-500 mt-1 flex-shrink-0" />
                                <span>{theme}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Recommendations */}
                    {analysis.gemini.recommendations && analysis.gemini.recommendations.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h5 className="text-sm font-medium">AI Recommendations:</h5>
                        <ul className="space-y-1">
                          {analysis.gemini.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <Star className="h-3 w-3 text-yellow-500 mt-1 flex-shrink-0" />
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <Alert>
                  <AlertDescription>
                    Review analysis not available. Click "Analyze Reviews" to fetch data.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Last updated timestamp */}
        {analysis?.timestamp && (
          <div className="text-xs text-center text-gray-500 dark:text-gray-400">
            Last analyzed: {new Date(analysis.timestamp).toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
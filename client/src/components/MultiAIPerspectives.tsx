import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { AI_SERVICES } from './AIServiceBadges';
import { 
  Brain, Globe, Sparkles, Star, Search, 
  TrendingUp, DollarSign, AlertCircle, CheckCircle,
  Clock, RefreshCcw, Loader2
} from 'lucide-react';

interface AIResponse {
  service: string;
  success: boolean;
  content?: string;
  data?: any;
  error?: string;
  model?: string;
  timestamp: string;
  processingTime?: number;
}

interface MultiAIAnalysis {
  query: string;
  responses: {
    perplexity?: AIResponse;
    claude?: AIResponse;
    grok?: AIResponse;
    gemini?: AIResponse;
    deepseek?: AIResponse;
  };
  consensus: {
    pricing?: {
      average: number;
      range: { min: number; max: number };
      confidence: number;
      sources: string[];
    };
    insights: string[];
    recommendations: string[];
    warnings: string[];
  };
  pricingAnalysis?: {
    success: boolean;
    pricing?: {
      average: number;
      median: number;
      min: number;
      max: number;
      confidence: number;
      sources: any[];
      aiServices: number;
    };
  };
  metadata: {
    totalProcessingTime: number;
    successfulServices: number;
    failedServices: number;
    timestamp: string;
  };
  cacheExpiry?: string;
}

interface MultiAIPerspectivesProps {
  communityId: number;
  communityName: string;
  realTimeData?: any;
  onAnalysisComplete?: (data: MultiAIAnalysis) => void;
}

export function MultiAIPerspectives({ 
  communityId, 
  communityName, 
  realTimeData,
  onAnalysisComplete 
}: MultiAIPerspectivesProps) {
  const [analysis, setAnalysis] = useState<MultiAIAnalysis | null>(
    realTimeData?.multiAIAnalysis || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    if (realTimeData?.multiAIAnalysis) {
      setAnalysis(realTimeData.multiAIAnalysis);
      if (onAnalysisComplete) {
        onAnalysisComplete(realTimeData.multiAIAnalysis);
      }
    }
  }, [realTimeData, onAnalysisComplete]);

  const fetchMultiAIAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/communities/${communityId}?multiAI=true`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch multi-AI analysis');
      }

      const data = await response.json();
      
      if (data.realTimeData?.multiAIAnalysis) {
        setAnalysis(data.realTimeData.multiAIAnalysis);
        if (onAnalysisComplete) {
          onAnalysisComplete(data.realTimeData.multiAIAnalysis);
        }
      }
    } catch (err) {
      console.error('Error fetching multi-AI analysis:', err);
      setError('Unable to fetch AI analysis at this time');
    } finally {
      setIsLoading(false);
    }
  };

  const getServiceStatus = (response?: AIResponse) => {
    if (!response) return 'pending';
    if (response.success) return 'success';
    if (response.error) return 'error';
    return 'pending';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const renderAIServiceCard = (serviceName: string, response?: AIResponse) => {
    const service = AI_SERVICES[serviceName as keyof typeof AI_SERVICES];
    if (!service) return null;

    const status = getServiceStatus(response);
    const Icon = service.icon;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className={`${service.bgLight} ${service.borderColor} border-2`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className={`h-5 w-5 ${service.textColor}`} />
                <CardTitle className="text-lg">{service.name}</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                {status === 'success' && (
                  <Badge variant="outline" className="bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                )}
                {status === 'error' && (
                  <Badge variant="outline" className="bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Error
                  </Badge>
                )}
                {status === 'pending' && (
                  <Badge variant="outline" className="bg-gray-50 dark:bg-gray-950/30">
                    Pending
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
          </CardHeader>
          {response && response.success && (
            <CardContent>
              <div className="space-y-3">
                {response.content && (
                  <div className="text-sm space-y-2">
                    <div className="font-medium text-muted-foreground">Analysis:</div>
                    <div className="bg-white dark:bg-gray-950 p-3 rounded-lg">
                      {response.content.split('\n').slice(0, 3).map((line, idx) => (
                        <p key={idx} className="mb-1">{line}</p>
                      ))}
                    </div>
                  </div>
                )}
                {response.processingTime && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {(response.processingTime / 1000).toFixed(1)}s response time
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      </motion.div>
    );
  };

  const renderPricingConsensus = () => {
    if (!analysis?.pricingAnalysis?.pricing) return null;

    const pricing = analysis.pricingAnalysis.pricing;

    return (
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-2 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              AI Pricing Consensus
            </CardTitle>
            <Badge className="bg-blue-600 dark:bg-blue-700">
              {pricing.aiServices} AIs Analyzed
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Average</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {formatPrice(pricing.average)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Median</p>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {formatPrice(pricing.median)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Range</p>
              <p className="text-lg font-semibold">
                {formatPrice(pricing.min)} - {formatPrice(pricing.max)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Confidence</p>
              <div className="flex items-center gap-2">
                <Progress value={pricing.confidence} className="flex-1" />
                <span className="text-sm font-medium">{pricing.confidence}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderInsightsAndWarnings = () => {
    if (!analysis?.consensus) return null;

    const { insights, recommendations, warnings } = analysis.consensus;

    return (
      <div className="space-y-4">
        {insights && insights.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                Key Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {insights.map((insight, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {warnings && warnings.length > 0 && (
          <Alert className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/30">
            <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <AlertDescription>
              <div className="font-medium mb-2">Important Considerations:</div>
              <ul className="space-y-1">
                {warnings.map((warning, idx) => (
                  <li key={idx} className="text-sm">{warning}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  };

  if (!analysis && !isLoading) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Brain className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Multi-AI Analysis Available</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Get comprehensive insights from 5 different AI services
          </p>
          <Button onClick={fetchMultiAIAnalysis} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate AI Analysis
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            Multi-AI Intelligence Report
          </h3>
          {analysis && analysis.metadata?.timestamp && (
            <p className="text-sm text-muted-foreground mt-1">
              Last updated: {new Date(analysis.metadata.timestamp).toLocaleString()}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchMultiAIAnalysis}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCcw className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Error state */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading state */}
      {isLoading && !analysis && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600 dark:text-purple-400" />
              <p className="text-sm text-muted-foreground">Gathering insights from 5 AI services...</p>
              <Progress value={33} className="w-full max-w-xs" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis content */}
      {analysis && (
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="services">AI Services</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {analysis.metadata.successfulServices}
                  </div>
                  <p className="text-xs text-muted-foreground">Active AIs</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {(analysis.metadata.totalProcessingTime / 1000).toFixed(1)}s
                  </div>
                  <p className="text-xs text-muted-foreground">Response Time</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {analysis.consensus?.insights?.length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Key Insights</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {analysis.consensus?.warnings?.length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Alerts</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick insights */}
            {renderInsightsAndWarnings()}
          </TabsContent>

          <TabsContent value="pricing" className="space-y-4">
            {renderPricingConsensus()}
            
            {/* Individual pricing sources */}
            {analysis.pricingAnalysis?.pricing?.sources && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pricing Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.pricingAnalysis.pricing.sources.map((source: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{source.source}</Badge>
                          <span className="font-semibold">{formatPrice(source.price)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate max-w-xs">
                          {source.context}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {renderAIServiceCard('perplexity', analysis.responses.perplexity)}
              {renderAIServiceCard('claude', analysis.responses.claude)}
              {renderAIServiceCard('grok', analysis.responses.grok)}
              {renderAIServiceCard('gemini', analysis.responses.gemini)}
              {renderAIServiceCard('deepseek', analysis.responses.deepseek)}
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            {renderInsightsAndWarnings()}
            
            {/* Recommendations */}
            {analysis.consensus?.recommendations && analysis.consensus.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.consensus.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Cache expiry notice */}
      {analysis?.cacheExpiry && (
        <div className="text-xs text-muted-foreground text-center">
          Analysis cached until {new Date(analysis.cacheExpiry).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}
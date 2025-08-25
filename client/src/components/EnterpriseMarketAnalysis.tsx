import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { 
  TrendingUp, TrendingDown, Target, Building2, DollarSign, Search, 
  Loader2, AlertCircle, BarChart3, Users, Brain, Clock, Lightbulb,
  Building, CheckCircle, Star, FileText, PieChart, LineChart,
  TrendingDownIcon, Eye, Shield, Zap, Trophy, Crown, ArrowRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EnterpriseAnalysis {
  location: string;
  radius: number;
  totalCommunities: number;
  directCompetitors: Array<{
    id: string;
    name: string;
    city: string;
    state_province: string;
    type: string;
    averageCost: number;
    occupancyRate: number;
    rating: number;
    amenityCount: number;
    marketPosition: 'premium' | 'value' | 'luxury' | 'budget';
  }>;
  marketInsights: {
    averageOccupancyRate: number;
    averagePricing: number;
    marketTrend: 'growing' | 'stable' | 'declining';
    demandSupplyRatio: number;
    priceOptimizationRecommendation: string;
    positioning: string;
    opportunities: string[];
    threats: string[];
  };
  competitiveAdvantages: {
    pricingAdvantage: number;
    amenityAdvantage: number;
    locationAdvantage: number;
    brandAdvantage: number;
  };
  revenueOptimization: {
    suggestedPricing: number;
    projectedOccupancy: number;
    revenueImpact: number;
    recommendations: string[];
  };
  marketSegmentation: {
    luxurySegment: number;
    premiumSegment: number;
    valueSegment: number;
    budgetSegment: number;
  };
  lastUpdated: string;
}

interface EnterpriseMarketAnalysisProps {
  communityId: number;
  communityName: string;
  currentLocation: string;
}

export function EnterpriseMarketAnalysis({ 
  communityId, 
  communityName, 
  currentLocation 
}: EnterpriseMarketAnalysisProps) {
  const [analysisRadius, setAnalysisRadius] = useState('10');
  const [analysisType, setAnalysisType] = useState('comprehensive');
  const { toast } = useToast();
  
  // Run enterprise market analysis
  const analysisMutation = useMutation<EnterpriseAnalysis, Error, { 
    communityId: number; 
    location: string; 
    radius: number; 
    type: string 
  }>({
    mutationFn: async (params) => {
      const response = await apiRequest('POST', '/api/enterprise/market-analysis', params);
      return response as EnterpriseAnalysis;
    },
    onSuccess: (data) => {
      toast({
        title: "Analysis Complete",
        description: `Found ${data.totalCommunities} communities in your market area`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/enterprise/market-analysis'] });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: error.message || 'Please try again',
        variant: "destructive"
      });
    }
  });

  const handleRunAnalysis = () => {
    analysisMutation.mutate({
      communityId,
      location: currentLocation,
      radius: parseInt(analysisRadius),
      type: analysisType
    });
  };

  const analysisData = analysisMutation.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950 dark:to-violet-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Brain className="w-6 h-6 text-purple-600" />
            Enterprise Market Analysis
            <Badge variant="outline" className="ml-auto">
              <Crown className="w-3 h-3 mr-1" />
              Platinum Exclusive
            </Badge>
          </CardTitle>
          <CardDescription>
            Advanced competitive intelligence and market positioning analysis for <strong>{communityName}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Analysis Radius</label>
              <Select value={analysisRadius} onValueChange={setAnalysisRadius}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 miles</SelectItem>
                  <SelectItem value="10">10 miles</SelectItem>
                  <SelectItem value="25">25 miles</SelectItem>
                  <SelectItem value="50">50 miles</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Analysis Type</label>
              <Select value={analysisType} onValueChange={setAnalysisType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comprehensive">Comprehensive Analysis</SelectItem>
                  <SelectItem value="pricing">Pricing Strategy Focus</SelectItem>
                  <SelectItem value="positioning">Market Positioning</SelectItem>
                  <SelectItem value="opportunities">Growth Opportunities</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleRunAnalysis} 
                disabled={analysisMutation.isPending}
                className="w-full"
              >
                {analysisMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                Run Analysis
              </Button>
            </div>
          </div>
          
          {analysisMutation.isPending && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
              <p className="text-sm text-muted-foreground">
                Analyzing {analysisRadius}-mile market area around {currentLocation}...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisData && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="competitors">Competitors</TabsTrigger>
            <TabsTrigger value="pricing">Pricing Strategy</TabsTrigger>
            <TabsTrigger value="positioning">Market Position</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Building2 className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold">{analysisData.totalCommunities}</div>
                  <div className="text-sm text-muted-foreground">Total Communities</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Target className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold">{analysisData.directCompetitors.length}</div>
                  <div className="text-sm text-muted-foreground">Direct Competitors</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold">{analysisData.marketInsights.averageOccupancyRate}%</div>
                  <div className="text-sm text-muted-foreground">Avg Occupancy</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <DollarSign className="w-8 h-8 mx-auto mb-2 text-amber-600" />
                  <div className="text-2xl font-bold">${analysisData.marketInsights.averagePricing.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Market Average</div>
                </CardContent>
              </Card>
            </div>

            {/* Market Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                  Market Intelligence Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-green-600" />
                      Market Opportunities
                    </h3>
                    <ul className="space-y-2">
                      {analysisData.marketInsights.opportunities.map((opportunity, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          {opportunity}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      Market Threats
                    </h3>
                    <ul className="space-y-2">
                      {analysisData.marketInsights.threats.map((threat, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          {threat}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="competitors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-red-600" />
                  Direct Competitors Analysis
                </CardTitle>
                <CardDescription>
                  Communities in your immediate market area with similar offerings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisData.directCompetitors.map((competitor) => (
                    <Card key={competitor.id} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{competitor.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {competitor.city}, {competitor.state_province}
                          </p>
                        </div>
                        <Badge variant={
                          competitor.marketPosition === 'luxury' ? 'default' :
                          competitor.marketPosition === 'premium' ? 'secondary' :
                          competitor.marketPosition === 'value' ? 'outline' : 
                          'destructive'
                        }>
                          {competitor.marketPosition}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-semibold">${competitor.averageCost.toLocaleString()}</div>
                          <div className="text-muted-foreground">Monthly</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{competitor.occupancyRate}%</div>
                          <div className="text-muted-foreground">Occupied</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold flex items-center justify-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            {competitor.rating}
                          </div>
                          <div className="text-muted-foreground">Rating</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{competitor.amenityCount}</div>
                          <div className="text-muted-foreground">Amenities</div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    Revenue Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded">
                      <div className="text-lg font-bold text-green-600">
                        ${analysisData.revenueOptimization.suggestedPricing.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Suggested Pricing</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded">
                      <div className="text-lg font-bold text-blue-600">
                        {analysisData.revenueOptimization.projectedOccupancy}%
                      </div>
                      <div className="text-sm text-muted-foreground">Projected Occupancy</div>
                    </div>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded text-center">
                    <div className="text-xl font-bold text-purple-600">
                      +${analysisData.revenueOptimization.revenueImpact.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Annual Revenue Impact</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-purple-600" />
                    Market Segmentation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 bg-amber-50 dark:bg-amber-950 rounded">
                      <span className="text-sm">Luxury ({analysisData.marketSegmentation.luxurySegment}%)</span>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-amber-500 h-2 rounded-full" 
                          style={{ width: `${analysisData.marketSegmentation.luxurySegment}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-950 rounded">
                      <span className="text-sm">Premium ({analysisData.marketSegmentation.premiumSegment}%)</span>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full" 
                          style={{ width: `${analysisData.marketSegmentation.premiumSegment}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-950 rounded">
                      <span className="text-sm">Value ({analysisData.marketSegmentation.valueSegment}%)</span>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${analysisData.marketSegmentation.valueSegment}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-950 rounded">
                      <span className="text-sm">Budget ({analysisData.marketSegmentation.budgetSegment}%)</span>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gray-500 h-2 rounded-full" 
                          style={{ width: `${analysisData.marketSegmentation.budgetSegment}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="positioning" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Competitive Advantages Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {Object.entries(analysisData.competitiveAdvantages).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 border rounded">
                        <span className="font-medium capitalize">
                          {key.replace('Advantage', '')} Advantage
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                value > 75 ? 'bg-green-500' :
                                value > 50 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.max(value, 0)}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold w-8 text-right">{value}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded">
                    <h3 className="font-semibold mb-3">Market Positioning Insight</h3>
                    <p className="text-sm text-muted-foreground">
                      {analysisData.marketInsights.positioning}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  Strategic Recommendations
                </CardTitle>
                <CardDescription>
                  Actionable insights to improve your competitive position
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      Pricing Strategy Recommendations
                    </h3>
                    <div className="space-y-2">
                      {analysisData.revenueOptimization.recommendations.map((rec, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950 rounded">
                          <ArrowRight className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h3 className="font-semibold mb-3">Price Optimization Strategy</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {analysisData.marketInsights.priceOptimizationRecommendation}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
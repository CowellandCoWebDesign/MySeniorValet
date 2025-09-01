import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  DollarSign,
  Users,
  Building,
  Globe,
  Target,
  AlertTriangle,
  Award,
  BarChart3,
  PieChart,
  LineChart,
  FileText,
  ChevronRight,
  Activity,
  Shield,
  Zap,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface KPI {
  metric: string;
  value: number | string;
  trend: number;
  status: 'up' | 'down' | 'stable';
  period: string;
  category: 'revenue' | 'growth' | 'operational' | 'strategic';
  priority: 'critical' | 'high' | 'medium' | 'low';
  insight?: string;
}

interface MarketIntelligence {
  region: string;
  communities: number;
  averagePrice: number;
  occupancyRate: number;
  growthRate: number;
  marketShare: number;
  competitorCount: number;
  opportunity: 'high' | 'medium' | 'low';
}

export const ExecutiveDashboard: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('quarter');

  // Fetch KPIs
  const { data: kpis, isLoading: kpisLoading } = useQuery<KPI[]>({
    queryKey: ['/api/executive/kpis'],
    refetchInterval: 60000 // Refresh every minute
  });

  // Fetch Market Intelligence
  const { data: marketIntel, isLoading: marketLoading } = useQuery<MarketIntelligence[]>({
    queryKey: ['/api/executive/market-intelligence'],
    refetchInterval: 300000 // Refresh every 5 minutes
  });

  // Fetch Strategic Metrics
  const { data: strategicMetrics } = useQuery({
    queryKey: ['/api/executive/strategic-metrics']
  });

  // Fetch Revenue Metrics
  const { data: revenueMetrics } = useQuery({
    queryKey: ['/api/executive/revenue']
  });

  // Fetch Board Report
  const { data: boardReport } = useQuery({
    queryKey: ['/api/executive/board-report'],
    refetchInterval: 3600000 // Refresh every hour
  });

  // Fetch Competitive Analysis
  const { data: competitiveAnalysis } = useQuery({
    queryKey: ['/api/executive/competitive-analysis']
  });

  // Fetch Risk Metrics
  const { data: riskMetrics } = useQuery({
    queryKey: ['/api/executive/risk-metrics']
  });

  const getTrendIcon = (status: string) => {
    switch (status) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'revenue':
        return <DollarSign className="h-5 w-5" />;
      case 'growth':
        return <TrendingUp className="h-5 w-5" />;
      case 'operational':
        return <Activity className="h-5 w-5" />;
      case 'strategic':
        return <Target className="h-5 w-5" />;
      default:
        return <BarChart3 className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'high':
        return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (kpisLoading || marketLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Executive Dashboard
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Fortune 500-level strategic intelligence • Real-time monitoring
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <FileText className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Critical KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {kpis?.slice(0, 8).map((kpi, index) => (
          <Card key={index} className={cn(
            "relative overflow-hidden transition-all hover:shadow-lg",
            kpi.priority === 'critical' && "border-red-500 dark:border-red-700 shadow-red-100 dark:shadow-red-900/20"
          )}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start gap-2">
                <div className="flex items-start gap-2 flex-1">
                  <div className="mt-0.5">
                    {getCategoryIcon(kpi.category)}
                  </div>
                  <CardTitle className="text-sm font-medium line-clamp-2">
                    {kpi.metric}
                  </CardTitle>
                </div>
                <Badge className={cn("text-xs shrink-0", getPriorityColor(kpi.priority))}>
                  {kpi.priority}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold">{kpi.value}</span>
                <div className="flex items-center gap-1">
                  {getTrendIcon(kpi.status)}
                  <span className={cn(
                    "text-sm font-medium",
                    kpi.status === 'up' ? 'text-green-600' : 
                    kpi.status === 'down' ? 'text-red-600' : 
                    'text-gray-600'
                  )}>
                    {Math.abs(kpi.trend)}%
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{kpi.period}</p>
              {kpi.insight && (
                <p className="text-xs text-muted-foreground mt-2 italic">
                  💡 {kpi.insight}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Strategic Intelligence Tabs */}
      <Tabs defaultValue="market" className="w-full">
        <TabsList className="grid grid-cols-5 w-full bg-muted/50">
          <TabsTrigger value="market" className="data-[state=active]:bg-background">
            <span className="hidden sm:inline">Market Intel</span>
            <span className="sm:hidden">Market</span>
          </TabsTrigger>
          <TabsTrigger value="revenue" className="data-[state=active]:bg-background">
            Revenue
          </TabsTrigger>
          <TabsTrigger value="strategic" className="data-[state=active]:bg-background">
            Strategic
          </TabsTrigger>
          <TabsTrigger value="competitive" className="data-[state=active]:bg-background">
            <span className="hidden sm:inline">Competitive</span>
            <span className="sm:hidden">Compete</span>
          </TabsTrigger>
          <TabsTrigger value="risk" className="data-[state=active]:bg-background">
            Risk
          </TabsTrigger>
        </TabsList>

        {/* Market Intelligence Tab */}
        <TabsContent value="market" className="space-y-4 mt-4">
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Top Markets by Opportunity
              </CardTitle>
              <CardDescription>Geographic expansion insights with real-time data</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {marketIntel?.slice(0, 5).map((market, index) => (
                  <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 rounded-lg transition-colors">
                    <div className="flex items-center gap-4 mb-3 sm:mb-0">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-base">{market.region}</p>
                        <p className="text-sm text-muted-foreground">
                          {market.communities.toLocaleString()} communities
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm">
                      <div>
                        <p className="text-muted-foreground">Avg Price</p>
                        <p className="font-semibold">{formatCurrency(market.averagePrice)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Occupancy</p>
                        <p className="font-semibold">{market.occupancyRate.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Growth</p>
                        <p className="font-semibold text-green-600">+{market.growthRate.toFixed(1)}%</p>
                      </div>
                      <Badge variant={
                        market.opportunity === 'high' ? 'default' :
                        market.opportunity === 'medium' ? 'secondary' :
                        'outline'
                      }>
                        {market.opportunity} opportunity
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Analytics Tab */}
        <TabsContent value="revenue" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Monthly Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {formatCurrency(revenueMetrics?.monthly?.current || 0)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Target: {formatCurrency(revenueMetrics?.monthly?.target || 0)}
                </p>
                <Progress 
                  value={(revenueMetrics?.monthly?.current / revenueMetrics?.monthly?.target) * 100 || 0}
                  className="mt-2"
                />
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Quarterly Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {formatCurrency(revenueMetrics?.quarterly?.current || 0)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Target: {formatCurrency(revenueMetrics?.quarterly?.target || 0)}
                </p>
                <Progress 
                  value={(revenueMetrics?.quarterly?.current / revenueMetrics?.quarterly?.target) * 100 || 0}
                  className="mt-2"
                />
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  Annual Run Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {formatCurrency(revenueMetrics?.annual?.projection || 0)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Target: {formatCurrency(revenueMetrics?.annual?.target || 0)}
                </p>
                <Progress 
                  value={(revenueMetrics?.annual?.projection / revenueMetrics?.annual?.target) * 100 || 0}
                  className="mt-2"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Strategic Metrics Tab */}
        <TabsContent value="strategic" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {strategicMetrics?.map((category: any, index: number) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-orange-600" />
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {category.metrics.map((metric: any, idx: number) => (
                    <div key={idx} className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Progress: {metric.progress.toFixed(1)}%</span>
                        <Badge variant={
                          metric.risk === 'on-track' ? 'default' :
                          metric.risk === 'at-risk' ? 'secondary' :
                          'destructive'
                        }>
                          {metric.risk}
                        </Badge>
                      </div>
                      <Progress value={metric.progress} />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Current: {metric.current.toLocaleString()}</span>
                        <span>Target: {metric.target.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Competitive Analysis Tab */}
        <TabsContent value="competitive" className="space-y-4 mt-4">
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-indigo-600" />
                Market Position
              </CardTitle>
              <CardDescription>Competitive landscape analysis with real market data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                  <div>
                    <p className="font-semibold">Market Leadership Position</p>
                    <p className="text-sm text-muted-foreground">
                      Rank #{competitiveAnalysis?.market_position?.rank} of {competitiveAnalysis?.market_position?.total_competitors} competitors
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{competitiveAnalysis?.market_position?.market_share}%</p>
                    <p className="text-sm text-muted-foreground">Market Share</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Competitive Advantages</h4>
                  <div className="space-y-2">
                    {competitiveAnalysis?.competitive_advantages?.map((advantage: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{advantage}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Assessment Tab */}
        <TabsContent value="risk" className="space-y-4 mt-4">
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Enterprise Risk Dashboard
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <span>Overall Risk Score: {riskMetrics?.overall_risk_score}/10</span>
                <Badge variant={riskMetrics?.trend === 'Decreasing' ? 'default' : 'destructive'}>
                  {riskMetrics?.trend}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['operational_risks', 'financial_risks', 'compliance_risks'].map((riskType) => (
                  <div key={riskType}>
                    <h4 className="font-semibold mb-2 capitalize">
                      {riskType.replace('_', ' ')}
                    </h4>
                    <div className="space-y-2">
                      {riskMetrics?.[riskType]?.map((risk: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 rounded-lg transition-colors">
                          <div className="flex items-center gap-2">
                            <Shield className={cn(
                              "h-4 w-4",
                              risk.likelihood === 'Low' ? 'text-green-600' :
                              risk.likelihood === 'Medium' ? 'text-yellow-600' :
                              'text-red-600'
                            )} />
                            <span className="text-sm">{risk.risk}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              risk.impact === 'Low' ? 'outline' :
                              risk.impact === 'Medium' ? 'secondary' :
                              'destructive'
                            }>
                              {risk.impact} Impact
                            </Badge>
                            <Badge variant="outline">
                              {risk.likelihood} Likelihood
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Board Report Summary */}
      {boardReport && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Board Report Summary</CardTitle>
                <CardDescription>Executive briefing for Q{Math.ceil((new Date().getMonth() + 1) / 3)} 2025</CardDescription>
              </div>
              <Button variant="default">
                View Full Report
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-sm">{boardReport.executive_summary}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {boardReport.strategic_initiatives?.map((initiative: any, idx: number) => (
                  <div key={idx} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm">{initiative.name}</span>
                      <Badge variant={initiative.status === 'Completed' ? 'default' : 'secondary'}>
                        {initiative.status}
                      </Badge>
                    </div>
                    <Progress value={initiative.completion} className="mb-2" />
                    <p className="text-xs text-muted-foreground">
                      Impact: {initiative.impact}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Key Recommendations</h4>
                <ul className="space-y-1">
                  {boardReport.recommendations?.slice(0, 3).map((rec: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Zap className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
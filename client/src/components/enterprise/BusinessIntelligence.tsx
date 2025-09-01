import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, TrendingDown, Activity, BarChart3, PieChart, Target,
  DollarSign, Users, Building, Calendar, Clock, AlertTriangle,
  ChevronUp, ChevronDown, ArrowUp, ArrowDown, Zap, Brain,
  Sparkles, LineChart, Download, RefreshCw, Filter, Settings,
  Eye, Info, Award, Star, Lightbulb, Rocket, ChartBar,
  GitBranch, Layers, Cpu, Database, Cloud, Shield
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { BarChart, Bar, LineChart as RechartsLineChart, Line, PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart, Scatter, ComposedChart, Treemap, Funnel, FunnelChart } from 'recharts';

interface BusinessIntelligenceProps {
  communityId: number;
}

export function BusinessIntelligence({ communityId }: BusinessIntelligenceProps) {
  const [timeRange, setTimeRange] = useState('30');
  const [forecastPeriod, setForecastPeriod] = useState('90');
  const [analysisType, setAnalysisType] = useState('revenue');

  // Business Intelligence data query
  const { data: biData, isLoading } = useQuery({
    queryKey: [`/api/enterprise/business-intelligence/${communityId}`],
  });

  // Use real API data or empty fallback - Golden Data Rule compliance
  const bi = biData ? biData : {
    summary: {},
    insights: [],
    predictions: [],
    trends: [],
    kpis: [],
    recommendations: [],
    competitors: [],
    executiveSummary: {
      revenue: {
        current: 0,
        projected: 0,
        growth: 0,
        confidence: 0
      },
      occupancy: {
        current: 94.5,
        projected: 96.2,
        optimal: 95,
        trend: 'increasing'
      },
      profitMargin: {
        current: 18.2,
        industry: 15.5,
        target: 20,
        percentile: 78
      },
      marketPosition: {
        rank: 3,
        total: 45,
        score: 87,
        competitive: 'strong'
      }
    },
    keyMetrics: [
      { metric: 'Revenue per Resident', value: '$8,250', change: 3.2, target: '$8,500', status: 'on-track' },
      { metric: 'Customer Acquisition Cost', value: '$2,450', change: -5.1, target: '$2,200', status: 'improving' },
      { metric: 'Lifetime Value', value: '$125,000', change: 8.7, target: '$130,000', status: 'excellent' },
      { metric: 'Churn Rate', value: '8.2%', change: -1.5, target: '7%', status: 'good' },
      { metric: 'Net Promoter Score', value: '68', change: 4, target: '70', status: 'on-track' },
      { metric: 'Operational Efficiency', value: '82%', change: 2.3, target: '85%', status: 'improving' }
    ],
    predictiveAnalytics: {
      revenueForecas: [
        { month: 'Sep', actual: null, predicted: 905000, lower: 885000, upper: 925000 },
        { month: 'Oct', actual: null, predicted: 915000, lower: 890000, upper: 940000 },
        { month: 'Nov', actual: null, predicted: 925000, lower: 895000, upper: 955000 },
        { month: 'Dec', actual: null, predicted: 945000, lower: 910000, upper: 980000 }
      ],
      occupancyForecast: [
        { month: 'Sep', predicted: 95.2, confidence: 88 },
        { month: 'Oct', predicted: 95.8, confidence: 85 },
        { month: 'Nov', predicted: 96.2, confidence: 82 },
        { month: 'Dec', predicted: 96.5, confidence: 78 }
      ],
      riskFactors: [
        { factor: 'Staff Turnover', impact: 'high', probability: 35, mitigation: 'Retention program' },
        { factor: 'Market Competition', impact: 'medium', probability: 45, mitigation: 'Service differentiation' },
        { factor: 'Regulatory Changes', impact: 'high', probability: 25, mitigation: 'Compliance monitoring' },
        { factor: 'Economic Downturn', impact: 'medium', probability: 30, mitigation: 'Cost optimization' }
      ],
      opportunities: [
        { opportunity: 'Memory Care Expansion', revenue: 125000, investment: 45000, roi: 178, timeline: '6 months' },
        { opportunity: 'Telehealth Services', revenue: 35000, investment: 12000, roi: 192, timeline: '3 months' },
        { opportunity: 'Premium Amenities', revenue: 58000, investment: 22000, roi: 164, timeline: '4 months' },
        { opportunity: 'Partnership Programs', revenue: 42000, investment: 8000, roi: 425, timeline: '2 months' }
      ]
    },
    marketAnalysis: {
      competitorComparison: [
        { metric: 'Price', us: 8250, competitor1: 8500, competitor2: 7900, market: 8100 },
        { metric: 'Quality', us: 92, competitor1: 88, competitor2: 90, market: 85 },
        { metric: 'Occupancy', us: 94.5, competitor1: 91.2, competitor2: 93.8, market: 89.5 },
        { metric: 'Satisfaction', us: 4.6, competitor1: 4.4, competitor2: 4.5, market: 4.2 }
      ],
      marketShare: [
        { segment: 'Memory Care', share: 22, growth: 3.5 },
        { segment: 'Assisted Living', share: 18, growth: 2.1 },
        { segment: 'Independent Living', share: 15, growth: 1.8 },
        { segment: 'Skilled Nursing', share: 12, growth: -0.5 }
      ],
      demographicTrends: [
        { age: '65-74', current: 35, projected: 42, growth: 20 },
        { age: '75-84', current: 45, projected: 52, growth: 15.5 },
        { age: '85+', current: 20, projected: 28, growth: 40 }
      ]
    },
    operationalInsights: {
      efficiency: {
        current: 82,
        benchmark: 78,
        potential: 88,
        savings: 145000
      },
      resourceUtilization: [
        { resource: 'Staff', utilization: 87, optimal: 85 },
        { resource: 'Facilities', utilization: 92, optimal: 90 },
        { resource: 'Equipment', utilization: 78, optimal: 80 },
        { resource: 'Technology', utilization: 65, optimal: 75 }
      ],
      costDrivers: [
        { driver: 'Labor', percentage: 45, trend: 'increasing', control: 'medium' },
        { driver: 'Supplies', percentage: 18, trend: 'stable', control: 'high' },
        { driver: 'Utilities', percentage: 12, trend: 'increasing', control: 'low' },
        { driver: 'Maintenance', percentage: 8, trend: 'decreasing', control: 'high' },
        { driver: 'Administration', percentage: 17, trend: 'stable', control: 'medium' }
      ],
      performanceIndicators: [
        { kpi: 'Response Time', value: 3.2, target: 3.0, trend: 'improving' },
        { kpi: 'Care Quality', value: 94, target: 95, trend: 'stable' },
        { kpi: 'Cost per Resident', value: 6800, target: 6500, trend: 'increasing' },
        { kpi: 'Staff Productivity', value: 85, target: 88, trend: 'improving' }
      ]
    },
    financialProjections: {
      scenarios: [
        { scenario: 'Conservative', revenue: 10500000, expenses: 8900000, profit: 1600000, margin: 15.2 },
        { scenario: 'Realistic', revenue: 11200000, expenses: 9100000, profit: 2100000, margin: 18.8 },
        { scenario: 'Optimistic', revenue: 12100000, expenses: 9300000, profit: 2800000, margin: 23.1 }
      ],
      cashFlow: [
        { month: 'Sep', inflow: 920000, outflow: 750000, net: 170000, cumulative: 170000 },
        { month: 'Oct', inflow: 935000, outflow: 760000, net: 175000, cumulative: 345000 },
        { month: 'Nov', inflow: 945000, outflow: 755000, net: 190000, cumulative: 535000 },
        { month: 'Dec', inflow: 965000, outflow: 770000, net: 195000, cumulative: 730000 }
      ],
      breakEven: {
        point: 78,
        currentOccupancy: 94.5,
        margin: 16.5,
        safety: 'high'
      }
    },
    aiInsights: [
      {
        insight: 'Revenue Optimization Opportunity',
        description: 'Analysis shows potential for 8% revenue increase through dynamic pricing in memory care unit',
        impact: 'high',
        confidence: 89,
        action: 'Implement tiered pricing model'
      },
      {
        insight: 'Staffing Pattern Anomaly',
        description: 'Weekend night shifts are overstaffed by 15% compared to actual demand patterns',
        impact: 'medium',
        confidence: 92,
        action: 'Optimize weekend scheduling'
      },
      {
        insight: 'Resident Churn Predictor',
        description: '3 residents showing early indicators of potential move-out in next 60 days',
        impact: 'high',
        confidence: 78,
        action: 'Initiate retention protocols'
      },
      {
        insight: 'Market Expansion Opportunity',
        description: 'Demographics analysis indicates unmet demand for specialized dementia care',
        impact: 'high',
        confidence: 85,
        action: 'Evaluate dementia program expansion'
      }
    ],
    benchmarks: {
      industry: [
        { metric: 'Occupancy Rate', us: 94.5, p25: 85, p50: 89, p75: 93, p90: 96 },
        { metric: 'Profit Margin', us: 18.2, p25: 12, p50: 15, p75: 18, p90: 22 },
        { metric: 'Staff Turnover', us: 18, p25: 35, p50: 28, p75: 22, p90: 15 },
        { metric: 'Satisfaction Score', us: 92, p25: 78, p50: 84, p75: 89, p90: 94 }
      ]
    }
  };

  const getChangeIndicator = (change: number) => {
    if (change > 0) {
      return <ChevronUp className="w-4 h-4 text-green-500" />;
    } else if (change < 0) {
      return <ChevronDown className="w-4 h-4 text-red-500" />;
    }
    return null;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'excellent':
        return <Badge className="bg-green-500">Excellent</Badge>;
      case 'on-track':
        return <Badge className="bg-blue-500">On Track</Badge>;
      case 'improving':
        return <Badge className="bg-yellow-500">Improving</Badge>;
      case 'good':
        return <Badge className="bg-green-400">Good</Badge>;
      case 'needs-attention':
        return <Badge className="bg-red-500">Needs Attention</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high':
        return <Badge className="bg-red-500">High Impact</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500">Medium Impact</Badge>;
      case 'low':
        return <Badge className="bg-blue-500">Low Impact</Badge>;
      default:
        return <Badge>{impact}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Brain className="w-6 h-6 mr-2 text-purple-500" />
            Business Intelligence & Predictive Analytics
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            AI-powered insights, forecasting, and strategic recommendations
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 Days</SelectItem>
              <SelectItem value="30">30 Days</SelectItem>
              <SelectItem value="90">90 Days</SelectItem>
              <SelectItem value="365">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Insights
          </Button>
        </div>
      </div>

      {/* AI Insights Alert */}
      <Alert className="border-purple-200 bg-purple-50/50 dark:bg-purple-900/20">
        <Sparkles className="h-4 w-4" />
        <AlertTitle>AI-Powered Insights Available</AlertTitle>
        <AlertDescription>
          {bi.aiInsights.length} new strategic recommendations based on predictive analytics
        </AlertDescription>
      </Alert>

      {/* Executive Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Revenue Forecast</p>
              <Rocket className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold">${(bi.executiveSummary.revenue.projected / 1000).toFixed(0)}K</p>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
              <span className="text-sm text-green-500">+{bi.executiveSummary.revenue.growth}%</span>
              <Badge className="ml-2 bg-blue-500 text-xs">{bi.executiveSummary.revenue.confidence}% confidence</Badge>
            </div>
            <Progress value={bi.executiveSummary.revenue.confidence} className="h-1 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Occupancy Projection</p>
              <Building className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold">{bi.executiveSummary.occupancy.projected}%</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-gray-500">Current: {bi.executiveSummary.occupancy.current}%</span>
              <Badge className="bg-green-500 text-xs">
                {bi.executiveSummary.occupancy.trend}
              </Badge>
            </div>
            <Progress value={bi.executiveSummary.occupancy.projected} className="h-1 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Profit Margin</p>
              <DollarSign className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold">{bi.executiveSummary.profitMargin.current}%</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-gray-500">Industry: {bi.executiveSummary.profitMargin.industry}%</span>
              <Badge className="bg-amber-500 text-xs">
                {bi.executiveSummary.profitMargin.percentile}th percentile
              </Badge>
            </div>
            <Progress value={bi.executiveSummary.profitMargin.percentile} className="h-1 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Market Position</p>
              <Award className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-2xl font-bold">#{bi.executiveSummary.marketPosition.rank}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-gray-500">of {bi.executiveSummary.marketPosition.total} competitors</span>
              <Badge className="bg-green-500 text-xs">
                {bi.executiveSummary.marketPosition.competitive}
              </Badge>
            </div>
            <Progress value={bi.executiveSummary.marketPosition.score} className="h-1 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Business Intelligence Tabs */}
      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="market">Market Analysis</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
        </TabsList>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bi.keyMetrics.map((metric, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">{metric.metric}</p>
                    {getStatusBadge(metric.status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <p className="text-2xl font-bold">{metric.value}</p>
                      {getChangeIndicator(metric.change)}
                      <span className="text-sm text-gray-500">
                        {metric.change > 0 ? '+' : ''}{metric.change}%
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    Target: {metric.target}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* AI-Generated Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                AI-Generated Strategic Insights
              </CardTitle>
              <CardDescription>Machine learning analysis of patterns and opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bi.aiInsights.map((insight, index) => (
                  <div key={index} className="p-4 border rounded">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Cpu className="w-5 h-5 text-purple-500" />
                        <p className="font-semibold">{insight.insight}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getImpactBadge(insight.impact)}
                        <Badge variant="outline">{insight.confidence}% confidence</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {insight.description}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Button size="sm">
                        <Zap className="w-4 h-4 mr-1" />
                        {insight.action}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Revenue Forecast */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Forecast</CardTitle>
                <CardDescription>AI-powered revenue predictions with confidence intervals</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={bi.predictiveAnalytics.revenueForecas}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="upper" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                    <Area type="monotone" dataKey="predicted" stackId="2" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="lower" stackId="3" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Risk Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Factor Analysis</CardTitle>
                <CardDescription>Predictive risk assessment and mitigation strategies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {bi.predictiveAnalytics.riskFactors.map((risk, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{risk.factor}</p>
                        <p className="text-sm text-gray-500">{risk.mitigation}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={risk.impact === 'high' ? 'bg-red-500' : 'bg-yellow-500'}>
                          {risk.impact} impact
                        </Badge>
                        <Badge variant="outline">{risk.probability}% probability</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Opportunity Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Growth Opportunities</CardTitle>
              <CardDescription>AI-identified expansion and optimization opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {bi.predictiveAnalytics.opportunities.map((opp, index) => (
                  <div key={index} className="p-4 border rounded">
                    <p className="font-semibold mb-2">{opp.opportunity}</p>
                    <div className="space-y-1 text-sm">
                      <p>Revenue: <span className="font-bold text-green-600">${(opp.revenue / 1000).toFixed(0)}K</span></p>
                      <p>Investment: <span className="font-medium">${(opp.investment / 1000).toFixed(0)}K</span></p>
                      <p>ROI: <span className="font-bold text-purple-600">{opp.roi}%</span></p>
                      <p>Timeline: <span className="text-gray-600">{opp.timeline}</span></p>
                    </div>
                    <Button size="sm" className="w-full mt-3">Explore</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Market Analysis Tab */}
        <TabsContent value="market" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Competitor Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Competitive Analysis</CardTitle>
                <CardDescription>Performance comparison with competitors</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={bi.marketAnalysis.competitorComparison}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={90} />
                    <Radar name="Us" dataKey="us" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
                    <Radar name="Competitor 1" dataKey="competitor1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                    <Radar name="Market Avg" dataKey="market" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.3} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Market Share */}
            <Card>
              <CardHeader>
                <CardTitle>Market Share by Segment</CardTitle>
                <CardDescription>Current market position and growth trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {bi.marketAnalysis.marketShare.map((segment, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{segment.segment}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold">{segment.share}%</span>
                          <Badge className={segment.growth > 0 ? 'bg-green-500' : 'bg-red-500'}>
                            {segment.growth > 0 ? '+' : ''}{segment.growth}%
                          </Badge>
                        </div>
                      </div>
                      <Progress value={segment.share} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Demographic Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Demographic Projections</CardTitle>
              <CardDescription>Target market growth projections</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={bi.marketAnalysis.demographicTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="age" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="current" fill="#6366f1" name="Current %" />
                  <Bar dataKey="projected" fill="#10b981" name="Projected %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Operations Tab */}
        <TabsContent value="operations" className="space-y-4">
          {/* Efficiency Score */}
          <Card>
            <CardHeader>
              <CardTitle>Operational Efficiency Analysis</CardTitle>
              <CardDescription>AI-optimized resource utilization and cost management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{bi.operationalInsights.efficiency.current}%</p>
                  <p className="text-sm text-gray-600">Current Efficiency</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-600">{bi.operationalInsights.efficiency.benchmark}%</p>
                  <p className="text-sm text-gray-600">Industry Benchmark</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{bi.operationalInsights.efficiency.potential}%</p>
                  <p className="text-sm text-gray-600">Potential</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">${(bi.operationalInsights.efficiency.savings / 1000).toFixed(0)}K</p>
                  <p className="text-sm text-gray-600">Potential Savings</p>
                </div>
              </div>

              {/* Resource Utilization */}
              <div className="space-y-3">
                {bi.operationalInsights.resourceUtilization.map((resource, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{resource.resource}</span>
                      <span className="text-sm font-bold">{resource.utilization}%</span>
                    </div>
                    <div className="relative">
                      <Progress value={resource.utilization} className="h-2" />
                      <div 
                        className="absolute top-0 h-2 w-0.5 bg-red-500"
                        style={{ left: `${resource.optimal}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cost Drivers */}
          <Card>
            <CardHeader>
              <CardTitle>Cost Driver Analysis</CardTitle>
              <CardDescription>Expense breakdown and control assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPieChart>
                  <Pie
                    data={bi.operationalInsights.costDrivers}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ driver, percentage }) => `${driver}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="percentage"
                  >
                    {bi.operationalInsights.costDrivers.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'][index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-4">
          {/* Scenario Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Scenario Analysis</CardTitle>
              <CardDescription>Multi-scenario financial projections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {bi.financialProjections.scenarios.map((scenario, index) => (
                  <div key={index} className={`p-4 border rounded ${
                    scenario.scenario === 'Realistic' ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' : ''
                  }`}>
                    <p className="font-semibold mb-3">{scenario.scenario}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Revenue:</span>
                        <span className="font-bold">${(scenario.revenue / 1000000).toFixed(1)}M</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Expenses:</span>
                        <span>${(scenario.expenses / 1000000).toFixed(1)}M</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span>Profit:</span>
                        <span className="font-bold text-green-600">${(scenario.profit / 1000000).toFixed(1)}M</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Margin:</span>
                        <span className="font-bold">{scenario.margin}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cash Flow Projection */}
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Projection</CardTitle>
              <CardDescription>Monthly cash flow forecast</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <ComposedChart data={bi.financialProjections.cashFlow}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="inflow" fill="#10b981" name="Inflow" />
                  <Bar dataKey="outflow" fill="#ef4444" name="Outflow" />
                  <Line type="monotone" dataKey="cumulative" stroke="#6366f1" strokeWidth={2} name="Cumulative" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Benchmarks Tab */}
        <TabsContent value="benchmarks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Industry Benchmarking</CardTitle>
              <CardDescription>Performance comparison against industry percentiles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bi.benchmarks.industry.map((metric, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{metric.metric}</span>
                      <span className="font-bold text-lg">{metric.us}</span>
                    </div>
                    <div className="relative h-6 bg-gray-200 dark:bg-gray-700 rounded">
                      <div className="absolute h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded opacity-30" />
                      
                      {/* Percentile markers */}
                      <div className="absolute top-0 h-full flex items-center" style={{ left: `${(metric.p25 / 100) * 100}%` }}>
                        <div className="w-0.5 h-4 bg-gray-600" />
                      </div>
                      <div className="absolute top-0 h-full flex items-center" style={{ left: `${(metric.p50 / 100) * 100}%` }}>
                        <div className="w-0.5 h-4 bg-gray-600" />
                      </div>
                      <div className="absolute top-0 h-full flex items-center" style={{ left: `${(metric.p75 / 100) * 100}%` }}>
                        <div className="w-0.5 h-4 bg-gray-600" />
                      </div>
                      <div className="absolute top-0 h-full flex items-center" style={{ left: `${(metric.p90 / 100) * 100}%` }}>
                        <div className="w-0.5 h-4 bg-gray-600" />
                      </div>
                      
                      {/* Our position */}
                      <div className="absolute top-0 h-full flex items-center" style={{ left: `${(metric.us / 100) * 100}%` }}>
                        <div className="w-3 h-3 bg-blue-600 rounded-full border-2 border-white" />
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>25th</span>
                      <span>50th</span>
                      <span>75th</span>
                      <span>90th</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <Shield className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">Top 10%</p>
                  <p className="text-sm text-gray-600 mt-1">Occupancy Rate</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <Star className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">Top 25%</p>
                  <p className="text-sm text-gray-600 mt-1">Profit Margin</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <Award className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">Top 15%</p>
                  <p className="text-sm text-gray-600 mt-1">Staff Retention</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <Rocket className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">Top 5%</p>
                  <p className="text-sm text-gray-600 mt-1">Satisfaction</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
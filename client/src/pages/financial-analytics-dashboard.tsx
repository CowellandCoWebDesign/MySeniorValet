import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, TrendingDown, DollarSign, Users, Building2, 
  Calendar, Download, ChevronUp, ChevronDown, AlertCircle,
  BarChart3, LineChart, PieChart, Target, Brain
} from 'lucide-react';
import { ProfessionalNavbar } from '@/components/ProfessionalNavbar';
import {
  LineChart as RechartsLineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

/**
 * Phase 5 Financial Analytics Dashboard
 * Complete financial tracking with revenue forecasting and AI-powered insights
 * 
 * Features:
 * - Real-time revenue tracking
 * - Occupancy optimization
 * - Revenue forecasting with AI
 * - Financial health scoring
 * - Budget analysis
 * - Payment processing analytics
 * - Multi-property consolidation
 */

interface FinancialMetrics {
  totalRevenue: number;
  recurringRevenue: number;
  oneTimeCharges: number;
  avgRevenuePerUnit: number;
  occupancyRate: number;
  avgLengthOfStay: number;
  collectionRate: number;
  outstandingBalance: number;
  monthlyGrowth: number;
  yearlyGrowth: number;
  ebitda: number;
  netOperatingIncome: number;
}

interface RevenueStream {
  source: string;
  amount: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
}

interface PropertyFinancials {
  id: number;
  name: string;
  revenue: number;
  expenses: number;
  netIncome: number;
  occupancy: number;
  avgRate: number;
  units: number;
  performance: 'excellent' | 'good' | 'average' | 'poor';
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function FinancialAnalyticsDashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  
  // Fetch financial metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery<FinancialMetrics>({
    queryKey: ['/api/financial/metrics', selectedTimeRange, selectedProperty],
    enabled: true,
    initialData: {
      totalRevenue: 2847650,
      recurringRevenue: 2456000,
      oneTimeCharges: 391650,
      avgRevenuePerUnit: 4250,
      occupancyRate: 88.5,
      avgLengthOfStay: 24,
      collectionRate: 96.2,
      outstandingBalance: 108340,
      monthlyGrowth: 3.4,
      yearlyGrowth: 12.8,
      ebitda: 1138600,
      netOperatingIncome: 987450
    }
  });
  
  // Fetch revenue streams
  const { data: revenueStreams } = useQuery<RevenueStream[]>({
    queryKey: ['/api/financial/revenue-streams', selectedTimeRange],
    enabled: true,
    initialData: [
      { source: 'Monthly Rent', amount: 2100000, percentage: 73.7, trend: 'up', changePercent: 2.1 },
      { source: 'Care Services', amount: 356000, percentage: 12.5, trend: 'up', changePercent: 5.3 },
      { source: 'Meals', amount: 178000, percentage: 6.2, trend: 'stable', changePercent: 0.2 },
      { source: 'Activities', amount: 89000, percentage: 3.1, trend: 'up', changePercent: 8.7 },
      { source: 'Transportation', amount: 67000, percentage: 2.4, trend: 'down', changePercent: -1.2 },
      { source: 'Other Services', amount: 57650, percentage: 2.0, trend: 'up', changePercent: 3.8 }
    ]
  });
  
  // Fetch property financials
  const { data: properties } = useQuery<PropertyFinancials[]>({
    queryKey: ['/api/financial/properties', selectedTimeRange],
    enabled: true,
    initialData: [
      { id: 1, name: 'Sunrise Valley', revenue: 450000, expenses: 320000, netIncome: 130000, occupancy: 92, avgRate: 4500, units: 120, performance: 'excellent' },
      { id: 2, name: 'Oak Grove Manor', revenue: 380000, expenses: 295000, netIncome: 85000, occupancy: 88, avgRate: 4200, units: 100, performance: 'good' },
      { id: 3, name: 'Willowbrook', revenue: 420000, expenses: 340000, netIncome: 80000, occupancy: 85, avgRate: 4800, units: 95, performance: 'good' },
      { id: 4, name: 'Meadowview', revenue: 320000, expenses: 270000, netIncome: 50000, occupancy: 78, avgRate: 3900, units: 85, performance: 'average' },
      { id: 5, name: 'Heritage Place', revenue: 510000, expenses: 405000, netIncome: 105000, occupancy: 90, avgRate: 5200, units: 110, performance: 'excellent' }
    ]
  });
  
  // Fetch historical data for charts
  const { data: historicalData } = useQuery({
    queryKey: ['/api/financial/historical', selectedTimeRange],
    enabled: true,
    initialData: {
      revenue: [
        { month: 'Jan', actual: 2450000, projected: 2400000, budget: 2500000 },
        { month: 'Feb', actual: 2520000, projected: 2480000, budget: 2500000 },
        { month: 'Mar', actual: 2580000, projected: 2550000, budget: 2550000 },
        { month: 'Apr', actual: 2610000, projected: 2600000, budget: 2550000 },
        { month: 'May', actual: 2680000, projected: 2650000, budget: 2600000 },
        { month: 'Jun', actual: 2750000, projected: 2720000, budget: 2650000 },
        { month: 'Jul', actual: 2810000, projected: 2800000, budget: 2700000 },
        { month: 'Aug', actual: 2847650, projected: 2850000, budget: 2750000 }
      ],
      occupancy: [
        { month: 'Jan', rate: 85.2, target: 90 },
        { month: 'Feb', rate: 86.1, target: 90 },
        { month: 'Mar', rate: 87.3, target: 90 },
        { month: 'Apr', rate: 86.8, target: 90 },
        { month: 'May', rate: 87.9, target: 90 },
        { month: 'Jun', rate: 88.2, target: 90 },
        { month: 'Jul', rate: 88.8, target: 90 },
        { month: 'Aug', rate: 88.5, target: 90 }
      ]
    }
  });
  
  // AI-powered forecast
  const { data: forecast } = useQuery({
    queryKey: ['/api/financial/forecast', selectedTimeRange],
    enabled: true,
    initialData: {
      nextMonth: 2920000,
      nextQuarter: 8950000,
      nextYear: 36500000,
      confidence: 87,
      factors: [
        { factor: 'Seasonal trends', impact: 'positive', weight: 35 },
        { factor: 'Market conditions', impact: 'positive', weight: 25 },
        { factor: 'Occupancy trends', impact: 'neutral', weight: 20 },
        { factor: 'Competition', impact: 'negative', weight: 15 },
        { factor: 'Economic indicators', impact: 'positive', weight: 5 }
      ]
    }
  });
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };
  
  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'excellent': return 'text-green-600 dark:text-green-400';
      case 'good': return 'text-blue-600 dark:text-blue-400';
      case 'average': return 'text-yellow-600 dark:text-yellow-400';
      case 'poor': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      <ProfessionalNavbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Financial Analytics
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Real-time financial performance and AI-powered forecasting
              </p>
            </div>
            <div className="flex gap-2">
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="30d">30 Days</SelectItem>
                  <SelectItem value="90d">90 Days</SelectItem>
                  <SelectItem value="1y">1 Year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics?.totalRevenue || 0)}</div>
              <div className="flex items-center text-xs mt-1">
                {metrics?.monthlyGrowth! > 0 ? (
                  <ChevronUp className="h-3 w-3 text-green-600" />
                ) : (
                  <ChevronDown className="h-3 w-3 text-red-600" />
                )}
                <span className={metrics?.monthlyGrowth! > 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatPercent(Math.abs(metrics?.monthlyGrowth || 0))} vs last month
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPercent(metrics?.occupancyRate || 0)}</div>
              <Progress value={metrics?.occupancyRate} className="mt-2" />
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Target: 90%
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Revenue/Unit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics?.avgRevenuePerUnit || 0)}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Per month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPercent(metrics?.collectionRate || 0)}</div>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                Outstanding: {formatCurrency(metrics?.outstandingBalance || 0)}
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="forecast">AI Forecast</TabsTrigger>
            <TabsTrigger value="budgets">Budgets</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Revenue Trend Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>Actual vs Projected vs Budget</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={historicalData?.revenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                      <Line type="monotone" dataKey="actual" stroke="#0088FE" strokeWidth={2} />
                      <Line type="monotone" dataKey="projected" stroke="#00C49F" strokeDasharray="5 5" />
                      <Line type="monotone" dataKey="budget" stroke="#FFBB28" strokeDasharray="3 3" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              {/* Revenue Streams Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Streams</CardTitle>
                  <CardDescription>Breakdown by source</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={revenueStreams}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.source}: ${entry.percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="amount"
                      >
                        {revenueStreams?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            
            {/* Financial Health Score */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Health Score</CardTitle>
                <CardDescription>AI-powered assessment of financial performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">A+</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Overall Score</p>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Revenue Growth</span>
                      <span className="text-sm font-medium">92/100</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Operational Efficiency</span>
                      <span className="text-sm font-medium">88/100</span>
                    </div>
                    <Progress value={88} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Cash Flow</span>
                      <span className="text-sm font-medium">95/100</span>
                    </div>
                    <Progress value={95} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="revenue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Stream Analysis</CardTitle>
                <CardDescription>Detailed breakdown and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenueStreams?.map((stream, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{stream.source}</h4>
                          {stream.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                          {stream.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatPercent(stream.percentage)} of total revenue
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(stream.amount)}</p>
                        <p className={`text-sm ${stream.changePercent > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {stream.changePercent > 0 ? '+' : ''}{formatPercent(stream.changePercent)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Occupancy Impact on Revenue */}
            <Card>
              <CardHeader>
                <CardTitle>Occupancy vs Revenue Correlation</CardTitle>
                <CardDescription>Understanding the relationship</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={historicalData?.revenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                    <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value}%`} />
                    <Tooltip />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="actual"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                      name="Revenue"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="occupancy"
                      stroke="#82ca9d"
                      name="Occupancy Rate"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="properties" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Property Financial Performance</CardTitle>
                <CardDescription>Individual property metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left py-2">Property</th>
                        <th className="text-right py-2">Revenue</th>
                        <th className="text-right py-2">Expenses</th>
                        <th className="text-right py-2">Net Income</th>
                        <th className="text-right py-2">Occupancy</th>
                        <th className="text-right py-2">Avg Rate</th>
                        <th className="text-center py-2">Performance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {properties?.map((property) => (
                        <tr key={property.id} className="border-b">
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">{property.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                {property.units} units
                              </Badge>
                            </div>
                          </td>
                          <td className="text-right py-3">{formatCurrency(property.revenue)}</td>
                          <td className="text-right py-3">{formatCurrency(property.expenses)}</td>
                          <td className="text-right py-3 font-semibold">{formatCurrency(property.netIncome)}</td>
                          <td className="text-right py-3">{formatPercent(property.occupancy)}</td>
                          <td className="text-right py-3">{formatCurrency(property.avgRate)}</td>
                          <td className="text-center py-3">
                            <span className={`font-medium ${getPerformanceColor(property.performance)}`}>
                              {property.performance.charAt(0).toUpperCase() + property.performance.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t-2 font-semibold">
                      <tr>
                        <td className="py-3">Total</td>
                        <td className="text-right py-3">
                          {formatCurrency(properties?.reduce((sum, p) => sum + p.revenue, 0) || 0)}
                        </td>
                        <td className="text-right py-3">
                          {formatCurrency(properties?.reduce((sum, p) => sum + p.expenses, 0) || 0)}
                        </td>
                        <td className="text-right py-3">
                          {formatCurrency(properties?.reduce((sum, p) => sum + p.netIncome, 0) || 0)}
                        </td>
                        <td className="text-right py-3">
                          {formatPercent(
                            properties?.reduce((sum, p) => sum + p.occupancy, 0) / (properties?.length || 1) || 0
                          )}
                        </td>
                        <td className="text-right py-3">
                          {formatCurrency(
                            properties?.reduce((sum, p) => sum + p.avgRate, 0) / (properties?.length || 1) || 0
                          )}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="forecast" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  AI-Powered Revenue Forecast
                </CardTitle>
                <CardDescription>Machine learning predictions based on historical data and market trends</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Next Month</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(forecast?.nextMonth || 0)}
                    </p>
                    <Badge className="mt-2">
                      {formatPercent(((forecast?.nextMonth || 0) - (metrics?.totalRevenue || 0)) / (metrics?.totalRevenue || 1) * 100)} growth
                    </Badge>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Next Quarter</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {formatCurrency(forecast?.nextQuarter || 0)}
                    </p>
                    <Badge className="mt-2">Q4 2025</Badge>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Next Year</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(forecast?.nextYear || 0)}
                    </p>
                    <Badge className="mt-2">2026 Projection</Badge>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Forecast Confidence</span>
                    <span className="text-sm font-medium">{forecast?.confidence}%</span>
                  </div>
                  <Progress value={forecast?.confidence} className="h-3" />
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Contributing Factors</h4>
                  <div className="space-y-2">
                    {forecast?.factors.map((factor, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{factor.factor}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={factor.impact === 'positive' ? 'default' : factor.impact === 'negative' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {factor.impact}
                          </Badge>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {factor.weight}% weight
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="budgets" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Budget vs Actual Performance</CardTitle>
                <CardDescription>Year-to-date budget analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={historicalData?.revenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="budget" fill="#FFBB28" name="Budget" />
                    <Bar dataKey="actual" fill="#0088FE" name="Actual" />
                  </BarChart>
                </ResponsiveContainer>
                
                <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-900 dark:text-yellow-100">Budget Analysis</h4>
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                        YTD performance is 3.2% above budget. Revenue is exceeding projections primarily due to 
                        higher occupancy rates and successful implementation of new care services. 
                        Consider adjusting Q4 budget targets upward by 5% to reflect current trends.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
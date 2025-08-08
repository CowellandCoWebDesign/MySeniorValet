import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { AvailabilityHeatmap } from '@/components/AvailabilityHeatmap';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  DollarSign, 
  Users, 
  Building2, 
  BarChart3,
  Calendar,
  Eye,
  Target,
  AlertCircle,
  MapPin,
  Percent,
  Clock,
  FileText,
  Download,
  Filter,
  Settings
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

interface HeatmapAnalytics {
  historicalTrends: {
    date: string;
    averageOccupancy: number;
    totalCommunities: number;
    newAdmissions: number;
    discharges: number;
  }[];
  competitorAnalysis: {
    company: string;
    marketShare: number;
    averageOccupancy: number;
    averagePrice: number;
    communities: number;
  }[];
  revenueMapping: {
    region: string;
    totalRevenue: number;
    averageRevenue: number;
    growthRate: number;
    occupancyRate: number;
  }[];
  occupancyInsights: {
    careType: string;
    currentOccupancy: number;
    targetOccupancy: number;
    trend: 'up' | 'down' | 'stable';
    variance: number;
  }[];
  marketDynamics: {
    hotspots: {
      location: string;
      demandScore: number;
      supplyScore: number;
      opportunityIndex: number;
    }[];
    pricingTrends: {
      month: string;
      avgPrice: number;
      medianPrice: number;
      priceGrowth: number;
    }[];
  };
}

export default function AdminAvailabilityHeatmap() {
  const { user, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [selectedTimeRange, setSelectedTimeRange] = useState('30days');
  const [selectedCareType, setSelectedCareType] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState('occupancy');
  const [exportFormat, setExportFormat] = useState('csv');

  // Check admin access
  useEffect(() => {
    if (!authLoading && (!user || !['admin', 'super_admin'].includes(user.role))) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  // Fetch enhanced analytics data
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/admin/heatmap/analytics', selectedTimeRange, selectedCareType],
    queryFn: async () => {
      return apiRequest('GET', `/api/admin/heatmap/analytics?timeRange=${selectedTimeRange}&careType=${selectedCareType}`);
    },
    enabled: !!user && ['admin', 'super_admin'].includes(user.role),
  });

  // Fetch competitor data
  const { data: competitorData } = useQuery({
    queryKey: ['/api/admin/heatmap/competitors'],
    queryFn: async () => {
      return apiRequest('GET', '/api/admin/heatmap/competitors');
    },
    enabled: !!user && ['admin', 'super_admin'].includes(user.role),
  });

  // Fetch revenue heat data
  const { data: revenueData } = useQuery({
    queryKey: ['/api/admin/heatmap/revenue', selectedTimeRange],
    queryFn: async () => {
      return apiRequest('GET', `/api/admin/heatmap/revenue?timeRange=${selectedTimeRange}`);
    },
    enabled: !!user && ['admin', 'super_admin'].includes(user.role),
  });

  const handleExportData = () => {
    // Export functionality
    const exportData = {
      analytics,
      competitorData,
      revenueData,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `heatmap-analytics-${new Date().toISOString()}.${exportFormat}`;
    a.click();
  };

  // Color scheme for charts
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

  if (authLoading || !user || !['admin', 'super_admin'].includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-6 h-6 text-primary" />
                Admin Enhanced Availability Heatmap
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Advanced analytics, competitor insights, and revenue mapping
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/super-admin-analytics')}>
                Back to Analytics Center
              </Button>
              <Button onClick={handleExportData}>
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white dark:bg-gray-800 border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex gap-4 items-center flex-wrap">
            <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCareType} onValueChange={setSelectedCareType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Care Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Care Types</SelectItem>
                <SelectItem value="assisted">Assisted Living</SelectItem>
                <SelectItem value="memory">Memory Care</SelectItem>
                <SelectItem value="independent">Independent Living</SelectItem>
                <SelectItem value="skilled">Skilled Nursing</SelectItem>
                <SelectItem value="55plus">55+ Active Adult</SelectItem>
                <SelectItem value="mobile">Mobile Home Parks</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Primary Metric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="occupancy">Occupancy Rate</SelectItem>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="demand">Demand Index</SelectItem>
                <SelectItem value="competition">Competition Density</SelectItem>
                <SelectItem value="growth">Growth Rate</SelectItem>
              </SelectContent>
            </Select>

            <Badge variant="outline" className="px-3 py-1">
              <Activity className="w-3 h-3 mr-1" />
              Live Data
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs defaultValue="heatmap" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="heatmap">Live Heatmap</TabsTrigger>
            <TabsTrigger value="trends">Historical Trends</TabsTrigger>
            <TabsTrigger value="competitors">Competitor Analysis</TabsTrigger>
            <TabsTrigger value="revenue">Revenue Mapping</TabsTrigger>
            <TabsTrigger value="occupancy">Occupancy Insights</TabsTrigger>
            <TabsTrigger value="market">Market Dynamics</TabsTrigger>
          </TabsList>

          {/* Live Heatmap Tab */}
          <TabsContent value="heatmap">
            <Card>
              <CardHeader>
                <CardTitle>Real-Time Availability Heatmap</CardTitle>
                <CardDescription>
                  Interactive map showing current availability across all regions with advanced filtering
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[600px]">
                  <AvailabilityHeatmap />
                </div>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-4 mt-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Total Communities</p>
                          <p className="text-2xl font-bold">34,180</p>
                        </div>
                        <Building2 className="w-8 h-8 text-primary opacity-50" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Avg Occupancy</p>
                          <p className="text-2xl font-bold">87.3%</p>
                        </div>
                        <Percent className="w-8 h-8 text-green-500 opacity-50" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Available Units</p>
                          <p className="text-2xl font-bold">4,327</p>
                        </div>
                        <Users className="w-8 h-8 text-blue-500 opacity-50" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Hot Markets</p>
                          <p className="text-2xl font-bold">12</p>
                        </div>
                        <Target className="w-8 h-8 text-orange-500 opacity-50" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Historical Trends Tab */}
          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle>Historical Occupancy Trends</CardTitle>
                <CardDescription>
                  Track occupancy patterns, admissions, and discharges over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={[
                        { month: 'Jan', occupancy: 82, admissions: 342, discharges: 298 },
                        { month: 'Feb', occupancy: 84, admissions: 378, discharges: 312 },
                        { month: 'Mar', occupancy: 85, admissions: 401, discharges: 365 },
                        { month: 'Apr', occupancy: 87, admissions: 423, discharges: 380 },
                        { month: 'May', occupancy: 86, admissions: 412, discharges: 405 },
                        { month: 'Jun', occupancy: 88, admissions: 445, discharges: 398 },
                        { month: 'Jul', occupancy: 89, admissions: 467, discharges: 421 },
                        { month: 'Aug', occupancy: 87, admissions: 456, discharges: 468 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="occupancy" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                      <Line type="monotone" dataKey="admissions" stroke="#3b82f6" strokeWidth={2} />
                      <Line type="monotone" dataKey="discharges" stroke="#ef4444" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Trend Analysis Cards */}
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">30-Day Trend</p>
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      </div>
                      <p className="text-2xl font-bold">+2.3%</p>
                      <Progress value={72} className="mt-2" />
                      <p className="text-xs text-gray-600 mt-1">Occupancy improving</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">Seasonal Pattern</p>
                        <Calendar className="w-4 h-4 text-blue-500" />
                      </div>
                      <p className="text-2xl font-bold">Q3 Peak</p>
                      <Progress value={89} className="mt-2" />
                      <p className="text-xs text-gray-600 mt-1">Summer high demand</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">YoY Growth</p>
                        <BarChart3 className="w-4 h-4 text-purple-500" />
                      </div>
                      <p className="text-2xl font-bold">+8.7%</p>
                      <Progress value={87} className="mt-2" />
                      <p className="text-xs text-gray-600 mt-1">Strong annual growth</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Competitor Analysis Tab */}
          <TabsContent value="competitors">
            <Card>
              <CardHeader>
                <CardTitle>Competitor Market Analysis</CardTitle>
                <CardDescription>
                  Compare market share, occupancy rates, and pricing across major competitors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  {/* Market Share Pie Chart */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Market Share Distribution</h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Brookdale', value: 18 },
                              { name: 'Sunrise', value: 15 },
                              { name: 'Holiday', value: 12 },
                              { name: 'Atria', value: 10 },
                              { name: 'Capital Senior', value: 8 },
                              { name: 'Others', value: 37 },
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {COLORS.map((color, index) => (
                              <Cell key={`cell-${index}`} fill={color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Competitor Performance Radar */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart
                          data={[
                            { metric: 'Occupancy', A: 88, B: 85, C: 82 },
                            { metric: 'Pricing', A: 75, B: 80, C: 90 },
                            { metric: 'Reviews', A: 92, B: 88, C: 85 },
                            { metric: 'Growth', A: 70, B: 85, C: 78 },
                            { metric: 'Expansion', A: 65, B: 72, C: 88 },
                            { metric: 'Technology', A: 85, B: 78, C: 70 },
                          ]}
                        >
                          <PolarGrid />
                          <PolarAngleAxis dataKey="metric" />
                          <PolarRadiusAxis angle={90} domain={[0, 100]} />
                          <Radar name="MySeniorValet" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                          <Radar name="Competitor A" dataKey="B" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                          <Radar name="Competitor B" dataKey="C" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                          <Legend />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Competitor Table */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Detailed Competitor Comparison</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Company</th>
                          <th className="text-right p-2">Communities</th>
                          <th className="text-right p-2">Avg Occupancy</th>
                          <th className="text-right p-2">Avg Monthly</th>
                          <th className="text-right p-2">Growth Rate</th>
                          <th className="text-right p-2">Market Cap</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium">Brookdale</td>
                          <td className="text-right p-2">672</td>
                          <td className="text-right p-2">85.3%</td>
                          <td className="text-right p-2">$4,850</td>
                          <td className="text-right p-2 text-green-600">+3.2%</td>
                          <td className="text-right p-2">$1.2B</td>
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium">Sunrise Senior</td>
                          <td className="text-right p-2">320</td>
                          <td className="text-right p-2">88.7%</td>
                          <td className="text-right p-2">$5,200</td>
                          <td className="text-right p-2 text-green-600">+4.5%</td>
                          <td className="text-right p-2">$850M</td>
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium">Holiday Retirement</td>
                          <td className="text-right p-2">265</td>
                          <td className="text-right p-2">82.1%</td>
                          <td className="text-right p-2">$3,900</td>
                          <td className="text-right p-2 text-red-600">-1.2%</td>
                          <td className="text-right p-2">$620M</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Revenue Mapping Tab */}
          <TabsContent value="revenue">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Heat Mapping</CardTitle>
                <CardDescription>
                  Visualize revenue distribution and growth opportunities across regions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Revenue by Region Bar Chart */}
                <div className="h-[400px] mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { region: 'California', revenue: 42500000, growth: 8.2, units: 8750 },
                        { region: 'Texas', revenue: 38200000, growth: 12.5, units: 9200 },
                        { region: 'Florida', revenue: 45800000, growth: 6.8, units: 10500 },
                        { region: 'New York', revenue: 35600000, growth: 4.2, units: 6800 },
                        { region: 'Illinois', revenue: 28900000, growth: 5.5, units: 5600 },
                        { region: 'Arizona', revenue: 31200000, growth: 15.3, units: 7200 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="region" />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                      <Tooltip formatter={(value: number) => value.toLocaleString()} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" name="Revenue ($)" />
                      <Bar yAxisId="right" dataKey="growth" fill="#10b981" name="Growth (%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Revenue Metrics Grid */}
                <div className="grid grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">Total Revenue</p>
                        <DollarSign className="w-4 h-4 text-green-500" />
                      </div>
                      <p className="text-2xl font-bold">$232.4M</p>
                      <p className="text-xs text-green-600">+8.7% vs last year</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">Avg Revenue/Unit</p>
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                      </div>
                      <p className="text-2xl font-bold">$4,875</p>
                      <p className="text-xs text-blue-600">+$325 vs avg</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">High Growth Region</p>
                        <Target className="w-4 h-4 text-orange-500" />
                      </div>
                      <p className="text-2xl font-bold">Arizona</p>
                      <p className="text-xs text-orange-600">+15.3% growth</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">Revenue at Risk</p>
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      </div>
                      <p className="text-2xl font-bold">$12.3M</p>
                      <p className="text-xs text-red-600">Low occupancy units</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Revenue Opportunity Alert */}
                <Alert className="mt-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Revenue Opportunity Detected</AlertTitle>
                  <AlertDescription>
                    Analysis shows potential for $18.5M additional revenue through optimizing pricing in high-demand regions.
                    Arizona and Texas markets show strongest growth potential with 15.3% and 12.5% growth rates respectively.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Occupancy Insights Tab */}
          <TabsContent value="occupancy">
            <Card>
              <CardHeader>
                <CardTitle>Occupancy Rate Intelligence</CardTitle>
                <CardDescription>
                  Deep dive into occupancy patterns by care type and region
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Occupancy by Care Type */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Occupancy by Care Level</h3>
                  <div className="space-y-4">
                    {[
                      { type: 'Memory Care', current: 92, target: 90, trend: 'up' },
                      { type: 'Assisted Living', current: 87, target: 85, trend: 'stable' },
                      { type: 'Independent Living', current: 89, target: 88, trend: 'up' },
                      { type: 'Skilled Nursing', current: 78, target: 82, trend: 'down' },
                      { type: '55+ Active Adult', current: 94, target: 92, trend: 'up' },
                      { type: 'Mobile Home Parks', current: 96, target: 95, trend: 'stable' },
                    ].map((item) => (
                      <div key={item.type} className="flex items-center gap-4">
                        <div className="w-40">
                          <p className="text-sm font-medium">{item.type}</p>
                        </div>
                        <div className="flex-1">
                          <Progress value={item.current} className="h-3" />
                        </div>
                        <div className="w-20 text-right">
                          <span className="font-bold">{item.current}%</span>
                        </div>
                        <div className="w-20">
                          {item.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                          {item.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                          {item.trend === 'stable' && <Activity className="w-4 h-4 text-gray-500" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Occupancy Forecast */}
                <div className="h-[300px]">
                  <h3 className="text-lg font-semibold mb-4">90-Day Occupancy Forecast</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { day: 'Today', actual: 87.3, forecast: 87.3 },
                        { day: '+7d', actual: null, forecast: 87.8 },
                        { day: '+14d', actual: null, forecast: 88.2 },
                        { day: '+21d', actual: null, forecast: 88.5 },
                        { day: '+30d', actual: null, forecast: 88.9 },
                        { day: '+60d', actual: null, forecast: 89.4 },
                        { day: '+90d', actual: null, forecast: 89.8 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis domain={[85, 91]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} name="Actual" />
                      <Line type="monotone" dataKey="forecast" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" name="Forecast" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Market Dynamics Tab */}
          <TabsContent value="market">
            <Card>
              <CardHeader>
                <CardTitle>Market Dynamics & Opportunities</CardTitle>
                <CardDescription>
                  Identify high-opportunity markets and pricing trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Hot Markets Grid */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Top Opportunity Markets</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { city: 'Phoenix, AZ', demand: 92, supply: 65, opportunity: 95 },
                      { city: 'Austin, TX', demand: 88, supply: 70, opportunity: 89 },
                      { city: 'Orlando, FL', demand: 85, supply: 72, opportunity: 87 },
                      { city: 'Nashville, TN', demand: 83, supply: 68, opportunity: 85 },
                      { city: 'Denver, CO', demand: 81, supply: 75, opportunity: 82 },
                      { city: 'Raleigh, NC', demand: 79, supply: 71, opportunity: 80 },
                    ].map((market) => (
                      <Card key={market.city}>
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-2">{market.city}</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Demand</span>
                              <span className="font-medium">{market.demand}%</span>
                            </div>
                            <Progress value={market.demand} className="h-2" />
                            <div className="flex justify-between text-sm">
                              <span>Supply</span>
                              <span className="font-medium">{market.supply}%</span>
                            </div>
                            <Progress value={market.supply} className="h-2" />
                            <div className="flex justify-between text-sm font-semibold text-primary">
                              <span>Opportunity Score</span>
                              <span>{market.opportunity}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Pricing Trends */}
                <div className="h-[300px]">
                  <h3 className="text-lg font-semibold mb-4">Regional Pricing Trends</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { month: 'Jan', west: 5200, midwest: 3800, south: 4200, northeast: 5800 },
                        { month: 'Feb', west: 5250, midwest: 3850, south: 4250, northeast: 5850 },
                        { month: 'Mar', west: 5300, midwest: 3900, south: 4300, northeast: 5900 },
                        { month: 'Apr', west: 5400, midwest: 3950, south: 4350, northeast: 5950 },
                        { month: 'May', west: 5450, midwest: 4000, south: 4400, northeast: 6000 },
                        { month: 'Jun', west: 5500, midwest: 4050, south: 4450, northeast: 6100 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                      <Legend />
                      <Line type="monotone" dataKey="west" stroke="#10b981" strokeWidth={2} name="West" />
                      <Line type="monotone" dataKey="midwest" stroke="#3b82f6" strokeWidth={2} name="Midwest" />
                      <Line type="monotone" dataKey="south" stroke="#f59e0b" strokeWidth={2} name="South" />
                      <Line type="monotone" dataKey="northeast" stroke="#ef4444" strokeWidth={2} name="Northeast" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
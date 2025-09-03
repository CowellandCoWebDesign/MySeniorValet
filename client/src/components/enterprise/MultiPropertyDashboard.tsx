import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import {
  Building2, TrendingUp, Users, DollarSign, Activity, Target,
  BarChart3, PieChart, LineChart, Calendar, Filter,
  Download, Share2, Settings, Globe, Briefcase, Award,
  AlertCircle, CheckCircle, XCircle, Clock, ChevronRight,
  Map, Grid3x3, List, Eye, Brain, Zap
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart as RechartsLine, Line,
  PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

interface MultiPropertyDashboardProps {
  corporateId: string;
  viewMode: 'executive' | 'regional' | 'family';
}

export default function MultiPropertyDashboard({ 
  corporateId, 
  viewMode = 'executive' 
}: MultiPropertyDashboardProps) {
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [timeRange, setTimeRange] = useState('month');
  const [viewType, setViewType] = useState<'grid' | 'list' | 'map'>('grid');

  // Fetch portfolio data
  const { data: portfolio, isLoading } = useQuery({
    queryKey: [`/api/enterprise/portfolio/${corporateId}`],
    enabled: !!corporateId
  });

  // Calculate portfolio metrics
  const portfolioMetrics = useMemo(() => {
    if (!portfolio) return null;
    
    return {
      totalProperties: portfolio.properties?.length || 0,
      totalUnits: portfolio.properties?.reduce((sum: number, p: any) => sum + p.totalUnits, 0) || 0,
      averageOccupancy: portfolio.properties?.reduce((sum: number, p: any) => sum + p.occupancyRate, 0) / (portfolio.properties?.length || 1) || 0,
      totalRevenue: portfolio.properties?.reduce((sum: number, p: any) => sum + p.monthlyRevenue, 0) || 0,
      totalStaff: portfolio.properties?.reduce((sum: number, p: any) => sum + p.staffCount, 0) || 0,
      averageSatisfaction: portfolio.properties?.reduce((sum: number, p: any) => sum + p.satisfactionScore, 0) / (portfolio.properties?.length || 1) || 0
    };
  }, [portfolio]);

  // Sample data for charts (would come from API in production)
  const occupancyTrend = [
    { month: 'Jan', occupancy: 92, target: 95 },
    { month: 'Feb', occupancy: 94, target: 95 },
    { month: 'Mar', occupancy: 93, target: 95 },
    { month: 'Apr', occupancy: 95, target: 95 },
    { month: 'May', occupancy: 96, target: 95 },
    { month: 'Jun', occupancy: 97, target: 95 }
  ];

  const revenueByProperty = [
    { name: 'Sunrise Manor', revenue: 450000, units: 120 },
    { name: 'Golden Years', revenue: 380000, units: 95 },
    { name: 'Harmony House', revenue: 520000, units: 150 },
    { name: 'Serenity Gardens', revenue: 290000, units: 75 },
    { name: 'Vista Ridge', revenue: 410000, units: 110 }
  ];

  const performanceRadar = [
    { metric: 'Occupancy', A: 95, B: 92, fullMark: 100 },
    { metric: 'Revenue', A: 88, B: 85, fullMark: 100 },
    { metric: 'Satisfaction', A: 92, B: 90, fullMark: 100 },
    { metric: 'Staff Retention', A: 85, B: 82, fullMark: 100 },
    { metric: 'Compliance', A: 98, B: 96, fullMark: 100 },
    { metric: 'Marketing ROI', A: 78, B: 75, fullMark: 100 }
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading portfolio data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Multi-Property Management</h1>
          <p className="text-gray-600">
            {viewMode === 'executive' && 'Executive dashboard for portfolio-wide insights and control'}
            {viewMode === 'regional' && 'Regional management view for your assigned properties'}
            {viewMode === 'family' && 'Family view of community network and services'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            {timeRange === 'month' ? 'This Month' : timeRange === 'quarter' ? 'This Quarter' : 'This Year'}
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
            <Share2 className="w-4 h-4 mr-2" />
            Share Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Properties</p>
                <p className="text-2xl font-bold">{portfolioMetrics?.totalProperties || 0}</p>
                <p className="text-xs text-green-600">+2 this quarter</p>
              </div>
              <Building2 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Units</p>
                <p className="text-2xl font-bold">{portfolioMetrics?.totalUnits || 0}</p>
                <p className="text-xs text-gray-500">Across all properties</p>
              </div>
              <Grid3x3 className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Occupancy</p>
                <p className="text-2xl font-bold">{portfolioMetrics?.averageOccupancy.toFixed(1)}%</p>
                <p className="text-xs text-green-600">↑ 2.3% vs last month</p>
              </div>
              <Target className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold">${(portfolioMetrics?.totalRevenue / 1000).toFixed(0)}K</p>
                <p className="text-xs text-green-600">↑ 5.2% YoY</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Staff</p>
                <p className="text-2xl font-bold">{portfolioMetrics?.totalStaff || 0}</p>
                <p className="text-xs text-gray-500">98% retention</p>
              </div>
              <Users className="w-8 h-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Satisfaction</p>
                <p className="text-2xl font-bold">{portfolioMetrics?.averageSatisfaction.toFixed(1)}/5</p>
                <p className="text-xs text-green-600">↑ 0.2 pts</p>
              </div>
              <Award className="w-8 h-8 text-rose-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Portfolio Performance Radar */}
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Performance Comparison</CardTitle>
              <CardDescription>
                Comparative analysis across key performance indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={performanceRadar}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Current" dataKey="A" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                  <Radar name="Target" dataKey="B" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Occupancy Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Occupancy Trend</CardTitle>
                <CardDescription>Portfolio-wide occupancy vs target</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={occupancyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[85, 100]} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="occupancy" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="target" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Revenue by Property */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Property</CardTitle>
                <CardDescription>Monthly revenue distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueByProperty}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${(value as number / 1000).toFixed(0)}K`} />
                    <Bar dataKey="revenue" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common multi-property management tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-24 flex-col">
                  <BarChart3 className="w-6 h-6 mb-2" />
                  <span className="text-sm">Compare Properties</span>
                </Button>
                <Button variant="outline" className="h-24 flex-col">
                  <Users className="w-6 h-6 mb-2" />
                  <span className="text-sm">Staff Allocation</span>
                </Button>
                <Button variant="outline" className="h-24 flex-col">
                  <Target className="w-6 h-6 mb-2" />
                  <span className="text-sm">Set Corporate Goals</span>
                </Button>
                <Button variant="outline" className="h-24 flex-col">
                  <Brain className="w-6 h-6 mb-2" />
                  <span className="text-sm">AI Recommendations</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Properties Tab */}
        <TabsContent value="properties" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Property Portfolio</CardTitle>
                  <CardDescription>Manage and monitor all properties</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={viewType === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewType('grid')}
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewType === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewType('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewType === 'map' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewType('map')}
                  >
                    <Map className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className={viewType === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
                {revenueByProperty.map((property, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{property.name}</h3>
                          <p className="text-sm text-gray-600">{property.units} units</p>
                        </div>
                        <Badge className={index % 2 === 0 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                          {index % 2 === 0 ? 'Performing' : 'Needs Attention'}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Occupancy</span>
                          <span className="font-medium">{(92 + index * 2)}%</span>
                        </div>
                        <Progress value={92 + index * 2} className="h-2" />
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Monthly Revenue</span>
                          <span className="font-medium">${(property.revenue / 1000).toFixed(0)}K</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Satisfaction</span>
                          <span className="font-medium">4.{3 + index}/5</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full mt-4">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financials Tab */}
        <TabsContent value="financials" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Breakdown */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>Portfolio revenue streams analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={occupancyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="occupancy" stroke="#3B82F6" name="Room & Board" />
                    <Line type="monotone" dataKey="target" stroke="#10B981" name="Care Services" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Expense Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Expense Categories</CardTitle>
                <CardDescription>Monthly expense distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RechartsPie width={400} height={400}>
                    <Pie
                      data={[
                        { name: 'Staff', value: 45 },
                        { name: 'Operations', value: 25 },
                        { name: 'Facilities', value: 15 },
                        { name: 'Marketing', value: 10 },
                        { name: 'Other', value: 5 }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {revenueByProperty.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPie>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Financial KPIs */}
          <Card>
            <CardHeader>
              <CardTitle>Financial KPIs</CardTitle>
              <CardDescription>Key financial performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">EBITDA Margin</p>
                  <p className="text-2xl font-bold text-green-600">24.5%</p>
                  <p className="text-xs text-gray-500">↑ 2.1% YoY</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">RevPAR</p>
                  <p className="text-2xl font-bold">$4,250</p>
                  <p className="text-xs text-green-600">↑ $125 vs target</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">NOI</p>
                  <p className="text-2xl font-bold">$1.2M</p>
                  <p className="text-xs text-gray-500">This quarter</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Cash Flow</p>
                  <p className="text-2xl font-bold text-green-600">Positive</p>
                  <p className="text-xs text-gray-500">All properties</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Operations Tab */}
        <TabsContent value="operations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Staffing Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Staffing Overview</CardTitle>
                <CardDescription>Cross-property staff allocation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Nursing Staff</span>
                    <div className="flex items-center gap-2">
                      <Progress value={85} className="w-32" />
                      <span className="text-sm font-medium">85%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Care Aides</span>
                    <div className="flex items-center gap-2">
                      <Progress value={92} className="w-32" />
                      <span className="text-sm font-medium">92%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Support Staff</span>
                    <div className="flex items-center gap-2">
                      <Progress value={78} className="w-32" />
                      <span className="text-sm font-medium">78%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Administrative</span>
                    <div className="flex items-center gap-2">
                      <Progress value={95} className="w-32" />
                      <span className="text-sm font-medium">95%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compliance Status */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance Status</CardTitle>
                <CardDescription>Regulatory compliance across properties</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium">State Licensing</span>
                    </div>
                    <Badge className="bg-green-100 text-green-700">All Compliant</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium">Health Inspections</span>
                    </div>
                    <Badge className="bg-green-100 text-green-700">Passed</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-yellow-600" />
                      <span className="font-medium">Fire Safety</span>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-700">Due in 30 days</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium">Medicare Cert</span>
                    </div>
                    <Badge className="bg-green-100 text-green-700">Current</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Operational Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Operational Alerts</CardTitle>
              <CardDescription>Issues requiring attention across the portfolio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">Sunrise Manor:</span> Staff shortage in memory care unit
                      </div>
                      <Button size="sm" variant="outline">View Details</Button>
                    </div>
                  </AlertDescription>
                </Alert>
                <Alert className="border-blue-200 bg-blue-50">
                  <Activity className="h-4 w-4 text-blue-600" />
                  <AlertDescription>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">Golden Years:</span> Scheduled maintenance this weekend
                      </div>
                      <Button size="sm" variant="outline">View Schedule</Button>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Predictive Analytics</CardTitle>
              <CardDescription>AI-powered forecasting and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                  <TrendingUp className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Occupancy Forecast</h3>
                  <p className="text-2xl font-bold text-blue-600">98.5%</p>
                  <p className="text-sm text-gray-600 mt-2">Predicted for Q3 2025</p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                  <DollarSign className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Revenue Projection</h3>
                  <p className="text-2xl font-bold text-green-600">$14.2M</p>
                  <p className="text-sm text-gray-600 mt-2">Expected annual growth</p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                  <Brain className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Risk Score</h3>
                  <p className="text-2xl font-bold text-purple-600">Low</p>
                  <p className="text-sm text-gray-600 mt-2">Portfolio health index</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                AI-Powered Recommendations
              </CardTitle>
              <CardDescription>
                Machine learning insights for portfolio optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">Optimize Pricing Strategy</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Analysis shows Vista Ridge can increase rates by 3-5% without impacting occupancy based on local market conditions.
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm">Implement</Button>
                        <Button size="sm" variant="outline">View Analysis</Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">Staff Reallocation Opportunity</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Shift 2 FTE nurses from Harmony House to Sunrise Manor to optimize care ratios and reduce overtime costs.
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm">Review Plan</Button>
                        <Button size="sm" variant="outline">Dismiss</Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Target className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">Marketing Campaign Success</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Digital marketing campaign at Golden Years generated 45 qualified leads with 22% conversion rate. Replicate across portfolio.
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm">Deploy Campaign</Button>
                        <Button size="sm" variant="outline">See Details</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Family View Notice */}
      {viewMode === 'family' && (
        <Alert className="border-blue-200 bg-blue-50">
          <Activity className="h-4 w-4" />
          <AlertDescription>
            <strong>Family Access:</strong> You're viewing the corporate network that manages your loved one's community. 
            This transparency ensures you understand the resources and support behind their care.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
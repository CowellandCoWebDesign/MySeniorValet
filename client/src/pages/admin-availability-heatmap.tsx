import React, { useState, useEffect } from 'react';
import { NavigationHeader } from '@/components/NavigationHeader';
import { AvailabilityHeatmap } from '@/components/AvailabilityHeatmap';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  MapPin, TrendingUp, TrendingDown, Building2, Users, DollarSign,
  Activity, BarChart3, Download, Eye, Filter, Calendar, Target,
  Award, AlertCircle, ArrowUp, ArrowDown, Map, ChartBar
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

export default function AdminAvailabilityHeatmap() {
  const { user, loading: authLoading } = useAuth();
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [timeRange, setTimeRange] = useState('30days');
  const [careTypeFilter, setCareTypeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch enhanced analytics data
  const { data: analytics } = useQuery({
    queryKey: ['/api/admin/heatmap/analytics', timeRange, careTypeFilter],
    enabled: !!user && ['admin', 'super_admin'].includes(user.role)
  });

  const { data: competitors } = useQuery({
    queryKey: ['/api/admin/heatmap/competitors', timeRange],
    enabled: !!user && ['admin', 'super_admin'].includes(user.role)
  });

  const { data: revenue } = useQuery({
    queryKey: ['/api/admin/heatmap/revenue', timeRange],
    enabled: !!user && ['admin', 'super_admin'].includes(user.role)
  });

  // Chart colors
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

  // Mock data for demonstration
  const trendData = [
    { month: 'Jan', occupancy: 82, admissions: 145, revenue: 4200000 },
    { month: 'Feb', occupancy: 84, admissions: 152, revenue: 4350000 },
    { month: 'Mar', occupancy: 85, admissions: 168, revenue: 4450000 },
    { month: 'Apr', occupancy: 86, admissions: 174, revenue: 4500000 },
    { month: 'May', occupancy: 87, admissions: 181, revenue: 4650000 },
    { month: 'Jun', occupancy: 87.3, admissions: 189, revenue: 4700000 }
  ];

  const occupancyByType = [
    { type: 'Assisted Living', current: 89.2, target: 90, trend: 'up' },
    { type: 'Memory Care', current: 91.5, target: 92, trend: 'up' },
    { type: 'Independent Living', current: 85.3, target: 88, trend: 'stable' },
    { type: 'Skilled Nursing', current: 88.7, target: 90, trend: 'down' },
    { type: '55+ Active Adult', current: 93.1, target: 95, trend: 'up' },
    { type: 'Mobile Home Parks', current: 82.4, target: 85, trend: 'stable' }
  ];

  const competitorData = [
    { name: 'MySeniorValet', marketShare: 18.5, occupancy: 87.3, growth: 15.2 },
    { name: 'Brookdale', marketShare: 12.3, occupancy: 84.2, growth: 3.5 },
    { name: 'Sunrise Senior', marketShare: 10.8, occupancy: 85.6, growth: 5.2 },
    { name: 'Holiday Retirement', marketShare: 8.7, occupancy: 83.1, growth: 2.1 },
    { name: 'Five Star', marketShare: 7.4, occupancy: 82.5, growth: 1.8 }
  ];

  const revenueByRegion = [
    { region: 'West Coast', revenue: 8500000, communities: 4235, growth: 12.3 },
    { region: 'Northeast', revenue: 7200000, communities: 3890, growth: 8.7 },
    { region: 'Southeast', revenue: 6800000, communities: 5120, growth: 15.4 },
    { region: 'Midwest', revenue: 5900000, communities: 4780, growth: 6.2 },
    { region: 'Southwest', revenue: 5200000, communities: 3456, growth: 11.8 },
    { region: 'Mountain West', revenue: 3400000, communities: 2234, growth: 18.9 }
  ];

  if (authLoading || !user || !['admin', 'super_admin'].includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 dark:from-slate-900 dark:via-gray-900 dark:to-blue-950">
      <NavigationHeader />
      
      {/* Premium Header Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold flex items-center gap-4 mb-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg">
                  <MapPin className="w-10 h-10" />
                </div>
                Enhanced Admin Heatmap
              </h1>
              <p className="text-lg md:text-xl text-blue-100 max-w-2xl">
                Real-time availability analytics with competitor insights, revenue mapping, and occupancy intelligence
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                  <SelectItem value="1year">Last Year</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="secondary"
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                <Eye className="w-4 h-4 mr-2" />
                {showAnalytics ? 'Hide' : 'Show'} Analytics
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Key Metrics Dashboard */}
        {showAnalytics && (
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Communities Card */}
              <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border-t-4 border-t-blue-600">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-16 -mt-16" />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Communities</p>
                      <p className="text-3xl font-bold mt-2">34,180</p>
                      <p className="text-xs text-gray-500 mt-1">Nationwide coverage</p>
                    </div>
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <Building2 className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Average Occupancy Card */}
              <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border-t-4 border-t-green-600">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-600/5 rounded-full -mr-16 -mt-16" />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Occupancy</p>
                      <p className="text-3xl font-bold mt-2">87.3%</p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="w-3 h-3 text-green-600" />
                        <span className="text-xs text-green-600">+2.3% this month</span>
                      </div>
                    </div>
                    <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <Users className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Revenue Card */}
              <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border-t-4 border-t-purple-600">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 rounded-full -mr-16 -mt-16" />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Revenue</p>
                      <p className="text-3xl font-bold mt-2">$4.7M</p>
                      <p className="text-xs text-gray-500 mt-1">Platform-wide</p>
                    </div>
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <DollarSign className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Growth Rate Card */}
              <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border-t-4 border-t-orange-600">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/5 rounded-full -mr-16 -mt-16" />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">YoY Growth</p>
                      <p className="text-3xl font-bold mt-2">15.2%</p>
                      <p className="text-xs text-gray-500 mt-1">Industry leading</p>
                    </div>
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                      <Target className="w-8 h-8 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Analytics Tabs Section */}
            <Card className="shadow-lg">
              <CardContent className="p-0">
                <Tabs defaultValue="trends" className="w-full">
                  <div className="border-b bg-gray-50 dark:bg-gray-800/50">
                    <TabsList className="w-full justify-start h-auto p-0 bg-transparent">
                      <TabsTrigger value="trends" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 px-6 py-4">
                        Historical Trends
                      </TabsTrigger>
                      <TabsTrigger value="occupancy" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 px-6 py-4">
                        Occupancy Analysis
                      </TabsTrigger>
                      <TabsTrigger value="competitors" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 px-6 py-4">
                        Competitor Insights
                      </TabsTrigger>
                      <TabsTrigger value="revenue" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 px-6 py-4">
                        Revenue Mapping
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* Historical Trends Tab */}
                  <TabsContent value="trends" className="p-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">6-Month Performance Overview</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                          Occupancy rates, new admissions, and revenue trends
                        </p>
                      </div>
                      
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={trendData}>
                          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                          <XAxis dataKey="month" />
                          <YAxis yAxisId="left" label={{ value: 'Occupancy %', angle: -90, position: 'insideLeft' }} />
                          <YAxis yAxisId="right" orientation="right" label={{ value: 'Admissions', angle: 90, position: 'insideRight' }} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                            }}
                          />
                          <Legend />
                          <Line 
                            yAxisId="left"
                            type="monotone" 
                            dataKey="occupancy" 
                            stroke="#3B82F6" 
                            strokeWidth={3}
                            name="Occupancy %" 
                            dot={{ fill: '#3B82F6', r: 5 }}
                            activeDot={{ r: 7 }}
                          />
                          <Line 
                            yAxisId="right"
                            type="monotone" 
                            dataKey="admissions" 
                            stroke="#10B981" 
                            strokeWidth={3}
                            name="New Admissions"
                            dot={{ fill: '#10B981', r: 5 }}
                            activeDot={{ r: 7 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>

                      <div className="grid grid-cols-3 gap-4 mt-6">
                        <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-200">
                          <CardContent className="p-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Avg Monthly Growth</p>
                            <p className="text-2xl font-bold text-blue-600">+1.1%</p>
                          </CardContent>
                        </Card>
                        <Card className="bg-green-50 dark:bg-green-900/10 border-green-200">
                          <CardContent className="p-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Admissions</p>
                            <p className="text-2xl font-bold text-green-600">1,019</p>
                          </CardContent>
                        </Card>
                        <Card className="bg-purple-50 dark:bg-purple-900/10 border-purple-200">
                          <CardContent className="p-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Revenue Growth</p>
                            <p className="text-2xl font-bold text-purple-600">+11.9%</p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Occupancy Analysis Tab */}
                  <TabsContent value="occupancy" className="p-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Occupancy by Care Type</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                          Current occupancy rates compared to target goals
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {occupancyByType.map((item, index) => (
                          <Card key={index} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h4 className="font-semibold text-lg">{item.type}</h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Target: {item.target}%
                                  </p>
                                </div>
                                <Badge 
                                  variant={item.trend === 'up' ? 'default' : item.trend === 'down' ? 'destructive' : 'secondary'}
                                  className="flex items-center gap-1"
                                >
                                  {item.trend === 'up' ? <ArrowUp className="w-3 h-3" /> : 
                                   item.trend === 'down' ? <ArrowDown className="w-3 h-3" /> : 
                                   <Activity className="w-3 h-3" />}
                                  {item.trend}
                                </Badge>
                              </div>
                              
                              <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                  <span>Current Occupancy</span>
                                  <span className="font-bold">{item.current}%</span>
                                </div>
                                <Progress value={item.current} className="h-3" />
                                <div className="flex justify-between text-xs text-gray-500">
                                  <span>0%</span>
                                  <span>100%</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Competitor Insights Tab */}
                  <TabsContent value="competitors" className="p-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Market Position Analysis</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                          How MySeniorValet compares to major competitors
                        </p>
                      </div>

                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={competitorData}>
                          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                          <XAxis dataKey="name" angle={-20} textAnchor="end" height={80} />
                          <YAxis />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                            }}
                          />
                          <Legend />
                          <Bar dataKey="marketShare" fill="#3B82F6" name="Market Share %" radius={[8, 8, 0, 0]} />
                          <Bar dataKey="occupancy" fill="#10B981" name="Occupancy %" radius={[8, 8, 0, 0]} />
                          <Bar dataKey="growth" fill="#F59E0B" name="Growth %" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>

                      <div className="grid grid-cols-3 gap-6 mt-6">
                        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border-green-200">
                          <CardContent className="p-6 text-center">
                            <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">Market Leader</p>
                            <p className="text-2xl font-bold text-green-600 mt-1">MySeniorValet</p>
                            <p className="text-xs text-gray-500 mt-1">18.5% market share</p>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border-blue-200">
                          <CardContent className="p-6 text-center">
                            <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">Fastest Growth</p>
                            <p className="text-2xl font-bold text-blue-600 mt-1">15.2%</p>
                            <p className="text-xs text-gray-500 mt-1">Year over year</p>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 border-purple-200">
                          <CardContent className="p-6 text-center">
                            <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">Best Occupancy</p>
                            <p className="text-2xl font-bold text-purple-600 mt-1">87.3%</p>
                            <p className="text-xs text-gray-500 mt-1">Above industry avg</p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Revenue Mapping Tab */}
                  <TabsContent value="revenue" className="p-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Regional Revenue Distribution</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                          Revenue performance and growth opportunities by region
                        </p>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {revenueByRegion.map((region, index) => (
                          <Card key={index} className="hover:shadow-lg transition-all hover:scale-[1.02]">
                            <CardContent className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h4 className="font-semibold text-xl">{region.region}</h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {region.communities.toLocaleString()} communities
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-2xl font-bold text-blue-600">
                                    ${(region.revenue / 1000000).toFixed(1)}M
                                  </p>
                                  <div className="flex items-center justify-end gap-1 mt-1">
                                    <TrendingUp className="w-3 h-3 text-green-600" />
                                    <span className="text-sm text-green-600">+{region.growth}%</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Revenue per Community</span>
                                  <span className="font-semibold">
                                    ${Math.round(region.revenue / region.communities).toLocaleString()}
                                  </span>
                                </div>
                                <Progress value={(region.revenue / 8500000) * 100} className="h-2" />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/10 dark:via-purple-900/10 dark:to-pink-900/10 border-2 border-blue-200">
                        <CardContent className="p-8">
                          <h4 className="font-semibold text-xl mb-6">Revenue Opportunities</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Platform Revenue</p>
                              <p className="text-3xl font-bold text-blue-600">$37M</p>
                              <p className="text-xs text-gray-500 mt-1">Annual recurring</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Expansion Potential</p>
                              <p className="text-3xl font-bold text-green-600">$18.5M</p>
                              <p className="text-xs text-gray-500 mt-1">Untapped markets</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Optimization Potential</p>
                              <p className="text-3xl font-bold text-purple-600">$12.3M</p>
                              <p className="text-xs text-gray-500 mt-1">From occupancy improvement</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Interactive Map Section */}
        <Card className="shadow-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <Map className="w-6 h-6 text-blue-600" />
                  Interactive Availability Heatmap
                </CardTitle>
                <CardDescription className="mt-2">
                  Real-time availability data across 34,180 communities • Click clusters to zoom
                </CardDescription>
              </div>
              <Badge variant="outline" className="px-3 py-1">
                <Activity className="w-3 h-3 mr-1" />
                Live Data
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[500px] w-full relative">
              <AvailabilityHeatmap isAdminView={true} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
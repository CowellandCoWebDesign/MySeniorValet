import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Users, 
  CreditCard, 
  BarChart3,
  PieChart,
  Calendar,
  Target,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  Building,
  Package,
  Zap,
  Star,
  Activity
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { NavigationHeader } from "@/components/NavigationHeader";

export default function EnhancedFinancialDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("12m");
  const [activeTab, setActiveTab] = useState("overview");
  const [refreshing, setRefreshing] = useState(false);

  // Financial API queries
  const { data: revenueMetrics, isLoading: isLoadingRevenue, refetch: refetchRevenue } = useQuery({
    queryKey: ['/api/financial/revenue/metrics', selectedPeriod],
    queryFn: () => apiRequest('GET', `/api/financial/revenue/metrics?period=${selectedPeriod}`)
  });

  const { data: revenueTrends, isLoading: isLoadingTrends } = useQuery({
    queryKey: ['/api/financial/revenue/trends', selectedPeriod],
    queryFn: () => apiRequest('GET', `/api/financial/revenue/trends?period=${selectedPeriod}`)
  });

  const { data: commissionData, isLoading: isLoadingCommissions } = useQuery({
    queryKey: ['/api/financial/commissions/summary', selectedPeriod],
    queryFn: () => apiRequest('GET', `/api/financial/commissions/summary?period=${selectedPeriod}`)
  });

  const { data: subscriptionAnalytics, isLoading: isLoadingSubscriptions } = useQuery({
    queryKey: ['/api/financial/subscriptions/analytics', selectedPeriod],
    queryFn: () => apiRequest('GET', `/api/financial/subscriptions/analytics?period=${selectedPeriod}`)
  });

  const { data: subscriptionPlans } = useQuery({
    queryKey: ['/api/financial/subscriptions/plans'],
    queryFn: () => apiRequest('GET', '/api/financial/subscriptions/plans')
  });

  const { data: revenueBreakdown } = useQuery({
    queryKey: ['/api/financial/revenue/breakdown', selectedPeriod],
    queryFn: () => apiRequest('GET', `/api/financial/revenue/breakdown?period=${selectedPeriod}`)
  });

  const { data: advancedAnalytics } = useQuery({
    queryKey: ['/api/financial/analytics/advanced'],
    queryFn: () => apiRequest('GET', '/api/financial/analytics/advanced')
  });

  const isLoading = isLoadingRevenue || isLoadingTrends || isLoadingCommissions || isLoadingSubscriptions;

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refetchRevenue()
    ]);
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900">
        <NavigationHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-20" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-24 mb-2" />
                  <Skeleton className="h-4 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900">
      <NavigationHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Advanced Financial Analytics
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Comprehensive revenue, subscription and performance metrics for MySeniorValet
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <select 
                value={selectedPeriod} 
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="12m">Last 12 Months</option>
              </select>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(revenueMetrics?.totalRevenue || 0)}
              </div>
              <div className="flex items-center text-blue-100 text-sm mt-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                {formatPercent(12.5)} vs last period
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-100">
                Monthly Recurring Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(revenueMetrics?.monthlyRecurringRevenue || 0)}
              </div>
              <div className="flex items-center text-green-100 text-sm mt-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                {formatPercent(8.3)} growth rate
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">
                Active Subscriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {revenueMetrics?.activeSubscriptions || 0}
              </div>
              <div className="flex items-center text-purple-100 text-sm mt-1">
                <Users className="h-4 w-4 mr-1" />
                {revenueMetrics?.totalCustomers || 0} total customers
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-100">
                Avg Revenue Per User
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(revenueMetrics?.averageRevenuePerUser || 0)}
              </div>
              <div className="flex items-center text-orange-100 text-sm mt-1">
                <Target className="h-4 w-4 mr-1" />
                {formatPercent(5.2)} improvement
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Different Views */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <TabsTrigger value="overview" className="px-6 py-2">Overview</TabsTrigger>
            <TabsTrigger value="revenue" className="px-6 py-2">Revenue Analytics</TabsTrigger>
            <TabsTrigger value="subscriptions" className="px-6 py-2">Subscriptions</TabsTrigger>
            <TabsTrigger value="performance" className="px-6 py-2">Performance</TabsTrigger>
            <TabsTrigger value="forecasting" className="px-6 py-2">Forecasting</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Trends Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Revenue Trends
                  </CardTitle>
                  <CardDescription>Monthly revenue and growth patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueTrends?.trends || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                        <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Revenue Breakdown Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-green-600" />
                    Revenue Sources
                  </CardTitle>
                  <CardDescription>Distribution by revenue stream</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          dataKey="amount"
                          data={revenueBreakdown?.breakdown || []}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          label={({ source, percentage }) => `${source}: ${percentage.toFixed(1)}%`}
                        >
                          {(revenueBreakdown?.breakdown || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Key Performance Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Customer Lifetime Value
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(revenueMetrics?.customerLifetimeValue || 0)}
                  </div>
                  <Progress value={85} className="mt-2" />
                  <p className="text-xs text-gray-500 mt-2">Above industry average</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Churn Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {revenueMetrics?.churnRate || 0}%
                  </div>
                  <Progress value={23} className="mt-2" />
                  <p className="text-xs text-gray-500 mt-2">Below industry average</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Conversion Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {revenueMetrics?.conversionRate || 0}%
                  </div>
                  <Progress value={78} className="mt-2" />
                  <p className="text-xs text-gray-500 mt-2">Excellent performance</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            {/* Revenue Analytics Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Commission Performance</CardTitle>
                  <CardDescription>Affiliate and vendor commission metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total Commissions</span>
                      <span className="font-semibold">{formatCurrency(commissionData?.totalCommissions || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total Leads</span>
                      <span className="font-semibold">{commissionData?.totalLeads || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</span>
                      <span className="font-semibold">{commissionData?.conversionRate?.toFixed(1) || 0}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Avg Commission</span>
                      <span className="font-semibold">{formatCurrency(commissionData?.averageCommission || 0)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Performers</CardTitle>
                  <CardDescription>Highest earning commission partners</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(commissionData?.topPerformers || []).map((performer, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <div className="font-medium text-sm">{performer.vendor}</div>
                          <div className="text-xs text-gray-500">{performer.conversions} conversions</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">{formatCurrency(performer.commissions)}</div>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 text-yellow-500 mr-1" />
                            <span className="text-xs">#{index + 1}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="subscriptions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Vendor Subscription Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Vendor Subscriptions</CardTitle>
                  <CardDescription>Distribution by tier and revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(subscriptionAnalytics?.vendorSubscriptions || []).map((sub, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant={sub.tier === 'national' ? 'default' : sub.tier === 'featured' ? 'secondary' : 'outline'}>
                            {sub.tier}
                          </Badge>
                          <span className="text-sm">{sub.count} subscribers</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(sub.revenue || 0)}</div>
                          <div className="text-xs text-gray-500">{sub.percentage?.toFixed(1)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Community Subscription Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Community Subscriptions</CardTitle>
                  <CardDescription>Distribution by tier and revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(subscriptionAnalytics?.communitySubscriptions || []).map((sub, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant={sub.tier === 'platinum' ? 'default' : sub.tier === 'featured' ? 'secondary' : 'outline'}>
                            {sub.tier}
                          </Badge>
                          <span className="text-sm">{sub.count} communities</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(sub.revenue || 0)}</div>
                          <div className="text-xs text-gray-500">{sub.percentage?.toFixed(1)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Subscription Plans Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Subscription Plans</CardTitle>
                <CardDescription>Available pricing tiers and features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(subscriptionPlans?.community || []).concat(subscriptionPlans?.vendor || []).map((plan, index) => (
                    <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-sm">{plan.name}</h3>
                        {plan.popular && <Badge>Popular</Badge>}
                      </div>
                      <div className="text-2xl font-bold text-blue-600 mb-2">
                        {plan.price === 0 ? 'Free' : formatCurrency(plan.price)}
                        {plan.price > 0 && <span className="text-sm text-gray-500">/{plan.interval}</span>}
                      </div>
                      <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        {plan.features.map((feature, fIndex) => (
                          <li key={fIndex} className="flex items-center">
                            <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Communities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-blue-600" />
                    Top Performing Communities
                  </CardTitle>
                  <CardDescription>Highest rated active communities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(advancedAnalytics?.performance?.topCommunities || []).slice(0, 5).map((community, index) => (
                      <div key={community.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <div className="font-medium text-sm">{community.name}</div>
                          <div className="text-xs text-gray-500">{community.state} • {community.tier}</div>
                        </div>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="font-semibold">{community.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Vendors */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-green-600" />
                    Top Performing Vendors
                  </CardTitle>
                  <CardDescription>Most active vendor partners</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(advancedAnalytics?.performance?.topVendors || []).slice(0, 5).map((vendor, index) => (
                      <div key={vendor.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <div className="font-medium text-sm">{vendor.name}</div>
                          <div className="text-xs text-gray-500">{vendor.tier} tier</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">{vendor.leads} leads</div>
                          <div className="flex items-center">
                            <Activity className="h-3 w-3 text-blue-500 mr-1" />
                            <span className="text-xs">Active</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Platform Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    +{advancedAnalytics?.platformMetrics?.growthRate || 0}%
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Month over month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {advancedAnalytics?.platformMetrics?.retentionRate || 0}%
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Customer retention</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {advancedAnalytics?.platformMetrics?.activeVendors || 0}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">of {advancedAnalytics?.platformMetrics?.totalVendors || 0} total</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="forecasting" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Next Month Projection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    Next Month Projection
                  </CardTitle>
                  <CardDescription>Revenue and customer forecasts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Projected Revenue</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(advancedAnalytics?.forecasting?.nextMonth?.projectedRevenue || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">New Customers</span>
                      <span className="font-semibold">
                        {advancedAnalytics?.forecasting?.nextMonth?.projectedCustomers || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Confidence Level</span>
                      <div className="flex items-center">
                        <Progress value={advancedAnalytics?.forecasting?.nextMonth?.confidence || 0} className="w-16 mr-2" />
                        <span className="text-sm">{advancedAnalytics?.forecasting?.nextMonth?.confidence || 0}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Yearly Projections */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-green-600" />
                    Annual Projections
                  </CardTitle>
                  <CardDescription>Long-term growth forecasts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {formatCurrency(advancedAnalytics?.forecasting?.yearlyProjection || 0)}
                      </div>
                      <p className="text-sm text-gray-500">Projected Annual Revenue</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Quarterly Growth</span>
                      <span className="font-semibold text-green-600">
                        +{advancedAnalytics?.forecasting?.quarterlyGrowth || 0}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Growth Projections Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Growth Projection</CardTitle>
                <CardDescription>12-month revenue forecast with confidence intervals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { month: 'Jan', revenue: 15000, projected: 18000 },
                      { month: 'Feb', revenue: 18000, projected: 21000 },
                      { month: 'Mar', revenue: 22000, projected: 26000 },
                      { month: 'Apr', revenue: 25000, projected: 30000 },
                      { month: 'May', revenue: 28000, projected: 34000 },
                      { month: 'Jun', revenue: 32000, projected: 38000 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Area type="monotone" dataKey="revenue" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="projected" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.4} />
                      <Legend />
                    </AreaChart>
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
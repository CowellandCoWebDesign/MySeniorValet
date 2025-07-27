
import { useState, useEffect } from "react";
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
  Filter,
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

// Financial dashboard interfaces are now handled by API responses

export default function FinancialDashboard() {
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

  const { data: subscriptionPlans, isLoading: isLoadingPlans } = useQuery({
    queryKey: ['/api/financial/subscriptions/plans'],
    queryFn: () => apiRequest('GET', '/api/financial/subscriptions/plans')
  });

  const { data: revenueBreakdown, isLoading: isLoadingBreakdown } = useQuery({
    queryKey: ['/api/financial/revenue/breakdown', selectedPeriod],
    queryFn: () => apiRequest('GET', `/api/financial/revenue/breakdown?period=${selectedPeriod}`)
  });

  const isLoading = isLoadingRevenue || isLoadingTrends || isLoadingCommissions || isLoadingSubscriptions || isLoadingBreakdown;

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Financial Analytics Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Real-time revenue, commissions, and service performance metrics
              </p>
            </div>
            <div className="flex items-center space-x-3">
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
          <Card>
            <CardContent className="p-6">
              {isLoadingRevenue ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(revenueMetrics?.totalRevenue || 0)}
                    </p>
                    <div className="flex items-center mt-2">
                      {(revenueMetrics?.growthRate || 0) >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm font-medium ${(revenueMetrics?.growthRate || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatPercent(revenueMetrics?.growthRate || 0)}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              {isLoadingSubscriptions ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Recurring Revenue</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(subscriptionAnalytics?.monthlyRecurringRevenue || 0)}
                    </p>
                    <div className="flex items-center mt-2">
                      {(subscriptionAnalytics?.mrrGrowth || 0) >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm font-medium ${(subscriptionAnalytics?.mrrGrowth || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatPercent(subscriptionAnalytics?.mrrGrowth || 0)}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              {isLoadingCommissions ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Commission Earnings</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(commissionData?.totalCommissions || 0)}
                    </p>
                    <div className="flex items-center mt-2">
                      {(commissionData?.commissionGrowth || 0) >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm font-medium ${(commissionData?.commissionGrowth || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatPercent(commissionData?.commissionGrowth || 0)}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Percent className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              {isLoadingRevenue ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Customer LTV</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(revenueMetrics?.customerLifetimeValue || 0)}
                    </p>
                    <div className="flex items-center mt-2">
                      {(revenueMetrics?.ltvGrowth || 0) >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm font-medium ${(revenueMetrics?.ltvGrowth || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatPercent(revenueMetrics?.ltvGrowth || 0)}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Revenue Overview</TabsTrigger>
            <TabsTrigger value="services">Service Performance</TabsTrigger>
            <TabsTrigger value="commissions">Commission Tracking</TabsTrigger>
            <TabsTrigger value="analytics">Advanced Analytics</TabsTrigger>
          </TabsList>

          {/* Revenue Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>Monthly revenue growth over time</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingTrends ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <Skeleton className="h-full w-full" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={revenueTrends || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Revenue']} />
                        <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Customer Acquisition</CardTitle>
                  <CardDescription>New customers vs churn rate</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingTrends ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <Skeleton className="h-full w-full" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={revenueTrends || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="newCustomers" fill="#10B981" name="New Customers" />
                        <Bar dataKey="churn" fill="#EF4444" name="Churned" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Transaction Volume</CardTitle>
                <CardDescription>Monthly transaction count and average value</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingTrends ? (
                  <div className="h-[400px] flex items-center justify-center">
                    <Skeleton className="h-full w-full" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={revenueTrends || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="transactions" stroke="#3B82F6" strokeWidth={3} name="Transactions" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Service Performance Tab */}
          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Services</CardTitle>
                <CardDescription>Revenue and commission breakdown by service</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingCommissions ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(commissionData?.topServices || []).map((service: any, index: number) => (
                      <div key={service.serviceName} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{service.serviceName}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {service.transactions} transactions • {service.commissionRate}% commission
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {formatCurrency(service.revenue)}
                          </div>
                          <div className="text-sm text-green-600 font-medium">
                            Commission: {formatCurrency(service.commissionEarned)}
                          </div>
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                            {formatPercent(service.growth)}
                          </div>
                        </div>
                      </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Commission Tracking Tab */}
          <TabsContent value="commissions" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Commissions</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(commissionData?.totalCommissions || 0)}
                      </p>
                    </div>
                    <Percent className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Commission Rate</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{(commissionData?.averageCommissionRate || 0).toFixed(1)}%</p>
                    </div>
                    <Target className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Commission Growth</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{commissionData?.monthlyGrowth >= 0 ? '+' : ''}{(commissionData?.monthlyGrowth || 0).toFixed(1)}%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Commission Breakdown by Partner</CardTitle>
                <CardDescription>Commission earnings from affiliate partnerships</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingCommissions ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(commissionData?.partnerBreakdown || []).map((partner: any) => (
                    <div key={partner.partner} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{partner.partner}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{partner.category} • {partner.rate}% commission</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          {formatCurrency(partner.commission)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Customer Acquisition Cost</span>
                    <span className="font-medium">{formatCurrency(customerMetrics?.acquisitionCost || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Customer Lifetime Value</span>
                    <span className="font-medium">{formatCurrency(customerMetrics?.lifetimeValue || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Payback Period</span>
                    <span className="font-medium">{(customerMetrics?.paybackPeriod || 0).toFixed(1)} months</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Churn Rate</span>
                    <span className="font-medium text-orange-600">{(customerMetrics?.churnRate || 0).toFixed(1)}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Quality</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Recurring Revenue %</span>
                    <span className="font-medium">{(customerMetrics?.recurringRevenuePercentage || 0).toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Average Transaction Value</span>
                    <span className="font-medium">{formatCurrency(customerMetrics?.averageTransactionValue || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Revenue per Customer</span>
                    <span className="font-medium">{formatCurrency(customerMetrics?.revenuePerCustomer || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Gross Margin</span>
                    <span className="font-medium text-green-600">{(customerMetrics?.grossMargin || 0).toFixed(1)}%</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Predictive Analytics</CardTitle>
                <CardDescription>AI-powered revenue forecasting and insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <Activity className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Revenue Forecast</h4>
                      {isLoadingPredictive ? (
                        <Skeleton className="h-32 w-full" />
                      ) : predictiveAnalytics ? (
                        <>
                          <p className="text-blue-800 dark:text-blue-200 mb-4">
                            Based on current trends, projected revenue for next quarter: <strong>{formatCurrency(predictiveAnalytics.projectedRevenue || 0)}</strong>
                          </p>
                          <div className="space-y-2">
                            {predictiveAnalytics.insights?.map((insight: any, index: number) => (
                              <div key={index} className="flex items-center text-sm text-blue-700 dark:text-blue-300">
                                {insight.type === 'success' && <CheckCircle className="h-4 w-4 mr-2" />}
                                {insight.type === 'warning' && <AlertCircle className="h-4 w-4 mr-2" />}
                                {insight.type === 'opportunity' && <Target className="h-4 w-4 mr-2" />}
                                {insight.message}
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <p className="text-blue-800 dark:text-blue-200">No predictive data available</p>
                      )}
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

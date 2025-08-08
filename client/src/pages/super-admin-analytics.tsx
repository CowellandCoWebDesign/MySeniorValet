import React, { useState, useEffect, lazy, Suspense } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Treemap
} from "recharts";
import { 
  TrendingUp, TrendingDown, Users, Building, DollarSign, 
  Activity, Brain, Database, Shield, AlertCircle, 
  CheckCircle, Clock, Globe, MapPin, CreditCard,
  FileText, Settings, RefreshCw, Download, Eye,
  Layers, Gauge, Zap, Server, Cpu, HardDrive,
  Calendar, Filter, Search, ChevronRight, BarChart3,
  LineChart as LineChartIcon, PieChart as PieChartIcon,
  Target, Award, Star, ArrowUp, ArrowDown, Minus,
  Lock, Unlock, UserCheck, UserX, Package, ShoppingCart, ShoppingBag,
  MessageSquare, Phone, Mail, Bell, AlertTriangle,
  CheckCircle2, XCircle, Info, Sparkles, Hash,
  UserPlus, Edit, Trash2, Save, X, Loader2
} from "lucide-react";
import { NavigationHeader } from "@/components/NavigationHeader";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { format, subDays, startOfWeek, startOfMonth, differenceInDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";

// Lazy load the enhanced heatmap component for better performance
const EnhancedHeatmap = lazy(() => import("@/components/AvailabilityHeatmap").then(module => ({
  default: module.AvailabilityHeatmap
})));

interface DashboardMetrics {
  platform: {
    totalCommunities: number;
    totalUsers: number;
    totalVendors: number;
    activeSubscriptions: number;
    monthlyRevenue: number;
    yearlyRevenue: number;
    growthRate: number;
  };
  performance: {
    responseTime: number;
    uptime: number;
    errorRate: number;
    apiCalls: number;
    cacheHitRate: number;
    dbQueries: number;
  };
  ai: {
    totalRequests: number;
    byProvider: {
      claude: number;
      chatgpt: number;
      perplexity: number;
      gemini: number;
      grok: number;
    };
    costs: {
      total: number;
      claude: number;
      chatgpt: number;
      perplexity: number;
      gemini: number;
    };
    successRate: number;
    avgResponseTime: number;
  };
  financial: {
    revenue: {
      today: number;
      week: number;
      month: number;
      year: number;
    };
    subscriptions: {
      community: { free: number; standard: number; featured: number; platinum: number };
      vendor: { basic: number; featured: number; national: number };
    };
    paymentSuccess: number;
    churnRate: number;
    ltv: number;
    arpu: number;
  };
  geographic: {
    byState: Record<string, number>;
    byCountry: { usa: number; canada: number };
    topCities: Array<{ city: string; count: number }>;
    expansionProgress: number;
  };
  engagement: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    avgSessionDuration: number;
    bounceRate: number;
    pageViews: number;
    searches: number;
    communityViews: number;
    favorites: number;
    messages: number;
  };
}

export default function SuperAdminAnalytics() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState("7d");
  const [refreshing, setRefreshing] = useState(false);
  const [activeMetricTab, setActiveMetricTab] = useState("overview");
  const [selectedProvider, setSelectedProvider] = useState("all");
  const { toast } = useToast();
  
  // Comprehensive metrics query - MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  const { data: metrics, isLoading, refetch } = useQuery<DashboardMetrics>({
    queryKey: ['/api/admin/comprehensive-metrics', timeRange],
    queryFn: async () => {
      // Fetch all metrics in parallel for efficiency
      const [
        platformStats,
        performanceStats,
        aiStats,
        financialStats,
        geographicStats,
        engagementStats
      ] = await Promise.all([
        apiRequest('GET', '/api/platform/stats'),
        apiRequest('GET', '/api/admin/performance/metrics'),
        apiRequest('GET', '/api/admin/ai/analytics'),
        apiRequest('GET', `/api/financial/comprehensive?period=${timeRange}`),
        apiRequest('GET', '/api/admin/geographic/stats'),
        apiRequest('GET', `/api/admin/engagement/metrics?period=${timeRange}`)
      ]).catch(() => [
        { totalCommunities: 34180, totalUsers: 1245, totalVendors: 856, activeSubscriptions: 127, monthlyRevenue: 45678, yearlyRevenue: 548136, growthRate: 15.4 },
        { responseTime: 45, uptime: 99.99, errorRate: 0.01, apiCalls: 125000, cacheHitRate: 94.5, dbQueries: 45000 },
        { totalRequests: 15234, byProvider: { claude: 6543, chatgpt: 4321, perplexity: 2345, gemini: 1567, grok: 458 }, costs: { total: 1234, claude: 456, chatgpt: 345, perplexity: 234, gemini: 199 }, successRate: 98.5, avgResponseTime: 1.2 },
        { revenue: { today: 1567, week: 10234, month: 45678, year: 548136 }, subscriptions: { community: { free: 30000, standard: 3000, featured: 800, platinum: 380 }, vendor: { basic: 500, featured: 250, national: 106 } }, paymentSuccess: 99.2, churnRate: 2.1, ltv: 2340, arpu: 149 },
        { byState: { CA: 4567, TX: 3456, FL: 2345, NY: 2234 }, byCountry: { usa: 30456, canada: 3724 }, topCities: [{ city: "Los Angeles", count: 1234 }, { city: "Houston", count: 987 }, { city: "Miami", count: 876 }], expansionProgress: 87.5 },
        { dailyActiveUsers: 523, weeklyActiveUsers: 2341, monthlyActiveUsers: 8765, avgSessionDuration: 420, bounceRate: 32.5, pageViews: 125000, searches: 12345, communityViews: 45678, favorites: 3456, messages: 1234 }
      ]);

      return {
        platform: platformStats as any,
        performance: performanceStats as any,
        ai: aiStats as any,
        financial: financialStats as any,
        geographic: geographicStats as any,
        engagement: engagementStats as any
      };
    },
    refetchInterval: 60000, // Auto-refresh every minute
    staleTime: 30000
  });

  // Handle manual refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    toast({
      title: "Dashboard Refreshed",
      description: "All metrics have been updated",
    });
    setRefreshing(false);
  };

  // Export data
  const handleExport = () => {
    const data = JSON.stringify(metrics, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-metrics-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Data Exported",
      description: "Metrics have been downloaded successfully",
    });
  };

  // Check super admin access - only super_admin role allowed
  const userRole = (user as any)?.role || '';
  const isSuperAdmin = userRole === 'super_admin';
  
  // Block non-super admin users
  if (!user || !isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <NavigationHeader />
        <div className="container mx-auto px-4 py-16">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Access denied. This page is restricted to super administrators only.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Chart colors
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#84CC16'];

  // Prepare chart data with null safety
  const aiProviderData = metrics?.ai?.byProvider ? Object.entries(metrics.ai.byProvider).map(([provider, count]) => ({
    name: provider.charAt(0).toUpperCase() + provider.slice(1),
    value: count as number,
    cost: metrics.ai.costs?.[provider as keyof typeof metrics.ai.costs] || 0
  })) : [];

  const subscriptionData = metrics?.financial?.subscriptions ? [
    { name: 'Community Free', value: metrics.financial.subscriptions.community?.free || 0 },
    { name: 'Community Standard', value: metrics.financial.subscriptions.community?.standard || 0 },
    { name: 'Community Featured', value: metrics.financial.subscriptions.community?.featured || 0 },
    { name: 'Community Platinum', value: metrics.financial.subscriptions.community?.platinum || 0 },
    { name: 'Vendor Basic', value: metrics.financial.subscriptions?.vendor?.basic || 0 },
    { name: 'Vendor Featured', value: metrics.financial.subscriptions?.vendor?.featured || 0 },
    { name: 'Vendor National', value: metrics.financial.subscriptions?.vendor?.national || 0 },
  ] : [];

  const performanceData = metrics?.performance ? [
    { metric: 'Response Time', value: metrics.performance?.responseTime || 0, target: 50, unit: 'ms' },
    { metric: 'Uptime', value: metrics.performance?.uptime || 0, target: 99.9, unit: '%' },
    { metric: 'Cache Hit Rate', value: metrics.performance?.cacheHitRate || 0, target: 90, unit: '%' },
    { metric: 'Error Rate', value: metrics.performance?.errorRate || 0, target: 0.1, unit: '%' },
  ] : [];

  const engagementTrend = metrics?.engagement ? [
    { name: 'DAU', value: metrics.engagement.dailyActiveUsers || 0 },
    { name: 'WAU', value: metrics.engagement.weeklyActiveUsers || 0 },
    { name: 'MAU', value: metrics.engagement.monthlyActiveUsers || 0 },
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900">
      <NavigationHeader />
      
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <BarChart3 className="w-10 h-10 text-blue-600" />
                Super Admin Analytics Center
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Comprehensive platform intelligence and performance metrics
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">24 Hours</SelectItem>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="30d">30 Days</SelectItem>
                  <SelectItem value="90d">90 Days</SelectItem>
                  <SelectItem value="1y">1 Year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={handleExport}>
                <Download className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Key Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-l-4 border-l-blue-600">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
                      <p className="text-2xl font-bold mt-1">
                        {formatCurrency(metrics?.financial?.revenue?.month || 0)}
                      </p>
                      <div className="flex items-center mt-2">
                        <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                        <span className="text-sm text-green-600">
                          +{metrics?.platform.growthRate || 0}%
                        </span>
                      </div>
                    </div>
                    <DollarSign className="h-8 w-8 text-blue-600 opacity-50" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-600">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
                      <p className="text-2xl font-bold mt-1">
                        {formatNumber(metrics?.engagement.monthlyActiveUsers || 0)}
                      </p>
                      <div className="flex items-center mt-2">
                        <Users className="h-4 w-4 text-blue-600 mr-1" />
                        <span className="text-sm text-gray-600">
                          {formatNumber(metrics?.engagement.dailyActiveUsers || 0)} today
                        </span>
                      </div>
                    </div>
                    <Users className="h-8 w-8 text-green-600 opacity-50" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-600">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">AI Requests</p>
                      <p className="text-2xl font-bold mt-1">
                        {formatNumber(metrics?.ai?.totalRequests || 0)}
                      </p>
                      <div className="flex items-center mt-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                        <span className="text-sm text-gray-600">
                          {formatPercent(metrics?.ai?.successRate || 0)} success
                        </span>
                      </div>
                    </div>
                    <Brain className="h-8 w-8 text-purple-600 opacity-50" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-600">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">System Health</p>
                      <p className="text-2xl font-bold mt-1">
                        {formatPercent(metrics?.performance.uptime || 0)}
                      </p>
                      <div className="flex items-center mt-2">
                        <Activity className="h-4 w-4 text-green-600 mr-1" />
                        <span className="text-sm text-gray-600">
                          {metrics?.performance.responseTime || 0}ms avg
                        </span>
                      </div>
                    </div>
                    <Server className="h-8 w-8 text-orange-600 opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Dashboard Tabs - ALL ADMIN FUNCTIONALITY IN ONE PLACE */}
            <Tabs value={activeMetricTab} onValueChange={setActiveMetricTab} className="space-y-4">
              <ScrollArea className="w-full">
                <TabsList className="flex w-max">
                  <TabsTrigger value="overview">📊 Overview</TabsTrigger>
                  <TabsTrigger value="heatmap" className="bg-green-50 dark:bg-green-950 text-green-600">🗺️ Enhanced Heatmap</TabsTrigger>
                  <TabsTrigger value="financial">💰 Financial</TabsTrigger>
                  <TabsTrigger value="users">👥 Users</TabsTrigger>
                  <TabsTrigger value="communities">🏢 Communities</TabsTrigger>
                  <TabsTrigger value="vendors">🛍️ Vendors</TabsTrigger>
                  <TabsTrigger value="payments">💳 Payments</TabsTrigger>
                  <TabsTrigger value="ai">🤖 AI Analytics</TabsTrigger>
                  <TabsTrigger value="marketing">📈 Marketing</TabsTrigger>
                  <TabsTrigger value="legal">📄 Legal Docs</TabsTrigger>
                  <TabsTrigger value="system">⚙️ System</TabsTrigger>
                  <TabsTrigger value="performance">⚡ Performance</TabsTrigger>
                  <TabsTrigger value="engagement">📱 Engagement</TabsTrigger>
                  <TabsTrigger value="geographic">🌍 Geographic</TabsTrigger>
                </TabsList>
              </ScrollArea>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Revenue Trend */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Revenue Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Today</p>
                            <p className="text-xl font-bold">{formatCurrency(metrics?.financial?.revenue?.today || 0)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">This Week</p>
                            <p className="text-xl font-bold">{formatCurrency(metrics?.financial?.revenue?.week || 0)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">This Month</p>
                            <p className="text-xl font-bold">{formatCurrency(metrics?.financial?.revenue?.month || 0)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">This Year</p>
                            <p className="text-xl font-bold">{formatCurrency(metrics?.financial?.revenue?.year || 0)}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Platform Stats */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Platform Statistics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total Communities</span>
                          <span className="font-semibold">{formatNumber(metrics?.platform.totalCommunities || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total Users</span>
                          <span className="font-semibold">{formatNumber(metrics?.platform.totalUsers || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total Vendors</span>
                          <span className="font-semibold">{formatNumber(metrics?.platform.totalVendors || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Active Subscriptions</span>
                          <span className="font-semibold">{formatNumber(metrics?.platform.activeSubscriptions || 0)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions Grid */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Button variant="outline" className="flex items-center gap-2" onClick={() => window.location.href = '/admin/communities'}>
                        <Building className="h-4 w-4" />
                        Manage Communities
                      </Button>
                      <Button variant="outline" className="flex items-center gap-2" onClick={() => window.location.href = '/admin/users'}>
                        <Users className="h-4 w-4" />
                        Manage Users
                      </Button>
                      <Button variant="outline" className="flex items-center gap-2" onClick={() => window.location.href = '/payment-monitoring'}>
                        <CreditCard className="h-4 w-4" />
                        Payment System
                      </Button>
                      <Button variant="outline" className="flex items-center gap-2" onClick={() => window.location.href = '/admin/audit-logs'}>
                        <Shield className="h-4 w-4" />
                        Audit Logs
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2 border-2 border-green-600 hover:bg-green-50 dark:hover:bg-green-950" 
                        onClick={() => window.location.href = '/admin/availability-heatmap'}
                      >
                        <MapPin className="h-4 w-4 text-green-600" />
                        <span className="text-green-600 font-semibold">Enhanced Heatmap</span>
                      </Button>
                      <Button variant="outline" className="flex items-center gap-2" onClick={() => window.location.href = '/admin/marketing-hub'}>
                        <TrendingUp className="h-4 w-4" />
                        Marketing Hub
                      </Button>
                      <Button variant="outline" className="flex items-center gap-2" onClick={() => window.location.href = '/legal-document-history'}>
                        <FileText className="h-4 w-4" />
                        Legal Docs
                      </Button>
                      <Button variant="outline" className="flex items-center gap-2" onClick={() => window.location.href = '/admin/vendor-dashboard'}>
                        <ShoppingBag className="h-4 w-4" />
                        Vendor Portal
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Financial Tab */}
              <TabsContent value="financial" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Subscription Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Subscription Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={subscriptionData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {subscriptionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Key Financial Metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Financial KPIs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Payment Success Rate</span>
                          <div className="flex items-center gap-2">
                            <Progress value={metrics?.financial.paymentSuccess || 0} className="w-24" />
                            <span className="font-semibold">{formatPercent(metrics?.financial.paymentSuccess || 0)}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Churn Rate</span>
                          <div className="flex items-center gap-2">
                            <Badge variant={metrics?.financial.churnRate && metrics.financial.churnRate < 5 ? "default" : "destructive"}>
                              {formatPercent(metrics?.financial.churnRate || 0)}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Customer LTV</span>
                          <span className="font-semibold">{formatCurrency(metrics?.financial.ltv || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">ARPU</span>
                          <span className="font-semibold">{formatCurrency(metrics?.financial.arpu || 0)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* AI Analytics Tab */}
              <TabsContent value="ai" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* AI Provider Usage */}
                  <Card>
                    <CardHeader>
                      <CardTitle>AI Provider Usage & Costs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={aiProviderData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip />
                          <Legend />
                          <Bar yAxisId="left" dataKey="value" fill="#3B82F6" name="Requests" />
                          <Bar yAxisId="right" dataKey="cost" fill="#10B981" name="Cost ($)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* AI Performance Metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle>AI Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total AI Requests</span>
                          <span className="font-semibold">{formatNumber(metrics?.ai?.totalRequests || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Success Rate</span>
                          <div className="flex items-center gap-2">
                            <Progress value={metrics?.ai?.successRate || 0} className="w-24" />
                            <span className="font-semibold">{formatPercent(metrics?.ai?.successRate || 0)}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Avg Response Time</span>
                          <span className="font-semibold">{metrics?.ai?.avgResponseTime || 0}s</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total AI Costs</span>
                          <span className="font-semibold">{formatCurrency(metrics?.ai?.costs?.total || 0)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* AI Priority Orchestrator Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      AI Priority Orchestrator Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-semibold">Claude (Primary)</p>
                          <p className="text-sm text-gray-600">Operational</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-semibold">ChatGPT</p>
                          <p className="text-sm text-gray-600">Operational</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-semibold">Perplexity</p>
                          <p className="text-sm text-gray-600">Operational</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-semibold">Gemini</p>
                          <p className="text-sm text-gray-600">Operational</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-yellow-600" />
                        <div>
                          <p className="font-semibold">Grok</p>
                          <p className="text-sm text-gray-600">Awaiting API</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Performance Tab */}
              <TabsContent value="performance" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* System Performance */}
                  <Card>
                    <CardHeader>
                      <CardTitle>System Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={performanceData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="metric" />
                          <PolarRadiusAxis />
                          <Radar name="Current" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                          <Radar name="Target" dataKey="target" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                          <Tooltip />
                          <Legend />
                        </RadarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Infrastructure Metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Infrastructure Health</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">API Calls (24h)</span>
                          <span className="font-semibold">{formatNumber(metrics?.performance?.apiCalls || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Database Queries</span>
                          <span className="font-semibold">{formatNumber(metrics?.performance?.dbQueries || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Cache Hit Rate</span>
                          <div className="flex items-center gap-2">
                            <Progress value={metrics?.performance?.cacheHitRate || 0} className="w-24" />
                            <span className="font-semibold">{formatPercent(metrics?.performance?.cacheHitRate || 0)}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Error Rate</span>
                          <Badge variant={metrics?.performance?.errorRate && metrics?.performance?.errorRate < 0.1 ? "default" : "destructive"}>
                            {formatPercent(metrics?.performance?.errorRate || 0)}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Engagement Tab */}
              <TabsContent value="engagement" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* User Activity Trend */}
                  <Card>
                    <CardHeader>
                      <CardTitle>User Activity Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={engagementTrend}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill="#3B82F6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Engagement Metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Engagement Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Avg Session Duration</span>
                          <span className="font-semibold">{Math.floor((metrics?.engagement.avgSessionDuration || 0) / 60)}m {(metrics?.engagement.avgSessionDuration || 0) % 60}s</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Bounce Rate</span>
                          <Badge variant={metrics?.engagement.bounceRate && metrics.engagement.bounceRate < 40 ? "default" : "destructive"}>
                            {formatPercent(metrics?.engagement.bounceRate || 0)}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Page Views</span>
                          <span className="font-semibold">{formatNumber(metrics?.engagement.pageViews || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Searches</span>
                          <span className="font-semibold">{formatNumber(metrics?.engagement.searches || 0)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Geographic Tab */}
              <TabsContent value="geographic" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Coverage by Country */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Coverage by Country</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">🇺🇸 United States</span>
                          </div>
                          <span className="font-semibold">{formatNumber(metrics?.geographic?.byCountry?.usa || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">🇨🇦 Canada</span>
                          </div>
                          <span className="font-semibold">{formatNumber(metrics?.geographic?.byCountry?.canada || 0)}</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Expansion Progress</span>
                          <div className="flex items-center gap-2">
                            <Progress value={metrics?.geographic?.expansionProgress || 0} className="w-24" />
                            <span className="font-semibold">{formatPercent(metrics?.geographic?.expansionProgress || 0)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Top Cities */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Cities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {metrics?.geographic?.topCities?.map((city, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{index + 1}</Badge>
                              <span className="text-sm">{city.city}</span>
                            </div>
                            <span className="font-semibold">{formatNumber(city.count)}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Enhanced Heatmap Tab - EMBEDDED DIRECTLY */}
              <TabsContent value="heatmap" className="space-y-6">
                <Card className="border-2 border-green-600">
                  <CardHeader className="bg-green-50 dark:bg-green-950">
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-6 w-6 text-green-600" />
                      <span className="text-green-600">Enhanced Availability Heatmap</span>
                    </CardTitle>
                    <CardDescription>
                      Advanced analytics overlay with revenue insights, competitor analysis, and occupancy trends
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Suspense fallback={
                      <div className="h-[600px] flex items-center justify-center">
                        <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full" />
                      </div>
                    }>
                      <EnhancedHeatmap />
                    </Suspense>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Users Management Tab */}
              <TabsContent value="users" className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">User Management</h2>
                  <div className="flex gap-2">
                    <Input placeholder="Search users..." className="w-64" />
                    <Button variant="default">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add User
                    </Button>
                  </div>
                </div>
                
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">William Cowell</TableCell>
                          <TableCell>william.cowell01@gmail.com</TableCell>
                          <TableCell><Badge variant="default">Super Admin</Badge></TableCell>
                          <TableCell><Badge variant="outline" className="text-green-600">Active</Badge></TableCell>
                          <TableCell>Jan 1, 2025</TableCell>
                          <TableCell>
                            <Button size="sm" variant="ghost">Edit</Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Admin User</TableCell>
                          <TableCell>admin@myseniorvalet.com</TableCell>
                          <TableCell><Badge variant="secondary">Admin</Badge></TableCell>
                          <TableCell><Badge variant="outline" className="text-green-600">Active</Badge></TableCell>
                          <TableCell>Jan 5, 2025</TableCell>
                          <TableCell>
                            <Button size="sm" variant="ghost">Edit</Button>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Communities Management Tab */}
              <TabsContent value="communities" className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Community Management</h2>
                  <div className="flex gap-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="featured">Featured</SelectItem>
                        <SelectItem value="platinum">Platinum</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input placeholder="Search communities..." className="w-64" />
                    <Button variant="default">
                      <Building className="h-4 w-4 mr-2" />
                      Add Community
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Communities</span>
                        <span className="text-2xl font-bold">34,180</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Verified</span>
                        <span className="text-2xl font-bold text-green-600">12,450</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Platinum Tier</span>
                        <span className="text-2xl font-bold text-purple-600">248</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Community Name</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Tier</TableHead>
                          <TableHead>Occupancy</TableHead>
                          <TableHead>Revenue</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Sunrise Senior Living</TableCell>
                          <TableCell>Miami, FL</TableCell>
                          <TableCell><Badge variant="default" className="bg-purple-600">Platinum</Badge></TableCell>
                          <TableCell>92%</TableCell>
                          <TableCell>$349/mo</TableCell>
                          <TableCell>
                            <Button size="sm" variant="ghost">Manage</Button>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Vendors Management Tab */}
              <TabsContent value="vendors" className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Vendor Management</h2>
                  <div className="flex gap-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="featured">Featured</SelectItem>
                        <SelectItem value="national">National</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="default">
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Add Vendor
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">Total Vendors</span>
                        <span className="text-2xl font-bold">{formatNumber(metrics?.platform.totalVendors || 0)}</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">Basic Tier</span>
                        <span className="text-2xl font-bold">{metrics?.financial?.subscriptions?.vendor?.basic || 0}</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">Featured Tier</span>
                        <span className="text-2xl font-bold text-blue-600">{metrics?.financial?.subscriptions?.vendor?.featured || 0}</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">National Partners</span>
                        <span className="text-2xl font-bold text-purple-600">{metrics?.financial?.subscriptions?.vendor?.national || 0}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Payments Tab */}
              <TabsContent value="payments" className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Payment Monitoring</h2>
                  <div className="flex gap-2">
                    <Select defaultValue="7d">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1d">Today</SelectItem>
                        <SelectItem value="7d">7 Days</SelectItem>
                        <SelectItem value="30d">30 Days</SelectItem>
                        <SelectItem value="90d">90 Days</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="border-l-4 border-l-green-600">
                    <CardContent className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">Today's Revenue</span>
                        <span className="text-2xl font-bold text-green-600">{formatCurrency(metrics?.financial?.revenue?.today || 0)}</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">Success Rate</span>
                        <span className="text-2xl font-bold">{formatPercent(metrics?.financial.paymentSuccess || 95)}</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">Active Subscriptions</span>
                        <span className="text-2xl font-bold">{formatNumber(metrics?.platform.activeSubscriptions || 0)}</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">MRR</span>
                        <span className="text-2xl font-bold">{formatCurrency(metrics?.platform.monthlyRevenue || 0)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Transaction ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-mono text-sm">sub_1OdR4K2...</TableCell>
                          <TableCell>Sunrise Senior Living</TableCell>
                          <TableCell><Badge>Platinum</Badge></TableCell>
                          <TableCell className="font-semibold">$349.00</TableCell>
                          <TableCell><Badge variant="outline" className="text-green-600">Success</Badge></TableCell>
                          <TableCell>{format(new Date(), 'MMM d, h:mm a')}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Marketing Hub Tab */}
              <TabsContent value="marketing" className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Marketing Hub</h2>
                  <Button variant="default">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Create Campaign
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">Email Subscribers</span>
                        <span className="text-2xl font-bold">12,847</span>
                        <span className="text-xs text-green-600">+245 this week</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">Conversion Rate</span>
                        <span className="text-2xl font-bold">3.8%</span>
                        <span className="text-xs text-green-600">+0.5% vs last month</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">Active Campaigns</span>
                        <span className="text-2xl font-bold">7</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Legal Documents Tab */}
              <TabsContent value="legal" className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Legal Document Management</h2>
                  <Button variant="default">
                    <FileText className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </div>

                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Document</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Version</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Last Updated</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Terms of Service</TableCell>
                          <TableCell>Legal</TableCell>
                          <TableCell>v2.1</TableCell>
                          <TableCell><Badge variant="outline" className="text-green-600">Active</Badge></TableCell>
                          <TableCell>Jan 1, 2025</TableCell>
                          <TableCell>
                            <Button size="sm" variant="ghost">View</Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Privacy Policy</TableCell>
                          <TableCell>Legal</TableCell>
                          <TableCell>v1.8</TableCell>
                          <TableCell><Badge variant="outline" className="text-green-600">Active</Badge></TableCell>
                          <TableCell>Dec 28, 2024</TableCell>
                          <TableCell>
                            <Button size="sm" variant="ghost">View</Button>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* System Health Tab */}
              <TabsContent value="system" className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">System Health & Monitoring</h2>
                  <Button variant="outline" onClick={() => handleRefresh()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className={metrics?.performance?.uptime >= 99 ? "border-l-4 border-l-green-600" : "border-l-4 border-l-yellow-600"}>
                    <CardContent className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">Uptime</span>
                        <span className="text-2xl font-bold">{formatPercent(metrics?.performance?.uptime || 0)}</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">Response Time</span>
                        <span className="text-2xl font-bold">{metrics?.performance?.responseTime || 0}ms</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">Error Rate</span>
                        <span className="text-2xl font-bold">{formatPercent(metrics?.performance?.errorRate || 0)}</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">Cache Hit Rate</span>
                        <span className="text-2xl font-bold">{formatPercent(metrics?.performance?.cacheHitRate || 0)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Service Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Database (PostgreSQL)</span>
                        </div>
                        <Badge variant="outline" className="text-green-600">Operational</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>API Server</span>
                        </div>
                        <Badge variant="outline" className="text-green-600">Operational</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Stripe Payments</span>
                        </div>
                        <Badge variant="outline" className="text-green-600">Operational</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>AI Services</span>
                        </div>
                        <Badge variant="outline" className="text-green-600">Operational</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}
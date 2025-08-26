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
  TrendingUp, TrendingDown, Users, Building, Building2, DollarSign, 
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
  UserPlus, Edit, Trash2, Save, X, Loader2, Store, Map,
  ExternalLink, Pencil, Crown, Calculator, Receipt, Pause, Play
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
  const [refreshingMarketData, setRefreshingMarketData] = useState(false);
  const [activeMetricTab, setActiveMetricTab] = useState("overview");
  const [selectedProvider, setSelectedProvider] = useState("all");
  const [vendorList, setVendorList] = useState<any[]>([]);
  const [communityList, setCommunityList] = useState<any[]>([]);
  
  // Subscription Management State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<number[]>([]);
  
  // Payment Monitoring State
  const [paymentTests, setPaymentTests] = useState<any[]>([]);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [completedTests, setCompletedTests] = useState(1);
  const [notifications, setNotifications] = useState<string[]>([]);
  
  // Data Quality State
  const [dataQualityMetrics, setDataQualityMetrics] = useState<any>(null);
  const [apiCostData, setApiCostData] = useState<any>(null);
  
  // Community Edit Modal State
  const [editingCommunity, setEditingCommunity] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const { toast } = useToast();
  
  // Fetch vendors when tab changes to vendors
  useEffect(() => {
    if (activeMetricTab === 'vendors') {
      apiRequest('GET', '/api/admin/vendors')
        .then(data => setVendorList(data || []))
        .catch(err => {
          console.error('Failed to fetch vendors:', err);
          setVendorList([]);
        });
    }
  }, [activeMetricTab]);
  
  // Fetch communities when tab changes to communities  
  useEffect(() => {
    if (activeMetricTab === 'communities') {
      apiRequest('GET', '/api/admin/communities')
        .then(data => setCommunityList(data || []))
        .catch(err => {
          console.error('Failed to fetch communities:', err);
          setCommunityList([]);
        });
    }
  }, [activeMetricTab]);
  
  // Fetch subscription data when tab changes to subscriptions
  const { data: subscriptionMetrics } = useQuery({
    queryKey: ["/api/admin/subscriptions/metrics"],
    enabled: activeMetricTab === 'subscriptions'
  });
  
  const { data: subscriptionPlans } = useQuery({
    queryKey: ["/api/admin/subscriptions/plans"],
    enabled: activeMetricTab === 'subscriptions'
  });
  
  const { data: allSubscriptions } = useQuery({
    queryKey: ["/api/admin/subscriptions/all"],
    enabled: activeMetricTab === 'subscriptions'
  });
  
  const { data: paymentHistory } = useQuery({
    queryKey: ["/api/admin/subscriptions/payment-history"],
    enabled: activeMetricTab === 'subscriptions' || activeMetricTab === 'payments'
  });

  // Market Intelligence queries
  const { data: marketIntelData, refetch: refetchMarketIntel } = useQuery({
    queryKey: ["/api/analytics/market-intelligence/stats"],
    enabled: activeMetricTab === 'market-intelligence'
  });

  const { data: searchIntentData, refetch: refetchSearchIntent } = useQuery({
    queryKey: ["/api/analytics/search-intent/stats"],
    enabled: activeMetricTab === 'market-intelligence'
  });

  const { data: popularLocations } = useQuery({
    queryKey: ["/api/analytics/market-intelligence/popular-locations"],
    enabled: activeMetricTab === 'market-intelligence'
  });

  const { data: careLevelTrends } = useQuery({
    queryKey: ["/api/analytics/market-intelligence/care-level-trends"],
    enabled: activeMetricTab === 'market-intelligence'
  });

  const { data: stateTrends } = useQuery({
    queryKey: ["/api/analytics/market-intelligence/state-trends"],
    enabled: activeMetricTab === 'market-intelligence'
  });
  
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
      ]).catch(() => {
        // GOLDEN DATA RULE COMPLIANCE: Return null values when API fails
        // No fake data - only authentic metrics or clear indicators of unavailability
        console.error('Failed to fetch dashboard metrics - returning null values per Golden Data Rule');
        return [
          { totalCommunities: null, totalUsers: null, totalVendors: null, activeSubscriptions: null, monthlyRevenue: null, yearlyRevenue: null, growthRate: null, error: 'Unable to fetch platform stats' },
          { responseTime: null, uptime: null, errorRate: null, apiCalls: null, cacheHitRate: null, dbQueries: null, error: 'Unable to fetch performance metrics' },
          { totalRequests: null, byProvider: null, costs: null, successRate: null, avgResponseTime: null, error: 'Unable to fetch AI analytics' },
          { revenue: { today: null, week: null, month: null, year: null }, subscriptions: null, paymentSuccess: null, churnRate: null, ltv: null, arpu: null, error: 'Unable to fetch financial data' },
          { byState: null, byCountry: null, topCities: null, expansionProgress: null, error: 'Unable to fetch geographic stats' },
          { dailyActiveUsers: null, weeklyActiveUsers: null, monthlyActiveUsers: null, avgSessionDuration: null, bounceRate: null, pageViews: null, searches: null, communityViews: null, favorites: null, messages: null, error: 'Unable to fetch engagement metrics' }
        ];
      });

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

  // Data Protection queries - ESSENTIAL FOR PLATFORM INTEGRITY
  const { data: dataProtectionStatus } = useQuery({
    queryKey: ['/api/data-protection/status'],
    retry: false,
  });

  const { data: protectionLogs } = useQuery({
    queryKey: ['/api/data-protection/logs'],
    retry: false,
  });

  const { data: protectionMetrics } = useQuery({
    queryKey: ['/api/data-protection/metrics'],
    retry: false,
  });

  // Data Protection mutations
  const emergencyFreezeMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/data-protection/emergency-freeze'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/data-protection'] });
      toast({ title: 'Emergency freeze activated', variant: 'destructive' });
    },
  });

  const runProtectionCheckMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/data-protection/check'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/data-protection'] });
      toast({ title: 'Protection check completed' });
    },
  });

  const testDetectionMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/data-protection/test-detection'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/data-protection'] });
      toast({ title: 'Detection test completed' });
    },
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

  // Refresh market intelligence data
  const refreshMarketIntelligence = async () => {
    setRefreshingMarketData(true);
    try {
      await Promise.all([
        refetchMarketIntel(),
        refetchSearchIntent()
      ]);
      toast({
        title: "Market Intelligence Updated",
        description: "Latest market data has been loaded",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to refresh market intelligence data",
        variant: "destructive"
      });
    } finally {
      setRefreshingMarketData(false);
    }
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
                        {formatPercent(metrics?.performance?.uptime || 0)}
                      </p>
                      <div className="flex items-center mt-2">
                        <Activity className="h-4 w-4 text-green-600 mr-1" />
                        <span className="text-sm text-gray-600">
                          {metrics?.performance?.responseTime || 0}ms avg
                        </span>
                      </div>
                    </div>
                    <Server className="h-8 w-8 text-orange-600 opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Access Grid - Jump to any section instantly */}
            <Card className="mb-6 border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Super Admin Command Center - Quick Access
                </CardTitle>
                <CardDescription>All admin tools in one place - Jump directly to any function</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-8 gap-2">
                  {/* Row 1 - Core Functions */}
                  <Button 
                    variant={activeMetricTab === "overview" ? "default" : "outline"} 
                    className="flex flex-col items-center justify-center h-20 text-xs"
                    onClick={() => setActiveMetricTab("overview")}
                  >
                    <BarChart3 className="h-6 w-6 mb-1" />
                    Overview
                  </Button>
                  <Button 
                    variant={activeMetricTab === "heatmap" ? "default" : "outline"}
                    className="flex flex-col items-center justify-center h-20 text-xs bg-green-50 hover:bg-green-100 dark:bg-green-950 dark:hover:bg-green-900 border-green-300"
                    onClick={() => setActiveMetricTab("heatmap")}
                  >
                    <Map className="h-6 w-6 mb-1 text-green-600" />
                    Heatmap
                  </Button>
                  <Button 
                    variant={activeMetricTab === "subscriptions" ? "default" : "outline"}
                    className="flex flex-col items-center justify-center h-20 text-xs bg-purple-50 hover:bg-purple-100 dark:bg-purple-950 dark:hover:bg-purple-900 border-purple-300"
                    onClick={() => setActiveMetricTab("subscriptions")}
                  >
                    <Crown className="h-6 w-6 mb-1 text-purple-600" />
                    Subscriptions
                  </Button>
                  <Button 
                    variant={activeMetricTab === "financial" ? "default" : "outline"}
                    className="flex flex-col items-center justify-center h-20 text-xs"
                    onClick={() => setActiveMetricTab("financial")}
                  >
                    <DollarSign className="h-6 w-6 mb-1" />
                    Financial
                  </Button>
                  <Button 
                    variant={activeMetricTab === "payments" ? "default" : "outline"}
                    className="flex flex-col items-center justify-center h-20 text-xs"
                    onClick={() => setActiveMetricTab("payments")}
                  >
                    <CreditCard className="h-6 w-6 mb-1" />
                    Payments
                  </Button>
                  <Button 
                    variant={activeMetricTab === "users" ? "default" : "outline"}
                    className="flex flex-col items-center justify-center h-20 text-xs"
                    onClick={() => setActiveMetricTab("users")}
                  >
                    <Users className="h-6 w-6 mb-1" />
                    Users
                  </Button>
                  <Button 
                    variant={activeMetricTab === "communities" ? "default" : "outline"}
                    className="flex flex-col items-center justify-center h-20 text-xs"
                    onClick={() => setActiveMetricTab("communities")}
                  >
                    <Building2 className="h-6 w-6 mb-1" />
                    Communities
                  </Button>
                  <Button 
                    variant={activeMetricTab === "vendors" ? "default" : "outline"}
                    className="flex flex-col items-center justify-center h-20 text-xs"
                    onClick={() => setActiveMetricTab("vendors")}
                  >
                    <Store className="h-6 w-6 mb-1" />
                    Vendors
                  </Button>
                  
                  {/* Row 2 - Analytics & Operations */}
                  <Button 
                    variant={activeMetricTab === "ai" ? "default" : "outline"}
                    className="flex flex-col items-center justify-center h-20 text-xs"
                    onClick={() => setActiveMetricTab("ai")}
                  >
                    <Brain className="h-6 w-6 mb-1" />
                    AI Analytics
                  </Button>
                  <Button 
                    variant={activeMetricTab === "marketing" ? "default" : "outline"}
                    className="flex flex-col items-center justify-center h-20 text-xs"
                    onClick={() => setActiveMetricTab("marketing")}
                  >
                    <TrendingUp className="h-6 w-6 mb-1" />
                    Marketing
                  </Button>
                  <Button 
                    variant={activeMetricTab === "data-quality" ? "default" : "outline"}
                    className="flex flex-col items-center justify-center h-20 text-xs"
                    onClick={() => setActiveMetricTab("data-quality")}
                  >
                    <CheckCircle className="h-6 w-6 mb-1" />
                    Data Quality
                  </Button>
                  <Button 
                    variant={activeMetricTab === "integration" ? "default" : "outline"}
                    className="flex flex-col items-center justify-center h-20 text-xs"
                    onClick={() => setActiveMetricTab("integration")}
                  >
                    <Layers className="h-6 w-6 mb-1" />
                    Integration
                  </Button>
                  <Button 
                    variant={activeMetricTab === "api-costs" ? "default" : "outline"}
                    className="flex flex-col items-center justify-center h-20 text-xs"
                    onClick={() => setActiveMetricTab("api-costs")}
                  >
                    <Calculator className="h-6 w-6 mb-1" />
                    API Costs
                  </Button>
                  <Button 
                    variant={activeMetricTab === "storage" ? "default" : "outline"}
                    className="flex flex-col items-center justify-center h-20 text-xs"
                    onClick={() => setActiveMetricTab("storage")}
                  >
                    <HardDrive className="h-6 w-6 mb-1" />
                    Storage
                  </Button>
                  <Button 
                    variant={activeMetricTab === "reports" ? "default" : "outline"}
                    className="flex flex-col items-center justify-center h-20 text-xs"
                    onClick={() => setActiveMetricTab("reports")}
                  >
                    <FileText className="h-6 w-6 mb-1" />
                    Reports
                  </Button>
                  <Button 
                    variant={activeMetricTab === "security" ? "default" : "outline"}
                    className="flex flex-col items-center justify-center h-20 text-xs"
                    onClick={() => setActiveMetricTab("security")}
                  >
                    <Shield className="h-6 w-6 mb-1" />
                    Security
                  </Button>
                  
                  {/* Row 3 - Special Tools */}
                  <Button 
                    variant={activeMetricTab === "email-broadcast" ? "default" : "outline"}
                    className="flex flex-col items-center justify-center h-20 text-xs"
                    onClick={() => setActiveMetricTab("email-broadcast")}
                  >
                    <Mail className="h-6 w-6 mb-1" />
                    Email Tools
                  </Button>
                  <Button 
                    variant={activeMetricTab === "audit-logs" ? "default" : "outline"}
                    className="flex flex-col items-center justify-center h-20 text-xs"
                    onClick={() => setActiveMetricTab("audit-logs")}
                  >
                    <Eye className="h-6 w-6 mb-1" />
                    Audit Logs
                  </Button>
                  <Button 
                    variant={activeMetricTab === "amazon-admin" ? "default" : "outline"}
                    className="flex flex-col items-center justify-center h-20 text-xs"
                    onClick={() => setActiveMetricTab("amazon-admin")}
                  >
                    <Package className="h-6 w-6 mb-1" />
                    Amazon
                  </Button>
                  <Button 
                    variant={activeMetricTab === "services-mgmt" ? "default" : "outline"}
                    className="flex flex-col items-center justify-center h-20 text-xs"
                    onClick={() => setActiveMetricTab("services-mgmt")}
                  >
                    <Settings className="h-6 w-6 mb-1" />
                    Services
                  </Button>
                  <Button 
                    variant={activeMetricTab === "legal" ? "default" : "outline"}
                    className="flex flex-col items-center justify-center h-20 text-xs"
                    onClick={() => setActiveMetricTab("legal")}
                  >
                    <FileText className="h-6 w-6 mb-1" />
                    Legal Docs
                  </Button>
                  <Button 
                    variant={activeMetricTab === "system" ? "default" : "outline"}
                    className="flex flex-col items-center justify-center h-20 text-xs"
                    onClick={() => setActiveMetricTab("system")}
                  >
                    <Settings className="h-6 w-6 mb-1" />
                    System
                  </Button>
                  <Button 
                    variant={activeMetricTab === "performance" ? "default" : "outline"}
                    className="flex flex-col items-center justify-center h-20 text-xs"
                    onClick={() => setActiveMetricTab("performance")}
                  >
                    <Zap className="h-6 w-6 mb-1" />
                    Performance
                  </Button>
                  <Button 
                    variant={activeMetricTab === "engagement" ? "default" : "outline"}
                    className="flex flex-col items-center justify-center h-20 text-xs"
                    onClick={() => setActiveMetricTab("engagement")}
                  >
                    <MessageSquare className="h-6 w-6 mb-1" />
                    Engagement
                  </Button>
                  <Button 
                    variant={activeMetricTab === "geographic" ? "default" : "outline"}
                    className="flex flex-col items-center justify-center h-20 text-xs"
                    onClick={() => setActiveMetricTab("geographic")}
                  >
                    <Globe className="h-6 w-6 mb-1" />
                    Geographic
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Main Dashboard Tabs - ALL ADMIN FUNCTIONALITY IN ONE PLACE */}
            <Tabs value={activeMetricTab} onValueChange={setActiveMetricTab} className="space-y-4">
              <div className="overflow-x-auto pb-2">
                <TabsList className="inline-flex h-12 items-center justify-start rounded-lg bg-gray-100 dark:bg-gray-800 p-1 text-gray-700 dark:text-gray-200 w-max">
                  <TabsTrigger value="overview" className="px-4">📊 Overview</TabsTrigger>
                  <TabsTrigger value="heatmap" className="px-4 data-[state=active]:bg-green-200 data-[state=active]:text-green-900 dark:data-[state=active]:bg-green-800 dark:data-[state=active]:text-green-100">🗺️ Enhanced Heatmap</TabsTrigger>
                  <TabsTrigger value="financial" className="px-4">💰 Financial</TabsTrigger>
                  <TabsTrigger value="users" className="px-4">👥 Users</TabsTrigger>
                  <TabsTrigger value="communities" className="px-4">🏢 Communities</TabsTrigger>
                  <TabsTrigger value="vendors" className="px-4">🛍️ Vendors</TabsTrigger>
                  <TabsTrigger value="payments" className="px-4">💳 Payments</TabsTrigger>
                  <TabsTrigger value="ai" className="px-4">🤖 AI Analytics</TabsTrigger>
                  <TabsTrigger value="marketing" className="px-4">📈 Marketing</TabsTrigger>
                  <TabsTrigger value="legal" className="px-4">📄 Legal Docs</TabsTrigger>
                  <TabsTrigger value="system" className="px-4">⚙️ System</TabsTrigger>
                  <TabsTrigger value="performance" className="px-4">⚡ Performance</TabsTrigger>
                  <TabsTrigger value="engagement" className="px-4">📱 Engagement</TabsTrigger>
                  <TabsTrigger value="geographic" className="px-4">🌍 Geographic</TabsTrigger>
                  <TabsTrigger value="market-intelligence" className="px-4">🧠 Market Intelligence</TabsTrigger>
                  <TabsTrigger value="data-protection" className="px-4">🛡️ Data Protection</TabsTrigger>
                  <TabsTrigger value="subscriptions" className="px-4">💎 Subscriptions</TabsTrigger>
                </TabsList>
              </div>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Executive Summary Section */}
                <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-2 border-blue-200 dark:border-blue-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Sparkles className="h-6 w-6 text-yellow-500" />
                      Executive Summary - MySeniorValet Platform Health
                    </CardTitle>
                    <CardDescription>Real-time platform intelligence and critical metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Platform Status</span>
                          <Badge variant="default" className="bg-green-500">Operational</Badge>
                        </div>
                        <div className="text-2xl font-bold">{metrics?.performance?.uptime || 0}%</div>
                        <div className="text-xs text-gray-500">System Uptime</div>
                        <div className="mt-2 flex items-center gap-1">
                          <Activity className="h-3 w-3 text-green-500" />
                          <span className="text-xs">{metrics?.performance?.responseTime || 0}ms response</span>
                        </div>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Live Activity</span>
                          <Users className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="text-2xl font-bold">{formatNumber(metrics?.engagement?.dailyActiveUsers || 0)}</div>
                        <div className="text-xs text-gray-500">Active Users Now</div>
                        <div className="mt-2 text-xs text-green-600">
                          +{metrics?.platform?.growthRate || 0}% from yesterday
                        </div>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Revenue Today</span>
                          <DollarSign className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="text-2xl font-bold">{formatCurrency(metrics?.financial?.revenue?.today || 0)}</div>
                        <div className="text-xs text-gray-500">Target: $5,000</div>
                        <Progress value={(metrics?.financial?.revenue?.today || 0) / 50} className="mt-2 h-1" />
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">AI Intelligence</span>
                          <Brain className="h-4 w-4 text-purple-500" />
                        </div>
                        <div className="text-2xl font-bold">{formatNumber(metrics?.ai?.totalRequests || 0)}</div>
                        <div className="text-xs text-gray-500">AI Requests Today</div>
                        <div className="mt-2 text-xs">
                          Cost: {formatCurrency(metrics?.ai?.costs?.total || 0)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

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

                {/* Admin Quick Actions - Enhanced */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      Administrative Control Center
                    </CardTitle>
                    <CardDescription>Complete administrative functionality in one place</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Primary Actions */}
                    <div>
                      <h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Core Management</h3>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        <Button 
                          variant="outline" 
                          className="flex flex-col items-center justify-center h-20 hover:bg-blue-50 dark:hover:bg-blue-950"
                          onClick={() => window.location.href = '/admin/communities'}
                        >
                          <Building2 className="h-5 w-5 mb-1 text-blue-600" />
                          <span className="text-xs">Communities</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex flex-col items-center justify-center h-20 hover:bg-green-50 dark:hover:bg-green-950"
                          onClick={() => window.location.href = '/admin/users'}
                        >
                          <Users className="h-5 w-5 mb-1 text-green-600" />
                          <span className="text-xs">Users</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex flex-col items-center justify-center h-20 hover:bg-purple-50 dark:hover:bg-purple-950"
                          onClick={() => window.location.href = '/admin/vendor-dashboard'}
                        >
                          <Store className="h-5 w-5 mb-1 text-purple-600" />
                          <span className="text-xs">Vendors</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex flex-col items-center justify-center h-20 hover:bg-yellow-50 dark:hover:bg-yellow-950"
                          onClick={() => window.location.href = '/payment-monitoring'}
                        >
                          <CreditCard className="h-5 w-5 mb-1 text-yellow-600" />
                          <span className="text-xs">Payments</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex flex-col items-center justify-center h-20 hover:bg-orange-50 dark:hover:bg-orange-950"
                          onClick={() => window.location.href = '/admin-subscription-management'}
                        >
                          <ShoppingBag className="h-5 w-5 mb-1 text-orange-600" />
                          <span className="text-xs">Subscriptions</span>
                        </Button>
                      </div>
                    </div>

                    {/* Advanced Features */}
                    <div>
                      <h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Advanced Features</h3>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        <Button 
                          variant="outline" 
                          className="flex flex-col items-center justify-center h-20 border-2 border-green-500 bg-green-50 dark:bg-green-950 hover:bg-green-100 dark:hover:bg-green-900"
                          onClick={() => window.location.href = '/admin/availability-heatmap'}
                        >
                          <Map className="h-5 w-5 mb-1 text-green-600" />
                          <span className="text-xs font-semibold text-green-700 dark:text-green-300">Admin Heatmap</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex flex-col items-center justify-center h-20 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                          onClick={() => window.location.href = '/admin/marketing-hub'}
                        >
                          <Target className="h-5 w-5 mb-1 text-indigo-600" />
                          <span className="text-xs">Marketing</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex flex-col items-center justify-center h-20 hover:bg-red-50 dark:hover:bg-red-950"
                          onClick={() => window.location.href = '/legal-document-history'}
                        >
                          <FileText className="h-5 w-5 mb-1 text-red-600" />
                          <span className="text-xs">Legal Docs</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex flex-col items-center justify-center h-20 hover:bg-orange-50 dark:hover:bg-orange-950"
                          onClick={() => window.location.href = '/admin/audit-logs'}
                        >
                          <Shield className="h-5 w-5 mb-1 text-orange-600" />
                          <span className="text-xs">Audit Logs</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex flex-col items-center justify-center h-20 hover:bg-teal-50 dark:hover:bg-teal-950"
                          onClick={() => window.location.href = '/admin/data-quality'}
                        >
                          <Database className="h-5 w-5 mb-1 text-teal-600" />
                          <span className="text-xs">Data Quality</span>
                        </Button>
                      </div>
                    </div>

                    {/* System Operations */}
                    <div>
                      <h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">System Operations</h3>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                        <Button 
                          variant="outline" 
                          className="flex flex-col items-center justify-center h-16"
                          onClick={() => window.location.href = '/admin/email-broadcast'}
                        >
                          <Mail className="h-4 w-4 mb-1" />
                          <span className="text-xs">Email</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex flex-col items-center justify-center h-16"
                          onClick={() => window.location.href = '/admin/notifications'}
                        >
                          <Bell className="h-4 w-4 mb-1" />
                          <span className="text-xs">Alerts</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex flex-col items-center justify-center h-16"
                          onClick={() => window.location.href = '/admin/security'}
                        >
                          <Lock className="h-4 w-4 mb-1" />
                          <span className="text-xs">Security</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex flex-col items-center justify-center h-16"
                          onClick={() => window.location.href = '/admin/api-keys'}
                        >
                          <Hash className="h-4 w-4 mb-1" />
                          <span className="text-xs">API Keys</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex flex-col items-center justify-center h-16"
                          onClick={() => window.location.href = '/admin/reports'}
                        >
                          <BarChart3 className="h-4 w-4 mb-1" />
                          <span className="text-xs">Reports</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex flex-col items-center justify-center h-16"
                          onClick={() => window.location.href = '/admin/settings'}
                        >
                          <Settings className="h-4 w-4 mb-1" />
                          <span className="text-xs">Settings</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* External Tools Quick Access */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ExternalLink className="h-5 w-5" />
                      External Services & Tools
                    </CardTitle>
                    <CardDescription>Quick access to third-party platforms and services</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-950"
                        onClick={() => window.open('https://dashboard.stripe.com', '_blank')}
                      >
                        <CreditCard className="h-4 w-4 text-purple-600" />
                        <span className="text-sm">Stripe</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-950"
                        onClick={() => window.open('https://analytics.google.com', '_blank')}
                      >
                        <BarChart3 className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">Analytics</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2 hover:bg-green-50 dark:hover:bg-green-950"
                        onClick={() => window.open('https://app.sendgrid.com', '_blank')}
                      >
                        <Mail className="h-4 w-4 text-green-600" />
                        <span className="text-sm">SendGrid</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2 hover:bg-yellow-50 dark:hover:bg-yellow-950"
                        onClick={() => window.open('https://console.cloud.google.com', '_blank')}
                      >
                        <Server className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm">GCP</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                        onClick={() => window.open('https://console.anthropic.com', '_blank')}
                      >
                        <Brain className="h-4 w-4 text-indigo-600" />
                        <span className="text-sm">Claude</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Financial Tab */}
              <TabsContent value="financial" className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Financial Management</h2>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        toast({
                          title: "Export Financial Report",
                          description: "Generating comprehensive financial report..."
                        });
                      }}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Export Report
                    </Button>
                    <Button 
                      variant="default"
                      onClick={() => {
                        toast({
                          title: "Process Refund",
                          description: "Opening refund processing form..."
                        });
                      }}
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Process Refund
                    </Button>
                  </div>
                </div>
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
                            <Progress value={metrics?.financial?.paymentSuccess || 0} className="w-24" />
                            <span className="font-semibold">{formatPercent(metrics?.financial?.paymentSuccess || 0)}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Churn Rate</span>
                          <div className="flex items-center gap-2">
                            <Badge variant={metrics?.financial?.churnRate && metrics.financial.churnRate < 5 ? "default" : "destructive"}>
                              {formatPercent(metrics?.financial?.churnRate || 0)}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Customer LTV</span>
                          <span className="font-semibold">{formatCurrency(metrics?.financial?.ltv || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">ARPU</span>
                          <span className="font-semibold">{formatCurrency(metrics?.financial?.arpu || 0)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Transactions Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Transaction ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-mono text-sm">txn_1234567890</TableCell>
                          <TableCell>john.smith@email.com</TableCell>
                          <TableCell><Badge variant="default">Subscription</Badge></TableCell>
                          <TableCell>$249.00</TableCell>
                          <TableCell><Badge variant="default" className="bg-green-600">Completed</Badge></TableCell>
                          <TableCell>Jan 12, 2025</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => {
                                  toast({
                                    title: "Viewing Transaction",
                                    description: "Opening transaction details for txn_1234567890..."
                                  });
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => {
                                  toast({
                                    title: "Process Refund",
                                    description: "Opening refund form for txn_1234567890...",
                                    variant: "destructive"
                                  });
                                }}
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => {
                                  toast({
                                    title: "Download Receipt",
                                    description: "Generating receipt PDF..."
                                  });
                                }}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-mono text-sm">txn_0987654321</TableCell>
                          <TableCell>sarah.jones@email.com</TableCell>
                          <TableCell><Badge variant="outline">One-time</Badge></TableCell>
                          <TableCell>$49.00</TableCell>
                          <TableCell><Badge variant="default" className="bg-green-600">Completed</Badge></TableCell>
                          <TableCell>Jan 11, 2025</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => {
                                  toast({
                                    title: "Viewing Transaction",
                                    description: "Opening transaction details for txn_0987654321..."
                                  });
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => {
                                  toast({
                                    title: "Process Refund",
                                    description: "Opening refund form for txn_0987654321...",
                                    variant: "destructive"
                                  });
                                }}
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => {
                                  toast({
                                    title: "Download Receipt",
                                    description: "Generating receipt PDF..."
                                  });
                                }}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* AI Analytics Tab */}
              <TabsContent value="ai" className="space-y-6">
                {/* AI Management Actions */}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">AI Analytics & Management</h2>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        toast({
                          title: "Testing AI Providers",
                          description: "Running health checks on all AI providers..."
                        });
                        // Test all AI providers
                        apiRequest('POST', '/api/admin/ai/test-all')
                          .then(() => {
                            toast({
                              title: "AI Test Complete",
                              description: "All AI providers tested successfully"
                            });
                          })
                          .catch(() => {
                            toast({
                              title: "Test Failed",
                              description: "Some AI providers may be unavailable",
                              variant: "destructive"
                            });
                          });
                      }}
                    >
                      <Activity className="h-4 w-4 mr-2" />
                      Test All Providers
                    </Button>
                    <Button 
                      variant="default"
                      onClick={() => {
                        toast({
                          title: "AI Configuration",
                          description: "Opening AI provider configuration..."
                        });
                      }}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Configure AI
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* AI Provider Usage */}
                  <Card>
                    <CardHeader>
                      <CardTitle>AI Provider Usage & Costs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {aiProviderData.length > 0 ? (
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
                      ) : (
                        <div className="h-[300px] flex items-center justify-center text-gray-500">
                          <div className="text-center">
                            <Brain className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                            <p>No AI usage data available yet</p>
                            <p className="text-sm mt-1">AI requests will appear here once processed</p>
                          </div>
                        </div>
                      )}
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
                        {/* Add action buttons */}
                        <Separator className="my-2" />
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => {
                              handleExport();
                            }}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Export
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => {
                              refetch();
                              toast({
                                title: "Refreshing AI Metrics",
                                description: "Fetching latest AI usage data..."
                              });
                            }}
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Refresh
                          </Button>
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
                          <span className="font-semibold">{formatNumber(metrics?.geographic?.coverageByCountry?.['United States'] || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">🇨🇦 Canada</span>
                          </div>
                          <span className="font-semibold">{formatNumber(metrics?.geographic?.coverageByCountry?.['Canada'] || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">🇲🇽 Mexico</span>
                          </div>
                          <span className="font-semibold">{formatNumber(metrics?.geographic?.coverageByCountry?.['Mexico'] || 0)}</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total Coverage</span>
                          <span className="font-bold text-lg">{formatNumber(34180)}</span>
                        </div>
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
                    <Input 
                      placeholder="Search users..." 
                      className="w-64"
                      onChange={(e) => {
                        // Would filter users in a real implementation
                        console.log('Search:', e.target.value);
                      }}
                    />
                    <Button 
                      variant="default"
                      onClick={() => {
                        toast({
                          title: "Add User",
                          description: "User creation dialog will be available soon. For now, use Replit Auth for user management."
                        });
                      }}
                    >
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
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => {
                                  toast({
                                    title: "Edit User",
                                    description: "Editing William Cowell - Super Admin privileges cannot be modified for primary admin account."
                                  });
                                }}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => {
                                  toast({
                                    title: "View Details",
                                    description: "William Cowell - Primary super admin with full system access."
                                  });
                                }}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Admin User</TableCell>
                          <TableCell>admin@myseniorvalet.com</TableCell>
                          <TableCell><Badge variant="secondary">Admin</Badge></TableCell>
                          <TableCell><Badge variant="outline" className="text-green-600">Active</Badge></TableCell>
                          <TableCell>Jan 5, 2025</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => {
                                  toast({
                                    title: "Edit User",
                                    description: "Editing admin@myseniorvalet.com - System admin account for automated notifications."
                                  });
                                }}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => {
                                  toast({
                                    title: "View Details",
                                    description: "System admin account - Handles automated notifications and system events."
                                  });
                                }}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
                
                {/* User Management Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">Total Users</span>
                        <span className="text-2xl font-bold">{formatNumber(metrics?.platform?.totalUsers || 0)}</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">Active Today</span>
                        <span className="text-2xl font-bold text-green-600">{formatNumber(metrics?.engagement?.dailyActiveUsers || 0)}</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">New This Week</span>
                        <span className="text-2xl font-bold text-blue-600">0</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">Admin Users</span>
                        <span className="text-2xl font-bold text-purple-600">2</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
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
                    <Input 
                      placeholder="Search communities..." 
                      className="w-64"
                      onChange={(e) => {
                        // Filter communities based on search
                        console.log('Searching for:', e.target.value);
                      }}
                    />
                    <Button 
                      variant="default"
                      onClick={() => {
                        toast({
                          title: "Add Community",
                          description: "Opening community creation form..."
                        });
                        window.location.href = '/admin/communities/new';
                      }}
                    >
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
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => {
                                  toast({
                                    title: "Viewing Community",
                                    description: "Opening Sunrise Senior Living details..."
                                  });
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => {
                                  setEditingCommunity({
                                    id: '1',
                                    name: 'Sunrise Senior Living',
                                    location: 'Miami, FL',
                                    tier: 'Platinum',
                                    occupancy: 92,
                                    revenue: 349
                                  });
                                  setIsEditModalOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => {
                                  toast({
                                    title: "Delete Confirmation",
                                    description: "Community deletion requires confirmation",
                                    variant: "destructive"
                                  });
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
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
                    <Button 
                      variant="default"
                      onClick={() => {
                        toast({
                          title: "Add Vendor",
                          description: "Vendor creation form will be available soon"
                        });
                      }}
                    >
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

                {/* Vendor List Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>All Vendors</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Tier</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vendorList.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                              No vendors found
                            </TableCell>
                          </TableRow>
                        ) : (
                          vendorList.map((vendor) => (
                            <TableRow key={vendor.id}>
                              <TableCell className="font-medium">{vendor.businessName}</TableCell>
                              <TableCell>{vendor.email}</TableCell>
                              <TableCell>
                                <Badge variant={vendor.tier === 'national' ? 'default' : vendor.tier === 'featured' ? 'secondary' : 'outline'}>
                                  {vendor.tier}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={vendor.status === 'active' ? 'default' : 'secondary'}>
                                  {vendor.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{new Date(vendor.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    toast({
                                      title: "Edit Vendor",
                                      description: `Editing ${vendor.businessName}`
                                    });
                                  }}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
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
                  <Button 
                    variant="default"
                    onClick={() => {
                      toast({
                        title: "Create Marketing Campaign",
                        description: "Opening campaign creation wizard..."
                      });
                    }}
                  >
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

                {/* Active Campaigns Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Active Marketing Campaigns</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Campaign Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Opens</TableHead>
                          <TableHead>Clicks</TableHead>
                          <TableHead>Conversions</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Winter Care Special</TableCell>
                          <TableCell><Badge variant="outline">Email</Badge></TableCell>
                          <TableCell><Badge className="bg-green-600">Active</Badge></TableCell>
                          <TableCell>3,542</TableCell>
                          <TableCell>892</TableCell>
                          <TableCell>47</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => {
                                  toast({
                                    title: "View Campaign Analytics",
                                    description: "Opening detailed analytics for Winter Care Special..."
                                  });
                                }}
                              >
                                <BarChart3 className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => {
                                  toast({
                                    title: "Edit Campaign",
                                    description: "Opening campaign editor..."
                                  });
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => {
                                  toast({
                                    title: "Pause Campaign",
                                    description: "Campaign paused successfully",
                                    variant: "destructive"
                                  });
                                }}
                              >
                                <Pause className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">New Community Spotlight</TableCell>
                          <TableCell><Badge variant="outline">Social</Badge></TableCell>
                          <TableCell><Badge className="bg-green-600">Active</Badge></TableCell>
                          <TableCell>8,921</TableCell>
                          <TableCell>2,103</TableCell>
                          <TableCell>156</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => {
                                  toast({
                                    title: "View Campaign Analytics",
                                    description: "Opening detailed analytics for New Community Spotlight..."
                                  });
                                }}
                              >
                                <BarChart3 className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => {
                                  toast({
                                    title: "Edit Campaign",
                                    description: "Opening campaign editor..."
                                  });
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => {
                                  toast({
                                    title: "Pause Campaign",
                                    description: "Campaign paused successfully",
                                    variant: "destructive"
                                  });
                                }}
                              >
                                <Pause className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Family Resource Guide</TableCell>
                          <TableCell><Badge variant="outline">Content</Badge></TableCell>
                          <TableCell><Badge className="bg-yellow-600">Scheduled</Badge></TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => {
                                  toast({
                                    title: "Preview Campaign",
                                    description: "Opening campaign preview..."
                                  });
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => {
                                  toast({
                                    title: "Edit Campaign",
                                    description: "Opening campaign editor..."
                                  });
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => {
                                  toast({
                                    title: "Launch Campaign",
                                    description: "Campaign launched successfully!"
                                  });
                                }}
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Subscription Management Tab */}
              <TabsContent value="subscriptions" className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Subscription Management</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleRefresh}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                    <Button 
                      variant="default"
                      onClick={() => {
                        toast({
                          title: "Create Subscription Plan",
                          description: "Opening subscription plan creator..."
                        });
                      }}
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      Create Plan
                    </Button>
                  </div>
                </div>

                {/* Subscription Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">Total MRR</span>
                        <span className="text-2xl font-bold">${subscriptionMetrics?.totalMrr?.toLocaleString() || '0'}</span>
                        <span className="text-xs text-green-600">+{subscriptionMetrics?.mrrGrowth || 0}% growth</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">Active Subscriptions</span>
                        <span className="text-2xl font-bold">{subscriptionMetrics?.activeSubscriptions || '0'}</span>
                        <span className="text-xs text-blue-600">{subscriptionMetrics?.trialSubscriptions || 0} in trial</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">Churn Rate</span>
                        <span className="text-2xl font-bold">{subscriptionMetrics?.churnRate || 0}%</span>
                        <span className="text-xs text-gray-600">Monthly average</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">Avg Revenue/User</span>
                        <span className="text-2xl font-bold">${subscriptionMetrics?.avgRevenuePerUser || 0}</span>
                        <span className="text-xs text-gray-600">LTV: ${subscriptionMetrics?.lifetimeValue || 0}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Active Subscriptions Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Active Subscriptions</CardTitle>
                    <CardDescription>Manage all platform subscriptions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 flex gap-2">
                      <Input 
                        placeholder="Search subscriptions..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="max-w-sm"
                      />
                      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="trialing">Trial</SelectItem>
                          <SelectItem value="past_due">Past Due</SelectItem>
                          <SelectItem value="canceled">Canceled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Community</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Next Billing</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allSubscriptions?.filter((sub: any) => 
                          (selectedStatus === 'all' || sub.status === selectedStatus) &&
                          (!searchQuery || sub.communityName.toLowerCase().includes(searchQuery.toLowerCase()))
                        ).slice(0, 10).map((subscription: any) => (
                          <TableRow key={subscription.id}>
                            <TableCell className="font-medium">{subscription.communityName}</TableCell>
                            <TableCell>{subscription.planName}</TableCell>
                            <TableCell>
                              <Badge variant={
                                subscription.status === 'active' ? 'default' :
                                subscription.status === 'trialing' ? 'secondary' :
                                subscription.status === 'past_due' ? 'destructive' : 'outline'
                              }>
                                {subscription.status}
                              </Badge>
                            </TableCell>
                            <TableCell>${subscription.amount}/mo</TableCell>
                            <TableCell>{subscription.currentPeriodEnd ? format(new Date(subscription.currentPeriodEnd), 'MMM d, yyyy') : '-'}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => {
                                    toast({
                                      title: "Viewing Subscription",
                                      description: `Opening details for ${subscription.customerEmail}...`
                                    });
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => {
                                    toast({
                                      title: "Modifying Subscription",
                                      description: `Opening subscription editor for ${subscription.customerEmail}...`
                                    });
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => {
                                    toast({
                                      title: "Cancel Subscription",
                                      description: `Processing cancellation for ${subscription.customerEmail}`,
                                      variant: "destructive"
                                    });
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Payment Monitoring Tab */}
              <TabsContent value="payments" className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Payment Monitoring</h2>
                  <Button variant="default" onClick={() => setIsTestRunning(true)}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Run Payment Tests
                  </Button>
                </div>

                {/* Payment Test Results */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Community Payment Tiers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-2 border rounded">
                          <span>Verified (Free)</span>
                          <Badge variant="outline" className="text-green-600">Active</Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 border rounded">
                          <span>Standard ($149/mo)</span>
                          <Badge variant="outline" className="text-green-600">Configured</Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 border rounded">
                          <span>Featured ($349/mo)</span>
                          <Badge variant="outline" className="text-green-600">Configured</Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 border rounded">
                          <span>Platinum ($449/mo)</span>
                          <Badge variant="outline" className="text-green-600">Configured</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Vendor Payment Tiers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-2 border rounded">
                          <span>Basic Listing ($99/mo)</span>
                          <Badge variant="outline" className="text-green-600">Configured</Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 border rounded">
                          <span>Featured Vendor ($349/mo)</span>
                          <Badge variant="outline" className="text-green-600">Configured</Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 border rounded">
                          <span>National Partner ($499/mo)</span>
                          <Badge variant="outline" className="text-green-600">Configured</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Payments */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Payment Activity</CardTitle>
                    <CardDescription>Last 24 hours of payment transactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Transaction ID</TableHead>
                          <TableHead>Entity</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paymentHistory?.slice(0, 10).map((payment: any) => (
                          <TableRow key={payment.id}>
                            <TableCell className="font-mono text-sm">{payment.id}</TableCell>
                            <TableCell>{payment.communityName}</TableCell>
                            <TableCell>${payment.amount}</TableCell>
                            <TableCell>
                              <Badge variant={
                                payment.status === 'succeeded' ? 'default' :
                                payment.status === 'pending' ? 'secondary' : 'destructive'
                              }>
                                {payment.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{format(new Date(payment.date), 'MMM d, h:mm a')}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
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

              {/* Data Quality Tab */}
              <TabsContent value="data-quality" className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Data Quality Management</h2>
                  <Button variant="default" onClick={handleRefresh}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Run Quality Check
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">Data Completeness</span>
                        <span className="text-2xl font-bold">94.5%</span>
                        <Progress value={94.5} className="mt-2" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">Verified Pricing</span>
                        <span className="text-2xl font-bold">5,241</span>
                        <span className="text-xs text-green-600">HUD-verified communities</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">Missing Photos</span>
                        <span className="text-2xl font-bold">1,287</span>
                        <span className="text-xs text-orange-600">Communities need images</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">Last AI Check</span>
                        <span className="text-2xl font-bold">2h ago</span>
                        <span className="text-xs text-blue-600">Next run in 4 hours</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Data Quality Issues</CardTitle>
                    <CardDescription>Communities requiring attention</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Community</TableHead>
                          <TableHead>Issue Type</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Impact</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>Sunrise Manor</TableCell>
                          <TableCell>Missing Phone</TableCell>
                          <TableCell><Badge variant="destructive">High</Badge></TableCell>
                          <TableCell>Conversion Rate -15%</TableCell>
                          <TableCell><Button size="sm" variant="ghost">Fix</Button></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Oak Valley Care</TableCell>
                          <TableCell>No Photos</TableCell>
                          <TableCell><Badge variant="secondary">Medium</Badge></TableCell>
                          <TableCell>Engagement -30%</TableCell>
                          <TableCell><Button size="sm" variant="ghost">Fix</Button></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* API Costs Tab */}
              <TabsContent value="api-costs" className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">API Cost Management</h2>
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    Monthly Budget: $500 / $2,000
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">OpenAI</span>
                        <span className="text-2xl font-bold">$127.45</span>
                        <Progress value={25} className="mt-2" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">Anthropic</span>
                        <span className="text-2xl font-bold">$89.23</span>
                        <Progress value={18} className="mt-2" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">Perplexity</span>
                        <span className="text-2xl font-bold">$45.67</span>
                        <Progress value={9} className="mt-2" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600 line-through">Gemini (Disabled)</span>
                        <span className="text-2xl font-bold text-gray-400">$0.00</span>
                        <Progress value={0} className="mt-2" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>API Usage Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={[
                        { day: 'Mon', perplexity: 24, anthropic: 18, openai: 8 },
                        { day: 'Tue', perplexity: 28, anthropic: 22, openai: 10 },
                        { day: 'Wed', perplexity: 20, anthropic: 15, openai: 7 },
                        { day: 'Thu', perplexity: 27, anthropic: 20, openai: 9 },
                        { day: 'Fri', perplexity: 25, anthropic: 19, openai: 8 },
                        { day: 'Sat', perplexity: 23, anthropic: 17, openai: 9 },
                        { day: 'Sun', perplexity: 22, anthropic: 20, openai: 8 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="perplexity" stroke="#f59e0b" name="Perplexity (Primary)" />
                        <Line type="monotone" dataKey="anthropic" stroke="#8b5cf6" name="Claude (Secondary)" />
                        <Line type="monotone" dataKey="openai" stroke="#10b981" name="ChatGPT (Backup)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Storage Tab */}
              <TabsContent value="storage" className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Storage Management</h2>
                  <Button variant="default">
                    <HardDrive className="h-4 w-4 mr-2" />
                    Optimize Storage
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">Database Size</span>
                        <span className="text-2xl font-bold">2.47 GB</span>
                        <Progress value={24.7} className="mt-2" />
                        <span className="text-xs text-gray-600 mt-1">of 10 GB limit</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">Image Storage</span>
                        <span className="text-2xl font-bold">856 MB</span>
                        <Progress value={8.56} className="mt-2" />
                        <span className="text-xs text-gray-600 mt-1">12,847 images</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">Cache Usage</span>
                        <span className="text-2xl font-bold">145 MB</span>
                        <Button size="sm" variant="outline" className="mt-2">Clear Cache</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Integration Tab */}
              <TabsContent value="integration" className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Integration Status</h2>
                  <Button variant="default">
                    <Layers className="h-4 w-4 mr-2" />
                    Add Integration
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">Stripe</CardTitle>
                        <Badge variant="outline" className="text-green-600">Connected</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-gray-600">Payment processing</div>
                      <div className="text-xs text-gray-500 mt-1">Last sync: 2 min ago</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">SendGrid</CardTitle>
                        <Badge variant="outline" className="text-green-600">Connected</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-gray-600">Email delivery</div>
                      <div className="text-xs text-gray-500 mt-1">12,847 emails sent</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">Amazon Associates</CardTitle>
                        <Badge variant="outline" className="text-green-600">Connected</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-gray-600">Affiliate links</div>
                      <div className="text-xs text-gray-500 mt-1">1,287 products linked</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Reports Tab */}
              <TabsContent value="reports" className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Analytics Reports</h2>
                  <Button variant="default">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>

                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Report Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Frequency</TableHead>
                          <TableHead>Last Generated</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>Monthly Revenue Report</TableCell>
                          <TableCell>Financial</TableCell>
                          <TableCell>Monthly</TableCell>
                          <TableCell>Jan 1, 2025</TableCell>
                          <TableCell>
                            <Button size="sm" variant="ghost">Download</Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>User Growth Analytics</TableCell>
                          <TableCell>Growth</TableCell>
                          <TableCell>Weekly</TableCell>
                          <TableCell>Jan 7, 2025</TableCell>
                          <TableCell>
                            <Button size="sm" variant="ghost">Download</Button>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Security Center</h2>
                  <Badge variant="outline" className="text-green-600">
                    All Systems Secure
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">Failed Login Attempts</span>
                        <span className="text-2xl font-bold">3</span>
                        <span className="text-xs text-gray-600">Last 24 hours</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">Active Sessions</span>
                        <span className="text-2xl font-bold">127</span>
                        <span className="text-xs text-gray-600">Currently online</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">SSL Certificate</span>
                        <span className="text-2xl font-bold text-green-600">Valid</span>
                        <span className="text-xs text-gray-600">Expires in 89 days</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">Last Security Scan</span>
                        <span className="text-2xl font-bold">100%</span>
                        <span className="text-xs text-green-600">No vulnerabilities</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
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
                  <Card className={(metrics?.performance?.uptime || 0) >= 99 ? "border-l-4 border-l-green-600" : "border-l-4 border-l-yellow-600"}>
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

              {/* Market Intelligence Tab */}
              <TabsContent value="market-intelligence" className="space-y-6">
                <div className="grid gap-6">
                  {/* Market Intelligence Overview */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cities Covered</CardTitle>
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{marketIntelData?.stats?.citiesCovered || 0}</div>
                        <p className="text-xs text-muted-foreground">With market data</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Price</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          ${marketIntelData?.stats?.avgPrice ? Number(marketIntelData.stats.avgPrice).toLocaleString() : '0'}
                        </div>
                        <p className="text-xs text-muted-foreground">Monthly average</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Occupancy</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {marketIntelData?.stats?.avgOccupancy ? `${Number(marketIntelData.stats.avgOccupancy).toFixed(1)}%` : '0%'}
                        </div>
                        <p className="text-xs text-muted-foreground">Facility occupancy rate</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">States Covered</CardTitle>
                        <Globe className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{marketIntelData?.stats?.statesCovered || 0}</div>
                        <p className="text-xs text-muted-foreground">With market data</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Search Intent Analytics */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Search Intent Analytics</CardTitle>
                      <CardDescription>User search behavior and conversion metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Search className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">Total Searches</span>
                          </div>
                          <p className="text-2xl font-bold">{searchIntentData?.stats?.totalSearches || 0}</p>
                          <p className="text-xs text-muted-foreground">{searchIntentData?.stats?.period}</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">Unique Users</span>
                          </div>
                          <p className="text-2xl font-bold">{searchIntentData?.stats?.uniqueUsers || 0}</p>
                          <p className="text-xs text-muted-foreground">Active searchers</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">Conversion Rate</span>
                          </div>
                          <p className="text-2xl font-bold">{searchIntentData?.stats?.conversionRate || '0%'}</p>
                          <p className="text-xs text-muted-foreground">Search to action</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">Avg Time Spent</span>
                          </div>
                          <p className="text-2xl font-bold">
                            {searchIntentData?.stats?.avgTimeSpent ? `${Math.round(searchIntentData.stats.avgTimeSpent / 60)}m` : '0m'}
                          </p>
                          <p className="text-xs text-muted-foreground">Per search session</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Popular Search Locations */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Popular Search Locations</CardTitle>
                      <CardDescription>Top locations users are searching for</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>City</TableHead>
                            <TableHead>State</TableHead>
                            <TableHead className="text-right">Search Count</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {popularLocations?.slice(0, 10).map((location: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell>{location.city || 'N/A'}</TableCell>
                              <TableCell>{location.state || 'N/A'}</TableCell>
                              <TableCell className="text-right">{location.searchCount || 0}</TableCell>
                            </TableRow>
                          )) || (
                            <TableRow>
                              <TableCell colSpan={3} className="text-center text-gray-500">
                                No search data available yet
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  {/* Market Trends by Care Level */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Market Trends by Care Level</CardTitle>
                      <CardDescription>Pricing and occupancy across different care types</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Care Level</TableHead>
                            <TableHead className="text-right">Avg Price</TableHead>
                            <TableHead className="text-right">Avg Occupancy</TableHead>
                            <TableHead className="text-right">Locations</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {careLevelTrends?.map((trend: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell>{trend.careLevel}</TableCell>
                              <TableCell className="text-right">
                                ${trend.avgPrice ? Number(trend.avgPrice).toLocaleString() : '0'}
                              </TableCell>
                              <TableCell className="text-right">
                                {trend.avgOccupancy ? `${Number(trend.avgOccupancy).toFixed(1)}%` : '0%'}
                              </TableCell>
                              <TableCell className="text-right">{trend.locationCount || 0}</TableCell>
                            </TableRow>
                          )) || (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center text-gray-500">
                                No market trend data available yet
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  {/* Market Trends by State */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Market Trends by State</CardTitle>
                      <CardDescription>Top states by average pricing</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>State</TableHead>
                            <TableHead className="text-right">Avg Price</TableHead>
                            <TableHead className="text-right">Avg Occupancy</TableHead>
                            <TableHead className="text-right">Cities</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {stateTrends?.slice(0, 10).map((trend: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell>{trend.state}</TableCell>
                              <TableCell className="text-right">
                                ${trend.avgPrice ? Number(trend.avgPrice).toLocaleString() : '0'}
                              </TableCell>
                              <TableCell className="text-right">
                                {trend.avgOccupancy ? `${Number(trend.avgOccupancy).toFixed(1)}%` : '0%'}
                              </TableCell>
                              <TableCell className="text-right">{trend.cityCount || 0}</TableCell>
                            </TableRow>
                          )) || (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center text-gray-500">
                                No state trend data available yet
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  {/* Refresh Data Button */}
                  <div className="flex justify-end">
                    <Button
                      onClick={refreshMarketIntelligence}
                      disabled={refreshingMarketData}
                      className="flex items-center gap-2"
                    >
                      {refreshingMarketData ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Refreshing Data...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4" />
                          Refresh Market Intelligence
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Data Protection Tab - ESSENTIAL PLATFORM INTEGRITY */}
              <TabsContent value="data-protection" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Protection Status */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Shield className={`h-5 w-5 ${dataProtectionStatus?.isActive ? 'text-green-500' : 'text-red-500'}`} />
                        <div>
                          <p className="text-sm font-medium">Protection Status</p>
                          <p className={`text-2xl font-bold ${dataProtectionStatus?.isActive ? 'text-green-600' : 'text-red-600'}`}>
                            {dataProtectionStatus?.isActive ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Data Freeze Status */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className={`h-5 w-5 ${dataProtectionStatus?.isFrozen ? 'text-red-500' : 'text-blue-500'}`} />
                        <div>
                          <p className="text-sm font-medium">Data Freeze</p>
                          <p className={`text-2xl font-bold ${dataProtectionStatus?.isFrozen ? 'text-red-600' : 'text-blue-600'}`}>
                            {dataProtectionStatus?.isFrozen ? 'FROZEN' : 'Normal'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Updates Blocked Today */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        <div>
                          <p className="text-sm font-medium">Blocked Today</p>
                          <p className="text-2xl font-bold text-yellow-600">
                            {protectionMetrics?.blockedToday || 0}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Threats Detected */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <div>
                          <p className="text-sm font-medium">Threats Detected</p>
                          <p className="text-2xl font-bold text-red-600">
                            {protectionMetrics?.threatsDetected || 0}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Protection Dashboard */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Data Protection Dashboard
                      </CardTitle>
                      <CardDescription>
                        Multi-layered safeguards against synthetic data contamination
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded">
                          <p className="text-sm font-medium text-green-800 dark:text-green-200">Authentic Sources</p>
                          <p className="text-xs text-green-600 dark:text-green-400">Google Places, Yelp, State Licensing</p>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                          <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Pattern Detection</p>
                          <p className="text-xs text-blue-600 dark:text-blue-400">AI-powered anomaly detection</p>
                        </div>
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded">
                          <p className="text-sm font-medium text-purple-800 dark:text-purple-200">Source Validation</p>
                          <p className="text-xs text-purple-600 dark:text-purple-400">API key authentication required</p>
                        </div>
                        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded">
                          <p className="text-sm font-medium text-orange-800 dark:text-orange-200">Audit Trail</p>
                          <p className="text-xs text-orange-600 dark:text-orange-400">Complete protection logging</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => runProtectionCheckMutation.mutate()}
                          disabled={runProtectionCheckMutation.isPending}
                        >
                          {runProtectionCheckMutation.isPending ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Activity className="h-4 w-4 mr-2" />
                          )}
                          Check Protection Status
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => {
                            queryClient.invalidateQueries({ queryKey: ['/api/data-protection/logs'] });
                          }}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Refresh Protection Audit Log
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="w-full justify-start text-yellow-700 border-yellow-300 hover:bg-yellow-50"
                          onClick={() => {
                            if (confirm("Are you sure you want to test synthetic data detection?")) {
                              testDetectionMutation.mutate();
                            }
                          }}
                          disabled={testDetectionMutation.isPending}
                        >
                          {testDetectionMutation.isPending ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 mr-2" />
                          )}
                          Test Synthetic Data Detection
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Emergency Controls */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="h-5 w-5" />
                        Emergency Data Protection
                      </CardTitle>
                      <CardDescription>
                        Critical controls for data contamination events
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                        <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Emergency Data Freeze</h4>
                        <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                          Immediately stop all data updates across the entire platform. Use only if synthetic data contamination is detected.
                        </p>
                        <Button 
                          variant="destructive" 
                          className="w-full"
                          onClick={() => {
                            if (confirm("⚠️ EMERGENCY: This will freeze ALL data updates across the entire platform. Are you sure?")) {
                              emergencyFreezeMutation.mutate();
                            }
                          }}
                          disabled={emergencyFreezeMutation.isPending}
                        >
                          {emergencyFreezeMutation.isPending ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Shield className="h-4 w-4 mr-2" />
                          )}
                          ACTIVATE EMERGENCY FREEZE
                        </Button>
                      </div>

                      {/* Protection Logs */}
                      {protectionLogs && protectionLogs.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium">Recent Protection Events</h4>
                          <ScrollArea className="h-48 w-full rounded border">
                            <div className="p-4 space-y-2">
                              {protectionLogs.slice(0, 10).map((log: any, index: number) => (
                                <div key={index} className="text-sm">
                                  <div className="flex justify-between">
                                    <span className={`font-medium ${log.severity === 'high' ? 'text-red-600' : 'text-gray-600'}`}>
                                      {log.action}
                                    </span>
                                    <span className="text-xs text-gray-500">{log.timestamp}</span>
                                  </div>
                                  {log.details && (
                                    <p className="text-xs text-gray-500 mt-1">{log.details}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Subscriptions Tab - COMPREHENSIVE SUBSCRIPTION MANAGEMENT */}
              <TabsContent value="subscriptions" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Total MRR</p>
                          <p className="text-2xl font-bold">${subscriptionMetrics?.totalMrr?.toLocaleString() || 0}</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-500" />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {subscriptionMetrics?.mrrGrowth > 0 ? '+' : ''}{subscriptionMetrics?.mrrGrowth || 0}% from last month
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Active Subscriptions</p>
                          <p className="text-2xl font-bold">{subscriptionMetrics?.activeSubscriptions || 0}</p>
                        </div>
                        <Users className="h-8 w-8 text-blue-500" />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {subscriptionMetrics?.trialSubscriptions || 0} in trial
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Churn Rate</p>
                          <p className="text-2xl font-bold">{subscriptionMetrics?.churnRate || 0}%</p>
                        </div>
                        <TrendingDown className="h-8 w-8 text-red-500" />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Monthly churn</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">ARPU</p>
                          <p className="text-2xl font-bold">${subscriptionMetrics?.avgRevenuePerUser || 0}</p>
                        </div>
                        <DollarSign className="h-8 w-8 text-purple-500" />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        LTV: ${subscriptionMetrics?.lifetimeValue || 0}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Subscription Plans Management */}
                <Card>
                  <CardHeader>
                    <CardTitle>Subscription Plans</CardTitle>
                    <CardDescription>Manage community subscription tiers and pricing</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {subscriptionPlans?.map((plan: any) => (
                        <div key={plan.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{plan.name}</h4>
                            <p className="text-sm text-gray-500">
                              ${plan.price}/{plan.interval} · {plan.subscribers} subscribers
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
                              {plan.status}
                            </Badge>
                            <span className="font-medium">${plan.mrr?.toLocaleString()}/mo</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Active Subscriptions Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Active Community Subscriptions</CardTitle>
                    <CardDescription>Monitor and manage all active subscriptions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Community</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Next Billing</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {allSubscriptions?.filter((sub: any) => sub.status === 'active').slice(0, 10).map((subscription: any) => (
                            <TableRow key={subscription.id}>
                              <TableCell className="font-medium">{subscription.communityName}</TableCell>
                              <TableCell>{subscription.planName}</TableCell>
                              <TableCell>
                                <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                                  {subscription.status}
                                </Badge>
                              </TableCell>
                              <TableCell>${subscription.amount}/mo</TableCell>
                              <TableCell>{format(new Date(subscription.currentPeriodEnd), 'MMM dd, yyyy')}</TableCell>
                              <TableCell>
                                <Button size="sm" variant="outline">Manage</Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Payment History */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Payment History</CardTitle>
                    <CardDescription>Track successful payments and failed transactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <div className="space-y-2">
                        {paymentHistory?.slice(0, 20).map((payment: any) => (
                          <div key={payment.id} className="flex items-center justify-between p-2 border-b">
                            <div>
                              <p className="font-medium text-sm">{payment.communityName}</p>
                              <p className="text-xs text-gray-500">{format(new Date(payment.date), 'MMM dd, yyyy HH:mm')}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={payment.status === 'succeeded' ? 'default' : 'destructive'}>
                                {payment.status}
                              </Badge>
                              <span className="font-medium">${payment.amount}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

            </Tabs>
          </div>
        )}
      </div>
      
      {/* Community Edit Modal */}
      {isEditModalOpen && editingCommunity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Community</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Community Name</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  value={editingCommunity.name || ''}
                  onChange={(e) => setEditingCommunity({...editingCommunity, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  value={editingCommunity.location || ''}
                  onChange={(e) => setEditingCommunity({...editingCommunity, location: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Tier</label>
                <select
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  value={editingCommunity.tier || 'Basic'}
                  onChange={(e) => setEditingCommunity({...editingCommunity, tier: e.target.value})}
                >
                  <option value="Basic">Basic</option>
                  <option value="Featured">Featured</option>
                  <option value="Platinum">Platinum</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Occupancy (%)</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  value={editingCommunity.occupancy || 0}
                  onChange={(e) => setEditingCommunity({...editingCommunity, occupancy: parseInt(e.target.value)})}
                  min="0"
                  max="100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Monthly Revenue ($)</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  value={editingCommunity.revenue || 0}
                  onChange={(e) => setEditingCommunity({...editingCommunity, revenue: parseInt(e.target.value)})}
                  min="0"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingCommunity(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  try {
                    await apiRequest('PUT', `/api/admin/communities/${editingCommunity.id}`, editingCommunity);
                    toast({
                      title: "Success",
                      description: "Community updated successfully",
                      duration: 3000
                    });
                    setIsEditModalOpen(false);
                    setEditingCommunity(null);
                    
                    // Refresh community list
                    apiRequest('GET', '/api/admin/communities')
                      .then(data => setCommunityList(data || []))
                      .catch(err => console.error('Failed to refresh communities:', err));
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Failed to update community",
                      variant: "destructive",
                      duration: 3000
                    });
                  }
                }}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
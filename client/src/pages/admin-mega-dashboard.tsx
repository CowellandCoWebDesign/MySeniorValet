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
  ExternalLink, Pencil, Crown, Calculator, Receipt, Pause, Play,
  Upload, Flag, Wrench, TestTube, Palette, FileSearch,
  Rocket, Heart, Flame, Gem, Lightbulb, // Creative icons from admin-creative
  LayoutDashboard, Key, Ban, LogIn, Wifi, DownloadCloud, UploadCloud,
  Camera, Printer // Additional icons from various dashboards
} from "lucide-react";
import { NavigationHeader } from "@/components/NavigationHeader";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { format, subDays, startOfWeek, startOfMonth, differenceInDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

// Lazy load the enhanced heatmap component for better performance
const EnhancedHeatmap = lazy(() => import("@/components/AvailabilityHeatmap").then(module => ({
  default: module.AvailabilityHeatmap
})));

// Define comprehensive metrics interface (from super-admin-analytics)
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

// Subscription Plan interface (from admin-subscription-management)
interface SubscriptionPlan {
  id: string;
  name: string;
  type: 'community' | 'vendor';
  price: number;
  features: string[];
  limits: {
    photos?: number;
    tours?: number;
    messages?: number;
    analytics?: boolean;
  };
  isActive: boolean;
}

// Color palette for charts
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

export default function AdminMegaDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [timeRange, setTimeRange] = useState("7d");
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMetric, setSelectedMetric] = useState('communities');
  const [pulseEffect, setPulseEffect] = useState(false); // From admin-creative
  const [activeActions, setActiveActions] = useState<Record<string, boolean>>({}); // From admin-creative
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [selectedCommunity, setSelectedCommunity] = useState<number | null>(null);
  const [reportType, setReportType] = useState("all"); // From admin-reports
  const [exportFormat, setExportFormat] = useState("pdf"); // From admin-reports
  
  // Check super admin access
  const userRole = (user as any)?.role || '';
  const userEmail = (user as any)?.email || '';
  const isSuperAdmin = userRole === 'super_admin' || userEmail === 'william.cowell01@gmail.com' || userEmail === 'admin@myseniorvalet.com';
  
  // Pulse effect for live updates (from admin-creative)
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseEffect(true);
      setTimeout(() => setPulseEffect(false), 1000);
    }, 10000);
    return () => clearInterval(interval);
  }, []);
  
  // Block non-super admin users
  if (!user || !isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-6 w-6 text-red-600" />
              Access Denied
            </CardTitle>
            <CardDescription>
              This comprehensive dashboard is restricted to super administrators only.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/")}>
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ========== DATA QUERIES ==========
  
  // Platform statistics
  const { data: platformStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/platform/stats', timeRange],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Financial data
  const { data: financialData } = useQuery({
    queryKey: ['/api/financial/comprehensive', timeRange],
  });

  // Communities data
  const { data: communities } = useQuery({
    queryKey: ['/api/communities'],
    select: (data: any) => Array.isArray(data) ? data : [],
  });

  // Users data
  const { data: users } = useQuery({
    queryKey: ['/api/admin/users'],
  });

  // Subscription plans (from admin-subscription-management)
  const { data: subscriptionPlans } = useQuery<SubscriptionPlan[]>({
    queryKey: ['/api/admin/subscriptions/plans'],
  });

  // Active subscriptions
  const { data: activeSubscriptions } = useQuery({
    queryKey: ['/api/admin/subscriptions/active'],
  });

  // Audit logs
  const { data: auditLogs } = useQuery({
    queryKey: ['/api/admin/audit-logs'],
  });

  // API usage and costs
  const { data: apiUsage } = useQuery({
    queryKey: ['/api/admin/analytics/usage', timeRange],
  });

  // Recent errors
  const { data: recentErrors } = useQuery({
    queryKey: ['/api/admin/errors/recent'],
  });

  // Expansion data
  const { data: expansionData } = useQuery({
    queryKey: ['/api/admin/expansion/results'],
  });

  // AI metrics
  const { data: aiMetrics } = useQuery({
    queryKey: ['/api/admin/ai/metrics', timeRange],
  });

  // Performance metrics
  const { data: performanceMetrics } = useQuery({
    queryKey: ['/api/admin/performance', timeRange],
  });

  // Geographic data
  const { data: geographicData } = useQuery({
    queryKey: ['/api/admin/geographic'],
  });

  // Engagement metrics
  const { data: engagementMetrics } = useQuery({
    queryKey: ['/api/admin/engagement', timeRange],
  });

  // Revenue analytics
  const { data: revenueAnalytics } = useQuery({
    queryKey: ['/api/admin/revenue/analytics', timeRange],
  });

  // ========== MUTATIONS (from various dashboards) ==========

  // Update subscription plan mutation (from admin-subscription-management)
  const updatePlanMutation = useMutation({
    mutationFn: async (data: { planId: string; updates: Partial<SubscriptionPlan> }) => {
      return apiRequest("PUT", `/api/admin/subscriptions/plans/${data.planId}`, data.updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/subscriptions/plans'] });
      toast({
        title: "Success",
        description: "Subscription plan updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update subscription plan",
        variant: "destructive",
      });
    },
  });

  // Cancel subscription mutation (from admin-subscription-management)
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async (subscriptionId: number) => {
      return apiRequest("POST", `/api/admin/subscriptions/${subscriptionId}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/subscriptions/active'] });
      toast({
        title: "Success",
        description: "Subscription cancelled successfully",
      });
    },
  });

  // Update user role mutation (from admin-unified)
  const updateUserRoleMutation = useMutation({
    mutationFn: async (data: { userId: number; role: string }) => {
      return apiRequest("PATCH", `/api/admin/users/${data.userId}/role`, { role: data.role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
    },
  });

  // Ban/unban user mutation (from admin-unified)
  const toggleUserBanMutation = useMutation({
    mutationFn: async (data: { userId: number; banned: boolean }) => {
      return apiRequest("PATCH", `/api/admin/users/${data.userId}/ban`, { banned: data.banned });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Success",
        description: "User status updated successfully",
      });
    },
  });

  // ========== HANDLER FUNCTIONS ==========

  // Refresh all data
  const handleRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries();
    setTimeout(() => setRefreshing(false), 1000);
    toast({
      title: "Data Refreshed",
      description: "All dashboard data has been updated",
    });
  };

  // Export functionality (from admin-reports)
  const handleExport = async (format: string, dataType: string) => {
    setActiveActions({ ...activeActions, export: true });
    
    try {
      const response = await apiRequest("POST", `/api/admin/export`, {
        format,
        dataType,
        timeRange,
      });
      
      toast({
        title: "Export Started",
        description: `Your ${dataType} report is being generated in ${format.toUpperCase()} format`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Unable to generate report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActiveActions({ ...activeActions, export: false });
    }
  };

  // Calculate summary metrics
  const calculateMetrics = (): DashboardMetrics => {
    const communities = Array.isArray(platformStats?.communities) ? platformStats.communities : [];
    const subscriptions = activeSubscriptions || [];
    
    return {
      platform: {
        totalCommunities: communities.length,
        totalUsers: users?.length || 0,
        totalVendors: users?.filter((u: any) => u.role === 'vendor').length || 0,
        activeSubscriptions: subscriptions.length,
        monthlyRevenue: financialData?.revenue?.month || 0,
        yearlyRevenue: financialData?.revenue?.year || 0,
        growthRate: financialData?.growthRate || 0,
      },
      performance: performanceMetrics || {
        responseTime: 0,
        uptime: 99.9,
        errorRate: 0,
        apiCalls: 0,
        cacheHitRate: 0,
        dbQueries: 0,
      },
      ai: aiMetrics || {
        totalRequests: 0,
        byProvider: {
          claude: 0,
          chatgpt: 0,
          perplexity: 0,
          gemini: 0,
          grok: 0,
        },
        costs: {
          total: 0,
          claude: 0,
          chatgpt: 0,
          perplexity: 0,
          gemini: 0,
        },
        successRate: 0,
        avgResponseTime: 0,
      },
      financial: {
        revenue: financialData?.revenue || {
          today: 0,
          week: 0,
          month: 0,
          year: 0,
        },
        subscriptions: {
          community: { free: 0, standard: 0, featured: 0, platinum: 0 },
          vendor: { basic: 0, featured: 0, national: 0 },
        },
        paymentSuccess: financialData?.paymentSuccess || 0,
        churnRate: financialData?.churnRate || 0,
        ltv: financialData?.ltv || 0,
        arpu: financialData?.arpu || 0,
      },
      geographic: geographicData || {
        byState: {},
        byCountry: { usa: 0, canada: 0 },
        topCities: [],
        expansionProgress: 0,
      },
      engagement: engagementMetrics || {
        dailyActiveUsers: 0,
        weeklyActiveUsers: 0,
        monthlyActiveUsers: 0,
        avgSessionDuration: 0,
        bounceRate: 0,
        pageViews: 0,
        searches: 0,
        communityViews: 0,
        favorites: 0,
        messages: 0,
      },
    };
  };

  const metrics = calculateMetrics();

  // ========== RENDER COMPONENTS ==========

  // Overview Cards with animated effects (from admin-creative)
  const renderOverviewCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${pulseEffect ? 'animate-pulse' : ''}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-600" />
            Total Communities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.platform.totalCommunities.toLocaleString()}</div>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
            <span className="text-green-600">+{metrics.platform.growthRate}%</span> from last month
          </div>
        </CardContent>
      </Card>

      <Card className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${pulseEffect ? 'animate-pulse' : ''}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4 text-green-600" />
            Active Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.platform.totalUsers.toLocaleString()}</div>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <Activity className="h-3 w-3 mr-1" />
            {metrics.engagement.dailyActiveUsers} daily active
          </div>
        </CardContent>
      </Card>

      <Card className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${pulseEffect ? 'animate-pulse' : ''}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            Monthly Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${metrics.platform.monthlyRevenue.toLocaleString()}</div>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
            ARPU: ${metrics.financial.arpu}
          </div>
        </CardContent>
      </Card>

      <Card className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${pulseEffect ? 'animate-pulse' : ''}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-600" />
            AI Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.ai.totalRequests.toLocaleString()}</div>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <DollarSign className="h-3 w-3 mr-1" />
            Cost: ${metrics.ai.costs.total.toFixed(2)}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // User Management Table (from admin-unified)
  const renderUserManagement = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Management
        </CardTitle>
        <CardDescription>Manage platform users and permissions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          <Button variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </div>
        
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.slice(0, 10).map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(value) => updateUserRoleMutation.mutate({ userId: user.id, role: value })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="vendor">Vendor</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.banned ? "destructive" : "success"}>
                      {user.banned ? "Banned" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(user.createdAt), 'MMM d, yyyy')}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleUserBanMutation.mutate({ userId: user.id, banned: !user.banned })}
                      >
                        {user.banned ? <Unlock className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );

  // Subscription Management (from admin-subscription-management)
  const renderSubscriptionManagement = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-600" />
          Subscription Management
        </CardTitle>
        <CardDescription>Manage subscription plans and active subscriptions</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="plans">
          <TabsList>
            <TabsTrigger value="plans">Plans</TabsTrigger>
            <TabsTrigger value="active">Active Subscriptions</TabsTrigger>
            <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="plans">
            <div className="space-y-4">
              {subscriptionPlans?.map((plan) => (
                <Card key={plan.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                        <CardDescription>${plan.price}/month</CardDescription>
                      </div>
                      <Badge variant={plan.isActive ? "default" : "secondary"}>
                        {plan.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Features:</div>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <div className="pt-2 flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updatePlanMutation.mutate({
                            planId: plan.id,
                            updates: { isActive: !plan.isActive }
                          })}
                        >
                          {plan.isActive ? <Pause className="h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1" />}
                          {plan.isActive ? "Disable" : "Enable"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="active">
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Next Billing</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeSubscriptions?.slice(0, 10).map((sub: any) => (
                    <TableRow key={sub.id}>
                      <TableCell>{sub.customerName}</TableCell>
                      <TableCell>
                        <Badge>{sub.planName}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="success">Active</Badge>
                      </TableCell>
                      <TableCell>{format(new Date(sub.nextBilling), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => cancelSubscriptionMutation.mutate(sub.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="revenue">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">MRR</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${metrics.financial.revenue.month.toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">ARR</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${metrics.financial.revenue.year.toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Churn Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics.financial.churnRate}%</div>
                  </CardContent>
                </Card>
              </div>
              
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueAnalytics?.monthly || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#3B82F6" name="Revenue" />
                  <Line type="monotone" dataKey="subscriptions" stroke="#10B981" name="Subscriptions" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );

  // AI Analytics (from super-admin-analytics)
  const renderAIAnalytics = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          AI Analytics
        </CardTitle>
        <CardDescription>Monitor AI usage and costs across providers</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-sm font-medium mb-2">Requests by Provider</div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Claude', value: metrics.ai.byProvider.claude },
                    { name: 'ChatGPT', value: metrics.ai.byProvider.chatgpt },
                    { name: 'Perplexity', value: metrics.ai.byProvider.perplexity },
                    { name: 'Gemini', value: metrics.ai.byProvider.gemini },
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div>
            <div className="text-sm font-medium mb-2">Cost Breakdown</div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Claude</span>
                <span className="font-medium">${metrics.ai.costs.claude.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">ChatGPT</span>
                <span className="font-medium">${metrics.ai.costs.chatgpt.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Perplexity</span>
                <span className="font-medium">${metrics.ai.costs.perplexity.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center font-bold">
                <span>Total</span>
                <span>${metrics.ai.costs.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.ai.successRate}%</div>
              <Progress value={metrics.ai.successRate} className="mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Avg Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.ai.avgResponseTime}ms</div>
              <div className="text-xs text-muted-foreground">Target: &lt;1000ms</div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );

  // Performance Monitoring (from super-admin-analytics)
  const renderPerformanceMonitoring = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gauge className="h-5 w-5 text-orange-600" />
          Performance Monitoring
        </CardTitle>
        <CardDescription>System health and performance metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Server className="h-4 w-4" />
                Uptime
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.performance.uptime}%</div>
              <Progress value={metrics.performance.uptime} className="mt-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Response Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.performance.responseTime}ms</div>
              <div className={`text-xs ${metrics.performance.responseTime < 200 ? 'text-green-600' : 'text-yellow-600'}`}>
                {metrics.performance.responseTime < 200 ? 'Excellent' : 'Good'}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Error Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.performance.errorRate}%</div>
              <div className={`text-xs ${metrics.performance.errorRate < 1 ? 'text-green-600' : 'text-red-600'}`}>
                {metrics.performance.errorRate < 1 ? 'Normal' : 'High'}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">API Calls</span>
              <span className="text-sm text-muted-foreground">{metrics.performance.apiCalls.toLocaleString()} today</span>
            </div>
            <Progress value={Math.min((metrics.performance.apiCalls / 100000) * 100, 100)} />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Cache Hit Rate</span>
              <span className="text-sm text-muted-foreground">{metrics.performance.cacheHitRate}%</span>
            </div>
            <Progress value={metrics.performance.cacheHitRate} />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Database Queries</span>
              <span className="text-sm text-muted-foreground">{metrics.performance.dbQueries.toLocaleString()}/min</span>
            </div>
            <Progress value={Math.min((metrics.performance.dbQueries / 1000) * 100, 100)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Reports and Export (from admin-reports)
  const renderReportsExport = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          Reports & Export
        </CardTitle>
        <CardDescription>Generate and export platform reports</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-4">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Report Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Data</SelectItem>
                <SelectItem value="financial">Financial Report</SelectItem>
                <SelectItem value="users">User Report</SelectItem>
                <SelectItem value="communities">Communities Report</SelectItem>
                <SelectItem value="ai">AI Usage Report</SelectItem>
                <SelectItem value="performance">Performance Report</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              onClick={() => handleExport(exportFormat, reportType)}
              disabled={activeActions.export}
            >
              {activeActions.export ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export Report
            </Button>
            
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
          
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2">Quick Reports</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={() => handleExport('pdf', 'daily')}>
                Daily Summary
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('pdf', 'weekly')}>
                Weekly Report
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('csv', 'revenue')}>
                Revenue CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('excel', 'users')}>
                User List Excel
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Loading state
  if (statsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading comprehensive dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      <NavigationHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header with creative effects */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Shield className="h-8 w-8 text-blue-600" />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Mega Admin Dashboard
                </span>
                {pulseEffect && <Sparkles className="h-6 w-6 text-yellow-500 animate-pulse" />}
              </h1>
              <p className="text-muted-foreground mt-1">Complete platform control and analytics</p>
            </div>
            
            <div className="flex gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
          
          {/* Overview Cards */}
          {renderOverviewCards()}
        </div>
        
        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-8 w-full">
            <TabsTrigger value="overview">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="subscriptions">
              <Crown className="h-4 w-4 mr-2" />
              Subscriptions
            </TabsTrigger>
            <TabsTrigger value="ai">
              <Brain className="h-4 w-4 mr-2" />
              AI
            </TabsTrigger>
            <TabsTrigger value="performance">
              <Gauge className="h-4 w-4 mr-2" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="reports">
              <FileText className="h-4 w-4 mr-2" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="heatmap">
              <Map className="h-4 w-4 mr-2" />
              Heatmap
            </TabsTrigger>
            <TabsTrigger value="tools">
              <Wrench className="h-4 w-4 mr-2" />
              Tools
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {renderAIAnalytics()}
              {renderPerformanceMonitoring()}
            </div>
          </TabsContent>
          
          <TabsContent value="users" className="space-y-4">
            {renderUserManagement()}
          </TabsContent>
          
          <TabsContent value="subscriptions" className="space-y-4">
            {renderSubscriptionManagement()}
          </TabsContent>
          
          <TabsContent value="ai" className="space-y-4">
            {renderAIAnalytics()}
          </TabsContent>
          
          <TabsContent value="performance" className="space-y-4">
            {renderPerformanceMonitoring()}
          </TabsContent>
          
          <TabsContent value="reports" className="space-y-4">
            {renderReportsExport()}
          </TabsContent>
          
          <TabsContent value="heatmap" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Geographic Heatmap</CardTitle>
                <CardDescription>Community distribution and availability</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div>Loading heatmap...</div>}>
                  <EnhancedHeatmap adminView={true} />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="tools" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Admin Tools</CardTitle>
                <CardDescription>Quick access to administrative functions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <Button variant="outline" className="h-24 flex-col">
                    <Database className="h-6 w-6 mb-2" />
                    Database Tools
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <Shield className="h-6 w-6 mb-2" />
                    Security Settings
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <Settings className="h-6 w-6 mb-2" />
                    System Config
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <TestTube className="h-6 w-6 mb-2" />
                    Test Tools
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <Palette className="h-6 w-6 mb-2" />
                    Theme Settings
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <FileSearch className="h-6 w-6 mb-2" />
                    Audit Logs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
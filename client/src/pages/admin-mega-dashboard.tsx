import React, { useState, useEffect, lazy, Suspense } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip as UiTooltip, TooltipContent as UiTooltipContent, TooltipProvider as UiTooltipProvider, TooltipTrigger as UiTooltipTrigger } from "@/components/ui/tooltip";
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
  Camera, Printer, // Additional icons from various dashboards
  EyeOff, ChevronLeft // Added for community management upgrades
} from "lucide-react";
import { NavigationHeader } from "@/components/NavigationHeader";
import { BreadcrumbNavigation } from "@/components/BreadcrumbNavigation";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { format, subDays, startOfWeek, startOfMonth, differenceInDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

// Lazy load the enhanced heatmap component for better performance
const EnhancedHeatmap = lazy(() => import("@/components/AvailabilityHeatmap").then(module => ({
  default: module.AvailabilityHeatmap
})));

// Lazy load the enterprise monitoring components
const EnterpriseAlerts = lazy(() => import("@/components/enterprise/EnterpriseAlerts").then(module => ({
  default: module.EnterpriseAlerts
})));

// Lazy load Phase 5 Enterprise Components
const FinancialAnalyticsTab = lazy(() => import("@/components/phase5/Phase5Tabs").then(module => ({
  default: module.FinancialAnalyticsTab
})));
const ComplianceTab = lazy(() => import("@/components/phase5/Phase5Tabs").then(module => ({
  default: module.ComplianceTab
})));

// Lazy load Phase 5b Billing Component
const BillingDashboard = lazy(() => import("@/components/phase5b/BillingDashboard").then(module => ({
  default: module.BillingDashboard
})));

// Lazy load Phase 5b Marketing Component
const MarketingDashboard = lazy(() => import("@/components/admin/MarketingDashboard").then(module => ({
  default: module.MarketingDashboard
})));

// Lazy load Global Discovery Approval Queue
const GlobalDiscoveryApprovalQueue = lazy(() => import("@/components/admin/GlobalDiscoveryApprovalQueue").then(module => ({
  default: module.GlobalDiscoveryApprovalQueue
})));

// Lazy load Data Quality Dashboard
const DataQualityDashboard = lazy(() => import("@/components/DataQualityDashboard").then(module => ({
  default: module.DataQualityDashboard
})));

// Lazy load Verification Dashboard
const VerificationDashboard = lazy(() => import("@/components/admin/VerificationDashboard").then(module => ({
  default: module.VerificationDashboard
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

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: 'Pending', variant: 'destructive' },
  read: { label: 'Read', variant: 'secondary' },
  responded: { label: 'Responded', variant: 'default' },
  archived: { label: 'Archived', variant: 'outline' },
};

function ContactSubmissionsTab() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: submissions = [], isLoading, refetch } = useQuery<any[]>({
    queryKey: ['/api/admin/contact-submissions', statusFilter],
    queryFn: async () => {
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const res = await fetch(`/api/admin/contact-submissions${params}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load submissions');
      return res.json();
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest('PATCH', `/api/admin/contact-submissions/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/contact-submissions'] });
      toast({ title: 'Status updated' });
    },
    onError: () => {
      toast({ title: 'Failed to update status', variant: 'destructive' });
    },
  });

  const counts = submissions.reduce((acc: Record<string, number>, s: any) => {
    acc[s.status] = (acc[s.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-500" />
                Contact Form Inbox
              </CardTitle>
              <CardDescription>Manage and triage incoming contact form submissions</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {['all', 'pending', 'read', 'responded', 'archived'].map(s => (
              <Button
                key={s}
                variant={statusFilter === s ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(s)}
              >
                {s === 'all' ? 'All' : STATUS_CONFIG[s]?.label}
                {s === 'all'
                  ? ` (${submissions.length})`
                  : counts[s]
                  ? ` (${counts[s]})`
                  : ''}
              </Button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Mail className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No submissions found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.map((sub: any) => {
                const isExpanded = expandedId === sub.id;
                const cfg = STATUS_CONFIG[sub.status] || STATUS_CONFIG.pending;
                return (
                  <div
                    key={sub.id}
                    className={`border rounded-lg transition-all ${sub.status === 'pending' ? 'border-orange-400/50 bg-orange-50/5' : ''}`}
                  >
                    <div
                      className="flex items-start gap-3 p-4 cursor-pointer hover:bg-muted/30"
                      onClick={() => {
                        setExpandedId(isExpanded ? null : sub.id);
                        if (sub.status === 'pending') {
                          updateStatus.mutate({ id: sub.id, status: 'read' });
                        }
                      }}
                    >
                      <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${sub.status === 'pending' ? 'bg-orange-400 animate-pulse' : 'bg-muted-foreground/40'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{sub.name}</span>
                          <span className="text-muted-foreground text-xs">{sub.email}</span>
                          <Badge variant={cfg.variant} className="text-xs">{cfg.label}</Badge>
                          <Badge variant="outline" className="text-xs capitalize">{sub.subject}</Badge>
                        </div>
                        <p className="text-sm mt-0.5 truncate text-muted-foreground">{sub.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {sub.createdAt ? format(new Date(sub.createdAt), 'MMM d, yyyy h:mm a') : ''}
                        </p>
                      </div>
                      <ChevronRight className={`h-4 w-4 text-muted-foreground flex-shrink-0 mt-1 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-0 border-t ml-9">
                        <p className="text-sm mt-3 whitespace-pre-wrap">{sub.message}</p>
                        <div className="flex flex-wrap gap-2 mt-4">
                          {(['read', 'responded', 'archived'] as const).map(s => (
                            <Button
                              key={s}
                              size="sm"
                              variant={sub.status === s ? 'default' : 'outline'}
                              disabled={updateStatus.isPending}
                              onClick={(e) => {
                                e.stopPropagation();
                                updateStatus.mutate({ id: sub.id, status: s });
                              }}
                            >
                              {s === 'read' && <Eye className="h-3 w-3 mr-1" />}
                              {s === 'responded' && <CheckCircle className="h-3 w-3 mr-1" />}
                              {s === 'archived' && <X className="h-3 w-3 mr-1" />}
                              Mark {STATUS_CONFIG[s].label}
                            </Button>
                          ))}
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                          >
                            <a href={`mailto:${sub.email}?subject=Re: ${sub.subject}`}>
                              <Mail className="h-3 w-3 mr-1" />
                              Reply via Email
                            </a>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminMegaDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // IMPORTANT: All hooks must be called BEFORE any conditional returns
  // This is required by React's Rules of Hooks
  const [, setLocation] = useLocation();
  const [timeRange, setTimeRange] = useState("7d");
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [liveActivity, setLiveActivity] = useState<any>(null);
  const [systemHealthExpanded, setSystemHealthExpanded] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('communities');
  const [pulseEffect, setPulseEffect] = useState(false); // From admin-creative
  const [activeActions, setActiveActions] = useState<Record<string, boolean>>({}); // From admin-creative
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [selectedCommunity, setSelectedCommunity] = useState<number | null>(null);
  const [reportType, setReportType] = useState("all"); // From admin-reports
  const [exportFormat, setExportFormat] = useState("pdf"); // From admin-reports
  
  // Community management states (from admin-communities)
  const [stateFilter, setStateFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  
  // Audit log filters (from admin.tsx)
  const [auditFilters, setAuditFilters] = useState({
    action: 'all',
    resourceType: 'all',
    severity: 'all',
    timeframe: '24h'
  });
  
  // County discovery states (from admin-clean-full)
  const [showDiscoveryMetrics, setShowDiscoveryMetrics] = useState(false);
  const [discoveryLoading, setDiscoveryLoading] = useState(false);
  
  // Live activity indicators (from admin-unified)
  const [liveActivityPulse, setLiveActivityPulse] = useState(false);
  const [activeUsers, setActiveUsers] = useState(0);
  
  // Geographic expansion states
  const [expansionProgress, setExpansionProgress] = useState(0);
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);
  
  // Server-side API routes will enforce actual authentication
  // (Permission check already done at top of component before hooks)
                       
  // Pulse effect for live updates (from admin-creative)
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseEffect(true);
      setTimeout(() => setPulseEffect(false), 1000);
    }, 10000);
    return () => clearInterval(interval);
  }, []);
  
  // Fetch live activity when on activity tab
  useEffect(() => {
    if (activeTab === 'activity') {
      const fetchLiveActivity = async () => {
        try {
          const res = await fetch('/api/admin/activity/live');
          const data = await res.json();
          setLiveActivity(data);
          
          // Update stats from live activity
          if (data.stats) {
            setActiveUsers(data.stats.activeUsers || 0);
            setLiveActivityPulse(true);
            setTimeout(() => setLiveActivityPulse(false), 1000);
          }
        } catch (error) {
          console.error('Failed to fetch live activity:', error);
        }
      };
      
      // Initial fetch
      fetchLiveActivity();
      
      // Refresh every 3 seconds
      const interval = setInterval(fetchLiveActivity, 3000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  // ========== DATA QUERIES ==========
  // (Permission check already handled at top of component before hooks)
  
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

  // Remove duplicate user query - we're using usersList instead
  // const { data: users } = useQuery({
  //   queryKey: ['/api/admin/users'],
  // });  // REMOVED - using usersList query instead

  // Fetch real subscription tiers from API
  const { data: subscriptionTiers } = useQuery({
    queryKey: ['/api/payments/subscription-tiers'],
    select: (data: any) => {
      const plans: SubscriptionPlan[] = [];
      
      // Map community tiers
      if (data?.community) {
        data.community.forEach((tier: any) => {
          const features = {
            'starter': ['Profile & Photos', 'Basic Listing', 'Contact Information', 'Up to 5 photos'],
            'growth': ['Everything in Starter', 'Direct Messaging', 'Featured Listing', 'Analytics Dashboard', 'Unlimited photos'],
            'professional': ['Everything in Growth', 'Priority Placement', 'Virtual Tours', 'Lead Tracking', 'Custom Branding'],
            'premium': ['Everything in Professional', 'Top Search Results', 'Multi-location Support', 'API Access', 'Dedicated Support'],
            'enterprise': ['Everything in Premium', 'White Label Options', 'Custom Integrations', 'SLA Guarantee', 'Account Manager']
          };
          
          plans.push({
            id: `comm-${tier.id}`,
            name: `Community ${tier.name}`,
            type: 'community',
            price: tier.price,
            features: features[tier.id] || ['Standard features'],
            isActive: true,
            maxCommunities: tier.id === 'enterprise' ? 100 : tier.id === 'premium' ? 20 : tier.id === 'professional' ? 10 : tier.id === 'growth' ? 3 : 1
          });
        });
      }
      
      // Map vendor tiers
      if (data?.vendor) {
        data.vendor.forEach((tier: any) => {
          const features = {
            'basic': ['Vendor Profile', 'Service Listing', 'Contact Form', 'Basic Analytics'],
            'featured': ['Everything in Basic', 'Featured Badge', 'Priority Listing', 'Lead Notifications', 'Advanced Analytics'],
            'national': ['Everything in Featured', 'National Coverage', 'Multiple Locations', 'API Integration', 'Premium Support']
          };
          
          plans.push({
            id: `vendor-${tier.id}`,
            name: `Vendor ${tier.name}`,
            type: 'vendor',
            price: tier.price,
            features: features[tier.id] || ['Standard features'],
            isActive: true
          });
        });
      }
      
      return plans;
    }
  });
  
  const subscriptionPlans = subscriptionTiers || [];

  // Active subscriptions with proper default structure
  const { data: activeSubscriptions, isError: subscriptionsError, isLoading: subscriptionsLoading } = useQuery({
    queryKey: ['/api/admin/subscriptions/active'],
  });
  
  // Safe accessor for subscription data with defaults
  const subscriptionData = activeSubscriptions && typeof activeSubscriptions === 'object' 
    ? (activeSubscriptions as { subscriptions?: any[]; summary?: { total: number; community: number; vendor: number; totalMRR: number } })
    : { subscriptions: [], summary: { total: 0, community: 0, vendor: 0, totalMRR: 0 } };

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
  
  // REAL DATA QUERIES - Fetch actual platform data
  // Main dashboard metrics with real user data
  const { data: dashboardMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/admin/metrics'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });
  
  // Recent activity feed with real user registrations
  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['/api/admin/activity/recent'],
    refetchInterval: 10000, // Refresh every 10 seconds
  });
  
  // Real user list with pagination
  const { data: usersList, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users', currentPage, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: searchQuery
      });
      return await apiRequest('GET', `/api/admin/users?${params}`);
    },
  });
  
  // Dashboard stats from community cache
  const { data: dashboardStats, isLoading: dashboardStatsLoading } = useQuery({
    queryKey: ['/api/admin/dashboard/stats'],
    refetchInterval: 60000, // Refresh every minute
  });
  
  // Use real metrics if available, otherwise default to empty state
  // Priority: dashboardMetrics (from /api/admin/metrics) > dashboardStats (from /api/admin/dashboard/stats)
  const metricsData = dashboardMetrics as any;
  const statsData = dashboardStats as any;
  
  const metrics: DashboardMetrics = {
    platform: {
      totalCommunities: metricsData?.platform?.totalCommunities || statsData?.totalCommunities || 0,
      totalUsers: metricsData?.platform?.totalUsers || statsData?.totalUsers || 0,
      totalVendors: metricsData?.platform?.totalVendors || statsData?.totalVendors || 0,
      activeSubscriptions: metricsData?.platform?.activeSubscriptions || statsData?.activeSubscriptions || 0,
      monthlyRevenue: metricsData?.platform?.monthlyRevenue || statsData?.monthlyRevenue || 0,
      yearlyRevenue: metricsData?.platform?.yearlyRevenue || statsData?.yearlyRevenue || 0,
      growthRate: metricsData?.platform?.growthRate || statsData?.growthRate || 0
    },
    performance: metricsData?.performance || {
      responseTime: 0,
      uptime: 99.9,
      errorRate: 0,
      apiCalls: 0,
      cacheHitRate: 0,
      dbQueries: 0
    },
    ai: metricsData?.ai || {
      totalRequests: 0,
      byProvider: {
        claude: 0,
        chatgpt: 0,
        perplexity: 0,
        gemini: 0,
        grok: 0
      },
      costs: {
        total: 0,
        claude: 0,
        chatgpt: 0,
        perplexity: 0,
        gemini: 0
      },
      successRate: 0,
      avgResponseTime: 0
    },
    financial: metricsData?.financial || {
      revenue: {
        today: 0,
        week: 0,
        month: 0,
        year: 0
      },
      subscriptions: {
        community: { free: 0, standard: 0, featured: 0, platinum: 0 },
        vendor: { basic: 0, featured: 0, national: 0 }
      },
      paymentSuccess: 0,
      churnRate: 0,
      ltv: 0,
      arpu: 0
    },
    geographic: metricsData?.geographic || {
      byState: {},
      byCountry: { usa: 0, canada: 0 },
      topCities: [],
      expansionProgress: 0
    },
    engagement: metricsData?.engagement || {
      dailyActiveUsers: 0,
      weeklyActiveUsers: 0,
      monthlyActiveUsers: 0,
      avgSessionDuration: 0,
      bounceRate: 0,
      pageViews: 0,
      searches: 0,
      communityViews: 0,
      favorites: 0,
      messages: 0
    }
  };

  // Revenue analytics
  const { data: revenueAnalytics } = useQuery({
    queryKey: ['/api/admin/revenue/analytics', timeRange],
  });
  
  // Community management queries (from admin-communities)
  const { data: communityStats } = useQuery({
    queryKey: ['/api/admin/communities/stats'],
  });

  // Listing flags for moderation
  const [flagStatusFilter, setFlagStatusFilter] = useState<string>('Pending');
  const [communitySubTab, setCommunitySubTab] = useState<'listings' | 'flags'>('listings');
  const { data: listingFlagsData, isLoading: flagsLoading } = useQuery({
    queryKey: ['/api/admin/listing-flags', flagStatusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ status: flagStatusFilter, limit: '30' });
      return await apiRequest('GET', `/api/admin/listing-flags?${params}`);
    },
    enabled: communitySubTab === 'flags',
  });
  
  const { data: filteredCommunities } = useQuery({
    queryKey: ['/api/admin/communities', currentPage, searchQuery, stateFilter, countryFilter, typeFilter, verificationFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: searchQuery,
        state: stateFilter,
        country: countryFilter,
        type: typeFilter,
        verification: verificationFilter
      });
      return await apiRequest('GET', `/api/admin/communities?${params}`);
    },
  });

  // Distinct state/country filter options populated from real DB data
  const { data: communityFilterOptions } = useQuery({
    queryKey: ['/api/admin/communities/filters'],
    queryFn: async () => await apiRequest('GET', '/api/admin/communities/filters'),
  });
  
  const { data: crmStatus } = useQuery({
    queryKey: ['/api/admin/crm/status'],
  });
  
  // System health is fetched on-demand when the button is clicked
  
  // County discovery metrics (from admin-clean-full)
  const { data: countyMetrics } = useQuery({
    queryKey: ['/api/admin/counties/metrics'],
    enabled: showDiscoveryMetrics,
  });
  
  const { data: discoveryProgress } = useQuery({
    queryKey: ['/api/admin/discovery/progress'],
    refetchInterval: 5000, // Update every 5 seconds
    enabled: discoveryLoading,
  });
  
  // Live activity is fetched when the activity tab is active
  
  // Google Places enrichment data
  const { data: enrichmentStats } = useQuery({
    queryKey: ['/api/admin/enrichment/stats'],
  });
  
  // API cost tracking
  const { data: apiCosts } = useQuery({
    queryKey: ['/api/admin/api/costs', timeRange],
  })

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

  // Activate/deactivate user mutation (from admin-unified)
  const toggleUserBanMutation = useMutation({
    mutationFn: async (data: { userId: number; setActive: boolean }) => {
      return apiRequest("POST", `/api/admin/users/${data.userId}/ban`, { isActive: data.setActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Success",
        description: "User status updated successfully",
      });
    },
  });
  
  // Community management mutations (from admin-communities)
  const updateCommunityMutation = useMutation({
    mutationFn: async ({ id, updates }: any) => {
      return await apiRequest('PUT', `/api/admin/communities/${id}`, updates);
    },
    onSuccess: () => {
      toast({
        title: "Community Updated",
        description: "The community has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/communities'] });
      queryClient.invalidateQueries({ queryKey: ['/api/communities'] });
    },
    onError: (error: any) => {
      let message = "Failed to update community.";
      try {
        const jsonMatch = error?.message?.match(/^\d+: (.+)$/s);
        if (jsonMatch) {
          const body = JSON.parse(jsonMatch[1]);
          if (body?.errors?.length) message = body.errors.join(", ");
          else if (body?.message) message = body.message;
        }
      } catch (_) {}
      toast({ title: "Update Failed", description: message, variant: "destructive" });
    },
  });
  
  const deleteCommunityMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/admin/communities/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Community Removed",
        description: "The community has been hidden and deactivated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/communities'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/communities/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/communities'] });
    },
    onError: (error: any) => {
      let message = "Failed to delete community.";
      try {
        const jsonMatch = error?.message?.match(/^\d+: (.+)$/s);
        if (jsonMatch) {
          const body = JSON.parse(jsonMatch[1]);
          if (body?.error) message = body.error;
          else if (body?.message) message = body.message;
        }
      } catch (_) {}
      toast({ title: "Delete Failed", description: message, variant: "destructive" });
    },
  });

  const hideCommunityMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('POST', `/api/admin/communities/${id}/hide`);
    },
    onSuccess: () => {
      toast({ title: "Community Hidden", description: "The listing is no longer visible to the public." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/communities'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/communities/stats'] });
    },
  });

  const unhideCommunityMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('POST', `/api/admin/communities/${id}/unhide`);
    },
    onSuccess: () => {
      toast({ title: "Community Restored", description: "The listing is now visible to the public." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/communities'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/communities/stats'] });
    },
  });

  const verifyCommunityMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('POST', `/api/admin/communities/${id}/verify`, { verified: true });
    },
    onSuccess: () => {
      toast({ title: "Community Verified", description: "The listing has been marked as verified." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/communities'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/communities/stats'] });
    },
  });

  const dismissFlagMutation = useMutation({
    mutationFn: async (flagId: number) => {
      return await apiRequest('POST', `/api/admin/listing-flags/${flagId}/dismiss`);
    },
    onSuccess: () => {
      toast({ title: "Flag Dismissed" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/listing-flags'] });
    },
  });

  const confirmFlagMutation = useMutation({
    mutationFn: async ({ flagId, hideAlso }: { flagId: number; hideAlso: boolean }) => {
      return await apiRequest('POST', `/api/admin/listing-flags/${flagId}/confirm`, { hideListingAlso: hideAlso });
    },
    onSuccess: () => {
      toast({ title: "Flag Confirmed", description: "The listing has been marked as flagged." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/listing-flags'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/communities'] });
    },
  });
  
  // System management mutations (from admin-unified)
  const backupMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/admin/system/backup');
    },
    onSuccess: () => {
      toast({
        title: "Backup Started",
        description: "System backup has been initiated.",
      });
    },
  });
  
  const clearCacheMutation = useMutation({
    mutationFn: async (cacheType: string) => {
      return await apiRequest('POST', '/api/admin/system/cache/clear', { type: cacheType });
    },
    onSuccess: () => {
      toast({
        title: "Cache Cleared",
        description: "Selected cache has been cleared successfully.",
      });
    },
  });
  
  const updateRateLimitMutation = useMutation({
    mutationFn: async (config: any) => {
      return await apiRequest('PUT', '/api/admin/system/rate-limit', config);
    },
    onSuccess: () => {
      toast({
        title: "Rate Limit Updated",
        description: "Rate limiting configuration has been updated.",
      });
    },
  });
  
  // Delete user mutation (from admin-unified)
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest('DELETE', `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "User Deleted",
        description: "User has been permanently deleted.",
        variant: "destructive",
      });
    },
  });
  
  // Data enhancement mutations (from admin-clean-full)
  const refreshCommunityMutation = useMutation({
    mutationFn: async (communityId: number) => {
      return await apiRequest('POST', `/api/admin/communities/${communityId}/refresh`);
    },
    onSuccess: () => {
      toast({
        title: "Data Refreshed",
        description: "Community data has been refreshed.",
      });
    },
  });
  
  const enrichCommunityMutation = useMutation({
    mutationFn: async (communityId: number) => {
      return await apiRequest('POST', `/api/admin/communities/${communityId}/enrich`);
    },
    onSuccess: () => {
      toast({
        title: "Data Enriched",
        description: "Community enriched via free web pipeline (Jina Reader + optional Groq).",
      });
    },
  });
  
  const updateAllPricingMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/admin/communities/update-all-pricing');
    },
    onSuccess: () => {
      toast({
        title: "Pricing Update Started",
        description: "Bulk pricing update has been initiated.",
      });
    },
  });
  
  // County discovery mutations (from admin-clean-full)
  const discoverCountyMutation = useMutation({
    mutationFn: async (county: string) => {
      setDiscoveryLoading(true);
      return await apiRequest('POST', '/api/admin/discovery/county', { county });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/counties'] });
      toast({
        title: "Discovery Started",
        description: "County discovery campaign has been initiated.",
      });
    },
    onSettled: () => {
      setDiscoveryLoading(false);
    },
  });
  
  const enrichWithGooglePlacesMutation = useMutation({
    mutationFn: async (communityIds: number[]) => {
      return await apiRequest('POST', '/api/admin/enrich/google-places', { communityIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/enrichment'] });
      toast({
        title: "Google Places Enrichment",
        description: "Enrichment process started for selected communities.",
      });
    },
  });
  
  // Live activity mutations (from admin-unified)
  const broadcastAlertMutation = useMutation({
    mutationFn: async (message: string) => {
      return await apiRequest('POST', '/api/admin/broadcast', { message });
    },
    onSuccess: () => {
      toast({
        title: "Alert Broadcasted",
        description: "Alert has been sent to all active users.",
      });
    },
  });
  
  const pauseOperationsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/admin/operations/pause');
    },
    onSuccess: () => {
      toast({
        title: "Operations Paused",
        description: "All background operations have been paused.",
        variant: "destructive",
      });
    },
  });
  
  const resumeOperationsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/admin/operations/resume');
    },
    onSuccess: () => {
      toast({
        title: "Operations Resumed",
        description: "All background operations have been resumed.",
      });
    },
  });
  
  // Analytics refresh mutations (from admin-creative)
  const refreshAnalyticsMutation = useMutation({
    mutationFn: async (type: string) => {
      setActiveActions({ ...activeActions, [type]: true });
      return await apiRequest('POST', `/api/admin/refresh/${type}`);
    },
    onSuccess: (_, type) => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/${type}`] });
      toast({
        title: "Data Refreshed",
        description: `${type} data has been refreshed successfully.`,
      });
    },
    onSettled: (_, __, type) => {
      setActiveActions({ ...activeActions, [type]: false });
    },
  })

  // ========== PERMISSION CHECK (AFTER ALL HOOKS) ==========
  // Check super admin access AFTER all hooks are called (React Rules of Hooks requirement)
  const userRole = (user as any)?.role || '';
  const userEmail = (user as any)?.email || '';
  // In production, only allow explicitly authorized users
  const isSuperAdmin = userRole === 'super_admin' || 
                       userEmail === 'william.cowell01@gmail.com' || 
                       userEmail === 'hello@myseniorvalet.com';
  
  // Now we can safely return early if user doesn't have permission
  if (!user || !isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="max-w-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Shield className="h-16 w-16 text-red-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Admin Access Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400 text-center">
              This dashboard is restricted to MySeniorValet administrators only.
            </p>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm text-yellow-800 dark:text-yellow-300">
                  <p className="font-semibold mb-1">Authorized Access Only</p>
                  <p className="text-xs">
                    All access attempts are logged and monitored. Unauthorized access attempts will be reported.
                  </p>
                </div>
              </div>
            </div>
            {user && (
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Logged in as: {userEmail} (Role: {userRole})
              </div>
            )}
            <div className="flex justify-center">
              <Button onClick={() => window.location.href = '/'}>
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
      const response = await apiRequest("POST", "/api/admin/export", {
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
    const stats = platformStats as any;
    const usersList = Array.isArray(users) ? users : [];
    
    return {
      platform: {
        totalCommunities: stats?.totalCommunities || 0,
        totalUsers: stats?.totalUsers || usersList.length || 0,
        totalVendors: usersList.filter((u: any) => u.role === 'vendor').length,
        activeSubscriptions: subscriptionData.summary?.total || 0,
        monthlyRevenue: (financialData as any)?.revenue?.month || 0,
        yearlyRevenue: (financialData as any)?.revenue?.year || 0,
        growthRate: (financialData as any)?.growthRate || 0,
      },
      performance: (performanceMetrics as any) || {
        responseTime: 0,
        uptime: 99.9,
        errorRate: 0,
        apiCalls: 0,
        cacheHitRate: 0,
        dbQueries: 0,
      },
      ai: {
        totalRequests: (aiMetrics as any)?.totalRequests || 0,
        byProvider: {
          claude: (aiMetrics as any)?.byProvider?.claude || 0,
          chatgpt: (aiMetrics as any)?.byProvider?.chatgpt || 0,
          perplexity: (aiMetrics as any)?.byProvider?.perplexity || 0,
          gemini: (aiMetrics as any)?.byProvider?.gemini || 0,
          grok: (aiMetrics as any)?.byProvider?.grok || 0,
        },
        costs: {
          total: (aiMetrics as any)?.costs?.total || 0,
          claude: (aiMetrics as any)?.costs?.claude || 0,
          chatgpt: (aiMetrics as any)?.costs?.chatgpt || 0,
          perplexity: (aiMetrics as any)?.costs?.perplexity || 0,
          gemini: (aiMetrics as any)?.costs?.gemini || 0,
        },
        successRate: (aiMetrics as any)?.successRate || 0,
        avgResponseTime: (aiMetrics as any)?.avgResponseTime || 0,
      },
      financial: {
        revenue: (financialData as any)?.revenue || {
          today: 0,
          week: 0,
          month: 0,
          year: 0,
        },
        subscriptions: {
          community: { free: 0, standard: 0, featured: 0, platinum: 0 },
          vendor: { basic: 0, featured: 0, national: 0 },
        },
        paymentSuccess: (financialData as any)?.paymentSuccess || 0,
        churnRate: (financialData as any)?.churnRate || 0,
        ltv: (financialData as any)?.ltv || 0,
        arpu: (financialData as any)?.arpu || 0,
      },
      geographic: (geographicData as any) || {
        byState: {},
        byCountry: { usa: 0, canada: 0 },
        topCities: [],
        expansionProgress: 0,
      },
      engagement: (engagementMetrics as any) || {
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

  // Remove the old calculateMetrics and use real data from API
  // const metrics = calculateMetrics(); // OLD - removed to use real data

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
          <div className="text-2xl font-bold">{(metrics.platform.totalCommunities || 0).toLocaleString()}</div>
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
          <div className="text-2xl font-bold">{(metrics.platform.totalUsers || 0).toLocaleString()}</div>
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
          <div className="text-2xl font-bold">${(metrics.platform.monthlyRevenue || 0).toLocaleString()}</div>
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
          <div className="text-2xl font-bold">{(metrics.ai.totalRequests || 0).toLocaleString()}</div>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <DollarSign className="h-3 w-3 mr-1" />
            Cost: ${(metrics.ai.costs.total || 0).toFixed(2)}
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
          <Button 
            variant="outline" 
            size="icon"
            onClick={async () => {
              if (!searchQuery.trim()) return;
              
              try {
                const res = await fetch(`/api/admin/users/search?query=${encodeURIComponent(searchQuery)}`);
                const results = await res.json();
                
                // Show search results
                if (results.length > 0) {
                  // Refresh the users list query to show search results
                  queryClient.setQueryData(['/api/admin/users', currentPage, searchQuery], {
                    users: results,
                    pagination: usersList?.pagination
                  });
                  toast({ title: "Success", description: `Found ${results.length} users` });
                } else {
                  toast({ title: "Info", description: 'No users found' });
                }
              } catch (error) {
                toast({ title: "Error", description: 'Search failed', variant: "destructive" });
              }
            }}
          >
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
              {Array.isArray(usersList?.users) && usersList.users.slice(0, 10).map((user: any) => (
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
                    <Badge variant={(user.isActive ?? true) === false ? "destructive" : "default"}>
                      {(user.isActive ?? true) === false ? "Deactivated" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(user.createdAt), 'MMM d, yyyy')}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleUserBanMutation.mutate({ 
                          userId: user.id, 
                          setActive: (user.isActive ?? true) === false // If currently deactivated, set to active
                        })}
                        title={(user.isActive ?? true) === false ? "Reactivate user" : "Deactivate user"}
                      >
                        {(user.isActive ?? true) === false ? <Unlock className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={async () => {
                          try {
                            const res = await fetch(`/api/admin/users/${user.id}/details`);
                            const details = await res.json();
                            
                            // Show user details in a modal or alert
                            const detailsMessage = `
User: ${details.user.email}
Role: ${details.user.role}
Account Age: ${details.stats.accountAge} days
Last Active: ${new Date(details.stats.lastActive).toLocaleDateString()}
Communities Created: ${details.stats.communitiesCreated}`;
                            
                            alert(detailsMessage);
                          } catch (error) {
                            toast({ title: "Error", description: 'Failed to fetch user details', variant: "destructive" });
                          }
                        }}
                      >
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
              {subscriptionPlans.map((plan) => (
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
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            // Show edit dialog for subscription plan
                            const newPrice = prompt(`Enter new price for ${plan.name} (current: $${plan.price}):`, plan.price.toString());
                            if (newPrice && !isNaN(Number(newPrice))) {
                              updatePlanMutation.mutate({
                                planId: plan.id,
                                updates: { price: Number(newPrice) }
                              });
                            }
                          }}
                        >
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
            {subscriptionsLoading ? (
              <div className="flex justify-center items-center h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : subscriptionsError ? (
              <div className="flex flex-col justify-center items-center h-[300px] text-center">
                <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
                <p className="text-muted-foreground">Failed to load subscriptions</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </div>
            ) : (
              <>
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Next Billing</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(subscriptionData.subscriptions || []).slice(0, 10).map((sub: any) => (
                        <TableRow key={sub.id}>
                          <TableCell>{sub.customerName}</TableCell>
                          <TableCell>
                            <Badge>{sub.planName}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={sub.entityType === 'community' ? 'default' : 'secondary'}>
                              {sub.entityType === 'community' ? 'Community' : 'Vendor'}
                            </Badge>
                          </TableCell>
                          <TableCell>${((sub.amount || 0) / 100).toFixed(2)}/mo</TableCell>
                          <TableCell>
                            {sub.nextBilling ? format(new Date(sub.nextBilling), 'MMM d, yyyy') : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => cancelSubscriptionMutation.mutate(sub.numericId)}
                              title="Cancel subscription"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {(subscriptionData.subscriptions || []).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            No active subscriptions found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
                <div className="mt-4 p-4 border rounded-lg bg-muted/50">
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Active:</span>
                      <span className="ml-2 font-medium">{subscriptionData.summary?.total || 0}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Communities:</span>
                      <span className="ml-2 font-medium">{subscriptionData.summary?.community || 0}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Vendors:</span>
                      <span className="ml-2 font-medium">{subscriptionData.summary?.vendor || 0}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">MRR:</span>
                      <span className="ml-2 font-medium text-green-600">${(subscriptionData.summary?.totalMRR || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="revenue">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">MRR</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${(metrics.financial.revenue.month || 0).toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">ARR</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${(metrics.financial.revenue.year || 0).toLocaleString()}</div>
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
                <LineChart data={(revenueAnalytics as any)?.monthly || []}>
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
                <span className="font-medium">${(metrics.ai.costs.claude || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">ChatGPT</span>
                <span className="font-medium">${(metrics.ai.costs.chatgpt || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Perplexity</span>
                <span className="font-medium">${(metrics.ai.costs.perplexity || 0).toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center font-bold">
                <span>Total</span>
                <span>${(metrics.ai.costs.total || 0).toFixed(2)}</span>
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
              <span className="text-sm text-muted-foreground">{(metrics.performance.apiCalls || 0).toLocaleString()} today</span>
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
              <span className="text-sm text-muted-foreground">{(metrics.performance.dbQueries || 0).toLocaleString()}/min</span>
            </div>
            <Progress value={Math.min((metrics.performance.dbQueries / 1000) * 100, 100)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Community Management (from admin-communities) — upgraded UI/UX
  const renderCommunityManagement = () => {
    const stats = communityStats as any;
    const fc = filteredCommunities as any;
    const total = stats?.total || 0;
    const pct = (n: number) => total > 0 ? Math.round((n / total) * 100) : 0;

    const activeFilterCount = [
      searchQuery !== '',
      stateFilter !== 'all',
      countryFilter !== 'all',
      typeFilter !== 'all',
      verificationFilter !== 'all',
    ].filter(Boolean).length;

    const clearFilters = () => {
      setSearchQuery('');
      setStateFilter('all');
      setCountryFilter('all');
      setTypeFilter('all');
      setVerificationFilter('all');
      setCurrentPage(1);
    };

    const totalPages = fc?.totalPages || 0;
    const pageWindow = (() => {
      if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
      const pages: (number | '…')[] = [1];
      if (currentPage > 3) pages.push('…');
      for (let p = Math.max(2, currentPage - 1); p <= Math.min(totalPages - 1, currentPage + 1); p++) pages.push(p);
      if (currentPage < totalPages - 2) pages.push('…');
      pages.push(totalPages);
      return pages;
    })();

    const statCards = [
      { label: 'Total', value: stats?.total, icon: Building2, bg: 'bg-slate-500/10', color: 'text-slate-600 dark:text-slate-300', sub: '' },
      { label: 'Verified', value: stats?.verified, icon: CheckCircle2, bg: 'bg-green-500/10', color: 'text-green-600', sub: `${pct(stats?.verified)}%` },
      { label: 'With Photos', value: stats?.withPhotos, icon: Camera, bg: 'bg-blue-500/10', color: 'text-blue-600', sub: `${pct(stats?.withPhotos)}%` },
      { label: 'With Pricing', value: stats?.withPricing, icon: DollarSign, bg: 'bg-purple-500/10', color: 'text-purple-600', sub: `${pct(stats?.withPricing)}%` },
      { label: 'Hidden', value: stats?.hidden, icon: EyeOff, bg: 'bg-orange-500/10', color: 'text-orange-500', sub: stats?.hidden > 0 ? 'not public' : '' },
      { label: 'Flagged', value: stats?.flagged, icon: Flag, bg: 'bg-red-500/10', color: 'text-red-500', sub: stats?.flagged > 0 ? 'needs review' : '' },
    ];

    // Derive flag counts by status from data (used for filter button badges)
    const flagCountByStatus: Record<string, number> = {};
    if (Array.isArray((listingFlagsData as any)?.flags)) {
      for (const f of (listingFlagsData as any).flags) {
        flagCountByStatus[f.status] = (flagCountByStatus[f.status] || 0) + 1;
      }
    }

    return (
      <UiTooltipProvider delayDuration={300}>
        <div className="space-y-4">
          {/* ── Stat cards ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {statCards.map(({ label, value, icon: Icon, bg, color, sub }) => (
              <Card key={label} className="relative overflow-hidden">
                <CardContent className="p-3 flex items-start gap-2.5">
                  <div className={`rounded-md p-1.5 shrink-0 ${bg}`}>
                    <Icon className={`h-4 w-4 ${color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground leading-none mb-1">{label}</p>
                    <p className={`text-lg font-bold leading-none ${color}`}>
                      {value?.toLocaleString() ?? <Skeleton className="h-4 w-12 inline-block" />}
                    </p>
                    {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ── Sub-tab switcher ── */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={communitySubTab === 'listings' ? 'default' : 'outline'}
              onClick={() => setCommunitySubTab('listings')}
            >
              <Building2 className="h-4 w-4 mr-1.5" />
              Listings
              {fc?.total > 0 && (
                <Badge variant="secondary" className="ml-1.5 text-[10px] h-4 px-1 font-normal">
                  {fc.total.toLocaleString()}
                </Badge>
              )}
            </Button>
            <Button
              size="sm"
              variant={communitySubTab === 'flags' ? 'default' : 'outline'}
              onClick={() => setCommunitySubTab('flags')}
            >
              <Flag className="h-4 w-4 mr-1.5" />
              Flag Queue
              {stats?.flagged > 0 && (
                <Badge className="ml-1.5 bg-red-500 text-white text-[10px] h-4 px-1.5">{stats.flagged}</Badge>
              )}
            </Button>
          </div>

          {/* ══════════ LISTINGS TAB ══════════ */}
          {communitySubTab === 'listings' && (
            <Card>
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    Community Listings
                    {fc?.total !== undefined && (
                      <span className="text-sm font-normal text-muted-foreground">
                        ({fc.total.toLocaleString()} communities)
                      </span>
                    )}
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={() => updateAllPricingMutation.mutate()} className="shrink-0">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Update Pricing
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {/* ── Filter bar ── */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <div className="relative flex-1 min-w-[180px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      placeholder="Search by name, city, or ID…"
                      value={searchQuery}
                      onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                      className="pl-8 h-9"
                    />
                  </div>
                  <Select value={countryFilter} onValueChange={v => { setCountryFilter(v); setCurrentPage(1); }}>
                    <SelectTrigger className="w-32 h-9">
                      <SelectValue placeholder="Country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Countries</SelectItem>
                      {((communityFilterOptions as any)?.countries || []).map((c: any) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.value} ({c.count.toLocaleString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={stateFilter} onValueChange={v => { setStateFilter(v); setCurrentPage(1); }}>
                    <SelectTrigger className="w-28 h-9">
                      <SelectValue placeholder="State" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All States</SelectItem>
                      {((communityFilterOptions as any)?.states || []).map((s: any) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.value} ({s.count.toLocaleString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={v => { setTypeFilter(v); setCurrentPage(1); }}>
                    <SelectTrigger className="w-38 h-9">
                      <SelectValue placeholder="Care Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Assisted Living">Assisted Living</SelectItem>
                      <SelectItem value="Memory Care">Memory Care</SelectItem>
                      <SelectItem value="Independent Living">Independent Living</SelectItem>
                      <SelectItem value="Skilled Nursing">Skilled Nursing</SelectItem>
                      <SelectItem value="55+ Active">55+ Active</SelectItem>
                      <SelectItem value="HUD Housing">HUD Housing</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={verificationFilter} onValueChange={v => { setVerificationFilter(v); setCurrentPage(1); }}>
                    <SelectTrigger className="w-32 h-9">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="unverified">Unverified</SelectItem>
                    </SelectContent>
                  </Select>
                  {activeFilterCount > 0 && (
                    <Button variant="ghost" size="sm" className="h-9 text-muted-foreground hover:text-foreground gap-1.5" onClick={clearFilters}>
                      <X className="h-3 w-3" />
                      Clear {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}
                    </Button>
                  )}
                </div>

                {/* ── Table ── */}
                <div className="rounded-md border overflow-hidden">
                  <ScrollArea className="h-[440px]">
                    <Table>
                      <TableHeader className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
                        <TableRow className="hover:bg-transparent border-b">
                          <TableHead className="w-[240px] font-semibold">Community</TableHead>
                          <TableHead className="font-semibold">Location</TableHead>
                          <TableHead className="font-semibold">Type</TableHead>
                          <TableHead className="font-semibold">Status</TableHead>
                          <TableHead className="font-semibold">Pricing</TableHead>
                          <TableHead className="font-semibold text-center w-[52px]">Photos</TableHead>
                          <TableHead className="text-right font-semibold w-[180px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {/* Loading skeleton */}
                        {!fc?.communities && Array.from({ length: 8 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-6 mx-auto" /></TableCell>
                            <TableCell><Skeleton className="h-7 w-32 ml-auto" /></TableCell>
                          </TableRow>
                        ))}

                        {/* Empty state */}
                        {Array.isArray(fc?.communities) && fc.communities.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={7}>
                              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                                <Building2 className="h-10 w-10 opacity-20" />
                                <p className="font-medium">No communities match your filters</p>
                                {activeFilterCount > 0 && (
                                  <Button variant="ghost" size="sm" onClick={clearFilters}>Clear filters</Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}

                        {/* Rows */}
                        {Array.isArray(fc?.communities) && fc.communities.map((community: any) => {
                          const careLabel = (community.careTypes?.[0] || community.care_type || '')
                            .replace(/_/g, ' ')
                            .replace(/\b\w/g, (c: string) => c.toUpperCase());
                          const pricing = community.pricingFrom || community.pricing_from || community.rentPerMonth;
                          return (
                            <TableRow
                              key={community.id}
                              className={`transition-colors ${community.isHidden ? 'opacity-50 bg-orange-500/5' : ''} ${community.flagStatus ? 'bg-red-500/5' : ''}`}
                            >
                              {/* Community name + badges */}
                              <TableCell className="py-2.5">
                                <div className="font-medium text-sm leading-snug truncate max-w-[200px]" title={community.name}>
                                  {community.name}
                                </div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {community.isHidden && (
                                    <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-orange-500/10 text-orange-500 font-medium">
                                      <EyeOff className="h-2.5 w-2.5" /> Hidden
                                    </span>
                                  )}
                                  {community.flagStatus && (
                                    <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-500 font-medium">
                                      <Flag className="h-2.5 w-2.5" /> Flagged
                                    </span>
                                  )}
                                </div>
                              </TableCell>

                              {/* Location */}
                              <TableCell className="py-2.5">
                                <div className="flex items-center gap-1 text-sm">
                                  <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                                  <span className="truncate">{community.city}, {community.state}</span>
                                </div>
                              </TableCell>

                              {/* Care type */}
                              <TableCell className="py-2.5">
                                {careLabel ? (
                                  <Badge variant="outline" className="text-[11px] font-normal whitespace-nowrap">
                                    {careLabel}
                                  </Badge>
                                ) : (
                                  <span className="text-xs text-muted-foreground/50">—</span>
                                )}
                              </TableCell>

                              {/* Verification status */}
                              <TableCell className="py-2.5">
                                {community.isVerified ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 font-medium">
                                    <CheckCircle2 className="h-3 w-3" /> Verified
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                                    <XCircle className="h-3 w-3" /> Unverified
                                  </span>
                                )}
                              </TableCell>

                              {/* Pricing */}
                              <TableCell className="py-2.5">
                                {pricing ? (
                                  <span className="text-sm font-medium text-foreground">
                                    ${Number(pricing).toLocaleString()}<span className="text-xs text-muted-foreground font-normal">/mo</span>
                                  </span>
                                ) : (
                                  <span className="text-xs text-muted-foreground/50">No pricing</span>
                                )}
                              </TableCell>

                              {/* Photo count */}
                              <TableCell className="py-2.5 text-center">
                                <span className={`inline-flex items-center justify-center gap-0.5 text-xs font-medium tabular-nums ${(community.photos?.length || 0) > 0 ? 'text-blue-500' : 'text-muted-foreground/40'}`}>
                                  <Camera className="h-3 w-3" />
                                  {community.photos?.length || 0}
                                </span>
                              </TableCell>

                              {/* Actions */}
                              <TableCell className="py-2.5 text-right">
                                <div className="flex gap-0.5 justify-end items-center">
                                  <UiTooltip>
                                    <UiTooltipTrigger asChild>
                                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                        onClick={() => window.open(`/senior-living/${encodeURIComponent(community.state?.toLowerCase() || '')}/${encodeURIComponent(community.city?.toLowerCase().replace(/\s+/g, '-') || '')}/${encodeURIComponent(community.name?.toLowerCase().replace(/\s+/g, '-') || '')}`, '_blank')}>
                                        <Eye className="h-3.5 w-3.5" />
                                      </Button>
                                    </UiTooltipTrigger>
                                    <UiTooltipContent side="top">View public listing</UiTooltipContent>
                                  </UiTooltip>

                                  <UiTooltip>
                                    <UiTooltipTrigger asChild>
                                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-blue-500 hover:text-blue-600"
                                        onClick={() => window.open(`/admin/community/${community.id}/edit`, '_blank')}>
                                        <Edit className="h-3.5 w-3.5" />
                                      </Button>
                                    </UiTooltipTrigger>
                                    <UiTooltipContent side="top">Edit community</UiTooltipContent>
                                  </UiTooltip>

                                  {!community.isVerified && (
                                    <UiTooltip>
                                      <UiTooltipTrigger asChild>
                                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-green-600 hover:text-green-700"
                                          onClick={() => verifyCommunityMutation.mutate(community.id)}>
                                          <CheckCircle2 className="h-3.5 w-3.5" />
                                        </Button>
                                      </UiTooltipTrigger>
                                      <UiTooltipContent side="top">Mark as verified</UiTooltipContent>
                                    </UiTooltip>
                                  )}

                                  <UiTooltip>
                                    <UiTooltipTrigger asChild>
                                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-purple-500 hover:text-purple-600"
                                        onClick={() => enrichCommunityMutation.mutate(community.id)}>
                                        <Sparkles className="h-3.5 w-3.5" />
                                      </Button>
                                    </UiTooltipTrigger>
                                    <UiTooltipContent side="top">Enrich with web data</UiTooltipContent>
                                  </UiTooltip>

                                  {community.isHidden ? (
                                    <UiTooltip>
                                      <UiTooltipTrigger asChild>
                                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-orange-500 hover:text-orange-600"
                                          onClick={() => unhideCommunityMutation.mutate(community.id)}>
                                          <Eye className="h-3.5 w-3.5" />
                                        </Button>
                                      </UiTooltipTrigger>
                                      <UiTooltipContent side="top">Restore to public</UiTooltipContent>
                                    </UiTooltip>
                                  ) : (
                                    <UiTooltip>
                                      <UiTooltipTrigger asChild>
                                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-orange-500"
                                          onClick={() => hideCommunityMutation.mutate(community.id)}>
                                          <EyeOff className="h-3.5 w-3.5" />
                                        </Button>
                                      </UiTooltipTrigger>
                                      <UiTooltipContent side="top">Hide from public</UiTooltipContent>
                                    </UiTooltip>
                                  )}

                                  <UiTooltip>
                                    <UiTooltipTrigger asChild>
                                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                                        onClick={() => {
                                          if (confirm(`Delete "${community.name}"? This cannot be undone.`)) {
                                            deleteCommunityMutation.mutate(community.id);
                                          }
                                        }}>
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </UiTooltipTrigger>
                                    <UiTooltipContent side="top">Delete permanently</UiTooltipContent>
                                  </UiTooltip>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>

                {/* ── Pagination ── */}
                {totalPages > 0 && (
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <p className="text-sm text-muted-foreground">
                      {fc?.total ? (
                        <>
                          Showing {((currentPage - 1) * itemsPerPage + 1).toLocaleString()}–
                          {Math.min(currentPage * itemsPerPage, fc.total).toLocaleString()} of{' '}
                          <span className="font-medium text-foreground">{fc.total.toLocaleString()}</span> communities
                        </>
                      ) : `Page ${currentPage} of ${totalPages}`}
                    </p>
                    {totalPages > 1 && (
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="outline" className="h-7 px-2" disabled={currentPage <= 1}
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>
                          <ChevronLeft className="h-3.5 w-3.5" />
                        </Button>
                        {pageWindow.map((p, i) =>
                          p === '…' ? (
                            <span key={`ellipsis-${i}`} className="text-muted-foreground text-sm px-1">…</span>
                          ) : (
                            <Button
                              key={p}
                              size="sm"
                              variant={p === currentPage ? 'default' : 'outline'}
                              className="h-7 w-7 p-0 text-xs"
                              onClick={() => setCurrentPage(p as number)}
                            >
                              {p}
                            </Button>
                          )
                        )}
                        <Button size="sm" variant="outline" className="h-7 px-2" disabled={currentPage >= totalPages}
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ══════════ FLAG QUEUE TAB ══════════ */}
          {communitySubTab === 'flags' && (
            <Card>
              <CardHeader className="pb-3 pt-4 px-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Flag className="h-4 w-4 text-red-500" />
                  Listing Flag Queue
                </CardTitle>
                <CardDescription>Review and act on community reports submitted by users</CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {/* Status filter pills */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {(['Pending', 'Under Review', 'Resolved', 'Dismissed', 'all'] as const).map(s => {
                    const count = s === 'all'
                      ? (listingFlagsData as any)?.flags?.length
                      : flagCountByStatus[s];
                    return (
                      <button
                        key={s}
                        onClick={() => setFlagStatusFilter(s)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          flagStatusFilter === s
                            ? s === 'Pending' || s === 'all' && (listingFlagsData as any)?.flags?.some((f: any) => f.status === 'Pending')
                              ? 'bg-red-500 border-red-500 text-white'
                              : 'bg-primary border-primary text-primary-foreground'
                            : 'border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                        }`}
                      >
                        {s === 'Pending' && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                        {s === 'all' ? 'All Flags' : s}
                        {count !== undefined && count > 0 && (
                          <span className={`rounded-full px-1 min-w-[16px] text-center leading-tight ${flagStatusFilter === s ? 'bg-white/20' : 'bg-muted'}`}>
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {flagsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="rounded-lg border p-4 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-64" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    ))}
                  </div>
                ) : !(listingFlagsData as any)?.flags?.length ? (
                  <div className="flex flex-col items-center justify-center py-14 text-muted-foreground gap-3">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                      <Flag className="h-5 w-5 opacity-40" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium">No flags in this queue</p>
                      <p className="text-sm text-muted-foreground/70 mt-0.5">
                        {flagStatusFilter !== 'all' ? `No ${flagStatusFilter.toLowerCase()} flags` : 'All clear — no community reports to review'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <ScrollArea className="h-[480px]">
                    <div className="space-y-3 pr-1">
                      {(listingFlagsData as any).flags.map((flag: any) => (
                        <div
                          key={flag.id}
                          className={`rounded-lg border p-4 transition-colors ${
                            flag.status === 'Pending'
                              ? 'border-red-200 dark:border-red-900/50 bg-red-500/5'
                              : flag.status === 'Under Review'
                              ? 'border-yellow-200 dark:border-yellow-900/50 bg-yellow-500/5'
                              : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center flex-wrap gap-2 mb-2">
                                <Badge variant="destructive" className="text-xs">{flag.flagType}</Badge>
                                <Badge variant={flag.status === 'Pending' ? 'destructive' : flag.status === 'Resolved' ? 'default' : 'secondary'} className="text-xs">
                                  {flag.status}
                                </Badge>
                              </div>
                              <p className="font-medium text-sm">
                                {flag.communityName}
                                <span className="text-muted-foreground font-normal"> · {flag.communityCity}, {flag.communityState}</span>
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">{flag.reason}</p>
                              {flag.details && (
                                <p className="text-xs text-muted-foreground/80 mt-1 italic border-l-2 border-muted pl-2">{flag.details}</p>
                              )}
                              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                {flag.reporterName && (
                                  <span>
                                    Reported by <span className="font-medium text-foreground">{flag.reporterName}</span>
                                    {flag.reporterEmail && <span className="opacity-70"> ({flag.reporterEmail})</span>}
                                  </span>
                                )}
                                {flag.createdAt && (
                                  <span>{new Date(flag.createdAt).toLocaleDateString()}</span>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col gap-2 shrink-0 min-w-[100px]">
                              {(flag.status === 'Pending' || flag.status === 'Under Review') && (
                                <>
                                  <Button size="sm" variant="outline" className="text-green-700 border-green-300 hover:bg-green-50 dark:hover:bg-green-950 h-7 text-xs"
                                    onClick={() => confirmFlagMutation.mutate({ flagId: flag.id, hideAlso: false })}>
                                    <CheckCircle2 className="h-3 w-3 mr-1" /> Confirm
                                  </Button>
                                  <Button size="sm" variant="destructive" className="h-7 text-xs"
                                    onClick={() => confirmFlagMutation.mutate({ flagId: flag.id, hideAlso: true })}>
                                    <EyeOff className="h-3 w-3 mr-1" /> Confirm + Hide
                                  </Button>
                                  <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground hover:text-foreground"
                                    onClick={() => dismissFlagMutation.mutate(flag.id)}>
                                    <X className="h-3 w-3 mr-1" /> Dismiss
                                  </Button>
                                </>
                              )}
                              <div className="flex gap-1 pt-1 border-t mt-1">
                                <UiTooltip>
                                  <UiTooltipTrigger asChild>
                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-blue-500"
                                      onClick={() => window.open(`/admin/community/${flag.communityId}/edit`, '_blank')}>
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                  </UiTooltipTrigger>
                                  <UiTooltipContent>Edit community</UiTooltipContent>
                                </UiTooltip>
                                <UiTooltip>
                                  <UiTooltipTrigger asChild>
                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 hover:text-orange-500"
                                      onClick={() => hideCommunityMutation.mutate(flag.communityId)}>
                                      <EyeOff className="h-3 w-3" />
                                    </Button>
                                  </UiTooltipTrigger>
                                  <UiTooltipContent>Hide from public</UiTooltipContent>
                                </UiTooltip>
                                <UiTooltip>
                                  <UiTooltipTrigger asChild>
                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 hover:text-destructive"
                                      onClick={() => {
                                        if (confirm(`Delete "${flag.communityName}"? This cannot be undone.`)) {
                                          deleteCommunityMutation.mutate(flag.communityId);
                                        }
                                      }}>
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </UiTooltipTrigger>
                                  <UiTooltipContent>Delete permanently</UiTooltipContent>
                                </UiTooltip>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </UiTooltipProvider>
    );
  };
  
  // County Discovery Metrics (from admin-clean-full)
  const renderCountyDiscovery = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-green-600" />
          County Discovery Metrics
        </CardTitle>
        <CardDescription>Real-time expansion and discovery statistics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total Discovered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(expansionData as any)?.totals?.communities || 0}</div>
              <Progress value={expansionProgress} className="mt-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Counties Covered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(expansionData as any)?.totals?.counties || 0}</div>
              <div className="text-sm text-muted-foreground">of 3,143 total</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Verification Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(expansionData as any)?.totals?.verificationRate || 0}%</div>
              <div className="text-sm text-muted-foreground">Communities verified</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Google Places Enriched</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(enrichmentStats as any)?.enriched || 0}</div>
              <div className="text-sm text-muted-foreground">${(enrichmentStats as any)?.cost?.toFixed(2) || '0.00'} spent</div>
            </CardContent>
          </Card>
        </div>
        
        {/* County Breakdown */}
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Top Counties by Discovery</h4>
          <ScrollArea className="h-[200px]">
            {Array.isArray((countyMetrics as any)?.counties) && (countyMetrics as any).counties.map((county: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center py-2 px-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                <div>
                  <div className="font-medium">{county.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {county.communities} communities • {county.verified} verified
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">{county.withPhotos} photos</Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => discoverCountyMutation.mutate(county.name)}
                    disabled={discoveryLoading}
                  >
                    <Search className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>
        
        {/* Discovery Controls */}
        <div className="space-y-2">
          <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription>
              Discovery operations consume API credits. Current rate: ${(apiCosts as any)?.perHour || '0.00'}/hour
            </AlertDescription>
          </Alert>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDiscoveryMetrics(!showDiscoveryMetrics)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {showDiscoveryMetrics ? 'Hide' : 'Show'} Details
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                const county = prompt('Enter county name to discover:');
                if (county) discoverCountyMutation.mutate(county);
              }}
              disabled={discoveryLoading}
            >
              <Globe className="h-4 w-4 mr-2" />
              Discover County
            </Button>
          </div>
        </div>
        
        {/* Discovery Progress */}
        {discoveryLoading && discoveryProgress && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Discovery in Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Communities Found</span>
                  <span className="font-medium">{(discoveryProgress as any)?.found || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Verified</span>
                  <span className="font-medium">{(discoveryProgress as any)?.verified || 0}</span>
                </div>
                <Progress value={(discoveryProgress as any)?.progress || 0} className="mt-2" />
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
  
  // Live Activity Dashboard (from admin-unified)
  const renderLiveActivity = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-green-600" />
          Live Activity Monitor
          {liveActivityPulse && (
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          )}
        </CardTitle>
        <CardDescription>Real-time platform activity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4" />
                Active Now
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{liveActivity?.stats?.activeUsers || activeUsers || 0}</div>
              <div className="flex items-center gap-1 mt-1">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-muted-foreground">Live</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Requests/Min</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{liveActivity?.stats?.requestsPerMinute || 0}</div>
              <div className="text-xs text-muted-foreground">Processing</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">System Load</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{liveActivity?.stats?.systemLoad?.toFixed(2) || '0.00'}</div>
              <div className="text-xs text-muted-foreground">CPU Usage</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Activity Feed */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Recent Activity</h4>
          <ScrollArea className="h-[200px]">
            {liveActivity?.activities && liveActivity.activities.length > 0 ? (
              liveActivity.activities.map((activity: any, idx: number) => (
                <div key={idx} className="flex items-start gap-2 py-2 border-b">
                  <div className={`h-2 w-2 rounded-full mt-1.5 ${
                    activity.type === 'user_registration' ? 'bg-green-500' :
                    activity.type === 'community_added' ? 'bg-blue-500' :
                    activity.severity === 'error' ? 'bg-red-500' : 
                    activity.severity === 'warning' ? 'bg-yellow-500' : 'bg-gray-500'
                  }`} />
                  <div className="flex-1">
                    <div className="text-sm">{activity.message}</div>
                    <div className="text-xs text-muted-foreground">
                      {activity.timestamp ? new Date(activity.timestamp).toLocaleTimeString() : 'Just now'}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">
                No recent activity
              </div>
            )}
          </ScrollArea>
        </div>
        
        {/* Operations Control */}
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => broadcastAlertMutation.mutate('System maintenance in 5 minutes')}
          >
            <Bell className="h-4 w-4 mr-2" />
            Broadcast Alert
          </Button>
          
          <Button
            variant="destructive"
            onClick={() => pauseOperationsMutation.mutate()}
          >
            <Pause className="h-4 w-4 mr-2" />
            Pause Operations
          </Button>
          
          <Button
            variant="outline"
            onClick={() => resumeOperationsMutation.mutate()}
          >
            <Play className="h-4 w-4 mr-2" />
            Resume Operations
          </Button>
        </div>
      </CardContent>
    </Card>
  );
  
  // System Management (from admin-unified)
  const renderSystemManagement = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-gray-600" />
          System Management
        </CardTitle>
        <CardDescription>System operations and maintenance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="h-24 flex-col"
            onClick={() => backupMutation.mutate()}
            disabled={backupMutation.isPending}
          >
            <Database className="h-6 w-6 mb-2" />
            System Backup
          </Button>
          
          <Button
            variant="outline"
            className="h-24 flex-col"
            onClick={() => clearCacheMutation.mutate('all')}
            disabled={clearCacheMutation.isPending}
          >
            <RefreshCw className="h-6 w-6 mb-2" />
            Clear All Cache
          </Button>
          
          <Button
            variant="outline"
            className="h-24 flex-col"
            onClick={() => {
              const newLimit = prompt('Enter new rate limit (requests per minute):');
              if (newLimit) {
                updateRateLimitMutation.mutate({ limit: parseInt(newLimit) });
              }
            }}
          >
            <Gauge className="h-6 w-6 mb-2" />
            Update Rate Limits
          </Button>
          
          <Button
            variant="outline"
            className="h-24 flex-col"
            onClick={async () => {
              setSystemHealthExpanded(!systemHealthExpanded);
              if (!systemHealth) {
                try {
                  const res = await fetch('/api/admin/system/health');
                  const data = await res.json();
                  setSystemHealth(data);
                } catch (error) {
                  toast.error('Failed to fetch system health');
                }
              }
            }}
          >
            <Activity className="h-6 w-6 mb-2" />
            System Health
          </Button>
        </div>
        
        {systemHealth && systemHealthExpanded && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between">
                System Health Details
                <Badge variant={systemHealth.status === 'healthy' ? 'default' : 'destructive'}>
                  {systemHealth.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* System Uptime */}
                <div className="flex justify-between">
                  <span>Uptime</span>
                  <span className="font-medium">{systemHealth.uptime}</span>
                </div>
                
                {/* Database Status */}
                {systemHealth.database && (
                  <div className="border-t pt-2">
                    <div className="text-sm font-medium mb-2">Database</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Status</span>
                        <Badge variant={systemHealth.database.status === 'connected' ? 'default' : 'destructive'}>
                          {systemHealth.database.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Records</span>
                        <span>{systemHealth.database.totalRecords?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Memory Usage */}
                {systemHealth.memory && (
                  <div className="border-t pt-2">
                    <div className="text-sm font-medium mb-2">Memory (MB)</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Heap Used</span>
                        <span>{systemHealth.memory.heapUsed} MB</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total</span>
                        <span>{systemHealth.memory.heapTotal} MB</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Services Status */}
                {systemHealth.services && (
                  <div className="border-t pt-2">
                    <div className="text-sm font-medium mb-2">Services</div>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(systemHealth.services).map(([service, status]) => (
                        <div key={service} className="flex items-center gap-2 text-sm">
                          <div className={`h-2 w-2 rounded-full ${
                            status === 'operational' ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          <span className="capitalize">{service}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Performance Metrics */}
                {systemHealth.performance && (
                  <div className="border-t pt-2">
                    <div className="text-sm font-medium mb-2">Performance</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Avg Response Time</span>
                        <span>{systemHealth.performance.averageResponseTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Requests/min</span>
                        <span>{systemHealth.performance.requestsPerMinute}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cache Hit Rate</span>
                        <span>{systemHealth.performance.cacheHitRate}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
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
              <Button 
                variant="outline" 
                size="sm" 
                onClick={async () => {
                  setActiveActions(prev => ({ ...prev, export: true }));
                  try {
                    const res = await fetch('/api/admin/reports/generate', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ reportType: 'financial', dateRange: 'daily' })
                    });
                    const data = await res.json();
                    
                    // Create and download JSON report
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'daily-summary.json';
                    a.click();
                    URL.revokeObjectURL(url);
                    
                    toast.success('Daily summary generated');
                  } catch (error) {
                    toast.error('Failed to generate daily summary');
                  } finally {
                    setActiveActions(prev => ({ ...prev, export: false }));
                  }
                }}
              >
                Daily Summary
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={async () => {
                  setActiveActions(prev => ({ ...prev, export: true }));
                  try {
                    const res = await fetch('/api/admin/reports/generate', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ reportType: 'financial', dateRange: 'weekly' })
                    });
                    const data = await res.json();
                    
                    // Create and download JSON report
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'weekly-report.json';
                    a.click();
                    URL.revokeObjectURL(url);
                    
                    toast.success('Weekly report generated');
                  } catch (error) {
                    toast.error('Failed to generate weekly report');
                  } finally {
                    setActiveActions(prev => ({ ...prev, export: false }));
                  }
                }}
              >
                Weekly Report
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleExport('csv', 'financial')}
              >
                Revenue CSV
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleExport('json', 'users')}
              >
                User List Export
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
        {/* Breadcrumb Navigation */}
        <BreadcrumbNavigation 
          items={[
            { label: 'Home', href: '/' },
            { label: 'Admin', href: '/admin-mega-dashboard' },
            { label: activeTab === 'overview' ? 'Overview' :
                     activeTab === 'users' ? 'Users' :
                     activeTab === 'subscriptions' ? 'Subscriptions' :
                     activeTab === 'monitoring' ? 'Monitoring & Alerts' :
                     activeTab === 'reports' ? 'Reports' :
                     activeTab === 'heatmap' ? 'Heatmap' :
                     activeTab === 'tools' ? 'Tools' :
                     activeTab === 'communities' ? 'Communities' :
                     activeTab === 'system' ? 'System' :
                     activeTab === 'discovery' ? 'Discovery' :
                     activeTab === 'activity' ? 'Live Activity' :
                     activeTab === 'contacts' ? 'Contact Inbox' : 'Overview' 
            }
          ]}
        />
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
          <ScrollArea className="w-full whitespace-nowrap">
            <TabsList className="inline-flex w-max gap-1 h-auto p-2 mb-2">
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
            <TabsTrigger value="monitoring">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Monitoring
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
            <TabsTrigger value="communities">
              <Building2 className="h-4 w-4 mr-2" />
              Communities
            </TabsTrigger>
            <TabsTrigger value="system">
              <Settings className="h-4 w-4 mr-2" />
              System
            </TabsTrigger>
            <TabsTrigger value="discovery">
              <Globe className="h-4 w-4 mr-2" />
              Discovery
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Activity className="h-4 w-4 mr-2" />
              Live Activity
            </TabsTrigger>
            <TabsTrigger value="financial">
              <DollarSign className="h-4 w-4 mr-2" />
              Financial
            </TabsTrigger>
            <TabsTrigger value="billing">
              <Receipt className="h-4 w-4 mr-2" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="compliance">
              <Shield className="h-4 w-4 mr-2" />
              Compliance
            </TabsTrigger>
            <TabsTrigger value="marketing">
              <Rocket className="h-4 w-4 mr-2" />
              Marketing
            </TabsTrigger>
            <TabsTrigger value="verification">
              <Database className="h-4 w-4 mr-2" />
              DB Verification
            </TabsTrigger>
            <TabsTrigger value="contacts">
              <Mail className="h-4 w-4 mr-2" />
              Contact Inbox
            </TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          
          <TabsContent value="overview" className="space-y-4">
            {/* Real Platform Metrics */}
            {renderOverviewCards()}
            
            {/* Recent Activity Feed with Real User Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  Recent Platform Activity
                </CardTitle>
                <CardDescription>
                  Live feed of user registrations and platform events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {activityLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : recentActivity?.activities && recentActivity.activities.length > 0 ? (
                    <div className="space-y-2">
                      {recentActivity.activities.map((activity: any) => (
                        <div key={`${activity.type}-${activity.id}-${activity.timestamp}`} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                          <div className={`h-2 w-2 rounded-full mt-1.5 ${
                            activity.type === 'user_registration' ? 'bg-green-500 animate-pulse' :
                            activity.type === 'community_claim' ? 'bg-blue-500' :
                            activity.type === 'vendor_registration' ? 'bg-purple-500' :
                            'bg-gray-500'
                          }`} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {activity.type === 'user_registration' && '👤 New User Registered'}
                                {activity.type === 'community_claim' && '🏢 Community Claimed'}
                                {activity.type === 'vendor_registration' && '🛍️ Vendor Joined'}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {activity.details || activity.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {activity.name || activity.email}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {activity.timestamp ? format(new Date(activity.timestamp), 'MMM d, h:mm a') : 'Just now'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No recent activity
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
            
            {/* Data Quality Dashboard */}
            <Suspense fallback={<div className="flex items-center justify-center h-40"><Loader2 className="w-6 h-6 animate-spin" /></div>}>
              <DataQualityDashboard />
            </Suspense>
            
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
          
          <TabsContent value="monitoring" className="space-y-4">
            <Suspense fallback={
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2">Loading monitoring system...</span>
              </div>
            }>
              <EnterpriseAlerts />
            </Suspense>
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
                  <EnhancedHeatmap />
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
                  <Button 
                    variant="outline" 
                    className="h-24 flex-col"
                    onClick={() => {
                      toast({
                        title: "Database Tools",
                        description: "Accessing database management interface...",
                      });
                      setActiveTab('communities');
                    }}
                  >
                    <Database className="h-6 w-6 mb-2" />
                    Database Tools
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-24 flex-col"
                    onClick={() => {
                      toast({
                        title: "Security Settings",
                        description: "Opening security configuration panel...",
                      });
                      setActiveTab('system');
                    }}
                  >
                    <Shield className="h-6 w-6 mb-2" />
                    Security Settings
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-24 flex-col"
                    onClick={() => {
                      toast({
                        title: "System Configuration",
                        description: "Loading system settings...",
                      });
                      setActiveTab('system');
                    }}
                  >
                    <Settings className="h-6 w-6 mb-2" />
                    System Config
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-24 flex-col"
                    onClick={() => {
                      toast({
                        title: "Test Tools",
                        description: "Opening testing dashboard...",
                      });
                      window.location.href = '/payment-test-dashboard';
                    }}
                  >
                    <TestTube className="h-6 w-6 mb-2" />
                    Test Tools
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-24 flex-col"
                    onClick={() => {
                      toast({
                        title: "Theme Settings",
                        description: "Theme customization coming soon!",
                        variant: "default",
                      });
                    }}
                  >
                    <Palette className="h-6 w-6 mb-2" />
                    Theme Settings
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-24 flex-col"
                    onClick={() => {
                      toast({
                        title: "Audit Logs",
                        description: "Loading audit history...",
                      });
                      setActiveTab('activity');
                    }}
                  >
                    <FileSearch className="h-6 w-6 mb-2" />
                    Audit Logs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="communities" className="space-y-4">
            {renderCommunityManagement()}
          </TabsContent>
          
          <TabsContent value="system" className="space-y-4">
            {renderSystemManagement()}
          </TabsContent>
          
          <TabsContent value="discovery" className="space-y-4">
            {renderCountyDiscovery()}
            <Suspense fallback={
              <Card>
                <CardContent className="flex items-center justify-center p-8">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  <span>Loading Global Discovery Queue...</span>
                </CardContent>
              </Card>
            }>
              <GlobalDiscoveryApprovalQueue />
            </Suspense>
          </TabsContent>
          
          <TabsContent value="activity" className="space-y-4">
            {renderLiveActivity()}
          </TabsContent>
          
          {/* Phase 5 Enterprise Features */}
          <TabsContent value="financial" className="space-y-4">
            <Suspense fallback={
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2">Loading financial analytics...</span>
              </div>
            }>
              <FinancialAnalyticsTab />
            </Suspense>
          </TabsContent>

          <TabsContent value="billing" className="space-y-4">
            <Suspense fallback={
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2">Loading billing dashboard...</span>
              </div>
            }>
              <BillingDashboard communityId={1} />
            </Suspense>
          </TabsContent>
          
          <TabsContent value="compliance" className="space-y-4">
            <Suspense fallback={
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2">Loading compliance management...</span>
              </div>
            }>
              <ComplianceTab />
            </Suspense>
          </TabsContent>
          
          <TabsContent value="marketing" className="space-y-4">
            <Suspense fallback={
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2">Loading marketing automation...</span>
              </div>
            }>
              <MarketingDashboard communityId={1} />
            </Suspense>
          </TabsContent>
          
          <TabsContent value="verification" className="space-y-4">
            <Suspense fallback={
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2">Loading database verification dashboard...</span>
              </div>
            }>
              <VerificationDashboard />
            </Suspense>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-4">
            <ContactSubmissionsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
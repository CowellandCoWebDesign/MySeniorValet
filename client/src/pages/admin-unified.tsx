import { useState, lazy, Suspense, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Shield, 
  Users, 
  Building2, 
  DollarSign, 
  BarChart3, 
  Link, 
  Settings,
  UserPlus,
  Edit,
  Trash2,
  Save,
  X,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  Phone,
  Share2,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Database,
  Server,
  Wifi,
  HardDrive,
  LogIn,
  Key,
  FileText,
  Lock,
  Unlock,
  Ban,
  AlertTriangle,
  Globe,
  Zap,
  RefreshCw,
  DownloadCloud,
  UploadCloud
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

// Lazy load dashboard components for better performance
const AdminDashboard = lazy(() => import("./admin-clean"));
const CommunityDashboard = lazy(() => import("./community-dashboard-modern"));
const UserDashboard = lazy(() => import("./dashboard"));
const VendorDashboard = lazy(() => import("./vendor-dashboard"));
const FinancialDashboard = lazy(() => import("./financial-dashboard"));

// Role definitions
const ROLE_DEFINITIONS = {
  super_admin: {
    label: "Super Admin",
    description: "Full system access",
    dashboards: ["admin", "users", "community", "vendor", "financial", "security"],
    color: "bg-gradient-to-r from-gray-300 to-gray-100",
    textColor: "text-gray-900",
    badgeClass: "bg-gradient-to-r from-gray-300 to-gray-100 text-gray-900 border-gray-400",
    tier: "Platinum"
  },
  admin: {
    label: "Admin",
    description: "Administrative access (includes analytics & integrations)",
    dashboards: ["admin", "users", "community", "security"],
    color: "bg-gradient-to-r from-yellow-400 to-yellow-200",
    textColor: "text-yellow-900",
    badgeClass: "bg-gradient-to-r from-yellow-400 to-yellow-200 text-yellow-900 border-yellow-500",
    tier: "Gold"
  },
  financial_admin: {
    label: "Financial Admin",
    description: "Financial and revenue management",
    dashboards: ["financial", "admin"],
    color: "bg-gradient-to-r from-emerald-400 to-emerald-200",
    textColor: "text-emerald-900",
    badgeClass: "bg-gradient-to-r from-emerald-400 to-emerald-200 text-emerald-900 border-emerald-500",
    tier: "Emerald"
  },
  support_agent: {
    label: "Support Agent",
    description: "User support and community management",
    dashboards: ["users", "community"],
    color: "bg-gradient-to-r from-blue-400 to-blue-200",
    textColor: "text-blue-900",
    badgeClass: "bg-gradient-to-r from-blue-400 to-blue-200 text-blue-900 border-blue-500",
    tier: "Silver"
  },
  analytics_viewer: {
    label: "Analytics Viewer",
    description: "View-only analytics access (via admin dashboard)",
    dashboards: ["admin"],
    color: "bg-gradient-to-r from-purple-400 to-purple-200",
    textColor: "text-purple-900",
    badgeClass: "bg-gradient-to-r from-purple-400 to-purple-200 text-purple-900 border-purple-500",
    tier: "Bronze"
  },
  community_owner: {
    label: "Community Owner",
    description: "Community management access",
    dashboards: ["community"],
    color: "bg-gradient-to-r from-orange-400 to-orange-200",
    textColor: "text-orange-900",
    badgeClass: "bg-gradient-to-r from-orange-400 to-orange-200 text-orange-900 border-orange-500",
    tier: "Bronze"
  },
  vendor: {
    label: "Vendor",
    description: "Vendor dashboard access",
    dashboards: ["vendor"],
    color: "bg-gradient-to-r from-teal-400 to-teal-200",
    textColor: "text-teal-900",
    badgeClass: "bg-gradient-to-r from-teal-400 to-teal-200 text-teal-900 border-teal-500",
    tier: "Bronze"
  },
  user: {
    label: "User",
    description: "Basic user access",
    dashboards: ["user"],
    color: "bg-gray-200",
    textColor: "text-gray-700",
    badgeClass: "bg-gray-200 text-gray-700 border-gray-400",
    tier: "Standard"
  }
};

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

// Enterprise Overview Component
const EnterpriseOverview = () => {
  // Industry-standard refresh intervals
  const STATS_REFRESH = 60000; // 60 seconds for general statistics
  const ACTIVITY_REFRESH = 30000; // 30 seconds for activity feed
  const HEALTH_REFRESH = 30000; // 30 seconds for system health
  
  // Real-time stats query
  const { data: realtimeStats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['/api/admin/realtime/stats'],
    refetchInterval: STATS_REFRESH,
  });

  // Activity feed query
  const { data: activityFeed, isLoading: feedLoading } = useQuery({
    queryKey: ['/api/admin/activity/feed'],
    refetchInterval: ACTIVITY_REFRESH,
  });

  // System health query
  const { data: systemHealth, isLoading: healthLoading } = useQuery({
    queryKey: ['/api/admin/system/health'],
    refetchInterval: HEALTH_REFRESH,
  });

  const stats = realtimeStats || {
    users: { total: 0, activeToday: 0, newThisWeek: 0, premium: 0, growthRate: 0, mrr: 0 },
    communities: { total: 0, claimed: 0, verified: 0, coverageRate: 0 },
    activity: { recentSearches: [], popularLocations: [], peakHour: 0, avgSessionDuration: 0 },
    system: { uptime: 0, responseTime: 0, errorRate: 0, activeConnections: 0 }
  };

  const activities = activityFeed?.activities || [];
  const health = systemHealth || { status: 'unknown', services: {}, metrics: {}, alerts: [] };

  // Activity icons
  const getActivityIcon = (icon: string) => {
    const icons: Record<string, any> = {
      Search, Eye, Heart, Phone, Share2, Building2, LogIn, Activity
    };
    return icons[icon] || Activity;
  };

  return (
    <div className="space-y-6">
      {/* Real-time Stats Cards */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Platform Overview</h3>
        <Badge variant="outline" className="text-xs">
          <Clock className="h-3 w-3 mr-1" />
          Updates every 60s
        </Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className={`inline-flex items-center ${Number(stats.users.growthRate) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Number(stats.users.growthRate) > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {stats.users.growthRate}% this week
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users.activeToday.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.system.activeConnections} active connections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Communities</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.communities.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.communities.coverageRate}% claimed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.users.mrr}</div>
            <p className="text-xs text-muted-foreground">
              {stats.users.premium} premium users
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Activity Feed */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Live Activity Feed</span>
              <Badge variant="outline" className="ml-2">
                <Clock className="h-3 w-3 mr-1" />
                Updates every 30s
              </Badge>
            </CardTitle>
            <CardDescription>
              User activity across the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {feedLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {activities.map((activity: any) => {
                    const IconComponent = getActivityIcon(activity.icon);
                    return (
                      <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className={`p-2 rounded-full bg-${activity.color}-100 dark:bg-${activity.color}-900/20`}>
                          <IconComponent className={`h-4 w-4 text-${activity.color}-600 dark:text-${activity.color}-400`} />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm">
                            <span className="font-medium">{activity.user.name}</span>
                            <span className="text-muted-foreground"> {activity.action}</span>
                            {activity.details?.communityName && (
                              <span className="font-medium"> {activity.details.communityName}</span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(activity.timestamp), 'MMM d, h:mm a')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>System Health</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  30s
                </Badge>
                <Badge variant={health.status === 'healthy' ? 'default' : 'destructive'}>
                  {health.status === 'healthy' ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
                  {health.status}
                </Badge>
              </div>
            </CardTitle>
            <CardDescription>
              Infrastructure monitoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            {healthLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Services Status */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Services</h4>
                  <div className="space-y-2">
                    {Object.entries(health.services || {}).map(([service, data]: [string, any]) => (
                      <div key={service} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {service === 'database' && <Database className="h-4 w-4 text-muted-foreground" />}
                          {service === 'redis' && <Server className="h-4 w-4 text-muted-foreground" />}
                          {service === 'search' && <Search className="h-4 w-4 text-muted-foreground" />}
                          {service === 'storage' && <HardDrive className="h-4 w-4 text-muted-foreground" />}
                          <span className="text-sm capitalize">{service}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={data.status === 'healthy' ? 'success' : 'destructive'} className="text-xs">
                            {data.status}
                          </Badge>
                          {data.latency && (
                            <span className="text-xs text-muted-foreground">{data.latency}ms</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* System Metrics */}
                <div>
                  <h4 className="text-sm font-medium mb-2">System Metrics</h4>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>CPU Usage</span>
                        <span>{health.metrics?.cpu || 0}%</span>
                      </div>
                      <Progress value={Number(health.metrics?.cpu || 0)} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Memory</span>
                        <span>{health.metrics?.memory || 0}%</span>
                      </div>
                      <Progress value={Number(health.metrics?.memory || 0)} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Disk Usage</span>
                        <span>{health.metrics?.disk || 0}%</span>
                      </div>
                      <Progress value={Number(health.metrics?.disk || 0)} className="h-2" />
                    </div>
                  </div>
                </div>

                {/* Alerts */}
                {health.alerts && health.alerts.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Active Alerts</h4>
                    <div className="space-y-2">
                      {health.alerts.map((alert: any, index: number) => (
                        <div key={index} className="p-2 rounded-md bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                          <p className="text-xs text-orange-800 dark:text-orange-200">
                            {alert.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Popular Locations & Recent Searches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Popular Locations</CardTitle>
            <CardDescription>Most searched areas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.activity.popularLocations.map((location: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{location.location}</span>
                  <span className="text-sm text-muted-foreground">{location.count} searches</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Insights</CardTitle>
            <CardDescription>Key metrics and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Response Time</span>
                <span className="text-sm font-medium">{stats.system.responseTime}ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Error Rate</span>
                <span className="text-sm font-medium">{stats.system.errorRate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Peak Hour</span>
                <span className="text-sm font-medium">{stats.activity.peakHour}:00</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Avg Session</span>
                <span className="text-sm font-medium">{stats.activity.avgSessionDuration} min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Uptime</span>
                <span className="text-sm font-medium">{stats.system.uptime}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Super Admin Controls Component
const SuperAdminControls = () => {
  const { toast } = useToast();
  const [selectedAction, setSelectedAction] = useState("");
  
  // System configuration query
  const { data: systemConfig } = useQuery({
    queryKey: ['/api/admin/system/config'],
    queryFn: () => apiRequest('GET', '/api/admin/system/config'),
  });

  // API keys query
  const { data: apiKeys } = useQuery({
    queryKey: ['/api/admin/api-keys'],
    queryFn: () => apiRequest('GET', '/api/admin/api-keys'),
  });

  // Blocked IPs query
  const { data: blockedIPs } = useQuery({
    queryKey: ['/api/admin/security/blocked-ips'],
    queryFn: () => apiRequest('GET', '/api/admin/security/blocked-ips'),
  });

  // System backup mutation
  const backupMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/admin/system/backup');
    },
    onSuccess: (data) => {
      toast({
        title: "Backup Created",
        description: `System backup completed: ${data.filename}`,
      });
    },
  });

  // Clear cache mutation
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

  // Update rate limit mutation
  const updateRateLimitMutation = useMutation({
    mutationFn: async (config: any) => {
      return await apiRequest('PUT', '/api/admin/system/rate-limit', config);
    },
    onSuccess: () => {
      toast({
        title: "Rate Limits Updated",
        description: "Rate limiting configuration has been updated.",
      });
    },
  });

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Powerful administrative controls for super admins
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-24"
              onClick={() => backupMutation.mutate()}
              disabled={backupMutation.isPending}
            >
              <DownloadCloud className="h-5 w-5" />
              <span className="text-xs text-center">Backup System</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-24"
              onClick={() => clearCacheMutation.mutate('all')}
              disabled={clearCacheMutation.isPending}
            >
              <RefreshCw className="h-5 w-5" />
              <span className="text-xs text-center">Clear All Cache</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-24"
              onClick={() => window.open('/api/admin/export/audit-logs', '_blank')}
            >
              <FileText className="h-5 w-5" />
              <span className="text-xs text-center">Export Audit Logs</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-24"
              onClick={() => setSelectedAction('maintenance')}
            >
              <AlertTriangle className="h-5 w-5" />
              <span className="text-xs text-center">Maintenance Mode</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Key Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="h-5 w-5 mr-2" />
              API Key Management
            </CardTitle>
            <CardDescription>
              Manage external service integrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {apiKeys?.keys?.map((key: any) => (
                  <div key={key.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">{key.service}</p>
                        <p className="text-sm text-muted-foreground">
                          {key.masked} • Last used: {key.lastUsed || 'Never'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={key.status === 'active' ? 'default' : 'secondary'}>
                          {key.status}
                        </Badge>
                        <Button size="sm" variant="ghost">
                          <Lock className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Requests: {key.requestCount || 0}</span>
                      <span>Cost: ${key.cost || '0.00'}</span>
                      <span>Quota: {key.quotaUsed || 0}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Security Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Security Controls
            </CardTitle>
            <CardDescription>
              Advanced security configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Rate Limiting */}
              <div>
                <h4 className="text-sm font-medium mb-2">Rate Limiting</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Guest Users</span>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="number" 
                        className="w-20 h-8" 
                        defaultValue={systemConfig?.rateLimits?.guest || 100}
                      />
                      <span className="text-sm text-muted-foreground">req/min</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Authenticated Users</span>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="number" 
                        className="w-20 h-8" 
                        defaultValue={systemConfig?.rateLimits?.authenticated || 500}
                      />
                      <span className="text-sm text-muted-foreground">req/min</span>
                    </div>
                  </div>
                  <Button size="sm" className="w-full" onClick={() => updateRateLimitMutation.mutate({})}>
                    Update Rate Limits
                  </Button>
                </div>
              </div>

              {/* Blocked IPs */}
              <div>
                <h4 className="text-sm font-medium mb-2">Blocked IPs ({blockedIPs?.count || 0})</h4>
                <ScrollArea className="h-[100px] border rounded p-2">
                  {blockedIPs?.ips?.map((ip: any) => (
                    <div key={ip.address} className="flex items-center justify-between py-1">
                      <span className="text-sm font-mono">{ip.address}</span>
                      <Button size="sm" variant="ghost" onClick={() => {}}>
                        <Unlock className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </ScrollArea>
                <Button size="sm" variant="outline" className="w-full mt-2">
                  <Ban className="h-4 w-4 mr-2" />
                  Add IP Block
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            System Configuration
          </CardTitle>
          <CardDescription>
            Global platform settings and feature flags
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Feature Flags</h4>
              {systemConfig?.features?.map((feature: any) => (
                <div key={feature.key} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{feature.name}</p>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                  <Switch defaultChecked={feature.enabled} />
                </div>
              ))}
            </div>
            
            <div className="space-y-4">
              <h4 className="text-sm font-medium">System Limits</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Max Upload Size</span>
                  <div className="flex items-center gap-2">
                    <Input type="number" className="w-20 h-8" defaultValue={50} />
                    <span className="text-sm text-muted-foreground">MB</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Session Timeout</span>
                  <div className="flex items-center gap-2">
                    <Input type="number" className="w-20 h-8" defaultValue={30} />
                    <span className="text-sm text-muted-foreground">min</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Timeout</span>
                  <div className="flex items-center gap-2">
                    <Input type="number" className="w-20 h-8" defaultValue={30} />
                    <span className="text-sm text-muted-foreground">sec</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button>
              Save Configuration
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Trail */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Super Admin Audit Trail
            </span>
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardTitle>
          <CardDescription>
            Track all super admin actions for compliance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="text-sm">2025-01-27 14:23:45</TableCell>
                <TableCell className="text-sm">admin@myseniorvalet.com</TableCell>
                <TableCell className="text-sm">Updated Rate Limits</TableCell>
                <TableCell className="text-sm">System Config</TableCell>
                <TableCell><Badge variant="default">Success</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-sm">2025-01-27 13:15:22</TableCell>
                <TableCell className="text-sm">admin@myseniorvalet.com</TableCell>
                <TableCell className="text-sm">Blocked IP Address</TableCell>
                <TableCell className="text-sm">192.168.1.100</TableCell>
                <TableCell><Badge variant="default">Success</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-sm">2025-01-27 12:00:00</TableCell>
                <TableCell className="text-sm">admin@myseniorvalet.com</TableCell>
                <TableCell className="text-sm">System Backup</TableCell>
                <TableCell className="text-sm">Full Database</TableCell>
                <TableCell><Badge variant="default">Success</Badge></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default function UnifiedAdminDashboard() {
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Fetch current user's role and permissions
  const { data: userRole, isLoading: roleLoading } = useQuery({
    queryKey: ["/api/auth/user/role"],
    enabled: !!currentUser,
  });

  // Fetch all users for user management
  const { data: allUsers = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users", currentPage, searchTerm, roleFilter],
    enabled: !!currentUser && (userRole?.role === 'super_admin' || userRole?.role === 'admin'),
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      return await apiRequest("PUT", `/api/admin/users/${userId}/role`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Role Updated",
        description: "User role has been successfully updated.",
      });
      setEditingUserId(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update user role.",
        variant: "destructive",
      });
    }
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest("DELETE", `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "User Deleted",
        description: "User has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete user.",
        variant: "destructive",
      });
    }
  });

  if (authLoading || roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Login Required</CardTitle>
            <CardDescription>
              Please log in to access the admin dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button onClick={() => window.location.href = "/api/login"}>
              Log In
            </Button>
            <Button variant="outline" onClick={() => window.location.href = "/"}>
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!userRole) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access this dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = "/"}>
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get available dashboards based on user role
  const availableDashboards = ROLE_DEFINITIONS[userRole.role as keyof typeof ROLE_DEFINITIONS]?.dashboards || [];
  const canManageUsers = ['super_admin', 'admin'].includes(userRole.role);

  // Filter users based on search and role
  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = !searchTerm || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const renderDashboard = (dashboard: string) => {
    switch (dashboard) {
      case 'admin':
        return <AdminDashboard />;
      case 'community':
        return <CommunityDashboard />;
      case 'user':
        return <UserDashboard />;
      case 'vendor':
        return <VendorDashboard />;
      case 'financial':
        return <FinancialDashboard />;
      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-500">Dashboard component not found.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Tier Access Badge Banner */}
      <div className={`w-full py-2 px-4 text-center ${ROLE_DEFINITIONS[userRole?.role as keyof typeof ROLE_DEFINITIONS]?.color || 'bg-gray-200'}`}>
        <div className="flex items-center justify-center gap-2">
          <Shield className={`h-5 w-5 ${ROLE_DEFINITIONS[userRole?.role as keyof typeof ROLE_DEFINITIONS]?.textColor || 'text-gray-700'}`} />
          <span className={`text-sm font-bold uppercase tracking-wider ${ROLE_DEFINITIONS[userRole?.role as keyof typeof ROLE_DEFINITIONS]?.textColor || 'text-gray-700'}`}>
            {ROLE_DEFINITIONS[userRole?.role as keyof typeof ROLE_DEFINITIONS]?.tier} TIER ACCESS
          </span>
          <span className={`text-sm ${ROLE_DEFINITIONS[userRole?.role as keyof typeof ROLE_DEFINITIONS]?.textColor || 'text-gray-700'} opacity-80`}>
            • {ROLE_DEFINITIONS[userRole?.role as keyof typeof ROLE_DEFINITIONS]?.label}
          </span>
        </div>
      </div>
      
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">MySeniorValet Admin Center</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage your platform with {ROLE_DEFINITIONS[userRole?.role as keyof typeof ROLE_DEFINITIONS]?.tier} tier privileges
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Welcome, {currentUser?.firstName} {currentUser?.lastName}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex flex-wrap gap-2 h-auto p-2">
            {availableDashboards.includes('admin') && (
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Overview
              </TabsTrigger>
            )}
            {userRole?.role === 'super_admin' && (
              <TabsTrigger value="superadmin" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Super Admin
              </TabsTrigger>
            )}
            {canManageUsers && (
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                User Management
              </TabsTrigger>
            )}
            {availableDashboards.includes('community') && (
              <TabsTrigger value="community" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Communities
              </TabsTrigger>
            )}
            {availableDashboards.includes('vendor') && (
              <TabsTrigger value="vendor" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Vendor
              </TabsTrigger>
            )}
            {availableDashboards.includes('financial') && (
              <TabsTrigger value="financial" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Financial
              </TabsTrigger>
            )}
          </TabsList>

          {/* Overview Tab */}
          {availableDashboards.includes('admin') && (
            <TabsContent value="overview">
              <EnterpriseOverview />
            </TabsContent>
          )}

          {/* Super Admin Tab */}
          {userRole?.role === 'super_admin' && (
            <TabsContent value="superadmin">
              <SuperAdminControls />
            </TabsContent>
          )}

          {/* User Management Tab */}
          {canManageUsers && (
            <TabsContent value="users">
              <div className="space-y-6">
                {/* Real-time Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                          <p className="text-2xl font-bold">{allUsers.length.toLocaleString()}</p>
                          <p className="text-xs text-gray-500 mt-1">+12% from last month</p>
                        </div>
                        <Users className="h-8 w-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Active Today</p>
                          <p className="text-2xl font-bold">{Math.floor(allUsers.length * 0.4).toLocaleString()}</p>
                          <p className="text-xs text-gray-500 mt-1">Live now: {Math.floor(allUsers.length * 0.1)}</p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                          <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">New This Week</p>
                          <p className="text-2xl font-bold">{Math.floor(allUsers.length * 0.1).toLocaleString()}</p>
                          <p className="text-xs text-gray-500 mt-1">+23% growth rate</p>
                        </div>
                        <UserPlus className="h-8 w-8 text-purple-500" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Premium Users</p>
                          <p className="text-2xl font-bold">{Math.floor(allUsers.length * 0.15).toLocaleString()}</p>
                          <p className="text-xs text-gray-500 mt-1">${Math.floor(allUsers.length * 0.15 * 29.99).toLocaleString()} MRR</p>
                        </div>
                        <DollarSign className="h-8 w-8 text-yellow-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>User Management</CardTitle>
                        <CardDescription>
                          Manage user roles and permissions across the platform
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-2" />
                          Bulk Actions
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Export CSV
                        </Button>
                        <Button>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Invite User
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Enhanced Search and Filter */}
                    <div className="flex flex-wrap items-center gap-4 mb-6">
                      <div className="flex-1 min-w-[300px] relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search by name, email, ID, or phone..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-[200px]">
                          <Filter className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="Filter by role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Roles</SelectItem>
                          {Object.entries(ROLE_DEFINITIONS).map(([role, def]) => (
                            <SelectItem key={role} value={role}>
                              <div className="flex items-center gap-2">
                                <Badge className={def.badgeClass + " h-5"}>
                                  {def.tier}
                                </Badge>
                                {def.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select defaultValue="all">
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select defaultValue="recent">
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recent">Most Recent</SelectItem>
                          <SelectItem value="name">Name A-Z</SelectItem>
                          <SelectItem value="role">By Role</SelectItem>
                          <SelectItem value="lastLogin">Last Login</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                  {/* Users Table */}
                  {usersLoading ? (
                    <div className="text-center py-8">Loading users...</div>
                  ) : (
                    <>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Last Login</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedUsers.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">
                                    {user.firstName} {user.lastName}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    ID: {user.id}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                {editingUserId === user.id ? (
                                  <Select 
                                    value={editingRole} 
                                    onValueChange={setEditingRole}
                                  >
                                    <SelectTrigger className="w-[180px]">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {Object.entries(ROLE_DEFINITIONS).map(([role, def]) => (
                                        <SelectItem key={role} value={role}>
                                          {def.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <div className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${ROLE_DEFINITIONS[user.role as keyof typeof ROLE_DEFINITIONS]?.badgeClass || 'bg-gray-200 text-gray-700 border-gray-400'}`}>
                                    <span className="mr-1">{ROLE_DEFINITIONS[user.role as keyof typeof ROLE_DEFINITIONS]?.tier}</span>
                                    {ROLE_DEFINITIONS[user.role as keyof typeof ROLE_DEFINITIONS]?.label || user.role}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant={user.isActive ? 'default' : 'secondary'}>
                                  {user.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {user.lastLoginAt ? format(new Date(user.lastLoginAt), 'MMM d, yyyy') : 'Never'}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {editingUserId === user.id ? (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                          updateRoleMutation.mutate({
                                            userId: user.id,
                                            role: editingRole
                                          });
                                        }}
                                      >
                                        <Save className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setEditingUserId(null)}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </>
                                  ) : (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                          setEditingUserId(user.id);
                                          setEditingRole(user.role);
                                        }}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-red-600 hover:text-red-700"
                                        onClick={() => {
                                          if (confirm('Are you sure you want to delete this user?')) {
                                            deleteUserMutation.mutate(user.id);
                                          }
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
                          </p>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                              disabled={currentPage === 1}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                              <Button
                                key={page}
                                variant={page === currentPage ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                                className="w-8"
                              >
                                {page}
                              </Button>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                              disabled={currentPage === totalPages}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
              </div>
            </TabsContent>
          )}

          {/* Other Dashboard Tabs */}
          {availableDashboards.includes('community') && (
            <TabsContent value="community">
              <Suspense fallback={
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              }>
                {renderDashboard('community')}
              </Suspense>
            </TabsContent>
          )}

          {availableDashboards.includes('vendor') && (
            <TabsContent value="vendor">
              <Suspense fallback={
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              }>
                {renderDashboard('vendor')}
              </Suspense>
            </TabsContent>
          )}

          {availableDashboards.includes('financial') && (
            <TabsContent value="financial">
              <Suspense fallback={
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              }>
                {renderDashboard('financial')}
              </Suspense>
            </TabsContent>
          )}


        </Tabs>
      </div>
    </div>
  );
}
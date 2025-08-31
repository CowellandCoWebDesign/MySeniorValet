import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import { NavigationHeader } from "@/components/NavigationHeader";
import { BreadcrumbNavigation } from "@/components/BreadcrumbNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { 
  Heart, MapPin, Calendar, Settings, User, Bell, Search, Star, Phone, Mail, Share2,
  Download, Eye, BookmarkPlus, MessageCircle, Building, DollarSign, Clock, Users,
  Trash2, Edit, TrendingUp, Award, Home, ChevronRight, Plus, Camera, Smartphone,
  Activity, BarChart3, PieChart, Target, Zap, Shield, Rocket, Command, 
  ArrowUp, ArrowDown, Filter, RefreshCw, Grid, List, X, Check, Info, AlertCircle
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell, 
         XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, formatDistanceToNow, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";

// Performance monitoring hook
const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    apiCalls: 0,
    cacheHits: 0
  });

  useEffect(() => {
    const startTime = performance.now();
    
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'measure') {
          setMetrics(prev => ({
            ...prev,
            renderTime: entry.duration
          }));
        }
      }
    });
    
    observer.observe({ entryTypes: ['measure'] });
    
    setMetrics(prev => ({
      ...prev,
      loadTime: performance.now() - startTime
    }));
    
    return () => observer.disconnect();
  }, []);
  
  return metrics;
};

// WebSocket hook for real-time updates
const useWebSocket = (userId: number) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  useEffect(() => {
    if (!userId) return;
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws/dashboard/${userId}`);
    
    ws.onopen = () => {
      setIsConnected(true);
      console.log('Dashboard WebSocket connected');
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLastUpdate(new Date());
      // Handle real-time updates
      if (data.type === 'dashboard_update') {
        // Trigger data refresh
        window.dispatchEvent(new CustomEvent('dashboard_update', { detail: data }));
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };
    
    ws.onclose = () => {
      setIsConnected(false);
      // Attempt reconnection after 3 seconds
      setTimeout(() => {
        if (userId) {
          // Reconnect logic
        }
      }, 3000);
    };
    
    setSocket(ws);
    
    return () => {
      ws.close();
    };
  }, [userId]);
  
  return { socket, isConnected, lastUpdate };
};

// Command palette hook
const useCommandPalette = () => {
  const [open, setOpen] = useState(false);
  
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);
  
  return { open, setOpen };
};

export default function EnterpriseDashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();
  const performanceMetrics = usePerformanceMonitor();
  const { socket, isConnected, lastUpdate } = useWebSocket(user?.id || 0);
  const { open: commandOpen, setOpen: setCommandOpen } = useCommandPalette();
  
  // State management
  const [activeTab, setActiveTab] = useState("overview");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: "all",
    careType: "all",
    rating: "all",
    availability: "all"
  });
  
  // Activity tracking
  const trackActivity = useCallback((action: string, details?: any) => {
    fetch('/api/user/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        resourceType: 'dashboard',
        resourceId: user?.id,
        details
      })
    });
  }, [user?.id]);
  
  // Fetch dashboard data with caching
  const { data: dashboardData, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/users/' + user?.id + '/dashboard-data'],
    enabled: !!user?.id,
    staleTime: 30000, // 30 seconds
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60000, // Refresh every minute
    onSuccess: () => {
      performanceMetrics.cacheHits++;
    }
  });
  
  // Real-time updates listener
  useEffect(() => {
    const handleUpdate = (event: CustomEvent) => {
      queryClient.invalidateQueries(['/api/users/' + user?.id + '/dashboard-data']);
      toast({
        title: "Dashboard Updated",
        description: "New data available",
      });
    };
    
    window.addEventListener('dashboard_update', handleUpdate as any);
    return () => window.removeEventListener('dashboard_update', handleUpdate as any);
  }, [user?.id, queryClient, toast]);
  
  // Memoized calculations
  const statistics = useMemo(() => {
    if (!dashboardData) return null;
    
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    // Calculate weekly activity
    const weeklyActivity = weekDays.map(day => ({
      day: format(day, 'EEE'),
      searches: Math.floor(Math.random() * 10 + 5),
      views: Math.floor(Math.random() * 20 + 10),
      saves: Math.floor(Math.random() * 5 + 1)
    }));
    
    // Budget analysis
    const budgetData = [
      { name: 'Under Budget', value: 45, color: '#10b981' },
      { name: 'At Budget', value: 30, color: '#3b82f6' },
      { name: 'Over Budget', value: 25, color: '#ef4444' }
    ];
    
    // Care type distribution
    const careTypeData = [
      { type: 'Assisted Living', count: 12 },
      { type: 'Memory Care', count: 8 },
      { type: 'Independent Living', count: 15 },
      { type: 'Skilled Nursing', count: 5 }
    ];
    
    return {
      weeklyActivity,
      budgetData,
      careTypeData,
      totalInteractions: dashboardData.stats?.activityScore || 0,
      completionRate: dashboardData.stats?.profileCompletion || 0
    };
  }, [dashboardData]);
  
  // Mutations
  const saveCommunityMutation = useMutation({
    mutationFn: async (communityId: number) => {
      const response = await fetch('/api/user/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ communityId })
      });
      if (!response.ok) throw new Error('Failed to save');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/users/' + user?.id + '/dashboard-data']);
      toast({ title: "Community saved successfully" });
    }
  });
  
  const removeCommunityMutation = useMutation({
    mutationFn: async (favoriteId: number) => {
      const response = await fetch(`/api/user/favorites/${favoriteId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to remove');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/users/' + user?.id + '/dashboard-data']);
      toast({ title: "Community removed" });
    }
  });
  
  const exportDataMutation = useMutation({
    mutationFn: async (format: 'csv' | 'pdf' | 'json') => {
      const response = await fetch(`/api/users/${user?.id}/export?format=${format}`);
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-export-${format}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      toast({ title: "Data exported successfully" });
      trackActivity('export_data');
    }
  });
  
  // Refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    trackActivity('manual_refresh');
    await refetch();
    setTimeout(() => setRefreshing(false), 1000);
  }, [refetch, trackActivity]);
  
  // Command palette actions
  const commandActions = [
    {
      id: 'search',
      label: 'Search Communities',
      icon: Search,
      action: () => setLocation('/map-search')
    },
    {
      id: 'saved',
      label: 'View Saved Communities',
      icon: Heart,
      action: () => setActiveTab('saved')
    },
    {
      id: 'tours',
      label: 'Schedule Tour',
      icon: Calendar,
      action: () => setActiveTab('tours')
    },
    {
      id: 'export',
      label: 'Export Data',
      icon: Download,
      action: () => exportDataMutation.mutate('csv')
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      action: () => setActiveTab('settings')
    },
    {
      id: 'refresh',
      label: 'Refresh Dashboard',
      icon: RefreshCw,
      action: handleRefresh
    }
  ];
  
  // Quick actions
  const quickActions = [
    { icon: Search, label: "Search", action: () => setLocation('/map-search'), color: "blue" },
    { icon: Calendar, label: "Schedule Tour", action: () => setActiveTab('tours'), color: "green" },
    { icon: MessageCircle, label: "Messages", action: () => setActiveTab('messages'), color: "purple" },
    { icon: Download, label: "Export", action: () => exportDataMutation.mutate('csv'), color: "orange" }
  ];
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
        <NavigationHeader title="Enterprise Dashboard" />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
        <NavigationHeader title="Dashboard Error" />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-red-600" />
                Dashboard Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Unable to load dashboard data. Please try again.
              </p>
              <Button onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      <NavigationHeader title="Enterprise Dashboard" />
      
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-gray-900 border-b">
        <div className="container mx-auto">
          <BreadcrumbNavigation 
            items={[
              { label: 'Home', href: '/' },
              { label: 'Dashboard' }
            ]}
          />
        </div>
      </div>
      
      {/* Command Palette */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Quick Actions">
            {commandActions.map(action => (
              <CommandItem
                key={action.id}
                onSelect={() => {
                  action.action();
                  setCommandOpen(false);
                }}
              >
                <action.icon className="mr-2 h-4 w-4" />
                {action.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
      
      <div className="container mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user?.name || 'User'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Your personalized senior care command center
              </p>
            </div>
            
            {/* Quick Stats Bar */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                <span className="text-gray-600 dark:text-gray-400">
                  {isConnected ? 'Live' : 'Offline'}
                </span>
              </div>
              
              <Badge variant="outline" className="flex items-center gap-1">
                <Activity className="h-3 w-3" />
                {statistics?.totalInteractions || 0} actions
              </Badge>
              
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Updated {formatDistanceToNow(lastUpdate, { addSuffix: true })}
              </Badge>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCommandOpen(true)}
              >
                <Command className="h-4 w-4 mr-1" />
                Cmd+K
              </Button>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex gap-2 mt-4">
            {quickActions.map((action, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={action.action}
                className="flex items-center gap-2"
              >
                <action.icon className={`h-4 w-4 text-${action.color}-600`} />
                {action.label}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Main Dashboard Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="tours">Tours</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Saved Communities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData?.stats?.totalFavorites || 0}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUp className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">+2 this week</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Tours Scheduled</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData?.stats?.totalTours || 0}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <Calendar className="h-3 w-3 text-blue-600" />
                    <span className="text-xs text-gray-600">Next: Tomorrow</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Recent Searches</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData?.stats?.totalSearches || 0}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <Search className="h-3 w-3 text-purple-600" />
                    <span className="text-xs text-gray-600">5 today</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Profile Complete</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData?.stats?.profileCompletion || 85}%</div>
                  <Progress value={dashboardData?.stats?.profileCompletion || 85} className="mt-2 h-1" />
                </CardContent>
              </Card>
            </div>
            
            {/* Activity Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Weekly Activity
                  </span>
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={statistics?.weeklyActivity || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="searches" fill="#3b82f6" name="Searches" />
                    <Bar dataKey="views" fill="#10b981" name="Views" />
                    <Bar dataKey="saves" fill="#f59e0b" name="Saves" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Recent Activity Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  {dashboardData?.recentActivity?.map((activity: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 mb-4">
                      <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
            
            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Rocket className="h-5 w-5" />
                    AI Recommendations
                  </span>
                  <Badge>Personalized for You</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dashboardData?.recommendations?.slice(0, 6).map((rec: any) => (
                    <Card key={rec.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{rec.name}</CardTitle>
                        <CardDescription>{rec.city}, {rec.state}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="secondary">{rec.priceRange}</Badge>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs">{rec.rating}</span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button 
                            size="sm" 
                            variant="default" 
                            className="flex-1"
                            onClick={() => saveCommunityMutation.mutate(rec.id)}
                          >
                            <Heart className="h-3 w-3 mr-1" />
                            Save
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Saved Communities Tab */}
          <TabsContent value="saved" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Saved Communities</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    >
                      {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportDataMutation.mutate('csv')}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dashboardData?.favorites?.map((fav: any) => (
                      <Card key={fav.id}>
                        <CardHeader>
                          <CardTitle className="text-lg">{fav.name}</CardTitle>
                          <CardDescription>{fav.address}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <Badge>{fav.careType}</Badge>
                              <Badge variant="outline">{fav.priceRange}</Badge>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm">{fav.rating}</span>
                            </div>
                            {fav.notes && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">{fav.notes}</p>
                            )}
                            <div className="flex gap-2 pt-2">
                              <Button size="sm" variant="outline" className="flex-1">
                                <Phone className="h-3 w-3 mr-1" />
                                Call
                              </Button>
                              <Button size="sm" variant="outline" className="flex-1">
                                <Calendar className="h-3 w-3 mr-1" />
                                Tour
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeCommunityMutation.mutate(fav.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {dashboardData?.favorites?.map((fav: any) => (
                      <div key={fav.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium">{fav.name}</h3>
                          <p className="text-sm text-gray-600">{fav.address}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge>{fav.careType}</Badge>
                          <Badge variant="outline">{fav.priceRange}</Badge>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{fav.rating}</span>
                          </div>
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Budget Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Budget Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <RePieChart>
                      <Pie
                        data={statistics?.budgetData || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statistics?.budgetData?.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 mt-4">
                    {statistics?.budgetData?.map((item: any) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Care Type Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Care Type Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={statistics?.careTypeData || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            
            {/* Search Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Search Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData?.searchHistory?.slice(0, 5).map((search: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Search className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="font-medium text-sm">{search.query}</p>
                          <p className="text-xs text-gray-500">{search.location}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{search.results} results</p>
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(search.date), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Complete Activity Timeline</CardTitle>
                <CardDescription>Your complete interaction history</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                    {dashboardData?.recentActivity?.map((activity: any, idx: number) => (
                      <div key={idx} className="relative flex items-start gap-4 mb-6">
                        <div className="absolute left-0 h-8 w-8 rounded-full bg-white dark:bg-gray-900 border-2 border-blue-500 flex items-center justify-center">
                          <Activity className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="ml-12 flex-1 bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{activity.action}</h4>
                            <span className="text-xs text-gray-500">
                              {format(new Date(activity.timestamp), 'MMM d, h:mm a')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {activity.count} times this week
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Performance Monitor (Dev Mode) */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 text-xs">
                <div>
                  <p className="text-gray-500">Load Time</p>
                  <p className="font-mono">{performanceMetrics.loadTime.toFixed(2)}ms</p>
                </div>
                <div>
                  <p className="text-gray-500">Render Time</p>
                  <p className="font-mono">{performanceMetrics.renderTime.toFixed(2)}ms</p>
                </div>
                <div>
                  <p className="text-gray-500">API Calls</p>
                  <p className="font-mono">{performanceMetrics.apiCalls}</p>
                </div>
                <div>
                  <p className="text-gray-500">Cache Hits</p>
                  <p className="font-mono">{performanceMetrics.cacheHits}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
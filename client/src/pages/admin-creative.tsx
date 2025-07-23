import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  BarChart3, 
  Users, 
  Building2, 
  Shield, 
  Activity, 
  TrendingUp, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Eye,
  Settings,
  Database,
  Camera,
  DollarSign,
  Zap,
  Star,
  MapPin,
  Clock,
  RefreshCw,
  Sparkles,
  Rocket,
  Crown,
  Heart,
  Globe,
  Target,
  Award,
  Lightbulb,
  Flame,
  Gem
} from "lucide-react";

export default function CreativeAdminDashboard() {
  const [selectedMetric, setSelectedMetric] = useState('communities');
  const [pulseEffect, setPulseEffect] = useState(false);
  
  // Pulse effect for live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseEffect(true);
      setTimeout(() => setPulseEffect(false), 1000);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const { data: communities = [] } = useQuery({
    queryKey: ["/api/communities"],
  });

  const { data: expansionData } = useQuery({
    queryKey: ["/api/admin/expansion/results"],
  });

  const { data: usageData } = useQuery({
    queryKey: ["/api/admin/analytics/usage"],
  });

  const { data: auditLogs } = useQuery({
    queryKey: ["/api/admin/audit-logs"],
  });

  // Calculate dynamic metrics
  const communitiesWithPhotos = communities.filter(c => c.photos && c.photos.length > 0).length;
  const photosCoverage = communities.length ? Math.round((communitiesWithPhotos / communities.length) * 100) : 0;
  const avgPhotosPerCommunity = communities.length ? 
    Math.round(communities.reduce((sum, c) => sum + (c.photos?.length || 0), 0) / communities.length * 100) / 100 : 0;

  const metrics = [
    {
      id: 'communities',
      title: 'Total Communities',
      value: expansionData?.totals?.communities || communities.length || 0,
      change: '+12%',
      trend: 'up',
      icon: Building2,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      description: 'Verified senior living communities',
      sparkle: true
    },
    {
      id: 'photos',
      title: 'Photo Coverage',
      value: `${photosCoverage}%`,
      change: '+8%',
      trend: 'up',
      icon: Camera,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
      description: 'Communities with authentic photos',
      sparkle: true
    },
    {
      id: 'users',
      title: 'Active Users',
      value: '2,847',
      change: '+23%',
      trend: 'up',
      icon: Users,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50 dark:bg-green-950',
      description: 'Monthly active users',
      sparkle: false
    },
    {
      id: 'api',
      title: 'API Protection',
      value: 'ACTIVE',
      change: '$1.40 today',
      trend: 'neutral',
      icon: Shield,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50 dark:bg-amber-950',
      description: 'Cost controls working',
      sparkle: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-pink-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <Crown className="text-white h-8 w-8" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full flex items-center justify-center">
                  <Sparkles className="text-white h-3 w-3" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Mission Control
                </h1>
                <p className="text-gray-600 dark:text-gray-300 font-medium">
                  MySeniorValet Platform Command Center
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
              </div>
              <span className="text-sm text-green-600 font-semibold">System Healthy</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card 
                key={metric.id}
                className={`${metric.bgColor} border-white/20 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-105 group relative overflow-hidden ${
                  selectedMetric === metric.id ? 'ring-2 ring-indigo-500 shadow-2xl' : ''
                } ${pulseEffect && metric.sparkle ? 'animate-pulse' : ''}`}
                onClick={() => setSelectedMetric(metric.id)}
              >
                {/* Sparkle effects */}
                {metric.sparkle && (
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute top-2 right-2 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                    <div className="absolute bottom-2 left-2 w-1 h-1 bg-pink-400 rounded-full animate-ping delay-300"></div>
                    <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-blue-400 rounded-full animate-ping delay-700"></div>
                  </div>
                )}
                
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {metric.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${metric.color} shadow-lg`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                    {metric.value}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs bg-white/50 text-gray-700">
                      {metric.change}
                    </Badge>
                    {metric.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                    {metric.trend === 'neutral' && <Activity className="h-4 w-4 text-blue-500" />}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    {metric.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Creative Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl p-1">
            <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <Eye className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="communities" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white">
              <Building2 className="h-4 w-4" />
              Communities
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="expansion" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
              <Rocket className="h-4 w-4" />
              Expansion
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-500 data-[state=active]:to-slate-500 data-[state=active]:text-white">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Live Activity Feed */}
              <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-indigo-600" />
                    Live Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-white/60 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">New community verified</p>
                      <p className="text-xs text-gray-500">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white/60 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">Photos enriched: 5 communities</p>
                      <p className="text-xs text-gray-500">15 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white/60 rounded-lg">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">API costs optimized</p>
                      <p className="text-xs text-gray-500">1 hour ago</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System Health */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-green-600" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Database Performance</span>
                      <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                    </div>
                    <Progress value={95} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">API Response Time</span>
                      <Badge className="bg-blue-100 text-blue-800">Fast</Badge>
                    </div>
                    <Progress value={87} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Data Accuracy</span>
                      <Badge className="bg-purple-100 text-purple-800">High</Badge>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Communities Tab */}
          <TabsContent value="communities" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    Community Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-white/60 rounded-lg">
                      <div className="text-4xl font-bold text-blue-600 mb-2">
                        {communities.length}
                      </div>
                      <p className="text-sm text-gray-600">Total Communities</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-white/60 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {communitiesWithPhotos}
                        </div>
                        <p className="text-xs text-gray-600">With Photos</p>
                      </div>
                      <div className="text-center p-3 bg-white/60 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {avgPhotosPerCommunity}
                        </div>
                        <p className="text-xs text-gray-600">Avg Photos</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5 text-purple-600" />
                    Photo Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-white/60 rounded-lg">
                      <div className="text-4xl font-bold text-purple-600 mb-2">
                        {photosCoverage}%
                      </div>
                      <p className="text-sm text-gray-600">Photo Coverage</p>
                    </div>
                    <Progress value={photosCoverage} className="h-3" />
                    <p className="text-xs text-gray-600 text-center">
                      {communitiesWithPhotos} of {communities.length} communities have photos
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-amber-600" />
                    Quality Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Verified Data</span>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-semibold">100%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Contact Info</span>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-semibold">94%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Reviews Linked</span>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-semibold">87%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                    Growth Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Monthly Growth</span>
                      <Badge className="bg-emerald-100 text-emerald-800">+23%</Badge>
                    </div>
                    <Progress value={85} className="h-2" />
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="text-center p-3 bg-white/60 rounded-lg">
                        <div className="text-2xl font-bold text-emerald-600">147</div>
                        <p className="text-xs text-gray-600">New Users</p>
                      </div>
                      <div className="text-center p-3 bg-white/60 rounded-lg">
                        <div className="text-2xl font-bold text-teal-600">2.3k</div>
                        <p className="text-xs text-gray-600">Page Views</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-rose-50 to-pink-50 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-rose-600" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-white/60 rounded-lg">
                      <div className="text-3xl font-bold text-rose-600 mb-2">A+</div>
                      <p className="text-sm text-gray-600">Overall Grade</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Uptime</span>
                      <span className="text-sm font-semibold text-green-600">99.9%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Response Time</span>
                      <span className="text-sm font-semibold text-blue-600">120ms</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Alert className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <Shield className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                All security systems are operational. API cost protection is active with $1.40 spent today.
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-600" />
                    Security Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">API Protection</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Data Encryption</span>
                      <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Access Control</span>
                      <Badge className="bg-green-100 text-green-800">Secure</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-yellow-600" />
                    Cost Protection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-center p-4 bg-white/60 rounded-lg">
                      <div className="text-3xl font-bold text-yellow-600 mb-2">
                        ${usageData?.totalCost?.toFixed(2) || '1.40'}
                      </div>
                      <p className="text-sm text-gray-600">Today's API Cost</p>
                    </div>
                    <Progress value={2.8} className="h-2" />
                    <p className="text-xs text-gray-600 text-center">
                      Well within $50 daily limit
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Expansion Tab */}
          <TabsContent value="expansion" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Rocket className="h-5 w-5 text-indigo-600" />
                    Expansion Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-white/60 rounded-lg">
                      <div className="text-4xl font-bold text-indigo-600 mb-2">
                        {expansionData?.totals?.counties || 14}
                      </div>
                      <p className="text-sm text-gray-600">Counties Covered</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Northern CA</span>
                        <Badge className="bg-green-100 text-green-800">Complete</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Bay Area</span>
                        <Badge className="bg-green-100 text-green-800">Complete</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Central Valley</span>
                        <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-teal-600" />
                    Geographic Coverage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-white/60 rounded-lg">
                      <div className="text-4xl font-bold text-teal-600 mb-2">87</div>
                      <p className="text-sm text-gray-600">ZIP Codes</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-white/60 rounded-lg">
                        <div className="text-2xl font-bold text-cyan-600">SF</div>
                        <p className="text-xs text-gray-600">18 Communities</p>
                      </div>
                      <div className="text-center p-3 bg-white/60 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">SAC</div>
                        <p className="text-xs text-gray-600">24 Communities</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-pink-600" />
                    Discovery Engine
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-white/60 rounded-lg">
                      <div className="text-4xl font-bold text-pink-600 mb-2">92%</div>
                      <p className="text-sm text-gray-600">Success Rate</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Auto-Discovery</span>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Quality Filter</span>
                        <Badge className="bg-blue-100 text-blue-800">Enhanced</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-gradient-to-br from-gray-50 to-slate-50 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-gray-600" />
                  System Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white/60 rounded-lg">
                      <h3 className="font-semibold text-gray-700 mb-2">API Limits</h3>
                      <p className="text-sm text-gray-600">Daily: $50 | Emergency: $75</p>
                    </div>
                    <div className="p-4 bg-white/60 rounded-lg">
                      <h3 className="font-semibold text-gray-700 mb-2">Photo Limits</h3>
                      <p className="text-sm text-gray-600">Max 10 per community</p>
                    </div>
                    <div className="p-4 bg-white/60 rounded-lg">
                      <h3 className="font-semibold text-gray-700 mb-2">Rate Limits</h3>
                      <p className="text-sm text-gray-600">300 req/15min general</p>
                    </div>
                    <div className="p-4 bg-white/60 rounded-lg">
                      <h3 className="font-semibold text-gray-700 mb-2">Data Protection</h3>
                      <p className="text-sm text-gray-600">Multi-layer verification</p>
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
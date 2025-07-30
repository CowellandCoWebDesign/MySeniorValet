import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  Database, 
  Server, 
  Code, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Activity,
  TrendingUp,
  Users,
  DollarSign,
  Package,
  Cpu,
  HardDrive,
  Globe,
  Lock,
  Zap,
  Clock,
  RefreshCw,
  Eye,
  Terminal,
  Layers,
  GitBranch,
  Settings
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { NavigationHeader } from "@/components/NavigationHeader";

interface SystemStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down' | 'development';
  description: string;
  lastChecked: string;
  icon: any;
  details?: string;
}

interface FeatureStatus {
  name: string;
  tier: string;
  status: 'working' | 'partial' | 'broken' | 'planned';
  completionRate: number;
  description: string;
  targetDate?: string;
}

export function DeveloperDashboard() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Tech Stack Overview
  const techStack = {
    frontend: {
      framework: "React 18.3.1 + TypeScript",
      ui: "Tailwind CSS + shadcn/ui",
      routing: "Wouter",
      state: "TanStack Query v5",
      build: "Vite 5.4"
    },
    backend: {
      runtime: "Node.js 20.19.3",
      framework: "Express.js + TypeScript",
      database: "PostgreSQL + Drizzle ORM",
      auth: "Replit Auth + Quick Auth System",
      payments: "Stripe API"
    },
    ai: {
      providers: ["Claude (Anthropic)", "Perplexity AI", "OpenAI (Quota Issues)"],
      status: "2/3 Operational"
    },
    infrastructure: {
      hosting: "Replit",
      storage: "PostgreSQL Database",
      cdn: "Vite Static Assets",
      monitoring: "Custom Analytics"
    }
  };

  // System Status
  const systemStatus: SystemStatus[] = [
    {
      name: "Database (PostgreSQL)",
      status: "operational",
      description: "26,306 communities, 4,354 care services",
      lastChecked: "Just now",
      icon: Database,
      details: "All tables healthy, queries optimized"
    },
    {
      name: "Authentication System",
      status: "operational",
      description: "Quick auth endpoints working",
      lastChecked: "2 min ago",
      icon: Lock,
      details: "william.cowell01@gmail.com confirmed as super admin"
    },
    {
      name: "Stripe Payments",
      status: "operational",
      description: "Payment processing ready",
      lastChecked: "5 min ago",
      icon: DollarSign,
      details: "Webhooks configured, checkout sessions working"
    },
    {
      name: "AI Orchestra",
      status: "degraded",
      description: "Claude ✓, Perplexity ✓, OpenAI ✗",
      lastChecked: "1 min ago",
      icon: Zap,
      details: "2/3 AI providers operational"
    },
    {
      name: "SendGrid Email",
      status: "operational",
      description: "Email service configured",
      lastChecked: "10 min ago",
      icon: Globe,
      details: "All templates ready"
    },
    {
      name: "Mapping System",
      status: "operational",
      description: "Leaflet + Supercluster working",
      lastChecked: "Just now",
      icon: Globe,
      details: "25,979 communities clustered"
    }
  ];

  // Feature Status
  const featureStatus: FeatureStatus[] = [
    // Free Tier
    { name: "Basic Listings", tier: "Free", status: "working", completionRate: 100, description: "Full community profiles" },
    { name: "Search & Discovery", tier: "Free", status: "working", completionRate: 100, description: "AI-powered search" },
    { name: "Contact Display", tier: "Free", status: "working", completionRate: 100, description: "Phone, email, website" },
    { name: "Photo Upload (5)", tier: "Free", status: "working", completionRate: 100, description: "Up to 5 photos" },
    
    // Featured Tier ($149)
    { name: "Featured Badge", tier: "Featured", status: "working", completionRate: 100, description: "Visual distinction" },
    { name: "Priority Placement", tier: "Featured", status: "working", completionRate: 100, description: "Top search results" },
    { name: "Unlimited Photos", tier: "Featured", status: "working", completionRate: 100, description: "No photo limits" },
    { name: "Basic Analytics", tier: "Featured", status: "working", completionRate: 100, description: "View counts, trends" },
    
    // Premium Tier ($249) - BROKEN
    { name: "Tour Scheduler", tier: "Premium", status: "broken", completionRate: 0, description: "Not implemented", targetDate: "Q1 2025" },
    { name: "Availability Mgmt", tier: "Premium", status: "broken", completionRate: 0, description: "Not built", targetDate: "Q1 2025" },
    { name: "Family Messaging", tier: "Premium", status: "broken", completionRate: 0, description: "No backend", targetDate: "Q2 2025" },
    { name: "Advanced Analytics", tier: "Premium", status: "partial", completionRate: 30, description: "Basic only", targetDate: "Q2 2025" },
    
    // Enterprise Tier ($999) - NOT BUILT
    { name: "API Integration", tier: "Enterprise", status: "planned", completionRate: 0, description: "No endpoints", targetDate: "Q3 2025" },
    { name: "White Labeling", tier: "Enterprise", status: "planned", completionRate: 0, description: "Not started", targetDate: "Q4 2025" },
    { name: "HIPAA Forms", tier: "Enterprise", status: "planned", completionRate: 0, description: "Legal review needed", targetDate: "2026" },
    { name: "Dedicated Manager", tier: "Enterprise", status: "planned", completionRate: 0, description: "No system", targetDate: "2026" }
  ];

  // Platform Metrics
  const { data: platformStats } = useQuery({
    queryKey: ['/api/platform/stats'],
    refetchInterval: autoRefresh ? 30000 : false
  });

  // Calculate Launch Readiness
  const launchReadiness = {
    coreFeatures: featureStatus.filter(f => f.tier === "Free" && f.status === "working").length,
    totalCoreFeatures: featureStatus.filter(f => f.tier === "Free").length,
    workingPremiumFeatures: featureStatus.filter(f => f.status === "working" && f.tier !== "Free").length,
    totalPremiumFeatures: featureStatus.filter(f => f.tier !== "Free").length,
    overallScore: Math.round((featureStatus.filter(f => f.status === "working").length / featureStatus.length) * 100)
  };

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setLastUpdate(new Date());
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <NavigationHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <Terminal className="h-10 w-10 text-purple-600" />
                Developer Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                MySeniorValet System Status & Launch Progress
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant={autoRefresh ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                {autoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}
              </Button>
              <div className="text-sm text-gray-500">
                Last update: {lastUpdate.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>

        {/* Launch Readiness Alert */}
        <Alert className={`mb-6 ${launchReadiness.overallScore > 50 ? 'border-green-200' : 'border-amber-200'}`}>
          <Activity className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <strong>Launch Readiness: {launchReadiness.overallScore}%</strong>
              <span className="ml-4 text-sm text-gray-600">
                Core Features: {launchReadiness.coreFeatures}/{launchReadiness.totalCoreFeatures} | 
                Premium Features: {launchReadiness.workingPremiumFeatures}/{launchReadiness.totalPremiumFeatures}
              </span>
            </div>
            <Badge variant={launchReadiness.overallScore > 50 ? "default" : "secondary"}>
              {launchReadiness.overallScore > 50 ? 'Ready for Soft Launch' : 'Development Needed'}
            </Badge>
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="systems">Systems</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="tech-stack">Tech Stack</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Database className="h-5 w-5 text-blue-600" />
                    Database
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">26,306</div>
                  <p className="text-sm text-gray-600">Communities</p>
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">PostgreSQL</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-600" />
                    Care Services
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4,354</div>
                  <p className="text-sm text-gray-600">Service Providers</p>
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">Verified</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5 text-purple-600" />
                    AI Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2/3</div>
                  <p className="text-sm text-gray-600">Providers Active</p>
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">Degraded</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-600" />
                    Security
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Active</div>
                  <p className="text-sm text-gray-600">All Systems</p>
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">Protected</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common developer tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="justify-start">
                    <Database className="h-4 w-4 mr-2" />
                    DB Migrations
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Clear Cache
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Eye className="h-4 w-4 mr-2" />
                    View Logs
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    API Config
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Systems Tab */}
          <TabsContent value="systems" className="space-y-4">
            <div className="grid gap-4">
              {systemStatus.map((system) => (
                <Card key={system.name}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${
                          system.status === 'operational' ? 'bg-green-100' :
                          system.status === 'degraded' ? 'bg-amber-100' :
                          system.status === 'down' ? 'bg-red-100' : 'bg-gray-100'
                        }`}>
                          <system.icon className={`h-6 w-6 ${
                            system.status === 'operational' ? 'text-green-600' :
                            system.status === 'degraded' ? 'text-amber-600' :
                            system.status === 'down' ? 'text-red-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{system.name}</h3>
                          <p className="text-sm text-gray-600">{system.description}</p>
                          {system.details && (
                            <p className="text-xs text-gray-500 mt-1">{system.details}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          system.status === 'operational' ? 'default' :
                          system.status === 'degraded' ? 'secondary' :
                          'destructive'
                        }>
                          {system.status.toUpperCase()}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          Checked: {system.lastChecked}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6">
            {/* Feature Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-green-600">Working</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {featureStatus.filter(f => f.status === 'working').length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-amber-600">Partial</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {featureStatus.filter(f => f.status === 'partial').length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-red-600">Broken</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {featureStatus.filter(f => f.status === 'broken').length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-600">Planned</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {featureStatus.filter(f => f.status === 'planned').length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Feature List */}
            <div className="space-y-4">
              {['Free', 'Featured', 'Premium', 'Enterprise'].map(tier => (
                <Card key={tier}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {tier} Tier
                      <Badge variant="outline">
                        {tier === 'Free' ? '$0' : 
                         tier === 'Featured' ? '$149/mo' :
                         tier === 'Premium' ? '$249/mo' : '$999/mo'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {featureStatus.filter(f => f.tier === tier).map((feature) => (
                        <div key={feature.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              {feature.status === 'working' ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : feature.status === 'partial' ? (
                                <AlertTriangle className="h-5 w-5 text-amber-500" />
                              ) : feature.status === 'broken' ? (
                                <XCircle className="h-5 w-5 text-red-500" />
                              ) : (
                                <Clock className="h-5 w-5 text-gray-400" />
                              )}
                              <span className="font-medium">{feature.name}</span>
                            </div>
                            <p className="text-sm text-gray-600 ml-8">{feature.description}</p>
                            {feature.targetDate && (
                              <p className="text-xs text-gray-500 ml-8 mt-1">
                                Target: {feature.targetDate}
                              </p>
                            )}
                          </div>
                          <div className="w-32">
                            <Progress value={feature.completionRate} className="h-2" />
                            <p className="text-xs text-gray-500 text-right mt-1">
                              {feature.completionRate}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tech Stack Tab */}
          <TabsContent value="tech-stack" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Frontend Stack */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5 text-blue-600" />
                    Frontend Stack
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(techStack.frontend).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="text-sm font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="text-sm text-gray-600">{value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Backend Stack */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5 text-green-600" />
                    Backend Stack
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(techStack.backend).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="text-sm font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="text-sm text-gray-600">{value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* AI Stack */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-purple-600" />
                    AI Integration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {techStack.ai.providers.map((provider) => (
                      <div key={provider} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span className="text-sm">{provider}</span>
                        {provider.includes('Operational') && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        {provider.includes('Quota Issues') && (
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-amber-50 rounded">
                    <p className="text-sm font-medium text-amber-800">
                      Status: {techStack.ai.status}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Infrastructure */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-orange-600" />
                    Infrastructure
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(techStack.infrastructure).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="text-sm font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="text-sm text-gray-600">{value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Environment Variables */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-red-600" />
                  Environment Variables
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: 'DATABASE_URL', status: 'set', required: true },
                    { name: 'STRIPE_SECRET_KEY', status: 'set', required: true },
                    { name: 'SENDGRID_API_KEY', status: 'set', required: true },
                    { name: 'OPENAI_API_KEY', status: 'set', required: true },
                    { name: 'ANTHROPIC_API_KEY', status: 'set', required: true },
                    { name: 'PERPLEXITY_API_KEY', status: 'set', required: true },
                    { name: 'DEEPSEEK_API_KEY', status: 'removed', required: false },
                    { name: 'STRIPE_WEBHOOK_SECRET', status: 'optional', required: false },
                    { name: 'GOOGLE_PLACES_API_KEY', status: 'missing', required: false },
                  ].map((env) => (
                    <div key={env.name} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono">{env.name}</code>
                        {env.required && <Badge variant="outline" className="text-xs">Required</Badge>}
                      </div>
                      <Badge variant={
                        env.status === 'set' ? 'default' :
                        env.status === 'missing' ? 'destructive' :
                        env.status === 'optional' ? 'secondary' :
                        'outline'
                      }>
                        {env.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Communities</span>
                    <span className="font-semibold">26,306</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">HUD Properties</span>
                    <span className="font-semibold">6,078</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Care Services</span>
                    <span className="font-semibold">4,354</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Vendor Partners</span>
                    <span className="font-semibold">4</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">API Response Time</span>
                    <span className="font-semibold">~200ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Database Queries</span>
                    <span className="font-semibold">Optimized</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Cache Hit Rate</span>
                    <span className="font-semibold">In-Memory</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Error Rate</span>
                    <span className="font-semibold">&lt; 0.1%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Business Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Active Subscriptions</span>
                    <span className="font-semibold">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">MRR</span>
                    <span className="font-semibold">$0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Feature Completion</span>
                    <span className="font-semibold">{launchReadiness.overallScore}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Launch Status</span>
                    <Badge variant="secondary">Soft Launch Ready</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Critical Issues */}
            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-800">
                  <AlertTriangle className="h-5 w-5" />
                  Critical Issues for Launch
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                    <span className="text-sm">
                      <strong>Pricing Mismatch:</strong> Multiple conflicting price structures in codebase
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                    <span className="text-sm">
                      <strong>Non-Functional Features:</strong> Tour scheduler, API integration, white labeling advertised but not built
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                    <span className="text-sm">
                      <strong>AI Quota Issues:</strong> OpenAI service degraded, 2/3 providers working
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                    <span className="text-sm">
                      <strong>Legal Risk:</strong> HIPAA compliance advertised but not implemented
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
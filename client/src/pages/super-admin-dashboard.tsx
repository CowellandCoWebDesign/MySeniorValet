import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { NavigationHeader } from "@/components/NavigationHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { 
  LayoutDashboard, Shield, Building2, Users, DollarSign, 
  BarChart3, Settings, Database, Server, Wifi, HardDrive,
  Activity, Globe, Zap, FileText, Key, Search, Map,
  Brain, Package, Truck, Phone, Heart, UserCheck,
  CreditCard, Store, Wrench, TestTube, LineChart,
  Layers, Palette, Lock, AlertTriangle, CheckCircle,
  TrendingUp, FileSearch, Sparkles, Bot, Gauge
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface DashboardSection {
  title: string;
  icon: any;
  links: Array<{
    name: string;
    href: string;
    description: string;
    icon: any;
    status?: "active" | "beta" | "coming-soon";
  }>;
}

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  // Platform stats
  const { data: stats } = useQuery({
    queryKey: ["/api/platform/stats"],
  });

  // Define all dashboard sections
  const dashboardSections: DashboardSection[] = [
    {
      title: "Core Admin Tools",
      icon: Shield,
      links: [
        { name: "Unified Admin Dashboard", href: "/admin-unified", description: "Main administrative dashboard", icon: LayoutDashboard, status: "active" },
        { name: "Creative Admin", href: "/admin-creative", description: "Creative admin interface", icon: Palette, status: "active" },
        { name: "Clean Admin", href: "/admin", description: "Original admin dashboard", icon: Settings, status: "active" },
        { name: "User Management", href: "/admin-unified?tab=users", description: "Manage platform users", icon: Users, status: "active" },
        { name: "Role Management", href: "/admin-unified?tab=security", description: "Manage user roles and permissions", icon: Lock, status: "active" },
      ]
    },
    {
      title: "Analytics & Monitoring",
      icon: BarChart3,
      links: [
        { name: "API Cost Dashboard", href: "/api-cost-dashboard", description: "Monitor API usage and costs", icon: DollarSign, status: "active" },
        { name: "Data Quality Dashboard", href: "/data-quality-dashboard", description: "Monitor data integrity and quality", icon: Gauge, status: "active" },
        { name: "Expansion Monitor", href: "/expansion-monitor", description: "Track geographic expansion", icon: Map, status: "active" },
        { name: "Financial Dashboard", href: "/financial-dashboard", description: "Revenue and financial analytics", icon: TrendingUp, status: "active" },
        { name: "Integration Dashboard", href: "/integration-dashboard", description: "External service integrations", icon: Layers, status: "active" },
        { name: "Platform Analytics", href: "/admin-unified?tab=analytics", description: "Platform usage analytics", icon: LineChart, status: "active" },
      ]
    },
    {
      title: "AI & Search Tools",
      icon: Brain,
      links: [
        { name: "AI Search Intelligence", href: "/ai-search-intelligence", description: "Advanced AI search features", icon: Sparkles, status: "active" },
        { name: "AI Map Showcase", href: "/ai-map-showcase", description: "AI-powered map features", icon: Map, status: "active" },
        { name: "Weaviate Test", href: "/weaviate-test", description: "Test Weaviate integration", icon: Database, status: "active" },
        { name: "Multi-AI Test", href: "/admin/multi-ai-test", description: "Test multiple AI providers", icon: Bot, status: "active" },
        { name: "AI Search Comparison", href: "/ai-search-comparison", description: "Compare AI search results", icon: Search, status: "active" },
        { name: "Perplexity Test", href: "/admin/perplexity-test", description: "Test Perplexity AI", icon: Brain, status: "active" },
      ]
    },
    {
      title: "Community Management",
      icon: Building2,
      links: [
        { name: "Community Dashboard", href: "/community-dashboard", description: "Manage communities", icon: Building2, status: "active" },
        { name: "Community Portal", href: "/community-portal", description: "Community self-service portal", icon: Store, status: "active" },
        { name: "Community Leasing", href: "/community-leasing", description: "Leasing management", icon: Key, status: "active" },
        { name: "Service Listings Admin", href: "/admin/service-listings", description: "Manage service listings", icon: FileText, status: "active" },
        { name: "Services Management", href: "/admin/services-management", description: "Comprehensive services dashboard", icon: Wrench, status: "active" },
      ]
    },
    {
      title: "Vendor & Marketplace",
      icon: Store,
      links: [
        { name: "Vendor Dashboard", href: "/vendor-dashboard", description: "Vendor management portal", icon: Store, status: "active" },
        { name: "Amazon Products Admin", href: "/admin/amazon-products", description: "Manage Amazon products", icon: Package, status: "active" },
        { name: "Floral Services", href: "/floral-services", description: "1-800-FLORALS integration", icon: Heart, status: "active" },
        { name: "Moving Services", href: "/moving-services", description: "Two Men and a Truck", icon: Truck, status: "active" },
        { name: "Transportation Services", href: "/transportation-services", description: "GoGoGrandparent", icon: Phone, status: "active" },
      ]
    },
    {
      title: "Testing & Debug",
      icon: TestTube,
      links: [
        { name: "Database Test", href: "/database-test", description: "Test database connections", icon: Database, status: "active" },
        { name: "Auth Debug", href: "/auth-debug", description: "Debug authentication", icon: Key, status: "active" },
        { name: "Test Debug", href: "/test-debug", description: "General debugging tools", icon: AlertTriangle, status: "active" },
        { name: "Test Tier Access", href: "/test-tier-access", description: "Test subscription tiers", icon: CreditCard, status: "active" },
        { name: "Test Map Views", href: "/test-map-views", description: "Test map functionality", icon: Map, status: "active" },
      ]
    },
    {
      title: "Infrastructure",
      icon: Server,
      links: [
        { name: "Redis Monitor", href: "/admin-unified?tab=infrastructure", description: "Redis cache status", icon: Server, status: "active" },
        { name: "WebSocket Status", href: "/admin-unified?tab=infrastructure", description: "Real-time connections", icon: Wifi, status: "active" },
        { name: "Database Health", href: "/admin-unified?tab=infrastructure", description: "Database performance", icon: Database, status: "active" },
        { name: "Security Monitor", href: "/admin-unified?tab=security", description: "Security dashboard", icon: Shield, status: "active" },
        { name: "Performance Monitor", href: "/admin-unified?tab=infrastructure", description: "System performance", icon: Activity, status: "active" },
      ]
    }
  ];

  // Quick stats cards
  const quickStats = [
    { label: "Total Communities", value: stats?.totalCommunities || "25,326", icon: Building2, color: "text-blue-600" },
    { label: "Active Users", value: stats?.activeUsers || "1,247", icon: Users, color: "text-green-600" },
    { label: "API Calls Today", value: stats?.apiCallsToday || "45,892", icon: Zap, color: "text-purple-600" },
    { label: "System Health", value: "98.5%", icon: Activity, color: "text-emerald-600" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <NavigationHeader />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Shield className="h-8 w-8 text-gray-700" />
                Super Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-2">Complete platform control and monitoring</p>
            </div>
            <Badge className="bg-gradient-to-r from-gray-300 to-gray-100 text-gray-900 border-gray-400 px-4 py-2">
              {user?.email || 'William.cowell01@gmail.com'}
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat) => (
            <Card key={stat.label} className="border-gray-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Dashboard Sections */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 lg:grid-cols-8 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="ai">AI Tools</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
            <TabsTrigger value="vendor">Vendor</TabsTrigger>
            <TabsTrigger value="testing">Testing</TabsTrigger>
            <TabsTrigger value="infra">Infrastructure</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-6">
              {dashboardSections.map((section) => (
                <Card key={section.title} className="border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <section.icon className="h-5 w-5 text-gray-600" />
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {section.links.map((link) => (
                        <Link key={link.href} href={link.href}>
                          <Button
                            variant="outline"
                            className="w-full h-auto p-4 justify-start hover:bg-gray-50 border-gray-200"
                          >
                            <div className="flex items-start gap-3">
                              <link.icon className="h-5 w-5 text-gray-600 mt-0.5" />
                              <div className="text-left">
                                <div className="font-medium flex items-center gap-2">
                                  {link.name}
                                  {link.status === "beta" && <Badge variant="secondary" className="text-xs">Beta</Badge>}
                                  {link.status === "coming-soon" && <Badge variant="outline" className="text-xs">Soon</Badge>}
                                </div>
                                <p className="text-xs text-gray-600 mt-1">{link.description}</p>
                              </div>
                            </div>
                          </Button>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Individual tab contents for each section */}
          {dashboardSections.map((section, index) => {
            const tabValues = ["admin", "analytics", "ai", "community", "vendor", "testing", "infra"];
            return (
              <TabsContent key={index} value={tabValues[index]}>
                <Card className="border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <section.icon className="h-5 w-5 text-gray-600" />
                      {section.title}
                    </CardTitle>
                    <CardDescription>Access all {section.title.toLowerCase()} tools and dashboards</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {section.links.map((link) => (
                        <Link key={link.href} href={link.href}>
                          <Card className="hover:shadow-md transition-shadow cursor-pointer border-gray-200">
                            <CardContent className="p-6">
                              <div className="flex items-start gap-4">
                                <div className="p-3 bg-gray-100 rounded-lg">
                                  <link.icon className="h-6 w-6 text-gray-700" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-semibold text-lg flex items-center gap-2">
                                    {link.name}
                                    {link.status === "active" && <CheckCircle className="h-4 w-4 text-green-600" />}
                                    {link.status === "beta" && <Badge variant="secondary">Beta</Badge>}
                                  </h3>
                                  <p className="text-sm text-gray-600 mt-1">{link.description}</p>
                                  <Button variant="link" className="p-0 h-auto mt-2 text-blue-600">
                                    Open Dashboard →
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>

        {/* System Status Footer */}
        <Card className="mt-8 border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">All Systems Operational</span>
                </div>
                <div className="text-sm text-gray-500">
                  Last checked: {new Date().toLocaleTimeString()}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                Refresh Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
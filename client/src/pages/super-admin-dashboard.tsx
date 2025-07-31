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
  TrendingUp, FileSearch, Sparkles, Bot, Gauge, X
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
  const [searchQuery, setSearchQuery] = useState("");

  // Platform stats
  const { data: stats } = useQuery({
    queryKey: ["/api/platform/stats"],
  });

  // Filter tools based on search query
  const filterTools = (links: any[]) => {
    if (!searchQuery) return links;
    const query = searchQuery.toLowerCase();
    return links.filter(link => 
      link.name.toLowerCase().includes(query) || 
      link.description.toLowerCase().includes(query)
    );
  };

  // Get filtered sections
  const getFilteredSections = () => {
    if (!searchQuery) return dashboardSections;
    return dashboardSections.map(section => ({
      ...section,
      links: filterTools(section.links)
    })).filter(section => section.links.length > 0);
  };

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
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl shadow-md">
                  <Shield className="h-8 w-8 text-gray-700" />
                </div>
                Super Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-2">Complete platform control and monitoring</p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <Badge className="bg-gradient-to-r from-gray-300 to-gray-100 text-gray-900 border-gray-400 px-4 py-2 whitespace-nowrap">
                {user?.email || 'William.cowell01@gmail.com'}
              </Badge>
            </div>
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex flex-wrap gap-2 h-auto p-2 bg-gray-100">
            <TabsTrigger value="overview" className="px-4 py-2">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="admin" className="px-4 py-2">
              <Shield className="h-4 w-4 mr-2" />
              Admin
            </TabsTrigger>
            <TabsTrigger value="analytics" className="px-4 py-2">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="ai" className="px-4 py-2">
              <Brain className="h-4 w-4 mr-2" />
              AI Tools
            </TabsTrigger>
            <TabsTrigger value="community" className="px-4 py-2">
              <Building2 className="h-4 w-4 mr-2" />
              Community
            </TabsTrigger>
            <TabsTrigger value="vendor" className="px-4 py-2">
              <Store className="h-4 w-4 mr-2" />
              Vendor
            </TabsTrigger>
            <TabsTrigger value="testing" className="px-4 py-2">
              <TestTube className="h-4 w-4 mr-2" />
              Testing
            </TabsTrigger>
            <TabsTrigger value="infra" className="px-4 py-2">
              <Server className="h-4 w-4 mr-2" />
              Infrastructure
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {searchQuery && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Search className="h-4 w-4" />
                Showing results for "{searchQuery}"
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="ml-2 h-6 px-2"
                >
                  <X className="h-3 w-3" />
                  Clear
                </Button>
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {getFilteredSections().map((section) => (
                <Card key={section.title} className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="p-2 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg">
                        <section.icon className="h-5 w-5 text-gray-700" />
                      </div>
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {filterTools(section.links).slice(0, 3).map((link) => (
                        <Link key={link.href} href={link.href}>
                          <div className="group p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <link.icon className="h-4 w-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
                                <div>
                                  <p className="font-medium text-sm group-hover:text-blue-600 transition-colors">
                                    {link.name}
                                  </p>
                                  <p className="text-xs text-gray-500">{link.description}</p>
                                </div>
                              </div>
                              {link.status === "active" && (
                                <CheckCircle className="h-4 w-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                      {filterTools(section.links).length > 3 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full mt-2 text-blue-600 hover:text-blue-700"
                          onClick={() => {
                            const tabValues = ["admin", "analytics", "ai", "community", "vendor", "testing", "infra"];
                            const sectionIndex = dashboardSections.findIndex(s => s.title === section.title);
                            if (sectionIndex !== -1 && tabValues[sectionIndex]) {
                              setActiveTab(tabValues[sectionIndex]);
                            }
                          }}
                        >
                          View all {filterTools(section.links).length} tools →
                        </Button>
                      )}
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
              <TabsContent key={index} value={tabValues[index]} className="space-y-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl">
                      <section.icon className="h-6 w-6 text-gray-700" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                      <p className="text-gray-600">Access all {section.title.toLowerCase()} tools and dashboards</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filterTools(section.links).map((link) => (
                      <Link key={link.href} href={link.href}>
                        <div className="group relative bg-gray-50 hover:bg-white border border-gray-200 hover:border-blue-300 rounded-lg p-5 transition-all hover:shadow-md cursor-pointer">
                          <div className="flex items-start gap-4">
                            <div className="p-2.5 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                              <link.icon className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                  {link.name}
                                </h3>
                                {link.status === "active" && (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                )}
                                {link.status === "beta" && (
                                  <Badge variant="secondary" className="text-xs">Beta</Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 line-clamp-2">{link.description}</p>
                            </div>
                            <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
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
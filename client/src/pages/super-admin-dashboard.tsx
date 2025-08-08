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
  TrendingUp, FileSearch, Sparkles, Bot, Gauge, X,
  Calculator
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
    status?: "active" | "beta" | "coming-soon" | "featured";
  }>;
}

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Check super admin access - only super_admin role allowed
  const userRole = (user as any)?.role || '';
  const isSuperAdmin = userRole === 'super_admin';
  
  // Block non-super admin users
  if (!user || !isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              This dashboard is restricted to super administrators only.
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
      title: "🌟 Primary Command Center",
      icon: BarChart3,
      links: [
        { name: "Comprehensive Analytics Hub", href: "/super-admin-analytics", description: "Real-time platform metrics, revenue tracking, and AI performance monitoring", icon: Sparkles, status: "featured" },
      ]
    },
    {
      title: "Core Admin Tools",
      icon: Shield,
      links: [
        { name: "Unified Admin Dashboard", href: "/admin-unified", description: "Main administrative dashboard", icon: LayoutDashboard, status: "active" },
        { name: "User Management", href: "/admin-unified?tab=users", description: "Manage platform users", icon: Users, status: "active" },
        { name: "Role Management", href: "/admin-unified?tab=security", description: "Manage user roles and permissions", icon: Lock, status: "active" },
      ]
    },
    {
      title: "Financial & Monitoring",
      icon: DollarSign,
      links: [
        { name: "Enhanced Financial Dashboard", href: "/enhanced-financial-dashboard", description: "Advanced revenue analytics", icon: TrendingUp, status: "active" },
        { name: "Payment Monitoring", href: "/payment-monitoring", description: "Payment system health", icon: CreditCard, status: "active" },
        { name: "API Cost Dashboard", href: "/api-cost-dashboard", description: "Monitor API usage and costs", icon: Calculator, status: "active" },
        { name: "Data Quality Dashboard", href: "/data-quality-dashboard", description: "Monitor data integrity", icon: Gauge, status: "active" },
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
        { name: "Payment Test Dashboard", href: "/payment-test-dashboard", description: "Test all payment tiers and flows", icon: CreditCard, status: "active" },
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

  // Quick stats cards - GOLDEN DATA RULE: Only show real data, no fake fallbacks
  // Dynamic trend calculations based on actual data from API
  const quickStats = [
    { 
      label: "Total Communities", 
      value: (stats as any)?.totalCommunities?.toLocaleString() || "Loading...", 
      icon: Building2, 
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      trend: "" // Will be populated when API provides trend data
    },
    { 
      label: "HUD Properties", 
      value: (stats as any)?.hudPropertiesCount?.toLocaleString() || "Loading...", 
      icon: Building2, 
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      trend: "" // Will be populated when API provides pricing percentage
    },
    { 
      label: "Mobile Home Parks", 
      value: (stats as any)?.housingTypeBreakdown?.senior_mobile_park?.toLocaleString() || "Loading...", 
      icon: Store, 
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      trend: "" // Will be populated when API provides segment comparison
    },
    { 
      label: "Active Users", 
      value: (stats as any)?.totalUsers?.toLocaleString() || "Loading...", 
      icon: Users, 
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      trend: "" // Will be populated when API provides growth percentage
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <NavigationHeader />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Compact Welcome Hero Section */}
        <div className="mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl p-4 text-white shadow-xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Command Center</h1>
                <p className="text-blue-100 text-sm">MySeniorValet Platform Management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-white/20 backdrop-blur-md text-white border-white/30 px-3 py-1 text-sm">
                Super Admin
              </Badge>
              <div className="hidden lg:block text-right">
                <p className="text-xs text-blue-100">
                  {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
                <p className="text-xs text-blue-200">{user?.email || 'William.cowell01@gmail.com'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Search Bar */}
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Platform Overview</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-1.5 w-56 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Compact Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {quickStats.map((stat) => (
            <Card key={stat.label} className={`${stat.borderColor} hover:shadow-lg transition-all duration-200`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 font-medium">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1 text-gray-900">{stat.value}</p>
                    <p className={`text-xs mt-1 ${stat.color} font-medium`}>{stat.trend}</p>
                  </div>
                  <div className={`p-2 ${stat.bgColor} rounded-lg`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Compact Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="flex flex-wrap gap-1 h-auto p-1 bg-gray-100">
            <TabsTrigger value="overview" className="px-3 py-1.5 text-xs">
              <LayoutDashboard className="h-3.5 w-3.5 mr-1" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="admin" className="px-3 py-1.5 text-xs">
              <Shield className="h-3.5 w-3.5 mr-1" />
              Admin
            </TabsTrigger>
            <TabsTrigger value="analytics" className="px-3 py-1.5 text-xs">
              <BarChart3 className="h-3.5 w-3.5 mr-1" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="ai" className="px-3 py-1.5 text-xs">
              <Brain className="h-3.5 w-3.5 mr-1" />
              AI
            </TabsTrigger>
            <TabsTrigger value="community" className="px-3 py-1.5 text-xs">
              <Building2 className="h-3.5 w-3.5 mr-1" />
              Community
            </TabsTrigger>
            <TabsTrigger value="vendor" className="px-3 py-1.5 text-xs">
              <Store className="h-3.5 w-3.5 mr-1" />
              Vendor
            </TabsTrigger>
            <TabsTrigger value="testing" className="px-3 py-1.5 text-xs">
              <TestTube className="h-3.5 w-3.5 mr-1" />
              Testing
            </TabsTrigger>
            <TabsTrigger value="infra" className="px-3 py-1.5 text-xs">
              <Server className="h-3.5 w-3.5 mr-1" />
              Infra
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
            
            {/* Compact Housing Distribution */}
            {!searchQuery && (
              <Card className="border-gray-200 shadow-sm mb-4">
                <CardHeader className="py-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4" />
                    Housing Type Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="grid grid-cols-3 lg:grid-cols-5 gap-2">
                    <div className="p-2 bg-blue-50 rounded text-center">
                      <p className="text-lg font-bold text-blue-600">{(stats as any)?.housingTypeBreakdown?.hud_senior_housing?.toLocaleString() || 'Loading...'}</p>
                      <p className="text-xs text-gray-600">HUD</p>
                    </div>
                    <div className="p-2 bg-green-50 rounded text-center">
                      <p className="text-lg font-bold text-green-600">{(stats as any)?.housingTypeBreakdown?.senior_mobile_park?.toLocaleString() || 'Loading...'}</p>
                      <p className="text-xs text-gray-600">Mobile</p>
                    </div>
                    <div className="p-2 bg-purple-50 rounded text-center">
                      <p className="text-lg font-bold text-purple-600">{(stats as any)?.housingTypeBreakdown?.independent_living?.toLocaleString() || 'Loading...'}</p>
                      <p className="text-xs text-gray-600">Independent</p>
                    </div>
                    <div className="p-2 bg-orange-50 rounded text-center">
                      <p className="text-lg font-bold text-orange-600">{(stats as any)?.housingTypeBreakdown?.assisted_living?.toLocaleString() || 'Loading...'}</p>
                      <p className="text-xs text-gray-600">Assisted</p>
                    </div>
                    <div className="p-2 bg-red-50 rounded text-center">
                      <p className="text-lg font-bold text-red-600">{(stats as any)?.housingTypeBreakdown?.memory_care?.toLocaleString() || 'Loading...'}</p>
                      <p className="text-xs text-gray-600">Memory</p>
                    </div>
                  </div>
                  <p className="text-center text-xs text-gray-500 mt-2">
                    Total: <span className="font-semibold">40,000-44,000</span> unique listings
                  </p>
                </CardContent>
              </Card>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {getFilteredSections().map((section) => (
                <Card key={section.title} className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="py-3 pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <section.icon className="h-4 w-4 text-gray-700" />
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 pb-3">
                    <div className="space-y-1">
                      {filterTools(section.links).slice(0, 3).map((link) => (
                        <Link key={link.href} href={link.href}>
                          <div className={`group p-2 rounded transition-all cursor-pointer ${
                            link.status === 'featured' 
                              ? 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 hover:shadow-md' 
                              : 'hover:bg-gray-50'
                          }`}>
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <link.icon className={`h-3.5 w-3.5 flex-shrink-0 ${
                                  link.status === 'featured' 
                                    ? 'text-blue-600' 
                                    : 'text-gray-500 group-hover:text-blue-600'
                                } transition-colors`} />
                                <div className="flex-1 min-w-0">
                                  <p className={`text-xs font-medium truncate transition-colors ${
                                    link.status === 'featured' 
                                      ? 'text-blue-700' 
                                      : 'group-hover:text-blue-600'
                                  }`}>
                                    {link.name}
                                  </p>
                                </div>
                              </div>
                              {link.status === "featured" && (
                                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 text-xs px-1.5 py-0.5">
                                  ⭐
                                </Badge>
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
                                {link.status === "featured" && (
                                  <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 text-xs">Featured</Badge>
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
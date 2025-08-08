import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NavigationHeader } from "@/components/NavigationHeader";
import { useAuth } from "@/hooks/useAuth";
import { 
  Shield, BarChart3, Map, FileText, CreditCard, Users, 
  Building2, TrendingUp, Settings, ShoppingBag, Activity,
  Zap, Lock, Database, Globe
} from "lucide-react";

export default function AdminPortal() {
  const { user } = useAuth();
  const userRole = (user as any)?.role || '';
  const isSuperAdmin = userRole === 'super_admin';
  const isAdmin = userRole === 'admin' || isSuperAdmin;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-6 w-6 text-red-600" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300">
              You need admin privileges to access this area.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const adminTools = [
    {
      title: "Admin Enhanced Heatmap",
      description: "Advanced availability analytics with revenue insights",
      href: "/admin/availability-heatmap",
      icon: Map,
      color: "text-green-600",
      borderColor: "border-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
      featured: true
    },
    {
      title: "Super Admin Analytics",
      description: "Comprehensive platform intelligence center",
      href: "/super-admin-analytics",
      icon: BarChart3,
      color: "text-blue-600",
      borderColor: "border-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
      superAdminOnly: true
    },
    {
      title: "Admin Unified Dashboard",
      description: "All-in-one administrative control panel",
      href: "/admin-unified",
      icon: Shield,
      color: "text-purple-600",
      borderColor: "border-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950"
    },
    {
      title: "Payment Monitoring",
      description: "Track payments and subscriptions",
      href: "/payment-monitoring",
      icon: CreditCard,
      color: "text-orange-600",
      borderColor: "border-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950"
    },
    {
      title: "Enhanced Financial Dashboard",
      description: "Revenue analytics and forecasting",
      href: "/enhanced-financial-dashboard",
      icon: TrendingUp,
      color: "text-emerald-600",
      borderColor: "border-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950"
    },
    {
      title: "Legal Document History",
      description: "Version control and compliance tracking",
      href: "/legal-document-history",
      icon: FileText,
      color: "text-indigo-600",
      borderColor: "border-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-950"
    },
    {
      title: "User Management",
      description: "Manage users and permissions",
      href: "/admin/users",
      icon: Users,
      color: "text-cyan-600",
      borderColor: "border-cyan-600",
      bgColor: "bg-cyan-50 dark:bg-cyan-950"
    },
    {
      title: "Community Management",
      description: "Manage communities and listings",
      href: "/admin/communities",
      icon: Building2,
      color: "text-pink-600",
      borderColor: "border-pink-600",
      bgColor: "bg-pink-50 dark:bg-pink-950"
    },
    {
      title: "Vendor Dashboard",
      description: "Vendor portal management",
      href: "/admin/vendor-dashboard",
      icon: ShoppingBag,
      color: "text-amber-600",
      borderColor: "border-amber-600",
      bgColor: "bg-amber-50 dark:bg-amber-950"
    },
    {
      title: "Marketing Hub",
      description: "Marketing campaigns and analytics",
      href: "/admin/marketing-hub",
      icon: Globe,
      color: "text-violet-600",
      borderColor: "border-violet-600",
      bgColor: "bg-violet-50 dark:bg-violet-950"
    },
    {
      title: "System Health",
      description: "Monitor system performance",
      href: "/admin/system-health",
      icon: Activity,
      color: "text-red-600",
      borderColor: "border-red-600",
      bgColor: "bg-red-50 dark:bg-red-950"
    },
    {
      title: "Database Management",
      description: "Database operations and backups",
      href: "/admin/database",
      icon: Database,
      color: "text-slate-600",
      borderColor: "border-slate-600",
      bgColor: "bg-slate-50 dark:bg-slate-950",
      superAdminOnly: true
    }
  ];

  const filteredTools = adminTools.filter(tool => 
    !tool.superAdminOnly || (tool.superAdminOnly && isSuperAdmin)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900">
      <NavigationHeader title="Admin Portal" subtitle="Administrative Tools & Dashboards" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Shield className="w-10 h-10 text-purple-600" />
            Admin Portal
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Access all administrative tools and dashboards
          </p>
          {isSuperAdmin && (
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-sm">
              <Zap className="w-4 h-4" />
              Super Admin Access
            </div>
          )}
        </div>

        {/* Admin Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Card 
                key={tool.href}
                className={`
                  hover:shadow-xl transition-all duration-200 cursor-pointer
                  ${tool.featured ? `border-2 ${tool.borderColor}` : ''}
                  ${tool.featured ? tool.bgColor : ''}
                `}
                onClick={() => window.location.href = tool.href}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${tool.color}`} />
                      <span className={tool.featured ? tool.color : ''}>
                        {tool.title}
                      </span>
                    </div>
                    {tool.featured && (
                      <span className={`text-xs px-2 py-1 rounded-full ${tool.bgColor} ${tool.color} font-semibold`}>
                        Featured
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {tool.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full"
                    variant={tool.featured ? "default" : "outline"}
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = tool.href;
                    }}
                  >
                    Open Dashboard
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
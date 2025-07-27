import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Users, Building2, DollarSign, BarChart3, Settings, Shield, Zap, TrendingUp, Globe, Crown, Star, Diamond, Gem } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";

// Role-based tier configurations
const ROLE_TIERS = {
  super_admin: {
    tier: "Platinum",
    color: "bg-gradient-to-r from-purple-600 to-blue-600",
    icon: Crown,
    tabs: ["overview", "users", "communities", "analytics", "financial", "security", "vendors", "integrations"]
  },
  admin: {
    tier: "Gold", 
    color: "bg-gradient-to-r from-yellow-500 to-orange-500",
    icon: Star,
    tabs: ["overview", "users", "communities", "analytics", "security"]
  },
  community_owner: {
    tier: "Emerald",
    color: "bg-gradient-to-r from-green-500 to-emerald-500", 
    icon: Building2,
    tabs: ["overview", "community", "analytics", "residents", "messages"]
  },
  vendor: {
    tier: "Silver",
    color: "bg-gradient-to-r from-gray-400 to-slate-500",
    icon: Diamond,
    tabs: ["overview", "services", "leads", "analytics", "reviews"]
  },
  user: {
    tier: "Bronze",
    color: "bg-gradient-to-r from-amber-600 to-orange-600",
    icon: Gem,
    tabs: ["overview", "favorites", "searches", "tours", "family"]
  }
};

export default function ConsolidatedDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  // Get user role configuration
  const userRole = user?.role || 'user';
  const roleConfig = ROLE_TIERS[userRole as keyof typeof ROLE_TIERS] || ROLE_TIERS.user;
  const TierIcon = roleConfig.icon;

  // Real-time platform statistics
  const { data: platformStats } = useQuery({
    queryKey: ['/api/platform/stats'],
    enabled: !!user && ['super_admin', 'admin'].includes(userRole),
  });

  // User management data (super_admin/admin only)
  const { data: userManagement } = useQuery({
    queryKey: ['/api/admin/users'],
    enabled: !!user && ['super_admin', 'admin'].includes(userRole),
  });

  // Community analytics (for community owners and admins)
  const { data: communityAnalytics } = useQuery({
    queryKey: ['/api/communities/analytics'],
    enabled: !!user && ['super_admin', 'admin', 'community_owner'].includes(userRole),
  });

  // Financial data (super_admin/admin only)
  const { data: financialStats } = useQuery({
    queryKey: ['/api/financial/stats'],
    enabled: !!user && ['super_admin', 'admin'].includes(userRole),
  });

  // Security audit logs (super_admin/admin only)
  const { data: securityLogs } = useQuery({
    queryKey: ['/api/security/audit-logs'],
    enabled: !!user && ['super_admin', 'admin'].includes(userRole),
  });

  // Vendor analytics (vendor only)
  const { data: vendorStats } = useQuery({
    queryKey: ['/api/vendor/analytics'],
    enabled: !!user && userRole === 'vendor',
  });

  // User personal data (user dashboard)
  const { data: userDashboardData } = useQuery({
    queryKey: ['/api/user/dashboard'],
    enabled: !!user && userRole === 'user',
  });

  const handleUnauthorizedError = (error: any) => {
    if (isUnauthorizedError(error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return true;
    }
    return false;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Access Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please log in to access your dashboard.
            </p>
            <Button onClick={() => window.location.href = "/api/login"} className="w-full">
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Tier Banner */}
      <div className={`${roleConfig.color} text-white py-4 px-6 shadow-lg`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TierIcon className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">{roleConfig.tier} Dashboard</h1>
              <p className="text-white/80">Welcome back, {user.firstName || user.username}</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            {roleConfig.tier} Access
          </Badge>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-auto gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm">
            {roleConfig.tabs.map((tab) => (
              <TabsTrigger 
                key={tab} 
                value={tab}
                className="capitalize data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Overview Tab - Common to all roles */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Platform Statistics */}
              {['super_admin', 'admin'].includes(userRole) && platformStats && (
                <>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Communities</CardTitle>
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{platformStats.totalCommunities?.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">
                        Across {platformStats.statesCovered} states
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{platformStats.activeUsers?.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">
                        +{platformStats.userGrowth}% from last month
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${platformStats.revenue?.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">
                        This month
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">System Health</CardTitle>
                      <Zap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">99.9%</div>
                      <p className="text-xs text-muted-foreground">
                        Uptime this month
                      </p>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* Community Owner Statistics */}
              {userRole === 'community_owner' && communityAnalytics && (
                <>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">My Communities</CardTitle>
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{communityAnalytics.totalCommunities}</div>
                      <p className="text-xs text-muted-foreground">
                        {communityAnalytics.activeCommunities} active
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{communityAnalytics.totalViews?.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">
                        This month
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Tour Requests</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{communityAnalytics.tourRequests}</div>
                      <p className="text-xs text-muted-foreground">
                        {communityAnalytics.pendingTours} pending
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                      <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{communityAnalytics.averageRating}</div>
                      <p className="text-xs text-muted-foreground">
                        From {communityAnalytics.totalReviews} reviews
                      </p>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* Vendor Statistics */}
              {userRole === 'vendor' && vendorStats && (
                <>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Services</CardTitle>
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{vendorStats.activeServices}</div>
                      <p className="text-xs text-muted-foreground">
                        {vendorStats.totalServices} total
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Leads This Month</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{vendorStats.leadsThisMonth}</div>
                      <p className="text-xs text-muted-foreground">
                        {vendorStats.conversionRate}% conversion rate
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${vendorStats.revenue?.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">
                        This month
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Rating</CardTitle>
                      <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{vendorStats.averageRating}</div>
                      <p className="text-xs text-muted-foreground">
                        From {vendorStats.totalReviews} reviews
                      </p>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* User Dashboard Statistics */}
              {userRole === 'user' && userDashboardData && (
                <>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Saved Communities</CardTitle>
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{userDashboardData.savedCommunities}</div>
                      <p className="text-xs text-muted-foreground">
                        In your favorites
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Recent Searches</CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{userDashboardData.recentSearches}</div>
                      <p className="text-xs text-muted-foreground">
                        This month
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Scheduled Tours</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{userDashboardData.scheduledTours}</div>
                      <p className="text-xs text-muted-foreground">
                        Upcoming
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Family Members</CardTitle>
                      <Globe className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{userDashboardData.familyMembers}</div>
                      <p className="text-xs text-muted-foreground">
                        Connected
                      </p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </TabsContent>

          {/* Role-specific tabs will be implemented in next components */}
          
        </Tabs>
      </div>
    </div>
  );
}
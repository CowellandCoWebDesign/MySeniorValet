import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  Calendar,
  TrendingUp,
  Clock,
  RefreshCw,
  Mail,
  Building,
  ShoppingCart,
  Shield,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserStats {
  totalUsers: number;
  families: number;
  communities: number;
  vendors: number;
  admins: number;
  verifiedEmails: number;
  activeUsers: number;
  newToday: number;
  newThisWeek: number;
  newThisMonth: number;
}

interface RecentUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  accountType: string;
  role: string;
  createdAt: string;
  emailVerified: boolean;
  lastLoginAt: string | null;
}

export function UserTracker() {
  const { toast } = useToast();
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch user stats
  const { data: stats, refetch: refetchStats } = useQuery<UserStats>({
    queryKey: ['/api/admin/users/stats'],
    refetchInterval: autoRefresh ? 30000 : false, // Auto-refresh every 30 seconds
  });

  // Fetch recent users
  const { data: recentUsersData, refetch: refetchUsers } = useQuery<{ users: RecentUser[], total: number }>({
    queryKey: ['/api/admin/users/recent'],
    refetchInterval: autoRefresh ? 30000 : false,
  });

  const handleManualRefresh = async () => {
    await Promise.all([refetchStats(), refetchUsers()]);
    toast({
      title: "Data Refreshed",
      description: "User statistics have been updated.",
    });
  };

  const getAccountTypeBadge = (type: string) => {
    const badges = {
      family: { icon: Users, className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
      community: { icon: Building, className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
      vendor: { icon: ShoppingCart, className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
      admin: { icon: Shield, className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
    };
    
    const badge = badges[type as keyof typeof badges] || badges.family;
    const Icon = badge.icon;
    
    return (
      <Badge className={badge.className}>
        <Icon className="w-3 h-3 mr-1" />
        {type}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Registration Tracker</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? "bg-green-50 dark:bg-green-900/20" : ""}
          >
            <Clock className="w-4 h-4 mr-2" />
            {autoRefresh ? "Auto-Refresh ON" : "Auto-Refresh OFF"}
          </Button>
          <Button onClick={handleManualRefresh} size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Now
          </Button>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
            <div className="text-xs text-muted-foreground mt-1">
              {stats?.activeUsers || 0} active
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">New Today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{stats?.newToday || 0}</p>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              Live count
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.newThisWeek || 0}</p>
            <div className="text-xs text-muted-foreground mt-1">
              New registrations
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.newThisMonth || 0}</p>
            <div className="text-xs text-muted-foreground mt-1">
              Monthly total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.verifiedEmails || 0}</p>
            <div className="text-xs text-muted-foreground mt-1">
              Email confirmed
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">User Type Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Families</p>
                <p className="text-xl font-bold">{stats?.families || 0}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Communities</p>
                <p className="text-xl font-bold">{stats?.communities || 0}</p>
              </div>
              <Building className="w-8 h-8 text-purple-600" />
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Vendors</p>
                <p className="text-xl font-bold">{stats?.vendors || 0}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-green-600" />
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-xl font-bold">{stats?.admins || 0}</p>
              </div>
              <Shield className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Recent Registrations
            {recentUsersData?.users && recentUsersData.users.length > 0 && (
              <Badge className="ml-2" variant="secondary">
                {recentUsersData.users.length} users
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentUsersData?.users && recentUsersData.users.length > 0 ? (
              recentUsersData.users.slice(0, 10).map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {user.firstName?.[0] || user.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getAccountTypeBadge(user.accountType)}
                    {user.emailVerified ? (
                      <span title="Email Verified">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </span>
                    ) : (
                      <span title="Email Not Verified">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                      </span>
                    )}
                    <div className="text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} {new Date(user.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <UserPlus className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No recent registrations</p>
                <p className="text-sm mt-1">New users will appear here</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Status */}
      <div className="flex items-center justify-center text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          {autoRefresh ? 'Live tracking active - refreshing every 30 seconds' : 'Auto-refresh paused'}
        </div>
      </div>
    </div>
  );
}
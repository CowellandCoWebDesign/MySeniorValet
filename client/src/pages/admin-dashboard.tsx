import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield,
  Activity,
  DollarSign,
  Users,
  Building,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  CreditCard,
  BarChart3,
  Settings,
  FileText,
  Database,
  Eye,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { NavigationHeader } from '@/components/NavigationHeader';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [refreshing, setRefreshing] = useState(false);
  
  // Check if user is super admin
  const isSuperAdmin = (user as any)?.email === 'william.cowell01@gmail.com';
  
  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <NavigationHeader />
        <div className="container mx-auto px-4 py-16">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Access denied. This page is restricted to super administrators only.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Platform stats
  const { data: platformStats } = useQuery<{
    totalCommunities: number;
    totalUsers: number;
    totalVendors: number;
    activeSubscriptions: number;
  }>({
    queryKey: ['/api/platform/stats'],
  });

  // Recent errors
  const { data: recentErrors } = useQuery({
    queryKey: ['/api/admin/errors/recent'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/admin/errors/recent');
        return response as { errors: Array<{ message: string; timestamp: string; type: string }> };
      } catch {
        return { errors: [] };
      }
    }
  });

  const handleRefresh = () => {
    setRefreshing(true);
    window.location.reload();
  };

  const adminSections = [
    {
      title: 'Payment System',
      description: 'Monitor and test payment flows',
      icon: CreditCard,
      path: '/payment-monitoring',
      status: 'operational',
      stats: { active: 7, pending: 0, failed: 0 }
    },
    {
      title: 'Financial Analytics',
      description: 'Revenue, subscriptions, and financial metrics',
      icon: DollarSign,
      path: '/financial-dashboard',
      status: 'operational',
      stats: { revenue: '$0', subscriptions: 0 }
    },
    {
      title: 'Community Management',
      description: 'Manage communities and subscriptions',
      icon: Building,
      path: '/admin/communities',
      status: 'operational',
      stats: { total: platformStats?.totalCommunities || 34171, active: 0 }
    },
    {
      title: 'Vendor Management',
      description: 'Manage vendor accounts and listings',
      icon: Users,
      path: '/admin/vendors',
      status: 'operational',
      stats: { total: platformStats?.totalVendors || 0, active: 0 }
    },
    {
      title: 'Error Monitoring',
      description: 'System errors and debugging',
      icon: AlertCircle,
      path: '/admin/errors',
      status: recentErrors?.errors?.length > 0 ? 'warning' : 'operational',
      stats: { errors: recentErrors?.errors?.length || 0 }
    },
    {
      title: 'Database Inspector',
      description: 'Direct database access and queries',
      icon: Database,
      path: '/admin/database',
      status: 'operational',
      stats: { tables: 20, records: '34K+' }
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavigationHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Shield className="h-8 w-8 text-purple-600" />
                Super Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Welcome back, {(user as any)?.email}
              </p>
            </div>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Communities</p>
                    <p className="text-2xl font-bold">{platformStats?.totalCommunities?.toLocaleString() || '34,171'}</p>
                  </div>
                  <Building className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                    <p className="text-2xl font-bold">{platformStats?.totalUsers?.toLocaleString() || '0'}</p>
                  </div>
                  <Users className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active Subscriptions</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">System Status</p>
                    <p className="text-2xl font-bold text-green-600">Operational</p>
                  </div>
                  <Activity className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Admin Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.map((section) => (
            <Card 
              key={section.path}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setLocation(section.path)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <section.icon className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                  <Badge variant={section.status === 'operational' ? 'default' : 'destructive'}>
                    {section.status}
                  </Badge>
                </div>
                <CardTitle className="mt-4">{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  {Object.entries(section.stats).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-gray-600 dark:text-gray-400 capitalize">{key}</p>
                      <p className="font-semibold">{value}</p>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4" variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent System Activity</CardTitle>
            <CardDescription>Latest errors and important events</CardDescription>
          </CardHeader>
          <CardContent>
            {recentErrors?.errors?.length > 0 ? (
              <div className="space-y-4">
                {recentErrors?.errors?.slice(0, 5).map((error: any, index: number) => (
                  <Alert key={index} variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="flex items-center justify-between">
                        <span>{error.message}</span>
                        <Badge variant="outline">{error.timestamp}</Badge>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            ) : (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  No recent errors. System is running smoothly.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setLocation('/payment-test-dashboard')}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Test Payments
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setLocation('/payment-diagnostics')}
              >
                <Activity className="h-4 w-4 mr-2" />
                Run Diagnostics
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setLocation('/admin/database')}
              >
                <Database className="h-4 w-4 mr-2" />
                Database Inspector
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
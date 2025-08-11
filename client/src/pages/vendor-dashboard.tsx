import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3,
  Users,
  DollarSign,
  Package,
  Settings,
  FileText,
  TrendingUp,
  Calendar,
  Eye,
  MessageSquare,
  Star,
  Crown,
  AlertCircle,
  Building2,
  Phone,
  Mail,
  MapPin,
  Shield,
  CreditCard,
  Clock,
  ChevronRight,
  Download,
  Upload
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { LoadingMascot } from "@/components/mascot/LoadingMascot";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";

interface VendorDashboardData {
  vendor: {
    id: number;
    businessName: string;
    businessType: string;
    subscriptionTier: string;
    subscriptionStatus: string;
    isVerified: boolean;
    averageRating: number;
    totalReviews: number;
    monthlyLeadsCount: number;
    monthlyClicksCount: number;
    totalLeadsGenerated: number;
    lifetimeRevenue: string;
  };
  subscription: {
    hasSubscription: boolean;
    tier: string;
    status: string;
    currentPeriodEnd: string;
    features: any;
  };
  analytics: {
    views: number;
    clicks: number;
    leads: number;
    conversions: number;
    revenue: number;
  };
  recentLeads: Array<{
    id: number;
    userName: string;
    serviceName: string;
    createdAt: string;
    status: string;
  }>;
}

export default function VendorDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const [selectedTab, setSelectedTab] = useState("overview");

  // Get vendor ID from user session or URL params
  const vendorId = 1; // TODO: Get from authenticated vendor session

  // Fetch vendor dashboard data
  const { data: dashboardData, isLoading, error } = useQuery<VendorDashboardData>({
    queryKey: [`/api/vendors/${vendorId}/dashboard`],
    enabled: !authLoading && !!user,
  });

  const vendor = dashboardData?.vendor;
  const subscription = dashboardData?.subscription;
  const analytics = dashboardData?.analytics;

  // Upgrade subscription mutation
  const upgradeMutation = useMutation({
    mutationFn: async (targetTier: string) => {
      const response = await apiRequest("POST", "/api/vendor-subscription/create-checkout-session", {
        vendorId,
        tierKey: targetTier
      });
      return response;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: () => {
      toast({
        title: "Upgrade Failed",
        description: "Failed to initiate upgrade process. Please try again.",
        variant: "destructive",
      });
    }
  });

  const tierColors = {
    basic: "bg-gray-100 text-gray-800",
    featured: "bg-blue-100 text-blue-800",
    national: "bg-purple-100 text-purple-800",
    enterprise: "bg-amber-100 text-amber-800"
  };

  const tierIcons = {
    basic: <Package className="w-4 h-4" />,
    featured: <Star className="w-4 h-4" />,
    national: <Building2 className="w-4 h-4" />,
    enterprise: <Crown className="w-4 h-4" />
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingMascot message="Loading vendor dashboard..." size="lg" />
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Dashboard Access Error</h2>
            <p className="text-gray-600 mb-4">
              Unable to load vendor dashboard. Please ensure you have vendor access.
            </p>
            <Button onClick={() => setLocation("/")}>Return to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{vendor.businessName}</h1>
          <div className="flex items-center gap-4">
            <Badge className={tierColors[vendor.subscriptionTier as keyof typeof tierColors]}>
              {tierIcons[vendor.subscriptionTier as keyof typeof tierIcons]}
              <span className="ml-1">{vendor.subscriptionTier} Tier</span>
            </Badge>
            {vendor.isVerified && (
              <Badge variant="secondary">
                <Shield className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="font-medium">{vendor.averageRating || 0}</span>
              <span className="text-gray-500">({vendor.totalReviews} reviews)</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setLocation('/tourmate-dashboard')}
            variant="outline"
          >
            <Calendar className="w-4 h-4 mr-2" />
            TourMate™ Analytics
          </Button>
          <Button 
            onClick={() => setLocation(`/vendor-profile/${vendorId}/edit`)}
            variant="outline"
          >
            <Settings className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Subscription Alert */}
      {vendor.subscriptionTier === 'basic' && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-semibold">Upgrade to Featured Vendor</h3>
                  <p className="text-sm text-gray-600">
                    Get 5x more visibility, custom branding, and analytics dashboard
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => upgradeMutation.mutate('featured')}
                disabled={upgradeMutation.isPending}
              >
                {upgradeMutation.isPending ? "Processing..." : "Upgrade Now"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Monthly Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.views || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Profile visits this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendor.monthlyClicksCount}</div>
            <Progress 
              value={(vendor.monthlyClicksCount / 1000) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendor.monthlyLeadsCount}</div>
            <p className="text-xs text-gray-500 mt-1">
              Total: {vendor.totalLeadsGenerated}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${vendor.lifetimeRevenue}</div>
            <p className="text-xs text-gray-500 mt-1">Lifetime earnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Leads</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData?.recentLeads?.length ? (
                <div className="space-y-3">
                  {dashboardData.recentLeads.map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{lead.userName}</p>
                        <p className="text-sm text-gray-600">{lead.serviceName}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={lead.status === 'new' ? 'default' : 'secondary'}>
                          {lead.status}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(lead.createdAt), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  No recent leads. Upgrade your tier for better visibility!
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto flex-col py-4">
                  <Upload className="w-5 h-5 mb-2" />
                  <span className="text-sm">Upload Logo</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col py-4">
                  <FileText className="w-5 h-5 mb-2" />
                  <span className="text-sm">Update Services</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col py-4">
                  <MessageSquare className="w-5 h-5 mb-2" />
                  <span className="text-sm">View Messages</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col py-4">
                  <Download className="w-5 h-5 mb-2" />
                  <span className="text-sm">Export Report</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leads">
          <Card>
            <CardHeader>
              <CardTitle>Lead Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-500 py-12">
                Lead management features coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Service Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-500 py-12">
                Service management features coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics & Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {vendor.subscriptionTier === 'basic' ? (
                <div className="text-center py-12">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Analytics are available for Featured vendors and above
                  </p>
                  <Button onClick={() => upgradeMutation.mutate('featured')}>
                    Upgrade to Featured
                  </Button>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-12">
                  Analytics dashboard coming soon...
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing & Subscription</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Current Plan</h3>
                  <Badge className={tierColors[vendor.subscriptionTier as keyof typeof tierColors]}>
                    {vendor.subscriptionTier} Tier
                  </Badge>
                </div>
                {subscription?.currentPeriodEnd && (
                  <p className="text-sm text-gray-600">
                    Next billing date: {format(new Date(subscription.currentPeriodEnd), 'MMMM d, yyyy')}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                {vendor.subscriptionTier !== 'national' && (
                  <Button 
                    onClick={() => {
                      // Store vendor data for upgrade flow
                      sessionStorage.setItem('vendorUpgradeData', JSON.stringify({
                        vendorId: vendor.id,
                        vendorName: vendor.businessName,
                        currentTier: vendor.subscriptionTier || 'basic',
                        isNewVendor: false
                      }));
                      setLocation('/vendor-marketplace-tiers');
                    }}
                    className="flex-1"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Upgrade Plan
                  </Button>
                )}
                <Button variant="outline" className="flex-1">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Update Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
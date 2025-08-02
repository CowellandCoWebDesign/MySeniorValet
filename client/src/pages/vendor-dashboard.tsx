import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Building2, 
  Package, 
  Users, 
  TrendingUp, 
  Star, 
  MessageSquare,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Download,
  Filter,
  Search,
  Crown,
  Check,
  CreditCard,
  X,
  Zap
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { NavigationHeader } from "@/components/NavigationHeader";
import { AdvancedAnalytics } from "@/components/analytics/AdvancedAnalytics";
import { VendorMessaging } from "@/components/messaging/VendorMessaging";

interface VendorProfile {
  id: number;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  website?: string;
  businessType: string;
  description: string;
  serviceAreas: string[];
  planType: 'basic' | 'professional' | 'enterprise';
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  status: string;
  verifiedPartner: boolean;
  monthlyAmount: number;
  createdAt: string;
  updatedAt: string;
  // Legacy fields for compatibility
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  verificationStatus?: string;
  subscriptionTier?: string;
  commissionRate?: string;
  totalLeads?: number;
  totalConversions?: number;
  lifetimeRevenue?: string;
  totalReviews?: number;
  averageRating?: string | null;
  isActive?: boolean;
  services?: VendorService[];
}

interface VendorService {
  id: number;
  vendorId: number;
  categoryId: number;
  serviceName: string;
  description: string;
  pricingModel: string;
  basePrice?: string;
  priceUnit?: string;
  coverageArea: string;
  isActive: boolean;
  averageRating?: string;
  totalBookings: number;
}

interface VendorLead {
  id: number;
  vendorId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceRequested: string;
  urgency: string;
  budget?: string;
  location: string;
  message?: string;
  source: string;
  status: string;
  respondedAt?: string;
  responseTime?: number;
  convertedAt?: string;
  conversionValue?: string;
  commissionAmount?: string;
  commissionPaidAt?: string;
  createdAt: string;
}

interface VendorAnalytics {
  id: number;
  vendorId: number;
  date: string;
  pageViews: number;
  profileClicks: number;
  contactClicks: number;
  leadCount: number;
  conversionCount: number;
  revenue: string;
  averageResponseTime?: number;
  customerSatisfactionScore?: number;
}

export default function VendorDashboard() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [leadFilter, setLeadFilter] = useState("all");
  const [dateRange, setDateRange] = useState("30days");

  // Fetch vendor profile
  const { data: vendorProfile, isLoading: profileLoading } = useQuery<VendorProfile>({
    queryKey: ["/api/vendor/profile"],
    enabled: isAuthenticated,
  });

  // Fetch vendor leads
  const { data: vendorLeads, isLoading: leadsLoading } = useQuery<VendorLead[]>({
    queryKey: ["/api/vendor/leads", leadFilter],
    enabled: isAuthenticated && !!vendorProfile,
  });

  // Fetch vendor analytics
  const today = new Date();
  const startDate = new Date();
  startDate.setDate(today.getDate() - (dateRange === "30days" ? 30 : dateRange === "7days" ? 7 : 90));
  
  const { data: vendorAnalytics, isLoading: analyticsLoading } = useQuery<VendorAnalytics[]>({
    queryKey: ["/api/vendor/analytics", startDate.toISOString(), today.toISOString()],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/vendor/analytics?startDate=${startDate.toISOString()}&endDate=${today.toISOString()}`);
      return response.json();
    },
    enabled: isAuthenticated && !!vendorProfile,
  });

  // Update metrics mutation
  const updateMetricsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/vendor/update-metrics");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/profile"] });
      toast({
        title: "Metrics Updated",
        description: "Your vendor metrics have been refreshed.",
      });
    },
  });

  if (authLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              You need to be signed in to access the vendor dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = "/api/login"} className="w-full">
              Sign In to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!vendorProfile) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>No Vendor Account Found</CardTitle>
            <CardDescription>
              You don't have a vendor account yet. Create one to start receiving leads.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/vendor/signup")} className="w-full">
              Create Vendor Account
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate metrics
  const totalRevenue = vendorAnalytics?.reduce((sum, day) => sum + parseFloat(day.revenue || "0"), 0) || 0;
  const totalLeadsThisPeriod = vendorAnalytics?.reduce((sum, day) => sum + day.leadCount, 0) || 0;
  const totalConversionsThisPeriod = vendorAnalytics?.reduce((sum, day) => sum + day.conversionCount, 0) || 0;
  const conversionRate = totalLeadsThisPeriod > 0 ? (totalConversionsThisPeriod / totalLeadsThisPeriod) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavigationHeader 
        title={vendorProfile.businessName} 
        subtitle="Vendor Dashboard"
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Performance Hero Section */}
        <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white mb-8">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold mb-1">{vendorProfile.totalLeads}</div>
                <div className="text-purple-100 text-sm">Total Leads</div>
                <div className="mt-2 text-xs">
                  <span className="bg-white/20 rounded-full px-2 py-1">+{totalLeadsThisPeriod} this period</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-1">{conversionRate.toFixed(1)}%</div>
                <div className="text-purple-100 text-sm">Conversion Rate</div>
                <Progress value={conversionRate} className="mt-2 h-2 bg-white/30" />
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-1">${totalRevenue.toFixed(0)}</div>
                <div className="text-purple-100 text-sm">Period Revenue</div>
                <div className="mt-2 text-xs">
                  <span className="bg-white/20 rounded-full px-2 py-1">Lifetime: ${vendorProfile.lifetimeRevenue}</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-1">{vendorProfile.averageRating || "N/A"}</div>
                <div className="text-purple-100 text-sm">Average Rating</div>
                <div className="mt-2 text-xs">
                  <span className="bg-white/20 rounded-full px-2 py-1">{vendorProfile.totalReviews} reviews</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-1">{vendorProfile.subscriptionTier}</div>
                <div className="text-purple-100 text-sm">Current Tier</div>
                <div className="mt-2 text-xs">
                  <Badge className="bg-white/20 text-white border-white/30">
                    {vendorProfile.verificationStatus}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Performance Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-green-200 bg-green-50/50 dark:bg-green-900/20 lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                Live Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Active Leads</span>
                  <span className="font-semibold text-green-600">{vendorLeads?.filter(l => l.status === 'pending').length || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Avg Response Time</span>
                  <span className="font-semibold">15 min</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Today's Views</span>
                  <span className="font-semibold">342</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 h-24">
                {Array.from({ length: 7 }, (_, i) => {
                  const height = Math.random() * 100;
                  return (
                    <div key={i} className="flex flex-col items-center justify-end">
                      <div 
                        className="w-full bg-gradient-to-t from-blue-600 to-purple-600 rounded-t"
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-xs text-muted-foreground mt-1">
                        {format(new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000), 'EEE').charAt(0)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Service Performance Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-900/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Active Services</p>
                  <p className="text-xl font-bold text-blue-600">
                    {vendorProfile.services?.filter(s => s.isActive).length || 0}
                  </p>
                </div>
                <Package className="h-6 w-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50/50 dark:bg-purple-900/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Commission Rate</p>
                  <p className="text-xl font-bold text-purple-600">
                    {vendorProfile.commissionRate}
                  </p>
                </div>
                <DollarSign className="h-6 w-6 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50/50 dark:bg-green-900/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Response Rate</p>
                  <p className="text-xl font-bold text-green-600">
                    98<span className="text-sm font-normal">%</span>
                  </p>
                </div>
                <MessageSquare className="h-6 w-6 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-900/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Avg Booking Value</p>
                  <p className="text-xl font-bold text-orange-600">
                    $249
                  </p>
                </div>
                <TrendingUp className="h-6 w-6 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Business Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                  <CardDescription>Your vendor profile details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Description</p>
                    <p className="mt-1">{vendorProfile.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <Phone className="h-3 w-3" /> Phone
                      </p>
                      <p className="mt-1">{vendorProfile.phone || vendorProfile.contactPhone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <Mail className="h-3 w-3" /> Email
                      </p>
                      <p className="mt-1">{vendorProfile.contactEmail}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Address
                    </p>
                    <p className="mt-1">
                      {vendorProfile.address}, {vendorProfile.city}, {vendorProfile.state} {vendorProfile.zipCode}
                    </p>
                  </div>
                  {vendorProfile.website && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Website</p>
                      <a 
                        href={vendorProfile.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-1 text-primary hover:underline"
                      >
                        {vendorProfile.website}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Manage your vendor account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Business Profile
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Service
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Respond to Reviews
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Reports
                  </Button>
                </CardContent>
              </Card>

              {/* Subscription Management */}
              <Card className="col-span-full">
                <CardHeader>
                  <CardTitle>Subscription Management</CardTitle>
                  <CardDescription>Manage your MySeniorValet partnership plan</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Current Plan */}
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-purple-600 rounded-full flex items-center justify-center">
                          <Crown className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg flex items-center gap-2">
                            {vendorProfile.planType ? vendorProfile.planType.charAt(0).toUpperCase() + vendorProfile.planType.slice(1) : vendorProfile.subscriptionTier} Plan
                            {vendorProfile.verifiedPartner && (
                              <Badge className="bg-purple-600 text-white">Verified Partner</Badge>
                            )}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            ${vendorProfile.monthlyAmount || '0'}/month • Active since {vendorProfile.createdAt ? format(new Date(vendorProfile.createdAt), 'MMM d, yyyy') : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                        <Badge className={vendorProfile.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {vendorProfile.status || 'Active'}
                        </Badge>
                      </div>
                    </div>

                    {/* Service Areas */}
                    {vendorProfile.serviceAreas && vendorProfile.serviceAreas.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Service Areas</h4>
                        <div className="flex flex-wrap gap-2">
                          {vendorProfile.serviceAreas.map((area, index) => (
                            <Badge key={index} variant="outline" className="bg-gray-50 dark:bg-gray-800">
                              <MapPin className="h-3 w-3 mr-1" />
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Plan Features */}
                    <div>
                      <h4 className="font-medium mb-3">Your Plan Includes</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {vendorProfile.planType === 'enterprise' ? (
                          <>
                            <div className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-600 mt-0.5" />
                              <span className="text-sm">Premium placement guarantee</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-600 mt-0.5" />
                              <span className="text-sm">Dedicated account manager</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-600 mt-0.5" />
                              <span className="text-sm">Custom branding options</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-600 mt-0.5" />
                              <span className="text-sm">API access for integration</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-600 mt-0.5" />
                              <span className="text-sm">Priority customer support</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-600 mt-0.5" />
                              <span className="text-sm">Unlimited lead notifications</span>
                            </div>
                          </>
                        ) : vendorProfile.planType === 'professional' ? (
                          <>
                            <div className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-600 mt-0.5" />
                              <span className="text-sm">Featured listing with badge</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-600 mt-0.5" />
                              <span className="text-sm">Priority placement in search</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-600 mt-0.5" />
                              <span className="text-sm">Advanced analytics dashboard</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-600 mt-0.5" />
                              <span className="text-sm">Lead notifications</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-600 mt-0.5" />
                              <span className="text-sm">Customer review management</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-600 mt-0.5" />
                              <span className="text-sm">Monthly performance reports</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-600 mt-0.5" />
                              <span className="text-sm">Basic listing on MySeniorValet</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-600 mt-0.5" />
                              <span className="text-sm">Contact information display</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-600 mt-0.5" />
                              <span className="text-sm">Service area coverage</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-600 mt-0.5" />
                              <span className="text-sm">Monthly performance reports</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <Button className="flex-1" variant="outline">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Manage Billing
                      </Button>
                      {vendorProfile.planType !== 'enterprise' && (
                        <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
                          <Zap className="h-4 w-4 mr-2" />
                          Upgrade Plan
                        </Button>
                      )}
                      <Button className="flex-1 text-red-600 hover:text-red-700" variant="outline">
                        <X className="h-4 w-4 mr-2" />
                        Cancel Subscription
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="services" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Your Services</CardTitle>
                    <CardDescription>Manage your service offerings</CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vendorProfile.services.map((service) => (
                    <div
                      key={service.id}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{service.serviceName}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {service.description}
                          </p>
                          <div className="flex items-center gap-4 mt-3">
                            <Badge variant="outline">{service.pricingModel}</Badge>
                            {service.basePrice && (
                              <span className="text-sm">
                                ${service.basePrice} {service.priceUnit && `/ ${service.priceUnit}`}
                              </span>
                            )}
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Coverage: {service.coverageArea}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button size="sm" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leads" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Lead Management</CardTitle>
                    <CardDescription>Track and respond to customer inquiries</CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <Select value={leadFilter} onValueChange={setLeadFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter leads" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Leads</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="converted">Converted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {leadsLoading ? (
                  <div className="text-center py-8">Loading leads...</div>
                ) : vendorLeads && vendorLeads.length > 0 ? (
                  <div className="space-y-4">
                    {vendorLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h4 className="font-semibold">{lead.customerName}</h4>
                              <Badge variant={
                                lead.status === 'new' ? 'default' :
                                lead.status === 'converted' ? 'success' :
                                'secondary'
                              }>
                                {lead.status}
                              </Badge>
                              <Badge variant="outline">
                                {lead.urgency}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              Service: {lead.serviceRequested}
                            </p>
                            {lead.message && (
                              <p className="text-sm mt-2">{lead.message}</p>
                            )}
                            <div className="flex items-center gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {lead.customerPhone}
                              </span>
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {lead.customerEmail}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(lead.createdAt), "MMM d, yyyy")}
                              </span>
                            </div>
                          </div>
                          <Button size="sm" variant="default">
                            <ChevronRight className="h-4 w-4" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No leads found. Check back later!
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Performance Analytics</CardTitle>
                    <CardDescription>Track your business metrics</CardDescription>
                  </div>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7days">Last 7 Days</SelectItem>
                      <SelectItem value="30days">Last 30 Days</SelectItem>
                      <SelectItem value="90days">Last 90 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="text-center py-8">Loading analytics...</div>
                ) : (
                  <div className="space-y-6">
                    {/* Advanced Analytics & Intelligence */}
                    <AdvancedAnalytics timeRange="30d" showExport={true} autoRefresh={false} />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
                <CardDescription>Manage and respond to customer feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Customer reviews feature coming soon!
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="mt-6">
            <VendorMessaging vendorId={vendorProfile.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
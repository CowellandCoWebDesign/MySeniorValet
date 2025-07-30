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
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { NavigationHeader } from "@/components/NavigationHeader";

interface VendorProfile {
  id: number;
  businessName: string;
  description: string;
  contactPhone: string;
  contactEmail: string;
  website?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  verificationStatus: string;
  subscriptionTier: string;
  commissionRate: string;
  totalLeads: number;
  totalConversions: number;
  lifetimeRevenue: string;
  totalReviews: number;
  averageRating: string | null;
  isActive: boolean;
  services: VendorService[];
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
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold">{vendorProfile.totalLeads}</p>
                <Users className="h-8 w-8 text-blue-500 opacity-20" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {totalLeadsThisPeriod} this period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Conversion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold">{conversionRate.toFixed(1)}%</p>
                <TrendingUp className="h-8 w-8 text-green-500 opacity-20" />
              </div>
              <Progress value={conversionRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Revenue This Period
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
                <DollarSign className="h-8 w-8 text-green-500 opacity-20" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                ${vendorProfile.lifetimeRevenue} lifetime
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Average Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold">
                  {vendorProfile.averageRating || "N/A"}
                </p>
                <Star className="h-8 w-8 text-yellow-500 opacity-20" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {vendorProfile.totalReviews} reviews
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
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
                      <p className="mt-1">{vendorProfile.contactPhone}</p>
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
                    {/* Add charts or detailed analytics here */}
                    <div className="text-center py-8 text-gray-500">
                      Detailed analytics charts coming soon!
                    </div>
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
        </Tabs>
      </div>
    </div>
  );
}
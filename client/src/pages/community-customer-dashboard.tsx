import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Building, 
  Users, 
  Calendar,
  MessageSquare,
  BarChart3,
  Settings,
  CreditCard,
  TrendingUp,
  Eye,
  Phone,
  Mail,
  FileText,
  Star,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  UserPlus,
  Activity,
  Target,
  Award,
  Zap,
  Shield,
  Camera,
  Edit,
  Bell,
  Download,
  Upload,
  ChevronRight,
  Home,
  LogOut
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/header";

export default function CommunityCustomerDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch community data for logged-in user
  const { data: communityData, isLoading: communityLoading } = useQuery({
    queryKey: ['/api/community/profile'],
    enabled: !!user?.id,
    queryFn: () => apiRequest('GET', '/api/community/profile')
  });

  // Fetch dashboard metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/community/metrics'],
    enabled: !!user?.id,
    queryFn: () => apiRequest('GET', '/api/community/metrics')
  });

  // Fetch leads
  const { data: leads, isLoading: leadsLoading } = useQuery({
    queryKey: ['/api/community/leads'],
    enabled: !!user?.id,
    queryFn: () => apiRequest('GET', '/api/community/leads')
  });

  // Fetch tours
  const { data: tours, isLoading: toursLoading } = useQuery({
    queryKey: ['/api/community/tours'],
    enabled: !!user?.id,
    queryFn: () => apiRequest('GET', '/api/community/tours')
  });

  // Check authentication
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access your community dashboard",
        variant: "destructive"
      });
      setLocation('/login');
    }
  }, [user, authLoading, setLocation, toast]);

  const isLoading = authLoading || communityLoading || metricsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  const subscriptionTier = communityData?.subscriptionTier || 'free';
  const tierColors = {
    free: 'bg-gray-600',
    verified: 'bg-blue-600',
    standard: 'bg-purple-600',
    featured: 'bg-orange-600',
    platinum: 'bg-gradient-to-r from-purple-600 to-pink-600'
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {communityData?.name || 'Community Partner'}!
              </h1>
              <p className="text-muted-foreground">
                Manage your senior living community listing and connect with families
              </p>
            </div>
            <div className="flex gap-3">
              <Badge className={`${tierColors[subscriptionTier]} text-white px-4 py-2`}>
                {subscriptionTier.toUpperCase()} TIER
              </Badge>
              <Button variant="outline" onClick={() => setLocation('/community-portal')}>
                <Zap className="w-4 h-4 mr-2" />
                Upgrade Plan
              </Button>
              <Button variant="ghost" onClick={() => {
                localStorage.removeItem('token');
                setLocation('/');
              }}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Profile Views</p>
                  <p className="text-2xl font-bold">{metrics?.profileViews || 0}</p>
                  <p className="text-xs text-green-600">+12% this month</p>
                </div>
                <Eye className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Leads</p>
                  <p className="text-2xl font-bold">{metrics?.activeLeads || 0}</p>
                  <p className="text-xs text-blue-600">{metrics?.newLeadsThisWeek || 0} this week</p>
                </div>
                <UserPlus className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tours Scheduled</p>
                  <p className="text-2xl font-bold">{metrics?.toursScheduled || 0}</p>
                  <p className="text-xs text-purple-600">{metrics?.toursThisWeek || 0} this week</p>
                </div>
                <Calendar className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Conversion Rate</p>
                  <p className="text-2xl font-bold">{metrics?.conversionRate || 0}%</p>
                  <p className="text-xs text-orange-600">Industry avg: 8%</p>
                </div>
                <Target className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Response Time</p>
                  <p className="text-2xl font-bold">{metrics?.avgResponseTime || '< 1hr'}</p>
                  <p className="text-xs text-green-600">Excellent</p>
                </div>
                <Clock className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-7 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="tours">Tours</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="marketing">Marketing</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Frequently used tools and features</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="justify-start">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Respond to Leads
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Tours
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Camera className="w-4 h-4 mr-2" />
                    Update Photos
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    View Reports
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest updates and notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">New lead from Sarah Johnson</p>
                      <p className="text-xs text-muted-foreground">Interested in Memory Care - 5 min ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Tour confirmed for tomorrow</p>
                      <p className="text-xs text-muted-foreground">Robert Miller - 2:00 PM - 1 hour ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Profile view milestone reached</p>
                      <p className="text-xs text-muted-foreground">500+ views this month - 3 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Review response needed</p>
                      <p className="text-xs text-muted-foreground">New 5-star review from Mary Chen - 1 day ago</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
                <CardDescription>How your community is performing this month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Profile Completion</span>
                    <span className="text-sm font-medium">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Lead Response Rate</span>
                    <span className="text-sm font-medium">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Tour Conversion</span>
                    <span className="text-sm font-medium">18%</span>
                  </div>
                  <Progress value={18} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Review Score</span>
                    <span className="text-sm font-medium">4.7/5.0</span>
                  </div>
                  <Progress value={94} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Tier Benefits Reminder */}
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Your {subscriptionTier === 'platinum' ? 'Platinum' : subscriptionTier === 'featured' ? 'Featured' : subscriptionTier === 'standard' ? 'Standard' : 'Verified'} Tier Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {subscriptionTier === 'platinum' && (
                    <>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Priority placement in all searches</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Advanced AI marketing tools</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Dedicated account manager</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Unlimited lead management</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Custom reporting & analytics</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">White-glove onboarding</span>
                      </div>
                    </>
                  )}
                  {subscriptionTier === 'featured' && (
                    <>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Featured badge & top placement</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Enhanced marketing tools</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Priority support</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Advanced analytics</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">100 leads per month</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Monthly performance reviews</span>
                      </div>
                    </>
                  )}
                  {subscriptionTier === 'standard' && (
                    <>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Standard listing placement</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Basic marketing tools</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Email support</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Basic analytics</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">50 leads per month</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Quarterly reviews</span>
                      </div>
                    </>
                  )}
                  {subscriptionTier === 'verified' && (
                    <>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Verified badge</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Basic listing</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">25 leads per month</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leads Tab */}
          <TabsContent value="leads" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Lead Management</CardTitle>
                <CardDescription>Track and respond to family inquiries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leads?.length > 0 ? (
                    leads.map((lead: any) => (
                      <div key={lead.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{lead.name}</h4>
                              <Badge variant={lead.status === 'new' ? 'default' : lead.status === 'contacted' ? 'secondary' : 'outline'}>
                                {lead.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {lead.phone}
                              </div>
                              <div className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {lead.email}
                              </div>
                            </div>
                            <p className="text-sm mt-2">{lead.message}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm">
                              <Phone className="w-4 h-4 mr-1" />
                              Call
                            </Button>
                            <Button size="sm" variant="outline">
                              <Mail className="w-4 h-4 mr-1" />
                              Email
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No active leads at the moment</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tours Tab */}
          <TabsContent value="tours" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Tours</CardTitle>
                <CardDescription>Manage upcoming facility tours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tours?.length > 0 ? (
                    tours.map((tour: any) => (
                      <div key={tour.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{tour.visitorName}</h4>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(tour.date).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {tour.time}
                              </div>
                              <Badge variant={tour.status === 'confirmed' ? 'default' : 'secondary'}>
                                {tour.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">Reschedule</Button>
                            <Button size="sm">Send Reminder</Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No tours scheduled</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Community Profile</CardTitle>
                <CardDescription>Manage your listing information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium mb-1">Basic Information</h3>
                      <p className="text-sm text-muted-foreground">Name, address, contact details</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium mb-1">Photos & Virtual Tours</h3>
                      <p className="text-sm text-muted-foreground">12 photos, 1 virtual tour</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Camera className="w-4 h-4 mr-1" />
                      Manage
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium mb-1">Pricing & Availability</h3>
                      <p className="text-sm text-muted-foreground">Last updated 3 days ago</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <DollarSign className="w-4 h-4 mr-1" />
                      Update
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium mb-1">Care Services</h3>
                      <p className="text-sm text-muted-foreground">Assisted Living, Memory Care</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Shield className="w-4 h-4 mr-1" />
                      Manage
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Marketing Tab */}
          <TabsContent value="marketing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Marketing Tools</CardTitle>
                <CardDescription>Promote your community and attract families</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-24 flex-col">
                    <Zap className="w-6 h-6 mb-2" />
                    <span>Run Promotion</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <MessageSquare className="w-6 h-6 mb-2" />
                    <span>Email Campaign</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <Star className="w-6 h-6 mb-2" />
                    <span>Request Reviews</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <FileText className="w-6 h-6 mb-2" />
                    <span>Download Brochure</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
                <CardDescription>Track your community's performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold">{metrics?.monthlyViews || 0}</p>
                      <p className="text-sm text-muted-foreground">Monthly Views</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold">{metrics?.clickThroughRate || '0'}%</p>
                      <p className="text-sm text-muted-foreground">Click Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold">{metrics?.savedCount || 0}</p>
                      <p className="text-sm text-muted-foreground">Saved by Families</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold">{metrics?.avgTimeOnPage || '0:00'}</p>
                      <p className="text-sm text-muted-foreground">Avg. Time on Page</p>
                    </div>
                  </div>
                  <Button className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download Full Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Billing & Subscription</CardTitle>
                <CardDescription>Manage your subscription and payment methods</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">Current Plan: {subscriptionTier.toUpperCase()}</h4>
                        <p className="text-sm text-muted-foreground">
                          Next billing date: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="outline">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Update Payment
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Monthly Cost</span>
                    <span className="font-bold">
                      ${subscriptionTier === 'platinum' ? '999' : 
                         subscriptionTier === 'featured' ? '499' : 
                         subscriptionTier === 'standard' ? '299' : 
                         subscriptionTier === 'verified' ? '99' : '0'}/mo
                    </span>
                  </div>
                  <Button className="w-full" onClick={() => setLocation('/community-portal')}>
                    <Zap className="w-4 h-4 mr-2" />
                    Upgrade Your Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
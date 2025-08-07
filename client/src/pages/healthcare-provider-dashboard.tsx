import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/header";
import { 
  Heart, Building2, Phone, Mail, Globe, MapPin, Users, 
  Shield, Clock, CheckCircle, Star, Gift, Sparkles, Info,
  TrendingUp, Eye, MessageSquare, Calendar, Activity,
  Award, Settings, FileText, BarChart3, DollarSign,
  Target, Zap, Edit, Share2, AlertCircle, Crown
} from "lucide-react";

interface HealthcareProvider {
  id: number;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  website: string | null;
  serviceType: string;
  otherServiceType: string | null;
  description: string;
  services: string[];
  certifications: string[];
  insuranceAccepted: string[];
  serviceAreas: string[];
  states: string[];
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  coordinates: any | null;
  metadata: {
    yearsInBusiness?: number;
    employeeCount?: string;
    languages?: string[];
    emergencyAvailable?: boolean;
    acceptingNewPatients?: boolean;
  };
  createdAt: string;
}

export default function HealthcareProviderDashboard() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Fetch provider data
  const { data: provider, isLoading, error } = useQuery<HealthcareProvider>({
    queryKey: [`/api/healthcare-providers/${id}`],
    enabled: !!id,
  });

  // Mock analytics data (in production, this would come from the backend)
  const analytics = {
    profileViews: 1247,
    inquiries: 23,
    responseRate: 87,
    averageRating: 4.8,
    totalReviews: 12,
    profileCompletion: 85,
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </>
    );
  }

  if (error || !provider) {
    return (
      <>
        <Header />
        <div className="container mx-auto py-8 px-4 max-w-6xl mt-16">
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Unable to load provider information. Please try again later.
            </AlertDescription>
          </Alert>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto py-8 px-4 max-w-7xl mt-16">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-6 mb-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {provider.contactName}!</h1>
              <p className="text-green-100">Healthcare Provider Dashboard - {provider.businessName}</p>
              <div className="flex items-center gap-4 mt-3">
                <Badge className="bg-white/20 text-white border-white/30">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  FREE Listing Active
                </Badge>
                <Badge className="bg-yellow-400/20 text-yellow-100 border-yellow-300/30">
                  <Star className="w-4 h-4 mr-1" />
                  Verified Provider
                </Badge>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="secondary"
                onClick={() => setLocation(`/healthcare-provider-edit/${id}`)}
                className="bg-white text-green-600 hover:bg-gray-100"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              <Button 
                variant="secondary"
                onClick={() => setLocation("/vendor-marketplace-tiers")}
                className="bg-yellow-400 text-gray-900 hover:bg-yellow-300"
              >
                <Zap className="w-4 h-4 mr-2" />
                Upgrade to Premium
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Profile Views</p>
                  <p className="text-2xl font-bold">{analytics.profileViews.toLocaleString()}</p>
                  <p className="text-xs text-green-600 mt-1">+12% this month</p>
                </div>
                <Eye className="w-8 h-8 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Inquiries</p>
                  <p className="text-2xl font-bold">{analytics.inquiries}</p>
                  <p className="text-xs text-green-600 mt-1">3 new this week</p>
                </div>
                <MessageSquare className="w-8 h-8 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Response Rate</p>
                  <p className="text-2xl font-bold">{analytics.responseRate}%</p>
                  <p className="text-xs text-gray-500 mt-1">Above average</p>
                </div>
                <Activity className="w-8 h-8 text-purple-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Rating</p>
                  <p className="text-2xl font-bold">{analytics.averageRating} ⭐</p>
                  <p className="text-xs text-gray-500 mt-1">{analytics.totalReviews} reviews</p>
                </div>
                <Star className="w-8 h-8 text-yellow-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Completion */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    Profile Completion
                  </CardTitle>
                  <CardDescription>Complete your profile to improve visibility</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Overall Completion</span>
                        <span className="text-sm font-bold">{analytics.profileCompletion}%</span>
                      </div>
                      <Progress value={analytics.profileCompletion} className="h-2" />
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Basic Information</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Service Categories</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Service Areas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                        <span>Add photos to your listing</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                        <span>Add certifications</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-600" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Latest interactions with your listing</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 pb-3 border-b">
                      <Eye className="w-4 h-4 text-blue-500 mt-1" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Profile viewed</p>
                        <p className="text-xs text-gray-500">2 minutes ago • Dallas, TX</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 pb-3 border-b">
                      <MessageSquare className="w-4 h-4 text-green-500 mt-1" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">New inquiry received</p>
                        <p className="text-xs text-gray-500">1 hour ago • Fort Worth, TX</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 pb-3 border-b">
                      <Star className="w-4 h-4 text-yellow-500 mt-1" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">New review posted</p>
                        <p className="text-xs text-gray-500">Yesterday • 5 stars</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="w-4 h-4 text-purple-500 mt-1" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Phone number clicked</p>
                        <p className="text-xs text-gray-500">2 days ago • Arlington, TX</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tips & Resources */}
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  Tips to Increase Your Visibility
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <h4 className="font-semibold text-sm mb-2">Complete Your Profile</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Listings with complete profiles receive 3x more inquiries
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <h4 className="font-semibold text-sm mb-2">Respond Quickly</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Providers who respond within 1 hour get 5x more clients
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <h4 className="font-semibold text-sm mb-2">Add Photos</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Listings with photos get 2x more profile views
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>Your healthcare service details as they appear to users</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Business Name</label>
                    <p className="mt-1 text-base">{provider.businessName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Service Type</label>
                    <p className="mt-1 text-base">{provider.serviceType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Contact Name</label>
                    <p className="mt-1 text-base">{provider.contactName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                    <p className="mt-1 text-base">{provider.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                    <p className="mt-1 text-base">{provider.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Website</label>
                    <p className="mt-1 text-base">{provider.website || "Not provided"}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                  <p className="mt-1 text-base">{provider.description}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Services Offered</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {provider.services.map((service, index) => (
                      <Badge key={index} variant="secondary">{service}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Service Areas</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {provider.serviceAreas.map((area, index) => (
                      <Badge key={index} variant="outline">{area}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">States Served</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {provider.states.map((state, index) => (
                      <Badge key={index} className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {state}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={() => setLocation(`/healthcare-provider-edit/${id}`)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile Information
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inquiries Tab */}
          <TabsContent value="inquiries" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Inquiries</CardTitle>
                <CardDescription>Messages from potential clients</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No inquiries yet</p>
                  <p className="text-sm mt-2">Inquiries from families will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
                <CardDescription>Track your listing's performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">This Month's Performance</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Total Views</span>
                        <span className="font-bold">{analytics.profileViews}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Unique Visitors</span>
                        <span className="font-bold">892</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Phone Clicks</span>
                        <span className="font-bold">47</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Website Clicks</span>
                        <span className="font-bold">31</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold">Top Referral Sources</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Map Search</span>
                        <span className="font-bold">45%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Direct Search</span>
                        <span className="font-bold">32%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Category Browse</span>
                        <span className="font-bold">18%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Other</span>
                        <span className="font-bold">5%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-gray-500">Receive email alerts for new inquiries</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Account Status</p>
                    <p className="text-sm text-green-600">Active - FREE Listing</p>
                  </div>
                  <Badge className="bg-green-100 text-green-700">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Member Since</p>
                    <p className="text-sm text-gray-500">{new Date(provider.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upgrade CTA */}
            <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-2 border-yellow-300 dark:border-yellow-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-600" />
                  Upgrade to Premium
                </CardTitle>
                <CardDescription>Get more visibility and premium features</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Priority placement in search results</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Detailed analytics and insights</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Featured provider badge</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Unlimited photo uploads</span>
                  </li>
                </ul>
                <Button 
                  onClick={() => setLocation("/vendor-marketplace-tiers")}
                  className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700"
                >
                  View Premium Plans
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building, 
  Users, 
  BarChart3, 
  Settings,
  Crown,
  CreditCard,
  TrendingUp,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Star,
  Eye,
  MessageSquare,
  Upload,
  DollarSign
} from "lucide-react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { SubscriptionStatusCard } from "@/components/SubscriptionStatusCard";

export default function CommunityDashboardWithSubscriptions() {
  const { id } = useParams<{ id: string }>();
  const communityId = parseInt(id || '1');

  // Fetch community data
  const { data: community, isLoading: communityLoading } = useQuery({
    queryKey: [`/api/communities/${communityId}`],
  });

  // Fetch subscription status
  const { data: subscriptionStatus, isLoading: subscriptionLoading } = useQuery({
    queryKey: [`/api/communities/${communityId}/subscription-status`],
  });

  // Fetch subscription analytics
  const { data: subscriptionAnalytics } = useQuery({
    queryKey: [`/api/communities/${communityId}/subscription-analytics`],
  });

  if (communityLoading || subscriptionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Building className="w-8 h-8 text-blue-600" />
                Community Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {community?.name || 'Loading community...'}
              </p>
            </div>
            <div className="flex gap-3">
              <Link to="/community-portal">
                <Button variant="outline" className="flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  Upgrade Plan
                </Button>
              </Link>
              <Button className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </Button>
            </div>
          </div>

          {/* Subscription Status Card */}
          <SubscriptionStatusCard 
            communityId={communityId} 
            showFullDetails={true}
          />
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Profile Views</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {Math.floor(Math.random() * 500) + 100}
                      </p>
                    </div>
                    <Eye className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="flex items-center mt-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-green-600">+12% this month</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Inquiries</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {Math.floor(Math.random() * 50) + 10}
                      </p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="flex items-center mt-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-green-600">+8% this month</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Tour Requests</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {Math.floor(Math.random() * 25) + 5}
                      </p>
                    </div>
                    <Calendar className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="flex items-center mt-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-green-600">+15% this month</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Rating</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">4.8</p>
                    </div>
                    <Star className="w-8 h-8 text-yellow-600" />
                  </div>
                  <div className="flex items-center mt-2 text-sm">
                    <span className="text-gray-600">Based on 47 reviews</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium">New tour request from Sarah Johnson</p>
                      <p className="text-sm text-gray-600">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium">Profile viewed 23 times today</p>
                      <p className="text-sm text-gray-600">4 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium">New 5-star review posted</p>
                      <p className="text-sm text-gray-600">Yesterday</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Community Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Community Name</label>
                    <p className="p-3 bg-gray-50 dark:bg-gray-800 rounded border">
                      {community?.name || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Address</label>
                    <p className="p-3 bg-gray-50 dark:bg-gray-800 rounded border">
                      {community?.address}, {community?.city}, {community?.state}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <p className="p-3 bg-gray-50 dark:bg-gray-800 rounded border">
                      {community?.phone || 'Not specified'}
                    </p>
                  </div>
                  <Button className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    Update Community Information
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Photo Gallery</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">No photos uploaded</p>
                    </div>
                    <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                      <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Photos
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Profile Views</span>
                      <span className="font-semibold">1,234</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Inquiries Generated</span>
                      <span className="font-semibold">89</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Tour Requests</span>
                      <span className="font-semibold">45</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Conversion Rate</span>
                      <span className="font-semibold text-green-600">7.2%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Estimated Leads Value</span>
                      <span className="font-semibold text-green-600">$12,500</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Subscription Investment</span>
                      <span className="font-semibold">
                        ${subscriptionStatus?.monthlyAmount || 0}/month
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>ROI</span>
                      <span className="font-semibold text-green-600">540%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Current Plan Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Current Plan</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {subscriptionStatus?.planName || 'Free Basic Listing'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Monthly Cost</p>
                      <p className="text-xl font-semibold">
                        ${subscriptionStatus?.monthlyAmount || 0}/month
                      </p>
                    </div>
                    {subscriptionStatus?.currentPeriodEnd && (
                      <div>
                        <p className="text-sm text-gray-600">Next Billing Date</p>
                        <p className="font-medium">
                          {new Date(subscriptionStatus.currentPeriodEnd).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-semibold mb-3">Active Features:</h4>
                    <div className="space-y-2">
                      {subscriptionStatus?.features?.map((feature: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Subscription Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Total Investment</span>
                      <span className="font-semibold">
                        ${subscriptionAnalytics?.totalSpent || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Months Subscribed</span>
                      <span className="font-semibold">
                        {subscriptionAnalytics?.monthsSubscribed || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Plan History</span>
                      <span className="text-sm text-gray-600">
                        {subscriptionAnalytics?.upgradeHistory?.length || 0} changes
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <Link to="/community-portal">
                      <Button className="w-full">
                        <Crown className="w-4 h-4 mr-2" />
                        Upgrade Plan
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Support</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Email Support</p>
                      <p className="text-sm text-gray-600">support@myseniorvalet.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium">Phone Support</p>
                      <p className="text-sm text-gray-600">(555) 123-4567</p>
                    </div>
                  </div>
                  <Button className="w-full">
                    Start Live Chat
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <a href="#" className="block p-3 border rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                    <p className="font-medium">Getting Started Guide</p>
                    <p className="text-sm text-gray-600">Learn how to optimize your community profile</p>
                  </a>
                  <a href="#" className="block p-3 border rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                    <p className="font-medium">Marketing Best Practices</p>
                    <p className="text-sm text-gray-600">Tips to attract more qualified leads</p>
                  </a>
                  <a href="#" className="block p-3 border rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                    <p className="font-medium">Analytics Guide</p>
                    <p className="text-sm text-gray-600">Understanding your performance metrics</p>
                  </a>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
// Enhanced Community Dashboard with Tier-Based Feature Access
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CommunityBillingManager from '@/components/billing/CommunityBillingManager';
import DualSidedCostCalculator from '@/components/billing/DualSidedCostCalculator';
import CareCoordinationManager from '@/components/care/CareCoordinationManager';
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  DollarSign,
  Lock,
  Sparkles,
  Camera,
  Edit,
  FileEdit,
  Brain,
  Home,
  ArrowRight,
  X,
  Clock,
  Globe,
  Heart,
  Receipt,
  Shield
} from "lucide-react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { NavigationHeader } from "@/components/NavigationHeader";
import { PricingHistory } from "@/components/pricing-history";
import { ZoomVirtualTours } from "@/components/integrations/ZoomVirtualTours";
import { LeadTrackingDashboard } from "@/components/integrations/LeadTrackingDashboard";
import { HealthcareIntegrationPanel } from "@/components/integrations/HealthcareIntegrationPanel";
import { WhatsAppBusiness } from "@/components/integrations/WhatsAppBusiness";
import { IntegrationStatusDashboard } from "@/components/integrations/IntegrationStatusDashboard";
import { MedicarePharmacyIntegration } from "@/components/integrations/MedicarePharmacyIntegration";

interface FeatureAccess {
  // Basic Features
  basicListing: boolean;
  contactDisplay: boolean;
  searchVisibility: boolean;
  
  // Featured Spotlight Features
  profileEditing: boolean;
  featuredPlacement: boolean;
  redTagSpecials: boolean;
  photoTools: boolean;
  customForms: boolean;
  basicAnalytics: boolean;
  
  // Premium Tools Features
  brandedIntake: boolean;
  availabilityManagement: boolean;
  tourScheduler: boolean;
  unlimitedPhotos: boolean;
  advancedAnalytics: boolean;
  familyMessaging: boolean;
  prioritySupport: boolean;
  
  // Platinum Partner Features
  homepageFeatured: boolean;
  conciergeService: boolean;
  sponsoredContent: boolean;
  aiAccess: boolean;
  apiIntegration: boolean;
  whiteLabeling: boolean;
  customReporting: boolean;
  dedicatedSuccess: boolean;
  
  // Meta information
  currentTier: 'free' | 'featured' | 'premium' | 'platinum';
  tierName: string;
  monthlyPrice: number;
  upgradeAvailable: boolean;
}

export default function CommunityDashboardEnhanced() {
  const { id } = useParams<{ id: string }>();
  const communityId = parseInt(id || '1');
  const [activeTab, setActiveTab] = useState("overview");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [blockedFeature, setBlockedFeature] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPricing, setIsEditingPricing] = useState(false);
  const { toast } = useToast();

  // Fetch community data
  const { data: community, isLoading: communityLoading } = useQuery({
    queryKey: [`/api/communities/${communityId}`],
  });

  // Fetch feature access based on subscription tier
  const { data: featureAccess, isLoading: featuresLoading } = useQuery<FeatureAccess>({
    queryKey: [`/api/features/communities/${communityId}/features`],
  });

  // Fetch upgrade info
  const { data: upgradeInfo } = useQuery({
    queryKey: [`/api/features/communities/${communityId}/upgrade-info`],
  });

  // Analytics data (only if they have access)
  const { data: analytics } = useQuery({
    queryKey: [`/api/communities/${communityId}/analytics`],
    enabled: featureAccess?.basicAnalytics || false,
  });

  // Handle feature access check
  const checkFeatureAccess = (feature: keyof FeatureAccess, featureName: string) => {
    if (!featureAccess || !featureAccess[feature]) {
      setBlockedFeature(featureName);
      setShowUpgradeModal(true);
      return false;
    }
    return true;
  };

  // Tier badge colors
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'free': return 'bg-gray-100 text-gray-800';
      case 'featured': return 'bg-blue-100 text-blue-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'platinum': return 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (communityLoading || featuresLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header with Tier Display */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Building className="w-8 h-8 text-blue-600" />
                Community Dashboard
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <p className="text-gray-600 dark:text-gray-300">
                  {community?.name || 'Loading community...'}
                </p>
                <Badge className={getTierColor(featureAccess?.currentTier || 'free')}>
                  {featureAccess?.tierName || 'Free Listing'}
                </Badge>
              </div>
            </div>
            <div className="flex gap-3">
              <Link to="/community-portal">
                <Button variant="outline" className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Upgrade to {upgradeInfo?.nextTier || 'Premium'}
                </Button>
              </Link>
              <Button 
                className="flex items-center gap-2"
                onClick={() => setActiveTab('settings')}
              >
                <Settings className="w-4 h-4" />
                Settings
              </Button>
            </div>
          </div>

          {/* Upgrade Banner for Free Tier */}
          {featureAccess?.currentTier === 'free' && (
            <Alert className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <Sparkles className="w-4 h-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>Unlock powerful tools to attract more residents and increase occupancy</span>
                <Link to="/community-portal">
                  <Button size="sm" className="ml-4">
                    See Plans
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-12">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger 
              value="profile"
              className="relative"
              onClick={() => checkFeatureAccess('profileEditing', 'Profile Editing')}
            >
              Profile
              {!featureAccess?.profileEditing && <Lock className="w-3 h-3 ml-1" />}
            </TabsTrigger>
            <TabsTrigger 
              value="analytics"
              className="relative"
              onClick={() => checkFeatureAccess('basicAnalytics', 'Analytics Dashboard')}
            >
              Analytics
              {!featureAccess?.basicAnalytics && <Lock className="w-3 h-3 ml-1" />}
            </TabsTrigger>
            <TabsTrigger 
              value="pricing"
              className="relative"
            >
              <DollarSign className="w-3 h-3 mr-1" />
              Pricing
            </TabsTrigger>
            <TabsTrigger 
              value="messaging"
              className="relative"
              onClick={() => checkFeatureAccess('familyMessaging', 'Family Messaging')}
            >
              Messages
              {!featureAccess?.familyMessaging && <Lock className="w-3 h-3 ml-1" />}
            </TabsTrigger>
            <TabsTrigger 
              value="tours"
              className="relative"
              onClick={() => checkFeatureAccess('tourScheduler', 'Tour Scheduler')}
            >
              Tours
              {!featureAccess?.tourScheduler && <Lock className="w-3 h-3 ml-1" />}
            </TabsTrigger>
            <TabsTrigger 
              value="leads"
              className="relative"
              onClick={() => checkFeatureAccess('leadTracking', 'Lead Tracking')}
            >
              Leads
              {(!featureAccess?.leadTracking && featureAccess?.currentTier !== 'professional' && featureAccess?.currentTier !== 'premium' && featureAccess?.currentTier !== 'platinum') && <Lock className="w-3 h-3 ml-1" />}
            </TabsTrigger>
            <TabsTrigger 
              value="communications"
              className="relative"
              onClick={() => checkFeatureAccess('virtualTours', 'Virtual Tours')}
            >
              Communications
              {(!featureAccess?.virtualTours && featureAccess?.currentTier !== 'professional' && featureAccess?.currentTier !== 'premium' && featureAccess?.currentTier !== 'platinum') && <Lock className="w-3 h-3 ml-1" />}
            </TabsTrigger>
            <TabsTrigger 
              value="healthcare"
              className="relative"
              onClick={() => checkFeatureAccess('healthcareIntegration', 'Healthcare Integration')}
            >
              Healthcare
              {(featureAccess?.currentTier !== 'premium' && featureAccess?.currentTier !== 'platinum') && <Lock className="w-3 h-3 ml-1" />}
            </TabsTrigger>
            <TabsTrigger 
              value="medicare"
              className="relative"
              onClick={() => checkFeatureAccess('medicareIntegration', 'Medicare & Pharmacy')}
            >
              Medicare
              {(featureAccess?.currentTier !== 'professional' && featureAccess?.currentTier !== 'premium' && featureAccess?.currentTier !== 'platinum') && <Lock className="w-3 h-3 ml-1" />}
            </TabsTrigger>
            <TabsTrigger value="care" className="relative">
              <Heart className="w-3 h-3 mr-1" />
              Care
            </TabsTrigger>
            <TabsTrigger value="billing" className="relative">
              <Receipt className="w-3 h-3 mr-1" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Profile Views</p>
                      <p className="text-2xl font-bold">{analytics?.profileViews || '0'}</p>
                      <p className="text-xs text-green-600">+12% from last month</p>
                    </div>
                    <Eye className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tour Requests</p>
                      <p className="text-2xl font-bold">{analytics?.tourRequests || '0'}</p>
                      <p className="text-xs text-green-600">+5% from last month</p>
                    </div>
                    <Calendar className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Messages</p>
                      <p className="text-2xl font-bold">{analytics?.messages || '0'}</p>
                      <p className="text-xs text-blue-600">3 new today</p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Response Time</p>
                      <p className="text-2xl font-bold">2.5h</p>
                      <p className="text-xs text-yellow-600">Industry avg: 4h</p>
                    </div>
                    <Clock className="w-8 h-8 text-orange-600" />
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
                <div className="space-y-3">
                  {[
                    { type: 'tour', message: 'New tour request from Sarah Johnson', time: '2 hours ago', icon: Calendar },
                    { type: 'message', message: 'Family inquiry about memory care services', time: '4 hours ago', icon: MessageSquare },
                    { type: 'view', message: 'Profile viewed 15 times today', time: '6 hours ago', icon: Eye },
                    { type: 'update', message: 'Pricing updated successfully', time: '1 day ago', icon: DollarSign }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <activity.icon className="w-5 h-5 text-gray-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.message}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Management Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Community Profile</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Manage your community information and photos
                  </p>
                </div>
                <Button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  variant={isEditingProfile ? "outline" : "default"}
                >
                  {isEditingProfile ? (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {isEditingProfile ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Community Name</label>
                        <Input
                          defaultValue={community?.name}
                          placeholder="Enter community name"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                          defaultValue={community?.description}
                          placeholder="Describe your community..."
                          rows={4}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Phone Number</label>
                        <Input
                          defaultValue={community?.phone}
                          placeholder="(555) 123-4567"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Email</label>
                        <Input
                          defaultValue={community?.email}
                          placeholder="contact@community.com"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Address</label>
                        <Input
                          defaultValue={community?.address}
                          placeholder="123 Main Street"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">City</label>
                          <Input
                            defaultValue={community?.city}
                            placeholder="City"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">State</label>
                          <Input
                            defaultValue={community?.state}
                            placeholder="State"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Website</label>
                        <Input
                          defaultValue={community?.website}
                          placeholder="https://community.com"
                        />
                      </div>
                      <div className="flex gap-3 pt-4">
                        <Button className="flex-1">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Community Name</p>
                        <p className="text-lg">{community?.name || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Description</p>
                        <p className="text-sm">{community?.description || 'No description available'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span>{community?.phone || 'No phone number'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span>{community?.email || 'No email address'}</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                        <div>
                          <p>{community?.address || 'No address'}</p>
                          <p>{community?.city && community?.state ? `${community.city}, ${community.state}` : ''}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-500" />
                        <span>{community?.website || 'No website'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Photo Management */}
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Photo Gallery</h3>
                    <Button variant="outline" size="sm">
                      <Camera className="w-4 h-4 mr-2" />
                      Add Photos
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((photo) => (
                      <div key={photo} className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        <Camera className="w-8 h-8 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing Management Tab */}
          <TabsContent value="pricing" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Pricing & Availability</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Manage your rates and unit availability
                  </p>
                </div>
                <Button
                  onClick={() => setIsEditingPricing(!isEditingPricing)}
                  variant={isEditingPricing ? "outline" : "default"}
                >
                  {isEditingPricing ? (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      Update Pricing
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                {isEditingPricing ? (
                  <div className="space-y-6">
                    {/* Care Type Pricing */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Care Type Pricing</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { type: 'Independent Living', price: 3500, available: 5 },
                          { type: 'Assisted Living', price: 4200, available: 3 },
                          { type: 'Memory Care', price: 5800, available: 2 },
                          { type: 'Skilled Nursing', price: 6500, available: 1 }
                        ].map((careType) => (
                          <Card key={careType.type} className="p-4">
                            <div className="space-y-3">
                              <h4 className="font-medium">{careType.type}</h4>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="text-xs text-gray-600">Monthly Rate</label>
                                  <Input
                                    type="number"
                                    defaultValue={careType.price}
                                    placeholder="Rate"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-600">Available Units</label>
                                  <Input
                                    type="number"
                                    defaultValue={careType.available}
                                    placeholder="Units"
                                  />
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* Special Pricing */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Special Offers</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Move-in Special</label>
                          <Input placeholder="e.g., First month free" />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Veteran Discount</label>
                          <Input placeholder="e.g., 10% off monthly rate" />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button className="flex-1">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Save Pricing
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditingPricing(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { type: 'Independent Living', price: '$3,500', available: '5 units', color: 'bg-blue-50 border-blue-200' },
                        { type: 'Assisted Living', price: '$4,200', available: '3 units', color: 'bg-green-50 border-green-200' },
                        { type: 'Memory Care', price: '$5,800', available: '2 units', color: 'bg-purple-50 border-purple-200' },
                        { type: 'Skilled Nursing', price: '$6,500', available: '1 unit', color: 'bg-orange-50 border-orange-200' }
                      ].map((careType) => (
                        <Card key={careType.type} className={`${careType.color} border-2`}>
                          <CardContent className="p-4 text-center">
                            <h4 className="font-medium mb-2">{careType.type}</h4>
                            <p className="text-2xl font-bold mb-1">{careType.price}</p>
                            <p className="text-sm text-gray-600">{careType.available}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2">Current Specials</h4>
                        <div className="space-y-2">
                          <p className="text-sm">🎉 First month free for new residents</p>
                          <p className="text-sm">🇺🇸 10% veteran discount available</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pricing History */}
            <PricingHistory communityId={communityId} communityName={community?.name || 'Community'} />
          </TabsContent>

          {/* Analytics Tab - Feature Gated */}
          <TabsContent value="analytics">
            {featureAccess?.basicAnalytics ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Key Metrics */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Eye className="w-5 h-5" />
                            Profile Views
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">{analytics?.profileViews || '243'}</div>
                          <p className="text-sm text-gray-500">This month</p>
                          <div className="mt-2">
                            <Progress value={75} className="h-2" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5" />
                            Inquiries
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">{analytics?.inquiries || '18'}</div>
                          <p className="text-sm text-gray-500">This month</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Tours Scheduled
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">{analytics?.tours || '7'}</div>
                          <p className="text-sm text-gray-500">This month</p>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Analytics Dashboard Locked</h3>
                  <p className="text-gray-600 mb-4">
                    Upgrade to Featured Spotlight to access performance analytics
                  </p>
                  <Link to="/community-portal">
                    <Button>
                      Upgrade Now
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Messages Tab - Feature Gated */}
          <TabsContent value="messaging">
            {featureAccess?.familyMessaging ? (
              <Card>
                <CardHeader>
                  <CardTitle>Family Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Family messaging features available</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Family Messaging Locked</h3>
                  <p className="text-gray-600 mb-4">
                    Upgrade to Premium Tools to connect with families directly
                  </p>
                  <Link to="/community-portal">
                    <Button>
                      Upgrade Now
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tours Tab - Feature Gated */}
          <TabsContent value="tours">
            {featureAccess?.tourScheduler ? (
              <Card>
                <CardHeader>
                  <CardTitle>Tour Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Tour scheduling features available</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Tour Scheduler Locked</h3>
                  <p className="text-gray-600 mb-4">
                    Upgrade to Premium Tools to manage tour bookings efficiently
                  </p>
                  <Link to="/community-portal">
                    <Button>
                      Upgrade Now
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Subscription</h4>
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">{featureAccess?.tierName || 'Free Listing'}</p>
                          <p className="text-sm text-gray-600">
                            ${featureAccess?.monthlyPrice || 0}/month
                          </p>
                        </div>
                        <Link to="/community-portal">
                          <Button variant="outline" size="sm">
                            Change Plan
                          </Button>
                        </Link>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Notifications</h4>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked />
                          <span className="text-sm">Email notifications for new inquiries</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked />
                          <span className="text-sm">Tour booking confirmations</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" />
                          <span className="text-sm">Weekly performance reports</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Leads Tab - Professional+ Tiers */}
          <TabsContent value="leads">
            {(featureAccess?.currentTier === 'professional' || featureAccess?.currentTier === 'premium' || featureAccess?.currentTier === 'platinum') ? (
              <LeadTrackingDashboard 
                communityId={communityId}
                tierLevel={featureAccess.currentTier as 'professional' | 'premium' | 'enterprise'}
              />
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Lead Tracking is a Professional Feature</h3>
                  <p className="text-gray-600 mb-6">
                    Track and manage your leads with our powerful CRM integration
                  </p>
                  <Link to="/community-portal">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade to Professional
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Communications Tab - Professional+ Tiers */}
          <TabsContent value="communications">
            {(featureAccess?.currentTier === 'professional' || featureAccess?.currentTier === 'premium' || featureAccess?.currentTier === 'platinum') ? (
              <Tabs defaultValue="zoom" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="zoom">Zoom Virtual Tours</TabsTrigger>
                  <TabsTrigger value="whatsapp">WhatsApp Business</TabsTrigger>
                </TabsList>
                
                <TabsContent value="zoom">
                  <ZoomVirtualTours 
                    communityId={communityId}
                    tierLevel={featureAccess.currentTier as 'professional' | 'premium' | 'enterprise'}
                  />
                </TabsContent>
                
                <TabsContent value="whatsapp">
                  <WhatsAppBusiness 
                    communityId={communityId}
                    tierLevel={featureAccess.currentTier as 'professional' | 'premium' | 'enterprise'}
                  />
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Communication Tools are Professional Features</h3>
                  <p className="text-gray-600 mb-6">
                    Access Zoom virtual tours and WhatsApp Business messaging
                  </p>
                  <Link to="/community-portal">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade to Professional
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Healthcare Tab - Premium+ Tiers */}
          <TabsContent value="healthcare">
            {(featureAccess?.currentTier === 'premium' || featureAccess?.currentTier === 'platinum') ? (
              <HealthcareIntegrationPanel 
                communityId={communityId}
                tierLevel={featureAccess.currentTier as 'premium' | 'enterprise'}
              />
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Healthcare Integration is a Premium Feature</h3>
                  <p className="text-gray-600 mb-6">
                    Connect to Epic & Cerner for real-time health data access
                  </p>
                  <Link to="/community-portal">
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade to Premium
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Medicare Tab - Professional+ Tiers */}
          <TabsContent value="medicare">
            {(featureAccess?.currentTier === 'professional' || featureAccess?.currentTier === 'premium' || featureAccess?.currentTier === 'platinum') ? (
              <MedicarePharmacyIntegration 
                communityId={communityId}
                tierLevel={featureAccess.currentTier as 'professional' | 'premium' | 'enterprise'}
              />
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Medicare Integration is a Professional Feature</h3>
                  <p className="text-gray-600 mb-6">
                    Connect to Medicare and pharmacy networks for medication management
                  </p>
                  <Link to="/community-portal">
                    <Button className="bg-gradient-to-r from-blue-600 to-cyan-600">
                      <Shield className="w-4 h-4 mr-2" />
                      Upgrade to Professional
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Care Coordination Tab - Available to ALL Paid Tiers */}
          <TabsContent value="care">
            <div className="space-y-6">
              {featureAccess?.currentTier !== 'free' ? (
                <>
                  <CareCoordinationManager 
                    residentId={communityId}
                    viewMode="community"
                    tier={featureAccess?.currentTier || 'featured'}
                  />
                  
                  <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription>
                      <span className="font-semibold">Dual-Sided Care Coordination:</span> All care information is automatically shared with families. They can view health records, medications, appointments, and care plans in real-time through their Family Portal.
                    </AlertDescription>
                  </Alert>
                </>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Heart className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Care Coordination</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Comprehensive care management is available for all paid subscription tiers.
                    </p>
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Upgrade to Featured
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Billing Tab - Available to ALL Paid Tiers */}
          <TabsContent value="billing">
            <div className="space-y-6">
              {/* Show both components for all paid tiers */}
              {featureAccess?.currentTier !== 'free' ? (
                <>
                  <CommunityBillingManager 
                    communityId={communityId} 
                    tier={featureAccess?.currentTier || 'featured'}
                  />
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Cost Calculator Configuration</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Configure how families calculate their estimated costs
                      </p>
                    </CardHeader>
                    <CardContent>
                      <DualSidedCostCalculator 
                        viewMode="community"
                        communityId={communityId}
                        prefilledData={{
                          baseRent: 3500,
                          careLevel: 'assisted',
                          roomType: 'private'
                        }}
                      />
                    </CardContent>
                  </Card>

                  <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription>
                      <span className="font-semibold">Both Sides Active:</span> Your billing management is fully synchronized. Families can view statements, make payments, and calculate costs through their Family Portal while you manage everything here.
                    </AlertDescription>
                  </Alert>
                </>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <DollarSign className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Billing Management</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Professional billing and payment management is available for all paid subscription tiers.
                    </p>
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Upgrade to Featured
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Integrations Tab - All Tiers */}
          <TabsContent value="integrations">
            <IntegrationStatusDashboard 
              communityId={communityId}
              tierLevel={featureAccess?.currentTier as 'starter' | 'growth' | 'professional' | 'premium' | 'enterprise'}
            />
          </TabsContent>

        </Tabs>

        {/* Upgrade Modal */}
        {showUpgradeModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="max-w-md w-full mx-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Upgrade Required</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowUpgradeModal(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {blockedFeature} is a premium feature
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Upgrade to {upgradeInfo?.nextTier} to access this feature and more
                  </p>
                  
                  {upgradeInfo?.nextTierFeatures && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                      <h4 className="font-semibold mb-2">What you'll unlock:</h4>
                      <ul className="space-y-1">
                        {upgradeInfo.nextTierFeatures.slice(0, 5).map((feature: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowUpgradeModal(false)}
                    >
                      Maybe Later
                    </Button>
                    <Link to="/community-portal" className="flex-1">
                      <Button className="w-full">
                        View Plans
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
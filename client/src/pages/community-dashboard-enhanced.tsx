// Enhanced Community Dashboard with Tier-Based Feature Access
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  X
} from "lucide-react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { NavigationHeader } from "@/components/NavigationHeader";
import { PricingHistory } from "@/components/pricing-history";

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
          <TabsList className="grid w-full grid-cols-7">
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
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
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
                  {featureAccess?.currentTier === 'free' && (
                    <Badge variant="secondary" className="mt-2">
                      <Lock className="w-3 h-3 mr-1" />
                      Unlock messaging
                    </Badge>
                  )}
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
                  {!featureAccess?.tourScheduler && (
                    <Badge variant="secondary" className="mt-2">
                      <Lock className="w-3 h-3 mr-1" />
                      Premium feature
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Feature Access Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Your Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Basic Features */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-600">Basic Features</h4>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Basic Listing</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Contact Display</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Search Visibility</span>
                      </div>
                    </div>
                  </div>

                  {/* Featured Tier Features */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-600">Featured Spotlight</h4>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        {featureAccess?.profileEditing ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Lock className="w-4 h-4 text-gray-400" />
                        )}
                        <span className={!featureAccess?.profileEditing ? 'text-gray-400' : ''}>
                          Profile Editing
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {featureAccess?.featuredPlacement ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Lock className="w-4 h-4 text-gray-400" />
                        )}
                        <span className={!featureAccess?.featuredPlacement ? 'text-gray-400' : ''}>
                          Featured Placement
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {featureAccess?.photoTools ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Lock className="w-4 h-4 text-gray-400" />
                        )}
                        <span className={!featureAccess?.photoTools ? 'text-gray-400' : ''}>
                          Photo Gallery
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Premium Features */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-600">Premium Tools</h4>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        {featureAccess?.tourScheduler ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Lock className="w-4 h-4 text-gray-400" />
                        )}
                        <span className={!featureAccess?.tourScheduler ? 'text-gray-400' : ''}>
                          Tour Scheduler
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {featureAccess?.advancedAnalytics ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Lock className="w-4 h-4 text-gray-400" />
                        )}
                        <span className={!featureAccess?.advancedAnalytics ? 'text-gray-400' : ''}>
                          Advanced Analytics
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {featureAccess?.familyMessaging ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Lock className="w-4 h-4 text-gray-400" />
                        )}
                        <span className={!featureAccess?.familyMessaging ? 'text-gray-400' : ''}>
                          Family Messaging
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {featureAccess?.upgradeAvailable && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                    <p className="text-sm font-medium mb-2">
                      Unlock more features with {upgradeInfo?.nextTier}
                    </p>
                    <Link to="/community-portal">
                      <Button size="sm" className="w-full">
                        View Upgrade Options
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab - Feature Gated */}
          <TabsContent value="profile">
            {featureAccess?.profileEditing ? (
              <Card>
                <CardHeader>
                  <CardTitle>Edit Community Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Profile editing form would go here */}
                  <p>Profile editing features available</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Profile Editing Locked</h3>
                  <p className="text-gray-600 mb-4">
                    Upgrade to Featured Spotlight to edit your community profile
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

          {/* Analytics Tab - Feature Gated */}
          <TabsContent value="analytics">
            {featureAccess?.basicAnalytics ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Analytics charts would go here */}
                    <p>Analytics dashboard available</p>
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

          {/* Pricing History Tab */}
          <TabsContent value="pricing">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Pricing History & Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PricingHistory communityId={communityId} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tabs would follow similar pattern */}
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
// Test Page for Tier Access Control
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { 
  Lock, 
  CheckCircle, 
  XCircle,
  BarChart3,
  Camera,
  Calendar,
  Users,
  Home,
  Shield,
  Star,
  Eye,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { NavigationHeader } from "@/components/NavigationHeader";

// Type definitions
interface FeatureAccess {
  basicListing: boolean;
  contactDisplay: boolean;
  searchVisibility: boolean;
  profileEditing: boolean;
  featuredPlacement: boolean;
  redTagSpecials: boolean;
  photoTools: boolean;
  customForms: boolean;
  basicAnalytics: boolean;
  brandedIntake: boolean;
  availabilityManagement: boolean;
  tourScheduler: boolean;
  unlimitedPhotos: boolean;
  advancedAnalytics: boolean;
  familyMessaging: boolean;
  prioritySupport: boolean;
  homepageFeatured: boolean;
  conciergeService: boolean;
  sponsoredContent: boolean;
  aiAccess: boolean;
  apiIntegration: boolean;
  whiteLabeling: boolean;
  customReporting: boolean;
  dedicatedSuccess: boolean;
  currentTier: 'free' | 'featured' | 'premium' | 'platinum';
  tierName: string;
  monthlyPrice: number;
  upgradeAvailable: boolean;
}

interface AnalyticsAccess {
  basicAnalytics: boolean;
  advancedAnalytics: boolean;
  currentAccess: 'none' | 'basic' | 'advanced';
}

// Test communities with different subscription tiers
const testCommunities = [
  { id: 1, name: "Sunset Gardens (Free Tier)", tier: "free" },
  { id: 264, name: "Heritage Hills (Featured)", tier: "featured" },
  { id: 278, name: "Peninsula Del Rey (Premium)", tier: "premium" },
  { id: 358, name: "Atria Senior Living (Platinum)", tier: "platinum" }
];

export default function TestTierAccess() {
  const [selectedCommunityId, setSelectedCommunityId] = useState(1);
  const [testResults, setTestResults] = useState<any[]>([]);
  const { toast } = useToast();

  const selectedCommunity = testCommunities.find(c => c.id === selectedCommunityId);

  // Fetch feature access for selected community
  const { data: featureAccess, isLoading: featuresLoading } = useQuery<FeatureAccess>({
    queryKey: [`/api/features/communities/${selectedCommunityId}/features`],
  });

  // Fetch analytics availability
  const { data: analyticsAccess } = useQuery<AnalyticsAccess>({
    queryKey: [`/api/analytics/communities/${selectedCommunityId}/analytics/available`],
  });

  // Test feature access
  const testFeatureAccess = async (feature: string, featureName: string) => {
    try {
      const response = await fetch(`/api/features/communities/${selectedCommunityId}/features/${feature}`);
      const data = await response.json();
      
      const result = {
        feature: featureName,
        hasAccess: data.hasAccess,
        tier: selectedCommunity?.tier,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setTestResults(prev => [result, ...prev].slice(0, 10));
      
      if (!data.hasAccess) {
        toast({
          title: "Feature Blocked",
          description: `${featureName} requires ${data.requiredTier} tier`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Test failed:', error);
    }
  };

  // Test analytics access
  const testAnalyticsAccess = async () => {
    try {
      const response = await fetch(`/api/analytics/communities/${selectedCommunityId}/analytics`);
      const data = await response.json();
      
      if (data.error) {
        toast({
          title: "Analytics Blocked",
          description: data.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Analytics Access Granted",
          description: `Loaded ${data.advanced ? 'advanced' : 'basic'} analytics`,
        });
      }
      
      const result = {
        feature: "Analytics Dashboard",
        hasAccess: !data.error,
        tier: selectedCommunity?.tier,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setTestResults(prev => [result, ...prev].slice(0, 10));
    } catch (error) {
      console.error('Analytics test failed:', error);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'free': return 'bg-gray-100 text-gray-800';
      case 'featured': return 'bg-blue-100 text-blue-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'platinum': return 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavigationHeader 
        title="Tier Access Control Testing" 
        subtitle="Test how different subscription tiers affect feature access"
      />
      <div className="p-8">
        <div className="max-w-6xl mx-auto space-y-8">

        {/* Community Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Select Test Community</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Select 
                value={selectedCommunityId.toString()} 
                onValueChange={(value) => setSelectedCommunityId(parseInt(value))}
              >
                <SelectTrigger className="w-[300px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {testCommunities.map(community => (
                    <SelectItem key={community.id} value={community.id.toString()}>
                      {community.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCommunity && (
                <Badge className={getTierColor(selectedCommunity.tier)}>
                  {selectedCommunity.tier.toUpperCase()} TIER
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Current Access Status */}
        {featureAccess && (
          <Card>
            <CardHeader>
              <CardTitle>Current Feature Access</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Basic Features</h4>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Basic Listing</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Contact Display</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Featured Tier</h4>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      {featureAccess.profileEditing ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Lock className="w-4 h-4 text-gray-400" />}
                      <span className={!featureAccess.profileEditing ? 'text-gray-400' : ''}>Profile Editing</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {featureAccess.basicAnalytics ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Lock className="w-4 h-4 text-gray-400" />}
                      <span className={!featureAccess.basicAnalytics ? 'text-gray-400' : ''}>Basic Analytics</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Premium Tier</h4>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      {featureAccess.tourScheduler ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Lock className="w-4 h-4 text-gray-400" />}
                      <span className={!featureAccess.tourScheduler ? 'text-gray-400' : ''}>Tour Scheduler</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {featureAccess.advancedAnalytics ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Lock className="w-4 h-4 text-gray-400" />}
                      <span className={!featureAccess.advancedAnalytics ? 'text-gray-400' : ''}>Advanced Analytics</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Platinum Tier</h4>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      {featureAccess.homepageFeatured ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Lock className="w-4 h-4 text-gray-400" />}
                      <span className={!featureAccess.homepageFeatured ? 'text-gray-400' : ''}>Homepage Featured</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {featureAccess.aiAccess ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Lock className="w-4 h-4 text-gray-400" />}
                      <span className={!featureAccess.aiAccess ? 'text-gray-400' : ''}>AI Priority</span>
                    </div>
                  </div>
                </div>
              </div>

              {analyticsAccess && (
                <Alert className="mt-4">
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>
                    Analytics Access: {analyticsAccess.currentAccess === 'none' ? 'BLOCKED' : analyticsAccess.currentAccess.toUpperCase()}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Feature Test Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Test Feature Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Button 
                onClick={() => testFeatureAccess('profileEditing', 'Profile Editing')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Test Profile Editing
              </Button>
              
              <Button 
                onClick={() => testAnalyticsAccess()}
                variant="outline"
                className="flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Test Analytics
              </Button>
              
              <Button 
                onClick={() => testFeatureAccess('tourScheduler', 'Tour Scheduler')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Test Tour Scheduler
              </Button>
              
              <Button 
                onClick={() => testFeatureAccess('familyMessaging', 'Family Messaging')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Test Messaging
              </Button>
              
              <Button 
                onClick={() => testFeatureAccess('homepageFeatured', 'Homepage Featured')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Test Homepage Feature
              </Button>
              
              <Button 
                onClick={() => testFeatureAccess('aiAccess', 'AI Priority Access')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Test AI Access
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Results Log */}
        <Card>
          <CardHeader>
            <CardTitle>Test Results Log</CardTitle>
          </CardHeader>
          <CardContent>
            {testResults.length === 0 ? (
              <p className="text-gray-500">No tests run yet. Click buttons above to test feature access.</p>
            ) : (
              <div className="space-y-2">
                {testResults.map((result, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      {result.hasAccess ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span className="font-medium">{result.feature}</span>
                      <Badge className={getTierColor(result.tier)} variant="secondary">
                        {result.tier}
                      </Badge>
                    </div>
                    <span className="text-sm text-gray-500">{result.timestamp}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShoppingBag,
  Crown,
  Building2,
  Users,
  BarChart3,
  MessageSquare,
  Eye,
  Clock,
  Shield,
  Star,
  ChevronRight,
  Lock,
  Sparkles,
  CheckCircle,
  TrendingUp,
  PhoneCall,
  Globe,
  Briefcase,
  Home,
  Gift
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/header";

interface VendorTier {
  name: string;
  price: number;
  features: {
    listingVisible: boolean;
    regionalCoverage: number; // -1 for unlimited, else number of regions
    leadGeneration: number;
    featuredPlacement: boolean;
    prioritySupport: boolean;
    analyticsAccess: string;
    profileCustomization: string;
    productListings: number;
    monthlyClicks: number;
    responseTime: string;
    verifiedBadge: boolean;
    promotionalOffers: number;
    userReviews: boolean;
    affiliateTracking: boolean;
    photos: boolean;
    callToAction: boolean;
    logo: boolean;
    featuredCarousel?: boolean;
    bannerRotation?: boolean;
    dedicatedProfilePage?: boolean;
    apiLeadPassback?: boolean;
    quarterlyReport?: boolean;
    topConciergeMatch?: boolean;
    exclusiveCategory?: boolean;
    coBranding?: boolean;
    revenueShare?: boolean;
    crossPlatformPlacement?: boolean;
    dedicatedAccountManager?: boolean;
    apiAccess?: boolean;
    customIntegrations?: boolean;
  };
}

// Add free tier to vendor tiers
const freeTier: VendorTier = {
  name: "Free Starter",
  price: 0,
  features: {
    listingVisible: true,
    regionalCoverage: 1, // Limited to 1 zip code
    leadGeneration: 5, // Limited leads per month
    featuredPlacement: false,
    prioritySupport: false,
    analyticsAccess: 'none',
    profileCustomization: 'basic',
    productListings: 1,
    monthlyClicks: 50,
    responseTime: '48-72 hours',
    verifiedBadge: false,
    promotionalOffers: 0,
    userReviews: true,
    affiliateTracking: false,
    photos: false,
    callToAction: false,
    logo: false
  }
};

export default function VendorMarketplaceTiers() {
  const [selectedTier, setSelectedTier] = useState<string>('featured');
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Fetch vendor tiers
  const { data: vendorTiers, isLoading } = useQuery<Record<string, VendorTier>>({
    queryKey: ['/api/vendor-subscription/tiers'],
  });

  const tierColors = {
    free: "border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-400",
    basic: "border-gray-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-600",
    featured: "border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500 dark:border-blue-400",
    national: "border-purple-500 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-400",
    enterprise: "border-amber-500 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-400"
  };

  const tierIcons = {
    free: <Gift className="w-8 h-8 text-green-600" />,
    basic: <ShoppingBag className="w-8 h-8 text-gray-600" />,
    featured: <Star className="w-8 h-8 text-blue-600" />,
    national: <Globe className="w-8 h-8 text-purple-600" />,
    enterprise: <Crown className="w-8 h-8 text-amber-600" />
  };

  const handleUpgrade = async (tier: string) => {
    try {
      // Show upgrade flow
      toast({
        title: "Contact Sales",
        description: `To upgrade to ${allTiers[tier as keyof typeof allTiers]?.name} tier, please contact our sales team.`,
      });
      
      // Redirect to contact sales page
      setTimeout(() => {
        setLocation('/contact-sales');
      }, 1500);
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading || !vendorTiers) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Merge free tier with fetched vendor tiers
  const allTiers = { free: freeTier, ...vendorTiers };

  return (
    <>
      <Header />
      <div className="container mx-auto py-8 px-4 max-w-7xl mt-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Vendor Marketplace Portal</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Join thousands of senior care providers reaching families nationwide
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400 mt-2">
            Start with our free listing or upgrade to reach more families
          </p>
        </div>

      {/* Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
        {Object.entries(allTiers).map(([key, tier]) => 
          tier && tier.features ? (
          <Card 
            key={key}
            className={`relative overflow-hidden transition-all cursor-pointer hover:shadow-lg ${
              selectedTier === key ? tierColors[key as keyof typeof tierColors] : 'bg-white dark:bg-gray-800'
            }`}
            onClick={() => setSelectedTier(key)}
          >
            {key === 'free' && (
              <div className="absolute top-0 right-0 bg-green-600 text-white px-3 py-1 text-sm rounded-bl-lg">
                NEW!
              </div>
            )}
            {key === 'featured' && (
              <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 text-sm rounded-bl-lg">
                Most Popular
              </div>
            )}
            
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-3">
                {tierIcons[key as keyof typeof tierIcons]}
              </div>
              <CardTitle className="text-xl text-gray-900 dark:text-gray-100">{tier.name}</CardTitle>
              <div className="mt-4">
                <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {tier.price === 0 ? 'Free' : `$${tier.price}`}
                </span>
                {tier.price > 0 && <span className="text-gray-600 dark:text-gray-400">/month</span>}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="space-y-2">
                {/* Tier-specific Features */}
                {key === 'free' && (
                  <>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">1 zip code coverage</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Basic public listing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">5 leads per month</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">No branding or photos</span>
                    </div>
                  </>
                )}
                
                {key === 'basic' && (
                  <>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">1 regional zip cluster</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Name, phone, category, description</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Affiliate tracking ID integration</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">No photos or branding</span>
                    </div>
                  </>
                )}
                
                {key === 'featured' && (
                  <>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Up to 5 regional areas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Custom logo & branding</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Basic analytics dashboard</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Featured placement</span>
                    </div>
                  </>
                )}
                
                {key === 'national' && (
                  <>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Nationwide coverage</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Banner rotation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Dedicated vendor page</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Quarterly performance reports</span>
                    </div>
                  </>
                )}
                
                {key === 'enterprise' && (
                  <>
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Exclusive category access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Co-branded integrations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Revenue share options</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Cross-platform placement</span>
                    </div>
                  </>
                )}
                
                {/* Verified Badge */}
                {key === 'basic' && (
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">$25 verification badge add-on</span>
                  </div>
                )}
                
                {(key === 'featured' || key === 'national' || key === 'enterprise') && (
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">MySeniorValet Approved badge</span>
                  </div>
                )}
              </div>
              
              <Button 
                className="w-full mt-4"
                variant={selectedTier === key ? "default" : "outline"}
                onClick={(e) => {
                  e.stopPropagation();
                  if (key === 'free') {
                    setLocation('/vendor-signup');
                  } else {
                    handleUpgrade(key);
                  }
                }}
              >
                {key === 'free' ? 'Start Free' : key === 'basic' ? 'Get Started' : 'Upgrade Now'}
              </Button>
            </CardContent>
          </Card>
          ) : null
        )}
      </div>

      {/* Detailed Feature Comparison */}
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-900 dark:text-gray-100">Detailed Feature Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-900 dark:text-gray-100">Feature</th>
                  <th className="text-center py-3 px-4 text-gray-900 dark:text-gray-100">Free</th>
                  <th className="text-center py-3 px-4 text-gray-900 dark:text-gray-100">Basic</th>
                  <th className="text-center py-3 px-4 text-gray-900 dark:text-gray-100">Featured</th>
                  <th className="text-center py-3 px-4 text-gray-900 dark:text-gray-100">National</th>
                  <th className="text-center py-3 px-4 text-gray-900 dark:text-gray-100">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Monthly Price</td>
                  <td className="text-center py-3 px-4 font-bold text-gray-900 dark:text-gray-100">Free</td>
                  <td className="text-center py-3 px-4 font-bold text-gray-900 dark:text-gray-100">$99</td>
                  <td className="text-center py-3 px-4 font-bold text-gray-900 dark:text-gray-100">$249</td>
                  <td className="text-center py-3 px-4 font-bold text-gray-900 dark:text-gray-100">$499</td>
                  <td className="text-center py-3 px-4 font-bold text-gray-900 dark:text-gray-100">$999+</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Regional Coverage</td>
                  <td className="text-center py-3 px-4 text-gray-700 dark:text-gray-300">1 zip code</td>
                  <td className="text-center py-3 px-4 text-gray-700 dark:text-gray-300">1 zip cluster</td>
                  <td className="text-center py-3 px-4 text-gray-700 dark:text-gray-300">Up to 5 regions</td>
                  <td className="text-center py-3 px-4 text-gray-700 dark:text-gray-300">Nationwide</td>
                  <td className="text-center py-3 px-4 text-gray-700 dark:text-gray-300">Custom/Exclusive</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Featured Placement</td>
                  <td className="text-center py-3 px-4">
                    <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500 inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500 inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 inline" />
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Photos & Branding</td>
                  <td className="text-center py-3 px-4">
                    <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500 inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500 inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle className="w-4 h-4 text-green-600 inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle className="w-4 h-4 text-green-600 inline" />
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Analytics Dashboard</td>
                  <td className="text-center py-3 px-4 text-gray-700 dark:text-gray-300">None</td>
                  <td className="text-center py-3 px-4 text-gray-700 dark:text-gray-300">None</td>
                  <td className="text-center py-3 px-4 text-gray-700 dark:text-gray-300">Basic</td>
                  <td className="text-center py-3 px-4 text-gray-700 dark:text-gray-300">Advanced</td>
                  <td className="text-center py-3 px-4 text-gray-700 dark:text-gray-300">Enterprise</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Verified Badge</td>
                  <td className="text-center py-3 px-4">
                    <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500 inline" />
                  </td>
                  <td className="text-center py-3 px-4 text-gray-700 dark:text-gray-300">$25 add-on</td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 inline" />
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Banner Rotation</td>
                  <td className="text-center py-3 px-4">
                    <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500 inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500 inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500 inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 inline" />
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Dedicated Vendor Page</td>
                  <td className="text-center py-3 px-4">
                    <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500 inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500 inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500 inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 inline" />
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Exclusive Category Access</td>
                  <td className="text-center py-3 px-4">
                    <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500 inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500 inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500 inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500 inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 inline" />
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Co-branded Integrations</td>
                  <td className="text-center py-3 px-4">
                    <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500 inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500 inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500 inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500 inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 inline" />
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Revenue Share Options</td>
                  <td className="text-center py-3 px-4">
                    <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500 inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500 inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500 inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500 inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle className="w-4 h-4 text-green-600 inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle className="w-4 h-4 text-green-600 inline" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Affiliate Tracking</td>
                  <td className="text-center py-3 px-4">Optional</td>
                  <td className="text-center py-3 px-4">Required</td>
                  <td className="text-center py-3 px-4">Required</td>
                  <td className="text-center py-3 px-4">Required</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Dedicated Profile Page</td>
                  <td className="text-center py-3 px-4">
                    <Lock className="w-4 h-4 text-gray-400 inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <Lock className="w-4 h-4 text-gray-400 inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle className="w-4 h-4 text-green-600 inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle className="w-4 h-4 text-green-600 inline" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">API/CSV Lead Passback</td>
                  <td className="text-center py-3 px-4">
                    <Lock className="w-4 h-4 text-gray-400 inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <Lock className="w-4 h-4 text-gray-400 inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle className="w-4 h-4 text-green-600 inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle className="w-4 h-4 text-green-600 inline" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Quarterly Reports</td>
                  <td className="text-center py-3 px-4">
                    <Lock className="w-4 h-4 text-gray-400 inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <Lock className="w-4 h-4 text-gray-400 inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle className="w-4 h-4 text-green-600 inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle className="w-4 h-4 text-green-600 inline" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Exclusive Category Access</td>
                  <td className="text-center py-3 px-4">
                    <Lock className="w-4 h-4 text-gray-400 inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <Lock className="w-4 h-4 text-gray-400 inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <Lock className="w-4 h-4 text-gray-400 inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle className="w-4 h-4 text-green-600 inline" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <div className="mt-12 text-center">
        <Card className="max-w-2xl mx-auto bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="py-8">
            <h2 className="text-2xl font-bold mb-4">Ready to Grow Your Business?</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Join thousands of vendors who trust MySeniorValet to connect with families seeking senior care services
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" onClick={() => setLocation('/vendor-signup')}>
                <Sparkles className="w-4 h-4 mr-2" />
                Start Free Trial
              </Button>
              <Button size="lg" variant="outline" onClick={() => setLocation('/contact-sales')}>
                <PhoneCall className="w-4 h-4 mr-2" />
                Contact Sales
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}
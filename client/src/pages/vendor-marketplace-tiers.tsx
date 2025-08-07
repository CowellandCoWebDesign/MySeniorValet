import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShoppingBag,
  Crown,
  Building2,
  Users,
  User,
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
  Gift,
  FileText,
  Building,
  DollarSign,
  Zap,
  X,
  Info,
  Heart
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
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

// No free tier for vendors

export default function VendorMarketplaceTiers() {
  const [selectedTier, setSelectedTier] = useState<string>('featured');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Check if this is an upgrade flow for existing vendor
  const [existingVendorData, setExistingVendorData] = useState<any>(null);
  
  useEffect(() => {
    const storedData = sessionStorage.getItem('vendorUpgradeData');
    if (storedData) {
      const data = JSON.parse(storedData);
      setExistingVendorData(data);
      // Pre-select the next tier up from their current tier
      if (data.currentTier === 'basic') setSelectedTier('featured');
      else if (data.currentTier === 'featured') setSelectedTier('national');
    }
  }, []);

  // Fetch vendor tiers
  const { data: vendorTiers, isLoading } = useQuery<Record<string, VendorTier>>({
    queryKey: ['/api/vendor-subscription/tiers'],
  });

  const tierColors = {
    basic: "border-gray-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-600",
    featured: "border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500 dark:border-blue-400",
    national: "border-purple-500 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-400"
  };

  const tierIcons = {
    basic: <ShoppingBag className="w-8 h-8 text-gray-600" />,
    featured: <Star className="w-8 h-8 text-blue-600" />,
    national: <Globe className="w-8 h-8 text-purple-600" />
  };

  const handleUpgrade = async (tier: string) => {
    try {
      const tierInfo = allTiers[tier as keyof typeof allTiers];
      if (!tierInfo) {
        throw new Error('Invalid tier selected');
      }

      // Check if this is an existing vendor upgrading
      if (existingVendorData && !existingVendorData.isNewVendor) {
        // Map tier names to product IDs
        const productIdMap: Record<string, string> = {
          'basic': 'basic-vendor',
          'featured': 'featured-vendor',
          'national': 'national-partner'
        };
        
        const productId = productIdMap[tier];
        if (!productId) {
          throw new Error('Invalid tier selected');
        }
        
        // Store upgrade data for payment page
        sessionStorage.setItem('vendorUpgradeData', JSON.stringify({
          ...existingVendorData,
          productId,
          selectedTier: tier,
          tierName: tierInfo.name,
          price: tierInfo.price
        }));
        
        toast({
          title: "Upgrading Your Plan",
          description: `Redirecting to secure payment for ${tierInfo.name}...`,
        });
        
        // Go directly to payment for existing vendors
        setTimeout(() => {
          setLocation(`/vendor-mobile-payment/${productId}`);
        }, 500);
      } else {
        // New vendors go through signup flow
        localStorage.setItem('selectedVendorTier', tier);
        localStorage.setItem('selectedVendorPrice', tierInfo.price.toString());
        
        toast({
          title: "Let's Get Started!",
          description: `Setting up your ${tierInfo.name} vendor account...`,
        });
        
        setTimeout(() => {
          setLocation('/vendor-signup');
        }, 1000);
      }
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

  // Only use fetched vendor tiers (no free tier)
  const allTiers = vendorTiers;

  return (
    <>
      <Header />
      <div className="container mx-auto py-8 px-4 max-w-7xl mt-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <Badge className="px-4 py-2 text-base bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
              Welcome to Our Partner Community! 🤝
            </Badge>
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Join MySeniorValet's Commercial Vendor Marketplace
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-8">
            Connect your business with 34,000+ senior living communities and millions of families 
            seeking trusted commercial services and products
          </p>
          
          {/* Compact Promotional Offers - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full px-4 py-2 sm:px-5 sm:py-2.5 shadow-lg flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="font-semibold text-sm sm:text-base">Limited Time: First month 50% off!</span>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full px-4 py-2 sm:px-5 sm:py-2.5 shadow-lg flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="font-semibold text-sm sm:text-base">Save 20% with annual billing!</span>
            </div>
          </div>
          {/* Enhanced Healthcare Directory Link */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-5 max-w-4xl mx-auto mb-6 border border-blue-200 dark:border-blue-800">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Healthcare Providers</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Home health, hospice & therapy services
                  </p>
                </div>
              </div>
              <Link 
                to="/care-services" 
                className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 px-5 py-2.5 rounded-lg border-2 border-blue-400 dark:border-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all hover:scale-105 group"
              >
                <Heart className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:animate-pulse" />
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  Free Healthcare Directory
                </span>
                <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </Link>
            </div>
          </div>
          
          {/* Service Categories */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-5xl mx-auto mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Commercial Service Categories We're Seeking:
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 italic">
              (Healthcare providers like home health, hospice, and therapy belong in our free Healthcare and Care Services Directory)
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
              <div className="flex items-start gap-2">
                <ShoppingBag className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Pharmacy & Medical</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Medication delivery, medical supplies, DME equipment</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Home className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Moving & Transition</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Senior move managers, downsizing, estate services</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Users className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Professional Services</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Elder law, financial planning, insurance advisors</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Star className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Home Care & Support</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">In-home care, hospice, therapy services</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left mt-4">
              <div className="flex items-start gap-2">
                <Gift className="w-5 h-5 text-pink-600 dark:text-pink-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Daily Living</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Meal delivery, grocery services, transportation</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Safety & Security</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Medical alerts, home monitoring, fall prevention</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Building className="w-5 h-5 text-teal-600 dark:text-teal-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Property Services</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Real estate, home modifications, maintenance</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Sparkles className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Lifestyle & Wellness</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Activities, education, social engagement</p>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-3xl mx-auto">
            Whether you're a local provider or national brand, we have a partnership tier designed to help you reach 
            the right families at the right time with the right message
          </p>
          
          {/* Ideal Partner Profile */}
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 max-w-4xl mx-auto mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center justify-center gap-2">
              <Crown className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Our Ideal Partners
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">✓ You're Passionate About Senior Care</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Your business exists to improve the lives of seniors and their families - profit is important, but purpose drives you
                </p>
                <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">✓ You Deliver Exceptional Service</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  You have verifiable references, proper licensing/insurance, and a track record of going above and beyond
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">✓ You're Ready to Grow</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Whether expanding locally or nationally, you have the capacity to handle increased demand professionally
                </p>
                <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">✓ You Value Transparency</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You believe in honest pricing, clear communication, and building trust through authentic relationships
                </p>
              </div>
            </div>
          </div>
        </div>

      {/* Detailed Feature Comparison - Mobile Optimized */}
      <Card className="bg-white dark:bg-gray-800 mb-12 border-2 border-purple-100 dark:border-purple-900/30">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
          <CardTitle className="text-xl md:text-2xl text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Gift className="w-5 h-5 md:w-6 md:h-6 text-purple-600 dark:text-purple-400" />
            Partnership Benefits at a Glance
          </CardTitle>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-2">
            Compare all features across our tiers
          </p>
        </CardHeader>
        <CardContent className="p-0 md:p-6">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <th className="text-left py-3 px-3 md:py-4 md:px-6 text-gray-900 dark:text-gray-100 font-semibold text-sm md:text-base">Feature</th>
                  <th className="text-center py-3 px-3 md:py-4 md:px-6">
                    <div className="text-gray-900 dark:text-gray-100 font-semibold text-sm md:text-base">Basic</div>
                    <div className="text-lg md:text-2xl font-bold text-gray-700 dark:text-gray-300 mt-1">$99</div>
                  </th>
                  <th className="text-center py-3 px-3 md:py-4 md:px-6 relative">
                    <div className="absolute top-0 right-0 bg-blue-600 text-white px-1 py-0.5 text-xs rounded-bl-lg">Popular</div>
                    <div className="text-gray-900 dark:text-gray-100 font-semibold text-sm md:text-base">Featured</div>
                    <div className="text-lg md:text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">$249</div>
                  </th>
                  <th className="text-center py-3 px-3 md:py-4 md:px-6">
                    <div className="text-gray-900 dark:text-gray-100 font-semibold text-sm md:text-base">National</div>
                    <div className="text-lg md:text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">$499</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Coverage & Visibility */}
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                  <td colSpan={4} className="py-2 px-3 md:py-3 md:px-6 font-semibold text-gray-900 dark:text-gray-100 text-xs md:text-sm uppercase tracking-wider">
                    Coverage & Visibility
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 px-3 md:py-4 md:px-6 font-medium text-gray-900 dark:text-gray-100 text-sm md:text-base">Geographic Coverage</td>
                  <td className="text-center py-3 px-3 md:py-4 md:px-6 text-gray-700 dark:text-gray-300">
                    <div className="font-medium text-sm md:text-base">1 State</div>
                    <div className="text-xs text-gray-500 hidden md:block">Full state coverage</div>
                  </td>
                  <td className="text-center py-3 px-3 md:py-4 md:px-6 text-gray-700 dark:text-gray-300">
                    <div className="font-medium text-sm md:text-base">3 States</div>
                    <div className="text-xs text-gray-500 hidden md:block">Multi-state coverage</div>
                  </td>
                  <td className="text-center py-3 px-3 md:py-4 md:px-6 text-gray-700 dark:text-gray-300">
                    <div className="font-medium text-purple-600 dark:text-purple-400 text-sm md:text-base">Nationwide</div>
                    <div className="text-xs text-gray-500 hidden md:block">US & Canada</div>
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 px-3 md:py-4 md:px-6 font-medium text-gray-900 dark:text-gray-100 text-sm md:text-base">Placement Priority</td>
                  <td className="text-center py-3 px-3 md:py-4 md:px-6">
                    <X className="w-4 h-4 md:w-5 md:h-5 text-gray-400 dark:text-gray-500 inline" />
                    <div className="text-xs text-gray-500 hidden md:block">Basic listing only</div>
                  </td>
                  <td className="text-center py-3 px-3 md:py-4 md:px-6">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600 dark:text-green-400 inline" />
                    <div className="text-xs text-green-600 hidden md:block">Featured placement</div>
                  </td>
                  <td className="text-center py-3 px-3 md:py-4 md:px-6">
                    <Star className="w-4 h-4 md:w-5 md:h-5 text-purple-600 dark:text-purple-400 inline" />
                    <div className="text-xs text-purple-600 hidden md:block">Banner rotation + priority</div>
                  </td>
                </tr>
                
                {/* Branding & Profile */}
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                  <td colSpan={4} className="py-2 px-3 md:py-3 md:px-6 font-semibold text-gray-900 dark:text-gray-100 text-xs md:text-sm uppercase tracking-wider">
                    Branding & Profile
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 px-3 md:py-4 md:px-6 font-medium text-gray-900 dark:text-gray-100 text-sm md:text-base">Logo & Brand Colors</td>
                  <td className="text-center py-3 px-3 md:py-4 md:px-6">
                    <X className="w-4 h-4 md:w-5 md:h-5 text-gray-400 dark:text-gray-500 inline" />
                    <div className="text-xs text-gray-500 hidden md:block">No logo</div>
                  </td>
                  <td className="text-center py-3 px-3 md:py-4 md:px-6">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600 dark:text-green-400 inline" />
                    <div className="text-xs text-green-600 hidden md:block">Logo + brand colors</div>
                  </td>
                  <td className="text-center py-3 px-3 md:py-4 md:px-6">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600 dark:text-green-400 inline" />
                    <div className="text-xs text-green-600 hidden md:block">Full branding</div>
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 px-3 md:py-4 md:px-6 font-medium text-gray-900 dark:text-gray-100 text-sm md:text-base">Verified Badge</td>
                  <td className="text-center py-3 px-3 md:py-4 md:px-6">
                    <span className="text-gray-700 dark:text-gray-300 text-xs md:text-sm">$25 add-on</span>
                  </td>
                  <td className="text-center py-3 px-3 md:py-4 md:px-6">
                    <Shield className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400 inline" />
                    <div className="text-xs text-blue-600 hidden md:block">Included (w/ affiliate link)</div>
                  </td>
                  <td className="text-center py-3 px-3 md:py-4 md:px-6">
                    <Shield className="w-4 h-4 md:w-5 md:h-5 text-purple-600 dark:text-purple-400 inline" />
                    <div className="text-xs text-purple-600 hidden md:block">Premium verified</div>
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 px-3 md:py-4 md:px-6 font-medium text-gray-900 dark:text-gray-100 text-sm md:text-base">Dedicated Profile Page</td>
                  <td className="text-center py-3 px-3 md:py-4 md:px-6">
                    <X className="w-4 h-4 md:w-5 md:h-5 text-gray-400 dark:text-gray-500 inline" />
                  </td>
                  <td className="text-center py-3 px-3 md:py-4 md:px-6">
                    <X className="w-4 h-4 md:w-5 md:h-5 text-gray-400 dark:text-gray-500 inline" />
                  </td>
                  <td className="text-center py-3 px-3 md:py-4 md:px-6">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600 dark:text-green-400 inline" />
                    <div className="text-xs text-green-600 hidden md:block">Vendor microsite</div>
                  </td>
                </tr>
                
                {/* Analytics & Insights */}
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                  <td colSpan={4} className="py-2 px-3 md:py-3 md:px-6 font-semibold text-gray-900 dark:text-gray-100 text-xs md:text-sm uppercase tracking-wider">
                    Analytics & Insights
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 px-3 md:py-4 md:px-6 font-medium text-gray-900 dark:text-gray-100 text-sm md:text-base">Analytics Access</td>
                  <td className="text-center py-3 px-3 md:py-4 md:px-6">
                    <X className="w-4 h-4 md:w-5 md:h-5 text-gray-400 dark:text-gray-500 inline" />
                    <div className="text-xs text-gray-500 hidden md:block">No analytics</div>
                  </td>
                  <td className="text-center py-3 px-3 md:py-4 md:px-6">
                    <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400 inline" />
                    <div className="text-xs text-blue-600 hidden md:block">Basic analytics</div>
                  </td>
                  <td className="text-center py-3 px-3 md:py-4 md:px-6">
                    <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-purple-600 dark:text-purple-400 inline" />
                    <div className="text-xs text-purple-600 hidden md:block">AI-powered insights</div>
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 px-3 md:py-4 md:px-6 font-medium text-gray-900 dark:text-gray-100 text-sm md:text-base">Performance Reports</td>
                  <td className="text-center py-3 px-3 md:py-4 md:px-6">
                    <X className="w-4 h-4 md:w-5 md:h-5 text-gray-400 dark:text-gray-500 inline" />
                  </td>
                  <td className="text-center py-3 px-3 md:py-4 md:px-6">
                    <X className="w-4 h-4 md:w-5 md:h-5 text-gray-400 dark:text-gray-500 inline" />
                  </td>
                  <td className="text-center py-3 px-3 md:py-4 md:px-6">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600 dark:text-green-400 inline" />
                    <div className="text-xs text-green-600 hidden md:block">Quarterly reports</div>
                  </td>
                </tr>
                
                {/* Lead Generation */}
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                  <td colSpan={4} className="py-2 px-3 md:py-3 md:px-6 font-semibold text-gray-900 dark:text-gray-100 text-xs md:text-sm uppercase tracking-wider">
                    Lead Generation & Support
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 px-3 md:py-4 md:px-6 font-medium text-gray-900 dark:text-gray-100 text-sm md:text-base">Promotional Offers</td>
                  <td className="text-center py-3 px-3 md:py-4 md:px-6">
                    <X className="w-4 h-4 md:w-5 md:h-5 text-gray-400 dark:text-gray-500 inline" />
                  </td>
                  <td className="text-center py-3 px-3 md:py-4 md:px-6">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600 dark:text-green-400 inline" />
                    <div className="text-xs text-green-600 hidden md:block">Post vendor promos</div>
                  </td>
                  <td className="text-center py-3 px-3 md:py-4 md:px-6">
                    <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-purple-600 dark:text-purple-400 inline" />
                    <div className="text-xs text-purple-600 hidden md:block">Priority promotions</div>
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 px-3 md:py-4 md:px-6 font-medium text-gray-900 dark:text-gray-100 text-sm md:text-base">Lead Routing</td>
                  <td className="text-center py-3 px-3 md:py-4 md:px-6">
                    <span className="text-gray-700 dark:text-gray-300 text-xs md:text-sm">Basic</span>
                  </td>
                  <td className="text-center py-3 px-3 md:py-4 md:px-6">
                    <span className="text-gray-700 dark:text-gray-300 text-xs md:text-sm">Priority routing</span>
                  </td>
                  <td className="text-center py-3 px-3 md:py-4 md:px-6">
                    <div className="font-medium text-purple-600 dark:text-purple-400 text-xs md:text-sm">Concierge priority</div>
                    <div className="text-xs text-gray-500 hidden md:block">+ AI lead scoring</div>
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 px-3 md:py-4 md:px-6 font-medium text-gray-900 dark:text-gray-100 text-sm md:text-base">API/CSV Lead Passback</td>
                  <td className="text-center py-3 px-3 md:py-4 md:px-6">
                    <X className="w-4 h-4 md:w-5 md:h-5 text-gray-400 dark:text-gray-500 inline" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <X className="w-5 h-5 text-gray-400 dark:text-gray-500 inline" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 inline" />
                    <div className="text-xs text-green-600">Optional API/CSV</div>
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-4 px-6 font-medium text-gray-900 dark:text-gray-100">Vendor Success Call</td>
                  <td className="text-center py-4 px-6">
                    <X className="w-5 h-5 text-gray-400 dark:text-gray-500 inline" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <X className="w-5 h-5 text-gray-400 dark:text-gray-500 inline" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <PhoneCall className="w-5 h-5 text-purple-600 dark:text-purple-400 inline" />
                    <div className="text-xs text-purple-600">Optional quarterly</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* How Tiers Affect Visibility */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border-amber-200 dark:border-amber-800 mb-10 max-w-5xl mx-auto">
        <CardContent className="py-6 px-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Eye className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            How Paid Tiers Increase Your Visibility
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-left">
              <Badge variant="outline" className="mb-2 border-gray-300">Basic ($99/mo)</Badge>
              <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                <li>• Standard directory listing</li>
                <li>• Appears in search results</li>
                <li>• No promotional placement</li>
              </ul>
            </div>
            <div className="text-left">
              <Badge variant="outline" className="mb-2 border-purple-500 text-purple-700 dark:text-purple-300">Featured ($249/mo)</Badge>
              <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                <li>• <span className="font-medium text-purple-600 dark:text-purple-400">Featured in vendor carousels</span></li>
                <li>• <span className="font-medium text-purple-600 dark:text-purple-400">Priority in search results</span></li>
                <li>• Promotional badge on listings</li>
              </ul>
            </div>
            <div className="text-left">
              <Badge variant="outline" className="mb-2 border-yellow-500 text-yellow-700 dark:text-yellow-300">National ($499/mo)</Badge>
              <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                <li>• <span className="font-medium text-yellow-600 dark:text-yellow-400">Premium banner placement</span></li>
                <li>• <span className="font-medium text-yellow-600 dark:text-yellow-400">Top of all vendor listings</span></li>
                <li>• Homepage featured section</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Welcome Message */}
      <div className="mb-10 max-w-4xl mx-auto text-center">
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 border-0 shadow-lg">
          <CardContent className="py-8 px-6">
            <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              Why 1,000+ Vendors Choose MySeniorValet
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="flex flex-col items-center text-center">
                <Building2 className="w-10 h-10 text-blue-600 dark:text-blue-400 mb-3" />
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">34,000+ Communities</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Direct access to verified senior living communities actively seeking quality vendor partners</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Users className="w-10 h-10 text-green-600 dark:text-green-400 mb-3" />
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Pre-Qualified Leads</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Connect with families and facilities already looking for your specific services</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <TrendingUp className="w-10 h-10 text-purple-600 dark:text-purple-400 mb-3" />
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Proven ROI</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Average partners see 5x return on investment within first 90 days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tier Cards - Clean Design Matching Vendor Signup */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {Object.entries(allTiers).map(([key, tier]) => {
          const isFirstTimeCustomer = true; // For demo purposes, showing promo pricing
          const monthlyPrice = tier.price;
          const discountedPrice = Math.round(monthlyPrice / 2); // 50% off first month
          
          return tier && tier.features ? (
          <Card 
            key={key}
            className={`relative overflow-hidden transition-all bg-white dark:bg-gray-800 border-2 ${
              key === 'featured' ? 'border-blue-500 shadow-xl scale-105' : 'border-gray-200 dark:border-gray-700'
            } hover:shadow-lg`}
          >
            {key === 'featured' && (
              <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-2 text-sm font-semibold rounded-bl-lg">
                Most Popular
              </div>
            )}
            
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{tier.name}</CardTitle>
              
              {/* Pricing with Promo */}
              <div className="space-y-2">
                {isFirstTimeCustomer && monthlyPrice > 0 && (
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-gray-500 line-through text-lg">${monthlyPrice}</span>
                    <Badge className="bg-green-600 text-white">50% OFF</Badge>
                  </div>
                )}
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-bold text-gray-900 dark:text-gray-100">
                    ${isFirstTimeCustomer && monthlyPrice > 0 ? discountedPrice : monthlyPrice}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 ml-1">/month</span>
                </div>
                {isFirstTimeCustomer && monthlyPrice > 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    First month only, then ${monthlyPrice}/month
                  </p>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-3 pb-4">
                {/* Tier-specific Features */}
                {key === 'basic' && (
                  <>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Full coverage across 1 entire state</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Professional vendor listing & profile</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Name, phone, category, description</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Optional $25 verified badge</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">User reviews & ratings</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Affiliate link support</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Basic lead notifications</span>
                    </div>
                  </>
                )}
                
                {key === 'featured' && (
                  <>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Coverage across 3 States</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Logo & brand customization</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Basic analytics dashboard</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Post promotional offers</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Featured carousel placement</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">MySeniorValet Approved badge</span>
                    </div>
                  </>
                )}
                
                {key === 'national' && (
                  <>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Nationwide US & Canada coverage</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Crown className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5" />
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Premium banner placement</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Crown className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5" />
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Concierge priority routing</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">AI-powered lead insights</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">API & CSV lead passback</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Dedicated vendor microsite</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Quarterly performance reports</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Vendor success calls</span>
                    </div>
                  </>
                )}
              </div>
              
              <Button 
                className={`w-full mt-4 ${
                  key === 'featured' 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : key === 'national'
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpgrade(key);
                }}
              >
                {key === 'basic' ? 'Get Started' : key === 'featured' ? 'Choose Featured' : 'Go National'}
              </Button>
            </CardContent>
          </Card>
          ) : null
        })}
      </div>

      {/* Call to Action */}
      <div className="mt-12 text-center">
        <Card className="max-w-2xl mx-auto bg-gradient-to-r from-purple-50 via-blue-50 to-purple-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-purple-900/20 border-2 border-purple-200 dark:border-purple-800">
          <CardContent className="py-10 px-8">
            <div className="mb-4">
              <Users className="w-12 h-12 text-purple-600 dark:text-purple-400 mx-auto mb-3" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              Ready to Make a Difference Together?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-xl mx-auto">
              We believe in building meaningful partnerships. When you succeed, families find the care they need. 
              Let's chat about how we can support your journey!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700" onClick={() => handleUpgrade('basic')}>
                <Home className="w-4 h-4 mr-2" />
                Start Your Partnership Journey
              </Button>
              <Button size="lg" variant="outline" className="border-purple-300 hover:border-purple-400" onClick={() => setLocation('/contact-sales')}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Let's Have a Conversation
              </Button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
              Questions? We're here to help! Our team is passionate about supporting your success.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}
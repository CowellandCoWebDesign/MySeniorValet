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
  X
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

// No free tier for vendors

export default function VendorMarketplaceTiers() {
  const [selectedTier, setSelectedTier] = useState<string>('featured');
  const [, setLocation] = useLocation();
  const { toast } = useToast();

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
            Become a Trusted MySeniorValet Partner
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-3">
            We're excited to have you join our community of caring professionals who make a real difference 
            in the lives of seniors and their families every day
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Whether you're just starting or ready to expand, we have a partnership level that's perfect for you.
            Let's grow together!
          </p>
        </div>

      {/* Detailed Feature Comparison */}
      <Card className="bg-white dark:bg-gray-800 mb-12 border-2 border-purple-100 dark:border-purple-900/30">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
          <CardTitle className="text-2xl text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Gift className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            Your Partnership Benefits at a Glance
          </CardTitle>
          <p className="text-base text-gray-600 dark:text-gray-400 mt-2">
            Each tier is designed to support your unique journey. Find the perfect match for where you are today and where you're headed tomorrow!
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <th className="text-left py-4 px-6 text-gray-900 dark:text-gray-100 font-semibold">Feature</th>
                  <th className="text-center py-4 px-6">
                    <div className="text-gray-900 dark:text-gray-100 font-semibold">Tier 1: Basic Listing</div>
                    <div className="text-2xl font-bold text-gray-700 dark:text-gray-300 mt-1">$99/mo</div>
                  </th>
                  <th className="text-center py-4 px-6 relative">
                    <div className="absolute top-0 right-0 bg-blue-600 text-white px-2 py-1 text-xs rounded-bl-lg">Most Popular</div>
                    <div className="text-gray-900 dark:text-gray-100 font-semibold">Tier 2: Featured Vendor</div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">$249/mo</div>
                  </th>
                  <th className="text-center py-4 px-6">
                    <div className="text-gray-900 dark:text-gray-100 font-semibold">Tier 3: National Partner</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">(Premium)</div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">$499/mo</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Coverage & Visibility */}
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                  <td colSpan={4} className="py-3 px-6 font-semibold text-gray-900 dark:text-gray-100 text-sm uppercase tracking-wider">
                    Coverage & Visibility
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-4 px-6 font-medium text-gray-900 dark:text-gray-100">Geographic Coverage</td>
                  <td className="text-center py-4 px-6 text-gray-700 dark:text-gray-300">
                    <div className="font-medium">1 zip cluster</div>
                    <div className="text-xs text-gray-500">Region-limited</div>
                  </td>
                  <td className="text-center py-4 px-6 text-gray-700 dark:text-gray-300">
                    <div className="font-medium">5 regions</div>
                    <div className="text-xs text-gray-500">Coverage across 5 areas</div>
                  </td>
                  <td className="text-center py-4 px-6 text-gray-700 dark:text-gray-300">
                    <div className="font-medium text-purple-600 dark:text-purple-400">Nationwide</div>
                    <div className="text-xs text-gray-500">No geo cap</div>
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-4 px-6 font-medium text-gray-900 dark:text-gray-100">Placement Priority</td>
                  <td className="text-center py-4 px-6">
                    <X className="w-5 h-5 text-gray-400 dark:text-gray-500 inline" />
                    <div className="text-xs text-gray-500">Basic listing only</div>
                  </td>
                  <td className="text-center py-4 px-6">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 inline" />
                    <div className="text-xs text-green-600">Featured placement</div>
                  </td>
                  <td className="text-center py-4 px-6">
                    <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 inline" />
                    <div className="text-xs text-purple-600">Banner rotation + priority</div>
                  </td>
                </tr>
                
                {/* Branding & Profile */}
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                  <td colSpan={4} className="py-3 px-6 font-semibold text-gray-900 dark:text-gray-100 text-sm uppercase tracking-wider">
                    Branding & Profile
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-4 px-6 font-medium text-gray-900 dark:text-gray-100">Logo & Brand Colors</td>
                  <td className="text-center py-4 px-6">
                    <X className="w-5 h-5 text-gray-400 dark:text-gray-500 inline" />
                    <div className="text-xs text-gray-500">No logo</div>
                  </td>
                  <td className="text-center py-4 px-6">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 inline" />
                    <div className="text-xs text-green-600">Logo + brand colors</div>
                  </td>
                  <td className="text-center py-4 px-6">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 inline" />
                    <div className="text-xs text-green-600">Full branding</div>
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-4 px-6 font-medium text-gray-900 dark:text-gray-100">Verified Badge</td>
                  <td className="text-center py-4 px-6">
                    <span className="text-gray-700 dark:text-gray-300">$25 add-on</span>
                  </td>
                  <td className="text-center py-4 px-6">
                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 inline" />
                    <div className="text-xs text-blue-600">Included (w/ affiliate link)</div>
                  </td>
                  <td className="text-center py-4 px-6">
                    <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400 inline" />
                    <div className="text-xs text-purple-600">Premium verified</div>
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-4 px-6 font-medium text-gray-900 dark:text-gray-100">Dedicated Profile Page</td>
                  <td className="text-center py-4 px-6">
                    <X className="w-5 h-5 text-gray-400 dark:text-gray-500 inline" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <X className="w-5 h-5 text-gray-400 dark:text-gray-500 inline" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 inline" />
                    <div className="text-xs text-green-600">Vendor microsite</div>
                  </td>
                </tr>
                
                {/* Analytics & Insights */}
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                  <td colSpan={4} className="py-3 px-6 font-semibold text-gray-900 dark:text-gray-100 text-sm uppercase tracking-wider">
                    Analytics & Insights
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-4 px-6 font-medium text-gray-900 dark:text-gray-100">Analytics Access</td>
                  <td className="text-center py-4 px-6">
                    <X className="w-5 h-5 text-gray-400 dark:text-gray-500 inline" />
                    <div className="text-xs text-gray-500">No analytics</div>
                  </td>
                  <td className="text-center py-4 px-6">
                    <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400 inline" />
                    <div className="text-xs text-blue-600">Basic analytics</div>
                  </td>
                  <td className="text-center py-4 px-6">
                    <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400 inline" />
                    <div className="text-xs text-purple-600">AI-powered insights</div>
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-4 px-6 font-medium text-gray-900 dark:text-gray-100">Performance Reports</td>
                  <td className="text-center py-4 px-6">
                    <X className="w-5 h-5 text-gray-400 dark:text-gray-500 inline" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <X className="w-5 h-5 text-gray-400 dark:text-gray-500 inline" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 inline" />
                    <div className="text-xs text-green-600">Quarterly reports</div>
                  </td>
                </tr>
                
                {/* Lead Generation */}
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                  <td colSpan={4} className="py-3 px-6 font-semibold text-gray-900 dark:text-gray-100 text-sm uppercase tracking-wider">
                    Lead Generation & Support
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-4 px-6 font-medium text-gray-900 dark:text-gray-100">Promotional Offers</td>
                  <td className="text-center py-4 px-6">
                    <X className="w-5 h-5 text-gray-400 dark:text-gray-500 inline" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 inline" />
                    <div className="text-xs text-green-600">Post vendor promos</div>
                  </td>
                  <td className="text-center py-4 px-6">
                    <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 inline" />
                    <div className="text-xs text-purple-600">Priority promotions</div>
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-4 px-6 font-medium text-gray-900 dark:text-gray-100">Lead Routing</td>
                  <td className="text-center py-4 px-6">
                    <span className="text-gray-700 dark:text-gray-300">Basic</span>
                  </td>
                  <td className="text-center py-4 px-6">
                    <span className="text-gray-700 dark:text-gray-300">Priority routing</span>
                  </td>
                  <td className="text-center py-4 px-6">
                    <div className="font-medium text-purple-600 dark:text-purple-400">Concierge priority</div>
                    <div className="text-xs text-gray-500">+ AI lead scoring</div>
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-4 px-6 font-medium text-gray-900 dark:text-gray-100">API/CSV Lead Passback</td>
                  <td className="text-center py-4 px-6">
                    <X className="w-5 h-5 text-gray-400 dark:text-gray-500 inline" />
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

      {/* Welcome Message */}
      <div className="mb-10 max-w-4xl mx-auto text-center">
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 border-0 shadow-lg">
          <CardContent className="py-8 px-6">
            <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              Why Partners Love Working With Us
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="flex flex-col items-center text-center">
                <Users className="w-10 h-10 text-blue-600 dark:text-blue-400 mb-3" />
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Meaningful Connections</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Connect with families who truly need your services at the right moment</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <TrendingUp className="w-10 h-10 text-green-600 dark:text-green-400 mb-3" />
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Grow Together</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Your success is our success - we're invested in your growth journey</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Shield className="w-10 h-10 text-purple-600 dark:text-purple-400 mb-3" />
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Trusted Platform</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Join a community built on transparency, trust, and real impact</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {Object.entries(allTiers).map(([key, tier]) => 
          tier && tier.features ? (
          <Card 
            key={key}
            className={`relative overflow-hidden transition-all cursor-pointer hover:shadow-lg ${
              selectedTier === key ? tierColors[key as keyof typeof tierColors] : 'bg-white dark:bg-gray-800'
            }`}
            onClick={() => setSelectedTier(key)}
          >
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
                {key === 'basic' && (
                  <>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">1 zip cluster</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Name, phone, category, description</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Optional $25 verified badge</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Affiliate link support (if provided)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">No logo or analytics</span>
                    </div>
                  </>
                )}
                
                {key === 'featured' && (
                  <>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Coverage across 5 regions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Logo, brand colors, CTA button</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Basic analytics (views, clicks, leads)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Post vendor promos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Featured placement in vendor carousels</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Must have affiliate link for "Approved" badge</span>
                    </div>
                  </>
                )}
                
                {key === 'national' && (
                  <>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Nationwide visibility (no geo cap)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Banner rotation in vendor discovery areas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Concierge system priority & routing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">AI-generated lead summaries + scoring</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Optional API or CSV lead passback</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Dedicated vendor microsite</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Quarterly performance report</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <PhoneCall className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Optional vendor success call</span>
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
                  handleUpgrade(key);
                }}
              >
                {key === 'basic' ? 'Start Your Journey' : key === 'featured' ? 'Grow Your Impact' : 'Maximize Your Reach'}
              </Button>
            </CardContent>
          </Card>
          ) : null
        )}
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
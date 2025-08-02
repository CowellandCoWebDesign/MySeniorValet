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
          <h1 className="text-4xl font-bold mb-4">Vendor Marketplace Portal</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Join thousands of senior care providers reaching families nationwide
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400 mt-2">
            Choose the perfect tier for your business needs
          </p>
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
          <CardTitle className="text-2xl text-gray-900 dark:text-gray-100">Comprehensive Feature Comparison</CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Choose the tier that best fits your business needs</p>
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
                  <td className="py-4 px-6 font-medium text-gray-900 dark:text-gray-100">CTA Button</td>
                  <td className="text-center py-4 px-6">
                    <X className="w-5 h-5 text-gray-400 dark:text-gray-500 inline" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 inline" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 inline" />
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-4 px-6 font-medium text-gray-900 dark:text-gray-100">Dedicated Vendor Page</td>
                  <td className="text-center py-4 px-6">
                    <X className="w-5 h-5 text-gray-400 dark:text-gray-500 inline" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <X className="w-5 h-5 text-gray-400 dark:text-gray-500 inline" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 inline" />
                    <div className="text-xs text-green-600">Dedicated microsite</div>
                  </td>
                </tr>
                
                {/* Analytics & Leads */}
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                  <td colSpan={4} className="py-3 px-6 font-semibold text-gray-900 dark:text-gray-100 text-sm uppercase tracking-wider">
                    Analytics & Lead Generation
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-4 px-6 font-medium text-gray-900 dark:text-gray-100">Analytics Access</td>
                  <td className="text-center py-4 px-6">
                    <X className="w-5 h-5 text-gray-400 dark:text-gray-500 inline" />
                    <div className="text-xs text-gray-500">No analytics</div>
                  </td>
                  <td className="text-center py-4 px-6">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 inline" />
                    <div className="text-xs text-green-600">Views, clicks, leads</div>
                  </td>
                  <td className="text-center py-4 px-6">
                    <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 inline" />
                    <div className="text-xs text-purple-600">AI-generated summaries</div>
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-4 px-6 font-medium text-gray-900 dark:text-gray-100">Lead Passback</td>
                  <td className="text-center py-4 px-6">
                    <X className="w-5 h-5 text-gray-400 dark:text-gray-500 inline" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <X className="w-5 h-5 text-gray-400 dark:text-gray-500 inline" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 inline" />
                    <div className="text-xs text-green-600">API or CSV</div>
                  </td>
                </tr>
                
                {/* Verification & Support */}
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                  <td colSpan={4} className="py-3 px-6 font-semibold text-gray-900 dark:text-gray-100 text-sm uppercase tracking-wider">
                    Verification & Support
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-4 px-6 font-medium text-gray-900 dark:text-gray-100">Verified Badge</td>
                  <td className="text-center py-4 px-6">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Optional $25</div>
                  </td>
                  <td className="text-center py-4 px-6">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 inline" />
                    <div className="text-xs text-green-600">"Approved" badge*</div>
                  </td>
                  <td className="text-center py-4 px-6">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 inline" />
                    <div className="text-xs text-green-600">Premium badge</div>
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-4 px-6 font-medium text-gray-900 dark:text-gray-100">Affiliate Link Support</td>
                  <td className="text-center py-4 px-6">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 inline" />
                    <div className="text-xs text-gray-500">If provided</div>
                  </td>
                  <td className="text-center py-4 px-6">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 inline" />
                    <div className="text-xs text-orange-600">Required for badge</div>
                  </td>
                  <td className="text-center py-4 px-6">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 inline" />
                    <div className="text-xs text-green-600">Full tracking</div>
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
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-4 px-6 font-medium text-gray-900 dark:text-gray-100">Success Calls</td>
                  <td className="text-center py-4 px-6">
                    <X className="w-5 h-5 text-gray-400 dark:text-gray-500 inline" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <X className="w-5 h-5 text-gray-400 dark:text-gray-500 inline" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 inline" />
                    <div className="text-xs text-green-600">Optional vendor calls</div>
                  </td>
                </tr>
                
                {/* Additional Features */}
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                  <td colSpan={4} className="py-3 px-6 font-semibold text-gray-900 dark:text-gray-100 text-sm uppercase tracking-wider">
                    Additional Features
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-4 px-6 font-medium text-gray-900 dark:text-gray-100">User Reviews</td>
                  <td className="text-center py-4 px-6">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 inline" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 inline" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 inline" />
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-4 px-6 font-medium text-gray-900 dark:text-gray-100">Vendor Promos</td>
                  <td className="text-center py-4 px-6">
                    <X className="w-5 h-5 text-gray-400 dark:text-gray-500 inline" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 inline" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 inline" />
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-4 px-6 font-medium text-gray-900 dark:text-gray-100">Concierge Priority</td>
                  <td className="text-center py-4 px-6">
                    <X className="w-5 h-5 text-gray-400 dark:text-gray-500 inline" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <X className="w-5 h-5 text-gray-400 dark:text-gray-500 inline" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 inline" />
                    <div className="text-xs text-green-600">System priority & routing</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Footer Notes */}
          <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <p className="text-sm text-orange-700 dark:text-orange-300">
              <strong>*Note:</strong> The "Approved" badge for Tier 2: Featured Vendor requires an affiliate link to be provided. This ensures transparency for families using our platform.
            </p>
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
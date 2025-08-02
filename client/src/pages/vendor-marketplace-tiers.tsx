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
  Briefcase
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface VendorTier {
  name: string;
  price: number;
  features: {
    leadGeneration: number;
    featuredPlacement: boolean;
    analyticsAccess: string;
    productListings: number;
    monthlyClicks: number;
    responseTime: string;
    verifiedBadge: boolean;
    promotionalOffers: number;
    dedicatedAccountManager?: boolean;
    apiAccess?: boolean;
    customIntegrations?: boolean;
  };
}

export default function VendorMarketplaceTiers() {
  const [selectedTier, setSelectedTier] = useState<string>('professional');
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Fetch vendor tiers
  const { data: vendorTiers, isLoading } = useQuery<Record<string, VendorTier>>({
    queryKey: ['/api/vendor-subscription/tiers'],
  });

  const tierColors = {
    basic: "border-gray-300 bg-gray-50",
    professional: "border-blue-500 bg-blue-50 ring-2 ring-blue-500",
    enterprise: "border-purple-500 bg-purple-50",
    platinum: "border-amber-500 bg-amber-50"
  };

  const tierIcons = {
    basic: <ShoppingBag className="w-8 h-8 text-gray-600" />,
    professional: <Building2 className="w-8 h-8 text-blue-600" />,
    enterprise: <Crown className="w-8 h-8 text-purple-600" />,
    platinum: <Star className="w-8 h-8 text-amber-600" />
  };

  const handleUpgrade = async (tier: string) => {
    try {
      // TODO: Integrate with Stripe for payment processing
      toast({
        title: "Upgrade Process Started",
        description: "Redirecting to payment processing...",
      });
      
      // For now, just update the tier (in production, this would go through Stripe)
      await apiRequest("POST", `/api/vendors/1/upgrade`, { targetTier: tier });
      
      toast({
        title: "Subscription Upgraded",
        description: `Successfully upgraded to ${vendorTiers?.[tier]?.name} tier!`,
      });
    } catch (error) {
      toast({
        title: "Upgrade Failed",
        description: "Failed to process upgrade. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Vendor Marketplace Tiers</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Choose the perfect plan to grow your senior care business and reach more families
        </p>
      </div>

      {/* Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {vendorTiers && Object.entries(vendorTiers).map(([key, tier]) => (
          <Card 
            key={key}
            className={`relative overflow-hidden transition-all cursor-pointer ${
              selectedTier === key ? tierColors[key as keyof typeof tierColors] : ''
            }`}
            onClick={() => setSelectedTier(key)}
          >
            {key === 'professional' && (
              <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 text-sm rounded-bl-lg">
                Most Popular
              </div>
            )}
            
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-3">
                {tierIcons[key as keyof typeof tierIcons]}
              </div>
              <CardTitle className="text-2xl">{tier.name}</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">${tier.price}</span>
                <span className="text-gray-600">/month</span>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-600" />
                  <span className="text-sm">
                    {tier.features.leadGeneration === -1 
                      ? 'Unlimited leads' 
                      : `${tier.features.leadGeneration} leads/month`}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gray-600" />
                  <span className="text-sm">
                    {tier.features.monthlyClicks === -1 
                      ? 'Unlimited clicks' 
                      : `${tier.features.monthlyClicks} clicks/month`}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-gray-600" />
                  <span className="text-sm">
                    {tier.features.productListings === -1 
                      ? 'Unlimited products' 
                      : `${tier.features.productListings} products`}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span className="text-sm">{tier.features.responseTime} response</span>
                </div>
                
                {tier.features.verifiedBadge && (
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">Verified Badge</span>
                  </div>
                )}
                
                {tier.features.featuredPlacement && (
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium">Featured Placement</span>
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
                {key === 'basic' ? 'Get Started' : 'Upgrade Now'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Feature Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Detailed Feature Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Feature</th>
                  <th className="text-center py-3 px-4">Basic</th>
                  <th className="text-center py-3 px-4">Professional</th>
                  <th className="text-center py-3 px-4">Enterprise</th>
                  <th className="text-center py-3 px-4">Platinum</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Monthly Leads</td>
                  <td className="text-center py-3 px-4">10</td>
                  <td className="text-center py-3 px-4">50</td>
                  <td className="text-center py-3 px-4">200</td>
                  <td className="text-center py-3 px-4">Unlimited</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Featured Placement</td>
                  <td className="text-center py-3 px-4">
                    <Lock className="w-4 h-4 text-gray-400 inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle className="w-4 h-4 text-green-600 inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle className="w-4 h-4 text-green-600 inline" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle className="w-4 h-4 text-green-600 inline" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Analytics Access</td>
                  <td className="text-center py-3 px-4">Basic</td>
                  <td className="text-center py-3 px-4">Detailed</td>
                  <td className="text-center py-3 px-4">Advanced</td>
                  <td className="text-center py-3 px-4">Platinum</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Priority Support</td>
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
                  <td className="py-3 px-4 font-medium">Dedicated Account Manager</td>
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
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">API Access</td>
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
            <p className="text-gray-600 mb-6">
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
  );
}
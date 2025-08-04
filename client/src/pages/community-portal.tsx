import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building, 
  Shield, 
  Star, 
  Users, 
  Camera, 
  Calendar,
  Edit,
  CheckCircle,
  AlertTriangle,
  Lock,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Clock,
  Globe,
  Upload,
  Eye,
  Settings,
  X,
  FileSignature,
  Home,
  LogIn,
  PhoneCall,
  Sparkles,
  Crown,
  Rocket,
  ChevronRight,
  Info,
  Award,
  TrendingUp,
  MessageSquare,
  BarChart3,
  FileText,
  Video,
  Zap,
  Heart,
  UserCheck
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Header } from "@/components/header";
import { useToast } from "@/hooks/use-toast";

export default function CommunityPortal() {
  const [selectedTier, setSelectedTier] = useState<string>('featured');
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Tier colors with beautiful gradients
  const tierColors = {
    verified: "border-gray-300 bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800 dark:border-gray-600",
    standard: "border-blue-500 bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20 dark:border-blue-400",
    featured: "border-purple-500 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 ring-2 ring-purple-500 dark:border-purple-400",
    platinum: "border-gold-500 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-900/20 dark:via-yellow-900/20 dark:to-orange-900/20 dark:border-amber-400"
  };

  // Tier icons
  const tierIcons = {
    verified: <CheckCircle className="w-8 h-8 text-gray-600" />,
    standard: <Award className="w-8 h-8 text-blue-600" />,
    featured: <Star className="w-8 h-8 text-purple-600" />,
    platinum: <Crown className="w-8 h-8 text-amber-600" />
  };

  const plans = [
    {
      id: 'verified',
      name: 'Verified Listing',
      price: 'Free',
      priceValue: 0,
      tier: 'verified',
      tagline: 'Get started for free',
      description: 'Perfect for communities just getting started',
      features: [
        { text: 'Edit contact info', included: true },
        { text: 'Upload 1 photo', included: true },
        { text: 'Tour Scheduler enabled', included: true },
        { text: 'Basic search visibility', included: true },
        { text: 'Respond to reviews', included: false },
        { text: 'PDF uploads', included: false },
        { text: 'Analytics dashboard', included: false },
        { text: 'Priority visibility', included: false }
      ],
      buttonText: 'Claim for Free',
      popular: false
    },
    {
      id: 'standard',
      name: 'Standard',
      price: '$149',
      priceValue: 149,
      tier: 'standard',
      tagline: 'Most essential features',
      description: 'Great for active communities',
      features: [
        { text: 'Everything in Free, plus:', header: true },
        { text: 'Upload up to 10 photos', included: true },
        { text: 'Upload 1 brochure PDF', included: true },
        { text: 'External calendar link', included: true },
        { text: 'Basic analytics access', included: true },
        { text: 'Respond to reviews', included: true },
        { text: 'Standard Verified badge', included: true }
      ],
      buttonText: 'Upgrade to Standard',
      popular: false
    },
    {
      id: 'featured',
      name: 'Featured',
      price: '$249',
      priceValue: 249,
      tier: 'featured',
      tagline: 'Best for visibility',
      description: 'Stand out from the competition',
      features: [
        { text: 'Everything in Standard, plus:', header: true },
        { text: 'Upload up to 25 photos', included: true },
        { text: '1 video (max 2 mins)', included: true },
        { text: 'Upload up to 3 PDFs', included: true },
        { text: 'Featured placement', included: true },
        { text: 'In-app messaging + AI', included: true },
        { text: 'Promo badge support', included: true },
        { text: 'Concierge Preferred tag', included: true }
      ],
      buttonText: 'Go Featured',
      popular: true
    },
    {
      id: 'platinum',
      name: 'Platinum',
      price: '$349',
      priceValue: 349,
      tier: 'platinum',
      tagline: 'Complete control',
      description: 'For communities that want it all',
      features: [
        { text: 'Everything in Featured, plus:', header: true },
        { text: 'Upload up to 50 photos', included: true },
        { text: 'Up to 3 videos (5 mins each)', included: true },
        { text: 'Unlimited PDFs', included: true },
        { text: 'Staff bios & care philosophy', included: true },
        { text: 'Availability sync', included: true },
        { text: 'Admin dashboard', included: true },
        { text: 'Top Concierge Priority', included: true },
        { text: 'Monthly performance review', included: true }
      ],
      buttonText: 'Go Platinum',
      popular: false
    }
  ];

  const handleUpgrade = async (planName: string) => {
    try {
      // Map plan names to product IDs
      const productIdMap: Record<string, string> = {
        'Verified': 'verified',
        'Standard': 'standard', 
        'Featured': 'featured',
        'Platinum': 'platinum'
      };

      const productId = productIdMap[planName];
      if (!productId) {
        throw new Error('Invalid plan selected');
      }

      // For free tier, redirect to community claim
      if (productId === 'verified') {
        toast({
          title: "Welcome to MySeniorValet!",
          description: "Your free verified listing is ready. Complete your profile to get started.",
        });
        setTimeout(() => {
          setLocation('/community-claim');
        }, 1500);
        return;
      }

      // Store the selected plan info for the payment page
      sessionStorage.setItem('communityUpgradeData', JSON.stringify({
        productId,
        planName,
        isNewCommunity: true, // This can be dynamic based on user's auth status
        communityId: null, // Will be set if user is upgrading existing community
        communityName: 'New Community' // Default for new communities
      }));

      // Redirect to the mobile-optimized payment page
      toast({
        title: "Redirecting to payment...",
        description: "Setting up your secure payment session.",
      });

      setTimeout(() => {
        setLocation(`/community-mobile-payment/${productId}`);
      }, 500);

    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: error.message || "Unable to process payment. Please try again or contact support.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl shadow-lg">
              <Building className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Join MySeniorValet Community Portal
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-6">
            Showcase your community to thousands of families searching for the perfect senior living solution
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">34,171+ Communities Listed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">15,000+ Monthly Searches</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Trusted by Families</span>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20 border-blue-200 dark:border-blue-700">
            <CardContent className="p-6">
              <Eye className="w-10 h-10 text-blue-600 mb-3" />
              <h3 className="font-semibold text-lg mb-2">Maximum Visibility</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Get discovered by families actively searching for senior living in your area
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-200 dark:border-purple-700">
            <CardContent className="p-6">
              <TrendingUp className="w-10 h-10 text-purple-600 mb-3" />
              <h3 className="font-semibold text-lg mb-2">Boost Occupancy</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Connect with qualified leads and increase your occupancy rates
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-700">
            <CardContent className="p-6">
              <MessageSquare className="w-10 h-10 text-amber-600 mb-3" />
              <h3 className="font-semibold text-lg mb-2">Direct Communication</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Engage directly with families through our messaging platform
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Tiers */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Choose Your Plan
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative transform transition-all duration-300 hover:scale-105 ${
                  tierColors[plan.tier as keyof typeof tierColors]
                } ${plan.popular ? 'shadow-2xl' : 'shadow-lg'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-purple-600 to-violet-600 text-white px-4 py-1">
                      <Sparkles className="w-3 h-3 mr-1" />
                      MOST POPULAR
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="mb-4">
                    {tierIcons[plan.tier as keyof typeof tierIcons]}
                  </div>
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <div className="mb-2">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    {plan.priceValue > 0 && <span className="text-gray-600 dark:text-gray-400">/month</span>}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{plan.tagline}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{plan.description}</p>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className={`flex items-start gap-2 ${feature.header ? 'font-semibold text-sm' : 'text-sm'}`}>
                      {!feature.header && (
                        feature.included ? (
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        )
                      )}
                      <span className={feature.included === false ? 'text-gray-400 line-through' : ''}>{feature.text}</span>
                    </div>
                  ))}
                  
                  <Button
                    onClick={() => handleUpgrade(plan.name)}
                    className={`w-full mt-6 ${
                      plan.tier === 'verified' 
                        ? 'bg-gray-600 hover:bg-gray-700' 
                        : plan.tier === 'standard'
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : plan.tier === 'featured'
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                    } text-white`}
                  >
                    {plan.buttonText}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12 pb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-300 dark:border-blue-700 p-6 inline-block">
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Volume Discounts Available:</strong> Managing 10+ communities? Contact us for special rates!
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

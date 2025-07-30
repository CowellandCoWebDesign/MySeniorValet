import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  Home
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { NavigationHeader } from "@/components/NavigationHeader";

export default function CommunityPortal() {
  const [currentStep, setCurrentStep] = useState('landing');
  const [claimForm, setClaimForm] = useState({
    communityName: '',
    contactName: '',
    title: '',
    email: '',
    phone: '',
    workEmail: '',
    employeeId: '',
    verificationDocs: []
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [showPricing, setShowPricing] = useState(false);
  const { toast } = useToast();
  
  // Handle login redirect to main auth system
  const handleLoginRedirect = () => {
    window.location.href = "/api/login";
  };

  // Fetch live Stripe subscription products
  const { data: subscriptionProducts, isLoading: productsLoading } = useQuery({
    queryKey: ['/api/subscriptions/products'],
  });

  // Transform Stripe products to community portal format with detailed features
  const plans = (subscriptionProducts as any)?.products?.map((product: any) => {
    let features: string[] = [];
    let detailedFeatures: { name: string; icon: any }[] = [];
    
    switch (product.id) {
      case 'basic-listing':
        features = [
          'Basic community listing',
          'Contact information display',
          'Search visibility',
          'Basic map placement'
        ];
        detailedFeatures = [];
        break;
      case 'featured-spotlight':
        features = [
          'Everything in Free, plus:',
          'Profile editing & customization',
          'Featured placement in search',
          'Red tag special promotions',
          'Photo gallery (up to 10 photos)',
          'Custom intake forms',
          'Basic analytics dashboard'
        ];
        detailedFeatures = [
          { name: 'Profile Editing', icon: Edit },
          { name: 'Featured Placement', icon: Star },
          { name: 'Photo Gallery', icon: Camera },
          { name: 'Analytics', icon: Eye }
        ];
        break;
      case 'premium-tools':
        features = [
          'Everything in Featured, plus:',
          'Branded intake questionnaires',
          'Availability management system',
          'Tour scheduler & tracking',
          'Unlimited photo uploads',
          'Advanced analytics & insights',
          'Family messaging platform',
          'Priority support'
        ];
        detailedFeatures = [
          { name: 'Tour Scheduler', icon: Calendar },
          { name: 'Advanced Analytics', icon: Eye },
          { name: 'Family Messaging', icon: Users },
          { name: 'Priority Support', icon: Shield }
        ];
        break;
      case 'platinum-partner':
        features = [
          'Everything in Premium, plus:',
          'Homepage featured placement',
          'Concierge referral service',
          'Sponsored blog content',
          'AI-powered matching priority',
          'API access & integration',
          'White-label options',
          'Custom reporting suite',
          'Dedicated success manager'
        ];
        detailedFeatures = [
          { name: 'Homepage Featured', icon: Home },
          { name: 'Concierge Service', icon: Star },
          { name: 'AI Priority', icon: Shield },
          { name: 'API Access', icon: Globe }
        ];
        break;
    }
    
    return {
      id: product.id,
      name: product.name,
      price: product.price === 0 ? 'Free' : `$${(product.price / 100).toFixed(0)}/month`,
      priceValue: product.price / 100,
      tier: product.name,
      color: product.id === 'basic-listing' ? 'gray' : 
             product.id === 'featured-spotlight' ? 'blue' :
             product.id === 'premium-tools' ? 'purple' : 'gold',
      description: product.description,
      features: features,
      detailedFeatures: detailedFeatures,
      popular: product.id === 'featured-spotlight',
      stripeProductId: product.stripeProductId,
      stripePriceId: product.stripePriceId
    };
  }) || [];

  // Create Stripe checkout session
  const createCheckoutMutation = useMutation({
    mutationFn: async ({ productId, communityId }: { productId: string, communityId?: number }) => {
      const response = await apiRequest(`/api/subscriptions/create-checkout`, 'POST', { 
        productId, 
        communityId: communityId || 1 
      });
      return response;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast({
        title: "Checkout Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    if (planId === 'basic-listing') {
      // Free plan - direct to claim process
      setCurrentStep('claim-verification');
    } else {
      // Paid plans - redirect to Stripe checkout
      createCheckoutMutation.mutate({ productId: planId });
    }
  };

  const handleClaimSubmit = () => {
    // Simulate claim submission
    toast({
      title: "Claim Submitted",
      description: "Your community claim has been submitted for review. We'll contact you within 1-2 business days.",
    });
    setCurrentStep('claim-success');
  };

  // Landing Page
  if (currentStep === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Building className="w-12 h-12 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                MySeniorValet Community Portal
              </h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Claim and manage your senior living community profile. Connect with families, showcase your amenities, and grow your occupancy with our powerful marketing tools.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">26,306</div>
                <div className="text-gray-600 dark:text-gray-300">Communities Listed</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-green-600 mb-2">15,000+</div>
                <div className="text-gray-600 dark:text-gray-300">Monthly Family Searches</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-purple-600 mb-2">94%</div>
                <div className="text-gray-600 dark:text-gray-300">Customer Satisfaction</div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="text-center space-y-6">
            <div className="space-x-4">
              <Button 
                size="lg" 
                className="px-8 py-4 text-lg"
                onClick={() => setCurrentStep('plan-selection')}
              >
                <Building className="w-5 h-5 mr-2" />
                Claim Your Community
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-4 text-lg"
                onClick={handleLoginRedirect}
              >
                <Shield className="w-5 h-5 mr-2" />
                Existing Member Login
              </Button>
            </div>
            
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Already managing your community? <Link to="/community-dashboard/1" className="text-blue-600 hover:underline">Access your dashboard</Link>
            </div>
          </div>

          {/* Benefits */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <Eye className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Increased Visibility</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Get found by families actively searching for senior living options</p>
              </CardContent>
            </Card>
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <Camera className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Showcase Your Community</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Upload photos, videos, and highlight your unique amenities</p>
              </CardContent>
            </Card>
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <Users className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Direct Family Communication</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Connect directly with interested families through secure messaging</p>
              </CardContent>
            </Card>
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <Settings className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Powerful Management Tools</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Analytics, lead tracking, and resident management features</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Plan Selection
  if (currentStep === 'plan-selection') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <Button 
              variant="ghost" 
              className="mb-6"
              onClick={() => setCurrentStep('landing')}
            >
              ← Back to Home
            </Button>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Choose Your Management Plan
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Select the plan that best fits your community's needs. All plans include authentic MySeniorValet verified listing.
            </p>
          </div>

          {productsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading subscription options...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans.map((plan: any) => (
                <Card 
                  key={plan.id} 
                  className={`relative cursor-pointer hover:shadow-xl transition-all duration-300 ${
                    plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
                  }`}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-600 text-white px-3 py-1">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className={`text-2xl ${
                      plan.color === 'gray' ? 'text-gray-600' :
                      plan.color === 'blue' ? 'text-blue-600' :
                      plan.color === 'purple' ? 'text-purple-600' : 'text-yellow-600'
                    }`}>
                      {plan.name}
                    </CardTitle>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      {plan.price}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{plan.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mb-6">
                      {plan.features.slice(0, 6).map((feature: string, index: number) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                        </div>
                      ))}
                      {plan.features.length > 6 && (
                        <div className="text-sm text-gray-500 italic">
                          +{plan.features.length - 6} more features...
                        </div>
                      )}
                    </div>
                    <Button 
                      className="w-full" 
                      disabled={createCheckoutMutation.isPending}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectPlan(plan.id);
                      }}
                    >
                      {createCheckoutMutation.isPending ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                          Processing...
                        </>
                      ) : plan.priceValue === 0 ? (
                        'Claim Free Listing'
                      ) : (
                        'Select Plan'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Need help choosing? <Link to="/ai-support" className="text-blue-600 hover:underline">Chat with our AI assistant</Link>
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              All plans include secure payment processing, 24/7 support, and can be cancelled anytime.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Claim Success
  if (currentStep === 'claim-success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Claim Submitted Successfully!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Thank you for claiming your community profile. Our verification team will review your submission within 1-2 business days and contact you with next steps.
            </p>
            <div className="space-y-4">
              <Button onClick={() => setCurrentStep('landing')}>
                <Home className="w-4 h-4 mr-2" />
                Return to Portal Home
              </Button>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Check your email for confirmation details and next steps.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
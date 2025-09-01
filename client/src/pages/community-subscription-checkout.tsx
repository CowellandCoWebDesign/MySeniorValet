import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Loader2, X, Star, Shield, Trophy, Crown, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { NavigationHeader } from '@/components/NavigationHeader';

const SUBSCRIPTION_TIERS = {
  starter: {
    key: 'starter',
    displayName: 'Community Starter',
    price: 99,
    color: 'bg-gray-100 text-gray-800',
    icon: CheckCircle2,
    features: [
      'Basic listing with verified badge',
      '5 photos + description',
      '10 leads/month with contact info',
      'Basic analytics dashboard',
      'Standard search ranking',
      'Basic messaging with families'
    ],
    limitations: [
      'No 3D tour embed',
      'No reservation system',
      'Limited CRM integration'
    ],
    note: 'Perfect for testing the platform'
  },
  growth: {
    key: 'growth',
    displayName: 'Community Growth',
    price: 299,
    color: 'bg-blue-100 text-blue-800',
    icon: Star,
    features: [
      'All Starter features, plus:',
      '3D tour embed capability',
      '25 photos + videos',
      '50 leads/month with scoring',
      'Unit reservation system',
      'Enhanced search (3x visibility)',
      'CRM integration (Yardi, Aline)',
      'Tour scheduler integration'
    ],
    limitations: [],
    note: 'Most popular choice for active communities'
  },
  professional: {
    key: 'professional',
    displayName: 'Community Professional',
    price: 999,
    color: 'bg-purple-100 text-purple-800',
    icon: Shield,
    features: [
      'All Growth features, plus:',
      'AI lease management system',
      'Multiple 3D tour embeds',
      'Unlimited leads with AI scoring',
      'Featured search (5x visibility)',
      'Insurance tracking & compliance',
      'Advanced reservation management',
      'DocuSign integration for leases'
    ],
    limitations: [],
    note: 'Includes AI-powered lease automation'
  },
  premium: {
    key: 'premium',
    displayName: 'Community Premium',
    price: 1999,
    color: 'bg-yellow-100 text-yellow-800',
    icon: Crown,
    features: [
      'All Professional features, plus:',
      'Payment processing (2.9% + $0.30)',
      'Move-in cost calculator',
      'Accept deposits & monthly rent',
      'Unlimited 3D embeds',
      'Platinum search (10x visibility)',
      'Multi-property dashboard',
      'Revenue optimization AI',
      'Priority support'
    ],
    limitations: [],
    note: 'Complete payment processing included'
  },
  enterprise: {
    key: 'enterprise',
    displayName: 'Community Enterprise',
    price: 3999,
    color: 'bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800',
    icon: Sparkles,
    features: [
      'Everything in Premium, plus:',
      'White-label platform',
      'API access (100k calls/month)',
      'Custom integrations',
      'Dedicated success manager',
      'Quarterly business reviews',
      'On-site training',
      'Custom reporting'
    ],
    limitations: [],
    note: 'Fortune 500-level infrastructure'
  }
};

export default function CommunitySubscriptionCheckout() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const communityId = searchParams.get('communityId');
  const selectedTier = searchParams.get('tier') || 'starter';
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch community details
  const { data: community, isLoading: communityLoading } = useQuery({
    queryKey: [`/api/communities/${communityId}`],
    enabled: !!communityId,
  });

  // Handle checkout
  // Remove the old checkout session mutation as we're now using Payment Element
  const createCheckoutSession = useMutation({
    mutationFn: async (tierKey: string) => {
      const response = await apiRequest('POST', '/api/community-subscription/create-checkout-session', {
        communityId: Number(communityId),
        tierKey
      });
      return response.json();
    },
    onSuccess: async (data) => {
      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else if (data.success && data.tier === 'verified') {
        // Free tier activated
        toast({
          title: "Success!",
          description: "Your free verified listing has been activated.",
        });
        window.location.href = `/community/${communityId}`;
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create checkout session",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  });

  const handleCheckout = async (tierKey: string) => {
    if (tierKey === 'verified') {
      // Free tier - no payment needed
      setIsProcessing(true);
      
      try {
        const response = await apiRequest('POST', '/api/payments/claim-free-tier', {
          communityId: communityId,
          isNewCommunity: false
        });
        
        const data = await response.json();
        
        if (data.success) {
          toast({
            title: "Success!",
            description: "Your free verified listing has been activated. You're now logged in!",
          });
          
          // Redirect to community dashboard after a short delay
          setTimeout(() => {
            window.location.href = `/community-dashboard/${data.communityId || communityId}`;
          }, 1500);
        } else {
          throw new Error(data.error || 'Failed to claim free tier');
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to activate free tier. Please try again.",
          variant: "destructive",
        });
        setIsProcessing(false);
      }
      return;
    }

    // Store data in session for payment page
    const upgradeData = {
      communityId: communityId,
      communityName: (community as any).name || 'Community',
      tier: tierKey
    };
    sessionStorage.setItem('communityUpgradeData', JSON.stringify(upgradeData));
    
    // Redirect to mobile payment page
    window.location.href = `/community-mobile-payment/${tierKey}`;
  };

  if (communityLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <NavigationHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!community || !communityId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <NavigationHeader />
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">Community not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const tier = SUBSCRIPTION_TIERS[selectedTier as keyof typeof SUBSCRIPTION_TIERS];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavigationHeader />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Upgrade Your Community Listing
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
              {(community as any).name || 'Community'}
            </p>
            {/* Early Adopter Special Banner */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full px-6 py-3 shadow-lg inline-flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">Early Adopter Special: 30% OFF All Paid Plans!</span>
            </div>
          </div>

          {/* Tier Selection */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {Object.values(SUBSCRIPTION_TIERS).map((tierOption) => {
              const Icon = tierOption.icon;
              const isSelected = tierOption.key === selectedTier;
              
              return (
                <Card 
                  key={tierOption.key}
                  className={`cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'
                  }`}
                  onClick={() => window.location.href = `/community-subscription-checkout?communityId=${communityId}&tier=${tierOption.key}`}
                >
                  <CardHeader className="text-center pb-4">
                    <div className="mb-3">
                      <Icon className="h-8 w-8 mx-auto text-primary" />
                    </div>
                    <CardTitle className="text-lg">{tierOption.displayName}</CardTitle>
                    <div className="mt-2">
                      {tierOption.price === 0 ? (
                        <p className="text-2xl font-bold">Free</p>
                      ) : (
                        <div>
                          <p className="text-lg text-gray-500 line-through">${tierOption.price}/mo</p>
                          <p className="text-2xl font-bold text-green-600">
                            ${Math.round(tierOption.price * 0.7)}
                            <span className="text-sm font-normal">/mo</span>
                          </p>
                          <p className="text-xs text-green-600 font-semibold">30% OFF</p>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Badge className={`${tierOption.color} w-full justify-center mb-2`}>
                      {isSelected ? 'Selected' : 'Select'}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Selected Tier Details */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <tier.icon className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle>{tier.displayName} Plan</CardTitle>
                    <CardDescription>
                      {tier.price === 0 ? 'Free forever' : `$${tier.price}/month`}
                    </CardDescription>
                  </div>
                </div>
                <Badge className={tier.color}>
                  {tier.key === 'verified' ? 'Current Plan' : 'Upgrade'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Features */}
                <div>
                  <h3 className="font-semibold mb-3">Included Features:</h3>
                  <ul className="space-y-2">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Limitations */}
                {tier.limitations.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Limitations:</h3>
                    <ul className="space-y-2">
                      {tier.limitations.map((limitation, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <X className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300">{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Note */}
                {tier.note && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Note:</strong> {tier.note}
                    </p>
                  </div>
                )}

                {/* Bulk Pricing for Platinum */}
                {tier.key === 'platinum' && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                      Bulk Pricing Available:
                    </p>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• 10-49 communities: $299/month each</li>
                      <li>• 50+ communities: $249/month each</li>
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => window.location.href = `/community/${communityId}`}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleCheckout(tier.key)}
              disabled={isProcessing}
              className="min-w-[200px]"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : tier.price === 0 ? (
                'Activate Free Plan'
              ) : (
                `Upgrade to ${tier.displayName} - $${tier.price}/mo`
              )}
            </Button>
          </div>

          {/* Security Badge */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              🔒 Secure payment powered by Stripe
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
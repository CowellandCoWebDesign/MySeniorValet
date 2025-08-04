import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Loader2, X, Star, Shield, Trophy, Crown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { NavigationHeader } from '@/components/NavigationHeader';

const SUBSCRIPTION_TIERS = {
  verified: {
    key: 'verified',
    displayName: 'Verified Listing',
    price: 0,
    color: 'bg-gray-100 text-gray-800',
    icon: CheckCircle2,
    features: [
      'Claim your listing for free',
      'Edit contact info (phone, website, email, address)',
      'Upload 1 photo',
      'Tour Scheduler enabled if email is present',
      'Appears in basic search results'
    ],
    limitations: [
      'Cannot respond to reviews',
      'No PDF uploads',
      'No analytics',
      'No visibility boost'
    ],
    note: ''
  },
  standard: {
    key: 'standard',
    displayName: 'Standard',
    price: 149,
    color: 'bg-blue-100 text-blue-800',
    icon: Star,
    features: [
      'All Verified features, plus:',
      'Upload up to 10 photos',
      'Upload 1 brochure PDF',
      'Add external calendar link',
      'Access basic analytics',
      'Can respond to reviews',
      '"Standard Verified" badge'
    ],
    limitations: [],
    note: ''
  },
  featured: {
    key: 'featured',
    displayName: 'Featured',
    price: 249,
    color: 'bg-purple-100 text-purple-800',
    icon: Shield,
    features: [
      'All Standard features, plus:',
      'Upload up to 25 photos',
      '1 video (max 2 mins)',
      'Upload up to 3 PDFs',
      'Featured placement in search & maps',
      'In-app messaging + AI assist',
      'Promo badge support',
      'Concierge "Preferred" tag'
    ],
    limitations: [],
    note: ''
  },
  platinum: {
    key: 'platinum',
    displayName: 'Platinum',
    price: 349,
    color: 'bg-yellow-100 text-yellow-800',
    icon: Crown,
    features: [
      'All Featured features, plus:',
      'Upload up to 50 photos',
      'Up to 3 videos (5 mins each)',
      'Unlimited PDFs',
      'Staff bios, care philosophy, menus',
      'Availability sync (form, spreadsheet, or API)',
      'Admin dashboard (multi-property view if licensed)',
      'Top Concierge Priority',
      'Monthly performance review call'
    ],
    limitations: [],
    note: 'Portfolio operators must subscribe per community'
  }
};

export default function CommunitySubscriptionCheckout() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const communityId = searchParams.get('communityId');
  const selectedTier = searchParams.get('tier') || 'standard';
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch community details
  const { data: community, isLoading: communityLoading } = useQuery({
    queryKey: [`/api/communities/${communityId}`],
    enabled: !!communityId,
  });

  // Handle checkout
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
    setIsProcessing(true);
    createCheckoutSession.mutate(tierKey);
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
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {community.name}
            </p>
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
                        <p className="text-2xl font-bold">${tierOption.price}<span className="text-sm font-normal">/mo</span></p>
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
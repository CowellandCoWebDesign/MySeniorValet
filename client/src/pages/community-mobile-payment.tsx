import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Shield, CheckCircle2, Star, Crown, Trophy, UserPlus, LogIn, TrendingUp, Sparkles } from 'lucide-react';
import { NavigationHeader } from '@/components/NavigationHeader';
// Removed MobilePaymentForm - using direct Stripe Checkout for subscriptions
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import PaymentJourneyTracker, { COMMUNITY_PAYMENT_STEPS, PaymentStep } from '@/components/PaymentJourneyTracker';
import { useAuth } from '@/hooks/useAuth';
import { getCommunityTier, COMMUNITY_TIERS, LEGACY_TIER_MAPPING } from '@shared/tiers';
import { PAID_TIERS_DISABLED, CONTACT_SALES_MAILTO } from '@/lib/feature-flags';

// Map tier IDs to icons and colors for visual representation
const TIER_VISUALS = {
  free: {
    icon: CheckCircle2,
    color: 'bg-gray-100 text-gray-800',
  },
  starter: {
    icon: Star,
    color: 'bg-green-100 text-green-800',
  },
  growth: {
    icon: Trophy,
    color: 'bg-blue-100 text-blue-800',
  },
  professional: {
    icon: Shield,
    color: 'bg-purple-100 text-purple-800',
  },
  premium: {
    icon: Sparkles,
    color: 'bg-indigo-100 text-indigo-800',
  },
  enterprise: {
    icon: Crown,
    color: 'bg-yellow-100 text-yellow-800',
  },
};

export default function CommunityMobilePayment() {
  const { tier } = useParams();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [communityData, setCommunityData] = useState<any>(null);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState('account-setup');
  const [paymentSteps, setPaymentSteps] = useState<PaymentStep[]>(COMMUNITY_PAYMENT_STEPS);
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

  // Handle legacy tier names for backward compatibility
  const actualTierId = LEGACY_TIER_MAPPING[tier as string] || tier;
  const tierInfo = getCommunityTier(actualTierId as string);
  const tierVisual = TIER_VISUALS[actualTierId as keyof typeof TIER_VISUALS] || TIER_VISUALS.starter;
  const Icon = tierVisual.icon;

  useEffect(() => {
    if (authLoading) return;

    if (!tierInfo || tierInfo.price === 0) {
      setError('Invalid tier selected. Please choose a valid subscription plan.');
      setIsLoading(false);
      return;
    }

    // Initialize payment steps based on authentication status
    const updatedSteps = paymentSteps.map(step => {
      if (step.id === 'account-setup' && isAuthenticated) {
        return { ...step, status: 'completed' as const };
      }
      if (step.id === 'tier-selection') {
        return { ...step, status: 'completed' as const };
      }
      return step;
    });
    setPaymentSteps(updatedSteps);
    
    // Set current step based on authentication status
    if (!isAuthenticated) {
      setCurrentStep('account-setup');
    } else {
      setCurrentStep('payment-details');
    }

    // Try to get data from sessionStorage first (from community portal)
    const storedData = sessionStorage.getItem('communityUpgradeData');
    if (storedData) {
      const data = JSON.parse(storedData);
      setCommunityData(data);
    } else {
      // If no stored data, this is a direct navigation - create new community payment
      const newCommunityData = {
        isNewCommunity: true,
        communityId: null,
        communityName: 'New Community',
        productId: tier,
        planName: tierDetails.name
      };
      setCommunityData(newCommunityData);
    }
    
    setIsLoading(false);
  }, [tier, tierDetails, authLoading, isAuthenticated]);



  const handlePaymentSuccess = async (paymentIntent: any) => {
    try {
      // Update progress to activation step
      const successSteps = paymentSteps.map(step => {
        if (step.id === 'verification') {
          return { ...step, status: 'completed' as const };
        }
        if (step.id === 'activation') {
          return { ...step, status: 'active' as const };
        }
        return step;
      });
      setPaymentSteps(successSteps);
      setCurrentStep('activation');

      // Confirm payment on backend
      const response = await apiRequest('POST', '/api/payments/confirm-community-payment', {
        paymentIntentId: paymentIntent.id,
        communityId: communityData.communityId || 'new', // Use 'new' for new communities
        tier: tier
      }) as { success: boolean; communityId: string; message: string; tier: string; };

      // Complete all steps
      const completeSteps = successSteps.map(step => {
        if (step.id === 'activation') {
          return { ...step, status: 'completed' as const };
        }
        return step;
      });
      setPaymentSteps(completeSteps);
      
      // Clear session data
      sessionStorage.removeItem('communityUpgradeData');

      toast({
        title: "Payment Successful!",
        description: `Your community has been created and upgraded to ${tierDetails.name}.`,
      });

      // Redirect to the newly created community page
      setTimeout(() => {
        // Use the actual communityId returned from the backend
        const finalCommunityId = response.communityId || communityData.communityId || 'new';
        console.log('Payment response:', response);
        console.log('Redirecting to community ID:', finalCommunityId);
        
        // If we have a valid community ID, redirect to it
        if (finalCommunityId && finalCommunityId !== 'new') {
          setLocation(`/community/${finalCommunityId}`);
        } else {
          // Fallback to search if no valid ID
          console.error('No valid community ID received, redirecting to search');
          setLocation('/map-search');
        }
      }, 2000);
    } catch (err) {
      console.error('Error confirming payment:', err);
      toast({
        title: "Payment Error",
        description: "Payment was processed but upgrade failed. Our team will resolve this within 24 hours.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    sessionStorage.removeItem('communityUpgradeData');
    setLocation(`/community/${communityData?.communityId || ''}`);
  };

  const handleCreateCheckout = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Create Stripe Checkout Session for subscription
      const response = await apiRequest(
        'POST',
        '/api/payments/create-subscription-checkout',
        {
          tier: tier,
          communityId: communityData?.communityId || null,
          communityName: communityData?.communityName || 'New Community',
          userEmail: user?.email || null,
          successUrl: `${window.location.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/community-mobile-payment/${tier}`
        }
      );

      if (response.url) {
        // Update payment steps to show we're going to Stripe
        const checkoutSteps = paymentSteps.map(step => {
          if (step.id === 'payment-details') {
            return { ...step, status: 'active' as const };
          }
          if (step.id === 'account-setup' || step.id === 'tier-selection') {
            return { ...step, status: 'completed' as const };
          }
          return step;
        });
        setPaymentSteps(checkoutSteps);
        
        // Redirect to Stripe Checkout
        window.location.href = response.url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      setError(error.message || 'Unable to process payment. Please try again.');
      toast({
        title: "Payment Error",
        description: error.message || "Unable to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <NavigationHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // If paid tiers are disabled and this is not the free tier, show Coming Soon
  if (PAID_TIERS_DISABLED && actualTierId !== 'free' && tierInfo) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <NavigationHeader />
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-md mx-auto text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <Icon className="h-12 w-12 text-gray-400" />
              </div>
              <CardTitle className="text-2xl">{tierInfo.displayName}</CardTitle>
              <div className="mt-2">
                <span className="inline-block bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold px-3 py-1 rounded-full">
                  Coming Soon
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                This subscription tier is not yet available for purchase. We're working hard to bring it to you soon!
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Interested in early access? Reach out to our sales team.
              </p>
              <Button
                onClick={() => window.open(CONTACT_SALES_MAILTO, '_blank')}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white"
              >
                Contact Sales →
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation('/community-portal')}
                className="w-full"
              >
                Return to Community Portal
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !tierInfo) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <NavigationHeader />
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Invalid tier selected'}</p>
              <Button onClick={() => setLocation('/community-portal')}>
                Return to Community Portal
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Icon already set above

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavigationHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Payment Journey Progress Tracker */}
          <div className="mb-8">
            <PaymentJourneyTracker 
              currentStep={currentStep}
              steps={paymentSteps}
              showTroubleshooting={true}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <Card className="h-fit">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Complete Your Upgrade</CardTitle>
                  <CardDescription>
                    {communityData?.communityName || 'Community'}
                  </CardDescription>
                </div>
                <Badge className={tierVisual.color}>
                  <Icon className="mr-1 h-4 w-4" />
                  {tierInfo.displayName}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="font-semibold">{tierInfo.displayName} Subscription</span>
                  <span className="text-2xl font-bold">{tierInfo.priceDisplay}</span>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Included Features:</h4>
                  <ul className="space-y-1">
                    {tierInfo.highlights.slice(0, 4).map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {tierInfo.highlights.length > 4 && (
                      <li className="text-sm text-gray-500 dark:text-gray-500 pl-6">
                        ...and {tierInfo.highlights.length - 4} more features
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Setup or Payment Form */}
          {currentStep === 'account-setup' && !isAuthenticated ? (
            <Card>
              <CardHeader>
                <CardTitle>Create Your Account</CardTitle>
                <CardDescription>
                  Sign up or log in to complete your purchase and manage your subscription
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Your {tierInfo.displayName} subscription will be linked to your account for easy management and renewal.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Button 
                    onClick={() => {
                      // Store tier selection for after login
                      sessionStorage.setItem('pendingCommunityTier', tier as string);
                      sessionStorage.setItem('pendingCommunityData', JSON.stringify(communityData));
                      setLocation('/signup');
                    }}
                    className="w-full"
                    size="lg"
                  >
                    <UserPlus className="mr-2 h-5 w-5" />
                    Create New Account
                  </Button>
                  
                  <Button 
                    onClick={() => {
                      // Store tier selection for after login
                      sessionStorage.setItem('pendingCommunityTier', tier as string);
                      sessionStorage.setItem('pendingCommunityData', JSON.stringify(communityData));
                      setLocation('/login');
                    }}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    <LogIn className="mr-2 h-5 w-5" />
                    Sign In to Existing Account
                  </Button>
                </div>
                
                <div className="text-center text-sm text-gray-500 dark:text-gray-400 pt-2">
                  <Shield className="inline-block mr-1 h-4 w-4" />
                  Your payment information is secured with bank-level encryption
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
                <CardDescription>
                  Enter your payment details to complete the upgrade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Price display */}
                  <div className="text-center py-4">
                    <div className="text-3xl font-bold">
                      ${tierDetails.price}
                      <span className="text-lg font-normal text-gray-500">/month</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Cancel anytime • No hidden fees
                    </p>
                  </div>

                  {/* Error message */}
                  {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  {/* Checkout button */}
                  <Button
                    onClick={handleCreateCheckout}
                    disabled={isLoading}
                    className="w-full h-12 text-lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Creating secure checkout...
                      </>
                    ) : (
                      <>
                        <Shield className="h-5 w-5 mr-2" />
                        Subscribe Now
                      </>
                    )}
                  </Button>

                  {/* Security badge */}
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Shield className="h-4 w-4" />
                    <span>Secure payment powered by Stripe</span>
                  </div>

                  {/* Cancel button */}
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep('tier-selection')}
                    disabled={isLoading}
                    className="w-full"
                  >
                    Back to tier selection
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          </div>

          {/* Trust Badges */}
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center justify-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Your payment information is secure and encrypted</span>
            </div>
            <p className="mt-2">
              Questions? Contact us at hello@myseniorvalet.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
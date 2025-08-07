import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Shield, CheckCircle2, Star, Crown, Trophy } from 'lucide-react';
import { NavigationHeader } from '@/components/NavigationHeader';
import { MobilePaymentForm } from '@/components/MobilePaymentForm';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import PaymentJourneyTracker, { COMMUNITY_PAYMENT_STEPS, PaymentStep } from '@/components/PaymentJourneyTracker';

const TIER_DETAILS = {
  standard: {
    name: 'Standard',
    price: 149,
    icon: Star,
    color: 'bg-blue-100 text-blue-800',
    features: [
      'Upload up to 10 photos',
      'Upload 1 brochure PDF',
      'Add external calendar link',
      'Access basic analytics',
      'Can respond to reviews',
      '"Standard Verified" badge'
    ]
  },
  featured: {
    name: 'Featured',
    price: 249,
    icon: Shield,
    color: 'bg-purple-100 text-purple-800',
    features: [
      'All Standard features, plus:',
      'Upload up to 25 photos',
      '1 video (max 2 mins)',
      'Upload up to 3 PDFs',
      'Featured placement in search & maps',
      'In-app messaging + AI assist',
      'Promo badge support',
      'Concierge "Preferred" tag'
    ]
  },
  platinum: {
    name: 'Platinum',
    price: 349,
    icon: Crown,
    color: 'bg-yellow-100 text-yellow-800',
    features: [
      'All Featured features, plus:',
      'Upload up to 50 photos',
      'Up to 3 videos (5 mins each)',
      'Unlimited PDFs',
      'Staff bios, care philosophy, menus',
      'Availability sync',
      'Admin dashboard',
      'Top Concierge Priority',
      'Monthly performance review call'
    ]
  }
};

export default function CommunityMobilePayment() {
  const { tier } = useParams();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [communityData, setCommunityData] = useState<any>(null);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState('tier-selection');
  const [paymentSteps, setPaymentSteps] = useState<PaymentStep[]>(COMMUNITY_PAYMENT_STEPS);

  const tierDetails = TIER_DETAILS[tier as keyof typeof TIER_DETAILS];

  useEffect(() => {
    if (!tierDetails) {
      setError('Invalid tier selected. Please choose a valid subscription plan.');
      setIsLoading(false);
      return;
    }

    // Initialize payment steps based on tier selection
    const updatedSteps = paymentSteps.map(step => {
      if (step.id === 'tier-selection') {
        return { ...step, status: 'completed' as const };
      }
      return step;
    });
    setPaymentSteps(updatedSteps);
    setCurrentStep('payment-details');

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
  }, [tier, tierDetails]);



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
          setLocation('/search');
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

  if (error || !tierDetails) {
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

  const TierIcon = tierDetails.icon;

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
                <Badge className={tierDetails.color}>
                  <TierIcon className="mr-1 h-4 w-4" />
                  {tierDetails.name}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="font-semibold">{tierDetails.name} Subscription</span>
                  <span className="text-2xl font-bold">${tierDetails.price}/mo</span>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Included Features:</h4>
                  <ul className="space-y-1">
                    {tierDetails.features.slice(0, 4).map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {tierDetails.features.length > 4 && (
                      <li className="text-sm text-gray-500 dark:text-gray-500 pl-6">
                        ...and {tierDetails.features.length - 4} more features
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
              <CardDescription>
                Enter your payment details to complete the upgrade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MobilePaymentForm
                productId={tier || ''}
                productName={`${tierDetails.name} Community Subscription`}
                price={tierDetails.price * 100}
                metadata={{
                  communityId: communityData?.communityId || 'new',
                  communityName: communityData?.communityName || 'New Community',
                  tier: tier || '',
                  type: 'community_subscription'
                }}
                onSuccess={handlePaymentSuccess}
                onCancel={handleCancel}
              />
            </CardContent>
          </Card>
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
import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  Building, 
  ArrowRight, 
  Home,
  Award,
  Sparkles,
  Rocket,
  MessageSquare
} from "lucide-react";
import { Header } from "@/components/header";
import confetti from "canvas-confetti";
import { apiRequest } from "@/lib/queryClient";

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    const fetchPaymentData = async () => {
      // First check for session ID in URL
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get('session_id');
      
      if (sessionId) {
        try {
          const response = await apiRequest('GET', `/api/payments/session/${sessionId}`);
          const data = await response.json();
          
          if (data.success && data.session) {
            const sessionData = data.session;
            const paymentInfo = {
              tier: sessionData.tier,
              amount: sessionData.amountTotal / 100, // Convert from cents
              communityId: sessionData.metadata?.communityId || sessionData.community?.id,
              communityName: sessionData.community?.name || 'Your Community',
              customerEmail: sessionData.customerEmail
            };
            
            setPaymentData(paymentInfo);
            
            // Trigger confetti animation
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            });
          }
        } catch (error) {
          console.error('Error fetching session data:', error);
        }
      } else {
        // Fall back to session storage
        const storedData = sessionStorage.getItem('paymentSuccessData');
        if (storedData) {
          setPaymentData(JSON.parse(storedData));
          // Clear the data after retrieving
          sessionStorage.removeItem('paymentSuccessData');
          
          // Trigger confetti animation
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        } else {
          // If no payment data, redirect to home
          setLocation('/');
        }
      }
    };
    
    fetchPaymentData();
  }, [setLocation]);

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const tierFeatures = {
    platinum: {
      color: 'from-amber-500 to-orange-500',
      icon: <Rocket className="w-12 h-12 text-amber-600" />,
      title: 'Welcome to Platinum!',
      features: [
        'Up to 50 photos & 3 videos',
        'Unlimited PDF uploads',
        'Top concierge priority',
        'Monthly performance calls',
        'Admin dashboard access'
      ]
    },
    featured: {
      color: 'from-purple-500 to-violet-500',
      icon: <Award className="w-12 h-12 text-purple-600" />,
      title: 'Welcome to Featured!',
      features: [
        'Up to 25 photos & 1 video',
        'Featured search placement',
        'In-app messaging with AI',
        'Promo badge support',
        'Advanced analytics'
      ]
    },
    standard: {
      color: 'from-blue-500 to-sky-500',
      icon: <Sparkles className="w-12 h-12 text-blue-600" />,
      title: 'Welcome to Standard!',
      features: [
        'Up to 10 photos',
        '1 brochure PDF upload',
        'Basic analytics access',
        'Review response capability',
        'External calendar link'
      ]
    }
  };

  const tierInfo = tierFeatures[paymentData.tier as keyof typeof tierFeatures] || tierFeatures.standard;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Success Card */}
        <Card className="overflow-hidden shadow-2xl">
          <div className={`h-3 bg-gradient-to-r ${tierInfo.color}`} />
          
          <CardContent className="p-8 text-center">
            {/* Success Icon */}
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${tierInfo.color} opacity-20 absolute inset-0 animate-pulse`} />
                <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center relative">
                  <CheckCircle className="w-16 h-16 text-green-500" />
                </div>
              </div>
            </div>

            {/* Success Message */}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Payment Successful!
            </h1>
            
            <div className="mb-8">
              <h2 className={`text-2xl font-semibold bg-gradient-to-r ${tierInfo.color} bg-clip-text text-transparent mb-2`}>
                {tierInfo.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Your {paymentData.communityName || 'community'} has been upgraded to the {paymentData.tier} tier
              </p>
            </div>

            {/* Tier Features */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-center mb-4">
                {tierInfo.icon}
              </div>
              <h3 className="font-semibold text-lg mb-3">Your New Features:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {tierInfo.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-left">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-lg mb-3 text-blue-900 dark:text-blue-100">
                What's Next?
              </h3>
              <div className="space-y-3 text-sm text-left">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-semibold">
                    1
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>Complete Your Profile:</strong> Add photos, descriptions, and amenities to attract more families
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-semibold">
                    2
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>Upload Media:</strong> Take advantage of your new photo and video limits
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-semibold">
                    3
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>Monitor Performance:</strong> Use your analytics dashboard to track views and inquiries
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => setLocation(`/community-dashboard/${paymentData.communityId}`)}
                className={`bg-gradient-to-r ${tierInfo.color} hover:opacity-90 text-white`}
                size="lg"
              >
                <Building className="w-5 h-5 mr-2" />
                Go to Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setLocation('/')}
                size="lg"
              >
                <Home className="w-5 h-5 mr-2" />
                Return Home
              </Button>
            </div>

            {/* Support Message */}
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <MessageSquare className="w-4 h-4" />
                <p>
                  Questions? Our support team is here to help at{' '}
                  <a href="mailto:support@myseniorvalet.com" className="text-blue-600 hover:underline">
                    support@myseniorvalet.com
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Receipt Info */}
        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>A receipt has been emailed to {paymentData.email || 'your registered email'}</p>
          <p className="mt-1">Transaction ID: {paymentData.paymentIntentId || 'Processing...'}</p>
        </div>
      </div>
    </div>
  );
}
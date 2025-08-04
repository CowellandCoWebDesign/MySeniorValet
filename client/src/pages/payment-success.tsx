import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Home, ArrowRight } from 'lucide-react';
import { NavigationHeader } from '@/components/NavigationHeader';

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  useEffect(() => {
    // Check for payment session info in URL params
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    const type = params.get('type');
    const tier = params.get('tier');

    if (sessionId) {
      setPaymentDetails({
        sessionId,
        type,
        tier
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavigationHeader />
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-center text-gray-600 dark:text-gray-400">
              Thank you for your payment. Your subscription has been activated.
            </p>

            {paymentDetails?.type === 'vendor' && (
              <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
                <h3 className="font-semibold mb-2">What's Next?</h3>
                <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• Check your email for login credentials</li>
                  <li>• Complete your vendor profile</li>
                  <li>• Start receiving qualified leads</li>
                </ul>
              </div>
            )}

            {paymentDetails?.type === 'community' && (
              <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Your Community is Upgraded!</h3>
                <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• Access your dashboard to manage your listing</li>
                  <li>• Upload photos and update information</li>
                  <li>• Track your community's performance</li>
                </ul>
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={() => setLocation('/')}
                className="flex-1"
              >
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
              <Button 
                onClick={() => setLocation(paymentDetails?.type === 'vendor' ? '/vendor/dashboard' : '/community-dashboard')}
                className="flex-1"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
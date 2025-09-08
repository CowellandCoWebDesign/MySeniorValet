import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CreditCard, CheckCircle } from 'lucide-react';

// Initialize Stripe with public key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

function CheckoutForm({ amount, tier }: { amount: number; tier: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
      },
      redirect: 'if_required',
    });

    if (error) {
      toast({
        title: 'Payment failed',
        description: error.message,
        variant: 'destructive',
      });
      setIsProcessing(false);
    } else {
      setPaymentSuccess(true);
      toast({
        title: 'Payment successful!',
        description: `Your ${tier} subscription has been activated.`,
      });
    }
  };

  if (paymentSuccess) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
        <p className="text-gray-600">Your subscription has been activated.</p>
        <p className="text-sm mt-4 text-gray-500">Check the admin dashboard to see the payment recorded.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing} 
        className="w-full"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay ${(amount / 100).toFixed(2)}
          </>
        )}
      </Button>
      
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200 font-semibold mb-2">Test Card Numbers:</p>
        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
          <li>✅ Success: 4242 4242 4242 4242</li>
          <li>❌ Decline: 4000 0000 0000 0002</li>
          <li>🔒 3D Secure: 4000 0025 0000 3155</li>
        </ul>
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">Use any future date and any 3-digit CVC</p>
      </div>
    </form>
  );
}

export default function TestPaymentPage() {
  const [clientSecret, setClientSecret] = useState('');
  const [selectedTier, setSelectedTier] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const subscriptionTiers = [
    { id: 'starter', name: 'Starter', price: 9900, description: 'Perfect for small communities' },
    { id: 'growth', name: 'Growth', price: 24900, description: 'For growing communities' },
    { id: 'professional', name: 'Professional', price: 49900, description: 'Advanced features included' },
    { id: 'premium', name: 'Premium', price: 99900, description: 'All features unlocked' },
    { id: 'enterprise', name: 'Enterprise', price: 399900, description: 'Fortune 500 level' },
  ];

  const createPaymentIntent = async (tier: typeof subscriptionTiers[0]) => {
    setLoading(true);
    try {
      const response = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier: tier.id,
          type: 'community',
          amount: tier.price,
          metadata: {
            tierName: tier.name,
            testPayment: true,
          },
        }),
      });

      const data = await response.json();

      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setSelectedTier(tier.name);
        toast({
          title: 'Payment ready',
          description: `You can now complete your ${tier.name} subscription payment.`,
        });
      } else {
        throw new Error(data.error || 'Failed to create payment intent');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to initialize payment',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-3xl">Test Payment System</CardTitle>
          <CardDescription>
            Select a subscription tier below to test the payment flow. This will demonstrate the complete payment process 
            including Stripe integration, webhook processing, and real-time dashboard updates.
          </CardDescription>
        </CardHeader>
      </Card>

      {!clientSecret ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {subscriptionTiers.map((tier) => (
            <Card key={tier.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">
                  ${(tier.price / 100).toFixed(0)}
                  <span className="text-sm font-normal text-gray-500">/month</span>
                </div>
                <Button 
                  onClick={() => createPaymentIntent(tier)}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    'Select Plan'
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Complete Your {selectedTier} Subscription</CardTitle>
            <CardDescription>
              Enter your payment details below. Use the test card numbers provided for testing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm amount={subscriptionTiers.find(t => t.name === selectedTier)?.price || 0} tier={selectedTier} />
            </Elements>
          </CardContent>
        </Card>
      )}

      <Card className="mt-8 bg-gray-50 dark:bg-gray-900">
        <CardHeader>
          <CardTitle>How This Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>1. Select a subscription tier above</p>
          <p>2. Enter test card details (4242 4242 4242 4242)</p>
          <p>3. Complete the payment</p>
          <p>4. Stripe webhook will process the payment event</p>
          <p>5. Check your admin dashboard to see the payment recorded</p>
          <p>6. Real-time WebSocket will update the dashboard immediately</p>
        </CardContent>
      </Card>
    </div>
  );
}
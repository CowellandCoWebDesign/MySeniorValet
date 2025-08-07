import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, Shield, Check, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Initialize Stripe with publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface MobilePaymentFormProps {
  productId: string;
  productName: string;
  price: number; // in cents
  customerId?: string;
  metadata?: Record<string, string>;
  onSuccess: (paymentIntent: any) => void;
  onCancel?: () => void;
}

// Payment form component that uses Payment Element
function PaymentForm({ productId, productName, price, customerId, metadata, onSuccess, onCancel }: MobilePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      // Confirm the payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // Return URL is required but we'll handle success before redirect
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required' // Only redirect if necessary (e.g., 3D Secure)
      });

      if (error) {
        // Show error to customer
        setErrorMessage(error.message || 'An unexpected error occurred.');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded
        toast({
          title: "Payment Successful!",
          description: "Your subscription has been activated.",
        });
        onSuccess(paymentIntent);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment failed. Please try again.');
      console.error('Error confirming payment:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Element - Stripe's mobile-optimized UI */}
      <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
        <PaymentElement 
          options={{
            layout: {
              type: 'tabs',
              defaultCollapsed: false,
              radios: true,
              spacedAccordionItems: false
            },
            wallets: {
              applePay: 'auto',
              googlePay: 'auto'
            }
          }}
        />
      </div>

      {/* Error Message */}
      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Shield className="h-4 w-4" />
        <span>Secure payment powered by Stripe</span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Pay ${(price / 100).toFixed(2)}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

// Main component that wraps payment form with Elements provider
export function MobilePaymentForm(props: MobilePaymentFormProps) {
  const [clientSecret, setClientSecret] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Create payment intent when component mounts
    const createPaymentIntent = async () => {
      try {
        // Determine tier and type from productId
        const tier = props.productId; // productId is actually the tier name (standard, featured, platinum, etc.)
        const type = ['standard', 'featured', 'platinum'].includes(tier) ? 'community' : 'vendor';
        
        const response = await fetch('/api/payments/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tier: tier,
            type: type,
            metadata: {
              ...props.metadata,
              productName: props.productName,
              productId: props.productId,
              customerId: props.customerId || undefined
            }
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create payment intent');
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error('Error creating payment intent:', err);
        setError('Failed to initialize payment. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [props.productId, props.price, props.customerId, props.metadata, props.productName]);

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Initializing secure payment...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button 
            className="w-full mt-4" 
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!clientSecret) {
    return null;
  }

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#6366f1',
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      colorDanger: '#ef4444',
      fontFamily: 'system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Complete Your Payment</CardTitle>
        <CardDescription>
          {props.productName} - ${(props.price / 100).toFixed(2)}/month
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Elements 
          stripe={stripePromise} 
          options={{ 
            clientSecret,
            appearance,
            loader: 'auto'
          }}
        >
          <PaymentForm {...props} />
        </Elements>
      </CardContent>
    </Card>
  );
}

// Mobile-optimized checkout modal component
export function MobilePaymentModal({ 
  isOpen, 
  onClose, 
  ...paymentProps 
}: MobilePaymentFormProps & { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-t-xl sm:rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <MobilePaymentForm 
          {...paymentProps} 
          onCancel={onClose}
          onSuccess={(paymentIntent) => {
            paymentProps.onSuccess(paymentIntent);
            onClose();
          }}
        />
      </div>
    </div>
  );
}
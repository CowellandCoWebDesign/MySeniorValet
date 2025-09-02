import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, CheckCircle, CreditCard, Lock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Initialize Stripe with publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder');

interface StripePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  description: string;
  communityName: string;
  communityId: number;
  unitType?: string;
  onSuccess: (paymentIntent: any) => void;
  metadata?: Record<string, any>;
}

// Payment form component
function PaymentForm({ 
  amount, 
  description, 
  onSuccess, 
  onClose,
  communityName,
  unitType 
}: Omit<StripePaymentModalProps, 'isOpen'>) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required'
      });

      if (error) {
        setErrorMessage(error.message || 'Payment failed');
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast({
          title: "Payment Successful!",
          description: `Your $${amount} deposit has been processed`,
        });
        onSuccess(paymentIntent);
        onClose();
      }
    } catch (err: any) {
      setErrorMessage('An unexpected error occurred');
      console.error('Payment error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Summary */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Community:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{communityName}</span>
            </div>
            {unitType && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Unit Type:</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{unitType}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm text-gray-600 dark:text-gray-400">Deposit Amount:</span>
              <span className="text-xl font-bold text-green-600">${amount}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Lock className="w-4 h-4" />
        <span>Secure payment powered by Stripe</span>
      </div>

      {/* Stripe Payment Element */}
      <div className="border rounded-lg p-4 bg-white dark:bg-gray-800">
        <PaymentElement 
          options={{
            layout: 'tabs',
            paymentMethodOrder: ['card']
          }}
        />
      </div>

      {/* Trust Indicators */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="space-y-1 text-sm">
            <p className="font-semibold text-blue-800 dark:text-blue-200">100% Secure & Refundable</p>
            <p className="text-blue-700 dark:text-blue-300">
              Your deposit is fully refundable within 30 days. Your payment information is encrypted and secure.
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isProcessing}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || !elements || isProcessing}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Pay ${amount} Deposit
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

// Main modal component
export function StripePaymentModal({
  isOpen,
  onClose,
  amount,
  description,
  communityName,
  communityId,
  unitType,
  onSuccess,
  metadata = {}
}: StripePaymentModalProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      createPaymentIntent();
    }
  }, [isOpen]);

  const createPaymentIntent = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiRequest('POST', '/api/payments/create-intent', {
        communityId,
        amount: amount * 100, // Convert to cents
        currency: 'usd',
        description,
        metadata: {
          ...metadata,
          unitType,
          type: 'reservation_deposit'
        }
      });

      if (response.success && response.paymentIntent?.client_secret) {
        setClientSecret(response.paymentIntent.client_secret);
      } else {
        throw new Error('Failed to create payment intent');
      }
    } catch (err: any) {
      console.error('Failed to create payment intent:', err);
      setError('Unable to initialize payment. Please try again.');
      toast({
        title: "Payment Setup Failed",
        description: "Unable to initialize payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stripeOptions = {
    clientSecret: clientSecret || undefined,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#10b981',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#ef4444',
        fontFamily: 'system-ui, sans-serif',
        borderRadius: '8px',
      },
    },
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-green-600" />
            Secure Reservation Payment
          </DialogTitle>
          <DialogDescription>
            Complete your reservation with a refundable $500 deposit
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Preparing secure payment...
              </p>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
              <Button 
                onClick={createPaymentIntent} 
                className="mt-4"
                variant="outline"
              >
                Try Again
              </Button>
            </Alert>
          ) : clientSecret ? (
            <Elements stripe={stripePromise} options={stripeOptions}>
              <PaymentForm
                amount={amount}
                description={description}
                communityName={communityName}
                communityId={communityId}
                unitType={unitType}
                onSuccess={onSuccess}
                onClose={onClose}
              />
            </Elements>
          ) : null}
        </div>

        {/* What Happens Next */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">What happens after payment?</h4>
          <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3 h-3 text-green-500 mt-0.5" />
              <span>You'll receive instant email confirmation</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3 h-3 text-green-500 mt-0.5" />
              <span>A move-in coordinator will contact you within 24 hours</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3 h-3 text-green-500 mt-0.5" />
              <span>Your unit will be reserved for 30 days</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3 h-3 text-green-500 mt-0.5" />
              <span>Full refund available if plans change</span>
            </li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
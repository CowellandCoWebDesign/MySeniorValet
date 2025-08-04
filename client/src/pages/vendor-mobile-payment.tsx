import React, { useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { MobilePaymentForm } from '@/components/MobilePaymentForm';
import { NavigationHeader } from '@/components/NavigationHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { VENDOR_PRODUCTS } from '@/lib/vendor-products';
import PaymentJourneyTracker, { VENDOR_PAYMENT_STEPS, PaymentStep } from '@/components/PaymentJourneyTracker';

export default function VendorMobilePayment() {
  const [, setLocation] = useLocation();
  const { productId } = useParams<{ productId: string }>();
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [currentStep, setCurrentStep] = useState('business-info');
  const [paymentSteps, setPaymentSteps] = useState<PaymentStep[]>(VENDOR_PAYMENT_STEPS);

  // Get vendor data from session storage (passed from signup form)
  const vendorDataString = sessionStorage.getItem('vendorSignupData');
  const vendorData = vendorDataString ? JSON.parse(vendorDataString) : null;

  // Find the selected product
  const product = VENDOR_PRODUCTS.find(p => p.id === productId);

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <NavigationHeader />
        <div className="container mx-auto px-4 py-16">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Invalid product selection. Please try again.</AlertDescription>
          </Alert>
          <Button 
            className="mt-4"
            onClick={() => setLocation('/vendor-signup')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Vendor Signup
          </Button>
        </div>
      </div>
    );
  }

  if (!vendorData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <NavigationHeader />
        <div className="container mx-auto px-4 py-16">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Missing vendor information. Please complete the signup form first.</AlertDescription>
          </Alert>
          <Button 
            className="mt-4"
            onClick={() => setLocation('/vendor-signup')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Vendor Signup
          </Button>
        </div>
      </div>
    );
  }

  // Initialize payment steps based on vendor signup progress
  React.useEffect(() => {
    const updatedSteps = paymentSteps.map(step => {
      if (step.id === 'business-info') {
        return { ...step, status: 'completed' as const };
      }
      if (step.id === 'tier-selection') {
        return { ...step, status: 'completed' as const };
      }
      if (step.id === 'payment-details') {
        return { ...step, status: 'active' as const };
      }
      return step;
    });
    setPaymentSteps(updatedSteps);
    setCurrentStep('payment-details');
  }, []);

  const handlePaymentSuccess = async (paymentIntent: any) => {
    try {
      // Update progress to marketplace setup
      const successSteps = paymentSteps.map(step => {
        if (step.id === 'payment-details') {
          return { ...step, status: 'completed' as const };
        }
        if (step.id === 'marketplace-setup') {
          return { ...step, status: 'active' as const };
        }
        return step;
      });
      setPaymentSteps(successSteps);
      setCurrentStep('marketplace-setup');

      // Confirm payment on the backend
      const response = await fetch('/api/payments/confirm-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId: paymentIntent.id,
          productId: product.id,
          vendorData: vendorData
        })
      });

      if (response.ok) {
        // Complete all steps
        const completeSteps = successSteps.map(step => {
          if (step.id === 'marketplace-setup') {
            return { ...step, status: 'completed' as const };
          }
          return step;
        });
        setPaymentSteps(completeSteps);
        
        setPaymentSuccess(true);
        // Clear vendor data from session
        sessionStorage.removeItem('vendorSignupData');
      } else {
        throw new Error('Failed to confirm payment');
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      setPaymentError('Payment was processed but there was an error setting up your account. Our team will contact you shortly.');
      
      // Update steps to show error
      const errorSteps = paymentSteps.map(step => {
        if (step.id === 'marketplace-setup') {
          return { ...step, status: 'error' as const };
        }
        return step;
      });
      setPaymentSteps(errorSteps);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <NavigationHeader />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>Payment Successful!</CardTitle>
              <CardDescription>
                Welcome to MySeniorValet's Vendor Network
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-gray-600 dark:text-gray-400">
                Thank you for joining our vendor network. You'll receive a confirmation email at <strong>{vendorData.email}</strong> with your account details and next steps.
              </p>
              <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
                <h4 className="font-semibold mb-2">What happens next?</h4>
                <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• You'll receive login credentials via email</li>
                  <li>• Complete your vendor profile</li>
                  <li>• Start receiving qualified leads</li>
                  <li>• Access your vendor dashboard</li>
                </ul>
              </div>
              <Button 
                className="w-full"
                onClick={() => setLocation('/')}
              >
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
            {/* Product Summary */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Vendor Subscription</CardTitle>
                <CardDescription>
                  {product.name} - {vendorData.businessName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b">
                    <span className="font-semibold">{product.name}</span>
                    <span className="text-2xl font-bold">${product.price}/mo</span>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Included Features:</h4>
                    <ul className="space-y-1">
                      {product.features.slice(0, 4).map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                      {product.features.length > 4 && (
                        <li className="text-sm text-gray-500 dark:text-gray-500 pl-6">
                          ...and {product.features.length - 4} more features
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
                <CardTitle>Complete Payment</CardTitle>
                <CardDescription>
                  Enter your payment details to activate your vendor listing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MobilePaymentForm
                  productId={product.id}
                  productName={product.name}
                  price={product.price * 100}
                  metadata={{
                    businessName: vendorData.businessName,
                    email: vendorData.email,
                    phone: vendorData.phone,
                    category: vendorData.category,
                    type: 'vendor_subscription'
                  }}
                  onSuccess={handlePaymentSuccess}
                  onCancel={() => setLocation('/vendor-signup')}
                />
              </CardContent>
            </Card>
          </div>

          {/* Back Button */}
          <div className="mt-8 text-center">
            <Button
              variant="ghost"
              onClick={() => setLocation('/vendor-signup')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Vendor Signup
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
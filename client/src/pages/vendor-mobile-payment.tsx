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
  const [vendorData, setVendorData] = useState<any>(null);

  // Get billing parameters from URL
  const searchParams = new URLSearchParams(window.location.search);
  const billingCycle = searchParams.get('billingCycle') || 'monthly';
  const applyPromo = searchParams.get('promo') === 'true';
  
  // Initialize payment steps and vendor data
  React.useEffect(() => {
    // Get vendor data from session storage
    const vendorDataString = sessionStorage.getItem('vendorSignupData');
    
    // If no vendor data, try to create test data for testing purposes
    if (!vendorDataString && productId) {
      // Create test vendor data for quick testing
      const testVendorData = {
        businessName: `Test Vendor ${Date.now()}`,
        businessType: 'company',
        contactName: 'Test User',
        email: `test-${productId}@myseniorvalet.com`,
        phone: '555-0100',
        city: 'Miami',
        state: 'FL',
        website: 'https://example.com',
        description: `Test vendor for ${productId}`,
        serviceAreas: 'Miami, Fort Lauderdale',
        category: 'Home Care Services',
        planType: productId
      };
      sessionStorage.setItem('vendorSignupData', JSON.stringify(testVendorData));
      setVendorData(testVendorData);
    } else if (vendorDataString) {
      setVendorData(JSON.parse(vendorDataString));
    }

    // Set up payment steps
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
  }, [productId]);

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
      const response = await fetch('/api/payment/confirm-vendor-payment', {
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
        const responseData = await response.json();
        
        // Complete all steps
        const completeSteps = successSteps.map(step => {
          if (step.id === 'marketplace-setup') {
            return { ...step, status: 'completed' as const };
          }
          return step;
        });
        setPaymentSteps(completeSteps);
        
        // Store response data for success message
        sessionStorage.setItem('vendorPaymentResult', JSON.stringify(responseData));
        
        setPaymentSuccess(true);
        // Clear vendor data from session
        sessionStorage.removeItem('vendorSignupData');
        
        // Get vendor ID from response
        const vendorId = responseData.vendorId || 'new';
        
        // Redirect based on action type
        setTimeout(() => {
          if (responseData.action === 'upgraded') {
            // Existing vendor upgraded - go to dashboard
            setLocation(`/vendor-dashboard/${vendorId}`);
          } else {
            // New vendor - go to onboarding
            setLocation(`/vendor-onboarding-wizard/${vendorId}`);
          }
        }, 2000);
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
    const paymentResult = sessionStorage.getItem('vendorPaymentResult');
    const result = paymentResult ? JSON.parse(paymentResult) : null;
    const isUpgrade = result?.action === 'upgraded';
    
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <NavigationHeader />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>
                {isUpgrade ? 'Subscription Upgraded!' : 'Payment Successful!'}
              </CardTitle>
              <CardDescription>
                {isUpgrade 
                  ? `Your subscription has been upgraded to ${result?.newTier?.toUpperCase()} tier`
                  : "Welcome to MySeniorValet's Vendor Network"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isUpgrade ? (
                <>
                  <p className="text-center text-gray-600 dark:text-gray-400">
                    Your vendor account has been successfully upgraded from <strong>{result?.previousTier}</strong> to <strong>{result?.newTier}</strong> tier.
                  </p>
                  <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Your upgraded benefits:</h4>
                    <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                      {result?.newTier === 'national' && (
                        <>
                          <li>• National exposure across all markets</li>
                          <li>• Custom microsite for your business</li>
                          <li>• Priority lead routing</li>
                          <li>• Advanced analytics dashboard</li>
                        </>
                      )}
                      {result?.newTier === 'featured' && (
                        <>
                          <li>• Featured placement in search results</li>
                          <li>• Enhanced profile with media gallery</li>
                          <li>• Lead tracking and analytics</li>
                          <li>• Priority support</li>
                        </>
                      )}
                      {result?.newTier === 'basic' && (
                        <>
                          <li>• Basic vendor profile</li>
                          <li>• Access to qualified leads</li>
                          <li>• Standard support</li>
                        </>
                      )}
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-center text-gray-600 dark:text-gray-400">
                    Thank you for joining our vendor network. You'll receive a confirmation email at <strong>{vendorData?.email || 'your registered email'}</strong> with your account details.
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
                </>
              )}
              <Button 
                className="w-full"
                onClick={() => {
                  sessionStorage.removeItem('vendorPaymentResult');
                  setLocation('/');
                }}
              >
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Calculate actual price based on billing cycle and promo
  let displayPrice = product.price;
  let priceDescription = `$${product.price / 100}/mo`;
  
  if (billingCycle === 'annual') {
    // 20% off annual pricing
    displayPrice = Math.round(product.price * 12 * 0.8); // Total annual price with 20% off
    priceDescription = `$${Math.round(displayPrice / 12) / 100}/mo (billed annually)`;
  } else if (applyPromo) {
    // 50% off first month
    displayPrice = Math.round(product.price / 2);
    priceDescription = `$${displayPrice / 100} first month (then $${product.price / 100}/mo)`;
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
                    <div>
                      <span className="font-semibold block">{product.name}</span>
                      {billingCycle === 'annual' && (
                        <span className="text-sm text-green-600">Save 20% with annual billing</span>
                      )}
                      {applyPromo && billingCycle === 'monthly' && (
                        <span className="text-sm text-green-600">50% off first month</span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold block">{priceDescription.split(' ')[0]}</span>
                      <span className="text-sm text-gray-500">{priceDescription.split(' ').slice(1).join(' ')}</span>
                    </div>
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
                  price={displayPrice}
                  metadata={{
                    businessName: vendorData.businessName,
                    email: vendorData.email,
                    phone: vendorData.phone,
                    category: vendorData.category,
                    type: 'vendor_subscription',
                    billingCycle: billingCycle,
                    applyPromo: applyPromo ? 'true' : 'false'
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
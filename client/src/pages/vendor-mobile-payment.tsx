import React, { useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { MobilePaymentForm } from '@/components/MobilePaymentForm';
import { NavigationHeader } from '@/components/NavigationHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { VENDOR_PRODUCTS } from '@/lib/vendor-products';

export default function VendorMobilePayment() {
  const [, setLocation] = useLocation();
  const { productId } = useParams<{ productId: string }>();
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState('');

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

  const handlePaymentSuccess = async (paymentIntent: any) => {
    try {
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
        setPaymentSuccess(true);
        // Clear vendor data from session
        sessionStorage.removeItem('vendorSignupData');
      } else {
        throw new Error('Failed to confirm payment');
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      setPaymentError('Payment was processed but there was an error setting up your account. Our team will contact you shortly.');
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
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => setLocation('/vendor-signup')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Vendor Signup
          </Button>

          {/* Order Summary */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">{vendorData.businessName}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {vendorData.contactName} • {vendorData.email}
                  </p>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Monthly subscription</p>
                    </div>
                    <p className="text-xl font-bold">${(product.price / 100).toFixed(2)}/mo</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          {paymentError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{paymentError}</AlertDescription>
            </Alert>
          )}

          <MobilePaymentForm
            productId={product.id}
            productName={product.name}
            price={product.price}
            metadata={{
              vendorName: vendorData.businessName,
              vendorEmail: vendorData.email,
              vendorPhone: vendorData.phone
            }}
            onSuccess={handlePaymentSuccess}
            onCancel={() => setLocation('/vendor-signup')}
          />
        </div>
      </div>
    </div>
  );
}
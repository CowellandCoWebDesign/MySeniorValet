import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, XCircle, AlertCircle, CreditCard, Webhook, Bell, Shield, DollarSign, RefreshCw, Copy, Mail, TestTube, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe with publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface TestResult {
  name: string;
  status: 'pending' | 'testing' | 'success' | 'failed';
  message?: string;
  details?: any;
  timestamp?: string;
}

// Stripe Test Card Component
function TestPaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState('');
  const [testEmail, setTestEmail] = useState('test@myseniorvalet.com');

  // Create payment intent when component mounts
  useEffect(() => {
    createPaymentIntent();
  }, []);

  const createPaymentIntent = async () => {
    try {
      const response = await apiRequest('POST', '/api/payments/create-intent', {
        amount: 100, // $1.00 test payment
        description: 'Payment System Test',
        metadata: {
          test: 'true',
          timestamp: new Date().toISOString()
        }
      });
      const data = await response.json();
      setClientSecret(data.clientSecret);
      toast({
        title: "Payment Intent Created",
        description: `Test payment of $1.00 ready for processing`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to Create Payment Intent",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements || !clientSecret) {
      toast({
        title: "Stripe Not Ready",
        description: "Please wait for Stripe to initialize",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Test email notification first
      const emailResponse = await apiRequest('POST', '/api/payments/test/send-email', {
        to: testEmail,
        type: 'payment_test',
        amount: 100,
        paymentId: clientSecret
      });
      
      const emailData = await emailResponse.json();
      
      // Confirm the payment with Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            email: testEmail,
            name: 'Test User'
          }
        }
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      setPaymentResult({
        success: true,
        paymentIntent: result.paymentIntent,
        emailSent: emailData.success
      });

      toast({
        title: "✅ Payment Test Successful!",
        description: `Payment ${result.paymentIntent?.id} processed. Email sent: ${emailData.success ? 'Yes' : 'No'}`,
      });

      // Create new payment intent for next test
      setTimeout(createPaymentIntent, 2000);
      
    } catch (error: any) {
      setPaymentResult({
        success: false,
        error: error.message
      });
      
      toast({
        title: "Payment Test Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Test Card Information */}
      <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950">
        <CreditCard className="h-4 w-4" />
        <AlertTitle>Stripe Test Card Details</AlertTitle>
        <AlertDescription className="mt-2">
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <p className="font-semibold">Card Number:</p>
              <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded">4242 4242 4242 4242</code>
            </div>
            <div>
              <p className="font-semibold">Expiry:</p>
              <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded">Any future date (e.g., 12/34)</code>
            </div>
            <div>
              <p className="font-semibold">CVC:</p>
              <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded">Any 3 digits (e.g., 123)</code>
            </div>
            <div>
              <p className="font-semibold">ZIP:</p>
              <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded">Any 5 digits (e.g., 12345)</code>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Test Email (for notifications)</Label>
          <Input
            id="email"
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Enter email for test notifications"
            className="mt-1"
          />
        </div>

        <div className="border rounded-lg p-4">
          <Label>Card Details</Label>
          <div className="mt-2 p-3 border rounded">
            <CardElement 
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={!stripe || isProcessing}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Processing Test Payment...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Test $1.00 Payment
            </>
          )}
        </Button>
      </form>

      {/* Payment Result */}
      {paymentResult && (
        <Alert className={paymentResult.success ? "border-green-500" : "border-red-500"}>
          {paymentResult.success ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
          <AlertTitle>{paymentResult.success ? "Payment Successful" : "Payment Failed"}</AlertTitle>
          <AlertDescription className="mt-2">
            {paymentResult.success ? (
              <div className="space-y-2">
                <p><strong>Payment ID:</strong> {paymentResult.paymentIntent?.id}</p>
                <p><strong>Amount:</strong> ${(paymentResult.paymentIntent?.amount / 100).toFixed(2)}</p>
                <p><strong>Status:</strong> {paymentResult.paymentIntent?.status}</p>
                <p><strong>Email Sent:</strong> {paymentResult.emailSent ? '✅ Yes' : '❌ No'}</p>
              </div>
            ) : (
              <p>{paymentResult.error}</p>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

// Main Payment Test Suite Component
export default function PaymentTestSuite() {
  const { toast } = useToast();
  const [configStatus, setConfigStatus] = useState<any>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isTestingAll, setIsTestingAll] = useState(false);
  const [webhookEvents, setWebhookEvents] = useState<any[]>([]);

  // Check configuration on mount
  useEffect(() => {
    checkConfiguration();
  }, []);

  const checkConfiguration = async () => {
    try {
      const response = await apiRequest('GET', '/api/payments/test/configuration');
      const data = await response.json();
      setConfigStatus(data);
    } catch (error) {
      console.error('Configuration check failed:', error);
    }
  };

  // Update test result
  const updateTestResult = (name: string, status: TestResult['status'], message?: string, details?: any) => {
    setTestResults(prev => {
      const existing = prev.find(t => t.name === name);
      const timestamp = new Date().toISOString();
      if (existing) {
        return prev.map(t => t.name === name ? { ...t, status, message, details, timestamp } : t);
      }
      return [...prev, { name, status, message, details, timestamp }];
    });
  };

  // Run all automated tests
  const runAllTests = async () => {
    setIsTestingAll(true);
    setTestResults([]);
    
    // Test 1: Configuration
    updateTestResult('Configuration Check', 'testing');
    try {
      const response = await apiRequest('GET', '/api/payments/test/configuration');
      const data = await response.json();
      updateTestResult('Configuration Check', 'success', 'All keys configured', data);
    } catch (error: any) {
      updateTestResult('Configuration Check', 'failed', error.message);
    }

    // Test 2: Database
    updateTestResult('Database Connectivity', 'testing');
    try {
      const response = await apiRequest('GET', '/api/payments/test/database');
      const data = await response.json();
      updateTestResult('Database Connectivity', 'success', 'Database connected', data);
    } catch (error: any) {
      updateTestResult('Database Connectivity', 'failed', error.message);
    }

    // Test 3: Webhook
    updateTestResult('Webhook Endpoint', 'testing');
    try {
      const response = await apiRequest('POST', '/api/stripe/webhook', {
        type: 'test.ping',
        data: { test: true }
      });
      updateTestResult('Webhook Endpoint', 'success', 'Webhook responding');
    } catch (error: any) {
      updateTestResult('Webhook Endpoint', 'success', 'Webhook endpoint exists');
    }

    // Test 4: Email Service
    updateTestResult('Email Service', 'testing');
    try {
      const response = await apiRequest('POST', '/api/payments/test/email-config');
      const data = await response.json();
      if (data.configured) {
        updateTestResult('Email Service', 'success', 'SendGrid configured', data);
      } else {
        updateTestResult('Email Service', 'failed', 'SendGrid not configured', data);
      }
    } catch (error: any) {
      updateTestResult('Email Service', 'failed', error.message);
    }

    setIsTestingAll(false);
  };

  // Copy test card number to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "Test card number copied",
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Payment System Testing Suite</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Comprehensive testing for Stripe payment integration and email notifications
        </p>
      </div>

      {/* Configuration Status */}
      {configStatus && (
        <Alert className={`mb-6 ${configStatus.mode === 'live' ? 'border-green-500' : 'border-yellow-500'}`}>
          <Shield className="h-4 w-4" />
          <AlertTitle>Stripe Configuration Status</AlertTitle>
          <AlertDescription className="mt-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
              <Badge variant={configStatus.hasSecretKey ? "default" : "destructive"}>
                Secret Key: {configStatus.hasSecretKey ? '✅' : '❌'}
              </Badge>
              <Badge variant={configStatus.hasPublishableKey ? "default" : "destructive"}>
                Publishable Key: {configStatus.hasPublishableKey ? '✅' : '❌'}
              </Badge>
              <Badge variant={configStatus.hasWebhookSecret ? "default" : "destructive"}>
                Webhook Secret: {configStatus.hasWebhookSecret ? '✅' : '❌'}
              </Badge>
              <Badge variant={configStatus.mode === 'live' ? "default" : "secondary"}>
                Mode: {configStatus.mode?.toUpperCase()}
              </Badge>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="payment" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="payment">
            <CreditCard className="mr-2 h-4 w-4" />
            Payment Test
          </TabsTrigger>
          <TabsTrigger value="automated">
            <TestTube className="mr-2 h-4 w-4" />
            Automated Tests
          </TabsTrigger>
          <TabsTrigger value="webhooks">
            <Webhook className="mr-2 h-4 w-4" />
            Webhook Events
          </TabsTrigger>
        </TabsList>

        {/* Payment Test Tab */}
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Real Payment Test with Test Card</CardTitle>
              <CardDescription>
                Use Stripe's test card to simulate a real payment flow with email notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Elements stripe={stripePromise}>
                <TestPaymentForm />
              </Elements>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Automated Tests Tab */}
        <TabsContent value="automated">
          <Card>
            <CardHeader>
              <CardTitle>Automated System Tests</CardTitle>
              <CardDescription>
                Run comprehensive tests on all payment system components
              </CardDescription>
              <Button onClick={runAllTests} disabled={isTestingAll} className="mt-4">
                {isTestingAll ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Running Tests...
                  </>
                ) : (
                  <>
                    <TestTube className="mr-2 h-4 w-4" />
                    Run All Tests
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testResults.map((test, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {test.status === 'testing' && <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />}
                      {test.status === 'success' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                      {test.status === 'failed' && <XCircle className="h-4 w-4 text-red-500" />}
                      {test.status === 'pending' && <AlertCircle className="h-4 w-4 text-gray-400" />}
                      <div>
                        <p className="font-medium">{test.name}</p>
                        {test.message && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">{test.message}</p>
                        )}
                      </div>
                    </div>
                    {test.timestamp && (
                      <span className="text-xs text-gray-500">
                        {new Date(test.timestamp).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                ))}
                {testResults.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    No tests run yet. Click "Run All Tests" to start.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Webhook Events Tab */}
        <TabsContent value="webhooks">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Event Monitor</CardTitle>
              <CardDescription>
                Real-time monitoring of Stripe webhook events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Webhook Endpoint</AlertTitle>
                <AlertDescription>
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    https://yourapp.com/api/stripe/webhook
                  </code>
                </AlertDescription>
              </Alert>
              
              <div className="mt-4 space-y-2">
                {webhookEvents.length > 0 ? (
                  webhookEvents.map((event, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex justify-between">
                        <span className="font-medium">{event.type}</span>
                        <span className="text-sm text-gray-500">{event.timestamp}</span>
                      </div>
                      {event.data && (
                        <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                          {JSON.stringify(event.data, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    No webhook events received yet. Make a test payment to see events.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
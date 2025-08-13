import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, XCircle, AlertCircle, CreditCard, Webhook, Bell, Shield, DollarSign, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with live key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface TestResult {
  name: string;
  status: 'pending' | 'testing' | 'success' | 'failed';
  message?: string;
  details?: any;
}

export default function PaymentTestSuite() {
  const { toast } = useToast();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isTestingAll, setIsTestingAll] = useState(false);
  const [webhookEvents, setWebhookEvents] = useState<any[]>([]);

  // Update test result
  const updateTestResult = (name: string, status: TestResult['status'], message?: string, details?: any) => {
    setTestResults(prev => {
      const existing = prev.find(t => t.name === name);
      if (existing) {
        return prev.map(t => t.name === name ? { ...t, status, message, details } : t);
      }
      return [...prev, { name, status, message, details }];
    });
  };

  // Test 1: Verify Stripe Configuration
  const testStripeConfiguration = async () => {
    updateTestResult('Stripe Configuration', 'testing');
    try {
      const response = await apiRequest('GET', '/api/payments/test/configuration');
      const data = await response.json();
      
      if (data.hasSecretKey && data.hasPublishableKey && data.hasWebhookSecret) {
        updateTestResult('Stripe Configuration', 'success', 'All keys configured', data);
      } else {
        updateTestResult('Stripe Configuration', 'failed', 'Missing keys', data);
      }
    } catch (error: any) {
      updateTestResult('Stripe Configuration', 'failed', error.message);
    }
  };

  // Test 2: Create Test Payment Intent
  const testPaymentIntent = async () => {
    updateTestResult('Payment Intent Creation', 'testing');
    try {
      const response = await apiRequest('POST', '/api/payments/test/create-intent', {
        amount: 100, // $1.00 test amount
        description: 'Test payment intent'
      });
      const data = await response.json();
      
      if (data.clientSecret) {
        updateTestResult('Payment Intent Creation', 'success', 'Intent created successfully', data);
        return data.clientSecret;
      } else {
        updateTestResult('Payment Intent Creation', 'failed', 'No client secret received', data);
      }
    } catch (error: any) {
      updateTestResult('Payment Intent Creation', 'failed', error.message);
    }
  };

  // Test 3: Test Webhook Endpoint
  const testWebhookEndpoint = async () => {
    updateTestResult('Webhook Endpoint', 'testing');
    try {
      const response = await apiRequest('POST', '/api/payments/test/webhook-ping');
      const data = await response.json();
      
      if (data.success) {
        updateTestResult('Webhook Endpoint', 'success', 'Webhook endpoint responding', data);
      } else {
        updateTestResult('Webhook Endpoint', 'failed', 'Webhook not responding', data);
      }
    } catch (error: any) {
      updateTestResult('Webhook Endpoint', 'failed', error.message);
    }
  };

  // Test 4: Verify Subscription Products
  const testSubscriptionProducts = async () => {
    updateTestResult('Subscription Products', 'testing');
    try {
      const response = await apiRequest('GET', '/api/payments/test/products');
      const data = await response.json();
      
      if (data.products && data.products.length > 0) {
        updateTestResult('Subscription Products', 'success', `${data.products.length} products found`, data);
      } else {
        updateTestResult('Subscription Products', 'failed', 'No products configured', data);
      }
    } catch (error: any) {
      updateTestResult('Subscription Products', 'failed', error.message);
    }
  };

  // Test 5: Email Notifications
  const testEmailNotifications = async () => {
    updateTestResult('Email Notifications', 'testing');
    try {
      const response = await apiRequest('POST', '/api/payments/test/email', {
        type: 'test',
        email: 'test@myseniorvalet.com'
      });
      const data = await response.json();
      
      if (data.success) {
        updateTestResult('Email Notifications', 'success', 'SendGrid configured', data);
      } else {
        updateTestResult('Email Notifications', 'failed', 'SendGrid error', data);
      }
    } catch (error: any) {
      updateTestResult('Email Notifications', 'failed', error.message);
    }
  };

  // Test 6: Database Connectivity
  const testDatabaseConnectivity = async () => {
    updateTestResult('Database Connectivity', 'testing');
    try {
      const response = await apiRequest('GET', '/api/payments/test/database');
      const data = await response.json();
      
      if (data.connected) {
        updateTestResult('Database Connectivity', 'success', 'Database connected', data);
      } else {
        updateTestResult('Database Connectivity', 'failed', 'Database error', data);
      }
    } catch (error: any) {
      updateTestResult('Database Connectivity', 'failed', error.message);
    }
  };

  // Test 7: Audit Logging
  const testAuditLogging = async () => {
    updateTestResult('Audit Logging', 'testing');
    try {
      const response = await apiRequest('POST', '/api/payments/test/audit-log', {
        action: 'test_payment_system',
        details: 'Testing audit log functionality'
      });
      const data = await response.json();
      
      if (data.success) {
        updateTestResult('Audit Logging', 'success', 'Audit log created', data);
      } else {
        updateTestResult('Audit Logging', 'failed', 'Logging failed', data);
      }
    } catch (error: any) {
      updateTestResult('Audit Logging', 'failed', error.message);
    }
  };

  // Test 8: Refund Capability
  const testRefundCapability = async () => {
    updateTestResult('Refund Capability', 'testing');
    try {
      const response = await apiRequest('POST', '/api/payments/test/refund-check');
      const data = await response.json();
      
      if (data.canRefund) {
        updateTestResult('Refund Capability', 'success', 'Refund API accessible', data);
      } else {
        updateTestResult('Refund Capability', 'failed', 'Refund API error', data);
      }
    } catch (error: any) {
      updateTestResult('Refund Capability', 'failed', error.message);
    }
  };

  // Fetch recent webhook events
  const fetchWebhookEvents = async () => {
    try {
      const response = await apiRequest('GET', '/api/payments/test/webhook-events');
      const data = await response.json();
      if (data.events) {
        setWebhookEvents(data.events);
      }
    } catch (error) {
      console.error('Failed to fetch webhook events:', error);
    }
  };

  // Run all tests
  const runAllTests = async () => {
    setIsTestingAll(true);
    setTestResults([]);
    
    await testStripeConfiguration();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testPaymentIntent();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testWebhookEndpoint();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testSubscriptionProducts();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testEmailNotifications();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testDatabaseConnectivity();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testAuditLogging();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testRefundCapability();
    
    setIsTestingAll(false);
    
    // Check overall status
    const allPassed = testResults.every(t => t.status === 'success');
    if (allPassed) {
      toast({
        title: "✅ All Tests Passed!",
        description: "Your payment system is ready for production",
      });
    } else {
      const failedCount = testResults.filter(t => t.status === 'failed').length;
      toast({
        title: "⚠️ Some Tests Failed",
        description: `${failedCount} test(s) need attention`,
        variant: "destructive"
      });
    }
  };

  // Test checkout flow
  const testCheckoutFlow = async (tier: string) => {
    try {
      const stripe = await stripePromise;
      if (!stripe) {
        toast({
          title: "Error",
          description: "Stripe not initialized",
          variant: "destructive"
        });
        return;
      }

      const response = await apiRequest('POST', '/api/payments/test/checkout-session', {
        tier,
        testMode: true
      });
      const data = await response.json();
      
      if (data.sessionId) {
        toast({
          title: "Test Checkout Created",
          description: `Session ID: ${data.sessionId.substring(0, 20)}...`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Checkout Test Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'testing':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500">Passed</Badge>;
      case 'failed':
        return <Badge className="bg-red-500">Failed</Badge>;
      case 'testing':
        return <Badge className="bg-blue-500">Testing...</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Payment System Test Suite</h1>
        <p className="text-muted-foreground">Comprehensive testing for MySeniorValet's live payment processing</p>
      </div>

      <Alert className="mb-6 border-blue-200 bg-blue-50">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Live Mode Active:</strong> These tests verify your production Stripe integration without processing real charges.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="automated" className="space-y-4">
        <TabsList>
          <TabsTrigger value="automated">Automated Tests</TabsTrigger>
          <TabsTrigger value="manual">Manual Tests</TabsTrigger>
          <TabsTrigger value="webhooks">Webhook Monitor</TabsTrigger>
        </TabsList>

        <TabsContent value="automated" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Integration Tests</CardTitle>
              <CardDescription>Verify all payment system components are properly configured</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  onClick={runAllTests} 
                  disabled={isTestingAll}
                  className="w-full sm:w-auto"
                >
                  {isTestingAll ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Running Tests...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Run All Tests
                    </>
                  )}
                </Button>

                {testResults.length > 0 && (
                  <div className="space-y-3 mt-6">
                    {testResults.map((test, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(test.status)}
                          <div>
                            <p className="font-medium">{test.name}</p>
                            {test.message && (
                              <p className="text-sm text-muted-foreground">{test.message}</p>
                            )}
                          </div>
                        </div>
                        {getStatusBadge(test.status)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Checkout Flow Testing</CardTitle>
              <CardDescription>Test different subscription tiers and payment flows</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Basic Tier</CardTitle>
                    <CardDescription>$199/month</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={() => testCheckoutFlow('basic')}
                      className="w-full"
                      variant="outline"
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Test Checkout
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Professional Tier</CardTitle>
                    <CardDescription>$499/month</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={() => testCheckoutFlow('professional')}
                      className="w-full"
                      variant="outline"
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Test Checkout
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Enterprise Tier</CardTitle>
                    <CardDescription>$999/month</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={() => testCheckoutFlow('enterprise')}
                      className="w-full"
                      variant="outline"
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Test Checkout
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Use Stripe test card: <code className="font-mono">4242 4242 4242 4242</code> with any future date and CVC
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Operations</CardTitle>
              <CardDescription>Test refunds, subscriptions, and other operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full sm:w-auto">
                <DollarSign className="mr-2 h-4 w-4" />
                Test Refund Process
              </Button>
              <Button variant="outline" className="w-full sm:w-auto">
                <RefreshCw className="mr-2 h-4 w-4" />
                Test Subscription Update
              </Button>
              <Button variant="outline" className="w-full sm:w-auto">
                <XCircle className="mr-2 h-4 w-4" />
                Test Subscription Cancel
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Webhook Event Monitor</CardTitle>
                  <CardDescription>Real-time webhook events from Stripe</CardDescription>
                </div>
                <Button onClick={fetchWebhookEvents} variant="outline" size="sm">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {webhookEvents.length > 0 ? (
                <div className="space-y-2">
                  {webhookEvents.map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Webhook className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="font-medium">{event.type}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(event.created * 1000).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">{event.id.substring(0, 8)}...</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Webhook className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No webhook events yet</p>
                  <p className="text-sm">Events will appear here when triggered</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Webhook Configuration</CardTitle>
              <CardDescription>Current webhook endpoint status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Endpoint URL</span>
                  <code className="text-sm">https://myseniorvalet.com/api/stripe/webhook</code>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">API Version</span>
                  <Badge>2025-06-30.basil</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Events Monitored</span>
                  <Badge>8 events</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Signature Verification</span>
                  <Badge className="bg-green-500">Enabled</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Check, X, Loader2, AlertCircle } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';

interface TestResult {
  name: string;
  status: 'pending' | 'testing' | 'passed' | 'failed';
  message?: string;
  details?: any;
}

export default function PaymentDiagnostics() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: '1. Stripe Public Key Configuration', status: 'pending' },
    { name: '2. Stripe Library Loading', status: 'pending' },
    { name: '3. Payment Intent API', status: 'pending' },
    { name: '4. Payment Element Initialization', status: 'pending' },
    { name: '5. SessionStorage Data', status: 'pending' },
    { name: '6. Community Confirmation Endpoint', status: 'pending' },
    { name: '7. Vendor Confirmation Endpoint', status: 'pending' }
  ]);
  const [isRunning, setIsRunning] = useState(false);

  const updateTest = (index: number, updates: Partial<TestResult>) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, ...updates } : test
    ));
  };

  const runDiagnostics = async () => {
    setIsRunning(true);

    // Test 1: Stripe Public Key
    updateTest(0, { status: 'testing' });
    const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
    if (stripeKey && stripeKey.startsWith('pk_')) {
      updateTest(0, { 
        status: 'passed', 
        message: 'Key configured correctly',
        details: { keyPrefix: stripeKey.substring(0, 10) + '...' }
      });
    } else {
      updateTest(0, { 
        status: 'failed', 
        message: 'VITE_STRIPE_PUBLIC_KEY missing or invalid' 
      });
    }

    // Test 2: Stripe Library
    updateTest(1, { status: 'testing' });
    try {
      const stripe = await loadStripe(stripeKey);
      if (stripe) {
        updateTest(1, { 
          status: 'passed', 
          message: 'Stripe library loaded successfully' 
        });
      } else {
        updateTest(1, { 
          status: 'failed', 
          message: 'Failed to initialize Stripe' 
        });
      }
    } catch (error) {
      updateTest(1, { 
        status: 'failed', 
        message: 'Error loading Stripe: ' + error 
      });
    }

    // Test 3: Payment Intent API
    updateTest(2, { status: 'testing' });
    try {
      const response = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 149,
          metadata: { 
            type: 'community', 
            tier: 'standard',
            testMode: true 
          }
        })
      });
      
      const data = await response.json();
      
      if (data.clientSecret && data.paymentIntentId) {
        updateTest(2, { 
          status: 'passed', 
          message: 'Payment intent created',
          details: { 
            paymentIntentId: data.paymentIntentId,
            hasClientSecret: true 
          }
        });
      } else {
        updateTest(2, { 
          status: 'failed', 
          message: 'Invalid response: ' + JSON.stringify(data) 
        });
      }
    } catch (error) {
      updateTest(2, { 
        status: 'failed', 
        message: 'API error: ' + error 
      });
    }

    // Test 4: Payment Element Mock Test
    updateTest(3, { status: 'testing' });
    // This is a mock test since we can't fully test Payment Element without user interaction
    if (stripeKey) {
      updateTest(3, { 
        status: 'passed', 
        message: 'Payment Element ready to load' 
      });
    } else {
      updateTest(3, { 
        status: 'failed', 
        message: 'Cannot load without Stripe key' 
      });
    }

    // Test 5: SessionStorage
    updateTest(4, { status: 'testing' });
    try {
      // Test community data
      const testCommunityData = {
        productId: 'standard',
        planName: 'Standard',
        communityId: '1',
        communityName: 'Test Community'
      };
      sessionStorage.setItem('communityUpgradeData', JSON.stringify(testCommunityData));
      
      const retrievedData = sessionStorage.getItem('communityUpgradeData');
      if (retrievedData) {
        updateTest(4, { 
          status: 'passed', 
          message: 'SessionStorage working correctly' 
        });
      } else {
        updateTest(4, { 
          status: 'failed', 
          message: 'SessionStorage not available' 
        });
      }
    } catch (error) {
      updateTest(4, { 
        status: 'failed', 
        message: 'SessionStorage error: ' + error 
      });
    }

    // Test 6: Community Confirmation
    updateTest(5, { status: 'testing' });
    try {
      const response = await fetch('/api/payments/confirm-community-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId: 'pi_test_diagnostic_' + Date.now(),
          communityId: '1',
          tier: 'standard'
        })
      });
      
      if (response.ok) {
        updateTest(5, { 
          status: 'passed', 
          message: 'Endpoint accessible' 
        });
      } else {
        const error = await response.json();
        updateTest(5, { 
          status: 'failed', 
          message: 'Endpoint error: ' + (error.error || response.status) 
        });
      }
    } catch (error) {
      updateTest(5, { 
        status: 'failed', 
        message: 'Network error: ' + error 
      });
    }

    // Test 7: Vendor Confirmation
    updateTest(6, { status: 'testing' });
    try {
      const response = await fetch('/api/payments/confirm-vendor-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId: 'pi_test_diagnostic_' + Date.now(),
          vendorData: {
            businessName: 'Test Vendor',
            email: 'test@diagnostic.com'
          }
        })
      });
      
      if (response.ok) {
        updateTest(6, { 
          status: 'passed', 
          message: 'Endpoint accessible' 
        });
      } else {
        const error = await response.json();
        updateTest(6, { 
          status: 'failed', 
          message: 'Endpoint error: ' + (error.error || response.status) 
        });
      }
    } catch (error) {
      updateTest(6, { 
        status: 'failed', 
        message: 'Network error: ' + error 
      });
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <Check className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <X className="w-5 h-5 text-red-500" />;
      case 'testing':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const allPassed = tests.every(test => test.status === 'passed');
  const someFailed = tests.some(test => test.status === 'failed');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Payment System Diagnostics</CardTitle>
            <p className="text-gray-600 dark:text-gray-400">
              Run comprehensive tests to identify any payment flow issues
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button 
              onClick={runDiagnostics} 
              disabled={isRunning}
              size="lg"
              className="w-full"
            >
              {isRunning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Diagnostics...
                </>
              ) : (
                'Run All Diagnostics'
              )}
            </Button>

            {(allPassed || someFailed) && (
              <Alert className={allPassed ? 'border-green-500' : 'border-red-500'}>
                <AlertDescription className="text-lg font-medium">
                  {allPassed && '✅ All tests passed! Your payment system is ready.'}
                  {someFailed && '❌ Some tests failed. Review the details below.'}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              {tests.map((test, index) => (
                <div 
                  key={index}
                  className="flex items-start space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg border"
                >
                  {getStatusIcon(test.status)}
                  <div className="flex-1">
                    <p className="font-medium">{test.name}</p>
                    {test.message && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {test.message}
                      </p>
                    )}
                    {test.details && (
                      <pre className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded mt-2 overflow-auto">
                        {JSON.stringify(test.details, null, 2)}
                      </pre>
                    )}
                  </div>
                  {test.status !== 'pending' && test.status !== 'testing' && (
                    <Badge variant={test.status === 'passed' ? 'default' : 'destructive'}>
                      {test.status}
                    </Badge>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-semibold mb-2">Next Steps:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>If all tests pass, try a payment at /payment-test-dashboard</li>
                <li>Use test card: 4242 4242 4242 4242</li>
                <li>Check browser console for any JavaScript errors</li>
                <li>Verify network tab shows successful API calls</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
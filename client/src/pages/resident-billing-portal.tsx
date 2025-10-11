import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CreditCard, 
  DollarSign, 
  FileText, 
  Download, 
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Receipt,
  PiggyBank,
  Shield,
  Phone,
  Mail,
  Building,
  Plus,
  Trash2,
  Loader2
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { useLocation } from 'wouter';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_51OOvQXINMRXRhRxqG8DJUW0GOkrXUmMJzp5eQJgOkXSNOdGl0XYigjJx7nOPn5gJDd2a18BQHrJOzQxJHuxjHCdj00FiMw6Eok');

// Payment Form Component
function PaymentForm({ residentId, amount, onSuccess, onCancel }: { 
  residentId: number; 
  amount: number; 
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/resident-billing-portal?residentId=${residentId}&payment=success`,
      },
      redirect: 'if_required',
    });

    if (submitError) {
      setError(submitError.message || 'Payment failed');
      setIsProcessing(false);
    } else {
      toast({
        title: "Payment Successful",
        description: `Your payment of ${formatCurrency(amount)} has been processed`,
      });
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={!stripe || !elements || isProcessing}
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
              Pay ${(amount / 100).toFixed(2)}
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default function ResidentBillingPortal() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split('?')[1] || '');
  const residentId = params.get('residentId') || '1';
  const [selectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [paymentAmount, setPaymentAmount] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch resident information
  const { data: residentData, isLoading: residentLoading } = useQuery({
    queryKey: [`/api/resident/${residentId}`],
    queryFn: async () => {
      return apiRequest('GET', `/api/resident/${residentId}`);
    },
    enabled: !!residentId
  });

  // Fetch billing summary - using resident data for now
  const { data: billingData, isLoading: billingLoading } = useQuery({
    queryKey: [`/api/resident/${residentId}/billing`],
    queryFn: async () => {
      // Construct billing summary from resident data
      const resident = await apiRequest('GET', `/api/resident/${residentId}`);
      return {
        currentBalance: resident.outstandingBalance || 0,
        monthlyRent: resident.monthlyRent || 0,
        nextDueDate: resident.nextDueDate || new Date().toISOString(),
        lastPaymentDate: resident.lastPaymentDate,
        lastPaymentAmount: resident.lastPaymentAmount || 0,
        accountStatus: resident.paymentStatus === 'current' ? 'current' : 'past-due'
      };
    },
    enabled: !!residentId
  });

  // Fetch payment methods
  const { data: paymentMethods, isLoading: methodsLoading } = useQuery({
    queryKey: [`/api/resident/${residentId}/payment-methods`],
    queryFn: async () => {
      return apiRequest('GET', `/api/resident/${residentId}/payment-methods`);
    },
    enabled: !!residentId
  });

  // Fetch payment history
  const { data: paymentHistory, isLoading: historyLoading } = useQuery({
    queryKey: [`/api/resident/${residentId}/payments`],
    queryFn: async () => {
      return apiRequest('GET', `/api/resident/${residentId}/payments`);
    },
    enabled: !!residentId
  });

  // Create payment intent
  const createPaymentMutation = useMutation({
    mutationFn: async (data: { amount: number; type: string }) => {
      return apiRequest('POST', '/api/resident/payment/create-intent', {
        residentId: parseInt(residentId),
        amount: data.amount,
        type: data.type,
        description: `${data.type} payment for ${residentData?.name || 'Resident'}`
      });
    },
    onSuccess: (data) => {
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setShowPaymentForm(true);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initialize payment",
        variant: "destructive"
      });
    }
  });

  // Delete payment method
  const deleteMethodMutation = useMutation({
    mutationFn: async (methodId: number) => {
      return apiRequest('DELETE', `/api/resident-payments/payment-methods/${methodId}`, {
        residentId: parseInt(residentId)
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Payment method removed successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/resident/${residentId}/payment-methods`] });
    }
  });

  const handleMakePayment = (type: string = 'rent') => {
    const amount = parseFloat(paymentAmount || billingData?.currentBalance?.toString() || '0');
    if (amount > 0) {
      createPaymentMutation.mutate({ 
        amount: Math.round(amount * 100), // Convert to cents
        type 
      });
    } else {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payment amount",
        variant: "destructive"
      });
    }
  };

  const handleDownloadReceipt = async (paymentId: number) => {
    try {
      const response = await fetch(`/api/resident-payments/receipts/${paymentId}?residentId=${residentId}`);
      if (!response.ok) throw new Error('Failed to download receipt');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${paymentId}.html`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to download receipt",
        variant: "destructive"
      });
    }
  };

  const isLoading = residentLoading || billingLoading || methodsLoading || historyLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Default data structure if API returns null
  const billing = billingData || {
    currentBalance: 0,
    monthlyRent: 0,
    nextDueDate: new Date().toISOString(),
    lastPaymentDate: null,
    lastPaymentAmount: 0,
    accountStatus: 'current'
  };

  const resident = residentData || {
    name: 'Resident',
    unit: 'N/A',
    communityId: null,
    community: { name: 'Community' }
  };

  const methods = paymentMethods || [];
  const history = paymentHistory || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Billing & Payment Portal
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome, {resident.name} • Unit {resident.unit} • {resident.community?.name}
          </p>
        </div>

        {/* Account Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Current Balance</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(billing.currentBalance)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600 dark:text-blue-400 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Rent</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(billing.monthlyRent)}
                  </p>
                </div>
                <Receipt className="h-8 w-8 text-green-600 dark:text-green-400 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 dark:border-purple-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Next Due</p>
                  <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {new Date(billing.nextDueDate).toLocaleDateString()}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600 dark:text-purple-400 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 dark:border-orange-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Account Status</p>
                  <Badge 
                    variant={billing.accountStatus === 'current' ? 'default' : 'destructive'}
                    className="mt-1"
                  >
                    {billing.accountStatus === 'current' ? 'Current' : 'Past Due'}
                  </Badge>
                </div>
                {billing.accountStatus === 'current' ? (
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400 opacity-20" />
                ) : (
                  <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400 opacity-20" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="payment" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="payment">Make Payment</TabsTrigger>
            <TabsTrigger value="methods">Payment Methods</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
          </TabsList>

          {/* Make Payment Tab */}
          <TabsContent value="payment" className="space-y-6">
            {!showPaymentForm ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Make a Payment
                  </CardTitle>
                  <CardDescription>
                    Pay your rent, utilities, or other charges. A $1.99 convenience fee applies.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="amount">Payment Amount</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            placeholder="Enter amount"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                          />
                          <Button 
                            variant="outline"
                            onClick={() => setPaymentAmount(billing.currentBalance.toString())}
                          >
                            Pay Balance
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label>Payment Type</Label>
                        <Select defaultValue="rent">
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="rent">Rent Payment</SelectItem>
                            <SelectItem value="deposit">Security Deposit</SelectItem>
                            <SelectItem value="utilities">Utilities</SelectItem>
                            <SelectItem value="other">Other Charges</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
                      <h4 className="font-semibold mb-3">Payment Summary</h4>
                      <div className="flex justify-between text-sm">
                        <span>Amount:</span>
                        <span className="font-medium">
                          {formatCurrency(parseFloat(paymentAmount || '0'))}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Convenience Fee:</span>
                        <span className="font-medium">$1.99</span>
                      </div>
                      <div className="flex justify-between text-sm pt-2 border-t">
                        <span className="font-semibold">Total:</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          {formatCurrency(parseFloat(paymentAmount || '0') + 1.99)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      Your payment is secured by Stripe. We never store your card details.
                    </AlertDescription>
                  </Alert>

                  <Button 
                    className="w-full"
                    size="lg"
                    onClick={() => handleMakePayment('rent')}
                    disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
                  >
                    <CreditCard className="mr-2 h-5 w-5" />
                    Continue to Payment
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Complete Payment</CardTitle>
                  <CardDescription>
                    Enter your payment information below
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {clientSecret && (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <PaymentForm
                        residentId={parseInt(residentId)}
                        amount={Math.round((parseFloat(paymentAmount || '0') + 1.99) * 100)}
                        onSuccess={() => {
                          setShowPaymentForm(false);
                          setClientSecret(null);
                          setPaymentAmount('');
                          queryClient.invalidateQueries({ 
                            queryKey: [`/api/resident/${residentId}/billing`] 
                          });
                          queryClient.invalidateQueries({ 
                            queryKey: [`/api/resident/${residentId}/payments`] 
                          });
                        }}
                        onCancel={() => {
                          setShowPaymentForm(false);
                          setClientSecret(null);
                        }}
                      />
                    </Elements>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Payment Methods Tab */}
          <TabsContent value="methods">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>
                  Manage your saved payment methods for faster checkout
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {methods.length > 0 ? (
                  methods.map((method: any) => (
                    <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {method.type === 'us_bank_account' ? (
                          <Building className="h-5 w-5 text-gray-600" />
                        ) : (
                          <CreditCard className="h-5 w-5 text-gray-600" />
                        )}
                        <div>
                          <p className="font-medium">
                            {method.type === 'us_bank_account' ? 'Bank Account' : method.cardBrand || 'Card'}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {method.type === 'us_bank_account' 
                              ? `****${method.accountLast4}` 
                              : `****${method.cardLast4}`}
                            {method.isDefault && (
                              <Badge variant="secondary" className="ml-2">Default</Badge>
                            )}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMethodMutation.mutate(method.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No payment methods saved</p>
                    <p className="text-sm mt-1">Add a payment method when making your next payment</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>View all your past payments and download receipts</CardDescription>
              </CardHeader>
              <CardContent>
                {history.length > 0 ? (
                  <div className="space-y-3">
                    {history.map((payment: any) => (
                      <div key={payment.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{formatCurrency(payment.amount / 100)}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {payment.type} • {new Date(payment.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Transaction ID: {payment.stripePaymentIntentId || 'N/A'}
                            </p>
                          </div>
                          <div className="text-right space-y-2">
                            <Badge 
                              variant={
                                payment.status === 'succeeded' ? 'default' : 
                                payment.status === 'processing' ? 'secondary' : 
                                'destructive'
                              }
                            >
                              {payment.status}
                            </Badge>
                            {payment.receiptUrl && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadReceipt(payment.id)}
                                className="block w-full"
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Receipt
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Receipt className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No payment history available</p>
                    <p className="text-sm mt-1">Your payment history will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices">
            <Card>
              <CardHeader>
                <CardTitle>Invoices & Statements</CardTitle>
                <CardDescription>Download your monthly statements</CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    Monthly statements are generated on the 1st of each month and will be available here for download.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Help Section */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Need Help with Billing?</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Our billing team is here to assist you with any questions
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline">
                  <Phone className="mr-2 h-4 w-4" />
                  Call Support
                </Button>
                <Button variant="outline">
                  <Mail className="mr-2 h-4 w-4" />
                  Email Support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
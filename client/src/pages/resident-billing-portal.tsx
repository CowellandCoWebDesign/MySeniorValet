import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Phone,
  Mail
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';

export default function ResidentBillingPortal() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [paymentAmount, setPaymentAmount] = useState('');
  const { toast } = useToast();

  // Fetch billing data
  const { data: billingData, isLoading } = useQuery({
    queryKey: ['/api/billing/resident-summary'],
    queryFn: async () => {
      // Mock data for demo - would connect to real API
      return {
        currentBalance: 3500,
        monthlyRate: 4200,
        nextDueDate: '2025-10-01',
        lastPaymentDate: '2025-08-15',
        lastPaymentAmount: 4200,
        accountStatus: 'current',
        autopayEnabled: true,
        paymentHistory: [
          { date: '2025-08-15', amount: 4200, method: 'Auto-pay', status: 'completed' },
          { date: '2025-07-15', amount: 4200, method: 'Auto-pay', status: 'completed' },
          { date: '2025-06-15', amount: 4200, method: 'Credit Card', status: 'completed' },
          { date: '2025-05-15', amount: 4200, method: 'Auto-pay', status: 'completed' },
        ],
        invoices: [
          { id: 'INV-2025-09', date: '2025-09-01', amount: 4200, status: 'pending', dueDate: '2025-10-01' },
          { id: 'INV-2025-08', date: '2025-08-01', amount: 4200, status: 'paid', paidDate: '2025-08-15' },
          { id: 'INV-2025-07', date: '2025-07-01', amount: 4200, status: 'paid', paidDate: '2025-07-15' },
        ],
        charges: {
          baseRent: 3200,
          careServices: 800,
          meals: 200,
          utilities: 0,
          activities: 0,
          other: 0
        },
        credits: [],
        budgetPlan: {
          monthlyBudget: 4500,
          currentSpend: 4200,
          variance: 300,
          yearToDate: 33600,
          projectedAnnual: 50400
        }
      };
    }
  });

  // Make payment mutation
  const makePaymentMutation = useMutation({
    mutationFn: async (data: { amount: number; method: string }) => {
      return apiRequest('POST', '/api/billing/make-payment', data);
    },
    onSuccess: () => {
      toast({
        title: "Payment Successful",
        description: `Your payment of $${paymentAmount} has been processed`,
      });
      setPaymentAmount('');
      queryClient.invalidateQueries({ queryKey: ['/api/billing/resident-summary'] });
    }
  });

  const handleMakePayment = () => {
    const amount = parseFloat(paymentAmount);
    if (amount > 0) {
      makePaymentMutation.mutate({ amount, method: 'Credit Card' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Billing & Payment Portal
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your account, view statements, and make payments
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
                    ${billingData?.currentBalance.toLocaleString()}
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Rate</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ${billingData?.monthlyRate.toLocaleString()}
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
                    {new Date(billingData?.nextDueDate).toLocaleDateString()}
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
                    variant={billingData?.accountStatus === 'current' ? 'default' : 'destructive'}
                    className="mt-1"
                  >
                    {billingData?.accountStatus === 'current' ? 'Current' : 'Past Due'}
                  </Badge>
                </div>
                {billingData?.accountStatus === 'current' ? (
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400 opacity-20" />
                ) : (
                  <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400 opacity-20" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
            <TabsTrigger value="autopay">Auto-Pay</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quick Payment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Quick Payment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="amount">Payment Amount</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="amount"
                        type="number"
                        placeholder="Enter amount"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                      />
                      <Button onClick={() => setPaymentAmount(billingData?.currentBalance.toString() || '')}>
                        Pay Balance
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      className="w-full"
                      onClick={handleMakePayment}
                      disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pay Now
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Phone className="mr-2 h-4 w-4" />
                      Pay by Phone
                    </Button>
                  </div>

                  {billingData?.autopayEnabled && (
                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        Auto-pay is enabled. Your next payment of ${billingData?.monthlyRate} will be processed on {new Date(billingData?.nextDueDate).toLocaleDateString()}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Current Charges Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Month Charges</CardTitle>
                  <CardDescription>Breakdown for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-sm font-medium">Base Rent</span>
                      <span className="font-semibold">${billingData?.charges.baseRent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-sm font-medium">Care Services</span>
                      <span className="font-semibold">${billingData?.charges.careServices.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-sm font-medium">Meal Plan</span>
                      <span className="font-semibold">${billingData?.charges.meals.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="font-semibold">Total Monthly</span>
                      <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        ${billingData?.monthlyRate.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Payment History */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {billingData?.paymentHistory.map((payment, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-medium">${payment.amount.toLocaleString()}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {payment.method} • {new Date(payment.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        {payment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>View all your past payments and transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {billingData?.paymentHistory.map((payment, idx) => (
                    <div key={idx} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">${payment.amount.toLocaleString()}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Payment Date: {new Date(payment.date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Method: {payment.method}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                            {payment.status}
                          </Badge>
                          <Button variant="ghost" size="sm" className="mt-2">
                            <Download className="h-4 w-4 mr-1" />
                            Receipt
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices">
            <Card>
              <CardHeader>
                <CardTitle>Invoices & Statements</CardTitle>
                <CardDescription>Download your monthly statements and invoices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {billingData?.invoices.map((invoice) => (
                    <div key={invoice.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{invoice.id}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Invoice Date: {new Date(invoice.date).toLocaleDateString()}
                          </p>
                          <p className="text-sm font-medium mt-1">
                            Amount: ${invoice.amount.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                            {invoice.status}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Budget Tab */}
          <TabsContent value="budget">
            <Card>
              <CardHeader>
                <CardTitle>Budget Planning</CardTitle>
                <CardDescription>Track your spending against your budget</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Monthly Budget</span>
                        <span className="font-semibold">${billingData?.budgetPlan.monthlyBudget.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Current Spend</span>
                        <span className="font-semibold">${billingData?.budgetPlan.currentSpend.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-sm font-medium">Variance</span>
                        <span className={`font-semibold ${billingData?.budgetPlan.variance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${Math.abs(billingData?.budgetPlan.variance).toLocaleString()}
                          {billingData?.budgetPlan.variance > 0 ? ' under' : ' over'}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h4 className="font-semibold mb-2">Year-to-Date</h4>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        ${billingData?.budgetPlan.yearToDate.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Projected Annual: ${billingData?.budgetPlan.projectedAnnual.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Spending Trends</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm">3% under budget this month</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <PiggyBank className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">$1,200 saved year-to-date</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Auto-Pay Tab */}
          <TabsContent value="autopay">
            <Card>
              <CardHeader>
                <CardTitle>Auto-Pay Settings</CardTitle>
                <CardDescription>Manage your automatic payment preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <Alert className={billingData?.autopayEnabled ? 'border-green-200 bg-green-50 dark:bg-green-900/20' : ''}>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      {billingData?.autopayEnabled 
                        ? 'Auto-pay is currently enabled. Your payments are automatically processed each month.'
                        : 'Auto-pay is disabled. You need to manually make payments each month.'}
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Auto-Pay Status</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Automatically pay your monthly bill
                        </p>
                      </div>
                      <Button variant={billingData?.autopayEnabled ? 'destructive' : 'default'}>
                        {billingData?.autopayEnabled ? 'Disable Auto-Pay' : 'Enable Auto-Pay'}
                      </Button>
                    </div>

                    {billingData?.autopayEnabled && (
                      <>
                        <div className="p-4 border rounded-lg">
                          <p className="font-medium mb-2">Payment Method</p>
                          <div className="flex items-center gap-3">
                            <CreditCard className="h-5 w-5 text-gray-600" />
                            <span>Visa ending in 4242</span>
                            <Button variant="outline" size="sm" className="ml-auto">
                              Change
                            </Button>
                          </div>
                        </div>

                        <div className="p-4 border rounded-lg">
                          <p className="font-medium mb-2">Payment Schedule</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Payments are processed on the 1st of each month
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
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
                  Call Billing
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
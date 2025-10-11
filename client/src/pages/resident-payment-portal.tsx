import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CreditCard, Building2, DollarSign, Receipt, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { NavigationHeader } from '@/components/NavigationHeader';
import { useLocation } from 'wouter';

export default function ResidentPaymentPortal() {
  const [, setLocation] = useLocation();
  const [amount, setAmount] = useState('');
  const [paymentType, setPaymentType] = useState('rent');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // For demo purposes, using residentId from URL params
  const params = new URLSearchParams(window.location.search);
  const residentId = params.get('residentId') || '1';

  // Fetch resident info
  const { data: resident, isLoading: residentLoading } = useQuery({
    queryKey: [`/api/resident/${residentId}`],
  });

  // Fetch payment methods
  const { data: paymentMethods, isLoading: methodsLoading } = useQuery({
    queryKey: [`/api/resident/${residentId}/payment-methods`],
  });

  // Fetch payment history
  const { data: paymentHistory, isLoading: historyLoading } = useQuery({
    queryKey: [`/api/resident/${residentId}/payments`],
  });

  const processPayment = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/resident/payment/create-intent', {
        residentId: parseInt(residentId),
        amount: parseFloat(amount),
        paymentType,
        paymentMethodId: selectedPaymentMethod,
        description: `${paymentType} payment`,
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Payment Successful!",
        description: `Your ${paymentType} payment of $${amount} has been processed. Receipt: ${data.payment.receiptNumber}`,
      });
      setAmount('');
      queryClient.invalidateQueries({ queryKey: [`/api/resident/${residentId}/payments`] });
      setIsProcessing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Payment Failed",
        description: error.message || "There was an error processing your payment",
        variant: "destructive",
      });
      setIsProcessing(false);
    },
  });

  const handlePayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payment amount",
        variant: "destructive",
      });
      return;
    }

    if (!selectedPaymentMethod) {
      toast({
        title: "No Payment Method",
        description: "Please select a payment method",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    processPayment.mutate();
  };

  if (residentLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <NavigationHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!resident) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <NavigationHeader />
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">Resident not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const convenienceFee = 1.99;
  const totalAmount = amount ? (parseFloat(amount) + convenienceFee).toFixed(2) : '0.00';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavigationHeader />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Resident Payment Portal
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {resident.firstName} {resident.lastName} - Unit {resident.unitNumber || 'N/A'}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Payment Form */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Make a Payment
                  </CardTitle>
                  <CardDescription>
                    Pay your rent and other fees securely online
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentType">Payment Type</Label>
                    <Select value={paymentType} onValueChange={setPaymentType}>
                      <SelectTrigger id="paymentType" data-testid="select-payment-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rent">Monthly Rent</SelectItem>
                        <SelectItem value="deposit">Deposit</SelectItem>
                        <SelectItem value="late_fee">Late Fee</SelectItem>
                        <SelectItem value="pet_fee">Pet Fee</SelectItem>
                        <SelectItem value="utility">Utility</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      data-testid="input-amount"
                    />
                    {paymentType === 'rent' && resident.monthlyRent && (
                      <p className="text-sm text-gray-500">
                        Monthly rent: ${parseFloat(resident.monthlyRent).toFixed(2)}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                      <SelectTrigger id="paymentMethod" data-testid="select-payment-method">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods && paymentMethods.length > 0 ? (
                          paymentMethods.map((method: any) => (
                            <SelectItem key={method.id} value={method.id.toString()}>
                              {method.type === 'card' ? (
                                <>
                                  <CreditCard className="inline h-4 w-4 mr-2" />
                                  {method.cardBrand} •••• {method.cardLast4}
                                </>
                              ) : (
                                <>
                                  <Building2 className="inline h-4 w-4 mr-2" />
                                  {method.bankName} •••• {method.accountLast4} ({method.accountType})
                                </>
                              )}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>No payment methods added</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Fee Summary */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Payment Amount:</span>
                      <span>${amount || '0.00'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Convenience Fee:</span>
                      <span>${convenienceFee.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-blue-200 dark:border-blue-800 pt-2 flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>${totalAmount}</span>
                    </div>
                  </div>

                  <Button
                    onClick={handlePayment}
                    disabled={isProcessing || !amount || !selectedPaymentMethod}
                    className="w-full"
                    data-testid="button-submit-payment"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Pay $${totalAmount}`
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Manage your saved payment methods</CardDescription>
                </CardHeader>
                <CardContent>
                  {methodsLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    </div>
                  ) : paymentMethods && paymentMethods.length > 0 ? (
                    <div className="space-y-2">
                      {paymentMethods.map((method: any) => (
                        <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {method.type === 'card' ? (
                              <CreditCard className="h-5 w-5 text-gray-500" />
                            ) : (
                              <Building2 className="h-5 w-5 text-gray-500" />
                            )}
                            <div>
                              <p className="font-medium">
                                {method.type === 'card' 
                                  ? `${method.cardBrand} •••• ${method.cardLast4}`
                                  : `${method.bankName} •••• ${method.accountLast4}`
                                }
                              </p>
                              {method.type === 'card' && (
                                <p className="text-sm text-gray-500">
                                  Expires {method.cardExpMonth}/{method.cardExpYear}
                                </p>
                              )}
                            </div>
                          </div>
                          {method.isDefault && (
                            <Badge variant="secondary">Default</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-4">No payment methods added</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Payment History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Payment History
                </CardTitle>
                <CardDescription>View your recent payments</CardDescription>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : paymentHistory && paymentHistory.length > 0 ? (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {paymentHistory.map((payment: any) => (
                      <div key={payment.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium capitalize">{payment.paymentType.replace('_', ' ')}</p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(payment.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">${parseFloat(payment.totalAmount).toFixed(2)}</p>
                            <Badge variant={
                              payment.status === 'succeeded' ? 'default' :
                              payment.status === 'processing' ? 'secondary' :
                              'destructive'
                            }>
                              {payment.status}
                            </Badge>
                          </div>
                        </div>
                        {payment.receiptNumber && (
                          <p className="text-xs text-gray-500 mt-2">
                            Receipt: {payment.receiptNumber}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No payment history</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <div hidden>
        Free Tibet  西藏自由
      </div>
    </div>
  );
}

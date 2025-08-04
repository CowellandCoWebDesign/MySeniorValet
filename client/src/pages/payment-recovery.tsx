import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { NavigationHeader } from '@/components/NavigationHeader';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function PaymentRecovery() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryData, setRecoveryData] = useState({
    paymentIntentId: '',
    communityId: '',
    tier: ''
  });
  const [recoveryResult, setRecoveryResult] = useState<any>(null);
  
  // Check if user is super admin
  const isSuperAdmin = user?.email === 'william.cowell01@gmail.com';
  
  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <NavigationHeader />
        <div className="container mx-auto px-4 py-16">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Access denied. This page is restricted to super administrators only.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const handleRecovery = async () => {
    if (!recoveryData.paymentIntentId || !recoveryData.communityId || !recoveryData.tier) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all fields',
        variant: 'destructive'
      });
      return;
    }

    setIsRecovering(true);
    setRecoveryResult(null);

    try {
      const response = await apiRequest('POST', '/api/payments/recover-failed-payment', {
        ...recoveryData,
        email: user?.email
      });

      setRecoveryResult({
        success: true,
        ...response
      });

      toast({
        title: 'Recovery Successful',
        description: `Community ${recoveryData.communityId} upgraded to ${recoveryData.tier}`,
      });

      // Clear form
      setRecoveryData({
        paymentIntentId: '',
        communityId: '',
        tier: ''
      });
    } catch (error: any) {
      setRecoveryResult({
        success: false,
        error: error.message
      });

      toast({
        title: 'Recovery Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsRecovering(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavigationHeader />
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-purple-600" />
              <CardTitle>Payment Recovery Tool</CardTitle>
            </div>
            <CardDescription>
              Recover failed payment confirmations where Stripe succeeded but database update failed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This tool is for recovering payments that show "Payment was processed but upgrade failed" error.
                Only use this after verifying the payment succeeded in Stripe dashboard.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <Label htmlFor="paymentIntentId">Payment Intent ID</Label>
                <Input
                  id="paymentIntentId"
                  placeholder="pi_3RsWT2Cuxvo3uux01FQQQyp8"
                  value={recoveryData.paymentIntentId}
                  onChange={(e) => setRecoveryData({ ...recoveryData, paymentIntentId: e.target.value })}
                  disabled={isRecovering}
                />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Found in Stripe dashboard or error logs
                </p>
              </div>

              <div>
                <Label htmlFor="communityId">Community ID</Label>
                <Input
                  id="communityId"
                  placeholder="1"
                  value={recoveryData.communityId}
                  onChange={(e) => setRecoveryData({ ...recoveryData, communityId: e.target.value })}
                  disabled={isRecovering}
                />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  The ID of the community being upgraded
                </p>
              </div>

              <div>
                <Label htmlFor="tier">Subscription Tier</Label>
                <Select
                  value={recoveryData.tier}
                  onValueChange={(value) => setRecoveryData({ ...recoveryData, tier: value })}
                  disabled={isRecovering}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard ($149/month)</SelectItem>
                    <SelectItem value="featured">Featured ($249/month)</SelectItem>
                    <SelectItem value="platinum">Platinum ($349/month)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={handleRecovery} 
              disabled={isRecovering}
              className="w-full"
              size="lg"
            >
              {isRecovering ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Recovering Payment...
                </>
              ) : (
                'Recover Payment'
              )}
            </Button>

            {recoveryResult && (
              <Alert variant={recoveryResult.success ? 'default' : 'destructive'}>
                {recoveryResult.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  {recoveryResult.success ? (
                    <div>
                      <p className="font-semibold">Recovery Successful!</p>
                      <p>Community {recoveryResult.communityId} has been upgraded to {recoveryResult.tier}.</p>
                      <p className="text-sm mt-2">The community now has full access to their subscription features.</p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-semibold">Recovery Failed</p>
                      <p>{recoveryResult.error}</p>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Recovery Steps:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>Find the payment intent ID from the error message or Stripe dashboard</li>
                <li>Identify the community ID that was being upgraded</li>
                <li>Select the tier they were trying to purchase</li>
                <li>Click "Recover Payment" to complete the upgrade</li>
              </ol>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">For Your Case:</h3>
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm font-mono">
                <p>Payment Intent: pi_3RsWT2Cuxvo3uux01FQQQyp8</p>
                <p>Community ID: [Check the URL or logs]</p>
                <p>Tier: featured ($249/month)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
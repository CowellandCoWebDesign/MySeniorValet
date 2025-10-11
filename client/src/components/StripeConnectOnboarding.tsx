import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, AlertCircle, CreditCard, DollarSign, Building2, ExternalLink } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface StripeConnectOnboardingProps {
  communityId: number;
  subscriptionTier?: string;
}

export function StripeConnectOnboarding({ communityId, subscriptionTier }: StripeConnectOnboardingProps) {
  const { toast } = useToast();
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  // Check account status
  const { data: accountStatus, isLoading: statusLoading } = useQuery({
    queryKey: [`/api/community-stripe/account-status/${communityId}`],
    refetchInterval: 10000, // Check every 10 seconds for updates
  });

  // Create connected account
  const createAccountMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/community-stripe/create-connect-account', {
        communityId
      });
    },
    onSuccess: (data) => {
      if (data.accountId) {
        toast({
          title: "Payment account created",
          description: "Now let's complete your account setup",
        });
        queryClient.invalidateQueries({ 
          queryKey: [`/api/community-stripe/account-status/${communityId}`] 
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create account",
        description: error.message || "Please try again",
        variant: "destructive",
      });
      setIsCreatingAccount(false);
    }
  });

  // Generate account link for onboarding
  const generateLinkMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/community-stripe/create-account-link', {
        communityId,
        returnUrl: `${window.location.origin}/community-dashboard?tab=payments&success=true`,
        refreshUrl: `${window.location.origin}/community-dashboard?tab=payments&refresh=true`,
      });
    },
    onSuccess: (data) => {
      if (data.url) {
        // Open Stripe onboarding in new tab
        window.open(data.url, '_blank');
        toast({
          title: "Onboarding link opened",
          description: "Complete the setup in the new tab, then return here",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Failed to generate link",
        description: error.message || "Please try again",
        variant: "destructive",
      });
      setIsGeneratingLink(false);
    }
  });

  const handleCreateAccount = async () => {
    setIsCreatingAccount(true);
    await createAccountMutation.mutateAsync();
    setIsCreatingAccount(false);
  };

  const handleContinueOnboarding = async () => {
    setIsGeneratingLink(true);
    await generateLinkMutation.mutateAsync();
    setIsGeneratingLink(false);
  };

  // Check if subscription tier supports payment processing
  const paymentTiers = ['starter', 'growth', 'premium', 'enterprise', 'featured', 'platinum'];
  const canAcceptPayments = subscriptionTier && paymentTiers.includes(subscriptionTier.toLowerCase());

  if (statusLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  // Not subscribed to payment tier
  if (!canAcceptPayments) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-gray-400" />
            Payment Processing
          </CardTitle>
          <CardDescription>Accept resident payments directly</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Payment processing requires a Starter subscription or higher. 
              Your current tier is: <Badge variant="outline">{subscriptionTier || 'Free'}</Badge>
            </AlertDescription>
          </Alert>
          <Button className="w-full" variant="outline">
            Upgrade Subscription
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Account fully set up and active
  if (accountStatus?.hasAccount && accountStatus?.onboardingCompleted) {
    return (
      <Card className="border-green-200 dark:border-green-800">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Payment Processing Active
              </CardTitle>
              <CardDescription>Your community can accept resident payments</CardDescription>
            </div>
            <Badge className="bg-green-100 text-green-700">Active</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm font-medium mb-1">Payment Methods</p>
                <div className="flex gap-2 mt-1">
                  {accountStatus.chargesEnabled && (
                    <>
                      <Badge variant="outline" className="text-xs">Cards</Badge>
                      <Badge variant="outline" className="text-xs">ACH</Badge>
                    </>
                  )}
                </div>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm font-medium mb-1">Payouts</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {accountStatus.payoutsEnabled ? 'Daily automatic' : 'Pending setup'}
                </p>
              </div>
            </div>
            
            <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                <div className="font-medium mb-1">Fee Structure:</div>
                <ul className="text-sm space-y-1">
                  <li>• ACH: 0.8% (capped at $5) - Save 71% vs cards!</li>
                  <li>• Cards: 2.9% + $0.30 per transaction</li>
                  <li>• Platform fee: 2% to MySeniorValet</li>
                  <li>• Resident convenience fee: $1.99 (added to payment)</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={handleContinueOnboarding}>
                <Building2 className="h-4 w-4 mr-2" />
                View Stripe Dashboard
              </Button>
              <Button variant="outline" className="flex-1">
                <ExternalLink className="h-4 w-4 mr-2" />
                Payment Reports
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Account created but onboarding not complete
  if (accountStatus?.hasAccount && !accountStatus?.onboardingCompleted) {
    return (
      <Card className="border-orange-200 dark:border-orange-800">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                Complete Payment Setup
              </CardTitle>
              <CardDescription>Your account needs additional information</CardDescription>
            </div>
            <Badge className="bg-orange-100 text-orange-700">Setup Required</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your payment account has been created but requires additional information to start accepting payments. 
              This typically includes:
              <ul className="mt-2 ml-4 list-disc text-sm">
                <li>Business verification</li>
                <li>Bank account for payouts</li>
                <li>Tax information</li>
              </ul>
            </AlertDescription>
          </Alert>
          
          {accountStatus.requirements?.currently_due?.length > 0 && (
            <Alert className="mb-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Required information:</strong>
                <ul className="mt-1 ml-4 list-disc text-sm">
                  {accountStatus.requirements.currently_due.slice(0, 3).map((req: string) => (
                    <li key={req}>{req.replace(/_/g, ' ')}</li>
                  ))}
                  {accountStatus.requirements.currently_due.length > 3 && (
                    <li>...and {accountStatus.requirements.currently_due.length - 3} more items</li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <Button 
            className="w-full" 
            onClick={handleContinueOnboarding}
            disabled={isGeneratingLink}
          >
            {isGeneratingLink ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Link...
              </>
            ) : (
              <>
                <ExternalLink className="mr-2 h-4 w-4" />
                Continue Setup with Stripe
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // No account yet
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-blue-600" />
          Enable Payment Processing
        </CardTitle>
        <CardDescription>Accept resident payments directly to your bank account</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Alert>
            <DollarSign className="h-4 w-4" />
            <AlertDescription>
              <strong>Benefits of payment processing:</strong>
              <ul className="mt-2 ml-4 list-disc text-sm">
                <li>Accept rent and fees directly from residents</li>
                <li>ACH payments save 71% on processing fees</li>
                <li>Automatic daily payouts to your bank</li>
                <li>Integrated payment tracking and reporting</li>
                <li>Reduce late payments with automated reminders</li>
              </ul>
            </AlertDescription>
          </Alert>

          <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <strong>Quick 5-minute setup:</strong>
              <p className="mt-1 text-sm">
                Stripe will guide you through entering your business details, verifying your identity, 
                and connecting your bank account for payouts.
              </p>
            </AlertDescription>
          </Alert>

          <Button 
            className="w-full" 
            size="lg"
            onClick={handleCreateAccount}
            disabled={isCreatingAccount}
          >
            {isCreatingAccount ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <Building2 className="mr-2 h-4 w-4" />
                Start Payment Setup
              </>
            )}
          </Button>

          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Powered by Stripe • Bank-level security • PCI compliant
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
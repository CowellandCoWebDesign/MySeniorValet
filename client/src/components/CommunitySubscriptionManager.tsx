import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CheckCircle2, Crown, Shield, Star, Loader2, CreditCard, Calendar, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { format } from 'date-fns';

interface CommunitySubscriptionManagerProps {
  communityId: number;
  currentTier?: string;
  subscriptionEndsAt?: string;
  billingStatus?: string;
}

const TIER_DETAILS = {
  verified: {
    displayName: 'Verified Listing',
    icon: CheckCircle2,
    color: 'bg-gray-100 text-gray-800',
    price: 0,
  },
  standard: {
    displayName: 'Standard',
    icon: Star,
    color: 'bg-blue-100 text-blue-800',
    price: 149,
  },
  featured: {
    displayName: 'Featured',
    icon: Shield,
    color: 'bg-purple-100 text-purple-800',
    price: 249,
  },
  platinum: {
    displayName: 'Platinum',
    icon: Crown,
    color: 'bg-yellow-100 text-yellow-800',
    price: 349,
  },
};

export function CommunitySubscriptionManager({ 
  communityId, 
  currentTier = 'verified',
  subscriptionEndsAt,
  billingStatus = 'active'
}: CommunitySubscriptionManagerProps) {
  const [isCancelling, setIsCancelling] = useState(false);

  // Fetch subscription details
  const { data: subscription, isLoading } = useQuery({
    queryKey: [`/api/community-subscription/status/${communityId}`],
    enabled: !!communityId,
  });

  // Cancel subscription mutation
  const cancelSubscription = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/community-subscription/cancel', {
        communityId
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription will remain active until the end of the billing period.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/community-subscription/status/${communityId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}`] });
      setIsCancelling(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel subscription",
        variant: "destructive",
      });
      setIsCancelling(false);
    }
  });

  // Manage billing portal
  const manageBilling = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/community-subscription/manage-billing', {
        communityId
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to open billing portal",
        variant: "destructive",
      });
    }
  });

  const tier = TIER_DETAILS[currentTier as keyof typeof TIER_DETAILS] || TIER_DETAILS.verified;
  const Icon = tier.icon;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const isPaid = currentTier !== 'verified';
  const subscriptionData = subscription || {
    tier: currentTier,
    billingStatus,
    nextBillingDate: subscriptionEndsAt,
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>Subscription Plan</CardTitle>
              <CardDescription>
                {tier.displayName} {isPaid && `- $${tier.price}/month`}
              </CardDescription>
            </div>
          </div>
          <Badge className={tier.color}>
            {tier.displayName}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Billing Status */}
        {isPaid && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Status</span>
              <Badge variant={subscriptionData.billingStatus === 'active' ? 'default' : 'destructive'}>
                {subscriptionData.billingStatus === 'active' ? 'Active' : 
                 subscriptionData.billingStatus === 'past_due' ? 'Past Due' : 
                 subscriptionData.billingStatus === 'canceled' ? 'Cancelled' : 
                 subscriptionData.billingStatus}
              </Badge>
            </div>
            
            {subscriptionData.nextBillingDate && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {subscriptionData.billingStatus === 'canceled' ? 'Expires' : 'Next billing date'}
                </span>
                <span className="font-medium">
                  {format(new Date(subscriptionData.nextBillingDate), 'MMM dd, yyyy')}
                </span>
              </div>
            )}

            {subscriptionData.billingStatus === 'past_due' && (
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-red-800 dark:text-red-200">Payment Failed</p>
                  <p className="text-red-700 dark:text-red-300">
                    Please update your payment method to continue your subscription.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="pt-4 space-y-3">
          {/* Upgrade Button */}
          {currentTier !== 'platinum' && (
            <Button 
              className="w-full" 
              onClick={() => window.location.href = `/community-subscription-checkout?communityId=${communityId}&tier=${
                currentTier === 'verified' ? 'standard' : 
                currentTier === 'standard' ? 'featured' : 
                'platinum'
              }`}
            >
              Upgrade Plan
            </Button>
          )}

          {/* Manage Billing */}
          {isPaid && subscriptionData.billingStatus !== 'canceled' && (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => manageBilling.mutate()}
              disabled={manageBilling.isPending}
            >
              {manageBilling.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Manage Billing
                </>
              )}
            </Button>
          )}

          {/* Cancel Subscription */}
          {isPaid && subscriptionData.billingStatus === 'active' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" className="w-full text-red-600 hover:text-red-700">
                  Cancel Subscription
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Your subscription will remain active until {subscriptionData.nextBillingDate ? 
                    format(new Date(subscriptionData.nextBillingDate), 'MMMM dd, yyyy') : 
                    'the end of the billing period'}. After that, your listing will revert to the free Verified tier.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      setIsCancelling(true);
                      cancelSubscription.mutate();
                    }}
                    disabled={isCancelling}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isCancelling ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      'Cancel Subscription'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {/* Features Reminder */}
        <div className="pt-4 border-t">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {currentTier === 'verified' ? 
              'Upgrade to unlock more photos, analytics, and premium features.' :
              'Thank you for being a valued subscriber!'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
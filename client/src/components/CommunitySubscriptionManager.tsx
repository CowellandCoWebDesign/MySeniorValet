import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CheckCircle2, Crown, Shield, Star, Loader2, CreditCard, Calendar, AlertCircle, TrendingUp, Sparkles, MessageSquare, Gift } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { format } from 'date-fns';
import { getCommunityTier, COMMUNITY_TIERS, type CommunityTier } from '@shared/tiers';

interface CommunitySubscriptionManagerProps {
  communityId: number;
  currentTier?: string;
  subscriptionEndsAt?: string;
  billingStatus?: string;
}

// Map tier IDs to icons and colors for visual representation
const TIER_VISUALS = {
  free: {
    icon: Gift,
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  },
  starter: {
    icon: Star,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  },
  growth: {
    icon: TrendingUp,
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  },
  professional: {
    icon: Shield,
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  },
  premium: {
    icon: Sparkles,
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  },
  enterprise: {
    icon: Crown,
    color: 'bg-gradient-to-r from-amber-100 to-orange-100 text-orange-800 dark:from-amber-900/30 dark:to-orange-900/30 dark:text-orange-300',
  },
};

export function CommunitySubscriptionManager({ 
  communityId, 
  currentTier = 'free',
  subscriptionEndsAt,
  billingStatus = 'active'
}: CommunitySubscriptionManagerProps) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [showUpgradeOptions, setShowUpgradeOptions] = useState(false);

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

  // Upgrade subscription mutation
  const upgradeSubscription = useMutation({
    mutationFn: async (targetTier: string) => {
      const response = await apiRequest('POST', '/api/community-subscription/create-checkout-session', {
        communityId,
        tier: targetTier
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
        description: error.message || "Failed to start upgrade process",
        variant: "destructive",
      });
    }
  });

  const tierInfo = getCommunityTier(currentTier);
  const tierVisual = TIER_VISUALS[currentTier as keyof typeof TIER_VISUALS] || TIER_VISUALS.free;
  const Icon = tierVisual.icon;

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

  const isPaid = currentTier !== 'free';
  const subscriptionData = subscription || {
    tier: currentTier,
    billingStatus,
    nextBillingDate: subscriptionEndsAt,
  };

  // Get available upgrade tiers
  const upgradeTiers = Object.values(COMMUNITY_TIERS).filter(
    tier => tier.price > tierInfo.price
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Subscription Plan</CardTitle>
                <CardDescription>
                  {tierInfo.displayName} {isPaid && `- ${tierInfo.priceDisplay}`}
                </CardDescription>
              </div>
            </div>
            <Badge className={tierVisual.color}>
              {tierInfo.displayName}
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
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-900 dark:text-red-100">
                      Payment Required
                    </p>
                    <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                      Please update your payment method to continue service.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Current Plan Features */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-3">Your Current Features</h4>
            <div className="grid grid-cols-1 gap-2">
              {tierInfo.highlights.slice(0, 5).map((feature, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2">
            {/* Upgrade Button - Always show if upgrades available */}
            {upgradeTiers.length > 0 && (
              <Button 
                onClick={() => setShowUpgradeOptions(true)}
                className="w-full"
                variant={currentTier === 'free' ? 'default' : 'outline'}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                {currentTier === 'free' ? 'Upgrade to Paid Plan' : 'Upgrade Plan'}
              </Button>
            )}

            {/* Manage Billing - Only for paid plans */}
            {isPaid && subscriptionData.billingStatus !== 'canceled' && (
              <Button 
                onClick={() => manageBilling.mutate()}
                variant="outline"
                className="w-full"
                disabled={manageBilling.isPending}
              >
                {manageBilling.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4 mr-2" />
                )}
                Manage Billing
              </Button>
            )}

            {/* Cancel Subscription - Only for active paid plans */}
            {isPaid && subscriptionData.billingStatus === 'active' && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Cancel Subscription
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Your subscription will remain active until {subscriptionData.nextBillingDate ? 
                        format(new Date(subscriptionData.nextBillingDate), 'MMMM dd, yyyy') : 
                        'the end of the billing period'}. 
                      You can reactivate anytime before then.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => cancelSubscription.mutate()}
                      disabled={cancelSubscription.isPending}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {cancelSubscription.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Cancel Subscription'
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {/* Reactivate - For cancelled subscriptions */}
            {subscriptionData.billingStatus === 'canceled' && (
              <Button 
                onClick={() => manageBilling.mutate()}
                className="w-full"
                disabled={manageBilling.isPending}
              >
                {manageBilling.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Calendar className="h-4 w-4 mr-2" />
                )}
                Reactivate Subscription
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Options Modal */}
      {showUpgradeOptions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Choose Your Upgrade Plan</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowUpgradeOptions(false)}
                >
                  ✕
                </Button>
              </div>
              <CardDescription>
                Select a plan that best fits your community's needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upgradeTiers.map((tier) => {
                  const visual = TIER_VISUALS[tier.id as keyof typeof TIER_VISUALS];
                  const TierIcon = visual?.icon || Star;
                  
                  return (
                    <Card 
                      key={tier.id} 
                      className={`relative cursor-pointer hover:shadow-lg transition-all ${
                        tier.popular ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => upgradeSubscription.mutate(tier.id)}
                    >
                      {tier.badge && (
                        <Badge className="absolute -top-2 -right-2 z-10">
                          {tier.badge}
                        </Badge>
                      )}
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <TierIcon className="h-6 w-6 text-primary" />
                          <CardTitle className="text-lg">{tier.displayName}</CardTitle>
                        </div>
                        <CardDescription>
                          <span className="text-2xl font-bold text-primary">
                            {tier.priceDisplay}
                          </span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          {tier.description}
                        </p>
                        <ul className="space-y-2">
                          {tier.highlights.slice(0, 6).map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {feature}
                              </span>
                            </li>
                          ))}
                        </ul>
                        <Button 
                          className="w-full mt-4"
                          disabled={upgradeSubscription.isPending}
                        >
                          {upgradeSubscription.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            `Upgrade to ${tier.displayName}`
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
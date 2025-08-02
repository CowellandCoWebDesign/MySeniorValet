import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Crown, Gem, Shield, CheckCircle, ArrowRight } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SubscriptionUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: string;
  requestedFeature: string;
  communityId: number;
  communityName: string;
}

const tierDetails = {
  verified: {
    name: 'Verified Listing',
    price: 0,
    icon: Shield,
    color: 'gray',
    popular: false,
    features: {
      photos: 1,
      videos: 0,
      pdfs: 0,
      messaging: false,
      analytics: false,
      featured: false
    }
  },
  standard: {
    name: 'Standard',
    price: 149,
    icon: CheckCircle,
    color: 'green',
    popular: false,
    features: {
      photos: 10,
      videos: 0,
      pdfs: 1,
      messaging: false,
      analytics: 'basic' as const,
      featured: false
    }
  },
  featured: {
    name: 'Featured',
    price: 249,
    icon: Gem,
    color: 'blue',
    popular: true,
    features: {
      photos: 25,
      videos: 1,
      pdfs: 3,
      messaging: true,
      analytics: 'advanced' as const,
      featured: true
    }
  },
  platinum: {
    name: 'Platinum',
    price: 349,
    icon: Crown,
    color: 'purple',
    popular: false,
    features: {
      photos: 50,
      videos: 3,
      pdfs: 'unlimited' as const,
      messaging: true,
      analytics: 'advanced' as const,
      featured: true,
      staffBios: true,
      realTimeAvailability: true,
      multiProperty: true
    }
  }
};

export const SubscriptionUpgradeModal: React.FC<SubscriptionUpgradeModalProps> = ({
  isOpen,
  onClose,
  currentTier,
  requestedFeature,
  communityId,
  communityName
}) => {
  const { toast } = useToast();
  const tierOrder = ['verified', 'standard', 'featured', 'platinum'];
  const currentTierIndex = tierOrder.indexOf(currentTier);

  const handleUpgrade = async (tier: string) => {
    try {
      await apiRequest('POST', '/api/subscription/request-upgrade', {
        communityId,
        requestedTier: tier,
        currentTier,
        feature: requestedFeature
      });

      toast({
        title: "Upgrade Requested",
        description: "A MySeniorValet representative will contact you within 24 hours to complete your upgrade.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit upgrade request. Please try again.",
        variant: "destructive"
      });
    }
  };

  const featureDescriptions: Record<string, string> = {
    photos: 'Upload more photos to showcase your community',
    videos: 'Add video tours to engage families',
    pdfs: 'Share brochures and floor plans',
    messaging: 'Chat directly with interested families',
    analytics: 'Track your listing performance',
    featured: 'Get priority placement in search results',
    staffBios: 'Highlight your care team',
    realTimeAvailability: 'Show live unit availability',
    multiProperty: 'Manage multiple locations from one dashboard'
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Upgrade Your Listing</DialogTitle>
          <DialogDescription>
            Unlock "{requestedFeature}" and more premium features for {communityName}
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-3 gap-4 mt-4">
          {tierOrder.slice(currentTierIndex + 1).map((tierKey) => {
            const tier = tierDetails[tierKey as keyof typeof tierDetails];
            const TierIcon = tier.icon;
            const isPopular = tier.popular;

            return (
              <Card key={tierKey} className={`relative ${isPopular ? 'border-blue-500 shadow-lg' : ''}`}>
                {isPopular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white">
                    Most Popular
                  </Badge>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className={`mx-auto w-12 h-12 rounded-full bg-${tier.color}-100 dark:bg-${tier.color}-900/40 flex items-center justify-center mb-3`}>
                    <TierIcon className={`w-6 h-6 text-${tier.color}-600 dark:text-${tier.color}-400`} />
                  </div>
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">${tier.price}</span>
                    <span className="text-gray-600 dark:text-gray-400">/month</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <FeatureItem 
                      included={tier.features.photos > 1} 
                      text={`${tier.features.photos} photos`}
                      highlight={requestedFeature === 'photos'}
                    />
                    <FeatureItem 
                      included={tier.features.videos > 0} 
                      text={`${tier.features.videos} video${tier.features.videos > 1 ? 's' : ''}`}
                      highlight={requestedFeature === 'videos'}
                    />
                    <FeatureItem 
                      included={tier.features.pdfs !== 0} 
                      text={tier.features.pdfs === 'unlimited' ? 'Unlimited PDFs' : `${tier.features.pdfs} PDF${typeof tier.features.pdfs === 'number' && tier.features.pdfs > 1 ? 's' : ''}`}
                      highlight={requestedFeature === 'pdfs'}
                    />
                    <FeatureItem 
                      included={tier.features.messaging} 
                      text="In-app messaging"
                      highlight={requestedFeature === 'messaging'}
                    />
                    <FeatureItem 
                      included={tier.features.analytics !== false} 
                      text={tier.features.analytics === 'advanced' ? 'Advanced analytics' : 'Basic analytics'}
                      highlight={requestedFeature === 'analytics'}
                    />
                    <FeatureItem 
                      included={tier.features.featured} 
                      text="Featured placement"
                      highlight={requestedFeature === 'featured'}
                    />
                    
                    {tierKey === 'platinum' && (
                      <>
                        <FeatureItem included={true} text="Staff bios & menus" />
                        <FeatureItem included={true} text="Real-time availability" />
                        <FeatureItem included={true} text="Multi-property dashboard" />
                        <FeatureItem included={true} text="Monthly performance calls" />
                      </>
                    )}
                  </div>

                  <Button 
                    className="w-full mt-4" 
                    onClick={() => handleUpgrade(tierKey)}
                    variant={isPopular ? 'default' : 'outline'}
                  >
                    Upgrade to {tier.name}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>All plans include tour scheduling, review display, and basic listing management</p>
          <p className="mt-2">Questions? Contact us at <a href="mailto:billing@myseniorvalet.com" className="text-blue-600 hover:underline">billing@myseniorvalet.com</a></p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const FeatureItem: React.FC<{ included: boolean; text: string; highlight?: boolean }> = ({ 
  included, 
  text, 
  highlight 
}) => (
  <div className={`flex items-center gap-2 ${highlight ? 'font-semibold text-blue-600 dark:text-blue-400' : ''}`}>
    {included ? (
      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
    ) : (
      <X className="w-4 h-4 text-gray-400 flex-shrink-0" />
    )}
    <span className={!included ? 'text-gray-400' : ''}>{text}</span>
  </div>
);
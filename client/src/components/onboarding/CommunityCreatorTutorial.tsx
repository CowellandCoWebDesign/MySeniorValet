import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  Heart, 
  Star, 
  Camera,
  CreditCard,
  Users,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  Target,
  Zap,
  Gift
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  character: 'sage' | 'compass' | 'builder';
  content: string;
  actionText: string;
  benefits?: string[];
  visualDemo?: 'create-form' | 'pricing-tiers' | 'feature-showcase' | 'payment-flow';
  tip?: string;
}

const characters = {
  sage: {
    name: "Sage",
    emoji: "🌟",
    description: "Your wise MySeniorValet guide",
    personality: "experienced and helpful"
  },
  compass: {
    name: "Compass", 
    emoji: "🧭",
    description: "Your navigation expert",
    personality: "precise and focused"
  },
  builder: {
    name: "Builder",
    emoji: "🏗️",
    description: "Your community setup specialist", 
    personality: "practical and encouraging"
  }
};

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Community Creation!',
    description: 'Let me guide you through setting up your senior living community',
    icon: Sparkles,
    character: 'sage',
    content: 'Hello! I\'m Sage, and I\'m excited to help you join MySeniorValet\'s network of trusted senior living communities. Together, we\'ll create a compelling profile that showcases everything your community offers.',
    actionText: 'Let\'s get started!',
    benefits: [
      'Show real-time room availability instantly',
      'Display live, transparent pricing to families',
      'Respond to reviews and build trust',
      'Message families directly in the app'
    ]
  },
  {
    id: 'tiers-overview',
    title: 'Choose Your Success Level',
    description: 'Discover the perfect subscription tier for your community',
    icon: Target,
    character: 'builder',
    content: 'I\'m Builder, your setup specialist! Let me show you our four tiers designed to grow with your community. Each tier unlocks more features to help you stand out and connect with families.',
    actionText: 'Explore the tiers',
    visualDemo: 'pricing-tiers',
    tip: 'Start with any tier - you can upgrade anytime as your needs grow!'
  },
  {
    id: 'free-tier-benefits',
    title: 'Free Tier: Get Started Today',
    description: 'See what you get at no cost to start building your presence',
    icon: Gift,
    character: 'compass',
    content: 'Here\'s the amazing part - you can start completely free! Your Verified Listing includes basic information, contact details, and appears in all searches. Perfect for testing the platform.',
    actionText: 'Learn about paid features',
    benefits: [
      'Free verified community listing',
      'Basic contact information display', 
      'Appears in all search results',
      'Mobile-responsive community page',
      'No setup fees or contracts'
    ]
  },
  {
    id: 'paid-tier-features',
    title: 'Unlock Premium Features',
    description: 'Discover how paid tiers help you stand out and attract families',
    icon: Zap,
    character: 'builder',
    content: 'Ready to supercharge your community\'s visibility? Paid tiers unlock powerful features that convert browsers into residents. Show live availability, manage pricing in real-time, and track every tour with our new Tour Track super review system!',
    actionText: 'See the difference',
    visualDemo: 'feature-showcase',
    benefits: [
      'Live availability updates - families see what\'s open NOW',
      'Real-time pricing - no more "call for pricing" frustration',
      'Tour Track™ - our exclusive tour review system',
      'In-app messaging - respond to families instantly',
      'Highlight specials and move-in incentives prominently'
    ]
  },
  {
    id: 'quick-setup',
    title: 'Super Simple Setup Process',
    description: 'Your community profile is just 5 minutes away',
    icon: Building2,
    character: 'compass',
    content: 'I\'ll walk you through each step of creating your profile. We\'ve designed this to be incredibly simple - just basic info, location, contact details, and you\'re live on the platform!',
    actionText: 'Start the setup',
    visualDemo: 'create-form',
    tip: 'You can always come back and add more details later'
  },
  {
    id: 'payment-made-easy',
    title: 'Secure, Instant Payments',
    description: 'Upgrading to paid tiers takes just 30 seconds',
    icon: CreditCard,
    character: 'sage',
    content: 'When you\'re ready to upgrade, our secure payment system handles everything instantly. Choose your tier, enter payment details, and your enhanced features activate immediately. No waiting, no paperwork.',
    actionText: 'See payment options',
    visualDemo: 'payment-flow',
    benefits: [
      'Instant feature activation',
      'Secure Stripe payment processing',
      'No contracts or hidden fees',
      'Cancel or change tiers anytime',
      'Mobile-optimized payment flow'
    ]
  },
  {
    id: 'success-ready',
    title: 'You\'re Ready for Success!',
    description: 'Join 34,000+ communities already connecting with families',
    icon: CheckCircle2,
    character: 'builder',
    content: 'That\'s it! You now know everything you need to create a successful community profile. Remember - families love transparency! Show your availability, pricing, and respond to reviews to build trust and fill beds faster.',
    actionText: 'Create my community',
    benefits: [
      'Families can see your real-time availability 24/7',
      'No more "call for pricing" - show rates with confidence',
      'Build trust with Tour Track™ reviews',
      'Convert inquiries faster with in-app messaging'
    ]
  }
];

interface CommunityCreatorTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (startWithTier?: string) => void;
}

export function CommunityCreatorTutorial({
  isOpen,
  onClose,
  onComplete
}: CommunityCreatorTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setCurrentStep(0);
    }
  }, [isOpen]);

  const currentStepData = tutorialSteps[currentStep];
  const currentCharacter = characters[currentStepData.character];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tutorialSteps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkipToCreation = (tier: string = 'verified') => {
    onComplete(tier);
  };

  const renderVisualDemo = () => {
    const { visualDemo } = currentStepData;
    
    if (visualDemo === 'pricing-tiers') {
      return (
        <div className="space-y-3 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Card className="border-2 border-green-200 bg-green-50 dark:bg-green-950">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">FREE</Badge>
                  <span className="text-lg font-bold text-green-600">$0/month</span>
                </div>
                <h4 className="font-semibold text-sm">Verified Listing</h4>
                <p className="text-xs text-gray-600 dark:text-gray-300">Basic presence, perfect for testing</p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-blue-200 bg-blue-50 dark:bg-blue-950">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="default">POPULAR</Badge>
                  <span className="text-lg font-bold text-blue-600">$149/month</span>
                </div>
                <h4 className="font-semibold text-sm">Standard</h4>
                <p className="text-xs text-gray-600 dark:text-gray-300">Photos, amenities, priority placement</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Card className="border-2 border-purple-200 bg-purple-50 dark:bg-purple-950">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">FEATURED</Badge>
                  <span className="text-lg font-bold text-purple-600">$249/month</span>
                </div>
                <h4 className="font-semibold text-sm">Featured</h4>
                <p className="text-xs text-gray-600 dark:text-gray-300">Enhanced visibility, family messaging</p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-yellow-200 bg-yellow-50 dark:bg-yellow-950">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">PREMIUM</Badge>
                  <span className="text-lg font-bold text-yellow-600">$349/month</span>
                </div>
                <h4 className="font-semibold text-sm">Platinum</h4>
                <p className="text-xs text-gray-600 dark:text-gray-300">Enterprise RMS + CRM, revenue analytics, market intelligence</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleSkipToCreation('verified')}
              className="flex-1"
            >
              Start Free
            </Button>
            <Button 
              size="sm" 
              onClick={() => handleSkipToCreation('standard')}
              className="flex-1"
            >
              Choose Standard
            </Button>
          </div>
        </div>
      );
    }

    if (visualDemo === 'feature-showcase') {
      return (
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-2">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-xs font-medium">Live Availability</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-2">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-xs font-medium">Real-Time Pricing</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-2">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-xs font-medium">Tour Track™</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mb-2">
                <Gift className="w-6 h-6 text-yellow-600" />
              </div>
              <p className="text-xs font-medium">Specials & Incentives</p>
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 text-center">
            <p className="text-xs text-blue-800 dark:text-blue-200 font-medium">
              💡 Tour Track™ lets families review their tour experience, building trust before move-in!
            </p>
          </div>
        </div>
      );
    }

    if (visualDemo === 'create-form') {
      return (
        <div className="space-y-3 mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Community Name</label>
            <div className="h-8 bg-white dark:bg-gray-700 border rounded px-3 flex items-center">
              <span className="text-sm text-gray-500">Sunset Manor Senior Living</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">City</label>
              <div className="h-8 bg-white dark:bg-gray-700 border rounded px-3 flex items-center">
                <span className="text-sm text-gray-500">Phoenix</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">State</label>
              <div className="h-8 bg-white dark:bg-gray-700 border rounded px-3 flex items-center">
                <span className="text-sm text-gray-500">Arizona</span>
              </div>
            </div>
          </div>
          <div className="flex justify-center pt-2">
            <Badge variant="secondary" className="text-xs">
              Just 3 more fields to go!
            </Badge>
          </div>
        </div>
      );
    }

    if (visualDemo === 'payment-flow') {
      return (
        <div className="space-y-3 mt-4 p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="font-semibold text-sm">Secure Payment in 30 Seconds</h4>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Powered by Stripe • SSL Secured • No Contracts
            </p>
          </div>
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span>Instant activation</span>
            <span>•</span>
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span>Cancel anytime</span>
          </div>
        </div>
      );
    }

    return null;
  };

  if (!isVisible) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" style={{ zIndex: 9999 }}>
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{currentCharacter.emoji}</div>
              <div>
                <h2 className="text-lg font-semibold">{currentStepData.title}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {currentCharacter.name} - {currentCharacter.description}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="py-4">
          {/* Progress indicator */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex space-x-2">
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep 
                      ? 'bg-blue-600' 
                      : index < currentStep 
                        ? 'bg-green-500' 
                        : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
            <span className="ml-3 text-sm text-gray-500">
              {currentStep + 1} of {tutorialSteps.length}
            </span>
          </div>

          {/* Character message */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div className="text-xl flex-shrink-0">{currentCharacter.emoji}</div>
                <div className="flex-1">
                  <p className="text-sm leading-relaxed mb-3">
                    {currentStepData.content}
                  </p>
                  {currentStepData.tip && (
                    <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded p-3">
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-yellow-800 dark:text-yellow-200">
                          <strong>Pro Tip:</strong> {currentStepData.tip}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefits list */}
          {currentStepData.benefits && (
            <div className="mb-4">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Key Benefits
              </h4>
              <div className="space-y-2">
                {currentStepData.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Visual demo */}
          {renderVisualDemo()}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isFirstStep}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            <div className="flex gap-2">
              {!isLastStep && (
                <Button
                  variant="ghost"
                  onClick={() => onComplete()}
                  className="text-sm"
                >
                  Skip Tutorial
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="flex items-center gap-2"
              >
                {isLastStep ? (
                  <>
                    <Building2 className="w-4 h-4" />
                    {currentStepData.actionText}
                  </>
                ) : (
                  <>
                    {currentStepData.actionText}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
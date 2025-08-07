import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2,
  Sparkles,
  Users,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Target,
  PlayCircle,
  Gift
} from 'lucide-react';
import { CommunityCreatorTutorial } from '@/components/onboarding/CommunityCreatorTutorial';
import { CommunityCreatorOnboarding } from '@/components/onboarding/CommunityCreatorOnboarding';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface CommunityFormData {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  website?: string;
  description: string;
  careTypes: string[];
  amenities: string[];
  subscriptionTier: 'verified' | 'standard' | 'featured' | 'platinum';
}

export default function CommunityCreatorPortal() {
  const [showTutorial, setShowTutorial] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>('verified');
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Check if user has visited before
    const hasVisited = localStorage.getItem('community-creator-visited');
    if (!hasVisited) {
      setIsFirstVisit(true);
      localStorage.setItem('community-creator-visited', 'true');
    } else {
      setIsFirstVisit(false);
    }
  }, []);

  // Create community mutation
  const createCommunityMutation = useMutation({
    mutationFn: async (formData: CommunityFormData) => {
      // First create the community
      const response = await fetch('/api/communities/onboarding/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepId: 'complete',
          formData: {
            ...formData,
            subscriptionTier: formData.subscriptionTier,
            billingStatus: formData.subscriptionTier === 'verified' ? 'active' : 'pending'
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create community');
      }

      return response.json();
    },
    onSuccess: (data, formData) => {
      const communityId = data.communityId;
      
      if (formData.subscriptionTier === 'verified') {
        // Free tier - show success and redirect
        toast({
          title: "Community Created Successfully!",
          description: "Your free community listing is now live and searchable.",
          duration: 5000
        });
        
        // Redirect to community dashboard or management page
        setTimeout(() => {
          window.location.href = `/communities/${communityId}/dashboard`;
        }, 2000);
      } else {
        // Paid tier - redirect to payment
        handlePaymentRedirect(communityId, formData.subscriptionTier);
      }
    },
    onError: (error) => {
      console.error('Error creating community:', error);
      toast({
        title: "Creation Failed",
        description: "There was an error creating your community. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handlePaymentRedirect = (communityId: string, tier: string) => {
    // Store community info for post-payment redirect
    sessionStorage.setItem('pending-community', JSON.stringify({
      communityId,
      tier,
      timestamp: Date.now()
    }));

    // Redirect to mobile payment page
    window.location.href = `/community-mobile-payment?communityId=${communityId}&tier=${tier}`;
  };

  const handleTutorialComplete = (startWithTier?: string) => {
    setShowTutorial(false);
    if (startWithTier) {
      setSelectedTier(startWithTier);
    }
    setShowOnboarding(true);
  };

  const handleOnboardingComplete = (formData: CommunityFormData) => {
    setShowOnboarding(false);
    createCommunityMutation.mutate(formData);
  };

  const stats = [
    { label: 'Active Communities', value: '34,180', icon: Building2 },
    { label: 'Families Reached', value: '50,000+', icon: Users },
    { label: 'Average Response Time', value: '< 2 hours', icon: Target },
    { label: 'Success Rate', value: '94%', icon: CheckCircle2 }
  ];

  const features = [
    {
      title: 'Free Verified Listing',
      description: 'Get started with a basic community profile at no cost',
      icon: Gift,
      badge: 'FREE',
      badgeColor: 'bg-green-100 text-green-800'
    },
    {
      title: 'Enhanced Visibility',
      description: 'Stand out with photos, amenities, and priority placement',
      icon: Sparkles,
      badge: 'POPULAR',
      badgeColor: 'bg-blue-100 text-blue-800'
    },
    {
      title: 'Family Communication',
      description: 'Direct messaging and inquiry management tools',
      icon: Users,
      badge: 'PREMIUM',
      badgeColor: 'bg-purple-100 text-purple-800'
    },
    {
      title: 'Analytics & Insights',
      description: 'Track performance and optimize your community profile',
      icon: Target,
      badge: 'PRO',
      badgeColor: 'bg-yellow-100 text-yellow-800'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Building2 className="w-4 h-4" />
            Community Creator Portal
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Join MySeniorValet's
            <span className="block text-blue-600">Trusted Network</span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            Connect with families actively searching for senior living. 
            Create your community profile in minutes and start receiving inquiries today.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isFirstVisit && (
              <Button
                size="lg"
                onClick={() => setShowTutorial(true)}
                className="flex items-center gap-2 text-base px-8 py-6"
              >
                <PlayCircle className="w-5 h-5" />
                Watch Quick Tutorial
              </Button>
            )}
            
            <Button
              size="lg"
              variant={isFirstVisit ? "outline" : "default"}
              onClick={() => setShowOnboarding(true)}
              className="flex items-center gap-2 text-base px-8 py-6"
            >
              <Building2 className="w-5 h-5" />
              Create Community Now
            </Button>
          </div>
          
          {!isFirstVisit && (
            <Button
              variant="ghost"
              onClick={() => setShowTutorial(true)}
              className="mt-4 text-sm"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Review Tutorial
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-6">
                <stat.icon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Everything You Need to Succeed
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <Badge className={feature.badgeColor}>
                      {feature.badge}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Success Stories */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white mb-12">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">
              Join Successful Communities
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              "MySeniorValet helped us connect with 50+ families in our first month. 
              The platform is easy to use and the support team is fantastic."
            </p>
            <div className="flex items-center justify-center gap-2">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Sunrise Manor</div>
                <div className="text-blue-200 text-sm">Phoenix, AZ</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom CTA */}
        <Card className="text-center bg-gray-50 dark:bg-gray-900">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Join thousands of communities already connecting with families on MySeniorValet
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => setShowOnboarding(true)}
                disabled={createCommunityMutation.isPending}
                className="flex items-center gap-2"
              >
                <Building2 className="w-5 h-5" />
                {createCommunityMutation.isPending ? 'Creating...' : 'Create Community'}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setShowTutorial(true)}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Learn More
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tutorial Modal */}
      <CommunityCreatorTutorial
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        onComplete={handleTutorialComplete}
      />

      {/* Onboarding Modal */}
      <CommunityCreatorOnboarding
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
        initialTier={selectedTier}
      />
    </div>
  );
}